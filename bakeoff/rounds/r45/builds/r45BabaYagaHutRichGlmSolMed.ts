import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A crooked log izba with painted Slavic carved trim, standing on two giant scaly chicken legs whose clawed feet grip the forest floor, facing the viewer with a red porch and door, a bright ridge roof, and a smoking chimney at the back."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  log: "#6e5138",
  logDark: "#4e3826",
  plank: "#8a6a44",
  roofBoard: "#b34a2c",
  shingle: "#54463a",
  ridge: "#2f7a6b",
  trimWhite: "#efe3c8",
  accentRed: "#c23b2e",
  accentGold: "#d9a441",
  door: "#7a3b2a",
  windowDark: "#1f2a3a",
  glassGlow: "#ffcf6e",
  claw: "#cbb98a",
  featherBody: "#8f8a72",
  featherTip: "#e8e0cd",
  legScale: "#d8a95c",
  footScale: "#c29048",
  soil: "#6b5a3f",
  stone: "#7d7668",
  moss: "#5f7a45",
  smoke: "#9aa0a8",
  ink: "#2b1c14",
};
const M = {
  sillLine: [0, 1.9, 0] as [number, number, number],
  legTopL: [-0.55, 1.9, 0.05] as [number, number, number],
  legTopR: [0.55, 1.9, 0.05] as [number, number, number],
  eavesLine: [0, 3.75, 0] as [number, number, number],
  porchLine: [0, 1.9, 1.3] as [number, number, number],
  groundLine: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chickenLegs
  (() => {
function buildChickenLegs({ b, J, P, M }: Ctx) {
  const R = rng(2417);

  const featherBody = P.featherBody;
  const featherTip = P.featherTip;
  const scale = P.legScale;
  const footScale = P.footScale;
  const claw = P.claw;
  const stone = P.stone;
  const moss = P.moss;
  const soil = P.soil;
  const ink = P.ink;
  const trim = P.trimWhite;
  const gold = P.accentGold;
  const logDark = P.logDark;

  const sphere = (
    at: any,
    radius: number,
    color: string,
    bone: any,
    scale3: [number, number, number] = [1, 1, 1],
    seg = 8,
  ) =>
    b.part(new THREE.SphereGeometry(radius, seg, Math.max(5, Math.floor(seg * 0.72))), color, {
      at,
      bone,
      scale: scale3,
      flat: true,
    });

  const box = (
    at: any,
    size: [number, number, number],
    color: string,
    bone: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const legParts = [
    { side: -1, joint: J.legL, seed: 11 },
    { side: 1, joint: J.legR, seed: 29 },
  ];

  for (const spec of legParts) {
    const s = spec.side;
    const j = spec.joint;

    const thighPath = catmull([
      [s * 0.55, 1.91, 0.05],
      [s * 0.57, 1.67, 0.08],
      [s * 0.52, 1.43, 0.12],
      [s * 0.48, 1.20, 0.14],
      [s * 0.52, 0.98, 0.17],
      [s * 0.64, 0.72, 0.22],
      [s * 0.72, 0.39, 0.27],
    ]);

    const leg = b.chain(`chickenLegs${s < 0 ? "L" : "R"}Main`, thighPath, {
      parent: j,
      count: 7,
      names: [
        `chickenLegs${s < 0 ? "L" : "R"}Thigh`,
        `chickenLegs${s < 0 ? "L" : "R"}Knee`,
        `chickenLegs${s < 0 ? "L" : "R"}Hock`,
        `chickenLegs${s < 0 ? "L" : "R"}Shin`,
        `chickenLegs${s < 0 ? "L" : "R"}Ankle`,
        `chickenLegs${s < 0 ? "L" : "R"}Foot`,
        `chickenLegs${s < 0 ? "L" : "R"}Heel`,
      ],
      role: "leg",
      group: "chickenLegs",
      contact: [s * 0.72, 0, 0.3],
    });

    b.sweep(leg, (t) => {
      if (t < 0.48) return 0.18 - t * 0.07;
      if (t < 0.78) return 0.105 - (t - 0.48) * 0.035;
      return 0.078;
    }, {
      color: (t) => (t < 0.46 ? featherBody : scale),
      section: { ngon: 7 },
      sides: 7,
      caps: "round",
      group: "chickenLegs",
      name: `chickenLegs${s < 0 ? "L" : "R"}Body`,
    });

    // Broad feather plates layered around the tucked thigh.
    for (let row = 0; row < 4; row++) {
      const t = 0.05 + row * 0.105;
      const center = leg.at(t);
      const count = row % 2 === 0 ? 7 : 6;
      const ring = b.ring(center, {
        count,
        radius: 0.12 + (1 - t) * 0.045,
        fromDeg: 28,
        toDeg: 332,
        tilt: -18,
      });

      for (let i = 0; i < ring.items.length; i++) {
        const feather = ring.items[i];
        const length = 0.15 + (i % 3) * 0.018;
        const color = (i + row) % 6 === 0 ? trim : i % 2 ? featherTip : featherBody;
        b.spike(feather, feather, length, 0.035, {
          color,
          caps: { start: "round", end: "point" },
          group: "chickenLegs",
          name: `chickenLegs${s < 0 ? "L" : "R"}Feather${row}_${i}`,
        });
      }
    }

    // A few long, loose wisps at the thigh edge.
    for (let i = 0; i < 4; i++) {
      const t = 0.10 + i * 0.12;
      const p = leg.at(t).at.clone();
      p.x += s * (0.13 + (i % 2) * 0.035);
      p.z += (i - 1.5) * 0.045;
      p.y += 0.03;
      const q = p.clone();
      q.x += s * (0.055 + i * 0.008);
      q.y -= 0.075 + (i % 2) * 0.035;
      q.z += 0.05;
      b.sweep(catmull([p, p.clone().add(new THREE.Vector3(s * 0.025, 0.035, 0.01)), q]), [0.028, 0.004], {
        color: i === 2 ? trim : featherTip,
        caps: "point",
        group: "chickenLegs",
        name: `chickenLegs${s < 0 ? "L" : "R"}LooseWisp${i}`,
      });
    }

    // Knee boss and a smaller angular knuckle.
    sphere(leg.at(0.29), 0.12, featherTip, leg.joints[1], [1.05, 0.8, 0.9], 8);
    sphere(leg.at(0.53), 0.086, scale, leg.joints[3], [0.95, 0.78, 0.85], 7);
    sphere(leg.at(0.75), 0.095, footScale, leg.joints[4], [1.05, 0.8, 0.9], 7);

    // Scaly shin plates and ankle scutes.
    for (let i = 0; i < 7; i++) {
      const t = 0.46 + i * 0.045;
      const at = leg.at(t);
      const ring = b.ring(at, {
        count: 6,
        radius: 0.098 - i * 0.003,
        fromDeg: 0,
        toDeg: 360,
        tilt: 26,
      });
      for (let k = 0; k < ring.items.length; k++) {
        b.spike(ring.items[k], ring.items[k], 0.055, 0.026, {
          color: k % 3 === 0 ? footScale : scale,
          caps: { start: "round", end: "point" },
          group: "chickenLegs",
          name: `chickenLegs${s < 0 ? "L" : "R"}Scute${i}_${k}`,
        });
      }
    }

    box(leg.at(0.86), [0.19, 0.19, 0.18], footScale, leg.joints[5], [0, s * 0.12, 0]);

    // Toe and claw construction. The three front toes fan toward +Z.
    const toeData = [
      { x: s * 0.72, z: 0.31, dx: s * 0.025, dz: 0.38, name: "Center" },
      { x: s * 0.62, z: 0.27, dx: s * -0.08, dz: 0.34, name: "Inner" },
      { x: s * 0.82, z: 0.28, dx: s * 0.12, dz: 0.31, name: "Outer" },
      { x: s * 0.70, z: 0.13, dx: s * 0.08, dz: -0.16, name: "Dew" },
    ];

    toeData.forEach((td, ti) => {
      const root = [td.x, 0.28, td.z] as [number, number, number];
      const mid = [td.x + td.dx * 0.42, 0.18, td.z + td.dz * 0.42] as [number, number, number];
      const end = [td.x + td.dx, 0.095, td.z + td.dz] as [number, number, number];

      const toe = b.chain(`chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}`, catmull([root, mid, end]), {
        parent: leg.tip,
        count: 3,
        names: [
          `chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}Base`,
          `chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}Knuckle`,
          `chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}Tip`,
        ],
        role: "digit",
        group: "chickenLegs",
      });

      b.sweep(toe, [0.057, 0.032], {
        color: footScale,
        section: { ngon: 6 },
        caps: "round",
        group: "chickenLegs",
        name: `chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}Scales`,
      });

      // Toe-top scutes.
      for (let k = 0; k < 3; k++) {
        const sc = toe.at(0.18 + k * 0.25, 0);
        b.stick(new THREE.ConeGeometry(0.026, 0.045, 5), k === 1 ? gold : scale, sc, {
          embed: 0.48,
          group: "chickenLegs",
          name: `chickenLegs${s < 0 ? "L" : "R"}Toe${td.name}Scute${k}`,
        });
      }

      const clawBase = toe.at(0.94).at.clone();
      const clawTip = clawBase.clone();
      clawTip.y = 0.018;
      clawTip.z += td.name === "Dew" ? -0.07 : 0.095;
      clawTip.x += s * (ti === 1 ? -0.025 : ti === 2 ? 0.025 : 0);

      b.spike(clawBase, clawTip, null, 0.042, {
        color: claw,
        caps: { start: "round", end: "point" },
        group: "chickenLegs",
        name: `chickenLegs${s < 0 ? "L" : "R"}Claw${td.name}`,
      });

      const tip = clawTip.clone();
      tip.y += 0.008;
      b.part(new THREE.ConeGeometry(0.024, 0.065, 6), ink, {
        at: tip,
        bone: toe.tip,
        dir: [0, -1, 0.2],
        flat: true,
        group: "chickenLegs",
        name: `chickenLegs${s < 0 ? "L" : "R"}Claw${td.name}InkTip`,
      });

      // Individual gripping stone and a small moss cap.
      const stoneAt = new THREE.Vector3(clawTip.x, 0.045, clawTip.z);
      stoneAt.x += (R() - 0.5) * 0.035;
      stoneAt.z += (R() - 0.5) * 0.03;
      sphere(stoneAt, 0.055 + R() * 0.018, stone, j, [1.25, 0.65, 0.9], 6);
      sphere(
        [stoneAt.x, stoneAt.y + 0.043, stoneAt.z - 0.006],
        0.028,
        moss,
        j,
        [1.35, 0.18, 0.75],
        6,
      );
    });

    // Low soil mound tucked beneath the foot.
    const mound = [s * 0.72, 0.035, 0.29];
    sphere(mound, 0.19, soil, j, [1.45, 0.2, 1.05], 7);
    for (let i = 0; i < 3; i++) {
      const p = [
        s * (0.58 + R() * 0.3),
        0.025 + R() * 0.025,
        0.16 + R() * 0.25,
      ] as [number, number, number];
      sphere(p, 0.025 + R() * 0.018, stone, j, [1.2, 0.55, 0.9], 6);
    }

    // Binding rope and iron hook at the point where the leg disappears into the sill.
    const bind = [s * 0.55, 1.86, 0.055] as [number, number, number];
    b.part(new THREE.TorusGeometry(0.13, 0.012, 5, 10), gold, {
      at: bind,
      bone: j,
      rotation: [Math.PI / 2, 0, 0],
      flat: true,
      group: "chickenLegs",
      name: `chickenLegs${s < 0 ? "L" : "R"}BindingRing`,
    });
    b.rod(
      [s * 0.55, 1.87, 0.16],
      [s * 0.55, 1.67, 0.17],
      0.012,
      gold,
      { bone: j, group: "chickenLegs", name: `chickenLegs${s < 0 ? "L" : "R"}BindingRope` },
    );
    b.spike(
      [s * 0.55, 1.66, 0.17],
      [s * 0.55, 1.57, 0.14],
      null,
      0.018,
      {
        color: ink,
        bone: j,
        caps: { start: "round", end: "point" },
        group: "chickenLegs",
        name: `chickenLegs${s < 0 ? "L" : "R"}BindingHook`,
      },
    );

    // Tiny painted ankle studs make the feet read as carved folk-art objects.
    for (let i = 0; i < 4; i++) {
      const a = leg.at(0.82).at.clone();
      a.x += s * (i % 2 ? 0.07 : -0.07);
      a.z += i < 2 ? 0.055 : -0.055;
      a.y += 0.055;
      sphere(a, 0.016, i === 0 ? gold : trim, leg.joints[5], [1, 0.65, 1], 6);
    }
  }
}
    return buildChickenLegs;
  })(),
  // hutWalls
  (() => {
function buildHutWalls({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const log = P.log;
  const logDark = P.logDark;
  const plank = P.plank;
  const roofBoard = P.roofBoard;
  const trim = P.trimWhite;
  const red = P.accentRed;
  const gold = P.accentGold;
  const door = P.door;
  const windowDark = P.windowDark;
  const glow = P.glassGlow;
  const ink = P.ink;

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: p,
      rotation,
      name,
      group: "hutWalls",
    });

  const cyl = (
    radius: number,
    height: number,
    p: [number, number, number],
    color: string,
    dir: [number, number, number],
    name: string,
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      bone,
      at: p,
      dir,
      name,
      group: "hutWalls",
      flat: true,
    });

  const slab = (
    points: [number, number, number][],
    color: string,
    name: string,
    thickness = 0.018,
  ) => b.slab(points, { color, thickness, bone, name, group: "hutWalls" });

  const hutRng = rng(2417);

  // ---------------------------------------------------------------------------
  // Crooked stacked log walls. Logs alternate their small forward/backward lean
  // so the silhouette reads as a handmade izba rather than a rectangular box.
  // ---------------------------------------------------------------------------

  const courses = 8;
  const ys = [1.99, 2.22, 2.45, 2.68, 2.91, 3.14, 3.37, 3.60];
  const frontZ = [1.235, 1.25, 1.225, 1.245, 1.23, 1.255, 1.235, 1.25];
  const backZ = [-1.235, -1.25, -1.22, -1.245, -1.23, -1.25, -1.225, -1.24];

  for (let i = 0; i < courses; i++) {
    const y = ys[i];
    const r = i === 0 ? 0.115 : 0.108;
    const c = i === 0 ? plank : i < 2 ? logDark : log;

    // Front and rear longitudinal logs.
    cyl(r, 2.82, at(0, y, frontZ[i]), c, [1, 0, 0], `frontLog${i}`, 10);
    cyl(r, 2.82, at(0, y, backZ[i]), i % 3 === 0 ? logDark : log, [1, 0, 0], `backLog${i}`, 10);

    // Side logs are inset between the projecting ends.
    const lean = (i % 2 === 0 ? -1 : 1) * 0.012;
    cyl(r, 2.48, at(-1.31, y, lean), i % 2 ? log : logDark, [0, 0, 1], `leftLog${i}`, 10);
    cyl(r, 2.48, at(1.31, y, -lean), i % 2 ? logDark : log, [0, 0, 1], `rightLog${i}`, 10);

    // A shallow carved seam on every front course.
    if (i > 0) {
      box([2.35, 0.018, 0.012], at(0, y - 0.112, 1.344), logDark, `frontSeam${i}`);
    }
  }

  // Projecting alternating corner log ends, with dark end discs and carved
  // centre bosses. The small gold/ink dots suggest old hand-carved rings.
  for (let i = 0; i < courses; i++) {
    const y = ys[i];
    const r = 0.108;
    const front = i % 2 === 0;
    const endZ = front ? 1.36 : -1.36;
    const endX = i % 2 === 0 ? 1.43 : -1.43;

    for (const x of [-1.43, 1.43]) {
      cyl(r * 0.93, 0.045, at(x, y, endZ), logDark, [0, 0, 1], `cornerEndF${i}${x}`, 10);
      cyl(r * 0.55, 0.052, at(x, y, endZ + (endZ > 0 ? 0.025 : -0.025)), plank, [0, 0, 1], `cornerRingF${i}${x}`, 10);
      cyl(r * 0.12, 0.059, at(x, y, endZ + (endZ > 0 ? 0.056 : -0.056)), ink, [0, 0, 1], `cornerDotF${i}${x}`, 8);
    }

    for (const z of [-1.36, 1.36]) {
      cyl(r * 0.93, 0.045, at(endX, y, z), logDark, [1, 0, 0], `cornerEndS${i}${z}`, 10);
      cyl(r * 0.55, 0.052, at(endX + (endX > 0 ? 0.025 : -0.025), y, z), plank, [1, 0, 0], `cornerRingS${i}${z}`, 10);
      cyl(r * 0.12, 0.059, at(endX + (endX > 0 ? 0.056 : -0.056), y, z), ink, [1, 0, 0], `cornerDotS${i}${z}`, 8);
    }
  }

  // Sill and upper eaves plate.
  box([2.92, 0.13, 2.78], at(0, 1.89, 0), plank, "sillPlank");
  box([2.98, 0.11, 2.86], at(0, 3.735, 0), logDark, "eavesPlate");
  box([2.72, 0.025, 2.62], at(0, 3.805, 0), ink, "eavesShadow");

  // ---------------------------------------------------------------------------
  // Front door: deep plank slab, heavy red carved surround, lintel and rune.
  // ---------------------------------------------------------------------------

  box([0.64, 1.22, 0.075], at(0, 2.49, 1.365), door, "doorLeaf");
  for (let i = 0; i < 5; i++) {
    box([0.035, 1.10, 0.018], at(-0.25 + i * 0.125, 2.49, 1.412), plank, `doorPlank${i}`);
  }
  box([0.095, 1.39, 0.13], at(-0.405, 2.53, 1.39), red, "doorFrameL");
  box([0.095, 1.39, 0.13], at(0.405, 2.53, 1.39), red, "doorFrameR");
  box([0.84, 0.13, 0.13], at(0, 3.22, 1.39), red, "doorLintel");
  box([0.76, 0.035, 0.018], at(0, 3.285, 1.47), trim, "doorLintelTrim");

  // White carved border blocks and zig-zag diamonds.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const y = 2.10 + i * 0.22;
      box([0.028, 0.105, 0.025], at(s * 0.365, y, 1.475), trim, `doorZig${s}${i}`, [0, 0, s * 0.55]);
    }
  }
  for (let i = 0; i < 7; i++) {
    const x = -0.30 + i * 0.10;
    box([0.055, 0.055, 0.028], at(x, 3.245 + (i % 2) * 0.035, 1.475), trim, `doorTopCarve${i}`, [0, 0, 0.785]);
  }

  // Hinges, handle and small round door window.
  for (const y of [2.22, 2.76]) {
    box([0.11, 0.13, 0.035], at(-0.285, y, 1.47), ink, `doorHinge${y}`);
    cyl(0.018, 0.045, at(-0.285, y, 1.50), gold, [0, 0, 1], `hingeBoss${y}`, 8);
  }
  cyl(0.045, 0.035, at(0.22, 2.48, 1.47), gold, [0, 0, 1], "doorHandle", 10);
  cyl(0.025, 0.043, at(0.22, 2.48, 1.505), ink, [0, 0, 1], "doorHandleDot", 8);

  cyl(0.14, 0.025, at(0, 2.89, 1.475), ink, [0, 0, 1], "doorRoundWindowFrame", 12);
  cyl(0.112, 0.031, at(0, 2.89, 1.492), glow, [0, 0, 1], "doorRoundGlass", 12);
  for (const a of [0, 90]) {
    box([0.018, 0.205, 0.018], at(0, 2.89, 1.515), ink, `doorGlassBar${a}`, [0, 0, (a * Math.PI) / 180]);
  }

  // Sun rune above the door: gold disc, rays, and dark centre.
  cyl(0.105, 0.025, at(0, 3.49, 1.39), gold, [0, 0, 1], "sunDisc", 12);
  cyl(0.039, 0.032, at(0, 3.49, 1.412), red, [0, 0, 1], "sunCore", 10);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    box(
      [0.018, 0.105, 0.022],
      at(Math.sin(a) * 0.105, 3.49 + Math.cos(a) * 0.105, 1.405),
      gold,
      `sunRay${i}`,
      [0, 0, -a],
    );
  }

  // ---------------------------------------------------------------------------
  // Two front windows with frames, glowing panes, bars, sills and shutters.
  // ---------------------------------------------------------------------------

  const makeFrontWindow = (x: number, id: string) => {
    box([0.62, 0.64, 0.06], at(x, 2.74, 1.355), windowDark, `${id}Frame`);
    box([0.49, 0.50, 0.025], at(x, 2.74, 1.395), glow, `${id}Glass`);
    box([0.022, 0.51, 0.025], at(x, 2.74, 1.418), ink, `${id}BarV`);
    box([0.51, 0.022, 0.025], at(x, 2.74, 1.42), ink, `${id}BarH`);
    box([0.74, 0.09, 0.10], at(x, 2.37, 1.39), trim, `${id}Sill`);
    box([0.70, 0.035, 0.09], at(x, 2.305, 1.405), logDark, `${id}SillShadow`);

    for (const side of [-1, 1]) {
      const sx = x + side * 0.40;
      box([0.16, 0.60, 0.075], at(sx, 2.74, 1.38), red, `${id}Shutter${side}`);
      box([0.18, 0.035, 0.022], at(sx, 2.88, 1.43), trim, `${id}ShutterStripeA${side}`);
      box([0.18, 0.035, 0.022], at(sx, 2.60, 1.43), trim, `${id}ShutterStripeB${side}`);
      cyl(0.032, 0.025, at(sx, 2.74, 1.435), gold, [0, 0, 1], `${id}ShutterBoss${side}`, 8);
      // tiny white floral dots
      cyl(0.014, 0.028, at(sx - side * 0.045, 2.82, 1.448), trim, [0, 0, 1], `${id}FlowerA${side}`, 7);
      cyl(0.014, 0.028, at(sx + side * 0.045, 2.66, 1.448), trim, [0, 0, 1], `${id}FlowerB${side}`, 7);
    }

    // Gold heart/star motif on the outer shutter.
    const sx = x + (x < 0 ? -0.40 : 0.40);
    box([0.045, 0.07, 0.028], at(sx, 2.74, 1.455), gold, `${id}HeartStem`);
    box([0.035, 0.035, 0.03], at(sx - 0.018, 2.775, 1.455), gold, `${id}HeartL`, [0, 0, 0.785]);
    box([0.035, 0.035, 0.03], at(sx + 0.018, 2.775, 1.455), gold, `${id}HeartR`, [0, 0, -0.785]);
  };

  makeFrontWindow(-0.86, "windowL");
  makeFrontWindow(0.86, "windowR");

  // ---------------------------------------------------------------------------
  // Side windows: one on each wall, turned to face sideways.
  // ---------------------------------------------------------------------------

  const makeSideWindow = (side: number, id: string) => {
    const x = side * 1.365;
    box([0.055, 0.46, 0.56], at(x, 2.78, -0.18), windowDark, `${id}Frame`);
    box([0.025, 0.34, 0.39], at(x + side * 0.035, 2.78, -0.18), glow, `${id}Glass`);
    box([0.028, 0.35, 0.018], at(x + side * 0.06, 2.78, -0.18), ink, `${id}BarV`);
    box([0.028, 0.018, 0.40], at(x + side * 0.06, 2.78, -0.18), ink, `${id}BarH`);
    box([0.07, 0.08, 0.68], at(x + side * 0.02, 2.51, -0.18), trim, `${id}Sill`);
    box([0.075, 0.45, 0.15], at(x + side * 0.04, 2.78, 0.23), red, `${id}Shutter`);
    box([0.08, 0.025, 0.17], at(x + side * 0.08, 2.92, 0.23), trim, `${id}ShutterBand`);
    cyl(0.028, 0.03, at(x + side * 0.10, 2.78, 0.23), gold, [1, 0, 0], `${id}Boss`, 8);
  };
  makeSideWindow(-1, "sideWindowL");
  makeSideWindow(1, "sideWindowR");

  // ---------------------------------------------------------------------------
  // Small folk-carved charm board beside the door, horse head silhouette,
  // sun marks, and nail dots scattered along the front logs.
  // ---------------------------------------------------------------------------

  box([0.23, 0.52, 0.045], at(-0.52, 3.02, 1.40), plank, "charmBoard");
  box([0.18, 0.035, 0.025], at(-0.52, 3.25, 1.435), trim, "charmBoardTop");
  box([0.07, 0.17, 0.025], at(-0.52, 3.04, 1.44), red, "horseNeck");
  box([0.12, 0.09, 0.025], at(-0.47, 3.17, 1.44), red, "horseHead");
  box([0.038, 0.038, 0.028], at(-0.425, 3.19, 1.455), trim, "horseEye");
  box([0.055, 0.018, 0.025], at(-0.55, 3.24, 1.44), red, "horseEarA", [0, 0, 0.65]);
  box([0.055, 0.018, 0.025], at(-0.48, 3.25, 1.44), red, "horseEarB", [0, 0, -0.65]);
  cyl(0.045, 0.025, at(-0.52, 2.89, 1.44), gold, [0, 0, 1], "charmSun", 10);
  cyl(0.015, 0.03, at(-0.52, 2.89, 1.46), ink, [0, 0, 1], "charmSunCore", 8);

  // Nail dots: deliberately irregular but deterministic, concentrated on logs.
  for (let i = 0; i < 18; i++) {
    const x = -1.18 + hutRng() * 2.36;
    const y = ys[1 + (i % 6)] + (hutRng() - 0.5) * 0.07;
    cyl(0.013, 0.025, at(x, y, 1.365), ink, [0, 0, 1], `nail${i}`, 6);
  }

  // Additional carved white and gold marks across the two upper courses.
  for (let i = 0; i < 9; i++) {
    const x = -1.08 + i * 0.27;
    box([0.075, 0.025, 0.02], at(x, 3.56, 1.365), i % 2 ? gold : trim, `upperCarve${i}`, [
      0,
      0,
      i % 2 ? 0.785 : -0.785,
    ]);
  }

  // A few dark lower-course shadow blocks make the underside feel weighty and
  // hide the junction where the legs disappear into the sill.
  for (const x of [-1.08, -0.72, 0.72, 1.08]) {
    box([0.25, 0.08, 0.035], at(x, 1.965, 1.365), logDark, `lowerShadow${x}`);
  }

  // Small carved corner chevrons on the front-facing projecting ends.
  for (const x of [-1.43, 1.43]) {
    for (let i = 0; i < 4; i++) {
      box([0.038, 0.06, 0.025], at(x, 2.13 + i * 0.23, 1.425), trim, `cornerChevron${x}${i}`, [
        0,
        0,
        x < 0 ? -0.65 : 0.65,
      ]);
    }
  }

  // A simple carved band immediately beneath the eaves.
  box([2.74, 0.06, 0.055], at(0, 3.69, 1.37), roofBoard, "frontEavesBand");
  for (let i = 0; i < 13; i++) {
    const x = -1.30 + i * 0.216;
    box([0.055, 0.055, 0.018], at(x, 3.69 + (i % 2) * 0.018, 1.405), i % 3 === 0 ? gold : trim, `eavesMark${i}`, [
      0,
      0,
      i % 2 ? 0.785 : -0.785,
    ]);
  }
}
    return buildHutWalls;
  })(),
  // roof
  (() => {
function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.roofCap;
  const roofBoard = P.roofBoard;
  const shingle = P.shingle;
  const ridge = P.ridge;
  const white = P.trimWhite;
  const gold = P.accentGold;
  const plank = P.plank;
  const dark = P.logDark;
  const stone = P.stone;
  const smoke = P.smoke;
  const moss = P.moss;
  const ink = P.ink;

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    size: [number, number, number],
    color: string,
    pos: [number, number, number],
    opts: {
      dir?: [number, number, number];
      axis?: "x" | "y" | "z";
      rotation?: [number, number, number];
      name?: string;
    } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: pos,
      dir: opts.dir,
      axis: opts.axis,
      rotation: opts.rotation,
      name: opts.name,
      group: "roof",
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    pos: [number, number, number],
    segments = 8,
    opts: { dir?: [number, number, number]; axis?: "x" | "y" | "z"; name?: string } = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone,
      at: pos,
      dir: opts.dir,
      axis: opts.axis,
      name: opts.name,
      group: "roof",
    });

  const sphere = (
    radius: number,
    color: string,
    pos: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      bone,
      at: pos,
      name,
      group: "roof",
    });

  // Main roof slopes. The ridge is at y = 5.03, with a broad 0.55 m overhang.
  for (const side of [-1, 1]) {
    const slopeDir: [number, number, number] = [-side, 0.705, 0];
    const slopeMid: [number, number, number] = [side * 0.9, 4.405, 0];
    box([2.32, 0.12, 3.72], shingle, slopeMid, {
      dir: slopeDir,
      axis: "x",
      name: side < 0 ? "roofSlopeL" : "roofSlopeR",
    });

    // Individual staggered shingle courses sit over the solid slope.
    for (let row = 0; row < 5; row++) {
      const t = (row + 0.5) / 5;
      const x = side * (1.8 - 1.8 * t);
      const y = 3.79 + 1.25 * t;
      const width = 0.47;
      const zOffset = row % 2 === 0 ? 0 : 0.24;

      for (let col = -2; col < 3; col++) {
        const z = col * 0.72 + zOffset;
        if (z < -1.78 || z > 1.78) continue;
        const tone = row % 2 === 0 ? shingle : P.logDark;
        box([width, 0.055, 0.66], tone, [x - side * row * 0.012, y + 0.045, z], {
          dir: slopeDir,
          axis: "x",
          name: `shingle_${side}_${row}_${col}`,
        });
      }

      // Dark lower edge of every course makes the shingle layering legible.
      box([2.12 - row * 0.34, 0.018, 3.68], dark, [
        side * (1.8 - row * 0.36),
        3.79 + row * 0.25,
        0,
      ], {
        dir: slopeDir,
        axis: "x",
        name: `shingleEdge_${side}_${row}`,
      });
    }
  }

  // Red carved fascia around all four eaves.
  box([3.68, 0.22, 0.18], roofBoard, at(0, 3.77, 1.84), {
    name: "fasciaFront",
  });
  box([3.68, 0.22, 0.18], roofBoard, at(0, 3.77, -1.84), {
    name: "fasciaBack",
  });
  box([0.18, 0.22, 3.68], roofBoard, at(1.84, 3.77, 0), {
    name: "fasciaLeft",
  });
  box([0.18, 0.22, 3.68], roofBoard, at(-1.84, 3.77, 0), {
    name: "fasciaRight",
  });

  // White carved bands, with repeating gold bosses along the front and back.
  box([3.55, 0.055, 0.035], white, at(0, 3.91, 1.945), { name: "frontWhiteTrim" });
  box([3.55, 0.055, 0.035], white, at(0, 3.91, -1.945), { name: "backWhiteTrim" });
  box([0.035, 0.055, 3.55], white, at(1.945, 3.91, 0), { name: "leftWhiteTrim" });
  box([0.035, 0.055, 3.55], white, at(-1.945, 3.91, 0), { name: "rightWhiteTrim" });

  for (const z of [-1.72, -1.15, -0.58, 0, 0.58, 1.15, 1.72]) {
    sphere(0.045, gold, at(-1.94, 3.91, z), `fasciaBossR_${z}`);
    sphere(0.045, gold, at(1.94, 3.91, z), `fasciaBossL_${z}`);
  }
  for (const x of [-1.55, -0.95, -0.35, 0.35, 0.95, 1.55]) {
    sphere(0.045, gold, at(x, 3.91, 1.94), `fasciaBossF_${x}`);
    sphere(0.045, gold, at(x, 3.91, -1.94), `fasciaBossB_${x}`);
  }

  // Gable faces: red triangular backing, then five horizontal log-plank courses.
  const gableOutline: [number, number][] = [
    [-1.78, 3.84],
    [1.78, 3.84],
    [0, 5.02],
  ];
  for (const z of [-1.86, 1.86]) {
    b.extrude(gableOutline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      color: roofBoard,
      bone,
      name: z > 0 ? "frontGableBacking" : "backGableBacking",
      group: "roof",
    });

    for (let i = 0; i < 5; i++) {
      const y = 4.02 + i * 0.19;
      const half = Math.max(0.12, 1.67 * (1 - (y - 3.84) / 1.18));
      box([half * 2, 0.135, 0.12], plank, [0, y, z + (z > 0 ? 0.055 : -0.055)], {
        name: `gableLog_${z}_${i}`,
      });
      box([half * 2 - 0.08, 0.018, 0.018], dark, [0, y - 0.075, z + (z > 0 ? 0.125 : -0.125)], {
        name: `gableSeam_${z}_${i}`,
      });
    }

    // Sloping white/red carved gable frame.
    box([2.53, 0.095, 0.11], white, [0, 4.41, z], {
      dir: [1, 0.67, 0],
      axis: "x",
      name: `gableTrimA_${z}`,
    });
    box([2.53, 0.095, 0.11], white, [0, 4.41, z], {
      dir: [-1, 0.67, 0],
      axis: "x",
      name: `gableTrimB_${z}`,
    });

    // Central carved sun disc and four gold ray bosses.
    cyl(0.23, 0.075, white, [0, 4.35, z + (z > 0 ? 0.1 : -0.1)], 12, {
      dir: [0, 0, 1],
      axis: "z",
      name: `gableSun_${z}`,
    });
    cyl(0.105, 0.085, gold, [0, 4.35, z + (z > 0 ? 0.145 : -0.145)], 10, {
      dir: [0, 0, 1],
      axis: "z",
      name: `gableSunCore_${z}`,
    });
    for (const [x, y] of [[0.29, 4.35], [-0.29, 4.35], [0, 4.64], [0, 4.06]] as [number, number][]) {
      sphere(0.035, gold, [x, y, z + (z > 0 ? 0.14 : -0.14)], `sunRay_${z}_${x}_${y}`);
    }
  }

  // Teal ridge board and its repeating white/gold folk pattern.
  box([0.22, 0.24, 3.86], ridge, at(0, 5.02, 0), { name: "greenRidgeBoard" });
  for (const z of [-1.58, -1.05, -0.52, 0, 0.52, 1.05, 1.58]) {
    box([0.24, 0.045, 0.22], white, at(0, 5.16, z), {
      rotation: [0, Math.PI / 4, 0],
      name: `ridgeWave_${z}`,
    });
  }
  for (const z of [-1.72, -0.86, 0, 0.86, 1.72]) {
    sphere(0.045, gold, at(0, 5.17, z), `ridgeGold_${z}`);
  }

  // Four carved brackets beneath the overhanging eaves.
  for (const x of [-1.66, 1.66]) {
    for (const z of [-1.63, 1.63]) {
      box([0.12, 0.55, 0.12], white, [x, 3.52, z], {
        rotation: [0, 0, x > 0 ? -0.48 : 0.48],
        name: `eaveBracket_${x}_${z}`,
      });
      sphere(0.075, gold, [x, 3.29, z], `bracketBoss_${x}_${z}`);
    }
  }

  // Stylized horse-head finials, facing outward from the two gable ends.
  for (const end of [-1, 1]) {
    const z = end * 1.91;
    box([0.24, 0.34, 0.18], plank, [0, 5.19, z], {
      name: `horseHead_${end}`,
    });
    box([0.12, 0.34, 0.15], plank, [0, 5.42, z], {
      name: `horseNeck_${end}`,
    });
    box([0.04, 0.17, 0.08], ink, [0.13, 5.25, z + end * 0.12], {
      name: `horseMane_${end}`,
    });
    box([0.04, 0.17, 0.08], ink, [-0.13, 5.25, z + end * 0.12], {
      name: `horseManeBack_${end}`,
    });
    cyl(0.025, 0.035, white, [0.09, 5.26, z + end * 0.105], 8, {
      dir: [0, 0, end],
      axis: "z",
      name: `horseEye_${end}`,
    });
    box([0.05, 0.055, 0.25], white, [0, 5.12, z + end * 0.13], {
      name: `horseBridle_${end}`,
    });
    sphere(0.035, gold, [0.15, 5.1, z + end * 0.14], `horseEarring_${end}`);
    for (const x of [-0.09, 0.09]) {
      b.part(new THREE.ConeGeometry(0.065, 0.18, 5), plank, {
        bone,
        at: [x, 5.58, z],
        dir: [0, 1, 0],
        name: `horseEar_${end}_${x}`,
        group: "roof",
      });
    }
  }

  // Rear chimney, intentionally placed through the rear/right roof slope.
  box([0.36, 0.92, 0.42], stone, [0.78, 4.57, -0.86], { name: "chimneyStack" });
  box([0.48, 0.13, 0.53], dark, [0.78, 5.06, -0.86], { name: "chimneyCap" });
  box([0.29, 0.035, 0.29], moss, [0.78, 5.14, -0.86], { name: "chimneyMoss" });

  // A compact rising trail of low-poly smoke, kept within the roof piece's silhouette.
  const smokePuffs: [number, number, number, number][] = [
    [0.78, 5.25, -0.86, 0.14],
    [0.69, 5.39, -0.82, 0.12],
    [0.82, 5.51, -0.77, 0.10],
  ];
  for (let i = 0; i < smokePuffs.length; i++) {
    const [x, y, z, r] = smokePuffs[i];
    const puff = sphere(r, smoke, [x, y, z], `smoke_${i}`);
    glow(puff, 0.15);
  }
}
    return buildRoof;
  })(),
  // porch
  (() => {
function buildPorch({ b, J, P, M }: Ctx) {
  const bone = J.body ?? J.hut;
  const R = rng(731);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone,
      at,
      rotation,
      name: name ?? "porch.box",
      group: "porch",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 8,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      bone,
      at,
      rotation,
      name: name ?? "porch.turning",
      group: "porch",
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      bone,
      at,
      name: name ?? "porch.boss",
      group: "porch",
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) =>
    b.rod(a, z, radius, {
      bone,
      color,
      section: { ngon: 6 },
      name: name ?? "porch.rail",
      group: "porch",
    });

  const spike = (
    at: [number, number, number],
    dir: [number, number, number],
    length: number,
    radius: number,
    color: string,
    name?: string,
  ) =>
    b.spike(at, dir, length, radius, {
      bone,
      color,
      name: name ?? "porch.carving",
      group: "porch",
    });

  const white = P.trimWhite;
  const red = P.roofBoard;
  const accent = P.accentRed;
  const gold = P.accentGold;
  const plank = P.plank;
  const dark = P.logDark;
  const ink = P.ink;
  const soil = P.soil;
  const stone = P.stone;

  // ---- Raised plank deck --------------------------------------------------

  box([1.72, 0.16, 0.78], [0, 1.54, 1.69], plank, undefined, "porch.deck");
  box([1.78, 0.055, 0.055], [0, 1.635, 1.31], dark, undefined, "porch.backBeam");
  box([1.82, 0.045, 0.07], [0, 1.635, 2.075], white, undefined, "porch.deckFrontTrim");

  // Individual deck plank seams and bright end caps.
  for (let x = -0.72; x <= 0.72; x += 0.24) {
    box([0.018, 0.025, 0.72], [x, 1.638, 1.69], dark, undefined, "porch.deckSeam");
    sphere(0.018, [x, 1.67, 1.33], gold, "porch.deckNail");
    sphere(0.018, [x, 1.67, 2.04], gold, "porch.deckNail");
  }

  // Side bearer beams beneath the deck.
  for (const s of [-1, 1]) {
    box([0.12, 0.22, 0.74], [s * 0.72, 1.42, 1.68], dark, undefined, "porch.bearer");
    box([0.18, 0.06, 0.78], [s * 0.72, 1.57, 1.68], red, undefined, "porch.bearerTrim");
  }

  // ---- Three descending, floor-true steps --------------------------------

  const steps = [
    { y: 1.38, z: 2.02, h: 0.16, d: 0.52, w: 1.42 },
    { y: 0.76, z: 2.28, h: 0.16, d: 0.50, w: 1.32 },
    { y: 0.08, z: 2.51, h: 0.16, d: 0.54, w: 1.20 },
  ];

  for (let i = 0; i < steps.length; i++) {
    const q = steps[i];
    box([q.w, q.h, q.d], [0, q.y, q.z], plank, undefined, `porch.step${i + 1}`);
    box([q.w + 0.035, 0.045, 0.055], [0, q.y + q.h / 2 + 0.012, q.z + q.d / 2 - 0.035], white, undefined, "porch.treadCarve");
    box([q.w - 0.04, 0.035, 0.045], [0, q.y - q.h / 2 - 0.018, q.z - q.d / 2 + 0.035], dark, undefined, "porch.riserShadow");

    for (const s of [-1, 1]) {
      sphere(0.021, [s * (q.w * 0.42), q.y + q.h / 2 + 0.035, q.z + q.d / 2 - 0.08], gold, "porch.stepBoss");
      box([0.035, q.h * 0.72, 0.06], [s * (q.w / 2 - 0.05), q.y, q.z + q.d / 2 - 0.08], red, undefined, "porch.stepEnd");
    }
  }

  // Small soil skirt and pebbles beneath the lowest tread.
  box([1.32, 0.035, 0.46], [0, 0.018, 2.54], soil, undefined, "porch.stepSoil");
  for (let i = 0; i < 10; i++) {
    const x = -0.62 + R() * 1.24;
    const z = 2.29 + R() * 0.48;
    sphere(0.025 + R() * 0.018, [x, 0.055 + R() * 0.018, z], i % 3 ? stone : dark, "porch.stepPebble");
  }

  // ---- Turned canopy posts and their bases -------------------------------

  for (const s of [-1, 1]) {
    const x = s * 0.76;
    cyl(0.075, 1.04, [x, 2.10, 1.48], dark, 8, undefined, "porch.post");
    cyl(0.105, 0.075, [x, 1.62, 1.48], red, 10, undefined, "porch.postFoot");
    cyl(0.095, 0.065, [x, 2.61, 1.48], red, 10, undefined, "porch.postCapital");
    cyl(0.064, 0.035, [x, 1.78, 1.48], gold, 10, undefined, "porch.postRing");
    cyl(0.064, 0.035, [x, 2.42, 1.48], gold, 10, undefined, "porch.postRing");
    sphere(0.09, [x, 2.65, 1.48], gold, "porch.capBoss");

    // Carved vertical highlights.
    for (const y of [1.9, 2.08, 2.26]) {
      box([0.025, 0.09, 0.025], [x + s * 0.067, y, 1.485], white, undefined, "porch.postCarve");
    }
  }

  // Canopy crossbeam and carved hanging fascia.
  box([1.78, 0.14, 0.16], [0, 2.62, 1.48], red, undefined, "porch.canopyBeam");
  box([1.84, 0.045, 0.055], [0, 2.69, 1.48], white, undefined, "porch.canopyBeamTrim");
  box([1.78, 0.045, 0.055], [0, 2.55, 1.48], gold, undefined, "porch.canopyBeamGold");

  for (let x = -0.77; x <= 0.77; x += 0.22) {
    const h = x === 0 ? 0.13 : 0.09;
    spike([x, 2.54, 1.48], [0, -1, 0], h, 0.028, white, "porch.fasciaTooth");
    sphere(0.025, [x, 2.70, 1.48], gold, "porch.fasciaBoss");
  }

  // ---- Little gable roof --------------------------------------------------

  const roofAngle = 34;
  box([1.02, 0.12, 1.18], [-0.43, 2.83, 1.48], red, [0, 0, -roofAngle], "porch.roofL");
  box([1.02, 0.12, 1.18], [0.43, 2.83, 1.48], red, [0, 0, roofAngle], "porch.roofR");

  // Staggered shingle strips on both roof slopes.
  for (const s of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      const x = s * (0.22 + row * 0.22);
      const y = 2.72 + row * 0.13;
      const z = 1.46;
      box([0.39, 0.028, 0.82], [x, y, z], plank, [0, 0, s * roofAngle], "porch.shingle");
      box([0.40, 0.018, 0.025], [x, y - 0.055, z + 0.01], dark, [0, 0, s * roofAngle], "porch.shingleSeam");
    }
  }

  box([0.16, 0.12, 1.28], [0, 3.07, 1.48], white, undefined, "porch.ridge");
  box([0.11, 0.14, 1.34], [0, 3.12, 1.48], red, undefined, "porch.ridgeRed");
  for (let z = 1.0; z <= 1.96; z += 0.22) {
    sphere(0.025, [0, 3.20, z], gold, "porch.ridgeBoss");
  }

  // Front gable triangle with a simple folk sun.
  b.extrude(
    [
      [-0.69, 0],
      [0.69, 0],
      [0.0, 0.48, "sharp"],
    ],
    {
      bone,
      at: [0, 2.67, 2.08],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      color: plank,
      name: "porch.gable",
      group: "porch",
    },
  );
  rod([-0.72, 2.68, 2.125], [0, 3.17, 2.125], 0.035, red, "porch.gableTrim");
  rod([0.72, 2.68, 2.125], [0, 3.17, 2.125], 0.035, red, "porch.gableTrim");
  rod([-0.69, 2.68, 2.13], [0.69, 2.68, 2.13], 0.035, white, "porch.gableTrim");

  cyl(0.14, 0.045, [0, 2.90, 2.145], white, 12, [90, 0, 0], "porch.sunDisc");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    spike(
      [Math.sin(a) * 0.12, 2.90 + Math.cos(a) * 0.12, 2.17],
      [Math.sin(a), Math.cos(a), 0],
      0.075,
      0.014,
      gold,
      "porch.sunRay",
    );
  }
  sphere(0.045, [0, 2.90, 2.18], gold, "porch.sunBoss");

  // Small carved bird finial at the canopy front.
  rod([0, 3.15, 2.08], [0, 3.36, 2.08], 0.018, dark, "porch.birdStem");
  b.extrude(
    [
      [-0.12, 0],
      [0.11, 0.02],
      [0.16, 0.13],
      [0.03, 0.19, "sharp"],
      [-0.08, 0.12],
    ],
    {
      bone,
      at: [0, 3.34, 2.09],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: red,
      name: "porch.birdFinial",
      group: "porch",
    },
  );
  sphere(0.025, [0.09, 3.46, 2.125], white, "porch.birdEye");
  spike([0.16, 3.40, 2.11], [0, 0, 1], 0.06, 0.015, gold, "porch.birdBeak");

  // ---- Carved side railings ----------------------------------------------

  for (const s of [-1, 1]) {
    const x = s * 0.79;
    box([0.095, 0.68, 0.095], [x, 1.93, 1.98], accent, undefined, "porch.railPostFront");
    box([0.095, 0.68, 0.095], [x, 1.93, 1.38], accent, undefined, "porch.railPostBack");
    rod([x, 2.27, 1.36], [x, 2.27, 2.03], 0.035, white, "porch.topRail");
    rod([x, 1.73, 1.38], [x, 1.73, 1.98], 0.022, gold, "porch.lowerRail");

    for (let i = 0; i < 4; i++) {
      const z = 1.46 + i * 0.17;
      const top = 2.20 + Math.sin(i * 1.7) * 0.035;
      rod([x, 1.78, z], [x, top, z], 0.017, white, "porch.baluster");
      sphere(0.035, [x, 2.30, z], gold, "porch.railBoss");
    }
    sphere(0.075, [x, 2.32, 1.36], gold, "porch.railFinial");
    sphere(0.075, [x, 2.32, 2.04], gold, "porch.railFinial");
  }

  // ---- Hanging sign, chain, rooster and lettering marks ------------------

  box([0.78, 0.48, 0.075], [0, 2.21, 2.29], plank, undefined, "porch.sign");
  box([0.84, 0.045, 0.045], [0, 2.455, 2.30], red, undefined, "porch.signTop");
  box([0.84, 0.04, 0.04], [0, 1.965, 2.30], white, undefined, "porch.signBottom");

  for (const s of [-1, 1]) {
    rod([s * 0.29, 2.48, 2.30], [s * 0.29, 2.63, 2.30], 0.012, dark, "porch.signChain");
    sphere(0.025, [s * 0.29, 2.48, 2.30], gold, "porch.chainLink");
  }
  rod([-0.29, 2.63, 2.30], [0.29, 2.63, 2.30], 0.012, dark, "porch.signHanger");

  // Gold rooster silhouette, raised from the sign face.
  b.extrude(
    [
      [-0.19, -0.10],
      [-0.04, -0.06],
      [-0.01, 0.03],
      [-0.10, 0.12],
      [-0.02, 0.16],
      [0.06, 0.11],
      [0.14, 0.14],
      [0.18, 0.09],
      [0.10, 0.04],
      [0.12, -0.10],
      [0.04, -0.12],
      [0.0, -0.02],
      [-0.08, -0.14],
    ],
    {
      bone,
      at: [0, 2.21, 2.335],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: gold,
      name: "porch.rooster",
      group: "porch",
    },
  );
  sphere(0.017, [0.105, 2.34, 2.355], white, "porch.roosterEye");
  spike([0.16, 2.31, 2.35], [0, 0, 1], 0.045, 0.01, red, "porch.roosterBeak");
  for (let i = 0; i < 5; i++) {
    box([0.025, 0.012, 0.012], [-0.25 + i * 0.12, 2.08, 2.34], ink, undefined, "porch.signNotch");
  }

  // Tiny folk rosettes on the sign corners.
  for (const x of [-0.34, 0.34]) {
    sphere(0.035, [x, 2.40, 2.345], white, "porch.signRosette");
    sphere(0.018, [x, 2.40, 2.365], red, "porch.signRosetteCore");
  }

  // Extra carved diamond motifs along the fascia and step fronts.
  for (const x of [-0.58, -0.29, 0.29, 0.58]) {
    b.extrude(
      [
        [0, 0.045],
        [0.045, 0],
        [0, -0.045],
        [-0.045, 0],
      ],
      {
        bone,
        at: [x, 2.72, 1.565],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: gold,
        name: "porch.fasciaDiamond",
        group: "porch",
      },
    );
  }

  // A few dark nail heads and white carved chevrons keep the whole porch handmade.
  for (const x of [-0.67, -0.45, 0.45, 0.67]) {
    sphere(0.014, [x, 2.60, 1.56], ink, "porch.nail");
    rod([x - 0.055, 2.585, 1.59], [x, 2.625, 1.59], 0.009, white, "porch.chevron");
    rod([x, 2.625, 1.59], [x + 0.055, 2.585, 1.59], 0.009, white, "porch.chevron");
  }
}
    return buildPorch;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const J: Record<string, Joint> = {};
  J["hut"] = b.joint("hut", { at: [0,1.9,0], dir: [0,1,0], role: "spine" });
  J["legL"] = b.joint("legL", { parent: J["hut"], at: [-0.55,1.9,0.05], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legR"] = b.joint("legR", { parent: J["hut"], at: [0.55,1.9,0.05], dir: [0,-1,0], role: "leg", group: "legs" });
  J["roofCap"] = b.joint("roofCap", { parent: J["hut"], at: [0,3.75,0], dir: [0,1,0], role: "hinge", group: "roof" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
