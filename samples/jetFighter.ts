import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { glow } from "../kits/glow";

const BODY = "#d8e2ec";
const BODY_LIGHT = "#f4f7fb";
const BODY_SHADOW = "#26364a";
const NAVY = "#10233d";
const ORANGE = "#ff6b35";
const CYAN = "#49d8ff";
const CYAN_DARK = "#147aa4";
const RUBBER = "#111722";
const METAL = "#68788d";
const WARNING = "#ffd166";

export const meta = {
  name: "Vanguard Jet Fighter",
  description: "A polished Overwatch-style futuristic jet fighter with swept wings, twin glowing engines, crisp panel accents, and deployed landing gear.",
  style: "Overwatch",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "jetFighter", detail: 1 });
  const root = b.joint("root", { at: [0, 1.03, -0.75], dir: [0, 0, 1], role: "spine" });

  // The faceted fuselage is a broad, readable hero silhouette, tapering into a sharp nose.
  const fuselage = b.loft(
    [
      { at: [0, 1.10, -2.08], w: 0.72, h: 0.48 },
      { at: [0, 1.15, -1.48], w: 1.05, h: 0.68 },
      { at: [0, 1.23, -0.55], w: 1.25, h: 0.82 },
      { at: [0, 1.34, 0.38], w: 1.06, h: 0.70 },
      { at: [0, 1.43, 1.28], w: 0.62, h: 0.48 },
      { at: [0, 1.49, 2.14], w: 0.16, h: 0.16 },
    ],
    { bone: root, color: BODY, section: "box", detail: 1, caps: "point", name: "fuselage" },
  );
  void fuselage;

  // A darker belly keel and a raised dorsal spine give the clean shell some graphic depth.
  b.sweep(
    catmull([
      [0, 0.88, -1.88],
      [0, 0.90, -1.15],
      [0, 0.95, -0.25],
      [0, 1.03, 0.76],
      [0, 1.19, 1.62],
    ]),
    [0.27, 0.08],
    { bone: root, color: BODY_SHADOW, section: "box", caps: "flat", name: "bellyKeel" },
  );
  b.sweep(
    catmull([
      [0, 1.47, -1.34],
      [0, 1.56, -0.5],
      [0, 1.66, 0.4],
      [0, 1.68, 1.22],
    ]),
    [0.15, 0.11],
    { bone: root, color: NAVY, section: "box", caps: "point", name: "dorsalSpine" },
  );

  // Canopy: a low hemisphere reads as glass without breaking the angular sci-fi language.
  b.part(
    new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2),
    NAVY,
    { bone: root, at: [0, 1.47, 0.38], scale: [0.56, 0.34, 0.82], name: "canopy" },
  );
  b.sweep(
    polyline([
      [-0.52, 1.48, -0.25],
      [-0.38, 1.66, 0.45],
      [0, 1.76, 1.02],
      [0.38, 1.66, 0.45],
      [0.52, 1.48, -0.25],
    ]),
    0.027,
    { bone: root, color: CYAN_DARK, section: { ngon: 6 }, caps: "round", name: "canopyFrame" },
  );
  b.part(new THREE.BoxGeometry(0.075, 0.028, 1.02), ORANGE, {
    bone: root,
    at: [0, 1.765, 0.45],
    name: "canopyAccent",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.024, 0.56), CYAN, {
      bone: root,
      at: [s * 0.48, 1.64, 0.42],
      rotation: [0, s * 9, 0],
      name: `canopyGlint${s > 0 ? "L" : "R"}`,
    });
  }

  // Large swept wings, mirrored from one deliberately simple silhouette.

  const wingOutline: [number, number][] = [
    [0, -0.72],
    [1.02, -0.98],
    [1.74, -0.44],
    [2.02, 0.22],
    [0.72, 0.58],
    [0.08, 0.38],
  ];
  for (const s of [1, -1]) {
    const wing = b.extrude(wingOutline, {
      at: [s * 0.40, 1.15, -0.17],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.12, 0.065],
      bevel: 0.055,
      smoothing: 1,
      bone: root,
      color: BODY,
      name: `wing${s > 0 ? "L" : "R"}`,
    });
    // Edge rails and a pair of tiny inset plates make each wing feel manufactured.
    b.rod([s * 0.49, 1.225, 0.20], [s * 2.34, 1.225, -0.23], 0.026, {
      bone: root,
      color: ORANGE,
      section: { ngon: 5 },
      name: `wingLeading${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.88, 1.115, -0.77], [s * 1.72, 1.115, -0.58], 0.018, {
      bone: root,
      color: NAVY,
      section: { ngon: 4 },
      name: `wingPanel${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.22, 0.026, 0.34), CYAN_DARK, {
      bone: root,
      at: wing.local([0.78, 0.08, 0.07]),
      name: `wingInset${s > 0 ? "L" : "R"}`,
    });
  }

  // Twin canted vertical stabilisers and forward canards.
  const finOutline: [number, number][] = [
    [0, 0],
    [0.73, 0],
    [0.48, 0.55],
    [0.14, 0.92],
    [0, 0.24],
  ];
  for (const s of [1, -1]) {
    b.extrude(finOutline, {
      at: [s * 0.46, 1.38, -1.42],
      x: [0, 0, 1],
      y: [s * 0.16, 1, 0],
      thickness: [0.10, 0.055],
      bevel: 0.035,
      smoothing: 1,
      bone: root,
      color: BODY_LIGHT,
      name: `tailFin${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.53, 1.53, -1.24], [s * 0.69, 2.02, -0.80], 0.021, {
      bone: root,
      color: ORANGE,
      section: { ngon: 5 },
      name: `finStripe${s > 0 ? "L" : "R"}`,
    });
  }
  const canardOutline: [number, number][] = [
    [0, -0.20],
    [0.74, -0.28],
    [1.00, 0.08],
    [0.30, 0.30],
    [0, 0.22],
  ];
  for (const s of [1, -1]) {
    b.extrude(canardOutline, {
      at: [s * 0.28, 1.42, 0.82],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.075, 0.035],
      bevel: 0.025,
      bone: root,
      color: BODY_LIGHT,
      name: `canard${s > 0 ? "L" : "R"}`,
    });
  }

  // Twin engine nacelles under the wing roots, each with intake lip and hot exhaust.
  for (const s of [1, -1]) {
    const pod = b.sweep(
      catmull([
        [s * 0.53, 1.04, -1.18],
        [s * 0.57, 1.01, -1.54],
        [s * 0.57, 1.00, -2.16],
      ]),
      (t) => 0.22 - 0.025 * t,
      {
        bone: root,
        color: BODY_SHADOW,
        section: { ngon: 8 },
        caps: "round",
        name: `enginePod${s > 0 ? "L" : "R"}`,
      },
    );
    const intake = b.part(new THREE.TorusGeometry(0.20, 0.028, 6, 12), CYAN_DARK, {
      bone: root,
      at: [s * 0.57, 1.01, -1.19],
      dir: [0, 0, 1],
      axis: "y",
      name: `intakeRing${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.035, 10), NAVY, {
      bone: root,
      at: [s * 0.57, 1.01, -1.205],
      dir: [0, 0, 1],
      axis: "y",
      name: `intakeFan${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 8), CYAN, {
      bone: root,
      at: [s * 0.57, 1.01, -1.23],
      dir: [0, 0, 1],
      axis: "y",
      name: `intakeHub${s > 0 ? "L" : "R"}`,
    });
    const exhaust = glow(
      b.part(new THREE.TorusGeometry(0.16, 0.045, 6, 12), ORANGE, {
        bone: root,
        at: [s * 0.57, 1.00, -2.30],
        dir: [0, 0, 1],
        axis: "y",
        name: `exhaustRing${s > 0 ? "L" : "R"}`,
      }),
      2.2,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.12, 0.18, 0.18, 10), ORANGE, {
        bone: root,
        at: [s * 0.57, 1.00, -2.38],
        dir: [0, 0, -1],
        axis: "y",
        name: `exhaustCore${s > 0 ? "L" : "R"}`,
      }),
      2.8,
    );
    // Small cyan service stripe follows each nacelle.
    b.rod([s * 0.79, 1.04, -1.42], [s * 0.79, 1.04, -1.98], 0.018, {
      bone: root,
      color: CYAN,
      name: `engineStripe${s > 0 ? "L" : "R"}`,
    });
    void pod;
    void intake;
    void exhaust;
  }

  // Underwing pylons and compact stylised missiles.
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 1.18, 1.00, -0.33],
      [s * 1.18, 0.86, -0.33],
      [0.16, 0.09],
      [0.10, 0.07],
      { bone: root, color: METAL, name: `pylon${s > 0 ? "L" : "R"}` },
    );
    const missile = b.sweep(
      polyline([
        [s * 1.18, 0.78, -0.23],
        [s * 1.18, 0.78, 0.53],
      ]),
      [0.085, 0.025],
      { bone: root, color: NAVY, caps: { start: "round", end: "point" }, section: { ngon: 6 }, name: `missile${s > 0 ? "L" : "R"}` },
    );
    b.rod([s * 1.18, 0.78, -0.05], [s * 1.18, 0.78, 0.38], 0.014, {
      bone: root,
      color: ORANGE,
      name: `missileStripe${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.032, 8), WARNING, {
      bone: root,
      at: [s * 1.18, 1.235, -0.34],
      name: `pylonLatch${s > 0 ? "L" : "R"}`,
    });
    void missile;
  }

  // Landing gear are explicit hinge bones, with chunky wheels and recessed gear doors.
  const gearL = b.joint("gearL", { parent: root, at: [0.66, 0.99, -0.50], dir: [0, -1, 0], role: "hinge" });
  const gearR = b.joint("gearR", { parent: root, at: [-0.66, 0.99, -0.50], dir: [0, -1, 0], role: "hinge" });
  const noseGear = b.joint("noseGear", { parent: root, at: [0, 1.18, 1.05], dir: [0, -1, 0], role: "hinge" });
  for (const [s, gear] of [[1, gearL], [-1, gearR]] as const) {
    b.rod([s * 0.66, 0.96, -0.50], [s * 0.66, 0.39, -0.45], 0.055, {
      bone: gear,
      color: METAL,
      section: { ngon: 6 },
      name: `mainStrut${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.66, 0.54, -0.47], [s * 0.66, 0.27, -0.40], 0.035, {
      bone: gear,
      color: NAVY,
      section: { ngon: 6 },
      name: `mainFork${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.16, 12), RUBBER, {
      bone: gear,
      at: [s * 0.66, 0.235, -0.40],
      dir: [1, 0, 0],
      axis: "y",
      name: `mainWheel${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.17, 10), CYAN_DARK, {
      bone: gear,
      at: [s * 0.66, 0.235, -0.40],
      dir: [1, 0, 0],
      axis: "y",
      name: `mainHub${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.28, 0.025, 0.40), BODY_LIGHT, {
      bone: gear,
      at: [s * 0.54, 0.83, -0.33],
      rotation: [0, 0, s * 12],
      name: `gearDoor${s > 0 ? "L" : "R"}`,
    });
  }
  b.rod([0, 1.14, 1.05], [0, 0.39, 1.10], 0.05, {
    bone: noseGear,
    color: METAL,
    section: { ngon: 6 },
    name: "noseStrut",
  });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.13, 12), RUBBER, {
    bone: noseGear,
    at: [0, 0.16, 1.12],
    dir: [1, 0, 0],
    axis: "y",
    name: "noseWheel",
  });
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.14, 10), CYAN_DARK, {
    bone: noseGear,
    at: [0, 0.16, 1.12],
    dir: [1, 0, 0],
    axis: "y",
    name: "noseHub",
  });
  b.part(new THREE.BoxGeometry(0.24, 0.025, 0.32), BODY_LIGHT, {
    bone: noseGear,
    at: [0, 0.92, 0.95],
    name: "noseGearDoor",
  });

  // Surface language: bold top stripe, segmented panel rails, and luminous navigation lights.
  b.part(new THREE.BoxGeometry(0.10, 0.035, 2.55), ORANGE, {
    bone: root,
    at: [0, 1.58, -0.13],
    name: "spineStripe",
  });
  for (const z of [-1.18, -0.48, 0.23, 0.92]) {
    b.rod([-0.53, 1.24 + (z + 0.5) * 0.045, z], [0.53, 1.24 + (z + 0.5) * 0.045, z], 0.012, {
      bone: root,
      color: NAVY,
      name: `panelSeam${z}`,
    });
  }
  glow(
    b.part(new THREE.SphereGeometry(0.07, 10, 6), CYAN, {
      bone: root,
      at: [0, 1.52, 2.12],
      name: "noseBeacon",
    }),
    1.8,
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.11, 0.035, 0.055), WARNING, {
        bone: root,
        at: [s * 0.57, 1.37, 1.12],
        name: `wingNav${s > 0 ? "L" : "R"}`,
      }),
      1.3,
    );
  }

  return b.root;
}
