<!-- call: plan -->

```json
{
  "name": "Frost-Forged Battle Axe",
  "description": "A two-handed League of Legends style battle axe with a rune-etched icy steel double-crescent head, glowing frost crystals, a dark wrapped haft and a spiked pommel, standing upright on its butt.",
  "builderName": "frostForgedBattleAxe",
  "size": [1.0, 1.9, 0.14],
  "layout": "Static prop standing vertically on its pommel spike at y=0, centred on x=0, facing +Z. Haft runs up the Y axis from the pommel (y 0) to the head collar (y about 1.55). The head is a large crescent blade on +X (left) with a smaller crescent and back-spike on -X, plus a crowning spear tip at the top (y 1.9). The blades are thin in Z (about 0.05) and are flat extrusions in the XY plane. Stylized heroic proportions: chunky, oversized blade, bold ornate trim in gold, hard-edged colour blocks, glowing cyan crystals and runes. Every surface is a flat colour; light edge bevel strips (iceEdge) run along blade rims, dark outline pieces sit under gold trim.",
  "palette": {
    "steelDark": "#2d3b52",
    "steelMid": "#5d7ea3",
    "iceBlade": "#a9e4f5",
    "iceEdge": "#eafcff",
    "frostGlow": "#38e4ff",
    "gold": "#e0b244",
    "goldDark": "#8a6422",
    "haftWood": "#3a2a24",
    "leather": "#5a3a2c",
    "leatherDark": "#2c1c18",
    "rune": "#7ff6ff",
    "snow": "#f4fbff"
  },
  "mounts": {
    "pommelBase": [0, 0, 0],
    "gripBottom": [0, 0.18, 0],
    "gripTop": [0, 0.95, 0],
    "collar": [0, 1.5, 0],
    "headCentre": [0, 1.5, 0],
    "spearBase": [0, 1.72, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "haft",
      "builds": "The shaft: octagonal dark wood haft radius 0.028 from y=0.18 to 1.5 with tapered ends; spiral leather grip wraps (leather bands with leatherDark gaps) between y=0.3 and 0.95; gold ring bands at the grip ends and mid-shaft with goldDark rims; a few frost-rime snow patches near the head; small cyan rune diamonds inlaid on the upper shaft y 1.0-1.4; hanging leather strap tassel with a small ice-crystal charm at y~0.95.",
      "box": [[-0.08, 0.18, -0.08], [0.08, 1.5, 0.08]],
      "attaches": "Bottom meets pommel at gripBottom; top enters the head collar at collar.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "pommel",
      "builds": "Butt end: a gold faceted cap and goldDark cup from y=0 to 0.2, a downward steelMid spike tip touching y=0, an ice crystal cluster (3 faceted shards of iceBlade with frostGlow cores) splaying out near y 0.12, and small gold studs around the cap.",
      "box": [[-0.1, 0, -0.1], [0.1, 0.2, 0.1]],
      "attaches": "Top meets haft at gripBottom.",
      "joints": [],
      "floor": true,
      "budget": 90
    },
    {
      "id": "headMain",
      "builds": "Main (+X, left) blade: large crescent extrude, steelMid body with iceBlade inner face, iceEdge bevel strip along the curved cutting edge, gold trim border and goldDark under-outline, 3 jagged icicle teeth on the lower edge, engraved rune glyphs (rune colour, glowing) and a frostGlow crystal inset near the socket, snow tufts on the upper edge. Blade spans x 0.08 to 0.5, y 1.2 to 1.85.",
      "box": [[0.06, 1.2, -0.05], [0.5, 1.85, 0.05]],
      "attaches": "Root plate bolts onto the collar at headCentre, on the +X side.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "headBack",
      "builds": "Counterweight side (-X): smaller crescent blade x -0.38 to -0.06, y 1.3 to 1.75 in steelMid with iceEdge rim, gold trim, plus a long back spike pointing -X made of 3 stacked ice shards, matching rune glyphs mirrored; the same gold border motif as headMain.",
      "box": [[-0.5, 1.25, -0.05], [-0.06, 1.8, 0.05]],
      "attaches": "Root plate on the collar at headCentre, -X side.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "collarCrown",
      "builds": "The central head hub and crown: gold octagonal collar y 1.42-1.62 with goldDark bands and rivets, a large frostGlow crystal gem set in front (+Z) in a gold bezel with four prongs, steelDark socket plates front and back, then a tall spear tip (iceBlade diamond extrude with iceEdge centre ridge, gold base ring) rising from spearBase to y 1.9, and two small side fins of ice beside it.",
      "box": [[-0.08, 1.4, -0.07], [0.08, 1.9, 0.07]],
      "attaches": "Sits on haft top at collar; blades attach at its sides; spear tip rises from spearBase.",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: haft -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHaft({ b, J, P, M }: Ctx) {
  const R = 0.028;
  const y0 = 0.18, y1 = 1.5;
  const GLASS = "#38e4ff";

  // Core octagonal shaft with tapered ends
  b.sweep([[0, y0, 0], [0, y1, 0]], (t: number) => {
    const e = Math.min(t / 0.04, (1 - t) / 0.04, 1);
    return R * (0.8 + 0.2 * e);
  }, { section: { ngon: 8 }, color: P.haftWood, caps: "flat" });

  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);

  // Leather grip: spiral wraps as slanted bands over a dark underlay
  b.part(cyl(R * 1.12, 0.65, 8), P.leatherDark, { at: [0, 0.625, 0] });
  const n = 22;
  for (let i = 0; i < n; i++) {
    const ya = 0.3 + (0.65 * i) / n;
    const h = 0.65 / n;
    const band = new THREE.CylinderGeometry(R * 1.2, R * 1.2, h * 0.62, 8);
    b.part(band, P.leather, { at: [0, ya + h * 0.5, 0], rotation: [i % 2 ? 6 : -6, i * 22, 0] });
  }

  // Gold ring bands with goldDark rims
  const ring = (y: number, w = 0.03, r = R * 1.45) => {
    b.part(cyl(r, w, 8), P.gold, { at: [0, y, 0] });
    for (const s of [-1, 1]) b.part(cyl(r * 1.06, w * 0.28, 8), P.goldDark, { at: [0, y + (s * w) / 2, 0] });
  };
  ring(0.205, 0.04, R * 1.6);
  ring(0.3);
  ring(0.95);
  ring(1.24, 0.026);
  ring(1.47, 0.04, R * 1.55);

  // Frost-rime snow patches near head
  const rg = rng(11);
  for (let i = 0; i < 7; i++) {
    const a = rg() * Math.PI * 2;
    const y = 1.28 + rg() * 0.18;
    const sz = 0.012 + rg() * 0.012;
    b.part(new THREE.SphereGeometry(sz, 6, 4), P.snow, {
      at: [Math.sin(a) * R * 0.95, y, Math.cos(a) * R * 0.95],
      scale: [1, 0.6, 1],
    });
  }

  // Cyan rune diamonds on upper shaft (front)
  for (let i = 0; i < 5; i++) {
    const y = 1.03 + i * 0.075;
    const d = new THREE.OctahedronGeometry(0.014, 0);
    b.part(d, P.rune, { at: [0, y, R * 0.98], scale: [0.8, 1.4, 0.45] });
    b.part(new THREE.OctahedronGeometry(0.007, 0), "#eafcff", { at: [0, y, R * 1.04], scale: [0.8, 1.4, 0.4] });
  }

  // Hanging leather strap tassel with ice charm at y~0.95
  const sx = R * 1.5, sz = 0.0;
  b.part(cyl(0.006, 0.05, 6), P.leatherDark, { at: [sx + 0.01, 0.93, sz], rotation: [0, 0, 90] });
  const loop = new THREE.TorusGeometry(0.02, 0.005, 5, 10);
  b.part(loop, P.leather, { at: [sx + 0.02, 0.9, 0], rotation: [0, 90, 0] });
  b.rod([sx + 0.03, 0.9, 0], [sx + 0.03, 0.8, 0], 0.005, P.leather);
  b.rod([sx + 0.03, 0.9, 0.006], [sx + 0.03, 0.78, 0.012], 0.004, P.leatherDark);
  b.part(new THREE.ConeGeometry(0.012, 0.05, 6), P.leatherDark, { at: [sx + 0.03, 0.775, 0.012], rotation: [180, 0, 0] });
  b.part(cyl(0.01, 0.012, 6), P.gold, { at: [sx + 0.03, 0.795, 0] });
  const charm = new THREE.OctahedronGeometry(0.02, 0);
  b.part(charm, P.iceBlade, { at: [sx + 0.03, 0.75, 0], scale: [0.7, 1.5, 0.7] });
  b.part(new THREE.OctahedronGeometry(0.01, 0), GLASS, { at: [sx + 0.03, 0.75, 0], scale: [0.7, 1.5, 0.7] });
}
```

<!-- call: pommel -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildPommel({ b, P }: any) {
  const r = rng(11);
  const Y: [number, number, number] = [0, 1, 0];

  // Downward steel spike: tip at y=0, widens upward (cone points +Y, so flip it)
  b.part(new THREE.ConeGeometry(0.036, 0.09, 8), P.steelMid, { at: [0, 0.045, 0], rotation: [180, 0, 0], flat: true });
  // goldDark cup under the cap
  b.part(new THREE.CylinderGeometry(0.056, 0.03, 0.06, 8), P.goldDark, { at: [0, 0.115, 0], flat: true });
  // cup rim ring
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.012, 8), P.gold, { at: [0, 0.088, 0], flat: true });
  // faceted gold cap
  b.part(new THREE.CylinderGeometry(0.062, 0.056, 0.05, 8), P.gold, { at: [0, 0.16, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.04, 0.062, 0.022, 8), P.gold, { at: [0, 0.196, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), P.goldDark, { at: [0, 0.2, 0], flat: true });

  // studs around cap
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), P.goldDark, { at: [Math.sin(a) * 0.063, 0.16, Math.cos(a) * 0.063] });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), P.gold, { at: [Math.sin(a) * 0.066, 0.16, Math.cos(a) * 0.066] });
  }
  // dark band under studs
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 8), P.steelDark, { at: [0, 0.136, 0], flat: true });

  // ice crystal shards splaying from the cup
  const shards = [
    { az: 0, tilt: 55, len: 0.115, w: 0.026 },
    { az: 130, tilt: 62, len: 0.095, w: 0.022 },
    { az: 250, tilt: 58, len: 0.105, w: 0.024 },
  ];
  for (const s of shards) {
    const az = (s.az * Math.PI) / 180;
    const t = (s.tilt * Math.PI) / 180;
    const dir = new THREE.Vector3(Math.sin(t) * Math.sin(az), Math.cos(t), Math.sin(t) * Math.cos(az)).normalize();
    const base = new THREE.Vector3(Math.sin(az) * 0.05, 0.1, Math.cos(az) * 0.05);
    const ctr = base.clone().addScaledVector(dir, s.len / 2);
    b.part(new THREE.CylinderGeometry(0.001, s.w, s.len, 6), P.iceBlade, { at: ctr, dir: dir.toArray(), flat: true });
    // glowing core
    const core = base.clone().addScaledVector(dir, s.len * 0.38);
    b.part(new THREE.CylinderGeometry(0.001, s.w * 0.45, s.len * 0.6, 6), P.frostGlow, { at: core, dir: dir.toArray(), flat: true });
    // bright edge sliver
    const tip = base.clone().addScaledVector(dir, s.len * 0.97);
    b.part(new THREE.SphereGeometry(0.005 + r() * 0.002, 5, 4), P.iceEdge, { at: tip });
  }
  // small snow rime on cap top
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.snow, { at: [0.02, 0.208, 0.015], scale: [1, 0.5, 1] });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), P.snow, { at: [-0.018, 0.208, -0.01], scale: [1, 0.5, 1] });
}
```

<!-- call: collarCrown -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCollarCrown({ b, J, P, M }: Ctx) {
  const cx = M.collar[0], cy = M.collar[1];
  const gold = P.gold, gd = P.goldDark, steel = P.steelDark;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });

  // octagonal collar
  part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), gold, [cx, 1.52, 0]);
  // goldDark bands
  for (const y of [1.43, 1.61]) {
    part(new THREE.CylinderGeometry(0.076, 0.076, 0.03, 8), gd, [cx, y, 0]);
    part(new THREE.CylinderGeometry(0.074, 0.074, 0.008, 8), gold, [cx, y + (y < 1.5 ? 0.019 : -0.019), 0]);
  }
  // rivets around the bands
  const r = rng(3);
  for (const y of [1.43, 1.61]) {
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * Math.PI * 2;
      part(new THREE.SphereGeometry(0.008, 6, 4), gold, [cx + Math.sin(a) * 0.077, y, Math.cos(a) * 0.077]);
    }
  }
  // steelDark socket plates front and back
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.1, 0.14, 0.012), steel, [cx, 1.52, s * 0.072]);
    part(new THREE.BoxGeometry(0.114, 0.154, 0.006), gd, [cx, 1.52, s * 0.066]);
  }
  // gem bezel + crystal
  const gz = 0.082;
  part(new THREE.CylinderGeometry(0.04, 0.045, 0.014, 8), gold, [cx, 1.52, gz], { dir: [0, 0, 1] });
  glow(part(new THREE.OctahedronGeometry(0.036), P.frostGlow, [cx, 1.52, gz + 0.015], { scale: [0.9, 1.35, 0.8] }), 1.6);
  part(new THREE.OctahedronGeometry(0.012), P.snow, [cx - 0.008, 1.535, gz + 0.04]);
  // four prongs
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    part(new THREE.ConeGeometry(0.008, 0.035, 6), gold, [cx + dx * 0.047, 1.52 + dy * 0.058, gz + 0.012]);
  }
  // spear base ring
  part(new THREE.CylinderGeometry(0.05, 0.065, 0.04, 8), gold, [cx, 1.64, 0]);
  part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 8), gd, [cx, 1.665, 0]);
  part(new THREE.CylinderGeometry(0.028, 0.045, 0.06, 8), steel, [cx, 1.7, 0]);

  // spear tip: diamond extrude
  const tip = [[0, 0], [0.05, 0.07], [0.036, 0.14], [0, 0.22, "sharp"], [-0.036, 0.14], [-0.05, 0.07]] as any;
  b.extrude(tip, { at: [cx, 1.69, 0], x: [1, 0, 0], thickness: 0.026, bevel: 0.006, color: P.iceBlade });
  // centre ridge
  b.extrude([[0, 0.01], [0.012, 0.07], [0, 0.2, "sharp"], [-0.012, 0.07]] as any,
    { at: [cx, 1.69, 0.012], x: [1, 0, 0], thickness: 0.012, color: P.iceEdge });
  b.extrude([[0, 0.01], [0.012, 0.07], [0, 0.2, "sharp"], [-0.012, 0.07]] as any,
    { at: [cx, 1.69, -0.012], x: [1, 0, 0], thickness: 0.012, color: P.iceEdge });
  // rim outline gold under tip base
  part(new THREE.OctahedronGeometry(0.01), P.rune, [cx, 1.77, 0.018], { scale: [0.7, 1.5, 0.4] });

  // side ice fins
  for (const s of [1, -1]) {
    const fin = [[0, 0], [0.05, 0.03], [0.035, 0.1], [0.01, 0.17, "sharp"], [0.0, 0.09]] as any;
    b.extrude(fin, { at: [cx + s * 0.03, 1.68, 0], x: [s, 0, 0], thickness: 0.016, bevel: 0.003, color: P.iceBlade });
    b.extrude([[0.004, 0.01], [0.03, 0.035], [0.012, 0.13, "sharp"]] as any,
      { at: [cx + s * 0.03, 1.68, 0.007], x: [s, 0, 0], thickness: 0.006, color: P.iceEdge });
  }
  // top cap just below tip
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), gold, [cx, 1.73, 0]);
}
```

<!-- call: headBack -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadBack({ b, J, P, M }: any) {
  const cy = M.headCentre[1];
  const Z = [1, 0, 0];
  // outline helper: extrude in XY plane, x-axis along model X
  const ext = (pts: any[], z: number, t: number, color: string, sm = 0) =>
    b.extrude(pts, { at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0], thickness: t, color, smoothing: sm });

  // crescent outline (x negative outward). Points in absolute model coords (at origin).
  const crescent = (grow: number): any[] => {
    const g = grow;
    return [
      [-0.06, 1.58 + g * 0.5, "sharp"],
      [-0.16, 1.68 + g, ],
      [-0.28, 1.74 + g],
      [-0.38 - g, 1.7 + g, "sharp"],
      [-0.36 - g, 1.58],
      [-0.31, 1.46 - g * 0.5],
      [-0.36 - g, 1.34 - g, "sharp"],
      [-0.24, 1.3 - g],
      [-0.12, 1.38 - g],
      [-0.06, 1.42 - g * 0.5, "sharp"],
    ];
  };

  // root plate bolted on collar
  ext([[-0.02, 1.4], [-0.1, 1.38], [-0.1, 1.62], [-0.02, 1.6]], 0, 0.07, P.steelDark);
  for (const z of [0.04, -0.04]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), P.gold, { at: [-0.07, 1.45, z], dir: [0, 0, z > 0 ? 1 : -1] });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), P.gold, { at: [-0.07, 1.57, z], dir: [0, 0, z > 0 ? 1 : -1] });
  }

  // layered blade: goldDark outline, gold trim, steelMid body, ice inner, glow
  ext(crescent(0.012), 0, 0.044, P.goldDark, 1);
  ext(crescent(0.008), 0, 0.05, P.gold, 1);
  ext(crescent(-0.004), 0, 0.056, P.steelMid, 1);
  // ice inner face (smaller)
  ext([
    [-0.12, 1.57], [-0.2, 1.64], [-0.29, 1.67], [-0.33, 1.62],
    [-0.3, 1.56], [-0.27, 1.5], [-0.3, 1.4], [-0.23, 1.38], [-0.14, 1.44],
  ], 0, 0.06, P.iceBlade, 1);
  // iceEdge rim along outer cutting edge
  const rim = [
    [-0.36, 1.7], [-0.37, 1.62], [-0.35, 1.55], [-0.3, 1.48], [-0.35, 1.36],
  ];
  for (let i = 0; i < rim.length - 1; i++) {
    b.rod([rim[i][0], rim[i][1], 0.03], [rim[i + 1][0], rim[i + 1][1], 0.03], 0.007, P.iceEdge, { sides: 4 });
    b.rod([rim[i][0], rim[i][1], -0.03], [rim[i + 1][0], rim[i + 1][1], -0.03], 0.007, P.iceEdge, { sides: 4 });
  }
  // icicle teeth on lower edge
  for (const [x, y, l] of [[-0.14, 1.36, 0.07], [-0.22, 1.31, 0.08], [-0.3, 1.31, 0.06]] as number[][]) {
    b.spike([x, y, 0], [0, -1, 0], l, 0.016, { color: P.iceEdge, sides: 4 });
  }

  // runes on both faces, front mirrored vs main
  const glyphs = [[-0.2, 1.6], [-0.26, 1.56], [-0.2, 1.52], [-0.25, 1.46]];
  for (const s of [1, -1]) {
    glyphs.forEach(([x, y], i) => {
      b.part(new THREE.OctahedronGeometry(0.014), P.rune, { at: [x, y, s * 0.031], scale: [1, 1.6, 0.4], rotation: [0, 0, i * 20] });
      if (i % 2 === 0) b.rod([x, y, s * 0.031], [x - 0.04, y - 0.02, s * 0.031], 0.004, P.rune, { sides: 4 });
    });
  }
  // frost crystal near socket
  for (const s of [1, -1])
    b.part(new THREE.OctahedronGeometry(0.02), P.frostGlow, { at: [-0.12, 1.5, s * 0.03], scale: [0.8, 1.3, 0.5] });

  // back spike: 3 stacked ice shards pointing -X
  const shards: [number, number, number, number][] = [
    [-0.3, 1.52, -0.5, 0.034],
    [-0.38, 1.52, -0.5, 0.026],
    [-0.44, 1.52, -0.5, 0.018],
  ];
  shards.forEach(([x, y, tip, r], i) => {
    const len = 0.14 - i * 0.015;
    b.spike([x + 0.0, y, 0], [-1, 0, 0], len, r, { color: i === 1 ? P.iceEdge : P.iceBlade, sides: 4 });
    b.spike([x + 0.02, y, 0], [-1, 0, 0], len * 0.7, r * 0.5, { color: P.frostGlow, sides: 4 });
  });
  // gold collar ring at spike base
  b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.025, 8), P.gold, { at: [-0.28, 1.52, 0], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.008, 8), P.goldDark, { at: [-0.265, 1.52, 0], dir: [1, 0, 0] });
  // snow tufts on upper edge
  const r = rng(11);
  for (let i = 0; i < 4; i++) {
    const x = -0.14 - i * 0.065;
    b.part(new THREE.IcosahedronGeometry(0.012 + r() * 0.006, 0), P.snow, { at: [x, 1.69 + i * 0.012, 0], scale: [1.4, 0.8, 1.2] });
  }
}
```

<!-- call: headMain -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadMain({ b, J, P, M }: Ctx) {
  const X: [number, number, number] = [1, 0, 0];
  const Z: [number, number, number] = [0, 0, 1];
  const ex = (pts: any[], color: string, z0: number, thick: number, bevel = 0.004) => {
    const p = b.extrude(pts, { at: [0, 0, z0], x: X, y: [0, 1, 0], thickness: thick, color, bevel, smoothing: 0 } as any);
    return p;
  };
  // Crescent outline: root at x 0.08, sweeping to tips at top (0.46,1.85) and bottom (0.5,1.2)
  const outer: any[] = [
    [0.08, 1.4], [0.1, 1.62], [0.18, 1.78, "sharp"], [0.32, 1.85, "sharp"], [0.46, 1.85, "sharp"],
    [0.4, 1.74], [0.45, 1.62], [0.5, 1.5], [0.46, 1.36], [0.5, 1.2, "sharp"], [0.36, 1.26], [0.2, 1.3], [0.08, 1.34],
  ];
  const grow = (pts: any[], k: number, cx: number, cy: number) =>
    pts.map(([x, y, s]) => (s ? [cx + (x - cx) * k, cy + (y - cy) * k, s] : [cx + (x - cx) * k, cy + (y - cy) * k]));
  const cx = 0.3, cy = 1.52;
  // dark outline under gold trim
  ex(grow(outer, 1.04, cx, cy), P.goldDark, 0, 0.044, 0.002);
  // gold trim
  ex(grow(outer, 1.02, cx, cy), P.gold, 0, 0.05, 0.003);
  // steel body
  ex(outer, P.steelMid, 0, 0.056, 0.004);
  // ice inner face
  const inner: any[] = [
    [0.13, 1.42], [0.15, 1.6], [0.22, 1.72], [0.34, 1.78], [0.4, 1.7], [0.38, 1.58], [0.4, 1.48], [0.37, 1.36], [0.28, 1.34], [0.18, 1.37],
  ];
  const inn = ex(inner, P.iceBlade, 0.0, 0.064, 0.003);
  // iceEdge bevel strip along cutting edge (outer curve)
  const edge: [number, number][] = [[0.46, 1.85], [0.4, 1.74], [0.45, 1.62], [0.5, 1.5], [0.46, 1.36], [0.5, 1.2]];
  for (let i = 0; i < edge.length - 1; i++) {
    const a = edge[i], c = edge[i + 1];
    b.rod([a[0] - 0.012, a[1], 0.03], [c[0] - 0.012, c[1], 0.03], 0.007, P.iceEdge, { sides: 4 } as any);
    b.rod([a[0] - 0.012, a[1], -0.03], [c[0] - 0.012, c[1], -0.03], 0.007, P.iceEdge, { sides: 4 } as any);
  }
  // icicle teeth on lower edge
  const teeth: [number, number, number][] = [[0.38, 1.27, 0.07], [0.27, 1.3, 0.09], [0.17, 1.33, 0.06]];
  for (const [x, y, l] of teeth) {
    b.spike([x, y, 0], [0, -1, 0], l, 0.022, { color: P.iceBlade, sides: 4, caps: "point" } as any);
    b.spike([x, y, 0.0], [0, -1, 0], l * 0.6, 0.01, { color: P.iceEdge, sides: 4 } as any).mesh.position.z += 0.0;
  }
  // root plate bolting to collar
  ex([[0.06, 1.38], [0.12, 1.38], [0.12, 1.66], [0.06, 1.66]], P.steelDark, 0, 0.07, 0.006);
  for (const y of [1.42, 1.62]) {
    for (const z of [0.038, -0.038])
      b.part(new THREE.SphereGeometry(0.009, 6, 4), P.gold, { at: [0.09, y, z] });
  }
  // frost crystal inset near socket
  const cry = b.part(new THREE.OctahedronGeometry(0.03, 0), P.frostGlow, { at: [0.17, 1.52, 0.036], scale: [0.8, 1.4, 0.5] });
  glow(cry, 1.5);
  b.part(new THREE.TorusGeometry(0.034, 0.005, 4, 8), P.gold, { at: [0.17, 1.52, 0.034] });
  // runes: small glowing strokes
  const r = rng(5);
  const runes: [number, number][] = [[0.26, 1.64], [0.3, 1.56], [0.27, 1.46], [0.33, 1.4], [0.34, 1.7]];
  for (const [x, y] of runes) {
    for (const z of [0.034, -0.034]) {
      const s = z > 0 ? 1 : -1;
      const h = 0.03 + r() * 0.02;
      glow(b.part(new THREE.BoxGeometry(0.008, h, 0.004), P.rune, { at: [x, y, z] }), 1.3);
      glow(b.part(new THREE.BoxGeometry(0.026, 0.007, 0.004), P.rune, { at: [x + 0.01 * s, y + h * 0.2, z] }), 1.3);
      glow(b.part(new THREE.BoxGeometry(0.018, 0.007, 0.004), P.rune, { at: [x - 0.008, y - h * 0.3, z], rotation: [0, 0, 35] } as any), 1.3);
    }
  }
  // snow tufts on upper edge
  const snow: [number, number, number][] = [[0.2, 1.79, 0.03], [0.3, 1.84, 0.035], [0.4, 1.85, 0.03], [0.14, 1.7, 0.025]];
  for (const [x, y, s] of snow) {
    b.part(new THREE.IcosahedronGeometry(s, 0), P.snow, { at: [x, y, 0.0], scale: [1.2, 0.7, 0.9] });
    b.part(new THREE.IcosahedronGeometry(s * 0.6, 0), P.snow, { at: [x + 0.03, y - 0.005, 0.015] });
  }
  // gold studs along trim
  for (const [x, y] of [[0.1, 1.5], [0.18, 1.76], [0.12, 1.36]] as [number, number][])
    for (const z of [0.03, -0.03]) b.part(new THREE.SphereGeometry(0.008, 6, 4), P.gold, { at: [x, y, z] });
}
```