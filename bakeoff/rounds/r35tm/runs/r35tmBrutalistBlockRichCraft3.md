```ts
import * as THREE from "three";
import { createBuilder, mottle, countershade, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "brutalist housing block",
  description: "A raw concrete brutalist housing block with stepped masses, recessed windows, galleries, balconies, rooftop plant, and a monumental entry.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = countershade(
    mottle("#6f706c", "#a4a39b", { size: 0.42, contrast: 1.35, seed: 17 }),
    "#50524f",
    { level: -0.15, soft: 0.28 },
  );
  const CONCRETE_LIGHT = mottle("#92918a", "#b7b5aa", { size: 0.25, contrast: 1.2, seed: 23 });
  const CONCRETE_DARK = mottle("#4e504d", "#777873", { size: 0.3, contrast: 1.25, seed: 31 });
  const ROOF = grain("#3f413f", "#666863", { size: 0.12, axis: "z", seed: 9 });
  const WINDOW = "#172329";
  const WINDOW_REFLECT = "#587078";
  const FRAME = "#303432";
  const RUST = "#8b4d2e";
  const METAL = "#747872";
  const WARM = "#d7a35b";
  const PLANT = "#27352d";

  const windowTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#18252a"/>
      <path d="M4 10H60M4 31H60M4 52H60M22 4V60M43 4V60" stroke="#6c8588" stroke-width="2" opacity=".5"/>
      <path d="M7 8H19V27H7ZM25 8H40V27H25ZM46 8H57V27H46Z" fill="#273b40"/>
      <path d="M8 11H18L8 23ZM26 11H38L26 22ZM47 11H56L47 22Z" fill="#9eafb0" opacity=".48"/>
    </svg>`,
    { size: 128 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    name = "mass",
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      name,
      flat: true,
    });

  const frontWindow = (
    x: number,
    y: number,
    z: number,
    w = 0.92,
    h = 1.12,
    name = "recessed-window",
  ) => {
    box([w + 0.16, h + 0.16, 0.18], [x, y, z - 0.055], CONCRETE_DARK, `${name}-recess`);
    b.part(new THREE.BoxGeometry(w, h, 0.035), "#18252a", {
      at: [x, y, z + 0.055],
      texture: windowTexture,
      name: `${name}-glass`,
    });
    box([0.045, h + 0.08, 0.055], [x, y, z + 0.09], FRAME, `${name}-mullion`);
    box([w + 0.16, 0.075, 0.28], [x, y - h / 2 - 0.075, z + 0.02], CONCRETE_LIGHT, `${name}-sill`);
  };

  const sideWindow = (
    x: number,
    y: number,
    z: number,
    side: number,
    w = 0.86,
    h = 1.1,
    name = "side-window",
  ) => {
    box([0.18, h + 0.16, w + 0.16], [x - side * 0.055, y, z], CONCRETE_DARK, `${name}-recess`);
    b.part(new THREE.BoxGeometry(0.035, h, w), "#18252a", {
      at: [x + side * 0.055, y, z],
      texture: windowTexture,
      dir: [side, 0, 0],
      axis: "z",
      name: `${name}-glass`,
    });
    box([0.055, h + 0.08, 0.05], [x + side * 0.09, y, z], FRAME, `${name}-mullion`);
    box([0.28, 0.075, w + 0.16], [x + side * 0.02, y - h / 2 - 0.075, z], CONCRETE_LIGHT, `${name}-sill`);
  };

  const rail = (a: [number, number, number], c: [number, number, number], name: string) => {
    b.rod(a, c, 0.025, METAL, { name, section: { ngon: 6 }, caps: "flat" });
  };

  // Deep plinth and podium.
  box([12.8, 0.42, 7.15], [0, 0.21, 0], CONCRETE_DARK, "monolithic-plinth");
  box([11.8, 1.0, 6.55], [0, 0.92, 0], CONCRETE, "podium");
  box([10.1, 0.22, 6.8], [0, 1.53, 0], CONCRETE_LIGHT, "podium-cap");

  // Main tower: deliberately offset and heavily stepped.
  box([7.7, 7.1, 4.85], [0, 5.05, 0.18], CONCRETE, "main-tower");
  box([8.65, 0.34, 5.25], [0, 8.62, 0.18], CONCRETE_LIGHT, "tower-roof-slab");
  box([6.75, 0.3, 5.35], [0, 9.04, 0.18], CONCRETE_DARK, "tower-parapet");

  // Side wings and the characteristic stepped silhouette.
  box([2.45, 4.55, 5.75], [-5.0, 3.72, 0.0], CONCRETE, "left-wing");
  box([2.45, 5.35, 5.75], [5.0, 4.12, 0.0], CONCRETE, "right-wing");
  box([2.85, 0.34, 6.1], [-5.0, 6.08, 0.0], CONCRETE_LIGHT, "left-wing-cap");
  box([2.85, 0.34, 6.1], [5.0, 6.5, 0.0], CONCRETE_LIGHT, "right-wing-cap");

  // Tower front windows, grouped into severe vertical bays.
  const towerXs = [-2.7, -1.35, 0, 1.35, 2.7];
  const towerYs = [2.35, 3.62, 4.89, 6.16, 7.43];
  for (let r = 0; r < towerYs.length; r++) {
    for (let c = 0; c < towerXs.length; c++) {
      frontWindow(towerXs[c], towerYs[r], 2.64, 0.92, 1.02, `tower-window-${r}-${c}`);
    }
  }

  // Concrete vertical fins interrupt the facade and create deep shadow.
  for (const x of [-3.95, -0.7, 0.7, 3.95]) {
    box([0.22, 6.75, 0.34], [x, 5.06, 2.76], CONCRETE_LIGHT, "front-brise-soleil");
  }
  for (const x of [-3.75, 3.75]) {
    box([0.3, 6.8, 0.42], [x, 5.1, -2.28], CONCRETE_DARK, "rear-vertical-fin");
  }

  // Side-wing windows.
  for (const side of [-1, 1]) {
    const x = side * 6.27;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        sideWindow(x, 2.28 + row * 1.38, -1.55 + col * 1.42, side, 0.96, 1.08, `wing-window-${side}-${row}-${col}`);
      }
    }
  }

  // Ground-floor arcade: thick square piers and dark voids.
  for (const x of [-4.65, -3.1, -1.55, 0, 1.55, 3.1, 4.65]) {
    box([0.34, 2.15, 0.62], [x, 1.72, 2.78], CONCRETE_LIGHT, "arcade-pier");
  }
  box([11.5, 0.3, 0.7], [0, 2.8, 2.8], CONCRETE_LIGHT, "arcade-beam");
  box([1.75, 1.72, 0.16], [0, 1.54, 2.91], WINDOW, "entry-shadow");

  // Monumental recessed entrance with canopy and warm door.
  box([2.35, 2.15, 0.38], [0, 2.05, 3.12], CONCRETE_DARK, "entry-void");
  box([1.48, 1.72, 0.06], [0, 1.62, 3.34], "#191b1a", "entry-door");
  box([0.16, 1.62, 1.5], [-0.77, 1.62, 3.39], WARM, "entry-door-light");
  box([0.16, 1.62, 1.5], [0.77, 1.62, 3.39], "#252b29", "entry-door-dark");
  box([3.1, 0.28, 1.45], [0, 3.26, 3.12], CONCRETE_LIGHT, "entry-canopy");
  box([3.4, 0.18, 0.16], [0, 3.12, 3.8], CONCRETE_DARK, "canopy-shadow");

  // Continuous front galleries at alternating levels.
  for (const y of [3.0, 5.55, 8.05]) {
    box([8.8, 0.18, 1.05], [0, y, 3.05], CONCRETE_LIGHT, "gallery-slab");
    box([8.8, 0.12, 0.12], [0, y + 0.86, 3.48], METAL, "gallery-top-rail");
    for (const x of [-4.1, -3.0, -1.7, -0.4, 0.9, 2.2, 3.5, 4.2]) {
      rail([x, y, 3.48], [x, y + 0.86, 3.48], "gallery-upright");
    }
  }

  // Balcony boxes attached to the side wings.
  for (const side of [-1, 1]) {
    for (const y of [2.4, 4.1, 5.8]) {
      const x = side * 6.65;
      box([1.05, 0.16, 2.05], [x, y, -0.65], CONCRETE_LIGHT, "side-balcony-slab");
      rail([x - side * 0.45, y, -1.68], [x - side * 0.45, y + 0.78, -1.68], "balcony-rail");
      rail([x + side * 0.45, y, -1.68], [x + side * 0.45, y + 0.78, -1.68], "balcony-rail");
      rail([x - side * 0.45, y + 0.78, -1.68], [x + side * 0.45, y + 0.78, -1.68], "balcony-top-rail");
      for (const z of [-1.45, -0.9, -0.35]) {
        rail([x - side * 0.45, y, z], [x - side * 0.45, y + 0.78, z], "balcony-picket");
      }
    }
  }

  // Roof plant: lift overruns, vent stacks, water tanks, and a repeating forest of pipes.
  box([3.7, 0.7, 2.6], [0, 9.48, 0.15], CONCRETE_DARK, "roof-service-box");
  box([2.7, 0.22, 2.95], [0, 9.94, 0.15], CONCRETE_LIGHT, "roof-service-cap");
  box([1.8, 0.45, 1.5], [-2.0, 9.42, -0.2], CONCRETE_DARK, "stair-overrun");
  box([1.95, 0.18, 1.68], [-2.0, 9.75, -0.2], CONCRETE_LIGHT, "stair-cap");

  for (const x of [-3.15, -2.65, 2.15, 2.65]) {
    cylinder(0.13, 0.8, [x, 9.55, 1.35], METAL, "roof-vent", 8);
    cylinder(0.19, 0.08, [x, 9.98, 1.35], CONCRETE_LIGHT, "vent-cap", 8);
  }

  for (const x of [-1.0, 0.0, 1.0]) {
    cylinder(0.52, 1.25, [x, 10.58, -0.8], CONCRETE_LIGHT, "water-tank", 12);
    cylinder(0.58, 0.12, [x, 11.22, -0.8], CONCRETE_DARK, "water-tank-lid", 12);
    for (const a of [0, 90, 180, 270]) {
      const rad = (a * Math.PI) / 180;
      rail(
        [x + Math.cos(rad) * 0.52, 9.98, -0.8 + Math.sin(rad) * 0.52],
        [x + Math.cos(rad) * 0.52, 11.16, -0.8 + Math.sin(rad) * 0.52],
        "tank-brace",
      );
    }
  }

  // Rooftop antenna mast and satellite dish.
  cylinder(0.07, 2.8, [3.15, 10.7, 1.1], METAL, "antenna-mast", 8);
  cylinder(0.15, 0.16, [3.15, 9.35, 1.1], CONCRETE_DARK, "antenna-base", 8);
  b.part(new THREE.ConeGeometry(0.72, 0.25, 12, 1, true), METAL, {
    at: [3.15, 11.6, 1.1],
    dir: [0.05, 0.72, 1],
    name: "satellite-dish",
    flat: true,
  });
  rail([3.15, 11.55, 1.1], [3.15, 12.35, 1.1], "dish-feed-arm");

  // Raw concrete relief blocks on the blank end walls.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      box(
        [0.26, 0.65, 0.72],
        [side * 6.42, 7.18 + (i % 2) * 0.78, -2.0 + Math.floor(i / 2) * 1.0],
        i % 2 ? CONCRETE_LIGHT : CONCRETE_DARK,
        "end-wall-relief",
      );
    }
  }

  // Sparse rooftop planters: the only softness against the mass.
  for (const x of [-3.8, -3.0, 3.65, 4.45]) {
    box([0.72, 0.32, 0.62], [x, 9.28, 2.0], CONCRETE_DARK, "roof-planter");
    box([0.56, 0.06, 0.46], [x, 9.47, 2.0], PLANT, "roof-planter-soil");
    for (const z of [1.85, 2.0, 2.15]) {
      b.part(new THREE.SphereGeometry(0.12, 6, 4), PLANT, {
        at: [x + (z - 2) * 0.2, 9.62 + (z % 0.1), z],
        name: "rooftop-shrub",
        flat: true,
      });
    }
  }

  // A brutal, oversized external stair flight at the rear.
  for (let i = 0; i < 9; i++) {
    box(
      [2.2, 0.22, 0.62],
      [-3.9, 1.75 + i * 0.39, -3.05 + i * 0.32],
      i % 2 ? CONCRETE_LIGHT : CONCRETE,
      "external-stair-tread",
    );
  }
  box([2.45, 0.2, 0.32], [-3.9, 5.35, -0.18], CONCRETE_DARK, "stair-landing");
  rail([-4.95, 1.9, -3.45], [-4.95, 5.65, -0.15], "stair-handrail");
  rail([-2.85, 1.9, -3.45], [-2.85, 5.65, -0.15], "stair-handrail");

  // Drain pipes and small service boxes make the facades feel inhabited.
  for (const x of [-5.92, 5.92, -3.62, 3.62]) {
    b.rod([x, 1.65, 2.91], [x, 8.3, 2.91], 0.045, METAL, {
      name: "rainwater-pipe",
      section: { ngon: 6 },
      caps: "flat",
    });
    cylinder(0.11, 0.16, [x, 1.7, 2.91], CONCRETE_DARK, "drain-foot", 8);
  }

  // A few deliberately oversized facade lights under the galleries.
  for (const x of [-3.9, -1.3, 1.3, 3.9]) {
    cylinder(0.09, 0.035, [x, 2.93, 3.34], WARM, "gallery-light", 8);
  }

  return b.root;
}
```