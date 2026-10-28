<!-- call: plan -->

```json
{
  "name": "Strandbeest Windwalker",
  "description": "A Theo Jansen-style kinetic beach creature: a yellow PVC-tube skeleton with eight Jansen-linkage legs, a rack of pressure bottles for lungs, a tube-and-sail rig on its back, and a sniffing snout with a hinged jaw.",
  "builderName": "strandbeestWindwalker",
  "size": [2.6, 2.4, 4.4],
  "layout": "A long, low, spidery walker facing +Z. Sand-dusted rubber feet touch y=0 in two staggered lanes per side: left x=0.95 and 1.12, right x=-0.95 and -1.12. Above them runs a triangular-truss yellow tube frame about 1.4 m wide with a crankshaft across it at y=1.0. On the frame's back half stands a tall rig: a central mast and two spread triangular wing-sails of pale paper on tube ribs, topping out at y=2.4. In front of the mast, over the frame's middle, sits a standing rack of translucent blue pressure bottles with red caps, joined by a manifold of thin tubes. A short neck of tubes curves forward and up to a blocky snout head. It has two big bottle-cap eyes, an upper jaw and a separately hinged lower jaw. A three-segment whip tail with a small red flag trails behind. The style shows on every part. All structure is chunky round PVC tube in yellow, with darker end-sleeves and elbow connectors at each junction. Tiny black cable-tie boxes and silver bolts sit at joints. Nothing is smooth or organic: everything is a straight or gently bent tube, a triangle, a bottle or a sheet. Colours stay bold and flat, like beach plastic in sun.",
  "palette": {
    "tubeYellow": "#f2c91e",
    "tubeYellowDark": "#c79a0e",
    "tubeYellowLight": "#ffe266",
    "sleeveBlack": "#1d1d24",
    "cableTie": "#ece8da",
    "bolt": "#8b909a",
    "boltDark": "#4f535c",
    "rubberFoot": "#2b2b31",
    "sandDust": "#d9c48f",
    "wetSand": "#8a7650",
    "bottleBlue": "#9bd7ea",
    "bottleBlueDark": "#5aa7c4",
    "capRed": "#d9432f",
    "sailWhite": "#f5f1e4",
    "sailSeam": "#cfc7ab",
    "sailPatch": "#e8a33a",
    "tapeTeal": "#2a9d9a",
    "rope": "#b89a5a",
    "eyeGlow": "#ffb43a",
    "eyeWhite": "#fffaf0",
    "pupil": "#1a1a20",
    "mouthInside": "#7a2a2a"
  },
  "mounts": {
    "crankAxis": [0, 1.0, 0],
    "frameFront": [0, 1.2, 1.2],
    "frameRear": [0, 1.15, -1.9],
    "rackBase": [0, 1.35, 0.4],
    "mastBase": [0, 1.35, -1.0],
    "neckBase": [0, 1.2, 1.2],
    "snoutTip": [0, 1.45, 2.2],
    "tailBase": [0, 1.15, -1.9],
    "hipL1": [0.95, 1.0, 1.2],
    "hipL2": [1.12, 1.0, 0.4],
    "hipL3": [0.95, 1.0, -0.4],
    "hipL4": [1.12, 1.0, -1.2],
    "hipR1": [-0.95, 1.0, 1.2],
    "hipR2": [-1.12, 1.0, 0.4],
    "hipR3": [-0.95, 1.0, -0.4],
    "hipR4": [-1.12, 1.0, -1.2],
    "floorLine": [0, 0, 0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.1, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "crank", "parent": "body", "at": [0, 1.0, 0], "dir": [1, 0, 0], "role": "hinge", "group": "legs" },

    { "name": "hipL1", "parent": "body", "at": [0.95, 1.0, 1.2], "dir": [0, -0.74, 0.67], "role": "leg", "group": "legs" },
    { "name": "kneeL1", "parent": "hipL1", "at": [0.95, 0.5, 1.65], "dir": [0, -0.67, -0.74], "role": "leg", "group": "legs" },
    { "name": "footL1", "parent": "kneeL1", "at": [0.95, 0.05, 1.15], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipL2", "parent": "body", "at": [1.12, 1.0, 0.4], "dir": [0, -0.78, -0.62], "role": "leg", "group": "legs" },
    { "name": "kneeL2", "parent": "hipL2", "at": [1.12, 0.5, 0.0], "dir": [0, -0.79, 0.61], "role": "leg", "group": "legs" },
    { "name": "footL2", "parent": "kneeL2", "at": [1.12, 0.05, 0.35], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipL3", "parent": "body", "at": [0.95, 1.0, -0.4], "dir": [0, -0.78, 0.62], "role": "leg", "group": "legs" },
    { "name": "kneeL3", "parent": "hipL3", "at": [0.95, 0.5, 0.0], "dir": [0, -0.79, -0.61], "role": "leg", "group": "legs" },
    { "name": "footL3", "parent": "kneeL3", "at": [0.95, 0.05, -0.45], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipL4", "parent": "body", "at": [1.12, 1.0, -1.2], "dir": [0, -0.74, -0.67], "role": "leg", "group": "legs" },
    { "name": "kneeL4", "parent": "hipL4", "at": [1.12, 0.5, -1.65], "dir": [0, -0.75, 0.66], "role": "leg", "group": "legs" },
    { "name": "footL4", "parent": "kneeL4", "at": [1.12, 0.05, -1.25], "dir": [0, -1, 0], "role": "leg", "group": "legs" },

    { "name": "hipR1", "parent": "body", "at": [-0.95, 1.0, 1.2], "dir": [0, -0.74, -0.67], "role": "leg", "group": "legs" },
    { "name": "kneeR1", "parent": "hipR1", "at": [-0.95, 0.5, 0.75], "dir": [0, -0.67, 0.74], "role": "leg", "group": "legs" },
    { "name": "footR1", "parent": "kneeR1", "at": [-0.95, 0.05, 1.25], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR2", "parent": "body", "at": [-1.12, 1.0, 0.4], "dir": [0, -0.78, 0.62], "role": "leg", "group": "legs" },
    { "name": "kneeR2", "parent": "hipR2", "at": [-1.12, 0.5, 0.8], "dir": [0, -0.79, -0.61], "role": "leg", "group": "legs" },
    { "name": "footR2", "parent": "kneeR2", "at": [-1.12, 0.05, 0.45], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR3", "parent": "body", "at": [-0.95, 1.0, -0.4], "dir": [0, -0.78, -0.62], "role": "leg", "group": "legs" },
    { "name": "kneeR3", "parent": "hipR3", "at": [-0.95, 0.5, -0.8], "dir": [0, -0.7, 0.71], "role": "leg", "group": "legs" },
    { "name": "footR3", "parent": "kneeR3", "at": [-0.95, 0.05, -0.35], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR4", "parent": "body", "at": [-1.12, 1.0, -1.2], "dir": [0, -0.74, 0.67], "role": "leg", "group": "legs" },
    { "name": "kneeR4", "parent": "hipR4", "at": [-1.12, 0.5, -0.75], "dir": [0, -0.75, -0.66], "role": "leg", "group": "legs" },
    { "name": "footR4", "parent": "kneeR4", "at": [-1.12, 0.05, -1.15], "dir": [0, -1, 0], "role": "leg", "group": "legs" },

    { "name": "neck1", "parent": "body", "at": [0, 1.2, 1.2], "dir": [0, 0.45, 1], "role": "neck", "group": "head" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.35, 1.5], "dir": [0, 0.3, 1], "role": "neck", "group": "head" },
    { "name": "head", "parent": "neck2", "at": [0, 1.45, 1.75], "dir": [0, 0, 1], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.35, 1.85], "dir": [0, 0, 1], "role": "jaw", "group": "head" },

    { "name": "mast", "parent": "body", "at": [0, 1.35, -1.0], "dir": [0, 1, 0], "role": "hinge", "group": "sails" },
    { "name": "wingL1", "parent": "mast", "at": [0.1, 2.0, -1.0], "dir": [1, 0.3, 0], "role": "wing", "group": "sails" },
    { "name": "wingL2", "parent": "wingL1", "at": [0.7, 2.2, -1.0], "dir": [1, 0.1, 0], "role": "wing", "group": "sails" },
    { "name": "wingR1", "parent": "mast", "at": [-0.1, 2.0, -1.0], "dir": [-1, 0.3, 0], "role": "wing", "group": "sails" },
    { "name": "wingR2", "parent": "wingR1", "at": [-0.7, 2.2, -1.0], "dir": [-1, 0.1, 0], "role": "wing", "group": "sails" },
    { "name": "tail1", "parent": "body", "at": [0, 1.15, -1.9], "dir": [0, 0.15, -1], "role": "tail", "group": "sails" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.25, -2.2], "dir": [0, 0.2, -1], "role": "tail", "group": "sails" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.35, -2.4], "dir": [0, 0.2, -1], "role": "tail", "group": "sails" }
  ],
  "parts": [
    {
      "id": "frame",
      "builds": "The creature's backbone, in yellow PVC tube (tubeYellow) with tubeYellowDark end-sleeves.\n- Truss: two lower side rails at x=±0.5, y=0.85, running z=-1.9 to 1.2, plus one upper ridge tube along x=0 at y=1.3. V-shaped cross-braces join the rails to the ridge every 0.4 m. Elbow connector spheres or short sleeves in tubeYellowDark sit at each junction, with tiny sleeveBlack cable-tie boxes and bolt-coloured bolts.\n- Crankshaft: a thick bolt/boltDark rod along x through the crankAxis mount, from x=-1.2 to 1.2. It has bearing blocks where it passes the rails. Offset crank-arm discs and short crank pins, one at each of the 8 leg lanes (x=±0.95 and ±1.12 at the hip z values), phased around the shaft (tubeYellowLight discs, bolt pins).\n- Details: a rope loop (rope) over the ridge, a tapeTeal tape band at mid-body, and sandDust stains on the lower rails.\n- Joints: the crank joint carries the shaft and discs, and the body joint carries the truss. It must not build legs, bottles, mast or head.",
      "box": [[-1.25, 0.7, -1.9], [1.25, 1.35, 1.2]],
      "attaches": "Hip pins sit at the crank axis lanes (hipL1..hipR4 mounts). frameFront (neckBase) takes the neck; rackBase and mastBase stand on its ridge; frameRear (tailBase) takes the tail.",
      "joints": ["body", "crank"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "Eight Jansen-linkage legs, four per side, in staggered lanes (L1, L3 at x=0.95; L2, L4 at x=1.12; right side mirrored with opposite phase).\n- Each leg is a chain hip → knee → foot built from the joint positions. Thick yellow tubes (tubeYellow, radius about 0.03–0.035) run hip→knee and knee→foot. Each has a parallel twin tube offset 0.07 m outward in x, so the leg reads as a flat linkage plate.\n- Jansen-style triangulation: a thin upper triangle brace from hip to a point on the thigh, and a short tubeYellowLight strut parallel to the shin. Cross-pegs (bolt, boltDark) and tubeYellowDark sleeves sit at the hip, knee and mid-shin joints, with sleeveBlack cable ties.\n- Feet: each foot is a chunky rubberFoot pad (flattened capsule or box with a rounded toe) whose bottom touches y=0. A thin wetSand band sits on top of the pad and a sandDust smear on the shin ends. The foot rides footXn, the shin rides kneeXn and the thigh rides hipXn.\n- No frame or crank geometry. Legs stay in this neutral rest pose, spread out, and clear one another in z and x lanes.",
      "box": [[-1.3, 0.0, -1.9], [1.3, 1.05, 1.9]],
      "attaches": "Each hip meets the crank-disc pin at its hipXn mount on the frame (x=±0.95 or ±1.12, y=1.0). Feet rest on the floorLine (y=0).",
      "joints": [
        "hipL1", "kneeL1", "footL1", "hipL2", "kneeL2", "footL2", "hipL3", "kneeL3", "footL3", "hipL4", "kneeL4", "footL4",
        "hipR1", "kneeR1", "footR1", "hipR2", "kneeR2", "footR2", "hipR3", "kneeR3", "footR3", "hipR4", "kneeR4", "footR4"
      ],
      "floor": true,
      "budget": 280
    },
    {
      "id": "lungs",
      "builds": "The wind-pressure bottle rack standing on the frame's ridge and rails, between z=-0.3 and 1.15, riding the body joint.\n- Bottles: about 10–12 upright translucent bottleBlue PET bottles, each about 0.55 m tall and 0.16 m across, with a faceted body, a tapered shoulder, a neck and a capRed cap. Each has a bottleBlueDark base ring and a lighter highlight stripe. They stand in two staggered rows across x=±0.65. A few have tapeTeal label bands.\n- Rack: a tubeYellow base frame of two long rails and cross-rails at y≈1.38, and an upper tubeYellow ring-rack at y≈1.85 holding the bottles, with sleeveBlack cable-tie boxes.\n- Manifold: thin tubeYellowDark tubes with T-junctions run along the cap row at y≈2.0 and down to a central valve block (boltDark with bolt knob). Short hoses link neighbouring bottles.\n- Pumps: two slim piston rods (bolt) with tubeYellowDark cylinders at the sides of the rack, angled toward the frame.\n- Details: a rope tie, a tiny sandDust dusting on the bottle bottoms, and one patch of sailPatch tape. No mast, sail or head.",
      "box": [[-0.75, 1.35, -0.3], [0.75, 2.0, 1.15]],
      "attaches": "Base rails sit on the frame's ridge at the rackBase mount [0,1.35,0.4]. The rack's front end stays behind frameFront (z<1.2); its rear end leaves room for the mast at mastBase (z=-1.0).",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "head",
      "builds": "The neck and sniffing snout head at the front, on joints neck1, neck2, head and jaw.\n- Neck: a curved chain of yellow tubes (tubeYellow) rising from the neckBase mount at [0,1.2,1.2] to the head at [0,1.45,1.75]. It has two tubeYellowDark sleeves, an elbow sphere, a pair of cable-tie boxes and a bolt at each joint. A thin rope runs along the top.\n- Head: a blocky boxy skull made of a yellow tube frame with sailWhite paper panels on the cheeks. An upper snout of tubeYellow, tapering toward z=2.2, has a tubeYellowDark nose-ring at the tip and two nostril-tube stubs in sleeveBlack.\n- Eyes: two large bottle-cap eyes, one each side at x=±0.2, y≈1.62, z≈1.9. Each has a capRed ring, an eyeWhite disc, an eyeGlow iris and a pupil dot, plus a bolt bridge between the eyes. Two short tube eyebrows or antennae stick up and forward.\n- Jaw: a separate lower jaw hinged on the jaw joint at [0,1.35,1.85]. It is a U of tubeYellow with a mouthInside strip, a few small peg teeth in cableTie colour on both jaws, and a sleeveBlack hinge pin at x=±0.25.\n- Rest pose: the jaw is slightly open.\n- No frame, legs or sails.",
      "box": [[-0.4, 1.05, 1.2], [0.4, 1.9, 2.2]],
      "attaches": "neck1 starts at neckBase / frameFront [0,1.2,1.2], where the frame's ridge ends. The snout tip reaches snoutTip [0,1.45,2.2].",
      "joints": ["neck1", "neck2", "head", "jaw"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "sailsTail",
      "builds": "The rear sail rig and the whip tail, on joints mast, wingL1/L2, wingR1/R2 and tail1..3.\n- Mast: a tall central tubeYellow mast from the mastBase mount [0,1.35,-1.0] to y=2.4, with a tubeYellowDark collar, rope stays down to the frame rails at z≈-1.6 and z≈-0.4, and a small cap sphere on top.\n- Wings: two spread wing-sails, left and right, built as membranes or extruded triangular sheets of sailWhite paper. Each spans from the mast out to x≈±1.3 (up to y≈2.2) and down toward y≈1.5 at the back edge. Each sits on a yellow tube rib frame: a leading-edge tube along the wing joints, 4 radial battens, and a trailing tube, with a scalloped trailing edge.\n- Sail details: sailSeam strips along the ribs, one or two sailPatch (mustard) patches and a tapeTeal repair strip. A few sleeveBlack cable ties and bolt pins hold the sheet to the tubes, and cableTie colour loops at the corners.\n- Tail: three tapering yellow tube segments (tail1, tail2, tail3) curving up and back to z≈-2.4, with sleeves. A small capRed flag or windsock triangle sits at the tip, with a short rope. The model's rearmost point is z=-2.2 (flag tip and tail end must not exceed it).\n- No bottles, legs or head.",
      "box": [[-1.3, 1.35, -2.2], [1.3, 2.4, -0.4]],
      "attaches": "The mast base stands on the frame ridge at mastBase [0,1.35,-1.0]. The rack's rear end stays in front (z>-0.3). The tail starts at tailBase / frameRear [0,1.15,-1.9].",
      "joints": ["mast", "wingL1", "wingL2", "wingR1", "wingR2", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const peg = (p: number[], x: number, bone: any) => {
    b.rod([p[0] - 0.12 * x * 0 - 0.06, p[1], p[2]], [p[0] + 0.14, p[1], p[2]], 0.012, P.bolt, { bone, sides: 6 });
  };
  const tie = (p: number[], bone: any) =>
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.03), P.sleeveBlack, { at: p, bone });

  const legs: [string, number, number][] = [
    ["L1", 1, 1.2], ["L2", 1, 0.4], ["L3", 1, -0.4], ["L4", 1, -1.2],
    ["R1", -1, 1.2], ["R2", -1, 0.4], ["R3", -1, -0.4], ["R4", -1, -1.2],
  ];
  for (const [id, s] of legs) {
    const hip = J["hip" + id], knee = J["knee" + id], foot = J["foot" + id];
    const h = [hip.at.x, hip.at.y, hip.at.z];
    const k = [knee.at.x, knee.at.y, knee.at.z];
    const f = [foot.at.x, foot.at.y, foot.at.z];
    const o = 0.07 * s;
    const off = (p: number[], d: number) => [p[0] + d, p[1], p[2]];
    for (const d of [0, o]) {
      tube(off(h, d), off(k, d), 0.032, P.tubeYellow, hip);
      tube(off(k, d), off(f, d), 0.032, P.tubeYellow, knee);
    }
    // cross pegs and sleeves
    for (const [p, bone] of [[h, hip], [k, knee]] as any[]) {
      b.rod([p[0] - 0.02 * s, p[1], p[2]], [p[0] + o + 0.02 * s, p[1], p[2]], 0.045, P.tubeYellowDark, { bone, sides: 8 });
      b.rod([p[0] - 0.05 * s, p[1], p[2]], [p[0] + o + 0.09 * s, p[1], p[2]], 0.014, P.bolt, { bone, sides: 6 });
      tie([p[0] + o / 2, p[1] + 0.05, p[2]], bone);
    }
    // upper triangle brace: hip to point on thigh
    const tp = [k[0] + (h[0] - k[0]) * 0.3, k[1] + (h[1] - k[1]) * 0.3 - 0.0, k[2] + (h[2] - k[2]) * 0.3];
    const tp2 = [h[0], h[1] - 0.12, h[2] + (k[2] > h[2] ? -0.3 : 0.3)];
    tube(off(h, o / 2), off(tp2, o / 2), 0.015, P.tubeYellowLight, hip);
    tube(off(tp2, o / 2), off(tp, o / 2), 0.015, P.tubeYellowLight, hip);
    // strut parallel to shin
    const sa = [k[0] + (f[0] - k[0]) * 0.2, k[1] + (f[1] - k[1]) * 0.2, k[2] + (f[2] - k[2]) * 0.2];
    const sb = [k[0] + (f[0] - k[0]) * 0.75, k[1] + (f[1] - k[1]) * 0.75, k[2] + (f[2] - k[2]) * 0.75];
    const dz = 0.06 * (k[2] > h[2] ? 1 : -1);
    tube(off([sa[0], sa[1], sa[2] + dz], o / 2), off([sb[0], sb[1], sb[2] + dz], o / 2), 0.016, P.tubeYellowLight, knee);
    // mid-shin sleeve
    const ms = [(k[0] + f[0]) / 2, (k[1] + f[1]) / 2, (k[2] + f[2]) / 2];
    b.rod(off(ms, -0.02 * s), off(ms, o + 0.02 * s), 0.042, P.tubeYellowDark, { bone: knee, sides: 8 });
    tie([ms[0] + o / 2, ms[1] + 0.06, ms[2]], knee);
    // shin end sand smear
    const sm = [k[0] + (f[0] - k[0]) * 0.88, k[1] + (f[1] - k[1]) * 0.88, k[2] + (f[2] - k[2]) * 0.88];
    b.rod(off(sm, 0), off(sm, o), 0.037, P.sandDust, { bone: knee, sides: 8 });
    // foot pad: rounded toe, bottom at y=0
    const fz = f[2];
    const padC = [f[0] + o / 2, 0.04, fz + 0.03];
    const pad = b.part(new THREE.BoxGeometry(0.2, 0.08, 0.28), P.rubberFoot, { at: padC, bone: foot });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), P.rubberFoot, {
      at: [padC[0], 0.04, fz + 0.17], bone: foot, rotation: [0, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.205, 0.015, 0.2), P.wetSand, { at: [padC[0], 0.085, fz], bone: foot });
    b.rod(off([f[0], 0.075, fz], -0.02 * s), off([f[0], 0.075, fz], o + 0.02 * s), 0.04, P.tubeYellowDark, { bone: foot, sides: 8 });
    ball([f[0] + o / 2, 0.02, fz + 0.2], 0.01 + R() * 0.005, P.sandDust, foot);
  }
}
```

<!-- call: lungs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLungs({ b, J, P }: any) {
  const bone = J.body;
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone });

  // base frame: two long rails + cross rails at y=1.38
  for (const s of [1, -1]) {
    rod([s * 0.7, 1.38, -0.28], [s * 0.7, 1.38, 1.12], 0.025, P.tubeYellow);
    rod([s * 0.7, 1.9, -0.28], [s * 0.7, 1.9, 1.12], 0.02, P.tubeYellow);
    for (const z of [-0.28, 1.12]) part(new THREE.SphereGeometry(0.04, 6, 5), P.tubeYellowDark, [s * 0.7, 1.38, z]);
  }
  const rows = [-0.28, 0.1, 0.5, 0.9, 1.12];
  for (const z of rows) {
    rod([-0.7, 1.38, z], [0.7, 1.38, z], 0.022, P.tubeYellow);
    part(new THREE.BoxGeometry(0.05, 0.04, 0.04), P.sleeveBlack, [0.7, 1.4, z]);
    part(new THREE.BoxGeometry(0.05, 0.04, 0.04), P.sleeveBlack, [-0.7, 1.4, z]);
  }
  // ring rack at y≈1.85
  for (const z of [0.0, 0.5, 1.0]) rod([-0.7, 1.85, z], [0.7, 1.85, z], 0.018, P.tubeYellow);
  // bottles
  const pos: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const z = -0.2 + i * 0.3;
    pos.push([0.4, z], [-0.4, z + 0.12]);
  }
  pos.length = 11;
  const caps: number[][] = [];
  pos.forEach(([x, z], i) => {
    const y0 = 1.4;
    part(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), P.bottleBlue, [x, y0 + 0.19, z]);
    part(new THREE.CylinderGeometry(0.083, 0.083, 0.04, 8), P.bottleBlueDark, [x, y0 + 0.04, z]);
    part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), P.sandDust, [x, y0 + 0.012, z]);
    part(new THREE.CylinderGeometry(0.03, 0.08, 0.1, 8), P.bottleBlue, [x, y0 + 0.43, z]);
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8), P.bottleBlue, [x, y0 + 0.5, z]);
    part(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 8), P.capRed, [x, y0 + 0.57, z]);
    part(new THREE.BoxGeometry(0.02, 0.3, 0.012), P.bottleBlueDark, [x + (x > 0 ? -0.07 : 0.07) * 0.0, y0 + 0.2, z + 0.08]);
    part(new THREE.BoxGeometry(0.015, 0.28, 0.01), "#d6f1fa", [x + 0.04, y0 + 0.2, z + 0.074]);
    if (i % 3 === 0) part(new THREE.CylinderGeometry(0.084, 0.084, 0.07, 8), P.tapeTeal, [x, y0 + 0.2, z]);
    if (i === 4) part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 8), P.sailPatch, [x, y0 + 0.3, z]);
    caps.push([x, y0 + 0.6, z]);
    // cable tie on ring rack
    part(new THREE.BoxGeometry(0.04, 0.03, 0.03), P.sleeveBlack, [x, 1.85, z]);
    part(new THREE.TorusGeometry(0.09, 0.012, 5, 10), P.tubeYellow, [x, 1.85, z], { rotation: [90, 0, 0] });
  });
  // manifold at y≈2.0
  for (const s of [1, -1]) {
    rod([s * 0.4, 2.0, -0.2], [s * 0.4, 2.0, 1.1], 0.014, P.tubeYellowDark);
    rod([s * 0.4, 2.0, 0.45], [0, 2.0, 0.45], 0.014, P.tubeYellowDark);
    part(new THREE.SphereGeometry(0.025, 6, 5), P.tubeYellowDark, [s * 0.4, 2.0, 0.45]);
  }
  caps.forEach(([x, y, z]) => rod([x, y, z], [x, 1.99, z], 0.008, P.tubeYellowDark));
  // valve block
  part(new THREE.BoxGeometry(0.12, 0.08, 0.1), P.boltDark, [0, 2.0, 0.45]);
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), P.bolt, [0, 2.07, 0.45]);
  part(new THREE.SphereGeometry(0.03, 6, 5), P.bolt, [0, 2.11, 0.45]);
  rod([0, 1.96, 0.45], [0, 1.4, 0.45], 0.012, P.tubeYellowDark);
  // hoses between bottles
  for (let i = 0; i + 2 < pos.length; i += 2)
    rod([caps[i][0], 1.93, caps[i][2]], [caps[i + 2][0], 1.93, caps[i + 2][2]], 0.007, P.tubeYellowDark);
  // pumps
  for (const s of [1, -1]) {
    rod([s * 0.74, 1.45, 0.3], [s * 0.64, 1.8, 0.3], 0.03, P.tubeYellowDark);
    rod([s * 0.64, 1.8, 0.3], [s * 0.56, 2.05, 0.3], 0.011, P.bolt);
    part(new THREE.SphereGeometry(0.02, 6, 5), P.bolt, [s * 0.56, 2.06, 0.3]);
  }
  // rope tie
  part(new THREE.TorusGeometry(0.4, 0.012, 5, 16), P.rope, [0, 1.68, 0.5], { rotation: [90, 0, 0], scale: [1.1, 1, 0.5] });
  void R;
}
```

<!-- call: sailsTail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSailsTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const box = (p: number[], s: number[], col: string, bone: any) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: p, bone });

  // Mast
  const mb = M.mastBase;
  tube(mb, [0, 2.4, mb[2]], 0.04, P.tubeYellow, J.mast);
  tube([0, 1.75, mb[2]], [0, 1.9, mb[2]], 0.058, P.tubeYellowDark, J.mast);
  ball([0, 2.43, mb[2]], 0.06, P.tubeYellowDark, J.mast);
  ball([0, 2.43, mb[2]], 0.035, P.capRed, J.mast);
  tube([0, 2.25, -1], [0, 1.2, -1.6], 0.008, P.rope, J.mast);
  tube([0, 2.25, -1], [0, 1.2, -0.4], 0.008, P.rope, J.mast);
  tube([0, 2.25, -1], [0.5, 1.2, -1.6], 0.006, P.rope, J.mast);
  tube([0, 2.25, -1], [-0.5, 1.2, -1.6], 0.006, P.rope, J.mast);
  for (const z of [-1.6, -0.4]) ball([0, 1.2, z], 0.03, P.boltDark, J.mast);

  // Wings
  for (const s of [1, -1]) {
    const w1 = s > 0 ? J.wingL1 : J.wingR1;
    const w2 = s > 0 ? J.wingL2 : J.wingR2;
    const root = [s * 0.1, 2.0, -1];
    const mid = [s * 0.7, 2.2, -1];
    const tip = [s * 1.3, 2.2, -1.0];
    const back1 = [s * 0.1, 1.55, -1.45];
    const back2 = [s * 0.75, 1.5, -1.55];
    const back3 = [s * 1.3, 1.5, -1.4];
    tube(root, mid, 0.03, P.tubeYellow, w1);
    tube(mid, tip, 0.028, P.tubeYellow, w2);
    tube(back1, back2, 0.022, P.tubeYellow, w1);
    tube(back2, back3, 0.022, P.tubeYellow, w2);
    tube(tip, back3, 0.022, P.tubeYellow, w2);
    tube(root, back1, 0.022, P.tubeYellow, w1);
    const lerp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);
    // sail panels (two quads as slabs)
    b.slab([root, mid, back2, back1], { color: P.sailWhite, thickness: 0.01, bone: w1 });
    b.slab([mid, tip, back3, back2], { color: P.sailWhite, thickness: 0.01, bone: w2 });
    // scalloped trailing bumps
    for (let i = 0; i < 4; i++) {
      const p = lerp(back1, back3, (i + 0.5) / 4);
      ball([p[0], p[1] - 0.02, p[2] - 0.01], 0.07, P.sailWhite, i < 2 ? w1 : w2);
    }
    // battens
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const top = lerp(root, tip, t);
      const bot = lerp(back1, back3, t);
      const bn = i < 3 ? w1 : w2;
      tube(top, bot, 0.016, P.tubeYellowLight, bn);
      const sm = b.rod(lerp(top, bot, 0.02), lerp(top, bot, 0.98), 0.008, P.sailSeam, { bone: bn });
      ball(top, 0.028, P.tubeYellowDark, bn);
      box(lerp(top, bot, 0.5), [0.03, 0.03, 0.03], P.sleeveBlack, bn);
      ball(lerp(top, bot, 0.8), 0.015, P.bolt, bn);
    }
    // corner loops
    for (const c of [tip, back3, back1]) {
      b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 8), P.cableTie, { at: c, bone: w2 });
    }
    // patches
    const pc = lerp(lerp(root, mid, 0.5), lerp(back1, back2, 0.5), 0.45);
    box([pc[0], pc[1], pc[2] - 0.012], [0.22, 0.15, 0.006], P.sailPatch, w1);
    const tc = lerp(lerp(mid, tip, 0.5), lerp(back2, back3, 0.5), 0.6);
    box([tc[0], tc[1], tc[2] - 0.012], [0.3, 0.05, 0.006], P.tapeTeal, w2);
    ball(mid, 0.04, P.tubeYellowDark, w2);
    ball(root, 0.045, P.tubeYellowDark, w1);
  }

  // Tail
  const pts = [
    [0, 1.15, -1.9],
    [0, 1.25, -2.05],
    [0, 1.33, -2.13],
    [0, 1.42, -2.18],
  ];
  const tb = [J.tail1, J.tail2, J.tail3];
  const rad = [0.04, 0.032, 0.024];
  for (let i = 0; i < 3; i++) {
    tube(pts[i], pts[i + 1], rad[i], P.tubeYellow, tb[i]);
    ball(pts[i], rad[i] * 1.5, P.tubeYellowDark, tb[i]);
    box([0, pts[i][1] + 0.03, (pts[i][2] + pts[i + 1][2]) / 2], [0.03, 0.03, 0.03], P.sleeveBlack, tb[i]);
  }
  tube(pts[3], [0, 1.52, -2.18], 0.01, P.rope, J.tail3);
  b.slab([[0, 1.52, -2.18], [0, 1.64, -2.19], [0, 1.58, -2.0]], {
    color: P.capRed,
    thickness: 0.012,
    bone: J.tail3,
  });
  ball([0, 1.42, -2.18], 0.03, P.bolt, J.tail3);
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const Y = P.tubeYellow, YD = P.tubeYellowDark, BK = P.sleeveBlack;
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const box = (p: number[], s: number[], col: string, bone: any) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: p, bone });
  const cyl = (p: number[], r: number, h: number, col: string, bone: any, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 12), col, { at: p, bone, dir });

  // neck
  const n0 = [0, 1.2, 1.2], n1 = [0, 1.35, 1.5], n2 = [0, 1.45, 1.75];
  tube(n0, n1, 0.05, Y, J.neck1);
  tube(n1, n2, 0.045, Y, J.neck2);
  ball(n1, 0.07, YD, J.neck2);
  ball(n0, 0.065, YD, J.neck1);
  for (const [a, c, bone] of [[n0, n1, J.neck1], [n1, n2, J.neck2]] as any[]) {
    const m = [(a[0] * 2 + c[0]) / 3, (a[1] * 2 + c[1]) / 3 + 0.0, (a[2] * 2 + c[2]) / 3];
    cyl(m, 0.06, 0.07, YD, bone, [0, 0.3, 1]);
    box([0.055, m[1] + 0.03, m[2]], [0.02, 0.03, 0.03], BK, bone);
    box([-0.055, m[1] + 0.03, m[2]], [0.02, 0.03, 0.03], BK, bone);
  }
  ball([0.05, 1.37, 1.5], 0.018, P.bolt, J.neck2);
  b.rod([0, 1.26, 1.22], [0, 1.52, 1.76], 0.01, P.rope, { bone: J.neck1, sides: 5 });

  // skull frame 
  const H = J.head;
  const x = 0.2;
  const corners: number[][] = [];
  for (const sx of [1, -1]) for (const y of [1.4, 1.72]) for (const z of [1.75, 2.0]) corners.push([sx * x, y, z]);
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    let d = 0;
    for (let k = 0; k < 3; k++) if (corners[i][k] !== corners[j][k]) d++;
    if (d === 1) tube(corners[i], corners[j], 0.025, Y, H);
  }
  for (const c of corners) ball(c, 0.037, YD, H);
  for (const s of [1, -1]) {
    box([s * 0.2, 1.56, 1.875], [0.012, 0.28, 0.22], P.sailWhite, H);
    box([s * 0.2, 1.56, 1.875], [0.016, 0.03, 0.2], P.sailSeam, H);
  }
  box([0, 1.73, 1.875], [0.4, 0.012, 0.25], P.sailWhite, H);
  // snout
  const sn = [[-0.14, 1.48], [0.14, 1.48], [0.14, 1.64], [-0.14, 1.64]];
  tube([0.14, 1.64, 2.0], [0.07, 1.55, 2.2], 0.025, Y, H);
  tube([-0.14, 1.64, 2.0], [-0.07, 1.55, 2.2], 0.025, Y, H);
  tube([0.12, 1.45, 2.0], [0.07, 1.45, 2.2], 0.025, Y, H);
  tube([-0.12, 1.45, 2.0], [-0.07, 1.45, 2.2], 0.025, Y, H);
  void sn;
  box([0, 1.55, 2.12], [0.2, 0.2, 0.05], Y, H);
  cyl([0, 1.5, 2.2], 0.1, 0.05, YD, H, [0, 0, 1]);
  for (const s of [1, -1]) {
    cyl([s * 0.04, 1.55, 2.24], 0.018, 0.06, BK, H, [0, 0, 1]);
    // eyes
    const e = [s * 0.2, 1.62, 1.9];
    cyl([e[0] + s * 0.02, e[1], e[2]], 0.09, 0.04, P.capRed, H, [1, 0, 0]);
    cyl([e[0] + s * 0.045, e[1], e[2]], 0.07, 0.03, P.eyeWhite, H, [1, 0, 0]);
    cyl([e[0] + s * 0.065, e[1], e[2]], 0.045, 0.02, P.eyeGlow, H, [1, 0, 0]);
    cyl([e[0] + s * 0.08, e[1], e[2] + 0.005], 0.02, 0.02, P.pupil, H, [1, 0, 0]);
    tube([s * 0.12, 1.74, 1.95], [s * 0.15, 1.95 - 0.05, 2.08], 0.012, Y, H);
    ball([s * 0.15, 1.9, 2.08], 0.02, P.capRed, H);
    box([s * 0.23, 1.54, 1.76], [0.03, 0.03, 0.03], BK, H);
  }
  tube([-0.2, 1.62, 1.9], [0.2, 1.62, 1.9], 0.012, P.bolt, H);
  // teeth upper
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), P.cableTie, { at: [s * (0.04 + i * 0.025 - 0.02), 1.43, 2.0 + i * 0.03], bone: H, dir: [0, -1, 0] });

  // jaw
  const Jw = J.jaw;
  tube([0.14, 1.34, 1.85], [0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([-0.14, 1.34, 1.85], [-0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([0.1, 1.3, 2.15], [-0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([0.14, 1.34, 1.85], [-0.14, 1.34, 1.85], 0.022, Y, Jw);
  box([0, 1.325, 2.0], [0.2, 0.012, 0.28], P.mouthInside, Jw);
  for (let i = 0; i < 4; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.013, 0.045, 5), P.cableTie, { at: [s * 0.1, 1.35, 1.92 + i * 0.07], bone: Jw, dir: [0, 1, 0] });
  for (const s of [1, -1]) {
    cyl([s * 0.25, 1.36, 1.85], 0.03, 0.05, BK, Jw, [1, 0, 0]);
    ball([s * 0.28, 1.36, 1.85], 0.016, P.bolt, Jw);
  }
  b.pose(Jw, { axis: [1, 0, 0], deg: 12 });
}
```

<!-- call: frame -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFrame({ b, J, P, M }: any) {
  const body = J.body;
  const crank = J.crank;
  const R = rng(5);
  const Y = P.tubeYellow, YD = P.tubeYellowDark, YL = P.tubeYellowLight;

  const tube = (a: number[], c: number[], r: number, col: string, bone: any = body) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any = body) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p });
  const box = (p: number[], s: number[], col: string, bone: any = body) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: p });

  const zA = -1.9, zB = 1.2;
  const railY = 0.85, ridgeY = 1.3;

  // rails and ridge
  for (const s of [1, -1]) {
    tube([s * 0.5, railY, zA], [s * 0.5, railY, zB], 0.035, Y);
    for (const z of [zA, zB]) {
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, {
        bone: body, at: [s * 0.5, railY, z + (z === zA ? 0.03 : -0.03)], dir: [0, 0, 1],
      });
    }
  }
  tube([0, ridgeY, zA], [0, ridgeY, zB], 0.035, Y);
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, { bone: body, at: [0, ridgeY, zA + 0.03], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, { bone: body, at: [0, ridgeY, zB - 0.03], dir: [0, 0, 1] });

  // bottom cross tube and V braces every 0.4
  for (let i = 0; i <= 8; i++) {
    const z = zA + i * 0.4 + 0.0;
    if (z > zB + 0.01) break;
    tube([-0.5, railY, z], [0.5, railY, z], 0.025, Y);
    for (const s of [1, -1]) {
      tube([s * 0.5, railY, z], [0, ridgeY, z + 0.2], 0.022, Y);
      tube([s * 0.5, railY, z + 0.4], [0, ridgeY, z + 0.2], 0.022, Y);
      ball([s * 0.5, railY, z], 0.05, YD);
      box([s * 0.5, railY + 0.05, z], [0.035, 0.035, 0.035], P.sleeveBlack);
    }
    ball([0, ridgeY, z + 0.2], 0.05, YD);
    box([0.0, ridgeY + 0.05, z + 0.2], [0.03, 0.03, 0.05], P.sleeveBlack);
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), P.bolt, { bone: body, at: [0, ridgeY, z + 0.2], dir: [1, 0, 0] });
  }

  // sand stains on lower rails
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = -1.6 + i * 0.6 + R() * 0.2;
      box([s * 0.5, railY - 0.03, z], [0.08, 0.02, 0.22], P.sandDust);
    }

  // teal tape band mid-body
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.1, 8), P.tapeTeal, { bone: body, at: [0, ridgeY, -0.3], dir: [0, 0, 1] });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), P.tapeTeal, { bone: body, at: [s * 0.5, railY, -0.3], dir: [0, 0, 1] });

  // rope loop over ridge
  const rp = [[0.08, 1.2, 0.0], [0.07, 1.36, 0.0], [-0.07, 1.36, 0.0], [-0.08, 1.2, 0.0]];
  for (let i = 0; i < 3; i++) tube(rp[i], rp[i + 1], 0.012, P.rope);
  tube([0.08, 1.2, 0], [0.5, 0.88, 0], 0.01, P.rope);
  tube([-0.08, 1.2, 0], [-0.5, 0.88, 0], 0.01, P.rope);

  // crankshaft
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 2.4, 10), P.boltDark, { bone: crank, at: [0, 1, 0], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), P.bolt, { bone: crank, at: [s * 1.2, 1, 0], dir: [1, 0, 0] });
    // bearing blocks + struts to rails
    box([s * 0.5, 0.93, 0], [0.12, 0.2, 0.14], P.boltDark);
    tube([s * 0.5, railY, 0], [s * 0.5, 0.97, 0], 0.03, YD);
  }
  box([0, 1.0, 0], [0.1, 0.16, 0.14], P.boltDark);
  tube([0, ridgeY, 0], [0, 1.06, 0], 0.03, YD);

  // crank discs and pins at 8 lanes
  const lanes: [number, number, number][] = [
    [0.95, 1.2, 0], [1.12, 0.4, 1], [0.95, -0.4, 2], [1.12, -1.2, 3],
    [-0.95, 1.2, 4], [-1.12, 0.4, 5], [-0.95, -0.4, 6], [-1.12, -1.2, 7],
  ];
  for (const [x, z, k] of lanes) {
    const s = Math.sign(x);
    const ang = (k * Math.PI) / 4 + (s < 0 ? Math.PI : 0);
    const cy = 1 + Math.cos(ang) * 0.0, cz = z;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), YL, { bone: crank, at: [x, 1, 0], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 6), P.bolt, {
      bone: crank, at: [x, 1 + Math.cos(ang) * 0.07, Math.sin(ang) * 0.07], dir: [1, 0, 0],
    });
    // hip pin at lane mount
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), P.bolt, { bone: body, at: [x, 1.0, z], dir: [1, 0, 0] });
    ball([x, 1.0, z], 0.04, YD);
    void cy; void cz;
  }
  // lane support tubes from rail to hip mounts
  for (const [x, z] of lanes) {
    const s = Math.sign(x);
    tube([s * 0.5, railY, z], [x, 1.0, z], 0.02, YD);
  }

  // front/rear mounts
  ball(M.frameFront, 0.06, YD);
  ball(M.frameRear, 0.06, YD);
  ball([0, ridgeY, 0.4], 0.05, YD);
  ball([0, ridgeY, -1.0], 0.05, YD);
}
```