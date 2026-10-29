<!-- call: plan -->

```json
{
  "name": "Baku, Dream-Eating Spirit",
  "description": "A tapir-bodied baku with a drooping trunk, ivory tusks, tiger paws, an ox tail and a flame mane. It is built as a stylized ukiyo-e woodblock print: flat indigo, vermilion, cream and ochre, inked contours, scalloped wave bands and layered colour blades.",
  "builderName": "bakuDreamEater",
  "size": [1.1, 1.85, 3.5],
  "layout": "The baku stands in a calm, symmetric rest pose, facing +Z, centred on x=0, with all four paws flat on y=0.\n\nSILHOUETTE. A pear-shaped tapir barrel is highest at the rump (back top y~1.43) and slightly lower at the withers (y~1.33). The belly is at y~0.55 and the barrel is about 0.85 m wide. Four sturdy legs ~0.55 m long carry it. A short thick neck rises forward and up to a big wedge-shaped head at y~1.4. The head has an elephant-like proboscis that starts at z~1.5 and hangs forward and then down, ending near z=1.85, y=0.85, with a tiny upward curl at the tip. Two short ivory tusks flank the trunk root. A crest of curling flame-blades runs from between the ears along the neck to the withers. The ox tail leaves the rump at z~-0.98 and sweeps back and up in an S, ending in a flame tuft at about z=-1.6.\n\nPROPORTIONS (push them). The head is large and characterful, with big round rhino/ox eyes. The paws are chunky tiger paws. The mane is bold and tall (to y~1.8). The ears are round.\n\nFRONT TO BACK. Trunk tip (z 1.85), then tusks, face and eyes (z 1.3-1.6), ears and forehead sun-disc (z 1.1-1.35), neck with rope collar (z 0.85-1.15), shoulders and front legs (z~0.55), cream saddle (z 0.3 to -0.4), haunches and hind legs (z~-0.6), rump, tail root (z -0.98), tail tuft (z -1.6).\n\nUKIYO-E LOOK ON EVERY PART.\n- Flat colour only. Colour comes in stepped bands, never smooth: a root-to-tip bokashi simulated as 3-4 hard bands (indigoDeep, indigo, indigoLight, skyPale, or vermilionDeep, vermilion, coral, cream).\n- A woodblock key-line is made of thin ink (#ink) sweeps of 5-9 mm radius with round caps. They run along silhouette edges: spine line, belly line, leg fronts, ear rims, jaw line, trunk edge. Every flame-blade, ear, tusk and toe is outlined by a slightly larger ink extrude seated just behind it.\n- Hairline fur strokes are tiny ink spikes laid in flowing rows. Small gold dots and vermilion tomoe or spiral roundels (karakusa-style curls) sit on shoulders and haunches.\n- The saddle's scalloped wave edges (seigaiha half-discs in cream, skyPale and ink) and kasumi mist bands are the print motifs.\n- Keep primitives blocky and faceted: 6-10 sides on tubes, few segments on spheres.",
  "palette": {
    "ink": "#1b1626",
    "indigoDeep": "#162a52",
    "indigo": "#2a4f86",
    "indigoLight": "#5b86b8",
    "skyPale": "#a9c9dc",
    "cream": "#efe2bd",
    "paperWhite": "#fbf5e2",
    "ivory": "#f1e8cf",
    "vermilion": "#d8432a",
    "vermilionDeep": "#a82a1f",
    "coral": "#ea8a6b",
    "ochre": "#d9a23f",
    "gold": "#e6bb4a",
    "tigerBrown": "#9a5a2c",
    "straw": "#c9b06a",
    "moss": "#5f8a58",
    "sumi": "#4a4a5c",
    "rose": "#e58fa0"
  },
  "mounts": {
    "hipsPivot": [0, 0.95, -0.6],
    "chest": [0, 1.05, 0.4],
    "withers": [0, 1.4, 0.45],
    "rumpTop": [0, 1.43, -0.65],
    "neckBase": [0, 1.1, 0.85],
    "neckTop": [0, 1.4, 1.15],
    "skullCentre": [0, 1.4, 1.3],
    "foreheadDisc": [0, 1.64, 1.38],
    "jawHinge": [0, 1.2, 1.25],
    "trunkRoot": [0, 1.28, 1.5],
    "trunkTip": [0, 0.88, 1.85],
    "earBaseL": [0.22, 1.62, 1.12],
    "earBaseR": [-0.22, 1.62, 1.12],
    "shoulderL": [0.3, 0.95, 0.55],
    "shoulderR": [-0.3, 0.95, 0.55],
    "haunchL": [0.33, 0.95, -0.6],
    "haunchR": [-0.33, 0.95, -0.6],
    "pawFrontL": [0.3, 0.0, 0.7],
    "pawFrontR": [-0.3, 0.0, 0.7],
    "pawHindL": [0.33, 0.0, -0.6],
    "pawHindR": [-0.33, 0.0, -0.6],
    "tailRoot": [0, 1.1, -0.98],
    "tailTip": [0, 0.95, -1.6]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.95, -0.6], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 1.0, -0.1], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 1.05, 0.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck1", "parent": "spine2", "at": [0, 1.1, 0.85], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "neck2", "parent": "neck1", "at": [0, 1.28, 1.0], "dir": [0, 0.3, 1], "role": "neck" },
    { "name": "head", "parent": "neck2", "at": [0, 1.4, 1.15], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.2, 1.25], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.28, 1.5], "dir": [0, -0.1, 1], "role": "tentacle", "group": "trunk" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.2, 1.7], "dir": [0, -0.5, 1], "role": "tentacle", "group": "trunk" },
    { "name": "trunk3", "parent": "trunk2", "at": [0, 1.05, 1.8], "dir": [0, -1, 0.3], "role": "tentacle", "group": "trunk" },
    { "name": "earL", "parent": "head", "at": [0.22, 1.62, 1.12], "dir": [0.4, 1, -0.2], "role": "hinge", "group": "ears" },
    { "name": "earR", "parent": "head", "at": [-0.22, 1.62, 1.12], "dir": [-0.4, 1, -0.2], "role": "hinge", "group": "ears" },
    { "name": "fUpperL", "parent": "spine2", "at": [0.3, 0.95, 0.55], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "fLowerL", "parent": "fUpperL", "at": [0.3, 0.55, 0.6], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "fPawL", "parent": "fLowerL", "at": [0.3, 0.14, 0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "fUpperR", "parent": "spine2", "at": [-0.3, 0.95, 0.55], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "fLowerR", "parent": "fUpperR", "at": [-0.3, 0.55, 0.6], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "fPawR", "parent": "fLowerR", "at": [-0.3, 0.14, 0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hUpperL", "parent": "hips", "at": [0.33, 0.95, -0.6], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "hLowerL", "parent": "hUpperL", "at": [0.33, 0.52, -0.5], "dir": [0, -1, -0.2], "role": "leg", "group": "legs" },
    { "name": "hPawL", "parent": "hLowerL", "at": [0.33, 0.14, -0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hUpperR", "parent": "hips", "at": [-0.33, 0.95, -0.6], "dir": [0, -1, 0.2], "role": "leg", "group": "legs" },
    { "name": "hLowerR", "parent": "hUpperR", "at": [-0.33, 0.52, -0.5], "dir": [0, -1, -0.2], "role": "leg", "group": "legs" },
    { "name": "hPawR", "parent": "hLowerR", "at": [-0.33, 0.14, -0.62], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "tail1", "parent": "hips", "at": [0, 1.1, -0.98], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.05, -1.2], "dir": [0, -0.4, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.88, -1.4], "dir": [0, 0.3, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.92, -1.55], "dir": [0, 0.8, -0.6], "role": "tail", "group": "tail" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The tapir barrel and its print decoration.\n\nBODY. One smooth loft with a pear cross-section (width x height): rump ~0.8x0.9 at z=-0.7, belly bottom y~0.55, barrel ~0.85x0.78 at z=0, chest ~0.75x0.72 at z=0.65, closing at z~0.95. Skin it to hips, spine1 and spine2. Sectors and bands split the colours by place:\n- indigo for the shoulder zone z>0.35 and the haunch zone z<-0.45;\n- a cream saddle between z 0.3 and -0.4, covering the back and flanks;\n- an indigoDeep underside strip;\n- a cream belly line.\nThe saddle border is a scalloped wave edge made of ~14 half-disc extrudes per side, alternating cream, skyPale and ink-rimmed. These are small seigaiha arcs sticking onto the loft at the two saddle borders (front and back), seated with b.stick on surface hits.\n\nSADDLE PATTERN. On each flank of the saddle, 3 rows of seigaiha concentric ink arcs (thin sweeps in ink and skyPale), 4-5 gold dots, and one vermilion kasumi cloud-band extrude (a wavy-edged strip) low on the side.\n\nKEY-LINES. Thin ink sweeps (r 6-8 mm) follow the dorsal ridge sweep.line(0), the belly sweep.line(180) and a flank line sweep.line(±90) on both shoulder and haunch.\n\nROUNDELS. On each shoulder (x=±0.4, z~0.5, y~1.1) and each haunch (x=±0.42, z~-0.6, y~1.1), a vermilion spiral or tomoe roundel with an ink outline, built as a spiral-path sweep tapering from 14 mm to 4 mm over 1.25 turns, with a gold dot at the centre.\n\nFUR STROKES. About 40 tiny ink spikes in flowing rows, scattered with a seeded rng over the indigo zones and pointing back and down.\n\nTAIL-ROOT AND CHEST DETAILS. A vermilion chest bib pad below neckBase, and a gold-edged vermilion hip-band with 6 small gold studs round the barrel at z=-0.35.\n\nColours: indigo, indigoDeep, cream, paperWhite, skyPale, vermilion, vermilionDeep, gold, ink, coral.",
      "box": [[-0.5, 0.5, -1.0], [0.5, 1.5, 0.95]],
      "attaches": "Rides hips, spine1 and spine2. The neck sweep of neckMane enters at neckBase. The legs' upper joints hang at shoulderL/R and haunchL/R, so the leg tops are buried inside the belly of this loft. The tail starts at tailRoot on its rear.",
      "joints": ["hips", "spine1", "spine2"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "neckMane",
      "builds": "The neck, the mane and the divine rope collar.\n\nNECK. A thick sweep along neck1 and neck2 from neckBase (r~0.3x0.27) to neckTop (r~0.22), indigo on top with a cream throat strip (sector 125-235 deg) and an ink key-line along the top. Add short ink fur strokes on the sides.\n\nMANE. A crest of overlapping flame-blades, each an extrude with a slight bevel. They run in three staggered rows (centre, and ±0.07 at lower height) from between the ears at z~1.12, y~1.62 back along the nape to the withers at z~0.2, y~1.4. About 12 blades per row, 30-36 in all. Each blade is 0.18-0.34 m long, curls backward and up like a flame or wave crest, and is tallest near the head (top reaches y~1.82). Every blade is a stack of 3-4 same-outline layers shrunk toward the tip, giving the root-to-tip bokashi bands: indigoDeep, indigo, indigoLight, skyPale, with the tip band cream or vermilion on alternate blades. An ink outline layer sits behind each blade. Add a few curled vermilion spiral locks at the base. All blades are rigid on neck1, neck2 or spine2, whichever is nearest.\n\nROPE COLLAR (shimenawa). Around the mid neck (z~1.0), two twisted straw and paperWhite sweeps wound as a closed loop (r 0.025 each, offset in phase). On it hang 4 zigzag paperWhite shide paper strips (extrude, ink fold lines), a gold bell (sphere r 0.035 plus an ink slit) at the throat, and two vermilion ribbon tails with gold tassel ends.\n\nColours: indigo, indigoDeep, indigoLight, skyPale, cream, paperWhite, vermilion, vermilionDeep, straw, gold, ink.",
      "box": [[-0.4, 1.0, 0.15], [0.4, 1.85, 1.25]],
      "attaches": "The neck tube starts inside the torso at neckBase and ends at neckTop, inside the back of the skull of the head part. The mane starts at the head's crown (between earBaseL/R) and ends on the torso's withers mount, sitting on both the neck and the torso back.",
      "joints": ["neck1", "neck2", "spine2"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "head",
      "builds": "The baku's face: the most characterful part, built with the richest detail.\n\nSKULL. A wedge-shaped block of frustumBox and sphere pieces, centred at skullCentre. It is about 0.5 wide, 0.5 tall and 0.55 long, with a high domed forehead, a broad cheek, and an upper snout that tapers toward trunkRoot. It is indigo with a lighter indigoLight forehead plane, ink key-lines on the brow and nose bridge, and cream cheek ruffs of 3 small flame-blades each side.\n\nTRUNK. A sweep from trunkRoot along trunk1-trunk3 to trunkTip: it leaves forward, droops, and ends with a small curl. Radius goes 0.09 to 0.05 to 0.035, with a flat-ish caps end. The colour is indigo on top and coral underside, and 8-9 thin ink ring grooves are spaced along it. Two nostril ellipses (ink) sit at the tip, with a vermilion tip pad and a tiny gold dot.\n\nTUSKS. Two curved ivory tusks (cone sweeps r 0.025 to 0, length 0.16) at x=±0.11 from the upper lip near y~1.18, z~1.5. They point forward-down with a slight outward curve, each with an ink outline and a cream root cuff.\n\nJAW. A separate lower jaw riding jaw, hinged at jawHinge. It is a chunky shallow box and wedge in cream with an ink lip line, set 0.02 m open so a vermilion mouth interior and 2 small ivory fangs show. A beard of 3 cream and paperWhite flame-blades hangs under the chin.\n\nEYES. Big round rhino/ox eyes at x=±0.2, y~1.46, z~1.48, as stacked discs facing outward and forward: an ink outline ring (r 0.085), a paperWhite sclera (r 0.075), a vermilion rim (r 0.06), a gold iris (r 0.05), an ink pupil (r 0.028) and a tiny paperWhite highlight dot. Above each eye a heavy bushy brow of 3 stacked curved ink and indigoDeep blades that sweep up and out, with a vermilion line under the lid. A rose blush patch sits on each cheek.\n\nFOREHEAD. A gold-ringed vermilion sun-disc (mitsudomoe in ink and cream) at foreheadDisc, built from a lathe ring, a disc and 3 tomoe comma extrudes.\n\nEARS. Two round ears riding earL and earR (hinge). Each is a thick ink-outlined extrude disc in indigo with a cream rim band and a coral inner disc, tilted outward ~25 deg. Add whisker lines (long thin ink sweeps) from the muzzle sides.\n\nColours: indigo, indigoDeep, indigoLight, cream, paperWhite, ivory, vermilion, vermilionDeep, coral, gold, ink, rose.",
      "box": [[-0.45, 0.8, 1.0], [0.45, 1.8, 1.9]],
      "attaches": "The skull back is centred at neckTop and rides head. The trunk root is at trunkRoot and rides trunk1-3. The lower jaw hinges at jawHinge. The ears are at earBaseL/R, and the mane of neckMane starts just behind the forehead disc between the ears.",
      "joints": ["head", "jaw", "trunk1", "trunk2", "trunk3", "earL", "earR"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "legs",
      "builds": "All four legs with tiger paws, mirrored left and right with for (const s of [1,-1]).\n\nFRONT LEGS (shoulderL/R at y 0.95 down to pawFront). Each is a tapered sweep over fUpper, fLower and fPaw, r~0.1 at the top to 0.075 at the wrist. The upper part is indigo, continuing the shoulder. At the knee, a cream fur-cuff of 5 small flame-blades is ringed round the leg. The lower leg is ochre with 4-5 tigerBrown and ink tiger-stripe bands, each a thin ring or half-ring sweep. A vermilion thin bracelet ring sits at the wrist.\n\nHIND LEGS (haunchL/R). They have a stouter thigh (r~0.14 tapering), a visible hock bend back (hLower angles slightly back), and a thinner cannon like the front legs' lower part. The upper thigh is indigo with a small vermilion spiral on the outer side. The hock has a cream fur-cuff like the front legs. The lower leg has the same ochre stripes.\n\nPAWS. Each paw is a chunky rounded block about 0.17 wide and 0.2 long, ochre on top and cream underneath, resting flat with its lowest points on y=0 (sink at most 1-2 cm). 4 toes per paw are bumps (spheres r~0.04, 6x4 segments) in a forward row. Each has an ink toe-separating line and a small ivory claw (cone r 0.012, length 0.045, pointing forward-down). A coral pad sits at the heel. Front paws sit at pawFrontL/R, hind paws at pawHindL/R. Ink key-line sweeps run down the front edge of every leg.\n\nColours: indigo, indigoDeep, ochre, tigerBrown, cream, paperWhite, ivory, vermilion, coral, gold, ink.",
      "box": [[-0.5, 0.0, -0.85], [0.5, 0.62, 0.9]],
      "attaches": "The leg tops sink into the torso belly at shoulderL/R and haunchL/R. Front legs hang from spine2 and hind legs from hips. The paws end on y=0 at the pawFront and pawHind mounts.",
      "joints": ["fUpperL", "fLowerL", "fPawL", "fUpperR", "fLowerR", "fPawR", "hUpperL", "hLowerL", "hPawL", "hUpperR", "hLowerR", "hPawR"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "tail",
      "builds": "The ox tail and the rump flourishes.\n\nTAIL. A tapering sweep through tail1-tail4 from tailRoot (r 0.07) down to r 0.03. It leaves backward and droops, then swoops up in an S so that it ends near tailTip with the tuft held at y~1.0-1.1. It is indigo with an ink key-line. A gold cuff ring with a vermilion band sits at the root, and 3 skyPale ring bands are spaced along the middle.\n\nTUFT. At the tail end, a fan of 9-11 overlapping flame-blades (extrudes, 0.2-0.3 m long) curl up and back in a spray, each stacked in root-to-tip bokashi bands (vermilionDeep, vermilion, coral, cream), with ink outline layers behind. In the centre sits a larger curling tongue of indigoLight and skyPale. Two small spiral curls frame it.\n\nRUMP CREST. 5 small flame-blades (same style as the mane, 0.12-0.2 m) sit along the rump top near rumpTop and run to the tail root. They are indigoDeep to indigo to skyPale with ink outlines.\n\nKASUMI MIST. Two thin wave-edged kasumi mist bands (extrudes in skyPale and paperWhite with ink outline), draped low across each rear haunch edge where the saddle meets the haunch. Keep them thin, flat to the body, and just a few mm off the surface.\n\nColours: indigo, indigoDeep, indigoLight, skyPale, cream, paperWhite, vermilion, vermilionDeep, coral, gold, ink.",
      "box": [[-0.3, 0.55, -1.65], [0.3, 1.55, -0.85]],
      "attaches": "The tail root is at tailRoot on the back of the torso and rides tail1-tail4 (parent hips). The rump crest sits on the torso's top at rumpTop and continues toward tailRoot. The mist bands lie on the surface of the haunch.",
      "joints": ["tail1", "tail2", "tail3", "tail4", "hips"],
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

export function buildLegs({ b, J, P, M }: any) {
  const R = rng(5);
  const bandsFn = (cols: string[], cuts: number[]) => (t: number) => {
    for (let i = 0; i < cuts.length; i++) if (t < cuts[i]) return cols[i];
    return cols[cols.length - 1];
  };

  // flame-blade cuff ring around a leg point
  const cuff = (at: number[], bone: any, r: number, n: number, col: string) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const dir = [Math.sin(a) * 0.8, -0.6, Math.cos(a) * 0.8];
      const base = [at[0] + Math.sin(a) * r, at[1], at[2] + Math.cos(a) * r];
      b.spike(base, dir, 0.09, 0.022, { color: P.ink, bone, sides: 6 });
      b.spike([base[0], base[1] + 0.005, base[2]], dir, 0.075, 0.016, { color: col, bone, sides: 6 });
    }
  };

  const ring = (at: number[], bone: any, r: number, w: number, col: string) => {
    b.part(new THREE.TorusGeometry(r, w, 5, 10), col, { bone, at, dir: [0, 1, 0], axis: "z" });
  };

  const paw = (x: number, z: number, bone: any, s: number) => {
    const pz = z + 0.05;
    b.part(new THREE.BoxGeometry(0.17, 0.1, 0.2), P.cream, { bone, at: [x, 0.05, pz] });
    b.part(new THREE.BoxGeometry(0.17, 0.08, 0.2), P.ochre, { bone, at: [x, 0.1, pz] });
    b.part(new THREE.SphereGeometry(0.085, 6, 4), P.ochre, { bone, at: [x, 0.1, pz - 0.02], scale: [1, 0.9, 1.2] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.coral, { bone, at: [x, 0.015, pz - 0.06], scale: [1.6, 0.4, 1.3] });
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.042;
      const tz = pz + 0.115 - Math.abs(i - 1.5) * 0.01;
      b.part(new THREE.SphereGeometry(0.04, 6, 4), P.ochre, { bone, at: [tx, 0.045, tz] });
      b.spike([tx, 0.03, tz + 0.035], [0, -0.5, 1], 0.045, 0.012, { color: P.ivory, bone, sides: 5 });
      if (i < 3)
        b.rod([tx + 0.021, 0.02, tz - 0.01], [tx + 0.021, 0.075, tz + 0.035], 0.004, P.ink, { bone, sides: 5 });
    }
  };

  const leg = (s: number, front: boolean) => {
    const sfx = s > 0 ? "L" : "R";
    const up = front ? J["fUpper" + sfx] : J["hUpper" + sfx];
    const lo = front ? J["fLower" + sfx] : J["hLower" + sfx];
    const pw = front ? J["fPaw" + sfx] : J["hPaw" + sfx];
    const x = s * (front ? 0.3 : 0.33);
    const zT = front ? 0.55 : -0.6;
    const zK = front ? 0.6 : -0.5;
    const zW = front ? 0.62 : -0.62;
    const rTop = front ? 0.1 : 0.14;
    const top = [x, 0.95, zT];
    const knee = [x, front ? 0.55 : 0.52, zK];
    const wrist = [x, 0.17, zW];

    // upper segment: indigo
    b.sweep([top, knee], [rTop, front ? 0.085 : 0.1], { color: P.indigo, bone: [up, lo], sides: 8 });
    b.capsule(knee, [x, 0.5, zK], front ? 0.085 : 0.1, { color: P.indigo, bone: lo, sides: 8 });
    // lower: ochre
    b.sweep([knee, wrist], [front ? 0.08 : 0.075, 0.07], { color: P.ochre, bone: [lo, pw], sides: 8 });
    // stripes
    for (let i = 0; i < 5; i++) {
      const y = knee[1] - 0.06 - i * 0.065;
      const t = (knee[1] - y) / (knee[1] - wrist[1]);
      const z = zK + (zW - zK) * t;
      ring([x, y, z], lo, 0.082 - t * 0.008, 0.007, i % 2 ? P.ink : P.tigerBrown);
    }
    ring([x, 0.2, zW], pw, 0.075, 0.009, P.vermilion);
    ring([x, 0.2, zW], pw, 0.077, 0.004, P.gold);
    cuff([x, knee[1] + 0.02, zK], lo, 0.085, 5, P.cream);
    // key line down front edge
    b.rod([x, 0.9, zT + rTop * 0.95], [x, knee[1], zK + 0.09], 0.006, P.ink, { bone: up, sides: 6 });
    b.rod([x, knee[1], zK + 0.085], [x, 0.17, zW + 0.07], 0.006, P.ink, { bone: lo, sides: 6 });
    // hock bump on hind legs
    if (!front) {
      b.part(new THREE.SphereGeometry(0.09, 6, 4), P.indigoDeep, { bone: lo, at: [x, 0.52, zK - 0.1], scale: [0.9, 1.1, 1] });
      // vermilion spiral on outer thigh
      const cx = x + s * 0.13;
      const pts: number[][] = [];
      for (let i = 0; i <= 14; i++) {
        const a = i * 0.55;
        const r = 0.05 - i * 0.003;
        pts.push([cx, 0.85 + Math.sin(a) * r, zT + Math.cos(a) * r]);
      }
      b.sweep(pts, [0.01, 0.004], { color: P.vermilion, bone: up, sides: 5 });
      b.part(new THREE.SphereGeometry(0.012, 5, 4), P.gold, { bone: up, at: [cx + s * 0.005, 0.85, zT] });
    } else {
      b.part(new THREE.SphereGeometry(0.012, 5, 4), P.gold, { bone: up, at: [x + s * 0.09, 0.8, zT + 0.02] });
    }
    paw(x, zW, pw, s);
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }
  void R; void M; void bandsFn;
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tj = [J.tail1, J.tail2, J.tail3, J.tail4];

  // ---- tail sweep ----
  const pts: number[][] = [
    [0, 1.1, -0.98],
    [0, 1.06, -1.2],
    [0, 0.9, -1.4],
    [0, 0.93, -1.52],
    [0, 1.0, -1.58],
  ];
  const path = catmull(pts);
  const rad = (t: number) => 0.07 - 0.04 * t;
  b.sweep(path, rad, {
    bone: tj,
    color: P.indigo,
    sides: 8,
    caps: "round",
    bands: [
      [0.3, P.indigo],
      [0.6, P.indigoDeep],
      [1, P.indigo],
    ],
  });
  b.sweep(path, (t: number) => rad(t) * 0.12 + 0.005, {
    bone: tj,
    color: P.ink,
    sides: 6,
    shift: (t: number) => [0, rad(t)] as [number, number],
  });
  // ring bands
  const ring = (t: number, col: string, k: number) => {
    const p = path.at(t);
    const d = path.tangentAt(t);
    b.part(new THREE.CylinderGeometry(rad(t) * k, rad(t) * k, 0.03, 8), col, {
      at: p,
      dir: d,
      bone: J.tail1,
    });
  };
  ring(0.04, P.gold, 1.2);
  ring(0.1, P.vermilion, 1.18);
  for (const t of [0.35, 0.5, 0.65]) ring(t, P.skyPale, 1.12);

  // ---- flame blade helper ----
  const blade = (
    at: number[],
    x: number[],
    len: number,
    w: number,
    cols: string[],
    bone: any,
    up: number[] = [0, 1, 0],
  ) => {
    const o: [number, number, "sharp"?][] = [
      [0, -w * 0.5],
      [len * 0.5, -w * 0.6],
      [len * 0.85, -w * 0.2],
      [len, w * 0.4, "sharp"],
      [len * 0.6, w * 0.5],
      [len * 0.2, w * 0.6],
    ] as any;
    const bw = w * 0.14;
    const outline = o.map(([a, c, s]) => [a * 1.0, c * 1.18, s] as any);
    b.extrude(outline.map(([a, c]: number[]) => [a, c + 0.0] as any), {
      at: [at[0], at[1], at[2]], x, y: up, thickness: 0.012, color: P.ink, bone,
    });
    cols.forEach((c, i) => {
      const f = 1 - i * 0.22;
      const lay = o.map(([a, cc, s]) => [a * f + (1 - f) * 0 + 0, cc * f, s] as any);
      // later layers shrink toward the tip: keep root, shrink length
      const lay2 = o.map(([a, cc, s]) => [a * (1 - i * 0.2), cc * (1 - i * 0.15), s] as any);
      void lay;
      b.extrude(lay2, {
        at: [at[0] + (i + 1) * 0.0015, at[1], at[2]],
        x, y: up, thickness: 0.016, color: c, bone,
      });
    });
    void bw;
  };

  // ---- tuft fan ----
  const tip = [0, 1.0, -1.58];
  const bok = [P.vermilionDeep, P.vermilion, P.coral, P.cream];
  for (let i = 0; i < 10; i++) {
    const a = -0.9 + (i / 9) * 1.8;
    const ang = a;
    const dir = [Math.sin(ang) * 0.5, 0.55 + 0.25 * Math.cos(ang), -0.8];
    const len = 0.2 + 0.1 * R();
    const up = [Math.sin(ang), 0.3, 0];
    blade(tip, dir, len, 0.07, bok, J.tail4, [0, 0, 1]);
    void up;
  }
  // centre tongue
  blade([0, 1.0, -1.58], [0, 0.7, -0.5], 0.34, 0.1, [P.indigoLight, P.skyPale], J.tail4, [1, 0, 0]);
  // spiral curls
  for (const s of [1, -1]) {
    const c = catmull([
      [s * 0.04, 1.0, -1.58],
      [s * 0.11, 1.08, -1.6],
      [s * 0.14, 1.16, -1.58],
      [s * 0.1, 1.2, -1.55],
      [s * 0.07, 1.17, -1.55],
    ]);
    b.sweep(c, [0.012, 0.005], { bone: J.tail4, color: P.vermilion, sides: 6 });
  }

  // ---- rump crest ----
  const crestCols = [P.indigoDeep, P.indigo, P.skyPale];
  for (let i = 0; i < 5; i++) {
    const z = -0.66 - i * 0.07;
    const y = 1.43 - i * 0.045;
    blade([0, y, z], [0, 0.4, -1], 0.12 + 0.02 * (4 - i), 0.05, crestCols, J.hips, [1, 0, 0]);
  }

  // ---- kasumi mist ----
  for (const s of [1, -1]) {
    const o: [number, number][] = [];
    for (let k = 0; k <= 6; k++) o.push([k * 0.05, 0.02 * (k % 2 ? 1 : -1)]);
    for (let k = 6; k >= 0; k--) o.push([k * 0.05, 0.05 + 0.02 * (k % 2 ? -1 : 1)]);
    const bigO = o.map(([a, c]) => [a, c * 1.0] as [number, number]);
    b.extrude(bigO, {
      at: [s * 0.44, 0.9, -0.78], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: P.ink, bone: J.hips,
    });
    b.extrude(bigO.map(([a, c]) => [a * 0.95 + 0.005, c * 0.9 + 0.003] as [number, number]), {
      at: [s * 0.447, 0.9, -0.78], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006,
      color: s > 0 ? P.skyPale : P.paperWhite, bone: J.hips,
    });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, spiral, offset } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hips = J.hips, s1 = J.spine1, s2 = J.spine2;

  // Body loft: pear cross-section stations along z
  const st = [
    { at: [0, 1.0, -0.98], w: 0.3, h: 0.3 },
    { at: [0, 1.0, -0.7], w: 0.8, h: 0.9 },
    { at: [0, 0.98, -0.3], w: 0.84, h: 0.84 },
    { at: [0, 0.94, 0.0], w: 0.85, h: 0.78 },
    { at: [0, 0.98, 0.35], w: 0.8, h: 0.75 },
    { at: [0, 1.0, 0.65], w: 0.75, h: 0.72 },
    { at: [0, 1.02, 0.93], w: 0.3, h: 0.3 },
  ];
  const body = b.loft(st, {
    bone: [hips, s1, s2],
    color: P.indigo,
    sides: 10,
    bands: [
      [0.28, P.indigo],
      [0.72, P.cream],
      [1, P.indigo],
    ],
    sectors: [
      [-70, 70, P.cream, 0.28, 0.72],
      [150, 210, P.indigoDeep, 0, 1],
      [172, 188, P.cream, 0.1, 0.9],
    ],
  } as any);

  const skin = b.surface(body);
  const ink = P.ink;

  // Key-lines
  for (const [deg, c] of [[0, ink], [180, ink], [90, ink], [-90, ink]] as [number, string][]) {
    try {
      b.sweep(body.line(deg, 0.006), 0.006, { color: c, bone: [hips, s1, s2], sides: 6 } as any);
    } catch (e) {}
  }

  // Scalloped saddle borders (seigaiha half discs)
  const disc = [] as [number, number][];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    disc.push([Math.cos(a) * 0.04, Math.sin(a) * 0.04]);
  }
  const cols = [P.cream, P.skyPale, P.paperWhite];
  for (const side of [1, -1]) {
    for (const zEdge of [0.3, -0.4]) {
      for (let i = 0; i < 14; i++) {
        const el = -60 + i * 12 + (i % 2) * 3;
        const hit = skin.around([0, 0.98, zEdge]).at(side * 90, el);
        if (!hit) continue;
        const hz = hit.at.z;
        const rim = new THREE.CylinderGeometry(0.046, 0.046, 0.006, 8);
        b.stick(rim, ink, hit, { embed: 0.3 });
        b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 8), cols[i % 3], hit, { embed: 0.2 });
        void hz;
      }
    }
  }

  // Saddle pattern per flank
  for (const side of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 4; k++) {
        const h = skin.around([0, 0.98, 0]).at(side * 90, 12 - row * 22 + 0);
        if (!h) continue;
        const p = h.moved([0, 0.004, 0]);
        const at = offset(p.at, [0, 0, 1], -0.25 + k * 0.17 + (row % 2) * 0.08);
        const hh = skin.nearest(at);
        for (const [r, c] of [[0.05, ink], [0.036, P.skyPale], [0.022, ink]] as [number, string][])
          b.stick(new THREE.CylinderGeometry(r, r, 0.006, 8), c, hh, { embed: 0.3 });
      }
    }
    for (let i = 0; i < 5; i++) {
      const h = skin.around([0, 0.98, 0]).at(side * 90, 35 + R() * 25);
      if (!h) continue;
      const hh = skin.nearest(offset(h.at, [0, 0, 1], -0.25 + i * 0.12));
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.gold, hh, { embed: 0.3 });
    }
    // kasumi band low on flank
    const kh = skin.around([0, 0.9, 0]).at(side * 90, -45);
    if (kh) {
      const o: [number, number][] = [];
      for (let i = 0; i <= 8; i++) o.push([-0.3 + i * 0.075, 0.025 + (i % 2) * 0.015]);
      for (let i = 8; i >= 0; i--) o.push([-0.3 + i * 0.075, -0.02 - (i % 2) * 0.01]);
      b.extrude(o, {
        at: kh.moved([0, 0.003, 0]).at,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: P.vermilion,
        bone: s1,
      });
    }
  }

  // Roundels
  const roundel = (x: number, z: number, s: number) => {
    const h = skin.around([0, 1.0, z]).at(s * 90, 15);
    if (!h) return;
    const c = h.at;
    const sp = spiral(c, offset(c, [0, 0, 1], 0.07), [s, 0, 0], { turns: 1.25, r1: 0.015 });
    b.sweep(sp, [0.014, 0.004], { color: P.vermilion, bone: z > 0 ? s2 : hips, sides: 6 } as any);
    b.stick(new THREE.SphereGeometry(0.018, 6, 4), P.gold, h, { embed: 0.2, bone: z > 0 ? s2 : hips } as any);
  };
  for (const s of [1, -1]) {
    roundel(0.4, 0.5, s);
    roundel(0.42, -0.6, s);
  }

  // Fur strokes
  const hits = skin.scatter(40, { rng: R, minDist: 0.1, filter: (h) => Math.abs(h.at.z - 0.0) > 0.45 && h.n.y > -0.4 });
  for (const h of hits) {
    b.stick(new THREE.ConeGeometry(0.008, 0.07, 5), ink, h, { embed: 0.3, flow: [0, -0.5, -1] } as any);
  }

  // Chest bib
  const bib = skin.around([0, 1.0, 0.65]).at(0, -25);
  if (bib) {
    b.stick(new THREE.BoxGeometry(0.34, 0.012, 0.3), P.vermilion, bib, { embed: 0.4 });
    b.stick(new THREE.BoxGeometry(0.2, 0.014, 0.18), P.coral, bib, { embed: 0.3 });
  }

  // Hip band with studs
  try {
    const loop = skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, 0.03, { color: P.vermilion, bone: hips, sides: 6 } as any);
    b.sweep(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.036 }), 0.007, { color: P.gold, bone: hips, sides: 6 } as any);
    b.sweep(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: -0.01 }), 0.007, { color: P.gold, bone: hips, sides: 6 } as any);
    b.along(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.04 }), 6, (at: any) =>
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.gold, at, { embed: 0.2 }),
    );
  } catch (e) {}
}
```

<!-- call: neckMane -->

```ts
import * as THREE from "three";
import { catmull, offset } from "agentic-3js-builder";

export function buildNeckMane({ b, J, P, M }: Ctx) {
  const n1 = J.neck1, n2 = J.neck2, sp = J.spine2;
  const INK = P.ink;

  // ---- NECK ----
  const path = catmull([M.neckBase, [0, 1.25, 1.0], M.neckTop]);
  const neck = b.sweep(path, (t: number) => [0.3 - 0.08 * t, 0.27 - 0.05 * t], {
    bone: [n1, n2], color: P.indigo, sides: 8,
    sectors: [[125, 235, P.cream]],
  });
  b.sweep(neck.line(0, 0.004), 0.007, { color: INK, bone: n1 });

  // fur strokes on the sides
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const t = 0.15 + i * 0.13;
      for (const k of [60, 90]) {
        const h = neck.at(t, s * k);
        b.spike(h, h, 0.05, 0.005, { color: INK, bone: t < 0.5 ? n1 : n2 });
      }
    }

  // ---- MANE ----
  const flame = (len: number, w: number): [number, number, string?][] => [
    [0, 0], [w * 0.5, len * 0.35], [w * 0.3, len * 0.7], [-w * 0.2, len * 1.0, "sharp"],
    [-w * 0.1, len * 0.6], [-w * 0.6, len * 0.35], [-w * 0.5, 0],
  ] as any;
  const bands = [P.indigoDeep, P.indigo, P.indigoLight, P.skyPale];
  const rows = [{ x: 0, dy: 0 }, { x: 0.07, dy: -0.06 }, { x: -0.07, dy: -0.06 }];
  let alt = 0;
  rows.forEach((row, ri) => {
    const N = 12;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const z = 1.12 - t * 0.92 + (ri ? 0.03 : 0);
      const y0 = 1.62 - t * 0.2 + row.dy - (ri ? 0 : 0);
      const len = 0.34 - 0.14 * t;
      const w = 0.07;
      const bone = z > 0.9 ? n2 : z > 0.55 ? n1 : sp;
      const base: [number, number, number] = [row.x * (1 - 0.3 * t), Math.min(y0, 1.62) - 0.02, z];
      const o = outlineScale(flame(len, w), 1.12);
      b.extrude(o as any, {
        at: [base[0], base[1] - 0.008, base[2] + 0.012], x: [0, 0, -1], y: [0, 1, 0],
        thickness: 0.03, color: INK, bone,
      });
      const tip = alt++ % 2 ? P.cream : P.vermilion;
      for (let L = 0; L < 4; L++) {
        const k = 1 - L * 0.18;
        b.extrude(flame(len * k, w * k) as any, {
          at: [base[0], base[1] + L * 0.012, base[2] - L * 0.004], x: [0, 0, -1], y: [0, 1, 0],
          thickness: 0.026 - L * 0.002, bevel: 0.003,
          color: L === 3 ? tip : bands[L], bone,
        });
      }
    }
  });

  // vermilion spiral locks
  for (const s of [1, -1]) {
    const c = [s * 0.1, 1.55, 1.0];
    const sp3 = catmull([
      [c[0], c[1], c[2]], [c[0] + s * 0.05, c[1] + 0.05, c[2] - 0.04],
      [c[0] + s * 0.07, c[1] + 0.1, c[2] - 0.1], [c[0] + s * 0.03, c[1] + 0.13, c[2] - 0.12],
    ]);
    b.sweep(sp3, [0.018, 0.006], { color: P.vermilion, bone: n2, sides: 6 });
  }

  // ---- ROPE COLLAR ----
  const cz = 1.0, cy = 1.28;
  const ring = (ph: number, col: string) => {
    const pts: number[][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const w = 0.025 * Math.sin(a * 6 + ph);
      pts.push([Math.sin(a) * (0.28 + w), cy + Math.cos(a) * (0.255 + w), cz - Math.sin(a) * 0 + 0.0]);
    }
    return b.sweep(catmull(pts, { closed: true }), 0.025, { color: col, bone: n1, sides: 6 });
  };
  ring(0, P.straw);
  ring(Math.PI, P.paperWhite);

  // shide
  const zig: [number, number][] = [[-0.02, 0], [0.02, 0], [0.02, -0.05], [-0.01, -0.08], [0.02, -0.11], [-0.02, -0.15], [-0.02, -0.08], [0.0, -0.05]] as any;
  const shide: [number, number][] = [[-0.025, 0], [0.025, 0], [0.025, -0.06], [-0.005, -0.09], [0.025, -0.12], [-0.025, -0.17], [-0.005, -0.1], [-0.025, -0.06]];
  void zig;
  [-60, -25, 25, 60].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * 0.3, y = cy + Math.cos(a) * 0.27 - 0.03;
    b.extrude(shide as any, { at: [x, y, cz + 0.02], x: [1, 0, 0], thickness: 0.004, color: P.paperWhite, bone: n1 });
    b.rod([x, y - 0.06, cz + 0.024], [x, y - 0.06, cz + 0.024].map((v, i) => (i === 0 ? v + 0.03 : v)) as any, 0.003, INK, { bone: n1 });
  });

  // bell at throat
  const bellAt: [number, number, number] = [0, cy - 0.3, cz + 0.06];
  b.part(new THREE.SphereGeometry(0.035, 8, 6), P.gold, { bone: n1, at: bellAt });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), INK, { bone: n1, at: [0, bellAt[1] - 0.012, bellAt[2] + 0.034] });

  // ribbon tails with tassels
  for (const s of [1, -1]) {
    const x = s * 0.07;
    b.extrude([[-0.018, 0], [0.018, 0], [0.018, -0.2], [0, -0.17], [-0.018, -0.2]] as any, {
      at: [x, bellAt[1] - 0.03, bellAt[2] + 0.02], x: [1, 0, 0], thickness: 0.006, color: P.vermilion, bone: n1,
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.gold, { bone: n1, at: [x, bellAt[1] - 0.25, bellAt[2] + 0.02] });
    b.spike([x, bellAt[1] - 0.25, bellAt[2] + 0.02], [0, -1, 0], 0.05, 0.014, { color: P.gold, bone: n1 });
  }

  function outlineScale(o: any[], k: number) {
    return o.map(([x, y, f]) => (f ? [x * k, y * k - 0.01, f] : [x * k, y * k - 0.01]));
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, t1 = J.trunk1, t2 = J.trunk2, t3 = J.trunk3;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const disc = (r: number, th: number, seg = 14) => new THREE.CylinderGeometry(r, r, th, seg);

  // skull
  put(sph(0.27, 10, 7), P.indigo, [0, 1.42, 1.3], head, { scale: [0.95, 0.95, 1.05] });
  put(sph(0.2, 8, 6), P.indigoLight, [0, 1.56, 1.34], head, { scale: [1.05, 0.6, 1] });
  b.frustumBox([0, 1.33, 1.35], [0, 1.28, 1.56], [0.42, 0.34], [0.2, 0.22], { bone: head, color: P.indigo });
  b.rod([0, 1.7, 1.2], [0, 1.52, 1.5], 0.006, { bone: head, color: P.ink });
  b.rod([0, 1.52, 1.5], [0, 1.3, 1.6], 0.006, { bone: head, color: P.ink });

  // trunk
  const tp = catmull([[0, 1.28, 1.5], [0, 1.24, 1.68], [0, 1.1, 1.8], [0, 0.88, 1.85], [0, 0.82, 1.86]]);
  b.sweep(tp, [0.09, 0.035], {
    bone: [t1, t2, t3], color: P.indigo, sides: 8,
    sectors: [[110, 250, P.coral]], caps: "round",
  });
  for (let i = 1; i <= 8; i++) {
    const p = tp.at(i / 9);
    put(new THREE.TorusGeometry(0.075 - i * 0.005, 0.006, 4, 8), P.ink, [p.x, p.y, p.z], i < 3 ? t1 : i < 6 ? t2 : t3, {
      dir: tp.tangentAt(i / 9).toArray(), axis: "z",
    });
  }
  const te = tp.at(1);
  put(sph(0.032, 6, 4), P.vermilion, [te.x, te.y - 0.005, te.z + 0.005], t3);
  for (const s of [1, -1]) put(sph(0.009, 4, 3), P.ink, [s * 0.015, te.y - 0.01, te.z + 0.03], t3);
  put(sph(0.01, 4, 3), P.gold, [0, te.y - 0.035, te.z + 0.01], t3);

  // tusks
  for (const s of [1, -1]) {
    const tu = catmull([[s * 0.11, 1.2, 1.5], [s * 0.125, 1.15, 1.58], [s * 0.14, 1.07, 1.63]]);
    b.sweep(tu, [0.03, 0.002], { bone: head, color: P.ink, sides: 6 });
    b.sweep(tu, [0.024, 0], { bone: head, color: P.ivory, sides: 6, caps: "point" });
    put(disc(0.036, 0.03, 8), P.cream, [s * 0.11, 1.2, 1.5], head, { rotation: [90, 0, 0] });
  }

  // jaw
  put(new THREE.BoxGeometry(0.34, 0.08, 0.3), P.cream, [0, 1.15, 1.38], jaw);
  put(new THREE.BoxGeometry(0.28, 0.07, 0.2), P.cream, [0, 1.16, 1.55], jaw);
  put(new THREE.BoxGeometry(0.3, 0.02, 0.4), P.vermilionDeep, [0, 1.2, 1.4], jaw);
  b.rod([-0.17, 1.19, 1.3], [-0.14, 1.19, 1.62], 0.006, { bone: jaw, color: P.ink });
  b.rod([0.17, 1.19, 1.3], [0.14, 1.19, 1.62], 0.006, { bone: jaw, color: P.ink });
  for (const s of [1, -1]) put(new THREE.ConeGeometry(0.012, 0.045, 5), P.ivory, [s * 0.09, 1.22, 1.6], jaw);
  const bl = [P.cream, P.paperWhite, P.cream];
  bl.forEach((c, i) => {
    const x = (i - 1) * 0.07;
    put(new THREE.ConeGeometry(0.035, 0.16, 5), P.ink, [x, 1.04, 1.5], jaw, { rotation: [180, 0, 0], scale: [1.2, 1.1, 1.2] });
    put(new THREE.ConeGeometry(0.028, 0.14, 5), c, [x, 1.05, 1.5], jaw, { rotation: [180, 0, 0] });
  });

  // cheek ruffs
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    put(new THREE.ConeGeometry(0.04, 0.14, 5), P.ink, [s * 0.26, 1.28 - i * 0.04, 1.3 + i * 0.05], head, { rotation: [0, 0, s * -105], scale: [1.2, 1, 1.2] });
    put(new THREE.ConeGeometry(0.033, 0.13, 5), P.cream, [s * 0.265, 1.28 - i * 0.04, 1.3 + i * 0.05], head, { rotation: [0, 0, s * -105] });
    put(sph(0.05, 6, 4), P.rose, [s * 0.215, 1.36, 1.5], head, { scale: [0.3, 1, 1] });
  }

  // eyes
  for (const s of [1, -1]) {
    const d = [s * 0.5, 0.1, 0.85];
    const layers: [number, string, number][] = [[0.085, P.ink, 0], [0.075, P.paperWhite, 0.004], [0.06, P.vermilion, 0.008], [0.05, P.gold, 0.012], [0.028, P.ink, 0.016]];
    for (const [r, c, o] of layers)
      put(disc(r, 0.01, 14), c, [s * (0.2 + o * 0.5), 1.46, 1.48 + o], head, { dir: d, axis: "y" });
    put(sph(0.008, 4, 3), P.paperWhite, [s * 0.225, 1.48, 1.51], head);
    // brows
    for (let k = 0; k < 3; k++) {
      put(new THREE.BoxGeometry(0.1, 0.025, 0.04), k % 2 ? P.indigoDeep : P.ink, [s * (0.18 + k * 0.03), 1.56 + k * 0.015, 1.46], head, { rotation: [0, 0, s * (20 + k * 8)] });
    }
    b.rod([s * 0.14, 1.4, 1.54], [s * 0.26, 1.42, 1.44], 0.005, { bone: head, color: P.vermilion });
    // whiskers
    for (const dy of [0, -0.04]) b.sweep(catmull([[s * 0.1, 1.28 + dy, 1.55], [s * 0.25, 1.26 + dy, 1.6], [s * 0.4, 1.2 + dy, 1.6]]), 0.003, { bone: head, color: P.ink, sides: 5 });
    // ears
    const ej = s > 0 ? J.earL : J.earR;
    const ed = [s * 0.45, 0.1, 0.1];
    put(disc(0.13, 0.05, 14), P.ink, [s * 0.22, 1.66, 1.1], ej, { dir: ed, axis: "y" });
    put(disc(0.115, 0.06, 14), P.indigo, [s * 0.225, 1.665, 1.11], ej, { dir: ed });
    put(new THREE.TorusGeometry(0.11, 0.012, 4, 14), P.cream, [s * 0.26, 1.67, 1.13], ej, { dir: ed, axis: "z" });
    put(disc(0.07, 0.065, 12), P.coral, [s * 0.23, 1.665, 1.12], ej, { dir: ed });
  }

  // forehead sun disc
  const fd = [0, 0.5, 0.85];
  put(new THREE.TorusGeometry(0.085, 0.012, 5, 14), P.gold, [0, 1.64, 1.38], head, { dir: fd, axis: "z" });
  put(disc(0.08, 0.01, 14), P.vermilion, [0, 1.64, 1.38], head, { dir: fd });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    put(sph(0.022, 5, 4), i % 2 ? P.cream : P.ink, [Math.sin(a) * 0.04, 1.645 + Math.cos(a) * 0.035, 1.39 + Math.cos(a) * 0.01], head);
  }
  put(sph(0.01, 4, 3), P.gold, [0, 1.65, 1.4], head);
}
```