<!-- call: plan -->

```json
{
  "name": "Spitfire Mk IX — Cyanotype Blueprint",
  "description": "A Supermarine Spitfire fighter plane standing tail-down on its undercarriage, built as a living cyanotype blueprint: deep Prussian-blue surfaces with every panel seam, rivet row, roundel and stencil drawn as crisp white and cyan linework.",
  "builderName": "spitfireBlueprint",
  "size": [11.2, 4.2, 8.0],
  "layout": "A taildragger stance: the fuselage datum line runs from the tail end at [0, 1.8, -4.4] up about 5° to the spinner centre at [0, 2.55, 3.3], so the nose sits high and the three-blade propeller (radius 1.6, top tip y 4.15) faces +Z. From front to back: engine cowling and spinner with prop (z 2.1 to 3.6); a low-set elliptical wing pair spanning x ±5.6, wing plane centre y 1.62, root chord 2.8 tapering to 1.0 at the tips, with a radiator bath under the centre; a raked canopy over the cockpit at z 0.4–1.5, canopy top y 2.9; the fuselage loft tapering from radius 0.72 at the cockpit to 0.28 at the tail; the tail assembly with a vertical fin reaching y 3.5 and a tailplane spanning x ±2.2 at y 1.95. Ground contact: two main wheels (radius 0.36, axles at [±1.2, 0.36, 0.55]) and a small tailwheel (radius 0.15 at [0, 0.15, -3.9]) all touch y = 0; everything else hangs above. The blueprint style shows on every part: every surface is one flat Prussian blue — lighter panelBlue/gridBlue on uppers, darkest deepBlue on undersides — and all detail is drawn as thin raised linework seated on the surface: cyan panel seams and hinge lines, tiny paleCyan rivet dots, ink outlines, roundels, stencilled hatches and tip bands, so the whole aircraft reads as a technical drawing given volume.",
  "palette": {
    "hullBlue": "#14365e",
    "panelBlue": "#1d4a7c",
    "gridBlue": "#2a5d94",
    "deepBlue": "#0b2244",
    "lineCyan": "#5fd8ff",
    "paleCyan": "#b9f0ff",
    "ink": "#eaf6ff",
    "steel": "#8fb4d8"
  },
  "mounts": {
    "firewall": [0, 2.48, 2.1],
    "wingRoot": [0, 1.62, 0.5],
    "tailMount": [0, 1.95, -3.7],
    "gearLegL": [0.9, 1.35, 0.75],
    "gearLegR": [-0.9, 1.35, 0.75],
    "tailwheelMount": [0, 1.62, -3.95]
  },
  "joints": [
    { "name": "airframe", "at": [0, 2.2, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "propHub", "parent": "airframe", "at": [0, 2.55, 3.3], "dir": [0, 0, 1], "role": "hinge", "group": "prop" },
    { "name": "rudder", "parent": "airframe", "at": [0, 2.6, -4.15], "dir": [0, 1, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorL", "parent": "airframe", "at": [1.4, 1.95, -3.7], "dir": [1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorR", "parent": "airframe", "at": [-1.4, 1.95, -3.7], "dir": [1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "aileronL", "parent": "airframe", "at": [3.6, 1.65, -0.3], "dir": [1, 0, 0], "role": "hinge", "group": "wings" },
    { "name": "aileronR", "parent": "airframe", "at": [-3.6, 1.65, -0.3], "dir": [1, 0, 0], "role": "hinge", "group": "wings" },
    { "name": "legL", "parent": "airframe", "at": [0.9, 1.35, 0.75], "dir": [0.18, -1, -0.1], "role": "leg", "group": "gear" },
    { "name": "legR", "parent": "airframe", "at": [-0.9, 1.35, 0.75], "dir": [-0.18, -1, -0.1], "role": "leg", "group": "gear" },
    { "name": "tailwheel", "parent": "airframe", "at": [0, 1.62, -3.95], "dir": [0, -1, 0], "role": "hinge", "group": "gear" }
  ],
  "parts": [
    {
      "id": "nose",
      "builds": "Engine cowling and propeller. Cowling: a swept barrel of radius 0.62 at the firewall mount [0, 2.48, 2.1] tapering slightly to the spinner base at [0, 2.55, 3.05], wearing hullBlue above the wing line and deepBlue below; vertical cowl panel seams as thin lineCyan sticks running over the barrel, a row of cooling gills (small extruded flaps in gridBlue edged lineCyan) on both upper flanks, two gun ports low on the top cowl (deepBlue discs ringed ink). Six round exhaust stubs, three per side: short frustumBox stubs in steel, angled back along the lower flanks just above the belly line. Spinner: a lathe dome in deepBlue with a thin ink rim ring, seated on the propHub joint at [0, 2.55, 3.3]. Three flat propeller blades built on propHub so they can spin, 120° apart with one blade straight up: each an extruded blade 1.55 long and 0.18 wide, steel, with a paleCyan leading-edge strip and an ink tip band; blades sweep from y 0.95 to 4.15 and stay clear of the cowl.",
      "box": [[-1.7, 0.9, 1.9], [1.7, 4.2, 3.6]],
      "attaches": "Cowl barrel meets the fuselage at the firewall mount [0, 2.48, 2.1], sharing the fuselage's front face; spinner and blades ride the propHub joint.",
      "joints": ["airframe", "propHub"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "fuselage",
      "builds": "Tapered monocoque body from the firewall mount [0, 2.48, 2.1] back to the tail end at [0, 1.8, -4.4], lofted along the datum line with radius 0.72 at the cockpit (z 0.9), 0.62 at mid, 0.28 at the tail: hullBlue above the belly line, deepBlue below. Blueprint detailing: five horizontal panel seam rings (thin lineCyan bands seated on the surface) at even stations, two rows of rivet dots (tiny paleCyan studs) along the upper flanks from nose to tail, and a panelBlue tail band at z -3.6. Cockpit at z 0.4–1.5: a raked windscreen of paleCyan glass panels with lineCyan frames, a sliding bubble canopy of paleCyan with lineCyan frames and an ink outline, a hullBlue headrest fairing behind it, and a small machine-gun cowling hump in hullBlue in front of the windscreen. Roundels (ink outer ring, hullBlue disc, lineCyan centre dot) on both flanks at z 0.1. Stencilled hatch marks (tiny ink dashes in pairs) near the tail flanks, and the tailwheelMount boss [0, 1.62, -3.95] where the gear meets.",
      "box": [[-0.75, 1.45, -4.4], [0.75, 3.0, 2.1]],
      "attaches": "Front face meets the nose at the firewall mount [0, 2.48, 2.1]; lower flanks meet the wings along the wingRoot mount line at [0, 1.62, 0.5]; rear meets the tail at the tailMount [0, 1.95, -3.7]; belly boss meets the gear at the tailwheelMount [0, 1.62, -3.95].",
      "joints": ["airframe"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "wings",
      "builds": "Elliptical wing pair growing outward from the wingRoot mount [0, 1.62, 0.5]: half-span 5.6 to each tip at x ±5.6, root chord 2.8 (z -1.35 to 1.45) tapering elliptically to a 1.0 tip chord (z -0.15 to 0.85), thickness 0.42 at the root to 0.12 at the tip, 1.5° dihedral, built as lofts or extruded planform panels. Upper surface gridBlue, lower surface deepBlue, leading edges trimmed with a thin lineCyan strip. Details on top: ink-ringed roundels with hullBlue discs at x ±2.4; cannon bulges and muzzle fairings (small frustumBox bumps in hullBlue with deepBlue ports) at x ±2.4 and machine-gun ports at x ±3.6; a fuel cap (small ink disc) on the left wing; access panel rectangles drawn as thin lineCyan outlines. Ailerons at x ±3.8–5.3 built on the aileronL/aileronR hinge joints, panelBlue with a lineCyan hinge line. Underneath: a pitot tube (thin steel rod, 0.25 long) below the left wing tip, and a radiator bath under the wing centre at z 0.3 — a panelBlue scoop with a deepBlue inlet, x -0.6 to 0.6.",
      "box": [[-5.65, 1.3, -1.5], [5.65, 1.95, 1.5]],
      "attaches": "Inner edges seat against the fuselage flanks along the wingRoot mount [0, 1.62, 0.5], sharing the fuselage's side faces; ailerons ride the aileronL and aileronR joints.",
      "joints": ["airframe", "aileronL", "aileronR"],
      "floor": false,
      "budget": 240
    },
    {
      "id": "tail",
      "builds": "Empennage from the tailMount [0, 1.95, -3.7]. Vertical fin: an extruded swept fin, leading edge raked back, tip 1.55 above the datum (top y 3.5), hullBlue with a panelBlue flash stripe and an ink outline stripe along the leading edge; a small hullBlue fin fillet blends the fin root into the fuselage top. Rudder: an extruded panel hinged on the rudder joint at the fin's trailing edge, panelBlue with a lineCyan hinge line and a paleCyan trim tab at its bottom. Horizontal tailplane: two elliptical extruded slabs spanning x ±2.2 at y 1.95, z -3.9 to -3.2, gridBlue on top, deepBlue below, lineCyan leading-edge trim. Elevators: outer panels on the elevatorL and elevatorR hinge joints, panelBlue with lineCyan hinge lines and paleCyan trim tabs. A small ventral fin (deepBlue extruded blade) under the tail behind the tailwheelMount.",
      "box": [[-2.35, 1.55, -4.55], [2.35, 3.6, -2.9]],
      "attaches": "Fin root and tailplane roots seat against the fuselage rear at the tailMount [0, 1.95, -3.7], sharing the fuselage's tail face; rudder rides the rudder joint, elevators ride the elevatorL and elevatorR joints.",
      "joints": ["airframe", "rudder", "elevatorL", "elevatorR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "gear",
      "builds": "Taildragger undercarriage resting on y = 0. Main legs: from the gearLegL and gearLegR mounts [±0.9, 1.35, 0.75] raking down and outward to wheel axles at [±1.2, 0.36, 0.55], on the legL and legR joints — steel struts (0.06 radius) with a shorter drag brace, scissor links and a thin brake line. Main wheels: radius 0.36 so they touch y = 0, deepBlue tires with steel hub discs, a lineCyan hub-cross of four spokes and an ink rim ring. Tailwheel: a short steel fork from the tailwheelMount [0, 1.62, -3.95] on the tailwheel joint down to a radius 0.15 wheel at [0, 0.15, -3.9] touching y = 0, same deepBlue tire, steel hub and ink rim treatment. Small details: ink axle nuts, a lineCyan wheel-alignment mark on each hub face.",
      "box": [[-1.6, 0.0, -4.3], [1.6, 1.4, 1.1]],
      "attaches": "Leg tops meet the wing undersides at the gearLegL/gearLegR mounts [±0.9, 1.35, 0.75]; the fork top meets the fuselage belly at the tailwheelMount [0, 1.62, -3.95]; wheels and tailwheel are the only parts touching y = 0.",
      "joints": ["airframe", "legL", "legR", "tailwheel"],
      "floor": true,
      "budget": 100
    }
  ]
}
```

<!-- call: gear -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildGear({ b, J, P, M }: Ctx) {
  const STEEL = P.steel, TIRE = P.deepBlue, INK = P.ink, CY = P.lineCyan, PALE = P.paleCyan, HULL = P.hullBlue;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // wheel: axis along X (side = +1 left, -1 right), centre c
  function wheel(c: THREE.Vector3, r: number, side: number, bone: any, tw: number, tag: string) {
    const ax: [number, number, number] = [1, 0, 0];
    b.part(new THREE.CylinderGeometry(r, r, tw, 20), TIRE, { bone, at: c.toArray() as any, dir: ax });
    // tread grooves
    for (const k of [-0.28, 0.28])
      b.part(new THREE.TorusGeometry(r * 0.995, tw * 0.05, 4, 20), P.hullBlue, {
        bone, at: [c.x + k * tw, c.y, c.z], dir: ax, axis: "z",
      });
    // hub disc on both faces
    for (const s of [1, -1]) {
      const x = c.x + s * (tw / 2 + 0.004);
      b.part(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.012, 16), STEEL, { bone, at: [x, c.y, c.z], dir: ax });
      b.part(new THREE.TorusGeometry(r * 0.66, r * 0.035, 4, 20), INK, { bone, at: [x + s * 0.004, c.y, c.z], dir: ax, axis: "z" });
      b.part(new THREE.TorusGeometry(r * 0.8, r * 0.025, 4, 20), CY, { bone, at: [x - s * 0.002, c.y, c.z], dir: ax, axis: "z" });
      // four spokes
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const d = V(0, Math.sin(a), Math.cos(a));
        const e = V(x + s * 0.01, c.y + d.y * r * 0.55, c.z + d.z * r * 0.55);
        b.rod(V(x + s * 0.01, c.y, c.z), e, r * 0.045, CY, { bone, sides: 4 } as any);
      }
      // axle nut
      b.part(new THREE.CylinderGeometry(r * 0.16, r * 0.16, 0.04, 6), INK, { bone, at: [x + s * 0.02, c.y, c.z], dir: ax });
      // alignment mark
      b.part(new THREE.BoxGeometry(0.008, r * 0.14, r * 0.04), CY, { bone, at: [x + s * 0.008, c.y, c.z + r * 0.5] });
      b.part(new THREE.BoxGeometry(0.008, r * 0.04, r * 0.14), PALE, { bone, at: [x + s * 0.008, c.y + r * 0.5, c.z] });
    }
  }

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.legL : J.legR;
    const top = V(s * 0.9, 1.35, 0.75);
    const axle = V(s * 1.2, 0.36, 0.55);
    const knee = V(s * 1.05, 0.9, 0.65);
    // mounting fairing at wing underside
    b.part(new THREE.CylinderGeometry(0.11, 0.14, 0.1, 8), HULL, { bone, at: [top.x, top.y - 0.03, top.z] });
    b.part(new THREE.TorusGeometry(0.12, 0.012, 4, 12), CY, { bone, at: [top.x, top.y - 0.08, top.z], dir: [0, 1, 0], axis: "z" });
    // main strut with oleo sleeve
    b.rod(top, axle, 0.06, STEEL, { bone, sides: 8 } as any);
    b.rod(top, knee, 0.085, HULL, { bone, sides: 8 } as any);
    b.rod(knee, V(knee.x + s * 0.005, knee.y - 0.02, knee.z), 0.095, CY, { bone, sides: 8 } as any);
    // drag brace
    const brace = V(s * 0.75, 1.05, 0.35);
    b.rod(brace, V(s * 1.07, 0.8, 0.6), 0.035, STEEL, { bone, sides: 6 } as any);
    b.part(new THREE.SphereGeometry(0.045, 6, 4), INK, { bone, at: brace.toArray() as any });
    // scissor links
    const sc1 = V(s * 1.08, 0.78, 0.66), sc2 = V(s * 1.13, 0.6, 0.6);
    b.rod(sc1, sc2, 0.025, STEEL, { bone, sides: 6 } as any);
    b.rod(V(s * 1.07, 0.62, 0.64), V(s * 1.12, 0.8, 0.58), 0.022, CY, { bone, sides: 6 } as any);
    b.part(new THREE.SphereGeometry(0.035, 6, 4), INK, { bone, at: sc1.toArray() as any });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), INK, { bone, at: sc2.toArray() as any });
    // brake line
    b.rod(V(s * 0.95, 1.25, 0.8), V(s * 1.1, 0.8, 0.72), 0.009, PALE, { bone, sides: 4 } as any);
    b.rod(V(s * 1.1, 0.8, 0.72), V(s * 1.17, 0.42, 0.6), 0.009, PALE, { bone, sides: 4 } as any);
    // axle stub and fork
    b.rod(V(s * 1.12, 0.36, 0.55), V(s * 1.28, 0.36, 0.55), 0.045, STEEL, { bone, sides: 8 } as any);
    wheel(V(s * 1.2, 0.36, 0.55), 0.36, s, bone, 0.16, "main");
  }

  // tailwheel
  const tb = J.tailwheel;
  const tTop = V(0, 1.62, -3.95), tAx = V(0, 0.15, -3.9);
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), HULL, { bone: tb, at: [0, 1.58, -3.95] });
  b.part(new THREE.TorusGeometry(0.105, 0.01, 4, 12), CY, { bone: tb, at: [0, 1.62, -3.95], dir: [0, 1, 0], axis: "z" });
  b.rod(tTop, V(0, 0.62, -3.93), 0.05, STEEL, { bone: tb, sides: 8 } as any);
  b.rod(V(0, 0.62, -3.93), tAx, 0.03, STEEL, { bone: tb, sides: 6 } as any);
  b.rod(V(0, 1.2, -3.94), V(0, 0.8, -3.97), 0.06, HULL, { bone: tb, sides: 8 } as any);
  for (const s of [1, -1]) {
    b.rod(V(s * 0.04, 0.5, -3.93), V(s * 0.1, 0.15, -3.9), 0.022, STEEL, { bone: tb, sides: 6 } as any);
  }
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.05), CY, { bone: tb, at: [0, 0.5, -3.93] });
  b.rod(V(-0.1, 0.15, -3.9), V(0.1, 0.15, -3.9), 0.025, STEEL, { bone: tb, sides: 6 } as any);
  wheel(tAx, 0.15, 1, tb, 0.1, "tail");
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildFuselage({ b, J, P, M }: Ctx) {
  const bone = J.airframe;
  const HULL = P.hullBlue, DEEP = P.deepBlue, PANEL = P.panelBlue;
  const CY = P.lineCyan, PALE = P.paleCyan, INK = P.ink;

  // Datum line: tail [0,1.8,-4.4] to firewall [0,2.48,2.1]
  const T = new THREE.Vector3(0, 1.8, -4.4);
  const F = new THREE.Vector3(...(M.firewall as [number, number, number]));
  const datum = (z: number) => {
    const t = (z - T.z) / (F.z - T.z);
    return new THREE.Vector3(0, T.y + (F.y - T.y) * t, z);
  };
  // radius profile along z
  const rad = (z: number) => {
    if (z >= 0.9) return 0.72 - (z - 0.9) * 0.05;
    if (z >= -1.2) return 0.72 - ((0.9 - z) / 2.1) * 0.1;
    return 0.62 - ((-1.2 - z) / 3.2) * 0.34;
  };

  const zs = [2.1, 1.5, 0.9, 0.2, -0.6, -1.4, -2.2, -3.0, -3.7, -4.4];
  const pts = zs.map((z) => datum(z).toArray());
  const path = catmull(pts);
  const radii = zs.map((z) => rad(z));

  // upper hull and lower belly: two tubes with offsets
  b.sweep(path, radii, { bone, color: HULL, sides: 10, caps: "flat" });
  // belly strip in deepBlue
  b.sweep(path, radii.map((r) => r * 0.99), {
    bone,
    color: DEEP,
    sides: 10,
    caps: "none",
    sectors: [[110, 250, DEEP]],
  } as any);

  const surf = b.surface(b.root);
  void surf;

  // Panel seam rings
  const seamZ = [1.9, 0.6, -0.6, -1.8, -3.0];
  for (const z of seamZ) {
    const c = datum(z);
    const r = rad(z);
    b.part(new THREE.TorusGeometry(r + 0.004, 0.01, 4, 20), CY, {
      bone, at: c.toArray(), dir: [0, 0, 1], axis: "z",
    });
  }
  // tail band
  {
    const z = -3.6, c = datum(z), r = rad(z);
    b.part(new THREE.CylinderGeometry(r + 0.006, r + 0.012, 0.22, 14, 1, true), PANEL, {
      bone, at: c.toArray(), dir: [0, 0, 1],
    });
  }

  // Rivet rows along upper flanks
  const rv = new THREE.SphereGeometry(0.012, 4, 3);
  for (const s of [1, -1])
    for (let i = 0; i < 26; i++) {
      const z = 2.0 - i * 0.24;
      const c = datum(z);
      const r = rad(z) + 0.006;
      const a = 0.9; // radians above horizontal
      b.part(rv, PALE, { bone, at: [s * Math.cos(a) * r * 0.99, c.y + Math.sin(a) * r, z] });
    }

  // Roundels on flanks
  for (const s of [1, -1]) {
    const c = datum(0.1);
    const r = rad(0.1);
    const at = [s * (r + 0.004), c.y, 0.1];
    const d: [number, number, number] = [s, 0, 0];
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.012, 20), INK, { bone, at, dir: d });
    b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.012, 20), HULL, { bone, at: [at[0] + s * 0.005, at[1], at[2]], dir: d });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 16), CY, { bone, at: [at[0] + s * 0.01, at[1], at[2]], dir: d });
  }

  // Stencil hatches near tail
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++) {
      const z = -2.7 - k * 0.3;
      const c = datum(z);
      const r = rad(z);
      for (const dz of [0, 0.06])
        b.part(new THREE.BoxGeometry(0.012, 0.01, 0.1), INK, {
          bone, at: [s * (r + 0.004), c.y + 0.08, z + dz],
        });
    }

  // Cockpit: windscreen
  const wc = datum(1.35);
  b.part(new THREE.BoxGeometry(0.62, 0.34, 0.03), PALE, {
    bone, at: [0, wc.y + 0.68, 1.3], rotation: [-55, 0, 0],
  });
  for (const x of [-0.31, 0, 0.31])
    b.part(new THREE.BoxGeometry(0.025, 0.38, 0.04), CY, {
      bone, at: [x, wc.y + 0.68, 1.3], rotation: [-55, 0, 0],
    });
  b.part(new THREE.BoxGeometry(0.66, 0.025, 0.04), CY, {
    bone, at: [0, wc.y + 0.82, 1.2], rotation: [-55, 0, 0],
  });
  // Bubble canopy
  const cc = datum(0.8);
  const canopy = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(canopy, PALE, { bone, at: [0, cc.y + 0.5, 0.75], scale: [0.4, 0.4, 0.75] });
  // canopy frames
  for (const z of [0.1, 0.55, 1.0])
    b.part(new THREE.TorusGeometry(1, 0.02, 4, 14, Math.PI), CY, {
      bone, at: [0, cc.y + 0.5, z], scale: [0.4 * Math.sqrt(1 - ((z - 0.75) / 0.75) ** 2), 0.4 * Math.sqrt(1 - ((z - 0.75) / 0.75) ** 2), 1],
    });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 4), INK, {
    bone, at: [0, cc.y + 0.9, 0.75], dir: [0, 0, 1],
  });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4), INK, {
      bone, at: [s * 0.4, cc.y + 0.52, 0.75], dir: [0, 0, 1],
    });
  // headrest fairing
  b.part(new THREE.SphereGeometry(1, 10, 6), HULL, {
    bone, at: [0, datum(-0.4).y + 0.62, -0.4], scale: [0.3, 0.2, 0.8],
  });
  // gun cowling hump
  b.part(new THREE.SphereGeometry(1, 10, 6), HULL, {
    bone, at: [0, datum(1.75).y + 0.66, 1.8], scale: [0.4, 0.14, 0.4],
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 5), INK, { bone, at: [0.12, datum(1.9).y + 0.74, 2.0], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 5), INK, { bone, at: [-0.12, datum(1.9).y + 0.74, 2.0], dir: [0, 0, 1] });

  // Tailwheel boss
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.14, 8), DEEP, {
    bone, at: [M.tailwheelMount[0], M.tailwheelMount[1] + 0.02, M.tailwheelMount[2]],
  });
  b.part(new THREE.TorusGeometry(0.1, 0.012, 4, 10), CY, {
    bone, at: [M.tailwheelMount[0], M.tailwheelMount[1] - 0.04, M.tailwheelMount[2]], rotation: [90, 0, 0],
  });
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: any) {
  const r = rng(5);
  const X: [number, number, number] = [1, 0, 0];

  // Extrude helper: outline drawn in (z,y) side view, thickness along X.
  const side = (pts: any[], at: number[], th: number, color: string, bone: any, x = 0) =>
    b.extrude(pts, { at: [x, at[1], at[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: th, color, bone });

  // Plan view outline (x across, z fore-aft) lying flat: outline x -> world X, y -> world Z
  const plan = (pts: any[], at: number[], th: number, color: string, bone: any) =>
    b.extrude(pts, { at, x: [1, 0, 0], y: [0, 0, 1], thickness: th, color, bone });

  // ---------------- Fin ----------------
  // side outline: u = z offset from fin root front (going back is -z). Use world z by at z=0 and negative coords.
  const finPts: any[] = [
    [-3.05, 1.95],
    [-3.25, 2.5],
    [-3.55, 3.5, "sharp"],
    [-3.95, 3.5, "sharp"],
    [-4.2, 2.6],
    [-4.2, 1.95],
  ];
  // outline x -> world z direction (+z); we use z coordinates directly with at z=0.
  side(finPts, [0, 0, 0], 0.1, P.hullBlue, J.airframe);
  // fillet
  side(
    [[-2.7, 1.9], [-3.05, 2.0], [-3.3, 2.5], [-3.55, 2.5], [-3.5, 1.9]],
    [0, 0, 0], 0.16, P.hullBlue, J.airframe,
  );
  // flash stripe on both sides
  for (const s of [1, -1]) {
    side(
      [[-3.3, 2.45], [-3.7, 2.45], [-3.8, 2.75], [-3.4, 2.75]],
      [0, 0, 0], 0.012, P.panelBlue, J.airframe, s * 0.056,
    );
    // leading edge ink stripe
    b.rod([s * 0.055, 2.0, -3.06], [s * 0.055, 3.48, -3.56], 0.012, P.ink, { bone: J.airframe });
    // fin fillet seam
    b.rod([s * 0.085, 1.95, -2.75], [s * 0.085, 2.45, -3.5], 0.008, P.lineCyan, { bone: J.airframe });
  }
  // rivets on fin
  for (let i = 0; i < 6; i++) {
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.014, 4, 3), P.paleCyan, {
        bone: J.airframe, at: [s * 0.054, 2.1 + i * 0.2, -3.55 - i * 0.03 - 0.1],
      });
  }

  // ---------------- Rudder ----------------
  const rud = b.extrude(
    [[-4.2, 1.95], [-4.2, 2.6], [-3.95, 3.5, "sharp"], [-3.95, 3.5, "sharp"].slice(0, 2) as any, [-4.0, 3.2], [-4.4, 2.6], [-4.45, 2.0], [-4.3, 1.95]]
      .filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]),
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: P.panelBlue, bone: J.rudder },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.04, 1.97, -4.2], [s * 0.04, 3.45, -3.96], 0.01, P.lineCyan, { bone: J.rudder });
    side([[-4.15, 1.98], [-4.4, 2.0], [-4.4, 2.2], [-4.17, 2.2]], [0, 0, 0], 0.012, P.paleCyan, J.rudder, s * 0.04);
  }

  // ---------------- Tailplane ----------------
  for (const s of [1, -1]) {
    // elliptical inner slab, x 0..1.4
    const inner: any[] = [];
    const N = 8;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * (Math.PI / 2) * 0.62;
      const xx = s * 1.4 * Math.sin(a * (2 / 0.62 / 2) * 0.62 * 1.0);
      inner.push([s * (i / N) * 1.4, -3.2 - 0.0]);
    }
    const lead = (x: number) => -3.2 - 0.25 * (Math.abs(x) / 2.2) ** 2 * 1.4;
    const trail = (x: number) => -3.9 + 0.12 * (Math.abs(x) / 2.2) ** 2;
    // inner slab outline (plan: x, z) – order ccw regardless of s
    const xs = [0, 0.35, 0.7, 1.05, 1.4];
    const outline: any[] = [];
    for (const x of xs) outline.push([s * x, lead(x)]);
    for (const x of [...xs].reverse()) outline.push([s * x, trail(x) + 0.0]);
    plan(outline, [0, 1.94, 0], 0.07, P.gridBlue, J.airframe);
    plan(outline, [0, 1.9, 0], 0.03, P.deepBlue, J.airframe);
    // leading edge trim
    for (let i = 0; i < 4; i++)
      b.rod([s * xs[i], 1.975, lead(xs[i])], [s * xs[i + 1], 1.975, lead(xs[i + 1])], 0.012, P.lineCyan, { bone: J.airframe });
    // elevator outer panel on hinge joint
    const exs = [1.4, 1.7, 1.95, 2.15, 2.2];
    const el: any[] = [];
    for (const x of exs) el.push([s * x, lead(x)]);
    for (const x of [...exs].reverse()) el.push([s * x, trail(x)]);
    const eb = s > 0 ? J.elevatorL : J.elevatorR;
    plan(el, [0, 1.94, 0], 0.07, P.panelBlue, eb);
    plan(el, [0, 1.9, 0], 0.03, P.deepBlue, eb);
    // hinge line along elevator front boundary of trailing section
    b.rod([s * 1.4, 1.985, -3.62], [s * 2.15, 1.985, -3.7], 0.01, P.lineCyan, { bone: eb });
    b.rod([s * 1.4, 1.985, lead(1.4)], [s * 2.15, 1.985, lead(2.15)], 0.011, P.lineCyan, { bone: eb });
    // trim tab
    plan([[s * 1.6, -3.84], [s * 1.95, -3.82], [s * 1.95, -3.9], [s * 1.6, -3.9]], [0, 1.985, 0], 0.012, P.paleCyan, eb);
    // seam & rivets on tailplane
    b.rod([s * 0.1, 1.985, -3.55], [s * 1.35, 1.985, -3.6], 0.008, P.lineCyan, { bone: J.airframe });
    for (let i = 0; i < 7; i++)
      b.part(new THREE.SphereGeometry(0.014, 4, 3), P.paleCyan, {
        bone: J.airframe, at: [s * (0.2 + i * 0.17), 1.985, -3.45 - r() * 0.02],
      });
  }

  // ---------------- Ventral fin ----------------
  side(
    [[-3.8, 1.72], [-4.1, 1.62], [-4.35, 1.66], [-4.25, 1.85], [-3.9, 1.85]],
    [0, 0, 0], 0.06, P.deepBlue, J.airframe,
  );
  for (const s of [1, -1])
    b.rod([s * 0.032, 1.74, -3.85], [s * 0.032, 1.67, -4.25], 0.008, P.lineCyan, { bone: J.airframe });
}
```

<!-- call: nose -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildNose({ b, J, P, M }: Ctx) {
  const air = J.airframe;
  const hub = J.propHub;
  const R0 = 0.62;
  const R1 = 0.5;
  const zA = 2.1;
  const zB = 3.05;
  const yA = 2.48;
  const yB = 2.55;
  const rnd = rng(11);

  // Cowl barrel: a rigid lathe along +Z (two halves: upper hull, lower deep)
  const cy = (z: number) => yA + ((z - zA) / (zB - zA)) * (yB - yA);
  const rr = (z: number) => R0 + ((z - zA) / (zB - zA)) * (R1 - R0);

  const barrel = (arcStart: number, arcLen: number, color: string) => {
    const g = new THREE.CylinderGeometry(R1, R0, zB - zA, 20, 1, true, arcStart, arcLen);
    g.rotateX(Math.PI / 2); // axis along +Z, wide end at -Z
    const m = b.part(g, color, {
      bone: air,
      at: [0, (yA + yB) / 2, (zA + zB) / 2],
      flat: true,
    });
    return m;
  };
  // Cylinder theta 0 is +Z before rotation; after rotateX(90deg) the theta sweeps in the XY plane.
  // Build upper and lower halves with cap-free geometry, then use solid inner core for closure.
  barrel(Math.PI / 2 - Math.PI * 0.0, Math.PI, P.hullBlue);
  barrel(-Math.PI / 2, Math.PI, P.deepBlue);
  // inner dark core so no see-through at the seam
  b.part(new THREE.CylinderGeometry(R1 - 0.02, R0 - 0.02, zB - zA, 16).rotateX(Math.PI / 2), P.deepBlue, {
    bone: air,
    at: [0, (yA + yB) / 2, (zA + zB) / 2],
  });
  // rear and front rings
  for (const [z, r] of [[zA + 0.02, R0 + 0.01], [zB - 0.02, R1 + 0.01]] as [number, number][]) {
    b.part(new THREE.TorusGeometry(r, 0.018, 4, 24), P.lineCyan, { bone: air, at: [0, cy(z), z] });
  }

  // vertical cowl seams over the barrel
  const seamAng = [-70, -35, 0, 35, 70, 110, 145, 180, 215, 250];
  for (const deg of seamAng) {
    const a = (deg * Math.PI) / 180;
    const z = (zA + zB) / 2;
    const r = rr(z) + 0.004;
    const len = zB - zA - 0.06;
    const upper = Math.cos(a) > -0.35;
    if (!upper && deg % 2) continue;
    const x = Math.sin(a) * r;
    const y = cy(z) + Math.cos(a) * r;
    b.part(new THREE.BoxGeometry(0.012, 0.012, len), P.lineCyan, {
      bone: air,
      at: [x, y, z],
      rotation: [0, 0, 0],
      dir: undefined,
    });
  }

  // cooling gills on upper flanks
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 2.28 + i * 0.13;
      const a = 62 * (Math.PI / 180);
      const r = rr(z);
      const x = s * Math.sin(a) * (r + 0.01);
      const y = cy(z) + Math.cos(a) * (r + 0.01);
      const flap = b.extrude(
        [[0, 0], [0.09, 0], [0.09, 0.2], [0, 0.2]],
        { at: [x, y - 0.1, z], x: [0, 0, 1], y: [s * 0.4, 1, 0], thickness: 0.02, color: P.gridBlue, bone: air },
      );
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.012), P.lineCyan, {
        bone: air,
        at: [x + s * 0.012, y, z + 0.05],
        rotation: [0, 0, s * -28],
      });
    }
  }

  // gun ports low on top cowl
  for (const s of [1, -1]) {
    const z = 2.75;
    const x = s * 0.2;
    const y = cy(z) + Math.sqrt(Math.max(0.01, rr(z) ** 2 - x * x)) - 0.01;
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), P.ink, { bone: air, at: [x, y, z], dir: [0, 1, 0] });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), P.deepBlue, { bone: air, at: [x, y + 0.004, z] });
  }

  // exhaust stubs, three per side
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 2.3 + i * 0.28;
      const a = (s * 118 * Math.PI) / 180;
      const r = rr(z);
      const x = Math.sin(a) * (r + 0.05);
      const y = cy(z) + Math.cos(a) * (r + 0.05);
      b.frustumBox([x, y, z + 0.1], [x + s * 0.08, y - 0.03, z - 0.08], [0.1, 0.1], [0.07, 0.07], {
        color: P.steel,
        bone: air,
      });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), P.deepBlue, {
        bone: air,
        at: [x + s * 0.08, y - 0.03, z - 0.08],
        dir: [s * 0.5, -0.2, -1],
      });
    }
  }

  // spinner (lathe on prop hub, axis +Z)
  b.lathe(
    [[0, 0], [0.34, 0], [0.34, 0.03], [0.3, 0.12], [0.22, 0.26], [0.1, 0.38], [0, 0.42]],
    { at: [0, 2.55, 3.04], axis: [0, 0, 1], segments: 16, smoothing: 1, color: P.deepBlue, bone: hub },
  );
  b.part(new THREE.TorusGeometry(0.34, 0.014, 4, 24), P.ink, { bone: hub, at: [0, 2.55, 3.07] });
  b.part(new THREE.TorusGeometry(0.2, 0.01, 4, 20), P.lineCyan, { bone: hub, at: [0, 2.55, 3.3] });

  // propeller blades, 120 degrees apart, one straight up
  for (let k = 0; k < 3; k++) {
    const ang = (k * 120 * Math.PI) / 180;
    const ux = -Math.sin(ang);
    const uy = Math.cos(ang);
    const r0 = 0.3;
    const L = 1.25 + 0.0;
    // outline in (u radial, v chord), twist-less flat blade
    const outline: [number, number][] = [
      [0, -0.06], [0.3, -0.09], [0.8, -0.09], [1.25, -0.07], [1.3, 0], [1.25, 0.09], [0.8, 0.1], [0.3, 0.09], [0, 0.06],
    ];
    const at = [ux * r0, 2.55 + uy * r0, 3.22];
    const blade = b.extrude(outline, {
      at, x: [ux, uy, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.006, color: P.steel, bone: hub,
    });
    // leading edge strip (toward +chord along perpendicular)
    const px = uy;
    const py = ux * -1;
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), P.paleCyan, { bone: hub, at: [0, 0, 0], scale: [0, 0, 0] });
    b.rod(
      [ux * 0.4 + 0, 2.55 + uy * 0.4, 3.22 + 0.095],
      [ux * 1.45, 2.55 + uy * 1.45, 3.22 + 0.075],
      0.012,
      P.paleCyan,
      { bone: hub },
    );
    // tip band
    b.extrude(
      [[0, -0.08], [0.1, -0.07], [0.1, 0.09], [0, 0.1]],
      { at: [ux * 1.33, 2.55 + uy * 1.33, 3.22], x: [ux, uy, 0], y: [0, 0, 1], thickness: 0.034, color: P.ink, bone: hub },
    );
    // root cuff
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 8), P.steel, {
      bone: hub,
      at: [ux * 0.3, 2.55 + uy * 0.3, 3.22],
      dir: [ux, uy, 0],
    });
    void px; void py; void blade; void L; void rnd; void frame;
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildWings({ b, J, P, M }: Ctx) {
  const BONE = J.airframe;
  const HALF = 5.6;
  const X0 = 0.5;
  const DIH = Math.tan((1.5 * Math.PI) / 180);
  const rootY = M.wingRoot[1];

  // ---- planform functions (x is |x|) ----
  const chordHalf = (x: number) => 0.5 * (1.0 + 1.8 * Math.sqrt(Math.max(0, 1 - (x / HALF) ** 2)));
  const zc = (x: number) => 0.05 + 0.3 * (x / HALF);
  const wingY = (x: number) => rootY + DIH * x;
  const thickHalf = (x: number) => 0.21 - 0.15 * (x / HALF);
  const top = (x: number, z: number) => {
    const c = chordHalf(x);
    const dz = Math.max(-0.98, Math.min(0.98, (z - zc(x)) / c));
    return wingY(x) + thickHalf(x) * Math.sqrt(1 - dz * dz);
  };
  const bottom = (x: number, z: number) => {
    const c = chordHalf(x);
    const dz = Math.max(-0.98, Math.min(0.98, (z - zc(x)) / c));
    return wingY(x) - thickHalf(x) * Math.sqrt(1 - dz * dz);
  };
  const le = (x: number) => zc(x) + chordHalf(x);
  const te = (x: number) => zc(x) - chordHalf(x);
  const hinge = (x: number) => zc(x) - 0.4 * chordHalf(x);

  const rodTop = (s: number, x0: number, z0: number, x1: number, z1: number, r: number, color: string, lift = 0.004) => {
    const n = 4;
    const pts: number[][] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const z = z0 + ((z1 - z0) * i) / n;
      pts.push([s * x, top(x, z) + lift, z]);
    }
    b.sweep(pts, r, { color, bone: BONE, sides: 6, caps: "flat" });
  };
  const rodBottom = (s: number, x0: number, z0: number, x1: number, z1: number, r: number, color: string) => {
    const n = 3;
    const pts: number[][] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const z = z0 + ((z1 - z0) * i) / n;
      pts.push([s * x, bottom(x, z) - 0.004, z]);
    }
    b.sweep(pts, r, { color, bone: BONE, sides: 6, caps: "flat" });
  };
  const panelTop = (s: number, x0: number, x1: number, z0: number, z1: number) => {
    rodTop(s, x0, z0, x1, z0, 0.008, P.lineCyan);
    rodTop(s, x0, z1, x1, z1, 0.008, P.lineCyan);
    rodTop(s, x0, z0, x0, z1, 0.008, P.lineCyan);
    rodTop(s, x1, z0, x1, z1, 0.008, P.lineCyan);
  };

  const rivets: THREE.BufferGeometry[] = [];

  for (const s of [1, -1]) {
    const aileron = s > 0 ? J.aileronL : J.aileronR;

    // ---- main wing panel ----
    const x1 = HALF;
    b.sweep(
      [
        [s * X0, wingY(X0), zc(X0)],
        [s * x1, wingY(x1), zc(x1)],
      ],
      (t: number) => {
        const x = X0 + (x1 - X0) * t;
        return [chordHalf(x), thickHalf(x)];
      },
      {
        color: P.deepBlue,
        sectors: [[-95, 95, P.gridBlue]],
        sides: 16,
        caps: "flat",
        bone: BONE,
      },
    );

    // leading edge trim
    const lePts: number[][] = [];
    for (let i = 0; i <= 10; i++) {
      const x = X0 + ((HALF - 0.1 - X0) * i) / 10;
      lePts.push([s * x, wingY(x), le(x) - 0.004]);
    }
    b.sweep(lePts, 0.02, { color: P.lineCyan, bone: BONE, sides: 6, caps: "round" });

    // spanwise rib lines on top
    for (const f of [0.55, -0.1]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 8; i++) {
        const x = 0.8 + ((3.7 - 0.8) * i) / 8 + (f < 0 ? 1.0 * (i / 8) : 0);
        pts.push([s * x, top(x, zc(x) + chordHalf(x) * f) + 0.004, zc(x) + chordHalf(x) * f]);
      }
      b.sweep(pts, 0.007, { color: P.lineCyan, bone: BONE, sides: 6, caps: "flat" });
    }

    // wing tip ring + band
    for (const [xx, col] of [
      [5.35, P.ink],
      [5.05, P.lineCyan],
    ] as [number, string][]) {
      const ring: number[][] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        ring.push([s * xx, wingY(xx) + thickHalf(xx) * Math.cos(a) * 1.03, zc(xx) + chordHalf(xx) * Math.sin(a) * 1.01]);
      }
      b.sweep(ring.length ? (ring as number[][]) : ring, 0.014, { color: col, bone: BONE, sides: 6, caps: "none" });
    }
    // closed ring path version for continuity
    // (above uses open point array; the seam is hidden by the overlap)

    // ---- roundel on top at x 2.4 ----
    {
      const rx = 2.4;
      const rz = 0.2;
      const y = top(rx, rz);
      const layers: [number, string, number][] = [
        [0.42, P.ink, 0.012],
        [0.34, P.hullBlue, 0.022],
        [0.22, P.ink, 0.032],
        [0.17, P.hullBlue, 0.04],
        [0.06, P.lineCyan, 0.05],
      ];
      for (const [r, col, h] of layers)
        b.part(new THREE.CylinderGeometry(r, r, 0.012, 18), col, { at: [s * rx, y + h - 0.004, rz], bone: BONE });
    }

    // ---- cannon bulge & muzzle at x 2.4 ----
    const gun = (x: number, z0: number, z1: number, w: number, h: number, portR: number) => {
      b.frustumBox([s * x, wingY(x), z0], [s * x, wingY(x), z1], [w, h], [w * 0.8, h * 0.85], {
        color: P.hullBlue,
        bone: BONE,
      });
      b.part(new THREE.CylinderGeometry(portR * 1.4, portR * 1.4, 0.014, 10), P.ink, {
        at: [s * x, wingY(x), z1 + 0.002],
        dir: [0, 0, 1],
        bone: BONE,
      });
      b.part(new THREE.CylinderGeometry(portR, portR, 0.02, 10), P.deepBlue, {
        at: [s * x, wingY(x), z1 + 0.004],
        dir: [0, 0, 1],
        bone: BONE,
      });
      // cyan seam on the bulge
      b.rod([s * x, wingY(x) + h * 0.5 + 0.002, z0 + 0.1], [s * x, wingY(x) + h * 0.45, z1 - 0.1], 0.008, P.lineCyan, {
        bone: BONE,
      });
    };
    gun(2.4, 0.75, 1.48, 0.17, 0.24, 0.045);
    gun(3.6, 1.0, 1.42, 0.1, 0.17, 0.028);

    // ---- access panels ----
    panelTop(s, 1.0, 1.9, -0.95, -0.3);
    panelTop(s, 1.0, 1.9, 0.6, 1.2);
    panelTop(s, 3.0, 3.7, -0.55, -0.12);
    panelTop(s, 3.1, 3.7, 0.55, 0.95);
    // panel fasteners
    for (const [px, pz] of [
      [1.1, -0.85],
      [1.8, -0.85],
      [1.1, -0.4],
      [1.8, -0.4],
    ])
      rivets.push(new THREE.SphereGeometry(0.02, 6, 4).translate(s * px, top(px, pz) + 0.005, pz));

    // ---- rivet rows ----
    for (let x = 0.9; x <= 5.0; x += 0.3) {
      if (Math.abs(x - 2.4) < 0.5) continue;
      const zl = zc(x) + chordHalf(x) * 0.78;
      const zt = zc(x) - chordHalf(x) * 0.72;
      rivets.push(new THREE.SphereGeometry(0.018, 6, 4).translate(s * x, top(x, zl) + 0.002, zl));
      if (x < 3.7 || x > 5.4) rivets.push(new THREE.SphereGeometry(0.018, 6, 4).translate(s * x, top(x, zt) + 0.002, zt));
    }

    // ---- aileron ----
    {
      const xa = 3.8;
      const xb = 5.3;
      const ya = wingY(4.55) + 0.025;
      const outline: [number, number][] = [
        [xa, te(xa) + 0.03],
        [xb, te(xb) + 0.03],
        [xb, hinge(xb)],
        [xa, hinge(xa)],
      ];
      b.extrude(outline, {
        at: [0, ya, 0],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.07,
        bevel: 0.01,
        color: P.panelBlue,
        bone: aileron,
      });
      b.rod([s * xa, ya + 0.04, hinge(xa)], [s * xb, ya + 0.04, hinge(xb)], 0.011, P.lineCyan, { bone: aileron });
      for (const x of [4.2, 4.6, 5.0])
        b.rod([s * x, ya + 0.038, hinge(x) - 0.02], [s * x, ya + 0.038, te(x) + 0.08], 0.007, P.lineCyan, { bone: aileron });
      // aileron end trim
      b.rod([s * xa, ya + 0.038, te(xa) + 0.05], [s * xa, ya + 0.038, hinge(xa)], 0.009, P.lineCyan, { bone: aileron });
      // balance tab
      b.part(new THREE.BoxGeometry(0.3, 0.012, 0.09), P.paleCyan, {
        at: [s * 4.55, ya + 0.04, te(4.55) + 0.12],
        bone: aileron,
      });
    }

    // ---- gear bay outline on underside ----
    rodBottom(s, 0.9, 0.5, 1.5, 0.5, 0.01, P.lineCyan);
    rodBottom(s, 0.9, 1.0, 1.5, 1.0, 0.01, P.lineCyan);
    rodBottom(s, 0.9, 0.5, 0.9, 1.0, 0.01, P.lineCyan);
    rodBottom(s, 1.5, 0.5, 1.5, 1.0, 0.01, P.lineCyan);
    rodBottom(s, 2.6, -0.4, 3.4, -0.4, 0.008, P.lineCyan);
    rodBottom(s, 2.6, 0.1, 3.4, 0.1, 0.008, P.lineCyan);
    rodBottom(s, 2.6, -0.4, 2.6, 0.1, 0.008, P.lineCyan);
    rodBottom(s, 3.4, -0.4, 3.4, 0.1, 0.008, P.lineCyan);
  }

  // fuel cap on left wing
  {
    const fx = 1.55;
    const fz = -0.1;
    const y = top(fx, fz);
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.014, 14), P.lineCyan, { at: [fx, y + 0.002, fz], bone: BONE });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.014, 14), P.ink, { at: [fx, y + 0.006, fz], bone: BONE });
    b.rod([fx - 0.06, y + 0.015, fz], [fx + 0.06, y + 0.015, fz], 0.01, P.hullBlue, { bone: BONE });
  }

  // merged rivet studs
  const merged = mergeGeometries(rivets);
  if (merged) b.part(merged, P.paleCyan, { bone: BONE, at: [0, 0, 0] });

  // ---- pitot tube under left wing tip ----
  {
    const px = 4.9;
    const y0 = bottom(px, 1.0) + 0.01;
    b.rod([px, y0, 1.0], [px, 1.58, 1.0], 0.016, P.steel, { bone: BONE });
    b.rod([px, 1.58, 0.99], [px, 1.58, 1.25], 0.014, P.steel, { bone: BONE });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), P.paleCyan, { at: [px, 1.58, 1.26], bone: BONE });
  }

  // ---- radiator bath under centre ----
  {
    const y = 1.4;
    b.frustumBox([0, y, -0.1], [0, y, 0.9], [1.2, 0.2], [1.0, 0.17], { color: P.panelBlue, bone: BONE });
    b.frustumBox([0, y - 0.005, 0.9], [0, y - 0.005, 0.95], [0.9, 0.12], [0.9, 0.12], { color: P.deepBlue, bone: BONE });
    for (let i = -2; i <= 2; i++)
      b.rod([i * 0.19, y - 0.055, 0.955], [i * 0.19, y + 0.055, 0.955], 0.01, P.lineCyan, { bone: BONE });
    b.rod([-0.45, y - 0.055, 0.955], [0.45, y - 0.055, 0.955], 0.01, P.lineCyan, { bone: BONE });
    b.rod([-0.45, y + 0.055, 0.955], [0.45, y + 0.055, 0.955], 0.01, P.lineCyan, { bone: BONE });
    // side seams
    for (const s of [1, -1])
      b.rod([s * 0.6, y + 0.02, 0.0], [s * 0.5, y + 0.02, 0.88], 0.009, P.lineCyan, { bone: BONE });
    // outlet flap at rear
    b.part(new THREE.BoxGeometry(0.8, 0.02, 0.1), P.steel, { at: [0, y - 0.1, -0.1], bone: BONE });
  }
}
```