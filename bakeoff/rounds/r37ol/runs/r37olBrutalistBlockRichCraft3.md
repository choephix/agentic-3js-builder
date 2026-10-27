```ts
import * as THREE from "three";
import { createBuilder, mottle, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw-concrete brutalist housing block with stepped masses, deep window recesses, projecting balconies, roof plant, service pipes, and heavy architectural details.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#85827b", "#5e5c57", { size: 0.42, contrast: 1.5, seed: 18 });
  const DARK_CONCRETE = mottle("#66645f", "#454440", { size: 0.3, contrast: 1.3, seed: 22 });
  const TOP_CONCRETE = grain("#aaa69b", "#6d6b64", { size: 0.09, axis: "z", seed: 4 });
  const SHADOW = "#25272a";
  const GLASS = "#182126";
  const GLASS_BLUE = "#263b43";
  const RUST = "#764b35";
  const METAL = "#34383a";
  const LIGHT = "#d5bd83";
  const PLANT = "#586258";

  const windowTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#354c53"/>
          <stop offset="0.48" stop-color="#172329"/>
          <stop offset="1" stop-color="#080d10"/>
        </linearGradient>
      </defs>
      <rect width="64" height="96" fill="url(#g)"/>
      <path d="M8 0v96M32 0v96M56 0v96M0 31h64M0 64h64"
        stroke="#56666a" stroke-width="2" opacity=".55"/>
      <path d="M4 82h56" stroke="#9b8b69" stroke-width="2" opacity=".28"/>
      <rect x="5" y="5" width="20" height="22" fill="#6b8386" opacity=".18"/>
      <rect x="36" y="37" width="20" height="23" fill="#87928e" opacity=".12"/>
    </svg>`,
    { size: 128 },
  );

  const litWindowTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
      <rect width="64" height="96" fill="#806d4d"/>
      <rect x="4" y="4" width="56" height="88" fill="#d7c18b" opacity=".62"/>
      <path d="M32 0v96M0 48h64" stroke="#252b2d" stroke-width="3"/>
      <path d="M7 12h18M38 68h17" stroke="#fff2bd" stroke-width="3" opacity=".5"/>
    </svg>`,
    { size: 128 },
  );

  const ventTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
      <rect width="64" height="32" fill="#17191a"/>
      <path d="M3 5h58M3 11h58M3 17h58M3 23h58M3 29h58"
        stroke="#72716a" stroke-width="2"/>
      <path d="M7 2v28M19 2v28M31 2v28M43 2v28M55 2v28"
        stroke="#2b2d2c" stroke-width="2"/>
    </svg>`,
    { size: 96 },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });
  }

  function frontWindow(
    x: number,
    y: number,
    w: number,
    h: number,
    lit = false,
    z = 1.416,
    name = "front-window",
  ) {
    box([w + 0.065, h + 0.065, 0.10], [x, y, z - 0.025], DARK_CONCRETE, `${name}-recess`);
    b.part(new THREE.PlaneGeometry(w, h), lit ? "#b48d55" : "#24383d", {
      at: [x, y, z + 0.032],
      dir: [0, 0, 1],
      axis: "z",
      texture: lit ? litWindowTexture : windowTexture,
      name,
    });
    box([0.035, h + 0.12, 0.055], [x - w * 0.5 - 0.035, y, z + 0.04], CONCRETE, `${name}-left-jamb`);
    box([0.035, h + 0.12, 0.055], [x + w * 0.5 + 0.035, y, z + 0.04], CONCRETE, `${name}-right-jamb`);
    box([w + 0.12, 0.035, 0.055], [x, y - h * 0.5 - 0.035, z + 0.04], CONCRETE, `${name}-sill`);
  }

  function sideWindow(
    z: number,
    y: number,
    w: number,
    h: number,
    lit = false,
    x = 2.516,
    name = "side-window",
  ) {
    box([0.10, h + 0.065, w + 0.065], [x - 0.025, y, z], DARK_CONCRETE, `${name}-recess`);
    b.part(new THREE.PlaneGeometry(w, h), lit ? "#b48d55" : "#24383d", {
      at: [x + 0.032, y, z],
      dir: [1, 0, 0],
      axis: "z",
      texture: lit ? litWindowTexture : windowTexture,
      rotation: [0, 90, 0],
      name,
    });
    box([0.055, h + 0.12, 0.035], [x + 0.04, y, z - w * 0.5 - 0.035], CONCRETE, `${name}-back-jamb`);
    box([0.055, h + 0.12, 0.035], [x + 0.04, y, z + w * 0.5 + 0.035], CONCRETE, `${name}-front-jamb`);
  }

  function railFront(x: number, y: number, z: number, width: number, height: number, name: string) {
    b.rod([x - width / 2, y, z], [x + width / 2, y, z], 0.018, METAL, {
      name: `${name}-top`,
    });
    b.rod(
      [x - width / 2, y - height, z],
      [x + width / 2, y - height, z],
      0.018,
      METAL,
      { name: `${name}-bottom` },
    );
    for (let i = 0; i <= 5; i++) {
      const px = x - width / 2 + (width * i) / 5;
      b.rod([px, y - height, z], [px, y, z], 0.012, METAL, {
        name: `${name}-baluster-${i}`,
      });
    }
  }

  function roofPlant(x: number, z: number, w: number, d: number, h: number, name: string) {
    box([w, h, d], [x, 5.22 + h / 2, z], DARK_CONCRETE, `${name}-housing`);
    box([w + 0.06, 0.07, d + 0.06], [x, 5.22 + h + 0.035, z], TOP_CONCRETE, `${name}-cap`);
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.055, d * 0.72, 0.025), METAL, {
        at: [x - w / 2 - 0.018 + i * 0.09, 5.22 + h * 0.5, z],
        dir: [1, 0, 0],
        name: `${name}-louver-${i}`,
      });
    }
  }

  // Main stepped structural masses.
  box([5.2, 4.55, 2.75], [0, 2.275, 0], CONCRETE, "main-seven-bay-block");
  box([4.65, 0.48, 2.95], [0, 4.79, -0.03], TOP_CONCRETE, "roof-overhang");
  box([4.0, 1.15, 2.32], [0, 5.33, -0.18], CONCRETE, "upper-setback-block");
  box([3.35, 0.24, 2.48], [0, 5.98, -0.18], TOP_CONCRETE, "upper-parapet");

  // Heavy side buttresses.
  for (const s of [-1, 1]) {
    box([0.42, 4.95, 2.95], [s * 2.38, 2.48, -0.03], DARK_CONCRETE, `side-buttress-${s}`);
    box([0.58, 1.2, 3.20], [s * 2.22, 4.95, -0.05], CONCRETE, `roof-side-pier-${s}`);
    box([0.34, 3.75, 0.40], [s * 2.66, 2.22, 1.18], CONCRETE, `side-rib-front-${s}`);
    box([0.34, 3.75, 0.40], [s * 2.66, 2.22, -1.18], CONCRETE, `side-rib-back-${s}`);
  }

  // Horizontal floor bands and vertical construction joints.
  for (let i = 0; i < 5; i++) {
    const y = 0.18 + i * 0.93;
    box([5.34, 0.11, 2.89], [0, y, 0], TOP_CONCRETE, `floor-band-${i}`);
  }
  for (const x of [-1.42, 0, 1.42]) {
    box([0.065, 4.48, 0.025], [x, 2.42, 1.405], DARK_CONCRETE, "cast-joint-front");
  }

  // Recessed entrance portal and deep shadow beneath the block.
  box([1.18, 2.15, 0.16], [0, 1.08, 1.43], DARK_CONCRETE, "entrance-recess");
  box([0.16, 2.22, 0.25], [-0.68, 1.1, 1.47], CONCRETE, "entrance-left-pier");
  box([0.16, 2.22, 0.25], [0.68, 1.1, 1.47], CONCRETE, "entrance-right-pier");
  box([1.48, 0.20, 0.30], [0, 2.16, 1.47], CONCRETE, "entrance-lintel");
  b.part(new THREE.PlaneGeometry(0.92, 1.78), GLASS_BLUE, {
    at: [0, 1.04, 1.525],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTexture,
    name: "entrance-glazing",
  });
  box([0.07, 1.65, 0.035], [-0.03, 1.05, 1.555], METAL, "entrance-door-mullion");
  b.part(new THREE.BoxGeometry(0.055, 0.055, 0.08), LIGHT, {
    at: [0.34, 1.06, 1.60],
    name: "entrance-handle",
  });

  // Front facade windows: varied, repetitive, and deliberately recessed.
  const floors = [0.78, 1.69, 2.62, 3.55, 4.42];
  const bays = [-1.88, -1.18, -0.48, 0.48, 1.18, 1.88];
  for (let fi = 0; fi < floors.length; fi++) {
    for (let bi = 0; bi < bays.length; bi++) {
      if (fi === 0 && Math.abs(bays[bi]) < 0.7) continue;
      const wide = fi === 3 && bi % 2 === 0;
      const w = wide ? 0.48 : 0.38;
      const h = fi === 0 ? 0.52 : 0.57;
      const x = bays[bi] + (wide ? (bi % 2 ? 0.05 : -0.05) : 0);
      frontWindow(x, floors[fi], w, h, (fi + bi) % 7 === 0, 1.438, `front-${fi}-${bi}`);
      if (fi === 1 || fi === 3) {
        box([w + 0.16, 0.065, 0.16], [x, floors[fi] - h / 2 - 0.095, 1.47], CONCRETE, `sill-${fi}-${bi}`);
      }
    }
  }

  // Upper setback windows.
  for (const x of [-1.35, -0.68, 0.68, 1.35]) {
    frontWindow(x, 5.47, 0.43, 0.58, x === 0.68, 1.005, "upper-front-window");
  }

  // Side windows and deep blank side walls.
  for (let fi = 0; fi < 5; fi++) {
    const y = floors[fi];
    for (let zi = 0; zi < 3; zi++) {
      const z = -0.82 + zi * 0.82;
      sideWindow(z, y, 0.46, 0.53, (fi + zi) % 6 === 1, 2.63, `right-side-${fi}-${zi}`);
      sideWindow(z, y, 0.46, 0.53, (fi + zi) % 5 === 0, -2.63, `left-side-${fi}-${zi}`);
    }
  }

  // Projecting balconies on alternating floors.
  const balconies = [
    [-1.56, 1.62, 1.22],
    [1.34, 2.55, 1.28],
    [-1.35, 3.48, 1.35],
    [1.38, 4.40, 1.10],
  ] as const;
  balconies.forEach(([x, y, width], i) => {
    box([width, 0.16, 0.78], [x, y - 0.39, 1.76], CONCRETE, `balcony-${i}-slab`);
    box([width + 0.08, 0.13, 0.12], [x, y - 0.27, 2.12], TOP_CONCRETE, `balcony-${i}-edge`);
    box([0.12, 0.20, 0.82], [x - width / 2, y - 0.22, 1.76], CONCRETE, `balcony-${i}-left-wall`);
    box([0.12, 0.20, 0.82], [x + width / 2, y - 0.22, 1.76], CONCRETE, `balcony-${i}-right-wall`);
    railFront(x, y + 0.12, 2.13, width, 0.48, `balcony-${i}-rail`);
    b.rod([x - width / 2, y - 0.30, 1.78], [x - width / 2, y - 0.30, 2.12], 0.018, METAL, {
      name: `balcony-${i}-side-rail-l`,
    });
    b.rod([x + width / 2, y - 0.30, 1.78], [x + width / 2, y - 0.30, 2.12], 0.018, METAL, {
      name: `balcony-${i}-side-rail-r`,
    });
  });

  // Concrete access stairs at the base.
  for (let i = 0; i < 5; i++) {
    box([1.55 - i * 0.11, 0.14, 0.28], [0, 0.07 + i * 0.14, 1.55 + i * 0.12], CONCRETE, `entrance-step-${i}`);
  }

  // Long service ledge and fire escape along the left side.
  box([0.18, 3.25, 0.18], [-2.78, 2.14, 0.72], CONCRETE, "fire-escape-spine");
  for (let i = 0; i < 4; i++) {
    const y = 0.72 + i * 0.84;
    box([0.72, 0.10, 1.05], [-2.92, y, 0.18], DARK_CONCRETE, `fire-escape-platform-${i}`);
    railFront(-2.92, y + 0.36, 0.68, 0.72, 0.42, `fire-escape-rail-${i}`);
    b.rod([-2.92, y - 0.06, -0.30], [-2.92, y + 0.74, -0.30], 0.018, METAL, {
      name: `fire-escape-side-${i}`,
    });
  }

  // Roofline parapets, vents, tanks, and mechanical clutter.
  box([4.18, 0.34, 0.18], [0, 6.14, 1.16], CONCRETE, "front-roof-parapet");
  box([4.18, 0.34, 0.18], [0, 6.14, -1.30], CONCRETE, "back-roof-parapet");
  box([0.18, 0.34, 2.55], [-2.02, 6.14, -0.07], CONCRETE, "left-roof-parapet");
  box([0.18, 0.34, 2.55], [2.02, 6.14, -0.07], CONCRETE, "right-roof-parapet");

  roofPlant(-1.15, -0.30, 0.72, 0.76, 0.78, "roof-plant-west");
  roofPlant(1.03, -0.38, 0.86, 0.62, 0.60, "roof-plant-east");

  for (let i = 0; i < 3; i++) {
    box([0.34, 0.42, 0.34], [-0.42 + i * 0.48, 6.39, 0.18], DARK_CONCRETE, `roof-vent-${i}`);
    b.part(new THREE.PlaneGeometry(0.25, 0.30), "#202526", {
      at: [-0.42 + i * 0.48, 6.40, 0.355],
      dir: [0, 0, 1],
      axis: "z",
      texture: ventTexture,
      name: `roof-vent-grille-${i}`,
    });
  }

  // Small cylindrical roof water tank with ribs and a cap.
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.72, 12, 1), DARK_CONCRETE, {
    at: [0.55, 6.50, -0.52],
    name: "water-tank",
  });
  b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.055, 12), TOP_CONCRETE, {
    at: [0.55, 6.88, -0.52],
    name: "water-tank-lid",
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.rod(
      [0.55 + Math.cos(a) * 0.34, 6.18, -0.52 + Math.sin(a) * 0.34],
      [0.55 + Math.cos(a) * 0.34, 6.87, -0.52 + Math.sin(a) * 0.34],
      0.012,
      METAL,
      { name: "water-tank-rib" },
    );
  }

  // Antenna mast and crooked satellite dish.
  b.rod([1.58, 6.16, -0.64], [1.58, 7.02, -0.64], 0.018, METAL, {
    name: "antenna-mast",
  });
  b.rod([1.35, 6.82, -0.64], [1.81, 6.82, -0.64], 0.012, METAL, {
    name: "antenna-crossbar",
  });
  b.part(new THREE.SphereGeometry(0.08, 8, 5), METAL, {
    at: [1.58, 7.05, -0.64],
    name: "antenna-cap",
  });
  b.part(new THREE.SphereGeometry(0.38, 10, 6), DARK_CONCRETE, {
    at: [-0.12, 6.80, -0.66],
    scale: [1, 0.22, 1],
    rotation: [0.38, 0.25, -0.22],
    name: "satellite-dish",
  });
  b.rod([-0.12, 6.80, -0.66], [-0.12, 7.22, -0.66], 0.018, METAL, {
    name: "dish-mast",
  });

  // Downpipes, stains, and brutalist vertical service conduits.
  for (const x of [-2.30, 2.30]) {
    b.rod([x, 0.08, 1.34], [x, 4.70, 1.34], 0.026, RUST, {
      name: "rusted-downpipe",
    });
    box([0.12, 0.18, 0.16], [x, 0.17, 1.34], RUST, "downpipe-foot");
  }
  for (const x of [-0.9, 0.9]) {
    box([0.16, 3.72, 0.13], [x, 2.30, -1.43], DARK_CONCRETE, "rear-service-shaft");
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.BoxGeometry(0.12, 0.28, 0.018), METAL, {
        at: [x, 0.65 + i * 0.62, -1.515],
        name: "rear-service-vent",
      });
    }
  }

  // Isolated graffiti-like geometric repair patches, kept architectural rather than decorative.
  box([0.52, 0.21, 0.018], [1.03, 0.43, 1.49], RUST, "patched-concrete-mark");
  box([0.18, 0.48, 0.02], [1.28, 0.58, 1.50], DARK_CONCRETE, "patched-concrete-mark-2");
  box([0.72, 0.035, 0.04], [-1.75, 3.98, 1.47], "#6f5340", "stained-lintel");

  // Ground-level utility hatch and brutalist plinth.
  box([5.55, 0.22, 3.02], [0, 0.11, 0], DARK_CONCRETE, "continuous-plinth");
  box([0.70, 0.035, 0.48], [1.72, 0.235, 1.49], METAL, "utility-hatch");
  box([0.05, 0.06, 0.05], [1.44, 0.27, 1.26], RUST, "hatch-bolt-a");
  box([0.05, 0.06, 0.05], [2.00, 0.27, 1.26], RUST, "hatch-bolt-b");

  return b.root;
}
```