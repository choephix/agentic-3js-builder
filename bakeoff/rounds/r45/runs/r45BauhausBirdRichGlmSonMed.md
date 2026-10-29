<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird on a Branch",
  "description": "A stylized songbird assembled from pure circles, half-circles, triangles and bars in hard red, yellow, blue, black and cream, perched on a felled branch resting on the floor.",
  "builderName": "bauhausSongbird",
  "size": [0.65, 0.78, 1.9],
  "layout": "Model space: +Y up, bird faces +Z, centred on x=0. The ground line is a straight felled branch of radius about 0.085 lying along Z from z=-0.95 to z=+0.88, centre line at y=0.09, so its lowest points touch y=0; its front end (z=+0.88) is a flat cut face showing concentric growth-ring discs, its rear end is a rough broken taper, and a knobbly side twig rises from the branch's left-rear (+X side) at z=-0.35 up to y about 0.46, carrying three flat geometric leaves (a blue circle, a yellow half-disc, a red triangle) and small yellow bud spheres. The bird perches on top of the branch at z=+0.05, feet gripping the branch top at y=0.175: an egg-shaped blue torso (centre about [0, 0.42, 0.04], about 0.14 x 0.185 x 0.17, chest tilted slightly forward) with a bold red half-disc breast plate on its front, a cream lower belly bulge, and a black rump band; a round black head (r about 0.095) at [0, 0.66, 0.17] with a cream cheek patch, large side eyes (white ring, black pupil, both visible from the front), a yellow triangular beak pointing forward-down to z about 0.34, and a tiny blue crest wedge; folded black wings as flat slabs hugging each flank from the shoulders (x about plus/minus 0.13, y 0.53) down-back to pointed tips near [x, 0.34, -0.30], each wearing a white bar and a yellow bar near the trailing edge with three stepped primary tips; a fan tail of five flat feather slabs sloping down-back from the rump at [0, 0.45, -0.10] to z about -0.55, blue with a black base band and yellow tips; thin black legs from the belly down to the perch with three forward toes and one rear toe wrapping the branch. The Bauhaus style shows everywhere: every piece is a pure primitive silhouette (spheres, cones, cylinders, extruded circles, half-discs and triangles), every colour a hard flat fill, seams and outlines are thin black parts seated on the surface, and the primaries red-yellow-blue carry the bird while wood browns stay quiet beneath it.",
  "palette": {
    "blue": "#1f4fa3",
    "blueDark": "#15336b",
    "red": "#d9382a",
    "yellow": "#f2b31c",
    "black": "#1d1a17",
    "cream": "#f4ead6",
    "white": "#ffffff",
    "wood": "#8a5a33",
    "woodDark": "#5f3c20",
    "woodCut": "#d9b98a",
    "barkLine": "#3a2412"
  },
  "mounts": {
    "perchTop": [0, 0.175, 0.05],
    "neckBase": [0, 0.56, 0.12],
    "tailRoot": [0, 0.45, -0.10],
    "wingShoulderL": [0.13, 0.53, 0.08],
    "wingShoulderR": [-0.13, 0.53, 0.08]
  },
  "joints": [
    { "name": "root", "at": [0, 0.09, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "body", "parent": "root", "at": [0, 0.40, 0.03], "dir": [0, 0.55, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 0.56, 0.12], "dir": [0, 0.65, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.64, 0.17], "dir": [0, 0.45, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.63, 0.24], "dir": [0, -0.2, 1], "role": "jaw" },
    { "name": "tail", "parent": "body", "at": [0, 0.45, -0.10], "dir": [0, -0.35, -1], "role": "tail" },
    { "name": "legL", "parent": "body", "at": [0.05, 0.30, 0.05], "dir": [0, -1, 0.08], "role": "leg" },
    { "name": "legR", "parent": "body", "at": [-0.05, 0.30, 0.05], "dir": [0, -1, 0.08], "role": "leg" }
  ],
  "parts": [
    {
      "id": "branch",
      "builds": "The felled branch and everything on it. Main log: a tapered cylinder (radius 0.095 at the rear end down to 0.075 at the front) along Z from z=-0.95 to z=+0.88, axis at y=0.09 so the bark rests on the floor; wood colour, flat-shaded. Front cut face: a flat disc of woodCut closing the tube at z=+0.88 facing +Z, with two thinner concentric discs stepped slightly forward (woodDark inner, woodCut again, radii about 0.05 and 0.03) reading as growth rings, plus a tiny black centre dot. Rear end tapers to a rough broken stub with a woodDark cap. Two knuckle bulges (slightly flattened woodDark spheres, r about 0.05) embedded in the bark at z=-0.6 and z=+0.4, and 6 small cream lichen dots (flattened spheres r 0.015-0.025) scattered on the upper surface between z=-0.8 and z=+0.7, avoiding the perch point at z=+0.05. Side twig: a rod of radius 0.03 from [0.10, 0.11, -0.35] rising to [0.22, 0.46, -0.30] with a short sub-twig forking to [0.30, 0.40, -0.20], woodDark; on its tips three flat geometric leaves as thin extruded shapes (thickness about 0.012): a blue circle-leaf (r 0.07), a yellow half-disc-leaf (r 0.08, flat edge toward the twig), and a red triangle-leaf (about 0.12 tall), each tilted at a different angle, plus 5 small yellow bud spheres (r 0.018) dotted along the twig. All branch geometry rides the root joint; the twig tips stay under y=0.55 and x under 0.32.",
      "box": [[-0.14, 0, -0.98], [0.32, 0.55, 0.90]],
      "attaches": "Rests on the floor by itself (floor: true). The bird's feet land on its top surface at mount perchTop [0, 0.175, 0.05]; leave that spot clear of lichen and knuckles.",
      "joints": ["root"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "torso",
      "builds": "The bird's egg body. A blue sphere scaled to an egg (about 0.14 x 0.185 x 0.17 radii) centred at [0, 0.42, 0.04], tilted so the chest sits low at the front (z about +0.19, y about 0.34) and the rump high at the back (z about -0.11, y about 0.50). Breast: a bold red half-disc (extruded half-circle, thickness about 0.035, flat edge down) seated on the front of the chest at about [0, 0.40, 0.165], radius 0.10, arc on top, facing +Z so it reads as a robin-like bib from the front. Lower belly: a cream sphere (r about 0.115) at [0, 0.33, 0.06] bulging out under the chest between the legs. Rump: a thin black band (a short tube or torus segment) round the rear of the egg at about [0, 0.46, -0.09] where it meets the tail mount. Shoulder line: two small blue dome caps (r 0.05) at the wing mounts [plus/minus 0.13, 0.53, 0.08] so the wings seat into the body. A few black seam dots (r 0.008) in a row along the top of the back for rhythm. Torso rides the body joint; keep the belly bottom above y=0.26 since the legs bridge the gap to the branch.",
      "box": [[-0.16, 0.22, -0.16], [0.16, 0.62, 0.26]],
      "attaches": "Feet land on the branch at mount perchTop via the legs part; rear meets the tail at mount tailRoot [0, 0.45, -0.10]; top meets the head at mount neckBase [0, 0.56, 0.12]; wings bolt onto the shoulders at wingShoulderL and wingShoulderR.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "head",
      "builds": "The round black head and its face. Skull: a black sphere r 0.095 centred at [0, 0.66, 0.17], tilted slightly forward. Cheek patch: a cream flat disc (extruded circle, thickness 0.015, radius 0.055) seated on each side of the head below and behind the eye at about [plus/minus 0.075, 0.63, 0.15], facing outward. Eyes: on each side at [plus/minus 0.082, 0.68, 0.20] a white sphere (r 0.028) with a black pupil sphere (r 0.015) seated forward on it; both eyes placed far enough forward that they read from the front. Brow accents: two tiny yellow wedge bars above each eye. Beak: a yellow cone (base radius 0.032, length 0.10) from the beak base at [0, 0.64, 0.245] pointing forward and slightly down to a tip at about [0, 0.625, 0.34]; a thin black seam rod (r 0.004) runs along the mouth line from base to tip splitting upper and lower mandible, and the lower mandible is a separate thinner yellow cone (base r 0.024, length 0.08) under the seam so the jaw can open, riding the jaw joint. Crest: one small blue triangle wedge (extruded, about 0.05 tall) standing on the crown at [0, 0.75, 0.14], leaning back. All head geometry rides the head joint except the lower mandible on the jaw joint.",
      "box": [[-0.12, 0.54, 0.06], [0.12, 0.78, 0.36]],
      "attaches": "Sits on the torso at mount neckBase [0, 0.56, 0.12]; the skull's underside overlaps the torso's top so there is no gap.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "wings",
      "builds": "Both folded wings, mirrored left and right. Each wing is a flat teardrop slab (extruded leaf shape, thickness about 0.035, smoothing 2) rooted at its shoulder mount [plus/minus 0.13, 0.53, 0.08] and laid flat against the flank, sweeping down and back to a pointed tip near [plus/minus 0.10, 0.34, -0.30], black. On each wing near the trailing edge: a cream/white bar (thin extruded strip crossing the wing, about 0.02 thick, seated just proud of the black surface) and a yellow bar below it near the tip, so two hard colour stripes band the folded wing. At the tip, three stepped primary feather slabs (thin flat quads, about 0.09 long, thickness 0.015, staggered 0.02 apart) in blueDark poking past the black tip in a staircase, echoing the Bauhaus rhythm. A thin blue-dark edge line (thin rod or strip) traces the wing's leading edge from shoulder to wrist. Both wings ride the body joint rigidly; keep them inside x = plus/minus 0.26 and clear of the tail slabs.",
      "box": [[-0.26, 0.30, -0.32], [0.26, 0.58, 0.24]],
      "attaches": "Rooted on the torso's shoulders at mount wingShoulderL [0.13, 0.53, 0.08] and wingShoulderR [-0.13, 0.53, 0.08], with the wing root buried slightly into the torso egg so no gap shows; tips reach back over the tail root without touching the tail slabs.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "tail",
      "builds": "The fanned tail: five flat feather slabs (thin extruded shapes, thickness about 0.016) fanning from the mount tailRoot [0, 0.45, -0.10] down and back to tips around z about -0.52 to -0.58, y about 0.28-0.32; the centre slab is longest, the outer two shorter and angled about 12-18 degrees each side, so the fan reads as a clean triangle silhouette. Each feather is blue with a black band (a thin black slab across the feather's base third) and a yellow tip band (a thin slab across the last 15% of its length); the underside-facing edges can take cream tips on the two outermost feathers. A small black wedge (the rump coverts) caps the fan's root where it meets the torso's rump band. All tail geometry rides the tail joint.",
      "box": [[-0.14, 0.24, -0.60], [0.14, 0.48, -0.06]],
      "attaches": "Rooted into the torso at mount tailRoot [0, 0.45, -0.10], passing just under the wing tips; stays clear of the branch surface (its lowest point around y=0.24, above the branch top of y about 0.175).",
      "joints": ["tail"],
      "floor": false,
      "budget": 90
    },
    {
      "id": "legs",
      "builds": "The legs and feet that grip the perch. Each leg: a thin black cylinder (r 0.012) from the belly at [plus/minus 0.05, 0.30, 0.05] straight down to the branch top at [plus/minus 0.05, 0.185, 0.05], landing exactly on mount perchTop, with a tiny yellow ring band (thin torus, r 0.014) as an anklet just above the foot. Each foot: three forward toes as short bent rods (r 0.008, about 0.05 long each) spreading at about -35, 0 and +35 degrees around the front of the branch and curling down its sides to about y=0.10, plus one rear toe rod curling back around the branch's underside at z about 0.0, all black with tiny cream claw tips (small cones, 0.012 long). The toes visibly wrap the branch so the grip reads from the front. Leg geometry rides the legL and legR joints; toes ride their own leg's joint.",
      "box": [[-0.09, 0.09, -0.02], [0.09, 0.32, 0.14]],
      "attaches": "Feet land on the branch's top at mount perchTop [0, 0.175, 0.05]; thighs emerge from the torso's cream belly at about y=0.30, buried slightly into the egg so no gap shows.",
      "joints": ["body", "legL", "legR"],
      "floor": false,
      "budget": 80
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const YELLOW = P.yellow;
  const CREAM = P.cream;
  const perch = M.perchTop;
  const footY = perch[1] + 0.01; // toe-base height, resting on branch top
  const r = rng(11);

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.legL : J.legR;
    const x = s * 0.05;
    const top: [number, number, number] = [x, 0.31, 0.05];
    const ankle: [number, number, number] = [x, footY, perch[2]];

    // Leg shaft
    b.rod(top, ankle, 0.012, BLACK, { bone, sides: 8 });
    // Thigh knuckle where leg leaves the belly
    b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, { bone: J.body, at: [x, 0.295, 0.05] });

    // Anklet ring
    b.part(new THREE.TorusGeometry(0.014, 0.004, 6, 10), YELLOW, {
      bone,
      at: [x, footY + 0.025, perch[2]],
      dir: [0, 1, 0],
      axis: "z",
    });

    // Ankle knuckle
    b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, { bone, at: ankle });

    // Three forward toes wrapping the branch: bend over the top then curl down the front
    for (const ang of [-35, 0, 35]) {
      const a = (ang * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const p0: [number, number, number] = ankle;
      const p1: [number, number, number] = [x + dx * 0.03, footY - 0.003, perch[2] + dz * 0.03];
      const p2: [number, number, number] = [x + dx * 0.052, footY - 0.03, perch[2] + dz * 0.048];
      const p3: [number, number, number] = [x + dx * 0.055, 0.105, perch[2] + dz * 0.052];
      b.rod(p0, p1, 0.008, BLACK, { bone, sides: 6 });
      b.rod(p1, p2, 0.008, BLACK, { bone, sides: 6 });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: p1 });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: p2 });
      b.rod(p2, p3, 0.007, BLACK, { bone, sides: 6 });
      // claw tip
      b.spike(p3, [dx * 0.2, -1, dz * 0.2], 0.014, 0.005, { bone, color: CREAM, sides: 6 });
    }

    // Rear toe curling back around the underside
    const q0: [number, number, number] = ankle;
    const q1: [number, number, number] = [x, footY - 0.004, perch[2] - 0.03];
    const q2: [number, number, number] = [x, footY - 0.03, perch[2] - 0.048];
    const q3: [number, number, number] = [x, 0.105, perch[2] - 0.05];
    b.rod(q0, q1, 0.008, BLACK, { bone, sides: 6 });
    b.rod(q1, q2, 0.008, BLACK, { bone, sides: 6 });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: q1 });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: q2 });
    b.rod(q2, q3, 0.007, BLACK, { bone, sides: 6 });
    b.spike(q3, [0, -1, -0.2], 0.014, 0.005, { bone, color: CREAM, sides: 6 });

    // Small scale bands on the shaft for Bauhaus rhythm
    for (const y of [0.27, 0.235]) {
      b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.004, 8), YELLOW, {
        bone,
        at: [x, y + r() * 0.0, 0.05],
      });
    }
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const root = new THREE.Vector3(...M.tailRoot);
  const tail = J.tail;
  const r = rng(11);

  // Fan of 5 feathers. Each feather is drawn in a local plane: x across, y along its length.
  // Direction in the YZ plane: pitch down-back; yaw spreads sideways.
  const spread = [-16, -8, 0, 8, 16];
  const lens = [0.36, 0.43, 0.48, 0.43, 0.36];
  const pitch = 22; // degrees below horizontal pointing back

  spread.forEach((yawDeg, i) => {
    const L = lens[i];
    const yaw = (yawDeg * Math.PI) / 180;
    const pt = (pitch * Math.PI) / 180;
    // direction of feather length (pointing back and down, spread in X)
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pt), -Math.sin(pt), -Math.cos(yaw) * Math.cos(pt)).normalize();
    // width axis: horizontal, perpendicular to dir
    const wide = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    const w = 0.04;
    const outline: [number, number, "sharp"?][] = [
      [-w * 0.6, 0],
      [w * 0.6, 0],
      [w, L * 0.55],
      [w * 0.55, L * 0.92],
      [0, L, "sharp"],
      [-w * 0.55, L * 0.92],
      [-w, L * 0.55],
    ];
    const start = root.clone().add(new THREE.Vector3(0, 0, 0.0));
    const lift = new THREE.Vector3().crossVectors(dir, wide).normalize(); // face normal
    const up = lift.y < 0 ? lift.clone().negate() : lift.clone();
    const mk = (pts: [number, number, "sharp"?][], color: string, th: number, off: number, lat = 0) =>
      b.extrude(pts as any, {
        at: start.clone().addScaledVector(up, off + (i % 2 ? 0.001 : 0)).addScaledVector(wide, lat),
        x: wide,
        y: dir,
        thickness: th,
        color,
        bone: tail,
      });
    mk(outline, P.blue, 0.016, 0);

    // black base band across the base third
    const b0 = L * 0.06, b1 = L * 0.3;
    const hw = (y: number) => (y < L * 0.55 ? w * 0.6 + (w * 0.4 * y) / (L * 0.55) : w);
    mk(
      [[-hw(b0) - 0.001, b0], [hw(b0) + 0.001, b0], [hw(b1) + 0.001, b1], [-hw(b1) - 0.001, b1]],
      P.black, 0.02, 0,
    );

    // tip band
    const outer = Math.abs(yawDeg) === 16;
    const t0 = L * 0.84, t1 = L * 0.965;
    const tw0 = w * 0.8, tw1 = w * 0.3;
    mk(
      [[-tw0, t0], [tw0, t0], [tw1, t1], [-tw1, t1]],
      outer ? P.cream : P.yellow, 0.02, 0,
    );
  });

  // rump coverts: black wedge capping the root
  b.extrude(
    [[-0.09, 0], [0.09, 0], [0.05, -0.07], [-0.05, -0.07]] as any,
    {
      at: [0, root.y + 0.005, root.z + 0.0],
      x: [1, 0, 0],
      y: [0, 0.2, -1],
      thickness: 0.03,
      color: P.black,
      bone: tail,
    },
  );
  b.part(new THREE.ConeGeometry(0.06, 0.12, 4), P.black, {
    at: [0, root.y + 0.01, root.z - 0.05],
    dir: [0, -0.2, -1],
    bone: tail,
  });

  // tiny cream pin at the fan hinge
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.cream, {
    at: [0, root.y + 0.03, root.z - 0.02],
    bone: tail,
  });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const C: [number, number, number] = [0, 0.66, 0.17];
  const R = 0.095;

  // Skull
  b.part(new THREE.SphereGeometry(1, 16, 12), P.black, {
    bone: head,
    at: C,
    scale: [R, R * 0.97, R * 1.03],
    rotation: [8, 0, 0],
    name: "skull",
  });

  // Neck collar bridging into torso
  b.part(new THREE.SphereGeometry(1, 12, 8), P.black, {
    bone: J.neck,
    at: [0, 0.58, 0.13],
    scale: [0.075, 0.06, 0.075],
    name: "neckBlock",
  });

  for (const s of [1, -1]) {
    // Cream cheek disc, facing outward
    const cheek = b.extrude(
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return [Math.cos(a) * 0.055, Math.sin(a) * 0.055] as [number, number];
      }),
      {
        at: [s * 0.083, 0.628, 0.15],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.015,
        color: P.cream,
        bone: head,
        name: "cheek",
      },
    );
    // thin black outline ring behind cheek
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.008, 14), P.black, {
      bone: head,
      at: [s * 0.078, 0.628, 0.15],
      dir: [s, 0, 0],
      name: "cheekRim",
    });

    // Eye: white sphere + black pupil
    const ex = s * 0.078, ey = 0.682, ez = 0.205;
    b.part(new THREE.SphereGeometry(0.03, 10, 8), P.white, {
      bone: head, at: [ex, ey, ez], name: "eyeWhite",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), P.black, {
      bone: head, at: [s * 0.088, ey, ez + 0.019], name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), P.white, {
      bone: head, at: [s * 0.09, ey + 0.007, ez + 0.032], name: "glint",
    });
    // black eye ring
    b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 14), P.black, {
      bone: head, at: [ex + s * 0.004, ey, ez], dir: [s, 0, 0.3], axis: "z", name: "eyeRing",
    });

    // Yellow brow wedges
    for (let k = 0; k < 2; k++) {
      b.extrude(
        [[0, 0], [0.032, 0.0], [0.0, 0.011, "sharp"]],
        {
          at: [s * (0.074 + k * 0.004), 0.716 + k * 0.01, 0.18 + k * 0.02],
          x: [0, 0, 1],
          y: [s * 0.4, 1, 0],
          thickness: 0.007,
          color: P.yellow,
          bone: head,
          name: "brow",
        },
      );
    }
  }

  // Upper beak
  const bs: [number, number, number] = [0, 0.642, 0.245];
  const tip: [number, number, number] = [0, 0.628, 0.34];
  b.spike(bs, tip, null, 0.032, { color: P.yellow, bone: head, sides: 6, name: "beakUpper" });

  // Lower mandible on jaw
  b.spike([0, 0.622, 0.248], [0, 0.616, 0.322], null, 0.023, {
    color: P.yellow, bone: jaw, sides: 6, name: "beakLower",
  });

  // Mouth seam
  b.rod([0, 0.632, 0.245], [0, 0.624, 0.325], 0.004, P.black, { bone: head, name: "seam" });

  // Nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.005, 5, 4), P.black, {
      bone: head, at: [s * 0.014, 0.652, 0.272], name: "nostril",
    });

  // Beak base band
  b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 12), P.black, {
    bone: head, at: [0, 0.642, 0.248], dir: [0, -0.15, 1], axis: "z", name: "beakBase",
  });

  // Crest wedge
  b.extrude(
    [[0, 0], [0.05, 0], [0.0, 0.055, "sharp"]],
    {
      at: [0, 0.742, 0.17],
      x: [0, 0.0, -1],
      y: [0, 1, 0],
      thickness: 0.016,
      color: P.blue,
      bone: head,
      name: "crest",
    },
  );
  b.extrude(
    [[0, 0], [0.035, 0], [0.0, 0.04, "sharp"]],
    {
      at: [0, 0.745, 0.19],
      x: [0, 0.0, -1],
      y: [0, 1, 0],
      thickness: 0.016,
      color: P.red,
      bone: head,
      name: "crestRed",
    },
  );
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const r = rng(11);

  // Teardrop outline in (u along wing from shoulder toward tip, v across).
  // u runs 0..0.44 (shoulder to tip), v is height of the slab across its width.
  const LEAF: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.05, 0.07],
    [0.2, 0.085],
    [0.34, 0.05],
    [0.46, 0.0, "sharp"],
    [0.32, -0.05],
    [0.16, -0.07],
    [0.05, -0.05],
  ];
  const outline = LEAF.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])) as any;

  for (const s of [1, -1]) {
    const sh = new THREE.Vector3(s * 0.125, 0.53, 0.08);
    const tip = new THREE.Vector3(s * 0.145, 0.34, -0.3);
    const dir = tip.clone().sub(sh);
    const len = dir.length();
    const d = dir.clone().normalize();
    // Wing plane: u along d, v in the flank plane perpendicular to d and to X-ish thickness axis.
    const thick = new THREE.Vector3(s, 0, 0);
    const vAxis = new THREE.Vector3().crossVectors(thick, d).normalize(); // x-direction for extrude uses d
    const k = len / 0.46;

    // Extrude: x along d, y = vAxis ; thickness along x × y.
    const X = d.toArray() as [number, number, number];
    const Y = vAxis.toArray() as [number, number, number];
    const out = new THREE.Vector3().crossVectors(d, vAxis); // thickness direction
    if (out.x * s < 0) out.negate();

    const scaled = outline.map((p: any) => (p[2] ? [p[0] * k, p[1] * k, "sharp"] : [p[0] * k, p[1] * k]));
    const wing = b.extrude(scaled, {
      at: sh, x: X, y: Y, thickness: 0.035, smoothing: 2, bevel: 0.004, color: P.black, bone,
    });

    // point on the wing's outer face
    const onFace = (u: number, v: number, lift: number) => {
      const p = sh.clone().addScaledVector(d, u * k).addScaledVector(vAxis, v * k);
      return p.addScaledVector(out, (out.x * s > 0 ? 1 : 1) * (0.0175 + lift));
    };
    const faceDir = out.clone();
    const faceOut = faceDir.dot(new THREE.Vector3(s, 0, 0)) >= 0 ? faceDir : faceDir.negate();

    // Stripe bars crossing the wing (across v) near trailing edge.
    const bar = (u: number, w: number, hv: number, col: string) => {
      const half = hv * k;
      const pts: [number, number][] = [
        [u, -half], [u + w, -half * 0.96], [u + w, half * 0.96], [u, half],
      ];
      const sc = pts.map((p) => [p[0] * k, p[1]] as [number, number]);
      const bb = b.extrude(sc, {
        at: sh.clone().addScaledVector(faceOut, 0.0175), x: X, y: Y, thickness: 0.008, color: col, bone,
      });
      return bb;
    };
    // bars: widths of wing taper, so size half heights by position
    bar(0.27, 0.035, 0.06, P.cream);
    bar(0.345, 0.03, 0.04, P.yellow);

    // Leading edge line (blueDark rod) from shoulder to wrist along the top edge.
    const a = sh.clone().addScaledVector(vAxis, 0.07 * k).addScaledVector(faceOut, 0.016).addScaledVector(d, 0.03);
    const e = sh.clone().addScaledVector(d, 0.32 * k).addScaledVector(vAxis, 0.05 * k).addScaledVector(faceOut, 0.016);
    b.rod(a, e, 0.004, P.blueDark, { bone });

    // Three stepped primaries poking past the tip.
    for (let i = 0; i < 3; i++) {
      const base = tip.clone()
        .addScaledVector(d, -0.04 + i * 0.0)
        .addScaledVector(vAxis, (i - 1) * 0.02)
        .addScaledVector(d, -0.0 - i * 0.02 * -1);
      const L = 0.09;
      const prim = [
        [0, -0.011], [L * 0.8, -0.011], [L, 0], [L * 0.8, 0.011], [0, 0.011],
      ] as [number, number][];
      b.extrude(prim.map((p) => [p[0], p[1]]) as any, {
        at: base.addScaledVector(faceOut, -0.002 * i), x: X, y: Y, thickness: 0.015, color: P.blueDark, bone,
      });
    }

    // Shoulder cap rivet and wrist dot for detail.
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.yellow, {
      bone, at: sh.clone().addScaledVector(d, 0.04 * k).addScaledVector(faceOut, 0.02),
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), P.cream, {
      bone, at: sh.clone().addScaledVector(d, 0.3 * k).addScaledVector(vAxis, 0.045 * k).addScaledVector(faceOut, 0.02),
    });
  }
  void frame; void r; void M;
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const ARCH = "#15336b";

  // Egg body: tilt so chest is low/front, rump high/back.
  const C: [number, number, number] = [0, 0.42, 0.04];
  const tilt = -0.42; // rotate about X: pitches +Z end downward
  const eggGeo = new THREE.SphereGeometry(1, 16, 12);
  const egg = b.part(eggGeo, P.blue, {
    bone,
    at: C,
    rotation: [tilt * 57.2958, 0, 0],
    scale: [0.14, 0.185, 0.17],
    name: "torsoEgg",
  });
  // Egg local axes: long axis is local Z (0.17), tall Y (0.185).
  const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0));
  const eggPt = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z).applyQuaternion(tiltQ).add(new THREE.Vector3(...C));
  void egg;

  // Cream belly bulge
  b.part(new THREE.SphereGeometry(0.115, 14, 10), P.cream, {
    bone,
    at: [0, 0.335, 0.075],
    scale: [0.98, 0.9, 1],
    name: "torsoBelly",
  });
  // Belly outline ring (thin black torus) at belly/chest seam
  b.part(new THREE.TorusGeometry(0.108, 0.005, 5, 20), P.black, {
    bone,
    at: [0, 0.37, 0.075],
    rotation: [90, 0, 0],
    scale: [1, 1, 1],
    name: "torsoBellySeam",
  });

  // Red half-disc breast plate: semicircle arc on top, flat edge down
  const bibPts: [number, number][] = [];
  const BR = 0.1;
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    bibPts.push([BR * Math.cos(a), BR * Math.sin(a)]);
  }
  const bibAt: [number, number, number] = [0, 0.385, 0.178];
  b.extrude(bibPts, {
    at: bibAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    color: P.red,
    bone,
    name: "torsoBib",
  });
  // Black outline: slightly larger half-disc behind the red
  const ol: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    ol.push([(BR + 0.008) * Math.cos(a), (BR + 0.008) * Math.sin(a) + 0.0]);
  }
  b.extrude(ol, {
    at: [0, 0.382, 0.168],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    color: P.black,
    bone,
    name: "torsoBibOutline",
  });
  // Yellow small bar and dots on the bib as Bauhaus accents
  b.part(new THREE.BoxGeometry(0.11, 0.008, 0.006), P.yellow, {
    bone,
    at: [0, 0.428, 0.198],
    name: "torsoBibBar",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), P.cream, {
      bone,
      at: [s * 0.04, 0.405, 0.199],
      name: "torsoBibDot",
    });
  }

  // Rump black band: torus ringed around the rear of the egg
  b.part(new THREE.TorusGeometry(0.1, 0.012, 6, 20), P.black, {
    bone,
    at: [0, 0.46, -0.085],
    rotation: [-20, 0, 0],
    scale: [1, 1.05, 1],
    name: "torsoRump",
  });

  // Shoulder dome caps seating the wings
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), P.blue, {
      bone,
      at: [s * 0.125, 0.52, 0.08],
      dir: [s, 0.5, 0],
      scale: [1, 0.9, 1.1],
      name: "torsoShoulder",
    });
    b.part(new THREE.TorusGeometry(0.05, 0.004, 5, 14), P.black, {
      bone,
      at: [s * 0.125, 0.52, 0.08],
      dir: [s, 0.5, 0],
      axis: "z",
      name: "torsoShoulderRing",
    });
  }

  // Back seam dots along the spine of the egg
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const a = -0.9 + t * 1.5; // angle along the top, from rump to neck
    const p = eggPt(0, 0.185 * Math.cos(a) * 1.0 + 0.004, 0.17 * Math.sin(-a) * 0.98);
    const n = new THREE.Vector3(0, Math.cos(a), -Math.sin(a)).applyQuaternion(tiltQ);
    b.part(new THREE.SphereGeometry(0.008, 6, 4), P.black, {
      bone,
      at: p,
      scale: [1, 1, 1],
      name: "torsoSeam",
    });
    void n;
  }

  // Side flank cream-edge lines (thin black ring around the egg waist)
  b.part(new THREE.TorusGeometry(0.14, 0.004, 4, 24), P.black, {
    bone,
    at: [0, 0.44, 0.02],
    rotation: [90 + tilt * 57.2958 * 0, 0, 0],
    scale: [1, 1.2, 1],
    name: "torsoWaist",
  });

  // Little blue-dark chest shading wedge at collar where head meets
  b.part(new THREE.ConeGeometry(0.04, 0.05, 3), ARCH, {
    bone,
    at: [0, 0.56, 0.1],
    dir: [0, 0, 1],
    name: "torsoCollar",
  });
  void R;
  void frame;
  void M;
}
```

<!-- call: branch -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBranch({ b, J, P }: any) {
  const bone = J.root;
  const R = rng(11);
  const Y = 0.09;
  const WOOD = P.wood, DARK = P.woodDark, CUT = P.woodCut, BLK = P.black;

  // Main log: tapered cylinder along Z (rear z=-0.95 r=0.095, front z=0.88 r=0.075)
  const zr = -0.95, zf = 0.88, len = zf - zr;
  const log = new THREE.CylinderGeometry(0.075, 0.095, len, 10, 1, true);
  b.part(log, WOOD, { bone, at: [0, Y, (zr + zf) / 2], dir: [0, 0, 1], axis: "y", flat: true });
  // Front cut face
  const cap = (r: number, z: number, c: string, h = 0.004) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 12), c, { bone, at: [0, Y, z], dir: [0, 0, 1], axis: "y" });
  cap(0.075, zf, CUT, 0.006);
  cap(0.05, zf + 0.003, DARK, 0.005);
  cap(0.03, zf + 0.006, CUT, 0.005);
  cap(0.008, zf + 0.009, BLK, 0.005);
  // Bark ring lines near the front
  b.part(new THREE.TorusGeometry(0.076, 0.004, 4, 12), P.barkLine, { bone, at: [0, Y, zf - 0.01], dir: [0, 0, 1], axis: "z" });
  // Rear broken stub
  b.part(new THREE.CylinderGeometry(0.06, 0.095, 0.1, 8), DARK, { bone, at: [0, Y, zr - 0.04], dir: [0, 0, 1], axis: "y", flat: true });
  cap(0.06, zr - 0.092, DARK, 0.006);
  b.part(new THREE.ConeGeometry(0.02, 0.06, 5), WOOD, { bone, at: [0.02, Y + 0.03, zr - 0.1], dir: [0, 0.4, -1], axis: "y", flat: true });
  b.part(new THREE.ConeGeometry(0.015, 0.05, 5), CUT, { bone, at: [-0.025, Y - 0.01, zr - 0.1], dir: [0, -0.2, -1], axis: "y", flat: true });

  // Bark lines along the log
  for (const [x, y, z, l] of [[0.07, 0.12, -0.5, 0.25], [-0.07, 0.12, 0.2, 0.3], [0.06, 0.04, 0.5, 0.2], [-0.08, 0.07, -0.3, 0.22]] as number[][]) {
    b.part(new THREE.BoxGeometry(0.006, 0.006, l), P.barkLine, { bone, at: [x, y, z] });
  }

  // Knuckles
  for (const z of [-0.6, 0.4]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), DARK, { bone, at: [0.03, Y + 0.03, z], scale: [1, 0.8, 1.1], flat: true });
  }
  // Lichen dots on the upper surface
  const lz = [-0.8, -0.45, -0.15, 0.25, 0.55, 0.7];
  lz.forEach((z, i) => {
    const r = 0.015 + R() * 0.01;
    const x = (R() - 0.5) * 0.05;
    const top = Y + 0.085 - (z + 0.95) * 0.011;
    b.part(new THREE.SphereGeometry(r, 6, 4), P.cream, { bone, at: [x, top, z], scale: [1, 0.4, 1] });
  });

  // Side twig
  const t0: [number, number, number] = [0.1, 0.11, -0.35];
  const t1: [number, number, number] = [0.22, 0.46, -0.3];
  const t2: [number, number, number] = [0.3, 0.4, -0.2];
  b.rod(t0, t1, [0.036, 0.022], DARK, { bone, sides: 6 });
  b.rod([0.17, 0.3, -0.32], t2, [0.02, 0.012], DARK, { bone, sides: 6 });
  b.part(new THREE.SphereGeometry(0.04, 7, 5), DARK, { bone, at: [0.13, 0.15, -0.35], flat: true });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, { bone, at: t1, flat: true });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), DARK, { bone, at: t2, flat: true });

  // Buds
  for (const [x, y, z] of [[0.13, 0.2, -0.345], [0.17, 0.32, -0.32], [0.2, 0.41, -0.3], [0.26, 0.36, -0.26], [0.285, 0.395, -0.215]]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.yellow, { bone, at: [x, y, z] });
  }

  // Leaves (flat extrudes facing sideways-ish)
  const leaf = (outline: any[], at: number[], x: number[], y: number[], col: string) =>
    b.extrude(outline, { at, x, y, thickness: 0.012, color: col, bone });
  // blue circle leaf
  const circ: any[] = [];
  for (let i = 0; i < 14; i++) circ.push([0.07 * Math.cos((i / 14) * 6.2832), 0.07 * Math.sin((i / 14) * 6.2832)]);
  leaf(circ, [0.2, 0.52, -0.3], [1, 0, 0.1], [0, 1, 0.3], P.blue);
  // yellow half-disc, flat edge toward twig
  const half: any[] = [[-0.08, 0, "sharp"], [0.08, 0, "sharp"]];
  for (let i = 1; i < 8; i++) half.push([0.08 * Math.cos((i / 8) * Math.PI), 0.08 * Math.sin((i / 8) * Math.PI)]);
  half.sort((a, c) => 0);
  const halfPts: any[] = [[0.08, 0, "sharp"]];
  for (let i = 1; i < 8; i++) halfPts.push([0.08 * Math.cos((i / 8) * Math.PI), 0.08 * Math.sin((i / 8) * Math.PI)]);
  halfPts.push([-0.08, 0, "sharp"]);
  leaf(halfPts, [0.31, 0.405, -0.2], [0.3, 0.2, 1], [1, 0.6, 0], P.yellow);
  // red triangle leaf
  leaf([[-0.05, 0, "sharp"], [0.05, 0, "sharp"], [0, 0.12, "sharp"]], [0.21, 0.46, -0.31], [0.9, 0, -0.4], [-0.25, 1, 0], P.red);
  // leaf stems
  b.rod([0.22, 0.46, -0.3], [0.2, 0.5, -0.3], 0.006, DARK, { bone });
  b.rod(t2, [0.31, 0.405, -0.2], 0.006, DARK, { bone });
}
```