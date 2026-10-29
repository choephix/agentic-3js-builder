<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle on a Ledge",
  "description": "A snarling gothic stone gargoyle crouched low on a carved cathedral ledge, folded wings rising behind it, ember eyes glowing.",
  "builderName": "gargoyleLedge",
  "size": [2.7, 1.85, 2.3],
  "layout": "Model space: +Y up, gargoyle faces +Z, ledge slab on the floor. The ledge is a carved stone slab 2.7 x 0.36 x 2.3 m with beveled coping, corbel brackets underneath, and a carved rosette band on its front face. The gargoyle crouches on top of it: heavy haunches at the back (z about -0.4), a hunched ribcage leaning forward, a low snarling head with curled horns and an open jaw at z 0.4-0.8, y up to 1.8; digitigrade arms braced forward on the ledge with clawed knuckles at z about 0.7; digitigrade legs folded under the haunches with clawed feet at z about 0.0; two folded bat-like wings rising up and back from the shoulder blades to y 1.85, spanning x to plus/minus 1.3; a thick tail curling around the right (+X) rear of the ledge with a leaf-shaped spade tip. Gothic carving style everywhere: chiseled facets, deep brow ridges, carved furrow lines on the haunches and chest, small moss patches seated in crevices and on upward stone faces, soot-dark recesses, ember-orange glowing eyes deep in shadowed sockets.",
  "palette": {
    "stoneDark": "#3f424c",
    "stoneMid": "#61646e",
    "stoneLight": "#84878f",
    "stonePale": "#9d9fa6",
    "warmLit": "#93887a",
    "soot": "#2a2b31",
    "moss": "#4d6b3a",
    "mossDark": "#33492a",
    "ink": "#1c1d24",
    "ember": "#ff8c2e",
    "emberCore": "#ffd27a",
    "clawHorn": "#b9b2a0",
    "tongue": "#7a3b4a",
    "teeth": "#d8d2c2"
  },
  "mounts": {
    "ledgeTop": [0, 0.36, 0],
    "hipSeat": [0, 0.66, -0.35],
    "shoulderL": [0.33, 1.08, 0.02],
    "shoulderR": [-0.33, 1.08, 0.02],
    "wingRootL": [0.24, 1.2, -0.3],
    "wingRootR": [-0.24, 1.2, -0.3],
    "tailRoot": [0, 0.55, -0.62]
  },
  "joints": [
    { "name": "core", "at": [0, 0.62, -0.35], "dir": [0, 1, 0], "role": "spine" },
    { "name": "chest", "parent": "core", "at": [0, 0.95, -0.05], "dir": [0, 0.55, 0.85], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.15, 0.25], "dir": [0, 0.6, 0.8], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.32, 0.42], "dir": [0, 0.35, 0.94], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.26, 0.5], "dir": [0, -0.2, 0.98], "role": "jaw" },
    { "name": "shoulderL", "parent": "chest", "at": [0.33, 1.08, 0.02], "dir": [0, -0.55, 0.83], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.42, 0.78, 0.38], "dir": [0, -0.85, 0.5], "role": "arm" },
    { "name": "wristL", "parent": "elbowL", "at": [0.35, 0.44, 0.68], "dir": [0, -0.9, 0.35], "role": "arm" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.33, 1.08, 0.02], "dir": [0, -0.55, 0.83], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.42, 0.78, 0.38], "dir": [0, -0.85, 0.5], "role": "arm" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.35, 0.44, 0.68], "dir": [0, -0.9, 0.35], "role": "arm" },
    { "name": "hipL", "parent": "core", "at": [0.3, 0.66, -0.32], "dir": [0, 0.25, 0.97], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.37, 0.6, 0.02], "dir": [0, -0.6, -0.8], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.35, 0.37, -0.22], "dir": [0, 0, 1], "role": "leg" },
    { "name": "toeL", "parent": "ankleL", "at": [0.35, 0.37, 0.05], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "core", "at": [-0.3, 0.66, -0.32], "dir": [0, 0.25, 0.97], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.37, 0.6, 0.02], "dir": [0, -0.6, -0.8], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.35, 0.37, -0.22], "dir": [0, 0, 1], "role": "leg" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.35, 0.37, 0.05], "dir": [0, 0, 1], "role": "leg" },
    { "name": "wingL", "parent": "chest", "at": [0.24, 1.2, -0.3], "dir": [0.85, 0.55, -0.25], "role": "wing" },
    { "name": "wingElbowL", "parent": "wingL", "at": [0.62, 1.5, -0.5], "dir": [0.6, -0.5, -0.35], "role": "wing" },
    { "name": "wingR", "parent": "chest", "at": [-0.24, 1.2, -0.3], "dir": [-0.85, 0.55, -0.25], "role": "wing" },
    { "name": "wingElbowR", "parent": "wingR", "at": [-0.62, 1.5, -0.5], "dir": [-0.6, -0.5, -0.35], "role": "wing" },
    { "name": "tail1", "parent": "core", "at": [0, 0.55, -0.62], "dir": [0.35, -0.15, -0.92], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0.33, 0.45, -0.9], "dir": [0.9, 0.05, -0.2], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0.58, 0.44, -0.75], "dir": [0.55, 0.1, 0.83], "role": "tail" },
    { "name": "tailTip", "parent": "tail3", "at": [0.75, 0.5, -0.15], "dir": [0.3, 0.3, 0.9], "role": "tail" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The carved stone ledge the gargoyle crouches on. A main slab built as a loft or frustumBox run from [0,0.14,0] spanning x -1.35..1.35, z -1.15..1.15, in stoneMid. On top of it a beveled coping course of chunky blocks (alternating stoneLight and stoneMid segments) around all four sides, its top surface at y 0.36. Under the front lip, three chunky corbel brackets (tapered frustumBoxes in stoneDark) stepping down to y 0.05. The front face carries a carved band: a row of small rosette bosses (low cylinders in stonePale) separated by dark soot-inlaid grooves (thin soot boxes seated 3 mm proud). Corners of the coping are chipped: small angular missing-corner wedges in stoneDark. Moss grows where stone meets sky: thin irregular moss patches (flat extruded blobs, moss and mossDark) on the top surface near the back edge and seeping over the coping's front rim; a green streak runs down one front corner. The gargoyle's feet and knuckles rest on the coping top at y 0.36, so leave the top clear of tall debris. All stone reads chiseled: box and ngon-section shapes, flat facets, no smooth spheres.",
      "box": [[-1.35, 0, -1.15], [1.35, 0.36, 1.15]],
      "attaches": "floor: true; everything else rests on mount ledgeTop (y 0.36).",
      "joints": [],
      "floor": true,
      "budget": 160
    },
    {
      "id": "torso",
      "builds": "The gargoyle's core: spine, ribcage, neck, head, face, horns and jaw. Build the torso as a loft over the spine chain (core at [0,0.62,-0.35], chest at [0,0.95,-0.05]): a heavy hunched chest, elliptical sections about 0.55 wide and 0.45 tall at the chest narrowing to 0.3 at the hips, in stoneMid with a countershaded paint - warmLit on up-facing surfaces, stoneDark below and in the hollows. Carved furrow lines: thin soot strips seated along the chest's front and around the shoulders. Two small pebbled pectoral slabs in stoneLight sit on the chest front. The neck is a short thick swept tube from chest to head in stoneMid with a ring of carved fold ridges (thin torus-like swept rings in stoneDark) at its base. The head is a blocky chiseled skull: a stoneLight brow mass with deep overhanging brow ledge (a protruding frustumBox in stoneLight casting the eye sockets into soot), two deep eye sockets holding small glowing ember spheres (ember, glowing via the glow kit, strength 1.6) each with a tiny emberCore glint sphere in front. The muzzle projects forward: a squared snout frustum in stoneLight with flared nostril recesses (small soot wedges), and a wide open mouth built as separate upper and lower jaws: the upper jaw (riding head) carries a row of blocky teeth (teeth, small triangular extrudes) and the lower jaw rides the jaw joint, hinged open about 30 degrees showing a tongue (tongue) and lower teeth, so the mouth can open. Long fangs at the upper jaw corners in teeth. The jaw's underside and throat are stoneDark. Two curled ram-like horns sprout from the head's upper sides: swept tubes (sprout) in clawHorn ridged with thin darker rings, spiraling back and out to about 0.22 m radius. Small carved ear fins behind the horns in stoneDark. The whole head reads as a cathedral spout: the mouth's floor extends forward into a small square spout lip in stoneDark.",
      "box": [[-0.55, 0.36, -0.7], [0.55, 1.8, 0.85]],
      "attaches": "Rises from mount hipSeat over the core and chest joints; shoulders at mounts shoulderL and shoulderR are the limb part's roots; neck and head continue from chest; wings bolt to the back at mounts wingRootL and wingRootR; the tail starts at mount tailRoot.",
      "joints": ["core", "chest", "neck", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "limbs",
      "builds": "Arms, legs, hands and feet, all digitigrade and crouched. Arms: from mounts shoulderL and shoulderR (riding shoulderL/R) build thick upper-arm tubes (sweep, stoneMid) forward-down to elbows at [0.42,0.78,0.38] and [-0.42,0.78,0.38], then forearms slightly slimmer (stoneLight tops, stoneMid sides) down to knuckles planted on the ledge at about [0.35,0.40,0.68] and mirrored. Each arm carries carved boulder-like muscle bosses: 2-3 overlapping low spheres or frustum slabs in stoneLight on the upper arm and shoulder, and a soot furrow groove at the elbow crease. Hands are clenched fist-knuckles: a blocky hand mass (frustumBox, stoneLight) with three big forward claw talons per hand (curved swept cones in clawHorn, tips touching the ledge top) plus a small rear dewclaw. Legs: from hipL/hipR build the folded digitigrade crouch - thigh tube forward-up to kneeL/kneeR at [0.37,0.6,0.02] (knee carried high and forward, a big blocky knee cap slab in stoneLight), shin down and back to ankleL/ankleR at [0.35,0.37,-0.22], then the foot segment forward to toeL/toeR at [0.35,0.37,0.05]; feet are broad three-toed claw feet (blocky toe masses in stoneLight) whose talons (clawHorn curved cones) grip over the ledge coping's front edge at y 0.36. Haunches: two large teardrop muscle masses (big flattened spheres or loft blobs in stoneMid with stoneLight tops) flanking the tail root at about x plus/minus 0.33, z -0.45, with carved concentric furrow grooves (thin soot strips) - the classic gargoyle thigh read. Moss flecks (tiny flat moss patches) sit in the ankle creases and on top of the knee caps.",
      "box": [[-0.62, 0.36, -0.65], [0.62, 1.2, 1.0]],
      "attaches": "Arm chains root at mounts shoulderL and shoulderR on the chest; leg chains root at mount hipSeat on the core; every claw tip and foot sole rests exactly on the ledge top (mount ledgeTop, y 0.36).",
      "joints": ["core", "shoulderL", "elbowL", "wristL", "shoulderR", "elbowR", "wristR", "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "The folded wings rising behind the shoulders. Each wing roots at mounts wingRootL and wingRootR (riding wingL/wingR): a short muscular upper-arm tube (stoneMid) up and out to wingElbowL/wingElbowR at about [0.62,1.5,-0.5], then a slim forearm folding back down-inward, ending in a small clawed thumb knob (clawHorn spike) at about [0.95,1.1,-0.35]. From the wrist, three bony finger spars fan out folded and back: swept tapering tubes (clawHorn joint knobs, stoneDark membrane surfaces) running down and back toward the haunches, the longest reaching about z -0.85, x plus/minus 1.25. Between the spars, the wing membrane is built with b.membrane between adjacent finger paths (and between the leading-edge arm and the first finger), in soot-dark stone: color stoneDark with countershade paint lifting stoneMid on up-facing panels; membrane thickness about 0.015 with a slight scallop at the trailing edge. Along the leading edge of each wing add two rows of small carved ridge studs (stonePale low cylinders) and a darker trim seam (thin swept soot line). At the membrane roots near the spine, moss patches creep onto the webbing's upper face. Two short back spikes (clawHorn cones) ride the spine between the wing roots, and a small ornamental carved finial disc (stonePale lathe rosette) caps each elbow joint. Wings read as carved stone sheets: angular, thick-edged, faceted.",
      "box": [[-1.35, 0.7, -0.9], [1.35, 1.85, 0.1]],
      "attaches": "Wing roots bolt to the torso's back at mounts wingRootL and wingRootR, riding joints wingL, wingElbowL, wingR, wingElbowR; the folded membranes fall behind the arms and over the haunches without touching the ledge top.",
      "joints": ["chest", "wingL", "wingElbowL", "wingR", "wingElbowR"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "tail",
      "builds": "The tail curling around the right (+X) rear corner of the ledge. Build a chain over tail1..tail3..tailTip and sweep it: thick at the root (radius about 0.09 at tail1) tapering to 0.03, sections as 6- or 8-sided ngon for the chiseled stone look, color stoneMid with countershade (warmLit on top, stoneDark beneath). Ridges: thin swept soot rings at each joint, and a dorsal row of small triangular carved spikes (stoneDark frustum spikes) along the top of the first two thirds. The last third is plain, ending in a leaf-shaped stone spade tip: a flat extruded diamond blade in stoneLight (about 0.16 long, 0.1 wide, thickness 0.02) with a carved center groove (thin soot strip seated in it), angled upward at about 30 degrees like a scorpion's barb. The tail path: from tailRoot [0,0.55,-0.62] back and down to [0.33,0.45,-0.9], out along the ledge's back-right to [0.58,0.44,-0.75] then curling forward to tailTip [0.75,0.5,-0.15], the whole tail resting on the ledge top (its lowest points at y 0.36, sinking no more than 2 cm into the coping). Moss flecks on the tail's upper surface near the root and one moss tuft where the tail meets the haunch.",
      "box": [[0.0, 0.36, -1.15], [0.95, 0.62, -0.1]],
      "attaches": "Roots at mount tailRoot on the core joint; rides joints tail1, tail2, tail3, tailTip; the tail's underside lies on the ledge top at y 0.36 within the ledge's back-right quadrant.",
      "joints": ["core", "tail1", "tail2", "tail3", "tailTip"],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  // Tail path resting on the ledge (y 0.36). Radius max 0.09 so centre height >= 0.45 at thick end.
  const pts: number[][] = [
    [0, 0.55, -0.62],
    [0.17, 0.5, -0.78],
    [0.33, 0.46, -0.9],
    [0.48, 0.45, -0.86],
    [0.58, 0.44, -0.75],
    [0.67, 0.45, -0.45],
    [0.75, 0.43, -0.25],
  ];
  const path = catmull(pts);
  const tail = b.chain("tailC", path, { parent: J.core, count: 6, names: ["tail1", "tail2", "tail3", "tailTip", "tailX1", "tailX2"].slice(0, 0) as any });
  void tail;
}
```

Wait — the joints already exist, so I must not create a duplicate chain. Here is the corrected version, which sweeps over the existing joints.

```ts
import * as THREE from "three";
import { catmull, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const pts: number[][] = [
    [0, 0.55, -0.62],
    [0.17, 0.5, -0.78],
    [0.33, 0.46, -0.9],
    [0.48, 0.45, -0.86],
    [0.58, 0.44, -0.75],
    [0.67, 0.45, -0.45],
    [0.75, 0.43, -0.22],
  ];
  const path = catmull(pts);
  const bones = [J.core, J.tail1, J.tail2, J.tail3, J.tailTip];
  const radius = (t: number) => 0.09 - 0.06 * t;

  const body = b.sweep(path, radius, {
    bone: bones,
    section: { ngon: 8 },
    color: P.stoneMid,
    sectors: [
      [-60, 60, P.warmLit],
      [125, 235, P.stoneDark],
    ],
    caps: { start: "flat", end: "round" },
  });

  // soot rings at joints
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const at = body.at(t);
    b.ring(at, { count: 8, radius: radius(t) * 1.0 }, () => {});
    const p = path.at(t);
    const tg = path.tangentAt(t);
    const ringPath = b.ring(frame(p, tg), { count: 10, radius: radius(t) * 1.02 }).items;
    b.sweep(catmull(ringPath.map((i) => i.at), { closed: true }), 0.007, {
      color: P.soot,
      bone: at.bone ?? J.tail1,
      sides: 4,
    });
  }

  // dorsal spikes along first two thirds
  const spikeT = 9;
  for (let i = 0; i < spikeT; i++) {
    const t = 0.05 + (i / (spikeT - 1)) * 0.62;
    const at = body.at(t, 0);
    const r = radius(t);
    b.spike(at, at, 0.05 + 0.04 * (1 - t), r * 0.4, { color: P.stoneDark, sides: 4 } as any);
  }

  // moss flecks near root and haunch
  for (let i = 0; i < 5; i++) {
    const t = 0.06 + R() * 0.3;
    const at = body.at(t, (R() - 0.5) * 50);
    b.stick(new THREE.CylinderGeometry(0.025 + R() * 0.015, 0.03, 0.01, 5), i % 2 ? P.mossDark : P.moss, at, { embed: 0.3 });
  }
  // moss tuft at haunch
  const tuftAt = body.at(0.12, 20);
  for (let k = 0; k < 4; k++) {
    b.stick(new THREE.ConeGeometry(0.012, 0.045, 4), k % 2 ? P.moss : P.mossDark, tuftAt, {
      embed: 0.2,
      spin: k * 90,
    });
  }

  // spade tip: flat diamond blade angled up ~30deg
  const end = body.at(1);
  const tip = new THREE.Vector3(...pts[pts.length - 1]);
  const dir = new THREE.Vector3(0.25, Math.sin(Math.PI / 6), 0.9).normalize();
  const base = tip.clone().addScaledVector(dir, 0.02);
  const blade = b.extrude(
    [
      [0, 0, "sharp"],
      [0.05, 0.05],
      [0.16, 0, "sharp"],
      [0.05, -0.05],
    ],
    {
      at: base,
      x: dir.toArray() as number[],
      y: [0, 0, 1].map((v, i) => v) as number[] && [-dir.z, 0, dir.x],
      thickness: 0.02,
      color: P.stoneLight,
      bone: J.tailTip,
    },
  );
  // center groove
  b.part(new THREE.BoxGeometry(0.12, 0.006, 0.006), P.soot, {
    at: blade.local([0.08, 0, 0.011]),
    quat: blade.mesh.quaternion,
    bone: J.tailTip,
  });
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });

  // main slab: y 0.14 .. 0.28
  box(2.7, 0.16, 2.3, P.stoneMid, 0, 0.2, 0);
  // lower plinth stepping in
  box(2.5, 0.1, 2.1, P.stoneDark, 0, 0.09, 0);

  // coping course (y 0.28..0.36) with alternating blocks around perimeter
  const copeH = 0.08, cy = 0.32;
  const seg = (n: number, len: number, fn: (i: number, off: number) => void) => {
    const w = len / n;
    for (let i = 0; i < n; i++) fn(i, -len / 2 + w * (i + 0.5));
  };
  const nx = 9, nz = 7;
  seg(nx, 2.7, (i, x) => {
    const w = 2.7 / nx - 0.01;
    for (const s of [1, -1]) {
      const c = (i + (s > 0 ? 0 : 1)) % 2 ? P.stoneLight : P.stoneMid;
      box(w, copeH, 0.3, c, x, cy, s * 1.0 + (s > 0 ? 0.0 : 0));
      // bevel chamfer strip on outer edge
      b.part(new THREE.CylinderGeometry(0.04, 0.04, w, 4), c, {
        at: [x, cy + 0.035, s * 1.14], dir: [1, 0, 0], rotation: [0, 0, 0],
      });
    }
  });
  seg(nz, 2.0, (i, z) => {
    const d = 2.0 / nz - 0.01;
    for (const s of [1, -1]) {
      const c = (i + (s > 0 ? 1 : 0)) % 2 ? P.stoneLight : P.stoneMid;
      box(0.3, copeH, d, c, s * 1.2, cy, z);
    }
  });
  // coping inner fill so top is solid at 0.36
  box(2.0, 0.02, 1.7, P.stoneMid, 0, 0.35, 0);

  // corner chips
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.TetrahedronGeometry(0.07), P.stoneDark, {
        at: [sx * 1.33, 0.35, sz * 1.13], rotation: [20, sx * 30, 10],
      });
    }

  // corbels under front lip
  for (const x of [-0.85, 0, 0.85]) {
    b.frustumBox([x, 0.14, 1.0], [x, 0.05, 1.0], [0.34, 0.5], [0.2, 0.3], { color: P.stoneDark });
    box(0.4, 0.04, 0.56, P.stoneLight, x, 0.12, 1.0);
  }

  // carved band on front face (z=1.15)
  box(2.5, 0.07, 0.01, P.soot, 0, 0.215, 1.153);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x = -1.05 + (2.1 / (n - 1)) * i;
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), P.stonePale, {
      at: [x, 0.215, 1.155], dir: [0, 0, 1], axis: "y",
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 6), P.stoneDark, {
      at: [x, 0.215, 1.168], dir: [0, 0, 1], axis: "y",
    });
    if (i < n - 1) box(0.012, 0.08, 0.008, P.soot, x + 1.05 / (n - 1), 0.215, 1.158);
  }
  // side bands
  for (const s of [1, -1]) box(0.01, 0.05, 1.9, P.soot, s * 1.353, 0.2, 0);

  // moss patches
  const blob = (cx: number, cz: number, r: number, c: string, y: number) => {
    const pts: [number, number][] = [];
    const k = 7;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      const rr = r * (0.65 + R() * 0.5);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    b.extrude(pts, { at: [cx, y, cz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: c, bone: undefined });
  };
  const mp = [[-0.9, -0.95, 0.14], [-0.4, -0.98, 0.1], [0.3, -0.92, 0.16], [0.95, -1.0, 0.11], [-1.2, -0.6, 0.09], [1.18, 0.5, 0.08], [-1.15, 0.8, 0.1]];
  mp.forEach(([x, z, r], i) => blob(x, z, r, i % 2 ? P.mossDark : P.moss, 0.366));
  // seep over front rim
  for (const x of [-0.6, 0.45, 1.0]) {
    box(0.16, 0.012, 0.12, P.moss, x, 0.368, 1.12);
    box(0.14, 0.1, 0.012, P.moss, x, 0.31, 1.157);
    box(0.06, 0.07, 0.01, P.mossDark, x + 0.02, 0.24, 1.158);
  }
  // green streak down front corner
  box(0.05, 0.3, 0.012, P.moss, -1.28, 0.2, 1.158);
  box(0.03, 0.2, 0.012, P.mossDark, -1.29, 0.12, 1.158);
  box(0.012, 0.1, 0.1, P.moss, -1.353, 0.3, 1.05);
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng, lerp } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const rand = rng(77);
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = s > 0 ? J.wingL : J.wingR;
    const elbowJ = s > 0 ? J.wingElbowL : J.wingElbowR;

    const R0 = V(M.wingRootL[0] * s, M.wingRootL[1], M.wingRootL[2]);
    const E = V(0.62 * s, 1.5, -0.5);
    const W = V(1.0 * s, 1.3, -0.5);
    const thumbTip = V(0.95 * s, 1.1, -0.35);

    // ---- arm bones ----
    b.capsule(R0, E, [0.075, 0.055], P.stoneMid, { bone: shoulder, sides: 8 });
    b.capsule(E, W, [0.05, 0.032], P.stoneLight, { bone: elbowJ, sides: 6 });
    // wrist knob
    b.part(new THREE.IcosahedronGeometry(0.055, 0), P.clawHorn, { bone: elbowJ, at: W, flat: true });
    // thumb claw
    b.spike(W, thumbTip, null, 0.028, { color: P.clawHorn, bone: elbowJ, sides: 6 });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.clawHorn, { bone: elbowJ, at: thumbTip });

    // elbow finial rosette (lathe)
    b.lathe(
      [[0, 0], [0.085, 0], [0.085, 0.018], [0.05, 0.035], [0.025, 0.05], [0, 0.055]],
      { at: V(E[0] + 0.02 * s, E[1] + 0.02, E[2]), axis: [s, 0.35, 0], segments: 8, color: P.stonePale, bone: elbowJ },
    );
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.soot, {
      bone: elbowJ, at: V(E[0] + 0.1 * s, E[1] + 0.055, E[2]), dir: [s, 0.35, 0],
    });

    // ---- finger spars ----
    const tips = [V(1.25 * s, 0.95, -0.85), V(0.97 * s, 0.85, -0.9), V(0.62 * s, 0.9, -0.8)];
    const fingers = tips.map((tip, i) => {
      const m = lerp(W, tip, 0.5);
      const mid = V(m.x + 0.03 * s, m.y + 0.05, m.z + 0.0);
      const ch = b.chain(
        `wingsF${i}${side}`,
        [W, [mid.x, mid.y, mid.z], tip],
        { parent: elbowJ, names: [`wingsF${i}${side}a`, `wingsF${i}${side}b`], role: "digit" },
      );
      b.sweep(ch, [0.04 - i * 0.004, 0.012], { color: P.clawHorn, section: { ngon: 6 }, caps: "point" });
      b.part(new THREE.IcosahedronGeometry(0.03, 0), P.stonePale, { bone: ch.joints[1], at: [mid.x, mid.y, mid.z], flat: true });
      return ch;
    });

    // ---- membranes ----
    const body = [V(0.2 * s, 1.05, -0.4), V(0.22 * s, 0.95, -0.6), V(0.3 * s, 0.82, -0.78)];
    const panels = [
      b.membrane([R0, E, W], [V(0.24 * s, 1.0, -0.38), V(0.75 * s, 1.1, -0.65), tips[0]], {
        color: P.stoneDark, thickness: 0.015, scallop: 0.05, bone: elbowJ,
      }),
      b.membrane(fingers[0], fingers[1], { color: P.soot, thickness: 0.015, scallop: 0.12 }),
      b.membrane(fingers[1], fingers[2], { color: P.stoneDark, thickness: 0.015, scallop: 0.12 }),
      b.membrane(fingers[2], body, { color: P.soot, thickness: 0.015, scallop: 0.1, bone: shoulder }),
    ];

    // ---- leading edge studs and seam ----
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      const p = lerp(E, W, t);
      b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.025, 6), P.stonePale, {
        bone: elbowJ, at: V(p.x, p.y + 0.045 - t * 0.01, p.z),
      });
      b.part(new THREE.CylinderGeometry(0.014, 0.018, 0.02, 6), P.stonePale, {
        bone: elbowJ, at: V(p.x, p.y - 0.01, p.z + 0.045),
        dir: [0, 0, 1],
      });
    }
    for (let i = 0; i < 3; i++) {
      const p = lerp(R0, E, (i + 0.5) / 3);
      b.part(new THREE.CylinderGeometry(0.016, 0.02, 0.025, 6), P.stonePale, {
        bone: shoulder, at: V(p.x, p.y + 0.075, p.z),
      });
    }
    b.rod(V(R0[0], R0[1] + 0.03, R0[2] - 0.075), V(E[0], E[1] + 0.03, E[2] - 0.055), 0.008, P.soot, { bone: shoulder });
    b.rod(V(E[0], E[1] + 0.02, E[2] - 0.05), V(W[0], W[1] + 0.02, W[2] - 0.035), 0.008, P.soot, { bone: elbowJ });

    // ---- moss near membrane roots ----
    const skin = b.surface(panels);
    const spots: [number, number][] = [[0.3, -0.5], [0.42, -0.58], [0.25, -0.65], [0.5, -0.62]];
    for (const [x, z] of spots) {
      const hit = skin.ray([x * s, 2, z + (rand() - 0.5) * 0.04], [0, -1, 0]);
      if (hit && hit.at.y > 0.8) {
        const r = 0.04 + rand() * 0.04;
        b.stick(new THREE.CylinderGeometry(r, r * 1.2, 0.012, 6), rand() > 0.5 ? P.moss : P.mossDark, hit, { embed: 0.3 });
      }
    }
  }

  // ---- back spikes ----
  b.spike(V(0, 1.22, -0.28), [0, 1, -0.35], 0.16, 0.035, { color: P.clawHorn, bone: J.chest, sides: 6 });
  b.spike(V(0, 1.14, -0.45), [0, 1, -0.5], 0.13, 0.03, { color: P.clawHorn, bone: J.chest, sides: 6 });
}
```

<!-- call: limbs -->

```ts
import * as THREE from "three";
import { bezier, catmull } from "agentic-3js-builder";

export function buildLimbs({ b, J, P, M }: Ctx) {
  const TOP = M.ledgeTop[1];
  const sph = (n = 8, m = 6) => new THREE.SphereGeometry(1, n, m);

  const claw = (bone: any, base: number[], ctrl: number[], tip: number[], r: number) =>
    b.sweep(bezier(base, ctrl, tip), [r, 0.004], {
      bone,
      color: P.clawHorn,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = J["shoulder" + L];
    const el = J["elbow" + L];
    const wr = J["wrist" + L];
    const hip = J["hip" + L];
    const kn = J["knee" + L];
    const an = J["ankle" + L];
    const toe = J["toe" + L];
    const X = (x: number) => s * x;

    // ---------- ARM ----------
    const shP = [X(0.33), 1.08, 0.02];
    const elP = [X(0.42), 0.78, 0.38];
    const wrP = [X(0.35), 0.5, 0.64];
    b.capsule(shP, elP, [0.12, 0.095], { bone: sh, color: P.stoneMid, sides: 8 });
    b.capsule(elP, wrP, [0.085, 0.07], { bone: el, color: P.stoneMid, sides: 8 });
    // forearm top plate (lighter)
    b.capsule([X(0.42), 0.84, 0.4], [X(0.36), 0.56, 0.62], 0.05, { bone: el, color: P.stoneLight, sides: 6 });
    // shoulder and upper-arm muscle bosses
    b.part(sph(), P.stoneLight, { bone: sh, at: [X(0.4), 1.07, 0.05], scale: [0.11, 0.13, 0.14] });
    b.part(sph(), P.stoneLight, { bone: sh, at: [X(0.46), 0.92, 0.2], scale: [0.08, 0.1, 0.11] });
    b.part(sph(), P.stoneLight, { bone: sh, at: [X(0.37), 0.97, 0.17], scale: [0.07, 0.09, 0.1] });
    b.part(sph(), P.stoneLight, { bone: el, at: [X(0.45), 0.7, 0.42], scale: [0.06, 0.08, 0.08] });
    // elbow crease furrow
    b.part(new THREE.TorusGeometry(0.1, 0.008, 4, 10), P.soot, {
      bone: el,
      at: [X(0.425), 0.8, 0.36],
      dir: [X(0.1), -0.85, 0.5],
      axis: "z",
    });
    b.part(new THREE.TorusGeometry(0.095, 0.007, 4, 10), P.soot, {
      bone: el,
      at: [X(0.425), 0.74, 0.4],
      dir: [X(0.1), -0.85, 0.5],
      axis: "z",
    });
    // hand: fist mass
    b.part(new THREE.BoxGeometry(0.17, 0.13, 0.2), P.stoneLight, { bone: wr, at: [X(0.35), TOP + 0.065, 0.72] });
    b.part(new THREE.BoxGeometry(0.15, 0.05, 0.12), P.stoneMid, { bone: wr, at: [X(0.35), TOP + 0.145, 0.68] });
    // knuckle ridges
    for (const dx of [-0.055, 0, 0.055])
      b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), P.stonePale, {
        bone: wr,
        at: [X(0.35 + dx), TOP + 0.12, 0.82],
        rotation: [0, 45, 0],
      });
    // claws
    for (const dx of [-0.055, 0, 0.055]) {
      const x = X(0.35 + dx);
      claw(wr, [x, TOP + 0.07, 0.8], [x, TOP + 0.13, 0.92], [x, TOP + 0.01, 1.0], 0.03);
    }
    b.spike([X(0.35), TOP + 0.06, 0.62], [0, -0.3, -1], 0.08, 0.02, { bone: wr, color: P.clawHorn, sides: 6 });
    // moss on forearm top
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.008, 6), P.moss, {
      bone: el,
      at: [X(0.4), 0.82, 0.37],
      scale: [1, 1, 1.4],
    });

    // ---------- LEG ----------
    const hipP = [X(0.3), 0.66, -0.32];
    const knP = [X(0.37), 0.6, 0.02];
    const anP = [X(0.35), 0.45, -0.22];
    b.capsule(hipP, knP, [0.13, 0.085], { bone: hip, color: P.stoneMid, sides: 8 });
    b.capsule(knP, anP, [0.075, 0.055], { bone: kn, color: P.stoneMid, sides: 8 });
    // knee cap
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.13), P.stoneLight, {
      bone: kn,
      at: [X(0.39), 0.66, 0.06],
      rotation: [-20, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.09), P.stonePale, {
      bone: kn,
      at: [X(0.39), 0.715, 0.065],
      rotation: [-20, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.008, 6), P.moss, {
      bone: kn,
      at: [X(0.39), 0.735, 0.07],
      scale: [1, 1, 1.3],
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.008, 5), P.mossDark, { bone: kn, at: [X(0.42), 0.73, 0.04] });
    // heel & foot
    b.part(new THREE.BoxGeometry(0.13, 0.1, 0.14), P.stoneMid, { bone: an, at: [X(0.35), TOP + 0.05, -0.2] });
    b.part(new THREE.BoxGeometry(0.15, 0.07, 0.18), P.stoneLight, { bone: toe, at: [X(0.35), TOP + 0.035, 0.0] });
    b.spike([X(0.35), TOP + 0.08, -0.26], [0, 0.4, -1], 0.07, 0.025, { bone: an, color: P.clawHorn, sides: 6 });
    // ankle moss crease
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.008, 6), P.moss, {
      bone: an,
      at: [X(0.35), TOP + 0.102, -0.18],
      scale: [1.2, 1, 1],
    });
    // toes + talons
    for (const dx of [-0.055, 0, 0.055]) {
      const x = X(0.35 + dx);
      b.part(new THREE.BoxGeometry(0.05, 0.06, 0.12), P.stoneLight, { bone: toe, at: [x, TOP + 0.03, 0.14] });
      claw(toe, [x, TOP + 0.035, 0.19], [x, TOP + 0.09, 0.27], [x, TOP + 0.01, 0.35], 0.024);
    }

    // ---------- HAUNCH ----------
    const c = [X(0.33), 0.7, -0.42];
    const ab = [0.17, 0.22, 0.23];
    b.part(sph(10, 8), P.stoneMid, { bone: hip, at: c, scale: ab });
    b.part(sph(8, 6), P.stoneLight, { bone: hip, at: [c[0], c[1] + 0.12, c[2] + 0.01], scale: [0.12, 0.1, 0.17] });
    // concentric furrows on outer face
    for (const k of [0.45, 0.7, 0.92]) {
      const pts: number[][] = [];
      for (let a = -130; a <= 130; a += 26) {
        const r = (a * Math.PI) / 180;
        const dy = Math.sin(r) * ab[1] * k;
        const dz = Math.cos(r) * ab[2] * k * 0.0 + Math.cos(r) * ab[2] * k * 0.0 + Math.cos(r) * ab[2] * k;
        const q = 1 - (dy / ab[1]) ** 2 - (dz / ab[2]) ** 2;
        if (q <= 0.02) continue;
        pts.push([c[0] + s * (ab[0] * Math.sqrt(q) + 0.004), c[1] + dy, c[2] + dz]);
      }
      if (pts.length > 2) b.sweep(catmull(pts), 0.006, { bone: hip, color: P.soot, sides: 4 });
    }
    b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.008, 6), P.moss, {
      bone: hip,
      at: [c[0], c[1] + 0.215, c[2] + 0.03],
      scale: [1, 1, 1.3],
    });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, catmull, spiral, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P }: any) {
  const SIDES = [1, -1];
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- torso body (elliptical sweep standing in for the loft) ----------
  const spine = catmull([
    [0, 0.58, -0.55],
    [0, 0.68, -0.4],
    [0, 0.95, -0.1],
    [0, 1.12, 0.12],
  ]);
  const body = b.sweep(spine, (t: number) => [0.15 + 0.125 * Math.min(1, t * 1.4), 0.15 + 0.075 * Math.min(1, t * 1.4)], {
    bone: [J.core, J.chest],
    color: P.stoneMid,
    sectors: [
      [-65, 65, P.warmLit],
      [125, 235, P.stoneDark],
    ],
    sides: 10,
  });
  const skin = b.surface(body);
  const front = (x: number, y: number) => skin.ray([x, y, 1.6], [0, 0, -1]);

  // carved furrow lines across chest
  for (const y of [0.88, 0.97, 1.06]) {
    const pts: any[] = [];
    for (let i = -3; i <= 3; i++) {
      const h = front(i * 0.07, y - Math.abs(i) * 0.012);
      if (h) pts.push(offset(h, h, 0.006));
    }
    if (pts.length > 3) b.sweep(catmull(pts), 0.007, { color: P.soot, bone: J.chest, caps: "flat" });
  }
  {
    const pts: any[] = [];
    for (let y = 0.82; y <= 1.08; y += 0.06) {
      const h = front(0, y);
      if (h) pts.push(offset(h, h, 0.006));
    }
    if (pts.length > 2) b.sweep(catmull(pts), 0.008, { color: P.soot, bone: J.chest, caps: "flat" });
  }
  // shoulder furrow arcs
  for (const s of SIDES) {
    const pts: any[] = [];
    for (const [x, y] of [
      [s * 0.2, 1.13],
      [s * 0.26, 1.07],
      [s * 0.3, 0.98],
      [s * 0.28, 0.9],
    ]) {
      const h = front(x, y);
      if (h) pts.push(offset(h, h, 0.006));
    }
    if (pts.length > 2) b.sweep(catmull(pts), 0.007, { color: P.soot, bone: J.chest, caps: "flat" });
  }
  // pectoral slabs + pebbles
  const pecR = [0.4, 0.55, 0.7];
  for (const s of SIDES) {
    const h = front(s * 0.15, 1.0);
    if (h) {
      b.stick(box(0.2, 0.05, 0.14), P.stoneLight, h, { embed: 0.4, bone: J.chest });
      pecR.forEach((k, i) => {
        const p = front(s * (0.1 + i * 0.05), 0.96 + (i % 2) * 0.05);
        if (p) b.stick(box(0.03, 0.02, 0.03), P.stonePale, p, { embed: 0.2, bone: J.chest });
      });
    }
  }
  // dorsal ridge spikes
  b.along(body, 5, (at: any) => b.spike(at, at, 0.08, 0.03, { color: P.stoneLight }), { from: 0.1, to: 0.8 });
  // moss on the back
  const mossSpots: [number, number][] = [
    [0.1, -0.5],
    [-0.12, -0.35],
    [0.05, -0.2],
    [-0.1, -0.05],
  ];
  mossSpots.forEach(([x, z], i) => {
    const h = skin.ray([x, 3, z], [0, -1, 0]);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.05, 0.06, 0.014, 6), i % 2 ? P.mossDark : P.moss, h, { embed: 0.3, bone: J.core });
      b.stick(new THREE.CylinderGeometry(0.025, 0.03, 0.018, 5), i % 2 ? P.moss : P.mossDark, h.moved([0.04, 0, 0.02]), { embed: 0.3, bone: J.core });
    }
  });

  // ---------- neck ----------
  const nPath = catmull([
    [0, 1.02, 0.08],
    [0, 1.15, 0.25],
    [0, 1.3, 0.42],
  ]);
  b.sweep(nPath, [0.17, 0.15], {
    bone: [J.chest, J.neck],
    color: P.stoneMid,
    section: { ngon: 8 },
    sectors: [[-60, 60, P.warmLit]],
  });
  for (const t of [0.12, 0.28, 0.44]) {
    const ring = b.ring(frame(nPath.at(t), nPath.tangentAt(t)), { count: 10, radius: 0.185 - t * 0.04 }).items;
    b.sweep(catmull(ring, { closed: true }), 0.014, { color: P.stoneDark, bone: J.neck, caps: "none", sides: 5 });
  }

  // ---------- head ----------
  const hb = { bone: J.head };
  const skull = b.frustumBox([0, 1.39, 0.36], [0, 1.4, 0.66], [0.46, 0.36], [0.4, 0.32], { color: P.stoneMid, ...hb });
  // brow mass + ledge
  b.frustumBox([0, 1.53, 0.46], [0, 1.53, 0.74], [0.48, 0.09], [0.5, 0.08], { color: P.stoneLight, ...hb });
  b.frustumBox([0, 1.58, 0.4], [0, 1.58, 0.62], [0.36, 0.08], [0.3, 0.06], { color: P.stoneLight, ...hb });
  for (const s of SIDES) {
    b.rod([s * 0.04, 1.56, 0.7], [s * 0.23, 1.5, 0.56], 0.035, P.stoneLight, { ...hb, sides: 5 });
    // eye socket
    b.part(box(0.13, 0.1, 0.06), P.soot, { at: [s * 0.12, 1.45, 0.665], ...hb });
    const eye = b.part(new THREE.SphereGeometry(0.03, 6, 5), P.ember, { at: [s * 0.12, 1.45, 0.668], ...hb });
    glow(eye, 1.6);
    glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.emberCore, { at: [s * 0.115, 1.455, 0.69], ...hb }), 1.6);
    // cheek ridge
    b.rod([s * 0.2, 1.37, 0.42], [s * 0.19, 1.3, 0.62], 0.025, P.stoneDark, { ...hb, sides: 5 });
    // ear fin
    b.extrude(
      [
        [0, 0],
        [0.12, 0.04],
        [0.14, 0.14],
        [0.02, 0.1],
      ],
      { at: [s * 0.2, 1.46, 0.36], x: [s, 0, 0], thickness: 0.02, color: P.stoneDark, ...hb },
    );
    // nostril
    b.part(box(0.04, 0.03, 0.03), P.soot, { at: [s * 0.075, 1.34, 0.9], rotation: [0, 0, s * 20], ...hb });
  }
  // muzzle & nose bridge
  b.frustumBox([0, 1.3, 0.62], [0, 1.3, 0.9], [0.32, 0.2], [0.27, 0.16], { color: P.stoneLight, ...hb });
  b.rod([0, 1.41, 0.5], [0, 1.39, 0.9], 0.02, P.stonePale, { ...hb, sides: 4 });
  // moss on skull
  for (const [x, z] of [
    [0.08, 0.45],
    [-0.1, 0.52],
  ]) {
    const h = b.surface(skull).ray([x, 3, z], [0, -1, 0]);
    if (h) b.stick(new THREE.CylinderGeometry(0.04, 0.05, 0.012, 6), P.moss, h, { embed: 0.3, ...hb });
  }
  // upper teeth
  const tri = (w: number, h: number): any => [
    [-w / 2, 0],
    [w / 2, 0],
    [0, -h, "sharp"],
  ];
  for (let i = 0; i < 6; i++) {
    const z = 0.64 + i * 0.045;
    for (const s of SIDES)
      b.extrude(tri(0.03, 0.04), { at: [s * (0.15 - i * 0.003), 1.205, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, color: P.teeth, ...hb });
  }
  for (let i = -2; i <= 2; i++)
    b.extrude(tri(0.03, 0.045), { at: [i * 0.045, 1.225, 0.9], x: [1, 0, 0], thickness: 0.014, color: P.teeth, ...hb });
  for (const s of SIDES)
    b.extrude(tri(0.05, 0.12), { at: [s * 0.14, 1.205, 0.6], x: [1, 0, 0], thickness: 0.02, color: P.teeth, ...hb });

  // ---------- horns ----------
  for (const s of SIDES) {
    const hit = b.surface(skull).around([0, 1.4, 0.5]).at(s * 80, 40);
    if (!hit) continue;
    const coil = spiral(offset(hit, [0, -1, -0.3], 0.09), hit, [s, 0, 0], { turns: -s * 1.0, r1: 0.04, pitch: 0.08 });
    const horn = b.sprout(`torsoHorn${s > 0 ? "L" : "R"}`, hit, coil, [0.05, 0.012], {
      count: 0,
      bone: J.head,
      color: P.clawHorn,
      caps: { end: "point" },
      sides: 6,
    });
    b.along(horn.sweep, 4, (at: any) => {
      b.part(new THREE.TorusGeometry(Math.max(0.012, at.radius * 1.05), 0.006, 4, 7), P.stoneDark, {
        at: at.at,
        dir: at.tangent,
        axis: "z",
        bone: J.head,
      });
    }, { from: 0.25, to: 0.85 });
  }

  // ---------- lower jaw (rides jaw joint) ----------
  const jb = { bone: J.jaw };
  b.frustumBox([0, 1.17, 0.44], [0, 1.14, 0.52], [0.44, 0.07], [0.4, 0.07], { color: P.stoneDark, ...jb });
  b.frustumBox([0, 1.14, 0.5], [0, 1.14, 0.88], [0.38, 0.07], [0.27, 0.07], { color: P.stoneMid, ...jb });
  b.frustumBox([0, 1.1, 0.52], [0, 1.1, 0.86], [0.3, 0.03], [0.22, 0.03], { color: P.stoneDark, ...jb });
  // spout lip
  b.frustumBox([0, 1.1, 0.86], [0, 1.1, 1.0], [0.18, 0.05], [0.18, 0.05], { color: P.stoneDark, ...jb });
  // tongue
  b.frustumBox([0, 1.178, 0.55], [0, 1.178, 0.82], [0.16, 0.02], [0.1, 0.02], { color: P.tongue, ...jb });
  for (let i = 0; i < 5; i++)
    for (const s of SIDES)
      b.extrude(tri(0.026, -0.04).map((p: any) => [p[0], -p[1], p[2]]) as any, {
        at: [s * (0.14 - i * 0.004), 1.175, 0.62 + i * 0.05],
        x: [0, 0, 1],
        thickness: 0.012,
        color: P.teeth,
        ...jb,
      });
  for (const s of SIDES)
    b.extrude([[-0.02, 0], [0.02, 0], [0, 0.08, "sharp"]], { at: [s * 0.09, 1.175, 0.88], x: [1, 0, 0], thickness: 0.016, color: P.teeth, ...jb });
  // throat soot
  b.part(box(0.2, 0.05, 0.1), P.soot, { at: [0, 1.17, 0.5], ...jb });

  // open the mouth about 30 degrees
  b.pose(J.jaw, { axis: [1, 0, 0], deg: 30 });
}
```