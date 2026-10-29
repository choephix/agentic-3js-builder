<!-- call: plan -->

```json
{
  "name": "Animaris Ventus — Wind-Walking Strandbeest",
  "description": "A Theo Jansen-style kinetic beach creature: a pale-yellow PVC tube lattice spine standing on four triangulated tube legs, topped with a wind-catching yellow sail rig, a front rotor wind-organ and a ruddered tail.",
  "builderName": "strandbeest",
  "size": [2.2, 2.6, 5.2],
  "layout": "A wind-walking tube animal built entirely from cylinders-as-tubes, flat membranes and small fittings; nothing is smoothed, every joint is a visible coupling disc or zip-tie collar. From the front (+Z): a circular wind rotor (a ring of 8 flat paddle blades on a tube A-frame, hub at [0, 2.0, 2.1]) reads as the head. Behind it the hull is a shallow rectangular tube truss: two parallel top rails at x = ±0.28 arcing from y 1.52 at the front to y 1.62 mid-body down to y 1.45 at the rear, over lower rails at y 1.08, cross-rung every ~0.4 m from z -2.1 to z 1.85, with thin diagonal braces; a mid keel tube runs under the top rails. The four legs are the signature: at each hip mount [±0.55, 1.08, z] (front z 1.05, rear z -1.35) a lattice of yellow PVC tubes — thigh out to the knee [±0.95, 0.70, z+0.18], shank back down to the ankle [±0.72, 0.16, z-0.05], and a straight top strut hip-to-ankle closing the triangle — plus one secondary brace and a flat triangular shin web plate; each leg ends in a wide dark foot pad flat on the sand with three transverse teal grip bars. Above the mid-deck a mast rises from [0, 1.6, 0.1] to [0, 2.5, 0.1] carrying two triangular yellow sails (a forward one to a bow spreader at [0, 2.15, 1.1], an aft one to [0, 2.2, -1.2]), each with three tube battens, ink edge seams, and two horizontal wing spars reaching to x = ±1.0 at y 2.2 with small hanging membrane panels and thin ink guy lines. At the rear, two tail tubes drop back from [0, 1.7, -2.15] to [±0.15, 1.35, -2.55] braced by a cross strut, carrying a vertical sail-cloth rudder fin (peaking at y 2.5 around z -2.4) with a small orange pennant at its top and thin ink steering drag-lines running forward to the rear hips. The only parts touching y = 0 are the four foot pads; everything else stands above. Style on every part: pale PVC yellow tubes with white coupling discs and dark zip-tie collars at every connection, yellow sail cloth, dark feet and hardware, a single orange-red accent for the pennant and blade tips, small teal details — flat colours throughout, low-poly, joints and struts slightly oversized so the machine reads as a walking skeleton.",
  "palette": {
    "pvc": "#e3c94f",
    "pvcShade": "#bfa22e",
    "sail": "#f2e489",
    "sailDeep": "#d8b83b",
    "ink": "#2c2c33",
    "bone": "#f4efe0",
    "steel": "#8a8f98",
    "accent": "#e2551f",
    "teal": "#2a8f8a"
  },
  "mounts": {
    "deckTop": [0, 1.62, 0.1],
    "mastBase": [0, 1.6, 0.1],
    "hipFL": [0.55, 1.08, 1.05],
    "hipFR": [-0.55, 1.08, 1.05],
    "hipBL": [0.55, 1.08, -1.35],
    "hipBR": [-0.55, 1.08, -1.35],
    "rotorHub": [0, 2.0, 2.1],
    "tailRoot": [0, 1.7, -2.15]
  },
  "joints": [
    { "name": "core", "at": [0, 1.3, 0.2], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spineF", "parent": "core", "at": [0, 1.55, 1.25], "dir": [0, 0.1, 1], "role": "spine" },
    { "name": "spineB", "parent": "core", "at": [0, 1.5, -1.45], "dir": [0, 0, -1], "role": "spine" },
    { "name": "mastTop", "parent": "spineF", "at": [0, 2.5, 0.1], "dir": [0, 1, 0], "role": "spine" },
    { "name": "rotorHub", "parent": "spineF", "at": [0, 2.0, 2.1], "dir": [0, 0, 1], "role": "hinge" },
    { "name": "tailRoot", "parent": "spineB", "at": [0, 1.7, -2.15], "dir": [0, 0.25, -1], "role": "tail" },
    { "name": "hipFL", "parent": "spineF", "at": [0.55, 1.08, 1.05], "dir": [0.4, -0.75, 0.2], "role": "leg" },
    { "name": "kneeFL", "parent": "hipFL", "at": [0.95, 0.7, 1.23], "dir": [-0.3, -0.85, -0.3], "role": "leg" },
    { "name": "ankleFL", "parent": "kneeFL", "at": [0.72, 0.16, 1.0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipFR", "parent": "spineF", "at": [-0.55, 1.08, 1.05], "dir": [-0.4, -0.75, 0.2], "role": "leg" },
    { "name": "kneeFR", "parent": "hipFR", "at": [-0.95, 0.7, 1.23], "dir": [0.3, -0.85, -0.3], "role": "leg" },
    { "name": "ankleFR", "parent": "kneeFR", "at": [-0.72, 0.16, 1.0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipBL", "parent": "spineB", "at": [0.55, 1.08, -1.35], "dir": [0.4, -0.75, -0.2], "role": "leg" },
    { "name": "kneeBL", "parent": "hipBL", "at": [0.95, 0.7, -1.17], "dir": [-0.3, -0.85, 0.3], "role": "leg" },
    { "name": "ankleBL", "parent": "kneeBL", "at": [0.72, 0.16, -1.4], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipBR", "parent": "spineB", "at": [-0.55, 1.08, -1.35], "dir": [-0.4, -0.75, -0.2], "role": "leg" },
    { "name": "kneeBR", "parent": "hipBR", "at": [-0.95, 0.7, -1.17], "dir": [0.3, -0.85, 0.3], "role": "leg" },
    { "name": "ankleBR", "parent": "kneeBR", "at": [-0.72, 0.16, -1.4], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "spineHull",
      "builds": "The main tube truss that everything else hangs from. Two parallel top rails (tubes radius ~0.035) at x = ±0.28 running from z 1.85 to z -2.1, each arcing gently: y 1.52 at the front, rising to 1.62 around z 0.3, easing to 1.45 at the rear; sweep them as smooth tube sweeps in pvc with a few pvcShade coupling sleeves. Two lower rails at x = ±0.28, y 1.08, same z range, in pvcShade. Cross-rung tubes every ~0.4 m of z connecting top to lower rails on both sides (pvc), plus a central keel tube at x = 0, y 1.05 running z 1.6 to -1.9. Thin diagonal brace tubes (radius 0.018, pvcShade) zig-zagging between rungs on each side for the lattice look. At every rail-rung intersection place a small bone-coloured coupling disc (short cylinder radius 0.055, thickness 0.02) and, on about one third of them, an ink zip-tie collar ring (torus or short cylinder radius 0.045) for the taped-together look. Four hip socket brackets of bone colour where the hip mounts sit: short horizontal tube stubs from the rails out to each hipFL/hipFR/hipBL/hipBR mount point, ending in a coupling disc the leg part builds onto. Bow: the front rails converge toward spineF with a transverse bumper tube at z 1.85. No mast, sails, rotor or tail here — those belong to their own parts; end the rails cleanly at the head and tail mounts.",
      "box": [[-0.45, 1.0, -2.15], [0.45, 1.65, 1.9]],
      "attaches": "Owns the spine skeleton: rails hang on core, spineF and spineB. Delivers the hip socket brackets at mounts hipFL, hipFR, hipBL, hipBR for the legs part, the bow convergence toward spineF/rotorHub for the head part, the mastBase seating at the top of the truss around z 0.1 for the sails part, and the clean rail ends at spineB/tailRoot for the tail part.",
      "joints": ["core", "spineF", "spineB"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legLattice",
      "builds": "All four walking legs, identical in construction, mirrored left/right, front pair slightly longer-strided than rear pair. Each leg builds from its hip mount (hipFL/hipFR/hipBL/hipBR): a hip coupling cluster (bone-coloured disc radius 0.07 plus an ink zip collar), then the Strandbeest triangle in pvc tubes radius 0.03 — thigh from hip to knee mount, shank from knee to ankle mount, and a straight top strut closing hip to ankle; plus one secondary thin brace (pvcShade radius 0.018) from mid-thigh to mid-shank, and a thin flat triangular shin web plate (sailDeep, thickness ~0.008, seated inside the triangle between the three struts) as the membrane panel every Animaris shin carries. At the knee: a bone coupling disc radius 0.06 on both sides of the joint with an ink zip collar. At the ankle: a smaller bone disc radius 0.05. Each leg ends in a foot pad: a flat ink-coloured rounded box or squashed cylinder ~0.34 wide (x) × 0.05 tall × 0.5 long (z), centred under its ankle so its underside sits exactly on y = 0, with three transverse teal grip bars (thin boxes across the pad top) and one small pvcShade strap tube over the ankle. Optional character detail per leg: a hand-written number tag (a small bone-coloured plate) on the shin web — front legs 1/2, rear legs 3/4. Keep all tube ends tucked into couplings so no tube floats free; the triangle silhouettes must read clearly from the side.",
      "box": [[-1.0, 0.0, -1.6], [1.0, 1.12, 1.35]],
      "attaches": "Builds onto the hip socket brackets at mounts hipFL, hipFR, hipBL, hipBR and rides the leg chains hipFL/kneeFL/ankleFL (and FR, BL, BR). The foot pads are the only floor contact of the whole model: their undersides rest exactly on y = 0.",
      "joints": ["hipFL", "kneeFL", "ankleFL", "hipFR", "kneeFR", "ankleFR", "hipBL", "kneeBL", "ankleBL", "hipBR", "kneeBR", "ankleBR"],
      "floor": true,
      "budget": 260
    },
    {
      "id": "sailRig",
      "builds": "The wind-catching rig above the deck. A central mast tube (pvc radius 0.045) from mount mastBase [0, 1.6, 0.1] up to mastTop [0, 2.5, 0.1], with a bone collar at the base and an ink zip ring at mid-height. Two triangular sails of sail-coloured membrane with sailDeep shading on their aft faces: a forward sail from the mast (spanning y 2.4 down to 1.75) out to a bow spreader tube tip at [0, 2.15, 1.1], and an aft sail out to [0, 2.2, -1.2]; give each sail three pvcShade tube battens crossing it horizontally (radius 0.015) and an ink seam tube along its trailing edge. From the mast at y 2.2, two horizontal wing spars (pvc radius 0.028) reach out to x = ±1.0; from each spar hang two small rectangular membrane panels (sail, sailDeep lower half, ink hem) like the flapping wing mats of a strandbeest, and a thin ink guy line runs from each spar tip diagonally down to the deck rails around z -0.4. Top the mast with a small bone cap and a short orange accent pennant tube at the very tip. Sails should read as taut flat cloth — flat membranes, no sag geometry — with the battens clearly seated on the surface.",
      "box": [[-1.05, 1.6, -1.35], [1.05, 2.6, 1.15]],
      "attaches": "The mast seats at mount mastBase on the spineHull truss and rides joints mastTop and spineF. Spar guy lines land on the spineHull deck rails; nothing reaches into the head or tail boxes.",
      "joints": ["spineF", "mastTop"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "rotorHead",
      "builds": "The head of the machine: a wind rotor on an A-frame. The frame: two pvc tubes radius 0.03 rising from the front rail ends of the hull near spineF (around [±0.28, 1.55, 1.7]) converging to the rotorHub mount [0, 2.0, 2.1], cross-braced by one horizontal tube between them at y 1.75 and one diagonal each side (pvcShade), all ends in bone couplings. The rotor itself rides the rotorHub joint: a steel axle stub along z (radius 0.02, length 0.3), a bone hub disc radius 0.09 with an ink centre bolt, a shallow torus-like rim ring of pvc tube radius 0.52 around the axle plane (build it as a swept tube along a circle, 8-10 segments so it stays low-poly), and 8 flat paddle blades between hub and rim — thin steel plates ~0.06 × 0.4 with accent-coloured tip caps (small boxes), each blade set at a slight pitch angle so the fan reads as a wind organ; phase the blades evenly. Behind the rotor, two short antennae tubes from the frame top spread in a V (pvc radius 0.015) with tiny teal pennant flags (small flat quads) at their tips, and a small bone-coloured nameplate on the frame cross tube. The rotor, frame and antennae are the whole head: no face, the machine's character is the fan.",
      "box": [[-0.6, 1.45, 1.85], [0.6, 2.55, 2.62]],
      "attaches": "The A-frame feet land on the spineHull front rails around spineF and its apex carries the rotor at mount rotorHub, riding joints spineF and rotorHub. Its rear face stays clear of the sailRig box except along the shared boundary at z 1.85.",
      "joints": ["spineF", "rotorHub"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "tailRudder",
      "builds": "The rear assembly: steering tail and rudder. From mount tailRoot [0, 1.7, -2.15]: two pvc tubes radius 0.03 angling down and back to [±0.15, 1.35, -2.55], joined by a horizontal cross tube at their tips and one diagonal brace back to the hull's rear rails (pvcShade), all with bone couplings and ink zip collars. Rising between them, a vertical rudder fin: a flat sailDeep membrane/plate in the shape of a swept-back fin, roughly 0.55 long (z) and 0.8 tall, from y 1.45 up to a peak at y 2.5 around z -2.4, with an ink edge seam tube along its top and trailing edges and one pvcShade batten across it. A short orange pennant flag (small flat quad) flies from the fin peak on a stub mast. Two thin ink steering drag-lines run from the fin's lower corners forward along the hull sides to near mounts hipBL/hipBR, as slack-curved thin tubes (radius 0.008). A small bone tail-light disc on the fin's rear face finishes it.",
      "box": [[-0.5, 1.3, -2.6], [0.5, 2.55, -2.05]],
      "attaches": "Roots at mount tailRoot on the spineHull rear rail convergence, riding joints spineB and tailRoot. The drag-lines reach forward along the hull sides toward mounts hipBL/hipBR but stay clear of the leg boxes except at their endpoints.",
      "joints": ["spineB", "tailRoot"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legLattice -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegLattice({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const PVC = P.pvc, SHADE = P.pvcShade, BONE = P.bone, INK = P.ink, TEAL = P.teal, WEB = P.sailDeep;

  const disc = (at: number[], r: number, bone: any, dir: number[] = [1, 0, 0], color = BONE, t = 0.02) =>
    b.part(new THREE.CylinderGeometry(r, r, t, 10), color, { bone, at, dir });

  const legs = [
    { n: "FL", s: 1, z: 1.05, k: 0.18, a: -0.05 },
    { n: "FR", s: -1, z: 1.05, k: 0.18, a: -0.05 },
    { n: "BL", s: 1, z: -1.35, k: 0.18, a: -0.05 },
    { n: "BR", s: -1, z: -1.35, k: 0.18, a: -0.05 },
  ];
  let tag = 1;
  for (const L of legs) {
    const s = L.s;
    const hipJ = J["hip" + L.n], kneeJ = J["knee" + L.n], ankJ = J["ankle" + L.n];
    const stride = L.z > 0 ? 1.1 : 1;
    const hip = [s * 0.55, 1.08, L.z];
    const knee = [s * 0.95, 0.7, L.z + L.k * stride];
    const ank = [s * 0.72, 0.16, L.z + L.a];
    const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
      b.rod(a, c, r, col, { bone, sides: 6 });

    // hip socket
    disc(hip, 0.07, hipJ, [1, 0, 0]);
    b.part(new THREE.TorusGeometry(0.06, 0.008, 5, 12), INK, { bone: hipJ, at: hip, dir: [1, 0, 0], axis: "z" });

    // triangle
    tube(hip, knee, 0.03, PVC, hipJ);
    tube(knee, ank, 0.03, PVC, kneeJ);
    tube(hip, ank, 0.03, PVC, hipJ);

    // secondary brace
    const m1 = V(hip).lerp(V(knee), 0.5).toArray();
    const m2 = V(knee).lerp(V(ank), 0.5).toArray();
    tube(m1, m2, 0.018, SHADE, kneeJ);

    // shin web: triangle hip-knee-ankle shrunk toward centroid
    const c = V(hip).add(V(knee)).add(V(ank)).multiplyScalar(1 / 3);
    const sh = (p: number[]) => V(p).lerp(c, 0.22).toArray();
    b.slab([sh(hip), sh(knee), sh(ank)], { color: WEB, thickness: 0.008, bone: kneeJ });

    // number tag
    b.part(new THREE.BoxGeometry(0.012, 0.07, 0.06), BONE, {
      bone: kneeJ,
      at: [c.x + s * 0.012, c.y, c.z],
    });
    for (let i = 0; i < tag; i++)
      b.part(new THREE.BoxGeometry(0.014, 0.04, 0.006), INK, {
        bone: kneeJ,
        at: [c.x + s * 0.016, c.y, c.z - 0.02 + i * 0.02 - (tag - 1) * 0.01],
      });
    tag++;

    // knee couplings, both sides
    for (const o of [-1, 1]) disc([knee[0] + o * 0.035, knee[1], knee[2]], 0.06, kneeJ, [1, 0, 0]);
    b.part(new THREE.TorusGeometry(0.052, 0.008, 5, 12), INK, { bone: kneeJ, at: knee, dir: [1, 0, 0], axis: "z" });

    // ankle
    disc(ank, 0.05, ankJ, [1, 0, 0]);

    // foot pad
    const padY = 0.025;
    const pad = [ank[0], padY, ank[2]];
    b.part(new THREE.BoxGeometry(0.34, 0.05, 0.5), INK, { bone: ankJ, at: pad });
    for (const dz of [-0.16, 0, 0.16])
      b.part(new THREE.BoxGeometry(0.32, 0.012, 0.03), TEAL, { bone: ankJ, at: [pad[0], 0.056, pad[2] + dz] });
    // ankle strap down to pad
    tube([ank[0], ank[1] - 0.02, ank[2]], [ank[0], 0.05, ank[2]], 0.02, SHADE, ankJ);
    b.part(new THREE.TorusGeometry(0.035, 0.01, 5, 10), SHADE, {
      bone: ankJ, at: [ank[0], 0.1, ank[2]], dir: [0, 1, 0], axis: "z",
    });
  }
}
```

<!-- call: tailRudder -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTailRudder({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const root = M.tailRoot;
  const bone = J.tailRoot;
  const disc = (at: number[], r = 0.055, dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.02, 8), P.bone, { bone, at, dir });
  const collar = (at: number[], dir: number[], r = 0.042) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.025, 8), P.ink, { bone, at, dir });

  // tail tubes
  for (const s of [1, -1]) {
    const tip = [s * 0.15, 1.35, -2.55];
    b.rod(root, tip, 0.03, P.pvc, { bone });
    disc(root, 0.06);
    disc(tip, 0.05);
    const d = [tip[0] - root[0], tip[1] - root[1], tip[2] - root[2]];
    const m = [root[0] + d[0] * 0.5, root[1] + d[1] * 0.5, root[2] + d[2] * 0.5];
    collar(m, d);
    collar([root[0] + d[0] * 0.2, root[1] + d[1] * 0.2, root[2] + d[2] * 0.2], d);
    // diagonal brace forward to hull rear rails
    b.rod([s * 0.28, 1.5, -2.1], [s * 0.15, 1.38, -2.5], 0.018, P.pvcShade, { bone });
    disc([s * 0.28, 1.5, -2.1], 0.05, [1, 0, 0]);
  }
  // cross tube
  b.rod([0.15, 1.35, -2.55], [-0.15, 1.35, -2.55], 0.028, P.pvc, { bone });
  collar([0, 1.35, -2.55], [1, 0, 0]);
  // cross strut near root
  b.rod([0.07, 1.54, -2.33], [-0.07, 1.54, -2.33], 0.02, P.pvcShade, { bone });

  // fin outline in (z-forward-x, y) drawn along -Z so x: [0,0,-1]
  const fin = [
    [0, 1.45],
    [0.55, 1.45],
    [0.4, 1.8],
    [0.2, 2.5],
    [0.12, 2.5],
    [-0.0, 1.9],
  ] as [number, number][];
  // x axis runs backward (-Z); origin at z=-2.05 front edge
  const fp = (u: number, v: number) => [0, v, -2.05 - u];
  const finP = b.extrude(
    fin.map(([u, v]) => [u, v - 1.45] as [number, number]),
    { at: [0, 1.45, -2.05], x: [0, 0, -1], thickness: 0.02, color: P.sailDeep, bone },
  );
  void finP;
  // seams along top/trailing edges
  const edge = [fin[1], fin[2], fin[3], fin[4]];
  for (let i = 0; i < edge.length - 1; i++) {
    const a = fp(edge[i][0], edge[i][1]);
    const c = fp(edge[i + 1][0], edge[i + 1][1]);
    b.rod(a, c, 0.012, P.ink, { bone });
  }
  b.rod(fp(0, 1.45), fp(0.55, 1.45), 0.012, P.ink, { bone });
  b.rod(fp(0, 1.45), fp(0.12, 2.5), 0.012, P.pvcShade, { bone });
  // batten
  b.rod(fp(0.02, 1.85), fp(0.43, 1.85), 0.016, P.pvcShade, { bone });
  b.rod(fp(0.02, 2.15), fp(0.3, 2.15), 0.014, P.pvcShade, { bone });
  // legs of fin into tail frame
  b.rod([0, 1.45, -2.15], [0, 1.45, -2.55], 0.022, P.pvc, { bone });

  // pennant mast + flag
  const peak = fp(0.16, 2.5);
  b.rod(peak, [0, 2.54, -2.21], 0.012, P.ink, { bone });
  b.extrude(
    [
      [0, 0],
      [0.22, 0.03],
      [0, 0.1],
    ],
    { at: [0, 2.44, -2.21], x: [0, 0, -1], thickness: 0.006, color: P.accent, bone },
  );
  disc([0, 2.54, -2.21], 0.02, [0, 1, 0]);

  // tail light on rear face
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), P.bone, {
    bone,
    at: [0.012, 1.7, -2.5],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), P.accent, {
    bone,
    at: [0.02, 1.7, -2.5],
    dir: [1, 0, 0],
  });

  // drag lines, slack
  for (const s of [1, -1]) {
    const a = [s * 0.012, 1.5, -2.3];
    const e = [s * 0.5, 1.12, -1.4];
    const mid = [s * 0.4, 1.2 + 0.0 - 0.06 * R(), -1.9];
    b.sweep(b.bezier ? b.bezier(a, mid, e) : [a, mid, e], 0.008, { color: P.ink, bone, sides: 5 } as any);
    collar(e, [1, 0, 0], 0.03);
  }
}
```

<!-- call: spineHull -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildSpineHull({ b, J, P, M }: any) {
  const PVC = P.pvc, SHADE = P.pvcShade, BONE = P.bone, INK = P.ink;
  const bones = [J.spineB, J.core, J.spineF];
  const Z0 = 1.85, Z1 = -2.1, X = 0.28, TR = 0.035;
  const topY = (z: number) => {
    // 1.52 at front, 1.62 at z 0.3, 1.45 at rear
    if (z >= 0.3) return 1.62 - (0.1 * (z - 0.3)) / (Z0 - 0.3);
    return 1.62 - (0.17 * (0.3 - z)) / (0.3 - Z1);
  };
  const boneFor = (z: number) => (z > 0.9 ? J.spineF : z < -0.9 ? J.spineB : J.core);

  const disc = (p: number[], axis: number[], r = 0.055, bone = J.core, color = BONE) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.02, 8), color, { at: p, dir: axis, bone });
  const collar = (p: number[], axis: number[], bone = J.core) =>
    b.part(new THREE.TorusGeometry(0.045, 0.01, 4, 8), INK, { at: p, dir: axis, axis: "z", bone });

  for (const s of [1, -1]) {
    const x = s * X;
    const pts: number[][] = [];
    for (let i = 0; i <= 8; i++) {
      const z = Z0 + ((Z1 - Z0) * i) / 8;
      pts.push([x, topY(z), z]);
    }
    b.sweep(catmull(pts), TR, { bone: bones, color: PVC, sides: 6 });
    b.sweep([[x, 1.08, Z0], [x, 1.08, Z1]], 0.03, { bone: bones, color: SHADE, sides: 6 });

    // sleeves on top rail
    for (const z of [1.3, 0.2, -0.9, -1.8]) {
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.12, 8), SHADE, {
        at: [x, topY(z), z], dir: [0, 0, 1], bone: boneFor(z),
      });
    }

    // rungs
    const zs: number[] = [];
    for (let z = 1.8; z > -2.15; z -= 0.4) zs.push(z);
    zs.forEach((z, i) => {
      const bn = boneFor(z);
      const ty = topY(z);
      b.rod([x, 1.08, z], [x, ty, z], 0.025, PVC, { bone: bn });
      disc([x, ty, z], [1, 0, 0], 0.055, bn);
      disc([x, 1.08, z], [1, 0, 0], 0.055, bn);
      if (i % 3 === 0) collar([x, ty - 0.1, z], [1, 0, 0], bn);
      // diagonals
      if (i < zs.length - 1) {
        const z2 = zs[i + 1];
        const a = i % 2 ? [x, ty, z] : [x, 1.08, z];
        const c = i % 2 ? [x, 1.08, z2] : [x, topY(z2), z2];
        b.rod(a, c, 0.018, SHADE, { bone: bn });
      }
    });

    // hip brackets
    for (const [mz, key] of [[1.05, "F"], [-1.35, "B"]] as [number, string][]) {
      const m = M["hip" + key + (s > 0 ? "L" : "R")];
      const bn = key === "F" ? J.spineF : J.spineB;
      b.rod([x, 1.08, mz], [m[0] - s * 0.04, m[1], m[2]], 0.03, BONE, { bone: bn });
      disc(m, [1, 0, 0], 0.07, bn);
      collar([m[0] - s * 0.06, m[1], m[2]], [1, 0, 0], bn);
    }
  }

  // cross rungs across the top and bottom
  for (const z of [1.8, 1.0, 0.2, -0.6, -1.4, -2.1]) {
    const bn = boneFor(z);
    b.rod([-X, topY(z), z], [X, topY(z), z], 0.025, PVC, { bone: bn });
    b.rod([-X, 1.08, z], [X, 1.08, z], 0.025, SHADE, { bone: bn });
  }

  // keel
  b.sweep([[0, 1.05, 1.6], [0, 1.05, -1.9]], 0.03, { bone: bones, color: PVC, sides: 6 });
  for (const z of [1.2, 0.2, -0.8, -1.7]) {
    b.rod([0, 1.05, z], [X, 1.08, z], 0.02, SHADE, { bone: boneFor(z) });
    b.rod([0, 1.05, z], [-X, 1.08, z], 0.02, SHADE, { bone: boneFor(z) });
    disc([0, 1.05, z], [0, 0, 1], 0.05, boneFor(z));
  }

  // bow bumper
  b.rod([-0.36, 1.5, 1.85], [0.36, 1.5, 1.85], 0.035, PVC, { bone: J.spineF });
  for (const s of [1, -1]) {
    disc([s * 0.36, 1.5, 1.85], [1, 0, 0], 0.055, J.spineF);
    b.rod([s * X, 1.52, 1.8], [s * 0.36, 1.5, 1.85], 0.03, PVC, { bone: J.spineF });
  }
  // mast seating plate
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 8), BONE, {
    at: [0, 1.625, 0.1], bone: J.core,
  });
  b.rod([-X, 1.62, 0.1], [X, 1.62, 0.1], 0.03, SHADE, { bone: J.core });
}
```

<!-- call: rotorHead -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRotorHead({ b, J, P, M }: Ctx) {
  const hub = M.rotorHub;
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const mid = (a: number[], c: number[]): [number, number, number] => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  const coupling = (p: number[], r: number, bone: any, collar = false) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.025, 10), P.bone, { bone, at: V(p[0], p[1], p[2]), dir: [0, 0, 1] });
    if (collar) b.part(new THREE.TorusGeometry(r * 0.8, 0.008, 5, 10), P.ink, { bone, at: V(p[0], p[1], p[2] + 0.02) });
  };

  // A-frame legs
  const feet: number[][] = [];
  for (const s of [1, -1]) {
    const foot = V(s * 0.28, 1.55, 1.7);
    feet.push(foot);
    b.rod(foot, hub, 0.03, P.pvc, { bone: J.spineF });
    coupling(foot, 0.06, J.spineF, true);
    // diagonal brace from foot to opposite frame midpoint
    const hi = V(s * 0.12, 1.75, 1.9);
    const lo = V(-s * 0.28, 1.55, 1.7);
    b.rod(lo, hi, 0.018, P.pvcShade, { bone: J.spineF });
    coupling(hi, 0.04, J.spineF);
  }
  coupling(hub.map((v, i) => (i === 2 ? v - 0.04 : v)), 0.06, J.spineF, true);

  // cross tube at y 1.75
  const xl = V(0.2, 1.75, 1.82), xr = V(-0.2, 1.75, 1.82);
  b.rod(xl, xr, 0.026, P.pvc, { bone: J.spineF });
  coupling(xl, 0.045, J.spineF, true);
  coupling(xr, 0.045, J.spineF, true);
  // nameplate
  b.part(new THREE.BoxGeometry(0.16, 0.06, 0.01), P.bone, { bone: J.spineF, at: V(0, 1.75, 1.865) });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.012), P.ink, { bone: J.spineF, at: V(0, 1.75, 1.87) });

  // antennae V with teal flags
  const apex = V(0, 2.0, 2.0);
  for (const s of [1, -1]) {
    const tip = V(s * 0.35, 2.5, 1.9);
    b.rod(V(s * 0.03, 1.98, 1.95), tip, 0.015, P.pvc, { bone: J.spineF });
    coupling(V(s * 0.03, 1.98, 1.95), 0.035, J.spineF);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.bone, { bone: J.spineF, at: tip });
    b.extrude([[0, 0], [0.14, 0.03], [0, 0.07]], {
      at: V(tip[0], tip[1] - 0.05, tip[2]), x: [s, 0, 0], thickness: 0.006, color: P.teal, bone: J.spineF,
    });
  }
  void apex; void mid; void frame; void rng;

  // rotor
  const R = J.rotorHub;
  b.rod(V(hub[0], hub[1], hub[2] - 0.15), V(hub[0], hub[1], hub[2] + 0.15), 0.02, P.steel, { bone: R });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), P.bone, { bone: R, at: V(hub[0], hub[1], hub[2] + 0.1), dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.ink, { bone: R, at: V(hub[0], hub[1], hub[2] + 0.13), dir: [0, 0, 1] });

  // rim ring
  const N = 8;
  const rimPts: number[][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    rimPts.push(V(hub[0] + Math.sin(a) * 0.52, hub[1] + Math.cos(a) * 0.52, hub[2] + 0.1));
  }
  for (let i = 0; i < N; i++) {
    const p = rimPts[i], q = rimPts[(i + 1) % N];
    b.rod(p, q, 0.022, P.pvc, { bone: R });
    coupling(p, 0.05, R, i % 2 === 0);
  }

  // blades
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.sin(a), dy = Math.cos(a);
    const rc = 0.3;
    const c = V(hub[0] + dx * rc, hub[1] + dy * rc, hub[2] + 0.1);
    const blade = b.part(new THREE.BoxGeometry(0.07, 0.4, 0.012), P.steel, {
      bone: R, at: c, dir: [dx, dy, 0], rotation: [0, 0, 0],
    });
    blade.mesh.rotateY(0.35);
    const tipP = V(hub[0] + dx * 0.49, hub[1] + dy * 0.49, hub[2] + 0.1);
    b.part(new THREE.BoxGeometry(0.075, 0.05, 0.018), P.accent, { bone: R, at: tipP, dir: [dx, dy, 0] });
    b.rod(V(hub[0] + dx * 0.1, hub[1] + dy * 0.1, hub[2] + 0.1), V(hub[0] + dx * 0.12, hub[1] + dy * 0.12, hub[2] + 0.1), 0.012, P.ink, { bone: R });
  }
}
```

<!-- call: sailRig -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSailRig({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const mast = J.spineF;
  const top = J.mastTop;
  const PVC = P.pvc, SHADE = P.pvcShade, SAIL = P.sail, DEEP = P.sailDeep, INK = P.ink, BONE = P.bone, ACC = P.accent;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // mast
  b.rod([0, 1.6, 0.1], [0, 2.5, 0.1], 0.045, PVC, { bone: top });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10), BONE, { at: [0, 1.66, 0.1], bone: mast });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), INK, { at: [0, 2.05, 0.1], bone: top });
  b.part(new THREE.CylinderGeometry(0.06, 0.05, 0.05, 10), BONE, { at: [0, 2.52, 0.1], bone: top });
  b.rod([0, 2.54, 0.1], [0, 2.7 - 0.1, 0.1], 0.012, ACC, { bone: top });
  b.part(new THREE.BoxGeometry(0.01, 0.07, 0.2), ACC, { at: [0, 2.57, 0.0], bone: top });

  // sail: triangle in the YZ plane, mast edge from yTop to yBot, tip out at z
  function sail(yTop: number, yBot: number, tipY: number, tipZ: number, dir: number) {
    const z0 = 0.1 + dir * 0.05;
    const A = V(0, yTop, z0), B = V(0, yBot, z0), C = V(0, tipY, tipZ);
    b.slab([A, B, C], { color: SAIL, thickness: 0.012, bone: mast });
    // aft-face shading: smaller deeper triangle on lower part
    const m1 = A.clone().lerp(C, 0.0), m2 = B.clone().lerp(C, 0.0);
    const lowA = B.clone().lerp(A, 0.45).add(V(0.008, 0, 0));
    const lowC = C.clone().lerp(B, 0.0).add(V(0.008, 0, 0));
    const lowM = C.clone().lerp(A, 0.45).add(V(0.008, 0, 0));
    b.slab([lowA, B.clone().add(V(0.008, 0, 0)), lowC, lowM], { color: DEEP, thickness: 0.006, bone: mast });
    void m1; void m2;
    // seam on trailing edge A-C and B-C
    b.rod(A, C, 0.012, INK, { bone: mast });
    b.rod(B, C, 0.012, INK, { bone: mast });
    // battens
    for (const t of [0.25, 0.5, 0.75]) {
      const p = A.clone().lerp(B, t);
      const q = A.clone().lerp(C, 0).lerp(C, 0);
      const e = C.clone().lerp(A, 0).clone();
      // batten from mast edge toward tip edge along line
      const end = p.clone().lerp(C, 1 - t * 0.0).lerp(
        t < 0.5 ? A.clone().lerp(C, 1) : B.clone().lerp(C, 1), 0);
      const frac = 1 - t * 0.9;
      const tipEdgePt = p.clone().lerp(C, frac * 0.9 + 0.0);
      void q; void e; void end;
      b.rod(p.clone().add(V(0.014, 0, 0)), tipEdgePt.add(V(0.014, 0, 0)), 0.015, SHADE, { bone: mast });
    }
    // bow spreader
    b.rod([0, tipY < 2.2 ? tipY : tipY, z0], [0, tipY, tipZ], 0.02, PVC, { bone: mast });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), BONE, { at: [0, tipY, tipZ], bone: mast, dir: [0, 0, 1] });
  }
  sail(2.4, 1.75, 2.15, 1.1, 1);
  sail(2.4, 1.75, 2.2, -1.2, -1);

  // wing spars and panels
  for (const s of [1, -1]) {
    b.rod([0, 2.2, 0.1], [s * 1.0, 2.2, 0.1], 0.028, PVC, { bone: mast });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), BONE, { at: [s * 0.1, 2.2, 0.1], bone: mast, dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), INK, { at: [s * 1.0, 2.2, 0.1], bone: mast });
    for (const [i, cx] of [0.38, 0.8].entries()) {
      const w = 0.3, h = 0.34;
      const x = s * cx;
      b.part(new THREE.BoxGeometry(w, h * 0.5, 0.01), SAIL, { at: [x, 2.2 - 0.03 - h * 0.25, 0.1], bone: mast });
      b.part(new THREE.BoxGeometry(w, h * 0.5, 0.012), DEEP, { at: [x, 2.2 - 0.03 - h * 0.75, 0.1], bone: mast });
      b.part(new THREE.BoxGeometry(w, 0.02, 0.016), INK, { at: [x, 2.2 - 0.03 - h, 0.1], bone: mast });
      for (const e of [-1, 1])
        b.part(new THREE.BoxGeometry(0.012, 0.03, 0.012), INK, { at: [x + e * (w / 2 - 0.02), 2.2 - 0.04, 0.1], bone: mast });
      void i;
    }
    // guy line
    b.rod([s * 1.0, 2.2, 0.1], [s * 0.28, 1.62, -0.4], 0.008, INK, { bone: mast });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), BONE, { at: [s * 0.28, 1.62, -0.4], bone: mast });
  }
}
```