<!-- call: plan -->

```json
{
  "name": "Hydra of the Broken Mere",
  "description": "A colossal five-headed Norse swamp hydra in a gritty, grim God of War style: scarred dark-green hide, bone and iron war-trophies, glowing blue runes, ember wounds and frost.",
  "builderName": "godOfWarHydra",
  "size": [7.0, 6.3, 9.9],
  "layout": "A squat, heavy four-legged reptilian beast, 9.9 m long, standing on y=0 and facing +Z. The torso is a low barrel (y 1.4–3.2, z -2.7 to 2.3) with a broad, armoured shoulder hump at z≈1.2. Five thick serpent necks root on that hump and fan out and up in a spread bouquet. Each neck rises, then arches forward, and ends in a head that dips slightly. The centre head (Mid) is the hero: tallest and biggest, head top at y≈5.8, horns to 6.2, snout tip z≈4.7. Inner heads LA (+X) and RA (-X) are about 80% scale at y≈4.6, x=±1.65, snout z≈4.5. Outer heads LB (+X) and RB (-X) are about 70% scale, lower at y≈3.8, flaring wide at x=±2.9, snout z≈4.0. A tail trails back and down to a bone-spiked club at z≈-5.2. Front legs are thick, elbows out and forward. Hind legs are digitigrade, hocks back. Each foot has 3 big claws and 1 dew-claw. The tail and legs are the only parts on the floor. A readable silhouette has a low heavy mass in the back, a fan of five necks and a clear gap between the heads. Palette use: the top of everything is darker green-grey (hideDark, hideMid) with moss on upward faces. Throats and bellies are pale bone-beige (belly, bellyShade), and mud (mud) sits at feet, belly edge and tail tip. Style (God of War 2018): desaturated, heavy, brutal and mythic. Chunky blocky scale plates are layered into overlapping armour rows, with torn flesh and old scars as pale (scarPale) thin sweeps. Hand-carved Nordic runes glow (runeBlue) on horns, bone bands and the back. Iron shackles and broken chain links hang from the body. Broken weapons (the Leviathan-style frost axe, spear shafts, arrows) are embedded in the hide. Orange ember (ember, emberGlow) glows in wounds, mouths and eyes, and frost blue (frost) rimes one head. Every head has its own identity (see parts). All details are small separate parts in their own flat colours seated on the surface, with a dark outline, then the main colour, then a fine highlight. Rest pose: all five heads face forward, jaws slightly parted and each lower jaw a separate part, necks spread, legs apart, tail straight back with a slight droop.",
  "palette": {
    "hideDark": "#222f2c",
    "hideMid": "#37493f",
    "hideLight": "#587059",
    "moss": "#4a5a30",
    "mud": "#3a3226",
    "belly": "#b9aa86",
    "bellyShade": "#8a7a5a",
    "scarPale": "#d2c6a8",
    "bone": "#d9cfb2",
    "boneDark": "#8d8165",
    "horn": "#3b2f27",
    "hornTip": "#bdae8c",
    "iron": "#3c4046",
    "ironLight": "#7d848d",
    "bronze": "#8a5a2c",
    "leather": "#4a3020",
    "wound": "#5a1612",
    "blood": "#8a1c14",
    "ember": "#ff5a1f",
    "emberGlow": "#ffb347",
    "frost": "#a2deef",
    "runeBlue": "#4fd6ff",
    "tooth": "#e6dcc0",
    "eyeDark": "#140a06"
  },
  "mounts": {
    "floor": [0, 0, 0],
    "pelvis": [0, 2.3, -1.3],
    "chest": [0, 2.6, 1.2],
    "shoulderHump": [0, 3.1, 1.2],
    "neckBaseMid": [0, 3.1, 1.1],
    "neckBaseLA": [0.8, 3.0, 1.2],
    "neckBaseLB": [1.4, 2.9, 1.0],
    "neckBaseRA": [-0.8, 3.0, 1.2],
    "neckBaseRB": [-1.4, 2.9, 1.0],
    "hipFL": [1.5, 2.1, 1.4],
    "hipFR": [-1.5, 2.1, 1.4],
    "hipHL": [1.4, 2.1, -1.5],
    "hipHR": [-1.4, 2.1, -1.5],
    "tailRoot": [0, 2.2, -2.4],
    "tailTip": [0, 0.85, -5.0],
    "headMid": [0, 5.1, 2.8],
    "headLA": [1.65, 4.6, 3.0],
    "headLB": [2.9, 3.9, 2.7],
    "headRA": [-1.65, 4.6, 3.0],
    "headRB": [-2.9, 3.9, 2.7]
  },
  "joints": [
    { "name": "pelvis", "at": [0, 2.3, -1.3], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "pelvis", "at": [0, 2.6, 1.2], "dir": [0, 0.1, 1], "role": "spine" },

    { "name": "neckMid1", "parent": "chest", "at": [0, 3.1, 1.1], "dir": [0, 1, 0.25], "role": "neck" },
    { "name": "neckMid2", "parent": "neckMid1", "at": [0, 4.0, 1.5], "dir": [0, 1, 0.5], "role": "neck" },
    { "name": "neckMid3", "parent": "neckMid2", "at": [0, 4.9, 2.1], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "headMid", "parent": "neckMid3", "at": [0, 5.1, 2.8], "dir": [0, -0.25, 1], "role": "head" },
    { "name": "jawMid", "parent": "headMid", "at": [0, 4.9, 3.0], "dir": [0, -0.1, 1], "role": "jaw" },

    { "name": "neckLA1", "parent": "chest", "at": [0.8, 3.0, 1.2], "dir": [0.2, 1, 0.3], "role": "neck" },
    { "name": "neckLA2", "parent": "neckLA1", "at": [1.1, 3.8, 1.7], "dir": [0.3, 1, 0.6], "role": "neck" },
    { "name": "neckLA3", "parent": "neckLA2", "at": [1.5, 4.5, 2.4], "dir": [0.1, 0.5, 1], "role": "neck" },
    { "name": "headLA", "parent": "neckLA3", "at": [1.65, 4.6, 3.0], "dir": [0.05, -0.25, 1], "role": "head" },
    { "name": "jawLA", "parent": "headLA", "at": [1.65, 4.45, 3.15], "dir": [0, -0.1, 1], "role": "jaw" },

    { "name": "neckLB1", "parent": "chest", "at": [1.4, 2.9, 1.0], "dir": [1, 0.6, 0.2], "role": "neck" },
    { "name": "neckLB2", "parent": "neckLB1", "at": [2.2, 3.5, 1.4], "dir": [0.8, 0.5, 0.5], "role": "neck" },
    { "name": "neckLB3", "parent": "neckLB2", "at": [2.8, 3.9, 2.1], "dir": [0.3, 0.1, 1], "role": "neck" },
    { "name": "headLB", "parent": "neckLB3", "at": [2.9, 3.9, 2.7], "dir": [0.2, -0.25, 1], "role": "head" },
    { "name": "jawLB", "parent": "headLB", "at": [2.9, 3.75, 2.85], "dir": [0, -0.1, 1], "role": "jaw" },

    { "name": "neckRA1", "parent": "chest", "at": [-0.8, 3.0, 1.2], "dir": [-0.2, 1, 0.3], "role": "neck" },
    { "name": "neckRA2", "parent": "neckRA1", "at": [-1.1, 3.8, 1.7], "dir": [-0.3, 1, 0.6], "role": "neck" },
    { "name": "neckRA3", "parent": "neckRA2", "at": [-1.5, 4.5, 2.4], "dir": [-0.1, 0.5, 1], "role": "neck" },
    { "name": "headRA", "parent": "neckRA3", "at": [-1.65, 4.6, 3.0], "dir": [-0.05, -0.25, 1], "role": "head" },
    { "name": "jawRA", "parent": "headRA", "at": [-1.65, 4.45, 3.15], "dir": [0, -0.1, 1], "role": "jaw" },

    { "name": "neckRB1", "parent": "chest", "at": [-1.4, 2.9, 1.0], "dir": [-1, 0.6, 0.2], "role": "neck" },
    { "name": "neckRB2", "parent": "neckRB1", "at": [-2.2, 3.5, 1.4], "dir": [-0.8, 0.5, 0.5], "role": "neck" },
    { "name": "neckRB3", "parent": "neckRB2", "at": [-2.8, 3.9, 2.1], "dir": [-0.3, 0.1, 1], "role": "neck" },
    { "name": "headRB", "parent": "neckRB3", "at": [-2.9, 3.9, 2.7], "dir": [-0.2, -0.25, 1], "role": "head" },
    { "name": "jawRB", "parent": "headRB", "at": [-2.9, 3.75, 2.85], "dir": [0, -0.1, 1], "role": "jaw" },

    { "name": "hipFL", "parent": "chest", "at": [1.5, 2.1, 1.4], "dir": [0.5, -1, 0.3], "role": "leg" },
    { "name": "kneeFL", "parent": "hipFL", "at": [2.1, 1.1, 1.8], "dir": [-0.2, -1, 0.2], "role": "leg" },
    { "name": "ankleFL", "parent": "kneeFL", "at": [1.9, 0.35, 2.0], "dir": [0, -0.4, 1], "role": "leg" },
    { "name": "footFL", "parent": "ankleFL", "at": [1.9, 0.12, 2.5], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipFR", "parent": "chest", "at": [-1.5, 2.1, 1.4], "dir": [-0.5, -1, 0.3], "role": "leg" },
    { "name": "kneeFR", "parent": "hipFR", "at": [-2.1, 1.1, 1.8], "dir": [0.2, -1, 0.2], "role": "leg" },
    { "name": "ankleFR", "parent": "kneeFR", "at": [-1.9, 0.35, 2.0], "dir": [0, -0.4, 1], "role": "leg" },
    { "name": "footFR", "parent": "ankleFR", "at": [-1.9, 0.12, 2.5], "dir": [0, 0, 1], "role": "leg" },

    { "name": "hipHL", "parent": "pelvis", "at": [1.4, 2.1, -1.5], "dir": [0.5, -0.6, 0.8], "role": "leg" },
    { "name": "kneeHL", "parent": "hipHL", "at": [2.0, 1.2, -0.9], "dir": [-0.2, -0.6, -1], "role": "leg" },
    { "name": "ankleHL", "parent": "kneeHL", "at": [1.8, 0.5, -1.9], "dir": [0, -0.8, 0.7], "role": "leg" },
    { "name": "footHL", "parent": "ankleHL", "at": [1.8, 0.1, -1.4], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipHR", "parent": "pelvis", "at": [-1.4, 2.1, -1.5], "dir": [-0.5, -0.6, 0.8], "role": "leg" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-2.0, 1.2, -0.9], "dir": [0.2, -0.6, -1], "role": "leg" },
    { "name": "ankleHR", "parent": "kneeHR", "at": [-1.8, 0.5, -1.9], "dir": [0, -0.8, 0.7], "role": "leg" },
    { "name": "footHR", "parent": "ankleHR", "at": [-1.8, 0.1, -1.4], "dir": [0, 0, 1], "role": "leg" },

    { "name": "tail1", "parent": "pelvis", "at": [0, 2.2, -2.4], "dir": [0, -0.05, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 2.0, -3.2], "dir": [0, -0.3, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.6, -3.9], "dir": [0, -0.5, -1], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 1.2, -4.5], "dir": [0, -0.5, -1], "role": "tail" },
    { "name": "tail5", "parent": "tail4", "at": [0, 0.85, -5.0], "dir": [0, -0.2, -1], "role": "tail" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "Torso, shoulders and all body armour and trophies; no legs, tail or neck tubes. (1) A low barrel torso loft from the pelvis to the chest (half width 1.4 at the hips, 1.6 at the ribs, 1.7 at the shoulders, y 1.4–3.2). It is countershaded: hideDark/hideMid on top and sides with moss patches on upward faces, belly pale on the underside, and mud on the lower flanks. (2) A broad shoulder hump (x ±1.8, up to y 3.4, z 0.3–2.2) with a ring of overlapping chunky scale plates (hideLight, hideMid) around each of the five neck-base mounts (neckBaseMid/LA/LB/RA/RB) so the necks grow out of collars; each neck base also gets a bone ring. (3) Hip and tail-root fairing so the tail tube starts cleanly at tailRoot. (4) A dorsal ridge of large overlapping bone-and-horn plates (bone, horn, boneDark) from the shoulder hump back to the tail root, each plate bigger at the shoulders, with rune-blue glyphs on the biggest ones. (5) Belly: 10–12 wide pale plates (belly, bellyShade) in a row, with a few cracked and stained with mud. (6) Visible rib bones (bone) poking through torn flank wounds (wound, blood, ember glow cracks) on both sides. (7) A Leviathan-style frost axe (iron blade with rune-blue glow and frost-coloured blade rim, leather-wrapped haft) buried deep in the left flank, with frost crystals around the entry. (8) Two or three broken spear shafts (leather, boneDark) and arrows on the right shoulder and back with iron heads. (9) A heavy iron chain (iron, ironLight links) wrapped diagonally around the barrel, with a bronze shackle ring and a snapped end dangling and a bronze Nordic knotwork medallion. (10) Long pale scars (scarPale thin sweeps) across the flanks. (11) Glowing rune circles (runeBlue) on both flanks. Everything is built from low-poly primitives with visible facets.",
      "box": [[-1.9, 1.4, -2.7], [1.9, 3.6, 2.3]],
      "attaches": "Legs plug into hipFL/FR/HL/HR mounts, which sit inside the torso. The tail starts at tailRoot and the necks start at the five neckBase mounts, with collars covering the seams. Rides joints pelvis and chest.",
      "joints": ["pelvis", "chest"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "limbsTail",
      "builds": "All four legs and the tail; this part rests on the floor. Front legs are thick and muscular (shoulder bulge, upper arm, elbow plate, forearm, wide foot). Hind legs are digitigrade with a big thigh, a hock spur and a long metatarsus. Each is a smooth sweep along its hip/knee/ankle/foot joint chain, skinned to those joints, in hideDark/hideMid with a paler inner side. Layer armour on top: overlapping knee and elbow plates (horn, bone), scale rows down the shins (hideLight), and mud (mud) caked on the lower leg and feet. Each foot has 3 thick curved claws (claw colour is bone/hornTip) and a dew-claw, plus a wide pad (hideDark) with the toes spread. One front leg (footFL) wears a rusted iron shackle with a snapped chain stub; one hind leg carries a deep wound (wound, blood, ember cracks). The tail runs tail1 to tail5 as a tapered smooth sweep (radius 0.55 at the root to 0.22 at the tip; hideDark top, belly underside, rune-blue glow marks), with a dorsal row of bone plates that shrink toward the tip. At tail5 is a bone-spiked war-club (a swollen bone knob with 8–10 spikes of bone/hornTip, iron bands, and a broken harpoon head stuck in it). The feet have the lowest points on y=0.",
      "box": [[-2.7, 0, -5.3], [2.7, 2.5, 3.0]],
      "attaches": "Legs begin inside the torso at the hipFL/FR/HL/HR mounts; the tail begins inside the torso at tailRoot. Feet land at y=0. Rides the leg and tail joints.",
      "joints": ["hipFL", "kneeFL", "ankleFL", "footFL", "hipFR", "kneeFR", "ankleFR", "footFR", "hipHL", "kneeHL", "ankleHL", "footHL", "hipHR", "kneeHR", "ankleHR", "footHR", "tail1", "tail2", "tail3", "tail4", "tail5"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "headMid",
      "builds": "The centre hero head and its neck. The neck is a smooth sweep through neckMid1 to neckMid3 to headMid (radius 0.55 at the base to 0.34 at the head), hideMid on top with a pale belly strip (belly) on the front, and a row of triangular bone fins (bone/horn) down its back. Overlapping neck scale rows and 3 bronze-and-bone rune bands (runeBlue glyphs) are wrapped around it. The head is a big, 1.9 m long, wedge-shaped dragon skull (head scale constant H=1.0). The upper jaw is a separate part: a blocky snout with nostril pits (eyeDark, with ember glow inside), brow ridges, cheek plates and layered scales. The lower jaw is a separate part riding jawMid, left parted about 12°, with a chin plate, gum (wound) lining and teeth. Big readable eyes: ember-orange (ember with an emberGlow highlight and eyeDark slit pupil, dark outline ring, heavy bone brow above), under the brow ridge and facing forward. Teeth: 12–14 fangs in each jaw (tooth), long canines. A mane of 6–8 big curving antler-horns (horn at the root to hornTip) swept back from the skull crown, the two longest with rune bands and the left one snapped off, plus a frill of 5 bone spikes behind each cheek. Details: a pale scar across the snout, a bronze ring through the lower lip with a short broken chain, and ember glow in the throat. This head is the most elaborate and its colours stay dark-green with bone horns. Everything is bold, blocky and faceted.",
      "box": [[-0.9, 3.0, 0.9], [0.9, 6.3, 4.7]],
      "attaches": "The neck starts inside the shoulder hump collar at neckBaseMid. The head joint is headMid at the back of the skull; the lower jaw hinges at jawMid. Rides neckMid1-3, headMid and jawMid.",
      "joints": ["neckMid1", "neckMid2", "neckMid3", "headMid", "jawMid"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "headsLeft",
      "builds": "Two necks and heads on the creature's left (+X): inner head LA and outer head LB. Each neck is a smooth sweep through its neck joints (radius 0.45 at the base to 0.28 at the head; LB radius 0.4 to 0.26), hideMid/hideDark on top, pale belly strip on the front, a row of bone fins on the back, and 2 rune bands in bone and bronze. Each head is a wedge skull with a separate upper jaw part and a separate lower jaw part (riding jawLA / jawLB, parted about 10°), teeth, gum, nostrils, brow ridges and big eyes. LA (scale H=0.8, 1.5 m long) is the scarred veteran: its left eye (+X side) is slashed shut by a long pale scar with stitch marks (scarPale, eyeDark), the other eye glows ember-orange, one horn is broken off at a jagged stump, the other horn carries rune-blue glyphs, and it has a jagged ear-frill of 4 bone spikes behind each cheek. LB (scale H=0.7, 1.35 m long) is the shackled one: an iron muzzle bridle (iron bands with ironLight rivets and leather straps) wraps the snout with a snapped chain trailing from the cheek ring and a short rusted spike, pale yellow-orange eyes (emberGlow) with eyeDark slit pupils, short curved horns (horn to hornTip), and moss on the top of the skull. Details: ember glow in the mouths, a pale scar on each neck, and teeth in both jaws. Colours come from the palette.",
      "box": [[0.5, 2.8, 0.9], [3.7, 5.6, 4.6]],
      "attaches": "Necks start inside the shoulder collar at neckBaseLA (0.8, 3.0, 1.2) and neckBaseLB (1.4, 2.9, 1.0). The heads sit at headLA and headLB. Rides neckLA1-3, headLA, jawLA, neckLB1-3, headLB, jawLB.",
      "joints": ["neckLA1", "neckLA2", "neckLA3", "headLA", "jawLA", "neckLB1", "neckLB2", "neckLB3", "headLB", "jawLB"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "headsRight",
      "builds": "Two necks and heads on the creature's right (-X): inner head RA and outer head RB, built as the mirror in position of the left side, with the same neck construction rules (smooth sweep, radius 0.45 to 0.28 for RA and 0.4 to 0.26 for RB, pale belly strip, back fins, 2 rune bands, separate upper and lower jaw parts riding jawRA / jawRB parted about 10°, teeth, gum, nostrils, brow ridges, big eyes). RA (scale H=0.8, 1.5 m long) is the frost-bitten head: its skull and neck top are rimed with frost (frost) in angular ice crystals and icicles hanging from the jaw and horns, pale icy eyes (frost with a runeBlue glow ring and an eyeDark slit pupil), long swept horns (horn to hornTip) with rune-blue glyphs, and a breath of frost crystals at the nostrils; its hide is slightly bluer (hideLight). RB (scale H=0.7, 1.35 m long) is the burnt, ember-cracked head: charred dark hide (hideDark, wound) with glowing ember cracks (ember, emberGlow) running over the skull and snout, exposed bone (bone, boneDark) on the cheek where scales were burned off, ember-orange eyes, a mouth full of glowing emberGlow embers behind its teeth, and short split horns with charred tips. An arrow or spear (leather and iron) sticks out of RB's neck. Colours come from the palette.",
      "box": [[-3.7, 2.8, 0.9], [-0.5, 5.6, 4.6]],
      "attaches": "Necks start inside the shoulder collar at neckBaseRA (-0.8, 3.0, 1.2) and neckBaseRB (-1.4, 2.9, 1.0). The heads sit at headRA and headRB. Rides neckRA1-3, headRA, jawRA, neckRB1-3, headRB, jawRB.",
      "joints": ["neckRA1", "neckRA2", "neckRA3", "headRA", "jawRA", "neckRB1", "neckRB2", "neckRB3", "headRB", "jawRB"],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: limbsTail -->

```ts
import * as THREE from "three";
import { catmull, rng, offset } from "agentic-3js-builder";

export function buildLimbsTail({ b, J, P, M }: any) {
  const R = rng(11);
  const legs: [string, number][] = [["FL", 1], ["FR", -1], ["HL", 1], ["HR", -1]];

  const claw = (at: number[], dir: number[], len: number, r: number, bone: any) =>
    b.spike(at, dir, len, r, { color: P.bone, bone, sides: 6 });

  for (const [id, s] of legs) {
    const front = id[0] === "F";
    const hip = J["hip" + id], knee = J["knee" + id], ankle = J["ankle" + id], foot = J["foot" + id];
    const hp = hip.at.toArray(), kp = knee.at.toArray(), ap = ankle.at.toArray(), fp = foot.at.toArray();
    const r0 = front ? 0.5 : 0.52;
    // main leg sweep skinned to the chain
    b.sweep(catmull([hp, kp, ap, fp]), [r0, r0 * 0.7, 0.3, 0.26], {
      bone: [hip, knee, ankle, foot], color: P.hideDark, sides: 8,
    });
    // paler inner side
    b.sweep(catmull([offset(hp, [-s, 0, 0], 0.3), offset(kp, [-s, 0, 0], 0.22), offset(ap, [-s, 0, 0], 0.15)]),
      [0.2, 0.16, 0.1], { bone: [hip, knee, ankle], color: P.hideMid, sides: 6 });
    // knee / elbow plate
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.4), P.horn, { bone: knee, at: [kp[0] + s * 0.3, kp[1] + 0.05, kp[2] + (front ? 0.2 : 0.3)], flat: true });
    b.part(new THREE.ConeGeometry(0.15, 0.4, 5), P.bone, { bone: knee, at: [kp[0] + s * 0.55, kp[1] + 0.1, kp[2] + 0.1], rotation: [0, 0, -s * 90] });
    // scale rows down shin
    for (let i = 0; i < 4; i++) {
      const t = i / 4;
      b.part(new THREE.BoxGeometry(0.5, 0.1, 0.4), P.hideLight, {
        bone: ankle, at: [kp[0] + (ap[0] - kp[0]) * t, kp[1] + (ap[1] - kp[1]) * t, kp[2] + (ap[2] - kp[2]) * t + 0.25], flat: true,
      });
    }
    // mud on lower leg
    b.part(new THREE.SphereGeometry(0.34, 6, 4), P.mud, { bone: ankle, at: [ap[0], ap[1] - 0.05, ap[2]], scale: [1.1, 0.8, 1.1], flat: true });
    // foot pad
    b.part(new THREE.BoxGeometry(0.9, 0.24, 0.9), P.hideDark, { bone: foot, at: [fp[0], 0.12, fp[2] + 0.05], flat: true });
    b.part(new THREE.BoxGeometry(0.95, 0.12, 0.5), P.mud, { bone: foot, at: [fp[0], 0.08, fp[2] - 0.15], flat: true });
    // toes + claws
    for (let i = -1; i <= 1; i++) {
      const x = fp[0] + i * 0.3;
      b.part(new THREE.SphereGeometry(0.15, 6, 4), P.hideMid, { bone: foot, at: [x, 0.15, fp[2] + 0.45], flat: true });
      claw([x, 0.15, fp[2] + 0.5], [i * 0.15, -0.35, 1], 0.45, 0.09, foot);
    }
    claw([fp[0] - s * 0.4, 0.22, fp[2] - 0.2], [-s * 0.7, -0.2, -0.5], 0.3, 0.07, foot);
    if (!front) {
      b.spike([kp[0], ap[1] + 0.2, ap[2] - 0.2], [0, 0.4, -1], 0.4, 0.1, { color: P.bone, bone: ankle });
    }
    if (id === "FL") {
      b.part(new THREE.TorusGeometry(0.3, 0.07, 5, 8), P.iron, { bone: ankle, at: [ap[0], ap[1] + 0.1, ap[2]], rotation: [90, 0, 0] });
      for (let i = 0; i < 3; i++)
        b.part(new THREE.TorusGeometry(0.08, 0.025, 4, 6), P.ironLight, {
          bone: ankle, at: [ap[0] + 0.3 + i * 0.1, ap[1] - 0.05 - i * 0.12, ap[2]], rotation: [i * 90, 90, 0] });
    }
    if (id === "HL") {
      b.part(new THREE.BoxGeometry(0.1, 0.5, 0.35), P.wound, { bone: hip, at: [hp[0] + 0.5, hp[1] - 0.35, hp[2] + 0.2], flat: true });
      b.part(new THREE.BoxGeometry(0.04, 0.4, 0.12), P.ember, { bone: hip, at: [hp[0] + 0.56, hp[1] - 0.35, hp[2] + 0.2], flat: true });
      b.part(new THREE.BoxGeometry(0.04, 0.12, 0.3), P.blood, { bone: hip, at: [hp[0] + 0.57, hp[1] - 0.6, hp[2] + 0.2], flat: true });
    }
  }

  // tail
  const tj = ["tail1", "tail2", "tail3", "tail4", "tail5"].map((n) => J[n]);
  const pts = tj.map((j: any) => j.at.toArray());
  const tip = [0, 0.85, -5.0];
  pts.push(tip);
  const path = catmull(pts);
  const tail = b.sweep(path, [0.55, 0.22], {
    bone: tj, color: P.hideDark, sides: 8,
    sectors: [[125, 235, P.belly]],
  });
  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.17;
    const h = tail.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.22 * (1 - t * 0.6), 0.5 * (1 - t * 0.5), 4), i % 2 ? P.boneDark : P.bone, h);
    if (i % 2 === 0) {
      const g = tail.at(t, 70);
      b.stick(new THREE.BoxGeometry(0.1, 0.02, 0.1), P.runeBlue, g, { embed: 0.1 });
    }
  }
  // war club
  const T = J.tail5;
  const c = [0, 0.8, -5.2];
  b.part(new THREE.IcosahedronGeometry(0.5, 1), P.bone, { bone: T, at: c, flat: true });
  b.part(new THREE.TorusGeometry(0.46, 0.06, 5, 10), P.iron, { bone: T, at: c, rotation: [0, 0, 0] });
  b.part(new THREE.TorusGeometry(0.4, 0.05, 5, 10), P.iron, { bone: T, at: [0, 0.8, -5.0], rotation: [0, 0, 0] });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.2;
    const d = [Math.cos(a), Math.sin(a) * 0.9, -0.2 + R() * 0.6 - 0.3];
    claw([c[0] + d[0] * 0.4, c[1] + d[1] * 0.4, c[2] + d[2] * 0.4], d, 0.5, 0.1, T);
  }
  b.part(new THREE.ConeGeometry(0.12, 0.45, 4), P.ironLight, { bone: T, at: [0, 1.0, -5.55], rotation: [-60, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.08), P.runeBlue, { bone: T, at: [0.48, 0.8, -5.2] });
}
```

<!-- call: headMid -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildHeadMid({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const H = 1.0;
  const head = J.headMid;
  const jaw = J.jawMid;
  const neckCh = [J.neckMid1, J.neckMid2, J.neckMid3];

  // ---------- neck ----------
  const path = catmull([
    [0, 3.0, 1.1],
    [0, 4.0, 1.5],
    [0, 4.9, 2.1],
    [0, 5.1, 2.8],
  ]);
  const neck = b.sweep(path, [0.55, 0.34], {
    bone: neckCh.concat([head]),
    color: P.hideMid,
    sectors: [[110, 250, P.belly]],
  });
  // back fins
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.12;
    const p = neck.at(t, 0);
    b.spike(p, p, 0.3 - i * 0.015, 0.07, { color: i % 2 ? P.horn : P.bone, bone: neckCh[Math.min(2, Math.floor(t * 3))] });
  }
  // scale rows
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.09;
    for (const a of [-50, 0, 50]) {
      const p = neck.at(t, a);
      b.stick(new THREE.BoxGeometry(0.2, 0.05, 0.14), i % 2 ? P.hideLight : P.hideDark, p, { embed: 0.3 });
    }
  }
  // rune bands
  [0.25, 0.5, 0.75].forEach((t, k) => {
    const c = neck.at(t, 0);
    const loop = b.ring(c, { count: 10, radius: 0.5 - t * 0.2 });
    loop.items.forEach((it, i) => {
      b.stick(new THREE.BoxGeometry(0.1, 0.05, 0.08), i % 2 ? P.bronze : P.bone, it, { embed: 0.1 });
    });
    b.part(new THREE.BoxGeometry(0.06, 0.02, 0.1), P.runeBlue, { at: neck.at(t, 40).at, bone: neckCh[k] });
  });

  // ---------- skull ----------
  const hp = (x: number, y: number, z: number): [number, number, number] => [x * H, 5.1 + y * H, 2.8 + z * H];
  // cranium
  b.part(new THREE.BoxGeometry(0.8, 0.65, 0.9), P.hideMid, { at: hp(0, 0.05, 0.1), bone: head });
  // upper snout wedge
  b.frustumBox(hp(0, -0.02, 0.4), hp(0, -0.12, 1.9), [0.7, 0.5], [0.5, 0.3], { color: P.hideDark, bone: head });
  b.frustumBox(hp(0, 0.2, 0.4), hp(0, 0.1, 1.7), [0.5, 0.1], [0.34, 0.08], { color: P.hideLight, bone: head });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.1), P.eyeDark, { at: hp(s * 0.15, 0.08, 1.88), bone: head });
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), P.emberGlow, { at: hp(s * 0.15, 0.06, 1.9), bone: head });
    // brow ridge
    b.part(new THREE.BoxGeometry(0.28, 0.12, 0.5), P.bone, { at: hp(s * 0.3, 0.3, 0.55), bone: head, rotation: [10, s * -10, s * 8] });
    // eyes
    b.part(new THREE.SphereGeometry(0.11, 8, 6), P.eyeDark, { at: hp(s * 0.32, 0.12, 0.62), bone: head });
    glowEye(hp(s * 0.34, 0.12, 0.68), 0.085);
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.02), P.eyeDark, { at: hp(s * 0.345, 0.12, 0.76), bone: head });
    // cheek plates
    b.part(new THREE.BoxGeometry(0.1, 0.35, 0.5), P.hideLight, { at: hp(s * 0.43, -0.1, 0.35), bone: head });
    b.part(new THREE.BoxGeometry(0.08, 0.2, 0.3), P.bone, { at: hp(s * 0.48, -0.05, 0.2), bone: head });
    // frill
    for (let i = 0; i < 5; i++)
      b.spike(hp(s * 0.4, 0.1 - i * 0.1, -0.2), [s * 0.8, 0.1 - i * 0.2, -0.6], 0.38 - i * 0.03, 0.05, { color: P.bone, bone: head });
    // snout scales
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.2, 0.05, 0.22), i % 2 ? P.hideLight : P.hideMid, { at: hp(s * 0.18, 0.2 - i * 0.012, 0.6 + i * 0.3), bone: head });
  }
  function glowEye(at: number[], r: number) {
    const e = b.part(new THREE.SphereGeometry(r, 8, 6), P.ember, { at, bone: head });
    b.part(new THREE.SphereGeometry(r * 0.35, 6, 4), P.emberGlow, { at: [at[0], at[1] + 0.03, at[2] + 0.04], bone: head });
    return e;
  }
  // scar
  b.part(new THREE.BoxGeometry(0.55, 0.02, 0.05), P.scarPale, { at: hp(0, 0.215, 1.1), bone: head, rotation: [0, 25, 0] });
  // upper teeth
  for (let i = 0; i < 7; i++)
    for (const s of [1, -1]) {
      const big = i === 2;
      b.spike(hp(s * (0.3 - i * 0.02), -0.28, 0.5 + i * 0.22), [0, -1, 0], big ? 0.3 : 0.15, big ? 0.05 : 0.035, { color: P.tooth, bone: head });
    }
  // crown horns
  for (let i = 0; i < 7; i++) {
    const s = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const base = hp(s * (0.15 + k * 0.1), 0.35, -0.05 - k * 0.12);
    const broken = i === 1;
    const len = broken ? 0.3 : 0.9 - k * 0.1;
    const tip = [base[0] + s * (0.3 + k * 0.1), base[1] + 0.5 * (len / 0.9) + 0.1, base[2] - 0.5 * len];
    const mid = [base[0] + s * 0.15, base[1] + 0.35 * len, base[2] - 0.15 * len];
    b.sweep(catmull([base, mid, tip]), [0.09, broken ? 0.05 : 0.01], {
      bone: head, color: P.horn, caps: { end: broken ? "flat" : "point" },
      bands: broken ? undefined : [[0.7, P.horn], [1, P.hornTip]],
    });
    if (!broken && k < 1) b.part(new THREE.BoxGeometry(0.14, 0.04, 0.06), P.runeBlue, { at: [mid[0], mid[1] + 0.06, mid[2]], bone: head });
  }
  // ---------- lower jaw ----------
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  const jp = (x: number, y: number, z: number) => jaw.local([x, y, z]);
  b.frustumBox(hp(0, -0.38, 0.3), hp(0, -0.42, 1.8), [0.62, 0.2], [0.4, 0.14], { color: P.hideDark, bone: jaw });
  b.frustumBox(hp(0, -0.52, 0.3), hp(0, -0.5, 1.7), [0.5, 0.06], [0.34, 0.05], { color: P.belly, bone: jaw });
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.2), P.bone, { at: hp(0, -0.46, 1.8), bone: jaw });
  b.part(new THREE.BoxGeometry(0.5, 0.04, 1.2), P.wound, { at: hp(0, -0.27, 1.0), bone: jaw });
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.5), P.ember, { at: hp(0, -0.24, 0.4), bone: jaw });
  for (let i = 0; i < 7; i++)
    for (const s of [1, -1])
      b.spike(hp(s * (0.27 - i * 0.015), -0.3, 0.55 + i * 0.2), [0, 1, 0], i === 5 ? 0.28 : 0.14, i === 5 ? 0.05 : 0.035, { color: P.tooth, bone: jaw });
  // lip ring and broken chain
  const ringAt = hp(0.22, -0.5, 1.55);
  b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.bronze, { at: ringAt, bone: jaw, rotation: [0, 90, 0] });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 6), i % 2 ? P.iron : P.ironLight, {
      at: [ringAt[0] + 0.02, ringAt[1] - 0.1 - i * 0.07, ringAt[2]], bone: jaw, rotation: [0, i % 2 ? 0 : 90, 0],
    });
}
```

<!-- call: headsLeft -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsLeft({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Neck: sweep through joint positions, with fins and rune bands.
  function neck(joints: any[], endPt: number[], r0: number, r1: number, tag: string) {
    const pts = joints.map((j) => j.at.clone());
    pts.push(v(endPt[0], endPt[1], endPt[2]));
    const s = b.sweep(pts, [r0, r1], {
      bone: joints, color: P.hideMid,
      sectors: [[125, 235, P.belly]],
    } as any);
    b.along(s, 5, (at: any) => {
      const hit = s.at(at.t ?? 0.5, 0, 0.0);
      b.spike(hit, hit, 0.2, 0.06, { color: P.bone });
    });
    for (const t of [0.35, 0.65]) {
      const p = s.at(t, 0, 0);
      const rr = (r0 + (r1 - r0) * t) + 0.03;
      const ring = b.ring(s.at(t, 0, 0) as any, { count: 1, radius: 0 }).items;
      void ring;
      const c = (b.chain as any) ? null : null; void c;
      b.part(new THREE.TorusGeometry(rr, 0.035, 5, 10), t < 0.5 ? P.bone : P.bronze, {
        at: p.at, dir: p.tangent, axis: "z", bone: p.bone ?? joints[0],
      } as any);
      b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), P.runeBlue, {
        at: p.at.clone().add(v(0, rr + 0.01, 0)), bone: p.bone ?? joints[0],
      } as any);
    }
    const sc = s.at(0.5, 70, 0.01);
    b.stick(new THREE.BoxGeometry(0.03, 0.4, 0.01), P.scarPale, sc);
  }

  function head(hj: any, jj: any, H: number, o: { lx: number; kind: string }) {
    const base = hj.at.clone();
    const L = (x: number, y: number, z: number) => base.clone().add(v(x * H, y * H, z * H));
    // Cranium + upper snout
    b.part(new THREE.BoxGeometry(0.7 * H, 0.55 * H, 0.8 * H), P.hideMid, { at: L(0, 0.05, 0.1), bone: hj });
    b.frustumBox(L(0, 0.05, 0.4), L(0, -0.02, 1.0), [0.6 * H, 0.42 * H], [0.38 * H, 0.26 * H], { bone: hj, color: P.hideDark } as any);
    b.part(new THREE.BoxGeometry(0.5 * H, 0.06 * H, 0.7 * H), P.moss, { at: L(0, 0.35, 0.15), bone: hj });
    // Lower jaw
    const jb = jj.at.clone();
    const LJ = (x: number, y: number, z: number) => jb.clone().add(v(x * H, y * H, z * H));
    b.frustumBox(LJ(0, -0.05, 0.1), LJ(0, -0.08, 0.95), [0.5 * H, 0.2 * H], [0.3 * H, 0.14 * H], { bone: jj, color: P.hideDark } as any);
    b.part(new THREE.BoxGeometry(0.4 * H, 0.04 * H, 0.7 * H), P.wound, { at: LJ(0, 0.05, 0.5), bone: jj });
    b.part(new THREE.BoxGeometry(0.3 * H, 0.1 * H, 0.2 * H), P.bellyShade, { at: LJ(0, -0.16, 0.85), bone: jj });
    glow(b.part(new THREE.BoxGeometry(0.3 * H, 0.03 * H, 0.5 * H), P.ember, { at: LJ(0, 0.07, 0.4), bone: jj }), 1.2);
    // Teeth
    for (let i = 0; i < 6; i++) for (const s of [1, -1]) {
      const z = 0.2 + i * 0.13;
      b.spike(L(s * (0.25 - i * 0.02) * H / H, -0.18, z), [0, -1, 0], 0.12 * H, 0.025 * H, { color: P.tooth, bone: hj } as any);
      b.spike(LJ(s * (0.2 - i * 0.015), 0.04, z), [0, 1, 0], 0.1 * H, 0.022 * H, { color: P.tooth, bone: jj } as any);
    }
    // Nostrils
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.07 * H, 0.04 * H, 0.07 * H), P.eyeDark, { at: L(s * 0.12, 0.15, 1.0), bone: hj });
      glow(b.part(new THREE.BoxGeometry(0.03 * H, 0.02 * H, 0.03 * H), P.ember, { at: L(s * 0.12, 0.14, 1.02), bone: hj }), 1);
    }
    // Brows and eyes
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.2 * H, 0.08 * H, 0.35 * H), P.boneDark, { at: L(s * 0.3, 0.27, 0.35), bone: hj });
      const ex = L(s * 0.36, 0.14, 0.38);
      const shut = o.kind === "A" && s > 0;
      const col = shut ? P.hideDark : o.kind === "A" ? P.ember : P.emberGlow;
      const e = b.part(new THREE.SphereGeometry(0.1 * H, 6, 4), col, { at: ex, bone: hj });
      if (!shut) {
        glow(e, 1.3);
        b.part(new THREE.BoxGeometry(0.02 * H, 0.14 * H, 0.04 * H), P.eyeDark, { at: ex.clone().add(v(s * 0.08 * H, 0, 0.03 * H)), bone: hj });
      } else {
        b.part(new THREE.BoxGeometry(0.03 * H, 0.4 * H, 0.04 * H), P.scarPale, { at: ex.clone().add(v(s * 0.07 * H, 0, 0.02 * H)), bone: hj, rotation: [0, 0, 20] } as any);
        for (let k = -2; k <= 2; k++)
          b.part(new THREE.BoxGeometry(0.02 * H, 0.015 * H, 0.1 * H), P.eyeDark, { at: ex.clone().add(v(s * 0.08 * H, k * 0.07 * H, 0.02 * H)), bone: hj });
      }
    }
    // Horns & frills
    for (const s of [1, -1]) {
      const root = L(s * 0.3, 0.3, -0.15);
      if (o.kind === "A") {
        if (s > 0) {
          b.spike(root, [s * 0.3, 0.5, -0.6], 0.12 * H, 0.09 * H, { color: P.horn, bone: hj } as any);
        } else {
          b.spike(root, [s * 0.3, 0.7, -0.6], 0.7 * H, 0.09 * H, { color: P.horn, bone: hj } as any);
          for (let k = 0; k < 3; k++)
            glow(b.part(new THREE.BoxGeometry(0.1 * H, 0.03 * H, 0.03 * H), P.runeBlue, { at: root.clone().add(v(s * 0.05 * H * k, (0.12 + 0.12 * k) * H, -(0.1 + 0.13 * k) * H)), bone: hj }), 1.3);
        }
        for (let k = 0; k < 4; k++)
          b.spike(L(s * 0.34, 0.08 - k * 0.07, -0.2), [s, 0.2 - k * 0.2, -0.6], 0.25 * H, 0.04 * H, { color: P.bone, bone: hj } as any);
      } else {
        b.sweep([root, root.clone().add(v(s * 0.1, 0.25, -0.15)), root.clone().add(v(s * 0.1, 0.4, 0.05))], [0.07 * H, 0.01], { color: P.horn, bone: hj } as any);
        b.spike(L(s * 0.3, 0.38, -0.02), [0, 0.3, -0.3], 0.2, 0.03, { color: P.hornTip, bone: hj } as any);
      }
    }
    if (o.kind === "B") {
      // bridle
      for (const z of [0.55, 0.85]) {
        b.part(new THREE.BoxGeometry(0.5 * H, 0.38 * H, 0.08 * H), P.iron, { at: L(0, 0.05, z), bone: hj });
        for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.03 * H, 5, 4), P.ironLight, { at: L(s * 0.25, 0.1, z), bone: hj });
      }
      b.part(new THREE.BoxGeometry(0.04, 0.04, 0.5 * H), P.leather, { at: L(0, 0.27, 0.7), bone: hj });
      const ring = L(0.28, -0.02, 0.2);
      b.part(new THREE.TorusGeometry(0.06, 0.015, 5, 8), P.bronze, { at: ring, bone: hj });
      let p = ring.clone();
      for (let k = 0; k < 4; k++) {
        p = p.clone().add(v(0.03, -0.1, -0.03));
        b.part(new THREE.TorusGeometry(0.035, 0.01, 4, 6), P.ironLight, { at: p, bone: hj, rotation: [0, k * 90, 0] } as any);
      }
      b.spike(L(0, 0.2, 0.95), [0, 0.4, 1], 0.2, 0.03, { color: P.bronze, bone: hj } as any);
      for (let k = 0; k < 4; k++)
        b.part(new THREE.BoxGeometry((0.12 + R() * 0.1) * H, 0.05, (0.12 + R() * 0.1) * H), P.moss, { at: L((R() - 0.5) * 0.4, 0.4, 0.05 + k * 0.1), bone: hj });
    }
  }

  neck([J.neckLA1, J.neckLA2, J.neckLA3], M.headLA, 0.45, 0.28, "LA");
  neck([J.neckLB1, J.neckLB2, J.neckLB3], M.headLB, 0.4, 0.26, "LB");
  head(J.headLA, J.jawLA, 0.8, { lx: 1, kind: "A" });
  head(J.headLB, J.jawLB, 0.7, { lx: 1, kind: "B" });
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const pel = J.pelvis, chest = J.chest;

  // Torso loft
  b.loft(
    [
      { at: [0, 2.3, -2.4], w: 1.9, h: 1.5 },
      { at: [0, 2.3, -1.3], w: 2.8, h: 1.8 },
      { at: [0, 2.4, 0.0], w: 3.2, h: 1.8 },
      { at: [0, 2.5, 1.2], w: 3.4, h: 1.8 },
      { at: [0, 2.5, 2.1], w: 2.8, h: 1.5 },
    ],
    { bone: [pel, chest], color: P.hideMid },
  );
  // dark back cap
  b.loft(
    [
      { at: [0, 3.0, -1.9], w: 1.9, h: 0.5 },
      { at: [0, 3.15, -0.5], w: 2.6, h: 0.5 },
      { at: [0, 3.25, 1.0], w: 3.0, h: 0.6 },
      { at: [0, 3.2, 2.0], w: 2.2, h: 0.5 },
    ],
    { bone: [pel, chest], color: P.hideDark },
  );
  // belly strip
  b.loft(
    [
      { at: [0, 1.65, -2.0], w: 1.2, h: 0.3 },
      { at: [0, 1.6, 0], w: 2.2, h: 0.3 },
      { at: [0, 1.7, 1.8], w: 1.8, h: 0.3 },
    ],
    { bone: [pel, chest], color: P.belly },
  );
  // shoulder hump
  b.part(new THREE.SphereGeometry(1, 8, 6), P.hideMid, { bone: chest, at: [0, 2.9, 1.2], scale: [1.8, 0.6, 1.0] });
  // hip fairing
  b.part(new THREE.SphereGeometry(1, 8, 6), P.hideDark, { bone: pel, at: [0, 2.3, -2.2], scale: [0.8, 0.7, 0.7] });

  // mud on lower flanks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.35, 3.8), P.mud, { bone: pel, at: [s * 1.5, 1.7, -0.3] });
  }

  // neck collars
  for (const k of ["Mid", "LA", "LB", "RA", "RB"]) {
    const m = M["neckBase" + k];
    const bn = k === "Mid" ? chest : chest;
    b.part(new THREE.TorusGeometry(0.5, 0.1, 5, 10), P.bone, { bone: bn, at: [m[0], m[1] + 0.3, m[2]], rotation: [90, 0, 0] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.34, 0.1, 0.3), i % 2 ? P.hideLight : P.hideMid, {
        bone: bn,
        at: [m[0] + Math.cos(a) * 0.6, m[1] + 0.2, m[2] + Math.sin(a) * 0.6],
        rotation: [0, -a * 57.3, 0],
      });
    }
  }

  // dorsal ridge
  for (let i = 0; i < 12; i++) {
    const z = 1.9 - i * 0.37;
    const sc = 1.1 - i * 0.05;
    const bn = z > 0 ? chest : pel;
    const y = 3.3 - (i > 4 ? (i - 4) * 0.04 : 0);
    b.part(new THREE.ConeGeometry(0.28 * sc, 0.8 * sc, 4), i % 2 ? P.bone : P.horn, { bone: bn, at: [0, y + 0.3 * sc, z], rotation: [-15, 0, 0] });
    b.part(new THREE.BoxGeometry(0.7 * sc, 0.12, 0.3), P.boneDark, { bone: bn, at: [0, y, z] });
    if (i < 5) b.part(new THREE.BoxGeometry(0.03, 0.22 * sc, 0.03), P.runeBlue, { bone: bn, at: [0, y + 0.32 * sc, z + 0.14 * sc] });
  }

  // belly plates
  for (let i = 0; i < 11; i++) {
    const z = -2 + i * 0.38;
    const bn = z > 0.6 ? chest : pel;
    b.part(new THREE.BoxGeometry(1.7, 0.12, 0.34), i % 3 ? P.belly : P.bellyShade, { bone: bn, at: [0, 1.5, z] });
    if (i % 4 === 1) b.part(new THREE.BoxGeometry(0.5, 0.04, 0.2), P.mud, { bone: bn, at: [R() - 0.5, 1.43, z] });
  }

  // ribs + wounds
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.9, 1.1), P.wound, { bone: pel, at: [s * 1.62, 2.4, 0.2], rotation: [0, 0, 0] });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.1, 0.8, 0.09), P.bone, { bone: pel, at: [s * 1.7, 2.4, -0.2 + i * 0.25], rotation: [0, 0, s * 8] });
    }
    b.part(new THREE.BoxGeometry(0.04, 0.5, 0.05), P.ember, { bone: pel, at: [s * 1.7, 2.55, 0.5], rotation: [0, 0, 20] });
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.05), P.emberGlow, { bone: pel, at: [s * 1.7, 2.2, -0.45], rotation: [0, 0, -15] });
    // rune circle
    b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 12), P.runeBlue, { bone: pel, at: [s * 1.66, 2.5, -1.4], rotation: [0, 90, 0] });
    b.part(new THREE.BoxGeometry(0.04, 0.4, 0.05), P.runeBlue, { bone: pel, at: [s * 1.68, 2.5, -1.4] });
    // scars
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.04, 0.07, 1.0), P.scarPale, { bone: pel, at: [s * 1.6, 2.9 - i * 0.25, -1.9 + i * 0.3], rotation: [0, 0, s * 25 * (i - 1)] });
    }
  }

  // frost axe in left flank
  const ax = pel;
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), P.leather, { bone: ax, at: [2.4, 2.9, -0.7], rotation: [0, 0, -70] });
  b.part(new THREE.BoxGeometry(0.1, 0.8, 0.8), P.iron, { bone: ax, at: [1.9, 2.7, -0.7] });
  b.part(new THREE.BoxGeometry(0.12, 0.7, 0.1), P.runeBlue, { bone: ax, at: [1.93, 2.7, -0.7] });
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.8), P.frost, { bone: ax, at: [1.9, 2.3, -0.7] });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.25;
    b.part(new THREE.ConeGeometry(0.08, 0.35, 4), P.frost, { bone: ax, at: [1.75, 2.7 + Math.sin(a) * 0.45, -0.7 + Math.cos(a) * 0.45], rotation: [0, 0, 60] });
  }

  // spears and arrows right shoulder
  const sp: [number, number, number, number][] = [[-1.2, 3.4, 0.6, 25], [-1.5, 3.3, 1.5, -20], [-0.6, 3.4, -0.3, 10]];
  sp.forEach(([x, y, z, r], i) => {
    const len = 1.4 + i * 0.3;
    b.part(new THREE.CylinderGeometry(0.04, 0.05, len, 5), i % 2 ? P.boneDark : P.leather, { bone: chest, at: [x, y + len / 2 - 0.2, z], rotation: [r, 0, r - 10] });
    b.part(new THREE.ConeGeometry(0.08, 0.25, 4), P.ironLight, { bone: chest, at: [x - 0.1 * (r / 25), y + len - 0.1, z], rotation: [r, 0, r - 10] });
  });

  // chain diagonal
  const links = 16;
  for (let i = 0; i < links; i++) {
    const t = i / (links - 1);
    const a = -0.4 + t * 2.6;
    const x = Math.sin(a * 1.6 - 1.4) * 1.78 * 0.95;
    const y = 2.4 + Math.cos(a * 1.6 - 1.4) * 0.85 + 0.35;
    b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 6), i % 2 ? P.iron : P.ironLight, {
      bone: pel,
      at: [x, y, -0.6 + t * 1.8],
      rotation: [i % 2 ? 90 : 0, a * 40, 0],
    });
  }
  b.part(new THREE.TorusGeometry(0.22, 0.06, 5, 10), P.bronze, { bone: pel, at: [-1.75, 2.5, 0.0], rotation: [0, 90, 0] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.09, 0.03, 4, 6), P.iron, { bone: pel, at: [-1.8, 2.2 - i * 0.2, 0.0 + i * 0.03], rotation: [i % 2 ? 90 : 0, 90, 0] });
  // medallion
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 8), P.bronze, { bone: chest, at: [-1.75, 2.8, 1.2], rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.14, 0.025, 4, 8), P.bellyShade, { bone: chest, at: [-1.79, 2.8, 1.2], rotation: [0, 90, 0] });

  // moss patches
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.CylinderGeometry(0.25 + R() * 0.2, 0.3, 0.06, 6), P.moss, { bone: i < 4 ? pel : chest, at: [(R() - 0.5) * 2.2, 3.28, -1.7 + i * 0.5] });
  }
}
```

<!-- call: headsRight -->

```ts
import * as THREE from "three";
import { bezier, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsRight({ b, J, P, M }: any) {
  const V = (v: any): number[] => [v.x, v.y, v.z];
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 5);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, l: number, n = 5) => new THREE.ConeGeometry(r, l, n);

  // ---------- neck ----------
  function neck(names: string[], hj: string, r: [number, number], hide: string, frostTop: boolean) {
    const js = names.map((n) => J[n]);
    const a = js[0].at;
    const pts = [[a.x, a.y - 0.25, a.z - 0.1], ...js.map((j: any) => V(j.at)), V(J[hj].at)];
    const nk = b.sweep(catmull(pts), r, {
      bone: [...js, J[hj]],
      color: hide,
      sectors: [[120, 240, P.belly]],
    });
    // back fins
    b.along(nk, 5, (at: any) => b.spike(at, at, 0.26, 0.08, { color: P.bone }));
    b.along(nk, 5, (at: any) => b.spike(at, at, 0.14, 0.08, { color: P.boneDark }), { from: 0.05, to: 0.95 });
    // rune bands
    for (const t of [0.35, 0.66]) {
      const f = nk.at(t, 0);
      const c = f.at.clone().addScaledVector(f.n, -f.radius);
      const bone = f.bone ?? js[1];
      b.part(new THREE.TorusGeometry(f.radius + 0.02, 0.05, 5, 10), P.bronze, { at: c, dir: f.tangent, axis: "z", bone });
      b.part(new THREE.TorusGeometry(f.radius + 0.03, 0.02, 5, 10), P.bone, {
        at: c.clone().addScaledVector(f.tangent, 0.08),
        dir: f.tangent,
        axis: "z",
        bone,
      });
      glow(b.stick(box(0.07, 0.03, 0.09), P.runeBlue, f.moved([0, 0.04, 0]), { embed: 0.3 }), 1.4);
    }
    // pale scar
    b.sweep(nk.line(55, 0.012).slice(0.25, 0.7), 0.014, { color: P.scarPale });
    if (frostTop) {
      for (const t of [0.2, 0.4, 0.6, 0.8]) {
        const f = nk.at(t, 0);
        b.stick(cone(0.07, 0.22, 4), P.frost, f, { embed: 0.2 });
      }
    }
    return nk;
  }

  // ---------- head ----------
  function head(c: any) {
    const H: number = c.H;
    const hp = J[c.hj].at, jp = J[c.jj].at;
    const o = (x: number, y: number, z: number) => [hp.x + x * H, hp.y + y * H, hp.z + z * H];
    const jo = (x: number, y: number, z: number) => [jp.x + x * H, jp.y + y * H, jp.z + z * H];
    const hb = J[c.hj], jb = J[c.jj];
    const hx = (z: number) => (0.25 - 0.1 * (z / 1.6)) * H;

    // skull + snout (upper jaw)
    b.frustumBox(o(0, 0, -0.25), o(0, -0.02, 0.75), [0.62 * H, 0.5 * H], [0.5 * H, 0.4 * H], { bone: hb, color: c.hide });
    b.frustumBox(o(0, -0.02, 0.7), o(0, -0.07, 1.6), [0.5 * H, 0.4 * H], [0.3 * H, 0.22 * H], { bone: hb, color: c.hide });
    b.frustumBox(o(0, -0.17, 0.6), o(0, -0.19, 1.6), [0.44 * H, 0.05 * H], [0.26 * H, 0.04 * H], { bone: hb, color: P.bellyShade });
    // snout scale plates
    for (let i = 0; i < 4; i++) {
      const z = 0.1 + i * 0.4;
      b.part(box((0.26 - i * 0.04) * H, 0.05 * H, 0.3 * H), c.plate, {
        bone: hb,
        at: o(0, 0.225 - i * 0.045, z),
        rotation: [4, 0, 0],
        flat: true,
      });
    }
    // lower jaw
    b.frustumBox(jo(0, -0.07, 0), jo(0, -0.1, 1.4), [0.46 * H, 0.14 * H], [0.26 * H, 0.1 * H], { bone: jb, color: c.hide });
    b.frustumBox(jo(0, -0.03, 0.05), jo(0, -0.03, 1.35), [0.38 * H, 0.02 * H], [0.2 * H, 0.02 * H], { bone: jb, color: P.wound });
    b.part(box(0.2 * H, 0.06 * H, 0.2 * H), P.boneDark, { bone: jb, at: jo(0, -0.16, 1.25), flat: true });
    b.part(box(0.4 * H, 0.05 * H, 0.35 * H), c.plate, { bone: jb, at: jo(0, -0.14, 0.4), flat: true });
    // teeth
    for (const s of [1, -1]) {
      [0.55, 0.8, 1.05, 1.3, 1.5].forEach((z, i) => {
        const len = (i === 2 ? 0.2 : 0.1) * H;
        b.part(cone(0.027 * H, len, 4), P.tooth, {
          bone: hb,
          at: o(s * hx(z) * 0.85, -0.17 - 0.05 * (z / 1.6), z),
          dir: [0, -1, 0],
          flat: true,
        });
      });
      [0.4, 0.7, 1.0, 1.25].forEach((z, i) => {
        const len = (i === 1 ? 0.17 : 0.09) * H;
        b.part(cone(0.026 * H, len, 4), P.tooth, {
          bone: jb,
          at: jo(s * hx(z) * 0.8, -0.02, z),
          dir: [0, 1, 0],
          flat: true,
        });
      });
    }
    // nostrils
    for (const s of [1, -1]) {
      b.part(box(0.06 * H, 0.03 * H, 0.07 * H), P.eyeDark, { bone: hb, at: o(s * 0.085, 0.045, 1.52) });
      glow(b.part(box(0.03 * H, 0.015 * H, 0.04 * H), c.nostril, { bone: hb, at: o(s * 0.085, 0.052, 1.53) }), 1.2);
    }
    // brows, cheeks, eyes
    for (const s of [1, -1]) {
      b.part(box(0.2 * H, 0.08 * H, 0.38 * H), P.boneDark, { bone: hb, at: o(s * 0.2, 0.2, 0.6), rotation: [0, -s * 14, s * -8], flat: true });
      b.part(box(0.05 * H, 0.2 * H, 0.42 * H), c.plate, { bone: hb, at: o(s * 0.3, -0.04, 0.2), flat: true });
      const e = o(s * 0.225, 0.11, 0.66);
      b.part(sph(0.085 * H), P.eyeDark, { bone: hb, at: e, flat: true });
      glow(b.part(sph(0.07 * H), c.eye, { bone: hb, at: o(s * 0.23, 0.11, 0.69), flat: true }), 1.6);
      b.part(box(0.016 * H, 0.1 * H, 0.012 * H), P.eyeDark, { bone: hb, at: o(s * 0.23, 0.11, 0.755) });
      const ring = b.part(new THREE.TorusGeometry(0.078 * H, 0.014 * H, 4, 9), c.ring, { bone: hb, at: o(s * 0.23, 0.11, 0.72), rotation: [0, s * 20, 0] });
      if (c.ringGlow) glow(ring, 1.5);
    }
    c.extra(o, jo, hb, jb, H);
    b.pose(J[c.jj], { axis: [1, 0, 0], deg: 10 });
  }

  // ---------- RA : frost-bitten ----------
  const nkA = neck(["neckRA1", "neckRA2", "neckRA3"], "headRA", [0.45, 0.28], P.hideMid, true);
  head({
    hj: "headRA", jj: "jawRA", H: 0.8, hide: P.hideLight, plate: P.hideMid,
    eye: P.frost, ring: P.runeBlue, ringGlow: true, nostril: P.frost,
    extra(o: any, jo: any, hb: any, jb: any, H: number) {
      for (const s of [1, -1]) {
        const hrn = b.sweep(bezier(o(s * 0.2, 0.2, 0.1), o(s * 0.4, 0.6, -0.1), o(s * 0.62, 0.72, -0.6), o(s * 0.8, 0.5, -1.15)), [0.075 * H, 0], {
          bone: hb, color: P.horn, bands: [[0.65, P.horn], [1, P.hornTip]], caps: { end: "point" },
        });
        for (const t of [0.25, 0.45]) glow(b.stick(box(0.05, 0.015, 0.06), P.runeBlue, hrn.at(t, 0), { embed: 0.3 }), 1.4);
        const f = hrn.at(0.7, 180);
        b.part(cone(0.025, 0.2, 4), P.frost, { bone: hb, at: f.at, dir: [0, -1, 0], flat: true });
        // icicles under jaw
        [0.5, 0.9].forEach((z) => b.part(cone(0.03 * H, 0.24 * H, 4), P.frost, { bone: jb, at: jo(s * 0.17, -0.14, z), dir: [0, -1, 0], flat: true }));
        // frost crystals on skull
        b.part(cone(0.06 * H, 0.22 * H, 4), P.frost, { bone: hb, at: o(s * 0.12, 0.23, 0.2), dir: [s * 0.3, 1, -0.2], flat: true });
        b.part(cone(0.05 * H, 0.18 * H, 4), P.frost, { bone: hb, at: o(s * 0.2, 0.2, 0.45), dir: [s * 0.4, 1, 0.1], flat: true });
        // nostril breath
        b.part(cone(0.025 * H, 0.14 * H, 4), P.frost, { bone: hb, at: o(s * 0.1, 0.02, 1.62), dir: [s * 0.3, 0.1, 1], flat: true });
      }
      b.part(cone(0.05 * H, 0.2 * H, 4), P.frost, { bone: hb, at: o(0, 0.2, 0.9), dir: [0, 1, 0.2], flat: true });
    },
  });

  // ---------- RB : burnt, ember-cracked ----------
  const nkB = neck(["neckRB1", "neckRB2", "neckRB3"], "headRB", [0.4, 0.26], P.hideDark, false);
  // arrow in neck
  const cc = nkB.at(0.55, 0);
  const c0 = cc.at.clone().addScaledVector(cc.n, -cc.radius);
  const hit = b.surface(nkB).ray([c0.x - 3, c0.y, c0.z], [1, 0, 0]);
  if (hit) {
    b.stick(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 5).translate(0, 0.5, 0), P.leather, hit, { embed: 0.08 });
    b.stick(cone(0.05, 0.14, 4), P.ironLight, hit.moved([0, 0.0, 0]), { embed: 0 });
    b.stick(box(0.1, 0.18, 0.012).translate(0, 0.9, 0), P.bone, hit, { embed: 0 });
    b.stick(sph(0.05), P.wound, hit, { embed: 0.5 });
  }
  head({
    hj: "headRB", jj: "jawRB", H: 0.7, hide: P.hideDark, plate: P.hideMid,
    eye: P.ember, ring: P.eyeDark, ringGlow: false, nostril: P.ember,
    extra(o: any, jo: any, hb: any, jb: any, H: number) {
      // ember cracks on skull + snout
      const cracks: [number, number, number, number][] = [[0.05, 0.225, 0.1, 20], [-0.1, 0.22, 0.35, -25], [0.12, 0.215, 0.5, 40], [0, 0.17, 0.95, 5], [-0.06, 0.15, 1.2, -30]];
      cracks.forEach(([x, y, z, r]) => {
        b.part(box(0.07 * H, 0.012 * H, 0.3 * H), P.wound, { bone: hb, at: o(x, y, z), rotation: [0, r, 0] });
        glow(b.part(box(0.025 * H, 0.014 * H, 0.26 * H), P.ember, { bone: hb, at: o(x, y + 0.004, z), rotation: [0, r, 0] }), 1.5);
        glow(b.part(box(0.01 * H, 0.016 * H, 0.1 * H), P.emberGlow, { bone: hb, at: o(x, y + 0.006, z), rotation: [0, r, 0] }), 1.6);
      });
      // exposed bone on cheek
      b.part(box(0.03 * H, 0.2 * H, 0.32 * H), P.bone, { bone: hb, at: o(0.325, -0.03, 0.4), flat: true });
      for (let i = 0; i < 3; i++) b.part(box(0.035 * H, 0.012 * H, 0.28 * H), P.boneDark, { bone: hb, at: o(0.335, -0.09 + i * 0.06, 0.4) });
      // split charred horns
      for (const s of [1, -1]) {
        b.spike(o(s * 0.2, 0.2, 0.15), [s * 0.4, 1, -0.5], 0.4 * H, 0.075 * H, { bone: hb, color: P.horn });
        b.spike(o(s * 0.22, 0.17, 0.12), [s * 0.9, 0.7, -0.2], 0.34 * H, 0.06 * H, { bone: hb, color: P.horn });
        b.part(sph(0.05 * H), P.hideDark, { bone: hb, at: o(s * 0.2, 0.2, 0.15), flat: true });
        glow(b.part(sph(0.025 * H), P.ember, { bone: hb, at: o(s * 0.2, 0.235, 0.14) }), 1.4);
      }
      // ember mouth
      for (let i = 0; i < 5; i++) {
        glow(b.part(sph((0.035 + (i % 2) * 0.015) * H), P.emberGlow, { bone: jb, at: jo((i % 2 ? 0.07 : -0.07), 0.0, 0.25 + i * 0.22), flat: true }), 1.7);
      }
    },
  });
}
```