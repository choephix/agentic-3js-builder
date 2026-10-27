```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "five-headed hydra",
  description: "A brutal five-headed hydra built as a low-poly God of War monster, with armored scales, open jaws, horns, glowing eyes, claws, and a heavy serpentine body.",
};

const CHARCOAL = "#171417";
const SCALE = "#4b2520";
const SCALE_LIT = "#713228";
const SCALE_DARK = "#2a1718";
const BELLY = "#8b5637";
const BELLY_DARK = "#4d2c27";
const BONE = "#d0a16c";
const BONE_DARK = "#68452e";
const HORN = "#302521";
const HORN_TIP = "#b28a62";
const MOUTH = "#120b12";
const TONGUE = "#982d39";
const EYE = "#ffb52b";
const EYE_HOT = "#fff0a0";
const PUPIL = "#24100e";
const CLAW = "#c7a377";
const BRONZE = "#8a572e";
const BRONZE_DARK = "#3a241d";
const SCAR = "#a33d32";

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const core = b.joint("hips", {
    at: [0, 0.48, -0.08],
    dir: [0, 0.1, 1],
    role: "spine",
  });

  // ---------------------------------------------------------------------------
  // Central skeleton: a thick, low, coiled serpent body with a heavy tail.
  // ---------------------------------------------------------------------------

  const torsoPath = catmull([
    [0, 0.52, -0.58],
    [0.02, 0.47, -0.25],
    [0, 0.5, 0.08],
    [-0.02, 0.62, 0.38],
    [0, 0.72, 0.62],
  ]);

  const torso = b.chain("torso", torsoPath, {
    parent: core,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
  });

  const body = b.sweep(torso, (t) => 0.34 - t * 0.04, {
    bone: torso,
    color: SCALE_LIT,
    section: { ngon: 8 },
    caps: "round",
    sectors: [
      [120, 240, BELLY],
      [-55, 55, SCALE],
    ],
  });

  const tailPath = catmull([
    [0, 0.52, -0.55],
    [0, 0.42, -0.92],
    [0.08, 0.34, -1.28],
    [0.25, 0.27, -1.62],
    [0.42, 0.2, -1.9],
    [0.52, 0.16, -2.12],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: core,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const tailTube = b.sweep(tail, (t) => 0.25 * (1 - t) + 0.025, {
    bone: tail,
    color: SCALE_DARK,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    bands: [
      [0.72, SCALE],
      [0.9, BONE_DARK],
      [1, HORN],
    ],
  });

  // Dorsal spikes give the silhouette a clear God of War monster profile.
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.095;
    const p = body.at(t, 0);
    const spikeLength = 0.16 + 0.08 * Math.sin(i * 0.8);
    b.spike(p, p, spikeLength, 0.055, {
      color: i % 2 === 0 ? BONE : BONE_DARK,
      bone: p.bone,
      name: `backSpine${i}`,
    });
  }

  for (let i = 0; i < 7; i++) {
    const t = 0.15 + i * 0.11;
    const p = tailTube.at(t, 0);
    b.spike(p, p, 0.13 * (1 - t * 0.45), 0.04, {
      color: HORN,
      bone: p.bone,
      name: `tailSpine${i}`,
    });
  }

  // Broad overlapping belly plates.
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.105;
    const p = body.at(t, 180);
    b.stick(
      new THREE.ConeGeometry(0.13 - i * 0.006, 0.045, 6),
      i % 2 ? BELLY_DARK : BELLY,
      p,
      { embed: 0.45, spin: 30, name: `bellyPlate${i}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Four short, brutal legs. They are secondary to the five necks but make the
  // creature feel like a grounded war-beast rather than a floating serpent.
  // ---------------------------------------------------------------------------

  const footData = [
    { side: 1, z: 0.3, name: "frontL", target: [0.5, 0.13, 0.38] as [number, number, number] },
    { side: -1, z: 0.3, name: "frontR", target: [-0.5, 0.13, 0.38] as [number, number, number] },
    { side: 1, z: -0.28, name: "rearL", target: [0.53, 0.13, -0.35] as [number, number, number] },
    { side: -1, z: -0.28, name: "rearR", target: [-0.53, 0.13, -0.35] as [number, number, number] },
  ];

  for (const legInfo of footData) {
    const s = legInfo.side;
    const root = [s * 0.24, 0.53, legInfo.z] as [number, number, number];
    const knee = [s * 0.39, 0.34, legInfo.z + (legInfo.z > 0 ? 0.08 : -0.08)] as [number, number, number];
    const ankle = legInfo.target;
    const path = catmull([root, knee, ankle]);
    const leg = b.chain(legInfo.name, path, {
      parent: core,
      names: [`${legInfo.name}Hip`, `${legInfo.name}Knee`, `${legInfo.name}Ankle`],
      role: "leg",
      contact: ankle,
    });

    b.sweep(leg, [0.115, 0.075], {
      bone: leg,
      color: SCALE_DARK,
      section: { ngon: 6 },
      caps: "round",
    });

    const foot = b.part(
      new THREE.SphereGeometry(0.12, 8, 5),
      SCALE,
      { bone: leg.tip, at: ankle, scale: [1.2, 0.55, 1.35], name: `${legInfo.name}Foot` },
    );

    for (let c = -1; c <= 1; c++) {
      const toeBase = [ankle[0] + c * 0.045, 0.14, ankle[2] + 0.08] as [number, number, number];
      const toeTip = [ankle[0] + c * 0.065, 0.105, ankle[2] + 0.22] as [number, number, number];
      b.spike(toeBase, toeTip, null, 0.032, {
        color: CLAW,
        bone: leg.tip,
        name: `${legInfo.name}Claw${c + 2}`,
      });
    }

    // Dark iron-like ankle bands.
    b.stick(
      new THREE.CylinderGeometry(0.09, 0.1, 0.055, 8),
      BRONZE_DARK,
      leg.at(0.64),
      { embed: 0.25, spin: 22, name: `${legInfo.name}Band` },
    );
  }

  // ---------------------------------------------------------------------------
  // Five necks, independently riggable and deliberately fanned apart.
  // ---------------------------------------------------------------------------

  const neckSpecs = [
    {
      id: "headL2",
      x: 0.58,
      z: 0.34,
      top: [0.82, 2.12, 0.56] as [number, number, number],
      dir: [0.28, 0.06, 0.96] as [number, number, number],
      scale: 1.0,
      color: SCALE_LIT,
    },
    {
      id: "headL1",
      x: 0.29,
      z: 0.43,
      top: [0.42, 2.34, 0.76] as [number, number, number],
      dir: [0.16, 0.03, 0.99] as [number, number, number],
      scale: 1.05,
      color: SCALE_LIT,
    },
    {
      id: "headC",
      x: 0,
      z: 0.48,
      top: [0, 2.46, 0.9] as [number, number, number],
      dir: [0, 0.03, 1] as [number, number, number],
      scale: 1.12,
      color: SCALE,
    },
    {
      id: "headR1",
      x: -0.29,
      z: 0.43,
      top: [-0.42, 2.34, 0.76] as [number, number, number],
      dir: [-0.16, 0.03, 0.99] as [number, number, number],
      scale: 1.05,
      color: SCALE_LIT,
    },
    {
      id: "headR2",
      x: -0.58,
      z: 0.34,
      top: [-0.82, 2.12, 0.56] as [number, number, number],
      dir: [-0.28, 0.06, 0.96] as [number, number, number],
      scale: 1.0,
      color: SCALE_LIT,
    },
  ];

  type HeadHandles = {
    neck: ReturnType<typeof b.chain>;
    head: ReturnType<typeof b.joint>;
    jaw: ReturnType<typeof b.joint>;
    headAt: THREE.Vector3;
    scale: number;
    dir: THREE.Vector3;
  };

  const heads: HeadHandles[] = [];

  for (let h = 0; h < neckSpecs.length; h++) {
    const spec = neckSpecs[h];
    const neckPath = catmull([
      [spec.x * 0.6, 0.61, spec.z * 0.68],
      [spec.x * 0.88, 0.96, spec.z * 0.82],
      [spec.x, 1.38, spec.z * 0.92],
      spec.top,
    ]);

    const neck = b.chain(`neck${h + 1}`, neckPath, {
      parent: core,
      names: [`neck${h + 1}Base`, `neck${h + 1}Mid`, `neck${h + 1}Upper`, `neck${h + 1}Tip`],
      role: "neck",
    });

    const neckTube = b.sweep(neck, (t) => 0.18 - 0.035 * t, {
      bone: neck,
      color: spec.color,
      section: { ngon: 8 },
      sectors: [
        [115, 245, BELLY],
        [-50, 50, SCALE_DARK],
      ],
      caps: "round",
    });

    // Neck ridges are large enough to survive a low-poly render.
    for (let r = 0; r < 5; r++) {
      const t = 0.12 + r * 0.18;
      const dorsal = neckTube.at(t, 0);
      b.spike(dorsal, dorsal, 0.11 - r * 0.008, 0.035, {
        color: r % 2 ? BONE_DARK : BONE,
        bone: dorsal.bone,
        name: `neck${h + 1}Ridge${r}`,
      });
    }

    const headAt = new THREE.Vector3(...spec.top);
    const headDir = new THREE.Vector3(...spec.dir).normalize();

    const head = b.joint(`head${h + 1}`, {
      parent: neck.tip,
      at: headAt,
      dir: spec.dir,
      role: "head",
      group: "heads",
    });

    const jawAt = head.local([0, -0.055, 0.12]);
    const jawAim = head.local([0, -0.25, 0.48]);
    const jaw = b.joint(`jaw${h + 1}`, {
      parent: head,
      at: jawAt,
      aim: jawAim,
      role: "jaw",
      group: "heads",
    });

    // Cranial mass and cheek plates.
    const skull = b.part(
      new THREE.SphereGeometry(0.27, 10, 7),
      spec.color,
      {
        bone: head,
        at: headAt,
        scale: [0.84 * spec.scale, 0.95 * spec.scale, 1.18 * spec.scale],
        name: `head${h + 1}Skull`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.22, 8, 6),
      BELLY,
      {
        bone: head,
        at: head.local([0, -0.02, 0.15]),
        scale: [0.78 * spec.scale, 0.54 * spec.scale, 0.78 * spec.scale],
        name: `head${h + 1}Throat`,
      },
    );

    // Lower jaw is separate and already hanging open in the rest pose.
    b.frustumBox(
      jaw.at,
      head.local([0, -0.22, 0.46]),
      [0.19 * spec.scale, 0.115 * spec.scale],
      [0.145 * spec.scale, 0.075 * spec.scale],
      {
        bone: jaw,
        color: SCALE_DARK,
        name: `jaw${h + 1}Lower`,
      },
    );

    // A dark mouth wedge sits between the two jaws.
    b.part(
      new THREE.SphereGeometry(0.16, 8, 5),
      MOUTH,
      {
        bone: jaw,
        at: head.local([0, -0.07, 0.31]),
        scale: [0.82 * spec.scale, 0.22 * spec.scale, 1.14 * spec.scale],
        name: `jaw${h + 1}Mouth`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.105, 8, 5),
      TONGUE,
      {
        bone: jaw,
        at: head.local([0, -0.13, 0.39]),
        scale: [0.54 * spec.scale, 0.16 * spec.scale, 1.18 * spec.scale],
        name: `jaw${h + 1}Tongue`,
      },
    );

    // Paired eyes, oversized and glowing.
    for (const side of [-1, 1]) {
      const eyeAt = head.local([side * 0.135 * spec.scale, 0.035, 0.125]);
      const eyeBall = b.part(
        new THREE.SphereGeometry(0.062, 8, 6),
        EYE,
        {
          bone: head,
          at: eyeAt,
          scale: [1, 1, 0.65],
          name: `head${h + 1}Eye${side > 0 ? "R" : "L"}`,
        },
      );
      glow(eyeBall, 1.8);

      b.part(
        new THREE.SphereGeometry(0.026, 6, 4),
        PUPIL,
        {
          bone: head,
          at: head.local([side * 0.135 * spec.scale, 0.089, 0.125]),
          scale: [0.75, 0.35, 1.2],
          name: `head${h + 1}Pupil${side > 0 ? "R" : "L"}`,
        },
      );

      b.part(
        new THREE.SphereGeometry(0.014, 6, 4),
        EYE_HOT,
        {
          bone: head,
          at: head.local([side * 0.115 * spec.scale, 0.105, 0.15]),
          name: `head${h + 1}EyeGlint${side > 0 ? "R" : "L"}`,
        },
      );
    }

    // Brow ridges and a heavy central nose.
    for (const side of [-1, 1]) {
      b.rod(
        head.local([side * 0.12 * spec.scale, 0.1, 0.19]),
        head.local([side * 0.22 * spec.scale, 0.08, 0.23]),
        0.035,
        {
          color: SCALE_DARK,
          bone: head,
          name: `head${h + 1}Brow${side > 0 ? "R" : "L"}`,
        },
      );
    }

    b.part(
      new THREE.SphereGeometry(0.085, 7, 5),
      MOUTH,
      {
        bone: head,
        at: head.local([0, 0.18, 0.02]),
        scale: [1.0, 0.7, 0.7],
        name: `head${h + 1}Nose`,
      },
    );

    // Upper and lower teeth. The alternating lengths create a readable maw.
    for (const side of [-1, 1]) {
      for (let tooth = 0; tooth < 4; tooth++) {
        const x = side * (0.075 + tooth * 0.038) * spec.scale;
        const upperBase = head.local([x, 0.06, 0.28 + tooth * 0.025]);
        const upperTip = head.local([x, -0.015, 0.36 + tooth * 0.025]);
        b.spike(upperBase, upperTip, null, 0.018, {
          color: BONE,
          bone: head,
          name: `head${h + 1}UpperFang${side > 0 ? "R" : "L"}${tooth}`,
        });

        const lowerBase = head.local([x, -0.15, 0.29 + tooth * 0.025]);
        const lowerTip = head.local([x, -0.08, 0.39 + tooth * 0.025]);
        b.spike(lowerBase, lowerTip, null, 0.015, {
          color: BONE_DARK,
          bone: jaw,
          name: `head${h + 1}LowerFang${side > 0 ? "R" : "L"}${tooth}`,
        });
      }
    }

    // Two swept-back horns per skull, with a smaller rear crown spike.
    for (const side of [-1, 1]) {
      const hornBase = head.local([side * 0.17 * spec.scale, -0.01, 0.02]);
      const hornMid = head.local([side * 0.28 * spec.scale, 0.02, -0.07]);
      const hornTip = head.local([side * 0.32 * spec.scale, 0.14, -0.23]);
      b.sweep(
        bezier(hornBase, hornMid, head.local([side * 0.3 * spec.scale, 0.1, -0.16]), hornTip),
        [0.055 * spec.scale, 0.008],
        {
          bone: head,
          color: HORN,
          caps: { start: "round", end: "point" },
          name: `head${h + 1}Horn${side > 0 ? "R" : "L"}`,
        },
      );

      const cheekBase = head.local([side * 0.2 * spec.scale, -0.04, 0.1]);
      const cheekTip = head.local([side * 0.31 * spec.scale, -0.1, 0.25]);
      b.spike(cheekBase, cheekTip, null, 0.035, {
        color: BONE_DARK,
        bone: head,
        name: `head${h + 1}CheekTusk${side > 0 ? "R" : "L"}`,
      });
    }

    b.spike(
      head.local([0, 0.03, -0.19]),
      head.local([0, 0.2, -0.34]),
      null,
      0.045,
      {
        color: HORN_TIP,
        bone: head,
        name: `head${h + 1}Crown`,
      },
    );

    // Warpaint-like scars are physical raised strips, not textures.
    b.rod(
      head.local([0.22 * spec.scale, 0.11, 0.02]),
      head.local([0.16 * spec.scale, 0.12, 0.16]),
      0.012,
      {
        color: SCAR,
        bone: head,
        name: `head${h + 1}Scar`,
      },
    );

    // Small scale studs around the neck transition.
    for (let q = 0; q < 5; q++) {
      const p = neckTube.at(0.18 + q * 0.13, 135);
      b.stick(
        new THREE.ConeGeometry(0.035, 0.055, 6),
        q % 2 ? BRONZE : BRONZE_DARK,
        p,
        { embed: 0.4, name: `neck${h + 1}Scale${q}` },
      );
    }

    heads.push({ neck, head, jaw, headAt, scale: spec.scale, dir: headDir });
  }

  // ---------------------------------------------------------------------------
  // Bronze war-bands and raised scars across the main body.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < 3; i++) {
    const t = 0.28 + i * 0.19;
    const band = b.surface(body).loop(body.at(t), { lift: 0.018 });
    b.sweep(band, 0.018, {
      color: i === 1 ? BRONZE : BRONZE_DARK,
      caps: "none",
      name: `bodyWarBand${i}`,
    });

    const ringItems = b.ring(body.at(t), {
      count: 8,
      radius: 0.355,
      fromDeg: 0,
      toDeg: 360,
      name: `bodyRivetRing${i}`,
      role: "fan",
    });

    for (const item of ringItems.items) {
      b.part(
        new THREE.SphereGeometry(0.025, 6, 4),
        CLAW,
        { frame: item, scale: [1, 0.7, 1], name: `bodyRivet${i}_${item.i}` },
      );
    }
  }

  // A few prominent raised scar bars across the flank.
  for (let i = 0; i < 4; i++) {
    const z = 0.18 - i * 0.2;
    b.rod(
      [0.24, 0.71, z],
      [0.44, 0.57, z + 0.07],
      0.014,
      {
        color: SCAR,
        bone: core,
        name: `flankScarL${i}`,
      },
    );
    b.rod(
      [-0.24, 0.71, z],
      [-0.44, 0.57, z + 0.07],
      0.014,
      {
        color: SCAR,
        bone: core,
        name: `flankScarR${i}`,
      },
    );
  }

  // Heavy shoulder/collar plates where all five necks erupt from the torso.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.22, 8, 5),
      BRONZE,
      {
        bone: core,
        at: [side * 0.34, 0.72, 0.34],
        scale: [1.2, 0.45, 0.85],
        name: `shoulderPlate${side > 0 ? "L" : "R"}`,
      },
    );
    b.spike(
      [side * 0.36, 0.78, 0.42],
      [side * 0.55, 0.92, 0.48],
      null,
      0.05,
      {
        color: BONE,
        bone: core,
        name: `shoulderSpur${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // Tiny ember-like eye glints at the crown of the central head reinforce the focal point.
  const crown = heads[2].head;
  for (const side of [-1, 1]) {
    const gem = b.part(
      new THREE.OctahedronGeometry(0.035, 0),
      EYE,
      {
        bone: crown,
        at: crown.local([side * 0.07, 0.08, -0.18]),
        name: `crownEmber${side > 0 ? "L" : "R"}`,
      },
    );
    glow(gem, 1.2);
  }

  return b.root;
}
```