<!-- call: plan -->

```json
{
  "name": "Calder Mobile",
  "description": "A hanging abstract mobile in the manner of Alexander Calder: black wire arms balanced in tiers, hung from a ceiling hook, carrying flat painted sheet-metal leaves and discs in red, yellow, blue, black and white.",
  "builderName": "calderMobile",
  "size": [2.7, 2.4, 1.7],
  "layout": "A static, airy kinetic sculpture hanging from a ceiling hook at the top (y 2.4). The lowest tip of the lowest shape touches y=0 and nothing sinks below it by more than 2 cm. Everything is thin: wire radius about 0.005-0.008 and shapes 0.012 thick with a tiny bevel. No two shapes touch. Everything hangs from vertical wires.\n\nTier 1 (y=2.0): a long straight horizontal black arm A1 along X from x=-1.0 to x=1.0, slung from the ceiling hook by one vertical wire at x=0. Its ends carry small eyelet loops and ball counterweights. Two small flat discs hang directly under it.\n\nTier 2 left (+X): a medium arm A2 at y=1.5, hung by a wire from A1's left end (x=0.85). A2 is yawed about 32 degrees, direction (0.85,0,0.53), half-length 0.42. One end carries a big red oval. The other end carries a sub-arm A2b with a yellow crescent and a black teardrop.\n\nTier 2 right (-X): a medium arm A3 at y=1.3, hung from A1's right end (x=-0.85). A3 is yawed the opposite way, direction (0.85,0,-0.53), half-length 0.42. One end carries a sub-arm A3a with a big blue leaf and a small red disc. The other end carries a large black boomerang with a small white disc.\n\nTier 2 centre: a low arm A4 at y=0.95 along Z, from z=-0.75 to z=0.75. It hangs from the centre of A1 on a long vertical pivot wire at x=0, passing between the two side branches. The front end (+Z) carries a long wire down to a tall blue leaf whose bottom touches y=0. The back end (-Z) carries a sub-arm A4b along X with a red disc and a white rounded triangle.\n\nBalance: the heavy red and black shapes sit near the centre line, small light shapes hang further out. Seen from the front the silhouette is a loose asymmetrical triangle of hanging forms with negative space between them.\n\nStyle: Calder's flat primary colours (red, yellow, blue, black, white) on every shape, with black wire and small steel rivets. Shapes are organic cut-out silhouettes (leaves, kidneys, crescents, boomerangs, discs, teardrops), each with a different yaw about Y so the viewer sees some face-on and some edge-on. Each shape hangs from a small steel eyelet loop at its top edge, with a small rivet or clamp where the wire meets the metal. Thin wire is rendered as 6-8 sided sweeps. Every colour is flat, with no paints or textures required.",
  "palette": {
    "red": "#d92b1f",
    "redDeep": "#a81a14",
    "yellow": "#f2b61a",
    "blue": "#1f4fa8",
    "blueDeep": "#173a7d",
    "black": "#16151a",
    "white": "#f3efe4",
    "wire": "#25252a",
    "steel": "#9aa0a8",
    "rivet": "#cfd2d6",
    "ceiling": "#5b5f66"
  },
  "mounts": {
    "ceilingHook": [0, 2.4, 0],
    "armA1Center": [0, 2.0, 0],
    "armA1LeftEnd": [0.85, 2.0, 0],
    "armA1RightEnd": [-0.85, 2.0, 0],
    "pivotDropTop": [0, 2.0, 0],
    "armA2Center": [0.85, 1.5, 0],
    "armA2EndFront": [1.207, 1.5, 0.223],
    "armA2EndBack": [0.493, 1.5, -0.223],
    "armA3Center": [-0.85, 1.3, 0],
    "armA3EndFront": [-1.207, 1.3, 0.223],
    "armA3EndBack": [-0.493, 1.3, -0.223],
    "armA4Center": [0, 0.95, 0],
    "armA4EndFront": [0, 0.95, 0.75],
    "armA4EndBack": [0, 0.95, -0.75]
  },
  "joints": [],
  "parts": [
    {
      "id": "crown",
      "builds": "The top tier. A ceiling rosette (a lathe disc r 0.1, thin, ceiling grey, y 2.36-2.4) with a small steel hook or eyelet ring under it. A thin black wire runs from the hook down to the centre of arm A1 (armA1Center), with a small steel clamp sleeve at the arm. Arm A1 is a straight black wire rod (r 0.008) from x=-1.0 to x=1.0 at y=2.0, with a slightly thicker central collar. Each end has a small steel eyelet loop at x=+-0.85 (armA1LeftEnd, armA1RightEnd) with the top of the downward hanger wire clamped through it, and a small black ball counterweight (r 0.03) at x=+-0.99. Two small flat sheet-metal accents hang directly from A1 on short wires: a yellow disc (r 0.08) centred (0.38,1.80,0), a black disc (r 0.07) centred (-0.45,1.82,0), and a white mini leaf (0.1 tall) at (-0.1,1.78,0.06) hung from the same wire. Discs are extrudes in the XY plane, yawed 20-50 degrees about Y. The long vertical pivot wire runs from armA1Center (pivotDropTop) straight down to armA4Center [0,0.95,0], ending in a small steel eyelet where the centre branch's arm A4 takes it. This part owns that wire (r 0.005) and the clamp. Rivets are tiny steel spheres.",
      "box": [[-1.05, 0.93, -0.12], [1.05, 2.4, 0.12]],
      "attaches": "Hook at ceilingHook, arm A1 centred on armA1Center. The ends armA1LeftEnd and armA1RightEnd are where the left and right branches hang their wires, and the pivot wire ends at armA4Center where centreBranch starts.",
      "joints": [],
      "floor": false,
      "budget": 130
    },
    {
      "id": "leftBranch",
      "builds": "The +X branch. A black hanger wire runs from the eyelet at armA1LeftEnd [0.85,2.0,0] down to armA2Center [0.85,1.5,0], with a steel clamp collar. Arm A2 is a black rod r 0.007 centred there, half-length 0.42, direction (0.85,0,0.53), with ball counterweights r 0.022 at both ends and eyelets at armA2EndFront [1.207,1.5,0.223] and armA2EndBack [0.493,1.5,-0.223]. Front end: a vertical wire 0.4 long to a big red kidney/oval, about 0.42 wide and 0.3 tall, with a dark-red (redDeep) small inner disc (r 0.06) layered 5 mm in front as an inset, centred at y~0.92, yawed about 25 degrees. Back end: a vertical wire 0.25 down to the centre of sub-arm A2b at [0.493,1.25,-0.223], a short black rod, half-length 0.3, direction (0.5,0,-0.87). A2b's end hangs a yellow crescent (0.3 wide, with a smooth cut-out arc) on a wire 0.15 long at y~0.95, and its other end hangs a black teardrop (0.12 wide, 0.28 tall) on a wire 0.35 long, with a tiny white disc (r 0.035) dangling below on a thread. Every shape has a steel eyelet loop at its top, a rivet, and an extrude thickness of 0.012 with a bevel. All shape bottoms stay above y=0.4. Everything stays inside x 0.2..1.4.",
      "box": [[0.2, 0.4, -0.45], [1.4, 2.0, 0.45]],
      "attaches": "Hangs from the crown at armA1LeftEnd. Does not touch centreBranch or rightBranch.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "rightBranch",
      "builds": "The -X branch. A black hanger wire runs from armA1RightEnd [-0.85,2.0,0] down to armA3Center [-0.85,1.3,0], with a steel clamp collar. Arm A3 is a black rod r 0.007, half-length 0.42, direction (0.85,0,-0.53), with ball counterweights r 0.022 at the ends and eyelets at armA3EndFront [-1.207,1.3,0.223] and armA3EndBack [-0.493,1.3,-0.223]. Front end (-X side): a wire 0.35 down to the middle of sub-arm A3a at [-1.207,0.95,0.223], a short black rod along X, half-length 0.25. It carries a big blue leaf (0.2 wide, 0.5 tall, pointed at both ends, with a thin blueDeep midrib strip layered on it) hung from a 0.1 wire on one end, and a small red disc (r 0.06) on a 0.4 wire from the other end. The lowest bottom is at y~0.3. Back end (-X side toward centre): a wire 0.2 down to a large black boomerang (0.5 wide, 0.2 deep arms, a smooth curved V) hung by its apex at y~0.95-0.7, yawed about 40 degrees, with a small white disc (r 0.05) hung beneath by a thread at y~0.5. Every shape has a steel eyelet at its top, a rivet and 0.012 thickness. Everything stays inside x -1.4..-0.2.",
      "box": [[-1.4, 0.25, -0.45], [-0.2, 2.0, 0.45]],
      "attaches": "Hangs from the crown at armA1RightEnd. Does not touch centreBranch or leftBranch.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "centreBranch",
      "builds": "The low central branch and the floor anchor. Arm A4 is a black rod r 0.008 along Z from z=-0.75 to z=0.75 at y=0.95, hung at armA4Center [0,0.95,0] from the pivot wire the crown ends there. It has a steel clamp collar at the centre, ball counterweights r 0.025 at both ends, and eyelets at armA4EndFront [0,0.95,0.75] and armA4EndBack [0,0.95,-0.75]. Front end: a long wire (0.4) down to a tall blue leaf (0.3 wide, 0.55 tall), a soft almond silhouette with a pointed tip. Its bottom tip touches y=0 (down to -0.015), and its top eyelet is at y~0.55. It carries a yellow disc inset (r 0.07, 5 mm proud) on its face and is yawed about 15 degrees. This is the lowest point of the model. Back end: a wire 0.2 down to the centre of sub-arm A4b at [0,0.75,-0.75], a black rod along X, half-length 0.35, with ball weights. Its +X end hangs a red disc (r 0.11) on a 0.25 wire (bottom ~0.4), with a tiny black disc inset. Its -X end hangs a white rounded triangle (0.22 wide) on a 0.3 wire (bottom ~0.3). All shapes have eyelets, rivets, 0.012 thickness and a bevel. Everything stays within x -0.45..0.45 and z -0.85..0.85.",
      "box": [[-0.45, 0, -0.85], [0.45, 0.95, 0.85]],
      "attaches": "Starts at armA4Center, where the crown's pivot wire ends. Stays clear of leftBranch and rightBranch, which are at |x|>=0.2 and mostly above y=0.4.",
      "joints": [],
      "floor": true,
      "budget": 220
    }
  ]
}
```

<!-- call: rightBranch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRightBranch({ b, J, P, M }: Ctx) {
  const WIRE = P.wire, STEEL = P.steel, RIVET = P.rivet, BLACK = P.black;
  const T = 0.012;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const wire = (a: number[], c: number[], r = 0.0045) =>
    b.rod(a as any, c as any, r, WIRE, { sides: 6 } as any);
  const ball = (p: number[], r: number, col = BLACK) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p as any });
  const rivet = (p: number[], r = 0.007) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), RIVET, { at: p as any });
  // eyelet: small steel torus in the XY plane yawed
  const eyelet = (p: number[], yaw: number) =>
    b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), STEEL, {
      at: p as any,
      rotation: [0, yaw, 0],
    });
  const collar = (p: number[], h = 0.03) =>
    b.part(new THREE.CylinderGeometry(0.012, 0.012, h, 8), STEEL, { at: p as any });

  // shape: extrude outline in local XY, hangs with top at (x, topY, z), yawed
  const shape = (outline: any[], top: number[], yaw: number, col: string, smooth = 2) => {
    const dir: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const s = b.extrude(outline, {
      at: top as any,
      x: dir,
      thickness: T,
      bevel: 0.003,
      smoothing: smooth,
      color: col,
    });
    return { s, dir };
  };
  const hangShape = (outline: any[], topY: number, x: number, z: number, yaw: number, col: string) => {
    // eyelet above top, wire from arm to eyelet is done by caller
    const r = shape(outline, [x, topY, z], yaw, col);
    eyelet([x, topY + 0.012, z], yaw);
    rivet([x, topY - 0.02, z + 0.0], 0.008);
    return r;
  };
  const disc = (c: number[], r: number, yaw: number, col: string) => {
    const g = new THREE.CylinderGeometry(r, r, T, 20);
    g.rotateX(Math.PI / 2);
    b.part(g, col, { at: c as any, rotation: [0, yaw * 180 / Math.PI, 0] });
    eyelet([c[0], c[1] + r + 0.012, c[2]], yaw);
  };

  // ---- hanger from A1 right end to A3 centre
  const A1 = M.armA1RightEnd, A3 = M.armA3Center;
  wire(A1, A3, 0.005);
  eyelet([A1[0], A1[1], A1[2]], Math.PI / 2);
  collar([A1[0], A1[1] - 0.04, A1[2]]);
  collar([A3[0], A3[1] + 0.03, A3[2]], 0.04);

  // ---- arm A3
  const d = v(0.85, 0, -0.53).normalize();
  const c = v(...A3);
  const eF = c.clone().addScaledVector(d, -0.42); // front (+Z)
  const eB = c.clone().addScaledVector(d, 0.42);
  const eFa = M.armA3EndFront, eBa = M.armA3EndBack;
  const F = v(...eFa), B = v(...eBa);
  b.rod(F, B, 0.007, BLACK, { sides: 8 } as any);
  ball([F.x, F.y, F.z], 0.022);
  ball([B.x, B.y, B.z], 0.022);
  eyelet([F.x, F.y - 0.02, F.z], 0.5);
  eyelet([B.x, B.y - 0.02, B.z], 0.5);
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.03, 8), STEEL, { at: A3 as any });

  // ---- front: wire 0.35 down to A3a centre
  const aC = [F.x, 0.95, F.z];
  wire([F.x, F.y - 0.02, F.z], [aC[0], aC[1] + 0.02, aC[2]]);
  collar([aC[0], aC[1] + 0.02, aC[2]], 0.03);
  const aL = [aC[0] - 0.25, 0.95, aC[2]];
  const aR = [aC[0] + 0.25, 0.95, aC[2]];
  b.rod(aL as any, aR as any, 0.006, BLACK, { sides: 8 } as any);
  ball(aL, 0.018);
  ball(aR, 0.018);

  // blue leaf from left (-X) end, wire 0.1
  const leaf = [
    [0, 0], [0.07, -0.08], [0.1, -0.25], [0.06, -0.42], [0, -0.5],
    [-0.06, -0.42], [-0.1, -0.25], [-0.07, -0.08],
  ];
  const lx = aL[0], ltop = 0.95 - 0.1 - 0.02;
  wire([lx, 0.95, aC[2]], [lx, ltop + 0.012, aC[2]]);
  const yawL = 0.7;
  hangShape(leaf.map(([x, y]) => [x, y, ...(y === 0 || y === -0.5 ? ["sharp"] : [])]), ltop, lx, aC[2], yawL, P.blue);
  // midrib
  const dl = [Math.cos(yawL), 0, -Math.sin(yawL)];
  b.extrude(
    [[-0.006, -0.04], [0.006, -0.04], [0.006, -0.46], [-0.006, -0.46]],
    { at: [lx + dl[2] * 0, ltop, aC[2] + 0.0] as any, x: dl as any, thickness: T + 0.006, color: P.blueDeep } as any,
  );

  // red disc from right end on 0.4 wire
  const rx = aR[0];
  wire([rx, 0.95, aC[2]], [rx, 0.95 - 0.4 + 0.06, aC[2]]);
  disc([rx, 0.95 - 0.4, aC[2]], 0.06, 0.3, P.red);
  rivet([rx, 0.95 - 0.4 + 0.0, aC[2] + 0.008], 0.008);

  // ---- back: wire 0.2 down to boomerang apex
  wire([B.x, B.y - 0.02, B.z], [B.x, B.y - 0.2 + 0.012, B.z]);
  const topY = B.y - 0.2;
  collar([B.x, B.y - 0.1, B.z], 0.02);
  const yawB = 0.7;
  const boom = [
    [0, 0, "sharp"], [0.1, -0.02], [0.25, -0.12], [0.24, -0.2], [0.1, -0.12],
    [0, -0.12], [-0.1, -0.12], [-0.24, -0.2], [-0.25, -0.12], [-0.1, -0.02],
  ];
  // smooth V: lower the apex pocket
  hangShape(boom as any, topY, B.x, B.z, yawB, BLACK);
  rivet([B.x, topY - 0.05, B.z], 0.009);
  // thread to white disc at y~0.5
  const bx = B.x + 0.0;
  wire([bx, topY - 0.12, B.z], [bx, 0.5 + 0.05 + 0.012, B.z], 0.0025);
  disc([bx, 0.5, B.z], 0.05, 0.2, P.white);
  rivet([bx, 0.5 + 0.03, B.z + 0.008], 0.006);

  void frame; void rng;
}
```

<!-- call: crown -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCrown({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const WIRE = P.wire, STEEL = P.steel, RIV = P.rivet, BLACK = P.black;

  // ---------- helpers ----------
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { sides: 6 });
  const ball = (p: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p });
  const rivet = (p: number[], r = 0.007) => ball(p, r, RIV);
  // eyelet ring in the XY plane facing yaw
  const eyelet = (p: number[], r: number, yaw = 0) =>
    b.part(new THREE.TorusGeometry(r, 0.0035, 5, 12), STEEL, { at: p, rotation: [0, yaw, 0] });
  const sleeve = (p: number[], len: number, r: number) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), STEEL, { at: p });

  // ---------- ceiling rosette ----------
  const [hx, hy, hz] = M.ceilingHook;
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.03],
      [0.06, 0.04],
      [0, 0.04],
    ],
    { at: [hx, hy - 0.04, hz], color: P.ceiling, segments: 16 },
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 12), STEEL, { at: [hx, hy - 0.043, hz] });
  // hook: ring under rosette
  eyelet([hx, hy - 0.065, hz], 0.02, 0);
  rivet([hx, hy - 0.045, hz], 0.01);
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 8), STEEL, { at: [hx, hy - 0.05, hz] });

  // ---------- hanging wire from hook to arm ----------
  const [ax, ay, az] = M.armA1Center;
  rod([hx, hy - 0.085, hz], [ax, ay + 0.02, az], 0.0045, WIRE);
  sleeve([ax, ay + 0.045, az], 0.03, 0.011);
  rivet([ax, ay + 0.065, az], 0.006);

  // ---------- arm A1 ----------
  rod([-1.0, ay, 0], [1.0, ay, 0], 0.008, BLACK);
  // central collar
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), STEEL, { at: [ax, ay, az], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8), BLACK, { at: [ax + 0.03, ay, az], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8), BLACK, { at: [ax - 0.03, ay, az], rotation: [0, 0, 90] });
  rivet([ax, ay + 0.015, az + 0.001], 0.006);

  // ends: eyelets, hanger tops, counterweights
  for (const s of [1, -1]) {
    const ex = s * 0.85;
    eyelet([ex, ay - 0.012, 0], 0.016, 90);
    sleeve([ex, ay, 0], 0.03, 0.0105);
    b.part(new THREE.CylinderGeometry(0.0105, 0.0105, 0.004, 8), RIV, { at: [ex, ay + 0.02, 0] });
    rivet([ex, ay + 0.012, 0.011], 0.005);
    rod([ex, ay - 0.026, 0], [ex, ay - 0.06, 0], 0.003, WIRE);
    // counterweight
    ball([s * 0.99, ay, 0], 0.03, BLACK);
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 8), STEEL, { at: [s * 0.955, ay, 0], rotation: [0, 0, 90] });
    rivet([s * 0.99, ay + 0.03, 0], 0.006);
    // end cap
    ball([s * 1.0, ay, 0], 0.012, STEEL);
  }

  // ---------- pivot wire down to A4 ----------
  const [px, py, pz] = M.armA4Center;
  sleeve([ax, ay - 0.04, az], 0.03, 0.0085);
  rod([ax, ay - 0.05, az], [px, py + 0.04, pz], 0.005, WIRE);
  // mid ferrule
  sleeve([px, (ay + py) / 2, pz], 0.025, 0.0085);
  rivet([px + 0.009, (ay + py) / 2, pz], 0.004);
  // end eyelet
  eyelet([px, py + 0.025, pz], 0.016, 90);
  sleeve([px, py + 0.05, pz], 0.02, 0.009);

  // ---------- small hanging accents ----------
  const shape = (outline: [number, number][], at: number[], yawDeg: number, col: string) => {
    const e = b.extrude(outline, {
      at,
      x: [Math.cos((yawDeg * Math.PI) / 180), 0, -Math.sin((yawDeg * Math.PI) / 180)],
      thickness: 0.012,
      bevel: 0.002,
      color: col,
    });
    return e;
  };
  const disc = (r: number, n = 20) => {
    const o: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return o;
  };
  const hangDisc = (cx: number, cy: number, cz: number, r: number, yaw: number, col: string) => {
    const topY = cy + r;
    shape(disc(r), [cx, cy, cz], yaw, col);
    // wire to arm
    rod([cx, ay - 0.004, cz], [cx, topY + 0.02, cz], 0.003, WIRE);
    eyelet([cx, topY + 0.012, cz], 0.009, yaw + 90);
    rivet([cx, topY - 0.015, cz + 0.008 * Math.cos((yaw * Math.PI) / 180)], 0.005);
    rivet([cx, topY - 0.015, cz - 0.008 * Math.cos((yaw * Math.PI) / 180)], 0.005);
    sleeve([cx, ay - 0.012, cz], 0.012, 0.006);
  };
  hangDisc(0.38, 1.8, 0, 0.08, 35, P.yellow);
  // yellow inner rim highlight
  hangDisc(-0.45, 1.82, 0, 0.07, -45, BLACK);

  // white mini leaf, hung from wire at x=-0.1, z=0.06
  {
    const lx = -0.1, lz = 0.06, top = 1.83, h = 0.1;
    const leaf: [number, number][] = [
      [0, 0.0],
      [0.03, 0.025],
      [0.038, 0.06],
      [0.022, 0.09],
      [0, 0.1],
      [-0.022, 0.09],
      [-0.038, 0.06],
      [-0.03, 0.025],
    ];
    const yaw = 20;
    const e = b.extrude(leaf.map(([x, y]) => [x, y - h] as [number, number]), {
      at: [lx, top, lz],
      x: [Math.cos((yaw * Math.PI) / 180), 0, -Math.sin((yaw * Math.PI) / 180)],
      thickness: 0.012,
      bevel: 0.002,
      smoothing: 1,
      color: P.white,
    });
    // midrib
    b.part(new THREE.BoxGeometry(0.003, 0.07, 0.003), RIV, {
      at: [lx, top - 0.05, lz + 0.007],
      rotation: [0, yaw, 0],
    });
    rod([lx, ay - 0.004, lz], [lx, top + 0.015, lz], 0.003, WIRE);
    eyelet([lx, top + 0.008, lz], 0.008, yaw + 90);
    rivet([lx, top - 0.012, lz + 0.008], 0.005);
    sleeve([lx, ay - 0.012, lz], 0.012, 0.006);
    // wire link between arm and leaf wire: tiny clamp
    ball([lx, ay, lz], 0.007, STEEL);
  }
  // arm-side small clamp balls where discs hang
  for (const x of [0.38, -0.45]) ball([x, ay, 0], 0.008, STEEL);
  void R; void frame; void J;
}
```

<!-- call: centreBranch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCentreBranch({ b, J, P, M }: Ctx) {
  const WIRE = P.wire, STEEL = P.steel, RIVET = P.rivet, BLACK = P.black;
  const cx = M.armA4Center[0], cy = M.armA4Center[1];
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const wire = (a: number[], c: number[], r = 0.005, col = WIRE) =>
    b.rod(V(a[0], a[1], a[2]), V(c[0], c[1], c[2]), r, col, { sides: 6 } as any);
  const ball = (p: number[], r: number, col = BLACK) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: V(p[0], p[1], p[2]) });
  const rivet = (p: number[], r = 0.007) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), RIVET, { at: V(p[0], p[1], p[2]) });
  const eyelet = (p: number[], axisY = false) =>
    b.part(new THREE.TorusGeometry(0.014, 0.0035, 5, 10), STEEL, {
      at: V(p[0], p[1], p[2]),
      rotation: axisY ? [90, 0, 0] : [0, 90, 0],
    });

  // Shape builder: outline is in metres, origin at the eyelet (top), hanging down.
  const sheet = (outline: any[], at: number[], yawDeg: number, col: string, thick = 0.012) => {
    const yaw = (yawDeg * Math.PI) / 180;
    const x: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
    return b.extrude(outline, { at: V(at[0], at[1], at[2]), x, y: [0, 1, 0], thickness: thick, bevel: 0.003, smoothing: 1, color: col });
  };
  const disc = (r: number, n = 14) => {
    const o: any[] = [];
    for (let i = 0; i < n; i++) o.push([r * Math.sin((i / n) * Math.PI * 2), -r + r * Math.cos((i / n) * Math.PI * 2)]);
    return o;
  };
  // Inset disc on the face of a sheet (face offset along thickness axis).
  const insetDisc = (centre: number[], yawDeg: number, r: number, col: string, off: number) => {
    const yaw = (yawDeg * Math.PI) / 180;
    const nrm = [Math.sin(yaw), 0, Math.cos(yaw)];
    const o = disc(r);
    const p = [centre[0] + nrm[0] * off, centre[1] + r, centre[2] + nrm[2] * off];
    sheet(o, p, yawDeg, col, 0.006);
  };

  // ---- Arm A4 along Z
  const front = V(0, cy, 0.75), back = V(0, cy, -0.75);
  b.rod(back, front, 0.008, BLACK, { sides: 8 } as any);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 8), STEEL, { at: V(cx, cy, 0), rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), STEEL, { at: V(cx, cy + 0.02, 0) });
  for (const z of [0.75, -0.75]) {
    ball([0, cy, z + (z > 0 ? 0.025 : -0.025)], 0.025);
    eyelet([0, cy - 0.016, z * 0.96], false);
    rivet([0, cy, z * 0.96], 0.008);
  }

  // ---- Front: long wire to tall blue leaf
  const fz = 0.72;
  wire([0, cy - 0.016, fz], [0, 0.57, fz]);
  const leafTop = 0.55, leafH = 0.55 + 0.015, leafW = 0.3;
  const leaf: any[] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 top .. 1 bottom
    const w = (leafW / 2) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.08)), 0.9) * (t > 0.95 ? 0 : 1);
    leaf.push([w, -t * leafH]);
  }
  for (let i = N - 1; i >= 1; i--) {
    const p = leaf[i];
    leaf.push([-p[0], p[1]]);
  }
  leaf[N] = [0, -leafH, "sharp"];
  const leafOut = leaf.filter((p, i) => i === 0 || p[0] !== 0 || p[2]);
  leafOut.unshift([0, 0.0, "sharp"]);
  const dedup = leafOut.filter((p, i) => i === 0 || !(p[0] === leafOut[i - 1][0] && p[1] === leafOut[i - 1][1]));
  const leafY = leafTop;
  sheet(dedup, [0, leafY, fz], 15, P.blue);
  // midrib
  const yaw15 = (15 * Math.PI) / 180;
  const nrm = [Math.sin(yaw15), 0, Math.cos(yaw15)];
  b.rod(V(nrm[0] * 0.008, leafY - 0.04, fz + nrm[2] * 0.008), V(nrm[0] * 0.008, leafY - leafH + 0.06, fz + nrm[2] * 0.008), 0.004, P.blueDeep, { sides: 6 } as any);
  insetDisc([nrm[0] * 0.006, leafY - 0.26 - 0.07, fz + nrm[2] * 0.006], 15, 0.07, P.yellow, 0.005);
  eyelet([0, leafY + 0.012, fz]);
  rivet([nrm[0] * 0.008, leafY - 0.03, fz + nrm[2] * 0.008]);
  rivet([0, leafY - 0.0, fz], 0.008);

  // ---- Back: wire to sub-arm A4b
  const bz = -0.75, sy = 0.75;
  wire([0, cy - 0.016, bz], [0, sy, bz]);
  b.part(new THREE.SphereGeometry(0.014, 6, 4), STEEL, { at: V(0, sy, bz) });
  b.rod(V(-0.35, sy, bz), V(0.35, sy, bz), 0.007, BLACK, { sides: 8 } as any);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 8), STEEL, { at: V(0, sy, bz), rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    ball([s * 0.372, sy, bz], 0.02);
    eyelet([s * 0.33, sy - 0.014, bz], false);
  }

  // red disc on +X end
  const rx = 0.33, rr = 0.11;
  const rtop = sy - 0.25;
  wire([rx, sy - 0.014, bz], [rx, rtop + 0.002, bz]);
  sheet(disc(rr, 16), [rx, rtop, bz], 35, P.red);
  const y35 = (35 * Math.PI) / 180;
  const n35 = [Math.sin(y35), 0, Math.cos(y35)];
  insetDisc([rx + n35[0] * 0.006, rtop - rr, bz + n35[2] * 0.006], 35, 0.035, BLACK, 0.005);
  eyelet([rx, rtop + 0.012, bz]);
  rivet([rx, rtop - 0.01, bz + 0.007]);

  // white rounded triangle on -X end
  const wx = -0.33, wtop = sy - 0.3 + 0.0;
  wire([wx, sy - 0.014, bz], [wx, wtop + 0.002, bz]);
  const tri: any[] = [];
  const corners = [[0, 0], [0.11, -0.19], [-0.11, -0.19]];
  const cc = [0, -0.1];
  for (let k = 0; k < 3; k++) {
    const c = corners[k];
    const d = [cc[0] - c[0], cc[1] - c[1]];
    const L = Math.hypot(d[0], d[1]);
    const ox = c[0] + (d[0] / L) * 0.02, oy = c[1] + (d[1] / L) * 0.02;
    const a0 = Math.atan2(c[1] - cc[1], c[0] - cc[0]);
    for (let j = -2; j <= 2; j++) {
      const a = a0 + (j * 0.45);
      tri.push([ox + Math.cos(a) * 0.02, oy + Math.sin(a) * 0.02]);
    }
  }
  sheet(tri, [wx, wtop, bz], -30, P.white);
  eyelet([wx, wtop + 0.012, bz]);
  rivet([wx + 0.003, wtop - 0.04, bz + 0.007], 0.006);
}
```

<!-- call: leftBranch -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLeftBranch({ b, J, P, M }: Ctx) {
  type V = [number, number, number];
  const rad = (d: number) => (d * Math.PI) / 180;

  // ---------- helpers ----------
  const wire = (a: V, c: V, r = 0.0045, col = P.wire) => b.rod(a, c, r, col);
  const ball = (p: V, r: number, col = P.black) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p });
  const ring = (p: V, yaw: number, r = 0.011, tube = 0.003) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 10), P.steel, { at: p, rotation: [0, yaw, 0] });
  const collar = (p: V, r = 0.011, h = 0.03) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 8), P.steel, { at: p });

  const normalOf = (yaw: number): V => [Math.sin(rad(yaw)), 0, Math.cos(rad(yaw))];
  const xOf = (yaw: number): V => [Math.cos(rad(yaw)), 0, -Math.sin(rad(yaw))];

  const circle = (r: number, n = 16): any[] => {
    const o: any[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      o.push([r * Math.cos(t), -r + r * Math.sin(t)]);
    }
    return o;
  };

  // top of outline sits at `top`; shape hangs below it
  function hang(top: V, outline: any[], col: string, yaw: number, wireFrom: V, thick = 0.012) {
    const n = normalOf(yaw);
    b.extrude(outline as any, {
      at: top,
      x: xOf(yaw),
      thickness: thick,
      bevel: Math.min(0.003, thick / 2 - 0.0005),
      color: col,
    });
    ring([top[0], top[1] + 0.011, top[2]], yaw);
    wire(wireFrom, [top[0], top[1] + 0.022, top[2]]);
    for (const s of [1, -1])
      ball(
        [top[0] + n[0] * 0.008 * s, top[1] - 0.022, top[2] + n[2] * 0.008 * s],
        0.0055,
        P.rivet,
      );
    return n;
  }

  // ---------- shapes ----------
  const kidney = (): any[] => {
    const o: any[] = [];
    const N = 28;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      let y = -0.15 + 0.15 * Math.sin(t);
      if (Math.sin(t) < 0) y += 0.055 * Math.exp(-Math.pow(t - 1.5 * Math.PI, 2) / 0.25);
      o.push([0.21 * Math.cos(t), y]);
    }
    return o;
  };

  const crescent = (): any[] => {
    const o: any[] = [];
    const sx = 1.5;
    for (let a = 90; a <= 270; a += 15) {
      const t = rad(a);
      o.push([0.15 * Math.cos(t) * sx, -0.15 + 0.15 * Math.sin(t)]);
    }
    const c = 0.09;
    const r = Math.hypot(c, 0.15);
    const a0 = Math.atan2(-0.15, -c) + (Math.atan2(-0.15, -c) < 0 ? Math.PI * 2 : 0); // bottom tip
    const a1 = Math.atan2(0.15, -c); // top tip
    const K = 9;
    for (let i = 1; i < K; i++) {
      const a = a0 + ((a1 - a0) * i) / K;
      o.push([(c + r * Math.cos(a)) * sx, -0.15 + r * Math.sin(a)]);
    }
    return o;
  };

  const teardrop = (): any[] => {
    const o: any[] = [[0, 0, "sharp"]];
    for (let a = 30; a >= -210; a -= 20) {
      const t = rad(a);
      o.push([0.06 * Math.cos(t), -0.22 + 0.06 * Math.sin(t)]);
    }
    return o;
  };

  // ---------- hanger from crown eyelet to arm A2 ----------
  const A1L: V = [M.armA1LeftEnd[0], M.armA1LeftEnd[1], M.armA1LeftEnd[2]];
  const A2c: V = [M.armA2Center[0], M.armA2Center[1], M.armA2Center[2]];
  wire([A1L[0], A1L[1] - 0.012, A1L[2]], [A2c[0], A2c[1] + 0.012, A2c[2]], 0.005);
  collar([A2c[0], A2c[1] + 0.035, A2c[2]], 0.0115, 0.03);
  collar([A2c[0], A2c[1], A2c[2]], 0.012, 0.022);
  ball([A1L[0], A1L[1] - 0.02, A1L[2]], 0.006, P.rivet);

  // ---------- arm A2 ----------
  const len = Math.hypot(0.85, 0.53);
  const d: V = [0.85 / len, 0, 0.53 / len];
  const H = 0.42;
  const endF: V = [A2c[0] + d[0] * H, A2c[1], A2c[2] + d[2] * H];
  const endB: V = [A2c[0] - d[0] * H, A2c[1], A2c[2] - d[2] * H];
  b.rod(endB, endF, 0.007, P.black);
  ball([endF[0] + d[0] * 0.03, endF[1], endF[2] + d[2] * 0.03], 0.022);
  ball([endB[0] - d[0] * 0.03, endB[1], endB[2] - d[2] * 0.03], 0.022);
  // small steel sleeves near the ends
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.02, 8), P.steel, {
      at: [A2c[0] + d[0] * (H - 0.04) * s, A2c[1], A2c[2] + d[2] * (H - 0.04) * s],
      dir: d,
    });
  }
  // eyelets at the arm ends (hanging below the arm)
  const yawArm = (Math.atan2(d[0], d[2]) * 180) / Math.PI;
  ring([endF[0], endF[1] - 0.012, endF[2]], yawArm + 90);
  ring([endB[0], endB[1] - 0.012, endB[2]], yawArm + 90);

  // ---------- front end: big red kidney ----------
  {
    const top: V = [endF[0], 1.1, endF[2]];
    const yaw = 25;
    const n = hang(top, kidney(), P.red, yaw, [endF[0], endF[1] - 0.02, endF[2]], 0.012);
    // inset dark-red disc, layered in front
    b.extrude(circle(0.06) as any, {
      at: [top[0] + n[0] * 0.0105, top[1] - 0.09, top[2] + n[2] * 0.0105],
      x: xOf(yaw),
      thickness: 0.006,
      bevel: 0.002,
      color: P.redDeep,
    });
    // tiny steel rivet at the centre of the inset
    ball(
      [top[0] + n[0] * 0.0145, top[1] - 0.15, top[2] + n[2] * 0.0145],
      0.005,
      P.rivet,
    );
  }

  // ---------- back end: wire down to sub-arm A2b ----------
  const subC: V = [endB[0], 1.25, endB[2]];
  wire([endB[0], endB[1] - 0.02, endB[2]], [subC[0], subC[1] + 0.012, subC[2]], 0.005);
  collar([subC[0], subC[1] + 0.005, subC[2]], 0.0115, 0.03);
  const dl = Math.hypot(0.5, 0.87);
  const e: V = [0.5 / dl, 0, -0.87 / dl];
  const HB = 0.25;
  const sE1: V = [subC[0] + e[0] * HB, subC[1], subC[2] + e[2] * HB]; // toward back-right
  const sE2: V = [subC[0] - e[0] * HB, subC[1], subC[2] - e[2] * HB]; // toward front
  b.rod(sE2, sE1, 0.006, P.black);
  ball(sE1, 0.015);
  ball(sE2, 0.015);
  const yawSub = (Math.atan2(e[0], e[2]) * 180) / Math.PI;
  ring([sE1[0], sE1[1] - 0.011, sE1[2]], yawSub + 90, 0.009, 0.0025);
  ring([sE2[0], sE2[1] - 0.011, sE2[2]], yawSub + 90, 0.009, 0.0025);

  // yellow crescent on a 0.15 wire
  {
    const top: V = [sE2[0], subC[1] - 0.15, sE2[2]];
    const n = hang(top, crescent(), P.yellow, 60, [sE2[0], sE2[1] - 0.02, sE2[2]]);
    // small black accent dot on the crescent
    const m: V = [top[0], top[1] - 0.15, top[2]];
    ball([m[0] + n[0] * 0.009, m[1], m[2] + n[2] * 0.009], 0.006, P.black);
  }

  // black teardrop on a 0.35 wire, white disc dangling below
  {
    const top: V = [sE1[0], subC[1] - 0.35, sE1[2]];
    const yaw = -20;
    const n = hang(top, teardrop(), P.black, yaw, [sE1[0], sE1[1] - 0.02, sE1[2]]);
    // white highlight sliver
    b.extrude(
      [
        [0, 0],
        [0.012, -0.05],
        [0.004, -0.15],
        [-0.006, -0.08],
      ] as any,
      {
        at: [top[0] + n[0] * 0.0085 - 0.014 * xOf(yaw)[0], top[1] - 0.04, top[2] + n[2] * 0.0085 - 0.014 * xOf(yaw)[2]],
        x: xOf(yaw),
        thickness: 0.004,
        color: P.white,
      },
    );
    // thread + white disc
    const botY = top[1] - 0.28;
    const discTop = botY - 0.06;
    wire([top[0], botY + 0.012, top[2]], [top[0], discTop + 0.022, top[2]], 0.002);
    hang([top[0], discTop, top[2]], circle(0.035, 14), P.white, 70, [top[0], botY + 0.012, top[2]], 0.01);
  }
}
```