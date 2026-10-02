import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";

const COAT = "#b8d6e8";
const COAT_DARK = "#6d91ae";
const COAT_LIGHT = "#edf5f3";
const WING = "#dbeaf0";
const WING_SHADOW = "#90b5ca";
const FEATHER_TIP = "#f3d48a";
const HOOF = "#36465f";
const MANE = "#f3d48a";
const EYE = "#192438";
const IRIS = "#d9a83e";
const MOUTH = "#5b3341";
const TOOTH = "#fff5d5";

const coat = countershade(COAT_LIGHT, COAT, { level: -0.28, soft: 0.35 });

export const meta = {
  name: "Skybound Pegasus",
  description: "A faceted, feather-rich pegasus in a proud neutral flight-ready stance.",
  style: "low-poly",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "pegasus", detail: 1 });

  // Core skeleton: one readable spine, rising neck, four planted legs, and a long tail.
  const hips = b.joint("hips", { at: [0, 1.18, -0.42], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, -0.42],
      [0, 1.26, -0.12],
      [0, 1.3, 0.22],
      [0, 1.32, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.3, 0.5],
      [0, 1.52, 0.54],
      [0, 1.78, 0.66],
      [0, 1.94, 0.79],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.94, 0.79],
    dir: [0, 0.12, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.91, 0.91],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.18, -0.42],
      [0, 1.12, -0.78],
      [0, 1.03, -1.12],
      [0, 1.1, -1.42],
      [0, 1.25, -1.65],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // Wing skeletons are deliberately broad and spread, rather than folded against the body.
  const wingChains: { s: number; chain: Chain }[] = [];
  for (const s of [1, -1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.24, 1.45, 0.2],
        [s * 0.52, 1.6, 0.22],
        [s * 0.86, 1.86, 0.13],
        [s * 1.2, 2.04, -0.05],
        [s * 1.47, 1.98, -0.18],
      ]),
      {
        parent: spine.joints[2],
        names: [`wingRoot${s > 0 ? "L" : "R"}`, `wingMid${s > 0 ? "L" : "R"}`, `wingElbow${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`],
        role: "wing",
      },
    );
    wingChains.push({ s, chain: wing });
  }

  // Torso, neck, head, and muzzle remain crisp faceted tubes.
  b.sweep(spine, (t) => 0.29 - t * 0.035, {
    section: { ngon: 8 },
    color: coat,
    group: "body",
    name: "facetedTorso",
  });
  b.sweep(neck, (t) => 0.22 - t * 0.035, {
    section: { ngon: 7 },
    color: coat,
    group: "neck",
    name: "facetedNeck",
  });
  b.sweep(polyline([head.at, [0, 2.01, 0.98], [0, 2.02, 1.1]]), [0.19, 0.14], {
    section: { ngon: 7 },
    color: coat,
    bone: head,
    group: "head",
    name: "skull",
  });
  b.sweep(polyline([[0, 2.01, 1.03], [0, 2.0, 1.3]]), [0.135, 0.085], {
    section: { ngon: 6 },
    color: COAT_LIGHT,
    bone: head,
    group: "head",
    name: "muzzle",
  });
  b.sweep(polyline([jaw.at, [0, 1.9, 1.16], [0, 1.91, 1.28]]), [0.1, 0.035], {
    section: { ngon: 6 },
    color: COAT_DARK,
    bone: jaw,
    group: "jaw",
    name: "lowerJaw",
  });
  b.rod([0, 1.965, 1.12], [0, 1.94, 1.3], 0.012, { color: MOUTH, bone: head, name: "mouthLine" });

  // Legs use four named joints each; the slight forward knee / rear hock is easy to read in silhouette.
  const legData = [
    { s: 1, front: true, root: [0.25, 1.27, 0.32], knee: [0.3, 0.83, 0.43], ankle: [0.29, 0.36, 0.5], hoof: [0.29, 0.1, 0.59] },
    { s: -1, front: true, root: [-0.25, 1.27, 0.32], knee: [-0.3, 0.83, 0.43], ankle: [-0.29, 0.36, 0.5], hoof: [-0.29, 0.1, 0.59] },
    { s: 1, front: false, root: [0.27, 1.2, -0.29], knee: [0.34, 0.82, -0.48], ankle: [0.32, 0.36, -0.66], hoof: [0.32, 0.1, -0.55] },
    { s: -1, front: false, root: [-0.27, 1.2, -0.29], knee: [-0.34, 0.82, -0.48], ankle: [-0.32, 0.36, -0.66], hoof: [-0.32, 0.1, -0.55] },
  ];
  for (const leg of legData) {
    const side = leg.s > 0 ? "L" : "R";
    const prefix = leg.front ? "fore" : "hind";
    const chain = b.chain(
      `${prefix}Leg${side}`,
      polyline([leg.root, leg.knee, leg.ankle, leg.hoof]),
      {
        parent: leg.front ? spine.joints[2] : hips,
        names: [`${prefix}Shoulder${side}`, `${prefix}Knee${side}`, `${prefix}Ankle${side}`, `${prefix}Hoof${side}`],
        role: "leg",
      },
    );
    b.sweep(chain, (t) => (t < 0.34 ? 0.105 : t < 0.7 ? 0.075 : 0.055), {
      section: { ngon: 6 },
      color: (t) => (t > 0.73 ? HOOF : coat),
      group: `${prefix}Leg`,
      name: `${prefix}LegTube${side}`,
      caps: "round",
    });
    const foot = chain.tip!;
    b.part(new THREE.BoxGeometry(0.16, 0.105, 0.25), HOOF, {
      bone: foot,
      at: [leg.hoof[0], 0.05, leg.hoof[2] + 0.045],
      flat: true,
      group: "hooves",
      name: `hoofBlock${side}${leg.front ? "F" : "H"}`,
    });
    for (const toe of [-1, 0, 1]) {
      b.spike(
        [leg.hoof[0] + toe * 0.045, 0.095, leg.hoof[2] + 0.15],
        [0, -0.08, 1],
        0.1,
        0.018,
        { color: HOOF, bone: foot, group: "hooves", name: `toe${side}${leg.front ? "F" : "H"}${toe}` },
      );
    }
  }

  // Tail ends in a layered fan of angular plumes.
  b.sweep(tail, (t) => 0.12 - t * 0.085, {
    section: { ngon: 6 },
    color: coat,
    group: "tail",
    name: "tailTube",
  });
  for (let i = 0; i < 9; i++) {
    const t = 0.45 + i * 0.065;
    const p = tail.at(Math.min(t, 0.98));
    const length = 0.34 + i * 0.02;
    const feather = b.extrude(
      [[0, 0], [length * 0.62, 0.035], [length, 0], [length * 0.72, -0.075], [length * 0.12, -0.13]],
      {
        at: p.at,
        x: [0.18 + i * 0.025, 0.08, -0.98],
        y: [0, 0.98, 0.08],
        thickness: [0.028, 0.01],
        bevel: 0.008,
        color: i > 6 ? FEATHER_TIP : WING,
        bone: p.bone ?? undefined,
        group: "tailFeathers",
        name: `tailFeather${i}`,
      },
    );
    b.rod(p.at, feather.local([length * 0.8, -0.01, 0]), 0.012, { color: WING_SHADOW, bone: p.bone ?? undefined, name: `tailShaft${i}` });
  }

  // Wing coverts and long primary feathers fan in two ranks on each side.
  for (const s of [1, -1]) {
    const wing = wingChains.find((entry) => entry.s === s)!.chain;
    for (let i = 0; i < 8; i++) {
      const t = 0.16 + i * 0.095;
      const p = wing.at(t);
      const length = 0.42 + i * 0.045;
      const feather = b.extrude(
        [[0, 0], [length * 0.42, 0.055], [length, 0.02], [length * 0.86, -0.045], [length * 0.28, -0.2], [length * 0.06, -0.12]],
        {
          at: p.at,
          x: [s * 0.93, 0.18, -0.16],
          y: [0, 1, 0],
          thickness: [0.034, 0.01],
          bevel: 0.009,
          color: i > 5 ? FEATHER_TIP : WING,
          bone: p.bone ?? undefined,
          group: "primaryFeathers",
          name: `primary${s > 0 ? "L" : "R"}${i}`,
        },
      );
      b.rod(p.at, feather.local([length * 0.9, -0.02, 0]), 0.012, {
        color: WING_SHADOW,
        bone: p.bone ?? undefined,
        group: "primaryFeathers",
        name: `primaryShaft${s > 0 ? "L" : "R"}${i}`,
      });
    }
    for (let i = 0; i < 7; i++) {
      const t = 0.08 + i * 0.105;
      const p = wing.at(t);
      const length = 0.24 + i * 0.018;
      b.extrude(
        [[0, 0], [length * 0.55, 0.06], [length, 0], [length * 0.55, -0.12], [0.06, -0.08]],
        {
          at: p.at,
          x: [s * 0.96, 0.08, -0.08],
          y: [0, 1, 0],
          thickness: [0.03, 0.012],
          bevel: 0.006,
          color: i % 2 ? WING : WING_SHADOW,
          bone: p.bone ?? undefined,
          group: "covertFeathers",
          name: `covert${s > 0 ? "L" : "R"}${i}`,
        },
      );
    }
    // A ridge of gold-tipped shoulder feathers gives the otherwise cool palette a strong focal accent.
    for (let i = 0; i < 4; i++) {
      const p = wing.at(0.06 + i * 0.06);
      b.spike(p, [s * 0.85, 0.35, -0.15], 0.18 + i * 0.015, 0.04, {
        color: MANE,
        bone: p.bone ?? undefined,
        group: "wingAccents",
        name: `shoulderSpike${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // Angular mane plates and a swept forelock, kept as separate low-poly silhouettes.
  for (let i = 0; i < 7; i++) {
    const p = neck.at(0.08 + i * 0.12);
    for (const s of [1, -1]) {
      b.extrude(
        [[0, 0], [0.07, 0.025], [0.13, 0.14], [0.06, 0.2], [0, 0.08]],
        {
          at: p.at,
          x: [s, 0, 0],
          y: [0, 0.98, 0.12],
          thickness: 0.018,
          bevel: 0.004,
          color: i % 2 ? MANE : FEATHER_TIP,
          bone: p.bone ?? undefined,
          group: "mane",
          name: `mane${s > 0 ? "L" : "R"}${i}`,
        },
      );
    }
  }
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.1, 0.04], [0.2, 0.22], [0.12, 0.36], [0.03, 0.27]],
      {
        at: [s * 0.08, 2.05, 0.72],
        x: [s, 0, 0],
        y: [0, 0.98, 0.1],
        thickness: 0.022,
        bevel: 0.006,
        color: MANE,
        bone: head,
        group: "forelock",
        name: `forelock${s > 0 ? "L" : "R"}`,
      },
    );
  }
  // A narrow central crest gives the neck a second silhouette layer in side view.
  for (let i = 0; i < 5; i++) {
    const p = neck.at(0.16 + i * 0.15);
    b.extrude(
      [[0, 0], [0.07, 0.015], [0.14, 0.11], [0.09, 0.2], [0.025, 0.24]],
      {
        at: p.at,
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.02,
        bevel: 0.005,
        color: i % 2 ? FEATHER_TIP : MANE,
        bone: p.bone ?? undefined,
        group: "crest",
        name: `crest${i}`,
      },
    );
  }

  // Ears, eyes, nostrils, and tiny teeth make the head read at close range.
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.11, 0.02], [0.075, 0.23], [0.018, 0.29]],
      {
        at: [s * 0.13, 2.04, 0.76],
        x: [s, 0, 0],
        y: [0, 0.96, 0.16],
        thickness: 0.035,
        bevel: 0.008,
        color: COAT_DARK,
        bone: head,
        group: "ears",
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.057, 8, 5), COAT_LIGHT, {
      bone: head,
      at: [s * 0.145, 2.06, 0.98],
      flat: true,
      group: "eyes",
      name: `eyeWhite${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.032, 7, 5), IRIS, {
      bone: head,
      at: [s * 0.145, 2.06, 1.03],
      flat: true,
      group: "eyes",
      name: `iris${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.015, 6, 4), EYE, {
      bone: head,
      at: [s * 0.145, 2.06, 1.055],
      flat: true,
      group: "eyes",
      name: `pupil${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", {
      bone: head,
      at: [s * 0.133, 2.078, 1.068],
      flat: true,
      group: "eyes",
      name: `eyeGlint${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.027, 6, 4), MOUTH, {
      bone: head,
      at: [s * 0.06, 2.015, 1.29],
      flat: true,
      group: "nostrils",
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.06, 1.94, 1.2], [0, 0, 1], 0.07, 0.018, { color: TOOTH, bone: jaw, name: `tooth${s > 0 ? "L" : "R"}` });
  }

  // Small chest and flank facets break up the large torso planes without losing the geometric style.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p = spine.at(0.22 + i * 0.16);
      b.part(new THREE.TetrahedronGeometry(0.045 + i * 0.004, 0), COAT_DARK, {
        bone: p.bone ?? undefined,
        at: [s * (0.23 + i * 0.01), p.at.y + 0.03, p.at.z],
        flat: true,
        group: "flankFacets",
        name: `flankFacet${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  return b.root;
}

