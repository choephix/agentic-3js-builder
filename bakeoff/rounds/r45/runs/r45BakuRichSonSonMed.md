<!-- call: plan -->

```json
{
  "name": "Baku, the Dream-Eating Tapir Spirit",
  "description": "A Malayan-tapir-bodied baku with an elephant trunk, a fierce gold-eyed face, a tiger-pawed stance and an ox tail, drawn as an ukiyo-e woodblock print: indigo and cream saddle, seigaiha waves, vermilion and gold flame mane, and a dream-cloud wisp drifting into its trunk.",
  "builderName": "bakuDreamEater",
  "size": [1.2, 1.8, 3.4],
  "layout": "Side-on quadruped facing +Z, centred on x=0. Body: a heavy barrel torso (belly at y~0.62, back at y~1.4) from the haunches at z=-1.1 to the chest at z=0.95. Tapir colouring as a woodblock print: indigo head, neck, shoulders, forelegs, hindquarters, hindlegs and tail; a creamy saddle band over back, flanks and belly from z=+0.35 back to z=-0.5. The saddle edge is a scalloped line. A sumi-black outline stroke runs along the spine and the saddle edge. The saddle carries seigaiha (overlapping concentric wave arcs) in pale blue and indigo as small flat parts seated on the surface. The neck rises from z=0.8 into a long wedge head with a domed forehead. Tiny fierce rhino-style eyes have gold irises, sumi pupils and vermilion brows. Vermilion kabuki-style cheek lines and a tomoe mark sit on the forehead. Round ears have cream rims and tips. Short ivory tusks flank the trunk root. The trunk droops forward and down to a tip at y~0.9, z~1.8, with cream wrinkle rings and pink nostrils. A dream-cloud wisp (sumi-outlined lilac and grey-blue scrolls, a small glowing moon, tiny stars) curls into the trunk tip. Four sturdy legs end in tiger paws with ivory claws, vermilion cuff bands and cream fur tufts; the paws rest on y=0. A crest of overlapping flame-shaped blades runs from the nape along the back to the rump, shaded vermilion, then gold, then cream at the tips, with sumi edges. Kumo (cloud scroll) roundels in vermilion and gold sit on shoulders and haunches. The ox tail curls up in an S and ends in a flame tuft in the same palette. Style on every part: flat colours only, bold sumi outlines as thin dark sweeps and rims, hard colour bands (bokashi done as 2-3 stepped tones), no smooth gradients, chunky simplified shapes. Facets stay low-poly. Left is +X.",
  "palette": {
    "indigo": "#1f3068",
    "deepIndigo": "#121a42",
    "indigoLight": "#3a4f93",
    "cream": "#efe2bd",
    "paper": "#f7f0dc",
    "sumi": "#1a1614",
    "vermilion": "#d8432b",
    "vermilionDark": "#a02c1e",
    "gold": "#dba43a",
    "ochre": "#c98f3f",
    "waveBlue": "#79a3c9",
    "seaGreen": "#4f8f7a",
    "beniPink": "#e79a8f",
    "ivory": "#f3ead0",
    "dreamLilac": "#a687cf",
    "cloudGrey": "#9fb2c6",
    "moonGlow": "#f6dc78",
    "starWhite": "#fffbe8"
  },
  "mounts": {
    "pelvis": [0, 1.0, -0.65],
    "chestCenter": [0, 1.06, 0.4],
    "neckBase": [0, 1.15, 0.8],
    "headBase": [0, 1.35, 1.2],
    "jawHinge": [0, 1.25, 1.38],
    "trunkRoot": [0, 1.28, 1.5],
    "trunkTip": [0, 0.9, 1.8],
    "earRootL": [0.2, 1.55, 1.1],
    "earRootR": [-0.2, 1.55, 1.1],
    "napeCrest": [0, 1.5, 0.9],
    "backCrestEnd": [0, 1.4, -0.85],
    "tailRoot": [0, 1.2, -1.12],
    "tailTip": [0, 1.55, -1.45],
    "shoulderL": [0.36, 0.95, 0.6],
    "shoulderR": [-0.36, 0.95, 0.6],
    "hipL": [0.38, 0.95, -0.7],
    "hipR": [-0.38, 0.95, -0.7],
    "pawFrontL": [0.36, 0.07, 0.66],
    "pawFrontR": [-0.36, 0.07, 0.66],
    "pawHindL": [0.38, 0.07, -0.72],
    "pawHindR": [-0.38, 0.07, -0.72],
    "saddleFront": [0, 1.0, 0.35],
    "saddleRear": [0, 1.0, -0.5],
    "dreamMouth": [0, 0.9, 1.8]
  },
  "joints": [
    { "name": "pelvis", "at": [0, 1.0, -0.65], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine1", "parent": "pelvis", "at": [0, 1.02, -0.1], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "spine1", "at": [0, 1.06, 0.4], "dir": [0, 0.2, 1], "role": "spine" },
    { "name": "neck1", "parent": "chest", "at": [0, 1.15, 0.8], "dir": [0, 0.3, 1], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.27, 1.0], "dir": [0, 0.2, 1], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.35, 1.2], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.25, 1.38], "dir": [0, -0.1, 1], "role": "jaw" },
    { "name": "earL", "parent": "head", "at": [0.2, 1.55, 1.1], "dir": [0.5, 1, -0.2], "role": "hinge" },
    { "name": "earR", "parent": "head", "at": [-0.2, 1.55, 1.1], "dir": [-0.5, 1, -0.2], "role": "hinge" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.28, 1.5], "dir": [0, -0.25, 1], "role": "tentacle" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.18, 1.68], "dir": [0, -0.7, 1], "role": "tentacle" },
    { "name": "trunk3", "parent": "trunk2", "at": [0, 1.02, 1.77], "dir": [0, -1, 0.3], "role": "tentacle" },
    { "name": "tail1", "parent": "pelvis", "at": [0, 1.2, -1.12], "dir": [0, 0.2, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.26, -1.3], "dir": [0, 0.6, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.42, -1.42], "dir": [0, 1, -0.2], "role": "tail" },
    { "name": "shoulderFL", "parent": "chest", "at": [0.36, 0.95, 0.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "elbowFL", "parent": "shoulderFL", "at": [0.36, 0.6, 0.62], "dir": [0, -1, 0], "role": "leg" },
    { "name": "wristFL", "parent": "elbowFL", "at": [0.36, 0.3, 0.6], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "pawFL", "parent": "wristFL", "at": [0.36, 0.1, 0.64], "dir": [0, -0.3, 1], "role": "leg" },
    { "name": "shoulderFR", "parent": "chest", "at": [-0.36, 0.95, 0.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "elbowFR", "parent": "shoulderFR", "at": [-0.36, 0.6, 0.62], "dir": [0, -1, 0], "role": "leg" },
    { "name": "wristFR", "parent": "elbowFR", "at": [-0.36, 0.3, 0.6], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "pawFR", "parent": "wristFR", "at": [-0.36, 0.1, 0.64], "dir": [0, -0.3, 1], "role": "leg" },
    { "name": "hipHL", "parent": "pelvis", "at": [0.38, 0.95, -0.7], "dir": [0, -1, 0.2], "role": "leg" },
    { "name": "kneeHL", "parent": "hipHL", "at": [0.38, 0.6, -0.58], "dir": [0, -1, -0.3], "role": "leg" },
    { "name": "hockHL", "parent": "kneeHL", "at": [0.38, 0.3, -0.78], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "pawHL", "parent": "hockHL", "at": [0.38, 0.1, -0.74], "dir": [0, -0.3, 1], "role": "leg" },
    { "name": "hipHR", "parent": "pelvis", "at": [-0.38, 0.95, -0.7], "dir": [0, -1, 0.2], "role": "leg" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-0.38, 0.6, -0.58], "dir": [0, -1, -0.3], "role": "leg" },
    { "name": "hockHR", "parent": "kneeHR", "at": [-0.38, 0.3, -0.78], "dir": [0, -1, 0.1], "role": "leg" },
    { "name": "pawHR", "parent": "hockHR", "at": [-0.38, 0.1, -0.74], "dir": [0, -0.3, 1], "role": "leg" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "The torso, one smooth loft on the pelvis/spine1/chest bones, from the rump at z=-1.1 to the chest at z=0.95. Half-width ~0.45, belly at y~0.62, back at y~1.4, with a high rounded rump and a deep chest. Tapir colouring through bands and sectors: indigo at the chest and shoulders (z>0.35) and the hindquarters (z<-0.5), cream saddle between over back, flanks and belly. The saddle edges are scalloped by rows of small indigo and cream wedge or disc parts seated on the surface (a woodblock zig-zag), not smooth lines. Seigaiha wave motif on the saddle flanks: rows of stacked small flat discs (cream, waveBlue, indigo, cream, shrinking) overlapped in a scale pattern, about 3 rows by 6 on each flank, plus a few on the back. A thin sumi stroke (thin sweep along the surface) edges the saddle front and rear and runs down the spine. Belly shadow band in indigoLight under the cream. A vermilion sash or belly cord with a gold knot and two ivory tassel strands hangs on the left flank of the saddle (a Shinto-spirit rope), a small gold bell at the knot. Rump: two sumi swirl lines on each haunch, hip bone bumps in indigoLight. Everything is flat-coloured with sumi outlines on the main silhouette edges.",
      "box": [[-0.5, 0.6, -1.15], [0.5, 1.45, 0.95]],
      "attaches": "Neck tube starts at neckBase on the chest's front top. Legs hang from shoulderL/R and hipL/R (the leg tops sit inside the torso). The crest and tail start on the back at napeCrest..backCrestEnd and tailRoot at the rump.",
      "joints": ["pelvis", "spine1", "chest"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "head",
      "builds": "Neck and head. A thick indigo neck sweep on neck1/neck2 from neckBase to headBase (radius ~0.2 tapering to 0.17), with a cream chest-bib scallop line and a sumi outline. Skull: a long wedge head, domed forehead, tapering muzzle toward trunkRoot (z up to 1.52), half-width ~0.18, indigo with an indigoLight highlight on the brow. Separate lower jaw on the jaw joint (indigo, cream chin), with an open-able mouth line in sumi, a beniPink tongue and small ivory teeth seated at the lip line. Rhino-style small, fierce eyes at about (±0.16, 1.42, 1.3): sumi almond outline, gold iris disc, black slit pupil, white glint dot; vermilion angled brow bars above each eye with a sumi underline. Kabuki-style kumadori cheek lines in vermilion (three sweeping lines per cheek), a vermilion tomoe (comma-swirl, built from two small spiral sweeps and a disc) on the forehead with a gold ring. Two short curved ivory tusks at the trunk root (±0.09, 1.2, 1.5) pointing down and forward. Round ears on earL/earR: indigo discs, cream rims, beniPink inner discs, cream tips, with a sumi outline ring, tilted outward and back. Long whisker strands (thin sumi sweeps) at the muzzle sides, and a few sumi hair strokes on the cheeks and forehead. Everything is flat-coloured, with bold outlines, no gradients.",
      "box": [[-0.4, 1.0, 0.8], [0.4, 1.75, 1.55]],
      "attaches": "The neck starts at neckBase on the body chest. The trunk part begins at trunkRoot (z~1.5) at the muzzle front, so leave the front face of the muzzle open there. The mane crest starts at napeCrest behind the skull.",
      "joints": ["neck1", "neck2", "head", "jaw", "earL", "earR"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "trunkDream",
      "builds": "The elephant-like trunk and the dream it eats. The trunk is a tapering smooth sweep on trunk1..trunk3 from trunkRoot (radius ~0.11) drooping forward and down to trunkTip (radius ~0.065), indigo on top and cream-grey underneath (sectors), with 7-8 thin cream wrinkle rings (ring or along parts), a sumi outline stroke along the top, and a vermilion lip ridge on the upper trunk near the root. The tip is slightly flared, with two sumi nostril holes ringed in beniPink and a small finger-like lip. The dream: a wisp rolling in from the front side of the tip and drawn into the nostrils, built as 3-4 layered kumo cloud scrolls (spiral sweeps and stacked disc clusters), cloudGrey and dreamLilac with paper highlights and sumi outlines, each cloud a flat-coloured bundle of round puffs; a small glowing moonGlow moon (sphere with a sumi crescent shadow disc) and 4-6 tiny starWhite glowing stars (use the glow kit) sit inside the cloud. A thin dream-thread ribbon (a sweep in dreamLilac) spirals from the cloud into the nostril. The wisp stays beside and in front of the trunk tip and never covers the face.",
      "box": [[-0.2, 0.82, 1.45], [0.3, 1.4, 1.9]],
      "attaches": "Root meets the muzzle at trunkRoot. The dream ribbon ends at trunkTip / dreamMouth.",
      "joints": ["trunk1", "trunk2", "trunk3"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "legs",
      "builds": "Four legs, each a smooth sweep on its own leg chain (front: shoulderFL/FR to elbow, wrist, paw; hind: hipHL/HR to knee, hock, paw). They start with a muscular thigh or upper-arm mass inside the torso (radius ~0.16 at the top, ~0.09 at the wrist), the hind legs with a slight backward hock bend. All indigo, with an indigoLight highlight sector down the front and a sumi outline stroke on the rear edge. Tiger paws: wide round indigo paw pads with 4 toe bumps each, ivory claws (small cones) pointing forward and slightly down, a thick cream fur cuff above each paw made of 5-6 small overlapping wedge tufts, plus a vermilion cuff band with a gold bead trim above it. A little wave motif (3 pale-blue arcs) on the outer side of each upper leg. Sumi paw pad lines. The paws rest flat on y=0 (lowest points at y≈0, sinking at most 0.02), with a front/hind pair at the same stance. Elbow and knee joints are marked by small indigoLight cap discs with a sumi ring. Everything stays chunky and simple, with flat colours.",
      "box": [[-0.55, 0.0, -0.95], [0.55, 1.05, 0.85]],
      "attaches": "The leg tops sit inside the body torso at shoulderL/R and hipL/R. The legs ride the chest and pelvis chains.",
      "joints": ["shoulderFL", "elbowFL", "wristFL", "pawFL", "shoulderFR", "elbowFR", "wristFR", "pawFR", "hipHL", "kneeHL", "hockHL", "pawHL", "hipHR", "kneeHR", "hockHR", "pawHR"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "maneTail",
      "builds": "The flame mane and the ox tail. Mane: a crest of broad, overlapping flame/wave-crest blades (extrudes, 2-3 rows) running from napeCrest over the neck and withers and along the spine to backCrestEnd, tallest (up to y~1.8) at the withers, shrinking toward the rump. The blades curl forward and up like Hokusai wave crests, ending in small curl hooks (spiral sweeps). The root-to-tip palette is stepped as hard bands, vermilionDark root, then vermilion, then gold, then cream tip, with a thin sumi outline plate under each blade and a base ridge of dark indigo. Shoulder and haunch kumo roundels: on each shoulder (±0.46, 1.1, 0.55) and each haunch (±0.46, 1.05, -0.72), a flat spiral cloud scroll (spiral sweeps with a gold disc centre and a vermilion ring, sumi outline) seated on the side of the body surface. Ox tail: a tapering indigo sweep on tail1..tail3 from tailRoot in an S that curls up to tailTip, with a sumi outline stroke, ending in a tuft of 7-9 flame blades fanned out (vermilion, gold, cream bands as in the mane) with 2-3 small curls. A few detached flame wisps (small flames) are rooted on the mane and tail only; nothing floats away from the body.",
      "box": [[-0.55, 1.0, -1.5], [0.55, 1.8, 1.0]],
      "attaches": "The crest roots on the body's back line between napeCrest and backCrestEnd, behind the head box. Roundels sit on the body flanks at the shoulderL/R and hipL/R heights. The tail roots at tailRoot on the rump.",
      "joints": ["chest", "spine1", "pelvis", "neck1", "neck2", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const IND = P.indigo, LIGHT = P.indigoLight, SUMI = P.sumi, CREAM = P.cream, VER = P.vermilion;
  const GOLD = P.gold, IVORY = P.ivory, BLUE = P.waveBlue;

  const legs = [
    { side: 1, front: true, names: ["shoulderFL", "elbowFL", "wristFL", "pawFL"] },
    { side: -1, front: true, names: ["shoulderFR", "elbowFR", "wristFR", "pawFR"] },
    { side: 1, front: false, names: ["hipHL", "kneeHL", "hockHL", "pawHL"] },
    { side: -1, front: false, names: ["hipHR", "kneeHR", "hockHR", "pawHR"] },
  ];

  for (const L of legs) {
    const s = L.side;
    const [j0, j1, j2, j3] = L.names.map((n) => J[n]);
    const x = s * (L.front ? 0.36 : 0.38);
    const zf = L.front ? 0.62 : -0.7;
    const kz = L.front ? 0.62 : -0.58;
    const hz = L.front ? 0.6 : -0.78;

    // main leg tube: bones from joints
    const pts: [number, number, number][] = [
      [x, 0.98, zf],
      [x, 0.6, kz],
      [x, 0.3, hz],
      [x, 0.1, zf + (L.front ? 0.02 : -0.04)],
    ];
    const bones = [j0, j1, j2, j3];
    for (let i = 0; i < 3; i++) {
      const r0 = [0.17, 0.12, 0.095][i];
      const r1 = [0.12, 0.095, 0.085][i];
      b.rod(pts[i], pts[i + 1], [r0, r1], IND, { bone: bones[i], skin: "rigid", sides: 8 });
    }
    // highlight stripe down the front, sumi stroke on the rear edge
    const fz = L.front ? 1 : 1;
    for (let i = 0; i < 3; i++) {
      const rr = [0.15, 0.11, 0.09][i];
      const a = pts[i], c = pts[i + 1];
      b.rod([a[0], a[1] - 0.02, a[2] + rr * 0.8 * fz], [c[0], c[1] + 0.02, c[2] + rr * 0.75 * fz], 0.014, LIGHT, { bone: bones[i] });
      b.rod([a[0], a[1] - 0.02, a[2] - rr * 0.95], [c[0], c[1] + 0.02, c[2] - rr * 0.85], 0.009, SUMI, { bone: bones[i] });
    }
    // joint caps at elbow/knee and hock
    for (let k = 1; k <= 2; k++) {
      const p = pts[k];
      const ox = s * (k === 1 ? 0.115 : 0.09);
      b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), SUMI, { bone: bones[k], at: [p[0] + ox, p[1], p[2]], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 10), LIGHT, { bone: bones[k], at: [p[0] + ox + s * 0.006, p[1], p[2]], dir: [s, 0, 0] });
    }
    // wave motif: 3 arcs outer side of upper leg
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.TorusGeometry(0.03 + i * 0.022, 0.006, 4, 10, Math.PI), BLUE, {
        bone: j0,
        at: [x + s * (0.158 - i * 0.004), 0.8 - i * 0.0, zf - 0.02],
        rotation: [0, s * 90, 0],
      });
    }
    // gold beads + vermilion cuff + cream tufts
    const cy = 0.2;
    const cr = 0.092;
    b.part(new THREE.CylinderGeometry(cr + 0.012, cr + 0.012, 0.045, 10), VER, { bone: j2, at: [x, cy + 0.07, hz + (L.front ? 0.03 : -0.015)] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, {
        bone: j2,
        at: [x + Math.sin(a) * (cr + 0.014), cy + 0.105, hz + (L.front ? 0.03 : -0.015) + Math.cos(a) * (cr + 0.014)],
      });
    }
    const pz = zf + (L.front ? 0.04 : -0.02);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      b.part(new THREE.ConeGeometry(0.036, 0.1, 5), CREAM, {
        bone: j2,
        at: [x + Math.sin(a) * 0.1, 0.15, pz + Math.cos(a) * 0.1],
        dir: [Math.sin(a) * 0.5, -1, Math.cos(a) * 0.5],
      });
    }
    // paw
    const pawZ = zf + 0.06;
    b.part(new THREE.SphereGeometry(1, 10, 6), IND, { bone: j3, at: [x, 0.055, pawZ], scale: [0.115, 0.058, 0.15] });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.012, 10), SUMI, { bone: j3, at: [x, 0.005, pawZ], scale: [1, 1, 1.3] });
    // toes + claws
    for (let t = 0; t < 4; t++) {
      const tx = x + (t - 1.5) * 0.058;
      const tz = pawZ + 0.125 - Math.abs(t - 1.5) * 0.02;
      b.part(new THREE.SphereGeometry(0.036, 7, 5), IND, { bone: j3, at: [tx, 0.04, tz] });
      b.part(new THREE.ConeGeometry(0.014, 0.065, 5), IVORY, { bone: j3, at: [tx, 0.025, tz + 0.05], dir: [0, -0.3, 1] });
      b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4), SUMI, { bone: j3, at: [tx + 0.029, 0.075, tz - 0.03], dir: [0, 0.3, 1] });
    }
    // heel pad line
    b.part(new THREE.SphereGeometry(0.03, 6, 4), LIGHT, { bone: j3, at: [x, 0.09, pawZ - 0.03], scale: [1.6, 0.5, 1] });
  }
}
```

<!-- call: trunkDream -->

```ts
import * as THREE from "three";
import { catmull, spiral, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTrunkDream({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const GREYCREAM = "#cdd0c0";
  const bones = [J.trunk1, J.trunk2, J.trunk3];
  const rad = (t: number) => 0.11 - 0.045 * t + 0.015 * Math.pow(Math.max(0, (t - 0.8) / 0.2), 2);
  const boneAt = (t: number) => (t < 0.33 ? J.trunk1 : t < 0.66 ? J.trunk2 : J.trunk3);

  // ---- trunk ----
  const path = catmull([
    [0, 1.28, 1.5],
    [0, 1.18, 1.68],
    [0, 1.02, 1.77],
    [0, 0.92, 1.8],
  ]);
  const trunk = b.sweep(path, rad, {
    bone: bones,
    color: P.indigo,
    sides: 10,
    caps: "flat",
    sectors: [
      [-70, 70, P.indigo],
      [120, 240, GREYCREAM],
    ],
  });
  // sumi outline along top
  b.sweep(trunk.line(0, 0.004), 0.006, { bone: bones, color: P.sumi, sides: 5, caps: "none" });
  // vermilion lip ridge near root
  b.sweep(trunk.line(0, 0.012).slice(0.04, 0.3), [0.014, 0.01], {
    bone: bones,
    color: P.vermilion,
    sides: 6,
    caps: "round",
  });
  // wrinkle rings
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.105;
    const p = path.at(t);
    const tan = path.tangentAt(t);
    b.part(new THREE.TorusGeometry(rad(t) + 0.003, 0.0075, 4, 12), i % 2 ? P.cream : GREYCREAM, {
      bone: boneAt(t),
      at: p,
      dir: tan,
      axis: "z",
    });
  }

  // ---- tip ----
  const tip = path.at(1);
  const tt = path.tangentAt(1);
  const tipDir = [tt.x, tt.y, tt.z];
  b.part(new THREE.CylinderGeometry(0.082, 0.07, 0.05, 10), P.indigo, {
    bone: J.trunk3,
    at: tip,
    dir: tipDir,
  });
  const endC = tip.clone().addScaledVector(tt, 0.026);
  b.part(new THREE.CylinderGeometry(0.086, 0.086, 0.01, 10), P.cream, { bone: J.trunk3, at: tip.clone().addScaledVector(tt, 0.012), dir: tipDir });
  // finger lip
  b.part(new THREE.CapsuleGeometry(0.02, 0.05, 3, 6), P.indigoLight, {
    bone: J.trunk3,
    at: tip.clone().add(new THREE.Vector3(0, -0.01, 0.065)),
    dir: [0, 0.3, 1],
  });
  // nostrils
  const nostrils: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const c = endC.clone().add(new THREE.Vector3(s * 0.03, 0, 0)).addScaledVector(tt, 0.004);
    nostrils.push(c);
    b.part(new THREE.TorusGeometry(0.019, 0.006, 4, 10), P.beniPink, { bone: J.trunk3, at: c, dir: tipDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.016, 8), P.sumi, {
      bone: J.trunk3,
      at: c.clone().addScaledVector(tt, 0.002),
      dir: tipDir,
      axis: "z",
    });
  }

  // ---- dream cloud ----
  const B = J.trunk3;
  const puff = (x: number, y: number, z: number, r: number, color: string) => {
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { bone: B, at: [x, y, z] });
    b.part(new THREE.TorusGeometry(r * 1.01, 0.0035, 3, 10), P.sumi, { bone: B, at: [x, y, z], dir: [1, 0, 0], axis: "z" });
  };
  const cluster = (cx: number, cy: number, cz: number, s: number, main: string, hi: string) => {
    puff(cx, cy, cz, 0.05 * s, main);
    puff(cx, cy + 0.035 * s, cz + 0.045 * s, 0.04 * s, main);
    puff(cx, cy - 0.005 * s, cz - 0.05 * s, 0.04 * s, main);
    puff(cx, cy + 0.04 * s, cz - 0.03 * s, 0.032 * s, hi);
    // paper highlight dab
    b.part(new THREE.SphereGeometry(0.012 * s, 5, 4), P.paper, { bone: B, at: [cx + 0.04 * s, cy + 0.03 * s, cz + 0.02 * s] });
  };
  cluster(0.2, 1.1, 1.72, 1.1, P.cloudGrey, P.paper);
  cluster(0.22, 1.28, 1.6, 0.85, P.dreamLilac, P.cloudGrey);
  cluster(0.17, 0.95, 1.82, 0.7, P.dreamLilac, P.paper);
  cluster(0.12, 1.2, 1.84, 0.55, P.cloudGrey, P.paper);

  // scroll curls
  const curls: [number[], number[], number][] = [
    [[0.26, 1.05, 1.8], [0.26, 1.1, 1.86], 1],
    [[0.26, 1.24, 1.72], [0.26, 1.29, 1.77], -1],
    [[0.24, 0.93, 1.7], [0.24, 0.88, 1.74], 1],
  ];
  for (const [c, f, k] of curls) {
    const sp = spiral(c, f, [k, 0, 0], { turns: 1.2, r1: 0.008 });
    b.sweep(sp, 0.007, { bone: B, color: P.sumi, sides: 5, caps: "round" });
  }

  // moon
  glow(b.part(new THREE.SphereGeometry(0.036, 8, 6), P.moonGlow, { bone: B, at: [0.27, 1.2, 1.72] }), 1.6);
  b.part(new THREE.SphereGeometry(0.031, 8, 6), P.dreamLilac, { bone: B, at: [0.282, 1.212, 1.72] });
  // stars
  const stars: number[][] = [
    [0.28, 1.34, 1.66],
    [0.12, 1.33, 1.8],
    [0.29, 1.12, 1.84],
    [0.08, 1.05, 1.86],
    [0.26, 0.99, 1.62],
    [0.19, 1.4, 1.8],
  ];
  for (const s of stars) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.005, 0), P.starWhite, { bone: B, at: s }),
      2,
    );
  }

  // dream thread ribbon into the nostril
  const target = nostrils[0].clone().add(new THREE.Vector3(0, -0.02, 0.01));
  const ribbon = catmull([
    [0.18, 1.0, 1.76],
    [0.13, 0.95, 1.88],
    [0.07, 0.86, 1.88],
    [0.04, 0.8, 1.84],
    [target.x, target.y, target.z],
  ]);
  b.sweep(ribbon, [0.009, 0.004], { bone: B, color: P.dreamLilac, sides: 5, caps: "round" });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { bezier, catmull } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const INDIGO = P.indigo, LIGHT = P.indigoLight, CREAM = P.cream, SUMI = P.sumi;
  const VERM = P.vermilion, GOLD = P.gold, PINK = P.beniPink, IVORY = P.ivory;
  const head = J.head, jaw = J.jaw;

  // ---- neck ----
  const neckPath = catmull([M.neckBase, [0, 1.27, 1.0], M.headBase]);
  const neck = b.sweep(neckPath, [0.2, 0.17], { bone: [J.neck1, J.neck2, head], color: INDIGO });
  b.sweep(neck.line(0, 0.004), 0.009, { bone: [J.neck1, J.neck2, head], color: SUMI });
  b.sweep(neck.line(180, 0.004), 0.016, { bone: [J.neck1, J.neck2, head], color: CREAM });
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.12;
    for (const a of [140, 220]) {
      const f = neck.at(t, a + (i % 2) * 8);
      b.stick(new THREE.ConeGeometry(0.03, 0.06, 5), CREAM, f, { embed: 0.3 });
    }
  }

  // ---- skull ----
  const skull = b.loft(
    [
      { at: [0, 1.36, 1.0], w: 0.34, h: 0.36 },
      { at: [0, 1.4, 1.2], w: 0.36, h: 0.4 },
      { at: [0, 1.37, 1.38], w: 0.3, h: 0.3 },
      { at: [0, 1.33, 1.52], w: 0.22, h: 0.2 },
    ],
    { bone: head, color: INDIGO, sides: 8 },
  );
  const sk = b.surface(skull);
  const topHit = sk.ray([0, 2, 1.25], [0, -1, 0]);
  if (topHit) {
    b.stick(new THREE.SphereGeometry(0.08, 8, 5), LIGHT, topHit, { embed: 0.6, scale: [1.3, 0.35, 1.5] });
    // tomoe
    const c = topHit.moved([0, 0.004, 0.0]);
    b.stick(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 12), GOLD, topHit, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 12), SUMI, topHit, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 12), VERM, topHit, { embed: 0.3 });
    const p = (x: number, z: number) => [x, topHit.at.y + 0.06, topHit.at.z + z];
    for (const k of [0, 1]) {
      const sg = k ? -1 : 1;
      const path = sk.drape(catmull([p(sg * 0.03, 0), p(sg * 0.012, 0.03), p(-sg * 0.015, 0.015), p(-sg * 0.01, -0.012)]), { lift: 0.012 });
      b.sweep(path, [0.01, 0.003], { bone: head, color: k ? GOLD : P.paper });
    }
    void c;
  }

  // ---- jaw ----
  b.frustumBox([0, 1.2, 1.3], [0, 1.19, 1.5], [0.25, 0.07], [0.15, 0.06], { bone: jaw, color: INDIGO });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.1), CREAM, { bone: jaw, at: [0, 1.185, 1.47] });
  b.part(new THREE.BoxGeometry(0.15, 0.012, 0.16), PINK, { bone: jaw, at: [0, 1.236, 1.4] });
  for (const s of [1, -1]) {
    b.rod([s * 0.115, 1.236, 1.3], [s * 0.07, 1.236, 1.5], 0.005, SUMI, { bone: jaw });
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.12 - i * 0.015), 1.234, 1.33 + i * 0.05], [0, 1, 0], 0.035, 0.009, { bone: jaw, color: IVORY });
  }

  // ---- eyes ----
  const disc = (at: number[], n: number[], r: number, h: number, color: string, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 10), color, { bone: head, at, dir: n, scale: sc });
  for (const s of [1, -1]) {
    const n = new THREE.Vector3(s, 0.15, 0.25).normalize();
    const base = new THREE.Vector3(s * 0.168, 1.42, 1.3);
    const at = (k: number) => base.clone().addScaledVector(n, k).toArray();
    disc(at(0), n.toArray(), 0.047, 0.012, SUMI, [1.3, 1, 0.8]);
    disc(at(0.006), n.toArray(), 0.037, 0.012, GOLD, [1.25, 1, 0.8]);
    disc(at(0.012), n.toArray(), 0.03, 0.01, SUMI, [0.3, 1, 0.9]);
    disc(at(0.018), n.toArray(), 0.008, 0.006, "#ffffff");
    // brows
    b.rod([s * 0.12, 1.5, 1.38], [s * 0.2, 1.465, 1.2], 0.016, VERM, { bone: head });
    b.rod([s * 0.125, 1.485, 1.375], [s * 0.2, 1.45, 1.2], 0.006, SUMI, { bone: head });
    // cheek kumadori
    for (let k = 0; k < 3; k++) {
      const y0 = 1.36 - k * 0.04;
      const path = sk.drape(
        catmull([
          [s * 0.17, y0 + 0.01, 1.14],
          [s * 0.18, y0 - 0.02, 1.26],
          [s * 0.15, y0 - 0.05 - k * 0.01, 1.4],
        ]),
        { lift: 0.006 },
      );
      b.sweep(path, [0.011, 0.003], { bone: head, color: VERM, caps: { end: "point" } });
    }
    // tusks
    b.sweep(bezier([s * 0.09, 1.23, 1.5], [s * 0.11, 1.15, 1.56], [s * 0.1, 1.1, 1.66]), [0.026, 0.002], {
      bone: head, color: IVORY, caps: { end: "point" }, sides: 6,
    });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.sweep(
        catmull([[s * 0.12, 1.3 - k * 0.02, 1.47], [s * 0.25, 1.3 - k * 0.04, 1.6], [s * 0.4, 1.24 - k * 0.07, 1.62]]),
        [0.004, 0.0015], { bone: head, color: SUMI, sides: 4 },
      );
    // hair strokes
    for (let k = 0; k < 2; k++)
      b.rod([s * (0.08 + k * 0.05), 1.6 - k * 0.02, 1.1], [s * (0.1 + k * 0.05), 1.62 - k * 0.02, 1.0], 0.004, SUMI, { bone: head, sides: 4 });

    // ---- ears ----
    const ear = s > 0 ? J.earL : J.earR;
    const en = new THREE.Vector3(s * 0.8, 0.3, -0.35).normalize();
    const ec = new THREE.Vector3(s * 0.22, 1.64, 1.08);
    const ep = (k: number) => ec.clone().addScaledVector(en, k).toArray();
    const ed = (k: number, r: number, h: number, c: string) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 12), c, { bone: ear, at: ep(k), dir: en.toArray() });
    ed(0, 0.1, 0.03, SUMI);
    ed(0.006, 0.092, 0.03, CREAM);
    ed(0.012, 0.074, 0.03, INDIGO);
    ed(0.018, 0.046, 0.03, PINK);
    b.part(new THREE.SphereGeometry(0.03, 6, 4), CREAM, { bone: ear, at: ec.clone().add(new THREE.Vector3(s * 0.03, 0.09, 0)).toArray() });
  }

  // nostril dots on muzzle front edge (trunk joins here)
  b.part(new THREE.BoxGeometry(0.2, 0.016, 0.012), SUMI, { bone: head, at: [0, 1.4, 1.2 - 0.0], scale: [0.001, 0.001, 0.001] });
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildBody({ b, J, P }: Ctx) {
  const bones = [J.pelvis, J.spine1, J.chest];
  const SADDLE_REAR = -0.5;
  const SADDLE_FRONT = 0.35;

  // ---- torso loft: rump (start) to chest (end) ----
  const body = b.loft(
    [
      { at: [0, 1.1, -1.1], w: 0.42, h: 0.46 },
      { at: [0, 1.1, -0.85], w: 0.82, h: 0.72 },
      { at: [0, 1.04, -0.4], w: 0.88, h: 0.76 },
      { at: [0, 1.02, 0.1], w: 0.9, h: 0.8 },
      { at: [0, 1.04, 0.5], w: 0.9, h: 0.82 },
      { at: [0, 1.03, 0.8], w: 0.82, h: 0.76 },
      { at: [0, 1.0, 0.95], w: 0.6, h: 0.6 },
    ],
    {
      bone: bones,
      bands: [
        [0.29, P.indigo],
        [0.71, P.cream],
        [1, P.indigo],
      ],
      sectors: [[135, 225, P.indigoLight, 0.29, 0.71]],
    },
  );
  const skin = b.surface(body);

  // ---- helpers ----
  const flank = (s: number, y: number, z: number) => skin.ray([s * 2, y, z], [-s, 0, 0]);
  const topAt = (x: number, z: number) => skin.ray([x, 2.2, z], [0, -1, 0]);
  const disc = (r: number, h = 0.012, seg = 10) => new THREE.CylinderGeometry(r, r, h, seg);

  // ---- scalloped saddle edges: alternating wedge discs across the edge line ----
  const scallops = (z: number, count: number, front: boolean) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const hit = skin.ray([Math.sin(a) * 2, 1.02 + Math.cos(a) * 2, z], [-Math.sin(a), -Math.cos(a), 0]);
      if (!hit) continue;
      const odd = i % 2 === 0;
      // cream bites into indigo; indigo bites into cream
      const dz = (odd ? 1 : -1) * (front ? 1 : -1) * 0.035;
      const c = odd ? P.cream : P.indigo;
      const h = skin.ray(
        [Math.sin(a) * 2, 1.02 + Math.cos(a) * 2, z + dz],
        [-Math.sin(a), -Math.cos(a), 0],
      );
      if (h) b.stick(new THREE.CylinderGeometry(0.045, 0.045, 0.016, 6), c, h, { embed: 0.5 });
      void c;
    }
  };
  scallops(SADDLE_FRONT, 12, true);
  scallops(SADDLE_REAR, 12, false);

  // ---- sumi outlines: saddle edges and spine ----
  for (const z of [SADDLE_FRONT, SADDLE_REAR]) {
    b.sweep(skin.loop([0, 1.02, z], { dir: [0, 0, 1], lift: 0.004 }), 0.008, { color: P.sumi });
  }
  const spinePts: number[][] = [];
  for (let i = 0; i <= 10; i++) spinePts.push([0, 1.7, -1.05 + (i / 10) * 1.95]);
  b.sweep(skin.drape(catmull(spinePts), { lift: 0.004 }), 0.009, { color: P.sumi });

  // ---- seigaiha waves on both flanks ----
  const waveStack = (hit: any, k: number) => {
    const layers: [number, string][] = [
      [0.062, P.waveBlue],
      [0.046, P.indigo],
      [0.03, P.cream],
    ];
    layers.forEach(([r, c], i) => b.stick(disc(r * k), c, hit.moved([0, i * 0.004, 0]), { embed: 0.5 }));
  };
  const cols = [-0.4, -0.27, -0.14, 0.14, 0.27];
  const rows = [1.2, 1.05, 0.9];
  for (const s of [1, -1]) {
    rows.forEach((y, ri) => {
      cols.forEach((z) => {
        const hit = flank(s, y, z + (ri % 2) * 0.06);
        if (hit) waveStack(hit, 1);
      });
    });
  }
  for (const [x, z] of [
    [0.18, -0.25],
    [-0.18, 0.05],
  ]) {
    const h = topAt(x, z);
    if (h) waveStack(h, 1);
  }

  // ---- vermilion sash, gold knot, bell, ivory tassels ----
  b.sweep(skin.loop([0, 1.02, 0], { dir: [0, 0, 1], lift: 0.016 }), 0.022, { color: P.vermilion });
  const knot = flank(1, 0.82, 0);
  if (knot) {
    b.stick(new THREE.SphereGeometry(0.05, 8, 6), P.gold, knot, { embed: 0.2 });
    const k = knot.at;
    for (const dz of [-0.03, 0.03]) {
      b.rod([k.x + 0.04, k.y - 0.03, k.z + dz], [k.x + 0.06, k.y - 0.3, k.z + dz * 2], 0.011, P.ivory, {
        bone: J.spine1,
      });
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.ivory, {
        bone: J.spine1,
        at: [k.x + 0.06, k.y - 0.31, k.z + dz * 2],
      });
    }
    b.part(new THREE.SphereGeometry(0.032, 8, 6), P.gold, { bone: J.spine1, at: [k.x + 0.06, k.y - 0.08, k.z + 0.07] });
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.03), P.sumi, { bone: J.spine1, at: [k.x + 0.09, k.y - 0.09, k.z + 0.07] });
  }

  // ---- haunch swirls (sumi) and hip bone bumps ----
  for (const s of [1, -1]) {
    const centers: [number, number][] = [
      [-0.85, 1.15],
      [-0.72, 0.88],
    ];
    centers.forEach(([cz, cy], ci) => {
      const pts: number[][] = [];
      for (let i = 0; i < 9; i++) {
        const a = i * 0.8 + ci * 1.5;
        const r = 0.015 + i * 0.009;
        pts.push([s * 0.6, cy + Math.sin(a) * r, cz + Math.cos(a) * r]);
      }
      b.sweep(skin.drape(catmull(pts), { lift: 0.005 }), 0.007, { color: P.sumi });
    });
    const bump = flank(s, 1.3, -0.75);
    if (bump) b.stick(new THREE.SphereGeometry(0.075, 8, 6), P.indigoLight, bump, { embed: 0.55 });
  }
}
```

<!-- call: maneTail -->

```ts
import * as THREE from "three";
import { catmull, spiral, rng } from "agentic-3js-builder";

export function buildManeTail({ b, J, P }: Ctx) {
  const rand = rng(11);

  // ---- helpers ----
  type Band = [number, number, string];
  const boneAt = (z: number) => (z > 0.8 ? J.neck1 : z > 0.4 ? J.chest : z > -0.3 ? J.spine1 : J.pelvis);

  // Flame outline between heights v0..v1 (fractions of H). Centre line curls toward +u (forward).
  function flameOutline(W: number, H: number, C: number, v0: number, v1: number, pad = 0, n = 4) {
    const w = (v: number) => W * Math.pow(1 - v, 0.8) + pad;
    const c = (v: number) => C * v * v;
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const v = v0 + ((v1 - v0) * i) / n;
      const y = v * H - 0.03 - pad * 0.5;
      left.push([c(v) - w(v), y]);
      right.push([c(v) + w(v), y]);
    }
    return [...left, ...right.reverse()] as [number, number][];
  }

  // A flame blade: sumi plate under stepped colour bands. `u` is the forward/curl axis, `up` the blade axis.
  function flame(
    at: number[],
    bone: any,
    uDir: number[],
    upDir: number[],
    W: number,
    H: number,
    C: number,
    bands: Band[],
    thick = 0.03,
  ) {
    b.extrude(flameOutline(W, H * 1.03, C * 1.03, 0, 1, 0.011, 5), {
      at, x: uDir, y: upDir, thickness: thick * 0.8, color: P.sumi, bone,
    });
    for (const [v0, v1, col] of bands) {
      b.extrude(flameOutline(W, H, C, v0, v1, 0, 3), {
        at, x: uDir, y: upDir, thickness: thick, color: col, bone,
      });
    }
  }

  const FULL: Band[] = [
    [0, 0.3, P.vermilionDark],
    [0.3, 0.6, P.vermilion],
    [0.6, 0.82, P.gold],
    [0.82, 1, P.cream],
  ];
  const LITE: Band[] = [
    [0, 0.45, P.vermilion],
    [0.45, 0.78, P.gold],
    [0.78, 1, P.cream],
  ];

  // ---- mane crest ----
  const spine = catmull([
    [0, 1.48, 0.9],
    [0, 1.46, 0.55],
    [0, 1.43, 0.1],
    [0, 1.42, -0.4],
    [0, 1.38, -0.85],
  ]);
  const heightAt = (z: number) => 0.14 + 0.26 * Math.exp(-(((z - 0.5) / 0.7) ** 2));

  // base ridge in dark indigo
  b.sweep(spine, [0.045, 0.03], {
    color: P.deepIndigo,
    bone: [J.neck1, J.chest, J.spine1, J.pelvis],
    caps: "round",
    sides: 6,
  });

  const FWD = [0, 0, 1];
  const UP = [0, 1, 0];

  const NC = 10;
  for (let i = 0; i < NC; i++) {
    const t = 0.02 + (0.96 * i) / (NC - 1);
    const p = spine.at(t);
    const H = heightAt(p.z) * 0.92;
    const W = 0.075 + H * 0.12;
    const C = 0.12 + H * 0.2;
    flame([0, p.y, p.z], boneAt(p.z), FWD, UP, W, H, C, FULL);
    if (i % 2 === 0) {
      // Hokusai curl hook at the tip
      const tip = [0, p.y + H - 0.03, p.z + C];
      const ctr = [0, tip[1] - 0.04, tip[2] + 0.02];
      b.sweep(spiral(ctr, tip, [1, 0, 0], { turns: 0.75, r1: 0.014 }), [0.014, 0.006], {
        color: i % 4 === 0 ? P.gold : P.cream,
        bone: boneAt(p.z),
        sides: 5,
        caps: "point",
      });
    }
  }
  for (const s of [1, -1]) {
    const NS = 8;
    for (let i = 0; i < NS; i++) {
      const t = 0.07 + (0.88 * i) / (NS - 1);
      const p = spine.at(t);
      const H = heightAt(p.z) * 0.66;
      flame([s * 0.07, p.y - 0.035, p.z], boneAt(p.z), FWD, UP, 0.06 + H * 0.1, H, 0.1 + H * 0.2, LITE, 0.026);
    }
  }

  // ---- kumo roundels ----
  function roundel(s: number, y: number, z: number, bone: any) {
    const d = [s, 0, 0];
    const cyl = (r: number, x: number, th: number, col: string, seg = 14) =>
      b.part(new THREE.CylinderGeometry(r, r, th, seg), col, { bone, at: [s * x, y, z], dir: d });
    cyl(0.145, 0.452, 0.012, P.sumi);
    cyl(0.125, 0.458, 0.012, P.vermilion);
    cyl(0.1, 0.463, 0.012, P.cream);
    cyl(0.04, 0.472, 0.012, P.gold, 10);
    // spiral scroll
    const c = [s * 0.474, y, z];
    const from = [s * 0.474, y + 0.085, z];
    b.sweep(spiral(c, from, [s, 0, 0], { turns: 1.4, r1: 0.03 }), 0.008, {
      color: P.sumi, bone, sides: 5, caps: "round",
    });
    // cloud puffs on rim
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      b.part(new THREE.SphereGeometry(0.02, 6, 4), k % 2 ? P.gold : P.vermilionDark, {
        bone, at: [s * 0.47, y + Math.sin(a) * 0.115, z + Math.cos(a) * 0.115],
      });
    }
  }
  for (const s of [1, -1]) {
    roundel(s, 1.1, 0.55, J.chest);
    roundel(s, 1.05, -0.72, J.pelvis);
  }

  // ---- ox tail ----
  const tailPath = catmull([
    [0, 1.2, -1.1],
    [0, 1.19, -1.28],
    [0, 1.3, -1.4],
    [0, 1.45, -1.38],
    [0, 1.52, -1.44],
  ]);
  const tailBones = [J.tail1, J.tail2, J.tail3];
  const tube = b.sweep(tailPath, [0.07, 0.03], {
    color: P.indigo, bone: tailBones, sides: 8,
    sectors: [[-40, 40, P.indigoLight]],
  });
  b.sweep(tube.line(0), 0.007, { color: P.sumi, bone: tailBones, sides: 4 });
  // a vermilion cuff band
  b.along(tube, 3, (at) =>
    b.stick(new THREE.CylinderGeometry(0.0, 0.0, 0.0), P.sumi, at),
  );
  for (const t of [0.35, 0.65]) {
    const q = tube.at(t, 0);
    const c = tailPath.at(t);
    const tg = tailPath.tangentAt(t);
    b.part(new THREE.CylinderGeometry(0.052 - t * 0.03, 0.052 - t * 0.03, 0.02, 8), P.vermilion, {
      bone: t < 0.5 ? J.tail2 : J.tail3, at: [c.x, c.y, c.z], dir: [tg.x, tg.y, tg.z],
    });
  }

  // tail flame tuft (fan in the YZ plane)
  const root = [0, 1.54, -1.45];
  const NT = 7;
  for (let i = 0; i < NT; i++) {
    const a = ((-25 + (100 * i) / (NT - 1)) * Math.PI) / 180;
    const upD = [0, Math.cos(a), -Math.sin(a)];
    const uD = [0, Math.sin(a), Math.cos(a)];
    const big = i % 2 === 0 ? 0.3 : 0.23;
    flame(root, J.tail3, uD, upD, 0.045, big, 0.06, i % 2 ? LITE : FULL, 0.026);
    if (i === 1 || i === 4 || i === 6) {
      const tip = [0, root[1] + upD[1] * big + uD[1] * 0.06, root[2] + upD[2] * big + uD[2] * 0.06];
      b.sweep(spiral([tip[0], tip[1] - 0.03, tip[2] + 0.02], tip, [1, 0, 0], { turns: 0.7, r1: 0.01 }), [0.011, 0.005], {
        color: P.gold, bone: J.tail3, sides: 5, caps: "point",
      });
    }
  }
  // small rooted wisps at the tail root
  for (const s of [1, -1]) {
    flame([s * 0.04, 1.5, -1.43], J.tail3, [0, 0.4, 1], [s * 0.35, 0.9, 0], 0.025, 0.11, 0.02, LITE.slice(1), 0.02);
  }
}
```