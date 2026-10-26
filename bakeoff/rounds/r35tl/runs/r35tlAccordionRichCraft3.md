```ts
import * as THREE from "three";
import { createBuilder, paint, noise, svg } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented, low-poly Italian piano accordion with iridescent pearl shell panels, pleated bellows, ivory piano keys, bass buttons, chrome trim, straps, and engraved floral medallions.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const DARK = "#201b27";
  const EDGE = "#34283a";
  const BLACK = "#17131b";
  const IVORY = "#fff1cf";
  const IVORY_DARK = "#cba873";
  const GOLD = "#d6a54d";
  const GOLD_DARK = "#76502b";
  const CHROME = "#b9c5d1";
  const RED = "#8e263c";
  const PEARL = paint((p, n) => {
    const iridescence =
      0.5 +
      0.5 *
        Math.sin(
          p.x * 23 +
            p.y * 17 +
            p.z * 29 +
            noise(p, 0.22, 17) * 5,
        );
    const light = 0.72 + 0.28 * Math.max(0, n.y);
    const r = 0.78 + iridescence * 0.18;
    const g = 0.54 + iridescence * 0.28;
    const bl = 0.72 + (1 - iridescence) * 0.22;
    return [r * light, g * light, bl * light];
  });
  const PEARL_CREAM = paint((p, n) => {
    const t = 0.5 + 0.5 * Math.sin(p.x * 31 + p.z * 19 + noise(p, 0.18, 9) * 7);
    const l = 0.82 + 0.18 * Math.max(0, n.y);
    return [l, (0.67 + t * 0.2) * l, (0.72 + t * 0.18) * l];
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    opts: any = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    opts: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, opts.segments ?? 10), color, {
      at,
      ...opts,
    });

  const pearlFloral = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="18" fill="#f4d98a"/>
      <circle cx="64" cy="64" r="56" fill="none" stroke="#67243d" stroke-width="5"/>
      <path d="M64 105 C42 87 35 65 48 48 C57 36 69 39 72 49 C76 35 92 35 95 48 C100 67 82 86 64 105Z"
        fill="#a52e50" stroke="#451b36" stroke-width="4"/>
      <path d="M64 98 C60 73 64 59 69 46 M64 75 C52 67 45 57 44 46 M67 79 C82 69 90 58 91 47"
        fill="none" stroke="#f4d98a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="27" r="7" fill="#fff1c2"/>
      <circle cx="38" cy="84" r="5" fill="#fff1c2"/>
      <circle cx="91" cy="84" r="5" fill="#fff1c2"/>
    </svg>`,
    { size: 256 },
  );

  const scroll = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 52 C18 18 41 8 56 25 C68 39 49 57 36 43 C26 32 38 21 48 28
               M120 52 C110 18 87 8 72 25 C60 39 79 57 92 43 C102 32 90 21 80 28"
        fill="none" stroke="#fff3b0" stroke-width="6" stroke-linecap="round"/>
      <path d="M8 52 C18 18 41 8 56 25 M120 52 C110 18 87 8 72 25"
        fill="none" stroke="#702342" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  // Main silhouette: two ornate end boxes and a dark, compressed bellows core.
  box([0.16, 0.92, 0.52], [-0.49, 0.53, 0], EDGE);
  box([0.16, 0.92, 0.52], [0.49, 0.53, 0], EDGE);
  box([0.53, 0.78, 0.40], [0, 0.53, 0], DARK);

  // Shell faces on the two wooden end boards.
  box([0.025, 0.78, 0.43], [-0.585, 0.53, 0], PEARL, { dir: [1, 0, 0] });
  box([0.025, 0.78, 0.43], [0.585, 0.53, 0], PEARL, { dir: [1, 0, 0] });

  // Gilded perimeter rails and corner caps.
  for (const x of [-0.602, 0.602]) {
    box([0.035, 0.055, 0.47], [x, 0.96, 0], GOLD);
    box([0.035, 0.055, 0.47], [x, 0.10, 0], GOLD);
    box([0.035, 0.82, 0.055], [x, 0.53, 0.235], GOLD);
    box([0.035, 0.82, 0.055], [x, 0.53, -0.235], GOLD_DARK);
    for (const y of [0.14, 0.92]) {
      for (const z of [-0.19, 0.19]) {
        cyl(0.025, 0.045, [x + (x > 0 ? 0.018 : -0.018), y, z], GOLD, {
          dir: [1, 0, 0],
          segments: 8,
        });
      }
    }
  }

  // Pleated bellows, alternating wine-red leather folds and pearl-gold ribs.
  for (let i = 0; i < 9; i++) {
    const x = -0.265 + i * 0.066;
    box([0.036, 0.70, 0.43], [x, 0.53, 0], i % 2 ? RED : BLACK);
    box([0.012, 0.73, 0.445], [x - 0.019, 0.53, 0], GOLD_DARK);
    box([0.010, 0.68, 0.455], [x + 0.020, 0.53, 0], EDGE);
  }
  for (const z of [-0.222, 0.222]) {
    box([0.48, 0.035, 0.035], [0, 0.53, z], GOLD);
    box([0.48, 0.035, 0.035], [0, 0.16, z], GOLD_DARK);
    box([0.48, 0.035, 0.035], [0, 0.90, z], GOLD);
  }

  // Front and rear shell panels with floral inlay.
  for (const x of [-0.585, 0.585]) {
    b.part(new THREE.PlaneGeometry(0.30, 0.30), "#ffffff", {
      at: [x + (x > 0 ? 0.018 : -0.018), 0.61, 0],
      dir: [x > 0 ? 1 : -1, 0, 0],
      axis: "z",
      texture: pearlFloral,
      rotation: [0, 0, x > 0 ? 90 : -90],
    });
    b.part(new THREE.PlaneGeometry(0.32, 0.16), "#ffffff", {
      at: [x + (x > 0 ? 0.019 : -0.019), 0.25, 0],
      dir: [x > 0 ? 1 : -1, 0, 0],
      axis: "z",
      texture: scroll,
    });
  }

  // Mother-of-pearl side studs and decorative rosettes.
  for (const x of [-0.62, 0.62]) {
    for (let i = 0; i < 7; i++) {
      const y = 0.20 + i * 0.105;
      cyl(0.018, 0.028, [x + (x > 0 ? 0.018 : -0.018), y, 0], PEARL_CREAM, {
        dir: [1, 0, 0],
        segments: 8,
      });
    }
    for (const z of [-0.17, 0.17]) {
      cyl(0.045, 0.025, [x + (x > 0 ? 0.02 : -0.02), 0.53, z], GOLD, {
        dir: [1, 0, 0],
        segments: 12,
      });
      cyl(0.025, 0.032, [x + (x > 0 ? 0.04 : -0.04), 0.53, z], RED, {
        dir: [1, 0, 0],
        segments: 10,
      });
    }
  }

  // Piano keyboard on the right-hand case, projecting toward the viewer (+Z).
  box([0.25, 0.62, 0.075], [0.51, 0.54, 0.295], GOLD_DARK);
  box([0.22, 0.58, 0.028], [0.51, 0.56, 0.338], PEARL_CREAM);
  const whiteW = 0.027;
  for (let i = 0; i < 7; i++) {
    const y = 0.30 + i * 0.085;
    box([0.205, 0.067, 0.018], [0.51, y, 0.365], IVORY, {
      rotation: [0, 0, 0],
    });
    box([0.205, 0.008, 0.022], [0.51, y + 0.039, 0.376], GOLD_DARK);
  }
  for (let i = 0; i < 6; i++) {
    const y = 0.343 + i * 0.085;
    box([0.15, 0.034, 0.025], [0.51, y, 0.388], BLACK);
  }
  box([0.24, 0.035, 0.06], [0.51, 0.93, 0.33], PEARL);
  box([0.24, 0.035, 0.06], [0.51, 0.15, 0.33], PEARL);

  // Bass-button board on the left-hand case.
  box([0.25, 0.62, 0.065], [-0.51, 0.54, 0.29], GOLD_DARK);
  box([0.22, 0.58, 0.025], [-0.51, 0.54, 0.33], DARK);
  const buttonRows = [
    [0.31, 0.39, 0.47, 0.55, 0.63, 0.71, 0.79],
    [0.345, 0.425, 0.505, 0.585, 0.665, 0.745],
    [0.38, 0.46, 0.54, 0.62, 0.70],
  ];
  buttonRows.forEach((row, r) =>
    row.forEach((y, i) => {
      cyl(0.026, 0.022, [-0.51, y, 0.367], i % 3 === 0 ? PEARL : IVORY_DARK, {
        dir: [0, 0, 1],
        segments: 10,
      });
      cyl(0.014, 0.026, [-0.51, y, 0.384], GOLD, {
        dir: [0, 0, 1],
        segments: 8,
      });
    }),
  );

  // Decorative grille and air-button on the left face.
  for (let i = 0; i < 5; i++) {
    box([0.018, 0.025, 0.30], [-0.625, 0.37 + i * 0.075, -0.07], GOLD);
  }
  cyl(0.035, 0.025, [-0.64, 0.74, -0.08], RED, {
    dir: [1, 0, 0],
    segments: 12,
  });
  cyl(0.022, 0.035, [-0.66, 0.74, -0.08], PEARL_CREAM, {
    dir: [1, 0, 0],
    segments: 10,
  });

  // Bellows hinge rails and axle barrels.
  for (const z of [-0.205, 0.205]) {
    box([0.62, 0.045, 0.035], [0, 0.53, z], GOLD);
    cyl(0.028, 0.64, [0, 0.53, z], CHROME, { dir: [1, 0, 0], segments: 8 });
  }

  // Shoulder straps, crossing behind the instrument.
  for (const x of [-0.39, 0.39]) {
    box([0.07, 0.90, 0.025], [x, 0.53, -0.29], RED, {
      rotation: [0, x > 0 ? -18 : 18, 0],
    });
    box([0.085, 0.075, 0.035], [x, 0.91, -0.30], GOLD);
    box([0.085, 0.075, 0.035], [x, 0.15, -0.30], GOLD);
    cyl(0.026, 0.04, [x, 0.91, -0.33], CHROME, { dir: [0, 0, 1], segments: 8 });
    cyl(0.026, 0.04, [x, 0.15, -0.33], CHROME, { dir: [0, 0, 1], segments: 8 });
  }

  // Small pearl buttons along the upper rim and a central maker's badge.
  for (let i = 0; i < 9; i++) {
    const x = -0.44 + i * 0.11;
    cyl(0.014, 0.018, [x, 0.975, 0.16], PEARL_CREAM, {
      dir: [0, 1, 0],
      segments: 8,
    });
  }
  cyl(0.055, 0.018, [0, 0.99, 0], GOLD, { dir: [0, 1, 0], segments: 12 });
  cyl(0.036, 0.022, [0, 1.005, 0], RED, { dir: [0, 1, 0], segments: 12 });
  cyl(0.018, 0.026, [0, 1.02, 0], PEARL_CREAM, { dir: [0, 1, 0], segments: 10 });

  // Feet keep the accordion firmly on the floor.
  for (const x of [-0.49, 0.49]) {
    for (const z of [-0.17, 0.17]) {
      cyl(0.055, 0.07, [x, 0.035, z], BLACK, { segments: 8 });
      cyl(0.038, 0.075, [x, 0.075, z], GOLD_DARK, { segments: 8 });
    }
  }

  return b.root;
}
```