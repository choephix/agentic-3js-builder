```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { metal, gearGeometry, gearTexture, TINT } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: a broad engraved sword fused with a polished firearm receiver, ornate guard, trigger, riveted grip, muzzle, gears, and a glowing crystal pommel.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.72, tarnish: 0.08, size: 0.16, seed: 11 });
  const DARK_STEEL = metal("iron", { polish: 0.34, tarnish: 0.12, size: 0.12, seed: 19 });
  const BLUED = metal("blued", { polish: 0.58, tarnish: 0.12, size: 0.11, seed: 23 });
  const BRASS = metal("brass", { polish: 0.65, tarnish: 0.12, verdigris: 0.05, size: 0.09, seed: 31 });
  const GILT = metal("gilt", { polish: 0.86, tarnish: 0.04, size: 0.08, seed: 37 });
  const COPPER = metal("copper", { polish: 0.56, tarnish: 0.12, size: 0.08, seed: 43 });

  const INK = "#171524";
  const PLUM = "#352449";
  const LEATHER = "#311b25";
  const LEATHER_HI = "#6d3540";
  const RED = "#c53a45";
  const CRYSTAL = "#61e9ff";
  const CRYSTAL_DEEP = "#168ab2";
  const WHITE = "#e9f7ff";

  const mid = (a: THREE.Vector3, c: THREE.Vector3) => a.clone().add(c).multiplyScalar(0.5);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  function part(
    geo: THREE.BufferGeometry,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    opts: Record<string, any> = {},
  ) {
    return b.part(geo, color, { at, ...opts });
  }

  function cylinder(
    radius: number,
    length: number,
    color: any,
    a: THREE.Vector3,
    c: THREE.Vector3,
    radial = 10,
    opts: Record<string, any> = {},
  ) {
    return part(
      new THREE.CylinderGeometry(radius, radius, length, radial, 1, false),
      color,
      mid(a, c),
      { dir: c.clone().sub(a), ...opts },
    );
  }

  function cone(
    r0: number,
    r1: number,
    length: number,
    color: any,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    opts: Record<string, any> = {},
  ) {
    return part(new THREE.CylinderGeometry(r1, r0, length, 8), color, at, {
      dir,
      ...opts,
    });
  }

  function bolt(at: THREE.Vector3, radius = 0.018, color: any = BRASS, dir: THREE.Vector3 = v(0, 1, 0)) {
    return part(new THREE.SphereGeometry(radius, 8, 5), color, at, { dir });
  }

  function box(
    size: [number, number, number],
    color: any,
    at: THREE.Vector3,
    opts: Record<string, any> = {},
  ) {
    return part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, opts);
  }

  // ---------------------------------------------------------------------------
  // The blade: a huge angular Final Fantasy sword silhouette, facing +Z.

  const bladeOutline: [number, number, "sharp"?][] = [
    [0.00, -0.135, "sharp"],
    [0.12, -0.155, "sharp"],
    [0.26, -0.105, "sharp"],
    [1.14, -0.080, "sharp"],
    [1.42, 0.000, "sharp"],
    [1.18, 0.090, "sharp"],
    [0.31, 0.115, "sharp"],
    [0.13, 0.172, "sharp"],
    [0.00, 0.145, "sharp"],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.93, 0.13],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.072,
    bevel: 0.012,
    color: STEEL,
    name: "heroBlade",
    group: "blade",
  });

  // A dark inset running down the blade gives it a strong graphic fuller.
  const fuller = b.extrude(
    [
      [0.13, -0.036, "sharp"],
      [1.19, -0.027, "sharp"],
      [1.33, 0, "sharp"],
      [1.19, 0.027, "sharp"],
      [0.13, 0.036, "sharp"],
    ],
    {
      at: [0, 0.975, 0.13],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: BLUED,
      name: "bladeFuller",
      group: "blade",
    },
  );

  // Bright central ridge and lower cutting-edge rail.
  cylinder(0.010, 1.17, GILT, v(0, 1.005, 0.25), v(0, 1.005, 1.42), 6, {
    name: "bladeRidge",
    group: "blade",
  });
  cylinder(0.011, 1.08, WHITE, v(0, 0.885, 0.29), v(0, 0.885, 1.37), 6, {
    name: "bladeEdge",
    group: "blade",
  });

  // Decorative ruby-like studs along the fuller.
  for (let i = 0; i < 5; i++) {
    const z = 0.38 + i * 0.19;
    part(new THREE.SphereGeometry(0.018, 8, 5), RED, v(0, 1.005, z), {
      name: `bladeJewel${i}`,
      group: "blade",
    });
  }

  // Engraved blue-white rune strip on the front face.
  const runeTexture = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="none"/>
      <path d="M10 48 L26 16 L42 48 M18 34 H35 M56 14 V50 L78 14 V50
               M96 14 L112 32 L96 50 M112 14 L96 32 L112 50
               M130 14 H162 M146 14 V50 M130 50 H162
               M181 14 L181 50 L210 14 L210 50
               M228 14 L244 32 L228 50" fill="none"
            stroke="#9cefff" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M10 48 L26 16 L42 48 M181 14 L181 50 L210 14 L210 50"
            fill="none" stroke="#ffffff" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  part(new THREE.PlaneGeometry(0.062, 0.72), WHITE, v(0, 1.012, 0.78), {
    dir: [0, 1, 0],
    axis: "z",
    texture: runeTexture,
    name: "bladeRunes",
    group: "blade",
  });

  // Angular golden guard at the base of the blade.
  box([0.46, 0.075, 0.12], DARK_STEEL, v(0, 0.79, 0.15), {
    name: "guardCore",
    group: "guard",
  });
  cylinder(0.035, 0.52, BRASS, v(-0.26, 0.80, 0.16), v(0.26, 0.80, 0.16), 8, {
    name: "guardGoldRail",
    group: "guard",
  });
  for (const s of [-1, 1]) {
    const a = v(s * 0.12, 0.80, 0.15);
    const c = v(s * 0.34, 0.91, 0.10);
    cylinder(0.027, a.distanceTo(c), GILT, a, c, 8, {
      name: s > 0 ? "guardLeftArm" : "guardRightArm",
      group: "guard",
    });
    bolt(c, 0.025, COPPER);
  }

  // ---------------------------------------------------------------------------
  // Firearm receiver fused to the sword spine.

  box([0.27, 0.19, 0.42], DARK_STEEL, v(0, 1.055, 0.28), {
    name: "receiver",
    group: "firearm",
  });
  box([0.31, 0.045, 0.30], BLUED, v(0, 1.16, 0.30), {
    name: "receiverTopPlate",
    group: "firearm",
  });
  box([0.31, 0.038, 0.26], STEEL, v(0, 0.955, 0.31), {
    name: "receiverLowerPlate",
    group: "firearm",
  });

  // Long barrel, parallel to the blade but offset to the model's left.
  cylinder(0.046, 1.13, DARK_STEEL, v(0.125, 1.11, 0.25), v(0.125, 1.11, 1.38), 10, {
    name: "barrel",
    group: "firearm",
  });
  cylinder(0.061, 0.075, BRASS, v(0.125, 1.11, 1.38), v(0.125, 1.11, 1.455), 10, {
    name: "muzzleCollar",
    group: "firearm",
  });
  cylinder(0.049, 0.09, BLUED, v(0.125, 1.11, 1.445), v(0.125, 1.11, 1.535), 10, {
    name: "muzzle",
    group: "firearm",
  });
  cylinder(0.027, 0.006, INK, v(0.125, 1.11, 1.54), v(0.125, 1.11, 1.546), 10, {
    name: "muzzleBore",
    group: "firearm",
  });

  // Barrel bands and a raised sight.
  for (const z of [0.43, 0.76, 1.08]) {
    cylinder(0.058, 0.028, GILT, v(0.125, 1.11, z), v(0.125, 1.11, z + 0.028), 10, {
      name: `barrelBand${z}`,
      group: "firearm",
    });
  }
  box([0.045, 0.06, 0.16], BRASS, v(0.125, 1.17, 0.93), {
    name: "frontSight",
    group: "firearm",
  });
  cone(0.025, 0.005, 0.09, GILT, v(0.125, 1.23, 1.01), v(0, 1, 0), {
    name: "frontSightTip",
    group: "firearm",
  });

  // Side plate with a fantasy crest.
  box([0.018, 0.13, 0.24], BRASS, v(0.145, 1.055, 0.29), {
    name: "sidePlate",
    group: "firearm",
  });
  const crestTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8 L77 45 L112 53 L84 74 L91 112 L64 91 L37 112 L44 74 L16 53 L51 45Z"
        fill="#401b3f" stroke="#ffe89a" stroke-width="7" stroke-linejoin="round"/>
      <path d="M64 27 L69 51 L91 56 L73 69 L77 91 L64 78 L51 91 L55 69 L37 56 L59 51Z"
        fill="#66e8ff" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );
  part(new THREE.PlaneGeometry(0.19, 0.19), WHITE, v(0.158, 1.055, 0.29), {
    dir: [1, 0, 0],
    axis: "z",
    texture: crestTexture,
    name: "sideCrest",
    group: "firearm",
  });
  for (const s of [-1, 1]) {
    bolt(v(s * 0.145, 1.055, 0.19), 0.018, GILT);
    bolt(v(s * 0.145, 1.055, 0.39), 0.018, GILT);
  }

  // ---------------------------------------------------------------------------
  // Pistol grip and trigger assembly.

  // Angled grip, with a dark core and bright spine.
  const gripTop = v(0, 0.86, 0.08);
  const gripBottom = v(0, 0.19, -0.035);
  cylinder(0.105, gripTop.distanceTo(gripBottom), LEATHER, gripBottom, gripTop, 8, {
    name: "grip",
    group: "handle",
  });
  cylinder(0.025, gripTop.distanceTo(gripBottom) + 0.012, COPPER, v(0.072, 0.19, -0.03), v(0.072, 0.86, 0.08), 6, {
    name: "gripSpine",
    group: "handle",
  });

  // Grip wrap as repeated metal/leather bands.
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const p = gripBottom.clone().lerp(gripTop, t);
    cylinder(0.112, 0.024, i % 2 ? LEATHER_HI : BRASS, p, p.clone().add(v(0, 0.024, 0)), 8, {
      name: `gripWrap${i}`,
      group: "handle",
    });
  }

  // Trigger guard, a squared loop beneath the receiver.
  const guardA = v(-0.13, 0.90, 0.14);
  const guardB = v(-0.13, 0.62, 0.13);
  const guardC = v(0.12, 0.58, 0.13);
  const guardD = v(0.13, 0.83, 0.14);
  cylinder(0.025, guardA.distanceTo(guardB), BRASS, guardA, guardB, 8, {
    name: "triggerGuardFront",
    group: "trigger",
  });
  cylinder(0.025, guardB.distanceTo(guardC), BRASS, guardB, guardC, 8, {
    name: "triggerGuardBottom",
    group: "trigger",
  });
  cylinder(0.025, guardC.distanceTo(guardD), BRASS, guardC, guardD, 8, {
    name: "triggerGuardRear",
    group: "trigger",
  });
  cylinder(0.018, 0.17, DARK_STEEL, v(-0.035, 0.69, 0.13), v(-0.035, 0.69, 0.30), 8, {
    name: "trigger",
    group: "trigger",
  });

  // A forward swept hammer / locking lever.
  cylinder(0.035, 0.25, BLUED, v(-0.13, 1.13, 0.10), v(-0.13, 1.28, 0.16), 8, {
    name: "hammer",
    group: "firearm",
  });
  cone(0.048, 0.028, 0.075, GILT, v(-0.13, 1.30, 0.17), v(0, 0.75, 0.66), {
    name: "hammerCap",
    group: "firearm",
  });

  // ---------------------------------------------------------------------------
  // Gearwork visible at the hilt, plus axle and decorative side rivets.

  const gearShape = { teeth: 16, module: 0.008, spokes: 5, bore: 0.012, thickness: 0.018 };
  const gearTex = gearTexture(gearShape, { size: 128 });
  for (const s of [-1, 1]) {
    const gearAt = v(s * 0.17, 0.91, 0.20);
    const gear = part(gearGeometry(gearShape), TINT.brass, gearAt, {
      dir: [s, 0, 0],
      texture: gearTex,
      name: s > 0 ? "gearLeft" : "gearRight",
      group: "mechanism",
    });
    // A contrasting center cap makes the gear readable from a distance.
    part(new THREE.CylinderGeometry(0.032, 0.032, 0.025, 10), GILT, gearAt, {
      dir: [s, 0, 0],
      name: s > 0 ? "gearHubLeft" : "gearHubRight",
      group: "mechanism",
    });
  }
  cylinder(0.012, 0.42, STEEL, v(-0.21, 0.91, 0.20), v(0.21, 0.91, 0.20), 8, {
    name: "gearAxle",
    group: "mechanism",
  });

  // Small ruby indicator and three brass status studs.
  part(new THREE.SphereGeometry(0.032, 8, 5), RED, v(-0.145, 1.16, 0.29), {
    name: "statusLamp",
    group: "mechanism",
  });
  for (let i = 0; i < 3; i++) {
    bolt(v(0.15, 1.13, 0.20 + i * 0.09), 0.014, GILT);
  }

  // ---------------------------------------------------------------------------
  // Pommel: a dark counterweight with a floating cyan crystal.

  box([0.25, 0.12, 0.18], DARK_STEEL, v(0, 0.12, -0.09), {
    name: "pommelBlock",
    group: "pommel",
  });
  cylinder(0.105, 0.12, BRASS, v(0, 0.04, -0.09), v(0, 0.16, -0.09), 10, {
    name: "pommelRing",
    group: "pommel",
  });

  const crystal = part(
    new THREE.OctahedronGeometry(0.085, 0),
    CRYSTAL,
    v(0, 0.025, -0.13),
    { name: "glowingCrystal", group: "pommel" },
  );
  glow(crystal, 2.2);
  part(new THREE.CylinderGeometry(0.044, 0.052, 0.045, 8), CRYSTAL_DEEP, v(0, 0.09, -0.13), {
    name: "crystalSocket",
    group: "pommel",
  });

  // Crown-like pommel fins, kept above the ground.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.11, 0.035, "sharp"],
        [0.16, 0.105, "sharp"],
        [0.05, 0.085, "sharp"],
      ],
      {
        at: [s * 0.025, 0.08, -0.13],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.025,
        bevel: 0.004,
        color: GILT,
        name: s > 0 ? "pommelFinLeft" : "pommelFinRight",
        group: "pommel",
      },
    );
  }

  // Final ruby on the guard and tiny blade-base fasteners.
  part(new THREE.SphereGeometry(0.035, 8, 5), RED, v(0, 0.84, 0.16), {
    name: "guardRuby",
    group: "guard",
  });
  for (const x of [-0.105, 0.105]) {
    bolt(v(x, 0.925, 0.16), 0.016, GILT);
  }

  return b.root;
}
```