```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  mottle,
  scales,
  grain,
  paint,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Island Lighthouse",
  description:
    "A stylized red-and-white lighthouse on a tiny rocky island: lantern gallery, keeper's cottage, wooden pier with a rowboat, pines, grass tufts, flowers, foam rings and a pair of gulls.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse", paintSize: 2048 });
  b.joint("base", { at: [0, 0, 0] });

  // ---------- palette ----------
  const RED = "#d23a32";
  const WHITE = "#f6f1e6";
  const DARK = "#2b3240";
  const GLOW = "#ffd860";
  const GLASS = "#fff1a8";
  const DOOR = "#2f4d6e";
  const WOOD = "#9a6a3e";
  const WOOD2 = "#7e5530";
  const STONE = "#a39d92";
  const SAND = "#ecd49a";
  const FOAM = "#ffffff";
  const BRASS = "#d9a640";

  const TX = 0, TZ = -0.6; // tower centre
  const R = rng(11);

  // ---------- sea ----------
  const water = paint((p) => {
    const r = Math.hypot(p.x, p.z);
    if (r < 4.35) return "#7fd3df";
    if (r < 4.9) return noise(p, 0.5, 4) > 0.55 ? "#7fd3df" : "#4fb0d4";
    return noise(p, 1.1, 9) > 0.64 ? "#5cb6dc" : "#2f86bf";
  });
  b.lathe([[0, 0], [5.6, 0], [5.6, 0.06], [0, 0.06]], { at: [0, 0, 0], segments: 20, color: water, name: "sea" });

  // foam rings
  b.part(new THREE.TorusGeometry(4.0, 0.08, 3, 20), FOAM, { at: [0, 0.07, 0], rotation: [90, 0, 0], scale: [1, 1, 0.5], name: "foam" });
  for (let i = 0; i < 18; i++) {
    if (R() < 0.3) continue;
    const a = (i / 18) * Math.PI * 2 + R() * 0.2;
    const r = 4.45 + R() * 0.25;
    b.part(new THREE.SphereGeometry(0.16, 6, 3), FOAM, {
      at: [Math.sin(a) * r, 0.06, Math.cos(a) * r],
      rotation: [0, (a * 180) / Math.PI, 0],
      scale: [1.8, 0.25, 0.7],
      name: "foamFleck",
    });
  }

  // ---------- island ----------
  const stone = mottle("#8f949b", "#626874", { size: 0.6, seed: 2 });
  b.lathe([[0, 0.02], [3.85, 0.02], [3.95, 0.3], [3.55, 0.85], [3.05, 1.2], [0, 1.25]], {
    at: [0, 0, 0], segments: 10, color: stone, name: "rock",
  });
  const grassPaint = mottle("#7cc05a", "#5a9f45", { size: 0.7, seed: 5 });
  const grassCol = paint((p) => (p.y < 1.27 ? SAND : grassPaint));
  const grass = b.lathe([[0, 1.15], [3.12, 1.15], [3.12, 1.22], [2.9, 1.36], [2.2, 1.5], [0, 1.56]], {
    at: [0, 0, 0], segments: 10, spin: 18, color: grassCol, name: "grass",
  });
  const grassSurf = b.surface(grass);
  const ground = (x: number, z: number) => {
    const h = grassSurf.ray([x, 8, z], [0, -1, 0]);
    return h ? h.at.y : 1.4;
  };

  // shore rocks
  const rockCols = ["#7d838c", "#9aa0a8", "#6a707a"];
  for (let i = 0; i < 24; i++) {
    const a = R() * Math.PI * 2;
    const r = 3.55 + R() * 0.75;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (x < -2.8 && z > 0.3 && z < 1.7) continue; // pier
    if (x < -3.4 && z > 1.5 && z < 2.8) continue; // boat
    const s = 0.22 + R() * 0.38;
    b.part(new THREE.DodecahedronGeometry(s, 0), rockCols[i % 3], {
      at: [x, s * 0.5 + (r < 3.8 ? 0.3 : 0), z],
      rotation: [R() * 360, R() * 360, R() * 360],
      scale: [1.2, 0.7, 1],
      flat: true,
      name: "shoreRock",
    });
  }

  // ---------- lighthouse ----------
  const stoneBlocks = scales("#bdb5a6", "#8a8275", { size: 0.22, seed: 3 });
  b.lathe([[0, 0], [1.15, 0], [1.15, 0.45], [1.02, 0.6], [0, 0.6]], {
    at: [TX, 1.35, TZ], segments: 8, spin: 22.5, color: stoneBlocks, name: "plinth",
  });
  const TH = 6.6;
  const stripes = paint((_p, _n, s) => (Math.floor(s[0] / 1.32) % 2 === 1 ? RED : WHITE));
  b.lathe([[0, 0], [0.85, 0], [0.55, TH], [0, TH]], {
    at: [TX, 1.9, TZ], segments: 12, color: stripes, name: "tower",
  });
  const towerR = (y: number) => 0.85 - (0.3 * (y - 1.9)) / TH;

  // door
  {
    const z = TZ + towerR(2.4);
    b.part(new THREE.BoxGeometry(0.68, 0.95, 0.18), STONE, { at: [TX, 2.43, z - 0.03], name: "doorFrame" });
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 10), STONE, { at: [TX, 2.9, z - 0.03], rotation: [90, 0, 0], name: "doorFrameArch" });
    b.part(new THREE.BoxGeometry(0.5, 0.88, 0.2), DOOR, { at: [TX, 2.4, z], name: "door" });
    b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10), DOOR, { at: [TX, 2.84, z], rotation: [90, 0, 0], name: "doorArch" });
    for (const dy of [2.15, 2.55]) b.part(new THREE.BoxGeometry(0.44, 0.03, 0.03), "#1f344c", { at: [TX, dy, z + 0.11], name: "doorBand" });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: [TX + 0.16, 2.4, z + 0.12], name: "knob" });
    b.part(new THREE.BoxGeometry(0.16, 0.2, 0.12), DARK, { at: [TX, 3.22, z - 0.02], name: "lampBox" });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), GLOW, { at: [TX, 3.18, z + 0.06], name: "doorLamp" });
  }
  // steps
  b.part(new THREE.BoxGeometry(0.9, 0.45, 0.32), STONE, { at: [TX, 1.6, 0.6], flat: true, name: "step1" });
  b.part(new THREE.BoxGeometry(0.9, 0.4, 0.32), STONE, { at: [TX, 1.48, 0.9], flat: true, name: "step2" });

  // windows
  const wins = [
    { a: 0, y: 4.5 }, { a: 0, y: 6.7 }, { a: 125, y: 3.6 }, { a: 235, y: 5.6 }, { a: 125, y: 7.4 },
  ];
  for (const w of wins) {
    const a = (w.a * Math.PI) / 180;
    const r = towerR(w.y);
    const d: [number, number, number] = [Math.sin(a), 0.045, Math.cos(a)];
    const at = (rr: number): [number, number, number] => [TX + Math.sin(a) * rr, w.y, TZ + Math.cos(a) * rr];
    b.part(new THREE.BoxGeometry(0.38, 0.58, 0.1), DARK, { at: at(r - 0.02), dir: d, axis: "z", name: "winFrame" });
    b.part(new THREE.BoxGeometry(0.26, 0.44, 0.1), GLOW, { at: at(r + 0.01), dir: d, axis: "z", name: "winGlass" });
    b.part(new THREE.BoxGeometry(0.03, 0.44, 0.04), DARK, { at: at(r + 0.06), dir: d, axis: "z", name: "winBar" });
    b.part(new THREE.BoxGeometry(0.46, 0.06, 0.16), WHITE, { at: [at(r).at ? 0 : at(r)[0], w.y - 0.3, at(r)[2]], dir: d, axis: "z", name: "winSill" });
  }

  // gallery
  const GY = 8.5;
  const brackets = b.ring(frame([TX, GY - 0.14, TZ], [0, 1, 0]), { count: 12, radius: 0.75 }).items;
  for (const it of brackets) b.part(new THREE.BoxGeometry(0.1, 0.42, 0.22), DARK, { frame: it, name: "bracket" });
  b.part(new THREE.CylinderGeometry(0.97, 0.9, 0.16, 16), DARK, { at: [TX, GY + 0.06, TZ], name: "deck" });
  const railY = GY + 0.14;
  for (const it of b.ring(frame([TX, railY + 0.25, TZ], [0, 1, 0]), { count: 16, radius: 0.9 }).items)
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 4), DARK, { at: it.at, name: "railPost" });
  for (const y of [railY + 0.5, railY + 0.26])
    b.part(new THREE.TorusGeometry(0.9, 0.028, 4, 24), DARK, { at: [TX, y, TZ], rotation: [90, 0, 0], name: "rail" });

  // lantern room
  b.part(new THREE.CylinderGeometry(0.56, 0.6, 0.3, 8), RED, { at: [TX, railY + 0.15, TZ], flat: true, name: "lanternBase" });
  const LG = railY + 0.3; // glass bottom
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 8), GLASS, { at: [TX, LG + 0.45, TZ], flat: true, name: "lanternGlass" });
  b.part(new THREE.SphereGeometry(0.28, 8, 6), "#fffbe0", { at: [TX, LG + 0.45, TZ + 0.3], scale: [1, 1, 0.5], name: "lampGlow" });
  for (const it of b.ring(frame([TX, LG + 0.45, TZ], [0, 1, 0]), { count: 8, radius: 0.5 }).items)
    b.part(new THREE.BoxGeometry(0.05, 0.06, 0.92), DARK, { frame: it, name: "mullion" });
  b.part(new THREE.TorusGeometry(0.5, 0.025, 4, 8), DARK, { at: [TX, LG + 0.45, TZ], rotation: [90, 0, 0], name: "midBar" });

  // roof
  const RY = LG + 0.9;
  b.part(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 8), DARK, { at: [TX, RY + 0.04, TZ], flat: true, name: "roofRim" });
  b.part(new THREE.ConeGeometry(0.66, 0.75, 8), RED, { at: [TX, RY + 0.45, TZ], flat: true, name: "roof" });
  b.part(new THREE.SphereGeometry(0.12, 8, 6), DARK, { at: [TX, RY + 0.86, TZ], name: "finial" });
  b.rod([TX, RY + 0.9, TZ], [TX, RY + 1.35, TZ], 0.018, { color: DARK, name: "vaneRod" });
  for (const d of [[1, 0, 0], [0, 0, 1]] as [number, number, number][])
    b.rod([TX - d[0] * 0.18, RY + 1.08, TZ - d[2] * 0.18], [TX + d[0] * 0.18, RY + 1.08, TZ + d[2] * 0.18], 0.01, { color: DARK, name: "compass" });
  b.extrude(
    [[-0.32, 0.07], [-0.22, 0.02], [0.16, 0.02], [0.16, 0.07], [0.33, 0, "sharp"], [0.16, -0.07], [0.16, -0.02], [-0.22, -0.02], [-0.32, -0.07]],
    { at: [TX, RY + 1.28, TZ], x: [1, 0, 0.5], y: [0, 1, 0], thickness: 0.015, color: BRASS, name: "vane" },
  );

  // ---------- keeper's cottage ----------
  const CX = 1.75, CZ = 0.6;
  b.part(new THREE.BoxGeometry(2.0, 0.45, 1.4), stoneBlocks, { at: [CX, 1.35, CZ], name: "cottageFound" });
  b.part(new THREE.BoxGeometry(1.8, 1.1, 1.2), WHITE, { at: [CX, 2.1, CZ], name: "cottageWalls" });
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.BoxGeometry(0.09, 1.1, 0.09), "#6a4a30", { at: [CX + sx * 0.9, 2.1, CZ + sz * 0.6], name: "cornerPost" });
  b.extrude([[-0.85, -0.05], [0.85, -0.05], [0, 0.75, "sharp"]], {
    at: [CX, 2.65, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.02,
    color: scales("#4b5f8a", "#2c3858", { size: 0.16, seed: 8 }), name: "cottageRoof",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.7, 0.26), "#a8533d", { at: [CX + 0.5, 3.15, CZ - 0.25], flat: true, name: "chimney" });
  b.part(new THREE.BoxGeometry(0.34, 0.06, 0.34), DARK, { at: [CX + 0.5, 3.52, CZ - 0.25], name: "chimneyCap" });
  // front door + window
  const FZ = CZ + 0.61;
  b.part(new THREE.BoxGeometry(0.42, 0.78, 0.06), DOOR, { at: [CX - 0.45, 1.94, FZ], name: "cotDoor" });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), BRASS, { at: [CX - 0.3, 1.92, FZ + 0.04], name: "cotKnob" });
  b.part(new THREE.BoxGeometry(0.46, 0.46, 0.04), DARK, { at: [CX + 0.35, 2.15, FZ], name: "cotWinFrame" });
  b.part(new THREE.BoxGeometry(0.38, 0.38, 0.05), GLOW, { at: [CX + 0.35, 2.15, FZ + 0.01], name: "cotWin" });
  b.part(new THREE.BoxGeometry(0.03, 0.38, 0.03), WHITE, { at: [CX + 0.35, 2.15, FZ + 0.04], name: "cotBar" });
  b.part(new THREE.BoxGeometry(0.38, 0.03, 0.03), WHITE, { at: [CX + 0.35, 2.15, FZ + 0.04], name: "cotBar" });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.16, 0.46, 0.04), "#3f7a9e", { at: [CX + 0.35 + s * 0.32, 2.15, FZ + 0.01], name: "shutter" });
  b.part(new THREE.BoxGeometry(0.5, 0.12, 0.14), WOOD, { at: [CX + 0.35, 1.86, FZ + 0.07], name: "flowerBox" });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.IcosahedronGeometry(0.05, 0), i % 2 ? "#e2577a" : "#f2c94c", { at: [CX + 0.17 + i * 0.09, 1.95, FZ + 0.08], flat: true, name: "boxFlower" });
  // side: life ring + window
  const SX = CX + 0.91;
  const ringPaint = paint((p) => {
    const ang = Math.atan2(p.y - 2.1, p.z - (CZ - 0.25));
    return Math.floor((ang + Math.PI) / (Math.PI / 4)) % 2 ? RED : WHITE;
  });
  b.part(new THREE.TorusGeometry(0.17, 0.055, 6, 12), ringPaint, { at: [SX + 0.05, 2.1, CZ - 0.25], rotation: [0, 90, 0], name: "lifeRing" });
  b.part(new THREE.BoxGeometry(0.05, 0.36, 0.36), GLOW, { at: [SX, 2.2, CZ + 0.3], name: "sideWin" });
  b.part(new THREE.BoxGeometry(0.04, 0.42, 0.42), DARK, { at: [SX - 0.01, 2.2, CZ + 0.3], name: "sideWinFrame" });

  // ---------- gulls ----------
  const gull = (x: number, y: number, z: number, yaw: number) => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (yaw * Math.PI) / 180);
    const P = (v: [number, number, number]) => new THREE.Vector3(...v).applyQuaternion(q).add(new THREE.Vector3(x, y, z));
    const D = (v: [number, number, number]) => new THREE.Vector3(...v).applyQuaternion(q);
    b.part(new THREE.SphereGeometry(0.1, 8, 6), WHITE, { at: P([0, 0, 0]), dir: D([0, 0, 1]), axis: "z", scale: [0.8, 0.75, 1.4], name: "gullBody" });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), WHITE, { at: P([0, 0.1, 0.11]), name: "gullHead" });
    b.part(new THREE.ConeGeometry(0.018, 0.08, 5), "#f2b632", { at: P([0, 0.09, 0.2]), dir: D([0, -0.15, 1]), name: "gullBeak" });
    for (const s of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.03, 0.08, 0.22), "#8f99a6", { at: P([s * 0.075, 0.02, -0.04]), dir: D([0, -0.2, 1]), axis: "z", name: "gullWing" });
      b.part(new THREE.SphereGeometry(0.012, 5, 3), DARK, { at: P([s * 0.05, 0.12, 0.15]), name: "gullEye" });
    }
    b.part(new THREE.BoxGeometry(0.08, 0.02, 0.1), "#5b636e", { at: P([0, 0.0, -0.15]), name: "gullTail" });
  };
  gull(CX - 0.4, 3.45, CZ, 70);

  // ---------- pier, stairs, boat ----------
  const PZ = 1.0;
  for (let i = 0; i < 8; i++)
    b.part(new THREE.BoxGeometry(0.24, 0.08, 0.9), i % 2 ? WOOD : WOOD2, { at: [-3.55 - i * 0.25, 0.65, PZ], name: "plank" });
  for (const x of [-3.6, -4.5, -5.3]) for (const dz of [-0.42, 0.42])
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6), WOOD2, { at: [x, 0.34, PZ + dz], name: "piling" });
  gull(-5.3, 0.82, PZ + 0.42, 200);
  // lamp post at pier end
  b.rod([-5.3, 0.69, PZ - 0.42], [-5.3, 1.6, PZ - 0.42], 0.035, { color: DARK, name: "pierPost" });
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.16), GLOW, { at: [-5.3, 1.7, PZ - 0.42], name: "pierLamp" });
  b.part(new THREE.ConeGeometry(0.15, 0.12, 4), DARK, { at: [-5.3, 1.86, PZ - 0.42], rotation: [0, 45, 0], flat: true, name: "pierLampCap" });
  // crate, barrel, rope
  b.part(new THREE.BoxGeometry(0.38, 0.38, 0.38), grain("#c08b52", "#9c6a38", { size: 0.05, axis: "x" }), { at: [-3.9, 0.88, PZ - 0.2], rotation: [0, 15, 0], name: "crate" });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.46, 10), "#8a5a33", { at: [-4.45, 0.92, PZ + 0.22], name: "barrel" });
  for (const y of [0.78, 1.06])
    b.part(new THREE.TorusGeometry(0.172, 0.018, 4, 10), DARK, { at: [-4.45, y, PZ + 0.22], rotation: [90, 0, 0], name: "barrelBand" });
  b.part(new THREE.TorusGeometry(0.13, 0.04, 5, 10), "#d8c08a", { at: [-4.95, 0.72, PZ + 0.15], rotation: [90, 0, 0], name: "rope" });
  // stone steps up the rock
  [[-3.5, 0.97], [-3.25, 1.13], [-3.0, 1.3]].forEach(([x, top]) =>
    b.part(new THREE.BoxGeometry(0.3, 0.5, 0.75), STONE, { at: [x, top - 0.25, PZ], flat: true, name: "rockStep" }),
  );
  // rowboat
  const hullPaint = paint((_p, _n, s) => (s[1] > 0.36 ? RED : s[1] > 0.3 ? WHITE : s[1] > 0.12 ? "#f4efe4" : "#3d6e8f"));
  const boatAt: [number, number, number] = [-4.4, 0.0, 2.15];
  const boatX = new THREE.Vector3(1, 0, 0.15).normalize();
  const hull = b.extrude(
    [[-0.95, 0.44, "sharp"], [-0.78, 0.1], [-0.3, 0.0], [0.4, 0.0], [0.85, 0.14], [1.08, 0.5, "sharp"]],
    { at: boatAt, x: [boatX.x, 0, boatX.z], y: [0, 1, 0], thickness: [0.3, 0.9], smoothing: 1, bevel: 0.02, color: hullPaint, name: "hull" },
  );
  for (const u of [-0.35, 0.3])
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.86), WOOD, { at: hull.local([u, 0.49, 0]), rotation: [0, -8.5, 0], name: "seat" });
  b.rod(hull.local([-0.6, 0.53, 0.15]), hull.local([0.7, 0.53, 0.3]), 0.025, { color: "#c9a06a", name: "oar" });
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.12), "#c9a06a", { at: hull.local([0.85, 0.53, 0.32]), rotation: [0, -8.5, 0], name: "oarBlade" });

  // ---------- trees & bushes ----------
  const trees: [number, number, number][] = [[-1.7, -1.4, 1], [-2.35, -0.35, 0.8], [1.35, -1.85, 0.9], [-0.9, -2.45, 0.75]];
  for (const [x, z, s] of trees) {
    const y = ground(x, z);
    b.part(new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.5 * s, 6), "#6b4428", { at: [x, y + 0.2 * s, z], flat: true, name: "trunk" });
    [[0.62, 0.45], [0.48, 0.85], [0.33, 1.2]].forEach(([r, h], i) =>
      b.part(new THREE.ConeGeometry(r * s, 0.75 * s, 7), i % 2 ? "#3d8a55" : "#2f6e46", {
        at: [x, y + h * s + 0.2 * s, z], rotation: [0, i * 25, 0], flat: true, name: "pine",
      }),
    );
  }
  const bushes: [number, number, number][] = [[0.75, -0.1, 0.32], [2.85, 0.1, 0.28], [0.9, 1.6, 0.25], [-1.3, 0.3, 0.3]];
  for (const [x, z, r] of bushes)
    b.part(new THREE.IcosahedronGeometry(r, 0), "#4f9a48", { at: [x, ground(x, z) + r * 0.45, z], scale: [1.2, 0.8, 1], flat: true, name: "bush" });

  // ---------- path stones ----------
  const path = catmull([[-2.6, 0, 1.0], [-1.8, 0, 1.4], [-0.9, 0, 1.5], [-0.1, 0, 1.2]]);
  for (let i = 0; i <= 7; i++) {
    const p = path.at(i / 7);
    const h = grassSurf.ray([p.x, 8, p.z], [0, -1, 0]);
    if (h) b.stick(new THREE.CylinderGeometry(0.17, 0.19, 0.06, 7), i % 2 ? "#c9c2b4" : "#b3ab9c", h, { embed: 0.5, spin: i * 40, flat: true, name: "pathStone" });
  }

  // ---------- grass tufts & flowers ----------
  const free = (x: number, z: number) => {
    if (Math.hypot(x - TX, z - TZ) < 1.35) return false;
    if (x > 0.55 && x < 3.0 && z > -0.3 && z < 1.65) return false;
    if (x > -0.6 && x < 0.6 && z > 0.3 && z < 1.2) return false;
    for (const [tx, tz] of trees) if (Math.hypot(x - tx, z - tz) < 0.55) return false;
    for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const p = path.at(t);
      if (Math.hypot(x - p.x, z - p.z) < 0.28) return false;
    }
    return true;
  };
  const tuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M3 32 L8 12 L11 32 Z M10 32 L16 2 L20 32 Z M19 32 L26 10 L28 32 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const tuftHits = grassSurf.scatter(140, {
    rng: rng(21), minDist: 0.22,
    filter: (h) => h.n.y > 0.5 && free(h.at.x, h.at.z),
  });
  b.cards(tuftHits, tuft, { size: [0.26, 0.24], vary: 0.35, spin: 90, cross: true, rng: rng(22), color: "#5fae48" });

  const flowerCols = ["#ffffff", "#f2c94c", "#e2577a", "#b78be0"];
  const fr = rng(31);
  const flowerHits = grassSurf.scatter(36, {
    rng: rng(32), minDist: 0.3,
    filter: (h) => h.n.y > 0.6 && free(h.at.x, h.at.z),
  });
  for (const h of flowerHits)
    b.stick(new THREE.IcosahedronGeometry(0.045, 0), flowerCols[Math.floor(fr() * flowerCols.length)], h.moved([0, 0.08, 0]), { embed: 0, flat: true, name: "flower" });

  return b.root;
}
```