import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { catmull } from "../src/path";
import { paint, stripes } from "../src/paint";
import { rng } from "../src/math";
import { cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Aurora Bush Seaplane",
  description: "A jewel-bright Genshin Impact bush plane with twin floats, ornate gold trim, and glowing navigation lamps.",
  style: "Genshin Impact",
  commit: "e503085",
};

const TEAL = cel("#27b9c2", "#176f96");
const DEEP_TEAL = cel("#147b9b", "#103f72");
const SKY = cel("#75d9e0", "#318cae");
const CREAM = cel("#fff0c5", "#d59b76");
const CORAL = cel("#ff795e", "#bc3f56");
const GOLD = cel("#ffd45d", "#b97931");
const NAVY = cel("#193a65", "#101c4a");
const GLASS = cel("#244b78", "#12264e");
const DARK = "#152341";
const LAMP_CYAN = "#75f4ff";
const LAMP_AMBER = "#ffcc6a";

const BODY = cel(
  furEdge(TEAL, CREAM, {
    level: -0.18,
    teeth: 0.12,
    period: 0.32,
    axis: [0, 1, 0],
    along: [0, 0, 1],
    ink: INK,
    inkWidth: 0.035,
  }),
);
const WING_PAINT = cel(stripes(SKY, ["#f7e7b4", CORAL], { size: 1.7, width: 0.24, wobble: 0.12, seed: 41 }));
const FLOAT_PAINT = cel(
  furEdge("#e8fbef", DEEP_TEAL, { level: 0.06, teeth: 0.07, period: 0.2, axis: [0, 1, 0], along: [0, 0, 1], ink: INK }),
);
const GOLD_LINE = paint((_p, n) => (n.y > 0.1 ? "#fff1a0" : "#b87935"));

export default function build() {
  const b = createBuilder({ name: "bushSeaplane", detail: 1, paintSize: 1024 });
  const random = rng(90210);
  const root = b.joint("airframe", { at: [0, 1.45, 0], dir: [0, 0, 1], role: "spine", group: "airframe" });

  const box = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: Fill,
    rotation?: readonly [number, number, number],
    bone = root,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      name,
      bone,
      at,
      rotation,
      flat: true,
    });
  const cyl = (
    name: string,
    radius: number,
    depth: number,
    at: readonly [number, number, number],
    color: Fill,
    rotation: readonly [number, number, number] = [0, 0, 0],
    bone = root,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, b.segments(10), 1), color, {
      name,
      bone,
      at,
      rotation,
      flat: true,
    });
  const sphere = (
    name: string,
    radius: number,
    at: readonly [number, number, number],
    scale: readonly [number, number, number],
    color: Fill,
    bone = root,
  ) =>
    b.part(new THREE.SphereGeometry(radius, b.segments(12), b.segments(8)), color, {
      name,
      bone,
      at,
      scale,
      flat: true,
    });

  // Twin floats form the grounded silhouette and carry inset gold runners and tie-down bands.
  for (const side of [-1, 1]) {
    const x = side * 1.42;
    const float = b.sweep(
      catmull([
        [x, 0.34, -3.0],
        [x, 0.29, -2.55],
        [x, 0.27, -1.15],
        [x, 0.28, 1.1],
        [x, 0.34, 2.75],
        [x, 0.46, 3.18],
      ]),
      (t) => [0.28 - 0.07 * t, 0.2 - 0.045 * t],
      {
        name: `float${side > 0 ? "L" : "R"}`,
        bone: root,
        section: "box",
        caps: "round",
        color: FLOAT_PAINT,
        up: [0, 1, 0],
      },
    );
    b.sweep(float.curve(), 0.035, {
      name: `floatRunner${side > 0 ? "L" : "R"}`,
      bone: root,
      color: GOLD_LINE,
      caps: "round",
      shift: [0, -0.245],
      section: { ngon: 5 },
      detail: 0.6,
    });
    for (const z of [-2.15, -1.05, 0.2, 1.5, 2.45]) {
      const wobble = (random() - 0.5) * 0.025;
      box(`floatBand${side > 0 ? "L" : "R"}${z}`, [0.61, 0.035, 0.09], [x, 0.33 + wobble, z], GOLD, [0, 0, 0]);
    }
    // Struts and diagonal bracing from each float into the wing and belly.
    b.rod([x, 0.54, -1.7], [side * 1.12, 2.08, -1.15], 0.055, { name: `frontStrut${side}`, color: GOLD, section: { ngon: 5 } });
    b.rod([x, 0.5, 1.75], [side * 1.1, 2.34, 1.15], 0.05, { name: `rearStrut${side}`, color: GOLD, section: { ngon: 5 } });
    b.rod([x, 0.62, -0.75], [side * 0.8, 2.48, -0.15], 0.035, { name: `brace${side}`, color: CORAL, section: { ngon: 5 } });
    for (const z of [-1.7, 1.75]) sphere(`strutBolt${side}${z}`, 0.075, [side * 1.1, z < 0 ? 2.08 : 2.34, z < 0 ? -1.15 : 1.15], [1, 0.55, 0.55], GOLD);
  }

  // Long faceted fuselage, with a painted cream belly and a bright dorsal spine.
  const fuselage = b.loft(
    [
      { at: [0, 1.82, -3.65], w: 0.56, h: 0.62 },
      { at: [0, 1.88, -2.9], w: 0.8, h: 0.8 },
      { at: [0, 2.02, -1.55], w: 1.02, h: 1.0 },
      { at: [0, 2.16, 0.4], w: 1.18, h: 1.12 },
      { at: [0, 2.26, 1.75], w: 1.0, h: 1.02 },
      { at: [0, 2.31, 2.75], w: 0.82, h: 0.82 },
      { at: [0, 2.34, 3.42], w: 0.7, h: 0.7 },
    ],
    {
      name: "fuselage",
      bone: root,
      color: BODY,
      section: { ngon: 8 },
      caps: "round",
      up: [0, 1, 0],
      shift: (t) => [0, -0.015 + 0.03 * Math.sin(t * Math.PI)],
    },
  );

  // Gold belt and nose cheek pieces make the silhouette legible in a top-down camera.
  for (const z of [-2.72, -1.6, 0.15, 1.78, 2.72]) {
    b.sweep(fuselage.curve().slice(Math.max(0, 0.02 + (z + 3.6) / 7.2 - 0.018), Math.min(1, 0.02 + (z + 3.6) / 7.2 + 0.018)), 0.018, {
      name: `fuselageBelt${z}`,
      bone: root,
      color: GOLD,
      caps: "round",
      detail: 0.5,
    });
  }
  box("bellyKeel", [0.22, 0.22, 4.25], [0, 1.55, -0.05], DEEP_TEAL, [0, 0, 0]);
  box("dorsalSpine", [0.3, 0.15, 3.1], [0, 2.72, -0.12], CORAL, [0, 0, 0]);

  // Broad swept wings: one faceted extruded slab each, with a gold leading edge and coral tips.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0.0, -0.58, "sharp"],
        [side * 1.45, -0.58, "sharp"],
        [side * 4.35, -0.35, "sharp"],
        [side * 4.45, 0.04, "sharp"],
        [side * 1.25, 0.18, "sharp"],
        [0.0, 0.3, "sharp"],
      ],
      {
        name: `mainWing${side > 0 ? "L" : "R"}`,
        at: [0, 2.68, 0.22],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.14,
        bevel: 0.025,
        color: WING_PAINT,
      },
    );
    // A narrow sculptural cap on the wing edge.
    b.rod([side * 0.35, 2.79, -0.35], [side * 4.3, 2.78, 0.01], 0.055, { name: `wingGoldEdge${side}`, color: GOLD, section: { ngon: 5 } });
    box(`wingTip${side}`, [0.22, 0.2, 0.52], [side * 4.28, 2.67, 0.0], CORAL, [0, side * 0.15, side * 0.05]);
    // Aileron with an explicit hinge bone as required for moving surfaces.
    const aileron = b.joint(`aileron${side > 0 ? "L" : "R"}`, { parent: root, at: [side * 3.25, 2.73, -0.32], dir: [0, 1, 0], role: "hinge", group: "controls" });
    box(`aileronPanel${side}`, [1.65, 0.08, 0.32], [side * 3.25, 2.63, -0.32], CORAL, [0, 0, side * 0.06], aileron);
    box(`aileronTrim${side}`, [1.58, 0.025, 0.045], [side * 3.25, 2.69, -0.48], GOLD, [0, 0, side * 0.06], aileron);
  }

  // Tailplane, vertical fin, and three little rudder hinges.
  for (const side of [-1, 1]) {
    b.extrude(
      [[0, -0.48, "sharp"], [side * 1.72, -0.35, "sharp"], [side * 1.82, -0.05, "sharp"], [side * 0.5, 0.18, "sharp"], [0, 0.2, "sharp"]],
      {
        name: `tailplane${side > 0 ? "L" : "R"}`,
        at: [0, 2.02, -3.02],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.11,
        bevel: 0.02,
        color: SKY,
      },
    );
    b.rod([side * 0.15, 2.13, -3.12], [side * 1.65, 2.12, -3.12], 0.035, { name: `tailGold${side}`, color: GOLD, section: { ngon: 5 } });
  }
  b.extrude(
    [[-0.2, 0, "sharp"], [0.28, 0.15, "sharp"], [0.44, 1.05, "sharp"], [0.2, 1.62, "sharp"], [-0.2, 1.35, "sharp"], [-0.32, 0.32, "sharp"]],
    { name: "tailFin", at: [0, 2.05, -3.0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.13, bevel: 0.03, color: CORAL },
  );
  const rudder = b.joint("rudder", { parent: root, at: [0, 2.55, -3.0], dir: [0, 1, 0], role: "hinge", group: "controls" });
  box("rudderPanel", [0.09, 0.95, 0.18], [0, 2.72, -3.02], GOLD, [0, 0, 0], rudder);

  // Rounded cabin canopy, framed windows, and two decorative roof rails.
  box("cabinRoof", [1.3, 0.16, 1.45], [0, 3.02, 1.25], CREAM, [0, 0, 0]);
  box("cabinNose", [1.18, 0.16, 0.2], [0, 2.86, 2.02], GOLD, [0, 0, 0]);
  for (const side of [-1, 1]) {
    const x = side * 0.62;
    for (const z of [0.72, 1.25, 1.78]) {
      box(`window${side}${z}`, [0.035, 0.46, 0.37], [x, 2.78 + (z - 1.25) * 0.05, z], GLASS, [0, side * 0.18, 0]);
      box(`windowGold${side}${z}`, [0.05, 0.055, 0.42], [side * 0.65, 3.03, z], GOLD, [0, side * 0.18, 0]);
    }
    b.rod([side * 0.68, 2.88, 0.48], [side * 0.68, 2.99, 2.08], 0.035, { name: `cabinRail${side}`, color: GOLD, section: { ngon: 5 } });
  }
  box("frontWindshield", [0.94, 0.42, 0.06], [0, 2.81, 2.15], GLASS, [0.22, 0, 0]);
  box("dashboard", [0.86, 0.08, 0.3], [0, 2.65, 2.18], NAVY, [0, 0, 0]);

  // Engine cowl and layered intake rings.
  sphere("engineCowl", 0.78, [0, 2.3, 3.42], [0.9, 0.9, 0.72], CORAL);
  cyl("cowlGoldRing", 0.68, 0.14, [0, 2.3, 3.92], GOLD, [Math.PI / 2, 0, 0]);
  cyl("cowlDarkMouth", 0.53, 0.16, [0, 2.3, 4.0], DARK, [Math.PI / 2, 0, 0]);
  cyl("cowlInnerGlow", 0.33, 0.17, [0, 2.3, 4.1], LAMP_AMBER, [Math.PI / 2, 0, 0]);
  const prop = b.joint("propeller", { parent: root, at: [0, 2.3, 4.14], dir: [0, 0, 1], role: "hinge", group: "engine" });
  cyl("propHub", 0.18, 0.24, [0, 2.3, 4.23], GOLD, [Math.PI / 2, 0, 0], prop);
  for (const deg of [0, 120, 240]) {
    const rad = (deg * Math.PI) / 180;
    box(`propBlade${deg}`, [0.13, 1.45, 0.07], [Math.sin(rad) * 0.55, 2.3 + Math.cos(rad) * 0.55, 4.25], CREAM, [0, 0, deg + 18], prop);
  }

  // Gold instrument rivets and panel bolts, deliberately small but repeated for a dressed hero asset.
  for (const side of [-1, 1]) {
    for (const z of [-2.55, -1.85, -1.1, -0.32, 0.48, 1.3, 2.12]) {
      sphere(`fuselageRivet${side}${z}`, 0.035, [side * 0.57, 2.3, z], [1, 1, 0.65], GOLD);
    }
    for (const z of [-2.2, -1.25, -0.3, 0.65, 1.6, 2.3]) {
      sphere(`floatRivet${side}${z}`, 0.03, [side * 1.7, 0.5, z], [1, 0.7, 1], GOLD);
    }
  }

  // Emissive position lamps and a tiny top beacon echo Genshin elemental-glow motifs.
  glow(sphere("lampL", 0.11, [1.12, 2.58, 2.78], [1, 1, 0.45], LAMP_CYAN), 1.8);
  glow(sphere("lampR", 0.11, [-1.12, 2.58, 2.78], [1, 1, 0.45], LAMP_AMBER), 1.8);
  glow(sphere("beacon", 0.09, [0, 3.2, -0.2], [1, 1, 0.7], LAMP_CYAN), 2);
  for (const side of [-1, 1]) {
    glow(sphere(`floatLamp${side}`, 0.065, [side * 1.44, 0.47, 2.85], [1, 1, 0.5], side > 0 ? LAMP_CYAN : LAMP_AMBER), 1.5);
  }

  // Scroll-like trim bars along the float shoulders and wing roots.
  for (const side of [-1, 1]) {
    for (const z of [-1.75, 0.0, 1.75]) {
      b.rod([side * 1.1, 2.76, z - 0.22], [side * 1.65, 2.77, z + 0.22], 0.022, { name: `wingFiligree${side}${z}`, color: GOLD, section: { ngon: 5 } });
      b.rod([side * 1.25, 0.58, z - 0.15], [side * 1.58, 0.58, z + 0.15], 0.018, { name: `floatFiligree${side}${z}`, color: CORAL, section: { ngon: 5 } });
    }
  }

  return b.root;
}
