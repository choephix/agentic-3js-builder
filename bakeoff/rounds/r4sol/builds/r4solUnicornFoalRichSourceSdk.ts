import * as THREE from "three";
import {
  createBuilder, frame, catmull, polyline, paint, mix, noise, rng,
  type Fill, type JointRef, type PointInput
} from "../../../../src/index";

export const meta = {
  name: "First Steps",
  description: "A pearly newborn unicorn with long, slightly splayed legs, silver hooves, sherbet-colored baby fluff, a little golden spiral horn, and a hand-strung daisy necklace."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "First Steps", detail: 0.8, paintSize: 1024 });
  const random = rng(419);

  const C = {
    ivory: "#fffaf2",
    pearl: "#eee6f4",
    lilac: "#d6c9e5",
    pink: "#edbfd3",
    pinkLight: "#f9dce7",
    pinkLine: "#d99cb9",
    mint: "#b6dfce",
    mintLight: "#def2e4",
    mintLine: "#8fbea9",
    lavender: "#c6b5e4",
    lavenderLight: "#e4daf5",
    lavenderLine: "#a48cc8",
    ear: "#e5bbd5",
    blush: "#efd6e2",
    eyeRim: "#cbbcd6",
    dark: "#241e32",
    iris: "#493750",
    pupil: "#181724",
    nostril: "#73617e",
    mouth: "#99849f",
    silver: "#bdc9dc",
    silverDark: "#8995ae",
    silverLight: "#eef4fc",
    gold: "#dab357",
    goldDark: "#ba8a38",
    goldLight: "#ffdfa0",
    stem: "#88a481",
    leaf: "#b0c8a0",
    petal: "#fffdf0",
    petalShade: "#eee4e6",
    yellow: "#f1cb55",
    yellowLight: "#ffe49a"
  };

  const coat = paint((p, n) => {
    const light = THREE.MathUtils.clamp(
      0.66 + 0.25 * n.y + 0.035 * Math.sin(p.z * 7 + p.y * 3)
      + 0.025 * (noise(p, 0.19, 8) - 0.5), 0, 1
    );
    const pearl = mix("#d5c8e5", "#fffaf3", light);
    return mix(pearl, "#ecfff5", Math.max(0, n.x * n.z) * 0.11);
  });
  const muzzlePaint = paint((p, n) =>
    mix("#d7c9dd", "#faf4f4", THREE.MathUtils.clamp(0.68 + n.y * 0.23, 0, 1))
  );

  for (const col of [C.dark, C.iris, C.pupil]) {
    b.material(col).roughness = 0.19;
    b.material(col).metalness = 0.06;
  }
  b.material(C.silver).metalness = 0.48;
  b.material(C.silver).roughness = 0.3;
  b.material(C.silverDark).metalness = 0.36;
  b.material(C.silverDark).roughness = 0.4;
  for (const col of [C.gold, C.goldDark, C.goldLight]) {
    b.material(col).metalness = 0.56;
    b.material(col).roughness = 0.3;
  }

  // Skeleton first: an open, four-footed baby-horse rest pose.
  const hips = b.joint("hips", {
    at: [0, 0.835, -0.30], dir: [0, 0, 1], role: "spine"
  });
  const spine = b.chain("spine", [
    [0, 0.835, -0.30], [0, 0.855, -0.035], [0, 0.875, 0.225]
  ], {
    parent: hips, names: ["spine1", "chest", "withers"], role: "spine"
  });
  const neck = b.chain("neck", [
    [0, 0.905, 0.265], [0, 1.085, 0.337], [0, 1.267, 0.47]
  ], {
    parent: "withers", names: ["neck1", "neck2", "poll"],
    role: "neck", up: [0, 0, -1]
  });
  const head = b.joint("head", {
    parent: "poll", at: [0, 1.268, 0.553], dir: [0, -0.23, 1], role: "head"
  });
  const upperJaw = b.joint("upperJaw", {
    parent: head, at: [0, 1.178, 0.737], dir: [0, -0.28, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.105, 0.731], dir: [0, -0.31, 1], role: "jaw"
  });
  const ears = [-1, 1].map(s => b.joint(s > 0 ? "earL" : "earR", {
    parent: head, at: [s * 0.118, 1.375, 0.486],
    dir: [s * 0.23, 1, -0.025], role: "hinge"
  }));
  const tail = b.chain("tail", catmull([
    [0, 0.914, -0.475], [0, 0.965, -0.61],
    [0, 0.942, -0.735], [0, 0.893, -0.845]
  ]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail", up: [0, 1, 0]
  });

  const legData = [-1, 1].flatMap(s => {
    const side = s > 0 ? "L" : "R";
    return [
      {
        front: true, s, side, suffix: `F${side}`,
        points: [
          [s * 0.145, 0.859, 0.205],
          [s * 0.162, 0.645, 0.186],
          [s * 0.184, 0.411, 0.251],
          [s * 0.229, 0.139, 0.279],
          [s * 0.237, 0.064, 0.308]
        ],
        names: [`shoulderF${side}`, `elbowF${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`]
      },
      {
        front: false, s, side, suffix: `H${side}`,
        points: [
          [s * 0.148, 0.824, -0.323],
          [s * 0.195, 0.582, -0.217],
          [s * 0.174, 0.342, -0.391],
          [s * 0.234, 0.139, -0.381],
          [s * 0.246, 0.064, -0.340]
        ],
        names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `fetlockH${side}`, `hoofH${side}`]
      }
    ];
  });
  const legs = legData.map(d => ({
    ...d,
    chain: b.chain(`leg${d.suffix}`, d.points, {
      parent: d.front ? "chest" : hips, names: d.names, role: "leg",
      contact: [d.points[4][0], 0, d.points[4][2]], up: [0, 0, 1]
    })
  }));

  const sphere = new THREE.SphereGeometry(1, 10, 7);
  const fluffSphere = new THREE.SphereGeometry(1, 8, 5);
  const eyeSphere = new THREE.SphereGeometry(1, 14, 10);
  const petalSphere = new THREE.SphereGeometry(1, 6, 4);

  function ellipsoid(
    at: PointInput, scale: number[], color: Fill, bone: JointRef,
    name: string, geometry = sphere, flat = true
  ) {
    return b.part(geometry, color, { at, scale, bone, name, flat });
  }

  // Simple faceted volumes with a narrow foal chest and a round little barrel.
  const body = b.loft([
    { at: [0, 0.832, -0.43], w: 0.29, h: 0.34 },
    { at: [0, 0.841, -0.29], w: 0.425, h: 0.445 },
    { at: [0, 0.842, -0.035], w: 0.405, h: 0.425 },
    { at: [0, 0.878, 0.185], w: 0.347, h: 0.415 },
    { at: [0, 0.877, 0.307], w: 0.245, h: 0.30 }
  ], {
    bone: [hips, spine], color: coat, sides: 10, smooth: false, name: "pearlyBarrel"
  });
  const neckSkin = b.loft([
    { at: [0, 0.891, 0.258], w: 0.285, h: 0.335 },
    { at: [0, 1.057, 0.32], w: 0.225, h: 0.268 },
    { at: [0, 1.205, 0.423], w: 0.232, h: 0.255 },
    { at: [0, 1.274, 0.479], w: 0.235, h: 0.235 }
  ], {
    bone: neck, color: coat, sides: 8, smooth: false,
    up: [0, 0, -1], name: "slenderNeck"
  });
  const skull = b.loft([
    { at: [0, 1.272, 0.466], w: 0.274, h: 0.292 },
    { at: [0, 1.278, 0.56], w: 0.327, h: 0.327 },
    { at: [0, 1.235, 0.699], w: 0.263, h: 0.252 },
    { at: [0, 1.171, 0.782], w: 0.183, h: 0.184 }
  ], {
    bone: head, color: coat, sides: 10, smooth: false, up: [0, 1, 0],
    name: "babyForehead"
  });
  const muzzle = b.loft([
    { at: [0, 1.181, 0.741], w: 0.20, h: 0.162 },
    { at: [0, 1.127, 0.852], w: 0.24, h: 0.161 },
    { at: [0, 1.113, 0.94], w: 0.232, h: 0.142 }
  ], {
    bone: upperJaw, color: muzzlePaint, sides: 10, smooth: false,
    up: [0, 1, 0], name: "upperMuzzle"
  });
  b.loft([
    { at: [0, 1.073, 0.742], w: 0.184, h: 0.073 },
    { at: [0, 1.027, 0.851], w: 0.195, h: 0.073 },
    { at: [0, 1.007, 0.938], w: 0.198, h: 0.065 }
  ], {
    bone: jaw, color: coat, sides: 8, smooth: false,
    up: [0, 1, 0], name: "separateLowerJaw"
  });
  const pearlMaterial = body.meshes[0].material as THREE.MeshStandardMaterial;
  pearlMaterial.roughness = 0.43;
  pearlMaterial.metalness = 0.10;

  // Knobbly knees, fine cannons and firmly planted little metallic hooves.
  for (const d of legs) {
    b.sweep(d.chain, d.front
      ? [0.062, 0.044, 0.038, 0.025, 0.034]
      : [0.079, 0.057, 0.040, 0.027, 0.035], {
      color: coat, sides: 8, smooth: false, name: `longLeg${d.suffix}`
    });
    ellipsoid(d.points[2], [0.042, 0.047, 0.041], coat,
      d.names[2], `knobbyJoint${d.suffix}`);
    ellipsoid(d.points[3], [0.034, 0.045, 0.036], coat,
      d.names[3], `softFetlock${d.suffix}`);

    const foot = d.points[4];
    const hoof = b.extrude([
      [-0.064, -0.055], [0.082, -0.055], [0.083, -0.023],
      [0.064, 0.024], [0.034, 0.053], [-0.044, 0.043], [-0.063, 0.016]
    ], {
      at: [foot[0], 0.055, foot[2]], x: [d.s * 0.12, 0, 1], y: [0, 1, 0],
      thickness: 0.105, bevel: 0.009, detail: 0.5,
      color: C.silver, bone: d.names[4], name: `silverHoof${d.suffix}`
    });
    b.extrude([
      [-0.063, -0.055], [0.082, -0.055],
      [0.083, -0.039], [-0.061, -0.039]
    ], {
      at: [foot[0], 0.055, foot[2]], x: [d.s * 0.12, 0, 1], y: [0, 1, 0],
      thickness: 0.108, bevel: 0.002, detail: 0.5,
      color: C.silverDark, bone: d.names[4], name: `hoofSole${d.suffix}`
    });
    const shineHit = b.surface(hoof).ray(
      [foot[0], 0.054, foot[2] + 0.6], [0, 0, -1]
    );
    if (shineHit) {
      b.stick(new THREE.BoxGeometry(0.038, 0.002, 0.006), C.silverLight,
        shineHit, { embed: 0.05, flow: [0, 1, 0], name: `hoofGlint${d.suffix}` });
    }
  }

  // Tall soft ears, their front-facing inner panels nested in the outer shells.
  ears.forEach((ear, i) => {
    const s = i === 0 ? -1 : 1;
    const earUp = [s * 0.23, 1, -0.025];
    b.extrude([
      [0, -0.016], [-0.043, 0.037], [-0.036, 0.125],
      [0, 0.203, "sharp"], [0.037, 0.132], [0.049, 0.050], [0.022, 0.001]
    ], {
      at: ear, x: [1, 0, 0], y: earUp,
      thickness: [0.052, 0.012], bevel: 0.007,
      smoothing: 1, color: coat, bone: ear, name: `earShell${i}`
    });
    b.extrude([
      [0, 0.019], [-0.027, 0.052], [-0.022, 0.117],
      [0, 0.170, "sharp"], [0.023, 0.119], [0.029, 0.058]
    ], {
      at: ear.at.clone().add(new THREE.Vector3(0, 0, 0.025)),
      x: [1, 0, 0], y: earUp, thickness: 0.005,
      smoothing: 1, color: C.ear, bone: ear, name: `velvetInnerEar${i}`
    });
    b.rod(
      ear.at.clone().add(new THREE.Vector3(0, 0.048, 0.031)),
      ear.at.clone().add(new THREE.Vector3(s * 0.019, 0.132, 0.03)),
      [0.0045, 0.0015], { color: C.pinkLight, bone: ear, sides: 5 }
    );
  });

  const skullSurface = b.surface(skull);
  const muzzleSurface = b.surface(muzzle);

  // Large glossy eyes, with lilac rims and individually extended eyelashes.
  for (const s of [-1, 1]) {
    const hit = skullSurface.around([0, 1.245, 0.635]).at(s * 67, 15)!;
    b.stick(eyeSphere, C.eyeRim, hit, {
      scale: [0.075, 0.027, 0.091], embed: 0.32, flow: [0, 1, 0],
      bone: head, name: s > 0 ? "eyeSocketL" : "eyeSocketR"
    });
    const eye = b.stick(eyeSphere, C.dark, hit, {
      scale: [0.067, 0.033, 0.082], embed: 0.23, flow: [0, 1, 0],
      bone: head, name: s > 0 ? "eyeL" : "eyeR"
    });
    const eyeDetail = (at: number[], scale: number[], color: string, name: string) =>
      b.part(eyeSphere, color, {
        at: eye.local(at), quat: eye.quat, scale, bone: head, name
      });
    eyeDetail([0.006, 0.028, -0.009], [0.044, 0.006, 0.057], C.iris, `iris${s}`);
    eyeDetail([-0.003, 0.034, 0.006], [0.030, 0.005, 0.048], C.pupil, `pupil${s}`);
    eyeDetail([-0.023, 0.043, 0.033], [0.014, 0.0035, 0.018], C.ivory, `eyeCatchlight${s}`);
    eyeDetail([0.023, 0.038, -0.030], [0.0055, 0.0025, 0.007], C.lavenderLight, `eyeSpark${s}`);

    b.sweep(catmull([
      eye.local([-0.060, 0.017, 0.037]),
      eye.local([-0.038, 0.023, 0.070]),
      eye.local([0, 0.023, 0.083]),
      eye.local([0.039, 0.022, 0.068]),
      eye.local([0.061, 0.015, 0.033])
    ]), 0.0045, { color: C.dark, bone: head, sides: 6, name: `upperLid${s}` });

    for (let k = 0; k < 4; k++) {
      const u = -0.045 + k * 0.030;
      const v = 0.078 - Math.abs(u) * 0.27;
      const fan = (k - 1.5) * 0.012;
      b.sweep(catmull([
        eye.local([u, 0.024, v]),
        eye.local([u + fan * 0.5, 0.037, v + 0.021]),
        eye.local([u + fan, 0.035, v + 0.043 - Math.abs(k - 1.5) * 0.005])
      ]), [0.0035, 0.0024, 0.0005], {
        color: C.dark, bone: head, sides: 5, smooth: false,
        name: `lash${s > 0 ? "L" : "R"}${k + 1}`
      });
    }

    const cheek = skullSurface.nearest([s * 0.144, 1.169, 0.706]);
    b.stick(fluffSphere, C.blush, cheek, {
      scale: [0.034, 0.0025, 0.020], embed: 0.15,
      flow: [0, 1, 0], bone: head, name: `faintCheekBlush${s}`
    });

    const noseHit = muzzleSurface.nearest([s * 0.098, 1.155, 1.025]);
    const nostril = b.stick(fluffSphere, C.nostril, noseHit, {
      scale: [0.012, 0.005, 0.024], embed: 0.18, spin: s * 24,
      flow: [0, 1, 0], bone: upperJaw, name: `nostril${s}`
    });
    b.sweep(catmull([
      nostril.local([-0.013, 0.006, 0.010]),
      nostril.local([-0.004, 0.008, 0.026]),
      nostril.local([0.010, 0.006, 0.014])
    ]), 0.0028, { color: C.pearl, bone: upperJaw, sides: 5 });

    const lipPoints = [
      [s * 0.098, 1.094, 0.785],
      [s * 0.119, 1.057, 0.857],
      [s * 0.110, 1.043, 0.956]
    ].map(p => {
      const h = muzzleSurface.nearest(p);
      return h.at.addScaledVector(h.n, 0.0015);
    });
    b.sweep(catmull(lipPoints), [0.0021, 0.0025, 0.0014], {
      color: C.mouth, bone: upperJaw, sides: 5, name: `quietMouthLine${s}`
    });
  }

  // A small horn: polygonal gold core and a genuine raised helical ridge.
  const hornHit = skullSurface.ray([0, 2, 0.646], [0, -1, 0])!;
  const hornAxis = new THREE.Vector3(0, 1, 0.115).normalize();
  const hornBase = hornHit.at.clone().addScaledVector(hornAxis, -0.004);
  b.lathe([
    [0, -0.004], [0.032, -0.004], [0.032, 0.008],
    [0.030, 0.012], [0.001, 0.170], [0, 0.171]
  ], {
    at: hornBase, axis: hornAxis, segments: 8,
    color: C.gold, bone: head, name: "littleGoldenHorn"
  });
  b.part(new THREE.TorusGeometry(0.031, 0.0035, 4, 10), C.goldDark, {
    at: hornBase.clone().addScaledVector(hornAxis, 0.003),
    dir: hornAxis, axis: "z", bone: head, name: "hornRootRim", flat: true
  });
  const radialX = new THREE.Vector3(1, 0, 0);
  const radialZ = hornAxis.clone().cross(radialX).normalize();
  const spiralPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const h = 0.016 + 0.145 * t;
    const r = 0.030 - 0.029 * ((h - 0.012) / 0.158) + 0.0008;
    const a = t * Math.PI * 2 * 3.1;
    spiralPoints.push(hornBase.clone().addScaledVector(hornAxis, h)
      .addScaledVector(radialX, r * Math.cos(a))
      .addScaledVector(radialZ, r * Math.sin(a)));
  }
  b.sweep(polyline(spiralPoints), t => 0.0027 * (1 - 0.58 * t), {
    color: C.goldLight, bone: head, sides: 5, smooth: false,
    name: "raisedGoldenSpiral"
  });

  // Short, scalloped baby mane. Each tuft is seated on the real neck surface.
  const neckSurface = b.surface(neckSkin);
  const tuftColors = [C.pink, C.pink, C.mint, C.mint, C.lavender, C.lavender, C.pink];
  const lineColors = [C.pinkLine, C.pinkLine, C.mintLine, C.mintLine,
    C.lavenderLine, C.lavenderLine, C.pinkLine];
  b.along(neck, 7, cp => {
    const i = Math.min(6, Math.floor((cp.t - 0.1) / 0.88 * 7));
    const p = cp.at;
    const hit = neckSurface.ray([0, p.y, p.z - 0.5], [0, 0, 1])!;
    const tuft = b.stick(fluffSphere, tuftColors[i], hit, {
      scale: [0.063, 0.070 + random() * 0.012, 0.064],
      embed: 0.36, flow: cp.tangent, spin: (random() - 0.5) * 16,
      flat: true, name: `maneCloud${i + 1}`
    });
    const curl = b.surface(tuft).drape(catmull([
      tuft.local([-0.029, 0.061, -0.022]),
      tuft.local([-0.010, 0.073, 0.009]),
      tuft.local([0.017, 0.061, 0.025])
    ]), { lift: 0.0015 });
    b.sweep(curl, 0.0022, {
      color: lineColors[i], sides: 5, bone: tuft.bone!, name: `maneCurl${i + 1}`
    });
    const side = i % 2 === 0 ? 1 : -1;
    const sideHit = neckSurface.nearest([side * 0.046, hit.at.y - 0.009, hit.at.z - 0.014]);
    b.stick(fluffSphere, i % 3 === 0 ? C.pinkLight :
      i % 3 === 1 ? C.mintLight : C.lavenderLight, sideHit, {
      scale: [0.035, 0.053, 0.042], embed: 0.37, flat: true,
      flow: cp.tangent, name: `maneSideFluff${i + 1}`
    });
  }, { from: 0.10, to: 0.98 });

  // Three little swept forelock curls leave the horn unobscured.
  [
    { x: -0.070, color: C.lavender, tip: 0.710 },
    { x: 0.004, color: C.pink, tip: 0.617 },
    { x: 0.067, color: C.mint, tip: 0.714 }
  ].forEach((d, i) => {
    const root = skullSurface.nearest([d.x, 1.425, 0.522]);
    b.sweep(catmull([
      root.at,
      [d.x, 1.447, 0.571],
      [d.x + 0.009, 1.421, d.tip - 0.026],
      [d.x + 0.016, 1.375, d.tip]
    ]), [0.030, 0.037, 0.025, 0.003], {
      color: d.color, bone: head, sides: 7, smooth: false,
      name: `fluffyForelock${i + 1}`
    });
  });

  // Extended, short tail with three overlapping pastel locks, not a tucked plume.
  b.sweep(tail, [0.039, 0.049, 0.045, 0.013], {
    bands: [[0.23, coat], [1, C.lavender]],
    sides: 8, smooth: false, name: "babyTail"
  });
  [
    { s: 1, color: C.pink, line: C.pinkLight, end: -0.904 },
    { s: -1, color: C.mint, line: C.mintLight, end: -0.885 },
    { s: 0, color: C.lavender, line: C.lavenderLight, end: -0.936 }
  ].forEach((d, i) => {
    const lock = b.sweep(catmull([
      [d.s * 0.020, 0.963, -0.586],
      [d.s * 0.043, 0.984 - i * 0.014, -0.679],
      [d.s * 0.048, 0.936 - i * 0.009, -0.805],
      [d.s * 0.034, 0.870 + i * 0.006, d.end]
    ]), [0.032, 0.050, 0.043, 0.004], {
      color: d.color, bone: tail, sides: 7, smooth: false,
      name: `pastelTailLock${i + 1}`
    });
    const tailCurl = b.surface(lock).drape(catmull([
      [d.s * 0.060 + 0.012, 1.012 - i * 0.014, -0.682],
      [d.s * 0.064 + 0.009, 0.967 - i * 0.008, -0.787],
      [d.s * 0.043, 0.900 + i * 0.006, d.end + 0.023]
    ]), { lift: 0.001 });
    b.sweep(tailCurl, [0.0025, 0.002, 0.0007], {
      color: d.line, bone: tail, sides: 5, name: `tailFiber${i + 1}`
    });
  });

  // A loose green daisy chain, draped onto the chest and around the neck.
  const chestSurface = b.surface([body, neckSkin]);
  const necklace = chestSurface.drape(catmull([
    [0, 1.061, 0.182],
    [0.102, 1.052, 0.216],
    [0.150, 1.002, 0.30],
    [0.137, 0.936, 0.395],
    [0.075, 0.908, 0.451],
    [0, 0.896, 0.468],
    [-0.075, 0.908, 0.451],
    [-0.137, 0.936, 0.395],
    [-0.150, 1.002, 0.30],
    [-0.102, 1.052, 0.216]
  ], { closed: true }), { lift: 0.009 });
  const necklaceBone = neck.joints[0];
  b.sweep(necklace, 0.0034, {
    color: C.stem, bone: necklaceBone, sides: 6, name: "wovenDaisyStem"
  });

  b.along(necklace, 13, pp => {
    const hit = chestSurface.nearest(pp.at);
    const n = hit.n;
    const center = pp.at.clone().addScaledVector(n, 0.008);
    const flowerFrame = frame(center, n);
    b.ring(flowerFrame, {
      count: 8, radius: 0.0135, fromDeg: pp.t * 170
    }, petal => {
      b.part(petalSphere, petal.i % 3 === 0 ? C.petalShade : C.petal, {
        frame: petal, scale: [0.0075, 0.016, 0.0038],
        bone: necklaceBone, flat: true, name: `daisyPetal`
      });
    });
    b.stick(new THREE.CylinderGeometry(0.0087, 0.0104, 0.006, 8),
      C.yellow, flowerFrame, {
        embed: 0.12, bone: necklaceBone, name: "daisyGoldenCenter", flat: true
      });
    b.stick(new THREE.SphereGeometry(1, 6, 4), C.yellowLight,
      frame(center.clone().addScaledVector(n, 0.006), n), {
        scale: [0.0056, 0.0026, 0.0056], embed: 0.2,
        bone: necklaceBone, flat: true, name: "daisyPollen"
      });

    if (Math.floor(pp.t * 13) % 2 === 0) {
      const tangent = pp.tangent;
      const side = n.clone().cross(tangent).normalize();
      const base = pp.at.clone().addScaledVector(tangent, 0.030);
      const tip = base.clone().addScaledVector(side, 0.034).addScaledVector(tangent, 0.009);
      b.slab([
        base,
        base.clone().addScaledVector(side, 0.013).addScaledVector(tangent, 0.012),
        tip,
        base.clone().addScaledVector(side, 0.015).addScaledVector(tangent, -0.008)
      ], {
        thickness: 0.0025, color: C.leaf, bone: necklaceBone, name: "daisyChainLeaf"
      });
      b.rod(base, tip, 0.0012, {
        color: C.stem, bone: necklaceBone, sides: 5, name: "leafVein"
      });
    }
  });

  return b.root;
}
