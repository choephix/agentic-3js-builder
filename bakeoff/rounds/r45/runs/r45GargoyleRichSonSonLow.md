<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A hunched gothic stone gargoyle crouched on a cathedral ledge, wings folded high, hands gripping the front edge, tail curled on the stone, with weathered chisel-carved facets, moss and ember eyes.",
  "builderName": "cathedralGargoyle",
  "size": [1.4, 1.52, 1.6],
  "layout": "Everything is carved stone: bold chunky faceted primitives with low segment counts (6-8 sides), a flat stone colour per part, and darker tones where the form turns down and into crevices. Lighter chipped edges sit on top. Moss is limited to upward faces and crannies. Rain-streak stains are thin dark strips running down. The model faces +Z and is centred on x=0. It stands on a rectangular stone ledge (x -0.7..0.7, z -0.8..0.8, top at y=0.28). The ledge has a stepped cornice, a mortar-lined block face and a carved quatrefoil panel on the front face. The gargoyle crouches on the ledge, hunched like a cat about to pounce. The haunches are heavy and back (hips y~0.66, z -0.3). The hind feet are flat on the ledge near z -0.2..0.1, x +-0.3. The knees are forward and high at z~0.05, y~0.54. The chest is deep, at z~0.18, y~0.88, and the back arches high. The shoulders are massive at y~0.92, x +-0.27. The arms hang down and forward, and the big four-clawed hands grip the front of the ledge at z~0.55..0.78, x +-0.24, with claws curling over the lip. The neck is short and thick, and the head juts forward and slightly down at (0,1.06,0.55). It is large (about 0.5 wide and 0.45 tall) and grotesque, with a heavy brow, a blunt snout, a wide mouth with fangs, a lower jaw that hangs slightly open, curved ram-like horns, bat ears and glowing ember eyes. A pair of bat wings is folded up and back from the shoulder blades. Each has a thick bone arm, three finger bones and a stone membrane between them, with the peak at y~1.5 and the tips sweeping back to z -0.78 and out to x +-0.68. The tail leaves the rump low, runs back, then curls to the model's left (+X) along the ledge top and ends in a spade-shaped barb at around (0.5,0.32,-0.38). A row of stone ridge spikes runs down the spine from neck to tail. The silhouette must read from the front: wide hunched shoulders, hands on the edge, the head in the middle, wings rising behind it like a cloak.",
  "palette": {
    "stoneLight": "#a3a39a",
    "stoneMid": "#85857e",
    "stoneDark": "#615f5c",
    "stoneShadow": "#403f44",
    "stoneChip": "#c7c4b8",
    "mortar": "#b3ad9c",
    "stain": "#4a525a",
    "moss": "#62803e",
    "mossDark": "#43592b",
    "lichen": "#b8b27c",
    "horn": "#6f6b63",
    "hornTip": "#4b4944",
    "claw": "#d0cab8",
    "tooth": "#dad5c4",
    "mouthDark": "#2a2427",
    "eyeGlow": "#ff9a2a",
    "eyeCore": "#ffe08a",
    "wingMembrane": "#8c8c86",
    "wingBone": "#aaa9a0",
    "wingShade": "#6a6a68"
  },
  "mounts": {
    "ledgeTop": [0, 0.28, 0],
    "ledgeFrontEdge": [0, 0.28, 0.8],
    "hipsPos": [0, 0.66, -0.3],
    "chestPos": [0, 0.88, 0.18],
    "neckBase": [0, 0.96, 0.32],
    "headPos": [0, 1.06, 0.55],
    "jawHinge": [0, 0.99, 0.62],
    "shoulderL": [0.27, 0.92, 0.2],
    "shoulderR": [-0.27, 0.92, 0.2],
    "handL": [0.24, 0.28, 0.55],
    "handR": [-0.24, 0.28, 0.55],
    "hipSocketL": [0.27, 0.66, -0.3],
    "hipSocketR": [-0.27, 0.66, -0.3],
    "footL": [0.3, 0.28, -0.04],
    "footR": [-0.3, 0.28, -0.04],
    "tailBase": [0, 0.56, -0.42],
    "tailTip": [0.5, 0.32, -0.38],
    "wingRootL": [0.2, 1.04, -0.05],
    "wingRootR": [-0.2, 1.04, -0.05],
    "wingWristL": [0.57, 1.45, -0.42],
    "wingWristR": [-0.57, 1.45, -0.42]
  },
  "joints": [
    { "name": "base", "at": [0, 0.28, 0], "dir": [0, 1, 0] },
    { "name": "hips", "parent": "base", "at": [0, 0.66, -0.3], "dir": [0, 0.5, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 0.78, -0.05], "dir": [0, 0.35, 1], "role": "spine" },
    { "name": "chest", "parent": "spine1", "at": [0, 0.88, 0.18], "dir": [0, 0.4, 1], "role": "spine" },
    { "name": "neck1", "parent": "chest", "at": [0, 0.96, 0.32], "dir": [0, 0.4, 1], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.02, 0.45], "dir": [0, 0.3, 1], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.06, 0.55], "dir": [0, -0.1, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.99, 0.62], "dir": [0, -0.05, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.56, -0.42], "dir": [0, -0.5, -0.85], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.44, -0.62], "dir": [0.8, -0.3, -0.4], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0.2, 0.36, -0.72], "dir": [0.88, -0.1, 0.45], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0.42, 0.33, -0.6], "dir": [0.35, 0, 0.95], "role": "tail" },
    { "name": "hipL", "parent": "hips", "at": [0.27, 0.66, -0.3], "dir": [0.2, -0.33, 0.92], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.34, 0.54, 0.05], "dir": [-0.15, -0.68, -0.75], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.3, 0.33, -0.18], "dir": [0, -0.18, 0.98], "role": "leg" },
    { "name": "toeL", "parent": "ankleL", "at": [0.3, 0.28, 0.1], "dir": [0, 0, 1], "role": "digit" },
    { "name": "hipR", "parent": "hips", "at": [-0.27, 0.66, -0.3], "dir": [-0.2, -0.33, 0.92], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.34, 0.54, 0.05], "dir": [0.15, -0.68, -0.75], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.3, 0.33, -0.18], "dir": [0, -0.18, 0.98], "role": "leg" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.3, 0.28, 0.1], "dir": [0, 0, 1], "role": "digit" },
    { "name": "shoulderL", "parent": "chest", "at": [0.27, 0.92, 0.2], "dir": [0.18, -0.94, -0.24], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.33, 0.61, 0.12], "dir": [-0.2, -0.6, 0.8], "role": "arm" },
    { "name": "wristL", "parent": "elbowL", "at": [0.25, 0.36, 0.45], "dir": [0, -0.6, 0.8], "role": "arm" },
    { "name": "handL", "parent": "wristL", "at": [0.24, 0.28, 0.55], "dir": [0, 0, 1], "role": "digit" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.27, 0.92, 0.2], "dir": [-0.18, -0.94, -0.24], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.33, 0.61, 0.12], "dir": [0.2, -0.6, 0.8], "role": "arm" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.25, 0.36, 0.45], "dir": [0, -0.6, 0.8], "role": "arm" },
    { "name": "handR", "parent": "wristR", "at": [-0.24, 0.28, 0.55], "dir": [0, 0, 1], "role": "digit" },
    { "name": "wingShoulderL", "parent": "chest", "at": [0.2, 1.04, -0.05], "dir": [0.55, 0.7, -0.35], "role": "wing" },
    { "name": "wingElbowL", "parent": "wingShoulderL", "at": [0.45, 1.36, -0.2], "dir": [0.45, 0.3, -0.84], "role": "wing" },
    { "name": "wingWristL", "parent": "wingElbowL", "at": [0.57, 1.45, -0.42], "dir": [0.4, -0.1, -0.9], "role": "wing" },
    { "name": "wingF1L", "parent": "wingWristL", "at": [0.57, 1.45, -0.42], "dir": [0.22, -0.85, -0.55], "role": "digit" },
    { "name": "wingF2L", "parent": "wingWristL", "at": [0.57, 1.45, -0.42], "dir": [-0.12, -0.45, -0.88], "role": "digit" },
    { "name": "wingF3L", "parent": "wingWristL", "at": [0.57, 1.45, -0.42], "dir": [-0.75, 0.1, -0.65], "role": "digit" },
    { "name": "wingShoulderR", "parent": "chest", "at": [-0.2, 1.04, -0.05], "dir": [-0.55, 0.7, -0.35], "role": "wing" },
    { "name": "wingElbowR", "parent": "wingShoulderR", "at": [-0.45, 1.36, -0.2], "dir": [-0.45, 0.3, -0.84], "role": "wing" },
    { "name": "wingWristR", "parent": "wingElbowR", "at": [-0.57, 1.45, -0.42], "dir": [-0.4, -0.1, -0.9], "role": "wing" },
    { "name": "wingF1R", "parent": "wingWristR", "at": [-0.57, 1.45, -0.42], "dir": [-0.22, -0.85, -0.55], "role": "digit" },
    { "name": "wingF2R", "parent": "wingWristR", "at": [-0.57, 1.45, -0.42], "dir": [0.12, -0.45, -0.88], "role": "digit" },
    { "name": "wingF3R", "parent": "wingWristR", "at": [-0.57, 1.45, -0.42], "dir": [0.75, 0.1, -0.65], "role": "digit" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The cathedral ledge the gargoyle crouches on, x -0.7..0.7, z -0.8..0.8, y 0..0.28, as plain boxes with no joints beyond the root 'base'. Build a main block course with visible mortar lines (thin mortar-coloured strips) on the front and both sides, in 2 rows of blocks with staggered joints, mixing stoneMid and stoneLight blocks. On top sits a projecting stepped cornice slab (slightly wider than the block, y 0.2..0.28) in stoneLight, with a chamfered stoneChip front edge and a dark stoneShadow drip groove under it. On the front face, carve a gothic quatrefoil inside a pointed arch panel as dark recessed shapes (stoneShadow) with a stoneChip rim, plus two smaller trefoil panels on the sides. A shallow rain channel (stoneDark strip) runs along the top toward the front, ending in a small spout notch at the front edge under the gargoyle's hands. Add a corner finial boss (small stepped pyramid or knob) at the two front corners, kept below y 0.28 or flush with the cornice top. Add wear: moss and mossDark patches on the top surface edges and in the corners, lichen dots, vertical stain streaks on the front face, small cracks (thin dark strips) and a few chipped corner notches. Leave the central top area clear for the feet and tail, so the feet at x +-0.3 z -0.2..0.1, the hands at x +-0.24 z 0.55..0.78 and the tail curl at z -0.78..-0.3, x -0.1..0.55 sit on y=0.28 without poking through.",
      "box": [[-0.7, 0, -0.8], [0.7, 0.28, 0.8]],
      "attaches": "Top face at mount ledgeTop (y=0.28). Rides joint base. Feet, hands and tail rest on this top face.",
      "joints": ["base"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "torso",
      "builds": "The body from hips to the neck, the hind legs and the tail. The torso is a loft or sweep along hips, spine1 and chest, then neck1 and neck2 up to the headPos mount. It is a hunched, deep chest with a high arched back and a tucked belly. Colours are stoneMid on top and stoneDark under the belly, and rib bands are carved as faceted stoneDark ridges. Add a chest plate of chiselled facets in stoneLight, a collarbone ridge, a row of 8-9 stone ridge spikes down the back from neck to tail root (stoneLight tipped with stoneChip) and shoulder-blade bumps. Hind legs: massive faceted thighs (stoneMid with a stoneLight highlight facet on top) from hipSocket to knee, a narrower shin back-down to the ankle, and a flat foot to the toe with 3 thick toes with claw-coloured claws gripping the ledge (claw), resting at y=0.28. The haunch has carved muscle bulges, and a few small chisel scars (thin stoneShadow strips). The tail is a tapering chain (tail1..tail4) with ridges on top that curls to the model's left along the ledge, with barbs along it and ending in a spade-shaped stone barb (extruded flat spade, stoneDark with stoneLight rim) at tailTip. Weathering: moss in the crannies on top of the haunches and between the shoulder blades, lichen flecks, stain streaks down the flanks. Make the neck a thick faceted tube that ends hidden inside the head at headPos.",
      "box": [[-0.5, 0.28, -0.78], [0.55, 1.1, 0.45]],
      "attaches": "Shoulders at mounts shoulderL/R and wing roots at wingRootL/R sit on the upper back and chest, built by the arms and wings parts. Neck ends at headPos (the head part starts there). Feet touch ledgeTop at footL/footR. Tail rests on ledgeTop and ends at tailTip.",
      "joints": ["hips", "spine1", "chest", "neck1", "neck2", "tail1", "tail2", "tail3", "tail4", "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "arms",
      "builds": "The two front arms, mirrored: large rounded faceted shoulder balls at shoulderL/R (stoneMid with a stoneLight highlight), thick upper arms that go down to the elbow, an angular elbow spur (stoneLight spike pointing back), a heavy forearm that slopes forward and down to the wrist, and a big hand. Each hand has four chunky fingers about 0.05 across, spread slightly apart, gripping and curling over the front lip of the ledge. They end in curved claws (claw colour, with a hornTip dark root) and a thick thumb on the inner side. The hands rest at y=0.28 near z 0.55-0.78 and the claws hang over the front edge, but never go past z=0.8. Add carved details: knuckle bumps, wrist bands of chiselled grooves (stoneDark strips), fine chisel marks, a little moss on top of the shoulders and lichen flecks. Pose is symmetrical with the elbows slightly out.",
      "box": [[-0.45, 0.28, 0.0], [0.45, 1.0, 0.8]],
      "attaches": "Roots at the shoulderL/R mounts on the chest (the shoulder ball overlaps the torso chest). Hands land at handL/handR on ledgeTop and claws overhang ledgeFrontEdge.",
      "joints": ["shoulderL", "elbowL", "wristL", "handL", "shoulderR", "elbowR", "wristR", "handR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "head",
      "builds": "The grotesque head and everything on it, built around the head joint at headPos (0,1.06,0.55) and the jaw hinge at jawHinge, about 0.5 wide and 0.45 tall. A big blocky faceted skull (stoneMid) with a heavy overhanging brow ridge in stoneDark/stoneLight facets, a blunt wide snout box with two nostril pits (stoneShadow) and a wrinkled nose bridge, high cheekbones, and eye sockets under the brow holding two glowing ember eyes. Each eye is a slightly protruding stoneShadow rim ring, an eyeGlow ball and a small eyeCore pupil. Eyes are the readable hero feature: place them at about x +-0.12, y 1.1, z 0.78 and make them visible from the front. Build separate upper and lower jaws. The upper jaw has an upper lip with 4 big fangs and small teeth in a row (tooth colour). The lower jaw (on the jaw joint) hangs slightly open, with a heavy chin, two upward lower tusks, a row of small teeth, a dark mouthDark interior and a thick stone tongue. Add a chunky stone chin beard (3 blades of stoneDark/stoneLight) and a ridge of jowls. A pair of big curved ram-like horns sweep back and up from the temples at x +-0.14 (horn colour, hornTip dark at the tip, with 3-4 raised ring ridges each), to a top of y~1.38. A pair of tall bat ears with an inner groove, set behind and beside the horns. Three small brow spikes over each eye. A mane crest of 5 overlapping stoneLight blades from the forehead down the back of the neck. The gargoyle is also a rain spout, so show a tiny water-worn channel line on the lower lip. Weathering: moss on the crown between the horns, lichen on the cheeks, stain streaks running down from the eyes, chipped tips on the horns and ears (stoneChip). Keep everything on the face in front of nothing: nothing covers the eyes or mouth.",
      "box": [[-0.28, 0.85, 0.35], [0.28, 1.4, 0.92]],
      "attaches": "Skull base meets the neck tube at headPos; jaw rides joint jaw at the jawHinge mount. Horns and the mane blades root on the skull; the mane trails back over neck1/neck2 onto the torso neck without leaving the box.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "Two folded bat wings, mirrored, rising up and back from the shoulder blades at wingRootL/R. Each wing has a thick faceted bone arm (wingBone) going from the wing shoulder out and up to the elbow, then a forearm sweeping back to the wrist at wingWristL/R (0.57,1.45,-0.42), which is the highest point and carries a chunky thumb claw (claw colour) that points forward. From the wrist fan 3 finger bones (wingBone, tapering sticks with knuckle bumps) running to the tips: f1 to (+-0.68,1.01,-0.72), f2 to (+-0.52,1.26,-0.78), f3 to (+-0.35,1.48,-0.62), which is the highest tip. Between the arm, the fingers and the back, stretch the membrane in thick carved stone slabs (b.membrane or extrudes) in wingMembrane, with scalloped trailing edges between the finger tips. Fold-creases and radial rib grooves run from the finger bones (wingShade strips, thin). A darker wingShade tone lies on the inner/underside near the body and a lighter stoneChip rim along the leading edge. Wing bases overlap the upper back above the shoulder blades. The wings flare out slightly from the back so they read as two pointed arches behind the head from the front, tallest at the wrist, and stay inside x +-0.72 and z -0.85..0. Weathering: moss on the top of the elbows and the leading edges, rain stain streaks running down the membrane, a few cracks and chipped notches in the trailing edges, and little carved sunburst or feather-line engravings in the membrane near the roots.",
      "box": [[-0.72, 0.95, -0.85], [0.72, 1.52, 0.0]],
      "attaches": "Roots on the upper back at mounts wingRootL/R (on the chest/torso). Wrist points at wingWristL/R. Finger tips stay above the tail and ledge, with the lowest tip at y~1.0.",
      "joints": ["wingShoulderL", "wingElbowL", "wingWristL", "wingF1L", "wingF2L", "wingF3L", "wingShoulderR", "wingElbowR", "wingWristR", "wingF1R", "wingF2R", "wingF3R"],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: any) {
  const r = rng(11);
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = J["shoulder" + L], el = J["elbow" + L], wr = J["wrist" + L], hd = J["hand" + L];
    const shP: number[] = [s * 0.27, 0.92, 0.2];
    const elP: number[] = [s * 0.35, 0.61, 0.12];
    const wrP: number[] = [s * 0.25, 0.36, 0.45];
    // shoulder ball
    b.part(new THREE.IcosahedronGeometry(0.15, 1), P.stoneMid, { bone: sh, at: shP, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.08, 0), P.stoneLight, { bone: sh, at: [s * 0.3, 0.99, 0.19], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.04, 0), P.moss, { bone: sh, at: [s * 0.25, 1.06, 0.15], flat: true });
    // upper arm
    b.rod(shP, elP, [0.115, 0.09], { color: P.stoneMid, bone: sh, sides: 7 });
    b.part(new THREE.IcosahedronGeometry(0.095, 0), P.stoneDark, { bone: el, at: elP, flat: true });
    // elbow spur
    b.spike([s * 0.4, 0.63, 0.1], [s * 0.45, 0.66, -0.08], null, 0.045, { color: P.stoneLight, bone: el });
    // forearm
    b.rod(elP, wrP, [0.1, 0.085], { color: P.stoneMid, bone: el, sides: 7 });
    for (const t of [0.35, 0.55]) {
      const p = [elP[0] + (wrP[0] - elP[0]) * t, elP[1] + (wrP[1] - elP[1]) * t + 0.01, elP[2] + (wrP[2] - elP[2]) * t];
      b.part(new THREE.TorusGeometry(0.095, 0.012, 4, 7), P.stoneDark, { bone: el, at: p, dir: [0, -0.6, 0.8], axis: "z" });
    }
    // wrist band
    b.part(new THREE.TorusGeometry(0.085, 0.015, 4, 7), P.stoneDark, { bone: wr, at: [s * 0.25, 0.37, 0.44], dir: [0, -0.6, 0.8], axis: "z" });
    // palm
    b.part(new THREE.BoxGeometry(0.2, 0.09, 0.16), P.stoneMid, { bone: hd, at: [s * 0.24, 0.33, 0.52], flat: true });
    b.part(new THREE.BoxGeometry(0.19, 0.02, 0.1), P.moss, { bone: hd, at: [s * 0.24, 0.385, 0.5] });
    // fingers
    for (let i = 0; i < 4; i++) {
      const x = s * (0.24 + (i - 1.5) * 0.055 * 1);
      const sp = (i - 1.5) * 0.01;
      b.part(new THREE.BoxGeometry(0.05, 0.06, 0.16), P.stoneMid, { bone: hd, at: [x, 0.32, 0.67], flat: true });
      b.part(new THREE.IcosahedronGeometry(0.03, 0), P.stoneLight, { bone: hd, at: [x, 0.365, 0.6], flat: true });
      b.part(new THREE.BoxGeometry(0.048, 0.07, 0.04), P.stoneDark, { bone: hd, at: [x, 0.3, 0.76], flat: true });
      b.spike([x, 0.3, 0.77], [x + sp, 0.2, 0.79], null, 0.022, { color: P.hornTip, bone: hd });
      b.spike([x, 0.25, 0.785], [x + sp, 0.16, 0.795], null, 0.017, { color: P.claw, bone: hd });
    }
    // thumb
    const tx = s * 0.12;
    b.part(new THREE.BoxGeometry(0.06, 0.06, 0.12), P.stoneMid, { bone: hd, at: [tx, 0.32, 0.6], rotation: [0, -s * 25, 0], flat: true });
    b.spike([tx - s * 0.01, 0.3, 0.66], [tx - s * 0.03, 0.22, 0.74], null, 0.02, { color: P.claw, bone: hd });
    // lichen flecks and chisel marks
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 6), P.lichen, {
        bone: sh, at: [s * (0.22 + r() * 0.12), 1.04 + r() * 0.03, 0.12 + r() * 0.1],
      });
      b.part(new THREE.BoxGeometry(0.05, 0.004, 0.006), P.stoneShadow, {
        bone: el, at: [s * (0.33 + r() * 0.05), 0.68 - i * 0.04, 0.17], rotation: [0, 0, 20 * i],
      });
    }
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = J["wingShoulder" + S], el = J["wingElbow" + S], wr = J["wingWrist" + S];
    const f1 = J["wingF1" + S], f2 = J["wingF2" + S], f3 = J["wingF3" + S];
    const root: [number, number, number] = [s * 0.2, 1.04, -0.05];
    const elbow: [number, number, number] = [s * 0.45, 1.36, -0.2];
    const wrist: [number, number, number] = [s * 0.57, 1.45, -0.42];
    const tips: [number, number, number][] = [
      [s * 0.68, 1.01, -0.72],
      [s * 0.52, 1.26, -0.78],
      [s * 0.35, 1.48, -0.62],
    ];
    const bones = [f1, f2, f3];

    // arm bones
    b.rod(root, elbow, [0.05, 0.04], P.wingBone, { bone: sh, sides: 6 } as any);
    b.rod(elbow, wrist, [0.04, 0.032], P.wingBone, { bone: el, sides: 6 } as any);
    for (const p of [root, elbow, wrist]) {
      const bone = p === root ? sh : p === elbow ? el : wr;
      b.part(new THREE.SphereGeometry(p === wrist ? 0.05 : 0.055, 6, 5), P.wingBone, { at: p, bone, flat: true });
    }
    // moss on elbow top
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.moss, { at: [s * 0.45, 1.405, -0.2], bone: el, flat: true, scale: [1, 0.5, 1] });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), P.mossDark, { at: [s * 0.5, 1.42, -0.27], bone: el, flat: true, scale: [1, 0.5, 1] });

    // thumb claw pointing forward
    b.spike(wrist, [s * 0.02, -0.15, 1] as any, 0.14, 0.035, { color: P.claw, bone: wr, sides: 6 } as any);

    // fingers
    tips.forEach((t, i) => {
      b.rod(wrist, t, [0.032, 0.012], P.wingBone, { bone: bones[i], sides: 6 } as any);
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.wingBone, { at: t, bone: bones[i], flat: true });
      for (const k of [0.4, 0.7]) {
        const p: [number, number, number] = [
          wrist[0] + (t[0] - wrist[0]) * k,
          wrist[1] + (t[1] - wrist[1]) * k,
          wrist[2] + (t[2] - wrist[2]) * k + 0.0,
        ];
        b.part(new THREE.SphereGeometry(0.022 - k * 0.01, 6, 4), P.stoneChip, { at: p, bone: bones[i], flat: true });
      }
    });

    // membranes: between arm and fingers, and between fingers
    const mem = (a: any, c: any, col: string, bone: any) =>
      b.membrane(a, c, { color: col, thickness: 0.03, rows: 3, bone, scallop: 0.15 } as any);
    mem([root, elbow, wrist], [[s * 0.2, 1.0, -0.2], [s * 0.4, 1.1, -0.5], tips[2]], P.wingShade, sh);
    mem([wrist, tips[2]], [wrist.map((v, i) => (v + tips[1][i]) / 2) as any, tips[1]], P.wingMembrane, f3);
    mem([wrist, tips[1]], [wrist.map((v, i) => (v + tips[0][i]) / 2) as any, tips[0]], P.wingMembrane, f2);
    mem([[s * 0.2, 1.0, -0.2], [s * 0.4, 1.1, -0.5], tips[1]], [[s * 0.2, 0.98, -0.3], [s * 0.3, 1.0, -0.6], tips[0]], P.wingShade, f1);

    // leading-edge chips
    b.rod(elbow, wrist, 0.012, P.stoneChip, { bone: el } as any);
    // radial grooves near roots
    for (let i = 0; i < 4; i++) {
      const a: [number, number, number] = [s * (0.25 + i * 0.07), 1.18 + i * 0.03, -0.12 - i * 0.1];
      b.rod(a, [a[0] + s * 0.04, a[1] - 0.14, a[2] - 0.1], 0.006, P.wingShade, { bone: sh } as any);
    }
    // rain stains
    for (let i = 0; i < 3; i++) {
      const x = s * (0.3 + R() * 0.25), z = -0.45 - R() * 0.2;
      b.part(new THREE.BoxGeometry(0.012, 0.18, 0.012), P.stain, { at: [x, 1.2 - R() * 0.1, z], bone: f2, flat: true });
    }
    // chipped notches at trailing edge
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), P.stoneChip, { at: [s * 0.6, 1.14, -0.75], bone: f1, flat: true });
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, l: number, s = 6) => new THREE.ConeGeometry(r, l, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const H = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => put(g, c, at, head, o);
  const Jw = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => put(g, c, at, jaw, o);

  // skull
  H(box(0.46, 0.34, 0.4), P.stoneMid, [0, 1.08, 0.6]);
  H(box(0.4, 0.1, 0.34), P.stoneLight, [0, 1.27, 0.58]);
  H(box(0.48, 0.1, 0.12), P.stoneDark, [0, 1.19, 0.78], { rotation: [-10, 0, 0] });
  H(box(0.44, 0.04, 0.1), P.stoneLight, [0, 1.245, 0.8]);
  // snout
  H(box(0.3, 0.16, 0.2), P.stoneMid, [0, 1.0, 0.84]);
  H(box(0.32, 0.04, 0.2), P.stoneLight, [0, 1.09, 0.84]);
  H(box(0.08, 0.14, 0.06), P.stoneDark, [0, 1.13, 0.82], { rotation: [-20, 0, 0] });
  for (let i = 0; i < 3; i++) H(box(0.1, 0.012, 0.02), P.stoneShadow, [0, 1.1 + i * 0.03, 0.86]);
  // upper lip + teeth
  H(box(0.34, 0.04, 0.22), P.stoneDark, [0, 0.92, 0.84]);
  for (const s of [1, -1]) {
    H(sph(0.03, 6, 4), P.stoneShadow, [s * 0.05, 1.04, 0.945]);
    H(sph(0.07, 6, 4), P.stoneLight, [s * 0.19, 1.0, 0.7]);
    H(box(0.07, 0.07, 0.05), P.stoneLight, [s * 0.2, 1.04, 0.76]);
    for (const x of [0.07, 0.14]) {
      H(cone(0.025, 0.1, 5), P.tooth, [s * x, 0.87, 0.93], { rotation: [180, 0, 0] });
    }
    H(cone(0.018, 0.05, 5), P.tooth, [s * 0.105, 0.895, 0.94], { rotation: [180, 0, 0] });
    // eyes
    const ex = s * 0.12;
    H(new THREE.TorusGeometry(0.06, 0.018, 5, 8), P.stoneShadow, [ex, 1.1, 0.805]);
    H(sph(0.05, 7, 5), P.eyeGlow, [ex, 1.1, 0.81]);
    H(sph(0.022, 6, 4), P.eyeCore, [ex, 1.1, 0.855]);
    // brow spikes
    for (let k = 0; k < 3; k++)
      H(cone(0.018, 0.07, 5), P.stoneLight, [s * (0.06 + k * 0.06), 1.23, 0.84], { rotation: [70, 0, 0] });
    // stain
    H(box(0.014, 0.1, 0.01), P.stain, [ex + s * 0.03, 1.0, 0.82]);
    // lichen
    for (let k = 0; k < 3; k++)
      H(sph(0.015, 5, 3), P.lichen, [s * (0.22 + R() * 0.005), 1.02 + k * 0.04, 0.68 + R() * 0.1]);
    // horns
    for (let k = 0; k < 4; k++) {
      const t = k / 3;
      const hr = 0.06 - t * 0.04;
      const pos = [s * (0.17 + t * 0.1), 1.24 + t * 0.14, 0.56 - t * 0.2 + Math.sin(t * 2) * 0.05];
      H(sph(hr, 6, 4), k === 3 ? P.hornTip : P.horn, pos);
      H(new THREE.TorusGeometry(hr * 1.05, 0.012, 4, 6), P.stoneDark, pos, { rotation: [60, 0, 0] });
    }
    H(sph(0.015, 4, 3), P.stoneChip, [s * 0.27, 1.38, 0.34]);
    // ears
    H(cone(0.07, 0.24, 4), P.stoneMid, [s * 0.25, 1.28, 0.45], { rotation: [-10, 0, -s * 25] });
    H(cone(0.04, 0.17, 4), P.stoneShadow, [s * 0.24, 1.27, 0.47], { rotation: [-10, 0, -s * 25] });
    H(sph(0.015, 4, 3), P.stoneChip, [s * 0.31, 1.4, 0.45]);
    // cheeks / jowls
    H(box(0.08, 0.1, 0.16), P.stoneDark, [s * 0.22, 0.93, 0.66]);
  }
  // moss crown
  for (let k = 0; k < 4; k++) H(sph(0.04, 5, 3), k % 2 ? P.moss : P.mossDark, [(k - 1.5) * 0.04, 1.255, 0.5 + R() * 0.1]);
  // mane
  for (let k = 0; k < 5; k++)
    H(box(0.07, 0.02, 0.12), k % 2 ? P.stoneLight : P.stoneChip, [0, 1.28 - k * 0.025, 0.46 - k * 0.025], {
      rotation: [20 + k * 6, 0, 0],
    });

  // lower jaw (open slightly)
  Jw(box(0.3, 0.05, 0.22), P.mouthDark, [0, 0.94, 0.78]);
  Jw(box(0.34, 0.07, 0.24), P.stoneDark, [0, 0.9, 0.8]);
  Jw(box(0.22, 0.08, 0.1), P.stoneMid, [0, 0.88, 0.93]);
  Jw(box(0.16, 0.03, 0.14), P.stoneLight, [0, 0.95, 0.8], { rotation: [-8, 0, 0] });
  Jw(box(0.03, 0.012, 0.1), P.stoneShadow, [0, 0.935, 0.95]);
  for (const s of [1, -1]) {
    Jw(cone(0.03, 0.11, 5), P.tooth, [s * 0.12, 0.97, 0.9]);
    for (const x of [0.03, 0.07]) Jw(cone(0.016, 0.05, 5), P.tooth, [s * x, 0.945, 0.97]);
    Jw(box(0.05, 0.06, 0.2), P.stoneDark, [s * 0.18, 0.92, 0.74]);
  }
  // beard
  [-0.07, 0, 0.07].forEach((x, i) =>
    Jw(cone(0.04, 0.16 - Math.abs(x), 4), i === 1 ? P.stoneLight : P.stoneDark, [x, 0.8, 0.9], { rotation: [180, 0, 0] }),
  );
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: Ctx) {
  const bone = J.base;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });

  // main block core
  box(1.36, 0.2, 1.56, P.stoneMid, 0, 0.1, 0);

  // block courses: two rows with staggered joints on front/back and sides
  const cols = [P.stoneMid, P.stoneLight];
  for (let row = 0; row < 2; row++) {
    const y = 0.05 + row * 0.1;
    const off = row ? 0.18 : 0;
    for (const s of [1, -1]) {
      // front/back faces
      for (let i = 0; i < 4; i++) {
        const w = 0.34;
        const x = -0.51 + i * w + off * (row ? -0.5 : 0.5);
        if (Math.abs(x) > 0.62) continue;
        box(w - 0.015, 0.088, 0.02, cols[(i + row) % 2], x, y, s * 0.79);
      }
      // side faces
      for (let i = 0; i < 4; i++) {
        const w = 0.38;
        const z = -0.57 + i * w + off * 0.4;
        if (Math.abs(z) > 0.72) continue;
        box(0.02, 0.088, w - 0.015, cols[(i + row + 1) % 2], s * 0.69, y, z);
      }
    }
  }
  // mortar strips
  for (const s of [1, -1]) {
    box(1.4, 0.008, 0.012, P.mortar, 0, 0.1, s * 0.8);
    box(0.012, 0.008, 1.6, P.mortar, s * 0.7, 0.1, 0);
    for (let i = -1; i <= 1; i++) {
      box(0.008, 0.09, 0.012, P.mortar, i * 0.34 + (s > 0 ? 0 : 0.1), 0.05, s * 0.8);
      box(0.012, 0.09, 0.008, P.mortar, s * 0.7, 0.15, i * 0.38);
    }
  }

  // cornice
  box(1.4, 0.06, 1.6, P.stoneLight, 0, 0.25, 0);
  box(1.4, 0.02, 1.6, P.stoneLight, 0, 0.27, 0);
  box(1.44, 0.015, 1.64, P.stoneShadow, 0, 0.2, 0); // drip groove
  box(1.4, 0.02, 0.025, P.stoneChip, 0, 0.268, 0.8, [20, 0, 0]);
  box(0.025, 0.02, 1.6, P.stoneChip, 0.7, 0.268, 0, [0, 0, -20]);
  box(0.025, 0.02, 1.6, P.stoneChip, -0.7, 0.268, 0, [0, 0, 20]);

  // pointed-arch panel with quatrefoil on front
  const fz = 0.8;
  box(0.5, 0.15, 0.012, P.stoneChip, 0, 0.1, fz + 0.004);
  box(0.46, 0.14, 0.014, P.stoneShadow, 0, 0.1, fz + 0.006);
  const arch = new THREE.ConeGeometry(0.26, 0.07, 4);
  b.part(arch, P.stoneChip, { bone, at: [0, 0.19, fz + 0.004], rotation: [0, 45, 0], scale: [1, 1, 0.05] });
  b.part(new THREE.ConeGeometry(0.23, 0.06, 4), P.stoneShadow, { bone, at: [0, 0.188, fz + 0.007], rotation: [0, 45, 0], scale: [1, 1, 0.05] });
  const lobe = (x: number, y: number, z: number, c: string, r: number, dir: number) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.012, 8), c, { bone, at: [x, y, z], rotation: [90, 0, 0] });
  for (const [dx, dy] of [[0, 0.04], [0, -0.04], [0.045, 0], [-0.045, 0]]) {
    lobe(dx, 0.1 + dy, fz + 0.012, P.stoneChip, 0.032, 1);
    lobe(dx, 0.1 + dy, fz + 0.016, P.stoneShadow, 0.025, 1);
  }
  box(0.03, 0.03, 0.01, P.stoneChip, 0, 0.1, fz + 0.018, [0, 0, 45]);

  // side trefoil panels
  for (const s of [1, -1]) {
    box(0.012, 0.12, 0.3, P.stoneShadow, s * 0.705, 0.1, 0);
    for (const dz of [-0.07, 0.07]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), P.stoneChip, { bone, at: [s * 0.708, 0.095, dz], rotation: [0, 0, 90] });
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 8), P.stoneShadow, { bone, at: [s * 0.71, 0.095, dz], rotation: [0, 0, 90] });
    }
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), P.stoneChip, { bone, at: [s * 0.708, 0.14, 0], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 8), P.stoneShadow, { bone, at: [s * 0.71, 0.14, 0], rotation: [0, 0, 90] });
  }

  // rain channel and spout notch
  box(0.07, 0.008, 0.9, P.stoneDark, 0, 0.282, 0.34);
  box(0.1, 0.03, 0.05, P.stoneShadow, 0, 0.262, 0.785);

  // corner finials (stepped pyramids flush with cornice)
  for (const s of [1, -1]) {
    box(0.1, 0.02, 0.1, P.stoneChip, s * 0.64, 0.27, 0.74);
    box(0.07, 0.01, 0.07, P.stoneLight, s * 0.64, 0.28, 0.74);
  }

  // wear: moss
  for (let i = 0; i < 16; i++) {
    const edge = R() < 0.5;
    const x = (R() < 0.5 ? -1 : 1) * (edge ? 0.6 + R() * 0.08 : 0.3 + R() * 0.3);
    const z = (R() < 0.5 ? -1 : 1) * (edge ? 0.2 + R() * 0.55 : 0.68 + R() * 0.08);
    if (Math.abs(x) < 0.4 && Math.abs(z) < 0.7 && Math.abs(z) > 0.0 && Math.abs(x) < 0.4) continue;
    b.part(new THREE.CylinderGeometry(0.02 + R() * 0.04, 0.03 + R() * 0.04, 0.008, 6), R() < 0.5 ? P.moss : P.mossDark, { bone, at: [x, 0.283, z] });
  }
  // lichen dots
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 1.2;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 6), P.lichen, { bone, at: [x, 0.04 + R() * 0.14, 0.806] });
  }
  // stain streaks
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + i * 0.24 + R() * 0.05;
    box(0.015, 0.1 + R() * 0.1, 0.006, P.stain, x, 0.14 - R() * 0.03, 0.807);
  }
  // cracks
  box(0.008, 0.07, 0.006, P.stoneShadow, 0.5, 0.06, 0.808, [0, 0, 20]);
  box(0.008, 0.06, 0.006, P.stoneShadow, -0.55, 0.12, 0.808, [0, 0, -25]);
  box(0.06, 0.006, 0.006, P.stoneShadow, 0.55, 0.274, 0.6, [0, 15, 0]);
  // chipped corner notches (back corners)
  for (const s of [1, -1]) box(0.06, 0.04, 0.06, P.stoneDark, s * 0.69, 0.265, -0.79);
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  // Body loft along hips -> spine1 -> chest -> neck
  const bodyPts = [[0, 0.62, -0.42], [0, 0.7, -0.3], [0, 0.82, -0.05], [0, 0.9, 0.18], [0, 0.97, 0.32], [0, 1.03, 0.45], [0, 1.06, 0.55]];
  const stations = [
    { at: [0, 0.62, -0.4], w: 0.4, h: 0.34 },
    { at: [0, 0.72, -0.28], w: 0.58, h: 0.46 },
    { at: [0, 0.84, -0.05], w: 0.5, h: 0.46 },
    { at: [0, 0.88, 0.18], w: 0.58, h: 0.5 },
    { at: [0, 0.97, 0.34], w: 0.3, h: 0.28 },
    { at: [0, 1.03, 0.46], w: 0.24, h: 0.24 },
    { at: [0, 1.06, 0.55], w: 0.2, h: 0.2 },
  ];
  b.loft(stations, { bone: [J.hips, J.spine1, J.chest, J.neck1, J.neck2], color: P.stoneMid, detail: 0.6 });
  // belly dark
  b.capsule([0, 0.66, -0.25], [0, 0.7, 0.15], 0.17, { bone: J.spine1, color: P.stoneDark, sides: 6 });

  // chest plate facets
  const plate = [[0, 0.88, 0.4, 0.3, 0.3], [0.12, 0.8, 0.38, 0.14, 0.2], [-0.12, 0.8, 0.38, 0.14, 0.2], [0, 0.72, 0.36, 0.2, 0.12]];
  for (const [x, y, z, w, h] of plate)
    b.part(new THREE.BoxGeometry(w, h, 0.06), P.stoneLight, { bone: J.chest, at: [x, y, z], rotation: [20, 0, x * 40] });
  // collarbone
  b.rod([-0.25, 0.98, 0.34], [0.25, 0.98, 0.34], 0.025, { bone: J.chest, color: P.stoneChip });
  // rib bands
  for (let i = 0; i < 4; i++)
    for (const s of [1, -1])
      b.rod([s * 0.14, 0.9 - i * 0.05, -0.1 + i * 0.1], [s * 0.3, 0.78 - i * 0.05, -0.1 + i * 0.1], 0.018, { bone: J.spine1, color: P.stoneDark, sides: 5 });
  // shoulder blade bumps
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.stoneLight, { bone: J.chest, at: [s * 0.2, 1.0, 0.0], scale: [1, 0.8, 1.3] });
  // moss between blades
  b.part(new THREE.SphereGeometry(0.07, 6, 4), P.moss, { bone: J.chest, at: [0, 1.06, 0.0], scale: [1.5, 0.35, 1.3] });

  // ridge spikes
  const sp = [[0, 1.1, 0.4], [0, 1.1, 0.28], [0, 1.1, 0.12], [0, 1.08, -0.04], [0, 1.04, -0.2], [0, 0.97, -0.36], [0, 0.88, -0.5], [0, 0.78, -0.58]];
  sp.forEach((p, i) => {
    const bone = i < 2 ? J.neck1 : i < 4 ? J.chest : J.hips;
    b.spike(p, [0, 1, -0.2], 0.12 - i * 0.004, 0.03, { bone, color: P.stoneLight, sides: 5 });
    b.spike([p[0], p[1] + 0.09, p[2] - 0.02], [0, 1, -0.2], 0.04, 0.012, { bone, color: P.stoneChip, sides: 5 });
  });

  // stains
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.01, 0.2, 0.02), P.stain, { bone: J.spine1, at: [s * 0.28, 0.7, -0.2 + i * 0.15] });

  // hind legs
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const hip = J["hip" + side], knee = J["knee" + side], ankle = J["ankle" + side], toe = J["toe" + side];
    b.capsule([s * 0.27, 0.64, -0.3], [s * 0.34, 0.54, 0.05], [0.16, 0.1], { bone: hip, color: P.stoneMid, sides: 7 });
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.2), P.stoneLight, { bone: hip, at: [s * 0.38, 0.68, -0.15], rotation: [-15, 0, 0] });
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.stoneDark, { bone: hip, at: [s * 0.4, 0.58, -0.3], scale: [0.7, 1, 1] });
    b.part(new THREE.BoxGeometry(0.012, 0.01, 0.12), P.stoneShadow, { bone: hip, at: [s * 0.43, 0.62, -0.25] });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), P.moss, { bone: hip, at: [s * 0.3, 0.76, -0.3], scale: [1.2, 0.4, 1.2] });
    b.capsule([s * 0.34, 0.54, 0.05], [s * 0.3, 0.33, -0.18], [0.08, 0.055], { bone: knee, color: P.stoneMid, sides: 6 });
    b.capsule([s * 0.3, 0.33, -0.18], [s * 0.3, 0.3, 0.1], 0.05, { bone: ankle, color: P.stoneMid, sides: 6 });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.22), P.stoneDark, { bone: ankle, at: [s * 0.3, 0.305, -0.02] });
    for (let t = -1; t <= 1; t++) {
      const x = s * 0.3 + t * 0.065;
      b.rod([x, 0.31, 0.08], [x, 0.31, 0.2], 0.03, { bone: toe, color: P.stoneMid, sides: 6 });
      b.spike([x, 0.31, 0.2], [0, -0.3, 1], 0.07, 0.025, { bone: toe, color: P.claw, sides: 5 });
    }
  }

  // tail curling to +X
  const tp = [[0, 0.56, -0.42], [0, 0.44, -0.62], [0.2, 0.36, -0.72], [0.42, 0.33, -0.6], [0.5, 0.33, -0.42]];
  const path = catmull(tp);
  const tailBones = [J.tail1, J.tail2, J.tail3, J.tail4];
  const tail = b.sweep(path, (t: number) => 0.09 * (1 - t) + 0.03, { bone: tailBones, color: P.stoneMid, sides: 6 });
  for (let i = 0; i < 6; i++) {
    const t = 0.08 + i * 0.14;
    const p = path.at(t);
    b.spike([p.x, p.y + 0.06, p.z], [0, 1, 0], 0.07, 0.022, { bone: tailBones[Math.min(3, Math.floor(t * 4))], color: P.stoneLight, sides: 5 });
  }
  // spade barb
  const e = path.at(1);
  b.extrude([[0, 0], [0.06, 0.05], [0.07, 0.12], [0, 0.2, "sharp"], [-0.07, 0.12], [-0.06, 0.05]], {
    at: [e.x, 0.33, e.z + 0.02], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: P.stoneDark, bone: J.tail4,
  });
  b.extrude([[0, 0.04], [0.035, 0.09], [0, 0.17, "sharp"], [-0.035, 0.09]], {
    at: [e.x, 0.355, e.z + 0.02], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: P.stoneLight, bone: J.tail4,
  });

  // lichen flecks
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.018, 5, 3), P.lichen, {
      bone: J.hips, at: [(R() - 0.5) * 0.5, 0.82 + R() * 0.05, -0.35 + R() * 0.2], scale: [1, 0.4, 1],
    });
}
```