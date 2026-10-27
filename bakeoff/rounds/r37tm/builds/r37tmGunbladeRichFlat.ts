import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description: "A stylized Final Fantasy-inspired gunblade, combining a broad crystal-edged sword with a revolver receiver, cylinder, trigger guard, and ornate metallic details.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#303846";
  const STEEL_LIGHT = "#667385";
  const STEEL_DARK = "#171b25";
  const GUNMETAL = "#202733";
  const SILVER = "#b9c7d8";
  const EDGE = "#e6f0fa";
  const GOLD = "#d79a38";
  const GOLD_LIGHT = "#f4ca69";
  const GOLD_DARK = "#704018";
  const LEATHER = "#432821";
  const LEATHER_LIGHT = "#754233";
  const RUBY = "#d34446";
  const BLUE = "#36b9ff";
  const BLUE_DARK = "#174f9d";
  const INK = "#0b1018";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    length: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number],
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    name: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      scale,
      name,
      flat: true,
    });

  // -----------------------------------------------------------------------------------------------
  // Sword blade: a long, heavy gunblade silhouette, rising from the receiver toward +Z.

  const blade = b.extrude(
    [
      [0.05, -0.015],
      [0.78, -0.015],
      [1.08, 0.025],
      [1.29, 0.13],
      [1.43, 0.26, "sharp"],
      [1.28, 0.34],
      [0.88, 0.31],
      [0.46, 0.25],
      [0.08, 0.19],
      [-0.02, 0.10],
    ],
    {
      at: [0, 1.17, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 1,
      color: STEEL,
      name: "blade.main",
    },
  );

  // Dark fuller carved into the blade.
  b.extrude(
    [
      [0.17, 0.045],
      [0.83, 0.075],
      [1.16, 0.14],
      [1.27, 0.205],
      [0.86, 0.22],
      [0.22, 0.15],
    ],
    {
      at: [0.040, 1.17, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.003,
      color: STEEL_DARK,
      name: "blade.fuller",
    },
  );

  // Pale cutting edge, broken into broad graphic facets.
  b.extrude(
    [
      [0.08, -0.024],
      [0.78, -0.024],
      [1.08, 0.016],
      [1.29, 0.122],
      [1.40, 0.25],
      [1.27, 0.205],
      [1.08, 0.105],
      [0.77, 0.045],
      [0.10, 0.032],
    ],
    {
      at: [0.046, 1.17, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: EDGE,
      name: "blade.edge",
    },
  );

  // Jagged gold spine plates make the silhouette unmistakably fantasy.
  const spinePlates = [
    [[0.22, 0.28], [0.38, 0.36], [0.47, 0.31], [0.35, 0.24]],
    [[0.48, 0.31], [0.65, 0.39], [0.73, 0.34], [0.60, 0.27]],
    [[0.75, 0.35], [0.94, 0.40], [1.01, 0.33], [0.87, 0.28]],
  ];
  spinePlates.forEach((outline, i) => {
    b.extrude(outline, {
      at: [0.051, 1.17, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: i === 1 ? GOLD_LIGHT : GOLD,
      name: `blade.spinePlate${i}`,
    });
  });

  // Blue energy channel, recessed visually beneath a raised silver rail.
  const energy = box([0.025, 0.035, 0.93], BLUE_DARK, [0.051, 1.315, 0.62], "blade.energy.channel", [0, 0, 0]);
  const energyGlow = box([0.012, 0.018, 0.86], BLUE, [0.064, 1.315, 0.62], "blade.energy.glow", [0, 0, 0]);
  glow(energyGlow, 2.4);

  // Small glowing runic nodes along the channel.
  for (let i = 0; i < 5; i++) {
    const z = 0.27 + i * 0.17;
    const rune = sphere(0.018, BLUE, [0.073, 1.315, z], `blade.rune${i}`, [0.7, 1.0, 1.5]);
    glow(rune, 2.8);
  }

  // Blade guard collar / ricasso.
  box([0.18, 0.19, 0.13], STEEL_LIGHT, [0, 0.98, 0.12], "blade.ricasso");
  box([0.20, 0.035, 0.145], GOLD, [0, 1.075, 0.12], "blade.ricasso.gold");
  box([0.20, 0.035, 0.145], GOLD_DARK, [0, 0.885, 0.12], "blade.ricasso.shadow");

  // -----------------------------------------------------------------------------------------------
  // Revolver body: chunky receiver beneath the blade.

  box([0.30, 0.26, 0.46], GUNMETAL, [0, 0.83, 0.05], "receiver.core");
  box([0.34, 0.075, 0.38], STEEL_LIGHT, [0, 0.965, 0.06], "receiver.topRail");
  box([0.27, 0.055, 0.34], STEEL_DARK, [0, 0.693, 0.045], "receiver.underRail");

  // Angled rear housing and forward barrel shroud.
  box([0.28, 0.20, 0.20], STEEL, [0, 0.84, -0.245], "receiver.rearBlock", [0, -0.18, 0]);
  box([0.25, 0.16, 0.26], STEEL_LIGHT, [0, 0.865, 0.37], "receiver.frontBlock", [0, 0.06, 0]);
  box([0.19, 0.085, 0.28], STEEL_DARK, [0, 0.955, 0.38], "receiver.frontSlot");

  // Gold rails and inset plates.
  box([0.045, 0.055, 0.48], GOLD, [0.155, 0.895, 0.06], "receiver.leftRail");
  box([0.045, 0.055, 0.48], GOLD_DARK, [-0.155, 0.895, 0.06], "receiver.rightRail");
  box([0.22, 0.025, 0.20], GOLD_LIGHT, [0.0, 1.005, 0.12], "receiver.deckOrnament");
  box([0.14, 0.018, 0.25], BLUE_DARK, [0.0, 1.022, 0.20], "receiver.deckGemBed");

  const deckGem = sphere(0.045, BLUE, [0, 1.039, 0.20], "receiver.deckGem", [1.0, 0.35, 1.35]);
  glow(deckGem, 2.3);

  // -----------------------------------------------------------------------------------------------
  // Revolver cylinder visible on the model's left side (+X).

  const cylinder = cyl(0.145, 0.105, STEEL_DARK, [0.195, 0.83, 0.03], [1, 0, 0], "cylinder.body", 12);
  cyl(0.153, 0.024, GOLD, [0.254, 0.83, 0.03], [1, 0, 0], "cylinder.frontRing", 12);
  cyl(0.117, 0.032, STEEL_LIGHT, [0.275, 0.83, 0.03], [1, 0, 0], "cylinder.face", 12);
  cyl(0.050, 0.038, GOLD_DARK, [0.299, 0.83, 0.03], [1, 0, 0], "cylinder.hub", 10);

  // Six chamber mouths arranged in the cylinder's Y/Z face.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const y = 0.83 + Math.sin(a) * 0.087;
    const z = 0.03 + Math.cos(a) * 0.087;
    cyl(0.022, 0.012, INK, [0.323, y, z], [1, 0, 0], `cylinder.chamber${i}`, 7);
    sphere(0.012, GOLD_LIGHT, [0.333, y, z], `cylinder.rivet${i}`);
  }

  // Cylinder flutes as dark bars around the drum.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const y = 0.83 + Math.sin(a) * 0.132;
    const z = 0.03 + Math.cos(a) * 0.132;
    box([0.014, 0.028, 0.055], INK, [0.255, y, z], `cylinder.flute${i}`, [a, 0, 0]);
  }

  // Barrel emerging from the upper front of the receiver.
  box([0.13, 0.13, 0.33], STEEL_DARK, [0, 0.93, 0.53], "barrel.shroud");
  cyl(0.067, 0.38, STEEL, [0, 0.93, 0.66], [0, 0, 1], "barrel", 10);
  cyl(0.086, 0.075, GOLD, [0, 0.93, 0.84], [0, 0, 1], "barrel.muzzleBand", 10);
  cyl(0.058, 0.025, INK, [0, 0.93, 0.89], [0, 0, 1], "barrel.muzzle", 10);

  // Barrel vents.
  for (let i = 0; i < 3; i++) {
    box([0.16, 0.018, 0.035], INK, [0, 0.975, 0.53 + i * 0.075], `barrel.vent${i}`);
  }

  // -----------------------------------------------------------------------------------------------
  // Trigger guard, trigger, and lower frame.

  const guardPath = catmull(
    [
      [-0.145, 0.72, -0.10],
      [-0.12, 0.57, -0.13],
      [0, 0.51, -0.15],
      [0.12, 0.57, -0.13],
      [0.145, 0.72, -0.10],
    ],
    { tension: 0.25 },
  );
  b.sweep(guardPath, 0.024, {
    color: GOLD,
    caps: "round",
    name: "triggerGuard",
  });

  b.rod([0, 0.73, -0.105], [0, 0.60, -0.125], 0.018, {
    color: STEEL_LIGHT,
    name: "trigger",
  });
  sphere(0.028, GOLD_LIGHT, [0, 0.595, -0.126], "trigger.jewel");

  box([0.28, 0.08, 0.18], GOLD_DARK, [0, 0.69, -0.17], "lowerFrame");
  box([0.20, 0.035, 0.20], GOLD, [0, 0.735, -0.17], "lowerFrame.highlight");

  // -----------------------------------------------------------------------------------------------
  // Grip: leather-wrapped, swept backward for a dramatic Final Fantasy silhouette.

  b.rod([0, 0.64, -0.20], [0, 0.28, -0.30], 0.085, {
    color: LEATHER,
    caps: "round",
    name: "grip.core",
  });
  b.rod([0, 0.64, -0.205], [0, 0.29, -0.305], 0.060, {
    color: LEATHER_LIGHT,
    caps: "round",
    name: "grip.inset",
  });

  // Gold wrap bands around the grip.
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const y = 0.60 - t * 0.29;
    const z = -0.21 - t * 0.09;
    b.ring(
      { at: [0, y, z], axis: [0, -0.96, -0.28] },
      { count: 10, radius: 0.067, fromDeg: 0, toDeg: 360 },
      (item) =>
        b.part(new THREE.CylinderGeometry(0.071, 0.071, 0.018, 10), GOLD, {
          frame: item,
          name: `grip.band${i}`,
          flat: true,
        }),
    );
  }

  // Pommel and counterweight, kept above the floor.
  cyl(0.11, 0.12, STEEL_LIGHT, [0, 0.18, -0.335], [0, 1, 0], "pommel.neck", 10);
  sphere(0.12, STEEL_DARK, [0, 0.095, -0.36], "pommel", [1.0, 0.72, 1.15]);
  cyl(0.075, 0.025, GOLD, [0, 0.105, -0.36], [0, 1, 0], "pommel.band", 10);
  sphere(0.043, RUBY, [0, 0.096, -0.438], "pommel.gem", [1, 0.8, 0.6]);

  // Crossguard wings, broad enough to read at a distance.
  b.extrude(
    [
      [-0.60, 0],
      [-0.49, 0.08],
      [-0.28, 0.10],
      [-0.20, 0.035],
      [-0.24, -0.055],
      [-0.48, -0.07],
    ],
    {
      at: [0, 0.72, -0.10],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.01,
      smoothing: 1,
      color: GOLD,
      name: "crossguard.wings",
    },
  );

  // Crossguard dark inset and wing studs.
  b.extrude(
    [
      [-0.47, 0.005],
      [-0.29, 0.055],
      [-0.26, 0.005],
      [-0.31, -0.035],
      [-0.45, -0.04],
    ],
    {
      at: [0, 0.72, -0.137],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: GOLD_DARK,
      name: "crossguard.insetL",
    },
  );
  b.extrude(
    [
      [0.47, 0.005],
      [0.29, 0.055],
      [0.26, 0.005],
      [0.31, -0.035],
      [0.45, -0.04],
    ],
    {
      at: [0, 0.72, -0.137],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: GOLD_DARK,
      name: "crossguard.insetR",
    },
  );

  sphere(0.035, RUBY, [-0.43, 0.73, -0.145], "crossguard.gemL");
  sphere(0.035, RUBY, [0.43, 0.73, -0.145], "crossguard.gemR");

  // Decorative rivets on receiver and guard.
  const rivets: [number, number, number][] = [
    [-0.13, 0.93, 0.26],
    [0.13, 0.93, 0.26],
    [-0.13, 0.75, 0.26],
    [0.13, 0.75, 0.26],
    [-0.23, 0.72, -0.13],
    [0.23, 0.72, -0.13],
  ];
  rivets.forEach((p, i) => sphere(0.018, GOLD_LIGHT, p, `rivet.${i}`));

  // Tiny black muzzle sight and gold sight bead.
  box([0.025, 0.075, 0.05], INK, [0, 1.02, 0.74], "frontSight");
  sphere(0.017, GOLD_LIGHT, [0, 1.065, 0.74], "frontSight.bead");

  return b.root;
}
