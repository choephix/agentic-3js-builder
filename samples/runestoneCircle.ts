import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { mottle } from "../src/paint";
import { glow } from "../kits/glow";

const STONE = "#263746";
const STONE_DARK = "#172532";
const STONE_LIGHT = "#5a6872";
const BRONZE = "#8d5a2b";
const BRONZE_LIGHT = "#d49a48";
const IRON = "#30343b";
const RUNE = "#42d7e8";
const RUNE_DEEP = "#126e88";
const ALTAR = "#344650";
const EMBER = "#ff9d3b";
const VOID = "#101a24";

const stonePaint = mottle(STONE, STONE_LIGHT, { size: 0.28, contrast: 0.42, seed: 19 });
const altarPaint = mottle(ALTAR, STONE_DARK, { size: 0.42, contrast: 0.35, seed: 7 });

type V3 = [number, number, number];

function radialPoint(cx: number, cz: number, angle: number, localX: number, localZ: number, y: number): V3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [cx + c * localX + s * localZ, y, cz - s * localX + c * localZ];
}

export const meta = {
  name: "Runestone Circle",
  description: "A ring of carved, glowing runestones guarding a worn bronze altar.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "runestoneCircle", detail: 1.2, paintSize: 1024 });
  const root = b.joint("circleRoot", { at: [0, 0, 0], role: "spine" });

  // Broad stone dais: the whole composition reads as a deliberate ritual site.
  b.part(new THREE.CylinderGeometry(2.18, 2.26, 0.16, 12), altarPaint, {
    bone: root,
    at: [0, 0.08, 0],
    flat: true,
    name: "dais",
  });
  b.part(new THREE.CylinderGeometry(2.02, 2.1, 0.07, 12), STONE_DARK, {
    bone: root,
    at: [0, 0.195, 0],
    flat: true,
    name: "daisInset",
  });
  b.part(new THREE.TorusGeometry(2.12, 0.035, 6, 32), BRONZE, {
    bone: root,
    at: [0, 0.2, 0],
    rotation: [90, 0, 0],
    flat: true,
    name: "daisRim",
  });
  glow(
    b.part(new THREE.TorusGeometry(1.92, 0.018, 6, 32), RUNE_DEEP, {
      bone: root,
      at: [0, 0.235, 0],
      rotation: [90, 0, 0],
      flat: true,
      name: "daisRuneRing",
    }),
    1.4,
  );

  // Twelve radial channels are inset into the dais like a carved warding sigil.
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.032, 0.018, 1.25), RUNE_DEEP, {
      bone: root,
      at: radialPoint(0, 0, angle, 0, 1.08, 0.238),
      rotation: [0, (angle * 180) / Math.PI, 0],
      flat: true,
      name: `daisSpoke${i}`,
    });
    glow(
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.54), RUNE, {
        bone: root,
        at: radialPoint(0, 0, angle, 0, 0.72, 0.254),
        rotation: [0, (angle * 180) / Math.PI, 0],
        flat: true,
        name: `daisGlow${i}`,
      }),
      1.7,
    );
  }

  // Central altar, assembled in heavy heroic tiers.
  b.part(new THREE.CylinderGeometry(0.86, 0.94, 0.23, 8), ALTAR, {
    bone: root,
    at: [0, 0.34, 0],
    flat: true,
    name: "altarBase",
  });
  b.part(new THREE.TorusGeometry(0.87, 0.045, 6, 24), BRONZE_LIGHT, {
    bone: root,
    at: [0, 0.47, 0],
    rotation: [90, 0, 0],
    flat: true,
    name: "altarBaseTrim",
  });
  b.part(new THREE.CylinderGeometry(0.63, 0.72, 0.42, 8), altarPaint, {
    bone: root,
    at: [0, 0.61, 0],
    flat: true,
    name: "altarPedestal",
  });
  b.part(new THREE.CylinderGeometry(0.78, 0.72, 0.12, 8), ALTAR, {
    bone: root,
    at: [0, 0.875, 0],
    flat: true,
    name: "altarTop",
  });
  b.part(new THREE.TorusGeometry(0.71, 0.035, 6, 24), BRONZE_LIGHT, {
    bone: root,
    at: [0, 0.95, 0],
    rotation: [90, 0, 0],
    flat: true,
    name: "altarTopTrim",
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.38, 0.48, 0.035, 8), RUNE_DEEP, {
      bone: root,
      at: [0, 0.955, 0],
      flat: true,
      name: "altarGlyphPlate",
    }),
    1.5,
  );

  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    glow(
      b.part(new THREE.BoxGeometry(0.26, 0.022, 0.014), "#9cfaff", {
        bone: root,
        at: radialPoint(0, 0, angle, 0, 0.25, 0.983),
        rotation: [0, (angle * 180) / Math.PI, 0],
        flat: true,
        name: `altarGlyph${i}`,
      }),
      2,
    );
  }

  // A faceted, blue-white rune crystal is held in a bronze socket.
  b.part(new THREE.CylinderGeometry(0.18, 0.25, 0.12, 8), BRONZE, {
    bone: root,
    at: [0, 1.015, 0],
    flat: true,
    name: "crystalSocket",
  });
  glow(
    b.part(new THREE.ConeGeometry(0.23, 0.72, 6), RUNE, {
      bone: root,
      at: [0, 1.39, 0],
      flat: true,
      name: "altarCrystal",
    }),
    2.5,
  );
  glow(
    b.part(new THREE.ConeGeometry(0.11, 0.42, 5), "#b8fbff", {
      bone: root,
      at: [0.18, 1.42, 0.03],
      rotation: [0, 26, -13],
      flat: true,
      name: "crystalShardA",
    }),
    2.8,
  );
  glow(
    b.part(new THREE.ConeGeometry(0.095, 0.35, 5), "#75eefa", {
      bone: root,
      at: [-0.17, 1.34, 0.06],
      rotation: [0, -34, 14],
      flat: true,
      name: "crystalShardB",
    }),
    2.4,
  );

  // Small ward braziers give the ring a warm secondary accent.
  for (const [x, z] of [
    [0, 1.08],
    [1.08, 0],
    [0, -1.08],
    [-1.08, 0],
  ] as Array<[number, number]>) {
    b.part(new THREE.CylinderGeometry(0.095, 0.12, 0.18, 6), IRON, {
      bone: root,
      at: [x, 0.34, z],
      flat: true,
      name: `brazier${x}${z}`,
    });
    b.part(new THREE.TorusGeometry(0.105, 0.018, 5, 12), BRONZE_LIGHT, {
      bone: root,
      at: [x, 0.44, z],
      rotation: [90, 0, 0],
      flat: true,
      name: `brazierRim${x}${z}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.065, 8, 5), EMBER, {
        bone: root,
        at: [x, 0.49, z],
        flat: true,
        name: `brazierEmber${x}${z}`,
      }),
      2.1,
    );
  }

  const ringRadius = 1.72;
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const deg = (angle * 180) / Math.PI;
    const cx = Math.sin(angle) * ringRadius;
    const cz = Math.cos(angle) * ringRadius;
    const h = 1.12 + (i % 4) * 0.065;
    const lean = ((i % 3) - 1) * 3;

    // Broad foot, battered monolith, and a separate cap keep the silhouette chunky.
    b.part(new THREE.BoxGeometry(0.56, 0.16, 0.52), STONE_DARK, {
      bone: root,
      at: [cx, 0.31, cz],
      rotation: [0, deg, 0],
      flat: true,
      name: `stoneBase${i}`,
    });
    b.part(new THREE.BoxGeometry(0.42, h, 0.34), stonePaint, {
      bone: root,
      at: [cx, 0.39 + h / 2, cz],
      rotation: [0, deg, lean],
      flat: true,
      name: `stone${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.255, 0.29, 0.13, 5), STONE_LIGHT, {
      bone: root,
      at: [cx, 0.39 + h + 0.065, cz],
      rotation: [0, deg + 18, 0],
      flat: true,
      name: `stoneCap${i}`,
    });

    // Bronze straps and rivets read as hand-forged repairs against the old stone.
    for (const strapY of [0.62, 1.02]) {
      b.part(new THREE.BoxGeometry(0.46, 0.052, 0.042), BRONZE, {
        bone: root,
        at: radialPoint(cx, cz, angle, 0, 0.184, strapY),
        rotation: [0, deg, 0],
        flat: true,
        name: `stoneStrap${i}${strapY}`,
      });
      for (const side of [-1, 1]) {
        b.part(new THREE.SphereGeometry(0.031, 6, 4), BRONZE_LIGHT, {
          bone: root,
          at: radialPoint(cx, cz, angle, side * 0.17, 0.209, strapY),
          rotation: [0, deg, 0],
          flat: true,
          name: `stoneRivet${i}${strapY}${side}`,
        });
      }
    }

    // Three-stroke runes are intentionally blocky and readable from the hero angle.
    const runeDepth = 0.211;
    const runeBars: Array<[number, number, number, number, number]> = [
      [0, 0.74, 0.16, 0.035, 0],
      [-0.07, 0.85, 0.035, 0.2, 0],
      [0.07, 0.97, 0.14, 0.035, 0],
      [0, 1.08, 0.035, 0.16, 0],
    ];
    for (let j = 0; j < runeBars.length; j += 1) {
      const [lx, ly, width, height, roll] = runeBars[j];
      glow(
        b.part(new THREE.BoxGeometry(width, height, 0.018), j % 2 === 0 ? RUNE : "#8bf6fa", {
          bone: root,
          at: radialPoint(cx, cz, angle, lx, runeDepth, ly),
          rotation: [0, deg, roll],
          flat: true,
          name: `stoneRune${i}_${j}`,
        }),
        2.15,
      );
    }

    // A dark inset below each rune makes the glow feel carved rather than painted on.
    b.part(new THREE.BoxGeometry(0.24, 0.42, 0.012), VOID, {
      bone: root,
      at: radialPoint(cx, cz, angle, 0, 0.204, 0.91),
      rotation: [0, deg, 0],
      flat: true,
      name: `stoneRuneInset${i}`,
    });
  }

  // Heavy corner markers punctuate the outer circle and imply a larger unseen ward.
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(angle) * 2.02;
    const z = Math.cos(angle) * 2.02;
    b.part(new THREE.CylinderGeometry(0.085, 0.11, 0.22, 6), BRONZE, {
      bone: root,
      at: [x, 0.32, z],
      flat: true,
      name: `outerMarker${i}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.042, 6, 4), RUNE, {
        bone: root,
        at: [x, 0.46, z],
        flat: true,
        name: `outerMarkerGlow${i}`,
      }),
      1.8,
    );
  }

  return b.root;
}
