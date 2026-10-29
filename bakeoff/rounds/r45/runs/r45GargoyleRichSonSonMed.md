<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A weathered gothic stone gargoyle crouched on a cathedral ledge, wings spread in a rest pose, fangs bared, with moss and rain stains in the crevices.",
  "builderName": "cathedralGargoyle",
  "size": [1.9, 1.5, 1.75],
  "layout": "Everything is carved stone: chunky, faceted, chisel-blocky shapes with bold readable proportions and no soft organic detail. A stone ledge (1.7 wide, 0.22 high, z -0.8..0.85) is the only floor contact. The gargoyle crouches on it in a predatory squat. The heavy haunches and hind feet are planted at z -0.1..0.15. The tail runs back from the hips along the ledge, then curls to the model's left (+X) and ends in a spade. The barrel chest rises forward of the hips. Massive shoulders carry long forearms that are planted on the ledge, with big clawed hands at z about 0.6. The neck rises from the chest. The oversized head thrusts forward and slightly up, with a broad snout, an open mouth with a separate upper and lower jaw, big fangs, heavy brow ridges, curled ram-like horns, bat-like pointed ears and glaring amber eyes. A pair of bat wings with bony fingers is spread up and back from the shoulders in a rest T-pose, reaching x +-0.95, with stone-slab membranes. The silhouette is a hunched triangle topped by wings and horns. Style on every part: facets and flat planes, visible chisel-edge highlights as small lighter wedge parts, cracks as thin dark parts, and weathering coloured by place. Moss and lichen sit on upward faces and in crevices, soot and rain streaks run down vertical faces below ledges and brows, and the underside and the feet are darker. A gothic ornament motif (pointed arch, trefoil or quatrefoil) repeats on the ledge front, the chest plate, the bracers and the wing membrane ribs. The model is left-right symmetric: build the L side (+X) and the R side (-X) with `for (const s of [1, -1])`. Parts may add their own finer joints (fingers, toes, wing fingers, jaw bones) under the listed joints, with names prefixed by their part (e.g. fingerL1, toeL1, wfingerL1).",
  "palette": {
    "stone": "#8d8a82",
    "stoneLight": "#b3afa3",
    "stoneHi": "#cfcabb",
    "stoneDark": "#5f5d58",
    "stoneShadow": "#3f3e3c",
    "ledge": "#a39f93",
    "mortar": "#4a4843",
    "membrane": "#7a766d",
    "membraneEdge": "#9a968b",
    "moss": "#5d7a3c",
    "mossDark": "#3f5a2a",
    "lichen": "#a9b27a",
    "crack": "#2e2c2a",
    "rainStain": "#6f6e66",
    "soot": "#47443f",
    "mouth": "#2a2523",
    "eyeGlow": "#ffb23a",
    "eyePupil": "#2b1405",
    "iron": "#3a3a40"
  },
  "mounts": {
    "ledgeTop": [0, 0.22, 0],
    "ledgeFront": [0, 0.22, 0.85],
    "ledgeBack": [0, 0.22, -0.8],
    "hipsCenter": [0, 0.6, -0.25],
    "chestCenter": [0, 0.76, 0.2],
    "tailRoot": [0, 0.5, -0.4],
    "neckBase": [0, 0.88, 0.3],
    "headCenter": [0, 1.1, 0.52],
    "jawHinge": [0, 1.04, 0.58],
    "shoulderL": [0.26, 0.8, 0.2],
    "shoulderR": [-0.26, 0.8, 0.2],
    "hipSocketL": [0.27, 0.6, -0.22],
    "hipSocketR": [-0.27, 0.6, -0.22],
    "handContactL": [0.3, 0.25, 0.62],
    "handContactR": [-0.3, 0.25, 0.62],
    "footContactL": [0.34, 0.25, 0.12],
    "footContactR": [-0.34, 0.25, 0.12],
    "wingRootL": [0.2, 0.92, 0.1],
    "wingRootR": [-0.2, 0.92, 0.1]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.6, -0.25], "dir": [0, 0.3, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 0.66, -0.05], "dir": [0, 0.4, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 0.76, 0.2], "dir": [0, 0.8, 0.6], "role": "spine" },
    { "name": "neck1", "parent": "spine2", "at": [0, 0.9, 0.32], "dir": [0, 1, 0.6], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.0, 0.42], "dir": [0, 0.6, 1], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.08, 0.5], "dir": [0, 0.15, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.04, 0.58], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.5, -0.4], "dir": [0, -0.1, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.4, -0.6], "dir": [0, -0.05, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0.15, 0.3, -0.68], "dir": [0.7, 0, -0.7], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0.35, 0.3, -0.58], "dir": [0.9, 0, 0.3], "role": "tail" },
    { "name": "shoulderL", "parent": "spine2", "at": [0.26, 0.8, 0.2], "dir": [0.3, -0.8, 0.6], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.3, 0.55, 0.38], "dir": [0, -0.6, 0.8], "role": "arm" },
    { "name": "wristL", "parent": "elbowL", "at": [0.3, 0.3, 0.52], "dir": [0, -0.3, 1], "role": "arm" },
    { "name": "handL", "parent": "wristL", "at": [0.3, 0.25, 0.62], "dir": [0, 0, 1], "role": "arm" },
    { "name": "shoulderR", "parent": "spine2", "at": [-0.26, 0.8, 0.2], "dir": [-0.3, -0.8, 0.6], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.3, 0.55, 0.38], "dir": [0, -0.6, 0.8], "role": "arm" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.3, 0.3, 0.52], "dir": [0, -0.3, 1], "role": "arm" },
    { "name": "handR", "parent": "wristR", "at": [-0.3, 0.25, 0.62], "dir": [0, 0, 1], "role": "arm" },
    { "name": "hipL", "parent": "hips", "at": [0.27, 0.6, -0.22], "dir": [0.3, -0.3, 0.9], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.4, 0.5, 0.15], "dir": [-0.2, -0.3, -1], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.33, 0.32, -0.12], "dir": [0, -0.5, 0.8], "role": "leg" },
    { "name": "footL", "parent": "ankleL", "at": [0.34, 0.25, 0.12], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "hips", "at": [-0.27, 0.6, -0.22], "dir": [-0.3, -0.3, 0.9], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.4, 0.5, 0.15], "dir": [0.2, -0.3, -1], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.33, 0.32, -0.12], "dir": [0, -0.5, 0.8], "role": "leg" },
    { "name": "footR", "parent": "ankleR", "at": [-0.34, 0.25, 0.12], "dir": [0, 0, 1], "role": "leg" },
    { "name": "wingShoulderL", "parent": "spine2", "at": [0.2, 0.92, 0.1], "dir": [0.5, 0.8, -0.3], "role": "wing" },
    { "name": "wingElbowL", "parent": "wingShoulderL", "at": [0.5, 1.3, -0.2], "dir": [0.8, -0.2, -0.3], "role": "wing" },
    { "name": "wingWristL", "parent": "wingElbowL", "at": [0.85, 1.15, -0.35], "dir": [0.5, -0.5, -0.3], "role": "wing" },
    { "name": "wingShoulderR", "parent": "spine2", "at": [-0.2, 0.92, 0.1], "dir": [-0.5, 0.8, -0.3], "role": "wing" },
    { "name": "wingElbowR", "parent": "wingShoulderR", "at": [-0.5, 1.3, -0.2], "dir": [-0.8, -0.2, -0.3], "role": "wing" },
    { "name": "wingWristR", "parent": "wingElbowR", "at": [-0.85, 1.15, -0.35], "dir": [-0.5, -0.5, -0.3], "role": "wing" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The cathedral ledge the gargoyle crouches on, carved stone in 'ledge' with 'mortar' joints. A chunky slab (x +-0.85, z -0.8..0.85, y 0..0.22) with a stepped cornice lip along the front and sides (small stacked boxes in stoneLight with stoneHi chisel-edge wedges on top). Dentil blocks run along the front lip. A row of three pointed-arch or quatrefoil relief panels is built from small dark extrudes in stoneDark on the front face. Two corbel blocks sit under the front corners. Mortar lines appear as thin dark boxes forming block courses on the front and side faces. One iron cramp (iron) is set into the top near the back. Weathering: moss and lichen patches on the top (moss, mossDark, lichen) especially at the back corners and around the feet and hand contact points (leave the contact spots as bare stone), rain stain and soot streaks running down the front face below the gargoyle, thin crack parts. A small worn drain groove runs under the front lip. Do not build anything above y 0.25 except moss tufts and small stone chips.",
      "box": [[-0.85, 0, -0.8], [0.85, 0.22, 0.85]],
      "attaches": "Top face at mount ledgeTop (y 0.22) carries the hands (handContactL/R), feet (footContactL/R) and tail. No joints: rigid static geometry on the root joint (bone hips) at its own absolute coordinates.",
      "joints": ["hips"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "torso",
      "builds": "The torso and tail, in stone/stoneDark. A bulky loft/sweep body from the hipsCenter through spine1 to the chestCenter (spine2), with a barrel chest (wider, about 0.4 across), a narrower waist and a heavy pelvis block of the hips, all with faceted chisel planes. A paler belly plate (stoneLight) with horizontal rib-band relief. A chest plate with a trefoil or pointed-arch emblem built from small dark parts in stoneDark outlined in stoneHi. A dorsal ridge of overlapping triangular spine blades running from the neck base along the back to the tail root (stoneDark, with stoneHi edges). Pec and trapezius masses that blend into the shoulders (the arms part starts at the shoulder joints). A hip mass with a loincloth-like stone slab hanging between the legs is optional. The tail follows the tail1..tail4 joints along the ledge and curls to +X, tapering with small ridge fins on top, and ends in a carved spade-shaped tip (extruded diamond, stoneDark with stoneHi rim). Weathering: moss on the top of the shoulders and back, soot under the belly, cracks across the chest and tail, rain stains on the flanks.",
      "box": [[-0.45, 0.25, -0.75], [0.5, 1.0, 0.35]],
      "attaches": "Neck begins at neckBase on spine2 (the head part builds the neck). Thighs start at hipSocketL/R and shoulders at shoulderL/R, and wing roots start at wingRootL/R, all built by other parts. The tail lies on the ledge top (ledgeTop, y 0.22, tail axis y >= 0.3). Rides hips, spine1, spine2, tail1..tail4.",
      "joints": ["hips", "spine1", "spine2", "tail1", "tail2", "tail3", "tail4"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "head",
      "builds": "The neck and head, the signature feature with the richest construction. The neck is a thick sweep over neck1 and neck2 with a stone mane ridge of blades. The head is a big blocky skull at headCenter (about 0.36 wide, 0.3 tall) with a broad flat snout reaching to z about 0.9 and a heavy brow ridge, so the eyes sit under it with nothing in front of them. Build a SEPARATE upper jaw and lower jaw (lower jaw on the jaw joint, hinged at jawHinge). The mouth is open slightly, with 'mouth' dark interior parts, a stone tongue slab, and upper fangs and lower tusks (stoneHi, 6-8 sided cones, large and readable) plus a row of smaller teeth. Two big amber eyes (eyeGlow with an eyePupil slit and a dark stoneShadow socket ring, glowing) sit under angry slanted brow wedges. Nostril holes on the snout tip, a cheek plate and cheekbone ridges. A pair of big curled ram-like horns (stoneDark to stoneLight tips) sweeping back and out. A pair of tall bat-like pointed ears. A chin beard of 3-5 stone icicle spikes and a chin boss. The face is carved with chisel facets, cracks, and moss on the brow top and between the horns, soot and rain stains under the eyes.",
      "box": [[-0.3, 0.85, 0.2], [0.3, 1.5, 0.95]],
      "attaches": "Neck starts at mount neckBase (the torso chest top, spine2) and rides neck1 and neck2. The skull rides head and the lower jaw rides jaw (hinge at jawHinge). No contact with the ledge. Nothing may be placed in front of the face.",
      "joints": ["neck1", "neck2", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "arms",
      "builds": "Both forelimbs (build L at +X and R at -X), in stone/stoneDark. A massive shoulder pauldron block with chiselled ridge plates (a stoneHi edge wedge and a spike) at shoulderL/R, an upper arm sweep to elbowL/R (with an elbow spike), a long muscular forearm to wristL/R, and a gothic bracer on each forearm: a band with a repeating pointed-arch or trefoil relief motif. Big chunky hands planted flat on the ledge at handContactL/R (x +-0.3, z about 0.62, y 0.25), each with 4 thick fingers fanned forward (digit chains, joints fingerL1.. / fingerR1.. under handL/R, 2 segments each) and a thick thumb, ending in curved claws (stoneHi, cone-shaped, gripping the ledge lip edge). Knuckle bumps. Weathering: moss in the elbow creases and on the pauldrons, rain stains on the forearms, soot on the underside.",
      "box": [[-0.5, 0.22, 0], [0.5, 0.95, 0.8]],
      "attaches": "Starts at shoulderL/R on spine2 (the torso part builds the chest and trapezius up to there). Hands rest on mounts handContactL/R at ledgeTop (sink at most 1 cm). Rides shoulderL/R, elbowL/R, wristL/R, handL/R and its own finger joints.",
      "joints": ["shoulderL", "elbowL", "wristL", "handL", "shoulderR", "elbowR", "wristR", "handR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "Both hind legs, digitigrade and crouching (build L at +X and R at -X), in stone/stoneDark. A thick thigh haunch from hipSocketL/R to kneeL/R with a big rounded-faceted muscle block and a knee spike, a shin back to ankleL/R, an ankle spur, then a long foot to footL/R. Each foot has three forward toes (digit chains under footL/R, e.g. toeL1.., 2 segments each) plus a rear dewclaw, all with thick stoneHi claws gripping the ledge. The feet rest at footContactL/R (x +-0.34, z about 0.12, y 0.25). Thigh striations as thin dark parts, a gothic leaf-trim band at the knee. Weathering: moss on top of the thighs and toes, soot and rain stains on the shins, cracks, and darker stone at the underside.",
      "box": [[-0.55, 0.22, -0.5], [0.55, 0.8, 0.25]],
      "attaches": "Starts at hipSocketL/R on hips (the torso part builds the pelvis). Feet rest on mounts footContactL/R at ledgeTop (sink at most 1 cm). Rides hipL/R, kneeL/R, ankleL/R, footL/R and its own toe joints.",
      "joints": ["hipL", "kneeL", "ankleL", "footL", "hipR", "kneeR", "ankleR", "footR"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "wings",
      "builds": "Two large bat-like wings (build L at +X and R at -X), spread upward and back from wingRootL/R in a rest pose. Each wing has a thick bony arm sweep over wingShoulder -> wingElbow -> wingWrist (a stone bone with knuckle bumps and a wrist spike/thumb claw), then four long tapered finger bones (digit chains, joints wfingerL1.. / wfingerR1.. under wingWrist, 2 segments each) that fan out and down and back to wingtips (reaching x +-0.95, y >= 0.5, z down to -0.65). Stone-slab membranes ('membrane' with 'membraneEdge' trim, via b.membrane) are stretched between the fingers and body with scalloped trailing edges. Each membrane panel gets an inset gothic motif: a pointed-arch tracery rib and small trefoil cutouts as thin dark parts in stoneDark seated on the surface, plus a feather-like chisel rib pattern. Weathering: moss on the upper arm bone tops and wing root, rain stain streaks running down the membranes, cracks and chipped edges (small notches).",
      "box": [[-0.95, 0.5, -0.7], [0.95, 1.5, 0.2]],
      "attaches": "Roots at wingRootL/R on spine2 (the torso's upper back, between the shoulder blades). Rides wingShoulderL/R, wingElbowL/R, wingWristL/R and its own finger joints. The wing must clear the head (keep |x| > 0.25 above y 0.9 for z > 0).",
      "joints": ["wingShoulderL", "wingElbowL", "wingWristL", "wingShoulderR", "wingElbowR", "wingWristR"],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: Ctx) {
  const bone = J.hips;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...o });

  // main slab
  box(1.7, 0.18, 1.65, P.ledge, 0, 0.09, 0.025);
  // cornice steps (front and sides)
  box(1.74, 0.03, 0.05, P.stoneLight, 0, 0.195, 0.84);
  box(1.78, 0.025, 0.04, P.stoneLight, 0, 0.17, 0.87);
  box(1.74, 0.012, 0.02, P.stoneHi, 0, 0.215, 0.855);
  for (const s of [1, -1]) {
    box(0.05, 0.03, 1.6, P.stoneLight, s * 0.86, 0.195, 0.02);
    box(0.04, 0.025, 1.64, P.stoneLight, s * 0.89, 0.165, 0.02);
    box(0.02, 0.012, 1.6, P.stoneHi, s * 0.865, 0.215, 0.02);
  }
  box(1.74, 0.03, 0.05, P.stoneLight, 0, 0.195, -0.8);
  // top slab inlay
  box(1.62, 0.02, 1.56, P.ledge, 0, 0.21, 0.02);

  // dentils
  for (let i = 0; i < 15; i++) {
    const x = -0.8 + i * (1.6 / 14);
    box(0.06, 0.035, 0.035, P.stoneHi, x, 0.14, 0.885);
  }
  // pointed arch panels on front
  const arch: [number, number][] = [
    [-0.11, 0], [0.11, 0], [0.11, 0.07], [0.08, 0.11], [0, 0.17, "sharp" as any], [-0.08, 0.11], [-0.11, 0.07],
  ] as any;
  const inner: [number, number][] = [
    [-0.075, 0.015], [0.075, 0.015], [0.075, 0.065], [0.05, 0.095], [0, 0.14, "sharp" as any], [-0.05, 0.095], [-0.075, 0.065],
  ] as any;
  for (const x of [-0.5, 0, 0.5]) {
    b.extrude(arch as any, { at: [x, 0.015, 0.855], x: [1, 0, 0], thickness: 0.012, color: P.stoneHi, bone });
    b.extrude(inner as any, { at: [x, 0.015, 0.866], x: [1, 0, 0], thickness: 0.012, color: P.stoneDark, bone });
    // trefoil
    for (const [dx, dy] of [[0, 0.1], [-0.025, 0.075], [0.025, 0.075]])
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 6), P.stoneShadow, {
        bone, at: [x + dx, 0.015 + dy - 0.03, 0.874], dir: [0, 0, 1],
      });
  }
  // corbels under front corners
  for (const s of [1, -1]) {
    box(0.16, 0.1, 0.12, P.stoneLight, s * 0.7, -0.0 + 0.05, 0.8);
    box(0.12, 0.05, 0.1, P.stoneDark, s * 0.7, 0.025, 0.8);
  }
  // mortar courses
  for (const y of [0.06, 0.12]) {
    box(1.7, 0.008, 0.006, P.mortar, 0, y, 0.852);
    for (const s of [1, -1]) box(0.006, 0.008, 1.65, P.mortar, s * 0.851, y, 0.02);
  }
  for (let i = 0; i < 6; i++) {
    const x = -0.75 + i * 0.3 + (i % 2) * 0.08;
    box(0.008, 0.06, 0.006, P.mortar, x, 0.03, 0.852);
    box(0.008, 0.06, 0.006, P.mortar, -x * 0.9, 0.09, 0.852);
  }
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) box(0.006, 0.06, 0.008, P.mortar, s * 0.851, (i % 2) * 0.06 + 0.03, -0.6 + i * 0.35);
  // iron cramp
  box(0.2, 0.012, 0.04, P.iron, 0.1, 0.225, -0.6);
  box(0.04, 0.014, 0.06, P.iron, -0.01, 0.225, -0.6);
  box(0.04, 0.014, 0.06, P.iron, 0.21, 0.225, -0.6);
  // drain groove
  box(0.5, 0.012, 0.02, P.stoneShadow, 0.3, 0.12, 0.853);
  // moss patches on top (avoid contacts)
  const avoid = [M.handContactL, M.handContactR, M.footContactL, M.footContactR];
  const ok = (x: number, z: number) => avoid.every((a) => Math.hypot(a[0] - x, a[2] - z) > 0.12);
  const cols = [P.moss, P.mossDark, P.lichen];
  let n = 0;
  const spots: [number, number][] = [[-0.7, -0.65], [0.7, -0.65], [-0.75, -0.35], [0.75, -0.3], [-0.62, 0.7], [0.62, 0.72], [-0.45, 0.2], [0.5, 0.45], [-0.5, 0.0], [0.15, -0.5], [-0.2, 0.75]];
  for (const [x, z] of spots) {
    if (!ok(x, z)) continue;
    const c = cols[n++ % 3];
    b.part(new THREE.CylinderGeometry(0.06 + R() * 0.05, 0.07 + R() * 0.05, 0.012, 7), c, {
      bone, at: [x, 0.225, z], rotation: [0, R() * 90, 0],
    });
    for (let k = 0; k < 2; k++)
      b.part(new THREE.ConeGeometry(0.014, 0.03, 5), P.mossDark, {
        bone, at: [x + (R() - 0.5) * 0.08, 0.238, z + (R() - 0.5) * 0.08],
      });
  }
  // stone chips
  for (const [x, z] of [[-0.3, 0.55], [0.35, -0.2], [0.8, 0.2], [-0.8, -0.1]])
    if (ok(x, z)) box(0.03, 0.015, 0.025, P.stoneLight, x, 0.227, z, { rotation: [0, R() * 80, 0] });
  // stains streaking down front face
  for (const x of [-0.3, -0.05, 0.2, 0.42, 0.6]) {
    const h = 0.08 + R() * 0.08;
    box(0.025 + R() * 0.02, h, 0.004, x < 0.3 ? P.rainStain : P.soot, x, 0.18 - h / 2, 0.853);
  }
  // cracks
  box(0.005, 0.1, 0.004, P.crack, -0.68, 0.07, 0.854, { rotation: [0, 0, 15] });
  box(0.005, 0.08, 0.004, P.crack, 0.75, 0.1, 0.854, { rotation: [0, 0, -20] });
  box(0.16, 0.004, 0.005, P.crack, 0.4, 0.222, 0.3, { rotation: [0, 25, 0] });
  box(0.12, 0.004, 0.005, P.crack, -0.35, 0.222, -0.3, { rotation: [0, -35, 0] });
  box(0.004, 0.08, 0.005, P.crack, 0.852, 0.1, -0.3);
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, s1 = J.spine1, s2 = J.spine2;

  // --- helpers ---
  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true });
  const cone = (r: number, h: number, sides: number, col: string, at: number[], bone: any, dir: number[]) =>
    b.part(new THREE.ConeGeometry(r, h, sides), col, { bone, at, dir, flat: true });

  // --- main body loft: pelvis -> waist -> barrel chest ---
  b.loft(
    [
      { at: [0, 0.58, -0.4], w: 0.4, h: 0.34 },
      { at: [0, 0.6, -0.25], w: 0.52, h: 0.4 },
      { at: [0, 0.64, -0.07], w: 0.34, h: 0.3 },
      { at: [0, 0.74, 0.12], w: 0.44, h: 0.42 },
      { at: [0, 0.8, 0.27], w: 0.4, h: 0.4 },
    ],
    { bone: [hips, s1, s2], color: P.stone, section: { ngon: 8 } },
  );

  // pelvis block
  box(0.56, 0.2, 0.3, P.stoneDark, [0, 0.48, -0.28], hips);
  box(0.5, 0.06, 0.26, P.stoneLight, [0, 0.6, -0.3], hips, [-8, 0, 0]);

  // belly plate with rib bands
  box(0.26, 0.26, 0.05, P.stoneLight, [0, 0.62, 0.24], s2, [-25, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const y = 0.52 + i * 0.045;
    box(0.27, 0.014, 0.02, P.stoneDark, [0, y, 0.28 - i * 0.012 + 0.0], s2, [-25, 0, 0]);
  }
  box(0.2, 0.2, 0.05, P.soot, [0, 0.46, 0.0], s1, [-10, 0, 0]);

  // chest plate with trefoil emblem
  const cp = [0, 0.86, 0.42];
  box(0.3, 0.26, 0.04, P.stoneHi, cp, s2, [-18, 0, 0]);
  box(0.26, 0.22, 0.045, P.stoneDark, [0, 0.86, 0.425], s2, [-18, 0, 0]);
  const emb = [[0, 0.9], [-0.04, 0.84], [0.04, 0.84]];
  for (const [x, y] of emb)
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), P.stoneHi, {
      bone: s2, at: [x, y, 0.455], dir: [0, 0.3, 1], axis: "y", flat: true,
    });
  for (const [x, y] of emb)
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.022, 8), P.stoneShadow, {
      bone: s2, at: [x, y, 0.458], dir: [0, 0.3, 1], flat: true,
    });
  cone(0.025, 0.1, 4, P.stoneHi, [0, 0.76, 0.455], s2, [0, -1, 0.1]);

  // pecs and trapezius masses
  for (const s of [1, -1]) {
    box(0.2, 0.18, 0.16, P.stone, [s * 0.2, 0.84, 0.3], s2, [-15, s * 15, 0]);
    box(0.22, 0.14, 0.24, P.stoneDark, [s * 0.2, 0.98, 0.12], s2, [10, s * -20, s * -15]);
    box(0.14, 0.03, 0.1, P.moss, [s * 0.2, 1.06, 0.1], s2, [10, 0, s * -15]);
    box(0.06, 0.04, 0.06, P.lichen, [s * 0.28, 1.04, 0.16], s2);
    // flank rain stains
    box(0.012, 0.22, 0.05, P.rainStain, [s * 0.255, 0.68, 0.0], s1);
    box(0.012, 0.16, 0.04, P.soot, [s * 0.25, 0.64, -0.12], s1);
    // hip chisel wedges
    box(0.04, 0.16, 0.2, P.stoneLight, [s * 0.285, 0.58, -0.28], hips, [0, 0, s * -6]);
  }
  // cracks across chest
  box(0.01, 0.2, 0.012, P.crack, [0.06, 0.86, 0.447], s2, [-18, 0, 20]);
  box(0.01, 0.12, 0.012, P.crack, [0.1, 0.8, 0.447], s2, [-18, 0, -30]);
  box(0.01, 0.14, 0.012, P.crack, [-0.07, 0.62, 0.285], s2, [-25, 0, 15]);

  // loincloth slab
  box(0.2, 0.2, 0.04, P.stoneLight, [0, 0.4, -0.1], hips, [-8, 0, 0]);
  box(0.1, 0.08, 0.045, P.stoneDark, [0, 0.4, -0.098], hips, [-8, 0, 45]);

  // --- dorsal ridge ---
  const spinePts = [
    [0, 1.02, 0.18], [0, 1.0, 0.08], [0, 0.93, -0.04], [0, 0.88, -0.16], [0, 0.82, -0.28], [0, 0.78, -0.4], [0, 0.7, -0.5],
  ];
  const bones = [s2, s2, s1, s1, hips, hips, hips];
  spinePts.forEach((p, i) => {
    const k = 1 - i * 0.09;
    cone(0.06 * k, 0.17 * k, 4, P.stoneDark, p, bones[i], [0, 1, -0.9]);
    cone(0.025 * k, 0.1 * k, 4, P.stoneHi, [p[0], p[1] + 0.02, p[2] + 0.03], bones[i], [0, 1, -0.9]);
  });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.2), P.moss, { bone: s1, at: [0, 0.9, -0.05], rotation: [10, 0, 0], flat: true });
  box(0.1, 0.02, 0.1, P.mossDark, [0.05, 0.92, -0.2], hips);

  // --- tail ---
  const tailPath = catmull([
    [0, 0.5, -0.4], [0, 0.42, -0.6], [0.12, 0.34, -0.68], [0.3, 0.31, -0.62], [0.46, 0.31, -0.46],
  ]);
  b.sweep(tailPath, [0.13, 0.045], {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    color: P.stone,
    section: { ngon: 6 },
    caps: "round",
  });
  // ridge fins along tail
  const tj = [J.tail1, J.tail2, J.tail3, J.tail4];
  for (let i = 0; i < 6; i++) {
    const t = 0.08 + i * 0.15;
    const p = tailPath.at(t);
    const k = 1 - t * 0.7;
    const tg = tailPath.tangentAt(t);
    const bone = tj[Math.min(3, Math.floor(t * 4))];
    b.part(new THREE.ConeGeometry(0.05 * k, 0.12 * k, 4), i % 2 ? P.stoneDark : P.stoneLight, {
      bone, at: [p.x, p.y + 0.08 * k + 0.03, p.z], dir: [0, 1, 0], flat: true,
    });
    if (i % 2 === 0)
      box(0.012, 0.012, 0.06 * k, P.crack, [p.x, p.y + 0.06, p.z], bone, [0, Math.atan2(tg.x, tg.z) * 57, 0]);
  }
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.12), P.moss, { bone: J.tail1, at: [0, 0.5, -0.52], flat: true });

  // spade tip
  const end = tailPath.at(1);
  const spade = b.extrude(
    [[0, -0.07, "sharp"], [0.1, 0, "sharp"], [0, 0.1, "sharp"], [-0.1, 0, "sharp"]],
    { at: [end.x + 0.07, end.y + 0.02, end.z + 0.03], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.045, bone: J.tail4, color: P.stoneDark },
  );
  b.extrude(
    [[0, -0.045, "sharp"], [0.06, 0, "sharp"], [0, 0.065, "sharp"], [-0.06, 0, "sharp"]],
    { at: [end.x + 0.07, end.y + 0.045, end.z + 0.03], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, bone: J.tail4, color: P.stoneHi },
  );

  // soot under tail, rain stains
  box(0.1, 0.02, 0.2, P.soot, [0, 0.36, -0.55], J.tail2);
  box(0.02, 0.16, 0.03, P.rainStain, [0.08, 0.5, -0.46], hips);
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng, lerp } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(41);
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = J["hip" + side], kneeJ = J["knee" + side], ankJ = J["ankle" + side], footJ = J["foot" + side];
    const hip = V(0.27 * s, 0.6, -0.22);
    const knee = V(0.4 * s, 0.5, 0.15);
    const ank = V(0.33 * s, 0.32, -0.12);
    const foot = V(0.34 * s, 0.25, 0.12);

    // thigh
    b.capsule(hip, knee, [0.1, 0.075], P.stone, { bone: hipJ, section: { ngon: 6 } });
    const tm = lerp(hip, knee, 0.45);
    b.part(new THREE.IcosahedronGeometry(0.14, 0), P.stoneLight, {
      bone: hipJ, at: [tm.x + s * 0.03, tm.y + 0.02, tm.z], scale: [0.85, 1.0, 1.3], flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.07, 0), P.stoneHi, {
      bone: hipJ, at: [tm.x + s * 0.09, tm.y + 0.05, tm.z - 0.03], scale: [0.5, 0.9, 1.2], flat: true,
    });
    // moss on top of thigh
    for (let i = 0; i < 3; i++) {
      const t = 0.25 + i * 0.25;
      const p = lerp(hip, knee, t);
      b.part(new THREE.IcosahedronGeometry(0.04 + R() * 0.02, 0), i === 1 ? P.mossDark : P.moss, {
        bone: hipJ, at: [p.x + s * 0.02, p.y + 0.105, p.z], scale: [1.2, 0.4, 1.4], flat: true,
      });
    }
    b.part(new THREE.IcosahedronGeometry(0.025, 0), P.lichen, {
      bone: hipJ, at: [tm.x + s * 0.06, tm.y + 0.11, tm.z + 0.04], scale: [1.2, 0.4, 1], flat: true,
    });
    // striations
    for (let i = 0; i < 4; i++) {
      const dz = (i - 1.5) * 0.035;
      const a = lerp(hip, knee, 0.12);
      const c = lerp(hip, knee, 0.85);
      b.rod([a.x + s * 0.115, a.y - 0.02 + i * 0.012, a.z + dz], [c.x + s * 0.1, c.y - 0.01 + i * 0.012, c.z + dz],
        0.004, P.crack, { bone: hipJ, section: { ngon: 4 } });
    }
    // rain stain on haunch
    b.rod([tm.x + s * 0.118, tm.y + 0.03, tm.z + 0.07], [tm.x + s * 0.112, tm.y - 0.1, tm.z + 0.075], 0.008, P.rainStain, { bone: hipJ });
    // underside darker
    b.rod([hip[0], hip[1] - 0.07, hip[2] + 0.02], [knee[0], knee[1] - 0.06, knee[2] - 0.02], 0.045, P.stoneDark, { bone: hipJ, section: { ngon: 5 } });

    // knee: boss, spike, leaf trim
    b.part(new THREE.IcosahedronGeometry(0.085, 0), P.stoneLight, { bone: kneeJ, at: knee, flat: true });
    b.spike([knee[0] + s * 0.06, knee[1] + 0.02, knee[2] + 0.04], [s * 0.7, 0.35, 0.5], 0.15, 0.04, P.stoneHi, { bone: kneeJ, sides: 6 });
    b.ring(kneeJ, { count: 7, radius: 0.088, tilt: 25 }, (it) => b.spike(it, it, 0.045, 0.016, { color: P.stoneHi, bone: undefined, sides: 4 }));
    b.part(new THREE.TorusGeometry(0.09, 0.008, 4, 8), P.stoneDark, { bone: kneeJ, at: knee, dir: [0, 1, 0.3], flat: true });

    // shin (goes back to ankle)
    b.capsule(knee, ank, [0.07, 0.048], P.stoneDark, { bone: kneeJ, section: { ngon: 6 } });
    const sm = lerp(knee, ank, 0.5);
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.14), P.stone, { bone: kneeJ, at: [sm.x + s * 0.02, sm.y + 0.04, sm.z], rotation: [-20, 0, 0], });
    b.part(new THREE.IcosahedronGeometry(0.03, 0), P.moss, { bone: kneeJ, at: [sm.x + s * 0.02, sm.y + 0.075, sm.z + 0.02], scale: [1.2, 0.4, 1.4], flat: true });
    // soot & rain streaks on shin
    for (let i = 0; i < 3; i++) {
      const p = lerp(knee, ank, 0.2 + i * 0.28);
      b.rod([p.x + s * 0.062, p.y + 0.03, p.z], [p.x + s * 0.06, p.y - 0.06, p.z + 0.01], 0.007, i % 2 ? P.soot : P.rainStain, { bone: kneeJ });
    }
    // crack on shin
    b.rod([sm.x + s * 0.06, sm.y + 0.03, sm.z - 0.02], [sm.x + s * 0.055, sm.y - 0.03, sm.z + 0.02], 0.003, P.crack, { bone: kneeJ, section: { ngon: 4 } });

    // ankle
    b.part(new THREE.IcosahedronGeometry(0.055, 0), P.stoneLight, { bone: ankJ, at: ank, flat: true });
    b.spike([ank[0], ank[1] + 0.01, ank[2] - 0.03], [s * 0.15, 0.3, -1], 0.13, 0.03, P.stoneHi, { bone: ankJ, sides: 6 });

    // foot
    b.capsule(ank, [foot[0], 0.275, foot[2]], [0.048, 0.042], P.stone, { bone: ankJ, section: { ngon: 6 } });
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.1), P.stoneDark, { bone: footJ, at: [foot[0], 0.238, foot[2] + 0.02], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.03, 0), P.moss, { bone: ankJ, at: [foot[0], 0.325, 0.0], scale: [1.2, 0.4, 1.3], flat: true });
    // knuckle bumps
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.IcosahedronGeometry(0.022, 0), P.stoneLight, { bone: footJ, at: [foot[0] + s * k * 0.05, 0.285, foot[2] + 0.06], flat: true });

    // toes
    for (let k = -1; k <= 1; k++) {
      const x0 = foot[0] + s * k * 0.05;
      const x1 = x0 + s * k * 0.025, x2 = x0 + s * k * 0.05;
      const len = k === 0 ? 1.1 : 1;
      const pts = [V(x0, 0.255, 0.14), V(x1, 0.255, 0.14 + 0.09 * len), V(x2, 0.255, 0.14 + 0.17 * len)];
      const names = [`legsToe${side}${k + 2}a`, `legsToe${side}${k + 2}b`];
      const ch = b.chain(`legsToe${side}${k + 2}`, pts, { parent: footJ, names, role: "digit" });
      b.sweep(ch, [0.037, 0.028], { color: P.stone, section: { ngon: 6 }, caps: "round" });
      b.part(new THREE.IcosahedronGeometry(0.02, 0), P.moss, { bone: ch.joints[0], at: [x1, 0.288, pts[1][2] - 0.02], scale: [1.2, 0.4, 1.3], flat: true });
      b.spike([x2, 0.252, pts[2][2] + 0.01], [s * k * 0.25, -0.35, 1], 0.1, 0.026, P.stoneHi, { bone: ch.joints[1], sides: 6 });
    }
    // dewclaw
    b.part(new THREE.IcosahedronGeometry(0.025, 0), P.stoneLight, { bone: footJ, at: [foot[0], 0.255, -0.01], flat: true });
    b.spike([foot[0], 0.258, -0.01], [0, -0.12, -1], 0.1, 0.022, P.stoneHi, { bone: footJ, sides: 6 });
    // chisel highlight wedge on foot top
    b.part(new THREE.ConeGeometry(0.02, 0.07, 4), P.stoneHi, { bone: ankJ, at: [foot[0], 0.31, 0.05], dir: [0, 0.2, 1], flat: true });
  }
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: any) {
  const rand = rng(11);
  const SIDES: [number, string][] = [[1, "L"], [-1, "R"]];

  const box = (size: number[], color: string, at: number[], bone: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, rotation: rot });
  const ico = (r: number, color: string, at: number[], bone: any, scale: number[] = [1, 1, 1]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, { bone, at, scale, flat: true });
  const lerp3 = (a: number[], c: number[], t: number) => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // pointed arch relief outline
  const ARCH: any = [
    [-0.016, 0],
    [0.016, 0],
    [0.016, 0.026],
    [0, 0.05, "sharp"],
    [-0.016, 0.026],
  ];

  for (const [s, side] of SIDES) {
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const wr = J["wrist" + side];
    const hd = J["hand" + side];

    const S = [s * 0.26, 0.8, 0.2];
    const E = [s * 0.3, 0.55, 0.38];
    const W = [s * 0.3, 0.3, 0.52];

    // ---- pauldron ----
    box([0.22, 0.16, 0.26], P.stone, [s * 0.31, 0.83, 0.2], sh, [0, 0, -s * 12]);
    box([0.24, 0.05, 0.28], P.stoneDark, [s * 0.32, 0.9, 0.2], sh, [0, 0, -s * 12]);
    for (let i = 0; i < 3; i++) {
      box([0.2 - i * 0.03, 0.03, 0.05], P.stoneLight, [s * (0.33 + i * 0.01), 0.935 + i * 0.012, 0.1 + i * 0.09], sh, [0, 0, -s * 14]);
      box([0.12, 0.012, 0.03], P.stoneHi, [s * (0.34 + i * 0.01), 0.955 + i * 0.012, 0.1 + i * 0.09], sh, [0, 0, -s * 14]);
    }
    b.spike([s * 0.37, 0.92, 0.2], [s * 0.6, 1, -0.2], 0.15, 0.04, { bone: sh, color: P.stoneDark });
    b.spike([s * 0.37, 0.86, 0.3], [s * 0.7, 0.2, 0.5], 0.1, 0.03, { bone: sh, color: P.stoneLight });
    // trefoil on outer face
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
      b.part(new THREE.SphereGeometry(0.018, 6, 4), P.stoneDark, {
        bone: sh,
        at: [s * 0.425, 0.83 + Math.sin(a) * 0.028, 0.2 + Math.cos(a) * 0.028],
      });
    }
    // moss on pauldron
    for (let k = 0; k < 4; k++) {
      ico(0.028 + rand() * 0.015, k % 2 ? P.moss : P.mossDark, [s * (0.27 + rand() * 0.1), 0.925, 0.12 + rand() * 0.18], sh, [1.3, 0.35, 1.2]);
    }
    ico(0.02, P.lichen, [s * 0.36, 0.93, 0.27], sh, [1.2, 0.3, 1]);
    // soot under pauldron
    box([0.16, 0.02, 0.2], P.soot, [s * 0.3, 0.745, 0.2], sh);

    // ---- upper arm ----
    b.capsule(S, E, [0.1, 0.08], { bone: sh, color: P.stone, section: { ngon: 6 } });
    ico(0.085, P.stoneDark, lerp3(S, E, 0.5).map((v, i) => v + (i === 0 ? s * 0.03 : 0)), sh, [0.9, 1.3, 1]);
    box([0.02, 0.1, 0.012], P.crack, [s * 0.375, 0.68, 0.29], sh, [0, 0, s * 8]);
    // elbow
    ico(0.09, P.stoneLight, E, el);
    b.spike([s * 0.36, 0.56, 0.36], [s * 0.9, 0, -0.6], 0.16, 0.04, { bone: el, color: P.stoneDark });
    b.spike([s * 0.37, 0.56, 0.36], [s * 1, 0.1, -0.3], 0.05, 0.015, { bone: el, color: P.stoneHi });
    ico(0.03, P.moss, [s * 0.3, 0.6, 0.31], el, [1.3, 0.6, 1]);
    ico(0.022, P.mossDark, [s * 0.34, 0.5, 0.31], el, [1.2, 0.6, 1]);

    // ---- forearm ----
    b.capsule(E, W, [0.085, 0.065], { bone: el, color: P.stone, section: { ngon: 6 } });
    ico(0.075, P.stoneDark, lerp3(E, W, 0.3), el, [1, 1.35, 1.1]);
    b.spike(lerp3(E, W, 0.6).map((v, i) => v + (i === 1 ? 0.05 : 0)), [0, 1, -0.4], 0.06, 0.02, { bone: el, color: P.stoneLight });
    // bracer band
    b.rod(lerp3(E, W, 0.42), lerp3(E, W, 0.82), 0.09, { bone: el, color: P.stoneDark, section: { ngon: 8 } });
    for (const t of [0.4, 0.84]) {
      b.rod(lerp3(E, W, t), lerp3(E, W, t + 0.04), 0.097, { bone: el, color: P.stoneHi, section: { ngon: 8 } });
    }
    for (let k = 0; k < 3; k++) {
      const p = lerp3(E, W, 0.5 + k * 0.1);
      b.extrude(ARCH, {
        at: [p[0] + s * 0.085, p[1] - 0.02, p[2]],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        color: P.stoneHi,
        bone: el,
      });
      b.extrude(ARCH, {
        at: [p[0] + s * 0.09, p[1] - 0.016, p[2]],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        color: P.stoneShadow,
        bone: el,
        scale: undefined,
      } as any);
    }
    // rain stains and soot
    for (let k = 0; k < 3; k++) {
      const p = lerp3(E, W, 0.15 + k * 0.28);
      box([0.008, 0.07 + rand() * 0.05, 0.016], P.rainStain, [p[0] + s * 0.083, p[1] - 0.03, p[2] + 0.02 * (k - 1)], el);
    }
    box([0.1, 0.02, 0.18], P.soot, lerp3(E, W, 0.5).map((v, i) => (i === 1 ? v - 0.07 : v)), el);
    box([0.012, 0.06, 0.012], P.crack, [s * 0.3 + s * 0.07, 0.45, 0.46], el, [0, 0, 20]);
    // wrist
    ico(0.065, P.stoneLight, W, wr);

    // ---- hand ----
    const palm = [s * 0.3, 0.31, 0.6];
    box([0.2, 0.1, 0.18], P.stone, palm, hd);
    box([0.2, 0.03, 0.18], P.stoneDark, [palm[0], 0.345, palm[2]], hd);
    box([0.16, 0.012, 0.1], P.stoneHi, [palm[0], 0.362, palm[2] - 0.02], hd);
    ico(0.02, P.moss, [palm[0] - s * 0.04, 0.362, 0.55], hd, [1.4, 0.4, 1.2]);
    box([0.2, 0.012, 0.18], P.soot, [palm[0], 0.256, palm[2]], hd);

    for (let i = 0; i < 4; i++) {
      const fan = (i - 1.5) * 0.7; // sign grows with i
      const x0 = s * (0.3 + (i - 1.5) * 0.052);
      const pts = [
        [x0, 0.31, 0.68],
        [x0 + s * fan * 0.03, 0.29, 0.76],
        [x0 + s * fan * 0.07, 0.272, 0.83],
      ];
      const ch = b.chain(`armsFinger${side}${i + 1}`, pts, {
        parent: hd,
        names: [`armsFinger${side}${i + 1}a`, `armsFinger${side}${i + 1}b`],
        role: "digit",
      });
      b.sweep(ch, [0.03, 0.021], { color: P.stone, section: { ngon: 6 }, caps: "round" });
      ico(0.03, P.stoneLight, [x0, 0.32, 0.68], ch.joints[0], [1, 0.8, 1]);
      box([0.03, 0.01, 0.025], P.stoneHi, [pts[1][0], 0.318, pts[1][2]], ch.joints[0]);
      b.spike(pts[2], [fan * s * 0.2, -0.6, 1], 0.075, 0.017, { bone: ch.joints[1], color: P.stoneHi, caps: "point" });
    }
    // thumb
    const th = [
      [s * 0.2, 0.31, 0.6],
      [s * 0.165, 0.29, 0.67],
      [s * 0.14, 0.275, 0.73],
    ];
    const tch = b.chain(`armsThumb${side}`, th, {
      parent: hd,
      names: [`armsThumb${side}1`, `armsThumb${side}2`],
      role: "digit",
    });
    b.sweep(tch, [0.036, 0.026], { color: P.stoneDark, section: { ngon: 6 } });
    b.spike(th[2], [-s * 0.3, -0.6, 1], 0.075, 0.019, { bone: tch.joints[1], color: P.stoneHi, caps: "point" });
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHead({ b, J, P, M }: any) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw, n1 = J.neck1, n2 = J.neck2;

  // Box helper: size, colour, centre, bone, rotation in degrees
  const bx = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true });
  // Cone helper: radius, length, centre, direction
  const cone = (r: number, l: number, c: string, at: number[], dir: number[], bone: any, sides = 7) =>
    b.part(new THREE.ConeGeometry(r, l, sides), c, { bone, at, dir, flat: true });

  // ---------- Neck ----------
  b.sweep(
    [[0, 0.84, 0.26], [0, 0.95, 0.36], [0, 1.04, 0.46]],
    [0.17, 0.13],
    { bone: [n1, n2], color: P.stone, sides: 6, smooth: false },
  );
  // collar band + soot below
  bx(0.34, 0.04, 0.3, P.stoneDark, [0, 0.9, 0.31], n1, [-30, 0, 0]);
  bx(0.2, 0.05, 0.05, P.soot, [0, 0.88, 0.42], n1, [-30, 0, 0]);
  // mane blades along the neck top
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const y = 0.99 + t * 0.12, z = 0.2 + t * 0.2;
    const bone = i < 3 ? n1 : n2;
    cone(0.04 - t * 0.005, 0.13 - t * 0.02, P.stoneDark, [0, y + 0.04, z - 0.01], [0, 1, -0.8], bone, 4);
    cone(0.018, 0.07, P.stoneHi, [0, y + 0.06, z + 0.01], [0, 1, -0.8], bone, 4);
  }
  // neck side blades and moss
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++)
      cone(0.03, 0.09, P.stoneLight, [s * 0.14, 0.95 + i * 0.06, 0.32 + i * 0.05], [s, 0.5, -0.6], i < 2 ? n1 : n2, 4);
    bx(0.07, 0.015, 0.08, P.moss, [s * 0.09, 1.1, 0.42], n2, [10, 0, s * 10]);
  }

  // ---------- Skull ----------
  const HC = [0, 1.12, 0.5];
  bx(0.36, 0.3, 0.32, P.stone, HC, head);
  bx(0.3, 0.06, 0.28, P.stoneLight, [0, 1.285, 0.5], head, [-6, 0, 0]); // crown plate
  bx(0.14, 0.2, 0.06, P.stoneDark, [0, 1.12, 0.33], head); // back of skull
  // upper snout (broad, flat)
  bx(0.25, 0.1, 0.32, P.stone, [0, 1.08, 0.76], head);
  bx(0.2, 0.05, 0.3, P.stoneLight, [0, 1.14, 0.76], head, [-5, 0, 0]);
  bx(0.27, 0.03, 0.1, P.stoneHi, [0, 1.128, 0.87], head); // chisel highlight at snout tip
  bx(0.04, 0.05, 0.04, P.stoneLight, [0, 1.13, 0.9], head, [0, 45, 0]); // nose bump
  // nostrils
  for (const s of [1, -1]) {
    bx(0.04, 0.025, 0.012, P.mouth, [s * 0.055, 1.09, 0.922], head);
    bx(0.018, 0.04, 0.012, P.stoneShadow, [s * 0.1, 1.07, 0.922], head);
  }
  // cheek plates & cheekbone ridges
  for (const s of [1, -1]) {
    bx(0.04, 0.15, 0.2, P.stoneDark, [s * 0.18, 1.06, 0.56], head, [0, 0, s * 8]);
    bx(0.035, 0.05, 0.22, P.stoneLight, [s * 0.185, 1.13, 0.6], head, [0, s * 8, 0]);
    bx(0.02, 0.02, 0.1, P.stoneHi, [s * 0.2, 1.15, 0.64], head);
    // snout side flank
    bx(0.02, 0.08, 0.28, P.stoneDark, [s * 0.128, 1.07, 0.76], head);
  }

  // brow ridge + angry wedges
  bx(0.38, 0.05, 0.1, P.stoneDark, [0, 1.21, 0.655], head);
  bx(0.4, 0.012, 0.1, P.stoneHi, [0, 1.238, 0.66], head);
  for (const s of [1, -1]) {
    bx(0.16, 0.05, 0.09, P.stoneDark, [s * 0.1, 1.2, 0.675], head, [0, 0, s * 25]);
    bx(0.16, 0.012, 0.09, P.stoneHi, [s * 0.1, 1.226, 0.675], head, [0, 0, s * 25]);
    // moss on brow top
    bx(0.09, 0.015, 0.06, P.moss, [s * 0.12, 1.245, 0.655], head, [0, 0, s * 25]);
  }
  bx(0.06, 0.02, 0.05, P.moss, [0, 1.245, 0.655], head);
  bx(0.05, 0.05, 0.03, P.stoneDark, [0, 1.17, 0.67], head, [0, 0, 45]); // brow between eyes

  // ---------- Eyes ----------
  for (const s of [1, -1]) {
    const ex = s * 0.1, ey = 1.15, ez = 0.665;
    bx(0.095, 0.075, 0.03, P.stoneShadow, [ex, ey, ez - 0.005], head, [0, 0, s * 20]); // socket
    const eye = b.part(new THREE.SphereGeometry(0.034, 7, 5), P.eyeGlow, {
      bone: head, at: [ex, ey, ez + 0.012], scale: [1.15, 0.8, 0.6],
    });
    glow(eye, 1.6);
    bx(0.01, 0.05, 0.01, P.eyePupil, [ex, ey, ez + 0.026], head, [0, 0, s * 8]); // slit
    // soot/rain stains under the eye
    bx(0.015, 0.1, 0.01, P.soot, [ex - s * 0.015, 1.07, ez + 0.0], head);
    bx(0.01, 0.07, 0.01, P.rainStain, [ex + s * 0.025, 1.08, ez + 0.0], head);
  }

  // cracks
  bx(0.01, 0.1, 0.01, P.crack, [0.06, 1.2, 0.6], head, [0, 0, 20]);
  bx(0.01, 0.07, 0.01, P.crack, [0.075, 1.16, 0.6], head, [0, 0, -30]);
  bx(0.08, 0.008, 0.01, P.crack, [-0.1, 1.27, 0.55], head, [0, 90, 0]);
  bx(0.01, 0.01, 0.12, P.crack, [-0.07, 1.316, 0.5], head);
  bx(0.01, 0.1, 0.01, P.crack, [-0.13, 1.1, 0.67], head, [0, 0, 15]);

  // ---------- Mouth ----------
  bx(0.2, 0.03, 0.27, P.mouth, [0, 1.03, 0.76], head); // upper palate
  bx(0.2, 0.02, 0.27, P.mouth, [0, 0.985, 0.75], jaw); // lower interior
  bx(0.1, 0.015, 0.18, P.stoneDark, [0, 0.998, 0.74], jaw, [4, 0, 0]); // tongue slab
  bx(0.1, 0.006, 0.02, P.stoneShadow, [0, 1.008, 0.74], jaw); // tongue groove

  // lower jaw (on jaw bone)
  bx(0.25, 0.06, 0.3, P.stoneDark, [0, 0.955, 0.73], jaw);
  bx(0.28, 0.05, 0.08, P.stone, [0, 0.96, 0.58], jaw); // jaw base
  for (const s of [1, -1]) {
    bx(0.04, 0.07, 0.3, P.stone, [s * 0.125, 0.975, 0.7], jaw);
    bx(0.03, 0.04, 0.12, P.stoneLight, [s * 0.15, 0.99, 0.6], jaw, [0, 0, s * 10]);
    bx(0.01, 0.012, 0.1, P.stoneHi, [s * 0.14, 1.005, 0.62], jaw);
  }
  bx(0.16, 0.07, 0.07, P.stoneLight, [0, 0.945, 0.865], jaw); // chin boss
  bx(0.1, 0.015, 0.05, P.stoneHi, [0, 0.985, 0.87], jaw);
  bx(0.04, 0.05, 0.01, P.soot, [0, 0.93, 0.9], jaw);

  // fangs: upper (stoneHi) and lower tusks
  for (const s of [1, -1]) {
    cone(0.026, 0.1, P.stoneHi, [s * 0.09, 0.985, 0.87], [0, -1, 0.05], head, 7);
    cone(0.02, 0.1, P.stoneHi, [s * 0.14, 1.03, 0.72], [s * 0.1, -1, 0], head, 6);
    cone(0.027, 0.11, P.stoneHi, [s * 0.1, 1.03, 0.89], [s * 0.15, 1, 0.1], jaw, 7);
    // smaller teeth
    for (let i = 0; i < 4; i++) {
      cone(0.012, 0.04, P.stoneLight, [s * 0.105, 1.01, 0.64 + i * 0.05], [0, -1, 0], head, 5);
      cone(0.011, 0.035, P.stoneLight, [s * 0.075, 0.99, 0.65 + i * 0.055], [0, 1, 0], jaw, 5);
    }
  }
  for (let i = 0; i < 3; i++) {
    cone(0.011, 0.04, P.stoneLight, [-0.03 + i * 0.03, 1.005, 0.915], [0, -1, 0], head, 5);
    cone(0.011, 0.04, P.stoneLight, [-0.03 + i * 0.03, 0.99, 0.9], [0, 1, 0], jaw, 5);
  }

  // chin beard: icicle spikes
  const beard = [[-0.06, 0.1, 0.8], [-0.02, 0.14, 0.84], [0.02, 0.13, 0.84], [0.06, 0.1, 0.8]];
  for (const [x, l, z] of beard) {
    cone(0.022, l, P.stoneLight, [x, 0.92 - l / 2 + 0.02, z], [0, -1, 0.1], jaw, 5);
    cone(0.009, l * 0.5, P.stoneHi, [x, 0.9 - l / 2 + 0.02, z + 0.012], [0, -1, 0.1], jaw, 4);
  }

  // ---------- Horns ----------
  for (const s of [1, -1]) {
    const pts = [[0.12, 1.26, 0.46], [0.22, 1.36, 0.4], [0.29, 1.41, 0.27], [0.3, 1.34, 0.14], [0.25, 1.27, 0.13]]
      .map(([x, y, z]) => [s * x, y, z]);
    b.sweep(pts, [0.055, 0.012], {
      bone: head,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "point" },
      bands: [[0.6, P.stoneDark], [0.85, P.stone], [1, P.stoneLight]],
    });
    // growth rings
    for (const [x, y, z, ry] of [[0.17, 1.32, 0.43, 25], [0.255, 1.39, 0.34, 70]] as number[][])
      bx(0.012, 0.11, 0.11, P.stoneShadow, [s * x, y, z], head, [0, s * ry, s * 30]);
    bx(0.07, 0.02, 0.07, P.moss, [s * 0.14, 1.285, 0.46], head, [0, 0, s * 15]); // moss at horn base
  }
  bx(0.1, 0.02, 0.1, P.mossDark, [0, 1.32, 0.42], head);
  bx(0.06, 0.02, 0.05, P.lichen, [0.03, 1.325, 0.44], head);
  for (let i = 0; i < 6; i++) // moss tufts between horns
    cone(0.012, 0.03 + R() * 0.02, i % 2 ? P.moss : P.mossDark, [-0.07 + i * 0.028, 1.33, 0.4 + R() * 0.08], [0, 1, 0], head, 4);

  // ---------- Ears ----------
  for (const s of [1, -1]) {
    b.extrude([[-0.055, 0], [0.055, 0], [0.0, 0.22, "sharp"]], {
      at: [s * 0.17, 1.17, 0.37], x: [s, 0, 0], y: [s * 0.55, 1, -0.2], thickness: 0.025, color: P.stone, bone: head,
    });
    b.extrude([[-0.03, 0.02], [0.03, 0.02], [0.0, 0.15, "sharp"]], {
      at: [s * 0.175, 1.17, 0.355], x: [s, 0, 0], y: [s * 0.55, 1, -0.2], thickness: 0.02, color: P.stoneShadow, bone: head,
    });
    bx(0.01, 0.06, 0.012, P.stoneHi, [s * 0.215, 1.29, 0.35], head, [0, 0, -s * 30]);
  }

  // rain streaks down skull sides
  for (const s of [1, -1]) {
    bx(0.01, 0.12, 0.012, P.rainStain, [s * 0.181, 1.1, 0.45], head);
    bx(0.01, 0.08, 0.012, P.soot, [s * 0.181, 1.05, 0.5], head);
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P }: any) {
  const rand = rng(77);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shJ = J["wingShoulder" + side];
    const elJ = J["wingElbow" + side];
    const wrJ = J["wingWrist" + side];
    const sh = shJ.at.clone();
    const el = elJ.at.clone();
    const wr = wrJ.at.clone();

    // ---- bony arm ----
    const armPath = catmull([sh, el, wr]);
    b.sweep(armPath, [0.055, 0.04, 0.03], {
      bone: [shJ, elJ, wrJ],
      section: { ngon: 6 },
      color: P.stone,
    });
    // knuckle bumps
    for (const [p, j, r] of [
      [el, elJ, 0.055],
      [wr, wrJ, 0.045],
      [sh, shJ, 0.06],
    ] as const) {
      b.part(new THREE.IcosahedronGeometry(r, 0), P.stoneLight, { at: p, bone: j });
    }
    // elbow + wrist spikes (thumb claw)
    b.spike(el.clone().add(V(0, 0.03, 0.02)), [0.1 * s, 0.9, 0.3], 0.13, 0.03, { color: P.stoneHi, bone: elJ });
    b.spike(wr, [0.3 * s, 0.5, 0.8], 0.14, 0.025, { color: P.stoneHi, bone: wrJ });
    // chisel highlight wedge along the arm top
    b.rod(
      armPath.at(0.2).clone().add(V(0, 0.045, 0)),
      armPath.at(0.5).clone().add(V(0, 0.048, 0)),
      0.009,
      P.stoneHi,
      { bone: elJ },
    );
    // moss on upper arm and wing root
    for (const [t, r, c] of [
      [0.08, 0.05, P.moss],
      [0.3, 0.04, P.mossDark],
      [0.6, 0.035, P.lichen],
    ] as const) {
      const p = armPath.at(t).clone();
      b.part(new THREE.SphereGeometry(r, 5, 4), c, {
        at: p.add(V(0, 0.04, 0)),
        scale: [1.2, 0.35, 1],
        bone: t < 0.4 ? shJ : elJ,
      });
    }
    // cracks
    b.rod(armPath.at(0.45).clone().add(V(0, 0.035, 0.03)), armPath.at(0.55).clone().add(V(0.02 * s, 0.03, 0.04)), 0.004, P.crack, { bone: elJ });
    b.rod(armPath.at(0.8).clone().add(V(0, 0.03, 0.02)), armPath.at(0.9).clone().add(V(0, 0.025, 0.03)), 0.004, P.crack, { bone: wrJ });

    // ---- fingers ----
    const tips = [
      V(0.94 * s, 0.62, -0.45),
      V(0.78 * s, 0.55, -0.64),
      V(0.55 * s, 0.52, -0.66),
      V(0.32 * s, 0.75, -0.6),
    ];
    const paths: any[] = [];
    const chains: any[] = [];
    tips.forEach((tip, i) => {
      const mid = wr.clone().lerp(tip, 0.5).add(V(0.02 * s, 0.06, 0));
      const path = catmull([wr, mid, tip]);
      const ch = b.chain(`wfinger${side}${i * 2 + 1}`.replace(/\d+$/, "") + (i * 2 + 1), path, {
        parent: wrJ,
        names: [`wfinger${side}${i * 2 + 1}`, `wfinger${side}${i * 2 + 2}`],
        role: "digit",
      });
      paths.push(path);
      chains.push(ch);
      b.sweep(ch, [0.024, 0.014, 0.007], { section: { ngon: 6 }, color: i % 2 ? P.stone : P.stoneLight });
      const last = ch.joints[ch.joints.length - 1];
      b.spike(tip, path.tangentAt(1), 0.07, 0.014, { color: P.stoneHi, bone: last });
      b.part(new THREE.IcosahedronGeometry(0.022, 0), P.stoneLight, {
        at: path.at(0.5),
        bone: ch.joints[0],
      });
    });

    // ---- membranes ----
    const bodyPath = catmull([V(0.5 * s, 1.28, -0.2), V(0.24 * s, 0.95, -0.15), V(0.26 * s, 0.72, -0.4)]);
    const edges = [...paths, bodyPath];
    for (let i = 0; i < 4; i++) {
      const A = i < 4 ? chains[i] : null;
      const B = i < 3 ? chains[i + 1] : bodyPath;
      b.membrane(A, B, {
        color: P.membrane,
        thickness: 0.02,
        scallop: 0.14,
        ...(i === 3 ? { bone: shJ } : {}),
      });
    }

    // ---- gothic decoration on both faces ----
    for (let i = 0; i < 4; i++) {
      const pa = edges[i];
      const pb = edges[i + 1];
      const pos = (t: number, v: number) => pa.at(t).clone().lerp(pb.at(t).clone(), v);
      const ta = i < 4 ? tips[i] : tips[3];
      const tb = i < 3 ? tips[i + 1] : pb.at(1).clone();
      const n = new THREE.Vector3().crossVectors(ta.clone().sub(wr), tb.clone().sub(wr)).normalize();
      for (const f of [1, -1]) {
        const lift = n.clone().multiplyScalar(f * 0.013);
        const L = (t: number, v: number) => pos(t, v).add(lift);
        // pointed arch tracery
        const arch = catmull([L(0.3, 0.14), L(0.45, 0.12), L(0.66, 0.5), L(0.45, 0.88), L(0.3, 0.86)]);
        b.sweep(arch, 0.005, { sides: 4, caps: "flat", color: P.stoneDark, bone: wrJ });
        // trefoil
        const c = L(0.4, 0.5);
        const tr = [L(0.4, 0.42), L(0.4, 0.58), L(0.34, 0.5)];
        tr.forEach((p) =>
          b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 6), P.stoneDark, {
            at: p,
            dir: n.clone().multiplyScalar(f),
            bone: wrJ,
          }),
        );
        void c;
      }
      // rain streak
      const lf = n.clone().multiplyScalar(0.014);
      b.rod(pos(0.45, 0.28).add(lf), pos(0.88, 0.3).add(lf), 0.004, P.rainStain, { bone: wrJ });
    }
    void rand;
  }
}
```