import * as THREE from "three";
import { createBuilder, svg, paint } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description: "A stylized Final Fantasy-inspired gunblade with a broad rune blade, brass gun mechanism, barrel, guard, and jeweled grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = cel("#9da9c5", "#30384c", { threshold: 0.18 });
  const DARK_STEEL = cel("#48516a", "#171b2c", { threshold: 0.12 });
  const EDGE = cel("#dfe8ff", "#66728d", { threshold: 0.2 });
  const GOLD = cel("#e6b84e", "#714018", { threshold: 0.2 });
  const COPPER = cel("#c96d3e", "#542315", { threshold: 0.16 });
  const GRIP = cel("#49395d", "#171329", { threshold: 0.12 });
  const LEATHER = cel("#9a493c", "#3b171d", { threshold: 0.1 });
  const GEM = "#39d9ff";
  const GEM_DARK = "#123d88";
  const RUNE = "#b9f7ff";

  const engraved = paint((p, n) => {
    const line = Math.abs(Math.sin(p.y * 47 + p.x * 13));
    return line > 0.965 && n.z > 0.35 ? GOLD : STEEL;
  });

  const runeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
      <defs>
        <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.45" stop-color="#80f4ff"/>
          <stop offset="1" stop-color="#1686d5"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <path d="M64 10 L82 43 L72 72 L101 101 L68 116 L88 149 L65 177 L74 218
               M64 10 L46 43 L56 72 L27 101 L60 116 L40 149 L63 177 L54 218
               M64 48 L64 202"
            stroke="#36dfff" stroke-width="12" opacity=".35" fill="none" filter="url(#g)"/>
      <path d="M64 10 L82 43 L72 72 L101 101 L68 116 L88 149 L65 177 L74 218
               M64 10 L46 43 L56 72 L27 101 L60 116 L40 149 L63 177 L54 218
               M64 48 L64 202"
            stroke="url(#r)" stroke-width="5" stroke-linecap="square" fill="none"/>
      <circle cx="64" cy="116" r="11" fill="#ffffff" stroke="#1686d5" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const crestTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64 8 L76 45 L116 51 L82 73 L91 113 L64 91 L37 113 L46 73 L12 51 L52 45 Z"
        fill="#f7d36a" stroke="#28182b" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="64" cy="61" r="15" fill="#45dfff" stroke="#28182b" stroke-width="6"/>
      <path d="M64 49 L69 59 L80 60 L71 67 L74 78 L64 72 L54 78 L57 67 L48 60 L59 59 Z"
        fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );

  const gemTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ffffff"/><stop offset=".28" stop-color="#8cffff"/>
        <stop offset=".7" stop-color="#24a8ff"/><stop offset="1" stop-color="#173bba"/>
      </linearGradient></defs>
      <path d="M32 3 L57 21 L47 55 L32 62 L17 55 L7 21 Z" fill="url(#g)" stroke="#baffff" stroke-width="3"/>
      <path d="M32 3 L32 62 M7 21 L57 21 M17 55 L47 55" stroke="#eaffff" stroke-width="2" fill="none" opacity=".8"/>
    </svg>`,
    { size: 96 },
  );

  // Broad hero blade: a faceted fantasy greatsword silhouette.
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
    [-0.115, 0],
    [-0.17, 0.12],
    [-0.16, 0.28],
    [-0.115, 0.38],
    [-0.145, 0.92],
    [-0.11, 1.12],
    [-0.07, 1.34],
    [0.0, 1.56, "sharp"],
    [0.07, 1.34],
    [0.11, 1.12],
    [0.145, 0.92],
    [0.115, 0.38],
    [0.16, 0.28],
    [0.17, 0.12],
    [0.115, 0],
  ];
  const blade = b.extrude(bladeOutline, {
    at: [0, 0.79, 0.045],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.012,
    smoothing: 0,
    color: engraved,
    name: "heroBlade",
    group: "blade",
  });

  // Bright bevel-like central fuller and lower ricasso plates.
  b.part(new THREE.BoxGeometry(0.027, 1.12, 0.014), EDGE, {
    at: [0, 1.34, 0.094],
    name: "bladeFuller",
    group: "blade",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.018, 0.018), GOLD, {
    at: [0, 1.03, 0.102],
    name: "bladeRivetBand",
    group: "blade",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.018, 0.018), GOLD, {
    at: [0, 1.18, 0.102],
    name: "bladeRivetBand2",
    group: "blade",
  });

  // Luminous rune laid on the broad front face.
  const rune = b.part(new THREE.PlaneGeometry(0.095, 0.56), RUNE, {
    at: [0, 1.27, 0.101],
    dir: [0, 0, 1],
    axis: "z",
    texture: runeTexture,
    name: "bladeRune",
    group: "magic",
  });
  glow(rune, 2.2);

  // Point guard / ricasso where sword and firearm meet.
  b.part(new THREE.BoxGeometry(0.26, 0.12, 0.16), DARK_STEEL, {
    at: [0, 0.74, 0.06],
    name: "ricasso",
    group: "blade",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.028, 0.19), GOLD, {
    at: [0, 0.795, 0.065],
    name: "ricassoTop",
    group: "ornament",
  });

  // Crossguard, with a strong angular silhouette.
  b.frustumBox([-0.38, 0.64, 0.015], [0.38, 0.64, 0.015], [0.075, 0.075], [0.055, 0.055], {
    color: GOLD,
    section: "box",
    name: "crossguard",
    group: "guard",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.15, 0.12), COPPER, {
    at: [-0.38, 0.64, 0.015],
    rotation: [0, 0, -18],
    name: "guardLeftCap",
    group: "guard",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.15, 0.12), COPPER, {
    at: [0.38, 0.64, 0.015],
    rotation: [0, 0, 18],
    name: "guardRightCap",
    group: "guard",
  });
  for (const x of [-0.25, 0.25]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8), EDGE, {
      at: [x, 0.64, 0.06],
      dir: [0, 0, 1],
      name: `guardBolt${x}`,
      group: "guard",
    });
  }

  // The gun body tucked beneath the blade.
  b.part(new THREE.BoxGeometry(0.18, 0.18, 0.28), DARK_STEEL, {
    at: [0, 0.69, 0.17],
    name: "gunReceiver",
    group: "firearm",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.11, 0.19), STEEL, {
    at: [0, 0.75, 0.30],
    name: "receiverTop",
    group: "firearm",
  });
  b.part(new THREE.BoxGeometry(0.11, 0.035, 0.22), GOLD, {
    at: [0, 0.835, 0.28],
    name: "receiverSpine",
    group: "ornament",
  });

  // Long octagonal barrel and muzzle brake facing +Z.
  b.rod([0, 0.70, 0.29], [0, 0.70, 0.82], 0.052, {
    color: STEEL,
    section: { ngon: 8 },
    name: "gunBarrel",
    group: "firearm",
  });
  b.part(new THREE.CylinderGeometry(0.085, 0.068, 0.10, 8), DARK_STEEL, {
    at: [0, 0.70, 0.84],
    dir: [0, 0, 1],
    name: "muzzleBrake",
    group: "firearm",
  });
  b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.108, 8), GEM_DARK, {
    at: [0, 0.70, 0.895],
    dir: [0, 0, 1],
    name: "muzzleBore",
    group: "firearm",
  });
  const muzzleGlow = b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.112, 8), GEM, {
    at: [0, 0.70, 0.9],
    dir: [0, 0, 1],
    name: "muzzleEnergy",
    group: "magic",
  });
  glow(muzzleGlow, 2.5);

  // Side-mounted chamber and ornate circular plate.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.045, 12), COPPER, {
    at: [0.105, 0.72, 0.28],
    dir: [1, 0, 0],
    name: "chamber",
    group: "firearm",
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.052, 12), GOLD, {
    at: [0.13, 0.72, 0.28],
    dir: [1, 0, 0],
    name: "chamberPlate",
    group: "ornament",
  });
  b.part(new THREE.CircleGeometry(0.055, 12), GEM, {
    at: [0.158, 0.72, 0.28],
    dir: [1, 0, 0],
    axis: "z",
    rotation: [0, Math.PI / 2, 0],
    texture: gemTexture,
    name: "chamberGem",
    group: "magic",
  });
  const chamberGlow = b.surface(b.root).nearest([0.158, 0.72, 0.28]);
  void chamberGlow;

  // Trigger guard and trigger.
  b.rod([-0.075, 0.57, 0.16], [0.075, 0.57, 0.16], 0.014, {
    color: GOLD,
    name: "triggerGuard",
    group: "firearm",
  });
  b.rod([0.0, 0.57, 0.16], [0.0, 0.51, 0.19], 0.012, {
    color: COPPER,
    name: "trigger",
    group: "firearm",
  });

  // Heavy wrapped grip, tilted backward for a weapon-like resting stance.
  b.rod([0, 0.57, -0.02], [0, 0.19, -0.17], 0.072, {
    color: GRIP,
    section: { ngon: 6 },
    name: "gripCore",
    group: "grip",
  });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const y = 0.51 - t * 0.29;
    const z = -0.045 - t * 0.10;
    b.rod([-0.078, y, z], [0.078, y, z], 0.014, {
      color: LEATHER,
      section: { ngon: 6 },
      name: `gripWrap${i}`,
      group: "grip",
    });
  }
  b.rod([-0.082, 0.585, -0.02], [0.082, 0.585, -0.02], 0.018, {
    color: GOLD,
    name: "gripCollar",
    group: "ornament",
  });
  b.rod([-0.078, 0.18, -0.17], [0.078, 0.18, -0.17], 0.024, {
    color: GOLD,
    name: "pommelCollar",
    group: "ornament",
  });

  // Faceted pommel and inset crest.
  b.part(new THREE.SphereGeometry(0.105, 8, 6), COPPER, {
    at: [0, 0.085, -0.2],
    scale: [1, 1.12, 0.9],
    name: "pommel",
    group: "grip",
  });
  b.part(new THREE.PlaneGeometry(0.105, 0.105), "#ffffff", {
    at: [0, 0.085, -0.295],
    dir: [0, 0, -1],
    axis: "z",
    texture: crestTexture,
    name: "pommelCrest",
    group: "ornament",
  });

  // Small studs along the receiver and guard make the silhouette feel machined.
  const studPositions = [
    [-0.095, 0.67, 0.12],
    [0.095, 0.67, 0.12],
    [-0.095, 0.78, 0.16],
    [0.095, 0.78, 0.16],
    [-0.19, 0.64, 0.02],
    [0.19, 0.64, 0.02],
  ];
  for (let i = 0; i < studPositions.length; i++) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
      at: studPositions[i],
      name: `rivet${i}`,
      group: "ornament",
    });
  }

  // A narrow glowing sight line on top of the barrel.
  const sight = b.part(new THREE.BoxGeometry(0.018, 0.018, 0.43), GEM, {
    at: [0, 0.816, 0.52],
    name: "energySight",
    group: "magic",
  });
  glow(sight, 1.8);

  return b.root;
}
