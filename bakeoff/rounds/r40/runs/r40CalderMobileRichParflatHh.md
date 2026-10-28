<!-- call: plan -->

```json
{
  "name": "Calder Mobile",
  "description": "A hanging abstract mobile in the manner of Alexander Calder: a ceiling hook and black wires carrying balanced arms, with flat red, yellow, blue, white and black sheet-metal shapes hung in a cascade that reaches down to the floor.",
  "builderName": "calderMobile",
  "size": [3.0, 2.82, 2.0],
  "layout": "STATIC model (joints: []), centred on x = 0, standing on y = 0. It hangs from one ceiling hook at the top, y = 2.78. A thin black wire runs down to the top arm (A). Below it the mobile splits into a right (+X) cascade and a left (-X) cascade, and the right cascade ends in a low tier whose biggest black leaf just touches y = 0. Arms are thin black tapered rods in the horizontal plane at the stated y. Their yaws differ (A along X, B and D diagonal, C along X, E and F along Z), so the mobile reads as 3D from every side. Every hanging element uses one convention: a straight vertical black wire (radius 0.004, 5 sides) runs from a small black wire loop (torus, tube 0.006, radius 0.02) on the arm end down to a small eyelet ring on the top point of the shape. Shapes are flat sheet-metal cutouts (extrude, thickness 0.012, tiny bevel) in a vertical plane. The plane's normal is the local +Z turned by the stated yaw about Y, and the shape hangs so its top eyelet is directly under the wire. Every shape also gets a darker twin of its colour, 4% larger and 0.006 thick, seated just behind its back face, which reads as a painted edge. A few shapes get a small contrasting inset dot or ring as a separate part (Calder's cut-out accents). All balanced pivots are marked by 3 tiny coil rings (torus) wrapped on the arm at the pivot, plus a tiny black ball of radius 0.025 on each arm tip beyond the loop. Style: bold primary colours (red, yellow, blue) with white and black, flat, thin, airy and sparse; wires are the structure and the shapes are the weight. Nothing sits on the floor but the lowest leaf tip. No ground, no stand, no extras.",
  "palette": {
    "wire": "#1a1a1e",
    "ink": "#0d0d10",
    "red": "#d8281e",
    "redDark": "#a31d17",
    "yellow": "#f4c20d",
    "yellowDark": "#d9a30a",
    "blue": "#1c4fa6",
    "blueDark": "#143a7d",
    "white": "#f3efe3",
    "steel": "#7a7d86",
    "plate": "#cfc9b8"
  },
  "mounts": {
    "ceilingHook": [0, 2.78, 0],
    "topPivot": [0, 2.4, 0],
    "topEndL": [-0.7, 2.4, 0],
    "topEndR": [0.94, 2.4, 0],
    "midHangA": [0.3, 2.4, 0],
    "rightPivot": [0.94, 1.8, 0],
    "rightEndFront": [1.3, 1.8, 0.5],
    "rightEndBack": [0.65, 1.8, -0.4],
    "rightPivot2": [0.65, 1.3, -0.4],
    "cLeft": [0.15, 1.3, -0.4],
    "cRight": [1.2, 1.3, -0.4],
    "cBlueHang": [0.92, 1.3, -0.4],
    "lowPivot": [1.2, 0.85, -0.4],
    "fFront": [1.2, 0.85, 0.25],
    "fBack": [1.2, 0.85, -1.05],
    "leftPivot": [-0.7, 1.9, 0],
    "leftEndA": [-1.2, 1.9, 0.45],
    "leftEndB": [-0.2, 1.9, -0.45],
    "leftSub": [-1.2, 1.35, 0.45],
    "eFront": [-1.2, 1.35, 0.85],
    "eBack": [-1.2, 1.35, -0.15]
  },
  "joints": [],
  "parts": [
    {
      "id": "crown",
      "builds": "Top of the mobile. A small round ceiling plate (plate colour, r 0.07, thick 0.015, centred y 2.81, seated at the ceilingHook) with a steel S-hook or ring under it. A black wire (r 0.005) from ceilingHook straight down to topPivot. Arm A: a tapered black rod along X from topEndL to topEndR at y 2.4, radius 0.012 tapering to 0.007 at each end, with a loop torus at each end and a tiny black ball past each tip. Three coil rings and a small steel clamp collar at topPivot where the wire joins. One small hanging yellow leaf (length 0.28, width 0.14, leaf or lens outline, yaw 40 degrees) on a 0.12 long wire from midHangA. Its eyelet is at [0.3,2.28,0], so the centre is at about [0.3,2.14,0]. Give it a yellowDark twin and a small white inset dot. Does NOT build the wires below topEndL or topEndR; those belong to the child parts, which attach to the loops here.",
      "box": [[-0.82, 1.95, -0.1], [1.06, 2.84, 0.1]],
      "attaches": "Arm ends topEndL and topEndR carry loops where the leftCascade and rightCascade wires hang. The ceilingHook is the model's top.",
      "joints": [],
      "floor": false,
      "budget": 120
    },
    {
      "id": "rightCascade",
      "builds": "Middle right (+X) tier. Wire from topEndR down to rightPivot. Arm B: a tapered black rod from rightEndBack to rightEndFront at y 1.8 (diagonal in XZ), with coil rings at rightPivot and a loop and tip ball at each end. Big red disc (radius 0.2) with a redDark twin, hung from rightEndFront by a 0.32 wire, centre [1.3,1.28,0.5], yaw 25 degrees. It has a small white ring and a small ink dot on its face as inset accents. Wire from rightEndBack down to rightPivot2. Arm C: a tapered black rod along X from cLeft to cRight at y 1.3, coil rings at rightPivot2, loops and tip balls at both ends. A yellow leaf (length 0.4, width 0.22, pointed leaf outline, yaw -35 degrees) hung from cLeft by a 0.15 wire, eyelet [0.15,1.15,-0.4], centre about [0.15,0.95,-0.4], with a yellowDark twin and a thin ink midrib line as a part. A small blue disc (r 0.09, blueDark twin, yaw 0) hung from cBlueHang by a 0.22 wire, centre about [0.92,0.97,-0.4]. Does NOT build the wire from cRight downward (the lowTier owns it); it only builds the loop at cRight.",
      "box": [[0.05, 0.75, -0.55], [1.5, 1.85, 0.72]],
      "attaches": "Hangs from topEndR (crown). The loop at cRight carries the wire of the lowTier.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "lowTier",
      "builds": "Lowest tier, below cRight. A black wire from cRight straight down to lowPivot. Arm F: a tapered black rod along Z from fBack to fFront at y 0.85, with three coil rings at lowPivot, loops and tip balls at the ends. The big black leaf hangs from fFront on a 0.15 wire. It is a tall elegant leaf or blade outline 0.7 tall and 0.3 wide, yaw 60 degrees, eyelet at [1.2,0.70,0.25], centre [1.2,0.35,0.25]. Its lowest tip is at y = 0.0, the lowest point of the whole model. Colour ink with a wire-colour twin behind, plus a white midrib line and 3 small white dots as inset accents. A blue disc (radius 0.14, blueDark twin, yaw 0) hangs from fBack on a 0.25 wire, centre [1.2,0.46,-1.05], with a white ring inset and a small red dot at its centre. Add a small red ball of radius 0.05 on a 0.3 wire hung from lowPivot-adjacent point [1.2,0.85,-0.12] on arm F, so it hangs between the two large shapes.",
      "box": [[1.0, 0.0, -1.22], [1.4, 0.9, 0.42]],
      "attaches": "Wire top at cRight (rightCascade loop). Nothing else attaches below.",
      "joints": [],
      "floor": true,
      "budget": 140
    },
    {
      "id": "leftUpper",
      "builds": "Upper left (-X) tier. Wire from topEndL down to leftPivot (a 0.5 black wire). Arm D: a tapered black rod diagonal in XZ from leftEndA to leftEndB at y 1.9, with coil rings and a steel collar at leftPivot, and loops and tip balls at both ends. A large yellow disc (radius 0.22, yellowDark twin, yaw -20 degrees) hung from leftEndB by a 0.3 wire, centre [-0.2,1.38,-0.45]. It has a black concentric ring inset (outer r 0.12, inner r 0.1) and a black centre dot of r 0.03 as separate parts. A small white ball (radius 0.05) hung from the arm at [-0.45,1.9,-0.225] by a 0.2 wire, centre y 1.65. Also a thin curly black wire spiral (a flat swept spiral of 1.5 turns, radius 0.05, 0.003 thick) hanging 0.2 below leftEndA is NOT built; leftLower owns that wire. Builds only the loop at leftEndA.",
      "box": [[-1.3, 1.1, -0.7], [-0.05, 2.0, 0.55]],
      "attaches": "Hangs from topEndL (crown). The loop at leftEndA carries the wire of the leftLower tier.",
      "joints": [],
      "floor": false,
      "budget": 140
    },
    {
      "id": "leftLower",
      "builds": "Lower left (-X) tier. A black wire from leftEndA down to leftSub (0.55 long). Arm E: a tapered black rod along Z from eBack to eFront at y 1.35, with coil rings and a steel collar at leftSub and loops and tip balls at the ends. A red kidney or crescent leaf (length 0.36, width 0.2, redDark twin, yaw 70 degrees) hung from eFront by a 0.15 wire, eyelet [-1.2,1.2,0.85], centre about [-1.2,1.02,0.85], with 2 small white dots inset. A black fish or teardrop leaf (length 0.5, width 0.22, wire-colour twin, yaw -50 degrees) hung from eBack by a 0.3 wire, eyelet [-1.2,1.05,-0.15], centre about [-1.2,0.8,-0.15], with a thin white midrib line and a small yellow dot. A small white disc (r 0.07, yaw 90) on a thin 0.15 wire hung from the arm at [-1.2,1.35,0.2]. A coiled spring: a thin black wire spiral (3 turns, radius 0.035, tube 0.003) hanging down from leftSub, 0.2 long, ending in a small blue ball r 0.04.",
      "box": [[-1.5, 0.5, -0.4], [-0.9, 1.9, 1.05]],
      "attaches": "Wire top at leftEndA (leftUpper loop).",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: leftUpper -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildLeftUpper({ b, J: _J, P, M }: Ctx) {
  const WIRE = P.wire;
  const INK = P.ink;
  const STEEL = P.steel;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (v: THREE.Vector3) => v.toArray() as [number, number, number];

  // ---------- mounts ----------
  const topEndL = M.topEndL;
  const pivot = M.leftPivot;
  const endA = V(...M.leftEndA);
  const endB = V(...M.leftEndB);
  const armDir = endB.clone().sub(endA).normalize();
  const armY = pivot[1];

  // ---------- helpers ----------
  const wireDown = (x: number, z: number, yTop: number, yBot: number, r = 0.004) =>
    b.rod([x, yTop, z], [x, yBot, z], r, WIRE, { sides: 5, caps: "flat" });

  // loop wrapped around the arm (axis along the arm) at a point of the arm
  const armLoop = (p: THREE.Vector3) =>
    b.part(new THREE.TorusGeometry(0.02, 0.006, 6, 14), WIRE, { at: arr(p), dir: arr(armDir), axis: "z" });

  // tiny black ball on an arm tip, just beyond the loop
  const tipBall = (end: THREE.Vector3, sign: number) => {
    const c = end.clone().addScaledVector(armDir, sign * 0.03);
    return b.part(new THREE.SphereGeometry(0.025, 10, 8), WIRE, { at: arr(c) });
  };

  // eyelet ring in the plane of a hanging shape
  const eyelet = (at: THREE.Vector3, n: THREE.Vector3) =>
    b.part(new THREE.TorusGeometry(0.012, 0.004, 6, 12), WIRE, { at: arr(at), dir: arr(n), axis: "z" });

  // unit vectors of a vertical sheet at a given yaw (degrees)
  const sheetAxes = (yawDeg: number) => {
    const y = (yawDeg * Math.PI) / 180;
    const cx = Math.cos(y);
    const sy = Math.sin(y);
    return { x: V(cx, 0, -sy), n: V(sy, 0, cx) };
  };

  // flat sheet-metal cutout with its darker twin behind it
  const sheet = (
    outline: [number, number][],
    twinOutline: [number, number][],
    center: THREE.Vector3,
    yawDeg: number,
    color: string,
    dark: string,
  ) => {
    const { x, n } = sheetAxes(yawDeg);
    const face = b.extrude(outline, {
      at: arr(center),
      x: arr(x),
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.0012,
      color,
    });
    b.extrude(twinOutline, {
      at: arr(center.clone().addScaledVector(n, -0.009)),
      x: arr(x),
      y: [0, 1, 0],
      thickness: 0.006,
      color: dark,
    });
    return face;
  };

  const discOutline = (r: number, n = 20): [number, number][] => {
    const o: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return o;
  };

  // ---------- wire from topEndL (crown's loop) down to the pivot clamp ----------
  wireDown(topEndL[0], topEndL[2], topEndL[1] - 0.024, armY + 0.026, 0.004);

  // ---------- Arm D: two tapered halves meeting at the pivot ----------
  const tipA = endA.clone().addScaledVector(armDir, -0.03);
  const tipB = endB.clone().addScaledVector(armDir, 0.03);
  const pv = V(...pivot);
  b.rod(arr(pv), arr(tipA), [0.012, 0.007], WIRE, { sides: 8, caps: "flat" });
  b.rod(arr(pv), arr(tipB), [0.012, 0.007], WIRE, { sides: 8, caps: "flat" });

  // loops and tip balls
  armLoop(endA);
  armLoop(endB);
  tipBall(endA, -1);
  tipBall(endB, 1);

  // ---------- pivot: steel collar, coil rings, eyelet on top ----------
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.034, 10), STEEL, {
    at: arr(pv),
    dir: arr(armDir),
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const c = pv.clone().addScaledVector(armDir, s * (0.029 + i * 0.0105));
      b.part(new THREE.TorusGeometry(0.0145, 0.0034, 5, 12), INK, { at: arr(c), dir: arr(armDir), axis: "z" });
    }
  }
  // collar flange rims
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.004, 10), STEEL, {
      at: arr(pv.clone().addScaledVector(armDir, s * 0.017)),
      dir: arr(armDir),
    });
  }
  // clamp boss on top where the wire joins, plus an eyelet
  b.part(new THREE.CylinderGeometry(0.011, 0.014, 0.014, 8), STEEL, { at: [pivot[0], armY + 0.022, pivot[2]] });
  const sideN = V(0.9, 0, 1).normalize();
  eyelet(V(pivot[0], armY + 0.036, pivot[2]), sideN);
  // clamp screw
  b.part(new THREE.SphereGeometry(0.007, 6, 5), INK, {
    at: arr(pv.clone().add(V(0, -0.002, 0)).addScaledVector(sideN, 0.021)),
  });

  // ---------- large yellow disc hung from leftEndB ----------
  const discC = V(...[-0.2, 1.38, -0.45]);
  const R = 0.22;
  const yaw = -20;
  const { n: dn } = sheetAxes(yaw);
  wireDown(endB.x, endB.z, armY - 0.026, discC.y + R + 0.016, 0.004);
  eyelet(V(discC.x, discC.y + R + 0.004, discC.z), dn);
  sheet(discOutline(R, 24), discOutline(R * 1.04, 24), discC, yaw, P.yellow, P.yellowDark);

  // black concentric ring inset (outer 0.12, inner 0.1) on the front face
  b.lathe(
    [
      [0.1, 0],
      [0.12, 0],
      [0.12, 0.004],
      [0.1, 0.004],
    ],
    { at: arr(discC.clone().addScaledVector(dn, 0.006)), axis: arr(dn), segments: 24, color: INK },
  );
  // black centre dot (r 0.03)
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 12), INK, {
    at: arr(discC.clone().addScaledVector(dn, 0.0085)),
    dir: arr(dn),
  });

  // ---------- small white ball hung from the arm ----------
  const hangP = V(-0.45, armY, -0.225);
  const ballC = V(hangP.x, 1.65, hangP.z);
  armLoop(hangP);
  wireDown(hangP.x, hangP.z, armY - 0.026, ballC.y + 0.05 + 0.016, 0.004);
  eyelet(V(ballC.x, ballC.y + 0.05 + 0.002, ballC.z), V(0, 0, 1));
  b.part(new THREE.SphereGeometry(0.05, 12, 8), P.white, { at: arr(ballC) });
  // tiny shadow band on the ball for form
  b.part(new THREE.TorusGeometry(0.0455, 0.003, 4, 14), P.steel, {
    at: [ballC.x, ballC.y - 0.012, ballC.z],
    dir: [0, 1, 0],
    axis: "z",
  });
}
```

<!-- call: rightCascade -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRightCascade({ b, J, P, M }: Ctx) {
  type Pt = [number, number] | [number, number, "sharp"];
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const RAD = Math.PI / 180;

  // ---------- small hardware ----------
  const loopAt = (p: THREE.Vector3, dir: THREE.Vector3) =>
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 14), P.wire, { at: p, dir, axis: "z" });

  const coilRings = (p: THREE.Vector3, dir: THREE.Vector3) => {
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.TorusGeometry(0.0155, 0.004, 4, 12), P.ink, {
        at: p.clone().addScaledVector(dir, k * 0.014),
        dir,
        axis: "z",
      });
    }
  };

  const wireDown = (x: number, z: number, yTop: number, yBottom: number) =>
    b.rod([x, yTop, z], [x, yBottom, z], 0.004, P.wire, { sides: 5 });

  // Tapered arm with loops and tip balls at both ends
  const arm = (a: number[], c: number[], radii: number[]) => {
    const A = V(a);
    const B = V(c);
    const d = B.clone().sub(A).normalize();
    b.sweep([A.clone().addScaledVector(d, -0.03), B.clone().addScaledVector(d, 0.03)], radii, {
      color: P.wire,
      caps: "round",
      sides: 8,
    });
    loopAt(A, d);
    loopAt(B, d);
    b.part(new THREE.SphereGeometry(0.025, 8, 6), P.ink, { at: A.clone().addScaledVector(d, -0.04) });
    b.part(new THREE.SphereGeometry(0.025, 8, 6), P.ink, { at: B.clone().addScaledVector(d, 0.04) });
    return d;
  };

  // ---------- flat cutout shapes ----------
  const scaleOutline = (o: Pt[], c: [number, number], k: number): Pt[] =>
    o.map((p) => {
      const x = c[0] + (p[0] - c[0]) * k;
      const y = c[1] + (p[1] - c[1]) * k;
      return p.length === 3 ? ([x, y, "sharp"] as Pt) : ([x, y] as Pt);
    });

  const discOutline = (r: number, n = 28): Pt[] => {
    const o: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.push([r * Math.sin(a), -r + r * Math.cos(a)]);
    }
    return o;
  };

  // Hung shape: eyelet at top point, vertical plane with normal rotated by yaw.
  const shape = (
    eye: number[],
    yawDeg: number,
    outline: Pt[],
    c: [number, number],
    color: string,
    dark: string,
    smoothing = 0,
  ) => {
    const y = yawDeg * RAD;
    const n = new THREE.Vector3(Math.sin(y), 0, Math.cos(y));
    const xd = new THREE.Vector3(Math.cos(y), 0, -Math.sin(y));
    const E = V(eye);
    const x: [number, number, number] = [xd.x, 0, xd.z];
    b.extrude(outline, { at: E, x, thickness: 0.012, bevel: 0.002, smoothing, color });
    b.extrude(scaleOutline(outline, c, 1.04), {
      at: E.clone().addScaledVector(n, -0.009),
      x,
      thickness: 0.006,
      smoothing,
      color: dark,
    });
    // eyelet ring on the top point
    b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 10), P.wire, {
      at: E.clone().add(new THREE.Vector3(0, 0.004, 0)),
      dir: n,
      axis: "z",
    });
    const pt = (u: number, v: number, w: number) =>
      E.clone().addScaledVector(xd, u).add(new THREE.Vector3(0, v, 0)).addScaledVector(n, w);
    return { pt, n };
  };

  const faceDot = (p: THREE.Vector3, n: THREE.Vector3, r: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 14), color, { at: p, dir: n });

  const faceRing = (p: THREE.Vector3, n: THREE.Vector3, r: number, tube: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, tube, 4, 28), color, { at: p, dir: n, axis: "z", scale: [1, 1, 0.4] });

  // ---------- mounts ----------
  const topEndR = M.topEndR;
  const rightPivot = M.rightPivot;
  const endF = M.rightEndFront;
  const endB = M.rightEndBack;
  const pivot2 = M.rightPivot2;
  const cLeft = M.cLeft;
  const cRight = M.cRight;
  const cBlue = M.cBlueHang;
  const ARM_Y = 1.8;
  const C_Y = 1.3;

  // ---------- wire from the crown down to arm B ----------
  wireDown(topEndR[0], topEndR[2], topEndR[1] - 0.02, rightPivot[1] + 0.01);

  // ---------- arm B (diagonal) ----------
  const dB = arm(endB, endF, [0.007, 0.012, 0.007]);
  coilRings(V(rightPivot), dB);

  // ---------- big red disc from the front end ----------
  {
    const r = 0.2;
    const eyeY = endF[1] - 0.32;
    wireDown(endF[0], endF[2], ARM_Y - 0.02, eyeY + 0.014);
    const s = shape([endF[0], eyeY, endF[2]], 25, discOutline(r), [0, -r], P.red, P.redDark);
    const w = 0.0075;
    faceRing(s.pt(0, -r, w), s.n, 0.105, 0.009, P.white);
    faceDot(s.pt(0, -r, w), s.n, 0.04, P.ink);
    faceDot(s.pt(0.0, -r + 0.15, w), s.n, 0.012, P.white);
  }

  // ---------- wire from arm B's back end down to arm C ----------
  wireDown(endB[0], endB[2], ARM_Y - 0.02, pivot2[1] + 0.01);

  // ---------- arm C along X ----------
  const dC = arm(cLeft, cRight, [0.007, 0.011, 0.007]);
  coilRings(V(pivot2), dC);

  // ---------- yellow pointed leaf from cLeft ----------
  {
    const eyeY = 1.15;
    wireDown(cLeft[0], cLeft[2], C_Y - 0.02, eyeY + 0.014);
    const leaf: Pt[] = [
      [0, 0, "sharp"],
      [0.085, -0.07],
      [0.11, -0.2],
      [0.07, -0.325],
      [0, -0.4, "sharp"],
      [-0.07, -0.325],
      [-0.11, -0.2],
      [-0.085, -0.07],
    ];
    const s = shape([cLeft[0], eyeY, cLeft[2]], -35, leaf, [0, -0.2], P.yellow, P.yellowDark, 1);
    b.rod(s.pt(0, -0.05, 0.0072), s.pt(0, -0.35, 0.0072), 0.003, P.ink, { sides: 4 });
    // small veins
    for (const v of [-0.12, -0.2, -0.28]) {
      b.rod(s.pt(0, v, 0.0072), s.pt(0.045, v + 0.04, 0.0072), 0.0018, P.ink, { sides: 4 });
      b.rod(s.pt(0, v, 0.0072), s.pt(-0.045, v + 0.04, 0.0072), 0.0018, P.ink, { sides: 4 });
    }
  }

  // ---------- small blue disc from cBlueHang ----------
  {
    const r = 0.09;
    const eyeY = 0.97 + r;
    const hangPt = V(cBlue);
    loopAt(hangPt, dC);
    wireDown(cBlue[0], cBlue[2], C_Y - 0.02, eyeY + 0.014);
    const s = shape([cBlue[0], eyeY, cBlue[2]], 0, discOutline(r, 20), [0, -r], P.blue, P.blueDark);
    faceDot(s.pt(0, -r, 0.0075), s.n, 0.022, P.white);
  }

  // ---------- loop at cRight already built by arm(); the lowTier hangs its wire from it ----------
  void J;
  void frame;
  void rng;
}
```

<!-- call: lowTier -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLowTier({ b, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  const UP: [number, number, number] = [0, 1, 0];
  const T = 0.012; // sheet thickness
  const TW = 0.006; // painted-edge twin thickness

  // ---------- outlines (origin at the top eyelet, shape hangs toward -y) ----------
  const leafOutline = (len: number, wid: number, n = 10, pow = 0.8) => {
    const pts: any[] = [[0, 0, "sharp"]];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      pts.push([(wid / 2) * Math.sin(Math.PI * Math.pow(t, pow)), -len * t]);
    }
    pts.push([0, -len, "sharp"]);
    for (let i = n - 1; i >= 1; i--) {
      const t = i / n;
      pts.push([-(wid / 2) * Math.sin(Math.PI * Math.pow(t, pow)), -len * t]);
    }
    return pts;
  };
  const discOutline = (r: number, n = 20) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [r * Math.sin(a), -r + r * Math.cos(a)] as any;
    });
  const centeredDisc = (r: number, n = 12) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [r * Math.sin(a), r * Math.cos(a)] as any;
    });
  const scaleAbout = (outline: any[], cy: number, k: number) =>
    outline.map((p) => (p.length > 2 ? [p[0] * k, cy + (p[1] - cy) * k, p[2]] : [p[0] * k, cy + (p[1] - cy) * k]));

  // ---------- wire hardware ----------
  const wireDown = (x: number, yTop: number, yBottom: number, z: number) =>
    b.rod([x, yTop, z], [x, yBottom, z], 0.004, P.wire, { sides: 5 });

  const armLoop = (x: number, y: number, z: number) =>
    b.part(new THREE.TorusGeometry(0.02, 0.006, 6, 14), P.wire, { at: [x, y, z] });

  const eyelet = (at: number[], yaw: number) =>
    b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 12), P.wire, {
      at: [at[0], at[1] + 0.008, at[2]],
      rotation: [0, yaw, 0],
    });

  // ---------- a flat sheet-metal cutout with painted-edge twin and insets ----------
  const sheet = (eye: number[], yaw: number, outline: any[], h: number, color: string, twin: string) => {
    const c = Math.cos(yaw * DEG);
    const s = Math.sin(yaw * DEG);
    const xd: [number, number, number] = [c, 0, -s];
    const nrm: [number, number, number] = [s, 0, c];
    const pt = (u: number, v: number, w: number): [number, number, number] => [
      eye[0] + xd[0] * u + nrm[0] * w,
      eye[1] + v,
      eye[2] + xd[2] * u + nrm[2] * w,
    ];
    b.extrude(outline, { at: pt(0, 0, 0), x: xd, y: UP, thickness: T, bevel: 0.002, color });
    b.extrude(scaleAbout(outline, -h / 2, 1.04), {
      at: pt(0, 0, -(T / 2 + TW / 2 - 0.0005)),
      x: xd,
      y: UP,
      thickness: TW,
      color: twin,
    });
    eyelet(eye, yaw);
    const both = (fn: (side: number) => void) => {
      fn(1);
      fn(-1);
    };
    return {
      xd,
      nrm,
      pt,
      dot(u: number, v: number, r: number, col: string) {
        both((sd) =>
          b.extrude(centeredDisc(r), { at: pt(u, v, sd * 0.0072), x: xd, y: UP, thickness: 0.003, color: col }),
        );
      },
      ring(u: number, v: number, r: number, tube: number, col: string) {
        both((sd) =>
          b.part(new THREE.TorusGeometry(r, tube, 5, 28), col, {
            at: pt(u, v, sd * (T / 2)),
            rotation: [0, yaw, 0],
            scale: [1, 1, 0.5],
          }),
        );
      },
      line(v0: number, v1: number, hw: number, col: string) {
        const m = (v0 + v1) / 2;
        const o = [
          [0, v0],
          [hw, v0 + (v1 - v0) * 0.15],
          [hw, v0 + (v1 - v0) * 0.85],
          [0, v1],
          [-hw, v0 + (v1 - v0) * 0.85],
          [-hw, v0 + (v1 - v0) * 0.15],
        ];
        void m;
        both((sd) =>
          b.extrude(o as any, { at: pt(0, 0, sd * 0.0072), x: xd, y: UP, thickness: 0.003, color: col }),
        );
      },
    };
  };

  // ---------- layout ----------
  const [cx, cy, cz] = M.cRight;
  const [px, py, pz] = M.lowPivot;
  const [, , zF] = M.fFront;
  const [, , zB] = M.fBack;
  const x0 = px;

  // wire from the cRight loop down to the low pivot, with a small eyelet on the arm
  wireDown(cx, cy, py, cz);
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 12), P.wire, {
    at: [px, py + 0.022, pz],
    rotation: [0, 90, 0],
  });

  // ---------- arm F: tapered black rod along Z ----------
  const ext = 0.05;
  const zFEnd = zF + ext;
  const zBEnd = zB - ext;
  b.rod([px, py, pz], [x0, py, zFEnd], [0.012, 0.007], P.ink, { sides: 8 });
  b.rod([px, py, pz], [x0, py, zBEnd], [0.012, 0.007], P.ink, { sides: 8 });
  // tip balls beyond the loops
  b.part(new THREE.SphereGeometry(0.025, 10, 8), P.ink, { at: [x0, py, zFEnd + 0.02] });
  b.part(new THREE.SphereGeometry(0.025, 10, 8), P.ink, { at: [x0, py, zBEnd - 0.02] });
  // loops at the hanging points
  armLoop(x0, py, zF);
  armLoop(x0, py, zB);
  armLoop(x0, py, -0.12);
  // three coil rings at the pivot
  for (const dz of [-0.02, 0, 0.02])
    b.part(new THREE.TorusGeometry(0.0165, 0.004, 5, 14), P.wire, { at: [px, py, pz + dz] });

  // ---------- big black leaf from fFront ----------
  const leafEye = [1.2, 0.7, zF];
  wireDown(x0, py, leafEye[1] + 0.012, zF);
  const L = 0.7;
  const leaf = sheet(leafEye, 60, leafOutline(L, 0.3), L, P.ink, P.wire);
  leaf.line(-0.12, -0.62, 0.007, P.white);
  leaf.dot(0.055, -0.3, 0.016, P.white);
  leaf.dot(-0.05, -0.385, 0.013, P.white);
  leaf.dot(0.04, -0.465, 0.01, P.white);

  // ---------- blue disc from fBack ----------
  const discEye = [1.2, 0.6, zB];
  wireDown(x0, py, discEye[1] + 0.012, zB);
  const R = 0.14;
  const disc = sheet(discEye, 0, discOutline(R), 2 * R, P.blue, P.blueDark);
  disc.ring(0, -R, 0.085, 0.006, P.white);
  disc.dot(0, -R, 0.026, P.red);

  // ---------- small red ball between the two big shapes ----------
  const ballR = 0.05;
  const ballTop = py - 0.3;
  wireDown(x0, py, ballTop - 0.005, -0.12);
  b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 10), P.wire, {
    at: [x0, ballTop + 0.006, -0.12],
    rotation: [0, 90, 0],
  });
  b.part(new THREE.SphereGeometry(ballR, 12, 9), P.red, { at: [x0, ballTop - ballR, -0.12] });
  // tiny highlight cap
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.redDark, { at: [x0, ballTop - ballR * 1.9, -0.12 + 0.02] });
}
```

<!-- call: crown -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCrown({ b, P, M }: Ctx) {
  const WIRE = P.wire;
  const INK = P.ink;
  const STEEL = P.steel;
  const PLATE = P.plate;
  const WHITE = P.white;
  const DEG = Math.PI / 180;

  type V = [number, number, number];
  const add = (a: number[], d: number[], k = 1): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];

  // A small torus part. rotation is in XYZ degrees: [0,0,0] lies in the XY plane,
  // [0,90,0] in the YZ plane (axis along X), [90,0,0] flat in the XZ plane.
  const torus = (at: number[], R: number, tube: number, color: string, rotation: V = [0, 0, 0], seg = 14) =>
    b.part(new THREE.TorusGeometry(R, tube, 5, seg), color, { at, rotation });

  const ball = (at: number[], r: number, color: string) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at });

  const hangWire = (from: number[], to: number[]) => b.rod(from, to, 0.004, WIRE, { sides: 5 });

  // Lens or leaf outline, drawn from the top tip down. Origin at the centre. k < 1 puts the belly high.
  const lensOutline = (L: number, W: number, k: number): any[] => {
    const n = 8;
    const right: any[] = [];
    const left: any[] = [];
    for (let i = 1; i <= n; i++) {
      const u = i / (n + 1);
      const y = L / 2 - u * L;
      const half = (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, k)), 0.85);
      right.push([half, y]);
      left.unshift([-half, y]);
    }
    return [[0, L / 2, "sharp"], ...right, [0, -L / 2, "sharp"], ...left];
  };

  // A flat sheet-metal cutout in a vertical plane, with its darker twin seated just behind the back face.
  const sheet = (centre: number[], yawDeg: number, outline: any[], color: string, dark: string) => {
    const a = yawDeg * DEG;
    const xd: V = [Math.cos(a), 0, -Math.sin(a)];
    const n: V = [Math.sin(a), 0, Math.cos(a)];
    b.extrude(outline, { at: centre, x: xd, thickness: 0.012, bevel: 0.002, color });
    const twin = outline.map((p: any[]) =>
      p.length === 3 ? [p[0] * 1.04, p[1] * 1.04, "sharp"] : [p[0] * 1.04, p[1] * 1.04],
    );
    b.extrude(twin, { at: add(centre, n, -0.0085), x: xd, thickness: 0.006, color: dark });
    return { n, xd };
  };

  // ---------------------------------------------------------------- ceiling plate and hook
  const hookY = M.ceilingHook[1];
  const plateY = hookY + 0.03;
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 20), PLATE, { at: [0, plateY, 0] });
  // painted rim ring around the plate edge
  torus([0, plateY, 0], 0.0695, 0.004, STEEL, [90, 0, 0], 20);
  // washer and three little screws on the underside
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.004, 14), STEEL, { at: [0, plateY - 0.0095, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 8), INK, {
      at: [Math.cos(a) * 0.052, plateY - 0.0085, Math.sin(a) * 0.052],
    });
  }
  // stem, then two linked rings forming the hook
  b.rod([0, plateY - 0.0075, 0], [0, hookY, 0], 0.006, STEEL, { sides: 6 });
  torus([0, hookY - 0.015, 0], 0.02, 0.005, STEEL, [0, 0, 0], 16);
  torus([0, hookY - 0.041, 0], 0.016, 0.005, STEEL, [0, 90, 0], 14);

  // ---------------------------------------------------------------- hook wire to the pivot
  const pivot = M.topPivot;
  const collarTop = pivot[1] + 0.019;
  b.rod([0, hookY - 0.057, 0], [0, collarTop + 0.001, 0], 0.005, WIRE, { sides: 6 });

  // ---------------------------------------------------------------- arm A
  const endL = M.topEndL;
  const endR = M.topEndR;
  const ballL: V = [endL[0] - 0.035, endL[1], endL[2]];
  const ballR: V = [endR[0] + 0.035, endR[1], endR[2]];
  b.rod(ballL, pivot, [0.007, 0.012], WIRE, { sides: 8 });
  b.rod(pivot, ballR, [0.012, 0.007], WIRE, { sides: 8 });

  // loops and tip balls at both ends
  for (const [end, tip] of [
    [endL, ballL],
    [endR, ballR],
  ] as [number[], V][]) {
    torus(end, 0.02, 0.006, WIRE, [0, 90, 0], 14);
    ball(tip, 0.025, INK);
  }

  // ---------------------------------------------------------------- pivot hardware
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 10), STEEL, { at: pivot, rotation: [0, 0, 90] });
  for (const x of [-0.034, 0.034, 0.047]) torus([pivot[0] + x, pivot[1], pivot[2]], 0.0145, 0.0035, WIRE, [0, 90, 0], 10);
  // two bolt heads on the collar front and back, and the eyelet the wire passes through
  for (const s of [1, -1]) ball([pivot[0], pivot[1], pivot[2] + s * 0.0195], 0.005, INK);
  torus([pivot[0], collarTop + 0.0035, pivot[2]], 0.011, 0.0035, STEEL, [90, 0, 0], 12);

  // ---------------------------------------------------------------- small yellow leaf on midHangA
  const mid = M.midHangA;
  // clamp rings and loop where the wire leaves the arm
  b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.012, 8), STEEL, { at: mid, rotation: [0, 0, 90] });
  torus(mid, 0.02, 0.006, WIRE, [0, 90, 0], 14);

  const eyeTop: V = [mid[0], mid[1] - 0.12, mid[2]];
  const eyeletC: V = [eyeTop[0], eyeTop[1] - 0.0095, eyeTop[2]];
  const yaw = 40;
  hangWire([mid[0], mid[1] - 0.02, mid[2]], [eyeTop[0], eyeTop[1] + 0.004, eyeTop[2]]);
  torus(eyeletC, 0.009, 0.003, WIRE, [0, yaw, 0], 10);

  const L = 0.28;
  const centre: V = [mid[0], eyeTop[1] - L / 2, mid[2]];
  const { n } = sheet(centre, yaw, lensOutline(L, 0.14, 0.85), P.yellow, P.yellowDark);

  // white inset dot on the front, and one on the back of the twin
  const dotAt: V = [centre[0], centre[1] - 0.015, centre[2]];
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.003, 12), WHITE, { at: add(dotAt, n, 0.0075), dir: n });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.003, 12), WHITE, { at: add(dotAt, n, -0.0118), dir: n });
}
```

<!-- call: leftLower -->

```ts
import * as THREE from "three";
import { spiral } from "agentic-3js-builder";

export function buildLeftLower({ b, J, P, M }: Ctx) {
  void J;
  const WIRE = P.wire;
  const INK = P.ink;
  const WHITE_DARK = "#c9c3b0";
  const DEG = Math.PI / 180;

  // ---- mounts -------------------------------------------------------------------------------------------
  const ax = M.leftSub[0]; // the whole tier hangs on x = -1.2
  const ay = M.eFront[1]; // arm E height
  const zB = M.eBack[2];
  const zF = M.eFront[2];
  const zP = M.leftSub[2]; // pivot of arm E
  const topY = M.leftEndA[1];

  const torus = (R: number, tube: number, rs = 5, ts = 12) => new THREE.TorusGeometry(R, tube, rs, ts);
  const wireBetween = (a: number[], c: number[], r = 0.004) => b.rod(a, c, r, { color: WIRE, sides: 5 });

  // ---- wire from leftEndA down to the pivot of arm E ---------------------------------------------------
  const collarTop = ay + 0.019;
  wireBetween([M.leftEndA[0], topY - 0.022, M.leftEndA[2]], [ax, collarTop + 0.038, zP]);
  // small eyelet ring on the collar where the wire is threaded
  b.part(torus(0.01, 0.003, 5, 10), WIRE, { at: [ax, collarTop + 0.008, zP], dir: [1, 0, 0], axis: "z" });

  // ---- arm E: tapered rod along Z, tip balls past the loops ---------------------------------------------
  const tipB = zB - 0.05;
  const tipF = zF + 0.05;
  b.sweep(
    [
      [ax, ay, tipB],
      [ax, ay, tipF],
    ],
    [0.007, 0.012, 0.007],
    { color: WIRE, sides: 6, caps: "flat" },
  );
  for (const z of [tipB, tipF]) b.part(new THREE.SphereGeometry(0.025, 8, 6), INK, { at: [ax, ay, z] });

  // a hanging loop on the arm, wire threads through it
  const loop = (z: number) =>
    b.part(torus(0.02, 0.006, 5, 12), WIRE, { at: [ax, ay - 0.006, z], dir: [1, 0, 0], axis: "z" });
  loop(zB);
  loop(zF);

  // ---- pivot: steel collar, three coil rings -------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.032, 10), P.steel, { at: [ax, ay, zP], dir: [0, 0, 1] });
  b.part(torus(0.0215, 0.003, 5, 12), P.steel, { at: [ax, ay, zP] });
  for (const o of [-0.026, 0.026]) b.part(torus(0.0165, 0.003, 5, 12), WIRE, { at: [ax, ay, zP + o] });

  // ---- hanging sheet-metal shapes ------------------------------------------------------------------------
  type Pt = [number, number];
  const scaleAbout = (o: Pt[], k: number): Pt[] => {
    const xs = o.map((p) => p[0]);
    const ys = o.map((p) => p[1]);
    const cu = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cv = (Math.min(...ys) + Math.max(...ys)) / 2;
    return o.map((p) => [cu + (p[0] - cu) * k, cv + (p[1] - cv) * k] as Pt);
  };

  function hang(z: number, eyeY: number, yawDeg: number, outline: Pt[], color: string, twin: string) {
    const yaw = yawDeg * DEG;
    const X = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const N = [Math.sin(yaw), 0, Math.cos(yaw)];
    const E = [ax, eyeY, z];
    const pt = (u: number, v: number, w: number) => [
      E[0] + X[0] * u + N[0] * w,
      E[1] + v,
      E[2] + X[2] * u + N[2] * w,
    ];
    loop(z);
    wireBetween([ax, ay - 0.025, z], [ax, eyeY + 0.008, z]);
    b.part(torus(0.011, 0.003, 5, 10), WIRE, { at: [ax, eyeY + 0.008, z], dir: N, axis: "z" });
    b.extrude(outline, { at: E, x: X, thickness: 0.012, bevel: 0.0015, color });
    b.extrude(scaleAbout(outline, 1.04), { at: pt(0, 0, -0.0085), x: X, thickness: 0.006, color: twin });
    const dot = (u: number, v: number, r: number, c: string) => {
      for (const s of [1, -1])
        b.part(new THREE.CylinderGeometry(r, r, 0.0026, 10), c, { at: pt(u, v, s * 0.0073), dir: N });
    };
    const inlay = (o: Pt[], c: string) => {
      for (const s of [1, -1]) b.extrude(o, { at: pt(0, 0, s * 0.0073), x: X, thickness: 0.0026, color: c });
    };
    return { dot, inlay };
  }

  // red kidney / crescent leaf, 0.36 tall, 0.2 wide, hung from eFront
  const crescent: Pt[] = [];
  for (let k = 0; k < 32; k++) {
    const t = (2 * Math.PI * k) / 32;
    const w = t > Math.PI ? t - 2 * Math.PI : t;
    crescent.push([0.12 * Math.cos(t) - 0.13 * Math.exp(-(w * w) / 0.35), -0.18 + 0.18 * Math.sin(t)]);
  }
  const red = hang(zF, M.eFront[1] - 0.15, 70, crescent, P.red, P.redDark);
  red.dot(-0.06, -0.11, 0.019, P.white);
  red.dot(-0.06, -0.25, 0.019, P.white);

  // black fish leaf, 0.5 tall, 0.22 wide with a forked tail, hung from eBack
  const H = 0.5;
  const keys: Pt[] = [
    [0.06, 0.035],
    [0.18, 0.085],
    [0.32, 0.11],
    [0.46, 0.1],
    [0.6, 0.07],
    [0.72, 0.032],
    [0.84, 0.04],
    [0.93, 0.075],
    [1.0, 0.1],
  ];
  const fish: Pt[] = [[0, 0]];
  for (const [s, hw] of keys) fish.push([-hw, -s * H]);
  fish.push([0, -0.9 * H]);
  for (let i = keys.length - 1; i >= 0; i--) fish.push([keys[i][1], -keys[i][0] * H]);
  const fishLeaf = hang(zB, 1.05, -50, fish, INK, WIRE);
  fishLeaf.inlay(
    [
      [-0.004, -0.16],
      [-0.004, -0.36],
      [0.004, -0.36],
      [0.004, -0.16],
    ],
    P.white,
  );
  fishLeaf.dot(0.032, -0.1, 0.014, P.yellow);

  // small white disc, r 0.07, yaw 90, on a thin wire from the arm
  const R = 0.07;
  const disc: Pt[] = [];
  for (let k = 0; k < 16; k++) {
    const t = -Math.PI / 2 + (2 * Math.PI * k) / 16;
    disc.push([R * Math.cos(t), -R + R * Math.sin(t)]);
  }
  hang(0.2, ay - 0.15, 90, disc, P.white, WHITE_DARK);

  // ---- coiled spring below the pivot, ending in a small blue ball -----------------------------------------
  const springTop = ay - 0.02;
  b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.004, 10), P.steel, { at: [ax, springTop - 0.002, zP] });
  const coilPath = spiral([ax, springTop, zP], [ax + 0.035, springTop, zP], [0, -1, 0], {
    turns: 3,
    pitch: 0.2 / 3,
  });
  b.sweep(coilPath, 0.003, { color: WIRE, sides: 4 });
  const ballY = springTop - 0.2 - 0.015;
  b.rod([ax, springTop, zP], [ax, ballY, zP], 0.0025, { color: WIRE, sides: 5 });
  b.part(new THREE.SphereGeometry(0.04, 10, 8), P.blue, { at: [ax, ballY, zP] });
}
```