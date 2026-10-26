import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";

export const meta = {
  name: "gunblade",
  description: "A stylized Final Fantasy-inspired gunblade with a broad silver blade, revolver housing, brass guard, trigger loop, and ornate glowing crest.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const root = b.joint("weaponRoot", {
    at: [0, 0.02, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "weapon",
  });

  const STEEL = metal("steel", {
    polish: 0.72,
    tarnish: 0.16,
    size: 0.16,
    seed: 11,
  });

  const DARK_STEEL = metal("blued", {
    polish: 0.45,
    tarnish: 0.3,
    size: 0.11,
    seed: 19,
  });

  const BRASS = metal("brass", {
    polish: 0.7,
    tarnish: 0.18,
    verdigris: 0.05,
    size: 0.09,
    seed: 23,
  });

  const COPPER = metal("copper", {
    polish: 0.55,
    tarnish: 0.2,
    size: 0.08,
    seed: 29,
  });

  const GRIP = panelled(
    metal("iron", {
      polish: 0.2,
      tarnish: 0.55,
      size: 0.12,
      seed: 37,
    }),
    { size: 0.045, aspect: 0.8, rivets: 0.03 },
  );

  const INK = "#171522";
  const LEATHER = "#261722";
  const RUBY = "#c93458";
  const GLOW = "#6fe7ff";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name: string,
    bevel = 0,
  ) => {
    const geometry = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      // A tiny bevel-like highlight is supplied by the inset plates below;
      // keeping the main silhouettes deliberately blocky.
    }
    return b.part(geometry, color, {
      bone: root,
      at,
      name,
      group: "gunblade",
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    length: number,
    at: [number, number, number],
    color: any,
    name: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, radial), color, {
      bone: root,
      at,
      dir: [0, 1, 0],
      name,
      group: "gunblade",
      flat: true,
    });

  // Broad, angular blade silhouette. It rests on the heavy gun housing at y=.62.
  const blade = b.extrude(
    [
      [-0.145, 0],
      [0.145, 0],
      [0.16, 0.18],
      [0.12, 0.7],
      [0.07, 0.98],
      [0, 1.17, "sharp"],
      [-0.07, 0.98],
      [-0.12, 0.7],
      [-0.16, 0.18],
    ],
    {
      at: [0, 0.62, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.075, 0.032],
      bevel: 0.012,
      smoothing: 0,
      color: STEEL,
      bone: root,
      name: "heroBlade",
      group: "blade",
    },
  );

  // Dark fuller running up the front face.
  b.extrude(
    [
      [-0.028, 0.08],
      [0.028, 0.08],
      [0.034, 0.58],
      [0.021, 0.88],
      [0, 1.045, "sharp"],
      [-0.021, 0.88],
      [-0.034, 0.58],
    ],
    {
      at: [0, 0.62, 0.043],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: DARK_STEEL,
      bone: root,
      name: "bladeFuller",
      group: "blade",
    },
  );

  // Bright cutting-edge strips, intentionally separated so the low-poly blade reads in silhouette.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [s * 0.115, 0.08],
        [s * 0.145, 0.19],
        [s * 0.11, 0.68],
        [s * 0.055, 1.0],
        [0, 1.15, "sharp"],
        [s * 0.035, 0.96],
        [s * 0.078, 0.65],
      ],
      {
        at: [0, 0.62, 0.045],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        color: "#dceeff",
        bone: root,
        name: s > 0 ? "leftEdge" : "rightEdge",
        group: "blade",
      },
    );
  }

  // Blade shoulder and revolver chamber.
  box([0.38, 0.16, 0.16], [0, 0.64, 0], DARK_STEEL, "chamberBlock");
  box([0.27, 0.12, 0.19], [0, 0.76, 0], STEEL, "chamberCrown");

  // Round cylinder drum embedded in the sword's base.
  cylinder(0.13, 0.2, [0, 0.68, 0], DARK_STEEL, "revolverDrum", 10);
  cylinder(0.055, 0.208, [0, 0.68, 0], BRASS, "drumHub", 10);

  // Six chamber sockets facing the viewer.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * 0.082;
    const y = 0.68 + Math.cos(a) * 0.082;
    cylinder(0.018, 0.216, [x, y, 0.004], INK, `chamber${i}`, 6);
  }

  // Crossguard: stepped brass quillons with dark inset blocks.
  box([0.7, 0.075, 0.11], [0, 0.53, 0], BRASS, "crossguard");
  box([0.26, 0.105, 0.14], [0, 0.53, 0], COPPER, "guardCenter");

  for (const s of [-1, 1]) {
    box([0.2, 0.13, 0.13], [s * 0.27, 0.55, 0], BRASS, s > 0 ? "guardL" : "guardR");
    box([0.11, 0.18, 0.1], [s * 0.39, 0.58, 0], DARK_STEEL, s > 0 ? "quillonL" : "quillonR");
    b.spike(
      [s * 0.43, 0.66, 0],
      [s * 0.18, 0.28, 0],
      0.2,
      0.035,
      { color: BRASS, bone: root, name: s > 0 ? "guardTipL" : "guardTipR" },
    );
  }

  // Grip below the guard, slightly forward-facing like a revolver handle.
  const gripPath = [
    [0, 0.49, 0],
    [0, 0.32, -0.015],
    [0, 0.13, -0.065],
    [0, 0.045, -0.11],
  ];
  b.sweep(gripPath, [0.095, 0.075, 0.055, 0.035], {
    bone: root,
    color: GRIP,
    section: "box",
    sides: 6,
    caps: "round",
    name: "pistolGrip",
    group: "grip",
  });

  // Grip spine and pommel.
  b.rod([0, 0.09, -0.145], [0, 0.02, -0.175], 0.045, {
    color: BRASS,
    bone: root,
    name: "pommelNeck",
  });
  cylinder(0.075, 0.06, [0, 0.025, -0.18], BRASS, "pommel", 8);
  box([0.12, 0.025, 0.04], [0, 0.017, -0.235], RUBY, "pommelGem");

  // Trigger guard and trigger.
  b.sweep(
    [
      [-0.095, 0.49, 0.035],
      [-0.115, 0.39, 0.035],
      [-0.055, 0.31, 0.035],
      [0.055, 0.31, 0.035],
      [0.095, 0.4, 0.035],
    ],
    0.018,
    {
      color: BRASS,
      bone: root,
      section: { ngon: 6 },
      caps: "round",
      name: "triggerGuard",
      group: "grip",
    },
  );

  b.sweep(
    [
      [0.015, 0.445, 0.045],
      [0.035, 0.385, 0.045],
      [0.01, 0.35, 0.045],
    ],
    [0.014, 0.008],
    {
      color: COPPER,
      bone: root,
      caps: "round",
      name: "trigger",
      group: "grip",
    },
  );

  // A secondary gun barrel along the blade's left edge, giving the weapon its hybrid identity.
  b.rod([0.13, 0.72, -0.01], [0.13, 1.28, -0.01], 0.028, {
    color: DARK_STEEL,
    bone: root,
    name: "barrel",
    group: "gun",
  });
  b.spike([0.13, 1.28, -0.01], [0, 1, 0], 0.075, 0.027, {
    color: STEEL,
    bone: root,
    name: "barrelMuzzle",
    group: "gun",
  });
  cylinder(0.04, 0.035, [0.13, 0.82, -0.01], BRASS, "barrelBand", 8);

  // Small mechanical rails and rivets.
  box([0.055, 0.52, 0.025], [-0.13, 0.88, -0.015], BRASS, "bladeRail");
  for (let i = 0; i < 5; i++) {
    const y = 0.82 + i * 0.105;
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BRASS, {
      bone: root,
      at: [-0.14, y, 0.04],
      name: `bladeRivet${i}`,
      group: "blade",
    });
  }

  // Ornate Final Fantasy-like crest on the blade face.
  const crest = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 L61 43 L94 50 L64 62 L72 105 L50 82 L28 105 L36 62 L6 50 L39 43 Z"
        fill="#73efff" stroke="#132743" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 20 L54 48 L76 51 L55 57 L58 79 L50 68 L42 79 L45 57 L24 51 L46 48 Z"
        fill="#dfffff"/>
      <circle cx="50" cy="50" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const crestPart = b.part(new THREE.PlaneGeometry(0.13, 0.18), GLOW, {
    bone: root,
    at: [0, 1.18, 0.052],
    dir: [0, 0, 1],
    axis: "z",
    texture: crest,
    name: "crystalCrest",
    group: "ornament",
  });

  // Side-mounted ruby studs and bright blade insignia.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.028, 8, 6), RUBY, {
      bone: root,
      at: [s * 0.19, 0.64, 0.085],
      name: s > 0 ? "rubyLeft" : "rubyRight",
      group: "ornament",
    });
    b.part(new THREE.SphereGeometry(0.017, 7, 5), GLOW, {
      bone: root,
      at: [s * 0.085, 0.91, 0.057],
      name: s > 0 ? "blueStudL" : "blueStudR",
      group: "ornament",
    });
  }

  return b.root;
}
