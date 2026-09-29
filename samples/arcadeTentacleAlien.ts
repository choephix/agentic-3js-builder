import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { polyline } from "../src/path";
import { pixelArt, stepped } from "../kits/pixel";

export const meta = {
  name: "Arcade Tentacle Alien",
  description: "An eight-tentacled arcade invader: stepped violet dome, oversized square-pixel eyes, cyan core glyphs, and independent snapping jaws. A 1.5 m creature in an extended rigging pose.",
  builtBy: "GPT-6 Astra",
};

const INK = "#171044";
const PURPLE = "#8026e5";
const CYAN = "#27e4db";
const PINK = "#f43c9b";
const YELLOW = "#ffe34b";
const WHITE = "#ffffff";
const U = 0.03;
const EYE = pixelArt([
  ".kkkkkkkk.",
  "kkwwwwwwkk",
  "kwwwwwwwwk",
  "kwwkkkwwwk",
  "kwwkkkwwwk",
  "kwwkkkwwwk",
  "kkwwwwwwkk",
  ".kkkkkkkk.",
], { k: INK, w: CYAN });
const CORE = pixelArt([
  "....c....",
  "...ccc...",
  "..ccycc..",
  ".ccyyycc.",
  "ccyyyyycc",
  ".ccyyycc.",
  "..ccycc..",
  "...ccc...",
  "....c....",
], { c: CYAN, y: YELLOW });
const VENT = pixelArt([
  "kkkkkkkkkkkk",
  "kcckkcckkcck",
  "kcckkcckkcck",
  "kkkkkkkkkkkk",
], { k: INK, c: CYAN });

export default function build() {
  const b = createBuilder({ name: "arcadeTentacleAlien", detail: 0.7 });
  const core = b.joint("core", { at: [0, 0.78, 0], dir: [0, 1, 0], role: "spine", group: "body" });
  const head = b.joint("head", { parent: core, at: [0, 0.90, 0], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.82, 0.25], dir: [0, 0, 1], role: "jaw", group: "mouth" });
  const antennae = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(`antenna${side}`, polyline([
      [s * 0.24, 1.20, 0], [s * 0.33, 1.35, 0], [s * 0.42, 1.455, 0],
    ]), { parent: head, role: "tentacle", names: [`antennaBase${side}`, `antennaTip${side}`], group: "antennae" });
  });
  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + i * Math.PI / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return b.chain(`tentacle${i + 1}`, polyline([
      [c * 0.24, 0.80, s * 0.22],
      [c * 0.45, 0.53, s * 0.43],
      [c * 0.51, 0.22, s * 0.50],
      [c * 0.67, 0.025, s * 0.65],
      [c * 0.78, 0.025, s * 0.76],
    ]), {
      parent: core, up: [0, 1, 0], role: "tentacle", group: `tentacle${i + 1}`,
      names: [`tentacle${i + 1}Root`, `tentacle${i + 1}Bend`, `tentacle${i + 1}Wrist`, `tentacle${i + 1}Tip`],
    });
  });

  // One merged stepped volume: a dome in all three projections, not a smooth sphere with a pixel decal.
  const dome: THREE.BufferGeometry[] = [];
  const layers = [[12, 9], [14, 10], [14, 10], [14, 10], [12, 9], [10, 8], [8, 6], [4, 4]];
  layers.forEach(([w, d], row) => {
    for (let z = 0; z < d; z++) {
      const inset = Math.max(0, 2 - Math.min(z, d - 1 - z));
      dome.push(new THREE.BoxGeometry((w - inset * 2) * U * 2, U * 2, U * 2)
        .translate(0, 0.81 + row * U * 2, (z - (d - 1) / 2) * U * 2));
    }
  });
  b.part(mergeGeometries(dome), PURPLE, { bone: head, at: [0, 0, 0], name: "steppedDome", group: "head" });
  b.part(new THREE.BoxGeometry(0.66, 0.09, 0.42), INK, { bone: core, at: [0, 0.795, 0], group: "body", name: "tentacleCollar" });

  // Black pixel sockets project only a little: huge cyan eyes dominate, rather than round eyeballs.
  for (const s of [1, -1]) {
    b.extrude(stepped([[-4, 4], [-5, 5], [-5, 5], [-5, 5], [-4, 4]], [U, U * 1.6], { rows: true }), {
      at: [s * 0.225, 0.90, 0.31], x: [1, 0, 0], thickness: 0.09,
      color: INK, bone: head, group: "eyes", name: `socket${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.PlaneGeometry(U * 10, U * 8), WHITE, {
      bone: head, at: [s * 0.225, 1.02, 0.357], texture: EYE, group: "eyes", name: "pixelEye",
    });
    b.part(new THREE.BoxGeometry(U * 2, U, U), YELLOW, {
      bone: head, at: [s * 0.225 - U * 2, 1.065, 0.366], group: "eyes", name: "eyeSpark",
    });
  }

  // A diamond core on the crown, plus pixel circuitry carried around the back and side faces.
  b.part(new THREE.PlaneGeometry(0.21, 0.21), WHITE, {
    bone: head, at: [0, 1.263, 0], rotation: [-90, 0, 0], texture: CORE, group: "core", name: "crownCore",
  });
  b.part(new THREE.PlaneGeometry(0.15, 0.15), WHITE, {
    bone: head, at: [0, 1.175, 0.241], texture: CORE, group: "core", name: "foreheadCore",
  });
  b.part(new THREE.PlaneGeometry(0.36, 0.12), WHITE, {
    bone: head, at: [0, 0.98, -0.301], rotation: [0, 180, 0], texture: VENT, group: "core", name: "rearCircuit",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.24, 0.08), WHITE, {
      bone: head, at: [s * 0.421, 0.97, 0], rotation: [0, s * 90, 0], texture: VENT, group: "core", name: "sideCircuit",
    });
  }

  // Separate upper and lower jaws with two interlocking square fangs each.
  b.part(new THREE.BoxGeometry(0.30, 0.07, 0.12), PINK, {
    bone: head, at: [0, 0.855, 0.345], group: "mouth", name: "upperJaw",
  });
  b.part(new THREE.BoxGeometry(0.30, 0.06, 0.18), PINK, {
    bone: jaw, at: [0, 0.725, 0.36], group: "mouth", name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.10, 0.06), INK, {
    bone: head, at: [0, 0.79, 0.29], group: "mouth", name: "mouthInterior",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.045, 0.07, 0.06), YELLOW, {
      bone: head, at: [s * 0.105, 0.80, 0.38], group: "mouth", name: "upperFang",
    });
    b.part(new THREE.BoxGeometry(0.045, 0.055, 0.06), YELLOW, {
      bone: jaw, at: [s * 0.04, 0.765, 0.40], group: "mouth", name: "lowerFang",
    });
  }

  antennae.forEach((chain, i) => {
    b.sweep(chain, 0.024, { section: "box", color: CYAN, caps: "flat", group: "antennae", name: "squareAntenna" });
    const tip = chain.at(1);
    b.part(new THREE.BoxGeometry(0.09, 0.09, 0.09), YELLOW, {
      bone: chain.joints[1], at: tip, group: "antennae", name: `antennaBeacon${i}`,
    });
  });
  tentacles.forEach((chain, i) => {
    b.sweep(chain, (t) => Math.max(0.025, 0.064 - t * 0.055), {
      section: "box", caps: "flat", smooth: false,
      bands: [[0.38, PURPLE], [0.44, CYAN], [0.78, PURPLE], [0.86, CYAN], [1, PINK]],
      group: `tentacle${i + 1}`, name: `tentacleRibbon${i + 1}`,
    });
  });
  return b.root;
}
