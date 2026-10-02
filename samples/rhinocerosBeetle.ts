import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";

const SHELL = "#24130d";
const SHELL_MID = "#432216";
const ELYTRA = "#321811";
const EDGE = "#713b1c";
const AMBER = "#b96d2b";
const GOLD = "#d9953e";
const LEG = "#4e2717";
const JOINT = "#7b411e";
const BELLY = "#140b08";
const EYE = "#090706";
const GLINT = "#f2c66a";
const CLAW = "#cf8a35";

export const meta = {
  name: "Hercules Rhinoceros Beetle",
  description: "A large, faceted Hercules rhinoceros beetle with split horn, plated wing cases, six articulated legs, antennae, and layered amber shell highlights.",
  style: "low-poly",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "rhinocerosBeetle", detail: 0.8 });

  // Skeleton first: a neutral, readable insect pose with every limb splayed for rigging.
  const thorax = b.joint("thorax", { at: [0, 0.092, 0], dir: [0, 0.15, 1], role: "spine" });
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, 0.09, -0.018],
      [0, 0.082, -0.072],
      [0, 0.07, -0.125],
      [0, 0.055, -0.158],
    ]),
    { parent: thorax, count: 4, names: ["abdomen1", "abdomen2", "abdomen3", "abdomenTip"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: thorax, at: [0, 0.105, 0.043], aim: [0, 0.12, 0.076], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.119, 0.078], aim: [0, 0.135, 0.14], role: "head" });
  const jawUpper = b.joint("jawUpper", { parent: head, at: [0, 0.124, 0.115], aim: [0, 0.112, 0.16], role: "jaw" });
  const jawLower = b.joint("jawLower", { parent: head, at: [0, 0.108, 0.112], aim: [0, 0.098, 0.154], role: "jaw" });

  const elytronL = b.joint("elytronL", { parent: thorax, at: [0.025, 0.108, 0.025], aim: [0.06, 0.11, -0.09], role: "hinge" });
  const elytronR = b.joint("elytronR", { parent: thorax, at: [-0.025, 0.108, 0.025], aim: [-0.06, 0.11, -0.09], role: "hinge" });

  const horn = b.chain(
    "horn",
    catmull([
      [0, 0.137, 0.102],
      [0, 0.157, 0.126],
      [0, 0.19, 0.154],
      [0, 0.227, 0.17],
    ]),
    { parent: head, count: 4, names: ["hornBase", "hornRise", "hornCrown", "hornTip"], role: "hinge" },
  );
  const hornForkL = b.chain(
    "hornForkL",
    polyline([
      [0, 0.205, 0.158],
      [0.025, 0.222, 0.183],
      [0.043, 0.212, 0.207],
    ]),
    { parent: horn.joints[2], names: ["forkLBase", "forkLTip"], role: "hinge" },
  );
  const hornForkR = b.chain(
    "hornForkR",
    polyline([
      [0, 0.205, 0.158],
      [-0.025, 0.222, 0.183],
      [-0.043, 0.212, 0.207],
    ]),
    { parent: horn.joints[2], names: ["forkRBase", "forkRTip"], role: "hinge" },
  );

  type Side = 1 | -1;
  const legSpecs: Array<{ side: Side; name: string; hip: [number, number, number]; knee: [number, number, number]; ankle: [number, number, number]; toe: [number, number, number]; }> = [];
  const positions = [
    { key: "Front", z: 0.052, spread: 0.108, kneeZ: 0.078, toeZ: 0.096 },
    { key: "Mid", z: -0.005, spread: 0.118, kneeZ: -0.005, toeZ: 0.012 },
    { key: "Rear", z: -0.071, spread: 0.112, kneeZ: -0.088, toeZ: -0.113 },
  ];
  for (const side of [1, -1] as const) {
    for (const spec of positions) {
      legSpecs.push({
        side,
        name: `leg${spec.key}${side === 1 ? "L" : "R"}`,
        hip: [side * 0.036, 0.082, spec.z],
        knee: [side * (spec.spread * 0.56), 0.043, spec.kneeZ],
        ankle: [side * spec.spread, 0.018, spec.kneeZ + (side === 1 ? 0.008 : -0.008)],
        toe: [side * (spec.spread + 0.016), 0.004, spec.toeZ],
      });
    }
  }
  const legs: Array<{ chain: ReturnType<typeof b.chain>; toe: [number, number, number]; side: Side; name: string }> = [];
  for (const spec of legSpecs) {
    const leg = b.chain(spec.name, catmull([spec.hip, spec.knee, spec.ankle, spec.toe]), {
      parent: thorax,
      count: 4,
      names: [`${spec.name}Coxa`, `${spec.name}Femur`, `${spec.name}Tibia`, `${spec.name}Tarsus`, `${spec.name}Toe`],
      role: "leg",
      contact: spec.toe,
    });
    legs.push({ chain: leg, toe: spec.toe, side: spec.side, name: spec.name });
    const digitFront = b.chain(
      `${spec.name}DigitA`,
      polyline([spec.toe, [spec.toe[0] + spec.side * 0.018, 0.004, spec.toe[2] + 0.018]]),
      { parent: leg.tip!, names: [`${spec.name}DigitA`], role: "digit" },
    );
    const digitBack = b.chain(
      `${spec.name}DigitB`,
      polyline([spec.toe, [spec.toe[0] + spec.side * 0.016, 0.004, spec.toe[2] - 0.014]]),
      { parent: leg.tip!, names: [`${spec.name}DigitB`], role: "digit" },
    );
    b.sweep(digitFront, [0.005, 0.001], { color: CLAW, section: { ngon: 5 }, caps: { start: "flat", end: "point" }, smooth: false });
    b.sweep(digitBack, [0.0045, 0.001], { color: CLAW, section: { ngon: 5 }, caps: { start: "flat", end: "point" }, smooth: false });
  }

  const antennaL = b.chain("antennaL", catmull([[0.018, 0.124, 0.127], [0.034, 0.132, 0.155], [0.049, 0.129, 0.177], [0.062, 0.119, 0.186]]), {
    parent: head, names: ["antennaL1", "antennaL2", "antennaL3", "antennaLTip"], role: "tentacle",
  });
  const antennaR = b.chain("antennaR", catmull([[-0.018, 0.124, 0.127], [-0.034, 0.132, 0.155], [-0.049, 0.129, 0.177], [-0.062, 0.119, 0.186]]), {
    parent: head, names: ["antennaR1", "antennaR2", "antennaR3", "antennaRTip"], role: "tentacle",
  });

  // Main body, underside and faceted plates.
  b.part(new THREE.SphereGeometry(1, 8, 5), SHELL_MID, {
    bone: thorax, at: [0, 0.095, 0.005], scale: [0.061, 0.052, 0.071], flat: true, name: "thoraxShell",
  });
  b.sweep(abdomen, (t) => 0.041 - t * 0.019, {
    color: BELLY,
    section: { ngon: 8 },
    smooth: false,
    shift: [0, -0.006],
    sectors: [[-58, 58, SHELL], [122, 238, BELLY]],
    bands: [[0.22, SHELL], [0.48, SHELL_MID], [0.74, SHELL], [0.9, BELLY]],
  });
  b.part(new THREE.SphereGeometry(1, 7, 5), SHELL_MID, {
    bone: head, at: [0, 0.122, 0.096], scale: [0.041, 0.034, 0.048], flat: true, name: "headShell",
  });
  b.part(new THREE.SphereGeometry(1, 7, 4), BELLY, {
    bone: thorax, at: [0, 0.057, -0.008], scale: [0.052, 0.023, 0.071], flat: true, name: "thoraxBelly",
  });

  // The two wing cases leave a strong central seam and carry their own hinge bones.
  for (const side of [1, -1] as const) {
    const elytron = side === 1 ? elytronL : elytronR;
    b.part(new THREE.SphereGeometry(1, 8, 6), ELYTRA, {
      bone: elytron,
      at: [side * 0.029, 0.108, -0.022],
      scale: [0.047, 0.043, 0.105],
      flat: true,
      name: `elytra${side === 1 ? "L" : "R"}`,
    });
    b.rod([side * 0.051, 0.137, 0.075], [side * 0.051, 0.124, -0.112], 0.0032, { bone: elytron, color: EDGE, section: { ngon: 5 }, smooth: false, name: `elytraRidge${side === 1 ? "L" : "R"}` });
    b.rod([side * 0.041, 0.143, 0.048], [side * 0.041, 0.136, -0.082], 0.0022, { bone: elytron, color: AMBER, section: { ngon: 5 }, smooth: false, name: `elytraHighlight${side === 1 ? "L" : "R"}` });
    for (let i = 0; i < 3; i++) {
      const z = 0.035 - i * 0.05;
      b.part(new THREE.OctahedronGeometry(1, 0), GOLD, {
        bone: elytron, at: [side * 0.053, 0.133, z], scale: [0.004, 0.003, 0.009], flat: true, name: `elytraRivet${side === 1 ? "L" : "R"}${i}`,
      });
    }
  }
  b.rod([0, 0.151, 0.084], [0, 0.142, -0.13], 0.0024, { bone: thorax, color: GOLD, section: { ngon: 5 }, smooth: false, name: "elytraSeam" });

  b.rod([-0.055, 0.132, 0.052], [0.055, 0.132, 0.052], 0.004, { bone: thorax, color: AMBER, section: { ngon: 5 }, smooth: false, name: "pronotumFrontRim" });

  // Six articulated legs with contrasting femur/tibia bands.
  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.012 - t * 0.009, {
      color: (t) => (t < 0.36 ? JOINT : t < 0.7 ? LEG : EDGE),
      section: { ngon: 5 }, smooth: false, caps: "round",
      bands: [[0.36, LEG], [0.7, EDGE], [0.88, LEG]],
      name: leg.name,
    });
    const s = leg.side;
    const toe = leg.toe;
    b.spike([toe[0] - s * 0.002, toe[1] + 0.001, toe[2] + 0.006], [s * 0.8, -0.08, 0.35], 0.014, 0.004, { color: CLAW, section: { ngon: 5 }, smooth: false, name: `${leg.name}Claw` });
  }

  // Split mandibles under the horn, plus small cheek plates.
  for (const side of [1, -1] as const) {
    const upper = polyline([[side * 0.015, 0.124, 0.119], [side * 0.027, 0.118, 0.145], [side * 0.017, 0.109, 0.158]]);
    const lower = polyline([[side * 0.014, 0.108, 0.118], [side * 0.029, 0.101, 0.14], [side * 0.022, 0.099, 0.155]]);
    b.sweep(upper, [0.008, 0.001], { bone: jawUpper, color: GOLD, section: { ngon: 5 }, caps: { start: "round", end: "point" }, smooth: false, name: `mandibleUpper${side === 1 ? "L" : "R"}` });
    b.sweep(lower, [0.007, 0.001], { bone: jawLower, color: AMBER, section: { ngon: 5 }, caps: { start: "round", end: "point" }, smooth: false, name: `mandibleLower${side === 1 ? "L" : "R"}` });
    b.part(new THREE.OctahedronGeometry(1, 0), EDGE, { bone: head, at: [side * 0.035, 0.119, 0.109], scale: [0.009, 0.012, 0.014], flat: true, name: `cheekPlate${side === 1 ? "L" : "R"}` });
  }

  // Thick, upward-curving horn and its characteristic fork.
  b.sweep(horn, (t) => 0.014 - t * 0.008, { color: HORN_COLOR, section: { ngon: 6 }, smooth: false, caps: { start: "round", end: "point" }, name: "mainHorn" });
  b.sweep(hornForkL, [0.009, 0.001], { color: GOLD, section: { ngon: 5 }, smooth: false, caps: { start: "round", end: "point" }, name: "hornForkL" });
  b.sweep(hornForkR, [0.009, 0.001], { color: GOLD, section: { ngon: 5 }, smooth: false, caps: { start: "round", end: "point" }, name: "hornForkR" });
  b.rod([0, 0.178, 0.143], [0, 0.204, 0.169], 0.005, { bone: horn.joints[1], color: EDGE, section: { ngon: 5 }, smooth: false, name: "hornDorsalRidge" });

  // Antennae, clubbed tips and six tiny faceted eyes / glints.
  b.sweep(antennaL, [0.004, 0.001], { color: AMBER, section: { ngon: 5 }, smooth: false, caps: { start: "round", end: "point" }, name: "antennaL" });
  b.sweep(antennaR, [0.004, 0.001], { color: AMBER, section: { ngon: 5 }, smooth: false, caps: { start: "round", end: "point" }, name: "antennaR" });
  for (const side of [1, -1] as const) {
    const ant = side === 1 ? antennaL : antennaR;
    b.part(new THREE.IcosahedronGeometry(1, 0), GOLD, { bone: ant.tip!, at: [side * 0.062, 0.119, 0.186], scale: [0.006, 0.006, 0.009], flat: true, name: `antennaClub${side === 1 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE, { bone: head, at: [side * 0.032, 0.128, 0.121], scale: [0.008, 0.008, 0.006], flat: true, name: `eye${side === 1 ? "L" : "R"}` });
    b.part(new THREE.OctahedronGeometry(1, 0), GLINT, { bone: head, at: [side * 0.034, 0.132, 0.125], scale: [0.002, 0.002, 0.002], flat: true, name: `eyeGlint${side === 1 ? "L" : "R"}` });
  }

  // A few discrete shell facets break the silhouette into readable low-poly planes.
  for (const side of [1, -1] as const) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.TetrahedronGeometry(1, 0), AMBER, {
        bone: thorax,
        at: [side * (0.051 + i * 0.003), 0.112 + i * 0.014, 0.018 - i * 0.035],
        scale: [0.007, 0.006, 0.009],
        flat: true,
        name: `thoraxFacet${side === 1 ? "L" : "R"}${i}`,
      });
    }
  }

  return b.root;
}

function HORN_COLOR(t: number): string {
  return t < 0.42 ? AMBER : t < 0.78 ? GOLD : CLAW;
}
