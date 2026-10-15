import * as THREE from "three";
import { bezier, catmull, createBuilder, frame, patches, polyline, rng, spots, svg } from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { coil, gaugeTexture, gearTrain, metal, TINT } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

// A stubby gnome tinkerer: a spotted hat, blue overalls, a leather apron and a bushy white beard, with a backpack of
// gadgets (a copper boiler with a gauge, a coil antenna and a glowing bulb, a flat gear train, a steam pipe) and a
// wrench and a glowing bulb in the hands. Cel-shaded paints and metal for the look; low-poly faceting for the shapes.

export const meta = {
  name: "Gnome tinkerer",
  description:
    "A stubby gnome tinkerer in a spotted hat and blue overalls, carrying a backpack of gears, a copper boiler, a coil antenna and a glowing bulb.",
};

const RAD = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette and drawings

const SKIN = cel("#f2b28c");
const CHEEK = cel("#ff8c9b");
const FRECKLE = "#b5664a";
const NOSE = cel("#e9785f");
const BEARD = cel("#f7f3ea", "#cdc5da");
const BEARD_TIP = cel("#e4d6bd");
const HAT = cel(spots("#d8402f", "#fff0d2", { size: 0.07, amount: 0.32, seed: 4 }));
const WOOL = cel("#fff7e6");
const SHIRT = cel("#41a368");
const OVERALLS = cel("#3b5fb0");
const STRAP = cel("#2c4a8c");
const APRON = cel("#9a6236");
const LEATHER = cel("#6b4228");
const BOOT = cel("#4a2b1a");
const CANVAS = patches("#8f6c40", ["#ab8454", "#9a7444", "#7d5c36"], { size: 0.12, gap: 0.06, seed: 2 });
const PACK = cel(CANVAS);
const BRASS = metal("brass");
const COPPER = metal("copper", { verdigris: 0.25 });
const STEEL = metal("steel");

const EYE = animeEye({ iris: "#2fb3a6", irisLight: "#a6f2e6", irisDark: "#17505e", blush: "#ff8c9b", brow: false, size: 384 });
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 63 C8 44 9 22 16 3 C23 22 24 44 16 63Z" fill="#ffffff" stroke="#8a8a8a" stroke-width="2.2"/>
    <path d="M11 63 C5 50 4 36 8 24 C12 40 13 52 11 63Z" fill="#e6e6e6" stroke="#8a8a8a" stroke-width="1.8"/>
  </svg>`,
  { size: 128 },
);
const PUFF = svg(
  `<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg">
    <g fill="#ffffff" stroke="#8c94a6" stroke-width="2.4">
      <circle cx="18" cy="28" r="12"/><circle cx="34" cy="20" r="15"/><circle cx="48" cy="30" r="11"/>
    </g>
  </svg>`,
  { size: 192 },
);
const LABEL = svg(
  `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="114" height="42" rx="8" fill="#f5e7c4" stroke="#5b3a1e" stroke-width="4"/>
    <path d="M12 12 H108 M12 36 H108" stroke="#b86b2b" stroke-width="2.4" stroke-dasharray="4 4"/>
    <text x="60" y="30" text-anchor="middle" font-family="serif" font-weight="bold" font-size="22" fill="#5b3a1e">No. 7</text>
  </svg>`,
  { size: 384 },
);
const GAUGE = gaugeTexture({ needle: 40, label: "PSI" });

/** A spanner outline: a ring with a jaw opening at the top, in meters. */
function spanner(R: number, gapDeg: number, n: number): [number, number][] {
  const a0 = (90 + gapDeg / 2) * RAD;
  const a1 = (90 - gapDeg / 2 + 360) * RAD;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([Math.cos(a) * R, Math.sin(a) * R]);
  }
  const inner = R * 0.55;
  pts.push([Math.cos(a1) * inner, Math.sin(a1) * inner], [Math.cos(a0) * inner, Math.sin(a0) * inner]);
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "gnome-tinkerer" });
  const rand = rng(7);

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.36, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.36, 0], [0, 0.47, 0], [0, 0.58, 0], [0, 0.64, 0.005]]), {
    parent: hips,
    names: ["waist", "chest", "neck"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.64, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.7, -0.03], role: "jaw" });

  // ---- Torso: a chubby loft, shirt above the belt line and overalls below -----------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.36, 0], w: 0.27, h: 0.22 },
      { at: [0, 0.46, 0], w: 0.36, h: 0.3 },
      { at: [0, 0.56, 0], w: 0.37, h: 0.3 },
      { at: [0, 0.62, 0], w: 0.26, h: 0.22 },
    ],
    {
      bone: spine,
      color: furEdge(SHIRT, OVERALLS, { by: "position", level: 0.5, teeth: 0.025, period: 0.045, along: [1, 0, 0] }),
    },
  );
  const belly = b.part(new THREE.SphereGeometry(1, 14, 10), OVERALLS, {
    bone: chest,
    at: [0, 0.45, 0.07],
    scale: [0.2, 0.17, 0.14],
  });
  const bodySurf = b.surface([torso, belly]);

  // Overall straps with brass buttons.
  for (const s of [1, -1]) {
    const strap = bodySurf.drape(
      catmull([
        [s * 0.12, 0.6, 0.1],
        [s * 0.11, 0.5, 0.2],
        [s * 0.1, 0.4, 0.2],
      ]),
      { lift: 0.006 },
    );
    b.sweep(strap, 0.011, { color: STRAP });
    b.stick(new THREE.SphereGeometry(0.014, 7, 5), BRASS, bodySurf.nearest([s * 0.1, 0.5, 0.4]), { embed: 0.4 });
  }

  // Belt, hip pouch.
  b.sweep(bodySurf.loop([0, 0.42, 0], { dir: [0, 1, 0], lift: 0.012 }), 0.018, { color: LEATHER });
  b.part(new THREE.BoxGeometry(0.07, 0.08, 0.05), LEATHER, { bone: hips, at: [0.19, 0.38, 0.02] });

  // Leather apron, a rounded-corner slab on the belly, with a pocket and a pencil.
  const apronHit = bodySurf.nearest([0, 0.4, 0.5]);
  const apron = b.extrude(
    [
      [-0.13, 0.13],
      [0.13, 0.13],
      [0.15, -0.14],
      [-0.15, -0.14],
    ],
    { at: apronHit.moved([0, 0.005, 0]), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: APRON },
  );
  const apronSurf = b.surface(apron);
  const pocket = apronSurf.nearest([0.07, 0.35, 0.6]);
  b.stick(new THREE.BoxGeometry(0.075, 0.012, 0.065), LEATHER, pocket, { embed: 0.4 });
  const pencilBase = pocket.moved([0.02, 0.0, 0.02]);
  b.rod(pencilBase, pencilBase.moved([0, 0.05, 0.06]), 0.007, "#e0b334");
  b.rod(pencilBase.moved([0, 0.05, 0.06]), pencilBase.moved([0, 0.065, 0.075]), 0.007, "#c2504a");

  // ---- Backpack of gadgets -----------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.34, 0.36, 0.14), PACK, { bone: chest, at: [0, 0.56, -0.2] });
  b.part(new THREE.BoxGeometry(0.36, 0.035, 0.16), LEATHER, { bone: chest, at: [0, 0.745, -0.2] });
  b.part(new THREE.PlaneGeometry(0.1, 0.04), "#ffffff", {
    bone: chest,
    at: [0, 0.5, -0.283],
    dir: [0, 0, -1],
    axis: "z",
    texture: LABEL,
  });

  // Copper boiler with brass bands and a domed cap, on top of the pack.
  b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.18, 9), COPPER, { bone: chest, at: [0.1, 0.83, -0.2] });
  b.part(new THREE.SphereGeometry(0.055, 9, 6), COPPER, { bone: chest, at: [0.1, 0.92, -0.2], scale: [1, 0.55, 1] });
  for (const y of [0.79, 0.87]) {
    b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.018, 9), BRASS, { bone: chest, at: [0.1, y, -0.2] });
  }
  // Steam puffs, two crossed cards above the boiler.
  b.cards(
    [frame([0.1, 0.96, -0.2], [0, 1, 0]), frame([0.12, 1.0, -0.2], [0, 1, 0])],
    PUFF,
    { size: [0.11, 0.08], lean: 0, flow: [0, 0, 1], cross: true, color: "#f4f7fb" },
  );
  // A pipe from the boiler down the pack's side.
  b.sweep(
    polyline([
      [0.1, 0.76, -0.2],
      [0.18, 0.74, -0.2],
      [0.18, 0.6, -0.2],
    ]),
    0.011,
    { bone: chest, color: COPPER },
  );
  // Pressure gauge on the left side of the pack.
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 12), BRASS, {
    bone: chest,
    at: [0.182, 0.6, -0.2],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CircleGeometry(0.04, 16), "#ffffff", {
    bone: chest,
    at: [0.195, 0.6, -0.2],
    dir: [1, 0, 0],
    axis: "z",
    texture: GAUGE,
  });
  // Coil antenna with a glowing bulb.
  const antBase: [number, number, number] = [-0.11, 0.74, -0.22];
  const antTop: [number, number, number] = [-0.11, 0.98, -0.22];
  b.sweep(coil(antBase, antTop, 0.016, 9), 0.0045, { bone: chest, color: COPPER });
  b.rod(antBase, antTop, 0.003, STEEL, { bone: chest });
  glow(b.part(new THREE.SphereGeometry(0.03, 9, 7), "#7ff3ff", { bone: chest, at: [-0.11, 0.995, -0.22] }), 1.6);
  // A flat gear train on the right side of the pack: a great wheel and two pinions meshed with it.
  gearTrain(b, {
    at: [-0.178, 0.57, -0.2],
    axis: [1, 0, 0],
    module: 0.008,
    style: "flat",
    bone: chest,
    group: "pack",
    gears: [
      { teeth: 14, color: TINT.brass },
      { teeth: 8, from: 0, angle: 60, color: TINT.copper },
      { teeth: 8, from: 0, angle: -60, color: TINT.gilt },
    ],
  });

  // ---- Head ----------------------------------------------------------------------------------------------------
  const headPart = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, {
    bone: head,
    at: [0, 0.78, 0],
    scale: [0.15, 0.16, 0.15],
  });
  const headSurf = b.surface(headPart);

  // Big anime eyes, the right one mirrored for the left.
  for (const s of [1, -1]) {
    b.decal(headSurf, EYE, {
      at: headSurf.nearest([s * 0.055, 0.8, 0.4]),
      size: [0.056, 0.077],
      mirror: s > 0,
    });
  }
  // Bulb nose, rosy cheeks with freckles.
  b.stick(new THREE.SphereGeometry(0.046, 9, 7).scale(1, 0.9, 1.15), NOSE, headSurf.nearest([0, 0.76, 0.4]), {
    embed: 0.3,
  });
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.032, 8, 6).scale(1, 0.45, 1), CHEEK, headSurf.nearest([s * 0.1, 0.72, 0.32]), {
      embed: 0.5,
    });
    for (const [dx, dy] of [
      [0, 0],
      [0.012, -0.012],
      [-0.008, -0.022],
    ]) {
      b.stick(
        new THREE.SphereGeometry(0.0055, 5, 4),
        FRECKLE,
        headSurf.nearest([s * (0.1 + dx), 0.715 + dy, 0.32]),
        { embed: 0.5 },
      );
    }
  }
  // A wide smile, draped on the face.
  const smile = headSurf.drape(
    catmull([
      [-0.05, 0.7, 0.22],
      [0, 0.68, 0.24],
      [0.05, 0.7, 0.22],
    ]),
    { lift: 0.002 },
  );
  b.sweep(smile, 0.0075, { color: INK, bone: head });

  // Pointed ears.
  for (const s of [1, -1]) {
    b.spike(headSurf.nearest([s * 0.3, 0.78, 0]), [s, 0.35, -0.15], 0.1, 0.03, { color: SKIN });
  }
  // Side-burn tufts.
  b.cards(
    headSurf.scatter(14, {
      rng: rand,
      minDist: 0.04,
      filter: (h) => Math.abs(h.n.x) > 0.5 && h.n.y > -0.35 && h.n.y < 0.4,
    }),
    TUFT,
    { size: [0.045, 0.07], lean: 70, flow: [0, -1, 0], color: "#f1ece2", vary: 0.2, rng: rand },
  );

  // Bushy beard hanging from the jaw, flattened into a slab, down over the belly.
  const beardPath = catmull([
    [0, 0.66, 0.07],
    [0, 0.58, 0.15],
    [0, 0.5, 0.19],
    [0, 0.42, 0.18],
    [0, 0.37, 0.13],
  ]);
  const beard = b.sweep(beardPath, (t: number): [number, number] => [0.06 - 0.03 * t, 0.03 - 0.012 * t], {
    bone: jaw,
    section: "box",
    color: BEARD,
    bands: [
      [0.8, BEARD],
      [1, BEARD_TIP],
    ],
  });
  b.cards(
    b.surface(beard).scatter(16, { rng: rand, minDist: 0.03, filter: (h) => h.n.z > 0.1 }),
    TUFT,
    { size: [0.03, 0.06], lean: 75, flow: [0, -1, 0], color: "#fbf8f0", vary: 0.2, bend: 20, rng: rand },
  );

  // A tall spotted hat, tilted, with a brass band and a floppy tip with a wool pompom.
  const hatAxis = new THREE.Vector3(0.22, 1, -0.12).normalize();
  const hatBase = new THREE.Vector3(0, 0.9, 0);
  b.lathe(
    [
      [0, 0],
      [0.165, 0],
      [0.172, 0.03],
      [0.12, 0.045],
      [0, 0.3],
    ],
    { at: hatBase, axis: hatAxis, segments: 7, bone: head, color: HAT },
  );
  b.lathe(
    [
      [0.105, 0.035],
      [0.14, 0.035],
      [0.135, 0.055],
      [0.1, 0.05],
    ],
    { at: hatBase, axis: hatAxis, segments: 7, bone: head, color: BRASS },
  );
  const hatTop = hatBase.clone().addScaledVector(hatAxis, 0.3);
  const flop = bezier(
    hatTop,
    hatTop.clone().add(new THREE.Vector3(0.02, 0.1, -0.01)),
    hatTop.clone().add(new THREE.Vector3(0.1, 0.16, -0.05)),
    hatTop.clone().add(new THREE.Vector3(0.2, 0.12, -0.1)),
  );
  const floppy = b.sweep(flop, [0.03, 0.01], { bone: head, color: HAT });
  b.stick(new THREE.SphereGeometry(0.035, 8, 6), WOOL, floppy.at(1), { embed: 0.3 });

  // ---- Arms ----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${L}`,
      polyline([
        [s * 0.17, 0.6, 0],
        [s * 0.27, 0.48, 0.02],
        [s * 0.3, 0.41, 0.06],
        [s * 0.3, 0.36, 0.11],
      ]),
      {
        parent: chest,
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
        role: "arm",
      },
    );
    const hand = arm.tip!;
    // Shirt sleeves, bare forearm, leather glove cuffs.
    b.sweep(arm, (t: number): number => 0.07 - 0.02 * t, {
      color: SHIRT,
      bands: [
        [0.42, SHIRT],
        [0.92, SKIN],
        [1, LEATHER],
      ],
    });
    b.part(new THREE.SphereGeometry(0.07, 10, 8), SHIRT, { bone: arm.joints[0], at: [s * 0.17, 0.6, 0] });
    b.part(new THREE.SphereGeometry(0.05, 9, 7), LEATHER, {
      bone: hand,
      at: [s * 0.3, 0.36, 0.11],
      scale: [1, 0.9, 1.05],
    });
    if (s > 0) {
      // Left hand: a copper-based glowing bulb.
      b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 8), COPPER, { bone: hand, at: [0.3, 0.42, 0.11] });
      b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 9), BRASS, { bone: hand, at: [0.3, 0.45, 0.11] });
      glow(
        b.part(new THREE.SphereGeometry(0.045, 10, 8), "#ffd84a", {
          bone: hand,
          at: [0.3, 0.5, 0.11],
          scale: [1, 1.2, 1],
        }),
        1.6,
      );
    } else {
      // Right hand: a spanner held upright.
      b.capsule([-0.3, 0.37, 0.11], [-0.3, 0.5, 0.11], 0.009, STEEL, { bone: hand });
      b.extrude(spanner(0.035, 42, 14), {
        at: [-0.3, 0.52, 0.11],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: STEEL,
        bone: hand,
      });
    }
  }

  // ---- Legs and boots -----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [s * 0.1, 0.36, 0],
        [s * 0.115, 0.2, 0.02],
        [s * 0.11, 0.075, 0],
        [s * 0.11, 0.045, 0.09],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
        role: "leg",
      },
    );
    b.sweep(leg, (t: number): number => 0.075 - 0.025 * t, { color: OVERALLS });
    b.part(new THREE.SphereGeometry(1, 10, 8), BOOT, {
      bone: leg.joints[2],
      at: [s * 0.11, 0.06, 0.02],
      scale: [0.078, 0.07, 0.1],
    });
    b.part(new THREE.SphereGeometry(1, 9, 7), BOOT, {
      bone: leg.tip!,
      at: [s * 0.11, 0.035, 0.1],
      scale: [0.072, 0.04, 0.085],
    });
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.012), BRASS, {
      bone: leg.joints[2],
      at: [s * 0.11, 0.1, 0.085],
    });
  }

  return b.root;
}
