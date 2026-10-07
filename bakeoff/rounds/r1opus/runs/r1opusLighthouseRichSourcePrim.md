```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, grain, mottle, svg, frame, rng, catmull, DEG, Paint } from "agentic-3js-builder";

export const meta = {
  name: "Beacon Isle Lighthouse Diorama",
  description:
    "A cozy tabletop diorama: a red-and-white striped lighthouse with a glowing lantern and iron gallery, a keeper's cottage with a crooked chimney and blue door, a plank jetty with a tied rowboat, seagulls, grass and wildflowers on a rocky island, set in turquoise resin water with foam on a round walnut base.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lighthouseDiorama", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(42);
  const Y = new THREE.Vector3(0, 1, 0);

  const C = {
    WOOD_D: "#5a3a22", WOOD_L: "#6e4a2c", WOOD_M: "#8a5d38", PLANK1: "#a77b4f", PLANK2: "#93683f", PLANK3: "#b48a5a",
    POST: "#6b4a2e", BRASS: "#c9a24a", ROCK1: "#8a8f96", ROCK2: "#6f747c", ROCK3: "#9c978c", ROCK4: "#7a746c",
    STONE: "#b9b3a7", STONE_D: "#8e887d", RED: "#c8322b", WHITE: "#f4f1ea", IRON: "#1d1f22", NAVY: "#22324a",
    CREAM: "#f3e9d2", BLUE: "#2f6db5", GOLD: "#e0b04a", SLATE: "#4b5a68", SLATE_D: "#36424d", BRICK: "#9c4a32",
    TERRA: "#c0683e", SMOKE: "#e6e8ea", SMOKE2: "#d3d7db", FOAM: "#ffffff", RIPPLE: "#9be8df", GREEN: "#5d9c3f",
    GREEN_D: "#3f7a2c", ORANGE: "#f2a12c", GULL_G: "#b9c2cb", BLACK: "#151515", ROPE: "#d9c08a", PINK: "#f27fa5",
    YELLOW: "#f5c518", LILAC: "#a98ae0", GLOW: "#ffd866",
  };

  const glowLamp = new THREE.MeshStandardMaterial({ color: "#ffe28a", emissive: "#ffcc4d", emissiveIntensity: 1.6, roughness: 0.3 });
  const glowWarm = new THREE.MeshStandardMaterial({ color: "#ffd27a", emissive: "#ffb347", emissiveIntensity: 1.1, roughness: 0.4 });

  const P = (geo: THREE.BufferGeometry, color: string | Paint, at: V, rotation: V = [0, 0, 0], scale?: number | V, flat = false) =>
    b.part(geo, color, { at, rotation, scale, flat });

  // ---------------- Display base ----------------
  const wood = grain(C.WOOD_D, C.WOOD_L, { size: 0.006, axis: "x" });
  P(new THREE.CylinderGeometry(0.335, 0.345, 0.03, 40), wood, [0, 0.015, 0]);
  P(new THREE.TorusGeometry(0.336, 0.004, 6, 48), C.BRASS, [0, 0.03, 0], [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.318, 0.325, 0.028, 40), wood, [0, 0.044, 0]);

  const plaqueTex = svg(
    `<svg viewBox="0 0 260 52" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="260" height="52" rx="6" fill="#c9a24a"/><rect x="5" y="5" width="250" height="42" rx="4" fill="none" stroke="#7a5a1c" stroke-width="3"/><circle cx="16" cy="26" r="3" fill="#7a5a1c"/><circle cx="244" cy="26" r="3" fill="#7a5a1c"/><text x="130" y="35" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#4a3410" text-anchor="middle" letter-spacing="3">BEACON ISLE</text></svg>`,
    { size: 512 },
  );
  b.part(new THREE.BoxGeometry(0.13, 0.026, 0.003), "#ffffff", { at: [0, 0.015, 0.3415], rotation: [18, 0, 0], texture: plaqueTex });

  // ---------------- Water ----------------
  const water = paint((p, n) => {
    if (n.y < 0.5) return mix("#0f6f7c", "#2bb8b4", smoothstep(0.056, 0.08, p.y));
    const d = Math.hypot(p.x, p.z);
    const w = noise(p, 0.035, 4);
    const shore = 0.2 + (w - 0.5) * 0.05;
    const foam = smoothstep(shore + 0.024, shore + 0.004, d);
    const base = mix("#45d6c9", "#138a98", smoothstep(0.17, 0.3, d + (w - 0.5) * 0.03));
    const ring = 0.5 + 0.5 * Math.sin(d * 150 + w * 8);
    const c = mix(base, "#b9f2ea", smoothstep(0.9, 0.98, ring) * 0.55);
    return mix(c, "#ffffff", foam);
  });
  P(new THREE.CylinderGeometry(0.305, 0.305, 0.024, 48, 1), water, [0, 0.068, 0]);
  P(new THREE.TorusGeometry(0.306, 0.004, 5, 48), C.WOOD_M, [0, 0.058, 0], [90, 0, 0]);

  // ripples
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.23 + R() * 0.06;
    P(new THREE.TorusGeometry(0.016 + R() * 0.01, 0.0014, 3, 10, 1.3), C.RIPPLE, [Math.sin(a) * r, 0.0802, Math.cos(a) * r], [-90, 0, R() * 360], [1, 1, 0.5]);
  }

  // ---------------- Island ----------------
  const rockPaint = mottle(C.ROCK1, C.ROCK2, { size: 0.03 });
  const grassPaint = mottle("#6aa84f", "#4f8a3c", { size: 0.025, seed: 2 });
  const mound = b.lathe(
    [[0, 0.07], [0.2, 0.07], [0.185, 0.1], [0.16, 0.13], [0.14, 0.145], [0, 0.145]],
    { color: rockPaint, at: [0, 0, 0], segments: 10 },
  );
  const grass = P(new THREE.CylinderGeometry(0.145, 0.155, 0.02, 14), grassPaint, [0, 0.15, 0]);
  const groundParts: any[] = [mound, grass];
  for (const [x, z, s] of [[-0.09, 0.06, 0.05], [0.0, -0.11, 0.045], [0.1, -0.07, 0.04]] as const) {
    groundParts.push(P(new THREE.SphereGeometry(s, 8, 5), grassPaint, [x, 0.158, z], [0, R() * 90, 0], [1, 0.3, 1]));
  }
  const rockColors = [C.ROCK1, C.ROCK2, C.ROCK3, C.ROCK4];
  for (let i = 0; i < 26; i++) {
    const aDeg = (i / 26) * 360 + (R() - 0.5) * 10;
    if (aDeg > 16 && aDeg < 46) continue;
    const a = aDeg * DEG;
    const rad = 0.15 + R() * 0.05;
    const r = 0.02 + R() * 0.025;
    const y = 0.085 + R() * 0.04;
    groundParts.push(
      P(new THREE.DodecahedronGeometry(r, 0), rockColors[Math.floor(R() * 4)], [Math.sin(a) * rad, y, Math.cos(a) * rad],
        [R() * 360, R() * 360, R() * 360], [1, 0.6 + R() * 0.4, 1], true),
    );
  }
  // sea stacks with foam
  const seaRocks: V[] = [[-0.24, 0.075, 0.05], [-0.2, 0.075, -0.17], [0.05, 0.075, -0.26], [0.22, 0.075, -0.12], [-0.08, 0.075, 0.25], [0.25, 0.075, 0.04]];
  for (const pos of seaRocks) {
    const r = 0.014 + R() * 0.014;
    P(new THREE.DodecahedronGeometry(r, 0), rockColors[Math.floor(R() * 4)], pos, [R() * 360, R() * 360, 0], [1, 0.8, 1], true);
    for (let k = 0; k < 3; k++) {
      const a = R() * Math.PI * 2;
      P(new THREE.SphereGeometry(1, 6, 4), C.FOAM, [pos[0] + Math.sin(a) * r * 1.1, 0.0805, pos[2] + Math.cos(a) * r * 1.1], [0, R() * 180, 0], [0.008, 0.002, 0.005]);
    }
  }
  // foam blobs around island
  for (let i = 0; i < 38; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.19 + R() * 0.028;
    const s = 0.7 + R() * 0.6;
    P(new THREE.SphereGeometry(1, 6, 4), C.FOAM, [Math.sin(a) * rad, 0.0805, Math.cos(a) * rad], [0, R() * 180, 0], [0.012 * s, 0.003, 0.008 * s]);
  }

  // ---------------- Lighthouse ----------------
  const LX = -0.045, LZ = -0.035, G = 0.16;
  P(new THREE.CylinderGeometry(0.062, 0.068, 0.022, 8), C.STONE, [LX, G + 0.011, LZ], [0, 22.5, 0], undefined, true);
  P(new THREE.CylinderGeometry(0.056, 0.062, 0.006, 8), C.STONE_D, [LX, G + 0.025, LZ], [0, 22.5, 0], undefined, true);
  const stripes = paint((p) => {
    const k = Math.floor((p.y - 0.188) / 0.052);
    return ((k % 2) + 2) % 2 === 0 ? C.RED : C.WHITE;
  });
  P(new THREE.CylinderGeometry(0.036, 0.05, 0.26, 16, 1), stripes, [LX, 0.318, LZ]);
  const towerR = (y: number) => 0.05 - ((y - 0.188) / 0.26) * 0.014;
  const onTower = (y: number, aDeg: number, out = 0): V => {
    const a = aDeg * DEG;
    const r = towerR(y) + out;
    return [LX + Math.sin(a) * r, y, LZ + Math.cos(a) * r];
  };
  // door
  P(new THREE.BoxGeometry(0.024, 0.038, 0.004), C.WHITE, onTower(0.207, 25, 0.0005), [0, 25, 0]);
  P(new THREE.BoxGeometry(0.019, 0.033, 0.006), C.NAVY, onTower(0.205, 25, 0.001), [0, 25, 0]);
  P(new THREE.BoxGeometry(0.03, 0.006, 0.016), C.STONE, onTower(0.163, 25, 0.008), [0, 25, 0]);
  // windows
  for (const [y, a, lit] of [[0.262, -40, false], [0.33, 60, true], [0.398, -20, false]] as const) {
    P(new THREE.BoxGeometry(0.017, 0.023, 0.004), C.WHITE, onTower(y, a, 0.0), [0, a, 0]);
    const w = P(new THREE.BoxGeometry(0.012, 0.018, 0.005), C.NAVY, onTower(y, a, 0.0005), [0, a, 0]);
    if (lit) w.mesh.material = glowWarm;
    P(new THREE.BoxGeometry(0.02, 0.003, 0.007), C.WHITE, onTower(y - 0.012, a, 0.001), [0, a, 0]);
  }
  // gallery
  const T = 0.448;
  P(new THREE.CylinderGeometry(0.06, 0.054, 0.008, 16), C.IRON, [LX, T + 0.004, LZ]);
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const r = 0.043;
    P(new THREE.BoxGeometry(0.006, 0.014, 0.016), C.IRON, [LX + Math.sin(a * DEG) * r, T - 0.006, LZ + Math.cos(a * DEG) * r], [0, a, 0]);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    P(new THREE.CylinderGeometry(0.0012, 0.0012, 0.026, 4), C.IRON, [LX + Math.sin(a) * 0.056, T + 0.021, LZ + Math.cos(a) * 0.056]);
  }
  P(new THREE.TorusGeometry(0.056, 0.0018, 4, 32), C.IRON, [LX, T + 0.034, LZ], [90, 0, 0]);
  P(new THREE.TorusGeometry(0.056, 0.001, 3, 32), C.IRON, [LX, T + 0.021, LZ], [90, 0, 0]);
  // lantern room
  P(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 8), C.WHITE, [LX, T + 0.014, LZ], [0, 0, 0], undefined, true);
  const glass = P(new THREE.CylinderGeometry(0.03, 0.03, 0.045, 8), C.GLOW, [LX, T + 0.0425, LZ]);
  glass.mesh.material = glowLamp;
  for (let k = 0; k < 8; k++) {
    const a = k * 45;
    P(new THREE.BoxGeometry(0.003, 0.047, 0.003), C.IRON, [LX + Math.sin(a * DEG) * 0.0302, T + 0.0425, LZ + Math.cos(a * DEG) * 0.0302], [0, a, 0]);
  }
  P(new THREE.CylinderGeometry(0.038, 0.038, 0.006, 8), C.RED, [LX, T + 0.068, LZ], [0, 0, 0], undefined, true);
  P(new THREE.ConeGeometry(0.038, 0.035, 8), C.RED, [LX, T + 0.0885, LZ], [0, 0, 0], undefined, true);
  P(new THREE.SphereGeometry(0.006, 8, 6), C.IRON, [LX, T + 0.107, LZ]);
  P(new THREE.CylinderGeometry(0.001, 0.001, 0.024, 4), C.IRON, [LX, T + 0.122, LZ]);
  P(new THREE.BoxGeometry(0.018, 0.004, 0.0008), C.IRON, [LX, T + 0.128, LZ], [0, 35, 0]);
  P(new THREE.ConeGeometry(0.003, 0.006, 4), C.IRON, [LX + 0.0098 * Math.cos(35 * DEG), T + 0.128, LZ - 0.0098 * Math.sin(35 * DEG)], [0, 35, -90]);
  // light beams
  const lamp = new THREE.Vector3(LX, T + 0.0425, LZ);
  const beamMat = new THREE.MeshBasicMaterial({ color: "#fff3b0", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  for (const aDeg of [50, 230]) {
    const d = new THREE.Vector3(Math.sin(aDeg * DEG), -0.08, Math.cos(aDeg * DEG)).normalize();
    const beam = b.part(new THREE.ConeGeometry(0.045, 0.22, 16, 1, true), C.WHITE, { at: lamp.clone().addScaledVector(d, 0.11), dir: d.clone().negate() });
    beam.mesh.material = beamMat;
  }

  // ---------------- Keeper's cottage ----------------
  const CY = -15;
  const cq = new THREE.Quaternion().setFromAxisAngle(Y, CY * DEG);
  const CX = 0.075, CZ = 0.035;
  const cr = b.region({ at: [CX, G, CZ], quat: cq });
  cr.part(new THREE.BoxGeometry(0.099, 0.008, 0.069), C.STONE_D, { at: [0, 0.004, 0] });
  cr.part(new THREE.BoxGeometry(0.095, 0.055, 0.065), C.CREAM, { at: [0, 0.0275, 0] });
  b.extrude([[-0.0475, 0], [0.0475, 0], [0, 0.035]], { color: C.CREAM, at: cr.p([0, 0.055, 0]), x: cr.d([1, 0, 0]), y: cr.d([0, 1, 0]), thickness: 0.065 });
  const shingles = paint((p) => ((p.y / 0.007) % 1 + 1) % 1 < 0.22 ? C.SLATE_D : C.SLATE);
  cr.part(new THREE.BoxGeometry(0.068, 0.006, 0.082), shingles, { at: [0.028, 0.0731, 0], rotation: [0, 0, -36.4] });
  cr.part(new THREE.BoxGeometry(0.068, 0.006, 0.082), shingles, { at: [-0.028, 0.0731, 0], rotation: [0, 0, 36.4] });
  cr.part(new THREE.CylinderGeometry(0.0042, 0.0042, 0.084, 6), C.SLATE_D, { at: [0, 0.0925, 0], rotation: [90, 0, 0] });
  // door
  cr.part(new THREE.BoxGeometry(0.025, 0.037, 0.003), C.WHITE, { at: [-0.018, 0.019, 0.0332] });
  cr.part(new THREE.BoxGeometry(0.02, 0.033, 0.004), C.BLUE, { at: [-0.018, 0.0175, 0.0345] });
  cr.part(new THREE.BoxGeometry(0.014, 0.002, 0.0015), "#24569a", { at: [-0.018, 0.026, 0.0368] });
  cr.part(new THREE.BoxGeometry(0.014, 0.002, 0.0015), "#24569a", { at: [-0.018, 0.01, 0.0368] });
  cr.part(new THREE.SphereGeometry(0.0018, 6, 4), C.GOLD, { at: [-0.0115, 0.017, 0.037] });
  cr.part(new THREE.BoxGeometry(0.032, 0.003, 0.013), C.SLATE_D, { at: [-0.018, 0.039, 0.039], rotation: [15, 0, 0] });
  cr.part(new THREE.BoxGeometry(0.03, 0.006, 0.013), C.STONE, { at: [-0.018, 0.003, 0.041] });
  // front window with shutters and flower box
  const windowAt = (x: number, y: number, z: number, rotY: number, shut: boolean) => {
    const rot: V = [0, rotY, 0];
    const fw = (dx: number, dy: number, dz: number): V => {
      const a = rotY * DEG;
      return [x + dx * Math.cos(a) + dz * Math.sin(a), y + dy, z - dx * Math.sin(a) + dz * Math.cos(a)];
    };
    cr.part(new THREE.BoxGeometry(0.022, 0.02, 0.002), C.WHITE, { at: fw(0, 0, 0), rotation: rot });
    const g = cr.part(new THREE.BoxGeometry(0.017, 0.015, 0.003), C.GLOW, { at: fw(0, 0, 0.0008), rotation: rot });
    g.mesh.material = glowWarm;
    cr.part(new THREE.BoxGeometry(0.0015, 0.016, 0.0015), C.WHITE, { at: fw(0, 0, 0.0025), rotation: rot });
    cr.part(new THREE.BoxGeometry(0.018, 0.0015, 0.0015), C.WHITE, { at: fw(0, 0, 0.0025), rotation: rot });
    if (shut) {
      cr.part(new THREE.BoxGeometry(0.007, 0.02, 0.002), C.BLUE, { at: fw(-0.0148, 0, 0.0005), rotation: rot });
      cr.part(new THREE.BoxGeometry(0.007, 0.02, 0.002), C.BLUE, { at: fw(0.0148, 0, 0.0005), rotation: rot });
    }
    cr.part(new THREE.BoxGeometry(0.022, 0.006, 0.007), C.WOOD_M, { at: fw(0, -0.0125, 0.003), rotation: rot });
    const fl = [C.PINK, C.RED, C.YELLOW, C.LILAC, C.PINK];
    for (let k = 0; k < 5; k++) cr.part(new THREE.SphereGeometry(0.0024, 6, 4), fl[k], { at: fw(-0.008 + k * 0.004, -0.0085, 0.003 + (k % 2) * 0.0015) });
  };
  windowAt(0.02, 0.031, 0.0335, 0, true);
  windowAt(0.0485, 0.031, -0.005, 90, false);
  const attic = cr.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.003, 10), C.GLOW, { at: [0, 0.068, 0.0335], rotation: [90, 0, 0] });
  attic.mesh.material = glowWarm;
  cr.part(new THREE.TorusGeometry(0.0065, 0.0012, 4, 12), C.WHITE, { at: [0, 0.068, 0.0345] });
  // lifebuoy on the right wall
  const lbC = cr.p([-0.0485, 0.03, 0.0]);
  const along = cr.d([0, 0, 1]);
  const buoy = paint((p) => {
    const ang = Math.atan2(p.y - lbC.y, (p.x - lbC.x) * along.x + (p.z - lbC.z) * along.z);
    return Math.floor((ang + Math.PI) / (Math.PI / 2)) % 2 ? C.RED : C.WHITE;
  });
  cr.part(new THREE.TorusGeometry(0.0095, 0.003, 6, 14), buoy, { at: [-0.0505, 0.03, 0.0], rotation: [0, 90, 0] });
  // rain barrel
  cr.part(new THREE.CylinderGeometry(0.009, 0.008, 0.022, 10), C.WOOD_M, { at: [0.059, 0.011, 0.018] });
  cr.part(new THREE.TorusGeometry(0.0092, 0.0009, 3, 12), C.IRON, { at: [0.059, 0.005, 0.018], rotation: [90, 0, 0] });
  cr.part(new THREE.TorusGeometry(0.0089, 0.0009, 3, 12), C.IRON, { at: [0.059, 0.017, 0.018], rotation: [90, 0, 0] });
  // crooked chimney
  const bricks = paint((p) => ((p.y / 0.0055) % 1 + 1) % 1 < 0.2 ? "#d9c7b0" : C.BRICK);
  cr.part(new THREE.BoxGeometry(0.014, 0.03, 0.014), bricks, { at: [0.026, 0.085, -0.015], rotation: [0, 0, 4] });
  cr.part(new THREE.BoxGeometry(0.013, 0.018, 0.013), bricks, { at: [0.0285, 0.106, -0.015], rotation: [0, 8, -8] });
  cr.part(new THREE.BoxGeometry(0.018, 0.004, 0.018), C.STONE_D, { at: [0.0302, 0.1165, -0.015], rotation: [0, 8, -11] });
  cr.part(new THREE.CylinderGeometry(0.003, 0.0036, 0.007, 6), C.TERRA, { at: [0.031, 0.122, -0.015], rotation: [0, 0, -11] });
  const smoke: Array<[V, number, string]> = [
    [[0.03, 0.134, -0.016], 0.006, C.SMOKE], [[0.024, 0.151, -0.022], 0.009, C.SMOKE2], [[0.013, 0.172, -0.03], 0.012, C.SMOKE], [[-0.001, 0.196, -0.036], 0.0105, C.SMOKE2],
  ];
  for (const [at, r, col] of smoke) b.part(new THREE.IcosahedronGeometry(r, 1), col, { at: cr.p(at), flat: true });

  // ---------------- Jetty ----------------
  const JX = 0.1, DY = 0.108;
  // steps down from the grass
  for (const [z, y] of [[0.116, 0.152], [0.131, 0.138], [0.146, 0.124]]) {
    P(new THREE.BoxGeometry(0.045, 0.006, 0.016), C.PLANK2, [JX, y, z]);
  }
  const plankCols = [C.PLANK1, C.PLANK2, C.PLANK3];
  for (let i = 0; i < 10; i++) {
    P(new THREE.BoxGeometry(0.05, 0.004, 0.0095), plankCols[i % 3], [JX + (R() - 0.5) * 0.003, DY, 0.16 + i * 0.0105], [0, (R() - 0.5) * 6, 0]);
  }
  P(new THREE.BoxGeometry(0.005, 0.006, 0.11), C.POST, [JX - 0.018, DY - 0.005, 0.207]);
  P(new THREE.BoxGeometry(0.005, 0.006, 0.11), C.POST, [JX + 0.018, DY - 0.005, 0.207]);
  for (const z of [0.165, 0.21, 0.255])
    for (const sx of [-1, 1]) {
      P(new THREE.CylinderGeometry(0.0045, 0.005, 0.05, 6), C.POST, [JX + sx * 0.025, 0.095, z]);
      P(new THREE.TorusGeometry(0.0072, 0.002, 4, 10), C.FOAM, [JX + sx * 0.025, 0.0805, z], [90, 0, 0], [1, 1, 0.5]);
    }
  // barrel and crate on the deck
  P(new THREE.CylinderGeometry(0.009, 0.009, 0.022, 10), C.WOOD_M, [JX - 0.012, 0.121, 0.2]);
  P(new THREE.TorusGeometry(0.0092, 0.0009, 3, 12), C.IRON, [JX - 0.012, 0.115, 0.2], [90, 0, 0]);
  P(new THREE.TorusGeometry(0.0092, 0.0009, 3, 12), C.IRON, [JX - 0.012, 0.127, 0.2], [90, 0, 0]);
  P(new THREE.BoxGeometry(0.016, 0.016, 0.016), C.PLANK3, [JX + 0.011, 0.118, 0.232], [0, 20, 0]);
  P(new THREE.TorusGeometry(0.006, 0.0018, 4, 12), C.ROPE, [JX + 0.012, 0.1115, 0.178], [90, 0, 0]);
  // jetty lamp
  P(new THREE.CylinderGeometry(0.0012, 0.0012, 0.04, 5), C.IRON, [JX - 0.025, 0.14, 0.255]);
  const jl = P(new THREE.BoxGeometry(0.006, 0.008, 0.006), C.GLOW, [JX - 0.025, 0.164, 0.255]);
  jl.mesh.material = glowLamp;
  P(new THREE.ConeGeometry(0.006, 0.005, 4), C.IRON, [JX - 0.025, 0.1705, 0.255], [0, 45, 0]);

  // stepping stones from door to jetty steps
  const door = cr.p([-0.018, 0, 0.05]);
  const stepTop = new THREE.Vector3(JX, G, 0.105);
  for (let k = 0; k < 4; k++) {
    const q = door.clone().lerp(stepTop, (k + 0.5) / 4);
    P(new THREE.CylinderGeometry(0.008, 0.009, 0.004, 6), C.STONE, [q.x, G + 0.001, q.z], [0, R() * 60, 0], undefined, true);
  }

  // ---------------- Rowboat ----------------
  const br = b.region({ at: [0.165, 0.08, 0.212], quat: new THREE.Quaternion().setFromAxisAngle(Y, 6 * DEG) });
  const hull = paint((p) => (p.y < 0.0822 ? "#b8432f" : p.y > 0.0848 && p.y < 0.0862 ? C.BLUE : C.WHITE));
  br.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hull, { at: [0, 0.008, 0], scale: [0.022, 0.016, 0.055] });
  br.part(new THREE.CylinderGeometry(1, 1, 0.002, 12), C.PLANK1, { at: [0, 0.0045, 0], scale: [0.0205, 1, 0.051] });
  br.part(new THREE.TorusGeometry(1, 0.08, 4, 20), C.BLUE, { at: [0, 0.008, 0], rotation: [90, 0, 0], scale: [0.022, 0.055, 0.03] });
  for (const z of [-0.018, 0.016]) br.part(new THREE.BoxGeometry(0.04, 0.003, 0.008), C.PLANK3, { at: [0, 0.0065, z] });
  for (const sx of [-1, 1]) {
    br.part(new THREE.CylinderGeometry(0.001, 0.001, 0.07, 5), C.PLANK3, { at: [sx * 0.007, 0.0095, 0.002], rotation: [90, 0, sx * 6] });
    br.part(new THREE.BoxGeometry(0.006, 0.001, 0.015), C.PLANK1, { at: [sx * 0.0105, 0.0095, 0.04], rotation: [0, sx * -6, 0] });
  }
  br.part(new THREE.TorusGeometry(0.0022, 0.0007, 3, 8), C.IRON, { at: [0, 0.011, 0.053], rotation: [0, 90, 0] });
  const bow = br.p([0, 0.011, 0.054]);
  b.sweep(catmull([bow, [0.14, 0.088, 0.24], [JX + 0.025, 0.118, 0.255]]), 0.0011, { color: C.ROPE, sides: 5 });

  // ---------------- Seagulls ----------------
  const gull = (at: THREE.Vector3 | V, yaw: number, flying: boolean) => {
    const g = b.region({ at: at as any, quat: new THREE.Quaternion().setFromAxisAngle(Y, yaw * DEG) });
    g.part(new THREE.SphereGeometry(1, 10, 7), C.WHITE, { at: [0, 0, 0], scale: [0.009, 0.0085, 0.019] });
    g.part(new THREE.SphereGeometry(0.0075, 10, 7), C.WHITE, { at: [0, 0.008, 0.016] });
    g.part(new THREE.ConeGeometry(0.0022, 0.01, 6), C.ORANGE, { at: [0, 0.0065, 0.027], rotation: [100, 0, 0] });
    for (const sx of [-1, 1]) g.part(new THREE.SphereGeometry(0.0013, 5, 4), C.BLACK, { at: [sx * 0.0052, 0.0098, 0.02] });
    g.part(new THREE.BoxGeometry(0.011, 0.002, 0.013), C.GULL_G, { at: [0, 0.002, -0.022], rotation: [-10, 0, 0] });
    for (const sx of [-1, 1]) {
      if (flying) {
        const w = (pts: number[][]) => pts.map(([x, y, z]) => g.p([sx * x, y, z]));
        b.slab(w([[0.005, 0.003, 0.009], [0.028, 0.01, 0.006], [0.028, 0.009, -0.009], [0.005, 0.002, -0.011]]), { color: C.GULL_G, thickness: 0.0016 });
        b.slab(w([[0.028, 0.01, 0.006], [0.049, 0.005, 0.0], [0.046, 0.005, -0.008], [0.028, 0.009, -0.009]]), { color: C.GULL_G, thickness: 0.0016 });
        b.slab(w([[0.049, 0.005, 0.0], [0.064, 0.001, -0.01], [0.046, 0.005, -0.008]]), { color: C.BLACK, thickness: 0.0016 });
      } else {
        g.part(new THREE.SphereGeometry(1, 8, 6), C.GULL_G, { at: [sx * 0.0068, 0.003, -0.005], scale: [0.0035, 0.0065, 0.017] });
        g.part(new THREE.ConeGeometry(0.003, 0.012, 5), C.BLACK, { at: [sx * 0.004, 0.004, -0.025], rotation: [-95, 0, 0] });
        g.part(new THREE.CylinderGeometry(0.0007, 0.0007, 0.01, 4), C.ORANGE, { at: [sx * 0.003, -0.0115, 0.0] });
      }
    }
  };
  gull(cr.p([0, 0.0967 + 0.0165, 0.012]), CY + 25, false);
  const flyAt: V = [-0.17, 0.33, 0.12];
  gull(flyAt, 70, true);
  b.rod([flyAt[0], 0.075, flyAt[2]], [flyAt[0], flyAt[1] - 0.008, flyAt[2]], 0.0008, { color: C.BRASS, sides: 4 });
  P(new THREE.TorusGeometry(0.004, 0.0013, 4, 10), C.FOAM, [flyAt[0], 0.0805, flyAt[2]], [90, 0, 0], [1, 1, 0.5]);

  // ---------------- Grass and wildflowers ----------------
  const ground = b.surface(groundParts);
  const sinY = Math.sin(CY * DEG), cosY = Math.cos(CY * DEG);
  const blocked = (x: number, z: number) => {
    if (Math.hypot(x - LX, z - LZ) < 0.075) return true;
    const dx = x - CX, dz = z - CZ;
    const lx = dx * cosY - dz * sinY, lz = dx * sinY + dz * cosY;
    if (Math.abs(lx) < 0.072 && lz > -0.045 && lz < 0.058) return true;
    if (x > JX - 0.035 && x < JX + 0.035 && z > 0.09) return true;
    // stepping-stone path
    const ax = door.x, az = door.z, bx = stepTop.x, bz = stepTop.z;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)));
    return Math.hypot(x - (ax + (bx - ax) * t), z - (az + (bz - az) * t)) < 0.013;
  };
  const spots: THREE.Vector3[] = [];
  for (let tries = 0; spots.length < 80 && tries < 900; tries++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R()) * 0.195;
    const x = Math.sin(a) * rr, z = Math.cos(a) * rr;
    if (blocked(x, z)) continue;
    if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 0.011)) continue;
    const hit = ground.ray([x, 0.6, z], [0, -1, 0]);
    if (!hit || hit.at.y < 0.09 || hit.n.y < 0.35) continue;
    spots.push(hit.at.clone());
  }
  const grassTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M22 64 Q14 30 6 18 Q18 34 28 64Z" fill="#4a8533"/><path d="M36 64 Q46 28 58 16 Q48 36 42 64Z" fill="#6fb24a"/><path d="M27 64 Q30 30 20 4 Q36 30 33 64Z" fill="#7cc254"/><path d="M29 64 L34 8 L35 64Z" fill="#5d9c3f"/><path d="M33 64 Q40 40 50 30 Q42 46 38 64Z" fill="#3f7a2c"/><path d="M18 64 Q20 46 12 38 Q24 48 24 64Z" fill="#8fcf60"/></svg>`,
    { size: 128 },
  );
  const flowerSvg = (petal: string, center: string) =>
    svg(
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M31 64 L31 24 L33 24 L33 64Z" fill="#3f7a2c"/><path d="M33 48 Q44 40 47 31 Q38 37 33 43Z" fill="#5d9c3f"/><path d="M31 54 Q20 46 17 38 Q26 43 31 49Z" fill="#4a8533"/>` +
        [0, 72, 144, 216, 288].map((a) => `<circle cx="${32 + 8 * Math.sin((a * Math.PI) / 180)}" cy="${18 - 8 * Math.cos((a * Math.PI) / 180)}" r="6.5" fill="${petal}"/>`).join("") +
        `<circle cx="32" cy="18" r="5" fill="${center}"/></svg>`,
      { size: 128 },
    );
  const flowerTex = [flowerSvg("#ffffff", "#f5c518"), flowerSvg("#f5c518", "#c77a12"), flowerSvg("#f27fa5", "#fff1a8"), flowerSvg("#a98ae0", "#ffe36e")];
  b.cards(spots.slice(0, 48).map((p) => frame(p, [0, 1, 0])), grassTex, { size: [0.03, 0.026], cross: true, vary: 0.35, spin: 180, rng: rng(5) });
  b.cards(spots.slice(48, 66).map((p) => frame(p, [0, 1, 0])), flowerTex, { size: [0.017, 0.022], cross: true, vary: 0.25, spin: 180, rng: rng(9) });
  const heads = [C.PINK, C.YELLOW, C.LILAC, C.WHITE, C.RED];
  spots.slice(66).forEach((p, i) => {
    const h = 0.012 + R() * 0.008;
    b.rod(p, [p.x, p.y + h, p.z], 0.0007, { color: C.GREEN_D, sides: 4 });
    P(new THREE.IcosahedronGeometry(0.0028, 0), heads[i % heads.length], [p.x, p.y + h + 0.002, p.z], [0, 0, 0], undefined, true);
  });

  return b.root;
}
```