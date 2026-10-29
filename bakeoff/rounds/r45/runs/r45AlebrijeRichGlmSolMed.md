<!-- call: plan -->

```json
{
  "name": "Alebrije Jaguar-Eagle",
  "description": "An Oaxacan alebrije chimera: a muscular spotted jaguar standing proud with a feathered eagle head, hooked beak, wide spread painted wings and a plumed tail.",
  "builderName": "alebrijeJaguarEagle",
  "size": [2.8, 2.45, 3.4],
  "layout": "The creature stands like a heraldic jaguar, facing +Z, chest out, on four legs whose feet rest on y = 0 (legs are the only floor part). The torso runs along z from about z = -0.9 (rump) to z = +0.8 (chest), centred on x = 0, belly line around y = 0.7, back line around y = 1.35, with a muscular deep chest and tucked waist. The neck rises from the chest front at z = 0.72 up to the eagle head at z = 1.15, y = 1.5, facing forward: the eagle head has a hooked yellow beak, a tall feather crest, huge painted eyes and a slightly open jaw with visible teeth. Two wide eagle wings spread from the shoulders up and outward, tips at x = ±1.3, y = 2.3, fully feathered with layered primaries in teal and yellow and covert rows in magenta and cream. The tail sweeps back and up from the rump in a lazy S to z = -2.2, ending in a fan of feather plumes. Every part is alebrije style: bold blocky primitive shapes, burnt-orange coat, hand-painted-looking flat colours, rosette spots, zigzag and stripe trim bands in teal, magenta, yellow and green, and crisp ink outlines on edges, eyes and beak. Nothing else is on the floor: no base, no scenery, the animal is the whole model.",
  "palette": {
    "coat": "#e2762a",
    "coatShade": "#b34716",
    "cream": "#f7e7c3",
    "white": "#f7f2ea",
    "ink": "#241a1f",
    "teal": "#1f9e9e",
    "tealDark": "#145c5c",
    "magenta": "#c8388f",
    "magentaDark": "#8f2a68",
    "yellow": "#f2c230",
    "yellowOrange": "#f2a020",
    "green": "#3f9e44",
    "red": "#d43a2f",
    "talon": "#f0e0b0",
    "beak": "#f2c230",
    "beakShade": "#c58c1a",
    "tongue": "#d43a2f"
  },
  "mounts": {
    "neckBase": [0, 1.28, 0.72],
    "tailBase": [0, 1.05, -0.72],
    "shoulderL": [0.38, 1.32, 0.3],
    "shoulderR": [-0.38, 1.32, 0.3],
    "forelegRootL": [0.34, 0.95, 0.55],
    "forelegRootR": [-0.34, 0.95, 0.55],
    "hindlegRootL": [0.36, 0.92, -0.45],
    "hindlegRootR": [-0.36, 0.92, -0.45]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 1.22, 0.72], "dir": [0, 0.4, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.5, 1.15], "dir": [0, 0.3, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.38, 1.25], "dir": [0, -0.25, 1], "role": "jaw" },
    { "name": "wingL", "parent": "body", "at": [0.38, 1.32, 0.3], "dir": [0.55, 0.75, -0.2], "role": "wing" },
    { "name": "wingR", "parent": "body", "at": [-0.38, 1.32, 0.3], "dir": [-0.55, 0.75, -0.2], "role": "wing" },
    { "name": "tail1", "parent": "body", "at": [0, 1.05, -0.72], "dir": [0, 0.15, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.0, -1.35], "dir": [0, 0.4, -0.8], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.2, -1.85], "dir": [0, 0.6, -0.6], "role": "tail" },
    { "name": "legFL", "parent": "body", "at": [0.34, 0.95, 0.55], "dir": [0, -1, 0.12], "role": "leg" },
    { "name": "legFR", "parent": "body", "at": [-0.34, 0.95, 0.55], "dir": [0, -1, 0.12], "role": "leg" },
    { "name": "legBL", "parent": "body", "at": [0.36, 0.92, -0.45], "dir": [0, -1, -0.05], "role": "leg" },
    { "name": "legBR", "parent": "body", "at": [-0.36, 0.92, -0.45], "dir": [0, -1, -0.05], "role": "leg" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The muscular jaguar torso as one smooth lofted body along the spine from chest z = 0.8 to rump z = -0.85, built on the body joint: a deep barrel chest in front (widest at z = 0.45, height from belly y = 0.66 to back y = 1.4), a tucked waist at z = -0.1, and rounded rump to z = -0.85. Use a loft or sweep with shift so the belly hangs slightly below the spine line. Surfaces: burnt-orange coat (coat) with darker orange (coatShade) shading low on the flanks and belly, cream belly and chest bib separated from the orange by a zigzag fur edge or a scalloped trim band in teal with an ink outline. Rosette spots: jaguar rosettes as small ring-like parts (tiny torus or ring segments, tealDark with a coat-coloured centre) scattered on the upper flanks, shoulders and haunches, denser on the back, none on the cream belly; about 18-24 rosettes. Signature alebrije trim: a narrow painted saddle band across the back at z = 0.15 made of layered magenta, yellow and teal stripes with an ink edge, plus small geometric eye-dots (concentric white/teal/magenta discs) on each flank hip. A dorsal mane ridge: a row of 7-9 short triangular feather fins (extrude slabs, alternating teal and magenta with ink rims) seated along the spine from z = 0.4 back to z = -0.5, increasing in size toward the shoulders. Chest fur tufts: 3 small upward cream spikes at the chest front. Everything rides joint body.",
      "box": [[-0.6, 0.55, -0.9], [0.6, 1.5, 0.85]],
      "attaches": "Chest front rises into the neck at mount neckBase (z = 0.72, y = 1.28); rump hands off to the tail at mount tailBase (z = -0.72, y = 1.05); shoulder mounts shoulderL and shoulderR at x = ±0.38, y = 1.32, z = 0.3 carry the wing roots; the four leg roots at mounts forelegRootL/R and hindlegRootL/R are covered by the legs part, so the torso tapers smoothly into them with no gaps.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "head",
      "builds": "The neck and eagle head on the neck, head and jaw joints. Neck: a curved loft from the chest top at mount neckBase up to the head at z = 1.15, y = 1.5, orange coat (coat) with a cream throat bib edged by a zigzag ink line, and a feather ruff collar around the base: a ring of 10-12 flat extrude feather blades (alternating teal and magenta with cream tips) fanning outward at mount neckBase. Head: a bold blocky eagle skull, roughly a rounded box 0.34 wide, 0.36 tall, 0.4 long centred at [0, 1.52, 1.35], tilted slightly down at the muzzle. Beak: a hooked yellow (beak) lathe or bevelled wedge at the muzzle front, curving down and back, with a beakShade underside and a thin ink cere line where beak meets skull; the lower mandible is a separate thinner wedge on the jaw joint so the mouth reads open by 15 degrees. Inside the open mouth: a red (tongue) tongue slab and two rows of 4-5 small white conical teeth seated along the upper jaw rim in cream gum strips. Eyes: two huge anime-style eyes (the SDK animeEye decals or built equivalents: white sclera, huge amber-iris pupil with white highlights, thick ink outline) seated on each side of the skull at x = ±0.14, facing outward-forward, each with an ink brow stroke above and a small magenta feather teardrop behind. Crest: the signature feature - a tall fan of 7 layered feather blades (extrudes, tallest centred, teal base to yellow tips with ink rims) rising from the crown at y = 1.68 back over the skull, plus 2 small side ear tufts. Cheek plumage: short overlapping teal feather shingles on the lower cheeks. Small green painted eye-dot medallions (concentric discs) on each temple. Everything on joints neck, head, jaw.",
      "box": [[-0.42, 1.0, 0.7], [0.42, 2.0, 1.75]],
      "attaches": "Neck bottom lands exactly on mount neckBase (0, 1.28, 0.72) where the torso's chest front ends; the feather ruff collar overlaps the torso's chest front so no seam shows; the head joint sits at (0, 1.5, 1.15) inside this box.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "Two wide spread eagle wings, mirrored left and right, one construction reused for both. Each wing roots at mount shoulderL (x = +0.38) / shoulderR (x = -0.38), y = 1.32, z = 0.3, and sweeps up and outward: wing arm bone from the shoulder through an elbow bend at x = ±0.72, y = 1.9, z = 0.1 to a wrist at x = ±1.05, y = 2.15, z = 0.0, then primaries fanning to the wing tip at x = ±1.32, y = 2.35, z = 0.05, with the tip trailing back to z = -0.45. Build each wing as a tapered arm (frustum box or sweep, coat colour) then cover it with layered feathers: 4 rows of flat extrude feather blades along the arm (coverts), alternating cream and magenta with ink rims, each row overlapping the next, then 6 long primaries from the wrist outward (extrude slabs with pointed tips, teal with yellow tips and ink outlines), fanned in an arc so each is longer than the last, plus 4 shorter secondaries trailing back (teal with cream edges). Underside of the wing arms: coatShade. A small green-and-white eye-dot medallion (concentric discs) on each wing shoulder patch. Roots must tuck under and overlap the torso's shoulder line so the wing reads as growing from the body, with a small magenta shoulder pauldron slab capping the root. All wing geometry rides the wingL / wingR joints.",
      "box": [[-1.4, 0.95, -0.7], [1.4, 2.45, 0.85]],
      "attaches": "Each wing root seats on mount shoulderL / shoulderR at (±0.38, 1.32, 0.3) with its pauldron overlapping the torso's shoulder at that point; joints wingL and wingR sit exactly there.",
      "joints": ["wingL", "wingR"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "legs",
      "builds": "Four sturdy jaguar legs, mirrored constructions, on joints legFL, legFR, legBL, legBR. Each leg roots at its mount (forelegRootL/R at x = ±0.34, y = 0.95, z = 0.55; hindlegRootL/R at x = ±0.36, y = 0.92, z = -0.45) and reaches the floor: a thick thigh/upper segment tapering through a simple knee joint (the leg joint's bone reaches to the paw), foot pads resting flat on y = 0. Build each leg as two tapered loft or frustum segments: upper limb (coats coat, widest at the thigh, about 0.16 across) and lower limb (coatShade, tapering to 0.09), joined with a visible knee disc; hind legs get a broader haunch with the thigh angled slightly back. Paw: a chunky rounded block 0.13 wide, sitting flat on the floor, coat coloured, split into 4 toes by thin ink seam lines. Front paws grow eagle talons: a cream (talon) hooked cone on each toe curving down and forward (3 visible talons plus a dewclaw hint), ink-shaded at the base; hind paws get short blunt cream claws. Bands: a teal ankle band with ink edges just above each paw, and a yellow-and-magenta painted band (two stacked stripe rings) on each knee. Rosettes: 2-3 small tealDark rosette rings on each outer thigh and shoulder, matching the torso's rosettes. All four legs' lowest points touch y = 0; keep paws level.",
      "box": [[-0.75, 0.0, -0.8], [0.75, 0.95, 0.9]],
      "attaches": "Each leg top seats into its mount forelegRootL/R / hindlegRootL/R, overlapping the torso's chest and haunch so the thigh reads as emerging from the body; joints legFL, legFR, legBL, legBR sit at those mounts.",
      "joints": ["legFL", "legFR", "legBL", "legBR"],
      "floor": true,
      "budget": 180
    },
    {
      "id": "tail",
      "builds": "The alebrije tail on joints tail1, tail2, tail3: a lazy S-curve from mount tailBase (0, 1.05, -0.72) down and back, dipping to y = 0.98 at z = -1.35, then sweeping up to the tip at (0, 1.25, -2.15). Build it as a tapered sweep along the three tail joints, radius 0.11 at the root easing to 0.05 before the plume, orange coat with a cream underside stripe running the whole length, 5 teal ring bands (each with an ink edge) spaced evenly down the tail, and small tealDark rosette rings on the upper surface between bands. The plume at the tip is the signature: a fan of 9 flat extrude feather blades radiating from the tail tip joint, the centre blade longest (0.38) and the outer ones shorter, each blade magenta with a teal mid-stripe, cream tips and ink outlines, spread in a fanned arc pointing back and slightly up. Where the plume meets the tail, a small yellow collar ring with a magenta stripe. All tail geometry rides tail1, tail2, tail3.",
      "box": [[-0.45, 0.55, -2.3], [0.45, 1.4, -0.75]],
      "attaches": "Tail root seats at mount tailBase (0, 1.05, -0.72), overlapping the torso's rump so the tail grows seamlessly out of it; joints tail1-3 run along its curve.",
      "joints": ["tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const coat = P.coat;
  const coatShade = P.coatShade;
  const ink = P.ink;
  const teal = P.teal;
  const tealDark = P.tealDark;
  const magenta = P.magenta;
  const yellow = P.yellow;
  const talon = P.talon;
  const cream = P.cream;

  const seeded = rng(417);
  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const upperGeo = (a: THREE.Vector3, c: THREE.Vector3, ha: number, hc: number) =>
    b.frustumBox(a, c, [ha * 1.18, ha * 1.34], [hc * 1.02, hc * 1.18], {
      section: "box",
      caps: { start: "round", end: "round" },
    });

  const lowerGeo = (a: THREE.Vector3, c: THREE.Vector3, ha: number, hc: number) =>
    b.frustumBox(a, c, [ha * 1.02, ha * 1.12], [hc, hc * 1.05], {
      section: "box",
      caps: { start: "round", end: "round" },
    });

  const cylinder = (
    radius: number,
    depth: number,
    color: string,
    at: THREE.Vector3,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 10, 1), color, {
      at,
      bone,
      dir: [0, 1, 0],
      name,
      flat: true,
    });

  const disc = (
    at: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, 0.012, 10, 1), color, {
      at,
      bone,
      dir: normal,
      name,
      flat: true,
    });

  const rosette = (
    at: THREE.Vector3,
    normal: THREE.Vector3,
    bone: any,
    name: string,
    scale = 1,
  ) => {
    const outer = new THREE.TorusGeometry(0.038 * scale, 0.009 * scale, 5, 10);
    b.part(outer, tealDark, {
      at,
      bone,
      dir: normal,
      axis: "z",
      name: `${name}_ring`,
      flat: true,
    });
    disc(
      at.clone().addScaledVector(normal, 0.004),
      normal,
      0.018 * scale,
      coat,
      bone,
      `${name}_center`,
    );
    disc(
      at.clone().addScaledVector(normal, 0.007),
      normal,
      0.008 * scale,
      magenta,
      bone,
      `${name}_spark`,
    );
  };

  const toeSeam = (
    at: THREE.Vector3,
    bone: any,
    name: string,
    length = 0.16,
  ) => {
    b.rod(at.clone().add(new THREE.Vector3(0, 0.071, -length * 0.32)), at.clone().add(new THREE.Vector3(0, 0.071, length * 0.48)), 0.006, {
      color: ink,
      bone,
      name,
      section: { ngon: 5 },
      caps: "flat",
    });
  };

  const paw = (
    side: number,
    z: number,
    bone: any,
    front: boolean,
    id: string,
  ) => {
    const center = new THREE.Vector3(side * (front ? 0.34 : 0.36), 0.105, z);

    b.part(new THREE.BoxGeometry(0.245, 0.15, 0.31), coat, {
      at: center,
      bone,
      name: `${id}_paw`,
      flat: true,
    });

    // A dark painted sole lip gives the wooden paw a crisp carved outline.
    b.part(new THREE.BoxGeometry(0.255, 0.018, 0.315), coatShade, {
      at: center.clone().add(new THREE.Vector3(0, -0.071, 0)),
      bone,
      name: `${id}_sole`,
      flat: true,
    });

    // Four broad toe blocks, overlapping the front edge of the paw.
    const toeX = [-0.082, -0.027, 0.027, 0.082];
    for (let i = 0; i < toeX.length; i++) {
      const tx = center.x + toeX[i];
      const tz = center.z + 0.115;
      b.part(new THREE.SphereGeometry(0.052, 8, 5), coat, {
        at: [tx, 0.098, tz],
        bone,
        scale: [1.0, 0.72, 1.2],
        name: `${id}_toe${i}`,
        flat: true,
      });
    }

    for (let i = 0; i < 3; i++) {
      toeSeam(
        new THREE.Vector3(center.x + (-0.055 + i * 0.055), 0, center.z),
        bone,
        `${id}_seam${i}`,
        0.18,
      );
    }

    if (front) {
      // Three large eagle talons and a smaller inner dewclaw.
      const claws = [
        [-0.075, 0.20, 0.105],
        [0, 0.215, 0.125],
        [0.075, 0.20, 0.105],
        [side * 0.105, 0.11, 0.02],
      ];
      claws.forEach(([dx, dz, bend], i) => {
        const base = new THREE.Vector3(center.x + dx, 0.105, center.z + 0.18);
        const tip = new THREE.Vector3(
          base.x + (i === 3 ? side * 0.025 : 0),
          i === 3 ? 0.025 : 0.018,
          base.z + dz + bend * 0.18,
        );
        b.spike(base, tip, null, i === 3 ? 0.018 : 0.025, {
          color: talon,
          bone,
          name: `${id}_talon${i}`,
          caps: "point",
          section: { ngon: 6 },
        });
        if (i < 3) {
          b.part(new THREE.SphereGeometry(0.027, 7, 5), ink, {
            at: base,
            bone,
            name: `${id}_talonInk${i}`,
            flat: true,
          });
        }
      });
    } else {
      // Blunt rear claws, painted like small ivory chisels.
      for (let i = 0; i < 3; i++) {
        const base = new THREE.Vector3(center.x + toeX[i + 0.5] * 0.75, 0.105, center.z + 0.17);
        const tip = base.clone().add(new THREE.Vector3(0, -0.025, 0.075));
        b.spike(base, tip, null, 0.017, {
          color: talon,
          bone,
          name: `${id}_hindClaw${i}`,
          caps: "point",
          section: { ngon: 6 },
        });
      }
    }
  };

  const buildLeg = (
    side: number,
    root: readonly number[],
    knee: readonly number[],
    ankle: readonly number[],
    bone: any,
    front: boolean,
    id: string,
  ) => {
    const r = V(root);
    const k = V(knee);
    const a = V(ankle);

    // The upper block is deliberately broad and overlaps the torso mount.
    b.part(upperGeo(r, k, front ? 0.115 : 0.13, front ? 0.095 : 0.11), coat, {
      bone,
      at: [0, 0, 0],
      name: `${id}_upper`,
      flat: true,
    });

    // A dark lower cannon makes the knee and ankle read clearly in silhouette.
    b.part(lowerGeo(k, a, 0.082, 0.062), coatShade, {
      bone,
      at: [0, 0, 0],
      name: `${id}_lower`,
      flat: true,
    });

    b.part(new THREE.SphereGeometry(front ? 0.105 : 0.12, 9, 6), coat, {
      at: k,
      bone,
      name: `${id}_knee`,
      flat: true,
    });

    // Painted double stripe around the knee.
    cylinder(0.108, 0.026, yellow, k.clone().add(new THREE.Vector3(0, 0.052, 0)), bone, `${id}_kneeYellow`);
    cylinder(0.105, 0.022, magenta, k.clone().add(new THREE.Vector3(0, 0.018, 0)), bone, `${id}_kneeMagenta`);
    cylinder(0.108, 0.009, ink, k.clone().add(new THREE.Vector3(0, 0.071, 0)), bone, `${id}_kneeInkTop`);

    // Teal ankle cuff with two narrow ink borders.
    const cuffY = 0.235;
    cylinder(front ? 0.074 : 0.081, 0.046, teal, new THREE.Vector3(a.x, cuffY, a.z), bone, `${id}_ankleTeal`);
    cylinder(front ? 0.078 : 0.085, 0.008, ink, new THREE.Vector3(a.x, cuffY + 0.027, a.z), bone, `${id}_ankleInkTop`);
    cylinder(front ? 0.078 : 0.085, 0.008, ink, new THREE.Vector3(a.x, cuffY - 0.027, a.z), bone, `${id}_ankleInkBottom`);

    paw(side, front ? 0.61 : -0.48, bone, front, id);

    // Outer-thigh rosettes and a smaller front-facing shoulder/haunch medallion.
    const outer = new THREE.Vector3(side * (front ? 0.445 : 0.485), front ? 0.70 : 0.67, front ? 0.57 : -0.48);
    rosette(outer, new THREE.Vector3(side, 0.08, 0).normalize(), bone, `${id}_outerRosette`, 1.15);

    const frontMark = new THREE.Vector3(side * (front ? 0.39 : 0.42), front ? 0.76 : 0.67, front ? 0.64 : -0.39);
    rosette(frontMark, new THREE.Vector3(side * 0.7, 0.15, 0.7).normalize(), bone, `${id}_frontRosette`, 0.78);

    // Small triangular paint chips on the shin echo the alebrije zigzag trim.
    const chipX = side * (front ? 0.075 : 0.082);
    b.extrude(
      [
        [0, 0],
        [0.045, 0],
        [0.026, 0.05],
        [0, 0.075, "sharp"],
      ],
      {
        at: [a.x + chipX, 0.39, a.z + 0.065],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.009,
        color: yellow,
        bone,
        name: `${id}_shinChevron`,
      },
    );
  };

  buildLeg(1, M.forelegRootL, [0.34, 0.52, 0.57], [0.34, 0.15, 0.59], J.legFL, true, "legFL");
  buildLeg(-1, M.forelegRootR, [-0.34, 0.52, 0.57], [-0.34, 0.15, 0.59], J.legFR, true, "legFR");

  buildLeg(1, M.hindlegRootL, [0.39, 0.47, -0.56], [0.36, 0.15, -0.48], J.legBL, false, "legBL");
  buildLeg(-1, M.hindlegRootR, [-0.39, 0.47, -0.56], [-0.36, 0.15, -0.48], J.legBR, false, "legBR");

  // A few tiny ink rivets at the outer knee edges make the painted-wood construction legible.
  const rivetYs = [0.48, 0.55];
  for (const side of [1, -1]) {
    for (let i = 0; i < rivetYs.length; i++) {
      b.part(new THREE.SphereGeometry(0.012, 6, 4), ink, {
        at: [side * 0.455, rivetYs[i], 0.56],
        bone: side > 0 ? J.legFL : J.legFR,
        name: `frontKneeRivet_${side}_${i}`,
        flat: true,
      });
    }
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const add = (a: THREE.Vector3, b0: THREE.Vector3) => a.clone().add(b0);
  const sub = (a: THREE.Vector3, b0: THREE.Vector3) => a.clone().sub(b0);
  const mul = (a: THREE.Vector3, n: number) => a.clone().multiplyScalar(n);
  const unit = (a: THREE.Vector3) => a.clone().normalize();

  const ink = P.ink;
  const coat = P.coat;
  const shade = P.coatShade;
  const cream = P.cream;
  const teal = P.teal;
  const tealDark = P.tealDark;
  const magenta = P.magenta;
  const yellow = P.yellow;
  const green = P.green;
  const white = P.white;

  type WingFeather = {
    base: THREE.Vector3;
    tip: THREE.Vector3;
    width: number;
    color: string;
    bone: any;
    tipColor?: string;
    stripeColor?: string;
    stripeAt?: number;
  };

  const feather = ({
    base,
    tip,
    width,
    color,
    bone,
    tipColor,
    stripeColor,
    stripeAt = 0.66,
  }: WingFeather) => {
    const direction = sub(tip, base);
    const length = direction.length();
    const y = unit(direction);

    // Width is kept in the mostly vertical plane of the wing, making the
    // broad painted face read clearly from the front.
    let x = V(-y.y, y.x, 0);
    if (x.lengthSq() < 0.001) x = V(0, 1, 0);
    x.normalize();

    let normal = unit(x.clone().cross(y));
    if (normal.z < 0) {
      x.negate();
      normal.negate();
    }

    const outline: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [width * 0.62, length * 0.14, "sharp"],
      [width * 0.48, length * 0.78, "sharp"],
      [0, length, "sharp"],
      [-width * 0.48, length * 0.78, "sharp"],
      [-width * 0.62, length * 0.14, "sharp"],
    ];

    const rim = b.extrude(outline, {
      at: add(base, mul(normal, -0.004)),
      x,
      y,
      thickness: 0.018,
      bevel: 0.002,
      color: ink,
      bone,
      name: "wingFeatherRim",
      group: "wings",
    });

    const face = b.extrude(
      [
        [0, 0, "sharp"],
        [width * 0.52, length * 0.16, "sharp"],
        [width * 0.39, length * 0.78, "sharp"],
        [0, length * 0.97, "sharp"],
        [-width * 0.39, length * 0.78, "sharp"],
        [-width * 0.52, length * 0.16, "sharp"],
      ],
      {
        at: add(base, mul(normal, 0.008)),
        x,
        y,
        thickness: 0.012,
        bevel: 0.0015,
        color,
        bone,
        name: "paintedWingFeather",
        group: "wings",
      },
    );

    if (stripeColor) {
      const stripeBase = add(base, mul(y, length * stripeAt));
      const stripeTip = add(base, mul(y, Math.min(length, length * stripeAt + length * 0.16)));
      feather({
        base: add(stripeBase, mul(normal, 0.014)),
        tip: stripeTip,
        width: width * 0.72,
        color: stripeColor,
        bone,
      });
    }

    if (tipColor) {
      const tipBase = add(base, mul(y, length * 0.76));
      const tipTip = add(base, mul(y, length * 0.985));
      feather({
        base: add(tipBase, mul(normal, 0.014)),
        tip: tipTip,
        width: width * 0.66,
        color: tipColor,
        bone,
      });
    }

    return { rim, face, normal, y, x };
  };

  const shoulderMedallion = (side: number, bone: any) => {
    const center = V(side * 0.53, 1.48, 0.31);
    const outward = V(side, 0, 0);
    const layers = [
      [0.105, 0.018, ink],
      [0.086, 0.021, white],
      [0.066, 0.024, green],
      [0.042, 0.027, white],
      [0.021, 0.03, tealDark],
    ] as const;

    for (let i = 0; i < layers.length; i++) {
      const [r, depth, color] = layers[i];
      b.part(new THREE.CylinderGeometry(r, r, depth, 12), color, {
        bone,
        at: add(center, mul(outward, i * 0.006)),
        dir: outward,
        name: `wingMedallion${i}`,
        group: "wings",
      });
    }

    for (let i = -1; i <= 1; i += 2) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), yellow, {
        bone,
        at: add(center, V(0, i * 0.052, 0.025)),
        name: "medallionDot",
        group: "wings",
      });
    }
  };

  for (const side of [1, -1]) {
    const bone = side > 0 ? J.wingL : J.wingR;
    const shoulder = V(side * 0.38, 1.32, 0.3);
    const elbow = V(side * 0.72, 1.9, 0.1);
    const wrist = V(side * 1.05, 2.15, 0.0);

    // Chunky wing arm, with a strong painted underside sector.
    const armPath = catmull([shoulder, V(side * 0.5, 1.57, 0.23), elbow, wrist]);
    b.sweep(armPath, (t: number) => 0.13 - t * 0.045, {
      bone,
      color: coat,
      section: "box",
      sides: 6,
      caps: "round",
      sectors: [[115, 245, shade]],
      name: side > 0 ? "wingArmL" : "wingArmR",
      group: "wings",
    });

    // Root pauldron, overlapping the shoulder and torso.
    feather({
      base: V(side * 0.37, 1.31, 0.24),
      tip: V(side * 0.61, 1.61, 0.18),
      width: 0.25,
      color: magenta,
      bone,
      stripeColor: yellow,
      stripeAt: 0.48,
    });

    // Four overlapping covert rows over the arm.
    const coverts = [
      { t: 0.08, length: 0.35, width: 0.22, color: cream },
      { t: 0.28, length: 0.40, width: 0.24, color: magenta },
      { t: 0.49, length: 0.44, width: 0.26, color: cream },
      { t: 0.69, length: 0.38, width: 0.24, color: magenta },
    ];

    for (let row = 0; row < coverts.length; row++) {
      const c = coverts[row];
      const t = c.t;
      const p = armPath.at(t);
      const tangent = unit(armPath.tangentAt(t));
      const base = add(p, V(0, 0.025, 0.065));
      const dir = unit(add(tangent, V(0, 0.22, side * 0.12)));
      const tip = add(base, mul(dir, c.length));

      feather({
        base,
        tip,
        width: c.width,
        color: c.color,
        bone,
        tipColor: row % 2 === 0 ? teal : yellow,
        stripeColor: row % 2 === 0 ? magenta : teal,
        stripeAt: 0.54,
      });
    }

    // Six long primaries: the outermost feathers fan farthest and trail back.
    for (let i = 0; i < 6; i++) {
      const u = i / 5;
      const base = V(
        side * (1.00 + u * 0.035),
        2.12 + u * 0.025,
        0.015 - u * 0.045,
      );
      const tip = V(
        side * (1.10 + u * 0.24),
        2.16 + u * 0.22 + Math.sin(u * Math.PI) * 0.035,
        -0.04 - u * 0.43,
      );

      feather({
        base,
        tip,
        width: 0.16 - u * 0.012,
        color: teal,
        bone,
        tipColor: yellow,
        stripeColor: i % 2 === 0 ? cream : magenta,
        stripeAt: 0.47,
      });
    }

    // Four shorter secondaries sweep backward from beneath the primaries.
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const base = V(
        side * (0.84 + u * 0.10),
        1.98 + u * 0.06,
        -0.02 - u * 0.04,
      );
      const tip = V(
        side * (0.92 + u * 0.10),
        1.80 + u * 0.035,
        -0.36 - u * 0.12,
      );

      feather({
        base,
        tip,
        width: 0.18 - u * 0.018,
        color: teal,
        bone,
        tipColor: cream,
        stripeColor: magenta,
        stripeAt: 0.52,
      });
    }

    // Small painted shoulder medallion over the pauldron.
    shoulderMedallion(side, bone);

    // Decorative green rivets along the arm's leading edge.
    for (let i = 0; i < 5; i++) {
      const t = 0.12 + i * 0.17;
      const p = armPath.at(t);
      b.part(new THREE.SphereGeometry(0.018, 7, 5), green, {
        bone,
        at: add(p, V(side * 0.015, 0.08, 0.075)),
        name: "wingPaintRivet",
        group: "wings",
      });
    }

    // A bold yellow seam at the wing wrist.
    const wristBand = b.surface(b.root).nearest(add(wrist, V(0, 0.02, 0.04)));
    if (wristBand) {
      b.stick(new THREE.CylinderGeometry(0.082, 0.082, 0.018, 8), yellow, wristBand, {
        bone,
        embed: 0.45,
        name: "wingWristBand",
        group: "wings",
      });
    }
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  offset,
} from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const body = J.body;

  const coat = P.coat;
  const coatShade = P.coatShade;
  const cream = P.cream;
  const white = P.white;
  const ink = P.ink;
  const teal = P.teal;
  const tealDark = P.tealDark;
  const magenta = P.magenta;
  const magentaDark = P.magentaDark;
  const yellow = P.yellow;
  const yellowOrange = P.yellowOrange;
  const green = P.green;

  const bodyPath = catmull(
    [
      [0, 1.08, -0.9],
      [0, 1.08, -0.72],
      [0, 1.12, -0.38],
      [0, 1.13, -0.08],
      [0, 1.17, 0.28],
      [0, 1.2, 0.58],
      [0, 1.22, 0.82],
    ],
    { tension: 0.25 },
  );

  const torso = b.sweep(bodyPath, (t) => {
    if (t < 0.2) return [0.38 + t * 0.45, 0.31 + t * 0.6];
    if (t < 0.55) return [0.42, 0.42];
    if (t < 0.8) return [0.35, 0.39];
    return [0.3, 0.34];
  }, {
    bone: body,
    color: coat,
    sides: 10,
    smooth: false,
    caps: "round",
    sectors: [
      [112, 248, cream],
      [72, 112, coatShade],
      [248, 288, coatShade],
    ],
    name: "torsoMain",
    group: "torso",
  });

  const skin = b.surface(torso);

  const torus = (hit: any, outer: number, tube: number, color: string, name: string) =>
    b.stick(
      new THREE.TorusGeometry(outer, tube, 5, 10),
      color,
      hit,
      { embed: 0.34, name, group: "torsoDetail" },
    );

  const disc = (hit: any, radius: number, color: string, name: string) =>
    b.stick(
      new THREE.CylinderGeometry(radius, radius, 0.012, 10),
      color,
      hit,
      { embed: 0.2, name, group: "torsoDetail" },
    );

  const spotPositions: [number, number, number][] = [
    [0.48, 1.28, -0.7],
    [0.51, 1.32, -0.42],
    [0.47, 1.37, -0.1],
    [0.5, 1.34, 0.2],
    [0.48, 1.35, 0.48],
    [0.39, 1.48, -0.62],
    [0.36, 1.51, -0.3],
    [0.35, 1.5, 0.02],
    [0.34, 1.47, 0.31],
    [0.29, 1.49, 0.59],
    [-0.48, 1.28, -0.7],
    [-0.51, 1.32, -0.42],
    [-0.47, 1.37, -0.1],
    [-0.5, 1.34, 0.2],
    [-0.48, 1.35, 0.48],
    [-0.39, 1.48, -0.62],
    [-0.36, 1.51, -0.3],
    [-0.35, 1.5, 0.02],
    [-0.34, 1.47, 0.31],
    [-0.29, 1.49, 0.59],
    [0.22, 1.48, -0.78],
    [-0.22, 1.48, -0.78],
  ];

  for (let i = 0; i < spotPositions.length; i++) {
    const p = spotPositions[i];
    const hit = skin.nearest(p);
    const radius = i % 4 === 0 ? 0.064 : 0.05;
    torus(hit, radius, 0.011, tealDark, `rosette${i}`);
    const inner = hit.moved([0, 0.004, 0]);
    b.stick(
      new THREE.CylinderGeometry(radius * 0.48, radius * 0.48, 0.009, 9),
      coat,
      inner,
      { embed: 0.3, name: `rosette${i}Center`, group: "torsoDetail" },
    );
    if (i % 3 === 0) {
      const glint = hit.moved([0, 0.007, 0]);
      b.stick(
        new THREE.SphereGeometry(0.009, 5, 4),
        yellowOrange,
        glint,
        { embed: 0.2, name: `rosette${i}Glint`, group: "torsoDetail" },
      );
    }
  }

  // Geometric eye-medallions on the hips.
  for (const s of [1, -1]) {
    const h = skin.nearest([s * 0.48, 1.29, -0.56]);
    disc(h, 0.095, ink, `hipEyeInk${s}`);
    disc(h.moved([0, 0.006, 0]), 0.073, white, `hipEyeWhite${s}`);
    disc(h.moved([0, 0.011, 0]), 0.052, teal, `hipEyeTeal${s}`);
    disc(h.moved([0, 0.016, 0]), 0.027, magenta, `hipEyeMagenta${s}`);
    b.stick(
      new THREE.SphereGeometry(0.012, 6, 4),
      yellow,
      h.moved([0.01, 0.021, 0.012]),
      { embed: 0.15, name: `hipEyeSpark${s}`, group: "torsoDetail" },
    );
  }

  // The broad alebrije saddle: three closely stacked painted loops.
  for (const [z, color, radius] of [
    [0.16, ink, 0.021],
    [0.165, magenta, 0.017],
    [0.178, yellow, 0.014],
    [0.191, teal, 0.012],
  ] as [number, string, number][]) {
    const h = skin.nearest([0, 1.42, z]);
    const loop = skin.loop(h, { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, radius, {
      bone: body,
      color,
      sides: 6,
      caps: "round",
      name: `saddleBand${z}`,
      group: "saddle",
    });
  }

  // A scalloped-looking teal bib edge across the cream underside.
  const bibHit = skin.nearest([0, 0.79, 0.48]);
  const bibLoop = skin.loop(bibHit, { dir: [0, 0, 1], lift: 0.018 });
  b.sweep(bibLoop, 0.014, {
    bone: body,
    color: ink,
    sides: 6,
    name: "bibInkEdge",
    group: "bib",
  });
  b.sweep(bibLoop, 0.008, {
    bone: body,
    color: teal,
    sides: 6,
    name: "bibTealEdge",
    group: "bib",
  });

  // Dorsal mane, built as dark silhouettes with bright inset blades.
  const maneZ = [0.48, 0.36, 0.24, 0.12, 0.0, -0.2, -0.42, -0.62];
  for (let i = 0; i < maneZ.length; i++) {
    const z = maneZ[i];
    const h = skin.nearest([0, 1.48, z]);
    const height = 0.13 + (1 - i / (maneZ.length + 1)) * 0.1;
    const width = 0.09 + (1 - i / (maneZ.length + 1)) * 0.025;
    const outline: [number, number, "sharp"][] = [
      [-width, 0, "sharp"],
      [width, 0, "sharp"],
      [width * 0.55, height * 0.7, "sharp"],
      [0, height, "sharp"],
      [-width * 0.55, height * 0.7, "sharp"],
    ];
    b.extrude(outline, {
      at: h,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.004,
      color: ink,
      bone: body,
      name: `maneInk${i}`,
      group: "mane",
    });
    b.extrude(
      outline.map(([x, y]) => [x * 0.72, y * 0.84, "sharp"] as [number, number, "sharp"]),
      {
        at: h.moved([0, 0.014, 0]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: i % 2 ? magenta : teal,
        bone: body,
        name: `maneBlade${i}`,
        group: "mane",
      },
    );
    if (i < 5) {
      b.extrude(
        [
          [-width * 0.3, height * 0.2, "sharp"],
          [width * 0.3, height * 0.2, "sharp"],
          [0, height * 0.82, "sharp"],
        ],
        {
          at: h.moved([0, 0.026, 0]),
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.009,
          color: yellow,
          bone: body,
          name: `maneTip${i}`,
          group: "mane",
        },
      );
    }
  }

  // Three cream chest tufts rising into the neck root.
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.075;
    const h = skin.nearest([x, 1.27, 0.76]);
    b.spike(h, [0, 1, 0], 0.13 - Math.abs(i - 1) * 0.018, 0.031, {
      color: cream,
      bone: body,
      name: `chestTuft${i}`,
      group: "bib",
    });
    b.spike(h.moved([0, 0.008, 0]), [0, 1, 0], 0.08, 0.008, {
      color: ink,
      bone: body,
      name: `chestTuftInk${i}`,
      group: "bib",
    });
  }

  // Tiny painted shoulder rosettes to key the wing mounts visually.
  for (const s of [1, -1]) {
    const h = skin.nearest([s * 0.39, 1.38, 0.34]);
    torus(h, 0.052, 0.009, tealDark, `shoulderRosette${s}`);
    disc(h.moved([0, 0.006, 0]), 0.023, yellow, `shoulderRosetteCore${s}`);
  }

  return torso;
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const tailPath = catmull([
    [0, 1.05, -0.72],
    [0, 1.02, -1.08],
    [0, 0.98, -1.38],
    [0, 1.10, -1.68],
    [0, 1.25, -2.15],
  ]);

  const tail = b.sweep(tailPath, (t: number) => {
    if (t < 0.72) return 0.11 - t * 0.055;
    return 0.07 - (t - 0.72) * 0.06;
  }, {
    bone: [J.tail1, J.tail2, J.tail3],
    color: P.coat,
    sides: 8,
    sectors: [
      [128, 232, P.cream],
    ],
    caps: { start: "round", end: "flat" },
    name: "alebrijeTail",
    group: "tail",
  });

  const torus = (
    center: THREE.Vector3,
    axis: THREE.Vector3,
    major: number,
    tube: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.part(
      new THREE.TorusGeometry(major, tube, 6, 12),
      color,
      {
        at: center,
        dir: axis,
        bone,
        name,
        group: "tail",
        flat: true,
      },
    );
  };

  // Five bold painted bands, each with a dark ink keyline on either edge.
  const bandTs = [0.13, 0.30, 0.47, 0.64, 0.81];
  bandTs.forEach((t, i) => {
    const center = tailPath.at(t);
    const tangent = tailPath.tangentAt(t).normalize();
    const radius = 0.11 - 0.052 * t;

    torus(
      center,
      tangent,
      radius + 0.009,
      0.012,
      P.ink,
      tail.at(t).bone,
      `tailBandInkA${i}`,
    );
    torus(
      center,
      tangent,
      radius + 0.006,
      0.010,
      P.teal,
      tail.at(t).bone,
      `tailBand${i}`,
    );
    torus(
      center,
      tangent,
      radius + 0.002,
      0.004,
      P.ink,
      tail.at(t).bone,
      `tailBandInkB${i}`,
    );
  });

  // Small upper rosette rings between the painted bands.
  [0.21, 0.38, 0.55, 0.72].forEach((t, i) => {
    const hit = tail.at(t, 0, 0.006);
    const ring = b.part(
      new THREE.TorusGeometry(0.025 - t * 0.006, 0.006, 6, 10),
      P.tealDark,
      {
        at: hit.at,
        dir: hit.n,
        bone: hit.bone,
        name: `tailRosette${i}`,
        group: "tail",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.014 - t * 0.002, 6, 4),
      P.coat,
      {
        at: hit.at.clone().addScaledVector(hit.n, 0.006),
        bone: hit.bone,
        name: `tailRosetteCore${i}`,
        group: "tail",
        flat: true,
      },
    );
    void ring;
  });

  // Collar where the plume meets the tail.
  const tipCenter = new THREE.Vector3(0, 1.25, -2.15);
  const tipTangent = new THREE.Vector3(0, 0.6, -0.6).normalize();

  torus(
    tipCenter,
    tipTangent,
    0.068,
    0.014,
    P.ink,
    J.tail3,
    "plumeCollarInk",
  );
  torus(
    tipCenter,
    tipTangent,
    0.064,
    0.011,
    P.yellow,
    J.tail3,
    "plumeCollar",
  );
  torus(
    tipCenter.clone().addScaledVector(tipTangent, 0.004),
    tipTangent,
    0.064,
    0.004,
    P.magenta,
    J.tail3,
    "plumeCollarStripe",
  );

  const featherOutline: [number, number, "sharp"][] = [
    [-0.030, 0.00, "sharp"],
    [-0.044, 0.075, "sharp"],
    [-0.027, 0.235, "sharp"],
    [0.00, 0.38, "sharp"],
    [0.027, 0.235, "sharp"],
    [0.044, 0.075, "sharp"],
    [0.030, 0.00, "sharp"],
  ];

  const featherInner = (length: number): [number, number, "sharp"][] => [
    [-0.024, 0.00, "sharp"],
    [-0.035, length * 0.22, "sharp"],
    [-0.021, length * 0.67, "sharp"],
    [0.00, length, "sharp"],
    [0.021, length * 0.67, "sharp"],
    [0.035, length * 0.22, "sharp"],
    [0.024, 0.00, "sharp"],
  ];

  const blade = (
    i: number,
    side: number,
    length: number,
    color: string,
  ) => {
    const spread = side * (i - 4) * 0.095;
    const featherDir = new THREE.Vector3(
      spread,
      0.46 + (1 - Math.abs(i - 4) / 4) * 0.10,
      -0.82,
    ).normalize();

    const across = new THREE.Vector3(1, 0, 0);
    across.addScaledVector(featherDir, -across.dot(featherDir)).normalize();
    const normal = new THREE.Vector3().crossVectors(across, featherDir).normalize();

    const root = tipCenter.clone().addScaledVector(featherDir, 0.008);
    const outer = b.extrude(featherOutline, {
      at: root,
      x: across,
      y: featherDir,
      thickness: 0.018,
      bevel: 0.002,
      bone: J.tail3,
      color: P.ink,
      name: `plume${i}Outline`,
      group: "tailPlume",
    });
    void outer;

    const faceRoot = root.clone().addScaledVector(normal, 0.010);
    b.extrude(featherInner(length), {
      at: faceRoot,
      x: across,
      y: featherDir,
      thickness: 0.012,
      bevel: 0.001,
      bone: J.tail3,
      color,
      name: `plume${i}Magenta`,
      group: "tailPlume",
    });

    // A strong teal painted shaft across the middle of every feather.
    const stripeRoot = root
      .clone()
      .addScaledVector(featherDir, length * 0.40)
      .addScaledVector(normal, 0.017);

    b.extrude([
      [-0.014, 0.00, "sharp"],
      [0.014, 0.00, "sharp"],
      [0.012, length * 0.25, "sharp"],
      [0.00, length * 0.34, "sharp"],
      [-0.012, length * 0.25, "sharp"],
    ], {
      at: stripeRoot,
      x: across,
      y: featherDir,
      thickness: 0.006,
      bevel: 0.001,
      bone: J.tail3,
      color: P.teal,
      name: `plume${i}TealStripe`,
      group: "tailPlume",
    });

    // Cream pointed terminal painted over the magenta blade.
    const tipRoot = root
      .clone()
      .addScaledVector(featherDir, length * 0.72)
      .addScaledVector(normal, 0.018);

    b.extrude([
      [-0.020, 0.00, "sharp"],
      [0.020, 0.00, "sharp"],
      [0.014, length * 0.17, "sharp"],
      [0.00, length * 0.28, "sharp"],
      [-0.014, length * 0.17, "sharp"],
    ], {
      at: tipRoot,
      x: across,
      y: featherDir,
      thickness: 0.006,
      bevel: 0.001,
      bone: J.tail3,
      color: P.cream,
      name: `plume${i}CreamTip`,
      group: "tailPlume",
    });
  };

  // Nine fan feathers: the middle is longest, outer feathers flare sideways.
  for (let i = 0; i < 9; i++) {
    const distance = Math.abs(i - 4) / 4;
    const length = 0.38 - distance * 0.14;
    blade(i, 1, length, i % 2 === 0 ? P.magenta : P.magentaDark);
  }

  // Tiny green and yellow accent studs at the plume roots.
  for (const s of [-1, 1]) {
    const p = tipCenter.clone().add(new THREE.Vector3(s * 0.045, 0.015, 0.008));
    b.part(
      new THREE.SphereGeometry(0.012, 6, 4),
      P.green,
      {
        at: p,
        bone: J.tail3,
        name: `plumeRootDot${s > 0 ? "L" : "R"}`,
        group: "tailPlume",
        flat: true,
      },
    );
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  rng,
} from "agentic-3js-builder";
import { animeEye } from "agentic-3js-builder/kits/toon";

export function buildHead({ b, J, P, M }: Ctx) {
  const coat = P.coat;
  const coatShade = P.coatShade;
  const cream = P.cream;
  const white = P.white;
  const ink = P.ink;
  const teal = P.teal;
  const tealDark = P.tealDark;
  const magenta = P.magenta;
  const magentaDark = P.magentaDark;
  const yellow = P.yellow;
  const yellowOrange = P.yellowOrange;
  const green = P.green;
  const red = P.red;
  const beak = P.beak;
  const beakShade = P.beakShade;
  const tongue = P.tongue;

  const neckRoot = M.neckBase;
  const headPoint: [number, number, number] = [0, 1.5, 1.15];
  const skullCenter: [number, number, number] = [0, 1.53, 1.34];

  const flat = (g: THREE.BufferGeometry, color: string, options: any) =>
    b.part(g, color, { flat: true, ...options });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any,
    name: string,
  ) =>
    flat(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
    });

  const smallDisc = (
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    dir: [number, number, number],
    bone: any,
    name: string,
  ) =>
    flat(new THREE.CylinderGeometry(radius, radius, depth, 12, 1), color, {
      at,
      dir,
      bone,
      name,
    });

  const feather = (
    at: [number, number, number],
    outline: [number, number, "sharp"][] | [number, number][],
    color: string,
    bone: any,
    name: string,
    thickness = 0.018,
  ) =>
    b.extrude(outline, {
      at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
      bone,
      name,
    });

  const sideBlade = (
    at: [number, number, number],
    side: number,
    outline: [number, number, "sharp"][] | [number, number][],
    color: string,
    bone: any,
    name: string,
    thickness = 0.018,
  ) =>
    b.extrude(outline, {
      at,
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
      bone,
      name,
    });

  // ------------------------------------------------------------------------------------------------
  // Neck: a compact, bent, low-poly tube with a cream throat panel.

  const neckPath = catmull([
    neckRoot,
    [0, 1.34, 0.84],
    [0, 1.45, 1.00],
    headPoint,
  ]);

  const neckTube = b.sweep(neckPath, (t: number) => 0.17 - 0.025 * t, {
    bone: J.neck,
    color: coat,
    sides: 8,
    caps: "round",
    name: "neckCoat",
    group: "head",
  });

  // Dark warm underside gives the painted wooden neck a carved, graphic underside.
  b.sweep(neckPath, (t: number) => 0.172 - 0.025 * t, {
    bone: J.neck,
    color: coatShade,
    sectors: [[105, 255, coatShade]],
    sides: 8,
    caps: "none",
    name: "neckShadow",
    group: "head",
  });

  const bib = b.extrude(
    [
      [-0.105, 0.0],
      [0.105, 0.0],
      [0.082, 0.18],
      [0.055, 0.38],
      [0.0, 0.47],
      [-0.055, 0.38],
      [-0.082, 0.18],
    ],
    {
      at: [0, 1.305, 0.855],
      x: [1, 0, 0],
      y: [0, 0.82, 0.58],
      thickness: 0.018,
      bevel: 0.004,
      color: cream,
      bone: J.neck,
      name: "creamThroatBib",
      group: "head",
    },
  );

  // Ink edging on both sides of the bib.
  b.rod(
    [bib.local([-0.105, 0.0, 0.014]), bib.local([-0.082, 0.18, 0.014])],
    0.008,
    { color: ink, bone: J.neck, name: "bibEdgeL", group: "head" },
  );
  b.rod(
    [bib.local([0.105, 0.0, 0.014]), bib.local([0.082, 0.18, 0.014])],
    0.008,
    { color: ink, bone: J.neck, name: "bibEdgeR", group: "head" },
  );

  // ------------------------------------------------------------------------------------------------
  // Feather ruff at the chest / neck junction.

  const ruff = b.ring(
    frame(neckRoot, [0, 1, 0]),
    {
      count: 12,
      radius: 0.145,
      fromDeg: 0,
      toDeg: 360,
      name: "ruff",
      parent: J.neck,
      role: "fan",
      group: "head",
    },
  );

  ruff.items.forEach((item: any, i: number) => {
    const c = i % 3 === 0 ? magenta : i % 3 === 1 ? teal : cream;
    b.spike(item, item, 0.15 + (i % 2) * 0.025, 0.045, {
      color: c,
      bone: J.neck,
      caps: "point",
      name: `ruffFeather${i}`,
      group: "head",
    });
    if (i % 3 !== 2) {
      const tip = item.moved([0, 0.095, 0]);
      b.spike(tip, item, 0.045, 0.022, {
        color: cream,
        bone: J.neck,
        caps: "point",
        name: `ruffTip${i}`,
        group: "head",
      });
    }
  });

  // Small painted collar rings, deliberately chunky and geometric.
  const collarPath = catmull([
    [0, 1.285, 0.72],
    [0.135, 1.315, 0.76],
    [0, 1.345, 0.85],
    [-0.135, 1.315, 0.76],
  ], { closed: true });

  b.sweep(collarPath, 0.014, {
    color: ink,
    bone: J.neck,
    sides: 6,
    name: "ruffInkCollar",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------------
  // Eagle skull: a faceted oval backed by a blocky cheek and brow mass.

  const skull = flat(
    new THREE.SphereGeometry(1, 12, 8),
    coat,
    {
      at: skullCenter,
      bone: J.head,
      scale: [0.205, 0.205, 0.255],
      name: "eagleSkull",
      group: "head",
    },
  );

  box(
    [0.29, 0.16, 0.24],
    coatShade,
    [0, 1.43, 1.30],
    J.head,
    "lowerCheekMass",
  );

  // Crown cap creates the strong painted silhouette behind the crest.
  flat(new THREE.SphereGeometry(1, 10, 6), tealDark, {
    at: [0, 1.69, 1.27],
    bone: J.head,
    scale: [0.17, 0.075, 0.18],
    name: "crownCap",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------------
  // Eyes: large anime decals conformed to either side/front of the skull.

  const eyeTexture = animeEye({
    iris: yellowOrange,
    irisLight: yellow,
    irisDark: magentaDark,
    ink,
    blush: magenta,
    brow: true,
    size: 256,
  });

  const skullSurface = b.surface(skull);
  const eyeR = skullSurface.around(skullCenter).at(-48, 3);
  const eyeL = skullSurface.around(skullCenter).at(48, 3);

  if (eyeR) {
    b.decal(skullSurface, eyeTexture, {
      at: eyeR.at,
      dir: [ -0.48, 0.02, 0.88 ],
      up: [0, 1, 0],
      size: [0.135, 0.18],
      segments: 8,
      lift: 0.006,
      mirror: false,
      bone: J.head,
      name: "eyeR",
      group: "head",
    });
  }

  if (eyeL) {
    b.decal(skullSurface, eyeTexture, {
      at: eyeL.at,
      dir: [ 0.48, 0.02, 0.88 ],
      up: [0, 1, 0],
      size: [0.135, 0.18],
      segments: 8,
      lift: 0.006,
      mirror: true,
      bone: J.head,
      name: "eyeL",
      group: "head",
    });
  }

  // Heavy separate brow slabs reinforce the carved-mask expression.
  for (const side of [-1, 1]) {
    sideBlade(
      [side * 0.145, 1.675, 1.425],
      side,
      [
        [0, 0],
        [0.12, 0.015],
        [0.16, 0.045],
        [0.09, 0.065],
        [0, 0.042],
      ],
      ink,
      J.head,
      `brow${side < 0 ? "R" : "L"}`,
      0.012,
    );

    // Magenta teardrop feather behind each eye.
    sideBlade(
      [side * 0.20, 1.54, 1.30],
      side,
      [
        [0, 0],
        [0.055, 0.035],
        [0.09, 0.11],
        [0.048, 0.17],
        [0.008, 0.115],
      ],
      magenta,
      J.head,
      `eyeFeather${side < 0 ? "R" : "L"}`,
      0.014,
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Beak and open mouth.

  // Dark mouth cavity behind the two separated mandibles.
  flat(new THREE.BoxGeometry(0.19, 0.105, 0.20), ink, {
    at: [0, 1.465, 1.575],
    dir: [0, 0, 1],
    bone: J.head,
    name: "mouthCavity",
    group: "head",
  });

  // Upper hooked beak in a side-profile extrusion.
  feather(
    [0, 1.535, 1.505],
    [
      [0.00, 0.095, "sharp"],
      [0.22, 0.095, "sharp"],
      [0.33, 0.045, "sharp"],
      [0.37, -0.015, "sharp"],
      [0.31, -0.085, "sharp"],
      [0.23, -0.12, "sharp"],
      [0.26, -0.045, "sharp"],
      [0.12, 0.005, "sharp"],
      [0.00, 0.025, "sharp"],
    ],
    beak,
    J.head,
    "hookedUpperBeak",
    0.105,
  );

  // Beak underside, a warm ochre wedge visible from below.
  feather(
    [0, 1.49, 1.515],
    [
      [0.015, 0.025],
      [0.25, -0.015],
      [0.36, -0.04],
      [0.29, -0.09],
      [0.13, -0.055],
      [0.0, -0.01],
    ],
    beakShade,
    J.head,
    "beakUnderside",
    0.112,
  );

  // Cere stripe at the skull/beak join.
  b.rod(
    [0, 1.55, 1.48],
    [0, 1.55, 1.585],
    0.012,
    {
      color: ink,
      bone: J.head,
      name: "beakCere",
      group: "head",
    },
  );

  // Lower mandible is on the jaw bone, visibly dropped from the upper beak.
  feather(
    [0, 1.385, 1.48],
    [
      [0.0, 0.045, "sharp"],
      [0.20, 0.035, "sharp"],
      [0.29, -0.005, "sharp"],
      [0.22, -0.055, "sharp"],
      [0.08, -0.035, "sharp"],
      [0.0, -0.015, "sharp"],
    ],
    beak,
    J.jaw,
    "lowerMandible",
    0.065,
  );

  feather(
    [0, 1.405, 1.475],
    [
      [0.0, 0.02],
      [0.19, 0.012],
      [0.25, -0.012],
      [0.08, -0.025],
      [0, -0.01],
    ],
    beakShade,
    J.jaw,
    "lowerMandibleShade",
    0.072,
  );

  // Red tongue projects through the open mouth.
  feather(
    [-0.012, 1.435, 1.56],
    [
      [0, 0],
      [0.16, 0.008],
      [0.205, -0.022],
      [0.14, -0.05],
      [0.035, -0.043],
    ],
    tongue,
    J.jaw,
    "tongue",
    0.018,
  );

  // Cream gum rails and a row of triangular teeth on each side.
  b.rod(
    [-0.092, 1.545, 1.515],
    [-0.092, 1.545, 1.70],
    0.014,
    { color: cream, bone: J.head, name: "gumR", group: "head" },
  );
  b.rod(
    [0.092, 1.545, 1.515],
    [0.092, 1.545, 1.70],
    0.014,
    { color: cream, bone: J.head, name: "gumL", group: "head" },
  );

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = 1.545 + i * 0.036;
      flat(new THREE.ConeGeometry(0.016, 0.065, 6), white, {
        at: [side * 0.092, 1.505, z],
        dir: [0, -1, 0],
        bone: J.head,
        name: `upperTooth${side < 0 ? "R" : "L"}${i}`,
        group: "head",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Crown crest: seven layered, dark-edged feathers with yellow tips.

  const crestHeights = [0.27, 0.39, 0.51, 0.60, 0.51, 0.39, 0.27];
  const crestX = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];

  for (let i = 0; i < crestHeights.length; i++) {
    const x = crestX[i];
    const h = crestHeights[i];
    const lean = (i - 3) * 0.035;
    const baseZ = 1.255 - Math.abs(i - 3) * 0.008;
    const dark = i % 2 === 0 ? tealDark : magentaDark;
    const bright = i % 2 === 0 ? teal : magenta;

    feather(
      [x, 1.665, baseZ],
      [
        [0, 0],
        [lean - 0.045, h * 0.35],
        [lean, h, "sharp"],
        [lean + 0.045, h * 0.45],
        [0.045, 0.03],
      ],
      dark,
      J.head,
      `crestInk${i}`,
      0.028,
    );

    feather(
      [x, 1.672, baseZ + 0.006],
      [
        [0.012, 0.015],
        [lean - 0.025, h * 0.38],
        [lean, h * 0.82, "sharp"],
        [lean + 0.025, h * 0.43],
        [0.028, 0.035],
      ],
      bright,
      J.head,
      `crestFeather${i}`,
      0.020,
    );

    feather(
      [x + lean * 0.8, 1.672 + h * 0.78, baseZ],
      [
        [-0.027, 0],
        [0.0, h * 0.22],
        [0.027, 0],
        [0.015, -h * 0.08],
        [-0.015, -h * 0.08],
      ],
      yellow,
      J.head,
      `crestTip${i}`,
      0.022,
    );
  }

  // Side ear/temple tufts.
  for (const side of [-1, 1]) {
    sideBlade(
      [side * 0.17, 1.675, 1.26],
      side,
      [
        [0, 0],
        [0.05, 0.10],
        [0.11, 0.21, "sharp"],
        [0.13, 0.08],
        [0.06, 0.02],
      ],
      teal,
      J.head,
      `sideCrest${side < 0 ? "R" : "L"}`,
      0.022,
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Cheek plumage: overlapping teal shingles under the eyes.

  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = side * (0.13 + i * 0.018);
      const y = 1.46 - i * 0.045;
      const z = 1.31 + i * 0.012;

      sideBlade(
        [x, y, z],
        side,
        [
          [0, 0],
          [0.065, 0.02],
          [0.095, 0.075],
          [0.045, 0.125],
          [0.008, 0.07],
        ],
        i % 2 === 0 ? teal : tealDark,
        J.head,
        `cheekShingle${side < 0 ? "R" : "L"}${i}`,
        0.016,
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Temple medallions: concentric carved dots on each side of the head.

  for (const side of [-1, 1]) {
    const outward: [number, number, number] = [side, 0.04, 0.22];
    const center: [number, number, number] = [side * 0.205, 1.57, 1.295];

    smallDisc(center, 0.062, 0.014, ink, outward, J.head, `templeInk${side}`);
    smallDisc(
      [side * 0.207, 1.57, 1.295],
      0.048,
      0.018,
      green,
      outward,
      J.head,
      `templeGreen${side}`,
    );
    smallDisc(
      [side * 0.211, 1.57, 1.295],
      0.026,
      0.021,
      cream,
      outward,
      J.head,
      `templeCream${side}`,
    );
    smallDisc(
      [side * 0.215, 1.57, 1.295],
      0.012,
      0.024,
      magenta,
      outward,
      J.head,
      `templeMagenta${side}`,
    );
  }

  // A few little painted diamonds on the throat make the neck read as hand-decorated wood.
  for (let i = 0; i < 3; i++) {
    feather(
      [-0.035 + i * 0.035, 1.39 + i * 0.075, 1.04 + i * 0.025],
      [
        [0, 0.025],
        [0.018, 0],
        [0, -0.025],
        [-0.018, 0],
      ],
      i === 1 ? yellow : teal,
      J.neck,
      `throatDiamond${i}`,
      0.012,
    );
  }
}
```