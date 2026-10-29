<!-- call: plan -->

```json
{
  "name": "Lumivine Spire-Bloom",
  "description": "A Pandora-style bioluminescent alien plant: a curved, ridged stem crowned with eight huge arching leaves veined in glowing cyan, a magenta-and-white flower core, hanging glow-bulb tendrils, and a ring of luminous ground flora at its feet.",
  "builderName": "lumivineSpireBloom",
  "size": [2.8, 3.3, 2.8],
  "layout": "A single hero plant, centred on x=0, standing on y=0. From the side the silhouette is a tall S-curved stem (leaning very slightly toward +Z at the top) that flares into buttress roots at the base. The stem ends in a crown at about y=2.55 holding eight broad, drooping-then-upturned leaf fronds fanned out radially (reaching about 1.35 m from the axis, with the two front fronds pointing toward +Z). Their upper surfaces are deep teal and their undersides violet. The fronds are the largest shapes. A glowing flower bulb with a ring of white and magenta petals and gold stamens rises from the middle of the fronds, topping out at y=3.3. From a ring around the crown just under the fronds, long thin tendrils hang down 0.8-1.3 m, each ending in a glowing bulb. Around the base lie a low mossy mound, glowing mushroom disks, spiral fan plants and sprouts, all inside a 2.6 m footprint. Avatar/Pandora look: dark indigo-teal bodies (flat colours, lit by place: lighter teal moss on top faces, violet shadow undersides), and every glowing piece is a small part in its own bright flat colour wrapped in glow(). Glow is used with discipline: cyan veins and rims on the leaves, magenta tips and bulbs, mint and violet spots on the stem and ground. The model is built from blocky, faceted primitives with low segment counts (6-8 sides), and the character comes from repeated motifs: glowing vein lines, dotted spots, and paired spirals.",
  "palette": {
    "soilDark": "#121a2a",
    "rockBlue": "#2a3550",
    "trunkDark": "#1f2b3d",
    "trunkMid": "#2e4a5e",
    "trunkLight": "#3f7080",
    "barkRidge": "#162030",
    "mossTeal": "#1f6f6a",
    "mossLight": "#3fb8a0",
    "leafDeep": "#15405a",
    "leafMid": "#1f6f8a",
    "leafTeal": "#2fb5a8",
    "shadowViolet": "#2a1a4a",
    "veinCyan": "#3ff5ff",
    "glowMint": "#7dffc8",
    "glowMagenta": "#ff4fd8",
    "tipPink": "#ff8ae8",
    "glowViolet": "#a46bff",
    "glowBlue": "#4aa8ff",
    "petalWhite": "#d8f6ff",
    "stamenGold": "#ffe27a"
  },
  "mounts": {
    "stemBase": [0, 0.45, 0],
    "stemMid": [0.03, 1.2, 0.05],
    "stemUpper": [0.02, 1.9, 0.15],
    "crownBase": [0, 2.5, 0.2],
    "frondRing": [0, 2.55, 0.2],
    "bloomCenter": [0, 2.75, 0.2],
    "tendrilRing": [0, 2.45, 0.2],
    "moundTop": [0, 0.4, 0]
  },
  "joints": [
    { "name": "base", "at": [0, 0.3, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "stem1", "parent": "base", "at": [0, 0.45, 0], "dir": [0, 1, 0.05], "role": "spine" },
    { "name": "stem2", "parent": "stem1", "at": [0.03, 1.2, 0.05], "dir": [0, 1, 0.1], "role": "spine" },
    { "name": "stem3", "parent": "stem2", "at": [0.02, 1.9, 0.15], "dir": [0, 1, 0.05], "role": "spine" },
    { "name": "crown", "parent": "stem3", "at": [0, 2.5, 0.2], "dir": [0, 1, 0], "role": "spine" }
  ],
  "parts": [
    {
      "id": "rootsMound",
      "builds": "Foundation. A low faceted soil/rock mound (flattened lathe or squashed 8-sided spheres in soilDark and rockBlue) about 1.9 m across and 0.35 m high, topped with mossTeal and mossLight patches on the upward faces. Six to seven thick buttress roots (tapered sweeps, trunkDark shading to trunkMid) flare out from the stem base at mound level, curve down into the soil and reach about 0.9 m from the axis. Each root carries a thin glowing vein line (veinCyan or glowViolet) and a few small glowing nodes (glowMint). Some pale moss tufts and small pebbles sit on the mound. Colour by place: light moss on top, soilDark at the edges, violet shadow at the root undersides.",
      "box": [[-1.0, 0, -1.0], [1.0, 0.55, 1.0]],
      "attaches": "The root tops converge on stemBase, where the stem tube starts. The mound top is at moundTop; the ground flora part sits around and on the mound's outer edge.",
      "joints": ["base"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "stem",
      "builds": "The main stem: one smooth-skinned sweep or loft through stemBase, stemMid, stemUpper and crownBase, with the joints base, stem1, stem2, stem3 and crown as its bone list. Radius is about 0.26 at the bottom, narrowing to 0.17 at the waist and flaring to 0.24 under the crown. The section is a faceted 7-8-sided ngon coloured by trunkDark with countershaded sectors (trunkMid on the sides, trunkLight along the up-facing back, shadowViolet underneath). Details: 8-10 raised ring ridges (barkRidge) around the stem, small spiralling rows of glowing spots (glowMint and veinCyan, about 3 cm) winding up the stem, 3-4 short side spurs/nubs with glowing tips (glowMagenta), a glowing vein line running up the front (veinCyan, thin sweep on sweep.line or sweep.at), and a collar of small trunkLight scales where the stem meets the crown. The crown collar is a short flared lathe at crownBase that the fronds and bloom rise from.",
      "box": [[-0.5, 0.4, -0.5], [0.5, 2.6, 0.6]],
      "attaches": "Starts at stemBase (inside the root cluster) and ends at crownBase, where the collar sits. The fronds' stalks root in the collar at frondRing and the tendrils' tops attach under it at tendrilRing.",
      "joints": ["base", "stem1", "stem2", "stem3", "crown"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "frondCrown",
      "builds": "Eight huge leaf fronds fanned radially around frondRing, the dominant silhouette. Each has a thick tapered stalk (sweep, trunkMid) rising out 0.25 m and then a broad leaf blade (extrude with smoothing, leaf outline with a pointed tip, about 0.55 m wide by 1.1 m long, thin) that arches up and out and droops toward the tip. Fronds rotate in 45° steps; two point forward (+Z) and two back, with alternating lengths (1.1 and 0.9 m) and elevation (some lifted +25°, some drooping -15°) so the crown is not uniform. Upper faces are leafMid with a leafTeal edge strip; a leafDeep strip runs on the midrib; undersides use shadowViolet (a second slightly larger offset blade or sectors). Glowing detail on each blade: a central midrib (veinCyan sweep) with 4-5 pairs of angled side veins (thin extruded or swept lines, veinCyan fading to glowMint farther out), a glowMagenta rim blob or spike at the tip with tipPink highlight, and 5-6 small dots (glowBlue) near the edges. Use glow() on the veins, tips and dots only; leaf bodies are not glowing.",
      "box": [[-1.4, 2.1, -1.3], [1.4, 3.05, 1.5]],
      "attaches": "Stalks root at frondRing on the stem collar and ride the joint crown. They leave the middle free: the bloom rises from bloomCenter inside the ring of stalks, and the tendrils hang from tendrilRing below the blades.",
      "joints": ["crown"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "bloomTendrils",
      "builds": "The flower and the hanging tendrils. (1) The central bloom at bloomCenter: a small squat stalk (trunkLight), a glowing bulb core (8-sided sphere, glowMagenta, about 0.16 m radius) wrapped by two rings of petals (extrudes with pointed outlines, inner ring petalWhite, outer ring tipPink fading to glowViolet), 6 petals each, opening upward to y=3.3 at the tallest. In the middle stands a cluster of 7-9 thin stamens (swept lines, stamenGold, each ending in a small glowing glowMint bead) and a pistil spike (veinCyan). Four floating spore motes (small octahedron/sphere parts, glowMint and glowViolet) hover 0.1-0.4 m above the petals. (2) Tendrils: 12-14 thin, gently curved sweeps hang from a ring of radius 0.4 at tendrilRing (just under the fronds), down 0.8-1.3 m with varied lengths and slight swing outward, coloured by gradient (trunkMid at the top to glowViolet at the bottom). Each tendril has a glowing bulb at its tip (alternating glowMagenta, glowBlue, glowMint, 3-5 cm) and 2-3 small beads strung along it. A few hang forward and low as shorter tassels. Keep all tendrils at least 0.32 m from the stem axis so they do not cut into it.",
      "box": [[-0.8, 1.1, -0.65], [0.8, 3.3, 0.9]],
      "attaches": "The bloom stalk rises from bloomCenter above the stem collar and sits between the frond stalks. The tendril tops attach on tendrilRing under the crown collar and hang down alongside the stem.",
      "joints": ["crown"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "groundFlora",
      "builds": "Luminous understory growing around and on the outer edge of the mound, inside a 2.6 m footprint but outside radius 0.5 around the stem. (1) Five to six mushroom/disk plants: thin stalks (trunkMid) with flat 8-sided cap discs (leafMid or shadowViolet) from 0.08 to 0.25 m wide, each with a glowing underside ring (glowBlue or glowViolet) and glowing rim dots (veinCyan). (2) Three spiral fan plants (Helicoradian-style): short stem sweeps that carry a spiral ring of thin leaflets or fans (6-8 thin extruded blades around a ring, leafTeal with glowMagenta tips), up to 0.55 m tall; at least one in each front quadrant. (3) 12-16 sprout shoots: tiny curled tendril sweeps (spiral paths) with a glowMint or glowMagenta bead at the tip, 0.1-0.4 m tall, plus tufts of 4-5 thin blades of leafTeal/mossLight. (4) 6-8 glowing seed pods lying on the ground (squashed 6-sided spheres, glowViolet and glowMint, 4-8 cm) and a handful of small rocks (rockBlue). Spread everything evenly, with the front (+Z) in the same density as the back, and keep every piece grounded.",
      "box": [[-1.3, 0, -1.3], [1.3, 0.9, 1.3]],
      "attaches": "Rests on the floor at the mound's edge and lightly on its outer slope (mound top at moundTop is at most 0.4 m high); keeps clear of the buttress roots near the stem.",
      "joints": ["base"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: stem -->

```ts
import * as THREE from "three";
import { catmull, rng, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildStem({ b, J, P, M }: any) {
  const R = rng(11);
  const g = glowKit;
  const path = catmull([M.stemBase, M.stemMid, M.stemUpper, M.crownBase]);
  const bones = [J.base, J.stem1, J.stem2, J.stem3, J.crown];
  const rad = (t: number) => {
    // 0.26 bottom, 0.17 waist, 0.24 under crown
    if (t < 0.45) return 0.26 - (0.09 * t) / 0.45;
    return 0.17 + (0.07 * (t - 0.45)) / 0.55;
  };
  const stem = b.sweep(path, rad, {
    bone: bones,
    color: P.trunkDark,
    section: { ngon: 8 },
    caps: "flat",
    sectors: [
      [40, 140, P.trunkMid],
      [220, 320, P.trunkMid],
      [-35, 35, P.trunkLight],
      [145, 215, P.shadowViolet],
    ],
  });

  // ring ridges
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + (i / 8) * 0.88;
    const p = stem.at(t, 0);
    const r = rad(t) + 0.012;
    const ring = b.sweep(
      b.ring(p.moved ? p : p, { count: 10, radius: r }).items,
      0.014,
      { color: P.barkRidge },
    );
    void ring;
  }

  // spiral glowing spots
  for (let k = 0; k < 2; k++) {
    const col = k ? P.veinCyan : P.glowMint;
    for (let i = 0; i < 14; i++) {
      const t = 0.1 + i * 0.062;
      const ang = k * 180 + i * 50;
      const hit = stem.at(t, ang);
      glow(
        b.stick(new THREE.SphereGeometry(0.016, 6, 4), col, hit, { embed: 0.3 }),
        1.3,
      );
    }
  }

  // front vein line
  const front = [];
  for (let i = 0; i <= 10; i++) {
    const t = 0.08 + i * 0.085;
    const h = b.surface(stem).around([0, 0, 0]);
    void h;
    const p = stem.at(t, 90 + 90);
    front.push(p);
  }
  // spots along the belly-front: small veins as stuck dots
  for (let i = 0; i < 12; i++) {
    const t = 0.08 + i * 0.075;
    const hit = stem.at(t, 270 + Math.sin(i) * 8);
    glow(
      b.stick(new THREE.BoxGeometry(0.014, 0.05, 0.01), P.veinCyan, hit, { embed: 0.3 }),
      1.5,
    );
  }

  // side spurs with magenta tips
  const spurs: [number, number][] = [
    [0.25, 100],
    [0.4, 260],
    [0.6, 80],
    [0.75, 280],
  ];
  for (const [t, a] of spurs) {
    const hit = stem.at(t, a);
    b.stick(new THREE.ConeGeometry(0.04, 0.14, 6), P.trunkMid, hit, { embed: 0.2 });
    const tip = hit.moved([0, 0.15, 0]);
    glow(b.stick(new THREE.SphereGeometry(0.03, 6, 4), P.glowMagenta, tip, { embed: 0.2 }), 1.6);
  }

  // collar scales
  const crown = stem.at(0.93, 0);
  const sc = b.ring(crown, { count: 12, radius: 0.22 });
  for (const it of sc.items) {
    b.stick(new THREE.BoxGeometry(0.07, 0.06, 0.015), P.trunkLight, it, { embed: 0.3 });
  }

  // flared collar lathe
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.27, 0.05],
      [0.3, 0.1],
      [0.2, 0.12],
      [0, 0.12],
    ],
    { at: [M.crownBase[0], M.crownBase[1] - 0.06, M.crownBase[2]], segments: 8, bone: J.crown, color: P.trunkMid },
  );
  b.lathe(
    [
      [0, 0],
      [0.31, 0],
      [0.31, 0.015],
      [0, 0.015],
    ],
    { at: [M.crownBase[0], M.crownBase[1] + 0.055, M.crownBase[2]], segments: 8, bone: J.crown, color: P.mossLight },
  );
  void R;
  void g;
}
```

<!-- call: rootsMound -->

```ts
import * as THREE from "three";
import { rng, catmull, glow } from "agentic-3js-builder";

export function buildRootsMound({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const base = J.base;
  const TAU = Math.PI * 2;
  const stemBase = M.stemBase;

  // ---- Mound: layered squashed faceted spheres ----
  const mound = (r: number, h: number, y: number, color: string, x = 0, z = 0, rot = 0) =>
    b.part(new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, Math.PI / 2), color, {
      bone: base,
      at: [x, y, z],
      scale: [r, h, r],
      rotation: [0, rot, 0],
      flat: true,
    });
  mound(0.98, 0.3, 0, P.soilDark);
  mound(0.82, 0.36, 0.0, P.rockBlue, 0, 0, 20);
  mound(0.6, 0.4, 0.0, P.soilDark, 0, 0, 10);
  // rim rocks at the mound edge
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + R() * 0.3;
    const r = 0.82 + R() * 0.12;
    const s = 0.07 + R() * 0.07;
    b.part(new THREE.IcosahedronGeometry(s, 0), i % 3 ? P.rockBlue : P.soilDark, {
      bone: base,
      at: [Math.sin(a) * r, s * 0.35, Math.cos(a) * r],
      scale: [1.2, 0.7, 1],
      rotation: [R() * 60, R() * 360, R() * 60],
      flat: true,
    });
  }

  // ---- Moss patches on the upward faces ----
  const moundH = (r: number) => 0.3 * Math.sqrt(Math.max(0, 1 - (r / 0.98) ** 2)) + 0.02;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + R() * 0.3;
    const r = 0.45 + R() * 0.4;
    const s = 0.1 + R() * 0.1;
    const y = moundH(r) + 0.04;
    b.part(new THREE.SphereGeometry(1, 7, 4, 0, TAU, 0, Math.PI / 2), i % 2 ? P.mossTeal : P.mossLight, {
      bone: base,
      at: [Math.sin(a) * r, y - 0.03, Math.cos(a) * r],
      scale: [s, 0.035, s * 0.8],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
  }

  // ---- Moss tufts ----
  for (let i = 0; i < 9; i++) {
    const a = R() * TAU;
    const r = 0.5 + R() * 0.35;
    const y = moundH(r) + 0.02;
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.015, 0.09 + R() * 0.05, 4), k % 2 ? P.mossLight : P.leafTeal, {
        bone: base,
        at: [Math.sin(a) * r + (k - 1) * 0.02, y + 0.04, Math.cos(a) * r + (R() - 0.5) * 0.03],
        rotation: [(R() - 0.5) * 40, 0, (R() - 0.5) * 40],
        flat: true,
      });
    }
  }

  // ---- Pebbles ----
  for (let i = 0; i < 8; i++) {
    const a = R() * TAU;
    const r = 0.35 + R() * 0.5;
    const s = 0.02 + R() * 0.03;
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 2 ? P.rockBlue : P.trunkMid, {
      bone: base,
      at: [Math.sin(a) * r, moundH(r) + s * 0.4, Math.cos(a) * r],
      scale: [1, 0.7, 1],
      flat: true,
    });
  }

  // ---- Buttress roots ----
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU + 0.2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const reach = 0.85 + R() * 0.1;
    const path = catmull([
      [dx * 0.04, stemBase[1] + 0.12, dz * 0.04],
      [dx * 0.2, 0.52, dz * 0.2],
      [dx * 0.45, 0.4, dz * 0.45],
      [dx * 0.68, 0.2, dz * 0.68],
      [dx * reach, 0.03, dz * reach],
    ]);
    const root = b.sweep(path, [0.12, 0.03], {
      bone: base,
      sides: 6,
      smooth: false,
      caps: "point",
      color: (t: number) => (t < 0.55 ? P.trunkDark : P.trunkMid),
      sectors: [[110, 250, P.shadowViolet]],
    });
    // vein line along the top of the root
    const vein = root.line(0, 0.004).slice(0.1, 0.9);
    glow(b.sweep(vein, 0.011, { bone: base, sides: 5, color: i % 2 ? P.glowViolet : P.veinCyan, caps: "round" }), 1.2);
    // glowing nodes
    for (const t of [0.3, 0.55, 0.78]) {
      const p = root.at(t, 0, 0.0);
      glow(
        b.stick(new THREE.IcosahedronGeometry(0.02 + 0.006 * (1 - t), 0), P.glowMint, p, { embed: 0.2 }),
        1.3,
      );
    }
  }

  // ---- Soil glow specks on mound ----
  for (let i = 0; i < 5; i++) {
    const a = R() * TAU;
    const r = 0.6 + R() * 0.3;
    glow(
      b.part(new THREE.OctahedronGeometry(0.014, 0), i % 2 ? P.glowViolet : P.glowMint, {
        bone: base,
        at: [Math.sin(a) * r, moundH(r) + 0.03, Math.cos(a) * r],
      }),
      1.2,
    );
  }
}
```

<!-- call: groundFlora -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, spiral, glow } from "agentic-3js-builder";

export function buildGroundFlora({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const bone = J.base;
  const G = (m: any, s = 1) => glow(m, s);

  // ground height of the mound: roughly 0.4 at r<0.9 falling to 0 at r>=1.1
  const groundY = (x: number, z: number) => {
    const r = Math.hypot(x, z);
    return r < 0.9 ? 0.2 : r < 1.1 ? 0.1 : 0;
  };
  const place = (ang: number, r: number): [number, number, number] => [
    Math.sin(ang) * r,
    groundY(Math.sin(ang) * r, Math.cos(ang) * r),
    Math.cos(ang) * r,
  ];
  const sph = (rad: number, w = 6, h = 4) => new THREE.SphereGeometry(rad, w, h);

  // 1. mushroom disk plants
  const mush = [
    [0.3, 1.15, 0.2, 0.22],
    [1.5, 1.2, 0.14, 0.17],
    [2.6, 1.0, 0.25, 0.25],
    [3.7, 1.25, 0.18, 0.12],
    [4.7, 1.1, 0.2, 0.2],
    [5.7, 1.2, 0.1, 0.09],
  ];
  mush.forEach(([a, r, h, w], i) => {
    const [x, y, z] = place(a, r);
    b.part(new THREE.CylinderGeometry(w * 0.12, w * 0.18, h, 6), P.trunkMid, { bone, at: [x, y + h / 2 - 0.01, z] });
    const capY = y + h;
    b.part(new THREE.CylinderGeometry(w, w * 0.8, 0.035, 8), i % 2 ? P.shadowViolet : P.leafMid, { bone, at: [x, capY, z] });
    b.part(new THREE.CylinderGeometry(w * 0.5, w * 0.75, 0.03, 8), P.leafTeal, { bone, at: [x, capY + 0.03, z] });
    G(b.part(new THREE.TorusGeometry(w * 0.75, 0.01, 4, 8), i % 2 ? P.glowViolet : P.glowBlue, {
      bone, at: [x, capY - 0.025, z], rotation: [90, 0, 0] }), 1.2);
    for (let k = 0; k < 6; k++) {
      const t = (k / 6) * Math.PI * 2;
      G(b.part(sph(0.012), P.veinCyan, { bone, at: [x + Math.cos(t) * w * 0.88, capY + 0.01, z + Math.sin(t) * w * 0.88] }));
    }
  });

  // 2. spiral fan plants
  const fans = [[0.6, 1.05], [-0.6, 1.05], [Math.PI * 0.95, 1.1]];
  fans.forEach(([a, r], i) => {
    const [x, y, z] = place(a, r);
    const H = 0.4 + i * 0.07;
    const stem = catmull([[x, y - 0.02, z], [x + 0.03, y + H * 0.5, z], [x, y + H, z + 0.02]]);
    b.sweep(stem, [0.03, 0.015], { bone, color: P.trunkMid, sides: 6 });
    const n = 7;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const ang = t * Math.PI * 2 * 1.0;
      const hy = y + H * (0.55 + 0.45 * t);
      const len = 0.17 + 0.05 * (1 - t);
      const dirv = new THREE.Vector3(Math.cos(ang), 0.5, Math.sin(ang)).normalize();
      const base = new THREE.Vector3(x, hy, z);
      const tip = base.clone().addScaledVector(dirv, len);
      b.spike(base, tip, null, 0.04, { bone, color: P.leafTeal, sides: 4 });
      G(b.part(sph(0.018), P.glowMagenta, { bone, at: tip.toArray() as [number, number, number] }), 1.3);
    }
    G(b.part(sph(0.025), P.glowMint, { bone, at: [x, y + H + 0.02, z] }));
  });

  // 3. sprouts and blade tufts
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.3;
    const r = 0.85 + R() * 1.0;
    const [x, y, z] = place(a, r);
    const h = 0.1 + R() * 0.3;
    const sp = spiral([x, y + h * 0.4, z], [x + 0.04, y + h * 0.4, z], [0, 0, 1], { turns: 0.75, r1: 0.015, pitch: h * 0.3 });
    const stem = catmull([[x, y - 0.01, z], [x, y + h * 0.4, z]]);
    b.sweep(stem.concat(sp), [0.014, 0.005], { bone, color: P.mossLight, sides: 5 });
    const e = sp.at(1);
    G(b.part(sph(0.02), i % 2 ? P.glowMint : P.glowMagenta, { bone, at: [e.x, e.y, e.z] }), 1.2);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const r = 0.95 + R() * 1.0;
    const [x, y, z] = place(a, r);
    for (let k = 0; k < 5; k++) {
      const ka = (k / 5) * Math.PI * 2;
      const base = [x + Math.cos(ka) * 0.015, y - 0.01, z + Math.sin(ka) * 0.015];
      const tip = [x + Math.cos(ka) * 0.09, y + 0.15 + R() * 0.08, z + Math.sin(ka) * 0.09];
      b.spike(base, tip, null, 0.016, { bone, color: k % 2 ? P.leafTeal : P.mossLight, sides: 4 });
    }
  }

  // 4. seed pods and rocks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const r = 0.8 + R() * 1.2;
    const [x, y, z] = place(a, r);
    const s = 0.04 + R() * 0.04;
    const m = b.part(sph(1), i % 2 ? P.glowMint : P.glowViolet, { bone, at: [x, y + s * 0.4, z], scale: [s, s * 0.6, s] });
    G(m, 1.2);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.9;
    const r = 1.0 + R() * 1.1;
    const [x, y, z] = place(a, r);
    const s = 0.05 + R() * 0.06;
    b.part(new THREE.DodecahedronGeometry(s, 0), P.rockBlue, { bone, at: [x, y + s * 0.3, z], scale: [1, 0.65, 1], rotation: [R() * 90, R() * 90, 0] });
  }
}
```

<!-- call: bloomTendrils -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBloomTendrils({ b, J, P, M }: Ctx) {
  const bone = J.crown;
  const R = rng(11);
  const bc = M.bloomCenter;
  const tr = M.tendrilRing;

  // ---- Bloom stalk (squat, faceted)
  b.part(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 7), P.trunkLight, { bone, at: [bc[0], bc[1] - 0.05, bc[2]] });
  b.part(new THREE.CylinderGeometry(0.16, 0.1, 0.06, 8), P.trunkMid, { bone, at: [bc[0], bc[1] - 0.2, bc[2]] });

  // ---- Core bulb
  const coreAt: [number, number, number] = [bc[0], bc[1] + 0.2, bc[2]];
  glow(b.part(new THREE.SphereGeometry(0.16, 8, 6), P.glowMagenta, { bone, at: coreAt, flat: true }), 1.3);

  // ---- Petals: two rings of 6 (extruded pointed outlines)
  const petalOutline = (w: number, l: number): [number, number, string?][] => [
    [-w, 0], [-w * 1.1, l * 0.4], [0, l, "sharp"] as any, [w * 1.1, l * 0.4], [w, 0],
  ].map((p) => p as any);
  const makeRing = (n: number, w: number, l: number, tiltDeg: number, color: string, tipColor: string, yOff: number, phase: number) => {
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2;
      const dx = Math.sin(a), dz = Math.cos(a);
      const tilt = tiltDeg * (Math.PI / 180);
      const base: [number, number, number] = [coreAt[0] + dx * 0.1, coreAt[1] + yOff, coreAt[2] + dz * 0.1];
      const dir: [number, number, number] = [dx * Math.sin(tilt), Math.cos(tilt), dz * Math.sin(tilt)];
      // tangent for width direction
      const tang: [number, number, number] = [dz, 0, -dx];
      b.extrude(petalOutline(w, l) as any, {
        at: base, x: tang, y: dir, thickness: 0.012, bevel: 0.003, color, bone,
      });
      // glowing tip
      const tip: [number, number, number] = [base[0] + dir[0] * l * 0.9, base[1] + dir[1] * l * 0.9, base[2] + dir[2] * l * 0.9];
      glow(b.part(new THREE.OctahedronGeometry(0.018, 0), tipColor, { bone, at: tip }), 1.2);
      // vein line on petal
      const mid: [number, number, number] = [base[0] + dir[0] * l * 0.45, base[1] + dir[1] * l * 0.45, base[2] + dir[2] * l * 0.45];
      glow(b.rod(base, mid, 0.004, P.veinCyan, { bone }), 1);
    }
  };
  makeRing(6, 0.06, 0.4, 38, P.glowViolet, P.glowMagenta, -0.02, 0.26);
  makeRing(6, 0.06, 0.3, 22, P.tipPink, P.glowMagenta, 0.02, 0);
  makeRing(6, 0.05, 0.3, 12, P.petalWhite, P.tipPink, 0.06, 0.52);

  // ---- Stamens
  const nSt = 8;
  for (let i = 0; i < nSt; i++) {
    const a = (i / nSt) * Math.PI * 2 + 0.3;
    const rr = 0.04 + (i % 2) * 0.03;
    const h = 0.28 + R() * 0.1;
    const base: [number, number, number] = [coreAt[0] + Math.sin(a) * 0.03, coreAt[1] + 0.12, coreAt[2] + Math.cos(a) * 0.03];
    const mid: [number, number, number] = [coreAt[0] + Math.sin(a) * rr * 0.8, coreAt[1] + 0.12 + h * 0.5, coreAt[2] + Math.cos(a) * rr * 0.8];
    const tip: [number, number, number] = [coreAt[0] + Math.sin(a) * (rr + 0.05), coreAt[1] + 0.12 + h, coreAt[2] + Math.cos(a) * (rr + 0.05)];
    b.sweep([base, mid, tip], [0.006, 0.003], { bone, color: P.stamenGold });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), P.glowMint, { bone, at: tip }), 1.4);
  }
  // pistil
  b.spike([coreAt[0], coreAt[1] + 0.12, coreAt[2]], [0, 1, 0], 0.4, 0.014, { bone, color: P.veinCyan });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.veinCyan, { bone, at: [coreAt[0], coreAt[1] + 0.54, coreAt[2]] }), 1.5);

  // ---- Spore motes
  const motes: [number, number, number, string][] = [
    [0.18, 0.5, 0.1, P.glowMint], [-0.2, 0.58, -0.05, P.glowViolet],
    [0.05, 0.66, -0.22, P.glowMint], [-0.1, 0.46, 0.24, P.glowViolet],
  ];
  for (const m of motes)
    glow(b.part(new THREE.OctahedronGeometry(0.022, 0), m[3], { bone, at: [coreAt[0] + m[0], coreAt[1] + m[1] - 0.1, coreAt[2] + m[2]] }), 1.4);

  // ---- Tendrils
  const N = 13;
  const bulbCols = [P.glowMagenta, P.glowBlue, P.glowMint];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + R() * 0.15;
    const dx = Math.sin(a), dz = Math.cos(a);
    const r0 = 0.4;
    const short = dz > 0.6 && i % 2 === 0;
    const len = short ? 0.8 + R() * 0.1 : 0.9 + R() * 0.4;
    const swing = 0.08 + R() * 0.1;
    const top: [number, number, number] = [tr[0] + dx * r0, tr[1], tr[2] + dz * r0];
    const p1: [number, number, number] = [top[0] + dx * swing * 1.2, top[1] - len * 0.3, top[2] + dz * swing * 1.2];
    const p2: [number, number, number] = [top[0] + dx * swing * 1.4 + dz * 0.04, top[1] - len * 0.65, top[2] + dz * swing * 1.4 - dx * 0.04];
    const end: [number, number, number] = [top[0] + dx * swing * 0.8, top[1] - len, top[2] + dz * swing * 0.8];
    const path = [top, p1, p2, end];
    b.sweep(path, [0.014, 0.006], {
      bone,
      color: (t: number) => (t < 0.35 ? P.trunkMid : t < 0.7 ? P.shadowViolet : P.glowViolet),
      caps: "round",
    });
    // tiny anchor knob
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.trunkLight, { bone, at: top });
    // bulb
    const col = bulbCols[i % 3];
    glow(b.part(new THREE.SphereGeometry(0.03 + (i % 3) * 0.01, 7, 5), col, { bone, at: [end[0], end[1] - 0.03, end[2]], flat: true }), 1.4);
    // beads
    const nb = 2 + (i % 2);
    for (let k = 1; k <= nb; k++) {
      const t = k / (nb + 1);
      const q = t < 0.5 ? [lerp(top[0], p1[0], t * 2), lerp(top[1], p1[1], t * 2), lerp(top[2], p1[2], t * 2)]
        : [lerp(p1[0], p2[0], (t - 0.5) * 2), lerp(p1[1], p2[1], (t - 0.5) * 2), lerp(p1[2], p2[2], (t - 0.5) * 2)];
      glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), k % 2 ? P.glowMint : P.veinCyan, { bone, at: q as [number, number, number] }), 1.2);
    }
  }

  function lerp(a: number, c: number, t: number) {
    return a + (c - a) * t;
  }
}
```

<!-- call: frondCrown -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFrondCrown({ b, J, P, M }: { b: any; J: any; P: any; M: any }) {
  const bone = J.crown;
  const C = new THREE.Vector3(...(M.frondRing as [number, number, number]));
  const DEG = Math.PI / 180;
  const elev = [25, -15, 5, 15, 25, -15, 0, 10];

  const dotGeo = new THREE.SphereGeometry(0.018, 6, 4);
  const tipGeo = new THREE.SphereGeometry(0.03, 6, 4);

  for (let i = 0; i < 8; i++) {
    const a = (22.5 + i * 45) * DEG;
    const L = i % 2 === 0 ? 1.1 : 0.9;
    const W = L * 0.5;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const el1 = (12 + elev[i]) * DEG;
    const el2 = el1 - 52 * DEG;
    const dir = (el: number) => new THREE.Vector3(d.x * Math.cos(el), Math.sin(el), d.z * Math.cos(el));
    const d1 = dir(el1);
    const d2 = dir(el2);
    const T1 = 0.45;

    const p0 = C.clone().addScaledVector(d, 0.3).add(new THREE.Vector3(0, 0.18, 0));
    const p1 = p0.clone().addScaledVector(d1, T1 * L);
    const segs = [
      { p: p0, d: d1, n: new THREE.Vector3().crossVectors(d1, side).normalize(), t0: 0, t1: T1 },
      { p: p1, d: d2, n: new THREE.Vector3().crossVectors(d2, side).normalize(), t0: T1, t1: 1 },
    ];
    const hw = (t: number) => {
      if (t >= 0.999) return 0;
      return Math.max(0.035, (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.65)), 0.8));
    };
    const pos = (t: number, w: number, h: number) => {
      const s = t < T1 ? segs[0] : segs[1];
      return s.p.clone().addScaledVector(s.d, (t - s.t0) * L).addScaledVector(side, w).addScaledVector(s.n, h);
    };

    // stalk
    b.sweep(
      catmull([
        C.clone().addScaledVector(d, 0.05).add(new THREE.Vector3(0, -0.02, 0)),
        C.clone().addScaledVector(d, 0.18).add(new THREE.Vector3(0, 0.08, 0)),
        p0.clone(),
      ]),
      [0.055, 0.034],
      { color: P.trunkMid, bone, sides: 6 },
    );

    // blades
    segs.forEach((s) => {
      const N = 6;
      const outline = (scale: number, pad: number) => {
        const pts: [number, number][] = [];
        for (let k = 0; k <= N; k++) {
          const t = s.t0 + ((s.t1 - s.t0) * k) / N;
          pts.push([(t - s.t0) * L, -(hw(t) * scale + (hw(t) > 0 ? pad : 0))]);
        }
        for (let k = N; k >= 0; k--) {
          const t = s.t0 + ((s.t1 - s.t0) * k) / N;
          if (hw(t) === 0) continue;
          pts.push([(t - s.t0) * L, hw(t) * scale + pad]);
        }
        return pts;
      };
      b.extrude(outline(1, 0), {
        at: s.p.clone(), x: s.d.toArray(), y: side.toArray(),
        thickness: 0.022, bevel: 0.004, color: P.leafMid, bone,
      });
      b.extrude(outline(1.05, 0.008), {
        at: s.p.clone().addScaledVector(s.n, -0.017), x: s.d.toArray(), y: side.toArray(),
        thickness: 0.02, color: P.shadowViolet, bone,
      });
    });

    // teal edge strips
    for (const sg of [1, -1]) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 10; k++) {
        const t = 0.05 + 0.92 * (k / 10);
        pts.push(pos(t, sg * hw(t) * 0.95, 0.013));
      }
      b.sweep(pts, 0.007, { color: P.leafTeal, bone, sides: 6 });
    }

    // midrib: deep strip + glowing vein
    const rib = (h: number) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 10; k++) pts.push(pos(0.03 + 0.94 * (k / 10), 0, h));
      return pts;
    };
    b.sweep(rib(0.011), [0.032, 0.012], { color: P.leafDeep, bone, sides: 6 });
    glow(b.sweep(rib(0.022), [0.011, 0.005], { color: P.veinCyan, bone, sides: 6 }), 1.2);

    // side veins
    for (let k = 0; k < 4; k++) {
      const t = 0.16 + 0.16 * k;
      const col = k < 2 ? P.veinCyan : P.glowMint;
      for (const sg of [1, -1]) {
        const t2 = Math.min(0.97, t + 0.14);
        glow(
          b.rod(pos(t, 0, 0.02), pos(t2, sg * hw(t2) * 0.82, 0.02), [0.007, 0.004], col, { bone, sides: 6 }),
          1.1,
        );
      }
    }

    // tip
    const tipP = pos(0.985, 0, 0.012);
    glow(b.spike(tipP, d2.toArray(), 0.14, 0.032, { color: P.glowMagenta, bone, sides: 6 }), 1.4);
    glow(b.part(tipGeo, P.tipPink, { bone, at: tipP.clone().addScaledVector(d2, 0.01) }), 1.5);

    // blue edge dots
    for (let k = 0; k < 5; k++) {
      const t = 0.2 + 0.14 * k;
      const sg = k % 2 === 0 ? 1 : -1;
      glow(b.part(dotGeo, P.glowBlue, { bone, at: pos(t, sg * hw(t) * 0.78, 0.018) }), 1.2);
    }
  }
}
```