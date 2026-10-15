import * as THREE from "three";
import { createBuilder, frame, rng, lerp } from "../../../../src/index";
import {
  pixelTexture,
  tileBox,
  cellPaint,
  bayer,
} from "../../../../kits/pixel";
import type { PixelGrid } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "BYTE CRUSHER",
  description:
    "A pixel-art monster pickup: gigantic knobbly tyres, cyan paint, acid-yellow graphics, orange suspension, and illuminated voxel headlights on a dirt-arena display.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "BYTE CRUSHER", paintSize: 1024 });
  const random = rng(8042);

  const C = {
    ink: "#101926",
    black: "#13191e",
    rubber: "#20282e",
    rubberHi: "#354049",
    steel: "#657784",
    silver: "#b6cbd1",
    white: "#ebfff0",
    cyan: "#13bdca",
    cyanHi: "#75eeeb",
    cyanDark: "#087183",
    yellow: "#daff43",
    yellowDark: "#87ae26",
    orange: "#ff703b",
    orangeDark: "#a73629",
    dirt: "#846146",
    dirtDark: "#4e3e34",
  };

  // Tiny bitmap lettering is drawn into the same pixel grid as the graphics.
  const FONT: Record<string, string[]> = {
    A: ["01110", "11011", "11011", "11111", "11011", "11011", "11011"],
    B: ["11110", "11011", "11011", "11110", "11011", "11011", "11110"],
    C: ["01111", "11000", "11000", "11000", "11000", "11000", "01111"],
    E: ["11111", "11000", "11000", "11110", "11000", "11000", "11111"],
    H: ["11011", "11011", "11011", "11111", "11011", "11011", "11011"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    R: ["11110", "11011", "11011", "11110", "11100", "11010", "11011"],
    S: ["01111", "11000", "11000", "01110", "00011", "00011", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["11011", "11011", "11011", "11011", "11011", "11011", "01110"],
    Y: ["11011", "11011", "01010", "00100", "00100", "00100", "00100"],
    "8": ["01110", "11011", "11011", "01110", "11011", "11011", "01110"],
    "0": ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    "4": ["11011", "11011", "11011", "11111", "00011", "00011", "00011"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  function text(
    g: PixelGrid,
    word: string,
    x: number,
    y: number,
    color: string,
    scale = 1,
  ) {
    [...word].forEach((letter, i) => {
      const rows = FONT[letter] ?? FONT[" "];
      rows.forEach((row, yy) => {
        [...row].forEach((v, xx) => {
          if (v === "1") {
            for (let sy = 0; sy < scale; sy++)
              for (let sx = 0; sx < scale; sx++)
                g.set(
                  x + (i * 6 + xx) * scale + sx,
                  y + yy * scale + sy,
                  color,
                );
          }
        });
      });
    });
  }

  const BODY = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (y === 0 || x === 0) return C.cyanDark;
      if (y === 1 || x === 1) return C.cyanHi;
      if (y > 27) return "#0794a5";
      if ((x * 13 + y * 7) % 73 === 0) return "#4ed6d8";
      return C.cyan;
    });
    for (const [x, y] of [[5, 7], [25, 7], [5, 25], [25, 25]]) {
      g.set(x, y, C.ink);
      g.set(x + 1, y, C.silver);
    }
  });

  const RUBBER = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0 || x > 29 || y > 29) return "#11171c";
      if (x === 2 || y === 2) return "#3d4850";
      return (x * 17 + y * 11) % 29 === 0 ? "#354047" : "#242d33";
    });
    for (let y = 7; y < 27; y += 7)
      for (let x = 5; x < 25; x++) g.set(x, y, "#151d23");
  });

  const GLASS = pixelTexture(48, 20, (g) => {
    g.fill((_x, y) => y < 3 ? "#102b40" : y < 13 ? "#153e56" : "#21566a");
    for (let y = 2; y < 17; y++) {
      const start = 4 + Math.floor(y / 2);
      for (let x = start; x < start + 5; x++) g.set(x, y, "#81dce2");
      for (let x = start + 7; x < start + 9; x++) g.set(x, y, "#3f91a6");
    }
    for (let x = 2; x < 46; x++) g.set(x, 18, "#427d8b");
    g.fill((x, y) => x === 0 || x === 47 || y === 0 || y === 19 ? C.ink : undefined);
  });

  const LIVERY = pixelTexture(80, 32, (g) => {
    g.fill((_x, y) => y > 26 ? C.cyanDark : C.cyan);
    // A broad, stepped lightning bolt behind the title.
    for (let y = 0; y < 32; y++) {
      const start = 53 - Math.floor(y / 5) * 3;
      for (let x = start; x < start + 16; x++) g.set(x, y, C.yellow);
    }
    for (let y = 1; y < 31; y++)
      for (let x = 1; x < 8; x++)
        if ((Math.floor(x / 3) + Math.floor(y / 3)) % 2 === 0)
          g.set(x, y, C.white);
        else g.set(x, y, C.ink);
    text(g, "BYTE", 14, 4, C.ink, 2);
    text(g, "BYTE", 13, 3, C.white, 2);
    text(g, "CRUSHER", 13, 22, C.ink);
    for (let x = 12; x < 76; x++) g.set(x, 31, C.yellow);
  });

  const SKULL = pixelTexture(32, 32, (g) => {
    for (let y = 4; y < 28; y++) {
      const inset = y < 8 ? 8 - y : y > 22 ? y - 22 : 0;
      for (let x = 5 + inset; x < 27 - inset; x++)
        g.set(x, y, C.ink);
    }
    for (let y = 7; y < 24; y++)
      for (let x = 8; x < 24; x++) g.set(x, y, C.yellow);
    for (let y = 11; y < 16; y++) {
      for (let x = 9; x < 14; x++) g.set(x, y, C.ink);
      for (let x = 18; x < 23; x++) g.set(x, y, C.ink);
    }
    for (let y = 12; y < 14; y++) {
      g.set(11, y, C.orange);
      g.set(20, y, C.orange);
    }
    for (let y = 17; y < 20; y++) {
      g.set(15, y, C.ink);
      g.set(16, y, C.ink);
    }
    for (let x = 9; x < 24; x += 4)
      for (let y = 22; y < 27; y++) {
        g.set(x, y, C.yellow);
        g.set(x + 1, y, C.yellow);
      }
    // Little pixel sparks.
    for (const [x, y] of [[2, 8], [28, 4], [3, 25], [29, 23]]) {
      g.set(x, y, C.white);
      g.set(x + 1, y, C.white);
      g.set(x, y + 1, C.yellow);
    }
  });

  const GRILLE = pixelTexture(48, 16, (g) => {
    g.fill((x, y) => {
      if (x === 0 || x === 47 || y === 0 || y === 15) return C.silver;
      if (y % 4 === 1) return "#627580";
      if (y % 4 === 2) return "#263d48";
      return C.ink;
    });
    for (let x = 20; x < 28; x++)
      for (let y = 4; y < 12; y++) g.set(x, y, C.yellow);
    for (let y = 6; y < 10; y++) {
      g.set(22, y, C.ink);
      g.set(25, y, C.ink);
    }
  });

  const LAMP = pixelTexture(16, 8, (g) => {
    g.fill((x, y) => {
      if (x === 0 || x === 15 || y === 0 || y === 7) return "#554531";
      if (x === 7 || x === 8) return "#ffb53b";
      if (y < 3) return "#ffffdc";
      return (x + y) % 3 === 0 ? "#ffe481" : "#fff4b8";
    });
  });

  const SIDEWALL = pixelTexture(64, 64, (g) => {
    g.fill((x, y) => {
      const dx = x - 31.5, dy = y - 31.5;
      const r = Math.hypot(dx, dy);
      if (r > 31.5) return "";
      if (r > 29) return "#11181e";
      if (r > 27) return "#3a454d";
      if (r > 23) return "#202a32";
      if (r > 22) return "#4a565f";
      if (r > 20) return "#19222a";
      if (r > 18) return C.silver;
      if (r > 16) return "#40535f";
      if (r < 7) return C.cyan;
      const a = Math.atan2(dy, dx);
      const sector = ((a / (Math.PI * 2) * 8 + 8) % 1);
      return sector < 0.43 ? "#9bafb8" : "#24323c";
    });
    for (let x = 20; x < 44; x++) {
      if (x % 3 !== 0) {
        g.set(x, 6, C.white);
        g.set(x, 7, C.white);
        g.set(x, 55, "#748189");
      }
    }
    text(g, "8", 29, 9, C.white);
  });

  const BED = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (x % 6 === 0) return "#101c25";
      if (x % 6 === 1) return "#617884";
      return y % 11 === 0 ? "#344a55" : "#263b47";
    });
  });

  const HAZARD = pixelTexture(32, 16, (g) => {
    g.fill((x, y) => Math.floor((x + y) / 5) % 2 ? C.yellow : C.ink);
    for (let x = 0; x < 32; x++) {
      g.set(x, 0, "#e7f893");
      g.set(x, 15, "#53612a");
    }
  });

  const DIRT = pixelTexture(64, 64, (g) => {
    const shades = ["#76543c", "#886248", "#977151", "#a8805b", "#6b503c"];
    g.fill((x, y) => {
      const band = Math.floor(x / 5);
      if (band === 3 || band === 9) {
        if ((y + Math.floor(x / 2)) % 7 < 3) return "#514237";
      }
      return shades[Math.floor(random() * shades.length)];
    });
  });

  const PLATE = pixelTexture(48, 12, (g) => {
    g.fill((x, y) =>
      x === 0 || x === 47 || y === 0 || y === 11 ? C.silver : C.ink);
    text(g, "8 BIT", 9, 3, C.yellow);
  });

  const tyrePaint = cellPaint(0.065, (c) => {
    const colors = ["#151e25", "#202a31", "#2c363d", "#354047"];
    return c.pick(colors, 0.25 + c.random(11) * 0.35 + 0.16 * c.n.y);
  });

  // Skeleton first. The four wheel axles remain independently animatable.
  const chassis = b.joint("chassis", { at: [0, 1.95, 0], role: "spine" });
  const wheels: {
    side: number;
    z: number;
    name: string;
    bone: ReturnType<typeof b.joint>;
  }[] = [];

  for (const z of [1.65, -1.65])
    for (const side of [1, -1]) {
      const suffix = `${z > 0 ? "F" : "B"}${side > 0 ? "L" : "R"}`;
      const steer = b.joint(`steering${suffix}`, {
        parent: chassis,
        at: [side * 1.65, 1.30, z],
        dir: [0, 1, 0],
        role: "hinge",
      });
      const axle = b.joint(`wheel${suffix}`, {
        parent: steer,
        at: steer,
        dir: [side, 0, 0],
        role: "hinge",
      });
      wheels.push({ side, z, name: suffix, bone: axle });
    }

  function box(
    name: string,
    at: number[],
    size: number[],
    color: string,
    bone = chassis,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, bone, rotation,
    });
  }

  function tiled(
    name: string,
    at: number[],
    size: [number, number, number],
    texture: THREE.Texture,
    texel: number,
    bone = chassis,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(tileBox(size, texture, texel), "#ffffff", {
      name, at, bone, rotation, texture,
    });
  }

  function panel(
    name: string,
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    dir: number[] = [0, 0, 1],
    bone = chassis,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      name, at, bone, texture, dir, axis: "z", up: [0, 1, 0],
    });
  }

  // Low dirt-arena plinth: its whole top is only a few centimetres below the tyres.
  tiled("arenaDirt", [0, 0.08, 0], [6.0, 0.16, 6.4], DIRT, 0.10);
  box("arenaDarkFoot", [0, 0.035, 0], [5.96, 0.07, 6.36], "#342d2c");
  box("arenaFrontLip", [0, 0.105, 3.19], [5.96, 0.11, 0.035], C.dirtDark);
  panel("displayTitle", [0, 0.105, 3.211], 1.04, 0.13, PLATE);

  // A handful of square gravel chips, not a competing secondary subject.
  for (let i = 0; i < 25; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (2.48 + random() * 0.35);
    const z = -2.85 + random() * 5.65;
    const w = 0.06 + random() * 0.12;
    box(`gravel${i}`, [x, 0.16 + w * 0.22, z],
      [w, w * 0.44, w * 0.8],
      i % 3 ? "#aa825e" : "#584839",
      chassis, [0, Math.floor(random() * 4) * 90, 0]);
  }

  // Ladder frame, exposed axles and orange suspension.
  for (const side of [1, -1]) {
    box(`frameRail${side}`, [side * 0.66, 1.94, 0], [0.19, 0.27, 4.50], C.ink);
    box(`frameRailHighlight${side}`, [side * 0.767, 2.00, 0],
      [0.018, 0.045, 4.30], C.steel);
    box(`rockSlider${side}`, [side * 1.13, 2.15, -0.03],
      [0.16, 0.12, 1.20], C.ink);
    tiled(`step${side}`, [side * 1.24, 2.11, -0.03],
      [0.35, 0.09, 0.82], BED, 0.045);
  }

  for (const z of [-1.65, 0, 1.65]) {
    box(`frameCrossmember${z}`, [0, 1.94, z], [1.55, 0.17, 0.18], C.steel);
  }
  box("engineBlock", [0, 2.12, 1.05], [0.82, 0.48, 0.90], "#4a616a");
  box("oilPan", [0, 1.80, 1.05], [0.65, 0.23, 0.70], C.ink);

  for (const z of [-1.65, 1.65]) {
    b.rod([-1.66, 1.30, z], [1.66, 1.30, z], 0.13, {
      color: C.ink, bone: chassis, sides: 8,
    });
    b.part(new THREE.OctahedronGeometry(0.31, 0), C.steel, {
      name: `differential${z}`, at: [0, 1.30, z], bone: chassis,
      scale: [1.2, 0.87, 1],
    });
    box(`diffCover${z}`, [0, 1.30, z + 0.21], [0.31, 0.29, 0.10], C.orange);
    for (const side of [1, -1]) {
      const lower = [side * 1.13, 1.32, z];
      const upper = [side * 0.76, 2.23, z + (z > 0 ? 0.20 : -0.20)];
      b.rod(lower, upper, 0.062, { color: C.silver, bone: chassis, sides: 6 });
      const direction = new THREE.Vector3(
        upper[0] - lower[0], upper[1] - lower[1], upper[2] - lower[2],
      );
      for (let j = 0; j < 6; j++) {
        b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.045, 8), C.orange, {
          name: `spring${z}_${side}_${j}`,
          at: lerp(lower, upper, 0.21 + j * 0.105),
          dir: direction, bone: chassis,
        });
      }
      for (const p of [lower, upper]) {
        box("shockMount", p, [0.22, 0.13, 0.21], C.orangeDark);
      }
      b.rod(
        [side * 0.50, 1.98, z > 0 ? 0.50 : -0.50],
        [side * 1.12, 1.28, z],
        0.065, { color: C.orange, bone: chassis, sides: 6 },
      );
    }
  }
  b.rod([0, 1.48, -1.50], [0, 1.84, 0.55], 0.075, {
    color: C.silver, bone: chassis, sides: 6,
  });

  // Four enormous, faceted tyres. Two staggered rows of individual tread bricks.
  for (const wheel of wheels) {
    const { side, z, name, bone } = wheel;
    const x = side * 1.65;
    b.part(new THREE.CylinderGeometry(1.025, 1.025, 0.82, 20, 1), tyrePaint, {
      name: `tyre${name}`, at: [x, 1.30, z], bone, dir: [1, 0, 0],
    });

    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 18; j++) {
        const deg = j * 20 + (row ? 7 : -7);
        const a = deg * Math.PI / 180;
        tiled(
          `tread${name}_${row}_${j}`,
          [x + (row ? 0.215 : -0.215),
            1.30 + Math.cos(a) * 1.035,
            z + Math.sin(a) * 1.035],
          [0.43, 0.18, 0.34],
          RUBBER, 0.033, bone, [deg, 0, 0],
        );
      }
    }

    for (const face of [-1, 1]) {
      const faceX = x + face * 0.416;
      b.part(new THREE.CircleGeometry(1.012, 32), "#ffffff", {
        name: `sidewall${name}_${face}`,
        at: [faceX, 1.30, z], bone, texture: SIDEWALL,
        dir: [face, 0, 0], axis: "z", up: [0, 1, 0],
      });
    }

    const outerX = x + side * 0.443;
    b.part(new THREE.CylinderGeometry(0.23, 0.27, 0.12, 8), C.cyanDark, {
      name: `hub${name}`, at: [outerX, 1.30, z], bone, dir: [side, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.025, 8), C.cyanHi, {
      name: `hubCap${name}`, at: [outerX + side * 0.070, 1.30, z],
      bone, dir: [side, 0, 0],
    });
    b.ring(frame([outerX, 1.30, z], [side, 0, 0]), {
      count: 8, radius: 0.40,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.034, 6), C.yellow, {
        name: `wheelBolt${name}`, at: bolt, dir: [side, 0, 0], bone,
      });
    });
    box(`valve${name}`, [outerX, 1.84, z + 0.17],
      [0.05, 0.085, 0.05], C.silver, bone);
  }

  // Pickup body: a very simple, strongly squared silhouette.
  tiled("bodySill", [0, 2.36, 0], [2.17, 0.28, 4.62], BODY, 0.075);
  tiled("cab", [0, 3.105, 0.12], [2.20, 1.22, 1.96], BODY, 0.062);
  tiled("cabRoof", [0, 3.76, 0.10], [2.36, 0.17, 2.10], BODY, 0.065);
  box("roofHighlight", [0, 3.849, 0.12], [2.20, 0.018, 1.94], C.cyanHi);

  tiled("hood", [0, 2.70, 1.73], [2.18, 0.38, 1.28], BODY, 0.068);
  box("hoodFrontShadow", [0, 2.53, 2.38], [2.12, 0.055, 0.035], C.cyanDark);
  box("hoodRaisedCenter", [0, 2.916, 1.71], [0.81, 0.08, 1.02], C.cyanDark);
  panel("hoodMonster", [0, 2.962, 1.73], 0.73, 0.88, SKULL, [0, 1, 0]);
  for (const side of [1, -1]) {
    box(`hoodStripe${side}`, [side * 0.78, 2.896, 1.74],
      [0.13, 0.016, 1.20], C.yellow);
    for (let j = 0; j < 3; j++) {
      box(`hoodVent${side}_${j}`, [side * 0.51, 2.90, 1.37 + j * 0.14],
        [0.15, 0.022, 0.065], C.ink);
    }
  }

  // Dark glass is kept unobstructed, with pixel reflections and solid window seals.
  box("windshieldRubber", [0, 3.35, 1.113], [2.05, 0.73, 0.052], C.ink);
  panel("windshield", [0, 3.35, 1.143], 1.93, 0.63, GLASS);
  box("windshieldCenter", [0, 3.35, 1.153], [0.045, 0.65, 0.025], C.cyanDark);
  for (const side of [1, -1]) {
    box(`wiper${side}`, [side * 0.49, 3.10, 1.174],
      [0.49, 0.035, 0.028], C.ink, chassis, [0, 0, side * 9]);

    box(`windowSeal${side}`, [side * 1.112, 3.35, 0.10],
      [0.045, 0.73, 1.74], C.ink);
    panel(`sideGlass${side}`, [side * 1.14, 3.35, 0.10],
      1.62, 0.63, GLASS, [side, 0, 0]);
    box(`windowPillar${side}`, [side * 1.153, 3.35, -0.38],
      [0.032, 0.69, 0.065], C.cyanDark);

    panel(`doorGraphic${side}`, [side * 1.115, 2.80, 0.08],
      1.62, 0.54, LIVERY, [side, 0, 0]);
    box(`doorHandleWell${side}`, [side * 1.129, 3.031, -0.53],
      [0.045, 0.095, 0.24], C.cyanDark);
    box(`doorHandle${side}`, [side * 1.164, 3.041, -0.53],
      [0.055, 0.035, 0.18], C.silver);
    box(`doorSeam${side}`, [side * 1.119, 2.79, -0.80],
      [0.012, 0.50, 0.022], C.cyanDark);

    b.rod([side * 1.11, 3.18, 0.86], [side * 1.43, 3.18, 0.91],
      0.045, { color: C.ink, bone: chassis, section: "box" });
    box(`mirrorHousing${side}`, [side * 1.44, 3.24, 0.91],
      [0.15, 0.28, 0.25], C.ink);
    panel(`mirrorGlass${side}`, [side * 1.44, 3.24, 0.778],
      0.105, 0.20, GLASS, [0, 0, -1]);

    // Squared fender eyebrows emphasize the monster-truck stance.
    for (const z of [-1.65, 1.65]) {
      box(`fenderDark${side}_${z}`, [side * 1.18, 2.49, z],
        [0.46, 0.19, 2.08], C.ink);
      tiled(`fenderPaint${side}_${z}`, [side * 1.18, 2.60, z],
        [0.43, 0.09, 1.96], BODY, 0.060);
      box(`fenderStripe${side}_${z}`, [side * 1.402, 2.59, z],
        [0.018, 0.065, 1.87], C.yellow);
    }
  }

  // Open cargo bed, with ribs, chunky rails, and a contrasting rear gate.
  tiled("bedFloor", [0, 2.48, -1.66], [1.92, 0.10, 1.38], BED, 0.055);
  for (const side of [1, -1]) {
    tiled(`bedWall${side}`, [side * 1.02, 2.73, -1.65],
      [0.18, 0.48, 1.48], BODY, 0.060);
    box(`bedRail${side}`, [side * 1.02, 2.99, -1.66],
      [0.22, 0.09, 1.56], C.ink);
    box(`bedRailTop${side}`, [side * 1.02, 3.042, -1.66],
      [0.16, 0.012, 1.46], C.cyanHi);
  }
  tiled("tailgate", [0, 2.73, -2.39], [2.13, 0.49, 0.16], BODY, 0.060);
  panel("tailgateBrand", [0, 2.75, -2.478], 1.36, 0.38, LIVERY, [0, 0, -1]);
  box("tailgateHandle", [0, 2.95, -2.487], [0.27, 0.055, 0.035], C.ink);

  // Roll cage inside the bed. All bars are square section, not smooth tubes.
  for (const side of [1, -1]) {
    b.rod([side * 0.84, 2.52, -1.10], [side * 0.84, 3.57, -1.10],
      0.075, { color: C.orange, bone: chassis, section: "box" });
    b.rod([side * 0.84, 3.56, -1.10], [side * 0.84, 2.55, -2.10],
      0.065, { color: C.orangeDark, bone: chassis, section: "box" });
  }
  box("rollCageCrossbar", [0, 3.56, -1.10], [1.81, 0.15, 0.15], C.orange);

  // Twin squared exhaust stacks: dark openings are actual separate inset pieces.
  for (const side of [1, -1]) {
    box(`exhaust${side}`, [side * 0.99, 3.35, -1.12],
      [0.16, 1.17, 0.18], C.steel);
    box(`exhaustEdge${side}`, [side * 1.077, 3.35, -1.12],
      [0.018, 1.13, 0.15], C.silver);
    box(`exhaustBand${side}`, [side * 0.99, 3.06, -1.12],
      [0.19, 0.14, 0.21], C.ink);
    box(`exhaustRim${side}`, [side * 0.99, 3.96, -1.12],
      [0.22, 0.075, 0.24], C.silver);
    box(`exhaustOpening${side}`, [side * 0.99, 4.001, -1.12],
      [0.13, 0.012, 0.15], C.ink);
  }

  // Front face, deep bumper, and readable, warm pixel lamps.
  box("frontFascia", [0, 2.57, 2.405], [2.22, 0.40, 0.16], C.cyanDark);
  panel("radiatorGrille", [0, 2.58, 2.494], 1.25, 0.31, GRILLE);
  for (const side of [1, -1]) {
    box(`headlightBezel${side}`, [side * 0.88, 2.62, 2.48],
      [0.48, 0.31, 0.09], C.ink);
    glow(panel(`headlamp${side}`, [side * 0.88, 2.62, 2.532],
      0.39, 0.22, LAMP), 1.05);
    glow(box(`indicator${side}`, [side * 1.005, 2.40, 2.51],
      [0.19, 0.075, 0.025], "#ffae38"), 0.7);
  }

  box("frontBumper", [0, 2.19, 2.56], [2.53, 0.24, 0.31], C.ink);
  tiled("frontHazardStrip", [0, 2.235, 2.724],
    [1.61, 0.11, 0.025], HAZARD, 0.050);
  box("bumperSilverTop", [0, 2.322, 2.57], [2.47, 0.026, 0.27], C.silver);
  panel("frontPlate", [0, 2.05, 2.73], 0.51, 0.13, PLATE);

  for (const side of [1, -1]) {
    // Pixel-shaped recovery eyes, built as three-sided brackets.
    const x = side * 0.89;
    box(`towEyeLeft${side}`, [x - 0.065, 2.04, 2.72],
      [0.055, 0.19, 0.07], C.orange);
    box(`towEyeRight${side}`, [x + 0.065, 2.04, 2.72],
      [0.055, 0.19, 0.07], C.orange);
    box(`towEyeBottom${side}`, [x, 1.965, 2.72],
      [0.17, 0.055, 0.07], C.orange);
    box(`rearLampBezel${side}`, [side * 0.91, 2.72, -2.487],
      [0.23, 0.36, 0.045], C.ink);
    glow(box(`rearLamp${side}`, [side * 0.91, 2.78, -2.516],
      [0.15, 0.19, 0.025], "#f54839"), 0.65);
    box(`reverseLamp${side}`, [side * 0.91, 2.62, -2.516],
      [0.15, 0.065, 0.025], C.white);
  }
  box("rearBumper", [0, 2.19, -2.54], [2.42, 0.21, 0.25], C.ink);
  tiled("rearHazardStrip", [0, 2.21, -2.677],
    [1.42, 0.09, 0.025], HAZARD, 0.045);
  panel("rearPlate", [0, 2.04, -2.68], 0.51, 0.13, PLATE, [0, 0, -1]);

  // Five voxel roof lights on a low, black light bar.
  for (const side of [1, -1]) {
    box(`roofBracket${side}`, [side * 0.85, 3.91, 0.66],
      [0.10, 0.16, 0.11], C.ink);
  }
  box("lightBar", [0, 3.98, 0.66], [2.06, 0.11, 0.19], C.ink);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.39;
    box(`roofLightHousing${i}`, [x, 4.035, 0.67],
      [0.31, 0.24, 0.22], C.ink);
    glow(panel(`roofLight${i}`, [x, 4.035, 0.787],
      0.245, 0.16, LAMP), 1.05);
    box(`roofLightCap${i}`, [x, 4.165, 0.69],
      [0.30, 0.027, 0.22], C.cyan);
  }

  // Small pixel rivets and cab-roof corner caps finish the primitive assemblies.
  for (const side of [1, -1]) {
    for (const z of [-0.76, 0.97]) {
      box(`roofCorner${side}_${z}`, [side * 1.08, 3.864, z],
        [0.13, 0.035, 0.13], C.yellow);
    }
    for (const z of [-2.23, -1.10, 1.12, 2.20]) {
      box(`bodyBolt${side}_${z}`, [side * 1.111, 2.40, z],
        [0.027, 0.055, 0.055], C.silver);
    }
  }

  // Arena corner markers stay below the truck and out of its frontal silhouette.
  for (const side of [1, -1]) {
    const x = side * 2.64, z = -2.81;
    box(`arenaMarkerFoot${side}`, [x, 0.20, z], [0.43, 0.08, 0.43], C.ink);
    tiled(`arenaMarker${side}`, [x, 0.37, z], [0.24, 0.31, 0.24],
      HAZARD, 0.025);
    box(`arenaMarkerCap${side}`, [x, 0.54, z], [0.30, 0.055, 0.30], C.yellow);
  }

  return b.root;
}
