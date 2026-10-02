import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { polyline } from "../src/path";
import { glow } from "../kits/glow";

const NAVY = "#101a2c";
const STEEL = "#263c5b";
const CYAN = "#5ef1ff";
const ICE = "#d9f4ff";
const CORAL = "#ff5a3c";
const GOLD = "#ffbf3f";
const BLACK = "#0b0d14";
const RUBBER = "#11141d";
const CHROME = "#8fa9bf";

export const meta = {
  name: "Neon Trailbreaker",
  description: "A custom Overwatch-style chopper motorbike with a stretched frame, turbine engine, luminous headlamp and boldly panelled bodywork.",
  style: "Overwatch",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike", detail: 0.85 });
  const seg = (n: number) => b.segments(n);

  // The frame is the single root, with true hinge joints on both wheels and the steering fork.
  const chassis = b.joint("chassis", { at: [0, 0.86, 0], dir: [0, 0, 1], role: "spine" });
  const rearWheel = b.joint("rearWheel", { parent: chassis, at: [0, 0.4, -1.32], dir: [1, 0, 0], role: "hinge" });
  const steering = b.joint("steering", { parent: chassis, at: [0, 1.12, 0.93], dir: [0, 0, 1], role: "hinge" });
  const frontWheel = b.joint("frontWheel", { parent: steering, at: [0, 0.4, 1.64], dir: [1, 0, 0], role: "hinge" });

  // Wide low-poly tires, five broad spokes, and hub caps keep the wheels readable at every angle.
  for (const side of [-1, 1]) {
    const x = side * 0.095;
    b.part(new THREE.CylinderGeometry(0.405, 0.405, 0.17, seg(12)), RUBBER, {
      bone: rearWheel,
      at: [x, 0.4, -1.32],
      dir: [1, 0, 0],
      name: `rearTire${side < 0 ? "R" : "L"}`,
    });
    b.part(new THREE.CylinderGeometry(0.405, 0.405, 0.17, seg(12)), RUBBER, {
      bone: frontWheel,
      at: [x, 0.4, 1.64],
      dir: [1, 0, 0],
      name: `frontTire${side < 0 ? "R" : "L"}`,
    });
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.19, seg(10)), STEEL, {
      bone: rearWheel,
      at: [x, 0.4, -1.32],
      dir: [1, 0, 0],
      name: `rearRim${side < 0 ? "R" : "L"}`,
    });
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.19, seg(10)), STEEL, {
      bone: frontWheel,
      at: [x, 0.4, 1.64],
      dir: [1, 0, 0],
      name: `frontRim${side < 0 ? "R" : "L"}`,
    });
    const hubRear: [number, number, number] = [x, 0.4, -1.32];
    const hubFront: [number, number, number] = [x, 0.4, 1.64];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * 0.19;
      const dz = Math.sin(a) * 0.19;
      b.rod(hubRear, [x, 0.4 + dz, -1.32 + dx], 0.018, { bone: rearWheel, color: CYAN, name: `rearSpoke${side < 0 ? "R" : "L"}${i}` });
      b.rod(hubFront, [x, 0.4 + dz, 1.64 + dx], 0.018, { bone: frontWheel, color: CYAN, name: `frontSpoke${side < 0 ? "R" : "L"}${i}` });
    }
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.22, seg(8)), GOLD, {
      bone: side < 0 ? rearWheel : frontWheel,
      at: [x, 0.4, side < 0 ? -1.32 : 1.64],
      dir: [1, 0, 0],
      name: `axleCap${side < 0 ? "rear" : "front"}${side < 0 ? "R" : "L"}`,
    });
  }

  // Long square-section backbone and the low swept cradle under the engine.
  b.sweep(polyline([[0, 0.72, -1.22], [0, 0.79, -0.42], [0, 0.89, 0.25], [0, 1.01, 0.93]]), [0.075, 0.09], {
    bone: chassis, section: "box", color: STEEL, caps: "flat", name: "backbone",
  });
  b.sweep(polyline([[-0.23, 0.84, -0.63], [-0.3, 0.68, -0.2], [-0.27, 0.56, 0.52], [0, 0.62, 0.86]]), [0.06, 0.065], {
    bone: chassis, section: "box", color: NAVY, caps: "round", name: "cradleL",
  });
  b.sweep(polyline([[0.23, 0.84, -0.63], [0.3, 0.68, -0.2], [0.27, 0.56, 0.52], [0, 0.62, 0.86]]), [0.06, 0.065], {
    bone: chassis, section: "box", color: NAVY, caps: "round", name: "cradleR",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.07, 0.76), CORAL, { bone: chassis, at: [0, 0.96, -0.36], name: "frameAccent" });

  // Turbine-like engine block with twin cylinders and luminous cooling rings.
  b.part(new THREE.BoxGeometry(0.48, 0.4, 0.58), NAVY, { bone: chassis, at: [0, 0.75, 0.02], name: "engineCase" });
  for (const s of [-1, 1]) {
    const ex = s * 0.23;
    b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.42, seg(8)), STEEL, {
      bone: chassis, at: [ex, 0.89, 0.1], rotation: [0, 0, 90], name: `cylinder${s < 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.035, seg(8)), CYAN, {
      bone: chassis, at: [ex, 0.89, 0.31], rotation: [0, 0, 90], name: `coolingRing${s < 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.03, 0.3, 0.36), BLACK, { bone: chassis, at: [ex, 0.9, -0.1], name: `cylinderSlot${s < 0 ? "L" : "R"}` });
  }
  const crank = b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.53, seg(10)), BLACK, {
    bone: chassis, at: [0, 0.65, 0.02], rotation: [Math.PI / 2, 0, 0], name: "crankHousing",
  });
  glow(crank, 0.55);
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.56, seg(8)), GOLD, {
    bone: chassis, at: [0, 0.65, 0.02], rotation: [Math.PI / 2, 0, 0], name: "crankPin",
  });

  // Angular fuel tank, inset orange flank panels, and floating black saddle.
  b.part(new THREE.SphereGeometry(1, seg(10), seg(6)).scale(0.38, 0.23, 0.58), STEEL, {
    bone: chassis, at: [0, 1.16, 0.28], name: "fuelTank",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.16, 0.44), CORAL, { bone: chassis, at: [-0.39, 1.17, 0.28], name: "tankPanelL" });
  b.part(new THREE.BoxGeometry(0.02, 0.16, 0.44), CORAL, { bone: chassis, at: [0.39, 1.17, 0.28], name: "tankPanelR" });
  b.part(new THREE.BoxGeometry(0.29, 0.075, 0.43), BLACK, { bone: chassis, at: [0, 1.17, -0.56], name: "saddle" });
  b.part(new THREE.BoxGeometry(0.29, 0.12, 0.12), NAVY, { bone: chassis, at: [0, 1.24, -0.86], name: "saddleBack" });
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.36), GOLD, { bone: chassis, at: [0, 1.255, -0.56], name: "saddleTrim" });

  // Front fork, triangular brace, and a compact steering yoke.
  for (const s of [-1, 1]) {
    b.rod([s * 0.16, 1.16, 0.99], [s * 0.12, 0.47, 1.64], 0.043, { bone: steering, color: CHROME, name: `fork${s < 0 ? "L" : "R"}` });
    b.rod([s * 0.17, 1.18, 0.97], [s * 0.24, 0.91, 0.52], 0.028, { bone: steering, color: CORAL, name: `forkBrace${s < 0 ? "L" : "R"}` });
  }
  b.part(new THREE.BoxGeometry(0.44, 0.11, 0.18), STEEL, { bone: steering, at: [0, 1.13, 0.97], name: "steeringYoke" });
  b.rod([-0.58, 1.39, 0.94], [0.58, 1.39, 0.94], 0.035, { bone: steering, color: BLACK, name: "handlebar" });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.18, seg(8)), CORAL, { bone: steering, at: [-0.62, 1.39, 0.94], dir: [1, 0, 0], name: "gripL" });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.18, seg(8)), CORAL, { bone: steering, at: [0.62, 1.39, 0.94], dir: [1, 0, 0], name: "gripR" });

  // Headlamp and two side marker lights are the single strong accent in the silhouette.
  const lamp = b.part(new THREE.CylinderGeometry(0.19, 0.22, 0.12, seg(10)), GOLD, {
    bone: steering, at: [0, 1.36, 1.16], dir: [0, 0, 1], name: "headlampHousing",
  });
  glow(lamp, 0.7);
  const lens = b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.025, seg(10)), ICE, {
    bone: steering, at: [0, 1.36, 1.235], dir: [0, 0, 1], name: "headlampLens",
  });
  glow(lens, 2);
  for (const s of [-1, 1]) {
    const marker = b.part(new THREE.SphereGeometry(0.055, seg(7), seg(5)), CYAN, { bone: steering, at: [s * 0.27, 1.24, 1.07], name: `marker${s < 0 ? "L" : "R"}` });
    glow(marker, 1.2);
  }

  // Twin upswept exhausts with crisp gold heat shields and cyan outlet rings.
  for (const s of [-1, 1]) {
    const exhaust = b.sweep(polyline([[s * 0.28, 0.68, -0.34], [s * 0.4, 0.61, -0.64], [s * 0.42, 0.76, -1.05], [s * 0.42, 0.98, -1.18]]), [0.055, 0.075], {
      bone: chassis, section: "box", color: CHROME, caps: "round", name: `exhaust${s < 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.025, 0.2, 0.28), GOLD, { bone: chassis, at: [s * 0.455, 0.83, -0.86], name: `heatShield${s < 0 ? "L" : "R"}` });
    const outlet = b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.045, seg(8)), CYAN, { bone: chassis, at: [s * 0.42, 1.03, -1.22], dir: [0, 1, 0], name: `outlet${s < 0 ? "L" : "R"}` });
    glow(outlet, 1.1);
    void exhaust;
  }

  // A small rear fender and visible tail light finish the custom silhouette.
  b.sweep(polyline([[-0.32, 0.57, -1.08], [-0.37, 0.72, -1.31], [-0.27, 0.86, -1.52], [0, 0.9, -1.61]]), [0.035, 0.055], {
    bone: chassis, section: "box", color: STEEL, caps: "round", name: "rearFenderL",
  });
  b.sweep(polyline([[0.32, 0.57, -1.08], [0.37, 0.72, -1.31], [0.27, 0.86, -1.52], [0, 0.9, -1.61]]), [0.035, 0.055], {
    bone: chassis, section: "box", color: STEEL, caps: "round", name: "rearFenderR",
  });
  const tail = b.part(new THREE.BoxGeometry(0.16, 0.1, 0.07), CORAL, { bone: chassis, at: [0, 1.01, -1.52], name: "tailLight" });
  glow(tail, 0.9);
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.42), GOLD, { bone: chassis, at: [0, 0.91, -1.22], name: "rearTrim" });

  // Perforated brake discs and calipers add mechanical detail without softening the bold silhouette.
  for (const s of [-1, 1]) {
    const brakeDiscRear = b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.025, seg(10)), ICE, {
      bone: rearWheel, at: [s * 0.195, 0.4, -1.32], dir: [1, 0, 0], name: `rearBrakeDisc${s < 0 ? "R" : "L"}`,
    });
    const brakeDiscFront = b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.025, seg(10)), ICE, {
      bone: frontWheel, at: [s * 0.195, 0.4, 1.64], dir: [1, 0, 0], name: `frontBrakeDisc${s < 0 ? "R" : "L"}`,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.1), CORAL, {
      bone: rearWheel, at: [s * 0.22, 0.51, -1.31], name: `rearCaliper${s < 0 ? "R" : "L"}`,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.1), CORAL, {
      bone: frontWheel, at: [s * 0.22, 0.51, 1.65], name: `frontCaliper${s < 0 ? "R" : "L"}`,
    });
    glow(brakeDiscRear, 0.25);
    glow(brakeDiscFront, 0.25);
  }

  // Narrow front mudguard and a visor over the lamp make the front end feel engineered rather than toy-like.
  b.part(new THREE.BoxGeometry(0.27, 0.055, 0.13), NAVY, { bone: steering, at: [0, 0.85, 1.64], name: "frontFender" });
  b.part(new THREE.BoxGeometry(0.29, 0.035, 0.08), BLACK, { bone: steering, at: [0, 1.49, 1.12], name: "lampVisor" });

  return b.root;
}
