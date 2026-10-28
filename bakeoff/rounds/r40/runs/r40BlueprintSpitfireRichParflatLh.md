<!-- call: plan -->

```json
{
  "name": "Spitfire Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter drawn as a cyanotype blueprint: deep Prussian-blue airframe with white-line panel seams, ribs, rivets and callout details, standing on its undercarriage.",
  "builderName": "spitfireBlueprint",
  "size": [11.2, 3.5, 9.1],
  "layout": "Single-engine low-wing monoplane facing +Z. Propeller spinner at z=+4.2, long nose with Merlin cowl, cockpit with bubble canopy at z~0 to -0.9, tapering fuselage to a tail at z=-4.4 with fin and tailplane. Elliptical wings span x=+-5.6 at y~1.0, with a slight dihedral, round tips, and the gear legs under the wing at x=+-1.4. Tail wheel under the rear. Everything is a flat cyanotype colour: Prussian-blue hull panels, paler cyan wing skin, and white linework as thin parts (panel seams, ribs, rivet rows, roundel rings, stencil bars) seated on surfaces. Lowest points (tyres) rest on y=0. Roundels are concentric flat discs: white, mid blue, pale cyan.",
  "palette": {
    "hullBlue": "#12408a",
    "deepBlue": "#0a2a60",
    "wingBlue": "#1e58a8",
    "paleCyan": "#8cc4ec",
    "line": "#e8f4ff",
    "lineDim": "#a9cdee",
    "glass": "#5aa0d8",
    "tyre": "#071c40",
    "metal": "#3a78bf",
    "prop": "#0c336f"
  },
  "mounts": {
    "noseFace": [0, 1.5, 2.6],
    "spinnerBase": [0, 1.5, 3.3],
    "wingRoot": [0, 1.1, 0.3],
    "cockpitCentre": [0, 2.0, -0.2],
    "tailRoot": [0, 1.7, -3.3],
    "gearL": [1.4, 1.0, 0.7],
    "gearR": [-1.4, 1.0, 0.7],
    "tailWheel": [0, 0.4, -3.9]
  },
  "joints": [
    { "name": "body", "at": [0, 1.5, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "propeller", "parent": "body", "at": [0, 1.5, 3.3], "dir": [0, 0, 1], "role": "hinge" },
    { "name": "gearL", "parent": "body", "at": [1.4, 1.0, 0.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "gearR", "parent": "body", "at": [-1.4, 1.0, 0.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "tailWheel", "parent": "body", "at": [0, 0.7, -3.9], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "nose",
      "builds": "Engine nose forward of z=0.8: Merlin cowling loft in hullBlue, exhaust stacks (3 per side as small deepBlue cylinders with line rings), cowl panel seams and rivet rows in line, spinner cone in deepBlue with a line band, the three-blade propeller on the propeller joint (prop blue, white tip stripes), radiator scoop under the nose.",
      "box": [[-1.3, 0.6, 0.8], [1.3, 2.4, 4.3]],
      "attaches": "Meets fuselage at z=0.8 on the body joint; prop on propeller joint at spinnerBase.",
      "joints": ["body", "propeller"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "fuselage",
      "builds": "Fuselage from z=0.8 to the tail root at z=-4.4: lofted tapering hullBlue body with paleCyan belly sector, white seam rings and a longitudinal seam, rivet rows, the glass bubble canopy with line frame ribs and sliding rail, headrest, gun-sight, fuselage roundels on both sides (white, blue, cyan discs), serial stencil bars, a cockpit interior in deepBlue with stick and seat.",
      "box": [[-0.75, 0.9, -4.4], [0.75, 2.6, 0.8]],
      "attaches": "Front at nose z=0.8; wings at wingRoot; tail at tailRoot.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wings",
      "builds": "Two elliptical wings from the wingRoot, in wingBlue top and paleCyan underside, sweeping to rounded tips at x=+-5.6, slight dihedral, thickness tapering. Detail as separate parts: rib lines in white spanwise and chordwise, aileron and flap hinge lines, four-gun port panels with small barrels, wing roundels on the top surface, landing light, rivet rows, a white outline along the leading edge, and wing-root fillets.",
      "box": [[-5.6, 0.8, -1.2], [5.6, 1.6, 1.6]],
      "attaches": "Root at wingRoot on the body joint; gear legs hang from the gearL and gearR mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "tail",
      "builds": "Empennage at the rear: vertical fin and rudder as extrudes in hullBlue with white hinge line and ribs and a roundel flash, horizontal tailplanes with elevators (elliptical, span x=+-1.6), tail cone, a tailwheel leg and small tyre on the tailWheel joint, an arrestor hook, a navigation light, and rivet and rib lines.",
      "box": [[-1.7, 0.3, -4.5], [1.7, 3.5, -3.0]],
      "attaches": "Root at tailRoot on the body joint; tailwheel on the tailWheel joint.",
      "joints": ["body", "tailWheel"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "gear",
      "builds": "Main undercarriage: two oleo legs in metal on the gearL/gearR joints splayed outward, with a white torque link, a fork, a tyre (tyre colour, 12 sides) and hub disc with line spokes, plus wheel-well door panels in deepBlue hung beside each leg, brake line details and cyan highlight rings. Tyre bottoms at y=0.",
      "box": [[-1.9, 0, 0.2], [1.9, 1.1, 1.2]],
      "attaches": "Hangs from the gearL and gearR mounts under the wings.",
      "joints": ["gearL", "gearR"],
      "floor": true,
      "budget": 130
    }
  ]
}
```

<!-- call: gear -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

type Ctx = any;

export function buildGear({ b, J, P, M }: Ctx) {
  const hull: string = P.hullBlue ?? P.hull ?? "#12408a";
  const deep: string = P.deepBlue ?? P.deep ?? "#0a2a60";
  const cyan: string = P.paleCyan ?? P.cyan ?? "#8cc4ec";
  const line: string = P.line ?? "#e8f4ff";
  const lineDim: string = P.lineDim ?? "#a9cdee";
  const tyreC: string = P.tyre ?? "#071c40";
  const metal: string = P.metal ?? "#3a78bf";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const r = rng(11);
  void r;
  void M;

  const WHEEL_R = 0.38;
  const WHEEL_W = 0.2;
  const WY = 0.375;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bone = s > 0 ? J.gearL : J.gearR;

    // ---- key points -------------------------------------------------------------------
    const T = V(s * 1.4, 1.0, 0.7); // hip, under the wing
    const F = V(s * 1.6, 0.55, 0.73); // bottom of the oleo
    const W = V(s * 1.75, WY, 0.75); // wheel centre
    const legDir = F.clone().sub(T).normalize();
    const lp = (t: number) => T.clone().lerp(F, t);

    const wheelJ = b.joint(`gearWheel${side}`, {
      parent: bone,
      at: W.toArray(),
      dir: [s, 0, 0],
      role: "hinge",
    });

    // ---- oleo leg ---------------------------------------------------------------------
    b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.045, 10), deep, { at: T.toArray(), bone });
    b.rod(T, lp(0.56), 0.072, metal, { bone });
    b.rod(lp(0.5), F, 0.046, cyan, { bone });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), deep, {
      at: lp(0.56).toArray(),
      dir: legDir.toArray(),
      bone,
    });
    for (const t of [0.1, 0.56]) {
      b.part(new THREE.TorusGeometry(0.085, 0.008, 4, 10), line, {
        at: lp(t).toArray(),
        dir: legDir.toArray(),
        axis: "z",
        bone,
      });
    }
    // trailing leg fairing fin
    b.sweep([lp(0.03).toArray(), lp(0.62).toArray()], (t: number) => [0.02, 0.085 - 0.03 * t], {
      up: [0, 0, 1],
      shift: [0, -0.1],
      section: "box",
      caps: "flat",
      color: hull,
      bone,
    });
    // fairing seam line
    b.rod(
      lp(0.08).clone().add(V(s * 0.0, 0, -0.1)),
      lp(0.58).clone().add(V(s * 0.0, 0, -0.1)),
      0.006,
      line,
      { bone },
    );
    // retraction jack
    b.rod(V(s * 1.05, 1.0, 0.55), lp(0.38).clone().add(V(0, 0, 0.05)), 0.018, lineDim, { bone });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), metal, { at: V(s * 1.05, 1.0, 0.55).toArray(), bone });

    // ---- torque link (scissor) ---------------------------------------------------------
    const a1 = lp(0.26).clone().add(V(0, 0, 0.09));
    const pv = lp(0.42).clone().add(V(0, 0, 0.14));
    const a2 = lp(0.58).clone().add(V(0, 0, 0.09));
    b.rod(a1, pv, 0.014, line, { bone });
    b.rod(pv, a2, 0.014, line, { bone });
    b.part(new THREE.SphereGeometry(0.026, 6, 4), line, { at: pv.toArray(), bone });
    for (const e of [a1, a2]) {
      b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), deep, { at: e.toArray(), bone });
    }

    // ---- fork and axle -----------------------------------------------------------------
    const Ai = V(s * 1.635, WY, 0.75);
    const Ao = V(s * 1.9, WY, 0.75);
    b.part(new THREE.SphereGeometry(0.065, 7, 5), metal, { at: F.toArray(), bone });
    b.rod(F.clone().add(V(0, 0, 0.035)), Ai.clone().add(V(0, 0, 0.03)), 0.032, metal, { bone });
    b.rod(F.clone().add(V(0, 0, -0.035)), Ai.clone().add(V(0, 0, -0.03)), 0.032, metal, { bone });
    b.rod(Ai, Ao, 0.034, lineDim, { bone: wheelJ });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 6), metal, {
      at: V(s * 1.905, WY, 0.75).toArray(),
      dir: [1, 0, 0],
      bone: wheelJ,
    });

    // ---- wheel -------------------------------------------------------------------------
    b.part(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 12), tyreC, {
      at: W.toArray(),
      dir: [1, 0, 0],
      bone: wheelJ,
    });
    for (const dx of [-0.055, 0.055]) {
      b.part(new THREE.CylinderGeometry(WHEEL_R + 0.004, WHEEL_R + 0.004, 0.012, 12), lineDim, {
        at: V(W.x + dx, W.y, W.z).toArray(),
        dir: [1, 0, 0],
        bone: wheelJ,
      });
    }
    // sidewall rings (outer and inner)
    for (const o of [1, -1]) {
      b.part(new THREE.TorusGeometry(0.33, 0.007, 4, 14), lineDim, {
        at: V(W.x + o * (WHEEL_W / 2 + 0.001), W.y, W.z).toArray(),
        dir: [1, 0, 0],
        axis: "z",
        bone: wheelJ,
      });
    }
    // outer hub disc, cyan rim ring, spokes, centre cap
    const faceX = W.x + s * (WHEEL_W / 2);
    b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 12), metal, {
      at: V(faceX + s * 0.001, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      bone: wheelJ,
    });
    b.part(new THREE.TorusGeometry(0.26, 0.009, 4, 14), cyan, {
      at: V(faceX + s * 0.012, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      axis: "z",
      bone: wheelJ,
    });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.008, 0.5, 0.024), line, {
        at: V(faceX + s * 0.012, W.y, W.z).toArray(),
        rotation: [k * 60, 0, 0],
        bone: wheelJ,
      });
    }
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), cyan, {
      at: V(faceX + s * 0.018, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      bone: wheelJ,
    });
    b.part(new THREE.TorusGeometry(0.1, 0.007, 4, 12), line, {
      at: V(faceX + s * 0.014, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      axis: "z",
      bone: wheelJ,
    });
    for (let k = 0; k < 6; k++) {
      const a = ((k * 60 + 30) * Math.PI) / 180;
      b.part(new THREE.SphereGeometry(0.014, 5, 4), line, {
        at: V(faceX + s * 0.013, W.y + 0.2 * Math.cos(a), W.z + 0.2 * Math.sin(a)).toArray(),
        bone: wheelJ,
      });
    }
    // inner brake drum
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.034, 10), metal, {
      at: V(s * 1.652, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      bone: wheelJ,
    });
    b.part(new THREE.TorusGeometry(0.2, 0.008, 4, 12), cyan, {
      at: V(s * 1.637, W.y, W.z).toArray(),
      dir: [1, 0, 0],
      axis: "z",
      bone: wheelJ,
    });

    // ---- brake line --------------------------------------------------------------------
    const brake = [
      T.clone().add(V(0, -0.06, -0.1)),
      lp(0.45).clone().add(V(0, 0, -0.11)),
      lp(0.9).clone().add(V(-s * 0.02, 0, -0.1)),
      V(s * 1.63, 0.46, 0.69),
    ];
    b.sweep(
      brake.map((p) => p.toArray()),
      0.011,
      { color: lineDim, caps: "round", bone },
    );
    for (const t of [0.3, 0.7]) {
      b.part(new THREE.BoxGeometry(0.04, 0.03, 0.03), line, {
        at: lp(t).clone().add(V(0, 0, -0.1)).toArray(),
        bone,
      });
    }

    // ---- wheel-well door ---------------------------------------------------------------
    const z0 = 0.38;
    const dAt = V(s * 1.2, 0.5, z0);
    const dy = V(-s * 0.15, 1, 0).normalize();
    const dz = V(0, 0, 1);
    const inward = V(-s, -0.15, 0).normalize();
    const dp = (u: number, v: number, out = 0) =>
      dAt.clone().addScaledVector(dz, u).addScaledVector(dy, v).addScaledVector(inward, out);

    b.extrude(
      [
        [0.0, 0.04],
        [0.55, 0.0],
        [0.7, 0.22],
        [0.66, 0.5],
        [0.04, 0.5],
      ],
      {
        at: dAt.toArray(),
        x: [0, 0, 1],
        y: dy.toArray(),
        thickness: 0.025,
        bevel: 0.004,
        color: deep,
        bone,
      },
    );
    const O = 0.016;
    // hinge line along the top
    b.rod(dp(0.02, 0.495, O * 0.6), dp(0.66, 0.495, O * 0.6), 0.012, line, { bone });
    // inset panel border
    const loopPts: [number, number][] = [
      [0.1, 0.1],
      [0.52, 0.07],
      [0.6, 0.23],
      [0.58, 0.42],
      [0.1, 0.42],
    ];
    for (let i = 0; i < loopPts.length; i++) {
      const [u1, v1] = loopPts[i];
      const [u2, v2] = loopPts[(i + 1) % loopPts.length];
      b.rod(dp(u1, v1, O), dp(u2, v2, O), 0.006, i % 2 ? lineDim : line, { bone });
    }
    // ribs
    b.rod(dp(0.1, 0.26, O), dp(0.6, 0.26, O), 0.005, lineDim, { bone });
    b.rod(dp(0.34, 0.07, O), dp(0.34, 0.42, O), 0.005, lineDim, { bone });
    // rivets
    for (let k = 0; k < 5; k++) {
      b.part(new THREE.SphereGeometry(0.012, 5, 4), line, {
        at: dp(0.1 + k * 0.1, 0.46, O).toArray(),
        bone,
      });
    }
  }
}
```

<!-- call: nose -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, frame } from "agentic-3js-builder";

export function buildNose({ b, J, P, M }: Ctx) {
  const pal = P as unknown as Record<string, string>;
  const pc = (keys: string[], fb: string) => {
    for (const k of keys) if (pal[k]) return pal[k];
    return fb;
  };
  const HULL = pc(["hullBlue", "hull"], "#12408a");
  const DEEP = pc(["deepBlue", "deep"], "#0a2a60");
  const PALE = pc(["paleCyan", "pale"], "#8cc4ec");
  const LINE = pc(["line"], "#e8f4ff");
  const DIM = pc(["lineDim"], "#a9cdee");
  const METAL = pc(["metal"], "#3a78bf");
  const PROP = pc(["prop"], "#0c336f");
  const TYRE = pc(["tyre"], "#071c40");

  const body = J.body;
  const prop = J.propeller;
  const SPIN = (M as any)?.spinnerBase ?? [0, 1.5, 3.3];
  const SZ = SPIN[2] as number;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ------------------------------------------------------------------ cowling
  const Z0 = 0.8;
  const Z1 = SZ;
  // z, centre y, half width, half height
  const st = [
    [0.8, 1.55, 0.62, 0.58],
    [1.2, 1.55, 0.56, 0.55],
    [1.8, 1.53, 0.5, 0.5],
    [2.4, 1.51, 0.44, 0.45],
    [2.9, 1.5, 0.395, 0.41],
    [3.3, 1.5, 0.37, 0.38],
  ];
  const at = (z: number, k: number) => {
    for (let i = 0; i < st.length - 1; i++) {
      if (z <= st[i + 1][0]) {
        const f = Math.min(Math.max((z - st[i][0]) / (st[i + 1][0] - st[i][0]), 0), 1);
        return st[i][k] + (st[i + 1][k] - st[i][k]) * f;
      }
    }
    return st[st.length - 1][k];
  };
  const cpath = catmull(st.map((s) => [0, s[1], s[0]]));
  const cowl = b.sweep(
    cpath,
    (t: number) => {
      const z = Z0 + t * (Z1 - Z0);
      return [at(z, 2), at(z, 3)] as [number, number];
    },
    {
      bone: body,
      color: HULL,
      sides: 16,
      caps: "flat",
      sectors: [[130, 230, PALE]],
    },
  );
  const surf = b.surface(cowl);

  // front lip ring where cowl meets spinner
  b.part(new THREE.TorusGeometry(0.385, 0.012, 4, 16), LINE, { bone: body, at: [0, 1.5, SZ - 0.03] });

  // ------------------------------------------------------------------ seams and rivets
  const rivetPts: THREE.Vector3[] = [];
  const collect = (path: any, n: number) =>
    b.along(path, n, (a: any) => {
      rivetPts.push(a.at.clone());
    });

  const seamZ = [1.15, 1.8, 2.45, 3.05];
  for (const z of seamZ) {
    const loop = surf.loop([0, at(z, 1), z], { dir: [0, 0, 1], lift: 0.006 });
    b.sweep(loop, 0.009, { bone: body, color: LINE, sides: 4 });
    const rl = surf.loop([0, at(z - 0.055, 1), z - 0.055], { dir: [0, 0, 1], lift: 0.008 });
    collect(rl, 30);
  }
  collect(surf.loop([0, at(3.2, 1), 3.2], { dir: [0, 0, 1], lift: 0.008 }), 24);

  for (const a of [0, 40, -40, 130, -130]) {
    b.sweep(cowl.line(a, 0.006), 0.008, { bone: body, color: a === 0 ? LINE : DIM, sides: 4 });
  }
  for (const a of [40, -40]) collect(cowl.line(a, 0.009), 22);

  // ------------------------------------------------------------------ rocker covers on top
  for (const s of [1, -1]) {
    const x = s * 0.17;
    const h = surf.ray([x, 3, 1.85], [0, -1, 0]);
    if (h) {
      b.stick(new THREE.BoxGeometry(0.13, 0.045, 1.15), DEEP, h, { embed: 0.5, flow: [0, 0, 1] });
    }
    for (let i = 0; i < 6; i++) {
      const z = 1.4 + i * 0.17;
      const hh = surf.ray([x, 3, z], [0, -1, 0]);
      if (hh) rivetPts.push(hh.at.clone().addScaledVector(hh.n, 0.024));
    }
  }

  // ------------------------------------------------------------------ side panels, stacks, stencils, hatches
  const fwd = V(0, 0, 1);
  const upv = V(0, 1, 0);
  const tangF = (n: THREE.Vector3) => fwd.clone().addScaledVector(n, -n.dot(fwd)).normalize();
  const tangU = (n: THREE.Vector3) => upv.clone().addScaledVector(n, -n.dot(upv)).normalize();

  const hatch = (s: number, z: number, el: number, w: number, h: number) => {
    const c = surf.around([0, at(z, 1), z]).at(s * 90, el);
    if (!c) return;
    const n = c.n.clone();
    const f = tangF(n);
    const u = tangU(n);
    const bars: [number, number, number, THREE.Vector3][] = [
      [0, h / 2, w, f],
      [0, -h / 2, w, f],
      [w / 2, 0, h, u],
      [-w / 2, 0, h, u],
    ];
    for (const [dx, dy, len, dir] of bars) {
      const p = c.at.clone().addScaledVector(f, dx).addScaledVector(u, dy);
      const hh = surf.nearest(p);
      b.stick(new THREE.BoxGeometry(0.011, 0.02, len + 0.011), LINE, hh, { embed: 0.6, flow: dir });
    }
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        const p = c.at.clone().addScaledVector(f, (sx * w) / 2).addScaledVector(u, (sy * h) / 2);
        const hh = surf.nearest(p);
        rivetPts.push(hh.at.clone().addScaledVector(hh.n, 0.012));
      }
  };

  const stencilLens = [0.09, 0.05, 0.11, 0.04, 0.07, 0.03, 0.1, 0.05];
  for (const s of [1, -1]) {
    // exhaust fairing plate
    const pc0 = surf.around([0, at(2.0, 1), 2.0]).at(s * 90, 20);
    if (pc0) {
      b.stick(new THREE.BoxGeometry(0.13, 0.02, 1.15), DEEP, pc0, { embed: 0.5, flow: [0, 0, 1] });
      const n = pc0.n.clone();
      const f = tangF(n);
      let dz = -0.5;
      for (const len of stencilLens) {
        const p = pc0.at.clone().addScaledVector(f, dz + len / 2).addScaledVector(n, 0.01);
        // stencil bars hug the plate's top edge, away from the stack line
        const u = tangU(n);
        p.addScaledVector(u, 0.04);
        b.stick(new THREE.BoxGeometry(0.014, 0.008, len), LINE, frame(p, n), {
          bone: body,
          embed: 0.3,
          flow: f,
        });
        dz += len + 0.04;
      }
    }

    // exhaust stacks
    for (const z of [1.65, 2.0, 2.35]) {
      const hit = surf.around([0, at(z, 1), z]).at(s * 90, 20);
      if (!hit) continue;
      const n = hit.n.clone();
      const dir = n.clone().multiplyScalar(0.5).add(V(0, 0, -0.85)).normalize();
      const a = hit.at.clone().addScaledVector(n, -0.03);
      const tip = hit.at.clone().addScaledVector(dir, 0.2);
      b.rod(a, tip, [0.07, 0.055], { color: DEEP, bone: body, sides: 8 });
      b.part(new THREE.TorusGeometry(0.068, 0.009, 4, 8), LINE, {
        bone: body,
        at: hit.at.clone().addScaledVector(dir, 0.07),
        dir,
        axis: "z",
      });
      b.part(new THREE.TorusGeometry(0.058, 0.009, 4, 8), LINE, {
        bone: body,
        at: tip.clone().addScaledVector(dir, -0.012),
        dir,
        axis: "z",
      });
      b.part(new THREE.CircleGeometry(0.046, 8), TYRE, {
        bone: body,
        at: tip.clone().addScaledVector(dir, 0.003),
        dir,
        axis: "z",
      });
    }

    hatch(s, 1.3, -22, 0.34, 0.2);
    hatch(s, 2.75, -20, 0.26, 0.18);
  }

  // merged rivet heads
  {
    const geos = rivetPts.map((p) => new THREE.SphereGeometry(0.011, 5, 3).translate(p.x, p.y, p.z));
    const merged = mergeGeometries(geos);
    if (merged) b.part(merged, LINE, { bone: body, at: [0, 0, 0] });
  }

  // ------------------------------------------------------------------ chin scoop
  const spath = catmull([
    [0, 1.08, 1.15],
    [0, 1.0, 1.5],
    [0, 0.95, 2.0],
    [0, 0.95, 2.5],
  ]);
  const scoop = b.sweep(
    spath,
    (t: number) => {
      const k = Math.min(t / 0.5, 1);
      const e = k * k * (3 - 2 * k);
      return [0.06 + 0.12 * e, 0.05 + 0.07 * e] as [number, number];
    },
    { bone: body, color: HULL, section: "box", caps: "flat" },
  );
  for (const a of [90, 270]) b.sweep(scoop.line(a, 0.004), 0.006, { bone: body, color: DIM, sides: 4 });
  const SY = 0.95;
  b.part(new THREE.BoxGeometry(0.28, 0.17, 0.012), TYRE, { bone: body, at: [0, SY, 2.506] });
  b.part(new THREE.BoxGeometry(0.38, 0.014, 0.016), LINE, { bone: body, at: [0, SY + 0.118, 2.51] });
  b.part(new THREE.BoxGeometry(0.38, 0.014, 0.016), LINE, { bone: body, at: [0, SY - 0.118, 2.51] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.014, 0.25, 0.016), LINE, { bone: body, at: [s * 0.185, SY, 2.51] });
  for (const x of [-0.07, 0, 0.07])
    b.part(new THREE.BoxGeometry(0.008, 0.17, 0.01), DIM, { bone: body, at: [x, SY, 2.515] });

  // ------------------------------------------------------------------ spinner
  const prof: [number, number][] = [
    [0, 0],
    [0.4, 0],
    [0.4, 0.05],
    [0.345, 0.3],
    [0.27, 0.55],
    [0.16, 0.78],
    [0.06, 0.85],
    [0, 0.9],
  ];
  const sR = (y: number) => {
    for (let i = 1; i < prof.length - 1; i++) {
      if (y <= prof[i + 1][1]) {
        const f = (y - prof[i][1]) / (prof[i + 1][1] - prof[i][1]);
        return prof[i][0] + (prof[i + 1][0] - prof[i][0]) * f;
      }
    }
    return 0;
  };
  const sAt: [number, number, number] = [0, 1.5, SZ];
  b.lathe(prof, { at: sAt, axis: [0, 0, 1], segments: 12, bone: prop, color: DEEP });
  const band = (y0: number, y1: number, color: string) => {
    const o = 0.006;
    b.lathe(
      [
        [sR(y0) + o, y0],
        [sR(y1) + o, y1],
        [sR(y1) - 0.03, y1],
        [sR(y0) - 0.03, y0],
      ],
      { at: sAt, axis: [0, 0, 1], segments: 12, bone: prop, color },
    );
  };
  band(0.2, 0.28, LINE);
  band(0.34, 0.37, DIM);
  band(0.72, 0.76, LINE);
  b.part(new THREE.TorusGeometry(0.4, 0.012, 4, 12), LINE, { bone: prop, at: [0, 1.5, SZ + 0.01] });

  // ------------------------------------------------------------------ propeller
  const lowE: [number, number][] = [
    [0.3, -0.05],
    [0.45, -0.095],
    [0.65, -0.115],
    [0.82, -0.095],
    [0.89, -0.05],
  ];
  const upE: [number, number][] = [
    [0.89, 0.01],
    [0.8, 0.05],
    [0.62, 0.06],
    [0.45, 0.05],
    [0.3, 0.035],
  ];
  const interp = (pts: [number, number][], r: number) => {
    const sorted = pts.slice().sort((a, c) => a[0] - c[0]);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (r <= sorted[i + 1][0]) {
        const f = (r - sorted[i][0]) / (sorted[i + 1][0] - sorted[i][0]);
        return sorted[i][1] + (sorted[i + 1][1] - sorted[i][1]) * f;
      }
    }
    return sorted[sorted.length - 1][1];
  };
  const blade: [number, number][] = [...lowE, ...upE];
  const pitch = 0.35;
  const BZ = SZ + 0.16;
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 2 + (k * Math.PI * 2) / 3;
    const r = [Math.cos(a), Math.sin(a), 0] as [number, number, number];
    const tg = [-Math.sin(a), Math.cos(a), 0];
    const yd = [
      tg[0] * Math.cos(pitch),
      tg[1] * Math.cos(pitch),
      Math.sin(pitch),
    ] as [number, number, number];
    const pos: [number, number, number] = [0, 1.5, BZ];
    b.extrude(blade, { at: pos, x: r, y: yd, thickness: 0.028, bevel: 0.005, smoothing: 1, color: PROP, bone: prop });
    const stripe = (r0: number, r1: number, color: string) => {
      const m = 0.014;
      b.extrude(
        [
          [r0, interp(lowE, r0) + m],
          [r1, interp(lowE, r1) + m],
          [r1, interp(upE, r1) - m],
          [r0, interp(upE, r0) - m],
        ],
        { at: pos, x: r, y: yd, thickness: 0.034, color, bone: prop },
      );
    };
    stripe(0.66, 0.72, LINE);
    stripe(0.76, 0.81, LINE);
    // blade root cuff
    b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.11, 8), METAL, {
      bone: prop,
      at: [r[0] * 0.4, 1.5 + r[1] * 0.4, BZ],
      dir: r,
    });
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type V = [number, number, number];

export function buildTail({ b, J, P, M }: { b: any; J: any; P: any; M: any }) {
  void M;
  // ---------------------------------------------------------------- palette (tolerant of key naming)
  const col = (a: string, c: string, d: string): string => (P && (P[a] ?? P[c])) || d;
  const HULL = col("hull", "hullBlue", "#12408a");
  const DEEP = col("deep", "deepBlue", "#0a2a60");
  const WING = col("wing", "wingBlue", "#1e58a8");
  const CYAN = col("paleCyan", "cyan", "#8cc4ec");
  const LINE = col("line", "lineWhite", "#e8f4ff");
  const DIM = col("lineDim", "dim", "#a9cdee");
  const TYRE = col("tyre", "tire", "#071c40");
  const METAL = col("metal", "steel", "#3a78bf");

  // ---------------------------------------------------------------- merge batches (one part per colour)
  const batches = new Map<string, THREE.BufferGeometry[]>();
  const push = (color: string, g: THREE.BufferGeometry, m: THREE.Matrix4) => {
    g.applyMatrix4(m);
    const list = batches.get(color) ?? [];
    list.push(g);
    batches.set(color, list);
  };
  const seg = (color: string, a: V, c: V, w: number) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const len = d.length();
    if (len < 1e-5) return;
    const up = Math.abs(d.y / len) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4().lookAt(B, A, up);
    m.setPosition(A.clone().add(B).multiplyScalar(0.5));
    push(color, new THREE.BoxGeometry(w, w, len), m);
  };
  const box = (color: string, c: V, s: V) => {
    push(color, new THREE.BoxGeometry(s[0], s[1], s[2]), new THREE.Matrix4().makeTranslation(c[0], c[1], c[2]));
  };
  // rivet head: small flat cylinder; rz = rotation about Z (radians) to face its surface normal
  const rivet = (color: string, p: V, rz = 0) => {
    const m = new THREE.Matrix4().makeRotationZ(rz);
    m.setPosition(p[0], p[1], p[2]);
    push(color, new THREE.CylinderGeometry(0.013, 0.013, 0.01, 5), m);
  };
  const ring = (color: string, y: number, z: number, rx: number, ry: number) => {
    const m = new THREE.Matrix4().makeScale(rx, ry, 0.15);
    m.setPosition(0, y, z);
    push(color, new THREE.TorusGeometry(1, 0.05, 4, 18), m);
  };
  const lerpTable = (tbl: [number, number][], v: number) => {
    // tbl sorted by v ascending: [v, u]
    if (v <= tbl[0][0]) return tbl[0][1];
    for (let i = 1; i < tbl.length; i++) {
      if (v <= tbl[i][0]) {
        const k = (v - tbl[i - 1][0]) / (tbl[i][0] - tbl[i - 1][0]);
        return tbl[i - 1][1] + (tbl[i][1] - tbl[i - 1][1]) * k;
      }
    }
    return tbl[tbl.length - 1][1];
  };

  // ================================================================= TAIL CONE
  const coneRx = (t: number) => 0.145 - 0.095 * t;
  const coneRy = (t: number) => 0.19 - 0.14 * t;
  b.sweep(
    catmull([
      [0, 1.78, -3.5],
      [0, 1.8, -4.0],
      [0, 1.83, -4.4],
    ]),
    (t: number) => [coneRx(t), coneRy(t)],
    { bone: J.body, color: HULL, caps: { start: "flat", end: "round" }, sides: 8 },
  );
  for (const z of [-3.62, -3.95, -4.25]) {
    const t = (-3.55 - z) / 0.85;
    const y = 1.78 + 0.055 * t;
    ring(LINE, y, z, coneRx(t) * 1.08 + 0.004, coneRy(t) * 1.08 + 0.004);
  }

  // ================================================================= FIN + RUDDER
  const FIN_AT: V = [0, 1.75, -3.2];
  const tf = (v: number) => 0.11 - 0.03 * (v + 0.1) / 1.78;
  const tr = (v: number) => 0.1 - 0.04 * (v + 0.1) / 1.8;
  const finPt = (s: number, u: number, v: number): V => [s * (tf(v) / 2), FIN_AT[1] + v, FIN_AT[2] - u];
  const rudPt = (s: number, u: number, v: number): V => [s * (tr(v) / 2), FIN_AT[1] + v, FIN_AT[2] - u];

  const FIN: [number, number][] = [
    [0, -0.1],
    [0.06, 0.2],
    [0.14, 0.5],
    [0.26, 0.85],
    [0.4, 1.15],
    [0.52, 1.42],
    [0.64, 1.6],
    [0.74, 1.68],
    [0.8, 1.68],
    [0.8, -0.1],
  ];
  const RUD: [number, number][] = [
    [0.8, -0.1],
    [0.8, 1.68],
    [0.9, 1.7],
    [0.98, 1.62],
    [1.05, 1.4],
    [1.1, 1.1],
    [1.15, 0.7],
    [1.2, 0.3],
    [1.25, 0.0],
    [1.25, -0.1],
  ];
  const ruTE = (v: number) =>
    lerpTable(
      [
        [-0.1, 1.25],
        [0, 1.25],
        [0.3, 1.2],
        [0.7, 1.15],
        [1.1, 1.1],
        [1.4, 1.05],
        [1.62, 0.98],
        [1.7, 0.9],
      ],
      v,
    );
  b.extrude(FIN, { at: FIN_AT, x: [0, 0, -1], thickness: [0.11, 0.08], bevel: 0.008, color: HULL, bone: J.body, name: "tailFin" });
  b.extrude(RUD, { at: FIN_AT, x: [0, 0, -1], thickness: [0.1, 0.06], bevel: 0.008, color: HULL, bone: J.body, name: "tailRudder" });

  // fin / rudder linework on both sides
  const LE: [number, number][] = [
    [0.07, 0.0],
    [0.09, 0.2],
    [0.17, 0.5],
    [0.29, 0.85],
    [0.43, 1.15],
    [0.55, 1.42],
    [0.67, 1.6],
    [0.75, 1.64],
  ];
  for (const s of [1, -1]) {
    // leading-edge outline
    for (let i = 0; i < LE.length - 1; i++) seg(LINE, finPt(s, LE[i][0], LE[i][1]), finPt(s, LE[i + 1][0], LE[i + 1][1]), 0.014);
    // double hinge line
    seg(LINE, finPt(s, 0.765, 0.0), finPt(s, 0.765, 1.66), 0.011);
    seg(LINE, rudPt(s, 0.825, 0.0), rudPt(s, 0.825, 1.66), 0.011);
    // fin rib parallel to leading edge
    seg(DIM, finPt(s, 0.22, 0.0), finPt(s, 0.31, 0.45), 0.01);
    seg(DIM, finPt(s, 0.31, 0.45), finPt(s, 0.6, 1.12), 0.01);
    // rudder ribs
    for (const v of [0.3, 0.7, 1.1, 1.45]) seg(DIM, rudPt(s, 0.86, v), rudPt(s, ruTE(v) - 0.04, v), 0.01);
    // rudder trim tab
    seg(LINE, rudPt(s, 0.97, 0.2), rudPt(s, 1.13, 0.2), 0.009);
    seg(LINE, rudPt(s, 0.97, 0.5), rudPt(s, 1.11, 0.5), 0.009);
    seg(LINE, rudPt(s, 0.97, 0.2), rudPt(s, 0.97, 0.5), 0.009);
    seg(LINE, rudPt(s, 1.13, 0.2), rudPt(s, 1.11, 0.5), 0.009);
    // rivet rows beside the hinge and along the fin root
    for (let i = 0; i < 16; i++) {
      const v = 0.05 + i * 0.1;
      rivet(LINE, finPt(s, 0.725, v), -s * Math.PI / 2);
      if (v < 1.55) rivet(LINE, rudPt(s, 0.87, v + 0.03), -s * Math.PI / 2);
    }
    for (let i = 0; i < 8; i++) rivet(DIM, finPt(s, 0.05 + i * 0.1, -0.02 + i * 0.0), -s * Math.PI / 2);

    // roundel flash on the fin: white / blue / cyan bars with line frame
    const bars: [number, string][] = [
      [0.44, LINE],
      [0.52, WING],
      [0.6, CYAN],
    ];
    for (const [u, c] of bars) {
      const vm = 0.775;
      const xc = s * (tf(vm) / 2 + 0.002 - 0.004);
      box(c, [xc, FIN_AT[1] + vm, FIN_AT[2] - u], [0.03, 0.55, 0.08]);
    }
    seg(LINE, finPt(s, 0.4, 0.48), finPt(s, 0.64, 0.48), 0.012);
    seg(LINE, finPt(s, 0.4, 1.07), finPt(s, 0.64, 1.07), 0.012);
  }

  // fin tip cap seam
  seg(DIM, finPt(1, 0.5, 1.5), finPt(-1, 0.5, 1.5), 0.01);

  // ================================================================= TAILPLANE + ELEVATORS
  const PL_Y = 1.72;
  const PL_Z = -3.45;
  const A = 1.6;
  const VH = 0.62;
  const vle = (x: number) => 0.5 * (1 - Math.sqrt(Math.max(0, 1 - (x / A) * (x / A))));
  const phiH = Math.acos((0.5 - VH) / 0.5);
  const ell = (phi: number): [number, number] => [A * Math.sin(phi), 0.5 * (1 - Math.cos(phi))];
  const front: [number, number][] = [];
  for (let i = 0; i <= 12; i++) front.push(ell(-phiH + (2 * phiH * i) / 12));
  const elev: [number, number][] = [];
  const phiEnd = 2 * Math.PI - phiH;
  for (let i = 0; i <= 10; i++) elev.push(ell(phiH + ((phiEnd - phiH) * i) / 10));
  const planeOpts = { at: [0, PL_Y, PL_Z] as V, x: [1, 0, 0] as V, y: [0, 0, -1] as V, bone: J.body };
  b.extrude(front, { ...planeOpts, thickness: [0.08, 0.04], bevel: 0.006, color: HULL, name: "tailplane" });
  b.extrude(elev, { ...planeOpts, thickness: [0.04, 0.02], bevel: 0.005, color: WING, name: "elevators" });

  const pTop = (v: number) => PL_Y + (0.08 - (0.04 * v) / VH) / 2;
  const eTop = (v: number) => PL_Y + (0.04 - (0.02 * (v - VH)) / 0.38) / 2;
  const pz = (v: number) => PL_Z - v;
  const pPt = (x: number, v: number): V => [x, pTop(v), pz(v)];
  const ePt = (x: number, v: number): V => [x, eTop(v), pz(v)];

  // leading-edge outline on top of the tailplane
  const leLine: V[] = [];
  for (let i = 0; i <= 12; i++) {
    const phi = -phiH * 0.97 + (2 * phiH * 0.97 * i) / 12;
    const [x, v] = ell(phi);
    leLine.push(pPt(x * 0.97, v + 0.025));
  }
  for (let i = 0; i < leLine.length - 1; i++) seg(LINE, leLine[i], leLine[i + 1], 0.013);
  // elevator hinge line (both sides of the gap) and trailing outline
  seg(LINE, pPt(-1.52, VH - 0.03), pPt(1.52, VH - 0.03), 0.012);
  seg(LINE, ePt(-1.5, VH + 0.03), ePt(1.5, VH + 0.03), 0.012);
  const teLine: V[] = [];
  for (let i = 0; i <= 10; i++) {
    const phi = phiH * 1.03 + ((phiEnd - phiH * 1.03 - phiH * 0.03) * i) / 10;
    const [x, v] = ell(phi);
    teLine.push(ePt(x * 0.97, v - 0.025));
  }
  for (let i = 0; i < teLine.length - 1; i++) seg(DIM, teLine[i], teLine[i + 1], 0.011);
  // ribs
  for (const x of [-1.45, -1.15, -0.85, -0.55, -0.3, 0.3, 0.55, 0.85, 1.15, 1.45]) {
    seg(DIM, pPt(x, vle(x) + 0.06), pPt(x, VH - 0.06), 0.01);
    seg(DIM, ePt(x, VH + 0.06), ePt(x, 1 - vle(x) - 0.05), 0.01);
  }
  // rivet rows
  for (let x = -1.45; x <= 1.46; x += 0.1) {
    if (Math.abs(x) < 0.2) continue;
    rivet(LINE, pPt(x, VH - 0.075));
    rivet(LINE, ePt(x, VH + 0.075));
    rivet(DIM, pPt(x, vle(x) + 0.09));
  }
  // tailplane root fillets with fuselage (line seam)
  for (const s of [1, -1]) seg(DIM, pPt(s * 0.19, 0.08), pPt(s * 0.19, 0.55), 0.011);

  // ================================================================= VENTRAL KEEL
  const KEEL_AT: V = [0, 1.7, -3.55];
  const KEEL: [number, number][] = [
    [0.0, 0.12],
    [0.0, -0.25],
    [0.14, -0.52],
    [0.38, -0.7],
    [0.6, -0.72],
    [0.74, -0.52],
    [0.84, -0.12],
    [0.85, 0.12],
  ];
  b.extrude(KEEL, { at: KEEL_AT, x: [0, 0, -1], thickness: [0.045, 0.1], bevel: 0.006, color: HULL, bone: J.body, name: "tailKeel" });
  const tk = (v: number) => 0.045 + (0.055 * (v + 0.72)) / 0.84;
  const kp = (s: number, u: number, v: number): V => [s * (tk(v) / 2), KEEL_AT[1] + v, KEEL_AT[2] - u];
  const KL: [number, number][] = [
    [0.12, -0.28],
    [0.2, -0.45],
    [0.38, -0.6],
    [0.58, -0.62],
    [0.7, -0.45],
    [0.76, -0.2],
  ];
  for (const s of [1, -1]) {
    for (let i = 0; i < KL.length - 1; i++) seg(DIM, kp(s, KL[i][0], KL[i][1]), kp(s, KL[i + 1][0], KL[i + 1][1]), 0.01);
  }

  // ================================================================= ARRESTOR HOOK
  const hookTop: V = [0, 1.08, -4.28];
  const hookMid: V = [0, 0.82, -4.46];
  b.sphere = b.sphere; // no-op keeps b untouched
  b.rod(hookTop, hookMid, 0.018, METAL, { bone: J.body });
  b.rod(hookMid, [0, 0.76, -4.38] as V, [0.018, 0.008], METAL, { bone: J.body });
  b.part(new THREE.BoxGeometry(0.07, 0.05, 0.08), DEEP, { bone: J.body, at: [0, 1.0, -4.25] as V });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6), LINE, {
    bone: J.body,
    at: [0, 0.94, -4.37] as V,
    dir: [0, -0.26, -0.18],
  });

  // ================================================================= NAV LIGHT
  const navV = 0.9;
  const navZ = FIN_AT[2] - ruTE(navV);
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), DEEP, {
    bone: J.body,
    at: [0, FIN_AT[1] + navV, navZ + 0.005] as V,
    rotation: [90, 0, 0],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.034, 8, 6), "#d8f0ff", {
      bone: J.body,
      at: [0, FIN_AT[1] + navV, navZ - 0.025] as V,
    }),
    1.6,
  );
  // tail-cone rear light
  glow(b.part(new THREE.SphereGeometry(0.022, 6, 5), "#d8f0ff", { bone: J.body, at: [0, 1.835, -4.47] as V }), 1.4);

  // ================================================================= TAIL WHEEL (on tailWheel joint)
  const TW = J.tailWheel;
  const wy = 0.14;
  const wz = -4.0;
  b.rod([0, 1.06, -3.9] as V, [0, 0.3, -3.975] as V, [0.036, 0.026], METAL, { bone: TW });
  for (const y of [0.95, 0.78, 0.5]) {
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.014, 8), LINE, {
      bone: TW,
      at: [0, y, -3.9 - (1.06 - y) * 0.1] as V,
      dir: [0, -0.76, -0.075],
    });
  }
  // fork prongs and axle
  for (const s of [1, -1]) {
    b.rod([s * 0.022, 0.34, -3.972] as V, [s * 0.052, wy, wz] as V, 0.014, METAL, { bone: TW });
    // torque-link
    b.rod([s * 0.042, 0.82, -3.92] as V, [s * 0.042, 0.58, -3.945] as V, 0.007, LINE, { bone: TW });
  }
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.13, 6), METAL, { bone: TW, at: [0, wy, wz] as V, rotation: [0, 0, 90] });
  // tyre (12 sides, vertex at the bottom touches y = 0)
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 12), TYRE, { bone: TW, at: [0, wy, wz] as V, rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.074, 10), METAL, { bone: TW, at: [0, wy, wz] as V, rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.078, 10), LINE, { bone: TW, at: [0, wy, wz] as V, rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.082, 8), METAL, { bone: TW, at: [0, wy, wz] as V, rotation: [0, 0, 90] });
  // tread marks around the tyre
  const treads: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 + Math.PI / 12;
    const g = new THREE.BoxGeometry(0.074, 0.012, 0.03);
    const m = new THREE.Matrix4().makeRotationX(-a);
    m.setPosition(0, wy + Math.cos(a) * 0.137, wz + Math.sin(a) * 0.137);
    g.applyMatrix4(m);
    treads.push(g);
  }
  b.part(mergeGeometries(treads)!, DIM, { bone: TW, at: [0, 0, 0] as V });

  // ================================================================= flush merged detail batches
  for (const [color, list] of batches) {
    const merged = mergeGeometries(list);
    if (merged) b.part(merged, color, { bone: J.body, at: [0, 0, 0] as V });
  }
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type V3 = [number, number, number];

export function buildFuselage({ b, J, P }: Ctx) {
  const pal = P as Record<string, string>;
  const HULL = pal.hullBlue ?? "#12408a";
  const DEEP = pal.deepBlue ?? "#0a2a60";
  const WING = pal.wingBlue ?? "#1e58a8";
  const CYAN = pal.paleCyan ?? "#8cc4ec";
  const LINE = pal.line ?? "#e8f4ff";
  const DIM = pal.lineDim ?? "#a9cdee";
  const GLASS = pal.glass ?? "#5aa0d8";
  const METAL = pal.metal ?? "#3a78bf";
  const TYRE = pal.tyre ?? "#071c40";
  const bone = J.body;

  const safe = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      /* a missed surface query only drops a detail */
    }
  };
  const toV = (p: any): THREE.Vector3 => (p && p.isVector3 ? p : p.at);

  const box = (w: number, h: number, d: number, at: V3, color: string, rot?: V3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });

  // ------------------------------------------------------------------ hull
  const S: [number, number, number, number][] = [
    [0.8, 1.52, 1.15, 1.24],
    [0.2, 1.55, 1.2, 1.3],
    [-0.8, 1.6, 1.05, 1.4],
    [-1.4, 1.61, 0.92, 1.28],
    [-2.0, 1.62, 0.78, 1.1],
    [-2.65, 1.66, 0.58, 0.85],
    [-3.3, 1.7, 0.42, 0.62],
    [-4.25, 1.76, 0.16, 0.3],
  ];
  const cyAt = (z: number) => {
    for (let i = 0; i < S.length - 1; i++) {
      const [z0, c0] = S[i];
      const [z1, c1] = S[i + 1];
      if (z <= z0 && z >= z1) return c0 + ((c1 - c0) * (z0 - z)) / (z0 - z1);
    }
    return 1.6;
  };
  const hull = b.loft(
    S.map(([z, cy, w, h]) => ({ at: [0, cy, z] as V3, w, h })),
    {
      bone,
      color: HULL,
      sectors: [[125, 235, CYAN]],
      caps: { start: "flat", end: "round" },
      sides: 16,
      name: "fuselageHull",
    },
  );
  const skin = b.surface(hull);

  // ------------------------------------------------------------------ seams
  const ring = (z: number, r: number, color: string, lift = 0.008) =>
    safe(() => {
      const lp = skin.loop([0, cyAt(z), z], { dir: [0, 0, 1], lift });
      b.sweep(lp, r, { color, bone, sides: 6 });
    });
  ring(0.76, 0.02, DEEP, 0.012);
  [0.05, -1.3, -2.35, -3.2].forEach((z) => ring(z, 0.01, LINE));

  // longitudinal seams: side centre lines and the belly boundaries
  [90, 270].forEach((a) =>
    safe(() => b.sweep(hull.line(a, 0.005), 0.009, { color: LINE, bone, sides: 6 })),
  );
  [125, 235].forEach((a) =>
    safe(() => b.sweep(hull.line(a, 0.005), 0.008, { color: DIM, bone, sides: 6 })),
  );
  safe(() => b.sweep(hull.line(180, 0.005), 0.007, { color: WING, bone, sides: 6 }));

  // ------------------------------------------------------------------ rivets (merged)
  const rivetGeos: THREE.BufferGeometry[] = [];
  const addRivet = (p: THREE.Vector3) => {
    const g = new THREE.SphereGeometry(0.013, 4, 3);
    g.translate(p.x, p.y, p.z);
    rivetGeos.push(g);
  };
  const rivetRow = (deg: number, spacing: number) =>
    safe(() => {
      const path = hull.line(deg, 0.004);
      const n = Math.max(2, Math.floor(path.length / spacing));
      for (let i = 0; i < n; i++) addRivet(toV(path.at(0.03 + (0.94 * (i + 0.5)) / n)));
    });
  [78, 102, 258, 282].forEach((a) => rivetRow(a, 0.13));
  // rivet ring at the cowl joint
  safe(() => {
    const lp = skin.loop([0, cyAt(0.68), 0.68], { dir: [0, 0, 1], lift: 0.004 });
    for (let i = 0; i < 30; i++) addRivet(toV(lp.at(i / 30)));
  });
  safe(() => {
    const merged = mergeGeometries(rivetGeos);
    if (merged) b.part(merged, LINE, { bone, at: [0, 0, 0] });
  });

  // ------------------------------------------------------------------ roundels
  for (const s of [1, -1]) {
    const h = skin.ray([s * 2, 1.65, -1.9], [-s, 0, 0]);
    if (!h) continue;
    const layers: [number, string][] = [
      [0.3, LINE],
      [0.22, METAL],
      [0.11, CYAN],
    ];
    layers.forEach(([r, col], k) =>
      b.stick(new THREE.CylinderGeometry(r, r, 0.07, 24), col, h.moved([0, 0.006 * k, 0]), { embed: 0.7, bone }),
    );
  }

  // ------------------------------------------------------------------ stencil serial + panels
  const FONT: Record<string, string[]> = {
    K: ["101", "101", "110", "101", "101"],
    "9": ["111", "101", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "2": ["111", "001", "111", "100", "111"],
  };
  const textGeo = (str: string, px: number) => {
    const total = str.length * 4 - 1;
    const geos: THREE.BufferGeometry[] = [];
    [...str].forEach((ch, k) => {
      FONT[ch].forEach((row, ri) =>
        [...row].forEach((v, ci) => {
          if (v !== "1") return;
          const g = new THREE.BoxGeometry(px * 0.92, 0.04, px * 0.92);
          g.translate(-(k * 4 + ci - (total - 1) / 2) * px, 0, (2 - ri) * px);
          geos.push(g);
        }),
      );
    });
    return mergeGeometries(geos)!;
  };
  const panelGeo = (w: number, h: number, bar = 0.012) => {
    const g = [
      new THREE.BoxGeometry(w, 0.05, bar).translate(0, 0, h / 2),
      new THREE.BoxGeometry(w, 0.05, bar).translate(0, 0, -h / 2),
      new THREE.BoxGeometry(bar, 0.05, h).translate(w / 2, 0, 0),
      new THREE.BoxGeometry(bar, 0.05, h).translate(-w / 2, 0, 0),
    ];
    return mergeGeometries(g)!;
  };
  for (const s of [1, -1]) {
    safe(() => {
      const t = skin.ray([s * 2, 1.86, -2.75], [-s, 0, 0]);
      if (t) b.stick(textGeo("K9942", 0.022), LINE, t, { embed: 0.75, bone });
      // cockpit door with handle
      const d = skin.ray([s * 2, 1.95, -0.1], [-s, 0, 0]);
      if (d) {
        b.stick(panelGeo(0.42, 0.26), DIM, d, { embed: 0.75, bone });
        b.stick(new THREE.BoxGeometry(0.07, 0.05, 0.016), LINE, d.moved([0.1 * -s, 0, -0.04]), { embed: 0.5, bone });
      }
      // radio hatch with fasteners
      const r = skin.ray([s * 2, 1.45, -1.0], [-s, 0, 0]);
      if (r) {
        b.stick(panelGeo(0.28, 0.2), DIM, r, { embed: 0.75, bone });
        for (const [dx, dz] of [
          [0.1, 0.06],
          [-0.1, 0.06],
          [0.1, -0.06],
          [-0.1, -0.06],
        ])
          b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), LINE, r.moved([dx, 0, dz]), { embed: 0.75, bone });
      }
    });
  }
  // belly access panels
  [-1.0, -3.0].forEach((z, i) =>
    safe(() => {
      const h = skin.ray([0, 0.2, z], [0, 1, 0]);
      if (h) b.stick(panelGeo(i ? 0.14 : 0.3, i ? 0.3 : 0.5), WING, h, { embed: 0.75, bone });
    }),
  );

  // ------------------------------------------------------------------ windscreen
  const A: V3 = [0.2, 2.14, 0.42];
  const B: V3 = [-0.2, 2.14, 0.42];
  const C: V3 = [-0.17, 2.5, 0.12];
  const D: V3 = [0.17, 2.5, 0.12];
  b.slab([A, B, C, D], { color: GLASS, thickness: 0.02, bone });
  const rod = (p: V3, q: V3, r = 0.011, col = LINE) => b.capsule(p, q, r, { color: col, bone, sides: 6 });
  rod(A, D);
  rod(B, C);
  rod(D, C);
  rod(A, B);
  rod([0, 2.14, 0.42], [0, 2.5, 0.12], 0.009, DIM);
  for (const s of [1, -1]) {
    const P3: V3 = [s * 0.21, 2.19, -0.02];
    const P1: V3 = [s * 0.2, 2.14, 0.42];
    const P2: V3 = [s * 0.17, 2.5, 0.12];
    b.slab([P1, P2, P3], { color: GLASS, thickness: 0.02, bone });
    rod(P2, P3);
    rod(P1, P3, 0.009, DIM);
  }

  // ------------------------------------------------------------------ sliding hood (slid back)
  const hood = b.loft(
    (
      [
        [-0.58, 2.27, 0.5, 0.46],
        [-0.85, 2.32, 0.58, 0.56],
        [-1.3, 2.27, 0.5, 0.48],
        [-1.72, 2.16, 0.22, 0.2],
      ] as [number, number, number, number][]
    ).map(([z, cy, w, h]) => ({ at: [0, cy, z] as V3, w, h })),
    { bone, color: GLASS, caps: { start: "flat", end: "round" }, sides: 14, name: "fuselageHood" },
  );
  const hoodSkin = b.surface(hood);
  [-0.62, -0.95, -1.3, -1.6].forEach((z) =>
    safe(() => {
      const lp = hoodSkin.loop([0, 2.27, z], { dir: [0, 0, 1], lift: 0.006 });
      b.sweep(lp, 0.011, { color: LINE, bone, sides: 6 });
    }),
  );
  safe(() => b.sweep(hood.line(0, 0.004), 0.01, { color: LINE, bone, sides: 6 }));
  [90, 270].forEach((a) =>
    safe(() => b.sweep(hood.line(a, 0.003), 0.017, { color: DIM, bone, sides: 6, from: 0.02, to: 0.98 })),
  );

  // ------------------------------------------------------------------ cockpit interior
  const sillZ = -0.225;
  box(0.4, 0.06, 0.7, [0, 2.28, -0.2], DEEP); // floor
  for (const s of [1, -1]) {
    box(0.04, 0.2, 0.66, [s * 0.21, 2.3, sillZ], HULL); // coaming sill
    box(0.014, 0.014, 0.66, [s * 0.21, 2.405, sillZ], LINE);
    box(0.03, 0.04, 0.12, [s * 0.15, 2.35, -0.1], METAL); // quadrant boxes
    b.part(new THREE.SphereGeometry(0.02, 6, 4), s > 0 ? LINE : DIM, { bone, at: [s * 0.15, 2.4, -0.14] });
    rod([s * 0.15, 2.37, -0.1], [s * 0.15, 2.45, -0.16], 0.008, METAL);
    // rudder pedals
    box(0.07, 0.05, 0.02, [s * 0.08, 2.33, 0.08], METAL, [-25, 0, 0]);
  }
  // seat
  box(0.32, 0.04, 0.3, [0, 2.36, -0.3], METAL);
  box(0.32, 0.26, 0.03, [0, 2.47, -0.46], METAL, [-12, 0, 0]);
  for (const s of [1, -1]) {
    box(0.03, 0.05, 0.26, [s * 0.14, 2.335, -0.3], DEEP);
    rod([s * 0.09, 2.58, -0.475], [s * 0.07, 2.39, -0.44], 0.008, DIM); // harness
  }
  // armoured headrest
  box(0.34, 0.2, 0.04, [0, 2.5, -0.52], WING);
  box(0.26, 0.012, 0.045, [0, 2.57, -0.52], LINE);
  // instrument panel and gauges
  box(0.36, 0.14, 0.03, [0, 2.36, 0.17], DEEP);
  const zf = 0.152;
  [2.325, 2.385].forEach((y, r) =>
    [-0.1, 0, 0.1].forEach((x, c) => {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), DIM, { bone, at: [x, y, zf], dir: [0, 0, -1] });
      b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.01, 12), TYRE, { bone, at: [x, y, zf - 0.002], dir: [0, 0, -1] });
      const a = (r * 3 + c) * 1.1 + 0.5;
      b.rod([x, y, zf - 0.008], [x + 0.019 * Math.cos(a), y + 0.019 * Math.sin(a), zf - 0.008], 0.003, {
        color: LINE,
        bone,
        sides: 4,
      });
    }),
  );
  // control stick
  rod([0, 2.31, -0.1], [0, 2.5, -0.19], 0.014, METAL);
  b.capsule([0, 2.5, -0.19], [0, 2.56, -0.21], 0.024, { color: DEEP, bone, sides: 8 });
  b.part(new THREE.SphereGeometry(0.01, 5, 4), LINE, { bone, at: [0, 2.57, -0.185] });
  // gun-sight
  box(0.07, 0.06, 0.1, [0, 2.45, 0.06], METAL);
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), DEEP, { bone, at: [0, 2.5, 0.06] });
  b.slab(
    [
      [-0.035, 2.52, 0.075],
      [0.035, 2.52, 0.075],
      [0.035, 2.6, 0.02],
      [-0.035, 2.6, 0.02],
    ],
    { color: GLASS, thickness: 0.008, bone },
  );
  rod([-0.035, 2.52, 0.075], [-0.035, 2.6, 0.02], 0.005, LINE);
  rod([0.035, 2.52, 0.075], [0.035, 2.6, 0.02], 0.005, LINE);

  // ------------------------------------------------------------------ aerial mast
  rod([0, 2.14, 0.64], [0, 2.44, 0.58], 0.012, METAL);
  b.part(new THREE.SphereGeometry(0.02, 6, 4), LINE, { bone, at: [0, 2.46, 0.575] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.06), METAL, { bone, at: [0, 2.2, 0.64] });
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWings({ b, J, P, M }: Ctx) {
  const BODY = J.body;
  const C = {
    upper: P.wingBlue ?? "#1e58a8",
    lower: P.paleCyan ?? "#8cc4ec",
    hull: P.hullBlue ?? "#12408a",
    deep: P.deepBlue ?? "#0a2a60",
    line: P.line ?? "#e8f4ff",
    dim: P.lineDim ?? "#a9cdee",
    metal: P.metal ?? "#3a78bf",
  };
  const AIL = "#2f6cba"; // fabric-covered ailerons
  const FLAP = "#174a9c"; // flap panels
  const LENS = "#d4ecff"; // lights

  // ---------------------------------------------------------------- planform
  const SPAN = 5.6;
  const C0 = 2.8; // root chord
  const QC = 0.9; // quarter-chord line (straight), z
  const Y0 = M.wingRoot[1] - 0.05;
  const DIH = 0.07; // dihedral rise per metre of span

  const bracket = (v: number) =>
    0.2969 * Math.sqrt(v) - 0.126 * v - 0.3516 * v * v + 0.2843 * v ** 3 - 0.1036 * v ** 4;

  // Surface point of the wing: x signed span, v 0 (leading edge) .. 1 (trailing edge), k +1 upper / -1 lower.
  const wingPt = (x: number, v: number, k: number) => {
    const a = Math.min(1, Math.abs(x) / SPAN);
    const c = C0 * Math.cos(Math.asin(a));
    const z = QC + 0.25 * c - v * c;
    const t = c * (0.13 - 0.06 * a);
    const vv = Math.min(1, Math.max(0, v));
    const f = Math.max(0, bracket(vv)) / 0.1;
    const yc = Y0 + DIH * Math.abs(x);
    const cam = 0.05 * c * vv * (1 - vv);
    const y = k > 0 ? yc + t * 0.58 * f + cam : yc - t * 0.42 * f + cam;
    return new THREE.Vector3(x, y, z);
  };

  // Outward surface normal.
  const nrm = (x: number, v: number, k: number) => {
    const sg = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const e = 0.03;
    const dx = wingPt(sg * Math.min(SPAN, ax + e), v, k).sub(wingPt(sg * Math.max(0, ax - e), v, k));
    const dv = wingPt(x, Math.min(1, v + 0.02), k).sub(wingPt(x, Math.max(0, v - 0.02), k));
    return dx.cross(dv).multiplyScalar(sg * k).normalize();
  };
  const at = (x: number, v: number, k: number, lift = 0) => {
    const p = wingPt(x, v, k);
    if (lift) p.addScaledVector(nrm(x, v, k), lift);
    return p;
  };

  // ---------------------------------------------------------------- skins
  const skin = (s: number, k: number) => {
    const N = 14;
    const Mv = 12;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const th = ((i / N) * Math.PI) / 2;
      const x = s * SPAN * Math.sin(th);
      for (let j = 0; j <= Mv; j++) {
        const v = (1 - Math.cos((Math.PI * j) / Mv)) / 2;
        const p = wingPt(x, v, k);
        pos.push(p.x, p.y, p.z);
      }
    }
    const id = (i: number, j: number) => i * (Mv + 1) + j;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < Mv; j++) {
        const a = id(i, j);
        const b1 = id(i + 1, j);
        const c = id(i, j + 1);
        const d = id(i + 1, j + 1);
        idx.push(a, b1, c, b1, d, c);
      }
    let sum = 0;
    for (let t = 0; t < idx.length; t += 3) {
      const [i0, i1, i2] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3];
      sum += (pos[i1 + 2] - pos[i0 + 2]) * (pos[i2] - pos[i0]) - (pos[i1] - pos[i0]) * (pos[i2 + 2] - pos[i0 + 2]);
    }
    if (k * sum < 0)
      for (let t = 0; t < idx.length; t += 3) {
        const tmp = idx[t + 1];
        idx[t + 1] = idx[t + 2];
        idx[t + 2] = tmp;
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  // ---------------------------------------------------------------- flat linework buckets (one part per colour)
  const buckets = new Map<string, number[]>();
  const bk = (c: string) => {
    let a = buckets.get(c);
    if (!a) buckets.set(c, (a = []));
    return a;
  };
  const tri = (arr: number[], a: THREE.Vector3, b1: THREE.Vector3, c: THREE.Vector3, ref: THREE.Vector3) => {
    const n = b1.clone().sub(a).cross(c.clone().sub(a));
    if (n.dot(ref) < 0) {
      const t = b1;
      b1 = c;
      c = t;
    }
    arr.push(a.x, a.y, a.z, b1.x, b1.y, b1.z, c.x, c.y, c.z);
  };
  const ribbon = (color: string, k: number, samples: number[][], w: number, lift: number) => {
    const arr = bk(color);
    const pts = samples.map(([x, v]) => at(x, v, k, lift));
    const ns = samples.map(([x, v]) => nrm(x, v, k));
    const L = pts.length;
    const A: THREE.Vector3[] = [];
    const B: THREE.Vector3[] = [];
    for (let i = 0; i < L; i++) {
      const t = pts[Math.min(i + 1, L - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
      const sd = t.cross(ns[i]).normalize().multiplyScalar(w);
      A.push(pts[i].clone().add(sd));
      B.push(pts[i].clone().sub(sd));
    }
    for (let i = 0; i < L - 1; i++) {
      tri(arr, A[i], B[i], A[i + 1], ns[i]);
      tri(arr, B[i], B[i + 1], A[i + 1], ns[i]);
    }
  };
  const patch = (color: string, k: number, x0: number, x1: number, v0: number, v1: number, lift: number, nx: number, nv: number) => {
    const arr = bk(color);
    const g: THREE.Vector3[][] = [];
    for (let i = 0; i <= nx; i++) {
      g.push([]);
      for (let j = 0; j <= nv; j++) {
        const x = x0 + ((x1 - x0) * i) / nx;
        const v = v0 + ((v1 - v0) * j) / nv;
        g[i].push(at(x, v, k, lift));
      }
    }
    const ref = nrm((x0 + x1) / 2, (v0 + v1) / 2, k);
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nv; j++) {
        tri(arr, g[i][j], g[i + 1][j], g[i][j + 1], ref);
        tri(arr, g[i + 1][j], g[i + 1][j + 1], g[i][j + 1], ref);
      }
  };
  const OCT = new THREE.OctahedronGeometry(1, 0).getAttribute("position");
  const rivet = (color: string, x: number, v: number, k: number, r = 0.017) => {
    const arr = bk(color);
    const p = at(x, v, k, 0.004);
    for (let i = 0; i < OCT.count; i++) arr.push(p.x + OCT.getX(i) * r, p.y + OCT.getY(i) * r * 0.6, p.z + OCT.getZ(i) * r);
  };
  const row = (color: string, s: number, k: number, v: number, x0: number, x1: number, step: number) => {
    for (let x = x0; x <= x1 + 1e-6; x += step) rivet(color, s * x, v, k);
  };

  // sample generators (positive x, mirrored by s)
  const lin = (a: number, c: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((c - a) * i) / n);
  const spanS = (s: number, v: number, x0: number, x1: number, n?: number) => {
    const t0 = Math.asin(x0 / SPAN);
    const t1 = Math.asin(x1 / SPAN);
    const cnt = n ?? Math.max(4, Math.ceil(Math.abs(x1 - x0) * 3));
    return lin(t0, t1, cnt).map((t) => [s * SPAN * Math.sin(t), v]);
  };
  const chordS = (s: number, x: number, v0: number, v1: number, n = 8) => lin(v0, v1, n).map((v) => [s * x, v]);
  const rectS = (s: number, x0: number, x1: number, v0: number, v1: number) => [
    ...spanS(s, v0, x0, x1, 6),
    ...chordS(s, x1, v0, v1, 4).slice(1),
    ...spanS(s, v1, x1, x0, 6).slice(1),
    ...chordS(s, x0, v1, v0, 4).slice(1),
  ];

  // ---------------------------------------------------------------- small solids
  const zcyl = (r: number, zA: number, zB: number, x: number, y: number, color: string, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, zB - zA, sides), color, {
      bone: BODY,
      at: [x, y, (zA + zB) / 2],
      dir: [0, 0, 1],
      group: "wings",
    });

  const roundel = (s: number, k: number, x: number, v: number, R: number) => {
    const X = s * x;
    const base = wingPt(X, v, k);
    const n = nrm(X, v, k);
    const layers: [number, string][] = [
      [1.0, C.deep],
      [0.92, C.line],
      [0.68, C.hull],
      [0.36, C.lower],
    ];
    layers.forEach(([f, col], i) => {
      const top = 0.008 + 0.004 * i;
      const h = 0.05;
      b.part(new THREE.CylinderGeometry(R * f, R * f, h, 20), col, {
        bone: BODY,
        at: base.clone().addScaledVector(n, top - h / 2),
        dir: [n.x, n.y, n.z],
        group: "wings",
      });
    });
  };

  // ---------------------------------------------------------------- per wing
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    b.part(skin(s, 1), C.upper, { bone: BODY, at: [0, 0, 0], flat: true, group: "wings", name: `wings.skinUp${tag}` });
    b.part(skin(s, -1), C.lower, { bone: BODY, at: [0, 0, 0], flat: true, group: "wings", name: `wings.skinLow${tag}` });

    // control-surface panels (flaps, fabric ailerons)
    patch(FLAP, 1, s * 0.95, s * 3.05, 0.72, 0.985, 0.006, 6, 3);
    patch(AIL, 1, s * 3.15, s * 5.0, 0.72, 0.985, 0.006, 8, 3);
    patch(C.deep, 1, s * 4.25, s * 4.65, 0.88, 0.97, 0.009, 2, 1); // trim tab

    // ---- upper linework
    ribbon(C.line, 1, spanS(s, 0.014, 0.8, 5.45, 24), 0.017, 0.012); // leading-edge outline
    ribbon(C.line, 1, spanS(s, 0.985, 0.8, 5.2, 20), 0.012, 0.011); // trailing outline
    ribbon(C.dim, 1, spanS(s, 0.27, 0.85, 1.8), 0.01, 0.011); // front spar
    ribbon(C.dim, 1, spanS(s, 0.27, 3.15, 5.0), 0.01, 0.011);
    ribbon(C.line, 1, spanS(s, 0.72, 0.95, 3.05), 0.012, 0.012); // flap hinge
    ribbon(C.deep, 1, spanS(s, 0.745, 0.95, 3.05), 0.006, 0.012);
    ribbon(C.line, 1, spanS(s, 0.72, 3.15, 5.05), 0.012, 0.012); // aileron hinge
    ribbon(C.deep, 1, spanS(s, 0.745, 3.15, 5.05), 0.006, 0.012);
    ribbon(C.line, 1, chordS(s, 0.95, 0.72, 0.985, 4), 0.011, 0.012); // flap inboard end
    ribbon(C.line, 1, chordS(s, 3.1, 0.06, 0.985, 12), 0.013, 0.012); // flap / aileron divider
    ribbon(C.line, 1, chordS(s, 5.05, 0.72, 0.985, 4), 0.011, 0.012); // aileron outboard end
    for (const x of [1.3, 1.9, 2.5, 3.7, 4.3, 4.8]) ribbon(C.dim, 1, chordS(s, x, 0.06, 0.72, 10), 0.009, 0.011);
    for (const x of [1.3, 1.7, 2.1, 2.5, 2.9, 3.4, 3.7, 4.0, 4.3, 4.6, 4.85])
      ribbon(C.dim, 1, chordS(s, x, 0.745, 0.975, 5), 0.007, 0.011);

    // gun bay panel
    ribbon(C.line, 1, rectS(s, 1.85, 3.1, 0.12, 0.5), 0.01, 0.011);
    for (const x of [2.125, 2.475, 2.825]) ribbon(C.dim, 1, chordS(s, x, 0.12, 0.5, 5), 0.006, 0.011);

    // walkway
    patch(C.deep, 1, s * 0.9, s * 1.6, 0.22, 0.72, 0.007, 4, 6);
    for (const v of [0.3, 0.38, 0.46, 0.54, 0.62]) patch(C.dim, 1, s * 0.95, s * 1.55, v, v + 0.025, 0.01, 3, 1);

    // rivets (upper)
    row(C.line, s, 1, 0.05, 0.9, 5.2, 0.2);
    row(C.line, s, 1, 0.27, 0.9, 1.8, 0.2);
    row(C.line, s, 1, 0.27, 3.2, 5.0, 0.2);
    row(C.line, s, 1, 0.7, 1.0, 5.0, 0.25);
    row(C.line, s, 1, 0.12, 1.9, 3.05, 0.23);
    row(C.line, s, 1, 0.5, 1.9, 3.05, 0.23);

    // ---- underside linework (dark on pale cyan)
    ribbon(C.deep, -1, spanS(s, 0.014, 0.8, 5.45, 24), 0.015, 0.012);
    ribbon(C.deep, -1, spanS(s, 0.985, 0.8, 5.2, 20), 0.011, 0.011);
    ribbon(C.deep, -1, spanS(s, 0.27, 0.85, 5.0), 0.009, 0.011);
    ribbon(C.deep, -1, spanS(s, 0.72, 0.95, 5.05), 0.011, 0.012);
    ribbon(C.deep, -1, chordS(s, 3.1, 0.06, 0.985, 12), 0.011, 0.012);
    for (const x of [2.5, 3.7, 4.3, 4.8]) ribbon(C.deep, -1, chordS(s, x, 0.06, 0.72, 10), 0.008, 0.011);
    ribbon(C.deep, -1, rectS(s, 0.95, 1.9, 0.18, 0.6), 0.012, 0.012); // wheel-well outline
    row(C.deep, s, -1, 0.05, 0.9, 5.2, 0.2);
    row(C.deep, s, -1, 0.7, 1.0, 5.0, 0.25);
    for (const gx of [1.95, 2.3, 2.65, 3.0]) patch(C.deep, -1, s * (gx - 0.05), s * (gx + 0.05), 0.28, 0.33, 0.008, 1, 1); // ejector slots

    // ---- roundels (top and underside)
    roundel(s, 1, 3.75, 0.38, 0.48);
    roundel(s, -1, 3.75, 0.38, 0.42);

    // ---- guns
    for (const gx of [1.95, 2.3, 2.65, 3.0]) {
      const c = C0 * Math.cos(Math.asin(gx / SPAN));
      const zle = QC + 0.25 * c;
      const y = Y0 + DIH * gx;
      const X = s * gx;
      zcyl(0.052, zle - 0.07, zle + 0.012, X, y, C.deep);
      zcyl(0.024, zle - 0.1, zle + 0.06, X, y, C.metal);
      zcyl(0.034, zle + 0.04, zle + 0.06, X, y, C.line);
      zcyl(0.016, zle + 0.058, zle + 0.062, X, y, C.deep);
    }

    // ---- wing-root fillets
    const xf = 0.7 * s;
    const fr = (t: number) => {
      const e = Math.sin(Math.PI * t) ** 0.6;
      return [0.02 + 0.09 * e, 0.015 + 0.07 * e] as [number, number];
    };
    for (const k of [1, -1]) {
      const pts = lin(0.04, 0.96, 9).map((v) => at(xf, v, k, -0.01));
      b.sweep(catmull(pts), fr, {
        bone: BODY,
        color: k > 0 ? C.upper : C.lower,
        sides: 8,
        caps: "round",
        group: "wings",
        name: `wings.fillet${tag}${k > 0 ? "Up" : "Low"}`,
      });
    }

    // ---- wing-tip light
    glow(
      b.part(new THREE.SphereGeometry(0.05, 8, 6), LENS, {
        bone: BODY,
        at: [s * 5.52, Y0 + DIH * 5.52, QC],
        group: "wings",
      }),
      0.9,
    );
  }

  // ---------------------------------------------------------------- landing light (left LE)
  {
    const x = 1.62;
    const c = C0 * Math.cos(Math.asin(x / SPAN));
    const zle = QC + 0.25 * c;
    const y = Y0 + DIH * x;
    zcyl(0.125, zle - 0.04, zle + 0.005, x, y, C.line, 12);
    glow(zcyl(0.1, zle - 0.02, zle + 0.02, x, y, LENS, 12), 1.3);
    zcyl(0.035, zle + 0.018, zle + 0.026, x, y, C.deep, 8);
  }

  // ---------------------------------------------------------------- pitot tube under the right wing
  {
    const x = -3.9;
    const c = C0 * Math.cos(Math.asin(Math.abs(x) / SPAN));
    const zle = QC + 0.25 * c;
    const low = at(x, 0.06, -1, 0);
    b.part(new THREE.BoxGeometry(0.025, 0.09, 0.06), C.metal, {
      bone: BODY,
      at: [x, low.y - 0.035, low.z],
      group: "wings",
    });
    zcyl(0.012, zle - 0.05, zle + 0.15, x, low.y - 0.08, C.metal, 6);
    zcyl(0.018, zle + 0.14, zle + 0.16, x, low.y - 0.08, C.line, 6);
  }

  // ---------------------------------------------------------------- flush the flat linework, one part per colour
  let n = 0;
  for (const [color, arr] of buckets) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    g.computeVertexNormals();
    b.part(g, color, { bone: BODY, at: [0, 0, 0], flat: true, group: "wings", name: `wings.lines${n++}` });
  }
}
```