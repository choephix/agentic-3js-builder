<!-- call: plan -->

```json
{
  "name": "Arctic Research Outpost",
  "description": "A Firewatch-style flat-colour diorama of a snowbound polar research station: a raised main cabin, a radio mast and dish, a weather and instrument yard, and a fuel and vehicle area, all on a small snow plateau.",
  "builderName": "arcticOutpost",
  "size": [6.0, 5.2, 6.0],
  "layout": "A low snow plateau (about 6 x 6 m, 0.3 m thick) with gently faceted drifts. The main cabin (red-orange walls, cream trim, dark pitched roof with snow cap) sits left of centre (+X) with its door and a porch facing +Z. A tall lattice radio mast with a dish stands at the back (-Z) near the cabin. The weather yard sits at front right (-X, +Z): a Stevenson screen, an anemometer pole, a sample rack and a flag. Right of the cabin (-X) the fuel and vehicle area holds a snowcat, fuel drums and a generator shed. Flat colour only, with warm sunset oranges against cool blue shadows, thin dark window and door outlines as separate small parts, and glowing yellow windows.",
  "palette": {
    "snow": "#f3f1ee",
    "snowShade": "#c5d3e6",
    "snowDeep": "#9fb4d4",
    "ice": "#a9d6e8",
    "cabinRed": "#c9452b",
    "cabinDark": "#8f2f20",
    "trimCream": "#f2e3c0",
    "roofDark": "#3a3f4f",
    "wood": "#6b4a33",
    "woodLight": "#9a7352",
    "steel": "#7c8696",
    "steelDark": "#434b5a",
    "windowGlow": "#ffcf5a",
    "outline": "#2a2230",
    "orange": "#e8892b",
    "yellowCat": "#e3a82a",
    "rubber": "#262a33",
    "flagRed": "#d9342b",
    "drumBlue": "#3f6fa8",
    "drumGreen": "#4f7a4a",
    "rock": "#5e6470",
    "lampGlow": "#fff0a0"
  },
  "mounts": {
    "groundTop": [0, 0.3, 0],
    "cabinFloor": [1.0, 0.3, 0.2],
    "cabinDoor": [1.0, 0.3, 1.5],
    "roofRidge": [1.0, 2.5, 0.2],
    "mastBase": [1.2, 0.3, -2.0],
    "dishMount": [1.2, 4.2, -2.0],
    "yardCenter": [-1.9, 0.3, 1.6],
    "fuelArea": [-1.6, 0.3, -1.2]
  },
  "joints": [],
  "parts": [
    {
      "id": "terrain",
      "builds": "Snow plateau: a faceted wide slab (snow top, snowShade sides, snowDeep base ring), several lumpy drift wedges and low snow mounds against the cabin and edges, a few rock outcrops (rock) poking through, small ice patches (ice), a packed path of snowShade slabs from the cabin door toward the yard, and footprints as tiny dark flat parts. Stays simple, sized to the other pieces.",
      "box": [[-3.0, 0.0, -3.0], [3.0, 0.6, 3.0]],
      "attaches": "Top surface at groundTop (y=0.3); all other parts rest on it.",
      "joints": [],
      "floor": true,
      "budget": 120
    },
    {
      "id": "mainCabin",
      "builds": "The hero: a boxy cabin 3.0 x 2.0 x 2.4 m on short wood stilts/skids, cabinRed walls with horizontal plank lines (cabinDark thin strips), trimCream corner posts, window frames and door frame, outlined windows with windowGlow panes and mullions, a door with handle, a porch with steps, railing and a lamp (lampGlow), a pitched roof of roofDark slabs with a snow cap on top and snow lumps along the eaves, icicles (ice) along the front eave, a steel chimney with a smoke-free cap, a stack of wood logs beside the wall, a hanging orange life ring and a small sign board with a simple emblem on the front.",
      "box": [[-0.5, 0.3, -1.0], [2.5, 2.9, 2.2]],
      "attaches": "Floor at cabinFloor; door at cabinDoor; roof ridge at roofRidge; the back wall faces the mast near mastBase.",
      "joints": [],
      "floor": false,
      "budget": 230
    },
    {
      "id": "radioMast",
      "builds": "Tall lattice radio mast 3.9 m: three tapering steel legs with cross braces and diagonal rods (steel, steelDark), concrete-like base plinth (rock) with guy wires (thin rods) anchored to snow with small stakes, a platform ring near the top with orange and white banded segments, antennas whip rods, a red blinking beacon light (flagRed, glowing) on top, and a parabolic satellite dish (lathe dome in trimCream with steelDark arm and feed horn) at dishMount aimed forward and up. Also a small equipment box on the plinth with outlined door and cables.",
      "box": [[0.2, 0.3, -2.8], [2.2, 5.2, -1.2]],
      "attaches": "Base at mastBase on the terrain; dish at dishMount; sits behind the cabin.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "weatherYard",
      "builds": "The instrument yard at front left: a white Stevenson screen (trimCream, louvre strips, wood legs), an anemometer on a pole (three cups, vane) in orange, a rain and snow gauge cylinder, a wooden sample rack holding ice-core tubes (ice, steel caps), a flagpole with a flagRed flag and a trimCream stripe, a solar panel on a tilted stand (drumBlue with grid lines), a small snow-stake measuring pole with orange bands, and a couple of storage crates (wood, woodLight bands, outline label marks).",
      "box": [[-2.9, 0.3, 0.5], [0.1, 2.8, 2.9]],
      "attaches": "Centred on yardCenter; rests on terrain; path leads toward cabinDoor.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "fuelAndVehicle",
      "builds": "Vehicle and fuel area at back left: a yellowCat snowcat with a boxy cab, tracks (rubber, with tread bars and steel roller wheels), glowing headlights, outlined cab windows with windowGlow, roof rack with a jerrycan and antenna, orange stripe and front blade in steelDark; a rack of fuel drums (drumBlue, drumGreen, orange) with band rings, lids and bungs, tipped with snow caps; a small generator shed (steel walls, roofDark roof, vent grille, exhaust pipe, outline door, small lamp) with hoses and cables running to the cabin; a sled with a tarp load behind the snowcat.",
      "box": [[-3.0, 0.3, -2.9], [0.0, 2.3, 0.4]],
      "attaches": "Centred on fuelArea; rests on terrain; cable from shed runs toward the cabin side wall.",
      "joints": [],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: weatherYard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWeatherYard({ b, J, P, M }: Ctx) {
  const Y = M.yardCenter;
  const g = Y[1];
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0, rx = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [rx, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const X = Y[0], Z = Y[2];

  // Stevenson screen
  const sx = X + 0.5, sz = Z + 0.1;
  for (const dx of [-0.2, 0.2]) for (const dz of [-0.15, 0.15]) box(0.05, 0.5, 0.05, P.wood, sx + dx, g + 0.25, sz + dz);
  box(0.55, 0.4, 0.4, P.trimCream, sx, g + 0.7, sz);
  box(0.62, 0.05, 0.48, P.trimCream, sx, g + 0.93, sz);
  box(0.64, 0.025, 0.5, P.snow, sx, g + 0.97, sz);
  for (let i = 0; i < 6; i++) box(0.5, 0.012, 0.01, P.steel, sx, g + 0.55 + i * 0.058, sz + 0.205);
  box(0.5, 0.2, 0.01, P.outline, sx, g + 0.7, sz + 0.202).scale.set(1, 0.01, 1);

  // Anemometer pole
  const ax = X - 0.3, az = Z - 0.5;
  cyl(0.025, 0.035, 1.9, P.steelDark, ax, g + 0.95, az);
  cyl(0.04, 0.04, 0.08, P.orange, ax, g + 1.92, az);
  box(0.5, 0.02, 0.02, P.orange, ax, g + 1.98, az);
  box(0.02, 0.02, 0.5, P.orange, ax, g + 1.98, az, 0.78);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    b.part(new THREE.SphereGeometry(0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.orange, {
      at: [ax + Math.cos(a) * 0.25, g + 2.0, az + Math.sin(a) * 0.25], rotation: [90, 0, 0],
    });
  }
  box(0.3, 0.03, 0.01, P.trimCream, ax, g + 2.2, az - 0.05);
  box(0.08, 0.1, 0.01, P.trimCream, ax, g + 2.2, az + 0.1);

  // Rain gauge
  const gx = X + 0.8, gz = Z - 0.6;
  cyl(0.09, 0.09, 0.4, P.steel, gx, g + 0.2, gz, 10);
  cyl(0.1, 0.1, 0.03, P.orange, gx, g + 0.42, gz, 10);
  cyl(0.085, 0.085, 0.01, P.snow, gx, g + 0.44, gz, 10);

  // Sample rack with ice cores
  const rx = X - 1.0, rz = Z + 0.9;
  for (const dx of [-0.45, 0.45]) box(0.06, 0.7, 0.06, P.wood, rx + dx, g + 0.35, rz);
  box(1.0, 0.05, 0.1, P.woodLight, rx, g + 0.7, rz);
  box(1.0, 0.05, 0.1, P.woodLight, rx, g + 0.3, rz);
  for (let i = 0; i < 6; i++) {
    const x = rx - 0.4 + i * 0.16;
    cyl(0.04, 0.04, 0.6, P.ice, x, g + 0.5, rz + 0.01, 6);
    cyl(0.045, 0.045, 0.04, P.steel, x, g + 0.82, rz + 0.01, 6);
  }

  // Flagpole
  const fx = X - 0.2, fz = Z + 1.1;
  cyl(0.025, 0.035, 2.5, P.steel, fx, g + 1.25, fz);
  b.part(new THREE.SphereGeometry(0.045, 6, 4), P.orange, { at: [fx, g + 2.52, fz] });
  box(0.6, 0.38, 0.015, P.flagRed, fx + 0.32, g + 2.25, fz);
  box(0.6, 0.07, 0.018, P.trimCream, fx + 0.32, g + 2.25, fz);
  box(0.16, 0.12, 0.12, P.snow, fx, g + 0.04, fz);

  // Solar panel
  const px = X + 0.8, pz = Z + 1.3;
  box(0.05, 0.5, 0.05, P.steelDark, px - 0.3, g + 0.25, pz - 0.1);
  box(0.05, 0.5, 0.05, P.steelDark, px + 0.3, g + 0.25, pz - 0.1);
  box(0.05, 0.28, 0.05, P.steelDark, px, g + 0.14, pz + 0.2);
  box(0.9, 0.04, 0.6, P.steelDark, px, g + 0.6, pz, 0, -30);
  box(0.84, 0.02, 0.54, P.drumBlue, px, g + 0.625, pz + 0.004, 0, -30);
  for (let i = 1; i < 4; i++) box(0.01, 0.022, 0.54, P.steelDark, px - 0.42 + i * 0.21, g + 0.628, pz + 0.004, 0, -30);
  for (let i = 1; i < 3; i++) box(0.84, 0.022, 0.01, P.steelDark, px, g + 0.628 + (i - 1.5) * 0.09, pz + (i - 1.5) * -0.16, 0, -30);

  // Snow stake
  const kx = X + 0.1, kz = Z + 0.9;
  cyl(0.03, 0.03, 1.2, P.trimCream, kx, g + 0.6, kz, 6);
  for (let i = 0; i < 4; i++) cyl(0.034, 0.034, 0.12, P.orange, kx, g + 0.15 + i * 0.28, kz, 6);

  // Crates
  const crate = (x: number, z: number, ry: number, y = g) => {
    box(0.5, 0.4, 0.4, P.wood, x, y + 0.2, z, ry);
    box(0.52, 0.04, 0.42, P.woodLight, x, y + 0.08, z, ry);
    box(0.52, 0.04, 0.42, P.woodLight, x, y + 0.32, z, ry);
    const c = Math.cos(ry * Math.PI / 180), s = Math.sin(ry * Math.PI / 180);
    box(0.18, 0.12, 0.012, P.outline, x + s * 0.205, y + 0.2, z + c * 0.205, ry);
    box(0.5, 0.025, 0.4, P.snow, x, y + 0.41, z, ry);
  };
  crate(X - 1.7, Z + 1.0, 15);
  crate(X - 1.15, Z - 0.5, -10);
  crate(X - 1.15, Z - 0.5, 20, g + 0.4);
}
```

<!-- call: terrain -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTerrain({ b, P }: any) {
  const r = rng(11);
  const flat = { flat: true } as any;
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], rot?: number[]) =>
    b.part(geo, color, { at, rotation: rot, ...flat });

  // Base slab: deep base ring, shaded sides, snow top (octagonal, faceted)
  put(new THREE.CylinderGeometry(3.0, 3.1, 0.12, 8, 1).rotateY(Math.PI / 8), P.snowDeep, [0, 0.06, 0]);
  put(new THREE.CylinderGeometry(2.95, 3.0, 0.14, 8, 1).rotateY(Math.PI / 8), P.snowShade, [0, 0.19, 0]);
  put(new THREE.CylinderGeometry(2.85, 2.95, 0.08, 8, 1).rotateY(Math.PI / 8), P.snow, [0, 0.26, 0]);
  put(new THREE.CylinderGeometry(2.7, 2.8, 0.04, 8, 1).rotateY(Math.PI / 8), P.snow, [0, 0.28, 0]);

  // Drift mounds: squashed low-poly spheres, sunk into the top (y 0.3)
  const mounds: [number, number, number, number, number][] = [
    [2.2, 1.9, 0.55, 0.16, 0.5], [2.6, -0.5, 0.4, 0.12, 0.4], [-2.5, 0.2, 0.5, 0.14, 0.45],
    [-2.3, -2.3, 0.6, 0.18, 0.5], [0.2, -2.6, 0.55, 0.14, 0.45], [2.3, -2.4, 0.5, 0.13, 0.45],
    [-0.8, 2.6, 0.45, 0.1, 0.4], [-0.5, 0.0, 0.35, 0.08, 0.3], [2.0, 1.3, 0.3, 0.1, 0.3],
    [0.4, -0.9, 0.35, 0.09, 0.3],
  ];
  for (const [x, z, rad, h, sz] of mounds) {
    const g = new THREE.SphereGeometry(1, 7, 4);
    const m = b.part(g, P.snow, { at: [x, 0.3, z], scale: [rad, h, rad * (0.7 + sz * 0.5)], rotation: [0, r() * 180, 0], ...flat });
    // shaded lower skirt
    b.part(new THREE.SphereGeometry(1, 7, 3), P.snowShade, {
      at: [x, 0.29, z], scale: [rad * 1.12, h * 0.5, rad * 1.12 * (0.7 + sz * 0.5)], rotation: [0, r() * 180, 0], ...flat,
    });
  }

  // Drift wedges at the edge: shaded wedge with a snow cap
  const wedges: [number, number, number, number][] = [[-1.4, 2.8, 1.2, 10], [1.8, -2.8, 1.4, 170], [-2.9, 1.2, 1.0, 80], [2.9, 0.6, 1.0, -85]];
  for (const [x, z, w, ry] of wedges) {
    put(new THREE.BoxGeometry(w, 0.18, 0.4), P.snowShade, [x, 0.36, z], [0, ry, 14]);
    put(new THREE.BoxGeometry(w * 0.85, 0.08, 0.3), P.snow, [x, 0.46, z], [0, ry, 14]);
  }

  // Rock outcrops
  const rocks: [number, number, number][] = [[-2.7, -0.9, 0.3], [2.7, 1.2, 0.26], [-1.0, -2.8, 0.22], [2.4, -1.6, 0.18], [-2.9, 2.4, 0.2]];
  for (const [x, z, s] of rocks) {
    put(new THREE.IcosahedronGeometry(s, 0), P.rock, [x, 0.3 + s * 0.35, z], [r() * 60, r() * 360, r() * 60]);
    put(new THREE.IcosahedronGeometry(s * 0.55, 0), P.rock, [x + s * 0.9, 0.3 + s * 0.1, z + s * 0.3], [r() * 60, r() * 360, 0]);
    put(new THREE.ConeGeometry(s * 0.6, s * 0.18, 6), P.snow, [x, 0.3 + s * 0.85, z]);
  }

  // Ice patches
  const ice: [number, number, number, number][] = [[-0.3, -1.9, 0.4, 0.28], [1.3, 2.3, 0.3, 0.2], [-1.6, 1.0, 0.25, 0.18], [0.0, 1.0, 0.18, 0.12]];
  for (const [x, z, rx, rz] of ice) {
    put(new THREE.CylinderGeometry(rx, rx, 0.012, 7), P.ice, [x, 0.305, z], [0, r() * 90, 0]);
    put(new THREE.CylinderGeometry(rx * 0.5, rx * 0.5, 0.006, 6), "#d6eef7", [x - rx * 0.2, 0.312, z + rz * 0.2]);
  }

  // Packed path: slabs from cabin door (1,1.5) toward yard (-1.9,1.6)
  const pts: [number, number][] = [[1.0, 1.9], [0.7, 2.05], [0.3, 2.1], [-0.1, 2.05], [-0.5, 1.95], [-0.9, 1.9], [-1.3, 1.85], [-1.7, 1.8]];
  pts.forEach(([x, z], i) => {
    put(new THREE.BoxGeometry(0.4, 0.025, 0.3), P.snowShade, [x, 0.31, z], [0, -10 + i * 4 + r() * 10, 0]);
    put(new THREE.BoxGeometry(0.3, 0.01, 0.2), P.snowDeep, [x + 0.02, 0.325, z], [0, i * 4, 0]);
  });

  // Footprints along the path, alternating
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = 1.0 - t * 2.7, z = 1.75 + Math.sin(t * 3) * 0.12 + (i % 2 ? 0.1 : -0.1);
    put(new THREE.BoxGeometry(0.07, 0.01, 0.15), P.snowDeep, [x, 0.332, z], [0, 90 + (i % 2 ? 6 : -6), 0]);
    put(new THREE.BoxGeometry(0.04, 0.006, 0.05), P.outline, [x, 0.338, z], [0, 90, 0]);
  }
  // Extra prints near vehicle area
  for (let i = 0; i < 6; i++)
    put(new THREE.BoxGeometry(0.07, 0.01, 0.15), P.snowDeep, [-1.4 + i * 0.12, 0.31, -0.3 - i * 0.25 + (i % 2) * 0.1], [0, 15, 0]);
}
```

<!-- call: radioMast -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRadioMast({ b, J, P, M }: Ctx) {
  const [mx, my, mz] = M.mastBase;
  const R = rng(5);
  const baseY = my;
  const plinthH = 0.25;
  const topY = baseY + plinthH;
  const H = 3.9;
  const legR0 = 0.42, legR1 = 0.12;
  const legAng = [90, 210, 330].map((d) => (d * Math.PI) / 180);
  const radAt = (h: number) => legR0 + (legR1 - legR0) * (h / H);
  const legPt = (i: number, h: number): [number, number, number] => [
    mx + Math.cos(legAng[i]) * radAt(h),
    topY + h,
    mz + Math.sin(legAng[i]) * radAt(h),
  ];

  // plinth
  b.part(new THREE.CylinderGeometry(0.62, 0.7, plinthH + 0.02, 8), P.rock, { at: [mx, baseY + plinthH / 2 - 0.01, mz] });
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.05, 8), P.snowShade, { at: [mx, topY + 0.02, mz] });

  // legs
  for (let i = 0; i < 3; i++) {
    b.rod(legPt(i, 0), legPt(i, H), [0.032, 0.02], P.steel);
  }
  // rings, braces
  const levels = [0.0, 0.65, 1.3, 1.95, 2.6, 3.25, H];
  levels.forEach((h, k) => {
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      if (k > 0 && k < levels.length) b.rod(legPt(i, h), legPt(j, h), 0.014, P.steelDark);
      if (k < levels.length - 1) {
        const h2 = levels[k + 1];
        b.rod(legPt(i, h), legPt(j, h2), 0.01, P.steelDark);
        b.rod(legPt(j, h), legPt(i, h2), 0.01, P.steelDark);
      }
    }
  });

  // platform ring with orange/white segments
  const platH = 3.1;
  const platY = topY + platH;
  const pr = radAt(platH) + 0.2;
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
    const p0: [number, number, number] = [mx + Math.cos(a0) * pr, platY, mz + Math.sin(a0) * pr];
    const p1: [number, number, number] = [mx + Math.cos(a1) * pr, platY, mz + Math.sin(a1) * pr];
    b.rod(p0, p1, 0.028, i % 2 ? P.orange : P.trimCream);
    const u0: [number, number, number] = [p0[0], platY + 0.17, p0[2]];
    const u1: [number, number, number] = [p1[0], platY + 0.17, p1[2]];
    b.rod(u0, u1, 0.012, P.steelDark);
    b.rod(p0, u0, 0.01, P.steelDark);
  }
  b.part(new THREE.CylinderGeometry(pr, pr, 0.03, 12), P.steel, { at: [mx, platY - 0.03, mz] });

  // antennas
  const topPos: [number, number, number] = [mx, topY + H, mz];
  b.rod(topPos, [mx, topY + H + 0.5, mz], [0.014, 0.004], P.steelDark);
  [[0.15, 0.25], [-0.15, -0.1], [0.05, -0.2]].forEach(([dx, dz], i) => {
    const bx = mx + dx, bz = mz + dz;
    b.rod([bx, platY, bz], [bx, platY + 0.7 + i * 0.15, bz], [0.01, 0.004], P.steel);
  });
  // beacon
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), P.flagRed, { at: [mx, topY + H + 0.5, mz] }), 2);
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.04, 8), P.steelDark, { at: [mx, topY + H + 0.45, mz] });

  // dish
  const [dx, dy, dz] = M.dishMount;
  const dishAt: [number, number, number] = [dx + 0.05, dy - 0.05, dz + 0.3];
  const dir: [number, number, number] = [0, 0.55, 0.85];
  b.rod([mx, dy - 0.2, mz], [mx, dy + 0.05, mz], 0.035, P.steelDark);
  b.rod([mx, dy, mz], [dishAt[0], dishAt[1], dishAt[2] - 0.05], 0.025, P.steelDark);
  b.lathe(
    [[0, 0], [0.12, 0.02], [0.24, 0.07], [0.34, 0.15], [0.33, 0.16], [0.22, 0.1], [0.1, 0.06], [0, 0.04]],
    { at: dishAt, axis: dir, segments: 14, color: P.trimCream },
  );
  b.rod(dishAt, [dishAt[0], dishAt[1] + 0.3, dishAt[2] + 0.5], 0.01, P.steelDark);
  b.part(new THREE.ConeGeometry(0.035, 0.09, 8), P.steelDark, {
    at: [dishAt[0] + dir[0] * 0.3, dishAt[1] + dir[1] * 0.3, dishAt[2] + dir[2] * 0.3],
    dir: dir.map((v) => -v) as [number, number, number],
  });

  // guy wires + stakes
  const guyH = 2.6;
  for (let i = 0; i < 3; i++) {
    const a = legAng[i] + 0.0;
    const sx = mx + Math.cos(a) * 0.95, sz = mz + Math.sin(a) * 0.6 * 1.0;
    const stake: [number, number, number] = [sx, baseY + 0.02, sz];
    b.rod(legPt(i, guyH), stake, 0.006, P.steelDark);
    b.rod([sx, baseY + 0.12, sz], [sx, baseY - 0.02, sz], 0.02, P.wood);
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.06), P.snow, { at: [sx, baseY + 0.12, sz] });
  }

  // equipment box
  const ex = mx - 0.15, ez = mz + 0.55;
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.26), P.steel, { at: [ex, topY + 0.15 + 0.02, ez] });
  b.part(new THREE.BoxGeometry(0.42, 0.03, 0.28), P.steelDark, { at: [ex, topY + 0.33, ez] });
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.01), P.outline, { at: [ex, topY + 0.16, ez + 0.132] });
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.01), P.steelDark, { at: [ex, topY + 0.16, ez + 0.14] });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), P.lampGlow, { at: [ex + 0.06, topY + 0.16, ez + 0.15] });
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), P.windowGlow, { at: [ex + 0.14, topY + 0.27, ez + 0.14] }), 1.5);
  // cables
  b.sweep([[ex - 0.2, topY + 0.2, ez], [ex - 0.35, topY + 0.04, ez - 0.2], [mx - 0.25, topY + 0.05, mz - 0.1], legPt(0, 0.1)], 0.012, { color: P.rubber });
  b.sweep([[ex + 0.2, topY + 0.2, ez], [ex + 0.45, topY + 0.03, ez + 0.2], [ex + 0.8, baseY + 0.02, ez + 0.5]], 0.012, { color: P.rubber });
  // snow on plinth
  for (let i = 0; i < 4; i++) {
    const a = R() * 6.28;
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.snow, { at: [mx + Math.cos(a) * 0.6, baseY + 0.03, mz + Math.sin(a) * 0.6], scale: [1, 0.4, 1] });
  }
}
```

<!-- call: fuelAndVehicle -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildFuelAndVehicle({ b, J, P, M }: any) {
  const G = M.groundTop[1];
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0, rx = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [rx, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const glowMat = (p: any, s = 1) => p;

  // ---------- SNOWCAT (centre ~ -1.7, z -1.5) ----------
  const cx = -1.85, cz = -1.7;
  // tracks
  for (const s of [1, -1]) {
    const x = cx + s * 0.5;
    box(0.26, 0.34, 1.7, P.rubber, x, G + 0.2, cz);
    box(0.27, 0.1, 1.5, P.rubber, x, G + 0.38, cz);
    for (let i = 0; i < 9; i++) box(0.3, 0.05, 0.07, P.steelDark, x, G + 0.03, cz - 0.78 + i * 0.195);
    for (let i = 0; i < 4; i++) cyl(0.11, 0.11, 0.29, P.steel, x, G + 0.2, cz - 0.6 + i * 0.4, 8, [0, 0, 90]);
    cyl(0.17, 0.17, 0.29, P.steelDark, x, G + 0.22, cz + 0.75, 10, [0, 0, 90]);
    cyl(0.17, 0.17, 0.29, P.steelDark, x, G + 0.22, cz - 0.75, 10, [0, 0, 90]);
  }
  // chassis and body
  box(0.95, 0.3, 1.6, P.yellowCat, cx, G + 0.5, cz);
  box(0.9, 0.35, 0.7, P.yellowCat, cx, G + 0.82, cz + 0.45); // hood
  box(0.92, 0.7, 0.8, P.yellowCat, cx, G + 1.0, cz - 0.4); // cab
  box(0.98, 0.07, 0.86, P.steelDark, cx, G + 1.37, cz - 0.4); // roof
  // orange stripe
  for (const s of [1, -1]) box(0.01, 0.07, 1.55, P.orange, cx + s * 0.48, G + 0.56, cz);
  box(0.92, 0.07, 0.01, P.orange, cx, G + 0.62, cz + 0.81);
  // windows
  box(0.8, 0.4, 0.02, P.outline, cx, G + 1.05, cz + 0.01);
  box(0.74, 0.34, 0.03, P.windowGlow, cx, G + 1.05, cz + 0.015);
  box(0.03, 0.34, 0.035, P.outline, cx, G + 1.05, cz + 0.02);
  for (const s of [1, -1]) {
    box(0.02, 0.44, 0.6, P.outline, cx + s * 0.47, G + 1.05, cz - 0.4);
    box(0.025, 0.36, 0.5, P.windowGlow, cx + s * 0.475, G + 1.05, cz - 0.4);
    box(0.03, 0.4, 0.03, P.outline, cx + s * 0.478, G + 1.05, cz - 0.4);
  }
  // headlights + grille
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 0.05, P.steelDark, cx + s * 0.3, G + 0.85, cz + 0.82, 10, [90, 0, 0]);
    cyl(0.05, 0.05, 0.06, P.lampGlow, cx + s * 0.3, G + 0.85, cz + 0.84, 10, [90, 0, 0]);
  }
  for (let i = 0; i < 4; i++) box(0.4, 0.02, 0.02, P.steelDark, cx, G + 0.72 + i * 0.045, cz + 0.82);
  // blade
  box(1.3, 0.34, 0.07, P.steelDark, cx, G + 0.45, cz + 1.0, 0, -10);
  box(1.3, 0.05, 0.1, P.orange, cx, G + 0.64, cz + 1.0);
  for (const s of [1, -1]) box(0.06, 0.06, 0.3, P.steelDark, cx + s * 0.45, G + 0.5, cz + 0.88);
  // roof rack
  for (const s of [1, -1]) box(0.03, 0.1, 0.8, P.steel, cx + s * 0.42, G + 1.46, cz - 0.4);
  for (let i = 0; i < 4; i++) box(0.88, 0.03, 0.03, P.steel, cx, G + 1.5, cz - 0.75 + i * 0.23);
  // jerrycan
  box(0.2, 0.26, 0.1, P.flagRed, cx - 0.2, G + 1.65, cz - 0.4);
  box(0.08, 0.05, 0.05, P.steelDark, cx - 0.2, G + 1.81, cz - 0.4);
  box(0.16, 0.02, 0.11, P.outline, cx - 0.2, G + 1.66, cz - 0.4);
  // antenna
  cyl(0.008, 0.012, 0.6, P.steelDark, cx + 0.35, G + 1.8, cz - 0.6, 5);
  cyl(0.02, 0.02, 0.03, P.flagRed, cx + 0.35, G + 2.12, cz - 0.6, 6);
  // snow on roof
  box(0.9, 0.04, 0.8, P.snow, cx, G + 1.43, cz - 0.4);

  // ---------- SLED ----------
  const sx = cx, sz = -2.65;
  for (const s of [1, -1]) {
    box(0.07, 0.05, 0.9, P.wood, sx + s * 0.35, G + 0.04, sz);
    box(0.07, 0.07, 0.07, P.wood, sx + s * 0.35, G + 0.08, sz + 0.45, 0, 30);
  }
  box(0.85, 0.05, 0.85, P.woodLight, sx, G + 0.11, sz);
  box(0.7, 0.3, 0.65, P.drumGreen, sx, G + 0.28, sz);
  box(0.5, 0.2, 0.5, P.drumGreen, sx, G + 0.5, sz, 15);
  box(0.72, 0.04, 0.03, P.cabinDark, sx, G + 0.3, sz + 0.2);
  box(0.72, 0.04, 0.03, P.cabinDark, sx, G + 0.3, sz - 0.2);
  box(0.4, 0.04, 0.4, P.snow, sx, G + 0.62, sz, 15);
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 4), P.trimCream, { at: [sx, G + 0.3, sz + 0.34], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 4), P.trimCream, { at: [sx, G + 0.3, sz - 0.34], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4), P.trimCream, { at: [sx, G + 0.15, sz + 0.5], rotation: [0, 0, 0] });

  // ---------- DRUM RACK ----------
  const dx = -0.55, dz = -2.2;
  box(0.9, 0.08, 0.5, P.wood, dx, G + 0.06, dz);
  box(0.9, 0.08, 0.5, P.wood, dx, G + 0.02, dz);
  const cols = [P.drumBlue, P.drumGreen, P.orange, P.drumBlue, P.orange, P.drumGreen];
  for (let i = 0; i < 6; i++) {
    const x = dx + (i % 3 - 1) * 0.28 + (i > 2 ? 0 : 0);
    const z = dz + (i < 3 ? -0.0 : 0.0);
    const row = Math.floor(i / 3);
    const px = dx - 0.28 + (i % 3) * 0.28;
    const pz = dz + (row === 0 ? -0.1 : 0.12);
    const h = 0.55, c = cols[i];
    cyl(0.12, 0.12, h, c, px, G + 0.1 + h / 2, pz, 10);
    for (const y of [0.22, 0.4]) cyl(0.125, 0.125, 0.025, P.steelDark, px, G + 0.1 + y, pz, 10);
    cyl(0.105, 0.105, 0.02, P.steel, px, G + 0.1 + h + 0.01, pz, 10);
    cyl(0.025, 0.025, 0.03, P.outline, px + 0.05, G + 0.1 + h + 0.03, pz, 6);
    if (i % 2 === 0) cyl(0.09, 0.09, 0.03, P.snow, px, G + 0.1 + h + 0.035, pz, 8);
  }
  box(0.14, 0.06, 0.01, P.trimCream, dx - 0.28, G + 0.45, dz - 0.22);

  // ---------- GENERATOR SHED ----------
  const gx = -2.5, gz = -0.5;
  box(0.9, 0.75, 0.7, P.steel, gx, G + 0.38, gz);
  box(1.0, 0.07, 0.8, P.roofDark, gx, G + 0.8, gz, 0, 0);
  box(0.96, 0.07, 0.4, P.roofDark, gx, G + 0.86, gz - 0.1, 0, 12);
  box(0.9, 0.05, 0.5, P.snow, gx, G + 0.9, gz - 0.12, 0, 12);
  for (let i = 0; i < 4; i++) box(0.01, 0.7, 0.02, P.steelDark, gx - 0.3 + i * 0.2, G + 0.38, gz + 0.355);
  box(0.28, 0.5, 0.02, P.outline, gx + 0.2, G + 0.28, gz + 0.36);
  box(0.24, 0.46, 0.02, P.steelDark, gx + 0.2, G + 0.28, gz + 0.37);
  box(0.03, 0.05, 0.03, P.steel, gx + 0.3, G + 0.28, gz + 0.39);
  for (let i = 0; i < 4; i++) box(0.28, 0.02, 0.02, P.outline, gx - 0.25, G + 0.4 + i * 0.05, gz + 0.36);
  cyl(0.04, 0.04, 0.05, P.steelDark, gx - 0.25, G + 0.62, gz + 0.38, 8, [90, 0, 0]);
  cyl(0.03, 0.03, 0.03, P.lampGlow, gx - 0.25, G + 0.62, gz + 0.4, 8, [90, 0, 0]);
  cyl(0.04, 0.04, 0.5, P.steelDark, gx - 0.3, G + 1.15, gz - 0.2, 8);
  cyl(0.06, 0.04, 0.04, P.outline, gx - 0.3, G + 1.42, gz - 0.2, 8);
  box(1.0, 0.03, 0.8, P.snowShade, gx, G + 0.02, gz);
  // cables/hoses toward the cabin (+X)
  const cable = (pts: number[][], c: string, r: number) =>
    b.sweep(pts, r, { color: c, sides: 5 });
  cable([[gx + 0.45, G + 0.15, gz + 0.1], [gx + 0.9, G + 0.03, gz + 0.2], [gx + 1.5, G + 0.04, gz + 0.1], [-0.6, G + 0.03, gz + 0.3], [-0.45, G + 0.3, gz + 0.3]], P.outline, 0.02);
  cable([[gx + 0.45, G + 0.3, gz - 0.1], [gx + 0.9, G + 0.05, gz - 0.05], [gx + 1.5, G + 0.04, gz - 0.2], [-0.6, G + 0.03, gz], [-0.45, G + 0.4, gz + 0.05]], P.orange, 0.015);
  cable([[cx + 0.4, G + 0.5, cz + 0.5], [cx + 0.5, G + 0.03, cz + 0.2], [gx - 0.1, G + 0.03, gz - 0.2], [gx - 0.4, G + 0.15, gz - 0.35]], P.rubber, 0.018);

  // small snow drifts at base
  for (let i = 0; i < 5; i++) {
    const x = -2.8 + R() * 2.6, z = -2.6 + R() * 2.6;
    b.part(new THREE.IcosahedronGeometry(0.1 + R() * 0.06, 0), P.snow, { at: [x, G + 0.02, z], scale: [1.5, 0.4, 1.2], flat: true });
  }
}
```

<!-- call: mainCabin -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMainCabin({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const OUT = P.outline, GLOW = P.windowGlow;
  const cx = 1, cz = 0.2, W = 3.0, D = 2.4, fy = 0.65, H = 1.75;
  const top = fy + H;
  const fz = cz + D / 2; // front face z = 1.4

  // stilts and skids
  for (const sx of [-1, 0, 1]) for (const sz of [-0.9, 0.9]) cyl(0.07, 0.08, 0.35, P.wood, cx + sx * 1.3, 0.47, cz + sz, 6);
  for (const sz of [-1, 1]) box(3.3, 0.08, 0.14, P.woodLight, cx, 0.34, cz + sz * 0.9);
  // floor and walls
  box(W + 0.1, 0.12, D + 0.1, P.wood, cx, fy - 0.06, cz);
  box(W, H, D, P.cabinRed, cx, fy + H / 2, cz);
  // plank lines
  for (let i = 1; i < 8; i++) {
    const y = fy + (i * H) / 8;
    box(W + 0.02, 0.018, 0.02, P.cabinDark, cx, y, fz + 0.005);
    box(W + 0.02, 0.018, 0.02, P.cabinDark, cx, y, cz - D / 2 - 0.005);
    box(0.02, 0.018, D + 0.02, P.cabinDark, cx + W / 2 + 0.005, y, cz);
    box(0.02, 0.018, D + 0.02, P.cabinDark, cx - W / 2 - 0.005, y, cz);
  }
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.12, H, 0.12, P.trimCream, cx + (sx * W) / 2, fy + H / 2, cz + (sz * D) / 2);

  // windows helper (front, back faces along z; sides along x)
  const win = (x: number, y: number, z: number, side: boolean, dir: number) => {
    const w = 0.62, h = 0.55;
    const sw = (a: number, bb: number, c: number, cc: string, ox = 0, oy = 0, oz = 0) =>
      side ? box(c, bb, a, cc, x + ox, y + oy, z + oz) : box(a, bb, c, cc, x + ox, y + oy, z + oz);
    sw(w + 0.2, h + 0.2, 0.03, P.trimCream, 0, 0, 0);
    sw(w + 0.1, h + 0.1, 0.045, OUT, 0, 0, 0.005 * dir);
    const p = glowPane(sw, w, h, dir);
    return p;
  };
  const glowPane = (sw: any, w: number, h: number, dir: number) => {
    const g = sw(w, h, 0.06, GLOW, 0, 0, 0.005 * dir);
    glowMat(g);
    sw(0.04, h, 0.07, P.trimCream, 0, 0, 0.01 * dir);
    sw(w, 0.04, 0.07, P.trimCream, 0, 0, 0.01 * dir);
    return g;
  };
  const glowMat = (p: any) => {
    const m = p.mesh.material.clone();
    m.emissive = new THREE.Color(m.color);
    m.emissiveIntensity = 1;
    p.mesh.material = m;
  };
  win(cx - 0.85, fy + 1.05, fz + 0.01, false, 1);
  win(cx + 0.95, fy + 1.05, fz + 0.01, false, 1);
  win(cx, fy + 1.05, cz - D / 2 - 0.01, false, -1);
  win(cx + W / 2 + 0.01, fy + 1.05, cz, true, 1);
  win(cx - W / 2 - 0.01, fy + 1.05, cz, true, -1);

  // door at x=1
  box(0.78, 1.34, 0.03, P.trimCream, cx, fy + 0.67, fz + 0.01);
  box(0.66, 1.24, 0.04, OUT, cx, fy + 0.62, fz + 0.015);
  box(0.6, 1.18, 0.05, P.woodLight, cx, fy + 0.6, fz + 0.02);
  box(0.4, 0.4, 0.06, P.wood, cx, fy + 0.35, fz + 0.025);
  box(0.4, 0.4, 0.06, P.wood, cx, fy + 0.85, fz + 0.025);
  b.part(new THREE.SphereGeometry(0.035, 6, 4), P.steel, { at: [cx + 0.22, fy + 0.6, fz + 0.07] });

  // porch
  const pz = fz + 0.55;
  box(1.5, 0.1, 1.0, P.woodLight, cx, fy - 0.05, pz - 0.05 + 0.05);
  for (const sx of [-1, 1]) for (const sz of [0.45, -0.1]) cyl(0.05, 0.05, 0.3, P.wood, cx + sx * 0.7, 0.45, pz + sz * 0.9 + 0.05, 6);
  for (let i = 0; i < 3; i++) box(0.9, 0.1, 0.28, i % 2 ? P.wood : P.woodLight, cx, fy - 0.15 - i * 0.12, pz + 0.65 + i * 0.26);
  // railing
  for (const sx of [-1, 1]) {
    box(0.06, 0.8, 0.06, P.wood, cx + sx * 0.72, fy + 0.4, pz + 0.45);
    box(0.06, 0.8, 0.06, P.wood, cx + sx * 0.72, fy + 0.4, pz - 0.45 + 0.05);
    box(0.06, 0.06, 0.96, P.woodLight, cx + sx * 0.72, fy + 0.8, pz + 0.02);
    box(0.04, 0.04, 0.96, P.woodLight, cx + sx * 0.72, fy + 0.45, pz + 0.02);
    for (let k = 0; k < 4; k++) box(0.03, 0.62, 0.03, P.woodLight, cx + sx * 0.72, fy + 0.4, pz - 0.3 + k * 0.22);
  }
  box(1.5, 0.06, 0.06, P.woodLight, cx, fy + 0.8, pz + 0.5);
  // porch lamp
  box(0.14, 0.2, 0.14, P.steelDark, cx + 0.5, fy + 1.5, fz + 0.1);
  glowMat(box(0.1, 0.14, 0.1, P.lampGlow, cx + 0.5, fy + 1.5, fz + 0.1));
  cyl(0.02, 0.02, 0.15, P.steelDark, cx + 0.5, fy + 1.4, fz + 0.04, 6, [90, 0, 0]);

  // roof: two slabs pitched about z-axis
  const pitch = 28;
  const half = W / 2 + 0.3;
  const sl = half / Math.cos((pitch * Math.PI) / 180);
  const rise = Math.tan((pitch * Math.PI) / 180) * (W / 2);
  const ry = top + rise / 2 + 0.05;
  for (const s of [1, -1]) {
    const x = cx + s * (W / 4 + 0.08);
    box(sl, 0.1, D + 0.4, P.roofDark, x, ry, cz, [0, 0, s * -pitch]);
    box(sl * 0.98, 0.1, D + 0.4, P.snow, x - s * 0.0, ry + 0.09, cz, [0, 0, s * -pitch]).mesh.scale.set(1, 0.7, 0.9);
    // eave fascia
    box(0.06, 0.12, D + 0.4, P.trimCream, cx + s * (W / 2 + 0.22), top - 0.0 + 0.0, cz);
    // snow lumps
    for (let i = 0; i < 6; i++) {
      const r = 0.1 + R() * 0.07;
      const m = b.part(new THREE.SphereGeometry(r, 6, 4), P.snow, { at: [cx + s * (W / 2 + 0.18), top + 0.06, cz - D / 2 - 0.1 + i * 0.5] });
      m.mesh.scale.set(1.1, 0.6, 1.1);
    }
  }
  box(0.2, 0.1, D + 0.45, P.snow, cx, top + rise + 0.12, cz);
  box(W + 0.5, 0.1, 0.1, P.roofDark, cx, top + 0.05, cz + D / 2 + 0.2); // gable board
  // gable triangle fronts
  const tri = [[-W / 2, 0], [W / 2, 0], [0, rise], [-W / 2, 0]].slice(0, 3) as [number, number][];
  for (const z of [fz + 0.0, cz - D / 2 - 0.0]) b.extrude(tri, { at: [cx, top, z], x: [1, 0, 0], thickness: 0.06, color: P.cabinDark });
  // attic round vent
  cyl(0.15, 0.15, 0.05, P.trimCream, cx, top + 0.38, fz + 0.06, 10, [90, 0, 0]);
  cyl(0.1, 0.1, 0.06, OUT, cx, top + 0.38, fz + 0.065, 10, [90, 0, 0]);

  // icicles along front eave
  for (let i = 0; i < 14; i++) {
    const x = cx - W / 2 - 0.2 + i * ((W + 0.4) / 13);
    const l = 0.12 + R() * 0.2;
    const ep = x > cx ? -1 : 1;
    const yEave = top - (Math.abs(x - cx) < 0.01 ? 0 : 0) - 0.02;
    b.part(new THREE.ConeGeometry(0.025, l, 5), P.ice, { at: [x, yEave - l / 2 + 0.0, fz + 0.18], rotation: [180, 0, 0] });
    void ep;
  }

  // chimney
  const chx = cx + 0.7, chz = cz - 0.5;
  cyl(0.11, 0.11, 0.9, P.steel, chx, top + 0.55, chz, 8);
  cyl(0.15, 0.15, 0.06, P.steelDark, chx, top + 1.03, chz, 8);
  cyl(0.13, 0.13, 0.04, P.steelDark, chx, top + 0.25, chz, 8);
  box(0.32, 0.1, 0.32, P.steelDark, chx, top + 0.3, chz);

  // log stack beside left wall (-x side)
  const lx = cx - W / 2 - 0.3;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
    const c = (i + r) % 2 ? P.wood : P.woodLight;
    const z = cz - 0.2 + (i - (3 - r) / 2) * 0.2;
    cyl(0.09, 0.09, 0.5, c, lx, 0.4 + r * 0.16, z + 0.0, 7, [0, 0, 90]);
    cyl(0.06, 0.06, 0.01, P.trimCream, lx - 0.26, 0.4 + r * 0.16, z, 7, [0, 0, 90]);
  }
  box(0.7, 0.06, 0.8, P.wood, lx, 0.27 + 0.0, cz - 0.0);

  // life ring on front wall, right of door
  const lrx = cx + 1.0, lry = fy + 0.5;
  b.part(new THREE.TorusGeometry(0.2, 0.06, 6, 14), P.orange, { at: [lrx + 0.1, lry, fz + 0.1] });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    box(0.1, 0.1, 0.05, P.trimCream, lrx + 0.1 + Math.cos(a) * 0.2, lry + Math.sin(a) * 0.2, fz + 0.1).mesh.rotation.z = a;
  }
  box(0.04, 0.12, 0.04, P.steelDark, lrx + 0.1, lry + 0.26, fz + 0.04);

  // sign board above door
  const sy = fy + 1.5;
  box(0.9, 0.3, 0.05, OUT, cx - 0.85, sy - 0.0 - 0.45 + 0.0 - 0.0, fz + 0.04);
  box(0.84, 0.24, 0.06, P.woodLight, cx - 0.85, sy - 0.45, fz + 0.045);
  // emblem: snowflake-ish star + bar
  box(0.2, 0.03, 0.07, OUT, cx - 0.98, sy - 0.45, fz + 0.06);
  box(0.03, 0.2, 0.07, OUT, cx - 0.98, sy - 0.45, fz + 0.06);
  box(0.15, 0.03, 0.07, OUT, cx - 0.98, sy - 0.45, fz + 0.065).mesh.rotation.z = 0.78;
  box(0.15, 0.03, 0.07, OUT, cx - 0.98, sy - 0.45, fz + 0.065).mesh.rotation.z = -0.78;
  for (let i = 0; i < 3; i++) box(0.32 - i * 0.06, 0.03, 0.07, P.cabinDark, cx - 0.7 + (-i * 0.03), sy - 0.5 + i * 0.05, fz + 0.065);

  // snow drift at base of cabin front/back
  for (const [x, z, s] of [[cx - 1.2, cz - 1.1, 0.35], [cx + 0.6, cz - 1.25, 0.3], [cx + 1.6, cz + 0.3, 0.3]] as number[][]) {
    const m = b.part(new THREE.SphereGeometry(s, 6, 4), P.snow, { at: [x, 0.3, z] });
    m.mesh.scale.set(1.5, 0.5, 1.2);
  }
  void frame; void M; void J;
}
```