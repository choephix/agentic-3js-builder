<!-- call: plan -->

```json
{
  "name": "Spitfire Cyanotype Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter standing on its main wheels and tailwheel, rendered as a cyanotype blueprint: every surface in Prussian-blue tones with white drafting linework, rivets and panel lines as small parts.",
  "builderName": "spitfireBlueprint",
  "size": [11.2, 3.35, 9.15],
  "layout": "Real Spitfire Mk I size (about 11.2 m span, 9.1 m long) in a three-point ground stance. Fuselage axis is horizontal at y=1.75, nose toward +Z. From front to back: three-blade propeller disc at z=4.0 (radius 1.6, tips clear the floor by 0.15 m), a white-tipped spinner, a round Merlin cowl with 6 fishtail exhaust stacks per side, the long slim fuselage, a framed bubble canopy at z -1.7..1.0, a turtleback fairing, then the tail cone carrying a tall rounded fin and elliptical tailplane. Low elliptical wings (dihedral about 6 degrees, root y=1.22 rising to y=1.62 at the tips) with a straight leading edge and a curved trailing edge. They carry an oil cooler under the left wing (+X) and a radiator under the right wing (-X), four gun barrels in each leading edge, and ailerons and flaps. Main gear legs splay outward to wheels at x=+-1.4, z=0.6; the tailwheel sits at z=-4.05. Nothing else is on the floor and there is no ground plane.\n\nSTYLE: everything is cyanotype blue. Underside = light sky blue (skyPale/sky), top and side skin = cobalt with disruptive camouflage patches of prussian, darker shadow zones in navy, deepest ink for tyres, exhaust, gaps and recesses. Linework is WHITE and pale: panel lines, rib lines, stringers, rivet rows, control-surface hinge lines and bright edge trim along leading edges and tips are thin small parts seated on the surface, so the plane reads as white drafting lines on blue paper. Roundels are concentric flat discs (outer navy ring, pale ring, sky ring, white centre); the fin flash is three vertical bands (sky, white, navy). Details are fine and fussy; the silhouette stays simple, blocky and bold. Glowing cyan (cyanGlow, via the glow kit) is used only for the gunsight reflector and the wingtip and tail lights. Colour by place: lighter on top, darker below, soot at the exhausts, a pale chipped strip on the wing-root walkway.",
  "palette": {
    "ink": "#04122e",
    "navy": "#071f4a",
    "prussian": "#0b2a5b",
    "cobalt": "#1b4fa8",
    "blue": "#2e6fd1",
    "sky": "#5b9bf0",
    "skyPale": "#9cc8ff",
    "pale": "#cfe6ff",
    "white": "#f4fbff",
    "glass": "#7fb8ff",
    "steel": "#4a78c0",
    "gunmetal": "#13347a",
    "cyanGlow": "#6fe3ff"
  },
  "mounts": {
    "thrustOrigin": [0, 1.75, 0],
    "propHub": [0, 1.75, 4.0],
    "cowlFront": [0, 1.75, 3.95],
    "deckTop": [0, 2.1, -0.3],
    "windscreenBase": [0, 2.1, 1.0],
    "canopyRear": [0, 2.1, -1.7],
    "wingRootL": [0.5, 1.22, -0.1],
    "wingRootR": [-0.5, 1.22, -0.1],
    "wingTipL": [5.6, 1.62, 0.0],
    "wingTipR": [-5.6, 1.62, 0.0],
    "aileronHingeL": [3.0, 1.4, -0.72],
    "aileronHingeR": [-3.0, 1.4, -0.72],
    "gearHipL": [1.0, 1.12, 0.5],
    "gearHipR": [-1.0, 1.12, 0.5],
    "wheelAxleL": [1.4, 0.34, 0.6],
    "wheelAxleR": [-1.4, 0.34, 0.6],
    "tailBase": [0, 1.72, -3.7],
    "rudderHinge": [0, 1.8, -4.28],
    "tailplaneCenter": [0, 1.78, -4.0],
    "finTop": [0, 3.3, -4.35],
    "tailwheelAxle": [0, 0.12, -4.05],
    "tailwheelHip": [0, 1.5, -3.9]
  },
  "joints": [
    { "name": "body", "at": [0, 1.75, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "prop", "parent": "body", "at": [0, 1.75, 4.0], "dir": [0, 0, 1], "role": "fan", "group": "prop" },
    { "name": "canopy", "parent": "body", "at": [0, 2.1, 0.7], "dir": [0, 0, -1], "role": "hinge", "group": "cockpit" },
    { "name": "wingL", "parent": "body", "at": [0.5, 1.22, -0.1], "dir": [1, 0.07, 0], "role": "wing", "group": "wings" },
    { "name": "wingR", "parent": "body", "at": [-0.5, 1.22, -0.1], "dir": [-1, 0.07, 0], "role": "wing", "group": "wings" },
    { "name": "aileronL", "parent": "wingL", "at": [3.0, 1.4, -0.72], "dir": [1, 0.07, 0], "role": "hinge", "group": "wings" },
    { "name": "aileronR", "parent": "wingR", "at": [-3.0, 1.4, -0.72], "dir": [-1, 0.07, 0], "role": "hinge", "group": "wings" },
    { "name": "legL", "parent": "wingL", "at": [1.0, 1.12, 0.5], "dir": [0.45, -0.88, 0.11], "role": "leg", "group": "gear" },
    { "name": "wheelL", "parent": "legL", "at": [1.4, 0.34, 0.6], "dir": [1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "legR", "parent": "wingR", "at": [-1.0, 1.12, 0.5], "dir": [-0.45, -0.88, 0.11], "role": "leg", "group": "gear" },
    { "name": "wheelR", "parent": "legR", "at": [-1.4, 0.34, 0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "rudder", "parent": "body", "at": [0, 1.8, -4.28], "dir": [0, 1, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorL", "parent": "body", "at": [0.25, 1.78, -4.2], "dir": [1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorR", "parent": "body", "at": [-0.25, 1.78, -4.2], "dir": [-1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "tailwheel", "parent": "body", "at": [0, 1.5, -3.9], "dir": [0, -1, -0.1], "role": "leg", "group": "tail" }
  ],
  "parts": [
    {
      "id": "fuselage",
      "builds": "The whole fuselage skin and its surface detail, from the cowl to the tail-cone end. Loft stations (z, half-width, top y, bottom y): z3.95 cowl ring r~0.5 centred y1.75; z3.0 hw0.52 top2.3 bot1.22; z1.5 hw0.55 top2.28 bot1.12; z0.5 hw0.55 top2.1 bot1.1; z-1.0 hw0.5 top2.1 bot1.2; z-1.7 hw0.42 top2.05; z-3.0 hw0.25 top1.95 bot1.45; z-4.45 hw0.06 top1.82 bot1.6. The upper deck is flat at y=2.1 from z=-1.7 to z=1.0 so the cockpit part sits on it (the cockpit rises from the sill at y=2.0..2.1). A turtleback fairing sits behind the canopy (z-1.7..-2.8) and slopes down into the tail cone. Colours: upper half cobalt with prussian disruptive patches, lower half skyPale with a wavy demarcation line in white, a navy chin under the nose. Details: cowl nose ring plus cowl panel seam bands and ~16 white cowl fastener dots in rings; 6 fishtail exhaust stacks on each side of the cowl at z 2.4..3.3 (ink pipes with navy soot streaks behind them); small bulged cannon-blister bumps; oil-tank carb scoop under the nose at z 2.0..2.8 (navy frame, ink opening); aerial mast (white rod with a pale tip) at z=1.7 on the top deck, up to y 2.7, with a wire sweeping back to the tail (thin white sweep); white panel lines, access hatches, stringers and rivet rows along the sides; two roundels on the fuselage sides at z=-2.3 (outer navy, pale, sky, white centre discs seated on the surface, x=+-0.3 surface); blocky white serial and squadron code letters (e.g. 'QJ' and 'K', built as box strokes) either side of the roundel; a wing-root fairing strip (pale walkway) where the wings join (z -0.9..0.7, y about 1.2); a spine light on the tail cone top. No propeller, wings, cockpit glazing or tail surfaces.",
      "box": [[-0.62, 1.1, -4.5], [0.62, 2.75, 3.95]],
      "attaches": "Cowl front meets the spinner at mount cowlFront; deck meets the cockpit at deckTop, windscreenBase and canopyRear; wing roots enter at wingRootL and wingRootR (wing roots are buried inside the fuselage sides); tail cone end meets the fin and tailplane at tailBase.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cockpit",
      "builds": "The cockpit and canopy, on top of the fuselage deck. A sliding-hood bubble canopy shown as a white frame structure (curved hoops, a longitudinal rail, a bottom sill rail, a rear glazing frame), the side panes left open as a framework (blueprint skeleton) with only thin pale glass panes (glass colour) inside the windscreen: a bulletproof flat centre panel and two raked side panels, white frame bars. The canopy rides the canopy joint and the windscreen the body joint. Inside: a bucket seat (prussian, with pale cushion), an armour plate and headrest behind it, a pilot bust (navy flying suit, skyPale face, dark goggles, ink helmet with white strap, an arm to the stick), a control stick with a ring grip, a rudder pedal pair, an instrument panel with round gauge discs (a few as textured dials from white rings and tick marks, or built from small ring parts) and a white edge, a gunsight with a glowing cyanGlow reflector glass, a rear-view mirror on the hood top and a sliding-hood handle. A thin white outline sweep traces the canopy edge for the drafting look.",
      "box": [[-0.42, 2.0, -1.75], [0.42, 2.65, 1.05]],
      "attaches": "Sits on the fuselage deck, between windscreenBase (front) and canopyRear (back), at deckTop height y=2.1; frames sink slightly into the sill.",
      "joints": ["canopy", "body"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "wings",
      "builds": "Both elliptical wings as mirrored builds, left (+X) and right (-X). Planform: leading edge runs from (0.5,1.3,1.2) at the root to (5.6,1.65,0.3) at the tip; trailing edge from (0.5,1.15,-1.4) to (5.6,1.6,-0.25) with an elliptical bulge (about z -0.95 at x=3). Root thickness 0.3 tapering to 0.08 at the tip, dihedral about 6 degrees (root y1.22, tip y1.62). Built as lofted or extruded slab with a rounded leading edge; upper surface cobalt with prussian camouflage patches, underside skyPale. Ailerons on the outer trailing edge (x 3.0..5.1) ride the aileronL and aileronR joints; flaps on the inner trailing edge (x 0.9..2.9) are shown in sky with white hinge lines. Details: white rib lines across the wing at regular spacing, rivet rows, a pale leading edge trim, a pale wing-root walkway panel, an upper-surface roundel at x=+-3.3, z=-0.1 (concentric discs navy, pale, sky, white) and an underside roundel, an oil cooler scoop under the left wing at x=2.2 (round-ish, steel with an ink opening) and a rectangular radiator under the right wing at x=-2.2 (blue box with a white outline and an ink intake), four .303 gun barrels per wing at x=+-1.7, +-1.95, +-2.2 and +-2.45 poking 0.12 m ahead of the leading edge (gunmetal tubes with ink muzzle holes and pale taped ports), a pitot tube on the left leading edge at x=3.6, cannon bulge fairings on the upper surface, navigation lights at the tips (glowing cyanGlow), and a tip trim cap in white. No landing gear.",
      "box": [[-5.6, 0.9, -1.45], [5.6, 1.7, 1.7]],
      "attaches": "Roots are buried in the fuselage sides at wingRootL and wingRootR; wing tips end at wingTipL and wingTipR; gear hips pass through the underside at gearHipL and gearHipR (gear part owns the leg and doors); ailerons hinge at aileronHingeL and aileronHingeR.",
      "joints": ["wingL", "wingR", "aileronL", "aileronR", "body"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "tail",
      "builds": "The whole empennage and the tailwheel. A tall rounded Spitfire fin extruded from the tail cone up to finTop at y=3.3 (leading edge swept back from z=-3.5 at the base to z=-4.0 at the top), with the rudder (rides the rudder joint, a hinged rib-lined panel with a balance horn and a trim tab, white rib lines) behind it. The fin flash is three vertical bands (sky, white, navy) on both sides of the fin leading edge. An elliptical tailplane (span 3.2, root chord 1.0, centred at tailplaneCenter) with elevators (ride elevatorL and elevatorR, with trim tabs and white rib lines) on the trailing edge; upper surface cobalt, underside skyPale, white hinge lines, rivet rows and pale edge trim. A fin-root fillet blends fin and tail cone. Tailwheel assembly on the tailwheel joint: a short oleo strut from tailwheelHip (0,1.5,-3.9) to tailwheelAxle (0,0.12,-4.05), a fork, an ink tyre of radius 0.12 with a pale hub that touches y=0, and a small fairing. A rear navigation light on the fin trailing edge in cyanGlow, and white drafting trim along the fin leading edge.",
      "box": [[-1.7, 0, -4.55], [1.7, 3.3, -3.4]],
      "attaches": "Fin and tailplane roots sink into the tail cone at tailBase; the tailplane is centred on tailplaneCenter; the rudder hinges at rudderHinge; the strut starts at tailwheelHip under the tail cone and the wheel rests at tailwheelAxle with the floor at y=0.",
      "joints": ["rudder", "elevatorL", "elevatorR", "tailwheel", "body"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "propGear",
      "builds": "The propeller group and the main undercarriage. Propeller on the prop joint at propHub (0,1.75,4.0): a spun spinner (lathe, 0.7 m long from z 3.95 to 4.65, prussian with a white band and a pale tip) with a ring of pale bolt dots, a back plate, a hub with a blade-root cuff on each blade, and three wide blades of radius 1.6 at 120 degrees apart (one pointing straight up), each with a pitch twist, a leading edge in white trim, blade body navy to prussian, a pale tip band at the outer 0.2 m and a stencilled white line near the root. Main gear: for each side a leg on legL and legR from the gear hip (+-1.0,1.12,0.5) to the wheel axle (+-1.4,0.34,0.6): a chunky oleo strut (steel, pale chrome collar, navy scissor link), a leg fairing door (extruded D-shape, cobalt with white edge lines and rivets) hanging outboard, and a wheel on the wheelL and wheelR joints (ink tyre, radius 0.34, width 0.18, a chunky tread ring in navy, a pale hub disc with 5 spoke or bolt dots, axle cap) with a bearing axle stub and a small wheel-well flap on the underside skin. The lowest points of the wheels rest at y=0 (centres at y=0.34), and the propeller tips clear the floor by 0.15 m.",
      "box": [[-1.7, 0, 0.1], [1.7, 3.35, 4.65]],
      "attaches": "The spinner back plate meets the cowl at cowlFront and the hub spins about propHub; leg tops sink into the wing underside at gearHipL and gearHipR; wheels centre on wheelAxleL and wheelAxleR. This box overlaps the fuselage and wing boxes in x and z, but the geometry stays in the propeller disc and the gear zone (z 0.1..1.0).",
      "joints": ["prop", "legL", "wheelL", "legR", "wheelR"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Flat outline in (z, y) drawn in the side view, extruded across x
  const fin = (pts: number[][], color: string, bone: any, x = 0, th = 0.07) =>
    b.extrude(pts, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: th, color, bone, smoothing: 1 });

  // Fin (rounded, swept)
  fin([[-3.45, 1.7], [-3.55, 2.4], [-3.85, 3.1], [-4.1, 3.3], [-4.3, 3.15], [-4.3, 1.8]], P.cobalt, J.body, 0, 0.09);
  // Fin-root fillet
  b.part(new THREE.BoxGeometry(0.2, 0.18, 0.7), P.prussian, { bone: J.body, at: [0, 1.9, -3.85] });
  // Fin leading edge trim
  b.rod([0, 1.75, -3.47], [0, 3.1, -3.92], 0.02, P.pale, { bone: J.body });

  // Fin flash bands on both sides
  [P.sky, P.white, P.navy].forEach((c, i) => {
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.012, 0.8, 0.07), c, { bone: J.body, at: [s * 0.05, 2.45, -3.7 - i * 0.07 - 0.1] });
  });

  // Rudder on joint
  const rud = [[-4.3, 0.0], [-4.3, 1.35], [-4.2, 1.5], [-4.45, 1.35], [-4.55, 0.7], [-4.45, 0.0]];
  b.extrude(rud, { at: [0, 1.8, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, color: P.blue, bone: J.rudder, smoothing: 1 });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.075, 0.015, 0.22), P.white, { bone: J.rudder, at: [0, 1.95 + i * 0.25, -4.38] });
  b.part(new THREE.BoxGeometry(0.075, 0.015, 0.2), P.white, { bone: J.rudder, at: [0, 1.82, -4.4] });
  b.part(new THREE.BoxGeometry(0.08, 0.14, 0.12), P.sky, { bone: J.rudder, at: [0, 2.3, -4.53] });
  // Rear nav light
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.cyanGlow, { bone: J.rudder, at: [0, 3.1, -4.4] }), 1.5);

  // Tailplane and elevators
  for (const s of [1, -1]) {
    const J_E = s > 0 ? J.elevatorL : J.elevatorR;
    const plan = [[-3.8, 0], [-3.7, 0.9], [-3.9, 1.5], [-4.1, 1.6], [-4.2, 1.4], [-4.2, 0.9], [-4.15, 0]];
    // plan in (z, x); stabiliser
    const st = [[0, -3.75], [0.8, -3.7], [1.4, -3.85], [1.6, -4.0], [1.35, -4.05], [0.8, -4.05], [0, -4.05]];
    const shape = new THREE.Shape();
    st.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
    g.rotateX(Math.PI / 2); // x stays, shape y -> -z, depth -> -y
    g.translate(0, 0.03, 0);
    b.part(g, P.cobalt, { bone: J.body, at: [0, 1.78, 0], scale: [s, 1, 1] });
    b.part(new THREE.BoxGeometry(1.35, 0.01, 0.9), P.skyPale, { bone: J.body, at: [s * 0.8, 1.745, -3.9] });
    // elevator
    b.part(new THREE.BoxGeometry(1.3, 0.05, 0.4), P.blue, { bone: J_E, at: [s * 0.9, 1.78, -4.2] });
    for (let i = 0; i < 5; i++)
      b.part(new THREE.BoxGeometry(0.012, 0.015, 0.4), P.white, { bone: J_E, at: [s * (0.35 + i * 0.25), 1.81, -4.2] });
    b.part(new THREE.BoxGeometry(0.3, 0.02, 0.1), P.sky, { bone: J_E, at: [s * 1.25, 1.8, -4.38] });
    // hinge line, edge trim, rivets
    b.part(new THREE.BoxGeometry(1.4, 0.012, 0.015), P.white, { bone: J.body, at: [s * 0.85, 1.815, -4.0] });
    b.part(new THREE.BoxGeometry(0.02, 0.07, 0.3), P.pale, { bone: J.body, at: [s * 1.6, 1.78, -3.95] });
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.012, 4, 3), P.white, { bone: J.body, at: [s * (0.3 + i * 0.22), 1.815, -3.85] });
  }

  // Tailwheel
  const T = J.tailwheel;
  b.rod([0, 1.5, -3.9], [0, 0.22, -4.04], 0.045, P.steel, { bone: T });
  b.rod([0, 0.9, -3.97], [0, 0.6, -4.0], 0.06, P.pale, { bone: T });
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.18), P.navy, { bone: T, at: [0, 1.45, -3.9] });
  for (const s of [1, -1]) b.rod([s * 0.06, 0.28, -4.04], [s * 0.06, 0.12, -4.05], 0.016, P.steel, { bone: T });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), P.ink, { bone: T, at: [0, 0.12, -4.05], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 8), P.pale, { bone: T, at: [0, 0.12, -4.05], dir: [1, 0, 0] });
}
```

<!-- call: propGear -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPropGear({ b, J, P, M }: any) {
  const hub: number[] = M.propHub;

  // ---------- propeller ----------
  const spin = b.lathe(
    [[0, 0], [0.5, 0], [0.52, 0.05], [0.42, 0.3], [0.25, 0.55], [0.1, 0.68], [0, 0.7]],
    { at: [hub[0], hub[1], hub[2] - 0.05], axis: [0, 0, 1], bone: J.prop, color: P.prussian, segments: 16 },
  );
  // white band
  b.lathe([[0, 0.17], [0.47, 0.17], [0.455, 0.25], [0, 0.25]], { at: [hub[0], hub[1], hub[2] - 0.05], axis: [0, 0, 1], bone: J.prop, color: P.white, segments: 16 });
  // pale tip
  b.part(new THREE.SphereGeometry(0.07, 8, 6), P.pale, { bone: J.prop, at: [hub[0], hub[1], hub[2] + 0.64] });
  // back plate
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 20), P.navy, { bone: J.prop, at: [hub[0], hub[1], hub[2] - 0.03], dir: [0, 0, 1] });
  // bolt dots
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.pale, {
      bone: J.prop,
      at: [hub[0] + Math.sin(a) * 0.46, hub[1] + Math.cos(a) * 0.46, hub[2] + 0.005],
    });
  }
  // blades
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const ux = -Math.sin(a), uy = Math.cos(a); // radial direction (x flipped for model)
    const rx = Math.cos(a), ry = Math.sin(a);
    const pt = (r: number, w: number, z: number) => [hub[0] + ux * r + rx * w, hub[1] + uy * r + ry * w, hub[2] + z];
    const outline: [number, number][] = [
      [0.3, -0.05], [0.6, -0.17], [1.1, -0.2], [1.45, -0.14], [1.6, -0.04], [1.6, 0.04], [1.45, 0.14], [1.1, 0.15], [0.6, 0.1], [0.3, 0.05],
    ];
    const xdir = [ux, uy, 0];
    const ydir = [rx, ry, 0];
    const blade = b.extrude(outline, {
      at: [hub[0], hub[1], hub[2] + 0.06], x: xdir, y: ydir, thickness: 0.035, bevel: 0.008,
      bone: J.prop, color: P.navy, smoothing: 1,
    });
    // pitch twist
    blade.mesh.rotateOnAxis(new THREE.Vector3(ux, uy, 0), 0.0);
    // leading edge trim
    b.rod(pt(0.45, 0.13, 0.07), pt(1.52, 0.13, 0.07), 0.012, P.white, { bone: J.prop });
    b.rod(pt(0.45, -0.01, 0.07), pt(1.55, 0.0, 0.07), 0.01, P.prussian, { bone: J.prop });
    // tip band
    b.rod(pt(1.4, 0.0, 0.085), pt(1.58, 0.0, 0.085), 0.045, P.pale, { bone: J.prop });
    // root stencil
    b.rod(pt(0.65, -0.12, 0.082), pt(0.65, 0.1, 0.082), 0.01, P.white, { bone: J.prop });
    // root cuff
    b.rod(pt(0.25, 0, 0.05), pt(0.5, 0, 0.05), 0.07, P.steel, { bone: J.prop });
  }

  // ---------- main gear ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? J.legL : J.legR;
    const W = s > 0 ? J.wheelL : J.wheelR;
    const hip = [s * 1.0, 1.12, 0.5];
    const ax = [s * 1.4, 0.34, 0.6];
    b.rod(hip, ax, [0.07, 0.055], P.steel, { bone: L, sides: 8 });
    // upper chunky oleo
    b.rod(hip, [s * 1.12, 0.9, 0.53], 0.095, P.steel, { bone: L, sides: 8 });
    // chrome collar
    b.rod([s * 1.14, 0.87, 0.53], [s * 1.18, 0.8, 0.54], 0.1, P.pale, { bone: L, sides: 8 });
    // scissor links
    b.rod([s * 1.12, 0.85, 0.6], [s * 1.25, 0.6, 0.62], 0.02, P.navy, { bone: L });
    b.rod([s * 1.25, 0.6, 0.62], [s * 1.18, 0.5, 0.58], 0.02, P.navy, { bone: L });
    // fairing door
    const door = b.extrude(
      [[0, 0], [0.5, 0], [0.62, 0.3], [0.5, 0.75], [0, 0.85], [-0.02, 0.4]],
      { at: [s * 1.2 + s * 0.06, 0.3, 0.42], x: [0, 0, 1], y: [s * 0.2, 1, 0], thickness: 0.03, bevel: 0.006, bone: L, color: P.cobalt, smoothing: 1 },
    );
    void door;
    b.rod([s * 1.26, 0.32, 0.43], [s * 1.34, 1.1, 0.43], 0.012, P.white, { bone: L });
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.white, { bone: L, at: [s * (1.29 + i * 0.012), 0.45 + i * 0.12, 0.43 + (i % 2) * 0.12] });
    }
    // wheel flap on wing underside
    b.part(new THREE.BoxGeometry(0.4, 0.03, 0.5), P.sky, { bone: L, at: [s * 1.05, 1.1, 0.5] });
    // axle stub
    b.rod([s * 1.3, 0.34, 0.6], [s * 1.55, 0.34, 0.6], 0.05, P.steel, { bone: W });
    // wheel
    const dir = [1, 0, 0];
    const c = [s * 1.4, 0.34, 0.6];
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 18), P.ink, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.345, 0.345, 0.12, 12), P.navy, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.2, 14), P.pale, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.215, 10), P.steel, { bone: W, at: c, dir });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.white, { bone: W, at: [s * 1.5, 0.34, 0.6] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.022, 5, 4), P.white, {
        bone: W,
        at: [s * 1.505, 0.34 + Math.cos(a) * 0.16, 0.6 + Math.sin(a) * 0.16],
      });
    }
  }
}
```

<!-- call: cockpit -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCockpit({ b, J, P, M }: any) {
  const body = J.body, canopy = J.canopy;
  const Y = 2.1;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], bone: any, rot?: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, rotation: rot });
  const rod = (a: number[], z: number[], r: number, c: string, bone: any) =>
    b.rod(a, z, r, c, { bone, sides: 6 });

  // sill rails
  for (const s of [1, -1]) {
    rod([s * 0.4, Y + 0.02, 0.95], [s * 0.4, Y + 0.02, -1.7], 0.02, P.white, canopy);
    rod([s * 0.3, Y + 0.45, 0.6], [s * 0.26, Y + 0.5, -1.2], 0.016, P.white, canopy);
  }
  rod([0, Y + 0.5, 0.6], [0, Y + 0.5, -1.2], 0.018, P.white, canopy);
  // hoops
  for (const z of [0.4, -0.2, -0.8, -1.4]) {
    const k = z < -1 ? 0.8 : 1;
    const pts = [
      [0.4, Y + 0.02, z], [0.38, Y + 0.25, z], [0.28, Y + 0.45 * k + 0.03, z], [0, Y + 0.52 * k, z],
      [-0.28, Y + 0.45 * k + 0.03, z], [-0.38, Y + 0.25, z], [-0.4, Y + 0.02, z],
    ];
    b.sweep(pts, 0.016, { color: P.white, bone: canopy, sides: 6 });
  }
  // rear frame
  rod([0.4, Y + 0.02, -1.7], [-0.4, Y + 0.02, -1.7], 0.02, P.white, canopy);
  rod([0.3, Y + 0.35, -1.65], [-0.3, Y + 0.35, -1.65], 0.015, P.white, canopy);
  box(0.5, 0.2, 0.01, P.glass, [0, Y + 0.2, -1.66], canopy);
  // handle and mirror
  rod([0.3, Y + 0.3, 0.5], [0.3, Y + 0.3, 0.3], 0.014, P.pale, canopy);
  box(0.1, 0.05, 0.03, P.steel, [0, Y + 0.57, 0.62], canopy);
  rod([0, Y + 0.52, 0.6], [0, Y + 0.56, 0.62], 0.01, P.white, canopy);

  // windscreen (body)
  const wx = 0.38;
  rod([wx, Y, 1.0], [0.14, Y + 0.42, 0.62], 0.02, P.white, body);
  rod([-wx, Y, 1.0], [-0.14, Y + 0.42, 0.62], 0.02, P.white, body);
  rod([0.14, Y, 1.0], [0.14, Y + 0.42, 0.66], 0.016, P.white, body);
  rod([-0.14, Y, 1.0], [-0.14, Y + 0.42, 0.66], 0.016, P.white, body);
  rod([0.14, Y + 0.42, 0.64], [-0.14, Y + 0.42, 0.64], 0.018, P.white, body);
  rod([wx, Y, 1.0], [-wx, Y, 1.0], 0.02, P.white, body);
  box(0.26, 0.4, 0.01, P.glass, [0, Y + 0.21, 0.82], body, [-38, 0, 0]);
  for (const s of [1, -1]) {
    const m = b.part(new THREE.BoxGeometry(0.25, 0.4, 0.01), P.glass, { bone: body, at: [s * 0.26, Y + 0.2, 0.82], rotation: [-38, 0, s * 22] });
  }

  // seat, armour, headrest
  box(0.4, 0.06, 0.4, P.prussian, [0, Y + 0.04, -0.55], body);
  box(0.36, 0.04, 0.34, P.pale, [0, Y + 0.09, -0.5], body);
  box(0.4, 0.5, 0.05, P.prussian, [0, Y + 0.3, -0.8], body, [-8, 0, 0]);
  box(0.34, 0.45, 0.02, P.steel, [0, Y + 0.32, -0.86], body, [-8, 0, 0]);
  box(0.2, 0.14, 0.06, P.pale, [0, Y + 0.6, -0.84], body);

  // pilot
  box(0.32, 0.34, 0.2, P.navy, [0, Y + 0.3, -0.62], body);
  b.part(new THREE.SphereGeometry(0.11, 8, 6), P.skyPale, { bone: body, at: [0, Y + 0.6, -0.6] });
  b.part(new THREE.SphereGeometry(0.125, 8, 6, 0, Math.PI * 2, 0, 1.6), P.ink, { bone: body, at: [0, Y + 0.62, -0.62] });
  box(0.2, 0.05, 0.03, P.ink, [0, Y + 0.62, -0.5], body);
  box(0.215, 0.015, 0.2, P.white, [0, Y + 0.65, -0.6], body);
  for (const s of [1, -1]) cyl(0.03, 0.02, P.glass, [s * 0.05, Y + 0.62, -0.5], body, [90, 0, 0]);
  rod([0.17, Y + 0.4, -0.6], [0.06, Y + 0.2, -0.2], 0.035, P.navy, body);
  b.part(new THREE.SphereGeometry(0.04, 6, 5), P.skyPale, { bone: body, at: [0.06, Y + 0.18, -0.2] });
  rod([-0.17, Y + 0.4, -0.6], [-0.16, Y + 0.2, -0.3], 0.035, P.navy, body);

  // stick
  rod([0.06, Y + 0.02, -0.1], [0.06, Y + 0.3, -0.18], 0.015, P.steel, body);
  b.part(new THREE.TorusGeometry(0.04, 0.01, 5, 8), P.ink, { bone: body, at: [0.06, Y + 0.33, -0.19], rotation: [60, 0, 0] });

  // pedals
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.02, P.steel, [s * 0.1, Y + 0.08, 0.3], body, [-30, 0, 0]);
    rod([s * 0.1, Y + 0.02, 0.2], [s * 0.1, Y + 0.08, 0.3], 0.012, P.pale, body);
  }

  // instrument panel
  box(0.66, 0.26, 0.04, P.navy, [0, Y + 0.2, 0.55], body, [-20, 0, 0]);
  box(0.68, 0.015, 0.05, P.white, [0, Y + 0.34, 0.56], body);
  const gauges = [[-0.2, 0.26], [0, 0.26], [0.2, 0.26], [-0.1, 0.14], [0.1, 0.14]];
  for (const [gx, gy] of gauges) {
    const at = [gx, Y + gy - 0.03, 0.535 - (gy - 0.14) * 0.0];
    b.part(new THREE.TorusGeometry(0.04, 0.006, 5, 12), P.white, { bone: body, at, rotation: [70, 0, 0] });
    b.part(new THREE.CircleGeometry(0.037, 10), P.ink, { bone: body, at: [at[0], at[1], at[2] - 0.003], dir: [0, 0.34, -0.94], axis: "z" });
    rod([at[0], at[1] + 0.005, at[2] + 0.015], [at[0] + 0.02, at[1] + 0.025, at[2] + 0.012], 0.004, P.pale, body);
  }

  // gunsight
  cyl(0.04, 0.08, P.gunmetal, [0, Y + 0.38, 0.62], body);
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.1), P.cyanGlow, { bone: body, at: [0, Y + 0.46, 0.7], rotation: [-20, 0, 0] }), 1.2);
  box(0.12, 0.012, 0.012, P.white, [0, Y + 0.51, 0.64], body);
  rod([0.05, Y + 0.34, 0.7], [-0.05, Y + 0.34, 0.7], 0.008, P.pale, body);

  // canopy outline sweep
  b.sweep([[0.41, Y + 0.03, 0.95], [0.41, Y + 0.03, -1.7], [0, Y + 0.03, -1.74], [-0.41, Y + 0.03, -1.7], [-0.41, Y + 0.03, 0.95]], 0.008, { color: P.pale, bone: canopy, sides: 5 });
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFuselage({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(5);
  // Hull cross-section stations: z, half-width, top y, bottom y
  const st: [number, number, number, number][] = [
    [3.95, 0.5, 2.25, 1.25],
    [3.0, 0.52, 2.3, 1.22],
    [1.5, 0.55, 2.28, 1.12],
    [0.5, 0.55, 2.1, 1.1],
    [-1.0, 0.5, 2.1, 1.2],
    [-1.7, 0.42, 2.05, 1.28],
    [-3.0, 0.25, 1.95, 1.45],
    [-4.45, 0.06, 1.82, 1.6],
  ];
  const stations = st.map(([z, hw, t, bt]) => ({ at: [0, (t + bt) / 2, z] as [number, number, number], w: hw * 2, h: t - bt }));
  // lower skin, then upper skin slightly larger/higher for two-tone
  const hull = b.loft(stations, { bone: body, color: P.skyPale, section: { ngon: 12 }, detail: 1 } as any);
  const upper = st.map(([z, hw, t, bt]) => ({
    at: [0, (t + bt) / 2 + (t - bt) * 0.16, z] as [number, number, number],
    w: hw * 2 * 1.015,
    h: (t - bt) * 0.68,
  }));
  b.loft(upper, { bone: body, color: P.cobalt, section: { ngon: 12 } } as any);
  // navy chin
  b.rod([0, 1.3, 3.8], [0, 1.2, 2.0], [0.28, 0.4], { bone: body, color: P.navy });
  // camouflage patches
  for (let i = 0; i < 14; i++) {
    const z = 3.3 - i * 0.55;
    const s = i % 2 ? 1 : -1;
    const y = z > 0.6 ? 2.0 : 1.95;
    b.part(new THREE.SphereGeometry(1, 6, 4), P.prussian, { bone: body, at: [s * (0.44 - Math.max(0, -z) * 0.05), y - 0.05 + R() * 0.05, z], scale: [0.1, 0.12, 0.3 + R() * 0.2] });
  }
  // upper deck
  b.part(new THREE.BoxGeometry(0.7, 0.04, 2.7), P.cobalt, { bone: body, at: [0, 2.09, -0.35] });
  // turtleback
  b.loft(
    [
      { at: [0, 2.1, -1.7], w: 0.6, h: 0.2 },
      { at: [0, 2.08, -2.2], w: 0.5, h: 0.2 },
      { at: [0, 1.98, -2.8], w: 0.3, h: 0.14 },
    ],
    { bone: body, color: P.cobalt },
  );
  // demarcation line
  for (let i = 0; i < 16; i++) {
    const z = 3.4 - i * 0.45;
    const hw = z > 0 ? 0.55 : Math.max(0.1, 0.5 - (-z) * 0.07);
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.012, 0.018, 0.3), P.white, { bone: body, at: [s * (hw * 0.99), 1.6 + Math.sin(i * 1.3) * 0.04 + (z < -2 ? 0.05 : 0), z], rotation: [0, 0, 0] });
  }
  // cowl nose ring and seams
  b.part(new THREE.TorusGeometry(0.5, 0.03, 6, 16), P.white, { bone: body, at: [0, 1.75, 3.92] });
  for (const z of [3.55, 3.2, 2.0]) b.part(new THREE.TorusGeometry(0.52, 0.01, 4, 16), P.pale, { bone: body, at: [0, 1.76, z] });
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + r * 0.2;
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.white, { bone: body, at: [Math.sin(a) * 0.5, 1.75 + Math.cos(a) * 0.48, 3.78 - r * 0.45] });
    }
  // exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = 2.45 + i * 0.16;
      b.spike([s * 0.5, 1.98 - 0.02, z], [s, 0.1, -0.1], 0.14, 0.035, { bone: body, color: P.ink });
      b.part(new THREE.BoxGeometry(0.01, 0.04, 0.35), P.navy, { bone: body, at: [s * 0.53, 1.97, z - 0.22] });
    }
  // cannon blisters
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 6, 4), P.blue, { bone: body, at: [s * 0.3, 2.28, 2.0], scale: [0.09, 0.05, 0.3] });
  // carb scoop
  b.part(new THREE.BoxGeometry(0.34, 0.14, 0.8), P.navy, { bone: body, at: [0, 1.15, 2.4] });
  b.part(new THREE.BoxGeometry(0.24, 0.08, 0.03), P.ink, { bone: body, at: [0, 1.14, 2.8] });
  // aerial mast + wire
  b.rod([0, 2.1, 1.7], [0, 2.7, 1.72], 0.012, { bone: body, color: P.white });
  b.part(new THREE.SphereGeometry(0.025, 5, 4), P.pale, { bone: body, at: [0, 2.72, 1.72] });
  b.sweep([[0, 2.7, 1.72], [0, 2.35, -1.5], [0, 2.0, -3.6]], 0.005, { bone: body, color: P.white });
  // panel lines, stringers, rivets
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.9, 3.0], [s * 0.45, 1.95, -3.0], 0.008, { bone: body, color: P.pale });
    b.rod([s * 0.565, 1.5, 1.4], [s * 0.45, 1.55, -2.8], 0.007, { bone: body, color: P.white });
    b.part(new THREE.BoxGeometry(0.01, 0.2, 0.3), P.pale, { bone: body, at: [s * 0.56, 1.8, 0.4] });
    b.part(new THREE.BoxGeometry(0.012, 0.16, 0.26), P.white, { bone: body, at: [s * 0.563, 1.8, 0.4] });
    for (let i = 0; i < 14; i++)
      b.part(new THREE.SphereGeometry(0.01, 4, 3), P.white, { bone: body, at: [s * (0.55 - i * 0.02), 1.7, 1.2 - i * 0.28] });
    // roundel on sides
    const rx = s * 0.33;
    const d = [[0.2, P.navy], [0.15, P.pale], [0.1, P.sky], [0.05, P.white]] as [number, string][];
    d.forEach(([r, c], k) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.01, 14), c, { bone: body, at: [s * (0.37 + k * 0.004), 1.78, -2.3], dir: [s, 0, 0] }),
    );
    // letters
    const zs = s > 0 ? [-1.6, -1.45] : [-1.6, -1.45];
    const bar = (x: number, y: number, z: number, w: number, h: number) =>
      b.part(new THREE.BoxGeometry(0.012, h, w), P.white, { bone: body, at: [s * x, y, z] });
    // Q J
    bar(0.5, 1.82, -1.4, 0.1, 0.02); bar(0.5, 1.7, -1.4, 0.1, 0.02); bar(0.5, 1.76, -1.35, 0.02, 0.12); bar(0.5, 1.76, -1.45, 0.02, 0.12);
    bar(0.5, 1.76, -1.62, 0.02, 0.14); bar(0.5, 1.69, -1.66, 0.06, 0.02);
    bar(0.5, 1.76, -1.9, 0.02, 0.14); bar(0.5, 1.82, -1.9 - 0.04, 0.1, 0.02);
    void zs; void rx;
  }
  // wing root walkway
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.2, 0.02, 1.6), P.pale, { bone: body, at: [s * 0.56, 1.2, -0.1] });
  // spine light
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.cyanGlow, { bone: body, at: [0, 1.88, -3.3] }), 1.5);
  void hull; void frame; void M;
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWings({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;
  const X0 = 0.4, X1 = 5.6;
  const geo = (f: number) => ({
    zle: lerp(1.2, 0.3, f),
    zte: lerp(-1.4, -0.25, f) - 0.13 * Math.sin(Math.PI * Math.min(Math.max(f, 0), 1)),
    yc: 1.22 + 0.4 * f,
    t: 0.3 * (1 - f) + 0.08 * f,
  });
  // point on wing surface (mirrored by s)
  const pt = (s: number, x: number, u: number, side: number, lift = 0) => {
    const f = (x - 0.5) / 5.1;
    const g = geo(f);
    const h = Math.max(0, 2.6 * Math.sqrt(u) * (1 - u));
    const y = g.yc + (side > 0 ? 0.55 : -0.45) * g.t * h + side * lift;
    return V(s * x, y, g.zle + (g.zte - g.zle) * u);
  };
  const grid = (fn: (i: number, j: number) => THREE.Vector3, ni: number, nj: number, side: number) => {
    const pos: number[] = [];
    for (let i = 0; i <= ni; i++) for (let j = 0; j <= nj; j++) { const p = fn(i, j); pos.push(p.x, p.y, p.z); }
    const idx: number[] = [];
    for (let i = 0; i < ni; i++) for (let j = 0; j < nj; j++) {
      const a = i * (nj + 1) + j, c = a + 1, d = a + nj + 1, e = d + 1;
      idx.push(a, c, d, c, e, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const n = g.getAttribute("normal");
    if (n.getY(0) * side < 0) { // flip
      for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
      g.setIndex(idx); g.computeVertexNormals();
    }
    return g;
  };
  const patch = (s: number, x0: number, x1: number, u0: number, u1: number, side: number, lift: number, color: string, bone: any, nx = 4, nu = 3) =>
    b.part(grid((i, j) => pt(s, lerp(x0, x1, i / nx), lerp(u0, u1, j / nu), side, lift), nx, nu, side), color, { bone, at: [0, 0, 0] });
  const line = (s: number, x0: number, u0: number, x1: number, u1: number, side: number, lift: number, r: number, color: string, bone: any, n = 6) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= n; k++) pts.push(pt(s, lerp(x0, x1, k / n), lerp(u0, u1, k / n), side, lift));
    return b.sweep(pts, r, { color, bone, caps: "flat", sides: 4 });
  };

  for (const s of [1, -1]) {
    const W = s > 0 ? J.wingL : J.wingR;
    const A = s > 0 ? J.aileronL : J.aileronR;
    const tag = s > 0 ? "L" : "R";
    // skins
    const us = Array.from({ length: 15 }, (_, j) => Math.pow(j / 14, 1.7));
    const xs = Array.from({ length: 18 }, (_, i) => lerp(X0, X1, i / 17));
    b.part(grid((i, j) => pt(s, xs[i], us[j], 1), 17, 14, 1), P.cobalt, { bone: W, at: [0, 0, 0], name: "wingTop" + tag });
    b.part(grid((i, j) => pt(s, xs[i], us[j], -1), 17, 14, -1), P.skyPale, { bone: W, at: [0, 0, 0], name: "wingBot" + tag });
    // camo patches
    const camo: number[][] = [[0.9, 1.9, 0.1, 0.45], [2.2, 3.2, 0.5, 0.9], [3.6, 4.8, 0.15, 0.5], [4.4, 5.4, 0.55, 0.85], [1.2, 2.0, 0.6, 0.9]];
    for (const c of camo) patch(s, c[0], c[1], c[2], c[3], 1, 0.004, P.prussian, W);
    patch(s, 0.5, 1.4, 0.0, 0.12, -1, 0.004, P.sky, W, 3, 2);
    // walkway
    patch(s, 0.55, 1.25, 0.38, 0.72, 1, 0.006, P.pale, W, 3, 2);
    patch(s, 0.7, 1.1, 0.5, 0.55, 1, 0.009, P.sky, W, 2, 1);
    // flaps (inner TE) and ailerons (outer TE)
    patch(s, 0.9, 2.9, 0.72, 0.98, 1, 0.008, P.sky, W, 5, 2);
    patch(s, 0.9, 2.9, 0.72, 0.98, -1, 0.008, P.sky, W, 5, 2);
    patch(s, 3.0, 5.1, 0.74, 0.98, 1, 0.008, P.blue, A, 5, 2);
    patch(s, 3.0, 5.1, 0.74, 0.98, -1, 0.008, P.sky, A, 5, 2);
    // hinge lines
    line(s, 0.9, 0.72, 2.9, 0.72, 1, 0.012, 0.008, P.white, W, 5);
    line(s, 3.0, 0.74, 5.1, 0.74, 1, 0.012, 0.008, P.white, A, 5);
    line(s, 0.9, 0.72, 2.9, 0.72, -1, 0.012, 0.008, P.white, W, 5);
    for (const x of [0.9, 2.9]) line(s, x, 0.72, x, 0.98, 1, 0.012, 0.007, P.white, W, 2);
    for (const x of [3.0, 5.1]) line(s, x, 0.74, x, 0.98, 1, 0.012, 0.007, P.white, A, 2);
    // ribs & rivet rows
    for (let k = 0; k < 9; k++) {
      const x = 0.8 + k * 0.52;
      const bone = x > 3 && x < 5.1 ? W : W;
      line(s, x, 0.06, x, 0.72, 1, 0.008, 0.005, P.pale, bone, 6);
    }
    for (let k = 0; k < 6; k++) line(s, 0.7 + k * 0.8, 0.82, 0.7 + k * 0.8 + 0.6, 0.82, -1, 0.008, 0.004, P.white, W, 3);
    for (const u of [0.12, 0.3, 0.62]) line(s, 0.7, u, 5.3, u, 1, 0.008, 0.004, P.white, W, 12);
    line(s, 0.7, 0.4, 5.3, 0.4, -1, 0.008, 0.004, P.pale, W, 12);
    // LE trim
    line(s, 0.55, 0.012, 5.55, 0.012, 1, 0.006, 0.012, P.white, W, 14);
    // roundels
    const nrm = V(-s * 0.078, 1, 0).normalize();
    const disc = (cx: number, cz: number, side: number) => {
      const f = (cx - 0.5) / 5.1, g = geo(f);
      const u = (g.zle - cz) / (g.zle - g.zte);
      const p = pt(s, cx, u, side, 0.012);
      const d = nrm.clone().multiplyScalar(side);
      [[0.5, P.navy], [0.4, P.pale], [0.29, P.sky], [0.14, P.white]].forEach(([r, c], k) =>
        b.part(new THREE.CylinderGeometry(r as number, r as number, 0.01, 20), c as string, {
          bone: W, at: p.clone().addScaledVector(d, 0.004 * k), dir: d,
        }),
      );
    };
    disc(3.3, -0.1, 1);
    disc(3.3, -0.1, -1);
    // gun barrels
    for (const x of [1.7, 1.95, 2.2, 2.45]) {
      const f = (x - 0.5) / 5.1, g = geo(f);
      const y = g.yc;
      b.rod(V(s * x, y, g.zle - 0.25), V(s * x, y, g.zle + 0.12), 0.026, P.gunmetal, { bone: W, sides: 6 });
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 6), P.ink, { bone: W, at: V(s * x, y, g.zle + 0.122), dir: [0, 0, 1] });
      b.part(new THREE.BoxGeometry(0.05, 0.012, 0.07), P.pale, { bone: W, at: pt(s, x, 0.03, 1, 0.003) });
    }
    // cannon bulges
    for (const x of [2.6, 3.0]) b.part(new THREE.SphereGeometry(0.08, 8, 5), P.prussian, { bone: W, at: pt(s, x, 0.22, 1, 0.02), scale: [1, 0.45, 2.4] });
    // tip cap and light
    const tp = pt(s, 5.6, 0.45, 1, -0.04);
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.white, { bone: W, at: V(s * 5.58, tp.y, tp.z), scale: [0.3, 0.2, 1.25] });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 5), P.cyanGlow, { bone: W, at: V(s * 5.7, tp.y, tp.z + 0.15) }), 1.5);
  }
  // oil cooler (left, +X) under wing
  {
    const p = pt(1, 2.2, 0.3, -1, 0.1);
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 10), P.steel, { bone: J.wingL, at: p, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), P.ink, { bone: J.wingL, at: V(p.x, p.y, p.z + 0.26), dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.17, 0.014, 4, 12), P.pale, { bone: J.wingL, at: V(p.x, p.y, p.z + 0.25) });
  }
  // radiator (right, -X)
  {
    const p = pt(-1, 2.2, 0.3, -1, 0.12);
    b.part(new THREE.BoxGeometry(0.4, 0.22, 0.55), P.blue, { bone: J.wingR, at: p });
    b.part(new THREE.BoxGeometry(0.3, 0.14, 0.02), P.ink, { bone: J.wingR, at: V(p.x, p.y, p.z + 0.28) });
    for (const [dx, dy] of [[0.2, 0], [-0.2, 0]]) b.rod(V(p.x + dx, p.y - 0.11, p.z - 0.27), V(p.x + dx, p.y - 0.11, p.z + 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
    b.rod(V(p.x - 0.2, p.y - 0.11, p.z + 0.27), V(p.x + 0.2, p.y - 0.11, p.z + 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
    b.rod(V(p.x - 0.2, p.y - 0.11, p.z - 0.27), V(p.x + 0.2, p.y - 0.11, p.z - 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
  }
  // pitot on left LE
  {
    const g = geo((3.6 - 0.5) / 5.1);
    b.rod(V(3.6, g.yc - 0.06, g.zle - 0.05), V(3.6, g.yc - 0.06, g.zle + 0.38), [0.02, 0.01], P.white, { bone: J.wingL, sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.pale, { bone: J.wingL, at: V(3.6, g.yc - 0.06, g.zle + 0.39) });
  }
}
```