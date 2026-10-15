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
    // Sparse earth caught on the leading edges, in chunky pixel clusters.
    for (const [x, y] of [[5, 3], [22, 12], [9, 24]]) {
      for (let dx = 0; dx < 5; dx++)
        for (let dy = 0; dy < 2; dy++)
          g.set(x + dx, y + dy, dy === 0 ? "#78674f" : "#4d493d");
      g.set(x + 1, y + 2, "#4d493d");
      g.set(x + 2, y + 2, "#4d493d");
    }
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
    for (let x = 19; x < 29; x++)
      for (let y = 2; y < 14; y++)
        g.set(x, y,
          x === 19 || x === 28 || y === 2 || y === 13
            ? C.yellow : C.ink);
    text(g, "B", 22, 4, C.yellow);
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
      if (r > 18) return "#1b252d";
      return "#101a22";
    });
    text(g, "BYTE", 21, 8, "#9aada9");
    text(g, "8 BIT", 18, 50, "#71877f");
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12;
      const x = Math.round(31.5 + Math.cos(a) * 26);
      const y = Math.round(31.5 + Math.sin(a) * 26);
      if (y > 18 && y < 46) {
        g.set(x, y, "#54615e");
        g.set(x + 1, y, "#54615e");
      }
    }
    for (const x of [5, 56]) {
      for (let y = 29; y < 35; y++) {
        g.set(x, y, C.yellow);
        g.set(x + 1, y, C.yellow);
      }
    }
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
    const shades = ["#87664c", "#907055", "#98785b", "#82634c"];
    const patches = Array.from({ length: 256 }, () =>
      shades[Math.floor(random() * shades.length)]);
    g.fill((x, y) => {
      const patch = patches[Math.floor(y / 4) * 16 + Math.floor(x / 4)];
      const track = Math.min(Math.abs(x - 15), Math.abs(x - 48));
      if (track < 5) {
        const rib = (y + Math.floor(track / 2)) % 6;
        if (rib < 2) return "#65513f";
        if (track > 3) return "#a17f5c";
        return "#7b6049";
      }
      if ((x * 17 + y * 31) % 113 === 0) return "#b0916c";
      return patch;
    });
  });

  const NUMBER = pixelTexture(48, 20, (g) => {
    g.fill((x, y) => {
      if (y === 0 || y === 19) return C.yellow;
      if (x < 3 || x > 44) return C.cyanDark;
      return C.ink;
    });
    text(g, "04", 13, 4, C.orangeDark, 2);
    text(g, "04", 12, 3, C.white, 2);
    for (let y = 3; y < 17; y++)
      for (let x = 3; x < 9; x++)
        g.set(x, y,
          (Math.floor(x / 3) + Math.floor(y / 3)) % 2
            ? C.white : C.ink);
    for (let y = 3; y < 17; y++) {
      g.set(40, y, C.yellow);
      g.set(41, y, C.yellow);
    }
  });

  const TITLE = pixelTexture(96, 16, (g) => {
    g.fill((x, y) => {
      if (y === 0 || y === 15) return C.yellow;
      if (x === 0 || x === 95) return C.silver;
      return C.ink;
    });
    text(g, "BYTE CRUSHER", 13, 5, C.white);
    for (let y = 3; y < 13; y++)
      for (let x = 3; x < 9; x++)
        g.set(x, y,
          (Math.floor(x / 3) + Math.floor(y / 3)) % 2
            ? C.yellow : C.ink);
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
  panel("displayTitle", [0, 0.105, 3.211], 1.44, 0.15, TITLE);

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
    b.extrude([
      [-0.20, -0.23],
      [0.20, -0.23],
      [0.33, -0.10],
      [0.33, 0.10],
      [0.20, 0.23],
      [-0.20, 0.23],
      [-0.33, 0.10],
      [-0.33, -0.10],
    ], {
      name: `differential${z}`,
      at: [0, 1.30, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.46,
      color: C.steel,
      bone: chassis,
    });
    b.extrude([
      [-0.13, -0.17],
      [0.13, -0.17],
      [0.23, -0.07],
      [0.23, 0.07],
      [0.13, 0.17],
      [-0.13, 0.17],
      [-0.23, 0.07],
      [-0.23, -0.07],
    ], {
      name: `diffCover${z}`,
      at: [0, 1.30, z + 0.245],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: C.orange,
      bone: chassis,
    });
    for (const x of [-0.13, 0.13]) {
      for (const y of [1.19, 1.41]) {
        box(`diffBolt${z}_${x}_${y}`, [x, y, z + 0.269],
          [0.042, 0.042, 0.018], C.ink);
      }
    }
    box(`diffCenter${z}`, [0, 1.30, z + 0.269],
      [0.11, 0.07, 0.018], C.orangeDark);
    for (const side of [1, -1]) {
      const lower = [side * 1.13, 1.32, z];
      const upper = [side * 0.76, 2.23, z + (z > 0 ? 0.20 : -0.20)];
      b.rod(lower, upper, 0.062, { color: C.silver, bone: chassis, sides: 6 });
      const direction = new THREE.Vector3(
        upper[0] - lower[0], upper[1] - lower[1], upper[2] - lower[2],
      );
      const springFrame = frame(lower, direction);
      const springLength = direction.length();
      const springPoints: THREE.Vector3[] = [];
      const corners = [
        [-0.105, -0.105],
        [0.105, -0.105],
        [0.105, 0.105],
        [-0.105, 0.105],
      ];
      for (let j = 0; j <= 24; j++) {
        const corner = corners[j % 4];
        springPoints.push(springFrame.local([
          corner[0],
          springLength * (0.19 + 0.64 * j / 24),
          corner[1],
        ]));
      }
      b.sweep(springPoints, 0.027, {
        name: `spring${z}_${side}`,
        color: C.orange,
        bone: chassis,
        section: "box",
        caps: "flat",
      });
      for (const t of [0.17, 0.85]) {
        b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.065, 8), C.orangeDark, {
          name: `springSeat${z}_${side}_${t}`,
          at: lerp(lower, upper, t),
          dir: direction,
          bone: chassis,
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
    b.part(new THREE.CylinderGeometry(1.025, 1.025, 0.96, 20, 1), tyrePaint, {
      name: `tyre${name}`, at: [x, 1.30, z], bone, dir: [1, 0, 0],
    });

    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 18; j++) {
        const deg = j * 20;
        const a = deg * Math.PI / 180;
        const treadGeometry = tileBox(
          [0.50, 0.18, 0.235], RUBBER, 0.030,
        );
        treadGeometry.rotateY((row ? -28 : 28) * Math.PI / 180);
        b.part(treadGeometry, "#ffffff", {
          name: `tread${name}_${row}_${j}`,
          at: [
            x + (row ? 0.235 : -0.235),
            1.30 + Math.cos(a) * 1.035,
            z + Math.sin(a) * 1.035,
          ],
          texture: RUBBER,
          bone,
          rotation: [deg, 0, 0],
        });
      }
    }

    for (const face of [-1, 1]) {
      const faceX = x + face * 0.486;
      b.part(new THREE.CircleGeometry(1.012, 32), "#ffffff", {
        name: `sidewall${name}_${face}`,
        at: [faceX, 1.30, z], bone, texture: SIDEWALL,
        dir: [face, 0, 0], axis: "z", up: [0, 1, 0],
      });
    }

    const outerX = x + side * 0.513;

    // A dark recessed well, separate spokes, and a thick sixteen-sided rim.
    b.part(new THREE.CylinderGeometry(0.59, 0.59, 0.025, 16), C.ink, {
      name: `rimWell${name}`,
      at: [outerX, 1.30, z],
      bone,
      dir: [side, 0, 0],
    });
    b.lathe([
      [0.455, 0],
      [0.595, 0],
      [0.615, 0.025],
      [0.615, 0.060],
      [0.565, 0.080],
      [0.455, 0.060],
    ], {
      name: `beadlockRim${name}`,
      at: [outerX, 1.30, z],
      axis: [side, 0, 0],
      segments: 16,
      color: C.steel,
      bone,
    });
    b.lathe([
      [0.575, 0],
      [0.610, 0],
      [0.610, 0.018],
      [0.575, 0.018],
    ], {
      name: `beadlockEdge${name}`,
      at: [outerX + side * 0.065, 1.30, z],
      axis: [side, 0, 0],
      segments: 16,
      color: C.cyanHi,
      bone,
    });
    for (let spoke = 0; spoke < 8; spoke++) {
      const angle = spoke * Math.PI / 4;
      box(`rimSpoke${name}_${spoke}`, [
        outerX + side * 0.032,
        1.30 + Math.cos(angle) * 0.344,
        z + Math.sin(angle) * 0.344,
      ], [0.065, 0.32, 0.105], C.silver, bone, [spoke * 45, 0, 0]);
      box(`rimSpokeInset${name}_${spoke}`, [
        outerX + side * 0.070,
        1.30 + Math.cos(angle) * 0.352,
        z + Math.sin(angle) * 0.352,
      ], [0.014, 0.18, 0.038], C.steel, bone, [spoke * 45, 0, 0]);
    }
    b.part(new THREE.CylinderGeometry(0.23, 0.27, 0.12, 8), C.cyanDark, {
      name: `hub${name}`, at: [outerX, 1.30, z], bone, dir: [side, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.025, 8), C.cyanHi, {
      name: `hubCap${name}`, at: [outerX + side * 0.070, 1.30, z],
      bone, dir: [side, 0, 0],
    });
    b.ring(frame([outerX + side * 0.080, 1.30, z], [side, 0, 0]), {
      count: 16, radius: 0.545,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.027, 4), C.yellow, {
        name: `wheelBolt${name}`, at: bolt, dir: [side, 0, 0], bone,
      });
    });
    b.ring(frame([outerX + side * 0.078, 1.30, z], [side, 0, 0]), {
      count: 8, radius: 0.181,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.025, 4), C.silver, {
        name: `hubBolt${name}`, at: bolt, dir: [side, 0, 0], bone,
      });
    });
    box(`valve${name}`, [outerX + side * 0.095, 1.79, z + 0.12],
      [0.043, 0.075, 0.043], C.ink, bone);
  }

  // Pickup body: a very simple, strongly squared silhouette.
  tiled("bodySill", [0, 2.36, 0], [2.17, 0.28, 4.62], BODY, 0.075);
  tiled("cab", [0, 3.105, 0.12], [2.20, 1.22, 1.96], BODY, 0.062);
  tiled("cabRoof", [0, 3.76, 0.10], [2.36, 0.17, 2.10], BODY, 0.065);
  box("roofHighlight", [0, 3.849, 0.12], [2.20, 0.018, 1.94], C.cyanHi);
  b.part(new THREE.PlaneGeometry(1.22, 1.22), "#ffffff", {
    name: "roofSkull",
    at: [0, 3.864, -0.12],
    bone: chassis,
    rotation: [-90, 0, 0],
    texture: SKULL,
  });
  for (const side of [1, -1]) {
    box(`roofRaceStripe${side}`, [side * 0.91, 3.864, 0.02],
      [0.11, 0.014, 1.70], C.yellow);
    for (let i = 0; i < 8; i++) {
      box(`roofChecker${side}_${i}`,
        [side * 0.75, 3.866, -0.70 + i * 0.19],
        [0.13, 0.016, 0.19],
        i % 2 ? C.ink : C.white);
    }
  }

  tiled("hood", [0, 2.70, 1.73], [2.18, 0.38, 1.28], BODY, 0.068);
  box("hoodFrontShadow", [0, 2.53, 2.38], [2.12, 0.055, 0.035], C.cyanDark);
  box("hoodRaisedCenter", [0, 2.916, 1.71], [1.12, 0.08, 1.04], C.cyanDark);
  panel("hoodMonster", [0, 2.962, 1.73], 1.02, 0.96, SKULL, [0, 1, 0]);
  for (const side of [1, -1]) {
    box(`hoodStripe${side}`, [side * 0.96, 2.896, 1.74],
      [0.10, 0.016, 1.20], C.yellow);
    for (let j = 0; j < 3; j++) {
      box(`hoodVent${side}_${j}`, [side * 0.73, 2.90, 1.37 + j * 0.14],
        [0.19, 0.022, 0.065], C.ink);
    }
  }

  // Dark glass is kept unobstructed, with pixel reflections and solid window seals.
  box("windshieldRubber", [0, 3.35, 1.113], [2.05, 0.73, 0.052], C.ink);
  panel("windshield", [0, 3.35, 1.143], 1.93, 0.63, GLASS);
  box("windshieldCenter", [0, 3.35, 1.153], [0.045, 0.65, 0.025], C.cyanDark);
  panel("windshieldRaceBanner", [0, 3.605, 1.174], 1.92, 0.13, TITLE);
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

    // Front eyebrows stop behind the lamp faces, rather than masking them.
    for (const z of [-1.65, 1.65]) {
      const fenderZ = z > 0 ? 1.54 : z;
      const fenderLength = z > 0 ? 1.72 : 2.08;
      box(`fenderDark${side}_${z}`, [side * 1.18, 2.49, fenderZ],
        [0.46, 0.19, fenderLength], C.ink);
      tiled(`fenderPaint${side}_${z}`, [side * 1.18, 2.60, fenderZ],
        [0.43, 0.09, fenderLength - 0.12], BODY, 0.060);
      box(`fenderStripe${side}_${z}`, [side * 1.402, 2.59, fenderZ],
        [0.018, 0.065, fenderLength - 0.21], C.yellow);
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
    panel(`raceNumber${side}`, [side * 1.116, 2.76, -1.68],
      1.02, 0.36, NUMBER, [side, 0, 0]);
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
  box("grilleBadgeBacking", [0, 2.59, 2.512],
    [0.34, 0.34, 0.025], C.ink);
  panel("grilleSkullBadge", [0, 2.59, 2.528], 0.32, 0.32, SKULL);
  for (const side of [1, -1]) {
    box(`headlightBezel${side}`, [side * 0.88, 2.62, 2.48],
      [0.48, 0.31, 0.09], C.ink);
    glow(panel(`headlamp${side}`, [side * 0.88, 2.62, 2.532],
      0.39, 0.22, LAMP), 1.05);
    glow(box(`indicator${side}`, [side * 1.005, 2.40, 2.51],
      [0.19, 0.075, 0.025], "#ffae38"), 0.7);
  }

  box("frontBumper", [0, 2.19, 2.56], [2.53, 0.24, 0.31], C.ink);
  panel("frontHazardStrip", [0, 2.235, 2.724],
    1.61, 0.11, HAZARD);
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
  panel("rearHazardStrip", [0, 2.21, -2.677],
    1.42, 0.09, HAZARD, [0, 0, -1]);
  panel("rearPlate", [0, 2.04, -2.68], 0.51, 0.13, PLATE, [0, 0, -1]);

  // Small amber clearance lights give the tall cab a recognisable truck face.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.40;
    box(`cabMarkerBezel${i}`, [x, 3.765, 1.166],
      [0.135, 0.055, 0.035], C.ink);
    glow(box(`cabMarkerLens${i}`, [x, 3.768, 1.188],
      [0.09, 0.028, 0.018], "#ffae38"), 0.7);
  }

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

  // A flattened arena scrap car fits entirely within the truck's wheelbase.
  // Its muted colours and low profile preserve the truck as the unmistakable hero.
  const SCRAP = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (y > 24) return "#493b49";
      if (x === 0 || y === 0) return "#3c303e";
      if (x === 1 || y === 1) return "#a67a86";
      return (x * 7 + y * 13) % 61 === 0 ? "#ac8e88" : "#785462";
    });
    for (const [x, y] of [[5, 9], [18, 18], [9, 25]]) {
      for (let j = 0; j < 7; j++) {
        g.set(x + j, y, "#bca99a");
        if (j < 4) g.set(x + j, y + 1, "#443c41");
      }
    }
  });

  const scrapZ = -0.18;
  box("scrapUnderpan", [0, 0.34, scrapZ],
    [1.26, 0.13, 2.56], "#343039");
  tiled("scrapBody", [0, 0.48, scrapZ],
    [1.34, 0.23, 2.70], SCRAP, 0.055);
  tiled("scrapRearDeck", [0, 0.60, scrapZ - 0.98],
    [1.29, 0.10, 0.64], SCRAP, 0.050);

  // The hood folds into a broad, shallow accordion.
  for (let i = 0; i < 3; i++) {
    tiled(`scrapHoodFold${i}`,
      [i === 1 ? 0.025 : 0, 0.61 + (i === 1 ? 0.035 : 0), scrapZ + 0.67 + i * 0.22],
      [1.28, 0.09, 0.26], SCRAP, 0.05,
      chassis, [i % 2 ? -10 : 8, 0, 0]);
  }

  // Collapsed cabin: deliberately bent panes and a buckled roof, not a tiny intact car.
  b.slab([
    [-0.58, 0.59, scrapZ + 0.42],
    [0.58, 0.59, scrapZ + 0.42],
    [0.50, 0.77, scrapZ + 0.12],
    [-0.47, 0.74, scrapZ + 0.12],
  ], { color: "#344952", thickness: 0.035, bone: chassis, name: "scrapWindshield" });

  b.slab([
    [-0.53, 0.74, scrapZ + 0.13],
    [0.52, 0.77, scrapZ + 0.13],
    [0.56, 0.68, scrapZ - 0.54],
    [-0.49, 0.70, scrapZ - 0.57],
  ], { color: "#8e6573", thickness: 0.055, bone: chassis, name: "scrapBuckledRoof" });

  for (const side of [1, -1]) {
    b.slab([
      [side * 0.63, 0.57, scrapZ + 0.40],
      [side * 0.50, 0.74, scrapZ + 0.10],
      [side * 0.54, 0.68, scrapZ - 0.54],
      [side * 0.64, 0.57, scrapZ - 0.73],
    ], { color: "#34424b", thickness: 0.025, bone: chassis,
      name: `scrapSideWindow${side}` });
    b.rod(
      [side * 0.60, 0.60, scrapZ + 0.40],
      [side * 0.49, 0.75, scrapZ + 0.10],
      0.025, { color: "#b38d94", section: "box", bone: chassis });
    box(`scrapDoorHandle${side}`, [side * 0.681, 0.51, scrapZ - 0.24],
      [0.025, 0.035, 0.15], "#ada39a");

    for (const z of [-0.98, 0.98]) {
      b.part(new THREE.CylinderGeometry(0.20, 0.20, 0.17, 8), "#28272e", {
        name: `scrapWheel${side}_${z}`,
        at: [side * 0.65, 0.36, scrapZ + z],
        bone: chassis, dir: [side, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.018, 8), "#7e7b79", {
        name: `scrapHub${side}_${z}`,
        at: [side * 0.744, 0.36, scrapZ + z],
        bone: chassis, dir: [side, 0, 0],
      });
    }
    box(`scrapHeadlamp${side}`, [side * 0.46, 0.48, scrapZ + 1.363],
      [0.23, 0.10, 0.02], "#c6bfa0");
    box(`scrapTailLamp${side}`, [side * 0.49, 0.48, scrapZ - 1.363],
      [0.17, 0.07, 0.02], "#8d4447");
  }
  box("scrapGrille", [0, 0.46, scrapZ + 1.365],
    [0.48, 0.11, 0.025], "#292a31");
  box("scrapBentBumper", [0.025, 0.35, scrapZ + 1.40],
    [1.40, 0.09, 0.11], "#8b8780", chassis, [0, -4, 3]);

  // Bright fractures and square glass chips are sparse accents.
  b.rod([-0.22, 0.682, scrapZ + 0.28],
    [0.04, 0.70, scrapZ + 0.25], 0.009,
    { color: "#a5c1bf", section: "box", bone: chassis });
  b.rod([0.04, 0.70, scrapZ + 0.25],
    [0.23, 0.75, scrapZ + 0.16], 0.009,
    { color: "#a5c1bf", section: "box", bone: chassis });

  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    box(`scrapGlassChip${i}`,
      [side * (0.80 + random() * 0.14), 0.168,
        scrapZ - 0.6 + random() * 1.8],
      [0.045 + random() * 0.035, 0.014, 0.055],
      i % 3 ? "#6f989b" : "#aec9bf",
      chassis, [0, i % 2 ? 0 : 45, 0]);
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
