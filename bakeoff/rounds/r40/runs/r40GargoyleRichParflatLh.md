<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A hunched gothic stone gargoyle crouched on a weathered cathedral ledge, with bat wings folded up, horned head, fanged open jaw and a curled tail.",
  "builderName": "cathedralGargoyle",
  "size": [1.5, 1.3, 1.5],
  "layout": "A ledge slab (x -0.75..0.75, z -0.7..0.75, y 0..0.2) carries the crouched gargoyle facing +Z. Haunches and hind legs sit at the back (z about -0.25), the torso slopes forward and up to heavy shoulders (y about 0.8, z about 0.15). The arms reach down and forward, with clawed hands gripping the ledge front (z about 0.5). The head is big and jutting, up at y about 1.0 and z about 0.5, with a brow ridge, flat snout, upper and lower jaw with fangs, two curled horns and pointed ears. Bat wings rise from the shoulders and are held half-folded, swept back and up to y 1.3, with bony fingers and a membrane between them. The tail curls from the rump around the left side of the ledge. Every surface is a flat stone colour. Moss sits on upward faces, soot-dark streaks under the ledge, and chipped lighter edges are small parts. Chunky faceted low-poly shapes with sharp chiselled planes. Eyes are small glowing amber parts under a heavy brow.",
  "palette": {
    "stoneMid": "#8a8d8f",
    "stoneLight": "#a9aaa6",
    "stoneDark": "#5a5d62",
    "stoneSoot": "#3a3c40",
    "ledge": "#7b7e80",
    "ledgeTrim": "#9a9c98",
    "moss": "#5f7a3a",
    "mossDark": "#43592a",
    "horn": "#c4bfae",
    "fang": "#e6e0cf",
    "eyeGlow": "#ffb23a",
    "membrane": "#6a6e74",
    "wingBone": "#7c7f82",
    "crack": "#2b2d31"
  },
  "mounts": {
    "ledgeTop": [0, 0.2, 0],
    "pelvis": [0, 0.5, -0.25],
    "chest": [0, 0.72, 0.1],
    "neckBase": [0, 0.85, 0.28],
    "headCenter": [0, 1.0, 0.5],
    "jawHinge": [0, 0.92, 0.42],
    "shoulderL": [0.3, 0.8, 0.1],
    "shoulderR": [-0.3, 0.8, 0.1],
    "wristL": [0.32, 0.3, 0.5],
    "wristR": [-0.32, 0.3, 0.5],
    "hipL": [0.3, 0.45, -0.3],
    "hipR": [-0.3, 0.45, -0.3],
    "footL": [0.3, 0.2, -0.05],
    "footR": [-0.3, 0.2, -0.05],
    "tailRoot": [0, 0.4, -0.45],
    "wingRootL": [0.22, 0.95, 0.0],
    "wingRootR": [-0.22, 0.95, 0.0]
  },
  "joints": [
    { "name": "pelvis", "at": [0, 0.5, -0.25], "dir": [0, 0.5, 1], "role": "spine" },
    { "name": "chest", "parent": "pelvis", "at": [0, 0.72, 0.1], "dir": [0, 0.5, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.85, 0.28], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.97, 0.42], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.92, 0.42], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "shoulderL", "parent": "chest", "at": [0.3, 0.8, 0.1], "dir": [0.2, -1, 0.5], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.36, 0.55, 0.3], "dir": [0, -0.5, 1], "role": "arm" },
    { "name": "handL", "parent": "elbowL", "at": [0.32, 0.3, 0.5], "dir": [0, 0, 1], "role": "arm" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.3, 0.8, 0.1], "dir": [-0.2, -1, 0.5], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.36, 0.55, 0.3], "dir": [0, -0.5, 1], "role": "arm" },
    { "name": "handR", "parent": "elbowR", "at": [-0.32, 0.3, 0.5], "dir": [0, 0, 1], "role": "arm" },
    { "name": "hipL", "parent": "pelvis", "at": [0.3, 0.45, -0.3], "dir": [0, -0.5, 1], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.36, 0.42, 0.0], "dir": [0, -1, -0.3], "role": "leg" },
    { "name": "footL", "parent": "kneeL", "at": [0.3, 0.2, -0.05], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "pelvis", "at": [-0.3, 0.45, -0.3], "dir": [0, -0.5, 1], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.36, 0.42, 0.0], "dir": [0, -1, -0.3], "role": "leg" },
    { "name": "footR", "parent": "kneeR", "at": [-0.3, 0.2, -0.05], "dir": [0, 0, 1], "role": "leg" },
    { "name": "tail1", "parent": "pelvis", "at": [0, 0.4, -0.45], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.3, -0.7], "dir": [0.5, 0, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0.2, 0.26, -0.9], "dir": [1, 0, -0.2], "role": "tail" },
    { "name": "wingL1", "parent": "chest", "at": [0.22, 0.95, 0.0], "dir": [0.7, 0.8, -0.5], "role": "wing" },
    { "name": "wingL2", "parent": "wingL1", "at": [0.5, 1.2, -0.15], "dir": [0.6, 0.3, -0.8], "role": "wing" },
    { "name": "wingR1", "parent": "chest", "at": [-0.22, 0.95, 0.0], "dir": [-0.7, 0.8, -0.5], "role": "wing" },
    { "name": "wingR2", "parent": "wingR1", "at": [-0.5, 1.2, -0.15], "dir": [-0.6, 0.3, -0.8], "role": "wing" }
  ],
  "parts": [
    {
      "id": "ledgeAndStaging",
      "builds": "The cathedral ledge: a chunky slab with a chamfered front lip, corbel blocks underneath, a moulded trim strip and a pointed-arch relief carving on the front face. Includes cracks, chipped corner blocks, moss patches on the top, and soot streaks. Colours: ledge, ledgeTrim, moss, mossDark, stoneSoot, crack. Kept simple relative to the gargoyle.",
      "box": [[-0.75, 0, -0.7], [0.75, 0.2, 0.75]],
      "attaches": "Top face at ledgeTop. The feet of the gargoyle (footL, footR, handL and handR claws) rest on it.",
      "joints": [],
      "floor": true,
      "budget": 120
    },
    {
      "id": "torsoAndLegs",
      "builds": "Hunched torso as a loft on the pelvis and chest joints, with a ribbed chest, spine ridge of stone spikes, a heavy belly and a pelvis block. Both haunches with thighs, shins and big three-clawed feet gripping the ledge. Surface details: chisel facets, a carved chest emblem, cracks and moss on the back. Colours: stoneMid on top, stoneDark underneath, stoneLight edges, moss, stoneSoot, fang for claws.",
      "box": [[-0.5, 0.2, -0.5], [0.5, 0.95, 0.35]],
      "attaches": "Torso front at neckBase and chest, with shoulders at shoulderL and shoulderR. Hips at hipL and hipR. Rump at tailRoot. Wings root at wingRootL and wingRootR.",
      "joints": ["pelvis", "chest", "hipL", "kneeL", "footL", "hipR", "kneeR", "footR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "headAndNeck",
      "builds": "Big characterful head: a thick short neck, a skull block with a heavy brow ridge, glowing amber eyes, a flat wide snout with nostrils, a separate upper jaw with fangs and a lower jaw hinged at the jaw joint with an open mouth, a tongue, and chin tusks. Two curled horns, two pointed bat ears, cheek ridges, a stone beard of wedge blades. Colours: stoneMid, stoneLight, stoneDark, horn, fang, eyeGlow, crack, mossDark.",
      "box": [[-0.3, 0.8, 0.2], [0.3, 1.3, 0.75]],
      "attaches": "Neck base at neckBase on the chest. Jaw hinges at jawHinge. The head is centred at headCenter. Nothing sits in front of the face.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "arms",
      "builds": "Both muscular arms from shoulder balls through elbows to big hands, as chunky tubes with knuckle blocks and three long clawed fingers plus a thumb each, spread and gripping the ledge front. Shoulder pads with spikes and a stone cuff band. Colours: stoneMid, stoneLight, stoneDark, fang for claws, moss on the tops, stoneSoot.",
      "box": [[-0.5, 0.2, 0.0], [0.5, 0.9, 0.65]],
      "attaches": "Shoulders at shoulderL and shoulderR on the torso. Hands rest on the ledge at wristL and wristR.",
      "joints": ["shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wingsAndTail",
      "builds": "Two bat wings, mirrored, rooted at wingRootL and wingRootR: a thick arm bone, then a wrist with a thumb claw and three long finger bones fanned, with scalloped membranes between them in membrane colour, with stone-crack lines and rivet-like studs along the bones. Plus the tail: a tapering swept tube from tailRoot curling round the left of the ledge, ending in a spade-shaped tip with a spike ridge. Colours: wingBone, membrane, stoneDark, stoneLight, stoneMid, moss on the upper bone edges.",
      "box": [[-0.75, 0.3, -0.7], [0.75, 1.3, 0.0]],
      "attaches": "Wing roots at wingRootL and wingRootR on the shoulders. Tail begins at tailRoot at the rump.",
      "joints": ["wingL1", "wingL2", "wingR1", "wingR2", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(41);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const mixp = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
  const up = (p: THREE.Vector3, d: number) => p.clone().add(V(0, d, 0));
  const ico = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const dodeca = (r: number) => new THREE.DodecahedronGeometry(r, 0);

  // Points on a circle around an axis, angle 0 = most upward direction.
  const ringPts = (center: THREE.Vector3, axis: THREE.Vector3, radius: number, count: number) => {
    const a = axis.clone().normalize();
    let r1 = V(0, 1, 0).addScaledVector(a, -a.y);
    if (r1.lengthSq() < 1e-4) r1 = V(0, 0, 1);
    r1.normalize();
    const r2 = a.clone().cross(r1).normalize();
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2;
      out.push(center.clone().addScaledVector(r1, Math.cos(th) * radius).addScaledVector(r2, Math.sin(th) * radius));
    }
    return out;
  };

  for (const s of [1, -1]) {
    const n = s === 1 ? "L" : "R";
    const shJ = J[`shoulder${n}`];
    const elJ = J[`elbow${n}`];
    const haJ = J[`hand${n}`];
    const sh = shJ.at.clone();
    const el = elJ.at.clone();
    const wr = haJ.at.clone();
    const upperDir = el.clone().sub(sh).normalize();
    const foreDir = wr.clone().sub(el).normalize();

    // ---------- shoulder ball and pad ----------
    b.part(ico(0.115, 1), P.stoneMid, { at: sh, bone: shJ, flat: true });
    const padC = sh.clone().add(V(s * 0.055, 0.075, -0.015));
    b.part(dodeca(0.13), P.stoneLight, {
      at: padC,
      bone: shJ,
      scale: [1.15, 0.5, 1.0],
      rotation: [0, 0, -s * 22],
    });
    // chiselled dark underside lip of the pad
    b.part(dodeca(0.115), P.stoneDark, {
      at: padC.clone().add(V(s * 0.012, -0.03, 0)),
      bone: shJ,
      scale: [1.15, 0.35, 1.0],
      rotation: [0, 0, -s * 22],
    });
    // spikes on the pad
    const spikeSpec: [number, number, number, number][] = [
      [0.07, 0.04, -0.06, 0.12],
      [0.0, 0.055, 0.0, 0.15],
      [-0.06, 0.03, 0.06, 0.1],
    ];
    for (const [dx, dy, dz, len] of spikeSpec) {
      const base = padC.clone().add(V(s * dx, dy + 0.02, dz));
      b.spike(base, V(s * 0.45, 1, -0.35), len, 0.032, { color: P.stoneLight, bone: shJ, sides: 5 });
      b.part(ico(0.026, 0), P.stoneDark, { at: base.clone().add(V(0, -0.005, 0)), bone: shJ, flat: true });
    }
    // moss and crack on pad
    b.part(dodeca(0.05), P.moss, {
      at: padC.clone().add(V(s * 0.03, 0.04, 0.04)),
      bone: shJ,
      scale: [1, 0.3, 0.9],
    });
    b.part(dodeca(0.03), P.mossDark, {
      at: padC.clone().add(V(s * 0.08, 0.03, 0.0)),
      bone: shJ,
      scale: [1, 0.3, 1],
    });
    b.part(new THREE.BoxGeometry(0.008, 0.006, 0.09), P.crack, {
      at: padC.clone().add(V(s * 0.0, 0.066, 0.01)),
      bone: shJ,
      rotation: [0, s * 25, -s * 22],
    });

    // ---------- upper arm ----------
    b.capsule(sh, el, [0.095, 0.072], { color: P.stoneMid, bone: shJ, sides: 7, smooth: false });
    // biceps bulge
    b.part(ico(0.085, 1), P.stoneMid, {
      at: up(mixp(sh, el, 0.38), 0.025),
      bone: shJ,
      dir: upperDir,
      scale: [1, 1.5, 1],
      flat: true,
    });
    // outer muscle ridge (light chiselled edge)
    b.rod(
      up(mixp(sh, el, 0.15), 0.1).add(V(s * 0.02, 0, 0)),
      up(mixp(sh, el, 0.88), 0.075).add(V(s * 0.02, 0, 0)),
      [0.014, 0.01],
      { color: P.stoneLight, bone: shJ, sides: 4 },
    );
    // moss on top of upper arm
    for (const [t, sz] of [
      [0.5, 0.04],
      [0.72, 0.03],
    ] as [number, number][]) {
      b.part(dodeca(sz), R() > 0.5 ? P.moss : P.mossDark, {
        at: up(mixp(sh, el, t), 0.082).add(V(s * -0.01, 0, 0)),
        bone: shJ,
        scale: [1, 0.3, 1.2],
      });
    }
    // soot streak under upper arm
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.07), P.stoneSoot, {
      at: up(mixp(sh, el, 0.55), -0.082),
      bone: shJ,
      dir: upperDir,
      rotation: [0, 0, 0],
    });

    // ---------- elbow ----------
    b.part(ico(0.078, 1), P.stoneMid, { at: el, bone: elJ, flat: true });
    b.spike(el.clone().add(V(0, 0.01, -0.05)), V(s * 0.3, 0.25, -1), 0.11, 0.036, {
      color: P.stoneLight,
      bone: elJ,
      sides: 5,
    });
    b.part(ico(0.036, 0), P.stoneDark, { at: el.clone().add(V(s * 0.02, 0.02, -0.06)), bone: elJ, flat: true });

    // ---------- forearm ----------
    b.capsule(el, wr, [0.082, 0.052], { color: P.stoneMid, bone: elJ, sides: 7, smooth: false });
    b.part(ico(0.075, 1), P.stoneMid, {
      at: up(mixp(el, wr, 0.28), 0.02),
      bone: elJ,
      dir: foreDir,
      scale: [1, 1.5, 1],
      flat: true,
    });
    b.rod(up(mixp(el, wr, 0.15), 0.083), up(mixp(el, wr, 0.7), 0.058), [0.012, 0.008], {
      color: P.stoneLight,
      bone: elJ,
      sides: 4,
    });
    b.part(dodeca(0.035), P.moss, {
      at: up(mixp(el, wr, 0.4), 0.072),
      bone: elJ,
      scale: [1, 0.3, 1.3],
    });
    b.part(dodeca(0.022), P.mossDark, {
      at: up(mixp(el, wr, 0.55), 0.064).add(V(s * 0.015, 0, 0)),
      bone: elJ,
      scale: [1, 0.3, 1.2],
    });
    // soot under forearm
    for (const t of [0.35, 0.6]) {
      b.part(new THREE.BoxGeometry(0.028, 0.006, 0.06), P.stoneSoot, {
        at: up(mixp(el, wr, t), -0.068 + t * 0.02),
        bone: elJ,
        dir: foreDir,
      });
    }

    // cuff band: a main band between two thin dark rings, studded
    const cuffC = mixp(el, wr, 0.76);
    b.part(new THREE.CylinderGeometry(0.075, 0.07, 0.05, 8), P.stoneLight, {
      at: cuffC,
      bone: elJ,
      dir: foreDir,
      flat: true,
    });
    for (const off of [-0.032, 0.032]) {
      b.part(new THREE.CylinderGeometry(0.079, 0.079, 0.012, 8), P.stoneDark, {
        at: cuffC.clone().addScaledVector(foreDir, off),
        bone: elJ,
        dir: foreDir,
        flat: true,
      });
    }
    for (const p of ringPts(cuffC, foreDir, 0.073, 6)) {
      b.part(ico(0.013, 0), P.stoneDark, { at: p, bone: elJ, flat: true });
    }

    // ---------- hand ----------
    b.part(ico(0.056, 1), P.stoneMid, { at: wr, bone: haJ, flat: true });
    const palmC = V(wr.x, 0.262, wr.z + 0.01);
    b.part(new THREE.BoxGeometry(0.15, 0.075, 0.125), P.stoneMid, { at: palmC, bone: haJ });
    b.part(new THREE.BoxGeometry(0.14, 0.012, 0.11), P.stoneLight, {
      at: palmC.clone().add(V(0, 0.04, 0.0)),
      bone: haJ,
    });
    b.part(dodeca(0.03), P.moss, {
      at: palmC.clone().add(V(-s * 0.03, 0.05, -0.02)),
      bone: haJ,
      scale: [1, 0.3, 1.1],
    });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.01), P.stoneSoot, {
      at: palmC.clone().add(V(0, -0.015, -0.064)),
      bone: haJ,
    });
    // knuckle plate
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.03), P.stoneLight, {
      at: V(wr.x, 0.28, wr.z + 0.075),
      bone: haJ,
      rotation: [-10, 0, 0],
    });

    // three long clawed fingers
    for (let i = 0; i < 3; i++) {
      const k = i - 1;
      const L = i === 1 ? 1.12 : 1;
      const K = V(wr.x + k * 0.048, 0.282, wr.z + 0.075);
      const Mid = V(wr.x + k * 0.062, 0.272, wr.z + 0.075 + 0.06 * L);
      const Tip = V(wr.x + k * 0.07, 0.213, wr.z + 0.075 + 0.1 * L);
      const Claw = V(wr.x + k * 0.074, 0.187, wr.z + 0.075 + 0.125 * L);
      const j1 = b.joint(`armsDigit${i + 1}${n}a`, { parent: haJ, at: K, aim: Mid, role: "digit" });
      const j2 = b.joint(`armsDigit${i + 1}${n}b`, { parent: j1, at: Mid, aim: Tip, role: "digit" });
      b.capsule(K, Mid, [0.027, 0.023], { color: P.stoneMid, bone: j1, sides: 5, smooth: false });
      b.capsule(Mid, Tip, [0.023, 0.019], { color: P.stoneMid, bone: j2, sides: 5, smooth: false });
      b.part(ico(0.026, 0), P.stoneLight, { at: Mid, bone: j1, flat: true });
      b.spike(Tip, Claw, null, 0.018, { color: P.fang, bone: j2, sides: 5 });
      // knuckle block + stud spike
      b.part(new THREE.BoxGeometry(0.04, 0.034, 0.035), P.stoneLight, {
        at: K.clone().add(V(0, 0.015, 0)),
        bone: haJ,
        rotation: [0, k * 8, 0],
      });
      b.spike(K.clone().add(V(0, 0.03, 0)), V(0, 1, 0.3), 0.04, 0.014, { color: P.stoneDark, bone: haJ, sides: 4 });
    }

    // thumb on the inner side
    const T0 = V(wr.x - s * 0.06, 0.268, wr.z + 0.01);
    const T1 = V(wr.x - s * 0.1, 0.25, wr.z + 0.075);
    const T2 = V(wr.x - s * 0.115, 0.215, wr.z + 0.115);
    const TC = V(wr.x - s * 0.12, 0.19, wr.z + 0.14);
    const t1 = b.joint(`armsThumb${n}a`, { parent: haJ, at: T0, aim: T1, role: "digit" });
    const t2 = b.joint(`armsThumb${n}b`, { parent: t1, at: T1, aim: T2, role: "digit" });
    b.capsule(T0, T1, [0.032, 0.025], { color: P.stoneMid, bone: t1, sides: 5, smooth: false });
    b.capsule(T1, T2, [0.025, 0.02], { color: P.stoneMid, bone: t2, sides: 5, smooth: false });
    b.part(ico(0.027, 0), P.stoneLight, { at: T1, bone: t1, flat: true });
    b.spike(T2, TC, null, 0.018, { color: P.fang, bone: t2, sides: 5 });
  }
}
```

<!-- call: torsoAndLegs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTorsoAndLegs(ctx: any) {
  const { b, J, P } = ctx as { b: any; J: any; P: any; M: any };
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rand = rng(21);

  // ---------- helpers ----------
  // faceted tube with a dark underside
  const tube = (a: any, c: any, r: any, color: string, bone: any, under = P.stoneDark) =>
    b.sweep([a, c], r, {
      bone,
      color,
      sides: 8,
      smooth: false,
      sectors: [[125, 235, under]],
    });
  const ball = (at: any, r: number, color: string, bone: any, scale: any = [1, 1, 1], seg: [number, number] = [8, 6]) =>
    b.part(new THREE.SphereGeometry(r, seg[0], seg[1]), color, { bone, at, scale, flat: true });
  const chip = (hit: any, color: string, size = 0.03, sc: any = [1, 0.45, 1.2]) =>
    b.stick(new THREE.OctahedronGeometry(size, 0), color, hit, {
      embed: 0.4,
      scale: sc,
      spin: rand() * 360,
      flat: true,
    });
  const mossPatch = (hit: any, big = 0.045) => {
    b.stick(new THREE.IcosahedronGeometry(big, 0), P.moss, hit, {
      embed: 0.5,
      scale: [1, 0.35, 1.3],
      spin: rand() * 360,
      flat: true,
    });
    b.stick(new THREE.IcosahedronGeometry(big * 0.55, 0), P.mossDark, hit.moved([big * 0.6, 0, big * 0.3]), {
      embed: 0.5,
      scale: [1, 0.4, 1],
      spin: rand() * 360,
      flat: true,
    });
  };

  // ---------- torso loft ----------
  const torso = b.loft(
    [
      { at: [0, 0.46, -0.31], w: 0.4, h: 0.32 },
      { at: [0, 0.5, -0.2], w: 0.62, h: 0.46 },
      { at: [0, 0.56, -0.02], w: 0.6, h: 0.5 },
      { at: [0, 0.69, 0.12], w: 0.64, h: 0.44 },
      { at: [0, 0.82, 0.25], w: 0.42, h: 0.34 },
    ],
    {
      bone: [J.pelvis, J.chest],
      color: P.stoneMid,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "flat" },
      sectors: [[120, 240, P.stoneDark]],
    },
  );
  const skin = b.surface(torso);

  // heavy belly
  ball([0, 0.41, -0.04], 1, P.stoneDark, J.pelvis, [0.25, 0.15, 0.27], [10, 6]);
  // belly seam / lower plate
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.3), P.stoneSoot, {
    bone: J.pelvis,
    at: [0, 0.272, -0.04],
    flat: true,
  });

  // ---------- pelvis block ----------
  b.part(new THREE.BoxGeometry(0.5, 0.15, 0.24), P.stoneDark, {
    bone: J.pelvis,
    at: [0, 0.5, -0.33],
    rotation: [-12, 0, 0],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.52, 0.03, 0.26), P.stoneLight, {
    bone: J.pelvis,
    at: [0, 0.585, -0.32],
    rotation: [-12, 0, 0],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.1, 0.1, "sharp"],
        [0, 0.07],
      ],
      {
        at: [s * 0.18, 0.56, -0.38],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        color: P.stoneLight,
        bone: J.pelvis,
      },
    );
    for (const dx of [0.08, 0.16, 0.23]) {
      ball([s * dx, 0.54, -0.455], 0.013, P.stoneLight, J.pelvis, [1, 1, 1], [6, 4]);
    }
  }
  // tail socket collar
  b.part(new THREE.CylinderGeometry(0.12, 0.135, 0.05, 8), P.stoneLight, {
    bone: J.pelvis,
    at: [0, 0.4, -0.435],
    dir: [0, 0, 1],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.015, 8), P.stoneSoot, {
    bone: J.pelvis,
    at: [0, 0.4, -0.466],
    dir: [0, 0, 1],
    flat: true,
  });

  // ---------- spine ridge ----------
  let idx = 0;
  b.along(torso, 9, (at: any) => {
    const k = idx++;
    const len = 0.05 + 0.06 * Math.sin(((k + 0.6) / 9.6) * Math.PI);
    const base = at.moved([0, -0.015, 0]);
    b.stick(new THREE.CylinderGeometry(0.03, 0.04, 0.035, 6), P.stoneLight, base, { embed: 0.2, flat: true });
    b.spike(base.moved([0, 0.012, 0]), base.moved([0, 0.012, 0]), len, 0.027, { color: P.stoneLight });
  });

  // ---------- ribbed chest ----------
  try {
    for (let k = 0; k < 4; k++) {
      const t = 0.08 + k * 0.25;
      const pt: [number, number, number] = [0, 0.56 + 0.13 * t, -0.02 + 0.14 * t];
      const loop = skin.loop(pt, { dir: [0, 0.5, 1], lift: 0.006 });
      b.sweep(loop.slice(0.27, 0.73), 0.014 - k * 0.001, { color: k % 2 ? P.stoneMid : P.stoneLight, sides: 5 });
    }
  } catch (e) {
    /* ribs are decoration only */
  }

  // ---------- chest emblem ----------
  const eh = skin.ray([0, 0.6, 1], [0, 0, -1]);
  if (eh) {
    const n = eh.n.clone().normalize();
    const xd = v(1, 0, 0);
    const yd = n.clone().cross(xd).normalize();
    const at = (d: number) => eh.at.clone().addScaledVector(n, d);
    const X = [1, 0, 0];
    const Y = [yd.x, yd.y, yd.z];
    const shield = [
      [-0.065, 0.075],
      [0, 0.09, "sharp"],
      [0.065, 0.075],
      [0.065, -0.02],
      [0, -0.09, "sharp"],
      [-0.065, -0.02],
    ];
    b.extrude(shield as any, { at: at(0.002), x: X, y: Y, thickness: 0.012, color: P.stoneSoot, bone: J.chest, bevel: 0.002 });
    b.extrude(shield.map((p: any) => [p[0] * 0.82, p[1] * 0.82 - (p[1] < 0 ? 0 : 0), p[2]]) as any, {
      at: at(0.007),
      x: X,
      y: Y,
      thickness: 0.01,
      color: P.stoneLight,
      bone: J.chest,
    });
    b.extrude(
      [
        [-0.027, -0.045],
        [0.027, -0.045],
        [0.027, 0.012],
        [0, 0.058, "sharp"],
        [-0.027, 0.012],
      ] as any,
      { at: at(0.011), x: X, y: Y, thickness: 0.008, color: P.stoneDark, bone: J.chest },
    );
    b.extrude(
      [
        [0, -0.03, "sharp"],
        [0.012, -0.005],
        [0, 0.03, "sharp"],
        [-0.012, -0.005],
      ] as any,
      { at: at(0.015), x: X, y: Y, thickness: 0.006, color: P.stoneLight, bone: J.chest },
    );
  }

  // ---------- shoulder humps & back plates ----------
  const cc = v(0, 0.68, 0.0);
  for (const s of [1, -1]) {
    const h = skin.around(cc).at(s * 62, 38);
    if (h) {
      b.stick(new THREE.OctahedronGeometry(0.1, 0), P.stoneMid, h, { embed: 0.45, scale: [1, 0.55, 1.4], flat: true });
    }
    const h2 = skin.around(v(0, 0.5, -0.2)).at(s * 70, 25);
    if (h2) chip(h2, P.stoneLight, 0.06, [1, 0.5, 1.4]);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const hipJ = J["hip" + S];
    const kneeJ = J["knee" + S];
    const footJ = J["foot" + S];
    const hip = hipJ.at.clone();
    const knee = kneeJ.at.clone();
    const foot = footJ.at.clone();
    const ankle = v(foot.x + s * 0.01, 0.285, foot.z - 0.065);

    // haunch muscle
    const haunch = ball([hip.x + s * 0.04, 0.46, -0.2], 1, P.stoneMid, hipJ, [0.13, 0.17, 0.2], [10, 7]);
    const hs = b.surface(haunch);
    const top = hs.around(haunch.at).at(s * 15, 70);
    if (top) mossPatch(top, 0.04);
    for (const [az, el] of [
      [s * 80, 20],
      [s * 100, -10],
    ] as [number, number][]) {
      const h = hs.around(haunch.at).at(az, el);
      if (h) chip(h, P.stoneLight, 0.035);
    }

    ball([hip.x + s * 0.02, hip.y, hip.z], 0.1, P.stoneLight, hipJ, [1, 1, 1], [7, 5]);

    // thigh
    const thigh = tube(hip, knee, [0.115, 0.08], P.stoneMid, hipJ);
    for (const a of [-100, -60, 60, 100]) {
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), P.stoneLight, thigh.at(0.72, a), { embed: 0.4, flat: true });
    }
    mossPatch(thigh.at(0.5, 0), 0.035);

    // knee + spike
    ball(knee, 0.09, P.stoneLight, kneeJ, [1, 1, 1], [7, 5]);
    b.spike(knee.clone().add(v(s * 0.06, 0.04, 0.05)), [s * 0.5, 0.5, 0.7], 0.1, 0.03, { color: P.stoneLight, bone: kneeJ });

    // shin + greave band + ankle
    tube(knee, ankle, [0.07, 0.052], P.stoneMid, kneeJ);
    const g0 = knee.clone().lerp(ankle, 0.45);
    const g1 = knee.clone().lerp(ankle, 0.6);
    b.rod(g0, g1, 0.08, P.stoneLight, { bone: kneeJ, sides: 8, smooth: false });
    ball(ankle, 0.058, P.stoneLight, kneeJ, [1, 1, 1], [7, 5]);

    // foot pad
    b.frustumBox(
      [foot.x, 0.235, foot.z - 0.09],
      [foot.x, 0.235, foot.z + 0.11],
      [0.17, 0.07],
      [0.21, 0.065],
      { bone: footJ, color: P.stoneMid },
    );
    b.part(new THREE.BoxGeometry(0.15, 0.012, 0.1), P.stoneLight, {
      bone: footJ,
      at: [foot.x, 0.272, foot.z + 0.0],
      flat: true,
    });
    // heel spur
    b.spike([foot.x, 0.26, foot.z - 0.09], [0, 0.25, -1], 0.08, 0.026, { color: P.stoneLight, bone: footJ });

    // three toes with claws
    for (const dx of [-0.07, 0, 0.07]) {
      const bx = foot.x + dx;
      const base = v(bx, 0.228, foot.z + 0.11);
      const tip = v(foot.x + dx * 1.6, 0.224, foot.z + 0.235);
      b.sweep([base, tip], [0.034, 0.026], { bone: footJ, color: P.stoneMid, sides: 6, smooth: false });
      ball(base, 0.036, P.stoneLight, footJ, [1, 0.9, 1], [6, 4]);
      b.spike(tip.clone().add(v(0, 0.004, -0.015)), [dx * 1.6, -0.3, 1], 0.1, 0.022, { color: P.fang, bone: footJ });
    }
    // dark knuckle seams
    b.part(new THREE.BoxGeometry(0.19, 0.008, 0.012), P.stoneSoot, {
      bone: footJ,
      at: [foot.x, 0.27, foot.z + 0.085],
      flat: true,
    });
  }

  // ---------- surface wear ----------
  const cracks = skin.scatter(8, {
    rng: rng(5),
    minDist: 0.14,
    filter: (h: any) => Math.abs(h.n.y) < 0.92,
  });
  for (const h of cracks) {
    b.stick(new THREE.BoxGeometry(0.012, 0.006, 0.1), P.crack, h, { embed: 0.5, spin: rand() * 360, flat: true });
    b.stick(new THREE.BoxGeometry(0.008, 0.005, 0.05), P.crack, h.moved([0.02, 0, 0.03]), {
      embed: 0.5,
      spin: rand() * 360,
      flat: true,
    });
  }
  for (const h of skin.scatter(9, {
    rng: rng(7),
    minDist: 0.1,
    filter: (h: any) => h.n.y > 0.55 && Math.abs(h.at.x) > 0.09,
  })) {
    mossPatch(h, 0.04 + rand() * 0.02);
  }
  for (const h of skin.scatter(10, { rng: rng(9), minDist: 0.1, filter: (h: any) => Math.abs(h.n.y) < 0.6 })) {
    chip(h, P.stoneLight, 0.028 + rand() * 0.015);
  }
  for (const h of skin.scatter(6, { rng: rng(13), minDist: 0.1, filter: (h: any) => h.n.y < -0.4 })) {
    b.stick(new THREE.BoxGeometry(0.05, 0.006, 0.12), P.stoneSoot, h, { embed: 0.5, spin: rand() * 40, flat: true });
  }
}
```

<!-- call: ledgeAndStaging -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLedgeAndStaging({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const bone = J.pelvis; // static ledge: ride the root joint
  const TOP = M.ledgeTop[1]; // 0.2
  const SLAB_BOTTOM = 0.05;
  const FRONT = 0.75;
  const BACK = -0.7;
  const SIDE = 0.75;

  // ---------- helpers ----------
  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    at: number[],
    o: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });

  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    at: number[],
    o: Record<string, unknown> = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, flat: true, ...o });

  // thin box segment from p0 to p1 (cracks, joints)
  const seg = (p0: number[], p1: number[], w: number, color: string) => {
    const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    if (len < 1e-5) return;
    box(len + w * 0.8, w, w, color, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], {
      dir: d,
      axis: "x",
    });
  };
  const crack = (pts: number[][], w = 0.005, color = P.crack) => {
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], w, color);
  };

  // pointed arch outline, centred on x = 0, base on y = 0
  const archOutline = (w: number, hs: number, a: number): Parameters<typeof b.extrude>[0] => [
    [-w, 0],
    [w, 0],
    [w, hs],
    [w * 0.6, hs + a * 0.62],
    [0, hs + a, "sharp"],
    [-w * 0.6, hs + a * 0.62],
    [-w, hs],
  ];

  // ---------- main slab with chamfered front lip ----------
  b.extrude(
    [
      [BACK, SLAB_BOTTOM],
      [FRONT, SLAB_BOTTOM],
      [FRONT, 0.16],
      [0.69, TOP],
      [BACK, TOP],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: SIDE * 2,
      color: P.ledge,
      bone,
      name: "ledgeSlab",
    },
  );

  // recessed wall block below the slab (soot dark)
  box(1.4, SLAB_BOTTOM, 1.0, P.stoneSoot, [0, SLAB_BOTTOM / 2, -0.1]);

  // ---------- stepped corbel blocks underneath ----------
  const corbelProfile: Parameters<typeof b.extrude>[0] = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 0.015],
    [0.58, 0.015],
    [0.58, 0.035],
    [0.67, 0.035],
    [0.67, SLAB_BOTTOM + 0.002],
    [-0.5, SLAB_BOTTOM + 0.002],
  ];
  for (const cx of [-0.6, -0.2, 0.2, 0.6]) {
    b.extrude(corbelProfile, {
      at: [cx, 0, 0.0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.2,
      color: P.ledge,
      bone,
      name: "corbel",
    });
    // lighter edge cap on each step
    box(0.2, 0.004, 0.085, P.ledgeTrim, [cx, 0.037, 0.625]);
    box(0.2, 0.004, 0.075, P.ledgeTrim, [cx, 0.017, 0.54]);
    // soot on the corbel faces
    box(0.05, 0.03, 0.004, P.stoneSoot, [cx + (R() - 0.5) * 0.08, 0.026, 0.672]);
  }
  // side corbels
  for (const sx of [1, -1]) {
    for (const cz of [-0.45, 0.2]) {
      box(0.1, 0.03, 0.2, P.ledge, [sx * 0.7, 0.025, cz]);
      box(0.1, 0.004, 0.2, P.ledgeTrim, [sx * 0.7, 0.041, cz]);
    }
  }
  // soot along the underside of the front lip
  box(1.46, 0.004, 0.03, P.stoneSoot, [0, SLAB_BOTTOM - 0.001, 0.73]);

  // ---------- moulded trim: base band, bead under lip, chamfer cap ----------
  box(1.54, 0.026, 0.03, P.ledgeTrim, [0, 0.063, FRONT + 0.008]); // front base band
  box(1.54, 0.008, 0.012, P.ledgeTrim, [0, 0.081, FRONT + 0.011]); // band top fillet
  for (const sx of [1, -1]) {
    box(0.03, 0.026, 1.46, P.ledgeTrim, [sx * (SIDE + 0.008), 0.063, 0.025]);
    box(0.012, 0.008, 1.46, P.ledgeTrim, [sx * (SIDE + 0.011), 0.081, 0.025]);
    box(0.02, 0.012, 1.46, P.ledgeTrim, [sx * (SIDE + 0.006), 0.157, 0.025]); // bead under lip
  }
  box(1.54, 0.012, 0.02, P.ledgeTrim, [0, 0.157, FRONT + 0.006]);
  // bead rolls
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 1.52, 6), P.ledgeTrim, {
    bone,
    at: [0, 0.1665, FRONT + 0.004],
    dir: [1, 0, 0],
    flat: true,
  });

  // chamfer cap along the lip
  const slopeAng = (Math.atan2(0.04, 0.06) * 180) / Math.PI; // 33.7
  const nrm = [0, 0.832, 0.555];
  const down = [0, -0.555, 0.832];
  box(1.52, 0.007, 0.07, P.ledgeTrim, [0, 0.18 + nrm[1] * 0.003, 0.72 + nrm[2] * 0.003], {
    rotation: [slopeAng, 0, 0],
  });

  // ---------- pointed-arch arcade relief ----------
  const archAt = (face: number[], n: number[], along: number[], y0: number) => {
    const p = [face[0] + n[0] * 0.002, y0, face[2] + n[2] * 0.002];
    b.extrude(archOutline(0.036, 0.028, 0.042), {
      at: p,
      x: along,
      y: [0, 1, 0],
      thickness: 0.012,
      color: P.ledgeTrim,
      bone,
      name: "archFrame",
    });
    b.extrude(archOutline(0.025, 0.026, 0.032), {
      at: [p[0] + n[0] * 0.001, y0 + 0.006, p[2] + n[2] * 0.001],
      x: along,
      y: [0, 1, 0],
      thickness: 0.014,
      color: P.crack,
      bone,
      name: "archHollow",
    });
    // sill under the arch
    box(
      n[2] !== 0 ? 0.09 : 0.016,
      0.005,
      n[2] !== 0 ? 0.016 : 0.09,
      P.ledgeTrim,
      [face[0] + n[0] * 0.009, y0 - 0.001, face[2] + n[2] * 0.009],
    );
  };
  for (let i = -3; i <= 3; i++) archAt([i * 0.2, 0, FRONT], [0, 0, 1], [1, 0, 0], 0.088);
  for (let k = 0; k < 5; k++) {
    const z = -0.45 + k * 0.22;
    archAt([SIDE, 0, z], [1, 0, 0], [0, 0, -1], 0.088);
    archAt([-SIDE, 0, z], [-1, 0, 0], [0, 0, 1], 0.088);
  }

  // ---------- chipped quoin corner blocks ----------
  const quoin = (sx: number, zEdge: number, zdir: number) => {
    const rows = [
      { y0: SLAB_BOTTOM + 0.003, wF: 0.1, wS: 0.075 },
      { y0: SLAB_BOTTOM + 0.058, wF: 0.07, wS: 0.11 },
    ];
    for (const r of rows) {
      const h = 0.052;
      box(r.wF, h, 0.016, P.ledgeTrim, [sx * (SIDE - r.wF / 2), r.y0 + h / 2, zEdge + zdir * 0.004]);
      box(0.016, h, r.wS, P.ledgeTrim, [sx * (SIDE + 0.004), r.y0 + h / 2, zEdge - zdir * (r.wS / 2)]);
    }
  };
  for (const sx of [1, -1]) {
    quoin(sx, FRONT, 1);
    quoin(sx, BACK, -1);
  }

  // chips: small lighter shards on edges and broken corners
  const chip = (at: number[], s: number, rot: number[]) =>
    box(s, s * 0.6, s * 0.9, P.stoneLight, at, { rotation: rot });
  chip([0.725, TOP - 0.003, 0.69], 0.03, [12, 30, 20]);
  chip([-0.74, TOP - 0.004, 0.55], 0.025, [-15, 50, 10]);
  chip([0.745, TOP - 0.002, -0.6], 0.028, [20, 15, -25]);
  chip([-0.73, TOP - 0.002, -0.69], 0.022, [5, 70, 15]);
  chip([0.3, TOP - 0.002, 0.738], 0.02, [30, 10, 5]);
  chip([-0.42, 0.158, 0.76], 0.016, [0, 35, 0]);
  // dark scars under the chips
  box(0.04, 0.003, 0.03, P.crack, [0.725, TOP + 0.0005, 0.665], { rotation: [0, 25, 0] });
  box(0.035, 0.003, 0.025, P.crack, [-0.73, TOP + 0.0005, 0.53], { rotation: [0, -40, 0] });

  // ---------- flagstone joints on top ----------
  const J2 = 0.003;
  box(1.5, 0.004, 0.004, P.crack, [0, TOP, -0.22]);
  box(1.5, 0.004, 0.004, P.crack, [0, TOP, 0.3]);
  box(0.004, 0.004, 0.48, P.crack, [-0.3, TOP, -0.46]);
  box(0.004, 0.004, 0.52, P.crack, [0.42, TOP, 0.04]);
  box(0.004, 0.004, 0.45, P.crack, [-0.1, TOP, 0.525]);
  // iron cramps across joints
  for (const [cx, cz] of [
    [-0.3, -0.22],
    [0.42, -0.22],
    [0.42, 0.3],
    [-0.1, 0.3],
  ])
    box(0.06, 0.004, 0.014, P.crack, [cx, TOP, cz + J2 * 0 ]);

  // ---------- cracks ----------
  crack([[0.46, TOP, -0.64], [0.38, TOP, -0.48], [0.44, TOP, -0.34], [0.36, TOP, -0.2]]);
  crack([[0.36, TOP, -0.34], [0.26, TOP, -0.4], [0.2, TOP, -0.52]], 0.004);
  crack([[-0.72, TOP, 0.2], [-0.56, TOP, 0.26], [-0.5, TOP, 0.4], [-0.36, TOP, 0.44]]);
  crack([[0.1, 0.2015, 0.69], [0.12, 0.19, 0.705], [0.09, 0.175, 0.725], [0.11, 0.162, 0.745], [0.1, 0.145, 0.752], [0.105, 0.11, 0.752], [0.095, 0.07, 0.752]], 0.004);
  crack([[SIDE + 0.002, 0.198, -0.34], [SIDE + 0.002, 0.17, -0.33], [SIDE + 0.002, 0.15, -0.35], [SIDE + 0.002, 0.12, -0.33], [SIDE + 0.002, 0.09, -0.35], [SIDE + 0.002, 0.056, -0.33]], 0.004);
  crack([[-SIDE - 0.002, 0.198, 0.1], [-SIDE - 0.002, 0.17, 0.11], [-SIDE - 0.002, 0.14, 0.09], [-SIDE - 0.002, 0.11, 0.105], [-SIDE - 0.002, 0.07, 0.09]], 0.004);
  crack([[-0.5, 0.0, 0.7], [-0.51, 0.02, 0.7], [-0.49, 0.045, 0.7]], 0.004);

  // ---------- soot streaks ----------
  for (const x of [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5]) {
    const h = 0.05 + R() * 0.07;
    box(0.016 + R() * 0.012, h, 0.004, P.stoneSoot, [x + (R() - 0.5) * 0.02, 0.158 - h / 2, FRONT + 0.001]);
  }
  for (let i = 0; i < 4; i++) {
    const z = -0.34 + i * 0.22;
    const h = 0.04 + R() * 0.07;
    box(0.004, h, 0.016, P.stoneSoot, [SIDE + 0.001, 0.158 - h / 2, z + 0.11]);
    const h2 = 0.04 + R() * 0.06;
    box(0.004, h2, 0.016, P.stoneSoot, [-SIDE - 0.001, 0.158 - h2 / 2, z + 0.11]);
  }
  // back face soot
  for (const x of [-0.5, -0.1, 0.35, 0.6]) {
    const h = 0.05 + R() * 0.08;
    box(0.03, h, 0.004, P.stoneSoot, [x, TOP - h / 2 - 0.002, BACK - 0.001]);
  }

  // ---------- moss patches on top ----------
  const patches: number[][] = [
    [0.62, -0.55, 0.1],
    [-0.58, -0.58, 0.09],
    [0.67, 0.12, 0.06],
    [-0.67, -0.15, 0.07],
    [0.1, -0.6, 0.07],
    [-0.6, 0.62, 0.08],
    [0.58, 0.64, 0.06],
    [-0.05, 0.665, 0.05],
    [0.4, -0.3, 0.05],
    [-0.35, 0.3, 0.04],
  ];
  for (const [x, z, r] of patches) {
    const rot = R() * 180;
    cyl(r, r * 1.08, 0.012, 7, P.mossDark, [x, TOP - 0.002, z], { scale: [1, 1, 0.7], rotation: [0, rot, 0] });
    cyl(r * 0.62, r * 0.68, 0.012, 7, P.moss, [x + r * 0.12, TOP + 0.0015, z - r * 0.08], {
      scale: [1, 1, 0.75],
      rotation: [0, rot + 30, 0],
    });
    const n = 3 + Math.floor(R() * 2);
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2;
      const rr = r * (0.2 + R() * 0.55);
      b.part(new THREE.ConeGeometry(0.011 + R() * 0.006, 0.026 + R() * 0.02, 5), i % 2 ? P.moss : P.mossDark, {
        bone,
        at: [x + Math.cos(a) * rr, TOP + 0.011, z + Math.sin(a) * rr],
        rotation: [(R() - 0.5) * 25, R() * 90, (R() - 0.5) * 25],
        flat: true,
      });
    }
  }

  // ---------- moss drips over the edges ----------
  for (const [x, w, L] of [
    [-0.55, 0.05, 0.06],
    [-0.2, 0.035, 0.04],
    [0.15, 0.04, 0.05],
    [0.5, 0.06, 0.07],
    [0.68, 0.035, 0.04],
  ]) {
    const topPt = [x, TOP, 0.69];
    const c = [
      topPt[0],
      topPt[1] + down[1] * (L / 2 - 0.01) + nrm[1] * 0.0065,
      topPt[2] + down[2] * (L / 2 - 0.01) + nrm[2] * 0.0065,
    ];
    box(w, 0.006, L, P.mossDark, c, { rotation: [slopeAng, 0, 0] });
    box(w * 0.55, 0.007, L * 0.55, P.moss, [c[0], c[1] + nrm[1] * 0.002, c[2] + nrm[2] * 0.002 - 0.004], {
      rotation: [slopeAng, 0, 0],
    });
  }
  for (const [z, h, sx] of [
    [0.4, 0.04, 1],
    [0.1, 0.055, 1],
    [-0.3, 0.035, 1],
    [-0.55, 0.05, 1],
    [0.3, 0.035, -1],
    [-0.1, 0.05, -1],
    [-0.5, 0.04, -1],
  ] as number[][]) {
    box(0.012, h, 0.045, P.mossDark, [sx * (SIDE + 0.004), TOP - h / 2 + 0.002, z]);
  }
  // moss in the back edge
  for (const x of [-0.45, 0.2, 0.55]) box(0.06, 0.05, 0.012, P.mossDark, [x, TOP - 0.024, BACK - 0.003]);

  // ---------- corner crown stones on the top-back edge (worn raised coping) ----------
  for (const sx of [1, -1]) {
    box(0.1, 0.012, 0.1, P.ledgeTrim, [sx * 0.7, TOP - 0.006, BACK + 0.05]);
    box(0.1, 0.012, 0.1, P.ledgeTrim, [sx * 0.7, TOP - 0.006, FRONT - 0.07], { rotation: [0, 0, 0] });
  }
}
```

<!-- call: headAndNeck -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadAndNeck({ b, J, P, M }: Ctx) {
  type V = [number, number, number];
  const HEAD = J.head;
  const NECK = J.neck;
  const JAW = J.jaw;
  const rand = rng(41);
  const TONGUE = "#6e4b4b";
  const HINGE: V = [0, 0.92, 0.42];
  const OPEN = 17; // jaw rest-pose opening, degrees
  const cs = Math.cos((OPEN * Math.PI) / 180);
  const sn = Math.sin((OPEN * Math.PI) / 180);

  // ---------- helpers ----------
  const box = (size: V, at: V, color: string, bone: any, rot?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, rot ? { at, bone, rotation: rot } : { at, bone });

  // a point given in the jaw's closed frame (x, forward f, up u) mapped to the opened jaw
  const jawP = (x: number, f: number, u: number): V => [x, HINGE[1] + u * cs - f * sn, HINGE[2] + u * sn + f * cs];
  const jawBox = (size: V, x: number, f: number, u: number, color: string, rz = 0) =>
    box(size, jawP(x, f, u), color, JAW, [OPEN, 0, rz]);
  const jawUp: V = [0, cs, sn];

  const cone = (base: V, tip: V, r: number, color: string, bone: any, sides = 4) =>
    b.spike(base, tip, null, r, { color, bone, sides });

  const crack = (at: V, size: V, rot: V) => box(size, at, P.crack, HEAD, rot);

  // ---------- neck ----------
  const A: V = [0, 0.85, 0.26];
  const B: V = [0, 0.98, 0.44];
  b.rod(A, B, [0.17, 0.145], { color: P.stoneMid, bone: NECK, sides: 8 });
  const axis: V = (() => {
    const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    const l = Math.hypot(d[0], d[1], d[2]);
    return [d[0] / l, d[1] / l, d[2] / l];
  })();
  const perp: V = [0, 0.79, -0.61];
  const neckPt = (t: number): V => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
  // collar ridges
  [0.28, 0.6].forEach((t, i) => {
    b.part(new THREE.TorusGeometry(0.168 - t * 0.02, 0.02, 4, 8), i ? P.stoneLight : P.stoneDark, {
      at: neckPt(t),
      dir: axis,
      axis: "z",
      bone: NECK,
    });
  });
  // mane spikes along the back of the neck
  [0.0, 0.25, 0.5].forEach((t, i) => {
    const p = neckPt(t);
    const base: V = [0, p[1] + perp[1] * 0.12, p[2] + perp[2] * 0.12];
    const len = 0.12 - i * 0.015;
    cone(base, [0, base[1] + perp[1] * len + 0.01, base[2] + perp[2] * len - 0.02], 0.04 - i * 0.004, P.stoneDark, NECK, 4);
  });
  // chiselled neck side blocks, soot and moss
  for (const s of [1, -1]) {
    box([0.05, 0.1, 0.12], [s * 0.16, 0.92, 0.33], P.stoneLight, NECK, [0, 0, s * 10]);
    box([0.014, 0.1, 0.01], [s * 0.172, 0.89, 0.33], P.stoneSoot, NECK, [0, 0, s * 8]);
  }
  box([0.1, 0.014, 0.08], [0.02, 1.0, 0.27], P.mossDark, NECK, [20, 0, 10]);
  // throat plates
  [0.15, 0.4, 0.65].forEach((t) => {
    const p = neckPt(t);
    box([0.18 - t * 0.04, 0.012, 0.03], [0, p[1] - 0.12, p[2] + 0.07], P.stoneLight, NECK, [-52, 0, 0]);
  });

  // ---------- skull ----------
  box([0.38, 0.24, 0.3], [0, 1.03, 0.46], P.stoneMid, HEAD);
  box([0.32, 0.2, 0.16], [0, 1.06, 0.36], P.stoneMid, HEAD, [-8, 0, 0]);
  for (const s of [1, -1]) {
    box([0.06, 0.06, 0.3], [s * 0.17, 1.13, 0.46], P.stoneLight, HEAD, [0, 0, 45]);
    box([0.05, 0.09, 0.2], [s * 0.19, 0.98, 0.5], P.stoneLight, HEAD, [0, 0, s * 6]);
    // cheek spike
    cone([s * 0.2, 0.96, 0.54], [s * 0.275, 0.93, 0.46], 0.028, P.stoneDark, HEAD, 4);
    cone([s * 0.2, 1.0, 0.47], [s * 0.27, 1.02, 0.4], 0.022, P.stoneDark, HEAD, 4);
    // temple block
    box([0.05, 0.08, 0.1], [s * 0.185, 1.12, 0.42], P.stoneDark, HEAD, [0, 0, s * 20]);
  }
  // occiput ridge
  box([0.22, 0.05, 0.05], [0, 1.15, 0.31], P.stoneLight, HEAD, [20, 0, 0]);

  // brow ridge
  box([0.4, 0.055, 0.1], [0, 1.135, 0.6], P.stoneLight, HEAD, [-10, 0, 0]);
  for (const s of [1, -1]) {
    box([0.17, 0.05, 0.1], [s * 0.11, 1.115, 0.605], P.stoneMid, HEAD, [0, 0, s * 20]);
    box([0.05, 0.05, 0.06], [s * 0.2, 1.1, 0.58], P.stoneDark, HEAD, [0, 0, s * 20]);
  }

  // eyes
  for (const s of [1, -1]) {
    box([0.09, 0.055, 0.04], [s * 0.115, 1.08, 0.608], P.crack, HEAD);
    const eye = b.part(new THREE.SphereGeometry(0.03, 6, 4), P.eyeGlow, {
      at: [s * 0.115, 1.08, 0.622],
      bone: HEAD,
      scale: [1.25, 0.8, 0.8],
    });
    glow(eye, 1.5);
    box([0.008, 0.045, 0.01], [s * 0.115, 1.08, 0.645], P.crack, HEAD, [0, 0, s * 10]);
    // lower lid and soot teardrop
    box([0.085, 0.014, 0.02], [s * 0.115, 1.047, 0.62], P.stoneLight, HEAD, [0, 0, s * -8]);
    box([0.012, 0.075, 0.006], [s * 0.13, 1.0, 0.614], P.stoneSoot, HEAD, [0, 0, s * 6]);
    box([0.008, 0.05, 0.006], [s * 0.15, 1.0, 0.614], P.stoneSoot, HEAD, [0, 0, s * 12]);
  }

  // forehead emblem
  box([0.07, 0.012, 0.07], [0, 1.152, 0.5], P.stoneLight, HEAD, [0, 45, 0]);
  box([0.035, 0.014, 0.035], [0, 1.156, 0.5], P.crack, HEAD, [0, 45, 0]);

  // ---------- upper jaw / snout ----------
  box([0.3, 0.09, 0.2], [0, 0.975, 0.62], P.stoneMid, HEAD);
  box([0.2, 0.06, 0.2], [0, 1.04, 0.62], P.stoneMid, HEAD, [-5, 0, 0]);
  box([0.28, 0.07, 0.014], [0, 1.0, 0.727], P.stoneLight, HEAD);
  // snout ridge and nose bump
  box([0.06, 0.03, 0.16], [0, 1.075, 0.64], P.stoneLight, HEAD, [-5, 0, 0]);
  cone([0, 1.06, 0.715], [0, 1.1, 0.74], 0.03, P.stoneLight, HEAD, 4);
  for (const s of [1, -1]) {
    box([0.034, 0.024, 0.012], [s * 0.06, 1.025, 0.735], P.crack, HEAD);
    box([0.05, 0.012, 0.02], [s * 0.06, 1.045, 0.732], P.stoneLight, HEAD, [0, 0, s * -15]);
    // lip blocks
    box([0.03, 0.06, 0.2], [s * 0.15, 0.965, 0.62], P.stoneLight, HEAD);
    box([0.03, 0.03, 0.03], [s * 0.15, 0.935, 0.705], P.stoneDark, HEAD, [0, 0, 45]);
    // snout wrinkle ridges
    box([0.1, 0.012, 0.02], [s * 0.07, 1.07, 0.61], P.stoneDark, HEAD, [0, s * 20, s * 10]);
    box([0.1, 0.012, 0.02], [s * 0.07, 1.052, 0.59], P.stoneDark, HEAD, [0, s * 20, s * 10]);
  }
  // mouth roof
  box([0.24, 0.01, 0.2], [0, 0.926, 0.58], P.crack, HEAD);
  // upper teeth
  [-0.1, -0.05, 0, 0.05, 0.1].forEach((x) => cone([x, 0.94, 0.715], [x, 0.89, 0.716], 0.012, P.fang, HEAD, 4));
  for (const s of [1, -1]) {
    cone([s * 0.115, 0.945, 0.7], [s * 0.115, 0.85, 0.705], 0.024, P.fang, HEAD, 5);
    [0.58, 0.63, 0.67].forEach((z, i) => cone([s * 0.14, 0.94, z], [s * 0.14, 0.9 + i * 0.004, z], 0.014, P.fang, HEAD, 4));
  }

  // ---------- lower jaw (rest pose open) ----------
  jawBox([0.34, 0.065, 0.14], 0, 0.07, -0.03, P.stoneMid);
  jawBox([0.3, 0.065, 0.14], 0, 0.2, -0.03, P.stoneMid);
  jawBox([0.24, 0.09, 0.06], 0, 0.285, -0.045, P.stoneLight);
  jawBox([0.26, 0.012, 0.26], 0, 0.17, -0.067, P.stoneDark);
  for (const s of [1, -1]) {
    jawBox([0.022, 0.018, 0.26], s * 0.145, 0.17, 0.008, P.stoneLight);
    // hinge boss
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 6), P.stoneLight, {
      at: jawP(s * 0.18, 0.02, -0.01),
      dir: [s, 0, 0],
      bone: JAW,
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.034, 6), P.crack, {
      at: jawP(s * 0.18, 0.02, -0.01),
      dir: [s, 0, 0],
      bone: JAW,
    });
    // jaw side ridges
    jawBox([0.02, 0.05, 0.12], s * 0.17, 0.08, -0.03, P.stoneDark, s * 0);
    // lower teeth
    [0.12, 0.2, 0.26].forEach((f) => {
      const p = jawP(s * 0.125, f, 0.003);
      cone(p, [p[0], p[1] + jawUp[1] * 0.04, p[2] + jawUp[2] * 0.04], 0.011, P.fang, JAW, 4);
    });
    // chin tusks
    const tb = jawP(s * 0.15, 0.25, -0.01);
    const tt = jawP(s * 0.185, 0.28, 0.115);
    cone(tb, tt, 0.03, P.fang, JAW, 5);
  }
  [-0.06, -0.02, 0.02, 0.06].forEach((x) => {
    const p = jawP(x, 0.3, 0.0);
    cone(p, [p[0], p[1] + jawUp[1] * 0.035, p[2] + jawUp[2] * 0.035], 0.01, P.fang, JAW, 4);
  });
  // tongue
  jawBox([0.12, 0.022, 0.2], 0, 0.14, 0.014, TONGUE);
  jawBox([0.07, 0.02, 0.06], 0, 0.265, 0.014, TONGUE);
  jawBox([0.012, 0.01, 0.2], 0, 0.14, 0.027, P.crack);
  // beard blades under the chin
  [
    [0, 0.1, 0.0],
    [-0.065, 0.085, 0.01],
    [0.065, 0.085, 0.01],
    [-0.11, 0.06, 0.02],
    [0.11, 0.06, 0.02],
  ].forEach(([x, len, df], i) => {
    const base = jawP(x, 0.27 + df * 0, -0.07);
    const tip = jawP(x * 1.1, 0.29 + df, -0.07 - len);
    cone(base, tip, 0.032, i === 0 ? P.stoneLight : P.stoneMid, JAW, 4);
  });
  [-0.12, -0.04, 0.04, 0.12].forEach((x) => {
    cone(jawP(x, 0.17, -0.07), jawP(x * 1.05, 0.18, -0.12), 0.026, P.stoneDark, JAW, 4);
  });
  jawBox([0.012, 0.05, 0.006], 0.05, 0.3, -0.045, P.crack, 8);

  // ---------- horns ----------
  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.12, 1.12, 0.53],
      [s * 0.19, 1.18, 0.51],
      [s * 0.25, 1.24, 0.45],
      [s * 0.245, 1.285, 0.37],
      [s * 0.2, 1.29, 0.31],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.052, 0.008], {
      color: P.horn,
      bone: HEAD,
      sides: 6,
      caps: { start: "flat", end: "point" },
      bands: [[0.22, P.stoneLight], [1, P.horn]],
    });
    // base boss
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 6), P.stoneDark, {
      at: pts[0],
      dir: path.tangentAt(0),
      bone: HEAD,
    });
    [0.3, 0.5, 0.7].forEach((t) => {
      b.part(new THREE.TorusGeometry(0.052 - t * 0.04 + 0.006, 0.009, 4, 6), P.stoneLight, {
        at: path.at(t),
        dir: path.tangentAt(t),
        axis: "z",
        bone: HEAD,
      });
    });
  }

  // ---------- bat ears ----------
  const earOutline: any = [
    [0, -0.035],
    [0.07, -0.005],
    [0.135, 0.125, "sharp"],
    [0.075, 0.105],
    [0.0, 0.075],
  ];
  const earInner: any = [
    [0.02, -0.005],
    [0.07, 0.005],
    [0.112, 0.1, "sharp"],
    [0.065, 0.085],
    [0.02, 0.05],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.15, 1.075, 0.4],
      x: [s, 0, 0],
      thickness: 0.03,
      color: P.stoneMid,
      bone: HEAD,
    });
    b.extrude(earInner, {
      at: [s * 0.155, 1.075, 0.4 + s * 0.012],
      x: [s, 0, 0],
      thickness: 0.012,
      color: P.crack,
      bone: HEAD,
    });
    box([0.012, 0.012, 0.034], [s * 0.255, 1.145, 0.4], P.mossDark, HEAD);
  }

  // ---------- weathering ----------
  for (let i = 0; i < 6; i++) {
    const x = (rand() - 0.5) * 0.26;
    const z = 0.34 + rand() * 0.22;
    box([0.05 + rand() * 0.05, 0.012, 0.04 + rand() * 0.04], [x, 1.156, z], i % 2 ? P.moss : P.mossDark, HEAD, [0, rand() * 90, 0]);
  }
  box([0.06, 0.012, 0.03], [0.1, 1.17, 0.6], P.mossDark, HEAD, [-10, 20, 0]);
  box([0.05, 0.012, 0.03], [-0.12, 1.17, 0.6], P.moss, HEAD, [-10, -10, 0]);
  crack([0.04, 1.157, 0.42], [0.008, 0.004, 0.12], [0, 25, 0]);
  crack([-0.06, 1.157, 0.4], [0.008, 0.004, 0.09], [0, -30, 0]);
  crack([0.192, 1.04, 0.45], [0.004, 0.09, 0.008], [0, 0, 20]);
  crack([-0.192, 1.02, 0.5], [0.004, 0.07, 0.008], [0, 0, -25]);
  crack([0.0, 1.0, 0.741], [0.006, 0.05, 0.004], [0, 0, 8]);
  box([0.03, 0.03, 0.02], [0.16, 1.145, 0.5], P.stoneLight, HEAD, [30, 30, 30]);
  box([0.025, 0.025, 0.02], [-0.17, 1.14, 0.55], P.stoneLight, HEAD, [20, 40, 10]);
}
```

<!-- call: wingsAndTail -->

```ts
import * as THREE from "three";
import { aim, catmull, polyline, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildWingsAndTail({ b, J, P, M }: Ctx) {
  type V3 = THREE.Vector3;
  type Bone = typeof J.tail1;
  type OP = [number, number] | [number, number, "sharp"];
  const JJ = J as unknown as Record<string, Bone>;
  const MM = M as unknown as Record<string, [number, number, number]>;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rand = rng(41);

  // ---- merged detail buckets: one part per bone and colour -------------------------------------------------
  const buckets = new Map<string, { bone: Bone; color: string; geos: THREE.BufferGeometry[] }>();
  const stash = (bone: Bone, color: string, geo: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    let k = buckets.get(key);
    if (!k) {
      k = { bone, color, geos: [] };
      buckets.set(key, k);
    }
    k.geos.push(geo);
  };
  const blob = (
    bone: Bone,
    color: string,
    at: V3,
    r: number,
    sc: [number, number, number] = [1, 1, 1],
    q?: THREE.Quaternion,
  ) => {
    const g = new THREE.SphereGeometry(r, 6, 4);
    g.scale(sc[0], sc[1], sc[2]);
    if (q) g.applyQuaternion(q);
    g.translate(at.x, at.y, at.z);
    stash(bone, color, g);
  };
  const seg = (bone: Bone, color: string, a: V3, c: V3, w: number) => {
    const d = c.clone().sub(a);
    const len = d.length();
    if (len < 1e-4) return;
    const g = new THREE.BoxGeometry(w, w, len);
    g.applyQuaternion(aim(d.normalize(), undefined, "z"));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    stash(bone, color, g);
  };
  const perp = (dir: V3, pref: V3) => {
    const n = pref.clone().addScaledVector(dir, -pref.dot(dir));
    return n.lengthSq() < 1e-6 ? v(0, 1, 0) : n.normalize();
  };

  // Rivets, moss, cracks and cuffs seated on a straight bone segment a -> c.
  const decorate = (
    bone: Bone,
    a: V3,
    c: V3,
    r0: number,
    r1: number,
    pref: V3,
    o: { studs?: number[]; moss?: number[]; cracks?: number[]; bands?: number[] },
  ) => {
    const dir = c.clone().sub(a).normalize();
    const n = perp(dir, pref);
    const side = dir.clone().cross(n).normalize();
    const at = (t: number) => a.clone().lerp(c, t);
    const rad = (t: number) => r0 + (r1 - r0) * t;
    for (const t of o.studs ?? []) blob(bone, P.stoneLight, at(t).addScaledVector(n, rad(t) * 0.95), rad(t) * 0.38);
    for (const t of o.moss ?? []) {
      const q = aim(dir, n, "z");
      blob(bone, P.moss, at(t).addScaledVector(n, rad(t) * 0.78), rad(t) * 0.85, [1, 0.42, 2.1], q);
      const t2 = Math.min(0.95, t + 0.08);
      blob(
        bone,
        P.mossDark,
        at(t2).addScaledVector(n, rad(t2) * 0.7).addScaledVector(side, rad(t2) * 0.4),
        rad(t2) * 0.5,
        [1, 0.4, 1.5],
        q,
      );
    }
    for (const t of o.cracks ?? []) {
      let prev: V3 | null = null;
      for (let k = 0; k < 5; k++) {
        const ang = ((-60 + 30 * k) * Math.PI) / 180;
        const jitter = (k % 2 ? 0.012 : -0.012) * (0.6 + rand() * 0.8);
        const p: V3 = at(t)
          .addScaledVector(dir, jitter)
          .addScaledVector(n, Math.cos(ang) * rad(t) * 1.06)
          .addScaledVector(side, Math.sin(ang) * rad(t) * 1.06);
        if (prev) seg(bone, P.crack, prev, p, 0.005);
        prev = p;
      }
    }
    for (const t of o.bands ?? []) {
      const g = new THREE.CylinderGeometry(rad(t) * 1.28, rad(t) * 1.28, 0.032, 6);
      g.applyQuaternion(aim(dir));
      const p = at(t);
      g.translate(p.x, p.y, p.z);
      stash(bone, P.stoneDark, g);
    }
  };

  // ================================================== WINGS ===================================================
  const buildWing = (s: number) => {
    const side = s > 0 ? "L" : "R";
    const w1 = JJ[`wing${side}1`];
    const w2 = JJ[`wing${side}2`];
    const pt = (x: number, y: number, z: number) => v(s * x, y, z);
    const rr = MM[`wingRoot${side}`];
    const root = v(rr[0], rr[1], rr[2]);
    const elbow = pt(0.5, 1.2, -0.15);
    const wrist = pt(0.66, 1.27, -0.36);
    const foreDir = wrist.clone().sub(elbow).normalize();

    // shoulder socket, arm bone, forearm
    b.part(new THREE.IcosahedronGeometry(0.07, 0), P.stoneMid, { at: root, bone: w1, flat: true });
    b.capsule(root, elbow, [0.052, 0.04], {
      color: P.wingBone,
      bone: w1,
      sides: 6,
      smooth: false,
      sectors: [[125, 235, P.stoneDark]],
    });
    b.capsule(elbow, wrist, [0.04, 0.03], {
      color: P.wingBone,
      bone: w2,
      sides: 6,
      smooth: false,
      sectors: [[125, 235, P.stoneDark]],
    });
    const up = v(0, 1, 0.3);
    decorate(w1, root, elbow, 0.052, 0.04, up, { studs: [0.25, 0.5, 0.75], moss: [0.35, 0.7], cracks: [0.5], bands: [0.12, 0.95] });
    decorate(w2, elbow, wrist, 0.04, 0.03, up, { studs: [0.3, 0.65], moss: [0.45], cracks: [0.62], bands: [0.05, 0.92] });

    // elbow ball with a stone spur, wrist block, thumb claw
    b.part(new THREE.IcosahedronGeometry(0.052, 0), P.stoneLight, { at: elbow, bone: w2, flat: true });
    b.spike(elbow, [s * 0.25, 0.9, -0.45], 0.11, 0.032, { color: P.stoneLight, bone: w2, sides: 5 });
    b.part(new THREE.BoxGeometry(0.085, 0.075, 0.085), P.stoneLight, { at: wrist, bone: w2, dir: foreDir, flat: true });
    const thumbDir = v(s * 0.6, 0.25, 0.7).normalize();
    b.spike(wrist.clone().addScaledVector(thumbDir, 0.02), thumbDir, 0.13, 0.022, { color: P.horn, bone: w2, sides: 5 });

    // three fanned fingers
    const tips = [pt(0.74, 1.1, -0.68), pt(0.585, 0.92, -0.69), pt(0.4, 0.74, -0.64)];
    const mids = tips.map((t) => wrist.clone().lerp(t, 0.5).add(v(s * 0.02, 0.035, 0.015)));
    const fr: [number, number][] = [
      [0.024, 0.01],
      [0.022, 0.009],
      [0.02, 0.008],
    ];
    const fpref = v(0, 1, 0.6);
    tips.forEach((tip, i) => {
      const m = mids[i];
      const [r0, r1] = fr[i];
      const rm = (r0 + r1) * 0.62;
      b.sweep(polyline([wrist.clone(), m, tip]), [r0, r1], {
        color: P.wingBone,
        bone: w2,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
      });
      decorate(w2, wrist, m, r0, rm, fpref, { studs: [0.35, 0.7], moss: i === 0 ? [0.5] : [], cracks: i === 1 ? [0.5] : [] });
      decorate(w2, m, tip, rm, r1, fpref, { studs: [0.3, 0.6], cracks: i === 2 ? [0.4] : [] });
      blob(w2, P.stoneLight, m, rm * 1.55);
      const cd = tip.clone().sub(m).normalize();
      b.spike(tip, cd, 0.075, 0.015, { color: P.horn, bone: w2, sides: 5 });
    });

    // membranes
    const offs = [v(s * 0.012, -0.004, -0.012), v(0, -0.02, -0.01), v(-s * 0.012, -0.03, 0)];
    const edge = (i: number) => [wrist.clone().add(offs[i]), mids[i], tips[i]];
    b.membrane(edge(0), edge(1), { color: P.membrane, thickness: 0.012, scallop: 0.16, bone: w2 });
    b.membrane(edge(1), edge(2), { color: P.membrane, thickness: 0.012, scallop: 0.18, bone: w2 });
    const flank = pt(0.22, 0.7, -0.32);
    const midB = pt(0.31, 0.73, -0.48);
    b.membrane([root.clone(), elbow.clone(), wrist.clone()], [flank, midB, tips[2].clone()], {
      color: P.membrane,
      thickness: 0.012,
      scallop: 0.08,
      bone: w1,
    });

    // stone-crack creases running through the membranes
    for (let i = 0; i < 2; i++) {
      const mm = mids[i].clone().add(mids[i + 1]).multiplyScalar(0.5);
      const tt = tips[i].clone().add(tips[i + 1]).multiplyScalar(0.5);
      const c0 = wrist.clone().add(mm.sub(wrist).multiplyScalar(0.45));
      const c1 = wrist.clone().add(tt.sub(wrist).multiplyScalar(0.82));
      seg(w2, P.crack, c0, c1, 0.016);
    }
    seg(w1, P.crack, elbow.clone().lerp(midB, 0.35), elbow.clone().lerp(midB, 0.85), 0.016);
  };
  buildWing(1);
  buildWing(-1);

  // =================================================== TAIL ===================================================
  const tailPts = [
    v(0, 0.4, -0.45),
    v(0, 0.33, -0.56),
    v(0.06, 0.27, -0.635),
    v(0.26, 0.245, -0.64),
    v(0.5, 0.24, -0.55),
    v(0.64, 0.245, -0.42),
    v(0.655, 0.25, -0.3),
  ];
  const tailPath = catmull(tailPts);
  const tail = b.sweep(tailPath, [0.078, 0.064, 0.052, 0.044, 0.038, 0.033, 0.028], {
    bone: [J.tail1, J.tail2, J.tail3],
    sides: 6,
    smooth: false,
    caps: { start: "flat", end: "round" },
    color: (t: number) =>
      (t > 0.28 && t < 0.31) || (t > 0.5 && t < 0.53) || (t > 0.72 && t < 0.75) ? P.stoneLight : P.stoneMid,
    sectors: [[125, 235, P.stoneDark]],
  });

  // dorsal spike ridge, shrinking toward the tip
  b.along(
    tail,
    8,
    (at) => {
      const k = 1 - 0.55 * at.t;
      b.spike(at, at, 0.1 * k, 0.03 * k, { color: P.stoneLight, sides: 5 });
    },
    { from: 0.1, to: 0.97 },
  );

  // moss on top, cracks across
  for (const t of [0.3, 0.52, 0.74, 0.88]) {
    const at = tail.at(t, 0);
    const bone = (at.bone ?? J.tail2) as Bone;
    const q = aim(at.tangent, at.n, "z");
    blob(bone, P.moss, at.at.clone().addScaledVector(at.n, 0.004), 0.045 * (1 - 0.4 * t), [1.2, 0.4, 1.6], q);
    const a2 = tail.at(Math.min(0.97, t + 0.04), 38);
    blob(bone, P.mossDark, a2.at.clone().addScaledVector(a2.n, 0.003), 0.022, [1, 0.4, 1.4], aim(a2.tangent, a2.n, "z"));
  }
  for (const t of [0.22, 0.62]) {
    let prev: V3 | null = null;
    let bone: Bone | null = null;
    for (let k = 0; k < 5; k++) {
      const sp = tail.at(t + (k % 2 ? 0.012 : -0.012), -55 + 27.5 * k);
      const p: V3 = sp.at.clone().addScaledVector(sp.n, 0.003);
      bone = bone ?? ((sp.bone ?? J.tail2) as Bone);
      if (prev && bone) seg(bone, P.crack, prev, p, 0.005);
      prev = p;
    }
  }

  // spade-shaped tip lying on the ledge
  const E = tailPath.at(1).clone();
  const T = tailPath.tangentAt(1).clone();
  const hl = Math.hypot(T.x, T.z) || 1;
  const dx = T.x / hl;
  const dz = T.z / hl;
  const spade: OP[] = [
    [0, 0.03],
    [-0.03, 0.085, "sharp"],
    [0.07, 0.075],
    [0.2, 0, "sharp"],
    [0.07, -0.075],
    [-0.03, -0.085, "sharp"],
    [0, -0.03],
  ];
  const O = v(E.x - dx * 0.03, 0.225, E.z - dz * 0.03);
  b.extrude(spade, {
    at: O,
    x: [dx, 0, dz],
    y: [dz, 0, -dx],
    thickness: 0.04,
    bevel: 0.006,
    color: P.stoneMid,
    bone: J.tail3,
  });
  const inlay: OP[] = spade.map((p) => {
    const x = (p[0] - 0.06) * 0.55 + 0.06;
    const y = p[1] * 0.55;
    return p[2] ? ([x, y, "sharp"] as OP) : ([x, y] as OP);
  });
  b.extrude(inlay, {
    at: v(O.x, 0.245, O.z),
    x: [dx, 0, dz],
    y: [dz, 0, -dx],
    thickness: 0.008,
    color: P.stoneDark,
    bone: J.tail3,
  });
  [0.02, 0.08, 0.13].forEach((u, i) => {
    const base = v(O.x + dx * u, 0.243, O.z + dz * u);
    const k = 1 - i * 0.2;
    b.spike(base, [-dx * 0.3, 1, -dz * 0.3], 0.065 * k, 0.017 * k, { color: P.stoneLight, bone: J.tail3, sides: 5 });
  });

  // ---- flush merged details --------------------------------------------------------------------------------
  for (const k of buckets.values()) {
    const merged = mergeGeometries(k.geos);
    if (merged) b.part(merged, k.color, { bone: k.bone, at: [0, 0, 0], flat: true });
  }
}
```