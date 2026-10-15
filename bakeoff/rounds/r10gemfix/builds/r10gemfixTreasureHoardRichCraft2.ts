import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  bezier,
  catmull,
  paint,
  grain,
  mottle,
  svg,
  rng,
  aim,
  mid,
  mix,
  smoothstep,
  noise,
  rgb,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A legendary League-of-Legends-style heroic fantasy treasure hoard featuring an ornate open vault chest, an imperial gem-studded crown, gold bullion, overflowing coin mounds, and radiant glowing arcanite crystals.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasure_hoard", detail: 1 });
  const random = rng(777);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PAINTS (League of Legends Hand-Painted Fantasy Style)
  // ---------------------------------------------------------------------------
  const KEY_LIGHT = new THREE.Vector3(0.4, 0.85, 0.45).normalize();

  // League Stylized Gold: warm amber crevice shadows, rich honey-gold midtones, bright champagne edge glints
  const GOLD_PAINT = paint((p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.2, 0.7, ndotl);
    const brush = noise(p, 0.04, 11) * 0.15;
    const base = mix("#6e380a", "#f3b928", lit + brush);
    const rim = smoothstep(0.65, 0.95, ndotl) * smoothstep(0.2, 0.8, n.y);
    return mix(base, "#fff5b8", rim * 0.75);
  });

  // Dark Bog-Oak Chest Wood: rich mahogany/ironwood grain with edge darkening
  const WOOD_PAINT = grain("#24110b", "#4a2417", {
    size: 0.025,
    axis: "y",
    seed: 4,
  });

  // Weathered Heavy Iron / Midnight Steel: blue-grey specular rims on charcoal
  const IRON_PAINT = paint((_p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.1, 0.8, ndotl);
    const rim = smoothstep(0.5, 0.9, n.y) * 0.35;
    return mix("#1b1e26", "#455066", lit + rim);
  });

  // Dais Stone Flagstone: cool purple-grey slate with subtle mottling
  const STONE_PAINT = mottle("#201e28", "#383647", {
    size: 0.08,
    contrast: 1.2,
    seed: 9,
  });

  // Royal Velvet (Runner & Crown Cap): opulent Noxus crimson with warm rose rim
  const VELVET_RED = paint((_p, n) => {
    const rim = 1 - Math.max(0, n.dot(KEY_LIGHT));
    return mix("#630914", "#a31828", smoothstep(0.3, 0.9, rim));
  });

  // Shimmering Coin Mound Paint: dense sparkling gold micro-cells
  const COIN_HEAP_PAINT = paint((p, n) => {
    const spec = noise(p, 0.015, 101);
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.1, 0.6, ndotl);
    const shimmer = smoothstep(0.55, 0.85, spec);
    const gold = mix("#7a3b09", "#fabc24", lit);
    return mix(gold, "#fff9c9", shimmer * 0.65);
  });

  // Flat Accent Colors
  const GOLD_BRIGHT = "#fed64b";
  const GOLD_TRIM = "#df9d1e";
  const WINE_COLOR = "#3d020d";
  const PEARL_WHITE = "#faf4e8";

  // Glowing Crystal Colors
  const GEM_CYAN = "#0df0ff";
  const GEM_RUBY = "#ff124b";
  const GEM_SAPPHIRE = "#1c66ff";
  const GEM_EMERALD = "#05ff85";
  const GEM_AMETHYST = "#c924ff";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES (SVG Badges, Runes, and Coin Stamps)
  // ---------------------------------------------------------------------------
  const COIN_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#e5a720" stroke="#753d08" stroke-width="4"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="#fff194" stroke-width="2" stroke-dasharray="4 3"/>
      <!-- Stylized Demacian/Shuriman Sun Emblem -->
      <polygon points="50,15 56,36 78,36 60,49 67,70 50,57 33,70 40,49 22,36 44,36" fill="#fff7b0" stroke="#8a4b08" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="6" fill="#753d08"/>
    </svg>`,
    { size: 256 },
  );

  const INGOT_TEX = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="152" height="72" rx="8" fill="#d9941a" stroke="#6b3706" stroke-width="4"/>
      <rect x="12" y="12" width="136" height="56" rx="4" fill="none" stroke="#ffe57f" stroke-width="2"/>
      <text x="80" y="44" font-family="serif" font-weight="bold" font-size="20" fill="#6b3706" text-anchor="middle" letter-spacing="4">VALORAN</text>
      <text x="80" y="60" font-family="sans-serif" font-weight="bold" font-size="10" fill="#fff5aa" text-anchor="middle">999.9 FINE GOLD</text>
    </svg>`,
    { size: 256 },
  );

  const FILIGREE_TEX = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="32" fill="#caa025"/>
      <path d="M0,16 Q16,4 32,16 T64,16 T96,16 T128,16" fill="none" stroke="#522f03" stroke-width="3"/>
      <circle cx="16" cy="16" r="4" fill="#fff099"/>
      <circle cx="48" cy="16" r="4" fill="#fff099"/>
      <circle cx="80" cy="16" r="4" fill="#fff099"/>
      <circle cx="112" cy="16" r="4" fill="#fff099"/>
      <line x1="0" y1="2" x2="128" y2="2" stroke="#fff8b8" stroke-width="3"/>
      <line x1="0" y1="30" x2="128" y2="30" stroke="#4a2702" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON SETUP
  // ---------------------------------------------------------------------------
  // Single root joint at world origin; optional articulated joint for the treasure chest lid
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 4. STAGED BASE / TREASURY DAIS (y = 0.00 to 0.06)
  // ---------------------------------------------------------------------------
  // Stepped octagonal stone plinth
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.03, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.015, 0],
    name: "dais_step_lower",
  });
  b.part(new THREE.CylinderGeometry(0.82, 0.86, 0.035, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.045, 0],
    name: "dais_step_upper",
  });

  // Flagstone tile accents on the dais edge
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + 0.15;
    const r = 0.77;
    const px = Math.cos(angle) * r;
    const pz = Math.sin(angle) * r;
    b.part(new THREE.BoxGeometry(0.22, 0.012, 0.16), STONE_PAINT, {
      bone: root,
      at: [px, 0.065, pz],
      dir: [Math.sin(angle), 0, Math.cos(angle)],
      name: `flagstone_${i}`,
    });
  }

  // Royal Velvet Runner / Drapery spilling forward from under the chest
  const runnerPath = catmull([
    [-0.08, 0.09, -0.05],
    [0.08, 0.075, 0.22],
    [0.22, 0.068, 0.44],
    [0.34, 0.064, 0.65],
  ]);
  b.sweep(runnerPath, (t) => [0.24 * (1 - 0.15 * t), 0.008], {
    section: "box",
    color: VELVET_RED,
    bone: root,
  });

  // Gold braided trim border on the runner end
  b.part(new THREE.BoxGeometry(0.22, 0.014, 0.02), GOLD_PAINT, {
    bone: root,
    at: [0.34, 0.066, 0.65],
    dir: [0.45, 0, 1],
  });
  // Fringe tassels
  for (let f = -4; f <= 4; f++) {
    b.part(new THREE.CylinderGeometry(0.004, 0.001, 0.025, 6), GOLD_TRIM, {
      bone: root,
      at: [0.34 + f * 0.02, 0.062, 0.665],
      dir: [0.2, -0.2, 1],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HERO OBJECT A: THE ROYAL CHEST (Chunky League Stylized Vault)
  // ---------------------------------------------------------------------------
  const CHEST_POS = new THREE.Vector3(-0.16, 0.06, -0.12);
  const CHEST_YAW = -0.24; // ~-14 deg rotation for heroic 3/4 presentation
  const chestQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    CHEST_YAW,
  );

  const chestLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz)
      .applyQuaternion(chestQuat)
      .add(CHEST_POS);
  };

  const CW = 0.58; // chest width (X)
  const CH = 0.3; // chest box height (Y)
  const CD = 0.38; // chest depth (Z)

  // 4 Heavy Corner Brackets / Claw Feet (Resting squarely on stone at y=0.06)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const footPos = chestLocal((sx * (CW - 0.06)) / 2, 0.02, (sz * (CD - 0.06)) / 2);
      b.part(new THREE.BoxGeometry(0.08, 0.04, 0.08), IRON_PAINT, {
        bone: root,
        at: footPos,
        quat: chestQuat,
      });
      // Gold corner capping
      b.part(
        new THREE.CylinderGeometry(0.025, 0.038, 0.03, 6),
        GOLD_PAINT,
        {
          bone: root,
          at: footPos.clone().add(new THREE.Vector3(0, 0.02, 0)),
          quat: chestQuat,
        },
      );
    }
  }

  // Chest Main Body (Wood Core)
  const chestBodyCenter = chestLocal(0, CH / 2 + 0.02, 0);
  b.part(new THREE.BoxGeometry(CW - 0.04, CH, CD - 0.04), WOOD_PAINT, {
    bone: root,
    at: chestBodyCenter,
    quat: chestQuat,
    name: "chest_body_core",
  });

  // Heavy Gold Edge Rims & Plating
  // Base rim
  b.part(new THREE.BoxGeometry(CW + 0.01, 0.03, CD + 0.01), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, 0.035, 0),
    quat: chestQuat,
  });
  // Upper rim
  b.part(new THREE.BoxGeometry(CW + 0.01, 0.035, CD + 0.01), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, CH + 0.01, 0),
    quat: chestQuat,
  });

  // Vertical Reinforcing Iron Corner Struts with Gold Rivets
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const strutPos = chestLocal((sx * (CW - 0.02)) / 2, CH / 2 + 0.02, (sz * (CD - 0.02)) / 2);
      b.part(new THREE.BoxGeometry(0.045, CH + 0.01, 0.045), IRON_PAINT, {
        bone: root,
        at: strutPos,
        quat: chestQuat,
      });
      // Stud rivets
      for (const ry of [0.08, 0.16, 0.24]) {
        b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW + 0.015)) / 2, ry, (sz * (CD - 0.02)) / 2),
        });
        b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW - 0.02)) / 2, ry, (sz * (CD + 0.015)) / 2),
        });
      }
    }
  }

  // Front Heavy Center Iron Straps
  for (const sx of [-0.13, 0.13]) {
    b.part(new THREE.BoxGeometry(0.04, CH, 0.012), IRON_PAINT, {
      bone: root,
      at: chestLocal(sx, CH / 2 + 0.02, CD / 2 + 0.005),
      quat: chestQuat,
    });
    // Rivets
    for (const ry of [0.08, 0.22]) {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_PAINT, {
        bone: root,
        at: chestLocal(sx, ry, CD / 2 + 0.013),
      });
    }
  }

  // Front Escutcheon Plate & Lock Fixture (Stylized Lion / Skull LoL Motif)
  const lockCenter = chestLocal(0, CH * 0.72, CD / 2 + 0.012);
  b.part(new THREE.BoxGeometry(0.11, 0.12, 0.02), GOLD_PAINT, {
    bone: root,
    at: lockCenter,
    quat: chestQuat,
  });
  // Dark Keyhole
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), "#100a06", {
    bone: root,
    at: lockCenter.clone().add(new THREE.Vector3(0, 0.01, 0.005)),
    dir: new THREE.Vector3(0, 0, 1).applyQuaternion(chestQuat),
  });
  b.part(new THREE.BoxGeometry(0.01, 0.025, 0.025), "#100a06", {
    bone: root,
    at: lockCenter.clone().add(new THREE.Vector3(0, -0.015, 0.005)),
    quat: chestQuat,
  });

  // Side Carrying Handles (Chunky Drop-Rings)
  for (const sx of [-1, 1]) {
    const handleMount = chestLocal((sx * CW) / 2, CH * 0.6, 0);
    // Gold rosette mount
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), GOLD_PAINT, {
      bone: root,
      at: handleMount,
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
    });
    // Heavy Torus Drop Ring
    b.part(new THREE.TorusGeometry(0.045, 0.012, 8, 12), GOLD_PAINT, {
      bone: root,
      at: handleMount.clone().add(new THREE.Vector3(sx * 0.02, -0.02, 0)),
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
    });
  }

  // ---------------------------------------------------------------------------
  // 5B. THE CHEST LID (Hinged at Rear Top, Tilted Open ~110°)
  // ---------------------------------------------------------------------------
  const hingePoint = chestLocal(0, CH + 0.02, -CD / 2 + 0.02);
  // Hinge joint
  const lidJoint = b.joint("lid_hinge", {
    parent: root,
    at: hingePoint,
    dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    role: "hinge",
  });

  // Lid Rotation: tilted open backwards at ~115 degrees
  const LID_OPEN_DEG = 115;
  const lidRotQuat = chestQuat
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        (-LID_OPEN_DEG * Math.PI) / 180,
      ),
    );

  const lidLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(lidRotQuat).add(hingePoint);
  };

  // Heavy Hinge Knuckles at Back
  for (const hx of [-0.18, 0, 0.18]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), IRON_PAINT, {
      bone: root,
      at: chestLocal(hx, CH + 0.02, -CD / 2 + 0.01),
      dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    });
  }

  // Arched Barrel Lid Frame & Wooden Slats
  const lidCenter = lidLocal(0, 0.08, CD / 2);
  b.part(new THREE.CylinderGeometry(CD / 2, CD / 2, CW - 0.03, 12, 1, false, 0, Math.PI), WOOD_PAINT, {
    bone: lidJoint,
    at: lidCenter,
    quat: lidRotQuat
      .clone()
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    name: "chest_lid_barrel",
  });

  // Lid Rim Lip
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.035, CD + 0.02), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, 0.015, CD / 2),
    quat: lidRotQuat,
  });

  // Arched Reinforcing Gold Ribs (3 arched bands over the barrel lid)
  for (const rx of [-0.22, 0, 0.22]) {
    b.part(
      new THREE.TorusGeometry(CD / 2 + 0.008, 0.016, 6, 12, Math.PI),
      GOLD_PAINT,
      {
        bone: lidJoint,
        at: lidLocal(rx, 0.08, CD / 2),
        quat: lidRotQuat
          .clone()
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)),
      },
    );
  }

  // Crown Crest Spike atop Center of Lid Arch
  b.part(new THREE.ConeGeometry(0.028, 0.07, 6), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, CD / 2 + 0.1, CD / 2),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(lidRotQuat),
  });

  // Restraining Brass Chain between Chest Base and Open Lid
  const chainP1 = chestLocal(CW / 2 - 0.04, CH - 0.02, 0.02);
  const chainP2 = lidLocal(CW / 2 - 0.04, 0.06, 0.15);
  const chainMid = mid(chainP1, chainP2).add(new THREE.Vector3(0, -0.06, 0));
  const chainCurve = bezier(chainP1, chainMid, chainP2);
  b.sweep(chainCurve, 0.008, { color: GOLD_PAINT, bone: root });

  // ---------------------------------------------------------------------------
  // 6. THE OVERFLOWING COIN HEAP & SPILL CASCADE
  // ---------------------------------------------------------------------------
  // Mound A: Inside the chest overflowing over the front lip
  b.part(new THREE.SphereGeometry(1, 12, 8), COIN_HEAP_PAINT, {
    bone: root,
    at: chestLocal(0, CH - 0.02, 0.04),
    scale: [0.24, 0.13, 0.16],
    name: "coin_mound_interior",
  });

  // Mound B: Spilling over the chest lip and cascading down
  b.part(new THREE.SphereGeometry(1, 12, 8), COIN_HEAP_PAINT, {
    bone: root,
    at: chestLocal(0.06, CH * 0.65, CD / 2 + 0.04),
    scale: [0.18, 0.14, 0.12],
    name: "coin_mound_lip_spill",
  });

  // Mound C: Massive pooled delta of treasure on the stone floor in front of the chest
  b.part(new THREE.CylinderGeometry(0.38, 0.44, 0.08, 12), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.08, 0.09, 0.18],
    name: "coin_mound_delta_main",
  });
  b.part(new THREE.CylinderGeometry(0.26, 0.32, 0.06, 10), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.22, 0.08, 0.36],
    name: "coin_mound_delta_secondary",
  });

  // ---------------------------------------------------------------------------
  // 7. HERO OBJECT B: THE IMPERIAL CROWN (Jarvan / King Viego Style)
  // ---------------------------------------------------------------------------
  // Nestled prominently atop the forward coin spill, tilted slightly for drama
  const CROWN_POS = new THREE.Vector3(0.06, 0.16, 0.24);
  const crownRot = new THREE.Euler(0.22, 0.35, -0.12, "YXZ");
  const crownQuat = new THREE.Quaternion().setFromEuler(crownRot);

  const crownLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(crownQuat).add(CROWN_POS);
  };

  const CR_RAD = 0.11; // base circlet radius
  const CR_H = 0.04; // circlet band height

  // Circlet Base Band
  b.part(new THREE.CylinderGeometry(CR_RAD, CR_RAD, CR_H, 16, 1, true), GOLD_PAINT, {
    bone: root,
    at: crownLocal(0, CR_H / 2, 0),
    quat: crownQuat,
    texture: FILIGREE_TEX,
    name: "crown_circlet",
  });
  // Upper and lower beveled rings of circlet
  b.part(new THREE.TorusGeometry(CR_RAD, 0.007, 8, 16), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, 0.005, 0),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(crownQuat),
  });
  b.part(new THREE.TorusGeometry(CR_RAD, 0.007, 8, 16), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, CR_H, 0),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(crownQuat),
  });

  // Inset Cabochon Gems around the Circlet (alternating glowing rubies & sapphires)
  for (let g = 0; g < 6; g++) {
    const ga = (g * Math.PI) / 3;
    const gx = Math.cos(ga) * (CR_RAD + 0.006);
    const gz = Math.sin(ga) * (CR_RAD + 0.006);
    const gemColor = g % 2 === 0 ? GEM_RUBY : GEM_SAPPHIRE;
    glow(
      b.part(new THREE.SphereGeometry(0.012, 8, 6), gemColor, {
        bone: root,
        at: crownLocal(gx, CR_H / 2, gz),
        scale: [1, 1, 0.6],
        dir: new THREE.Vector3(Math.cos(ga), 0, Math.sin(ga)).applyQuaternion(crownQuat),
      }),
      1.3,
    );
  }

  // 6 Flared Crown Spires (Heroic Fleur-de-lis Spikes)
  for (let s = 0; s < 6; s++) {
    const sa = (s * Math.PI) / 3;
    const isFront = s === 1 || s === 2; // front-facing spires are taller
    const spikeH = isFront ? 0.12 : 0.085;
    const spikeR = isFront ? 0.022 : 0.016;

    const sx = Math.cos(sa) * CR_RAD;
    const sz = Math.sin(sa) * CR_RAD;
    const spireBase = crownLocal(sx, CR_H, sz);

    // Flared cone spire
    b.part(new THREE.ConeGeometry(spikeR, spikeH, 6), GOLD_PAINT, {
      bone: root,
      at: spireBase.clone().add(new THREE.Vector3(0, spikeH / 2, 0).applyQuaternion(crownQuat)),
      dir: new THREE.Vector3(Math.cos(sa) * 0.2, 1, Math.sin(sa) * 0.2).applyQuaternion(crownQuat),
    });

    // Spire Tip Jewels
    const tipPos = crownLocal(
      Math.cos(sa) * (CR_RAD + 0.01),
      CR_H + spikeH + 0.008,
      Math.sin(sa) * (CR_RAD + 0.01),
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.012), GEM_CYAN, {
        bone: root,
        at: tipPos,
        quat: crownQuat,
      }),
      1.5,
    );
  }

  // Inner Royal Velvet Cap
  b.part(
    new THREE.SphereGeometry(CR_RAD - 0.008, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    VELVET_RED,
    {
      bone: root,
      at: crownLocal(0, CR_H * 0.7, 0),
      quat: crownQuat,
    },
  );

  // Cross Arches Meeting at Crown Center Finial
  for (let a = 0; a < 2; a++) {
    const archRot = crownQuat
      .clone()
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (a * Math.PI) / 2));
    b.part(new THREE.TorusGeometry(CR_RAD * 0.9, 0.008, 6, 12, Math.PI), GOLD_PAINT, {
      bone: root,
      at: crownLocal(0, CR_H + 0.01, 0),
      quat: archRot.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
      ),
    });
  }

  // Crown Apex Orb & Glowing Sol Gem
  const crownApex = crownLocal(0, CR_H + CR_RAD * 0.92, 0);
  b.part(new THREE.SphereGeometry(0.016, 8, 6), GOLD_PAINT, {
    bone: root,
    at: crownApex,
    quat: crownQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), GEM_RUBY, {
      bone: root,
      at: crownApex.clone().add(new THREE.Vector3(0, 0.024, 0).applyQuaternion(crownQuat)),
      quat: crownQuat,
    }),
    1.6,
  );

  // ---------------------------------------------------------------------------
  // 8. HERO OBJECT C: GOBLETS & CHALICES
  // ---------------------------------------------------------------------------
  // Goblet 1: The Sovereign Chalice (Standing tall at right foreground)
  const CHALICE_1 = new THREE.Vector3(0.42, 0.06, 0.12);
  // Stepped octagonal base
  b.part(new THREE.CylinderGeometry(0.055, 0.068, 0.02, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.01, 0)),
  });
  // Chunky knopped stem
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.06, 0)),
  });
  // Gold Knop sphere with embedded emeralds
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.06, 0)),
  });
  for (let e = 0; e < 4; e++) {
    const ea = (e * Math.PI) / 2;
    glow(
      b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), GEM_EMERALD, {
        bone: root,
        at: CHALICE_1.clone().add(new THREE.Vector3(Math.cos(ea) * 0.03, 0.06, Math.sin(ea) * 0.03)),
      }),
      1.3,
    );
  }
  // Flared Chalice Bowl
  b.part(new THREE.CylinderGeometry(0.065, 0.035, 0.09, 12, 1, true), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.135, 0)),
  });
  // Bowl Rim Bevel
  b.part(new THREE.TorusGeometry(0.065, 0.007, 6, 12), GOLD_TRIM, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.18, 0)),
    dir: [0, 1, 0],
  });
  // Deep ruby wine level inside
  b.part(new THREE.CircleGeometry(0.062, 12), WINE_COLOR, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.165, 0)),
    dir: [0, 1, 0],
  });

  // Goblet 2: The Tipped / Spilling Chalice (Knocked onto the coin heap at left)
  const CHALICE_2 = new THREE.Vector3(-0.34, 0.11, 0.22);
  const tipQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0.2, 1.45, "YXZ"));
  // Base
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.018, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2,
    quat: tipQuat,
  });
  // Stem
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2.clone().add(new THREE.Vector3(0.04, 0.01, 0)),
    quat: tipQuat,
  });
  // Bowl
  b.part(new THREE.CylinderGeometry(0.058, 0.028, 0.08, 10, 1, true), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2.clone().add(new THREE.Vector3(0.1, 0.015, 0)),
    quat: tipQuat,
  });
  // Glowing sapphire gems tumbling out of the tipped chalice
  for (let s = 0; s < 4; s++) {
    const spX = CHALICE_2.x + 0.14 + s * 0.035 + (random() - 0.5) * 0.02;
    const spZ = CHALICE_2.z + (random() - 0.5) * 0.04;
    glow(
      b.part(new THREE.DodecahedronGeometry(0.014), GEM_CYAN, {
        bone: root,
        at: [spX, 0.09, spZ],
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(random() * 3, random() * 3, 0),
        ),
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 9. HERO OBJECT D: STACKED GOLD INGOTS / BULLION BARS
  // ---------------------------------------------------------------------------
  // Stack of 6 standard stamped gold bullion bars placed to the left on stone
  const BAR_BASE = new THREE.Vector3(-0.48, 0.06, -0.05);
  const BAR_W = 0.14;
  const BAR_H = 0.035;
  const BAR_D = 0.07;

  // Pyramid stack configuration: 3 on bottom, 2 in middle, 1 on top
  const barLayout = [
    // Layer 1 (Bottom 3)
    { x: -0.075, y: BAR_H / 2, z: 0, rotY: 0.1 },
    { x: 0, y: BAR_H / 2, z: 0.01, rotY: 0.08 },
    { x: 0.075, y: BAR_H / 2, z: -0.01, rotY: 0.12 },
    // Layer 2 (Middle 2)
    { x: -0.038, y: BAR_H * 1.5, z: 0.005, rotY: 0.09 },
    { x: 0.038, y: BAR_H * 1.5, z: -0.005, rotY: 0.11 },
    // Layer 3 (Top 1)
    { x: 0, y: BAR_H * 2.5, z: 0, rotY: 0.1 },
  ];

  barLayout.forEach((l, idx) => {
    const barPos = BAR_BASE.clone().add(new THREE.Vector3(l.x, l.y, l.z));
    const bQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), l.rotY);
    // Beveled Ingot Frustum
    b.frustumBox(
      barPos.clone().add(new THREE.Vector3(0, -BAR_H / 2, 0)),
      barPos.clone().add(new THREE.Vector3(0, BAR_H / 2, 0)),
      [BAR_W, BAR_D],
      [BAR_W * 0.82, BAR_D * 0.82],
      { color: GOLD_PAINT, bone: root, name: `gold_ingot_${idx}` },
    );
    // Valoran Fine Gold Stamp decal on top face
    b.part(new THREE.PlaneGeometry(BAR_W * 0.72, BAR_D * 0.72), GOLD_BRIGHT, {
      bone: root,
      at: barPos.clone().add(new THREE.Vector3(0, BAR_H / 2 + 0.001, 0)),
      dir: [0, 1, 0],
      axis: "z",
      quat: bQuat.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
      ),
      texture: INGOT_TEX,
    });
  });

  // One stray bullion bar dropped askew against the chest base
  b.part(new THREE.BoxGeometry(BAR_W, BAR_H, BAR_D), GOLD_PAINT, {
    bone: root,
    at: [-0.32, 0.075, -0.24],
    quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0.8, -0.15)),
  });

  // ---------------------------------------------------------------------------
  // 10. HERO OBJECT E: CEREMONIAL RELIC SWORD / DAGGER
  // ---------------------------------------------------------------------------
  // Plunged into the coin mound inside the chest at an aggressive angle
  const DAGGER_POS = chestLocal(-0.14, CH + 0.14, 0.06);
  const daggerQuat = chestQuat
    .clone()
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35, 0.2, 0.4, "YXZ")));

  const daggerLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(daggerQuat).add(DAGGER_POS);
  };

  // Chunky Hextech Blade (Steel with Cyan Glow fuller line)
  b.part(new THREE.BoxGeometry(0.045, 0.28, 0.014), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.06, 0),
    quat: daggerQuat,
  });
  // Pointed blade tip
  b.part(new THREE.ConeGeometry(0.024, 0.08, 4), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.22, 0),
    dir: new THREE.Vector3(0, -1, 0).applyQuaternion(daggerQuat),
  });
  // Glowing fuller groove
  glow(
    b.part(new THREE.BoxGeometry(0.012, 0.22, 0.016), GEM_CYAN, {
      bone: root,
      at: daggerLocal(0, -0.05, 0),
      quat: daggerQuat,
    }),
    1.4,
  );

  // Winged Gold Crossguard
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.035), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.09, 0),
    quat: daggerQuat,
  });
  // Crossguard Center Jewel
  glow(
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GEM_RUBY, {
      bone: root,
      at: daggerLocal(0, 0.09, 0.02),
      quat: daggerQuat,
    }),
    1.5,
  );

  // Grip (Wrapped Leather/Iron)
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.12, 8), "#1f1814", {
    bone: root,
    at: daggerLocal(0, 0.16, 0),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
  });
  // Spiral Gold Grip Wire
  for (let w = 0; w < 4; w++) {
    b.part(new THREE.TorusGeometry(0.016, 0.003, 6, 8), GOLD_TRIM, {
      bone: root,
      at: daggerLocal(0, 0.12 + w * 0.026, 0),
      dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
    });
  }

  // Gold Pommel (Faceted with inset blue gem)
  b.part(new THREE.DodecahedronGeometry(0.024), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.23, 0),
    quat: daggerQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.012), GEM_SAPPHIRE, {
      bone: root,
      at: daggerLocal(0, 0.245, 0),
      quat: daggerQuat,
    }),
    1.4,
  );

  // ---------------------------------------------------------------------------
  // 11. RADIANT CUT GEMS (Oversized League Arcane Crystals)
  // ---------------------------------------------------------------------------
  // 1. Giant Hextech Crystal (Cyan Rhombic Bipyramid) resting inside the chest
  glow(
    b.part(new THREE.OctahedronGeometry(0.075), GEM_CYAN, {
      bone: root,
      at: chestLocal(0.12, CH + 0.05, 0.02),
      scale: [0.8, 1.4, 0.8],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0.6, -0.4)),
      name: "gem_hextech_giant",
    }),
    1.6,
  );

  // 2. The Heart of Shurima (Huge Glowing Red Ruby) in foreground delta
  glow(
    b.part(new THREE.DodecahedronGeometry(0.055), GEM_RUBY, {
      bone: root,
      at: [0.24, 0.12, 0.22],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, -0.2, 0.8)),
      name: "gem_ruby_shurima",
    }),
    1.5,
  );

  // 3. Targon Celestial Sapphire (Deep Brilliant Blue) on velvet runner
  glow(
    b.part(new THREE.OctahedronGeometry(0.048), GEM_SAPPHIRE, {
      bone: root,
      at: [0.18, 0.09, 0.46],
      scale: [1, 1.2, 0.9],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.4, 0.2)),
      name: "gem_sapphire_targon",
    }),
    1.4,
  );

  // 4. Zaunite Chemtech Emerald (Prismatic Green) near chalice 1
  glow(
    b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.08, 6), GEM_EMERALD, {
      bone: root,
      at: [0.36, 0.1, 0.28],
      dir: [0.2, 1, -0.3],
      name: "gem_emerald_zaun",
    }),
    1.5,
  );

  // 5. Void-Touched Amethyst Cluster (3 purple crystal spikes)
  const AMY_BASE = new THREE.Vector3(-0.08, 0.08, 0.38);
  const amySpikes = [
    { dir: [-0.2, 1, 0.1] as [number, number, number], len: 0.07, r: 0.018 },
    { dir: [0.2, 1, 0.2] as [number, number, number], len: 0.09, r: 0.022 },
    { dir: [0.0, 1, -0.3] as [number, number, number], len: 0.06, r: 0.015 },
  ];
  amySpikes.forEach((sp, idx) => {
    glow(
      b.part(new THREE.ConeGeometry(sp.r, sp.len, 5), GEM_AMETHYST, {
        bone: root,
        at: AMY_BASE.clone().add(new THREE.Vector3(sp.dir[0] * 0.03, 0, sp.dir[2] * 0.03)),
        dir: sp.dir,
        name: `gem_amethyst_${idx}`,
      }),
      1.5,
    );
  });

  // Additional small scattered gemstones across the hoard
  const scatterGems = [
    { at: [0.02, 0.11, 0.35] as [number, number, number], col: GEM_RUBY, s: 0.02 },
    { at: [0.14, 0.14, 0.16] as [number, number, number], col: GEM_EMERALD, s: 0.024 },
    { at: [-0.18, 0.08, 0.32] as [number, number, number], col: GEM_CYAN, s: 0.022 },
    { at: [-0.02, 0.18, 0.18] as [number, number, number], col: GEM_SAPPHIRE, s: 0.026 },
    { at: [0.28, 0.08, 0.42] as [number, number, number], col: GEM_AMETHYST, s: 0.02 },
    { at: [-0.22, 0.12, 0.14] as [number, number, number], col: GEM_CYAN, s: 0.025 },
    { at: [0.38, 0.07, 0.02] as [number, number, number], col: GEM_RUBY, s: 0.022 },
  ];
  scatterGems.forEach((sg, idx) => {
    glow(
      b.part(new THREE.DodecahedronGeometry(sg.s), sg.col, {
        bone: root,
        at: sg.at,
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(random() * 3, random() * 3, random() * 3),
        ),
        name: `small_gem_${idx}`,
      }),
      1.35,
    );
  });

  // ---------------------------------------------------------------------------
  // 12. PEARL NECKLACES (Beaded strings draped over the chest & chalice)
  // ---------------------------------------------------------------------------
  // Necklace 1: Draped from inside the chest, trailing over the lip onto the delta
  const pearlPath1 = catmull([
    chestLocal(0.18, CH + 0.04, 0.02),
    chestLocal(0.22, CH * 0.8, CD / 2 + 0.02),
    chestLocal(0.24, CH * 0.4, CD / 2 + 0.05),
    [0.16, 0.11, 0.28],
    [0.19, 0.08, 0.36],
  ]);

  const pearlGeos: THREE.BufferGeometry[] = [];
  const P_COUNT_1 = 28;
  for (let p = 0; p <= P_COUNT_1; p++) {
    const pt = pearlPath1.at(p / P_COUNT_1);
    const r = p % 4 === 0 ? 0.01 : 0.0075;
    const sphere = new THREE.SphereGeometry(r, 6, 5);
    sphere.translate(pt.x, pt.y, pt.z);
    pearlGeos.push(sphere);
  }

  // Necklace 2: Beaded necklace looped around the base of Sovereign Chalice
  const chaliceLoop = catmull([
    [0.46, 0.075, 0.16],
    [0.48, 0.072, 0.1],
    [0.43, 0.07, 0.06],
    [0.37, 0.072, 0.09],
    [0.38, 0.076, 0.15],
    [0.46, 0.075, 0.16],
  ]);
  const P_COUNT_2 = 18;
  for (let p = 0; p < P_COUNT_2; p++) {
    const pt = chaliceLoop.at(p / P_COUNT_2);
    const r = p % 3 === 0 ? 0.009 : 0.0065;
    const sphere = new THREE.SphereGeometry(r, 6, 5);
    sphere.translate(pt.x, pt.y, pt.z);
    pearlGeos.push(sphere);
  }

  const mergedPearls = mergeGeometries(pearlGeos);
  if (mergedPearls) {
    b.part(mergedPearls, PEARL_WHITE, {
      bone: root,
      at: [0, 0, 0],
      name: "pearl_necklaces",
    });
  }

  // ---------------------------------------------------------------------------
  // 13. INDIVIDUAL STAMPED COINS & NEAT STACKS
  // ---------------------------------------------------------------------------
  const COIN_R = 0.022; // chunky League scale (~4.4cm across)
  const COIN_T = 0.006; // thickness

  // A. Four Chunky Stacks of Coins (Neat & Leaning)
  const stackPositions = [
    { x: -0.26, z: 0.34, count: 6, tiltX: 0.05, tiltZ: -0.06 },
    { x: -0.22, z: 0.36, count: 8, tiltX: -0.04, tiltZ: 0.08 },
    { x: 0.32, z: -0.06, count: 5, tiltX: 0.08, tiltZ: 0.03 },
    { x: 0.35, z: -0.03, count: 7, tiltX: -0.06, tiltZ: -0.04 },
  ];

  stackPositions.forEach((st, sidx) => {
    for (let c = 0; c < st.count; c++) {
      const cy = 0.065 + c * COIN_T;
      const jx = (c * st.tiltX) / st.count;
      const jz = (c * st.tiltZ) / st.count;
      b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_PAINT, {
        bone: root,
        at: [st.x + jx, cy, st.z + jz],
        texture: COIN_TEX,
        name: `coin_stack_${sidx}_${c}`,
      });
    }
  });

  // B. Scattered Individual Loose Coins (tumbling, tilted, caught in crevices)
  const looseCoins = [
    // Top of chest lip and spilling
    { at: chestLocal(-0.06, CH + 0.01, CD / 2 + 0.01), rot: [0.4, 0.2, 0.1] },
    { at: chestLocal(0.04, CH * 0.85, CD / 2 + 0.03), rot: [0.7, -0.3, 0.2] },
    { at: chestLocal(0.12, CH * 0.7, CD / 2 + 0.04), rot: [0.6, 0.4, -0.2] },
    { at: chestLocal(-0.16, CH * 0.5, CD / 2 + 0.02), rot: [0.5, 0.1, 0.3] },
    // Near Crown
    { at: [0.01, 0.15, 0.36] as [number, number, number], rot: [0.1, 0.8, -0.1] },
    { at: [0.18, 0.14, 0.2] as [number, number, number], rot: [-0.2, 0.4, 0.3] },
    { at: [0.08, 0.18, 0.14] as [number, number, number], rot: [0.25, -0.6, 0.15] },
    // Near Foreground Velvet Runner
    { at: [0.28, 0.075, 0.52] as [number, number, number], rot: [0.05, 1.2, 0] },
    { at: [0.36, 0.072, 0.56] as [number, number, number], rot: [-0.08, 0.3, 0.1] },
    { at: [0.22, 0.074, 0.62] as [number, number, number], rot: [0.02, 2.1, -0.05] },
    // Near Tipped Chalice
    { at: [-0.28, 0.085, 0.18] as [number, number, number], rot: [-0.3, 0.7, 0.4] },
    { at: [-0.36, 0.075, 0.3] as [number, number, number], rot: [0.1, -0.4, 0.2] },
    { at: [-0.42, 0.068, 0.14] as [number, number, number], rot: [0, 0.5, 0] },
    // Near Bullion Stack
    { at: [-0.42, 0.066, -0.02] as [number, number, number], rot: [0, 0.9, 0] },
    { at: [-0.55, 0.065, 0.04] as [number, number, number], rot: [0.05, -0.8, 0.05] },
    // Dais Front Periphery
    { at: [0.0, 0.068, 0.48] as [number, number, number], rot: [-0.05, 0.3, 0.08] },
    { at: [-0.14, 0.068, 0.44] as [number, number, number], rot: [0.08, -1.1, 0.02] },
    { at: [0.44, 0.066, 0.22] as [number, number, number], rot: [0.02, 0.6, -0.04] },
  ];

  looseCoins.forEach((lc, idx) => {
    b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_PAINT, {
      bone: root,
      at: lc.at,
      quat: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(lc.rot[0], lc.rot[1], lc.rot[2]),
      ),
      texture: COIN_TEX,
      name: `loose_coin_${idx}`,
    });
  });

  return b.root;
}
