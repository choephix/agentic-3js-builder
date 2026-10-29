<!-- call: plan -->

```json
{
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stout Warcraft-style dwarf smith in horned steel helm, blue tunic, leather apron and big braided ginger beard, one fist raising a runed smithing hammer and the other gripping tongs that hold a glowing bar on an anvil atop a log stump.",
  "builderName": "dwarfBlacksmith",
  "size": [1.2, 1.7, 1.3],
  "layout": "Stylized Blizzard/Warcraft proportions: the dwarf is about 1.5 m with the helm, and the pitch is chunky: a head about 1/4 of the body height, a barrel chest, shoulders wider than the hips, huge pauldrons, thick tree-trunk legs, oversized boots, and fists as big as the face's lower half. He stands centred on x = 0 at z about 0 and faces +Z, leaning a touch forward. The stump stands in front of him at z 0.4..1.0 with the anvil on it (long axis along x, horn pointing to the model's left, +X, face top at y 0.78). The dwarf's right hand (-X) holds a smithing hammer cocked up above the anvil's rear half; his left hand (+X) holds long tongs gripping the end of a glowing orange bar lying on the anvil face. The beard hangs in front of the chest as a big silhouette from chin to belt, built from a solid core plus broad overlapping braid blades and gold rings, in root-to-tip tones (dark red root, ginger body, pale gold tips). Warcraft look on every part: bold faceted low-poly forms, painterly hue-shifted tones (warm tones on top, cooler and darker below), steel and leather with gold trim and rivets, rim-lit blue runes, and hot-metal glow. Soot and wear are separate small pieces: dark smudges on the apron and knuckles, scuffs on the anvil face. The lowest points are the boots (y = 0) and the stump base (y = 0). The tallest point is the helm horns (about 1.65). The hammer head tops out at about 1.45. Nothing sits in front of the face except the beard's mustache, below the nose.",
  "palette": {
    "skin": "#d8956a",
    "skinShade": "#b46e4a",
    "beard": "#c25a20",
    "beardDark": "#7e2f12",
    "beardHi": "#f2b25a",
    "eyeWhite": "#f5eedb",
    "iris": "#3b8fd9",
    "ink": "#1f1a1c",
    "steel": "#8d97a8",
    "steelDark": "#4b5466",
    "steelLight": "#cfd8e6",
    "gold": "#e6b43c",
    "goldDark": "#a67620",
    "leather": "#7a4a28",
    "leatherDark": "#46281a",
    "leatherLight": "#aa6e3a",
    "tunic": "#2d5eb0",
    "trousers": "#5b4636",
    "wood": "#8c5b32",
    "woodDark": "#59381c",
    "ember": "#ff6a1a",
    "hotYellow": "#ffd54a",
    "runeBlue": "#63d6ff",
    "anvilIron": "#3d4452"
  },
  "mounts": {
    "hipsRoot": [0, 0.6, 0],
    "neckBase": [0, 1.18, 0.03],
    "chinFront": [0, 1.24, 0.22],
    "helmTop": [0, 1.5, 0.06],
    "shoulderL": [0.34, 1.06, 0.02],
    "shoulderR": [-0.34, 1.06, 0.02],
    "beltFront": [0, 0.7, 0.24],
    "gripR": [-0.28, 1.0, 0.47],
    "gripL": [0.27, 0.91, 0.48],
    "hammerHead": [-0.28, 1.34, 0.56],
    "workpieceEnd": [0.12, 0.805, 0.72],
    "anvilTop": [0, 0.78, 0.71],
    "stumpTop": [0, 0.4, 0.71],
    "floorFeetL": [0.17, 0, 0.05],
    "floorFeetR": [-0.17, 0, 0.05]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.6, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 0.7, 0], "dir": [0, 1, 0.08], "role": "spine" },
    { "name": "chest", "parent": "spine", "at": [0, 0.9, 0.01], "dir": [0, 1, 0.1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.17, 0.03], "dir": [0, 1, 0.2], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.24, 0.05], "dir": [0, 0.1, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.3, 0.1], "dir": [0, -0.2, 1], "role": "jaw" },
    { "name": "hipL", "parent": "hips", "at": [0.17, 0.58, 0], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.17, 0.32, 0.04], "dir": [0, -1, -0.1], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.17, 0.1, 0], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeL", "parent": "ankleL", "at": [0.17, 0.05, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.17, 0.58, 0], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.17, 0.32, 0.04], "dir": [0, -1, -0.1], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.17, 0.1, 0], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.17, 0.05, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "shoulderL", "parent": "chest", "at": [0.34, 1.06, 0.02], "dir": [0.3, -1, 0.9], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.4, 0.86, 0.2], "dir": [-0.4, 0.15, 0.8], "role": "arm", "group": "arms" },
    { "name": "wristL", "parent": "elbowL", "at": [0.27, 0.9, 0.46], "dir": [0, 0, 1], "role": "arm", "group": "arms" },
    { "name": "thumbL", "parent": "wristL", "at": [0.24, 0.9, 0.48], "dir": [-0.5, 0, 1], "role": "digit", "group": "arms" },
    { "name": "fingersL", "parent": "wristL", "at": [0.27, 0.91, 0.5], "dir": [0, 0, 1], "role": "digit", "group": "arms" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.34, 1.06, 0.02], "dir": [-0.3, -1, 0.9], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.4, 0.88, 0.2], "dir": [0.4, 0.4, 0.8], "role": "arm", "group": "arms" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.28, 1.0, 0.45], "dir": [0, 0, 1], "role": "arm", "group": "arms" },
    { "name": "thumbR", "parent": "wristR", "at": [-0.25, 1.0, 0.47], "dir": [0.5, 0.3, 1], "role": "digit", "group": "arms" },
    { "name": "fingersR", "parent": "wristR", "at": [-0.28, 1.0, 0.49], "dir": [0, 0, 1], "role": "digit", "group": "arms" }
  ],
  "parts": [
    {
      "id": "legsBoots",
      "builds": "Both stumpy legs from hip to floor. Thick trousers in 'trousers' (smooth swept tubes bending at the knee) with leather knee guards in 'leather' with 'gold' rivets; steel greaves with 'steelDark' edging and 'steelLight' highlight strips down the shin; heavy cuffed boots (chunky box and wedge soles in 'leatherDark', uppers in 'leather', broad steel toe caps in 'steel' with rivets, 'leatherLight' lace strips and buckle straps with 'gold' buckles, thick sole edge in 'ink'); small soot smudges at the toes; the lower hem of the pelvis and the crotch gusset in 'trousers'. Both legs are mirrored pairs and are slightly splayed outward in a stable stance. Rides hipL..toeL and hipR..toeR (and hips for the pelvis block).",
      "box": [[-0.32, 0, -0.2], [0.32, 0.66, 0.3]],
      "attaches": "Top of the legs meets the torso at the hipsRoot mount and the belt at y about 0.66; the boots stand on floorFeetL and floorFeetR (y = 0, lowest points sink at most 2 cm). The apron from the torso hangs in front of the thighs at z above 0.2, so keep the thigh fronts at z <= 0.2.",
      "joints": ["hips", "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "torso",
      "builds": "The barrel body from belt to collar, y 0.3 to 1.22. A wide rounded loft torso in 'tunic' (a Warcraft-blue tunic: big chest, round belly) with 'gold' trim bands at hem and collar, lacing strip on the chest. A wide 'leather' belt (swept loop round the waist) with a big 'gold' buckle carrying an anvil-and-hammer emblem built from small parts in 'goldDark', 'ink' and 'steelLight', plus belt pouches, a hammer loop and 'steel' studs at beltFront. A long 'leather' smith's apron: front panel from chest to knee (y 0.3) with a bib, 'leatherDark' stitched border, cross-straps over the shoulders and behind the neck, a pocket with 'steel' rivets, 'ink' soot smudges and scorch marks, and a small hanging 'leatherLight' tool roll. Huge pauldrons on both shoulders, centred on the shoulderL and shoulderR mounts: layered curved 'steel' plates (3 stacked lathes or wedges per side) with 'gold' rims, 'steelLight' edge highlights, rivet rows and one big upward spike on each, one 'runeBlue' glow rune on each. A gorget collar in 'steel' with 'gold' trim at the neck, a leather backpack or bedroll with straps on the back (z down to -0.28), and a small 'runeBlue' glow rune medallion on the chest strap. Rides hips, spine, chest.",
      "box": [[-0.52, 0.3, -0.28], [0.52, 1.22, 0.26]],
      "attaches": "Bottom meets the legs at y about 0.66 and at hipsRoot; the apron hangs over the thighs down to y 0.3 and stays at z <= 0.26. The neck and collar meet the head at neckBase. Arms start under the pauldrons at shoulderL and shoulderR (upper arms emerge at x about +-0.34, leave a clean opening). The beard from the head part falls in front of the chest at z above 0.26 down to y 0.82; keep the chest front, bib and any chest emblems at z <= 0.26 and do not put anything bigger on the bib above y 0.85.",
      "joints": ["hips", "spine", "chest"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "headBeard",
      "builds": "The big characterful head, helm and beard. Head about 0.34 wide and 0.3 tall, a rounded block of 'skin' with a heavy brow ridge, wide cheekbones, a big bulbous nose in 'skin' with 'skinShade' underside and a pinkish 'skinShade' flush, a separate upper head and lower jaw (jaw joint) with a closed mouth line in 'ink', small round ears in 'skin' with 'skinShade' inner ear. Large eyes that read from the front: 'ink' outline, 'eyeWhite', 'iris' blue iris with 'ink' pupil and a tiny 'eyeWhite' highlight, under bushy overhanging brows made of 3 to 4 broad blades each in 'beardDark', 'beard' and 'beardHi'. A horned steel half-helm: 'steel' skull cap with 'steelDark' brow band and bolt rivets in 'gold', a 'gold' centre crest strip, 'steelLight' edge highlights, two big curved 'steelLight' to 'steel' horns (swept tubes, tips pointing up and out to y about 1.65), and cheek flaps over the ears; a nose-guard is NOT built, the face stays open. A huge ginger beard: a solid core silhouette from the cheeks to the belt (down to y 0.82, front at z about 0.38), plus a modest number of broad overlapping braid blades and 2 thick side braids with 'gold' rings and 'goldDark' beads, root-to-tip in 'beardDark' then 'beard' then 'beardHi'; a bold curling mustache with two braided tips below the nose, sideburns, and a small tuft of hair under the helm at the back. Everything in front of the face stays clear; the mustache sits below the nose. Rides neck, head, jaw.",
      "box": [[-0.3, 0.8, -0.2], [0.3, 1.68, 0.42]],
      "attaches": "Neck sits at the neckBase mount inside the gorget collar. The beard front hangs over the chest and ends at y 0.82 and must not poke through the torso (the torso front is at z about 0.26). Helm top is at helmTop. The head must not collide with the hammer head at hammerHead (x -0.42..-0.14, y 1.28..1.42, z 0.5..0.62, in front of the face).",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "armsTools",
      "builds": "Both muscular arms and the tools. Bare 'skin' upper arms (chunky swept tubes, bulging biceps) coming from under the pauldrons and bending at the elbows, wrapped forearms with 'leather' bracers (bands in 'leatherDark', 'gold' rivets and laces) and 'skinShade' soot smudges and a few pale scars, thick 'leatherLight' gauntlet gloves with 'leatherDark' knuckle stitching, chunky fists with separate fingers and a thumb (digit joints). The dwarf's right hand (-X, at gripR) grips a big smithing hammer: 'wood' handle (swept, slightly tapered) with 'leatherDark' grip wrap bands and a 'gold' pommel cap, rising from the fist at about 80 degrees from horizontal to the head at hammerHead; the head is a heavy block (axis along x, about 0.28 long and 0.11 tall) in 'steel' with a 'steelDark' flat striking face, a 'steelLight' bevel, 'gold' collar bands and four 'runeBlue' glow rune marks on its sides. His left hand (+X, at gripL) holds long iron tongs: two 'steelDark' arm rods crossing at a 'gold' rivet at about [0.2, 0.84, 0.62], 'leatherDark' grip sleeves at the handles, flat jaws gripping the bar end at workpieceEnd (the tongs end exactly at that mount). Left arm mirrors right except bend pose. Rides shoulderL..fingersL and shoulderR..fingersR.",
      "box": [[-0.58, 0.75, -0.05], [0.58, 1.5, 0.75]],
      "attaches": "Shoulders at shoulderL and shoulderR (under the torso's pauldrons). Left tong jaws at workpieceEnd on the glowing bar from the anvil part. The hammer head floats above the rear half of the anvil (z about 0.56, y above 1.28, x from -0.42 to -0.14), clear of the head part's face and helm.",
      "joints": ["shoulderL", "elbowL", "wristL", "thumbL", "fingersL", "shoulderR", "elbowR", "wristR", "thumbR", "fingersR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "anvilStump",
      "builds": "The workstation under the smith's hands, built to the dwarf's footprint and simpler than him. A fat log stump (roughly a 12-sided prism, radius about 0.3, centred at x 0, z 0.71, y 0 to 0.4) in 'wood' with a 'woodDark' bark skirt, a 'woodDark' root flare at the base, a top disc with 'woodLight' style growth rings made of 'leatherLight' thin lathe rings and a 'woodDark' split crack, two 'steelDark' iron hoop bands with 'gold' rivets, chop scars; the stump top is at stumpTop (y 0.4). The anvil on top in 'anvilIron': a waisted body, a tall base foot with 'steelDark' ledges, a flat 'steel' face plate on top at anvilTop (y 0.78, about 0.45 long in x with a 0.2 square-ish face and a 0.15 chamfered rear), a pointed horn curling toward +X (the model's left) that reaches x about 0.6, a stepped heel and tail on the -X side with hardy hole and pritchel hole in 'ink', 'steelLight' highlight edges, 'ink' soot and a few 'goldDark' scuffs, and a small 'runeBlue' glow rune on the front waist. Lying on the anvil face: a glowing hot iron bar (about 0.4 long along +x from workpieceEnd, 0.035 square) in 'ember' with a 'hotYellow' hot tip end and 'hotYellow' core strip; plus 6 to 8 tiny 'hotYellow' and 'ember' spark chips hovering above the bar and 2 or 3 small 'ink' scale flakes on the face. Nothing else is staged around them. Rides the root joint hips only as a rigid prop (a static prop, no extra joints).",
      "box": [[-0.5, 0, 0.38], [0.62, 0.95, 1.0]],
      "attaches": "Stands on the floor at y = 0, the stump centred at x 0, z 0.71. The bar starts at workpieceEnd [0.12, 0.805, 0.72], where the tongs from the arms part hold it, and lies on the anvilTop face at y 0.78. The hammer from the arms part is cocked above and behind the bar and does not touch it.",
      "joints": ["hips"],
      "floor": true,
      "budget": 130
    }
  ]
}
```

<!-- call: anvilStump -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildAnvilStump({ b, J, P, M }: any) {
  const bone = J.hips;
  const R = rng(11);
  const WOOD_LIGHT = "#b98350";
  const CX = 0, CZ = 0.71;

  const part = (geo: THREE.BufferGeometry, color: string, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...extra });
  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, extra);

  // ---------- Stump ----------
  part(new THREE.CylinderGeometry(0.3, 0.32, 0.4, 12), P.wood, [CX, 0.2, CZ]);
  // bark skirt
  part(new THREE.CylinderGeometry(0.315, 0.33, 0.1, 12), P.woodDark, [CX, 0.05, CZ]);
  // root flare
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const x = CX + Math.sin(a) * 0.33, z = CZ + Math.cos(a) * 0.33;
    part(new THREE.ConeGeometry(0.06, 0.12, 5), P.woodDark, [x, 0.05, z], {
      rotation: [0, (a * 180) / Math.PI, 90 * 0 + 70],
    });
  }
  // top disc
  part(new THREE.CylinderGeometry(0.29, 0.3, 0.02, 12), WOOD_LIGHT, [CX, 0.395, CZ]);
  for (const r of [0.07, 0.14, 0.21, 0.27]) {
    part(new THREE.TorusGeometry(r, 0.004, 4, 16), P.leatherLight, [CX, 0.406, CZ], { rotation: [90, 0, 0] });
  }
  // split crack
  box(0.02, 0.006, 0.26, P.woodDark, [CX + 0.18, 0.407, CZ - 0.05], { rotation: [0, 25, 0] });
  box(0.012, 0.006, 0.12, P.woodDark, [CX + 0.2, 0.407, CZ + 0.12], { rotation: [0, -15, 0] });
  // iron hoops with rivets
  for (const y of [0.1, 0.32]) {
    part(new THREE.CylinderGeometry(0.318, 0.322, 0.04, 12), P.steelDark, [CX, y, CZ]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.2;
      part(new THREE.SphereGeometry(0.01, 5, 4), P.gold, [CX + Math.sin(a) * 0.322, y, CZ + Math.cos(a) * 0.322]);
    }
  }
  // chop scars
  for (let i = 0; i < 5; i++) {
    const a = R() * Math.PI * 2;
    box(0.05, 0.012, 0.01, P.woodDark, [CX + Math.sin(a) * 0.305, 0.2 + R() * 0.07, CZ + Math.cos(a) * 0.305], {
      rotation: [0, (a * 180) / Math.PI, 20 + R() * 40],
    });
  }

  // ---------- Anvil ----------
  const Y0 = 0.4;
  // foot
  box(0.3, 0.05, 0.2, P.anvilIron, [CX, Y0 + 0.025, CZ]);
  box(0.34, 0.025, 0.24, P.steelDark, [CX, Y0 + 0.0125, CZ]);
  box(0.26, 0.02, 0.17, P.steelDark, [CX, Y0 + 0.06, CZ]);
  // waist
  part(new THREE.CylinderGeometry(0.075, 0.11, 0.18, 6), P.anvilIron, [CX, Y0 + 0.16, CZ], { scale: [1.3, 1, 0.85] });
  box(0.2, 0.04, 0.17, P.anvilIron, [CX, Y0 + 0.27, CZ]);
  // body under face
  box(0.4, 0.07, 0.19, P.anvilIron, [CX, 0.7, CZ]);
  // face plate
  box(0.46, 0.04, 0.2, P.steel, [CX, 0.76, CZ]);
  // highlight edges
  box(0.46, 0.006, 0.008, P.steelLight, [CX, 0.782, CZ + 0.1]);
  box(0.46, 0.006, 0.008, P.steelLight, [CX, 0.782, CZ - 0.1]);
  box(0.008, 0.006, 0.2, P.steelLight, [CX - 0.23, 0.782, CZ]);
  // horn toward +X
  part(new THREE.ConeGeometry(0.095, 0.3, 8), P.anvilIron, [CX + 0.38, 0.745, CZ], { rotation: [0, 0, -90] });
  part(new THREE.ConeGeometry(0.07, 0.2, 8), P.steel, [CX + 0.45, 0.755, CZ], { rotation: [0, 0, -92] });
  part(new THREE.SphereGeometry(0.012, 5, 4), P.steelLight, [CX + 0.6, 0.77, CZ]);
  // heel / tail on -X
  box(0.1, 0.06, 0.17, P.anvilIron, [CX - 0.26, 0.735, CZ]);
  box(0.07, 0.04, 0.15, P.steelDark, [CX - 0.33, 0.72, CZ]);
  box(0.1, 0.012, 0.17, P.steel, [CX - 0.28, 0.768, CZ]);
  // holes
  box(0.03, 0.004, 0.03, P.ink, [CX - 0.14, 0.783, CZ - 0.02]);
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 8), P.ink, [CX - 0.2, 0.783, CZ + 0.03]);
  // soot and scuffs
  box(0.07, 0.003, 0.05, P.ink, [CX - 0.05, 0.782, CZ - 0.05], { rotation: [0, 20, 0] });
  for (let i = 0; i < 3; i++)
    box(0.03, 0.003, 0.004, P.goldDark, [CX + (R() - 0.5) * 0.3, 0.783, CZ + (R() - 0.5) * 0.14], {
      rotation: [0, R() * 90, 0],
    });
  // rune on front waist
  glow(box(0.02, 0.05, 0.004, P.runeBlue, [CX, Y0 + 0.17, CZ + 0.1]), 1.5);
  glow(box(0.04, 0.012, 0.004, P.runeBlue, [CX, Y0 + 0.18, CZ + 0.1]), 1.5);
  glow(box(0.012, 0.03, 0.004, P.runeBlue, [CX + 0.02, Y0 + 0.14, CZ + 0.1], { rotation: [0, 0, 30] }), 1.5);

  // ---------- Hot bar ----------
  const bx = M.workpieceEnd[0] + 0.2;
  glow(box(0.4, 0.035, 0.035, P.ember, [bx, 0.7975, M.workpieceEnd[2]]), 1.3);
  glow(box(0.36, 0.01, 0.012, P.hotYellow, [bx, 0.817, M.workpieceEnd[2]]), 1.6);
  glow(box(0.06, 0.036, 0.036, P.hotYellow, [bx + 0.18, 0.7975, M.workpieceEnd[2]]), 1.8);

  // sparks
  for (let i = 0; i < 7; i++) {
    const c = i % 2 ? P.hotYellow : P.ember;
    glow(
      box(0.012, 0.012, 0.012, c, [0.15 + R() * 0.4, 0.84 + R() * 0.18, 0.62 + R() * 0.2], {
        rotation: [R() * 90, R() * 90, R() * 90],
      }),
      1.6,
    );
  }
  // scale flakes
  for (let i = 0; i < 3; i++)
    box(0.02, 0.003, 0.015, P.ink, [0.0 + R() * 0.3 - 0.1, 0.783, CZ + 0.06 + R() * 0.05], { rotation: [0, R() * 90, 0] });
}
```

<!-- call: legsBoots -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegsBoots({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (bone: any, c: string, at: number[], size: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), c, { bone, at, rotation: rot });
  const ball = (bone: any, c: string, at: number[], r: number, sc: number[] = [1, 1, 1], seg = 6) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), c, { bone, at, scale: sc });
  const rivet = (bone: any, at: number[], r = 0.008) => ball(bone, P.gold, at, r, [1, 1, 1], 5);

  // ---- pelvis ----
  const hips = J.hips;
  box(hips, P.trousers, [0, 0.6, 0], [0.42, 0.13, 0.3]);
  box(hips, P.trousers, [0, 0.56, 0.0], [0.3, 0.08, 0.28]);
  box(hips, P.leatherDark, [0, 0.545, 0.0], [0.08, 0.04, 0.2]); // crotch gusset
  box(hips, P.trousers, [0, 0.52, 0.08], [0.1, 0.06, 0.12]);
  ball(hips, P.trousers, [0.17, 0.585, 0], 0.115, [1, 0.9, 1.1], 8);
  ball(hips, P.trousers, [-0.17, 0.585, 0], 0.115, [1, 0.9, 1.1], 8);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side];
    const knee = J["knee" + side];
    const ankle = J["ankle" + side];
    const toe = J["toe" + side];
    const x = s * 0.17;

    // trousers: thigh and shin tubes
    b.capsule([x, 0.58, 0], [x, 0.33, 0.04], [0.108, 0.092], P.trousers, { bone: hip, sides: 8 });
    b.capsule([x, 0.33, 0.04], [x, 0.13, 0.0], [0.09, 0.08], P.trousers, { bone: knee, sides: 8 });
    ball(knee, P.trousers, [x, 0.32, 0.04], 0.095, [1, 1, 1], 7);
    // trouser creases / thigh patch
    box(hip, P.leatherDark, [x + s * 0.0, 0.46, 0.1], [0.05, 0.1, 0.01]);

    // knee guard
    ball(knee, P.leather, [x, 0.33, 0.115], 0.07, [1.2, 1, 0.55], 7);
    box(knee, P.leatherDark, [x, 0.33, 0.14], [0.12, 0.015, 0.012]);
    for (const [dx, dy] of [[-0.04, 0.03], [0.04, 0.03], [-0.04, -0.03], [0.04, -0.03]])
      rivet(knee, [x + dx, 0.33 + dy, 0.147]);

    // greave on the shin
    box(knee, P.steel, [x, 0.2, 0.1], [0.12, 0.19, 0.03], [-4, 0, 0]);
    box(knee, P.steelDark, [x - 0.066, 0.2, 0.095], [0.014, 0.19, 0.034], [-4, 0, 0]);
    box(knee, P.steelDark, [x + 0.066, 0.2, 0.095], [0.014, 0.19, 0.034], [-4, 0, 0]);
    box(knee, P.steelDark, [x, 0.295, 0.1], [0.13, 0.016, 0.034]);
    box(knee, P.steelLight, [x, 0.2, 0.118], [0.02, 0.16, 0.006], [-4, 0, 0]);
    rivet(knee, [x - 0.04, 0.28, 0.118], 0.007);
    rivet(knee, [x + 0.04, 0.28, 0.118], 0.007);

    // boot: sole, upper, cuff
    box(ankle, P.leatherDark, [x, 0.025, 0.04], [0.195, 0.05, 0.25]);
    box(toe, P.leatherDark, [x, 0.025, 0.19], [0.18, 0.05, 0.1]);
    box(toe, P.leatherDark, [x, 0.02, 0.25], [0.15, 0.04, 0.03], [0, 0, 0]);
    box(ankle, P.ink, [x, 0.011, 0.04], [0.2, 0.022, 0.255]);
    box(toe, P.ink, [x, 0.011, 0.2], [0.185, 0.022, 0.12]);
    box(ankle, P.leatherDark, [x, 0.012, -0.095], [0.15, 0.03, 0.03]); // heel block
    box(ankle, P.leather, [x, 0.12, 0.0], [0.17, 0.14, 0.2]);
    box(toe, P.leather, [x, 0.095, 0.16], [0.17, 0.09, 0.14]);
    box(ankle, P.leather, [x, 0.2, 0.0], [0.19, 0.06, 0.22]);
    box(ankle, P.leatherDark, [x, 0.232, 0.0], [0.195, 0.014, 0.225]);
    box(ankle, P.leatherLight, [x, 0.17, 0.112], [0.15, 0.012, 0.012]);

    // lace strip
    box(toe, P.leatherLight, [x, 0.145, 0.12], [0.04, 0.01, 0.1], [-12, 0, 0]);
    for (let i = 0; i < 4; i++) box(toe, P.leatherDark, [x, 0.151, 0.085 + i * 0.026], [0.07, 0.006, 0.008], [-12, 0, 0]);

    // buckle straps
    for (const [y, z] of [[0.15, 0.102], [0.19, 0.11]]) {
      box(ankle, P.leatherDark, [x, y, z], [0.18, 0.026, 0.01]);
      box(ankle, P.gold, [x + s * 0.03, y, z + 0.007], [0.03, 0.03, 0.008]);
      box(ankle, P.goldDark, [x + s * 0.03, y, z + 0.0115], [0.016, 0.016, 0.004]);
    }

    // steel toe cap
    ball(toe, P.steel, [x, 0.088, 0.205], 0.09, [0.95, 0.7, 1.0], 8);
    box(toe, P.steelDark, [x, 0.046, 0.215], [0.17, 0.014, 0.12]);
    box(toe, P.steelLight, [x, 0.14, 0.205], [0.03, 0.006, 0.07], [-10, 0, 0]);
    for (const dx of [-0.05, 0, 0.05]) rivet(toe, [x + dx, 0.115, 0.265], 0.008);
    // soot smudges
    for (let i = 0; i < 3; i++) {
      const dx = (R() - 0.5) * 0.1;
      box(toe, P.ink, [x + dx, 0.12 + R() * 0.02, 0.255 + R() * 0.01], [0.02 + R() * 0.02, 0.012, 0.012], [-30, 0, R() * 60]);
    }
    ball(toe, P.ink, [x + s * 0.04, 0.05, 0.285], 0.012, [1.6, 0.5, 1], 5);
  }
}
```

<!-- call: armsTools -->

```ts
import * as THREE from "three";
import { lerp } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildArmsTools({ b, J, P, M }: any) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, l: number, n = 8) => new THREE.CylinderGeometry(r, r, l, n);
  const ball = (r: number, color: string, bone: any, at: number[] | THREE.Vector3, scale: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, scale, flat: true });
  const rod = (a: any, c: any, r: number | number[], color: string, bone: any, extra: any = {}) =>
    b.rod(a, c, r, color, { bone, ...extra });
  const cap = (a: any, c: any, r: number | number[], color: string, bone: any) =>
    b.capsule(a, c, r, color, { bone });
  const ringAt = (a: number[], c: number[], t: number, r: number, len: number, color: string, bone: any) => {
    const at = lerp(a, c, t);
    const dir = V(c).sub(V(a)).normalize();
    return b.part(cyl(r, len, 10), color, { bone, at, dir });
  };

  const sides = [
    {
      s: 1,
      sh: [0.34, 1.06, 0.02],
      el: [0.4, 0.86, 0.2],
      wr: [0.27, 0.9, 0.46],
      fist: M.gripL as number[],
      j: { sh: J.shoulderL, el: J.elbowL, wr: J.wristL, th: J.thumbL, fi: J.fingersL },
    },
    {
      s: -1,
      sh: [-0.34, 1.06, 0.02],
      el: [-0.4, 0.88, 0.2],
      wr: [-0.28, 1.0, 0.45],
      fist: M.gripR as number[],
      j: { sh: J.shoulderR, el: J.elbowR, wr: J.wristR, th: J.thumbR, fi: J.fingersR },
    },
  ];

  for (const S of sides) {
    const { s, sh, el, wr, fist, j } = S;
    // ---- arm skin
    ball(0.085, P.skin, j.sh, sh);
    cap(sh, el, [0.078, 0.066], P.skin, j.sh);
    const bic = lerp(sh, el, 0.45);
    ball(0.082, P.skin, j.sh, [bic.x + s * 0.02, bic.y + 0.03, bic.z + 0.02], [1, 1.1, 1.05]);
    ball(0.07, P.skin, j.el, el);
    cap(el, wr, [0.066, 0.056], P.skin, j.el);
    // soot and scars
    ball(0.02, P.skinShade, j.sh, [bic.x + s * 0.06, bic.y + 0.03, bic.z + 0.06], [1.3, 0.6, 1]);
    const fa = lerp(el, wr, 0.2);
    ball(0.016, P.skinShade, j.el, [fa.x + s * 0.01, fa.y + 0.06, fa.z + 0.01], [1.4, 0.5, 1]);
    for (let i = 0; i < 2; i++) {
      const p = lerp(sh, el, 0.7 + i * 0.1);
      b.part(box(0.004, 0.003, 0.035), "#f0c7a5", {
        bone: j.sh,
        at: [p.x + s * 0.0, p.y + 0.066, p.z + 0.01],
        rotation: [0, s * (20 + i * 25), 0],
      });
    }
    // ---- bracer
    rod(lerp(el, wr, 0.3), lerp(el, wr, 0.85), 0.07, P.leather, j.el);
    for (const t of [0.34, 0.55, 0.8]) ringAt(el, wr, t, 0.075, 0.025, P.leatherDark, j.el);
    for (const t of [0.4, 0.62, 0.74]) {
      const p = lerp(el, wr, t);
      ball(0.01, P.gold, j.el, [p.x, p.y + 0.071, p.z], [1, 0.7, 1]);
    }
    for (let i = 0; i < 3; i++) {
      const p = lerp(el, wr, 0.45 + i * 0.05);
      b.part(box(0.05, 0.004, 0.006), P.leatherDark, {
        bone: j.el,
        at: [p.x, p.y + 0.071, p.z],
        rotation: [0, 0, s * 10],
      });
    }
    // ---- glove cuff + fist
    rod(lerp(el, wr, 0.9), [wr[0], wr[1], wr[2] + 0.03], 0.08, P.leatherLight, j.wr);
    ringAt(el, wr, 0.92, 0.083, 0.012, P.leatherDark, j.wr);
    b.part(box(0.115, 0.105, 0.105), P.leatherLight, { bone: j.wr, at: fist });
    // knuckle stitching + soot
    for (let i = 0; i < 4; i++) {
      b.part(box(0.012, 0.004, 0.02), P.leatherDark, {
        bone: j.wr,
        at: [fist[0] + (i - 1.5) * 0.026, fist[1] + 0.054, fist[2] + 0.03],
      });
      b.part(box(0.003, 0.02, 0.003), P.leatherDark, {
        bone: j.wr,
        at: [fist[0] + (i - 1.5) * 0.026, fist[1] + 0.03, fist[2] + 0.054],
      });
    }
    ball(0.016, P.ink, j.wr, [fist[0] + s * 0.02, fist[1] + 0.052, fist[2] + 0.01], [1.4, 0.4, 1]);
    // fingers
    for (let i = 0; i < 4; i++) {
      const y = fist[1] + 0.036 - i * 0.024;
      cap(
        [fist[0] - s * 0.03, y, fist[2] + 0.05],
        [fist[0] + s * 0.035, y, fist[2] + 0.055],
        0.0145,
        P.leatherLight,
        j.fi,
      );
      b.part(box(0.003, 0.003, 0.003), P.leatherDark, { bone: j.fi, at: [fist[0], y + 0.015, fist[2] + 0.065] });
    }
    // thumb
    const t0 = [fist[0] - s * 0.045, fist[1] + 0.03, fist[2] + 0.02];
    const t1 = [t0[0] - s * 0.03, t0[1] + 0.025, t0[2] + 0.045];
    cap(t0, t1, [0.02, 0.017], P.leatherLight, j.th);
    ball(0.006, P.leatherDark, j.th, [t1[0], t1[1] + 0.015, t1[2]]);
  }

  // ---------- Hammer (right hand)
  const hb = [-0.272, 0.89, 0.44];
  const ht = [-0.28, 1.37, 0.56];
  const wrR = J.wristR;
  rod(hb, ht, [0.024, 0.019], P.wood, wrR);
  for (const t of [0.04, 0.1, 0.16, 0.22, 0.28]) ringAt(hb, ht, t, 0.0275, 0.018, P.leatherDark, wrR);
  const hd = V(ht).sub(V(hb)).normalize();
  b.part(cyl(0.032, 0.03, 10), P.gold, { bone: wrR, at: V(hb).addScaledVector(hd, -0.005), dir: hd });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), P.goldDark, { bone: wrR, at: V(hb).addScaledVector(hd, -0.025) });
  // head
  const HC = [-0.28, 1.35, 0.56];
  b.part(box(0.2, 0.11, 0.11), P.steel, { bone: wrR, at: HC });
  b.part(box(0.045, 0.125, 0.125), P.steel, { bone: wrR, at: [HC[0] + 0.1, HC[1], HC[2]] });
  b.part(box(0.045, 0.125, 0.125), P.steel, { bone: wrR, at: [HC[0] - 0.1, HC[1], HC[2]] });
  b.part(box(0.01, 0.115, 0.115), P.steelDark, { bone: wrR, at: [HC[0] + 0.1275, HC[1], HC[2]] });
  b.part(box(0.01, 0.115, 0.115), P.steelDark, { bone: wrR, at: [HC[0] - 0.1275, HC[1], HC[2]] });
  b.part(box(0.28, 0.01, 0.1), P.steelLight, { bone: wrR, at: [HC[0], HC[1] + 0.0625, HC[2]] });
  b.part(box(0.28, 0.01, 0.06), P.steelDark, { bone: wrR, at: [HC[0], HC[1] - 0.0625, HC[2]] });
  for (const x of [-0.065, 0.065]) {
    b.part(box(0.016, 0.118, 0.118), P.gold, { bone: wrR, at: [HC[0] + x, HC[1], HC[2]] });
  }
  for (const zs of [1, -1])
    for (const x of [-0.04, 0.04]) {
      glow(
        b.part(box(0.026, 0.04, 0.004), P.runeBlue, { bone: wrR, at: [HC[0] + x * 1.0, HC[1], HC[2] + zs * 0.0585] }),
        1.4,
      );
      b.part(box(0.01, 0.01, 0.003), P.ink, { bone: wrR, at: [HC[0] + x, HC[1], HC[2] + zs * 0.0595] });
    }
  for (const x of [-0.1, 0.1])
    for (const dy of [-0.04, 0.04])
      ball(0.007, P.gold, wrR, [HC[0] + x * 1.3, HC[1] + dy, HC[2] + 0.063]);

  // ---------- Tongs (left hand)
  const wrL = J.wristL;
  const pivot = [0.2, 0.84, 0.62];
  const tip = M.workpieceEnd as number[];
  const tongs = [
    { jaw: [tip[0] + 0.022, tip[1], tip[2]], hand: [0.245, 0.915, 0.43] },
    { jaw: [tip[0] - 0.022, tip[1], tip[2]], hand: [0.31, 0.915, 0.43] },
  ];
  for (const T of tongs) {
    rod(T.jaw, pivot, 0.009, P.steelDark, wrR === wrL ? wrL : wrL);
    const ext = V(pivot).add(V(pivot).sub(V(T.jaw)).multiplyScalar(2.6));
    const end = [T.hand[0], T.hand[1], T.hand[2] - 0.02];
    rod(pivot, end, 0.0095, P.steelDark, wrL);
    ringAt(pivot, end, 0.62, 0.0175, 0.1, P.leatherDark, wrL);
    // flat jaw pad
    b.part(box(0.006, 0.03, 0.05), P.steelDark, {
      bone: wrL,
      at: [T.jaw[0] + (T.jaw[0] > tip[0] ? -0.003 : 0.003), tip[1], tip[2] - 0.02],
    });
    void ext;
  }
  b.part(cyl(0.013, 0.03, 8), P.gold, { bone: wrL, at: pivot, dir: [0, 1, 0] });
  ball(0.011, P.goldDark, wrL, [pivot[0], pivot[1] + 0.016, pivot[2]]);
  // soot flecks on tong handles
  ball(0.006, P.ink, wrL, [0.28, 0.925, 0.5], [1.5, 0.6, 1]);
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const chest = J.chest;
  const hips = J.hips;

  // ---------- helpers ----------
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: chest, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (seg = 14) => new THREE.CylinderGeometry(1, 1, 1, seg);
  const ball = (r: number, ws = 6, hs = 4) => new THREE.SphereGeometry(r, ws, hs);
  const torus = (r: number, t: number, seg = 14) => new THREE.TorusGeometry(r, t, 5, seg);
  const rivet = (at: number[], bone: any = chest, color = P.gold, r = 0.009) =>
    b.part(ball(r, 6, 4), color, { bone, at });
  const runeGeo = (s: number) =>
    mergeGeometries([
      new THREE.BoxGeometry(s * 0.18, s, s * 0.12),
      new THREE.BoxGeometry(s * 0.16, s * 0.65, s * 0.12).rotateZ(-0.8).translate(s * 0.2, s * 0.22, 0),
      new THREE.BoxGeometry(s * 0.16, s * 0.65, s * 0.12).rotateZ(0.8).translate(s * 0.2, -s * 0.2, 0),
    ])!;
  const rune = (at: number[], n: number[], s: number, bone: any = chest, backR = 0) => {
    const nv = new THREE.Vector3(...n).normalize();
    if (backR > 0)
      b.part(cyl(8), P.steelDark, {
        bone,
        at: [at[0] - nv.x * 0.004, at[1] - nv.y * 0.004, at[2] - nv.z * 0.004],
        dir: n,
        scale: [backR, 0.008, backR],
      });
    glow(b.part(runeGeo(s), P.runeBlue, { bone, at, dir: n, axis: "z", up: [0, 1, 0] }), 1.6);
  };
  const bibZ = (y: number) => 0.236 - (y - 0.9) * 0.0875;

  // ---------- tunic loft ----------
  b.loft(
    [
      { at: [0, 0.6, 0.0], w: 0.46, h: 0.38 },
      { at: [0, 0.8, 0.01], w: 0.54, h: 0.46 },
      { at: [0, 1.0, 0.0], w: 0.62, h: 0.44 },
      { at: [0, 1.19, 0.01], w: 0.42, h: 0.3 },
    ],
    { bone: [hips, J.spine, chest], color: P.tunic, sides: 14 },
  );
  // gold trim: hem and collar
  put(cyl(16), P.gold, [0, 0.63, 0], { bone: hips, scale: [0.245, 0.035, 0.205] });
  put(cyl(16), P.gold, [0, 1.165, 0.005], { scale: [0.215, 0.03, 0.17] });
  // darker underarm shading panels
  for (const s of [1, -1]) put(box(0.04, 0.3, 0.3), P.tunic === "" ? P.tunic : "#244a8c", [s * 0.3, 0.88, 0.0], { rotation: [0, 0, s * -6] });

  // lacing strip at the collar
  put(box(0.05, 0.08, 0.012), P.leatherDark, [0, 1.13, 0.205], { rotation: [-18, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const y = 1.105 + i * 0.026;
    for (const k of [1, -1])
      put(box(0.05, 0.007, 0.007), P.leatherLight, [0, y, 0.213 - i * 0.004], { rotation: [-18, 0, k * 30] });
  }

  // ---------- gorget ----------
  put(new THREE.CylinderGeometry(0.17, 0.22, 0.07, 14), P.steel, [0, 1.205, 0.0], { scale: [1, 1, 0.85] });
  put(torus(0.19, 0.012, 16), P.gold, [0, 1.238, 0.0], { rotation: [90, 0, 0], scale: [1, 0.85, 1] });
  put(torus(0.225, 0.011, 16), P.gold, [0, 1.172, 0.0], { rotation: [90, 0, 0], scale: [1, 0.85, 1] });
  put(torus(0.178, 0.006, 16), P.steelLight, [0, 1.246, 0.0], { rotation: [90, 0, 0], scale: [1, 0.85, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rivet([Math.sin(a) * 0.2, 1.205, Math.cos(a) * 0.2 * 0.85], chest, P.gold, 0.008);
  }

  // ---------- belt ----------
  put(cyl(18), P.leather, [0, 0.7, 0.005], { bone: hips, scale: [0.275, 0.075, 0.255] });
  put(cyl(18), P.leatherDark, [0, 0.738, 0.005], { bone: hips, scale: [0.278, 0.006, 0.258] });
  put(cyl(18), P.leatherDark, [0, 0.662, 0.005], { bone: hips, scale: [0.278, 0.006, 0.258] });
  // buckle
  const bz = 0.275;
  put(box(0.13, 0.095, 0.02), P.gold, [0, 0.7, bz], { bone: hips });
  put(box(0.1, 0.07, 0.01), P.goldDark, [0, 0.7, bz + 0.012], { bone: hips });
  put(box(0.135, 0.01, 0.024), P.steelLight, [0, 0.745, bz], { bone: hips });
  // emblem: anvil + hammer
  const ez = bz + 0.019;
  put(box(0.05, 0.012, 0.006), P.steelLight, [0.0, 0.705, ez], { bone: hips });
  put(box(0.026, 0.014, 0.006), P.steelLight, [0.034, 0.707, ez], { bone: hips });
  put(box(0.026, 0.016, 0.006), P.ink, [0, 0.69, ez], { bone: hips });
  put(box(0.04, 0.008, 0.006), P.ink, [0, 0.679, ez], { bone: hips });
  put(box(0.006, 0.05, 0.005), P.ink, [-0.02, 0.718, ez + 0.002], { bone: hips, rotation: [0, 0, -35] });
  put(box(0.026, 0.014, 0.006), P.steelLight, [-0.033, 0.737, ez + 0.002], { bone: hips, rotation: [0, 0, -35] });
  // studs across the front
  for (let i = -4; i <= 4; i++) {
    if (Math.abs(i) < 2) continue;
    const a = i * 0.2;
    rivet([Math.sin(a) * 0.27, 0.7, 0.005 + Math.cos(a) * 0.258], hips, P.steel, 0.011);
  }
  // pouches
  for (const s of [1, -1]) {
    put(box(0.1, 0.12, 0.065), P.leatherDark, [s * 0.215, 0.62, 0.15], { bone: hips, rotation: [0, s * 35, 0] });
    put(box(0.105, 0.04, 0.07), P.leather, [s * 0.215, 0.665, 0.15], { bone: hips, rotation: [0, s * 35, 0] });
    put(ball(0.012), P.gold, [s * 0.243, 0.655, 0.2], { bone: hips });
  }
  // hammer loop at the left hip
  put(torus(0.03, 0.01, 8), P.leatherDark, [0.285, 0.66, 0.02], { bone: hips, rotation: [0, 90, 0] });
  put(box(0.03, 0.06, 0.03), P.leather, [0.282, 0.7, 0.02], { bone: hips });

  // ---------- apron ----------
  const A = P.leather;
  // skirt
  put(box(0.4, 0.38, 0.012), A, [0, 0.49, 0.248], { bone: hips });
  put(box(0.016, 0.38, 0.006), P.leatherDark, [0.192, 0.49, 0.256], { bone: hips });
  put(box(0.016, 0.38, 0.006), P.leatherDark, [-0.192, 0.49, 0.256], { bone: hips });
  put(box(0.4, 0.016, 0.006), P.leatherDark, [0, 0.31, 0.256], { bone: hips });
  for (let i = 0; i < 12; i++) {
    const y = 0.33 + i * 0.03;
    put(box(0.004, 0.012, 0.004), P.leatherLight, [0.176, y + 0.01, 0.258], { bone: hips });
    put(box(0.004, 0.012, 0.004), P.leatherLight, [-0.176, y + 0.01, 0.258], { bone: hips });
  }
  for (let i = 0; i < 11; i++)
    put(box(0.012, 0.004, 0.004), P.leatherLight, [-0.165 + i * 0.033, 0.33, 0.258], { bone: hips });
  // bib
  put(box(0.3, 0.42, 0.012), A, [0, 0.9, 0.236], { rotation: [-5, 0, 0] });
  put(box(0.2, 0.06, 0.012), A, [0, 1.12, bibZ(1.12)], { rotation: [-5, 0, 0] });
  put(box(0.01, 0.42, 0.006), P.leatherDark, [0.152, 0.9, 0.243], { rotation: [-5, 0, 0] });
  put(box(0.01, 0.42, 0.006), P.leatherDark, [-0.152, 0.9, 0.243], { rotation: [-5, 0, 0] });
  for (const s of [1, -1]) {
    rivet([s * 0.115, 1.14, bibZ(1.14) + 0.008], chest, P.steel, 0.011);
    rivet([s * 0.135, 0.76, bibZ(0.76) + 0.008], chest, P.steel, 0.01);
  }
  // pocket
  put(box(0.13, 0.11, 0.012), P.leatherDark, [0.09, 0.5, 0.262], { bone: hips });
  put(box(0.13, 0.02, 0.014), P.leatherLight, [0.09, 0.548, 0.264], { bone: hips });
  for (const x of [0.03, 0.15]) rivet([x, 0.545, 0.273], hips, P.steel, 0.009);
  for (const x of [0.03, 0.15]) rivet([x, 0.46, 0.269], hips, P.steel, 0.008);
  // soot smudges & scorch
  const soot: [number, number, number, number, number, any][] = [
    [-0.08, 0.4, 0.05, 0.03, 0.262, hips],
    [0.13, 0.36, 0.035, 0.022, 0.262, hips],
    [-0.14, 0.52, 0.03, 0.04, 0.263, hips],
    [0.02, 0.62, 0.04, 0.02, 0.263, hips],
    [-0.05, 0.84, 0.045, 0.03, bibZ(0.84) + 0.009, chest],
    [0.07, 0.96, 0.03, 0.025, bibZ(0.96) + 0.009, chest],
  ];
  for (const [x, y, w, h, z, bn] of soot)
    put(ball(1, 6, 4), P.ink, [x, y, z], { bone: bn, scale: [w, h, 0.002] });
  for (let i = 0; i < 4; i++)
    put(ball(1, 5, 3), P.leatherDark, [-0.12 + R() * 0.24, 0.35 + R() * 0.2, 0.263], {
      bone: hips,
      scale: [0.012 + R() * 0.015, 0.008 + R() * 0.01, 0.002],
    });
  // tool roll hanging at belt
  put(box(0.07, 0.11, 0.03), P.leatherLight, [-0.19, 0.6, 0.265], { bone: hips });
  put(box(0.074, 0.012, 0.034), P.leatherDark, [-0.19, 0.635, 0.265], { bone: hips });
  put(box(0.074, 0.012, 0.034), P.leatherDark, [-0.19, 0.575, 0.265], { bone: hips });
  put(cyl(6), P.steelDark, [-0.17, 0.545, 0.268], { bone: hips, scale: [0.005, 0.04, 0.005] });
  put(cyl(6), P.wood, [-0.19, 0.545, 0.268], { bone: hips, scale: [0.006, 0.04, 0.006] });
  put(cyl(6), P.steel, [-0.21, 0.545, 0.268], { bone: hips, scale: [0.004, 0.04, 0.004] });

  // ---------- cross straps ----------
  const strap = (pts: number[][], r = 0.017, color = P.leatherDark, bone: any = chest) => {
    for (let i = 0; i < pts.length - 1; i++) {
      b.rod(pts[i], pts[i + 1], r, color, { bone, sides: 4 });
    }
  };
  for (const s of [1, -1]) {
    strap([
      [s * 0.12, 1.12, 0.214],
      [s * 0.14, 1.21, 0.15],
      [s * 0.16, 1.225, 0.0],
      [s * 0.15, 1.19, -0.13],
      [s * 0.1, 0.92, -0.22],
    ]);
    rivet([s * 0.125, 1.135, 0.21], chest, P.gold, 0.01);
  }
  // chest strap medallion with rune
  put(cyl(10), P.gold, [0.0, 1.05, 0.215], { rotation: [90, 0, 0], scale: [0.036, 0.012, 0.036] });
  put(cyl(10), P.steelDark, [0.0, 1.05, 0.222], { rotation: [90, 0, 0], scale: [0.026, 0.006, 0.026] });
  glow(b.part(runeGeo(0.032), P.runeBlue, { bone: chest, at: [0, 1.05, 0.228], dir: [0, 0, 1], axis: "z", up: [0, 1, 0] }), 1.6);
  strap([[-0.12, 1.07, 0.218], [0.0, 1.05, 0.218], [0.12, 1.07, 0.218]], 0.012, P.leatherDark);

  // ---------- backpack / bedroll ----------
  put(box(0.38, 0.34, 0.05), P.leather, [0, 0.9, -0.248]);
  put(box(0.3, 0.12, 0.05), P.leatherLight, [0, 0.99, -0.275]);
  put(box(0.34, 0.012, 0.054), P.leatherDark, [0, 0.9, -0.25]);
  put(box(0.018, 0.34, 0.056), P.leatherDark, [0.12, 0.9, -0.25]);
  put(box(0.018, 0.34, 0.056), P.leatherDark, [-0.12, 0.9, -0.25]);
  put(cyl(10), P.leatherLight, [0, 1.13, -0.215], { rotation: [0, 0, 90], scale: [0.058, 0.46, 0.058] });
  for (const x of [-0.14, 0.14]) {
    put(cyl(10), P.leatherDark, [x, 1.13, -0.215], { rotation: [0, 0, 90], scale: [0.062, 0.025, 0.062] });
    put(box(0.02, 0.026, 0.004), P.gold, [x, 1.13, -0.28]);
  }
  for (const x of [-0.225, 0.225]) put(cyl(10), P.leatherDark, [x, 1.13, -0.215], { rotation: [0, 0, 90], scale: [0.045, 0.005, 0.045] });
  put(box(0.1, 0.07, 0.03), P.leatherDark, [0, 0.78, -0.265]);
  rivet([0, 0.78, -0.282], chest, P.gold, 0.01);

  // ---------- pauldrons ----------
  const radii = [0.155, 0.125, 0.095];
  const ys = [1.04, 1.085, 1.13];
  for (const s of [1, -1]) {
    const cx = s * 0.37;
    const cz = 0.02;
    // dark underskirt
    put(cyl(12), P.steelDark, [cx, 1.03, cz], { scale: [0.155, 0.02, 0.15] });
    radii.forEach((r, i) => {
      const y = ys[i];
      put(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), i === 1 ? P.steelDark : P.steel, [cx, y, cz], {
        scale: [r, r * 0.55, r * 0.95],
        flat: true,
      });
      put(torus(r * 0.99, 0.011, 14), P.gold, [cx, y + 0.002, cz], { rotation: [90, 0, 0], scale: [1, 0.95, 1] });
      put(torus(r * 0.93, 0.005, 14), P.steelLight, [cx, y + 0.012, cz], { rotation: [90, 0, 0], scale: [1, 0.95, 1] });
    });
    // rivet row on the lowest plate
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * 0.2 + (i / 8) * Math.PI * 1.4 + (s < 0 ? Math.PI * 0 : 0);
      const th = a;
      rivet([cx + Math.sin(th) * 0.135 * s, 1.062, cz + Math.cos(th) * 0.128], chest, P.gold, 0.008);
    }
    for (let i = 0; i < 6; i++) {
      const th = -0.4 + (i / 5) * 1.9;
      rivet([cx + Math.sin(th) * 0.082 * s, 1.15, cz + Math.cos(th) * 0.078], chest, P.goldDark, 0.007);
    }
    // spike
    put(torus(0.03, 0.01, 8), P.gold, [cx, 1.183, cz], { rotation: [90, 0, 0] });
    put(new THREE.ConeGeometry(0.03, 0.13, 6), P.steelLight, [cx, 1.24, cz], { flat: true });
    // rune on mid-plate shoulder front
    const nrm = [s * 0.5, 0.65, 0.6];
    rune([cx + s * 0.125 * 0.8 * 0.55, 1.085 + 0.07 * 0.55 + 0.012, cz + 0.125 * 0.8 * 0.83 + 0.0], nrm, 0.04, chest, 0.03);
  }

  // ---------- shoulder-top steel hint at the neck: gorget plates ----------
  for (const s of [1, -1])
    put(box(0.07, 0.02, 0.05), P.steelDark, [s * 0.17, 1.2, 0.0], { rotation: [0, 0, s * -20] });

  void M;
}
```

<!-- call: headBeard -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildHeadBeard({ b, J, P }: any) {
  const H = J.head;
  const mk = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: H, at, ...o });
  const ell = (color: string, at: number[], sc: number[], o: any = {}, w = 10, h = 7) =>
    mk(new THREE.SphereGeometry(1, w, h), color, at, { scale: sc, flat: true, ...o });
  const box = (color: string, at: number[], sz: number[], o: any = {}) =>
    mk(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, at, o);

  // ---- neck
  b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.15, 10), P.skinShade, { bone: J.neck, at: [0, 1.19, 0.04], flat: true });

  // ---- head (upper)
  ell(P.skin, [0, 1.36, 0.08], [0.17, 0.15, 0.15], {}, 14, 10);
  for (const s of [1, -1]) {
    ell(P.skin, [s * 0.1, 1.31, 0.16], [0.055, 0.05, 0.05]); // cheekbones
    ell(P.skinShade, [s * 0.105, 1.295, 0.19], [0.03, 0.02, 0.012]); // flush
    box(P.skin, [s * 0.06, 1.41, 0.2], [0.075, 0.03, 0.05], { rotation: [0, 0, -s * 8] }); // brow ridge
    // ears
    ell(P.skin, [s * 0.175, 1.33, 0.07], [0.022, 0.04, 0.036]);
    ell(P.skinShade, [s * 0.19, 1.33, 0.07], [0.008, 0.026, 0.022]);
    // sideburns
    ell(P.beardDark, [s * 0.158, 1.29, 0.1], [0.03, 0.085, 0.07]);
    ell(P.beard, [s * 0.14, 1.19, 0.18], [0.05, 0.08, 0.07]);
    // eyes
    const ex = s * 0.075;
    ell(P.ink, [ex, 1.37, 0.205], [0.037, 0.034, 0.02], {}, 10, 6);
    ell(P.eyeWhite, [ex, 1.37, 0.214], [0.031, 0.028, 0.014], {}, 10, 6);
    ell(P.iris, [ex, 1.368, 0.222], [0.019, 0.019, 0.01], {}, 8, 6);
    ell(P.ink, [ex, 1.368, 0.229], [0.009, 0.01, 0.006], {}, 6, 4);
    ell(P.eyeWhite, [ex + s * 0.006, 1.376, 0.231], [0.0045, 0.0045, 0.003], {}, 5, 4);
    // brows: 4 broad layered blades
    const cols = [P.beardDark, P.beard, P.beardHi, P.beard];
    const angs = [30, 12, -4, -18];
    for (let i = 0; i < 4; i++) {
      const L = 0.1 - i * 0.008;
      const w = 0.026 - i * 0.003;
      const a = (angs[i] * Math.PI) / 180;
      const outline: any = [
        [0, -w / 2],
        [L * 0.6, -w * 0.4],
        [L, 0, "sharp"],
        [L * 0.6, w * 0.5],
        [0, w / 2],
      ];
      b.extrude(outline, {
        at: [s * 0.012, 1.425 - i * 0.006, 0.212 + i * 0.002],
        x: [s * Math.cos(a), Math.sin(a), 0],
        y: [-s * Math.sin(a), Math.cos(a), 0],
        thickness: 0.026,
        color: cols[i],
        bone: H,
      });
    }
  }
  // nose
  ell(P.skin, [0, 1.31, 0.25], [0.045, 0.045, 0.045], {}, 10, 8);
  ell(P.skinShade, [0, 1.29, 0.247], [0.042, 0.025, 0.04]);
  for (const s of [1, -1]) ell(P.skinShade, [s * 0.032, 1.298, 0.255], [0.02, 0.022, 0.02]);

  // ---- jaw
  const JB = J.jaw;
  b.part(new THREE.SphereGeometry(1, 12, 7), P.skin, { bone: JB, at: [0, 1.245, 0.1], scale: [0.14, 0.055, 0.125], flat: true });
  b.part(new THREE.SphereGeometry(1, 8, 6), P.skin, { bone: JB, at: [0, 1.225, 0.19], scale: [0.06, 0.04, 0.04], flat: true });
  b.part(new THREE.BoxGeometry(0.095, 0.007, 0.012), P.ink, { bone: JB, at: [0, 1.236, 0.222], flat: true });
  b.part(new THREE.BoxGeometry(0.06, 0.008, 0.01), P.skinShade, { bone: JB, at: [0, 1.226, 0.222], flat: true });

  // ---- helm
  const capC = [0, 1.44, 0.07];
  mk(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, capC, { scale: [0.18, 0.1, 0.18], flat: true });
  mk(new THREE.CylinderGeometry(0.19, 0.19, 0.035, 16, 1, true), P.steelDark, [0, 1.445, 0.07], { scale: [1, 1, 0.97], flat: true });
  mk(new THREE.TorusGeometry(0.19, 0.008, 5, 18), P.steelLight, [0, 1.428, 0.07], { rotation: [90, 0, 0], scale: [1, 0.97, 1] });
  mk(new THREE.TorusGeometry(0.19, 0.008, 5, 18), P.steelLight, [0, 1.462, 0.07], { rotation: [90, 0, 0], scale: [1, 0.97, 1] });
  for (let a = -150; a <= 150; a += 30) {
    const r = (a * Math.PI) / 180;
    ell(P.gold, [0.192 * Math.sin(r), 1.445, 0.07 + 0.188 * Math.cos(r)], [0.009, 0.009, 0.009], {}, 6, 4);
  }
  b.sweep(
    catmull([
      [0, 1.462, 0.255],
      [0, 1.526, 0.2],
      [0, 1.55, 0.07],
      [0, 1.526, -0.055],
      [0, 1.465, -0.112],
    ]),
    0.013,
    { bone: H, color: P.gold, sides: 6 },
  );
  // steel plate trim at the back
  box(P.steelDark, [0, 1.43, -0.108], [0.2, 0.03, 0.012]);
  for (const s of [1, -1]) {
    // cheek flaps
    box(P.steel, [s * 0.185, 1.395, 0.08], [0.02, 0.09, 0.13], { rotation: [0, 0, -s * 4] });
    box(P.steelDark, [s * 0.196, 1.395, 0.08], [0.006, 0.098, 0.138]);
    box(P.steelLight, [s * 0.197, 1.35, 0.08], [0.007, 0.01, 0.13]);
    for (const z of [0.03, 0.12]) ell(P.gold, [s * 0.2, 1.4, z], [0.008, 0.008, 0.008], {}, 6, 4);
    // horns
    const horn = b.sweep(
      catmull([
        [s * 0.17, 1.47, 0.06],
        [s * 0.25, 1.5, 0.05],
        [s * 0.29, 1.57, 0.04],
        [s * 0.26, 1.65, 0.04],
      ]),
      [0.045, 0.006],
      { bone: H, color: P.steel, bands: [[0.5, P.steelLight], [1, P.steel]], sides: 7 },
    );
    for (const t of [0.12, 0.3]) {
      const p = horn.at(t);
      b.part(new THREE.TorusGeometry(0.046 * (1 - t * 0.9), 0.01, 5, 10), P.gold, { bone: H, at: p.at, dir: p.tangent, axis: "z" });
    }
  }
  // back hair tuft
  ell(P.beardDark, [0, 1.35, -0.1], [0.11, 0.075, 0.045]);
  for (let i = -2; i <= 2; i++)
    mk(new THREE.ConeGeometry(0.03, 0.12, 5), i % 2 ? P.beard : P.beardDark, [i * 0.04, 1.27 - Math.abs(i) * 0.012, -0.115], { rotation: [180, 0, 0], flat: true });

  // ---- beard core
  ell(P.beardDark, [0, 1.1, 0.27], [0.17, 0.1, 0.1], {}, 12, 8);
  ell(P.beard, [0, 0.98, 0.28], [0.165, 0.15, 0.1], {}, 12, 8);
  mk(new THREE.ConeGeometry(0.15, 0.2, 8), P.beard, [0, 0.92, 0.28], { rotation: [180, 0, 0], scale: [1, 1, 0.67], flat: true });
  for (const s of [1, -1]) ell(P.beard, [s * 0.12, 1.12, 0.2], [0.07, 0.09, 0.08]);

  // blades (3 segments root→tip)
  const segCols = [P.beardDark, P.beard, P.beardHi];
  const blade = (x: number, top: number, len: number, z: number, w: number) => {
    const fr = [0.0, 0.36, 0.7];
    const ws = [w, w * 0.95, w * 0.7, 0];
    for (let i = 0; i < 3; i++) {
      const l = len * (i === 2 ? 0.3 : 0.36);
      const outline: any = [
        [-ws[i], 0],
        [ws[i], 0],
        [ws[i + 1], l],
        [-ws[i + 1], l],
      ];
      b.extrude(outline, {
        at: [x, top - len * fr[i], z + i * 0.003],
        x: [1, 0, 0],
        y: [0, -1, 0.08],
        thickness: 0.028,
        color: segCols[i],
        bone: H,
      });
    }
  };
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.045;
    const ax = Math.abs(x);
    blade(x, 1.17 - ax * 0.25, 0.35 - ax * 0.9, 0.366 - ax * 0.4, 0.03);
  }
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.047;
    blade(x, 1.0, 0.2 - Math.abs(x) * 0.5, 0.37 - Math.abs(x) * 0.4, 0.028);
  }

  // ---- side braids
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const c = [P.beardDark, P.beard, P.beardHi][i % 3];
      ell(c, [s * 0.19, 1.2 - 0.05 * i, 0.2 + i * 0.012], [0.042, 0.03, 0.04], { rotation: [0, 0, i % 2 ? 25 : -25] }, 8, 6);
    }
    for (const i of [2, 5]) mk(new THREE.TorusGeometry(0.036, 0.01, 5, 10), P.gold, [s * 0.19, 1.2 - 0.05 * i - 0.025, 0.2 + i * 0.012 + 0.006], { rotation: [90, 0, 0] });
    ell(P.goldDark, [s * 0.19, 0.88, 0.285], [0.02, 0.02, 0.02], {}, 6, 5);
    mk(new THREE.ConeGeometry(0.03, 0.06, 6), P.beardHi, [s * 0.19, 0.84, 0.285], { rotation: [180, 0, 0], flat: true });
  }

  // ---- mustache
  for (const s of [1, -1]) {
    const pts = [
      [0, 1.268, 0.285],
      [s * 0.07, 1.258, 0.296],
      [s * 0.13, 1.243, 0.29],
      [s * 0.17, 1.256, 0.285],
      [s * 0.155, 1.278, 0.28],
    ];
    b.sweep(catmull(pts), [0.028, 0.012], { bone: H, color: P.beard, bands: [[0.35, P.beardDark], [0.75, P.beard], [1, P.beardHi]], sides: 7 });
    mk(new THREE.TorusGeometry(0.014, 0.005, 4, 8), P.gold, [s * 0.16, 1.268, 0.283], { rotation: [0, 0, 0] });
    ell(P.goldDark, [s * 0.15, 1.283, 0.278], [0.009, 0.009, 0.009], {}, 5, 4);
  }
}
```