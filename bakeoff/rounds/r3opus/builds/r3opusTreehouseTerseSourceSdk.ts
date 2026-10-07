import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  scales,
  svg,
  catmull,
  DEG,
} from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A storybook treehouse diorama: a gnarled oak on a grassy turf slab, a plank deck on stilts and braces, a little clapboard cabin with a shingled gable roof, glowing windows, a smoking stovepipe, bunting, a lantern, a ladder, a rope swing, a birdhouse, a telescope and toadstools.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", detail: 1, paintSize: 2048 });
  const R = rng(42);
  b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- paints
  const hash = (k: number) => {
    const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const boards = (base: string, light: string, seam: string, w: number, axis: 0 | 1 | 2) =>
    paint((p) => {
      const v = axis === 0 ? p.x : axis === 1 ? p.y : p.z;
      const s = v / w;
      const k = Math.floor(s);
      const f = s - k;
      if (f < 0.09) return seam;
      const c = mix(base, light, hash(k) * 0.6);
      return mix(c, seam, noise(p, 0.08, 3) * 0.3);
    });

  const barkBase = grain("#74502f", "#47301c", { size: 0.035, axis: "y", seed: 3 });
  const bark = paint((p, n) => {
    const base = barkBase.at(p, n);
    const moss = smoothstep(1.0, 0.15, p.y) * noise(p, 0.25, 8);
    return mix(base, "#6a8f3a", Math.min(1, moss * 1.3));
  });
  const wallPaint = boards("#c98a4c", "#e0a965", "#5e3a1d", 0.16, 1);
  const doorPaint = boards("#7c4a2a", "#9a6038", "#3a2010", 0.11, 0);
  const roofPaint = scales(["#b9442d", "#a63a26", "#c95a3c", "#9c3322"], "#5e1f12", { size: 0.13, seed: 4 });
  const leafPaint = paint((p, n) => {
    const t = smoothstep(-0.6, 0.95, n.y);
    const v = noise(p, 1.1, 5);
    const dark = mix("#2c6230", "#3f8a39", v);
    const light = mix("#79c051", "#a8d96a", v);
    return mix(dark, light, t * 0.9);
  });
  const groundPaint = paint((p, n) => {
    if (Math.abs(n.y) < 0.5) {
      const band = Math.sin(p.y * 60 + noise(p, 0.2, 9) * 6) * 0.5 + 0.5;
      return mix("#6b4429", "#8a5a36", band * 0.6);
    }
    const d = Math.hypot(p.x, p.z);
    const g = mix("#5a9a3c", "#83c052", noise(p, 0.55, 2));
    const dirt = Math.max(
      smoothstep(1.15, 0.6, d),
      smoothstep(0.55, 0.2, Math.hypot(p.x - 0.5, p.z - 2.35)),
      smoothstep(0.45, 0.15, Math.hypot(p.x - 1.9, p.z - 0.1)),
    );
    return mix(g, mix("#8a6a45", "#a8845a", noise(p, 0.3, 4)), dirt * 0.9);
  });

  // flat colours
  const TRIM = "#f2e6c8";
  const WOOD = "#8f5f36";
  const WOOD_D = "#6b4426";
  const GLOW = "#ffd98a";
  const ROPE = "#d8c39a";
  const DECK = ["#b07a45", "#9c6a3b", "#c08a52"];

  // ---------------------------------------------------------------- ground
  b.part(new THREE.CylinderGeometry(3.6, 3.7, 0.18, 16), groundPaint, { at: [0, -0.07, 0], flat: true });

  // ---------------------------------------------------------------- tree
  b.sweep(
    catmull([
      [0, 0, 0],
      [0.06, 1.5, 0.05],
      [-0.05, 3.0, 0],
      [0.1, 4.5, -0.08],
      [0, 6.1, 0],
    ]),
    { radius: [0.52, 0.37, 0.32, 0.27, 0.16], color: bark, caps: { start: "flat", end: "round" }, sides: 10 },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 + 18) * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    b.sweep(
      catmull([
        [dx * 0.2, 0.5, dz * 0.2],
        [dx * 0.62, 0.18, dz * 0.62],
        [dx * 1.08, 0.01, dz * 1.08],
      ]),
      { radius: [0.2, 0.05], color: bark, sides: 7 },
    );
  }
  const branches: number[][][] = [
    [[0, 4.3, 0], [1.0, 4.6, 0.05], [2.0, 4.72, 0.1], [2.8, 5.05, 0.1]],
    [[0, 4.8, 0], [-0.8, 5.5, -0.8], [-1.6, 6.1, -1.35]],
    [[0, 5.0, 0], [0.4, 5.7, 1.0], [0.6, 6.2, 1.6]],
    [[0, 5.3, 0], [0.9, 6.1, -1.0], [1.4, 6.7, -1.4]],
    [[0, 5.5, 0], [-0.9, 6.4, 0.5], [-1.5, 7.0, 0.85]],
  ];
  branches.forEach((pts, i) =>
    b.sweep(catmull(pts), { radius: i === 0 ? [0.2, 0.08] : [0.16, 0.05], color: bark, sides: 7 }),
  );

  // canopy
  const blobs: Array<[number, number, number, number]> = [
    [0, 6.9, 0, 1.5],
    [1.25, 6.45, 0.4, 1.1],
    [-1.2, 6.75, 0.2, 1.1],
    [0.3, 6.55, -1.2, 1.1],
    [-0.4, 6.5, 1.15, 1.0],
    [0.6, 7.7, 0.3, 1.0],
    [-0.6, 7.6, -0.4, 1.0],
    [2.8, 5.35, 0.1, 0.8],
    [2.25, 5.7, -0.5, 0.7],
    [-1.65, 6.25, -1.4, 0.85],
    [0.65, 6.35, 1.75, 0.8],
    [1.45, 6.85, -1.4, 0.8],
    [-1.5, 7.1, 0.9, 0.8],
    [0, 8.3, 0, 0.7],
  ];
  for (const [x, y, z, r] of blobs) {
    b.part(new THREE.IcosahedronGeometry(r, 1), leafPaint, {
      at: [x, y, z],
      rotation: [R() * 360, R() * 360, R() * 360],
      flat: true,
    });
    if (R() < 0.6) {
      for (let k = 0; k < 3; k++) {
        const az = R() * Math.PI * 2;
        const el = (-15 + R() * 70) * DEG;
        const d = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
        const p = new THREE.Vector3(x, y, z).addScaledVector(d, r * 0.92);
        b.part(new THREE.SphereGeometry(0.075, 7, 5), "#d6332a", { at: p });
        b.part(new THREE.BoxGeometry(0.01, 0.05, 0.01), "#4a2e16", { at: [p.x, p.y + 0.08, p.z] });
      }
    }
  }

  // ---------------------------------------------------------------- platform
  const deckY = 3.0;
  for (let i = 0; i < 14; i++) {
    const z = -1.3 + i * 0.2;
    b.part(new THREE.BoxGeometry(3.6 + (hash(i) - 0.5) * 0.08, 0.07, 0.185), DECK[i % 3], {
      at: [-0.8 + (hash(i + 7) - 0.5) * 0.06, deckY - 0.035, z],
    });
  }
  for (const z of [-1.3, 0, 1.3])
    b.part(new THREE.BoxGeometry(3.7, 0.16, 0.12), WOOD_D, { at: [-0.8, deckY - 0.15, z] });
  for (const x of [-2.6, 1.0]) b.part(new THREE.BoxGeometry(0.12, 0.16, 2.9), WOOD_D, { at: [x, deckY - 0.15, 0] });

  // stilts on the cantilevered side
  for (const z of [-1.25, 1.25]) {
    b.rod([-2.45, 0, z], [-2.45, deckY - 0.22, z], 0.09, { color: WOOD_D, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.08, 7), "#9a9a90", { at: [-2.45, 0.03, z], flat: true });
  }
  b.rod([-2.45, 0.3, -1.25], [-2.45, 2.7, 1.25], 0.04, { color: WOOD, sides: 5 });
  b.rod([-2.45, 0.3, 1.25], [-2.45, 2.7, -1.25], 0.04, { color: WOOD, sides: 5 });
  // braces from the trunk
  for (const [x, z] of [
    [0.9, 1.25],
    [0.9, -1.25],
    [-1.0, 1.25],
    [-1.0, -1.25],
  ])
    b.rod([0, 1.85, 0], [x, deckY - 0.2, z], 0.05, { color: WOOD, sides: 6 });

  // railings
  const railH = 0.85;
  const railRun = (ax: number, az: number, cx: number, cz: number) => {
    const len = Math.hypot(cx - ax, cz - az);
    const n = Math.max(1, Math.round(len / 0.7));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.part(new THREE.BoxGeometry(0.08, railH + 0.06, 0.08), WOOD_D, {
        at: [ax + (cx - ax) * t, deckY + (railH + 0.06) / 2, az + (cz - az) * t],
      });
    }
    b.rod([ax, deckY + railH, az], [cx, deckY + railH, cz], 0.035, { color: WOOD, sides: 6, caps: "round" });
    b.rod([ax, deckY + 0.12, az], [cx, deckY + 0.12, cz], 0.025, { color: WOOD, sides: 5 });
    const m = Math.floor(len / 0.15);
    for (let i = 1; i < m; i++) {
      const t = i / m;
      b.part(new THREE.BoxGeometry(0.03, railH - 0.12, 0.03), "#a8743f", {
        at: [ax + (cx - ax) * t, deckY + 0.12 + (railH - 0.12) / 2, az + (cz - az) * t],
      });
    }
  };
  railRun(-2.55, 1.33, 0.15, 1.33);
  railRun(0.92, 1.33, 0.92, -1.33);
  railRun(0.92, -1.33, -0.35, -1.33);
  railRun(-2.55, 1.33, -2.55, 0.72);

  // sign on the front rail
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100"><rect x="4" y="4" width="232" height="92" rx="10" fill="#e6c48a" stroke="#5a3a1e" stroke-width="7"/><circle cx="18" cy="50" r="5" fill="#5a3a1e"/><circle cx="222" cy="50" r="5" fill="#5a3a1e"/><text x="120" y="66" font-family="Comic Sans MS, Chalkboard, sans-serif" font-size="42" font-weight="bold" fill="#8a1f12" text-anchor="middle" transform="rotate(-3 120 50)">KEEP OUT!</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.62, 0.27, 0.03), WOOD_D, { at: [-1.6, deckY + 0.55, 1.37], rotation: [0, 0, 3] });
  b.part(new THREE.PlaneGeometry(0.58, 0.24), "#ffffff", {
    at: [-1.6, deckY + 0.55, 1.39],
    rotation: [0, 0, 3],
    texture: signTex,
  });

  // ladder
  const ladderZ = (y: number) => 2.15 - 0.25 * y;
  for (const x of [0.25, 0.75]) b.rod([x, 0, ladderZ(0)], [x, 3.7, ladderZ(3.7)], 0.04, { color: WOOD, sides: 6 });
  for (let y = 0.3; y < 2.9; y += 0.3) b.rod([0.25, y, ladderZ(y)], [0.75, y, ladderZ(y)], 0.025, { color: "#a8743f", sides: 5 });

  // ---------------------------------------------------------------- cabin
  const hx = -1.4;
  const hz = -0.25;
  const top = deckY + 1.6;
  const front = hz + 0.9;
  b.part(new THREE.BoxGeometry(1.9, 1.6, 1.8), wallPaint, { at: [hx, deckY + 0.8, hz] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.1, 1.62, 0.1), TRIM, { at: [hx + sx * 0.95, deckY + 0.81, hz + sz * 0.9] });
  b.extrude(
    [
      [-0.95, 0],
      [0.95, 0],
      [0, 0.8],
    ],
    { at: [hx, top, hz], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.8, color: wallPaint },
  );
  // roof
  const half = 0.95;
  const rise = 0.8;
  const L = Math.hypot(half, rise);
  const th = Math.atan2(rise, half);
  for (const side of [-1, 1]) {
    const E = new THREE.Vector2(hx + side * half, top);
    const d = new THREE.Vector2((-side * half) / L, rise / L);
    const n = new THREE.Vector2((side * rise) / L, half / L);
    const c = E.clone()
      .addScaledVector(d, (L + 0.05 - 0.3) / 2)
      .addScaledVector(n, 0.05);
    b.part(new THREE.BoxGeometry(L + 0.35, 0.08, 2.2), roofPaint, {
      at: [c.x, c.y, hz],
      rotation: [0, 0, (-side * th) / DEG],
    });
    // fascia boards
    for (const fz of [hz + 1.11, hz - 1.11])
      b.part(new THREE.BoxGeometry(L + 0.35, 0.12, 0.04), TRIM, {
        at: [c.x, c.y - 0.02, fz],
        rotation: [0, 0, (-side * th) / DEG],
      });
  }
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 2.26, 6), "#7d2a1c", { at: [hx, top + rise + 0.06, hz], rotation: [90, 0, 0] });

  // stovepipe + smoke
  b.rod([hx + 0.5, top + 0.25, hz - 0.5], [hx + 0.5, top + 1.05, hz - 0.5], 0.07, { color: "#4d4d52", sides: 8 });
  b.part(new THREE.ConeGeometry(0.13, 0.1, 8), "#3b3b40", { at: [hx + 0.5, top + 1.12, hz - 0.5] });
  [
    [0.55, 1.32, -0.48, 0.09],
    [0.65, 1.52, -0.42, 0.12],
    [0.8, 1.76, -0.36, 0.15],
  ].forEach(([dx, dy, dz, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), "#eeeeea", { at: [hx + dx, top + dy, hz + dz], flat: true }),
  );

  // door
  b.part(new THREE.BoxGeometry(0.55, 1.1, 0.06), doorPaint, { at: [hx + 0.4, deckY + 0.55, front + 0.02] });
  b.part(new THREE.BoxGeometry(0.08, 1.18, 0.05), TRIM, { at: [hx + 0.1, deckY + 0.59, front + 0.03] });
  b.part(new THREE.BoxGeometry(0.08, 1.18, 0.05), TRIM, { at: [hx + 0.7, deckY + 0.59, front + 0.03] });
  b.part(new THREE.BoxGeometry(0.68, 0.08, 0.05), TRIM, { at: [hx + 0.4, deckY + 1.18, front + 0.03] });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), "#d9b23a", { at: [hx + 0.6, deckY + 0.55, front + 0.07] });
  for (const y of [0.25, 0.85])
    b.part(new THREE.BoxGeometry(0.22, 0.04, 0.02), "#2e2e33", { at: [hx + 0.24, deckY + y, front + 0.06] });
  // door sign
  const hqTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70"><rect x="3" y="3" width="194" height="64" rx="30" fill="#2f6b3a" stroke="#f2e6c8" stroke-width="5"/><text x="100" y="47" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#ffe08a" text-anchor="middle">TREE HQ</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.175), "#ffffff", { at: [hx + 0.4, deckY + 1.36, front + 0.012], texture: hqTex });

  // round window
  const rw = new THREE.Vector3(hx - 0.42, deckY + 0.95, front + 0.02);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), GLOW, { at: rw, rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.22, 0.045, 5, 14), TRIM, { at: rw.clone().setZ(front + 0.03) });
  b.part(new THREE.BoxGeometry(0.4, 0.03, 0.03), TRIM, { at: rw.clone().setZ(front + 0.035) });
  b.part(new THREE.BoxGeometry(0.03, 0.4, 0.03), TRIM, { at: rw.clone().setZ(front + 0.035) });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.12), WOOD_D, { at: [rw.x, rw.y - 0.27, front + 0.05] });
  // window box flowers
  for (let i = 0; i < 4; i++)
    b.part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? "#ff7fa8" : "#ffd84a", {
      at: [rw.x - 0.16 + i * 0.105, rw.y - 0.21, front + 0.06],
      flat: true,
    });
  // attic vent
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10), "#3a2416", { at: [hx, top + 0.33, front + 0.01], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.1, 0.025, 4, 12), TRIM, { at: [hx, top + 0.33, front + 0.02] });

  // side window with shutters (left wall)
  const sxw = hx - 0.95;
  b.part(new THREE.BoxGeometry(0.04, 0.52, 0.52), TRIM, { at: [sxw - 0.02, deckY + 0.95, hz] });
  b.part(new THREE.BoxGeometry(0.03, 0.42, 0.42), GLOW, { at: [sxw - 0.035, deckY + 0.95, hz] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.42), TRIM, { at: [sxw - 0.05, deckY + 0.95, hz] });
  b.part(new THREE.BoxGeometry(0.03, 0.42, 0.03), TRIM, { at: [sxw - 0.05, deckY + 0.95, hz] });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.52, 0.24), "#3f7f5a", { at: [sxw - 0.03, deckY + 0.95, hz + s * 0.39] });
    for (const y of [-0.12, 0, 0.12])
      b.part(new THREE.BoxGeometry(0.02, 0.025, 0.18), "#2c5e41", { at: [sxw - 0.055, deckY + 0.95 + y, hz + s * 0.39] });
  }
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.6), WOOD_D, { at: [sxw - 0.05, deckY + 0.67, hz] });

  // lantern under the right eave
  const lx = hx + 1.05;
  const lz = front + 0.12;
  b.rod([lx, top - 0.05, lz], [lx, top - 0.32, lz], 0.008, { color: "#2e2e33", sides: 4 });
  b.part(new THREE.ConeGeometry(0.1, 0.08, 4), "#2e2e33", { at: [lx, top - 0.34, lz], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.11, 0.14, 0.11), "#ffc85a", { at: [lx, top - 0.45, lz] });
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.13), "#2e2e33", { at: [lx, top - 0.535, lz] });

  // bunting from the gable to the porch rail
  const bunting = catmull([
    [hx, top + rise - 0.05, front + 0.3],
    [-0.4, top - 0.15, 1.3],
    [0.92, deckY + railH + 0.05, 1.33],
  ]);
  b.sweep(bunting, { radius: 0.01, color: ROPE, sides: 4 });
  const flagCols = ["#e8453c", "#f2b134", "#3fa7d6", "#7bc950", "#f2e6c8", "#c86fd1"];
  let fi = 0;
  b.along(bunting, 10, (pt) => {
    b.part(new THREE.ConeGeometry(0.07, 0.17, 3), flagCols[fi++ % flagCols.length], {
      at: pt.at.clone().add(new THREE.Vector3(0, -0.09, 0)),
      rotation: [180, 30, 0],
      flat: true,
    });
  });

  // telescope on the back corner of the porch
  const apex = new THREE.Vector3(0.55, deckY + 0.5, -0.9);
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 + 20) * DEG;
    b.rod(apex, [apex.x + Math.sin(a) * 0.22, deckY, apex.z + Math.cos(a) * 0.22], 0.015, { color: "#4a3a2a", sides: 4 });
  }
  b.rod([0.42, deckY + 0.46, -1.02], [0.72, deckY + 0.68, -0.72], [0.045, 0.065], { color: "#c9a227", sides: 8 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#3a2a1a", { at: apex });

  // ---------------------------------------------------------------- swing
  const sw = 1.9;
  for (const dz of [-0.25, 0.25]) {
    b.rod([sw, 4.66, 0.1 + dz], [sw, 0.66, 0.1 + dz], 0.015, { color: ROPE, sides: 4 });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), ROPE, { at: [sw, 4.62, 0.1 + dz] });
  }
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.66), "#c0452f", { at: [sw, 0.63, 0.1] });

  // ---------------------------------------------------------------- birdhouse on the trunk
  const bh = new THREE.Vector3(0.06, 2.0, 0.5);
  b.part(new THREE.BoxGeometry(0.2, 0.24, 0.18), "#5b9bd5", { at: bh });
  b.part(new THREE.ConeGeometry(0.18, 0.13, 4), "#c0452f", { at: [bh.x, bh.y + 0.185, bh.z], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), "#1e1a18", { at: [bh.x, bh.y + 0.03, bh.z + 0.09], rotation: [90, 0, 0] });
  b.rod([bh.x, bh.y - 0.05, bh.z + 0.09], [bh.x, bh.y - 0.05, bh.z + 0.16], 0.008, { color: WOOD_D, sides: 4 });
  b.rod([bh.x, bh.y - 0.12, bh.z - 0.05], [bh.x, bh.y - 0.12, bh.z - 0.15], 0.012, { color: WOOD_D, sides: 4 });

  // ---------------------------------------------------------------- ground props
  // toadstools
  const shrooms: Array<[number, number, number]> = [
    [-0.75, 0.62, 0.1],
    [-0.6, 0.85, 0.07],
    [0.85, -0.6, 0.09],
    [-1.3, -1.6, 0.12],
  ];
  for (const [x, z, r] of shrooms) {
    const h = r * 1.3;
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.45, h, 7), "#f4ead6", { at: [x, h / 2, z] });
    b.part(new THREE.SphereGeometry(r, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d93a2b", { at: [x, h, z], flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.01, 9), "#efe0c0", { at: [x, h + 0.003, z] });
    for (let k = 0; k < 5; k++) {
      const az = R() * Math.PI * 2;
      const el = (25 + R() * 50) * DEG;
      b.part(new THREE.SphereGeometry(r * 0.13, 5, 3), "#ffffff", {
        at: [x + Math.cos(el) * Math.sin(az) * r, h + Math.sin(el) * r, z + Math.cos(el) * Math.cos(az) * r],
      });
    }
  }
  // rocks
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const d = 1.6 + R() * 1.7;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.abs(x - 0.5) < 0.5 && z > 1.6) continue;
    const s = 0.1 + R() * 0.15;
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 2 ? "#8e8e86" : "#a7a79c", {
      at: [x, s * 0.3, z],
      scale: [1, 0.6, 1],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
  }
  // grass tufts and flowers
  const grassCols = ["#4f9a36", "#6fb547", "#3e8530"];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const d = 1.2 + R() * 2.2;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.abs(x - 0.5) < 0.45 && z > 1.7) continue;
    for (let k = 0; k < 3; k++) {
      const h = 0.14 + R() * 0.12;
      b.part(new THREE.ConeGeometry(0.03, h, 3), grassCols[k], {
        at: [x + (R() - 0.5) * 0.1, h / 2, z + (R() - 0.5) * 0.1],
        rotation: [(R() - 0.5) * 30, R() * 360, (R() - 0.5) * 30],
        flat: true,
      });
    }
    if (i % 3 === 0) {
      const h = 0.25 + R() * 0.1;
      b.rod([x, 0, z], [x, h, z], 0.008, { color: "#3e8530", sides: 4 });
      b.part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? "#ff8fb3" : "#ffe14d", { at: [x, h + 0.02, z], flat: true });
      b.part(new THREE.SphereGeometry(0.018, 5, 3), "#c06a1a", { at: [x, h + 0.05, z] });
    }
  }

  return b.root;
}
