import * as THREE from "three";
import { createBuilder, type Builder, type Joint, spiral, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Tulip Mill",
  "description": "A stylized Dutch windmill in Animal Crossing proportions: a cream plaster tower on a stone plinth, a balcony gallery, a slate-blue onion cap with a tail-pole winch, four lattice sails, and tulips by the door."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  plaster: "#f2e4c0",
  plasterShade: "#d8c497",
  timber: "#8a5a36",
  timberDark: "#5f3d24",
  brick: "#b45a3c",
  brickDark: "#8c4330",
  roof: "#4e6072",
  roofDark: "#3a4a5a",
  white: "#faf6ec",
  glass: "#bfe3ea",
  gold: "#e5b23f",
  stone: "#9a958a",
  stoneDark: "#736e63",
  cloth: "#f7f3e6",
  rope: "#c8b489",
  door: "#6e442c",
  leafGreen: "#5fa04a",
  tulipStem: "#3f7d3a",
  tulipRed: "#e05555",
  tulipOrange: "#f0913c",
  flowerPink: "#ef8fb0",
  glow: "#ffd873",
};
const M = {
  towerTop: [0, 3.35, 0] as [number, number, number],
  galleryRing: [0, 2.45, 0] as [number, number, number],
  sailHub: [0, 3.95, 1.05] as [number, number, number],
  doorFront: [0, 0, 1.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // tower
  (() => {
function buildTower({ b, J, P, M }: any) {
  const bone = J.mill;
  const plaster = P.plaster;
  const plasterShade = P.plasterShade;
  const timber = P.timber;
  const timberDark = P.timberDark;
  const brick = P.brick;
  const brickDark = P.brickDark;
  const white = P.white;
  const glass = P.glass;
  const gold = P.gold;
  const stone = P.stone;
  const stoneDark = P.stoneDark;
  const door = P.door;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bevel = 0,
    name?: string,
  ) => {
    let g: THREE.BufferGeometry = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      const s = new THREE.Shape();
      const [w, h] = [size[0] / 2, size[1] / 2];
      s.moveTo(-w + bevel, -h);
      s.lineTo(w - bevel, -h);
      s.quadraticCurveTo(w, -h, w, -h + bevel);
      s.lineTo(w, h - bevel);
      s.quadraticCurveTo(w, h, w - bevel, h);
      s.lineTo(-w + bevel, h);
      s.quadraticCurveTo(-w, h, -w, h - bevel);
      s.lineTo(-w, -h + bevel);
      s.quadraticCurveTo(-w, -h, -w + bevel, -h);
      const ex = new THREE.ExtrudeGeometry(s, {
        depth: size[2],
        bevelEnabled: false,
      });
      ex.translate(0, 0, -size[2] / 2);
      g = ex;
      b.part(g, color, { at, bone, dir: [0, 0, 1], name });
    } else {
      b.part(g, color, { at, bone, name });
    }
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 12,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      bone,
      dir,
      name,
    });
  };

  const sphere = (
    scale: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) => {
    b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      bone,
      scale,
      name,
    });
  };

  const torus = (
    major: number,
    minor: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) => {
    b.part(new THREE.TorusGeometry(major, minor, 6, 20), color, {
      at,
      bone,
      dir,
      name,
    });
  };

  // Stone plinth: two offset courses of chunky blocks.
  const course = [
    [-1.08, -0.86, 0.42, 0.52],
    [-0.36, -0.96, 0.48, 0.55],
    [0.36, -0.96, 0.48, 0.55],
    [1.08, -0.86, 0.42, 0.52],
    [-1.08, 0.86, 0.42, 0.52],
    [-0.36, 0.96, 0.48, 0.55],
    [0.36, 0.96, 0.48, 0.55],
    [1.08, 0.86, 0.42, 0.52],
    [-1.18, -0.28, 0.48, 0.42],
    [-1.18, 0.32, 0.48, 0.42],
    [1.18, -0.28, 0.48, 0.42],
    [1.18, 0.32, 0.48, 0.42],
  ];

  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < course.length; i++) {
      const [x, z, w, d] = course[i];
      const off = row ? 0.045 : 0;
      const c = (i + row) % 4 === 0 ? stoneDark : stone;
      box(
        [w, 0.285, d],
        [x + off, 0.16 + row * 0.29, z],
        c,
        0.055,
        `plinthBlock${row}_${i}`,
      );
    }
  }

  // Dark inset mortar-like bands and chamfered cap.
  box([2.48, 0.035, 2.34], [0, 0.315, 0], stoneDark, 0.03, "mortarCourse");
  box([2.48, 0.035, 2.34], [0, 0.635, 0], stoneDark, 0.03, "plinthTopGap");
  box([2.3, 0.13, 2.18], [0, 0.69, 0], stone, 0.07, "plinthCoping");

  // Tapered plaster shaft, with a warm shaded skirt.
  b.lathe(
    [
      [0, 0.68],
      [1.06, 0.68],
      [1.04, 0.82],
      [0.98, 1.35],
      [0.9, 2.2],
      [0.8, 3.15],
      [0.73, 3.35],
      [0, 3.35],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 16,
      color: plaster,
      bone,
      name: "plasterShaft",
    },
  );

  // Broad low plaster shade band.
  b.lathe(
    [
      [0, 0.69],
      [1.065, 0.69],
      [1.045, 0.82],
      [1.015, 1.17],
      [0, 1.17],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 16,
      color: plasterShade,
      bone,
      name: "plasterShadeBand",
    },
  );

  // Terracotta base course.
  cyl(1.035, 0.13, [0, 0.75, 0], brick, 16, [0, 1, 0], "brickBaseRing");
  torus(0.985, 0.025, [0, 0.815, 0], brickDark, [0, 1, 0], "brickBaseMortar");

  // Front corner quoins, alternating colours.
  for (let row = 0; row < 7; row++) {
    const y = 0.9 + row * 0.32;
    const r = row % 2 ? brickDark : brick;
    const width = row % 2 ? 0.23 : 0.27;
    box([width, 0.22, 0.18], [-0.82 + row * 0.018, y, 0.82 - row * 0.03], r, 0.035, `quoinL${row}`);
    box([width, 0.22, 0.18], [0.82 - row * 0.018, y, 0.82 - row * 0.03], r, 0.035, `quoinR${row}`);
  }

  // Entrance: dark timber frame, rounded door and panel details.
  box([0.72, 1.15, 0.12], [0, 0.68, 1.015], timberDark, 0.06, "doorFrame");
  box([0.56, 0.98, 0.055], [0, 0.66, 1.09], door, 0.045, "archedDoor");
  sphere([0.28, 0.26, 0.035], [0, 1.25, 1.11], door, "doorArch");
  box([0.025, 0.78, 0.018], [-0.17, 0.67, 1.125], timberDark, 0.006, "doorStileL");
  box([0.025, 0.78, 0.018], [0.17, 0.67, 1.125], timberDark, 0.006, "doorStileR");
  box([0.48, 0.025, 0.018], [0, 0.67, 1.13], timberDark, 0.006, "doorRail");
  box([0.48, 0.025, 0.018], [0, 0.98, 1.13], timberDark, 0.006, "doorRailTop");
  torus(0.045, 0.009, [0.11, 0.72, 1.145], gold, [0, 0, 1], "doorRingHandle");

  // Brick voussoirs around the arch.
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (i / 8);
    const x = Math.cos(a) * 0.39;
    const y = 1.28 + Math.sin(a) * 0.32;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -a + Math.PI / 2);
    b.part(new THREE.BoxGeometry(0.16, 0.12, 0.16), i % 2 ? brickDark : brick, {
      at: [x, y, 1.08],
      bone,
      quat: q,
      name: `voussoir${i}`,
    });
  }

  box([0.82, 0.1, 0.34], [0, 0.08, 1.18], white, 0.035, "doorstep");

  // Front windows: round-topped assemblies.
  const frontWindow = (
    y: number,
    width: number,
    height: number,
    name: string,
  ) => {
    box([width + 0.16, height + 0.12, 0.075], [0, y, 0.78], white, 0.035, `${name}Frame`);
    box([width, height, 0.025], [0, y - 0.015, 0.825], glass, 0.015, `${name}Glass`);
    sphere([width / 2, width / 2, 0.025], [0, y + height / 2, 0.825], white, `${name}Arch`);
    sphere([width / 2 - 0.045, width / 2 - 0.045, 0.014], [0, y + height / 2, 0.86], glass, `${name}ArchGlass`);
    box([width + 0.2, 0.055, 0.11], [0, y - height / 2 - 0.07, 0.82], timberDark, 0.02, `${name}Sill`);
    box([0.025, height, 0.025], [-0.01, y, 0.85], timberDark, 0.004, `${name}Mullion`);
    box([width, 0.025, 0.025], [0, y, 0.85], timberDark, 0.004, `${name}Crossbar`);
  };

  frontWindow(2.0, 0.34, 0.38, "largeWindow");
  frontWindow(2.82, 0.25, 0.28, "smallWindow");

  // Flank windows, facing sideways.
  for (const s of [-1, 1]) {
    box([0.075, 0.34, 0.42], [s * 0.92, 1.62, 0], white, 0.025, `flankFrame${s}`);
    box([0.025, 0.25, 0.29], [s * 0.965, 1.62, 0], glass, 0.012, `flankGlass${s}`);
    box([0.025, 0.29, 0.025], [s * 0.985, 1.62, 0], timberDark, 0.004, `flankMullion${s}`);
    box([0.12, 0.045, 0.46], [s * 0.99, 1.42, 0], timberDark, 0.015, `flankSill${s}`);
  }

  // Eaves: plaster flare and shaded underside.
  b.lathe(
    [
      [0, 3.2],
      [0.76, 3.2],
      [0.84, 3.27],
      [0.82, 3.35],
      [0, 3.35],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 16,
      color: plaster,
      bone,
      name: "eaves",
    },
  );
  torus(0.76, 0.035, [0, 3.22, 0], plasterShade, [0, 1, 0], "eavesUnderside");
  torus(0.81, 0.035, [0, 3.34, 0], white, [0, 1, 0], "eavesTrim");

  // Small plaster accent blocks beside the upper rim.
  for (const s of [-1, 1]) {
    box([0.14, 0.16, 0.24], [s * 0.68, 3.25, 0.38], plasterShade, 0.025, `eaveAccent${s}`);
  }
}
    return buildTower;
  })(),
  // gallery
  (() => {
function buildGallery({ b, J, P, M }: Ctx) {
  const bone = J.mill ?? J.body;
  const timber = P.timber ?? "#8a5a36";
  const dark = P.timberDark ?? "#5f3d24";
  const white = P.white ?? "#faf6ec";
  const gold = P.gold ?? "#e5b23f";
  const pink = P.flowerPink ?? "#ef8fb0";
  const green = P.leafGreen ?? "#5fa04a";

  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    position: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(geometry, color, {
      bone,
      at: position,
      rotation,
      name: name ?? "gallery",
      group: "gallery",
    });

  // Dark shadow ring under the timber deck, followed by a warm annular-looking
  // walkway made from overlapping chunky radial planks.
  part(
    new THREE.CylinderGeometry(1.47, 1.47, 0.055, 32),
    dark,
    at(0, 2.445, 0),
    undefined,
    "galleryDeckShadow",
  );

  const plankCount = 18;
  for (let i = 0; i < plankCount; i++) {
    const a = (i / plankCount) * Math.PI * 2;
    const r = 1.135;
    part(
      new THREE.BoxGeometry(0.30, 0.09, 0.59),
      timber,
      at(Math.sin(a) * r, 2.50, Math.cos(a) * r),
      [0, a, 0],
      `galleryDeckPlank${i}`,
    );
    // Small dark end-grain cap on the outer edge gives the walkway a readable
    // segmented silhouette without making the deck too delicate.
    part(
      new THREE.BoxGeometry(0.305, 0.095, 0.035),
      dark,
      at(Math.sin(a) * 1.425, 2.50, Math.cos(a) * 1.425),
      [0, a, 0],
      `galleryDeckGap${i}`,
    );
  }

  // Eight stout curved-looking support brackets: each is a vertical post and
  // an angled arm, hugging the tapered tower beneath the gallery.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const inner = at(sa * 0.88, 2.18, ca * 0.88);
    const outer = at(sa * 1.18, 2.39, ca * 1.18);

    part(
      new THREE.CylinderGeometry(0.065, 0.085, 0.36, 8),
      dark,
      inner,
      undefined,
      `galleryBracketPost${i}`,
    );

    const dx = outer[0] - inner[0];
    const dy = outer[1] - inner[1];
    const dz = outer[2] - inner[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
    b.part(new THREE.CylinderGeometry(0.052, 0.075, len, 8), dark, {
      bone,
      at: inner,
      quat: q,
      name: `galleryBracketArm${i}`,
      group: "gallery",
    });
  }

  // Outer balustrade: twelve heavy posts with rounded caps.
  const postCount = 12;
  for (let i = 0; i < postCount; i++) {
    const a = (i / postCount) * Math.PI * 2;
    const x = Math.sin(a) * 1.40;
    const z = Math.cos(a) * 1.40;

    part(
      new THREE.CylinderGeometry(0.055, 0.075, 0.48, 8),
      timber,
      at(x, 2.735, z),
      undefined,
      `galleryPost${i}`,
    );
    part(
      new THREE.SphereGeometry(0.078, 8, 5),
      timber,
      at(x, 2.995, z),
      undefined,
      `galleryPostCap${i}`,
    );

    if (i % 3 === 0) {
      part(
        new THREE.SphereGeometry(0.052, 8, 6),
        gold,
        at(x, 3.075, z),
        undefined,
        `galleryGoldFinial${i}`,
      );
    }
  }

  // Continuous round rails, with a second darker underside line to emphasize
  // the friendly toy-like construction.
  part(
    new THREE.TorusGeometry(1.40, 0.052, 8, 32),
    timber,
    at(0, 2.985, 0),
    [0, 0, 0],
    "galleryTopRail",
  );
  part(
    new THREE.TorusGeometry(1.395, 0.034, 7, 32),
    dark,
    at(0, 2.775, 0),
    [0, 0, 0],
    "galleryMidRail",
  );

  // White balusters between the timber posts. They are intentionally short and
  // chunky, leaving clear openings rather than turning the gallery into a cage.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    part(
      new THREE.CylinderGeometry(0.025, 0.032, 0.30, 6),
      white,
      at(Math.sin(a) * 1.40, 2.835, Math.cos(a) * 1.40),
      undefined,
      `galleryWhiteBaluster${i}`,
    );
  }

  // Front window box, centered over the entrance (+Z). A dark inset below the
  // rim makes the white box read clearly against the cream tower.
  part(
    new THREE.BoxGeometry(0.72, 0.22, 0.28),
    white,
    at(0, 2.66, 1.43),
    undefined,
    "galleryWindowBox",
  );
  part(
    new THREE.BoxGeometry(0.76, 0.045, 0.33),
    dark,
    at(0, 2.78, 1.43),
    undefined,
    "galleryWindowBoxRim",
  );

  // Five simple flower clusters spilling over the front edge.
  const flowers = [
    [-0.27, 2.80, 1.57, pink],
    [-0.13, 2.84, 1.59, pink],
    [0.00, 2.81, 1.60, "#f0913c"],
    [0.15, 2.84, 1.58, pink],
    [0.28, 2.79, 1.56, "#f0913c"],
  ] as const;

  for (let i = 0; i < flowers.length; i++) {
    const [x, y, z, flowerColor] = flowers[i];
    part(
      new THREE.CylinderGeometry(0.018, 0.023, 0.18, 6),
      P.tulipStem ?? "#3f7d3a",
      at(x, y - 0.08, z - 0.045),
      [0.18 * Math.cos(i), 0, 0.18 * Math.sin(i)],
      `galleryFlowerStem${i}`,
    );
    part(
      new THREE.SphereGeometry(0.075, 8, 6),
      flowerColor,
      at(x, y, z),
      undefined,
      `galleryFlower${i}`,
    );
    part(
      new THREE.SphereGeometry(0.045, 7, 5),
      green,
      at(x - 0.045, y - 0.045, z - 0.015),
      [0, 0, -0.45],
      `galleryFlowerLeafL${i}`,
    );
    part(
      new THREE.SphereGeometry(0.045, 7, 5),
      green,
      at(x + 0.045, y - 0.055, z - 0.01),
      [0, 0, 0.45],
      `galleryFlowerLeafR${i}`,
    );
  }
}
    return buildGallery;
  })(),
  // cap
  (() => {
function buildCap({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const roof = P.roof;
  const roofDark = P.roofDark;
  const timber = P.timber;
  const timberDark = P.timberDark;
  const white = P.white;
  const glass = P.glass;
  const gold = P.gold;
  const rope = P.rope;
  const stone = P.stone;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone, at, ...extra });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 12,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      at,
      { dir, name: "capCylinder" },
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale?: [number, number, number],
  ) =>
    part(new THREE.SphereGeometry(radius, 10, 7), color, at, {
      scale,
      name: "capRoundDetail",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name = "capRod",
  ) => b.rod(a, c, radius, { color, bone, name, caps: "round" });

  // Four broad stepped tiers form the chunky onion dome.
  const dome = b.lathe(
    [
      [0, 0],
      [0.86, 0],
      [0.86, 0.11],
      [0.76, 0.15],
      [0.76, 0.29],
      [0.66, 0.34],
      [0.66, 0.49],
      [0.54, 0.55],
      [0.54, 0.69],
      [0.39, 0.76],
      [0.39, 0.91],
      [0.24, 0.99],
      [0.16, 1.10],
      [0, 1.18],
    ],
    {
      at: [0, 3.35, 0],
      axis: [0, 1, 0],
      segments: 16,
      color: roof,
      bone,
      name: "capOnionDome",
    },
  );

  // Dark lower lips make the individual slate courses read clearly.
  for (const y of [3.46, 3.69, 3.93, 4.14]) {
    cylinder(
      y < 3.6 ? 0.865 : y < 3.82 ? 0.765 : y < 4.05 ? 0.665 : 0.545,
      0.045,
      roofDark,
      [0, y, 0],
      [0, 1, 0],
      16,
    );
  }

  // Small chunky scallops under each shingle tier.
  const scallops = [
    [0.86, 3.46],
    [0.76, 3.69],
    [0.66, 3.93],
    [0.54, 4.14],
  ] as const;
  for (let row = 0; row < scallops.length; row++) {
    const [r, y] = scallops[row];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const rr = r + 0.006;
      sphere(
        0.045,
        row % 2 ? roofDark : roof,
        [rr * Math.sin(a), y - 0.018, rr * Math.cos(a)],
        [1, 0.55, 1],
      );
    }
  }

  // White trim where the plaster eaves meet the cap.
  cylinder(0.865, 0.075, white, [0, 3.345, 0], [0, 1, 0], 20);
  cylinder(0.79, 0.025, roofDark, [0, 3.39, 0], [0, 1, 0], 20);

  // Little attic window on the front of the dome.
  cylinder(0.145, 0.035, white, [0, 4.005, 0.63], [0, 0, 1], 12);
  cylinder(0.095, 0.042, glass, [0, 4.005, 0.653], [0, 0, 1], 12);
  rod([-0.095, 4.005, 0.68], [0.095, 4.005, 0.68], 0.012, timberDark, "capAtticMullion");
  rod([0, 3.91, 0.68], [0, 4.10, 0.68], 0.012, timberDark, "capAtticMullion");

  // Finial neck, ball, and gold rod.
  cylinder(0.055, 0.19, roofDark, [0, 4.42, 0], [0, 1, 0], 10);
  sphere(0.09, gold, [0, 4.53, 0]);
  cylinder(0.018, 0.29, gold, [0, 4.675, 0], [0, 1, 0], 8);

  // A simple friendly weather vane arrow, facing the viewer.
  b.extrude(
    [
      [-0.30, 0.00],
      [0.08, 0.00],
      [0.08, -0.07],
      [0.30, 0.00],
      [0.08, 0.07],
      [0.08, 0.015],
      [-0.30, 0.015],
    ],
    {
      at: [-0.0, 4.79, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color: white,
      bone,
      name: "capWeatherVaneArrow",
    },
  );
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.12, 0.16],
      [0.04, 0.12],
      [0, 0.22],
      [-0.04, 0.12],
      [-0.12, 0.16],
    ],
    {
      at: [0, 4.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: white,
      bone,
      name: "capWeatherVaneTail",
    },
  );

  // Front axle collar and bearing plate, aligned exactly with the sail hub.
  cylinder(0.235, 0.12, white, [0, 3.95, 0.72], [0, 0, 1], 16);
  cylinder(0.17, 0.14, roofDark, [0, 3.95, 0.80], [0, 0, 1], 14);
  cylinder(0.215, 0.035, gold, [0, 3.95, 0.875], [0, 0, 1], 16);
  cylinder(0.11, 0.05, white, [0, 3.95, 0.91], [0, 0, 1], 14);

  // Long rear staart pole, deliberately grounded behind the tower.
  rod([0, 3.60, -0.55], [0, 0.17, -2.00], 0.095, timber, "capTailPole");
  sphere(0.11, timberDark, [0, 0.13, -2.00], [1.15, 0.6, 1.15]);

  // Four ladder-like rungs across the tail pole.
  const rungTs = [0.22, 0.40, 0.58, 0.76];
  for (let i = 0; i < rungTs.length; i++) {
    const t = rungTs[i];
    const y = 0.17 + (3.60 - 0.17) * t;
    const z = -2.00 + (-0.55 + 2.00) * t;
    rod([-0.18, y, z], [0.18, y, z], 0.035, timberDark, "capTailRung");
    sphere(0.042, timber, [-0.19, y, z]);
    sphere(0.042, timber, [0.19, y, z]);
  }

  // Windlass drum on the lower pole, with rope ridges.
  cylinder(0.14, 0.34, timberDark, [0, 0.43, -1.58], [1, 0, 0], 12);
  cylinder(0.18, 0.035, timber, [-0.19, 0.43, -1.58], [1, 0, 0], 12);
  cylinder(0.18, 0.035, timber, [0.19, 0.43, -1.58], [1, 0, 0], 12);
  for (let i = 0; i < 5; i++) {
    const x = -0.13 + i * 0.065;
    b.part(
      new THREE.TorusGeometry(0.145, 0.012, 6, 12),
      rope,
      { bone, at: [x, 0.43, -1.58], dir: [1, 0, 0], name: "capRopeCoil" },
    );
  }

  // Crank handles on both sides of the windlass.
  rod([-0.24, 0.43, -1.58], [-0.24, 0.63, -1.58], 0.018, timberDark, "capCrank");
  rod([0.24, 0.43, -1.58], [0.24, 0.23, -1.58], 0.018, timberDark, "capCrank");
  sphere(0.045, gold, [-0.24, 0.65, -1.58]);
  sphere(0.045, gold, [0.24, 0.21, -1.58]);

  // Grounded A-frame supports for the tail pole and windlass.
  rod([-0.30, 0.05, -1.92], [-0.24, 0.68, -1.58], 0.06, timberDark, "capAFrame");
  rod([0.30, 0.05, -1.92], [0.24, 0.68, -1.58], 0.06, timberDark, "capAFrame");
  rod([-0.30, 0.05, -1.92], [0.30, 0.05, -1.92], 0.045, timber, "capAFrameBase");
  sphere(0.13, stone, [-0.30, 0.065, -1.92], [1.2, 0.35, 1.0]);
  sphere(0.13, stone, [0.30, 0.065, -1.92], [1.2, 0.35, 1.0]);

  // A short rope line from the winch toward the rear pole, for a readable mechanism.
  const ropePath = spiral(
    new THREE.Vector3(-0.16, 0.43, -1.58),
    new THREE.Vector3(-0.16, 0.43, -1.58).add(new THREE.Vector3(0.03, 0, 0)),
    new THREE.Vector3(0.32, 0, 0),
    { turns: 2, pitch: 0.16 },
  );
  b.sweep(ropePath, 0.009, { color: rope, bone, caps: "round", name: "capLooseRope" });
}
    return buildCap;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sailHub ?? J.mill;
  const hub = new THREE.Vector3(...(M.sailHub ?? [0, 3.95, 1.05]));
  const timber = P.timber ?? "#8a5a36";
  const dark = P.timberDark ?? "#5f3d24";
  const cloth = P.cloth ?? "#f7f3e6";
  const white = P.white ?? "#faf6ec";
  const gold = P.gold ?? "#e5b23f";

  const addBox = (
    size: [number, number, number],
    at: THREE.Vector3,
    color: string,
    dir: THREE.Vector3,
    lift = 0,
    name?: string,
  ) => {
    const p = at.clone().add(new THREE.Vector3(0, 0, lift));
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: p,
      dir,
      name,
      flat: true,
    });
  };

  const addCylinder = (
    radius: number,
    depth: number,
    at: THREE.Vector3,
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      bone,
      at,
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  // Central axle drum, projecting toward the viewer.
  addCylinder(0.17, 0.34, hub, dark, "sailsHubDrum");

  addCylinder(0.205, 0.035, hub.clone().add(new THREE.Vector3(0, 0, -0.185)), gold, "sailsHubBackBand");
  addCylinder(0.205, 0.035, hub.clone().add(new THREE.Vector3(0, 0, 0.185)), gold, "sailsHubFrontBand");

  const frontCap = b.part(
    new THREE.SphereGeometry(0.105, 10, 6),
    gold,
    {
      bone,
      at: hub.clone().add(new THREE.Vector3(0, 0, 0.225)),
      scale: [1, 1, 0.55],
      name: "sailsHubCap",
      flat: true,
    },
  );

  // Four identical lattice blades. Angle zero points straight upward.
  const bladeAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  for (let bi = 0; bi < bladeAngles.length; bi++) {
    const a = bladeAngles[bi];
    const radial = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
    const tangent = new THREE.Vector3(Math.cos(a), -Math.sin(a), 0);

    const start = 0.15;
    const end = 1.9;
    const length = end - start;
    const center = hub.clone().add(radial.clone().multiplyScalar((start + end) * 0.5));

    // Broad rounded-looking central spar.
    addBox([0.16, length, 0.07], center, timber, radial, 0, `sailsSpar${bi}`);

    // A faceted cap at each blade tip makes the ends read as chunky wood.
    const tip = hub.clone().add(radial.clone().multiplyScalar(end));
    b.part(new THREE.SphereGeometry(0.085, 8, 5), timber, {
      bone,
      at: tip,
      scale: [1, 1, 0.52],
      name: `sailsTip${bi}`,
      flat: true,
    });

    // Seven cross-slats, shortening slightly toward the outer end.
    for (let si = 0; si < 7; si++) {
      const r = 0.30 + si * 0.235;
      const halfWidth = 0.36 - si * 0.025;
      const slatCenter = hub.clone().add(radial.clone().multiplyScalar(r));
      addBox(
        [halfWidth * 2, 0.045, 0.065],
        slatCenter,
        si % 2 === 0 ? timber : dark,
        tangent,
        -0.005,
        `sailsSlat${bi}_${si}`,
      );
    }

    // Three cloth panels, leaving the final lattice bay open near the tip.
    const panelRadii = [0.43, 0.78, 1.13];
    for (let pi = 0; pi < panelRadii.length; pi++) {
      const r = panelRadii[pi];
      const panelCenter = hub.clone().add(radial.clone().multiplyScalar(r));
      const panelWidth = 0.54 - pi * 0.035;
      addBox(
        [panelWidth, 0.205, 0.045],
        panelCenter,
        cloth,
        radial,
        0.047,
        `sailsCloth${bi}_${pi}`,
      );

      // Four visible tie knots at each panel corner.
      for (const side of [-1, 1]) {
        for (const along of [-1, 1]) {
          const knot = panelCenter
            .clone()
            .add(tangent.clone().multiplyScalar(side * panelWidth * 0.5))
            .add(radial.clone().multiplyScalar(along * 0.092))
            .add(new THREE.Vector3(0, 0, 0.075));
          b.part(new THREE.SphereGeometry(0.027, 6, 4), white, {
            bone,
            at: knot,
            name: `sailsKnot${bi}_${pi}_${side}_${along}`,
            flat: true,
          });
        }
      }
    }
  }
}
    return buildSails;
  })(),
  // dooryard
  (() => {
function buildDooryard({ b, J, P, M }: Ctx) {
  const bone = J.mill;
  const stone = P.stone;
  const stoneDark = P.stoneDark;
  const timber = P.timber;
  const timberDark = P.timberDark;
  const white = P.white;
  const glass = P.glass;
  const gold = P.gold;
  const stem = P.tulipStem;
  const leaf = P.leafGreen;
  const red = P.tulipRed;
  const orange = P.tulipOrange;
  const pink = P.flowerPink;
  const warm = P.glow;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone, at, ...extra });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(...size), color, at, extra);

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
  ) =>
    part(new THREE.SphereGeometry(radius, 8, 6), color, at, {
      scale,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    radial = 8,
    extra: Record<string, unknown> = {},
  ) =>
    part(new THREE.CylinderGeometry(radius, radius, height, radial), color, at, extra);

  const apronX = [-0.62, -0.2, 0.22, 0.64];
  const apronZ = [1.16, 1.38, 1.6, 1.78];

  // Chunky cobble apron, with a slightly irregular, storybook paving pattern.
  for (let iz = 0; iz < apronZ.length; iz++) {
    for (let ix = 0; ix < apronX.length; ix++) {
      const stagger = iz % 2 ? 0.055 : -0.02;
      const x = apronX[ix] + stagger;
      const z = apronZ[iz];
      const dark = (ix + iz * 2) % 3 === 0;
      sphere(0.13, dark ? stoneDark : stone, [x, 0.105, z], [1.38, 0.34, 0.82]);
    }
  }

  // Low terracotta-colored edge stones make the apron meet the tower clearly.
  for (let i = 0; i < 5; i++) {
    sphere(0.115, stoneDark, [-0.78 + i * 0.39, 0.105, 1.07], [1.35, 0.3, 0.7]);
  }

  // Lantern post at the right side of the dooryard.
  const postX = 0.75;
  const postZ = 1.56;
  cylinder(0.055, 0.72, timber, [postX, 0.38, postZ], 8);
  box([0.2, 0.06, 0.2], timberDark, [postX, 0.045, postZ]);

  // Small curved-looking arm and lantern roof.
  box([0.22, 0.055, 0.055], timber, [postX, 0.76, postZ + 0.035]);
  box([0.055, 0.1, 0.055], timber, [postX - 0.085, 0.72, postZ + 0.035]);

  // Lantern body: dark outline, white corner frame, blue glass panes.
  box([0.24, 0.28, 0.2], timberDark, [postX, 0.88, postZ]);
  box([0.18, 0.2, 0.012], glass, [postX, 0.88, postZ + 0.106]);
  box([0.012, 0.2, 0.23], white, [postX - 0.105, 0.88, postZ]);
  box([0.012, 0.2, 0.23], white, [postX + 0.105, 0.88, postZ]);
  box([0.22, 0.025, 0.025], white, [postX, 0.78, postZ + 0.115]);
  box([0.22, 0.025, 0.025], white, [postX, 0.98, postZ + 0.115]);
  box([0.18, 0.2, 0.012], glass, [postX, 0.88, postZ - 0.106]);
  cylinder(0.16, 0.045, gold, [postX, 1.045, postZ], 8);
  const lanternLight = sphere(0.07, warm, [postX, 0.88, postZ + 0.12], [0.7, 1.15, 0.35]);
  glow(lanternLight, 1.8);

  // Tulip construction: stems, two angular leaves, and a faceted cup of petals.
  const makeTulip = (
    x: number,
    z: number,
    flowerColor: string,
    lean: number,
    size = 1,
  ) => {
    const yStem = 0.22 * size;
    cylinder(0.018 * size, 0.42 * size, stem, [x, yStem, z], 6, {
      rotation: [0, 0, lean],
    });

    const leafA = sphere(0.065 * size, leaf, [x - 0.045 * size, 0.22 * size, z + 0.01], [
      0.42,
      0.95,
      2.1,
    ]);
    leafA.mesh.rotation.z = -0.62 + lean;
    const leafB = sphere(0.06 * size, leaf, [x + 0.05 * size, 0.28 * size, z + 0.005], [
      0.38,
      0.9,
      1.9,
    ]);
    leafB.mesh.rotation.z = 0.7 + lean;

    const cup = part(
      new THREE.ConeGeometry(0.105 * size, 0.17 * size, 6, 1, false),
      flowerColor,
      [x, 0.49 * size, z],
      { rotation: [0, 0, lean * 0.45] },
    );
    sphere(0.092 * size, flowerColor, [x, 0.57 * size, z], [1, 0.65, 1]);
    sphere(0.035 * size, gold, [x, 0.615 * size, z + 0.005], [1, 0.5, 1]);
    return cup;
  };

  // Three tulips on the left, two on the right, all kept inside the apron footprint.
  makeTulip(-0.92, 1.34, red, -0.12, 0.82);
  makeTulip(-0.68, 1.55, orange, 0.08, 0.94);
  makeTulip(-0.92, 1.72, pink, -0.16, 0.76);
  makeTulip(0.94, 1.34, orange, 0.12, 0.85);
  makeTulip(0.98, 1.62, red, -0.08, 0.9);

  // A compact leafy bush tucked against the left front corner of the plinth.
  for (const [x, y, z, sx, sy, sz] of [
    [-1.12, 0.16, 1.08, 0.34, 0.7, 0.48],
    [-0.98, 0.21, 1.05, 0.4, 0.8, 0.42],
    [-1.24, 0.2, 1.18, 0.3, 0.65, 0.38],
    [-1.03, 0.3, 1.18, 0.28, 0.7, 0.34],
  ] as [number, number, number, number, number, number][]) {
    sphere(0.16, leaf, [x, y, z], [sx, sy, sz]);
  }

  // A tiny gold nail on the doorstep gives the entry scene a finished focal detail.
  sphere(0.025, gold, [0.48, 0.17, 1.08], [1, 0.35, 1]);
}
    return buildDooryard;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });
  const J: Record<string, Joint> = {};
  J["mill"] = b.joint("mill", { at: [0,1.7,0], dir: [0,1,0], role: "spine" });
  J["sailHub"] = b.joint("sailHub", { parent: J["mill"], at: [0,3.95,1.05], dir: [0,0,1], role: "hinge", group: "sails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
