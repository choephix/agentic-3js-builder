import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Sky Island of the Windward Ruins",
  "description": "A Genshin-style floating island: a grassy top with ruined stone arches, a waterfall spilling off the edge, stylized trees, and a crystalline rocky underside hanging in the sky."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  grassLight: "#9fd45a",
  grassMid: "#6fb344",
  grassDark: "#3f8a3a",
  soil: "#8a5a3a",
  rockLight: "#a39a94",
  rockMid: "#7d7580",
  rockDark: "#4f4a5c",
  rockDeep: "#34314a",
  ruinStone: "#d9cfb8",
  ruinShade: "#b3a78e",
  ruinMoss: "#7fae52",
  ruinGold: "#e8b94a",
  runeTeal: "#5ff2e0",
  water: "#7fd6f2",
  waterFoam: "#e9fbff",
  waterDeep: "#3fa5d8",
  bark: "#6b4a32",
  barkDark: "#4a3224",
  leafPink: "#f5a9c0",
  leafGreen: "#58b04a",
  leafLight: "#a6dc6a",
  crystalBlue: "#6fb6ff",
  crystalPurple: "#a98aff",
  flowerWhite: "#fff6e0",
  flowerYellow: "#ffd54a",
};
const M = {
  islandTop: [0, 1.6, 0] as [number, number, number],
  islandRim: [0, 1.6, 2] as [number, number, number],
  rockTip: [0, 0, 0] as [number, number, number],
  ruinCenter: [0, 1.6, -0.7] as [number, number, number],
  platformTop: [0, 1.85, -0.7] as [number, number, number],
  springPool: [1.5, 1.62, 0.3] as [number, number, number],
  fallLip: [2, 1.55, 0.3] as [number, number, number],
  fallBase: [2.15, 0.2, 0.3] as [number, number, number],
  bigTree: [-1.1, 1.6, 0.9] as [number, number, number],
  smallTreeA: [-1.3, 1.6, -1] as [number, number, number],
  smallTreeB: [-0.4, 1.6, -1.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // rockBase
  (() => {
function buildRockBase({ b, J, P, M }: any) {
  const R = rng(11);
  const flat = { flat: true } as any;
  const lathe = (pts: number[][], color: string, seg: number, y: number, spin = 0) =>
    b.lathe(pts, { at: [0, y, 0], segments: seg, spin, color });

  // stacked faceted rock layers: [yBottom, yTop, rTop, rBottom, color, sides]
  const layers: [number, number, number, number, string, number][] = [
    [1.15, 1.5, 1.95, 1.8, P.rockLight, 8],
    [0.8, 1.15, 1.8, 1.45, P.rockMid, 6],
    [0.5, 0.8, 1.45, 1.05, P.rockMid, 8],
    [0.25, 0.5, 1.05, 0.65, P.rockDark, 6],
    [0.0, 0.25, 0.65, 0.0, P.rockDeep, 8],
  ];
  layers.forEach(([y0, y1, rt, rb, c, n], i) => {
    const h = y1 - y0;
    lathe([[0, 0], [rb, 0], [rt, h], [0, h]], c, n, y0, i * 12);
  });

  // soil band under the turf
  lathe([[0, 0], [1.97, 0], [2.0, 0.1], [0, 0.1]], P.soil, 12, 1.45);
  // turf disc
  lathe([[0, 0], [2.0, 0], [2.02, 0.06], [1.98, 0.12], [0, 0.12]], P.grassMid, 16, 1.5);
  lathe([[0, 0], [1.95, 0], [1.9, 0.05], [0, 0.05]], P.grassLight, 16, 1.62 - 0.02);

  // scalloped rim blocks
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 1.98 + R() * 0.05;
    const c = i % 3 === 0 ? P.grassDark : i % 3 === 1 ? P.grassMid : P.grassLight;
    const w = 0.2 + R() * 0.08;
    const h = 0.14 + R() * 0.12;
    b.part(new THREE.BoxGeometry(w, h, 0.16), c, {
      at: [Math.sin(a) * r, 1.52 - h / 2 + 0.06, Math.cos(a) * r],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: undefined,
    });
  }

  // root tendrils under turf
  for (let i = 0; i < 12; i++) {
    const a = R() * 6.28;
    const r = 0.6 + R() * 1.2;
    const len = 0.3 + R() * 0.4;
    b.part(new THREE.ConeGeometry(0.035, len, 5), P.bark, {
      at: [Math.sin(a) * r, 1.4 - len / 2 + 0.05, Math.cos(a) * r],
      rotation: [180, 0, 0],
    });
  }

  // jutting rock chunks
  const cols = [P.rockLight, P.rockMid, P.rockDark];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.28 + R() * 0.3;
    const y = 0.5 + R() * 0.9;
    const rad = 0.4 + (y / 1.5) * 1.4;
    const s = 0.16 + R() * 0.16;
    b.part(new THREE.DodecahedronGeometry(s, 0), cols[i % 3], {
      at: [Math.sin(a) * rad, y, Math.cos(a) * rad],
      rotation: [R() * 90, R() * 90, 0],
      scale: [1, 0.8, 1],
      ...flat,
    });
  }

  // stalactites
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.28 + 0.2;
    const rad = 0.5 + R() * 0.5;
    const len = 0.25 + R() * 0.3;
    const y = 0.3 + (1 - rad) * 0.2 + len / 2 + 0.1;
    b.part(new THREE.ConeGeometry(0.07, len, 5), P.rockDeep, {
      at: [Math.sin(a) * rad, Math.max(y - 0.15, len / 2 + 0.02), Math.cos(a) * rad],
      rotation: [180, 0, 0],
    });
  }

  // crystal clusters
  const crystal = (x: number, y: number, z: number, c: string, tilt: number) => {
    for (let k = 0; k < 3; k++) {
      const h = 0.18 + k * 0.06;
      const m = b.part(new THREE.OctahedronGeometry(0.06, 0), c, {
        at: [x + (k - 1) * 0.06, y - h * 0.2, z + (k % 2) * 0.04],
        rotation: [tilt + k * 15, k * 40, k * 10],
        scale: [1, h / 0.06 * 0.6, 1],
      });
      try {
        const g = (m.mesh.material as THREE.MeshStandardMaterial).clone();
        g.emissive.set(c);
        g.emissiveIntensity = 1.2;
        m.mesh.material = g;
      } catch (e) {}
    }
  };
  crystal(0.9, 0.75, 0.95, P.crystalBlue, 25);
  crystal(-0.95, 0.6, 0.85, P.crystalPurple, -25);
  crystal(0.2, 0.55, -1.1, P.crystalBlue, 15);
  crystal(-0.5, 0.35, 0.4, P.crystalPurple, 0);
  crystal(0.5, 0.3, -0.3, P.crystalBlue, 0);

  // tip nub resting on floor
  b.part(new THREE.ConeGeometry(0.1, 0.25, 6), P.rockDeep, { at: [0, 0.12, 0], rotation: [180, 0, 0] });
}
    return buildRockBase;
  })(),
  // ruins
  (() => {
function buildRuins({ b, P, M }: any) {
  const R = rng(11);
  const [cx, cy, cz] = M.ruinCenter as number[];
  const STONE = P.ruinStone, SHADE = P.ruinShade, MOSS = P.ruinMoss, GOLD = P.ruinGold, TEAL = P.runeTeal;
  const put = (g: THREE.BufferGeometry, color: string, at: number[], rot?: number[]) =>
    b.part(g, color, { at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, s: number) => new THREE.CylinderGeometry(rt, rb, h, s);

  // stepped platform
  put(cyl(0.95, 1.0, 0.12, 16), SHADE, [cx, cy + 0.06, cz]);
  put(cyl(0.78, 0.85, 0.12, 16), STONE, [cx, cy + 0.18, cz]);
  put(cyl(0.6, 0.66, 0.1, 16), SHADE, [cx, cy + 0.29, cz]);
  put(cyl(0.54, 0.54, 0.02, 24), STONE, [cx, cy + 0.35, cz]);
  // gold trim rings
  put(new THREE.TorusGeometry(0.8, 0.012, 4, 24), GOLD, [cx, cy + 0.245, cz], [90, 0, 0]);
  // rune
  glow(put(new THREE.TorusGeometry(0.42, 0.018, 4, 24), TEAL, [cx, cy + 0.362, cz], [90, 0, 0]), 1.5);
  glow(put(new THREE.TorusGeometry(0.28, 0.012, 4, 20), TEAL, [cx, cy + 0.362, cz], [90, 0, 0]), 1.5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    glow(put(new THREE.BoxGeometry(0.02, 0.01, 0.15), TEAL, [cx + Math.sin(a) * 0.35, cy + 0.362, cz + Math.cos(a) * 0.35], [0, (a * 180) / Math.PI, 0]), 1.5);
  }

  // pillars
  const pil: [number, number, number][] = [[-0.95, -0.35, 1.2], [0.95, -0.35, 0.8], [-0.75, -0.95, 1.5], [0.8, -0.9, 0.6]];
  pil.forEach(([dx, dz, h], i) => {
    const x = cx + dx, z = cz + dz;
    put(cyl(0.17, 0.2, 0.1, 8), SHADE, [x, cy + 0.05, z]);
    put(cyl(0.12, 0.14, h, 8), STONE, [x, cy + 0.1 + h / 2, z]);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      put(new THREE.BoxGeometry(0.02, h * 0.9, 0.02), SHADE, [x + Math.sin(a) * 0.125, cy + 0.1 + h / 2, z + Math.cos(a) * 0.125]);
    }
    put(cyl(0.145, 0.145, 0.04, 8), GOLD, [x, cy + 0.2, z]);
    put(cyl(0.145, 0.145, 0.04, 8), GOLD, [x, cy + 0.1 + h - 0.12, z]);
    put(new THREE.BoxGeometry(0.3, 0.07, 0.3), SHADE, [x, cy + 0.1 + h + 0.03, z], [0, 20 * i, i % 2 ? 6 : -4]);
    put(new THREE.BoxGeometry(0.14, 0.02, 0.14), MOSS, [x, cy + 0.1 + h + 0.075, z], [0, 20 * i, 0]);
  });

  // broken arch at back
  const az = cz - 0.6;
  for (const s of [1, -1]) {
    const h = s > 0 ? 1.5 : 1.1;
    put(new THREE.BoxGeometry(0.22, h, 0.26), STONE, [cx + s * 0.55, cy + h / 2, az]);
    put(new THREE.BoxGeometry(0.28, 0.06, 0.32), GOLD, [cx + s * 0.55, cy + 0.4, az]);
    put(new THREE.BoxGeometry(0.28, 0.08, 0.32), SHADE, [cx + s * 0.55, cy + 0.04, az]);
  }
  put(new THREE.BoxGeometry(0.45, 0.2, 0.26), STONE, [cx + 0.4, cy + 1.6, az], [0, 0, 14]);
  put(new THREE.BoxGeometry(0.3, 0.17, 0.26), SHADE, [cx + 0.15, cy + 1.7, az], [0, 0, 28]);
  put(new THREE.BoxGeometry(0.28, 0.06, 0.28), MOSS, [cx + 0.55, cy + 1.54, az]);
  // fallen keystone
  put(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 4), STONE, [cx - 0.1, cy + 0.12, az + 0.45], [70, 20, 80]);
  put(new THREE.BoxGeometry(0.1, 0.02, 0.12), GOLD, [cx - 0.1, cy + 0.22, az + 0.45], [0, 20, 10]);

  // fallen blocks
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2, d = 1.05 + R() * 0.3;
    const s = 0.1 + R() * 0.12;
    put(new THREE.BoxGeometry(s * 1.5, s, s), i % 2 ? STONE : SHADE, [cx + Math.sin(a) * d, cy + s / 2, cz + Math.cos(a) * d * 0.8 - 0.2], [R() * 20, R() * 90, R() * 20]);
  }
  // moss patches
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, d = 0.55 + R() * 0.4;
    put(cyl(0.07 + R() * 0.07, 0.08, 0.02, 7), MOSS, [cx + Math.sin(a) * d, cy + 0.19 + (d > 0.66 ? 0 : 0.1) + 0.01, cz + Math.cos(a) * d]);
  }

  // altar
  put(new THREE.BoxGeometry(0.22, 0.14, 0.22), STONE, [cx, cy + 0.43, cz]);
  put(new THREE.BoxGeometry(0.26, 0.03, 0.26), GOLD, [cx, cy + 0.515, cz]);
  put(new THREE.BoxGeometry(0.26, 0.03, 0.26), GOLD, [cx, cy + 0.38, cz]);
  glow(put(new THREE.IcosahedronGeometry(0.075, 0), TEAL, [cx, cy + 0.63, cz]), 2);
  for (const s of [1, -1]) put(new THREE.ConeGeometry(0.02, 0.1, 4), GOLD, [cx + s * 0.1, cy + 0.58, cz]);

  // vines
  for (const [vx, vz, len] of [[0.55, az, 0.9], [-0.55, az, 0.7], [-0.95, cz - 0.55, 0.6]] as number[][]) {
    const pts = [0, 1, 2, 3].map((k) => new THREE.Vector3(cx + vx + Math.sin(k) * 0.04, cy + 1.0 - (k / 3) * len + (vx < -0.9 ? -0.3 : 0.3), vz + 0.14));
    b.sweep(pts, 0.012, { color: P.leafGreen });
    put(new THREE.IcosahedronGeometry(0.03, 0), MOSS, [pts[2].x, pts[2].y, pts[2].z]);
  }
}
    return buildRuins;
  })(),
  // waterfall
  (() => {
function buildWaterfall({ b, J, P, M }: any) {
  const R = rng(11);
  const G = glowKit ?? glow;
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], opts: any = {}) =>
    b.part(geo, color, { at, flat: true, ...opts });

  // Spring pool: rock rim, foam ring, water disc
  const [px0, py, pz] = M.springPool;
  const px = px0 + 0.22;
  b.lathe([[0, 0], [0.52, 0], [0.55, 0.05], [0.5, 0.09], [0, 0.09]], {
    at: [px - 0.1, py - 0.03, pz], segments: 10, color: P.waterDeep,
  });
  b.lathe([[0, 0.06], [0.46, 0.06], [0.48, 0.1], [0, 0.1]], {
    at: [px - 0.1, py - 0.01, pz], segments: 10, color: P.water,
  });
  b.lathe([[0.44, 0.0], [0.58, 0.0], [0.6, 0.07], [0.5, 0.1], [0.44, 0.08]], {
    at: [px - 0.1, py - 0.01, pz], segments: 10, color: P.waterFoam,
  });
  // rocks around pool
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.3;
    if (Math.cos(a) > 0.75) continue;
    const r = 0.5 + R() * 0.03;
    const s = 0.07 + R() * 0.05;
    put(new THREE.DodecahedronGeometry(s, 0), i % 2 ? P.rockMid : P.rockLight,
      [px - 0.1 + Math.cos(a) * r, py + 0.02, pz + Math.sin(a) * r * 0.7], { rotation: [R() * 90, R() * 90, 0] });
  }
  // lily pads and flowers
  for (let i = 0; i < 4; i++) {
    const x = px - 0.25 + R() * 0.3, z = pz - 0.25 + R() * 0.5;
    put(new THREE.CylinderGeometry(0.06, 0.06, 0.008, 7), P.leafGreen, [x, py + 0.095, z]);
    if (i % 2 === 0) {
      put(sph(0.022), i ? P.flowerYellow : P.flowerWhite, [x + 0.02, py + 0.115, z]);
      put(sph(0.01), P.flowerYellow, [x + 0.02, py + 0.13, z]);
    }
  }
  // stream channel to the edge
  put(new THREE.BoxGeometry(0.62, 0.03, 0.2), P.water, [px + 0.62, py + 0.05, pz]);
  put(new THREE.BoxGeometry(0.62, 0.025, 0.04), P.waterDeep, [px + 0.62, py + 0.04, pz + 0.12]);
  put(new THREE.BoxGeometry(0.62, 0.025, 0.04), P.waterDeep, [px + 0.62, py + 0.04, pz - 0.12]);
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.6, 0.04, 0.03), P.rockLight, [px + 0.62, py + 0.06, pz + s * 0.15]);
    put(new THREE.BoxGeometry(0.5, 0.012, 0.02), P.waterFoam, [px + 0.6, py + 0.07, pz + s * 0.07]);
  }

  // Waterfall: layered slabs following a curve from lip to base
  const [lx, ly, lz] = M.fallLip;
  const [bx, by] = M.fallBase;
  const N = 9;
  const top = ly + 0.06;
  for (let i = 0; i < N; i++) {
    const t = i / N, t2 = (i + 1) / N;
    const y1 = top - (top - by) * t, y2 = top - (top - by) * t2;
    const x = lx + 0.04 + (bx - lx) * t * t + 0.02;
    const h = y1 - y2 + 0.03;
    const w = 0.34 - 0.06 * t;
    put(new THREE.BoxGeometry(0.05, h, w), i % 2 ? P.water : P.waterDeep, [x, (y1 + y2) / 2, lz]);
    put(new THREE.BoxGeometry(0.03, h, w * 0.55), P.water, [x + 0.03, (y1 + y2) / 2, lz + 0.01]);
    put(new THREE.BoxGeometry(0.06, h * 0.7, w * 0.12), P.waterFoam, [x + 0.045, (y1 + y2) / 2, lz - w * 0.3]);
    G(put(new THREE.BoxGeometry(0.01, h * 0.8, 0.015), P.waterFoam, [x + 0.06, (y1 + y2) / 2, lz + w * 0.15 * (i % 3 - 1)]), 1.2);
  }
  // lip foam blobs
  for (let i = 0; i < 6; i++)
    put(sph(0.05 + R() * 0.03), P.waterFoam, [lx + 0.04, ly + 0.05, lz - 0.15 + i * 0.06]);

  // Mist and droplets
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, r = R() * 0.3;
    put(sph(0.05 + R() * 0.06, 6, 4), P.waterFoam,
      [bx + Math.cos(a) * r * 0.8, by + 0.05 + R() * 0.2, M.fallBase[2] + Math.sin(a) * r]);
  }
  for (let i = 0; i < 14; i++) {
    const y = by + 0.1 + R() * 0.9;
    G(put(sph(0.015 + R() * 0.012, 5, 3), i % 2 ? P.runeTeal : P.waterFoam,
      [bx + 0.08 + R() * 0.25, y, M.fallBase[2] - 0.25 + R() * 0.5]), 1.5);
  }
}
    return buildWaterfall;
  })(),
  // trees
  (() => {
function buildTrees({ b, P, M }: any) {
  const R = rng(11);
  const Y = 1.6;
  const ico = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at, flat: true, ...extra });

  // Tree builder: trunk, roots, branches, canopy
  function tree(
    base: number[], h: number, tr: number, cols: string[], under: string,
    canopyR: number, seed: number,
  ) {
    const r = rng(seed);
    const [x, , z] = base;
    // trunk
    b.rod([x, Y, z], [x + 0.03, Y + h, z], [tr, tr * 0.55], P.bark, { sides: 7 });
    // dark bark streaks
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + seed;
      b.rod([x + Math.cos(a) * tr * 0.8, Y + 0.05, z + Math.sin(a) * tr * 0.8],
        [x + Math.cos(a) * tr * 0.5, Y + h * 0.7, z + Math.sin(a) * tr * 0.5],
        0.012, P.barkDark, { sides: 4 });
    }
    // buttress roots
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + r() * 0.4;
      b.spike([x + Math.cos(a) * tr * 0.5, Y + tr * 0.9, z + Math.sin(a) * tr * 0.5],
        [Math.cos(a), -0.45, Math.sin(a)], tr * 2.2, tr * 0.55, { color: P.bark, sides: 6 });
    }
    // branches
    for (let i = 0; i < 3; i++) {
      const a = i * 2.3 + seed;
      const ty = Y + h * (0.7 + i * 0.1);
      b.rod([x, ty - 0.1, z],
        [x + Math.cos(a) * canopyR * 0.6, ty + canopyR * 0.25, z + Math.sin(a) * canopyR * 0.6],
        [tr * 0.35, tr * 0.18], P.barkDark, { sides: 5 });
    }
    // canopy: undersides then top lobes
    const cy = Y + h + canopyR * 0.35;
    put(ico(canopyR * 0.8), under, [x, cy - canopyR * 0.35, z]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + r();
      const rad = canopyR * (0.35 + r() * 0.4);
      const s = canopyR * (0.42 + r() * 0.25);
      put(ico(s), cols[i % cols.length], [
        x + Math.cos(a) * rad, cy + (r() - 0.3) * canopyR * 0.5, z + Math.sin(a) * rad]);
    }
    put(ico(canopyR * 0.5), cols[0], [x, cy + canopyR * 0.45, z]);
  }

  tree(M.bigTree, 0.85, 0.11, [P.leafPink, P.leafLight, P.leafPink], P.leafGreen, 0.62, 3);
  tree(M.smallTreeA, 0.4, 0.05, [P.leafGreen, P.leafLight], P.leafGreen, 0.3, 5);
  tree(M.smallTreeB, 0.35, 0.045, [P.leafLight, P.leafGreen], P.leafGreen, 0.27, 7);

  // falling petals
  for (let i = 0; i < 14; i++) {
    const a = R() * 6.28, d = 0.3 + R() * 0.7;
    put(new THREE.OctahedronGeometry(0.02, 0), P.leafPink,
      [M.bigTree[0] + Math.cos(a) * d, Y + 0.1 + R() * 1.1, M.bigTree[2] + Math.sin(a) * d],
      { scale: [1, 0.3, 1.4], rotation: [R() * 90, R() * 90, 0] });
  }

  // bushes
  const bushes = [[-1.7, 0.2], [-0.5, 1.5], [-1.9, -0.4], [-0.3, 0.3], [-1.6, -1.6]];
  bushes.forEach(([x, z], i) => {
    const s = 0.13 + R() * 0.07;
    put(ico(s, 1), i % 2 ? P.leafGreen : P.grassDark, [x, Y + s * 0.6, z]);
    put(ico(s * 0.7, 1), P.leafLight, [x + s * 0.7, Y + s * 0.4, z + s * 0.3]);
  });

  // grass tufts
  for (let i = 0; i < 22; i++) {
    const x = -1.9 + R() * 2.1, z = -1.8 + R() * 3.4;
    if (Math.hypot(x, z) > 1.85) continue;
    for (let k = 0; k < 3; k++) {
      b.spike([x + k * 0.02, Y, z + (k - 1) * 0.02], [(k - 1) * 0.3, 1, 0.1 * k],
        0.1 + R() * 0.05, 0.015, { color: k % 2 ? P.grassLight : P.grassDark, sides: 4 });
    }
  }

  // flowers
  for (let i = 0; i < 18; i++) {
    const x = -1.9 + R() * 2.2, z = -1.8 + R() * 3.5;
    if (Math.hypot(x, z) > 1.8) continue;
    const h = 0.07 + R() * 0.05;
    b.rod([x, Y, z], [x, Y + h, z], 0.005, P.grassMid, { sides: 4 });
    const pc = i % 2 ? P.flowerWhite : P.flowerYellow;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 6.28;
      put(ico(0.014, 0), pc, [x + Math.cos(a) * 0.02, Y + h, z + Math.sin(a) * 0.02]);
    }
    put(ico(0.012, 0), i % 2 ? P.flowerYellow : P.ruinGold, [x, Y + h + 0.008, z]);
  }

  // crystals near roots
  [[-1.35, 0.7], [-0.8, 1.2], [-1.0, 0.55]].forEach(([x, z], i) => {
    const h = 0.14 + i * 0.04;
    glow(b.spike([x, Y, z], [0.2 * i - 0.1, 1, 0.15], h, 0.035,
      { color: P.crystalBlue, sides: 5 }), 1.4);
  });
}
    return buildTrees;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "skyIslandRuins" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
