<!-- call: plan -->

```json
{
  "name": "Alebrije Jaguar-Eagle",
  "description": "A standing Oaxacan alebrije chimera: a jaguar's body on four short legs, an eagle head with a hooked golden beak and feather crest, half-spread patterned wings and a curling feathered tail, painted in saturated colors with dense dot and chevron motifs.",
  "builderName": "alebrijeJaguarEagle",
  "size": [4.6, 3.1, 5.0],
  "layout": "A quadruped standing on four short jaguar legs (the only parts touching the floor), body from chest z=+1.0 to rump z=-1.45 at hip height ~1.0. The eagle head rides a raised neck at the front: skull top ~2.3, hooked golden beak pointing +Z to z=2.25, tall feather crest sweeping back. Both wings spring from shoulder mounts at [±0.55, 1.9, 0.7] and spread outward and up to tips at [±2.2, 2.95, 0.1] — the widest part of the silhouette. The tail leaves the rump at [0, 1.5, -1.5] and curls up and back to [0, 2.55, -2.6], ending in a feather fan. From the front you read the cream chest bib, the striped face with round eyes and hook beak, wings arcing overhead. Every part wears the alebrije style: a saturated main coat, then motifs built as their own small seated parts — rows of painted dots, thin chevron slabs, zigzag trim bands between colors, golden claws and beak, inked pupils. Faceted primitive shapes, bold proportions, no real wood visible: it is wood as a painting.",
  "palette": {
    "orange": "#ff7a2e",
    "cream": "#ffe9c4",
    "teal": "#23b5a4",
    "cobalt": "#2f4fd0",
    "skyBlue": "#43a9e8",
    "magenta": "#e04a9c",
    "golden": "#f5b71e",
    "green": "#43b04c",
    "red": "#d8382a",
    "coral": "#ff6b52",
    "deepPurple": "#4a2168",
    "ink": "#241238",
    "white": "#fdf6e8",
    "pink": "#ff9ec4"
  },
  "mounts": {
    "neckBase": [0, 1.8, 1.05],
    "jawHinge": [0, 2.12, 1.6],
    "wingLRoot": [0.55, 1.9, 0.7],
    "wingRRoot": [-0.55, 1.9, 0.7],
    "tailRoot": [0, 1.5, -1.5],
    "hipFL": [0.45, 0.98, 0.72],
    "hipFR": [-0.45, 0.98, 0.72],
    "hipBL": [0.48, 1.0, -1.0],
    "hipBR": [-0.48, 1.0, -1.0]
  },
  "joints": [
    { "name": "core", "at": [0, 1.35, 0], "dir": [0, 0.2, 1], "role": "spine" },
    { "name": "chest", "parent": "core", "at": [0, 1.55, 0.75], "dir": [0, 0.25, 1], "role": "spine" },
    { "name": "hips", "parent": "core", "at": [0, 1.45, -1.05], "dir": [0, 0.1, -1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.8, 1.05], "dir": [0, 0.5, 0.85], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 2.25, 1.55], "dir": [0, 0.3, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 2.12, 1.6], "dir": [0, -0.35, 0.95], "role": "jaw" },
    { "name": "wingL", "parent": "chest", "at": [0.55, 1.9, 0.7], "dir": [0.8, 0.55, 0.15], "role": "wing" },
    { "name": "wingR", "parent": "chest", "at": [-0.55, 1.9, 0.7], "dir": [-0.8, 0.55, 0.15], "role": "wing" },
    { "name": "tail", "parent": "hips", "at": [0, 1.5, -1.5], "dir": [0, 0.55, -0.85], "role": "tail" },
    { "name": "tailTip", "parent": "tail", "at": [0, 2.3, -2.35], "dir": [0, 0.9, 0.3], "role": "tail" },
    { "name": "hipFL", "parent": "chest", "at": [0.45, 0.98, 0.72], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFL", "parent": "hipFL", "at": [0.5, 0.6, 0.8], "dir": [0, -0.8, 0.12], "role": "leg" },
    { "name": "ankleFL", "parent": "kneeFL", "at": [0.48, 0.26, 0.72], "dir": [0, -0.6, -0.3], "role": "leg" },
    { "name": "hipFR", "parent": "chest", "at": [-0.45, 0.98, 0.72], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFR", "parent": "hipFR", "at": [-0.5, 0.6, 0.8], "dir": [0, -0.8, 0.12], "role": "leg" },
    { "name": "ankleFR", "parent": "kneeFR", "at": [-0.48, 0.26, 0.72], "dir": [0, -0.6, -0.3], "role": "leg" },
    { "name": "hipBL", "parent": "hips", "at": [0.48, 1.0, -1.0], "dir": [0, -1, -0.05], "role": "leg" },
    { "name": "kneeBL", "parent": "hipBL", "at": [0.54, 0.58, -0.9], "dir": [0, -0.75, 0.1], "role": "leg" },
    { "name": "ankleBL", "parent": "kneeBL", "at": [0.5, 0.24, -1.02], "dir": [0, -0.6, -0.3], "role": "leg" },
    { "name": "hipBR", "parent": "hips", "at": [-0.48, 1.0, -1.0], "dir": [0, -1, -0.05], "role": "leg" },
    { "name": "kneeBR", "parent": "hipBR", "at": [-0.54, 0.58, -0.9], "dir": [0, -0.75, 0.1], "role": "leg" },
    { "name": "ankleBR", "parent": "kneeBR", "at": [-0.5, 0.24, -1.02], "dir": [0, -0.6, -0.3], "role": "leg" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The jaguar body, built skeleton-first on core, chest and hips: one smooth loft/sweep from the chest front (z≈+1.0, meeting the neckBase mount) over a deep chest, a tucked waist and a rounded rump to z≈-1.45 (the tailRoot mount), belly bottom near y≈0.85. Main coat orange; a cream chest bib wraps the front and the underside of the rump is cream — colour by place, warm top, pale belly. Alebrije patterning is built as its own small seated parts, not painted bands: two flanking rows of flattened disc dots (teal, magenta, green, red) marching down each side from shoulder to haunch; thin teal and cobalt chevron slabs laid over each shoulder blade and haunch like painted arrows; a golden spine ridge of small triangular spikes riding the back from chest to rump; a cream zigzag trim row separating orange back from cream belly (short slanted slabs in a repeating rhythm). Small feather tufts (magenta and teal spikes or cards) sprout at each shoulder where the wing mounts sit. Include the rounded shoulder hump just behind the neck. Ends: chest front reaches the neckBase mount at [0, 1.8, 1.05]; rump reaches the tailRoot mount at [0, 1.5, -1.5]; underside meets the four hip socket mounts.",
      "box": [[-0.75, 0.85, -1.45], [0.75, 2.0, 1.1]],
      "attaches": "Front face of the chest builds up to the neckBase mount (the head part's neck overlaps it). Rump builds to the tailRoot mount. Underside meets hip mounts hipFL/hipFR/hipBL/hipBR — the legs part grows out of these sockets. Shoulders carry wingLRoot and wingRRoot mounts; leave the mount points free of geometry so the wings root into them.",
      "joints": ["core", "chest", "hips"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "head",
      "builds": "Neck plus eagle head, the face settled first. Neck: a sweep rising from the neckBase mount [0, 1.8, 1.05] up to the head joint [0, 2.25, 1.55], orange with a cream throat bib and a row of teal dots down its front; two magenta side-feather fans where it meets the chest. Head: a rounded faceted skull (sphere/box blend) wider at the cheek ruffs, orange with a cream face mask around the eyes and beak. Beak as two separate jaws so it can open: an upper jaw riding the head joint — a golden hooked lathe/cone beak with a deepPurple tip and a thin cream cere band at the base, top edge to z≈2.25; and a lower jaw riding the jaw joint at the jawHinge mount [0, 2.12, 1.6] — a smaller cream mandible with a red tongue plate inside. Eyes: two big round eyes (spheres) at the head's face, white sclera, ink pupil, golden iris ring, each set inside a teal eyelid ring, with a bold deepPurple brow slab above each eye — the eyes must read from the front, nothing in front of them. Crest: three tall back-swept feather blades (extruded slabs, root to tip in magenta, teal, golden) rising from the crown to y≈2.75, plus two smaller green cheek feathers. Cheek ruffs: zigzag-edged cream feather plates (stepped slabs) flanking each eye. Chin wattle: a small coral teardrop under the beak. Finish with teal dot dots across the skull crown and a red chevron on each cheek.",
      "box": [[-0.55, 1.55, 0.95], [0.55, 2.85, 2.3]],
      "attaches": "Neck base overlaps the torso's chest at the neckBase mount [0, 1.8, 1.05]; head and jaw ride the head and jaw joints; the jaw pivots at the jawHinge mount [0, 2.12, 1.6]. Crest and ruffs sit on the head bone only.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "wings",
      "builds": "Both eagle wings, mirrored, riding the wingL and wingR joints, raised in a proud half-spread. Each wing: an arm bone sweep from its shoulder mount [±0.55, 1.9, 0.7] outward and up, bending at a wrist partway out toward [±1.5, 2.55, 0.3], carrying three finger prongs to the tip at [±2.2, 2.95, 0.1]; the arm is orange with a golden shoulder pauldron (a turned dome with a small red emblem dot) at the root and teal cuff bands at the wrist. Feather construction in bold layers, root to tip: two rows of broad covert feathers as extruded blades shingled down the arm — inner row cream, outer row teal; a mid row of long secondary feathers in cobalt and skyBlue alternating; primaries at the wing tip — five long separated blades in magenta, red, coral and deepPurple, each with a cream scallop tip and splayed apart. Wing underside gets a thin cream membrane or under-coverts in pink. Motifs: a single row of green and golden dots along the arm's top edge, a red chevron slab at the wrist, small white dots scattered on the cobalt secondaries. Keep the two wings identical with mirrored placement; tips reach [±2.2, 2.95, 0.1] and never touch the floor.",
      "box": [[-2.3, 1.6, -0.7], [2.3, 3.05, 1.25]],
      "attaches": "Each wing's arm roots into its shoulder mount wingLRoot [0.55, 1.9, 0.7] / wingRRoot [-0.55, 1.9, 0.7], buried slightly into the torso's shoulder hump; rides the wingL and wingR joints.",
      "joints": ["wingL", "wingR"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "legs",
      "builds": "Four muscular short jaguar legs, the only floor contact, riding the hip/knee/ankle joints of each leg. Each leg: a thick thigh sweep from its hip mount bulging backward, an angled shank to the knee and a lower shank down to the ankle; front legs straighter under the chest, back legs with heavier haunches. Coat orange with cream paws and lower shanks; patterning continuing the body language: teal chevron slabs across each thigh, magenta dot dots down the outer face of each shank, a red band above each ankle. Paws: chunky rounded boxes resting on y=0 (each paw's lowest points touch the floor), four golden claws each curling from the toe front, and a magenta paw pad plate on the sole. Ankle: a teal cuff band with golden dot studs. Paws of the front legs at z≈0.72, back legs at z≈-1.02; keep x within ±0.85 so the stance reads solid and symmetrical.",
      "box": [[-0.9, 0.0, -1.4], [0.9, 1.1, 1.1]],
      "attaches": "Each leg's thigh grows out of its hip mount (hipFL [0.45, 0.98, 0.72], hipFR [-0.45, 0.98, 0.72], hipBL [0.48, 1.0, -1.0], hipBR [-0.48, 1.0, -1.0]) and rides that leg's hip, knee and ankle joints; paws touch the floor at y=0.",
      "joints": ["hipFL", "kneeFL", "ankleFL", "hipFR", "kneeFR", "ankleFR", "hipBL", "kneeBL", "ankleBL", "hipBR", "kneeBR", "ankleBR"],
      "floor": true,
      "budget": 160
    },
    {
      "id": "tail",
      "builds": "A serpentine feathered tail, the signature flourish, riding the tail and tailTip joints. A tapering sweep (radius from ~0.14 to a point) leaves the tailRoot mount [0, 1.5, -1.5], drops slightly then curls up and back through the tail joint to the tailTip joint at [0, 2.3, -2.35], ending at [0, 2.55, -2.6]. The tail is banded by alternating colours along its length — orange, teal, cobalt, magenta — each band edge trimmed with a thin cream ring; a dorsal ridge of small golden spikes rides the tail's top from root to mid. At the tip: a feather fan tuft — seven broad extruded blades fanning up and outward in green, coral, pink, golden and deepPurple, each with a cream scallop edge and a green dot at its base, like a rooster's tail on an alebrije. A small golden bead caps the fan's hub. The tail never touches the floor; its lowest point stays above the belly line.",
      "box": [[-0.5, 1.35, -2.7], [0.5, 2.7, -1.35]],
      "attaches": "Roots into the tailRoot mount [0, 1.5, -1.5] at the torso's rump, buried slightly into the rump volume; rides the tail and tailTip joints.",
      "joints": ["tail", "tailTip"],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { frame, catmull, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const root = M.tailRoot;
  const pts: number[][] = [
    [0, 1.5, -1.45],
    [0, 1.45, -1.8],
    [0, 1.62, -2.1],
    [0, 2.0, -2.3],
    [0, 2.3, -2.35],
    [0, 2.52, -2.58],
  ];
  const path = catmull(pts);
  const bands = [P.orange, P.teal, P.cobalt, P.magenta];
  const bandT = [0.2, 0.4, 0.6, 0.8, 1];
  const bandList: [number, string][] = bandT.map((t, i) => [t, bands[i % 4]]);
  const tube = b.sweep(path, (t: number) => 0.14 * (1 - t) + 0.035, {
    bands: bandList,
    sides: 8,
    bone: [J.tail, J.tailTip],
    caps: "round",
  });

  // cream rings at band edges
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const p = path.at(t);
    const d = path.tangentAt(t);
    const r = 0.14 * (1 - t) + 0.035 + 0.012;
    b.part(new THREE.TorusGeometry(r, 0.012, 5, 10), P.cream, {
      at: p,
      dir: d,
      axis: "z",
      bone: t < 0.5 ? J.tail : J.tailTip,
    });
  }

  // dorsal golden spikes root to mid
  for (let i = 0; i < 7; i++) {
    const t = 0.05 + i * 0.07;
    const sp = tube.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.03, 0.1, 5), P.golden, sp, { embed: 0.2 });
  }

  // feather fan at tip
  const hub = path.at(1);
  const hubP: number[] = [hub.x, hub.y, hub.z];
  const cols = [P.green, P.coral, P.pink, P.golden, P.pink, P.coral, P.green];
  const R = rng(5);
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 55; // degrees spread across x
    const ar = (a * Math.PI) / 180;
    const len = 0.55 + 0.1 * (1 - Math.abs(i - 3) / 3) + R() * 0.03;
    const dir = [Math.sin(ar) * 0.9, 0.55 + Math.cos(ar) * 0.4, -0.45 - Math.cos(ar) * 0.1];
    const outline: [number, number][] = [
      [-0.0, 0],
      [0.07, 0.15 * len],
      [0.1, 0.6 * len],
      [0.06, 0.92 * len],
      [0, len],
      [-0.06, 0.92 * len],
      [-0.1, 0.6 * len],
      [-0.07, 0.15 * len],
    ];
    const side: number[] = [Math.cos(ar), 0, Math.sin(ar) * 0.3];
    const f = b.extrude(outline, {
      at: hubP,
      x: side,
      y: dir,
      thickness: 0.02,
      color: cols[i],
      bone: J.tailTip,
    });
    // cream scallop tip
    const tipPos = f.local([0, len * 0.9, 0.012]);
    b.part(new THREE.SphereGeometry(0.045, 6, 4), P.cream, {
      at: tipPos,
      bone: J.tailTip,
    });
    // green dot at base
    b.part(new THREE.SphereGeometry(0.025, 6, 4), P.green, {
      at: f.local([0, len * 0.18, 0.013]),
      bone: J.tailTip,
    });
  }
  // gold bead
  b.part(new THREE.SphereGeometry(0.06, 8, 6), P.golden, { at: hubP, bone: J.tailTip });
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const legs = [
    { n: "FL", s: 1, front: true },
    { n: "FR", s: -1, front: false },
    { n: "BL", s: 1, front: false },
    { n: "BR", s: -1, front: false },
  ];
  const sp = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  for (const L of legs) {
    const front = L.n[0] === "F";
    const s = L.s;
    const hip = J["hip" + L.n], knee = J["knee" + L.n], ank = J["ankle" + L.n];
    const hp = hip.at.clone(), kp = knee.at.clone(), ap = ank.at.clone();
    const footZ = front ? 0.72 : -1.02;
    const x = ap.x;
    const thighR = front ? 0.2 : 0.27;
    // thigh
    b.capsule(hp, kp, [thighR, 0.16], P.orange, { bone: hip });
    if (!front) b.part(sp(0.3, 8, 6), P.orange, { bone: hip, at: [x, 0.92, -1.08], scale: [0.85, 1, 1.15] });
    // shank
    b.capsule(kp, ap, [0.15, 0.12], P.orange, { bone: knee });
    // lower shank cream
    const lo = [ap.x, 0.17, ap.z];
    b.capsule(ap, lo, 0.12, P.cream, { bone: ank });
    // thigh chevrons
    for (let i = 0; i < 2; i++) {
      const y = hp.y - 0.12 - i * 0.12;
      const px = hp.x + s * (thighR + 0.01) * 0.9;
      for (const k of [-1, 1])
        b.part(new THREE.BoxGeometry(0.03, 0.04, 0.2), P.teal, {
          bone: hip,
          at: [px + s * 0.02, y + 0.03, hp.z + k * 0.0 + (front ? 0 : -0.05)],
          rotation: [k * 35, 0, 0],
        });
    }
    // dots on shank outer face
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), P.magenta, {
        bone: knee,
        at: [kp.x + (ap.x - kp.x) * t + s * 0.14, kp.y + (ap.y - kp.y) * t, kp.z + (ap.z - kp.z) * t],
        dir: [s, 0, 0],
      });
    }
    // red band above ankle
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 10), P.red, { bone: knee, at: [ap.x, ap.y + 0.1, ap.z + 0.0] });
    // teal cuff
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.06, 10), P.teal, { bone: ank, at: [ap.x, ap.y - 0.02, ap.z] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(sp(0.018, 5, 4), P.golden, {
        bone: ank,
        at: [ap.x + Math.sin(a) * 0.15, ap.y - 0.02, ap.z + Math.cos(a) * 0.15],
      });
    }
    // paw
    const pawH = 0.16;
    b.part(new THREE.BoxGeometry(0.34, pawH, 0.46), P.cream, { bone: ank, at: [x, pawH / 2 - 0.0, footZ + 0.06] });
    b.part(new THREE.BoxGeometry(0.3, 0.1, 0.1), P.cream, { bone: ank, at: [x, 0.08, footZ + 0.3] });
    // toe dots + claws
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.08;
      const cl = b.spike([tx, 0.07, footZ + 0.36], [0, -0.35, 1], 0.14, 0.022, { color: P.golden, bone: ank });
      b.part(sp(0.02, 5, 4), P.pink, { bone: ank, at: [tx, 0.15, footZ + 0.27] });
    }
    // pad
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.22), P.magenta, { bone: ank, at: [x, 0.006, footZ + 0.05] });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const core = J.core, chest = J.chest, hips = J.hips;

  // Spine path from rump to chest front
  const spine = catmull([
    [0, 1.5, -1.45],
    [0, 1.45, -1.0],
    [0, 1.4, -0.2],
    [0, 1.45, 0.5],
    [0, 1.6, 1.0],
  ]);
  const body = b.loft(
    [
      { at: [0, 1.45, -1.35], w: 0.8, h: 0.75 },
      { at: [0, 1.42, -0.95], w: 1.3, h: 1.0 },
      { at: [0, 1.38, -0.2], w: 1.05, h: 0.85 },
      { at: [0, 1.42, 0.5], w: 1.4, h: 1.05 },
      { at: [0, 1.5, 0.95], w: 1.25, h: 1.0 },
    ],
    { bone: [hips, core, chest], color: P.orange, caps: "round" },
  );

  // cream belly underside
  b.loft(
    [
      { at: [0, 1.0, -1.2], w: 0.6, h: 0.14 },
      { at: [0, 0.93, -0.5], w: 0.8, h: 0.14 },
      { at: [0, 0.92, 0.3], w: 0.85, h: 0.14 },
      { at: [0, 0.95, 0.9], w: 0.8, h: 0.14 },
    ],
    { bone: [hips, core, chest], color: P.cream },
  );

  // chest bib
  b.part(new THREE.SphereGeometry(0.5, 10, 8), P.cream, {
    bone: chest, at: [0, 1.5, 1.0], scale: [1.0, 1.05, 0.7],
  });
  // shoulder hump
  b.part(new THREE.SphereGeometry(0.5, 10, 8), P.orange, {
    bone: chest, at: [0, 1.95, 0.55], scale: [1.2, 0.6, 0.9],
  });

  const surf = b.surface(body);
  const r = rng(5);
  const dotCols = [P.teal, P.magenta, P.green, P.red];

  for (const s of [1, -1]) {
    // flank dots
    for (let i = 0; i < 9; i++) {
      const z = 0.8 - i * 0.2;
      const hit = surf.ray([s * 2, 1.45 + (i % 2) * 0.12, z], [-s, 0, 0]);
      if (hit)
        b.stick(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), dotCols[i % 4], hit, { embed: 0.3 });
    }
    // zigzag trim row
    for (let i = 0; i < 12; i++) {
      const z = 0.85 - i * 0.18;
      const hit = surf.ray([s * 2, 1.12, z], [-s, 0, 0]);
      if (hit)
        b.stick(new THREE.BoxGeometry(0.1, 0.05, 0.14), P.cream, hit, {
          embed: 0.3, spin: i % 2 ? 35 : -35,
        });
    }
    // chevrons on shoulder and haunch
    for (const [z, col, y] of [[0.6, P.teal, 1.75], [-0.95, P.cobalt, 1.7]] as [number, string, number][]) {
      for (let k = 0; k < 2; k++) {
        const hit = surf.ray([s * 2, y - k * 0.12, z + k * -0.05], [-s, 0, 0]);
        if (hit) {
          for (const a of [28, -28])
            b.stick(new THREE.BoxGeometry(0.28, 0.04, 0.07), col, hit, { embed: 0.3, spin: a });
        }
      }
    }
    // wing-mount feather tufts (kept off the mount point)
    const tuftCols = [P.magenta, P.teal, P.magenta];
    for (let k = 0; k < 3; k++) {
      b.spike([s * 0.62, 1.82, 0.5 + k * 0.1 - 0.1], [s * 0.4, 0.8 - k * 0.2, -0.3], 0.3, 0.05, {
        color: tuftCols[k], bone: chest,
      });
    }
  }

  // golden spine ridge
  const tops = [] as number[];
  for (let i = 0; i < 16; i++) {
    const z = 0.95 - i * 0.15;
    const hit = surf.ray([0, 3, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.ConeGeometry(0.06, 0.16, 4), P.golden, hit, { embed: 0.2 });
    tops.push(z);
  }
  // rump underside cream
  b.part(new THREE.SphereGeometry(0.4, 8, 6), P.cream, {
    bone: hips, at: [0, 1.15, -1.2], scale: [1.1, 0.6, 0.9],
  });
  // rump dots
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.SphereGeometry(0.05, 6, 4), dotCols[i], {
      bone: hips, at: [0, 1.62 + 0.0, -1.2 + i * 0.02], scale: [1, 0.5, 1],
    });
  }
  void r; void frame; void M;
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.wingL : J.wingR;
    const root = V(s * 0.55, 1.9, 0.7);
    const wrist = V(s * 1.5, 2.55, 0.3);
    const tip = V(s * 2.2, 2.95, 0.1);

    // arm
    b.capsule(root, wrist, [0.12, 0.08], P.orange, { bone });
    b.capsule(wrist, tip, [0.07, 0.03], P.orange, { bone });

    // pauldron
    b.part(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.golden, {
      bone, at: [s * 0.6, 1.95, 0.7], dir: [s * 0.5, 1, 0],
    });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.red, { bone, at: [s * 0.66, 2.16, 0.7] });

    // wrist cuffs
    for (const [t, c] of [[0.0, P.teal], [0.07, P.teal]] as const) {
      const p = V(s * (1.4 + t), 2.49 + t * 0.8, 0.34 - t * 0.5);
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.045, 8), c, { bone, at: p, dir: wrist.clone().sub(root) });
    }
    // red chevron at wrist
    for (const k of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.2, 0.04, 0.05), P.red, {
        bone, at: [s * 1.5, 2.66, 0.32 + k * 0.07], rotation: [0, 0, s * 25 * k],
      });
    }

    // dots along top edge
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const p = root.clone().lerp(wrist, t);
      b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? P.green : P.golden, {
        bone, at: [p.x, p.y + 0.1 - t * 0.03, p.z],
      });
    }

    // feather helper: blade from a point along arm, fanning toward angle in XY plane
    const blade = (
      base: THREE.Vector3, len: number, w: number, angDeg: number, zOff: number,
      color: string, tipColor: string | null,
    ) => {
      const a = (angDeg * Math.PI) / 180;
      const dir = V(Math.cos(a) * s, Math.sin(a), 0);
      const outline: [number, number][] = [
        [0, -w * 0.4], [len * 0.55, -w * 0.5], [len * 0.95, -w * 0.25], [len, 0], [len * 0.95, w * 0.25],
        [len * 0.55, w * 0.5], [0, w * 0.4],
      ];
      b.extrude(outline, {
        at: [base.x, base.y, base.z + zOff], x: [dir.x, dir.y, 0], y: [0, 0, 1],
        thickness: 0.025, bevel: 0.005, color, bone,
      });
      if (tipColor) {
        const e = base.clone().addScaledVector(dir, len * 0.9);
        b.part(new THREE.SphereGeometry(w * 0.28, 6, 4), tipColor, { bone, at: [e.x, e.y, e.z + zOff + 0.02] });
      }
    };

    // under-coverts pink (behind, slightly below)
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = root.clone().lerp(wrist, t);
      blade(V(p.x, p.y - 0.05, p.z), 0.45, 0.2, 5 + t * 20, -0.2, P.pink, null);
    }
    // coverts: two rows
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = root.clone().lerp(wrist, t);
      blade(p, 0.5, 0.2, -8 + t * 10, -0.09, P.cream, null);
      blade(p, 0.55, 0.2, -2 + t * 10, -0.17, P.teal, P.cream);
    }
    // secondaries
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const p = root.clone().lerp(wrist, 0.1 + t * 0.9);
      const col = i % 2 ? P.skyBlue : P.cobalt;
      blade(p, 0.85 - t * 0.2, 0.22, -25 + t * 25, -0.3 - R() * 0.02, col, null);
      if (col === P.cobalt) {
        b.part(new THREE.SphereGeometry(0.03, 6, 4), P.white, {
          bone, at: [p.x + s * 0.35, p.y - 0.2 + t * 0.1, p.z - 0.3 - 0.02],
        });
        b.part(new THREE.SphereGeometry(0.025, 6, 4), P.white, {
          bone, at: [p.x + s * 0.55, p.y - 0.28 + t * 0.12, p.z - 0.3 - 0.02],
        });
      }
    }
    // primaries
    const pc = [P.magenta, P.red, P.coral, P.deepPurple, P.magenta];
    for (let i = 0; i < 5; i++) {
      const ang = 40 - i * 17;
      const base = wrist.clone().lerp(tip, 0.1 + i * 0.1);
      blade(base, 0.8, 0.2, ang, -0.12 - i * 0.04, pc[i], P.cream);
    }
    // finger prongs
    for (let i = 0; i < 3; i++) {
      const p = wrist.clone().lerp(tip, 0.3 + i * 0.3);
      b.spike(p, V(0, 0.4, 0.15).setX(s * 0.2), 0.16, 0.025, { color: P.golden, bone });
    }
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const neck = J.neck, head = J.head, jaw = J.jaw;
  const HEAD_C: [number, number, number] = [0, 2.28, 1.55];

  // helper: simple seated part
  const put = (geo: THREE.BufferGeometry, color: string, bone: any, at: number[], opt: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...opt });

  // ---- Neck
  const npath = catmull([[0, 1.75, 1.0], [0, 1.95, 1.2], [0, 2.12, 1.4], [0, 2.25, 1.55]]);
  b.sweep(npath, [0.34, 0.26], { bone: neck, color: P.orange, sides: 8 });
  // cream throat bib
  b.sweep(catmull([[0, 1.72, 1.2], [0, 1.95, 1.42], [0, 2.1, 1.58]]), [0.2, 0.14], { bone: neck, color: P.cream, sides: 6 });
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    put(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8), P.teal, neck,
      [0, 1.9 + t * 0.32 + 0.0, 1.38 + t * 0.2 + 0.03], { dir: [0, 0.6, 0.8] });
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.spike([s * 0.3, 1.9 + k * 0.08, 1.05 + k * 0.1], [s * 0.7, -0.3 + k * 0.35, 0.2], 0.3 - k * 0.04, 0.07,
        { bone: neck, color: k === 1 ? P.pink : P.magenta });
    }
  }

  // ---- Skull
  put(new THREE.SphereGeometry(0.4, 10, 8), P.orange, head, HEAD_C, { scale: [1.05, 0.95, 1.1] });
  put(new THREE.SphereGeometry(0.3, 8, 6), P.cream, head, [0, 2.2, 1.75], { scale: [1.15, 0.85, 0.9] });
  // teal crown dots
  const r = rng(5);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), P.teal, head,
      [Math.cos(a) * 0.14, 2.62 - Math.abs(Math.cos(a)) * 0.01, 1.48 + Math.sin(a) * 0.12],
      { dir: [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3 - 0.1] });
  }

  // ---- Beak: upper
  put(new THREE.ConeGeometry(0.2, 0.55, 6), P.golden, head, [0, 2.24, 1.98], { dir: [0, 0, 1] });
  put(new THREE.ConeGeometry(0.1, 0.22, 6), P.golden, head, [0, 2.17, 2.2], { dir: [0, -0.9, 0.5] });
  put(new THREE.ConeGeometry(0.05, 0.14, 6), P.deepPurple, head, [0, 2.07, 2.27], { dir: [0, -1, 0.3] });
  put(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 8), P.cream, head, [0, 2.25, 1.72], { dir: [0, 0, 1] });
  for (const s of [1, -1])
    put(new THREE.SphereGeometry(0.025, 5, 4), P.ink, head, [s * 0.07, 2.32, 2.0]);

  // ---- Lower jaw
  put(new THREE.ConeGeometry(0.15, 0.5, 6), P.cream, jaw, [0, 2.1, 1.92], { dir: [0, 0, 1], scale: [1, 1, 0.7] });
  put(new THREE.BoxGeometry(0.16, 0.02, 0.3), P.red, jaw, [0, 2.17, 1.85]);
  // wattle
  put(new THREE.ConeGeometry(0.06, 0.16, 6), P.coral, jaw, [0, 1.98, 1.85], { dir: [0, -1, 0] });

  // ---- Eyes
  for (const s of [1, -1]) {
    const ex = s * 0.24, ey = 2.38, ez = 1.8;
    put(new THREE.TorusGeometry(0.115, 0.03, 6, 10), P.teal, head, [ex, ey, ez + 0.0], { dir: [s * 0.4, 0.05, 1], axis: "z" });
    put(new THREE.SphereGeometry(0.105, 10, 8), P.white, head, [ex, ey, ez - 0.01]);
    put(new THREE.SphereGeometry(0.07, 8, 6), P.golden, head, [ex + s * 0.01, ey, ez + 0.06]);
    put(new THREE.SphereGeometry(0.04, 6, 5), P.ink, head, [ex + s * 0.012, ey, ez + 0.1]);
    put(new THREE.SphereGeometry(0.012, 4, 3), P.white, head, [ex + s * 0.03, ey + 0.025, ez + 0.13]);
    put(new THREE.BoxGeometry(0.22, 0.05, 0.12), P.deepPurple, head, [ex, ey + 0.15, ez - 0.02], { rotation: [0, 0, -s * 14] });
    // cheek ruff, zigzag
    for (let k = 0; k < 4; k++)
      put(new THREE.ConeGeometry(0.06, 0.17, 4), P.cream, head, [s * (0.36 + k * 0.01), 2.3 - k * 0.07, 1.66], { dir: [s, -0.5, -0.2] });
    // red chevron
    put(new THREE.BoxGeometry(0.1, 0.025, 0.04), P.red, head, [s * 0.37, 2.2, 1.78], { rotation: [0, 0, 25] });
    put(new THREE.BoxGeometry(0.1, 0.025, 0.04), P.red, head, [s * 0.37, 2.15, 1.78], { rotation: [0, 0, -25] });
    // green cheek feather
    b.spike([s * 0.38, 2.1, 1.5], [s * 0.6, -0.4, -0.5], 0.3, 0.05, { bone: head, color: P.green });
  }

  // ---- Crest
  const cols = [P.magenta, P.teal, P.golden];
  cols.forEach((c, i) => {
    const x = (i - 1) * 0.1, h = 0.42 - i * 0.02;
    const blade = b.extrude(
      [[-0.07, 0], [0.07, 0], [0.05, h * 0.6], [0, h, "sharp"], [-0.05, h * 0.6]],
      { at: [x, 2.6, 1.38 - i * 0.06], x: [1, 0, 0], y: [0, 0.8, -0.6], thickness: 0.03, color: c, bone: head },
    );
    put(new THREE.SphereGeometry(0.035, 5, 4), P.cream, head, [x, 2.64, 1.36 - i * 0.06]);
  });
}
```