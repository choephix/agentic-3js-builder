import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { glow } from "../kits/glow";

const TEAL = "#218b82";
const TEAL_DARK = "#17615f";
const MINT = "#70d0b3";
const CREAM = "#f3d596";
const CREAM_DARK = "#c7924b";
const ORANGE = "#ef7d32";
const ORANGE_DARK = "#b84e28";
const RUBBER = "#252b2a";
const RUBBER_HI = "#3f4a46";
const METAL = "#8faaa0";
const METAL_DARK = "#536b64";
const GLASS = "#8bd7d0";
const LAMP = "#ffe9a8";
const RED = "#dc5545";
const WHITE = "#fff2cf";

export const meta = {
  name: "Safari Jeep",
  description: "A cheerful open-top safari jeep with a roof rack, spare tyre, and expedition-ready details.",
  style: "whimsical",
  commit: "34f986c",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, depth: number, radial = 12) => new THREE.CylinderGeometry(r, r, depth, radial, 1);
const sphere = (r: number, ws = 12, hs = 8) => new THREE.SphereGeometry(r, ws, hs);

export default function build() {
  const b = createBuilder({ name: "safariJeep", detail: 1.15 });
  const chassis = b.joint("chassis", { at: [0, 0.72, 0], role: "spine" });

  // Main body: a friendly rounded utility shell with chunky fenders and contrasting belt line.
  b.part(box(1.65, 0.38, 2.55), TEAL, { bone: chassis, at: [0, 0.75, 0], name: "body" });
  b.part(box(1.72, 0.17, 2.35), TEAL_DARK, { bone: chassis, at: [0, 0.55, 0.02], name: "underbody" });
  b.part(box(1.74, 0.14, 2.3), ORANGE, { bone: chassis, at: [0, 0.93, -0.02], name: "beltStripe" });
  b.part(box(1.56, 0.12, 1.72), CREAM, { bone: chassis, at: [0, 1.02, -0.22], name: "cabinFloor" });

  // Tapered hood and nose, facing +Z.
  b.part(box(1.48, 0.25, 0.86), TEAL, { bone: chassis, at: [0, 1.02, 0.86], name: "hood" });
  b.part(box(1.28, 0.16, 0.16), CREAM_DARK, { bone: chassis, at: [0, 0.99, 1.31], name: "grilleBar" });
  b.part(box(1.18, 0.22, 0.12), METAL_DARK, { bone: chassis, at: [0, 0.79, 1.37], name: "frontBumper" });
  b.part(box(1.48, 0.12, 0.13), METAL, { bone: chassis, at: [0, 0.67, 1.34], name: "bumperHighlight" });
  for (const x of [-0.42, -0.14, 0.14, 0.42]) {
    b.part(box(0.07, 0.12, 0.03), RUBBER, { bone: chassis, at: [x, 0.99, 1.39], name: "grilleSlat" });
  }

  // Front cowl and open-top windshield frame.
  b.part(box(1.48, 0.18, 0.16), TEAL_DARK, { bone: chassis, at: [0, 1.21, 0.42], name: "dashBase" });
  b.part(box(1.22, 0.08, 0.09), METAL_DARK, { bone: chassis, at: [0, 1.32, 0.39], name: "dashTrim" });
  b.part(new THREE.PlaneGeometry(1.18, 0.42), GLASS, {
    bone: chassis,
    at: [0, 1.54, 0.44],
    dir: [0, 0.3, -1],
    axis: "z",
    name: "windshield",
  });
  for (const x of [-0.66, 0.66]) {
    b.part(cyl(0.045, 0.78, 8), CREAM_DARK, {
      bone: chassis,
      at: [x, 1.55, 0.4],
      dir: [0, 0.36, -1],
      name: "windshieldPost",
    });
  }
  b.part(cyl(0.048, 1.35, 8), CREAM_DARK, {
    bone: chassis,
    at: [0, 1.75, 0.38],
    dir: [1, 0, 0],
    name: "windshieldHeader",
  });

  // Cabin side rails and rear corner uprights keep the open roof silhouette readable.
  for (const s of [-1, 1]) {
    b.part(box(0.11, 0.78, 1.53), TEAL_DARK, { bone: chassis, at: [s * 0.76, 1.35, -0.28], name: "sideRail" });
    b.part(cyl(0.055, 0.78, 8), CREAM_DARK, { bone: chassis, at: [s * 0.75, 1.65, -0.92], dir: [0, 1, 0], name: "rearUpright" });
    b.part(box(0.08, 0.12, 1.52), ORANGE, { bone: chassis, at: [s * 0.81, 1.06, -0.25], name: "sideAccent" });
  }

  // Seats, cushions, and backrests in the open cabin.
  for (const x of [-0.43, 0.43]) {
    b.part(box(0.58, 0.14, 0.56), ORANGE, { bone: chassis, at: [x, 1.14, -0.32], name: "frontSeat" });
    b.part(box(0.58, 0.43, 0.14), ORANGE_DARK, { bone: chassis, at: [x, 1.36, -0.57], name: "frontBackrest" });
    b.part(box(0.68, 0.15, 0.48), CREAM, { bone: chassis, at: [x, 1.1, -0.98], name: "rearBench" });
    b.part(box(0.68, 0.34, 0.13), CREAM_DARK, { bone: chassis, at: [x, 1.3, -1.18], name: "rearBackrest" });
    b.part(cyl(0.035, 0.58, 8), METAL_DARK, { bone: chassis, at: [x, 1.52, -0.56], dir: [1, 0, 0], name: "seatTopRail" });
  }
  b.part(cyl(0.13, 0.035, 12), RUBBER, { bone: chassis, at: [-0.39, 1.36, 0.31], dir: [1, 0, 0], name: "steeringWheel" });
  b.part(cyl(0.09, 0.045, 10), CREAM_DARK, { bone: chassis, at: [-0.39, 1.36, 0.31], dir: [1, 0, 0], name: "steeringHub" });
  b.part(box(0.08, 0.05, 0.42), METAL_DARK, { bone: chassis, at: [-0.39, 1.23, 0.3], name: "steeringColumn" });
  b.part(sphere(0.045), ORANGE, { bone: chassis, at: [0.3, 1.39, 0.35], name: "dashCompass" });
  b.part(box(0.12, 0.09, 0.16), RUBBER_HI, { bone: chassis, at: [0.48, 1.38, 0.34], name: "dashRadio" });

  // Four rolling wheels have explicit hinge joints for rigging and animation.
  for (const s of [-1, 1]) {
    for (const z of [-0.8, 0.86]) {
      const wheel = b.joint(`wheel${s > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`, {
        parent: chassis,
        at: [s * 0.88, 0.395, z],
        dir: [1, 0, 0],
        role: "hinge",
      });
      b.part(cyl(0.39, 0.2, 14), RUBBER, { bone: wheel, at: [s * 0.88, 0.395, z], dir: [1, 0, 0], name: "tyre" });
      b.part(cyl(0.27, 0.215, 12), RUBBER_HI, { bone: wheel, at: [s * 0.88, 0.395, z], dir: [1, 0, 0], name: "sidewall" });
      b.part(cyl(0.16, 0.23, 12), CREAM_DARK, { bone: wheel, at: [s * 0.88, 0.395, z], dir: [1, 0, 0], name: "hub" });
      b.part(cyl(0.065, 0.24, 10), METAL, { bone: wheel, at: [s * 0.88, 0.395, z], dir: [1, 0, 0], name: "hubCap" });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(box(0.035, 0.08, 0.04), CREAM, {
          bone: wheel,
          at: [s * 1.005, 0.395 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2],
          rotation: [0, -a, 0],
          name: "hubBolt",
        });
      }
    }
  }

  // Curved-ish fender caps over all wheels and side steps.
  for (const s of [-1, 1]) {
    for (const z of [-0.8, 0.86]) {
      b.part(new THREE.TorusGeometry(0.43, 0.065, 6, 12, Math.PI), TEAL_DARK, {
        bone: chassis,
        at: [s * 0.79, 0.45, z],
        rotation: [Math.PI / 2, 0, 0],
        name: "fenderArch",
      });
    }
    b.part(box(0.12, 0.1, 1.1), CREAM_DARK, { bone: chassis, at: [s * 0.83, 0.56, 0.03], name: "sideStep" });
    b.part(cyl(0.055, 0.42, 8), METAL, { bone: chassis, at: [s * 0.89, 0.63, 0.03], dir: [1, 0, 0], name: "stepRail" });
  }

  // Lamps and playful face.
  for (const s of [-1, 1]) {
    glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12), LAMP, {
      bone: chassis,
      at: [s * 0.48, 1.03, 1.44],
      dir: [0, 0, 1],
      name: "headlamp",
    }), 1.7);
    b.part(new THREE.TorusGeometry(0.14, 0.025, 6, 12), ORANGE_DARK, { bone: chassis, at: [s * 0.48, 1.03, 1.47], name: "lampRim" });
    b.part(sphere(0.085), RED, { bone: chassis, at: [s * 0.57, 0.92, -1.34], name: "tailLamp" });
    b.part(sphere(0.07), WHITE, { bone: chassis, at: [s * 0.57, 0.8, -1.35], name: "reverseLamp" });
    b.part(sphere(0.07), RUBBER, { bone: chassis, at: [s * 0.91, 1.48, 0.37], name: "mirrorStem" });
    b.part(sphere(0.1), METAL, { bone: chassis, at: [s * 0.95, 1.55, 0.38], name: "mirror" });
  }
  b.part(box(0.44, 0.18, 0.04), WHITE, { bone: chassis, at: [0, 0.83, 1.45], name: "frontPlate" });
  b.part(box(0.32, 0.07, 0.04), ORANGE_DARK, { bone: chassis, at: [0, 0.83, 1.48], name: "plateMark" });

  // Rear bumper, tow hook and mud flap details.
  b.part(box(1.24, 0.19, 0.12), METAL_DARK, { bone: chassis, at: [0, 0.74, -1.36], name: "rearBumper" });
  b.part(cyl(0.05, 0.35, 8), CREAM_DARK, { bone: chassis, at: [0, 0.55, -1.42], dir: [0, 0, 1], name: "towHook" });
  for (const s of [-1, 1]) {
    b.part(box(0.18, 0.25, 0.06), RUBBER, { bone: chassis, at: [s * 0.6, 0.56, -1.38], name: "mudFlap" });
  }

  // Roof rack: four posts, long rails, crossbars, and riveted cargo basket.
  const rackY = 2.02;
  for (const s of [-1, 1]) {
    for (const z of [-0.84, 0.78]) {
      b.part(cyl(0.055, 0.5, 8), CREAM_DARK, { bone: chassis, at: [s * 0.6, rackY - 0.23, z], dir: [0, 1, 0], name: "rackPost" });
      b.part(sphere(0.08), ORANGE, { bone: chassis, at: [s * 0.6, rackY + 0.04, z], name: "rackFoot" });
    }
    b.part(cyl(0.065, 1.9, 8), CREAM_DARK, { bone: chassis, at: [s * 0.6, rackY + 0.05, -0.02], dir: [0, 0, 1], name: "rackRail" });
  }
  for (const z of [-0.58, 0.03, 0.64]) {
    b.part(cyl(0.055, 1.25, 8), CREAM_DARK, { bone: chassis, at: [0, rackY + 0.05, z], dir: [1, 0, 0], name: "rackCrossbar" });
  }
  b.part(box(1.28, 0.07, 1.82), METAL_DARK, { bone: chassis, at: [0, rackY - 0.01, -0.02], name: "rackBasket" });
  for (const s of [-1, 1]) {
    for (const z of [-0.75, -0.25, 0.25, 0.75]) {
      b.part(sphere(0.045), ORANGE, { bone: chassis, at: [s * 0.65, rackY + 0.05, z], name: "rackRivet" });
    }
  }
  // A rolled canvas bundle gives the rack a whimsical expedition story.
  b.part(cyl(0.14, 0.75, 12), ORANGE, { bone: chassis, at: [0.28, rackY + 0.22, -0.1], dir: [1, 0, 0], name: "rolledCanvas" });
  b.part(cyl(0.15, 0.04, 12), CREAM, { bone: chassis, at: [-0.12, rackY + 0.22, -0.1], dir: [1, 0, 0], name: "canvasEnd" });
  for (const x of [0.03, 0.37]) {
    b.part(cyl(0.018, 0.17, 6), TEAL_DARK, { bone: chassis, at: [x, rackY + 0.22, -0.1], dir: [1, 0, 0], name: "canvasStrap" });
  }

  // Rear-mounted spare tyre, held on a painted bracket.
  b.part(box(0.74, 0.1, 0.1), METAL_DARK, { bone: chassis, at: [0, 1.28, -1.43], name: "spareBracket" });
  b.part(cyl(0.35, 0.18, 14), RUBBER, { bone: chassis, at: [0, 1.35, -1.47], dir: [1, 0, 0], name: "spareTyre" });
  b.part(cyl(0.22, 0.2, 12), RUBBER_HI, { bone: chassis, at: [0, 1.35, -1.57], dir: [1, 0, 0], name: "spareSidewall" });
  b.part(cyl(0.13, 0.22, 12), ORANGE, { bone: chassis, at: [0, 1.35, -1.68], dir: [1, 0, 0], name: "spareHub" });
  b.part(cyl(0.06, 0.23, 10), CREAM, { bone: chassis, at: [0, 1.35, -1.76], dir: [1, 0, 0], name: "spareCap" });

  // A few tiny story details: aerial, pennant, and binocular-like rack cargo.
  b.part(cyl(0.018, 0.52, 6), METAL_DARK, { bone: chassis, at: [0.58, 1.9, 0.88], dir: [0.2, 1, 0], name: "aerial" });
  b.part(new THREE.PlaneGeometry(0.18, 0.12), ORANGE, {
    bone: chassis,
    at: [0.68, 2.1, 0.93],
    dir: [0, -0.7, 1],
    axis: "z",
    name: "pennant",
  });
  b.part(cyl(0.12, 0.3, 10), METAL_DARK, { bone: chassis, at: [-0.32, 2.2, 0.42], dir: [1, 0, 0], name: "cargoTube" });
  b.part(cyl(0.13, 0.04, 10), ORANGE, { bone: chassis, at: [-0.47, 2.2, 0.42], dir: [1, 0, 0], name: "cargoCap" });

  // Small rounded corner guards make the silhouette soft rather than purely boxy.
  for (const s of [-1, 1]) {
    b.part(sphere(0.14), MINT, { bone: chassis, at: [s * 0.78, 0.88, 1.17], name: "frontCornerGuard" });
    b.part(sphere(0.12), MINT, { bone: chassis, at: [s * 0.78, 0.86, -1.2], name: "rearCornerGuard" });
  }

  // Keep a frame handle in the build so the cabin garnish follows the root if posed.
  b.part(box(0.04, 0.04, 0.04), TEAL_DARK, { bone: chassis, frame: frame([0, 0.72, 0], [0, 1, 0]), name: "chassisMarker" });
  return b.root;
}
