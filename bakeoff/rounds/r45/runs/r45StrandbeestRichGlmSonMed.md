<!-- call: plan -->

```json
{
  "name": "Ventus Ambulans",
  "description": "A Theo Jansen wind-walking beach creature: a long spine of pale PVC tubes carried on six articulated linkage legs, crowned with amber wing sails and a spinning nose propeller, marching on flat feet.",
  "builderName": "strandWalker",
  "size": [2.4, 2.75, 5.2],
  "layout": "A kinetic beach animal built entirely from tubes and flat panels, low-poly and blocky. Front (+Z): the head end — two neck tubes rise from the spine up and forward to a small tube skull with a twin-tube beak, an amber sail-fin crest on top, round dark eyes with cream rings each side, and a small red pennant at the beak tip. Centre: the main spine runs along z at about y = 1.5 — a thick pale tube with black taped sleeve cuffs at every station, short cross ribs left and right, and a lower keel triangle of tubes hanging beneath it; on the three hip mounts (z = 1.55, 0, -1.55) cross-axle tubes run along x with yellow tape wraps, one per side. Above the spine amidships a wind mast of two braced tubes rises to a horizontal wing boom pivoting on its axle: two large scalloped amber sail panels hang laced to the boom with rope stays, a rack of three green recycled-bottle wind-organ tubes is lashed under the boom, and a four-blade cream propeller with red tips faces +Z at the mast top. Behind, the spine tapers into a tail of three splaying tubes ending in a second red pennant. Below, six legs (three per side) are triangle trusses of tubes — hip socket collar, paired upper rods to the knee, paired lower rods to the ankle, a foot rod to a flat dark foot pad with two small toe spikes — each leg wearing yellow tape wraps, a red ankle band and a dark steel counterweight block on the outer thigh; the feet pads rest flat on y = 0, the whole stance slightly staggered so it reads mid-stride. Style: every joint is a black taped collar, every accent a yellow caution-tape ring, every sail a flat amber or cream panel; pale warm bone tones below, amber and red accents above, nothing smooth.",
  "palette": {
    "tubePale": "#cfc9ba",
    "tubeMid": "#a89f8e",
    "tubeDark": "#6f6a5e",
    "jointBlack": "#2a2a30",
    "tapeYellow": "#eebf2d",
    "tapeRed": "#cf4526",
    "sailAmber": "#f0c545",
    "sailCream": "#f3ead0",
    "rope": "#8a7351",
    "footPad": "#34343a",
    "steelBlock": "#4a4d55",
    "bottleGreen": "#5f8f6a",
    "flagCrimson": "#c23a2e"
  },
  "mounts": {
    "hipFront": [0, 1.5, 1.55],
    "hipMid": [0, 1.5, 0.0],
    "hipRear": [0, 1.5, -1.55],
    "neckBase": [0, 1.55, 1.4],
    "tailBase": [0, 1.35, -2.05],
    "mastBase": [0, 1.95, -0.3],
    "wingAxleCenter": [0, 2.42, 0.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.5, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "tail", "parent": "body", "at": [0, 1.35, -2.05], "dir": [0, -0.15, -1], "role": "tail" },
    { "name": "neck", "parent": "body", "at": [0, 1.55, 1.4], "dir": [0, 0.55, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 2.3, 2.1], "dir": [0, 0.15, 1], "role": "head" },
    { "name": "wingAxle", "parent": "body", "at": [0, 2.42, 0.2], "dir": [1, 0, 0], "role": "hinge" },
    { "name": "hipL1", "parent": "body", "at": [0.55, 1.5, 1.55], "dir": [0, -1, 0.2], "role": "leg", "group": "legsL" },
    { "name": "kneeL1", "parent": "hipL1", "at": [0.62, 1.02, 1.72], "dir": [0, -1, -0.15], "role": "leg", "group": "legsL" },
    { "name": "ankleL1", "parent": "kneeL1", "at": [0.58, 0.55, 1.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legsL" },
    { "name": "footL1", "parent": "ankleL1", "at": [0.55, 0.07, 1.62], "dir": [0, -0.2, 1], "role": "leg", "group": "legsL" },
    { "name": "hipL2", "parent": "body", "at": [0.55, 1.5, 0.0], "dir": [0, -1, 0.2], "role": "leg", "group": "legsL" },
    { "name": "kneeL2", "parent": "hipL2", "at": [0.62, 1.0, 0.18], "dir": [0, -1, -0.15], "role": "leg", "group": "legsL" },
    { "name": "ankleL2", "parent": "kneeL2", "at": [0.58, 0.52, 0.0], "dir": [0, -1, 0.05], "role": "leg", "group": "legsL" },
    { "name": "footL2", "parent": "ankleL2", "at": [0.55, 0.07, 0.06], "dir": [0, -0.2, 1], "role": "leg", "group": "legsL" },
    { "name": "hipL3", "parent": "body", "at": [0.55, 1.5, -1.55], "dir": [0, -1, 0.2], "role": "leg", "group": "legsL" },
    { "name": "kneeL3", "parent": "hipL3", "at": [0.62, 1.0, -1.38], "dir": [0, -1, -0.15], "role": "leg", "group": "legsL" },
    { "name": "ankleL3", "parent": "kneeL3", "at": [0.58, 0.52, -1.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legsL" },
    { "name": "footL3", "parent": "ankleL3", "at": [0.55, 0.07, -1.48], "dir": [0, -0.2, 1], "role": "leg", "group": "legsL" },
    { "name": "hipR1", "parent": "body", "at": [-0.55, 1.5, 1.55], "dir": [0, -1, 0.2], "role": "leg", "group": "legsR" },
    { "name": "kneeR1", "parent": "hipR1", "at": [-0.62, 1.02, 1.72], "dir": [0, -1, -0.15], "role": "leg", "group": "legsR" },
    { "name": "ankleR1", "parent": "kneeR1", "at": [-0.58, 0.55, 1.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legsR" },
    { "name": "footR1", "parent": "ankleR1", "at": [-0.55, 0.07, 1.62], "dir": [0, -0.2, 1], "role": "leg", "group": "legsR" },
    { "name": "hipR2", "parent": "body", "at": [-0.55, 1.5, 0.0], "dir": [0, -1, 0.2], "role": "leg", "group": "legsR" },
    { "name": "kneeR2", "parent": "hipR2", "at": [-0.62, 1.0, 0.18], "dir": [0, -1, -0.15], "role": "leg", "group": "legsR" },
    { "name": "ankleR2", "parent": "kneeR2", "at": [-0.58, 0.52, 0.0], "dir": [0, -1, 0.05], "role": "leg", "group": "legsR" },
    { "name": "footR2", "parent": "ankleR2", "at": [-0.55, 0.07, 0.06], "dir": [0, -0.2, 1], "role": "leg", "group": "legsR" },
    { "name": "hipR3", "parent": "body", "at": [-0.55, 1.5, -1.55], "dir": [0, -1, 0.2], "role": "leg", "group": "legsR" },
    { "name": "kneeR3", "parent": "hipR3", "at": [-0.62, 1.0, -1.38], "dir": [0, -1, -0.15], "role": "leg", "group": "legsR" },
    { "name": "ankleR3", "parent": "kneeR3", "at": [-0.58, 0.52, -1.55], "dir": [0, -1, 0.05], "role": "leg", "group": "legsR" },
    { "name": "footR3", "parent": "ankleR3", "at": [-0.55, 0.07, -1.48], "dir": [0, -0.2, 1], "role": "leg", "group": "legsR" }
  ],
  "parts": [
    {
      "id": "spine",
      "builds": "The central body tube of the walker. One main spine tube swept smoothly along the body and tail joints from z = 1.5 back to z = -2.2, radius about 0.16 tapering to 0.1, in tubePale, with jointBlack sleeve cuffs (short wider tube rings) at every joint station and a tapeYellow caution ring between each pair of cuffs. Beneath it a keel triangle: two tubes running down-and-in from the spine at z = 1.0 and z = -1.6 meeting a short horizontal cross tube at y = 1.0, all tubeMid, braced by a thin rope-coloured diagonal each side. At each of the three hip mounts (hipFront, hipMid, hipRear) a cross-axle tube runs along x from x = -0.6 to x = 0.6 in tubeDark with a tapeYellow wrap at each end — the hip sockets the legs hang from; add a small jointBlack collar at the centre of each axle. Ribs: at z = 0.8 and z = -0.8 a short horizontal strut pair sticks out left and right to x = +/-0.34 with a tapeRed tip cap each. The tail: three tapering tubes from the tailBase mount fanning slightly apart backward (middle one along the tail joint, the outer two angling out by about 12 degrees), tubePale to tubeDark, each ending in a black cap, and a small extruded red flagCrimson pennant (a triangular fin about 0.25 long) at the tail tip. Every piece rides the body or tail joints via the spine sweep's bone list.",
      "box": [[-0.42, 0.95, -2.45], [0.42, 2.0, 1.6]],
      "attaches": "Owns the body root joint and the tail joint; builds the three hip cross-axles centred on the hipFront, hipMid and hipRear mounts that the two leg parts socket onto, and the spine top at neckBase and mastBase where the neckHead and windGear parts clamp on.",
      "joints": ["body", "tail"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "legsPort",
      "builds": "The three legs of the model's left side (+X), riding hipL1/L2/L3 and their knee, ankle and foot joints. Each leg is a tube linkage truss: at the hip mount a jointBlack socket collar (a short wide ring around the hip joint point); from it two parallel upper rods about 0.03 apart in z run hip to knee — one tubePale, one tubeMid — braced by a short cross strut and a thin rope diagonal, with a tapeYellow wrap at mid-span. At the knee a jointBlack collar joins two lower rods running knee to ankle (tubeMid and tubeDark), again cross-braced, with a tapeRed band just above the ankle collar. The ankle collar carries a single foot rod down to the foot joint, and the foot joint carries the foot: a flat footPad slab about 0.3 long (z) by 0.18 wide lying flat on y = 0 with a slight forward toe bevel, plus two small dark toe spikes at its front edge. On the outer face of each thigh a small steelBlock counterweight box (about 0.1 by 0.08 by 0.05) with a tapeRed edge stripe. Also build one horizontal gallery tube along z linking the three hip collars on this side at y = 1.5, tubeDark with yellow wraps, swept across the three hip joints. Stagger the stance subtly: middle leg foot 4 cm forward of the front and rear feet, matching the given joint positions, so the walker reads mid-stride.",
      "box": [[0.35, 0.0, -2.3], [1.15, 1.55, 2.1]],
      "attaches": "Socket collars wrap the hip cross-axles the spine part builds at hipFront, hipMid and hipRear; knee, ankle and foot geometry hangs from the kneeL*, ankleL* and footL* joints; foot pads rest flat on y = 0.",
      "joints": ["hipL1", "kneeL1", "ankleL1", "footL1", "hipL2", "kneeL2", "ankleL2", "footL2", "hipL3", "kneeL3", "ankleL3", "footL3"],
      "floor": true,
      "budget": 180
    },
    {
      "id": "legsStarboard",
      "builds": "The three legs of the model's right side (-X), the mirror of the port legs, riding hipR1/R2/R3 and their knee, ankle and foot joints. Each leg: jointBlack hip socket collar at the mount; two parallel upper rods hip to knee (tubePale and tubeMid) cross-braced with a short strut and a rope diagonal, tapeYellow wrap at mid-span; jointBlack knee collar; two lower rods knee to ankle (tubeMid and tubeDark) cross-braced with a tapeRed band above the ankle; a foot rod to the foot joint carrying a flat footPad slab about 0.3 by 0.18 on y = 0 with two small toe spikes at its front edge; a steelBlock counterweight on the outer thigh with a tapeRed edge stripe. One horizontal gallery tube along z linking the three hip collars at y = 1.5, tubeDark with yellow wraps, swept across the three right hip joints. Same subtle stance stagger as the port side (middle foot 4 cm forward), but mirror only across x — keep the same fore/aft joint offsets so the two sides are phase-matched in the rest pose.",
      "box": [[-1.15, 0.0, -2.3], [-0.35, 1.55, 2.1]],
      "attaches": "Socket collars wrap the hip cross-axles at hipFront, hipMid and hipRear built by the spine part; knee, ankle and foot geometry hangs from the kneeR*, ankleR* and footR* joints; foot pads rest flat on y = 0.",
      "joints": ["hipR1", "kneeR1", "ankleR1", "footR1", "hipR2", "kneeR2", "ankleR2", "footR2", "hipR3", "kneeR3", "ankleR3", "footR3"],
      "floor": true,
      "budget": 180
    },
    {
      "id": "neckHead",
      "builds": "The neck and head at the front. The neck: two parallel tubes about 0.14 apart in x rise from the neckBase mount on the spine, up and forward along the neck joint direction to the head joint, tubePale with tubeDark shading on the outer tube; braced by three short cross rungs and one thin rope diagonal, each rung tipped with a tapeYellow wrap, and a jointBlack collar at the base clamp. The head: riding the head joint, a short horizontal skull tube across x (about 0.3 long, radius 0.07, tubeMid) with jointBlack caps; from it the beak — two tapering tubes converging forward to a point about 0.35 ahead, tubePale, ending in a small jointBlack nose cone; on top of the skull a sail-fin crest: an extruded triangular fin about 0.3 tall and 0.4 long in sailAmber with a thin tapeRed trailing edge, its root seated in a jointBlack socket strip on the skull tube. Eyes: one round eye disc each side of the skull — a tubeDark disc 0.09 across with an eyeDark centre pupil and a thin sailCream ring, seated on the skull tube facing outward. A small red flagCrimson pennant (extruded triangle) flies from the beak tip on a 0.1 whisker tube. Two tapeYellow rings on each neck tube near the head.",
      "box": [[-0.45, 1.5, 1.25], [0.45, 2.65, 2.75]],
      "attaches": "Neck base clamps down on the spine at the neckBase mount and rides the neck and head joints; the beak reaches forward over the front hip mount to about z = 2.6, clear of the wind mast behind it.",
      "joints": ["neck", "head"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "windGear",
      "builds": "The wind engine on the back. A mast of two parallel tubes about 0.2 apart rises from the mastBase mount on the spine up to the wingAxleCenter mount at y = 2.42, tubePale with a jointBlack collar at the base and mid-clamp, braced by two rope diagonals down to the spine and one cross rung. At the top the wing: a horizontal boom tube running along x from x = -1.05 to x = 1.05, pivoting on the wingAxle joint (its bone, dir along x), tubeMid with jointBlack collars where it passes through the masthead. On the boom two large scalloped sail panels — extruded or membrane panels about 0.85 long and 0.75 deep in sailAmber, one each side of the mast, scallop cut along their outer edge, laced to the boom with three short rope loops each and a thin tubeDark spar along the panel's lower edge. Under the boom a rack of three bottleGreen wind-organ bottles (small lathe-shaped cylinders about 0.12 tall, necked at the top) lashed upright in a row along z with rope ties, hung just behind the mast. On a short axle sticking out from the mast front (+Z side, above the wing pivot) a four-blade propeller: two crossed thin blade pairs about 0.5 across in sailCream with tapeRed tips, on a small jointBlack hub, riding its own part of the wingAxle bone so it reads as the spinning drive. Yellow tape rings at every tube junction; a tapeRed band where the boom meets the masthead.",
      "box": [[-1.15, 1.9, -1.7], [1.15, 2.7, 1.0]],
      "attaches": "Mast base clamps onto the spine top at the mastBase mount and rides the body joint; the wing boom pivots on the wingAxle joint at wingAxleCenter; the propeller axle sits on the mast front, forward of the wing pivot, clear of the neck part behind it at z > 1.25.",
      "joints": ["body", "wingAxle"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: legsPort -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegsPort({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const rod = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const collar = (at: number[], dir: number[], r: number, len: number, bone: any, col = P.jointBlack) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), col, { at, dir, bone });
  const wrap = (a: number[], c: number[], t: number, r: number, col: string, bone: any) => {
    const p = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), col, { at: p, dir: d, bone });
  };
  const lerp3 = (a: number[], c: number[], t: number) => [
    a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  const off = (p: number[], dz: number) => [p[0], p[1], p[2] + dz];

  const hips: number[][] = [];
  for (let i = 1; i <= 3; i++) {
    const hip = J["hipL" + i], knee = J["kneeL" + i], ankle = J["ankleL" + i], foot = J["footL" + i];
    const H = [hip.at.x, hip.at.y, hip.at.z];
    const K = [knee.at.x, knee.at.y, knee.at.z];
    const A = [ankle.at.x, ankle.at.y, ankle.at.z];
    const F = [foot.at.x, foot.at.y, foot.at.z];
    hips.push(H);

    // hip collar around the cross axle (along x)
    collar(H, [1, 0, 0], 0.085, 0.16, hip);
    // upper rods
    rod(off(H, -0.03), off(K, -0.03), 0.028, P.tubePale, hip);
    rod(off(H, 0.03), off(K, 0.03), 0.028, P.tubeMid, hip);
    rod(off(lerp3(H, K, 0.3), -0.03), off(lerp3(H, K, 0.3), 0.03), 0.015, P.tubeDark, hip);
    rod(off(lerp3(H, K, 0.8), -0.03), off(lerp3(H, K, 0.8), 0.03), 0.015, P.tubeDark, hip);
    b.rod(off(lerp3(H, K, 0.3), -0.03), off(lerp3(H, K, 0.8), 0.03), 0.007, P.rope, { bone: hip, sides: 5 });
    wrap(off(H, 0), off(K, 0), 0.5, 0.045, P.tapeYellow, hip);
    // counterweight on outer thigh
    const cw = lerp3(H, K, 0.45);
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.08), P.steelBlock, { at: [cw[0] + 0.06, cw[1], cw[2]], bone: hip });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.012), P.tapeRed, { at: [cw[0] + 0.09, cw[1], cw[2] + 0.04], bone: hip });

    // knee
    collar(K, [1, 0, 0], 0.075, 0.15, knee);
    rod(off(K, -0.03), off(A, -0.03), 0.026, P.tubeMid, knee);
    rod(off(K, 0.03), off(A, 0.03), 0.026, P.tubeDark, knee);
    rod(off(lerp3(K, A, 0.35), -0.03), off(lerp3(K, A, 0.35), 0.03), 0.014, P.tubeDark, knee);
    rod(off(lerp3(K, A, 0.65), -0.03), off(lerp3(K, A, 0.65), 0.03), 0.014, P.tubeDark, knee);
    b.rod(off(lerp3(K, A, 0.35), 0.03), off(lerp3(K, A, 0.65), -0.03), 0.007, P.rope, { bone: knee, sides: 5 });
    wrap(K, A, 0.8, 0.042, P.tapeRed, knee);

    // ankle and foot rod
    collar(A, [1, 0, 0], 0.07, 0.14, ankle);
    rod(A, F, 0.03, P.tubePale, ankle);

    // foot pad
    b.part(new THREE.BoxGeometry(0.18, 0.05, 0.3), P.footPad, { at: [F[0], 0.025, F[2] + 0.04], bone: foot });
    b.part(new THREE.BoxGeometry(0.18, 0.03, 0.08), P.footPad, {
      at: [F[0], 0.02, F[2] + 0.22], bone: foot, rotation: [-20, 0, 0] });
    for (const dx of [-0.05, 0.05])
      b.spike([F[0] + dx, 0.03, F[2] + 0.25], [0, 0, 1], 0.1, 0.022, { color: P.jointBlack, bone: foot, sides: 5 });
    collar([F[0], 0.075, F[2]], [1, 0, 0], 0.045, 0.1, foot);
  }

  // gallery tube along z linking hip collars
  b.rod([hips[0][0], 1.5, hips[0][2]], [hips[2][0], 1.5, hips[2][2]], 0.04, P.tubeDark, { bone: J.hipL2, sides: 6 });
  for (const t of [0.1, 0.35, 0.65, 0.9]) {
    const p = lerp3([hips[0][0], 1.5, hips[0][2]], [hips[2][0], 1.5, hips[2][2]], t);
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), P.tapeYellow, {
      at: p, dir: [0, 0, 1], bone: J.hipL2 });
  }
  void R; void frame;
}
```

<!-- call: neckHead -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildNeckHead({ b, J, P, M }: Ctx) {
  const neck = J.neck;
  const head = J.head;
  const EYE_DARK = "#14141a";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- helpers ----
  const ring = (p: THREE.Vector3, d: THREE.Vector3, r: number, len: number, color: string, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), color, { at: p, dir: d, bone });

  const tube = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any) =>
    b.rod(a, c, r, color, { bone, sides: 8 } as any);

  const base = V(M.neckBase[0], M.neckBase[1], M.neckBase[2]);
  const headAt = V(head.at.x, head.at.y, head.at.z);
  const dir = headAt.clone().sub(base).normalize();

  // ---- neck: two tubes ----
  const sides = [1, -1];
  const ends: Record<number, THREE.Vector3[]> = {};
  for (const s of sides) {
    const a = V(s * 0.07, base.y, base.z);
    const c = V(s * 0.07, headAt.y - 0.03, headAt.z - 0.03);
    ends[s] = [a, c];
    tube(a, c, 0.045, s > 0 ? P.tubePale : P.tubeDark, neck);
    // base collar
    ring(a.clone().addScaledVector(dir, 0.04), dir, 0.065, 0.08, P.jointBlack, neck);
    // yellow rings near the head
    for (const t of [0.8, 0.9]) {
      const p = a.clone().lerp(c, t);
      ring(p, dir, 0.056, 0.035, P.tapeYellow, neck);
    }
    // top collar
    ring(c.clone().addScaledVector(dir, -0.03), dir, 0.058, 0.05, P.jointBlack, neck);
  }

  // ---- rungs ----
  const rungTs = [0.25, 0.52, 0.76];
  const pts = rungTs.map((t) => ends[1][0].clone().lerp(ends[1][1], t));
  for (const p of pts) {
    const l = V(0.07, p.y, p.z);
    const r = V(-0.07, p.y, p.z);
    b.rod(l, r, 0.02, P.tubeMid, { bone: neck } as any);
    for (const s of sides) ring(V(s * 0.07, p.y, p.z), V(1, 0, 0), 0.032, 0.03, P.tapeYellow, neck);
  }
  // rope diagonal
  const d1 = ends[1][0].clone().lerp(ends[1][1], 0.2);
  const d2 = ends[-1][0].clone().lerp(ends[-1][1], 0.8);
  b.rod(d1, d2, 0.008, P.rope, { bone: neck } as any);

  // ---- skull ----
  const hz = headAt;
  tube(V(0.15, hz.y, hz.z), V(-0.15, hz.y, hz.z), 0.07, P.tubeMid, head);
  for (const s of sides) {
    ring(V(s * 0.155, hz.y, hz.z), V(1, 0, 0), 0.076, 0.05, P.jointBlack, head);
  }

  // ---- beak: two tubes converging to a point ----
  const tip = V(0, hz.y - 0.02, hz.z + 0.35);
  for (const s of sides) {
    b.rod(V(s * 0.07, hz.y, hz.z + 0.05), V(s * 0.012, tip.y, tip.z - 0.03), [0.04, 0.015], P.tubePale, {
      bone: head,
    } as any);
  }
  b.part(new THREE.ConeGeometry(0.03, 0.08, 8), P.jointBlack, {
    at: V(0, tip.y, tip.z - 0.01),
    dir: V(0, 0, 1),
    bone: head,
  });
  // beak cross brace
  b.rod(V(0.04, hz.y - 0.005, hz.z + 0.2), V(-0.04, hz.y - 0.005, hz.z + 0.2), 0.014, P.tubeDark, { bone: head } as any);

  // ---- crest fin ----
  const crestBase = V(0, hz.y + 0.065, hz.z);
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.34), P.jointBlack, { at: crestBase, bone: head });
  b.extrude(
    [
      [-0.2, 0],
      [0.2, 0],
      [-0.05, 0.3],
    ],
    {
      at: V(0, hz.y + 0.075, hz.z),
      x: [0, 0, 1],
      thickness: 0.02,
      color: P.sailAmber,
      bone: head,
    },
  );
  // red trailing edge along rear slope (from (-0.2,0) to (-0.05,0.3))
  b.rod(V(0, hz.y + 0.075, hz.z - 0.2), V(0, hz.y + 0.375, hz.z - 0.05), 0.012, P.tapeRed, { bone: head } as any);

  // ---- eyes ----
  for (const s of sides) {
    const out = V(s, 0, 0);
    const c = V(s * 0.19, hz.y + 0.005, hz.z + 0.0);
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 12), P.sailCream, { at: c, dir: out, bone: head });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 12), P.tubeDark, {
      at: c.clone().addScaledVector(out, 0.003),
      dir: out,
      bone: head,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), EYE_DARK, {
      at: c.clone().addScaledVector(out, 0.007),
      dir: out,
      bone: head,
    });
  }

  // ---- whisker + pennant ----
  const wEnd = V(0, tip.y + 0.04, tip.z + 0.1);
  b.rod(V(0, tip.y, tip.z + 0.03), wEnd, 0.008, P.jointBlack, { bone: head } as any);
  b.extrude(
    [
      [0, -0.06],
      [0, 0.06],
      [0.2, 0],
    ],
    {
      at: wEnd,
      x: [0, 0, 1],
      thickness: 0.01,
      color: P.flagCrimson,
      bone: head,
    },
  );
}
```

<!-- call: legsStarboard -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildLegsStarboard({ b, J, P }: Ctx) {
  const R = rng(11);
  const v = (j: any) => new THREE.Vector3(...(j.at as number[]));
  const off = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(new THREE.Vector3(x, y, z));

  // tube between two points on a bone
  const tube = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  // collar ring around a point, axis along x
  const collar = (p: THREE.Vector3, r: number, len: number, col: string, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), col, { bone, at: p, dir: [1, 0, 0] });
  // wrap ring placed on a segment at t
  const wrap = (a: THREE.Vector3, c: THREE.Vector3, t: number, r: number, col: string, bone: any) => {
    const p = a.clone().lerp(c, t);
    const d = c.clone().sub(a).normalize();
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), col, { bone, at: p, dir: [d.x, d.y, d.z] });
  };

  const names: [string, string, string, string][] = [
    ["hipR1", "kneeR1", "ankleR1", "footR1"],
    ["hipR2", "kneeR2", "ankleR2", "footR2"],
    ["hipR3", "kneeR3", "ankleR3", "footR3"],
  ];

  const hips: THREE.Vector3[] = [];
  names.forEach(([hn, kn, an, fn]) => {
    const hip = J[hn], knee = J[kn], ankle = J[an], foot = J[fn];
    const H = v(hip), K = v(knee), A = v(ankle), F = v(foot);
    hips.push(H);
    const dz = 0.03;

    // hip socket collar
    collar(H, 0.075, 0.16, P.jointBlack, hip);
    collar(off(H, -0.1, 0, 0), 0.05, 0.05, P.tapeYellow, hip);

    // upper rods
    const u1a = off(H, 0, 0, dz), u1b = off(K, 0, 0, dz);
    const u2a = off(H, 0, 0, -dz), u2b = off(K, 0, 0, -dz);
    tube(u1a, u1b, 0.028, P.tubePale, hip);
    tube(u2a, u2b, 0.028, P.tubeMid, hip);
    // short strut and rope diagonal
    const s1 = u1a.clone().lerp(u1b, 0.35), s2 = u2a.clone().lerp(u2b, 0.35);
    tube(s1, s2, 0.014, P.tubeDark, hip);
    tube(u1a.clone().lerp(u1b, 0.2), u2a.clone().lerp(u2b, 0.8), 0.008, P.rope, hip);
    wrap(H, K, 0.5, 0.04, P.tapeYellow, hip);

    // counterweight on outer (-x) thigh
    const cw = H.clone().lerp(K, 0.4);
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.08), P.steelBlock, { bone: hip, at: off(cw, -0.05, 0, 0) });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.02), P.tapeRed, { bone: hip, at: off(cw, -0.08, 0, 0.035) });

    // knee collar
    collar(K, 0.065, 0.14, P.jointBlack, knee);

    // lower rods
    const l1a = off(K, 0, 0, dz), l1b = off(A, 0, 0, dz);
    const l2a = off(K, 0, 0, -dz), l2b = off(A, 0, 0, -dz);
    tube(l1a, l1b, 0.026, P.tubeMid, knee);
    tube(l2a, l2b, 0.026, P.tubeDark, knee);
    tube(l1a.clone().lerp(l1b, 0.5), l2a.clone().lerp(l2b, 0.5), 0.013, P.tubePale, knee);
    tube(l1a.clone().lerp(l1b, 0.15), l2a.clone().lerp(l2b, 0.85), 0.008, P.rope, knee);
    wrap(K, A, 0.82, 0.042, P.tapeRed, knee);
    wrap(K, A, 0.45, 0.038, P.tapeYellow, knee);

    // ankle collar and foot rod
    collar(A, 0.06, 0.12, P.jointBlack, ankle);
    tube(A, off(F, 0, 0.06, 0), 0.026, P.tubePale, ankle);
    wrap(A, F, 0.5, 0.04, P.tapeYellow, ankle);

    // foot pad: flat slab on floor with toe bevel
    const fz = F.z + 0.02;
    b.part(new THREE.BoxGeometry(0.18, 0.04, 0.3), P.footPad, { bone: foot, at: [F.x, 0.02, fz] });
    b.part(new THREE.BoxGeometry(0.18, 0.025, 0.07), P.footPad, {
      bone: foot, at: [F.x, 0.02, fz + 0.17], rotation: [-18, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), P.jointBlack, { bone: foot, at: [F.x, 0.065, F.z], dir: [1, 0, 0] });
    for (const sx of [-0.05, 0.05])
      b.spike([F.x + sx, 0.03, fz + 0.2], [0, -0.1, 1], 0.1, 0.018, { color: P.jointBlack, bone: foot });
    // red accent edge stripe on pad
    b.part(new THREE.BoxGeometry(0.18, 0.006, 0.02), P.tapeRed, { bone: foot, at: [F.x, 0.043, fz - 0.12] });
    void R;
  });

  // gallery tube linking hip collars at y=1.5
  const gal = b.sweep(
    [off(hips[0], 0, 0, 0.1).toArray(), hips[0].toArray(), hips[1].toArray(), hips[2].toArray(), off(hips[2], 0, 0, -0.1).toArray()],
    0.032,
    { color: P.tubeDark, bone: [J.hipR3, J.hipR2, J.hipR1], sides: 6 },
  );
  void gal;
  const wraps = [0.75, 0.25, 0.5, 0.0, -0.75, -0.25];
  void wraps;
  for (const h of hips) {
    for (const dz of [-0.35, 0.35]) {
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), P.tapeYellow, {
        bone: h === hips[0] ? J.hipR1 : h === hips[1] ? J.hipR2 : J.hipR3,
        at: [h.x, h.y, h.z + dz],
        dir: [0, 0, 1],
      });
    }
  }
}
```

<!-- call: spine -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, polyline } from "agentic-3js-builder";

export function buildSpine({ b, J, P, M }: any) {
  const body = J.body;
  const tail = J.tail;
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  // ---- main spine tube, skinned over body and tail joints ----
  const spinePath = catmull([
    [0, 1.5, 1.5],
    [0, 1.5, 0.6],
    [0, 1.5, -0.6],
    [0, 1.45, -1.5],
    [0, 1.35, -2.2],
  ]);
  b.sweep(spinePath, (t: number) => 0.16 - 0.06 * t, {
    bone: [tail, body],
    color: P.tubePale,
    sides: 8,
  });

  const zAt = (z: number) => {
    // y of spine centre at z (approx linear from the path)
    if (z > 0.6) return 1.5;
    if (z > -0.6) return 1.5;
    if (z > -1.5) return 1.5 - 0.05 * ((-0.6 - z) / 0.9);
    return 1.45 - 0.1 * ((-1.5 - z) / 0.7);
  };
  const rAt = (z: number) => 0.16 - 0.06 * ((1.5 - z) / 3.7);

  // ---- cuffs and tape rings along the spine ----
  const stations = [1.4, 0.8, 0, -0.8, -1.55];
  const ringAt = (z: number, r: number, len: number, color: string, bone: any) => {
    const y = zAt(z);
    b.part(new THREE.CylinderGeometry(r, r, len, 10), color, {
      bone,
      at: [0, y, z],
      dir: [0, 0, 1],
    });
  };
  stations.forEach((z) => {
    const bone = z < -1.9 ? tail : body;
    ringAt(z, rAt(z) + 0.035, 0.1, P.jointBlack, bone);
  });
  for (let i = 0; i < stations.length - 1; i++) {
    const z = (stations[i] + stations[i + 1]) / 2;
    ringAt(z, rAt(z) + 0.02, 0.05, P.tapeYellow, body);
  }

  // ---- keel triangle ----
  const keelY = 1.0;
  const keel: number[][] = [];
  for (const [zTop, zBot] of [
    [1.0, 0.55],
    [-1.6, -1.1],
  ]) {
    for (const s of [1, -1]) {
      b.rod([s * 0.1, 1.38, zTop], [s * 0.1, keelY, zBot], 0.035, P.tubeMid, { bone: body });
    }
    b.rod([-0.1, keelY, zBot], [0.1, keelY, zBot], 0.035, P.tubeMid, { bone: body });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8), P.jointBlack, {
      bone: body,
      at: [0, keelY, zBot],
      dir: [1, 0, 0],
    });
    keel.push([0, keelY, zBot]);
  }
  // keel long bottom tie and diagonal ropes
  b.rod([0, keelY, 0.55], [0, keelY, -1.1], 0.03, P.tubeMid, { bone: body });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.38, 1.0], [s * 0.1, keelY, -1.1], 0.012, P.rope, { bone: body });
    b.rod([s * 0.1, 1.38, -1.6], [s * 0.1, keelY, 0.55], 0.012, P.rope, { bone: body });
  }

  // ---- hip cross-axles ----
  for (const m of [M.hipFront, M.hipMid, M.hipRear]) {
    const [x, y, z] = m;
    b.rod([-0.6, y, z], [0.6, y, z], 0.045, P.tubeDark, { bone: body });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 10), P.jointBlack, {
      bone: body,
      at: [x, y, z],
      dir: [1, 0, 0],
    });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.07, 10), P.tapeYellow, {
        bone: body,
        at: [s * 0.5, y, z],
        dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 8), P.jointBlack, {
        bone: body,
        at: [s * 0.61, y, z],
        dir: [1, 0, 0],
      });
    }
  }

  // ---- ribs ----
  for (const z of [0.8, -0.8]) {
    const y = zAt(z);
    for (const s of [1, -1]) {
      b.rod([s * 0.1, y, z], [s * 0.34, y, z], 0.028, P.tubeMid, { bone: body });
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), P.tapeRed, {
        bone: body,
        at: [s * 0.34, y, z],
        dir: [1, 0, 0],
      });
    }
  }

  // ---- neck / mast clamp pads on spine top ----
  for (const m of [M.neckBase, M.mastBase]) {
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.16), P.jointBlack, {
      bone: body,
      at: [0, zAt(m[2]) + rAt(m[2]) + 0.01, m[2]],
    });
  }

  // ---- tail: three splaying tubes ----
  const tb = V(M.tailBase);
  const len = 0.8;
  const ang = (12 * Math.PI) / 180;
  const tips: THREE.Vector3[] = [];
  [-1, 0, 1].forEach((k, i) => {
    const dir = new THREE.Vector3(Math.sin(ang) * k, -0.15 + (k === 0 ? 0 : 0.0), -Math.cos(ang)).normalize();
    const tip = tb.clone().addScaledVector(dir, len);
    tips.push(tip);
    const mid = tb.clone().addScaledVector(dir, len * 0.5);
    b.rod(tb, mid, [0.07, 0.055], P.tubePale, { bone: tail });
    b.rod(mid, tip, [0.055, 0.035], P.tubeDark, { bone: tail });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), P.tapeYellow, {
      bone: tail,
      at: tb.clone().addScaledVector(dir, len * 0.5),
      dir: dir.toArray(),
    });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), P.jointBlack, { bone: tail, at: tip });
  });
  // tail root collar
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.1, 10), P.jointBlack, {
    bone: tail,
    at: [0, tb.y, tb.z],
    dir: [0, 0, 1],
  });

  // ---- red pennant at the centre tail tip ----
  const tip = tips[1];
  b.rod(tip, [tip.x, tip.y + 0.04, tip.z - 0.1], 0.012, P.tubeDark, { bone: tail });
  b.extrude(
    [
      [0, 0],
      [0.25, -0.05],
      [0, 0.14],
    ],
    {
      at: [tip.x, tip.y + 0.04, tip.z - 0.1],
      x: [0, 0, -1],
      thickness: 0.012,
      color: P.flagCrimson,
      bone: tail,
    },
  );
}
```

<!-- call: windGear -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWindGear({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = J.body;
  const axle = J.wingAxle;
  const mb = M.mastBase;
  const wc = M.wingAxleCenter;

  const tube = (a: number[], c: number[], r: number, col: string, bone: any = body) =>
    b.rod(a, c, r, col, { bone, sides: 6 });

  const ring = (p: number[], dir: number[], r: number, col: string, bone: any, len = 0.05) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), col, { bone, at: p, dir });

  const lerp3 = (a: number[], c: number[], t: number) => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // ---------- Mast ----------
  const top: number[] = [0, 2.36, 0.2];
  const mastDir = [top[0] - mb[0], top[1] - mb[1], top[2] - mb[2]];
  for (const s of [1, -1]) {
    const base = [s * 0.1, mb[1], mb[2]];
    const tp = [s * 0.1, top[1], top[2]];
    tube(base, tp, 0.035, s > 0 ? P.tubePale : P.tubeMid);
    ring(lerp3(base, tp, 0.5), mastDir, 0.05, P.tapeYellow, body, 0.05);
    ring(lerp3(base, tp, 0.88), mastDir, 0.05, P.tapeYellow, body, 0.05);
    // base collars
    ring(lerp3(base, tp, 0.04), mastDir, 0.065, P.jointBlack, body, 0.08);
    ring(lerp3(base, tp, 0.45), mastDir, 0.058, P.jointBlack, body, 0.06);
    // rope diagonals down to spine
    tube([s * 0.1, 2.15, -0.02], [s * 0.2, 1.62, -0.7], 0.009, P.rope);
    tube([s * 0.1, 2.15, 0.05], [s * 0.2, 1.62, 0.65], 0.009, P.rope);
  }
  // cross rung
  tube([-0.1, 2.12, 0.0], [0.1, 2.12, 0.0], 0.025, P.tubeMid);
  ring([0.1, 2.12, 0], [1, 0, 0], 0.04, P.tapeYellow, body, 0.04);
  ring([-0.1, 2.12, 0], [1, 0, 0], 0.04, P.tapeYellow, body, 0.04);
  // masthead block
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.12), P.jointBlack, { bone: body, at: [0, 2.33, 0.2] });

  // ---------- Boom ----------
  tube([-1.05, 2.42, 0.2], [1.05, 2.42, 0.2], 0.03, P.tubeMid, axle);
  for (const x of [-0.12, 0.12]) ring([x, 2.42, 0.2], [1, 0, 0], 0.055, P.jointBlack, axle, 0.07);
  for (const x of [-0.2, 0.2]) ring([x, 2.42, 0.2], [1, 0, 0], 0.05, P.tapeRed, axle, 0.05);
  for (const s of [1, -1]) {
    ring([s * 1.05, 2.42, 0.2], [1, 0, 0], 0.045, P.jointBlack, axle, 0.06);
    ring([s * 0.6, 2.42, 0.2], [1, 0, 0], 0.045, P.tapeYellow, axle, 0.04);
  }

  // ---------- Sails ----------
  for (const s of [1, -1]) {
    const outline: any[] = [
      [0.08, 0],
      [0.95, 0],
      [0.95, -0.2],
    ];
    // scalloped outer edge
    const n = 4;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      outline.push([0.95 - 0.1 - 0.05 * Math.sin(t * Math.PI), -0.2 - 0.0 - t * 0.5]);
      if (i < n) outline.push([0.95 - 0.2 * Math.sin((t + 0.125) * Math.PI) - 0.1, -0.2 - (t + 0.125) * 0.5 * 1.0 - 0.0]);
    }
    const sail = [
      [0.08, 0],
      [0.95, 0],
      [0.95, -0.12],
      [0.85, -0.2],
      [0.93, -0.3],
      [0.8, -0.4],
      [0.86, -0.5],
      [0.7, -0.6],
      [0.72, -0.7],
      [0.55, -0.75],
      [0.4, -0.7],
      [0.2, -0.72],
      [0.08, -0.6],
    ] as any;
    b.extrude(sail, {
      at: [s * 0.0, 2.42, 0.2],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: P.sailAmber,
      bone: axle,
    });
    // spar along lower edge
    tube([s * 0.1, 2.42 - 0.62, 0.2], [s * 0.72, 2.42 - 0.72, 0.2], 0.014, P.tubeDark, axle);
    // inner leading rib
    tube([s * 0.5, 2.42, 0.2], [s * 0.5, 2.42 - 0.72, 0.2], 0.01, P.tubeDark, axle);
    // lacing loops
    for (let i = 0; i < 3; i++) {
      const x = s * (0.22 + i * 0.28);
      b.part(new THREE.TorusGeometry(0.035, 0.007, 4, 8), P.rope, {
        bone: axle,
        at: [x, 2.42, 0.2],
        dir: [1, 0, 0],
        axis: "z",
      });
      b.part(new THREE.TorusGeometry(0.035, 0.007, 4, 8), P.rope, {
        bone: axle,
        at: [x, 2.42, 0.2],
        dir: [0, 0, 1],
        axis: "z",
      });
    }
    // tape stripe on the sail
    b.part(new THREE.BoxGeometry(0.5, 0.04, 0.026), P.tapeRed, {
      bone: axle,
      at: [s * 0.55, 2.42 - 0.12, 0.2],
    });
  }

  // ---------- Bottle organ ----------
  const prof: any[] = [
    [0, 0],
    [0.045, 0],
    [0.05, 0.02],
    [0.05, 0.08],
    [0.03, 0.1],
    [0.02, 0.15],
    [0.02, 0.18],
    [0, 0.18],
  ];
  for (let i = 0; i < 3; i++) {
    const z = -0.2 - i * 0.2 + 0.0;
    const x = 0;
    const by = 2.2;
    b.lathe(prof, { at: [x, by, z - 0.05], color: P.bottleGreen, bone: body, segments: 7 });
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 7), P.jointBlack, {
      bone: body,
      at: [x, by + 0.186, z - 0.05],
    });
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.02, 7), P.rope, {
      bone: body,
      at: [x, by + 0.07, z - 0.05],
    });
  }
  // rack rails
  tube([0, 2.28, -0.18], [0, 2.28, -0.78], 0.015, P.tubeDark);
  tube([0, 2.2, -0.15], [0, 2.2, -0.82], 0.012, P.tubeDark);
  for (const z of [-0.2, -0.8]) tube([0, 2.2, z], [0, 2.38, 0.0], 0.008, P.rope);

  // ---------- Propeller ----------
  const hubZ = 0.55;
  const hubY = 2.62;
  tube([0, 2.36, 0.2], [0, hubY, 0.2], 0.03, P.tubePale);
  tube([0, hubY, 0.2], [0, hubY, hubZ], 0.022, P.tubeMid);
  tube([0, 2.36, 0.2], [0, hubY, hubZ], 0.012, P.rope);
  ring([0, hubY, 0.2], [0, 0, 1], 0.045, P.tapeYellow, body, 0.04);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 8), P.jointBlack, {
    bone: axle,
    at: [0, hubY, hubZ],
    dir: [0, 0, 1],
  });
  b.part(new THREE.ConeGeometry(0.045, 0.1, 8), P.jointBlack, {
    bone: axle,
    at: [0, hubY, hubZ + 0.08],
    dir: [0, 0, 1],
  });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const blade = [
      [0.05, -0.04],
      [0.25, -0.07],
      [0.25, 0.06],
      [0.05, 0.04],
    ] as any;
    // blade drawn along local x, rotated around z by choosing x axis direction
    b.extrude(blade, {
      at: [0, hubY, hubZ],
      x: [dx, dy, 0],
      y: [-dy, dx, 0],
      thickness: 0.012,
      color: P.sailCream,
      bone: axle,
    });
    // red tip
    b.part(new THREE.BoxGeometry(0.06, 0.13, 0.016), P.tapeRed, {
      bone: axle,
      at: [dx * 0.23, hubY + dy * 0.23, hubZ],
      dir: [dx, dy, 0],
      axis: "y",
      rotation: undefined,
    } as any);
  }
}
```