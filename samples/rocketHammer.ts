import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { glow } from "../kits/glow";
import { paint, stripes } from "../src/paint";
import { polyline } from "../src/path";

export const meta = {
  name: "Ionbreaker Rocket Hammer",
  description: "A polished Overwatch-style rocket war hammer with twin thrust pods, armored striking plates, and a cyan power core.",
  style: "Overwatch",
  commit: "07503e3",
};

const NAVY = "#101b2c";
const DEEP = "#18283e";
const STEEL = "#647b91";
const LIGHT = "#b9d0df";
const EDGE = "#dce8ef";
const ORANGE = "#f26332";
const GOLD = "#ffbd55";
const CYAN = "#28e8f1";
const CYAN_DARK = "#118da6";
const RUBBER = "#202633";
const SHADOW = "#0a111e";

export default function build() {
  const b = createBuilder({ name: "rocketHammer", detail: 1.1, paintSize: 1024 });
  const root = b.joint("hammerRoot", { at: [0, 0, 0] });

  const shellPaint = stripes(STEEL, DEEP, {
    size: 0.24,
    axis: "x",
    width: 0.24,
    wobble: 0.08,
    seed: 17,
  });
  const gripPaint = paint((_p, _n, s) => (s[0] > 0.52 ? RUBBER : DEEP));

  // Weighted handle, planted on the floor with a rounded armored pommel.
  b.sweep(
    polyline([
      [0, 0.105, 0],
      [0, 0.30, 0],
      [0, 0.78, 0],
      [0, 1.18, 0],
      [0, 1.37, 0],
    ]),
    [0.086, 0.074, 0.065, 0.057, 0.052],
    { bone: root, section: { ngon: 8 }, caps: "round", color: gripPaint, name: "gripCore", group: "handle" },
  );
  b.part(new THREE.SphereGeometry(0.105, 10, 6), SHADOW, {
    bone: root,
    at: [0, 0.095, 0],
    name: "pommelCore",
    group: "handle",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.105, 0.09, 0.035, 10), ORANGE, {
    bone: root,
    at: [0, 0.16, 0],
    name: "pommelCollar",
    group: "handle",
  });
  b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.045, 8), LIGHT, {
    bone: root,
    at: [0, 0.19, 0],
    name: "pommelInset",
    group: "handle",
  });

  for (const y of [0.27, 0.43, 0.61, 0.80, 0.99, 1.17, 1.31]) {
    b.part(new THREE.TorusGeometry(0.081, y < 0.95 ? 0.011 : 0.009, 6, 12), y === 0.61 ? ORANGE : GOLD, {
      bone: root,
      at: [0, y, 0],
      rotation: [Math.PI / 2, 0, 0],
      name: `gripRing${y.toFixed(2)}`,
      group: "handle",
      flat: true,
    });
  }
  // A pair of diagonal stabilizer braces makes the shaft visibly load-bearing.
  for (const s of [-1, 1]) {
    b.rod([s * 0.035, 1.08, 0], [s * 0.19, 1.35, 0], 0.018, {
      bone: root,
      color: LIGHT,
      caps: "flat",
      name: `brace${s < 0 ? "L" : "R"}`,
      group: "handle",
    });
    b.part(new THREE.SphereGeometry(0.027, 7, 5), ORANGE, {
      bone: root,
      at: [s * 0.19, 1.35, 0],
      name: `braceBolt${s < 0 ? "L" : "R"}`,
      group: "handle",
      flat: true,
    });
  }
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.42, 0.014), CYAN_DARK, {
      bone: root,
      at: [s * 0.054, 0.76, 0.072],
      name: `gripRail${s < 0 ? "L" : "R"}`,
      group: "handle",
    });
    b.part(new THREE.BoxGeometry(0.030, 0.07, 0.018), ORANGE, {
      bone: root,
      at: [s * 0.054, 0.76, 0.084],
      name: `gripRailBadge${s < 0 ? "L" : "R"}`,
      group: "handle",
    });
  }

  // Main hammer head: a compact central block with swept shoulder armor.
  b.part(new THREE.BoxGeometry(0.34, 0.36, 0.34), shellPaint, {
    bone: root,
    at: [0, 1.49, 0],
    name: "headCore",
    group: "head",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.24, 0.43, 0.38), NAVY, {
    bone: root,
    at: [0, 1.50, 0],
    name: "headSpine",
    group: "head",
    flat: true,
  });

  const shoulderOutline: [number, number, "sharp"][] = [
    [-0.57, -0.17, "sharp"],
    [-0.57, 0.13, "sharp"],
    [-0.40, 0.22, "sharp"],
    [-0.13, 0.20, "sharp"],
    [0.13, 0.20, "sharp"],
    [0.40, 0.22, "sharp"],
    [0.57, 0.13, "sharp"],
    [0.57, -0.17, "sharp"],
    [0.37, -0.23, "sharp"],
    [0.12, -0.20, "sharp"],
    [-0.12, -0.20, "sharp"],
    [-0.37, -0.23, "sharp"],
  ];
  b.extrude(shoulderOutline, {
    at: [0, 1.49, 0.18],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.018,
    color: shellPaint,
    bone: root,
    name: "frontShoulderShell",
    group: "armor",
  });
  b.extrude(shoulderOutline, {
    at: [0, 1.49, -0.18],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.018,
    color: NAVY,
    bone: root,
    name: "rearShoulderShell",
    group: "armor",
  });

  // Front face panel lines and a bright reactor window.
  b.part(new THREE.BoxGeometry(0.46, 0.025, 0.016), DEEP, {
    bone: root,
    at: [0, 1.66, 0.215],
    name: "topPanelLine",
    group: "armor",
  });
  b.part(new THREE.BoxGeometry(0.46, 0.025, 0.016), DEEP, {
    bone: root,
    at: [0, 1.31, 0.215],
    name: "bottomPanelLine",
    group: "armor",
  });
  b.part(new THREE.BoxGeometry(0.024, 0.23, 0.018), DEEP, {
    bone: root,
    at: [0.23, 1.49, 0.215],
    name: "rightPanelLine",
    group: "armor",
  });
  b.part(new THREE.BoxGeometry(0.024, 0.23, 0.018), DEEP, {
    bone: root,
    at: [-0.23, 1.49, 0.215],
    name: "leftPanelLine",
    group: "armor",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.035, 10), CYAN, {
      bone: root,
      at: [0, 1.49, 0.235],
      rotation: [Math.PI / 2, 0, 0],
      name: "reactorLens",
      group: "energy",
      flat: true,
    }),
    2.2,
  );
  b.part(new THREE.TorusGeometry(0.115, 0.012, 6, 12), ORANGE, {
    bone: root,
    at: [0, 1.49, 0.255],
    rotation: [Math.PI / 2, 0, 0],
    name: "reactorRim",
    group: "energy",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.028, 0.17, 0.012), EDGE, {
    bone: root,
    at: [0, 1.49, 0.263],
    name: "reactorHighlight",
    group: "energy",
  });

  // Eight inset bolts give the broad plates a manufactured, game-ready read.
  for (const x of [-0.43, 0.43]) {
    for (const y of [1.36, 1.62]) {
      for (const z of [0.217, -0.217]) {
        b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 6), GOLD, {
          bone: root,
          at: [x, y, z],
          rotation: [Math.PI / 2, 0, 0],
          name: `armorBolt${x < 0 ? "L" : "R"}${y < 1.5 ? "B" : "T"}${z > 0 ? "F" : "R"}`,
          group: "armor",
          flat: true,
        });
      }
    }
  }

  // Striking cheeks and faceted impact faces on either end of the head.
  for (const s of [-1, 1]) {
    const side = s < 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.30, 0.31, 0.40), STEEL, {
      bone: root,
      at: [s * 0.38, 1.48, 0],
      name: `strikeHousing${side}`,
      group: "strikers",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.13, 0.24, 0.34), ORANGE, {
      bone: root,
      at: [s * 0.53, 1.48, 0],
      name: `strikeBand${side}`,
      group: "strikers",
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.105, 8), NAVY, {
      bone: root,
      at: [s * 0.68, 1.48, 0],
      rotation: [0, 0, Math.PI / 2],
      name: `impactCap${side}`,
      group: "strikers",
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.018, 8), EDGE, {
      bone: root,
      at: [s * 0.738, 1.48, 0],
      rotation: [0, 0, Math.PI / 2],
      name: `impactFace${side}`,
      group: "strikers",
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.147, 0.012, 6, 10), ORANGE, {
      bone: root,
      at: [s * 0.752, 1.48, 0],
      rotation: [0, Math.PI / 2, 0],
      name: `impactRim${side}`,
      group: "strikers",
      flat: true,
    });
    for (const z of [-0.12, 0.12]) {
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6), GOLD, {
        bone: root,
        at: [s * 0.759, 1.48, z],
        rotation: [0, Math.PI / 2, 0],
        name: `impactBolt${side}${z < 0 ? "A" : "B"}`,
        group: "strikers",
        flat: true,
      });
    }
  }

  // Twin rocket pods tucked behind the shoulder, complete with fins and glowing exhaust.
  for (const s of [-1, 1]) {
    const side = s < 0 ? "L" : "R";
    const podX = s * 0.29;
    b.sweep(
      polyline([
        [podX, 1.57, -0.08],
        [podX, 1.57, -0.30],
        [podX, 1.57, -0.43],
      ]),
      [0.105, 0.095, 0.072],
      { bone: root, section: { ngon: 8 }, caps: "round", color: DEEP, name: `rocketPod${side}`, group: "rockets" },
    );
    b.part(new THREE.TorusGeometry(0.102, 0.014, 6, 10), ORANGE, {
      bone: root,
      at: [podX, 1.57, -0.18],
      rotation: [Math.PI / 2, 0, 0],
      name: `podBand${side}`,
      group: "rockets",
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.086, 0.010, 6, 10), GOLD, {
      bone: root,
      at: [podX, 1.57, -0.39],
      rotation: [Math.PI / 2, 0, 0],
      name: `nozzleCollar${side}`,
      group: "rockets",
      flat: true,
    });
    const exhaust = glow(
      b.part(new THREE.CylinderGeometry(0.061, 0.048, 0.08, 8), CYAN, {
        bone: root,
        at: [podX, 1.57, -0.48],
        rotation: [Math.PI / 2, 0, 0],
        name: `exhaust${side}`,
        group: "energy",
        flat: true,
      }),
      2.6,
    );
    void exhaust;
    b.part(new THREE.ConeGeometry(0.072, 0.12, 8), SHADOW, {
      bone: root,
      at: [podX, 1.57, -0.50],
      rotation: [Math.PI / 2, 0, 0],
      name: `nozzle${side}`,
      group: "rockets",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.16), ORANGE, {
      bone: root,
      at: [podX + s * 0.105, 1.57, -0.25],
      name: `rocketFin${side}`,
      group: "rockets",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.045, 0.11, 0.15), CYAN_DARK, {
      bone: root,
      at: [podX, 1.70, -0.24],
      name: `rocketTopFin${side}`,
      group: "rockets",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.08, 0.10), LIGHT, {
      bone: root,
      at: [podX, 1.57, -0.10],
      name: `podPanel${side}`,
      group: "rockets",
      flat: true,
    });
  }

  // A thin rear spine and two top warning chevrons finish the silhouette.
  b.part(new THREE.BoxGeometry(0.13, 0.28, 0.07), ORANGE, {
    bone: root,
    at: [0, 1.49, -0.225],
    name: "rearSpineAccent",
    group: "armor",
    flat: true,
  });
  for (const s of [-1, 1]) {
    const fin = b.extrude(
      [
        [0, 0, "sharp"],
        [0.11, 0.02, "sharp"],
        [0.08, 0.14, "sharp"],
        [0.02, 0.20, "sharp"],
      ],
      {
        at: [s * 0.12, 1.68, 0],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.028,
        bevel: 0.008,
        color: ORANGE,
        bone: root,
        name: `topChevron${s < 0 ? "L" : "R"}`,
        group: "armor",
      },
    );
    b.part(new THREE.BoxGeometry(0.018, 0.10, 0.018), GOLD, {
      bone: root,
      at: fin.local([0.055, 0.09, 0.018]),
      name: `chevronHighlight${s < 0 ? "L" : "R"}`,
      group: "armor",
    });
  }

  return b.root;
}
