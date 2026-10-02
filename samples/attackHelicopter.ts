import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
const OLIVE = "#596548";
const OLIVE_LIGHT = "#788563";
const OLIVE_DARK = "#263126";
const CHARCOAL = "#182027";
const METAL = "#8b8f83";
const SAND = "#b8a47a";
const GLASS = "#1d4850";
const ORANGE = "#d87830";
const RED = "#a63d2b";

export const meta = {
  name: "Tandem Attack Helicopter",
  description: "A faceted low-poly tandem-seat attack helicopter with a long tail boom, counter-rotating-looking rotors, skids, and twin chin guns.",
  style: "low-poly",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "attackHelicopter", detail: 1 });

  const root = b.joint("fuselage", { at: [0, 1.55, 0], dir: [0, 0, 1], role: "spine" });
  const mast = b.joint("mainRotor", { parent: root, at: [0, 2.58, -0.05], dir: [0, 1, 0], role: "hinge" });
  const tailRotor = b.joint("tailRotor", { parent: root, at: [0.28, 1.9, -5.3], dir: [0, 0, 1], role: "hinge" });
  const gunPivot = b.joint("gunPivot", { parent: root, at: [0, 1.05, 1.28], dir: [0, 0, 1], role: "hinge" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: string, opts: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      name,
      bone: root,
      at,
      flat: true,
      ...opts,
    });

  const rotorBox = (name: string, size: [number, number, number], color: string, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(...size), color, { name, bone: mast, at: [0, 2.58, -0.05], rotation, flat: true });

  // The faceted fuselage is broad at the tandem cockpit and pinches into the tail.
  b.loft(
    [
      { at: [0, 1.48, -1.55], w: 0.82, h: 0.66 },
      { at: [0, 1.47, -0.85], w: 1.22, h: 0.92 },
      { at: [0, 1.48, 0.15], w: 1.34, h: 1.02 },
      { at: [0, 1.5, 0.88], w: 1.16, h: 0.93 },
      { at: [0, 1.54, 1.48], w: 0.82, h: 0.72 },
      { at: [0, 1.57, 1.78], w: 0.46, h: 0.42 },
    ],
    { name: "armoredFuselage", color: OLIVE, bone: root, section: { ngon: 6 }, caps: "flat" },
  );

  // Two separate dark canopy sections read as the tandem seats, with an armored divider between them.
  b.loft(
    [
      { at: [0, 1.9, 0.22], w: 0.91, h: 0.46 },
      { at: [0, 1.96, 0.82], w: 0.85, h: 0.51 },
      { at: [0, 1.94, 1.27], w: 0.65, h: 0.43 },
    ],
    { name: "frontCanopy", color: GLASS, bone: root, section: { ngon: 6 }, caps: "flat" },
  );
  b.loft(
    [
      { at: [0, 1.93, -0.58], w: 0.96, h: 0.5 },
      { at: [0, 1.98, -0.2], w: 0.91, h: 0.53 },
      { at: [0, 1.9, 0.02], w: 0.72, h: 0.45 },
    ],
    { name: "rearCanopy", color: GLASS, bone: root, section: { ngon: 6 }, caps: "flat" },
  );
  box("canopyDivider", [0.18, 0.58, 0.2], [0, 2.03, 0.06], OLIVE_DARK);
  box("canopyBrow", [1.0, 0.1, 0.16], [0, 2.17, 0.88], OLIVE_LIGHT);
  box("canopyBrowRear", [1.05, 0.1, 0.16], [0, 2.17, -0.52], OLIVE_LIGHT);

  // Nose armor, chin, sensor, and a pair of bright identification slashes.
  box("chinArmor", [1.03, 0.22, 0.72], [0, 1.04, 1.23], OLIVE_DARK);
  box("nosePlate", [0.7, 0.18, 0.34], [0, 1.42, 1.7], OLIVE_LIGHT);
  box("sensorHousing", [0.28, 0.24, 0.28], [0, 1.23, 1.93], CHARCOAL);
  for (const s of [-1, 1]) {
    box(`noseStripe${s}`, [0.055, 0.19, 0.28], [s * 0.36, 1.52, 1.75], ORANGE);
    box(`sideArmor${s}`, [0.16, 0.48, 0.78], [s * 0.69, 1.37, 0.1], OLIVE_DARK);
    box(`sideCheek${s}`, [0.18, 0.24, 0.48], [s * 0.62, 1.04, 1.16], SAND);
    box(`weaponPylon${s}`, [0.14, 0.18, 0.8], [s * 0.98, 0.86, 0.18], CHARCOAL);
    b.rod([s * 1.0, 0.86, -0.2], [s * 1.0, 0.86, 0.64], 0.1, {
      name: `rocketPod${s}`,
      bone: root,
      color: CHARCOAL,
      section: { ngon: 6 },
      caps: "flat",
    });
    b.spike([s * 1.0, 0.86, 0.64], [0, 0, 1], 0.22, 0.1, { name: `rocketNose${s}`, bone: root, color: SAND });
    box(`rocketFin${s}`, [0.3, 0.08, 0.25], [s * 1.0, 0.74, 0.05], OLIVE_LIGHT);
    box(`rocketBand${s}`, [0.22, 0.025, 0.08], [s * 1.0, 0.95, 0.42], ORANGE);
  }

  // Tapered boom and angular tail surfaces.
  const boomPath = catmull([
    [0, 1.56, -1.3],
    [0, 1.61, -2.6],
    [0, 1.73, -4.15],
    [0, 1.87, -5.28],
  ]);
  b.sweep(boomPath, [0.39, 0.12], {
    name: "tailBoom",
    color: OLIVE,
    bone: root,
    section: { ngon: 5 },
    caps: "flat",
  });
  box("tailFin", [0.1, 1.05, 0.72], [0, 2.22, -4.42], OLIVE_DARK, { rotation: [-0.2, 0, 0] });
  box("tailplaneL", [1.62, 0.1, 0.46], [0.58, 1.78, -4.48], OLIVE_LIGHT, { rotation: [0, 0.08, -0.08] });
  box("tailplaneR", [1.62, 0.1, 0.46], [-0.58, 1.78, -4.48], OLIVE_LIGHT, { rotation: [0, -0.08, 0.08] });
  box("tailCap", [0.3, 0.3, 0.34], [0, 1.92, -5.34], CHARCOAL);

  // Low-poly faceted panels and fasteners keep the broad silhouette readable.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i += 1) {
      const z = -0.92 + i * 0.44;
      box(`panel${s}_${i}`, [0.035, 0.3, 0.28], [s * 0.79, 1.63, z], i % 2 ? OLIVE_LIGHT : OLIVE_DARK);
      b.part(new THREE.SphereGeometry(0.035, 6, 4), METAL, {
        name: `rivet${s}_${i}`,
        bone: root,
        at: [s * 0.82, 1.82, z + 0.11],
        flat: true,
      });
    }
  }
  box("topSpine", [0.24, 0.16, 1.45], [0, 2.15, -1.05], OLIVE_LIGHT);
  box("engineDeck", [1.35, 0.18, 0.52], [0, 2.02, -1.0], OLIVE_DARK);
  box("exhaustL", [0.25, 0.25, 0.46], [-0.64, 1.95, -1.28], CHARCOAL);
  box("exhaustR", [0.25, 0.25, 0.46], [0.64, 1.95, -1.28], CHARCOAL);
  box("exhaustGlowL", [0.12, 0.12, 0.05], [-0.64, 1.94, -1.53], RED);
  box("exhaustGlowR", [0.12, 0.12, 0.05], [0.64, 1.94, -1.53], RED);

  // Main mast, hub, and crossed blades are attached to the hinge joint.
  b.part(new THREE.CylinderGeometry(0.11, 0.14, 0.78, 6), CHARCOAL, { name: "mast", bone: mast, at: [0, 2.2, -0.05], flat: true });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 6), METAL, { name: "mainHub", bone: mast, at: [0, 2.58, -0.05], flat: true });
  rotorBox("mainBladeFore", [0.26, 0.07, 7.2], CHARCOAL);
  rotorBox("mainBladeCross", [7.2, 0.07, 0.26], CHARCOAL, [0, 0.25, 0]);
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.45), ORANGE, { name: "bladeTipL", bone: mast, at: [3.55, 2.59, -0.05], flat: true });
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.45), ORANGE, { name: "bladeTipR", bone: mast, at: [-3.55, 2.59, -0.05], flat: true });

  // Twin chin guns share a yaw hinge so they read as a moving weapon mount.
  b.part(new THREE.CylinderGeometry(0.2, 0.23, 0.3, 6), CHARCOAL, { name: "gunMount", bone: gunPivot, at: [0, 1.05, 1.28], flat: true });
  for (const s of [-1, 1]) {
    b.rod([s * 0.24, 1.02, 1.24], [s * 0.24, 1.02, 2.08], 0.075, { name: `chinGun${s}`, bone: gunPivot, color: CHARCOAL, section: { ngon: 6 }, caps: "flat" });
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 6), METAL, {
      name: `gunMuzzle${s}`,
      bone: gunPivot,
      at: [s * 0.24, 1.02, 2.1],
      dir: [0, 0, 1],
      flat: true,
    });
  }

  // Skid gear keeps the machine standing exactly above y=0.
  for (const s of [-1, 1]) {
    b.rod([s * 0.74, 1.1, -0.93], [s * 1.02, 0.2, -0.95], 0.085, { name: `frontStrut${s}`, bone: root, color: CHARCOAL, section: { ngon: 6 }, caps: "flat" });
    b.rod([s * 0.74, 1.08, 0.58], [s * 1.02, 0.2, 0.62], 0.085, { name: `rearStrut${s}`, bone: root, color: CHARCOAL, section: { ngon: 6 }, caps: "flat" });
    b.rod([s * 1.02, 0.12, -1.32], [s * 1.02, 0.12, 1.18], 0.11, { name: `skid${s}`, bone: root, color: CHARCOAL, section: { ngon: 6 }, caps: "round" });
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 6), METAL, { name: `skidFoot${s}`, bone: root, at: [s * 1.02, 0.12, -1.25], dir: [0, 0, 1], flat: true });
  }

  // Tail rotor: two offset blades on a vertical plane, driven by its own hinge.
  b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.28, 6), METAL, { name: "tailHub", bone: tailRotor, at: [0.28, 1.9, -5.3], dir: [0, 0, 1], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 1.3, 0.08), CHARCOAL, { name: "tailBladeVertical", bone: tailRotor, at: [0.28, 1.9, -5.3], flat: true });
  b.part(new THREE.BoxGeometry(1.3, 0.1, 0.08), CHARCOAL, { name: "tailBladeHorizontal", bone: tailRotor, at: [0.28, 1.9, -5.3], flat: true });
  b.part(new THREE.BoxGeometry(0.16, 0.16, 0.09), ORANGE, { name: "tailBladeMark", bone: tailRotor, at: [0.28, 2.41, -5.3], flat: true });

  // A few asymmetric maintenance marks make the otherwise clean faceting feel used.
  box("maintenancePanel", [0.42, 0.02, 0.23], [0.47, 2.12, -0.58], SAND);
  box("warningStripe", [0.08, 0.025, 0.23], [0.55, 2.14, -0.58], RED);

  return b.root;
}
