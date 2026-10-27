import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: a broad crystal-edged sword fused to a revolver mechanism, with a heavy guard, chamber, trigger, glowing materia, engraved fuller, and mechanical trim.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#343b4a";
  const DARK = "#151927";
  const EDGE = "#a9c8d8";
  const EDGE_HI = "#e7fbff";
  const BRASS = "#d49a3d";
  const BRASS_HI = "#f4cb68";
  const LEATHER = "#4e241f";
  const LEATHER_HI = "#8e4930";
  const INK = "#100d16";
  const CYAN = "#39e8ff";
  const CYAN_DARK = "#126b9a";
  const RED = "#d9343f";

  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      rotation,
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
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, sides: 8 });

  // Main blade silhouette, with a hooked gunblade tip and a broad angular shoulder.
  const blade = b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.25, 0.18],
      [0.22, 0.92],
      [0.13, 1.25],
      [0.08, 1.66],
      [0.02, 1.88, "sharp"],
      [-0.07, 1.67],
      [-0.14, 1.3],
      [-0.23, 0.92],
      [-0.26, 0.18],
    ],
    {
      at: V(0, 0.69, 0),
      x: [1, 0, 0],
      thickness: [0.105, 0.05],
      bevel: 0.012,
      smoothing: 0,
      color: STEEL,
      name: "blade.core",
    },
  );

  // Pale cutting edge on both sides.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [s * 0.205, 0.12],
        [s * 0.265, 0.2],
        [s * 0.225, 0.93],
        [s * 0.135, 1.28],
        [s * 0.075, 1.68],
        [s * 0.018, 1.87, "sharp"],
        [s * 0.055, 1.62],
        [s * 0.145, 1.22],
        [s * 0.205, 0.86],
      ],
      {
        at: V(0, 0.69, 0.058 * s),
        x: [1, 0, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: EDGE,
        name: `blade.edge.${s}`,
      },
    );
  }

  // Dark engraved fuller and central silver spine.
  b.extrude(
    [
      [-0.105, 0.22],
      [0.105, 0.22],
      [0.14, 0.42],
      [0.075, 1.25],
      [0.025, 1.63],
      [-0.025, 1.63],
      [-0.075, 1.25],
      [-0.14, 0.42],
    ],
    {
      at: V(0, 0.69, 0.064),
      x: [1, 0, 0],
      thickness: 0.012,
      color: DARK,
      name: "blade.fuller",
    },
  );

  b.extrude(
    [
      [-0.023, 0.2],
      [0.023, 0.2],
      [0.032, 0.55],
      [0.022, 1.45],
      [0.005, 1.73],
      [-0.012, 1.48],
      [-0.03, 0.55],
    ],
    {
      at: V(0, 0.69, 0.074),
      x: [1, 0, 0],
      thickness: 0.009,
      color: EDGE_HI,
      name: "blade.spine",
    },
  );

  // Decorative angled blade vents.
  for (let i = 0; i < 5; i++) {
    const y = 0.91 + i * 0.145;
    b.extrude(
      [
        [-0.055, 0],
        [0.055, 0],
        [0.025, 0.035],
        [-0.035, 0.035],
      ],
      {
        at: V(0, y, 0.082),
        x: [1, 0, 0],
        thickness: 0.008,
        color: i % 2 ? CYAN_DARK : CYAN,
        name: `blade.rune.${i}`,
      },
    );
  }

  // Serrated back saw teeth.
  for (let i = 0; i < 8; i++) {
    const y = 0.82 + i * 0.115;
    b.extrude(
      [
        [0, 0],
        [0.10, 0],
        [0.0, 0.075, "sharp"],
      ],
      {
        at: V(-0.245, y, 0.01),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.025,
        color: EDGE,
        name: `blade.saw.${i}`,
      },
    );
  }

  // Gun body behind the lower blade: chunky receiver and octagonal cylinder.
  box([0.42, 0.28, 0.22], DARK, V(0, 0.82, -0.08), "receiver");
  box([0.33, 0.17, 0.24], STEEL, V(0, 0.97, -0.08), "receiver.top");
  box([0.16, 0.24, 0.28], BRASS, V(0, 0.77, -0.1), "receiver.plate");

  // Revolver chamber oriented toward the viewer (+Z).
  cyl(0.19, 0.18, DARK, V(0, 0.84, 0.07), "chamber", [Math.PI / 2, 0, 0], 10);
  cyl(0.145, 0.19, STEEL, V(0, 0.84, 0.17), "chamber.face", [Math.PI / 2, 0, 0], 10);
  cyl(0.055, 0.2, INK, V(0, 0.84, 0.25), "chamber.axle", [Math.PI / 2, 0, 0], 10);

  // Six visible brass chamber sockets, each with a dark bore.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.105;
    const y = 0.84 + Math.sin(a) * 0.105;
    cyl(0.035, 0.015, BRASS_HI, V(x, y, 0.275), `chamber.socket.${i}`, [Math.PI / 2, 0, 0], 8);
    cyl(0.018, 0.018, INK, V(x, y, 0.286), `chamber.bore.${i}`, [Math.PI / 2, 0, 0], 8);
  }

  // Brass chamber ring and central glowing materia.
  cyl(0.172, 0.018, BRASS, V(0, 0.84, 0.282), "chamber.rim", [Math.PI / 2, 0, 0], 10);
  const materia = sphere(0.047, CYAN, V(0, 0.84, 0.302), "materia.core", [1, 1, 0.45]);
  glow(materia, 2.2);
  sphere(0.018, EDGE_HI, V(-0.014, 0.855, 0.322), "materia.spark");

  // Barrel running up the right side of the blade.
  rod(V(0.14, 0.93, -0.045), V(0.14, 1.63, -0.045), 0.045, DARK, "barrel");
  cyl(0.061, 0.15, BRASS, V(0.14, 1.61, -0.045), "barrel.muzzle", [0, 0, 0], 8);
  cyl(0.039, 0.17, INK, V(0.14, 1.62, -0.045), "barrel.bore", [0, 0, 0], 8);
  box([0.08, 0.035, 0.12], BRASS_HI, V(0.14, 1.51, -0.045), "barrel.band");
  box([0.07, 0.035, 0.11], BRASS_HI, V(0.14, 1.22, -0.045), "barrel.band.lower");

  // Angular guard.
  b.extrude(
    [
      [-0.48, 0],
      [-0.32, 0.08],
      [-0.16, 0.18],
      [0.16, 0.18],
      [0.32, 0.08],
      [0.48, 0],
      [0.42, -0.09],
      [0.2, -0.04],
      [-0.2, -0.04],
      [-0.42, -0.09],
    ],
    {
      at: V(0, 0.59, 0),
      x: [1, 0, 0],
      thickness: 0.15,
      bevel: 0.015,
      color: BRASS,
      name: "crossguard",
    },
  );
  box([0.34, 0.045, 0.17], BRASS_HI, V(0, 0.68, 0.02), "guard.highlight");
  for (const s of [-1, 1]) {
    sphere(0.045, EDGE_HI, V(s * 0.405, 0.59, 0.09), `guard.gem.${s}`, [1, 1, 0.45]);
    box([0.035, 0.12, 0.2], DARK, V(s * 0.28, 0.54, 0), `guard.cutout.${s}`, [0, 0, s * 0.35]);
  }

  // Grip and pommel.
  box([0.19, 0.42, 0.18], DARK, V(0, 0.29, 0), "grip.core");
  box([0.205, 0.055, 0.195], BRASS, V(0, 0.49, 0), "grip.collar");
  box([0.205, 0.055, 0.195], BRASS, V(0, 0.09, 0), "grip.pommel");
  for (let i = 0; i < 5; i++) {
    const y = 0.14 + i * 0.072;
    b.sweep(
      [
        V(-0.105, y - 0.025, 0.03),
        V(0.105, y + 0.025, 0.03),
      ],
      0.012,
      { color: LEATHER_HI, caps: "flat", name: `grip.wrap.${i}`, sides: 6 },
    );
  }
  box([0.24, 0.11, 0.22], BRASS, V(0, 0.035, 0), "pommel");
  sphere(0.07, CYAN, V(0, 0.005, 0.1), "pommel.materia", [1, 1, 0.55]);
  glow(
    b.part(new THREE.SphereGeometry(0.052, 10, 6), CYAN, {
      at: V(0, 0.005, 0.106),
      scale: [1, 1, 0.4],
      name: "pommel.glow",
    }),
    1.8,
  );

  // Trigger guard and trigger.
  b.sweep(
    [
      V(-0.105, 0.55, 0.12),
      V(-0.13, 0.45, 0.17),
      V(-0.07, 0.36, 0.17),
      V(0.07, 0.36, 0.17),
      V(0.105, 0.55, 0.12),
    ],
    0.018,
    { color: BRASS, caps: "round", name: "trigger.guard", sides: 6 },
  );
  rod(V(0, 0.49, 0.18), V(0, 0.39, 0.2), 0.018, RED, "trigger");
  sphere(0.025, BRASS_HI, V(0, 0.385, 0.2), "trigger.tip");

  // Side plates, screws, and small mechanical seams.
  for (const s of [-1, 1]) {
    box([0.3, 0.18, 0.018], BRASS, V(0, 0.91, s * 0.13), `side.plate.${s}`);
    for (let i = 0; i < 4; i++) {
      const x = -0.11 + i * 0.073;
      cyl(0.014, 0.012, BRASS_HI, V(x, 0.91, s * 0.145), `side.rivet.${s}.${i}`, [Math.PI / 2, 0, 0], 8);
    }
  }

  // Raised blue runic marks on the blade shoulder.
  for (let i = 0; i < 4; i++) {
    const x = -0.12 + i * 0.08;
    const rune = b.extrude(
      [
        [0, 0],
        [0.045, 0.012],
        [0.012, 0.028],
        [0.0, 0.016],
      ],
      {
        at: V(x, 1.02 + (i % 2) * 0.08, 0.09),
        x: [1, 0, 0],
        thickness: 0.008,
        color: i % 2 ? CYAN : EDGE_HI,
        name: `rune.shoulder.${i}`,
      },
    );
    glow(rune, 0.9);
  }

  // A short hanging cable gives the weapon a recognizable mechanical silhouette.
  b.sweep(
    [
      V(-0.18, 0.98, -0.15),
      V(-0.29, 0.88, -0.16),
      V(-0.25, 0.72, -0.16),
    ],
    0.012,
    { color: LEATHER, caps: "round", name: "cable", sides: 6 },
  );
  sphere(0.035, BRASS, V(-0.25, 0.7, -0.16), "cable.weight");

  // Fine edge studs along the lower blade.
  for (let i = 0; i < 5; i++) {
    const y = 0.73 + i * 0.075;
    sphere(0.014, BRASS_HI, V(0.225, y, 0.09), `edge.stud.${i}`, [1, 1, 0.5]);
  }

  // A dark floor-contact cap keeps the weapon planted while reading as a display piece.
  cyl(0.14, 0.035, DARK, V(0, 0.018, 0), "display.contact", [0, 0, 0], 8);
  cyl(0.105, 0.018, BRASS, V(0, 0.039, 0), "display.contact.trim", [0, 0, 0], 8);

  return b.root;
}
