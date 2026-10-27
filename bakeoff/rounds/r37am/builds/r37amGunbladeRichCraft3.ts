import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { metal, panelled, gaugeTexture, TINT } from "../../../../kits/clockwork";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description: "A stylized Final Fantasy-inspired gunblade with a broad rune blade, revolver receiver, guard, wrapped grip, and glowing blue edge."
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.55, tarnish: 0.18, size: 0.11, seed: 4 });
  const DARK_STEEL = metal("iron", { polish: 0.22, tarnish: 0.35, size: 0.08, seed: 8 });
  const BRASS = metal("brass", { polish: 0.48, tarnish: 0.18, size: 0.06, seed: 2 });
  const GOLD = metal("gilt", { polish: 0.72, tarnish: 0.08, size: 0.05, seed: 9 });
  const COPPER = metal("copper", { polish: 0.3, verdigris: 0.08, size: 0.07, seed: 5 });
  const LEATHER = cel("#392331", "#171321");
  const LEATHER_RED = cel("#752d36", "#321522");
  const BLUE = "#2fdcff";
  const BLUE_DARK = "#0876b7";
  const WHITE = "#f5f0dc";
  const RED = "#d82e3c";

  const bladeMark = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 10 L78 83 L111 111 L78 116 L64 246 L50 116 L17 111 L50 83 Z"
        fill="#bffaff" stroke="#093c72" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 35 L64 218 M43 108 L85 108" stroke="#ffffff" stroke-width="4" opacity=".9"/>
      <circle cx="64" cy="108" r="8" fill="#ffffff" stroke="#063d77" stroke-width="4"/>
    </svg>`,
    { size: 256 }
  );

  const hazard = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#17131b"/>
      <path d="M-15 64 L25 0 H47 L7 64 M39 64 L79 0 H101 L61 64 M93 64 L133 0 H155 L115 64"
        fill="#e3ad3d"/>
      <path d="M0 4 H128 M0 60 H128" stroke="#f2d06b" stroke-width="4"/>
    </svg>`,
    { size: 128 }
  );

  const crest = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 5 L75 45 L119 64 L75 75 L64 123 L53 75 L9 64 L53 45 Z"
        fill="#d7faff" stroke="#14345f" stroke-width="7"/>
      <circle cx="64" cy="64" r="13" fill="#2cceff" stroke="#10284f" stroke-width="5"/>
    </svg>`,
    { size: 192 }
  );

  const gauge = gaugeTexture({ label: "LIMIT", needle: 38, face: "#e9dfbd", size: 192 });

  const extrude = (
    outline: [number, number, "sharp"][] | [number, number][],
    at: [number, number, number],
    thickness: number,
    color: any,
    name: string,
    bevel = 0
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      name,
      group: "gunblade"
    });

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    name: string,
    extra: Record<string, any> = {}
  ) => b.part(geometry, color, { at, name, group: "gunblade", ...extra });

  // Main blade: a huge angular Final Fantasy silhouette, standing on the guard.
  const blade = extrude(
    [
      [-0.16, 0.82, "sharp"],
      [0.23, 0.87, "sharp"],
      [0.30, 1.50, "sharp"],
      [0.25, 2.00, "sharp"],
      [0.08, 2.46, "sharp"],
      [0.00, 2.67, "sharp"],
      [-0.08, 2.46, "sharp"],
      [-0.28, 2.03, "sharp"],
      [-0.33, 1.44, "sharp"]
    ],
    [0, 0, 0],
    0.095,
    STEEL,
    "heroBlade",
    0.012
  );

  // Dark inset face and luminous fuller.
  extrude(
    [
      [-0.08, 0.96, "sharp"],
      [0.17, 1.02, "sharp"],
      [0.18, 1.52, "sharp"],
      [0.11, 2.18, "sharp"],
      [0.02, 2.48, "sharp"],
      [-0.10, 2.10, "sharp"],
      [-0.18, 1.50, "sharp"]
    ],
    [0, 0, 0.052],
    0.012,
    DARK_STEEL,
    "bladeInset",
    0.004
  );

  const edge = extrude(
    [
      [-0.30, 1.43, "sharp"],
      [-0.25, 1.98, "sharp"],
      [-0.08, 2.48, "sharp"],
      [0.00, 2.66, "sharp"],
      [0.04, 2.46, "sharp"],
      [0.16, 2.00, "sharp"],
      [0.20, 1.47, "sharp"],
      [0.14, 1.52, "sharp"],
      [0.02, 2.22, "sharp"],
      [-0.12, 1.57, "sharp"]
    ],
    [0, 0, 0.065],
    0.012,
    BLUE,
    "energyEdge",
    0.002
  );
  glow(edge, 2.2);

  // Blade insignia, visible on the front plane.
  const bladeDecal = part(
    new THREE.PlaneGeometry(0.24, 0.48),
    "#ffffff",
    [0.015, 1.70, 0.073],
    "bladeSigil",
    { dir: [0, 0, 1], axis: "z", texture: bladeMark }
  );
  glow(bladeDecal, 1.4);

  // Angular gold spine and shoulder plates.
  extrude(
    [
      [-0.24, 0.91, "sharp"],
      [-0.18, 1.02, "sharp"],
      [-0.13, 1.90, "sharp"],
      [-0.06, 2.31, "sharp"],
      [-0.01, 2.48, "sharp"],
      [-0.04, 2.20, "sharp"],
      [-0.18, 1.76, "sharp"]
    ],
    [0, 0, 0.082],
    0.009,
    GOLD,
    "goldBladeSpine",
    0.002
  );

  // Blade teeth and machined vents.
  for (let i = 0; i < 7; i++) {
    const y = 1.22 + i * 0.16;
    extrude(
      [[0, 0, "sharp"], [0.075, 0.035, "sharp"], [0.005, 0.065, "sharp"]],
      [-0.315, y, 0.01],
      0.11,
      DARK_STEEL,
      `bladeTooth${i}`
    );
  }
  for (let i = 0; i < 5; i++) {
    part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8),
      BLUE_DARK,
      [-0.20, 1.16 + i * 0.17, 0.083],
      `bladeVent${i}`,
      { dir: [0, 0, 1] }
    );
  }

  // Heavy revolver-like receiver at the blade root.
  part(
    new THREE.BoxGeometry(0.46, 0.34, 0.25),
    panelled(DARK_STEEL, { size: 0.10, rivets: 0.045 }),
    [0, 0. ninety ?? 0, 0]
  );
}
