<!-- call: plan -->

```json
{
  "name": "Blueprint Spitfire",
  "description": "A Supermarine Spitfire fighter on its landing gear, rendered as a living cyanotype blueprint: deep Prussian-blue hulls covered in white-cyan drafting linework, glowing panel seams and a gridded drafting sheet under it.",
  "builderName": "blueprintSpitfire",
  "size": [11.2, 3.7, 9.8],
  "layout": "Museum-level stance, all three wheels resting on a flat drafting sheet at y=0; the plane itself sits level, nose to +Z. From the front: a five-blade propeller disc (r 1.65, hub centre y 1.85) on a tapered steel spinner reaching z 4.95, behind it the rounded cowling barrel (y 1.35..2.1). The low elliptical wing spans x -5.55..5.55 at y 0.95, chord 2.7 at the root tapering to a rounded 1.15 tip, with cannon barrels through the leading edge, a radiator bath under each wing and ailerons at the trailing edge. Above the wing root: an open cockpit trough at z 1.2..2.1 closed by a framed canopy whose top is y 2.45. The fuselage loft tapers from the bulged cockpit section to a slender tail cone at z -3.4, which the tail part continues to z -4.5, carrying the swept fin (top y 2.9, hinged rudder) and the elliptical tailplane with elevators. The style shows everywhere: every hull surface is flat blueprint blue (lighter on top, deeper below), panel seams, rivets, port rims and outlines are seated lineWhite strips, studs and decals, leading edges, canopy glass and hub rings glow cyan, tiny amber accents mark wingtip lights and prop-blade tips, and the sheet under the whole plane carries the grid, border, title block, dimension lines and section flags.",
  "palette": {
    "hullBlue": "#12336a",
    "deepBlue": "#0a1e45",
    "panelBlue": "#1d4a8a",
    "lineWhite": "#e8f5ff",
    "glowCyan": "#4fd8ff",
    "faintCyan": "#8fc4e6",
    "gridCyan": "#1b3d6e",
    "sheetBlue": "#0c2750",
    "steel": "#3c6ea8",
    "amber": "#ffb547"
  },
  "mounts": {
    "noseRing": [0, 1.85, 3.3],
    "wingRootL": [0.95, 1.0, 0.6],
    "wingRootR": [-0.95, 1.0, 0.6],
    "finRoot": [0, 1.5, -3.4],
    "gearTopL": [1.6, 0.9, 0.8],
    "gearTopR": [-1.6, 0.9, 0.8],
    "tailwheelTop": [0, 0.55, -4.05]
  },
  "joints": [
    { "name": "airframe", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "propHub", "parent": "airframe", "at": [0, 1.85, 3.3], "dir": [0, 0, 1], "role": "hinge", "group": "prop" },
    { "name": "rudder", "parent": "airframe", "at": [0, 2.15, -4.0], "dir": [0, 1, 0], "role": "hinge", "group": "tail" },
    { "name": "gearL", "parent": "airframe", "at": [1.6, 0.9, 0.8], "dir": [0.92, -0.34, 0.15], "role": "leg", "group": "gear" },
    { "name": "gearR", "parent": "airframe", "at": [-1.6, 0.9, 0.8], "dir": [-0.92, -0.34, 0.15], "role": "leg", "group": "gear" },
    { "name": "wheelL", "parent": "gearL", "at": [2.55, 0.55, 0.95], "dir": [1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "wheelR", "parent": "gearR", "at": [-2.55, 0.55, 0.95], "dir": [1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "tailWheel", "parent": "airframe", "at": [0, 0.2, -4.05], "dir": [1, 0, 0], "role": "hinge", "group": "gear" }
  ],
  "parts": [
    {
      "id": "fuselage",
      "builds": "The monocoque spine from the cowling front face back to the tail cone at z -3.4. Build one loft along z from [0,1.85,3.3] to [0,1.35,-3.4]: cowling barrel widest at the nose (half-width 0.49, from y 1.35 to 2.1), slimming over the forward fuselage, a bulged cockpit section (half-width 0.5), then tapering to a slender cone (half-width 0.18) at z -3.4. Main loft hullBlue; a panelBlue band rings the cowling at z 2.9..3.3, and a deepBlue belly strip runs under the cockpit. Add a dorsal spine ridge fairing (panelBlue) along the top from z 1.0 to z -3.4. Cockpit at z 1.2..2.1: recessed trough rim, then a closed canopy — steel frame ribs, glowCyan glass panes, and lineWhite seam strips on the frames. Drafting details: five panel seam bands of thin lineWhite strips (0.012 thick, seated 0.005 proud) ringing the loft at z 2.8, 1.9, 0.9, -0.6 and -2.2, with ~50 tiny lineWhite rivet studs along them; two gun cowl ports above the cowling at z 2.55, x +/-0.28 (deepBlue discs with lineWhite rims); six exhaust stubs (steel, three per side) along the cowl sides at z 2.95..3.55 at y 1.55, raked back; a steel antenna mast on the spine at z -1.0 with a faintCyan antenna wire stub; an oil cooler scoop (deepBlue with a glowCyan grill face) under the nose at z 2.4; and a lineWhite crosshair inspection circle decal on each side of the tail cone. Attaches: its front face at z 3.3 meets the propeller at mount noseRing; its lower flanks join the wings at mounts wingRootL and wingRootR; its rear face at z -3.4 hands over to the tail.",
      "box": [[-1.0, 0.7, -3.4], [1.0, 2.45, 3.3]],
      "attaches": "Front face at mount noseRing (propeller); lower flanks at mounts wingRootL/R (wings); rear face at z -3.4 (tail).",
      "joints": ["airframe"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wings",
      "builds": "Both elliptical wings, built as one piece per side with loft stations running out along x from 0.95 to 5.55: chord 2.7 at the root tapering smoothly (elliptical planform) to 1.15 at the rounded tip, thickness about 12% of chord, wing plane centred at y 0.95 with 0.06 of dihedral. Upper surfaces hullBlue, undersides deepBlue, split along the leading-edge crown line. A thin glowCyan strip runs along the leading edge of each wing. Trailing edge: ailerons (panelBlue slabs, x 3.1..5.3, offset 0.03 behind the wing with lineWhite seam gaps and small hinge studs) and inboard flaps (deepBlue, x 1.1..3.0) with the same seam treatment. Cannon: two per wing — steel barrels (r 0.045) protruding 0.5 from the leading edge at x +/-2.55 and +/-3.9, y 1.0, each with a panelBlue fairing bulge and a lineWhite port ring; two further machine-gun ports (lineWhite-rimmed deepBlue discs) at x +/-4.7. Radiator bath under each wing at x +/-1.75, z 0.35: a deepBlue scoop 0.55 long with a glowCyan grill face and a lineWhite edge. Drafting details on the upper wing: a concentric paper crosshair roundel (lineWhite rings, outer 0.9 diameter) at x +/-2.3, and ~10 small faintCyan inspection patches (thin rectangles with corner rivets) scattered on the upper skin. Tip details: amber disc lights at both wingtips, a steel pitot tube below the left (+x) tip and a faintCyan nav light disc under the right tip. Attaches: each root meets the fuselage flank at mounts wingRootL and wingRootR; the undersides at mounts gearTopL and gearTopR take the landing-gear struts.",
      "box": [[-5.6, 0.5, -1.3], [5.6, 1.55, 2.45]],
      "attaches": "Roots at mounts wingRootL/R (fuselage); underside strut mounts gearTopL/R (landing gear).",
      "joints": ["airframe"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "tail",
      "builds": "Everything aft of z -3.4. First the rear fuselage cone: a continuation of the spine loft from half-width 0.18 at z -3.4 down to 0.10 at [0,1.35,-4.5], hullBlue with one lineWhite seam band and a few rivet studs. The fin: an extruded flat slab with the swept Spitfire profile, root spanning z -3.6..-4.5 at the spine, top at y 2.9, leading edge leaning back; hullBlue, with a panelBlue rudder slab hinged on the rudder joint covering the rear half of the fin, edged in lineWhite seam strips, with small lineWhite hinge studs and a lineWhite crosshair circle decal at y 2.3. A panelBlue fillet fairing blends the fin root into the spine. The tailplane: two elliptical flat slabs, each spanning out to x +/-1.85, at y 1.95, z -4.0, hullBlue on top and deepBlue below, each with a panelBlue elevator slab covering the rear 30% and lineWhite seam gaps; a lineWhite crosshair circle on the upper tailplane. A small steel rudder actuator rod runs under the tail cone. Attaches: its front face at z -3.4 meets the fuselage rear face at mount finRoot; the cone underside at mount tailwheelTop takes the tail wheel.",
      "box": [[-2.0, 0.0, -4.6], [2.0, 2.9, -3.4]],
      "attaches": "Front face at z -3.4 (fuselage, mount finRoot); underside at mount tailwheelTop (landing gear tail wheel).",
      "joints": ["airframe", "rudder"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "propeller",
      "builds": "The propeller assembly on the propHub joint at mount noseRing [0,1.85,3.3]. Spinner: a lathe of steel, radius 0.34 at its base tapering to a blunt rounded tip at z 4.95, with a lineWhite ring at its base and a small lineWhite crosshair decal on the tip. Behind the spinner, a steel back-plate disc (r 0.4) at z 3.35 with a glowCyan hub ring. Five blades radiating from the hub, one pointing straight up, the others at 72 degree steps around the z axis: each a flat extruded blade from radius 0.3 to 1.65, 0.24 wide, twisted about 20 degrees along its length, deepBlue, with a thin lineWhite edge line on each face and the outer 0.25 of each tip painted amber. Blades are thin (0.02..0.05 thick, lens-shaped), so the disc reads as five crisp lines. Attaches: the hub root seats into the cowling front face at mount noseRing; the whole assembly rides the propHub joint.",
      "box": [[-1.75, 0.3, 3.3], [1.75, 3.7, 5.0]],
      "attaches": "Hub root at mount noseRing (fuselage); blades spin on joint propHub.",
      "joints": ["propHub"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "landingGear",
      "builds": "The ground stance; the only aircraft part whose wheels touch the sheet at y 0. Two raked main legs, each a steel capsule strut (r 0.055) from mount gearTopL [1.6,0.9,0.8] (and mirrored gearTopR) down and outward to the axle at [2.55,0.55,0.95] (mirrored), with a thinner steel drag brace (r 0.035) from a point at z 1.35 on the wing underside back to mid-leg, plus a small faintCyan inspection band on each strut. Wheels at the axles: r 0.55, 0.18 wide tires in deepBlue with a lineWhite tread seam ring, steel hubs r 0.20 each with a lineWhite bolt circle of 8 tiny studs and one small amber greaser dot. Tail wheel: a steel leaf-spring strut (a short flat slab) from mount tailwheelTop [0,0.55,-4.05] down to the axle [0,0.2,-4.05], with a small deepBlue tire (r 0.2) and steel hub with a lineWhite stud ring. All three wheels rest exactly on the sheet; nothing else of this part goes below y 0.05. Attaches: leg tops at mounts gearTopL/R (wings); tail-wheel strut top at mount tailwheelTop (tail).",
      "box": [[-3.0, 0.0, -4.6], [3.0, 1.0, 1.4]],
      "attaches": "Leg tops at mounts gearTopL/R (wings); tail wheel top at mount tailwheelTop (tail).",
      "joints": ["gearL", "gearR", "wheelL", "wheelR", "tailWheel"],
      "floor": true,
      "budget": 110
    },
    {
      "id": "draftingSheet",
      "builds": "The cyanotype drafting sheet the plane stands on — flat slab 12.4 x 10.8 (x +/-6.2, z +/-5.4), 0.03 thick, top surface at y 0.03, in sheetBlue, with a gridCyan grid paint of 0.5 m squares and a double border frame (a lineWhite strip inside a glowCyan strip) 0.15 in from the edge, plus lineWhite corner registration crosses. Title block at the near-right corner (x 3.6..6.0, z -5.3..-3.9): ruled lineWhite rows and svg decals in lineWhite reading SUPERMARINE SPITFIRE MK.IX, PROJ 1942, SCALE 1:24, SHEET 3 OF 12, with one small amber stamp disc. Drafting overlay around the plane: one lineWhite dimension line with arrowheads running along x at z -2.2 measuring the wingspan, one lineWhite height dimension beside the nose at x 2.2 with tick marks, three circled section flags (glowCyan rings with lineWhite letters) floating beside fuselage and wing around x +/-3.4, y 2.6, and a faint glowCyan arc on the sheet at z 4.3, r 1.65, marking the propeller disc sweep. All annotation decals sit in model space on the airframe bone; the sheet itself is a static prop.",
      "box": [[-6.2, 0.0, -5.4], [6.2, 0.05, 5.4]],
      "attaches": "Lies flat under the whole model; the three gear wheels rest on its top face at y 0.",
      "joints": [],
      "floor": true,
      "budget": 140
    }
  ]
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const bone = J.airframe ?? J.body;
  const HULL = P.hull ?? P.hullBlue;
  const DEEP = P.deep ?? P.deepBlue;
  const PANEL = P.panel ?? P.panelBlue;
  const LINE = P.line ?? P.lineWhite;
  const GLOW = P.glow ?? P.glowCyan;
  const FAINT = P.faint ?? P.faintCyan;
  const STEEL = P.steel;
  const AMBER = P.amber;

  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  const wingPath = (s: number) => {
    const root = 0.95;
    const tip = 5.55;
    const span = tip - root;
    const stations = [0, 0.17, 0.38, 0.62, 0.82, 1].map((u) => {
      const x = root + span * u;
      const chord = 2.7 * Math.sqrt(Math.max(0.08, 1 - u * u)) + 0.08;
      const y = 0.95 + 0.06 * u;
      const z = 0.54 - 0.08 * u;
      return {
        at: at(s * x, y, z),
        w: chord,
        h: chord * 0.12,
      };
    });
    return stations;
  };

  const leading = (s: number, u: number) => {
    const x = 0.95 + 4.6 * u;
    const chord = 2.7 * Math.sqrt(Math.max(0.08, 1 - u * u)) + 0.08;
    return at(s * x, 0.95 + 0.06 * u + chord * 0.06, 0.54 - 0.08 * u + chord * 0.5);
  };

  const trailing = (s: number, u: number) => {
    const x = 0.95 + 4.6 * u;
    const chord = 2.7 * Math.sqrt(Math.max(0.08, 1 - u * u)) + 0.08;
    return at(s * x, 0.95 + 0.06 * u, 0.54 - 0.08 * u - chord * 0.5);
  };

  const wingTop = (s: number, x: number, z: number) => {
    const u = Math.min(1, Math.max(0, (Math.abs(x) - 0.95) / 4.6));
    const chord = 2.7 * Math.sqrt(Math.max(0.08, 1 - u * u)) + 0.08;
    return [x, 0.95 + 0.06 * u + chord * 0.06 + 0.008, z] as [number, number, number];
  };

  const box = (
    size: [number, number, number],
    position: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: position,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    depth: number,
    position: [number, number, number],
    color: string,
    dir: [number, number, number],
    name: string,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, radial, 1, false), color, {
      bone,
      at: position,
      dir,
      name,
      flat: true,
    });

  const torus = (
    major: number,
    minor: number,
    position: [number, number, number],
    color: string,
    dir: [number, number, number],
    name: string,
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 18), color, {
      bone,
      at: position,
      dir,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { bone, color, name, section: { ngon: 6 }, caps: "round" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Main low-poly elliptical wing. The second loft is a thin, darker belly
    // shell, leaving a readable blueprint split along the crown.
    b.loft(wingPath(s), {
      bone,
      color: HULL,
      section: { ngon: 8 },
      name: `wing${side}Hull`,
    });

    const underside = wingPath(s).map((q) => ({
      at: [q.at[0], q.at[1] - 0.025, q.at[2]] as [number, number, number],
      w: q.w * 0.985,
      h: q.h * 0.48,
    }));
    b.loft(underside, {
      bone,
      color: DEEP,
      section: { ngon: 8 },
      name: `wing${side}Underside`,
    });

    // Glowing leading edge, segmented at the natural planform stations.
    const leadPoints = [0, 0.2, 0.42, 0.64, 0.82, 1].map((u) => leading(s, u));
    b.sweep(leadPoints, 0.018, {
      bone,
      color: GLOW,
      section: { ngon: 6 },
      caps: "round",
      name: `wing${side}LeadingGlow`,
    });

    // Fine white leading-edge drafting seam just below the luminous strip.
    const leadSeam = leadPoints.map((p) => [p[0], p[1] - 0.025, p[2] - 0.012] as [number, number, number]);
    b.sweep(leadSeam, 0.006, {
      bone,
      color: LINE,
      section: { ngon: 5 },
      caps: "round",
      name: `wing${side}LeadingDraftLine`,
    });

    // Aileron and inboard flap, raised as separate blocky control surfaces.
    const aileronX = s * 4.2;
    const aileronZ = -0.28;
    box([2.15, 0.045, 0.27], [aileronX, 0.895, aileronZ], PANEL, `aileron${side}`);
    box([1.88, 0.035, 0.34], [s * 2.05, 0.875, -0.40], DEEP, `flap${side}`);

    // White seam gaps and hinge knuckles.
    for (const x of [3.35, 4.15, 4.95]) {
      box([0.018, 0.052, 0.30], [s * x, 0.925, -0.285], LINE, `aileron${side}Seam${x}`);
      cylinder(0.027, 0.055, [s * x, 0.955, -0.285], FAINT, [0, 1, 0], `aileron${side}Hinge${x}`, 8);
    }
    for (const x of [1.35, 1.9, 2.45, 2.9]) {
      box([0.014, 0.045, 0.38], [s * x, 0.905, -0.395], LINE, `flap${side}Seam${x}`);
    }

    // Two prominent cannon barrels and their fairings.
    for (const x of [2.55, 3.9]) {
      const z0 = 1.42 - 0.055 * ((x - 0.95) / 4.6);
      const y0 = 1.005 + 0.04 * ((x - 0.95) / 4.6);
      box([0.18, 0.13, 0.30], [s * x, y0, z0 - 0.05], PANEL, `cannon${side}Fairing${x}`);
      rod(
        [s * x, y0, z0 - 0.06],
        [s * x, y0, z0 + 0.53],
        0.045,
        STEEL,
        `cannon${side}Barrel${x}`,
      );
      torus(0.075, 0.009, [s * x, y0, z0 + 0.16], LINE, [0, 0, 1], `cannon${side}Port${x}`);
    }

    // Two small machine-gun ports nearer the tip.
    for (const x of [4.7, 5.08]) {
      const z = 1.03 - 0.03 * ((x - 0.95) / 4.6);
      cylinder(0.07, 0.018, [s * x, 1.025, z], DEEP, [0, 1, 0], `mg${side}${x}`, 12);
      torus(0.073, 0.009, [s * x, 1.04, z], LINE, [0, 1, 0], `mg${side}Rim${x}`);
    }

    // Radiator bath beneath the inboard wing.
    const bathX = s * 1.75;
    box([0.72, 0.16, 0.58], [bathX, 0.72, 0.36], DEEP, `radiator${side}Bath`);
    box([0.56, 0.012, 0.32], [bathX, 0.632, 0.36], GLOW, `radiator${side}Grill`);
    box([0.66, 0.018, 0.035], [bathX, 0.635, 0.20], LINE, `radiator${side}GrillEdgeFront`);
    box([0.66, 0.018, 0.035], [bathX, 0.635, 0.52], LINE, `radiator${side}GrillEdgeBack`);

    // Concentric cyanotype roundel and crosshair on upper skin.
    const roundel = wingTop(s, 2.3, 0.43);
    torus(0.45, 0.018, roundel, LINE, [0, 1, 0], `roundel${side}Outer`);
    torus(0.27, 0.014, [roundel[0], roundel[1] + 0.006, roundel[2]], LINE, [0, 1, 0], `roundel${side}Inner`);
    box([0.72, 0.012, 0.018], [roundel[0], roundel[1] + 0.014, roundel[2]], LINE, `roundel${side}CrossX`);
    box([0.018, 0.012, 0.72], [roundel[0], roundel[1] + 0.015, roundel[2]], LINE, `roundel${side}CrossZ`);

    // Small inspection plates: alternating rectangular dashes with corner rivets.
    const inspections = [
      [1.25, 0.95],
      [1.65, 0.20],
      [2.95, 1.05],
      [3.45, 0.20],
      [4.45, 0.74],
    ];
    for (let i = 0; i < inspections.length; i++) {
      const [x, z] = inspections[i];
      const p = wingTop(s, x, z);
      box([0.22, 0.012, 0.12], [p[0], p[1] + 0.008, p[2]], FAINT, `inspection${side}${i}`);
      for (const dx of [-0.09, 0.09]) {
        for (const dz of [-0.045, 0.045]) {
          cylinder(0.012, 0.018, [p[0] + s * dx, p[1] + 0.018, p[2] + dz], LINE, [0, 1, 0], `inspection${side}${i}Rivet`, 6);
        }
      }
    }

    // Tip lights and small navigation details.
    const tipX = s * 5.53;
    const tipY = 0.985;
    const tipZ = 0.47;
    cylinder(0.095, 0.025, [tipX, tipY + 0.01, tipZ], AMBER, [0, 1, 0], `tipLight${side}`, 10);
    torus(0.098, 0.009, [tipX, tipY + 0.027, tipZ], LINE, [0, 1, 0], `tipLightRing${side}`);

    if (s > 0) {
      rod([tipX, 0.79, tipZ - 0.08], [tipX + 0.48, 0.73, tipZ - 0.16], 0.018, STEEL, "pitotTubeL");
      cylinder(0.034, 0.014, [tipX - 0.01, 0.805, tipZ - 0.08], FAINT, [0, 1, 0], "pitotMountL", 8);
    } else {
      cylinder(0.065, 0.018, [tipX, 0.88, tipZ - 0.02], FAINT, [0, 1, 0], "navLightR", 10);
      torus(0.067, 0.008, [tipX, 0.892, tipZ - 0.02], LINE, [0, 1, 0], "navLightRingR");
    }
  }
}
```

<!-- call: landingGear -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildLandingGear({ b, J, P, M }: Ctx) {
  const steel = P.steel;
  const deepBlue = P.deepBlue;
  const lineWhite = P.lineWhite;
  const faintCyan = P.faintCyan;
  const amber = P.amber;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const midpoint = (a: THREE.Vector3, c: THREE.Vector3, t = 0.5) =>
    a.clone().lerp(c, t);

  const wheelL = V([2.55, 0.55, 0.95]);
  const wheelR = V([-2.55, 0.55, 0.95]);
  const tailAxle = V([0, 0.2, -4.05]);

  const makeStrut = (
    side: number,
    top: THREE.Vector3,
    axle: THREE.Vector3,
    bone: any,
  ) => {
    const axis = axle.clone().sub(top).normalize();
    b.capsule(top, axle, 0.055, {
      color: steel,
      bone,
      caps: "round",
      name: side > 0 ? "mainStrutL" : "mainStrutR",
      group: "landingGear",
    });

    // A bright blueprint inspection collar wrapped around the angled leg.
    const bandCenter = top.clone().lerp(axle, 0.43);
    b.part(
      new THREE.TorusGeometry(0.061, 0.006, 6, 12),
      faintCyan,
      {
        at: bandCenter,
        dir: axis,
        bone,
        name: side > 0 ? "strutInspectionBandL" : "strutInspectionBandR",
        group: "landingGear",
      },
    );

    // Drag brace from the wing underside back into the middle of the leg.
    const braceTop = new THREE.Vector3(side * 1.48, 0.78, 1.35);
    const braceEnd = midpoint(top, axle, 0.58);
    b.capsule(braceTop, braceEnd, 0.035, {
      color: steel,
      bone,
      caps: "round",
      name: side > 0 ? "dragBraceL" : "dragBraceR",
      group: "landingGear",
    });

    b.part(
      new THREE.TorusGeometry(0.039, 0.004, 6, 10),
      faintCyan,
      {
        at: midpoint(braceTop, braceEnd, 0.5),
        dir: braceEnd.clone().sub(braceTop).normalize(),
        bone,
        name: side > 0 ? "braceBandL" : "braceBandR",
        group: "landingGear",
      },
    );
  };

  makeStrut(1, V(M.gearTopL), wheelL, J.gearL);
  makeStrut(-1, V(M.gearTopR), wheelR, J.gearR);

  const makeMainWheel = (
    side: number,
    axle: THREE.Vector3,
    bone: any,
  ) => {
    const outward = side > 0 ? 1 : -1;
    const label = side > 0 ? "L" : "R";

    // The tire is deliberately centred at radius height: it meets the sheet at y=0.
    b.part(
      new THREE.CylinderGeometry(0.55, 0.55, 0.18, 16, 1, false),
      deepBlue,
      {
        at: axle,
        dir: [1, 0, 0],
        bone,
        flat: true,
        name: `mainTire${label}`,
        group: "landingGear",
      },
    );

    // A recessed-looking cyanotype tread seam on each tire side.
    b.part(
      new THREE.TorusGeometry(0.538, 0.012, 6, 20),
      lineWhite,
      {
        at: axle,
        dir: [1, 0, 0],
        bone,
        name: `treadSeam${label}`,
        group: "landingGear",
      },
    );

    // Steel hub, slightly proud of the tire.
    const hubFace = axle.clone();
    hubFace.x += outward * 0.105;
    b.part(
      new THREE.CylinderGeometry(0.2, 0.2, 0.22, 12),
      steel,
      {
        at: axle,
        dir: [1, 0, 0],
        bone,
        flat: true,
        name: `wheelHub${label}`,
        group: "landingGear",
      },
    );

    b.part(
      new THREE.TorusGeometry(0.2, 0.009, 6, 18),
      lineWhite,
      {
        at: hubFace,
        dir: [1, 0, 0],
        bone,
        name: `hubRing${label}`,
        group: "landingGear",
      },
    );

    // Eight drafting-style bolt heads around the outer hub face.
    const boltRing = b.ring(
      frame(hubFace, [1, 0, 0]),
      {
        count: 8,
        radius: 0.145,
        fromDeg: 0,
        toDeg: 360,
        name: `hubBolts${label}`,
        group: "landingGear",
      },
    );

    for (const bolt of boltRing.items) {
      b.part(
        new THREE.SphereGeometry(0.017, 6, 4),
        lineWhite,
        {
          at: bolt.at,
          bone,
          name: `hubBolt${label}`,
          group: "landingGear",
        },
      );
    }

    // A tiny amber grease marker, offset toward the upper-forward quadrant.
    b.part(
      new THREE.SphereGeometry(0.026, 8, 5),
      amber,
      {
        at: new THREE.Vector3(
          hubFace.x + outward * 0.018,
          hubFace.y + 0.105,
          hubFace.z + 0.065,
        ),
        bone,
        name: `greaser${label}`,
        group: "landingGear",
      },
    );

    // Small axle cap visible on the outer side.
    b.part(
      new THREE.CylinderGeometry(0.055, 0.055, 0.025, 10),
      lineWhite,
      {
        at: new THREE.Vector3(
          axle.x + outward * 0.125,
          axle.y,
          axle.z,
        ),
        dir: [1, 0, 0],
        bone,
        name: `axleCap${label}`,
        group: "landingGear",
      },
    );
  };

  makeMainWheel(1, wheelL, J.wheelL);
  makeMainWheel(-1, wheelR, J.wheelR);

  // Tailwheel leaf spring: a broad, flat, blueprint-readable fork.
  const tailTop = V(M.tailwheelTop);
  b.slab(
    [
      [-0.075, 0.52, -4.075],
      [0.075, 0.52, -4.075],
      [0.06, 0.19, -4.075],
      [-0.06, 0.19, -4.075],
    ],
    {
      color: steel,
      thickness: 0.035,
      bone: J.tailWheel,
      name: "tailLeafSpring",
      group: "landingGear",
    },
  );

  b.capsule(tailTop, tailAxle, 0.035, {
    color: steel,
    bone: J.tailWheel,
    caps: "round",
    name: "tailWheelStrut",
    group: "landingGear",
  });

  b.part(
    new THREE.TorusGeometry(0.04, 0.005, 6, 10),
    faintCyan,
    {
      at: midpoint(tailTop, tailAxle, 0.5),
      dir: [0, -1, 0],
      bone: J.tailWheel,
      name: "tailStrutBand",
      group: "landingGear",
    },
  );

  // Tail tire: radius .20 with its bottom exactly on the drafting sheet.
  b.part(
    new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12),
    deepBlue,
    {
      at: tailAxle,
      dir: [1, 0, 0],
      bone: J.tailWheel,
      flat: true,
      name: "tailTire",
      group: "landingGear",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.188, 0.009, 6, 16),
    lineWhite,
    {
      at: tailAxle,
      dir: [1, 0, 0],
      bone: J.tailWheel,
      name: "tailTreadSeam",
      group: "landingGear",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.085, 0.085, 0.14, 10),
    steel,
    {
      at: tailAxle,
      dir: [1, 0, 0],
      bone: J.tailWheel,
      flat: true,
      name: "tailHub",
      group: "landingGear",
    },
  );

  const tailHubFace = tailAxle.clone().add(new THREE.Vector3(0.075, 0, 0));
  b.part(
    new THREE.TorusGeometry(0.082, 0.007, 6, 14),
    lineWhite,
    {
      at: tailHubFace,
      dir: [1, 0, 0],
      bone: J.tailWheel,
      name: "tailHubRing",
      group: "landingGear",
    },
  );

  const tailBolts = b.ring(
    frame(tailHubFace, [1, 0, 0]),
    {
      count: 8,
      radius: 0.062,
      fromDeg: 0,
      toDeg: 360,
      name: "tailHubBolts",
      group: "landingGear",
    },
  );

  for (const bolt of tailBolts.items) {
    b.part(
      new THREE.SphereGeometry(0.011, 6, 4),
      lineWhite,
      {
        at: bolt.at,
        bone: J.tailWheel,
        name: "tailHubBolt",
        group: "landingGear",
      },
    );
  }
}
```

<!-- call: propeller -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPropeller({ b, J, P, M }: Ctx) {
  const hub = J.propHub ?? J.body;
  const center = new THREE.Vector3(...(M.noseRing ?? [0, 1.85, 3.3]));
  const steel = P.steel;
  const deep = P.deepBlue;
  const white = P.lineWhite;
  const cyan = P.glowCyan;
  const amber = P.amber;
  const faint = P.faintCyan;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      bone: hub,
      at,
      ...options,
    });

  const cylinderZ = (
    radius: number,
    depth: number,
    color: string,
    z: number,
    radial = 16,
    name = "propeller.cylinder",
  ) => {
    const geo = new THREE.CylinderGeometry(radius, radius, depth, radial, 1, false);
    return part(geo, color, [center.x, center.y, z], {
      rotation: [90, 0, 0],
      name,
    });
  };

  const torusZ = (
    major: number,
    minor: number,
    color: string,
    z: number,
    name = "propeller.ring",
  ) => {
    const geo = new THREE.TorusGeometry(major, minor, 6, 24);
    return part(geo, color, [center.x, center.y, z], {
      rotation: [90, 0, 0],
      name,
    });
  };

  const rod = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone: hub,
      caps: "round",
      name,
      group: "propeller",
    });

  // The long, faceted spinner. Its local lathe height follows +Z.
  const spinner = b.lathe(
    [
      [0, 0],
      [0.30, 0],
      [0.34, 0.06],
      [0.31, 0.25],
      [0.255, 0.58],
      [0.19, 0.98],
      [0.125, 1.30],
      [0.075, 1.52],
      [0.035, 1.62],
      [0, 1.65],
    ],
    {
      at: center,
      axis: [0, 0, 1],
      segments: 12,
      smoothing: 0,
      color: steel,
      bone: hub,
      name: "propeller.spinner",
      group: "propeller",
    },
  );

  // Cyanotype drafting highlights on the spinner.
  glow(torusZ(0.305, 0.018, cyan, 3.315, "propeller.spinnerGlowRing"), 1.8);
  torusZ(0.337, 0.009, white, 3.365, "propeller.spinnerBaseSeam");
  torusZ(0.245, 0.008, faint, 3.59, "propeller.spinnerPanelRing");
  torusZ(0.135, 0.007, white, 4.14, "propeller.spinnerPanelRing2");

  // Tiny blueprint crosshair on the blunt spinner tip.
  const tip = new THREE.Vector3(center.x, center.y, 4.958);
  rod(
    new THREE.Vector3(center.x - 0.045, center.y, tip.z),
    new THREE.Vector3(center.x + 0.045, center.y, tip.z),
    0.006,
    white,
    "propeller.tipCrosshairX",
  );
  rod(
    new THREE.Vector3(center.x, center.y - 0.045, tip.z),
    new THREE.Vector3(center.x, center.y + 0.045, tip.z),
    0.006,
    white,
    "propeller.tipCrosshairY",
  );
  torusZ(0.052, 0.005, cyan, 4.952, "propeller.tipCircle");

  // Steel back plate behind the spinner and its luminous hub ring.
  cylinderZ(0.405, 0.075, steel, 3.345, 20, "propeller.backPlate");
  const hubRing = torusZ(0.255, 0.026, cyan, 3.392, "propeller.hubGlow");
  glow(hubRing, 2.2);
  torusZ(0.385, 0.014, white, 3.392, "propeller.backPlateRim");

  // Five blueprint hub studs, one between every pair of blade roots.
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + Math.PI / 5;
    const p: [number, number, number] = [
      center.x + Math.sin(a) * 0.285,
      center.y + Math.cos(a) * 0.285,
      3.405,
    ];
    const stud = part(
      new THREE.SphereGeometry(0.026, 8, 5),
      white,
      p,
      { name: `propeller.hubStud${i}` },
    );
    glow(stud, 1.1);
  }

  // A blade is drawn in its own radial plane. The centreline sweeps sideways
  // toward the trailing side, giving the flat silhouette a restrained twist.
  const bladeOutline = (tipStart: number, tipEnd: number): [number, number, "sharp"][] => {
    const sweep = (r: number) => 0.105 * Math.pow((r - 0.28) / 1.37, 1.15);
    const half = (r: number) => {
      if (r < 0.38) return 0.055;
      if (r < 1.25) return 0.12;
      return 0.11 - 0.035 * ((r - 1.25) / 0.4);
    };
    const points: [number, number, "sharp"][] = [];
    const left = [
      [0.28, 0.035],
      [0.38, 0.055],
      [0.75, 0.12],
      [1.18, 0.125],
      [tipStart, 0.105],
      [tipEnd, 0.025],
    ];
    const right = [
      [tipEnd, -0.025],
      [tipStart, -0.105],
      [1.18, -0.125],
      [0.75, -0.12],
      [0.38, -0.055],
      [0.28, -0.035],
    ];
    for (const [r, w] of left) points.push([sweep(r) + w, r, "sharp"]);
    for (const [r, w] of right) points.push([sweep(r) + w, r, "sharp"]);
    return points;
  };

  const amberOutline = (): [number, number, "sharp"][] => {
    const sweep = (r: number) => 0.105 * Math.pow((r - 0.28) / 1.37, 1.15);
    return [
      [sweep(1.39) + 0.105, 1.39, "sharp"],
      [sweep(1.62) + 0.035, 1.62, "sharp"],
      [sweep(1.65) + 0.025, 1.65, "sharp"],
      [sweep(1.65) - 0.025, 1.65, "sharp"],
      [sweep(1.62) - 0.035, 1.62, "sharp"],
      [sweep(1.39) - 0.105, 1.39, "sharp"],
    ];
  };

  for (let i = 0; i < 5; i++) {
    // i = 0 is the upright blade; positive angle turns toward +X.
    const angle = (i * Math.PI * 2) / 5;
    const radial: [number, number, number] = [Math.sin(angle), Math.cos(angle), 0];
    const across: [number, number, number] = [Math.cos(angle), -Math.sin(angle), 0];

    const blade = b.extrude(bladeOutline(1.38, 1.65), {
      at: [center.x, center.y, 3.405],
      x: across,
      y: radial,
      thickness: [0.018, 0.045],
      bevel: 0.006,
      smoothing: 1,
      color: deep,
      bone: hub,
      name: `propeller.blade${i}`,
      group: "propeller",
    });

    // Amber cap, inset into the blade silhouette and lifted just enough to
    // remain a separate cyanotype colour on the forward face.
    b.extrude(amberOutline(), {
      at: [center.x, center.y, 3.431],
      x: across,
      y: radial,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 0,
      color: amber,
      bone: hub,
      name: `propeller.blade${i}.amberTip`,
      group: "propeller",
    });

    // White drafting contours: root collar, both long edges, and a centre seam.
    const point = (r: number, w: number, z = 3.458) => {
      const sweep = 0.105 * Math.pow((r - 0.28) / 1.37, 1.15);
      return new THREE.Vector3(
        center.x + radial[0] * r + across[0] * (sweep + w),
        center.y + radial[1] * r + across[1] * (sweep + w),
        z,
      );
    };

    rod(point(0.31, 0.052), point(0.39, 0.052), 0.007, white, `propeller.blade${i}.rootEdgeA`);
    rod(point(0.31, -0.052), point(0.39, -0.052), 0.007, white, `propeller.blade${i}.rootEdgeB`);
    rod(point(0.39, 0.12), point(1.39, 0.105), 0.006, white, `propeller.blade${i}.leadingDraft`);
    rod(point(0.39, -0.12), point(1.39, -0.105), 0.006, white, `propeller.blade${i}.trailingDraft`);
    rod(point(0.42, 0), point(1.38, 0.04), 0.004, faint, `propeller.blade${i}.centreSeam`);

    // Small cyan rivets at each root collar.
    for (let j = 0; j < 3; j++) {
      const r = 0.335;
      const w = -0.065 + j * 0.065;
      const s = point(r, w, 3.465);
      const rivet = part(
        new THREE.SphereGeometry(0.012, 6, 4),
        cyan,
        s,
        { name: `propeller.blade${i}.rivet${j}` },
      );
      glow(rivet, 1.5);
    }
  }

  // A final narrow cyan ring marks the spinner-to-propeller interface.
  const interfaceRing = torusZ(0.385, 0.010, cyan, 3.425, "propeller.interfaceGlow");
  glow(interfaceRing, 1.6);
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  glow,
  rng,
} from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const body = J.body;
  const rudder = J.rudder;

  const hull = P.hull;
  const deep = P.deep;
  const panel = P.panel;
  const line = P.line;
  const cyan = P.glow;
  const faint = P.faint;
  const steel = P.steel;

  const tailBone = body;
  const out: THREE.Object3D[] = [];

  const torus = (
    major: number,
    tube: number,
    at: [number, number, number],
    color: string,
    bone: any = tailBone,
    rotation: [number, number, number] = [0, 0, 0],
    name?: string,
  ) => {
    const p = b.part(
      new THREE.TorusGeometry(major, tube, 6, 24),
      color,
      {
        at,
        bone,
        rotation,
        name,
        flat: true,
      },
    );
    out.push(p.mesh);
    return p;
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any = tailBone,
    name?: string,
  ) => {
    const p = b.rod(a, c, radius, {
      color,
      bone,
      caps: "round",
      name,
    });
    out.push(...p.meshes);
    return p;
  };

  const capsule = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any = tailBone,
    name?: string,
  ) => {
    const p = b.capsule(a, c, radius, {
      color,
      bone,
      name,
    });
    out.push(...p.meshes);
    return p;
  };

  const stud = (
    at: [number, number, number],
    radius: number,
    color: string,
    bone: any = tailBone,
    name?: string,
  ) => {
    const p = b.part(
      new THREE.SphereGeometry(radius, 6, 4),
      color,
      { at, bone, flat: true, name },
    );
    out.push(p.mesh);
    return p;
  };

  const crosshair = (
    at: [number, number, number],
    radius: number,
    normal: "side" | "top",
    bone: any = tailBone,
    name?: string,
  ) => {
    const rot: [number, number, number] =
      normal === "side"
        ? [0, 0, Math.PI / 2]
        : [0, 0, 0];

    const ring = torus(radius, 0.012, at, line, bone, rot, `${name ?? "crosshair"}.ring`);
    const half = radius * 0.72;

    if (normal === "side") {
      rod(
        [at[0] - 0.008, at[1], at[2] - half],
        [at[0] - 0.008, at[1], at[2] + half],
        0.007,
        line,
        bone,
        `${name ?? "crosshair"}.vertical`,
      );
      rod(
        [at[0] - 0.008, at[1] - half, at[2]],
        [at[0] - 0.008, at[1] + half, at[2]],
        0.007,
        line,
        bone,
        `${name ?? "crosshair"}.horizontal`,
      );
    } else {
      rod(
        [at[0] - half, at[1] + 0.006, at[2]],
        [at[0] + half, at[1] + 0.006, at[2]],
        0.007,
        line,
        bone,
        `${name ?? "crosshair"}.across`,
      );
      rod(
        [at[0], at[1] + 0.006, at[2] - half],
        [at[0], at[1] + 0.006, at[2] + half],
        0.007,
        line,
        bone,
        `${name ?? "crosshair"}.along`,
      );
    }

    glow(ring, 1.2);
    return ring;
  };

  // ---------------------------------------------------------------------------
  // Rear fuselage cone, continuing the airframe exactly from the rear loft face.

  const rearPath = catmull(
    [
      [0, 1.50, -3.40],
      [0, 1.47, -3.72],
      [0, 1.41, -4.12],
      [0, 1.35, -4.50],
    ],
    { tension: 0.35 },
  );

  const rear = b.sweep(rearPath, [0.18, 0.10], {
    bone: tailBone,
    color: hull,
    section: { ngon: 8 },
    caps: { start: "flat", end: "round" },
    name: "tail.rearCone",
  });
  out.push(...rear.meshes);

  // Pale blueprint lower contour, deliberately a narrow strip rather than a paint.
  rod(
    [0, 1.35, -3.50],
    [0, 1.27, -4.42],
    0.017,
    deep,
    tailBone,
    "tail.lowerContour",
  );

  // A broad drafting seam around the cone.
  torus(
    0.145,
    0.012,
    [0, 1.42, -4.08],
    line,
    tailBone,
    [Math.PI / 2, 0, 0],
    "tail.rearSeam",
  );

  // Rivets around that seam, arranged in the cone's x/y section.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    stud(
      [
        0.151 * Math.cos(a),
        1.42 + 0.151 * Math.sin(a),
        -4.08,
      ],
      0.014,
      line,
      tailBone,
      `tail.rearRivet${i}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Fin. The drawing plane is z/y; extrusion is across x.

  const finOutline: [number, number, "sharp"?][] = [
    [-0.10, 0.00, "sharp"],
    [0.92, 0.00, "sharp"],
    [0.78, 0.42, "sharp"],
    [0.57, 1.08, "sharp"],
    [0.28, 1.42, "sharp"],
    [-0.02, 1.40, "sharp"],
    [-0.40, 1.05, "sharp"],
    [-0.68, 0.58, "sharp"],
  ];

  const fin = b.extrude(finOutline, {
    at: [0, 1.36, -4.50],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.12,
    bevel: 0.012,
    color: hull,
    bone: tailBone,
    name: "tail.fin",
  });
  out.push(fin.mesh);

  // Blue root fairing, chunky enough to read as a separate aerodynamic fillet.
  const fairing = b.sweep(
    catmull([
      [0, 1.44, -3.48],
      [0, 1.55, -3.70],
      [0, 1.65, -3.92],
      [0, 1.72, -4.10],
    ]),
    [0.22, 0.075],
    {
      bone: tailBone,
      color: panel,
      section: { ngon: 6 },
      caps: "round",
      name: "tail.finFairing",
    },
  );
  out.push(...fairing.meshes);

  // Blueprint outlines along the fin's leading and trailing edges.
  rod(
    [0, 1.37, -4.50],
    [0, 2.78, -4.00],
    0.014,
    line,
    tailBone,
    "tail.fin.leadingDraft",
  );
  rod(
    [0, 2.78, -4.00],
    [0, 2.37, -4.50],
    0.014,
    line,
    tailBone,
    "tail.fin.trailingDraft",
  );
  rod(
    [0, 1.39, -4.50],
    [0, 1.40, -3.60],
    0.012,
    faint,
    tailBone,
    "tail.fin.rootDraft",
  );

  // ---------------------------------------------------------------------------
  // Hinged rudder, offset slightly to the model's left face so the seam reads.

  const rudderOutline: [number, number, "sharp"?][] = [
    [-0.04, 0.00, "sharp"],
    [0.78, 0.00, "sharp"],
    [0.64, 0.36, "sharp"],
    [0.40, 0.82, "sharp"],
    [0.12, 1.04, "sharp"],
    [-0.04, 0.98, "sharp"],
  ];

  const rudderSlab = b.extrude(rudderOutline, {
    at: [0.072, 2.08, -4.48],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.065,
    bevel: 0.009,
    color: panel,
    bone: rudder,
    name: "tail.rudder",
  });
  out.push(rudderSlab.mesh);

  // Rudder perimeter and centre seam.
  rod(
    [0.108, 2.10, -4.48],
    [0.108, 3.03, -4.07],
    0.012,
    line,
    rudder,
    "tail.rudder.leadingEdge",
  );
  rod(
    [0.108, 3.03, -4.07],
    [0.108, 2.47, -4.48],
    0.012,
    line,
    rudder,
    "tail.rudder.trailingEdge",
  );
  rod(
    [0.108, 2.10, -4.48],
    [0.108, 2.98, -4.20],
    0.010,
    faint,
    rudder,
    "tail.rudder.innerSeam",
  );

  // Rudder hinges are intentionally large drafting studs.
  for (let i = 0; i < 4; i++) {
    const y = 2.18 + i * 0.22;
    stud([0.112, y, -4.49], 0.026, line, rudder, `tail.rudder.hinge${i}`);
    stud([-0.112, y, -4.49], 0.026, line, tailBone, `tail.rudder.hingeBack${i}`);
  }

  // Crosshair on the rudder side.
  crosshair([0.112, 2.48, -4.23], 0.16, "side", rudder, "tail.rudderInspection");

  // Actuator horn and rod beneath the tail cone.
  capsule(
    [0.12, 1.46, -3.82],
    [0.11, 2.13, -4.17],
    0.022,
    steel,
    rudder,
    "tail.rudderHorn",
  );
  rod(
    [0.12, 1.43, -3.78],
    [0.12, 1.13, -4.35],
    0.018,
    steel,
    tailBone,
    "tail.rudderActuator",
  );
  stud([0.12, 1.13, -4.35], 0.032, line, tailBone, "tail.actuatorPin");

  // ---------------------------------------------------------------------------
  // Horizontal tailplanes: two low-poly elliptical slabs with separate elevators.

  const tailplaneOutline: [number, number, "sharp"?][] = [
    [0.00, 0.00, "sharp"],
    [1.84, 0.00, "sharp"],
    [1.77, 0.18, "sharp"],
    [1.50, 0.47, "sharp"],
    [0.92, 0.72, "sharp"],
    [0.00, 0.88, "sharp"],
  ];

  const elevatorOutline: [number, number, "sharp"?][] = [
    [0.00, 0.00, "sharp"],
    [1.75, 0.00, "sharp"],
    [1.77, 0.18, "sharp"],
    [1.45, 0.30, "sharp"],
    [0.78, 0.38, "sharp"],
    [0.00, 0.40, "sharp"],
  ];

  for (const side of [1, -1]) {
    const xDir: [number, number, number] = [side, 0, 0];
    const rootX = 0;

    const plane = b.extrude(tailplaneOutline, {
      at: [rootX, 1.94, -4.58],
      x: xDir,
      y: [0, 0, 1],
      thickness: 0.075,
      bevel: 0.012,
      color: hull,
      bone: tailBone,
      name: `tail.tailplane${side > 0 ? "L" : "R"}`,
    });
    out.push(plane.mesh);

    // A darker underside peeks just below the upper slab.
    const underside = b.extrude(tailplaneOutline, {
      at: [rootX, 1.895, -4.58],
      x: xDir,
      y: [0, 0, 1],
      thickness: 0.018,
      color: deep,
      bone: tailBone,
      name: `tail.tailplane${side > 0 ? "L" : "R"}.underside`,
    });
    out.push(underside.mesh);

    const elevator = b.extrude(elevatorOutline, {
      at: [rootX, 1.985, -4.58],
      x: xDir,
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.008,
      color: panel,
      bone: tailBone,
      name: `tail.elevator${side > 0 ? "L" : "R"}`,
    });
    out.push(elevator.mesh);

    // Elevator hinge gap and a pair of hinge studs.
    rod(
      [side * 0.18, 2.032, -4.20],
      [side * 1.55, 2.032, -4.20],
      0.010,
      line,
      tailBone,
      `tail.elevator${side > 0 ? "L" : "R"}.gap`,
    );
    for (const u of [0.52, 1.20]) {
      stud(
        [side * u, 2.042, -4.20],
        0.022,
        line,
        tailBone,
        `tail.elevator${side > 0 ? "L" : "R"}.hinge${u}`,
      );
    }

    // Long drafting seam from tailplane root toward its tip.
    rod(
      [side * 0.20, 2.035, -4.00],
      [side * 1.60, 2.035, -4.00],
      0.008,
      faint,
      tailBone,
      `tail.tailplane${side > 0 ? "L" : "R"}.seam`,
    );

    // Small rivet pair at the tailplane root.
    for (const z of [-4.38, -4.12]) {
      stud(
        [side * 0.30, 2.025, z],
        0.014,
        line,
        tailBone,
        `tail.tailplane${side > 0 ? "L" : "R"}.rootRivet${z}`,
      );
    }
  }

  // One large inspection crosshair on the upper face of each tailplane.
  crosshair([1.00, 2.045, -4.10], 0.24, "top", tailBone, "tail.roundelL");
  crosshair([-1.00, 2.045, -4.10], 0.24, "top", tailBone, "tail.roundelR");

  // Fine cyan leading-edge highlights on both tailplanes.
  const edgeL = rod(
    [0.10, 2.055, -3.70],
    [1.55, 2.055, -3.98],
    0.013,
    cyan,
    tailBone,
    "tail.leadingEdgeL",
  );
  const edgeR = rod(
    [-0.10, 2.055, -3.70],
    [-1.55, 2.055, -3.98],
    0.013,
    cyan,
    tailBone,
    "tail.leadingEdgeR",
  );
  glow(edgeL, 1.4);
  glow(edgeR, 1.4);

  // Small blueprint chevrons on the fin, echoing the aircraft's internal ribs.
  for (const y of [1.78, 2.08, 2.38]) {
    rod(
      [0.065, y, -4.46 + (y - 1.7) * 0.12],
      [0.065, y + 0.08, -4.28 + (y - 1.7) * 0.10],
      0.007,
      faint,
      tailBone,
      `tail.finRib${y}`,
    );
    rod(
      [-0.065, y, -4.46 + (y - 1.7) * 0.12],
      [-0.065, y + 0.08, -4.28 + (y - 1.7) * 0.10],
      0.007,
      faint,
      tailBone,
      `tail.finRibBack${y}`,
    );
  }

  return out;
}
```

<!-- call: draftingSheet -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildDraftingSheet({ b, J, P, M }: Ctx) {
  const sheetBlue = P.sheetBlue;
  const gridCyan = P.gridCyan;
  const lineWhite = P.lineWhite;
  const glowCyan = P.glowCyan;
  const faintCyan = P.faintCyan;
  const amber = P.amber;

  type BoxSpec = {
    size: [number, number, number];
    at: [number, number, number];
    rotY?: number;
  };

  const merged = (items: BoxSpec[]) => {
    const geos = items.map((item) => {
      const g = new THREE.BoxGeometry(...item.size);
      g.translate(...item.at);
      if (item.rotY) g.rotateY(item.rotY);
      return g;
    });
    return geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
  };

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number] = [0, 0, 0],
    bone?: any,
  ) => b.part(geometry, color, { at, bone });

  // ------------------------------------------------------------------------------------------------
  // The heavy cyanotype board. Its upper face is exactly y = 0.03 and its bottom rests at y = 0.

  part(new THREE.BoxGeometry(12.4, 0.03, 10.8), sheetBlue, [0, 0.015, 0]);

  // ------------------------------------------------------------------------------------------------
  // Half-meter drafting grid. Long uninterrupted strips keep the sheet graphic and low-poly.

  const grid: BoxSpec[] = [];
  for (let x = -6; x <= 6.0001; x += 0.5)
    grid.push({ size: [0.008, 0.006, 10.55], at: [x, 0.034, 0] });
  for (let z = -5.25; z <= 5.2501; z += 0.5)
    grid.push({ size: [12.05, 0.006, 0.008], at: [0, 0.034, z] });
  part(merged(grid), gridCyan);

  // A few heavier half-meter axes make the grid read at a distance.
  const axes: BoxSpec[] = [];
  for (const x of [-5, 0, 5])
    axes.push({ size: [0.018, 0.008, 10.55], at: [x, 0.039, 0] });
  for (const z of [-5, 0, 5])
    axes.push({ size: [12.05, 0.008, 0.018], at: [0, 0.039, z] });
  part(merged(axes), faintCyan);

  // ------------------------------------------------------------------------------------------------
  // Double registration border: a cyan outer rail and inset white drafting rail.

  const outerBorder: BoxSpec[] = [
    { size: [12.15, 0.012, 0.045], at: [0, 0.043, 5.25] },
    { size: [12.15, 0.012, 0.045], at: [0, 0.043, -5.25] },
    { size: [0.045, 0.012, 10.5], at: [6.05, 0.043, 0] },
    { size: [0.045, 0.012, 10.5], at: [-6.05, 0.043, 0] },
  ];
  const innerBorder: BoxSpec[] = [
    { size: [11.8, 0.014, 0.025], at: [0, 0.051, 5.05] },
    { size: [11.8, 0.014, 0.025], at: [0, 0.051, -5.05] },
    { size: [0.025, 0.014, 10.1], at: [5.9, 0.051, 0] },
    { size: [0.025, 0.014, 10.1], at: [-5.9, 0.051, 0] },
  ];
  glow(part(merged(outerBorder), glowCyan), 1.4);
  part(merged(innerBorder), lineWhite);

  // Registration crosses at all four corners.
  const crosses: BoxSpec[] = [];
  for (const x of [-5.78, 5.78]) {
    for (const z of [-4.98, 4.98]) {
      crosses.push(
        { size: [0.28, 0.016, 0.018], at: [x, 0.061, z] },
        { size: [0.018, 0.016, 0.28], at: [x, 0.061, z] },
      );
    }
  }
  part(merged(crosses), lineWhite);

  // ------------------------------------------------------------------------------------------------
  // Title block in the near-right corner.

  const titleFrame: BoxSpec[] = [
    { size: [2.35, 0.014, 0.025], at: [4.78, 0.061, -3.92] },
    { size: [2.35, 0.014, 0.025], at: [4.78, 0.061, -5.25] },
    { size: [0.025, 0.014, 1.35], at: [3.62, 0.061, -4.585] },
    { size: [0.025, 0.014, 1.35], at: [5.94, 0.061, -4.585] },
    { size: [2.3, 0.009, 0.014], at: [4.78, 0.058, -4.22] },
    { size: [2.3, 0.009, 0.014], at: [4.78, 0.058, -4.48] },
    { size: [2.3, 0.009, 0.014], at: [4.78, 0.058, -4.74] },
    { size: [2.3, 0.009, 0.014], at: [4.78, 0.058, -5.0] },
  ];
  part(merged(titleFrame), lineWhite);

  const glyphs: Record<string, string[]> = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  const text: BoxSpec[] = [];
  const pixel = 0.018;
  const gap = 0.012;
  const charAdvance = 6 * pixel;

  const write = (value: string, x0: number, z0: number) => {
    let cursor = x0;
    for (const ch of value) {
      const rows = glyphs[ch] ?? glyphs[" "];
      for (let row = 0; row < 7; row++) {
        let run = -1;
        for (let col = 0; col <= 5; col++) {
          const on = col < 5 && rows[row][col] === "1";
          if (on && run < 0) run = col;
          if ((!on || col === 5) && run >= 0) {
            const end = on && col === 5 ? 5 : col;
            text.push({
              size: [(end - run) * pixel, 0.012, pixel],
              at: [
                cursor + ((run + end) * pixel) / 2,
                0.069,
                z0 - row * (pixel + 0.004),
              ],
            });
            run = -1;
          }
        }
      }
      cursor += charAdvance;
    }
  };

  write("SPITFIRE", 3.78, -4.02);
  write("MK IX", 3.78, -4.29);
  write("PROJ 1942", 3.78, -4.55);
  write("SCALE 1:24", 3.78, -4.81);
  write("SHEET 3/12", 3.78, -5.07);
  part(merged(text), lineWhite);

  const stamp = b.part(
    new THREE.CylinderGeometry(0.09, 0.09, 0.012, 12),
    amber,
    { at: [5.67, 0.07, -4.08], dir: [0, 1, 0] },
  );
  glow(stamp, 1.3);

  // ------------------------------------------------------------------------------------------------
  // Wing-span dimension line on the drawing sheet.

  const dim: BoxSpec[] = [
    { size: [10.9, 0.012, 0.018], at: [0, 0.066, -2.2] },
    { size: [0.018, 0.012, 0.24], at: [-5.45, 0.066, -2.2] },
    { size: [0.018, 0.012, 0.24], at: [5.45, 0.066, -2.2] },
    { size: [0.22, 0.012, 0.018], at: [-5.36, 0.066, -2.15], rotY: -0.55 },
    { size: [0.22, 0.012, 0.018], at: [-5.36, 0.066, -2.25], rotY: 0.55 },
    { size: [0.22, 0.012, 0.018], at: [5.36, 0.066, -2.15], rotY: 0.55 },
    { size: [0.22, 0.012, 0.018], at: [5.36, 0.066, -2.25], rotY: -0.55 },
  ];
  part(merged(dim), lineWhite);

  // Height datum beside the nose, rising from the sheet toward the aircraft.
  const heightDatum: BoxSpec[] = [
    { size: [0.018, 3.15, 0.014], at: [2.2, 1.62, 3.0] },
    { size: [0.22, 0.014, 0.018], at: [2.2, 0.075, 3.0] },
    { size: [0.22, 0.014, 0.018], at: [2.2, 3.17, 3.0] },
    { size: [0.014, 0.018, 0.18], at: [2.2, 0.075, 3.0] },
    { size: [0.014, 0.018, 0.18], at: [2.2, 3.17, 3.0] },
  ];
  part(merged(heightDatum), lineWhite, [0, 0, 0], J.airframe);

  // ------------------------------------------------------------------------------------------------
  // Three floating section flags, with luminous rings and simple white index marks.

  const flagCenters: [number, number, number][] = [
    [-3.4, 2.6, -0.4],
    [0, 2.6, -2.0],
    [3.4, 2.6, -0.4],
  ];

  for (let i = 0; i < flagCenters.length; i++) {
    const [x, y, z] = flagCenters[i];
    const ring = b.part(new THREE.TorusGeometry(0.17, 0.014, 6, 20), glowCyan, {
      at: [x, y, z],
      bone: J.airframe,
      dir: [0, 0, 1],
      axis: "z",
    });
    glow(ring, 1.8);

    const mark: BoxSpec[] = [];
    const s = 0.06;
    if (i === 0) {
      mark.push(
        { size: [s, s, 0.012], at: [x - 0.06, y + 0.06, z] },
        { size: [s, s, 0.012], at: [x - 0.06, y - 0.06, z] },
        { size: [s, 0.045, 0.012], at: [x + 0.0, y, z] },
        { size: [s, s, 0.012], at: [x + 0.06, y + 0.06, z] },
        { size: [s, s, 0.012], at: [x + 0.06, y - 0.06, z] },
      );
    } else if (i === 1) {
      mark.push(
        { size: [0.025, 0.17, 0.012], at: [x - 0.06, y, z] },
        { size: [0.025, 0.17, 0.012], at: [x + 0.06, y, z] },
        { size: [0.12, 0.025, 0.012], at: [x, y + 0.073, z] },
        { size: [0.12, 0.025, 0.012], at: [x, y - 0.073, z] },
      );
    } else {
      mark.push(
        { size: [0.025, 0.17, 0.012], at: [x - 0.06, y, z] },
        { size: [0.025, 0.17, 0.012], at: [x + 0.06, y, z] },
        { size: [0.12, 0.025, 0.012], at: [x, y + 0.073, z] },
        { size: [0.12, 0.025, 0.012], at: [x, y - 0.073, z] },
      );
    }
    part(merged(mark), lineWhite, [0, 0, 0], J.airframe);
  }

  // ------------------------------------------------------------------------------------------------
  // Propeller sweep arc, segmented so it reads like a measured construction arc on the sheet.

  const arc: BoxSpec[] = [];
  const centerX = 0;
  const centerZ = 4.3;
  const radius = 1.65;
  const count = 18;
  for (let i = 0; i < count; i++) {
    const a0 = (-145 + (290 * i) / count) * (Math.PI / 180);
    const a1 = (-145 + (290 * (i + 1)) / count) * (Math.PI / 180);
    const am = (a0 + a1) / 2;
    const length = radius * (a1 - a0) * 0.92;
    arc.push({
      size: [length, 0.012, 0.014],
      at: [centerX + radius * Math.sin(am), 0.065, centerZ + radius * Math.cos(am)],
      rotY: am,
    });
  }
  glow(part(merged(arc), glowCyan), 1.4);

  // A small central construction cross for the propeller datum.
  const propCross: BoxSpec[] = [
    { size: [0.5, 0.01, 0.012], at: [0, 0.068, 4.3] },
    { size: [0.012, 0.01, 0.5], at: [0, 0.068, 4.3] },
  ];
  part(merged(propCross), faintCyan);
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  polyline,
  rng,
} from "agentic-3js-builder";

export function buildFuselage({ b, J, P, M }: Ctx) {
  const bodyBone = J.body;
  const hull = P.hull;
  const deep = P.deep;
  const panel = P.panel;
  const white = P.line;
  const cyan = P.glow;
  const faint = P.faint;
  const steel = P.steel;
  const amber = P.amber ?? "#ffb547";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      bone: bodyBone,
      at,
      ...options,
    });

  const rod = (
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, color, { bone: bodyBone, ...options });

  const capsule = (
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
  ) => b.capsule(a, c, radius, { bone: bodyBone, color });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
  ) => part(new THREE.BoxGeometry(...size), color, at);

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 12,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      at,
      { dir, axis: "y" },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    rings = 5,
  ) =>
    part(new THREE.SphereGeometry(radius, segments, rings), color, at);

  // ---------------------------------------------------------------------------
  // Main monocoque fuselage. Stations are deliberately angular and broad enough
  // to read as a hand-built blueprint hull rather than a smooth aircraft toy.
  // ---------------------------------------------------------------------------

  const stations = [
    { at: [0, 1.73, 3.30], w: 0.98, h: 0.76 },
    { at: [0, 1.70, 3.05], w: 1.00, h: 0.78 },
    { at: [0, 1.65, 2.70], w: 0.88, h: 0.72 },
    { at: [0, 1.58, 2.20], w: 0.76, h: 0.66 },
    { at: [0, 1.55, 1.75], w: 0.92, h: 0.78 },
    { at: [0, 1.53, 1.20], w: 1.00, h: 0.84 },
    { at: [0, 1.50, 0.65], w: 0.86, h: 0.76 },
    { at: [0, 1.47, 0.05], w: 0.72, h: 0.66 },
    { at: [0, 1.44, -0.65], w: 0.62, h: 0.58 },
    { at: [0, 1.42, -1.35], w: 0.54, h: 0.50 },
    { at: [0, 1.40, -2.15], w: 0.46, h: 0.42 },
    { at: [0, 1.38, -2.82], w: 0.38, h: 0.34 },
    { at: [0, 1.36, -3.40], w: 0.36, h: 0.30 },
  ];

  const fuselage = b.loft(stations, {
    bone: bodyBone,
    color: hull,
    detail: 1,
    name: "fuselageHull",
    group: "fuselage",
  });

  const fuselageSurface = b.surface(fuselage);

  // Angular underside keel, visible below the cockpit and between the wing roots.
  b.sweep(
    catmull([
      [0, 1.39, 2.75],
      [0, 1.22, 2.15],
      [0, 1.16, 1.30],
      [0, 1.18, 0.25],
      [0, 1.23, -0.90],
      [0, 1.28, -2.15],
    ]),
    [0.18, 0.075],
    {
      bone: bodyBone,
      color: deep,
      section: { ngon: 6 },
      caps: "flat",
      name: "bellyKeel",
      group: "fuselage",
    },
  );

  // Cowling blue band, seated to the actual hull surface.
  for (const z of [3.24, 3.02, 2.82]) {
    const loop = fuselageSurface.loop([0, 1.72, z], {
      dir: [0, 0, 1],
      lift: 0.008,
    });
    b.sweep(loop, 0.028, {
      bone: bodyBone,
      color: panel,
      caps: "none",
      name: `cowlingBand${z}`,
      group: "panel",
    });
  }

  // Five luminous drafting seam bands.
  const seamZ = [2.8, 1.9, 0.9, -0.6, -2.2];
  const seamLoops: ReturnType<typeof fuselageSurface.loop>[] = [];
  for (let i = 0; i < seamZ.length; i++) {
    const z = seamZ[i];
    const loop = fuselageSurface.loop([0, 1.5, z], {
      dir: [0, 0, 1],
      lift: 0.012,
    });
    seamLoops.push(loop);
    b.sweep(loop, 0.009, {
      bone: bodyBone,
      color: white,
      caps: "none",
      name: `panelSeam${i + 1}`,
      group: "drafting",
    });

    // Small rivets along each perimeter. The count is intentionally restrained
    // so they remain readable as blueprint studs rather than noise.
    b.along(loop, i === 0 ? 12 : 10, (at) => {
      b.stick(
        new THREE.SphereGeometry(0.018, 6, 4),
        white,
        at,
        { embed: 0.25, name: `rivet${i}` },
      );
    });
  }

  // Subtle panel plates between the principal seam lines.
  const panelRows = [
    [0.43, 1.92, 0.48, 0.16, 2.42],
    [-0.42, 1.86, 0.38, 0.14, 1.28],
    [0.34, 1.53, 0.34, 0.12, 0.22],
    [-0.34, 1.48, 0.30, 0.12, -0.88],
    [0.24, 1.43, 0.26, 0.10, -1.75],
  ] as const;
  for (let i = 0; i < panelRows.length; i++) {
    const [x, y, w, h, z] = panelRows[i];
    box([w, h, 0.012], [x, y, z], panel);
    rod([x - w * 0.5, y + h * 0.52, z + 0.009], [x + w * 0.5, y + h * 0.52, z + 0.009], 0.006, white);
  }

  // Dorsal spine fairing, tapering toward the tail.
  b.sweep(
    catmull([
      [0, 2.08, 1.10],
      [0, 2.10, 0.55],
      [0, 1.96, -0.25],
      [0, 1.78, -1.15],
      [0, 1.62, -2.20],
      [0, 1.50, -3.35],
    ]),
    (t: number) => 0.105 * (1 - t) + 0.025,
    {
      bone: bodyBone,
      color: panel,
      section: { ngon: 5 },
      caps: "flat",
      name: "dorsalSpineFairing",
      group: "fuselage",
    },
  );

  // ---------------------------------------------------------------------------
  // Cockpit trough and closed framed canopy.
  // ---------------------------------------------------------------------------

  box([0.72, 0.16, 0.92], [0, 1.99, 1.62], deep);
  box([0.86, 0.035, 1.04], [0, 2.075, 1.62], white);

  const canopyStations = [
    { at: [0, 2.06, 1.12], w: 0.67, h: 0.10 },
    { at: [0, 2.18, 1.38], w: 0.73, h: 0.36 },
    { at: [0, 2.30, 1.72], w: 0.68, h: 0.46 },
    { at: [0, 2.35, 2.02], w: 0.53, h: 0.34 },
    { at: [0, 2.28, 2.16], w: 0.30, h: 0.14 },
  ];
  const canopy = b.loft(canopyStations, {
    bone: bodyBone,
    color: cyan,
    detail: 1,
    name: "canopyGlass",
    group: "canopy",
  });
  const canopySurface = b.surface(canopy);

  for (const [i, z] of [1.22, 1.53, 1.84, 2.08].entries()) {
    const rim = canopySurface.loop([0, 2.14, z], {
      dir: [0, 0, 1],
      lift: 0.015,
    });
    b.sweep(rim, i === 0 ? 0.025 : 0.018, {
      bone: bodyBone,
      color: steel,
      caps: "none",
      name: `canopyRib${i}`,
      group: "canopyFrame",
    });
    b.sweep(rim, 0.006, {
      bone: bodyBone,
      color: white,
      caps: "none",
      name: `canopyRibHighlight${i}`,
      group: "canopyFrame",
    });
  }

  // Long canopy rails.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.34, 2.13, 1.18],
        [s * 0.38, 2.21, 1.48],
        [s * 0.34, 2.32, 1.82],
        [s * 0.23, 2.31, 2.11],
      ]),
      0.022,
      { bone: bodyBone, color: steel, caps: "round", name: `canopyRail${s}`, group: "canopyFrame" },
    );
    b.sweep(
      catmull([
        [s * 0.34, 2.145, 1.18],
        [s * 0.38, 2.225, 1.48],
        [s * 0.34, 2.335, 1.82],
        [s * 0.23, 2.325, 2.11],
      ]),
      0.006,
      { bone: bodyBone, color: white, caps: "round", name: `canopyRailLine${s}`, group: "canopyFrame" },
    );
  }

  // Cockpit sill and rear bulkhead.
  for (const s of [-1, 1]) {
    rod([s * 0.42, 2.04, 1.18], [s * 0.32, 2.08, 2.12], 0.028, steel);
    rod([s * 0.42, 2.05, 1.18], [s * 0.32, 2.09, 2.12], 0.007, white);
  }
  rod([-0.28, 2.13, 2.12], [0.28, 2.13, 2.12], 0.026, steel);

  // ---------------------------------------------------------------------------
  // Gun cowl ports and exhaust stacks.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    cylinder(0.075, 0.025, [s * 0.28, 2.105, 2.55], deep, 12);
    cylinder(0.091, 0.012, [s * 0.28, 2.122, 2.55], white, 12);

    // Three side exhausts, each angled slightly aft.
    for (let i = 0; i < 3; i++) {
      const z = 3.48 - i * 0.25;
      const x = s * (0.47 + i * 0.025);
      rod(
        [x, 1.58, z],
        [x, 1.56, z - 0.16],
        0.045,
        steel,
        { caps: "flat" },
      );
      cylinder(0.052, 0.012, [x, 1.56, z - 0.16], white, 8, [0, 0, -1]);
    }
  }

  // ---------------------------------------------------------------------------
  // Oil cooler scoop and luminous grill under the nose.
  // ---------------------------------------------------------------------------

  box([0.42, 0.18, 0.34], [0, 1.08, 2.38], deep);
  box([0.34, 0.012, 0.22], [0, 0.985, 2.38], cyan);
  for (let i = -2; i <= 2; i++) {
    rod(
      [i * 0.055, 0.997, 2.28],
      [i * 0.055, 0.997, 2.48],
      0.006,
      white,
    );
  }
  rod([-0.24, 1.17, 2.20], [0.24, 1.17, 2.20], 0.008, white);
  rod([-0.24, 1.17, 2.56], [0.24, 1.17, 2.56], 0.008, white);

  // ---------------------------------------------------------------------------
  // Antenna mast, wire, and small blueprint fittings.
  // ---------------------------------------------------------------------------

  rod([0, 1.79, -1.02], [0, 2.17, -1.02], 0.025, steel);
  rod([0, 2.17, -1.02], [0.10, 2.27, -0.72], 0.006, faint);
  sphere(0.035, [0, 2.17, -1.02], white, 7, 4);

  // A pair of small access hatches with corner rivets.
  for (const s of [-1, 1]) {
    const x = s * 0.38;
    box([0.012, 0.18, 0.34], [x, 1.62, -0.18], panel);
    rod([x + s * 0.008, 1.53, -0.34], [x + s * 0.008, 1.53, -0.02], 0.005, white);
    rod([x + s * 0.008, 1.71, -0.34], [x + s * 0.008, 1.71, -0.02], 0.005, white);
    for (const yy of [1.54, 1.70]) {
      for (const zz of [-0.32, -0.04]) sphere(0.014, [x + s * 0.012, yy, zz], white, 6, 4);
    }
  }

  // ---------------------------------------------------------------------------
  // Crosshair inspection circles on both tail-cone flanks.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const x = s * 0.205;
    part(
      new THREE.TorusGeometry(0.115, 0.009, 6, 18),
      white,
      [x, 1.44, -2.62],
      { dir: [s, 0, 0], axis: "z", rotation: [0, 0, 0] },
    );
    rod([x + s * 0.012, 1.44, -2.78], [x + s * 0.012, 1.44, -2.46], 0.006, white);
    rod([x + s * 0.012, 1.28, -2.62], [x + s * 0.012, 1.60, -2.62], 0.006, white);
    sphere(0.018, [x + s * 0.018, 1.44, -2.62], cyan, 6, 4);
  }

  // Tail-side seam patch and a small line of rivets near the handover face.
  const rearLoop = fuselageSurface.loop([0, 1.36, -3.25], {
    dir: [0, 0, 1],
    lift: 0.012,
  });
  b.sweep(rearLoop, 0.008, {
    bone: bodyBone,
    color: white,
    caps: "none",
    name: "rearHandoverSeam",
    group: "drafting",
  });
  b.along(rearLoop, 8, (at) => {
    b.stick(new THREE.SphereGeometry(0.016, 6, 4), white, at, { embed: 0.25 });
  });

  // Small amber warning lamps tucked into the cowling sides.
  for (const s of [-1, 1]) {
    sphere(0.028, [s * 0.49, 1.72, 2.72], amber, 7, 4);
    sphere(0.018, [s * 0.50, 1.72, 2.70], cyan, 7, 4);
  }

  // Keep the supplied mounts explicitly referenced so the part remains tied to
  // the shared layout if a caller changes the common specification.
  void M;
  void frame;
  void rng;
}
```