```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  paint,
  rng,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked log hut with painted shutters, a patterned roof, glowing windows, and two stout chicken legs.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = "#713b27";
  const WOOD_DARK = "#45251d";
  const WOOD_LIGHT = "#a9693d";
  const ROOF = "#382b4d";
  const ROOF_LIGHT = "#65466b";
  const CREAM = "#f4d99b";
  const RED = "#b83e35";
  const BLUE = "#315a73";
  const GOLD = "#e0a83b";
  const BLACK = "#211823";
  const SKIN = "#c98745";
  const CLAW = "#e9c978";
  const GLOW = "#ffd86a";

  const woodPaint = stripes(WOOD_LIGHT, [WOOD, WOOD_DARK], {
    size: 0.19,
    axis: "y",
    width: 0.26,
    wobble: 0.22,
    seed: 11,
  });

  const roofPaint = stripes(ROOF_LIGHT, [ROOF, "#241f38"], {
    size: 0.16,
    axis: "z",
    width: 0.2,
    wobble: 0.15,
    seed: 5,
  });

  const windowTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#17202b"/>
      <rect x="7" y="7" width="114" height="114" rx="5" fill="#f2c75b" stroke="#211823" stroke-width="8"/>
      <path d="M64 8V120M8 64H120" stroke="#b83e35" stroke-width="9"/>
      <path d="M18 18L52 52M110 18L76 52M18 110L52 76M110 110L76 76" stroke="#315a73" stroke-width="6"/>
      <circle cx="64" cy="64" r="12" fill="#f7e9ad" stroke="#211823" stroke-width="5"/>
      <path d="M64 42v44M42 64h44" stroke="#211823" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const doorTexture = svg(
    `<svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="180" fill="#5a3023"/>
      <path d="M10 165Q50 120 90 165M18 12v146M50 12v146M82 12v146" stroke="#a9693d" stroke-width="8"/>
      <path d="M10 30h80M10 70h80M10 110h80" stroke="#3b211b" stroke-width="5"/>
      <circle cx="76" cy="94" r="9" fill="#e0a83b" stroke="#211823" stroke-width="4"/>
      <path d="M50 8v25M36 20h28" stroke="#b83e35" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );

  const folkTrim = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#b83e35"/>
      <path d="M0 32L16 8L32 32L48 8L64 32L80 8L96 32L112 8L128 32L144 8L160 32L176 8L192 32L208 8L224 32L240 8L256 32"
        fill="none" stroke="#f4d99b" stroke-width="8"/>
      <path d="M0 52h256" stroke="#211823" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  // One root skeleton, then two recognizable chicken-leg chains.
  const hips = b.joint("hips", { at: [0, 0.82, 0], dir: [0, 1, 0], role: "spine" });

  const legL = b.chain(
    "legL",
    catmull([
      [0.27, 0.78, 0.02],
      [0.34, 0.52, 0.06],
      [0.20, 0.29, 0.12],
      [0.27, 0.16, 0.22],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.27, 0, 0.22],
    },
  );

  const legR = b.chain(
    "legR",
    catmull([
      [-0.27, 0.78, 0.02],
      [-0.34, 0.54, -0.01],
      [-0.19, 0.30, -0.02],
      [-0.27, 0.16, 0.16],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.27, 0, 0.16],
    },
  );

  const legTubeL = b.sweep(legL, [0.095, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "legL.skin",
  });
  const legTubeR = b.sweep(legR, [0.095, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "legR.skin",
  });

  // Feathered knee bands and ankle cuffs.
  for (const side of [-1, 1]) {
    const tube = side > 0 ? legTubeL : legTubeR;
    const knee = tube.at(0.42);
    const ankle = tube.at(0.78);
    b.ring(knee, { count: 8, radius: 0.102, fromDeg: 0, toDeg: 360 }, (f) =>
      b.spike(f, f, 0.075, 0.018, { color: CREAM, name: "knee.feather" }),
    );
    b.ring(ankle, { count: 7, radius: 0.07 }, (f) =>
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6), RED, {
        frame: f,
        name: "ankle.bead",
      }),
    );
  }

  // Three-toed chicken feet: chunky rods and pointed claws.
  for (const [s, z] of [
    [1, 0.22],
    [-1, 0.16],
  ] as const) {
    const foot = s > 0 ? [0.27, 0.105, z] : [-0.27, 0.105, z];
    const toes = [
      [s * 0.12, 0, 0.15],
      [s * 0.03, 0, 0.20],
      [s * -0.08, 0, 0.17],
    ];
    for (let i = 0; i < toes.length; i++) {
      const tip = [
        foot[0] + toes[i][0],
        0.045,
        foot[2] + toes[i][2],
      ] as [number, number, number];
      b.rod(foot, tip, 0.026, { color: SKIN, caps: "round", name: `toe${s}${i}` });
      b.spike(tip, [0, -0.15, 0.35], 0.085, 0.025, {
        color: CLAW,
        name: `claw${s}${i}`,
      });
    }
  }

  // Body: a heavy, slightly squat log cabin.
  b.part(new THREE.BoxGeometry(0.98, 0.67, 0.78), woodPaint, {
    bone: hips,
    at: [0, 1.12, 0],
    flat: true,
    name: "crooked.log.house",
  });

  // Log ends on the side walls.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y = 0.86 + i * 0.17;
      b.part(new THREE.CylinderGeometry(0.095, 0.095, 1.09, 8), WOOD_DARK, {
        bone: hips,
        at: [side * 0.51, y, 0],
        dir: [1, 0, 0],
        name: `sideLog${side}${i}`,
      });
    }
  }

  // Bold folk-art band under the eaves.
  b.part(new THREE.BoxGeometry(1.08, 0.085, 0.83), RED, {
    bone: hips,
    at: [0, 1.49, 0],
    name: "red.eave.band",
  });
  b.part(new THREE.PlaneGeometry(1.02, 0.22), CREAM, {
    bone: hips,
    at: [0, 1.49, 0.421],
    dir: [0, 0, 1],
    axis: "z",
    texture: folkTrim,
    name: "folk.eave.pattern",
  });

  // Door on the front, slightly off-center like a handmade hut.
  b.part(new THREE.BoxGeometry(0.25, 0.46, 0.045), WOOD_DARK, {
    bone: hips,
    at: [0.23, 0.99, 0.405],
    name: "door.frame",
  });
  b.part(new THREE.PlaneGeometry(0.20, 0.40), "#ffffff", {
    bone: hips,
    at: [0.23, 1.00, 0.435],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "painted.door",
  });

  // Two glowing front windows.
  const windowPositions = [
    [-0.28, 1.22, 0.414],
    [0.0, 1.28, 0.414],
  ] as const;
  for (let i = 0; i < windowPositions.length; i++) {
    const [x, y, z] = windowPositions[i];
    b.part(new THREE.BoxGeometry(0.205, 0.235, 0.055), WOOD_DARK, {
      bone: hips,
      at: [x, y, z - 0.018],
      name: `window.frame${i}`,
    });
    b.part(new THREE.PlaneGeometry(0.17, 0.20), GLOW, {
      bone: hips,
      at: [x, y, z + 0.018],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: `glowing.window${i}`,
    });
  }

  // Tiny side window, giving the silhouette a second readable face.
  b.part(new THREE.BoxGeometry(0.04, 0.22, 0.25), WOOD_DARK, {
    bone: hips,
    at: [-0.515, 1.19, -0.08],
    name: "side.window.frame",
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.20), GLOW, {
    bone: hips,
    at: [-0.542, 1.19, -0.08],
    dir: [-1, 0, 0],
    axis: "z",
    texture: windowTexture,
    name: "side.window",
  });

  // High triangular roof made from two thick, faceted slabs.
  const roofL = b.part(new THREE.BoxGeometry(0.64, 0.10, 0.96), roofPaint, {
    bone: hips,
    at: [-0.29, 1.66, 0],
    rotation: [0, 0, -34],
    name: "roof.left",
  });
  const roofR = b.part(new THREE.BoxGeometry(0.64, 0.10, 0.96), roofPaint, {
    bone: hips,
    at: [0.29, 1.66, 0],
    rotation: [0, 0, 34],
    name: "roof.right",
  });

  // Ridge beam and red folk finial.
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.98, 8), WOOD_DARK, {
    bone: hips,
    at: [0, 1.91, 0],
    dir: [0, 0, 1],
    name: "roof.ridge",
  });
  b.part(new THREE.ConeGeometry(0.09, 0.22, 6), RED, {
    bone: hips,
    at: [0, 2.04, 0],
    name: "ridge.finial",
  });

  // Chimney, smoke cap, and crooked smoke curl.
  b.part(new THREE.BoxGeometry(0.16, 0.24, 0.16), WOOD_DARK, {
    bone: hips,
    at: [0.26, 1.93, -0.12],
    rotation: [0, 0, -8],
    name: "chimney",
  });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.045, 8), RED, {
    bone: hips,
    at: [0.26, 2.07, -0.12],
    name: "chimney.cap",
  });
  const smoke = catmull([
    [0.26, 2.10, -0.12],
    [0.29, 2.25, -0.12],
    [0.18, 2.36, -0.10],
    [0.29, 2.48, -0.08],
    [0.20, 2.57, -0.08],
  ]);
  b.sweep(smoke, [0.055, 0.018], {
    color: "#b9a5b4",
    section: { ngon: 6 },
    caps: "round",
    name: "purple.smoke",
  });

  // Decorative carved corner posts and a horseshoe above the door.
  for (const x of [-0.48, 0.48]) {
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.82, 6), WOOD_LIGHT, {
      bone: hips,
      at: [x, 1.12, 0.42],
      name: "carved.corner",
    });
    for (let j = 0; j < 4; j++) {
      b.part(new THREE.SphereGeometry(0.035, 6, 4), GOLD, {
        bone: hips,
        at: [x, 0.83 + j * 0.19, 0.47],
        name: "corner.gilt.nail",
      });
    }
  }

  const horseshoe = b.sweep(
    [
      [0.12, 1.40, 0.47],
      [0.12, 1.49, 0.47],
      [0.05, 1.56, 0.47],
      [-0.04, 1.56, 0.47],
      [-0.11, 1.49, 0.47],
      [-0.11, 1.40, 0.47],
    ],
    0.018,
    { color: GOLD, caps: "round", name: "golden.horseshoe" },
  );

  // Hanging garlic/herb charms beneath one eave.
  for (let i = 0; i < 5; i++) {
    const x = -0.38 + i * 0.19;
    b.rod([x, 1.51, 0.45], [x, 1.38, 0.45], 0.009, {
      color: WOOD_DARK,
      name: "hanging.string",
    });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), CREAM, {
      bone: hips,
      at: [x, 1.34, 0.45],
      name: "garlic.bulb",
    });
    b.spike([x, 1.35, 0.45], [0, 0.12, 0], 0.08, 0.018, {
      color: "#78934a",
      name: "garlic.stem",
    });
  }

  // A few broad carved sun motifs on the side walls.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.28 + i * 0.28;
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.018, 12), GOLD, {
        bone: hips,
        at: [side * 0.535, 1.22, z],
        dir: [side, 0, 0],
        name: "side.sun.carving",
      });
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 6), RED, {
        bone: hips,
        at: [side * 0.55, 1.22, z],
        dir: [side, 0, 0],
        name: "sun.center",
      });
    }
  }

  // Small floating storybook-style placard under the hut, kept attached to the diorama.
  b.part(new THREE.BoxGeometry(0.34, 0.07, 0.025), WOOD_DARK, {
    bone: hips,
    at: [0, 0.72, 0.38],
    rotation: [0, 0, -4],
    name: "name.plate",
  });
  b.part(new THREE.PlaneGeometry(0.27, 0.045), CREAM, {
    bone: hips,
    at: [0, 0.725, 0.398],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(
      `<svg viewBox="0 0 270 45" xmlns="http://www.w3.org/2000/svg">
        <rect width="270" height="45" fill="#f4d99b"/>
        <text x="135" y="31" text-anchor="middle" font-family="serif" font-size="23" font-weight="bold" fill="#382b4d">БАБА ЯГА</text>
      </svg>`,
      { size: 256 },
    ),
    name: "name.plate.lettering",
  });

  // Keep the lowest claw tips at the floor; the leg construction intentionally sinks only a few millimeters.
  return b.root;
}
```