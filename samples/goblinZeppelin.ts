import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade, grain, mottle, paint, spots } from "../src/paint";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { glow } from "../kits/glow";
import { metal, panelled } from "../kits/clockwork";

export const meta = {
  name: "Goblin Zeppelin",
  description: "A ramshackle goblin zeppelin with patched canvas, a riveted gondola, twin propellers, and four mooring ropes tethering it just above the ground.",
  style: "Blizzard/Warcraft",
  commit: "34f986c",
};

const IRON = metal("iron", { tarnish: 0.72, polish: 0.14, verdigris: 0.12, seed: 17 });
const OLD_COPPER = metal("copper", { tarnish: 0.6, polish: 0.22, verdigris: 0.58, seed: 9 });
const BRASS = metal("brass", { tarnish: 0.35, polish: 0.42, seed: 28 });
const DARK_BRASS = metal("brass", { tarnish: 0.78, polish: 0.08, seed: 31 });
const WOOD = grain("#63351f", "#b8783a", { size: 0.12, axis: "z", seed: 51 });
const ROPES = grain("#2c211a", "#8b6c3d", { size: 0.055, axis: "y", seed: 63 });
const CLOTH = countershade(mottle("#7b3428", "#bf6340", { size: 0.46, contrast: 0.72, seed: 71 }), "#351c2b", { level: -0.28, soft: 0.35 });
const CLOTH_DARK = mottle("#301b2b", "#6d2931", { size: 0.32, contrast: 0.62, seed: 73 });
const PATCH = spots("#c48b3c", "#5a2925", { size: 0.17, amount: 0.38, seed: 77 });
const GOBLIN_GREEN = countershade("#55752f", "#24361f", { level: -0.25 });
const BONE = "#d7ba78";
const LEATHER = "#4b211d";
const GLOW_AMBER = "#ff9a31";
const PAINTED_YELLOW = paint((_p, n, _s) => n.y > 0.25 ? "#e3b34d" : "#a75a2d");

export default function build() {
  const b = createBuilder({ name: "goblinZeppelin", detail: 1, paintSize: 1024 });
  const root = b.joint("zeppelinRoot", { at: [0, 5.3, 0], role: "spine" });

  const balloonPath = catmull([
    [0, 7.05, -4.7],
    [0, 7.16, -3.75],
    [0, 7.35, -2.15],
    [0, 7.48, 0],
    [0, 7.35, 2.15],
    [0, 7.16, 3.75],
    [0, 7.05, 4.7],
  ]);
  const balloon = b.sweep(balloonPath, (t) => {
    const end = Math.abs(t - 0.5) * 2;
    const r = 1.52 * Math.max(0.23, Math.cos(end * Math.PI * 0.5));
    return [r, r * 0.82];
  }, {
    bone: root,
    color: CLOTH,
    section: "circle",
    sides: 10,
    caps: "round",
    group: "envelope",
    name: "patchedEnvelope",
  });

  const surface = b.surface(balloon);
  for (const hit of surface.scatter(34, {
    rng: rng(81),
    minDist: 0.27,
    filter: (h) => h.n.y < 0.35 && h.n.z > -0.8,
  })) {
    b.stick(new THREE.CylinderGeometry(0.11, 0.11, 0.018, 8), PATCH, hit, {
      embed: 0.55,
      spin: 18,
      group: "envelopePatches",
    });
  }

  const strapZ = [-3.55, -1.8, 0, 1.8, 3.55];
  for (const z of strapZ) {
    const band = new THREE.TorusGeometry(1.15 + (1.52 - 1.15) * (1 - Math.min(1, Math.abs(z) / 4.7)), 0.038, 5, 16);
    b.part(band, LEATHER, { bone: root, at: [0, 7.34, z], rotation: [90, 0, 0], scale: [1, 0.82, 1], group: "envelopeStraps", name: `envelopeBand${z}` });
  }
  for (const x of [-0.78, 0, 0.78]) {
    b.sweep(catmull([
      [x, 7.28, -4.25], [x, 7.38, -2.5], [x, 7.42, 0], [x, 7.38, 2.5], [x, 7.28, 4.25],
    ]), 0.026, { bone: root, color: LEATHER, caps: "round", group: "envelopeSeams", name: `envelopeSeam${x}` });
  }

b.loft([
    { at: [0, 3.65, -3.05], w: 1.35, h: 0.75 },
    { at: [0, 3.58, -2.35], w: 2.0, h: 1.15 },
    { at: [0, 3.48, -0.8], w: 2.25, h: 1.35 },
    { at: [0, 3.48, 1.2], w: 2.2, h: 1.3 },
    { at: [0, 3.58, 2.65], w: 1.72, h: 1.0 },
    { at: [0, 3.7, 3.25], w: 1.15, h: 0.7 },
  ], { bone: root, color: panelled(OLD_COPPER, { size: 0.23, aspect: 0.76, rivets: 0.055 }), section: { ngon: 8 }, group: "gondola", name: "rivetedGondola" });
  b.sweep(catmull([[0, 3.02, -2.7], [0, 2.9, -1.2], [0, 2.82, 0.6], [0, 2.96, 2.65]]), [0.2, 0.16], {
    bone: root, color: IRON, section: "box", caps: "round", group: "keel", name: "keelBeam",
  });
  b.sweep(catmull([[0, 4.34, -2.55], [0, 4.5, -1.1], [0, 4.52, 1.5], [0, 4.34, 2.65]]), 0.055, {
    bone: root, color: BRASS, group: "deck", name: "upperDeckRail",
  });

  for (const s of [-1, 1]) {
    b.sweep(catmull([[s * 1.03, 3.2, -2.55], [s * 1.24, 3.45, -1.0], [s * 1.24, 3.48, 1.1], [s * 1.0, 3.22, 2.6]]), 0.07, {
      bone: root, color: IRON, group: "gondolaRails", name: `sideRail${s}`,
    });
    b.rod([s * 1.0, 3.18, -2.3], [s * 1.0, 4.28, -2.3], 0.045, { bone: root, color: BRASS, group: "supports", name: `frontPost${s}` });
    b.rod([s * 1.12, 3.18, 1.9], [s * 1.12, 4.25, 1.9], 0.045, { bone: root, color: BRASS, group: "supports", name: `rearPost${s}` });
  }

  // A chunky goblin pilot's cab and its crooked armored visor.
  b.part(new THREE.BoxGeometry(1.18, 0.72, 1.15), WOOD, { bone: root, at: [0, 4.18, 1.2], rotation: [0, -3, 0], group: "cockpit", name: "pilotCabin" });
  b.part(new THREE.BoxGeometry(1.28, 0.12, 1.25), IRON, { bone: root, at: [0, 4.58, 1.18], rotation: [0, -3, 0], group: "cockpit", name: "cabRoof" });
  b.part(new THREE.BoxGeometry(1.34, 0.1, 0.24), BRASS, { bone: root, at: [0, 4.43, 1.78], rotation: [0, -3, 0], group: "cockpit", name: "visorBrow" });
  b.part(new THREE.BoxGeometry(0.28, 0.06, 0.5), GOBLIN_GREEN, { bone: root, at: [0, 4.66, 1.2], rotation: [0, -3, 0], group: "cockpit", name: "goblinWarpaint" });
  const frontWindow = b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.035, 12), "#1e4f56", { bone: root, at: [0, 4.2, 1.8], dir: [0, 0, 1], group: "cockpit", name: "frontWindow" });
  glow(frontWindow, 0.4);
  for (const s of [-1, 1]) {
    const window = b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.035, 12), "#254c57", { bone: root, at: [s * 0.61, 4.2, 1.23], dir: [s, 0, 0], group: "cockpit", name: `sideWindow${s}` });
    glow(window, 0.3);
  }

  // Nose ram and painted hazard stripes make the silhouette unmistakably goblin-built.
  b.sweep(catmull([[0, 3.63, 3.18], [0, 3.72, 3.62], [0, 3.79, 4.04]]), [0.32, 0.02], {
    bone: root, color: BONE, caps: "point", group: "ram", name: "noseRam",
  });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), GLOW_AMBER, { bone: root, at: [0, 3.66, 3.16], group: "ram", name: "ramSocket" });
  for (const s of [-1, 1]) {
    b.sweep(catmull([[s * 0.78, 3.55, 2.72], [s * 0.9, 3.55, 3.15], [s * 1.02, 3.62, 3.4]]), 0.055, { bone: root, color: PAINTED_YELLOW, group: "ramBraces", name: `ramBrace${s}` });
  }

  // Side engines and twin propeller hinges.
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.42, 0.48, 1.52, 10), panelled(IRON, { size: 0.16, rivets: 0.04 }), {
      bone: root, at: [s * 1.66, 3.85, -1.4], dir: [0, 0, 1], group: "engines", name: `engine${s}`,
    });
    b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 10), BRASS, { bone: root, at: [s * 1.66, 3.85, -2.2], dir: [0, 0, 1], group: "engines", name: `engineCap${s}` });
    for (const z of [-1.86, -1.48, -1.1]) {
      b.part(new THREE.TorusGeometry(0.43, 0.035, 5, 12), DARK_BRASS, { bone: root, at: [s * 1.66, 3.85, z], rotation: [90, 0, 0], group: "engines", name: `engineBand${s}${z}` });
    }
    const rotor = b.joint(`propeller${s > 0 ? "L" : "R"}`, { parent: root, at: [s * 1.66, 3.85, -2.27], dir: [0, 0, 1], role: "hinge", group: "propellers" });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 10), BRASS, { bone: rotor, at: rotor.at, dir: [0, 0, 1], group: "propellers", name: `propHub${s}` });
    for (const [u, v] of [[0.55, 0], [-0.55, 0], [0, 0.55], [0, -0.55]] as const) {
      const blade = new THREE.BoxGeometry(0.18, 0.07, 0.76).translate(u, 0, v);
      b.part(blade, WOOD, { bone: rotor, at: rotor.at, group: "propellers", name: `propBlade${s}${u}${v}` });
      const cap = new THREE.BoxGeometry(0.22, 0.09, 0.1).translate(u, 0, v);
      b.part(cap, IRON, { bone: rotor, at: rotor.at, group: "propellers", name: `propBladeCap${s}${u}${v}` });
    }
  }

  // Tail fins: thick, chamfered silhouettes with brass edge rods.
  const topFin = b.extrude([[0, 0], [0.74, 0], [0.64, 0.52], [0.28, 1.13, "sharp"], [0, 1.34]], {
    at: [0, 6.98, -3.82], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.04, smoothing: 1, color: CLOTH_DARK, bone: root, group: "tailFins", name: "topTailFin",
  });
  b.rod(topFin.local([0.03, 0.04, 0.06]), topFin.local([0.29, 1.19, 0.06]), 0.028, { bone: root, color: BRASS, group: "tailFins", name: "topFinRim" });
  for (const s of [-1, 1]) {
    const fin = b.extrude([[0, 0], [0.92, 0], [0.73, 0.4], [0.25, 0.86, "sharp"], [0, 1.02]], {
      at: [s * 1.18, 6.98, -3.62], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.035, smoothing: 1, color: CLOTH_DARK, bone: root, group: "tailFins", name: `sideTailFin${s}`,
    });
    b.rod(fin.local([0.03, 0.04, s * 0.05]), fin.local([0.25, 0.8, s * 0.05]), 0.028, { bone: root, color: BRASS, group: "tailFins", name: `sideFinRim${s}` });
  }
  const rudder = b.joint("rudderHinge", { parent: root, at: [0, 6.95, -4.18], dir: [1, 0, 0], role: "hinge", group: "tailFins" });
  b.part(new THREE.BoxGeometry(0.12, 0.58, 1.0), CLOTH_DARK, { bone: rudder, at: rudder.at, rotation: [0, -12, 0], group: "tailFins", name: "rudder" });

  // Goblin rigging struts and the four lines that keep the balloon hovering.
  for (const s of [-1, 1]) {
    b.rod([s * 0.78, 4.5, -1.8], [s * 0.95, 6.12, -2.8], 0.045, { bone: root, color: ROPES, group: "rigging", name: `frontLift${s}` });
    b.rod([s * 0.78, 4.5, 1.55], [s * 0.92, 6.2, 2.55], 0.045, { bone: root, color: ROPES, group: "rigging", name: `rearLift${s}` });
    b.part(new THREE.SphereGeometry(0.09, 7, 5), BRASS, { bone: root, at: [s * 0.78, 4.5, -1.8], group: "rigging", name: `frontEye${s}` });
    b.part(new THREE.SphereGeometry(0.09, 7, 5), BRASS, { bone: root, at: [s * 0.78, 4.5, 1.55], group: "rigging", name: `rearEye${s}` });
    b.rod([s * 1.04, 3.18, -2.32], [s * 2.4, 0.09, -3.55], 0.034, { bone: root, color: ROPES, group: "mooring", name: `mooringFront${s}` });
    b.rod([s * 1.08, 3.17, 2.25], [s * 2.55, 0.09, 3.5], 0.034, { bone: root, color: ROPES, group: "mooring", name: `mooringRear${s}` });
    b.part(new THREE.CylinderGeometry(0.12, 0.17, 0.24, 8), IRON, { bone: root, at: [s * 2.4, 0.12, -3.55], group: "mooring", name: `frontAnchor${s}` });
    b.part(new THREE.CylinderGeometry(0.12, 0.17, 0.24, 8), IRON, { bone: root, at: [s * 2.55, 0.12, 3.5], group: "mooring", name: `rearAnchor${s}` });
  }

  // Hanging clutter: crates, barrel, lantern cages, and a crooked steering wheel.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.52, 0.46, 0.58), WOOD, { bone: root, at: [s * 0.82, 2.98, -0.42], rotation: [0, s * 8, s * 4], group: "cargo", name: `crate${s}` });
    b.rod([s * 0.57, 2.97, -0.42], [s * 1.08, 2.97, -0.42], 0.025, { bone: root, color: IRON, group: "cargo", name: `crateBand${s}` });
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.58, 10), WOOD, { bone: root, at: [s * 0.88, 2.74, 1.08], group: "cargo", name: `barrel${s}` });
    for (const y of [2.52, 2.78, 3.02]) b.part(new THREE.TorusGeometry(0.29, 0.025, 5, 12), IRON, { bone: root, at: [s * 0.88, y, 1.08], group: "cargo", name: `barrelHoop${s}${y}` });
  }
  for (const s of [-1, 1]) {
    const lantern = b.part(new THREE.SphereGeometry(0.16, 8, 6), GLOW_AMBER, { bone: root, at: [s * 0.94, 4.12, -2.18], group: "lanterns", name: `lantern${s}` });
    glow(lantern, 1.7);
    for (const a of [0, 120, 240]) {
      const rad = a * Math.PI / 180;
      b.rod([s * 0.94 + Math.cos(rad) * 0.16, 4.12 + Math.sin(rad) * 0.16, -2.18], [s * 0.94 - Math.cos(rad) * 0.16, 4.12 - Math.sin(rad) * 0.16, -2.18], 0.014, { bone: root, color: IRON, group: "lanterns", name: `lanternCage${s}${a}` });
    }
  }
  b.part(new THREE.TorusGeometry(0.34, 0.045, 6, 14), BRASS, { bone: root, at: [0, 4.5, 0.55], rotation: [90, 0, 0], group: "controls", name: "steeringWheel" });
  b.rod([0, 4.5, 0.55], [0, 4.5, 0.9], 0.035, { bone: root, color: IRON, group: "controls", name: "wheelStem" });
  for (const a of [0, 90, 180, 270]) {
    const rad = a * Math.PI / 180;
    b.part(new THREE.SphereGeometry(0.06, 7, 5), BONE, { bone: root, at: [Math.cos(rad) * 0.34, 4.5 + Math.sin(rad) * 0.34, 0.55], group: "controls", name: `wheelGrip${a}` });
  }

  // A few bold rivet clusters, paint flecks and a dangling exhaust chain sell the hand-painted hero prop.
  for (const s of [-1, 1]) {
    for (const z of [-1.9, -0.95, 0, 0.95, 1.9]) {
      b.part(new THREE.SphereGeometry(0.055, 7, 5), BONE, { bone: root, at: [s * 1.17, 3.88, z], group: "rivets", name: `sideRivet${s}${z}` });
    }
  }
  b.sweep(catmull([[0.72, 3.1, -1.55], [0.9, 2.55, -1.55], [0.98, 2.15, -1.38]]), 0.018, { bone: root, color: IRON, group: "clutter", name: "hangingChain" });
  for (let i = 0; i < 4; i++) b.part(new THREE.TorusGeometry(0.08, 0.014, 5, 8), BRASS, { bone: root, at: [0.9, 2.5 - i * 0.11, -1.5], rotation: [90, 0, 0], group: "clutter", name: `chainLink${i}` });

  return b.root;
}
