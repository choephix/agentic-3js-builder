<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "chestDetails",
    builds: "Open chest: hinged lid on lid joint with iron bands, gold corner caps, lock plate with keyhole, rivets, studs, velvet interior lining and a small gem-set latch",
    box: [
      [-0.5, 0.0, -0.45],
      [0.5, 0.85, 0.45],
    ],
    attaches: "Top rim of the chest body box (y=0.45) and its front face at z=0.4; lid rides joint chestLid at the rear hinge",
    joints: ["chestLid"],
    floor: true,
    budget: 220,
  },
  {
    id: "coinPile",
    builds: "Many gold and silver coins as flat cylinders in stacks and scattered slopes, spilling from the chest front and across the mound, with a few embossed coin faces",
    box: [
      [-1.3, 0.0, -0.9],
      [1.3, 0.6, 1.2],
    ],
    attaches: "Surface of the gold mound base (dome of radius 1.2) and the floor in front of the chest",
    joints: [],
    floor: true,
    budget: 220,
  },
  {
    id: "gemsAndCrown",
    builds: "Faceted gems (ruby, sapphire, emerald, amethyst) scattered over the pile, plus a spiked jeweled crown resting tilted on the mound's left side",
    box: [
      [-1.2, 0.2, -0.5],
      [1.2, 0.95, 1.1],
    ],
    attaches: "Upper slopes of the mound dome and the left shoulder at x=0.7",
    joints: [],
    floor: false,
    budget: 200,
  },
  {
    id: "goblets",
    builds: "Three jeweled goblets and a tipped chalice with stems, bases, rims, gem bands, and a spilled few coins",
    box: [
      [-1.3, 0.0, 0.1],
      [1.3, 0.55, 1.2],
    ],
    attaches: "Floor plinth ring and lower mound slopes in front of the chest",
    joints: [],
    floor: false,
    budget: 180,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const root = b.joint("hoardRoot", { at: [0, 0, 0] });
  const lid = b.joint("chestLid", { parent: root, at: [0, 0.45, -0.38], aim: [0, 0.45, 0.4] });

  // floor plinth: low octagonal stone dais
  b.part(new THREE.CylinderGeometry(1.35, 1.45, 0.08, 8), "#4a4252", { bone: root, at: [0, 0.04, 0.1] });
  b.part(new THREE.CylinderGeometry(1.25, 1.35, 0.04, 8), "#625a70", { bone: root, at: [0, 0.1, 0.1] });

  // gold mound: stacked frustums form a dome
  b.part(new THREE.CylinderGeometry(1.0, 1.2, 0.2, 10), "#d9a22a", { bone: root, at: [0, 0.2, 0.0] });
  b.part(new THREE.CylinderGeometry(0.7, 1.0, 0.18, 10), "#e8b83a", { bone: root, at: [0, 0.39, -0.05] });
  b.part(new THREE.CylinderGeometry(0.4, 0.7, 0.14, 10), "#f2c84e", { bone: root, at: [0, 0.55, -0.1] });

  // chest body
  b.part(new THREE.BoxGeometry(0.9, 0.4, 0.75), "#7a4a24", { bone: root, at: [0, 0.3, -0.05] });
  // chest base plinth
  b.part(new THREE.BoxGeometry(0.96, 0.08, 0.81), "#4a2a14", { bone: root, at: [0, 0.14, -0.05] });
  // interior lining (visible when open)
  b.part(new THREE.BoxGeometry(0.8, 0.02, 0.65), "#7a1f3a", { bone: root, at: [0, 0.495, -0.05] });

  // lid: box slab plus a half-cylinder barrel top, open and tilted back
  const lidSlab = b.part(new THREE.BoxGeometry(0.9, 0.1, 0.75), "#8a5428", { bone: lid, at: [0, 0.5, -0.4] });
  lidSlab.mesh.rotation.x = 0;
  b.part(new THREE.CylinderGeometry(0.375, 0.375, 0.9, 8, 1, false, 0, Math.PI), "#8a5428", {
    bone: lid,
    at: [0, 0.55, -0.4],
    rotation: [0, 0, 90],
  });
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  return b.root;
}
```

<!-- call: chestDetails -->

The base source arrived as the literal placeholder `{ base; }`, so I never saw its code. I have only the brief's numbers: the chest body top rim at y=0.45, its front face at z=0.4, and a `chestLid` joint at the rear hinge. I placed everything from those assumptions, so it is unchecked against the real base. I also assumed the chest body spans about x ±0.45 and z from -0.4 to 0.4, and that the lid joint sits near (0, 0.45, -0.4). I did not add any joints, because the lid joint already exists. The lid parts use `bone: "chestLid"`, with positions given in model space as the lid's rest pose. The lid sits closed on the body, about 0.3 m tall, and the box limit of 0.85 holds.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildChestDetails(b: Builder) {
  const GOLD = "#e8b83a", GOLD_D = "#a87a1c", IRON = "#3a3f4a", IRON_L = "#5a6272";
  const VEL = "#7a1230", VEL_D = "#4e0a20", GEM = "#2fd8e6", GEM_R = "#e0245e", KEY = "#14110f";
  const lid = "chestLid";
  const box = (w: number, h: number, d: number, c: string, at: number[], bone?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], bone });
  const cyl = (r: number, h: number, c: string, at: number[], bone: string | undefined, rot: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: at as [number, number, number], bone, rotation: rot as [number, number, number] });

  // velvet interior lining just inside the rim
  box(0.8, 0.02, 0.6, VEL, [0, 0.43, 0]);
  box(0.8, 0.05, 0.03, VEL_D, [0, 0.45, 0.31]);
  box(0.8, 0.05, 0.03, VEL_D, [0, 0.45, -0.31]);
  box(0.03, 0.05, 0.6, VEL_D, [0.4, 0.45, 0]);
  box(0.03, 0.05, 0.6, VEL_D, [-0.4, 0.45, 0]);

  // body corner caps and iron bands
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.07, 0.42, 0.07, GOLD, [sx * 0.445, 0.22, sz * 0.395]);
    box(0.09, 0.05, 0.09, GOLD_D, [sx * 0.445, 0.455, sz * 0.395]);
  }
  for (const x of [-0.25, 0.25]) {
    box(0.07, 0.4, 0.02, IRON, [x, 0.22, 0.405]);
    for (const y of [0.1, 0.34]) cyl(0.014, 0.02, IRON_L, [x, y, 0.42], undefined, [90, 0, 0], 6);
  }

  // lock plate and keyhole on front
  box(0.14, 0.16, 0.02, GOLD, [0, 0.33, 0.41]);
  box(0.1, 0.12, 0.012, GOLD_D, [0, 0.33, 0.42]);
  cyl(0.016, 0.014, KEY, [0, 0.345, 0.428], undefined, [90, 0, 0], 8);
  box(0.012, 0.05, 0.014, KEY, [0, 0.31, 0.428]);

  // lid: iron bands, caps, studs
  box(0.92, 0.04, 0.82, IRON, [0, 0.47, 0], lid);
  for (const x of [-0.25, 0.25]) {
    box(0.07, 0.03, 0.8, IRON, [x, 0.62, 0], lid);
    box(0.07, 0.3, 0.02, IRON, [x, 0.6, 0.41], lid);
    box(0.07, 0.3, 0.02, IRON, [x, 0.6, -0.41], lid);
    for (const z of [-0.3, -0.1, 0.1, 0.3]) cyl(0.015, 0.02, GOLD, [x, 0.635, z], lid, [0, 0, 0], 6);
  }
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.08, 0.1, 0.08, GOLD, [sx * 0.455, 0.52, sz * 0.405], lid);
  }
  for (const sx of [1, -1]) {
    box(0.03, 0.3, 0.8, IRON, [sx * 0.46, 0.6, 0], lid);
    cyl(0.03, 0.04, GOLD_D, [sx * 0.47, 0.6, -0.4], lid, [0, 0, 90], 8);
  }
  // rear hinge barrel
  cyl(0.03, 0.8, GOLD_D, [0, 0.47, -0.42], lid, [0, 0, 90], 8);

  // gem latch on lid front
  box(0.1, 0.12, 0.02, GOLD, [0, 0.43, 0.425], lid);
  b.part(new THREE.OctahedronGeometry(0.04), GEM, { at: [0, 0.43, 0.445], bone: lid });
  for (const sx of [1, -1]) b.part(new THREE.OctahedronGeometry(0.014), GEM_R, { at: [sx * 0.07, 0.6, 0.42], bone: lid });
}
```

<!-- call: goblets -->

The base source was not included in the prompt (it shows only the placeholder `{ base; }`), so I could not check it. I placed the goblets against the stated box instead: the floor in front of the chest at x −1.3..1.3, y 0..0.55, z 0.1..1.2. The part is plain primitives in flat colours and uses `b.part` with lathes only, so it needs no joints.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildGoblets(b: Builder) {
  const GOLD = "#e0a82e";
  const GOLD_D = "#a87418";
  const GOLD_L = "#ffd96a";
  const SILVER = "#c9d2dc";
  const GEMS = ["#d62a4a", "#2ab4e0", "#38c872", "#a04ae0"];
  const COIN = "#f2c23c";
  const COIN_D = "#b8841c";

  const goblet = (x: number, z: number, h: number, metal: string, gem: string, tip = 0) => {
    const g = new THREE.Group();
    const add = (geo: THREE.BufferGeometry, col: string, y: number, ox = 0, oz = 0) =>
      b.part(geo, col, { at: [x + ox, y, z + oz], flat: true });
    const baseH = h * 0.1;
    add(new THREE.CylinderGeometry(h * 0.2, h * 0.26, baseH, 8), GOLD_D, baseH / 2);
    add(new THREE.CylinderGeometry(h * 0.1, h * 0.2, baseH * 0.8, 8), metal, baseH + baseH * 0.4);
    const stemH = h * 0.3;
    const sy = baseH * 1.8;
    add(new THREE.CylinderGeometry(h * 0.045, h * 0.06, stemH, 6), metal, sy + stemH / 2);
    add(new THREE.SphereGeometry(h * 0.09, 6, 4), GOLD_L, sy + stemH * 0.5);
    const cy = sy + stemH;
    const cupH = h * 0.42;
    add(new THREE.CylinderGeometry(h * 0.22, h * 0.07, cupH, 8, 1, true), metal, cy + cupH / 2);
    add(new THREE.CylinderGeometry(h * 0.07, h * 0.07, 0.01, 8), metal, cy);
    add(new THREE.CylinderGeometry(h * 0.235, h * 0.235, h * 0.04, 8), GOLD_L, cy + cupH);
    add(new THREE.CylinderGeometry(h * 0.19, h * 0.19, 0.01, 8), "#5a1410", cy + cupH * 0.92);
    add(new THREE.CylinderGeometry(h * 0.16, h * 0.13, h * 0.07, 8), GOLD, cy + cupH * 0.45);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const r = h * 0.175;
      b.part(new THREE.OctahedronGeometry(h * 0.05), GEMS[(i + tip) % 4], {
        at: [x + Math.sin(a) * r, cy + cupH * 0.45, z + Math.cos(a) * r],
        flat: true,
      });
    }
    b.part(new THREE.OctahedronGeometry(h * 0.065), gem, {
      at: [x, sy + stemH * 0.5, z + h * 0.09],
      flat: true,
    });
    void g;
  };

  goblet(-0.85, 0.55, 0.42, GOLD, GEMS[0], 0);
  goblet(0.0, 0.85, 0.5, SILVER, GEMS[1], 1);
  goblet(0.85, 0.5, 0.38, GOLD, GEMS[2], 2);

  // tipped chalice lying on its side
  const cx = 0.45, cz = 1.0, cr = 0.1;
  b.part(new THREE.CylinderGeometry(cr * 1.9, cr * 0.6, 0.2, 8, 1, true), SILVER, {
    at: [cx, cr * 1.9, cz], rotation: [0, 0, 90], flat: true,
  });
  b.part(new THREE.CylinderGeometry(cr * 2.0, cr * 2.0, 0.025, 8), GOLD_L, {
    at: [cx + 0.1, cr * 1.9, cz], rotation: [0, 0, 90], flat: true,
  });
  b.part(new THREE.CylinderGeometry(cr * 0.35, cr * 0.45, 0.17, 6), SILVER, {
    at: [cx - 0.18, cr * 1.9, cz], rotation: [0, 0, 90], flat: true,
  });
  b.part(new THREE.CylinderGeometry(cr * 1.0, cr * 1.1, 0.03, 8), GOLD_D, {
    at: [cx - 0.285, cr * 1.9, cz], rotation: [0, 0, 90], flat: true,
  });
  b.part(new THREE.OctahedronGeometry(0.03), GEMS[3], { at: [cx + 0.02, cr * 3.3, cz], flat: true });

  // spilled coins
  const coins: [number, number, number, number][] = [
    [0.8, 0.9, 0.0, 0.1], [0.95, 0.95, 0.4, 0.05], [1.05, 0.8, 0.2, 0.2],
    [0.7, 1.1, 0.9, 0.0], [1.0, 1.05, 0.1, 0.3], [0.88, 1.12, 0.6, 0.1],
  ];
  coins.forEach(([px, pz, rot, tilt], i) => {
    const y = 0.012 + (tilt > 0.15 ? 0.02 : 0);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 10), i % 2 ? COIN : COIN_D, {
      at: [px, y, pz], rotation: [tilt * 60, rot * 90, 0], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 8), GOLD_L, {
      at: [px, y + 0.002, pz], rotation: [tilt * 60, rot * 90, 0], flat: true,
    });
  });
  void frame;
}
```

<!-- call: coinPile -->

The base source was not included in the prompt (it came through as a literal `{ base; }` placeholder), so I could not read its real dimensions. I built against the dimensions the brief gives: a gold mound dome of radius 1.2 centred at x = 0, z = 0 and resting on the floor, with the chest toward the back and its front facing +Z. I have not checked the result against the actual base geometry, so the coins may not meet its surfaces exactly.

The part is built in these pieces:
- **Dome-surface coins:** coins are scattered over the dome, with their radial height limited so they stay inside the box. Each is tilted to the surface normal and sunk slightly so it seats on the dome.
- **Floor coins:** coins are scattered on the floor in front of the chest, with some lying flat at random angles.
- **Stacks:** several neat stacks of coins with alternating gold and silver, each slightly offset.
- **Embossed faces:** a few coins carry a small raised disc and a ring on the top face.

The part count stays under 220. The dome height uses y = sqrt(1.2² − r²) for r < 1.2, and every coin position is clamped to the box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCoinPile(b: Builder) {
  const GOLD = ["#f2c230", "#e0a81c", "#ffd95a"];
  const SILVER = ["#d5dbe3", "#b8c0cc"];
  const EMB = "#b07a10";
  const EMBS = "#8a94a3";
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const R = 1.2;
  const clampP = (x: number, y: number, z: number, r: number): [number, number, number] => [
    Math.min(1.3 - r, Math.max(-1.3 + r, x)),
    Math.max(0, y),
    Math.min(1.2 - r, Math.max(-0.9 + r, z)),
  ];
  const coinGeo = (r: number, t: number) => new THREE.CylinderGeometry(r, r, t, 10);

  const addCoin = (x: number, y: number, z: number, r: number, n: THREE.Vector3, silver: boolean, emboss: boolean) => {
    const t = 0.022;
    const col = silver ? SILVER[Math.floor(rnd() * 2)] : GOLD[Math.floor(rnd() * 3)];
    const p = clampP(x, y, z, r);
    b.part(coinGeo(r, t), col, { at: p, dir: [n.x, n.y, n.z] });
    if (emboss) {
      const e = new THREE.Vector3(...p).addScaledVector(n, t / 2 + 0.002);
      b.part(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.004, 10), silver ? EMBS : EMB, {
        at: [e.x, e.y, e.z],
        dir: [n.x, n.y, n.z],
      });
      const e2 = new THREE.Vector3(...p).addScaledVector(n, t / 2 + 0.005);
      b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.004, 6), silver ? SILVER[0] : GOLD[2], {
        at: [e2.x, e2.y, e2.z],
        dir: [n.x, n.y, n.z],
      });
    }
  };

  // dome slope coins
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * 1.05;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    const h = Math.sqrt(Math.max(0, R * R - rad * rad));
    const y = Math.min(0.58, h * 0.5);
    const n = new THREE.Vector3(x, h * 0.5 + 0.2, z).normalize();
    addCoin(x, y - 0.005, z, 0.07 + rnd() * 0.03, n, rnd() < 0.3, i % 9 === 0);
  }
  // floor spill in front of chest
  for (let i = 0; i < 45; i++) {
    const x = (rnd() - 0.5) * 2.4;
    const z = 0.55 + rnd() * 0.62;
    const n = new THREE.Vector3((rnd() - 0.5) * 0.4, 1, (rnd() - 0.5) * 0.4).normalize();
    addCoin(x, 0.012 + (rnd() < 0.2 ? 0.02 : 0), z, 0.07 + rnd() * 0.03, n, rnd() < 0.35, i % 8 === 0);
  }
  // stacks
  const stacks: [number, number, number][] = [
    [-0.95, 0.85, 7],
    [0.9, 0.95, 9],
    [0.55, 1.0, 5],
    [-0.5, 1.02, 4],
    [1.05, 0.55, 6],
    [-1.1, 0.4, 5],
  ];
  stacks.forEach(([sx, sz, cnt], si) => {
    for (let k = 0; k < cnt; k++) {
      const ox = (rnd() - 0.5) * 0.02;
      const oz = (rnd() - 0.5) * 0.02;
      addCoin(sx + ox, 0.012 + k * 0.024, sz + oz, 0.085, new THREE.Vector3(0, 1, 0), (k + si) % 3 === 0, k === cnt - 1);
    }
  });
}
```

<!-- call: gemsAndCrown -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildGemsAndCrown(b: Builder) {
  // The base source was not available (it came through as a placeholder), so the mound is assumed
  // to be a dome about x=0, z=0.3 with its top near y=0.9. Gems and crown are placed from that estimate.
  const GOLD = "#e8b83a", GOLD_D = "#b8821e", GOLD_L = "#ffe07a";
  const RUBY = "#d91e3c", SAPH = "#2a5ee0", EMER = "#17b862", AMETH = "#9a46d8";
  const gemCols = [RUBY, SAPH, EMER, AMETH];
  const gemLight = ["#ff7a8c", "#8fb0ff", "#7af0a8", "#d9a6ff"];

  // Scattered gems
  const domeY = (x: number, z: number) => {
    const r2 = (x * x + (z - 0.3) * (z - 0.3)) / (1.1 * 1.1);
    return Math.max(0.3, 0.88 * (1 - r2 * 0.75));
  };
  const spots: [number, number, number][] = [
    [-0.9, 0.2, 0.5], [-0.6, 0.7, 0.4], [-0.3, 0.0, 0.5], [0.0, 0.5, 0.6], [0.2, 0.9, 0.5],
    [-0.1, -0.2, 0.45], [0.35, 0.1, 0.5], [-0.75, 0.55, 0.45], [-0.45, 0.3, 0.55], [0.15, 0.3, 0.6],
    [0.95, 0.6, 0.4], [-1.0, 0.8, 0.4], [0.5, 0.75, 0.45], [-0.2, 0.85, 0.45], [0.3, -0.15, 0.4], [-0.55, -0.1, 0.4],
  ];
  spots.forEach(([x, z, s], i) => {
    const k = i % 4;
    const sz = 0.05 * s / 0.5 + 0.02;
    const geo = i % 2 ? new THREE.OctahedronGeometry(sz) : new THREE.DodecahedronGeometry(sz * 0.9);
    const y = domeY(x, z) + sz * 0.5;
    b.part(geo, gemCols[k], { at: [x, y, z], rotation: [i * 37 % 90, i * 53 % 180, i * 29 % 60], flat: true });
    b.part(new THREE.OctahedronGeometry(sz * 0.3), gemLight[k], {
      at: [x + sz * 0.15, y + sz * 0.55, z + sz * 0.15], flat: true,
    });
  });

  // Crown, tilted on the left shoulder
  const C = new THREE.Vector3(0.7, 0.58, 0.3);
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0.4, -0.5));
  const put = (geo: THREE.BufferGeometry, color: string, local: [number, number, number], rot?: THREE.Quaternion) => {
    const p = new THREE.Vector3(...local).applyQuaternion(tilt).add(C);
    const q = tilt.clone();
    if (rot) q.multiply(rot);
    return b.part(geo, color, { at: p, quat: q, flat: true });
  };
  const R = 0.2;
  put(new THREE.CylinderGeometry(R, R * 0.95, 0.1, 16, 1, true), GOLD, [0, 0, 0]);
  put(new THREE.TorusGeometry(R, 0.016, 5, 16), GOLD_L, [0, 0.05, 0], new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
  put(new THREE.TorusGeometry(R * 0.96, 0.016, 5, 16), GOLD_D, [0, -0.05, 0], new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
  // Inner liner so the band reads solid from inside
  put(new THREE.CylinderGeometry(R * 0.97, R * 0.92, 0.09, 16, 1, true), GOLD_D, [0, 0, 0]);
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = Math.sin(a) * R, z = Math.cos(a) * R;
    const tall = i % 2 === 0;
    const h = tall ? 0.17 : 0.1;
    put(new THREE.ConeGeometry(0.04, h, 4), GOLD, [x, 0.05 + h / 2, z], new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a + Math.PI / 4, 0)));
    const gc = gemCols[i % 4];
    if (tall) {
      put(new THREE.OctahedronGeometry(0.03), gc, [x, 0.05 + h + 0.02, z]);
    } else {
      put(new THREE.SphereGeometry(0.018, 6, 4), GOLD_L, [x, 0.05 + h + 0.015, z]);
    }
    // Band gems
    put(new THREE.OctahedronGeometry(0.027), gemCols[(i + 1) % 4], [Math.sin(a + 0.4) * (R + 0.012), 0, Math.cos(a + 0.4) * (R + 0.012)],
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a + 0.4, 0)));
  }
  // Velvet-red cap rim glimpse inside
  put(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.02, 16), "#8a1230", [0, -0.02, 0]);
}
```