<!-- call: plan -->

```json
{
  "name": "Spitfire Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter, built as a cyanotype blueprint: Prussian-blue surfaces in three tones, with chalk-white panel lines, ribs, rivet rows and dashed centre lines on every part.",
  "builderName": "spitfireBlueprint",
  "size": [11.2, 3.0, 9.2],
  "layout": "Single-engine low-wing monoplane in a level attitude, nose toward +Z, thrust line on y = 1.7 and x = 0. Spinner tip z = +4.6, rudder trailing edge z = -4.6, wingtips x = ±5.6, fin top y = 2.95. Left is +X, and every pair is mirrored with s = ±1. Only the two main wheels (y = 0) and the tail wheel (y = 0) touch the floor.\n\nFUSELAGE STATIONS (z: centre y, half-width, half-height), with an elliptical cross-section:\n3.5: 1.70, .38, .38 (cowl lip)\n3.0: 1.70, .43, .42\n2.2: 1.70, .45, .47\n1.4: 1.72, .44, .52\n0.4: 1.68, .42, .52\n-0.8: 1.62, .38, .50\n-2.0: 1.55, .30, .40\n-3.0: 1.50, .17, .28\n-3.7: 1.45, .08, .20 (tailRoot)\nThe tail cone then tapers to a rounded tip at z = -4.35, y = 1.40.\nThe long cowled nose is lower than the cockpit deck. The bubble-less sliding canopy peaks at y = 2.62 near z = -0.2, with a three-pane windscreen at z ≈ 1.2 and a fairing behind it that blends into the spine by z = -1.6.\n\nWING (elliptical, thin, with 6° dihedral). Stations (x: LE z, TE z, centre y, thickness):\n0.45: 1.25, -1.35, 1.15, .32\n1.5: 1.20, -1.30, 1.26, .28\n3.0: .95, -1.15, 1.42, .20\n4.5: .45, -.95, 1.58, .13\n5.3: -.05, -.75, 1.66, .09\nThe tip is rounded at x = 5.6, y = 1.70, z ≈ -0.4. The wing root is buried in the fuselage from x = ±0.3. Ailerons run x 3.2 to 5.1 (rear ~28% of chord), and split flaps run x 0.7 to 2.6.\n\nTAILPLANE (elliptical, tapered): y = 1.47, tips x = ±1.65, root LE z = -3.3, TE z = -4.2, tip LE -3.85, TE -4.1. The elevators are the rear 35% (hinge z ≈ -3.88 at the root).\nFIN (elliptical): LE rises from (z -3.35, y 1.7) to the top at (z -4.15, y 2.95). The rudder hinge is z ≈ -4.1 to -4.15. The rudder is broad and rounded, with its TE bulging to z = -4.6 near y 2.2.\n\nGEAR (down): short legs from the wing underside, a little splayed outward, with tyre radius 0.36 and width 0.16, wheel centres at y = 0.36. The tail wheel has radius 0.12, on a strut about 1.2 m long.\n\nPROPELLER: 3 broad scimitar blades, radius 1.5 from the hub. Blade directions (clock angle from up): 180° (straight down, tip y = 0.2), 60° and 300°. The blades turn on the propeller joint, and the spinner is an ogive from z = 3.5 (radius 0.34) to 4.6.\n\nBLUEPRINT STYLE ON EVERY PART: all surfaces are flat blues, and there are no reds, yellows or greens. Colour follows place: up-facing skins use skinTop, flanks use skinBase, and undersides and recesses use skinShade or skinDeep. Hard edges are chalk-white `line` strips about 4 mm wide and 3 mm proud, on leading edges, control-surface outlines, canopy frames and cowl seams. Panel lines, wing ribs and spars are thinner `lineSoft` strips. Rivet rows are tiny lineSoft spheres or discs. `lineFaint` marks secondary construction lines, such as dashed centre lines along the spine, the wing span axis and the fin. Roundels are concentric discs seated on the skin, outer to inner: line, skinDeep, lineSoft, accent-blue centre. Everything is faceted low-poly with bold readable shapes.",
  "palette": {
    "skinBase": "#1b57b0",
    "skinTop": "#2f78d0",
    "skinShade": "#113a80",
    "skinDeep": "#0a2a5e",
    "ink": "#061b42",
    "line": "#eaf6ff",
    "lineSoft": "#a9d6f5",
    "lineFaint": "#6fb1e8",
    "glass": "#86ccff",
    "glassDark": "#2a6fb8",
    "metal": "#cfe8fa",
    "metalDark": "#5d8fc9",
    "tyre": "#07235a",
    "spinner": "#3d8ae0",
    "accentCyan": "#46e0ff",
    "roundelCore": "#4a97ec"
  },
  "mounts": {
    "noseBase": [0, 1.7, 3.5],
    "propHub": [0, 1.7, 3.55],
    "spinnerTip": [0, 1.7, 4.6],
    "cockpitCenter": [0, 2.2, -0.2],
    "canopyPeak": [0, 2.62, -0.2],
    "tailRoot": [0, 1.45, -3.7],
    "tailTip": [0, 1.4, -4.35],
    "wingRootL": [0.3, 1.15, -0.05],
    "wingRootR": [-0.3, 1.15, -0.05],
    "wingTipL": [5.6, 1.7, -0.4],
    "wingTipR": [-5.6, 1.7, -0.4],
    "aileronHingeL": [3.2, 1.45, -0.85],
    "aileronHingeR": [-3.2, 1.45, -0.85],
    "stabRootL": [0.2, 1.47, -3.75],
    "stabRootR": [-0.2, 1.47, -3.75],
    "stabTipL": [1.65, 1.47, -4.0],
    "stabTipR": [-1.65, 1.47, -4.0],
    "elevatorHingeL": [0.2, 1.47, -3.88],
    "elevatorHingeR": [-0.2, 1.47, -3.88],
    "finBase": [0, 1.55, -3.9],
    "finTop": [0, 2.95, -4.2],
    "rudderHinge": [0, 1.5, -4.1],
    "gearAttachL": [0.95, 1.02, 0.5],
    "gearAttachR": [-0.95, 1.02, 0.5],
    "wheelCenterL": [1.05, 0.36, 0.5],
    "wheelCenterR": [-1.05, 0.36, 0.5],
    "tailWheelMount": [0, 1.3, -3.95],
    "tailWheelCenter": [0, 0.12, -4.0]
  },
  "joints": [
    { "name": "fuselage", "at": [0, 1.7, 0.5], "dir": [0, 0, -1], "role": "spine" },
    { "name": "propeller", "parent": "fuselage", "at": [0, 1.7, 3.55], "dir": [0, 0, 1], "role": "hinge", "group": "prop" },
    { "name": "aileronL", "parent": "fuselage", "at": [3.2, 1.45, -0.85], "dir": [1, 0.1, 0.1], "role": "hinge", "group": "wings" },
    { "name": "aileronR", "parent": "fuselage", "at": [-3.2, 1.45, -0.85], "dir": [-1, 0.1, 0.1], "role": "hinge", "group": "wings" },
    { "name": "elevatorL", "parent": "fuselage", "at": [0.2, 1.47, -3.88], "dir": [1, 0, -0.05], "role": "hinge", "group": "tail" },
    { "name": "elevatorR", "parent": "fuselage", "at": [-0.2, 1.47, -3.88], "dir": [-1, 0, -0.05], "role": "hinge", "group": "tail" },
    { "name": "rudder", "parent": "fuselage", "at": [0, 1.5, -4.1], "dir": [0, 1, 0], "role": "hinge", "group": "tail" },
    { "name": "legL", "parent": "fuselage", "at": [0.95, 1.02, 0.5], "dir": [0.12, -1, 0], "role": "leg", "group": "gear" },
    { "name": "legR", "parent": "fuselage", "at": [-0.95, 1.02, 0.5], "dir": [-0.12, -1, 0], "role": "leg", "group": "gear" },
    { "name": "wheelL", "parent": "legL", "at": [1.05, 0.36, 0.5], "dir": [1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "wheelR", "parent": "legR", "at": [-1.05, 0.36, 0.5], "dir": [-1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "tailStrut", "parent": "fuselage", "at": [0, 1.3, -3.95], "dir": [0, -1, 0.1], "role": "leg", "group": "gear" },
    { "name": "tailWheel", "parent": "tailStrut", "at": [0, 0.12, -4.0], "dir": [1, 0, 0], "role": "hinge", "group": "gear" }
  ],
  "parts": [
    {
      "id": "fuselage",
      "builds": "Everything of the airframe body from the cowl lip (z = 3.5) back to tailRoot (z = -3.7). It is a loft through the fuselage stations in the layout, in skinBase with skinTop on the upper deck and skinShade on the belly.\n- Nose: cowl panel seams in line, three cowl-fastener rivet rows in lineSoft, a chin carburettor intake under the nose (z 2.2 to 3.2, skinDeep mouth with a lineSoft lip), and a small oil-breather bump.\n- Exhaust: six short ejector stacks per side at z 2.0 to 3.0, y ≈ 1.78, x ≈ ±0.43, in metalDark with skinDeep openings.\n- Gun troughs: faint gun-bay panel lines.\n- Cockpit: a sill, a windscreen of three glass panes with a line frame, a sliding canopy in glass with line framing ribs and a glassDark rim, a head-armour fairing behind it, a reflector gunsight (accentCyan glow glass) at the windscreen base, and a small entry flap with handle on the left side.\n- Aerial mast at z ≈ 1.9, y 2.12 to 2.55, in metal.\n- Markings: a fuselage roundel (line, skinDeep, lineSoft, roundelCore rings, radius ≈ 0.38) on each flank at z ≈ -2.4, y ≈ 1.58, and code letters and a serial drawn as small line-coloured parts or an svg decal on the flanks.\n- Lines: a dashed lineFaint centre line along the top spine, rivet rows along the flanks, and a white line along the wing-root join.\nThe wing and gear attach to it, and it does not build the wing root fillets.",
      "box": [[-0.55, 1.05, -3.7], [0.55, 2.65, 3.5]],
      "attaches": "Front face at noseBase meets the propeller part's spinner back plate. Rear face at tailRoot meets the tail part's cone. The wing root buries into the belly at wingRootL and wingRootR. Rides joint fuselage.",
      "joints": ["fuselage"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "wings",
      "builds": "Both elliptical wings as lofts through the wing stations, with dihedral, in skinTop above, skinShade below, and a white `line` leading-edge strip.\n- Surfaces: rib lines (lineSoft thin strips) every ~0.35 m across the upper surface, spar lines, and a dashed lineFaint span axis.\n- Roots: wing-root fillets blending into the fuselage.\n- Control surfaces: ailerons (x 3.2 to 5.1, riding aileronL and aileronR) with fabric-rib stripes and outline in line, and split flaps inboard (x 0.7 to 2.6) with skinDeep hinge gaps.\n- Guns: four .303 gun ports per wing in the leading edge, with short metalDark barrel stubs poking forward and a skinDeep ejection chute slot underneath.\n- Cooling: an oil-cooler scoop under the left wing and a glycol radiator scoop under the right wing at x ≈ ±2.4 (box-like fairings with skinDeep mouths, metal grilles and line rims). A landing light lens in the left leading edge, and a pitot tube on the left underwing.\n- Gear: wheel-well outlines in skinDeep under the wings near the gear mounts.\n- Markings: a roundel on each upper wing at x ≈ ±3.7 and one on each lower wing (outer line ring, skinDeep ring, lineSoft ring, roundelCore centre, radius ≈ 0.5), in sunk-in flat discs seated on the skin.\n- Tips: rounded wingtips with a small navigation light in accentCyan.\n- Rivets: rivet rows in lineSoft along the spar and root.",
      "box": [[-5.6, 0.9, -1.4], [5.6, 1.85, 1.55]],
      "attaches": "Roots start at wingRootL and wingRootR and bury 0.12 m into the fuselage. Ailerons ride aileronL and aileronR at the aileronHinge mounts. The main legs attach to the underside at gearAttachL and gearAttachR. The rest rides joint fuselage.",
      "joints": ["fuselage", "aileronL", "aileronR"],
      "floor": false,
      "budget": 240
    },
    {
      "id": "tail",
      "builds": "The tail cone from tailRoot to tailTip (a tapering loft in skinBase with a skinShade belly and a rounded end) and all the empennage.\n- Fin: an elliptical fin extruded in skinBase with a skinTop edge, carrying a broad rounded rudder on the rudder joint. The rudder has horizontal rib stripes in lineSoft, a trim tab, a white hinge line and a white outline.\n- Tailplane: two elliptical tailplanes at y ≈ 1.47, in skinTop above and skinShade below, with leading-edge line strips, rib lines and rivet rows.\n- Elevators: one on each side, riding elevatorL and elevatorR, with rib stripes, a small trim tab on the left and a line outline.\n- Markings: a fin flash on each side of the fin, made of three stacked vertical stripes (line, skinDeep, roundelCore), a small rear navigation light in accentCyan at the rudder base, and a dashed lineFaint centre line on the fin.\nThe tail wheel and its strut belong to the gear part.",
      "box": [[-1.7, 1.2, -4.6], [1.7, 2.95, -3.2]],
      "attaches": "The cone starts at tailRoot, flush with the fuselage rear face, and ends at tailTip. The stabs start at stabRootL and stabRootR, and the elevators hinge at elevatorHingeL and elevatorHingeR. The fin sits on the spine at finBase and ends at finTop, and the rudder hinges at rudderHinge. The tail wheel strut hangs from tailWheelMount, below the cone.",
      "joints": ["fuselage", "elevatorL", "elevatorR", "rudder"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "propeller",
      "builds": "The whole propeller assembly, on the propeller joint (axis +Z).\n- Spinner: an ogive lathe from z = 3.5 (radius 0.34) to the tip at z = 4.6, in spinner with a lineSoft ring near the base, a thin line ring mid-way, and a faceted highlight stripe.\n- Back plate: a skinDeep backplate disc at z = 3.5 to 3.56, with a ring of small metal bolts.\n- Blades: three broad scimitar-shaped blades, radius 1.5 from the hub, twisted a little, at clock angles 180° (down), 60° and 300° from up. Each is skinBase with a skinTop leading edge, a lineSoft tip band, a white `line` leading-edge strip, and a tiny line serial stamp.\n- Roots: a metalDark root cuff and a metal blade-root collar per blade.\nThe tip of the lowest blade clears the floor at y ≈ 0.2.",
      "box": [[-1.35, 0.2, 3.5], [1.35, 2.5, 4.6]],
      "attaches": "The back plate sits flush on the fuselage front face at noseBase, centred on propHub. Spinner tip at spinnerTip.",
      "joints": ["propeller"],
      "floor": false,
      "budget": 90
    },
    {
      "id": "gear",
      "builds": "All the running gear.\n- Main legs: two main legs in metal and metalDark, from gearAttachL and gearAttachR down to the wheel centres, splayed outward a little. Each has an oleo strut with a lineSoft scissor link and a brake line, plus a hinge pivot fairing at the wing.\n- Wheels: two wheels riding wheelL and wheelR, each with a faceted tyre (tyre colour, radius 0.36, width 0.16), a metal hub disc, a skinDeep brake drum, a ring of bolts in lineSoft, a white `line` hubcap ring, and a few tread notches.\n- Doors: an outer gear door hanging from each leg, in skinShade with a white outline and a skinDeep inner face.\n- Tail wheel: a tail wheel riding tailWheel (radius 0.12, tyre colour, metal hub) on a tailStrut oleo from tailWheelMount, with a small fork.\nThe lowest points of the three wheels touch y = 0.",
      "box": [[-1.35, 0.0, -4.15], [1.35, 1.15, 0.95]],
      "attaches": "The main legs top out on the wing underside at gearAttachL and gearAttachR. The wheel hubs are centred on wheelCenterL and wheelCenterR. The tail strut hangs from tailWheelMount (under the cone), and its wheel centre is tailWheelCenter.",
      "joints": ["legL", "legR", "wheelL", "wheelR", "tailStrut", "tailWheel"],
      "floor": true,
      "budget": 130
    }
  ]
}
```

<!-- call: propeller -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPropeller({ b, J, P, M }: Ctx) {
  const bone = J.propeller;
  const hub = M.propHub;
  const Z0 = 3.5;
  const R = rng(5);

  // Spinner ogive (axis +Z)
  const prof: [number, number][] = [
    [0, 0], [0.34, 0], [0.335, 0.1], [0.31, 0.25], [0.26, 0.42], [0.19, 0.64], [0.1, 0.88], [0, 1.1],
  ];
  b.lathe(prof, { at: [0, hub[1], Z0], axis: [0, 0, 1], segments: 12, color: P.spinner, bone, name: "spinner" });

  // rings on spinner
  const ringAt = (z: number, r: number, w: number, col: string, nm: string) => {
    b.part(new THREE.TorusGeometry(r, w, 4, 16), col, { at: [0, hub[1], z], dir: [0, 0, 1], axis: "z", bone, name: nm });
  };
  ringAt(Z0 + 0.12, 0.332, 0.007, P.lineSoft, "spinnerRingBase");
  ringAt(Z0 + 0.5, 0.235, 0.004, P.line, "spinnerRingMid");

  // highlight stripes on the spinner surface
  for (const a of [35, 155, 275]) {
    const ang = (a * Math.PI) / 180;
    const p0: [number, number, number] = [Math.sin(ang) * 0.3, hub[1] + Math.cos(ang) * 0.3, Z0 + 0.22];
    const p1: [number, number, number] = [Math.sin(ang) * 0.14, hub[1] + Math.cos(ang) * 0.14, Z0 + 0.75];
    b.rod(p0, p1, 0.012, P.line, { bone, name: "spinnerStripe", sides: 4 });
  }

  // Back plate
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16), P.skinDeep, {
    at: [0, hub[1], Z0 + 0.03], dir: [0, 0, 1], bone, name: "backplate",
  });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.022, 5, 4), P.metal, {
      at: [Math.sin(a) * 0.37, hub[1] + Math.cos(a) * 0.37, Z0 - 0.005], bone, name: "bolt",
    });
  }

  // Blades
  for (const clock of [180, 60, 300]) {
    const a = (clock * Math.PI) / 180;
    const out = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
    const side = new THREE.Vector3(Math.cos(a), -Math.sin(a), 0); // tangential
    const base = new THREE.Vector3(0, hub[1], Z0 + 0.45);
    const P3 = (r: number, t: number, dz: number) =>
      base.clone().addScaledVector(out, r).addScaledVector(side, t).add(new THREE.Vector3(0, 0, dz));

    // root cuff and collar
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8), P.metalDark, {
      at: P3(0.4, 0, 0).toArray() as [number, number, number], dir: out.toArray() as [number, number, number], bone, name: "cuff",
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), P.metal, {
      at: P3(0.58, 0, 0).toArray() as [number, number, number], dir: out.toArray() as [number, number, number], bone, name: "collar",
    });

    // blade as a scimitar outline: x=radius, y=tangential
    const outline: [number, number][] = [
      [0.55, -0.1], [0.9, -0.17], [1.2, -0.17], [1.42, -0.1], [1.5, 0.0], [1.45, 0.1],
      [1.2, 0.14], [0.9, 0.2], [0.55, 0.14],
    ];
    const blade = b.extrude(outline, {
      at: base.toArray() as [number, number, number],
      x: out.toArray() as [number, number, number],
      y: side.toArray() as [number, number, number],
      thickness: [0.05, 0.02], bevel: 0.008, color: P.skinBase, bone, name: "blade",
    });
    // twist hint: tilted leading strip
    b.rod(P3(0.6, -0.1, 0.01).toArray() as number[], P3(1.4, -0.1, 0.01).toArray() as number[], 0.02, P.skinTop, {
      bone, name: "bladeLE", sides: 4,
    });
    b.rod(P3(0.62, -0.115, 0.0).toArray() as number[], P3(1.38, -0.105, 0.0).toArray() as number[], 0.007, P.line, {
      bone, name: "bladeLEline", sides: 4,
    });
    // tip band
    b.rod(P3(1.3, -0.12, 0.03).toArray() as number[], P3(1.3, 0.12, 0.03).toArray() as number[], 0.018, P.lineSoft, {
      bone, name: "tipBand", sides: 4,
    });
    // serial stamp
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.03, 0.012, 0.006), P.line, {
        at: P3(0.8 + k * 0.05, 0.04, 0.032).toArray() as [number, number, number],
        dir: out.toArray() as [number, number, number], bone, name: "serial",
      });
    }
    void blade; void R;
  }
}
```

<!-- call: gear -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildGear({ b, J, P, M }: any) {
  const R = rng(5);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // wheel with all details; axle along local x of the joint -> use dir [s,0,0]
  function wheel(s: number, c: number[], bone: any, r: number, w: number, tread: boolean) {
    const at = (dx: number): [number, number, number] => [c[0] + s * dx, c[1], c[2]];
    const ax: [number, number, number] = [s, 0, 0];
    b.part(cyl(r, r, w, tread ? 16 : 12), P.tyre, { bone, at: at(0), dir: ax });
    b.part(cyl(r * 0.62, r * 0.62, w * 1.04, 12), P.metalDark, { bone, at: at(0), dir: ax });
    b.part(cyl(r * 0.55, r * 0.55, w * 1.1, 12), P.metal, { bone, at: at(w * 0.02), dir: ax });
    if (tread) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(w * 0.9, 0.03, 0.05), P.skinDeep, {
          bone,
          at: [c[0], c[1] + Math.sin(a) * r, c[2] + Math.cos(a) * r],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      // brake drum on inner side
      b.part(cyl(r * 0.42, r * 0.42, 0.04, 10), P.skinDeep, { bone, at: at(-w * 0.58), dir: ax });
      // bolts
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.02, 5, 4), P.lineSoft, {
          bone,
          at: [c[0] + s * w * 0.6, c[1] + Math.sin(a) * r * 0.45, c[2] + Math.cos(a) * r * 0.45],
        });
      }
      b.part(new THREE.TorusGeometry(r * 0.3, 0.012, 4, 12), P.line, { bone, at: at(w * 0.58), dir: ax, axis: "z" });
    } else {
      b.part(new THREE.TorusGeometry(r * 0.35, 0.01, 4, 10), P.line, { bone, at: at(w * 0.58), dir: ax, axis: "z" });
    }
  }

  for (const s of [1, -1]) {
    const leg = s > 0 ? J.legL : J.legR;
    const wh = s > 0 ? J.wheelL : J.wheelR;
    const top = [s * 0.95, 1.02, 0.5];
    const wc = [s * 1.05, 0.36, 0.5];
    // hinge pivot fairing
    b.part(cyl(0.1, 0.1, 0.3, 8), P.metalDark, { bone: leg, at: top, dir: [0, 0, 1] });
    b.part(new THREE.SphereGeometry(0.11, 7, 5), P.metal, { bone: leg, at: top });
    // upper oleo (thick) and lower strut
    const mid = [s * 1.0, 0.7, 0.5];
    b.rod(V(top), V(mid), 0.065, P.metal, { bone: leg });
    b.rod(V(mid), V(wc), 0.045, P.metalDark, { bone: leg });
    b.part(cyl(0.08, 0.08, 0.06, 8), P.line, { bone: leg, at: mid, dir: [s * 0.12, 1, 0] });
    // scissor link
    const l1 = [s * 0.93, 0.78, 0.58];
    const l2 = [s * 1.02, 0.55, 0.58];
    b.rod(V(l1), V(l2), 0.018, P.lineSoft, { bone: leg });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), P.lineSoft, { bone: leg, at: l2 });
    // brake line
    b.rod(V([s * 0.97, 0.95, 0.43]), V([s * 1.05, 0.45, 0.43]), 0.01, P.lineSoft, { bone: leg });
    // axle stub + fork
    b.rod(V([s * 0.97, 0.36, 0.5]), V([s * 1.14, 0.36, 0.5]), 0.035, P.metal, { bone: leg });
    // gear door
    b.part(new THREE.BoxGeometry(0.03, 0.62, 0.34), P.skinShade, {
      bone: leg,
      at: [s * 1.2, 0.72, 0.5],
      rotation: [0, 0, s * -8],
    });
    b.part(new THREE.BoxGeometry(0.01, 0.58, 0.3), P.skinDeep, { bone: leg, at: [s * 1.18, 0.72, 0.5], rotation: [0, 0, s * -8] });
    for (const dz of [-0.17, 0.17]) b.part(new THREE.BoxGeometry(0.036, 0.62, 0.012), P.line, { bone: leg, at: [s * 1.2, 0.72, 0.5 + dz], rotation: [0, 0, s * -8] });
    for (const dy of [-0.31, 0.31]) b.part(new THREE.BoxGeometry(0.036, 0.012, 0.34), P.line, { bone: leg, at: [s * 1.2 + s * -dy * 0.14, 0.72 + dy, 0.5], rotation: [0, 0, s * -8] });
    wheel(s, wc, wh, 0.36, 0.16, true);
  }

  // tail wheel
  const st = J.tailStrut;
  const tw = J.tailWheel;
  b.part(cyl(0.05, 0.05, 0.14, 8), P.metalDark, { bone: st, at: [0, 1.28, -3.95] });
  b.rod(V([0, 1.25, -3.95]), V([0, 0.62, -3.99]), 0.04, P.metal, { bone: st });
  b.rod(V([0, 0.62, -3.99]), V([0, 0.2, -4.0]), 0.028, P.metalDark, { bone: st });
  b.part(cyl(0.055, 0.055, 0.05, 8), P.line, { bone: st, at: [0, 0.62, -3.99] });
  for (const s of [1, -1]) b.rod(V([s * 0.06, 0.3, -4.0]), V([s * 0.06, 0.12, -4.0]), 0.015, P.metal, { bone: st });
  b.part(cyl(0.12, 0.12, 0.08, 10), P.tyre, { bone: tw, at: [0, 0.12, -4], dir: [1, 0, 0] });
  b.part(cyl(0.075, 0.075, 0.09, 8), P.metal, { bone: tw, at: [0, 0.12, -4], dir: [1, 0, 0] });
  b.part(cyl(0.04, 0.04, 0.1, 6), P.line, { bone: tw, at: [0, 0.12, -4], dir: [1, 0, 0] });
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const F = J.fuselage, R = J.rudder, EL = { 1: J.elevatorL, [-1]: J.elevatorR } as any;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // Tail cone: tapering loft
  b.loft(
    [
      { at: [0, 1.5, -3.0], w: 0.34, h: 0.56 },
      { at: [0, 1.47, -3.7], w: 0.16, h: 0.4 },
      { at: [0, 1.43, -4.15], w: 0.08, h: 0.16 },
      { at: [0, 1.4, -4.33], w: 0.02, h: 0.04 },
    ],
    { bone: F, color: P.skinBase, sides: 8 } as any,
  );
  put(box(0.1, 0.012, 1.0), P.skinTop, [0, 1.62, -3.7], F, { rotation: [-1.5, 0, 0] });
  put(box(0.1, 0.02, 1.0), P.skinShade, [0, 1.3, -3.75], F);
  // dashed centre line along the spine
  for (let i = 0; i < 6; i++) put(box(0.02, 0.01, 0.1), P.lineFaint, [0, 1.655 - i * 0.02, -3.2 - i * 0.18], F);

  // Fin: extruded elliptical outline
  const fin: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI * 0.5;
    fin.push([-0.8 + 0.8 * Math.cos(a) * -1 + 0.0, 0]);
  }
  const finOutline: [number, number][] = [
    [0, 0], [0.9, 0], [0.9, 0.3], [0.78, 0.85], [0.55, 1.2], [0.2, 1.4], [0.05, 1.1], [0, 0.6],
  ];
  // x axis maps along -Z (leading edge forward at z -3.35)
  b.extrude(finOutline, { at: [0, 1.55, -3.35], x: [0, 0, -1], thickness: 0.07, bevel: 0.01, color: P.skinBase, bone: F });
  b.extrude([[0, 0], [0.05, 0.55], [0.2, 1.1], [0.35, 1.2], [0.1, 0.5], [0.02, 0]], { at: [0, 1.7, -3.35], x: [0, 0, -1], thickness: 0.085, color: P.skinTop, bone: F });
  // fin leading edge line
  b.rod([0, 1.7, -3.37], [0, 2.9, -4.1], 0.008, P.line, { bone: F });
  for (let i = 0; i < 6; i++) put(box(0.012, 0.012, 0.08), P.lineFaint, [0.04, 1.8 + i * 0.17, -3.55 - i * 0.12], F);

  // Rudder: broad rounded, on rudder joint
  const rud: [number, number][] = [
    [0, 0], [0.12, -0.05], [0.4, 0.0], [0.5, 0.7], [0.4, 1.15], [0.2, 1.4], [0, 1.4],
  ];
  const rudAt = [0, 1.5, -4.1];
  b.extrude(rud, { at: rudAt, x: [0, 0, -1], thickness: 0.06, bevel: 0.008, color: P.skinBase, bone: R });
  b.rod([0, 1.5, -4.1], [0, 2.9, -4.1], 0.01, P.line, { bone: R });
  for (let i = 1; i < 7; i++) {
    const y = 1.5 + i * 0.19;
    put(box(0.075, 0.01, 0.4 - Math.abs(i - 3) * 0.04), P.lineSoft, [0, y, -4.3], R);
  }
  put(box(0.075, 0.2, 0.02), P.line, [0, 2.0, -4.58], R);
  // trim tab
  put(box(0.08, 0.2, 0.12), P.skinTop, [0, 1.9, -4.5], R);
  // fin flash both sides: three stripes
  const cols = [P.line, P.skinDeep, P.roundelCore];
  for (const s of [1, -1])
    cols.forEach((c, i) => put(box(0.012, 0.5, 0.1), c, [s * 0.043, 2.1, -3.78 - i * 0.1], F));
  // nav light
  put(new THREE.SphereGeometry(0.035, 6, 4), P.accentCyan, [0, 1.6, -4.62], R);

  // Tailplanes and elevators
  for (const s of [1, -1] as const) {
    const eb = EL[s];
    const stab: [number, number][] = [[0, 0], [0.9, 0.12], [1.45, 0.35], [1.45, 0.1], [0.9, -0.5], [0, -0.55]];
    // outline: x spans outward, y is back (-z)
    b.extrude(stab, { at: [s * 0.15, 1.47, -3.3], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.05, bevel: 0.006, color: P.skinTop, bone: F });
    b.extrude(stab, { at: [s * 0.15, 1.44, -3.3], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.03, color: P.skinShade, bone: F });
    b.rod([s * 0.15, 1.485, -3.3], [s * 1.6, 1.485, -3.65], 0.008, P.line, { bone: F });
    for (let i = 1; i < 5; i++) {
      const x = s * i * 0.3;
      put(box(0.012, 0.008, 0.38), P.lineSoft, [x, 1.495, -3.58 - i * 0.04], F);
      put(new THREE.SphereGeometry(0.008, 4, 3), P.lineSoft, [x + s * 0.05, 1.5, -3.5 - i * 0.04], F);
    }
    // elevator
    const el: [number, number][] = [[0, 0], [1.3, 0.02], [1.45, 0.2], [1.2, 0.35], [0, 0.45]];
    b.extrude(el, { at: [s * 0.2, 1.47, -3.88], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.045, bevel: 0.005, color: P.skinBase, bone: eb });
    b.rod([s * 0.2, 1.5, -3.88], [s * 1.45, 1.5, -3.95], 0.007, P.line, { bone: eb });
    b.rod([s * 0.2, 1.5, -4.33], [s * 1.2, 1.5, -4.23], 0.006, P.line, { bone: eb });
    for (let i = 1; i < 5; i++) put(box(0.012, 0.006, 0.4), P.lineSoft, [s * i * 0.28, 1.5, -4.1], eb);
    if (s === 1) put(box(0.3, 0.012, 0.1), P.skinTop, [1.0, 1.5, -4.28], eb);
  }
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFuselage({ b, J, P, M }: Ctx) {
  const bone = J.fuselage;
  const R = rng(5);
  // stations: z, cy, hw, hh
  const ST: number[][] = [
    [3.5, 1.7, 0.38, 0.38], [3.0, 1.7, 0.43, 0.42], [2.2, 1.7, 0.45, 0.47],
    [1.4, 1.72, 0.44, 0.52], [0.4, 1.68, 0.42, 0.52], [-0.8, 1.62, 0.38, 0.5],
    [-2.0, 1.55, 0.3, 0.4], [-3.0, 1.5, 0.17, 0.28], [-3.7, 1.45, 0.08, 0.2],
  ];
  const sec = (z: number) => {
    for (let i = 0; i < ST.length - 1; i++) {
      const a = ST[i], c = ST[i + 1];
      if (z <= a[0] && z >= c[0]) {
        const t = (a[0] - z) / (a[0] - c[0]);
        return [0, 1, 2, 3].map((k) => a[k] + (c[k] - a[k]) * t);
      }
    }
    return ST[0];
  };
  // body loft, stations as ellipse rings
  b.loft(ST.map((s) => ({ at: [0, s[1], s[0]], w: s[2] * 2, h: s[3] * 2 })), { bone, color: P.skinBase, sides: 12 });
  // top deck and belly strips
  const topPts = ST.map((s) => [0, s[1] + s[3] * 0.93, s[0]]);
  b.sweep(topPts, [0.2, 0.05], { bone, color: P.skinTop, section: { ngon: 6 }, caps: "none" });
  const belPts = ST.map((s) => [0, s[1] - s[3] * 0.93, s[0]]);
  b.sweep(belPts, [0.22, 0.06], { bone, color: P.skinShade, section: { ngon: 6 }, caps: "none" });

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const ball = (r: number, c: string, at: number[], sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { bone, at, scale: sc });

  // spine dashed centre line
  for (let z = 3.3; z > -3.5; z -= 0.28) {
    const s = sec(z);
    box(0.02, 0.012, 0.14, P.lineFaint, [0, s[1] + s[3] * 0.99 + 0.005, z]);
  }
  // cowl seams and rivets
  for (const z of [3.3, 2.7, 2.2]) {
    const s = sec(z);
    for (const sg of [1, -1]) {
      for (let a = -50; a <= 50; a += 25) {
        const r = (a * Math.PI) / 180;
        box(0.012, 0.01, 0.0, P.line, [0, 0, 0]).mesh.visible = false;
        ball(0.012, P.lineSoft, [sg * s[2] * Math.cos(r) * 1.0, s[1] + s[3] * Math.sin(r), z]);
      }
    }
    // seam ring over the top
    b.sweep(
      Array.from({ length: 13 }, (_, i) => {
        const a = (-90 + i * 15) * Math.PI / 180 + Math.PI / 2;
        return [Math.cos(a) * s[2] * 1.01, s[1] + Math.sin(a) * s[3] * 1.01, z];
      }),
      0.005, P.line, { bone, caps: "none" },
    );
  }
  // flank rivet rows and panel line
  for (const sg of [1, -1]) {
    for (let z = 3.2; z > -3.4; z -= 0.22) {
      const s = sec(z);
      ball(0.01, P.lineSoft, [sg * s[2] * 0.99, s[1] + 0.05, z]);
      if (z < 1.3) ball(0.01, P.lineSoft, [sg * s[2] * 0.97, s[1] - s[3] * 0.4, z]);
    }
    b.sweep(ST.filter((s) => s[0] < 3.3).map((s) => [sg * s[2] * 1.0, s[1] - s[3] * 0.25, s[0]]), 0.004, P.line, { bone, caps: "none" });
    // gun bay lines
    b.sweep([[sg * 0.2, 2.17, 3.2], [sg * 0.2, 2.17, 1.5]].map((p) => p), 0.004, P.lineSoft, { bone });
    // exhaust stacks
    for (let i = 0; i < 6; i++) {
      const z = 2.0 + i * 0.2;
      const st = b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.14, 6), P.metalDark, { bone, at: [sg * 0.45, 1.78, z], rotation: [0, 0, -sg * 70] });
      ball(0.025, P.skinDeep, [sg * 0.52, 1.8, z], [1, 1, 1]);
    }
    // roundel
    const rx = sg * (sec(-2.4)[2] + 0.005);
    [[0.38, P.line], [0.3, P.skinDeep], [0.21, P.lineSoft], [0.11, P.roundelCore]].forEach(([r, c], i) => {
      b.part(new THREE.CylinderGeometry(r as number, r as number, 0.012, 14), c as string, { bone, at: [rx + sg * i * 0.003, 1.58, -2.4], rotation: [0, 0, -sg * 90] });
    });
    // code letters
    for (let k = 0; k < 4; k++) box(0.012, 0.16, 0.05, P.line, [sg * (sec(-1.4)[2] + 0.003), 1.62, -1.2 - k * 0.1]);
    box(0.012, 0.03, 0.4, P.lineSoft, [sg * (sec(-3.1)[2] + 0.003), 1.5, -3.1]);
    // wing root join line
    box(0.012, 0.012, 1.8, P.line, [sg * 0.43, 1.2, 0.0]);
  }
  // chin intake
  box(0.3, 0.2, 0.9, P.skinShade, [0, 1.36, 2.7]);
  box(0.22, 0.14, 0.12, P.skinDeep, [0, 1.36, 3.17]);
  box(0.28, 0.02, 0.02, P.lineSoft, [0, 1.46, 3.2]);
  box(0.28, 0.02, 0.02, P.lineSoft, [0, 1.26, 3.2]);
  ball(0.05, P.skinTop, [0, 2.2, 2.8], [1, 0.5, 1]);

  // cockpit
  box(0.64, 0.04, 1.5, P.skinDeep, [0, 2.2, 0.15]);
  // windscreen panes
  for (const x of [-0.17, 0, 0.17]) {
    box(0.15, 0.3, 0.02, P.glass, [x, 2.38, 1.2], [-35, 0, 0]);
  }
  for (const x of [-0.25, -0.085, 0.085, 0.25]) box(0.02, 0.32, 0.03, P.line, [x, 2.38, 1.2], [-35, 0, 0]);
  box(0.52, 0.02, 0.03, P.line, [0, 2.54, 1.1]);
  // canopy
  const can = b.part(new THREE.SphereGeometry(1, 10, 6), P.glass, { bone, at: [0, 2.2, -0.2], scale: [0.27, 0.42, 0.85] });
  b.part(new THREE.BoxGeometry(0.6, 0.03, 1.6), P.glassDark, { bone, at: [0, 2.22, -0.2] });
  for (const z of [0.4, -0.2, -0.8]) {
    b.sweep(Array.from({ length: 9 }, (_, i) => {
      const a = (i / 8) * Math.PI;
      const k = Math.sqrt(Math.max(0, 1 - ((z + 0.2) / 0.85) ** 2));
      return [Math.cos(a) * 0.275 * k, 2.2 + Math.sin(a) * 0.425 * k, z];
    }), 0.007, P.line, { bone, caps: "none" });
  }
  b.sweep([[0, 2.62, 0.62], [0, 2.62, -1.0]], 0.008, P.line, { bone });
  // head armour fairing
  b.sweep([[0, 2.3, -0.9], [0, 2.3, -1.6]], [0.16, 0.05], { bone, color: P.skinTop, caps: "round" });
  // gunsight
  box(0.1, 0.07, 0.06, P.accentCyan, [0, 2.26, 1.05]);
  // entry flap
  box(0.01, 0.2, 0.5, P.skinShade, [0.435, 1.95, -0.1]);
  box(0.02, 0.02, 0.08, P.metal, [0.445, 1.98, -0.25]);
  // mast
  b.sweep([[0, 2.12, 1.9], [0, 2.55, 1.9]], [0.012, 0.006], { bone, color: P.metal });
  ball(0.025, P.metal, [0, 2.56, 1.9]);
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const DIH = Math.tan((6 * Math.PI) / 180);
  // wing stations: x, leZ, teZ, cy, thick
  const ST = [
    [0.3, 1.25, -1.35, 1.12, 0.34],
    [0.45, 1.25, -1.35, 1.15, 0.32],
    [1.5, 1.2, -1.3, 1.26, 0.28],
    [3.0, 0.95, -1.15, 1.42, 0.2],
    [4.5, 0.45, -0.95, 1.58, 0.13],
    [5.3, -0.05, -0.75, 1.66, 0.09],
    [5.55, -0.35, -0.5, 1.69, 0.04],
  ];
  const interp = (x: number) => {
    for (let i = 0; i < ST.length - 1; i++) {
      const a = ST[i], c = ST[i + 1];
      if (x <= c[0]) {
        const t = (x - a[0]) / (c[0] - a[0]);
        return a.map((v, k) => v + (c[k] - v) * t);
      }
    }
    return ST[ST.length - 1];
  };
  const cyAt = (x: number) => interp(x)[3];
  const leAt = (x: number) => interp(x)[1];
  const teAt = (x: number) => interp(x)[2];
  const thAt = (x: number) => interp(x)[4];
  const box = (w: number, h: number, d: number, col: string, at: number[], bone = J.fuselage, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: at as any, rotation: rot as any });

  for (const s of [1, -1]) {
    // wing body: two lofts (inner and outer) with top/bottom layering
    const stations = ST.map((r) => ({ at: [s * r[0], r[3], (r[1] + r[2]) / 2] as [number, number, number], w: 0.02 + 0, h: r[4] }));
    // loft is along x; use w as chord (full), h as thickness
    const st = ST.map((r) => ({ at: [s * r[0], r[3], (r[1] + r[2]) / 2] as [number, number, number], w: r[1] - r[2], h: r[4] }));
    void stations;
    b.loft(st.map((q) => ({ at: q.at, w: q.h, h: q.w })), { bone: J.fuselage, color: P.skinBase, sides: 8 } as any);
    // flat chord orientation: use slabs for top and bottom skins
    const tx = [0.3, 1.5, 3.0, 4.5, 5.3, 5.55];
    const pts = (side: number) => {
      const out: number[][] = [];
      for (const x of tx) out.push([s * x, cyAt(x) + side * thAt(x) * 0.5, leAt(x)]);
      for (const x of [...tx].reverse()) out.push([s * x, cyAt(x) + side * thAt(x) * 0.5, teAt(x)]);
      return out;
    };
    void pts;
    // top panel strips (skinTop) along chord
    for (let i = 0; i < tx.length - 1; i++) {
      const x0 = tx[i], x1 = tx[i + 1];
      const xm = (x0 + x1) / 2, w = x1 - x0;
      const chord = leAt(xm) - teAt(xm);
      const ang = Math.atan2(cyAt(x1) - cyAt(x0), w);
      const top = box(w + 0.02, 0.02, chord * 0.98, P.skinTop, [s * xm, cyAt(xm) + thAt(xm) * 0.5, (leAt(xm) + teAt(xm)) / 2]);
      top.mesh.rotation.z = s * ang;
      const bot = box(w + 0.02, 0.02, chord * 0.98, P.skinShade, [s * xm, cyAt(xm) - thAt(xm) * 0.5, (leAt(xm) + teAt(xm)) / 2]);
      bot.mesh.rotation.z = s * ang;
    }
    // leading edge strip
    const lePts = [0.45, 1.5, 3.0, 4.5, 5.3, 5.55].map((x) => [s * x, cyAt(x), leAt(x) + 0.01] as [number, number, number]);
    b.sweep(lePts, 0.03, { bone: J.fuselage, color: P.line, sides: 5 });
    // rootfillet
    box(0.5, 0.2, 2.4, P.skinBase, [s * 0.4, 1.2, -0.05]);
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 6), P.skinTop, { bone: J.fuselage, at: [s * 0.55, 1.34, -0.05], rotation: [90, 0, 0] });
    // ribs
    for (let x = 0.7; x < 5.3; x += 0.35) {
      const ang = Math.atan2(DIH * 0 + (cyAt(x + 0.1) - cyAt(x)), 0.1);
      const le = leAt(x), te = teAt(x);
      const r = box(0.012, 0.008, (le - te) * 0.9, P.lineSoft, [s * x, cyAt(x) + thAt(x) * 0.5 + 0.012, (le + te) / 2]);
      void ang; void r;
    }
    // spar line & dashed span axis
    for (let x = 0.5; x < 5.4; x += 0.35) {
      box(0.3, 0.008, 0.012, P.lineSoft, [s * (x + 0.15), cyAt(x + 0.15) + thAt(x) * 0.5 + 0.013, (leAt(x) + teAt(x)) / 2 + 0.3]);
      if (Math.floor(x / 0.35) % 2 === 0) box(0.18, 0.006, 0.01, P.lineFaint, [s * x, cyAt(x) + thAt(x) * 0.5 + 0.015, (leAt(x) + teAt(x)) / 2 - 0.1]);
      // rivets
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.lineSoft, { bone: J.fuselage, at: [s * x, cyAt(x) + thAt(x) * 0.5 + 0.017, (leAt(x) + teAt(x)) / 2 + 0.3 - 0.04] });
    }
    // ailerons
    const aj = s > 0 ? J.aileronL : J.aileronR;
    const ax = (3.2 + 5.1) / 2;
    const hz = (a: number) => teAt(a) + (leAt(a) - teAt(a)) * 0.28;
    const ail = b.part(new THREE.BoxGeometry(1.9, 0.07, 0.38), P.skinBase, { bone: aj, at: [s * ax, cyAt(ax) + 0.0, (hz(ax) + teAt(ax)) / 2 - 0.01] });
    void ail;
    box(1.9, 0.012, 0.012, P.line, [s * ax, cyAt(ax) + 0.04, hz(ax)], aj);
    box(1.9, 0.012, 0.012, P.line, [s * ax, cyAt(ax) + 0.04, teAt(ax) + 0.01], aj);
    for (const x of [3.2, 5.1]) box(0.012, 0.012, 0.38, P.line, [s * x, cyAt(x) + 0.04, (hz(x) + teAt(x)) / 2], aj);
    for (let x = 3.4; x < 5.1; x += 0.22) box(0.01, 0.01, 0.36, P.lineSoft, [s * x, cyAt(x) + 0.042, (hz(x) + teAt(x)) / 2], aj);
    // flaps
    const fx = 1.65;
    box(1.9, 0.02, 0.4, P.skinShade, [s * fx, cyAt(fx) - thAt(fx) * 0.5 - 0.02, teAt(fx) + 0.25]);
    box(1.9, 0.014, 0.03, P.skinDeep, [s * fx, cyAt(fx) - thAt(fx) * 0.5 - 0.03, teAt(fx) + 0.46]);
    box(1.9, 0.012, 0.012, P.line, [s * fx, cyAt(fx) - thAt(fx) * 0.5 - 0.032, teAt(fx) + 0.04]);
    // guns
    for (let i = 0; i < 4; i++) {
      const x = 1.6 + i * 0.5;
      const z = leAt(x);
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), P.metalDark, { bone: J.fuselage, at: [s * x, cyAt(x), z + 0.1], rotation: [90, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), P.skinDeep, { bone: J.fuselage, at: [s * x, cyAt(x), z + 0.0], rotation: [90, 0, 0] });
      box(0.05, 0.012, 0.16, P.skinDeep, [s * x, cyAt(x) - thAt(x) * 0.5 - 0.035, z - 0.4]);
    }
    // wheel well outline
    box(0.6, 0.012, 0.03, P.skinDeep, [s * 1.0, cyAt(1) - thAt(1) * 0.5 - 0.035, 0.2]);
    box(0.6, 0.012, 0.03, P.skinDeep, [s * 1.0, cyAt(1) - thAt(1) * 0.5 - 0.035, 0.8]);
    box(0.4, 0.012, 0.6, P.skinDeep, [s * 1.0, cyAt(1) - thAt(1) * 0.5 - 0.03, 0.5]);
    // roundels
    const rd = [P.line, P.skinDeep, P.lineSoft, P.roundelCore];
    const rr = [0.5, 0.42, 0.3, 0.16];
    for (const side of [1, -1]) {
      const x = 3.7, y = cyAt(x) + side * (thAt(x) * 0.5 + 0.015), z = (leAt(x) + teAt(x)) / 2 + 0.1;
      rd.forEach((c, k) => b.part(new THREE.CylinderGeometry(rr[k], rr[k], 0.008 + k * 0.004, 16), c, { bone: J.fuselage, at: [s * x, y + side * k * 0.004, z] }));
    }
    // tip nav light
    b.part(new THREE.SphereGeometry(0.06, 6, 5), P.accentCyan, { bone: J.fuselage, at: [s * 5.58, 1.69, -0.4] });
    // tip cap
    b.part(new THREE.SphereGeometry(0.07, 6, 5), P.skinTop, { bone: J.fuselage, at: [s * 5.52, 1.69, -0.42], scale: [1, 0.6, 5] });
  }
  // coolers
  const cool = (s: number, col: string) => {
    const x = s * 2.4, y = cyAt(2.4) - thAt(2.4) * 0.5 - 0.12;
    box(0.5, 0.24, 0.6, P.skinShade, [x, y, 0.0]);
    box(0.4, 0.16, 0.02, P.skinDeep, [x, y, 0.31]);
    box(0.4, 0.14, 0.01, col, [x, y, 0.325]);
    box(0.54, 0.02, 0.02, P.line, [x, y + 0.12, 0.3]);
    box(0.54, 0.02, 0.02, P.line, [x, y - 0.12, 0.3]);
    for (let k = -2; k <= 2; k++) box(0.012, 0.14, 0.012, P.skinDeep, [x + k * 0.07, y, 0.332]);
  };
  cool(1, P.metal);
  cool(-1, P.metalDark);
  // landing light
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), P.glass, { bone: J.fuselage, at: [2.0, cyAt(2.0) - 0.04, leAt(2.0) + 0.0], rotation: [90, 0, 0] });
  // pitot
  b.part(new THREE.CylinderGeometry(0.015, 0.02, 0.5, 6), P.metal, { bone: J.fuselage, at: [3.3, 1.28, 0.75], rotation: [90, 0, 0] });
  box(0.02, 0.2, 0.02, P.metal, [3.3, 1.35, 0.5]);
  void frame; void R;
}
```