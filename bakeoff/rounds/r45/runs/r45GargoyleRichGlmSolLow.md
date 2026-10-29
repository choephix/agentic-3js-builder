<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A weathered gothic stone gargoyle crouched on a carved cathedral cornice ledge, wings folded high behind it, glowing amber eyes under a heavy brow, moss in every crevice.",
  "builderName": "cathedralGargoyle",
  "size": [2.4, 2.05, 2.0],
  "layout": "The model is a crouched gargoyle perched on a fragment of cathedral cornice, facing +Z. The ledge is the only floor part: a block 2.4 m wide (x -1.2..1.2), 0.62 m tall, 1.7 m deep (z -0.85..0.85), its top surface at y = 0.55 with a wider cornice lip (front edge z 0.85, back edge z -0.78). Everything else rests on that top. The gargoyle crouches in the classic pose: digitigrade legs folded with knees drawn up beside the chest and clawed feet planted flat on the ledge top around z 0.14; the belly hangs low between haunches (hips at [0, 0.95, 0.02]); the chest leans forward over the front lip; the arms reach down-forward and the hands grip the cornice lip at z ~0.78 with claws hooked over the front face. The head sits forward and low at [0, 1.34, 0.52], snout toward +Z, heavy brow over glowing amber eyes, two ribbed horns sweeping back and up to y ~1.95, tall bat ears flaring outward. The wings are the silhouette's second read: folded bat wings rising in a high V behind the shoulders to y ~2.05, x to +/-0.95, slate-dark membranes hanging down the back to the haunches. The tail leaves the rump, drapes over the ledge back edge at z -0.78 and curls to the model's right below the ledge to y ~0.15. Style everywhere is carved stone: blocky faceted primitives, flat colours per part, chipped corners, cracks as thin dark slivers, moss and lichen sitting only on upward and side faces, rust drip stains below the iron straps, warm worn highlights on top edges and cold deep shade underneath. The only non-stone notes are the rusted iron straps, a small brass consecration plaque, bone-coloured horns, claws and teeth, and the glowing amber eyes.",
  "palette": {
    "stoneMid": "#7d8378",
    "stoneLight": "#a8ab9c",
    "stoneDark": "#565c55",
    "stoneDeep": "#3c423c",
    "moss": "#57703f",
    "mossDark": "#3c5230",
    "lichen": "#9aa384",
    "horn": "#c8c0a8",
    "hornDark": "#8f8874",
    "iron": "#4a4e56",
    "rust": "#6e4a32",
    "brass": "#b08d4a",
    "wingSlate": "#545a66",
    "wingSlateDark": "#3a3f4a",
    "eyeGlow": "#ffb054",
    "eyeInk": "#2a1f14",
    "mouth": "#4a2f33",
    "tongue": "#8a4a4a",
    "stain": "#454b45"
  },
  "mounts": {
    "ledgeTop": [0, 0.55, 0],
    "ledgeFrontLip": [0, 0.55, 0.78],
    "ledgeBackEdge": [0, 0.55, -0.78],
    "hips": [0, 0.95, 0.02],
    "neckBase": [0, 1.22, 0.38],
    "shoulderL": [0.38, 1.02, 0.26],
    "shoulderR": [-0.38, 1.02, 0.26],
    "wingRootL": [0.26, 1.1, -0.06],
    "wingRootR": [-0.26, 1.1, -0.06],
    "hipL": [0.28, 0.92, -0.04],
    "hipR": [-0.28, 0.92, -0.04],
    "tailBase": [0, 0.82, -0.3]
  },
  "joints": [
    { "name": "core", "at": [0, 0.95, 0.02], "dir": [0, 0.85, 0.5], "role": "spine" },
    { "name": "chest", "parent": "core", "at": [0, 1.12, 0.24], "dir": [0, 0.8, 0.6], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.22, 0.38], "dir": [0, 0.45, 0.9], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.34, 0.52], "dir": [0, 0.3, 0.95], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.25, 0.58], "dir": [0, 0.3, 0.95], "role": "jaw" },
    { "name": "earL", "parent": "head", "at": [0.18, 1.5, 0.42], "dir": [0.55, 0.75, -0.1], "role": "hinge", "group": "ears" },
    { "name": "earR", "parent": "head", "at": [-0.18, 1.5, 0.42], "dir": [-0.55, 0.75, -0.1], "role": "hinge", "group": "ears" },
    { "name": "shoulderL", "parent": "chest", "at": [0.38, 1.02, 0.26], "dir": [0.5, -0.5, 0.7], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.52, 0.74, 0.5], "dir": [-0.15, -0.5, 0.7], "role": "arm", "group": "arms" },
    { "name": "wristL", "parent": "elbowL", "at": [0.44, 0.56, 0.68], "dir": [0, -0.2, 1], "role": "arm", "group": "arms" },
    { "name": "gripL", "parent": "wristL", "at": [0.42, 0.56, 0.8], "dir": [0, 0, 1], "role": "digit", "group": "arms" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.38, 1.02, 0.26], "dir": [-0.5, -0.5, 0.7], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.52, 0.74, 0.5], "dir": [0.15, -0.5, 0.7], "role": "arm", "group": "arms" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.44, 0.56, 0.68], "dir": [0, -0.2, 1], "role": "arm", "group": "arms" },
    { "name": "gripR", "parent": "wristR", "at": [-0.42, 0.56, 0.8], "dir": [0, 0, 1], "role": "digit", "group": "arms" },
    { "name": "wingRootL", "parent": "chest", "at": [0.26, 1.1, -0.06], "dir": [0.6, 0.6, -0.45], "role": "wing", "group": "wings" },
    { "name": "wingElbowL", "parent": "wingRootL", "at": [0.6, 1.48, -0.18], "dir": [0.35, 0.75, 0.25], "role": "wing", "group": "wings" },
    { "name": "wingWristL", "parent": "wingElbowL", "at": [0.76, 1.82, -0.06], "dir": [-0.2, -0.7, -0.55], "role": "wing", "group": "wings" },
    { "name": "wingFinger1L", "parent": "wingWristL", "at": [0.74, 1.5, -0.42], "dir": [-0.1, -0.85, -0.5], "role": "digit", "group": "wings" },
    { "name": "wingFinger2L", "parent": "wingWristL", "at": [0.6, 1.32, -0.55], "dir": [-0.2, -0.9, -0.4], "role": "digit", "group": "wings" },
    { "name": "wingFinger3L", "parent": "wingWristL", "at": [0.45, 1.38, -0.6], "dir": [-0.35, -0.85, -0.3], "role": "digit", "group": "wings" },
    { "name": "wingRootR", "parent": "chest", "at": [-0.26, 1.1, -0.06], "dir": [-0.6, 0.6, -0.45], "role": "wing", "group": "wings" },
    { "name": "wingElbowR", "parent": "wingRootR", "at": [-0.6, 1.48, -0.18], "dir": [-0.35, 0.75, 0.25], "role": "wing", "group": "wings" },
    { "name": "wingWristR", "parent": "wingElbowR", "at": [-0.76, 1.82, -0.06], "dir": [0.2, -0.7, -0.55], "role": "wing", "group": "wings" },
    { "name": "wingFinger1R", "parent": "wingWristR", "at": [-0.74, 1.5, -0.42], "dir": [0.1, -0.85, -0.5], "role": "digit", "group": "wings" },
    { "name": "wingFinger2R", "parent": "wingWristR", "at": [-0.6, 1.32, -0.55], "dir": [0.2, -0.9, -0.4], "role": "digit", "group": "wings" },
    { "name": "wingFinger3R", "parent": "wingWristR", "at": [-0.45, 1.38, -0.6], "dir": [0.35, -0.85, -0.3], "role": "digit", "group": "wings" },
    { "name": "hipL", "parent": "core", "at": [0.28, 0.92, -0.04], "dir": [0.3, -0.6, 0.6], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.4, 0.66, 0.18], "dir": [-0.1, -0.1, -0.9], "role": "leg", "group": "legs" },
    { "name": "hockL", "parent": "kneeL", "at": [0.34, 0.62, -0.14], "dir": [0.1, 0.05, 0.95], "role": "leg", "group": "legs" },
    { "name": "footL", "parent": "hockL", "at": [0.32, 0.56, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "core", "at": [-0.28, 0.92, -0.04], "dir": [-0.3, -0.6, 0.6], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.4, 0.66, 0.18], "dir": [0.1, -0.1, -0.9], "role": "leg", "group": "legs" },
    { "name": "hockR", "parent": "kneeR", "at": [-0.34, 0.62, -0.14], "dir": [-0.1, 0.05, 0.95], "role": "leg", "group": "legs" },
    { "name": "footR", "parent": "hockR", "at": [-0.32, 0.56, 0.14], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "tail1", "parent": "core", "at": [0, 0.82, -0.3], "dir": [0, -0.5, -0.85], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.6, -0.72], "dir": [0, -0.9, -0.3], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.35, -0.95], "dir": [0.4, -0.5, -0.4], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0.25, 0.16, -1.05], "dir": [0.6, -0.2, -0.3], "role": "tail", "group": "tail" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The stone stage: a fragment of cathedral cornice in stoneMid. Build the base block as a slab from y 0 to 0.5 (x -1.2..1.2, z -0.8..0.75), then the cornice profile on top as three stacked stepped slabs: a stoneDark lower ogee band to y 0.56 pulled forward to z 0.85 (the dripping lip) and back to z -0.78, a stoneMid fillet, and a thin stoneLight worn top course whose upper edges are chipped (small stoneDark nubs at the corners). Under the front lip: three chamfered corbel brackets (frustum boxes, stoneDark) at x -0.7, 0, 0.7, and a row of 9 small dentil tooth blocks (stoneLight) between them. Two rusted iron reinforcement straps (iron) run vertically down the front face at x -0.55 and 0.55 with three round rivet heads (rust) each, and rust bleed streaks (rust) run down from them. Weathering sits where water goes: moss patches (moss with mossDark rims) along the top course edges and in the molding shadow line, pale lichen crust spots (lichen) on the side faces, dark drip stains (stain) running from the lip down the front face. Centre detail: a carved water channel of small stoneDark groove slabs running from the top centre to the front lip (between where the feet will stand), and a small brass consecration plaque (brass) on the front face below it - a disc with a recessed four-point star and two tiny rivets. Keep the ledge plainly carved so the gargoyle reads as the hero.",
      "box": [[-1.2, 0, -0.85], [1.2, 0.62, 0.85]],
      "attaches": "Freestanding on the floor (y = 0); its top surface is the ledgeTop mount and its back top edge is ledgeBackEdge, where the body's tail drapes; the arms' hands grip the front lip at ledgeFrontLip.",
      "joints": [],
      "floor": true,
      "budget": 120
    },
    {
      "id": "body",
      "builds": "The crouched torso and tail on the spine chain core -> chest (use b.sweep or a loft along the chain so it bends with the bones). Haunches: a wide rump volume at the hips mount (radius ~0.27) blending into a lower back that rises to the chest, which leans forward over the front lip; the belly sags low between the haunches (use sweep shift to hang the section below the spine line). Colour by place: stoneMid overall, stoneLight along the upper back and shoulder ridges (worn by rain running off), stoneDark on the belly and underside (sectors or bands), so the form reads lit from above. Carved musculature: two pectoral slabs on the chest front, three rib ridges per flank as thin curved slabs (stoneLight tops, stoneDark crevices between), a spine ridge of 4 short triangular stone spikes down the lower back, and crack slivers (stoneDark thin boxes) across the flank and one across the chest. A fleck of moss (moss) in the nape crevice and on the rump's top. Tail: a tapering sweep along tail1 -> tail4 (0.09 to 0.02 radius, stoneMid) that drapes over the ledge back edge at ledgeBackEdge and curls to the model's right below it; a row of 6 triangular spikes (horn) along its outer top, two stoneDark band rings, and a leaf-shaped stoneDark arrow tip. The rump and haunch bottoms settle onto the ledge top within 2% sink.",
      "box": [[-0.5, 0.12, -1.05], [0.55, 1.28, 0.45]],
      "attaches": "Rump sits on ledgeTop (mount) inside the ledge box; chest meets the head part at neckBase; shoulders meet the arms at shoulderL/shoulderR; wing roots meet the wings at wingRootL/wingRootR; leg haunch tops meet the legs at hipL/hipR; the tail starts at tailBase and drapes over ledgeBackEdge.",
      "joints": ["core", "chest", "tail1", "tail2", "tail3", "tail4"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "head",
      "builds": "The carved head on the head joint, sized bold (skull ~0.3 m wide, the face the model's focal point, nothing in front of it but the open muzzle). Skull: a blocky angular cranium loft from the neckBase mount, flat-topped between the horn bases, stoneMid with a stoneLight crown highlight and stoneDeep under-jaw shade. Brow: a heavy overhanging brow ridge slab (stoneLight top, stoneDeep underside) shadowing the eyes. Eyes: two deep-set sockets (recessed eyeInk bowls) each holding a glowing amber orb (eyeGlow, glow kit) with a small slit pupil (eyeInk) - the model's single light source, so keep them clear of the horns and ears. Muzzle as a separate upper and lower jaw: the upper jaw is a wedged snout sweep fixed to head, with a nose bridge ridge, two dark nostril slits (eyeInk), and an upper lip line; the lower jaw hangs open about 25 degrees from the jaw joint, a matching wedge with the mouth interior (mouth), a thick tongue (tongue) lolling slightly, and a lower lip. Teeth: two long upper fangs plus a row of small upper and lower teeth (horn) seated along both jawlines, one lower tusk jutting up beside the tongue. Horns: two swept-back ribbed horn sweeps from the brow (horn, radius 0.05 to 0.015) rising to y ~1.95 with three hornDark ridge rings each. Ears on earL/earR: tall pointed bat ears built as extrudes, stoneMid outside, stoneDeep inner, with a notch cut at the rim (a small stoneMid wedge seated in the notch line). Cheek frills: three small triangular stone spikes (stoneLight) down each jawline; a chin spike (horn). Two hairline crack slivers (stoneDark) on the cranium.",
      "box": [[-0.42, 1.1, 0.25], [0.42, 1.95, 0.95]],
      "attaches": "Skull neck root seats on the neck joint at neckBase (mount shared with body); ears hinge on earL/earR; lower jaw hinges on jaw.",
      "joints": ["head", "jaw", "earL", "earR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "arms",
      "builds": "The braced arms, mirrored left (+X) and right. From each shoulder mount: a hunched deltoid mass (stoneLight worn top) onto an upper arm sweep down-forward to elbowL/elbowR, then a thicker forearm to wristL/wristR, both stoneMid with stoneDark underside shading. Details on the arm: a pointed elbow spike (horn), a cracked stoneDark band ring around each forearm, knuckle plates (stoneLight) on the forearm top, a moss fleck at the left elbow crevice, one crack sliver per forearm. Hands grip the cornice lip at ledgeFrontLip: a blocky palm draped over the lip top, three fingers curling down the ledge's front face ending in tapered horn claws that bite into the stone, plus a short thumb spur and claw on the outer side; the wrist sits at the lip line so the hand reads as carrying the body's weight. Build each finger as a small chain or three-box bend so the curl reads clearly, claws darkened at their tips (hornDark) where they grind the stone.",
      "box": [[-0.62, 0.5, 0.2], [0.62, 1.15, 0.85]],
      "attaches": "Shoulders seat on shoulderL/shoulderR (mounts shared with body); palms and claws wrap the ledge front lip at ledgeFrontLip, fingers hanging down the ledge's front face.",
      "joints": ["shoulderL", "elbowL", "wristL", "gripL", "shoulderR", "elbowR", "wristR", "gripR"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "legs",
      "builds": "The digitigrade crouch, mirrored. From each hip mount a massive thigh sweep sweeps forward-up to kneeL/kneeR (knee drawn up high beside the chest, thigh radius ~0.13, stoneMid with a stoneLight outer highlight and carved muscle ridge slabs), then the shin folds back-down to hockL/hockR (thin, stoneMid, stoneDark inner shade) with a pointed hock spur (horn) at the back, then the short foot segment to footL/footR landing flat on the ledge top at ledgeTop. Foot: a blocky stone paddle with three forward toes ending in blunt horn claws that grip the ledge surface (claw tips sink 1 cm into the stone, moss tufts - moss - at the foot-stone junction), plus a small raised rear dewclaw. Knee cap: a triangular horn spur on each knee pointing forward. Ankle band ring (stoneDark), two crack slivers per shin, and worn stoneLight scratch marks on the foot tops. Keep the haunch-to-knee volume bold: the folded legs are half the crouch's silhouette.",
      "box": [[-0.5, 0.5, -0.35], [0.5, 1.0, 0.35]],
      "attaches": "Haunch tops seat on hipL/hipR (mounts shared with body); feet and toe claws plant on ledgeTop; knees sit just outside the body part's flanks.",
      "joints": ["hipL", "kneeL", "hockL", "footL", "hipR", "kneeR", "hockR", "footR"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "wings",
      "builds": "The folded gothic bat wings, mirrored, the model's tallest silhouette. Wing arm: a sweep from each wingRoot mount up and back to wingElbowL/wingElbowR (a sharp backwards-bent elbow, radius 0.075) then up-inward to wingWristL/wingWristR (radius 0.045), stoneMid arm segments with a stoneLight outer edge and a horn spur spike at each elbow. From each wrist three finger spars fan down and back to wingFinger1/2/3L/R (tapering 0.03 to 0.008, stoneDark spars), the fold closing the wing into a tall fan above the shoulders; a short clawed thumb (horn) juts at each wrist. Membranes: b.membrane between consecutive finger spars (wingSlate, thickness ~0.012, scallop ~0.12 for the weathered gothic curve), a smaller leading membrane between the wing arm and finger 1, and a lower lobe membrane folding down along the spine to the haunches (to y ~0.9). Trim each membrane's edges with a thin wingSlateDark band; weather the panels with two small wingSlateDark patch slivers per wing (old repairs) and a moss fleck where a wing meets the back. Membrane surfaces stay slightly darker and cooler than the body stone so the wings read as a different carved panel behind the figure.",
      "box": [[-0.95, 0.85, -0.75], [0.95, 2.05, 0.12]],
      "attaches": "Wing arm roots seat on wingRootL/wingRootR (mounts shared with body); the lower membrane lobe lies against the body part's back; the folded fan rises behind the head part without covering the face.",
      "joints": ["wingRootL", "wingElbowL", "wingWristL", "wingFinger1L", "wingFinger2L", "wingFinger3L", "wingRootR", "wingElbowR", "wingWristR", "wingFinger1R", "wingFinger2R", "wingFinger3R"],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  line,
  polyline,
} from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: any) {
  const MID = P.stoneMid;
  const LIGHT = P.stoneLight;
  const DARK = P.stoneDark;
  const DEEP = P.stoneDeep;
  const MOSS = P.moss;
  const MOSS_DARK = P.mossDark;
  const HORN = P.horn;
  const WING_DARK = P.wingSlateDark;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any = J.core,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      name,
      flat: true,
    });

  const rod = (
    a: any,
    c: any,
    radius: number,
    color: string,
    bone: any = J.core,
    name?: string,
  ) =>
    b.sweep(catmull([a, c]), radius, {
      color,
      bone,
      caps: "round",
      sides: 7,
      name,
    });

  const slab = (points: any[], color: string, bone: any, name?: string) =>
    b.slab(points, {
      color,
      bone,
      thickness: 0.018,
      name,
    });

  // Broad crouched body: a low rump, sagging belly, and forward-leaning chest.
  const spinePath = catmull([
    [0, 0.62, -0.18],
    [0, 0.78, -0.08],
    [0, 0.95, 0.02],
    [0, 1.06, 0.16],
    [0, 1.16, 0.29],
    [0, 1.23, 0.38],
  ]);

  const torso = b.sweep(spinePath, (t: number) => {
    if (t < 0.22) return 0.29;
    if (t < 0.48) return 0.255;
    if (t < 0.78) return 0.215;
    return 0.18;
  }, {
    bone: [J.core, J.chest],
    color: MID,
    sides: 8,
    sectors: [
      [35, 145, LIGHT],
      [145, 235, DARK],
      [235, 325, MID],
    ],
    shift: (t: number) => [0, t < 0.62 ? -0.035 : -0.015],
    name: "bodyTorso",
  });

  // Heavy haunches seated just above the cornice.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.27, 9, 7),
      MID,
      {
        at: [s * 0.25, 0.76, -0.045],
        scale: [1.0, 0.82, 1.05],
        bone: s > 0 ? J.hipL : J.hipR,
        name: `haunch${s > 0 ? "L" : "R"}`,
        flat: true,
      },
    );

    // Raised outer thigh plane, like a carved muscle buttress.
    slab(
      [
        [s * 0.18, 0.69, 0.17],
        [s * 0.39, 0.76, 0.14],
        [s * 0.42, 0.91, -0.02],
        [s * 0.27, 1.01, -0.08],
      ],
      LIGHT,
      s > 0 ? J.hipL : J.hipR,
      `haunchRidge${s > 0 ? "L" : "R"}`,
    );
  }

  // Belly keystone, visibly darker and hanging low between the haunches.
  b.part(
    new THREE.SphereGeometry(0.235, 8, 6),
    DARK,
    {
      at: [0, 0.7, 0.115],
      scale: [1.0, 0.62, 1.08],
      bone: J.core,
      name: "lowCarvedBelly",
      flat: true,
    },
  );

  // Shoulder and upper-back cap stones.
  b.part(
    new THREE.SphereGeometry(0.22, 8, 6),
    LIGHT,
    {
      at: [0, 1.105, 0.245],
      scale: [1.62, 0.78, 0.92],
      bone: J.chest,
      name: "wornShoulderCap",
      flat: true,
    },
  );

  // Two angular pectoral plates facing the viewer/front.
  for (const s of [1, -1]) {
    slab(
      [
        [s * 0.025, 1.09, 0.39],
        [s * 0.20, 1.15, 0.405],
        [s * 0.24, 1.035, 0.445],
        [s * 0.045, 0.99, 0.43],
      ],
      LIGHT,
      J.chest,
      `pectoral${s > 0 ? "L" : "R"}`,
    );

    // Dark inset under each pectoral.
    rod(
      [s * 0.03, 1.005, 0.452],
      [s * 0.215, 1.045, 0.455],
      0.014,
      DEEP,
      J.chest,
      `pectoralCrease${s > 0 ? "L" : "R"}`,
    );
  }

  // Three carved ribs per flank, curved forward around the chest.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 0.88 + i * 0.105;
      const z = 0.12 + i * 0.045;
      const rib = catmull([
        [s * 0.19, y, z],
        [s * 0.31, y + 0.025, z + 0.04],
        [s * 0.39, y - 0.015, z + 0.12],
        [s * 0.31, y - 0.045, z + 0.19],
      ]);
      b.sweep(rib, 0.014, {
        color: i === 1 ? LIGHT : MID,
        bone: J.core,
        sides: 6,
        caps: "round",
        name: `carvedRib${s > 0 ? "L" : "R"}${i}`,
      });
      // Shadow immediately below each ridge gives the carving depth.
      rod(
        [s * 0.205, y - 0.035, z - 0.01],
        [s * 0.34, y - 0.05, z + 0.15],
        0.009,
        DEEP,
        J.core,
        `ribShadow${s > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // Four dorsal ridge teeth down the lower back.
  for (let i = 0; i < 4; i++) {
    const p: [number, number, number] = [
      0,
      0.69 + i * 0.105,
      -0.25 + i * 0.105,
    ];
    b.spike(p, [0, 0.55, -0.15], 0.075 - i * 0.008, 0.025, {
      color: LIGHT,
      bone: J.core,
      name: `spineRidge${i}`,
    });
  }

  // Large deliberate crack slivers across torso and flanks.
  slab(
    [
      [-0.28, 0.94, 0.33],
      [-0.11, 0.985, 0.35],
      [-0.03, 0.965, 0.36],
      [-0.20, 0.925, 0.345],
    ],
    DEEP,
    J.chest,
    "chestCrack",
  );
  slab(
    [
      [0.27, 0.87, 0.20],
      [0.39, 0.82, 0.18],
      [0.45, 0.80, 0.17],
      [0.32, 0.86, 0.19],
    ],
    DEEP,
    J.core,
    "flankCrackL",
  );
  slab(
    [
      [-0.31, 0.76, 0.04],
      [-0.42, 0.70, -0.01],
      [-0.46, 0.67, -0.025],
      [-0.33, 0.73, 0.015],
    ],
    DEEP,
    J.core,
    "flankCrackR",
  );

  // Moss caught in the nape and on the rump's rain-facing crown.
  for (const p of [
    [0.0, 1.215, 0.315],
    [0.12, 1.005, -0.09],
    [-0.18, 0.91, -0.08],
  ] as [number, number, number][]) {
    b.part(
      new THREE.ConeGeometry(0.045, 0.065, 5),
      MOSS,
      { at: p, dir: [0, 1, 0], bone: J.core, name: "mossFleck", flat: true },
    );
    b.part(
      new THREE.ConeGeometry(0.055, 0.012, 6),
      MOSS_DARK,
      {
        at: [p[0], p[1] - 0.012, p[2]],
        dir: [0, 1, 0],
        bone: J.core,
        name: "mossDarkRim",
        flat: true,
      },
    );
  }

  // Tail, deliberately passing over the back edge before dropping below the ledge.
  const tailPath = catmull([
    [0, 0.82, -0.30],
    [0, 0.67, -0.57],
    [0, 0.52, -0.77],
    [0.02, 0.36, -0.90],
    [0.25, 0.16, -1.05],
    [0.48, 0.12, -1.11],
    [0.64, 0.16, -1.04],
  ]);
  const tail = b.sweep(tailPath, (t: number) => 0.09 * (1 - t) + 0.018, {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    color: MID,
    sides: 7,
    sectors: [
      [35, 145, LIGHT],
      [145, 235, DARK],
    ],
    name: "carvedTail",
  });

  // Tail rings are built from short dark bands around live points.
  for (const t of [0.34, 0.62]) {
    const at = tail.at(t);
    const ring = b.ring(line(at.at, at.at.clone().add(at.tangent)), {
      count: 8,
      radius: at.radius * 1.035,
      name: `tailBand${t}`,
    });
    b.sweep(catmull(ring.items, { closed: true }), 0.012, {
      color: DEEP,
      bone: at.bone,
      caps: "none",
      sides: 6,
      name: `tailBand${t}`,
    });
  }

  // Six dorsal tail spines, increasing readability toward the tip.
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.13;
    const at = tail.at(t, 0, 0.012);
    b.spike(at, at, 0.075 - i * 0.009, 0.019 - i * 0.0015, {
      color: HORN,
      bone: at.bone,
      name: `tailSpine${i}`,
    });
  }

  // Leaf-shaped arrow tip assembled from two dark triangular slabs.
  const tip = tail.at(0.985);
  const tipPoint = tip.at.clone().addScaledVector(tip.tangent, 0.12);
  slab(
    [
      tip.at.clone().add(new THREE.Vector3(-0.045, 0.025, 0)),
      tip.at.clone().add(new THREE.Vector3(0.045, 0.025, 0)),
      tipPoint.clone().add(new THREE.Vector3(0, 0.025, 0)),
    ],
    WING_DARK,
    tip.bone,
    "tailArrowTip",
  );
  slab(
    [
      tip.at.clone().add(new THREE.Vector3(-0.045, -0.025, 0)),
      tip.at.clone().add(new THREE.Vector3(0.045, -0.025, 0)),
      tipPoint.clone().add(new THREE.Vector3(0, -0.025, 0)),
    ],
    WING_DARK,
    tip.bone,
    "tailArrowTipShadow",
  );
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { polyline } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const STONE = P.stoneMid ?? P.stone ?? "#7d8378";
  const LIGHT = P.stoneLight ?? "#a8ab9c";
  const DARK = P.stoneDark ?? "#565c55";
  const DEEP = P.stoneDeep ?? "#3c423c";
  const HORN = P.horn ?? "#c8c0a8";
  const HORN_DARK = P.hornDark ?? "#8f8874";
  const MOSS = P.moss ?? "#57703f";

  const v = (p: any) => new THREE.Vector3(p[0], p[1], p[2]);
  const point = (j: any) => (j?.at ? j.at : v(j));

  const box = (
    size: [number, number, number],
    at: THREE.Vector3,
    color: string,
    bone: any,
    name: string,
    rotation?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      name,
      flat: true,
    });
  };

  const tube = (
    a: any,
    c: any,
    radius: number | [number, number],
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.sweep(polyline([point(a), point(c)]), radius, {
      bone,
      color,
      sides: 7,
      caps: "round",
      name,
      skin: "rigid",
    });
  };

  const spike = (
    base: THREE.Vector3,
    tip: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.spike(base, tip, null, radius, {
      color,
      bone,
      name,
      sides: 6,
      caps: "point",
    });
  };

  const claw = (
    base: THREE.Vector3,
    forward: number,
    side: number,
    bone: any,
    name: string,
  ) => {
    const tip = base.clone().add(new THREE.Vector3(side * 0.012, -0.035, forward));
    spike(base, tip, 0.018, HORN_DARK, bone, name);
  };

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const hip = J[`hip${tag}`];
    const knee = J[`knee${tag}`];
    const hock = J[`hock${tag}`];
    const foot = J[`foot${tag}`];

    const hp = point(hip);
    const kp = point(knee);
    const ap = point(hock);
    const fp = point(foot);

    // Massive folded thigh and its raised outer muscle plane.
    tube(hp, kp, [0.145, 0.125], STONE, hip, `thigh${tag}`);
    tube(
      hp.clone().add(new THREE.Vector3(side * 0.055, 0.025, -0.01)),
      kp.clone().add(new THREE.Vector3(side * 0.045, 0.02, 0.015)),
      [0.045, 0.022],
      LIGHT,
      hip,
      `thighRidge${tag}`,
    );

    // Angular knee block and prominent forward kneecap.
    box(
      [0.22, 0.19, 0.2],
      kp.clone().add(new THREE.Vector3(0, 0.005, 0.015)),
      STONE,
      knee,
      `kneeMass${tag}`,
      [0, side * 0.12, 0],
    );
    spike(
      kp.clone().add(new THREE.Vector3(0, 0.01, 0.09)),
      kp.clone().add(new THREE.Vector3(0, 0.015, 0.22)),
      0.045,
      HORN,
      knee,
      `kneeSpur${tag}`,
    );
    box(
      [0.075, 0.025, 0.13],
      kp.clone().add(new THREE.Vector3(side * 0.075, 0.045, 0.035)),
      LIGHT,
      knee,
      `kneeWornPlane${tag}`,
      [0, side * 0.08, 0],
    );

    // Thin backward-folded shin with a cold underside strip.
    tube(ap, kp, [0.085, 0.07], STONE, hock, `shin${tag}`);
    tube(
      ap.clone().add(new THREE.Vector3(0, -0.045, 0)),
      kp.clone().add(new THREE.Vector3(0, -0.035, 0)),
      [0.028, 0.018],
      DARK,
      hock,
      `shinShadow${tag}`,
    );

    // Pointed rear hock spur.
    spike(
      ap.clone().add(new THREE.Vector3(0, 0.015, -0.065)),
      ap.clone().add(new THREE.Vector3(0, 0.08, -0.19)),
      0.035,
      HORN,
      hock,
      `hockSpur${tag}`,
    );

    // Ankle collar, made from a low-sided torus with its axis along the foot.
    const ankleRing = new THREE.TorusGeometry(0.083, 0.012, 5, 8);
    b.part(ankleRing, DARK, {
      at: ap.clone().add(new THREE.Vector3(0, -0.005, 0.035)),
      bone: hock,
      rotation: [Math.PI / 2, 0, 0],
      name: `ankleBand${tag}`,
      flat: true,
    });

    // Short flat foot paddle planted on the cornice top.
    box(
      [0.22, 0.105, 0.29],
      fp.clone().add(new THREE.Vector3(0, 0.015, 0.035)),
      STONE,
      foot,
      `footPaddle${tag}`,
      [0, 0, side * 0.035],
    );
    box(
      [0.16, 0.018, 0.18],
      fp.clone().add(new THREE.Vector3(side * 0.018, 0.075, 0.065)),
      LIGHT,
      foot,
      `footWornTop${tag}`,
      [0, 0, side * 0.035],
    );

    // Three broad forward toes, visibly separated.
    const toeX = [-0.065, 0, 0.065];
    toeX.forEach((x, i) => {
      const root = fp.clone().add(new THREE.Vector3(x, -0.005, 0.13));
      const mid = root.clone().add(new THREE.Vector3(x * 0.18, -0.012, 0.095));
      const end = mid.clone().add(new THREE.Vector3(x * 0.12, -0.018, 0.065));
      tube(root, mid, [0.032, 0.024], LIGHT, foot, `toe${tag}${i}`);
      tube(mid, end, [0.024, 0.012], STONE, foot, `toeBend${tag}${i}`);
      claw(end, 0.045, x > 0 ? 0.4 : -0.4, foot, `toeClaw${tag}${i}`);
    });

    // Raised rear dewclaw.
    const dew = fp.clone().add(new THREE.Vector3(side * 0.075, 0.035, -0.075));
    spike(
      dew,
      dew.clone().add(new THREE.Vector3(side * 0.035, -0.015, -0.07)),
      0.022,
      HORN_DARK,
      foot,
      `dewclaw${tag}`,
    );

    // Two deliberate carved cracks across each shin.
    for (const [i, z] of [0, 1].map((n) => [n, n === 0 ? -0.015 : 0.065] as const)) {
      const crack = new THREE.BoxGeometry(0.008, 0.055, 0.004);
      b.part(crack, DEEP, {
        at: ap.clone().add(new THREE.Vector3(side * (0.06 - i * 0.018), 0.02, z)),
        bone: hock,
        rotation: [0.2, side * 0.35, side * 0.3],
        name: `shinCrack${tag}${i}`,
        flat: true,
      });
    }

    // Small moss tucked where the planted foot meets the stone.
    for (const x of [-0.045, 0.025, 0.075]) {
      const mossBase = fp.clone().add(new THREE.Vector3(side * x, 0.065, -0.055));
      spike(
        mossBase,
        mossBase.clone().add(new THREE.Vector3(side * 0.012, 0.028, -0.008)),
        0.012,
        MOSS,
        foot,
        `footMoss${tag}${x}`,
      );
    }

    // A few short worn scratches on the top plane.
    for (let i = 0; i < 3; i++) {
      box(
        [0.012, 0.006, 0.055],
        fp.clone().add(new THREE.Vector3(side * (-0.055 + i * 0.05), 0.09, 0.055)),
        LIGHT,
        foot,
        `footScratch${tag}${i}`,
        [0, side * 0.12, side * 0.08],
      );
    }
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import {
  catmull,
  polyline,
  frame,
} from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const STONE = P.stoneMid;
  const LIGHT = P.stoneLight;
  const DARK = P.stoneDark;
  const DEEP = P.stoneDeep;
  const MEM = P.wingSlate;
  const MEM_DARK = P.wingSlateDark;
  const HORN = P.horn;
  const MOSS = P.moss;

  const wingArm = (s: number) => {
    const root = J[`wingRoot${s > 0 ? "L" : "R"}`];
    const elbow = J[`wingElbow${s > 0 ? "L" : "R"}`];
    const wrist = J[`wingWrist${s > 0 ? "L" : "R"}`];

    const armPath = catmull([
      root.at,
      elbow.at,
      wrist.at,
    ]);

    b.sweep(armPath, (t: number) => 0.078 - t * 0.032, {
      bone: [root, elbow, wrist],
      color: STONE,
      sides: 7,
      caps: "round",
      name: `wingArm${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Pale worn ridge along the exposed upper edge of the wing arm.
    const ridge = polyline([
      [root.at.x + s * 0.035, root.at.y + 0.045, root.at.z - 0.01],
      [elbow.at.x + s * 0.035, elbow.at.y + 0.045, elbow.at.z - 0.01],
      [wrist.at.x + s * 0.02, wrist.at.y + 0.03, wrist.at.z - 0.01],
    ]);

    b.sweep(ridge, [0.018, 0.009], {
      bone: [root, elbow, wrist],
      color: LIGHT,
      sides: 5,
      caps: "flat",
      name: `wingOuterRidge${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Angular elbow spur.
    b.spike(
      elbow.at,
      [s * 0.32, 0.42, -0.26],
      0.18,
      0.035,
      {
        bone: elbow,
        color: HORN,
        caps: { start: "round", end: "point" },
        name: `wingElbowSpur${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // A short clawed thumb projecting from the wrist.
    b.spike(
      wrist.at,
      [s * 0.22, 0.1, -0.24],
      0.19,
      0.025,
      {
        bone: wrist,
        color: HORN,
        caps: { start: "round", end: "point" },
        name: `wingThumb${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    const tips = [
      J[`wingFinger1${s > 0 ? "L" : "R"}`],
      J[`wingFinger2${s > 0 ? "L" : "R"}`],
      J[`wingFinger3${s > 0 ? "L" : "R"}`],
    ];

    const fingerPaths = tips.map((tip, i) => {
      const bend = [
        [tip.at.x + s * 0.025, tip.at.y + 0.055, tip.at.z + 0.01],
        [tip.at.x, tip.at.y, tip.at.z],
      ];

      const path = catmull([wrist.at, bend[0], bend[1]]);
      b.sweep(path, [0.031 - i * 0.004, 0.007], {
        bone: [wrist, tip],
        color: DARK,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `wingFinger${i + 1}${s > 0 ? "L" : "R"}`,
        group: "wings",
      });

      // Small pale cap at each weathered finger tip.
      b.spike(
        tip.at,
        [s * -0.05, -0.18, -0.13],
        0.055,
        0.012,
        {
          bone: tip,
          color: HORN,
          caps: { start: "flat", end: "point" },
          name: `wingFingerClaw${i + 1}${s > 0 ? "L" : "R"}`,
          group: "wings",
        },
      );

      return path;
    });

    // The three bat-wing membrane panels.
    for (let i = 0; i < fingerPaths.length - 1; i++) {
      const panel = b.membrane(fingerPaths[i], fingerPaths[i + 1], {
        bone: [wrist, tips[i], tips[i + 1]],
        color: MEM,
        thickness: 0.012,
        rows: 4,
        cols: 5,
        scallop: 0.12,
        name: `wingMembrane${i + 1}${s > 0 ? "L" : "R"}`,
        group: "wings",
      });

      // Dark carved seam following each panel's trailing edge.
      b.sweep(
        panel.line ? panel.line(0) : fingerPaths[i],
        0.009,
        {
          bone: [wrist, tips[i]],
          color: MEM_DARK,
          sides: 5,
          caps: "flat",
          name: `wingMembraneSeam${i + 1}${s > 0 ? "L" : "R"}`,
          group: "wings",
        },
      );
    }

    // Leading membrane between the raised arm and the first finger.
    b.membrane(armPath, fingerPaths[0], {
      bone: [root, elbow, wrist, tips[0]],
      color: MEM,
      thickness: 0.012,
      rows: 4,
      cols: 5,
      scallop: 0.1,
      name: `wingLeadingMembrane${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // A broad lower lobe folds back against the spine and haunch.
    const lowerEdge = catmull([
      wrist.at,
      [s * 0.69, 1.34, -0.36],
      [s * 0.48, 1.02, -0.56],
      [s * 0.28, 0.88, -0.42],
    ]);

    const bodyEdge = catmull([
      root.at,
      [s * 0.22, 1.0, -0.19],
      [s * 0.18, 0.91, -0.31],
      [s * 0.2, 0.86, -0.38],
    ]);

    b.membrane(bodyEdge, lowerEdge, {
      bone: [root, elbow, wrist],
      color: MEM,
      thickness: 0.014,
      rows: 5,
      cols: 6,
      scallop: 0.15,
      name: `wingLowerLobe${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Dark folded ribs make the membrane read as carved panels.
    const ribA = polyline([
      [s * 0.31, 1.12, -0.22],
      [s * 0.55, 1.42, -0.28],
      [s * 0.68, 1.69, -0.17],
    ]);
    const ribB = polyline([
      [s * 0.26, 1.01, -0.31],
      [s * 0.47, 1.29, -0.39],
      [s * 0.59, 1.51, -0.4],
    ]);

    b.sweep(ribA, 0.009, {
      bone: [root, elbow, wrist],
      color: MEM_DARK,
      sides: 5,
      caps: "flat",
      name: `wingRibA${s > 0 ? "L" : "R"}`,
      group: "wings",
    });
    b.sweep(ribB, 0.008, {
      bone: [root, elbow, wrist],
      color: MEM_DARK,
      sides: 5,
      caps: "flat",
      name: `wingRibB${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Two angular repair patches, deliberately slightly proud of the membrane.
    const patch1 = b.part(
      new THREE.BoxGeometry(0.13, 0.055, 0.012),
      MEM_DARK,
      {
        bone: wrist,
        at: [s * 0.59, 1.53, -0.255],
        dir: [0.15 * s, 0.35, -1],
        rotation: [0, s * 18, s * 12],
        name: `wingRepairA${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );
    const patch2 = b.part(
      new THREE.BoxGeometry(0.095, 0.045, 0.012),
      MEM_DARK,
      {
        bone: elbow,
        at: [s * 0.47, 1.3, -0.39],
        dir: [-0.2 * s, 0.2, -1],
        rotation: [0, -s * 24, -s * 9],
        name: `wingRepairB${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // Moss tucked into the root crease, kept small and low.
    b.part(
      new THREE.DodecahedronGeometry(0.035, 0),
      MOSS,
      {
        bone: root,
        at: [s * 0.28, 1.105, -0.12],
        scale: [1.4, 0.55, 0.7],
        name: `wingMoss${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );
  };

  wingArm(1);
  wingArm(-1);

  // A narrow dark central overlap between the folded wings.
  b.sweep(
    polyline([
      [0, 1.08, -0.12],
      [0, 1.48, -0.2],
      [0, 1.83, -0.12],
    ]),
    0.018,
    {
      bone: J.chest,
      color: DEEP,
      sides: 6,
      caps: "flat",
      name: "wingCentralFold",
      group: "wings",
    },
  );
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import {
  polyline,
  rng,
} from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: Ctx) {
  const STONE = P.stoneMid;
  const LIGHT = P.stoneLight;
  const DARK = P.stoneDark;
  const DEEP = P.stoneDeep;
  const HORN = P.horn;
  const HORN_DARK = P.hornDark;
  const MOSS = P.moss;
  const rngLocal = rng(731);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any,
    name: string,
    dir?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
      group: "arms",
    });

  const stoneCapsule = (
    points: [number, number, number][],
    radius: number | [number, number],
    color: string,
    bones: any[],
    name: string,
  ) =>
    b.sweep(polyline(points), radius, {
      color,
      bone: bones,
      sides: 8,
      caps: "round",
      name,
      group: "arms",
    });

  const claw = (
    base: [number, number, number],
    tip: [number, number, number],
    bone: any,
    name: string,
  ) => {
    b.spike(base, tip, null, 0.018, {
      color: HORN,
      bone,
      caps: { start: "round", end: "point" },
      name,
      group: "arms",
    });

    const dx = tip[0] - base[0];
    const dy = tip[1] - base[1];
    const dz = tip[2] - base[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const inset = Math.max(0.012, len - 0.028);
    const t = inset / len;
    const darkBase: [number, number, number] = [
      base[0] + dx * t,
      base[1] + dy * t,
      base[2] + dz * t,
    ];
    b.spike(darkBase, tip, null, 0.020, {
      color: HORN_DARK,
      bone,
      caps: { start: "flat", end: "point" },
      name: `${name}Tip`,
      group: "arms",
    });
  };

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const shoulder = J[`shoulder${tag}`];
    const elbow = J[`elbow${tag}`];
    const wrist = J[`wrist${tag}`];
    const grip = J[`grip${tag}`];

    const sx = side;
    const shoulderAt: [number, number, number] = [
      sx * 0.38,
      1.02,
      0.26,
    ];
    const elbowAt: [number, number, number] = [
      sx * 0.52,
      0.74,
      0.50,
    ];
    const wristAt: [number, number, number] = [
      sx * 0.44,
      0.56,
      0.68,
    ];
    const palmAt: [number, number, number] = [
      sx * 0.42,
      0.575,
      0.765,
    ];

    // Heavy, hunched deltoid cap.
    b.part(
      new THREE.SphereGeometry(0.145, 8, 6),
      LIGHT,
      {
        at: shoulderAt,
        bone: shoulder,
        scale: [1.0, 0.82, 1.08],
        name: `deltoid${tag}`,
        group: "arms",
        flat: true,
      },
    );

    // Angular shoulder plate, worn on its upper face.
    box(
      [0.22, 0.12, 0.20],
      [sx * 0.385, 1.055, 0.285],
      LIGHT,
      shoulder,
      `shoulderPlate${tag}`,
      [sx * 0.25, 0.8, 0.55],
    );

    // Upper arm and thick forearm, following the supplied arm bones.
    stoneCapsule(
      [shoulderAt, elbowAt],
      [0.112, 0.095],
      STONE,
      [shoulder, elbow],
      `upperArm${tag}`,
    );
    stoneCapsule(
      [elbowAt, wristAt],
      [0.092, 0.078],
      STONE,
      [elbow, wrist],
      `forearm${tag}`,
    );

    // Cold underside facets.
    stoneCapsule(
      [
        [sx * 0.405, 0.875, 0.435],
        [sx * 0.47, 0.70, 0.565],
      ],
      [0.040, 0.032],
      DARK,
      [shoulder, elbow],
      `armUnderside${tag}`,
    );

    // Pointed elbow spur aimed outward and slightly back.
    b.spike(
      [sx * 0.535, 0.735, 0.505],
      [sx * 0.66, 0.77, 0.43],
      null,
      0.045,
      {
        color: HORN,
        bone: elbow,
        caps: { start: "round", end: "point" },
        name: `elbowSpur${tag}`,
        group: "arms",
      },
    );

    // Forearm iron-like carved band, represented as a dark stone torus.
    b.part(
      new THREE.TorusGeometry(0.087, 0.012, 5, 8),
      DARK,
      {
        at: [sx * 0.48, 0.695, 0.555],
        bone: elbow,
        dir: [sx * -0.15, -0.5, 0.7],
        name: `forearmBand${tag}`,
        group: "arms",
        flat: true,
      },
    );

    // Knuckle plates along the upper/outward plane of the forearm.
    for (let i = 0; i < 3; i++) {
      const t = i / 2;
      const p: [number, number, number] = [
        sx * (0.505 - 0.055 * t),
        0.675 + 0.015 * t,
        0.575 + 0.095 * t,
      ];
      box(
        [0.052, 0.026, 0.075],
        p,
        LIGHT,
        wrist,
        `knuckle${tag}${i}`,
        [sx * 0.15, 0.35, 0.92],
      );
    }

    // One chipped crack sliver per forearm.
    box(
      [0.012, 0.004, 0.105],
      [sx * 0.505, 0.755, 0.595],
      DEEP,
      elbow,
      `armCrack${tag}`,
      [sx * 0.25, 0.15, 0.95],
    );

    // Small moss clump caught in the left elbow crease.
    if (side > 0) {
      for (let i = 0; i < 4; i++) {
        const x = 0.505 + (rngLocal() - 0.5) * 0.045;
        const y = 0.765 + rngLocal() * 0.035;
        const z = 0.505 + rngLocal() * 0.035;
        b.spike(
          [x, y, z],
          [x + (rngLocal() - 0.5) * 0.025, y + 0.025, z + 0.018],
          null,
          0.014,
          {
            color: i % 2 ? P.mossDark : MOSS,
            bone: elbow,
            caps: { start: "round", end: "point" },
            name: `elbowMoss${i}`,
            group: "arms",
          },
        );
      }
    }

    // Palm draped over the cornice lip.
    box(
      [0.18, 0.115, 0.16],
      palmAt,
      STONE,
      grip,
      `palm${tag}`,
      [0, 0.15, 1],
    );
    box(
      [0.15, 0.035, 0.13],
      [sx * 0.42, 0.635, 0.785],
      LIGHT,
      grip,
      `palmTop${tag}`,
      [0, 0.15, 1],
    );

    // Dark palm crease where the fingers fold over the ledge.
    box(
      [0.145, 0.014, 0.018],
      [sx * 0.42, 0.608, 0.812],
      DEEP,
      grip,
      `palmCrease${tag}`,
      [0, 0, 1],
    );

    // Three separated hooked fingers. Their first segment runs over the top,
    // then drops down the front face and curls slightly inward.
    const fingerX = [0.355, 0.42, 0.485];
    for (let i = 0; i < 3; i++) {
      const x = sx * fingerX[i];
      const spread = (i - 1) * 0.012;

      const p0: [number, number, number] = [x, 0.615, 0.805 + spread];
      const p1: [number, number, number] = [x, 0.585, 0.84 + spread];
      const p2: [number, number, number] = [
        x - sx * 0.008,
        0.505,
        0.855 + spread,
      ];
      const p3: [number, number, number] = [
        x - sx * 0.018,
        0.465,
        0.825 + spread,
      ];

      stoneCapsule(
        [p0, p1, p2, p3],
        [0.026, 0.019],
        STONE,
        [grip],
        `finger${tag}${i}`,
      );

      claw(
        [x - sx * 0.018, 0.485, 0.828 + spread],
        [x - sx * 0.028, 0.425, 0.815 + spread],
        grip,
        `fingerClaw${tag}${i}`,
      );

      // A small worn highlight on every finger knuckle.
      box(
        [0.032, 0.018, 0.045],
        [x, 0.585, 0.833 + spread],
        LIGHT,
        grip,
        `fingerPlate${tag}${i}`,
        [0, 0.25, 1],
      );
    }

    // Outer thumb, splayed sideways from the palm.
    const thumbBase: [number, number, number] = [
      sx * 0.505,
      0.60,
      0.765,
    ];
    const thumbMid: [number, number, number] = [
      sx * 0.555,
      0.555,
      0.785,
    ];
    stoneCapsule(
      [thumbBase, thumbMid],
      [0.032, 0.022],
      STONE,
      [grip],
      `thumb${tag}`,
    );
    claw(
      thumbMid,
      [sx * 0.59, 0.505, 0.80],
      grip,
      `thumbClaw${tag}`,
    );

    // Tiny deep chips where the claws bite the front edge.
    for (let i = 0; i < 3; i++) {
      const x = sx * (0.355 + i * 0.065);
      box(
        [0.016, 0.020, 0.012],
        [x, 0.425, 0.818 + (i - 1) * 0.012],
        DEEP,
        grip,
        `clawScar${tag}${i}`,
        [0, 0, 1],
      );
    }
  }
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: Ctx) {
  const stoneMid = P.stoneMid;
  const stoneLight = P.stoneLight;
  const stoneDark = P.stoneDark;
  const stoneDeep = P.stoneDeep;
  const moss = P.moss;
  const mossDark = P.mossDark;
  const lichen = P.lichen;
  const iron = P.iron;
  const rust = P.rust;
  const brass = P.brass;
  const stain = P.stain;

  const at = (geometry: THREE.BufferGeometry, color: string, p: [number, number, number], opts: any = {}) =>
    b.part(geometry, color, { at: p, ...opts });

  const box = (
    size: [number, number, number],
    color: string,
    p: [number, number, number],
    opts: any = {},
  ) => at(new THREE.BoxGeometry(size[0], size[1], size[2]), color, p, opts);

  const cyl = (
    radius: number,
    depth: number,
    color: string,
    p: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) =>
    at(
      new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false),
      color,
      p,
      { dir, ...{} },
    );

  const cone = (
    radius: number,
    height: number,
    color: string,
    p: [number, number, number],
    dir: [number, number, number],
  ) => at(new THREE.ConeGeometry(radius, height, 6), color, p, { dir });

  // Main masonry block, deliberately faceted and slightly overbuilt into the floor.
  box([2.4, 0.5, 1.55], stoneMid, [0, 0.25, -0.025]);

  // Cold underside shadow and the three broad cornice courses.
  box([2.34, 0.07, 1.68], stoneDark, [0, 0.535, 0.035]);
  box([2.30, 0.055, 1.74], stoneDeep, [0, 0.592, 0.035]);
  box([2.34, 0.055, 1.68], stoneMid, [0, 0.642, 0.02]);
  box([2.42, 0.075, 1.76], stoneLight, [0, 0.707, 0.035]);

  // Stepped lower ogee / dripping front molding.
  box([2.42, 0.055, 0.10], stoneDark, [0, 0.49, 0.79]);
  box([2.34, 0.07, 0.09], stoneMid, [0, 0.535, 0.835]);
  box([2.26, 0.055, 0.07], stoneLight, [0, 0.585, 0.855]);
  for (const x of [-1.12, 1.12]) {
    box([0.11, 0.12, 0.12], stoneDark, [x, 0.565, 0.79]);
    box([0.08, 0.08, 0.10], stoneLight, [x * 0.985, 0.66, 0.82]);
  }

  // Chipped top-course corners and worn edge blocks.
  for (const x of [-1.17, 1.17]) {
    box([0.10, 0.06, 0.13], stoneDark, [x, 0.755, 0.81]);
    box([0.07, 0.045, 0.10], stoneDark, [x * 0.98, 0.77, -0.79]);
  }
  for (const x of [-0.78, 0, 0.78]) {
    box([0.12, 0.035, 0.08], stoneLight, [x, 0.757, 0.80]);
  }

  // Three chunky chamfered corbels beneath the front edge.
  for (const x of [-0.7, 0, 0.7]) {
    b.frustumBox(
      [x, 0.02, 0.69],
      [x, 0.43, 0.72],
      [0.29, 0.25],
      [0.17, 0.17],
      { color: stoneDark },
    );
    box([0.25, 0.045, 0.08], stoneLight, [x, 0.43, 0.73]);
    box([0.18, 0.05, 0.07], stoneDeep, [x, 0.11, 0.70]);
  }

  // Nine dentils under the lip.
  for (let i = 0; i < 9; i++) {
    const x = -0.96 + i * 0.24;
    box([0.13, 0.105, 0.14], stoneLight, [x, 0.475, 0.805]);
    box([0.105, 0.018, 0.145], stoneDark, [x, 0.425, 0.807]);
  }

  // Iron reinforcement straps and their rust bleed.
  for (const x of [-0.55, 0.55]) {
    box([0.055, 0.47, 0.018], iron, [x, 0.275, 0.755]);
    box([0.075, 0.018, 0.023], rust, [x, 0.47, 0.771]);
    for (const y of [0.13, 0.29, 0.45]) {
      cyl(0.026, 0.026, rust, [x, y, 0.78], [0, 0, 1], 8);
    }
    box([0.024, 0.17, 0.012], rust, [x - 0.012, 0.10, 0.766]);
    box([0.017, 0.11, 0.012], rust, [x + 0.025, 0.22, 0.766]);
    box([0.012, 0.09, 0.012], stain, [x - 0.035, 0.34, 0.766]);
  }

  // Dark water streaks beneath the lip.
  for (const [x, y, h, w] of [
    [-0.92, 0.30, 0.28, 0.035],
    [-0.25, 0.22, 0.19, 0.025],
    [0.22, 0.31, 0.34, 0.028],
    [0.88, 0.25, 0.24, 0.04],
  ] as [number, number, number, number][]) {
    box([w, h, 0.012], stain, [x, y, 0.771]);
    box([w * 0.55, 0.035, 0.016], stoneDark, [x, y + h / 2, 0.778]);
  }

  // Carved central drainage channel: interrupted groove slabs descending toward the lip.
  for (let i = 0; i < 7; i++) {
    const z = 0.62 - i * 0.18;
    const y = 0.75 - i * 0.018;
    box([0.09 + (i % 2) * 0.015, 0.012, 0.13], stoneDark, [0, y, z]);
    if (i < 6) box([0.035, 0.014, 0.055], stoneDeep, [0, y + 0.009, z - 0.075]);
  }

  // Brass consecration plaque on the front face.
  cyl(0.115, 0.018, brass, [0, 0.255, 0.865], [0, 0, 1], 12);
  cyl(0.087, 0.006, stoneDeep, [0, 0.255, 0.877], [0, 0, 1], 12);
  const star = [
    [0, 0.075],
    [0.018, 0.018],
    [0.075, 0],
    [0.018, -0.018],
    [0, -0.075],
    [-0.018, -0.018],
    [-0.075, 0],
    [-0.018, 0.018],
  ] as [number, number][];
  b.extrude(star, {
    at: [0, 0.255, 0.884],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    color: brass,
  });
  for (const x of [-0.075, 0.075]) cyl(0.014, 0.012, brass, [x, 0.255, 0.884], [0, 0, 1], 8);

  // Pale lichen crust on the exposed side faces.
  for (const p of [
    [-1.205, 0.48, -0.52],
    [-1.205, 0.57, -0.18],
    [-1.205, 0.31, 0.25],
    [1.205, 0.43, -0.63],
    [1.205, 0.57, -0.32],
    [1.205, 0.22, 0.48],
  ] as [number, number, number][]) {
    box([0.014, 0.075, 0.13], lichen, p);
  }

  // Moss rims on upward-facing ledge edges and in the molding shadow.
  for (const x of [-0.96, -0.62, -0.26, 0.18, 0.56, 0.92]) {
    box([0.22, 0.018, 0.045], mossDark, [x, 0.755, 0.865]);
    box([0.15, 0.014, 0.032], moss, [x + 0.025, 0.772, 0.858]);
  }
  for (const x of [-1.0, -0.46, 0.1, 0.67, 1.02]) {
    box([0.20, 0.022, 0.035], mossDark, [x, 0.625, 0.855]);
    box([0.11, 0.018, 0.028], moss, [x - 0.025, 0.642, 0.851]);
  }

  // Small moss islands on the top where the gargoyle will perch.
  for (const [x, z, sx, sz] of [
    [-0.72, 0.08, 0.18, 0.08],
    [0.69, -0.14, 0.16, 0.07],
    [-0.35, -0.50, 0.12, 0.06],
    [0.42, -0.60, 0.15, 0.07],
  ] as [number, number, number, number][]) {
    box([sx, 0.018, sz], mossDark, [x, 0.755, z]);
    box([sx * 0.65, 0.012, sz * 0.65], moss, [x + 0.018, 0.77, z + 0.008]);
  }

  // A few deliberate carved chips along the front and side silhouette.
  for (const [x, y, z] of [
    [-1.15, 0.17, 0.77],
    [-0.98, 0.52, 0.80],
    [1.13, 0.38, 0.82],
    [0.98, 0.13, -0.80],
    [-1.04, 0.60, -0.79],
  ] as [number, number, number][]) {
    cone(0.035, 0.09, stoneDeep, [x, y, z], [0, 0, 1]);
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";
import { createBuilder, frame, catmull, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const stone = P.stoneMid;
  const light = P.stoneLight;
  const dark = P.stoneDark;
  const deep = P.stoneDeep;
  const horn = P.horn;
  const hornDark = P.hornDark;
  const ink = P.eyeInk;
  const amber = P.eyeGlow;
  const mouth = P.mouth;
  const tongue = P.tongue;
  const moss = P.moss;

  const head = J.head;
  const jaw = J.jaw;
  const earL = J.earL;
  const earR = J.earR;

  const sphere = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone = head,
    seg = 8,
    rings = 6,
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, rings), color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const box = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone = head,
  ) =>
    b.part(new THREE.BoxGeometry(1, 1, 1), color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    bone = head,
  ) => b.rod(a, z, radius, { color, bone, section: { ngon: 6 } });

  const spike = (
    at: [number, number, number],
    tip: [number, number, number],
    radius: number,
    color: string,
    bone = head,
  ) => b.spike(at, tip, null, radius, { color, bone, caps: "point" });

  // Angular cranium: broad lower skull, tapered crown and a cold under-jaw block.
  b.loft(
    [
      { at: [-0.01, 1.27, 0.45], w: 0.38, h: 0.34 },
      { at: [0.0, 1.44, 0.48], w: 0.43, h: 0.39 },
      { at: [0.0, 1.63, 0.39], w: 0.32, h: 0.30 },
      { at: [0.0, 1.72, 0.34], w: 0.25, h: 0.16 },
    ],
    { color: stone, bone: head, section: "box", caps: "round" },
  );
  box([0, 1.61, 0.36], [0.26, 0.055, 0.22], light, head);
  box([0, 1.31, 0.40], [0.29, 0.12, 0.19], deep, head);
  box([0, 1.48, 0.25], [0.32, 0.07, 0.08], dark, head);

  // Crown facets and carved temple blocks.
  for (const s of [-1, 1]) {
    box([s * 0.145, 1.61, 0.34], [0.065, 0.18, 0.17], light, head);
    box([s * 0.19, 1.48, 0.40], [0.045, 0.17, 0.14], dark, head);
    rod(
      [s * 0.17, 1.68, 0.40],
      [s * 0.19, 1.54, 0.29],
      0.009,
      deep,
      head,
    );
  }

  // Heavy brow, split into a lit upper ledge and deep carved underside.
  for (const s of [-1, 1]) {
    b.frustumBox(
      [s * 0.025, 1.515, 0.62],
      [s * 0.145, 1.535, 0.73],
      [0.12, 0.055],
      [0.085, 0.045],
      { color: light, bone: head, section: "box" },
    );
    box([s * 0.135, 1.485, 0.695], [0.15, 0.045, 0.09], deep, head);
    rod(
      [s * 0.055, 1.505, 0.755],
      [s * 0.205, 1.505, 0.70],
      0.012,
      dark,
      head,
    );
  }

  // Deep socket bowls, amber eyes and vertical slit pupils.
  for (const s of [-1, 1]) {
    sphere([s * 0.105, 1.455, 0.755], [0.105, 0.075, 0.045], ink, head, 8, 5);
    const eye = sphere(
      [s * 0.105, 1.455, 0.785],
      [0.061, 0.064, 0.026],
      amber,
      head,
      10,
      6,
    );
    glow(eye, 2.2);
    box([s * 0.105, 1.455, 0.813], [0.012, 0.048, 0.008], ink, head);
    sphere([s * 0.084, 1.477, 0.817], [0.012, 0.012, 0.006], light, head, 6, 4);
  }

  // Upper muzzle: a carved wedge projecting toward the viewer.
  b.loft(
    [
      { at: [0, 1.39, 0.64], w: 0.28, h: 0.20 },
      { at: [0, 1.34, 0.82], w: 0.24, h: 0.16 },
      { at: [0, 1.31, 0.96], w: 0.17, h: 0.11 },
    ],
    { color: stone, bone: head, section: "box", caps: "flat" },
  );
  box([0, 1.45, 0.70], [0.24, 0.045, 0.17], light, head);
  rod([0, 1.50, 0.66], [0, 1.42, 0.91], 0.018, light, head);
  box([0, 1.315, 0.965], [0.17, 0.045, 0.025], dark, head);
  for (const s of [-1, 1]) {
    box([s * 0.052, 1.345, 0.912], [0.025, 0.038, 0.012], ink, head);
    rod([s * 0.07, 1.39, 0.87], [s * 0.08, 1.34, 0.94], 0.008, dark, head);
  }

  // Open lower jaw, attached to the jaw hinge and angled down.
  b.loft(
    [
      { at: [0, 1.25, 0.61], w: 0.25, h: 0.13 },
      { at: [0, 1.18, 0.76], w: 0.22, h: 0.11 },
      { at: [0, 1.13, 0.90], w: 0.16, h: 0.075 },
    ],
    { color: stone, bone: jaw, section: "box", caps: "flat" },
  );
  box([0, 1.235, 0.70], [0.20, 0.035, 0.17], mouth, jaw);
  rod([0, 1.28, 0.62], [0, 1.16, 0.88], 0.021, dark, jaw);
  rod([0, 1.125, 0.89], [0, 1.12, 0.98], 0.018, light, jaw);
  b.sweep(
    catmull([
      [-0.07, 1.19, 0.73],
      [0, 1.145, 0.82],
      [0.09, 1.14, 0.88],
    ]),
    [0.026, 0.016],
    { color: tongue, bone: jaw, section: { ngon: 6 } },
  );

  // Teeth: prominent upper fangs, then smaller alternating teeth on both jaws.
  for (const s of [-1, 1]) {
    spike([s * 0.105, 1.36, 0.80], [s * 0.105, 1.245, 0.84], 0.026, horn, head);
    spike([s * 0.115, 1.255, 0.69], [s * 0.115, 1.19, 0.72], 0.018, horn, jaw);
    for (const z of [0.73, 0.80, 0.87]) {
      spike([s * 0.06, 1.33, z], [s * 0.06, 1.285, z + 0.012], 0.012, horn, head);
      spike([s * 0.052, 1.225, z], [s * 0.052, 1.185, z + 0.01], 0.010, horn, jaw);
    }
  }
  spike([0.075, 1.18, 0.80], [0.075, 1.28, 0.83], 0.024, horn, jaw);

  // Swept horns, each with three dark carved ridge rings.
  for (const s of [-1, 1]) {
    const hornPath = catmull([
      [s * 0.15, 1.62, 0.40],
      [s * 0.23, 1.75, 0.25],
      [s * 0.29, 1.88, 0.08],
      [s * 0.34, 1.96, -0.08],
    ]);
    const hs = b.sweep(hornPath, [0.052, 0.012], {
      color: horn,
      bone: head,
      caps: { start: "round", end: "point" },
      section: { ngon: 7 },
    });
    for (const t of [0.26, 0.51, 0.73]) {
      const p = hs.at(t);
      b.ring(p, { count: 7, radius: 0.012, tilt: -8 }, (r) =>
        b.spike(r, r, 0.018, 0.006, { color: hornDark, bone: head }),
      );
    }
  }

  // Tall bat ears, with inner dark planes and chipped notch wedges.
  const earOutline: [number, number, "sharp"][] = [
    [-0.115, 0],
    [-0.105, 0.20],
    [-0.045, 0.43, "sharp"],
    [0.035, 0.28],
    [0.105, 0.39, "sharp"],
    [0.09, 0],
  ];
  const innerOutline: [number, number, "sharp"][] = [
    [-0.065, 0.035],
    [-0.055, 0.19],
    [-0.035, 0.31, "sharp"],
    [0.025, 0.22],
    [0.065, 0.29, "sharp"],
    [0.058, 0.035],
  ];
  for (const s of [-1, 1]) {
    const outer = b.extrude(earOutline, {
      at: [s * 0.19, 1.53, 0.39],
      x: [s, 0, 0],
      y: [0, 0.72, -0.08],
      thickness: 0.035,
      bevel: 0.008,
      color: stone,
      bone: s > 0 ? earL : earR,
      name: `earOuter${s > 0 ? "L" : "R"}`,
    });
    b.extrude(innerOutline, {
      at: [s * 0.192, 1.535, 0.395],
      x: [s, 0, 0],
      y: [0, 0.72, -0.08],
      thickness: 0.012,
      color: deep,
      bone: s > 0 ? earL : earR,
      name: `earInner${s > 0 ? "L" : "R"}`,
    });
    box([s * 0.20, 1.735, 0.34], [0.045, 0.035, 0.08], stone, s > 0 ? earL : earR);
    box([s * 0.20, 1.77, 0.27], [0.035, 0.028, 0.07], dark, s > 0 ? earL : earR);
    void outer;
  }

  // Three carved cheek frills on either side of the jaw and a chin barb.
  for (const s of [-1, 1]) {
    spike([s * 0.17, 1.39, 0.66], [s * 0.27, 1.36, 0.67], 0.025, light, head);
    spike([s * 0.18, 1.31, 0.72], [s * 0.29, 1.27, 0.74], 0.022, light, head);
    spike([s * 0.16, 1.24, 0.77], [s * 0.26, 1.18, 0.79], 0.019, light, jaw);
  }
  spike([0, 1.13, 0.88], [0, 1.04, 0.94], 0.032, horn, jaw);

  // Hairline cracks in the forehead and temples.
  rod([-0.05, 1.68, 0.48], [-0.11, 1.59, 0.57], 0.006, dark, head);
  rod([-0.11, 1.59, 0.57], [-0.08, 1.54, 0.67], 0.005, dark, head);
  rod([0.09, 1.66, 0.48], [0.16, 1.58, 0.55], 0.006, dark, head);
  rod([0.16, 1.58, 0.55], [0.13, 1.53, 0.63], 0.005, dark, head);

  // Moss lodged in the nape and beside the ear roots.
  for (const s of [-1, 1]) {
    sphere([s * 0.17, 1.57, 0.28], [0.045, 0.018, 0.035], moss, head, 6, 4);
    spike([s * 0.18, 1.59, 0.27], [s * 0.20, 1.64, 0.25], 0.009, moss, head);
  }
}
```