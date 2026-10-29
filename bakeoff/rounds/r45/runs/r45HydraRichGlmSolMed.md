<!-- call: plan -->

```json
{
  "name": "Ashen Five-Headed Hydra",
  "description": "A colossal God-of-War-style hydra: a moss-scaled serpent bulk with pale belly scutes, dark dorsal spikes, broken iron shackles and glowing teal runes, five horned heads with open fanged jaws and ember-lit throats rising spread from its shoulders.",
  "builderName": "hydraGow",
  "size": [4.2, 4.2, 8.6],
  "layout": "Facing +Z the viewer sees a fan of five serpentine necks rising from the shoulders of a massive low serpent chest: the central neck tallest with its head highest at y≈4.0 staring straight ahead, two mid necks at x=±1.1 a head lower, and two outer necks splayed out to x=±1.8 lowest of all, all five jaws open showing teeth. Behind and below them the huge chest dominates the centre, its pale belly plates resting on the floor from z≈-0.8 to z≈2.0, with dark dorsal spikes along its spine and glowing teal rune sigils on each flank plus a broken iron shackle ring at its front. The tail sweeps back from z≈-0.6, tapering and curling upward to a bone spade fin near z=-4.6. Style on every part: ashen desaturated moss-greens with hard flat tonal breaks, weathered bone horn, dark forge-iron shackles and chain links, small glowing teal rune pieces and ember/yellow glow eyes as separate emissive parts, and deep-ink seams and outlines as their own seated pieces.",
  "palette": {
    "scaleDark": "#24312a",
    "scaleMid": "#3a4f41",
    "scaleHigh": "#57735a",
    "dorsal": "#1b2620",
    "belly": "#b3a173",
    "bellyShade": "#7c6b48",
    "horn": "#d8cba8",
    "hornDark": "#6b5c44",
    "claw": "#9c8a64",
    "tooth": "#efe7cf",
    "maw": "#571626",
    "throat": "#8a3030",
    "glowTeal": "#3fe8c4",
    "glowEmber": "#ff8c34",
    "eyeGlow": "#ffd94a",
    "ink": "#10150f",
    "iron": "#4d4d56",
    "ironDark": "#2b2b31",
    "membrane": "#6e2534",
    "moss": "#5c7a3a"
  },
  "mounts": {
    "neckBase": [0, 1.6, 1.35],
    "tailRoot": [0, 0.95, -0.6],
    "headC": [0, 3.65, 2.6],
    "headML": [1.12, 3.32, 2.35],
    "headMR": [-1.12, 3.32, 2.35],
    "headOL": [1.78, 2.85, 2.05],
    "headOR": [-1.78, 2.85, 2.05]
  },
  "joints": [
    { "name": "body", "at": [0, 1.05, 0.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "shoulders", "parent": "body", "at": [0, 1.15, 1.45], "dir": [0, 0, 1], "role": "spine" },
    { "name": "tail1", "parent": "body", "at": [0, 0.98, -1.25], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.92, -2.35], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.05, -3.45], "dir": [0, 0.4, -0.92], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 1.45, -4.25], "dir": [0, 0.85, -0.5], "role": "tail" },
    { "name": "neckC1", "parent": "shoulders", "at": [0, 1.6, 1.35], "dir": [0, 0.75, 0.66], "role": "neck", "group": "necks" },
    { "name": "neckC2", "parent": "neckC1", "at": [0, 2.55, 1.95], "dir": [0, 0.85, 0.5], "role": "neck", "group": "necks" },
    { "name": "neckC3", "parent": "neckC2", "at": [0, 3.2, 2.35], "dir": [0, 0.95, 0.3], "role": "neck", "group": "necks" },
    { "name": "neckML1", "parent": "shoulders", "at": [0.55, 1.65, 1.2], "dir": [0.5, 0.72, 0.48], "role": "neck", "group": "necks" },
    { "name": "neckML2", "parent": "neckML1", "at": [0.95, 2.4, 1.65], "dir": [0.18, 0.78, 0.6], "role": "neck", "group": "necks" },
    { "name": "neckML3", "parent": "neckML2", "at": [1.08, 3.0, 2.05], "dir": [0.08, 0.68, 0.73], "role": "neck", "group": "necks" },
    { "name": "neckMR1", "parent": "shoulders", "at": [-0.55, 1.65, 1.2], "dir": [-0.5, 0.72, 0.48], "role": "neck", "group": "necks" },
    { "name": "neckMR2", "parent": "neckMR1", "at": [-0.95, 2.4, 1.65], "dir": [-0.18, 0.78, 0.6], "role": "neck", "group": "necks" },
    { "name": "neckMR3", "parent": "neckMR2", "at": [-1.08, 3.0, 2.05], "dir": [-0.08, 0.68, 0.73], "role": "neck", "group": "necks" },
    { "name": "neckOL1", "parent": "shoulders", "at": [1.0, 1.5, 0.95], "dir": [0.68, 0.6, 0.4], "role": "neck", "group": "necks" },
    { "name": "neckOL2", "parent": "neckOL1", "at": [1.5, 2.05, 1.3], "dir": [0.3, 0.72, 0.62], "role": "neck", "group": "necks" },
    { "name": "neckOL3", "parent": "neckOL2", "at": [1.7, 2.55, 1.7], "dir": [0.05, 0.6, 0.8], "role": "neck", "group": "necks" },
    { "name": "neckOR1", "parent": "shoulders", "at": [-1.0, 1.5, 0.95], "dir": [-0.68, 0.6, 0.4], "role": "neck", "group": "necks" },
    { "name": "neckOR2", "parent": "neckOR1", "at": [-1.5, 2.05, 1.3], "dir": [-0.3, 0.72, 0.62], "role": "neck", "group": "necks" },
    { "name": "neckOR3", "parent": "neckOR2", "at": [-1.7, 2.55, 1.7], "dir": [-0.05, 0.6, 0.8], "role": "neck", "group": "necks" },
    { "name": "headC", "parent": "neckC3", "at": [0, 3.65, 2.6], "dir": [0, 0.1, 1], "role": "head", "group": "heads" },
    { "name": "jawC", "parent": "headC", "at": [0, 3.55, 2.75], "dir": [0, 0.05, 1], "role": "jaw", "group": "heads" },
    { "name": "headML", "parent": "neckML3", "at": [1.12, 3.32, 2.35], "dir": [0, 0.05, 1], "role": "head", "group": "heads" },
    { "name": "jawML", "parent": "headML", "at": [1.12, 3.24, 2.48], "dir": [0, 0.02, 1], "role": "jaw", "group": "heads" },
    { "name": "headMR", "parent": "neckMR3", "at": [-1.12, 3.32, 2.35], "dir": [0, 0.05, 1], "role": "head", "group": "heads" },
    { "name": "jawMR", "parent": "headMR", "at": [-1.12, 3.24, 2.48], "dir": [0, 0.02, 1], "role": "jaw", "group": "heads" },
    { "name": "headOL", "parent": "neckOL3", "at": [1.78, 2.85, 2.05], "dir": [0, 0, 1], "role": "head", "group": "heads" },
    { "name": "jawOL", "parent": "headOL", "at": [1.78, 2.78, 2.18], "dir": [0, 0, 1], "role": "jaw", "group": "heads" },
    { "name": "headOR", "parent": "neckOR3", "at": [-1.78, 2.85, 2.05], "dir": [0, 0, 1], "role": "head", "group": "heads" },
    { "name": "jawOR", "parent": "headOR", "at": [-1.78, 2.78, 2.18], "dir": [0, 0, 1], "role": "jaw", "group": "heads" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The serpent chest and front body. A smooth-skinned loft along the spine from z=-0.9 (y≈1.0, radius 0.85) swelling to radius 1.15 at the chest (z≈0.6, spine y≈1.12 so the belly rests on y=0) and easing to radius 1.0 at the shoulders (z≈1.9). Countershaded moss-green scales: scaleDark/scaleMid/scaleHigh drifting over the back and flanks, pale belly below. Underneath, 5-6 rows of broad overlapping armoured belly scutes (belly with thin bellyShade step edges) running the body length, each scute its own shallow slab seated on the tube. Along the spine behind the necks to the hips, 8-9 large dorsal spikes: dark hornDark cones with pale horn tips, shrinking toward the rear, each seated on the sweep surface. Two glowing teal rune sigils per flank (glowTeal, small extruded rune strokes seated in a dark ink recess plate) on the upper flank; a patch of moss scaleHigh tones on upward-facing scale edges. God of War flavour: a broken iron shackle — a thick dark iron (iron) ring with ironDark inner band around the chest just behind the neck bases, its broken chain of 4-5 heavy links (iron, ironDark) trailing down the flank, lowest link resting at y≈0.02.",
      "box": [[-1.45, 0, -1.0], [1.45, 2.05, 2.2]],
      "attaches": "Root of the body on the body and shoulders joints; the five necks of the necks part sprout buried inside its front-top around mount neckBase [0, 1.6, 1.35]; the tail part takes over at tailRoot [0, 0.95, -0.6], overlapping the torso's rear by one radius so no seam shows.",
      "joints": ["body", "shoulders"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "tail",
      "builds": "The serpent tail from tailRoot [0, 0.95, -0.6]: one smooth-skinned sweep along the tail1-tail4 joints, radius 0.85 tapering to 0.12, running straight back to z≈-3.5 then curling upward (tail tip near [0, 1.9, -4.5]). Same scale paint as the torso so the pattern continues across the join: scaleDark/scaleMid/scaleHigh above, pale belly scutes (belly, bellyShade edges) under the first half only, fading to plain scales behind. Paired dorsal spikes (hornDark bases, horn tips) shrinking from 0.28 to 0.06 along the tail's top, seated on the sweep surface. The tip carries a broad bone spade fin: an extruded flat blade about 0.7 long and 0.45 wide in horn with a hornDark edge rim and a small glowing teal rune stud at its centre. Two weathered iron rings (iron with ironDark bands, dented — broken shackle remnants) cinched around the tail at t≈0.25 and t≈0.45.",
      "box": [[-0.95, 0, -4.9], [0.95, 2.0, -0.15]],
      "attaches": "Sweeps over the body and tail1-tail4 joints; its front end buries one radius into the torso part's rear (torso box ends at z=-1.0, tail sweep starts at tailRoot z=-0.6 inside it).",
      "joints": ["body", "tail1", "tail2", "tail3", "tail4"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "necks",
      "builds": "All five serpentine necks rising from the chest top around mount neckBase, each a smooth-skinned sweep on its own neck chain (neckC1-3, neckML1-3, neckMR1-3, neckOL1-3, neckOR1-3), radius 0.34 at the base easing to 0.22 at the head end, tubes ending buried just under each head joint mount so no gap shows when a head turns. Central neck tallest and near vertical with a slight forward S; mid necks bow outward then forward; outer necks splay widest and lowest. Each neck is countershaded front-to-back: pale throat (belly tones) facing forward, scaleDark/scaleMid back, with a thin ink seam ring at each joint bend. Down the top of every neck runs a mane of backward-leaning horn spikes (horn with hornDark roots, 0.14-0.08 tall, about 9 per neck) seated on the sweep's dorsal line. At each neck base a broken iron shackle collar (iron ring, ironDark inner pad) with one or two dangling chain links riding the neck's bone.",
      "box": [[-1.9, 1.4, 0.85], [1.9, 3.8, 2.9]],
      "attaches": "Sprouts buried inside the torso part at mount neckBase; its five neck tips end exactly at the head mounts headC, headML, headMR, headOL, headOR where the two head parts seat their skulls on the head joints.",
      "joints": ["neckC1", "neckC2", "neckC3", "neckML1", "neckML2", "neckML3", "neckMR1", "neckMR2", "neckMR3", "neckOL1", "neckOL2", "neckOL3", "neckOR1", "neckOR2", "neckOR3"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "headsCentral",
      "builds": "The richest head, the central one on headC with jaw on jawC — the archetype all other heads repeat. A heavy faceted skull about 0.55 wide and 0.9 long built as angular boxy slabs and a blunt snout frustum in scaleMid with scaleDark shadowed underside and scaleHigh brow ridge, an ink outline seam where skull meets snout. Open jaw at about 25 degrees: the upper jaw is the skull's snout with a maw-dark (maw) roof and two fang rows of conical teeth (tooth, 6 per side, front fangs largest); the lower jaw is a shallower slab on the jawC joint with its own teeth, a throat piece (throat) at the back and an ember glow (glowEmber) deep in the gullet. Two heavy brow horns (horn, hornDark ridged bases) curving back and up from the brow to y≈4.15, plus 3 small horn spikes down the jawline and cheek studs of claw-coloured spikes. Glowing yellow eyes (eyeGlow, small glowing lens parts seated in ink socket rims) under the horned brow. A glowing teal rune (glowTeal strokes in an ink recess) etched on the skull crown. A frayed membrane-red crest web (membrane) stretched between the two rear horn spikes.",
      "box": [[-0.5, 3.15, 2.05], [0.5, 4.15, 3.6]],
      "attaches": "Seats on the headC and jawC joints exactly at mounts headC/jaw line; the necks part's central neck tube ends buried just behind the skull's back edge.",
      "joints": ["headC", "jawC"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "headsSide",
      "builds": "The four flanking heads, built like headsCentral but smaller and varied so the fan reads as individuals: the mid pair (headML/headMR, scale 0.85 of the central head) with forward-curving ibex-style brow horns and two cheek spikes each; the outer pair (headOL/headOR, scale 0.72) with a swept-back single crest fin (horn, hornDark edge) instead of paired horns. Same construction on every head: faceted skull slabs in scaleMid/scaleDark/scaleHigh with ink seam, open jaw on its jaw joint (about 20 degrees) with maw roof, throat piece, ember glow in the gullet, two rows of conical teeth (tooth, 5 per side), glowing eyeGlow eyes in ink sockets, a small glowing teal rune on the crown. Mirror the left/right pairs exactly (s = 1/-1 over x), and keep the mid heads aimed forward-down, the outer heads aimed slightly outward.",
      "box": [[-2.15, 2.4, 1.55], [2.15, 3.8, 3.2]],
      "attaches": "Each head seats on its head joint at mounts headML, headMR, headOL, headOR with jaws on jawML, jawMR, jawOL, jawOR; the necks part's mid and outer neck tubes end buried just behind each skull's back edge.",
      "joints": ["headML", "jawML", "headMR", "jawMR", "headOL", "jawOL", "headOR", "jawOR"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: necks -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildNecks({ b, J, P, M }: Ctx) {
  const random = rng(731);
  const necks = [
    {
      key: "C",
      joints: [J.neckC1, J.neckC2, J.neckC3],
      head: J.headC,
      baseRadius: 0.35,
      endRadius: 0.235,
      spikes: 10,
      collarLinks: 2,
    },
    {
      key: "ML",
      joints: [J.neckML1, J.neckML2, J.neckML3],
      head: J.headML,
      baseRadius: 0.34,
      endRadius: 0.225,
      spikes: 9,
      collarLinks: 2,
    },
    {
      key: "MR",
      joints: [J.neckMR1, J.neckMR2, J.neckMR3],
      head: J.headMR,
      baseRadius: 0.34,
      endRadius: 0.225,
      spikes: 9,
      collarLinks: 2,
    },
    {
      key: "OL",
      joints: [J.neckOL1, J.neckOL2, J.neckOL3],
      head: J.headOL,
      baseRadius: 0.325,
      endRadius: 0.215,
      spikes: 8,
      collarLinks: 1,
    },
    {
      key: "OR",
      joints: [J.neckOR1, J.neckOR2, J.neckOR3],
      head: J.headOR,
      baseRadius: 0.325,
      endRadius: 0.215,
      spikes: 8,
      collarLinks: 1,
    },
  ];

  const neckColor = P.scaleMid;
  const neckDark = P.scaleDark;
  const belly = P.belly;
  const bellyShade = P.bellyShade;
  const horn = P.horn;
  const hornDark = P.hornDark;
  const iron = P.iron;
  const ironDark = P.ironDark;
  const ink = P.ink;

  const vec = (p: THREE.Vector3 | [number, number, number]) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  const neckPath = (n: (typeof necks)[number]) => {
    const a = n.joints.map((j) => j.at.clone());
    const tip = n.head.at.clone();

    // Sink the final ring behind the skull so the neck visibly disappears into the head.
    const finalTangent = n.joints[2].dir([0, 0, 1]).normalize();
    tip.addScaledVector(finalTangent, -0.13);

    return catmull([...a, tip], { tension: 0.12 });
  };

  const ringBand = (
    on: any,
    radius: number,
    tubeRadius: number,
    color: string,
    name: string,
    count = 14,
  ) => {
    const ring = b.ring(on, {
      count,
      radius,
      fromDeg: 0,
      toDeg: 360,
      name,
      group: "necks",
      role: "fan",
    });
    b.sweep(catmull(ring.items, { closed: true }), tubeRadius, {
      color,
      caps: "none",
      sides: 8,
      name,
      group: "necks",
    });
    return ring;
  };

  const link = (
    at: any,
    side: number,
    index: number,
    bone: any,
    scale = 1,
  ) => {
    const torus = new THREE.TorusGeometry(
      0.095 * scale,
      0.025 * scale,
      6,
      10,
      Math.PI * 2,
    );

    // Alternating axes make the hanging chain read as interlocked rather than as a stack of rings.
    const axis =
      index % 2 === 0
        ? [0, 0, 1]
        : [side * 0.82, 0.18, 0.55];

    b.part(torus, index % 2 === 0 ? iron : ironDark, {
      at,
      bone,
      dir: axis,
      axis: "z",
      rotation: [0, (index * 17 + side * 9) % 24, 0],
      name: `neckChain${side > 0 ? "L" : "R"}${index}`,
      group: "necks",
    });
  };

  for (const n of necks) {
    const path = neckPath(n);
    const bones = [...n.joints];

    const neck = b.sweep(path, (t: number) => {
      return n.baseRadius * (1 - t) + n.endRadius * t;
    }, {
      bone: bones,
      color: neckColor,
      caps: { start: "round", end: "round" },
      sides: 8,
      smooth: false,
      name: `neck${n.key}`,
      group: "necks",
      // The pale throat faces +Z. The dark dorsal sector remains readable
      // through the bends because the sweep clock is transported.
      sectors: [
        [-62, 58, neckDark],
        [132, 228, belly],
      ],
    });

    // Hard ink seams at the three principal bends. Each is a low, faceted,
    // slightly proud band rather than a painted line.
    const seamTs = [0.28, 0.53, 0.77];
    for (let i = 0; i < seamTs.length; i++) {
      const t = seamTs[i];
      const cp = neck.at(t);
      const r = n.baseRadius * (1 - t) + n.endRadius * t + 0.012;
      ringBand(
        cp,
        r,
        0.009,
        ink,
        `neck${n.key}Seam${i}`,
        12,
      );
    }

    // A thin darker throat edge sits just inside the pale forward sector.
    for (const t of [0.18, 0.43, 0.68, 0.9]) {
      const throatEdge = neck.at(t, 124);
      b.sweep(
        catmull([
          throatEdge,
          neck.at(Math.min(1, t + 0.035), 124),
        ]),
        0.012,
        {
          color: bellyShade,
          bone: throatEdge.bone,
          caps: "flat",
          sides: 6,
          name: `neck${n.key}ThroatEdge`,
          group: "necks",
        },
      );
    }

    // Dorsal mane: dark root cones with smaller weathered-bone caps.
    // The tips lean toward the back of the creature, producing a sawtooth
    // silhouette without making the necks too smooth.
    for (let i = 0; i < n.spikes; i++) {
      const t = 0.08 + (i / (n.spikes - 1)) * 0.84;
      const surface = neck.at(t, 0);
      const length = 0.145 - 0.062 * t;
      const outward = surface.n.clone().normalize();
      const backward = surface.tangent.clone().normalize().multiplyScalar(-1);
      const root = surface.at.clone().addScaledVector(outward, -0.008);
      const tip = surface.at
        .clone()
        .addScaledVector(outward, length)
        .addScaledVector(backward, length * (0.34 + random() * 0.12));

      b.spike(root, tip, null, 0.044 - 0.014 * t, {
        color: hornDark,
        caps: "flat",
        sides: 6,
        name: `neck${n.key}ManeRoot${i}`,
        group: "necks",
      });

      const capStart = root
        .clone()
        .lerp(tip, 0.48);
      const capTip = root
        .clone()
        .lerp(tip, 1.04);
      b.spike(capStart, capTip, null, 0.026 - 0.009 * t, {
        color: horn,
        caps: "point",
        sides: 6,
        name: `neck${n.key}ManeTip${i}`,
        group: "necks",
      });
    }

    // Broken iron collar at every neck root. The dark inner band makes the
    // collar legible against the green scales and hides the buried start.
    const base = n.joints[0];
    const basePoint = base.at;
    ringBand(
      base,
      n.baseRadius + 0.045,
      0.043,
      iron,
      `neck${n.key}Shackle`,
      16,
    );
    ringBand(
      base,
      n.baseRadius + 0.049,
      0.012,
      ironDark,
      `neck${n.key}ShackleInner`,
      16,
    );

    // A pair of tiny forged stop plates breaks up the otherwise perfect ring.
    for (const side of [-1, 1]) {
      const plateAt = base.local({
        left: side * (n.baseRadius + 0.018),
        down: 0.015,
        back: 0.01,
      });
      b.part(
        new THREE.BoxGeometry(0.105, 0.075, 0.045),
        ironDark,
        {
          at: plateAt,
          bone: base,
          dir: base.dir([0, 0, 1]),
          axis: "z",
          rotation: [0, side * 8, side * 12],
          name: `neck${n.key}CollarPlate${side > 0 ? "L" : "R"}`,
          group: "necks",
        },
      );
    }

    // Dangling links ride the first neck bone and sink into the collar.
    const linkCount = n.collarLinks;
    for (let i = 0; i < linkCount; i++) {
      const drop = base.local({
        left: (i === 0 ? 1 : -1) * (0.19 + i * 0.025),
        down: 0.12 + i * 0.16,
        back: -0.015 - i * 0.025,
      });
      link(drop, i === 0 ? 1 : -1, i, base, i === 0 ? 1 : 0.9);
    }

    // A small iron rivet at the front of each collar gives the five roots
    // a repeated, readable God-of-War ornament.
    const rivet = base.local({ forward: 0.22, down: 0.01 });
    b.part(new THREE.SphereGeometry(0.035, 7, 5), iron, {
      at: rivet,
      bone: base,
      name: `neck${n.key}CollarRivet`,
      group: "necks",
    });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P, M }: Ctx) {
  const dark = P.scaleDark;
  const mid = P.scaleMid;
  const high = P.scaleHigh;
  const belly = P.belly;
  const bellyShade = P.bellyShade;
  const horn = P.horn;
  const hornDark = P.hornDark;
  const ink = P.ink;
  const teal = P.glowTeal;
  const iron = P.iron;
  const ironDark = P.ironDark;
  const moss = P.moss;

  const bodyPath = [
    [-0.02, 1.02, -1.02],
    [0, 1.08, -0.35],
    [0, 1.13, 0.52],
    [0, 1.15, 1.25],
    [0, 1.14, 1.92],
  ];

  const body = b.sweep(bodyPath, (t) => {
    if (t < 0.2) return 0.86 + t * 1.1;
    if (t < 0.58) return 1.08 + (t - 0.2) * 0.18;
    return 1.15 - (t - 0.58) * 0.38;
  }, {
    bone: [J.body, J.shoulders],
    color: mid,
    sides: 8,
    caps: "round",
    sectors: [
      [-62, 62, high],
      [62, 118, mid],
      [118, 242, belly],
      [242, 298, mid],
    ],
    name: "torsoHull",
    group: "torso",
  });

  const skin = b.surface(body);

  // Broad armored belly scutes, arranged in overlapping rows under the chest.
  const scuteGeo = new THREE.BoxGeometry(0.34, 0.07, 0.27);
  const scuteEdgeGeo = new THREE.BoxGeometry(0.285, 0.018, 0.235);
  const scuteTs = [0.08, 0.24, 0.4, 0.56, 0.72, 0.86];
  const scuteAngles = [148, 164, 180, 196, 212];

  for (let r = 0; r < scuteAngles.length; r++) {
    for (let i = 0; i < scuteTs.length; i++) {
      const t = scuteTs[i] + (r % 2 === 0 ? 0.018 : -0.012);
      const hit = body.at(t, scuteAngles[r], 0.008);
      const plate = b.stick(scuteGeo, belly, hit, {
        embed: 0.38,
        name: `bellyScute_${r}_${i}`,
        group: "belly",
      });
      const edge = b.stick(scuteEdgeGeo, bellyShade, hit.moved([0, 0.042, 0]), {
        embed: 0.35,
        name: `bellyStep_${r}_${i}`,
        group: "belly",
      });
      void plate;
      void edge;
    }
  }

  // A second, smaller row of overlapping plates reaches forward beneath the shoulder mass.
  for (let i = 0; i < 5; i++) {
    const t = 0.42 + i * 0.105;
    const hit = body.at(t, 180, 0.01);
    b.stick(
      new THREE.BoxGeometry(0.42 - i * 0.025, 0.065, 0.22),
      belly,
      hit,
      {
        embed: 0.4,
        name: `frontScute_${i}`,
        group: "belly",
      },
    );
  }

  // Heavy dorsal spines, with a smaller pale cap on each dark root.
  for (let i = 0; i < 9; i++) {
    const t = 0.18 + i * 0.083;
    const length = 0.31 - i * 0.022;
    const radius = 0.075 - i * 0.004;
    const base = body.at(t, 0, 0.012);
    b.spike(base, base, length, radius, {
      color: hornDark,
      caps: "point",
      name: `dorsalSpike_${i}`,
      group: "dorsal",
    });
    const capBase = base.moved([0, length * 0.58, 0]);
    b.spike(capBase, capBase, length * 0.42, radius * 0.52, {
      color: horn,
      caps: "point",
      name: `dorsalTip_${i}`,
      group: "dorsal",
    });
  }

  // A few broad moss clumps break up the upper silhouette.
  const mossGeo = new THREE.IcosahedronGeometry(0.095, 0);
  const mossRng = rng(713);
  for (let i = 0; i < 13; i++) {
    const t = 0.08 + mossRng() * 0.83;
    const side = i % 3 === 0 ? 22 : i % 3 === 1 ? -18 : 0;
    const hit = body.at(t, side, 0.018);
    b.stick(mossGeo, moss, hit, {
      embed: 0.48,
      scale: [1.45, 0.42 + mossRng() * 0.3, 0.8],
      spin: mossRng() * 360,
      name: `mossScale_${i}`,
      group: "moss",
    });
  }

  // Two rune plaques per flank: an ink-black recess with three separate teal strokes.
  const runeSets = [
    { side: 1, t: 0.45, angle: 286 },
    { side: 1, t: 0.66, angle: 286 },
    { side: -1, t: 0.45, angle: 74 },
    { side: -1, t: 0.66, angle: 74 },
  ];

  for (let i = 0; i < runeSets.length; i++) {
    const rune = runeSets[i];
    const hit = body.at(rune.t, rune.angle, 0.012);
    const recess = b.stick(
      new THREE.BoxGeometry(0.34, 0.026, 0.48),
      ink,
      hit,
      {
        embed: 0.18,
        spin: rune.side * 8,
        name: `runeRecess_${i}`,
        group: "runes",
      },
    );

    const runeOrigin = hit.moved([0, 0.026, 0]);
    const strokes = [
      [0.045, 0.018, 0.31, 0],
      [0.018, 0.018, 0.18, rune.side * 0.11],
      [0.018, 0.018, 0.18, -rune.side * 0.11],
    ];

    for (let j = 0; j < strokes.length; j++) {
      const [w, h, d, z] = strokes[j];
      const stroke = b.stick(
        new THREE.BoxGeometry(w, h, d),
        teal,
        runeOrigin.moved([rune.side * (j === 0 ? 0 : 0.07), 0, z]),
        {
          embed: 0.15,
          spin: rune.side * (j === 1 ? 30 : j === 2 ? -30 : 0),
          name: `runeGlow_${i}_${j}`,
          group: "runes",
        },
      );
      glow(stroke, 2.2);
    }
    void recess;
  }

  // Iron shackle collar around the chest immediately behind the neck bases.
  const collarAt = new THREE.Vector3(0, 1.14, 1.08);
  const collar = b.part(
    new THREE.TorusGeometry(1.02, 0.105, 8, 20, Math.PI * 1.72),
    iron,
    {
      at: collarAt,
      bone: J.body,
      rotation: [Math.PI / 2, 0, Math.PI * 0.16],
      name: "brokenShackle",
      group: "iron",
    },
  );
  const collarBand = b.part(
    new THREE.TorusGeometry(0.94, 0.034, 6, 20, Math.PI * 1.72),
    ironDark,
    {
      at: new THREE.Vector3(0, 1.14, 1.075),
      bone: J.body,
      rotation: [Math.PI / 2, 0, Math.PI * 0.16],
      name: "shackleInnerBand",
      group: "iron",
    },
  );
  void collar;
  void collarBand;

  // Broken chain descending the model's left flank, with alternating link planes.
  const links = [
    [0.93, 0.82, 1.02],
    [1.08, 0.58, 0.99],
    [1.12, 0.34, 0.92],
    [1.02, 0.13, 0.82],
    [0.88, 0.035, 0.7],
  ] as const;

  for (let i = 0; i < links.length; i++) {
    const [x, y, z] = links[i];
    const link = b.part(
      new THREE.TorusGeometry(0.145 - i * 0.009, 0.036, 7, 12),
      i % 2 === 0 ? iron : ironDark,
      {
        at: [x, y, z],
        bone: J.body,
        rotation: i % 2 === 0
          ? [0, 0, Math.PI / 2]
          : [Math.PI / 2, 0, 0.18],
        name: `chainLink_${i}`,
        group: "iron",
      },
    );
    void link;
  }

  // A handful of small iron studs reinforce the shackle's broken ends.
  const studGeo = new THREE.SphereGeometry(0.065, 7, 5);
  const studs = [
    [0.88, 1.06, 1.02],
    [0.99, 0.99, 1.04],
    [1.16, 0.73, 0.98],
    [1.09, 0.29, 0.91],
    [0.83, 0.09, 0.69],
  ] as const;
  for (let i = 0; i < studs.length; i++) {
    b.part(studGeo, iron, {
      at: studs[i],
      bone: J.body,
      name: `shackleStud_${i}`,
      group: "iron",
    });
  }

  // Dark seam marks where the torso's plated armor breaks around the shoulders.
  for (const side of [-1, 1]) {
    const seam = b.stick(
      new THREE.BoxGeometry(0.025, 0.18, 0.72),
      ink,
      body.at(0.68, side * 58, 0.014),
      {
        embed: 0.45,
        spin: side * 12,
        name: `shoulderSeam_${side}`,
        group: "seams",
      },
    );
    void seam;
  }

  // Keep the declared mount explicit in the build: the neck assembly can bury into this armored crown.
  const crownMarker = b.part(
    new THREE.SphereGeometry(0.16, 8, 5),
    dark,
    {
      at: M.neckBase,
      bone: J.shoulders,
      scale: [1.35, 0.55, 1.2],
      name: "neckMountArmor",
      group: "torso",
    },
  );
  void crownMarker;
}
```

<!-- call: headsSide -->

```ts
import * as THREE from "three";
import { bezier, glow } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";

export function buildHeadsSide({ b, J, P }: Ctx) {
  const INK = P.ink;
  const SCALE = P.scaleMid;
  const DARK = P.scaleDark;
  const HIGH = P.scaleHigh;
  const HORN = P.horn;
  const HORN_DARK = P.hornDark;
  const TOOTH = P.tooth;
  const MAW = P.maw;
  const THROAT = P.throat;
  const EMBER = P.glowEmber;
  const EYE = P.eyeGlow;
  const TEAL = P.glowTeal;
  const CLAW = P.claw;

  const headPaint = cel(SCALE, DARK, { threshold: 0.08 });
  const highPaint = cel(HIGH, SCALE, { threshold: 0.02 });

  const box = (
    bone: any,
    at: any,
    size: [number, number, number],
    color: string | any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      rotation,
      flat: true,
    });

  const wedge = (
    bone: any,
    at: any,
    a: [number, number, number],
    bpt: [number, number, number],
    w0: [number, number],
    w1: [number, number],
    color: string | any,
  ) =>
    b.frustumBox(at, bpt, w0, w1, {
      bone,
      color,
      section: { ngon: 4 },
      caps: "flat",
      flat: true,
    } as any);

  const spike = (bone: any, at: any, dir: [number, number, number], len: number, r: number, color: string) =>
    b.spike(at, dir, len, r, { bone, color, caps: "point", section: { ngon: 6 } } as any);

  const rune = (h: any, scale: number, outer: boolean) => {
    const y = outer ? 0.24 : 0.29;
    const z = outer ? 0.14 : 0.19;
    const plate = box(h, h.local([0, 0.43 * scale, z]), [0.16 * scale, 0.006, 0.22 * scale], INK);
    const glowPieces = [
      box(h, h.local([0, 0.438 * scale, z + 0.055 * scale]), [0.018 * scale, 0.009, 0.09 * scale], TEAL),
      box(h, h.local([0, 0.439 * scale, z - 0.035 * scale]), [0.095 * scale, 0.009, 0.018 * scale], TEAL),
      box(h, h.local([0.045 * scale, 0.44 * scale, z + 0.012 * scale]), [0.018 * scale, 0.009, 0.075 * scale], TEAL),
    ];
    for (const p of glowPieces) glow(p, 2.2);
    return plate;
  };

  const toothRow = (owner: any, scale: number, lower: boolean) => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const u = -0.16 + i * 0.08;
      const localX = u;
      const forward = lower ? 0.26 + i * 0.026 : 0.43 - i * 0.018;
      const up = lower ? 0.045 : -0.045;
      const length = (i === 0 || i === count - 1 ? 0.13 : 0.085) * scale;
      const radius = (i === 0 || i === count - 1 ? 0.026 : 0.018) * scale;
      const p = owner.local([localX, forward * scale, up * scale]);
      const t = b.part(new THREE.ConeGeometry(radius, length, 6), TOOTH, {
        bone: owner,
        at: p,
        dir: lower ? [0, 1, 0] : [0, -1, 0],
        flat: true,
        name: lower ? "lowerFang" : "upperFang",
      });
      void t;
    }
  };

  const eyePair = (h: any, scale: number) => {
    for (const s of [-1, 1]) {
      // local +X is model-right, hence the negative sign maps s=+1 to model-left.
      const x = -s * 0.205 * scale;
      const socket = b.part(new THREE.SphereGeometry(0.064 * scale, 8, 5), INK, {
        bone: h,
        at: h.local([x, 0.405 * scale, 0.095 * scale]),
        flat: true,
        name: "eyeSocket",
      });
      const lens = b.part(new THREE.SphereGeometry(0.039 * scale, 8, 5), EYE, {
        bone: h,
        at: h.local([x, 0.438 * scale, 0.095 * scale]),
        flat: true,
        name: "emberEye",
      });
      glow(socket, 0.15);
      glow(lens, 3.5);
      // A small dark vertical pupil makes the emissive eye read at a distance.
      box(h, h.local([x, 0.475 * scale, 0.095 * scale]), [0.012 * scale, 0.008, 0.052 * scale], INK);
    }
  };

  const browHorn = (h: any, s: number, scale: number, outer: boolean) => {
    const side = -s;
    const root = h.local([side * 0.18 * scale, 0.34 * scale, 0.21 * scale]);
    const bend = h.local([side * 0.27 * scale, 0.28 * scale, 0.34 * scale]);
    const tip = h.local([side * (outer ? 0.31 : 0.36) * scale, 0.17 * scale, 0.48 * scale]);
    b.sweep(bezier(root, bend, tip), [0.052 * scale, 0.008 * scale], {
      bone: h,
      color: HORN,
      caps: { start: "round", end: "point" },
      sides: 6,
      name: "ibexBrowHorn",
    } as any);
    spike(h, root, [0, 0.25, -0.12], 0.08 * scale, 0.068 * scale, HORN_DARK);
  };

  const cheekSpikes = (h: any, scale: number) => {
    for (const s of [-1, 1]) {
      const x = -s;
      spike(h, h.local([x * 0.26 * scale, 0.29 * scale, -0.02 * scale]), [x * 0.65, 0.18, 0.72], 0.14 * scale, 0.026 * scale, CLAW);
      spike(h, h.local([x * 0.29 * scale, 0.35 * scale, -0.10 * scale]), [x * 0.8, 0.12, 0.58], 0.11 * scale, 0.022 * scale, CLAW);
    }
  };

  const outerCrest = (h: any, s: number, scale: number) => {
    const root = h.local([0, 0.16 * scale, 0.08 * scale]);
    const crest = b.extrude(
      [
        [0, -0.18 * scale],
        [0.075 * scale, -0.02 * scale],
        [0.06 * scale, 0.25 * scale],
        [0.018 * scale, 0.43 * scale],
        [-0.025 * scale, 0.22 * scale],
        [-0.06 * scale, 0.02 * scale],
      ],
      {
        at: root,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026 * scale,
        bevel: 0.008 * scale,
        color: HORN,
        bone: h,
        name: "sweptCrest",
      },
    );
    // A separate dark rim gives the crest the heavy, painted God-of-War silhouette.
    b.extrude(
      [
        [-0.075 * scale, -0.18 * scale],
        [0.075 * scale, -0.02 * scale],
        [0.06 * scale, 0.25 * scale],
        [0.018 * scale, 0.43 * scale],
        [-0.025 * scale, 0.22 * scale],
        [-0.06 * scale, 0.02 * scale],
      ],
      {
        at: root,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.031 * scale,
        bevel: 0.002,
        color: HORN_DARK,
        bone: h,
        name: "crestRim",
      },
    );
    // Re-seat the brighter blade slightly toward the viewer.
    void crest;
  };

  const buildHead = (
    name: "ML" | "MR" | "OL" | "OR",
    scale: number,
    outer: boolean,
  ) => {
    const s = name.endsWith("L") ? 1 : -1;
    const h = J[`head${name}`];
    const jaw = J[`jaw${name}`];

    // The jaw hinge is deliberately posed before any jaw-mounted geometry is authored.
    b.pose(jaw, { axis: [1, 0, 0], deg: outer ? 19 : 21 });

    // Broad skull, angular cheek plates, and a tapered armored snout.
    box(h, h.local([0, 0.13 * scale, 0.045 * scale]), [0.56 * scale, 0.43 * scale, 0.47 * scale], headPaint);
    box(h, h.local([-0.19 * scale, 0.25 * scale, 0.06 * scale]), [0.17 * scale, 0.24 * scale, 0.38 * scale], DARK);
    box(h, h.local([0.19 * scale, 0.25 * scale, 0.06 * scale]), [0.17 * scale, 0.24 * scale, 0.38 * scale], DARK);

    const snoutBase = h.local([0, 0.28 * scale, 0.02 * scale]);
    const snoutTip = h.local([0, 0.57 * scale, -0.005 * scale]);
    wedge(h, snoutBase, snoutBase, snoutTip, [0.25 * scale, 0.22 * scale], [0.17 * scale, 0.16 * scale], SCALE);

    // Brow ridge and the deep ink seam separating skull from muzzle.
    box(h, h.local([0, 0.345 * scale, 0.17 * scale]), [0.52 * scale, 0.055 * scale, 0.12 * scale], highPaint);
    box(h, h.local([0, 0.405 * scale, 0.025 * scale]), [0.39 * scale, 0.018 * scale, 0.035 * scale], INK);

    // Open upper and lower jaw shells.
    box(h, h.local([0, 0.46 * scale, -0.11 * scale]), [0.34 * scale, 0.24 * scale, 0.17 * scale], MAW);
    box(jaw, jaw.local([0, 0.16 * scale, -0.08 * scale]), [0.39 * scale, 0.26 * scale, 0.14 * scale], DARK);
    box(jaw, jaw.local([0, 0.24 * scale, -0.015 * scale]), [0.31 * scale, 0.12 * scale, 0.09 * scale], SCALE);

    // Gullet and a separate ember disc buried deep in the mouth.
    const throat = b.part(new THREE.CylinderGeometry(0.115 * scale, 0.14 * scale, 0.035 * scale, 8), THROAT, {
      bone: h,
      at: h.local([0, 0.475 * scale, -0.08 * scale]),
      dir: [0, 0, 1],
      flat: true,
      name: "throat",
    });
    const ember = b.part(new THREE.SphereGeometry(0.073 * scale, 8, 5), EMBER, {
      bone: h,
      at: h.local([0, 0.485 * scale, -0.095 * scale]),
      name: "emberGullet",
    });
    glow(throat, 0.35);
    glow(ember, 2.8);

    toothRow(h, scale, false);
    toothRow(jaw, scale, true);
    eyePair(h, scale);

    if (!outer) {
      browHorn(h, s, scale, false);
      browHorn(h, -s, scale, false);
      cheekSpikes(h, scale);
    } else {
      outerCrest(h, s, scale);
      // A small rear horn anchors the crest and breaks the outer silhouette.
      spike(h, h.local([s * 0.14 * scale, 0.08 * scale, 0.22 * scale]), [s * 0.45, 0.55, -0.2], 0.17 * scale, 0.035 * scale, HORN);
      cheekSpikes(h, scale * 0.82);
    }

    // Crown rune and two tiny forehead studs.
    rune(h, scale, outer);
    for (const q of [-1, 1]) {
      spike(h, h.local([q * 0.105 * scale, 0.36 * scale, 0.19 * scale]), [q * 0.15, 0.3, 0.94], 0.075 * scale, 0.014 * scale, TEAL);
    }

    // A dark lower lip line is deliberately independent geometry, like a painted armor seam.
    b.sweep(
      [
        jaw.local([-0.15 * scale, 0.31 * scale, 0.01 * scale]),
        jaw.local([0, 0.34 * scale, 0.015 * scale]),
        jaw.local([0.15 * scale, 0.31 * scale, 0.01 * scale]),
      ],
      0.012 * scale,
      { bone: jaw, color: INK, caps: "round", sides: 6, name: "lipSeam" } as any,
    );

    // Short horn-dark collars at the base of each brow horn.
    for (const q of [-1, 1]) {
      const p = h.local([q * 0.18 * scale, 0.345 * scale, 0.21 * scale]);
      b.part(new THREE.CylinderGeometry(0.065 * scale, 0.072 * scale, 0.035 * scale, 6), HORN_DARK, {
        bone: h,
        at: p,
        dir: [q * 0.2, 0.35, 0.9],
        flat: true,
        name: "hornRootBand",
      });
    }
  };

  buildHead("ML", 0.85, false);
  buildHead("MR", 0.85, false);
  buildHead("OL", 0.72, true);
  buildHead("OR", 0.72, true);
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const tailPath = catmull([
    M.tailRoot,
    [0, 0.98, -1.25],
    [0, 0.92, -2.35],
    [0, 1.04, -3.42],
    [0, 1.42, -4.18],
    [0, 1.82, -4.55],
  ]);

  const radiusAt = (t: number) => {
    const u = Math.max(0, Math.min(1, t));
    return 0.85 * (1 - u) + 0.12 * u;
  };

  const tail = b.sweep(tailPath, radiusAt, {
    bone: [J.body, J.tail1, J.tail2, J.tail3, J.tail4],
    color: P.scaleMid,
    section: { ngon: 8 },
    sectors: [
      [-62, 62, P.scaleDark],
      [112, 248, P.belly],
    ],
    caps: { start: "round", end: "point" },
    name: "tailBody",
    group: "tail",
  });

  // Broken, overlapping belly scutes on the broad lower half of the first section.
  const scuteTs = [0.035, 0.11, 0.19, 0.28, 0.37, 0.46, 0.55];
  for (let i = 0; i < scuteTs.length; i++) {
    const t = scuteTs[i];
    const r = radiusAt(t);
    const hit = tail.at(t, 180, 0.012);
    const plate = new THREE.BoxGeometry(
      Math.min(0.74, r * 1.48),
      0.055,
      Math.min(0.34, r * 0.68),
    );
    b.stick(plate, i % 2 ? P.bellyShade : P.belly, hit, {
      embed: 0.38,
      name: `tailScute${i}`,
      group: "tailBelly",
    });

    // A narrow dark step at the lower rim gives each plate a forged, layered edge.
    const rim = new THREE.BoxGeometry(
      Math.min(0.68, r * 1.34),
      0.018,
      0.035,
    );
    b.stick(rim, P.bellyShade, hit.moved([0, 0.018, -Math.min(0.16, r * 0.32)]), {
      embed: 0.35,
      name: `tailScuteRim${i}`,
      group: "tailBelly",
    });
  }

  // Small raised scales break up the large flat sweep without making it fuzzy.
  const scaleHits = b.surface(tail).scatter(34, {
    rng: rng(418),
    minDist: 0.13,
    filter: (h) => h.n.y > -0.28 && h.at.z < -0.45,
  });
  for (let i = 0; i < scaleHits.length; i++) {
    const h = scaleHits[i];
    const scale = new THREE.SphereGeometry(
      i % 4 === 0 ? 0.062 : 0.045,
      7,
      4,
    );
    b.stick(scale, i % 3 === 0 ? P.scaleHigh : P.scaleDark, h, {
      embed: 0.68,
      scale: [1.25, 0.42, 0.8],
      name: `tailScale${i}`,
      group: "tailScales",
    });
  }

  // Paired dorsal weapons: a dark forged root and a pale weathered tip.
  const spikeTs = [0.06, 0.14, 0.22, 0.31, 0.4, 0.49, 0.58, 0.67, 0.76, 0.84];
  for (let i = 0; i < spikeTs.length; i++) {
    const t = spikeTs[i];
    const length = 0.28 * (1 - t) + 0.06 * t;
    for (const side of [-1, 1]) {
      const hit = tail.at(t, side * 34, 0.018);
      const rootLength = length * 0.68;

      b.spike(hit, hit, rootLength, Math.max(0.022, length * 0.13), {
        color: P.hornDark,
        name: `tailDorsalRoot${i}_${side}`,
        group: "tailSpines",
      });

      const tipBase = hit.moved([0, rootLength * 0.58, 0]);
      b.spike(
        tipBase,
        tipBase,
        Math.max(0.018, length * 0.42),
        Math.max(0.009, length * 0.065),
        {
          color: P.horn,
          name: `tailDorsalTip${i}_${side}`,
          group: "tailSpines",
        },
      );
    }
  }

  // Two partial iron shackle remnants, each with a second dark inner band.
  const shackle = (t: number, index: number, fromDeg: number, toDeg: number) => {
    const centre = tailPath.at(t);
    const tangent = tailPath.tangentAt(t);
    const ringFrame = frame(centre, tangent);
    const outer = radiusAt(t) + 0.048;
    const inner = radiusAt(t) + 0.015;

    const outerRing = b.ring(ringFrame, {
      count: 13,
      radius: outer,
      fromDeg,
      toDeg,
      tilt: 0,
      name: `tailShackle${index}`,
      group: "iron",
      role: "hinge",
    });
    b.sweep(catmull(outerRing.items), 0.052, {
      bone: index === 0 ? J.tail1 : J.tail2,
      color: P.iron,
      caps: "round",
      name: `tailShackleIron${index}`,
      group: "iron",
    });

    const innerRing = b.ring(ringFrame, {
      count: 11,
      radius: inner,
      fromDeg: fromDeg + 2,
      toDeg: toDeg - 2,
      tilt: 0,
      name: `tailShackleBand${index}`,
      group: "iron",
      role: "hinge",
    });
    b.sweep(catmull(innerRing.items), 0.018, {
      bone: index === 0 ? J.tail1 : J.tail2,
      color: P.ironDark,
      caps: "round",
      name: `tailShackleDark${index}`,
      group: "iron",
    });

    // A short broken end cap emphasizes that these are remnants, not clean collars.
    const breakItem = outerRing.items[outerRing.items.length - 1];
    b.part(
      new THREE.BoxGeometry(0.105, 0.07, 0.075),
      P.ironDark,
      {
        bone: index === 0 ? J.tail1 : J.tail2,
        at: breakItem.at,
        frame: breakItem,
        scale: [1, 0.7, 0.72],
        name: `tailShackleBreak${index}`,
        group: "iron",
      },
    );
  };

  shackle(0.255, 0, 32, 315);
  shackle(0.455, 1, 48, 330);

  // Broad bone spade at the rising tip. The dark silhouette is deliberately larger
  // than the inset bone face, creating a graphic God-of-War edge.
  const finAt = [0, 1.72, -4.48] as [number, number, number];
  const finOutline: [number, number, "sharp"][] = [
    [-0.36, -0.16, "sharp"],
    [-0.26, 0.12, "sharp"],
    [-0.16, 0.31, "sharp"],
    [0, 0.43, "sharp"],
    [0.16, 0.31, "sharp"],
    [0.26, 0.12, "sharp"],
    [0.36, -0.16, "sharp"],
    [0.18, -0.08, "sharp"],
    [0, -0.02, "sharp"],
    [-0.18, -0.08, "sharp"],
  ];

  b.extrude(finOutline, {
    at: finAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.012,
    bone: J.tail4,
    color: P.hornDark,
    name: "tailSpadeDark",
    group: "tailFin",
  });

  const insetFin: [number, number, "sharp"][] = [
    [-0.30, -0.12, "sharp"],
    [-0.21, 0.13, "sharp"],
    [-0.12, 0.27, "sharp"],
    [0, 0.36, "sharp"],
    [0.12, 0.27, "sharp"],
    [0.21, 0.13, "sharp"],
    [0.30, -0.12, "sharp"],
    [0.14, -0.055, "sharp"],
    [0, 0, "sharp"],
    [-0.14, -0.055, "sharp"],
  ];

  b.extrude(insetFin, {
    at: [0, 1.735, -4.485],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.09,
    bevel: 0.009,
    bone: J.tail4,
    color: P.horn,
    name: "tailSpadeBone",
    group: "tailFin",
  });

  // Three simple rune strokes sit on the forward face of the fin.
  const runeZ = -4.535;
  const rune1 = glow(
    b.part(new THREE.BoxGeometry(0.035, 0.23, 0.018), P.glowTeal, {
      bone: J.tail4,
      at: [0, 1.91, runeZ],
      name: "tailRuneStem",
      group: "runes",
    }),
    2.2,
  );
  const rune2 = glow(
    b.part(new THREE.BoxGeometry(0.19, 0.028, 0.018), P.glowTeal, {
      bone: J.tail4,
      at: [0, 1.98, runeZ],
      rotation: [0, 0, -28],
      name: "tailRuneArm",
      group: "runes",
    }),
    2.2,
  );
  const rune3 = glow(
    b.part(new THREE.BoxGeometry(0.14, 0.024, 0.018), P.glowTeal, {
      bone: J.tail4,
      at: [0, 1.82, runeZ],
      rotation: [0, 0, 28],
      name: "tailRuneLower",
      group: "runes",
    }),
    2.2,
  );

  void rune1;
  void rune2;
  void rune3;

  // A few dark seams at the tail's major bends make the joint rhythm readable.
  for (let i = 0; i < 4; i++) {
    const t = 0.12 + i * 0.17;
    const centre = tailPath.at(t);
    const tangent = tailPath.tangentAt(t);
    const seamFrame = frame(centre, tangent);
    const seam = b.ring(seamFrame, {
      count: 10,
      radius: radiusAt(t) + 0.006,
      fromDeg: 112,
      toDeg: 248,
      tilt: 0,
      name: `tailSeam${i}`,
      group: "seams",
    });
    b.sweep(catmull(seam.items), 0.012, {
      bone: i < 2 ? J.tail1 : J.tail2,
      color: P.ink,
      caps: "round",
      name: `tailSeamInk${i}`,
      group: "seams",
    });
  }

  return tail;
}
```

<!-- call: headsCentral -->

```ts
import * as THREE from "three";
import { bezier, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsCentral({ b, J, P, M }: Ctx) {
  const head = J.headC;
  const jaw = J.jawC;

  const SCALE = P.scaleMid;
  const DARK = P.scaleDark;
  const HIGH = P.scaleHigh;
  const HORN = P.horn;
  const HORN_DARK = P.hornDark;
  const CLAW = P.claw;
  const TOOTH = P.tooth;
  const MAW = P.maw;
  const THROAT = P.throat;
  const TEAL = P.glowTeal;
  const EMBER = P.glowEmber;
  const EYE = P.eyeGlow;
  const INK = P.ink;
  const CREST = P.membrane;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any = head,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
      group: "headsCentral",
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    bone: any = head,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      flat: true,
      name,
      group: "headsCentral",
    });

  const tube = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number | [number, number],
    color: string,
    bone: any = head,
    name?: string,
  ) =>
    b.capsule(a, z, radius, {
      color,
      bone,
      sides: 7,
      flat: true,
      name,
      group: "headsCentral",
    });

  const pointed = (
    base: [number, number, number],
    direction: [number, number, number],
    length: number,
    radius: number,
    color: string,
    bone: any = head,
    name?: string,
  ) =>
    b.spike(base, direction, length, radius, {
      color,
      bone,
      sides: 7,
      name,
      group: "headsCentral",
    });

  // ---------------------------------------------------------------------------
  // Angular cranium: layered slabs give the skull a deliberately forged,
  // God-of-War silhouette rather than a smooth animal sphere.
  // ---------------------------------------------------------------------------

  box([0.62, 0.52, 0.62], [0, 3.72, 2.72], SCALE, head, [0, 0, 0], "centralSkullCore");
  box([0.70, 0.25, 0.42], [0, 3.92, 2.66], HIGH, head, [0, 0, 0], "centralBrowMass");
  box([0.50, 0.38, 0.34], [0, 3.54, 2.72], DARK, head, [0, 0, 0], "centralSkullUnderside");

  // Broad cheek plates and temple wedges.
  for (const s of [-1, 1]) {
    box(
      [0.16, 0.36, 0.48],
      [s * 0.30, 3.67, 2.83],
      DARK,
      head,
      [0, s * 10, s * 5],
      `centralCheek${s}`,
    );
    box(
      [0.11, 0.22, 0.40],
      [s * 0.34, 3.82, 2.70],
      HIGH,
      head,
      [0, s * 15, s * 4],
      `centralTemple${s}`,
    );
    tube(
      [s * 0.28, 3.91, 2.46],
      [s * 0.28, 3.91, 2.99],
      0.018,
      INK,
      head,
      `centralTempleSeam${s}`,
    );
  }

  // Blunt, tapering upper muzzle.
  b.frustumBox(
    [0, 3.72, 2.94],
    [0, 3.70, 3.48],
    [0.47, 0.35],
    [0.33, 0.24],
    {
      color: SCALE,
      bone: head,
      section: "box",
      flat: true,
      name: "centralUpperMuzzle",
      group: "headsCentral",
    },
  );

  // Pale/high planes on the muzzle and a heavy ink seam at its root.
  box([0.42, 0.10, 0.30], [0, 3.87, 3.19], HIGH, head, [0, 0, 0], "centralMuzzleRidge");
  tube([0, 3.54, 2.91], [0, 3.89, 2.91], 0.018, INK, head, "centralSkullMuzzleSeam");
  tube([-0.30, 3.54, 3.11], [0.30, 3.54, 3.11], 0.014, INK, head, "centralMouthCornerLine");

  // Nose plate and nostrils.
  box([0.28, 0.14, 0.16], [0, 3.70, 3.49], DARK, head, [0, 0, 0], "centralNosePlate");
  for (const s of [-1, 1]) {
    const nostril = sphere(0.027, [s * 0.085, 3.735, 3.575], INK, head, `centralNostril${s}`);
    void nostril;
  }

  // ---------------------------------------------------------------------------
  // Open mouth. The roof is an independent dark wedge; the lower jaw rides
  // jawC, leaving a conspicuous red-black gap between upper and lower jaws.
  // ---------------------------------------------------------------------------

  b.frustumBox(
    [0, 3.58, 2.98],
    [0, 3.57, 3.43],
    [0.39, 0.10],
    [0.27, 0.075],
    {
      color: MAW,
      bone: head,
      section: "box",
      flat: true,
      name: "centralMawRoof",
      group: "headsCentral",
    },
  );

  // Throat backplate and ember deep in the gullet.
  box([0.30, 0.20, 0.12], [0, 3.48, 2.97], THROAT, head, [0, 0, 0], "centralThroatPlate");
  const ember = sphere(0.075, [0, 3.51, 3.04], EMBER, head, "centralEmberGullet");
  glow(ember, 2.2);

  // Lower jaw: a strong diagonal slab from the hinge toward the open muzzle.
  b.frustumBox(
    [0, 3.53, 2.78],
    [0, 3.28, 3.40],
    [0.40, 0.16],
    [0.29, 0.12],
    {
      color: DARK,
      bone: jaw,
      section: "box",
      flat: true,
      name: "centralLowerJaw",
      group: "headsCentral",
    },
  );
  box([0.40, 0.07, 0.24], [0, 3.33, 3.18], MAW, jaw, [22, 0, 0], "centralLowerMouth");
  tube([0, 3.52, 2.82], [0, 3.30, 3.34], 0.017, INK, jaw, "centralLowerJawSeam");

  // Six upper teeth per side, largest at the front.
  const toothXs = [-0.205, -0.13, -0.055, 0.055, 0.13, 0.205];
  for (const s of [-1, 1]) {
    for (let i = 0; i < toothXs.length; i++) {
      const x = s * Math.abs(toothXs[i]);
      const z = 3.02 + i * 0.075;
      const len = 0.17 - i * 0.014;
      pointed(
        [x, 3.58, z],
        [0, -1, 0],
        len,
        0.030 - i * 0.002,
        TOOTH,
        head,
        `centralUpperFang${s}_${i}`,
      );
    }

    // Lower row points upward, following the jaw's slant.
    for (let i = 0; i < toothXs.length - 1; i++) {
      const x = s * Math.abs(toothXs[i]);
      const z = 3.08 + i * 0.075;
      pointed(
        [x, 3.37, z],
        [0, 0.92, 0.28],
        0.115 - i * 0.009,
        0.022,
        TOOTH,
        jaw,
        `centralLowerFang${s}_${i}`,
      );
    }
  }

  // A pair of oversized front canines anchors the silhouette.
  pointed([-0.22, 3.59, 3.39], [0, -1, 0], 0.24, 0.042, TOOTH, head, "centralFrontFangL");
  pointed([0.22, 3.59, 3.39], [0, -1, 0], 0.24, 0.042, TOOTH, head, "centralFrontFangR");

  // ---------------------------------------------------------------------------
  // Eye sockets, glowing lenses and brow ridges.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    tube(
      [s * 0.145, 3.88, 3.015],
      [s * 0.275, 3.88, 3.015],
      0.035,
      INK,
      head,
      `centralEyeSocket${s}`,
    );

    const eye = b.part(new THREE.SphereGeometry(0.060, 10, 6), EYE, {
      at: [s * 0.185, 3.88, 3.045],
      bone: head,
      dir: [0, 0, 1],
      flat: true,
      name: `centralEyeGlow${s}`,
      group: "headsCentral",
    });
    glow(eye, 2.8);

    sphere(0.020, [s * 0.185, 3.885, 3.102], "#fff3a0", head, `centralEyeHighlight${s}`);

    // Heavy brow ledges angled inward toward the nose.
    b.frustumBox(
      [s * 0.10, 4.00, 2.91],
      [s * 0.31, 3.96, 2.98],
      [0.12, 0.10],
      [0.13, 0.08],
      {
        color: HIGH,
        bone: head,
        section: "box",
        flat: true,
        name: `centralBrowRidge${s}`,
        group: "headsCentral",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Paired swept brow horns: dark root collars, pale faceted horn curves,
  // and short ridge studs that make the horns read at a distance.
  // ---------------------------------------------------------------------------

  const hornPaths: any[] = [];
  for (const s of [-1, 1]) {
    const base: [number, number, number] = [s * 0.22, 4.00, 2.73];
    const p1: [number, number, number] = [s * 0.34, 4.10, 2.55];
    const p2: [number, number, number] = [s * 0.43, 4.20, 2.40];
    const tip: [number, number, number] = [s * 0.31, 4.18, 2.25];

    tube(base, [s * 0.28, 4.04, 2.63], 0.075, HORN_DARK, head, `centralHornRoot${s}`);
    const horn = b.sweep(
      bezier(base, p1, p2, tip),
      [0.060, 0.012],
      {
        color: HORN,
        bone: head,
        sides: 7,
        caps: { start: "round", end: "point" },
        name: `centralBrowHorn${s}`,
        group: "headsCentral",
      },
    );
    hornPaths.push(horn);

    b.along(horn, 4, (at: any) =>
      b.spike(at, [0, 0.35, -1], 0.055, 0.014, {
        color: HORN_DARK,
        bone: head,
        name: `centralHornRidge${s}`,
        group: "headsCentral",
      }),
    );
  }

  // Small jawline horns and cheek studs.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      pointed(
        [s * (0.29 + i * 0.025), 3.51 - i * 0.09, 2.94 + i * 0.11],
        [s * 0.30, -0.10, -0.95],
        0.105 - i * 0.012,
        0.026 - i * 0.003,
        HORN,
        head,
        `centralJawHorn${s}_${i}`,
      );
    }
    pointed(
      [s * 0.34, 3.70, 2.91],
      [s * 0.65, 0.25, 0.75],
      0.105,
      0.025,
      CLAW,
      head,
      `centralCheekStud${s}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Crown rune: a dark recessed plate with three separate luminous strokes.
  // ---------------------------------------------------------------------------

  box([0.23, 0.018, 0.31], [0, 4.035, 2.72], INK, head, [0, 0, 0], "centralRuneRecess");

  const runeStroke = (
    size: [number, number],
    at: [number, number, number],
    rot: [number, number, number],
    name: string,
  ) => {
    const r = b.part(new THREE.BoxGeometry(size[0], size[1], 0.012), TEAL, {
      at,
      bone: head,
      rotation: rot,
      flat: true,
      name,
      group: "headsCentral",
    });
    glow(r, 2.4);
    return r;
  };

  runeStroke([0.035, 0.19], [-0.055, 4.055, 2.72], [0, 0, -12], "centralRuneLeft");
  runeStroke([0.035, 0.19], [0.055, 4.055, 2.72], [0, 0, 12], "centralRuneRight");
  runeStroke([0.12, 0.030], [0, 4.10, 2.72], [0, 0, 0], "centralRuneCrown");

  // ---------------------------------------------------------------------------
  // Frayed red crest web between the rear horn roots. Slightly thickened
  // membrane edges keep it visible in a low-poly render.
  // ---------------------------------------------------------------------------

  const crestLeft = [
    [-0.34, 4.08, 2.48],
    [-0.22, 4.24, 2.39],
    [-0.10, 4.15, 2.33],
  ] as [number, number, number][];

  const crestRight = [
    [0.34, 4.08, 2.48],
    [0.22, 4.24, 2.39],
    [0.10, 4.15, 2.33],
  ] as [number, number, number][];

  b.membrane(crestLeft, crestRight, {
    color: CREST,
    bone: head,
    rows: 3,
    cols: 5,
    thickness: 0.012,
    scallop: 0.18,
    name: "centralFrayedCrest",
    group: "headsCentral",
  });

  // Dark ragged edge strands over the crest.
  tube([-0.34, 4.08, 2.48], [0, 4.25, 2.38], 0.012, HORN_DARK, head, "centralCrestEdgeL");
  tube([0.34, 4.08, 2.48], [0, 4.25, 2.38], 0.012, HORN_DARK, head, "centralCrestEdgeR");

  // A final pair of small teal studs at the crest roots ties the head rune
  // language to the larger body's glowing sigils.
  for (const s of [-1, 1]) {
    const stud = b.part(new THREE.SphereGeometry(0.025, 7, 5), TEAL, {
      at: [s * 0.34, 4.08, 2.49],
      bone: head,
      flat: true,
      name: `centralCrestRune${s}`,
      group: "headsCentral",
    });
    glow(stud, 2.2);
  }
}
```