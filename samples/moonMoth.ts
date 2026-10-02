import * as THREE from "three";
import { createBuilder, Builder } from "../src/builder";
import type { JointRef } from "../src/context";
import { cel, furEdge, animeEye, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { catmull, polyline } from "../src/path";
import { rng } from "../src/math";

const VIOLET = cel("#8f58b7", "#4a2d70");
const VIOLET_DARK = cel("#5b317f", "#2b1a48");
const MINT = cel("#b7f3dd", "#4e9c9c");
const MINT_EDGE = cel("#e9b6ef", "#724c9d");
const PINK = cel("#ff9ccf", "#b43f88");
const CREAM = cel("#fff2c9", "#d59a7b");

const EYE_GOLD = "#ffd86b";
const EYE_CORE = "#fff5b0";
const EYE_PURPLE = "#6a2c98";

const coat = furEdge(VIOLET, MINT, {
  level: -0.16,
  teeth: 0.12,
  period: 0.055,
  axis: [0, 1, 0],
  along: [0, 0, 1],
  ink: INK,
  inkWidth: 0.035,
});
const abdomenCoat = furEdge(VIOLET_DARK, PINK, {
  level: -0.18,
  teeth: 0.09,
  period: 0.05,
  axis: [0, 1, 0],
  along: [0, 0, 1],
  ink: INK,
  inkWidth: 0.03,
});
const wingPaint = furEdge(MINT, MINT_EDGE, {
  level: -0.02,
  teeth: 0.08,
  period: 0.08,
  axis: [0, 1, 0],
  along: [1, 0, 0],
  ink: "#3d225d",
  inkWidth: 0.018,
});

function eyeSpot(
  b: Builder,
  at: [number, number, number],
  bone: JointRef,
  radius: number,
  mirrored = false,
) {
  const face = mirrored ? -1 : 1;
  const front = b.part(new THREE.SphereGeometry(1, 14, 8), EYE_GOLD, {
    at,
    bone,
    scale: [radius, radius, radius * 0.08],
    name: mirrored ? "wingEyeBack" : "wingEyeFront",
  });
  const core = b.part(new THREE.SphereGeometry(1, 12, 8), EYE_PURPLE, {
    at: [at[0], at[1], at[2] + face * 0.016],
    bone,
    scale: [radius * 0.62, radius * 0.62, radius * 0.07],
    name: mirrored ? "wingEyeCoreBack" : "wingEyeCoreFront",
  });
  const spark = b.part(new THREE.SphereGeometry(1, 10, 6), EYE_CORE, {
    at: [at[0] - radius * 0.16, at[1] + radius * 0.2, at[2] + face * 0.028],
    bone,
    scale: [radius * 0.23, radius * 0.23, radius * 0.06],
    name: mirrored ? "wingSparkBack" : "wingSparkFront",
  });
  glow(front, 1.35);
  glow(spark, 2.2);
  return { front, core, spark };
}

export const meta = {
  name: "Moon Moth",
  description: "A giant luna moon moth with glowing eyespots, jewel-like antennae, and storybook wings.",
  style: "whimsical anime mix",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "moonMoth", detail: 1 });
  const thorax = b.joint("thorax", { at: [0, 0.73, 0], role: "spine" });

  b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
    bone: thorax,
    at: [0, 0.74, 0],
    scale: [0.25, 0.27, 0.32],
    name: "velvetThorax",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), MINT, {
    bone: thorax,
    at: [0, 0.9, 0.16],
    scale: [0.17, 0.13, 0.13],
    name: "thoraxCollar",
  });

  const abdomenPath = catmull([
    [0, 0.7, -0.14],
    [0, 0.69, -0.4],
    [0, 0.6, -0.68],
    [0, 0.47, -0.92],
    [0, 0.29, -1.13],
  ]);
  const abdomen = b.chain("abdomen", abdomenPath, {
    parent: thorax,
    names: ["abdomenBase", "abdomenMid", "abdomenRear", "abdomenTip"],
    role: "spine",
  });
  b.sweep(abdomen, (t) => 0.17 * (1 - t) + 0.035, {
    color: abdomenCoat,
    section: { ngon: 8 },
    caps: "round",
    name: "stripedAbdomen",
  });
  b.along(abdomen, 6, (at) => {
    b.part(new THREE.SphereGeometry(1, 8, 5), PINK, {
      at,
      scale: [0.17, 0.035, 0.19],
      name: "abdomenBand",
    });
  });

  const neckPath = catmull([
    [0, 0.79, 0.11],
    [0, 0.88, 0.27],
    [0, 0.93, 0.4],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: thorax,
    names: ["neckBase", "neckTip"],
    role: "neck",
  });
  b.sweep(neck, [0.13, 0.1], { color: coat, section: { ngon: 8 }, name: "softNeck" });
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 0.95, 0.43], dir: [0, 0.05, 1], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), coat, {
    bone: head,
    at: [0, 0.98, 0.48],
    scale: [0.21, 0.19, 0.2],
    name: "moonFace",
  });

  const mouthUpper = b.chain("upperJaw", polyline([[0, 0.96, 0.57], [0, 0.94, 0.72]]), {
    parent: head,
    names: ["upperJaw"],
    role: "jaw",
  });
  b.sweep(mouthUpper, [0.095, 0.018], {
    color: CREAM,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "upperPalp",
  });
  const mouthLower = b.chain("lowerJaw", polyline([[0, 0.86, 0.57], [0, 0.82, 0.69]]), {
    parent: head,
    names: ["lowerJaw"],
    role: "jaw",
  });
  b.sweep(mouthLower, [0.08, 0.012], {
    color: VIOLET_DARK,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "lowerPalp",
  });
  const lowerTip = mouthLower.joints[mouthLower.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.035, 8, 6), PINK, {
    bone: lowerTip,
    at: lowerTip.at,
    name: "mouthGem",
  });

  const eyeTexture = animeEye({ iris: "#45e5c1", irisLight: "#d4fff2", irisDark: "#175b6b", blush: "#ff8bb8", size: 256 });
  const headSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const hit = headSurface.around(skull.at).at(side * 34, 9);
    if (hit) {
      b.decal(headSurface, eyeTexture, {
        at: hit,
        size: [0.095, 0.13],
        mirror: side > 0,
        name: side > 0 ? "animeEyeL" : "animeEyeR",
      });
    }
  }
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.038, 10, 6), PINK, {
      bone: head,
      at: [side * 0.16, 0.92, 0.6],
      name: "cheek",
    });
  }

  const antennaPlans = [
    { side: 1 as const, points: [[0.1, 1.1, 0.56], [0.22, 1.3, 0.67], [0.38, 1.4, 0.62]] as [number, number, number][], names: ["antennaLBase", "antennaLMid", "antennaLTip"] },
    { side: -1 as const, points: [[-0.1, 1.1, 0.56], [-0.22, 1.3, 0.67], [-0.38, 1.4, 0.62]] as [number, number, number][], names: ["antennaRBase", "antennaRMid", "antennaRTip"] },
  ];
  for (const antenna of antennaPlans) {
    const chain = b.chain(`feelers${antenna.side > 0 ? "L" : "R"}`, catmull(antenna.points), {
      parent: head,
      names: antenna.names,
      role: "tentacle",
    });
    b.sweep(chain, [0.018, 0.009, 0.003], {
      color: PINK,
      caps: { start: "round", end: "point" },
      name: "feeler",
    });
    const tip = chain.joints[chain.joints.length - 1];
    const jewel = b.part(new THREE.SphereGeometry(0.025, 8, 6), EYE_CORE, {
      bone: tip,
      at: tip.at,
      name: "antennaJewel",
    });
    glow(jewel, 1.6);
  }

  const legData = [
    { side: 1 as const, key: "F", z: 0.16, target: [0.61, 0.11, 0.38] as [number, number, number], knee: [0.34, 0.48, 0.24] as [number, number, number] },
    { side: 1 as const, key: "M", z: 0, target: [0.72, 0.1, -0.04] as [number, number, number], knee: [0.42, 0.44, -0.04] as [number, number, number] },
    { side: 1 as const, key: "H", z: -0.16, target: [0.59, 0.11, -0.55] as [number, number, number], knee: [0.36, 0.45, -0.3] as [number, number, number] },
    { side: -1 as const, key: "F", z: 0.16, target: [-0.61, 0.11, 0.38] as [number, number, number], knee: [-0.34, 0.48, 0.24] as [number, number, number] },
    { side: -1 as const, key: "M", z: 0, target: [-0.72, 0.1, -0.04] as [number, number, number], knee: [-0.42, 0.44, -0.04] as [number, number, number] },
    { side: -1 as const, key: "H", z: -0.16, target: [-0.59, 0.11, -0.55] as [number, number, number], knee: [-0.36, 0.45, -0.3] as [number, number, number] },
  ];
  for (const leg of legData) {
    const root = [leg.side * 0.18, 0.73, leg.z] as [number, number, number];
    const ankle = [leg.target[0], 0.2, leg.target[2]] as [number, number, number];
    const chain = b.chain(`leg${leg.key}${leg.side > 0 ? "L" : "R"}`, polyline([root, leg.knee, ankle, leg.target]), {
      parent: thorax,
      names: [`hip${leg.key}${leg.side > 0 ? "L" : "R"}`, `knee${leg.key}${leg.side > 0 ? "L" : "R"}`, `ankle${leg.key}${leg.side > 0 ? "L" : "R"}`, `foot${leg.key}${leg.side > 0 ? "L" : "R"}`],
      role: "leg",
    });
    b.sweep(chain, [0.052, 0.041, 0.027, 0.018], {
      color: coat,
      section: { ngon: 6 },
      caps: "round",
      name: `leg${leg.key}${leg.side > 0 ? "L" : "R"}Tube`,
    });
    for (const toe of [-1, 1]) {
      const toeTip = [leg.target[0] + toe * 0.07, 0.004, leg.target[2] + 0.09] as [number, number, number];
      const toeChain = b.chain(`toe${leg.key}${leg.side > 0 ? "L" : "R"}${toe > 0 ? "A" : "B"}`, polyline([leg.target, toeTip]), {
        parent: chain.tip!,
        names: [`toe${leg.key}${leg.side > 0 ? "L" : "R"}${toe > 0 ? "A" : "B"}`],
        role: "digit",
      });
      b.sweep(toeChain, [0.014, 0.004], { color: CREAM, caps: "point", name: "velvetToe" });
    }
  }

  const wingPlans = [
    { side: 1 as const, label: "ForeL", lead: [[0.16, 0.84, 0.06], [0.55, 1.18, 0.18], [1.03, 1.13, 0.38]] as [number, number, number][], trail: [[0.16, 0.84, 0.06], [0.52, 0.88, 0.26], [1.03, 1.13, 0.38]] as [number, number, number][], eye: [0.77, 1.05, 0.33] as [number, number, number], vein: [0.72, 1.01, 0.22] as [number, number, number] },
    { side: -1 as const, label: "ForeR", lead: [[-0.16, 0.84, 0.06], [-0.55, 1.18, 0.18], [-1.03, 1.13, 0.38]] as [number, number, number][], trail: [[-0.16, 0.84, 0.06], [-0.52, 0.88, 0.26], [-1.03, 1.13, 0.38]] as [number, number, number][], eye: [-0.77, 1.05, 0.33] as [number, number, number], vein: [-0.72, 1.01, 0.22] as [number, number, number] },
    { side: 1 as const, label: "HindL", lead: [[0.14, 0.77, -0.03], [0.53, 0.89, -0.42], [0.87, 0.74, -0.9]] as [number, number, number][], trail: [[0.14, 0.77, -0.03], [0.43, 0.6, -0.5], [0.87, 0.74, -0.9]] as [number, number, number][], eye: [0.69, 0.72, -0.64] as [number, number, number], vein: [0.62, 0.73, -0.5] as [number, number, number] },
    { side: -1 as const, label: "HindR", lead: [[-0.14, 0.77, -0.03], [-0.53, 0.89, -0.42], [-0.87, 0.74, -0.9]] as [number, number, number][], trail: [[-0.14, 0.77, -0.03], [-0.43, 0.6, -0.5], [-0.87, 0.74, -0.9]] as [number, number, number][], eye: [-0.69, 0.72, -0.64] as [number, number, number], vein: [-0.62, 0.73, -0.5] as [number, number, number] },
  ];
  for (const wing of wingPlans) {
    const lead = b.chain(`wingLead${wing.label}`, polyline(wing.lead), {
      parent: thorax,
      names: [`wingRoot${wing.label}`, `wingMid${wing.label}`, `wingTip${wing.label}`],
      role: "wing",
    });
    const trail = b.chain(`wingTrail${wing.label}`, polyline(wing.trail), {
      parent: thorax,
      names: [`wingEdgeRoot${wing.label}`, `wingEdgeMid${wing.label}`, `wingEdgeTip${wing.label}`],
      role: "wing",
    });
    b.sweep(lead, [0.035, 0.026, 0.012], { color: MINT_EDGE, section: { ngon: 6 }, name: "wingLeadingRim" });
    b.sweep(trail, [0.03, 0.022, 0.012], { color: MINT_EDGE, section: { ngon: 6 }, name: "wingTrailingRim" });
    b.membrane(lead, trail, {
      color: wingPaint,
      thickness: 0.014,
      rows: 4,
      cols: 5,
      scallop: 0.14,
      name: `${wing.label}Membrane`,
    });
    const eye = eyeSpot(b, wing.eye, lead.joints[1], wing.label.startsWith("Fore") ? 0.16 : 0.13);
    eyeSpot(b, [wing.eye[0], wing.eye[1], wing.eye[2] + 0.012], lead.joints[1], wing.label.startsWith("Fore") ? 0.16 : 0.13, true);
    b.rod(lead.at(0.12), wing.vein, 0.012, { color: MINT_EDGE, name: "wingVein" });
    b.rod(lead.at(0.42), wing.vein, 0.009, { color: MINT_EDGE, name: "wingVeinBranch" });
    b.along(lead, 5, (at) => {
      b.part(new THREE.SphereGeometry(1, 7, 5), PINK, {
        at,
        scale: [0.025, 0.025, 0.025],
        name: "wingBead",
      });
    });
    glow(eye.front, 1.5);
  }

  // A few tiny motes make the silhouette playful without hiding the broad wing shapes.
  const moteRng = rng(23);
  for (let i = 0; i < 8; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const mote = b.part(new THREE.SphereGeometry(0.012 + moteRng() * 0.01, 7, 5), EYE_CORE, {
      bone: thorax,
      at: [side * (0.28 + moteRng() * 0.3), 0.38 + moteRng() * 0.42, -0.6 + moteRng() * 0.8],
      name: "moonMote",
    });
    glow(mote, 1.3);
  }

  return b.root;
}
