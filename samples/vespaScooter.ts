import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

const INK = "#211329";
const RUBBER = "#242039";
const TEAL = cel("#39d9d0", "#137f9e");
const TEAL_DARK = cel("#168fa8", "#0c496e");
const CORAL = cel("#ff7080", "#b6385c");
const CREAM = cel("#fff0d1", "#e7b580");
const GOLD = cel("#ffd15c", "#ad5b26");
const WOOD = cel("#c77b47", "#713b3e");
const WOOD_LIGHT = cel("#efb568", "#a6563c");
const CHROME = cel("#e4f7ef", "#73a9b9");
const LAMP = "#bafcff";
const TAIL_LAMP = "#ff416a";

export const meta = {
  name: "Aurora Courier Vespa",
  description: "An Italian-style anime delivery scooter with jewel-toned bodywork, gold trim, glowing lamps, and two lovingly strapped wooden courier crates.",
  style: "Genshin/anime mix",
  commit: "67d30d1",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "vespaScooter", detail: 0.85, paintSize: 1024 });

  const chassis = b.joint("chassis", { at: [0, 0.48, 0], dir: [0, 1, 0], role: "spine" });
  const rearWheel = b.joint("wheelRear", { parent: chassis, at: [0, 0.235, -0.72], dir: [1, 0, 0], role: "hinge" });
  const frontWheel = b.joint("wheelFront", { parent: chassis, at: [0, 0.235, 0.77], dir: [1, 0, 0], role: "hinge" });
  const steering = b.joint("steering", { parent: chassis, at: [0, 0.79, 0.47], dir: [0, 1, 0], role: "hinge" });
  const cargoLidL = b.joint("cargoLidL", { parent: chassis, at: [0.18, 1.13, -0.88], dir: [1, 0, 0], role: "hinge" });
  const cargoLidR = b.joint("cargoLidR", { parent: chassis, at: [-0.18, 1.13, -0.88], dir: [1, 0, 0], role: "hinge" });

  const box = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: Fill,
    bone: JointRef = chassis,
    rotation?: readonly [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { name, bone, at, rotation, flat: true });
  };

  const cyl = (
    name: string,
    radius: number,
    depth: number,
    at: readonly [number, number, number],
    color: Fill,
    bone: JointRef = chassis,
    dir: readonly [number, number, number] = [0, 1, 0],
    radial = 12,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, b.segments(radial)), color, {
      name,
      bone,
      at,
      dir,
      axis: "y",
      flat: true,
    });
  };

  const sphere = (
    name: string,
    radius: number,
    at: readonly [number, number, number],
    scale: readonly [number, number, number],
    color: Fill,
    bone: JointRef = chassis,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, b.segments(12), b.segments(8)), color, { name, bone, at, scale, flat: true });
  };

  const tube = (
    name: string,
    a: readonly [number, number, number],
    z: readonly [number, number, number],
    radius: number,
    color: Fill,
    bone: JointRef = chassis,
  ) => {
    return b.rod(a, z, radius, { name, color, bone, sides: 8, smooth: false });
  };

  // Low, swept chassis and cream apron establish the unmistakable scooter silhouette.
  box("deck", [0.52, 0.14, 1.12], [0, 0.48, -0.01], TEAL_DARK);
  box("deckTop", [0.43, 0.045, 0.84], [0, 0.57, -0.02], CREAM);
  box("bodyRear", [0.49, 0.32, 0.48], [0, 0.69, -0.38], TEAL);
  box("bodyRearBelly", [0.53, 0.12, 0.44], [0, 0.53, -0.38], CORAL);
  box("frontCowl", [0.46, 0.45, 0.39], [0, 0.77, 0.40], TEAL, chassis, [10, 0, 0]);
  box("frontCowlShadow", [0.38, 0.08, 0.31], [0, 0.60, 0.48], TEAL_DARK, chassis, [10, 0, 0]);
  box("apron", [0.41, 0.47, 0.10], [0, 0.75, 0.58], CREAM, chassis, [12, 0, 0]);
  box("apronInset", [0.29, 0.30, 0.018], [0, 0.77, 0.638], CORAL, chassis, [12, 0, 0]);

  // Gold piping is deliberately oversized, like a magical-girl costume seam.
  tube("apronTrimL", [-0.185, 0.58, 0.63], [-0.16, 0.91, 0.66], 0.012, GOLD);
  tube("apronTrimR", [0.185, 0.58, 0.63], [0.16, 0.91, 0.66], 0.012, GOLD);
  tube("deckTrimL", [-0.27, 0.57, -0.50], [-0.27, 0.57, 0.46], 0.011, GOLD);
  tube("deckTrimR", [0.27, 0.57, -0.50], [0.27, 0.57, 0.46], 0.011, GOLD);

  // Wheels, jewel-like hubs, and concentric rings.
  for (const [side, wheel, z] of [["rear", rearWheel, -0.72], ["front", frontWheel, 0.77]] as const) {
    cyl(`${side}Tire`, 0.235, 0.13, [0, 0.235, z], RUBBER, wheel, [1, 0, 0], 14);
    cyl(`${side}Whitewall`, 0.164, 0.137, [0, 0.235, z], CREAM, wheel, [1, 0, 0], 14);
    cyl(`${side}Hub`, 0.105, 0.15, [0, 0.235, z], GOLD, wheel, [1, 0, 0], 10);
    cyl(`${side}HubInset`, 0.060, 0.158, [0, 0.235, z], TEAL_DARK, wheel, [1, 0, 0], 10);
    cyl(`${side}AxleCap`, 0.025, 0.18, [0, 0.235, z], CHROME, wheel, [1, 0, 0], 8);
    b.part(new THREE.TorusGeometry(0.222, 0.018, 5, b.segments(16)), CORAL, {
      name: `${side}Rim`, bone: wheel, at: [0, 0.235, z], dir: [1, 0, 0], axis: "z", flat: true,
    });
  }

  // Fork blades and fender lip connect the front hinge to the cowl.
  tube("forkL", [-0.12, 0.31, 0.77], [-0.12, 0.88, 0.50], 0.027, CHROME, frontWheel);
  tube("forkR", [0.12, 0.31, 0.77], [0.12, 0.88, 0.50], 0.027, CHROME, frontWheel);
  box("frontFender", [0.46, 0.075, 0.26], [0, 0.51, 0.75], CORAL, frontWheel);
  tube("rearFenderEdge", [-0.23, 0.48, -0.83], [0.23, 0.48, -0.83], 0.016, GOLD);

  // Plush seat and stitched gold rails.
  box("seatBase", [0.43, 0.10, 0.52], [0, 0.84, -0.10], TEAL_DARK);
  sphere("seatCushion", 1, [0, 0.91, -0.10], [0.225, 0.095, 0.29], CORAL);
  tube("seatRailL", [-0.20, 0.80, -0.37], [-0.20, 0.80, 0.13], 0.010, GOLD);
  tube("seatRailR", [0.20, 0.80, -0.37], [0.20, 0.80, 0.13], 0.010, GOLD);
  for (const x of [-0.12, 0, 0.12]) cyl(`seatStitch${x}`, 0.009, 0.026, [x, 1.005, -0.10], GOLD, chassis, [0, 1, 0], 6);

  // Steering column, anime-sized handlebar, mirrors, and grips.
  tube("steeringStem", [0, 0.71, 0.47], [0, 1.25, 0.72], 0.044, GOLD, steering);
  box("handlebarCore", [0.56, 0.055, 0.055], [0, 1.27, 0.72], CHROME, steering);
  tube("gripL", [-0.29, 1.27, 0.72], [-0.40, 1.27, 0.72], 0.035, CORAL, steering);
  tube("gripR", [0.29, 1.27, 0.72], [0.40, 1.27, 0.72], 0.035, CORAL, steering);
  sphere("gripEndL", 0.04, [-0.405, 1.27, 0.72], [1, 0.7, 0.7], GOLD, steering);
  sphere("gripEndR", 0.04, [0.405, 1.27, 0.72], [1, 0.7, 0.7], GOLD, steering);
  tube("mirrorStemL", [-0.22, 1.30, 0.72], [-0.30, 1.40, 0.69], 0.012, GOLD, steering);
  tube("mirrorStemR", [0.22, 1.30, 0.72], [0.30, 1.40, 0.69], 0.012, GOLD, steering);
  box("mirrorL", [0.13, 0.08, 0.055], [-0.34, 1.43, 0.68], CREAM, steering, [0, -14, -12]);
  box("mirrorR", [0.13, 0.08, 0.055], [0.34, 1.43, 0.68], CREAM, steering, [0, 14, 12]);
  box("mirrorInsetL", [0.08, 0.04, 0.012], [-0.34, 1.43, 0.712], TEAL_DARK, steering);
  box("mirrorInsetR", [0.08, 0.04, 0.012], [0.34, 1.43, 0.712], TEAL_DARK, steering);

  // Glowing headlamp and tail lamp provide the elemental accent.
  cyl("lampHousing", 0.105, 0.055, [0, 0.89, 0.66], GOLD, chassis, [0, 0, 1], 12);
  const headLamp = cyl("headLamp", 0.073, 0.062, [0, 0.89, 0.695], LAMP, chassis, [0, 0, 1], 12);
  glow(headLamp, 1.8);
  cyl("tailHousing", 0.09, 0.045, [0, 0.75, -0.625], GOLD, chassis, [0, 0, 1], 10);
  const tailLamp = cyl("tailLamp", 0.060, 0.050, [0, 0.75, -0.654], TAIL_LAMP, chassis, [0, 0, 1], 10);
  glow(tailLamp, 1.4);

  // Hexagonal elemental badge and a small glowing center on the apron.
  cyl("apronBadge", 0.092, 0.024, [0, 0.82, 0.663], GOLD, chassis, [0, 0, 1], 6);
  const badgeCore = cyl("apronBadgeCore", 0.048, 0.030, [0, 0.82, 0.681], LAMP, chassis, [0, 0, 1], 6);
  glow(badgeCore, 1.2);

  // Two delivery crates: corner posts, lids, slats, metal bands, and labels.
  for (const [side, x, lid] of [["L", -0.18, cargoLidL], ["R", 0.18, cargoLidR]] as const) {
    const z = -0.88;
    box(`crate${side}Core`, [0.31, 0.34, 0.33], [x, 0.97, z], WOOD);
    box(`crate${side}Lid`, [0.33, 0.038, 0.35], [x, 1.16, z], WOOD_LIGHT, lid);
    for (const dx of [-0.13, 0.13]) for (const dz of [-0.14, 0.14]) {
      box(`crate${side}Post${dx}${dz}`, [0.028, 0.36, 0.028], [x + dx, 0.98, z + dz], WOOD_LIGHT);
    }
    for (const y of [0.84, 1.06]) {
      box(`crate${side}BandFront${y}`, [0.34, 0.028, 0.021], [x, y, z + 0.17], GOLD);
      box(`crate${side}BandBack${y}`, [0.34, 0.028, 0.021], [x, y, z - 0.17], GOLD);
    }
    for (const dx of [-0.09, 0, 0.09]) box(`crate${side}Slat${dx}`, [0.023, 0.21, 0.018], [x + dx, 0.97, z + 0.175], WOOD_LIGHT);
    box(`crate${side}Label`, [0.18, 0.11, 0.012], [x, 0.98, z + 0.178], CREAM);
    box(`crate${side}LabelBar`, [0.12, 0.018, 0.018], [x, 0.98, z + 0.188], CORAL);
    box(`crate${side}Latch`, [0.045, 0.05, 0.014], [x, 1.17, z + 0.18], GOLD, lid);
  }

  // Rear rack, tie-down straps, and dangling charms make the cargo feel carried.
  box("rackPlatform", [0.60, 0.06, 0.56], [0, 0.79, -0.77], TEAL_DARK);
  tube("rackSupportL", [-0.24, 0.60, -0.52], [-0.24, 0.79, -0.68], 0.025, GOLD);
  tube("rackSupportR", [0.24, 0.60, -0.52], [0.24, 0.79, -0.68], 0.025, GOLD);
  tube("rackRailL", [-0.28, 0.78, -0.60], [-0.28, 0.78, -1.12], 0.014, GOLD);
  tube("rackRailR", [0.28, 0.78, -0.60], [0.28, 0.78, -1.12], 0.014, GOLD);
  tube("rackCross", [-0.28, 0.78, -1.12], [0.28, 0.78, -1.12], 0.014, GOLD);
  for (const x of [-0.18, 0.18]) {
    tube(`strap${x}`, [x, 1.17, -0.72], [x, 0.79, -1.05], 0.012, CORAL);
    sphere(`charm${x}`, 0.025, [x * 1.15, 0.72, -1.15], [0.7, 1.3, 0.7], GOLD);
  }

  // Painted anime-style ink seams break up broad body planes without adding a logo.
  const inkPanel = inkLines(TEAL, { levels: [0.05], axis: [0, 0, 1], width: 0.035, ink: INK });
  box("inkedSidePanel", [0.012, 0.22, 0.31], [-0.252, 0.70, -0.34], inkPanel);
  box("inkedSidePanelR", [0.012, 0.22, 0.31], [0.252, 0.70, -0.34], inkPanel);

  // Tiny fasteners repeat evenly along the fairing.
  for (const x of [-0.19, 0.19]) for (const z of [0.28, 0.43, 0.58]) {
    cyl(`fairingRivet${x}${z}`, 0.012, 0.018, [x, 0.76, z], GOLD, chassis, [0, 0, 1], 6);
  }

  return b.root;
}
