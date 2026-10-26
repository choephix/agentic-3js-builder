import * as THREE from "three";
import {
  arc,
  countershade,
  createBuilder,
  mottle,
  mix,
  noise,
  paint,
  polyline,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "brutalist housing block",
  description:
    "A raw-concrete brutalist housing block with stacked balconies, deep windows, pilotis, rooftop plant, water tank, service pipes, formwork marks, and weathered architectural detail.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", paintSize: 2048 });

  const rawConcrete = paint((p, n) => {
    const broad = noise(p, 1.8, 17);
    const fine = noise(p, 0.24, 29);
    let c = mix("#70716d", "#aaa89e", broad * 0.62 + fine * 0.16);
    if (n.y < -0.62) c = mix(c, "#555752", 0.2);
    if (n.z > 0.72 && noise(p, 0.42, 43) > 0.78) c = mix(c, "#5d5f5a", 0.22);
    return c;
  });

  const concrete = countershade(rawConcrete, "#535550", {
    level: -0.45,
    soft: 0.3,
  });

  const edgeConcrete = mottle("#5b5d59", "#888981", {
    size: 0.7,
    contrast: 1.35,
    seed: 73,
  });

  const weatheredConcrete = mottle("#62635e", "#97968d", {
    size: 1.25,
    contrast: 1.65,
    seed: 91,
  });

  const concreteShadow = "#444744";
  const concreteLine = "#363936";
  const glassTint = "#121c20";
  const steel = "#283033";
  const steelLight = "#596064";
  const warmInterior = "#c7894f";
  const warningYellow = "#c59d45";

  const WINDOW_DARK = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stop-color="#253d43"/>
          <stop offset="0.42" stop-color="#101a20"/>
          <stop offset="1" stop-color="#080d11"/>
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#g)"/>
      <rect x="5" y="5" width="72" height="110" fill="#0b1519" opacity=".48"/>
      <rect x="83" y="5" width="72" height="110" fill="#182b2f" opacity=".34"/>
      <path d="M-15 111 L72 -5 M18 125 L111 -5" stroke="#91abb0" stroke-width="5" opacity=".2"/>
      <path d="M0 80 L160 37" stroke="#d2e2df" stroke-width="2" opacity=".13"/>
      <path d="M80 0 V120 M0 60 H160" stroke="#05090c" stroke-width="3" opacity=".7"/>
      <rect x="9" y="9" width="142" height="102" fill="none" stroke="#53666a" stroke-width="2" opacity=".48"/>
    </svg>`,
    { size: 192 },
  );

  const WINDOW_LIT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#171f22"/>
          <stop offset="1" stop-color="#080d10"/>
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#g)"/>
      <rect x="12" y="12" width="55" height="96" fill="#b9783f" opacity=".82"/>
      <rect x="19" y="18" width="41" height="82" fill="#e0a05b" opacity=".35"/>
      <rect x="91" y="8" width="55" height="104" fill="#0e2025" opacity=".9"/>
      <path d="M0 94 L160 38" stroke="#bad0ce" stroke-width="5" opacity=".16"/>
      <path d="M50 -5 L155 105" stroke="#e6f2e8" stroke-width="2" opacity=".11"/>
      <path d="M80 0 V120" stroke="#030608" stroke-width="4" opacity=".9"/>
      <path d="M0 58 H160" stroke="#05090b" stroke-width="3" opacity=".8"/>
      <rect x="7" y="7" width="146" height="106" fill="none" stroke="#65767a" stroke-width="2" opacity=".45"/>
    </svg>`,
    { size: 192 },
  );

  const LOBBY_GLASS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#33484b"/>
          <stop offset=".4" stop-color="#17272a"/>
          <stop offset="1" stop-color="#080d10"/>
        </linearGradient>
      </defs>
      <rect width="240" height="160" fill="url(#g)"/>
      <rect x="18" y="14" width="63" height="132" fill="#11191b"/>
      <rect x="91" y="14" width="58" height="132" fill="#be7842" opacity=".48"/>
      <rect x="158" y="14" width="64" height="132" fill="#0b161a"/>
      <path d="M-30 145 L125 -10" stroke="#d4e4df" stroke-width="7" opacity=".13"/>
      <path d="M95 180 L250 25" stroke="#bdd5d1" stroke-width="4" opacity=".12"/>
      <path d="M84 0 V160 M154 0 V160" stroke="#05090a" stroke-width="5"/>
      <path d="M0 119 H240" stroke="#05090a" stroke-width="4"/>
      <rect x="6" y="6" width="228" height="148" fill="none" stroke="#738789" stroke-width="3" opacity=".45"/>
    </svg>`,
    { size: 256 },
  );

  const SIGN_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 72">
      <rect width="320" height="72" fill="#303330"/>
      <rect x="5" y="5" width="310" height="62" fill="none" stroke="#b6b09a" stroke-width="3"/>
      <path d="M17 54 H303" stroke="#8e8c80" stroke-width="2" opacity=".6"/>
      <text x="160" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" letter-spacing="5" fill="#e2dcc5">HABITAT 07</text>
      <text x="160" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" letter-spacing="3" fill="#a8aaa0">CONCRETE / COMMUNITY / 1974</text>
    </svg>`,
    { size: 512 },
  );

  const SERVICE_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 64">
      <rect width="180" height="64" fill="#242927"/>
      <path d="M-20 64 L44 0 H68 L4 64 M48 64 L112 0 H136 L72 64 M116 64 L180 0 H204 L140 64" stroke="#b28b3d" stroke-width="14" opacity=".85"/>
      <rect x="4" y="4" width="172" height="56" fill="none" stroke="#d9c78a" stroke-width="3"/>
      <text x="90" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#161b1a">SERVICE</text>
    </svg>`,
    { size: 256 },
  );

  const VENT_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" fill="#303633"/>
      <path d="M17 14 V82 M31 14 V82 M45 14 V82 M59 14 V82 M73 14 V82" stroke="#0b0e0d" stroke-width="7"/>
      <path d="M14 14 H82 M14 82 H82" stroke="#868a80" stroke-width="3"/>
      <circle cx="48" cy="48" r="38" fill="none" stroke="#9c9b8a" stroke-width="2" opacity=".65"/>
    </svg>`,
    { size: 128 },
  );

  const addBox = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: any = concrete,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      group: extra.group ?? "structure",
      name,
      ...extra,
    });

  const addCylinder = (
    name: string,
    radius: number,
    height: number,
    at: readonly [number, number, number],
    color: any = concrete,
    segments = 10,
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      flat: true,
      group: extra.group ?? "structure",
      name,
      ...extra,
    });

  const addPlane = (
    name: string,
    width: number,
    height: number,
    at: readonly [number, number, number],
    dir: readonly [number, number, number],
    texture: any,
    color = "#ffffff",
    extra: any = {},
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), color, {
      at,
      dir,
      axis: "z",
      up: [0, 1, 0],
      texture,
      group: extra.group ?? "windows",
      name,
      ...extra,
    });

  const addRod = (
    name: string,
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius: number,
    color: any = steel,
    extra: any = {},
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "round",
      group: extra.group ?? "metal",
      name,
      ...extra,
    });

  const addCircularBand = (
    name: string,
    center: readonly [number, number, number],
    radius: number,
    tubeRadius: number,
    color: any,
  ) => {
    const points: number[][] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      points.push([
        center[0] + Math.cos(a) * radius,
        center[1],
        center[2] + Math.sin(a) * radius,
      ]);
    }
    return b.sweep(polyline(points, { closed: true }), tubeRadius, {
      color,
      caps: "none",
      group: "roof-detail",
      name,
    });
  };

  const baseSlab = addBox(
    "foundation_plinth",
    [22.2, 0.34, 12.2],
    [0, 0.17, 0],
    edgeConcrete,
    { group: "foundation" },
  );

  addBox("lower_left_wing", [3.25, 3.05, 10.5], [-8.65, 1.86, -0.35], weatheredConcrete);
  addBox("lower_right_wing", [3.25, 3.05, 10.5], [8.65, 1.86, -0.35], weatheredConcrete);
  addBox("lower_rear_service_block", [13.2, 2.85, 2.6], [0, 1.76, -4.15], edgeConcrete);
  addBox("lower_left_return", [4.4, 2.2, 2.3], [-7.65, 1.48, 4.0], concrete);
  addBox("lower_right_return", [4.4, 2.2, 2.3], [7.65, 1.48, 4.0], concrete);

  const mainShell = addBox(
    "residential_slab",
    [18.6, 13.45, 8.6],
    [0, 10.1, 0],
    concrete,
    { group: "primary-mass" },
  );

  addBox("left_end_cap", [0.45, 13.1, 8.9], [-9.38, 10.08, 0], edgeConcrete);
  addBox("right_end_cap", [0.45, 13.1, 8.9], [9.38, 10.08, 0], edgeConcrete);

  const frontZ = 4.3;
  const floorLevels = Array.from({ length: 6 }, (_, i) => 4.0 + i * 2.13);
  const bayCenters = [-6.9, -2.3, 2.3, 6.9];
  const bayWidth = 4.25;
  const baySide = 2.0;

  for (const hit of b.surface(mainShell).scatter(24, {
    rng: rng(412),
    minDist: 0.58,
    filter: (h) => h.n.z > 0.84 && h.at.y > 3.7 && h.at.y < 16.5,
  })) {
    b.stick(
      new THREE.CylinderGeometry(0.035, 0.035, 0.018, 8),
      concreteShadow,
      hit,
      {
        embed: 0.22,
        group: "formwork",
        name: "form-tie-mark",
      },
    );
  }

  for (let i = 0; i < 5; i++) {
    const y = 5.0 + i * 2.13;
    addBox(`front_horizontal_joint_${i}`, [18.3, 0.035, 0.075], [0, y, 4.39], concreteLine, {
      group: "formwork",
    });
  }

  for (let i = 0; i < 5; i++) {
    const x = -9.1 + i * 4.55;
    addBox(`front_vertical_pier_${i}`, [0.34, 13.35, 0.34], [x, 10.08, 4.43], edgeConcrete, {
      group: "facade-structure",
    });
  }

  for (let floor = 0; floor < floorLevels.length; floor++) {
    const fy = floorLevels[floor];
    const windowY = fy + 1.03;
    const windowTexture = floor === 1 || floor === 4 ? WINDOW_LIT : WINDOW_DARK;

    addBox(
      `front_floor_band_${floor}`,
      [18.6, 0.22, 0.42],
      [0, fy + 0.01, 4.39],
      edgeConcrete,
      { group: "facade-structure" },
    );

    for (let bay = 0; bay < bayCenters.length; bay++) {
      const x = bayCenters[bay];
      const prefix = `front_${floor}_${bay}`;

      addPlane(
        `${prefix}_window`,
        3.72,
        1.56,
        [x, windowY, 4.355],
        [0, 0, 1],
        windowTexture,
        glassTint,
      );

      addBox(`${prefix}_window_left`, [0.16, 1.78, 0.25], [x - baySide, windowY, 4.43], edgeConcrete, {
        group: "window-frames",
      });
      addBox(`${prefix}_window_right`, [0.16, 1.78, 0.25], [x + baySide, windowY, 4.43], edgeConcrete, {
        group: "window-frames",
      });
      addBox(`${prefix}_window_mullion`, [0.1, 1.58, 0.23], [x, windowY, 4.44], concreteShadow, {
        group: "window-frames",
      });
      addBox(`${prefix}_window_sill`, [4.18, 0.15, 0.26], [x, fy + 0.22, 4.43], edgeConcrete, {
        group: "window-frames",
      });
      addBox(`${prefix}_window_lintel`, [4.18, 0.16, 0.27], [x, fy + 1.91, 4.43], edgeConcrete, {
        group: "window-frames",
      });

      addBox(`${prefix}_balcony_slab`, [bayWidth, 0.22, 1.42], [x, fy, 4.98], edgeConcrete, {
        group: "balconies",
      });
      addBox(`${prefix}_balcony_left_wall`, [0.2, 1.02, 1.38], [x - 2.04, fy + 0.52, 4.99], concrete, {
        group: "balconies",
      });
      addBox(`${prefix}_balcony_right_wall`, [0.2, 1.02, 1.38], [x + 2.04, fy + 0.52, 4.99], concrete, {
        group: "balconies",
      });
      addBox(`${prefix}_balcony_front_parapet`, [4.28, 0.86, 0.2], [x, fy + 0.52, 5.58], concrete, {
        group: "balconies",
      });

      addRod(`${prefix}_rail_left`, [x - 1.32, fy + 0.96, 5.58], [x - 1.32, fy + 1.49, 5.58], 0.024);
      addRod(`${prefix}_rail_right`, [x + 1.32, fy + 0.96, 5.58], [x + 1.32, fy + 1.49, 5.58], 0.024);
      addRod(`${prefix}_rail_top`, [x - 1.35, fy + 1.49, 5.58], [x + 1.35, fy + 1.49, 5.58], 0.026);
    }
  }

  for (const s of [-1, 1]) {
    addBox(`side_rib_outer_${s}`, [0.34, 13.4, 0.32], [s * 9.46, 10.08, -3.72], edgeConcrete, {
      group: "side-structure",
    });
    addBox(`side_rib_mid_a_${s}`, [0.34, 13.4, 0.32], [s * 9.46, 10.08, -1.25], edgeConcrete, {
      group: "side-structure",
    });
    addBox(`side_rib_mid_b_${s}`, [0.34, 13.4, 0.32], [s * 9.46, 10.08, 1.22], edgeConcrete, {
      group: "side-structure",
    });
    addBox(`side_rib_inner_${s}`, [0.34, 13.4, 0.32], [s * 9.46, 10.08, 3.7], edgeConcrete, {
      group: "side-structure",
    });

    for (let floor = 0; floor < floorLevels.length; floor++) {
      const fy = floorLevels[floor];
      const windowY = fy + 1.03;
      for (let bay = 0; bay < 3; bay++) {
        const z = -2.55 + bay * 2.55;
        const prefix = `side_${s}_${floor}_${bay}`;
        const texture = floor === 2 && bay === 1 ? WINDOW_LIT : WINDOW_DARK;

        addPlane(
          `${prefix}_glass`,
          1.68,
          1.52,
          [s * 9.34, windowY, z],
          [s, 0, 0],
          texture,
          glassTint,
          { group: "side-windows" },
        );

        addBox(`${prefix}_top`, [0.24, 0.15, 1.92], [s * 9.43, fy + 1.91, z], edgeConcrete, {
          group: "side-window-frames",
        });
        addBox(`${prefix}_bottom`, [0.24, 0.15, 1.92], [s * 9.43, fy + 0.22, z], edgeConcrete, {
          group: "side-window-frames",
        });
        addBox(`${prefix}_front_edge`, [0.24, 1.7, 0.14], [s * 9.43, windowY, z - 0.9], edgeConcrete, {
          group: "side-window-frames",
        });
        addBox(`${prefix}_back_edge`, [0.24, 1.7, 0.14], [s * 9.43, windowY, z + 0.9], edgeConcrete, {
          group: "side-window-frames",
        });
      }
    }

    for (let i = 0; i < 5; i++) {
      addBox(
        `side_formwork_${s}_${i}`,
        [0.04, 0.04, 7.95],
        [s * 9.51, 5.03 + i * 2.13, 0],
        concreteLine,
        { group: "formwork" },
      );
    }
  }

  const rearZ = -4.32;
  const rearBays = [-6.2, 0, 6.2];
  for (let floor = 0; floor < floorLevels.length; floor++) {
    const fy = floorLevels[floor];
    const windowY = fy + 1.03;
    for (let bay = 0; bay < rearBays.length; bay++) {
      const x = rearBays[bay];
      const prefix = `rear_${floor}_${bay}`;
      addPlane(`${prefix}_glass`, 3.68, 1.52, [x, windowY, rearZ], [0, 0, -1], WINDOW_DARK, glassTint, {
        group: "rear-windows",
      });
      addBox(`${prefix}_sill`, [4.05, 0.15, 0.22], [x, fy + 0.22, -4.39], edgeConcrete, {
        group: "rear-window-frames",
      });
      addBox(`${prefix}_lintel`, [4.05, 0.16, 0.22], [x, fy + 1.91, -4.39], edgeConcrete, {
        group: "rear-window-frames",
      });
      addBox(`${prefix}_mullion`, [0.11, 1.6, 0.2], [x, windowY, -4.4], concreteShadow, {
        group: "rear-window-frames",
      });
    }
  }

  addBox("lobby_glass_backing", [7.9, 2.85, 0.16], [0, 1.72, 4.83], glassTint, {
    group: "entrance",
  });
  addPlane("lobby_glass_front", 7.65, 2.62, [0, 1.73, 4.93], [0, 0, 1], LOBBY_GLASS, "#ffffff", {
    group: "entrance",
  });
  addBox("lobby_left_pier", [0.38, 3.05, 0.62], [-4.08, 1.82, 4.85], concrete, {
    group: "entrance",
  });
  addBox("lobby_right_pier", [0.38, 3.05, 0.62], [4.08, 1.82, 4.85], concrete, {
    group: "entrance",
  });
  addBox("lobby_top_beam", [8.5, 0.38, 0.72], [0, 3.25, 4.86], edgeConcrete, {
    group: "entrance",
  });

  addPlane("entry_door", 2.35, 2.32, [0, 1.4, 5.04], [0, 0, 1], WINDOW_LIT, "#ffffff", {
    group: "entrance",
  });
  addBox("entry_door_left_jamb", [0.16, 2.46, 0.22], [-1.26, 1.4, 5.08], concreteShadow, {
    group: "entrance",
  });
  addBox("entry_door_right_jamb", [0.16, 2.46, 0.22], [1.26, 1.4, 5.08], concreteShadow, {
    group: "entrance",
  });
  addBox("entry_door_header", [2.58, 0.16, 0.22], [0, 2.65, 5.08], concreteShadow, {
    group: "entrance",
  });

  for (let i = 0; i < 4; i++) {
    const h = 0.14 * (i + 1);
    addBox(
      `entry_step_${i}`,
      [3.75, h, 0.46],
      [0, h / 2, 6.48 - i * 0.46],
      edgeConcrete,
      { group: "entrance" },
    );
  }

  addBox("entrance_canopy", [8.9, 0.3, 1.95], [0, 3.43, 5.13], concrete, {
    group: "entrance",
  });
  addBox("entrance_canopy_shadow", [7.9, 0.06, 1.55], [0, 3.265, 5.17], concreteShadow, {
    group: "entrance",
  });

  const buttressOutline: [number, number][] = [
    [-0.32, 0],
    [0.42, 0],
    [0.15, 2.92],
    [-0.1, 2.92],
  ];

  for (const s of [-1, 1]) {
    b.extrude(buttressOutline, {
      at: [s * 7.7, 0.3, 4.45],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.018,
      color: concrete,
      group: "buttresses",
      name: `sloping_buttress_${s}`,
    });
  }

  addPlane("front_habitat_sign", 3.55, 0.8, [0, 2.82, 5.22], [0, 0, 1], SIGN_TEXTURE, "#ffffff", {
    group: "signage",
  });
  addPlane("upper_habitat_sign", 3.25, 0.72, [0, 16.18, 4.48], [0, 0, 1], SIGN_TEXTURE, "#ffffff", {
    group: "signage",
  });

  addRod("left_downpipe", [-9.72, 0.28, 5.68], [-9.72, 16.96, 5.68], 0.052, steel, {
    group: "rainwater",
  });
  addRod("right_downpipe", [9.72, 0.28, 5.68], [9.72, 16.96, 5.68], 0.052, steel, {
    group: "rainwater",
  });
  addRod("left_gutter", [-9.72, 16.96, 5.68], [-8.2, 16.96, 5.68], 0.045, steel, {
    group: "rainwater",
  });
  addRod("right_gutter", [9.72, 16.96, 5.68], [8.2, 16.96, 5.68], 0.045, steel, {
    group: "rainwater",
  });

  addBox("roof_overhang", [20.7, 0.52, 9.55], [0, 17.05, 0], edgeConcrete, {
    group: "roof",
  });
  addBox("roof_front_parapet", [20.7, 0.98, 0.46], [0, 17.72, 4.38], concrete, {
    group: "roof",
  });
  addBox("roof_rear_parapet", [20.7, 0.82, 0.42], [0, 17.64, -4.37], edgeConcrete, {
    group: "roof",
  });
  addBox("roof_left_parapet", [0.46, 0.9, 8.8], [-10.08, 17.68, 0], concrete, {
    group: "roof",
  });
  addBox("roof_right_parapet", [0.46, 0.9, 8.8], [10.08, 17.68, 0], concrete, {
    group: "roof",
  });

  for (let i = 0; i < 11; i++) {
    const x = -9.2 + i * 1.84;
    addBox(`parapet_tooth_${i}`, [0.22, 0.48, 0.54], [x, 18.2, 4.4], edgeConcrete, {
      group: "roof",
    });
  }

  addBox("rooftop_penthouse", [7.6, 2.5, 4.2], [-1.9, 18.45, -0.45], weatheredConcrete, {
    group: "rooftop-plant",
  });
  addBox("penthouse_base_shadow", [8.05, 0.22, 4.55], [-1.9, 17.24, -0.45], concreteShadow, {
    group: "rooftop-plant",
  });
  addBox("penthouse_top_cap", [7.95, 0.28, 4.48], [-1.9, 19.74, -0.45], edgeConcrete, {
    group: "rooftop-plant",
  });

  addPlane("penthouse_service_panel", 1.65, 0.58, [-1.9, 18.45, 1.62], [0, 0, 1], SERVICE_TEXTURE, "#ffffff", {
    group: "rooftop-plant",
  });
  addBox("penthouse_panel_left", [0.16, 0.72, 0.1], [-2.82, 18.45, 1.66], concreteShadow, {
    group: "rooftop-plant",
  });
  addBox("penthouse_panel_right", [0.16, 0.72, 0.1], [-0.98, 18.45, 1.66], concreteShadow, {
    group: "rooftop-plant",
  });

  for (let i = 0; i < 3; i++) {
    addPlane(
      `penthouse_slit_${i}`,
      1.15,
      0.42,
      [-4.2 + i * 2.3, 18.55, 1.66],
      [0, 0, 1],
      WINDOW_DARK,
      glassTint,
      { group: "rooftop-plant" },
    );
  }

  const tankX = 6.35;
  const tankY = 18.22;
  const tankZ = -1.46;

  const tank = b.lathe(
    [
      [0, 0],
      [1.02, 0],
      [1.17, 0.14],
      [1.18, 0.32],
      [1.18, 1.65],
      [1.07, 1.9],
      [0.78, 2.06],
      [0, 2.06],
    ],
    {
      at: [tankX, tankY, tankZ],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 0,
      color: concrete,
      group: "water-tank",
      name: "rooftop_water_tank",
    },
  );

  addCircularBand("tank_lower_band", [tankX, tankY + 0.31, tankZ], 1.19, 0.038, concreteShadow);
  addCircularBand("tank_middle_band", [tankX, tankY + 1.06, tankZ], 1.19, 0.034, edgeConcrete);
  addCircularBand("tank_upper_band", [tankX, tankY + 1.78, tankZ], 1.13, 0.04, concreteShadow);
  addCylinder("tank_hatch", 0.38, 0.14, [tankX, tankY + 2.14, tankZ], edgeConcrete, 10, {
    group: "water-tank",
  });
  addBox("tank_hatch_handle", [0.52, 0.06, 0.08], [tankX, tankY + 2.25, tankZ], steel, {
    group: "water-tank",
  });

  for (const [i, x] of [-5.0, -3.75, -2.5, 0.3].entries()) {
    addCylinder(`roof_vent_body_${i}`, 0.24, 0.54, [x, 20.02, 2.38], steelLight, 10, {
      group: "rooftop-vents",
    });
    addCylinder(`roof_vent_cap_${i}`, 0.31, 0.1, [x, 20.34, 2.38], steel, 10, {
      group: "rooftop-vents",
    });
    addPlane(
      `roof_vent_face_${i}`,
      0.35,
      0.35,
      [x, 20.04, 2.64],
      [0, 0, 1],
      VENT_TEXTURE,
      "#ffffff",
      { group: "rooftop-vents" },
    );
  }

  addBox("roof_maintenance_block", [2.9, 0.75, 2.25], [3.25, 18.15, 2.65], edgeConcrete, {
    group: "rooftop-plant",
  });
  addBox("roof_maintenance_lid", [3.15, 0.2, 2.45], [3.25, 18.64, 2.65], concreteShadow, {
    group: "rooftop-plant",
  });

  addRod("tank_pipe_to_penthouse", [5.18, 18.55, -1.46], [3.15, 18.55, -1.46], 0.045, steel, {
    group: "rooftop-pipes",
  });
  addRod("tank_upright_pipe", [5.18, 18.55, -1.46], [5.18, 20.02, -1.46], 0.045, steel, {
    group: "rooftop-pipes",
  });
  addRod("tank_pipe_cap", [5.18, 20.02, -1.46], [5.72, 20.02, -1.46], 0.045, steel, {
    group: "rooftop-pipes",
  });

  addRod("roof_guardrail_a", [0.95, 20.04, 1.72], [2.0, 20.04, 1.72], 0.026, steel, {
    group: "rooftop-railings",
  });
  addRod("roof_guardrail_b", [0.95, 20.04, 1.72], [0.95, 20.04, 2.84], 0.026, steel, {
    group: "rooftop-railings",
  });
  addRod("roof_guardrail_c", [2.0, 20.04, 1.72], [2.0, 20.04, 2.84], 0.026, steel, {
    group: "rooftop-railings",
  });
  addRod("roof_guardrail_d", [0.95, 20.04, 2.84], [2.0, 20.04, 2.84], 0.026, steel, {
    group: "rooftop-railings",
  });

  for (let i = 0; i < 6; i++) {
    const x = -8.2 + i * 3.25;
    addBox(`roof_formwork_block_${i}`, [0.11, 0.12, 0.52], [x, 17.46, 4.66], concreteShadow, {
      group: "roof",
    });
  }

  const serviceRibs = [-5.0, -3.8, -2.6, -1.4, -0.2];
  for (const [i, x] of serviceRibs.entries()) {
    addBox(`penthouse_roof_rib_${i}`, [0.18, 0.28, 4.05], [x, 19.93, -0.45], concreteShadow, {
      group: "rooftop-plant",
    });
  }

  addBox("roof_access_stair_block", [2.2, 1.7, 1.65], [0.9, 18.1, -2.6], concrete, {
    group: "rooftop-plant",
  });
  addBox("roof_access_stair_lid", [2.45, 0.18, 1.9], [0.9, 19.03, -2.6], edgeConcrete, {
    group: "rooftop-plant",
  });
  addPlane("roof_access_label", 0.95, 0.36, [0.9, 18.18, -1.76], [0, 0, 1], SERVICE_TEXTURE, "#ffffff", {
    group: "signage",
  });

  for (let i = 0; i < 7; i++) {
    const x = -8.1 + i * 2.7;
    addBox(`rear_roof_tooth_${i}`, [0.24, 0.42, 0.38], [x, 18.12, -4.48], edgeConcrete, {
      group: "roof",
    });
  }

  const rearDrainX = [-8.9, 8.9];
  for (const [i, x] of rearDrainX.entries()) {
    addRod(`rear_drain_${i}`, [x, 0.28, -4.72], [x, 17.46, -4.72], 0.045, steel, {
      group: "rainwater",
    });
  }

  addBox("foundation_shadow_line", [21.4, 0.08, 11.4], [0, 0.39, 0], concreteLine, {
    group: "foundation",
  });

  for (let i = 0; i < 8; i++) {
    const x = -8.4 + i * 2.4;
    addBox(`base_formwork_joint_${i}`, [0.045, 0.8, 0.045], [x, 0.78, 5.2], concreteLine, {
      group: "formwork",
    });
  }

  return b.root;
}
