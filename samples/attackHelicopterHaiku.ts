import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";

export const meta = {
  name: "Tandem-seat attack helicopter",
  description:
    "A low-poly tandem-seat attack gunship at real size: faceted olive fuselage with a tan belly and an orange flank belt, a glazed tandem canopy, twin turboshaft pods, a four-blade main rotor with orange tips, a tail rotor on the left of a swept fin, stub wings with rocket pods and guided missiles, and a chin gun on a yawing turret.",
  style: "low-poly",
  commit: "b816db2",
};

// Palette: olive drab airframe, desert-tan belly, one orange accent, dark glazing and steel.
const OLIVE = "#5e6d43";
const OLIVE_LT = "#7b8b59";
const OLIVE_DK = "#404a2b";
const TAN = "#c8ad76";
const BLACK = "#1d1f23";
const CHAR = "#363b41";
const STEEL = "#8c9299";
const LIGHT = "#c3c7cc";
const GLASS = "#1f3a47";
const GLASS_HI = "#5b8a9a";
const ORANGE = "#e2662a";
const BLADE = "#2c2f34";
const POD = "#6a7550";
const MISSILE = "#a9ae9c";
const TIRE = "#26272a";
const TUBE = "#2b2f22";
const RED = "#d8322b";
const GREEN = "#3fbf5a";
const WHITE = "#f2f0e6";

// Hull: flat low-poly colour bands by facing (lit top, olive flanks, shadowed lower flank, tan belly), with an
// orange belt along the flanks forward of the engines (s = [t, clock angle], 90 and 270 are the sides).
const hullPaint = paint((p, n, s) => {
  const clock = ((s[1] % 360) + 360) % 360;
  if (p.z > -1 && p.z < 6.3 && Math.min(Math.abs(clock - 90), Math.abs(clock - 270)) < 10) return ORANGE;
  if (n.y < -0.6) return TAN;
  if (n.y < -0.2) return OLIVE_DK;
  if (n.y > 0.6) return OLIVE_LT;
  return OLIVE;
});

// Canopy glass with diagonal reflection facets.
const glass = paint((p) => {
  const f = p.z * 0.8 + p.x * 0.5 + p.y * 0.3;
  return f - Math.floor(f) < 0.14 ? GLASS_HI : GLASS;
});

// Main rotor blades: dark composite with orange and black tip bands (s = [span, chord] in meters).
const bladePaint = paint((_p, _n, s) =>
  s[0] > 6.2 ? (Math.floor((s[0] - 6.2) / 0.3) % 2 === 0 ? ORANGE : BLACK) : BLADE,
);

const tailBladePaint = paint((_p, _n, s) => (s[0] > 1.1 ? ORANGE : BLADE));

// Tail fin: olive with an orange cap (s = [back, up] in meters).
const finPaint = paint((_p, _n, s) => (s[1] > 0.85 ? ORANGE : OLIVE));

export default function build() {
  const b = createBuilder({ name: "attackHelicopter" });

  // Skeleton: the airframe is the root; rotors, wheels, turret and stabilators are hinges.
  const hull = b.joint("hull", { at: [0, 0, 0], role: "spine" });
  const rotor = b.joint("rotor", { parent: hull, at: [0, 3.6, -0.45], role: "hinge" });
  const tailRotor = b.joint("tailRotor", { parent: hull, at: [0.42, 2.7, -7.1], dir: [1, 0, 0], role: "hinge" });
  const turret = b.joint("turret", { parent: hull, at: [0, 0.95, 5.0], role: "hinge" });
  const wheelL = b.joint("wheelL", { parent: hull, at: [1.05, 0.36, 0.3], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: hull, at: [-1.05, 0.36, 0.3], dir: [-1, 0, 0], role: "hinge" });
  const stabL = b.joint("stabL", { parent: hull, at: [0.1, 2.5, -4.55], dir: [1, 0, 0], role: "hinge" });
  const stabR = b.joint("stabR", { parent: hull, at: [-0.1, 2.5, -4.55], dir: [-1, 0, 0], role: "hinge" });

  // A flat-shaded part on a bone, placed by its centre and (for cylinders and boxes) its axis.
  const put = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: V3, dir?: V3, name?: string) =>
    b.part(geo, color, { bone, at, dir, flat: true, name });

  // Fuselage: nose to tail boom, one faceted loft through the station centres.
  b.loft(
    [
      { at: [0, 1.3, 6.9], w: 0.3, h: 0.32 },
      { at: [0, 1.5, 6.1], w: 0.9, h: 0.95 },
      { at: [0, 1.75, 4.8], w: 1.22, h: 1.3 },
      { at: [0, 1.98, 3.2], w: 1.46, h: 1.6 },
      { at: [0, 2.1, 1.0], w: 1.54, h: 1.6 },
      { at: [0, 2.12, -1.0], w: 1.4, h: 1.5 },
      { at: [0, 2.2, -2.8], w: 1.05, h: 1.25 },
      { at: [0, 2.36, -4.8], w: 0.6, h: 0.86 },
      { at: [0, 2.56, -6.4], w: 0.38, h: 0.44 },
      { at: [0, 2.66, -7.0], w: 0.28, h: 0.3 },
    ],
    { bone: hull, color: hullPaint, name: "fuselage", sides: 8, smooth: false },
  );

  // Tandem canopy: a glazed shell over the top of the two cockpits, with one rib down its spine.
  b.loft(
    [
      { at: [0, 1.98, 5.6], w: 0.96, h: 0.4 },
      { at: [0, 2.17, 4.8], w: 1.24, h: 0.5 },
      { at: [0, 2.49, 3.2], w: 1.48, h: 0.62 },
      { at: [0, 2.62, 1.0], w: 1.52, h: 0.6 },
    ],
    { bone: hull, color: glass, name: "canopy", sides: 8, smooth: false },
  );
  b.sweep(
    catmull([
      [0, 2.23, 5.4],
      [0, 2.46, 4.8],
      [0, 2.83, 3.2],
      [0, 2.95, 1.0],
    ]),
    0.03,
    { bone: hull, color: OLIVE_DK, name: "canopyRib", caps: "round", sides: 4 },
  );

  // Side panels on the cockpit and the avionics bay.
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.04, 0.45, 0.9), OLIVE_DK, hull, [0.76 * s, 2.0, 0.4], undefined, `sidePanel${s > 0 ? "L" : "R"}`);
  }

  // Belly fairing under the rear fuselage.
  put(new THREE.BoxGeometry(0.9, 0.22, 1.1), OLIVE_DK, hull, [0, 1.25, -1.2], undefined, "bellyBox");

  // Twin turboshaft pods on top of the rear fuselage, with intake and exhaust.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.72;
    put(new THREE.CylinderGeometry(0.25, 0.27, 1.5, 8), OLIVE_DK, hull, [x, 2.8, -1.0], [0, 0, 1], `engine${side}`);
    put(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), BLACK, hull, [x, 2.8, -0.26], [0, 0, 1], `intake${side}`);
    put(new THREE.CylinderGeometry(0.11, 0.18, 0.4, 8), CHAR, hull, [x, 2.8, -1.95], [0, 0, -1], `exhaust${side}`);
  }

  // Mast and its fairing, rising from the fuselage to the rotor head.
  put(new THREE.CylinderGeometry(0.22, 0.3, 0.4, 8), OLIVE, hull, [0, 2.95, -0.45], undefined, "mastFairing");
  put(new THREE.CylinderGeometry(0.13, 0.16, 0.7, 8), OLIVE_DK, hull, [0, 3.2, -0.45], undefined, "mast");

  // Mast radar dome on a bracket beside the rotor head.
  put(new THREE.BoxGeometry(0.2, 0.06, 0.2), OLIVE_DK, hull, [-0.28, 3.69, -0.45], undefined, "radarBracket");
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.26, 0.06],
      [0.2, 0.18],
      [0, 0.22],
    ],
    { at: [-0.28, 3.72, -0.45], color: LIGHT, bone: hull, segments: 6, name: "longbowRadar" },
  );

  // Main rotor: hub on the rotor joint, four blades swept round it.
  put(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 8), OLIVE_DK, rotor, [0, 3.6, -0.45], undefined, "rotorHub");
  for (const deg of [0, 90, 180, 270]) {
    const th = (deg * Math.PI) / 180;
    b.extrude(
      [
        [0.25, -0.26],
        [6.9, -0.17],
        [7.3, -0.06],
        [7.3, 0.06],
        [6.9, 0.17],
        [0.25, 0.26],
      ],
      {
        at: [0, 3.6, -0.45],
        x: [Math.sin(th), 0, Math.cos(th)],
        y: [Math.cos(th), 0, -Math.sin(th)],
        thickness: 0.05,
        color: bladePaint,
        bone: rotor,
        name: `mainBlade${deg}`,
      },
    );
  }

  // Tail boom end: tail rotor gearbox, hub and blades on the tail rotor joint (the left side of the boom).
  put(new THREE.BoxGeometry(0.3, 0.26, 0.3), OLIVE, hull, [0.15, 2.7, -6.95], undefined, "tailFairing");
  put(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 8), OLIVE_DK, tailRotor, [0.42, 2.7, -7.1], [1, 0, 0], "tailGearbox");
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), STEEL, tailRotor, [0.62, 2.7, -7.1], [1, 0, 0], "tailHub");
  for (const deg of [0, 90, 180, 270]) {
    const ph = (deg * Math.PI) / 180;
    b.extrude(
      [
        [0.12, -0.1],
        [1.25, -0.06],
        [1.35, -0.02],
        [1.35, 0.02],
        [1.25, 0.06],
        [0.12, 0.1],
      ],
      {
        at: [0.42, 2.7, -7.1],
        x: [0, Math.sin(ph), Math.cos(ph)],
        y: [0, -Math.cos(ph), Math.sin(ph)],
        thickness: 0.04,
        color: tailBladePaint,
        bone: tailRotor,
        name: `tailBlade${deg}`,
      },
    );
  }

  // Vertical fin with an orange cap, and a whip antenna on the boom.
  b.extrude(
    [
      [0, 0],
      [1.45, 0],
      [1.1, 1.1],
      [0.3, 1.1],
    ],
    { at: [0, 2.6, -5.6], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, color: finPaint, bone: hull, name: "tailFin" },
  );
  put(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4), BLACK, hull, [0, 3.1, -3.5], undefined, "antenna");
  for (const z of [-1.9, -2.2, -2.5])
    put(new THREE.BoxGeometry(0.5, 0.03, 0.1), CHAR, hull, [0, 2.84, z], undefined, "deckLouvre");
  for (const s of [1, -1])
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 4), BLACK, hull, [0.62 * s, 1.6, 5.1], [0, 0, 1], "pitot");
  put(new THREE.SphereGeometry(0.05, 6, 4), WHITE, hull, [0, 3.72, -6.3], undefined, "strobe");

  // Horizontal stabilators, each on its own pivot.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.4],
        [1.25, -0.3],
        [1.25, 0.1],
        [0, 0.4],
      ],
      {
        at: [0.05 * s, 2.5, -4.55],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        color: OLIVE_DK,
        bone: s > 0 ? stabL : stabR,
        name: s > 0 ? "stabilatorL" : "stabilatorR",
      },
    );
  }

  // Stub wings, each a tapered plate with an inboard rocket pod and an outboard missile rail.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0, -0.5],
        [2.2, -0.25],
        [2.2, 0.2],
        [0, 0.55],
      ],
      { at: [0.55 * s, 1.42, 0.05], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.12, color: OLIVE, bone: hull, name: `wing${side}` },
    );

    // Inboard pylon and seven-tube rocket pod.
    put(new THREE.BoxGeometry(0.08, 0.22, 0.5), CHAR, hull, [1.6 * s, 1.3, 0], undefined, `pylonIn${side}`);
    put(new THREE.CylinderGeometry(0.19, 0.19, 1.7, 6), POD, hull, [1.6 * s, 1.08, 0], [0, 0, 1], `rocketPod${side}`);
    const holes: [number, number][] = [
      [0, 0],
      [0.1, 0],
      [0.05, 0.087],
      [-0.05, 0.087],
      [-0.1, 0],
      [-0.05, -0.087],
      [0.05, -0.087],
    ];
    for (const [dx, dy] of holes)
      put(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 6), TUBE, hull, [1.6 * s + dx, 1.08 + dy, 0.87], [0, 0, 1]);

    // Outboard pylon, rail and two missiles with nose cones and cruciform fins.
    put(new THREE.BoxGeometry(0.08, 0.22, 0.5), CHAR, hull, [2.45 * s, 1.3, 0], undefined, `pylonOut${side}`);
    put(new THREE.BoxGeometry(0.46, 0.04, 0.1), CHAR, hull, [2.45 * s, 1.2, 0], undefined, `rail${side}`);
    for (const mx of [2.3, 2.6]) {
      const X = mx * s;
      put(new THREE.CylinderGeometry(0.085, 0.085, 1.5, 8), MISSILE, hull, [X, 1.13, -0.1], [0, 0, 1]);
      put(new THREE.CylinderGeometry(0.02, 0.085, 0.3, 8), CHAR, hull, [X, 1.13, 0.8], [0, 0, 1]);
      put(new THREE.BoxGeometry(0.22, 0.012, 0.16), CHAR, hull, [X, 1.13, -0.7]);
      put(new THREE.BoxGeometry(0.012, 0.22, 0.16), CHAR, hull, [X, 1.13, -0.7]);
    }

    // Wingtip ECM pod with its navigation light.
    put(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 6), POD, hull, [2.68 * s, 1.44, 0], [0, 0, 1], `wingtipPod${side}`);
    put(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? RED : GREEN, hull, [2.68 * s, 1.44, 0.47], undefined, `navLight${side}`);

    // Main gear strut from the wing bottom down to the axle, and the wheel on its joint.
    const wheel = s > 0 ? wheelL : wheelR;
    const x = 1.05 * s;
    put(new THREE.CylinderGeometry(0.05, 0.06, 0.95, 6), CHAR, hull, [x, 0.85, 0.3], undefined, `strut${side}`);
    put(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 8), TIRE, wheel, [x, 0.36, 0.3], [s, 0, 0], `tire${side}`);
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.24, 6), LIGHT, wheel, [x, 0.36, 0.3], [s, 0, 0], `hub${side}`);
  }

  // Chin turret: a mount under the nose, a yawing ball with the gun, sensor and ammunition box.
  put(new THREE.BoxGeometry(0.36, 0.2, 0.5), CHAR, hull, [0, 1.18, 5.0], undefined, "chinMount");
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6), WHITE, hull, [0.12, 1.18, 5.26], [0, 0, 1], "chinLight");
  put(new THREE.SphereGeometry(0.27, 8, 6), CHAR, turret, [0, 0.95, 5.0], undefined, "chinBall");
  put(new THREE.CylinderGeometry(0.045, 0.05, 1.7, 6), STEEL, turret, [0, 0.95, 5.85], [0, 0, 1], "gunBarrel");
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 6), STEEL, turret, [0, 0.95, 6.76], [0, 0, 1], "muzzle");
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), GLASS, turret, [0.14, 1.02, 5.24], [0, 0, 1], "turretLens");
  put(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6), STEEL, turret, [-0.13, 0.98, 5.22], [0, 0, 1], "laser");
  put(new THREE.BoxGeometry(0.24, 0.22, 0.4), OLIVE_DK, turret, [-0.33, 0.95, 4.85], undefined, "ammoBox");

  return b.root;
}
