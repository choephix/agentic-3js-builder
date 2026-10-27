import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade with a broad luminous blade, revolver receiver, guard, and wrapped grip."
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.55, tarnish: 0.18, size: 0.11, seed: 4 });
  const DARK_STEEL = metal("iron", { polish: 0.22, tarnish: 0.35, size: 0.08, seed: 8 });
  const BRASS = metal("brass", { polish: 0.48, tarnish: 0.18, size: 0.06, seed: 2 });
  const GOLD = metal("gilt", { polish: 0.72, tarnish: 0.08, size: 0.05, seed: 9 });
  const LEATHER = "#392331";
  const RED = "#d82e3c";
  const BLUE = "#2fdcff";
  const BLUE_DARK = "#0876b7";
  const WHITE = "#f5f0dc";

  const bladeMark = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 10 L78 83 L111 111 L78 116 L64 246 L50 116 L17 111 L50 83 Z"
        fill="#bffaff" stroke="#093c72" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 35 L64 218 M43 108 L85 108"
        stroke="#ffffff" stroke-width="4" opacity=".9"/>
      <circle cx="64" cy="108" r="8" fill="#ffffff" stroke="#063d77" stroke-width="4"/>
    </svg>`,
    { size: 256 }
  );

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    name: string,
    options: Record<string, any> = {}
  ) =>
    b.part(geometry, color, {
      at,
      name,
      group: "gunblade",
      ...options
    });

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

  const energyEdge = extrude(
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
  glow(energyEdge, 2.2);

  const sigil = part(
    new THREE.PlaneGeometry(0.24, 0.48),
    WHITE,
    [0.015, 1.70, 0.073],
    "bladeSigil",
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: bladeMark
    }
  );
  glow(sigil, 1.4);

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

  for (let i = 0; i < 7; i++) {
    const y = 1.22 + i * 0.16;
    extrude(
      [
        [0, 0, "sharp"],
        [0.075, 0.035, "sharp"],
        [0.005, 0.065, "sharp"]
      ],
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

  part(
    new THREE.BoxGeometry(0.46, 0.34, 0.25),
    panelled(DARK_STEEL, { size: 0.10, rivets: 0.045 }),
    [0, 0.73, 0],
    "receiver"
  );

  part(
    new THREE.BoxGeometry(0.34, 0.22, 0.29),
    STEEL,
    [0, 0.87, 0],
    "receiverTop"
  );

  part(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12),
    DARK_STEEL,
    [0, 0.72, 0.17],
    "cylinder",
    { dir: [0, 0, 1] }
  );

  part(
    new THREE.CylinderGeometry(0.055, 0.055, 0.10, 10),
    BRASS,
    [0, 0.72, 0.22],
    "cylinderHub",
    { dir: [0, 0, 1] }
  );

  part(
    new THREE.BoxGeometry(0.08, 0.28, 0.12),
    BRASS,
    [0, 0.73, 0.29],
    "muzzle"
  );

  part(
    new THREE.BoxGeometry(0.12, 0.34, 0.055),
    GOLD,
    [0, 0.74, 0.15],
    "receiverCrest"
  );

  for (const s of [-1, 1]) {
    part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.32, 8),
      BRASS,
      [s * 0.19, 0.74, 0],
      `receiverRivetRail${s}`,
      { dir: [0, 1, 0] }
    );

    part(
      new THREE.SphereGeometry(0.035, 8, 6),
      GOLD,
      [s * 0.19, 0.82, 0.14],
      `receiverRivet${s}`
    );
  }

  extrude(
    [
      [-0.40, 0.60, "sharp"],
      [-0.25, 0.67, "sharp"],
      [0.25, 0.67, "sharp"],
      [0.40, 0.60, "sharp"],
      [0.28, 0.52, "sharp"],
      [-0.28, 0.52, "sharp"]
    ],
    [0, 0, 0],
    0.075,
    GOLD,
    "crossguard",
    0.008
  );

  part(
    new THREE.BoxGeometry(0.21, 0.62, 0.20),
    LEATHER,
    [0, 0.27, -0.01],
    "grip"
  );

  for (let i = 0; i < 6; i++) {
    const y = 0.05 + i * 0.095;
    part(
      new THREE.TorusGeometry(0.115, 0.014, 6, 12),
      RED,
      [0, y, -0.01],
      `gripWrap${i}`,
      { rotation: [90, 0, 0] }
    );
  }

  part(
    new THREE.BoxGeometry(0.28, 0.20, 0.24),
    DARK_STEEL,
    [0, -0.08, -0.01],
    "pommel"
  );

  part(
    new THREE.SphereGeometry(0.12, 10, 8),
    BRASS,
    [0, -0.18, 0.03],
    "pommelGem"
  );

  part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.012, 12),
    RED,
    [0, 0.92, 0.132],
    "statusLens",
    { dir: [0, 0, 1] }
  );

  return b.root;
}
