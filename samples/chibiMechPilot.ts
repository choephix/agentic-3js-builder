import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { svg } from "../src/texture";
import { cel, animeEye, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Chibi Mech Pilot",
  description:
    "Chibi anime mech pilot in oversized power suit: visor-up helmet, twin ponytails, chunky gauntlets and boots, thruster backpack.",
};

export default function build() {
  const b = createBuilder({ name: "chibiMechPilot" });

  // Palette (cel-shaded)
  const SUIT = cel("#f2f5f7");
  const TEAL = cel("#2fd4c4");
  const ORANGE = cel("#ff9a2e");
  const DARK = cel("#3a4a63");
  const SKIN = cel("#ffd9b8");
  const HAIR = cel("#ff7ab0");
  const HAIRD = cel("#e14e8a");
  const BOOT = cel("#2b3550");
  const GLOWC = "#7df9ff";
  const PANEL = inkLines(cel("#f2f5f7"), { levels: [0.05], axis: [0, 0, 1], width: 0.05 });
  const PACK = inkLines(cel("#3a4a63"), { levels: [0.0], axis: [0, 1, 0], width: 0.06 });

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.46, 0], role: "spine" });
  const torso = b.chain(
    "torso",
    [
      [0, 0.46, 0],
      [0, 0.56, 0],
      [0, 0.66, 0.01],
    ],
    {
      parent: hips,
      names: ["spine", "chest"],
      role: "spine",
    },
  );
  const spine = torso.joints[0];
  const chest = torso.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.68, 0.01], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.76, 0.02], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.7, 0.08], aim: [0, 0.55, 1], role: "jaw" });
  const visorHinge = b.joint("visorHinge", { parent: head, at: [0, 0.86, 0.12], dir: [0, 1, 0.4], role: "hinge" });

  // Arms held out from the body
  const armChains = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts: number[][] = [
      [s * 0.15, 0.63, 0.01],
      [s * 0.29, 0.57, 0.03],
      [s * 0.4, 0.53, 0.07],
    ];
    const c = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    armChains.push({ s, side, chain: c });
  }
  // Legs
  const legChains = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts: number[][] = [
      [s * 0.08, 0.46, 0],
      [s * 0.095, 0.28, 0.03],
      [s * 0.095, 0.13, 0.02],
    ];
    const c = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    legChains.push({ s, side, chain: c });
  }

  // ---- Torso / suit body ----
  b.sweep(torso, [0.13, 0.115], { color: SUIT, section: { ngon: 8 } });
  b.part(new THREE.SphereGeometry(0.115, 10, 8), TEAL, {
    bone: spine,
    at: [0, 0.52, 0.03],
    scale: [1, 0.8, 0.8],
  });
  b.part(new THREE.SphereGeometry(0.13, 10, 8), PANEL, {
    bone: chest,
    at: [0, 0.62, 0.03],
    scale: [1.05, 0.85, 0.85],
  });
  const core = b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), GLOWC, {
    bone: chest,
    at: [0, 0.6, 0.135],
    dir: [0, 0, 1],
    axis: "y",
  });
  glow(core, 1.6);
  b.part(new THREE.TorusGeometry(0.038, 0.01, 6, 12), ORANGE, {
    bone: chest,
    at: [0, 0.6, 0.13],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.135, 0.145, 0.06, 10), DARK, {
    bone: hips,
    at: [0, 0.45, 0],
  });
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.02), ORANGE, {
    bone: hips,
    at: [0, 0.45, 0.14],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Backpack thruster
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.1), PACK, {
    bone: chest,
    at: [0, 0.62, -0.14],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.14, 10), DARK, {
      bone: chest,
      at: [s * 0.07, 0.56, -0.19],
    });
    const flame = b.part(new THREE.ConeGeometry(0.032, 0.09, 8), "#bffbff", {
      bone: chest,
      at: [s * 0.07, 0.46, -0.19],
      dir: [0, -1, 0],
    });
    glow(flame, 1.8);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), ORANGE, {
      bone: chest,
      at: [s * 0.07, 0.76, -0.16],
    });
  }

  // ---- Head: face first, helmet open at the front ----
  const FC: [number, number, number] = [0, 0.75, 0.06];
  b.part(new THREE.SphereGeometry(0.115, 14, 12), SKIN, {
    bone: head,
    at: FC,
    scale: [1, 1.02, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), SKIN, {
    bone: jaw,
    at: [0, 0.678, 0.11],
    scale: [1.1, 0.6, 0.9],
  });
  const EYE = animeEye({ iris: "#2fa8ff" });
  const faceSurf = b.surface(head);
  for (const s of [1, -1]) {
    const hit = faceSurf.around(FC).at(s * 30, 6);
    if (hit) b.decal(faceSurf, EYE, { at: hit, size: [0.062, 0.085], mirror: s > 0 });
  }
  // Open-face helmet: back-and-top shell (gap centred on +Z front).
  // SphereGeometry: z = r·sin(phi)·sin(theta), so phi=PI/2 is front.
  const gapHalf = 0.75;
  const phiStart = Math.PI / 2 + gapHalf;
  b.part(new THREE.SphereGeometry(0.155, 16, 10, phiStart, Math.PI * 2 - gapHalf * 2, 0, Math.PI * 0.62), SUIT, {
    bone: head,
    at: [0, 0.79, 0.0],
  });
  // Teal rim band along the shell edge
  b.part(
    new THREE.SphereGeometry(0.16, 16, 4, phiStart, Math.PI * 2 - gapHalf * 2, Math.PI * 0.55, Math.PI * 0.1),
    TEAL,
    { bone: head, at: [0, 0.79, 0.0] },
  );
  // Crest stripe over the top
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.2), ORANGE, {
    bone: head,
    at: [0, 0.945, -0.03],
  });
  // Side pods (ear covers)
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), ORANGE, {
      bone: head,
      at: [s * 0.155, 0.75, 0.02],
      dir: [s, 0, 0],
      axis: "y",
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.036, 8), DARK, {
      bone: head,
      at: [s * 0.155, 0.75, 0.02],
      dir: [s, 0, 0],
      axis: "y",
    });
  }
  // Visor flipped up above the brow
  const visorTex = svg(
    `<svg viewBox="0 0 64 24"><rect x="2" y="4" width="60" height="16" rx="8" fill="#123a55"/><rect x="8" y="7" width="30" height="5" rx="2.5" fill="#bfefff"/></svg>`,
    { size: 256 },
  );
  b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.09, 0.055, "sharp"],
      [-0.09, 0.055, "sharp"],
    ],
    { at: [0, 0.865, 0.13], x: [1, 0, 0], y: [0, 1, 0.35], thickness: 0.012, color: TEAL, bone: visorHinge },
  );
  b.part(new THREE.PlaneGeometry(0.19, 0.07), "#ffffff", {
    bone: visorHinge,
    at: [0, 0.9, 0.145],
    dir: [0, 1, 0.5],
    axis: "z",
    texture: visorTex,
  });

  // Twin ponytails
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const rootF = faceSurf.around(FC).at(s * 105, 25);
    const at = rootF ?? head;
    b.sprout(
      `pigtail${side}`,
      at,
      [
        [s * 0.16, 0.78, -0.01],
        [s * 0.24, 0.68, -0.08],
        [s * 0.27, 0.52, -0.1],
      ],
      [0.045, 0.018],
      { count: 2, names: [`pigtail${side}Base`, `pigtail${side}Tip`], role: "tail", color: HAIR },
    );
    b.part(new THREE.TorusGeometry(0.032, 0.014, 6, 10), ORANGE, {
      bone: head,
      at: [s * 0.16, 0.78, -0.01],
      dir: [s * 0.7, -0.4, -0.3],
    });
    b.spike([s * 0.27, 0.52, -0.1], [s * 0.28, 0.43, -0.1], null, 0.018, { color: HAIRD });
  }
  // Fringe tufts on forehead
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.035, 0.835, 0.135], [i * 0.04, 0.775, 0.165], null, 0.022, { color: HAIR });
  }

  // Shoulder pads with squad emblem
  const emblemTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#123a55"/><path d="M32 8 L38 26 L56 26 L41 36 L46 54 L32 43 L18 54 L23 36 L6 26 L24 26 Z" fill="#ffcf3f"/><circle cx="32" cy="32" r="6" fill="#2fd4c4"/></svg>`,
    { size: 256 },
  );
  for (const { s } of armChains) {
    b.part(new THREE.SphereGeometry(0.085, 10, 8), PANEL, {
      bone: chest,
      at: [s * 0.18, 0.66, 0.01],
      scale: [1, 0.8, 1],
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), ORANGE, {
      bone: chest,
      at: [s * 0.18, 0.72, 0.01],
    });
    // Squad emblem: star badge on the outer pad face
    b.part(new THREE.CircleGeometry(0.038, 12), "#ffffff", {
      bone: chest,
      at: [s * 0.262, 0.66, 0.01],
      dir: [s, 0.1, 0],
      axis: "z",
      texture: emblemTex,
    });
  }

  // Arms: sleeve on the chain joints, chunky gauntlet over the forearm
  for (const { s, chain } of armChains) {
    const elbow = chain.joints[1];
    const wrist = chain.joints[2];
    b.sweep(chain, [0.05, 0.045], { color: SUIT });
    b.capsule([s * 0.29, 0.57, 0.03], [s * 0.4, 0.53, 0.07], 0.068, { bone: elbow, color: TEAL });
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.04, 10), DARK, {
      bone: elbow,
      at: [s * 0.345, 0.55, 0.05],
      dir: [s, -0.15, 0.15],
      axis: "y",
    });
    b.part(new THREE.SphereGeometry(0.055, 8, 6), SUIT, {
      bone: wrist,
      at: [s * 0.43, 0.52, 0.08],
      scale: [1, 1.1, 1],
    });
    for (let f = 0; f < 3; f++) {
      b.part(new THREE.BoxGeometry(0.02, 0.035, 0.02), SUIT, {
        bone: wrist,
        at: [s * 0.43 + (f - 1) * 0.022, 0.475, 0.1],
      });
    }
  }

  // Legs: armored thigh+shin on the chain, chunky boots
  for (const { s, chain } of legChains) {
    const knee = chain.joints[1];
    const ankle = chain.joints[2];
    b.sweep(chain, [0.068, 0.055], { color: SUIT });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), TEAL, {
      bone: knee,
      at: [s * 0.09, 0.3, 0.03],
      scale: [1, 1.2, 1],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.13, 0.18), BOOT, {
      bone: ankle,
      at: [s * 0.095, 0.065, 0.04],
    });
    b.part(new THREE.BoxGeometry(0.115, 0.04, 0.19), DARK, {
      bone: ankle,
      at: [s * 0.095, 0.02, 0.05],
    });
    const jet = b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.03, 8), GLOWC, {
      bone: ankle,
      at: [s * 0.095, 0.05, -0.055],
      dir: [0, 0, -1],
      axis: "y",
    });
    glow(jet, 1.4);
  }

  return b.root;
}
