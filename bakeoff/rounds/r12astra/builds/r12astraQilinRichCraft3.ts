import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  paint,
  mix,
  noise,
  gradient,
  grain,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin — Herald of the Pearl Clouds",
  description:
    "An antler-crowned celestial qilin, with jade lamellar scales, split obsidian hooves, amber anime eyes, and a sculpted ivory cloud mane threaded with gold.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "PearlCloudQilin",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(721);
  const C = {
    jade: "#419f98",
    mint: "#81d8c1",
    pale: "#c7eee0",
    deep: "#164e60",
    ink: "#142b43",
    ivory: "#fff0ce",
    pearl: "#fff8e5",
    cloudShadow: "#79b8b4",
    cloudMid: "#c1e2d5",
    gold: "#dfa74d",
    goldLight: "#ffe2a0",
    goldDark: "#9a6439",
    coral: "#e88f84",
    pink: "#f3b9a4",
    sole: "#203344",
  };

  const skin = paint((p, n) => {
    const shade = noise(p, 0.16, 7);
    if (n.y < -0.3) return mix("#b6dace", "#f2e7c6", shade);
    return mix("#358a8c", "#78c8ad", 0.27 + shade * 0.55 + n.y * 0.12);
  });
  const facePaint = paint((p, n) => {
    const light = 0.45 + n.y * 0.18 + noise(p, 0.13, 9) * 0.22;
    return mix("#88cbb9", "#e5f2cf", light);
  });
  const cloudPaint = paint((p, n) =>
    mix("#98c6c1", "#fff4d7", Math.min(1, 0.52 + n.y * 0.25 + n.z * 0.17 + noise(p, 0.12, 2) * 0.2)),
  );
  const goldPaint = paint((p, n) =>
    mix("#ae7940", "#ffe0a0", 0.43 + 0.34 * n.y + noise(p, 0.07, 5) * 0.22),
  );
  const hornPaint = grain("#e9cb8d", "#fff2c8", { size: 0.012, axis: "y", seed: 5 });
  const darkHoof = paint((p, n) =>
    mix("#142b42", "#3b6370", 0.18 + 0.4 * Math.max(n.y, 0) + noise(p, 0.06, 21) * 0.22),
  );

  const eyeTexture = animeEye({
    iris: "#e8aa43",
    irisLight: "#ffe8a2",
    irisDark: "#b9563e",
    ink: C.ink,
    blush: false,
    brow: false,
    size: 512,
  });

  const makeDrawing = (body: string, viewBox = "0 0 100 100") =>
    svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`, { size: 256 });

  const cloudDrawing = makeDrawing(`
    <path d="M15 72 C-1 51 19 24 41 34 C56 5 96 18 92 49
             C89 77 53 83 43 65 C34 48 51 36 65 44
             C76 51 69 66 58 61"
      fill="none" stroke="#669d9e" stroke-width="7" stroke-linecap="round"/>
    <path d="M16 69 C4 48 22 29 42 38 C57 12 92 23 88 49
             C85 71 55 78 46 64 C39 51 52 41 64 47"
      fill="none" stroke="#fff4d6" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M15 79 Q29 87 41 79 M75 26 L79 17 M85 33 L94 29"
      fill="none" stroke="#dfb56b" stroke-width="3.5" stroke-linecap="round"/>
  `);

  const lotusDrawing = makeDrawing(`
    <path d="M50 7 Q63 27 50 48 Q37 27 50 7Z
             M15 30 Q43 28 47 57 Q20 59 15 30Z
             M85 30 Q57 28 53 57 Q80 59 85 30Z
             M23 64 Q40 49 50 69 Q60 49 77 64
             Q68 86 50 92 Q32 86 23 64Z"
      fill="#ffe1a0" stroke="#7f633f" stroke-width="3"/>
    <path d="M50 20 L50 78 M26 42 L43 57 M74 42 L57 57"
      fill="none" stroke="#fff6d1" stroke-width="3"/>
    <circle cx="50" cy="69" r="5" fill="#c97566"/>
  `);

  const scaleDrawing = makeDrawing(`
    <path d="M50 12 L79 44 L50 85 L21 44Z"
      fill="none" stroke="#f9dfa1" stroke-width="5"/>
    <path d="M50 25 L50 67 M36 42 L50 55 L64 42"
      fill="none" stroke="#d2f4d8" stroke-width="3.8" stroke-linecap="round"/>
    <circle cx="50" cy="14" r="4.5" fill="#fff4cf"/>
  `);

  const hoofDrawing = makeDrawing(`
    <path d="M7 83 Q22 60 34 74 Q49 93 64 72 Q82 50 94 72"
      fill="none" stroke="#e4b868" stroke-width="5"/>
    <path d="M16 43 Q34 12 49 40 Q67 8 85 43
             M49 40 L49 76"
      fill="none" stroke="#edce8e" stroke-width="4" stroke-linecap="round"/>
    <path d="M39 43 L49 29 L59 43 L49 57Z" fill="#99ddcc"/>
  `);

  const cheekDrawing = makeDrawing(`
    <path d="M10 70 Q35 35 66 48 Q90 56 78 75 Q65 89 55 74
             Q48 64 59 60"
      fill="none" stroke="#256a75" stroke-width="7" stroke-linecap="round"/>
    <path d="M12 62 Q34 27 66 38 M25 79 Q33 87 43 82"
      fill="none" stroke="#f5d68d" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 32 L30 19 L36 32 L30 42Z" fill="#dc9c55"/>
  `);

  // Skeleton: four planted, separated legs; extended tail; independent lower jaw.
  const hips = b.joint("hips", {
    at: [0, 1.12, -0.48],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.12, -0.63], [0, 1.18, -0.18], [0, 1.25, 0.28], [0, 1.29, 0.52]],
    { parent: hips, names: ["spine1", "spine2", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 1.29, 0.47], [0, 1.51, 0.52], [0, 1.73, 0.66], [0, 1.94, 0.83]],
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3", "poll"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.94, 0.83],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.12;
  const headRegion = b.region({ at: [0, 1.94, 0.83], scale: H, bone: head });
  const hp = (x: number, y: number, z: number) => headRegion.p([x, y, z]);
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.11, 0.08),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp(s * 0.22, 0.1, -0.05),
      dir: [s, 0.5, -0.15],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.15, -0.66],
      [0, 1.16, -1.02],
      [0.09, 1.27, -1.35],
      [0.2, 1.42, -1.62],
      [0.26, 1.59, -1.89],
      [0.25, 1.72, -2.14],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  const legSpecs = [
    { side: 1, front: true, tag: "FL" },
    { side: -1, front: true, tag: "FR" },
    { side: 1, front: false, tag: "HL" },
    { side: -1, front: false, tag: "HR" },
  ];
  const legs = legSpecs.map(({ side: s, front, tag }) => {
    const points = front
      ? [[s * 0.28, 1.25, 0.43], [s * 0.34, 0.76, 0.42], [s * 0.37, 0.31, 0.48], [s * 0.38, 0.15, 0.51]]
      : [[s * 0.28, 1.16, -0.55], [s * 0.38, 0.78, -0.34], [s * 0.39, 0.41, -0.72], [s * 0.4, 0.15, -0.68]];
    const chain = b.chain(`leg${tag}`, points, {
      parent: front ? spine.joints[2] : hips,
      names: front
        ? [`shoulder${tag}`, `elbow${tag}`, `fetlock${tag}`, `foot${tag}`]
        : [`hip${tag}`, `knee${tag}`, `hock${tag}`, `foot${tag}`],
      role: "leg",
      contact: [points[3][0], 0, points[3][2]],
    });
    const toes = [-1, 1].map((d) =>
      b.joint(`toe${tag}${d > 0 ? "Inner" : "Outer"}`, {
        parent: chain.tip!,
        at: [points[3][0] + d * 0.065, 0.11, points[3][2] + 0.045],
        dir: [0, 0, 1],
        role: "digit",
      }),
    );
    return { s, front, tag, points, chain, toes };
  });

  type Fill = string | Paint;
  const ellipsoid = (
    at: number[] | THREE.Vector3,
    scale: number[],
    color: Fill,
    bone: Joint,
    name: string,
    segments = 12,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, scale, bone, name, flat: true,
    });
  const bead = (at: number[] | THREE.Vector3, r: number, color: Fill, bone: Joint, name: string) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, { at, bone, name });

  // The compact deer-dragon body and upright, proud neck.
  const torso = b.sweep(spine, (t) => [
    0.285 + Math.sin(t * Math.PI) * 0.065,
    0.33 + Math.sin(t * Math.PI) * 0.035,
  ], {
    color: skin,
    sides: 12,
    caps: "round",
    name: "jadeBarrel",
  });
  const neckTube = b.sweep(neck, (t) => [
    0.25 - 0.066 * t,
    0.255 - 0.06 * t,
  ], {
    color: skin,
    sides: 10,
    caps: "round",
    name: "proudNeck",
  });
  b.sweep(neckTube.line(180, 0.005).slice(0.08, 0.86), [0.135, 0.095], {
    bone: neck,
    color: cloudPaint,
    sides: 8,
    name: "throatPearl",
  });

  // Settle the face before building its crown and mane.
  const skull = ellipsoid(hp(0, 0.025, 0.035), [H * 0.267, H * 0.254, H * 0.285], facePaint, head, "deerDragonSkull", 16);
  const upperMuzzle = ellipsoid(hp(0, -0.098, 0.285), [H * 0.181, H * 0.117, H * 0.229], cloudPaint, head, "upperMuzzle", 12);
  ellipsoid(hp(0, -0.182, 0.254), [H * 0.167, H * 0.064, H * 0.226], C.deep, jaw, "mouthInterior", 12);
  const lowerJaw = ellipsoid(hp(0, -0.208, 0.253), [H * 0.17, H * 0.063, H * 0.222], facePaint, jaw, "lowerJaw", 12);
  ellipsoid(hp(0, -0.079, 0.45), [H * 0.145, H * 0.071, H * 0.062], C.jade, head, "velvetNose");

  for (const s of [-1, 1]) {
    b.decal(skull, eyeTexture, {
      at: hp(s * 0.172, 0.057, 0.231),
      dir: [s * 0.48, 0.05, 1],
      size: [H * 0.155, H * 0.211],
      mirror: s > 0,
      bone: head,
      name: `amberEye${s > 0 ? "L" : "R"}`,
    });
    const noseHit = b.surface(upperMuzzle).nearest(hp(s * 0.124, -0.062, 0.462));
    b.stick(new THREE.SphereGeometry(1, 8, 6), C.deep, noseHit, {
      scale: [0.031, 0.009, 0.016],
      embed: 0.2,
      name: "nostril",
    });
    b.sweep(
      catmull([
        hp(s * 0.09, 0.185, 0.235),
        hp(s * 0.19, 0.198, 0.203),
        hp(s * 0.275, 0.155, 0.11),
        hp(s * 0.321, 0.19, 0.029),
      ]),
      [0.022, 0.029, 0.024, 0],
      { bone: head, color: goldPaint, sides: 6, name: "sweptGoldenBrow" },
    );
    const cheek = ellipsoid(hp(s * 0.225, -0.078, 0.045), [0.083, 0.126, 0.126], C.mint, head, "cheekPlate");
    b.decal(cheek, cheekDrawing, {
      at: hp(s * 0.28, -0.071, 0.105),
      dir: [s * 0.75, 0, 1],
      size: [0.12, 0.13],
      mirror: s > 0,
      bone: head,
      name: "cheekCloudEngraving",
    });
    // Long whiskers, root buried in the upper muzzle; each ends in a gold drop.
    const whiskerTip = hp(s * 0.45, -0.34, 0.46);
    b.sweep(
      bezier(
        hp(s * 0.143, -0.13, 0.38),
        hp(s * 0.43, -0.13, 0.57),
        hp(s * 0.55, -0.29, 0.48),
        whiskerTip,
      ),
      [0.014, 0.005],
      { color: C.goldLight, bone: head, sides: 6, name: "celestialWhisker" },
    );
    bead(whiskerTip, 0.016, C.gold, head, "whiskerPearl");
    b.sweep(
      bezier(hp(s * 0.14, -0.21, 0.32), hp(s * 0.23, -0.26, 0.13), hp(s * 0.19, -0.29, -0.025)),
      [0.028, 0],
      { color: C.pearl, bone: jaw, sides: 6, name: "jawFlame" },
    );
  }
  b.decal(skull, lotusDrawing, {
    at: hp(0, 0.145, 0.263),
    dir: [0, 0.3, 1],
    size: [0.105, 0.154],
    bone: head,
    name: "foreheadLotus",
  });
  glow(bead(hp(0, 0.205, 0.249), 0.026, "#fff1b4", head, "wisdomPearl"), 0.6);

  // Narrow deer ears with thick ivory rims and rose inner leaves.
  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? -1 : 1;
    const ear = ears[i];
    const outline: [number, number][] = [
      [0, -0.045], [0.12, -0.085], [0.29, 0.065],
      [0.35, 0.175], [0.19, 0.16], [0.04, 0.07],
    ];
    b.extrude(outline, {
      at: ear.at,
      x: [s, 0, -0.25],
      y: [0, 1, 0],
      thickness: 0.075,
      smoothing: 1,
      color: cloudPaint,
      bone: ear,
      name: "ivoryEar",
    });
    b.extrude(outline.map(([x, y]) => [x * 0.77 + 0.025, y * 0.62]), {
      at: [ear.at.x, ear.at.y, ear.at.z + 0.046],
      x: [s, 0, -0.25],
      y: [0, 1, 0],
      thickness: 0.012,
      smoothing: 1,
      color: C.coral,
      bone: ear,
      name: "roseEarInset",
    });
    b.sweep(
      [hp(s * 0.25, 0.12, -0.006), hp(s * 0.45, 0.17, -0.05)],
      [0.012, 0],
      { color: C.goldLight, bone: ear, sides: 6, name: "earVein" },
    );
  }

  // Lamellar scales: a gold silhouette under every individual jade shield.
  function shieldGeometry(w: number, l: number, depth: number) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -l * 0.59);
    shape.lineTo(w * 0.46, -l * 0.08);
    shape.lineTo(w * 0.48, l * 0.29);
    shape.lineTo(0, l * 0.44);
    shape.lineTo(-w * 0.48, l * 0.29);
    shape.lineTo(-w * 0.46, -l * 0.08);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: depth * 0.35,
      bevelThickness: depth * 0.35,
      bevelSegments: 1,
      steps: 1,
      curveSegments: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }
  const scaleOuter = shieldGeometry(0.153, 0.204, 0.016);
  const scaleInner = shieldGeometry(0.127, 0.174, 0.017);
  const scaleColors = [C.jade, "#65bca5", "#84ceb2", "#59aa9e"];
  for (const angle of [-108, -68, -28, 28, 68, 108]) {
    const count = Math.abs(angle) > 90 ? 7 : 8;
    for (let i = 0; i < count; i++) {
      const t = 0.07 + (i / (count - 1)) * 0.84 + (Math.abs(angle) === 68 ? 0.025 : 0);
      const hit = torso.at(t, angle);
      b.stick(scaleOuter, goldPaint, hit, {
        embed: 0.32, flow: [0, 0, -1], name: "goldScaleRim",
      });
      b.stick(scaleInner, scaleColors[(i + Math.round(Math.abs(angle) / 20)) % 4], hit.moved([0, 0.011, 0]), {
        embed: 0.12, flow: [0, 0, -1], name: "jadeScale",
      });
    }
  }

  // A few incised heraldic shields, not a noisy all-over texture.
  for (const s of [-1, 1]) {
    for (const t of [0.28, 0.57, 0.83]) {
      const hit = torso.at(t, s * 86);
      b.decal(torso, scaleDrawing, {
        at: hit,
        size: [0.09, 0.12],
        lift: 0.026,
        name: "scaleHeraldry",
      });
    }
  }
  b.along(torso.line(0).slice(0.12, 0.85), 7, (p) => {
    b.spike(p, [0, 1, -0.32], 0.12, 0.047, {
      color: goldPaint,
      sides: 6,
      name: "dorsalCrest",
    });
  });

  // The legs have sturdy upper muscles, fine cannons and deliberately split hooves.
  for (const leg of legs) {
    const { chain, points, front, tag, toes, s } = leg;
    b.sweep(chain, front ? [0.135, 0.105, 0.063, 0.065] : [0.17, 0.125, 0.068, 0.06], {
      color: skin,
      sides: 8,
      caps: "round",
      name: `limb${tag}`,
    });
    const upper = chain.joints[0];
    ellipsoid(points[0], front ? [0.17, 0.24, 0.19] : [0.2, 0.255, 0.23], skin, upper, `haunch${tag}`);
    const knee = chain.joints[1];
    const kneecap = ellipsoid(
      [points[1][0], points[1][1], points[1][2] + 0.08],
      [0.092, 0.115, 0.057],
      goldPaint,
      knee,
      "goldKneeGuard",
    );
    b.decal(kneecap, lotusDrawing, {
      at: [points[1][0], points[1][1], points[1][2] + 0.137],
      dir: [0, 0, 1],
      size: [0.085, 0.12],
      bone: knee,
      name: "kneeLotus",
    });
    const foot = chain.tip!;
    const [fx, , fz] = points[3];
    b.part(new THREE.CylinderGeometry(0.087, 0.095, 0.052, 8), goldPaint, {
      at: [fx, 0.205, fz],
      bone: foot,
      name: "fetlockGoldBand",
    });
    for (let d = 0; d < toes.length; d++) {
      const toe = toes[d];
      const tx = fx + (d === 0 ? -0.065 : 0.065);
      b.extrude(
        [[-0.115, 0], [0.166, 0], [0.157, 0.105], [0.07, 0.175], [-0.085, 0.16]],
        {
          at: [tx, 0, fz],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.115,
          bevel: 0.009,
          color: darkHoof,
          bone: toe,
          name: "clovenHoof",
        },
      );
      b.part(new THREE.BoxGeometry(0.116, 0.028, 0.253), C.goldDark, {
        at: [tx, 0.018, fz + 0.02],
        bone: toe,
        name: "hoofSoleRim",
      });
      b.part(new THREE.PlaneGeometry(0.089, 0.097), "#ffffff", {
        at: [tx, 0.076, fz + 0.163],
        dir: [0, 0, 1],
        axis: "z",
        texture: hoofDrawing,
        bone: toe,
        name: "hoofFiligree",
      });
    }
    b.spike([fx, 0.29, fz - 0.05], [0, -0.4, -1], 0.085, 0.028, {
      color: C.goldLight,
      bone: chain.joints[2],
      sides: 6,
      name: "dewclaw",
    });

    // Three lifted, backward-pointing cloud feathers at each fetlock.
    for (let i = 0; i < 3; i++) {
      const x = fx + s * (0.035 + i * 0.018);
      b.sweep(
        catmull([
          [x, 0.32 + i * 0.045, fz - 0.035],
          [x + s * 0.04, 0.35 + i * 0.06, fz - 0.13],
          [x + s * 0.05, 0.43 + i * 0.065, fz - 0.21],
          [x + s * 0.025, 0.49 + i * 0.065, fz - 0.19],
        ]),
        [0.048, 0.052, 0.031, 0],
        { color: i === 0 ? C.cloudShadow : cloudPaint, bone: chain.joints[2], sides: 7, name: "fetlockCloud" },
      );
    }
  }

  // A sculpted scroll lock: wide faceted cloud mass with a smaller gold-edged curl.
  function cloudLock(
    center: number[] | THREE.Vector3,
    width: number,
    height: number,
    s: number,
    bone: Joint,
    name: string,
  ) {
    const p = center instanceof THREE.Vector3 ? center : new THREE.Vector3(...center as [number, number, number]);
    const q = (x: number, y: number, z = 0) =>
      new THREE.Vector3(p.x + x * width * s, p.y + y * height, p.z + z);
    const path = catmull([
      q(-0.17, -0.4),
      q(-0.32, -0.02),
      q(-0.15, 0.36),
      q(0.22, 0.43),
      q(0.43, 0.12),
      q(0.27, -0.12),
      q(0.07, -0.03),
      q(0.13, 0.14),
    ]);
    const lock = b.sweep(path, [width * 0.31, width * 0.35, width * 0.28, width * 0.24, width * 0.16, 0.006], {
      color: cloudPaint,
      bone,
      sides: 8,
      name,
    });
    const stripePath = b.surface(lock).drape(catmull([
      q(-0.23, -0.28, width),
      q(-0.22, 0.12, width),
      q(0.03, 0.33, width),
      q(0.31, 0.24, width),
      q(0.3, 0.015, width),
      q(0.14, 0.0, width),
    ]), { lift: 0.004 });
    b.sweep(stripePath, [0.009, 0.005], {
      bone, color: C.goldLight, sides: 5, name: `${name}GoldThread`,
    });
    return lock;
  }

  // Mane silhouette: an uninterrupted teal under-mane, then broad ivory scrolls.
  b.sweep(
    catmull([[0, 2.13, 0.69], [0, 1.98, 0.37], [0, 1.73, 0.26], [0, 1.42, 0.1], [0, 1.25, -0.15]]),
    [0.16, 0.225, 0.24, 0.2, 0.06],
    { bone: neck, color: C.cloudShadow, sides: 8, name: "maneUndersilhouette" },
  );
  for (const s of [-1, 1]) {
    const locks = [
      { p: [s * 0.16, 2.12, 0.6], w: 0.24, h: 0.33, bone: head },
      { p: [s * 0.22, 1.98, 0.4], w: 0.27, h: 0.36, bone: neck.joints[2] },
      { p: [s * 0.25, 1.78, 0.24], w: 0.29, h: 0.38, bone: neck.joints[1] },
      { p: [s * 0.28, 1.56, 0.13], w: 0.32, h: 0.36, bone: neck.joints[0] },
      { p: [s * 0.32, 1.37, 0.04], w: 0.28, h: 0.3, bone: spine.joints[2] },
    ];
    locks.forEach((v, i) => cloudLock(v.p, v.w, v.h, s, v.bone, `maneScroll${s > 0 ? "L" : "R"}${i}`));

    const shoulderPuff = ellipsoid(
      [s * 0.32, 1.4, 0.44],
      [0.16, 0.18, 0.14],
      cloudPaint,
      spine.joints[2],
      "shoulderCloudPuff",
    );
    b.decal(shoulderPuff, cloudDrawing, {
      at: [s * 0.37, 1.41, 0.57],
      dir: [s * 0.5, 0, 1],
      size: [0.2, 0.2],
      mirror: s > 0,
      bone: spine.joints[2],
      name: "shoulderCloudCalligraphy",
    });
    cloudLock([s * 0.19, 1.7, 0.82], 0.18, 0.28, -s, neck.joints[2], "throatScroll");
  }
  // Forelock kept above the eyes; chin beard belongs entirely to the jaw.
  cloudLock([0, 2.19, 0.91], 0.23, 0.25, 1, head, "foreheadCloudCurl");
  b.sweep(
    catmull([hp(0, -0.24, 0.24), hp(0, -0.36, 0.21), hp(0, -0.43, 0.29), hp(0, -0.42, 0.39)]),
    [0.076, 0.068, 0.038, 0],
    { color: cloudPaint, bone: jaw, sides: 8, name: "pearlChinBeard" },
  );
  b.decal(lowerJaw, cheekDrawing, {
    at: hp(0, -0.235, 0.402),
    dir: [0, -0.2, 1],
    size: [0.12, 0.055],
    bone: jaw,
    name: "chinMark",
  });

  // Branching antlers: ivory beams, gold sockets, and long, cleanly separated tines.
  for (const s of [-1, 1]) {
    const A = (x: number, y: number, z: number) => hp(s * x, y, z);
    const antlerPath = catmull([
      A(0.16, 0.205, -0.035),
      A(0.205, 0.38, -0.1),
      A(0.29, 0.58, -0.21),
      A(0.4, 0.76, -0.33),
      A(0.45, 0.92, -0.34),
      A(0.42, 1.02, -0.27),
    ]);
    const antler = b.sweep(antlerPath, [0.068, 0.058, 0.045, 0.032, 0.018, 0], {
      color: gradient(hornPaint, C.goldLight, A(0.2, 0.4, -0.1), A(0.4, 0.94, -0.3)),
      bone: head,
      sides: 7,
      name: "antlerBeam",
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.084, 0.053, 10), goldPaint, {
      at: A(0.171, 0.249, -0.05),
      dir: [s * 0.3, 1, -0.3],
      bone: head,
      name: "antlerCoronet",
    });
    b.ring(frame(A(0.171, 0.257, -0.05), [s * 0.3, 1, -0.3]), {
      count: 7,
      radius: 0.077,
    }, (p) => bead(p.at, 0.015, C.goldLight, head, "coronetPearl"));

    const branches = [
      [A(0.215, 0.4, -0.115), A(0.33, 0.49, 0.015), A(0.35, 0.67, 0.045), A(0.3, 0.76, 0.045)],
      [A(0.29, 0.58, -0.21), A(0.49, 0.63, -0.17), A(0.59, 0.79, -0.19), A(0.57, 0.9, -0.14)],
      [A(0.39, 0.75, -0.32), A(0.54, 0.77, -0.46), A(0.65, 0.9, -0.48), A(0.67, 0.98, -0.42)],
    ];
    branches.forEach((path, i) => {
      b.sweep(catmull(path), [0.041 - i * 0.005, 0.031, 0.018, 0], {
        color: hornPaint,
        bone: head,
        sides: 6,
        name: `antlerTine${i}`,
      });
    });
    b.sweep(
      catmull([A(0.49, 0.63, -0.17), A(0.5, 0.76, -0.04), A(0.47, 0.86, 0.005)]),
      [0.027, 0.018, 0],
      { color: C.goldLight, bone: head, sides: 6, name: "antlerFork" },
    );
    // Gold seams continue the ornament of the scales into the antler roots.
    b.sweep(antler.line(10, 0.002).slice(0.04, 0.36), [0.007, 0.003], {
      color: C.gold,
      bone: head,
      sides: 5,
      name: "antlerInlay",
    });
  }

  // Long scaled tail with a floating-cloud brush, fully attached and rigged.
  const tailTube = b.sweep(tail, [0.14, 0.12, 0.085, 0.06, 0.035, 0.018], {
    color: skin,
    sides: 8,
    name: "serpentineTail",
  });
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.078;
    const hit = tailTube.at(t, 0);
    const k = 1 - t * 0.52;
    b.stick(scaleOuter, goldPaint, hit, {
      scale: [k, k, k],
      embed: 0.35,
      flow: [0, 0.4, -1],
      name: "tailScaleRim",
    });
    b.stick(scaleInner, i % 2 ? C.mint : C.jade, hit.moved([0, 0.009, 0]), {
      scale: [k, k, k],
      embed: 0.2,
      flow: [0, 0.4, -1],
      name: "tailScale",
    });
  }
  const tailEndBone = tail.joints[tail.joints.length - 1];
  const brushBase = tail.at(0.8).at;
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        brushBase,
        [0.25 + s * 0.14, 1.64, -1.98],
        [0.25 + s * 0.23, 1.8, -2.13],
        [0.25 + s * 0.23, 1.94, -2.3],
        [0.25 + s * 0.11, 1.99, -2.38],
      ]),
      [0.085, 0.13, 0.125, 0.078, 0],
      { color: s > 0 ? cloudPaint : C.cloudMid, bone: tailEndBone, sides: 8, name: "tailCloudPlume" },
    );
    cloudLock(
      [0.25 + s * 0.17, 1.78, -2.12],
      0.25,
      0.36,
      s,
      tailEndBone,
      "tailCloudScroll",
    );
  }
  b.sweep(
    catmull([[0.25, 1.69, -2.05], [0.25, 1.91, -2.17], [0.25, 2.09, -2.36], [0.25, 2.12, -2.54]]),
    [0.115, 0.135, 0.075, 0],
    { color: cloudPaint, bone: tailEndBone, sides: 8, name: "tailCentralFlame" },
  );

  // Tiny, restrained jewellery on the upper chest.
  const chestSurface = b.surface(neckTube);
  const necklace = chestSurface.drape(catmull([
    [0.23, 1.54, 0.66],
    [0.15, 1.42, 0.76],
    [0, 1.38, 0.8],
    [-0.15, 1.42, 0.76],
    [-0.23, 1.54, 0.66],
  ]), { lift: 0.013 });
  b.sweep(necklace, 0.014, {
    color: goldPaint,
    bone: neck.joints[0],
    sides: 6,
    name: "crescentChestChain",
  });
  b.along(necklace, 7, (p) => {
    bead(p.at, 0.022 + random() * 0.004, C.goldLight, neck.joints[0], "chestPearl");
  });
  const pendantAt = chestSurface.nearest([0, 1.37, 0.85]);
  b.stick(new THREE.OctahedronGeometry(0.07, 0), goldPaint, pendantAt, {
    scale: [0.76, 0.5, 1.2],
    embed: 0.05,
    name: "lotusPendantSetting",
  });
  glow(
    b.stick(new THREE.OctahedronGeometry(0.044, 0), "#b9ffe3", pendantAt.moved([0, 0.035, 0]), {
      scale: [0.75, 0.42, 1.2],
      embed: 0.08,
      name: "celestialJadePendant",
    }),
    0.65,
  );

  return b.root;
}
