```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { gearGeometry, gearTrain, metal, panelled, TINT } from "agentic-3js-builder/kits/clockwork";
import { cel, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "gunblade",
  description: "A stylized Final Fantasy-inspired gunblade with a brutal broad blade, revolver receiver, glowing materia, guard, vents, gears, and a wrapped grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const root = b.joint("weaponRoot", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "weapon",
  });

  const STEEL = metal("steel", { polish: 0.62, tarnish: 0.16, size: 0.11, seed: 7 });
  const DARK_STEEL = metal("iron", { polish: 0.28, tarnish: 0.2, size: 0.09, seed: 12 });
  const BRASS = metal("brass", { polish: 0.72, tarnish: 0.15, verdigris: 0.08, seed: 4 });
  const COPPER = metal("copper", { polish: 0.48, tarnish: 0.12, seed: 8 });
  const GOLD = metal("gilt", { polish: 0.8, seed: 3 });
  const RED = cel("#b51f2d", "#491325");
  const BLUE = "#46cfff";
  const BLUE_DARK = "#1260a0";
  const RUBY = "#e52b45";
  const LEATHER = cel("#38231e", "#160f14");
  const GRIP = cel("#d7a04e", "#563420");

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: root,
      at,
      flat: true,
      ...extra,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    segments = 10,
    dir: [number, number, number] = [0, 1, 0],
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone: root,
      at,
      dir,
      flat: true,
      ...extra,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    segments = 10,
    extra: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.7))), color, {
      bone: root,
      at,
      flat: true,
      ...extra,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    extra: any = {},
  ) => b.rod(a, c, radius, { bone: root, color, section: { ngon: 6 }, ...extra });

  // Main blade: a high, angular gunblade silhouette with a hooked cutting edge.
  const blade = b.extrude(
    [
      [-0.105, 0.00],
      [0.105, 0.00],
      [0.145, 0.22],
      [0.125, 0.73],
      [0.20, 1.00],
      [0.115, 1.24],
      [0.035, 1.57],
      [0.000, 1.78, "sharp"],
      [-0.045, 1.50],
      [-0.145, 1.13],
      [-0.19, 0.74],
      [-0.125, 0.22],
    ],
    {
      bone: root,
      at: [0, 0.56, 0.22],
      x: [1, 0, 0],
      y: [0, 0.985, 0.17],
      thickness: [0.075, 0.035],
      bevel: 0.012,
      smoothing: 0,
      color: panelled(STEEL, { size: 0.16, aspect: 0.5, rivets: 0.055 }),
      name: "blade",
      group: "blade",
    },
  );

  // Dark fuller and sharp silver edge, both following the blade's long axis.
  b.extrude(
    [
      [-0.025, 0.12],
      [0.025, 0.12],
      [0.055, 1.34],
      [0.000, 1.60],
      [-0.055, 1.34],
    ],
    {
      bone: root,
      at: [0, 0.585, 0.225],
      x: [1, 0, 0],
      y: [0, 0.985, 0.17],
      thickness: 0.012,
      bevel: 0.003,
      color: DARK_STEEL,
      name: "bladeFuller",
      group: "blade",
    },
  );

  b.extrude(
    [
      [-0.012, 0.04],
      [0.012, 0.04],
      [0.055, 1.35],
      [0.000, 1.72],
      [-0.055, 1.35],
    ],
    {
      bone: root,
      at: [0, 0.615, 0.235],
      x: [1, 0, 0],
      y: [0, 0.985, 0.17],
      thickness: 0.008,
      bevel: 0.002,
      color: "#d9e9f2",
      name: "bladeEdge",
      group: "blade",
    },
  );

  // Blade shoulder, red inset, and decorative gold spine.
  box([0.34, 0.09, 0.18], [0, 0.73, 0.14], DARK_STEEL);
  box([0.205, 0.025, 0.11], [0, 0.78, 0.245], RED);
  rod([-0.075, 0.73, 0.26], [-0.075, 1.92, 0.46], 0.012, GOLD);
  rod([0.075, 0.73, 0.26], [0.075, 1.92, 0.46], 0.009, BRASS);

  // Heavy revolver receiver below the blade.
  box([0.34, 0.24, 0.58], [0, 0.64, -0.02], panelled(DARK_STEEL, { size: 0.13, rivets: 0.04 }), {
    name: "receiver",
    group: "gun",
  });
  box([0.28, 0.14, 0.23], [0, 0.79, 0.20], STEEL, { name: "upperHousing", group: "gun" });
  box([0.22, 0.16, 0.18], [0, 0.50, -0.22], DARK_STEEL, { name: "lowerHousing", group: "gun" });

  // Muzzle and barrel pointing toward the weapon's front.
  cyl(0.105, 0.42, [0, 0.72, 0.47], DARK_STEEL, 10, [0, 0, 1], {
    name: "barrel",
    group: "gun",
  });
  cyl(0.073, 0.46, [0, 0.72, 0.68], STEEL, 8, [0, 0, 1]);
  cyl(0.115, 0.06, [0, 0.72, 0.91], BRASS, 10, [0, 0, 1]);
  cyl(0.068, 0.07, [0, 0.72, 0.95], INK, 10, [0, 0, 1]);
  box([0.26, 0.055, 0.11], [0, 0.85, 0.38], BRASS);
  box([0.26, 0.055, 0.11], [0, 0.59, 0.38], BRASS);

  // Side plates and a bold red insignia.
  box([0.028, 0.17, 0.34], [0.185, 0.67, 0.00], BRASS);
  box([0.028, 0.17, 0.34], [-0.185, 0.67, 0.00], BRASS);
  b.extrude(
    [
      [-0.07, 0],
      [0.07, 0],
      [0.055, 0.13],
      [0, 0.19, "sharp"],
      [-0.055, 0.13],
    ],
    {
      bone: root,
      at: [0.205, 0.60, -0.18],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: RED,
      name: "sideSigil",
      group: "ornament",
    },
  );

  // Revolver cylinder with six chambers.
  cyl(0.145, 0.16, [0, 0.66, -0.12], BRASS, 12, [1, 0, 0], {
    name: "cylinder",
    group: "gun",
  });
  cyl(0.072, 0.19, [0, 0.66, -0.12], DARK_STEEL, 10, [1, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const y = 0.66 + Math.cos(a) * 0.092;
    const z = -0.12 + Math.sin(a) * 0.092;
    cyl(0.018, 0.19, [0, y, z], INK, 6, [1, 0, 0]);
  }

  // Small clockwork train inset in the left side.
  gearTrain(b, {
    at: [0.205, 0.69, 0.10],
    axis: [1, 0, 0],
    up: [0, 1, 0],
    module: 0.009,
    style: "solid",
    spin: "gear",
    bone: root,
    group: "mechanism",
    arbor: BRASS,
    gears: [
      { teeth: 18, spokes: 5, color: BRASS, bore: 0.008 },
      { teeth: 10, angle: 125, color: TINT.copper, bore: 0.006 },
      { teeth: 14, from: 1, angle: -105, color: GOLD, holes: 5, bore: 0.006 },
    ],
  });

  // Guard across the grip, with angular quillons.
  box([0.62, 0.095, 0.105], [0, 0.42, 0.02], GOLD, { name: "crossguard", group: "guard" });
  b.spike([0.29, 0.43, 0.02], [0.95, 0.14, 0.05], 0.25, 0.045, {
    bone: root,
    color: BRASS,
    caps: "point",
  });
  b.spike([-0.29, 0.43, 0.02], [-0.95, 0.14, 0.05], 0.25, 0.045, {
    bone: root,
    color: BRASS,
    caps: "point",
  });
  sphere(0.065, [0, 0.43, 0.02], RUBY, 8);
  glow(sphere(0.035, [0, 0.43, 0.09], BLUE, 8), 2.5);

  // Grip and pommel, grounded at y ≈ 0.03.
  box([0.18, 0.47, 0.16], [0, 0.19, -0.06], LEATHER, {
    name: "gripCore",
    group: "grip",
  });
  for (let i = 0; i < 7; i++) {
    const y = 0.035 + i * 0.062;
    rod([-0.108, y, -0.06], [0.108, y + 0.025, -0.06], 0.014, GRIP);
  }
  cyl(0.135, 0.12, [0, -0.075, -0.06], BRASS, 10, [0, 1, 0], {
    name: "pommel",
    group: "grip",
  });
  sphere(0.075, [0, -0.14, -0.06], RUBY, 8);
  glow(sphere(0.042, [0, -0.14, 0.005], BLUE, 8), 2.2);

  // Trigger loop and trigger.
  b.sweep(
    [
      [-0.10, 0.49, -0.22],
      [-0.13, 0.39, -0.22],
      [-0.09, 0.32, -0.22],
      [0.09, 0.32, -0.22],
      [0.12, 0.43, -0.22],
    ],
    0.016,
    { bone: root, color: BRASS, section: { ngon: 6 }, caps: "round", name: "triggerGuard", group: "gun" },
  );
  rod([0, 0.48, -0.23], [0, 0.33, -0.27], 0.022, COPPER, { section: { ngon: 6 } });

  // Vent slots on the receiver, placed as glowing blue slits.
  for (let i = -2; i <= 2; i++) {
    const slit = box([0.045, 0.018, 0.13], [i * 0.065, 0.73, 0.275], BLUE_DARK);
    glow(slit, 1.5);
  }

  // Front-facing engraved rune card.
  const rune = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 5 L38 24 L57 32 L38 39 L32 59 L25 39 L7 32 L25 24 Z"
        fill="none" stroke="#7eeaff" stroke-width="4"/>
      <circle cx="32" cy="32" r="7" fill="#dfffff"/>
      <path d="M32 12V24M52 32H40M32 52V40M12 32H24" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const runePart = b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    bone: root,
    at: [0, 0.70, 0.305],
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    name: "rune",
    group: "ornament",
  });
  glow(runePart, 2.4);

  // Six small brass rivets around the receiver.
  for (const x of [-0.145, 0.145]) {
    for (const y of [0.55, 0.76, 0.82]) sphere(0.018, [x, y, 0.285], GOLD, 7);
  }

  // A slight blade-tip crystal gives the silhouette a fantasy focal point.
  const tip = b.slab(
    [
      [-0.055, 1.58, 0.40],
      [0, 1.82, 0.44],
      [0.055, 1.58, 0.40],
      [0, 1.48, 0.38],
    ],
    { bone: root, color: BLUE, thickness: 0.018, name: "tipCrystal", group: "magic" },
  );
  glow(tip, 1.8);

  return b.root;
}
```