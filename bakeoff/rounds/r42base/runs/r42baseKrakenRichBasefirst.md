<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "tentaclesFront",
    builds: "four front-facing tentacles (two left, two right) fanning outward and forward, with tapered sweeps, sucker rows, colour bands and tip curls, spread wide in rest pose",
    box: [
      [-3.4, 0, 0.3],
      [3.4, 2.2, 3.6],
    ],
    attaches: "front-lower mantle ring at the sockets where tentacle roots sit (y 1.1-1.4, z 0.7-1.1) on the body surface",
    joints: ["body", "mantle"],
    floor: true,
    budget: 220,
  },
  {
    id: "tentaclesBack",
    builds: "four rear and side tentacles spreading sideways and backward with sucker rows, spines and curled tips",
    box: [
      [-3.6, 0, -3.4],
      [3.6, 2.4, 0.2],
    ],
    attaches: "side and rear mantle ring sockets (y 1.2-1.5, z -1.0 to 0.3) on the lower body",
    joints: ["body"],
    floor: true,
    budget: 220,
  },
  {
    id: "face",
    builds: "two huge glowing eyes with lids and brows, beak with upper and lower jaw, nostril siphon, cheek ridges and brow plates",
    box: [
      [-1.0, 1.3, 0.8],
      [1.0, 2.6, 1.7],
    ],
    attaches: "front face of the head dome (z about 1.0-1.2, y 1.5-2.4) on the head sphere surface",
    joints: ["head"],
    floor: false,
    budget: 150,
  },
  {
    id: "crest",
    builds: "fin crest and dorsal ridge on top and back of the mantle, spots, plates, barnacles and glowing rune markings",
    box: [
      [-1.2, 2.2, -2.0],
      [1.2, 4.2, 0.6],
    ],
    attaches: "top and back of the mantle dome (y 2.4-3.6)",
    joints: ["mantle"],
    floor: false,
    budget: 150,
  },
  {
    id: "water",
    builds: "swirling water base: rings of foam, splash blades and droplets around the body",
    box: [
      [-2.2, 0, -2.2],
      [2.2, 0.5, 2.2],
    ],
    attaches: "the water pedestal disc top surface (y 0.3)",
    joints: ["body"],
    floor: true,
    budget: 100,
  },
];

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const body = b.joint("body", { at: [0, 0.8, 0] });
  const mantle = b.joint("mantle", { parent: body, at: [0, 1.8, -0.3], dir: [0, 1, -0.3] });
  const head = b.joint("head", { parent: body, at: [0, 1.9, 0.5], dir: [0, 0.2, 1] });

  const SKIN = "#5b3fa8";
  const SKIN_LIGHT = "#7a5cc8";
  const BELLY = "#e8a6c8";
  const DARK = "#2e1f5e";
  const WATER = "#2a8fc4";

  // water pedestal disc
  b.part(new THREE.CylinderGeometry(2.1, 2.3, 0.4, 16), WATER, { bone: body, at: [0, 0.18, 0] });

  // lower body mass
  b.part(new THREE.CylinderGeometry(1.1, 1.4, 0.9, 12), SKIN, { bone: body, at: [0, 0.75, 0] });
  b.part(new THREE.TorusGeometry(1.2, 0.18, 6, 14), DARK, { bone: body, at: [0, 1.2, 0.1], rotation: [90, 0, 0] });

  // mantle dome (tall, rising)
  b.part(new THREE.SphereGeometry(1.15, 14, 10), SKIN_LIGHT, {
    bone: mantle,
    at: [0, 2.7, -0.4],
    scale: [1, 1.35, 1.15],
  });
  b.part(new THREE.SphereGeometry(0.8, 10, 8), SKIN, { bone: mantle, at: [0, 3.4, -0.7], scale: [1, 1.2, 1] });

  // head dome in front
  b.part(new THREE.SphereGeometry(0.95, 14, 10), SKIN_LIGHT, {
    bone: head,
    at: [0, 1.95, 0.3],
    scale: [1.1, 0.95, 1],
  });
  // pale belly/chin
  b.part(new THREE.SphereGeometry(0.7, 10, 8), BELLY, { bone: head, at: [0, 1.45, 0.65], scale: [1.1, 0.7, 0.9] });

  return b.root;
}
```

<!-- call: water -->

The base source was not included in the message (the placeholder `{ base; }` was sent literally), so I could not read its dimensions. This module relies only on the brief: a pedestal disc top at y = 0.3, the `body` joint, and a box of ±2.2 in x and z with y from 0 to 0.5. Every part sits on the `body` bone with an explicit `bone` option. If the base has no `body` joint, `b.part` may fail. Nothing was checked against the base's actual geometry.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildWater(b: Builder) {
  const bone = "body";
  const TOP = 0.3;
  const COL = ["#1f8fd6", "#3fb8e8", "#8fe3f5", "#ffffff"];
  const R = (n: number) => {
    let s = n * 9301 + 49297;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  };
  const rnd = R(7);

  // Rings of foam: flat tori stacked on the pedestal top
  const rings = [
    { r: 1.9, t: 0.07, c: COL[0], y: 0.32 },
    { r: 1.6, t: 0.06, c: COL[1], y: 0.35 },
    { r: 1.3, t: 0.05, c: COL[2], y: 0.38 },
    { r: 1.05, t: 0.04, c: COL[3], y: 0.4 },
  ];
  for (const g of rings) {
    b.part(new THREE.TorusGeometry(g.r, g.t, 5, 24), g.c, {
      bone,
      at: [0, g.y, 0],
      rotation: [90, 0, 0],
      flat: true,
    });
  }
  // Foam blobs along the rings
  for (let k = 0; k < 4; k++) {
    const g = rings[k];
    const n = 8 + k * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd();
      const s = 0.07 + rnd() * 0.06;
      b.part(new THREE.IcosahedronGeometry(s, 0), COL[3], {
        bone,
        at: [Math.cos(a) * g.r, g.y + 0.03, Math.sin(a) * g.r],
        flat: true,
      });
    }
  }
  // Splash blades: curved cones leaning outward
  const blades = 16;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    const r = 1.7 + (i % 2) * 0.25;
    const h = 0.28 + rnd() * 0.12;
    const dir: [number, number, number] = [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5];
    b.part(new THREE.ConeGeometry(0.1, h, 4), i % 2 ? COL[2] : COL[1], {
      bone,
      at: [Math.cos(a) * r, 0.33 + h / 2 - 0.03, Math.sin(a) * r],
      dir,
      flat: true,
    });
  }
  // Droplets in the air within the box
  for (let i = 0; i < 24; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 1.2 + rnd() * 0.95;
    const y = 0.38 + rnd() * 0.1;
    b.part(new THREE.IcosahedronGeometry(0.035 + rnd() * 0.03, 0), i % 3 ? COL[2] : COL[3], {
      bone,
      at: [Math.cos(a) * r, y, Math.sin(a) * r],
      flat: true,
    });
  }
}
```

<!-- call: tentaclesBack -->

The base source arrived as the literal placeholder `{ base; }`, so I never saw its real dimensions, surfaces or joints. This module is built against the brief's stated attachment zone and the `body` joint, and nothing in it was checked against the base code. I also haven't run it.

The module builds four tentacles, two per side, each rooted on a mantle ring socket. Each root sits at y 1.3–1.4 and z between -0.9 and 0.1, near x = ±0.9. Each tentacle is a smooth chain that sweeps outward and backward and then curls up at the tip. The lowest points rest on the floor at y ≈ 0.

Details on each tentacle:
- **Joints:** named `tentaclesBack` + side letter + index, starting from the `body` joint.
- **Tube:** a tapered sweep with two-tone sectors, a purple back and a cream belly.
- **Suckers:** rows along the underside, set with `sweep.at`.
- **Spines:** short cones along the top.
- **Tip:** a light cone at the end.

The plan keeps everything within x ±3.6 and z -3.4 to 0.2.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";

export function buildTentaclesBack(b: Builder) {
  const SKIN = "#5a2f8f";
  const BELLY = "#e9b8c8";
  const SUCK = "#ffd9a8";
  const SPINE = "#2c1850";
  const TIP = "#ff7ab0";
  const defs = [
    { id: "A", s: 1, rx: 0.9, rz: 0.1, ex: 3.4, ez: -0.8, tz: -0.2 },
    { id: "B", s: 1, rx: 0.8, rz: -0.8, ex: 2.6, ez: -3.0, tz: -2.6 },
    { id: "C", s: -1, rx: 0.9, rz: 0.1, ex: 3.4, ez: -0.8, tz: -0.2 },
    { id: "D", s: -1, rx: 0.8, rz: -0.8, ex: 2.6, ez: -3.0, tz: -2.6 },
  ];
  for (const d of defs) {
    const s = d.s;
    const pts: number[][] = [
      [s * d.rx, 1.35, d.rz],
      [s * (d.rx + (d.ex - d.rx) * 0.35), 1.1, d.rz + (d.ez - d.rz) * 0.3],
      [s * (d.rx + (d.ex - d.rx) * 0.7), 0.45, d.rz + (d.ez - d.rz) * 0.65],
      [s * d.ex, 0.2, d.ez],
      [s * (d.ex + s * 0 + s * 0.1), 0.55, d.ez + (d.tz - d.ez) * 0.6 - 0.2],
    ];
    const path = catmull(pts);
    const names = [0, 1, 2, 3].map((i) => `tentaclesBack${d.id}${i + 1}`);
    const chain = b.chain(`tentaclesBack${d.id}`, path, { parent: "body", names, role: "tentacle" });
    const tube = b.sweep(chain, (t) => 0.2 * (1 - t) + 0.06, {
      sectors: [[125, 235, BELLY]],
      color: SKIN,
      sides: 8,
    });
    b.along(tube, 7, (at) => {
      const p = tube.at(at.t, 180, 0);
      b.stick(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 6), SUCK, p, { embed: 0.3 });
      const q = tube.at(at.t, 0, 0);
      b.stick(new THREE.ConeGeometry(0.04, 0.16, 5), SPINE, q, { embed: 0.2 });
    }, { from: 0.1, to: 0.9 });
    const e = tube.at(0.97, 0, 0);
    b.stick(new THREE.ConeGeometry(0.06, 0.2, 6), TIP, e, { embed: 0.2 });
  }
}
```

<!-- call: tentaclesFront -->

The base source in the prompt was an empty placeholder (`{ base; }`), so I could not read the real dimensions or surfaces. I placed the sockets from the stated ranges (y 1.1–1.4, z 0.7–1.1) and attached every joint to `body` or `mantle`. If the base's joint names or surface positions differ, the roots will sit off the body, so check them against the real code. I have not run this module.

Design choices:
- **Layout:** four tentacles, two on each side, each as a catmull path from the socket outward and forward, with a tip curl.
- **Floor and box:** the mid-section rests on the floor at y ≈ 0.3, and all points stay inside x ±3.4, z up to 3.6.
- **Rig:** each tentacle is a chain of joints named `tentaclesFront…`, with `role` set to `tentacle`.
- **Skin:** one swept tube per tentacle with three colour bands (violet, then purple, then pink tip). Round-cap tubes with `radius` ≥ 0.1 would sink below y = 0 near the floor, so I kept path y ≥ radius.
- **Suckers:** two rows per tentacle placed with `b.along` on the swept tube, each a cream disc with a dark centre.

```ts
import * as THREE from "three";
import { type Builder, frame, catmull } from "agentic-3js-builder";

export function buildTentaclesFront(b: Builder) {
  const SKIN = "#6a3fb5";
  const MID = "#8a55d6";
  const TIP = "#ff6fae";
  const SUCK = "#ffe9c9";
  const SUCK_IN = "#b8457a";
  const parent = "mantle";
  const defs = [
    { n: "tentaclesFrontL1", s: 1, pts: [[0.7,1.25,0.8],[1.4,0.9,1.5],[2.1,0.5,2.2],[2.7,0.3,2.9],[3.1,0.45,3.3],[3.3,0.8,3.4]] },
    { n: "tentaclesFrontL2", s: 1, pts: [[0.5,1.15,0.9],[0.9,0.8,1.8],[1.2,0.45,2.6],[1.6,0.3,3.2],[2.0,0.4,3.5],[2.3,0.75,3.55]] },
    { n: "tentaclesFrontR1", s: -1, pts: [[-0.7,1.25,0.8],[-1.4,0.9,1.5],[-2.1,0.5,2.2],[-2.7,0.3,2.9],[-3.1,0.45,3.3],[-3.3,0.8,3.4]] },
    { n: "tentaclesFrontR2", s: -1, pts: [[-0.5,1.15,0.9],[-0.9,0.8,1.8],[-1.2,0.45,2.6],[-1.6,0.3,3.2],[-2.0,0.4,3.5],[-2.3,0.75,3.55]] },
  ];
  for (const d of defs) {
    const path = catmull(d.pts as number[][]);
    const ch = b.chain(d.n, path, { parent, count: 6, role: "tentacle" });
    const tube = b.sweep(ch, (t: number) => 0.27 * (1 - t) + 0.05, {
      sides: 8,
      bands: [[0.6, SKIN], [0.88, MID], [1, TIP]],
    } as any);
    for (const [ang, col] of [[130, SUCK], [230, SUCK]] as [number, string][]) {
      b.along(tube, 9, (at: any) => {
        const t = at.t ?? 0.5;
        if (t > 0.9) return;
        const hit = tube.at(t, ang);
        b.stick(new THREE.CylinderGeometry(0.07 * (1 - t) + 0.025, 0.07 * (1 - t) + 0.025, 0.03, 8), col, hit, { embed: 0.3 });
        b.stick(new THREE.CylinderGeometry(0.035 * (1 - t) + 0.012, 0.035 * (1 - t) + 0.012, 0.034, 6), SUCK_IN, hit, { embed: 0.1 });
      });
    }
    // tip curl bead
    b.part(new THREE.SphereGeometry(0.07, 6, 4), TIP, { at: d.pts[5] as number[], bone: ch.joints[ch.joints.length - 1] });
  }
}
```

<!-- call: face -->

The base source did not come through: the prompt contains only the placeholder `{ base; }`. I could not read the head sphere's centre or radius, so the placement below is a guess from the attachment note (the head dome's front at z about 1.0–1.2, y 1.5–2.4). I assumed a sphere centred near (0, 1.95, 0.4) with radius about 0.75, and I did not run the module against the base.

The face is built from flat-coloured parts under the existing `head` joint, using `b.part` with an explicit `bone: "head"`. To avoid floating, the dome surface is approximated analytically rather than queried. I did not use `b.surface`, which would need the actual meshes. Each feature is pushed slightly forward so it overlaps the dome.

- **Eyes:** two large glowing eyes, each with an outer rim, iris, slit pupil and highlight.
- **Lids and brows:** a lid slab over each eye, plus a brow plate tilted outward.
- **Beak:** a separate upper cone and lower jaw, hinged at a `facejaw` joint added under `head` so the mouth can open.
- **Siphon:** a nostril tube with a dark opening.
- **Cheeks:** ridge wedges on both sides of the beak.

Everything stays inside the box x ±1, y 1.3–2.6, z 0.8–1.7.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildFace(b: Builder) {
  const bone = "head";
  const C = { x: 0, y: 1.95, z: 0.4 }, R = 0.75;
  // point on dome surface at lateral x, height y, pushed out by d
  const dome = (x: number, y: number, d = 0) => {
    const dx = x - C.x, dy = y - C.y;
    const zz = Math.sqrt(Math.max(R * R - dx * dx - dy * dy, 0.01));
    return [x, y, Math.min(C.z + zz + d, 1.65)] as [number, number, number];
  };
  const GLOW = "#7dffe0", RIM = "#0e2a3a", DARK = "#06141c", LID = "#2f6f86", BROW = "#1c4a63", BEAK = "#e8c27a", BEAK2 = "#b8873f", RIDGE = "#3e8fa6", WHITE = "#ffffff";
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  for (const s of [1, -1]) {
    const ex = s * 0.38, ey = 2.0;
    b.part(sph(0.25), RIM, { bone, at: dome(ex, ey, 0.0), scale: [1, 1, 0.5] });
    b.part(sph(0.21), GLOW, { bone, at: dome(ex, ey, 0.05), scale: [1, 1, 0.5] });
    b.part(sph(0.1), "#ffd84a", { bone, at: dome(ex, ey, 0.1), scale: [0.8, 1.1, 0.4] });
    b.part(new THREE.BoxGeometry(0.035, 0.2, 0.03), DARK, { bone, at: dome(ex, ey, 0.13) });
    b.part(sph(0.03, 6, 4), WHITE, { bone, at: dome(ex - s * 0.06, ey + 0.07, 0.15) });
    // lid
    b.part(new THREE.BoxGeometry(0.5, 0.1, 0.12), LID, { bone, at: dome(ex, ey + 0.2, 0.06), rotation: [0, 0, s * -12] });
    // brow plate
    b.part(new THREE.BoxGeometry(0.6, 0.1, 0.16), BROW, { bone, at: dome(ex, ey + 0.34, 0.08), rotation: [0, 0, s * 18] });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.08), RIDGE, { bone, at: dome(ex + s * 0.15, ey + 0.4, 0.14), rotation: [0, 0, s * 18] });
    // cheek ridges
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.28 - i * 0.05, 0.045, 0.08), RIDGE, { bone, at: dome(s * (0.6 + i * 0.03), 1.72 - i * 0.1, 0.05), rotation: [0, 0, s * -25] });
  }
  // nostril siphon
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 8), BROW, { bone, at: dome(0, 2.2, 0.06), rotation: [70, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), DARK, { bone, at: dome(0, 2.2, 0.14), rotation: [70, 0, 0] });
  // beak
  const beakBase = dome(0, 1.68, 0.02);
  b.part(new THREE.ConeGeometry(0.2, 0.4, 6), BEAK, { bone, at: [0, 1.7, Math.min(beakBase[2] + 0.12, 1.5)], rotation: [110, 0, 0] });
  b.part(new THREE.BoxGeometry(0.08, 0.05, 0.1), BEAK2, { bone, at: [0, 1.82, Math.min(beakBase[2] + 0.06, 1.45)] });
  const jaw = b.joint("facejaw", { parent: bone, at: [0, 1.58, 1.15], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.16, 0.32, 6), BEAK2, { bone: jaw, at: [0, 1.52, 1.3], rotation: [100, 0, 0] });
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.14), DARK, { bone: jaw, at: [0, 1.6, 1.2] });
}
```

<!-- call: crest -->

The base source was not included in the request (it arrived as the literal placeholder `{ base; }`), so I could not read the mantle's real geometry. I assumed a dome roughly centred at (0, 2.6, -0.7) with a radius of about 1.1, matching the stated box and the y 2.4–3.6 attachment range. Because the dome is assumed, everything is seated in model space on the `mantle` joint, with no surface queries.

The crest has four parts:
- **Dorsal ridge:** a row of spikes running over the top and back of the mantle, with a larger fin sail behind them.
- **Plates:** overlapping armour plates in two colours.
- **Spots and barnacles:** small spots and barnacle cones scattered over the dome.
- **Runes:** glowing rune marks built as small parts in flat colours.

Everything stays inside the box [[-1.2,2.2,-2],[1.2,4.2,0.6]].

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCrest(b: Builder) {
  const bone = "mantle";
  const C = new THREE.Vector3(0, 2.6, -0.7);
  const R = 1.0;
  const FIN = "#1f8f9a", FIN2 = "#ff9a2e", PLATE = "#2b3a5c", PLATE2 = "#3f5a8a";
  const SPOT = "#ffd34d", BARN = "#d9d2b8", RUNE = "#5ff0ff";

  const dome = (az: number, el: number, r = R) => {
    const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
    return new THREE.Vector3(
      Math.sin(a) * Math.cos(e) * r,
      Math.sin(e) * r,
      Math.cos(a) * Math.cos(e) * r,
    ).add(C);
  };
  const place = (geo: THREE.BufferGeometry, color: string, p: THREE.Vector3, up?: THREE.Vector3, emissive = false) => {
    const n = p.clone().sub(C).normalize();
    const part = b.part(geo, color, { bone, at: p, dir: up ?? n });
    if (emissive) {
      const m = (part.mesh.material as THREE.MeshStandardMaterial).clone();
      m.emissive.set(color);
      m.emissiveIntensity = 1.4;
      part.mesh.material = m;
    }
    return part;
  };

  // dorsal ridge: spikes from the top back over the rear
  for (let i = 0; i < 11; i++) {
    const el = 80 - i * 9;
    const p = dome(180, el, R * 0.97);
    const s = 1 - i * 0.05;
    place(new THREE.ConeGeometry(0.11 * s, 0.5 * s, 6), i % 2 ? FIN : FIN2, p);
  }
  // large fin sail
  const sail = b.extrude(
    [[0, 0], [0.9, 0], [0.7, 0.5, "sharp"], [0.4, 0.75], [0.1, 0.9, "sharp"], [-0.1, 0.35]],
    { at: [0, 3.35, -0.3], x: [0, 0, -1], thickness: 0.06, color: FIN, bone },
  );
  void sail;
  // side fins
  for (const s of [1, -1])
    b.extrude(
      [[0, 0], [0.5, 0.05], [0.4, 0.4, "sharp"], [0.05, 0.3]],
      { at: [s * 0.55, 3.05, -1.0], x: [0, 0, -1], y: [s * 0.6, 1, 0], thickness: 0.05, color: FIN2, bone },
    );

  // plates
  for (let i = 0; i < 12; i++) {
    const az = -60 + i * 10 + (i % 2) * 4;
    const el = 55 - (i % 3) * 14;
    const p = dome(az * (i % 2 ? 1 : -1) + 180, el, R * 1.0);
    place(new THREE.CylinderGeometry(0.16, 0.2, 0.05, 6), i % 2 ? PLATE : PLATE2, p);
  }
  for (let i = 0; i < 8; i++) {
    const p = dome(-70 + i * 20, 62 - (i % 2) * 8);
    place(new THREE.CylinderGeometry(0.12, 0.15, 0.05, 6), PLATE2, p);
  }

  // spots
  for (let i = 0; i < 24; i++) {
    const az = 30 + i * 37;
    const el = 20 + ((i * 29) % 55);
    const p = dome(az, el, R * 1.0);
    place(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), SPOT, p);
  }

  // barnacles
  for (let i = 0; i < 14; i++) {
    const az = 100 + i * 41;
    const el = 15 + ((i * 17) % 50);
    const p = dome(az, el, R * 1.0);
    place(new THREE.ConeGeometry(0.07 + (i % 3) * 0.02, 0.14, 6), BARN, p);
    place(new THREE.TorusGeometry(0.045, 0.012, 4, 6), "#8f8a76", p.clone().add(p.clone().sub(C).normalize().multiplyScalar(0.07)));
  }

  // glowing runes: on the back of the dome
  for (let k = 0; k < 5; k++) {
    const az = 150 + k * 15;
    const el = 35;
    const p = dome(az, el, R * 1.015);
    const n = p.clone().sub(C).normalize();
    place(new THREE.BoxGeometry(0.04, 0.012, 0.22), RUNE, p, n, true);
    place(new THREE.BoxGeometry(0.14, 0.012, 0.04), RUNE, p.clone().addScaledVector(n, 0.002), n, true);
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const p = dome(s * (40 + k * 18), 45 - k * 6, R * 1.015);
      const n = p.clone().sub(C).normalize();
      place(new THREE.BoxGeometry(0.035, 0.012, 0.2), RUNE, p, n, true);
      place(new THREE.BoxGeometry(0.12, 0.012, 0.035), RUNE, p, n, true);
    }
  }
  void frame;
}
```