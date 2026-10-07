```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  scales,
  mix,
  noise,
  smoothstep,
  svg,
  frame,
  catmull,
} from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Isle",
  description:
    "A spiral-striped red and white lighthouse with a glowing lantern and sweeping beams, on a tiny grassy rock island with a keeper's cottage, dock and rowboat, ringed by painted shallows and foam.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse_isle", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ---------------- Water ----------------
  const waterPaint = paint((p, n) => {
    const rr = Math.hypot(p.x, p.z);
    if (n.y < 0.5) return "#174f6e";
    let c = mix("#47bccb", "#1d6a96", smoothstep(6.6, 10, rr));
    const wav = Math.sin(rr * 2.4 + noise(p, 2.2, 3) * 7);
    if (wav > 0.9) c = mix(c, "#bfeff0", 0.55);
    const foam = smoothstep(7.4, 6.5, rr + (noise(p, 0.8, 9) - 0.5) * 1.2);
    return mix(c, "#f2fbf9", foam);
  });
  b.lathe(
    [
      [0, 0],
      [11, 0],
      [11, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0, 0], color: waterPaint, segments: 20, name: "water" },
  );

  // ---------------- Island ----------------
  const grass = mottle("#68b544", "#4b9434", { size: 0.9, seed: 2 });
  const rock = mottle("#857b6e", "#5b544c", { size: 0.6, seed: 4 });
  const islandPaint = paint((p, n) => {
    if (p.y < 0.6) return mix("#e9d49a", "#cdb57a", noise(p, 0.5, 1));
    const g = smoothstep(0.5, 0.8, n.y) * smoothstep(1.3, 1.6, p.y);
    return mix(rock.at(p, n), grass.at(p, n), g);
  });
  const island = b.lathe(
    [
      [0, 0.1],
      [6.6, 0.1],
      [6.2, 0.7],
      [5.4, 1.2],
      [4.6, 1.6],
      [3.6, 1.85],
      [0, 1.9],
    ],
    { at: [0, 0, 0], color: islandPaint, segments: 11, spin: 7, name: "island" },
  );

  // Boulders around the shore
  const rockColors = ["#7a7166", "#6a625a", "#8d857a", "#5c564f"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.3;
    if (Math.abs(a - 0.35) < 0.35) continue; // leave room for the dock
    const r = 5.6 + R() * 1.2;
    const s = 0.5 + R() * 0.6;
    b.part(new THREE.IcosahedronGeometry(1, 0), rockColors[i % 4], {
      at: [Math.sin(a) * r, 0.25 + R() * 0.3, Math.cos(a) * r],
      rotation: [R() * 90, R() * 180, R() * 90],
      scale: [s * (1 + R() * 0.5), s * 0.7, s],
      flat: true,
      name: `boulder${i}`,
    });
  }

  // ---------------- Lighthouse ----------------
  b.lathe(
    [
      [0, 0],
      [1.95, 0],
      [1.95, 0.7],
      [1.75, 0.8],
      [0, 0.8],
    ],
    {
      at: [0, 1.6, 0],
      segments: 8,
      spin: 22.5,
      color: scales(["#9a948a", "#8a857c", "#aca69a"], "#5f5a52", { size: 0.32, seed: 5 }),
      name: "plinth",
    },
  );

  const towerPaint = paint((p, n, s) => {
    const k = Math.floor(s[0] / 1.3 + (2 * s[1]) / 360);
    const base = ((k % 2) + 2) % 2 === 0 ? "#f5f1e6" : "#c9302c";
    const grime = 0.35 * smoothstep(1.4, 0, s[0]) + 0.12 * noise(p, 0.4, 8);
    return mix(base, "#6d6253", grime);
  });
  const tower = b.lathe(
    [
      [0, 0],
      [1.4, 0],
      [0.95, 7.7],
      [0, 7.7],
    ],
    { at: [0, 2.3, 0], segments: 12, color: towerPaint, name: "tower" },
  );
  const towerSurf = b.surface(tower);

  // Door
  const doorHit = towerSurf.around([0, 3.05, 0]).at(0, 0);
  if (doorHit) {
    b.stick(new THREE.BoxGeometry(0.95, 0.12, 1.4), "#f4efe4", doorHit, { flow: [0, 1, 0], embed: 0.5, name: "doorFrame" });
    b.stick(new THREE.BoxGeometry(0.7, 0.16, 1.2), "#4a6f8f", doorHit, { flow: [0, 1, 0], embed: 0.4, name: "door" });
  }
  b.part(new THREE.BoxGeometry(1.1, 0.18, 0.5), "#8a857c", { at: [0, 2.45, 1.9], name: "step" });

  // Windows, spiralling up the tower
  [
    [4.4, 140],
    [6.2, -40],
    [7.9, 160],
    [9.1, 20],
  ].forEach(([h, az], i) => {
    const hit = towerSurf.around([0, h, 0]).at(az, 0);
    if (!hit) return;
    b.stick(new THREE.BoxGeometry(0.5, 0.08, 0.72), "#f4efe4", hit, { flow: [0, 1, 0], embed: 0.4, name: `winFrame${i}` });
    b.stick(new THREE.BoxGeometry(0.34, 0.12, 0.54), "#22303c", hit, { flow: [0, 1, 0], embed: 0.4, name: `window${i}` });
  });

  // Gallery: flared corbel, deck, railing
  b.lathe(
    [
      [0, -0.7],
      [0.98, -0.7],
      [1.72, 0],
      [0, 0],
    ],
    { at: [0, 10, 0], segments: 12, color: "#f2ede1", name: "corbel" },
  );
  b.lathe(
    [
      [0, 0],
      [1.8, 0],
      [1.8, 0.2],
      [0, 0.2],
    ],
    { at: [0, 10, 0], segments: 16, color: "#2f3a40", name: "deck" },
  );
  b.ring(frame([0, 10.2, 0], [0, 1, 0]), { count: 18, radius: 1.68 }, (item) => {
    const a = item.at;
    b.rod(a, [a.x, a.y + 0.75, a.z], 0.025, { color: "#1f272c", sides: 4, name: `post${item.i}` });
  });
  for (const y of [10.55, 10.95])
    b.part(new THREE.TorusGeometry(1.68, 0.035, 4, 28), "#1f272c", { at: [0, y, 0], rotation: [90, 0, 0], name: "rail" });

  // Lantern room
  b.lathe(
    [
      [0, 0],
      [1.0, 0],
      [1.0, 0.38],
      [0, 0.38],
    ],
    { at: [0, 10.2, 0], segments: 8, spin: 22.5, color: "#a82824", name: "lanternWall" },
  );
  const glass = b.lathe(
    [
      [0, 0],
      [0.88, 0],
      [0.88, 1.05],
      [0, 1.05],
    ],
    { at: [0, 10.58, 0], segments: 8, spin: 22.5, color: "#fff1a0", name: "glass" },
  );
  glass.mesh.material = new THREE.MeshStandardMaterial({
    color: "#fff6c4",
    emissive: "#ffd75a",
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.6,
    roughness: 0.2,
  });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.92;
    const z = Math.cos(a) * 0.92;
    b.rod([x, 10.56, z], [x, 11.65, z], 0.035, { color: "#1f272c", sides: 4, name: `mullion${k}` });
  }
  const lamp = b.part(new THREE.SphereGeometry(0.32, 10, 8), "#fffbe0", { at: [0, 11.1, 0], name: "lamp" });
  lamp.mesh.material = new THREE.MeshStandardMaterial({ color: "#fffbe0", emissive: "#ffe680", emissiveIntensity: 2 });
  b.lathe(
    [
      [0, 0],
      [0.45, 0],
      [0.45, 0.25],
      [0, 0.25],
    ],
    { at: [0, 10.58, 0], segments: 8, color: "#b08a2e", name: "lampStand" },
  );

  // Roof
  b.lathe(
    [
      [0, 0],
      [1.12, 0],
      [1.08, 0.1],
      [0.3, 0.85],
      [0, 0.95],
    ],
    { at: [0, 11.62, 0], segments: 8, spin: 22.5, color: "#c9302c", name: "roof" },
  );
  b.part(new THREE.SphereGeometry(0.14, 8, 6), "#1f272c", { at: [0, 12.62, 0], name: "finial" });
  b.rod([0, 12.6, 0], [0, 13.15, 0], 0.025, { color: "#1f272c", sides: 4, name: "lightningRod" });

  // Light beams
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fff3b0",
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const sgn of [1, -1]) {
    const out = new THREE.Vector3(0.85 * sgn, -0.07, 0.52 * sgn).normalize();
    const lampAt = new THREE.Vector3(0, 11.1, 0);
    const beam = b.part(new THREE.ConeGeometry(1.5, 7, 12, 1, true), "#fff3b0", {
      at: lampAt.clone().addScaledVector(out, 3.5),
      dir: out.clone().negate(),
      name: sgn > 0 ? "beamL" : "beamR",
    });
    beam.mesh.material = beamMat;
  }

  // ---------------- Keeper's cottage ----------------
  const hx = -2.6;
  const hz = -1.2;
  b.part(new THREE.BoxGeometry(1.8, 1.35, 2.4), "#f4efe4", { at: [hx, 2.35, hz], name: "cottage" });
  b.part(new THREE.BoxGeometry(1.9, 0.2, 2.5), "#8a857c", { at: [hx, 1.75, hz], name: "cottageBase" });
  b.extrude(
    [
      [-1.2, 0],
      [1.2, 0],
      [0, 0.9],
    ],
    { at: [hx, 3.0, hz], x: [1, 0, 0], y: [0, 1, 0], thickness: 2.7, bevel: 0.04, color: "#3c4a5c", name: "cottageRoof" },
  );
  b.part(new THREE.BoxGeometry(0.32, 0.8, 0.32), "#9a6b4f", { at: [hx - 0.5, 3.55, hz - 0.7], name: "chimney" });
  b.part(new THREE.BoxGeometry(0.4, 0.08, 0.4), "#5a3e2e", { at: [hx - 0.5, 3.96, hz - 0.7], name: "chimneyCap" });
  b.part(new THREE.BoxGeometry(0.06, 1.0, 0.62), "#2d5f8a", { at: [hx + 0.91, 2.18, hz + 0.4], name: "cottageDoor" });
  b.part(new THREE.BoxGeometry(0.06, 0.55, 0.55), "#f4efe4", { at: [hx + 0.91, 2.5, hz - 0.6], name: "sideWinFrame" });
  b.part(new THREE.BoxGeometry(0.08, 0.42, 0.42), "#22303c", { at: [hx + 0.91, 2.5, hz - 0.6], name: "sideWin" });
  b.part(new THREE.BoxGeometry(0.55, 0.55, 0.06), "#2d5f8a", { at: [hx + 0.35, 2.5, hz + 1.21], name: "frontWinFrame" });
  b.part(new THREE.BoxGeometry(0.42, 0.42, 0.08), "#22303c", { at: [hx + 0.35, 2.5, hz + 1.21], name: "frontWin" });
  // Lifebuoy
  const buoyC = new THREE.Vector3(hx - 0.4, 2.35, hz + 1.25);
  b.part(
    new THREE.TorusGeometry(0.24, 0.07, 6, 16),
    paint((p) => {
      const a = Math.atan2(p.y - buoyC.y, p.x - buoyC.x) + Math.PI;
      return Math.floor(a / (Math.PI / 2)) % 2 === 0 ? "#e2382f" : "#f7f3ea";
    }),
    { at: buoyC, name: "lifebuoy" },
  );

  // Stepping-stone path from cottage to tower
  const path = catmull([
    [hx + 1.2, 0, hz + 0.4],
    [-0.9, 0, 0.9],
    [0, 0, 2.3],
  ]);
  for (let i = 0; i < 6; i++) {
    const q = path.at((i + 0.5) / 6);
    b.part(new THREE.CylinderGeometry(0.22, 0.25, 0.1, 7), i % 2 ? "#b9b2a5" : "#a39c90", {
      at: [q.x, 1.88, q.z],
      rotation: [0, R() * 60, 0],
      name: `stone${i}`,
    });
  }

  // ---------------- Dock and rowboat ----------------
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.BoxGeometry(0.3, 0.08, 1.0), i % 2 ? "#9b7148" : "#8a6440", {
      at: [5.7 + i * 0.34, 0.62, 2.1],
      rotation: [0, (R() - 0.5) * 4, 0],
      name: `plank${i}`,
    });
  }
  for (const x of [6.6, 8.4])
    for (const z of [1.6, 2.6])
      b.rod([x, 0, z], [x, 0.72, z], 0.07, { color: "#5e4430", sides: 6, name: "dockPost" });
  b.extrude(
    [
      [-1.1, 0.4],
      [-0.85, 0],
      [0.9, 0],
      [1.25, 0.45],
    ],
    { at: [7.7, 0.18, 3.3], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.85, bevel: 0.08, color: "#e0702a", name: "boatHull" },
  );
  b.part(new THREE.BoxGeometry(1.9, 0.06, 0.7), "#f2ede1", { at: [7.75, 0.6, 3.3], name: "gunwale" });
  b.part(new THREE.BoxGeometry(0.22, 0.06, 0.7), "#8a6440", { at: [7.7, 0.66, 3.3], name: "thwart" });
  b.rod([7.4, 0.68, 3.0], [6.4, 0.45, 2.75], 0.03, { color: "#c9a26b", sides: 4, name: "oar" });

  // ---------------- Grass tufts and flowers ----------------
  const islandSurf = b.surface(island);
  const keepOut = (p: THREE.Vector3) =>
    Math.hypot(p.x, p.z) < 2.2 ||
    (Math.abs(p.x - hx) < 1.3 && Math.abs(p.z - hz) < 1.6) ||
    (p.z > 0.4 && Math.abs(p.x + 0.4) < 0.7 && p.z < 2.6);
  const tufts = islandSurf.scatter(70, {
    rng: rng(3),
    minDist: 0.35,
    keepOut,
    filter: (h) => h.n.y > 0.8 && h.at.y > 1.55,
  });
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M30 64 L25 6 L35 64 Z" fill="#7cc95a"/>
      <path d="M33 64 L47 14 L39 64 Z" fill="#5fae3e"/>
      <path d="M27 64 L12 20 L33 64 Z" fill="#4e9a36"/>
      <path d="M36 64 L56 30 L41 64 Z" fill="#8fd86a"/>
      <path d="M24 64 L6 36 L29 64 Z" fill="#6cbf4a"/>
    </svg>`,
    { size: 128 },
  );
  b.cards(tufts, grassTex, { size: [0.42, 0.42], cross: true, vary: 0.3, spin: 180, rng: rng(5), sink: 0.15 });

  const flowers = islandSurf.scatter(22, {
    rng: rng(9),
    minDist: 0.5,
    keepOut,
    filter: (h) => h.n.y > 0.8 && h.at.y > 1.55,
  });
  const petals = ["#ffffff", "#ffd94a", "#f28bb0"];
  flowers.forEach((h, i) => {
    b.stick(new THREE.IcosahedronGeometry(0.07, 0), petals[i % 3], h, { embed: -1.5, flat: true, name: `flower${i}` });
  });

  return b.root;
}
```