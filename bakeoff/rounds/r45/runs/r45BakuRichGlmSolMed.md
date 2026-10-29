<!-- call: plan -->

```json
{
  "name": "Baku, the Dream-Eater",
  "description": "A baku—the dream-eating tapir spirit—standing proudly in ukiyo-e woodblock style: a heavy indigo barrel body with a cream belly, a gold crescent on its brow, a short prehensile trunk curling dream-smoke, wave-pattern bands on its flank and stylized cloud swirls pooled at its feet.",
  "builderName": "bakuSpirit",
  "size": [1.7, 2.2, 3.4],
  "layout": "The baku stands on y = 0 on four short columnar tapir legs, facing +Z. Front to back: a short muscular trunk curls down and slightly forward from the front of a high, round-skulled head (ears at the top, small alert eyes, gold crescent moon emblem on the brow, small bone tusks at the jaw corners, jaw built as separate upper and lower pieces); the neck rises steeply from a heavy barrel torso whose back peaks around y = 1.5 at the shoulders and slopes to the rump; a ridge of flat blade-like mane tufts runs along the spine from the neck base to the tail base; a short lion-like tail curls up behind the rump with a bold tuft. The whole silhouette is chunky and rounded like a tapir blended with a guardian lion-dog. Style on every part: flat bold colours only, every surface one flat colour, with ukiyo-e detail built as separate seated parts—ink outline strips along edges, pale-blue seigaiha wave bands across the lower flank, gold collar and anklet bands, ink claw and nostril marks, and glowing teal dream-smoke wisps (emissive) curling from the trunk tip and drifting above the back. Stylized flat cloud swirls in pale blue with ink rims pool on the floor around the feet. Proportions pushed for character: the trunk slightly long and expressive, the ears large and round, the mane tufts bold and spiky, the belly deep and cream-bright against the dark indigo back.",
  "palette": {
    "indigo": "#2c3f66",
    "night": "#1c2745",
    "cream": "#f4ead2",
    "bone": "#e9dfc8",
    "gold": "#d9a441",
    "vermilion": "#c2402f",
    "ink": "#1d1626",
    "plum": "#6b4a6e",
    "wave": "#9cc2de",
    "teal": "#7fe3d2"
  },
  "mounts": {
    "neckBase": [0, 1.42, 0.78],
    "trunkBase": [0, 1.6, 1.4],
    "tailBase": [0, 1.25, -0.82],
    "shoulderFL": [0.44, 1.15, 0.55],
    "shoulderFR": [-0.44, 1.15, 0.55],
    "hipHL": [0.44, 1.18, -0.62],
    "hipHR": [-0.44, 1.18, -0.62]
  },
  "joints": [
    { "name": "root", "at": [0, 1.15, -0.2], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "root", "at": [0, 1.28, 0.5], "dir": [0, 0.1, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.42, 0.78], "dir": [0, 0.55, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.75, 1.12], "dir": [0, 0.25, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.55, 1.18], "dir": [0, -0.3, 1], "role": "jaw" },
    { "name": "earL", "parent": "head", "at": [0.24, 2.0, 1.02], "dir": [0.4, 0.85, 0.2], "role": "hinge" },
    { "name": "earR", "parent": "head", "at": [-0.24, 2.0, 1.02], "dir": [-0.4, 0.85, 0.2], "role": "hinge" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.6, 1.42], "dir": [0, -0.1, 1], "role": "tentacle" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.45, 1.68], "dir": [0, -0.5, 0.9], "role": "tentacle" },
    { "name": "tail1", "parent": "root", "at": [0, 1.25, -0.82], "dir": [0, 0.3, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.45, -1.2], "dir": [0, 0.5, -0.9], "role": "tail" },
    { "name": "shoulderFL", "parent": "chest", "at": [0.44, 1.15, 0.55], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFL", "parent": "shoulderFL", "at": [0.46, 0.62, 0.56], "dir": [0, -1, 0], "role": "leg" },
    { "name": "fetlockFL", "parent": "kneeFL", "at": [0.46, 0.28, 0.54], "dir": [0, -1, 0], "role": "leg" },
    { "name": "shoulderFR", "parent": "chest", "at": [-0.44, 1.15, 0.55], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFR", "parent": "shoulderFR", "at": [-0.46, 0.62, 0.56], "dir": [0, -1, 0], "role": "leg" },
    { "name": "fetlockFR", "parent": "kneeFR", "at": [-0.46, 0.28, 0.54], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipHL", "parent": "root", "at": [0.44, 1.18, -0.62], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeHL", "parent": "hipHL", "at": [0.47, 0.66, -0.5], "dir": [0, -1, 0], "role": "leg" },
    { "name": "fetlockHL", "parent": "kneeHL", "at": [0.47, 0.28, -0.58], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipHR", "parent": "root", "at": [-0.44, 1.18, -0.62], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-0.47, 0.66, -0.5], "dir": [0, -1, 0], "role": "leg" },
    { "name": "fetlockHR", "parent": "kneeHR", "at": [-0.47, 0.28, -0.58], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "The barrel torso: a smooth-skinned sweep or loft along the spine from tailBase (z = -0.85) through root and chest to neckBase (z = 0.78, y = 1.42), heavy and deep—radius about 0.42 at the chest tapering to 0.34 at the rump, with the belly line pushed low (belly bottom near y = 0.75, back top near y = 1.5). Main coat indigo on the back and sides, cream underneath: colour the tube with a paint or sector split so the cream belly rises in a zig-zag fur edge across the flank (ukiyo-e style hard edge). On the lower flank add a seigaiha-style wave band: two or three thin overlapping crescent strips (extruded slabs or stuck thin curved pieces) in wave pale-blue with thin ink outline strips along their top edges, sweeping from shoulder to hip on both sides. Along the spine from neckBase to tailBase build the mane crest: 8-10 flat blade tufts (extrudes with sharp tips, thickness tapering to a knife edge) alternating ink, plum and gold, rooted on the back line and sweeping backward, tallest at the shoulders (about 0.22). Where the neck meets the body add a vermilion collar band: a swept band around the neck root with a thin gold trim ring on its front edge and small gold studs. Add subtle night-coloured shading strips along the underside seams where belly meets side. Everything joins through the root and chest joints; the body must not overlap the head box or the leg boxes—leave the shoulder and hip mounts as open sockets and place a small vermilion socket blush disc at each of the four limb mounts for the legs part to meet.",
      "box": [[-0.65, 0.7, -1.0], [0.65, 1.55, 0.95]],
      "attaches": "Front face of the box meets the head part at mount neckBase; the mane crest's front tuft sits just behind neckBase under the head. Rear end stops at mount tailBase where the aura part's tail begins. Lower corners of the box sit just above the legs part's box, meeting it at the four limb mounts (shoulderFL/FR, hipHL/HR) with socket blushes.",
      "joints": ["root", "chest", "neck"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "head",
      "builds": "The head on the head joint at [0, 1.75, 1.12], facing +Z with a slight upward tilt. Skull: a rounded chunky dome (low-segment sphere or loft) about 0.34 wide, indigo, with a cream muzzle wedge at the front and cream cheek fur tufts (small flat triangular tufts with ink outline strips) below the eyes. The face is the hero: two bold stylized eyes—ink almond shapes as seated parts (or decals) with a small cream highlight dot each, angled slightly, reading clearly from the front; cream brow strips above them; a large gold crescent-moon emblem seated flat on the brow centre (a crescent extrude, gold with a thin ink outline), the baku's signature mark. Ears on earL/earR: big rounded tapir ears (flattened domes or two-sided slabs) indigo outside, cream inside rim, with ink edge strips and a small plum inner patch. The upper jaw is a short blunt muzzle on the head bone; the lower jaw is a separate slab on the jaw joint so the mouth can open, cream-chinned, with a vermilion mouth interior and a small bone tusk at each jaw corner curving up. A short mane continues from the neck: 3-4 small ink and plum blade tufts on the head crest between the ears. Finish with a thin ink outline strip tracing the jaw line and cheek. Do not build the trunk: it starts at mount trunkBase and belongs to the trunk part—leave the muzzle front open there.",
      "box": [[-0.42, 1.35, 0.85], [0.42, 2.25, 1.5]],
      "attaches": "Sits on the neck joint at mount neckBase, riding the head, jaw and ear joints; the muzzle front ends at mount trunkBase where the trunk part's base ring begins.",
      "joints": ["head", "jaw", "earL", "earR", "neck"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "trunk",
      "builds": "The baku's prehensile trunk: a tapered sweep along the trunk1 and trunk2 joints, starting at mount trunkBase [0, 1.6, 1.4] about 0.13 in radius, curving down and forward to a tip near [0, 1.28, 1.78] that flares open like a trumpet curl. Coat indigo with 5-6 cream ring-ridges: thin bands (stuck torus-like rings or narrow sweep bands) around the trunk at intervals, each with a hairline ink outline on its lower edge. The tip flares into a cream-lined opening: a rim ring in ink, the interior vermilion, with two small ink nostril dots. From the tip curl 3-4 glowing teal dream-smoke wisps: thin spiralled sweeps or small curl extrudes, teal and emissive (use the glow treatment on their parts), drifting up and back toward the brow—the smoke of dreams being inhaled. Two short cream whisker spines at the trunk base sides. Everything rides the trunk joints so the trunk can curl.",
      "box": [[-0.18, 1.15, 1.35], [0.18, 1.7, 1.85]],
      "attaches": "Roots at mount trunkBase on the front of the head part's muzzle; the base ring must meet the muzzle front face cleanly. Smoke wisps drift up over the head box but only as thin curls, staying clear of the ears.",
      "joints": ["trunk1", "trunk2", "head"],
      "floor": false,
      "budget": 90
    },
    {
      "id": "legs",
      "builds": "Four sturdy columnar tapir legs, one per limb mount. Each leg is a two-bone sweep from its mount (shoulderFL/FR at y = 1.15, hipHL/HR at y = 1.18) down through the knee and fetlock joints to the foot, slightly thicker at the thigh (radius about 0.15) tapering to 0.09 at the fetlock; hind legs show a hint of a backward hock angle. Upper leg indigo; from just below the knee down the legs turn cream (the tapir's pale stockings), the colour split a clean hard band with a thin ink outline ring at the boundary. Above each foot a gold anklet band with a small vermilion stud at its front. Each foot: a low rounded hoof block resting flat on y = 0, split into three bold toes (three small front-facing wedge pieces in bone colour with ink claws and ink separations), the underside in ink. Add a small plum knee patch on each foreleg. Feet must plant exactly on the floor; nothing hangs below y = 0.",
      "box": [[-0.55, 0, -0.7], [0.55, 1.18, 0.65]],
      "attaches": "Each leg roots at one of the four limb mounts (shoulderFL, shoulderFR, hipHL, hipHR), meeting the body part's socket blushes there; the tops of the thighs sink slightly into the body's lower barrel so no gap shows.",
      "joints": ["shoulderFL", "kneeFL", "fetlockFL", "shoulderFR", "kneeFR", "fetlockFR", "hipHL", "kneeHL", "fetlockHL", "hipHR", "kneeHR", "fetlockHR"],
      "floor": true,
      "budget": 210
    },
    {
      "id": "aura",
      "builds": "The spirit's tail and the clouds it stands among. Tail: a short thick lion-like tail sweeping from mount tailBase [0, 1.25, -0.82] back and up through tail1 and tail2 to a curling tip near [0, 1.62, -1.3], indigo along its length with a bold tuft at the tip—5-6 flat blade tufts fanning out in plum and ink with gold tips—plus a gold ring band near the tuft root. Around the feet, ukiyo-e cloud swirls: 4-6 stylized flat spiral cloud masses (extruded outlines with thick rounded lobes, or stacked rounded slabs) in wave pale-blue with ink rim outline strips, pooled on the floor y = 0 around and between the legs, modest in size so the legs stay readable—no cloud higher than 0.35. Two or three small glowing teal dream-orbs (small spheres, emissive teal with a cream highlight dot) float just above the clouds near the front paws and one near the tail, the dreams the baku has eaten.",
      "box": [[-0.85, 0, -1.05], [0.85, 1.75, 0.95]],
      "attaches": "Tail roots at mount tailBase meeting the body part's rear end; the clouds sit on the floor around the legs part's feet and must not swallow them—clouds keep clear of the leg cylinders by a finger's width.",
      "joints": ["tail1", "tail2", "root"],
      "floor": true,
      "budget": 110
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { polyline } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const INDIGO = P.indigo;
  const CREAM = P.cream;
  const BONE = P.bone;
  const GOLD = P.gold;
  const PLUM = P.plum;
  const VERMILION = P.vermilion;

  type Side = {
    tag: string;
    mount: string;
    knee: string;
    fetlock: string;
    fore: boolean;
  };

  const legs: Side[] = [
    { tag: "FL", mount: "shoulderFL", knee: "kneeFL", fetlock: "fetlockFL", fore: true },
    { tag: "FR", mount: "shoulderFR", knee: "kneeFR", fetlock: "fetlockFR", fore: true },
    { tag: "HL", mount: "hipHL", knee: "kneeHL", fetlock: "fetlockHL", fore: false },
    { tag: "HR", mount: "hipHR", knee: "kneeHR", fetlock: "fetlockHR", fore: false },
  ];

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    name: string,
    rotation?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
      group: "legs",
    });
  };

  const torus = (
    major: number,
    tube: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    name: string,
  ) => {
    return b.part(new THREE.TorusGeometry(major, tube, 6, 14), color, {
      at,
      bone,
      name,
      group: "legs",
    });
  };

  const hoof = (side: Side, x: number, z: number, bone: any) => {
    const footY = 0.105;

    // Low, rounded-looking hoof mass. The dark sole is deliberately just above
    // the floor so no geometry hangs below y = 0.
    b.part(new THREE.SphereGeometry(1, 8, 5), INDIGO, {
      at: [x, footY, z + 0.025],
      bone,
      scale: [0.145, 0.105, 0.19],
      name: `hoof${side.tag}`,
      group: "legs",
    });

    box([0.22, 0.025, 0.27], INK, [x, 0.018, z + 0.025], bone, `sole${side.tag}`);

    // Three broad bone-coloured front toes, slightly fanned across the paw.
    const toeOffsets = [-0.066, 0, 0.066];
    toeOffsets.forEach((dx, i) => {
      const toe = box(
        [0.058, 0.065, 0.145],
        BONE,
        [x + dx, 0.075, z + 0.145],
        bone,
        `toe${side.tag}_${i}`,
        [0, (dx / 0.066) * 0.09, 0],
      );

      // Dark claw slash seated on the forward face of each toe.
      const clawStart = [x + dx, 0.078, z + 0.211] as [number, number, number];
      const clawEnd = [x + dx, 0.072, z + 0.235] as [number, number, number];
      b.rod(clawStart, clawEnd, 0.009, {
        color: INK,
        bone,
        caps: "flat",
        name: `claw${side.tag}_${i}`,
        group: "legs",
      });

      // A tiny ink separation line between toes, kept on the front plane.
      if (i < 2) {
        const sx = x + dx + 0.033;
        b.rod(
          [sx, 0.045, z + 0.125],
          [sx, 0.075, z + 0.205],
          0.006,
          {
            color: INK,
            bone,
            caps: "flat",
            name: `toeSeam${side.tag}_${i}`,
            group: "legs",
          },
        );
      }
    });

    // Gold anklet and a vermilion front stud.
    torus(0.104, 0.014, GOLD, [x, 0.235, z], bone, `anklet${side.tag}`);
    b.part(new THREE.SphereGeometry(0.019, 7, 5), VERMILION, {
      at: [x, 0.235, z + 0.108],
      bone,
      name: `ankletStud${side.tag}`,
      group: "legs",
    });
  };

  for (const side of legs) {
    const mount = J[side.mount];
    const knee = J[side.knee];
    const fetlock = J[side.fetlock];

    const root = mount.at.clone();
    const bend = knee.at.clone();
    const ankle = fetlock.at.clone();

    // The cream stocking begins just below the knee. A short final point gives
    // the lower sweep a clean flat-ish meeting with the hoof.
    const solePoint = new THREE.Vector3(ankle.x, 0.19, ankle.z + 0.01);
    const path = polyline([root, bend, ankle, solePoint]);

    const leg = b.sweep(path, (t: number) => {
      if (t < 0.42) return 0.15 - t * 0.035;
      if (t < 0.7) return 0.115;
      return 0.092;
    }, {
      bone: [mount, knee, fetlock],
      color: INDIGO,
      bands: [[0.43, CREAM]],
      section: { ngon: 8 },
      sides: 8,
      caps: { start: "round", end: "round" },
      name: `leg${side.tag}`,
      group: "legs",
    });

    // Fine ink ring at the indigo-to-cream stocking break.
    torus(0.116, 0.009, INK, [bend.x, bend.y - 0.055, bend.z], knee, `stockingInk${side.tag}`);

    // A second narrow gold seam makes the band read as carved woodblock trim.
    torus(0.096, 0.006, GOLD, [ankle.x, 0.295, ankle.z], fetlock, `lowerTrim${side.tag}`);

    // Plum knee patch on the two forelegs, with an ink silhouette behind it.
    if (side.fore) {
      box(
        [0.19, 0.17, 0.025],
        INK,
        [bend.x, bend.y + 0.005, bend.z + 0.116],
        knee,
        `kneeOutline${side.tag}`,
      );
      box(
        [0.155, 0.135, 0.031],
        PLUM,
        [bend.x, bend.y + 0.005, bend.z + 0.129],
        knee,
        `kneePatch${side.tag}`,
      );
      // A small central highlight block gives the patch a stamped, graphic center.
      box(
        [0.052, 0.052, 0.008],
        GOLD,
        [bend.x, bend.y + 0.005, bend.z + 0.148],
        knee,
        `kneePatchMark${side.tag}`,
      );
    }

    // Vermilion socket blush at the shoulder/hip mount. It sinks into the
    // barrel and visually closes the open socket left by the body builder.
    const socket = mount.at.clone();
    b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.018, 10), VERMILION, {
      at: [socket.x, socket.y, socket.z + 0.115],
      bone: mount,
      rotation: [Math.PI / 2, 0, 0],
      name: `socketBlush${side.tag}`,
      group: "legs",
    });
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.023, 10), INK, {
      at: [socket.x, socket.y, socket.z + 0.128],
      bone: mount,
      rotation: [Math.PI / 2, 0, 0],
      name: `socketInk${side.tag}`,
      group: "legs",
    });

    hoof(side, ankle.x, ankle.z, fetlock);
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { b as _b } from "three/examples/jsm/nodes/Nodes.js";
import { polyline } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const INDIGO = P.indigo;
  const NIGHT = P.night;
  const CREAM = P.cream;
  const BONE = P.bone;
  const GOLD = P.gold;
  const VERMILION = P.vermilion;
  const PLUM = P.plum;

  const head = J.head;
  const jaw = J.jaw;
  const earL = J.earL;
  const earR = J.earR;
  const neck = J.neck;

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone: any = head,
    segments = 10,
    rings = 7,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, rings), color, {
      bone,
      at,
      scale,
      name,
      group: "head",
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any = head,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      name,
      group: "head",
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    bone: any = head,
    name?: string,
  ) => b.rod(a, z, radius, { bone, color, name, group: "head", section: { ngon: 6 } });

  const outline = (
    points: [number, number, number][],
    color = INK,
    radius = 0.009,
    bone: any = head,
    name?: string,
  ) =>
    b.sweep(polyline(points, { closed: true }), radius, {
      bone,
      color,
      caps: "round",
      section: { ngon: 6 },
      name,
      group: "head",
    });

  // ---------------------------------------------------------------------------
  // The large, rounded skull. The slightly flattened back leaves the neck
  // readable, while the forward bulge gives the baku a strong tapir profile.
  // ---------------------------------------------------------------------------

  sphere(
    1,
    INDIGO,
    [0, 1.79, 1.16],
    [0.365, 0.445, 0.38],
    head,
    14,
    10,
    "skull",
  );

  // Broad cheek shadows make the head read as a carved woodblock silhouette.
  sphere(1, NIGHT, [0.265, 1.67, 1.22], [0.105, 0.19, 0.26], head, 8, 6, "cheekShadowL");
  sphere(1, NIGHT, [-0.265, 1.67, 1.22], [0.105, 0.19, 0.26], head, 8, 6, "cheekShadowR");

  // Cream muzzle, deliberately stopping at the supplied trunk mount.
  sphere(
    1,
    CREAM,
    [0, 1.64, 1.365],
    [0.285, 0.19, 0.22],
    head,
    12,
    8,
    "upperMuzzle",
  );
  box([0.30, 0.10, 0.12], BONE, [0, 1.57, 1.43], head, "muzzleBridge");

  // A dark, thin muzzle contour and two nostril marks.
  outline(
    [
      [-0.225, 1.69, 1.555],
      [-0.14, 1.76, 1.56],
      [0, 1.78, 1.565],
      [0.14, 1.76, 1.56],
      [0.225, 1.69, 1.555],
    ],
    INK,
    0.008,
    head,
    "muzzleContour",
  );

  sphere(1, INK, [-0.075, 1.665, 1.585], [0.027, 0.014, 0.012], head, 7, 5, "nostrilL");
  sphere(1, INK, [0.075, 1.665, 1.585], [0.027, 0.014, 0.012], head, 7, 5, "nostrilR");

  // ---------------------------------------------------------------------------
  // Separate lower jaw: cream chin, vermilion mouth, and a dark ink jaw line.
  // ---------------------------------------------------------------------------

  sphere(
    1,
    CREAM,
    [0, 1.505, 1.345],
    [0.235, 0.105, 0.205],
    jaw,
    10,
    7,
    "lowerJaw",
  );

  box([0.30, 0.045, 0.075], VERMILION, [0, 1.575, 1.515], jaw, "mouthInterior");

  outline(
    [
      [-0.215, 1.605, 1.525],
      [-0.13, 1.565, 1.56],
      [0, 1.55, 1.565],
      [0.13, 1.565, 1.56],
      [0.215, 1.605, 1.525],
    ],
    INK,
    0.009,
    jaw,
    "lowerJawOutline",
  );

  // Corner tusks curl upward from the jaw. They are separate rigid cones so a
  // rigger can still open the mouth without stretching the teeth.
  b.spike(
    [-0.19, 1.555, 1.48],
    [-0.17, 1.69, 1.53],
    null,
    0.035,
    { bone: jaw, color: BONE, caps: "point", name: "tuskL", group: "head" },
  );
  b.spike(
    [0.19, 1.555, 1.48],
    [0.17, 1.69, 1.53],
    null,
    0.035,
    { bone: jaw, color: BONE, caps: "point", name: "tuskR", group: "head" },
  );

  // ---------------------------------------------------------------------------
  // Eyes: black almond silhouettes, inset indigo irises, cream glints, and
  // heavy carved brows. Everything is geometry, not a texture.
  // ---------------------------------------------------------------------------

  const eyeOutline = (s: number) => {
    const x = s * 0.135;
    const pts: [number, number][] = [
      [-0.105, 0],
      [-0.055, 0.045],
      [0.025, 0.055],
      [0.105, 0.018],
      [0.035, -0.038],
      [-0.045, -0.043],
    ];
    return pts.map(([u, v]) => [x + s * u, 1.835 + v, 1.545] as [number, number, number]);
  };

  for (const s of [-1, 1]) {
    const eyePts = eyeOutline(s);
    b.slab(eyePts, {
      bone: head,
      color: INK,
      thickness: 0.012,
      name: s < 0 ? "eyeRink" : "eyeLink",
      group: "head",
    });

    sphere(
      1,
      PLUM,
      [s * 0.135, 1.833, 1.555],
      [0.062, 0.043, 0.014],
      head,
      8,
      5,
      s < 0 ? "irisR" : "irisL",
    );

    sphere(
      1,
      NIGHT,
      [s * 0.135, 1.833, 1.571],
      [0.024, 0.039, 0.009],
      head,
      7,
      5,
      s < 0 ? "pupilR" : "pupilL",
    );

    sphere(
      1,
      CREAM,
      [s * 0.112, 1.856, 1.583],
      [0.017, 0.014, 0.008],
      head,
      6,
      4,
      s < 0 ? "eyeGlintR" : "eyeGlintL",
    );

    // Cream brow planes, angled like expressive ukiyo-e brush strokes.
    rod(
      [s * 0.075, 1.925, 1.535],
      [s * 0.205, 1.945, 1.545],
      0.021,
      CREAM,
      head,
      s < 0 ? "browR" : "browL",
    );
    rod(
      [s * 0.085, 1.95, 1.55],
      [s * 0.185, 1.965, 1.555],
      0.007,
      INK,
      head,
      s < 0 ? "browInkR" : "browInkL",
    );
  }

  // Small cheek fur blades beneath each eye.
  const cheekTuft = (s: number, y: number, z: number, size: number, i: number) => {
    const at: [number, number, number] = [s * (0.235 + i * 0.018), y, z];
    const tuft = b.extrude(
      [
        [0, 0],
        [size * 0.72, size * 0.16],
        [size * 0.46, size * 0.58],
        [size * 0.08, size],
        [-size * 0.12, size * 0.40],
      ],
      {
        at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: [0.018, 0.006],
        bevel: 0.002,
        color: CREAM,
        bone: head,
        name: `cheekTuft${s < 0 ? "R" : "L"}${i}`,
        group: "head",
      },
    );

    b.sweep(
      [
        tuft.local([0, 0.01, 0.011]),
        tuft.local([size * 0.42, size * 0.23, 0.011]),
        tuft.local([size * 0.17, size * 0.78, 0.011]),
      ],
      0.006,
      {
        bone: head,
        color: INK,
        caps: "round",
        section: { ngon: 5 },
        name: `cheekInk${s < 0 ? "R" : "L"}${i}`,
        group: "head",
      },
    );
  };

  for (const s of [-1, 1]) {
    cheekTuft(s, 1.735, 1.53, 0.085, 0);
    cheekTuft(s, 1.675, 1.525, 0.075, 1);
    cheekTuft(s, 1.62, 1.50, 0.06, 2);
  }

  // ---------------------------------------------------------------------------
  // Brow crescent: an ink silhouette behind a gold crescent, seated on the
  // forehead and facing the viewer.
  // ---------------------------------------------------------------------------

  const crescent: [number, number][] = [
    [-0.105, -0.045],
    [-0.055, -0.095],
    [0.025, -0.105],
    [0.095, -0.065],
    [0.115, 0.005],
    [0.09, 0.065],
    [0.035, 0.105],
    [-0.03, 0.095],
    [0.025, 0.05],
    [0.055, 0.0],
    [0.045, -0.045],
    [-0.015, -0.075],
  ];

  b.extrude(crescent, {
    at: [0, 1.995, 1.535],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.003,
    color: INK,
    bone: head,
    name: "browCrescentInk",
    group: "head",
  });

  const crescentGold: [number, number][] = crescent.map(([x, y]) => [
    x * 0.82,
    y * 0.82 + 0.004,
  ]);
  b.extrude(crescentGold, {
    at: [0, 1.995, 1.55],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: GOLD,
    bone: head,
    name: "goldenDreamCrescent",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Large ears, built on their own hinge joints. Cream inner pads and plum
  // inner shadows create a layered woodblock-print ear rim.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const ear = s < 0 ? earR : earL;
    const side = s < 0 ? "R" : "L";

    sphere(1, INDIGO, [s * 0.255, 2.055, 1.08], [0.17, 0.255, 0.085], ear, 12, 8, `ear${side}`);
    sphere(1, INK, [s * 0.257, 2.055, 1.145], [0.132, 0.208, 0.018], ear, 10, 7, `earInk${side}`);
    sphere(1, CREAM, [s * 0.258, 2.055, 1.155], [0.115, 0.185, 0.014], ear, 10, 7, `earInner${side}`);
    sphere(1, PLUM, [s * 0.26, 2.055, 1.17], [0.07, 0.125, 0.012], ear, 9, 6, `earPatch${side}`);

    // Strong ink contour around the ear's front-facing rim.
    outline(
      [
        [s * 0.13, 1.91, 1.13],
        [s * 0.19, 1.86, 1.145],
        [s * 0.31, 1.88, 1.15],
        [s * 0.40, 1.98, 1.14],
        [s * 0.41, 2.10, 1.13],
        [s * 0.34, 2.23, 1.13],
        [s * 0.23, 2.30, 1.13],
        [s * 0.14, 2.22, 1.13],
      ],
      INK,
      0.009,
      ear,
      `earContour${side}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Four small crest blades between the ears, continuing the neck mane without
  // intruding into the face.
  // ---------------------------------------------------------------------------

  const crest = [
    { x: -0.12, y: 2.02, z: 1.02, h: 0.17, c: PLUM },
    { x: -0.04, y: 2.08, z: 1.00, h: 0.22, c: INK },
    { x: 0.045, y: 2.08, z: 1.00, h: 0.20, c: PLUM },
    { x: 0.13, y: 2.02, z: 1.02, h: 0.15, c: INK },
  ];

  crest.forEach((q, i) => {
    const blade = b.extrude(
      [
        [-0.052, 0],
        [0.052, 0],
        [0.03, q.h * 0.62],
        [0, q.h],
        [-0.034, q.h * 0.46],
      ],
      {
        at: [q.x, q.y, q.z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: [0.018, 0.004],
        bevel: 0.002,
        color: q.c,
        bone: head,
        name: `headCrest${i}`,
        group: "head",
      },
    );

    b.sweep(
      [
        blade.local([-0.045, 0.008, 0.012]),
        blade.local([0.0, q.h * 0.48, 0.012]),
        blade.local([0.0, q.h * 0.93, 0.012]),
      ],
      0.006,
      {
        bone: head,
        color: INK,
        caps: "round",
        section: { ngon: 5 },
        name: `headCrestInk${i}`,
        group: "head",
      },
    );
  });

  // A few short ink cuts at the cheek-to-jaw transition complete the carved
  // outline and visually separate the moving lower jaw.
  rod([-0.24, 1.62, 1.53], [-0.19, 1.55, 1.555], 0.007, INK, head, "jawLineR");
  rod([0.24, 1.62, 1.53], [0.19, 1.55, 1.555], 0.007, INK, head, "jawLineL");
  rod([-0.255, 1.70, 1.50], [-0.285, 1.65, 1.47], 0.006, INK, head, "cheekCutR");
  rod([0.255, 1.70, 1.50], [0.285, 1.65, 1.47], 0.006, INK, head, "cheekCutL");

  // Small gold studs at the ear roots echo the collar hardware that will be
  // built on the neck by the neighboring part.
  sphere(1, GOLD, [-0.145, 1.96, 1.34], [0.018, 0.018, 0.012], head, 7, 5, "earStudR");
  sphere(1, GOLD, [0.145, 1.96, 1.34], [0.018, 0.018, 0.012], head, 7, 5, "earStudL");
}
```

<!-- call: trunk -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  glow,
} from "agentic-3js-builder";

export function buildTrunk({ b, J, P, M }: Ctx) {
  const indigo = P.indigo;
  const cream = P.cream;
  const bone = P.bone;
  const ink = P.ink;
  const vermilion = P.vermilion;
  const teal = P.teal;

  const trunkBase = new THREE.Vector3(...M.trunkBase);
  const trunkTip = new THREE.Vector3(0, 1.29, 1.75);
  const openingTip = new THREE.Vector3(0, 1.285, 1.765);

  const trunkPath = catmull(
    [
      trunkBase,
      J.trunk1.at,
      J.trunk2.at,
      new THREE.Vector3(0, 1.38, 1.66),
      trunkTip,
    ],
    { tension: 0.18 },
  );

  const trunk = b.sweep(trunkPath, (t) => 0.13 * (1 - t) + 0.078 * t, {
    bone: [J.head, J.trunk1, J.trunk2],
    color: indigo,
    sides: 8,
    caps: "round",
    group: "trunk",
    name: "trunkCoat",
  });

  const tangentAt = (t: number) =>
    trunkPath.tangentAt(t).normalize();

  // Six cream ridges, each backed by a slightly offset ink lower edge.
  const ridges = [
    { t: 0.12, r: 0.126 },
    { t: 0.27, r: 0.114 },
    { t: 0.42, r: 0.104 },
    { t: 0.57, r: 0.096 },
    { t: 0.72, r: 0.088 },
    { t: 0.86, r: 0.081 },
  ];

  for (const ridge of ridges) {
    const center = trunkPath.at(ridge.t);
    const tangent = tangentAt(ridge.t);

    const inkBack = center.clone().addScaledVector(tangent, -0.012);
    b.part(
      new THREE.TorusGeometry(ridge.r, 0.008, 5, 12),
      ink,
      {
        bone: trunkPath.at(ridge.t).bone ?? J.trunk2,
        at: inkBack,
        dir: tangent,
        axis: "y",
        group: "trunkRidges",
        name: "ridgeInk",
      },
    );

    b.part(
      new THREE.TorusGeometry(ridge.r * 0.985, 0.009, 5, 12),
      cream,
      {
        bone: trunkPath.at(ridge.t).bone ?? J.trunk2,
        at: center,
        dir: tangent,
        axis: "y",
        group: "trunkRidges",
        name: "ridgeCream",
      },
    );
  }

  // A short flared trumpet at the end of the prehensile trunk.
  const flarePath = catmull(
    [
      trunkTip.clone().addScaledVector(tangentAt(1), -0.055),
      trunkTip,
      openingTip,
    ],
    { tension: 0.1 },
  );

  b.sweep(flarePath, [0.072, 0.092], {
    bone: J.trunk2,
    color: indigo,
    sides: 8,
    caps: "flat",
    group: "trunkTip",
    name: "trumpetFlare",
  });

  const openingTangent = new THREE.Vector3(0, -0.34, 0.94).normalize();

  // Dark carved rim, cream inner lip, then the vermilion mouth opening.
  b.part(
    new THREE.TorusGeometry(0.094, 0.012, 6, 14),
    ink,
    {
      bone: J.trunk2,
      at: openingTip,
      dir: openingTangent,
      axis: "y",
      group: "trunkTip",
      name: "openingInkRim",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.078, 0.009, 6, 14),
    cream,
    {
      bone: J.trunk2,
      at: openingTip.clone().addScaledVector(openingTangent, -0.006),
      dir: openingTangent,
      axis: "y",
      group: "trunkTip",
      name: "openingCreamLip",
    },
  );

  b.part(
    new THREE.CircleGeometry(0.071, 14),
    vermilion,
    {
      bone: J.trunk2,
      at: openingTip.clone().addScaledVector(openingTangent, 0.004),
      dir: openingTangent,
      axis: "z",
      group: "trunkTip",
      name: "mouthInterior",
    },
  );

  // Two graphic nostril marks on the vermilion opening.
  const openingSide = new THREE.Vector3(1, 0, 0);
  for (const side of [-1, 1]) {
    const nostril = openingTip
      .clone()
      .addScaledVector(openingTangent, 0.009)
      .addScaledVector(openingSide, side * 0.027)
      .add(new THREE.Vector3(0, 0.009, 0));

    b.part(
      new THREE.SphereGeometry(0.009, 6, 4),
      ink,
      {
        bone: J.trunk2,
        at: nostril,
        scale: [1, 0.45, 0.7],
        group: "trunkTip",
        name: "nostril",
      },
    );
  }

  // Cream whisker spines at the root, angled outward like carved print marks.
  for (const side of [-1, 1]) {
    const root = trunkBase
      .clone()
      .add(new THREE.Vector3(side * 0.105, 0.005, -0.005));
    const tip = root.clone().add(new THREE.Vector3(side * 0.095, 0.018, 0.035));

    b.spike(root, tip, null, 0.012, {
      bone: J.head,
      color: cream,
      caps: "point",
      group: "whiskers",
      name: "whisker",
    });

    b.spike(
      root.clone().add(new THREE.Vector3(0, -0.018, 0.012)),
      tip.clone().add(new THREE.Vector3(0, -0.012, 0.028)),
      null,
      0.008,
      {
        bone: J.head,
        color: bone,
        caps: "point",
        group: "whiskers",
        name: "whiskerFine",
      },
    );
  }

  // Dream smoke: three restrained ukiyo-e curls rising from the mouth,
  // staying close to the face and clear of the ears.
  const smokePaths = [
    [
      openingTip.clone().add(new THREE.Vector3(-0.018, 0.01, 0)),
      new THREE.Vector3(-0.052, 1.47, 1.70),
      new THREE.Vector3(-0.045, 1.67, 1.57),
      new THREE.Vector3(-0.012, 1.82, 1.53),
      new THREE.Vector3(0.025, 1.88, 1.63),
    ],
    [
      openingTip.clone().add(new THREE.Vector3(0.018, 0.014, 0.005)),
      new THREE.Vector3(0.058, 1.45, 1.69),
      new THREE.Vector3(0.072, 1.61, 1.55),
      new THREE.Vector3(0.048, 1.75, 1.48),
      new THREE.Vector3(0.012, 1.82, 1.54),
    ],
    [
      openingTip.clone().add(new THREE.Vector3(0, 0.02, 0.005)),
      new THREE.Vector3(-0.01, 1.48, 1.68),
      new THREE.Vector3(0.015, 1.62, 1.58),
      new THREE.Vector3(0.008, 1.76, 1.66),
      new THREE.Vector3(-0.025, 1.86, 1.72),
    ],
  ];

  smokePaths.forEach((points, i) => {
    const smokePath = catmull(points, { tension: 0.12 });
    const smoke = b.sweep(smokePath, [0.014, 0.006], {
      bone: J.trunk2,
      color: teal,
      sides: 6,
      caps: "round",
      group: "dreamSmoke",
      name: `dreamWisp${i + 1}`,
    });
    glow(smoke, 1.8);

    // Tiny hook bead at each curl's crest makes the silhouette read as smoke.
    const crest = smokePath.at(0.78);
    const bead = b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      teal,
      {
        bone: J.trunk2,
        at: crest,
        group: "dreamSmoke",
        name: `dreamWispBead${i + 1}`,
      },
    );
    glow(bead, 1.5);
  });
}
```

<!-- call: aura -->

```ts
import * as THREE from "three";
import { catmull, createBuilder, glow } from "agentic-3js-builder";

export function buildAura({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const INDIGO = P.indigo;
  const PLUM = P.plum;
  const GOLD = P.gold;
  const WAVE = P.wave;
  const TEAL = P.teal;
  const CREAM = P.cream;
  const VERMILION = P.vermilion;

  const tailBase = M.tailBase ?? [0, 1.25, -0.82];
  const tailPath = catmull([
    tailBase,
    [0, 1.31, -1.00],
    [0, 1.48, -1.18],
    [0, 1.62, -1.30],
  ]);

  const tail = b.sweep(tailPath, (t: number) => 0.135 - 0.085 * t, {
    bone: [J.tail1, J.tail2],
    color: INDIGO,
    sides: 8,
    caps: "round",
    name: "auraTail",
    group: "aura",
  });

  // Dark underside accent gives the short tail a carved woodblock silhouette.
  b.sweep(tailPath, (t: number) => 0.139 - 0.088 * t, {
    bone: [J.tail1, J.tail2],
    color: INK,
    sectors: [[145, 215, INK, 0.08, 0.92]],
    sides: 8,
    caps: "none",
    name: "auraTailInk",
    group: "aura",
  });

  // Gold collar-ring around the tail, seated on its surface.
  const bandAt = tail.at(0.68);
  b.part(new THREE.TorusGeometry(0.082, 0.014, 6, 12), GOLD, {
    at: bandAt.at,
    bone: J.tail2,
    dir: bandAt.tangent,
    name: "auraTailGoldBand",
    group: "aura",
  });
  b.part(new THREE.TorusGeometry(0.098, 0.007, 5, 12), INK, {
    at: bandAt.at,
    bone: J.tail2,
    dir: bandAt.tangent,
    name: "auraTailGoldBandInk",
    group: "aura",
  });

  // A fan of sharp, flat lion-tail blades.
  const tuftBlades = [
    { x: -0.17, lean: -0.30, color: INK },
    { x: -0.105, lean: -0.18, color: PLUM },
    { x: -0.035, lean: -0.07, color: GOLD },
    { x: 0.035, lean: 0.07, color: PLUM },
    { x: 0.105, lean: 0.18, color: INK },
    { x: 0.17, lean: 0.30, color: PLUM },
  ];

  for (let i = 0; i < tuftBlades.length; i++) {
    const blade = tuftBlades[i];
    const baseX = blade.x * 0.55;
    const height = i === 2 || i === 3 ? 0.29 : 0.245;
    const outline: [number, number, "sharp"][] = [
      [-0.035, 0, "sharp"],
      [0.035, 0, "sharp"],
      [0.042 + blade.lean * 0.22, height * 0.62, "sharp"],
      [blade.lean, height, "sharp"],
      [-0.014 + blade.lean * 0.4, height * 0.57, "sharp"],
    ];

    const bladePart = b.extrude(outline, {
      at: [baseX, 1.52, -1.315],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.018, 0.004],
      bevel: 0.004,
      bone: J.tail2,
      color: blade.color,
      name: `auraTailTuft${i}`,
      group: "aura",
    });

    // Small gold terminal cuts, like a printed highlight on each blade.
    if (i !== 0 && i !== 4) {
      b.extrude(
        [
          [-0.021, height * 0.72, "sharp"],
          [0.021, height * 0.72, "sharp"],
          [blade.lean * 0.82, height, "sharp"],
          [blade.lean * 0.42, height * 0.79, "sharp"],
        ],
        {
          at: bladePart.at,
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.006,
          bone: J.tail2,
          color: GOLD,
          name: `auraTailTuftTip${i}`,
          group: "aura",
        },
      );
    }
  }

  type Cloud = {
    x: number;
    z: number;
    scale: number;
    flip?: number;
  };

  const clouds: Cloud[] = [
    { x: 0.72, z: 0.76, scale: 0.82, flip: 1 },
    { x: -0.72, z: 0.73, scale: 0.78, flip: -1 },
    { x: 0.78, z: -0.12, scale: 0.9, flip: -1 },
    { x: -0.77, z: -0.16, scale: 0.86, flip: 1 },
    { x: 0.02, z: -0.91, scale: 0.86, flip: -1 },
    { x: 0.02, z: 0.98, scale: 0.7, flip: 1 },
  ];

  const cloudOutline = (s: number): [number, number, "sharp"][] => [
    [-0.34 * s, -0.08 * s, "sharp"],
    [-0.30 * s, -0.22 * s, "sharp"],
    [-0.13 * s, -0.28 * s, "sharp"],
    [-0.02 * s, -0.20 * s, "sharp"],
    [0.10 * s, -0.30 * s, "sharp"],
    [0.30 * s, -0.24 * s, "sharp"],
    [0.38 * s, -0.08 * s, "sharp"],
    [0.31 * s, 0.02 * s, "sharp"],
    [0.36 * s, 0.17 * s, "sharp"],
    [0.22 * s, 0.26 * s, "sharp"],
    [0.08 * s, 0.20 * s, "sharp"],
    [-0.01 * s, 0.34 * s, "sharp"],
    [-0.18 * s, 0.31 * s, "sharp"],
    [-0.23 * s, 0.18 * s, "sharp"],
    [-0.38 * s, 0.20 * s, "sharp"],
    [-0.46 * s, 0.07 * s, "sharp"],
  ];

  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    const inkShape = cloudOutline(c.scale * 1.08);
    const waveShape = cloudOutline(c.scale);

    b.extrude(inkShape, {
      at: [c.x, 0.018, c.z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 1,
      color: INK,
      name: `auraCloudInk${i}`,
      group: "clouds",
    });

    b.extrude(waveShape, {
      at: [c.x, 0.035, c.z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: WAVE,
      name: `auraCloud${i}`,
      group: "clouds",
    });

    // A carved spiral line across each cloud mass.
    const sign = c.flip ?? 1;
    const swirl = catmull([
      [c.x - 0.24 * c.scale, 0.064, c.z + sign * 0.01],
      [c.x - 0.06 * c.scale, 0.068, c.z + sign * 0.14 * c.scale],
      [c.x + 0.17 * c.scale, 0.071, c.z + sign * 0.11 * c.scale],
      [c.x + 0.19 * c.scale, 0.074, c.z - sign * 0.05 * c.scale],
      [c.x + 0.04 * c.scale, 0.076, c.z - sign * 0.11 * c.scale],
      [c.x - 0.09 * c.scale, 0.077, c.z - sign * 0.045 * c.scale],
    ]);
    b.sweep(swirl, 0.012, {
      color: INK,
      sides: 5,
      caps: "round",
      name: `auraCloudSwirl${i}`,
      group: "clouds",
    });

    // Pale inner echo makes the ink swirl read as a printed line rather than a crack.
    const inner = swirl.slice(0.08, 0.9);
    b.sweep(inner, 0.0055, {
      color: WAVE,
      sides: 5,
      caps: "round",
      name: `auraCloudSwirlHighlight${i}`,
      group: "clouds",
    });
  }

  const orbData = [
    [0.55, 0.23, 0.78, 0.052],
    [-0.58, 0.27, 0.72, 0.045],
    [0.32, 0.30, -0.92, 0.048],
  ] as const;

  for (let i = 0; i < orbData.length; i++) {
    const [x, y, z, r] = orbData[i];
    const orb = b.part(new THREE.SphereGeometry(r, 10, 7), TEAL, {
      at: [x, y, z],
      color: TEAL,
      name: `auraDreamOrb${i}`,
      group: "dreams",
    });
    glow(orb, 1.8);

    const highlight = b.part(new THREE.SphereGeometry(r * 0.22, 6, 4), CREAM, {
      at: [x - r * 0.28, y + r * 0.30, z + r * 0.82],
      color: CREAM,
      name: `auraDreamOrbHighlight${i}`,
      group: "dreams",
    });
    glow(highlight, 0.8);
  }

  // A few tiny ink commas at the cloud edges reinforce the ukiyo-e registration marks.
  const marks = [
    [0.43, 0.075, 0.56],
    [-0.42, 0.075, 0.52],
    [0.42, 0.075, -0.43],
    [-0.43, 0.075, -0.48],
  ] as const;

  for (let i = 0; i < marks.length; i++) {
    const [x, y, z] = marks[i];
    b.part(new THREE.SphereGeometry(0.018, 6, 4), INK, {
      at: [x, y, z],
      color: INK,
      name: `auraCloudDot${i}`,
      group: "clouds",
    });
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  rng,
} from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: Ctx) {
  const C = (name: string, fallback: string) => (P as any)[name] ?? fallback;

  const INDIGO = C("indigo", "#2c3f66");
  const NIGHT = C("night", "#1c2745");
  const CREAM = C("cream", "#f4ead2");
  const GOLD = C("gold", "#d9a441");
  const VERMILION = C("vermilion", "#c2402f");
  const INK = C("ink", "#1d1626");
  const PLUM = C("plum", "#6b4a6e");
  const WAVE = C("wave", "#9cc2de");

  const rootBone = J.root;
  const chestBone = J.chest;
  const neckBone = J.neck;
  const bodyBones = [rootBone, chestBone, neckBone];

  // ------------------------------------------------------------------------------------------------
  // Heavy indigo barrel. The section is deliberately faceted: it should read as a carved woodblock
  // silhouette rather than a polished animal mesh.
  // ------------------------------------------------------------------------------------------------

  const spine = catmull(
    [
      [-0.0, 1.12, -0.88],
      [0.0, 1.18, -0.66],
      [0.0, 1.24, -0.34],
      [0.0, 1.29, 0.05],
      [0.0, 1.34, 0.40],
      [0.0, 1.42, 0.77],
    ],
    { tension: 0.18 },
  );

  const barrel = b.sweep(spine, (t) => {
    if (t < 0.18) return 0.34 + t * 0.35;
    if (t < 0.52) return 0.40;
    return 0.40 - (t - 0.52) * 0.10;
  }, {
    bone: bodyBones,
    color: INDIGO,
    sides: 10,
    section: "circle",
    caps: "round",
    shift: (t) => [0, -0.018 - 0.018 * Math.sin(t * Math.PI)],
    sectors: [
      [112, 248, CREAM],
      [248, 292, CREAM],
    ],
    name: "bodyBarrel",
    group: "body",
  });

  // A second, quiet underside strip gives the belly a carved dark edge without using a texture.
  const seamL = catmull([
    [0.365, 0.83, -0.78],
    [0.415, 0.82, -0.40],
    [0.425, 0.84, 0.02],
    [0.415, 0.88, 0.40],
    [0.34, 0.94, 0.70],
  ]);
  const seamR = catmull([
    [-0.365, 0.83, -0.78],
    [-0.415, 0.82, -0.40],
    [-0.425, 0.84, 0.02],
    [-0.415, 0.88, 0.40],
    [-0.34, 0.94, 0.70],
  ]);
  b.sweep(seamL, 0.012, {
    bone: bodyBones,
    color: NIGHT,
    sides: 5,
    caps: "round",
    name: "bellySeamL",
    group: "body",
  });
  b.sweep(seamR, 0.012, {
    bone: bodyBones,
    color: NIGHT,
    sides: 5,
    caps: "round",
    name: "bellySeamR",
    group: "body",
  });

  // ------------------------------------------------------------------------------------------------
  // Seigaiha wave bands on both lower flanks. Each little arch is a separate carved strip with a
  // darker ink echo just below it, like two impressions in a woodblock.
  // ------------------------------------------------------------------------------------------------

  const waveBand = (side: number, row: number, z0: number, z1: number) => {
    const y = 0.91 + row * 0.07;
    const x = side * (0.405 - row * 0.012);
    const width = z1 - z0;
    const arch = catmull([
      [x, y, z0],
      [x + side * 0.018, y + 0.055, z0 + width * 0.22],
      [x + side * 0.012, y + 0.080, z0 + width * 0.50],
      [x, y + 0.045, z0 + width * 0.78],
      [x - side * 0.008, y, z1],
    ]);
    const inkEcho = catmull([
      [x + side * 0.006, y - 0.014, z0],
      [x + side * 0.024, y + 0.041, z0 + width * 0.22],
      [x + side * 0.018, y + 0.066, z0 + width * 0.50],
      [x + side * 0.006, y + 0.031, z0 + width * 0.78],
      [x - side * 0.002, y - 0.014, z1],
    ]);
    b.sweep(arch, 0.018, {
      bone: bodyBones,
      color: WAVE,
      sides: 6,
      caps: "round",
      name: `seigaiha${side > 0 ? "L" : "R"}_${row}`,
      group: "body",
    });
    b.sweep(inkEcho, 0.006, {
      bone: bodyBones,
      color: INK,
      sides: 5,
      caps: "round",
      name: `seigaihaInk${side > 0 ? "L" : "R"}_${row}`,
      group: "body",
    });
  };

  for (const side of [1, -1]) {
    waveBand(side, 0, -0.64, 0.60);
    waveBand(side, 1, -0.56, 0.56);
    waveBand(side, 2, -0.45, 0.47);
  }

  // Small vermilion socket blushes intentionally sit at the four open leg sockets.
  for (const [name, p] of [
    ["FL", M.shoulderFL ?? [0.44, 1.15, 0.55]],
    ["FR", M.shoulderFR ?? [-0.44, 1.15, 0.55]],
    ["HL", M.hipHL ?? [0.44, 1.18, -0.62]],
    ["HR", M.hipHR ?? [-0.44, 1.18, -0.62]],
  ] as [string, [number, number, number]][]) {
    const side = p[0] >= 0 ? 1 : -1;
    const socket = b.part(
      new THREE.CylinderGeometry(0.105, 0.105, 0.018, 10),
      VERMILION,
      {
        bone: chestBone,
        at: [p[0] + side * 0.008, p[1], p[2]],
        dir: [side, 0, 0],
        axis: "y",
        name: `socket${name}`,
        group: "body",
        flat: true,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.070, 0.070, 0.021, 10),
      INK,
      {
        bone: chestBone,
        at: [p[0] + side * 0.019, p[1], p[2]],
        dir: [side, 0, 0],
        axis: "y",
        name: `socketInk${name}`,
        group: "body",
        flat: true,
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Eight broad mane blades along the upper spine. Their local drawing x-axis points backward, so
  // every blade has a readable swept silhouette from the side.
  // ------------------------------------------------------------------------------------------------

  const maneZ = [0.70, 0.52, 0.32, 0.10, -0.12, -0.34, -0.56, -0.76];
  const maneH = [0.15, 0.22, 0.24, 0.22, 0.18, 0.15, 0.12, 0.09];
  const maneColors = [GOLD, PLUM, INK, PLUM, GOLD, INK, PLUM, GOLD];

  for (let i = 0; i < maneZ.length; i++) {
    const z = maneZ[i];
    const h = maneH[i];
    const y = 1.48 - Math.max(0, 0.14 - Math.abs(z - 0.28) * 0.08);
    const blade = b.extrude(
      [
        [0.00, 0.00, "sharp"],
        [0.105, 0.025],
        [0.075, h * 0.62],
        [0.025, h, "sharp"],
        [-0.045, h * 0.62],
        [-0.055, 0.025],
      ],
      {
        at: [0, y, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.025, 0.004],
        bevel: 0,
        smoothing: 0,
        color: maneColors[i],
        bone: z > 0.30 ? neckBone : z > -0.25 ? chestBone : rootBone,
        name: `maneBlade${i}`,
        group: "body",
      },
    );

    // A narrow ink edge seated on the forward face of every blade.
    b.extrude(
      [
        [0.002, 0.012, "sharp"],
        [0.018, 0.018],
        [0.015, h * 0.72],
        [0.006, h * 0.94, "sharp"],
        [-0.004, h * 0.70],
        [-0.006, 0.015],
      ],
      {
        at: [0, y, z + 0.014],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0,
        smoothing: 0,
        color: INK,
        bone: z > 0.30 ? neckBone : z > -0.25 ? chestBone : rootBone,
        name: `maneInk${i}`,
        group: "body",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Vermilion neck collar, with a gold front rim and six raised studs.
  // ------------------------------------------------------------------------------------------------

  const collarCenter: [number, number, number] = [0, 1.425, 0.735];
  const collarPath = catmull(
    [
      [0.285, 1.425, 0.735],
      [0.202, 1.425, 0.535],
      [0.0, 1.425, 0.450],
      [-0.202, 1.425, 0.535],
      [-0.285, 1.425, 0.735],
      [-0.202, 1.425, 0.935],
      [0.0, 1.425, 1.020],
      [0.202, 1.425, 0.935],
    ],
    { closed: true },
  );
  b.sweep(collarPath, 0.035, {
    bone: neckBone,
    color: VERMILION,
    sides: 7,
    caps: "none",
    name: "vermilionCollar",
    group: "body",
  });

  const collarGold = catmull(
    [
      [0.295, 1.425, 0.775],
      [0.205, 1.425, 0.575],
      [0.0, 1.425, 0.490],
      [-0.205, 1.425, 0.575],
      [-0.295, 1.425, 0.775],
      [-0.205, 1.425, 0.975],
      [0.0, 1.425, 1.060],
      [0.205, 1.425, 0.975],
    ],
    { closed: true },
  );
  b.sweep(collarGold, 0.010, {
    bone: neckBone,
    color: GOLD,
    sides: 6,
    caps: "none",
    name: "collarGoldTrim",
    group: "body",
  });

  const studAngles = [0, 60, 120, 180, 240, 300];
  for (let i = 0; i < studAngles.length; i++) {
    const a = (studAngles[i] * Math.PI) / 180;
    const p: [number, number, number] = [
      Math.sin(a) * 0.30,
      1.425,
      0.735 + Math.cos(a) * 0.30,
    ];
    b.part(new THREE.SphereGeometry(0.022, 7, 5), GOLD, {
      bone: neckBone,
      at: p,
      scale: [1, 0.65, 1],
      name: `collarStud${i}`,
      group: "body",
      flat: true,
    });
  }

  // A few deliberately chunky block-print hatch marks on the lower side seam.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = -0.57 + i * 0.36;
      b.part(
        new THREE.BoxGeometry(0.012, 0.055, 0.085),
        NIGHT,
        {
          bone: chestBone,
          at: [side * 0.424, 0.805 + i * 0.012, z],
          rotation: [0, side * 12, side * 18],
          name: `undersideMark${side > 0 ? "L" : "R"}${i}`,
          group: "body",
          flat: true,
        },
      );
    }
  }

  return barrel;
}
```