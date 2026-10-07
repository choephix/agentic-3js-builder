```ts
import * as THREE from "three";
import {
  createBuilder, frame, aim, catmull, rng, paint, mix, noise,
  gradient, interpolate, svg,
  type Fill, type JointRef, type Chain,
} from "agentic-3js-builder";

export const meta = {
  name: "Moonmilk — Unicorn Foal",
  description: "A long-legged, pearl-coated unicorn foal with a little spiralled golden horn, pastel ribbon mane, bright sea-glass eyes, and violet hooves.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Moonmilk", detail: 0.8, paintSize: 1024 });
  const random = rng(37);
  const C = {
    ivory: "#f5e8ed",
    cream: "#fff1dd",
    white: "#fffaf0",
    lilac: "#c5b6dc",
    lavender: "#b9a8e0",
    maneShade: "#9981b1",
    rose: "#dea1b4",
    pink: "#efc2cc",
    mint: "#9ed5cb",
    teal: "#62aaa7",
    gold: "#dba852",
    goldLight: "#ffdf97",
    ink: "#342a43",
    nostril: "#79596c",
    eyelid: "#b69aad",
    hoof: "#867193",
    sole: "#5e4d6c",
  };

  // Skeleton first. The feet are spread, the ears are open, and the tail is
  // extended behind the body rather than folded against it.
  const hips = b.joint("hips", {
    at: [0, 0.80, -0.28], dir: [0, 0, 1], role: "spine",
  });
  const spine = b.chain("spine", [
    [0, 0.80, -0.28], [0, 0.825, 0.02], [0, 0.855, 0.32],
  ], {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
    up: [0, 1, 0],
  });
  const neck = b.chain("neck", [
    [0, 0.87, 0.32], [0, 1.045, 0.405], [0, 1.245, 0.565],
  ], {
    parent: spine.tip!, names: ["neck1", "neck2", "poll"], role: "neck",
    up: [0, 0, -1],
  });
  const head = b.joint("head", {
    parent: neck.tip!, at: [0, 1.255, 0.60],
    dir: [0, -0.22, 1], up: [0, 1, 0], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.105, 0.645],
    dir: [0, 0, 1], up: [0, 1, 0], role: "jaw",
  });

  const ears = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    return {
      s, side,
      joint: b.joint(`ear${side}`, {
        parent: head, at: [s * 0.125, 1.342, 0.545],
        dir: [s * 0.39, 0.92, 0.075],
        up: [0, 0, 1], role: "hinge",
      }),
    };
  });

  type Leg = {
    s: number;
    side: string;
    front: boolean;
    chain: Chain;
    foot: THREE.Vector3;
  };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const f = new THREE.Vector3(s * 0.205, 0.075, 0.385);
    const front = b.chain(`foreleg${side}`, [
      [s * 0.158, 0.825, 0.285],
      [s * 0.177, 0.565, 0.275],
      [s * 0.190, 0.325, 0.325],
      [s * 0.202, 0.148, 0.350],
      f,
    ], {
      parent: spine.tip!, role: "leg",
      names: [`shoulder${side}`, `elbow${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`],
      contact: [f.x, 0, f.z + 0.015], up: [0, 0, 1],
    });
    legs.push({ s, side, front: true, chain: front, foot: f });

    const h = new THREE.Vector3(s * 0.215, 0.075, -0.295);
    const hind = b.chain(`hindleg${side}`, [
      [s * 0.162, 0.805, -0.285],
      [s * 0.197, 0.565, -0.170],
      [s * 0.209, 0.325, -0.405],
      [s * 0.214, 0.148, -0.340],
      h,
    ], {
      parent: hips, role: "leg",
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
      contact: [h.x, 0, h.z + 0.015], up: [0, 0, 1],
    });
    legs.push({ s, side, front: false, chain: hind, foot: h });
  }

  const tail = b.chain("tail", catmull([
    [0, 0.905, -0.435],
    [0, 0.926, -0.570],
    [0.018, 0.865, -0.785],
    [0.026, 0.745, -0.997],
    [0.020, 0.620, -1.155],
  ]), {
    parent: hips, count: 4,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail", up: [0, 1, 0],
  });

  // A quiet pearly coat: the texture is mostly broad colour, not noisy detail.
  const coat = paint((p, n) => {
    const shade = 0.14 + 0.12 * Math.max(0, -n.y)
      + 0.065 * (1 - noise(p, 0.28, 11));
    return mix(C.ivory, C.lilac, shade);
  });
  const legCoat = paint((p, n) =>
    p.y < 0.225 ? mix(C.white, C.ivory, 0.20) : coat.at(p, n)
  );
  const faceCoat = paint((p, n) => {
    const width = 0.018 + 0.014 * Math.max(0, Math.min(1, (p.y - 1.13) / 0.22));
    if (p.z > 0.705 && n.z > 0.16 && Math.abs(p.x) < width) return C.white;
    return coat.at(p, n);
  });
  const muzzleCoat = gradient("#edcdd0", "#fff0df", [0, 1.04, 1], [0, 1.19, 1]);
  const hoofCoat = gradient(C.sole, C.hoof, [0, 0, 0], [0, 0.105, 0]);

  const sphere = new THREE.SphereGeometry(1, 10, 6);
  function ellipsoid(
    name: string, at: THREE.Vector3 | number[],
    scale: number[], color: Fill, bone: JointRef,
    quat?: THREE.Quaternion,
  ) {
    return b.part(sphere, color, {
      name, at, scale, bone, quat, flat: true,
    });
  }

  const body = b.loft([
    { at: [0, 0.795, -0.425], w: 0.275, h: 0.300 },
    { at: [0, 0.810, -0.290], w: 0.405, h: 0.405 },
    { at: [0, 0.815, -0.075], w: 0.425, h: 0.415 },
    { at: [0, 0.840, 0.140], w: 0.372, h: 0.382 },
    { at: [0, 0.860, 0.310], w: 0.325, h: 0.385 },
    { at: [0, 0.847, 0.405], w: 0.235, h: 0.282 },
  ], {
    name: "pearlBarrel", bone: [hips, spine], color: coat,
    sides: 10, smooth: false, up: [0, 1, 0], caps: "round",
  });

  const neckSkin = b.loft([
    { at: [0, 0.865, 0.320], w: 0.300, h: 0.330 },
    { at: [0, 0.982, 0.365], w: 0.258, h: 0.295 },
    { at: [0, 1.116, 0.460], w: 0.231, h: 0.270 },
    { at: [0, 1.253, 0.568], w: 0.252, h: 0.232 },
  ], {
    name: "uprightFoalNeck", bone: neck, color: coat,
    sides: 10, smooth: false, up: [0, 0, -1], caps: "round",
  });

  const skull = b.loft([
    { at: [0, 1.245, 0.535], w: 0.278, h: 0.260 },
    { at: [0, 1.260, 0.660], w: 0.340, h: 0.290 },
    { at: [0, 1.220, 0.770], w: 0.312, h: 0.250 },
    { at: [0, 1.160, 0.880], w: 0.252, h: 0.186 },
    { at: [0, 1.122, 0.993], w: 0.251, h: 0.132 },
  ], {
    name: "upperJawAndForehead", color: faceCoat, bone: head,
    up: [0, 1, 0], sides: 10, smooth: false,
    caps: { start: "round", end: "flat" },
  });
  const muzzle = b.loft([
    { at: [0, 1.122, 0.953], w: 0.283, h: 0.142 },
    { at: [0, 1.120, 1.075], w: 0.274, h: 0.125 },
  ], {
    name: "velvetUpperMuzzle", color: muzzleCoat, bone: head,
    up: [0, 1, 0], sides: 10, smooth: false,
    caps: { start: "round", end: "flat" },
  });

  b.extrude([
    [-0.120, -0.010], [-0.060, -0.095], [0.170, -0.133],
    [0.300, -0.120], [0.355, -0.090], [0.350, -0.058],
    [0.200, -0.058], [0.050, -0.002],
  ], {
    name: "separateLowerJaw", at: [0, 1.110, 0.720],
    bone: jaw, color: muzzleCoat,
    thickness: [0.220, 0.263], bevel: 0.011, detail: 0.5,
  });
  b.loft([
    { at: [0, 1.052, 0.918], w: 0.235, h: 0.011 },
    { at: [0, 1.053, 1.074], w: 0.246, h: 0.013 },
  ], {
    name: "quietMouthOpening", color: C.nostril, bone: jaw,
    sides: 8, smooth: false, caps: "flat", up: [0, 1, 0],
  });

  // Long, lightly knuckled foal legs and single, solid equine hooves.
  for (const leg of legs) {
    const { chain, foot, front, side, s } = leg;
    const label = `${front ? "F" : "H"}${side}`;
    const radii = front
      ? [0.065, 0.049, 0.039, 0.029, 0.035]
      : [0.090, 0.058, 0.040, 0.030, 0.036];
    b.sweep(chain, (t) => {
      const r = interpolate([0, 0.28, 0.58, 0.85, 1], radii, t);
      return [r, r * (front ? 1.08 : 1.13)] as [number, number];
    }, {
      name: `legSkin${label}`, color: legCoat, sides: 7, smooth: false,
      caps: "round",
    });

    ellipsoid(`upperMuscle${label}`,
      [s * (front ? 0.153 : 0.151), front ? 0.766 : 0.742, front ? 0.287 : -0.292],
      front ? [0.072, 0.125, 0.082] : [0.089, 0.151, 0.113],
      coat, chain.joints[0]);

    const knuckle = chain.joints[2];
    ellipsoid(`knobblyJoint${label}`, knuckle.at,
      front ? [0.044, 0.050, 0.049] : [0.041, 0.046, 0.048],
      legCoat, knuckle);
    ellipsoid(`fetlock${label}`, chain.joints[3].at,
      [0.043, 0.049, 0.043], legCoat, chain.joints[3]);

    const hoof = b.extrude([
      [-0.058, 0.000], [0.055, 0.000], [0.077, 0.020],
      [0.058, 0.094], [-0.034, 0.109], [-0.063, 0.073],
    ], {
      name: `singleHoof${label}`, at: [foot.x, 0, foot.z],
      thickness: 0.127, bevel: 0.009, detail: 0.5,
      bone: chain.tip!, color: hoofCoat,
    });
    b.extrude([
      [-0.058, 0.000], [0.055, 0.000],
      [0.076, 0.017], [-0.060, 0.021],
    ], {
      name: `hoofSole${label}`, at: [foot.x, 0, foot.z],
      thickness: 0.129, color: C.sole, bone: chain.tip!,
    });
    ellipsoid(`softCoronet${label}`, [foot.x, 0.110, foot.z - 0.012],
      [0.054, 0.025, 0.054], legCoat, chain.tip!);

    const hoofFace = b.surface(hoof).ray(
      [foot.x - s * 0.017, 0.054, foot.z + 0.3], [0, 0, -1]
    );
    if (hoofFace) {
      b.stick(new THREE.BoxGeometry(0.016, 0.002, 0.035), "#baa6c6", hoofFace, {
        name: `hoofGlint${label}`, flow: [0, 1, 0], spin: s * 12, embed: 0.25,
      });
    }
  }

  // Ears are thin tapered leaves, deliberately angular rather than smooth.
  for (const { joint, side } of ears) {
    const x = joint.dir([1, 0, 0]);
    const y = joint.axis;
    const forward = joint.dir([0, 0, 1]);
    b.extrude([
      [-0.042, 0], [0.042, 0], [0.052, 0.104],
      [0.017, 0.219], [0, 0.246], [-0.031, 0.202], [-0.054, 0.107],
    ], {
      name: `earShell${side}`, at: joint, x, y, bone: joint,
      color: coat, thickness: [0.062, 0.024], bevel: 0.006, detail: 0.5,
    });
    b.extrude([
      [-0.024, 0.035], [0.025, 0.039], [0.032, 0.105],
      [0.007, 0.204], [-0.017, 0.174], [-0.032, 0.103],
    ], {
      name: `pinkEarInterior${side}`,
      at: joint.at.addScaledVector(forward, 0.028),
      x, y, bone: joint, color: C.pink, thickness: 0.007,
    });
    b.extrude([
      [-0.015, 0.041], [0.013, 0.046], [0.003, 0.118], [-0.009, 0.104],
    ], {
      name: `earInteriorFold${side}`,
      at: joint.at.addScaledVector(forward, 0.033),
      x, y, bone: joint, color: C.rose, thickness: 0.003,
    });
  }

  const headSurface = b.surface(skull);
  const muzzleSurface = b.surface(muzzle);

  // Large, side-set horse eyes. Their little layered facets are all solid
  // geometry; the highlights remain legible even without a texture.
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hit = headSurface.nearest([s * 0.25, 1.275, 0.778]);
    const normal = hit.n;
    const eye = b.region({ at: hit, quat: aim(normal, [0, 1, 0], "z"), bone: head });
    b.stick(new THREE.SphereGeometry(1, 10, 6), C.eyelid, hit, {
      name: `eyeSocket${side}`, scale: [0.078, 0.020, 0.088],
      flow: [0, 1, 0], embed: 0.5, flat: true,
    });
    eye.part(sphere, C.white, {
      name: `sclera${side}`, at: [0, 0, 0.023],
      scale: [0.066, 0.073, 0.021], flat: true,
    });
    eye.part(sphere, C.ink, {
      name: `irisRim${side}`, at: [s * 0.004, 0.002, 0.043],
      scale: [0.055, 0.064, 0.019], flat: true,
    });
    eye.part(sphere, C.teal, {
      name: `seaGlassIris${side}`, at: [s * 0.004, -0.003, 0.051],
      scale: [0.046, 0.054, 0.019], flat: true,
    });
    eye.part(sphere, C.ink, {
      name: `pupil${side}`, at: [s * 0.005, 0.008, 0.063],
      scale: [0.034, 0.045, 0.013], flat: true,
    });
    eye.part(sphere, C.mint, {
      name: `irisLowerLight${side}`, at: [-s * 0.018, -0.037, 0.069],
      scale: [0.016, 0.010, 0.005], flat: true,
    });
    eye.part(sphere, C.white, {
      name: `eyeCatchlight${side}`, at: [-0.017, 0.030, 0.077],
      scale: [0.017, 0.021, 0.007], flat: true,
    });
    eye.part(sphere, C.white, {
      name: `eyeSmallCatchlight${side}`, at: [0.021, -0.017, 0.078],
      scale: [0.007, 0.008, 0.005], flat: true,
    });

    b.sweep(catmull([
      eye.p([-0.058, 0.039, 0.042]),
      eye.p([-0.035, 0.070, 0.039]),
      eye.p([0.007, 0.078, 0.035]),
      eye.p([0.048, 0.057, 0.032]),
    ]), 0.0043, {
      name: `upperLid${side}`, color: C.ink, bone: head, sides: 5,
    });
    for (let i = 0; i < 2; i++) {
      const root = eye.p([s * (0.044 + i * 0.012), 0.057 - i * 0.023, 0.038]);
      const tip = eye.p([s * (0.081 + i * 0.007), 0.085 - i * 0.035, 0.043]);
      b.spike(root, tip, null, 0.0038, {
        name: `eyelash${side}${i + 1}`, color: C.ink, bone: head, sides: 5,
      });
    }
    b.sweep(catmull([
      eye.p([-0.047, 0.100, 0.002]),
      eye.p([-0.004, 0.109, 0.009]),
      eye.p([0.042, 0.095, 0.002]),
    ]), [0.005, 0.007, 0.002], {
      name: `gentleBrow${side}`, color: C.eyelid, bone: head, sides: 5,
    });

    const cheek = headSurface.nearest([s * 0.235, 1.185, 0.843]);
    b.stick(new THREE.SphereGeometry(1, 10, 6), C.pink, cheek, {
      name: `blushingCheek${side}`, scale: [0.035, 0.003, 0.022],
      flow: [0, 1, 0], embed: 0.35, flat: true,
    });

    const nostril = muzzleSurface.ray([s * 0.087, 1.139, 1.5], [0, 0, -1]);
    if (nostril) {
      b.stick(new THREE.SphereGeometry(1, 8, 5), C.rose, nostril, {
        name: `nostrilSurround${side}`, scale: [0.025, 0.003, 0.017],
        flow: [0, 1, 0], spin: s * 22, embed: 0.2, flat: true,
      });
      b.stick(new THREE.SphereGeometry(1, 8, 5), C.nostril,
        nostril.moved({ forward: 0.004 }), {
          name: `nostril${side}`, scale: [0.019, 0.005, 0.011],
          flow: [0, 1, 0], spin: s * 22, embed: 0.1, flat: true,
        });
    }
    for (let i = 0; i < 3; i++) {
      const dot = muzzleSurface.ray(
        [s * (0.073 + 0.016 * i), 1.104 + (i % 2) * 0.009, 1.5],
        [0, 0, -1]
      );
      if (dot) b.stick(new THREE.SphereGeometry(1, 6, 4), C.nostril, dot, {
        name: `muzzleFreckle${side}${i + 1}`,
        scale: [0.0028, 0.001, 0.0028], embed: 0.2, flat: true,
      });
    }
  }

  // A budding horn with a real raised conical spiral, not stacked discs.
  const hornHit = headSurface.ray([0, 1.75, 0.742], [0, -1, 0])!;
  const hornBase = hornHit.at;
  const hornAxis = new THREE.Vector3(0, 0.98, 0.20).normalize();
  b.lathe([
    [0, 0], [0.043, 0], [0.052, 0.006], [0.052, 0.016],
    [0.044, 0.024], [0, 0.024],
  ], {
    name: "hornRoot", at: hornBase, axis: hornAxis,
    segments: 8, color: C.gold, bone: head,
  });
  const hornStart = hornBase.clone().addScaledVector(hornAxis, 0.017);
  const hornTip = hornStart.clone().addScaledVector(hornAxis, 0.303);
  b.sweep([hornStart, hornTip], [0.042, 0.0006], {
    name: "goldenHorn", bone: head, sides: 8, smooth: false,
    color: gradient(C.gold, C.goldLight, hornStart, hornTip),
    caps: { start: "flat", end: "point" },
  });
  const hx = new THREE.Vector3(1, 0, 0);
  const hz = hornAxis.clone().cross(hx).normalize();
  const spiralPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 66; i++) {
    const t = (i / 66) * 0.966;
    const a = 2 * Math.PI * (3.05 * t + 0.12);
    const r = 0.042 * (1 - t) + 0.0016;
    spiralPoints.push(hornStart.clone()
      .addScaledVector(hornAxis, 0.303 * t)
      .addScaledVector(hx, Math.cos(a) * r)
      .addScaledVector(hz, Math.sin(a) * r));
  }
  b.sweep(catmull(spiralPoints), (t) => 0.0038 * (1 - 0.72 * t), {
    name: "raisedHornSpiral", color: "#fff0bb", bone: head,
    sides: 5, smooth: false, caps: "round",
  });

  // Mane: broad overlapping, pointed locks, like little carved ribbons.
  b.sweep(neckSkin.line(0, 0.006), (t) =>
    [0.043 + 0.010 * t, 0.030] as [number, number], {
      name: "maneFoundation", color: C.maneShade, bone: neck,
      sides: 6, smooth: false, up: [0, 0, -1],
    });

  const maneColors = [C.lavender, C.rose, C.mint, C.lavender, C.pink, C.mint, C.rose];
  for (let i = 0; i < 7; i++) {
    const t = 0.16 + i * 0.128;
    const root = neckSkin.at(t, 0);
    const p = root.at;
    const lock = b.sweep(catmull([
      root,
      p.clone().add(new THREE.Vector3(0.060, 0.006, -0.035)),
      p.clone().add(new THREE.Vector3(0.112, -0.068, -0.104)),
      p.clone().add(new THREE.Vector3(0.090, -0.165, -0.119)),
    ]), (u) => [
      interpolate([0, 0.30, 0.62, 1], [0.042, 0.060, 0.039, 0.001], u),
      interpolate([0, 0.35, 1], [0.024, 0.032, 0.001], u),
    ] as [number, number], {
      name: `maneRibbonL${i + 1}`, color: maneColors[i], bone: neck,
      sides: 6, smooth: false, up: [0, 0, -1],
      caps: { start: "round", end: "point" },
    });
    if (i % 2 === 0) {
      b.sweep(lock.line(0, 0.001), (u) => 0.0025 * (1 - 0.85 * u), {
        name: `maneRibbonRidge${i + 1}`, color: C.cream,
        bone: neck, sides: 4, smooth: false,
      });
    }
  }
  for (let i = 0; i < 4; i++) {
    const p = neckSkin.at(0.29 + i * 0.19, 0).at;
    b.sweep(catmull([
      p,
      p.clone().add(new THREE.Vector3(-0.050, -0.012, -0.035)),
      p.clone().add(new THREE.Vector3(-0.072, -0.125, -0.095)),
    ]), (u) => [0.033 * (1 - u) + 0.001, 0.019 * (1 - u) + 0.001] as [number, number], {
      name: `maneRibbonR${i + 1}`, color: maneColors[i + 1], bone: neck,
      sides: 6, smooth: false, up: [0, 0, -1],
      caps: { start: "round", end: "point" },
    });
  }

  const forelocks = [
    { x: -0.073, end: -0.077, z: 0.820, color: C.lavender },
    { x: 0.047, end: 0.020, z: 0.869, color: C.rose },
    { x: 0.102, end: 0.118, z: 0.798, color: C.mint },
    { x: -0.012, end: -0.025, z: 0.832, color: C.pink },
  ];
  forelocks.forEach((f, i) => {
    const root = headSurface.nearest([f.x, 1.50, 0.610]);
    b.sweep(catmull([
      root,
      [f.x, 1.408 + i * 0.003, 0.686],
      [(f.x + f.end) * 0.5, 1.365, 0.779],
      [f.end, 1.292 + (i % 2) * 0.022, f.z],
    ]), (u) => [
      interpolate([0, 0.30, 0.65, 1], [0.035, 0.049, 0.031, 0.001], u),
      interpolate([0, 0.35, 1], [0.022, 0.030, 0.001], u),
    ] as [number, number], {
      name: `curledForelock${i + 1}`, color: f.color, bone: head,
      sides: 6, smooth: false, up: [0, 0, 1],
      caps: { start: "round", end: "point" },
    });
  });

  // The horse-tail dock grows into a broad tuft, with independently readable
  // pastel locks riding the tail's bones.
  const tailSkin = b.sweep(tail, [0.041, 0.052, 0.086, 0.079, 0.004], {
    name: "tailDockAndTuft", sides: 7, smooth: false,
    bands: [[0.20, coat], [1, C.maneShade]],
    caps: { start: "round", end: "point" },
  });
  const tailColors = [C.mint, C.lavender, C.rose, C.pink, C.lavender, C.mint, C.cream];
  for (let i = 0; i < 7; i++) {
    const angle = -112 + i * 36;
    const endSpread = (i - 3) * 0.013;
    const points = [
      tailSkin.at(0.18 + (i % 3) * 0.018, angle),
      tailSkin.at(0.43, angle),
      tailSkin.at(0.69, angle),
      tailSkin.at(0.87, angle),
      tail.at(1).at.add(new THREE.Vector3(endSpread, -0.022 - random() * 0.025, -0.020 - (i % 3) * 0.018)),
    ];
    const lock = b.sweep(catmull(points), (u) => [
      interpolate([0, 0.30, 0.65, 1], [0.022, 0.034, 0.033, 0.0005], u),
      interpolate([0, 0.40, 1], [0.019, 0.023, 0.0005], u),
    ] as [number, number], {
      name: `tailRibbon${i + 1}`, color: tailColors[i], bone: tail,
      sides: 6, smooth: false, up: [0, 1, 0],
      caps: { start: "round", end: "point" },
    });
    if (i === 1 || i === 3 || i === 5) {
      b.sweep(lock.line(0, 0.0007), (u) => 0.002 * (1 - 0.8 * u), {
        name: `tailRibbonFineRidge${i + 1}`, color: C.cream,
        bone: tail, sides: 4, smooth: false,
      });
    }
  }

  // A small birthmark-like constellation, painted onto the actual flank.
  const constellation = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
      <path d="M118 40 L128 67 L157 68 L135 87 L142 116
               L118 100 L94 116 L101 87 L79 68 L108 67 Z"
            fill="#d7b3c8" stroke="#fff6df" stroke-width="5" stroke-linejoin="round"/>
      <path d="M118 53 L125 73 L146 75 L130 88 L135 108
               L118 96 L101 108 L106 88 L90 75 L111 73 Z"
            fill="#f5dcaf"/>
      <path d="M160 121 L179 132 L199 107" fill="none"
            stroke="#d5bdde" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="160" cy="121" r="4" fill="#d7b3c8"/>
      <circle cx="179" cy="132" r="5" fill="#f0d5a4"/>
      <circle cx="199" cy="107" r="3.5" fill="#d7b3c8"/>
      <path d="M56 81 L60 91 L70 95 L60 99 L56 109 L52 99 L42 95 L52 91 Z"
            fill="#d5bdde"/>
      <circle cx="72" cy="131" r="3" fill="#f0d5a4"/>
      <circle cx="171" cy="54" r="3" fill="#d7b3c8"/>
    </svg>
  `, { size: 512 });
  const bodySurface = b.surface(body);
  for (const s of [1, -1]) {
    b.decal(bodySurface, constellation, {
      name: `flankConstellation${s === 1 ? "L" : "R"}`,
      at: [s * 0.24, 0.858, -0.155], dir: [s, 0, 0],
      up: [0, 1, 0], size: [0.235, 0.177],
      mirror: s < 0, segments: [8, 6], lift: 0.0012,
    });
  }

  b.material(C.ink).roughness = 0.26;
  b.material(C.teal).roughness = 0.34;
  b.material(C.gold).metalness = 0.32;
  b.material(C.gold).roughness = 0.38;
  b.material("#fff0bb").metalness = 0.18;
  b.material("#fff0bb").roughness = 0.40;

  return b.root;
}
```