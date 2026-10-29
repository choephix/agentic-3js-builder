<!-- call: plan -->

```json
{
  "name": "Hydra of the Broken Spears",
  "description": "A hulking five-headed hydra in God of War style: blackened scarred hide, bone-white horns and fangs, rune-brands and wounds glowing ember-red, bronze spears and chains still lodged in its flesh.",
  "builderName": "godOfWarHydra",
  "size": [7.8, 5.9, 10.8],
  "layout": "A four-legged swamp-reptile titan facing +Z, front to back along z. The torso is a deep barrel (x +-1.5, y 1.5-3.6, z -2.4 to 2.4) with a heavy shoulder hump at the front. Four stout legs stand on y=0, hind legs digitigrade (knee forward, hock back), front legs with elbows back, each ending in three or four big bone claws. A thick tail leaves the rump, slopes down toward the floor and ends in a bone spade-blade at about z=-5.3.\n\nFive necks leave the chest top at z~1.8 and fan out in a rest pose, separated and not tangled, each rising, arcing forward and ending in a head that looks forward and slightly down. Neck A is the centre (x=0, tallest, head y~4.9). Necks B and C are inner left (+x) and inner right (-x), heads at x=+-2.0, y~4.5. Necks D and E are outer left and right, lower and splayed, heads at x=+-3.2, y~3.7. Silhouette from the front is a crown fan: the centre is highest, the outer heads lowest, with a clear gap between heads. The overall profile is a bulky, heavy-shouldered mass with long thin necks. Every head has an upper jaw on headX and a separate lower jaw on jawX, mouths shut or very slightly open, because the rig opens them.\n\nSTYLE (God of War, grim Norse/Greek myth): desaturated, cold, battle-worn. Hide is blackened green-grey (dark on top and flanks, dirty pale belly and throat plates underneath). Blocky chunky shapes with faceted low-poly segments. Each part gets broad plate and scale shapes: big overlapping dorsal and neck plates in a hideDark -> hideMid -> hideLight root-to-tip order, never fine noise. Warm accents are used sparingly and glow: ember-red and rune-orange cracks, rune brands and mouth interiors (the builder should use glow() from the glow kit on rune brands, eyes and mouth ember). Wounds, claw-scar slashes and dried blood strips in scarFlesh and blood. Souvenirs of past heroes: broken bronze spears and a lodged axe in the back, iron shackles and snapped chains on the ankles and necks, bronze armour scraps bolted into the hide. Bone horns, fangs and claws are big and clear. Mud and grime go on the feet (hideDark patches), and the belly is paler. Every surface is one flat colour per part; scars, runes, seams, rivets and eyes are small separate parts seated on the surface.\n\nWhat each part owns is listed under parts. Everything meets at the mounts: necks start at neckBase*, heads at head*, legs at hip*, tail at tailRoot.",
  "palette": {
    "hideDark": "#2a2f2c",
    "hideMid": "#3d4640",
    "hideLight": "#5a6658",
    "belly": "#8a8468",
    "scarFlesh": "#8c3b34",
    "blood": "#5e0f0e",
    "bone": "#d8cfb8",
    "boneDark": "#9c9078",
    "horn": "#3a342e",
    "hornTip": "#cfc4a8",
    "claw": "#1c1a18",
    "eyeAmber": "#ffb02a",
    "eyeSlit": "#0d0b0a",
    "mouthInner": "#7a1d1a",
    "tongue": "#b03a2e",
    "ember": "#ff4a1c",
    "runeGlow": "#ff7a1f",
    "iron": "#4c4f55",
    "ironDark": "#2b2d32",
    "bronze": "#8a6a34",
    "bronzeDark": "#5a431f",
    "chain": "#6b6e74",
    "leather": "#4a3626",
    "frost": "#9fc4d6"
  },
  "mounts": {
    "torsoCenter": [0, 2.6, 0],
    "shoulderHump": [0, 3.4, 1.2],
    "spineTop": [0, 3.6, 0],
    "chestFront": [0, 2.9, 2.2],
    "neckBaseA": [0, 3.0, 1.9],
    "neckBaseB": [0.6, 2.95, 1.9],
    "neckBaseC": [-0.6, 2.95, 1.9],
    "neckBaseD": [1.1, 2.9, 1.7],
    "neckBaseE": [-1.1, 2.9, 1.7],
    "headA": [0, 4.9, 3.9],
    "headB": [2.0, 4.5, 3.7],
    "headC": [-2.0, 4.5, 3.7],
    "headD": [3.2, 3.7, 3.2],
    "headE": [-3.2, 3.7, 3.2],
    "hipFL": [1.3, 2.5, 1.3],
    "hipFR": [-1.3, 2.5, 1.3],
    "hipHL": [1.4, 2.4, -1.5],
    "hipHR": [-1.4, 2.4, -1.5],
    "footFL": [1.8, 0.1, 2.1],
    "footFR": [-1.8, 0.1, 2.1],
    "footHL": [1.7, 0.1, -1.4],
    "footHR": [-1.7, 0.1, -1.4],
    "tailRoot": [0, 2.4, -2.2],
    "tailTip": [0, 0.4, -5.1]
  },
  "joints": [
    { "name": "hips", "at": [0, 2.4, -1.2], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 2.6, 0.1], "dir": [0, 0.1, 1], "role": "spine" },
    { "name": "chest", "parent": "spine", "at": [0, 2.8, 1.3], "dir": [0, 0.15, 1], "role": "spine" },

    { "name": "tail1", "parent": "hips", "at": [0, 2.4, -2.2], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 2.2, -3.0], "dir": [0, -0.35, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.7, -3.8], "dir": [0, -0.6, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 1.1, -4.4], "dir": [0, -0.6, -1], "role": "tail", "group": "tail" },
    { "name": "tail5", "parent": "tail4", "at": [0, 0.6, -4.8], "dir": [0, -0.4, -1], "role": "tail", "group": "tail" },
    { "name": "tail6", "parent": "tail5", "at": [0, 0.4, -5.1], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },

    { "name": "hipFL", "parent": "chest", "at": [1.3, 2.5, 1.3], "dir": [0.3, -1, -0.4], "role": "leg", "group": "legs" },
    { "name": "kneeFL", "parent": "hipFL", "at": [1.9, 1.4, 0.9], "dir": [-0.1, -0.7, 0.7], "role": "leg", "group": "legs" },
    { "name": "ankleFL", "parent": "kneeFL", "at": [1.8, 0.45, 1.5], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeFL", "parent": "ankleFL", "at": [1.8, 0.1, 2.1], "dir": [0, -0.2, 1], "role": "digit", "group": "legs" },

    { "name": "hipFR", "parent": "chest", "at": [-1.3, 2.5, 1.3], "dir": [-0.3, -1, -0.4], "role": "leg", "group": "legs" },
    { "name": "kneeFR", "parent": "hipFR", "at": [-1.9, 1.4, 0.9], "dir": [0.1, -0.7, 0.7], "role": "leg", "group": "legs" },
    { "name": "ankleFR", "parent": "kneeFR", "at": [-1.8, 0.45, 1.5], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeFR", "parent": "ankleFR", "at": [-1.8, 0.1, 2.1], "dir": [0, -0.2, 1], "role": "digit", "group": "legs" },

    { "name": "hipHL", "parent": "hips", "at": [1.4, 2.4, -1.5], "dir": [0.3, -0.8, 0.6], "role": "leg", "group": "legs" },
    { "name": "kneeHL", "parent": "hipHL", "at": [1.9, 1.5, -0.8], "dir": [-0.1, -0.5, -0.9], "role": "leg", "group": "legs" },
    { "name": "ankleHL", "parent": "kneeHL", "at": [1.7, 0.7, -2.0], "dir": [0, -0.9, 0.7], "role": "leg", "group": "legs" },
    { "name": "toeHL", "parent": "ankleHL", "at": [1.7, 0.1, -1.4], "dir": [0, -0.3, 1], "role": "digit", "group": "legs" },

    { "name": "hipHR", "parent": "hips", "at": [-1.4, 2.4, -1.5], "dir": [-0.3, -0.8, 0.6], "role": "leg", "group": "legs" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-1.9, 1.5, -0.8], "dir": [0.1, -0.5, -0.9], "role": "leg", "group": "legs" },
    { "name": "ankleHR", "parent": "kneeHR", "at": [-1.7, 0.7, -2.0], "dir": [0, -0.9, 0.7], "role": "leg", "group": "legs" },
    { "name": "toeHR", "parent": "ankleHR", "at": [-1.7, 0.1, -1.4], "dir": [0, -0.3, 1], "role": "digit", "group": "legs" },

    { "name": "neckA1", "parent": "chest", "at": [0, 3.0, 1.9], "dir": [0, 0.8, 0.5], "role": "neck", "group": "necks" },
    { "name": "neckA2", "parent": "neckA1", "at": [0, 4.0, 2.6], "dir": [0, 0.6, 0.8], "role": "neck", "group": "necks" },
    { "name": "neckA3", "parent": "neckA2", "at": [0, 4.7, 3.4], "dir": [0, 0.1, 1], "role": "neck", "group": "necks" },
    { "name": "headA", "parent": "neckA3", "at": [0, 4.9, 3.9], "dir": [0, -0.1, 1], "role": "head", "group": "heads" },
    { "name": "jawA", "parent": "headA", "at": [0, 4.7, 4.0], "dir": [0, -0.1, 1], "role": "jaw", "group": "heads" },

    { "name": "neckB1", "parent": "chest", "at": [0.6, 2.95, 1.9], "dir": [0.4, 0.8, 0.4], "role": "neck", "group": "necks" },
    { "name": "neckB2", "parent": "neckB1", "at": [1.2, 3.9, 2.5], "dir": [0.3, 0.5, 0.8], "role": "neck", "group": "necks" },
    { "name": "neckB3", "parent": "neckB2", "at": [1.8, 4.4, 3.2], "dir": [0.2, 0.1, 1], "role": "neck", "group": "necks" },
    { "name": "headB", "parent": "neckB3", "at": [2.0, 4.5, 3.7], "dir": [0.25, -0.15, 1], "role": "head", "group": "heads" },
    { "name": "jawB", "parent": "headB", "at": [2.05, 4.3, 3.8], "dir": [0.25, -0.15, 1], "role": "jaw", "group": "heads" },

    { "name": "neckC1", "parent": "chest", "at": [-0.6, 2.95, 1.9], "dir": [-0.4, 0.8, 0.4], "role": "neck", "group": "necks" },
    { "name": "neckC2", "parent": "neckC1", "at": [-1.2, 3.9, 2.5], "dir": [-0.3, 0.5, 0.8], "role": "neck", "group": "necks" },
    { "name": "neckC3", "parent": "neckC2", "at": [-1.8, 4.4, 3.2], "dir": [-0.2, 0.1, 1], "role": "neck", "group": "necks" },
    { "name": "headC", "parent": "neckC3", "at": [-2.0, 4.5, 3.7], "dir": [-0.25, -0.15, 1], "role": "head", "group": "heads" },
    { "name": "jawC", "parent": "headC", "at": [-2.05, 4.3, 3.8], "dir": [-0.25, -0.15, 1], "role": "jaw", "group": "heads" },

    { "name": "neckD1", "parent": "chest", "at": [1.1, 2.9, 1.7], "dir": [0.8, 0.6, 0.3], "role": "neck", "group": "necks" },
    { "name": "neckD2", "parent": "neckD1", "at": [2.0, 3.5, 2.1], "dir": [0.7, 0.3, 0.6], "role": "neck", "group": "necks" },
    { "name": "neckD3", "parent": "neckD2", "at": [2.9, 3.8, 2.7], "dir": [0.4, 0, 1], "role": "neck", "group": "necks" },
    { "name": "headD", "parent": "neckD3", "at": [3.2, 3.7, 3.2], "dir": [0.5, -0.2, 1], "role": "head", "group": "heads" },
    { "name": "jawD", "parent": "headD", "at": [3.3, 3.5, 3.3], "dir": [0.5, -0.2, 1], "role": "jaw", "group": "heads" },

    { "name": "neckE1", "parent": "chest", "at": [-1.1, 2.9, 1.7], "dir": [-0.8, 0.6, 0.3], "role": "neck", "group": "necks" },
    { "name": "neckE2", "parent": "neckE1", "at": [-2.0, 3.5, 2.1], "dir": [-0.7, 0.3, 0.6], "role": "neck", "group": "necks" },
    { "name": "neckE3", "parent": "neckE2", "at": [-2.9, 3.8, 2.7], "dir": [-0.4, 0, 1], "role": "neck", "group": "necks" },
    { "name": "headE", "parent": "neckE3", "at": [-3.2, 3.7, 3.2], "dir": [-0.5, -0.2, 1], "role": "head", "group": "heads" },
    { "name": "jawE", "parent": "headE", "at": [-3.3, 3.5, 3.3], "dir": [-0.5, -0.2, 1], "role": "jaw", "group": "heads" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The barrel torso and everything lodged in it. One smooth loft/sweep body skinned over hips, spine and chest (belly sags lower and is pale 'belly' colour via sectors; flanks hideMid, back hideDark) with a heavy shoulder hump at the front where the five necks sprout, and a thinner waist to the rump. Exposed rib ridges on the flanks (curved boneDark bars under the hide), a double row of big dorsal bone plates (hideDark root -> boneDark tip) along the spine from the shoulders to the rump (tailRoot), and pale belly plates (rows of flat 'belly' bands). Hide texture as chunky overlapping scale plates in hideMid/hideLight in patches, with mud/grime on the lower flanks in hideDark. Battle damage: three long diagonal claw-slash scars (scarFlesh strips with blood edges), a stitched leather-and-iron cauterised stump scar on the shoulder with glowing ember cracks (ember, glow), and rune brands (small runeGlow shapes of Norse-style angular glyphs, glow) on both flanks. Souvenirs: 3-4 broken bronze spears (bronzeDark shafts, bronze bands, iron heads) at slants in the back and flank, one big double-bladed iron axe (ironDark haft, iron head) buried in the left shoulder, a shattered bronze Spartan-style shield-rim shard bolted into the right flank with rivets, and two iron chains (chain, ironDark links as small torus/box links) wrapped around the chest and snapped, trailing links over the shoulder. Includes the neck-root collars: a thick scarred ring of hide plates around each of the five neck roots at neckBase*, sized to the neck radius (about 0.45 m for A, 0.4 m for B/C, 0.35 m for D/E) so the neck sweeps emerge from them. Belongs to joints hips, spine, chest. It does NOT build legs, tail, necks or heads.",
      "box": [[-1.8, 1.4, -2.5], [1.8, 4.4, 2.5]],
      "attaches": "Neck roots at neckBaseA..E (chest joint). Leg tops at hipFL/FR (chest) and hipHL/HR (hips). Tail begins at tailRoot (hips). Dorsal plates run from shoulderHump to tailRoot along spineTop.",
      "joints": ["hips", "spine", "chest"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "legs",
      "builds": "All four legs, standing on y=0 (claws sink up to 0.05 m into the floor). Front legs (FL, FR) elbow-back, heavy forearms, hind legs (HL, HR) digitigrade with big thighs, knee forward, hock back; use limb IK from the hip mounts to the foot mounts. Each leg is a smooth sweep on its joint chain (hip, knee, ankle, toe) with a muscular thigh/upper arm (radius about 0.5 at the hip tapering to 0.22 at the ankle), hideMid on the outside with hideDark underside; scale plates (hideLight edged) stacked down the front of each shin, a spiked knee/elbow spur (boneDark), and a broad four-toed foot with big curved bone claws (claw colour at the tip, boneDark base; 4 toes on front feet, 3 forward plus a dewclaw on hinds) spread out, plus toe pads and mud/grime patches in hideDark on the lower leg and foot. Details: an iron shackle ring (iron with ironDark rivets) around each ankle with a snapped chain stub dangling (chain links); fresh scars; rune bands (runeGlow, glow) on the thighs. The four legs are consistent mirrors (+x left): 2 of each. Belongs to joints hipFL..toeHR.",
      "box": [[-2.7, 0, -2.6], [2.7, 2.9, 2.6]],
      "attaches": "Tops meet the torso underside at hipFL/FR and hipHL/HR (the leg radius at the hip should overlap the torso). Feet at footFL, footFR, footHL, footHR on the floor.",
      "joints": ["hipFL", "kneeFL", "ankleFL", "toeFL", "hipFR", "kneeFR", "ankleFR", "toeFR", "hipHL", "kneeHL", "ankleHL", "toeHL", "hipHR", "kneeHR", "ankleHR", "toeHR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "tail",
      "builds": "The long thick tail, a smooth sweep over tail1..tail6 starting at tailRoot with radius 0.6 and tapering to 0.12, sloping down toward the floor and ending in a bone spade-blade. Countershaded: back hideDark, flanks hideMid, underside belly colour (sectors). A row of dorsal plates along the top continuing the torso's row (hideDark root -> boneDark tip) shrinking to the tip, side ridges of hideLight scale plates, banded scars (scarFlesh ring cuts) and ember-glow cracks (ember, glow) between plates. Near the base an iron shackle band (iron + ironDark rivets) with a snapped chain hanging. At the tip (tailTip) a big flat bone spade/blade extrude (bone, with boneDark notched edge, a central ridge, and a runeGlow glyph, glow) plus two side barbs. Belongs to joints tail1..tail6.",
      "box": [[-0.9, 0, -5.4], [0.9, 2.8, -2.1]],
      "attaches": "Starts at tailRoot, where the torso rump ends (overlap the rump radius slightly). Tip at tailTip.",
      "joints": ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "necks",
      "builds": "The five neck tubes from the chest roots to the head joints, each a smooth sweep skinned over its three neck joints (A: neckA1..A3, B: neckB1..3, C: neckC1..3, D: neckD1..3, E: neckE1..3), starting at neckBase* and ending at head*, where the head's skull overlaps the neck end. Radii: A 0.4 to 0.28, B/C 0.36 to 0.26, D/E 0.32 to 0.24. Colours by place: the back is hideDark -> hideMid, the throat/underside is 'belly' with ladder bands of throat plates. Each neck has a row of dorsal spine plates (hideDark, boneDark tips) and a pair of small side frills. Each neck wears its own history: A has two iron bands with rivets and a snapped chain; B has scarFlesh slash scars with stitching; C has a lodged broken bronze spear tip and a bloody wound; D has a bronze armour scrap bolted on with leather straps; E has glowing ember cracks (glow) and a rune brand. Add neck rings of scale plates in hideLight and a few small bone spikes. Mirror B/C and D/E consistently (+x left). Belongs to the neck joints only (not heads or jaws).",
      "box": [[-3.5, 2.6, 1.4], [3.5, 5.1, 3.9]],
      "attaches": "Roots at neckBaseA..E, which the torso collars surround. Each neck ends at headA..E, where the heads begin; necks stop at the head joint.",
      "joints": ["neckA1", "neckA2", "neckA3", "neckB1", "neckB2", "neckB3", "neckC1", "neckC2", "neckC3", "neckD1", "neckD2", "neckD3", "neckE1", "neckE2", "neckE3"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "heads",
      "builds": "All five dragon-like heads, built with one reusable head helper scaled per head (A 1.15, B and C 1.0, D and E 0.9; each head about 1.4 m long including snout, 0.7 m wide), at the headA..E mounts, each facing its joint's dir. Each head is a skull (hideMid with hideDark top) and a blocky tapered snout on the head joint (upper jaw: palate, upper teeth row of 8-10 bone fangs plus two long fangs), and a SEPARATE lower jaw on the jaw joint (jawA..E; chin, lower teeth row, tongue in tongue colour, throat in mouthInner, with a small glowing ember ember (glow) inside the mouth). The mouth is shut or only slightly open. Face: two big angry eyes seated on the sides of the skull (eyeAmber glow, with an eyeSlit vertical pupil and a dark brow ridge hideDark over them for a scowl), nostril holes on the snout tip, a heavy brow ridge, cheek frill of bone spikes, and a pair of large swept-back horns (horn colour with hornTip ends, ringed with boneDark bands), plus 2 small side horns and a short crest of plates down the back of the skull. Individual traits: A is the largest with a crown of 4 horns and a bronze circlet scrap; B has a broken horn (stump) and a slashed cheek (scarFlesh); C has a blinded eye (frost milky eye with a scar slash across it); D has an iron muzzle band with rivets and a chain; E has extra spikes and glowing ember cracks (glow) on the brow. Mirror B/C and D/E (+x left). Heads' parts ride headX (skull, upper jaw, horns, eyes) and jawX (lower jaw, lower teeth, tongue). Details seated on the head surface: wrinkles, scale plates, rune brand on forehead of A (runeGlow, glow). Do NOT build any neck tube.",
      "box": [[-3.9, 3.0, 3.0], [3.9, 5.9, 5.4]],
      "attaches": "Each head's back of skull sits on the neck end at headA..E; the jaw hinge is jawA..E, slightly below and behind the eye.",
      "joints": ["headA", "jawA", "headB", "jawB", "headC", "jawC", "headD", "jawD", "headE", "jawE"],
      "floor": false,
      "budget": 260
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: any) {
  const r = rng(11);
  const joints = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5, J.tail6];
  const pts: number[][] = [
    [0, 2.4, -2.1],
    [0, 2.3, -2.6],
    [0, 2.2, -3.0],
    [0, 1.7, -3.8],
    [0, 1.1, -4.4],
    [0, 0.6, -4.8],
    [0, 0.4, -5.1],
  ];
  const path = catmull(pts);
  const radius = (t: number) => 0.6 * (1 - t) + 0.12 * t;
  const tube = b.sweep(path, radius, {
    bone: joints,
    color: P.hideMid,
    sides: 8,
    caps: "round",
    sectors: [
      [-60, 60, P.hideDark],
      [135, 225, P.belly],
    ],
  });

  // dorsal plates, shrinking, root->tip colour
  const N = 12;
  for (let i = 0; i < N; i++) {
    const t = 0.04 + (i / (N - 1)) * 0.88;
    const at = tube.at(t, 0);
    const s = 1 - t * 0.75;
    const col = i < 4 ? P.hideDark : i < 8 ? P.boneDark : P.bone;
    b.stick(new THREE.ConeGeometry(0.17 * s, 0.4 * s, 4), col, at, { embed: 0.25 });
  }

  // side ridges of scale plates
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + i * 0.1;
      const at = tube.at(t, s * 85);
      const k = 1 - t * 0.6;
      b.stick(new THREE.BoxGeometry(0.2 * k, 0.05, 0.16 * k), i % 2 ? P.hideLight : P.hideMid, at, { embed: 0.3 });
    }
  }

  // scar ring cuts
  for (const t of [0.3, 0.52, 0.72]) {
    const loop = b.surface(tube).loop(tube.at(t), { lift: 0.01 });
    b.sweep(loop, 0.018, { color: P.scarFlesh });
    const loop2 = b.surface(tube).loop(tube.at(t + 0.015), { lift: 0.008 });
    b.sweep(loop2, 0.01, { color: P.blood });
  }

  // ember cracks between plates
  for (const [t, a] of [[0.2, 60], [0.38, -70], [0.55, 75], [0.66, -65], [0.8, 70]] as number[][]) {
    const at = tube.at(t, a);
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.2, 0.05), P.ember, at, { embed: 0.3, spin: r() * 60 }), 1.4);
  }

  // iron shackle band near base
  const bt = 0.17;
  const band = b.surface(tube).loop(tube.at(bt), { lift: 0.03 });
  b.sweep(band, 0.045, { color: P.iron });
  const bandIn = b.surface(tube).loop(tube.at(bt + 0.03), { lift: 0.02 });
  b.sweep(bandIn, 0.025, { color: P.ironDark });
  b.along(band, 6, (at: any) => b.stick(new THREE.SphereGeometry(0.04, 6, 4), P.ironDark, at, { embed: 0.2 }));
  // snapped chain hanging from the band's underside
  const ring = tube.at(bt, 180);
  const base = ring.at.clone();
  for (let i = 0; i < 5; i++) {
    const lk = new THREE.TorusGeometry(0.06, 0.02, 5, 8);
    b.part(lk, i % 2 ? P.ironDark : P.chain, {
      bone: J.tail2,
      at: [base.x + (i % 2 ? 0.02 : -0.02), base.y - 0.12 - i * 0.1, base.z - 0.02],
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
  }

  // bone spade blade at tip
  const tip = pts[6];
  const outline: any[] = [
    [0, 0],
    [0.3, 0.1],
    [0.42, 0.45, "sharp"],
    [0.3, 0.9],
    [0.12, 1.2, "sharp"],
    [0, 1.4, "sharp"],
    [-0.12, 1.2, "sharp"],
    [-0.3, 0.9],
    [-0.42, 0.45, "sharp"],
    [-0.3, 0.1],
  ];
  const sc = 0.8;
  const scaled = outline.map((p) => (p.length === 3 ? [p[0] * sc, p[1] * sc, "sharp"] : [p[0] * sc, p[1] * sc]));
  b.extrude(scaled, {
    at: [tip[0], tip[1] - 0.02, tip[2] - 0.1],
    x: [1, 0, 0],
    y: [0, 0.12, -1],
    thickness: 0.07,
    bevel: 0.015,
    color: P.bone,
    bone: J.tail6,
  });
  const bl = new THREE.Vector3(tip[0], tip[1] - 0.02, tip[2] - 0.1);
  const dir = new THREE.Vector3(0, 0.12, -1).normalize();
  // central ridge
  b.rod(bl.clone().addScaledVector(dir, 0.1).add(new THREE.Vector3(0, 0.05, 0)), bl.clone().addScaledVector(dir, 1.0).add(new THREE.Vector3(0, 0.05, 0)), 0.035, P.boneDark, { bone: J.tail6 });
  // notched edge teeth
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const p = bl.clone().addScaledVector(dir, 0.3 + i * 0.22);
      p.x += s * (0.33 - Math.abs(i - 1.2) * 0.07);
      b.part(new THREE.ConeGeometry(0.05, 0.12, 4), P.boneDark, { bone: J.tail6, at: p, dir: [s, 0, 0] });
    }
  // rune glyph
  const g = bl.clone().addScaledVector(dir, 0.65);
  g.y += 0.06;
  for (const [dx, dz, len, rot] of [[0, 0, 0.32, 0], [0.06, -0.05, 0.16, 40], [-0.06, 0.05, 0.16, -40]] as number[][]) {
    glow(
      b.part(new THREE.BoxGeometry(0.035, 0.02, len), P.runeGlow, {
        bone: J.tail6,
        at: [g.x + dx, g.y, g.z + dz],
        rotation: [0, rot, 0],
      }),
      1.5,
    );
  }
  // side barbs
  for (const s of [1, -1]) {
    const p = bl.clone().addScaledVector(dir, 0.35);
    p.x += s * 0.2;
    b.spike([p.x, p.y, p.z], [s * 0.7, 0.1, -0.5], 0.45, 0.07, { color: P.bone, bone: J.tail6 });
  }
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const D = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();

  const legRadius = (t: number, front: boolean) => {
    const keys = front ? [0.52, 0.46, 0.34, 0.26, 0.22, 0.2] : [0.55, 0.5, 0.36, 0.26, 0.22, 0.2];
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };

  const makeLeg = (kind: "F" | "H", side: "L" | "R") => {
    const front = kind === "F";
    const hip = J["hip" + kind + side];
    const knee = J["knee" + kind + side];
    const ankle = J["ankle" + kind + side];
    const toe = J["toe" + kind + side];
    const sx = side === "L" ? 1 : -1;
    const foot = V(M["foot" + kind + side]);

    const path = [V(hip.at.toArray()), V(knee.at.toArray()), V(ankle.at.toArray()), V(toe.at.toArray())];
    path[3].y = Math.max(path[3].y, 0.2);
    const sw = b.sweep(path, (t: number) => legRadius(t, front), {
      bone: [hip, knee, ankle, toe],
      color: P.hideMid,
      sectors: [[110, 250, P.hideDark]],
      sides: 8,
      caps: "round",
    });

    // knee / elbow spur
    const kd = front ? D(sx * 0.5, 0.25, -1) : D(sx * 0.5, 0.3, 1);
    b.spike(knee.at, kd, 0.55, 0.14, { color: P.boneDark, bone: knee });
    const kd2 = front ? D(sx * 0.9, 0.5, -0.5) : D(sx * 0.9, 0.6, 0.5);
    b.spike(knee.at, kd2, 0.32, 0.08, { color: P.bone, bone: knee });

    // shin scale plates
    for (let i = 0; i < 5; i++) {
      const t = 0.48 + i * 0.09;
      const h = sw.at(t, 0);
      b.stick(new THREE.BoxGeometry(0.3 - i * 0.015, 0.06, 0.2), P.hideDark, h, { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.24 - i * 0.015, 0.06, 0.15), P.hideLight, h, { embed: 0.1 });
    }
    // thigh scale patches
    for (const [t, a] of [[0.12, 40], [0.2, -40], [0.28, 70]] as number[][]) {
      const h = sw.at(t, sx * a);
      b.stick(new THREE.BoxGeometry(0.22, 0.05, 0.18), P.hideLight, h, { embed: 0.3 });
    }

    // rune band on thigh
    const rp = sw.at(0.17);
    const band = b.part(new THREE.TorusGeometry(rp.radius + 0.02, 0.025, 4, 12), P.runeGlow, {
      bone: hip, at: rp.at, dir: rp.tangent, axis: "z",
    });
    glow(band, 1.4);
    for (let i = 0; i < 3; i++) {
      const g = sw.at(0.17, 70 + i * 25 * sx);
      glow(b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.14), P.runeGlow, g, { embed: 0.2, spin: i * 35 }), 1.5);
    }

    // scars
    const sc = sw.at(0.32, sx * 80);
    b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.4), P.blood, sc, { embed: 0.3, spin: 35 });
    b.stick(new THREE.BoxGeometry(0.025, 0.03, 0.38), P.scarFlesh, sc, { embed: 0.3, spin: 35 });
    const sc2 = sw.at(0.4, sx * 100);
    b.stick(new THREE.BoxGeometry(0.04, 0.02, 0.3), P.scarFlesh, sc2, { embed: 0.3, spin: -30 });

    // mud
    for (const [t, a] of [[0.78, 120], [0.88, -110], [0.95, 160]] as number[][]) {
      b.stick(new THREE.SphereGeometry(0.16, 6, 4), P.hideDark, sw.at(t, a), { embed: 0.55, scale: [1, 0.5, 1.2] });
    }

    // shackle
    const ap = sw.at(0.66);
    const ar = ap.radius + 0.03;
    b.part(new THREE.TorusGeometry(ar, 0.06, 5, 12), P.iron, { bone: ankle, at: ap.at, dir: ap.tangent, axis: "z" });
    for (let i = 0; i < 4; i++) {
      const g = sw.at(0.66, i * 90 + 20);
      b.stick(new THREE.SphereGeometry(0.045, 5, 4), P.ironDark, g, { embed: -0.2 });
    }
    const lug = sw.at(0.66, sx * 90);
    b.stick(new THREE.BoxGeometry(0.1, 0.1, 0.08), P.iron, lug, { embed: -0.3 });
    // chain stub
    let cy = lug.at.y - 0.1;
    for (let i = 0; i < 4; i++) {
      const link = new THREE.TorusGeometry(0.05, 0.015, 4, 8);
      b.part(link, i % 2 ? P.chain : P.ironDark, {
        bone: ankle,
        at: [lug.at.x + sx * (0.08 + i * 0.01), cy, lug.at.z],
        rotation: [0, i % 2 ? 0 : 90, 0],
      });
      cy -= 0.07;
    }

    // foot
    b.part(new THREE.SphereGeometry(0.36, 8, 6), P.hideDark, {
      bone: toe, at: [foot.x, 0.12, foot.z + 0.12], scale: [1.05, 0.4, 1.3],
    });
    const n = front ? 4 : 3;
    const base = new THREE.Vector3(toe.at.x, 0.17, toe.at.z - 0.2);
    for (let i = 0; i < n; i++) {
      const a = ((i - (n - 1) / 2) * (front ? 26 : 32) + sx * 4) * (Math.PI / 180);
      const L = (front ? 0.55 : 0.5) * (1 - Math.abs(i - (n - 1) / 2) * 0.08);
      const dir = D(Math.sin(a), 0, Math.cos(a));
      const tip = base.clone().addScaledVector(dir, L);
      tip.y = 0.14;
      b.rod(base, tip, [0.14, 0.11], P.hideMid, { bone: toe, sides: 6 });
      b.stick(new THREE.SphereGeometry(0.1, 5, 4), P.hideDark, { at: tip, axis: dir, n: dir } as any, { embed: 0.5 } as any);
    }
    // claws built separately (explicit positions)
    for (let i = 0; i < n; i++) {
      const a = ((i - (n - 1) / 2) * (front ? 26 : 32) + sx * 4) * (Math.PI / 180);
      const L = (front ? 0.55 : 0.5) * (1 - Math.abs(i - (n - 1) / 2) * 0.08);
      const d = D(Math.sin(a), 0, Math.cos(a));
      const tip = base.clone().addScaledVector(d, L);
      tip.y = 0.14;
      const cd = D(d.x, -0.3, d.z);
      b.spike(tip, cd, 0.3, 0.085, { color: P.boneDark, bone: toe, sides: 6 });
      const t2 = tip.clone().addScaledVector(cd, 0.22);
      b.spike(t2, D(d.x, -0.4, d.z), 0.2, 0.05, { color: P.claw, bone: toe, sides: 6 });
      // toe pad
      b.part(new THREE.SphereGeometry(0.09, 5, 4), P.hideDark, {
        bone: toe, at: [tip.x - d.x * 0.1, 0.05, tip.z - d.z * 0.1], scale: [1, 0.4, 1.2],
      });
    }
    if (!front) {
      const bp = new THREE.Vector3(toe.at.x + sx * 0.25, 0.5, toe.at.z - 0.55);
      b.spike(bp, D(sx * 0.6, -0.2, -1), 0.4, 0.08, { color: P.boneDark, bone: ankle, sides: 6 });
      b.spike(bp.clone().add(D(sx * 0.6, -0.2, -1).multiplyScalar(0.3)), D(sx * 0.6, -0.5, -1), 0.2, 0.045, {
        color: P.claw, bone: ankle, sides: 6,
      });
    }
    // hock spike / extra bone ridge on hind
    if (!front) b.spike(ankle.at, D(sx * 0.2, 0.2, -1), 0.4, 0.1, { color: P.bone, bone: ankle, sides: 6 });
    void R;
  };

  for (const k of ["F", "H"] as const) for (const s of ["L", "R"] as const) makeLeg(k, s);
}
```

<!-- call: necks -->

```ts
import * as THREE from "three";
import { catmull, frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildNecks({ b, J, P, M }: Ctx) {
  const pt = (v: any): number[] => (Array.isArray(v) ? v : v.toArray());
  const R = rng(11);

  const necks = [
    { L: "A", s: 0, r: [0.4, 0.28] },
    { L: "B", s: 1, r: [0.36, 0.26] },
    { L: "C", s: -1, r: [0.36, 0.26] },
    { L: "D", s: 1, r: [0.32, 0.24] },
    { L: "E", s: -1, r: [0.32, 0.24] },
  ];

  for (const n of necks) {
    const { L, s } = n;
    const [r0, r1] = n.r;
    const rad = (t: number) => r0 + (r1 - r0) * t;
    const joints = [J["neck" + L + "1"], J["neck" + L + "2"], J["neck" + L + "3"]];
    const boneAt = (t: number) => joints[t < 0.33 ? 0 : t < 0.66 ? 1 : 2];
    const path = catmull([
      pt(M["neckBase" + L]),
      pt(joints[1].at),
      pt(joints[2].at),
      pt(M["head" + L]),
    ]);
    const tube = b.sweep(path, [r0, r1], {
      bone: joints,
      color: (t: number) => (t < 0.45 ? P.hideDark : P.hideMid),
      sectors: [[125, 235, P.belly]],
      sides: 10,
    });
    const curve = path;
    const side = s > 0 ? -90 : 90; // outward side angle
    const outer = s === 0 ? 90 : side;

    // dorsal plates: hideDark base with boneDark tips
    b.along(tube, 4, (at: any) => {
      const t = at.t ?? 0.5;
      b.stick(new THREE.ConeGeometry(0.1, 0.24, 5), P.hideDark, at, { embed: 0.25 });
      b.stick(new THREE.ConeGeometry(0.04, 0.12, 5), P.boneDark, at.moved([0, 0.16, 0]), { embed: 0 });
    });

    // throat ladder bands
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const h = tube.at(t, 180);
      b.stick(new THREE.BoxGeometry(rad(t) * 1.5, 0.05, 0.1), P.boneDark, h, { embed: 0.5 });
    }

    // ring of hideLight scale plates
    {
      const t = 0.5;
      const c = curve.at(t);
      const tan = curve.tangentAt(t);
      b.ring(frame(c, tan), { count: 5, radius: rad(t) }, (item: any) =>
        b.stick(new THREE.BoxGeometry(0.2, 0.09, 0.12), P.hideLight, item, { embed: 0.5, bone: boneAt(t) }),
      );
    }

    // side frills
    for (const sg of [1, -1])
      for (const t of [0.35, 0.65]) {
        if (t === 0.65 && sg === 1 && false) continue;
        const h = tube.at(t, sg * 90);
        b.stick(new THREE.ConeGeometry(0.09, 0.28, 4), P.hideLight, h, { embed: 0.15, scale: [1, 1, 0.4] });
      }
    // small bone spikes
    for (const t of [0.25, 0.75]) {
      b.stick(new THREE.ConeGeometry(0.035, 0.16, 5), P.bone, tube.at(t, 45 * (R() > 0.5 ? 1 : -1) + 0), { embed: 0.2 });
    }

    const band = (t: number, col: string, w = 0.04, off = 0.02) => {
      const c = curve.at(t);
      const tan = curve.tangentAt(t);
      b.part(new THREE.TorusGeometry(rad(t) + off, w, 6, 14), col, { at: c, dir: tan, axis: "z", bone: boneAt(t) });
    };

    if (L === "A") {
      for (const t of [0.3, 0.62]) {
        band(t, P.iron, 0.045);
        const c = curve.at(t);
        const tan = curve.tangentAt(t);
        b.ring(frame(c, tan), { count: 4, radius: rad(t) + 0.05, fromDeg: 120, toDeg: 240 }, (item: any) =>
          b.stick(new THREE.SphereGeometry(0.03, 5, 4), P.ironDark, item, { embed: 0.2, bone: boneAt(t) }),
        );
      }
      const p = tube.at(0.3, 180).at;
      for (let i = 0; i < 4; i++)
        b.part(new THREE.TorusGeometry(0.05, 0.013, 5, 8), P.chain, {
          at: [p.x + (i === 3 ? 0.05 : 0), p.y - 0.1 - 0.09 * i, p.z],
          rotation: [0, (i % 2) * 90, i === 3 ? 30 : 0],
          bone: joints[0],
        });
    }

    if (L === "B") {
      for (const [t, sp] of [[0.3, 35], [0.55, 30], [0.75, 40]] as const) {
        const h = tube.at(t, outer);
        b.stick(new THREE.BoxGeometry(0.035, 0.02, 0.34), P.scarFlesh, h, { spin: sp, embed: 0.4 });
        b.stick(new THREE.BoxGeometry(0.012, 0.015, 0.36), P.blood, h.moved([0.03, 0, 0]), { spin: sp, embed: 0.3 });
        for (let k = -2; k <= 2; k++)
          b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.012), P.leather, h.moved([0, 0, k * 0.06]), { spin: sp, embed: 0.3 });
      }
    }

    if (L === "C") {
      const t = 0.5;
      const h = tube.at(t, outer);
      const tan = h.tangent;
      const dir = h.n.clone().addScaledVector(tan, 0.6).normalize();
      const at = (d: number) => h.at.clone().addScaledVector(dir, d);
      b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 6), P.bronzeDark, { at: at(0.15), dir: dir.toArray(), bone: joints[1] });
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.bronze, { at: at(0.1), dir: dir.toArray(), bone: joints[1] });
      b.part(new THREE.ConeGeometry(0.03, 0.1, 4), P.hornTip, { at: at(0.4), dir: dir.toArray(), bone: joints[1] });
      b.stick(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 8), P.scarFlesh, h, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 7), P.blood, h, { embed: 0.2 });
      for (const [t2, a] of [[0.55, 10], [0.62, -10]] as const)
        b.stick(new THREE.BoxGeometry(0.03, 0.015, 0.22), P.blood, tube.at(t2, outer + a), { embed: 0.4 });
    }

    if (L === "D") {
      const h = tube.at(0.5, outer);
      b.stick(new THREE.BoxGeometry(0.3, 0.05, 0.28), P.bronze, h, { embed: 0.2 });
      b.stick(new THREE.BoxGeometry(0.22, 0.02, 0.2), P.bronzeDark, h.moved([0, 0.03, 0]), { embed: 0 });
      for (const t of [0.42, 0.58]) band(t, P.leather, 0.025, 0.035);
      for (const [x, z] of [[-0.1, -0.09], [0.1, 0.09]])
        b.stick(new THREE.SphereGeometry(0.02, 5, 4), P.ironDark, h.moved([x, 0.05, z]), { embed: 0 });
    }

    if (L === "E") {
      const cr = [[0.25, 110], [0.45, 80], [0.65, 120], [0.8, 95]] as const;
      cr.forEach(([t, a], i) => {
        const h = tube.at(t, s * a * -1 + (s < 0 ? 0 : 0));
        glow(b.stick(new THREE.BoxGeometry(0.025, 0.015, 0.2), P.ember, h, { spin: i % 2 ? 30 : -25, embed: 0.4 }), 1.4);
        glow(b.stick(new THREE.BoxGeometry(0.02, 0.015, 0.12), P.ember, h.moved([0.04, 0, 0.08]), { spin: i % 2 ? -40 : 45, embed: 0.4 }), 1.4);
      });
      const h = tube.at(0.45, outer);
      glow(b.stick(new THREE.BoxGeometry(0.025, 0.02, 0.22), P.runeGlow, h, { embed: 0.4 }), 1.3);
      glow(b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.14), P.runeGlow, h.moved([0.04, 0, 0.04]), { spin: 40, embed: 0.4 }), 1.3);
      glow(b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.14), P.runeGlow, h.moved([-0.04, 0, -0.04]), { spin: -40, embed: 0.4 }), 1.3);
    }
  }
}
```

<!-- call: heads -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeads({ b, J, P }: any) {
  const V = THREE.Vector3;
  const JJ = J as any;
  const PP = P as any;

  function makeHead(key: string, sc: number) {
    const hj = JJ["head" + key];
    const jj = JJ["jaw" + key];
    const o = new V().copy(hj.at);
    const f = new V().copy(hj.axis).normalize();
    const left = new V(0, 1, 0).cross(f).normalize();
    const up = f.clone().cross(left).normalize();
    const Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(left, up, f));
    const Pt = (l: number, u: number, w: number) =>
      o.clone().addScaledVector(left, l * sc).addScaledVector(up, u * sc).addScaledVector(f, w * sc);
    const D = (l: number, u: number, w: number) =>
      left.clone().multiplyScalar(l).addScaledVector(up, u).addScaledVector(f, w).normalize();
    const qrot = (rot?: number[]) =>
      rot ? Q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]))) : Q;
    const box = (w: number, h: number, d: number, col: string, l: number, u: number, fw: number, bone: any, rot?: number[]) =>
      b.part(new THREE.BoxGeometry(w * sc, h * sc, d * sc), col, { bone, at: Pt(l, u, fw), quat: qrot(rot) });
    const sph = (rx: number, ry: number, rz: number, col: string, l: number, u: number, fw: number, bone: any) =>
      b.part(new THREE.SphereGeometry(1, 8, 6), col, {
        bone, at: Pt(l, u, fw), quat: Q, scale: [rx * sc, ry * sc, rz * sc], flat: true,
      });
    const spike = (base: any, dir: any, len: number, r: number, col: string, bone: any, extra: any = {}) =>
      b.spike(base, dir, len * sc, r * sc, { color: col, bone, sides: 4, ...extra });

    // ---- skull, snout, jaw
    box(0.7, 0.4, 0.7, PP.hideMid, 0, 0.05, 0.3, hj);
    box(0.64, 0.08, 0.66, PP.hideDark, 0, 0.23, 0.3, hj);
    b.frustumBox(Pt(0, 0.06, 0.55), Pt(0, 0.04, 1.35), [0.5 * sc, 0.26 * sc], [0.3 * sc, 0.2 * sc], {
      color: PP.hideMid, bone: hj,
    });
    for (const fw of [0.78, 1.05]) {
      const t = (fw - 0.55) / 0.8;
      box(0.22 - 0.07 * t, 0.03, 0.14, PP.hideLight, 0, 0.175 - 0.03 * t, fw, hj);
    }
    for (const s of [1, -1]) box(0.05, 0.035, 0.02, PP.claw, s * 0.07, 0.07, 1.36, hj);

    b.frustumBox(Pt(0, -0.165, 0.5), Pt(0, -0.12, 1.28), [0.44 * sc, 0.13 * sc], [0.26 * sc, 0.1 * sc], {
      color: PP.hideMid, bone: jj,
    });
    for (const [fw, u] of [[0.7, -0.222], [1.05, -0.185]] as number[][]) box(0.26, 0.03, 0.2, PP.belly, 0, u + 0.005, fw, jj);
    box(0.14, 0.03, 0.5, PP.tongue, 0, -0.09, 0.85, jj);
    for (const s of [1, -1])
      glow(box(0.012, 0.014, 0.7, PP.ember, s * 0.18, -0.078, 0.95, hj), 1.6);

    // ---- teeth
    const hwU = (fw: number) => 0.25 - ((fw - 0.55) / 0.8) * 0.1;
    const hwL = (fw: number) => 0.22 - ((fw - 0.5) / 0.78) * 0.09;
    for (const s of [1, -1]) {
      for (const fw of [0.8, 1.0, 1.2]) {
        const t = (fw - 0.55) / 0.8;
        spike(Pt(s * (hwU(fw) - 0.025), -0.06 + 0.01 * t, fw), D(0, -1, 0), 0.1, 0.028, PP.bone, hj);
      }
      const t = (1.1 - 0.55) / 0.8;
      spike(Pt(s * (hwU(1.1) - 0.02), -0.06 + 0.01 * t, 1.1), D(s * 0.05, -1, 0.1), 0.22, 0.042, PP.bone, hj);
      for (const fw of [0.85, 1.12]) {
        const tl = (fw - 0.5) / 0.78;
        spike(Pt(s * (hwL(fw) - 0.03), -0.11 + 0.03 * tl, fw), D(0, 1, 0), 0.08, 0.024, PP.bone, jj);
      }
    }

    // ---- eyes and brows
    const blind = key === "C";
    for (const s of [1, -1]) {
      const milky = blind && s === 1;
      const eye = sph(0.06, 0.09, 0.1, milky ? PP.frost : PP.eyeAmber, s * 0.32, 0.1, 0.38, hj);
      if (!milky) {
        glow(eye, 1.3);
        box(0.01, 0.11, 0.025, PP.eyeSlit, s * 0.376, 0.1, 0.4, hj);
      } else {
        box(0.014, 0.22, 0.03, PP.scarFlesh, s * 0.384, 0.1, 0.38, hj, [0.8, 0, 0]);
        box(0.012, 0.22, 0.012, PP.blood, s * 0.385, 0.1, 0.42, hj, [0.8, 0, 0]);
      }
      box(0.3, 0.07, 0.3, PP.hideDark, s * 0.26, 0.21, 0.4, hj, [0, 0, s * 0.3]);
    }

    // ---- horns
    const horn = (pts: number[][], s: number, r0: number, r1: number, broken = false) => {
      const path = catmull(pts.map((p) => Pt(s * p[0], p[1], p[2])));
      b.sweep(path, [r0 * sc, r1 * sc], {
        bone: hj, color: PP.horn, sides: 6,
        bands: broken ? undefined : [[0.65, PP.horn], [1, PP.hornTip]],
        caps: broken ? "flat" : "point",
      });
      const rr = (r0 + (r1 - r0) * 0.35) * 1.25 * sc;
      b.part(new THREE.CylinderGeometry(rr, rr, 0.035 * sc, 8), PP.boneDark, {
        bone: hj, at: path.at(0.35), dir: path.tangentAt(0.35),
      });
      if (broken) {
        const e = pts[pts.length - 1];
        box(0.08, 0.03, 0.06, PP.hornTip, s * e[0], e[1] + 0.01, e[2] - 0.01, hj, [0.4, 0, s * 0.3]);
      }
    };
    const mainHorn = [[0.22, 0.2, 0.1], [0.34, 0.38, -0.05], [0.46, 0.5, -0.3], [0.5, 0.68, -0.62]];
    const stump = [[0.22, 0.2, 0.1], [0.3, 0.32, 0.0], [0.37, 0.4, -0.12]];
    for (const s of [1, -1]) {
      if (key === "B" && s === 1) horn(stump, s, 0.075, 0.055, true);
      else horn(mainHorn, s, 0.075, 0.01);
      if (key === "A") horn([[0.12, 0.25, 0.05], [0.16, 0.5, -0.1], [0.2, 0.78, -0.3], [0.18, 1.0, -0.6]], s, 0.06, 0.01);
      spike(Pt(s * 0.36, -0.02, 0.08), D(s, 0.2, -0.8), 0.3, 0.06, PP.horn, hj, {
        bands: [[0.6, PP.horn], [1, PP.hornTip]],
      });
      for (let i = 0; i < 2; i++)
        spike(Pt(s * 0.34, -0.08, 0.35 + 0.17 * i), D(s, -0.1, -0.7), 0.22, 0.045, PP.bone, hj);
    }
    for (const fw of [0.1, 0.3]) spike(Pt(0, 0.27, fw), D(0, 1, -0.5), 0.15, 0.06, PP.boneDark, hj);

    // ---- individual traits
    if (key === "A") {
      box(0.74, 0.05, 0.07, PP.bronze, 0, 0.25, 0.12, hj);
      for (const s of [1, -1]) {
        box(0.03, 0.34, 0.07, PP.bronze, s * 0.36, 0.08, 0.12, hj);
        sph(0.02, 0.02, 0.02, PP.bronzeDark, s * 0.2, 0.28, 0.12, hj);
      }
      box(0.16, 0.14, 0.02, PP.bronze, 0, 0.3, 0.15, hj, [-0.5, 0, 0]);
      glow(box(0.03, 0.012, 0.22, PP.runeGlow, 0, 0.275, 0.52, hj), 1.4);
      glow(box(0.13, 0.012, 0.025, PP.runeGlow, 0, 0.275, 0.46, hj), 1.4);
      for (const s of [1, -1]) glow(box(0.03, 0.012, 0.13, PP.runeGlow, s * 0.05, 0.275, 0.62, hj, [0, s * 0.7, 0]), 1.4);
    }
    if (key === "B") {
      for (let i = 0; i < 3; i++) {
        box(0.012, 0.17, 0.022, PP.scarFlesh, 0.357, -0.02, 0.38 + 0.08 * i, hj, [0.6, 0, 0]);
        box(0.01, 0.17, 0.008, PP.blood, 0.358, -0.02, 0.405 + 0.08 * i, hj, [0.6, 0, 0]);
      }
    }
    if (key === "D") {
      const t = 0.56;
      const hw = 0.194 + 0.012, hh = 0.113 + 0.012, cu = 0.05, fw = 1.0;
      box(hw * 2, 0.03, 0.12, PP.iron, 0, cu + hh, fw, hj);
      box(hw * 2, 0.03, 0.12, PP.iron, 0, cu - hh, fw, hj);
      for (const s of [1, -1]) {
        box(0.03, hh * 2, 0.12, PP.iron, s * hw, cu, fw, hj);
        sph(0.018, 0.018, 0.018, PP.ironDark, s * 0.08, cu + hh + 0.02, fw + 0.04, hj);
      }
      void t;
      for (let i = 0; i < 4; i++)
        box(i % 2 ? 0.015 : 0.04, 0.07, i % 2 ? 0.04 : 0.015, PP.chain, 0.21, cu - hh - 0.02 - 0.06 * i, fw, hj);
    }
    if (key === "E") {
      for (const s of [1, -1]) {
        for (let i = 0; i < 3; i++)
          spike(Pt(s * 0.3, 0.26, 0.2 + 0.13 * i), D(s * 0.3, 1, -0.4), 0.2, 0.04, PP.bone, hj);
        glow(box(0.16, 0.012, 0.022, PP.ember, s * 0.27, 0.252, 0.4, hj, [0, s * 0.3, s * 0.3]), 1.6);
        glow(box(0.1, 0.012, 0.022, PP.runeGlow, s * 0.12, 0.275, 0.5, hj, [0, -s * 0.6, 0]), 1.4);
      }
    }
  }

  makeHead("A", 1.15);
  makeHead("B", 1.0);
  makeHead("C", 1.0);
  makeHead("D", 0.9);
  makeHead("E", 0.9);
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const R = rng(11);

  // ---------- body: hips -> spine -> chest ----------
  const body = b.loft(
    [
      { at: [0, 2.45, -2.35], w: 1.5, h: 1.6 },
      { at: [0, 2.45, -1.5], w: 2.6, h: 2.1 },
      { at: [0, 2.5, -0.5], w: 2.3, h: 2.0 },
      { at: [0, 2.55, 0.7], w: 2.9, h: 2.3 },
      { at: [0, 2.55, 1.7], w: 3.1, h: 2.5 },
      { at: [0, 2.6, 2.45], w: 2.4, h: 2.0 },
    ],
    {
      bone: [J.hips, J.spine, J.chest],
      color: P.hideMid,
      sectors: [
        [-60, 60, P.hideDark],
        [125, 235, P.belly],
      ],
    },
  );
  const hump = b.part(new THREE.SphereGeometry(1, 8, 6), P.hideDark, {
    bone: J.chest,
    at: M.shoulderHump,
    scale: [1.25, 0.62, 1.1],
  });
  const skin = b.surface([body, hump]);
  const down = [0, -1, 0];

  // ---------- dorsal plates, two rows ----------
  const zs = [2.0, 1.2, 0.4, -0.4, -1.2, -1.95];
  zs.forEach((z, i) => {
    const s = 1.05 - i * 0.1;
    for (const sx of [1, -1]) {
      const h = skin.ray([sx * 0.42, 6, z], down);
      if (!h) continue;
      b.stick(new THREE.ConeGeometry(0.2 * s, 0.5 * s, 4), P.hideDark, h, { embed: 0.2, flat: true, spin: 45 });
      b.stick(new THREE.ConeGeometry(0.1 * s, 0.38 * s, 4), P.boneDark, h.moved([0, 0.3 * s, 0]), {
        embed: 0.1,
        flat: true,
        spin: 45,
      });
    }
  });

  // ---------- ribs ----------
  for (const s of [1, -1]) {
    for (const z of [1.4, 0.8, 0.2, -0.4]) {
      const pts: number[][] = [];
      for (const e of [-35, -10, 15, 45]) {
        const h = skin.around([0, 2.55, z]).at(s * 90, e);
        if (h) pts.push(h.moved([0, 0.03, 0]).at.toArray());
      }
      if (pts.length > 2) b.sweep(catmull(pts), [0.06, 0.04], { color: P.boneDark, bone: J.spine, sides: 5 });
    }
  }

  // ---------- belly bands ----------
  for (const z of [1.5, 0.7, -0.1, -0.9]) {
    for (const x of [-0.75, 0, 0.75]) {
      const h = skin.ray([x, -1, z], [0, 1, 0]);
      if (h) b.stick(new THREE.BoxGeometry(0.7, 0.12, 0.32), "#a8a184", h, { embed: 0.5, flat: true });
    }
  }

  // ---------- scale plates and mud ----------
  skin
    .scatter(14, { rng: R, minDist: 0.5, filter: (h) => h.n.y > 0.05 && Math.abs(h.at.x) > 0.7 })
    .forEach((h, i) => {
      b.stick(new THREE.CylinderGeometry(0.2, 0.3, 0.1, 5), i % 2 ? P.hideLight : P.hideMid, h, {
        embed: 0.4,
        flat: true,
        spin: i * 37,
      });
    });
  skin
    .scatter(6, { rng: R, minDist: 0.6, filter: (h) => h.at.y < 2.2 && Math.abs(h.n.x) > 0.4 })
    .forEach((h, i) => {
      b.stick(new THREE.SphereGeometry(0.22, 5, 4), P.hideDark, h, { embed: 0.5, scale: [1.4, 0.3, 1], spin: i * 50 });
    });

  // ---------- claw slashes on right flank ----------
  const flank = (s: number, z: number, y: number) => skin.ray([s * 5, y, z], [-s, 0, 0]);
  [1.5, 1.1, 0.7].forEach((z0) => {
    const path = [
      [z0, 3.55],
      [z0 - 0.15, 3.15],
      [z0 - 0.35, 2.75],
      [z0 - 0.55, 2.35],
    ];
    const pts = (lift: number) =>
      path.map(([z, y]) => flank(-1, z, y)).filter(Boolean).map((h) => h!.moved([0, lift, 0]).at.toArray());
    const a = pts(0.03);
    const c = pts(0.045);
    if (a.length > 2) {
      b.sweep(catmull(a), 0.075, { color: P.blood, bone: J.spine, sides: 4 });
      b.sweep(catmull(c), 0.045, { color: P.scarFlesh, bone: J.spine, sides: 4 });
    }
  });

  // ---------- stump scar, right shoulder ----------
  {
    const h = skin.ray([-1.0, 6, 1.4], down);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.34, 0.42, 0.35, 7), P.scarFlesh, h, { embed: 0.3, flat: true });
      glow(b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 7), P.ember, h.moved([0, 0.28, 0]), { embed: 0 }), 1.6);
      b.ring(h.moved([0, 0.05, 0]), { count: 8, radius: 0.4 }, (it: any) => {
        b.stick(new THREE.BoxGeometry(0.07, 0.24, 0.05), P.leather, it, { embed: 0.3, bone: J.chest });
      });
      b.ring(h.moved([0, 0.3, 0]), { count: 5, radius: 0.0 }, (it: any) => {
        glow(b.spike(it, it, 0.3, 0.03, { color: P.ember, bone: J.chest }), 1.5);
      });
      b.part(new THREE.BoxGeometry(0.22, 0.05, 0.12), P.iron, { bone: J.chest, at: h.moved([0.0, 0.1, 0.42]).at });
    }
  }

  // ---------- rune brands ----------
  const rune = (h: any, v: number) => {
    if (!h) return;
    const strokes = v
      ? [[0, 0, 0.5, 0], [0.1, 0.1, 0.28, 50], [0.1, -0.1, 0.28, -50]]
      : [[0, 0, 0.5, 0], [-0.1, 0.12, 0.28, -45], [0.0, -0.18, 0.3, 90]];
    for (const [dx, dz, len, sp] of strokes) {
      glow(
        b.stick(new THREE.BoxGeometry(0.055, 0.05, len), P.runeGlow, h.moved([dx, 0, dz]), { embed: 0.3, spin: sp }),
        1.4,
      );
    }
  };
  rune(flank(1, 0.5, 2.9), 0);
  rune(flank(1, -0.5, 2.6), 1);
  rune(flank(-1, -0.8, 3.0), 1);
  rune(flank(-1, -0.8, 2.3), 0);

  // ---------- spears ----------
  const spear = (h: any, d: number[], len: number, head: boolean) => {
    if (!h) return;
    const dir = V(d).normalize();
    const base = h.at.clone();
    const start = base.clone().addScaledVector(dir, -0.4);
    const end = base.clone().addScaledVector(dir, len);
    b.rod(start, end, [0.055, 0.04], { color: P.bronzeDark, bone: J.spine });
    b.rod(base.clone().addScaledVector(dir, 0.55), base.clone().addScaledVector(dir, 0.7), 0.07, {
      color: P.bronze,
      bone: J.spine,
    });
    if (head) b.spike(end, dir, 0.4, 0.09, { color: P.iron, bone: J.spine });
    else b.spike(end, dir.clone().add(V([0.3, 0, 0.2])).normalize(), 0.22, 0.045, { color: P.boneDark, bone: J.spine });
    b.stick(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 7), P.blood, h, { embed: 0.4, flat: true });
  };
  spear(skin.ray([0.6, 6, 0.5], down), [0.25, 1, -0.45], 1.5, true);
  spear(skin.ray([-0.5, 6, -1.0], down), [-0.35, 1, 0.2], 1.2, false);
  spear(skin.ray([-1.1, 6, -1.6], down), [-0.8, 0.6, -0.2], 1.4, true);
  spear(skin.ray([1.1, 6, -1.3], down), [0.7, 0.7, -0.3], 1.1, false);

  // ---------- axe in left shoulder ----------
  {
    const h = skin.ray([1.0, 6, 1.5], down);
    if (h) {
      const d = V([0.55, 0.83, 0]).normalize();
      const base = h.at.clone();
      b.rod(base.clone().addScaledVector(d, -0.4), base.clone().addScaledVector(d, 1.75), 0.06, {
        color: P.ironDark,
        bone: J.chest,
      });
      for (const t of [0.5, 0.9])
        b.rod(base.clone().addScaledVector(d, t), base.clone().addScaledVector(d, t + 0.1), 0.075, {
          color: P.leather,
          bone: J.chest,
        });
      const c = base.clone().addScaledVector(d, 1.5);
      b.extrude(
        [
          [-0.5, -0.3], [-0.12, -0.08], [0.12, -0.08], [0.5, -0.3], [0.4, 0],
          [0.5, 0.3], [0.12, 0.08], [-0.12, 0.08], [-0.5, 0.3], [-0.4, 0],
        ],
        { at: c, x: [0, 0, 1], y: d.toArray(), thickness: 0.07, color: P.iron, bone: J.chest },
      );
      b.part(new THREE.SphereGeometry(0.1, 6, 4), P.ironDark, { bone: J.chest, at: c });
      b.stick(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 7), P.blood, h, { embed: 0.4, flat: true });
    }
  }

  // ---------- shield shard on right flank ----------
  {
    const h = skin.ray([-5, 2.8, -1.7], [1, 0, 0]);
    if (h) {
      const shard = b.extrude(
        [
          [-0.5, -0.3], [0, -0.45], [0.45, -0.25], [0.55, 0.1],
          [0.2, 0.4], [-0.1, 0.25], [-0.3, 0.45], [-0.55, 0.15],
        ],
        { at: [h.at.x - 0.02, h.at.y, h.at.z], x: [0, 0, 1], thickness: 0.07, color: P.bronze, bone: J.hips },
      );
      b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.05, 7), P.bronzeDark, {
        bone: J.hips,
        at: shard.local([0, 0, 0.05]),
        dir: [-1, 0, 0],
      });
      for (const [u, v] of [[-0.38, -0.12], [0.3, -0.12], [0.35, 0.08], [-0.15, 0.2], [0.0, -0.32]])
        b.part(new THREE.SphereGeometry(0.035, 5, 4), P.iron, { bone: J.hips, at: shard.local([u, v, 0.04]) });
    }
  }

  // ---------- chains around the chest ----------
  const linkA = new THREE.TorusGeometry(0.1, 0.03, 4, 8);
  const linkB = linkA.clone().rotateY(Math.PI / 2);
  const wrap = (fr: any, bone: any) => {
    const loop = skin.loop(fr, { lift: 0.05 }).slice(0, 0.92);
    b.sweep(loop, 0.035, { color: P.ironDark, bone });
    let i = 0;
    b.along(loop, 12, (at: any) => {
      b.part(i++ % 2 ? linkB : linkA, P.chain, { frame: at, scale: [1, 1.5, 1], bone });
    });
  };
  wrap(frame([0, 2.7, 1.0], [0, 0.25, 1]), J.chest);
  wrap(frame([0, 2.6, 0.2], [0.15, 0, 1]), J.spine);

  // trailing links over the left shoulder
  {
    const pts = [[0.3, 1.0], [0.9, 1.1], [1.35, 1.2]]
      .map(([x, z]) => skin.ray([x, 6, z], down))
      .filter(Boolean)
      .map((h) => h!.moved([0, 0.07, 0]).at.toArray());
    if (pts.length > 2) {
      const path = catmull(pts);
      b.sweep(path, 0.035, { color: P.ironDark, bone: J.chest });
      let i = 0;
      b.along(path, 4, (at: any) => {
        b.part(i++ % 2 ? linkB : linkA, P.chain, { frame: at, scale: [1, 1.5, 1], bone: J.chest });
      });
      const e = pts[pts.length - 1];
      b.part(linkA, P.chain, { bone: J.chest, at: [e[0] + 0.05, e[1] + 0.05, e[2] + 0.18], scale: [1, 1.5, 1] });
    }
  }

  // ---------- neck-root collars ----------
  const collars: [number[], number[], number][] = [
    [M.neckBaseA, [0, 0.8, 0.5], 0.45],
    [M.neckBaseB, [0.4, 0.8, 0.4], 0.4],
    [M.neckBaseC, [-0.4, 0.8, 0.4], 0.4],
    [M.neckBaseD, [0.8, 0.6, 0.3], 0.35],
    [M.neckBaseE, [-0.8, 0.6, 0.3], 0.35],
  ];
  collars.forEach(([base, dd, r], k) => {
    const d = V(dd).normalize();
    const o = V(base).addScaledVector(d, 3);
    const h = skin.ray(o, d.clone().negate());
    if (!h) return;
    const c = h.at.clone().addScaledVector(d, -0.05);
    const line = frame(c, d.toArray());
    const ring = b.ring(line, { count: 10, radius: r * 0.95 });
    b.sweep(catmull(ring.items, { closed: true }), 0.12, { color: P.hideMid, bone: J.chest, sides: 6 });
    b.ring(line, { count: 6, radius: r + 0.08, tilt: 35 }, (it: any) => {
      b.spike(it, it, 0.3, 0.1, { color: k % 2 ? P.hideLight : P.hideDark, bone: J.chest, sides: 4 });
    });
    const arc = b.ring(line, { count: 5, radius: r + 0.1, fromDeg: 20, toDeg: 150 });
    b.sweep(catmull(arc.items), 0.035, { color: P.scarFlesh, bone: J.chest, sides: 4 });
  });
}
```