<!-- call: plan -->

```json
{
  "name": "Kraken Rising",
  "description": "A stylized Overwatch-style kraken surging from the sea: a big domed head with glowing eyes and a beaked mouth, eight spread tentacles with suckers, spines and glowing runes, on a small churning water base.",
  "builderName": "krakenRising",
  "size": [5.0, 3.6, 4.6],
  "layout": "The kraken rises from a low disc of water at the floor (y=0). The mantle is a tall tilted dome at the back (z about -0.6), leaning slightly back. The head and face sit in front of it at y 1.4-2.3 and face +Z, with two big glowing amber eyes, heavy brow ridges and a beak made of separate upper and lower jaws. Eight tentacles leave the base of the head and spread out in a rest pose: four to each side, fanning wide and rising or curling at the tips, with thick roots and tapering tips. Sucker discs are in cream-pink on the underside, and glowing teal rune rings run along the arms. Overwatch style means chunky, clean, heroic shapes, bold saturated colours, a lighter warm top and a cooler purple underside, with bright emissive accents and small trim details (gold bands on the mantle, spines along the back). Water is a flat teal disc with white foam rings and a few splash blades.",
  "palette": {
    "skinTop": "#6a3fa8",
    "skinMid": "#4b2d85",
    "skinDark": "#2c1a55",
    "belly": "#e8a0c0",
    "sucker": "#ffd9e6",
    "suckerRim": "#c86a98",
    "glowTeal": "#2ff3d0",
    "glowAmber": "#ffb81c",
    "eyeDark": "#1a0d2e",
    "beak": "#f2e2b8",
    "beakDark": "#7a5a34",
    "gold": "#f0b429",
    "spine": "#ffd36a",
    "water": "#1c8fb8",
    "waterDeep": "#0f5a82",
    "foam": "#f2fbff",
    "tooth": "#fff6e0"
  },
  "mounts": {
    "mantleBase": [0, 1.3, -0.5],
    "headCenter": [0, 1.7, 0.5],
    "mouthPoint": [0, 1.15, 1.05],
    "tentacleRing": [0, 1.2, 0.2],
    "waterTop": [0, 0.08, 0]
  },
  "joints": [
    { "name": "root", "at": [0, 0.6, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "mantle", "parent": "root", "at": [0, 1.3, -0.5], "dir": [0, 1, -0.3], "role": "spine" },
    { "name": "head", "parent": "root", "at": [0, 1.5, 0.3], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.2, 0.95], "dir": [0, 0, 1], "role": "jaw" }
  ],
  "parts": [
    {
      "id": "mantle",
      "builds": "The tall domed mantle behind the head: a loft in skinTop/skinMid with a skinDark underside, gold bands and a gold crest fin, spine blades along the back in spine colour, glowing teal rune marks, and a mottled-patch of darker spots built as small parts.",
      "box": [[-1.3, 1.2, -2.0], [1.3, 3.6, 0.6]],
      "attaches": "Base at mantleBase; blends into the head at headCenter; rides the mantle and root joints.",
      "joints": ["root", "mantle"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "face",
      "builds": "Head and face: a broad skull dome with brow ridges, two big glowing amber eyes with dark pupils, highlights and heavy lids, cheek frills, nostril bumps, an upper beak and lower jaw (separate parts) in beak colour with dark edges and small teeth, and a belly-pink chin. Jaw part rides the jaw joint.",
      "box": [[-1.2, 0.9, -0.2], [1.2, 2.5, 1.5]],
      "attaches": "Skull base at headCenter; tentacle roots start at tentacleRing under it; mouth at mouthPoint; rides head and jaw joints.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "tentaclesLeft",
      "builds": "Four tentacles on the model's left (+X), each a chain with joints tentL1..4 (names tentL{n}_{k}) and a smooth sweep, thick root tapering to a curled tip, spread fan from forward-left to back-left, with cream-pink sucker discs along the underside, teal glowing rune rings and gold bands near the roots. Some tips curl upward, some rest on the water.",
      "box": [[0.2, 0.0, -2.3], [2.5, 3.0, 2.3]],
      "attaches": "Roots at tentacleRing (x offsets +0.2..+0.8), parented to the root joint; tips touch the water at waterTop or rise.",
      "joints": ["root"],
      "floor": true,
      "budget": 230
    },
    {
      "id": "tentaclesRight",
      "builds": "Four tentacles on the model's right (-X), a mirror of the left set with names tentR{n}_{k}, the same suckers, rune rings and gold bands, with slightly varied curls so the silhouette is not identical.",
      "box": [[-2.5, 0.0, -2.3], [-0.2, 3.0, 2.3]],
      "attaches": "Roots at tentacleRing (x offsets -0.2..-0.8), parented to the root joint; tips touch the water at waterTop or rise.",
      "joints": ["root"],
      "floor": true,
      "budget": 230
    },
    {
      "id": "water",
      "builds": "The sea base: a low faceted disc in water with a deeper-coloured inner ring, white foam ring lathes, wave crests, and splash blades and droplets around the tentacle roots, kept simpler than the kraken.",
      "box": [[-2.5, 0.0, -2.3], [2.5, 0.4, 2.3]],
      "attaches": "Top surface at waterTop; tentacles and the body emerge through it; rides the root joint.",
      "joints": ["root"],
      "floor": true,
      "budget": 70
    }
  ]
}
```

<!-- call: water -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildWater({ b, J, P, M }: Ctx) {
  const bone = J.root;
  const r = rng(11);
  const top = M.waterTop[1];
  const part = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...extra });

  // main disc, sunk slightly so lowest point rests on y=0
  part(new THREE.CylinderGeometry(2.3, 2.45, 0.2, 20), P.waterDeep, [0, 0.1, 0]);
  part(new THREE.CylinderGeometry(2.1, 2.3, 0.1, 20), P.water, [0, 0.15, 0]);
  // inner deeper ring
  part(new THREE.CylinderGeometry(1.1, 1.3, 0.06, 18), P.waterDeep, [0, top + 0.1, 0]);
  part(new THREE.CylinderGeometry(0.95, 1.1, 0.04, 18), P.water, [0, top + 0.13, 0]);

  // foam rings (torus, low poly)
  const ring = (rad: number, tube: number, y: number) =>
    part(new THREE.TorusGeometry(rad, tube, 5, 24), P.foam, [0, y, 0], { rotation: [90, 0, 0] });
  ring(2.3, 0.05, 0.2);
  ring(1.8, 0.035, 0.22);
  ring(1.3, 0.04, 0.2);

  // wave crests around the rim
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.2;
    const rad = 1.5 + r() * 0.65;
    const w = 0.35 + r() * 0.25;
    part(new THREE.ConeGeometry(0.1, w, 4), i % 3 ? P.foam : P.water, [Math.sin(a) * rad, 0.25 + w * 0.3, Math.cos(a) * rad], {
      rotation: [0, (a * 180) / Math.PI, 90 + 20],
      scale: [1, 1, 0.5],
    });
  }

  // splash blades around tentacle roots
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rad = 0.95 + r() * 0.2;
    const h = 0.3 + r() * 0.25;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad * 0.9 + 0.2;
    part(new THREE.ConeGeometry(0.09, h, 4), i % 2 ? P.foam : P.water, [x, 0.22 + h / 2, z], {
      rotation: [Math.cos(a) * 25, 0, -Math.sin(a) * 25],
      scale: [1, 1, 0.45],
    });
  }

  // droplets
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.9 + r() * 1.3;
    const s = 0.035 + r() * 0.04;
    part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? P.foam : P.sucker, [
      Math.sin(a) * rad,
      0.45 + r() * 0.3,
      Math.cos(a) * rad,
    ]);
  }
}
```

<!-- call: tentaclesRight -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";

export function buildTentaclesRight({ b, J, P, M }: any) {
  const R = rng(41);
  const ring = M.tentacleRing as number[];
  const root = J.root;
  // [angle spread, reach, tip height, curl]
  const arms = [
    { x: -0.25, z: 0.5, ex: -1.6, ez: 2.0, h: 0.35, tipUp: 0.5 },
    { x: -0.4, z: 0.2, ex: -2.3, ez: 0.9, h: 1.3, tipUp: 1.6 },
    { x: -0.55, z: -0.1, ex: -2.35, ez: -0.7, h: 0.4, tipUp: 0.35 },
    { x: -0.7, z: -0.3, ex: -1.7, ez: -2.0, h: 1.0, tipUp: 2.2 },
  ];
  arms.forEach((a, i) => {
    const n = i + 1;
    const sx = ring[0] + a.x, sy = ring[1], sz = ring[2] + a.z * 0.5;
    const dx = a.ex - sx, dz = a.ez - sz;
    const pts: number[][] = [
      [sx, sy, sz],
      [sx + dx * 0.25, sy + 0.25, sz + dz * 0.25],
      [sx + dx * 0.55, a.h + 0.1, sz + dz * 0.55],
      [sx + dx * 0.82, Math.max(0.12, a.h * 0.5), sz + dz * 0.82],
      [a.ex, a.tipUp, a.ez],
    ];
    const path = catmull(pts);
    const names = [`tentR${n}_1`, `tentR${n}_2`, `tentR${n}_3`, `tentR${n}_4`];
    const chain = b.chain(`tentR${n}`, path, { parent: root, count: 4, names, role: "tentacle" });
    const rad = (t: number) => 0.3 * (1 - t) + 0.05;
    const sw = b.sweep(chain, rad, {
      color: P.skinMid,
      sides: 8,
      sectors: [[-70, 70, P.skinTop], [125, 235, P.belly]],
    });
    // suckers on the underside
    const cnt = 9;
    for (let k = 0; k < cnt; k++) {
      const t = 0.1 + (0.8 * k) / (cnt - 1);
      const at = sw.at(t, 180);
      const r = 0.075 * (1 - t) + 0.025;
      b.stick(new THREE.CylinderGeometry(r, r * 1.1, 0.035, 8), P.sucker, at, { embed: 0.3 });
      b.stick(new THREE.TorusGeometry(r, r * 0.22, 4, 8), P.suckerRim, at, { embed: -0.1 });
    }
    // glowing rune rings
    for (const t of [0.3, 0.5, 0.7]) {
      const p = sw.at(t, 0);
      const rr = 0.3 * (1 - t) + 0.05 + 0.012;
      const m = new THREE.Mesh();
      void m;
      b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.05), P.glowTeal, p, { embed: 0.2 });
      b.stick(new THREE.BoxGeometry(0.03, 0.025, 0.09 * (1 + rr)), P.glowTeal, sw.at(t, 55), { embed: 0.2 });
      b.stick(new THREE.BoxGeometry(0.03, 0.025, 0.09 * (1 + rr)), P.glowTeal, sw.at(t, -55), { embed: 0.2 });
    }
    // gold band near root
    const bandT = 0.12;
    const bp = chain.at(bandT);
    b.part(new THREE.CylinderGeometry(0.3 * (1 - bandT) + 0.09, 0.3 * (1 - bandT) + 0.09, 0.07, 10), P.gold, {
      at: bp.at,
      dir: bp.tangent ?? [0, 1, 0],
      bone: root,
    });
    // dorsal spines
    for (let k = 0; k < 4; k++) {
      const t = 0.2 + k * 0.17;
      const sp = sw.at(t, 0);
      b.stick(new THREE.ConeGeometry(0.04 * (1 - t) + 0.015, 0.14 * (1 - t) + 0.05, 5), P.spine, sp, { embed: 0.2 });
    }
    // tip glow
    const tp = sw.at(0.97, 0);
    b.stick(new THREE.SphereGeometry(0.04, 6, 4), P.glowTeal, tp, { embed: 0.3 });
    void R;
  });
}
```

<!-- call: mantle -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMantle({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const base = M.mantleBase;
  // spine of the mantle: tilted back
  const sp = (t: number): [number, number, number] => [0, base[1] + 0.1 + t * 2.1, base[2] - 0.15 - t * t * 0.9 - t * 0.2];
  const N = 7;
  const radius = (t: number) => 1.1 * Math.sin(Math.PI * (0.18 + 0.82 * t) * 0.92) + 0.1 * (1 - t);
  const st = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const rr = Math.max(0.12, radius(t));
    st.push({ at: sp(t), w: rr * 2, h: rr * 1.85 });
  }
  const mid = J.mantle;
  b.loft(st, { bone: [J.root, mid], color: P.skinTop, sides: 10 } as any);

  // darker underside shell behind/below
  const st2 = st.map((s, i) => ({ at: [s.at[0], s.at[1] - 0.03, s.at[2] - 0.05] as [number, number, number], w: s.w * 0.9, h: s.h * 0.9 }));
  void st2;

  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // dark skirt at base
  b.part(cyl(1.0, 1.2, 0.3, 12), P.skinDark, { bone: J.root, at: [0, base[1] + 0.05, base[2] - 0.2] });

  // gold bands (tilted rings)
  for (const t of [0.22, 0.45, 0.68]) {
    const c = sp(t);
    const rr = Math.max(0.12, radius(t));
    const ring = b.part(new THREE.TorusGeometry(rr * 0.96, 0.045, 5, 18), P.gold, {
      bone: mid, at: c, dir: [0, 1, -0.5 * t - 0.2], axis: "z",
    });
    void ring;
  }

  // crest fin along the back
  const fin: [number, number][] = [[0, 0], [0.9, 0], [1.5, 0.5], [1.9, 1.3], [1.3, 1.0], [1.0, 1.4], [0.5, 0.7]];
  b.extrude(fin.map(([x, y]) => [x, y] as [number, number]), {
    at: [0, base[1] + 0.9, base[2] - 1.0], x: [0, 0.35, -1], y: [0, 1, -0.35],
    thickness: 0.06, color: P.gold, bone: mid,
  } as any);
  void fin;

  // spine blades down the back
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1;
    const c = sp(t);
    const rr = Math.max(0.12, radius(t));
    const back = [c[0], c[1] + rr * 0.55, c[2] - rr * 0.85] as [number, number, number];
    b.spike(back, [0, 0.6, -1], 0.36 - i * 0.015, 0.06, { color: P.spine, bone: mid });
  }

  // side spines
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const t = 0.2 + i * 0.17;
      const c = sp(t);
      const rr = Math.max(0.12, radius(t));
      b.spike([c[0] + s * rr * 0.9, c[1] + 0.1, c[2] - 0.2], [s, 0.5, -0.3], 0.25, 0.05, { color: P.spine, bone: mid });
    }

  // rune marks, glowing teal, on the sides and back
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const t = 0.18 + i * 0.13;
      const c = sp(t);
      const rr = Math.max(0.12, radius(t));
      const p: [number, number, number] = [c[0] + s * rr * 0.93, c[1], c[2] - 0.12];
      b.part(new THREE.TorusGeometry(0.07, 0.016, 4, 8), P.glowTeal, { bone: mid, at: p, dir: [s, 0, 0], axis: "z" });
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.02), P.glowTeal, { bone: mid, at: p, dir: [s, 0, 0], axis: "z" });
    }

  // mottled darker spots
  for (let i = 0; i < 34; i++) {
    const t = 0.12 + r() * 0.8;
    const a = (r() - 0.5) * Math.PI * 1.7;
    const c = sp(t);
    const rr = Math.max(0.12, radius(t));
    const p: [number, number, number] = [c[0] + Math.sin(a) * rr * 0.97, c[1] + Math.cos(a) * rr * 0.9 * 0.8, c[2] - 0.2 - Math.abs(Math.cos(a)) * rr * 0.3];
    const dirv: [number, number, number] = [Math.sin(a), Math.cos(a) * 0.8, -0.3];
    b.part(cyl(0.07 + r() * 0.07, 0.07, 0.03, 7), i % 3 ? P.skinMid : P.skinDark, { bone: mid, at: p, dir: dirv });
  }

  // blend collar toward head
  b.part(sph(0.95, 10, 7), P.skinMid, { bone: J.root, at: [0, M.headCenter[1] - 0.2, M.headCenter[2] - 0.8], scale: [1.1, 0.8, 0.8] });
  b.part(new THREE.TorusGeometry(0.95, 0.05, 5, 16), P.gold, { bone: J.root, at: [0, M.headCenter[1] - 0.15, M.headCenter[2] - 0.75], dir: [0, 0.4, 1], axis: "z" });
}
```

<!-- call: face -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFace({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw;
  const hc = M.headCenter;
  const R = rng(5);
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone: head, at, ...o });

  // skull dome
  put(sph(1, 14, 10), P.skinTop, hc, { scale: [1.05, 0.75, 0.85] });
  // lower cheek mass
  put(sph(1, 12, 8), P.skinMid, [0, 1.35, 0.55], { scale: [0.95, 0.5, 0.7] });
  // belly-pink chin
  put(sph(1, 10, 6), P.belly, [0, 1.05, 0.8], { scale: [0.4, 0.2, 0.35] });
  // forehead crest
  put(new THREE.BoxGeometry(0.5, 0.12, 0.7), P.gold, [0, 2.38, 0.35], { rotation: [-10, 0, 0] });

  for (const s of [1, -1]) {
    // eye assembly
    const ex = s * 0.5, ey = 1.78, ez = 1.05;
    put(sph(0.27, 12, 8), P.eyeDark, [ex, ey, ez - 0.04], { scale: [1, 1, 0.8] });
    put(sph(0.24, 12, 8), P.glowAmber, [ex, ey, ez + 0.03], { scale: [1, 1, 0.7] });
    put(sph(0.12, 8, 6), P.eyeDark, [ex, ey, ez + 0.17], { scale: [0.55, 1.3, 0.5] });
    put(sph(0.05, 6, 4), P.foam, [ex + s * 0.07, ey + 0.1, ez + 0.2]);
    put(sph(0.025, 6, 4), P.foam, [ex - s * 0.06, ey - 0.08, ez + 0.2]);
    // heavy lids and brow ridges
    put(sph(0.3, 10, 6), P.skinDark, [ex, ey + 0.17, ez - 0.03], { scale: [1.1, 0.5, 0.9], rotation: [0, 0, -s * 12] });
    put(new THREE.BoxGeometry(0.55, 0.12, 0.3), P.skinDark, [ex, ey + 0.33, ez - 0.1], { rotation: [-10, 0, -s * 18] });
    put(sph(0.3, 10, 6), P.skinMid, [ex, ey - 0.2, ez - 0.05], { scale: [1.0, 0.35, 0.8] });
    // nostril bumps
    put(sph(0.06, 6, 4), P.skinDark, [s * 0.14, 1.52, 1.35]);
    // cheek frills
    for (let i = 0; i < 4; i++) {
      const y = 1.25 + i * 0.16;
      put(new THREE.ConeGeometry(0.1 - i * 0.012, 0.55 - i * 0.06, 5), i % 2 ? P.spine : P.glowTeal, [s * 0.98, y, 0.45 - i * 0.05], { rotation: [0, 0, -s * 80], });
    }
    // brow spines
    put(new THREE.ConeGeometry(0.06, 0.25, 5), P.spine, [s * 0.75, 2.2, 0.5], { rotation: [0, 0, -s * 25] });
    // runes on skull
    put(new THREE.TorusGeometry(0.09, 0.015, 4, 8), P.glowTeal, [s * 0.35, 2.12, 0.85], { rotation: [-50, 0, 0] });
    // mouth corner bumps
    put(sph(0.09, 6, 4), P.skinDark, [s * 0.5, 1.25, 1.1]);
  }
  // spots
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2, e = 0.4 + R() * 0.5;
    put(sph(0.04 + R() * 0.03, 5, 4), P.skinDark, [Math.cos(a) * 0.8 * 0.9, 1.7 + Math.sin(e) * 0.5, 0.2 + R() * 0.3], { scale: [1, 1, 0.5] });
  }

  // upper beak
  put(new THREE.ConeGeometry(0.34, 0.6, 6), P.beak, [0, 1.3, 1.25], { rotation: [100, 0, 0], scale: [1, 1, 0.7] });
  put(new THREE.ConeGeometry(0.2, 0.2, 6), P.beakDark, [0, 1.22, 1.55], { rotation: [100, 0, 0] });
  put(new THREE.BoxGeometry(0.62, 0.05, 0.5), P.beakDark, [0, 1.17, 1.05]);
  for (let i = -2; i <= 2; i++)
    put(new THREE.ConeGeometry(0.035, 0.1, 4), P.tooth, [i * 0.1, 1.12, 1.2 + 0.0 - Math.abs(i) * 0.04], { rotation: [180, 0, 0] });

  // lower jaw on jaw joint
  const jb = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: jaw, at, ...o });
  jb(new THREE.ConeGeometry(0.3, 0.5, 6), P.beak, [0, 1.0, 1.15], { rotation: [95, 0, 0], scale: [1, 1, 0.6] });
  jb(new THREE.BoxGeometry(0.6, 0.05, 0.42), P.beakDark, [0, 1.07, 1.0]);
  jb(sph(1, 8, 5), P.belly, [0, 0.95, 0.95], { scale: [0.3, 0.12, 0.3] });
  for (let i = -2; i <= 2; i++)
    jb(new THREE.ConeGeometry(0.03, 0.09, 4), P.tooth, [i * 0.1, 1.11, 1.12 - Math.abs(i) * 0.03]);
  for (const s of [1, -1]) jb(sph(0.1, 6, 4), P.skinMid, [s * 0.4, 1.05, 0.85]);
}
```

<!-- call: tentaclesLeft -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTentaclesLeft({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const ring = M.tentacleRing;
  // azimuth from +Z toward +X (degrees), reach, tip height, resting-on-water flag
  const specs = [
    { az: 22, reach: 2.15, tip: 1.5, rest: false },
    { az: 62, reach: 2.1, tip: 0.25, rest: true },
    { az: 108, reach: 2.05, tip: 1.9, rest: false },
    { az: 152, reach: 1.95, tip: 0.3, rest: true },
  ];

  specs.forEach((sp, i) => {
    const n = i + 1;
    const a = (sp.az * Math.PI) / 180;
    const d = [Math.sin(a), 0, Math.cos(a)];
    const x0 = ring[0] + 0.2 + i * 0.2;
    const z0 = ring[2] + 0.1 - i * 0.15;
    const at = (k: number, y: number) => [x0 + d[0] * k, y, z0 + d[2] * k];
    const lowY = sp.rest ? 0.06 : 0.35;
    const pts = [
      [x0, ring[1] - 0.05, z0],
      at(sp.reach * 0.25, ring[1] + 0.05),
      at(sp.reach * 0.55, 0.55 + (sp.rest ? 0 : 0.25)),
      at(sp.reach * 0.8, lowY + (sp.rest ? 0 : 0.2)),
      at(sp.reach, sp.tip),
    ];
    const path = catmull(pts);
    const names = [1, 2, 3, 4].map((k) => `tentL${n}_${k}`);
    const chain = b.chain(`tentL${n}`, path, { parent: J.root, names, role: "tentacle" });
    const sw = b.sweep(chain, [0.22, 0.17, 0.12, 0.07, 0.025], {
      sectors: [[120, 240, P.belly]],
      color: P.skinMid,
      bands: [[0.35, P.skinTop], [1, P.skinMid]],
      sides: 10,
    });

    // suckers on the underside
    for (let k = 0; k < 10; k++) {
      const t = 0.1 + k * 0.083;
      const hit = sw.at(t, 180);
      const r = Math.max(0.018, hit.radius * 0.5);
      b.stick(new THREE.CylinderGeometry(r * 1.25, r * 1.3, 0.018, 8), P.suckerRim, hit, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(r, r * 1.05, 0.022, 8), P.sucker, hit.moved([0, 0.006, 0]), { embed: 0.2 });
    }

    // rune rings (glowing) and gold bands
    const ringAt = (t: number, rad: number, tube: number, col: string, g: boolean) => {
      const cp = chain.at(t);
      const s = sw.at(t, 0);
      const part = b.part(new THREE.TorusGeometry(s.radius * rad, tube, 5, 12), col, {
        frame: cp,
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
      });
      if (g) glow(part, 1.4);
    };
    ringAt(0.07, 1.05, 0.03, P.gold, false);
    ringAt(0.13, 1.05, 0.022, P.gold, false);
    [0.24, 0.36, 0.48, 0.6, 0.72].forEach((t, k) => ringAt(t, 1.04, 0.014 + (k % 2) * 0.005, P.glowTeal, true));

    // dorsal spines
    for (let k = 0; k < 6; k++) {
      const t = 0.12 + k * 0.1 + R() * 0.02;
      const hit = sw.at(t, 0);
      b.stick(new THREE.ConeGeometry(0.035 * (1 - t) + 0.012, 0.13 * (1 - t) + 0.05, 5), P.spine, hit, { embed: 0.15 });
    }

    // glowing tip bead
    const tipP = chain.at(0.97);
    glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), P.glowTeal, { frame: tipP, at: tipP.at }), 1.5);
  });
}
```

<!-- call: fit-tentaclesLeft -->

The first tentacle starts too close to the centre line, so its thick root pokes past the box's inner x face at x = 0.2. I'm moving every tentacle's root outward by 0.2 m in x, which also pushes the first root's tube clear of the face. The tube radius is 0.22 and the root started at x = 0.4, so it reached -0.03.

<<<<<<< SEARCH
    const x0 = ring[0] + 0.2 + i * 0.2;
=======
    const x0 = ring[0] + 0.45 + i * 0.2;
>>>>>>> REPLACE

<!-- call: fit-tentaclesRight -->

The first tentacle's root sits at x = ring[0] − 0.25 = −0.25, and its fat radius pushes the sweep past x = −0.2. I'll move the roots further out on x and thin the base radius a little, which keeps the design and the mounts.

<<<<<<< SEARCH
    { x: -0.25, z: 0.5, ex: -1.6, ez: 2.0, h: 0.35, tipUp: 0.5 },
=======
    { x: -0.5, z: 0.5, ex: -1.6, ez: 2.0, h: 0.35, tipUp: 0.5 },
>>>>>>> REPLACE
<<<<<<< SEARCH
    const rad = (t: number) => 0.3 * (1 - t) + 0.05;
=======
    const rad = (t: number) => 0.22 * (1 - t) + 0.05;
>>>>>>> REPLACE

<!-- call: fit-water -->

The wave crests, splash blades and droplets reached too high, and the disc and rings spill past the box's x/z edge. I'm lowering the height of those pieces, scaling the crest and blade heights down, and shrinking the disc and the outer foam ring so they sit inside the ±2.3 z limit.

<<<<<<< SEARCH
  part(new THREE.CylinderGeometry(2.3, 2.45, 0.2, 20), P.waterDeep, [0, 0.1, 0]);
  part(new THREE.CylinderGeometry(2.1, 2.3, 0.1, 20), P.water, [0, 0.15, 0]);
=======
  part(new THREE.CylinderGeometry(2.1, 2.25, 0.2, 20), P.waterDeep, [0, 0.1, 0]);
  part(new THREE.CylinderGeometry(1.95, 2.1, 0.1, 20), P.water, [0, 0.15, 0]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  ring(2.3, 0.05, 0.2);
=======
  ring(2.1, 0.05, 0.2);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const rad = 1.5 + r() * 0.65;
    const w = 0.35 + r() * 0.25;
=======
    const rad = 1.4 + r() * 0.5;
    const w = 0.2 + r() * 0.1;
>>>>>>> REPLACE
<<<<<<< SEARCH
[Math.sin(a) * rad, 0.25 + w * 0.3, Math.cos(a) * rad], {
=======
[Math.sin(a) * rad, 0.2 + w * 0.2, Math.cos(a) * rad], {
>>>>>>> REPLACE
<<<<<<< SEARCH
    const h = 0.3 + r() * 0.25;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad * 0.9 + 0.2;
    part(new THREE.ConeGeometry(0.09, h, 4), i % 2 ? P.foam : P.water, [x, 0.22 + h / 2, z], {
      rotation: [Math.cos(a) * 25, 0, -Math.sin(a) * 25],
=======
    const h = 0.14 + r() * 0.08;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad * 0.9 + 0.2;
    part(new THREE.ConeGeometry(0.07, h, 4), i % 2 ? P.foam : P.water, [x, 0.2 + h / 2, z], {
      rotation: [Math.cos(a) * 10, 0, -Math.sin(a) * 10],
>>>>>>> REPLACE
<<<<<<< SEARCH
      0.45 + r() * 0.3,
=======
      0.26 + r() * 0.1,
>>>>>>> REPLACE

<!-- call: fit-mantle -->

The mantle spine leaned back too far, so the loft, fin and spine blades overshot the box. I rewrote the whole function to fix this. It keeps the same design and details:

- The spine runs more upright and sits inside the box.
- The loft is narrower and lifted.
- The blades and crest fin are smaller and brought forward.
- The skirt and collar are smaller and raised, so they no longer drop below y = 1.2.

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMantle({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const base = M.mantleBase;
  const sp = (t: number): [number, number, number] => [0, 1.55 + t * 1.55, -0.45 - t * 0.55];
  const N = 7;
  const radius = (t: number) => Math.max(0.14, 0.95 * Math.sin(Math.PI * (0.2 + 0.8 * t) * 0.92) + 0.05);
  const st = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const rr = radius(t);
    st.push({ at: sp(t), w: rr * 2, h: rr * 1.5 });
  }
  const mid = J.mantle;
  b.loft(st, { bone: [J.root, mid], color: P.skinTop, sides: 10 } as any);

  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  b.part(cyl(0.8, 0.95, 0.25, 12), P.skinDark, { bone: J.root, at: [0, 1.35, -0.45] });

  for (const t of [0.25, 0.48, 0.7]) {
    const c = sp(t);
    const rr = radius(t);
    b.part(new THREE.TorusGeometry(rr * 0.97, 0.04, 5, 18), P.gold, {
      bone: mid, at: c, dir: [0, 1, -0.3], axis: "z",
    });
  }

  const fin: [number, number][] = [[0, 0], [0.6, 0], [0.9, 0.35], [1.1, 0.8], [0.7, 0.65], [0.5, 0.9], [0.25, 0.45]];
  b.extrude(fin, {
    at: [0, 2.2, -1.2], x: [0, 0.3, -1], y: [0, 1, 0.3],
    thickness: 0.06, color: P.gold, bone: mid,
  } as any);

  for (let i = 0; i < 8; i++) {
    const t = 0.12 + i * 0.1;
    const c = sp(t);
    const rr = radius(t);
    const back = [c[0], c[1] + rr * 0.4, c[2] - rr * 0.6] as [number, number, number];
    b.spike(back, [0, 0.6, -1], 0.22 - i * 0.012, 0.05, { color: P.spine, bone: mid });
  }

  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const t = 0.2 + i * 0.17;
      const c = sp(t);
      const rr = radius(t);
      b.spike([c[0] + s * rr * 0.85, c[1] + 0.1, c[2]], [s, 0.5, -0.3], 0.2, 0.045, { color: P.spine, bone: mid });
    }

  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const t = 0.18 + i * 0.13;
      const c = sp(t);
      const rr = radius(t);
      const p: [number, number, number] = [c[0] + s * rr * 0.93, c[1], c[2]];
      b.part(new THREE.TorusGeometry(0.07, 0.016, 4, 8), P.glowTeal, { bone: mid, at: p, dir: [s, 0, 0], axis: "z" });
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.02), P.glowTeal, { bone: mid, at: p, dir: [s, 0, 0], axis: "z" });
    }

  for (let i = 0; i < 34; i++) {
    const t = 0.15 + r() * 0.7;
    const a = (r() - 0.5) * Math.PI * 1.7;
    const c = sp(t);
    const rr = radius(t);
    const p: [number, number, number] = [c[0] + Math.sin(a) * rr * 0.97, c[1] + Math.cos(a) * rr * 0.7, c[2] - Math.abs(Math.cos(a)) * rr * 0.3];
    const dirv: [number, number, number] = [Math.sin(a), Math.cos(a) * 0.8, -0.3];
    b.part(cyl(0.07 + r() * 0.07, 0.07, 0.03, 7), i % 3 ? P.skinMid : P.skinDark, { bone: mid, at: p, dir: dirv });
  }

  b.part(sph(0.6, 10, 7), P.skinMid, { bone: J.root, at: [0, 1.7, -0.1], scale: [1.4, 0.6, 0.8] });
  b.part(new THREE.TorusGeometry(0.8, 0.04, 5, 16), P.gold, { bone: J.root, at: [0, 1.6, -0.25], dir: [0, 0.4, 1], axis: "z" });
}
```