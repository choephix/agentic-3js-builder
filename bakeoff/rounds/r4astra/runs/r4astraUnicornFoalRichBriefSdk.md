```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  lerp,
  bezier,
  catmull,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Primrose, the Newborn Unicorn",
  description:
    "A long-legged pearl-and-lilac unicorn foal with a tiny spiral gold horn, sherbet-colored fluff, silver slippers, and a necklace of fresh daisies.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Primrose" });
  const random = rng(82147);

  const C = {
    pearl: "#f4eff5",
    cream: "#fff8ef",
    light: "#fffdf8",
    lilacWhite: "#e7dfed",
    lilac: "#cbbddc",
    blush: "#efd4e1",
    pink: "#efb7d2",
    pinkLight: "#ffdae8",
    mint: "#b8dfd0",
    mintLight: "#d8eee0",
    lavender: "#c5b1e0",
    lavenderLight: "#e2d5ef",
    silver: "#bac6d6",
    silverLight: "#e3e9f1",
    silverDark: "#8390a5",
    gold: "#d8ad58",
    goldLight: "#ffe1a0",
    goldDark: "#ae803c",
    socket: "#cdbbd7",
    eye: "#242032",
    pupil: "#121421",
    nose: "#997d96",
    mouth: "#ad8eaa",
    stem: "#719984",
    leaf: "#91b99a",
    leafLight: "#bed4ab",
    petal: "#fffbed",
    pollen: "#f2c85b",
    pollenDark: "#cb983d",
  };

  type P = [number, number, number];
  type Joint = ReturnType<typeof b.joint>;

  const chainDescriptions: { name: string; role: string; joints: string[] }[] = [];

  function markRole(j: Joint, role: string) {
    const q = j as any;
    q.role = role;
    if (q.userData) q.userData.role = role;
    if (q.bone?.userData) q.bone.userData.role = role;
  }

  function joint(name: string, at: P, parent: Joint, role: string): Joint {
    const j = b.joint(name, { at, parent });
    markRole(j, role);
    return j;
  }

  // Explicit, named skeletal chains. All anatomy is attached only after
  // the complete rest-pose skeleton has been established.
  const hips = b.joint("hips", { at: [0, 1.025, -0.285] });
  markRole(hips, "spine");
  const spine = joint("spine", [0, 1.04, -0.045], hips, "spine");
  const chest = joint("chest", [0, 1.065, 0.235], spine, "spine");
  const neckBase = joint("neckBase", [0, 1.13, 0.285], chest, "neck");
  const neckMid = joint("neckMid", [0, 1.335, 0.403], neckBase, "neck");
  const poll = joint("poll", [0, 1.545, 0.525], neckMid, "neck");
  const head = joint("head", [0, 1.482, 0.665], poll, "head");
  const jaw = joint("jaw", [0, 1.355, 0.653], head, "jaw");
  const horn = joint("horn", [0, 1.634, 0.755], head, "hinge");
  const earL = joint("earL", [0.112, 1.643, 0.525], head, "hinge");
  const earR = joint("earR", [-0.112, 1.643, 0.525], head, "hinge");

  const tail1 = joint("tail1", [0, 1.105, -0.425], hips, "tail");
  const tail2 = joint("tail2", [0, 1.075, -0.625], tail1, "tail");
  const tail3 = joint("tail3", [0, 1.125, -0.825], tail2, "tail");

  chainDescriptions.push(
    { name: "back", role: "spine", joints: ["hips", "spine", "chest"] },
    { name: "neck", role: "neck", joints: ["neckBase", "neckMid", "poll"] },
    { name: "head", role: "head", joints: ["head"] },
    { name: "mouth", role: "jaw", joints: ["jaw"] },
    { name: "tail", role: "tail", joints: ["tail1", "tail2", "tail3"] }
  );

  const legs: {
    side: number;
    front: boolean;
    upper: Joint;
    bend: Joint;
    knee: Joint;
    ankle: Joint;
    foot: Joint;
    footPoint: P;
  }[] = [];

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const shoulder = joint(
      `shoulder${side}`, [s * 0.158, 1.035, 0.244], chest, "leg"
    );
    const elbow = joint(
      `elbow${side}`, [s * 0.184, 0.795, 0.275], shoulder, "leg"
    );
    const carpus = joint(
      `carpus${side}`,
      [s * 0.216, 0.485, s === 1 ? 0.327 : 0.307],
      elbow, "leg"
    );
    const fetlock = joint(
      `fetlockF${side}`,
      [s * 0.259, 0.163, s === 1 ? 0.415 : 0.374],
      carpus, "leg"
    );
    const fp: P = [s * 0.266, 0.061, s === 1 ? 0.445 : 0.404];
    const foot = joint(`hoofF${side}`, fp, fetlock, "leg");
    legs.push({
      side: s, front: true, upper: shoulder, bend: elbow,
      knee: carpus, ankle: fetlock, foot, footPoint: fp,
    });
    chainDescriptions.push({
      name: `foreleg${side}`, role: "leg",
      joints: [
        `shoulder${side}`, `elbow${side}`, `carpus${side}`,
        `fetlockF${side}`, `hoofF${side}`,
      ],
    });

    const hip = joint(`hip${side}`, [s * 0.176, 1.024, -0.282], hips, "leg");
    const stifle = joint(
      `stifle${side}`, [s * 0.205, 0.758, -0.166], hip, "leg"
    );
    const hock = joint(
      `hock${side}`, [s * 0.243, 0.443, -0.443], stifle, "leg"
    );
    const ankle = joint(
      `fetlockH${side}`,
      [s * 0.286, 0.153, s === 1 ? -0.467 : -0.432],
      hock, "leg"
    );
    const bp: P = [s * 0.298, 0.061, s === 1 ? -0.419 : -0.384];
    const backFoot = joint(`hoofH${side}`, bp, ankle, "leg");
    legs.push({
      side: s, front: false, upper: hip, bend: stifle,
      knee: hock, ankle, foot: backFoot, footPoint: bp,
    });
    chainDescriptions.push({
      name: `hindleg${side}`, role: "leg",
      joints: [
        `hip${side}`, `stifle${side}`, `hock${side}`,
        `fetlockH${side}`, `hoofH${side}`,
      ],
    });
  }
  b.root.userData.chains = chainDescriptions;

  function ballGeometry(x: number, y: number, z: number, fluffy = false) {
    const g = fluffy
      ? new THREE.IcosahedronGeometry(1, 1)
      : new THREE.SphereGeometry(1, 12, 8);
    return g.scale(x, y, z);
  }

  function oval(
    at: any, scale: P, color: string, bone: Joint, fluffy = false
  ) {
    return b.part(ballGeometry(...scale, fluffy), color, { at, bone });
  }

  function tapered(
    a: any, z: any, rA: number, rZ: number,
    color: string, bone: Joint, sides = 10
  ) {
    const av = lerp(a, a, 0);
    const zv = lerp(z, z, 0);
    const g = new THREE.CylinderGeometry(rZ, rA, av.distanceTo(zv), sides);
    return b.part(g, color, {
      frame: line(a, z).moved(lerp(a, z, 0.5)),
      bone,
    });
  }

  function elongated(
    a: any, z: any, width: number, depth: number,
    color: string, bone: Joint, fluffy = false
  ) {
    const length = lerp(a, a, 0).distanceTo(lerp(z, z, 0));
    return b.part(
      ballGeometry(width, length * 0.62, depth, fluffy),
      color,
      { frame: line(a, z).moved(lerp(a, z, 0.5)), bone }
    );
  }

  // A compact, softly faceted barrel above improbably long baby legs.
  b.sweep([hips, spine, chest], 0.196, { color: C.pearl });
  const barrel = oval(
    lerp(hips, chest, 0.49), [0.23, 0.234, 0.417], C.pearl, spine
  );
  const rump = oval(
    lerp(hips, spine, 0.11), [0.231, 0.229, 0.244], C.pearl, hips
  );
  oval(chest, [0.198, 0.235, 0.203], C.pearl, chest);

  const neckSkin = b.sweep(
    [neckBase, neckMid, poll], 0.131, { color: C.pearl }
  );
  elongated(
    neckBase, neckMid, 0.157, 0.153, C.pearl, neckBase
  );

  // Long separated limbs, gently splayed rather than posed in mid-step.
  for (const leg of legs) {
    const { upper, bend, knee, ankle, foot, footPoint, front } = leg;

    elongated(
      upper, bend,
      front ? 0.077 : 0.109,
      front ? 0.09 : 0.136,
      C.pearl, upper
    );
    tapered(
      upper, bend,
      front ? 0.069 : 0.094, front ? 0.045 : 0.051,
      C.pearl, upper
    );
    b.sweep([bend, knee, ankle], front ? 0.032 : 0.034, {
      color: C.pearl,
    });
    tapered(bend, knee, front ? 0.044 : 0.05, 0.035, C.pearl, bend);
    tapered(knee, ankle, 0.034, 0.029, C.pearl, knee);

    oval(bend, [0.046, 0.057, 0.05], C.lilacWhite, bend, true);
    oval(knee, [0.046, 0.057, 0.048], C.lilacWhite, knee, true);
    const kneeFront = lerp(knee, knee, 0).add(new THREE.Vector3(0, 0.004, 0.018));
    oval(kneeFront, [0.036, 0.043, 0.034], C.pearl, knee, true);
    oval(ankle, [0.042, 0.059, 0.048], C.pearl, ankle, true);
    tapered(ankle, foot, 0.038, 0.047, C.lilacWhite, ankle);

    const [x, , z] = footPoint;
    // Broad flat soles sit exactly on the floor.
    b.part(
      new THREE.CylinderGeometry(0.064, 0.065, 0.014, 10).scale(1, 1, 1.28),
      C.silverDark, { at: [x, 0.007, z], bone: foot }
    );
    const hoof = b.part(
      new THREE.CylinderGeometry(0.048, 0.065, 0.097, 10).scale(1, 1, 1.28),
      C.silver, { at: [x, 0.0625, z], bone: foot }
    );
    b.part(
      new THREE.TorusGeometry(0.048, 0.006, 4, 10)
        .rotateX(Math.PI / 2).scale(1, 1, 1.28),
      C.silverLight, { at: [x, 0.11, z], bone: foot }
    );
    const shine = b.surface(hoof).nearest([x + 0.018, 0.073, z + 0.16]);
    b.stick(
      new THREE.OctahedronGeometry(1).scale(0.012, 0.002, 0.029),
      C.silverLight, shine
    );
  }

  // Separate upper head, muzzle, and independently opening lower jaw.
  const skull = b.part(
    ballGeometry(0.177, 0.276, 0.177),
    C.pearl,
    { frame: frame(head, [0, -0.47, 0.883]), bone: head }
  );
  const muzzle = oval(
    [0, 1.344, 0.922], [0.143, 0.111, 0.146], C.cream, head
  );
  oval([0, 1.261, 0.842], [0.122, 0.061, 0.198], C.lilacWhite, jaw);
  oval([0, 1.245, 0.933], [0.112, 0.04, 0.104], C.pearl, jaw);

  const skullSurface = b.surface(skull);
  const muzzleSurface = b.surface(muzzle);

  for (const s of [1, -1]) {
    const eyeHit = skullSurface.ray(
      [s * 0.48, 1.505, 0.782], [-s, 0, -0.065]
    );
    const socket = b.stick(
      ballGeometry(0.073, 0.013, 0.084), C.socket, eyeHit
    );
    const socketHit = b.surface(socket).nearest([s * 0.6, 1.509, 0.87]);
    const eye = b.stick(
      ballGeometry(0.062, 0.026, 0.074), C.eye, socketHit
    );
    const eyeSurface = b.surface(eye);
    const irisHit = eyeSurface.nearest([s * 0.57, 1.498, 0.96]);
    const pupil = b.stick(
      ballGeometry(0.045, 0.007, 0.057), C.pupil, irisHit
    );

    b.stick(
      ballGeometry(0.016, 0.003, 0.019), C.light,
      b.surface(pupil).nearest([s * 0.45, 1.57, 0.98])
    );
    b.stick(
      ballGeometry(0.007, 0.002, 0.008), C.mintLight,
      eyeSurface.nearest([s * 0.49, 1.46, 0.8])
    );

    // Three distinctly separated, upward-curving lashes.
    for (let k = 0; k < 3; k++) {
      const lashBase = eyeSurface.nearest([
        s * 0.38, 1.567 + k * 0.003, 0.72 + k * 0.025,
      ]);
      const p = lerp(lashBase, lashBase, 0);
      const bend = p.clone().add(new THREE.Vector3(s * 0.027, 0.027, -0.006));
      const tip = p.clone().add(
        new THREE.Vector3(s * (0.052 - k * 0.006), 0.048 + k * 0.007, -0.017)
      );
      b.sweep(bezier(lashBase, bend, tip), 0.0034, {
        color: C.eye, bone: head,
      });
      tapered(lerp(bend, tip, 0.52), tip, 0.0033, 0.0006, C.eye, head, 5);
    }

    b.stick(
      ballGeometry(0.04, 0.0025, 0.019), C.blush,
      skullSurface.nearest([s * 0.28, 1.409, 0.771])
    );
    b.stick(
      ballGeometry(0.023, 0.0038, 0.014), C.nose,
      muzzleSurface.nearest([s * 0.205, 1.375, 1.048])
    );
    b.stick(
      ballGeometry(0.011, 0.002, 0.0045), C.light,
      muzzleSurface.nearest([s * 0.17, 1.396, 1.035])
    );

    const mouthPoints = [
      muzzleSurface.nearest([s * 0.20, 1.287, 0.883]),
      muzzleSurface.nearest([s * 0.20, 1.278, 0.961]),
      muzzleSurface.nearest([s * 0.075, 1.29, 1.085]),
    ];
    b.sweep(catmull(mouthPoints), 0.0028, {
      color: C.mouth, bone: jaw,
    });
  }

  // Pointed, cupped ears: polygonal shells with inset rose interiors.
  function earGeometry(
    s: number, width: number, length: number,
    startY: number, front: number, bulge: number
  ) {
    const outline = [
      [-0.40, 0], [0.40, 0], [1, 0.35],
      [0.63, 0.70], [0, 1], [-0.67, 0.72], [-1, 0.34],
    ];
    const positions: number[] = [];
    function pt(xx: number, yy: number, zz: number) {
      const y = startY + yy * length;
      return [xx * width + s * y * 0.25, y, front - y * 0.12 + zz];
    }
    const frontCenter = pt(0, 0.44, bulge);
    const backCenter = pt(0, 0.44, -bulge * 0.66);
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const d = outline[(i + 1) % outline.length];
      positions.push(...frontCenter, ...pt(a[0], a[1], 0), ...pt(d[0], d[1], 0));
      positions.push(...backCenter, ...pt(d[0], d[1], 0), ...pt(a[0], a[1], 0));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }

  for (const [s, ear] of [[1, earL], [-1, earR]] as const) {
    b.part(earGeometry(s, 0.059, 0.267, 0, 0, 0.034), C.pearl, {
      at: ear, bone: ear,
    });
    b.part(earGeometry(s, 0.034, 0.189, 0.039, 0.025, 0.018), C.blush, {
      at: ear, bone: ear,
    });
    oval(ear, [0.052, 0.058, 0.049], C.pearl, ear, true);
  }

  // Short scalloped sherbet mane, seated on the rear of the neck.
  const neckSurface = b.surface(neckSkin);
  const maneColors = [C.pink, C.lavender, C.mint, C.pink, C.mint, C.lavender];
  const maneLights = [
    C.pinkLight, C.lavenderLight, C.mintLight,
    C.pinkLight, C.mintLight, C.lavenderLight,
  ];

  for (let i = 0; i < 6; i++) {
    const y = 1.225 + i * 0.067;
    const hit = neckSurface.nearest([0, y, -0.1]);
    b.stick(
      ballGeometry(0.077, 0.064 + random() * 0.012, 0.081, true),
      maneColors[i], hit
    );
    const side = i % 2 === 0 ? 1 : -1;
    const sideHit = neckSurface.nearest([side * 0.065, y + 0.018, -0.06]);
    b.stick(
      ballGeometry(0.049, 0.047, 0.061, true),
      maneLights[i], sideHit
    );
  }

  for (const tuft of [
    { p: [-0.08, 1.69, 0.623], c: C.mint, size: [0.065, 0.047, 0.078] },
    { p: [0.065, 1.697, 0.621], c: C.lavender, size: [0.069, 0.048, 0.08] },
    { p: [0.012, 1.673, 0.692], c: C.pink, size: [0.064, 0.043, 0.076] },
  ]) {
    b.stick(
      ballGeometry(tuft.size[0], tuft.size[1], tuft.size[2], true),
      tuft.c, skullSurface.nearest(tuft.p)
    );
  }

  // A small tapered horn with an actual raised helical gold ridge.
  const hornSeat = skullSurface.nearest(horn);
  const hornBase = lerp(hornSeat, hornSeat, 0);
  const hornAxis = new THREE.Vector3(0, 1, 0.29).normalize();
  const hornTip = hornBase.clone().addScaledVector(hornAxis, 0.252);
  tapered(hornBase, hornTip, 0.043, 0.0025, C.gold, horn, 10);
  b.part(
    new THREE.TorusGeometry(0.039, 0.006, 5, 12).rotateX(Math.PI / 2),
    C.goldDark, { frame: frame(hornBase, hornAxis), bone: horn }
  );
  const hu = new THREE.Vector3(1, 0, 0);
  const hv = new THREE.Vector3().crossVectors(hornAxis, hu).normalize();
  const coil: THREE.Vector3[] = [];
  for (let i = 0; i <= 68; i++) {
    const t = i / 68;
    const angle = t * Math.PI * 2 * 3.65;
    const r = 0.041 * (1 - t) + 0.0027;
    coil.push(
      hornBase.clone()
        .addScaledVector(hornAxis, 0.246 * t)
        .addScaledVector(hu, Math.cos(angle) * r)
        .addScaledVector(hv, Math.sin(angle) * r)
    );
  }
  b.sweep(coil, 0.0035, { color: C.goldLight, bone: horn });

  // A baby-length tail, lifted clear of the legs and ending in fluffy locks.
  b.sweep([tail1, tail2, tail3], 0.031, { color: C.pearl });
  const tailLocks = [
    { a: [0, 1.077, -0.626], z: [0.009, 1.183, -0.93], c: C.pink, w: 0.068 },
    { a: [0.017, 1.073, -0.665], z: [0.096, 1.102, -0.938], c: C.mint, w: 0.057 },
    { a: [-0.018, 1.073, -0.665], z: [-0.086, 1.083, -0.96], c: C.lavender, w: 0.061 },
    { a: [0, 1.09, -0.73], z: [-0.005, 1.219, -0.925], c: C.pinkLight, w: 0.043 },
    { a: [0.036, 1.078, -0.76], z: [0.072, 1.152, -0.981], c: C.mintLight, w: 0.037 },
  ];
  for (const lock of tailLocks) {
    elongated(lock.a, lock.z, lock.w, lock.w * 0.88, lock.c, tail3, true);
  }

  // A genuine hanging daisy chain: a green cord describes the catenary,
  // while individual flowers face away from the neck and breast.
  const necklace = catmull([
    [0, 1.352, 0.276],
    [0.13, 1.318, 0.318],
    [0.20, 1.20, 0.382],
    [0.195, 1.095, 0.447],
    [0.11, 1.02, 0.50],
    [0, 0.998, 0.515],
    [-0.11, 1.02, 0.50],
    [-0.195, 1.095, 0.447],
    [-0.20, 1.20, 0.382],
    [-0.13, 1.318, 0.318],
    [0, 1.352, 0.276],
  ]);
  b.sweep(necklace, 0.007, { color: C.stem, bone: chest });

  let flowerIndex = 0;
  b.along(necklace, 16, (at) => {
    const index = flowerIndex++;
    const p = lerp(at, at, 0);
    const normal = new THREE.Vector3(p.x * 2.3, 0.09, (p.z - 0.36) * 3).normalize();
    const u = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize();
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();
    const size = p.y < 1.045 ? 1.12 : 0.96;
    const center = p.clone().addScaledVector(normal, 0.01);
    const turn = index * 0.47;

    for (let k = 0; k < 8; k++) {
      const a = turn + (k / 8) * Math.PI * 2;
      const radial = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
      const petalAt = center.clone().addScaledVector(radial, 0.025 * size);
      b.part(
        new THREE.SphereGeometry(1, 7, 4).scale(0.0115 * size, 0.023 * size, 0.0055),
        k % 3 === 0 ? C.cream : C.petal,
        { frame: frame(petalAt, radial, normal), bone: chest }
      );
    }
    b.part(
      ballGeometry(0.019 * size, 0.006, 0.019 * size),
      C.pollenDark,
      { frame: frame(center.clone().addScaledVector(normal, 0.004), normal), bone: chest }
    );
    b.part(
      ballGeometry(0.016 * size, 0.009, 0.016 * size, true),
      C.pollen,
      { frame: frame(center.clone().addScaledVector(normal, 0.009), normal), bone: chest }
    );

    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + turn;
      const seed = center.clone()
        .addScaledVector(normal, 0.018)
        .addScaledVector(u, Math.cos(a) * 0.007)
        .addScaledVector(v, Math.sin(a) * 0.007);
      oval(seed, [0.0025, 0.0025, 0.0025], C.goldLight, chest, true);
    }

    if (index % 2 === 0) {
      for (const sign of [-1, 1]) {
        const leafDir = u.clone().multiplyScalar(sign * 0.85).addScaledVector(v, 0.5).normalize();
        const leafAt = p.clone()
          .addScaledVector(leafDir, 0.041)
          .addScaledVector(normal, -0.005);
        b.part(
          new THREE.SphereGeometry(1, 6, 4).scale(0.012, 0.034, 0.004),
          index % 4 === 0 ? C.leaf : C.leafLight,
          { frame: frame(leafAt, leafDir, normal), bone: chest }
        );
        const leafEnd = p.clone().addScaledVector(leafDir, 0.069);
        b.sweep([p, leafEnd], 0.0016, { color: C.stem, bone: chest });
      }
    }
  });

  // Restrained pearl glints, not a spotted coat.
  for (const s of [1, -1]) {
    const bodySurface = b.surface(barrel);
    const rumpSurface = b.surface(rump);
    const glints = [
      { hit: rumpSurface.nearest([s * 0.5, 1.135, -0.32]), r: 0.019 },
      { hit: rumpSurface.nearest([s * 0.5, 1.086, -0.375]), r: 0.011 },
      { hit: bodySurface.nearest([s * 0.5, 1.14, 0.085]), r: 0.013 },
    ];
    for (const g of glints) {
      b.stick(
        new THREE.OctahedronGeometry(1).scale(g.r * 0.48, 0.0018, g.r),
        C.light, g.hit
      );
    }
  }

  // Preserve the shared builder materials while giving the small accents
  // their own characteristic finish.
  const metals = new Set([C.silver, C.silverLight, C.silverDark, C.gold, C.goldLight, C.goldDark]);
  const glossy = new Set([C.eye, C.pupil]);
  const pearls = new Set([C.pearl, C.cream, C.lilacWhite]);

  b.root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const m = material as THREE.MeshStandardMaterial;
      if (!m.isMeshStandardMaterial) continue;
      const color = `#${m.color.getHexString()}`;
      m.flatShading = !glossy.has(color);
      if (metals.has(color)) {
        m.metalness = 0.62;
        m.roughness = 0.31;
      } else if (glossy.has(color)) {
        m.metalness = 0.06;
        m.roughness = 0.16;
      } else if (pearls.has(color)) {
        m.metalness = 0.1;
        m.roughness = 0.48;
      }
      m.needsUpdate = true;
    }
  });

  return b.root;
}
```