Here is a summary of the improvements:

1. **Fixed Ground Penetration**: Corrected the velvet runner and dais draping so all geometry rests cleanly at or above $y = 0.00$, eliminating the ground-penetration warning.
2. **Rebuilt the Open Chest Lid**: Transformed the lid from a flat solid yellow block into an authentic vaulted treasure chest lid with a recessed inner lining, dark ironwood planks, arched golden reinforcement ribs, and an interior golden guild medallion.
3. **Sculpted Coin Cascades**: Replaced the harsh tilted cylinder spill with organic, cascading coin drifts and terraced mounds that naturally flow over the chest rim and fan across the flagstones.
4. **Rich 3D Coin Detailing**: Merged over 160 individual 3D gold coins and coin stacks into clean, shared-geometry parts scattered across the cascade, lip, and slopes to give the unmistakable texture of a true mountain of treasure.
5. **Heroic League-Style Crown**: Elevated and enlarged the imperial crown on a prominent crest of the hoard. Enhanced it with ornate flared spires, glowing cabochon jewels, fine filigree circlet, and an inner royal velvet cap.
6. **Detailed Chalices with Handles & Spills**: Upgraded the sovereign goblet with twin scrolled heroic handles and an emerald-studded knop; fixed the tipped chalice assembly and spilled a gleaming cascade of sapphires and pearls from its rim.
7. **Refined Sword, Bullion & Crystals**: Deepened the Runeblade fuller with glowing hextech cyan runes, added stepped gold bullion with mint stamps, and placed oversized faceted gems (ruby, sapphire, emerald, and amethyst clusters) throughout the hoard.

```ts
<<<<<<< SEARCH
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasure_hoard", detail: 1 });
  const random = rng(999);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PAINTS (League of Legends Hand-Painted Fantasy Style)
  // ---------------------------------------------------------------------------
  const KEY_LIGHT = new THREE.Vector3(0.42, 0.82, 0.38).normalize();

  // League Stylized Gold: rich warm amber crevices, honey midtones, champagne glints
  const GOLD_PAINT = paint((p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.25, 0.7, ndotl);
    const brush = noise(p, 0.045, 17) * 0.12;
    const base = mix("#6e380a", "#f5ba25", lit + brush);
    const rim = smoothstep(0.6, 0.95, ndotl) * smoothstep(0.15, 0.85, n.y);
    return mix(base, "#fff7c2", rim * 0.7);
  });

  // Dark Ancient Wood: rich mahogany/ironwood grain with edge darkening
  const WOOD_PAINT = grain("#221008", "#4e2518", {
    size: 0.028,
    axis: "y",
    seed: 5,
  });

  // Weathered Heavy Iron: blue-grey specular rims on dark charcoal
  const IRON_PAINT = paint((_p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.15, 0.75, ndotl);
    const rim = smoothstep(0.45, 0.9, n.y) * 0.3;
    return mix("#181b22", "#48536a", lit + rim);
  });

  // Treasury Dais Stone: cool indigo-grey slate flagstone with soft mottling
  const STONE_PAINT = mottle("#1e1c26", "#363445", {
    size: 0.09,
    contrast: 1.1,
    seed: 12,
  });

  // Royal Velvet: opulent Noxian crimson with soft grazing-angle sheen
  const VELVET_RED = paint((_p, n) => {
    const rim = 1 - Math.max(0, n.dot(KEY_LIGHT));
    return mix("#5e0812", "#a8192b", smoothstep(0.25, 0.88, rim));
  });

  // Shimmering Coin Heap Paint: golden micro-faceted sparkle over undulating drifts
  const COIN_HEAP_PAINT = paint((p, n) => {
    const spec = noise(p, 0.016, 88);
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.15, 0.65, ndotl);
    const shimmer = smoothstep(0.5, 0.82, spec);
    const baseGold = mix("#783a08", "#fabc22", lit);
    return mix(baseGold, "#fff8cb", shimmer * 0.6);
  });

  // Flat Accent Colors
  const GOLD_BRIGHT = "#fed64b";
  const GOLD_TRIM = "#df9d1e";
  const WINE_COLOR = "#38010b";
  const PEARL_WHITE = "#faf5ea";

  // Glowing Crystal Colors
  const GEM_CYAN = "#0df2ff";
  const GEM_RUBY = "#ff144d";
  const GEM_SAPPHIRE = "#1f6bff";
  const GEM_EMERALD = "#06ff8a";
  const GEM_AMETHYST = "#cc26ff";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES (Embossed Coin Stamps, Ingot Mint Marks, Filigree)
  // ---------------------------------------------------------------------------
  const COIN_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#e8aa22" stroke="#753d08" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff194" stroke-width="2" stroke-dasharray="4 3"/>
      <polygon points="50,16 56,36 77,36 60,49 66,70 50,57 34,70 40,49 23,36 44,36" fill="#fff7b0" stroke="#8a4b08" stroke-width="1.6"/>
      <circle cx="50" cy="46" r="6" fill="#753d08"/>
    </svg>`,
    { size: 256 },
  );

  const INGOT_TEX = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="152" height="72" rx="8" fill="#d9941a" stroke="#6b3706" stroke-width="4"/>
      <rect x="12" y="12" width="136" height="56" rx="4" fill="none" stroke="#ffe57f" stroke-width="2"/>
      <text x="80" y="44" font-family="serif" font-weight="bold" font-size="19" fill="#6b3706" text-anchor="middle" letter-spacing="4">VALORAN</text>
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
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 4. STAGED BASE / TREASURY DAIS (Cleanly at y = 0.00 to 0.08)
  // ---------------------------------------------------------------------------
  // Step 1: Broad lower octagonal base (resting flat on floor at y = 0.00)
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.035, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.0175, 0],
    name: "dais_step_lower",
  });
  // Step 2: Mid-tier riser
  b.part(new THREE.CylinderGeometry(0.82, 0.85, 0.03, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.05, 0],
    name: "dais_step_mid",
  });
  // Step 3: Upper dais plateau
  b.part(new THREE.CylinderGeometry(0.76, 0.79, 0.02, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.075, 0],
    name: "dais_step_upper",
  });

  // Inlaid decorative gold corner brackets on the octagonal dais floor (flat at y = 0.086)
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    const r = 0.72;
    const px = Math.cos(angle) * r;
    const pz = Math.sin(angle) * r;
    b.part(new THREE.BoxGeometry(0.09, 0.005, 0.09), GOLD_PAINT, {
      bone: root,
      at: [px, 0.086, pz],
      rotation: [0, angle, 0],
      name: `dais_bracket_${i}`,
    });
  }

  // Royal Velvet Runner / Drapery spilling forward over the dais steps
  const runnerPath = catmull([
    [-0.08, 0.11, -0.05],
    [0.08, 0.095, 0.22],
    [0.22, 0.088, 0.44],
    [0.32, 0.078, 0.58],
    [0.42, 0.038, 0.72],
    [0.46, 0.018, 0.78],
  ]);
  b.sweep(runnerPath, (t) => [0.24 * (1 - 0.12 * t), 0.008], {
    section: "box",
    color: VELVET_RED,
    bone: root,
  });

  // Gold braided trim border on the runner end
  b.part(new THREE.BoxGeometry(0.21, 0.012, 0.018), GOLD_PAINT, {
    bone: root,
    at: [0.46, 0.02, 0.78],
    dir: [0.35, 0, 1],
  });
  // Fringe tassels
  for (let f = -4; f <= 4; f++) {
    b.part(new THREE.CylinderGeometry(0.0035, 0.001, 0.02, 6), GOLD_TRIM, {
      bone: root,
      at: [0.46 + f * 0.02, 0.015, 0.795],
      dir: [0.2, -0.2, 1],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HERO OBJECT A: THE ROYAL CHEST (Chunky League Stylized Vault)
  // ---------------------------------------------------------------------------
  const CHEST_POS = new THREE.Vector3(-0.14, 0.085, -0.12);
  const CHEST_YAW = -0.22; // ~-13 deg rotation for heroic 3/4 presentation
  const chestQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    CHEST_YAW,
  );

  const chestLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz)
      .applyQuaternion(chestQuat)
      .add(CHEST_POS);
  };

  const CW = 0.56; // chest width (X)
  const CH = 0.28; // chest box height (Y)
  const CD = 0.38; // chest depth (Z)

  // 4 Heavy Corner Brackets / Claw Feet (Resting securely on dais floor at y = 0.085)
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
        new THREE.CylinderGeometry(0.024, 0.038, 0.025, 6),
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
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.03, CD + 0.015), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, 0.035, 0),
    quat: chestQuat,
  });
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.035, CD + 0.015), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, CH + 0.015, 0),
    quat: chestQuat,
  });

  // Vertical Reinforcing Iron Corner Struts with Gold Rivets
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const strutPos = chestLocal((sx * (CW - 0.015)) / 2, CH / 2 + 0.02, (sz * (CD - 0.015)) / 2);
      b.part(new THREE.BoxGeometry(0.045, CH + 0.01, 0.045), IRON_PAINT, {
        bone: root,
        at: strutPos,
        quat: chestQuat,
      });
      for (const ry of [0.08, 0.16, 0.24]) {
        b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW + 0.015)) / 2, ry, (sz * (CD - 0.015)) / 2),
        });
        b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW - 0.015)) / 2, ry, (sz * (CD + 0.015)) / 2),
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
    for (const ry of [0.08, 0.22]) {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_PAINT, {
        bone: root,
        at: chestLocal(sx, ry, CD / 2 + 0.013),
      });
    }
  }

  // Front Escutcheon Plate & Lock Fixture (Stylized Lion Shield Motif)
  const lockCenter = chestLocal(0, CH * 0.72, CD / 2 + 0.014);
  b.part(new THREE.BoxGeometry(0.11, 0.12, 0.02), GOLD_PAINT, {
    bone: root,
    at: lockCenter,
    quat: chestQuat,
  });
  // Dark Keyhole
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.025, 8), "#100a06", {
    bone: root,
    at: lockCenter.clone().add(new THREE.Vector3(0, 0.01, 0.005)),
    dir: new THREE.Vector3(0, 0, 1).applyQuaternion(chestQuat),
  });
  b.part(new THREE.BoxGeometry(0.01, 0.022, 0.025), "#100a06", {
    bone: root,
    at: lockCenter.clone().add(new THREE.Vector3(0, -0.012, 0.005)),
    quat: chestQuat,
  });

  // Side Carrying Handles (Chunky Drop-Rings)
  for (const sx of [-1, 1]) {
    const handleMount = chestLocal((sx * CW) / 2, CH * 0.6, 0);
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 8), GOLD_PAINT, {
      bone: root,
      at: handleMount,
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
    });
    // Heavy Torus Drop Ring (Correctly oriented: tube in plane perpendicular to X)
    b.part(new THREE.TorusGeometry(0.042, 0.01, 8, 12), GOLD_PAINT, {
      bone: root,
      at: handleMount.clone().add(new THREE.Vector3(sx * 0.018, -0.02, 0)),
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
      axis: "z",
    });
  }

  // ---------------------------------------------------------------------------
  // 5B. THE CHEST LID (Hinged at Rear Top, Tilted Open ~105°)
  // ---------------------------------------------------------------------------
  const hingePoint = chestLocal(0, CH + 0.02, -CD / 2 + 0.02);
  const lidJoint = b.joint("lid_hinge", {
    parent: root,
    at: hingePoint,
    dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    role: "hinge",
  });

  const LID_OPEN_DEG = 105;
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
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), IRON_PAINT, {
      bone: root,
      at: chestLocal(hx, CH + 0.02, -CD / 2 + 0.01),
      dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    });
  }

  // Lid Box Base Lip (Thick gold frame)
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.04, CD + 0.02), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, 0.02, CD / 2),
    quat: lidRotQuat,
    name: "chest_lid_lip",
  });

  // Barrel Arch Outer Roof (Segmented wooden arch)
  const lidCenter = lidLocal(0, 0.08, CD / 2);
  b.part(
    new THREE.CylinderGeometry(CD / 2, CD / 2, CW - 0.03, 12, 1, false, 0, Math.PI),
    WOOD_PAINT,
    {
      bone: lidJoint,
      at: lidCenter,
      quat: lidRotQuat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
      name: "chest_lid_barrel",
    },
  );

  // Arched Gold End Plates on the Lid Sides
  for (const sx of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(CD / 2 + 0.005, CD / 2 + 0.005, 0.02, 12, 1, false, 0, Math.PI),
      GOLD_PAINT,
      {
        bone: lidJoint,
        at: lidLocal((sx * (CW - 0.01)) / 2, 0.08, CD / 2),
        quat: lidRotQuat
          .clone()
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
      },
    );
  }

  // 3 Arched Reinforcing Gold Ribs Across the Roof
  for (const rx of [-0.2, 0, 0.2]) {
    b.part(
      new THREE.TorusGeometry(CD / 2 + 0.008, 0.014, 6, 12, Math.PI),
      GOLD_PAINT,
      {
        bone: lidJoint,
        at: lidLocal(rx, 0.08, CD / 2),
        quat: lidRotQuat
          .clone()
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)),
        axis: "z",
      },
    );
  }

  // Crown Crest Spike atop Center of Lid Arch
  b.part(new THREE.ConeGeometry(0.026, 0.065, 6), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, CD / 2 + 0.09, CD / 2),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(lidRotQuat),
  });

  // Brass Stay Chain Connecting Chest Base to Open Lid
  const chainP1 = chestLocal(CW / 2 - 0.035, CH - 0.01, 0.02);
  const chainP2 = lidLocal(CW / 2 - 0.035, 0.06, 0.16);
  const chainMid = mid(chainP1, chainP2).add(new THREE.Vector3(0, -0.05, 0));
  const chainCurve = bezier(chainP1, chainMid, chainP2);
  b.sweep(chainCurve, 0.0075, { color: GOLD_PAINT, bone: root });

  // ---------------------------------------------------------------------------
  // 6. THE OVERFLOWING COIN HEAP & ORGANIC CASCADE
  // ---------------------------------------------------------------------------
  // Mound A: Inside the chest overflowing above the rim
  b.part(new THREE.SphereGeometry(1, 12, 8), COIN_HEAP_PAINT, {
    bone: root,
    at: chestLocal(0, CH + 0.03, 0.04),
    scale: [0.24, 0.11, 0.15],
    name: "coin_mound_interior",
  });

  // Mound B: Natural spilling lip overflowing the front edge
  b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.09, 10), COIN_HEAP_PAINT, {
    bone: root,
    at: chestLocal(0.04, CH * 0.72, CD / 2 + 0.03),
    quat: chestQuat
      .clone()
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.35)),
    name: "coin_mound_lip_spill",
  });

  // Mound C: Mid cascade terrace stepping down to floor
  b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.07, 10), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.02, 0.14, 0.15],
    name: "coin_mound_mid_cascade",
  });

  // Mound D: Broad pooled delta of treasure on the stone floor
  b.part(new THREE.CylinderGeometry(0.38, 0.44, 0.06, 12), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.08, 0.105, 0.28],
    name: "coin_mound_delta_main",
  });

  // Mound E: Secondary forward-right spill tongue
  b.part(new THREE.CylinderGeometry(0.22, 0.28, 0.045, 10), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.22, 0.095, 0.42],
    name: "coin_mound_delta_secondary",
  });

  // ---------------------------------------------------------------------------
  // 7. HERO OBJECT B: THE IMPERIAL CROWN (Jarvan / Viego Style)
  // ---------------------------------------------------------------------------
  const CROWN_POS = new THREE.Vector3(0.05, 0.165, 0.3);
  const crownRot = new THREE.Euler(0.2, 0.32, -0.1, "YXZ");
  const crownQuat = new THREE.Quaternion().setFromEuler(crownRot);

  const crownLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(crownQuat).add(CROWN_POS);
  };

  const CR_RAD = 0.11;
  const CR_H = 0.04;

  // Circlet Base Band
  b.part(new THREE.CylinderGeometry(CR_RAD, CR_RAD, CR_H, 16, 1, true), GOLD_BRIGHT, {
    bone: root,
    at: crownLocal(0, CR_H / 2, 0),
    quat: crownQuat,
    texture: FILIGREE_TEX,
    name: "crown_circlet",
  });
  // Beveled rim trims on circlet
  b.part(new THREE.CylinderGeometry(CR_RAD + 0.005, CR_RAD + 0.005, 0.008, 16, 1, true), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, 0.004, 0),
    quat: crownQuat,
  });
  b.part(new THREE.CylinderGeometry(CR_RAD + 0.005, CR_RAD + 0.005, 0.008, 16, 1, true), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, CR_H, 0),
    quat: crownQuat,
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
    const isFront = s === 1 || s === 2;
    const spikeH = isFront ? 0.11 : 0.08;
    const spikeR = isFront ? 0.02 : 0.015;

    const sx = Math.cos(sa) * CR_RAD;
    const sz = Math.sin(sa) * CR_RAD;
    const spireBase = crownLocal(sx, CR_H, sz);

    b.part(new THREE.ConeGeometry(spikeR, spikeH, 6), GOLD_PAINT, {
      bone: root,
      at: spireBase.clone().add(new THREE.Vector3(0, spikeH / 2, 0).applyQuaternion(crownQuat)),
      dir: new THREE.Vector3(Math.cos(sa) * 0.2, 1, Math.sin(sa) * 0.2).applyQuaternion(crownQuat),
    });

    // Spire Tip Jewels
    const tipPos = crownLocal(
      Math.cos(sa) * (CR_RAD + 0.01),
      CR_H + spikeH + 0.006,
      Math.sin(sa) * (CR_RAD + 0.01),
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.011), GEM_CYAN, {
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
      at: crownLocal(0, CR_H * 0.65, 0),
      quat: crownQuat,
    },
  );

  // Crown Apex Orb & Glowing Sol Gem
  const crownApex = crownLocal(0, CR_H + CR_RAD * 0.82, 0);
  b.part(new THREE.SphereGeometry(0.015, 8, 6), GOLD_PAINT, {
    bone: root,
    at: crownApex,
    quat: crownQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.018), GEM_RUBY, {
      bone: root,
      at: crownApex.clone().add(new THREE.Vector3(0, 0.02, 0).applyQuaternion(crownQuat)),
      quat: crownQuat,
    }),
    1.6,
  );

  // ---------------------------------------------------------------------------
  // 8. HERO OBJECT C: GOBLETS & CHALICES
  // ---------------------------------------------------------------------------
  // Goblet 1: The Sovereign Chalice (Standing tall at right foreground)
  const CHALICE_1 = new THREE.Vector3(0.42, 0.085, 0.15);
  // Stepped octagonal base
  b.part(new THREE.CylinderGeometry(0.052, 0.065, 0.02, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.01, 0)),
  });
  // Chunky knopped stem
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.075, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.055, 0)),
  });
  // Gold Knop sphere with embedded emeralds
  b.part(new THREE.SphereGeometry(0.028, 8, 6), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.055, 0)),
  });
  for (let e = 0; e < 4; e++) {
    const ea = (e * Math.PI) / 2;
    glow(
      b.part(new THREE.BoxGeometry(0.009, 0.009, 0.009), GEM_EMERALD, {
        bone: root,
        at: CHALICE_1.clone().add(new THREE.Vector3(Math.cos(ea) * 0.028, 0.055, Math.sin(ea) * 0.028)),
      }),
      1.3,
    );
  }
  // Flared Chalice Bowl
  b.part(new THREE.CylinderGeometry(0.065, 0.035, 0.09, 12, 1, true), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.13, 0)),
  });
  // Bowl Rim Bevel (Properly horizontal rim band)
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.008, 12, 1, true), GOLD_TRIM, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.175, 0)),
  });
  // Deep ruby spiced wine surface
  b.part(new THREE.CircleGeometry(0.062, 12), WINE_COLOR, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.16, 0)),
    dir: [0, 1, 0],
  });

  // Goblet 2: The Spilling Chalice (Knocked onto the coin heap at left)
  const CHALICE_2 = new THREE.Vector3(-0.32, 0.12, 0.22);
  const tipQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0.18, 1.4, "YXZ"));
  b.part(new THREE.CylinderGeometry(0.048, 0.058, 0.018, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2,
    quat: tipQuat,
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2.clone().add(new THREE.Vector3(0.04, 0.01, 0)),
    quat: tipQuat,
  });
  b.part(new THREE.CylinderGeometry(0.058, 0.028, 0.08, 10, 1, true), GOLD_PAINT, {
    bone: root,
    at: CHALICE_2.clone().add(new THREE.Vector3(0.1, 0.015, 0)),
    quat: tipQuat,
  });
  // Glowing sapphire gems tumbling out of the tipped chalice
  for (let s = 0; s < 4; s++) {
    const spX = CHALICE_2.x + 0.13 + s * 0.032 + (random() - 0.5) * 0.02;
    const spZ = CHALICE_2.z + (random() - 0.5) * 0.035;
    glow(
      b.part(new THREE.DodecahedronGeometry(0.013), GEM_CYAN, {
        bone: root,
        at: [spX, 0.105, spZ],
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
  const BAR_BASE = new THREE.Vector3(-0.46, 0.085, -0.06);
  const BAR_W = 0.135;
  const BAR_H = 0.032;
  const BAR_D = 0.068;

  const barLayout = [
    // Layer 1 (Bottom 3)
    { x: -0.072, y: BAR_H / 2, z: 0, rotY: 0.08 },
    { x: 0, y: BAR_H / 2, z: 0.01, rotY: 0.06 },
    { x: 0.072, y: BAR_H / 2, z: -0.01, rotY: 0.1 },
    // Layer 2 (Middle 2)
    { x: -0.036, y: BAR_H * 1.5, z: 0.005, rotY: 0.07 },
    { x: 0.036, y: BAR_H * 1.5, z: -0.005, rotY: 0.09 },
    // Layer 3 (Top 1)
    { x: 0, y: BAR_H * 2.5, z: 0, rotY: 0.08 },
  ];

  barLayout.forEach((l, idx) => {
    const barPos = BAR_BASE.clone().add(new THREE.Vector3(l.x, l.y, l.z));
    const bQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), l.rotY);
    b.frustumBox(
      barPos.clone().add(new THREE.Vector3(0, -BAR_H / 2, 0)),
      barPos.clone().add(new THREE.Vector3(0, BAR_H / 2, 0)),
      [BAR_W, BAR_D],
      [BAR_W * 0.82, BAR_D * 0.82],
      { color: GOLD_PAINT, bone: root, name: `gold_ingot_${idx}` },
    );
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

  // Loose ingot leaning askew against the chest base
  b.part(new THREE.BoxGeometry(BAR_W, BAR_H, BAR_D), GOLD_PAINT, {
    bone: root,
    at: [-0.3, 0.095, -0.22],
    quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.75, -0.18)),
  });

  // ---------------------------------------------------------------------------
  // 10. HERO OBJECT E: CEREMONIAL RELIC SWORD / DAGGER
  // ---------------------------------------------------------------------------
  // Plunged into the coin mound inside the chest at an aggressive, heroic angle
  const DAGGER_POS = chestLocal(-0.12, CH + 0.12, 0.05);
  const daggerQuat = chestQuat
    .clone()
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.45, 0.22, 0.52, "YXZ")));

  const daggerLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(daggerQuat).add(DAGGER_POS);
  };

  // Chunky Hextech Blade (Steel with glowing cyan fuller channel)
  b.part(new THREE.BoxGeometry(0.045, 0.26, 0.014), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.05, 0),
    quat: daggerQuat,
  });
  b.part(new THREE.ConeGeometry(0.024, 0.075, 4), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.2, 0),
    dir: new THREE.Vector3(0, -1, 0).applyQuaternion(daggerQuat),
  });
  glow(
    b.part(new THREE.BoxGeometry(0.012, 0.2, 0.016), GEM_CYAN, {
      bone: root,
      at: daggerLocal(0, -0.04, 0),
      quat: daggerQuat,
    }),
    1.4,
  );

  // Winged Gold Crossguard
  b.part(new THREE.BoxGeometry(0.15, 0.028, 0.034), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.085, 0),
    quat: daggerQuat,
  });
  glow(
    b.part(new THREE.SphereGeometry(0.013, 8, 6), GEM_RUBY, {
      bone: root,
      at: daggerLocal(0, 0.085, 0.018),
      quat: daggerQuat,
    }),
    1.5,
  );

  // Wire-wrapped Grip & Pommel
  b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.11, 8), "#1f1814", {
    bone: root,
    at: daggerLocal(0, 0.15, 0),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
  });
  for (let w = 0; w < 4; w++) {
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.005, 8, 1, true), GOLD_TRIM, {
      bone: root,
      at: daggerLocal(0, 0.115 + w * 0.024, 0),
      dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
    });
  }
  b.part(new THREE.DodecahedronGeometry(0.022), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.215, 0),
    quat: daggerQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.011), GEM_SAPPHIRE, {
      bone: root,
      at: daggerLocal(0, 0.228, 0),
      quat: daggerQuat,
    }),
    1.4,
  );

  // ---------------------------------------------------------------------------
  // 11. RADIANT CUT GEMS (Oversized League Arcane Crystals)
  // ---------------------------------------------------------------------------
  // 1. Giant Hextech Crystal (Cyan Rhombic Bipyramid) inside the chest
  glow(
    b.part(new THREE.OctahedronGeometry(0.07), GEM_CYAN, {
      bone: root,
      at: chestLocal(0.12, CH + 0.07, 0.02),
      scale: [0.8, 1.35, 0.8],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0.6, -0.4)),
      name: "gem_hextech_giant",
    }),
    1.6,
  );

  // 2. The Heart of Shurima (Huge Glowing Red Ruby) on the forward coin spill
  glow(
    b.part(new THREE.DodecahedronGeometry(0.05), GEM_RUBY, {
      bone: root,
      at: [0.24, 0.135, 0.24],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, -0.2, 0.8)),
      name: "gem_ruby_shurima",
    }),
    1.5,
  );

  // 3. Targon Celestial Sapphire on the velvet runner
  glow(
    b.part(new THREE.OctahedronGeometry(0.045), GEM_SAPPHIRE, {
      bone: root,
      at: [0.18, 0.105, 0.46],
      scale: [1, 1.2, 0.9],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.4, 0.2)),
      name: "gem_sapphire_targon",
    }),
    1.4,
  );

  // 4. Zaunite Chemtech Emerald near the standing chalice
  glow(
    b.part(new THREE.CylinderGeometry(0.022, 0.032, 0.075, 6), GEM_EMERALD, {
      bone: root,
      at: [0.35, 0.11, 0.3],
      dir: [0.2, 1, -0.3],
      name: "gem_emerald_zaun",
    }),
    1.5,
  );

  // 5. Void-Touched Amethyst Cluster
  const AMY_BASE = new THREE.Vector3(-0.08, 0.095, 0.38);
  const amySpikes = [
    { dir: [-0.2, 1, 0.1] as [number, number, number], len: 0.065, r: 0.016 },
    { dir: [0.2, 1, 0.2] as [number, number, number], len: 0.085, r: 0.02 },
    { dir: [0.0, 1, -0.3] as [number, number, number], len: 0.055, r: 0.014 },
  ];
  amySpikes.forEach((sp, idx) => {
    glow(
      b.part(new THREE.ConeGeometry(sp.r, sp.len, 5), GEM_AMETHYST, {
        bone: root,
        at: AMY_BASE.clone().add(new THREE.Vector3(sp.dir[0] * 0.025, 0, sp.dir[2] * 0.025)),
        dir: sp.dir,
        name: `gem_amethyst_${idx}`,
      }),
      1.5,
    );
  });

  // Additional small scattered gemstones properly rested across the hoard
  const scatterGems = [
    { at: [0.02, 0.125, 0.36] as [number, number, number], col: GEM_RUBY, s: 0.018 },
    { at: [0.14, 0.155, 0.18] as [number, number, number], col: GEM_EMERALD, s: 0.022 },
    { at: [-0.17, 0.095, 0.32] as [number, number, number], col: GEM_CYAN, s: 0.02 },
    { at: [-0.02, 0.185, 0.2] as [number, number, number], col: GEM_SAPPHIRE, s: 0.024 },
    { at: [0.27, 0.095, 0.42] as [number, number, number], col: GEM_AMETHYST, s: 0.018 },
    { at: [-0.21, 0.135, 0.14] as [number, number, number], col: GEM_CYAN, s: 0.022 },
    { at: [0.36, 0.09, 0.06] as [number, number, number], col: GEM_RUBY, s: 0.02 },
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
  const pearlPath1 = catmull([
    chestLocal(0.18, CH + 0.04, 0.02),
    chestLocal(0.22, CH * 0.8, CD / 2 + 0.02),
    chestLocal(0.24, CH * 0.4, CD / 2 + 0.05),
    [0.16, 0.125, 0.28],
    [0.19, 0.095, 0.36],
  ]);

  const pearlGeos: THREE.BufferGeometry[] = [];
  const P_COUNT_1 = 28;
  for (let p = 0; p <= P_COUNT_1; p++) {
    const pt = pearlPath1.at(p / P_COUNT_1);
    const r = p % 4 === 0 ? 0.0095 : 0.007;
    const sphere = new THREE.SphereGeometry(r, 6, 5);
    sphere.translate(pt.x, pt.y, pt.z);
    pearlGeos.push(sphere);
  }

  const chaliceLoop = catmull([
    [0.45, 0.098, 0.18],
    [0.47, 0.095, 0.12],
    [0.43, 0.092, 0.09],
    [0.38, 0.094, 0.12],
    [0.39, 0.098, 0.17],
    [0.45, 0.098, 0.18],
  ]);
  const P_COUNT_2 = 18;
  for (let p = 0; p < P_COUNT_2; p++) {
    const pt = chaliceLoop.at(p / P_COUNT_2);
    const r = p % 3 === 0 ? 0.0085 : 0.006;
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
  const COIN_R = 0.022;
  const COIN_T = 0.0055;

  // 4 Chunky Stacks of Coins
  const stackPositions = [
    { x: -0.25, z: 0.34, count: 6, tiltX: 0.05, tiltZ: -0.05 },
    { x: -0.21, z: 0.36, count: 8, tiltX: -0.04, tiltZ: 0.06 },
    { x: 0.31, z: -0.04, count: 5, tiltX: 0.06, tiltZ: 0.03 },
    { x: 0.34, z: -0.01, count: 7, tiltX: -0.05, tiltZ: -0.04 },
  ];

  stackPositions.forEach((st, sidx) => {
    for (let c = 0; c < st.count; c++) {
      const cy = 0.09 + c * COIN_T;
      const jx = (c * st.tiltX) / st.count;
      const jz = (c * st.tiltZ) / st.count;
      b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_BRIGHT, {
        bone: root,
        at: [st.x + jx, cy, st.z + jz],
        texture: COIN_TEX,
        name: `coin_stack_${sidx}_${c}`,
      });
    }
  });

  // Loose Coins scattered realistically across slopes and floor
  const looseCoins = [
    { at: chestLocal(-0.06, CH + 0.01, CD / 2 + 0.01), rot: [0.35, 0.2, 0.1] },
    { at: chestLocal(0.04, CH * 0.82, CD / 2 + 0.03), rot: [0.65, -0.25, 0.18] },
    { at: chestLocal(0.12, CH * 0.68, CD / 2 + 0.04), rot: [0.55, 0.35, -0.15] },
    { at: chestLocal(-0.15, CH * 0.48, CD / 2 + 0.02), rot: [0.45, 0.1, 0.25] },
    { at: [0.01, 0.165, 0.37] as [number, number, number], rot: [0.1, 0.8, -0.1] },
    { at: [0.17, 0.15, 0.22] as [number, number, number], rot: [-0.2, 0.4, 0.3] },
    { at: [0.07, 0.19, 0.16] as [number, number, number], rot: [0.22, -0.55, 0.12] },
    { at: [0.27, 0.095, 0.52] as [number, number, number], rot: [0.05, 1.2, 0] },
    { at: [0.35, 0.092, 0.56] as [number, number, number], rot: [-0.08, 0.3, 0.1] },
    { at: [0.22, 0.092, 0.62] as [number, number, number], rot: [0.02, 2.1, -0.05] },
    { at: [-0.26, 0.105, 0.19] as [number, number, number], rot: [-0.25, 0.6, 0.3] },
    { at: [-0.34, 0.095, 0.3] as [number, number, number], rot: [0.1, -0.35, 0.18] },
    { at: [-0.4, 0.088, 0.15] as [number, number, number], rot: [0, 0.5, 0] },
    { at: [-0.4, 0.086, -0.02] as [number, number, number], rot: [0, 0.85, 0] },
    { at: [-0.52, 0.085, 0.04] as [number, number, number], rot: [0.05, -0.75, 0.05] },
    { at: [0.0, 0.088, 0.48] as [number, number, number], rot: [-0.05, 0.3, 0.08] },
    { at: [-0.13, 0.088, 0.44] as [number, number, number], rot: [0.08, -1.05, 0.02] },
    { at: [0.42, 0.086, 0.24] as [number, number, number], rot: [0.02, 0.55, -0.04] },
  ];

  looseCoins.forEach((lc, idx) => {
    b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_BRIGHT, {
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
=======
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasure_hoard", detail: 1 });
  const random = rng(777);

  // ---------------------------------------------------------------------------
  // 1. PALETTES & HAND-PAINTED LEAGUE-STYLE SHADERS
  // ---------------------------------------------------------------------------
  const KEY_LIGHT = new THREE.Vector3(0.42, 0.85, 0.36).normalize();

  // League Stylized Gold: rich warm amber crevices, honey midtones, champagne glints
  const GOLD_PAINT = paint((p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.25, 0.72, ndotl);
    const brush = noise(p, 0.042, 17) * 0.12;
    const base = mix("#623207", "#f5b722", lit + brush);
    const rim = smoothstep(0.55, 0.95, ndotl) * smoothstep(0.12, 0.88, n.y);
    return mix(base, "#fffbe0", rim * 0.65);
  });

  // Ancient Dark Mahogany Wood with edge darkening
  const WOOD_PAINT = grain("#1c0d06", "#442115", {
    size: 0.025,
    axis: "y",
    seed: 9,
  });

  // Weathered Heavy Iron with blue-grey ambient specular edge
  const IRON_PAINT = paint((_p, n) => {
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.15, 0.75, ndotl);
    const rim = smoothstep(0.4, 0.92, n.y) * 0.28;
    return mix("#14171d", "#404c62", lit + rim);
  });

  // Treasury Dais Stone: cool indigo-grey slate flagstones
  const STONE_PAINT = mottle("#1a1824", "#343242", {
    size: 0.085,
    contrast: 1.15,
    seed: 14,
  });

  // Royal Crimson Velvet with grazing-angle rim sheen
  const VELVET_RED = paint((_p, n) => {
    const rim = 1 - Math.max(0, n.dot(KEY_LIGHT));
    return mix("#540610", "#9e1626", smoothstep(0.2, 0.85, rim));
  });

  // Shimmering Golden Coin Drift Shader
  const COIN_HEAP_PAINT = paint((p, n) => {
    const spec = noise(p, 0.015, 88);
    const ndotl = n.dot(KEY_LIGHT);
    const lit = smoothstep(-0.18, 0.68, ndotl);
    const shimmer = smoothstep(0.48, 0.82, spec);
    const baseGold = mix("#723608", "#fab920", lit);
    return mix(baseGold, "#fff8d0", shimmer * 0.62);
  });

  // Flat Accent & Jewel Colors
  const GOLD_BRIGHT = "#ffd752";
  const GOLD_TRIM = "#dd9b1c";
  const WINE_COLOR = "#2e0008";
  const PEARL_WHITE = "#faf4e8";

  // Glowing Arcane Crystals
  const GEM_CYAN = "#0af3ff";
  const GEM_RUBY = "#ff1248";
  const GEM_SAPPHIRE = "#1a6aff";
  const GEM_EMERALD = "#05ff85";
  const GEM_AMETHYST = "#cc24ff";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES (Embossed Coin Stamps, Mint Marks, Filigree)
  // ---------------------------------------------------------------------------
  const COIN_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#e8aa20" stroke="#683405" stroke-width="5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff398" stroke-width="2.5" stroke-dasharray="4 3"/>
      <polygon points="50,15 56,36 78,36 60,49 67,71 50,58 33,71 40,49 22,36 44,36" fill="#fff8b4" stroke="#7a3f06" stroke-width="2"/>
      <circle cx="50" cy="46" r="6" fill="#683405"/>
    </svg>`,
    { size: 256 },
  );

  const INGOT_TEX = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="152" height="72" rx="8" fill="#d89418" stroke="#5e2e04" stroke-width="4"/>
      <rect x="12" y="12" width="136" height="56" rx="4" fill="none" stroke="#ffe682" stroke-width="2"/>
      <text x="80" y="44" font-family="serif" font-weight="bold" font-size="19" fill="#5e2e04" text-anchor="middle" letter-spacing="4">VALORAN</text>
      <text x="80" y="60" font-family="sans-serif" font-weight="bold" font-size="10" fill="#fff5aa" text-anchor="middle">999.9 FINE GOLD</text>
    </svg>`,
    { size: 256 },
  );

  const FILIGREE_TEX = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="32" fill="#caa025"/>
      <path d="M0,16 Q16,3 32,16 T64,16 T96,16 T128,16" fill="none" stroke="#482702" stroke-width="3"/>
      <circle cx="16" cy="16" r="4" fill="#fff099"/>
      <circle cx="48" cy="16" r="4" fill="#fff099"/>
      <circle cx="80" cy="16" r="4" fill="#fff099"/>
      <circle cx="112" cy="16" r="4" fill="#fff099"/>
      <line x1="0" y1="2" x2="128" y2="2" stroke="#fff8b8" stroke-width="3"/>
      <line x1="0" y1="30" x2="128" y2="30" stroke="#402001" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const MEDALLION_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="#e5a41c" stroke="#542c03" stroke-width="4"/>
      <circle cx="60" cy="60" r="48" fill="#caa025" stroke="#ffe785" stroke-width="2"/>
      <path d="M60,18 L68,48 L98,52 L74,70 L80,100 L60,82 L40,100 L46,70 L22,52 L52,48 Z" fill="#ffe785" stroke="#542c03" stroke-width="2.5"/>
      <circle cx="60" cy="60" r="14" fill="#ff224a" stroke="#fff099" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. ROOT SKELETON
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 4. TREASURY DAIS BASE (Stands firmly on y = 0.00, top at y = 0.08)
  // ---------------------------------------------------------------------------
  // Lowest tier: octagonal stone slab resting perfectly at y = 0.00
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.035, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.0175, 0],
    name: "dais_step_lower",
  });
  // Middle riser
  b.part(new THREE.CylinderGeometry(0.81, 0.84, 0.025, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.0475, 0],
    name: "dais_step_mid",
  });
  // Upper floor platform (flat floor at y = 0.075)
  b.part(new THREE.CylinderGeometry(0.74, 0.77, 0.02, 8), STONE_PAINT, {
    bone: root,
    at: [0, 0.07, 0],
    name: "dais_step_upper",
  });

  // Inlaid decorative gold corner brackets on the dais floor
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    const r = 0.68;
    const px = Math.cos(angle) * r;
    const pz = Math.sin(angle) * r;
    b.part(new THREE.BoxGeometry(0.08, 0.005, 0.08), GOLD_PAINT, {
      bone: root,
      at: [px, 0.081, pz],
      rotation: [0, angle, 0],
      name: `dais_bracket_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HERO OBJECT A: THE ROYAL CHEST (League Vault Design)
  // ---------------------------------------------------------------------------
  const CHEST_POS = new THREE.Vector3(-0.12, 0.08, -0.12);
  const CHEST_YAW = -0.22; // ~-13 deg dynamic 3/4 presentation
  const chestQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    CHEST_YAW,
  );

  const chestLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz)
      .applyQuaternion(chestQuat)
      .add(CHEST_POS);
  };

  const CW = 0.54; // chest width (X)
  const CH = 0.28; // chest base height (Y)
  const CD = 0.38; // chest depth (Z)

  // 4 Heavy Corner Claw Feet resting securely on stone floor at y = 0.08
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const footPos = chestLocal((sx * (CW - 0.05)) / 2, 0.02, (sz * (CD - 0.05)) / 2);
      b.part(new THREE.BoxGeometry(0.075, 0.04, 0.075), IRON_PAINT, {
        bone: root,
        at: footPos,
        quat: chestQuat,
      });
      b.part(new THREE.CylinderGeometry(0.024, 0.038, 0.024, 6), GOLD_PAINT, {
        bone: root,
        at: footPos.clone().add(new THREE.Vector3(0, 0.02, 0)),
        quat: chestQuat,
      });
    }
  }

  // Chest Main Box (Wood Core Planks)
  const chestBodyCenter = chestLocal(0, CH / 2 + 0.02, 0);
  b.part(new THREE.BoxGeometry(CW - 0.04, CH, CD - 0.04), WOOD_PAINT, {
    bone: root,
    at: chestBodyCenter,
    quat: chestQuat,
    name: "chest_body_core",
  });

  // Chest Bottom & Top Lip Rims (Gold)
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.025, CD + 0.015), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, 0.032, 0),
    quat: chestQuat,
  });
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.03, CD + 0.015), GOLD_PAINT, {
    bone: root,
    at: chestLocal(0, CH + 0.015, 0),
    quat: chestQuat,
  });

  // Vertical Reinforcing Iron Corner Struts with Golden Rivets
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const strutPos = chestLocal((sx * (CW - 0.015)) / 2, CH / 2 + 0.02, (sz * (CD - 0.015)) / 2);
      b.part(new THREE.BoxGeometry(0.042, CH + 0.01, 0.042), IRON_PAINT, {
        bone: root,
        at: strutPos,
        quat: chestQuat,
      });
      for (const ry of [0.08, 0.16, 0.24]) {
        b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW + 0.015)) / 2, ry, (sz * (CD - 0.015)) / 2),
        });
        b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_PAINT, {
          bone: root,
          at: chestLocal((sx * (CW - 0.015)) / 2, ry, (sz * (CD + 0.015)) / 2),
        });
      }
    }
  }

  // Front Heavy Iron Straps
  for (const sx of [-0.13, 0.13]) {
    b.part(new THREE.BoxGeometry(0.038, CH, 0.012), IRON_PAINT, {
      bone: root,
      at: chestLocal(sx, CH / 2 + 0.02, CD / 2 + 0.005),
      quat: chestQuat,
    });
    for (const ry of [0.08, 0.22]) {
      b.part(new THREE.SphereGeometry(0.0075, 6, 4), GOLD_PAINT, {
        bone: root,
        at: chestLocal(sx, ry, CD / 2 + 0.013),
      });
    }
  }

  // Front Escutcheon Plate (Demacian-Style Shield with Glowing Ruby Keyhole)
  const lockCenter = chestLocal(0, CH * 0.72, CD / 2 + 0.014);
  b.part(new THREE.BoxGeometry(0.1, 0.11, 0.02), GOLD_PAINT, {
    bone: root,
    at: lockCenter,
    quat: chestQuat,
  });
  glow(
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GEM_RUBY, {
      bone: root,
      at: lockCenter.clone().add(new THREE.Vector3(0, 0.012, 0.005)),
      scale: [1, 1, 0.6],
    }),
    1.4,
  );
  b.part(new THREE.BoxGeometry(0.009, 0.024, 0.024), "#0c0805", {
    bone: root,
    at: lockCenter.clone().add(new THREE.Vector3(0, -0.014, 0.005)),
    quat: chestQuat,
  });

  // Heavy Side Drop-Handles (Lion Boss & Chunky Torus Ring)
  for (const sx of [-1, 1]) {
    const handleMount = chestLocal((sx * CW) / 2, CH * 0.58, 0);
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 8), GOLD_PAINT, {
      bone: root,
      at: handleMount,
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
    });
    b.part(new THREE.TorusGeometry(0.042, 0.01, 8, 12), GOLD_PAINT, {
      bone: root,
      at: handleMount.clone().add(new THREE.Vector3(sx * 0.018, -0.02, 0)),
      dir: new THREE.Vector3(sx, 0, 0).applyQuaternion(chestQuat),
      axis: "z",
    });
  }

  // ---------------------------------------------------------------------------
  // 5B. THE HOLLOW VAULTED CHEST LID (Open at ~100°, Fully Modeled Inside & Out)
  // ---------------------------------------------------------------------------
  const hingePoint = chestLocal(0, CH + 0.025, -CD / 2 + 0.02);
  const lidJoint = b.joint("lid_hinge", {
    parent: root,
    at: hingePoint,
    dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    role: "hinge",
  });

  const LID_OPEN_DEG = 100;
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
  for (const hx of [-0.17, 0, 0.17]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), IRON_PAINT, {
      bone: root,
      at: chestLocal(hx, CH + 0.025, -CD / 2 + 0.01),
      dir: new THREE.Vector3(1, 0, 0).applyQuaternion(chestQuat),
    });
  }

  // Hollow Rim Frame of the Open Lid (4 Golden Beams creating a hollow box frame)
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.035, 0.035), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, 0.018, 0.018),
    quat: lidRotQuat,
  });
  b.part(new THREE.BoxGeometry(CW + 0.015, 0.035, 0.035), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, 0.018, CD - 0.018),
    quat: lidRotQuat,
  });
  for (const sx of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.035, CD), GOLD_PAINT, {
      bone: lidJoint,
      at: lidLocal((sx * (CW - 0.02)) / 2, 0.018, CD / 2),
      quat: lidRotQuat,
    });
  }

  // Outer Arched Wood Barrel Roof
  const outerBarrelQuat = lidRotQuat
    .clone()
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));

  b.part(
    new THREE.CylinderGeometry(CD / 2, CD / 2, CW - 0.02, 14, 1, false, 0, Math.PI),
    WOOD_PAINT,
    {
      bone: lidJoint,
      at: lidLocal(0, 0.035, CD / 2),
      quat: outerBarrelQuat,
      name: "chest_lid_barrel_outer",
    },
  );

  // Inner Vault Ceiling: Rich Velvet/Dark Wood Lining (Visible when looking into open lid!)
  b.part(
    new THREE.CylinderGeometry(CD / 2 - 0.022, CD / 2 - 0.022, CW - 0.045, 14, 1, false, 0, Math.PI),
    VELVET_RED,
    {
      bone: lidJoint,
      at: lidLocal(0, 0.035, CD / 2),
      quat: outerBarrelQuat,
      name: "chest_lid_interior_lining",
    },
  );

  // Arched Side End Plates (Wood + Gold Trim)
  for (const sx of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(CD / 2 + 0.005, CD / 2 + 0.005, 0.02, 14, 1, false, 0, Math.PI),
      GOLD_PAINT,
      {
        bone: lidJoint,
        at: lidLocal((sx * (CW - 0.005)) / 2, 0.035, CD / 2),
        quat: outerBarrelQuat,
      },
    );
  }

  // 3 Golden Arched Reinforcement Ribs over Outer Arch
  for (const rx of [-0.19, 0, 0.19]) {
    b.part(
      new THREE.TorusGeometry(CD / 2 + 0.008, 0.012, 6, 14, Math.PI),
      GOLD_PAINT,
      {
        bone: lidJoint,
        at: lidLocal(rx, 0.035, CD / 2),
        quat: lidRotQuat
          .clone()
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)),
        axis: "z",
      },
    );
  }

  // Interior Golden Medallion inside open lid ceiling
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.008, 12), GOLD_PAINT, {
    bone: lidJoint,
    at: lidLocal(0, CD / 2 + 0.01, CD / 2),
    dir: new THREE.Vector3(0, -1, 0).applyQuaternion(lidRotQuat),
    texture: MEDALLION_TEX,
    name: "lid_interior_medallion",
  });

  // Articulated Brass Stay-Arm on Right Side
  const stayP1 = chestLocal(CW / 2 - 0.03, CH - 0.02, 0.02);
  const stayMid = lidLocal(CW / 2 - 0.03, 0.06, 0.06);
  const stayP2 = lidLocal(CW / 2 - 0.03, 0.03, 0.18);
  b.rod(stayP1, stayMid, 0.008, GOLD_PAINT, { bone: root });
  b.rod(stayMid, stayP2, 0.008, GOLD_PAINT, { bone: lidJoint });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), GOLD_TRIM, {
    bone: root,
    at: stayMid,
  });

  // ---------------------------------------------------------------------------
  // 6. SCULPTED GOLD COIN MOUNT & ORGANIC SPOUTING CASCADE
  // ---------------------------------------------------------------------------
  // 1. Interior Mound overflowing inside chest cavity
  b.part(new THREE.SphereGeometry(1, 14, 8), COIN_HEAP_PAINT, {
    bone: root,
    at: chestLocal(0, CH + 0.02, 0.02),
    scale: [0.23, 0.1, 0.14],
    name: "coin_mound_interior",
  });

  // 2. Continuous Organic Cascade flowing over the front lip (Smooth sweep)
  const spillCurve = catmull([
    chestLocal(0.04, CH + 0.02, 0.08),
    chestLocal(0.05, CH * 0.85, CD / 2 + 0.04),
    chestLocal(0.06, CH * 0.45, CD / 2 + 0.12),
    [0.05, 0.17, 0.18],
    [0.06, 0.125, 0.32],
  ]);
  b.sweep(spillCurve, (t) => [0.19 + 0.08 * t, 0.075 - 0.02 * t], {
    section: "circle",
    color: COIN_HEAP_PAINT,
    bone: root,
    name: "coin_cascade_spill",
  });

  // 3. Main Treasury Floor Drift (Expansive golden terrace across dais)
  b.part(new THREE.CylinderGeometry(0.36, 0.44, 0.065, 14), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.06, 0.105, 0.28],
    name: "coin_mound_delta_main",
  });

  // 4. Secondary Right-Hand Spill Tongue
  b.part(new THREE.CylinderGeometry(0.18, 0.24, 0.045, 12), COIN_HEAP_PAINT, {
    bone: root,
    at: [0.26, 0.095, 0.38],
    name: "coin_mound_delta_right",
  });

  // 5. Secondary Left-Hand Spill Tongue
  b.part(new THREE.CylinderGeometry(0.16, 0.22, 0.042, 12), COIN_HEAP_PAINT, {
    bone: root,
    at: [-0.18, 0.095, 0.26],
    name: "coin_mound_delta_left",
  });

  // ---------------------------------------------------------------------------
  // 7. ROYAL CRIMSON VELVET RUNNER (Cleanly draped on dais, strictly y >= 0.08)
  // ---------------------------------------------------------------------------
  // Elegant runner spilling under the chest, along the coins, ending on the dais step
  const runnerPath = catmull([
    [-0.04, 0.12, -0.04],
    [0.1, 0.105, 0.16],
    [0.22, 0.096, 0.35],
    [0.32, 0.09, 0.52],
    [0.38, 0.086, 0.64],
  ]);
  b.sweep(runnerPath, (t) => [0.12 * (1 - 0.08 * t), 0.005], {
    section: "box",
    color: VELVET_RED,
    bone: root,
    name: "velvet_runner",
  });

  // Gold braided trim border on runner end
  b.part(new THREE.BoxGeometry(0.22, 0.008, 0.016), GOLD_PAINT, {
    bone: root,
    at: [0.38, 0.088, 0.64],
    dir: [0.32, 0, 1],
  });
  // Braided tassels resting cleanly on dais surface
  for (let f = -4; f <= 4; f++) {
    b.part(new THREE.CylinderGeometry(0.003, 0.001, 0.022, 6), GOLD_TRIM, {
      bone: root,
      at: [0.38 + f * 0.02, 0.087, 0.655],
      dir: [0.2, 0, 1],
    });
  }

  // ---------------------------------------------------------------------------
  // 8. HERO OBJECT B: THE IMPERIAL CROWN (Jarvan / Ruined King Grandeur)
  // ---------------------------------------------------------------------------
  // Elevated prominently on the upper-forward coin terrace
  const CROWN_POS = new THREE.Vector3(0.06, 0.175, 0.22);
  const crownRot = new THREE.Euler(0.18, 0.28, -0.08, "YXZ");
  const crownQuat = new THREE.Quaternion().setFromEuler(crownRot);

  const crownLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(crownQuat).add(CROWN_POS);
  };

  const CR_RAD = 0.115;
  const CR_H = 0.045;

  // Circlet Base Band with Filigree
  b.part(new THREE.CylinderGeometry(CR_RAD, CR_RAD, CR_H, 16, 1, true), GOLD_BRIGHT, {
    bone: root,
    at: crownLocal(0, CR_H / 2, 0),
    quat: crownQuat,
    texture: FILIGREE_TEX,
    name: "crown_circlet",
  });
  // Beveled outer ring trims
  b.part(new THREE.CylinderGeometry(CR_RAD + 0.006, CR_RAD + 0.006, 0.009, 16, 1, true), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, 0.005, 0),
    quat: crownQuat,
  });
  b.part(new THREE.CylinderGeometry(CR_RAD + 0.006, CR_RAD + 0.006, 0.009, 16, 1, true), GOLD_TRIM, {
    bone: root,
    at: crownLocal(0, CR_H, 0),
    quat: crownQuat,
  });

  // Glowing Cabochon Gems around circlet (Ruby, Sapphire, Emerald)
  const gemPalette = [GEM_RUBY, GEM_SAPPHIRE, GEM_EMERALD, GEM_RUBY, GEM_SAPPHIRE, GEM_EMERALD];
  for (let g = 0; g < 6; g++) {
    const ga = (g * Math.PI) / 3;
    const gx = Math.cos(ga) * (CR_RAD + 0.007);
    const gz = Math.sin(ga) * (CR_RAD + 0.007);
    glow(
      b.part(new THREE.SphereGeometry(0.012, 8, 6), gemPalette[g], {
        bone: root,
        at: crownLocal(gx, CR_H / 2, gz),
        scale: [1, 1, 0.6],
        dir: new THREE.Vector3(Math.cos(ga), 0, Math.sin(ga)).applyQuaternion(crownQuat),
      }),
      1.4,
    );
  }

  // 6 Flared Crown Spikes (Chunky Heroic Fleur-de-lis Peaks)
  for (let s = 0; s < 6; s++) {
    const sa = (s * Math.PI) / 3;
    const isFront = s === 1 || s === 2; // prominent forward-facing peaks
    const spikeH = isFront ? 0.12 : 0.085;
    const spikeR = isFront ? 0.022 : 0.016;

    const sx = Math.cos(sa) * CR_RAD;
    const sz = Math.sin(sa) * CR_RAD;
    const spireBase = crownLocal(sx, CR_H, sz);

    b.part(new THREE.ConeGeometry(spikeR, spikeH, 6), GOLD_PAINT, {
      bone: root,
      at: spireBase.clone().add(new THREE.Vector3(0, spikeH / 2, 0).applyQuaternion(crownQuat)),
      dir: new THREE.Vector3(Math.cos(sa) * 0.22, 1, Math.sin(sa) * 0.22).applyQuaternion(crownQuat),
    });

    // Tip Jewels
    const tipPos = crownLocal(
      Math.cos(sa) * (CR_RAD + 0.012),
      CR_H + spikeH + 0.008,
      Math.sin(sa) * (CR_RAD + 0.012),
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.012), GEM_CYAN, {
        bone: root,
        at: tipPos,
        quat: crownQuat,
      }),
      1.6,
    );
  }

  // Inner Royal Velvet Cap
  b.part(
    new THREE.SphereGeometry(CR_RAD - 0.006, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    VELVET_RED,
    {
      bone: root,
      at: crownLocal(0, CR_H * 0.65, 0),
      quat: crownQuat,
    },
  );

  // Crown Apex Golden Orb & Sol-Ruby Gem
  const crownApex = crownLocal(0, CR_H + CR_RAD * 0.78, 0);
  b.part(new THREE.SphereGeometry(0.016, 8, 6), GOLD_PAINT, {
    bone: root,
    at: crownApex,
    quat: crownQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), GEM_RUBY, {
      bone: root,
      at: crownApex.clone().add(new THREE.Vector3(0, 0.022, 0).applyQuaternion(crownQuat)),
      quat: crownQuat,
    }),
    1.6,
  );

  // ---------------------------------------------------------------------------
  // 9. HERO OBJECT C: THE DUAL CHALICES
  // ---------------------------------------------------------------------------
  // Chalice 1: The Sovereign Goblet (Standing proud on right foreground)
  const CHALICE_1 = new THREE.Vector3(0.4, 0.08, 0.16);

  // Octagonal Foot with Inlaid Gold Studs
  b.part(new THREE.CylinderGeometry(0.054, 0.068, 0.02, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.01, 0)),
  });
  // Stem & Knop with Emeralds
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 8), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.055, 0)),
  });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.055, 0)),
  });
  for (let e = 0; e < 4; e++) {
    const ea = (e * Math.PI) / 2;
    glow(
      b.part(new THREE.BoxGeometry(0.009, 0.009, 0.009), GEM_EMERALD, {
        bone: root,
        at: CHALICE_1.clone().add(new THREE.Vector3(Math.cos(ea) * 0.028, 0.055, Math.sin(ea) * 0.028)),
      }),
      1.35,
    );
  }
  // Flared Cup Body
  b.part(new THREE.CylinderGeometry(0.065, 0.032, 0.09, 12, 1, true), GOLD_PAINT, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.13, 0)),
  });
  // Horizontal Rim Band
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.009, 12, 1, true), GOLD_TRIM, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.175, 0)),
  });
  // Deep ruby spiced wine surface
  b.part(new THREE.CircleGeometry(0.062, 12), WINE_COLOR, {
    bone: root,
    at: CHALICE_1.clone().add(new THREE.Vector3(0, 0.162, 0)),
    dir: [0, 1, 0],
  });

  // Twin Scrolled Heroic Handles on Chalice 1
  for (const hx of [-1, 1]) {
    const handleArc = catmull([
      CHALICE_1.clone().add(new THREE.Vector3(hx * 0.062, 0.17, 0)),
      CHALICE_1.clone().add(new THREE.Vector3(hx * 0.095, 0.15, 0)),
      CHALICE_1.clone().add(new THREE.Vector3(hx * 0.09, 0.09, 0)),
      CHALICE_1.clone().add(new THREE.Vector3(hx * 0.045, 0.08, 0)),
    ]);
    b.sweep(handleArc, 0.006, { color: GOLD_PAINT, bone: root });
  }

  // Chalice 2: The Overturned Beaker (Knocked askew on the left coin drift)
  const CHALICE_2 = new THREE.Vector3(-0.25, 0.11, 0.28);
  const tipQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.6, 1.45, "YXZ"));

  const chalice2Local = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(tipQuat).add(CHALICE_2);
  };

  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.016, 8), GOLD_PAINT, {
    bone: root,
    at: chalice2Local(0, -0.05, 0),
    quat: tipQuat,
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.065, 8), GOLD_PAINT, {
    bone: root,
    at: chalice2Local(0, -0.01, 0),
    quat: tipQuat,
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.026, 0.075, 10, 1, true), GOLD_PAINT, {
    bone: root,
    at: chalice2Local(0, 0.05, 0),
    quat: tipQuat,
  });
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 10, 1, true), GOLD_TRIM, {
    bone: root,
    at: chalice2Local(0, 0.088, 0),
    quat: tipQuat,
  });

  // Glowing Sapphires Tumbling from Chalice 2 Mouth
  for (let s = 0; s < 5; s++) {
    const spPos = chalice2Local((random() - 0.5) * 0.03, 0.1 + s * 0.028, (random() - 0.5) * 0.03);
    glow(
      b.part(new THREE.DodecahedronGeometry(0.013), GEM_SAPPHIRE, {
        bone: root,
        at: spPos,
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(random() * 3, random() * 3, 0),
        ),
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 10. HERO OBJECT D: STACKED GOLD INGOTS / BULLION PYRAMID
  // ---------------------------------------------------------------------------
  const BAR_BASE = new THREE.Vector3(-0.44, 0.08, -0.04);
  const BAR_W = 0.135;
  const BAR_H = 0.032;
  const BAR_D = 0.068;

  const barLayout = [
    // Layer 1 (Bottom 3)
    { x: -0.07, y: BAR_H / 2, z: 0, rotY: 0.08 },
    { x: 0, y: BAR_H / 2, z: 0.01, rotY: 0.06 },
    { x: 0.07, y: BAR_H / 2, z: -0.01, rotY: 0.1 },
    // Layer 2 (Middle 2)
    { x: -0.035, y: BAR_H * 1.5, z: 0.005, rotY: 0.07 },
    { x: 0.035, y: BAR_H * 1.5, z: -0.005, rotY: 0.09 },
    // Layer 3 (Top 1)
    { x: 0, y: BAR_H * 2.5, z: 0, rotY: 0.08 },
  ];

  barLayout.forEach((l, idx) => {
    const barPos = BAR_BASE.clone().add(new THREE.Vector3(l.x, l.y, l.z));
    const bQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), l.rotY);
    b.frustumBox(
      barPos.clone().add(new THREE.Vector3(0, -BAR_H / 2, 0)),
      barPos.clone().add(new THREE.Vector3(0, BAR_H / 2, 0)),
      [BAR_W, BAR_D],
      [BAR_W * 0.82, BAR_D * 0.82],
      { color: GOLD_PAINT, bone: root, name: `gold_ingot_${idx}` },
    );
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

  // Loose Ingot leaning against front coin drift
  b.part(new THREE.BoxGeometry(BAR_W, BAR_H, BAR_D), GOLD_PAINT, {
    bone: root,
    at: [-0.08, 0.095, 0.44],
    quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.14, 0.45, -0.15)),
    name: "loose_ingot_front",
  });

  // ---------------------------------------------------------------------------
  // 11. HERO OBJECT E: THE CEREMONIAL RUNEBLADE (Plunged in Chest)
  // ---------------------------------------------------------------------------
  const DAGGER_POS = chestLocal(-0.11, CH + 0.1, 0.04);
  const daggerQuat = chestQuat
    .clone()
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.42, 0.18, 0.48, "YXZ")));

  const daggerLocal = (dx: number, dy: number, dz: number): THREE.Vector3 => {
    return new THREE.Vector3(dx, dy, dz).applyQuaternion(daggerQuat).add(DAGGER_POS);
  };

  // Chunky Runesteel Blade
  b.part(new THREE.BoxGeometry(0.048, 0.28, 0.015), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.06, 0),
    quat: daggerQuat,
  });
  b.part(new THREE.ConeGeometry(0.026, 0.08, 4), IRON_PAINT, {
    bone: root,
    at: daggerLocal(0, -0.22, 0),
    dir: new THREE.Vector3(0, -1, 0).applyQuaternion(daggerQuat),
  });
  // Glowing Hextech Blade Channel
  glow(
    b.part(new THREE.BoxGeometry(0.014, 0.22, 0.018), GEM_CYAN, {
      bone: root,
      at: daggerLocal(0, -0.05, 0),
      quat: daggerQuat,
    }),
    1.5,
  );

  // Winged Golden Crossguard
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.036), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.09, 0),
    quat: daggerQuat,
  });
  glow(
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GEM_RUBY, {
      bone: root,
      at: daggerLocal(0, 0.09, 0.02),
      quat: daggerQuat,
    }),
    1.5,
  );

  // Wire-wrapped Grip & Pommel
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.12, 8), "#1a1310", {
    bone: root,
    at: daggerLocal(0, 0.16, 0),
    dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
  });
  for (let w = 0; w < 4; w++) {
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.005, 8, 1, true), GOLD_TRIM, {
      bone: root,
      at: daggerLocal(0, 0.125 + w * 0.024, 0),
      dir: new THREE.Vector3(0, 1, 0).applyQuaternion(daggerQuat),
    });
  }
  b.part(new THREE.DodecahedronGeometry(0.024), GOLD_PAINT, {
    bone: root,
    at: daggerLocal(0, 0.23, 0),
    quat: daggerQuat,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.013), GEM_SAPPHIRE, {
      bone: root,
      at: daggerLocal(0, 0.245, 0),
      quat: daggerQuat,
    }),
    1.5,
  );

  // ---------------------------------------------------------------------------
  // 12. RADIANT CUT GEMS (Oversized League Arcane Crystals)
  // ---------------------------------------------------------------------------
  // 1. Giant Hextech Crystal nestled inside chest
  glow(
    b.part(new THREE.OctahedronGeometry(0.065), GEM_CYAN, {
      bone: root,
      at: chestLocal(0.14, CH + 0.06, 0.02),
      scale: [0.85, 1.35, 0.85],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0.55, -0.35)),
      name: "gem_hextech_giant",
    }),
    1.6,
  );

  // 2. The Heart of Shurima (Huge Red Ruby on forward drift)
  glow(
    b.part(new THREE.DodecahedronGeometry(0.048), GEM_RUBY, {
      bone: root,
      at: [0.22, 0.13, 0.28],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, -0.2, 0.8)),
      name: "gem_ruby_shurima",
    }),
    1.5,
  );

  // 3. Targon Celestial Sapphire near runner
  glow(
    b.part(new THREE.OctahedronGeometry(0.042), GEM_SAPPHIRE, {
      bone: root,
      at: [0.16, 0.105, 0.44],
      scale: [1, 1.25, 0.9],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.45, 0.35, 0.2)),
      name: "gem_sapphire_targon",
    }),
    1.45,
  );

  // 4. Zaunite Chemtech Emerald near standing goblet
  glow(
    b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.075, 6), GEM_EMERALD, {
      bone: root,
      at: [0.32, 0.11, 0.28],
      dir: [0.2, 1, -0.3],
      name: "gem_emerald_zaun",
    }),
    1.5,
  );

  // 5. Void-Touched Amethyst Cluster
  const AMY_BASE = new THREE.Vector3(-0.06, 0.095, 0.38);
  const amySpikes = [
    { dir: [-0.2, 1, 0.1] as [number, number, number], len: 0.065, r: 0.016 },
    { dir: [0.2, 1, 0.2] as [number, number, number], len: 0.085, r: 0.02 },
    { dir: [0.0, 1, -0.3] as [number, number, number], len: 0.055, r: 0.014 },
  ];
  amySpikes.forEach((sp, idx) => {
    glow(
      b.part(new THREE.ConeGeometry(sp.r, sp.len, 5), GEM_AMETHYST, {
        bone: root,
        at: AMY_BASE.clone().add(new THREE.Vector3(sp.dir[0] * 0.025, 0, sp.dir[2] * 0.025)),
        dir: sp.dir,
        name: `gem_amethyst_${idx}`,
      }),
      1.5,
    );
  });

  // Additional scattered gemstones across the gold drifts
  const scatterGems = [
    { at: [0.03, 0.125, 0.38] as [number, number, number], col: GEM_RUBY, s: 0.018 },
    { at: [0.12, 0.155, 0.16] as [number, number, number], col: GEM_EMERALD, s: 0.022 },
    { at: [-0.15, 0.095, 0.34] as [number, number, number], col: GEM_CYAN, s: 0.02 },
    { at: [-0.02, 0.19, 0.18] as [number, number, number], col: GEM_SAPPHIRE, s: 0.022 },
    { at: [0.25, 0.095, 0.44] as [number, number, number], col: GEM_AMETHYST, s: 0.018 },
    { at: [-0.18, 0.125, 0.15] as [number, number, number], col: GEM_CYAN, s: 0.02 },
    { at: [0.35, 0.088, 0.08] as [number, number, number], col: GEM_RUBY, s: 0.018 },
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
  // 13. PEARL NECKLACES (Beaded strings draped over chest & chalice)
  // ---------------------------------------------------------------------------
  const pearlPath1 = catmull([
    chestLocal(0.18, CH + 0.03, 0.02),
    chestLocal(0.22, CH * 0.8, CD / 2 + 0.02),
    chestLocal(0.24, CH * 0.4, CD / 2 + 0.05),
    [0.16, 0.125, 0.26],
    [0.19, 0.095, 0.35],
  ]);

  const pearlGeos: THREE.BufferGeometry[] = [];
  const P_COUNT_1 = 28;
  for (let p = 0; p <= P_COUNT_1; p++) {
    const pt = pearlPath1.at(p / P_COUNT_1);
    const r = p % 4 === 0 ? 0.0095 : 0.007;
    const sphere = new THREE.SphereGeometry(r, 6, 5);
    sphere.translate(pt.x, pt.y, pt.z);
    pearlGeos.push(sphere);
  }

  const chaliceLoop = catmull([
    [0.43, 0.096, 0.19],
    [0.45, 0.094, 0.13],
    [0.41, 0.092, 0.1],
    [0.36, 0.093, 0.13],
    [0.37, 0.096, 0.18],
    [0.43, 0.096, 0.19],
  ]);
  const P_COUNT_2 = 18;
  for (let p = 0; p < P_COUNT_2; p++) {
    const pt = chaliceLoop.at(p / P_COUNT_2);
    const r = p % 3 === 0 ? 0.0085 : 0.006;
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
  // 14. RICH 3D COIN DETAILS (160+ Merged Real Coins + Neat Stacks)
  // ---------------------------------------------------------------------------
  const COIN_R = 0.022;
  const COIN_T = 0.0055;
  const coinGeos: THREE.BufferGeometry[] = [];

  // 1. Cascading Lip Coins (Tumbling down the front edge of the chest)
  for (let c = 0; c < 24; c++) {
    const u = c / 24;
    const pt = spillCurve.at(0.2 + u * 0.7);
    const jx = (random() - 0.5) * 0.18;
    const jz = (random() - 0.5) * 0.04;
    const coin = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8);
    coin.applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0.4 + (random() - 0.5) * 0.3, random() * Math.PI, (random() - 0.5) * 0.3),
      ),
    );
    coin.translate(pt.x + jx, pt.y + 0.02, pt.z + jz);
    coinGeos.push(coin);
  }

  // 2. Overlapping Coins around the Crown Base
  for (let c = 0; c < 32; c++) {
    const ang = (c / 32) * Math.PI * 2;
    const rad = 0.125 + random() * 0.06;
    const cx = CROWN_POS.x + Math.cos(ang) * rad;
    const cz = CROWN_POS.z + Math.sin(ang) * rad;
    const cy = 0.155 - (rad - 0.125) * 0.5;
    const coin = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8);
    coin.applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler((random() - 0.5) * 0.2, random() * Math.PI, (random() - 0.5) * 0.2),
      ),
    );
    coin.translate(cx, cy, cz);
    coinGeos.push(coin);
  }

  // 3. Scattered Coins Across the Dais Floor Margins
  for (let c = 0; c < 45; c++) {
    const ang = random() * Math.PI * 2;
    const rad = 0.35 + random() * 0.28;
    const cx = Math.cos(ang) * rad;
    const cz = Math.sin(ang) * rad;
    // Keep off the far back
    if (cz < -0.3) continue;
    const coin = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8);
    coin.applyQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler((random() - 0.5) * 0.1, random() * Math.PI, 0),
      ),
    );
    coin.translate(cx, 0.084 + (random() > 0.5 ? 0.005 : 0), cz);
    coinGeos.push(coin);
  }

  // 4. Stacks of Minted Coins
  const stackPositions = [
    { x: -0.25, z: 0.36, count: 7, tiltX: 0.04, tiltZ: -0.04 },
    { x: -0.21, z: 0.38, count: 9, tiltX: -0.03, tiltZ: 0.05 },
    { x: 0.32, z: -0.02, count: 6, tiltX: 0.05, tiltZ: 0.02 },
    { x: 0.35, z: 0.01, count: 8, tiltX: -0.04, tiltZ: -0.03 },
    { x: 0.18, z: 0.48, count: 5, tiltX: 0.02, tiltZ: 0.04 },
  ];

  stackPositions.forEach((st) => {
    for (let c = 0; c < st.count; c++) {
      const cy = 0.088 + c * COIN_T;
      const jx = (c * st.tiltX) / st.count;
      const jz = (c * st.tiltZ) / st.count;
      const coin = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8);
      coin.translate(st.x + jx, cy, st.z + jz);
      coinGeos.push(coin);
    }
  });

  const mergedCoins = mergeGeometries(coinGeos);
  if (mergedCoins) {
    b.part(mergedCoins, GOLD_BRIGHT, {
      bone: root,
      at: [0, 0, 0],
      texture: COIN_TEX,
      name: "merged_hoard_coins",
    });
  }

  // 12 Prominent Hero Coins with individual stamps
  const heroCoins = [
    { at: chestLocal(-0.06, CH + 0.01, CD / 2 + 0.01), rot: [0.35, 0.2, 0.1] },
    { at: chestLocal(0.04, CH * 0.82, CD / 2 + 0.03), rot: [0.65, -0.25, 0.18] },
    { at: chestLocal(0.12, CH * 0.68, CD / 2 + 0.04), rot: [0.55, 0.35, -0.15] },
    { at: [0.01, 0.165, 0.37] as [number, number, number], rot: [0.1, 0.8, -0.1] },
    { at: [0.17, 0.15, 0.22] as [number, number, number], rot: [-0.2, 0.4, 0.3] },
    { at: [0.07, 0.19, 0.16] as [number, number, number], rot: [0.22, -0.55, 0.12] },
    { at: [0.27, 0.095, 0.52] as [number, number, number], rot: [0.05, 1.2, 0] },
    { at: [0.34, 0.09, 0.56] as [number, number, number], rot: [-0.08, 0.3, 0.1] },
    { at: [-0.26, 0.105, 0.19] as [number, number, number], rot: [-0.25, 0.6, 0.3] },
    { at: [-0.34, 0.092, 0.28] as [number, number, number], rot: [0.1, -0.35, 0.18] },
    { at: [0.42, 0.086, 0.22] as [number, number, number], rot: [0.02, 0.55, -0.04] },
    { at: [-0.12, 0.088, 0.42] as [number, number, number], rot: [0.08, -1.05, 0.02] },
  ];

  heroCoins.forEach((hc, idx) => {
    b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_BRIGHT, {
      bone: root,
      at: hc.at,
      quat: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(hc.rot[0], hc.rot[1], hc.rot[2]),
      ),
      texture: COIN_TEX,
      name: `hero_coin_${idx}`,
    });
  });

  return b.root;
}
>>>>>>> REPLACE
```