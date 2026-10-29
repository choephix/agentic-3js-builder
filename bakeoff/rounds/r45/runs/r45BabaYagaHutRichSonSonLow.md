<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut",
  "description": "A folk-art diorama of Baba Yaga's log hut standing on two giant chicken legs on a round earth plinth, with a skull fence, a painted carved gable and a glowing window.",
  "builderName": "babaYagaHut",
  "size": [6.6, 5.8, 6.6],
  "layout": "Front is +Z. A round earth plinth (radius 3.3, top at y=0.25) is the diorama base. On it stands the hut on two big yellow chicken legs (x=±0.9), toes spread forward and one back toe, with feathered orange thigh puffs under the floor. The log cabin is a 3.2 x 3.2 m square (x,z ±1.6 including notched corner log ends), floor at y=1.8, walls up to y=3.8, and it faces +Z. The door is centred on the front wall. A small porch deck and a steep stair come out of the door and run down to the plinth at z≈3.0, between the legs. A steep gable roof with its ridge along Z, eaves at y=3.75 and ridge at y≈5.2, has carved horse-head 'konyok' finials at both ridge ends, a painted front gable (fronton) with a sun rosette and a round glowing window, and a brick chimney on the right-back with smoke puffs. A ring of bone-pale skulls on pointed stakes fences the plinth edge (radius 2.9) from the back round to both sides, with a gap in front for the stair. Mushrooms, grass tufts, a mortar and a broom sit near the edge. Slavic folk art style: bold flat colour, a limited red, gold, blue, teal, cream and black palette. Everything is outlined or trimmed in contrasting small parts: carved zigzag and comb bargeboards, rosettes, stylised tulips and rooster motifs painted as small parts on the trim, the gable and the shutters. The wood is warm brown with pale cut log ends. The proportions are chunky and slightly toy-like, and the legs are oversized and characterful. Every part uses the shared motifs: the 8-petal sun rosette (gold centre, red petals, white dots), the zigzag border (red/white) and the tulip (red with green leaves).",
  "palette": {
    "logDark": "#6b3f22",
    "logMid": "#8a5530",
    "logLight": "#b07a46",
    "logEnd": "#e0b277",
    "roofWood": "#5a3a24",
    "shingleTeal": "#1f8a7a",
    "shingleBlue": "#2a5db0",
    "folkRed": "#d3302b",
    "folkGold": "#f2b630",
    "folkWhite": "#f6ecd2",
    "folkBlack": "#1c1612",
    "folkGreen": "#3f8f3a",
    "legYellow": "#e8b43a",
    "legScale": "#c98b24",
    "claw": "#4a3322",
    "featherOrange": "#d9692a",
    "featherLight": "#f0b25a",
    "glowWarm": "#ffb347",
    "earth": "#4a3a2a",
    "grass": "#4e7d3a",
    "grassLight": "#7aa84a",
    "bone": "#eee3c8",
    "stone": "#8b8a86",
    "smoke": "#cfc8c0"
  },
  "mounts": {
    "plinthTop": [0, 0.25, 0],
    "hutRoot": [0, 1.8, 0],
    "cabinSill": [0, 1.8, 0],
    "cabinFloorTop": [0, 1.95, 0],
    "doorCentre": [0, 1.95, 1.6],
    "porchDeckFront": [0, 1.95, 2.2],
    "stairFoot": [0, 0.25, 3.0],
    "eavesLine": [0, 3.8, 0],
    "frontGableBase": [0, 3.8, 2.0],
    "ridgeFront": [0, 5.2, 2.2],
    "ridgeBack": [0, 5.2, -2.2],
    "chimneyBase": [0.9, 4.4, -0.9],
    "legHipL": [0.85, 1.75, -0.1],
    "legHipR": [-0.85, 1.75, -0.1],
    "footL": [0.9, 0.3, 0.2],
    "footR": [-0.9, 0.3, 0.2]
  },
  "joints": [
    { "name": "ground", "at": [0, 0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "hut", "parent": "ground", "at": [0, 1.8, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "hipL", "parent": "hut", "at": [0.85, 1.75, -0.1], "dir": [0.05, -0.5, 0.55], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.9, 1.25, 0.45], "dir": [0, -0.6, -0.45], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.9, 0.6, 0.05], "dir": [0, -0.3, 0.15], "role": "leg", "group": "legs" },
    { "name": "footL", "parent": "ankleL", "at": [0.9, 0.3, 0.2], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeMidL", "parent": "footL", "at": [0.9, 0.33, 0.2], "dir": [0, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeInL", "parent": "footL", "at": [0.9, 0.33, 0.2], "dir": [-0.45, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeOutL", "parent": "footL", "at": [0.9, 0.33, 0.2], "dir": [0.45, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeBackL", "parent": "footL", "at": [0.9, 0.33, 0.2], "dir": [0, 0, -1], "role": "digit", "group": "legs" },
    { "name": "hipR", "parent": "hut", "at": [-0.85, 1.75, -0.1], "dir": [-0.05, -0.5, 0.55], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.9, 1.25, 0.45], "dir": [0, -0.6, -0.45], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.9, 0.6, 0.05], "dir": [0, -0.3, 0.15], "role": "leg", "group": "legs" },
    { "name": "footR", "parent": "ankleR", "at": [-0.9, 0.3, 0.2], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeMidR", "parent": "footR", "at": [-0.9, 0.33, 0.2], "dir": [0, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeInR", "parent": "footR", "at": [-0.9, 0.33, 0.2], "dir": [0.45, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeOutR", "parent": "footR", "at": [-0.9, 0.33, 0.2], "dir": [-0.45, 0, 1], "role": "digit", "group": "legs" },
    { "name": "toeBackR", "parent": "footR", "at": [-0.9, 0.33, 0.2], "dir": [0, 0, -1], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "base",
      "builds": "The diorama ground on joint ground. A low faceted round plinth (radius 3.3, y 0 to 0.25, about 14 sides) in earth, with a slightly smaller grass-coloured top disc and darker earth rim stones around the edge. Scatter grass tufts (grass / grassLight cones and blades) over the top, and a few folk-style flowers (folkRed or folkGold petals, folkGreen stem). The skull fence: about 14 stakes (logDark pointed posts, 1.1 to 1.4 m tall, leaning slightly) on a circle of radius 2.9 covering the whole circle except the front gap within ±28° of +Z (the stair). Each stake is topped with a bone skull (sphere cranium, small box jaw, dark eye sockets) and about half of the skulls have glowWarm eyes. Short crossbars of logMid join neighbouring stakes at y≈0.7. Also: three or four fly-agaric mushrooms (folkRed caps with folkWhite dots, folkWhite stems) near the back-left of the plinth, a small mortar (stone lathe) with a pestle at the right front (x≈2.0, z≈1.8), a besom broom leaning on the fence at the left (logLight handle, featherLight twig bundle bound with folkRed), and a stump. Keep everything out of the area under the hut (|x|<1.8, |z|<1.8) except the legs' own footprints and the stair at x≈0, z 2.1 to 3.0. Nothing may rise above y=1.6.",
      "box": [[-3.3, 0, -3.3], [3.3, 1.6, 3.3]],
      "attaches": "Top face at mount plinthTop (y=0.25): the legs' toes rest on it and the stair ends on it at stairFoot. Rides joint ground.",
      "joints": ["ground"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "legs",
      "builds": "The two giant chicken legs, mirrored in x, rigged on hipL/kneeL/ankleL/footL/toes (and the R equivalents) at the positions in the joints list; thighs are a little forward-angled and the shins plunge down to the foot, a bird rest pose with all four toes separated. Each leg has a big feathered thigh puff (a cluster of overlapping featherOrange and featherLight teardrop blades or flattened spheres, 12–18 per leg, hanging from the hip under the cabin floor at y≈1.4–1.85), a legYellow tubular upper shin and a lower tarsus with stacked legScale scale ridges (small flat plates or rings, 6–8 per tarsus), a bulging knee/ankle joint knob, and a rear spur (small claw cone). The foot has three front toes (mid, in, out) and one back toe, each a tapering legYellow tube made of two or three segments with knuckle bumps and legScale scutes on top, ending in a thick curved claw cone (claw colour) pressing on the plinth top. Toes lie almost flat at y≈0.28–0.4 and fan out in a clear 'bird foot'. The hip tops are hidden under the cabin sill at y 1.8–1.9. Also add two thick folkRed painted ankle bands (rings) as the folk-art accent on each tarsus. The legs must be oversized, chunky and characterful, with the thigh puff about 0.5 m wide.",
      "box": [[-1.5, 0.25, -0.55], [1.5, 1.9, 1.2]],
      "attaches": "Hips at mounts legHipL/legHipR touch the underside of cabinSill (y=1.8); feet at footL/footR rest on plinthTop. The stair at x≈0 passes between the legs, so keep the inner toes at |x|>=0.45.",
      "joints": ["hipL", "kneeL", "ankleL", "footL", "toeMidL", "toeInL", "toeOutL", "toeBackL", "hipR", "kneeR", "ankleR", "footR", "toeMidR", "toeInR", "toeOutR", "toeBackR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cabin",
      "builds": "The log cabin body on joint hut, from the sill at y=1.8 to the eaves line at y=3.8. A sill frame of two layers of thick logDark logs at y 1.8–1.95 (floor top at 1.95). Walls are stacked horizontal round logs (radius ≈0.125, 8 courses) on all four sides, alternating logMid / logLight / logDark. The log ends project 0.12 beyond each corner in a notched crossing pattern, each end capped with a pale logEnd disc with a darker ring detail. The front wall faces +Z at z=1.5. A centred door (width 0.95, y 1.95 to 3.45) made of vertical planks in logMid with folkBlue painted panels, folkGold iron straps and hinges, a round folkGold handle and a folkRed tulip painted on each panel; the door frame is carved logLight with a zigzag red/white border. Above the door sit lintel logs up to the eaves. Two small windows flank the door on the front wall (x=±1.05, y 2.75 to 3.3, glowWarm glass with folkBlack cross muntins) with carved nalichniki frames (folkWhite carved boards with folkRed zigzag and little folkBlue rosettes) and folkTeal shutters painted with folkGold stars. Each side wall (x=±1.5) has a larger window (z≈0.1, y 2.6 to 3.4) with the same carved frame, shutters and a flower box with tulips. The back wall has one round-top window with shutters. Window glass is glowWarm. The top plate at y≈3.8 carries cross-log ends. Every wall detail is a seated small part in its own colour. The cabin's inner volume is a box core in logDark (hidden behind the logs) so that no gaps show.",
      "box": [[-1.65, 1.8, -1.65], [1.65, 3.85, 1.65]],
      "attaches": "Sits on the legs at cabinSill (y=1.8). The porch connects at doorCentre (front wall z=1.6 including log ends) and cabinFloorTop. The roof sits on the eavesLine (y=3.8). Rides joint hut.",
      "joints": ["hut"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "porch",
      "builds": "The porch and stair on joint hut, in front of the door. A porch deck of planks (logLight / logMid alternating boards) from z=1.6 to z=2.2 at y 1.8 to 1.95, x ±1.1, with end-grain beams under it. Two carved posts (logDark with folkRed and folkGold bands, bulb tops) at x=±1.05, z=2.15 rise to 3.3 and hold a small shed canopy (a tilted board roof, y 3.25 to 3.6, z 1.6 to 2.4, shingle strips in shingleTeal and shingleBlue with a folkRed carved zigzag edge board). A balustrade of turned balusters (folkWhite with folkRed caps) with a logMid handrail on both sides of the deck and of the stair, height 0.7 above the tread. A steep stair of 7 plank treads (logLight, with folkRed front edge strips) descends from the deck front edge (porchDeckFront, y 1.95, z 2.2) to stairFoot (y 0.25, z 3.0), x ±0.45, with two logDark stringers. The stair sits between the legs, so keep clear of |x|>0.55 below y=1.9. Hanging details on the canopy and posts: a string of folkWhite onion-like bulbs on a rope, a string of dried red mushrooms, bunches of herbs (folkGreen, folkGold), and a skull lantern (bone skull with glowWarm eyes) hanging from the canopy at x=-0.9. A small folkBlue-and-folkRed painted rooster plaque on the canopy front board, made from small extruded parts.",
      "box": [[-1.3, 0.25, 1.5], [1.3, 3.65, 3.1]],
      "attaches": "Deck back edge meets the cabin front wall at doorCentre (z≈1.6); stair foot rests at stairFoot on plinthTop. The canopy stays below the roof's front eave at y≈3.75.",
      "joints": ["hut"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "roof",
      "builds": "The steep gable roof and everything above the eaves on joint hut. Two roof slopes made of overlapping shingle rows (alternating shingleTeal and shingleBlue scalloped rows with folkRed edging on every third row) meeting at the ridge (y≈5.2, ridge along Z, z from -2.2 to 2.2), the eaves at y 3.75 with half-width 2.1 at the sides, front and back overhang to z=±2.3. A thick logDark ridge log with a carved folkGold zigzag. At each ridge end a horse-head finial (konyok), a chunky stylised carved horse head about 0.6 m tall in logLight with a folkRed mane, folkGold eye and folkBlack nostril, built from small extrudes and boxes. The front gable (fronton, triangle at z≈2.0, from y 3.8 to 5.1) is vertical planks in logMid with a large 8-petal sun rosette (folkGold centre, folkRed petals, folkWhite dot border) around a round glowWarm window (radius 0.28) framed in folkWhite carved board. On both sides of the rosette, folkBlue tulip and folkGreen leaf motifs. Carved bargeboards (pritselina) run along the front and back rake edges, lace-cut folkWhite boards with folkRed comb teeth and folkBlue circles hanging below, with a pendant (podvesa) at the bottom of the gable. The back gable is simpler: planks with a small rosette. Rafter ends in logDark under the eaves on both sides. A brick-red chimney (folkRed bricks, folkBlack top, a stone cap) at chimneyBase (x=0.9, z=-0.9) rising through the slope to y≈5.5, with four rounded smoke puffs (smoke colour, spheres getting bigger) rising to y≈5.8. Small moss clumps (grass) along the lower shingle rows.",
      "box": [[-2.25, 3.7, -2.35], [2.25, 5.8, 2.45]],
      "attaches": "Rests on the cabin top plate at eavesLine (y=3.8); the front gable base is at frontGableBase; ridge finials at ridgeFront and ridgeBack; chimney at chimneyBase. Rides joint hut. The porch canopy sits below the front eave.",
      "joints": ["hut"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const RED = P.folkRed;
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  const ball = (at: number[], rad: number, col: string, bone: any, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(rad, 8, 6), col, { bone, at, scale: sc, flat: true });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = J["hip" + S], knee = J["knee" + S], ankle = J["ankle" + S], foot = J["foot" + S];
    const hp = [s * 0.85, 1.75, -0.1];
    const kp = [s * 0.9, 1.25, 0.45];
    const ap = [s * 0.9, 0.6, 0.05];
    const fp = [s * 0.9, 0.3, 0.2];

    // thigh and shin
    b.rod(hp, kp, 0.2, P.legYellow, { bone: hip, sides: 8 });
    b.rod(kp, ap, [0.17, 0.13], P.legYellow, { bone: knee, sides: 8 });
    b.rod(ap, fp, 0.12, P.legYellow, { bone: ankle, sides: 8 });
    ball(kp, 0.24, P.legYellow, knee);
    ball(ap, 0.18, P.legYellow, ankle);
    ball(fp, 0.17, P.legYellow, foot);

    // scale ridges on tarsus
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.12;
      const p = [s * 0.9, 0.6 - t * 0.3 * 2.0 * 0.5 + 0, 0.05 + 0.15 * t];
      p[1] = 0.6 + (0.3 - 0.6) * t;
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.035, 8), P.legScale, { bone: ankle, at: p });
    }
    // red bands
    for (const t of [0.3, 0.65]) {
      b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.07, 10), RED, {
        bone: ankle, at: [s * 0.9, 0.6 - 0.3 * t, 0.05 + 0.15 * t],
      });
    }
    // spur
    b.spike([s * 0.9, 0.45, -0.02], [0, -0.4, -1], 0.22, 0.05, { bone: ankle, color: P.claw, sides: 6 });

    // thigh puff
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const ring = i % 2;
      const rad = 0.17 + ring * 0.07;
      const at = [s * 0.85 + Math.cos(a) * rad, 1.62 - ring * 0.2 + r() * 0.08, -0.1 + Math.sin(a) * rad + 0.1];
      ball(at, 0.17, i % 3 === 0 ? P.featherLight : P.featherOrange, hip, [1, 1.5, 1]);
    }
    ball([s * 0.85, 1.7, 0], 0.3, P.featherOrange, hip, [1, 0.8, 1]);

    // toes
    const toes: [string, number[]][] = [
      ["toeMid" + S, [0, 0, 1]],
      ["toeIn" + S, [-s * 0.45, 0, 1]],
      ["toeOut" + S, [s * 0.45, 0, 1]],
      ["toeBack" + S, [0, 0, -1]],
    ];
    for (const [name, d] of toes) {
      const j = J[name];
      const dir = V(d).normalize();
      const back = d[2] < 0;
      const len = back ? 0.4 : 0.62;
      const base = V([s * 0.9, 0.33, 0.2]);
      const p1 = base.clone().addScaledVector(dir, len * 0.5);
      const p2 = base.clone().addScaledVector(dir, len);
      b.rod(base, p1, [0.11, 0.09], P.legYellow, { bone: j, sides: 6 });
      b.rod(p1, p2, [0.09, 0.07], P.legYellow, { bone: j, sides: 6 });
      ball(p1.toArray(), 0.1, P.legYellow, j);
      for (let k = 0; k < 3; k++) {
        const q = base.clone().addScaledVector(dir, len * (0.2 + k * 0.28));
        b.part(new THREE.BoxGeometry(0.1, 0.03, 0.07), P.legScale, {
          bone: j, at: [q.x, q.y + 0.09 - k * 0.012, q.z], dir: d, axis: "z",
        });
      }
      const tip = p2.clone().addScaledVector(dir, 0.22);
      tip.y -= 0.04;
      b.spike(p2, tip, null, 0.075, { bone: j, color: P.claw, sides: 6 });
    }
  }
}
```

<!-- call: base -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBase({ b, J, P, M }: Ctx) {
  const g = J.ground;
  const R = rng(11);
  const part = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: g, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s: number) => new THREE.CylinderGeometry(rt, rb, h, s);

  // plinth
  part(cyl(3.3, 3.3, 0.25, 14), P.earth, [0, 0.125, 0]);
  part(cyl(3.1, 3.1, 0.06, 14), P.grass, [0, 0.26, 0]);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    part(new THREE.DodecahedronGeometry(0.17 + R() * 0.05, 0), i % 2 ? P.stone : P.logDark,
      [Math.sin(a) * 3.2, 0.2, Math.cos(a) * 3.2], { scale: [1, 0.7, 1] });
  }

  // grass tufts
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2, r = 1 + R() * 2;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.abs(x) < 1.8 && Math.abs(z) < 1.8) continue;
    if (Math.abs(x) < 0.6 && z > 1.8) continue;
    for (let k = 0; k < 3; k++)
      part(new THREE.ConeGeometry(0.04, 0.22 + R() * 0.12, 4), k % 2 ? P.grassLight : P.grass,
        [x + (k - 1) * 0.05, 0.4, z + (R() - 0.5) * 0.06], { rotation: [(R() - 0.5) * 30, 0, (R() - 0.5) * 30] });
  }

  // flowers
  const fl = [[-2.2, 1.4], [2.3, -1.2], [-1.0, 2.5], [1.6, 2.4], [2.2, 0.6]];
  fl.forEach(([x, z], i) => {
    part(cyl(0.015, 0.015, 0.35, 5), P.folkGreen, [x, 0.43, z]);
    const c = i % 2 ? P.folkGold : P.folkRed;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      part(new THREE.SphereGeometry(0.05, 5, 4), c, [x + Math.sin(a) * 0.06, 0.62, z + Math.cos(a) * 0.06]);
    }
    part(new THREE.SphereGeometry(0.04, 5, 4), P.folkBlack, [x, 0.63, z]);
  });

  // skull fence
  const N = 14;
  const stakes: number[][] = [];
  for (let i = 0; i < N; i++) {
    const deg = 28 + 4 + (i / (N - 1)) * (360 - 64);
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * 2.9, z = Math.cos(a) * 2.9;
    const h = 1.1 + R() * 0.3;
    const tilt = (R() - 0.5) * 8;
    stakes.push([x, z, h]);
    part(cyl(0.06, 0.08, h, 6), P.logDark, [x, 0.25 + h / 2 - 0.05, z], { rotation: [tilt, 0, tilt] });
    part(new THREE.ConeGeometry(0.06, 0.2, 6), P.logDark, [x, 0.25 + h + 0.03, z]);
    const sy = 0.25 + h + 0.2;
    const out = [Math.sin(a), Math.cos(a)];
    part(new THREE.SphereGeometry(0.17, 8, 6), P.bone, [x, sy, z], { scale: [1, 0.95, 1.05] });
    part(new THREE.BoxGeometry(0.16, 0.09, 0.14), P.bone, [x + out[0] * 0.05, sy - 0.15, z + out[1] * 0.05], { rotation: [0, deg, 0] });
    const glowy = i % 2 === 0;
    for (const s of [-1, 1]) {
      const ex = x + out[0] * 0.13 + out[1] * 0.065 * s;
      const ez = z + out[1] * 0.13 - out[0] * 0.065 * s;
      part(new THREE.SphereGeometry(0.045, 5, 4), glowy ? P.glowWarm : P.folkBlack, [ex, sy + 0.01, ez]);
    }
    part(new THREE.BoxGeometry(0.03, 0.05, 0.03), P.folkBlack, [x + out[0] * 0.17, sy - 0.06, z + out[1] * 0.17]);
  }
  for (let i = 0; i < N - 1; i++) {
    const [x1, z1] = stakes[i], [x2, z2] = stakes[i + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    part(cyl(0.035, 0.035, len, 5), P.logMid, [(x1 + x2) / 2, 0.7, (z1 + z2) / 2],
      { aim: [x2 - x1, 0, z2 - z1] });
  }

  // mushrooms back-left
  [[-2.0, -1.9, 1], [-1.6, -2.2, 0.7], [-2.3, -1.4, 0.8], [-1.2, -1.95, 0.55]].forEach(([x, z, s]) => {
    part(cyl(0.05 * s, 0.07 * s, 0.25 * s, 6), P.folkWhite, [x, 0.38, z]);
    part(new THREE.SphereGeometry(0.17 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.folkRed, [x, 0.5 * s + 0.1, z]);
    for (let k = 0; k < 5; k++) {
      const a = k * 1.3;
      part(new THREE.SphereGeometry(0.025 * s, 4, 3), P.folkWhite,
        [x + Math.sin(a) * 0.1 * s, 0.1 + 0.5 * s + 0.07 + (k % 2) * 0.03, z + Math.cos(a) * 0.1 * s]);
    }
  });

  // mortar & pestle
  const mx = 2.0, mz = 1.8;
  part(new THREE.LatheGeometry([[0, 0], [0.2, 0], [0.3, 0.3], [0.32, 0.4], [0.26, 0.4], [0.2, 0.15], [0, 0.12]].map(([x, y]) => new THREE.Vector2(x, y)), 10),
    P.stone, [mx, 0.28, mz]);
  part(cyl(0.05, 0.08, 0.6, 6), P.logLight, [mx + 0.12, 0.7, mz], { rotation: [0, 0, -25] });
  part(new THREE.SphereGeometry(0.09, 6, 5), P.logLight, [mx + 0.0, 0.42, mz]);

  // stump
  part(cyl(0.28, 0.33, 0.4, 8), P.logMid, [-2.3, 0.45, 0.2]);
  part(cyl(0.25, 0.25, 0.03, 8), P.logEnd, [-2.3, 0.66, 0.2]);
  part(cyl(0.12, 0.12, 0.035, 8), P.logLight, [-2.3, 0.665, 0.2]);

  // broom leaning on fence at left
  part(cyl(0.025, 0.025, 1.3, 5), P.logLight, [-2.45, 0.9, -0.55], { rotation: [0, 0, 18] });
  part(new THREE.ConeGeometry(0.17, 0.5, 7), P.featherLight, [-2.8, 0.4, -0.55], { rotation: [0, 0, 18 + 180] });
  part(cyl(0.1, 0.1, 0.06, 7), P.folkRed, [-2.7, 0.62, -0.55], { rotation: [0, 0, 18] });
}
```

<!-- call: porch -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildPorch({ b, J, P, M }: any) {
  const bone = J.hut;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number, s: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at: [x, y, z], scale: s });

  // deck
  for (let i = 0; i < 6; i++)
    box(2.2, 0.15, 0.1, i % 2 ? P.logMid : P.logLight, 0, 1.875, 1.65 + i * 0.1);
  for (const x of [-0.9, 0, 0.9]) box(0.14, 0.14, 0.7, P.logDark, x, 1.72, 1.9);
  for (const x of [-0.9, 0, 0.9]) cyl(0.06, 0.06, 0.02, P.logEnd, x, 1.72, 2.26).rotation.x = Math.PI / 2;

  // stair
  const n = 7, y0 = 1.95, y1 = 0.25, z0 = 2.2, z1 = 3.0;
  const ang = Math.atan2(y0 - y1, z1 - z0);
  for (const s of [-1, 1]) {
    const len = Math.hypot(y0 - y1, z1 - z0);
    box(0.08, 0.1, len, P.logDark, s * 0.45, (y0 + y1) / 2 - 0.05, (z0 + z1) / 2, { rotation: [-(Math.PI / 2 - ang) * 0 + (Math.atan2(y1 - y0, z1 - z0) * 180) / Math.PI * -1, 0, 0] });
  }
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n, y = y0 - (y0 - y1) * t + 0.02, z = z0 + (z1 - z0) * t - 0.06;
    box(0.9, 0.05, 0.2, P.logLight, 0, y, z);
    box(0.9, 0.03, 0.04, P.folkRed, 0, y + 0.02, z + 0.1);
  }

  // balustrades
  for (const s of [-1, 1]) {
    const x = s * 1.05;
    box(0.06, 0.06, 0.65, P.logMid, x, 2.65, 1.9);
    for (let i = 0; i < 4; i++) {
      const z = 1.7 + i * 0.15;
      cyl(0.025, 0.03, 0.55, P.folkWhite, x, 2.25, z);
      sph(0.03, P.folkRed, x, 2.55, z);
    }
    // stair rail
    const sx = s * 0.47;
    const len = Math.hypot(y0 - y1, z1 - z0);
    box(0.05, 0.05, len, P.logMid, sx, (y0 + y1) / 2 + 0.7, (z0 + z1) / 2, { rotation: [(Math.atan2(y1 - y0, z1 - z0) * -180) / Math.PI, 0, 0] });
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4, yy = y0 - (y0 - y1) * t, zz = z0 + (z1 - z0) * t;
      cyl(0.025, 0.025, 0.7, P.folkWhite, sx, yy + 0.35, zz);
      sph(0.03, P.folkRed, sx, yy + 0.72, zz);
    }
    // post
    cyl(0.08, 0.09, 1.4, P.logDark, x, 2.65, 2.15);
    for (const [yy, c] of [[2.2, P.folkRed], [2.6, P.folkGold], [3.0, P.folkRed]] as [number, string][])
      cyl(0.095, 0.095, 0.08, c, x, yy, 2.15);
    sph(0.12, P.folkGold, x, 3.38, 2.15, [1, 1.2, 1]);
  }

  // canopy
  const tilt = 14;
  const slope = { rotation: [tilt, 0, 0] };
  for (let i = 0; i < 8; i++)
    box(2.5, 0.05, 0.12, i % 2 ? P.shingleBlue : P.shingleTeal, 0, 3.52 - i * 0.04, 1.65 + i * 0.1, slope);
  box(2.6, 0.04, 0.06, P.roofWood, 0, 3.27, 2.42);
  for (let i = 0; i < 13; i++)
    b.part(new THREE.ConeGeometry(0.06, 0.1, 4), i % 2 ? P.folkWhite : P.folkRed, { bone, at: [-1.2 + i * 0.2, 3.2, 2.45], rotation: [0, 0, 180] });
  box(2.5, 0.2, 0.05, P.folkWhite, 0, 3.4, 2.45);
  for (let i = 0; i < 12; i++) box(0.1, 0.05, 0.02, P.folkRed, -1.1 + i * 0.2, 3.4, 2.48);

  // rooster plaque
  box(0.4, 0.3, 0.03, P.folkBlue ?? "#2a5db0", 0, 3.4, 2.5);
  const body = b.extrude([[0, 0], [0.16, 0], [0.18, 0.1], [0.1, 0.16], [0.02, 0.1]], { at: [-0.08, 3.3, 2.53], x: [1, 0, 0], thickness: 0.02, color: P.folkRed, bone });
  sph(0.04, P.folkRed, 0.08, 3.52, 2.54);
  b.part(new THREE.ConeGeometry(0.025, 0.06, 4), P.folkGold, { bone, at: [0.13, 3.52, 2.54], rotation: [0, 0, -90] });

  // hanging bits
  const rope = box(2.0, 0.02, 0.02, P.logLight, 0, 3.15, 2.38);
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3, y = 3.05 - Math.sin((i / 6) * Math.PI) * -0.05;
    sph(0.07, i % 2 ? P.folkWhite : P.folkWhite, x, y, 2.38, [1, 1.2, 1]);
    b.part(new THREE.ConeGeometry(0.03, 0.06, 5), P.folkWhite, { bone, at: [x, y + 0.09, 2.38] });
  }
  for (let i = 0; i < 4; i++) {
    sph(0.05, P.folkRed, 0.7 + i * 0.1, 2.95 - i * 0.02, 2.2, [1, 0.7, 1]);
    cyl(0.01, 0.01, 0.08, P.folkWhite, 0.7 + i * 0.1, 2.99 - i * 0.02, 2.2);
  }
  for (const [x, c] of [[0.5, P.folkGreen], [-0.4, P.folkGold], [0.2, P.folkGreen]] as [number, string][]) {
    b.part(new THREE.ConeGeometry(0.06, 0.25, 5), c, { bone, at: [x, 3.0, 2.3], rotation: [0, 0, 180] });
    cyl(0.01, 0.01, 0.1, P.logDark, x, 3.18, 2.3);
  }

  // skull lantern
  cyl(0.008, 0.008, 0.2, P.logDark, -0.9, 3.15, 2.1);
  sph(0.1, P.bone, -0.9, 2.95, 2.1);
  box(0.1, 0.06, 0.09, P.bone, -0.9, 2.86, 2.12);
  for (const s of [-1, 1]) sph(0.025, P.glowWarm, -0.9 + s * 0.04, 2.96, 2.19);
  void R;
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const R = rng(5);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);

  const EY = 3.75, RY = 5.2, HW = 2.1;
  const ang = Math.atan2(RY - EY, HW);
  const slopeLen = Math.hypot(HW, RY - EY);

  // slopes: shingle rows
  for (const s of [1, -1]) {
    const rows = 8;
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows;
      const x = s * (HW + 0.15 - t * (HW + 0.15));
      const y = EY - 0.08 + t * (RY - EY + 0.08);
      const col = i % 3 === 2 ? P.folkRed : i % 2 ? P.shingleBlue : P.shingleTeal;
      const len = (slopeLen + 0.25) / rows + 0.08;
      box(0.06 + 0.0, 0.06, 4.7, "#000000", [0, 0, 0], {}).mesh.visible = false;
      b.part(new THREE.BoxGeometry(len, 0.07, 4.7), col, {
        bone, at: [x, y, 0], rotation: [0, 0, s * ang * 57.2958 * -1],
      });
      // scallops
      for (let k = 0; k < 9; k++) {
        const z = -2.1 + k * 0.525;
        const lx = x + s * Math.sin(ang) * 0.0 + s * 0.0;
        b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), col, {
          bone, at: [lx + s * Math.cos(ang) * len * 0.45, y - Math.sin(ang) * len * 0.45 - 0.0, z],
          rotation: [90, 0, s * ang * 57.2958 * -1],
        });
      }
    }
    // rafter ends
    for (let k = 0; k < 7; k++)
      box(0.18, 0.18, 0.18, P.logDark, [s * (HW + 0.1), EY - 0.15, -2 + k * 0.67]);
    // moss clumps
    for (let k = 0; k < 4; k++)
      put(new THREE.SphereGeometry(0.1, 5, 4), P.grass, [s * (HW - 0.1), EY + 0.12, -1.8 + k * 1.2 + R() * 0.3]);
  }

  // ridge log + zigzag
  put(new THREE.CylinderGeometry(0.2, 0.2, 4.6, 8), P.logDark, [0, RY + 0.05, 0], { rotation: [90, 0, 0] });
  for (let k = 0; k < 14; k++)
    box(0.1, 0.1, 0.14, k % 2 ? P.folkGold : P.folkRed, [0, RY + 0.27, -2 + k * 0.31], { rotation: [0, 0, 45] });

  // konyok
  for (const z of [2.3, -2.3]) {
    const f = z > 0 ? 1 : -1;
    box(0.2, 0.6, 0.2, P.logLight, [0, RY + 0.4, z - f * 0.05]);
    box(0.22, 0.26, 0.5, P.logLight, [0, RY + 0.72, z + f * 0.2], { rotation: [f * -15, 0, 0] });
    box(0.1, 0.5, 0.14, P.folkRed, [0, RY + 0.66, z - f * 0.12]);
    box(0.24, 0.1, 0.12, P.folkRed, [0, RY + 0.85, z + f * 0.05]);
    box(0.24, 0.1, 0.08, P.folkBlack, [0, RY + 0.66, z + f * 0.45]);
    for (const s of [1, -1]) put(new THREE.SphereGeometry(0.04, 5, 4), P.folkGold, [s * 0.12, RY + 0.8, z + f * 0.3]);
  }

  // gables
  const gable = (z: number, f: number, big: boolean) => {
    for (let i = 0; i < 10; i++) {
      const x = -1.8 + i * 0.4;
      const h = Math.max(0.1, 1.45 * (1 - Math.abs(x) / 2.0));
      box(0.38, h, 0.1, i % 2 ? P.logMid : P.logDark, [x, 3.8 + h / 2, z]);
    }
    const cy = 4.45, zz = z + f * 0.07;
    const sunR = big ? 0.65 : 0.3;
    put(new THREE.CylinderGeometry(sunR, sunR, 0.04, 16), P.folkWhite, [0, cy, zz], { rotation: [90, 0, 0] });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      put(new THREE.SphereGeometry(sunR * 0.2, 5, 4), P.folkRed, [Math.sin(a) * sunR * 0.72, cy + Math.cos(a) * sunR * 0.72, zz + f * 0.02]);
      put(new THREE.SphereGeometry(sunR * 0.06, 4, 3), P.folkWhite, [Math.sin(a + 0.39) * sunR * 0.94, cy + Math.cos(a + 0.39) * sunR * 0.94, zz + f * 0.03]);
    }
    const g = put(new THREE.CylinderGeometry(sunR * (big ? 0.43 : 0.5), sunR * (big ? 0.43 : 0.5), 0.06, 14), big ? P.glowWarm : P.folkGold, [0, cy, zz + f * 0.04], { rotation: [90, 0, 0] });
    if (big) {
      put(new THREE.TorusGeometry(0.31, 0.04, 5, 14), P.folkWhite, [0, cy, zz + f * 0.06]);
      (g.mesh.material as any).emissive?.set?.(P.glowWarm);
    }
    put(new THREE.CylinderGeometry(sunR * 0.18, sunR * 0.18, 0.05, 8), P.folkGold, [0, cy, zz + f * 0.06], { rotation: [90, 0, 0] });
    if (big)
      for (const s of [1, -1]) {
        put(new THREE.SphereGeometry(0.11, 6, 4), P.folkBlue ?? P.shingleBlue, [s * 1.1, 4.3, zz + f * 0.02]);
        box(0.05, 0.4, 0.04, P.folkGreen, [s * 1.1, 4.0, zz + f * 0.02]);
        box(0.22, 0.06, 0.04, P.folkGreen, [s * 1.1 + s * 0.12, 4.05, zz + f * 0.02], { rotation: [0, 0, s * 25] });
      }
    // bargeboards
    for (const s of [1, -1]) {
      const bx = s * 1.05, by = 4.5 + 0.0;
      b.part(new THREE.BoxGeometry(2.45, 0.22, 0.06), P.folkWhite, { bone, at: [bx, by + 0.05, z + f * 0.1], rotation: [0, 0, s * ang * 57.2958 * -1] });
      for (let k = 0; k < 8; k++) {
        const t = (k + 0.5) / 8;
        const px = s * (2.15 - t * 2.1);
        const py = 3.75 + t * 1.45 - 0.17;
        box(0.1, 0.12, 0.07, P.folkRed, [px, py - 0.02, z + f * 0.14], { rotation: [0, 0, 45] });
        if (k % 2) put(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.folkBlue ?? P.shingleBlue, [px, py - 0.18, z + f * 0.14], { rotation: [90, 0, 0] });
      }
    }
    put(new THREE.ConeGeometry(0.08, 0.4, 6), P.folkRed, [0, 3.75, z + f * 0.12], { rotation: [180, 0, 0] });
    put(new THREE.SphereGeometry(0.07, 6, 4), P.folkGold, [0, 3.5, z + f * 0.12]);
  };
  gable(2.0, 1, true);
  gable(-2.0, -1, false);

  // chimney
  const [cx, , cz] = [0.9, 0, -0.9];
  box(0.55, 1.2, 0.55, P.folkRed, [cx, 4.9, cz]);
  for (let k = 0; k < 4; k++) box(0.58, 0.03, 0.58, P.folkBlack, [cx, 4.45 + k * 0.3, cz]);
  box(0.7, 0.12, 0.7, P.stone, [cx, 5.55, cz]);
  box(0.4, 0.06, 0.4, P.folkBlack, [cx, 5.62, cz]);
  [0.14, 0.18, 0.23, 0.29].forEach((r, i) =>
    put(new THREE.SphereGeometry(r, 7, 5), P.smoke, [cx + i * 0.1, 5.7 + i * 0.03 + 0.02 * i, cz - i * 0.05])
  );
}
```

<!-- call: cabin -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabin({ b, J, P }: any) {
  const bone = J.hut;
  const RED = P.folkRed, GOLD = P.folkGold, WHITE = P.folkWhite, BLACK = P.folkBlack;
  const BLUE = "#2a5db0", TEAL = "#1f8a7a";
  const logCols = [P.logMid, P.logLight, P.logDark];

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (r: number, len: number, c: string, at: number[], axis: "x" | "y" | "z", seg = 10) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { bone, at, dir });
  };

  // core
  box(2.9, 2.05, 2.9, P.logDark, 0, 2.825, 0);

  // sill frame
  for (const s of [1, -1]) {
    cyl(0.075, 3.3, P.logDark, [s * 1.5, 1.875, 0], "z");
    cyl(0.075, 3.3, P.logDark, [0, 1.875, s * 1.5], "x");
  }

  // log courses
  const R = 0.125;
  for (let i = 0; i < 8; i++) {
    const y = 1.95 + R + i * 0.232;
    const c = logCols[i % 3];
    const odd = i % 2;
    const ext = odd ? 1.6 : 1.5;
    const L = 2 * ext + 0.24 + (odd ? 0 : 0);
    // z-running logs on x=±1.4 sides (side walls), x-running on front/back
    for (const s of [1, -1]) {
      const zOff = odd ? 0 : 0.0;
      cyl(R, 2 * (1.5 + 0.12), c, [s * 1.4, y, zOff], "z");
      cyl(R, 2 * (1.5 + 0.12) - 0.1, c, [0, y, s * 1.4 + (odd ? 0.0 : 0)], "x");
      for (const e of [1, -1]) {
        // end caps
        const capZ = e * 1.62;
        b.part(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.02, 10), P.logEnd, { bone, at: [s * 1.4, y, capZ], dir: [0, 0, 1] });
        b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.025, 8), P.logLight, { bone, at: [s * 1.4, y, capZ + e * 0.003], dir: [0, 0, 1] });
        const capX = e * 1.62;
        b.part(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.02, 10), P.logEnd, { bone, at: [capX, y, s * 1.4], dir: [1, 0, 0] });
        b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.025, 8), P.logLight, { bone, at: [capX + e * 0.003, y, s * 1.4], dir: [1, 0, 0] });
      }
    }
  }
  // top plate
  for (const s of [1, -1]) {
    cyl(0.07, 3.3, P.logDark, [s * 1.45, 3.82, 0], "z");
    cyl(0.07, 3.3, P.logDark, [0, 3.82, s * 1.45], "x");
  }

  // zigzag trim helper
  const zig = (x0: number, y: number, z: number, n: number, step: number, axis: "x" | "y", rotY = 0) => {
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? WHITE : RED;
      const px = axis === "x" ? x0 + i * step : x0;
      const py = axis === "y" ? y + i * step : y;
      const m = b.part(new THREE.BoxGeometry(0.06, 0.06, 0.02), c, { bone, at: [px, py, z] });
      m.mesh.rotation.z = Math.PI / 4;
      m.mesh.rotation.y = rotY;
    }
  };

  // tulip on a face (front, +z normal)
  const tulip = (x: number, y: number, z: number) => {
    box(0.015, 0.14, 0.01, P.folkGreen, x, y - 0.08, z);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone, at: [x, y + 0.02, z] });
    b.part(new THREE.ConeGeometry(0.03, 0.06, 4), RED, { bone, at: [x, y + 0.07, z] });
    box(0.08, 0.02, 0.01, P.folkGreen, x - 0.05, y - 0.07, z).mesh.rotation.z = 0.5;
    box(0.08, 0.02, 0.01, P.folkGreen, x + 0.05, y - 0.07, z).mesh.rotation.z = -0.5;
  };

  // door (front z=1.5)
  const zf = 1.53;
  box(0.95, 1.5, 0.05, P.logMid, 0, 2.7, zf);
  for (let i = -2; i <= 2; i++) box(0.012, 1.5, 0.01, P.logDark, i * 0.19, 2.7, zf + 0.03);
  for (const s of [1, -1]) {
    box(0.34, 0.6, 0.02, BLUE, s * 0.22, 2.95, zf + 0.04);
    box(0.34, 0.5, 0.02, BLUE, s * 0.22, 2.3, zf + 0.04);
    tulip(s * 0.22, 2.95, zf + 0.06);
    box(0.4, 0.04, 0.025, GOLD, s * 0.22, 2.6, zf + 0.05);
    box(0.4, 0.04, 0.025, GOLD, s * 0.22, 3.25, zf + 0.05);
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone, at: [s * 0.4, 2.6, zf + 0.07] });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone, at: [0.08, 2.6, zf + 0.08] });
  // door frame
  box(0.1, 1.65, 0.1, P.logLight, -0.55, 2.78, zf + 0.02);
  box(0.1, 1.65, 0.1, P.logLight, 0.55, 2.78, zf + 0.02);
  box(1.2, 0.12, 0.1, P.logLight, 0, 3.52, zf + 0.02);
  zig(-0.5, 3.45, zf + 0.09, 11, 0.1, "x");
  for (const s of [1, -1]) zig(s * 0.55, 2.0, zf + 0.09, 14, 0.1, "y");

  // windows
  const frontWin = (x: number, y: number, w: number, h: number, side: number, along: (u: number, v: number, d: number) => number[]) => {
    // along maps (u across wall, v up, d out) -> position
    const P3 = (u: number, v: number, d: number) => along(u, v, d);
    const dirN = side === 0 ? [0, 0, 1] : [1, 0, 0];
    const sz = (a: number, bb: number, d: number) => (side === 0 ? [a, bb, d] : [d, bb, a]);
    const mk = (a: number, bb: number, d: number, c: string, sx: number, sy: number, sd: number) => {
      const s3 = sz(sx, sy, sd);
      return b.part(new THREE.BoxGeometry(s3[0], s3[1], s3[2]), c, { bone, at: P3(a, bb, d) });
    };
    const glass = mk(0, 0, 0.0, P.glowWarm, w, h, 0.04);
    glow(glass, 1.2);
    mk(0, 0, 0.03, BLACK, 0.025, h, 0.02);
    mk(0, 0, 0.03, BLACK, w, 0.025, 0.02);
    // frame boards
    mk(0, h / 2 + 0.07, 0.04, WHITE, w + 0.3, 0.12, 0.06);
    mk(0, -h / 2 - 0.05, 0.04, WHITE, w + 0.3, 0.1, 0.06);
    for (const s of [1, -1]) {
      mk(s * (w / 2 + 0.08), 0, 0.04, WHITE, 0.1, h, 0.06);
      mk(s * (w / 2 + 0.08), 0, 0.075, RED, 0.04, h * 0.8, 0.02);
      // shutters
      mk(s * (w / 2 + 0.28), 0, 0.05, TEAL, 0.24, h + 0.1, 0.04);
      mk(s * (w / 2 + 0.28), 0, 0.075, GOLD, 0.08, 0.08, 0.02);
      mk(s * (w / 2 + 0.28), 0.12, 0.075, GOLD, 0.05, 0.05, 0.02);
      mk(s * (w / 2 + 0.28), -0.12, 0.075, GOLD, 0.05, 0.05, 0.02);
    }
    for (let i = 0; i < 5; i++) mk(-w / 2 - 0.1 + i * ((w + 0.2) / 4), h / 2 + 0.17, 0.04, i % 2 ? RED : BLUE, 0.06, 0.07, 0.04);
  };
  for (const s of [1, -1]) {
    frontWin(0, 0, 0.5, 0.55, 0, (u, v, d) => [s * 1.05 + u * 1, 3.02 + v, 1.53 + d]);
    // side windows
    frontWin(0, 0, 0.7, 0.8, 1, (u, v, d) => [s * (1.52 + d), 3.0 + v, 0.1 + u * s]);
    // flower box
    box(0.12, 0.12, 0.8, P.logDark, s * 1.62, 2.55, 0.1);
    for (let i = -2; i <= 2; i++) {
      b.part(new THREE.SphereGeometry(0.05, 6, 4), i % 2 ? RED : GOLD, { bone, at: [s * 1.62, 2.67, 0.1 + i * 0.15] });
      box(0.015, 0.08, 0.015, P.folkGreen, s * 1.62, 2.62, 0.1 + i * 0.15);
    }
  }
  // back round window
  glow(b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 14), P.glowWarm, { bone, at: [0, 3.0, -1.53], dir: [0, 0, 1] }), 1.2);
  box(0.03, 0.56, 0.02, BLACK, 0, 3.0, -1.56);
  box(0.56, 0.03, 0.02, BLACK, 0, 3.0, -1.56);
  b.part(new THREE.TorusGeometry(0.33, 0.04, 6, 14), WHITE, { bone, at: [0, 3.0, -1.55] });
  for (const s of [1, -1]) {
    box(0.26, 0.7, 0.04, TEAL, s * 0.52, 3.0, -1.55);
    b.part(new THREE.SphereGeometry(0.05, 5, 4), GOLD, { bone, at: [s * 0.52, 3.0, -1.59] });
  }
}
```