import * as THREE from "three";
import { createBuilder } from "../src/builder";

const RED = "#c72f38";
const RED_DARK = "#701e2a";
const BLACK = "#11151b";
const RUBBER = "#20242a";
const CARBON = "#2a3038";
const STEEL = "#5b6875";
const GOLD = "#e4a932";
const CYAN = "#36c9d4";
const WHITE = "#e8edf2";
const YELLOW = "#e6c13f";

export const meta = {
  name: "Apex Arrow Formula Racer",
  description: "A low-poly open-wheel formula racing car with faceted aero, exposed suspension, and a tiny open cockpit.",
  style: "low-poly",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "formulaRacer", detail: 1 });
  const chassis = b.joint("chassis", { at: [0, 0.38, 0], dir: [0, 0, 1], role: "spine" });

  const wheelY = 0.355;
  const wheelX = 0.91;
  const frontZ = 1.13;
  const rearZ = -1.16;
  const wheels = [
    ["wheelFL", wheelX, frontZ],
    ["wheelFR", -wheelX, frontZ],
    ["wheelRL", wheelX, rearZ],
    ["wheelRR", -wheelX, rearZ],
  ] as const;
  const wheelJoints = wheels.map(([name, x, z]) =>
    b.joint(name, { parent: chassis, at: [x, wheelY, z], dir: [1, 0, 0], role: "hinge" }),
  );

  const steering = b.joint("steering", { parent: chassis, at: [0, 0.83, 0.04], dir: [1, 0, 0], role: "hinge" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: string) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: chassis,
      at,
      flat: true,
      name,
    });

  const rod = (name: string, a: [number, number, number], c: [number, number, number], radius: number, color: string) =>
    b.rod(a, c, radius, {
      bone: chassis,
      color,
      section: { ngon: 6 },
      caps: "flat",
      name,
    });

  // Low, angular monocoque and tapered nose cone.
  b.frustumBox([0, 0.57, -1.48], [0, 0.62, -0.55], [1.28, 0.38], [1.15, 0.48], {
    bone: chassis,
    color: RED,
    name: "rearMonocoque",
  });
  b.frustumBox([0, 0.62, -0.55], [0, 0.58, 0.78], [1.15, 0.48], [0.92, 0.42], {
    bone: chassis,
    color: RED,
    name: "centerMonocoque",
  });
  b.frustumBox([0, 0.58, 0.78], [0, 0.49, 1.78], [0.92, 0.42], [0.25, 0.16], {
    bone: chassis,
    color: RED,
    name: "noseCone",
  });
  box("floorPan", [1.76, 0.12, 3.28], [0, 0.43, 0.02], RED_DARK);
  box("frontNoseTop", [0.42, 0.12, 0.66], [0, 0.76, 1.26], RED);

  // Sidepods, cooling inlets, and dark carbon underbody details.
  for (const side of [-1, 1] as const) {
    box(`sidepod${side > 0 ? "L" : "R"}`, [0.34, 0.29, 0.94], [side * 0.62, 0.59, -0.36], RED_DARK);
    box(`sidepodTop${side > 0 ? "L" : "R"}`, [0.30, 0.055, 0.66], [side * 0.62, 0.75, -0.33], RED);
    box(`coolingInlet${side > 0 ? "L" : "R"}`, [0.025, 0.16, 0.34], [side * 0.80, 0.68, -0.34], BLACK);
    box(`floorRail${side > 0 ? "L" : "R"}`, [0.09, 0.07, 2.22], [side * 0.83, 0.42, -0.05], CARBON);
  }
  box("diffuser", [1.35, 0.13, 0.36], [0, 0.43, -1.61], CARBON);
  for (const side of [-1, 1] as const) {
    box(`diffuserFin${side > 0 ? "L" : "R"}`, [0.045, 0.18, 0.34], [side * 0.54, 0.52, -1.70], STEEL);
  }

  // Open cockpit lip, seat, and a visible faceted driver helmet.
  box("cockpitOpening", [0.57, 0.08, 0.74], [0, 0.88, -0.04], BLACK);
  box("seatBack", [0.34, 0.30, 0.40], [0, 0.97, -0.23], CARBON);
  box("seatBase", [0.39, 0.07, 0.42], [0, 0.82, 0.02], BLACK);
  box("cockpitRim", [0.72, 0.07, 0.88], [0, 0.91, -0.05], RED_DARK);
  const helmet = b.part(new THREE.SphereGeometry(0.205, 8, 5), YELLOW, {
    bone: chassis,
    at: [0, 1.13, 0.10],
    flat: true,
    name: "driverHelmet",
  });
  box("helmetVisor", [0.28, 0.09, 0.035], [0, 1.13, 0.285], BLACK);
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.07, 8), CYAN, {
    bone: chassis,
    at: [0, 1.25, 0.10],
    flat: true,
    name: "helmetBand",
  });
  void helmet;
  rod("haloL", [-0.25, 0.92, 0.18], [-0.17, 1.27, 0.16], 0.024, STEEL);
  rod("haloR", [0.25, 0.92, 0.18], [0.17, 1.27, 0.16], 0.024, STEEL);
  rod("haloTop", [-0.17, 1.27, 0.16], [0.17, 1.27, 0.16], 0.024, STEEL);

  // Front wing: two crisp planes and end plates below the nose.
  box("frontWingMain", [2.08, 0.07, 0.27], [0, 0.28, 1.78], CARBON);
  box("frontWingFlap", [1.70, 0.055, 0.18], [0, 0.36, 1.67], RED);
  for (const side of [-1, 1] as const) {
    box(`frontEndplate${side > 0 ? "L" : "R"}`, [0.07, 0.29, 0.24], [side * 0.97, 0.40, 1.76], RED);
    box(`frontWingTip${side > 0 ? "L" : "R"}`, [0.13, 0.035, 0.36], [side * 0.88, 0.33, 1.62], CYAN);
    rod(`nosePylon${side > 0 ? "L" : "R"}`, [side * 0.19, 0.38, 1.66], [side * 0.22, 0.66, 1.30], 0.028, STEEL);
  }

  // Rear wing and tall endplates make the silhouette legible from every angle.
  box("rearWingMain", [1.65, 0.10, 0.24], [0, 1.33, -1.55], CARBON);
  box("rearWingFlap", [1.46, 0.08, 0.18], [0, 1.52, -1.60], RED);
  for (const side of [-1, 1] as const) {
    box(`rearEndplate${side > 0 ? "L" : "R"}`, [0.07, 0.54, 0.22], [side * 0.80, 1.25, -1.56], RED_DARK);
    box(`rearEndplateStripe${side > 0 ? "L" : "R"}`, [0.075, 0.06, 0.23], [side * 0.80, 1.43, -1.56], GOLD);
  }
  rod("rearWingPylonL", [-0.23, 0.75, -1.38], [-0.23, 1.30, -1.55], 0.035, STEEL);
  rod("rearWingPylonR", [0.23, 0.75, -1.38], [0.23, 1.30, -1.55], 0.035, STEEL);

  // Four independent hinge wheels, with faceted tyres, hubs, and brake discs.
  for (let i = 0; i < wheels.length; i += 1) {
    const [name, x, z] = wheels[i];
    const wheel = wheelJoints[i];
    b.part(new THREE.TorusGeometry(0.265, 0.09, 6, 12), RUBBER, {
      bone: wheel,
      dir: [1, 0, 0],
      axis: "z",
      flat: true,
      name: `${name}Tyre`,
    });
    b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.075, 8), STEEL, {
      bone: wheel,
      dir: [1, 0, 0],
      axis: "y",
      flat: true,
      name: `${name}Rim`,
    });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.082, 8), GOLD, {
      bone: wheel,
      dir: [1, 0, 0],
      axis: "y",
      flat: true,
      name: `${name}Hub`,
    });
    b.part(new THREE.CylinderGeometry(0.225, 0.225, 0.018, 10), RED_DARK, {
      bone: wheel,
      at: [x + (x > 0 ? 0.045 : -0.045), wheelY, z],
      dir: [1, 0, 0],
      axis: "y",
      flat: true,
      name: `${name}BrakeDisc`,
    });
    rod(`${name}UpperArm`, [x * 0.54, 0.70, z + (z > 0 ? -0.10 : 0.10)], [x * 0.90, wheelY + 0.17, z], 0.025, STEEL);
    rod(`${name}LowerArm`, [x * 0.47, 0.48, z + (z > 0 ? 0.10 : -0.10)], [x * 0.90, wheelY - 0.10, z], 0.032, CARBON);
    rod(`${name}Pushrod`, [x * 0.48, 0.72, z], [x * 0.90, wheelY + 0.11, z], 0.018, GOLD);
  }

  // Steering column, steering wheel, and small faceted control spokes.
  rod("steeringColumn", [0, 0.73, -0.01], [0, 0.88, 0.16], 0.025, STEEL);
  b.part(new THREE.TorusGeometry(0.115, 0.018, 6, 10), BLACK, {
    bone: steering,
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
    name: "steeringWheel",
  });
  for (const side of [-1, 1] as const) {
    rod(`steeringSpoke${side > 0 ? "L" : "R"}`, [0, 0.88, 0.16], [side * 0.09, 0.88, 0.16], 0.012, GOLD);
  }

  // Side mirrors and a low-profile intake behind the driver's head.
  for (const side of [-1, 1] as const) {
    rod(`mirrorStem${side > 0 ? "L" : "R"}`, [side * 0.40, 0.80, 0.55], [side * 0.72, 0.91, 0.58], 0.018, STEEL);
    box(`mirror${side > 0 ? "L" : "R"}`, [0.12, 0.09, 0.18], [side * 0.76, 0.93, 0.58], BLACK);
  }
  box("airbox", [0.42, 0.40, 0.38], [0, 0.99, -0.73], CARBON);
  box("airboxOpening", [0.25, 0.16, 0.035], [0, 1.13, -0.53], BLACK);

  // A few bright arrow-like trim bars provide a single clean accent across the faceted body.
  box("noseAccent", [0.09, 0.035, 0.64], [0, 0.75, 1.24], CYAN);
  box("rearAccent", [0.72, 0.035, 0.08], [0, 0.81, -1.25], GOLD);
  box("numberPanel", [0.52, 0.025, 0.28], [0, 0.84, 0.62], WHITE);

  return b.root;
}
