import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Lumen Spiral — Pandora Glow Plant",
  "description": "A bioluminescent alien specimen in the Avatar style: a dark teal spiral-crowned stalk with curling cyan-fringed fronds, hanging luminous seed pods and a glowing undergrowth bed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  soilDark: "#1c262c",
  soilMid: "#263238",
  rock: "#39464e",
  rockVein: "#49e6ff",
  bark: "#22362c",
  stalkGreen: "#2a7a5a",
  stalkPale: "#bfe8c8",
  foliageDeep: "#123a3e",
  foliageMid: "#1e6b5e",
  foliageLight: "#3fae8c",
  leafUnderside: "#c9efe4",
  frondFringe: "#3ff0d6",
  veinGlow: "#7dfcf0",
  moss: "#2f6b3a",
  mossGlow: "#5affc4",
  podShell: "#5a3f8f",
  podGlow: "#ffb8f2",
  magentaTip: "#e050ff",
  ink: "#0b1e24",
  stemBlue: "#3d8fb0",
};
const M = {
  soilTop: [0, 0.32, 0.08] as [number, number, number],
  stalkBase: [0, 0.3, 0.05] as [number, number, number],
  crownBase: [0, 1.9, 0.32] as [number, number, number],
  sideStalkRootL: [0.55, 0.22, 0.15] as [number, number, number],
  sideStalkRootR: [-0.55, 0.22, 0.15] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // groundBed
  (() => {
function buildGroundBed({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const flat = { flat: true } as const;
  const g = glowKit ?? glow;

  // soil height at (x,z): dome inside ellipse
  const domeH = (x: number, z: number) => {
    const d = Math.hypot(x / 1.05, z / 0.9);
    return d >= 1 ? 0 : 0.34 * Math.pow(1 - d * d, 0.7);
  };

  // base dome: stacked faceted lathe layers
  const base = b.lathe(
    [
      [0, 0.0], [0.96, 0.0], [0.93, 0.05], [0.8, 0.14], [0.6, 0.23], [0.35, 0.3], [0.12, 0.335], [0, 0.34],
    ],
    { at: [0, 0, 0.0], segments: 10, color: P.soilDark },
  );
  base.mesh.scale.set(1.1, 1, 0.95);

  // soil lumps
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * 0.9;
    const x = Math.cos(a) * r * 1.05;
    const z = Math.sin(a) * r * 0.9;
    const h = domeH(x, z);
    const s = 0.08 + R() * 0.12;
    const col = R() < 0.25 ? P.moss : h > 0.2 ? P.soilMid : P.soilDark;
    b.part(new THREE.IcosahedronGeometry(s, 0), col, {
      at: [x, h * 0.85, z],
      rotation: [R() * 90, R() * 90, R() * 90],
      scale: [1.2, 0.55, 1],
      ...flat,
    });
  }

  // central mound top, solid under stalks
  for (const m of [M.stalkBase, M.sideStalkRootL, M.sideStalkRootR]) {
    b.part(new THREE.CylinderGeometry(0.17, 0.24, 0.12, 8), P.soilMid, {
      at: [m[0], Math.max(0.12, m[1] - 0.14), m[2]],
      ...flat,
    });
    b.part(new THREE.CylinderGeometry(0.12, 0.17, 0.05, 8), P.moss, {
      at: [m[0], Math.max(0.17, m[1] - 0.06), m[2]],
      ...flat,
    });
  }

  // rocks with glowing veins
  const rocks: [number, number, number][] = [
    [-0.75, 0.35, 0.16], [0.8, 0.25, 0.14], [-0.35, 0.65, 0.13], [0.45, 0.6, 0.11], [0.15, -0.6, 0.15], [-0.85, -0.3, 0.12],
  ];
  rocks.forEach(([x, z, s], i) => {
    const h = domeH(x, z);
    const rot: [number, number, number] = [R() * 30, R() * 360, R() * 30];
    const rock = b.part(new THREE.DodecahedronGeometry(s, 0), P.rock, {
      at: [x, h + s * 0.45, z],
      rotation: rot,
      scale: [1, 0.8, 1.1],
      ...flat,
    });
    const surf = b.surface(rock);
    const cx = x, cy = h + s * 0.45, cz = z;
    for (let k = 0; k < 3; k++) {
      const hit = surf.around([cx, cy, cz]).at(k * 110 + i * 40, 25 + k * 12);
      if (!hit) continue;
      const v = b.stick(new THREE.BoxGeometry(0.012, s * 0.9, 0.008), P.rockVein, hit, { embed: 0.2, spin: R() * 60 });
      g(v, 1.4);
    }
    if (i < 3) {
      const hit = surf.around([cx, cy, cz]).at(180 + i * 50, 70);
      if (hit) g(b.stick(new THREE.OctahedronGeometry(0.02, 0), P.rockVein, hit), 1.6);
    }
  });

  // moss tufts
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.25 + R() * 0.65;
    const x = Math.cos(a) * r * 1.0;
    const z = Math.sin(a) * r * 0.85;
    if (Math.hypot(x - M.stalkBase[0], z - M.stalkBase[2]) < 0.2) continue;
    const h = domeH(x, z);
    for (let k = 0; k < 3; k++) {
      const ox = (R() - 0.5) * 0.07;
      const oz = (R() - 0.5) * 0.07;
      const ht = 0.05 + R() * 0.05;
      b.part(new THREE.ConeGeometry(0.025, ht, 5), P.moss, {
        at: [x + ox, h + ht / 2 - 0.005, z + oz],
        rotation: [(R() - 0.5) * 30, 0, (R() - 0.5) * 30],
        ...flat,
      });
      g(
        b.part(new THREE.OctahedronGeometry(0.01, 0), P.mossGlow, { at: [x + ox, h + ht, z + oz] }),
        1.5,
      );
    }
  }

  // undergrowth stalks with glowing bulbs
  const bulbCols = [P.frondFringe, P.podGlow, P.magentaTip];
  const spots: [number, number][] = [
    [-0.55, 0.55], [0.6, 0.5], [-0.9, 0.05], [0.95, -0.05], [-0.4, -0.45], [0.4, -0.5],
    [0.05, 0.75], [-0.65, -0.65], [0.7, -0.6], [-0.2, 0.4], [0.3, 0.38], [0.05, -0.2],
  ];
  spots.forEach(([x, z], i) => {
    const h = domeH(x, z);
    const ht = 0.12 + R() * 0.16;
    const lean = (R() - 0.5) * 0.08;
    const top: [number, number, number] = [x + lean, h + ht, z + lean * 0.5];
    b.rod([x, h - 0.02, z], top, [0.014, 0.007], P.bark, { sides: 5 });
    const col = bulbCols[i % 3];
    const bulb = b.part(new THREE.SphereGeometry(0.03 + R() * 0.012, 6, 5), col, {
      at: [top[0], top[1] + 0.03, top[2]],
      scale: [1, 1.25, 1],
      ...flat,
    });
    g(bulb, 1.6);
    g(b.part(new THREE.ConeGeometry(0.013, 0.035, 5), col, { at: [top[0], top[1] + 0.075, top[2]], ...flat }), 1.8);
  });
}
    return buildGroundBed;
  })(),
  // mainStalk
  (() => {
function buildMainStalk({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const base = J.stalkBase, mid = J.stalkMid, crown = J.stalkCrown ?? J.crown;

  // centreline through the three joints
  const path = catmull([
    [0, 0.3, 0.05],
    [0, 0.68, 0.12],
    [0, 1.05, 0.2],
    [0, 1.5, 0.27],
    [0, 1.9, 0.32],
  ]);

  const radius = (t: number) => {
    const taper = 0.11 + (0.05 - 0.11) * t;
    const flare = t < 0.12 ? 0.04 * (1 - t / 0.12) : 0;
    return taper + flare;
  };

  const tube = b.sweep(path, radius, {
    bone: [base, mid, crown],
    color: P.stalkGreen,
    sides: 8,
    caps: "flat",
    sectors: [[110, 250, P.stalkPale]],
  });

  // pale band rings
  const bandTs = [0.16, 0.36, 0.56, 0.78];
  for (const t of bandTs) {
    const c = tube.at(t, 0);
    const r = radius(t) + 0.012;
    const center = path.at(t);
    const tan = path.tangentAt(t);
    const ringPath = b.ring(frame(center, tan), { count: 10, radius: r });
    b.sweep(catmull(ringPath.items, { closed: true }), 0.014, {
      color: P.stalkPale,
      sides: 5,
      bone: t < 0.5 ? base : mid,
    });
    void c;
  }

  // helical glowing vein studs, two turns, between bands
  const N = 22;
  for (let i = 0; i < N; i++) {
    const t = 0.1 + (0.8 * i) / (N - 1);
    const ang = (i / (N - 1)) * 720;
    const hit = tube.at(t, ang);
    const stud = b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.veinGlow, hit, { embed: 0.35 });
    glow(stud, 1.4);
  }

  // three vertical seam ridges
  for (const a of [60, 180, 300]) {
    const line = tube.line(a, 0.004);
    b.sweep(line.slice(0.02, 0.98), [0.011, 0.007], {
      color: P.bark,
      sides: 4,
      caps: "flat",
      bone: [base, mid, crown],
    });
  }

  // small glowing nodes at ridge starts near base flare for character
  for (let i = 0; i < 5; i++) {
    const hit = tube.at(0.03 + R() * 0.04, R() * 360);
    glow(b.stick(new THREE.ConeGeometry(0.012, 0.03, 5), P.mossGlow, hit, { embed: 0.2 }), 1.2);
  }
}
    return buildMainStalk;
  })(),
  // crownFronds
  (() => {
function buildCrownFronds({ b, J, P, M }: Ctx) {
  const base = new THREE.Vector3(M.crownBase[0], M.crownBase[1] + 0.03, M.crownBase[2]);

  // Crown bud: a faceted knob where the fronds meet, with a glowing core.
  b.part(new THREE.IcosahedronGeometry(0.075, 0), P.foliageMid, {
    bone: J.crown,
    at: [base.x, base.y + 0.04, base.z],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.07, 0.055, 0.05, 8), P.stalkPale, {
    bone: J.crown,
    at: [base.x, base.y - 0.02, base.z],
  });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.035, 0), P.veinGlow, {
      bone: J.crown,
      at: [base.x, base.y + 0.1, base.z],
      flat: true,
    }),
    1.4,
  );

  // Azimuth in degrees (0 = +Z), height of the arc H, reach R, bone.
  const fronds = [
    { a: 59, H: 0.3, R: 0.7, bone: J.frondL },
    { a: -59, H: 0.33, R: 0.7, bone: J.frondR },
    { a: 14, H: 0.24, R: 0.42, bone: J.crown },
    { a: -32, H: 0.36, R: 0.5, bone: J.crown },
    { a: 105, H: 0.42, R: 0.8, bone: J.crown },
    { a: -105, H: 0.38, R: 0.82, bone: J.crown },
    { a: 150, H: 0.47, R: 0.72, bone: J.crown },
    { a: -150, H: 0.43, R: 0.68, bone: J.crown },
    { a: 182, H: 0.36, R: 0.62, bone: J.crown },
  ];
  // radial/height profile: rises, arcs out, then curls under at the tip
  const profile: [number, number][] = [
    [0, 0],
    [0.22, 0.5],
    [0.55, 0.92],
    [0.86, 1.0],
    [1.08, 0.74],
    [1.08, 0.42],
    [0.92, 0.3],
    [0.8, 0.36],
  ];

  fronds.forEach((f, i) => {
    const az = (f.a * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
    const pts = profile.map(([r, h]) =>
      base.clone().addScaledVector(d, r * f.R).add(new THREE.Vector3(0, h * f.H, 0)),
    );
    const path = catmull(pts);
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(d, -1).normalize();
    const blade = b.sweep(path, (t: number) => [0.03 + 0.1 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.8) * (1 - 0.3 * t), 0.011], {
      bone: f.bone,
      color: P.leafUnderside,
      sectors: [[-88, 88, i % 3 === 2 ? P.foliageMid : P.foliageDeep]],
      up,
      sides: 8,
      caps: "round",
      name: `crownFrondsBlade${i}`,
    });

    // bold ink midrib on the upper face
    b.sweep(blade.line(0, 0.006), 0.0075, { bone: f.bone, color: P.ink, caps: "round", name: `crownFrondsRib${i}` });

    // short foliageLight veins branching off the midrib
    [0.26, 0.46, 0.66].forEach((t) => {
      for (const s of [1, -1]) {
        const a = blade.at(t, 0);
        const e = blade.at(Math.min(0.95, t + 0.07), s * 80);
        b.rod(offset(a.at, a.n, 0.008), offset(e.at, e.n, 0.004), 0.005, P.foliageLight, { bone: f.bone });
      }
    });

    // glowing fringe studs along both edges (merged per colour per frond)
    const cyan: THREE.BufferGeometry[] = [];
    const mag: THREE.BufferGeometry[] = [];
    const N = 9;
    for (let k = 0; k < N; k++) {
      const t = 0.16 + (0.8 * k) / (N - 1);
      for (const s of [1, -1]) {
        const h = blade.at(t, s * 90);
        const p = offset(h.at, h.n, 0.006);
        const isMag = (k + (s > 0 ? 0 : 2)) % 4 === 3;
        const g = new THREE.IcosahedronGeometry(isMag ? 0.015 : 0.012, 0).translate(p.x, p.y, p.z);
        (isMag ? mag : cyan).push(g);
      }
    }
    // tip bulb
    const tip = path.at(1);
    mag.push(new THREE.IcosahedronGeometry(0.022, 0).translate(tip.x, tip.y, tip.z));
    const mc = mergeGeometries(cyan);
    const mm = mergeGeometries(mag);
    if (mc) glow(b.part(mc, P.frondFringe, { bone: f.bone, at: [0, 0, 0], flat: true }), 1.3);
    if (mm) glow(b.part(mm, P.magentaTip, { bone: f.bone, at: [0, 0, 0], flat: true }), 1.5);
  });
}
    return buildCrownFronds;
  })(),
  // glowPods
  (() => {
function buildGlowPods({ b, J, P, M }: any) {
  const R = rng(11);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const glowSphere = (r: number, color: string, at: number[], bone: any, str = 1.4) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, flat: true }), str);

  // Teardrop pod: shell cap + glowing body + tip stud
  const pod = (top: THREE.Vector3, bone: any, scale: number) => {
    const shell = b.lathe(
      [[0, 0], [0.05 * scale, 0], [0.07 * scale, 0.04 * scale], [0.045 * scale, 0.09 * scale], [0, 0.1 * scale]],
      { at: top, axis: [0, 1, 0], segments: 7, bone, color: P.podShell },
    );
    // glowing lower body hangs below the cap
    const body = b.lathe(
      [[0, 0], [0.06 * scale, 0.04 * scale], [0.075 * scale, 0.12 * scale], [0.05 * scale, 0.21 * scale], [0, 0.26 * scale]],
      { at: top.clone().add(new THREE.Vector3(0, -0.26 * scale, 0)), axis: [0, 1, 0], segments: 7, bone, color: P.podGlow },
    );
    glow(body, 1.5);
    const tipAt = top.clone().add(new THREE.Vector3(0, -0.3 * scale, 0));
    glowSphere(0.02 * scale, P.magentaTip, [tipAt.x, tipAt.y, tipAt.z], bone, 1.8);
    // ribs on shell
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = top.clone().add(new THREE.Vector3(Math.cos(a) * 0.055 * scale, 0.04 * scale, Math.sin(a) * 0.055 * scale));
      b.part(new THREE.BoxGeometry(0.008 * scale, 0.05 * scale, 0.008 * scale), P.ink, { bone, at: [p.x, p.y, p.z] });
    }
  };

  const sides = [
    { s: 1, joint: J.tendrilFL, ids: [0, 1] },
    { s: -1, joint: J.tendrilFR, ids: [0, 1] },
  ];

  for (const side of sides) {
    const s = side.s;
    for (const k of side.ids) {
      const root = V(side.joint.at).add(new THREE.Vector3(s * 0.03 * k, 0.0, 0.06 * (k ? -1 : 1)));
      const len = k ? 1.1 : 0.85;
      const out = 0.28 + k * 0.2;
      const fz = k ? -0.1 : 0.12;
      const pts = [
        root.toArray(),
        [root.x + s * out * 0.7, root.y - 0.1, root.z + fz * 0.3],
        [root.x + s * out, root.y - len * 0.55, root.z + fz * 0.7],
        [root.x + s * (out * 0.9), root.y - len, root.z + fz],
      ];
      const tail = V(pts[3]);
      const curve = new THREE.CatmullRomCurve3(pts.map(V));
      // tendril rods in segments
      const N = 6;
      let prev = curve.getPoint(0);
      for (let i = 1; i <= N; i++) {
        const q = curve.getPoint(i / N);
        b.rod(prev, q, [0.014 * (1 - (i - 1) / N) + 0.006, 0.014 * (1 - i / N) + 0.006], P.stemBlue, { bone: side.joint, caps: "round" });
        prev = q;
      }
      // small filament orbs
      const n = 2 + (R() > 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const t = 0.3 + (0.5 * (i + 0.5)) / n;
        const c = curve.getPoint(t);
        const off = new THREE.Vector3(s * 0.07, -0.02, 0.05 * (i % 2 ? 1 : -1));
        const o = c.clone().add(off);
        b.rod(c, o, 0.004, P.veinGlow, { bone: side.joint });
        glowSphere(0.032 + 0.008 * R(), i % 2 ? P.podGlow : P.frondFringe, o.toArray(), side.joint, 1.5);
      }
      // main pod at the end
      pod(tail.clone().add(new THREE.Vector3(0, -0.04, 0)).add(new THREE.Vector3(0, 0.3 * 1.0, 0)).setY(tail.y), side.joint, 1.0 + 0.2 * k);
      b.rod(tail, tail.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.01, P.stemBlue, { bone: side.joint });
    }
  }

  // Orb clusters on the stalk mid-section
  const skin = b.surface(b.root);
  const clusters = [
    { y: 1.0, az: 70, cols: [P.frondFringe, P.podGlow, P.rockVein] },
    { y: 1.2, az: -80, cols: [P.podGlow, P.frondFringe, P.rockVein, P.magentaTip] },
    { y: 0.85, az: 160, cols: [P.rockVein, P.frondFringe, P.podGlow] },
  ];
  for (const c of clusters) {
    const a = (c.az * Math.PI) / 180;
    const cy = c.y;
    const cz = 0.05 + (cy - 0.3) * 0.15; // approximate stalk axis z
    const r = 0.075 - (cy - 0.3) * 0.02;
    const base = new THREE.Vector3(Math.sin(a) * r, cy, cz + Math.cos(a) * r);
    const dir = new THREE.Vector3(Math.sin(a), 0.25, Math.cos(a)).normalize();
    const tip = base.clone().addScaledVector(dir, 0.12);
    b.rod(base.clone().addScaledVector(dir, -0.02), tip, [0.012, 0.008], P.bark, { bone: J.stalkMid });
    const sizes = [0.055, 0.04, 0.032, 0.026];
    c.cols.forEach((col: string, i: number) => {
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar((i % 2 ? 1 : -1) * 0.03 * (i > 0 ? 1 : 0));
      const p = tip.clone().addScaledVector(dir, 0.03 * i).add(side).add(new THREE.Vector3(0, 0.03 * (i > 1 ? 1 : -0.3), 0));
      glowSphere(sizes[i], col, p.toArray(), J.stalkMid, 1.5);
    });
  }
}
    return buildGlowPods;
  })(),
  // sideStalks
  (() => {
function buildSideStalks({ b, J, P, M }: any) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const joint = J["sideStalk" + side];
    const root = M["sideStalkRoot" + side] as number[];
    const pts = [
      [root[0], root[1] - 0.06, root[2]],
      [s * 0.62, 0.55, 0.15],
      [s * 0.78, 0.95, 0.12],
      [s * 0.86, 1.18, 0.1],
    ];
    const path = catmull(pts);
    const chain = b.chain("sideStalks" + side, path, {
      parent: joint,
      count: 3,
      role: "spine",
    });
    const tube = b.sweep(chain, [0.055, 0.02], {
      color: P.bark,
      caps: "round",
      sides: 8,
      bone: chain,
    });
    // base flare
    b.part(new THREE.CylinderGeometry(0.05, 0.1, 0.1, 8), P.bark, {
      at: [root[0], root[1] - 0.02, root[2]],
      bone: joint,
    });
    // spiral vein studs
    const n = 10;
    for (let i = 0; i < n; i++) {
      const t = 0.1 + (0.8 * i) / (n - 1);
      const ang = i * 100;
      const pt = tube.at(t, ang);
      glow(
        b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.stemBlue, pt, { embed: 0.3 }),
        1.3,
      );
    }
    // pale bands
    for (const t of [0.82, 0.9]) {
      const c = tube.at(t, 0);
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), P.stalkPale, {
        at: c.moved ? path.at(t) : path.at(t),
        dir: path.tangentAt(t),
        bone: chain.joints[chain.joints.length - 1],
      });
    }
    const tip = path.at(1);
    const tipBone = chain.joints[chain.joints.length - 1];
    // crown hub
    b.part(new THREE.SphereGeometry(0.035, 6, 5), P.bark, { at: tip, bone: tipBone });
    // leaves
    const count = 6;
    for (let i = 0; i < count; i++) {
      const az = (i / count) * Math.PI * 2 + (s > 0 ? 0 : 0.5);
      const lean = 0.5 + 0.25 * R();
      const len = 0.3 + 0.08 * R();
      const dx = Math.cos(az) * Math.sin(lean);
      const dz = Math.sin(az) * Math.sin(lean);
      const dy = Math.cos(lean);
      const dir: [number, number, number] = [dx, dy, dz];
      // blade lying in plane containing dir and horizontal perpendicular
      const w = 0.045;
      const outline: any = [
        [0, 0],
        [w, len * 0.3],
        [w * 0.8, len * 0.65],
        [0, len, "sharp"],
        [-w * 0.8, len * 0.65],
        [-w, len * 0.3],
      ];
      const xdir: [number, number, number] = [-Math.sin(az), 0, Math.cos(az)];
      // y axis of outline along dir
      const leaf = b.extrude(outline, {
        at: tip,
        x: xdir,
        y: dir,
        thickness: 0.008,
        color: i % 2 ? P.foliageMid : P.stemBlue,
        bone: tipBone,
      });
      // midrib
      b.rod(
        offset(tip, dir, 0.02),
        offset(tip, dir, len * 0.95),
        0.004,
        P.ink,
        { bone: tipBone },
      );
      // glow rim at edges
      for (const e of [1, -1]) {
        for (const f of [0.3, 0.65]) {
          const wf = f === 0.3 ? w : w * 0.8;
          const base = offset(tip, dir, len * f);
          const p = offset(base, xdir, e * wf);
          glow(
            b.part(new THREE.SphereGeometry(0.01, 5, 4), P.magentaTip, { at: p, bone: tipBone }),
            1.4,
          );
        }
      }
      const endp = offset(tip, dir, len);
      glow(
        b.part(new THREE.ConeGeometry(0.012, 0.04, 5), P.magentaTip, {
          at: endp,
          dir,
          bone: tipBone,
        }),
        1.5,
      );
    }
    // inner shorter leaf with bulb
    const idir: [number, number, number] = [-s * 0.1, 1, 0.1];
    b.rod(tip, offset(tip, idir, 0.2), 0.008, P.foliageMid, { bone: tipBone });
    glow(
      b.part(new THREE.SphereGeometry(0.03, 7, 5), P.veinGlow, {
        at: offset(tip, idir, 0.23),
        bone: tipBone,
      }),
      1.6,
    );
  }
}
    return buildSideStalks;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bioluminescentAlienPlant" });
  const J: Record<string, Joint> = {};
  J["stalkBase"] = b.joint("stalkBase", { at: [0,0.3,0.05], dir: [0,1,0.12], role: "spine" });
  J["stalkMid"] = b.joint("stalkMid", { parent: J["stalkBase"], at: [0,1.05,0.2], dir: [0,1,0.3], role: "spine" });
  J["crown"] = b.joint("crown", { parent: J["stalkMid"], at: [0,1.9,0.32], dir: [0,1,0.25], role: "spine" });
  J["frondL"] = b.joint("frondL", { parent: J["crown"], at: [0.08,2.05,0.36], dir: [1,0.55,0.6], role: "fan", group: "fronds" });
  J["frondR"] = b.joint("frondR", { parent: J["crown"], at: [-0.08,2.05,0.36], dir: [-1,0.55,0.6], role: "fan", group: "fronds" });
  J["tendrilFL"] = b.joint("tendrilFL", { parent: J["crown"], at: [0.22,1.98,0.22], dir: [0.85,-0.5,0.2], role: "tentacle", group: "tendrils" });
  J["tendrilFR"] = b.joint("tendrilFR", { parent: J["crown"], at: [-0.22,1.98,0.22], dir: [-0.85,-0.5,0.2], role: "tentacle", group: "tendrils" });
  J["sideStalkL"] = b.joint("sideStalkL", { parent: J["stalkBase"], at: [0.55,0.22,0.15], dir: [1,0.8,0.2], role: "spine", group: "sides" });
  J["sideStalkR"] = b.joint("sideStalkR", { parent: J["stalkBase"], at: [-0.55,0.22,0.15], dir: [-1,0.8,0.2], role: "spine", group: "sides" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
