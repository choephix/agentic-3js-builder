<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A weathered gothic stone gargoyle crouched on a cathedral ledge, wings half-raised, grinning down over the street with a curled tail.",
  "builderName": "cathedralGargoyle",
  "size": [1.7, 1.55, 1.9],
  "layout": "Everything faces +Z (the street side). A stone ledge (1.44 wide x 1.7 long, 0.22 high, top at y=0.22) is the only thing on the floor. The gargoyle crouches on it, about 1.2 m tall including horns. The body is a heavy, blocky, faceted stone mass: a barrel chest (spine2) higher than the hips, a hunched back, huge shoulders, and a big characterful head thrust forward and slightly down over the ledge front (snout tip at z about 0.97, past the ledge's front edge at z=0.85). Hind legs are folded in a deep squat (thigh forward-down to the knee, shin back-down to the ankle, long flat foot forward on the ledge). Forelimbs are planted straight down in front of the chest, with the big three-toed hands gripping the ledge. Bat-like stone wings sprout from the shoulder blades, half-raised and swept back, with three finger bones each and carved membrane panels. The tail leaves the rump, drops onto the ledge, and curls round the left (+X) side of the hind foot, ending in a spade tip pointing forward. Rest pose: limbs, wings and fingers separated; jaw built as separate upper and lower jaw so it can open. Style is gothic stone carving: chunky, chiselled planes, flat colours picked by place. Light grey-tan stone on top faces, mid grey on the sides, dark grey in recesses and underneath. Moss and lichen sit as small parts on upward faces only (ledge top, shoulders, head top, wing tops). Dark rain-stain streaks run down from the eyes, horns and ledge edge. Eyes are deep carved sockets with a small amber glowing pupil. Carved details are repeated motifs: pointed gothic arches and quatrefoils on the ledge face and wing panels, chiselled brow ridges, ribbed spine ridge, scalloped scale rows on the chest. Everything is built from primitives. The only joints are the ones listed; builders add no joints of their own. Mirror L (+X) and R (-X) with the same joint names ending L or R, except for the tail.",
  "palette": {
    "stoneLight": "#aca998",
    "stoneMid": "#8c897d",
    "stoneDark": "#615f58",
    "stoneShadow": "#3f3e3a",
    "stoneWarm": "#a09581",
    "stoneCool": "#7a8083",
    "wingStone": "#7f7c71",
    "mossGreen": "#5f7442",
    "mossDark": "#3f5231",
    "lichen": "#b9b36d",
    "stain": "#35332f",
    "crack": "#262524",
    "birdLime": "#dad7c9",
    "rustStain": "#86583a",
    "eyeSocket": "#22211f",
    "eyeGlow": "#ffc24a",
    "tooth": "#d6d0bc",
    "claw": "#4b4944",
    "tongue": "#8d6b62",
    "mortar": "#b9b4a2"
  },
  "mounts": {
    "ledgeTop": [0, 0.22, 0],
    "ledgeFront": [0, 0.22, 0.85],
    "ledgeBack": [0, 0.22, -0.85],
    "hipsCentre": [0, 0.62, -0.3],
    "chestCentre": [0, 0.85, 0.2],
    "neckBase": [0, 0.95, 0.38],
    "headSocket": [0, 1.13, 0.6],
    "jawHinge": [0, 1.08, 0.68],
    "shoulderL": [0.27, 0.82, 0.2],
    "shoulderR": [-0.27, 0.82, 0.2],
    "hipSocketL": [0.28, 0.62, -0.3],
    "hipSocketR": [-0.28, 0.62, -0.3],
    "handContactL": [0.3, 0.22, 0.55],
    "handContactR": [-0.3, 0.22, 0.55],
    "footContactL": [0.32, 0.22, -0.15],
    "footContactR": [-0.32, 0.22, -0.15],
    "wingRootL": [0.18, 0.97, 0.05],
    "wingRootR": [-0.18, 0.97, 0.05],
    "tailRoot": [0, 0.6, -0.45],
    "tailTip": [0.54, 0.27, -0.3]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.62, -0.3], "dir": [0, 0.2, 1], "role": "spine", "group": "body" },
    { "name": "spine1", "parent": "hips", "at": [0, 0.7, -0.05], "dir": [0, 0.35, 1], "role": "spine", "group": "body" },
    { "name": "spine2", "parent": "spine1", "at": [0, 0.82, 0.2], "dir": [0, 0.3, 1], "role": "spine", "group": "body" },
    { "name": "neck1", "parent": "spine2", "at": [0, 0.95, 0.38], "dir": [0, 0.6, 1], "role": "neck", "group": "head" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.07, 0.52], "dir": [0, 0.3, 1], "role": "neck", "group": "head" },
    { "name": "head", "parent": "neck2", "at": [0, 1.13, 0.6], "dir": [0, -0.1, 1], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.08, 0.68], "dir": [0, -0.1, 1], "role": "jaw", "group": "head" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.6, -0.45], "dir": [0, -0.1, -1], "role": "tail", "group": "body" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.55, -0.72], "dir": [0.3, -0.4, -0.5], "role": "tail", "group": "body" },
    { "name": "tail3", "parent": "tail2", "at": [0.22, 0.33, -0.78], "dir": [1, -0.1, 0.2], "role": "tail", "group": "body" },
    { "name": "tail4", "parent": "tail3", "at": [0.45, 0.28, -0.72], "dir": [0.3, 0, 1], "role": "tail", "group": "body" },
    { "name": "tail5", "parent": "tail4", "at": [0.54, 0.28, -0.5], "dir": [0, 0, 1], "role": "tail", "group": "body" },

    { "name": "hipHL", "parent": "hips", "at": [0.28, 0.62, -0.3], "dir": [0.3, -0.4, 1], "role": "leg", "group": "legs" },
    { "name": "kneeHL", "parent": "hipHL", "at": [0.42, 0.5, -0.05], "dir": [-0.4, -0.5, -1], "role": "leg", "group": "legs" },
    { "name": "ankleHL", "parent": "kneeHL", "at": [0.32, 0.3, -0.32], "dir": [0, -0.2, 1], "role": "leg", "group": "legs" },
    { "name": "footHL", "parent": "ankleHL", "at": [0.32, 0.25, -0.1], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipHR", "parent": "hips", "at": [-0.28, 0.62, -0.3], "dir": [-0.3, -0.4, 1], "role": "leg", "group": "legs" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-0.42, 0.5, -0.05], "dir": [0.4, -0.5, -1], "role": "leg", "group": "legs" },
    { "name": "ankleHR", "parent": "kneeHR", "at": [-0.32, 0.3, -0.32], "dir": [0, -0.2, 1], "role": "leg", "group": "legs" },
    { "name": "footHR", "parent": "ankleHR", "at": [-0.32, 0.25, -0.1], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "shoulderL", "parent": "spine2", "at": [0.27, 0.82, 0.2], "dir": [0.2, -1, -0.1], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.34, 0.52, 0.15], "dir": [-0.1, -0.7, 0.8], "role": "arm", "group": "arms" },
    { "name": "wristL", "parent": "elbowL", "at": [0.3, 0.32, 0.4], "dir": [0, -0.3, 1], "role": "arm", "group": "arms" },
    { "name": "handL", "parent": "wristL", "at": [0.3, 0.26, 0.5], "dir": [0, 0, 1], "role": "arm", "group": "arms" },
    { "name": "shoulderR", "parent": "spine2", "at": [-0.27, 0.82, 0.2], "dir": [-0.2, -1, -0.1], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.34, 0.52, 0.15], "dir": [0.1, -0.7, 0.8], "role": "arm", "group": "arms" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.3, 0.32, 0.4], "dir": [0, -0.3, 1], "role": "arm", "group": "arms" },
    { "name": "handR", "parent": "wristR", "at": [-0.3, 0.26, 0.5], "dir": [0, 0, 1], "role": "arm", "group": "arms" },

    { "name": "wingShoulderL", "parent": "spine2", "at": [0.18, 0.97, 0.05], "dir": [1, 0.8, -0.3], "role": "wing", "group": "wings" },
    { "name": "wingElbowL", "parent": "wingShoulderL", "at": [0.42, 1.18, -0.05], "dir": [1, 0.3, -0.5], "role": "wing", "group": "wings" },
    { "name": "wingWristL", "parent": "wingElbowL", "at": [0.6, 1.25, -0.25], "dir": [0.5, 0.3, -0.8], "role": "wing", "group": "wings" },
    { "name": "fingerAL", "parent": "wingWristL", "at": [0.6, 1.25, -0.25], "dir": [0.4, 0.5, -0.7], "role": "digit", "group": "wings" },
    { "name": "fingerBL", "parent": "wingWristL", "at": [0.6, 1.25, -0.25], "dir": [0.5, 0, -0.8], "role": "digit", "group": "wings" },
    { "name": "fingerCL", "parent": "wingWristL", "at": [0.6, 1.25, -0.25], "dir": [0.2, -0.6, -0.8], "role": "digit", "group": "wings" },
    { "name": "wingShoulderR", "parent": "spine2", "at": [-0.18, 0.97, 0.05], "dir": [-1, 0.8, -0.3], "role": "wing", "group": "wings" },
    { "name": "wingElbowR", "parent": "wingShoulderR", "at": [-0.42, 1.18, -0.05], "dir": [-1, 0.3, -0.5], "role": "wing", "group": "wings" },
    { "name": "wingWristR", "parent": "wingElbowR", "at": [-0.6, 1.25, -0.25], "dir": [-0.5, 0.3, -0.8], "role": "wing", "group": "wings" },
    { "name": "fingerAR", "parent": "wingWristR", "at": [-0.6, 1.25, -0.25], "dir": [-0.4, 0.5, -0.7], "role": "digit", "group": "wings" },
    { "name": "fingerBR", "parent": "wingWristR", "at": [-0.6, 1.25, -0.25], "dir": [-0.5, 0, -0.8], "role": "digit", "group": "wings" },
    { "name": "fingerCR", "parent": "wingWristR", "at": [-0.6, 1.25, -0.25], "dir": [-0.2, -0.6, -0.8], "role": "digit", "group": "wings" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The cathedral stone ledge the gargoyle crouches on: a stepped cornice block 1.44 wide, 1.7 long, 0.22 high (top surface at y=0.22) made of a plinth (stoneMid), a projecting upper moulding course (stoneLight) and a thin lower fillet (stoneDark) around the front and sides. The front face (+Z) and both side faces carry carved pointed-arch blind arcades and a row of quatrefoils (stoneShadow recesses with stoneMid inner shapes). Mortar joint lines (mortar) are thin boxes forming ashlar courses, cracks (crack) zig-zag across a few blocks, and a chipped corner is made from a small wedge cut. Weathering is made of small parts: moss patches (mossGreen, mossDark) on the top surface edges and in the joints, lichen discs (lichen), bird-lime splashes (birdLime) on the top and over the front edge, vertical rain-stain streaks (stain, rustStain) down the front. Keep the area under the gargoyle's feet (x within 0.5, z from -0.85 to 0.7) flat at y=0.22 so feet and tail sit on it. Builds only the ledge, it rides the root joint hips rigidly (bone: hips) and nothing about it moves.",
      "box": [[-0.72, 0, -0.85], [0.72, 0.22, 0.85]],
      "attaches": "Top surface is mount ledgeTop (y=0.22). Feet at footContactL/R, hands at handContactL/R, the tail lies on it near tailTip. Gargoyle parts sink up to 0.01 into it.",
      "joints": ["hips"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "body",
      "builds": "Torso, spine and tail of the gargoyle. A chunky faceted torso loft along hips, spine1 and spine2 (stoneMid, heavy barrel chest about 0.25 radius at spine2, narrower waist about 0.19, hip mass about 0.22) with a stoneLight back, stoneDark belly and hip wraps skinned on bones hips, spine1, spine2. Hunched shoulder-blade slabs and a trapezius hump behind the neck base. Row of chunky ribbed dorsal spine ridge plates (stoneLight with stoneDark bases) running from neckBase to tailRoot and along the tail. Scalloped chest scales and a carved gothic pointed-arch emblem on the chest front (stoneDark with stoneShadow inset). Carved ribs on the flanks, a loin-cloth-like stone sash band at the waist with a small trefoil. The tail is a sweep along tail1..tail5 (tapering from 0.07 to 0.04 radius, stoneMid with stoneDark rings and little spikes along the top) curling onto the ledge and round the left side to the spade-shaped arrowhead tip at mount tailTip (flat extruded spade, stoneLight with stoneShadow edge line, pointing +Z). Tail rests flat on the ledge, with no part lower than y=0.23. Moss (mossGreen) on top of the shoulders and hip hump, lichen (lichen) spots, rain-stain streaks (stain) down the flanks, and a few cracks (crack). The body does NOT build the neck, head, limbs or wings, but its mass must overlap their roots (shoulder and hip balls at the sockets) so that joints are hidden.",
      "box": [[-0.35, 0.3, -0.85], [0.6, 1.02, 0.4]],
      "attaches": "Neck sweep starts at mount neckBase on spine2. Legs attach at hipSocketL/R, arms at shoulderL/R, wings at wingRootL/R (body provides a shoulder-blade pad there). Tail sweep from tailRoot.",
      "joints": ["hips", "spine1", "spine2", "tail1", "tail2", "tail3", "tail4", "tail5"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "head",
      "builds": "Neck and head: the richest part, the identity of the model. Neck is a thick sweep over neck1 and neck2 (stoneMid) with a stone mane ruff of broad overlapping carved blades (stoneLight to stoneDark root to tip) behind the head. The head is a big blocky skull (about 0.44 wide, 0.36 tall, centred near (0,1.15,0.74) on joint head), a heavy overhanging brow ridge (stoneDark, chiselled facets), deep eye sockets (eyeSocket) with round glowing amber pupils (eyeGlow, small spheres) seated under the brow, wide flaring nostrils on a thick blunt snout (stoneMid with stoneDark nostril holes), cheek bone slabs and a heavy cheek ruff. The mouth is built as a separate upper jaw (on head) and lower jaw (on jaw joint, hinge at mount jawHinge, with a chin and a chunky stone beard tuft in blades) in a snarling grin: upper row of cone fangs and little incisors (tooth), two big lower tusks curving up past the lip (tooth), a flat tongue (tongue) inside the lower jaw, a dark mouth interior (stoneShadow). Two large curled horns (spiral sweeps, stoneLight root to stoneDark tip, each ~0.25 long, rising up and back from the skull top and reaching y about 1.42) with ridged rings, and two big pointed bat ears (extruded, stoneMid with stoneDark inner) behind and beside the horns. Small chiselled forehead glyph or gothic cross (stoneShadow) between the horns. Moss (mossGreen) on the brow top and horn bases, lichen spots, long rain-stain streaks (stain) running down from the eye sockets and mouth corners, cracks (crack) on a horn. Nothing blocks the face: horns and ears sit above and behind the eyes. Eyes read clearly from the front.",
      "box": [[-0.27, 0.93, 0.3], [0.27, 1.45, 1.0]],
      "attaches": "Neck starts at neckBase (spine2 top) and ends at headSocket. Head rides joint head, lower jaw rides joint jaw (hinge mount jawHinge). Mane blades overlap the body's trapezius hump.",
      "joints": ["neck1", "neck2", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "limbs",
      "builds": "All four limbs, mirrored L (+X) and R (-X). Hind legs: a big rounded haunch/thigh mass at each hipSocket (stoneMid with stoneLight top), thigh sweep hipH to kneeH, a knobbed knee cap (stoneLight plate with stoneDark rim), a thinner shin sweep kneeH to ankleH, a chunky ankle spur at the back, and a long flat foot on footH with three thick toes ending in claws (claw, cone) plus a short rear dewclaw, all resting on the ledge (toe undersides at y about 0.23). Forelimbs: heavy shoulder ball at shoulder (stoneMid, with a carved stoneDark scallop band), upper arm sweep shoulder to elbow, an elbow knob/spike (stoneLight cone), a forearm sweep elbow to wrist with stoneDark carved bracer-like ridges, and big hands on handL/R: a palm block and three thick fingers plus a thumb gripping the ledge edge forward, each with a claw (claw), knuckle bumps (stoneLight). Use sweeps skinned to the chains for the limb tubes, so they bend. Moss (mossGreen) on the tops of haunches and shoulders, bird-lime or lichen spot on a knee, stain streaks (stain) down the shins, a couple of cracks (crack) on the thighs and forearm.",
      "box": [[-0.5, 0.22, -0.45], [0.5, 0.95, 0.7]],
      "attaches": "Feet end at footContactL/R and hands at handContactL/R on ledgeTop (y=0.22, sink at most 0.01). Hip balls overlap the body at hipSocketL/R, shoulder balls at shoulderL/R, so joints are hidden.",
      "joints": ["hipHL", "kneeHL", "ankleHL", "footHL", "hipHR", "kneeHR", "ankleHR", "footHR", "shoulderL", "elbowL", "wristL", "handL", "shoulderR", "elbowR", "wristR", "handR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wings",
      "builds": "Two bat-like stone wings, mirrored, each half-raised and swept back, each reaching about x = +/-0.85 and y up to about 1.5. Each wing's arm is a thick sweep along wingShoulder, wingElbow and wingWrist (stoneMid with a stoneLight upper edge, a knobbed elbow and a wrist knuckle with a claw-hook thumb at the wrist front, claw colour). Three finger bones fingerA, fingerB, fingerC radiate back from the wrist along their joint directions (each ~0.5 long, tapered sweeps stoneLight to stoneDark, with a pointed tip spike). Between the arm and the fingers are membrane panels as thin stone plates built with b.membrane or slabs (wingStone, thickness about 0.02) with a scalloped trailing edge between the finger tips and back to the body at the shoulder-blade, and carved details on them: raised rib lines along each finger (stoneLight), gothic pointed-arch tracery windows inset in each panel (stoneDark with stoneShadow), and a leaf or feather motif row (stoneMid). Moss (mossGreen) on the top edge of the arm, lichen discs (lichen), rain-stain streaks (stain) down the membrane, cracks (crack) on one panel, and a chipped notch at one trailing edge. Wings start at the wingRoot mounts on the back, just behind the neck (z between about 0.1 and -0.8) and must not intersect the head or the tail.",
      "box": [[-0.9, 0.8, -0.8], [0.9, 1.55, 0.15]],
      "attaches": "Wing arms root at wingRootL/R (shoulder-blade pad provided by the body), a small socket boss at the root hides the joint. Membranes' inner edge returns to the body's back near hipsCentre line of the spine at y about 0.95 to 0.85.",
      "joints": ["wingShoulderL", "wingElbowL", "wingWristL", "fingerAL", "fingerBL", "fingerCL", "wingShoulderR", "wingElbowR", "wingWristR", "fingerAR", "fingerBR", "fingerCR"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: any) {
  const bone = J.hips;
  const R = rng(11);
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  // Courses: fillet, plinth, upper moulding
  box(1.38, 0.04, 1.64, 0, 0.02, 0, P.stoneDark);
  box(1.4, 0.12, 1.66, 0, 0.1, 0, P.stoneMid);
  box(1.44, 0.07, 1.7, 0, 0.185, 0, P.stoneLight);
  // top surface slab kept flat at 0.22
  box(1.4, 0.01, 1.66, 0, 0.2175, 0, P.stoneLight);
  // mortar joints
  for (const y of [0.07, 0.13]) {
    box(1.41, 0.004, 1.67, 0, y, 0, P.mortar);
  }
  for (let i = -3; i <= 3; i++) {
    box(0.006, 0.12, 0.004, i * 0.2 + 0.05, 0.1, 0.834, P.mortar);
  }
  for (let i = -3; i <= 3; i++) {
    for (const s of [1, -1]) box(0.004, 0.12, 0.006, s * 0.702, 0.1, i * 0.23, P.mortar);
  }
  // arches on front and sides
  const arch = (x: number, y: number, z: number, nx: number, nz: number) => {
    const dir: [number, number, number] = [nx, 0, nz];
    b.part(new THREE.BoxGeometry(0.1, 0.075, 0.012), P.stoneShadow, { bone, at: [x, y - 0.01, z], dir, axis: "z" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 3), P.stoneShadow, {
      bone, at: [x + nx * 0.0, y + 0.04, z + nz * 0.0], dir, axis: "y",
      rotation: nz ? [90, 0, 0] : [0, 0, 90],
    });
  };
  const quatre = (x: number, y: number, z: number, nx: number, nz: number) => {
    const dir: [number, number, number] = [nx, 0, nz];
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.008, 8), P.stoneShadow, { bone, at: [x, y, z], dir, axis: "y", rotation: nz ? [90, 0, 0] : [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), P.stoneMid, { bone, at: [x, y, z], rotation: nz ? [90, 0, 0] : [0, 0, 90] });
  };
  for (let i = -3; i <= 3; i++) {
    arch(i * 0.2 + 0.05 - 0.0, 0.1, 0.836, 0, 1);
    arch(i * 0.2 + 0.05, 0.1, 0.836, 0, 1);
  }
  for (let i = -3; i <= 3; i++) {
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.012, 0.075, 0.1), P.stoneShadow, { bone, at: [s * 0.703, 0.1, i * 0.23] });
      quatre(s * 0.71, 0.185, i * 0.23, s, 0);
    }
  }
  for (let i = -3; i <= 3; i++) quatre(i * 0.2 + 0.05, 0.185, 0.852, 0, 1);
  // cracks
  for (let i = 0; i < 4; i++) {
    box(0.1, 0.004, 0.004, -0.4 + i * 0.05, 0.12 - i * 0.02 * (i % 2 ? -1 : 1), 0.836, P.crack);
  }
  // chipped corner wedge
  b.part(new THREE.ConeGeometry(0.06, 0.07, 3), P.stoneShadow, { bone, at: [-0.7, 0.2, 0.83], rotation: [0, 30, 180] });
  // weathering
  for (let i = 0; i < 12; i++) {
    const x = (R() - 0.5) * 1.3, z = (R() - 0.5) * 1.5;
    if (Math.abs(x) < 0.5 && z > -0.85 && z < 0.7) continue;
    b.part(new THREE.CylinderGeometry(0.04 + R() * 0.03, 0.04, 0.012, 6), i % 3 ? P.mossGreen : P.mossDark, { bone, at: [x, 0.222, z] });
  }
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 7), P.lichen, { bone, at: [0.55 + R() * 0.12, 0.2235, -0.7 + R() * 1.4] });
  }
  for (const [x, z] of [[-0.6, 0.78], [0.62, 0.8], [0.1, 0.8]]) {
    b.part(new THREE.CylinderGeometry(0.035, 0.03, 0.006, 6), P.birdLime, { bone, at: [x, 0.2235, z] });
    box(0.03, 0.1, 0.004, x, 0.14, 0.853, P.birdLime);
  }
  for (let i = 0; i < 7; i++) {
    box(0.015, 0.12 + R() * 0.05, 0.004, -0.65 + i * 0.22, 0.12, 0.855, i % 2 ? P.stain : P.rustStain);
  }
}
```

<!-- call: limbs -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildLimbs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const pal = (k: string, d: string) => (P && (P as any)[k]) || d;
  const LIGHT = pal("stoneLight", "#aca998"), MID = pal("stoneMid", "#8c897d"), DARK = pal("stoneDark", "#615f58");
  const SH = pal("stoneShadow", "#3f3e3a"), MOSS = pal("mossGreen", "#5f7442"), CLAW = pal("claw", "#4b4944");
  const STAIN = pal("stain", "#35332f"), CRACK = pal("crack", "#262524"), LICHEN = pal("lichen", "#b9b36d");
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, l: number, s = 6) => new THREE.ConeGeometry(r, l, s);

  const ball = (r: number, at: number[], c: string, bone: any, sc: number[] = [1, 1, 1]) =>
    b.part(sph(r), c, { bone, at, scale: sc, flat: true });

  const claw = (at: number[], dir: number[], len: number, r: number, bone: any) =>
    b.part(cone(r, len, 5), CLAW, { bone, at, dir, flat: true });

  const tube = (pts: number[][], r: number | number[], c: string, bone: any) =>
    b.sweep(catmull(pts), r, { color: c, bone, sides: 6, smooth: false });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = J["hipH" + S], knee = J["kneeH" + S], ank = J["ankleH" + S], foot = J["footH" + S];
    const sh = J["shoulder" + S], el = J["elbow" + S], wr = J["wrist" + S], hand = J["hand" + S];

    // ---- hind leg
    const hp = [0.28 * s, 0.62, -0.3], kn = [0.42 * s, 0.5, -0.05], an = [0.32 * s, 0.3, -0.32];
    ball(0.17, [0.3 * s, 0.6, -0.3], MID, hip, [1, 1.05, 1.15]);
    ball(0.11, [0.32 * s, 0.74, -0.3], LIGHT, hip, [1.1, 0.5, 1.2]);
    ball(0.05, [0.33 * s, 0.8, -0.3], MOSS, hip, [1.3, 0.4, 1.3]);
    tube([hp, [0.36 * s, 0.56, -0.17], kn], [0.13, 0.095], MID, hip);
    tube([kn, [0.37 * s, 0.4, -0.2], an], [0.085, 0.06], MID, knee);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), DARK, { bone: knee, at: [0.5 * s, 0.5, -0.05], dir: [1, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6), LIGHT, { bone: knee, at: [0.52 * s, 0.5, -0.05], dir: [1, 0, 0], flat: true });
    b.part(sph(0.025, 6, 4), LICHEN, { bone: knee, at: [0.54 * s, 0.53, -0.04] });
    b.part(cone(0.04, 0.12, 5), LIGHT, { bone: ank, at: [0.32 * s, 0.32, -0.42], dir: [0, 0.3, -1], flat: true });
    for (let i = 0; i < 2; i++)
      b.part(new THREE.BoxGeometry(0.012, 0.16, 0.012), STAIN, { bone: knee, at: [0.43 * s + (i - 0.5) * 0.05, 0.38, -0.12 - i * 0.02] });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.012), CRACK, { bone: hip, at: [0.38 * s, 0.7, -0.22], rotation: [0, 0, 25] });
    // foot
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.3), MID, { bone: foot, at: [0.32 * s, 0.26, -0.14], flat: true });
    ball(0.08, [0.32 * s, 0.3, -0.3], MID, ank);
    for (let t = -1; t <= 1; t++) {
      const x = (0.32 + t * 0.055) * s;
      b.part(new THREE.BoxGeometry(0.05, 0.045, 0.14), LIGHT, { bone: foot, at: [x, 0.252, 0.06], flat: true });
      claw([x, 0.245, 0.17], [0, -0.2, 1], 0.08, 0.022, foot);
    }
    claw([0.32 * s, 0.26, -0.3], [0, 0.1, -1], 0.06, 0.02, foot);

    // ---- foreleg
    const sp = [0.27 * s, 0.82, 0.2], ep = [0.34 * s, 0.52, 0.15], wp = [0.3 * s, 0.32, 0.4];
    ball(0.16, sp, MID, sh, [1.05, 1, 1]);
    ball(0.09, [0.3 * s, 0.93, 0.2], LIGHT, sh, [1.2, 0.5, 1.2]);
    ball(0.04, [0.3 * s, 0.97, 0.2], MOSS, sh, [1.3, 0.4, 1.3]);
    b.part(new THREE.TorusGeometry(0.15, 0.02, 4, 8), DARK, { bone: sh, at: [0.28 * s, 0.76, 0.2], dir: [0, 1, 0], flat: true, axis: "z" });
    tube([sp, [0.31 * s, 0.67, 0.18], ep], [0.11, 0.085], MID, sh);
    b.part(cone(0.05, 0.14, 5), LIGHT, { bone: el, at: [0.42 * s, 0.5, 0.06], dir: [s, 0.2, -0.7], flat: true });
    ball(0.07, ep, LIGHT, el);
    tube([ep, [0.32 * s, 0.42, 0.28], wp], [0.08, 0.065], MID, el);
    for (let i = 0; i < 3; i++) {
      const f = 0.3 + i * 0.25;
      b.part(new THREE.TorusGeometry(0.075 - i * 0.004, 0.012, 4, 8), DARK, { bone: el, at: [0.32 * s, 0.52 - f * 0.2 + 0.02, 0.15 + f * 0.25], dir: [0, -0.5, 1], flat: true, axis: "z" });
    }
    b.part(new THREE.BoxGeometry(0.01, 0.15, 0.012), STAIN, { bone: el, at: [0.4 * s, 0.42, 0.22], rotation: [20, 0, 0] });
    // hand
    b.part(new THREE.BoxGeometry(0.17, 0.07, 0.14), MID, { bone: hand, at: [0.3 * s, 0.27, 0.46], flat: true });
    for (let t = -1; t <= 1; t++) {
      const x = (0.3 + t * 0.06) * s;
      b.part(new THREE.BoxGeometry(0.045, 0.045, 0.14), MID, { bone: hand, at: [x, 0.25, 0.58], flat: true });
      ball(0.03, [x, 0.285, 0.52], LIGHT, hand);
      claw([x, 0.245, 0.67], [0, -0.2, 1], 0.07, 0.02, hand);
    }
    b.part(new THREE.BoxGeometry(0.04, 0.04, 0.1), MID, { bone: hand, at: [(0.3 + 0.12) * s, 0.25, 0.48], rotation: [0, 25 * s, 0], flat: true });
    claw([0.45 * s, 0.245, 0.55], [0.4 * s, -0.1, 1], 0.06, 0.018, hand);
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, polyline } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, s1 = J.spine1, s2 = J.spine2;

  // torso loft
  const stations = [
    { at: [0, 0.62, -0.42], w: 0.44, h: 0.42 },
    { at: [0, 0.64, -0.3], w: 0.46, h: 0.44 },
    { at: [0, 0.7, -0.05], w: 0.38, h: 0.38 },
    { at: [0, 0.82, 0.2], w: 0.5, h: 0.5 },
    { at: [0, 0.9, 0.32], w: 0.44, h: 0.42 },
  ];
  b.loft(stations, { bone: [hips, s1, s2], color: P.stoneMid, section: { ngon: 8 } });
  // belly
  b.loft([
    { at: [0, 0.5, -0.3], w: 0.3, h: 0.14 },
    { at: [0, 0.54, -0.05], w: 0.26, h: 0.14 },
    { at: [0, 0.62, 0.2], w: 0.34, h: 0.14 },
  ], { bone: [hips, s1, s2], color: P.stoneDark, section: "box" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const ball = (r: number, c: string, at: number[], bone: any, sc?: number[]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), c, { bone, at, scale: sc, flat: true });

  // shoulder & hip masses
  for (const s of [1, -1]) {
    ball(0.17, P.stoneMid, [s * 0.27, 0.82, 0.2], s2);
    ball(0.13, P.stoneLight, [s * 0.2, 0.95, 0.06], s2, [1.3, 0.5, 1.4]);
    ball(0.22, P.stoneMid, [s * 0.28, 0.62, -0.3], hips);
    ball(0.06, P.mossGreen, [s * 0.27, 0.96, 0.2], s2, [1.4, 0.4, 1.4]);
    ball(0.05, P.mossGreen, [s * 0.26, 0.82, -0.3], hips, [1.4, 0.4, 1.4]);
    // ribs
    for (let i = 0; i < 4; i++)
      box(0.02, 0.025, 0.14, P.stoneDark, [s * 0.255, 0.68 + i * 0.045, -0.03 + i * 0.05], i < 2 ? s1 : s2);
    // stain
    box(0.012, 0.2, 0.03, P.stain, [s * 0.262, 0.7, 0.1], s2);
  }
  // trapezius hump
  ball(0.2, P.stoneLight, [0, 0.98, 0.18], s2, [1.4, 0.8, 1.2]);
  ball(0.07, P.mossGreen, [0, 1.06, 0.16], s2, [1.5, 0.4, 1.3]);

  // chest scallops
  for (let r = 0; r < 3; r++)
    for (let i = -2 + (r % 2 ? 0.5 : 0); i <= 2; i++) {
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 6), P.stoneLight, {
        bone: s2, at: [i * 0.07, 0.72 + r * 0.05, 0.42 - r * 0.02], rotation: [70, 0, 0],
      });
    }
  // gothic emblem
  const arch = [[-0.07, 0], [0.07, 0], [0.07, 0.08], [0, 0.17, "sharp"], [-0.07, 0.08]] as any;
  b.extrude(arch, { at: [0, 0.78, 0.455], x: [-1, 0, 0], thickness: 0.02, color: P.stoneDark, bone: s2 });
  const arch2 = arch.map((p: any) => [p[0] * 0.6, p[1] * 0.6 + 0.01, p[2]]) as any;
  b.extrude(arch2, { at: [0, 0.79, 0.468], x: [-1, 0, 0], thickness: 0.02, color: P.stoneShadow, bone: s2 });

  // sash band with trefoil
  box(0.5, 0.06, 0.4, P.stoneWarm, [0, 0.67, -0.12], s1);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09;
    ball(0.02, P.stoneShadow, [Math.sin(a) * 0.022, 0.62 + Math.cos(a) * 0.022, 0.1], s1, [1, 1, 0.4]);
  }

  // dorsal ridge
  const pts: number[][] = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 0.3 - t * 0.7, y = 1.0 - t * 0.3 + (t > 0.3 ? 0 : 0.03);
    const bone = t < 0.3 ? s2 : t < 0.6 ? s1 : hips;
    b.part(new THREE.ConeGeometry(0.05 - t * 0.015, 0.1, 4), P.stoneLight, { bone, at: [0, y + 0.1 - t * 0.02, z] });
    box(0.1, 0.03, 0.08, P.stoneDark, [0, y + 0.03, z], bone);
  }

  // tail
  const tailPath = catmull([
    [0, 0.6, -0.45], [0, 0.5, -0.72], [0.22, 0.33, -0.78], [0.45, 0.28, -0.72], [0.54, 0.28, -0.5],
  ]);
  const tail = b.sweep(tailPath, (t: number) => 0.07 - 0.03 * t, {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5], color: P.stoneMid, sides: 8,
  });
  b.along(tail, 8, (at: any) => {
    b.spike(at, at, 0.06, 0.02, { color: P.stoneLight });
  });
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    b.ring(tailPath.at(t) && frame(tailPath.at(t), tailPath.tangentAt(t)), { count: 1, radius: 0 }, () => {});
    b.part(new THREE.TorusGeometry(0.06 - 0.025 * t, 0.012, 5, 8), P.stoneDark, {
      at: tailPath.at(t), dir: tailPath.tangentAt(t), axis: "z", bone: [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5][Math.min(4, Math.floor(t * 5))],
    });
  }
  // spade tip
  const spade = [[0, 0], [0.06, 0.05], [0.08, 0.12], [0, 0.22, "sharp"], [-0.08, 0.12], [-0.06, 0.05]] as any;
  b.extrude(spade, { at: [0.54, 0.285, -0.48], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, color: P.stoneLight, bone: J.tail5 });
  b.extrude(spade.map((p: any) => [p[0] * 0.5, p[1] * 0.5 + 0.03, p[2]]) as any, {
    at: [0.54, 0.305, -0.48], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: P.stoneShadow, bone: J.tail5,
  });

  // lichen and cracks
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 6), P.lichen, {
      bone: s1, at: [(R() - 0.5) * 0.3, 0.9, -0.1 + R() * 0.3],
    });
  }
  box(0.01, 0.12, 0.01, P.crack, [0.2, 0.7, -0.35], hips, [0, 0, 20]);
  box(0.01, 0.1, 0.01, P.crack, [-0.2, 0.72, -0.3], hips, [0, 0, -25]);
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw;
  const n1 = J.neck1, n2 = J.neck2;

  // Neck
  b.sweep([[0, 0.93, 0.34], [0, 1.02, 0.46], [0, 1.1, 0.58]], [0.19, 0.16], { bone: [n1, n2, head], color: P.stoneMid });

  // Mane blades behind head
  for (let i = 0; i < 9; i++) {
    const a = -70 + i * 17.5;
    const x = Math.sin(a * Math.PI / 180) * 0.2;
    const y = 1.1 + Math.cos(a * Math.PI / 180) * 0.1;
    const dirv: [number, number, number] = [x * 1.2, 0.5, -0.8];
    b.spike([x, y, 0.5], dirv, 0.2, 0.05, { bone: n2, color: i % 2 ? P.stoneLight : P.stoneDark });
    b.spike([x, y + 0.04, 0.52], dirv, 0.12, 0.035, { bone: n2, color: P.stoneLight });
  }

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], bone = head) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const ball = (r: number, c: string, at: number[], sc?: number[], bone = head) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at, scale: sc, flat: true });

  // Skull and snout
  box(0.44, 0.34, 0.38, P.stoneMid, [0, 1.15, 0.72]);
  box(0.4, 0.1, 0.36, P.stoneLight, [0, 1.34, 0.72]);
  box(0.3, 0.17, 0.26, P.stoneMid, [0, 1.07, 0.9]);
  box(0.32, 0.06, 0.2, P.stoneWarm, [0, 1.17, 0.88], [-12, 0, 0]);
  // Brow
  box(0.46, 0.07, 0.14, P.stoneDark, [0, 1.25, 0.88], [12, 0, 0]);
  for (const s of [1, -1]) {
    box(0.2, 0.06, 0.13, P.stoneDark, [s * 0.12, 1.28, 0.9], [18, -s * 10, 0]);
    // Sockets, glowing pupils
    ball(0.06, P.eyeSocket, [s * 0.12, 1.2, 0.9], [1, 0.9, 0.6]);
    b.part(new THREE.SphereGeometry(0.028, 8, 6), P.eyeGlow, { bone: head, at: [s * 0.12, 1.2, 0.935] });
    // Cheeks
    box(0.1, 0.1, 0.2, P.stoneWarm, [s * 0.23, 1.08, 0.78], [0, 0, s * 10]);
    ball(0.07, P.stoneLight, [s * 0.22, 1.02, 0.7], [1, 0.8, 1.2]);
    // Nostrils
    ball(0.045, P.stoneDark, [s * 0.09, 1.1, 1.03], [1, 0.8, 0.8]);
    b.part(new THREE.SphereGeometry(0.022, 6, 4), P.stoneShadow, { bone: head, at: [s * 0.09, 1.1, 1.065] });
    // Stain streaks
    box(0.02, 0.18, 0.01, P.stain, [s * 0.14, 1.07, 0.955]);
    // Horns
    const hb = [s * 0.14, 1.32, 0.68];
    b.sweep([hb, [s * 0.2, 1.4, 0.62], [s * 0.2, 1.46, 0.5], [s * 0.15, 1.45, 0.42]], [0.05, 0.01],
      { bone: head, color: (t: number) => (t < 0.55 ? P.stoneLight : P.stoneDark), caps: { end: "point" }, sides: 6 });
    for (const t of [0.0, 0.1]) ball(0.055 - t * 0.2, P.stoneDark, [s * 0.15, 1.34 + t, 0.67 - t * 0.5], [1, 0.5, 1]);
    ball(0.04, P.mossGreen, [s * 0.14, 1.36, 0.69], [1.2, 0.4, 1.2]);
    // Ears
    b.extrude([[0, 0], [0.12, 0.02], [0.08, 0.2, "sharp"], [0.01, 0.1]], {
      at: [s * 0.2, 1.3, 0.55], x: [s, 0, -0.3], thickness: 0.02, bone: head, color: P.stoneMid });
    b.extrude([[0.02, 0.02], [0.08, 0.03], [0.07, 0.14], [0.02, 0.08]], {
      at: [s * 0.205, 1.31, 0.56], x: [s, 0, -0.3], thickness: 0.025, bone: head, color: P.stoneDark });
    // Upper fangs
    b.spike([s * 0.1, 1.0, 1.02], [0, -1, 0], 0.07, 0.022, { bone: head, color: P.tooth });
    b.spike([s * 0.03, 1.0, 1.04], [0, -1, 0], 0.04, 0.014, { bone: head, color: P.tooth });
    // Lower tusks
    b.spike([s * 0.11, 0.98, 1.0], [0, 1, 0.1], 0.1, 0.02, { bone: jaw, color: P.tooth });
    // Lichen
    ball(0.02, P.lichen, [s * 0.1, 1.325, 0.8], [1, 0.3, 1]);
  }
  // Mouth interior and upper lip
  box(0.28, 0.04, 0.24, P.stoneShadow, [0, 1.0, 0.88]);
  box(0.3, 0.04, 0.12, P.stoneDark, [0, 1.01, 1.0]);

  // Lower jaw
  box(0.3, 0.07, 0.3, P.stoneMid, [0, 0.96, 0.88], [0, 0, 0], jaw);
  box(0.24, 0.09, 0.1, P.stoneLight, [0, 0.95, 1.02], [0, 0, 0], jaw);
  box(0.22, 0.015, 0.2, P.tongue, [0, 1.0, 0.88], [0, 0, 0], jaw);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.05;
    b.spike([x, 0.93, 0.98], [x * 2, -1, 0.2], 0.1 - Math.abs(i - 2) * 0.015, 0.03, { bone: jaw, color: i % 2 ? P.stoneDark : P.stoneLight });
  }
  box(0.04, 0.12, 0.01, P.stain, [0.12, 0.98, 1.075], [0, 0, 0], jaw);
  box(0.04, 0.12, 0.01, P.stain, [-0.12, 0.98, 1.075], [0, 0, 0], jaw);

  // Forehead cross
  box(0.02, 0.09, 0.012, P.stoneShadow, [0, 1.29, 0.91], [10, 0, 0]);
  box(0.06, 0.02, 0.012, P.stoneShadow, [0, 1.3, 0.912], [10, 0, 0]);
  // Moss/cracks
  ball(0.035, P.mossGreen, [0, 1.38, 0.8], [1.6, 0.3, 1.3]);
  ball(0.03, P.mossDark, [0.08, 1.375, 0.7], [1.3, 0.3, 1]);
  box(0.01, 0.07, 0.01, P.crack, [0.2, 1.4, 0.58], [0, 0, 25]);
  void R; void M;
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["wingShoulder" + side], el = J["wingElbow" + side], wr = J["wingWrist" + side];
    const fj = [J["fingerA" + side], J["fingerB" + side], J["fingerC" + side]];
    const p = (x: number, y: number, z: number) => V(s * x, y, z);
    const S = p(0.18, 0.97, 0.05), E = p(0.42, 1.18, -0.05), W = p(0.6, 1.25, -0.25);
    const dirs = [p(0.4, 0.5, -0.7), p(0.5, 0, -0.8), p(0.2, -0.6, -0.8)].map((d) => d.normalize());
    const lens = [0.5, 0.4, 0.38];
    const tips = dirs.map((d, i) => W.clone().addScaledVector(d, lens[i]));
    const body = p(0.1, 0.92, -0.2);

    // arm
    b.sweep([S, E, W], [0.055, 0.04], { bone: [sh, el, wr], color: P.stoneMid, sides: 8 });
    b.sweep([S.clone().add(V(0, 0.05, 0)), E.clone().add(V(0, 0.045, 0)), W.clone().add(V(0, 0.04, 0))], 0.018, { bone: [sh, el, wr], color: P.stoneLight, sides: 6 });
    b.part(new THREE.SphereGeometry(0.075, 7, 5), P.stoneDark, { at: S, bone: sh });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), P.stoneLight, { at: E, bone: el });
    b.spike(E, V(s * 0.3, 0.9, -0.2), 0.09, 0.025, { bone: el, color: P.stoneLight });
    b.part(new THREE.SphereGeometry(0.052, 6, 5), P.stoneLight, { at: W, bone: wr });
    b.spike(W, V(s * 0.3, 0.35, 0.9), 0.14, 0.03, { bone: wr, color: P.claw });

    // fingers
    tips.forEach((t, i) => {
      b.rod(W, t, [0.032, 0.012], { bone: fj[i], color: P.stoneLight, sides: 6 });
      b.spike(t, dirs[i], 0.07, 0.018, { bone: fj[i], color: P.stoneDark });
      b.rod(W.clone().add(V(0, 0.03, 0)), t.clone().add(V(0, 0.015, 0)), 0.008, { bone: fj[i], color: P.stoneLight, sides: 4 });
    });

    // membranes
    const mem = (a: THREE.Vector3[], c: THREE.Vector3[], bone: any) =>
      b.membrane(a, c, { color: P.wingStone, thickness: 0.02, bone, scallop: 0.15, rows: 3 });
    mem([W, tips[0]], [W.clone().add(V(0, -0.01, 0)), tips[1]], wr);
    mem([W.clone().add(V(0, -0.02, 0)), tips[1]], [W.clone().add(V(0, -0.03, 0)), tips[2]], wr);
    mem([E, W.clone().add(V(0, -0.02, 0))], [body, tips[2]], el);

    // carved details per panel
    const arch = (o: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, k: number) => {
      const mid = a.clone().add(c).multiplyScalar(0.5);
      const c0 = o.clone().lerp(mid, 0.6);
      const x = mid.clone().sub(o).normalize();
      let n = x.clone().cross(c.clone().sub(a)).normalize();
      if (n.y < 0) n.negate();
      const y = n.clone().cross(x).normalize();
      const w = 0.045 * k, h = 0.1 * k;
      const out = (w: number, h: number): any => [[-w, 0], [w, 0], [w, h * 0.6], [0, h, "sharp"], [-w, h * 0.6]];
      b.extrude(out(w, h), { at: c0.clone().addScaledVector(n, 0.011), x, y, thickness: 0.008, color: P.stoneShadow, bone: wr });
      b.extrude(out(w * 0.6, h * 0.75), { at: c0.clone().addScaledVector(n, 0.016).addScaledVector(y, 0.01), x, y, thickness: 0.006, color: P.stoneDark, bone: wr });
      for (let i = 0; i < 3; i++) {
        const q = o.clone().lerp(mid, 0.82).addScaledVector(x, 0.0).addScaledVector(c.clone().sub(a).normalize(), (i - 1) * 0.07).addScaledVector(n, 0.012);
        b.extrude([[-0.012, 0], [0, 0.03, "sharp"], [0.012, 0], [0, -0.015]] as any, { at: q, x, y, thickness: 0.006, color: P.stoneMid, bone: wr });
      }
    };
    arch(W, tips[0], tips[1], 1);
    arch(W, tips[1], tips[2], 0.9);
    arch(E, W, tips[2], 1.1);

    // weathering: moss on arm top, lichen, stains, cracks, chip
    for (let i = 0; i < 4; i++) {
      const t = 0.1 + i * 0.22;
      const q = S.clone().lerp(E, Math.min(t * 1.6, 1));
      if (t > 0.6) q.copy(E).lerp(W, (t - 0.6) * 2);
      const m = b.part(new THREE.SphereGeometry(0.03 + R() * 0.015, 5, 4), i % 2 ? P.mossDark : P.mossGreen, { at: q.add(V(0, 0.06, 0)), bone: i < 2 ? sh : el });
      m.mesh.scale.y = 0.35;
    }
    for (let i = 0; i < 3; i++) {
      const q = W.clone().lerp(tips[i], 0.4).add(V(0, 0.03, 0));
      const l = b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 7), P.lichen, { at: q, bone: wr });
      l.mesh.scale.set(1, 1, 1);
    }
    for (let i = 0; i < 3; i++) {
      const a = W.clone().lerp(tips[i], 0.7).add(V(0, 0.02, 0));
      b.rod(a, a.clone().add(V(0, -0.14 - R() * 0.05, 0)), 0.006, { color: i == 1 ? P.rustStain : P.stain, bone: wr, sides: 4, caps: "flat" });
    }
    const c0 = W.clone().lerp(tips[1], 0.5).add(V(0, 0.03, 0));
    const zz = [V(0, 0, 0), V(s * 0.03, 0.025, -0.01), V(s * 0.02, 0.05, -0.04), V(s * 0.06, 0.07, -0.05)].map((v) => c0.clone().add(v));
    for (let i = 0; i < 3; i++) b.rod(zz[i], zz[i + 1], 0.004, { color: P.crack, bone: wr, sides: 4, caps: "flat" });
    const chip = tips[2].clone().lerp(W, 0.2);
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.04), P.stoneShadow, { at: chip, bone: wr, rotation: [20, 30, 10] });
  }
}
```