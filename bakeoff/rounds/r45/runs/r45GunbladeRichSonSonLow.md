<!-- call: plan -->

```json
{
  "name": "Lionheart Gunblade",
  "description": "A Final Fantasy-style gunblade in the manner of Squall's Revolver: a broad single-edged blade whose spine is a gun barrel, a revolver cylinder and hammer at the base, a trigger grip, and a silver lion pendant on a chain, standing pommel-down on the floor.",
  "builderName": "lionheartGunblade",
  "size": [0.33, 1.45, 0.2],
  "layout": "One static weapon, blade up, pommel resting on y=0, centred on x=0 and standing in the x–y plane. The broad flat faces of the blade point to ±Z and the viewer at +Z sees the full blade side. The cutting edge is on +X (the model's left). The spine and barrel are on -X. The trigger guard loop and the pendant are also on +X. Reading bottom to top: a round pommel cap (y 0–0.07), a leather-wrapped grip (y 0.07–0.34) with a steel collar and trigger loop (y 0.22–0.40), a gold crossguard (y 0.40–0.46), the gunmetal receiver with the revolver cylinder, hammer and a glowing blue core (y 0.46–0.74), then the blade (y 0.72–1.45). The blade has a thick spine housing the barrel on -X, a central fuller groove, bright bevelled edge strips, an engraved gold inlay line, a small run of glowing cyan runes and a clipped angled tip with a swept notch near the top. The lion head medallion hangs on a chain from the guard's +X wing and stays beside the trigger loop at about y 0.17. Style: Final Fantasy. The shapes are bold and ornate, with an elegant tall silhouette. Polished steel in two or three tones (light top bevels, darker fuller and underside), gold filigree trim, dark gunmetal mechanics, small crimson and cyan accents, and glow on the core, the chamber rim and the runes. Every detail is a small part in its own colour sitting on the surface: rivets, bolts, engraving lines, chamber holes and bevel strips. All parts are blocky and faceted, with 6–10 sided cylinders.",
  "palette": {
    "steel": "#c9d3dd",
    "steelDark": "#6c7889",
    "steelLight": "#f2f7fb",
    "edgeWhite": "#ffffff",
    "gunmetal": "#2d333d",
    "gunmetalLight": "#4a5362",
    "gold": "#d9a93a",
    "goldDark": "#8a6420",
    "goldLight": "#f5d77a",
    "leather": "#2b2320",
    "leatherWrap": "#5a3a28",
    "royalBlue": "#2f6fd6",
    "glowCyan": "#6fe8ff",
    "crimson": "#b3262e",
    "lionSilver": "#e4e8ee",
    "chainGrey": "#aeb7c2",
    "ink": "#14161c"
  },
  "mounts": {
    "pommelBase": [0, 0.0, 0],
    "gripTop": [0, 0.4, 0],
    "gripAxis": [0, 0.2, 0],
    "triggerLoop": [0.07, 0.31, 0],
    "guardCenter": [0, 0.43, 0],
    "guardWingRight": [0.13, 0.43, 0],
    "guardWingLeftEnd": [-0.12, 0.43, 0],
    "receiverCenter": [-0.02, 0.6, 0],
    "cylinderCenter": [-0.05, 0.6, 0],
    "hammerPivot": [-0.1, 0.7, 0],
    "bladeBase": [0, 0.72, 0],
    "spineLine": [-0.07, 0.72, 0],
    "edgeLine": [0.075, 0.72, 0],
    "bladeTip": [0.0, 1.45, 0],
    "chainAttach": [0.12, 0.44, 0],
    "pendantCenter": [0.15, 0.17, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "gripTrigger",
      "builds": "The handle, centred on x=0, z=0, with its axis along Y. A round pommel cap (gold, dark gold ring below it, 8-sided, radius about 0.04) and a short tapered pommel spike or ring plate. Grip y 0.07–0.34: a leather-brown core (leather, radius about 0.03) with diagonal leatherWrap strips wound round it (small angled boxes or a stack of thin rings), plus two gold ferrules. A steel collar at y 0.34–0.40 with a gold band. A trigger guard: a thin loop in the XY plane (swept rod, steel, radius 0.006) from the collar at about y 0.40, out to x 0.11 and back to the grip at y 0.22. Inside it hangs a small crescent trigger in gunmetal. Tiny gold rivets on the collar and a small crimson gem on the pommel front (+Z).",
      "box": [[-0.05, 0.0, -0.05], [0.12, 0.4, 0.05]],
      "attaches": "Its top ends at the gripTop mount (y 0.40) under the crossguard of the receiver part. The trigger loop meets the grip at triggerLoop. Its lowest point, the pommelBase, rests on y=0.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "receiver",
      "builds": "The crossguard and the gun mechanism, y 0.40–0.74. The gold crossguard is a wide flat bar at y 0.40–0.46, from x -0.12 to 0.13 and z ±0.045. Its +X wing sweeps up and out into a feathered gold wing shape with a hole or hook at chainAttach, and its -X end is a smaller upturned wing. It has goldDark trim lines and goldLight tips. The receiver above is a gunmetal block (x -0.10..0.06, z ±0.06, y 0.46..0.72) with chamfered plates in gunmetalLight, ink panel seams and bolts. The revolver cylinder sits on the spine side at cylinderCenter (-0.05, 0.60, 0): an upright 8-sided drum with radius 0.05 and height 0.13, steel with six dark ink chamber holes on its +Z face, gold top and bottom rims, and tiny glowCyan chamber rim dots. Behind it a hammer: a gunmetal angled block with a gold tip pivoting at hammerPivot (-0.1, 0.70, 0) on the -X side. A glowing royalBlue/glowCyan core gem on the +Z receiver face at about (0.0, 0.56, 0.062), set in a gold bezel. The barrel root is a gunmetal tube housing at x -0.095..-0.05 which rises into the blade's spine at the top (y 0.74). Also a small ejector rod on the cylinder side and screw heads.",
      "box": [[-0.13, 0.4, -0.07], [0.14, 0.74, 0.07]],
      "attaches": "Sits on gripTop (y 0.40). The blade's ricasso and spine enter its top at bladeBase (y 0.72). Its +X wing holds chainAttach for the ornaments part.",
      "joints": [],
      "floor": false,
      "budget": 210
    },
    {
      "id": "blade",
      "builds": "The blade from y 0.72 to tip y 1.45, centred on x≈0. It has flat faces toward ±Z and is about 0.035 thick in z in the middle. Width runs from the spine at x -0.07 to the cutting edge at x +0.075. It is built as a stack or extrude of a single-edged outline: a straight spine, a slight belly on the edge, a clipped angled point (the tip swept up toward -X) and a small notch step near y 1.30 on the edge side. The steel body is in steel with a darker steelDark fuller groove (a long inset strip, x -0.02..0.02, z faces) from y 0.8 to 1.3, inside which a thin goldLight inlay line and a few glowCyan rune ticks (3–5 small glyph parts) are seated. Edge bevel strips in steelLight and edgeWhite run the full length on +X on both faces. A thick spine on -X is a gunmetal barrel-housing bar (x -0.095..-0.05, z ±0.025) from the receiver up to y 1.2, with a muzzle block and gold muzzle ring near its end at y 1.2–1.25, and small gunmetalLight sight nubs. Gold ricasso bands and tiny rivets near the base (y 0.72–0.80). A short dark ink notch line below the tip and some slim steelDark scratch accents.",
      "box": [[-0.1, 0.72, -0.03], [0.09, 1.45, 0.03]],
      "attaches": "Its base enters the receiver at bladeBase (y 0.72, centred x 0). The spine housing continues the receiver's barrel at spineLine. The tip is at bladeTip, the highest point of the model (y 1.45).",
      "joints": [],
      "floor": false,
      "budget": 250
    },
    {
      "id": "lionCharm",
      "builds": "The ornament on the +X side. It hangs from the chainAttach mount (0.12, 0.44, 0): a small gold ring, then a chain of about 8–10 tiny linked beads or boxes in chainGrey, alternating orientation, drooping with a slight curve outward to x 0.15 at y 0.24. At pendantCenter (0.15, 0.17, 0) hangs the lion head medallion, facing +Z, about 0.065 tall. A round silver disc (lionSilver, radius 0.032, 10 sides) with a gold rim and a raised lion face made of small parts: a mane of 8–10 spiky silver/steelDark triangular blades radiating round it, a muzzle block, two ink eyes with tiny gold highlights, a small ink nose and a goldDark brow. Below it hang two short crimson ribbon tails (flat thin boxes, one with a swallow-tail end) and a tiny gold bead. Next to the chain, tied round the +X crossguard wing, is a short crimson ribbon knot. Keep every piece clear of the trigger loop (which reaches x 0.115) and above y 0.05 so it clears the floor.",
      "box": [[0.115, 0.08, -0.04], [0.18, 0.46, 0.04]],
      "attaches": "Attached to the receiver's +X guard wing at chainAttach. The pendant medallion center is the pendantCenter mount.",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: gripTrigger -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildGripTrigger({ b, J, P, M }: Ctx) {
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at, flat: true, ...extra });

  // pommel
  put(cyl(0.022, 0.012, 0.012, 8), P.goldDark, [0, 0.006, 0]);
  put(cyl(0.04, 0.03, 0.03, 8), P.gold, [0, 0.027, 0]);
  put(cyl(0.042, 0.042, 0.008, 8), P.goldDark, [0, 0.046, 0]);
  put(cyl(0.032, 0.036, 0.012, 8), P.goldLight, [0, 0.056, 0]);
  // crimson gem on the front
  put(new THREE.OctahedronGeometry(0.011), P.crimson, [0, 0.03, 0.036]);
  put(new THREE.TorusGeometry(0.013, 0.003, 4, 8), P.goldDark, [0, 0.03, 0.034]);
  // rear ring plate
  put(new THREE.BoxGeometry(0.02, 0.014, 0.01), P.goldDark, [0, 0.03, -0.04]);

  // grip core
  put(cyl(0.03, 0.03, 0.27, 8), P.leather, [0, 0.205, 0]);
  // ferrules
  for (const y of [0.075, 0.335]) {
    put(cyl(0.034, 0.034, 0.012, 8), P.gold, [0, y, 0]);
    put(cyl(0.035, 0.035, 0.003, 8), P.goldLight, [0, y + 0.0045, 0]);
  }
  // wrap strips: diagonal boxes wound around
  const n = 10;
  for (let i = 0; i < n; i++) {
    const y = 0.1 + i * 0.023;
    const a = i * 0.9;
    for (let k = 0; k < 4; k++) {
      const ang = a + (k * Math.PI) / 2;
      const x = Math.sin(ang) * 0.03;
      const z = Math.cos(ang) * 0.03;
      put(new THREE.BoxGeometry(0.026, 0.008, 0.005), P.leatherWrap, [x, y + k * 0.004, z], {
        rotation: [0, (ang * 180) / Math.PI, 28],
      });
    }
  }

  // collar
  put(cyl(0.036, 0.034, 0.06, 8), P.steel, [0, 0.37, 0]);
  put(cyl(0.039, 0.039, 0.014, 8), P.gold, [0, 0.368, 0]);
  put(cyl(0.037, 0.037, 0.006, 8), P.steelDark, [0, 0.346, 0]);
  put(cyl(0.037, 0.037, 0.006, 8), P.steelDark, [0, 0.394, 0]);
  const rv = new THREE.SphereGeometry(0.004, 5, 4);
  for (let k = 0; k < 6; k++) {
    const ang = (k * Math.PI * 2) / 6;
    put(rv, P.goldLight, [Math.sin(ang) * 0.04, 0.368, Math.cos(ang) * 0.04]);
  }

  // trigger guard loop in XY plane
  const pts = [
    [0.03, 0.39, 0],
    [0.08, 0.395, 0],
    [0.112, 0.35, 0],
    [0.115, 0.3, 0],
    [0.095, 0.245, 0],
    [0.03, 0.22, 0],
  ];
  const guard = b.sweep(pts, 0.006, { color: P.steel, sides: 6 });
  for (const p of [pts[0], pts[5]]) put(new THREE.BoxGeometry(0.014, 0.018, 0.016), P.gold, [p[0] + 0.004, p[1], 0]);
  put(new THREE.SphereGeometry(0.005, 5, 4), P.goldLight, [0.114, 0.32, 0.006]);
  // crescent trigger
  put(new THREE.BoxGeometry(0.008, 0.03, 0.008), P.gunmetal, [0.06, 0.29, 0], { rotation: [0, 0, 12] });
  put(new THREE.BoxGeometry(0.014, 0.008, 0.008), P.gunmetal, [0.065, 0.272, 0], { rotation: [0, 0, 40] });
  put(new THREE.BoxGeometry(0.012, 0.02, 0.01), P.gunmetalLight, [0.045, 0.31, 0]);
}
```

<!-- call: lionCharm -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLionCharm({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });

  // gold ring at attach (ring in the XY plane, torus faces +Z)
  const A = M.chainAttach;
  part(new THREE.TorusGeometry(0.012, 0.0025, 5, 10), P.gold, [A[0], A[1] - 0.008, A[2]]);

  // chain: curve from attach to pendant top
  const top = [0.15, 0.2, 0];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = A[0] + (top[0] - A[0]) * t + 0.012 * Math.sin(Math.PI * t);
    const y = A[1] - 0.022 - (A[1] - 0.022 - top[1]) * t;
    const alt = i % 2 === 0;
    part(
      new THREE.BoxGeometry(alt ? 0.008 : 0.004, 0.015, alt ? 0.004 : 0.008),
      P.chainGrey,
      [x, y, 0],
    );
  }

  // ribbon knot on guard wing
  part(new THREE.BoxGeometry(0.02, 0.012, 0.02), P.crimson, [0.115, 0.425, 0.012]);
  part(new THREE.BoxGeometry(0.01, 0.03, 0.006), P.crimson, [0.12, 0.405, 0.022], { rotation: [0, 0, 15] });
  part(new THREE.BoxGeometry(0.01, 0.026, 0.006), P.crimson, [0.133, 0.408, 0.022], { rotation: [0, 0, -15] });

  // medallion
  const C = M.pendantCenter;
  const z = C[2];
  const disc = (r: number, h: number, c: string, dz: number, sides = 10) =>
    part(new THREE.CylinderGeometry(r, r, h, sides), c, [C[0], C[1], z + dz], { dir: [0, 0, 1] });
  disc(0.034, 0.008, P.gold, 0);
  disc(0.029, 0.01, P.lionSilver, 0.001);

  // mane blades
  const bl = 10;
  for (let i = 0; i < bl; i++) {
    const a = (i / bl) * Math.PI * 2;
    const r = 0.038;
    const col = i % 2 ? P.steelDark : P.lionSilver;
    part(new THREE.ConeGeometry(0.008, 0.02, 4), col, [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r, z - 0.001], {
      rotation: [0, 0, (a * 180) / Math.PI - 90],
    });
  }

  // face
  part(new THREE.BoxGeometry(0.02, 0.016, 0.008), P.steelLight, [C[0], C[1] - 0.008, z + 0.007]);
  part(new THREE.BoxGeometry(0.008, 0.006, 0.004), P.ink, [C[0], C[1] - 0.003, z + 0.012]);
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.007, 0.005, 0.003), P.ink, [C[0] + s * 0.01, C[1] + 0.008, z + 0.0075]);
    part(new THREE.BoxGeometry(0.002, 0.002, 0.002), P.goldLight, [C[0] + s * 0.0105, C[1] + 0.0095, z + 0.0095]);
    part(new THREE.BoxGeometry(0.014, 0.003, 0.003), P.goldDark, [C[0] + s * 0.01, C[1] + 0.014, z + 0.0075], {
      rotation: [0, 0, -s * 12],
    });
  }

  // ribbons and bead
  part(new THREE.BoxGeometry(0.012, 0.03, 0.003), P.crimson, [C[0] - 0.007, C[1] - 0.056, z + 0.002], { rotation: [0, 0, 6] });
  part(new THREE.BoxGeometry(0.012, 0.026, 0.003), P.crimson, [C[0] + 0.008, C[1] - 0.054, z + 0.002], { rotation: [0, 0, -6] });
  part(new THREE.ConeGeometry(0.004, 0.008, 3), P.ink, [C[0] + 0.008, C[1] - 0.07, z + 0.002], { rotation: [0, 0, 180] });
  part(new THREE.SphereGeometry(0.006, 6, 4), P.gold, [C[0], C[1] - 0.04, z]);
}
```

<!-- call: blade -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBlade({ b, J, P, M }: Ctx) {
  const r = rng(11);
  // Blade outline drawn in x (across) and y (up from the base), at y0 = 0.72
  const Y0 = 0.72;
  const outline: [number, number, ("sharp")?][] = [
    [-0.07, 0, "sharp"],
    [0.07, 0, "sharp"],
    [0.078, 0.18],
    [0.075, 0.45],
    [0.066, 0.52, "sharp"],
    [0.07, 0.56, "sharp"],
    [0.068, 0.66],
    [-0.01, 0.73, "sharp"],
    [-0.07, 0.6, "sharp"],
  ].map((p) => p as [number, number, ("sharp")?]);
  const pts = outline.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])) as any;
  const tag = { group: "blade" };
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot, ...tag });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, n = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, n), c, { at: [x, y, z], ...tag });

  // main steel body
  b.extrude(pts, { at: [0, Y0, 0], x: [1, 0, 0], thickness: 0.032, color: P.steel, ...tag });

  for (const s of [1, -1]) {
    const z = s * 0.0175;
    // fuller groove
    box(0.04, 0.5, 0.003, P.steelDark, 0.0, Y0 + 0.31, z);
    // gold inlay line
    box(0.004, 0.46, 0.002, P.goldLight, 0.0, Y0 + 0.31, z + s * 0.0022);
    // bevel strips along the edge
    box(0.014, 0.6, 0.003, P.steelLight, 0.062, Y0 + 0.31, z);
    box(0.005, 0.6, 0.004, P.edgeWhite, 0.071, Y0 + 0.31, z + s * 0.0005);
    // lower bevel on the cutting edge near the tip
    box(0.012, 0.1, 0.003, P.steelLight, 0.05, Y0 + 0.63, z, [0, 0, 12]);
    // ricasso bands
    for (const y of [0.025, 0.065]) box(0.138, 0.012, 0.004, P.gold, 0, Y0 + y, z);
    // rivets
    for (const x of [-0.05, 0.05]) {
      cyl(0.005, 0.005, 0.004, P.goldLight, x, Y0 + 0.045, z + s * 0.002, 6).mesh.rotation.x = Math.PI / 2;
    }
    // runes
    const runeY = [0.2, 0.26, 0.31, 0.37, 0.42];
    runeY.forEach((y, i) => {
      const zz = z + s * 0.004;
      const rc = P.glowCyan;
      box(0.018, 0.0035, 0.002, rc, 0, Y0 + y, zz);
      if (i % 2 === 0) box(0.0035, 0.016, 0.002, rc, -0.005, Y0 + y + 0.008, zz);
      else box(0.0035, 0.016, 0.002, rc, 0.006, Y0 + y - 0.008, zz);
    });
    // scratches
    for (let i = 0; i < 4; i++) {
      box(0.002, 0.03 + r() * 0.03, 0.001, P.steelDark, 0.03 + r() * 0.03, Y0 + 0.15 + r() * 0.4, z + s * 0.0005, [0, 0, 20]);
    }
    // ink notch line below tip
    box(0.02, 0.003, 0.002, P.ink, 0.02, Y0 + 0.57, z + s * 0.001, [0, 0, -30]);
  }

  // glow rune accent mark: all glowing materials kept simple via colour
  // barrel housing spine
  box(0.045, 0.48, 0.05, P.gunmetal, -0.0725, Y0 + 0.24, 0);
  // top ridge highlight
  box(0.012, 0.46, 0.012, P.gunmetalLight, -0.0725, Y0 + 0.24, 0.02);
  box(0.012, 0.46, 0.012, P.gunmetalLight, -0.0725, Y0 + 0.24, -0.02);
  // muzzle block and ring
  box(0.05, 0.05, 0.054, P.gunmetal, -0.0725, Y0 + 0.5, 0);
  box(0.056, 0.012, 0.06, P.gold, -0.0725, Y0 + 0.485, 0);
  box(0.056, 0.008, 0.06, P.goldDark, -0.0725, Y0 + 0.5, 0);
  box(0.056, 0.012, 0.06, P.gold, -0.0725, Y0 + 0.515, 0);
  // muzzle hole
  cyl(0.009, 0.009, 0.004, P.ink, -0.0725, Y0 + 0.526, 0.0, 8);
  // sight nubs
  box(0.012, 0.02, 0.014, P.gunmetalLight, -0.0725, Y0 + 0.535, 0);
  box(0.012, 0.016, 0.014, P.gunmetalLight, -0.0725, Y0 + 0.13, 0);
  // bolts on the housing
  for (const y of [0.1, 0.2, 0.3, 0.4])
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 6), P.gold, {
        at: [-0.0725, Y0 + y, s * 0.0255],
        rotation: [90, 0, 0],
        ...tag,
      });
  // clipped tip accent in gold
  box(0.006, 0.006, 0.036, P.goldLight, 0.0, Y0 + 0.725, 0, [0, 0, 35]);
}
```

<!-- call: receiver -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildReceiver({ b, P }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], flat: true });
    if (rz) p.mesh.rotation.z = rz;
    return p;
  };
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], flat: true });
  const ball = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { at: [x, y, z], flat: true });

  // Crossguard
  box(0.25, 0.04, 0.09, P.gold, 0.005, 0.42, 0);
  box(0.25, 0.006, 0.092, P.goldDark, 0.005, 0.44, 0);
  box(0.25, 0.004, 0.092, P.goldDark, 0.005, 0.40, 0);
  // +X wing: feathered, sweeping up and out
  const feathers: [number, number, number, number][] = [
    [0.095, 0.455, 0.06, 0.5],
    [0.11, 0.46, 0.055, 0.7],
    [0.123, 0.465, 0.05, 0.95],
  ];
  feathers.forEach(([x, y, w, r], i) => {
    box(w, 0.016, 0.034, i % 2 ? P.goldLight : P.gold, x, y + i * 0.004, 0, r);
  });
  box(0.02, 0.012, 0.03, P.goldLight, 0.13, 0.425, 0);
  // hook ring at chainAttach
  b.part(new THREE.TorusGeometry(0.01, 0.0035, 5, 8), P.goldLight, { at: [0.12, 0.435, 0], rotation: [0, 0, 0] });
  // -X wing: small, upturned
  box(0.04, 0.016, 0.034, P.gold, -0.105, 0.435, 0, -0.5);
  box(0.022, 0.014, 0.03, P.goldLight, -0.12, 0.452, 0, -0.9);

  // Receiver block
  box(0.16, 0.26, 0.12, P.gunmetal, -0.02, 0.59, 0);
  box(0.13, 0.22, 0.004, P.gunmetalLight, -0.02, 0.59, 0.062);
  box(0.13, 0.22, 0.004, P.gunmetalLight, -0.02, 0.59, -0.062);
  box(0.16, 0.012, 0.126, P.gunmetalLight, -0.02, 0.466, 0);
  box(0.16, 0.012, 0.126, P.gunmetalLight, -0.02, 0.714, 0);
  // seams
  for (const z of [0.0645, -0.0645]) {
    box(0.13, 0.002, 0.002, P.ink, -0.02, 0.5, z);
    box(0.13, 0.002, 0.002, P.ink, -0.02, 0.66, z);
    box(0.002, 0.16, 0.002, P.ink, 0.04, 0.58, z);
    for (const [x, y] of [[0.03, 0.49], [0.03, 0.69], [-0.07, 0.49]])
      cyl(0.006, 0.006, 0.004, 6, P.gold, x, y, z > 0 ? 0.066 : -0.066).mesh.rotation.x = Math.PI / 2;
  }

  // Core gem in bezel
  const bez = cyl(0.026, 0.026, 0.006, 8, P.gold, 0, 0.56, 0.064);
  bez.mesh.rotation.x = Math.PI / 2;
  const gem = cyl(0.018, 0.018, 0.008, 8, P.royalBlue, 0, 0.56, 0.067);
  gem.mesh.rotation.x = Math.PI / 2;
  glow(gem, 1.4);
  glow(ball(0.007, P.glowCyan, 0, 0.56, 0.072), 2);

  // Revolver cylinder
  cyl(0.05, 0.05, 0.13, 8, P.steel, -0.05, 0.6, 0.0);
  cyl(0.052, 0.052, 0.012, 8, P.gold, -0.05, 0.668, 0);
  cyl(0.052, 0.052, 0.012, 8, P.gold, -0.05, 0.532, 0);
  cyl(0.02, 0.02, 0.02, 8, P.gunmetalLight, -0.05, 0.68, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = -0.05 + Math.sin(a) * 0.032;
    const z = Math.cos(a) * 0.032;
    if (z < 0.005) continue;
    const h = cyl(0.009, 0.009, 0.01, 6, P.ink, x, 0.6, z + 0.015);
    h.mesh.rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const z = Math.cos(a) * 0.05;
    if (z < 0.01) continue;
    glow(ball(0.0045, P.glowCyan, -0.05 + Math.sin(a) * 0.05, 0.668, z * 0.98), 2);
  }

  // Barrel root housing
  cyl(0.024, 0.024, 0.3, 8, P.gunmetal, -0.075, 0.6, 0);
  cyl(0.028, 0.028, 0.02, 8, P.gunmetalLight, -0.075, 0.735, 0);
  cyl(0.026, 0.026, 0.008, 8, P.gold, -0.075, 0.722, 0);

  // Hammer
  box(0.03, 0.05, 0.03, P.gunmetal, -0.115, 0.69, 0, 0.5);
  box(0.016, 0.02, 0.026, P.gold, -0.128, 0.72, 0, 0.5);
  cyl(0.01, 0.01, 0.036, 6, P.goldDark, -0.1, 0.7, 0).mesh.rotation.x = Math.PI / 2;

  // Ejector rod
  cyl(0.005, 0.005, 0.11, 6, P.steelDark, -0.01, 0.6, 0.04);
  ball(0.008, P.gold, -0.01, 0.545, 0.04);
  box(0.02, 0.01, 0.02, P.gunmetalLight, -0.01, 0.658, 0.04);
}
```