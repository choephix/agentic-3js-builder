<!-- call: plan -->

```json
{
  "name": "Hydra of the Deep Fen",
  "description": "A five-headed hydra in a God of War-style finish: a coiled plated serpent trunk rising to a shoulder crown where five bone-crested necks fan out around one dominant central head, all dark slate scales, weathered bone armour and a toxic green glow burning in eyes, throats and scale seams.",
  "builderName": "hydraOfTheDeepFen",
  "size": [6.0, 5.6, 6.2],
  "layout": "Front (+Z): five heads fan around a tall dominant central head; the two inner heads at x ±1.85 y ~4.7, the two outer heads lower and wider at x ±2.75 y ~4.15, the central head tallest at y ~5.0, all snouts pointing up-and-forward (+Z) so every face reads from the front. Below them the shoulder crown at [0, 3.0, 0.9] sits on a massive rearing trunk: a thick coil lying on the floor at the rear (z -1.2..0.4), then the trunk rising forward to a deep chest with a bone gorget and a broad shoulder hump. Two stocky digitigrade forelegs under the chest plant clawed three-toed feet on the floor; the heavy tail sweeps back from [0, 0.85, -1.2] down to the floor, tapering to a spiked tip at z ~-3.4. Style on every part: dark desaturated slate-teal scales with pale bone plating on brows, gorget, dorsal spikes and claws; hard faceted low-poly surfaces; ink-dark seam lines; glowing toxic green only in eyes, throat gullets, tongue and the crack seams between chest plates — the glow marks the monster's rage, everything else stays cold stone and bone.",
  "palette": {
    "scaleDark": "#232b30",
    "scaleMid": "#39474d",
    "scaleTeal": "#4e6a68",
    "scaleLight": "#6d8482",
    "belly": "#9aa08c",
    "bone": "#d9d0b2",
    "boneShade": "#a49b7e",
    "ink": "#12161a",
    "gum": "#3a2226",
    "tooth": "#ece6cf",
    "glow": "#8cff4d",
    "glowCore": "#d6ffb0",
    "tongue": "#8e3038",
    "membrane": "#3c4a44"
  },
  "mounts": {
    "neckCrown": [0, 3.0, 0.9],
    "tailRoot": [0, 0.85, -1.2],
    "hipL": [0.95, 1.35, 0.6],
    "hipR": [-0.95, 1.35, 0.6],
    "headC": [0, 4.95, 1.45],
    "headIL": [1.85, 4.7, 1.4],
    "headIR": [-1.85, 4.7, 1.4],
    "headOL": [2.75, 4.15, 1.2],
    "headOR": [-2.75, 4.15, 1.2]
  },
  "joints": [
    { "name": "spine1", "at": [0, 0.7, -0.9], "dir": [0, 0.55, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 1.9, 0.1], "dir": [0, 0.75, 1], "role": "spine" },
    { "name": "spine3", "parent": "spine2", "at": [0, 3.0, 0.85], "dir": [0, 1, 0.25], "role": "spine" },
    { "name": "tail1", "parent": "spine1", "at": [0, 0.85, -1.2], "dir": [0, -0.1, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.6, -2.0], "dir": [0, -0.08, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.45, -2.7], "dir": [0, -0.05, -1], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.35, -3.3], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "hipL", "parent": "spine2", "at": [0.95, 1.35, 0.6], "dir": [0, -0.7, 0.45], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [1.18, 0.8, 0.85], "dir": [0, -0.5, -0.4], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [1.08, 0.38, 0.6], "dir": [0, -0.5, 0.5], "role": "leg" },
    { "name": "footL", "parent": "ankleL", "at": [1.08, 0.12, 0.9], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "spine2", "at": [-0.95, 1.35, 0.6], "dir": [0, -0.7, 0.45], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-1.18, 0.8, 0.85], "dir": [0, -0.5, -0.4], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-1.08, 0.38, 0.6], "dir": [0, -0.5, 0.5], "role": "leg" },
    { "name": "footR", "parent": "ankleR", "at": [-1.08, 0.12, 0.9], "dir": [0, 0, 1], "role": "leg" },
    { "name": "neckC1", "parent": "spine3", "at": [0, 3.05, 1.0], "dir": [0, 1, 0.2], "role": "neck" },
    { "name": "neckC2", "parent": "neckC1", "at": [0, 3.9, 1.25], "dir": [0, 0.9, 0.2], "role": "neck" },
    { "name": "neckC3", "parent": "neckC2", "at": [0, 4.55, 1.35], "dir": [0, 0.7, 0.3], "role": "neck" },
    { "name": "headC", "parent": "neckC3", "at": [0, 4.95, 1.45], "dir": [0, 0.35, 1], "role": "head" },
    { "name": "jawC", "parent": "headC", "at": [0, 4.82, 1.85], "dir": [0, -0.15, 1], "role": "jaw" },
    { "name": "neckIL1", "parent": "spine3", "at": [0.55, 3.0, 0.95], "dir": [1, 1, 0.3], "role": "neck" },
    { "name": "neckIL2", "parent": "neckIL1", "at": [1.25, 3.75, 1.15], "dir": [1, 0.8, 0.2], "role": "neck" },
    { "name": "neckIL3", "parent": "neckIL2", "at": [1.7, 4.35, 1.3], "dir": [0.6, 0.6, 0.4], "role": "neck" },
    { "name": "headIL", "parent": "neckIL3", "at": [1.85, 4.7, 1.4], "dir": [0.4, 0.35, 1], "role": "head" },
    { "name": "jawIL", "parent": "headIL", "at": [2.05, 4.58, 1.78], "dir": [0.4, -0.15, 1], "role": "jaw" },
    { "name": "neckIR1", "parent": "spine3", "at": [-0.55, 3.0, 0.95], "dir": [-1, 1, 0.3], "role": "neck" },
    { "name": "neckIR2", "parent": "neckIR1", "at": [-1.25, 3.75, 1.15], "dir": [-1, 0.8, 0.2], "role": "neck" },
    { "name": "neckIR3", "parent": "neckIR2", "at": [-1.7, 4.35, 1.3], "dir": [-0.6, 0.6, 0.4], "role": "neck" },
    { "name": "headIR", "parent": "neckIR3", "at": [-1.85, 4.7, 1.4], "dir": [-0.4, 0.35, 1], "role": "head" },
    { "name": "jawIR", "parent": "headIR", "at": [-2.05, 4.58, 1.78], "dir": [-0.4, -0.15, 1], "role": "jaw" },
    { "name": "neckOL1", "parent": "spine3", "at": [1.0, 2.85, 0.85], "dir": [1.4, 0.8, 0.2], "role": "neck" },
    { "name": "neckOL2", "parent": "neckOL1", "at": [2.0, 3.4, 0.95], "dir": [1.2, 0.7, 0.2], "role": "neck" },
    { "name": "neckOL3", "parent": "neckOL2", "at": [2.6, 3.85, 1.1], "dir": [0.7, 0.5, 0.4], "role": "neck" },
    { "name": "headOL", "parent": "neckOL3", "at": [2.75, 4.15, 1.2], "dir": [0.5, 0.3, 1], "role": "head" },
    { "name": "jawOL", "parent": "headOL", "at": [2.95, 4.04, 1.56], "dir": [0.5, -0.15, 1], "role": "jaw" },
    { "name": "neckOR1", "parent": "spine3", "at": [-1.0, 2.85, 0.85], "dir": [-1.4, 0.8, 0.2], "role": "neck" },
    { "name": "neckOR2", "parent": "neckOR1", "at": [-2.0, 3.4, 0.95], "dir": [-1.2, 0.7, 0.2], "role": "neck" },
    { "name": "neckOR3", "parent": "neckOR2", "at": [-2.6, 3.85, 1.1], "dir": [-0.7, 0.5, 0.4], "role": "neck" },
    { "name": "headOR", "parent": "neckOR3", "at": [-2.75, 4.15, 1.2], "dir": [-0.5, 0.3, 1], "role": "head" },
    { "name": "jawOR", "parent": "headOR", "at": [-2.95, 4.04, 1.56], "dir": [-0.5, -0.15, 1], "role": "jaw" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The rearing serpent trunk and shoulder crown. Build a loft or sweep along the spine path from a broad coil on the floor at the rear (radius ~0.85 flattened under by shift so it rests on y=0) rising forward through the chest (radius ~0.7 at spine2) to the shoulder hump at the neckCrown mount (radius ~0.6, spine3), skinning over spine1..3. Back and flanks wear scaleDark to scaleMid fading to scaleTeal on the upper flanks and scaleLight on ridge tops; the underside is pale belly. Details: a gorget of overlapping bone plates across the chest front (bone with boneShade under-plates and ink gaps); broad transverse belly scutes (belly, inked seams) from the coil up the throat line; a dorsal ridge of faceted bone spikes (bone) running spine1 to spine3, each a frustum or extruded blade seated on the surface with a glow scale-crack part (glow) seated in the seam beside every third spike; a few scattered raised scale plates (scaleTeal, small extruded hexagons) on the shoulders; two ink eye-like glow slits are NOT part of this part (heads own eyes). The top of this part ends cleanly at the neckCrown mount where all five necks root.",
      "box": [[-1.5, 0, -1.7], [1.5, 3.15, 1.5]],
      "attaches": "Rises from the floor coil; spine3 ends at mount neckCrown where the necks part roots all five necks; spine1 hands off at mount tailRoot to the tail part; hipL/hipR mounts on the lower flank are shared with the legs part.",
      "joints": ["spine1", "spine2", "spine3"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "tail",
      "builds": "The heavy serpent tail. A sweep from mount tailRoot (radius ~0.5) curving back and down through tail1..tail4, tapering to ~0.06 at the tip which rests and curls slightly on the floor at z ~-3.4. Colours: scaleDark on top blending to scaleTeal at the sides, belly underneath, gradient to scaleLight near the tip. Details: a continuous row of alternating bone spikes (bone, small frustums) down the dorsal line via b.along on the tail sweep; three bony tail rings (boneShade bands swept at t ~0.3/0.55/0.75, ink-edged); a barbed tip of two crossed bone blades (extruded, bone with boneShade edges) at the very end; a few scale-teal plates stuck along the flanks.",
      "box": [[-0.75, 0, -3.6], [0.75, 1.5, -0.9]],
      "attaches": "Roots at mount tailRoot on spine1's rear; everything else of the part is free-hanging to the floor.",
      "joints": ["tail1", "tail2", "tail3", "tail4"],
      "floor": true,
      "budget": 110
    },
    {
      "id": "legs",
      "builds": "Two stocky digitigrade forelegs. For each side build the chain hipX-kneeX-ankleX-footX as a lofted limb: massive thigh (radius ~0.32) with a heavy shoulder mass blending into the torso flank at mount hipX, knee bent back, ankle forward, and a broad three-toed foot planted flat on the floor (foot joint at y 0.12, toes splayed forward +Z with the middle toe longest). Colours: scaleDark upper leg, scaleTeal shin, belly-toned inner thigh. Details per foot: three clawed toes built as tapered bone frustums (bone) each tipped with a dark ink claw point, plus a rear dewclaw; bone shin guards (extruded plates, bone over boneShade) strapped over the knee with ink bands; a spike cluster (bone) on each knee and elbow; a few scale plates (scaleTeal) stuck on the thigh. Feet rest exactly on y=0.",
      "box": [[-1.9, 0, -0.2], [1.9, 1.45, 1.3]],
      "attaches": "Thigh tops merge into the torso flanks at mounts hipL and hipR on spine2; feet plant on the floor between the tail root and the body coil.",
      "joints": ["hipL", "kneeL", "ankleL", "footL", "hipR", "kneeR", "ankleR", "footR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "necks",
      "builds": "All five serpentine necks rising from the shoulder crown. For each neck build its chain (neckXX1..3) as a sweep, radius ~0.26 at the crown tapering to ~0.14 where it meets its head mount, the outer necks thicker (~0.3 to 0.18) and the central neck the thickest (~0.3 to 0.16). Colour each neck: scaleDark along the top (nape), scaleTeal on the sides, pale belly strip on the underside facing inward-down. Details per neck: a double row of faceted bone spikes down the nape placed with b.along along the sweep (largest at the base, shrinking to the head, bone with boneShade bases); 3-4 ink seam rings low on each neck; a glowing throat gullet: a strip of glow-coloured scale-like segments (glow, tiny extruded plates) running up the front of the underside from crown to jaw line on every neck, brightest on the central neck; scattered raised scale plates (scaleLight) on the outer curve. The five necks must visually braid apart from the crown: slight overlap at the base is fine, separation by neck2.",
      "box": [[-2.7, 2.8, 0.5], [2.7, 4.7, 1.7]],
      "attaches": "All five necks root at mount neckCrown on spine3, positioned at the crown's five root points; each neck tip ends exactly at its head mount (headC, headIL, headIR, headOL, headOR) where the heads part begins.",
      "joints": ["neckC1", "neckC2", "neckC3", "neckIL1", "neckIL2", "neckIL3", "neckIR1", "neckIR2", "neckIR3", "neckOL1", "neckOL2", "neckOL3", "neckOR1", "neckOR2", "neckOR3"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "heads",
      "builds": "All five heads, one per head mount, identical construction with the central head 15% larger and all jaws slightly agape showing teeth. Each head rides its headX joint and is aimed along that joint's dir. Build: an angular faceted skull (loft or frustum boxes: narrow snout widening to the jaw hinge), a heavy bone brow ridge (extruded bone plate over each eye, boneShade underside), two swept-back horns (spikes or swept beziers, bone with ink tips) per head, jaw hinge cheeks of scaleMid, a lower jaw as a separate piece on the jawX joint with a gum-dark interior (gum) and two rows of triangular teeth (tooth, small cones) on both upper and lower jaws, a tongue (tongue colour, flat extruded blade) lolling from the central jaw only, and a pair of big glowing eyes (glow kit on small sphere or extruded almond parts, glow with a glowCore highlight dot, ink socket rim) set under the brow. Behind each jaw hinge a short neck-frill of membrane-coloured webbed spikes (b.membrane or thin extruded blades, membrane with bone spines). Add ink nostril slits on the snout top and 2-3 bone plating shards down the skull midline. The central head additionally gets a crown of three small bone horns and a brighter throat glow.",
      "box": [[-3.1, 3.9, 0.7], [3.1, 5.55, 2.4]],
      "attaches": "Each head seats onto its neck at the head mounts headC, headIL, headIR, headOL, headOR, riding headC/jawC, headIL/jawIL, headIR/jawIR, headOL/jawOL, headOR/jawOR.",
      "joints": ["headC", "jawC", "headIL", "jawIL", "headIR", "jawIR", "headOL", "jawOL", "headOR", "jawOR"],
      "floor": false,
      "budget": 280
    }
  ]
}
```

<!-- call: necks -->

```ts
import * as THREE from "three";
import { rng, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildNecks({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const necks = [
    { id: "C", s: 0, base: [0, 3.0, 0.95], r: [0.3, 0.16], big: 1.2 },
    { id: "IL", s: 1, base: [0.55, 3.0, 0.95], r: [0.26, 0.14], big: 1 },
    { id: "IR", s: -1, base: [-0.55, 3.0, 0.95], r: [0.26, 0.14], big: 1 },
    { id: "OL", s: 1, base: [1.0, 2.85, 0.85], r: [0.3, 0.18], big: 1.1 },
    { id: "OR", s: -1, base: [-1.0, 2.85, 0.85], r: [0.3, 0.18], big: 1.1 },
  ] as const;
  const heads: Record<string, number[]> = { C: M.headC, IL: M.headIL, IR: M.headIR, OL: M.headOL, OR: M.headOR };

  for (const n of necks) {
    const chain = [1, 2, 3].map((i) => J["neck" + n.id + i]);
    const head = heads[n.id];
    const a = n.base;
    const j2 = chain[1].at, j3 = chain[2].at;
    const path = catmull([
      [a[0], a[1], a[2]],
      [j2.x, j2.y, j2.z],
      [j3.x, j3.y, j3.z],
      [head[0], head[1] - 0.05, head[2] - 0.1],
    ]);
    const tube = b.sweep(path, (t: number) => n.r[0] + (n.r[1] - n.r[0]) * t, {
      bone: chain,
      color: P.scaleTeal,
      sides: 8,
      sectors: [
        [-50, 50, P.scaleDark],
        [130, 230, P.belly],
      ],
    });

    // nape spikes, double row
    for (const off of [-22, 22]) {
      b.along(tube.line(off), 7, (at: any) => {
        const k = 1 - at.t * 0.6;
        const h = 0.17 * k * n.big;
        const w = 0.05 * k * n.big;
        b.stick(new THREE.CylinderGeometry(w * 1.5, w * 1.7, 0.03, 6), P.boneShade, at, { embed: 0.3 });
        b.stick(new THREE.ConeGeometry(w, h, 5), P.bone, at, { embed: -0.2 });
      });
    }

    // ink seam rings
    for (const t of [0.12, 0.22, 0.32, 0.42]) {
      const p = tube.at(t, 0);
      const r = n.r[0] + (n.r[1] - n.r[0]) * t + 0.012;
      b.sweep(
        b.ring(p, { count: 10, radius: r, fromDeg: 0, toDeg: 324 }).items,
        0.012,
        { color: P.ink, bone: p.bone },
      );
    }

    // glowing throat gullet
    b.along(tube.line(180), 9, (at: any) => {
      const k = 1 - at.t * 0.4;
      const plate = b.stick(new THREE.CylinderGeometry(0.06 * k, 0.07 * k, 0.025, 6), P.glow, at, { embed: 0.25 });
      glow(plate, n.id === "C" ? 1.8 : 1.1);
    }, { from: 0.08, to: 0.95 });

    // scattered scale plates on outer curve
    const side = n.s === 0 ? 1 : n.s;
    for (let i = 0; i < 6; i++) {
      const t = 0.1 + i * 0.14 + R() * 0.05;
      const hit = tube.at(t, side * (75 + R() * 25));
      b.stick(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 6), P.scaleLight, hit, { embed: 0.3 });
    }
  }
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const hipS = (s: number) => [s * 0.95, 1.35, 0.6];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side], knee = J["knee" + side], ankle = J["ankle" + side], foot = J["foot" + side];
    const H = [s * 0.95, 1.35, 0.6], K = [s * 1.18, 0.8, 0.85], A = [s * 1.08, 0.38, 0.6], F = [s * 1.08, 0.12, 0.9];

    // shoulder mass and thigh
    b.part(new THREE.SphereGeometry(0.42, 8, 6), P.scaleDark, { bone: hip, at: [s * 0.88, 1.4, 0.6], scale: [0.9, 1.05, 1.15] });
    b.capsule(H, K, [0.34, 0.25], P.scaleDark, { bone: hip, sides: 8 });
    // belly-toned inner thigh
    b.capsule([s * 0.78, 1.2, 0.65], [s * 0.98, 0.85, 0.85], [0.17, 0.12], P.belly, { bone: hip, sides: 6 });
    // shin and ankle
    b.capsule(K, A, [0.24, 0.16], P.scaleTeal, { bone: knee, sides: 8 });
    b.capsule(A, [s * 1.08, 0.16, 0.8], [0.16, 0.13], P.scaleTeal, { bone: ankle, sides: 8 });
    b.part(new THREE.SphereGeometry(0.27, 8, 6), P.scaleMid, { bone: knee, at: K });

    // foot pad
    b.part(new THREE.BoxGeometry(0.55, 0.16, 0.5), P.scaleMid, { bone: foot, at: [s * 1.08, 0.09, 0.86] });
    b.part(new THREE.BoxGeometry(0.4, 0.05, 0.3), P.boneShade, { bone: foot, at: [s * 1.08, 0.2, 0.7], rotation: [-20, 0, 0] });

    // toes
    const toes = [
      { dx: -0.27, z: 1.1, len: 0.3 },
      { dx: 0, z: 1.17, len: 0.4 },
      { dx: 0.27, z: 1.1, len: 0.3 },
    ];
    for (const t of toes) {
      const bx = s * 1.08 + t.dx * 0.4, tx = s * 1.08 + t.dx * 1.2 * s * s;
      const base = [bx, 0.1, 0.84], tip = [tx, 0.07, t.z];
      b.capsule(base, tip, [0.1, 0.06], P.bone, { bone: foot, sides: 6 });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.boneShade, { bone: foot, at: [(bx + tx) / 2, 0.15, (base[2] + t.z) / 2], scale: [1.2, 0.7, 1] });
      b.spike(tip, [t.dx * 0.5 * s * s, -0.1, 1], 0.16, 0.05, P.ink, { bone: foot });
    }
    // dewclaw
    b.spike([s * 1.08, 0.3, 0.52], [0, -0.3, -1], 0.2, 0.05, P.ink, { bone: ankle });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.bone, { bone: ankle, at: [s * 1.08, 0.3, 0.55] });

    // shin guard with ink bands
    const gd = [0.0, -0.42, -0.25];
    const gc = [s * 1.2, 0.58, 0.86];
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.3), P.boneShade, { bone: knee, at: [gc[0] - s * 0.01, gc[1], gc[2] + 0.01], dir: [0, 1, 0], rotation: [-15, 0, 0] });
    b.part(new THREE.BoxGeometry(0.11, 0.28, 0.24), P.bone, { bone: knee, at: [gc[0] + s * 0.03, gc[1], gc[2] + 0.02], rotation: [-15, 0, 0] });
    for (const dy of [0.2, -0.2]) {
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 8), P.ink, {
        bone: knee,
        at: [s * 1.13 - s * 0.0, 0.58 + dy * 0.9, 0.78 - dy * 0.35],
        dir: [s * 0.1, -0.45, -0.25],
      });
    }

    // knee spike cluster
    const kd = [[s, 0.4, 0.5], [s, 0.0, 0.9], [s, 0.8, 0.0]];
    for (const d of kd) b.spike([K[0] + s * 0.15, K[1] + 0.05, K[2] + 0.05], d, 0.26, 0.06, P.bone, { bone: knee });
    // elbow spikes at the back of the thigh
    for (const [dy, l] of [[0.3, 0.3], [-0.05, 0.22]]) {
      b.spike([s * 1.05, 1.15 + dy * 0.2, 0.35], [s * 0.5, dy, -1], l, 0.07, P.bone, { bone: hip });
    }
    // ridge of knuckle bumps on ankle
    b.spike([s * 1.08, 0.42, 0.52], [s * 0.4, 0.3, -1], 0.14, 0.04, P.bone, { bone: ankle });

    // scale plates on thigh
    const spots = [[0.28, 0.45, 0.5], [0.33, 1.1, 0.78], [0.2, 0.9, 0.35], [0.36, 1.35, 0.4], [0.3, 1.0, 1.0]];
    for (const [ox, y, z] of spots) {
      const p = [s * (0.95 + ox - 0.1 + r() * 0.05), y + 0.05, z];
      p[0] = s * (0.9 + ox);
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6), P.scaleTeal, { bone: hip, at: p, dir: [s, 0.2, 0.1] });
    }
    // shin plates
    for (const [y, z] of [[0.62, 0.78], [0.5, 0.72]]) {
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 6), P.scaleLight, { bone: knee, at: [s * 1.3, y, z - 0.1], dir: [s, 0.1, 0] });
    }
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const bones = [J.tail1, J.tail2, J.tail3, J.tail4];
  const root = M.tailRoot;

  // Centreline: from the tail root sweeping back and down, curling slightly at the tip on the floor
  const path = catmull([
    [root[0], root[1], root[2]],
    [0, 0.72, -1.7],
    [0, 0.56, -2.3],
    [0.02, 0.42, -2.9],
    [0.08, 0.2, -3.25],
    [0.24, 0.065, -3.5],
  ]);

  const keys = [0.5, 0.42, 0.32, 0.2, 0.1, 0.06];
  const R = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };

  const tail = b.sweep(path, keys, {
    bone: bones,
    color: P.scaleDark,
    bands: [
      [0.78, P.scaleDark],
      [1, P.scaleLight],
    ],
    sectors: [
      [50, 125, P.scaleTeal],
      [235, 310, P.scaleTeal],
      [125, 235, P.belly],
    ],
    sides: 10,
    caps: { start: "flat", end: "point" },
  });

  // Bony rings with ink edges
  for (const t of [0.3, 0.55, 0.75]) {
    const w = 0.028;
    b.sweep(path, (u: number) => R(u) + 0.035, {
      from: t - w, to: t + w, bone: bones, color: P.boneShade, sides: 10, caps: "flat",
    });
    for (const d of [-1, 1]) {
      b.sweep(path, (u: number) => R(u) + 0.04, {
        from: t + d * (w + 0.008), to: t + d * (w + 0.016) , bone: bones, color: P.ink, sides: 10, caps: "flat",
      });
    }
  }

  // Alternating dorsal spikes
  for (let i = 0; i < 15; i++) {
    const t = 0.03 + i * 0.058;
    const ang = i % 2 ? 13 : -13;
    const at = tail.at(t, ang);
    const h = 0.34 * (1 - t) + 0.07 + rand() * 0.03;
    const rb = 0.075 * (1 - t) + 0.025;
    b.stick(new THREE.CylinderGeometry(rb * 0.2, rb, h, 5), P.bone, at, { embed: 0.15, flat: true });
    // darker base collar
    b.stick(new THREE.CylinderGeometry(rb * 1.15, rb * 1.4, 0.03, 6), P.boneShade, at, { embed: 0.5, flat: true });
  }

  // Flank scale plates
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.1;
    const ang = i % 2 ? 80 : 280;
    const at = tail.at(t, ang);
    const s = 0.12 * (1 - t * 0.7) + 0.03;
    b.stick(new THREE.CylinderGeometry(s, s * 1.1, 0.04, 6), P.scaleTeal, at, { embed: 0.4, flat: true });
    b.stick(new THREE.CylinderGeometry(s * 0.45, s * 0.5, 0.03, 6), P.scaleLight, at, { embed: -0.5, flat: true });
  }

  // Belly scutes
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.1;
    const at = tail.at(t, 180);
    const s = R(t) * 0.7;
    b.stick(new THREE.BoxGeometry(s * 1.2, 0.02, 0.05), P.ink, at, { embed: 0.3 });
  }

  // Barbed tip: two crossed bone blades
  const end = path.at(1);
  const T = path.tangentAt(1);
  const start: [number, number, number] = [end.x - T.x * 0.02, end.y - T.y * 0.02 + 0.01, end.z - T.z * 0.02];
  const blade = (hw: number): [number, number, "sharp"?][] => [
    [0, -hw * 0.5],
    [0.14, -hw],
    [0.26, -hw * 0.45],
    [0.42, 0, "sharp"],
    [0.26, hw * 0.45],
    [0.14, hw],
    [0, hw * 0.5],
  ] as any;
  const tdir: [number, number, number] = [T.x, T.y, T.z];
  b.extrude(blade(0.1), { at: start, x: tdir, y: [0, 1, 0], thickness: 0.022, bevel: 0.004, color: P.bone, bone: J.tail4 });
  b.extrude(blade(0.1), { at: start, x: tdir, y: [1, 0, 0], thickness: 0.022, bevel: 0.004, color: P.bone, bone: J.tail4 });
  b.extrude(blade(0.058), { at: start, x: tdir, y: [0, 1, 0], thickness: 0.04, color: P.boneShade, bone: J.tail4 });
  b.extrude(blade(0.058), { at: start, x: tdir, y: [1, 0, 0], thickness: 0.04, color: P.boneShade, bone: J.tail4 });
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P }: any) {
  const R = rng(11);
  const stations = [
    { at: [0, 0.55, -1.3], w: 1.5, h: 1.1 },
    { at: [0, 0.7, -0.7], w: 1.7, h: 1.4 },
    { at: [0, 1.2, -0.3], w: 1.6, h: 1.5 },
    { at: [0, 1.9, 0.1], w: 1.4, h: 1.4 },
    { at: [0, 2.5, 0.5], w: 1.25, h: 1.2 },
    { at: [0, 2.95, 0.9], w: 1.2, h: 0.4 },
  ];
  const trunk = b.loft(stations, {
    bone: [J.spine1, J.spine2, J.spine3],
    color: P.scaleMid,
    sectors: [
      [-30, 30, P.scaleDark],
      [60, 115, P.scaleTeal],
      [-115, -60, P.scaleTeal],
      [130, 230, P.belly],
    ],
    detail: 0.8,
  });
  const skin = b.surface(trunk);
  const centre = catmull(stations.map((s) => s.at));

  // coil bands: bone-shade rings with ink seams
  const ringAt = (t: number, col: string, r: number) => {
    const c = centre.at(t);
    const d = centre.tangentAt(t);
    try {
      const loop = skin.loop(c, { dir: d, lift: 0.01 });
      b.sweep(loop, r, { color: col, sides: 5 });
    } catch (e) {}
  };
  for (const t of [0.1, 0.22, 0.34]) {
    ringAt(t, P.boneShade, 0.05);
    ringAt(t + 0.05, P.ink, 0.02);
  }

  // dorsal ridge
  const N = 15;
  for (let i = 0; i < N; i++) {
    const t = 0.04 + (0.8 * i) / (N - 1);
    const c = centre.at(t);
    const hit = skin.ray([0, 5, c.z], [0, -1, 0]);
    if (!hit) continue;
    const k = 1 - 0.5 * (i / N);
    b.stick(new THREE.CylinderGeometry(0.16 * k, 0.2 * k, 0.07, 6), P.boneShade, hit, { embed: 0.4 });
    b.stick(new THREE.ConeGeometry(0.11 * k, 0.5 * k, 6), P.bone, hit.moved([0, 0.05, 0]), { embed: 0.1 });
    if (i % 3 === 1) {
      for (const s of [1, -1]) {
        const h2 = skin.ray([s * 0.3, 5, c.z], [0, -1, 0]);
        if (h2) {
          glow(b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.26 * k + 0.08), P.glow, h2, { embed: 0.3 }), 1.4);
          b.stick(new THREE.BoxGeometry(0.09, 0.02, 0.32 * k + 0.08), P.ink, h2, { embed: 0.6 });
        }
      }
    }
  }

  // belly scutes from below-front
  const M2 = 14;
  for (let i = 0; i < M2; i++) {
    const t = 0.08 + (0.78 * i) / (M2 - 1);
    const c = centre.at(t);
    const o: [number, number, number] = [c.x, c.y - 2.2, c.z + 2.2];
    const dir = [c.x - o[0], c.y - o[1], c.z - o[2]];
    const hit = skin.ray(o, dir);
    if (!hit) continue;
    const w = 1.05 - 0.4 * t;
    b.stick(new THREE.BoxGeometry(w, 0.05, 0.2), P.belly, hit, { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(w + 0.04, 0.03, 0.035), P.ink, hit.moved({ back: 0.12 }), { embed: 0.3 });
  }

  // gorget of overlapping bone plates
  const rows = [2.65, 2.35, 2.05, 1.75];
  rows.forEach((y, ri) => {
    const xs = ri % 2 ? [-0.5, -0.17, 0.17, 0.5] : [-0.6, -0.3, 0, 0.3, 0.6];
    xs.forEach((x) => {
      const hit = skin.ray([x, y, 4], [0, -0.15, -1]);
      if (!hit) return;
      b.stick(new THREE.BoxGeometry(0.4, 0.05, 0.34), P.boneShade, hit, { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.34, 0.06, 0.26), P.bone, hit.moved([0, 0.015, 0]), { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.03, 0.07, 0.3), P.ink, hit.moved({ left: 0.2 }), { embed: 0.3 });
    });
    if (ri < 3) {
      for (const x of [-0.35, 0.35]) {
        const hit = skin.ray([x, y - 0.15, 4], [0, -0.15, -1]);
        if (hit) glow(b.stick(new THREE.BoxGeometry(0.22, 0.04, 0.05), P.glow, hit, { embed: 0.3 }), 1.5);
      }
    }
  });

  // shoulder scale plates
  const hits = skin.scatter(10, { rng: R, minDist: 0.3, filter: (h: any) => h.n.y > 0.2 && h.at.y > 1.8 });
  for (const h of hits) b.stick(new THREE.CylinderGeometry(0.14, 0.15, 0.05, 6), P.scaleTeal, h, { embed: 0.3 });
}
```

<!-- call: heads -->

```ts
import * as THREE from "three";
import { bezier } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeads({ b, J, P }: any) {
  const Y = new THREE.Vector3(0, 1, 0);
  const specs = [
    { n: "C", mount: [0, 4.95, 1.45], dir: [0, 0.35, 1], s: 1.15 },
    { n: "IL", mount: [1.85, 4.7, 1.4], dir: [0.4, 0.35, 1], s: 1 },
    { n: "IR", mount: [-1.85, 4.7, 1.4], dir: [-0.4, 0.35, 1], s: 1 },
    { n: "OL", mount: [2.75, 4.15, 1.2], dir: [0.5, 0.3, 1], s: 1 },
    { n: "OR", mount: [-2.75, 4.15, 1.2], dir: [-0.5, 0.3, 1], s: 1 },
  ];

  for (const sp of specs) {
    const head = J["head" + sp.n];
    const jaw = J["jaw" + sp.n];
    const S = sp.s;
    const central = sp.n === "C";
    const mount = new THREE.Vector3(...(sp.mount as [number, number, number]));
    const F = new THREE.Vector3(...(sp.dir as [number, number, number])).normalize();
    const L = new THREE.Vector3().crossVectors(Y, F).normalize();
    const U = new THREE.Vector3().crossVectors(F, L).normalize();
    const qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(L, U, F));
    const lv = (x: number, y: number, z: number) =>
      new THREE.Vector3().addScaledVector(L, x * S).addScaledVector(U, y * S).addScaledVector(F, z * S);
    const lp = (x: number, y: number, z: number) => lv(x, y, z).add(mount);
    const eq = (rx = 0, ry = 0, rz = 0) =>
      qb.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));
    const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w * S, h * S, d * S);

    // jaw opening
    const A = (central ? 18 : 15) * (Math.PI / 180);
    const hy = -0.12;
    const jp = (x: number, y: number, z: number) => {
      const dy = y - hy;
      return lp(x, hy + dy * Math.cos(A) - z * Math.sin(A), z * Math.cos(A) + dy * Math.sin(A));
    };

    // skull
    b.loft(
      [
        { at: lp(0, 0, -0.15), w: 0.5 * S, h: 0.42 * S },
        { at: lp(0, -0.01, 0.3), w: 0.42 * S, h: 0.34 * S },
        { at: lp(0, -0.04, 0.8), w: 0.22 * S, h: 0.18 * S },
      ],
      { color: P.scaleMid, bone: head },
    );
    // snout top plate
    b.part(box(0.2, 0.03, 0.4), P.scaleDark, { bone: head, at: lp(0, 0.075, 0.5), quat: eq(-0.12) });
    // snout tip
    b.part(box(0.2, 0.12, 0.08), P.boneShade, { bone: head, at: lp(0, -0.05, 0.82) });

    for (const sx of [1, -1]) {
      // cheeks
      b.part(box(0.07, 0.22, 0.32), P.scaleMid, { bone: head, at: lp(sx * 0.23, -0.05, 0.02) });
      b.part(box(0.04, 0.12, 0.2), P.scaleTeal, { bone: head, at: lp(sx * 0.26, -0.02, 0.02) });
      // brow
      b.part(box(0.17, 0.05, 0.3), P.bone, { bone: head, at: lp(sx * 0.17, 0.2, 0.2), quat: eq(-0.1, 0, -sx * 0.25) });
      b.part(box(0.15, 0.03, 0.26), P.boneShade, { bone: head, at: lp(sx * 0.17, 0.165, 0.2), quat: eq(-0.1, 0, -sx * 0.25) });
      // eyes
      b.part(new THREE.SphereGeometry(0.08 * S, 7, 5), P.ink, { bone: head, at: lp(sx * 0.19, 0.08, 0.2) });
      glow(
        b.part(new THREE.SphereGeometry(0.06 * S, 7, 5), P.glow, { bone: head, at: lp(sx * 0.225, 0.085, 0.23) }),
        central ? 2 : 1.5,
      );
      glow(
        b.part(new THREE.SphereGeometry(0.02 * S, 5, 4), P.glowCore, { bone: head, at: lp(sx * 0.255, 0.105, 0.27) }),
        2,
      );
      // nostrils
      b.part(box(0.03, 0.012, 0.06), P.ink, { bone: head, at: lp(sx * 0.05, 0.06, 0.68), quat: eq(-0.1) });
      // horns
      const hp = bezier(lp(sx * 0.18, 0.2, -0.05), lp(sx * 0.3, 0.4, -0.22), lp(sx * 0.36, 0.36, -0.65));
      b.sweep(hp, [0.07 * S, 0.0], {
        color: (t: number) => (t > 0.82 ? P.ink : P.bone),
        bone: head,
        caps: "point",
        sides: 6,
      });
      // frill
      const h0 = lp(sx * 0.22, 0, -0.1);
      const tips = [lp(sx * 0.55, 0.28, -0.45), lp(sx * 0.72, 0.02, -0.52), lp(sx * 0.55, -0.26, -0.42)];
      for (const t of tips) b.spike(h0, t, null, 0.018 * S, { color: P.bone, bone: head });
      b.slab([h0, ...tips], { color: P.membrane, thickness: 0.012, bone: head });
      // teeth upper
      for (let i = 0; i < 4; i++) {
        b.part(new THREE.ConeGeometry(0.022 * S, 0.09 * S, 5), P.tooth, {
          bone: head,
          at: lp(sx * (0.15 - i * 0.012), -0.15, 0.25 + i * 0.16),
          quat: eq(Math.PI),
        });
        // lower teeth
        b.part(new THREE.ConeGeometry(0.02 * S, 0.085 * S, 5), P.tooth, {
          bone: jaw,
          at: jp(sx * (0.13 - i * 0.015), -0.215, 0.2 + i * 0.17),
          quat: eq(A),
        });
      }
    }

    // midline shards
    for (let i = 0; i < 3; i++)
      b.part(new THREE.ConeGeometry(0.05 * S, 0.14 * S, 4), P.bone, {
        bone: head,
        at: lp(0, 0.2 - i * 0.03, 0.0 + i * 0.2),
        quat: eq(-0.45),
      });

    // lower jaw
    b.loft(
      [
        { at: jp(0, -0.25, 0.02), w: 0.38 * S, h: 0.12 * S },
        { at: jp(0, -0.27, 0.4), w: 0.3 * S, h: 0.1 * S },
        { at: jp(0, -0.27, 0.78), w: 0.16 * S, h: 0.09 * S },
      ],
      { color: P.scaleDark, bone: jaw },
    );
    b.part(box(0.2, 0.05, 0.12), P.boneShade, { bone: jaw, at: jp(0, -0.29, 0.8), quat: eq(A) });
    b.part(box(0.26, 0.03, 0.6), P.gum, { bone: jaw, at: jp(0, -0.205, 0.35), quat: eq(A) });
    // throat glow
    glow(b.part(box(0.26, 0.1, 0.06), P.glow, { bone: head, at: lp(0, -0.1, -0.04) }), central ? 2 : 1);
    glow(b.part(box(0.2, 0.025, 0.2), P.glow, { bone: jaw, at: jp(0, -0.19, 0.08), quat: eq(A) }), central ? 1.8 : 1);

    if (central) {
      b.part(box(0.13, 0.025, 0.7), P.tongue, { bone: jaw, at: jp(0, -0.19, 0.62), quat: eq(A + 0.12) });
      b.part(box(0.04, 0.026, 0.55), P.ink, { bone: jaw, at: jp(0, -0.18, 0.62), quat: eq(A + 0.12) });
      const crown: [number, number, number][] = [
        [0, 0.7, -0.5],
        [-0.45, 0.55, -0.5],
        [0.45, 0.55, -0.5],
      ];
      crown.forEach((d, i) => {
        const x = (i - 0) === 0 ? 0 : i === 1 ? -0.1 : 0.1;
        b.spike(lp(x, 0.22, 0.0), lv(d[0], d[1], d[2]), i === 0 ? 0.34 * S : 0.24 * S, 0.045 * S, {
          color: P.bone,
          bone: head,
        });
      });
    }
  }
}
```