import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { countershade, mottle, spots, stripes } from "../src/paint";
import { rng } from "../src/math";
import type { Chain } from "../src/skeleton";

const COAT = "#33232d";
const COAT_LIGHT = "#704052";
const BURNT = "#9c4a32";
const AMBER = "#d58a3a";
const BELLY = "#d19a63";
const DARK = "#160f17";
const EYE = "#f7c95c";
const EYE_CORE = "#2a1517";
const EGG = "#c9b07b";
const EGG_BAND = "#87664e";
const WEB = "#dfcfb0";
const CLAW = "#241820";

export const meta = {
  name: "Broodmother Spider",
  description: "A giant low-poly broodmother with angular banded legs, clustered amber eyes, and a silk-bound clutch of egg sacs.",
  style: "low-poly",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "broodmotherSpider", detail: 1 });
  const bodyCoat = countershade(stripes(COAT_LIGHT, BURNT, { size: 0.42, width: 0.32, wobble: 0.12, seed: 19 }), BELLY, { level: -0.15 });
  const legCoat = stripes(COAT, COAT_LIGHT, { size: 0.38, width: 0.18, wobble: 0.08, seed: 8 });
  const abdomenCoat = spots(countershade(COAT_LIGHT, BELLY, { level: -0.2 }), BURNT, { size: 0.24, amount: 0.34, rosette: true, seed: 44 });
  const eggCoat = mottle(EGG, "#e4c997", { size: 0.16, contrast: 0.45, seed: 12 });

  // Skeleton first: a low, broad thorax with a separate head, jaw and abdomen chain.
  const thorax = b.joint("thorax", { at: [0, 1.28, 0.16], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 1.38, 0.64], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.22, 0.82], dir: [0, -0.35, 1], role: "jaw" });
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, 1.24, 0.03],
      [0, 1.18, -0.38],
      [0, 1.08, -0.88],
      [0, 1.0, -1.23],
    ]),
    { parent: thorax, names: ["abdomenBase", "abdomenMid", "abdomenTip", "abdomenEnd"], role: "spine" },
  );

  const legSpecs = [
    { z: 0.52, reach: 1.65, dz: 1.22, label: "front" },
    { z: 0.2, reach: 2.18, dz: 0.58, label: "midFront" },
    { z: -0.16, reach: 2.14, dz: -0.55, label: "midBack" },
    { z: -0.48, reach: 1.72, dz: -1.25, label: "back" },
  ];
  const legs: Array<{ chain: Chain; side: number; label: string }> = [];
  for (const side of [1, -1]) {
    for (const spec of legSpecs) {
      const label = `${spec.label}${side > 0 ? "L" : "R"}`;
      const root: [number, number, number] = [side * 0.43, 1.31, spec.z];
      const knee: [number, number, number] = [side * 1.02, 1.8, spec.z + spec.dz * 0.52];
      const ankle: [number, number, number] = [side * (spec.reach - 0.16), 0.24, spec.z + spec.dz * 0.94];
      const foot: [number, number, number] = [side * spec.reach, 0.018, spec.z + spec.dz];
      const chain = b.chain(`leg${label}`, [root, knee, ankle, foot], {
        parent: thorax,
        names: [`hip${label}`, `knee${label}`, `ankle${label}`, `foot${label}`],
        role: "leg",
        contact: foot,
      });
      legs.push({ chain, side, label });
    }
  }

  const mandibles: Array<{ chain: Chain; side: number }> = [];
  for (const side of [1, -1]) {
    const base: [number, number, number] = [side * 0.16, 1.31, 0.78];
    const tip: [number, number, number] = [side * 0.26, 1.16, 1.02];
    const chain = b.chain(`chelicera${side > 0 ? "L" : "R"}`, [base, tip], {
      parent: head,
      names: [`chelicera${side > 0 ? "L" : "R"}`, `fangRoot${side > 0 ? "L" : "R"}`],
      role: "jaw",
    });
    mandibles.push({ chain, side });
  }
  const palps: Chain[] = [];
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const palp = b.chain(`pedipalp${s}`, [[side * 0.26, 1.39, 0.76], [side * 0.48, 1.25, 1.05], [side * 0.59, 1.05, 1.32]], {
      parent: head,
      names: [`palpBase${s}`, `palpMid${s}`, `palpTip${s}`],
      role: "arm",
    });
    palps.push(palp);
  }

  // Main low-poly masses.
  const thoraxPart = b.part(new THREE.SphereGeometry(0.56, 8, 6), bodyCoat, {
    bone: thorax,
    at: [0, 1.28, 0.16],
    scale: [1.1, 0.76, 1.16],
    flat: true,
    name: "thoraxShell",
    group: "body",
  });
  const headPart = b.part(new THREE.SphereGeometry(0.42, 8, 5), bodyCoat, {
    bone: head,
    at: [0, 1.39, 0.65],
    scale: [1.0, 0.78, 1.08],
    flat: true,
    name: "headShell",
    group: "body",
  });
  const abdomenTube = b.sweep(abdomen, (t) => [0.3 + 0.55 * Math.sin(Math.PI * t), 0.3 + 0.4 * Math.sin(Math.PI * t)], {
    color: abdomenCoat,
    section: { ngon: 8 },
    detail: 1,
    caps: "round",
    name: "abdomenShell",
    group: "body",
  });

  // Faceted dorsal plates and a warm hourglass marking.
  for (let i = 0; i < 5; i++) {
    const at = abdomenTube.at(0.14 + i * 0.16);
    b.stick(new THREE.ConeGeometry(0.13 - i * 0.012, 0.12, 5), AMBER, at, {
      embed: 0.72, flat: true, name: `abdomenCrest${i}`, group: "armor",
    });
  }
  const thoraxMarkHit = b.surface(thoraxPart).around(thoraxPart.at).at(0, 80);
  if (thoraxMarkHit) {
    b.stick(new THREE.CylinderGeometry(0.14, 0.17, 0.014, 4), AMBER, thoraxMarkHit, { name: "thoraxMark", group: "markings" });
  }

  // Eight articulated, heavily banded legs, each with pointed feet.
  for (const { chain, side, label } of legs) {
    const leg = b.sweep(chain, [0.155, 0.13, 0.062, 0.018], {
      color: legCoat,
      bands: [[0.27, AMBER], [0.33, legCoat], [0.59, AMBER], [0.66, legCoat], [0.86, BURNT]],
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      name: `legTube${label}`,
      group: "legs",
    });
    for (const t of [0.23, 0.55, 0.82]) {
      const at = leg.at(t);
      const center = chain.at(t);
      b.part(new THREE.TorusGeometry(at.radius * 1.03, 0.012, 4, 6), AMBER, {
        bone: center.bone,
        at: center.at,
        dir: center.tangent,
        axis: "z",
        flat: true,
        name: `legRing${label}${Math.round(t * 100)}`,
        group: "legs",
      });
    }
    const foot = chain.at(1);
    b.spike(foot, [side * 0.1, 0, 0.02], 0.14, 0.035, { color: CLAW, section: { ngon: 5 }, caps: "point", name: `footClaw${label}`, group: "claws" });
    b.spike(foot, [side * 0.1, 0, -0.08], 0.12, 0.03, { color: CLAW, section: { ngon: 5 }, caps: "point", name: `toe${label}`, group: "claws" });
  }
  b.part(new THREE.IcosahedronGeometry(0.18, 0), DARK, { bone: jaw, at: [0, 1.17, 0.97], scale: [1.0, 0.48, 0.7], name: "lowerJaw" });
  for (const palp of palps) {
    b.sweep(palp, [0.09, 0.055, 0.015], { color: COAT_LIGHT, section: { ngon: 5 }, caps: "round", name: `tube${palp.joints[0].name}` });
    b.spike(palp.at(1), [0, -0.1, 0.2], 0.14, 0.028, { color: CLAW, section: { ngon: 5 } });
  }

  // Chelicerae and fangs.
  for (const { chain, side } of mandibles) {
    const s = side > 0 ? "L" : "R";
    b.sweep(chain, [0.105, 0.065], { color: DARK, section: { ngon: 5 }, caps: { start: "round", end: "point" }, name: `cheliceraTube${s}`, group: "jaw" });
    const fang = chain.at(1);
    b.spike(fang, [0, -0.26, 0.28], 0.3, 0.052, { color: CLAW, caps: "point", name: `fang${s}`, group: "jaw" });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), AMBER, { bone: fang.bone, at: fang.at, flat: true, name: `fangSocket${s}`, group: "jaw" });
  }

  // Eight clustered amber eyes seated directly on the cephalothorax.
  const face = b.surface(headPart);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const hit = face.around(headPart.at).at(side * [19, 46, 21, 57][i], [8, 7, 38, 33][i]);
      if (!hit) continue;
      const size = i === 0 ? 0.084 : 0.055;
      const socket = b.stick(new THREE.SphereGeometry(size * 1.3, 6, 4), DARK, hit, { flat: true, name: `eyeSocket${side}_${i}` });
      const eyeHit = b.surface(socket).around(socket.at).at(0, 5);
      if (!eyeHit) continue;
      const eye = b.stick(new THREE.SphereGeometry(size, 6, 4), EYE, eyeHit, { flat: true, name: `eye${side}_${i}`, group: "eyes" });
      const pupilHit = b.surface(eye).around(eye.at).at(0, 5);
      if (pupilHit) {
        b.stick(new THREE.SphereGeometry(size * 0.35, 5, 3), EYE_CORE, pupilHit, { flat: true, name: `pupil${side}_${i}`, group: "eyes" });
      }
    }
  }

  // Egg sacs tucked beneath the rear abdomen, with tied bands and web anchors.
  const sacs: Array<[number, number, number]> = [
    [-0.42, 0.66, -0.7], [0.42, 0.66, -0.7],
    [-0.6, 0.52, -1.02], [0.6, 0.52, -1.02],
    [-0.28, 0.46, -1.31], [0.28, 0.46, -1.31],
  ];
  for (let i = 0; i < sacs.length; i++) {
    const [x, y, z] = sacs[i];
    const sac = b.part(new THREE.SphereGeometry(0.23 - (i > 3 ? 0.035 : 0), 7, 5), eggCoat, {
      bone: abdomen.joints[Math.min(2, Math.floor(i / 2))],
      at: [x, y, z],
      scale: [0.85, 1.08, 0.72],
      flat: true,
      name: `eggSac${i + 1}`,
      group: "brood",
    });
    const sacSurface = b.surface(sac);
    const tie = sacSurface.loop([x, y + 0.04, z], { dir: [0, 1, 0], lift: 0.004 });
    b.sweep(tie, 0.012, {
      color: EGG_BAND,
      section: { ngon: 4 },
      name: `eggTie${i + 1}`,
      group: "brood",
    });
    b.rod([x, y + 0.2, z], [x * 0.65, 0.92, z + 0.2], 0.009, { color: WEB, bone: abdomen.joints[Math.min(2, Math.floor(i / 2))], name: `silkAnchor${i + 1}`, group: "silk" });
  }
  // A few silk lines stitch the clutch together into one readable brood bundle.
  for (let i = 0; i < sacs.length - 1; i++) {
    b.rod(sacs[i], sacs[i + 1], 0.006, { color: WEB, bone: abdomen.joints[2], name: `silkLoop${i + 1}`, group: "silk" });
  }

  // Small dorsal bristles reinforce the faceted silhouette.
  for (let i = 0; i < 16; i++) {
    const at = abdomenTube.at(0.15 + (i % 8) * 0.09, i < 8 ? 65 : -65);
    b.spike(at, at, 0.1 + (i % 3) * 0.018, 0.02, { color: COAT, section: { ngon: 4 }, name: `abdomenBristle${i}`, group: "detail" });
  }

  // Deterministic little shell studs across the thorax make the low-poly facets read as armor.
  for (const [i, hit] of b.surface(thoraxPart).scatter(26, { rng: rng(73), filter: (h) => h.n.y > 0.2 }).entries()) {
    b.stick(new THREE.IcosahedronGeometry(0.028, 0), AMBER, hit, { flat: true, name: `shellStud${i}`, group: "armor" });
  }

  return b.root;
}
