import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  noise,
  mottle,
  grain,
  scales,
  catmull,
  bezier,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Lighthouse Cove Diorama",
  description:
    "A cozy display diorama: a red-and-white striped lighthouse with a glowing lantern room and black iron gallery, a keeper's cottage with a crooked chimney and blue door, a wooden jetty with a tied rowboat, seagulls, grass and wildflowers on a rocky island, ringed by turquoise water and foam on a round wooden base.",
};

// ---------- palette ----------
const WOOD = "#7a4a2b";
const WOOD2 = "#5e3720";
const BRASS = "#c9a24a";
const DEEP = "#1f7f8c";
const DEEP_TOP = "#2a9fa6";
const SHALLOW = "#3fc3bb";
const LAGOON = "#7fe0cf";
const FOAM = "#f4fbf8";
const SURF = "#bff0e6";
const ROCK = "#7c7f86";
const ROCK_DARK = "#5a5d66";
const GRASS = "#6fae45";
const GRASS2 = "#4f8f36";
const RED = "#d23a2e";
const WHITE = "#f6f1e6";
const IRON = "#22252b";
const GLOW = "#ffe08a";
const CREAM = "#f1e2c2";
const CREAM2 = "#e6d2ab";
const ROOF = "#5b6b84";
const ROOF_EDGE = "#3c4659";
const BRICK = "#a5492f";
const MORTAR = "#d9c7a8";
const BLUE = "#2f6fc0";
const STONE = "#9a978f";
const HULL = "#d65a31";
const PLANK = "#a8743f";
const PLANK2 = "#8c5b2e";
const ROPE = "#cdb27a";
const GULL_GREY = "#aeb7c2";
const GULL_BLACK = "#24262b";
const BEAK = "#f2b632";
const LEG = "#e98a3a";
const SMOKE = "#ebe7e1";
const GREEN_DOOR = "#2d5a3d";

type V3 = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function mkRand(seed: number): () => number {
  const r: any = rng(seed);
  if (typeof r === "function") return () => r();
  if (r && typeof r.next === "function") return () => r.next();
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circlePts(cx: number, y: number, cz: number, rx: number, rz: number, n: number): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.sin(a) * rx, y, cz + Math.cos(a) * rz]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "lighthouse_diorama" });
  b.joint("root", { at: [0, 0, 0] });
  const R = mkRand(17);

  const glow = (part: any) => {
    const m = part && part.mesh ? (part.mesh as THREE.Mesh).material : null;
    if (m && (m as any).isMeshStandardMaterial) {
      const sm = m as THREE.MeshStandardMaterial;
      sm.emissive = new THREE.Color("#ffb53a");
      sm.emissiveIntensity = 0.85;
    }
  };

  // ---------- display base ----------
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.014],
      [0.348, 0.022],
      [0.348, 0.062],
      [0.34, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 36, color: grain(WOOD, WOOD2, { size: 0.012, axis: "x" }), name: "base" },
  );
  b.sweep(catmull(circlePts(0, 0.0725, 0, 0.339, 0.339, 24), { closed: true }), 0.004, {
    color: BRASS,
    sides: 6,
    name: "baseRim",
  });
  const plaqueTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60">
      <rect x="2" y="2" width="276" height="56" rx="8" fill="#d4ad55" stroke="#7d5c1c" stroke-width="5"/>
      <rect x="12" y="11" width="256" height="38" rx="4" fill="none" stroke="#9c7a30" stroke-width="2"/>
      <text x="140" y="39" font-family="Georgia, serif" font-size="25" font-weight="bold" fill="#3f2a0b" text-anchor="middle" letter-spacing="2">LIGHTHOUSE COVE</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.BoxGeometry(0.14, 0.03, 0.004), "#ffffff", {
    at: [0, 0.042, 0.3495],
    texture: plaqueTex,
    name: "plaque",
  });

  // ---------- water ----------
  const water = paint((p) => {
    if (p.y < 0.079) return DEEP;
    const r = Math.hypot(p.x, p.z);
    const w = (noise(p, 0.04, 5) - 0.5) * 0.04;
    const d = r + w;
    if (d < 0.247) return FOAM;
    if (d < 0.262) return LAGOON;
    const rip = Math.sin(d * 150 + noise(p, 0.07, 9) * 5);
    if (rip > 0.9 && d < 0.315) return SURF;
    return d < 0.29 ? SHALLOW : DEEP_TOP;
  });
  b.lathe(
    [
      [0, 0.068],
      [0.332, 0.068],
      [0.332, 0.082],
      [0, 0.082],
    ],
    { at: [0, 0, 0], segments: 36, color: water, name: "water" },
  );

  // ---------- island ----------
  const grassPaint = mottle(GRASS, GRASS2, { size: 0.025, seed: 2 });
  const rockPaint = mottle(ROCK, ROCK_DARK, { size: 0.02, seed: 4 });
  const islandPaint = paint((p, n) => {
    const g = noise(p, 0.03, 11);
    if (n.y > 0.55 && p.y > 0.126 + g * 0.016) return grassPaint;
    return rockPaint;
  });
  const island = b.lathe(
    [
      [0, 0.07],
      [0.235, 0.07],
      [0.228, 0.088],
      [0.205, 0.108],
      [0.175, 0.135],
      [0.15, 0.148],
      [0.08, 0.152],
      [0, 0.153],
    ],
    { at: [0, 0, 0], segments: 13, color: islandPaint, name: "island" },
  );
  const isl = b.surface(island);
  const groundY = (x: number, z: number) => {
    const h = isl.ray([x, 1, z], [0, -1, 0]);
    return h ? h.at.y : 0.08;
  };

  // shoreline rocks + foam
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.2;
    const deg = ((a * 180) / Math.PI) % 360;
    // a measured from +X toward +Z; skip jetty/boat sector
    const x = Math.cos(a),
      z = Math.sin(a);
    const angXZ = (Math.atan2(z, x) * 180) / Math.PI;
    if (angXZ > 42 && angXZ < 88) continue;
    void deg;
    const rr = 0.215 + R() * 0.03;
    const s = 0.017 + R() * 0.02;
    b.part(new THREE.DodecahedronGeometry(s, 0), rockPaint, {
      at: [x * rr, 0.079 + R() * 0.012, z * rr],
      rotation: [R() * 360, R() * 360, R() * 360],
      scale: [1.1, 0.65 + R() * 0.4, 1.0],
      flat: true,
      group: "rocks",
    });
    b.part(new THREE.IcosahedronGeometry(s * 1.5, 0), FOAM, {
      at: [x * (rr + 0.006), 0.081, z * (rr + 0.006)],
      rotation: [0, R() * 360, 0],
      scale: [1, 0.12, 1],
      flat: true,
      group: "foam",
    });
  }
  // rocks out in the water
  const lone: V3[] = [
    [-0.27, 0.082, 0.06],
    [-0.15, 0.082, -0.25],
    [0.25, 0.082, -0.12],
  ];
  for (const p of lone) {
    const s = 0.016 + R() * 0.01;
    b.part(new THREE.DodecahedronGeometry(s, 0), rockPaint, {
      at: [p[0], p[1], p[2]],
      rotation: [R() * 360, R() * 360, R() * 360],
      scale: [1.2, 0.8, 1],
      flat: true,
      group: "rocks",
    });
    b.part(new THREE.IcosahedronGeometry(s * 1.7, 0), FOAM, {
      at: [p[0], 0.0815, p[2]],
      scale: [1, 0.1, 1],
      flat: true,
      group: "foam",
    });
  }
  // rocks on the slopes
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.4 + R() * 0.3;
    const x = Math.cos(a),
      z = Math.sin(a);
    const angXZ = (Math.atan2(z, x) * 180) / Math.PI;
    if (angXZ > 40 && angXZ < 90) continue;
    const rr = 0.165 + R() * 0.03;
    const s = 0.014 + R() * 0.012;
    b.part(new THREE.DodecahedronGeometry(s, 0), rockPaint, {
      at: [x * rr, groundY(x * rr, z * rr), z * rr],
      rotation: [R() * 360, R() * 360, R() * 360],
      scale: [1.2, 0.7, 1],
      flat: true,
      group: "rocks",
    });
  }

  // ---------- lighthouse ----------
  const TX = -0.06,
    TZ = -0.05,
    TB = 0.146;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.022],
      [0.064, 0.03],
      [0, 0.03],
    ],
    { at: [TX, TB, TZ], segments: 8, color: mottle(STONE, "#7e7b74", { size: 0.012, seed: 8 }), name: "towerPlinth" },
  );
  const ty0 = TB + 0.03;
  const H = 0.33,
    R0 = 0.056,
    R1 = 0.04;
  const stripePaint = paint((_p, _n, s) => (Math.floor(s[0] / 0.055) % 2 === 0 ? RED : WHITE));
  b.lathe(
    [
      [0, 0],
      [R0, 0],
      [R1, H],
      [0, H],
    ],
    { at: [TX, ty0, TZ], segments: 14, color: stripePaint, name: "tower" },
  );
  const towerAt = (h: number, angDeg: number, out = 0) => {
    const a = (angDeg * Math.PI) / 180;
    const r = (R0 + ((R1 - R0) * h) / H) * 0.975 + out;
    return {
      p: V(TX + Math.sin(a) * r, ty0 + h, TZ + Math.cos(a) * r),
      n: V(Math.sin(a), 0, Math.cos(a)),
      t: V(Math.cos(a), 0, -Math.sin(a)),
    };
  };
  // windows
  for (const [h, ang] of [
    [0.1, 35],
    [0.185, -25],
    [0.265, 50],
  ] as [number, number][]) {
    const w = towerAt(h, ang);
    b.part(new THREE.BoxGeometry(0.017, 0.026, 0.008), IRON, { at: w.p, dir: w.n, axis: "z", group: "tower" });
    const g = b.part(new THREE.BoxGeometry(0.011, 0.019, 0.006), GLOW, {
      at: w.p.clone().addScaledVector(w.n, 0.0025),
      dir: w.n,
      axis: "z",
      group: "tower",
    });
    glow(g);
    b.part(new THREE.BoxGeometry(0.022, 0.004, 0.01), WHITE, {
      at: w.p.clone().addScaledVector(w.n, 0.002).add(V(0, -0.015, 0)),
      dir: w.n,
      axis: "z",
      group: "tower",
    });
  }
  // door
  {
    const d = towerAt(0, 20);
    b.extrude(
      [
        [-0.012, 0],
        [0.012, 0],
        [0.012, 0.026],
        [0.0085, 0.035],
        [0, 0.039],
        [-0.0085, 0.035],
        [-0.012, 0.026],
      ],
      { at: d.p.clone().add(V(0, 0.001, 0)), x: d.t, y: [0, 1, 0], thickness: 0.008, bevel: 0.001, color: GREEN_DOOR, name: "towerDoor" },
    );
    b.part(new THREE.SphereGeometry(0.0018, 6, 4), BRASS, {
      at: d.p.clone().addScaledVector(d.n, 0.0045).addScaledVector(d.t, 0.007).add(V(0, 0.018, 0)),
    });
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.016), STONE, {
      at: d.p.clone().addScaledVector(d.n, 0.006).add(V(0, -0.028, 0)),
      dir: d.n,
      axis: "z",
      flat: true,
    });
  }
  // gallery
  const top = ty0 + H;
  b.lathe(
    [
      [0, 0],
      [0.041, 0],
      [0.066, 0.014],
      [0.066, 0.02],
      [0, 0.02],
    ],
    { at: [TX, top - 0.012, TZ], segments: 14, color: IRON, name: "gallery" },
  );
  const deckY = top + 0.008;
  const railR = 0.062;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.rod(
      [TX + Math.sin(a) * railR, deckY, TZ + Math.cos(a) * railR],
      [TX + Math.sin(a) * railR, deckY + 0.032, TZ + Math.cos(a) * railR],
      0.0016,
      { color: IRON, sides: 4, group: "railing" },
    );
  }
  b.sweep(catmull(circlePts(TX, deckY + 0.032, TZ, railR, railR, 16), { closed: true }), 0.0024, {
    color: IRON,
    sides: 5,
    group: "railing",
  });
  b.sweep(catmull(circlePts(TX, deckY + 0.017, TZ, railR, railR, 16), { closed: true }), 0.0014, {
    color: IRON,
    sides: 4,
    group: "railing",
  });
  // lantern room
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.042, 0.012],
      [0, 0.012],
    ],
    { at: [TX, deckY, TZ], segments: 8, color: RED, name: "lanternDrum" },
  );
  const glass = b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), GLOW, {
    at: [TX, deckY + 0.037, TZ],
    flat: true,
    name: "lanternGlass",
  });
  glow(glass);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.rod(
      [TX + Math.sin(a) * 0.0355, deckY + 0.012, TZ + Math.cos(a) * 0.0355],
      [TX + Math.sin(a) * 0.0355, deckY + 0.062, TZ + Math.cos(a) * 0.0355],
      0.0022,
      { color: IRON, sides: 4, group: "lantern" },
    );
  }
  b.sweep(catmull(circlePts(TX, deckY + 0.037, TZ, 0.0362, 0.0362, 8), { closed: true }), 0.0012, {
    color: IRON,
    sides: 4,
    group: "lantern",
  });
  b.lathe(
    [
      [0, 0],
      [0.047, 0],
      [0.047, 0.005],
      [0, 0.005],
    ],
    { at: [TX, deckY + 0.062, TZ], segments: 8, color: IRON, name: "lanternRing" },
  );
  b.lathe(
    [
      [0, 0],
      [0.046, 0],
      [0.03, 0.013],
      [0.009, 0.033],
      [0, 0.036],
    ],
    { at: [TX, deckY + 0.067, TZ], segments: 8, color: RED, name: "lanternRoof" },
  );
  const ballY = deckY + 0.067 + 0.039;
  b.part(new THREE.SphereGeometry(0.0065, 8, 5), IRON, { at: [TX, ballY, TZ], flat: true });
  b.spike([TX, ballY + 0.004, TZ], [0, 1, 0], 0.022, 0.0022, { color: IRON });

  // ---------- keeper's cottage ----------
  const CX = 0.075,
    CZ = 0;
  const wallPaint = mottle(CREAM, CREAM2, { size: 0.02, seed: 3 });
  b.part(new THREE.BoxGeometry(0.116, 0.014, 0.086), mottle(STONE, "#7e7b74", { size: 0.01, seed: 6 }), {
    at: [CX, 0.153, CZ],
    flat: true,
    name: "foundation",
  });
  b.part(new THREE.BoxGeometry(0.11, 0.072, 0.08), wallPaint, { at: [CX, 0.182, CZ], name: "cottageWalls" });
  const shingles = scales(ROOF, ROOF_EDGE, { size: 0.009, seed: 12 });
  const roofPaint = paint((_p, n) => (Math.abs(n.x) > 0.6 ? wallPaint : shingles));
  b.extrude(
    [
      [-0.054, -0.003],
      [0.054, -0.003],
      [0, 0.05],
    ],
    { at: [CX, 0.217, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.128, bevel: 0.002, color: roofPaint, name: "roof" },
  );
  b.rod([CX - 0.066, 0.2665, CZ], [CX + 0.066, 0.2665, CZ], 0.004, { color: ROOF_EDGE, sides: 5, name: "ridge" });
  // gable round window
  for (const s of [1, -1]) {
    const g = b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), GLOW, {
      at: [CX + s * 0.0645, 0.233, CZ],
      dir: [s, 0, 0],
      flat: true,
    });
    glow(g);
    b.part(new THREE.TorusGeometry(0.0085, 0.0018, 4, 10), WHITE, {
      at: [CX + s * 0.066, 0.233, CZ],
      dir: [s, 0, 0],
      axis: "z",
      flat: true,
    });
  }
  // crooked chimney
  const brick = scales(BRICK, MORTAR, { size: 0.006, seed: 21 });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.02), brick, { at: [0.105, 0.258, -0.016], rotation: [0, 0, 7], flat: true, name: "chimney1" });
  b.part(new THREE.BoxGeometry(0.022, 0.024, 0.022), brick, { at: [0.1015, 0.29, -0.016], rotation: [0, 12, -6], flat: true, name: "chimney2" });
  b.part(new THREE.BoxGeometry(0.027, 0.006, 0.027), STONE, { at: [0.1025, 0.304, -0.016], rotation: [0, 20, -10], flat: true });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0055, 0.012, 6), "#b8613d", { at: [0.1035, 0.312, -0.016], rotation: [0, 0, -8], flat: true });
  const puffs: [V3, number][] = [
    [[0.102, 0.324, -0.018], 0.007],
    [[0.096, 0.337, -0.023], 0.0095],
    [[0.086, 0.353, -0.03], 0.012],
    [[0.071, 0.371, -0.04], 0.014],
    [[0.052, 0.39, -0.05], 0.016],
  ];
  for (const [p, r] of puffs)
    b.part(new THREE.IcosahedronGeometry(r, 0), SMOKE, { at: p, rotation: [R() * 90, R() * 90, 0], flat: true, group: "smoke" });

  // blue door
  b.part(new THREE.BoxGeometry(0.031, 0.047, 0.004), WHITE, { at: [0.045, 0.172, 0.0405] });
  b.part(new THREE.BoxGeometry(0.024, 0.041, 0.006), BLUE, { at: [0.045, 0.1695, 0.042], name: "blueDoor" });
  for (const yy of [0.162, 0.178])
    b.part(new THREE.BoxGeometry(0.018, 0.012, 0.002), "#24599e", { at: [0.045, yy, 0.0455] });
  b.part(new THREE.SphereGeometry(0.0022, 6, 4), BRASS, { at: [0.053, 0.169, 0.0458] });
  b.part(new THREE.BoxGeometry(0.036, 0.006, 0.014), STONE, { at: [0.045, 0.15, 0.048], flat: true });
  b.part(new THREE.BoxGeometry(0.008, 0.002, 0.008), IRON, { at: [0.045, 0.2075, 0.044] });
  glow(b.part(new THREE.BoxGeometry(0.006, 0.008, 0.006), GLOW, { at: [0.045, 0.2025, 0.044] }));

  const cottageWindow = (c: THREE.Vector3, out: THREE.Vector3) => {
    const side = V(out.z, 0, -out.x);
    const at = (d: number, sx = 0, sy = 0) => c.clone().addScaledVector(out, d).addScaledVector(side, sx).add(V(0, sy, 0));
    b.part(new THREE.BoxGeometry(0.028, 0.028, 0.004), WHITE, { at: at(0.001), dir: out, axis: "z", group: "windows" });
    glow(b.part(new THREE.BoxGeometry(0.021, 0.021, 0.004), GLOW, { at: at(0.0025), dir: out, axis: "z", group: "windows" }));
    b.part(new THREE.BoxGeometry(0.0022, 0.021, 0.003), WHITE, { at: at(0.0045), dir: out, axis: "z", group: "windows" });
    b.part(new THREE.BoxGeometry(0.021, 0.0022, 0.003), WHITE, { at: at(0.0045), dir: out, axis: "z", group: "windows" });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.011, 0.028, 0.003), BLUE, { at: at(0.0015, s * 0.0205), dir: out, axis: "z", group: "windows" });
    b.part(new THREE.BoxGeometry(0.03, 0.008, 0.012), WOOD2, { at: at(0.006, 0, -0.019), dir: out, axis: "z", group: "windows" });
    const fl = ["#ff6fa3", "#ffd23f", "#ff5a4e", "#ffffff", "#c77dff"];
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.SphereGeometry(0.0034, 5, 4), fl[i], { at: at(0.007, -0.011 + i * 0.0055, -0.0135), flat: true, group: "windows" });
      b.part(new THREE.SphereGeometry(0.003, 5, 3), GRASS2, { at: at(0.0095, -0.0085 + i * 0.0055, -0.0145), flat: true, group: "windows" });
    }
  };
  cottageWindow(V(0.1, 0.19, 0.04), V(0, 0, 1));
  cottageWindow(V(0.13, 0.19, -0.012), V(1, 0, 0));
  cottageWindow(V(0.02, 0.19, 0.0), V(-1, 0, 0));

  // lifebuoy
  const buoyPaint = paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 === 0 ? RED : WHITE));
  b.part(new THREE.TorusGeometry(0.0095, 0.0035, 6, 16), buoyPaint, {
    at: [0.1345, 0.186, 0.026],
    dir: [1, 0, 0],
    axis: "z",
    flat: true,
    name: "lifebuoy",
  });
  // rain barrel
  b.part(
    new THREE.CylinderGeometry(0.011, 0.01, 0.026, 8),
    paint((p) => (Math.abs(p.y - 0.158) < 0.0018 || Math.abs(p.y - 0.174) < 0.0018 ? IRON : PLANK2)),
    { at: [0.142, groundY(0.142, -0.035) + 0.012, -0.035], flat: true, name: "barrel" },
  );
  // washing line
  {
    const py = groundY(0.03, -0.108);
    b.rod([0.03, py - 0.003, -0.108], [0.03, py + 0.065, -0.108], 0.0018, { color: WOOD2, sides: 5 });
    const a = V(0.03, 0.208, -0.041);
    const c = V(0.03, py + 0.062, -0.108);
    const ln = bezier(a, V(0.03, 0.198, -0.075), c);
    b.sweep(ln, 0.0009, { color: WHITE, sides: 4, caps: "flat", name: "washingLine" });
    const cloth: [number, string, [number, number]][] = [
      [0.3, "#e85d75", [0.012, 0.016]],
      [0.55, "#4aa3df", [0.016, 0.014]],
      [0.78, "#ffd23f", [0.008, 0.012]],
    ];
    for (const [t, col, [w, h]] of cloth) {
      const p = ln.at(t);
      b.part(new THREE.BoxGeometry(0.002, h, w), col, { at: [p.x, p.y - h / 2, p.z], group: "laundry" });
    }
  }

  // stepping stones door -> jetty
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const x = 0.05 + (0.13 - 0.05) * t + (R() - 0.5) * 0.008;
    const z = 0.062 + (0.15 - 0.062) * t;
    b.part(new THREE.CylinderGeometry(0.009 + R() * 0.003, 0.01, 0.004, 6), STONE, {
      at: [x, groundY(x, z) + 0.001, z],
      rotation: [0, R() * 60, 0],
      flat: true,
      group: "path",
    });
  }

  // ---------- jetty ----------
  const JX = 0.13;
  for (let i = 0; i < 10; i++) {
    const z = 0.155 + i * 0.0135;
    b.part(new THREE.BoxGeometry(0.052, 0.006, 0.0115), grain(i % 2 ? PLANK : PLANK2, "#6b4322", { size: 0.004, axis: "x", seed: i }), {
      at: [JX + (R() - 0.5) * 0.004, 0.101, z],
      rotation: [0, (R() - 0.5) * 6, 0],
      flat: true,
      group: "jetty",
    });
  }
  for (const x of [JX - 0.018, JX + 0.018])
    b.part(new THREE.BoxGeometry(0.006, 0.006, 0.15), WOOD2, { at: [x, 0.095, 0.215], group: "jetty" });
  const postTops: V3[] = [];
  for (const z of [0.16, 0.22, 0.28])
    for (const x of [JX - 0.023, JX + 0.023]) {
      b.part(new THREE.CylinderGeometry(0.0045, 0.005, 0.046, 6), WOOD2, { at: [x, 0.088, z], flat: true, group: "jetty" });
      b.part(new THREE.CylinderGeometry(0.0052, 0.0052, 0.003, 6), ROPE, { at: [x, 0.084, z], flat: true, group: "jetty" });
      postTops.push([x, 0.111, z]);
    }
  // lantern post on the end
  b.rod([JX + 0.02, 0.104, 0.282], [JX + 0.02, 0.15, 0.282], 0.0018, { color: IRON, sides: 4 });
  b.part(new THREE.BoxGeometry(0.01, 0.002, 0.01), IRON, { at: [JX + 0.02, 0.161, 0.282] });
  glow(b.part(new THREE.BoxGeometry(0.0075, 0.01, 0.0075), GLOW, { at: [JX + 0.02, 0.155, 0.282] }));
  b.spike([JX + 0.02, 0.162, 0.282], [0, 1, 0], 0.006, 0.004, { color: IRON });
  // crate and rope coil
  b.part(new THREE.BoxGeometry(0.02, 0.018, 0.02), grain(PLANK, WOOD2, { size: 0.004, axis: "x", seed: 40 }), {
    at: [JX - 0.012, 0.113, 0.178],
    rotation: [0, 18, 0],
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.0075, 0.0024, 5, 10), ROPE, { at: [JX + 0.012, 0.106, 0.258], rotation: [90, 0, 0], flat: true });

  // ---------- rowboat ----------
  const BX = 0.07,
    BY = 0.095,
    BZ = 0.25;
  b.part(
    new THREE.SphereGeometry(0.05, 10, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    paint((p) => (p.y > BY - 0.006 ? WHITE : HULL)),
    { at: [BX, BY, BZ], scale: [0.62, 0.5, 0.96], flat: true, name: "hull" },
  );
  {
    const g = new THREE.CircleGeometry(0.05, 12);
    g.rotateX(-Math.PI / 2);
    g.scale(0.57, 1, 0.92);
    b.part(g, PLANK2, { at: [BX, BY - 0.004, BZ], name: "boatFloor" });
  }
  b.sweep(catmull(circlePts(BX, BY, BZ, 0.031, 0.048, 14), { closed: true }), 0.0028, { color: "#3b6f8f", sides: 5, name: "gunwale" });
  for (const z of [BZ - 0.015, BZ + 0.015])
    b.part(new THREE.BoxGeometry(0.058, 0.004, 0.012), PLANK, { at: [BX, BY - 0.002, z], group: "boat" });
  {
    const a = V(BX - 0.017, BY + 0.001, BZ - 0.035);
    const e = V(BX + 0.012, BY + 0.004, BZ + 0.03);
    b.rod(a, e, 0.0017, { color: PLANK, sides: 4 });
    const dir = e.clone().sub(a).normalize();
    b.part(new THREE.BoxGeometry(0.008, 0.02, 0.0016), PLANK, { at: e.clone().addScaledVector(dir, 0.009), dir, group: "boat" });
  }
  // mooring rope
  b.sweep(bezier([BX, BY + 0.002, BZ + 0.047], [BX + 0.02, 0.088, BZ + 0.05], [JX - 0.023, 0.106, 0.28]), 0.0013, {
    color: ROPE,
    sides: 4,
    name: "mooringRope",
  });
  b.part(new THREE.IcosahedronGeometry(0.03, 0), FOAM, { at: [BX, 0.0812, BZ], scale: [1.4, 0.06, 2.0], flat: true });

  // ---------- channel buoy ----------
  {
    const at: V3 = [-0.225, 0.07, 0.17];
    b.lathe(
      [
        [0, 0],
        [0.014, 0],
        [0.016, 0.02],
        [0.008, 0.04],
        [0, 0.042],
      ],
      { at, segments: 8, color: paint((_p, _n, s) => (s[0] > 0.024 && s[0] < 0.031 ? WHITE : RED)), name: "buoy" },
    );
    glow(b.part(new THREE.SphereGeometry(0.004, 6, 4), GLOW, { at: [at[0], 0.116, at[2]] }));
    b.part(new THREE.IcosahedronGeometry(0.024, 0), FOAM, { at: [at[0], 0.0812, at[2]], scale: [1, 0.08, 1], flat: true });
  }

  // ---------- seagulls ----------
  const gull = (pos: V3, yawDeg: number, mode: "stand" | "fly") => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (yawDeg * Math.PI) / 180);
    const base = V(pos[0], pos[1], pos[2]);
    const P = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(q).add(base);
    const D = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(q);
    const grp = "gulls";
    b.part(new THREE.SphereGeometry(0.01, 8, 6), WHITE, { at: P(0, 0.018, -0.002), quat: q, scale: [0.85, 0.8, 1.7], flat: true, group: grp });
    b.part(new THREE.SphereGeometry(0.0098, 8, 5), GULL_GREY, { at: P(0, 0.0215, -0.004), quat: q, scale: [0.9, 0.55, 1.5], flat: true, group: grp });
    b.part(new THREE.SphereGeometry(0.0078, 8, 6), WHITE, { at: P(0, 0.03, 0.016), flat: true, group: grp });
    b.spike(P(0, 0.029, 0.022), D(0, -0.15, 1), 0.011, 0.0022, { color: BEAK, sides: 5, group: grp });
    b.part(new THREE.SphereGeometry(0.0013, 5, 3), "#c0392b", { at: P(0, 0.0262, 0.0275), group: grp });
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.0014, 5, 3), GULL_BLACK, { at: P(s * 0.0056, 0.032, 0.02), group: grp });
    b.spike(P(0, 0.019, -0.016), D(0, 0.05, -1), 0.012, 0.0055, { color: WHITE, sides: 5, group: grp });
    if (mode === "stand") {
      for (const s of [1, -1]) {
        b.spike(P(s * 0.006, 0.022, -0.012), D(s * 0.1, 0.06, -1), 0.016, 0.0042, { color: GULL_BLACK, sides: 5, group: grp });
        b.rod(P(s * 0.0035, 0.0, 0.0), P(s * 0.0035, 0.012, -0.002), 0.0011, { color: LEG, sides: 4, group: grp });
        b.part(new THREE.BoxGeometry(0.005, 0.0012, 0.007), LEG, { at: P(s * 0.0035, 0.0006, 0.002), quat: q, group: grp });
      }
    } else {
      const wing = paint((_p, _n, s) => (s[0] > 0.052 ? GULL_BLACK : s[0] > 0.046 ? WHITE : GULL_GREY));
      for (const s of [1, -1])
        b.extrude(
          [
            [0, -0.009],
            [0.026, -0.011],
            [0.052, -0.005],
            [0.07, 0.006, "sharp"],
            [0.05, 0.006],
            [0.026, 0.01],
            [0, 0.011],
          ],
          {
            at: P(s * 0.006, 0.022, 0.0),
            x: D(s, 0.3, 0),
            y: D(0, 0, -1),
            thickness: 0.0022,
            smoothing: 1,
            color: wing,
            group: grp,
          },
        );
    }
  };
  gull([0.112, 0.2685, 0.0], 70, "stand");
  gull(postTops[3], -35, "stand");
  // flying gull on a brass display wire
  const fly: V3 = [0.0, 0.41, 0.12];
  b.sweep(bezier([-0.12, groundY(-0.12, 0.12) - 0.004, 0.12], [-0.1, 0.33, 0.12], [fly[0], fly[1] + 0.012, fly[2]]), 0.0012, {
    color: BRASS,
    sides: 4,
    caps: "flat",
    name: "gullWire",
  });
  gull(fly, 110, "fly");

  // ---------- grass and wildflowers ----------
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
      <path d="M1 40 L3 15 L8 40Z" fill="#6aae42"/>
      <path d="M5 40 L10 5 L13 40Z" fill="#5f9e3c"/>
      <path d="M11 40 L16 0 L20 40Z" fill="#86c652"/>
      <path d="M18 40 L24 7 L25 40Z" fill="#4f8a33"/>
      <path d="M22 40 L31 13 L29 40Z" fill="#9bd65e"/>
    </svg>`,
    { size: 128 },
  );
  const flower = (petal: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 40">
        <rect x="9" y="13" width="2.4" height="27" fill="#4f8a33"/>
        <ellipse cx="6" cy="28" rx="4" ry="2" fill="#6aae42"/>
        <circle cx="10" cy="5.5" r="3.6" fill="${petal}"/>
        <circle cx="14.5" cy="9" r="3.6" fill="${petal}"/>
        <circle cx="12.8" cy="14" r="3.6" fill="${petal}"/>
        <circle cx="7.2" cy="14" r="3.6" fill="${petal}"/>
        <circle cx="5.5" cy="9" r="3.6" fill="${petal}"/>
        <circle cx="10" cy="10" r="2.6" fill="#ffcf3a"/>
      </svg>`,
      { size: 96 },
    );
  const flowers = [flower("#ff7eb6"), flower("#ffffff"), flower("#ffd23f"), flower("#b48cff"), flower("#ff6b5a")];

  const openGround = (x: number, z: number) => {
    if (Math.hypot(x - TX, z - TZ) < 0.078) return false;
    if (x > 0.012 && x < 0.142 && z > -0.052 && z < 0.06) return false;
    if (x > 0.098 && x < 0.165 && z > 0.12) return false;
    if (Math.hypot(x - 0.03, z + 0.108) < 0.01) return false;
    if (x > 0.04 && x < 0.14 && z > 0.055 && z < 0.155 && Math.abs(z - 0.062 - (x - 0.05) * 1.1) < 0.012) return false;
    return true;
  };
  const grassHits = isl.scatter(90, {
    rng: rng(31),
    minDist: 0.013,
    filter: (h: any) => h.n.y > 0.45 && h.at.y > 0.115 && openGround(h.at.x, h.at.z),
  });
  b.cards(grassHits, grassTex, { size: [0.024, 0.026], cross: true, vary: 0.35, spin: 40, lean: 8, rng: rng(32) });
  const flowerHits = isl.scatter(34, {
    rng: rng(41),
    minDist: 0.018,
    filter: (h: any) => h.n.y > 0.6 && h.at.y > 0.13 && openGround(h.at.x, h.at.z),
  });
  b.cards(flowerHits, flowers, { size: [0.011, 0.022], cross: true, vary: 0.3, spin: 60, rng: rng(42) });

  return b.root;
}
