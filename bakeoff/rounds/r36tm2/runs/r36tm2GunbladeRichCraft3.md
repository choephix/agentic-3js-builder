```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { cel, inkLines, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized faceted sword fused with a revolver mechanism, ornate crossguard, glowing rune, barrel, trigger and brass hardware.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.72, tarnish: 0.12, size: 0.11, seed: 7 });
  const DARK_STEEL = metal("iron", { polish: 0.38, tarnish: 0.3, size: 0.08, seed: 9 });
  const BLUED = metal("blued", { polish: 0.62, tarnish: 0.16, size: 0.09, seed: 11 });
  const BRASS = metal("brass", { polish: 0.8, tarnish: 0.18, size: 0.075, seed: 13 });
  const OLD_BRASS = metal("bronze", { polish: 0.36, tarnish: 0.55, verdigris: 0.18, size: 0.1, seed: 17 });

  const STEEL_CEL = cel("#aebfd4", "#35465d", { threshold: 0.08 });
  const BLUE_CEL = cel("#416eaa", "#18284c", { threshold: 0.04 });
  const GRIP = cel("#392b3a", "#120f1b", { threshold: 0.12 });
  const RUBBER = "#17131d";
  const RED = "#c6373f";
  const PALE = "#e9f2ff";
  const GOLD = "#e7b75c";

  // Skeleton first: a root weapon body and a revolver cylinder hinge.
  const core = b.joint("weaponCore", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    group: "gunblade",
  });

  const cylinderBone = b.joint("cylinder", {
    parent: core,
    at: [0, 0.91, 0.16],
    dir: [0, 0, 1],
    role: "hinge",
    group: "revolver",
  });

  const bladeOutline: [number, number, "sharp"][] = [
    [-0.14, 0],
    [0.14, 0],
    [0.205, 0.12],
    [0.175, 0.56],
    [0.135, 1.18],
    [0.082, 1.55],
    [0, 1.78, "sharp"],
    [-0.082, 1.55],
    [-0.135, 1.18],
    [-0.175, 0.56],
    [-0.205, 0.12],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.77, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.075, 0.045],
    bevel: 0.018,
    smoothing: 0,
    color: STEEL_CEL,
    bone: core,
    group: "blade",
    name: "heroBlade",
  });

  // A dark central fuller makes the broad silhouette read as a weapon rather than a plank.
  const fuller = b.extrude(
    [
      [-0.035, 0.06],
      [0.035, 0.06],
      [0.072, 0.45],
      [0.052, 1.18],
      [0, 1.57, "sharp"],
      [-0.052, 1.18],
      [-0.072, 0.45],
    ],
    {
      at: [0, 0.805, 0.041],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.004,
      color: BLUE_CEL,
      bone: core,
      group: "blade",
      name: "bladeFuller",
    },
  );

  // Bright, separate edge rails accentuate the anime weapon profile.
  b.rod(
    [-0.148, 0.9, 0.058],
    [-0.075, 2.27, 0.058],
    0.012,
    {
      color: PALE,
      bone: core,
      section: { ngon: 5 },
      caps: "round",
      name: "edgeRailL",
      group: "blade",
    },
  );
  b.rod(
    [0.148, 0.9, 0.058],
    [0.075, 2.27, 0.058],
    0.012,
    {
      color: PALE,
      bone: core,
      section: { ngon: 5 },
      caps: "round",
      name: "edgeRailR",
      group: "blade",
    },
  );

  // Blade tip jewel and shoulder studs.
  b.part(new THREE.OctahedronGeometry(0.045, 0), RED, {
    at: [0, 2.53, 0.025],
    bone: core,
    name: "bladeTipJewel",
    group: "blade",
  });
  for (const x of [-0.145, 0.145]) {
    b.part(new THREE.SphereGeometry(0.027, 8, 5), GOLD, {
      at: [x, 0.9, 0.07],
      bone: core,
      name: x < 0 ? "shoulderStudL" : "shoulderStudR",
      group: "blade",
    });
  }

  // Crossguard: a broad, angular gunmetal wing with brass end caps.
  const guard = b.extrude(
    [
      [-0.52, 0.08],
      [-0.42, 0.16],
      [-0.23, 0.135],
      [-0.15, 0.065],
      [0.15, 0.065],
      [0.23, 0.135],
      [0.42, 0.16],
      [0.52, 0.08],
      [0.42, -0.025],
      [0.21, -0.06],
      [0, -0.025],
      [-0.21, -0.06],
      [-0.42, -0.025],
    ],
    {
      at: [0, 0.79, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.105,
      bevel: 0.022,
      color: panelled(BLUED, { size: 0.14, rivets: 0.045 }),
      bone: core,
      group: "guard",
      name: "wingedGuard",
    },
  );

  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.08, 0.12, 8), BRASS, {
      at: [s * 0.46, 0.79, 0],
      dir: [0, 0, 1],
      bone: core,
      name: s < 0 ? "guardCapL" : "guardCapR",
      group: "guard",
    });
    b.part(new THREE.SphereGeometry(0.034, 8, 5), PALE, {
      at: [s * 0.46, 0.79, 0.067],
      bone: core,
      name: s < 0 ? "guardGemL" : "guardGemR",
      group: "guard",
    });
  }

  // Revolver assembly: the iconic circular chamber sits above the grip and in front of the blade.
  const cylinder = b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.12, 12), OLD_BRASS, {
    at: [0, 0.94, 0.145],
    dir: [0, 0, 1],
    bone: cylinderBone,
    flat: true,
    name: "revolverCylinder",
    group: "revolver",
  });

  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.135, 12), DARK_STEEL, {
    at: [0, 0.94, 0.218],
    dir: [0, 0, 1],
    bone: cylinderBone,
    name: "cylinderFace",
    group: "revolver",
  });

  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.15, 10), BRASS, {
    at: [0, 0.94, 0.235],
    dir: [0, 0, 1],
    bone: cylinderBone,
    name: "cylinderHub",
    group: "revolver",
  });

  const chamberRadius = 0.092;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = Math.cos(a) * chamberRadius;
    const y = 0.94 + Math.sin(a) * chamberRadius;
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.145, 8), RUBBER, {
      at: [x, y, 0.235],
      dir: [0, 0, 1],
      bone: cylinderBone,
      name: `chamber${i + 1}`,
      group: "revolver",
    });
    b.part(new THREE.TorusGeometry(0.027, 0.006, 5, 8), GOLD, {
      at: [x, y, 0.311],
      dir: [0, 0, 1],
      bone: cylinderBone,
      name: `chamberRing${i + 1}`,
      group: "revolver",
    });
  }

  // Upper receiver and long barrel, blended into the blade spine.
  b.part(new THREE.BoxGeometry(0.19, 0.2, 0.17), DARK_STEEL, {
    at: [0, 1.12, 0.055],
    bone: core,
    name: "upperReceiver",
    group: "barrel",
  });
  b.frustumBox(
    [0.075, 1.16, 0.08],
    [0.075, 1.92, 0.08],
    [0.07, 0.07],
    [0.045, 0.045],
    {
      color: BLUED,
      bone: core,
      name: "barrelHousing",
      group: "barrel",
    },
  );
  b.rod(
    [0.075, 1.22, 0.135],
    [0.075, 2.08, 0.135],
    0.022,
    {
      color: DARK_STEEL,
      bone: core,
      section: { ngon: 6 },
      caps: "flat",
      name: "gunBarrel",
      group: "barrel",
    },
  );
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.07, 8), BRASS, {
    at: [0.075, 2.1, 0.135],
    dir: [0, 1, 0],
    bone: core,
    name: "muzzleCollar",
    group: "barrel",
  });
  b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.045, 8), DARK_STEEL, {
    at: [0.075, 2.15, 0.135],
    dir: [0, 1, 0],
    bone: core,
    name: "muzzle",
    group: "barrel",
  });

  // Trigger frame and trigger.
  b.part(new THREE.TorusGeometry(0.105, 0.018, 6, 12), BRASS, {
    at: [0, 0.67, 0.09],
    dir: [0, 0, 1],
    bone: core,
    name: "triggerGuard",
    group: "trigger",
  });
  b.part(new THREE.BoxGeometry(0.028, 0.095, 0.035), RED, {
    at: [0.04, 0.685, 0.13],
    rotation: [0, 0, -18],
    bone: core,
    name: "trigger",
    group: "trigger",
  });
  b.part(new THREE.SphereGeometry(0.025, 8, 5), GOLD, {
    at: [-0.082, 0.68, 0.11],
    bone: core,
    name: "triggerPin",
    group: "trigger",
  });

  // Heavy grip, wrapped with raised brass bands.
  b.part(new THREE.BoxGeometry(0.18, 0.45, 0.17), GRIP, {
    at: [0, 0.43, 0.04],
    rotation: [0, 0, -6],
    bone: core,
    name: "gripCore",
    group: "grip",
  });
  for (let i = 0; i < 6; i++) {
    const y = 0.245 + i * 0.071;
    b.part(new THREE.TorusGeometry(0.112, 0.009, 5, 12), i % 2 ? BRASS : OLD_BRASS, {
      at: [0, y, 0.04],
      dir: [0, 1, 0],
      rotation: [0, 0, -6],
      bone: core,
      name: `gripWrap${i + 1}`,
      group: "grip",
    });
  }
  b.part(new THREE.BoxGeometry(0.22, 0.075, 0.2), DARK_STEEL, {
    at: [0, 0.18, 0.02],
    rotation: [0, 0, -6],
    bone: core,
    name: "pommelBlock",
    group: "grip",
  });
  b.part(new THREE.OctahedronGeometry(0.075, 0), RED, {
    at: [0, 0.115, 0.035],
    bone: core,
    name: "pommelGem",
    group: "grip",
  });

  // Mechanical side plates and repeating rivets.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.21, 0.24, 0.018), BRASS, {
      at: [s * 0.108, 0.92, 0.045],
      rotation: [0, 0, s * 8],
      bone: core,
      name: s < 0 ? "sidePlateL" : "sidePlateR",
      group: "mechanism",
    });
    for (const y of [0.84, 0.99]) {
      b.part(new THREE.SphereGeometry(0.018, 7, 5), PALE, {
        at: [s * 0.122, y, 0.07],
        bone: core,
        name: `sideRivet${s < 0 ? "L" : "R"}${y}`,
        group: "mechanism",
      });
    }
  }

  // Front-facing rune: a painted SVG gives the blade its Final Fantasy identity.
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 180">
      <path d="M32 8 L39 47 L57 61 L39 72 L32 171 L25 72 L7 61 L25 47 Z"
        fill="#f7fbff" stroke="#63baff" stroke-width="4" stroke-linejoin="round"/>
      <path d="M16 103 L32 88 L48 103 M20 126 L32 115 L44 126"
        fill="none" stroke="#9ce7ff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );
  const runePart = b.decal(blade, rune, {
    at: [0, 1.47, 0.056],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.11, 0.34],
    lift: 0.003,
    segments: 8,
    name: "bladeRune",
    group: "rune",
  });
  glow(runePart, 1.8);

  // Small red insignia on the revolver face.
  const insignia = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="#211526" stroke="#f0c866" stroke-width="5"/>
      <path d="M50 12 L59 40 L88 50 L59 60 L50 88 L41 60 L12 50 L41 40 Z"
        fill="#db4050" stroke="#fff0b2" stroke-width="4"/>
      <circle cx="50" cy="50" r="9" fill="#fff3bd"/>
    </svg>`,
    { size: 192 },
  );
  const insigniaPart = b.decal(cylinder, insignia, {
    at: [0, 0.94, 0.31],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.115, 0.115],
    lift: 0.003,
    segments: 8,
    name: "revolverInsignia",
    group: "rune",
  });
  glow(insigniaPart, 0.7);

  // Thin engraved-looking bands at the blade base and tip.
  for (const y of [0.91, 2.23]) {
    b.rod(
      [-0.075, y, 0.07],
      [0.075, y, 0.07],
      0.009,
      {
        color: GOLD,
        bone: core,
        section: { ngon: 6 },
        caps: "round",
        name: `bladeBand${y}`,
        group: "ornament",
      },
    );
  }

  // A few crisp brass bolts complete the silhouette without cluttering it.
  const bolts: [number, number, number][] = [
    [-0.19, 0.82, 0.065],
    [0.19, 0.82, 0.065],
    [-0.11, 1.1, 0.075],
    [0.11, 1.1, 0.075],
    [0, 0.23, 0.13],
  ];
  for (let i = 0; i < bolts.length; i++) {
    b.part(new THREE.SphereGeometry(0.022, 8, 5), BRASS, {
      at: bolts[i],
      bone: core,
      name: `bolt${i + 1}`,
      group: "ornament",
    });
  }

  return b.root;
}
```