```ts
import * as THREE from "three";
import { createBuilder, paint, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description: "A cheerful Animal Crossing-style Dutch windmill with a tapered brick tower, thatched cap, balcony, windows, door, and four broad wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const BRICK = paint((p, n) => {
    const mortar = "#c9a98d";
    const warm = "#d98268";
    const light = "#eeaa86";
    const dark = "#b96758";
    const row = Math.floor((p.y + 0.01) / 0.12);
    const stagger = row % 2 ? 0.105 : 0;
    const col = Math.floor((p.x + p.z * 0.18 + stagger) / 0.24);
    const seamX = Math.abs(((p.x + p.z * 0.18 + stagger) / 0.24) % 1);
    const seamY = Math.abs(((p.y + 0.01) / 0.12) % 1);
    if (seamX < 0.045 || seamY < 0.055) return mortar;
    if (n.y > 0.55) return light;
    return (col + row) % 5 === 0 ? dark : warm;
  });

  const ROOF = stripes("#b98955", "#76503b", {
    size: 0.095,
    axis: "y",
    width: 0.22,
    wobble: 0.18,
    seed: 7,
  });

  const WOOD = "#8d563b";
  const WOOD_LIGHT = "#c98b5b";
  const CREAM = "#fff0c8";
  const TRIM = "#f4c77b";
  const DEEP = "#3e3040";
  const BLUE = "#79b9c2";
  const BLUE_DARK = "#3a6878";
  const GREEN = "#75a86d";
  const RED = "#c96055";

  // Broad stone foundation, sunk just enough to meet the floor.
  b.part(
    new THREE.CylinderGeometry(0.71, 0.76, 0.16, 10),
    "#9c8d79",
    { at: [0, 0.08, 0], flat: true, name: "stoneFoundation", group: "foundation" },
  );

  // Tapered brick tower.
  b.part(
    new THREE.CylinderGeometry(0.43, 0.66, 1.42, 12),
    BRICK,
    { at: [0, 0.87, 0], flat: true, name: "brickTower", group: "tower" },
  );

  // White painted trim around the tower's top.
  b.part(
    new THREE.CylinderGeometry(0.445, 0.455, 0.075, 12),
    CREAM,
    { at: [0, 1.555, 0], flat: true, name: "topTrim", group: "trim" },
  );

  // Small painted doorway, front-facing (+Z).
  b.part(
    new THREE.BoxGeometry(0.27, 0.44, 0.035),
    WOOD,
    { at: [0, 0.31, 0.638], name: "door", group: "entrance" },
  );
  b.part(
    new THREE.BoxGeometry(0.205, 0.335, 0.012),
    "#5d8c83",
    { at: [0, 0.315, 0.661], name: "doorInset", group: "entrance" },
  );
  b.part(
    new THREE.BoxGeometry(0.018, 0.37, 0.045),
    WOOD_LIGHT,
    { at: [-0.09, 0.315, 0.676], name: "doorLeftRail", group: "entrance" },
  );
  b.part(
    new THREE.BoxGeometry(0.018, 0.37, 0.045),
    WOOD_LIGHT,
    { at: [0.09, 0.315, 0.676], name: "doorRightRail", group: "entrance" },
  );
  b.part(
    new THREE.BoxGeometry(0.235, 0.018, 0.045),
    WOOD_LIGHT,
    { at: [0, 0.315, 0.676], name: "doorMidRail", group: "entrance" },
  );
  b.part(
    new THREE.SphereGeometry(0.025, 8, 5),
    TRIM,
    { at: [0.075, 0.32, 0.704], name: "doorKnob", group: "entrance" },
  );

  // Little round window above the door.
  b.part(
    new THREE.CylinderGeometry(0.115, 0.115, 0.035, 12),
    CREAM,
    {
      at: [0, 0.92, 0.515],
      dir: [0, 0, 1],
      axis: "y",
      flat: true,
      name: "roundWindowFrame",
      group: "windows",
    },
  );
  b.part(
    new THREE.CircleGeometry(0.088, 12),
    BLUE,
    {
      at: [0, 0.92, 0.538],
      dir: [0, 0, 1],
      axis: "z",
      name: "roundWindowGlass",
      group: "windows",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.012, 0.16, 0.012),
    CREAM,
    { at: [0, 0.92, 0.555], name: "windowMullionV", group: "windows" },
  );
  b.part(
    new THREE.BoxGeometry(0.16, 0.012, 0.012),
    CREAM,
    { at: [0, 0.92, 0.555], name: "windowMullionH", group: "windows" },
  );

  // Two side windows, giving the tower a friendly inhabited face.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.035, 0.24, 0.18),
      CREAM,
      {
        at: [side * 0.42, 1.16, 0.12],
        name: side < 0 ? "leftWindowFrame" : "rightWindowFrame",
        group: "windows",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.012, 0.17, 0.125),
      BLUE,
      {
        at: [side * 0.445, 1.16, 0.12],
        name: side < 0 ? "leftWindowGlass" : "rightWindowGlass",
        group: "windows",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.015, 0.19, 0.018),
      CREAM,
      {
        at: [side * 0.454, 1.16, 0.12],
        name: side < 0 ? "leftWindowBar" : "rightWindowBar",
        group: "windows",
      },
    );
  }

  // Decorative green band around the lower tower.
  b.part(
    new THREE.CylinderGeometry(0.665, 0.67, 0.07, 12),
    GREEN,
    { at: [0, 0.57, 0], flat: true, name: "greenBelt", group: "trim" },
  );

  // Upper cap and broad thatched roof.
  b.part(
    new THREE.CylinderGeometry(0.49, 0.5, 0.09, 12),
    WOOD_LIGHT,
    { at: [0, 1.62, 0], flat: true, name: "roofEave", group: "roof" },
  );
  b.part(
    new THREE.ConeGeometry(0.58, 0.38, 12),
    ROOF,
    { at: [0, 1.82, 0], flat: true, name: "thatchedRoof", group: "roof" },
  );
  b.part(
    new THREE.CylinderGeometry(0.09, 0.11, 0.14, 8),
    WOOD,
    { at: [0, 2.08, 0], flat: true, name: "roofCrown", group: "roof" },
  );
  b.part(
    new THREE.ConeGeometry(0.14, 0.11, 8),
    TRIM,
    { at: [0, 2.205, 0], flat: true, name: "roofFinial", group: "roof" },
  );

  // Wooden balcony beneath the cap.
  b.part(
    new THREE.CylinderGeometry(0.58, 0.58, 0.035, 16),
    WOOD_LIGHT,
    { at: [0, 1.57, 0], flat: true, name: "balconyDeck", group: "balcony" },
  );
  b.part(
    new THREE.TorusGeometry(0.56, 0.025, 6, 16),
    WOOD,
    { at: [0, 1.68, 0], name: "balconyRail", group: "balcony" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(
      new THREE.CylinderGeometry(0.014, 0.014, 0.15, 6),
      WOOD,
      {
        at: [Math.sin(a) * 0.56, 1.625, Math.cos(a) * 0.56],
        flat: true,
        name: `balconyPost${i}`,
        group: "balcony",
      },
    );
  }

  // Central axle housing projecting toward the viewer.
  b.part(
    new THREE.CylinderGeometry(0.13, 0.13, 0.22, 10),
    WOOD,
    {
      at: [0, 1.38, 0.58],
      dir: [0, 0, 1],
      axis: "y",
      flat: true,
      name: "axleHousing",
      group: "sails",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.095, 0.095, 0.26, 12),
    TRIM,
    {
      at: [0, 1.38, 0.73],
      dir: [0, 0, 1],
      axis: "y",
      flat: true,
      name: "axleHub",
      group: "sails",
    },
  );

  // Four broad cream sails, each with a dark timber spine and cross braces.
  const center = new THREE.Vector3(0, 1.38, 0.88);
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI * 0.25 + i * Math.PI * 0.5;
    const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
    const tangent = new THREE.Vector3(-radial.y, radial.x, 0);
    const tip = center.clone().addScaledVector(radial, 0.72);

    // Main timber.
    b.rod(center, tip, 0.045, { color: WOOD, caps: "flat", name: `sailSpine${i}`, group: "sails" });

    // Tapered cream sail panel, slightly to one side of its spine.
    const root = center.clone().addScaledVector(radial, 0.12).addScaledVector(tangent, -0.11);
    const outline: [number, number][] = [
      [0, 0],
      [0.61, 0],
      [0.68, 0.11],
      [0.16, 0.17],
    ];
    b.extrude(outline, {
      at: root,
      x: radial,
      y: tangent,
      thickness: 0.025,
      bevel: 0.008,
      color: CREAM,
      name: `canvasSail${i}`,
      group: "sails",
    });

    // Warm wooden ribs across each canvas.
    for (const t of [0.27, 0.45, 0.61]) {
      const a = center.clone().addScaledVector(radial, t).addScaledVector(tangent, -0.105);
      const c = center.clone().addScaledVector(radial, t + 0.055).addScaledVector(tangent, 0.08);
      b.rod(a, c, 0.014, { color: WOOD_LIGHT, caps: "flat", name: `sailRib${i}_${t}`, group: "sails" });
    }

    // Red painted tip marker, a tiny cheerful accent on every sail.
    const marker = center.clone().addScaledVector(radial, 0.68).addScaledVector(tangent, 0.045);
    b.part(
      new THREE.BoxGeometry(0.055, 0.11, 0.028),
      RED,
      {
        at: marker,
        dir: [radial.x, radial.y, 0],
        axis: "y",
        rotation: [0, 0, 0],
        name: `sailTip${i}`,
        group: "sails",
      },
    );
  }

  // Hub cap and a bright golden pin.
  b.part(
    new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12),
    WOOD_LIGHT,
    {
      at: [0, 1.38, 1.04],
      dir: [0, 0, 1],
      axis: "y",
      flat: true,
      name: "hubCap",
      group: "sails",
    },
  );
  b.part(
    new THREE.SphereGeometry(0.045, 8, 6),
    TRIM,
    { at: [0, 1.38, 1.09], name: "hubPin", group: "sails" },
  );

  // A small painted sign beside the door.
  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect x="2" y="2" width="124" height="60" rx="9" fill="#f8df9e" stroke="#714331" stroke-width="5"/>
      <path d="M25 45 Q37 18 49 45 M79 45 Q91 18 103 45" fill="none" stroke="#c96055" stroke-width="7"/>
      <circle cx="39" cy="27" r="5" fill="#3e3040"/><circle cx="89" cy="27" r="5" fill="#3e3040"/>
    </svg>`,
    { size: 128 },
  );
  b.part(
    new THREE.BoxGeometry(0.25, 0.13, 0.025),
    "#ffffff",
    {
      at: [0.31, 0.55, 0.65],
      dir: [0, 0, 1],
      axis: "z",
      texture: signTexture,
      rotation: [0, 0, -12],
      name: "welcomeSign",
      group: "details",
    },
  );

  return b.root;
}
```