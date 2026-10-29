import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A Slavic folk-art log hut with carved trim and a red shingle roof, standing on two golden scaly chicken legs with big clawed feet, on a mossy mound with a stake fence and a mortar."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  log: "#8a5a33",
  logDark: "#5c3a22",
  plank: "#a9743f",
  roofRed: "#a63c30",
  roofDark: "#7c2b22",
  trim: "#efe6d0",
  paintRed: "#b03a2e",
  paintTeal: "#2e6f8e",
  gold: "#d9a441",
  feather: "#e8e2d0",
  featherRust: "#b0592e",
  legScale: "#e0a83c",
  claw: "#f0e6cf",
  comb: "#c23a2e",
  inkDark: "#3a2418",
  moss: "#5c7a3a",
  dirt: "#6b4a2e",
  stone: "#8b8578",
  glow: "#ffb347",
  smoke: "#c9c2b8",
};
const M = {
  legAnchorL: [0.8, 1.62, -0.15] as [number, number, number],
  legAnchorR: [-0.8, 1.62, -0.15] as [number, number, number],
  roofBase: [0, 3, 0] as [number, number, number],
  ground: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const C = {
    feather: P.feather,
    rust: P.featherRust,
    gold: P.legScale,
    claw: P.claw,
    dark: P.inkDark,
    moss: P.moss,
  };

  const v = (p: [number, number, number]) => new THREE.Vector3(...p);

  const capsule = (
    a: THREE.Vector3,
    z: THREE.Vector3,
    r: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.capsule(a, z, r, {
      color,
      bone,
      sides: 8,
      detail: 1,
      name,
      group: "legs",
    });

  const rod = (
    a: THREE.Vector3,
    z: THREE.Vector3,
    r: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.rod(a, z, r, {
      color,
      bone,
      sides: 7,
      detail: 1,
      caps: "flat",
      name,
      group: "legs",
    });

  const sphere = (
    at: THREE.Vector3,
    scale: [number, number, number],
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
      group: "legs",
    });

  const cone = (
    at: THREE.Vector3,
    radius: number,
    length: number,
    color: string,
    bone: any,
    dir: [number, number, number],
    name: string,
  ) =>
    b.part(new THREE.ConeGeometry(radius, length, 7), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
      group: "legs",
    });

  const box = (
    at: THREE.Vector3,
    size: [number, number, number],
    color: string,
    bone: any,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
      group: "legs",
    });

  const featherBlade = (
    at: THREE.Vector3,
    side: number,
    tilt: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    const x = side * 0.075;
    const outline: [number, number, "sharp"][] = [
      [-0.055, 0, "sharp"],
      [0.055, 0, "sharp"],
      [0.035, 0.13, "sharp"],
      [0, 0.2, "sharp"],
      [-0.035, 0.13, "sharp"],
    ];
    return b.extrude(outline, {
      at,
      x: [Math.cos(tilt) * side, 0, Math.sin(tilt)],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color,
      bone,
      name,
      group: "legs",
    });
  };

  const scaleDisc = (
    at: THREE.Vector3,
    normal: [number, number, number],
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.stick(
      new THREE.CylinderGeometry(radius, radius * 0.82, 0.018, 6),
      color,
      {
        at,
        dir: normal,
        bone,
        embed: 0.42,
        name,
        group: "legs",
      },
    );

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const hip = J[`hip${tag}`];
    const knee = J[`knee${tag}`];
    const ankle = J[`ankle${tag}`];
    const toe = J[`toe${tag}`];

    const hipP = hip.at.clone();
    const kneeP = knee.at.clone();
    const ankleP = ankle.at.clone();
    const toeP = toe.at.clone();

    // Feathered thigh: a broad cream upper limb with a rust shadow underside.
    const thigh = capsule(
      hipP.clone().add(new THREE.Vector3(0, -0.03, 0)),
      kneeP.clone().add(new THREE.Vector3(0, 0.02, 0)),
      0.205,
      C.feather,
      hip,
      `thigh${tag}`,
    );

    capsule(
      hipP.clone().add(new THREE.Vector3(0, -0.18, 0)),
      kneeP.clone().add(new THREE.Vector3(0, 0.08, 0)),
      0.13,
      C.rust,
      hip,
      `thighShadow${tag}`,
    );

    // Overlapping feather blades around the lower thigh.
    const featherYs = [0.02, -0.12, -0.26, -0.4, -0.54];
    featherYs.forEach((dy, i) => {
      const p = hipP.clone().lerp(kneeP, 0.18 + i * 0.14);
      p.y += dy * 0.18;
      p.z += 0.02;
      featherBlade(p, side, 0.16, i % 3 === 0 ? C.rust : C.feather, hip, `thighFeather${tag}_${i}`);
      featherBlade(
        p.clone().add(new THREE.Vector3(0, 0.025, -0.035)),
        -side,
        -0.14,
        i === 2 ? C.rust : C.feather,
        hip,
        `thighFeatherBack${tag}_${i}`,
      );
    });

    // Knee joint and a little cream cuff.
    sphere(kneeP, [0.24, 0.2, 0.22], C.feather, knee, `knee${tag}`);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const p = kneeP.clone().add(new THREE.Vector3(Math.cos(a) * 0.16, -0.08, Math.sin(a) * 0.16));
      featherBlade(p, side, a * 0.35, i % 2 ? C.feather : C.rust, knee, `kneePlume${tag}_${i}`);
    }

    // Golden shin, slightly forward of the knee, ending at the ankle.
    const shin = capsule(
      kneeP.clone().add(new THREE.Vector3(0, -0.02, 0.015)),
      ankleP.clone().add(new THREE.Vector3(0, 0.03, 0)),
      0.105,
      C.gold,
      knee,
      `scalyShin${tag}`,
    );

    // Dark narrow seam beneath the scales.
    rod(
      kneeP.clone().add(new THREE.Vector3(0, -0.02, -0.08)),
      ankleP.clone().add(new THREE.Vector3(0, 0.02, -0.07)),
      0.025,
      C.dark,
      knee,
      `shinSeam${tag}`,
    );

    // Six-sided overlapping scales on the front and sides of the shin.
    const srng = rng(side > 0 ? 101 : 202);
    const scaleHits: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.35) / 12;
      const p = kneeP.clone().lerp(ankleP, t);
      p.y += 0.018;
      p.z += 0.085;
      p.x += (srng() - 0.5) * 0.13;
      scaleHits.push(p);
    }
    scaleHits.forEach((p, i) => {
      scaleDisc(p, [0, 0.15, 1], 0.065, i % 4 === 0 ? C.claw : C.gold, knee, `shinScale${tag}_${i}`);
      box(
        p.clone().add(new THREE.Vector3(0, 0.004, 0.004)),
        [0.008, 0.075, 0.012],
        C.dark,
        knee,
        `scaleMark${tag}_${i}`,
        [0, 0, side * 0.25],
      );
    });

    // Backward-bent hock.
    const hock = ankleP.clone().add(new THREE.Vector3(0, -0.18, -0.12));
    rod(ankleP, hock, 0.09, C.gold, ankle, `hock${tag}`);
    sphere(hock, [0.12, 0.1, 0.12], C.gold, ankle, `hockJoint${tag}`);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = ankleP.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, -0.03, Math.sin(a) * 0.1));
      featherBlade(p, side, a * 0.25, C.feather, ankle, `ankleCuff${tag}_${i}`);
    }

    // Low, chunky foot pad planted just above the mound.
    const foot = toeP.clone().add(new THREE.Vector3(0, 0.025, -0.02));
    box(foot, [0.28, 0.13, 0.38], C.claw, toe, `footPad${tag}`, [0.08, 0, 0]);

    // Three forward toes, fanned in x and stepping toward +Z.
    const toeOffsets = [-0.105, 0, 0.105];
    toeOffsets.forEach((dx, i) => {
      const root = foot.clone().add(new THREE.Vector3(dx, 0.015, 0.11));
      const mid = root.clone().add(new THREE.Vector3(dx * 0.32, -0.015, 0.23));
      const tip = mid.clone().add(new THREE.Vector3(dx * 0.42, -0.025, 0.22));

      rod(root, mid, 0.042, C.claw, toe, `toe${tag}_${i}`);
      rod(mid, tip, 0.032, C.claw, toe, `toeTip${tag}_${i}`);

      // Dark joint bands make the segmented folk-puppet construction readable.
      sphere(mid, [0.052, 0.035, 0.052], C.dark, toe, `toeJoint${tag}_${i}`);
      cone(
        tip.clone().add(new THREE.Vector3(dx * 0.12, -0.045, 0.055)),
        0.036,
        0.19,
        C.claw,
        toe,
        [dx * 0.18, -0.28, 0.95],
        `toeClaw${tag}_${i}`,
      );
    });

    // Rear spur points toward the back and slightly outward.
    const spurRoot = foot.clone().add(new THREE.Vector3(-side * 0.09, 0.02, -0.13));
    const spurTip = spurRoot.clone().add(new THREE.Vector3(-side * 0.04, -0.02, -0.22));
    rod(spurRoot, spurTip, 0.038, C.gold, toe, `spur${tag}`);
    cone(
      spurTip.clone().add(new THREE.Vector3(-side * 0.02, -0.025, -0.045)),
      0.032,
      0.15,
      C.claw,
      toe,
      [-side * 0.15, -0.2, -0.95],
      `spurClaw${tag}`,
    );

    // Small painted bands give each leg a folk-art accent.
    const bandY = kneeP.clone().lerp(ankleP, 0.48);
    b.part(new THREE.TorusGeometry(0.108, 0.012, 5, 8), C.rust, {
      at: bandY,
      bone: knee,
      rotation: [Math.PI / 2, 0, 0],
      name: `shinBand${tag}`,
      group: "legs",
    });
  }
}
    return buildLegs;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: Ctx) {
  const body = J.body;
  const log = P.log;
  const logDark = P.logDark;
  const plank = P.plank;
  const roofRed = P.roofRed;
  const trim = P.trim;
  const red = P.paintRed;
  const teal = P.paintTeal;
  const gold = P.gold;
  const ink = P.inkDark;
  const glowColor = P.glow;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone: body, at, ...extra });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(...size), color, at, extra);

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, extra.segments as number ?? 8),
      color,
      at,
      extra,
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    extra: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, color, { bone: body, ...extra });

  const frontZ = 1.84;
  const sideX = -1.56;

  // -----------------------------------------------------------------------------------------------
  // Massive stacked log walls. The alternating ends and darker lower courses make the cabin read
  // immediately as an old hand-built izba rather than a cuboid.
  // -----------------------------------------------------------------------------------------------

  const courses = [1.68, 1.91, 2.14, 2.37, 2.60, 2.83];
  for (let i = 0; i < courses.length; i++) {
    const y = courses[i];
    const c = i < 2 ? logDark : log;

    // front and rear walls, with the front still visible around the door and windows
    rod([-1.62, y, -1.74], [1.62, y, -1.74], 0.145, c, { sides: 8 });
    rod([-1.62, y, 1.74], [1.62, y, 1.74], 0.145, c, { sides: 8 });

    // side walls; alternating courses project slightly beyond the front and back
    const over = i % 2 === 0 ? 0.08 : 0;
    rod([-1.62 - over, y, -1.74], [-1.62 - over, y, 1.74], 0.145, c, {
      sides: 8,
    });
    rod([1.62 + over, y, -1.74], [1.62 + over, y, 1.74], 0.145, c, {
      sides: 8,
    });
  }

  // Proud round end grain at every corner, with a contrasting central peg.
  for (const x of [-1.68, 1.68]) {
    for (const z of [-1.78, 1.78]) {
      for (let i = 0; i < courses.length; i++) {
        const y = courses[i];
        const face = z > 0 ? [0, 0, 1] : [0, 0, -1];
        part(
          new THREE.CylinderGeometry(0.115, 0.115, 0.035, 10),
          i < 2 ? logDark : plank,
          [x, y, z + face[2] * 0.13],
          { dir: face, axis: "y", rotation: [Math.PI / 2, 0, 0] },
        );
        part(
          new THREE.CylinderGeometry(0.026, 0.026, 0.041, 8),
          ink,
          [x, y, z + face[2] * 0.152],
          { dir: face, axis: "y", rotation: [Math.PI / 2, 0, 0] },
        );
      }
    }
  }

  // Heavy foundation sill and little hanging under-wall planks.
  rod([-1.7, 1.57, -1.82], [1.7, 1.57, -1.82], 0.18, logDark, { sides: 8 });
  rod([-1.7, 1.57, 1.82], [1.7, 1.57, 1.82], 0.18, logDark, { sides: 8 });
  rod([-1.72, 1.57, -1.82], [-1.72, 1.57, 1.82], 0.18, logDark, { sides: 8 });
  rod([1.72, 1.57, -1.82], [1.72, 1.57, 1.82], 0.18, logDark, { sides: 8 });

  for (const x of [-1.25, -0.82, -0.38, 0.12, 0.62, 1.12]) {
    const h = 0.16 + (Math.abs(x * 17) % 3) * 0.035;
    box([0.16, h, 0.08], plank, [x, 1.48 - h / 2, 1.72], {
      rotation: [0.04 * x, 0, 0.08 * x],
    });
  }

  // Narrow pale eave band under the roof handoff.
  box([3.55, 0.11, 0.14], trim, [0, 2.98, 1.79]);
  box([3.55, 0.11, 0.14], trim, [0, 2.98, -1.79]);
  box([0.14, 0.11, 3.55], trim, [-1.79, 2.98, 0]);
  box([0.14, 0.11, 3.55], trim, [1.79, 2.98, 0]);

  // -----------------------------------------------------------------------------------------------
  // Front door: layered plank leaf, dark seams, red paint, iron straps, and carved surround.
  // -----------------------------------------------------------------------------------------------

  const doorY = 2.15;
  const doorW = 0.72;
  const doorH = 1.18;
  const doorBottom = 1.59;

  box([doorW, doorH, 0.105], plank, [0, doorBottom + doorH / 2, 1.855]);
  for (let x = -0.30; x <= 0.30; x += 0.20) {
    box([0.018, doorH - 0.08, 0.014], logDark, [x, doorY, 1.916]);
  }
  box([doorW + 0.18, 0.10, 0.12], trim, [0, 2.79, 1.90]);
  box([0.10, 1.28, 0.12], trim, [-0.45, doorY, 1.90]);
  box([0.10, 1.28, 0.12], trim, [0.45, doorY, 1.90]);

  // Red lintel and teal diamond above the door.
  box([0.56, 0.07, 0.018], red, [0, 2.69, 1.972]);
  part(
    new THREE.OctahedronGeometry(0.075, 0),
    teal,
    [0, 2.69, 1.985],
    { rotation: [Math.PI / 4, 0, 0] },
  );

  for (const y of [1.83, 2.39]) {
    box([0.08, 0.31, 0.035], ink, [-0.285, y, 1.93]);
    box([0.08, 0.31, 0.035], ink, [0.285, y, 1.93]);
    box([0.055, 0.20, 0.018], gold, [-0.285, y, 1.958]);
    box([0.055, 0.20, 0.018], gold, [0.285, y, 1.958]);
  }
  cylinder(0.045, 0.025, gold, [0.22, 2.15, 1.97], {
    dir: [0, 0, 1],
    axis: "y",
    rotation: [Math.PI / 2, 0, 0],
    segments: 8,
  });

  // -----------------------------------------------------------------------------------------------
  // Carved window assembly helper. It is deliberately chunky and graphic, with solar rosettes.
  // -----------------------------------------------------------------------------------------------

  const frontWindow = (x: number, y: number, scale: number, mirror = false) => {
    const w = 0.43 * scale;
    const h = 0.58 * scale;
    const z = 1.875;

    box([w, h, 0.075], ink, [x, y, z]);
    box([0.065 * scale, h + 0.22 * scale, 0.105], trim, [
      x - w / 2 - 0.075 * scale,
      y,
      z + 0.015,
    ]);
    box([0.065 * scale, h + 0.22 * scale, 0.105], trim, [
      x + w / 2 + 0.075 * scale,
      y,
      z + 0.015,
    ]);
    box([w + 0.25 * scale, 0.07 * scale, 0.105], trim, [
      x,
      y + h / 2 + 0.15 * scale,
      z + 0.015,
    ]);
    box([w + 0.25 * scale, 0.07 * scale, 0.105], trim, [
      x,
      y - h / 2 - 0.15 * scale,
      z + 0.015,
    ]);

    // Cross mullions and a painted shutter wing.
    box([0.035 * scale, h - 0.06 * scale, 0.018], teal, [x, y, z + 0.065]);
    box([w - 0.05 * scale, 0.035 * scale, 0.018], teal, [x, y, z + 0.067]);
    box([0.12 * scale, h * 0.76, 0.025], teal, [
      x + (mirror ? -1 : 1) * (w / 2 + 0.10 * scale),
      y,
      z + 0.075,
    ]);
    box([0.045 * scale, h * 0.38, 0.035], red, [
      x + (mirror ? -1 : 1) * (w / 2 + 0.105 * scale),
      y,
      z + 0.097,
    ]);

    // Zig-zag carving on both jambs.
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const yy = y - h * 0.34 + i * h * 0.22;
        box([0.075 * scale, 0.028 * scale, 0.028], red, [
          x + s * (w / 2 + 0.075 * scale),
          yy,
          z + 0.084,
        ], { rotation: [0, 0, s * 0.55] });
      }
    }

    // Solar rosette: pale disc, red rays, teal hub.
    const crown = [x, y + h / 2 + 0.18 * scale, z + 0.09] as [number, number, number];
    part(
      new THREE.CylinderGeometry(0.13 * scale, 0.13 * scale, 0.035, 12),
      trim,
      crown,
      { dir: [0, 0, 1], axis: "y", rotation: [Math.PI / 2, 0, 0] },
    );
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const px = crown[0] + Math.sin(a) * 0.105 * scale;
      const py = crown[1] + Math.cos(a) * 0.105 * scale;
      box([0.035 * scale, 0.09 * scale, 0.025], red, [px, py, crown[2] + 0.025], {
        rotation: [0, 0, -a],
      });
    }
    part(
      new THREE.CylinderGeometry(0.045 * scale, 0.045 * scale, 0.045, 8),
      teal,
      [crown[0], crown[1], crown[2] + 0.035],
      { dir: [0, 0, 1], axis: "y", rotation: [Math.PI / 2, 0, 0] },
    );
  };

  frontWindow(-0.94, 2.30, 1, false);
  frontWindow(0.94, 2.30, 1, true);

  // Side window on the left flank, with its frame aimed outward along -X.
  const sideFrame = (y: number) => {
    const x = -1.875;
    box([0.08, 0.60, 0.48], ink, [x, y, 0.18]);
    box([0.105, 0.78, 0.075], trim, [x, y, -0.12]);
    box([0.105, 0.78, 0.075], trim, [x, y, 0.48]);
    box([0.105, 0.075, 0.70], trim, [x, y - 0.35, 0.18]);
    box([0.105, 0.075, 0.70], trim, [x, y + 0.35, 0.18]);
    box([0.025, 0.60, 0.035], teal, [x - 0.05, y, 0.18]);
    box([0.025, 0.035, 0.48], teal, [x - 0.05, y, 0.18]);
    for (const z of [-0.12, 0.48]) {
      part(
        new THREE.CylinderGeometry(0.105, 0.105, 0.035, 10),
        trim,
        [x - 0.06, y + 0.42, z],
        { dir: [-1, 0, 0], axis: "y", rotation: [0, 0, Math.PI / 2] },
      );
      part(
        new THREE.CylinderGeometry(0.035, 0.035, 0.045, 8),
        red,
        [x - 0.085, y + 0.42, z],
        { dir: [-1, 0, 0], axis: "y", rotation: [0, 0, Math.PI / 2] },
      );
    }
  };
  sideFrame(2.30);

  // -----------------------------------------------------------------------------------------------
  // Wrought bracket and glowing amber lantern beside the door.
  // -----------------------------------------------------------------------------------------------

  rod([0.62, 2.70, 1.92], [0.62, 2.70, 2.10], 0.025, ink);
  rod([0.62, 2.10, 1.92], [0.62, 2.70, 1.92], 0.025, ink);
  part(
    new THREE.CylinderGeometry(0.14, 0.11, 0.22, 8),
    ink,
    [0.68, 2.42, 1.94],
    { dir: [0, 0, 1], axis: "y", rotation: [Math.PI / 2, 0, 0] },
  );
  const lantern = part(
    new THREE.OctahedronGeometry(0.105, 1),
    glowColor,
    [0.68, 2.42, 2.015],
  );
  glow(lantern, 1.8);
  box([0.22, 0.025, 0.025], gold, [0.68, 2.30, 2.035]);
  box([0.22, 0.025, 0.025], gold, [0.68, 2.54, 2.035]);
  cylinder(0.035, 0.05, gold, [0.68, 2.57, 2.015], {
    dir: [0, 0, 1],
    axis: "y",
    rotation: [Math.PI / 2, 0, 0],
  });

  // Small threshold plank and decorative nail heads.
  box([0.90, 0.08, 0.18], plank, [0, 1.56, 1.90]);
  for (const x of [-0.39, 0.39]) {
    part(
      new THREE.SphereGeometry(0.025, 6, 4),
      gold,
      [x, 1.61, 1.995],
    );
  }
}
    return buildCabin;
  })(),
  // roof
  (() => {
function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const red = P.roofRed;
  const dark = P.roofDark;
  const trim = P.trim;
  const gold = P.gold;
  const plank = P.plank;
  const ink = P.inkDark;
  const teal = P.paintTeal;
  const paintRed = P.paintRed;
  const smoke = P.smoke;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: any = {},
  ) => b.part(geometry, color, { bone, at, ...options });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: any = {},
  ) => part(new THREE.BoxGeometry(...size), color, at, options);

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: any = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius * 0.94, height, 8),
      color,
      at,
      options,
    );

  // Dark structural roof planes beneath the shingles.
  b.frustumBox(
    [-2.14, 3.04, 2.08],
    [2.14, 4.98, 0],
    [0.1, 0.14],
    [0.1, 0.14],
    { bone, color: dark, section: "box", skin: "rigid", name: "roofPlaneFront" },
  );
  b.frustumBox(
    [-2.14, 3.04, -2.08],
    [2.14, 4.98, 0],
    [0.1, 0.14],
    [0.1, 0.14],
    { bone, color: dark, section: "box", skin: "rigid", name: "roofPlaneBack" },
  );

  // Overlapping rows of chunky hand-split red shingles.
  const rows = 8;
  const columns = 10;
  for (const side of [1, -1]) {
    for (let row = 0; row < rows; row++) {
      const t0 = row / rows;
      const t1 = Math.min(1, (row + 1.12) / rows);
      const z0 = side * (2.1 * (1 - t0));
      const z1 = side * (2.1 * (1 - t1));
      const y0 = 3.09 + 1.91 * t0;
      const y1 = 3.09 + 1.91 * t1;

      for (let col = 0; col < columns; col++) {
        const x0 = -2.14 + (4.28 * col) / columns + 0.018;
        const x1 = -2.14 + (4.28 * (col + 1)) / columns - 0.026;
        const color = row === 0 || (row + col) % 6 === 0 ? dark : red;

        b.frustumBox(
          [x0, y0, z0],
          [x1, y1, z1],
          [0.012, 0.09],
          [0.012, 0.09],
          {
            bone,
            color,
            section: "box",
            skin: "rigid",
            name: "roofShingle",
          },
        );

        if ((row * 5 + col) % 9 === 0) {
          b.rod(
            [x0 + 0.045, y0 + 0.092, z0],
            [x1 - 0.045, y1 + 0.092, z1],
            0.009,
            { bone, color: gold, name: "shinglePaint" },
          );
        }
      }
    }
  }

  // Thick cream eaves and ridge cap.
  box([4.42, 0.15, 0.18], [0, 3.02, 2.1], trim, { name: "frontEave" });
  box([4.42, 0.15, 0.18], [0, 3.02, -2.1], trim, { name: "backEave" });
  b.rod([-2.18, 5.02, 0], [2.18, 5.02, 0], 0.125, {
    bone,
    color: trim,
    section: "box",
    name: "ridgeCap",
  });

  // Small gold ridge studs.
  b.along(
    polyline([
      [-2.0, 5.05, 0],
      [-1.2, 5.1, 0],
      [0, 5.13, 0],
      [1.2, 5.1, 0],
      [2.0, 5.05, 0],
    ]),
    9,
    (p: any) =>
      b.spike(p, p, 0.12, 0.035, {
        bone,
        color: gold,
        name: "ridgeStud",
      }),
  );

  // Fronton triangle beneath the front roof slope.
  b.extrude(
    [
      [-1.92, 3.03],
      [1.92, 3.03],
      [0, 4.9],
    ] as any,
    {
      at: [0, 0, 1.93],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.1,
      bone,
      color: plank,
      name: "frontGable",
    },
  );

  // Cream carved triangular gable frame.
  b.rod([-1.94, 3.03, 2.01], [0, 4.92, 2.01], 0.05, {
    bone,
    color: trim,
    name: "gableFrameL",
  });
  b.rod([1.94, 3.03, 2.01], [0, 4.92, 2.01], 0.05, {
    bone,
    color: trim,
    name: "gableFrameR",
  });
  b.rod([-1.94, 3.03, 2.01], [1.94, 3.03, 2.01], 0.05, {
    bone,
    color: trim,
    name: "gableFrameBase",
  });

  // Front solar rosette.
  cylinder(0.33, 0.085, [0, 3.84, 2.06], gold, {
    dir: [0, 0, 1],
    axis: "y",
    name: "frontSun",
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x = Math.sin(angle) * 0.43;
    const y = 3.84 + Math.cos(angle) * 0.43;
    b.spike(
      [x, y, 2.08],
      [x, y, 2.19],
      0.11,
      0.043,
      {
        bone,
        color: i % 2 ? paintRed : teal,
        name: "sunRay",
      },
    );
  }

  // Painted folk-horse motifs beside the rosette.
  for (const side of [-1, 1]) {
    b.spike(
      [side * 0.72, 4.17, 2.06],
      [side * 0.72, 4.43, 2.06],
      0.24,
      0.07,
      { bone, color: paintRed, name: "paintedHorse" },
    );
    b.spike(
      [side * 0.72, 4.42, 2.06],
      [side * 0.9, 4.56, 2.06],
      0.16,
      0.035,
      { bone, color: teal, name: "horseEar" },
    );
  }

  // Plain rear gable decoration.
  cylinder(0.18, 0.07, [0, 3.72, -2.06], gold, {
    dir: [0, 0, -1],
    axis: "y",
    name: "rearSun",
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    b.spike(
      [Math.sin(angle) * 0.24, 3.72 + Math.cos(angle) * 0.24, -2.1],
      [Math.sin(angle) * 0.31, 3.72 + Math.cos(angle) * 0.31, -2.16],
      0.08,
      0.025,
      { bone, color: trim, name: "rearSunRay" },
    );
  }

  // Carved konёk horse neck, head and long muzzle.
  b.sweep(
    polyline([
      [0, 4.98, 1.62],
      [0, 5.16, 1.96],
      [0, 5.27, 2.25],
    ]),
    [0.2, 0.13],
    {
      bone,
      color: trim,
      section: { ngon: 6 },
      name: "konokNeck",
    },
  );

  b.sweep(
    polyline([
      [0, 5.23, 2.13],
      [0, 5.3, 2.52],
      [0, 5.22, 2.78],
    ]),
    [0.14, 0.035],
    {
      bone,
      color: trim,
      caps: "point",
      name: "konokMuzzle",
    },
  );

  // Ears and carved eyes.
  for (const side of [-1, 1]) {
    b.spike(
      [side * 0.09, 5.33, 2.2],
      [side * 0.19, 5.61, 2.2],
      0.27,
      0.055,
      { bone, color: trim, name: "konokEar" },
    );
    part(
      new THREE.SphereGeometry(0.043, 6, 4),
      ink,
      [side * 0.105, 5.32, 2.59],
      { scale: [0.75, 1, 0.5], name: "konokEye" },
    );
  }

  // Flax-and-gold mane streaming backward along the ridge.
  for (let i = 0; i < 11; i++) {
    const x = -1.55 + i * 0.31;
    b.spike(
      [x, 5.1 + 0.025 * Math.cos(i), 0.1],
      [x, 5.4 + 0.07 * (i % 2), -0.48],
      0.48,
      0.065,
      {
        bone,
        color: i % 2 ? gold : plank,
        name: "konokMane",
      },
    );
  }

  // Rear chimney built from three irregular stacked logs.
  for (let i = 0; i < 3; i++) {
    box(
      [0.36, 0.25, 0.36],
      [0.92 + (i % 2) * 0.015, 4.17 + i * 0.23, -0.9],
      plank,
      {
        rotation: [0, i * 7, 0],
        name: "chimneyLog",
      },
    );
  }
  box([0.5, 0.1, 0.47], [0.92, 4.55, -0.9], trim, {
    name: "chimneyCap",
  });

  // Three low-poly smoke puffs.
  for (const p of [
    [0.92, 4.78, -0.9],
    [1.08, 4.96, -0.84],
    [0.76, 5.03, -0.94],
  ] as [number, number, number][]) {
    part(new THREE.IcosahedronGeometry(0.17, 0), smoke, p, {
      name: "chimneySmoke",
    });
  }
}
    return buildRoof;
  })(),
  // ground
  (() => {
function buildGround({ b, J, P, M }: Ctx) {
  const R = rng(1847);
  const moss = P.moss;
  const dirt = P.dirt;
  const stone = P.stone;
  const trim = P.trim;
  const plank = P.plank;
  const dark = P.inkDark;
  const red = P.paintRed;
  const claw = P.claw;
  const gold = P.gold;
  const smoke = P.smoke;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, ...opts });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      opts,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    opts: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius * 1.04, height, segments),
      color,
      at,
      opts,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale?: [number, number, number],
  ) =>
    part(
      new THREE.SphereGeometry(radius, 10, 7),
      color,
      at,
      scale ? { scale } : {},
    );

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 8,
  ) =>
    part(
      new THREE.ConeGeometry(radius, height, segments),
      color,
      at,
    );

  // Broad, faceted dirt skirt: the lower layer meets the floor exactly.
  cylinder(2.38, 0.16, dirt, [0, 0.08, 0], 12, {
    scale: [1, 1, 1.03],
  });
  cylinder(2.18, 0.22, dirt, [0, 0.25, 0], 12, {
    scale: [1, 1, 0.98],
  });
  cylinder(1.92, 0.22, moss, [0, 0.46, 0], 12, {
    scale: [1.08, 1, 1.02],
  });
  cylinder(1.65, 0.12, moss, [0, 0.63, 0], 10, {
    scale: [1.04, 1, 0.95],
  });

  // Irregular moss tongues over the brown edge.
  const mossPatches: [number, number, number, number, number, number][] = [
    [-1.85, 0.37, -0.6, 0.5, 0.10, 0.34],
    [-1.45, 0.39, 1.15, 0.62, 0.09, 0.28],
    [-0.55, 0.40, -1.75, 0.48, 0.08, 0.25],
    [0.75, 0.39, -1.9, 0.62, 0.09, 0.26],
    [1.75, 0.38, -0.75, 0.55, 0.08, 0.3],
    [2.0, 0.39, 0.65, 0.42, 0.1, 0.24],
    [-2.05, 0.4, 0.65, 0.4, 0.07, 0.28],
  ];
  for (const [x, y, z, sx, sy, sz] of mossPatches) {
    sphere(0.22, moss, [x, y, z], [sx * 1.8, sy, sz * 1.8]);
  }

  // Small lichen chips and pebbles around the mound.
  const lichen = [P.paintTeal, P.gold, P.trim];
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2;
    const rad = 1.55 + R() * 0.62;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    const y = 0.51 + R() * 0.13;
    sphere(0.035 + R() * 0.035, lichen[i % lichen.length], [x, y, z], [
      1.6,
      0.35,
      1.1,
    ]);
  }

  const stones: [number, number, number, number, number, number][] = [
    [-1.55, 0.42, -1.1, 0.28, 0.23, 0.22],
    [1.62, 0.42, 1.34, 0.34, 0.26, 0.25],
    [-1.95, 0.37, 1.6, 0.2, 0.18, 0.18],
    [1.82, 0.4, -1.35, 0.25, 0.2, 0.18],
    [0.35, 0.43, 2.0, 0.18, 0.17, 0.23],
  ];
  for (const [x, y, z, sx, sy, sz] of stones) {
    sphere(0.22, stone, [x, y, z], [sx / 0.22, sy / 0.22, sz / 0.22]);
  }

  // Birch fence stakes at the back-left, with pointed caps.
  const stakeXs = [-1.82, -1.25];
  for (let i = 0; i < stakeXs.length; i++) {
    const x = stakeXs[i];
    const z = -1.92 + (i % 2) * 0.04;
    cylinder(0.085, 1.15, trim, [x, 1.0, z], 7);
    cone(0.12, 0.28, trim, [x, 1.715, z], 7);

    // Bark bands.
    box([0.018, 0.44, 0.018], dark, [x + 0.06, 0.95, z + 0.055]);
    box([0.018, 0.25, 0.018], dark, [x - 0.055, 1.27, z + 0.055]);

    // Chunky carved skull.
    sphere(0.19, trim, [x, 1.96, z], [1.0, 0.9, 0.82]);
    sphere(0.055, dark, [x - 0.075, 1.99, z + 0.155]);
    sphere(0.055, dark, [x + 0.075, 1.99, z + 0.155]);
    box([0.12, 0.055, 0.028], dark, [x, 1.89, z + 0.16]);
    for (let t = -1; t <= 1; t++) {
      box([0.028, 0.07, 0.035], trim, [x + t * 0.045, 1.84, z + 0.17]);
    }
  }

  // A crooked cross rail behind the stakes.
  box([1.18, 0.075, 0.075], plank, [-1.53, 1.1, -1.91], {
    rotation: [0, 0, -0.08],
  });
  box([1.02, 0.055, 0.055], dark, [-1.53, 0.76, -1.91], {
    rotation: [0, 0, 0.11],
  });

  // Leaning mortar beside the front-right foot, kept away from the door centreline.
  const mortarAt: [number, number, number] = [1.42, 0.9, 1.42];
  cylinder(0.31, 0.58, plank, mortarAt, 10, {
    dir: [0.08, 0.98, -0.12],
  });
  cylinder(0.27, 0.075, dark, [1.42, 1.19, 1.42], 10, {
    dir: [0.08, 0.98, -0.12],
  });
  cylinder(0.2, 0.06, dirt, [1.42, 1.205, 1.42], 10, {
    dir: [0.08, 0.98, -0.12],
  });

  // Carved zig-zag band around the mortar.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = mortarAt[0] + Math.cos(a) * 0.315;
    const z = mortarAt[2] + Math.sin(a) * 0.315;
    box([0.055, 0.075, 0.025], i % 2 ? red : trim, [x, 0.86, z], {
      rotation: [0, -a, i % 2 ? 0.35 : -0.35],
    });
  }

  // Pestle leaning out of the bowl.
  cylinder(0.085, 0.95, plank, [1.22, 1.42, 1.5], 8, {
    dir: [0.28, 0.92, 0.24],
  });
  sphere(0.13, plank, [1.1, 1.84, 1.59], [1, 0.8, 1]);

  // Two red-capped mushrooms at the front edge.
  const mushroom = (x: number, z: number, s: number) => {
    cylinder(0.065 * s, 0.28 * s, trim, [x, 0.68 * s, z], 8);
    sphere(0.22 * s, red, [x, 0.86 * s, z], [1.25, 0.52, 1.15]);
    sphere(0.035 * s, trim, [x - 0.08 * s, 0.92 * s, z + 0.11 * s]);
    sphere(0.028 * s, trim, [x + 0.08 * s, 0.87 * s, z - 0.08 * s]);
  };
  mushroom(-1.15, 1.92, 1.0);
  mushroom(-0.72, 2.04, 0.72);

  // A few flat carved lichen plates give the mound a folk-art silhouette.
  const leaf = (x: number, z: number, rot: number) =>
    part(
      new THREE.CylinderGeometry(0.12, 0.12, 0.025, 6),
      P.paintTeal,
      [x, 0.68, z],
      { rotation: [0, rot, 0], scale: [1.7, 1, 0.55] },
    );
  leaf(-2.05, -0.25, 0.3);
  leaf(1.95, 0.05, -0.7);
  leaf(-1.1, -2.02, 1.1);
  leaf(1.25, -1.85, -0.2);
}
    return buildGround;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,2.3,0], dir: [0,1,0], role: "spine" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.8,1.62,-0.15], dir: [0,-1,0], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.85,0.95,0.2], dir: [0,-1,0.15], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.88,0.35,0.05], dir: [0,-1,0.3], role: "leg" });
  J["toeL"] = b.joint("toeL", { parent: J["ankleL"], at: [0.9,0.1,0.55], dir: [0,0,1], role: "digit" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.8,1.62,-0.15], dir: [0,-1,0], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.85,0.95,0.2], dir: [0,-1,0.15], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.88,0.35,0.05], dir: [0,-1,0.3], role: "leg" });
  J["toeR"] = b.joint("toeR", { parent: J["ankleR"], at: [-0.9,0.1,0.55], dir: [0,0,1], role: "digit" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
