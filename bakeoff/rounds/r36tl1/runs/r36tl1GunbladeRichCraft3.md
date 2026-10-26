```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { cel, furEdge, INK, animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Gunblade",
  description: "A stylized Final Fantasy-inspired gunblade with a broad jewel-edged sword, pistol receiver, barrel, trigger, guard, rivets, and ornate crimson detailing.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = cel("#aeb9c8", "#354052");
  const DARK_STEEL = cel("#465166", "#171d2a");
  const EDGE = cel("#e5edf5", "#697789");
  const BLACK = cel("#202533", "#090b12");
  const CRIMSON = cel("#c73549", "#5b1728");
  const GOLD = cel("#e6b84e", "#76531c");
  const BRASS = cel("#b98132", "#4c2e13");
  const LEATHER = cel("#55362d", "#201516");
  const GEM = "#55e6ff";
  const GEM_DARK = "#164d70";

  const root = b.joint("weaponRoot", {
    at: [0, 0.18, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    options: any = {},
  ) =>
    b.part(geometry, color, {
      bone: root,
      at,
      flat: true,
      ...options,
    });

  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    options: any = {},
  ) =>
    part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);

  const cyl = (
    radius: number,
    length: number,
    color: any,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    sides = 10,
    options: any = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, length, sides, 1),
      color,
      at,
      { dir, ...options },
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    options: any = {},
  ) => b.rod(a, z, radius, { bone: root, color, section: { ngon: 8 }, ...options });

  // Heavy pommel and pistol grip.
  cyl(0.105, 0.16, BLACK, [0, 0.245, 0], [0, 1, 0], 8);
  cyl(0.075, 0.42, LEATHER, [0, 0.49, 0], [0, 1, 0], 8);
  box([0.16, 0.045, 0.13], GOLD, [0, 0.29, 0.015]);
  box([0.15, 0.04, 0.12], GOLD, [0, 0.69, 0.015]);

  for (const y of [0.36, 0.44, 0.52, 0.60]) {
    cyl(0.084, 0.018, BRASS, [0, y, 0], [0, 1, 0], 8);
  }

  // Faceted pommel jewel.
  part(new THREE.OctahedronGeometry(0.075, 0), GEM, [0, 0.155, 0.01], {
    scale: [0.82, 1.15, 0.7],
  });
  glow(b.part(new THREE.OctahedronGeometry(0.038, 0), "#b9faff", {
    bone: root,
    at: [0, 0.16, 0.07],
    flat: true,
  }), 1.8);

  // Pistol-style trigger housing behind the grip.
  box([0.22, 0.30, 0.16], DARK_STEEL, [0, 0.78, -0.015]);
  box([0.26, 0.12, 0.18], BLACK, [0, 0.91, -0.015]);
  box([0.12, 0.25, 0.20], BLACK, [0, 0.79, 0.09]);

  // Trigger loop and trigger.
  const triggerLoop = new THREE.TorusGeometry(0.075, 0.014, 6, 12, Math.PI * 1.55);
  part(triggerLoop, GOLD, [0, 0.78, 0.12], {
    rotation: [Math.PI / 2, 0, 0],
  });
  rod([-0.015, 0.80, 0.13], [0.025, 0.70, 0.13], 0.017, BRASS);

  // Main receiver, deliberately asymmetrical like a fantasy firearm.
  box([0.34, 0.28, 0.24], DARK_STEEL, [0, 1.02, 0.03]);
  box([0.40, 0.085, 0.28], BLACK, [0, 1.17, 0.03]);
  box([0.10, 0.23, 0.29], GOLD, [0.17, 1.03, 0.035]);
  box([0.065, 0.16, 0.30], CRIMSON, [-0.18, 1.02, 0.04]);

  // Receiver side plates and decorative screws.
  for (const s of [-1, 1]) {
    box([0.018, 0.18, 0.20], GOLD, [s * 0.181, 1.04, 0.075]);
    for (const y of [0.965, 1.105]) {
      part(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8), GEM_DARK, [
        s * 0.195,
        y,
        0.08,
      ], { dir: [s, 0, 0] });
    }
  }

  // Gun barrel pointing toward the viewer/front, with concentric muzzle.
  rod([0, 1.14, 0.16], [0, 1.14, 0.55], 0.052, BLACK);
  rod([0, 1.14, 0.48], [0, 1.14, 0.66], 0.075, STEEL);
  cyl(0.09, 0.08, GOLD, [0, 1.14, 0.69], [0, 0, 1], 10);
  cyl(0.057, 0.09, BLACK, [0, 1.14, 0.735], [0, 0, 1], 10);
  part(new THREE.CircleGeometry(0.042, 10), GEM_DARK, [0, 1.14, 0.782], {
    dir: [0, 0, 1],
    axis: "z",
  });

  // Sight rail.
  box([0.055, 0.035, 0.30], GOLD, [0, 1.30, 0.18]);
  box([0.03, 0.10, 0.045], GOLD, [0, 1.35, 0.12]);
  box([0.03, 0.13, 0.045], GOLD, [0, 1.365, 0.48]);

  // Broad sword guard: winged, swept, and centered at the receiver.
  box([0.72, 0.075, 0.13], GOLD, [0, 1.27, 0.015]);
  part(
    b.extrude(
      [
        [0, 0],
        [0.18, 0],
        [0.29, 0.075],
        [0.22, 0.17],
        [0.08, 0.13],
        [0, 0.06],
      ],
      {
        at: [0.25, 1.22, 0],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: CRIMSON,
        bone: root,
      },
    ).mesh.geometry,
    CRIMSON,
    [0, 0, 0],
    { at: [0, 0, 0], bone: root },
  );
  part(
    b.extrude(
      [
        [0, 0],
        [0.18, 0],
        [0.29, 0.075],
        [0.22, 0.17],
        [0.08, 0.13],
        [0, 0.06],
      ],
      {
        at: [-0.25, 1.22, 0],
        x: [-1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: CRIMSON,
        bone: root,
      },
    ).mesh.geometry,
    CRIMSON,
    [0, 0, 0],
    { at: [0, 0, 0], bone: root },
  );

  // Blade silhouette, a long angular fantasy greatsword.
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.12, 0],
    [0.13, 0],
    [0.18, 0.15],
    [0.14, 0.55],
    [0.20, 0.92],
    [0.08, 1.23],
    [0.02, 1.48],
    [-0.025, 1.65],
    [-0.08, 1.48],
    [-0.22, 1.20],
    [-0.17, 0.88],
    [-0.22, 0.55],
    [-0.16, 0.16],
  ];
  const blade = b.extrude(bladeOutline, {
    at: [0, 1.30, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.075, 0.035],
    bevel: 0.014,
    color: STEEL,
    bone: root,
    name: "heroBlade",
    group: "blade",
  });

  // Central fuller and bright edge strips.
  box([0.045, 1.22, 0.018], DARK_STEEL, [0, 1.91, 0.045]);
  box([0.026, 1.18, 0.022], EDGE, [0.145, 1.89, 0.052]);
  box([0.026, 1.10, 0.022], EDGE, [-0.145, 1.85, 0.052]);

  // Blade-mounted red inlay.
  const rune = svg(
    `<svg viewBox="0 0 64 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L49 45 L32 81 L45 119 L22 160 L39 198 L32 248 L25 198 L42 160 L19 119 L32 81 L15 45Z"
        fill="#ff6171" stroke="#3b0e20" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="32" cy="119" r="8" fill="#fff2b0"/>
    </svg>`,
    { size: 256 },
  );
  part(new THREE.PlaneGeometry(0.075, 0.62), "#ffffff", [0, 1.58, 0.058], {
    texture: rune,
    dir: [0, 0, 1],
    axis: "z",
    name: "bladeRune",
  });

  // Blade shoulder bolts and crown ornament.
  for (const s of [-1, 1]) {
    part(new THREE.SphereGeometry(0.035, 8, 5), GOLD, [s * 0.18, 1.34, 0.065]);
    rod([s * 0.16, 1.38, 0.07], [s * 0.10, 1.53, 0.07], 0.012, BRASS);
  }

  // Decorative spine teeth along the back edge.
  for (let i = 0; i < 7; i++) {
    const y = 1.43 + i * 0.16;
    b.spike(
      [-0.17, y, -0.01],
      [-0.25, y + 0.035, -0.01],
      null,
      0.018,
      { bone: root, color: GOLD, section: { ngon: 6 } },
    );
  }

  // Small hanging charm beneath the guard.
  rod([0, 1.25, -0.13], [0, 1.08, -0.13], 0.012, GOLD);
  part(new THREE.OctahedronGeometry(0.052, 0), GEM, [0, 1.02, -0.13]);
  part(new THREE.TorusGeometry(0.07, 0.009, 5, 10), GOLD, [0, 0.99, -0.13], {
    rotation: [Math.PI / 2, 0, 0],
  });

  // A few high-contrast micro details that sell the puppet-built weapon.
  for (const s of [-1, 1]) {
    box([0.025, 0.06, 0.025], CRIMSON, [s * 0.29, 1.265, 0.08]);
    box([0.025, 0.06, 0.025], GOLD, [s * 0.34, 1.275, 0.08]);
  }

  return b.root;
}
```