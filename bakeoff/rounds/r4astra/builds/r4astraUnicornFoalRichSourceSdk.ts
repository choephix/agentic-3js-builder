import * as THREE from "three";
import {
  createBuilder, frame, aim, catmull, polyline, paint, mix, interpolate, rng,
  type Fill, type JointRef, type PointInput
} from "../../../../src/index";

export const meta = {
  name: "Primrose — a newborn unicorn",
  description: "A long-legged pearl-white foal with candy-floss curls, a tiny twisted golden horn, silver hooves and a handmade daisy necklace."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Primrose", detail: 0.85, paintSize: 1024 });
  const random = rng(8119);

  const C = {
    pearl: "#fffaf5",
    lilac: "#ded1ec",
    pink: "#edb5ce",
    pinkLight: "#ffe1ea",
    mint: "#b4ddce",
    mintLight: "#e1f4e8",
    lavender: "#bda9dc",
    lavenderLight: "#e4d9f5",
    blush: "#eed2e1",
    ear: "#dda8c5",
    lash: "#46334f",
    eye: "#211b32",
    iris: "#66507b",
    mouth: "#aa8da6",
    silver: "#b7bed3",
    silverLight: "#f0f0fb",
    sole: "#7f87a4",
    gold: "#d1a24d",
    goldLight: "#ffe3a0",
    leaf: "#8bb7a0",
    leafLight: "#b7d7ae",
    petal: "#fff9ea",
    petalShade: "#eee9f3",
    pollen: "#edc35c",
    pollenLight: "#fff0b0"
  };

  // Skeleton first: a small, neutral, slightly splayed quadruped stance.
  const root = b.joint("root", { at: [0, 0.89, -0.33] });
  const spine = b.chain("spine", [
    [0, 0.90, -0.40], [0, 0.88, -0.05], [0, 0.93, 0.27]
  ], {
    parent: root, names: ["pelvis", "spine1", "chest"], role: "spine",
    up: [0, 1, 0]
  });
  const neck = b.chain("neck", [
    [0, 0.95, 0.25], [0, 1.13, 0.39], [0, 1.31, 0.53]
  ], {
    parent: "chest", names: ["neck1", "neck2", "poll"], role: "neck",
    up: [0, 0, -1]
  });
  const head = b.joint("head", {
    parent: "poll", at: [0, 1.31, 0.55], dir: [0, -0.42, 0.91], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.205, 0.59], dir: [0, -0.22, 1], role: "jaw"
  });
  const ears = [-1, 1].map(s => b.joint(s > 0 ? "earL" : "earR", {
    parent: head, at: [s * 0.103, 1.391, 0.50],
    dir: [s * 0.21, 0.975, -0.15], up: [0, 0, 1], role: "hinge"
  }));
  const tail = b.chain("tail", [
    [0, 0.93, -0.48], [0, 0.955, -0.64],
    [0, 0.88, -0.82], [0, 0.81, -1.0]
  ], {
    parent: "pelvis", names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail", up: [0, 1, 0]
  });

  const legs: {
    s: number; front: boolean; tag: string; points: number[][];
    chain: ReturnType<typeof b.chain>;
  }[] = [];

  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const frontPoints = [
      [s * 0.139, 0.94, 0.237],
      [s * 0.165, 0.683, 0.218],
      [s * 0.184, 0.413, 0.294],
      [s * 0.200, 0.151, 0.278],
      [s * 0.205, 0.064, 0.321]
    ];
    const hindPoints = [
      [s * 0.142, 0.916, -0.365],
      [s * 0.195, 0.670, -0.264],
      [s * 0.209, 0.405, -0.470],
      [s * 0.224, 0.148, -0.433],
      [s * 0.227, 0.064, -0.405]
    ];
    const fore = b.chain(`foreleg${side}`, frontPoints, {
      parent: "chest", role: "leg",
      names: [`shoulderF${side}`, `elbowF${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`],
      contact: [s * 0.205, 0, 0.339]
    });
    const hind = b.chain(`hindleg${side}`, hindPoints, {
      parent: "pelvis", role: "leg",
      names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `fetlockH${side}`, `hoofH${side}`],
      contact: [s * 0.227, 0, -0.387]
    });
    legs.push({ s, front: true, tag: `F${side}`, points: frontPoints, chain: fore });
    legs.push({ s, front: false, tag: `H${side}`, points: hindPoints, chain: hind });
  }

  const coat = paint((p, n) => {
    const underside = (1 - n.y) * 0.12;
    const sheen = 0.035 * (1 + Math.sin(p.z * 12 + p.y * 8 + p.x * 5));
    return mix(C.pearl, "#d9c9eb", 0.075 + underside + sheen);
  });

  const unitSphere = new THREE.SphereGeometry(1, 12, 8);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);
  const petalGeometry = new THREE.SphereGeometry(1, 7, 5);

  function ellipsoid(
    name: string, at: PointInput, scale: number[], color: Fill,
    bone: JointRef, quat?: THREE.Quaternion
  ) {
    return b.part(unitSphere, color, { name, at, scale, bone, quat, flat: true });
  }

  const torso = b.loft([
    { at: [0, 0.902, -0.45], w: 0.205, h: 0.29 },
    { at: [0, 0.886, -0.33], w: 0.363, h: 0.403 },
    { at: [0, 0.872, -0.065], w: 0.344, h: 0.388 },
    { at: [0, 0.917, 0.205], w: 0.331, h: 0.425 },
    { at: [0, 0.941, 0.293], w: 0.214, h: 0.31 }
  ], {
    name: "small pearly barrel", color: coat, bone: spine,
    sides: 10, smooth: false, up: [0, 1, 0], caps: "round"
  });
  const neckSkin = b.loft([
    { at: [0, 0.951, 0.242], w: 0.248, h: 0.286 },
    { at: [0, 1.075, 0.345], w: 0.208, h: 0.25 },
    { at: [0, 1.22, 0.458], w: 0.185, h: 0.22 },
    { at: [0, 1.32, 0.536], w: 0.184, h: 0.207 }
  ], {
    name: "upright baby neck", color: coat, bone: neck,
    sides: 10, smooth: false, up: [0, 0, -1], caps: "round"
  });

  // Bony, overlong legs; the subtly bent knees and large feet give the newborn wobble.
  for (const leg of legs) {
    const ts = leg.chain.path.knots;
    const radii = leg.front
      ? [0.072, 0.048, 0.0325, 0.029, 0.038]
      : [0.087, 0.060, 0.035, 0.029, 0.038];

    b.sweep(leg.chain, t => {
      const r = interpolate(ts, radii, t);
      const cannon = Math.exp(-Math.pow((t - 0.73) / 0.12, 2));
      return [r * (1 - 0.12 * cannon), r * (1 - 0.08 * cannon)];
    }, {
      name: `pearl leg ${leg.tag}`, color: coat,
      sides: 8, smooth: false, caps: "round"
    });

    const knee = leg.points[2];
    ellipsoid(`little joint ${leg.tag}`,
      [knee[0], knee[1], knee[2] + (leg.front ? 0.013 : -0.012)],
      [0.036, 0.039, 0.033], coat, leg.chain.joints[2]);

    const foot = leg.chain.tip!;
    const [x, , z] = leg.points[4];

    b.extrude([
      [-0.057, 0], [0.069, 0], [0.073, 0.014],
      [0.052, 0.023], [-0.054, 0.023]
    ], {
      name: `silver sole ${leg.tag}`, at: [x, 0, z], thickness: 0.117,
      color: C.sole, bone: foot, bevel: 0.003, detail: 0.4
    });
    const hoof = b.extrude([
      [-0.056, 0.014], [0.069, 0.014], [0.073, 0.029],
      [0.037, 0.105], [-0.030, 0.113], [-0.055, 0.080]
    ], {
      name: `silver hoof ${leg.tag}`, at: [x, 0, z], thickness: 0.115,
      color: C.silver, bone: foot, bevel: 0.008, detail: 0.4
    });
    const hoofSurface = b.surface(hoof);
    b.sweep(hoofSurface.loop([x, 0.087, z], { dir: [0, 1, 0], lift: 0.0007 }), 0.0023, {
      name: `hoof rim ${leg.tag}`, color: C.silverLight,
      bone: foot, sides: 5, smooth: false
    });
    b.sweep(hoofSurface.loop([x, 0.031, z], { dir: [0, 1, 0], lift: 0.0006 }), 0.0013, {
      name: `hoof growth line ${leg.tag}`, color: "#979fb9",
      bone: foot, sides: 4, smooth: false
    });
    ellipsoid(`soft coronet ${leg.tag}`, [x, 0.119, z - 0.012],
      [0.047, 0.032, 0.043], coat, foot);

    // One broad, deliberately graphic silver glint on the outside wall.
    const hx = x + leg.s * 0.0585;
    b.slab([
      [hx, 0.025, z + 0.020], [hx, 0.027, z + 0.043],
      [hx, 0.087, z + 0.015], [hx, 0.092, z + 0.004]
    ], {
      name: `hoof glint ${leg.tag}`, color: C.silverLight,
      thickness: 0.001, bone: foot
    });
  }

  // The upper face and hinged mandible are distinct pieces.
  const upperHead = b.loft([
    { at: [0, 1.355, 0.487], w: 0.16, h: 0.16 },
    { at: [0, 1.324, 0.562], w: 0.289, h: 0.281 },
    { at: [0, 1.235, 0.682], w: 0.225, h: 0.241 },
    { at: [0, 1.165, 0.770], w: 0.230, h: 0.170 },
    { at: [0, 1.157, 0.835], w: 0.175, h: 0.120 }
  ], {
    name: "upper jaw and oversized foal head", color: coat, bone: head,
    up: [0, 1, 0], sides: 12, smooth: false, caps: "round"
  });
  b.part(new THREE.BoxGeometry(0.153, 0.017, 0.14), C.mouth, {
    name: "soft mouth interior", at: [0, 1.110, 0.818], bone: jaw
  });
  b.loft([
    { at: [0, 1.195, 0.598], w: 0.154, h: 0.110 },
    { at: [0, 1.104, 0.743], w: 0.18, h: 0.075 },
    { at: [0, 1.087, 0.837], w: 0.174, h: 0.054 }
  ], {
    name: "separate little lower jaw", color: coat, bone: jaw,
    up: [0, 1, 0], sides: 10, smooth: false, caps: "round"
  });
  const face = b.surface(upperHead);

  // Tall, thin baby ears, with inset velvet-pink leaves.
  ears.forEach((earBone, i) => {
    const s = i === 0 ? -1 : 1;
    const ear = b.extrude([
      [-0.037, 0], [-0.057, 0.076], [-0.029, 0.169],
      [0.004, 0.219], [0.046, 0.140], [0.050, 0.048], [0.033, 0.006]
    ], {
      name: `outer ear ${s > 0 ? "L" : "R"}`, at: earBone,
      x: [1, 0, 0], y: [s * 0.23, 0.973, -0.12],
      thickness: [0.050, 0.014], bevel: 0.006,
      color: coat, bone: earBone, detail: 0.5
    });
    b.extrude([
      [-0.021, 0], [-0.034, 0.056], [-0.016, 0.127],
      [0.003, 0.162], [0.027, 0.100], [0.026, 0.031]
    ], {
      name: "pink inner ear", at: ear.local([0, 0.026, 0.023]),
      x: ear.dir([1, 0, 0]), y: ear.dir([0, 1, 0]),
      thickness: 0.007, bevel: 0.002, color: C.ear, bone: earBone
    });
    b.sweep(catmull([
      ear.local([-0.003, 0.037, 0.030]),
      ear.local([0.005, 0.090, 0.030]),
      ear.local([0.003, 0.161, 0.024])
    ]), [0.010, 0.006, 0.001], {
      name: "inner ear down", color: C.pinkLight, bone: earBone,
      sides: 5, smooth: false
    });
  });

  // Eyes sit on actual head triangles. Their oval rims remain part of the silhouette.
  for (const s of [-1, 1]) {
    const eyeHit = face.ray([s * 0.43, 1.325, 0.875], [-s * 0.82, -0.015, -0.56])!;
    const q = aim(eyeHit.n, [0, 1, 0]);
    const socket = b.part(unitSphere, "#cbb7d6", {
      name: `velvet eye rim ${s > 0 ? "L" : "R"}`,
      at: eyeHit.at.addScaledVector(eyeHit.n, 0.004), quat: q,
      scale: [0.079, 0.024, 0.089], bone: head, flat: true
    });
    b.part(unitSphere, "#f5edf3", {
      name: "thin ivory eye edge", at: socket.local([0, 0.012, 0]),
      quat: q, scale: [0.073, 0.026, 0.082], bone: head
    });
    const eye = b.part(unitSphere, C.eye, {
      name: "large dark eye", at: socket.local([0, 0.025, 0.001]),
      quat: q, scale: [0.0675, 0.032, 0.077], bone: head
    });
    const eyeSurface = b.surface(eye);
    const irisLine = eyeSurface.drape(catmull([
      eye.local([-0.044, 0.07, -0.038]),
      eye.local([-0.017, 0.07, -0.060]),
      eye.local([0.019, 0.07, -0.060]),
      eye.local([0.043, 0.07, -0.038])
    ]), { lift: 0.001 });
    b.sweep(irisLine, 0.0035, {
      name: "lavender reflected iris crescent", color: C.iris,
      sides: 5, bone: head
    });

    for (const [x, z, r] of [[-0.020, 0.028, 0.017], [0.022, -0.012, 0.007]]) {
      const glint = eyeSurface.ray(eye.local([x, 0.2, z]), eye.dir([0, -1, 0]))!;
      b.stick(smallSphere, "#fffdf4", glint, {
        name: "eye catchlight", scale: [r, 0.004, r * 1.13],
        embed: 0.12, bone: head
      });
    }

    const rimPoints = [
      [-0.066, 0.021, 0.024], [-0.044, 0.030, 0.064],
      [0, 0.033, 0.083], [0.044, 0.028, 0.064], [0.066, 0.018, 0.025]
    ];
    b.sweep(catmull(rimPoints.map(p => socket.local(p))), 0.0055, {
      name: "upper eyelid", color: C.lash, bone: head, sides: 5
    });
    const outside = -s;
    for (let k = 0; k < 3; k++) {
      const x = outside * (0.034 + k * 0.015);
      const z = 0.077 - k * 0.013;
      b.sweep(catmull([
        socket.local([x, 0.027, z]),
        socket.local([x + outside * 0.013, 0.037, z + 0.016]),
        socket.local([x + outside * (0.022 + k * 0.003), 0.033, z + 0.034])
      ]), [0.0052, 0.0037, 0.0005], {
        name: "long individual eyelash", color: C.lash, bone: head,
        sides: 5, smooth: false, caps: "round"
      });
    }

    const cheek = face.nearest([s * 0.145, 1.251, 0.719]);
    b.stick(smallSphere, C.blush, cheek, {
      name: "powder pink cheek", scale: [0.036, 0.006, 0.022],
      flow: [0, 1, 0], embed: 0.48, bone: head, flat: true
    });
    const nose = face.nearest([s * 0.103, 1.193, 0.858]);
    b.stick(smallSphere, "#ebd4e1", nose, {
      name: "soft nose rim", scale: [0.027, 0.008, 0.021],
      flow: [0, 1, 0], embed: 0.36, bone: head
    });
    b.stick(smallSphere, "#92748f", nose.moved([0, 0.008, 0]), {
      name: "little nostril", scale: [0.010, 0.006, 0.015],
      flow: [0, 1, 0], spin: s * 24, embed: 0.2, bone: head
    });

    b.sweep(catmull([
      [s * 0.088, 1.117, 0.883],
      [s * 0.080, 1.110, 0.902],
      [s * 0.050, 1.107, 0.917]
    ]), [0.0018, 0.0025, 0.0013], {
      name: "quiet mouth corner", color: C.mouth, bone: jaw,
      sides: 5, caps: "round"
    });
  }

  // A miniature tapered horn with a genuinely helical raised golden thread.
  const hornHit = face.ray([0, 1.8, 0.639], [0, -1, 0])!;
  const hornBase = hornHit.at.addScaledVector(hornHit.n, -0.004);
  const hornDirection = new THREE.Vector3(0, 0.965, 0.263).normalize();
  const hornFrame = frame(hornBase, hornDirection);
  const hornLength = 0.218;
  b.sweep([hornBase, hornFrame.local([0, hornLength, 0])],
    t => 0.029 * Math.pow(1 - t, 0.9), {
      name: "small gold horn", color: C.gold, bone: head,
      sides: 9, smooth: false, caps: { start: "flat", end: "point" }
    });
  const helix: THREE.Vector3[] = [];
  for (let i = 0; i <= 84; i++) {
    const t = 0.02 + 0.955 * i / 84;
    const angle = t * Math.PI * 2 * 3.5;
    const r = 0.029 * Math.pow(1 - t, 0.9) + 0.001;
    helix.push(hornFrame.local([Math.cos(angle) * r, t * hornLength, Math.sin(angle) * r]));
  }
  b.sweep(catmull(helix), t => 0.0045 * (1 - t) + 0.0008, {
    name: "continuous spiral on horn", color: C.goldLight, bone: head,
    sides: 5, smooth: false, caps: "round"
  });
  b.part(new THREE.TorusGeometry(0.0285, 0.004, 5, 12), C.goldLight, {
    name: "horn root ring", at: hornBase, dir: hornDirection, axis: "z", bone: head
  });

  // Short, chunky cotton-candy locks. The small ridges are seated on each swept lock.
  function hairLock(
    name: string, points: PointInput[], radii: number[],
    color: string, light: string, bone: JointRef
  ) {
    const lock = b.sweep(catmull(points), radii, {
      name, color, bone, sides: 8, smooth: false, caps: "round"
    });
    b.sweep(lock.line(0, 0.001).slice(0.18, 0.78), [0.003, 0.0025, 0.0008], {
      name: `${name} soft ridge`, color: light, bone,
      sides: 4, smooth: false, caps: "round"
    });
    return lock;
  }
  const candy = [
    [C.pink, C.pinkLight], [C.mint, C.mintLight], [C.lavender, C.lavenderLight]
  ];

  b.along(neckSkin, 6, on => {
    const i = Math.min(5, Math.floor(on.t * 6));
    const [color, light] = candy[i % 3];
    const p = on.at;
    const n = on.n;
    hairLock(`fluffy mane lock ${i + 1}`, [
      p.clone().addScaledVector(n, -0.008),
      p.clone().add(new THREE.Vector3(0.031, 0.033, -0.027)),
      p.clone().add(new THREE.Vector3(0.078, 0.013, -0.022)),
      p.clone().add(new THREE.Vector3(0.108, -0.032, -0.006))
    ], [0.032, 0.046, 0.039, 0.013], color, light, on.bone!);
  }, { from: 0.10, to: 0.92 });

  hairLock("pink baby forelock", [
    [-0.080, 1.422, 0.520], [-0.088, 1.465, 0.570],
    [-0.068, 1.441, 0.633], [-0.054, 1.365, 0.687]
  ], [0.028, 0.044, 0.038, 0.007], C.pink, C.pinkLight, head);
  hairLock("mint baby forelock", [
    [-0.015, 1.443, 0.503], [0.008, 1.472, 0.546],
    [0.036, 1.441, 0.613], [0.044, 1.391, 0.659]
  ], [0.025, 0.042, 0.035, 0.009], C.mint, C.mintLight, head);
  hairLock("lavender baby forelock", [
    [0.068, 1.421, 0.506], [0.105, 1.440, 0.551],
    [0.131, 1.404, 0.605], [0.121, 1.349, 0.642]
  ], [0.028, 0.040, 0.033, 0.007], C.lavender, C.lavenderLight, head);

  b.sweep(tail, [0.043, 0.039, 0.033, 0.009], {
    name: "tail core", color: coat, sides: 8, smooth: false
  });
  hairLock("pink tail curl", [
    [0.014, 0.944, -0.495], [0.055, 0.953, -0.646],
    [0.082, 0.871, -0.83], [0.057, 0.808, -0.984]
  ], [0.027, 0.047, 0.047, 0.010], C.pink, C.pinkLight, tail);
  hairLock("mint tail curl", [
    [-0.018, 0.940, -0.497], [-0.055, 0.951, -0.648],
    [-0.079, 0.870, -0.840], [-0.057, 0.805, -1.007]
  ], [0.026, 0.043, 0.044, 0.009], C.mint, C.mintLight, tail);
  hairLock("lavender tail curl", [
    [0, 0.960, -0.51], [0, 0.988, -0.668],
    [0.009, 0.918, -0.850], [0.008, 0.830, -1.039]
  ], [0.025, 0.046, 0.045, 0.009], C.lavender, C.lavenderLight, tail);

  // A loose daisy chain follows the real neck and chest surface.
  const chestSurface = b.surface([torso, neckSkin]);
  const necklacePoints: THREE.Vector3[] = [];
  for (let i = 0; i < 28; i++) {
    const a = Math.PI * 2 * i / 28;
    necklacePoints.push(new THREE.Vector3(
      0.169 * Math.cos(a),
      1.042 + 0.109 * Math.sin(a),
      0.305 - 0.157 * Math.sin(a)
    ));
  }
  const necklace = chestSurface.drape(polyline(necklacePoints, { closed: true }), { lift: 0.012 });
  b.sweep(necklace, 0.0065, {
    name: "woven green daisy stem", color: C.leaf,
    bone: [spine, neck], sides: 6, smooth: false
  });
  b.sweep(chestSurface.drape(polyline(necklacePoints.map((p, i) =>
    p.clone().add(new THREE.Vector3(0, 0.003 * Math.cos(i * 1.8), 0.004))
  ), { closed: true }), { lift: 0.014 }), 0.0023, {
    name: "twined pale stem", color: C.leafLight,
    bone: [spine, neck], sides: 5
  });

  b.along(necklace, 13, pathPoint => {
    const hit = chestSurface.nearest(pathPoint.at);
    const flowerBone = hit.bone!;
    const center = hit.at.addScaledVector(hit.n, 0.018);
    const flower = frame(center, hit.n, pathPoint.tangent);
    const size = 0.90 + random() * 0.16;

    b.part(smallSphere, C.leaf, {
      name: "daisy green calyx", at: center, quat: flower.quat,
      scale: [0.015 * size, 0.005, 0.015 * size], bone: flowerBone, flat: true
    });
    b.ring(flower, { count: 9, radius: 0.011 * size, fromDeg: 8, toDeg: 368 }, petal => {
      b.part(petalGeometry, petal.i % 3 === 0 ? C.petalShade : C.petal, {
        name: "individual daisy petal", frame: petal,
        at: petal.local([0, 0.0115 * size, 0.002]),
        scale: [0.0075 * size, 0.0185 * size, 0.0046],
        bone: flowerBone, flat: true
      });
    });
    b.stick(smallSphere, C.pollen, flower, {
      name: "golden daisy centre", scale: [0.013 * size, 0.007, 0.013 * size],
      embed: 0.05, bone: flowerBone, flat: true
    });
    b.part(new THREE.IcosahedronGeometry(0.0033, 0), C.pollenLight, {
      name: "pollen glint", at: flower.local([-0.003, 0.012, 0.003]),
      bone: flowerBone
    });

    // Two tiny pointed leaves peek out from behind each flower.
    for (const sign of [-1, 1]) {
      const a = flower.local([sign * 0.009, -0.002, -0.004]);
      const c = flower.local([sign * 0.035, 0, -0.018]);
      const e = flower.local([sign * 0.022, 0.001, -0.002]);
      const d = flower.local([sign * 0.020, 0, -0.017]);
      b.slab([a, e, c, d], {
        name: "daisy-chain leaf", color: sign > 0 ? C.leaf : C.leafLight,
        thickness: 0.0025, bone: flowerBone
      });
    }
  });

  // Restrained, pearly surface sheen with polished eyes and metal accents.
  b.ctx.paintMaterial().roughness = 0.56;
  b.ctx.paintMaterial().metalness = 0.055;
  b.material(C.eye).roughness = 0.19;
  b.material(C.eye).metalness = 0.10;
  b.material(C.silver).metalness = 0.65;
  b.material(C.silver).roughness = 0.32;
  b.material(C.silverLight).metalness = 0.42;
  b.material(C.silverLight).roughness = 0.27;
  b.material(C.gold).metalness = 0.60;
  b.material(C.gold).roughness = 0.34;
  b.material(C.goldLight).metalness = 0.45;
  b.material(C.goldLight).roughness = 0.30;

  const result = b.root;
  result.traverse(object => {
    if ((object as THREE.Mesh).isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return result;
}
