import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

const INK = "#07101d";
const CARBON = "#101b2b";
const NAVY = "#1c3454";
const BLUE = "#3473c6";
const ICE = "#b9e7ff";
const WHITE = "#eef8ff";
const CYAN = "#35e7ff";
const ORANGE = "#ff793b";
const AMBER = "#ffc857";
const RED = "#ff435e";
const STEEL = "#536b84";

export const meta = {
  name: "Aero-Riot Hover Muscle Car",
  description: "A retro-future Overwatch-style muscle car with turbine hover pods, luminous cyan trim, and chunky racing armor.",
  style: "Overwatch",
  commit: "07503e3",
};

const side = (s: number) => s > 0 ? "L" : "R";

export default function build() {
  const b = createBuilder({ name: "hoverMuscleCar", detail: 1.1, paintSize: 1024 });
  const chassis = b.joint("chassis", { at: [0, 0.48, 0], dir: [0, 0, 1], role: "spine" });

  // Main silhouette: broad shoulder line, tapered nose, and a lifted rear deck.
b.part(new THREE.BoxGeometry(4.34, 0.38, 1.78), INK, {
    bone: chassis, at: [0, 0.47, 0], name: "lowerChassis", group: "body",
  });
  b.part(new THREE.BoxGeometry(3.92, 0.56, 1.62), BLUE, {
    bone: chassis, at: [0, 0.79, 0.02], name: "armoredShell", group: "body",
  });
  b.part(new THREE.BoxGeometry(2.72, 0.16, 1.0), ICE, {
    bone: chassis, at: [0, 1.14, 1.24], rotation: [-3, 0, 0], name: "hood", group: "body",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.035, 0.92), ORANGE, {
    bone: chassis, at: [0, 1.245, 1.24], rotation: [-3, 0, 0], name: "hoodStripe", group: "paint",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.42, 0.035, 0.12), INK, {
      bone: chassis, at: [s * 0.68, 1.245, 1.26], rotation: [-3, s * 12, 0], name: `hoodVent${side(s)}`, group: "vents",
    });
  }
  b.frustumBox([0, 1.02, -0.74], [0, 1.28, -1.68], [1.52, 0.39], [1.38, 0.31], {
    bone: chassis, color: NAVY, section: "box", name: "rearDeck", group: "body",
  });

  // Cockpit canopy and a thick roll spine.
  const canopy = b.part(new THREE.BoxGeometry(1.42, 0.42, 0.82), CARBON, {
    bone: chassis, at: [0, 1.34, -0.08], rotation: [-12, 0, 0], name: "canopy", group: "cockpit",
  });
  // A dark roof lip and roll spine keep the cockpit readable from every angle.
  b.part(new THREE.BoxGeometry(1.28, 0.12, 0.9), INK, {
    bone: chassis, at: [0, 1.49, 0.03], rotation: [-12, 0, 0], name: "canopyFrame", group: "cockpit",
  });
  b.frustumBox([-0.52, 1.57, -0.55], [0.52, 1.57, -0.55], [0.12, 0.1], [0.09, 0.1], {
    bone: chassis, color: ORANGE, name: "rollSpine", group: "cockpit",
  });
  b.rod([-0.58, 1.44, -0.64], [-0.58, 1.42, 0.44], 0.045, { bone: chassis, color: STEEL, name: "rollBarL", group: "cockpit" });
  b.rod([0.58, 1.44, -0.64], [0.58, 1.42, 0.44], 0.045, { bone: chassis, color: STEEL, name: "rollBarR", group: "cockpit" });

  // Nose grille, layered bumper, and expressive headlamps.
  b.part(new THREE.BoxGeometry(1.62, 0.3, 0.08), INK, { bone: chassis, at: [0, 0.72, 1.89], name: "grille", group: "nose" });
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.BoxGeometry(0.035, 0.2, 0.02), STEEL, { bone: chassis, at: [i * 0.2, 0.74, 1.94], name: `grilleBar${i + 3}`, group: "nose" });
  }
  b.rod([-1.72, 0.56, 1.88], [1.72, 0.56, 1.88], 0.075, { bone: chassis, color: STEEL, name: "frontBumper", group: "nose" });
  b.rod([-1.57, 0.66, 1.95], [1.57, 0.66, 1.95], 0.025, { bone: chassis, color: ORANGE, name: "bumperAccent", group: "nose" });
  for (const s of [-1, 1]) {
    const lamp = glow(b.part(new THREE.BoxGeometry(0.38, 0.12, 0.055), CYAN, {
      bone: chassis, at: [s * 0.92, 0.97, 1.92], rotation: [0, s * 8, 0], name: `headlamp${side(s)}`, group: "lighting",
    }), 1.5);
    b.part(new THREE.BoxGeometry(0.44, 0.04, 0.07), INK, {
      bone: chassis, at: [s * 0.92, 1.08, 1.91], rotation: [0, s * 8, 0], name: `lampBrow${side(s)}`, group: "lighting",
    });
    void lamp;
  }
  glow(b.part(new THREE.BoxGeometry(0.72, 0.06, 0.035), ORANGE, {
    bone: chassis, at: [0, 0.5, 1.96], name: "noseGlow", group: "lighting",
  }), 1.1);

  // Side armor plates, sill rails, vents and serial-like graphic strips.
  const sidePanel = [
    [0, 0], [1.2, 0], [1.38, 0.18], [1.2, 0.44], [0.68, 0.5], [0.42, 0.28], [0.05, 0.28], [-0.24, 0.5], [-1.15, 0.45], [-1.34, 0.18],
  ] as [number, number][];
  for (const s of [-1, 1]) {
    b.extrude(sidePanel, {
      at: [s * 0.9, 0.53, -0.36], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.055, bevel: 0.035,
      color: CARBON, bone: chassis, name: `sideArmor${side(s)}`, group: "armor",
    });
    b.extrude([[0, 0], [0.95, 0], [1.08, 0.08], [0.94, 0.14], [0.1, 0.14]], {
      at: [s * 0.934, 0.63, -0.27], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.018, bevel: 0.012,
      color: ORANGE, bone: chassis, name: `sideStripe${side(s)}`, group: "paint",
    });
    b.rod([s * 0.98, 0.48, -1.47], [s * 0.98, 0.48, 1.58], 0.035, { bone: chassis, color: STEEL, name: `sillRail${side(s)}`, group: "armor" });
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.018, 8), AMBER, {
        bone: chassis, at: [s * 0.96, 0.67, -1.1 + i * 0.38], rotation: [0, 0, 90], name: `sideRivet${side(s)}${i}`, group: "armor",
      });
    }
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.16, 0.025, 0.06), INK, {
        bone: chassis, at: [s * 0.97, 1.0, -0.55 + i * 0.14], rotation: [0, 0, s * 10], name: `vent${side(s)}${i}`, group: "vents",
      });
    }
    b.part(new THREE.BoxGeometry(0.42, 0.18, 0.025), WHITE, {
      bone: chassis, at: [s * 0.971, 0.92, -1.04], rotation: [0, 0, s * 6], name: `serialBadge${side(s)}`, group: "paint",
    });
  }

  // Rear haunches, spoiler, taillights, and exhaust-like hover diffuser.
  b.rod([-1.62, 0.8, -1.78], [1.62, 0.8, -1.78], 0.08, { bone: chassis, color: STEEL, name: "rearBumper", group: "rear" });
  b.part(new THREE.BoxGeometry(2.78, 0.11, 0.12), CARBON, { bone: chassis, at: [0, 1.48, -1.55], rotation: [0, -8, 0], name: "spoiler", group: "rear" });
  b.rod([-1.28, 1.45, -1.55], [-1.1, 1.3, -1.4], 0.035, { bone: chassis, color: ORANGE, name: "spoilerMountL", group: "rear" });
  b.rod([1.28, 1.45, -1.55], [1.1, 1.3, -1.4], 0.035, { bone: chassis, color: ORANGE, name: "spoilerMountR", group: "rear" });
  for (const s of [-1, 1]) {
    glow(b.part(new THREE.BoxGeometry(0.65, 0.1, 0.045), RED, { bone: chassis, at: [s * 0.86, 1.02, -1.81], name: `tailLight${side(s)}`, group: "lighting" }), 1.1);
  }
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.13, 10), INK, { bone: chassis, at: [s * 0.62, 0.53, -1.91], rotation: [90, 0, 0], name: `diffuser${side(s)}`, group: "rear" });
    glow(b.part(new THREE.CylinderGeometry(0.09, 0.12, 0.02, 10), CYAN, { bone: chassis, at: [s * 0.62, 0.53, -1.985], rotation: [90, 0, 0], name: `diffuserGlow${side(s)}`, group: "lighting" }), 1.7);
  }

  // Four articulated hover turbine pods; each has a hinge bone and layered turbine face.
  const podZs = [1.02, -1.06];
  for (const s of [-1, 1]) {
    for (let zi = 0; zi < podZs.length; zi++) {
      const x = s * 1.43;
      const z = podZs[zi];
      const key = `${side(s)}${zi === 0 ? "F" : "R"}`;
      const pod = b.joint(`thruster${key}`, { parent: chassis, at: [x, 0.5, z], dir: [0, -1, 0], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.36, 0.42, 0.24, 12), NAVY, { bone: pod, at: [x, 0.42, z], rotation: [0, 0, 90], name: `podHousing${key}`, group: "thrusters" });
      b.part(new THREE.CylinderGeometry(0.27, 0.29, 0.26, 12), CARBON, { bone: pod, at: [x, 0.41, z], rotation: [0, 0, 90], name: `podCore${key}`, group: "thrusters" });
      glow(b.part(new THREE.CylinderGeometry(0.19, 0.21, 0.02, 12), CYAN, { bone: pod, at: [x + s * 0.25, 0.42, z], rotation: [0, 0, 90], name: `podGlow${key}`, group: "lighting" }), 2);
      glow(b.part(new THREE.TorusGeometry(0.24, 0.025, 6, 12), CYAN, { bone: pod, at: [x + s * 0.27, 0.42, z], rotation: [0, 0, 90], name: `podRing${key}`, group: "lighting" }), 1.5);
      for (let vane = 0; vane < 6; vane++) {
        const a = vane * 60;
        b.part(new THREE.BoxGeometry(0.035, 0.23, 0.07), ORANGE, {
          bone: pod, at: [x + s * 0.28, 0.42, z], rotation: [0, a, 18], name: `podVane${key}${vane}`, group: "thrusters",
        });
      }
      b.part(new THREE.BoxGeometry(0.16, 0.08, 0.03), WHITE, { bone: pod, at: [x + s * 0.29, 0.42, z + 0.19], name: `podMarker${key}`, group: "thrusters" });
      b.rod([s * 0.8, 0.58, z], [s * 1.31, 0.58, z], 0.07, { bone: chassis, color: STEEL, name: `podMount${key}`, group: "thrusters" });
      b.rod([x - 0.18, 0.66, z], [x + 0.18, 0.66, z], 0.025, { bone: pod, color: STEEL, name: `podBrace${key}`, group: "thrusters" });
    }
  }

  // Hover-field rails and cyan underside conduits.
  for (const s of [-1, 1]) {
    b.rod([s * 1.18, 0.33, -1.34], [s * 1.18, 0.3, 1.5], 0.04, { bone: chassis, color: CYAN, name: `fieldRail${side(s)}`, group: "energy" });
    const conduit = catmull([[s * 1.08, 0.47, -1.4], [s * 1.12, 0.27, -0.8], [s * 1.08, 0.25, 0.2], [s * 1.12, 0.42, 1.36]]);
    glow(b.sweep(conduit, 0.025, { bone: chassis, color: CYAN, name: `energyConduit${side(s)}`, group: "energy" }), 1.4);
  }

  // Two antenna fins and a compact rear tech rack.
  b.extrude([[0, 0], [0.42, 0.02], [0.3, 0.34], [0.1, 0.48], [0, 0.16]], {
    at: [-0.2, 1.46, -1.12], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.045, bevel: 0.018, color: ORANGE, bone: chassis, name: "aeroFinL", group: "aero",
  });
  b.extrude([[0, 0], [0.42, 0.02], [0.3, 0.34], [0.1, 0.48], [0, 0.16]], {
    at: [0.2, 1.46, -1.12], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.045, bevel: 0.018, color: ORANGE, bone: chassis, name: "aeroFinR", group: "aero",
  });
  for (let i = -2; i <= 2; i++) {
    b.part(new THREE.BoxGeometry(0.18, 0.03, 0.5), STEEL, { bone: chassis, at: [i * 0.22, 1.34, -1.55], name: `rearRack${i + 2}`, group: "rear" });
  }

  // A small transparent-looking cyan windshield slit made as a bright inset.
  const glass = svg(`<svg viewBox="0 0 128 32"><path d="M4 27 L22 6 L106 6 L124 27 Z" fill="#35e7ff"/><path d="M26 22 L102 22" stroke="#eef8ff" stroke-width="4" opacity=".85"/><path d="M50 7 L42 27 M78 7 L86 27" stroke="#07101d" stroke-width="4" opacity=".7"/></svg>`, { size: 256 });
  b.decal(canopy, glass, { at: [0, 1.47, 0.31], dir: [0, 0.15, 1], up: [0, 1, 0], size: [1.15, 0.3], lift: 0.008, name: "windshieldGraphic", group: "cockpit" });

  // Floating stance: the lowest turbine glow nearly kisses the floor.
  return b.root;
}
