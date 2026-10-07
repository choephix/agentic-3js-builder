```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, grain, svg, rng, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Gull Rock Light",
  description:
    "A cozy lighthouse diorama on a tiny rocky island. It has a red-and-white striped tower with a glowing lantern and a black iron gallery, a keeper's cottage with a crooked chimney and a blue door, and a wooden jetty with a tied rowboat. Seagulls, grass tufts and sea-thrift flowers sit among the rocks, and foaming turquoise water fills a round wooden display base.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse_diorama", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(7);
  const DEG = Math.PI / 180;
  const UP = new THREE.Vector3(0, 1, 0);
  const WATER_Y = 0.075;

  // ---------------- palette ----------------
  const WHITE = "#f6f2e8";
  const RED = "#cf3a2e";
  const IRON = "#1f2227";
  const STONE = "#a7a29a";
  const STONE_D = "#7f7a72";
  const WOOD = "#8b5a33";
  const WOOD_L = "#b07a45";
  const WOOD_D = "#5e3b22";
  const BRASS = "#c9a24a";
  const DOOR_BLUE = "#2f67b5";
  const GULL_W = "#fbfbf6";
  const GULL_G = "#98a4b0";
  const BLACK = "#1b1b1d";
  const BEAK = "#f2b22e";
  const LEG = "#e58a3a";
  const ROPE = "#d8c39a";

  const hash2 = (a: number, c: number) => {
    const s = Math.sin(a * 127.1 + c * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const glow = (color: string, emissive: string, intensity: number) =>
    new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness: 0.35 });
  const glowLamp = glow("#fff2c4", "#ffc548", 2.4);
  const glowWin = glow("#ffe2a6", "#ffad3d", 1.1);
  const dblCache = new Map<string, THREE.MeshStandardMaterial>();
  const dbl = (c: string) => {
    let m = dblCache.get(c);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: 0.7, metalness: 0.02 });
      dblCache.set(c, m);
    }
    return m;
  };

  const blocks = (cols: string[], mortar: string, rowH: number, len: number, h: (p: THREE.Vector3) => number) =>
    paint((p) => {
      const r = Math.floor(p.y / rowH);
      const fy = p.y / rowH - r;
      const u = h(p) / len + (Math.abs(r) % 2) * 0.5;
      const c = Math.floor(u);
      const fx = u - c;
      if (fy < 0.14 || fx < 0.08) return mortar;
      return cols[Math.floor(hash2(r, c) * cols.length) % cols.length];
    });

  // ---------------- paints ----------------
  const rockPaint = paint((p, n) => {
    const t = noise(p, 0.012, 1);
    let c = mix("#a3a29b", "#6c7074", smoothstep(0.35, 0.68, t));
    if (p.y < 0.082) c = mix(c, "#3c474d", smoothstep(0.082, 0.073, p.y));
    if (n.y > 0.55 && p.y > 0.08 && noise(p, 0.01, 21) > 0.47)
      return mix(c, mix("#7da34a", "#9cbf5a", noise(p, 0.006, 4)), 0.85);
    return c;
  });
  const islandPaint = paint((p, n) => {
    const grassLine = 0.1 + 0.012 * (noise(p, 0.02, 2) - 0.5);
    if (n.y > 0.6 && p.y > grassLine) {
      let c = mix("#5c9b3d", "#95c75c", smoothstep(0.3, 0.7, noise(p, 0.018, 4)));
      if (noise(p, 0.03, 6) > 0.7) c = mix(c, "#b89c6a", 0.7);
      return c;
    }
    return rockPaint;
  });
  const lands: { x: number; z: number; r: number }[] = [{ x: 0, z: 0, r: 0.166 }];
  const waterPaint = paint((p, n) => {
    if (n.y < 0.5) return mix("#0d6582", "#3ac8cc", smoothstep(0.058, 0.075, p.y));
    let d = Infinity;
    for (const l of lands) d = Math.min(d, Math.hypot(p.x - l.x, p.z - l.z) - l.r);
    const edge = 0.003 + 0.009 * noise(p, 0.01, 3);
    if (d < edge) return mix("#ffffff", "#dcf8f2", smoothstep(edge * 0.5, edge, d));
    const ring = d - (0.017 + 0.008 * noise(p, 0.02, 5));
    if (Math.abs(ring) < 0.0022 && noise(p, 0.012, 8) > 0.47) return "#d8f7f1";
    let c = mix("#74e6d4", "#2fc0c8", smoothstep(0.0, 0.05, d));
    c = mix(c, "#168aa8", smoothstep(0.05, 0.13, d));
    const w = Math.sin((p.x * 0.6 + p.z) * 95 + noise(p, 0.03, 9) * 9);
    if (w > 0.9 && noise(p, 0.035, 13) > 0.52) c = mix(c, "#c4f4ee", 0.55);
    const rim = Math.hypot(p.x, p.z);
    if (rim > 0.272) c = mix(c, "#0f6f8c", smoothstep(0.272, 0.285, rim) * 0.45);
    return c;
  });

  // ---------------- display base ----------------
  const wood = grain("#8d5c35", "#6a4126", { size: 0.006, axis: "x", seed: 3 });
  const basePaint = paint((p) => (p.y < 0.004 ? "#2e1d12" : wood));
  const basePart = b.lathe(
    [[0, 0], [0.3, 0], [0.306, 0.006], [0.306, 0.048], [0.298, 0.056], [0.29, 0.06], [0, 0.06]],
    { color: basePaint, at: [0, 0, 0], segments: 40 },
  );
  b.part(new THREE.TorusGeometry(0.2875, 0.0022, 6, 72), BRASS, { at: [0, 0.0605, 0], rotation: [90, 0, 0] });
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60"><rect x="2" y="2" width="256" height="56" rx="9" fill="#c9a24a" stroke="#6e5018" stroke-width="4"/><rect x="10" y="10" width="240" height="40" rx="6" fill="#d8b562" stroke="#8a6a2a" stroke-width="2"/><text x="130" y="38" font-family="Georgia, serif" font-size="19" font-weight="bold" fill="#3b2a10" text-anchor="middle" letter-spacing="2">GULL ROCK LIGHT · 1887</text></svg>`,
    { size: 512 },
  );
  b.decal(basePart, plaque, { at: [0, 0.028, 0.306], dir: [0, 0, 1], size: [0.13, 0.03] });

  // ---------------- water ----------------
  b.part(new THREE.CylinderGeometry(0.285, 0.285, 0.017, 64, 1), waterPaint, { at: [0, 0.0665, 0] });

  // ---------------- island ----------------
  const islandPart = b.lathe(
    [[0, 0.06], [0.17, 0.06], [0.168, 0.08], [0.15, 0.098], [0.125, 0.11], [0.06, 0.116], [0, 0.118]],
    { color: islandPaint, at: [0, 0, 0], segments: 11, spin: 7 },
  );
  const tx = -0.055;
  const tz = -0.045;
  const outcrop = b.lathe(
    [[0, 0.09], [0.075, 0.09], [0.072, 0.112], [0.06, 0.125], [0.035, 0.13], [0, 0.131]],
    { color: islandPaint, at: [tx, 0, tz], segments: 9, spin: 12 },
  );
  const islandSurf = b.surface([islandPart, outcrop]);

  const rockGeo = (seed: number) => {
    const g = new THREE.IcosahedronGeometry(1, 0);
    const r = rng(seed);
    const pos = g.getAttribute("position");
    const map = new Map<string, number>();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
      let f = map.get(key);
      if (f === undefined) {
        f = 0.78 + r() * 0.4;
        map.set(key, f);
      }
      pos.setXYZ(i, x * f, y * f, z * f);
    }
    g.computeVertexNormals();
    return g;
  };
  let rockSeed = 100;
  const rock = (x: number, y: number, z: number, s: [number, number, number], foam = true) => {
    b.part(rockGeo(rockSeed++), rockPaint, {
      at: [x, y, z],
      rotation: [(rand() - 0.5) * 24, rand() * 360, (rand() - 0.5) * 24],
      scale: s,
      flat: true,
    });
    if (foam) lands.push({ x, z, r: Math.max(s[0], s[2]) * 0.85 });
  };
  // shoreline ring
  for (let k = 0; k < 28; k++) {
    const ang = (k / 28) * 360 + (rand() - 0.5) * 8;
    if (ang > 0 && ang < 44) continue; // jetty & boat
    const rr = 0.158 + rand() * 0.02;
    const sx = 0.012 + rand() * 0.016;
    const sy = 0.01 + rand() * 0.012;
    const sz = 0.012 + rand() * 0.014;
    rock(Math.sin(ang * DEG) * rr, 0.068 + sy * 0.45, Math.cos(ang * DEG) * rr, [sx, sy, sz]);
  }
  // big boulders under the lighthouse
  for (const [ang, rr, s] of [
    [200, 0.15, 0.03],
    [222, 0.14, 0.036],
    [244, 0.15, 0.032],
    [262, 0.155, 0.026],
    [184, 0.158, 0.024],
  ] as const)
    rock(Math.sin(ang * DEG) * rr, 0.085, Math.cos(ang * DEG) * rr, [s, s * 0.85, s * 0.95]);
  // rocks out in the water
  rock(-0.19, 0.07, 0.11, [0.022, 0.016, 0.02]);
  rock(-0.205, 0.068, 0.085, [0.012, 0.01, 0.012]);
  rock(0.205, 0.069, -0.1, [0.02, 0.014, 0.018]);
  rock(0.17, 0.067, -0.165, [0.012, 0.009, 0.013]);
  rock(-0.11, 0.067, 0.225, [0.011, 0.008, 0.01]);

  // ---------------- lighthouse ----------------
  const TB = 0.155;
  const TT = 0.415;
  b.lathe([[0, 0], [0.056, 0], [0.054, 0.027], [0, 0.027]], {
    color: blocks(["#b3ada3", "#9f998f", "#c2bcb1"], "#76716a", 0.0066, 0.013, (p) => Math.atan2(p.x - tx, p.z - tz) * 0.056),
    at: [tx, 0.128, tz],
    segments: 8,
    spin: 22.5,
  });
  const towerPaint = paint((p) => {
    const band = Math.floor((p.y - TB) / 0.052);
    const red = band % 2 === 0;
    const t = noise(p, 0.02, 7);
    return mix(red ? RED : "#f4f0e6", red ? "#a52a22" : "#d6cebd", smoothstep(0.55, 0.85, t) * 0.6);
  });
  const tower = b.lathe([[0, 0], [0.045, 0], [0.032, TT - TB], [0, TT - TB]], {
    color: towerPaint,
    at: [tx, TB, tz],
    segments: 18,
  });
  const towerSurf = b.surface(tower);
  for (const [az, y] of [
    [30, 0.208],
    [-45, 0.27],
    [15, 0.334],
    [150, 0.3],
    [-130, 0.385],
  ]) {
    const dx = Math.sin(az * DEG);
    const dz = Math.cos(az * DEG);
    const hit = towerSurf.ray([tx + dx * 0.2, y, tz + dz * 0.2], [-dx, 0, -dz]);
    if (!hit) continue;
    b.stick(box(0.014, 0.003, 0.019), WHITE, hit, { embed: 0.5, flow: [0, 1, 0] });
    b.stick(box(0.009, 0.0045, 0.014), "#27303d", hit, { embed: 0.5, flow: [0, 1, 0] });
    b.stick(box(0.016, 0.006, 0.003), WHITE, hit.moved([0, 0, -0.0095]), { embed: 0.4, flow: [0, 1, 0] });
  }
  // door + frame + steps
  const doorOutline: [number, number][] = [
    [-0.009, 0],
    [0.009, 0],
    [0.009, 0.016],
    [0.0064, 0.0215],
    [0, 0.024],
    [-0.0064, 0.0215],
    [-0.009, 0.016],
  ];
  b.extrude(
    doorOutline.map(([x, y]) => [x * 1.35, y * 1.2]),
    { color: WHITE, at: [tx, TB - 0.001, tz + 0.0425], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006 },
  );
  b.extrude(doorOutline, { color: "#22543d", at: [tx, TB, tz + 0.0445], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006 });
  b.part(new THREE.SphereGeometry(0.0012, 6, 4), BRASS, { at: [tx + 0.005, TB + 0.011, tz + 0.048] });
  b.part(box(0.028, 0.03, 0.012), STONE, { at: [tx, 0.13, tz + 0.06] });
  b.part(box(0.03, 0.025, 0.012), STONE_D, { at: [tx, 0.1225, tz + 0.072] });

  // gallery
  b.part(new THREE.CylinderGeometry(0.051, 0.049, 0.007, 24), "#2b2e33", { at: [tx, 0.4185, tz] });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 360;
    b.part(box(0.005, 0.009, 0.007), IRON, {
      at: [tx + Math.sin(a * DEG) * 0.035, 0.4105, tz + Math.cos(a * DEG) * 0.035],
      rotation: [0, a, 0],
    });
  }
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.0009, 0.0009, 0.024, 4), IRON, {
      at: [tx + Math.sin(a) * 0.047, 0.434, tz + Math.cos(a) * 0.047],
    });
  }
  for (const y of [0.4335, 0.446])
    b.part(new THREE.TorusGeometry(0.047, 0.0011, 4, 48), IRON, { at: [tx, y, tz], rotation: [90, 0, 0] });
  // lantern room
  b.part(new THREE.CylinderGeometry(0.031, 0.033, 0.012, 16), RED, { at: [tx, 0.428, tz] });
  const glass = b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.036, 8), "#ffe9a8", { at: [tx, 0.452, tz] });
  glass.mesh.material = glowLamp;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(box(0.0025, 0.036, 0.0025), IRON, { at: [tx + Math.sin(a) * 0.0272, 0.452, tz + Math.cos(a) * 0.0272], rotation: [0, k * 45, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.0298, 0.0298, 0.004, 16), IRON, { at: [tx, 0.471, tz] });
  b.part(new THREE.CylinderGeometry(0.003, 0.038, 0.026, 8), RED, { at: [tx, 0.486, tz], flat: true });
  b.part(new THREE.SphereGeometry(0.0055, 8, 6), IRON, { at: [tx, 0.5, tz] });
  b.part(new THREE.CylinderGeometry(0.0008, 0.0008, 0.024, 4), IRON, { at: [tx, 0.514, tz] });
  b.part(box(0.019, 0.0014, 0.0014), BRASS, { at: [tx, 0.519, tz], rotation: [0, 30, 0] });
  b.part(new THREE.ConeGeometry(0.0024, 0.005, 4), BRASS, {
    at: [tx + Math.cos(30 * DEG) * 0.011, 0.519, tz - Math.sin(30 * DEG) * 0.011],
    dir: [Math.cos(30 * DEG), 0, -Math.sin(30 * DEG)],
  });
  b.part(box(0.0012, 0.005, 0.006), BRASS, {
    at: [tx - Math.cos(30 * DEG) * 0.009, 0.519, tz + Math.sin(30 * DEG) * 0.009],
    rotation: [0, 120, 0],
  });

  // ---------------- keeper's cottage ----------------
  const CY = 15;
  const C: [number, number, number] = [0.068, 0.113, -0.028];
  const home = b.region({ at: C, quat: new THREE.Quaternion().setFromAxisAngle(UP, CY * DEG) });
  const ridgeDir = home.d([0, 0, 1]);
  const wallPaint = paint((p) => {
    let c = mix("#f4ede0", "#e0d3bd", smoothstep(0.35, 0.75, noise(p, 0.012, 31)));
    if (p.y < C[1] + 0.016) c = mix(c, "#c9bba1", smoothstep(C[1] + 0.016, C[1] + 0.008, p.y));
    return c;
  });
  const roofPaint = paint((p, n) => {
    if (Math.abs(n.dot(ridgeDir)) > 0.7) return wallPaint;
    const rowH = 0.0058;
    const r = Math.floor(p.y / rowH);
    const fy = p.y / rowH - r;
    const along = p.dot(ridgeDir) / 0.0085 + (r % 2) * 0.5;
    const c = Math.floor(along);
    if (fy < 0.16 || along - c < 0.07) return "#2a303a";
    return mix("#5a6780", "#3c475a", hash2(r, c));
  });
  const brickPaint = blocks(["#a4553a", "#8f4632", "#b8664a"], "#d8cfc0", 0.0042, 0.008, (p) => p.x + p.z);

  home.part(box(0.106, 0.018, 0.076), blocks(["#aca69c", "#968f85", "#bdb7ac"], "#6f6a63", 0.006, 0.011, (p) => p.x + p.z), {
    at: [0, -0.001, 0],
  });
  home.part(box(0.1, 0.06, 0.07), wallPaint, { at: [0, 0.038, 0] });
  b.extrude(
    [[-0.062, -0.001], [0.062, -0.001], [0, 0.046]],
    { color: roofPaint, at: home.p([0, 0.068, 0]), x: home.d([1, 0, 0]), y: home.d([0, 1, 0]), thickness: 0.088, bevel: 0.0012 },
  );
  home.part(box(0.0065, 0.0065, 0.092), "#2a303a", { at: [0, 0.1135, 0], rotation: [0, 0, 45] });
  for (const zz of [0.0448, -0.0448])
    for (const side of [-1, 1])
      home.part(box(0.08, 0.0045, 0.003), WHITE, { at: [side * 0.031, 0.0918, zz], rotation: [0, 0, -side * 36.5] });
  // crooked chimney + smoke
  home.part(box(0.017, 0.034, 0.017), brickPaint, { at: [0.03, 0.1, -0.012], rotation: [3, 0, 5] });
  home.part(box(0.016, 0.018, 0.016), brickPaint, { at: [0.0315, 0.123, -0.0115], rotation: [-4, 0, -7] });
  home.part(box(0.021, 0.004, 0.021), STONE_D, { at: [0.0302, 0.1335, -0.011], rotation: [-4, 0, -7] });
  home.part(new THREE.CylinderGeometry(0.003, 0.0036, 0.009, 8), "#c4643a", { at: [0.027, 0.139, -0.014] });
  home.part(new THREE.CylinderGeometry(0.0028, 0.0034, 0.007, 8), "#c4643a", { at: [0.034, 0.138, -0.008] });
  for (const [x, y, z, r] of [
    [0.027, 0.148, -0.015, 0.0055],
    [0.023, 0.157, -0.021, 0.007],
    [0.016, 0.167, -0.029, 0.0085],
    [0.008, 0.176, -0.037, 0.0065],
  ])
    home.part(new THREE.IcosahedronGeometry(1, 0), "#ebe9e4", { at: [x, y, z], scale: r, rotation: [x * 900, y * 700, 0], flat: true });
  // door
  home.part(box(0.025, 0.039, 0.003), WHITE, { at: [-0.018, 0.0275, 0.0355] });
  home.part(box(0.02, 0.035, 0.004), DOOR_BLUE, { at: [-0.018, 0.0255, 0.0365] });
  for (const dx of [-0.0045, 0.0045]) home.part(box(0.007, 0.011, 0.001), "#24529a", { at: [-0.018 + dx, 0.0185, 0.0387] });
  const dwin = home.part(box(0.013, 0.006, 0.001), "#ffe2a6", { at: [-0.018, 0.036, 0.0387] });
  dwin.mesh.material = glowWin;
  home.part(new THREE.SphereGeometry(0.0013, 6, 4), BRASS, { at: [-0.0115, 0.025, 0.0392] });
  home.part(box(0.03, 0.01, 0.014), STONE, { at: [-0.018, 0.001, 0.043] });
  home.part(box(0.002, 0.002, 0.006), IRON, { at: [-0.0015, 0.044, 0.038] });
  const wl = home.part(new THREE.SphereGeometry(0.0026, 8, 6), "#fff2c4", { at: [-0.0015, 0.0425, 0.0412] });
  wl.mesh.material = glowLamp;
  home.part(new THREE.ConeGeometry(0.0035, 0.003, 6), IRON, { at: [-0.0015, 0.0458, 0.0412] });
  // windows
  const window = (x0: number, z0: number, yaw: number, flowers: boolean) => {
    const c = Math.cos(yaw * DEG);
    const s = Math.sin(yaw * DEG);
    const loc = (dx: number, dy: number, dz: number): [number, number, number] => [x0 + dx * c + dz * s, 0.042 + dy, z0 - dx * s + dz * c];
    const rot: [number, number, number] = [0, yaw, 0];
    home.part(box(0.021, 0.023, 0.003), WHITE, { at: loc(0, 0, 0.0005), rotation: rot });
    const g = home.part(box(0.016, 0.018, 0.003), "#ffe2a6", { at: loc(0, 0, 0.0012), rotation: rot });
    g.mesh.material = glowWin;
    home.part(box(0.0016, 0.018, 0.0012), WHITE, { at: loc(0, 0, 0.0032), rotation: rot });
    home.part(box(0.016, 0.0016, 0.0012), WHITE, { at: loc(0, 0, 0.0032), rotation: rot });
    for (const sx of [-1, 1]) home.part(box(0.0075, 0.021, 0.0016), DOOR_BLUE, { at: loc(sx * 0.0145, 0, 0.0012), rotation: rot });
    home.part(box(0.024, 0.0025, 0.005), WHITE, { at: loc(0, -0.0125, 0.002), rotation: rot });
    if (flowers) {
      home.part(box(0.02, 0.005, 0.006), WOOD, { at: loc(0, -0.0165, 0.0035), rotation: rot });
      const fc = ["#ff6fa8", "#ffd23f", "#e8443a", "#ffffff", "#ff6fa8"];
      fc.forEach((col, i) =>
        home.part(new THREE.IcosahedronGeometry(0.0021, 0), col, { at: loc(-0.008 + i * 0.004, -0.0128, 0.0035 + (i % 2) * 0.0012), flat: true }),
      );
      for (let i = 0; i < 4; i++)
        home.part(new THREE.IcosahedronGeometry(0.0018, 0), "#5f9e36", { at: loc(-0.006 + i * 0.004, -0.0135, 0.0052), flat: true });
    }
  };
  window(0.022, 0.035, 0, true);
  window(0.05, 0, 90, false);
  window(-0.05, 0, -90, true);
  window(0, -0.035, 180, false);
  // barrel
  b.lathe([[0, 0], [0.0075, 0], [0.0092, 0.008], [0.0075, 0.016], [0, 0.016]], {
    color: WOOD_L,
    at: home.p([0.063, -0.003, 0.028]),
    segments: 10,
  });
  for (const y of [0.001, 0.010]) home.part(new THREE.TorusGeometry(0.0088, 0.0008, 4, 16), IRON, { at: [0.063, y, 0.028], rotation: [90, 0, 0] });

  // ---------------- jetty ----------------
  const S = new THREE.Vector3(0.035, 0, 0.145);
  const D = new THREE.Vector3(0.29, 0, 0.957).normalize();
  const SIDE = new THREE.Vector3(D.z, 0, -D.x);
  const JL = 0.118;
  const jp = (t: number, off: number, y: number) => S.clone().addScaledVector(D, t).addScaledVector(SIDE, off).setY(y);
  const QJ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(SIDE, UP, D));
  const woods = [WOOD, WOOD_L, "#9c6a3c"];
  for (let i = 0; i < 12; i++) {
    const t = ((i + 0.5) * JL) / 12;
    const quat = QJ.clone().multiply(
      new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.05, (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.04)),
    );
    b.part(box(0.042 + (rand() - 0.5) * 0.004, 0.0035, (JL / 12) * 0.86), woods[Math.floor(rand() * 3)], {
      at: jp(t, (rand() - 0.5) * 0.002, 0.0985),
      quat,
    });
  }
  for (const off of [-0.015, 0.015]) b.part(box(0.004, 0.005, JL), WOOD_D, { at: jp(JL / 2, off, 0.0945), quat: QJ });
  for (const t of [0.3 * JL, 0.65 * JL, JL - 0.002])
    for (const off of [-0.022, 0.022]) {
      const top = t > 0.9 * JL ? 0.111 : 0.104;
      b.part(new THREE.CylinderGeometry(0.0034, 0.0038, top - 0.058, 7), WOOD_D, { at: jp(t, off, (top + 0.058) / 2) });
      const pp = jp(t, off, 0);
      lands.push({ x: pp.x, z: pp.z, r: 0.004 });
    }
  // lifebuoy
  for (let k = 0; k < 4; k++) {
    const g = new THREE.TorusGeometry(0.0062, 0.0017, 5, 6, Math.PI / 2);
    g.rotateZ((k * Math.PI) / 2);
    b.part(g, k % 2 ? WHITE : RED, { at: jp(0.3 * JL, -0.022 - 0.0058, 0.09), dir: SIDE.clone().negate(), axis: "z" });
  }
  // jetty lamp
  b.part(box(0.006, 0.002, 0.006), IRON, { at: jp(JL - 0.002, 0.022, 0.112) });
  const jl = b.part(new THREE.CylinderGeometry(0.0025, 0.0025, 0.006, 6), "#fff2c4", { at: jp(JL - 0.002, 0.022, 0.116) });
  jl.mesh.material = glowLamp;
  b.part(new THREE.ConeGeometry(0.0045, 0.004, 6), IRON, { at: jp(JL - 0.002, 0.022, 0.121) });
  // crates & rope coil
  b.part(box(0.014, 0.012, 0.014), "#9b6b3c", {
    at: jp(0.012, -0.008, 0.1063),
    quat: QJ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(UP, 10 * DEG)),
  });
  b.part(box(0.012, 0.01, 0.012), "#7d5531", {
    at: jp(0.012, -0.008, 0.1173),
    quat: QJ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(UP, -18 * DEG)),
  });
  b.part(new THREE.TorusGeometry(0.0048, 0.0014, 5, 14), ROPE, { at: jp(0.03, 0.011, 0.1018), rotation: [90, 0, 0] });

  // ---------------- rowboat ----------------
  const mid = S.clone().addScaledVector(D, 0.069).addScaledVector(SIDE, 0.047).setY(WATER_Y);
  const bp = (along: number, x: number, y: number) => mid.clone().addScaledVector(D, along).addScaledVector(SIDE, x).addScaledVector(UP, y);
  const LB = 0.085;
  const hw = (u: number) => 0.018 * Math.pow(Math.max(Math.sin(Math.PI * u), 0), u < 0.5 ? 0.42 : 0.7);
  const hd = (u: number) => 0.022 * (0.35 + 0.65 * Math.sqrt(Math.max(Math.sin(Math.PI * u), 0)));
  const hg = (u: number) => 0.01 + 0.007 * (2 * u - 1) ** 2;
  const NU = 18;
  const NA = 10;
  const hullPt = (i: number, j: number, k: number) => {
    const u = i / NU;
    const a = -Math.PI / 2 + (Math.PI * j) / NA;
    return bp((u - 0.5) * LB, k * hw(u) * Math.sin(a), hg(u) - k * hd(u) * Math.cos(a));
  };
  const meshOf = (pos: number[], idx: number[], color: string) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const part = b.part(g, color);
    part.mesh.material = dbl(color);
  };
  const hullBand = (k: number, j0: number, j1: number, color: string) => {
    const pos: number[] = [];
    const idx: number[] = [];
    const cols = j1 - j0 + 1;
    for (let i = 0; i <= NU; i++) for (let j = j0; j <= j1; j++) pos.push(...hullPt(i, j, k).toArray());
    for (let i = 0; i < NU; i++)
      for (let jj = 0; jj < cols - 1; jj++) {
        const a = i * cols + jj;
        const c = (i + 1) * cols + jj;
        idx.push(a, c + 1, c, a, a + 1, c + 1);
      }
    meshOf(pos, idx, color);
  };
  hullBand(1, 0, 2, WHITE);
  hullBand(1, 8, 10, WHITE);
  hullBand(1, 2, 4, "#f0b429");
  hullBand(1, 6, 8, "#f0b429");
  hullBand(1, 4, 6, "#8e2f2a");
  hullBand(0.85, 0, NA, "#b98552");
  {
    const pos: number[] = [];
    const idx: number[] = [];
    for (const j of [0, NA]) {
      const base = pos.length / 3;
      for (let i = 0; i <= NU; i++) {
        pos.push(...hullPt(i, j, 1).toArray());
        pos.push(...hullPt(i, j, 0.85).toArray());
      }
      for (let i = 0; i < NU; i++) {
        const a = base + i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    meshOf(pos, idx, WOOD_D);
  }
  {
    const fr: THREE.Vector3[] = [];
    const fl: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const c = (hg(u) - 0.005) / (0.85 * hd(u));
      if (c >= 1) continue;
      const x = 0.85 * hw(u) * Math.sqrt(1 - c * c) - 0.0005;
      if (x < 0.001) continue;
      fr.push(bp((u - 0.5) * LB, x, 0.005));
      fl.push(bp((u - 0.5) * LB, -x, 0.005));
    }
    if (fr.length >= 2) b.slab([...fr, ...fl.reverse()], { color: "#a0703f", thickness: 0.0015 });
  }
  for (const u of [0.3, 0.62]) {
    const y = hg(u) - 0.004;
    const c = Math.min(0.004 / (0.85 * hd(u)), 0.99);
    const half = 0.85 * hw(u) * Math.sqrt(1 - c * c);
    b.part(box(2 * half, 0.0018, 0.008), WOOD_L, { at: bp((u - 0.5) * LB, 0, y), quat: QJ });
  }
  for (const sx of [-1, 1]) {
    b.rod(bp(-0.03, sx * 0.007, 0.0085), bp(0.024, sx * 0.004, 0.0112), 0.0011, { color: WOOD_L, sides: 5 });
    b.part(box(0.0055, 0.0012, 0.016), WOOD_L, { at: bp(0.031, sx * 0.0035, 0.0116), quat: QJ });
  }
  for (const [a, r] of [
    [-0.028, 0.014],
    [0, 0.019],
    [0.028, 0.013],
  ]) {
    const p = bp(a, 0, 0);
    lands.push({ x: p.x, z: p.z, r });
  }
  const postTop = jp(0.65 * JL, 0.022, 0.1);
  const bow = bp(0.041, 0, hg(0.98));
  const sag = postTop.clone().lerp(bow, 0.5);
  sag.y -= 0.008;
  b.sweep(catmull([postTop, sag, bow]), 0.0007, { color: ROPE, caps: "flat", sides: 4 });
  b.part(new THREE.TorusGeometry(0.0035, 0.0009, 4, 10), ROPE, { at: [postTop.x, postTop.y, postTop.z], rotation: [90, 0, 0] });

  // ---------------- seagulls ----------------
  const gull = (at: THREE.Vector3, yaw: number, flying: boolean) => {
    const g = b.region({ at, quat: new THREE.Quaternion().setFromAxisAngle(UP, yaw * DEG) });
    const ball = () => new THREE.SphereGeometry(1, 10, 7);
    const y0 = flying ? 0 : 0.0085;
    g.part(ball(), GULL_W, { at: [0, y0, 0], scale: [0.0062, 0.0066, 0.0135], rotation: [flying ? 0 : -12, 0, 0] });
    g.part(ball(), GULL_W, { at: [0, y0 + 0.008, 0.0105], scale: 0.0052 });
    g.part(new THREE.ConeGeometry(0.0016, 0.0065, 6), BEAK, { at: [0, y0 + 0.0072, 0.0175], rotation: [90, 0, 0] });
    g.part(new THREE.SphereGeometry(0.0006, 4, 3), "#d23a2a", { at: [0, y0 + 0.0062, 0.0172] });
    for (const sx of [-1, 1]) g.part(new THREE.SphereGeometry(0.0009, 6, 4), BLACK, { at: [sx * 0.0042, y0 + 0.0095, 0.0132] });
    g.part(new THREE.ConeGeometry(0.0042, 0.009, 4), GULL_W, { at: [0, y0 + (flying ? 0 : 0.0015), -0.0165], rotation: [-90, 0, 0], scale: [1, 1, 0.4] });
    if (flying) {
      const wing = [[0, -0.006], [0.011, -0.006], [0.023, -0.002], [0.036, 0.007], [0.033, 0.011], [0.02, 0.008], [0.008, 0.009], [0, 0.009]];
      const tip = [[0.027, 0.001], [0.0365, 0.007], [0.0335, 0.0115], [0.026, 0.0075]];
      for (const sx of [1, -1]) {
        const opts = { at: g.p([sx * 0.003, 0.002, 0.002]), x: g.d([sx, 0.32, 0]), y: g.d([0, 0, -1]) };
        b.extrude(wing, { ...opts, color: GULL_G, thickness: 0.0013 });
        b.extrude(tip, { ...opts, color: BLACK, thickness: 0.0019 });
      }
    } else {
      g.part(ball(), GULL_G, { at: [0, y0 + 0.0028, -0.002], scale: [0.0066, 0.0042, 0.0125], rotation: [-12, 0, 0] });
      g.part(new THREE.ConeGeometry(0.004, 0.011, 4), BLACK, { at: [0, y0 + 0.003, -0.0165], rotation: [-100, 0, 0], scale: [1, 1, 0.35] });
      for (const sx of [-1, 1]) {
        g.part(new THREE.CylinderGeometry(0.0005, 0.0005, 0.004, 4), LEG, { at: [sx * 0.0022, 0.002, 0.001] });
        g.part(box(0.002, 0.0006, 0.003), LEG, { at: [sx * 0.0022, 0.0003, 0.0025] });
      }
    }
  };
  gull(jp(JL - 0.002, -0.022, 0.111), Math.atan2(D.x, D.z) / DEG + 55, false);
  const fly = new THREE.Vector3(-0.175, 0.255, 0.085);
  b.rod([-0.19, 0.082, 0.11], [fly.x, fly.y, fly.z], 0.0006, { color: "#9b9b9b", sides: 4 });
  gull(fly, 115, true);

  // ---------------- paths, grass, flowers ----------------
  const stones: THREE.Vector3[] = [];
  const placeStone = (x: number, z: number) => {
    const hit = islandSurf.ray([x, 0.4, z], [0, -1, 0]);
    if (!hit) return;
    stones.push(hit.at);
    b.stick(new THREE.CylinderGeometry(0.0075, 0.0085, 0.003, 6), STONE, hit, { embed: 0.55, spin: rand() * 60, scale: 0.8 + rand() * 0.4 });
  };
  const doorFront = home.p([-0.018, 0, 0.058]);
  const jetStart = S.clone().addScaledVector(D, -0.006);
  const ctrl = new THREE.Vector3(0.02, 0, 0.07);
  for (let k = 0; k < 6; k++) {
    const t = (k + 0.5) / 6;
    const p = doorFront.clone().multiplyScalar((1 - t) ** 2).addScaledVector(ctrl, 2 * t * (1 - t)).addScaledVector(jetStart, t * t);
    placeStone(p.x, p.z);
  }
  const lhFront = new THREE.Vector3(tx + 0.004, 0, tz + 0.088);
  for (let k = 0; k < 4; k++) {
    const t = (k + 0.5) / 4;
    const p = lhFront.clone().lerp(new THREE.Vector3(0.012, 0, 0.068), t);
    placeStone(p.x + (rand() - 0.5) * 0.004, p.z);
  }
  for (const [x, z, s] of [
    [-0.1, 0.07, 0.009],
    [0.115, 0.06, 0.008],
    [-0.02, -0.12, 0.01],
  ]) {
    const hit = islandSurf.ray([x, 0.4, z], [0, -1, 0]);
    if (hit) rock(x, hit.at.y + s * 0.3, z, [s * 1.2, s, s], false);
  }

  const ccs = Math.cos(CY * DEG);
  const css = Math.sin(CY * DEG);
  const keepOut = (p: THREE.Vector3) => {
    if (Math.hypot(p.x - tx, p.z - tz) < 0.066) return true;
    const dx = p.x - C[0];
    const dz = p.z - C[2];
    const lx = dx * ccs - dz * css;
    const lz = dx * css + dz * ccs;
    if (Math.abs(lx) < 0.075 && Math.abs(lz) < 0.05) return true;
    if (stones.some((s) => Math.hypot(p.x - s.x, p.z - s.z) < 0.011)) return true;
    return Math.hypot(p.x - S.x, p.z - S.z) < 0.022;
  };
  const filter = (hit: { n: THREE.Vector3; at: THREE.Vector3 }) => hit.n.y > 0.8 && hit.at.y > 0.101;
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M30 64 C29 44 24 24 16 4 C27 22 32 42 34 64 Z" fill="#ffffff"/><path d="M31 64 C35 40 42 22 54 8 C44 26 38 44 36 64 Z" fill="#e4e4e4"/><path d="M29 64 C25 50 18 40 6 32 C20 38 28 48 33 64 Z" fill="#cfcfcf"/><path d="M33 64 C40 52 48 46 60 42 C48 50 40 56 37 64 Z" fill="#f0f0f0"/></svg>`,
    { size: 128 },
  );
  const flower = (petal: string, center: string) => {
    let petals = "";
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      petals += `<circle cx="${(32 + Math.cos(a) * 7).toFixed(1)}" cy="${(16 + Math.sin(a) * 7).toFixed(1)}" r="5.2" fill="${petal}"/>`;
    }
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 64 C31 50 33 38 32 22" stroke="#4e8a2c" stroke-width="3.5" fill="none"/><path d="M32 50 C24 44 20 46 15 40 C24 38 29 42 32 48 Z" fill="#5f9e36"/><path d="M32 42 C40 36 44 38 50 32 C41 30 35 34 32 40 Z" fill="#5f9e36"/>${petals}<circle cx="32" cy="16" r="4.5" fill="${center}"/></svg>`,
      { size: 128 },
    );
  };
  const grassHits = islandSurf.scatter(80, { rng: rng(11), minDist: 0.009, keepOut, filter });
  const half = Math.floor(grassHits.length / 2);
  b.cards(grassHits.slice(0, half), grassTex, { size: [0.024, 0.02], cross: true, color: "#5f9e36", vary: 0.35, spin: 180, lean: 8, rng: rng(5), name: "grassA" });
  b.cards(grassHits.slice(half), grassTex, { size: [0.022, 0.024], cross: true, color: "#8cc152", vary: 0.35, spin: 180, lean: 10, rng: rng(6), name: "grassB" });
  const flowerHits = islandSurf.scatter(38, { rng: rng(23), minDist: 0.012, keepOut, filter });
  b.cards(
    flowerHits,
    [flower("#ffffff", "#f5c518"), flower("#ff8fbf", "#d94f8a"), flower("#ffd23f", "#e88a1a"), flower("#ff8fbf", "#d94f8a")],
    { size: [0.014, 0.021], cross: true, vary: 0.3, spin: 180, lean: 6, rng: rng(9), name: "flowers" },
  );

  // ---------------- finish ----------------
  const root = b.root;
  const light = new THREE.PointLight("#ffcf6e", 0.25, 0.9, 2);
  light.position.set(tx, 0.452, tz);
  root.add(light);
  return root;
}
```