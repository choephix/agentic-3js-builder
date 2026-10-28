<!-- call: plan -->

```json
{
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stout Warcraft-style dwarf smith with a huge braided red beard and horned iron helm. He stands behind a stump-mounted anvil with a raised hammer in his right fist and tongs holding a glowing ingot in his left.",
  "builderName": "dwarfBlacksmith",
  "size": [1.4, 1.6, 1.2],
  "layout": "Scale: the dwarf is 1.5 m to the helm top (horn tips 1.6 m), standing at x=0, z≈0 and facing +Z toward the anvil. Warcraft proportions: oversized head (~0.3 m wide with helm), massive pauldrons, thick forearms, fist-sized hands and big boots on short legs. His feet are planted at x=±0.15 with toes forward. The torso is barrel-shaped: shoulders ±0.30 at y≈1.08, belly front surface at z≈0.26 around y 0.8, chest front at z≈0.20 at y 1.0, and the back at z≈-0.2. The huge braided beard hangs from the chin (y 1.28) down to y≈0.75 in front of the chest, its front reaching z≈0.38. Below it a blue-trimmed leather apron covers the belly and thighs to y 0.30. Arms are bent forward in an A-pose: upper arms angle down and out from the shoulders to elbows at (±0.51,0.84,0), and forearms point almost straight forward to wrists at (±0.52,0.73,0.31), so both hands reach out toward the anvil. The right (-X) fist grips a warhammer-style smithing hammer, held raised diagonally up-forward with its head hovering about 10 cm above the anvil face. The left (+X) fist holds long tongs angled forward and slightly up, gripping a glowing orange ingot that lies on the anvil face. The anvil (long axis along X, face centred at z=0.68, top y=0.80, horn pointing to the dwarf's left +X) stands on a chunky tree-stump (y 0 to 0.38) with iron hoops. A few embers float above the ingot. Style: Blizzard/Warcraft. Chunky, exaggerated, faceted low-poly shapes (6-8 sided cylinders, boxes with bevelled edges). Every metal edge has a bronze or gold trim part, with rivets and studs as separate small parts. Colour contrast is warm (red-orange hair, ruddy skin, bronze and gold) against cool steel and Ironforge blue cloth. The ingot, embers and the eyes' small catch-lights are the only glowing/bright parts (use the glow kit on ingot, embers and ingot-lit rivets).",
  "palette": {
    "skin": "#d99a73",
    "skinShade": "#b9704f",
    "noseRed": "#c9604a",
    "beard": "#c8601a",
    "beardDark": "#8a3a12",
    "beardLight": "#e48a2c",
    "eyeBlue": "#3a7fd0",
    "eyeWhite": "#f4efe4",
    "ink": "#1d1410",
    "ironDark": "#3a3f4c",
    "iron": "#6a7384",
    "ironLight": "#a9b4c6",
    "bronze": "#b8843a",
    "gold": "#e8b83a",
    "leather": "#6b4026",
    "leatherDark": "#432616",
    "leatherLight": "#8f5a30",
    "clothBlue": "#2d5f9c",
    "clothDark": "#1f4170",
    "teeth": "#efe6cc",
    "fireOrange": "#ff7a1a",
    "fireHot": "#ffd24a",
    "wood": "#7a5232",
    "woodDark": "#4e3220"
  },
  "mounts": {
    "hipsCenter": [0, 0.66, 0],
    "beltLine": [0, 0.7, 0.0],
    "neckBase": [0, 1.2, 0.03],
    "headCenter": [0, 1.38, 0.05],
    "chinPoint": [0, 1.28, 0.17],
    "beardRoot": [0, 1.3, 0.16],
    "shoulderL": [0.34, 1.08, 0],
    "shoulderR": [-0.34, 1.08, 0],
    "pauldronL": [0.41, 1.14, 0],
    "pauldronR": [-0.41, 1.14, 0],
    "elbowL": [0.51, 0.84, 0],
    "elbowR": [-0.51, 0.84, 0],
    "wristL": [0.5, 0.72, 0.3],
    "wristR": [-0.54, 0.74, 0.32],
    "gripHammer": [-0.54, 0.76, 0.34],
    "hammerDir": [0.3, 0.45, 0.84],
    "hammerHead": [-0.39, 0.985, 0.76],
    "gripTongs": [0.5, 0.72, 0.34],
    "tongsTip": [0.28, 0.82, 0.72],
    "ingotCenter": [0.24, 0.822, 0.8],
    "ingotAxis": [-0.45, 0, 0.89],
    "anvilTop": [0, 0.8, 0.68],
    "stumpCenter": [0, 0, 0.68],
    "footL": [0.15, 0, 0.06],
    "footR": [-0.15, 0, 0.06]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.66, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 0.78, 0], "dir": [0, 1, 0.05], "role": "spine" },
    { "name": "chest", "parent": "spine", "at": [0, 0.96, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.2, 0.03], "dir": [0, 1, 0.25], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.28, 0.05], "dir": [0, 1, 0], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.32, 0.0], "dir": [0, -0.2, 1], "role": "jaw", "group": "head" },

    { "name": "hipL", "parent": "hips", "at": [0.15, 0.62, 0], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.15, 0.34, 0.04], "dir": [0, -1, -0.15], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.15, 0.1, 0], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeL", "parent": "ankleL", "at": [0.15, 0.04, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.15, 0.62, 0], "dir": [0, -1, 0.1], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.15, 0.34, 0.04], "dir": [0, -1, -0.15], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.15, 0.1, 0], "dir": [0, -0.3, 1], "role": "leg", "group": "legs" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.15, 0.04, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "shoulderL", "parent": "chest", "at": [0.34, 1.08, 0], "dir": [0.55, -0.83, 0], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.51, 0.84, 0], "dir": [0, -0.37, 0.93], "role": "arm", "group": "arms" },
    { "name": "wristL", "parent": "elbowL", "at": [0.5, 0.72, 0.3], "dir": [0, -0.2, 1], "role": "arm", "group": "arms" },
    { "name": "fingersL", "parent": "wristL", "at": [0.5, 0.72, 0.34], "dir": [0, -0.2, 1], "role": "digit", "group": "arms" },
    { "name": "thumbL", "parent": "wristL", "at": [0.46, 0.74, 0.32], "dir": [-0.2, 0, 1], "role": "digit", "group": "arms" },

    { "name": "shoulderR", "parent": "chest", "at": [-0.34, 1.08, 0], "dir": [-0.55, -0.83, 0], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.51, 0.84, 0], "dir": [0, -0.3, 0.95], "role": "arm", "group": "arms" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.54, 0.74, 0.32], "dir": [0, 0, 1], "role": "arm", "group": "arms" },
    { "name": "fingersR", "parent": "wristR", "at": [-0.54, 0.74, 0.36], "dir": [0, 0, 1], "role": "digit", "group": "arms" },
    { "name": "thumbR", "parent": "wristR", "at": [-0.5, 0.76, 0.34], "dir": [0.2, 0, 1], "role": "digit", "group": "arms" }
  ],
  "parts": [
    {
      "id": "lowerBody",
      "builds": "Pelvis and short, thick legs, with the skeleton chains hipL/kneeL/ankleL/toeL and the same on R. Legs are wide tapered sweeps in clothDark trousers with leather knee pads (leatherLight, studded with bronze). Big chunky boots in leather with ironDark toe caps, iron-shod soles (a thin ironDark slab under each boot), bronze buckles and a folded cuff at y≈0.30. The belt is a thick leatherDark band round the hips at y 0.70 with a big gold buckle plate (a square with a bronze centre boss), small bronze studs, a small pouch (leather), a hung spare hammer and a ring of keys or tools (iron). The lower leather apron skirt (leather body, leatherDark stitching strips, bronze rivets along the edges, a blue clothBlue hem stripe) hangs from the belt to y≈0.30 in front (front surface z≈0.28), and a darker back flap. The apron has scorch marks as small ink-coloured patches. Boots are 0.26 long (heel z≈-0.07, toe z≈0.26) and 0.14 wide, resting on y=0.",
      "box": [[-0.3, 0, -0.2], [0.3, 0.72, 0.32]],
      "attaches": "The hips/hipL/hipR joints are at hipsCenter; the belt sits at beltLine, where the upperBody torso's bottom meets it. The apron bib (upperBody) overlaps the apron's top edge at y≈0.72. Boots sit at footL and footR on y=0.",
      "joints": ["hips", "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "upperBody",
      "builds": "Barrel torso (a loft/sweep over hips-spine-chest, 0.30 half-width at the shoulders, belly bulging to z≈0.26 at y 0.8, from y 0.62 to 1.22), a thick short neck (skin) from neckBase, and a clothBlue sleeveless tunic/jerkin with a darker clothDark trim at the collar and around the arm holes. Over it goes a leather chest harness: crossed leatherDark straps with iron buckles, a leather apron bib (leather, with a bronze rivet border and a small gold anvil emblem) from y 1.05 down to the belt at z≈0.26. Huge Warcraft pauldrons on pauldronL/R: layered domed iron plates (ironDark, with iron plates and ironLight rim edges), each with a bronze trim ring and three bronze spikes or studs, plus a short leather strap. A leather-wrapped tool roll or small backpack (leather, leatherDark straps) on the back at z≈-0.28. A gold-rimmed iron gorget ring at the neck base is optional.",
      "box": [[-0.58, 0.6, -0.3], [0.58, 1.26, 0.3]],
      "attaches": "The bottom meets the belt at beltLine; the neck top meets the head part at neckBase/headCenter below the beard. Pauldrons wrap the shoulderL/R joints at pauldronL/R. The arms part's upper arms begin inside the pauldrons at shoulderL/R. The beard (head part) hangs in front of the bib and covers it down to y≈0.75.",
      "joints": ["spine", "chest", "neck"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "headBeard",
      "builds": "The head is the hero feature. The skull is a broad box-like shape with a heavy brow, at headCenter (about 0.30 wide, 0.30 high), in ruddy skin. The face is built first: two small deep-set eyes (eyeWhite with eyeBlue iris and ink pupil, with a tiny white catch-light) under thick beardDark bushy brow ridges that slope in an angry scowl. A big round bulbous nose in noseRed with a skinShade underside and two nostril dots, plus cheekbones and rosy cheeks. Pointed ears out the sides. A separate lower jaw on the jaw joint, with a heavy chin and lower teeth (teeth), and an upper lip with two upper teeth under the moustache so the mouth can open. The upper head rides head. Nothing sits in front of the face except the moustache. The iron helm sits on top: a ironDark half-dome cap with an iron brow band, bronze trim rim, gold rivets, a nose-free open face, a short central ridge or crest (iron), and two curved ironLight/bone-coloured horns (teeth colour) sweeping out and up from the sides, with bronze bases. The huge beard has a solid beard-coloured mass from the cheeks and chin down to y≈0.75 and out to z≈0.38, with layered overlapping blade-like locks in beard, beardLight (tips) and beardDark (roots/underside). On it hang two thick braids on each side of the centre, bound with gold rings and bronze clasps, ending in tassel points. A sweeping moustache in beard with curled braided ends at the cheeks. Sideburns blend into the beard and from under the helm back to a short ponytail behind the head (beard colours, with a gold tie).",
      "box": [[-0.26, 0.72, -0.2], [0.26, 1.62, 0.4]],
      "attaches": "The head base sits on the neck top at neckBase (y≈1.2) with the joints head and jaw. The beard root begins at beardRoot and chinPoint and hangs over the upperBody bib and chest, staying within z≤0.38. The ponytail hangs behind at z≈-0.2.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "arms",
      "builds": "Both bare muscular arms, built as chains (shoulderL/elbowL/wristL with fingersL/thumbL and the same on R) with sweeps for skin that bend at the joints. The upper arms are thick (radius ≈0.075 at the shoulder, bulging biceps), the forearms thicker still (≈0.075-0.085), with a ring of short beardDark arm hair tufts. Each forearm wears a leather bracer (a sleeve of leather with leatherDark straps, bronze studs and a bronze/gold buckle) from just before the wrist to mid-forearm. Left wrist: a thin gold band. The hands are big blocky fists in skin: a palm block, four chunky finger segments on each hand curled to grip (the right fist wraps the hammer handle at gripHammer along hammerDir; the left fist wraps the tongs handle at gripTongs, aimed along the direction toward tongsTip), plus a thumb on thumbL/thumbR. Knuckle bumps and skinShade fingernails or creases; a soot-dark ink smudge patch on the forearms.",
      "box": [[-0.64, 0.6, -0.08], [0.64, 1.1, 0.44]],
      "attaches": "Upper arms begin inside the pauldrons at shoulderL/R (upperBody); elbows are at elbowL/R and wrists at wristL/R. The right fist closes around the hammer handle at gripHammer; the left fist closes around the tongs at gripTongs (both are built by the props part and the fists build to the same mounts).",
      "joints": ["shoulderL", "elbowL", "wristL", "fingersL", "thumbL", "shoulderR", "elbowR", "wristR", "fingersR", "thumbR"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "smithingTools",
      "builds": "The smith's hand tools, static (no joints). The warhammer: a woodDark/wood handle (octagonal) running from a pommel at gripHammer - 0.12 along hammerDir up to hammerHead (0.62 long total), with leatherDark grip wrap bands at the fist and a leather wrist strap loop. Its head is a heavy iron block (0.26 long across, 0.13 high, 0.13 deep) at hammerHead with its long axis roughly along world X and perpendicular to the handle. It has an ironLight bright striking face on the +X end and a pein (tapered wedge) at the other end, bronze collar bands where the handle enters, and gold rivets. The tongs: two long iron arms (ironDark, with ironLight highlight edges) crossing at a bronze rivet pivot, with leather-wrapped handles at gripTongs and flat gripping jaws at tongsTip. They are 0.5 long from gripTongs to tongsTip, along the direction (tongsTip - gripTongs). The glowing hot ingot is a flat rectangular bar (0.20 long × 0.05 wide × 0.04 thick, centred at ingotCenter along ingotAxis, resting on the anvil face) made from fireOrange body with a fireHot core strip, and an ember-red dark end where the jaws grip it. The ingot and its small bright elements use the glow kit (strength 1.2-1.6). About 10 spark and ember particles are small diamond/sphere parts (fireHot and fireOrange) floating around 0.82-1.15 m above the anvil near the ingot (x 0.0-0.45, z 0.65-0.9), each glowing, some elongated like streaks.",
      "box": [[-0.62, 0.68, 0.2], [0.58, 1.18, 0.9]],
      "attaches": "The hammer handle passes through the right fist at gripHammer, its head hovering above the anvilTop face (~10 cm gap). The tongs run from the left fist at gripTongs to the ingot at ingotCenter, with the jaws at tongsTip. The ingot rests on the anvil face at anvilTop (y=0.80).",
      "joints": [],
      "floor": false,
      "budget": 110
    },
    {
      "id": "anvilStump",
      "builds": "A heavy blacksmith's anvil on a tree stump, all static. The stump is a chunky 8-sided wood cylinder (wood body with woodDark bark ridges and vertical grooves, radius 0.30, from y=0 to 0.38, centred at stumpCenter) with root flares at the base and a pale top ring pattern (woodDark growth rings and a lighter wood centre inside the top). Two iron hoops (ironDark with ironLight edges, and rivets) wrap the stump at y≈0.08 and 0.30, and there are axe-nick wedge cuts. On it is the anvil, long axis along X: a wide flat foot base (ironDark, 0.5 long × 0.28 deep, y 0.38-0.46), a tapered waist (ironDark) and the face plate on top (iron slab, top at y=0.80, spanning x -0.42 to 0.42, z 0.53 to 0.83), with an ironLight polished top surface strip and bright edges. A long conical horn (iron with an ironDark underside) points to the dwarf's left (+X), curving gently up to a tip at x≈0.68. On the heel (-X side) there is a stepped cutting table, a square hardy hole and a round pritchel hole in ink colour on the face top. Bronze or gold decorative trim bands run along the waist, with a small gold rune or Ironforge emblem on the side facing the viewer (+Z), plus dents and scorch spots (ink) on the top face and an iron chain or pouch hanging from the stump (optional).",
      "box": [[-0.42, 0, 0.38], [0.7, 0.82, 0.98]],
      "attaches": "The anvil top face is at the anvilTop mount (y 0.80, z 0.68) for the hammer, tongs and hot ingot to rest above it. The stump rests on y=0, centred at stumpCenter (z=0.68), in front of the dwarf's boots (which reach z≈0.26).",
      "joints": [],
      "floor": true,
      "budget": 130
    }
  ]
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: any) {
  const rnd = rng(11);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const SOOT = P.ink;
  const GOLD = P.gold;
  const BRONZE = P.bronze;

  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = J["shoulder" + L];
    const el = J["elbow" + L];
    const wr = J["wrist" + L];
    const fing = J["fingers" + L];
    const thumb = J["thumb" + L];
    const shP = V([s * 0.34, 1.08, 0]);
    const elP = V([s * 0.51, 0.84, 0]);
    const wrP = V(s > 0 ? M.wristL : M.wristR);

    // upper arm and forearm
    b.capsule(shP, elP, [0.078, 0.07], P.skin, { bone: sh, sides: 8 });
    const bi = shP.clone().lerp(elP, 0.4).add(new THREE.Vector3(0, 0.03, 0.03));
    b.part(sph(0.075, 8, 6), P.skin, { bone: sh, at: bi });
    b.part(sph(0.075, 8, 6), P.skin, { bone: el, at: elP });
    b.capsule(elP, wrP, [0.085, 0.07], P.skin, { bone: el, sides: 8 });

    // soot smudge
    const sm = elP.clone().lerp(wrP, 0.35).add(new THREE.Vector3(s * 0.02, 0.07, 0.0));
    b.part(sph(0.035, 6, 4), SOOT, { bone: el, at: sm, scale: [1.2, 0.4, 1.4] });

    // hair tufts ring
    for (let i = 0; i < 8; i++) {
      const t = 0.15 + 0.1 * (i % 3);
      const c = elP.clone().lerp(wrP, t);
      const a = (i / 8) * Math.PI * 2;
      const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(0.08);
      b.spike(c.clone().add(d), d.clone().normalize(), 0.035, 0.012, P.beardDark, { bone: el, sides: 4 });
    }

    // bracer
    const b0 = elP.clone().lerp(wrP, 0.45);
    const b1 = elP.clone().lerp(wrP, 0.92);
    b.rod(b0, b1, [0.09, 0.077], P.leather, { bone: el, sides: 8 });
    for (const t of [0.0, 1.0]) {
      const c = b0.clone().lerp(b1, t);
      b.rod(c, c.clone().add(new THREE.Vector3(0, 0, t ? -0.012 : 0.012)), 0.09 - 0.012 * t, P.leatherDark, { bone: el, sides: 8 });
    }
    const mid = b0.clone().lerp(b1, 0.5);
    b.part(new THREE.BoxGeometry(0.04, 0.012, 0.035), GOLD, { bone: el, at: mid.clone().add(new THREE.Vector3(0, 0.083, 0)) });
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * (0.3 + 0.4 * (i / 3)) + (s > 0 ? 0 : 0);
      const c = b0.clone().lerp(b1, 0.2 + i * 0.2);
      b.part(sph(0.01, 5, 4), BRONZE, { bone: el, at: c.add(new THREE.Vector3(0, 0.082, 0)) });
    }
    if (s > 0) {
      const c = wrP.clone().add(new THREE.Vector3(0, 0, 0.005));
      b.rod(c.clone().add(new THREE.Vector3(0, 0, -0.01)), c.clone().add(new THREE.Vector3(0, 0, 0.01)), 0.068, GOLD, { bone: wr, sides: 8 });
    }

    // hand
    const palm = wrP.clone().add(new THREE.Vector3(0, -0.005, 0.045));
    b.part(new THREE.BoxGeometry(0.095, 0.08, 0.09), P.skin, { bone: wr, at: palm });
    // knuckles + fingers
    for (let i = 0; i < 4; i++) {
      const x = s * (-0.036 + i * 0.024) * -1;
      const k = wrP.clone().add(new THREE.Vector3(x, 0.0, 0.098));
      b.part(sph(0.018, 6, 4), P.skinShade, { bone: fing, at: k.clone().add(new THREE.Vector3(0, 0.025, 0)) });
      const f1 = k.clone();
      const f2 = k.clone().add(new THREE.Vector3(0, -0.04, 0.012));
      const f3 = f2.clone().add(new THREE.Vector3(0, -0.025, -0.025));
      b.capsule(f1, f2, 0.0215, P.skin, { bone: fing, sides: 6 });
      b.capsule(f2, f3, 0.019, P.skin, { bone: fing, sides: 6 });
      b.part(new THREE.BoxGeometry(0.014, 0.004, 0.012), P.skinShade, { bone: fing, at: f3.clone().add(new THREE.Vector3(0, -0.012, -0.01)) });
    }
    // thumb
    const t0 = wrP.clone().add(new THREE.Vector3(-s * 0.05, 0.02, 0.04));
    const t1 = t0.clone().add(new THREE.Vector3(-s * 0.02, 0.03, 0.05));
    const t2 = t1.clone().add(new THREE.Vector3(s * 0.015, 0.0, 0.03));
    b.capsule(t0, t1, 0.023, P.skin, { bone: thumb, sides: 6 });
    b.capsule(t1, t2, 0.02, P.skin, { bone: thumb, sides: 6 });
    b.part(new THREE.BoxGeometry(0.013, 0.004, 0.01), P.skinShade, { bone: thumb, at: t2.clone().add(new THREE.Vector3(0, 0.015, 0.005)) });
  }
  void rnd;
}
```

<!-- call: lowerBody -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLowerBody({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { at, bone, flat: true, ...o });

  // pelvis
  put(box(0.4, 0.16, 0.3), P.clothDark, [0, 0.64, 0], J.hips);
  // belt
  put(cyl(0.25, 0.25, 0.07, 10), P.leatherDark, [0, 0.7, 0.01], J.hips, { scale: [1.15, 1, 0.95] });
  put(box(0.12, 0.09, 0.03), P.gold, [0, 0.7, 0.28], J.hips);
  put(box(0.07, 0.05, 0.035), P.bronze, [0, 0.7, 0.295], J.hips);
  put(new THREE.SphereGeometry(0.02, 6, 4), P.bronze, [0, 0.7, 0.315], J.hips);
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4;
    if (Math.abs(a) < 0.3) continue;
    put(new THREE.SphereGeometry(0.012, 5, 4), P.bronze, [Math.sin(a) * 0.29, 0.7, Math.cos(a) * 0.255], J.hips);
  }
  // pouch
  put(box(0.1, 0.1, 0.06), P.leather, [0.25, 0.63, 0.17], J.hips, { rotation: [0, 30, 0] });
  put(box(0.105, 0.03, 0.065), P.leatherDark, [0.25, 0.675, 0.17], J.hips, { rotation: [0, 30, 0] });
  // spare hammer hung on left hip
  put(cyl(0.012, 0.012, 0.2, 6), P.wood, [-0.27, 0.58, 0.08], J.hips, { rotation: [8, 0, 0] });
  put(box(0.1, 0.05, 0.05), P.iron, [-0.27, 0.68, 0.08], J.hips);
  // key ring
  put(new THREE.TorusGeometry(0.035, 0.007, 5, 8), P.iron, [0.18, 0.63, 0.22], J.hips);
  for (let i = 0; i < 3; i++)
    put(box(0.012, 0.06, 0.008), P.ironLight, [0.17 + i * 0.015, 0.58, 0.225], J.hips, { rotation: [0, 0, i * 8 - 8] });

  // apron
  put(box(0.38, 0.4, 0.04), P.leather, [0, 0.5, 0.27], J.hips);
  put(box(0.38, 0.05, 0.045), P.clothBlue, [0, 0.33, 0.27], J.hips);
  put(box(0.34, 0.4, 0.04), P.leatherDark, [0, 0.5, -0.19], J.hips);
  for (const x of [-0.12, 0.12]) put(box(0.012, 0.3, 0.005), P.leatherDark, [x, 0.5, 0.294], J.hips);
  for (const s of [-1, 1])
    for (let i = 0; i < 5; i++) put(new THREE.SphereGeometry(0.011, 5, 4), P.bronze, [s * 0.18, 0.64 - i * 0.075, 0.295], J.hips);
  for (let i = 0; i < 3; i++)
    put(box(0.04 + R() * 0.03, 0.03, 0.004), P.ink, [-0.1 + i * 0.09, 0.42 + R() * 0.1, 0.293], J.hips, { rotation: [0, 0, R() * 60] });

  // legs
  for (const [s, hip, knee, ank, toe] of [
    [1, J.hipL, J.kneeL, J.ankleL, J.toeL],
    [-1, J.hipR, J.kneeR, J.ankleR, J.toeR],
  ] as any[]) {
    const x = s * 0.15;
    b.rod([x, 0.62, 0], [x, 0.34, 0.04], [0.105, 0.09], P.clothDark, { bone: hip, sides: 8 });
    b.rod([x, 0.34, 0.04], [x, 0.14, 0.01], [0.09, 0.075], P.clothDark, { bone: knee, sides: 8 });
    // knee pad
    put(box(0.12, 0.1, 0.04), P.leatherLight, [x, 0.36, 0.115], knee);
    for (const dx of [-0.04, 0.04]) put(new THREE.SphereGeometry(0.012, 5, 4), P.bronze, [x + dx, 0.36, 0.138], knee);
    // boot
    put(box(0.15, 0.1, 0.17), P.leather, [x, 0.1, 0.02], ank);
    put(box(0.14, 0.09, 0.14), P.leather, [x, 0.06, 0.15], toe);
    put(box(0.15, 0.06, 0.07), P.ironDark, [x, 0.045, 0.22], toe);
    put(box(0.15, 0.02, 0.33), P.ironDark, [x, 0.01, 0.095], ank);
    // cuff
    put(cyl(0.095, 0.095, 0.06, 8), P.leatherLight, [x, 0.27, 0.01], knee);
    put(cyl(0.1, 0.1, 0.012, 8), P.bronze, [x, 0.3, 0.01], knee);
    // buckle
    put(box(0.04, 0.04, 0.01), P.bronze, [x, 0.16, 0.097], ank);
    put(box(0.1, 0.02, 0.01), P.leatherDark, [x, 0.16, 0.093], ank);
  }
}
```

<!-- call: upperBody -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildUpperBody({ b, J, P, M }: any) {
  const R = rng(11);
  const chest = J.chest, spine = J.spine, neck = J.neck;

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, bone, rotation: rot });
  const sph = (r: number, c: string, at: number[], bone: any, sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, bone, scale: sc });

  // Barrel torso: stacked tapered blocks
  const torso = b.loft(
    [
      { at: [0, 0.64, 0], w: 0.44, h: 0.1 },
      { at: [0, 0.78, 0.02], w: 0.54, h: 0.4 },
      { at: [0, 0.95, 0.0], w: 0.6, h: 0.42 },
      { at: [0, 1.12, -0.01], w: 0.62, h: 0.4 },
      { at: [0, 1.22, 0.0], w: 0.4, h: 0.3 },
    ],
    { bone: [spine, chest], color: P.clothBlue, section: "box" } as any,
  );
  void torso;
  // belly bulge
  sph(0.22, P.clothBlue, [0, 0.8, 0.06], spine, [1.25, 0.9, 1.05]);
  // tunic skin at chest/arm holes (skin shoulders peeking)
  for (const s of [1, -1]) {
    cyl(0.085, 0.085, 0.05, 8, P.clothDark, [s * 0.29, 1.08, 0], chest, [0, 0, 90]);
    cyl(0.1, 0.1, 0.02, 8, P.clothDark, [s * 0.255, 1.08, 0], chest, [0, 0, 90]);
  }
  // neck
  cyl(0.085, 0.1, 0.14, 8, P.skin, [0, 1.2, 0.03], neck);
  // collar trim
  b.part(new THREE.TorusGeometry(0.12, 0.022, 5, 10), P.clothDark, { at: [0, 1.16, 0.03], bone: chest, rotation: [90, 0, 0] });
  // gorget
  b.part(new THREE.TorusGeometry(0.135, 0.012, 5, 12), P.gold, { at: [0, 1.185, 0.03], bone: chest, rotation: [90, 0, 0] });

  // Bib
  box(0.3, 0.3, 0.03, P.leather, [0, 0.9, 0.255], chest);
  box(0.3, 0.025, 0.035, P.bronze, [0, 1.045, 0.26], chest);
  box(0.3, 0.025, 0.035, P.bronze, [0, 0.76, 0.28], spine);
  for (const s of [1, -1]) box(0.025, 0.3, 0.035, P.bronze, [s * 0.15, 0.9, 0.26], chest);
  for (let i = 0; i < 5; i++)
    for (const y of [1.045, 0.765]) sph(0.011, P.gold, [-0.12 + i * 0.06, y, 0.285], chest);
  // anvil emblem
  box(0.07, 0.02, 0.02, P.gold, [0, 0.92, 0.28], chest);
  box(0.03, 0.03, 0.02, P.gold, [0, 0.89, 0.28], chest);
  box(0.06, 0.015, 0.02, P.gold, [0, 0.865, 0.28], chest);
  box(0.03, 0.02, 0.02, P.gold, [0.045, 0.925, 0.28], chest);

  // Crossed straps
  for (const s of [1, -1]) {
    box(0.06, 0.62, 0.02, P.leatherDark, [s * 0.04, 1.0, 0.215], chest, [0, 0, s * 38]);
    box(0.045, 0.045, 0.03, P.ironLight, [s * 0.05, 1.0, 0.235], chest);
    box(0.03, 0.03, 0.032, P.iron, [s * 0.05, 1.0, 0.238], chest);
  }

  // Pauldrons
  for (const s of [1, -1]) {
    const x = s * 0.41, y = 1.14;
    sph(0.15, P.ironDark, [x, y, 0], chest, [1, 0.6, 1]);
    sph(0.125, P.iron, [x + s * 0.03, y + 0.045, 0], chest, [1, 0.55, 1]);
    sph(0.095, P.ironDark, [x + s * 0.05, y + 0.085, 0], chest, [1, 0.5, 1]);
    b.part(new THREE.TorusGeometry(0.14, 0.014, 5, 12), P.ironLight, { at: [x, y - 0.04, 0], bone: chest, rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.115, 0.012, 5, 12), P.bronze, { at: [x + s * 0.03, y + 0.03, 0], bone: chest, rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.9;
      b.part(new THREE.ConeGeometry(0.02, 0.07, 6), P.bronze, {
        at: [x + s * 0.06 + Math.sin(a) * 0.0, y + 0.12, Math.sin(a) * 0.07],
        bone: chest,
        rotation: [a * 40, 0, -s * 15],
      });
    }
    box(0.05, 0.12, 0.02, P.leather, [x - s * 0.1, y - 0.08, 0.12], chest, [0, 0, s * 15]);
    sph(0.012, P.gold, [x - s * 0.1, y - 0.1, 0.135], chest);
  }

  // Backpack / tool roll
  box(0.3, 0.34, 0.12, P.leather, [0, 0.95, -0.25], chest);
  cyl(0.05, 0.05, 0.34, 8, P.leatherLight, [0, 1.14, -0.25], chest, [0, 0, 90]);
  for (const x of [-0.09, 0.09]) box(0.03, 0.36, 0.13, P.leatherDark, [x, 0.95, -0.25], chest);
  box(0.1, 0.05, 0.02, P.bronze, [0, 0.88, -0.315], chest);
  for (const x of [-0.1, 0.1]) cyl(0.012, 0.012, 0.15, 6, P.iron, [x, 0.74, -0.25], chest, [90, 0, 0]);
  void R; void frame; void M;
}
```

<!-- call: anvilStump -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildAnvilStump({ b, J, P, M }: any) {
  const R = rng(5);
  const cx = M.stumpCenter[0], cz = M.stumpCenter[2];
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r0: number, r1: number, h: number, n: number, c: string, at: number[], o: any = {}) =>
    part(new THREE.CylinderGeometry(r0, r1, h, n), c, at, o);

  // stump
  cyl(0.3, 0.32, 0.38, 8, P.wood, [cx, 0.19, cz]);
  // top rings
  cyl(0.28, 0.28, 0.01, 8, P.woodDark, [cx, 0.382, cz]);
  cyl(0.25, 0.25, 0.01, 8, P.wood, [cx, 0.386, cz]);
  cyl(0.17, 0.17, 0.01, 8, P.woodDark, [cx, 0.39, cz]);
  cyl(0.15, 0.15, 0.01, 8, P.wood, [cx, 0.394, cz]);
  // bark ridges
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.2;
    const r = 0.305;
    box(0.025, 0.3 + R() * 0.06, 0.03, P.woodDark, [cx + Math.sin(a) * r, 0.19, cz + Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // root flares
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    part(new THREE.ConeGeometry(0.06, 0.2, 5), P.wood, [cx + Math.sin(a) * 0.33, 0.05, cz + Math.cos(a) * 0.33], {
      rotation: [Math.cos(a) * 70, 0, -Math.sin(a) * 70],
    });
  }
  // axe nicks
  for (const a of [0.8, 2.6, 4.4]) {
    box(0.05, 0.08, 0.02, P.woodDark, [cx + Math.sin(a) * 0.3, 0.2, cz + Math.cos(a) * 0.3], { rotation: [0, (a * 180) / Math.PI, 20] });
  }
  // hoops
  for (const y of [0.08, 0.3]) {
    cyl(0.325, 0.325, 0.04, 8, P.ironDark, [cx, y, cz]);
    cyl(0.33, 0.33, 0.008, 8, P.ironLight, [cx, y + 0.02, cz]);
    cyl(0.33, 0.33, 0.008, 8, P.ironLight, [cx, y - 0.02, cz]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.39;
      part(new THREE.SphereGeometry(0.014, 5, 4), P.bronze, [cx + Math.sin(a) * 0.33, y, cz + Math.cos(a) * 0.33]);
    }
  }

  // anvil
  box(0.5, 0.08, 0.28, P.ironDark, [0, 0.42, cz]);
  box(0.52, 0.015, 0.3, P.bronze, [0, 0.465, cz]);
  b.frustumBox([0, 0.46, cz], [0, 0.66, cz], [0.4, 0.2], [0.26, 0.17], { color: P.ironDark });
  box(0.3, 0.03, 0.2, P.iron, [0, 0.55, cz]);
  box(0.29, 0.02, 0.012, P.gold, [0, 0.55, cz + 0.1]);
  // gold band on waist
  box(0.27, 0.025, 0.012, P.bronze, [0, 0.6, cz + 0.09]);
  // face plate
  box(0.84, 0.12, 0.3, P.iron, [0, 0.74, cz]);
  box(0.86, 0.02, 0.32, P.bronze, [0, 0.675, cz]);
  box(0.8, 0.012, 0.18, P.ironLight, [0, 0.806, cz]);
  for (const s of [1, -1]) box(0.84, 0.012, 0.01, P.ironLight, [0, 0.803, cz + s * 0.15]);
  // heel cutting table
  box(0.16, 0.05, 0.3, P.iron, [-0.34, 0.795, cz]);
  box(0.16, 0.008, 0.3, P.ironLight, [-0.34, 0.822, cz]);
  // holes
  box(0.04, 0.004, 0.04, P.ink, [-0.3, 0.826, cz - 0.04]);
  cyl(0.02, 0.02, 0.004, 8, P.ink, [-0.3, 0.826, cz + 0.07]);
  // horn
  const horn = b.sweep(
    [[0.42, 0.74, cz], [0.52, 0.745, cz], [0.62, 0.76, cz], [0.69, 0.79, cz]],
    [0.12, 0.012],
    { color: P.iron, caps: "round" }
  );
  b.sweep([[0.42, 0.7, cz], [0.55, 0.705, cz], [0.64, 0.74, cz]], [0.06, 0.008], { color: P.ironDark });
  cyl(0.125, 0.125, 0.015, 8, P.bronze, [0.43, 0.74, cz], { rotation: [0, 0, 90] });
  // dents and scorches
  for (let i = 0; i < 6; i++) {
    part(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 6), P.ink, [-0.1 + R() * 0.45, 0.8115, cz - 0.05 + R() * 0.1]);
  }
  // emblem
  box(0.07, 0.025, 0.008, P.gold, [-0.1, 0.74, cz + 0.153]);
  box(0.03, 0.05, 0.008, P.gold, [-0.1, 0.72, cz + 0.153]);
  box(0.09, 0.015, 0.008, P.gold, [-0.1, 0.69, cz + 0.153]);
  // rivets on plate
  for (const x of [-0.38, -0.2, 0.2, 0.38])
    part(new THREE.SphereGeometry(0.014, 5, 4), P.gold, [x, 0.7, cz + 0.152]);

  // hanging chain
  for (let i = 0; i < 5; i++) {
    part(new THREE.TorusGeometry(0.018, 0.005, 4, 6), P.ironLight, [cx - 0.2, 0.3 - i * 0.03, cz + 0.3], {
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
  }
}
```

<!-- call: headBeard -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadBeard({ b, J, P }: any) {
  const head = J.head, jaw = J.jaw;
  const HC = [0, 1.38, 0.05];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r1: number, r2: number, h: number, s = 8) => new THREE.CylinderGeometry(r1, r2, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: head, at, flat: true, ...o });
  const putJ = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: jaw, at, flat: true, ...o });

  // skull
  put(box(0.3, 0.26, 0.28), P.skin, [0, 1.36, 0.04]);
  put(box(0.32, 0.07, 0.1), P.skin, [0, 1.43, 0.14]); // brow
  for (const s of [1, -1]) {
    put(sph(0.045), P.skin, [s * 0.11, 1.33, 0.15]); // cheekbone
    put(sph(0.03), P.noseRed, [s * 0.12, 1.3, 0.17], { scale: [1, 0.8, 0.5] }); // rosy
    // brows
    put(box(0.1, 0.035, 0.05), P.beardDark, [s * 0.065, 1.455, 0.19], { rotation: [0, 0, s * -14] });
    // eyes
    put(sph(0.026), P.eyeWhite, [s * 0.065, 1.41, 0.175]);
    put(sph(0.015), P.eyeBlue, [s * 0.065, 1.41, 0.197]);
    put(sph(0.008), P.ink, [s * 0.065, 1.41, 0.207]);
    put(sph(0.004), "#ffffff", [s * 0.07, 1.417, 0.21]);
    // ears
    put(cyl(0.0, 0.035, 0.12, 4), P.skin, [s * 0.17, 1.4, 0.03], { rotation: [0, 0, s * -80] });
    // sideburns
    put(box(0.05, 0.16, 0.2), P.beard, [s * 0.16, 1.28, 0.05]);
    // horns
    put(cyl(0.05, 0.055, 0.04, 8), P.bronze, [s * 0.15, 1.52, 0.05], { rotation: [0, 0, s * -90] });
    put(cyl(0.045, 0.03, 0.16, 8), P.teeth, [s * 0.23, 1.55, 0.05], { rotation: [0, 0, s * -50] });
    put(cyl(0.03, 0.0, 0.16, 8), P.teeth, [s * 0.3, 1.66, 0.05], { rotation: [0, 0, s * -15] });
    // mustache curls
    put(cyl(0.025, 0.012, 0.14, 6), P.beard, [s * 0.1, 1.24, 0.2], { rotation: [0, 0, s * 70] });
    put(sph(0.032), P.beardLight, [s * 0.17, 1.27, 0.2]);
    put(sph(0.03), P.gold, [s * 0.1, 1.5, 0.2], { scale: [0.5, 0.5, 0.5] });
    // braids
    for (const k of [0.07, 0.14]) {
      const x = s * k + s * 0.03;
      for (let i = 0; i < 5; i++) {
        put(sph(0.04 - i * 0.003, 6, 5), i % 2 ? P.beardLight : P.beard, [x, 1.1 - i * 0.07, 0.31], { scale: [1, 1.1, 0.9] });
      }
      put(cyl(0.035, 0.035, 0.015, 8), P.gold, [x, 1.0, 0.31]);
      put(cyl(0.035, 0.0, 0.08, 6), P.beardDark, [x, 0.77, 0.31], { rotation: [180, 0, 0] });
    }
  }
  // helm
  put(cyl(0.17, 0.17, 0.05, 8), P.iron, [0, 1.5, 0.04]);
  put(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.ironDark, [0, 1.52, 0.04]);
  put(cyl(0.175, 0.175, 0.012, 8), P.bronze, [0, 1.475, 0.04]);
  put(box(0.03, 0.04, 0.3), P.iron, [0, 1.69, 0.04]);
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.36;
    put(sph(0.011, 5, 4), P.gold, [Math.sin(a) * 0.175, 1.5, 0.04 + Math.cos(a) * 0.175]);
  }
  // nose
  put(sph(0.055), P.noseRed, [0, 1.33, 0.21]);
  put(sph(0.04), P.skinShade, [0, 1.31, 0.21], { scale: [1.1, 0.6, 1] });
  for (const s of [1, -1]) put(sph(0.009, 4, 3), P.ink, [s * 0.02, 1.305, 0.255]);
  // upper lip and teeth
  put(box(0.14, 0.03, 0.06), P.skinShade, [0, 1.265, 0.18]);
  for (const s of [1, -1]) put(box(0.025, 0.035, 0.015), P.teeth, [s * 0.02, 1.245, 0.205]);
  put(box(0.2, 0.05, 0.05), P.beard, [0, 1.285, 0.2]);

  // jaw
  putJ(box(0.26, 0.07, 0.22), P.skin, [0, 1.22, 0.08]);
  putJ(box(0.12, 0.06, 0.06), P.skin, [0, 1.19, 0.2]);
  for (const s of [1, -1]) putJ(box(0.022, 0.025, 0.012), P.teeth, [s * 0.03, 1.245, 0.2]);

  // beard mass
  put(box(0.3, 0.16, 0.24), P.beard, [0, 1.15, 0.2]);
  put(cyl(0.2, 0.12, 0.34, 8), P.beard, [0, 1.02, 0.2], { scale: [1, 1, 0.9] });
  put(cyl(0.12, 0.02, 0.14, 8), P.beardDark, [0, 0.8, 0.22]);
  // layered locks
  for (let r = 0; r < 4; r++)
    for (let i = -3; i <= 3; i++) {
      const y = 1.18 - r * 0.1;
      const w = 0.17 - r * 0.025;
      put(cyl(0.0, 0.045, 0.2 - r * 0.02, 5), r % 2 ? P.beardLight : P.beard, [i * w * 0.4, y - 0.08, 0.33 - r * 0.012 - Math.abs(i) * 0.012], { rotation: [180, 0, 0] });
    }
  for (let i = -2; i <= 2; i++)
    put(cyl(0.0, 0.04, 0.16, 5), P.beardLight, [i * 0.05, 0.8, 0.27], { rotation: [180, 0, 0] });
  put(box(0.28, 0.1, 0.1), P.beardDark, [0, 1.24, 0.12]);

  // ponytail
  put(box(0.12, 0.1, 0.12), P.beard, [0, 1.42, -0.12]);
  put(cyl(0.025, 0.025, 0.03, 8), P.gold, [0, 1.36, -0.15]);
  put(cyl(0.05, 0.015, 0.22, 6), P.beard, [0, 1.24, -0.17]);
  put(cyl(0.015, 0, 0.08, 6), P.beardLight, [0, 1.09, -0.17], { rotation: [180, 0, 0] });
}
```

<!-- call: smithingTools -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildSmithingTools({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const at = (o: THREE.Vector3, d: THREE.Vector3, t: number) => o.clone().addScaledVector(d, t);
  const none = { bone: J.hips };
  // Oriented box: size along local x,y,z; local y along dir
  const box = (c: THREE.Vector3, s: number[], col: string, dir?: number[], up?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: c, dir: dir ?? [0, 1, 0], up, ...none });
  const cyl = (c: THREE.Vector3, r: number, h: number, col: string, dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at: c, dir, ...none });

  // ---------- Hammer ----------
  const hd = V(M.hammerDir).normalize();
  const grip = V(M.gripHammer);
  const pommel = at(grip, hd, -0.12);
  const headC = V(M.hammerHead);
  const hl = headC.clone().sub(pommel).length();
  const hmid = pommel.clone().lerp(headC, 0.5);
  const hdir = headC.clone().sub(pommel).normalize();
  cyl(hmid, 0.02, hl, P.wood, hdir.toArray(), 8);
  cyl(pommel, 0.028, 0.03, P.bronze, hdir.toArray(), 8);
  for (let i = 0; i < 4; i++) {
    cyl(at(grip, hdir, -0.04 + i * 0.03), 0.0235, 0.014, P.leatherDark, hdir.toArray(), 8);
  }
  b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 10), P.leather, { at: at(grip, hdir, 0.03), dir: hdir.toArray(), axis: "z", ...none });
  // head: long axis along X
  const X = [1, 0, 0];
  box(headC, [0.17, 0.13, 0.13], P.iron, undefined).rotation.set(0, 0, 0);
  const hx = (x: number) => headC.clone().add(new THREE.Vector3(x, 0, 0));
  // striking face (+X)
  b.part(new THREE.CylinderGeometry(0.068, 0.062, 0.05, 8), P.ironLight, { at: hx(0.105), dir: X, ...none });
  b.part(new THREE.TorusGeometry(0.066, 0.006, 4, 8), P.bronze, { at: hx(0.08), dir: X, axis: "z", ...none });
  // pein wedge (-X)
  b.part(new THREE.ConeGeometry(0.065, 0.1, 4), P.ironDark, { at: hx(-0.135), dir: [-1, 0, 0], rotation: undefined, ...none });
  box(hx(-0.09), [0.04, 0.115, 0.115], P.ironDark);
  // bronze collars where the handle enters
  for (const s of [-1, 1]) {
    cyl(headC.clone().addScaledVector(hdir, s * 0.072), 0.032, 0.016, P.bronze, hdir.toArray(), 8);
  }
  // gold rivets
  for (const x of [-0.05, 0.05])
    for (const z of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), P.gold, { at: headC.clone().add(new THREE.Vector3(x, 0.0, z * 0.067)), ...none });
    }

  // ---------- Tongs ----------
  const g = V(M.gripTongs);
  const tip = V(M.tongsTip);
  const td = tip.clone().sub(g).normalize();
  const side = new THREE.Vector3(0, 1, 0).cross(td).normalize();
  const upv = td.clone().cross(side).normalize();
  const pivot = at(g, td, 0.34);
  for (const s of [-1, 1]) {
    const hA = g.clone().addScaledVector(side, s * 0.03).addScaledVector(upv, 0.0);
    const jaw = tip.clone().addScaledVector(side, s * 0.022);
    // handle (leather) from grip to pivot
    const hEnd = pivot.clone().addScaledVector(side, s * 0.006);
    b.rod(hA, hEnd, 0.011, P.leather, none);
    b.rod(at(hA, td, -0.04), at(hA, td, 0.02), 0.014, P.leatherDark, none);
    b.rod(hEnd, jaw, [0.01, 0.007], P.ironDark, none);
    b.rod(hEnd.clone().addScaledVector(upv, 0.008), jaw.clone().addScaledVector(upv, 0.006), 0.003, P.ironLight, none);
    // flat jaw
    box(jaw.clone().addScaledVector(td, -0.0), [0.008, 0.03, 0.04], P.iron, td.toArray(), upv.toArray());
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.bronze, { at: hA.clone().addScaledVector(td, -0.045), ...none });
  }
  cyl(pivot, 0.016, 0.03, P.bronze, upv.toArray(), 8);
  b.part(new THREE.SphereGeometry(0.009, 6, 4), P.gold, { at: at(pivot, upv, 0.018), ...none });

  // ---------- Ingot ----------
  const ic = V(M.ingotCenter);
  const ia = V(M.ingotAxis).normalize();
  const mk = (off: number, s: number[], col: string, str: number) =>
    glow(box(at(ic, ia, off), s, col, ia.toArray(), [0, 1, 0]), str);
  mk(0, [0.05, 0.2, 0.04], P.fireOrange, 1.3);
  mk(0, [0.026, 0.19, 0.012], P.fireHot, 1.6).position.y += 0.0;
  mk(0.085, [0.052, 0.035, 0.042], "#8a2410", 1.2);
  mk(-0.1, [0.045, 0.02, 0.036], P.fireHot, 1.5);

  // ---------- Embers ----------
  const r = rng(11);
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Vector3(0.02 + r() * 0.42, 0.84 + r() * 0.3, 0.65 + r() * 0.25);
    const col = i % 2 ? P.fireHot : P.fireOrange;
    if (i % 3 === 0) {
      glow(b.part(new THREE.OctahedronGeometry(0.012, 0), col, { at: p, scale: [0.5, 2.4, 0.5], rotation: [0, r() * 90, r() * 30 - 15], ...none }), 1.5);
    } else {
      glow(b.part(new THREE.OctahedronGeometry(0.01 + r() * 0.008, 0), col, { at: p, ...none }), 1.4);
    }
  }
  // ingot-lit rivets on the tong jaws
  for (const s of [-1, 1])
    glow(b.part(new THREE.SphereGeometry(0.006, 5, 4), P.fireOrange, { at: tip.clone().addScaledVector(side, s * 0.03).addScaledVector(upv, 0.012), ...none }), 1.2);
}
```