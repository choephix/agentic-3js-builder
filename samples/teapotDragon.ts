// Teapot Dragon: a small companion dragon (about 0.8 m long from snout to tail) whose body is a round
// glazed porcelain teapot: the lid is a hinged crest on its back, the spout its long neck and snout with a
// separate jaw, the handle its curled tail, painted blue-and-white patterns on the glaze, little clawed legs
// planted on the floor, small porcelain wings held out, and a wisp of steam from its nostrils.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { DEG } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Teapot Dragon",
  description:
    "A small companion pet dragon whose body is a round blue-and-white glazed porcelain teapot: a hinged lid crest on its back, a curved spout neck and snout with an openable jaw, curled handle tail, delicate porcelain wings, clawed feet planted on the floor, and wisps of steam curling from its nostrils.",
  builtBy: "Gemini 3.8 Flash",
};

// ------------------------------------------------------------------------------------------------- Palette
// Classic Ming blue-and-white porcelain: pure white glaze, pale shade, and cobalt in 4 densities.
const GLAZE = "#f7fafc";
const SHADE = "#e2eaf2";
const COBALT_PALE = "#a4bfe8";
const COBALT_MED = "#3d6cb5";
const COBALT_DEEP = "#14377d";
const COBALT_DARK = "#091e4a";
const GOLD_LUSTRE = "#d4af37";
const GOLD_HIGHLIGHT = "#f3e5ab";
const CLAW_PORCELAIN = "#e5edf5";

type C = string | Rgb;

const fract = (x: number) => x - Math.floor(x);

function porcelainGlaze(_p: THREE.Vector3, n: THREE.Vector3): C {
  // Soft ambient shading under belly, subtle high-gloss porcelain look
  const shade = smoothstep(0.3, -0.8, n.y) * 0.4;
  return mix(GLAZE, SHADE, shade);
}

// Blue-and-white cloud / wave pattern generator for porcelain
const teapotPaint = paint((p, n, s) => {
  let c = porcelainGlaze(p, n);
  // Lathe coords: s[0] is y in meters, s[1] is angle in degrees (0..360)
  const deg = ((s[1] % 360) + 360) % 360;
  const y = s[0];

  // Golden trimmed bands at rim and foot
  // Body rim is at y = 0.355, foot ring at y = 0.05.
  // On the lid (lathed at [0, 0.36, -0.08]), local y runs from -0.005 to 0.15;
  // the finial knob sits at y ~ 0.13.
  if (Math.abs(y - 0.355) < 0.007 || Math.abs(y - 0.05) < 0.006 || Math.abs(y - 0.13) < 0.007) {
    return mix(GOLD_LUSTRE, GOLD_HIGHLIGHT, smoothstep(-0.2, 0.8, n.x));
  }

  // Cobalt fine accent pinstripes
  if (Math.abs(y - 0.335) < 0.004 || Math.abs(y - 0.075) < 0.004 || Math.abs(y - 0.015) < 0.004) {
    return COBALT_DEEP;
  }

  // Ming style swirling cloud and wave motifs around the belly (y ~ 0.10 to 0.31)
  if (y > 0.09 && y < 0.31) {
    const rad = deg * (Math.PI / 180);
    const wave = Math.sin(rad * 5 + y * 35) * 0.012;
    const wave2 = Math.cos(rad * 3 - y * 25) * 0.015;
    const swirl = noise(new THREE.Vector3(p.x * 10, p.y * 12, p.z * 10), 0.2, 7);

    // Flowing dragon cloud scrolls
    const distFromCenter = Math.abs(y - 0.20 + wave + wave2);
    if (distFromCenter < 0.008 || (swirl > 0.68 && distFromCenter < 0.045)) {
      return COBALT_DEEP;
    } else if (distFromCenter < 0.016 || (swirl > 0.58 && distFromCenter < 0.06)) {
      return COBALT_MED;
    } else if (swirl > 0.48 && distFromCenter < 0.075) {
      return COBALT_PALE;
    }

    // Lotus petal pattern near the foot ring
    if (y < 0.13) {
      const petal = Math.abs(fract(deg / 30) - 0.5) * 2;
      const petalEdge = 0.09 + petal * 0.03;
      if (y < petalEdge) {
        return Math.abs(y - petalEdge) < 0.003 ? COBALT_DEEP : COBALT_MED;
      }
    }

    // Ruyi cloud border near shoulder
    if (y > 0.27) {
      const ruyi = Math.sin(rad * 8) * 0.01;
      if (y > 0.28 + ruyi) {
        return COBALT_MED;
      }
    }
  }

  return c;
});
// Neck / Spout porcelain paint: swirling spiral water / breath of flame motifs
const spoutPaint = paint((p, n, s) => {
  let c = porcelainGlaze(p, n);
  const t = s[0]; // along tube 0..1
  const deg = ((s[1] % 360) + 360) % 360;

  // Gold ring at the tip of the spout / dragon muzzle
  if (t > 0.94) {
    return mix(GOLD_LUSTRE, GOLD_HIGHLIGHT, smoothstep(-0.2, 0.8, n.x));
  }

  // Delicate spiral fluting bands
  const spiralVal = fract(t * 4 + deg / 240);
  if (spiralVal < 0.15) {
    return COBALT_DEEP;
  } else if (spiralVal < 0.28) {
    return COBALT_MED;
  }

  // Subtle fluting ring
  const ring = fract(t * 10);
  if (ring < 0.08) {
    return COBALT_PALE;
  }

  return c;
});
// Tail / Handle porcelain paint: ribbed braids with cobalt accents
const handlePaint = paint((_p, n, s) => {
  let c = porcelainGlaze(_p, n);
  const t = s[0];
  const deg = ((s[1] % 360) + 360) % 360;

  // Gold trim at attachments and tail spade
  if (t < 0.08 || t > 0.92) {
    return GOLD_LUSTRE;
  }

  // Clean braided ceramic ribs
  const chevron = fract(t * 10 + (deg > 180 ? 360 - deg : deg) / 240);
  if (chevron < 0.2) {
    return COBALT_DEEP;
  } else if (chevron < 0.35) {
    return COBALT_MED;
  }

  return c;
});

// Wing porcelain paint: delicate blue floral delft/ming painted ribs
const wingPaint = paint((_p, _n, s) => {
  const u = s[0]; // along
  const v = s[1]; // across
  let c = mix(GLAZE, SHADE, v * 0.3);
  // Border trim
  if (u < 0.05 || u > 0.95 || v > 0.92) {
    return COBALT_DEEP;
  }
  // Delicate blue feathering
  const f = Math.sin(v * 18 + u * 12);
  if (f > 0.5) return COBALT_MED;
  if (f > 0.2) return COBALT_PALE;

  return c;
});

// Steam card texture: delicate translucent stylized curling smoke/steam puffs
const steamSvg = svg(
  `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="steamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#eaf2fc" stop-opacity="0.85"/>
        <stop offset="75%" stop-color="#d5e8fb" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <path d="M 64 250 C 50 220 30 190 45 160 C 60 130 95 135 85 95 C 75 60 40 55 55 20 C 60 10 70 5 72 0 C 80 15 90 40 80 70 C 70 100 45 110 52 140 C 60 170 85 180 75 215 C 70 235 66 245 64 250 Z" fill="url(#steamGrad)"/>
    <circle cx="58" cy="85" r="14" fill="#f0f6ff" fill-opacity="0.6"/>
    <circle cx="75" cy="140" r="16" fill="#f0f6ff" fill-opacity="0.5"/>
    <circle cx="48" cy="190" r="18" fill="#ffffff" fill-opacity="0.7"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "teapotDragon", paintSize: 1024 });

  // -----------------------------------------------------------------------------------------------
  // SKELETON TREE
  // Dragon pet size: ~0.8 m long, ~0.45 m tall.
  // Root at teapot center of mass / hips.

  const hips = b.joint("hips", { at: [0, 0.22, -0.05], role: "spine", group: "body" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.24, 0.08], aim: [0, 0.28, 0.2], role: "spine", group: "body" });

  // Neck and Head (Spout)
  const neck1 = b.joint("neck1", { parent: spine, at: [0, 0.27, 0.16], aim: [0, 0.33, 0.26], role: "neck", group: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 0.33, 0.26], aim: [0, 0.40, 0.33], role: "neck", group: "neck" });
  const head = b.joint("head", { parent: neck2, at: [0, 0.40, 0.33], aim: [0, 0.42, 0.45], role: "head", group: "head" });

  // Openable Lower Jaw (Spout mouth underside)
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.38, 0.36], aim: [0, 0.38, 0.46], role: "jaw", group: "jaw" });

  // Hinged Lid Crest on the back
  const lid = b.joint("lidCrest", { parent: hips, at: [0, 0.36, -0.08], aim: [0, 0.44, -0.08], role: "hinge", group: "crest" });

  // Curled Tail (Teapot Handle)
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.20, -0.18],
      [0, 0.28, -0.28],
      [0, 0.40, -0.29],
      [0, 0.44, -0.21],
      [0, 0.37, -0.15],
      [0, 0.42, -0.09], // tip curls up elegantly
    ]),
    {
      parent: hips,
      count: 5,
      role: "tail",
      group: "tail",
    },
  );

  // Wings (Left and Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const g = `wing${side}`;
    const wingJoint = b.joint(`wing${side}`, {
      parent: spine,
      at: [s * 0.14, 0.29, 0.06],
      aim: [s * 0.32, 0.36, -0.02],
      role: "wing",
      group: g,
    });
    const wingTip = b.joint(`wingTip${side}`, {
      parent: wingJoint,
      at: [s * 0.32, 0.36, -0.02],
      aim: [s * 0.42, 0.42, -0.10],
      role: "wing",
      group: g,
    });

    // Porcelain wing structure: glazed rib arm and porcelain vane membrane
    const armPath = catmull([
      [s * 0.12, 0.27, 0.05],
      [s * 0.22, 0.33, 0.02],
      [s * 0.32, 0.36, -0.02],
      [s * 0.42, 0.42, -0.10],
    ]);
    b.sweep(armPath, (t) => [0.016 * (1 - 0.5 * t), 0.012 * (1 - 0.5 * t)], {
      bone: [wingJoint, wingTip],
      color: teapotPaint,
      group: g,
      name: `wingArm${side}`,
    });

    // Trailing membrane/feather edge of the porcelain wing
    const vaneEdge = catmull([
      [s * 0.13, 0.24, -0.01],
      [s * 0.24, 0.26, -0.08],
      [s * 0.34, 0.30, -0.14],
      [s * 0.42, 0.42, -0.10],
    ]);

    b.membrane(armPath, vaneEdge, {
      color: wingPaint,
      thickness: 0.006,
      bone: wingJoint,
      group: g,
      name: `wingVane${side}`,
      scallop: 0.12,
    });

    // Small golden claw spur at the wing wrist joint
    b.spike([s * 0.32, 0.36, -0.02], [s * 0.3, 0.42, 0.02], 0.035, 0.007, {
      bone: wingJoint,
      color: GOLD_LUSTRE,
      group: g,
      name: `wingClaw${side}`,
    });
  }

  // Four clawed legs planted firmly on the floor (y = 0)
  // Front legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const g = `legF${side}`;
    const hipPt: V3 = [s * 0.12, 0.16, 0.10];
    const footPt: V3 = [s * 0.15, 0.02, 0.18]; // foot rests on floor, claw touches y = 0
    const pts = limb(hipPt, footPt, [0.09, 0.09], [s * 0.04, -0.02, 0.08]);

    const legChain = b.chain(`legF${side}`, pts, {
      parent: spine,
      names: [`shoulderF${side}`, `elbowF${side}`],
      role: "leg",
      group: g,
      contact: [s * 0.15, 0.0, 0.22],
    });

    b.sweep(legChain, (t) => 0.028 * (1 - 0.35 * t), {
      color: teapotPaint,
      group: g,
      name: `legFSweep${side}`,
    });

    // Paw / Claw assembly resting on floor
    const footBone = legChain.joints[legChain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.022, 8), teapotPaint, {
      bone: footBone,
      at: [s * 0.15, 0.015, 0.18],
      group: g,
      name: `pawF${side}`,
    });

    // 3 sharp porcelain dragon claws pointing forward onto the floor
    for (let i = -1; i <= 1; i++) {
      const angle = i * 25 * DEG;
      const clawDir: V3 = [s * Math.sin(angle), -0.2, Math.cos(angle)];
      const clawBase: V3 = [s * 0.15 + s * Math.sin(angle) * 0.025, 0.014, 0.18 + Math.cos(angle) * 0.025];
      b.spike(clawBase, clawDir, 0.025, 0.007, {
        bone: footBone,
        color: CLAW_PORCELAIN,
        group: g,
        name: `clawF${side}_${i}`,
      });
    }
  }

  // Hind legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const g = `legH${side}`;
    const hipPt: V3 = [s * 0.14, 0.18, -0.12];
    const footPt: V3 = [s * 0.17, 0.025, -0.10];
    const pts = limb(hipPt, footPt, [0.108, 0.098], [s * 0.06, 0.02, -0.06]);

    const legChain = b.chain(`legH${side}`, pts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`],
      role: "leg",
      group: g,
      contact: [s * 0.17, 0.0, -0.06],
    });

    b.sweep(legChain, (t) => 0.032 * (1 - 0.45 * t), {
      color: teapotPaint,
      group: g,
      name: `legHSweep${side}`,
    });

    // Haunch bulb / porcelain thigh swell
    b.part(new THREE.SphereGeometry(0.046, 10, 8), teapotPaint, {
      bone: legChain.joints[0],
      at: [s * 0.14, 0.18, -0.12],
      scale: [0.8, 1.1, 1.0],
      group: g,
      name: `haunch${side}`,
    });

    const footBone = legChain.joints[legChain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.028, 0.034, 0.022, 8), teapotPaint, {
      bone: footBone,
      at: [s * 0.17, 0.015, -0.10],
      group: g,
      name: `pawH${side}`,
    });

    // 3 claws
    for (let i = -1; i <= 1; i++) {
      const angle = (i * 25 + 10) * DEG;
      const clawDir: V3 = [s * Math.sin(angle), -0.2, Math.cos(angle)];
      const clawBase: V3 = [s * 0.17 + s * Math.sin(angle) * 0.026, 0.014, -0.10 + Math.cos(angle) * 0.026];
      b.spike(clawBase, clawDir, 0.026, 0.007, {
        bone: footBone,
        color: CLAW_PORCELAIN,
        group: g,
        name: `clawH${side}_${i}`,
      });
    }
  }

  // -----------------------------------------------------------------------------------------------
  // MAIN TEAPOT BODY (The Dragon's Torso)
  // Turned porcelain body with elegant foot ring, bulging belly, and defined shoulder rim.
  // Lathed around Y axis at [0, 0, 0].
  const potOutline: readonly OutlinePoint[] = [
    [0.0, 0.04, "sharp"],     // inner recessed base
    [0.09, 0.04, "sharp"],    // foot ring inner
    [0.095, 0.025, "sharp"],  // foot ring touches low base
    [0.11, 0.025, "sharp"],   // foot ring bottom rim (near ground)
    [0.115, 0.05, "sharp"],   // foot ring rise
    [0.165, 0.12],            // lower belly flare
    [0.195, 0.20],            // widest pot equator
    [0.185, 0.28],            // upper belly
    [0.135, 0.34],            // neck/shoulder inward curve
    [0.142, 0.355, "sharp"],  // gallery rim outer lip
    [0.125, 0.355, "sharp"],  // gallery rim inner lip for lid
    [0.0, 0.35, "sharp"],     // gallery floor
  ];

  b.lathe(potOutline, {
    at: [0, 0, 0],
    axis: [0, 1, 0],
    segments: 24,
    smoothing: 1,
    color: teapotPaint,
    bone: hips,
    group: "body",
    name: "teapotPotBody",
  });

  // Base foot ring support touching exactly y = 0
  // Four porcelain ball feet under the pot base so the whole model rests gracefully at y = 0
  for (let a = 0; a < 4; a++) {
    const rad = (a * 90 + 45) * DEG;
    const fx = Math.sin(rad) * 0.095;
    const fz = Math.cos(rad) * 0.095;
    b.part(new THREE.SphereGeometry(0.015, 6, 4), GOLD_LUSTRE, {
      bone: hips,
      at: [fx, 0.015, fz],
      group: "body",
      name: `footStud_${a}`,
    });
  }

  // -----------------------------------------------------------------------------------------------
  // HINGED LID CREST ON THE BACK
  // The teapot lid acts as the dragon's dorsal crest, hinged at the back!
  // Lathe the lid dome, plus a finial dragon pearl / crest horn.
  // Outline in local coordinates of lid joint at [0, 0.36, -0.08]: y relative to 0.36
  const lidOutline: readonly OutlinePoint[] = [
    [0.0, -0.005, "sharp"],
    [0.124, -0.005, "sharp"],  // sits in gallery
    [0.128, 0.010, "sharp"],   // lid rim flange
    [0.115, 0.030],            // lid dome rise
    [0.065, 0.070],            // lid dome crown
    [0.025, 0.090, "sharp"],   // finial stem base
    [0.018, 0.110, "sharp"],   // stem waist
    [0.032, 0.130],            // pearl knob
    [0.0, 0.150, "sharp"],     // crest tip
  ];

  b.lathe(lidOutline, {
    at: [0, 0.36, -0.08],
    axis: [0, 1, 0],
    segments: 20,
    smoothing: 1,
    color: teapotPaint,
    bone: lid,
    group: "crest",
    name: "lidCrestMesh",
  });

  // Small brass hinge at the rear of the lid
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.03, 8), GOLD_LUSTRE, {
    bone: hips,
    at: [0, 0.36, -0.135],
    rotation: [0, 0, 90],
    group: "crest",
    name: "lidHingeBar",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.016, 0.018), GOLD_LUSTRE, {
      bone: lid,
      at: [s * 0.012, 0.365, -0.13],
      group: "crest",
      name: `lidHingeFlange${s}`,
    });
  }

  // Dorsal crest spines on the lid (local to lid joint at [0, 0.36, -0.08])
  for (let i = 0; i < 3; i++) {
    const cz = -0.08 + (i - 1) * 0.04;
    const cy = 0.42 + (1 - Math.abs(i - 1) * 0.4) * 0.05;
    b.spike([0, cy, cz], [0, 1, -0.2], 0.035, 0.008, {
      bone: lid,
      color: COBALT_DEEP,
      group: "crest",
      name: `crestSpike_${i}`,
    });
  }
  // -----------------------------------------------------------------------------------------------
  // NECK AND HEAD (The Teapot Spout)
  // A long, graceful S-curved teapot spout transitioning into a sculpted dragon snout with horns,
  // glazed eyes, separate openable jaw, and steaming nostrils.

  const spoutCurve = catmull([
    [0, 0.22, 0.16],  // pot junction
    [0, 0.26, 0.23],  // rising forward
    [0, 0.33, 0.28],  // arching neck
    [0, 0.41, 0.34],  // dragon head base
    [0, 0.43, 0.45],  // snout tip / mouth opening
  ]);

  b.sweep(spoutCurve, (t) => [
    0.042 * (1 - 0.45 * t), // width
    0.048 * (1 - 0.4 * t),  // height
  ], {
    bone: [spine, neck1, neck2, head],
    color: spoutPaint,
    group: "neck",
    name: "spoutNeckMesh",
  });

  // Dragon Head / Upper Snout details (on head joint)
  // Brow horns (antler-like dragon porcelain horns curving back)
  for (const s of [1, -1]) {
    const hornBase: V3 = [s * 0.026, 0.44, 0.35];
    const hornCurve = bezier(
      hornBase,
      [s * 0.05, 0.48, 0.33],
      [s * 0.07, 0.52, 0.27],
      [s * 0.08, 0.55, 0.20],
    );
    b.sweep(hornCurve, (t) => 0.011 * (1 - 0.8 * t), {
      bone: head,
      color: GOLD_LUSTRE,
      group: "head",
      name: `horn${s > 0 ? "L" : "R"}`,
      caps: { end: "point" },
    });

    // Eye: glazed ceramic cabochon with cobalt iris and gold glint
    const eyeCenter: V3 = [s * 0.03, 0.425, 0.38];
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GLAZE, {
      bone: head,
      at: eyeCenter,
      scale: [0.7, 1.0, 1.2],
      group: "head",
      name: `eyeBall${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), COBALT_DARK, {
      bone: head,
      at: [s * 0.036, 0.426, 0.385],
      group: "head",
      name: `eyeIris${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.003, 5, 3), GOLD_HIGHLIGHT, {
      bone: head,
      at: [s * 0.038, 0.429, 0.388],
      group: "head",
      name: `eyeGlint${s > 0 ? "L" : "R"}`,
    });

    // Whiskers (porcelain dragon barbel tendrils curling from snout)
    const whiskerCurve = bezier(
      [s * 0.024, 0.41, 0.43],
      [s * 0.06, 0.40, 0.46],
      [s * 0.08, 0.36, 0.48],
      [s * 0.06, 0.33, 0.44],
    );
    b.sweep(whiskerCurve, (t) => 0.0055 * (1 - 0.7 * t), {
      bone: head,
      color: COBALT_DEEP,
      sides: 5,
      group: "head",
      name: `whisker${s > 0 ? "L" : "R"}`,
      caps: { end: "point" },
    });
  }

  // Snout crest / nose ridge
  b.spike([0, 0.435, 0.42], [0, 1, 0.3], 0.025, 0.008, {
    bone: head,
    color: COBALT_DEEP,
    group: "head",
    name: "noseRidgeSpike",
  });

  // Upper teeth / spout rim teeth (dainty white porcelain dragon fangs)
  for (const s of [1, -1]) {
    b.spike([s * 0.016, 0.405, 0.44], [0, -1, 0.1], 0.014, 0.004, {
      bone: head,
      color: CLAW_PORCELAIN,
      group: "head",
      name: `upperFang${s > 0 ? "L" : "R"}`,
    });
  }

  // -----------------------------------------------------------------------------------------------
  // SEPARATE LOWER JAW (Spout underside jaw)
  // Attached to the jaw joint so it can open and animate
  const jawPath = catmull([
    [0, 0.38, 0.36],
    [0, 0.385, 0.41],
    [0, 0.395, 0.45],
  ]);
  b.sweep(jawPath, (t) => [0.024 * (1 - 0.4 * t), 0.014 * (1 - 0.4 * t)], {
    bone: jaw,
    color: teapotPaint,
    group: "jaw",
    name: "lowerJawMesh",
    caps: { start: "round", end: "round" },
  });

  // Lower teeth
  for (const s of [1, -1]) {
    b.spike([s * 0.012, 0.395, 0.435], [0, 1, 0.2], 0.011, 0.0035, {
      bone: jaw,
      color: CLAW_PORCELAIN,
      group: "jaw",
      name: `lowerTooth${s > 0 ? "L" : "R"}`,
    });
  }
  // Delicate glazed pink dragon tongue resting in jaw
  b.part(new THREE.BoxGeometry(0.012, 0.005, 0.028), "#e892a2", {
    bone: jaw,
    at: [0, 0.396, 0.41],
    rotation: [8, 0, 0],
    group: "jaw",
    name: "dragonTongue",
  });

  // Pose jaw slightly open downward in rest pose so the mouth and teeth read clearly
  b.pose(jaw, { axis: [-1, 0, 0], deg: 12 });

  // -----------------------------------------------------------------------------------------------
  // STEAM FROM NOSTRILS
  // Wisp of steam curling gracefully from nostrils, built with cards!
  for (const s of [1, -1]) {
    const nostrilPt: V3 = [s * 0.012, 0.432, 0.45];
    // Steam puffs floating up and twisting outward
    const steamFrame1 = frame(nostrilPt, [s * 0.2, 0.9, 0.3]);
    const steamFrame2 = frame([s * 0.022, 0.48, 0.47], [s * 0.4, 0.8, 0.4]);
    const steamFrame3 = frame([s * 0.038, 0.54, 0.48], [s * 0.5, 0.7, 0.3]);

    b.cards([steamFrame1, steamFrame2, steamFrame3], steamSvg, {
      size: [0.045, 0.09],
      lean: 15,
      bend: s * 20,
      flow: [s * 0.3, 0.9, 0.2],
      group: "head",
      bone: head,
    });
  }

  // -----------------------------------------------------------------------------------------------
  // TAIL (Curled Teapot Handle)
  // Classical looped teapot handle at the rear, sculpted with dragon scales/ridges and terminating
  // in an ornate porcelain tail spade / tassel.

  b.sweep(tailChain, (t) => [
    0.028 * (1 - 0.4 * t),
    0.034 * (1 - 0.3 * t),
  ], {
    color: handlePaint,
    group: "tail",
    name: "handleTailMesh",
  });

  // Tail spade / flame jewel at tip of handle
  const tailTipJoint = tailChain.joints[tailChain.joints.length - 1];
  const tipFrame = tailChain.at(1);
  b.spike(tipFrame.at, [0, 1, 0.3], 0.065, 0.024, {
    bone: tailTipJoint,
    color: GOLD_LUSTRE,
    section: { ngon: 6 },
    group: "tail",
    name: "tailSpade",
  });

  // Golden handle bracket mounts where the handle connects to the teapot body
  b.part(new THREE.TorusGeometry(0.034, 0.009, 8, 16), GOLD_LUSTRE, {
    bone: hips,
    at: [0, 0.20, -0.17],
    rotation: [90, 0, 0],
    group: "tail",
    name: "tailMountLower",
  });
  b.part(new THREE.TorusGeometry(0.032, 0.008, 8, 16), GOLD_LUSTRE, {
    bone: hips,
    at: [0, 0.34, -0.14],
    rotation: [80, 0, 0],
    group: "tail",
    name: "tailMountUpper",
  });

  return b.root;
}
