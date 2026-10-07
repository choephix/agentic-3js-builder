import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Daisy, the Newborn Unicorn",
  description:
    "A pearl-and-lilac unicorn foal with wonderfully long, slightly splayed legs, silver slippers, sherbet-coloured baby fluff, a tiny spiralled golden horn, and a necklace of daisies."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Daisy the unicorn foal" });

  const C = {
    pearl: "#f4f0fa",
    ivory: "#fffaf5",
    white: "#ffffff",
    cool: "#e3dcef",
    lilac: "#cfc0e5",
    shimmer: "#eee2fa",
    pink: "#f3b5ce",
    pinkLight: "#ffdae6",
    rose: "#d991b4",
    mint: "#bce6d8",
    mintLight: "#def5e9",
    lavender: "#c6b3ec",
    lavenderLight: "#e6dafa",
    lavenderDark: "#a798cb",
    ink: "#222033",
    eye: "#171725",
    eyeRim: "#d7c5e1",
    nostril: "#8d788f",
    lip: "#aa8fa6",
    gold: "#e4b151",
    goldLight: "#ffe29b",
    goldDark: "#b98037",
    silver: "#b7c4d8",
    silverLight: "#e8eef7",
    silverDark: "#899bb7",
    stem: "#82ae98",
    leaf: "#a4d0b3",
    petal: "#fffdf4",
    petalShade: "#f0edf7",
    pollen: "#f2cc62"
  };

  type P = [number, number, number];
  const v = (p: P) => new THREE.Vector3(...p);

  function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
    const result = g.index ? g.toNonIndexed() : g;
    result.computeVertexNormals();
    return result;
  }

  function ellipsoid(
    x: number,
    y: number,
    z: number,
    segments = 12,
    rings = 8,
    faceted = true
  ): THREE.BufferGeometry {
    const g = new THREE.SphereGeometry(1, segments, rings).scale(x, y, z);
    return faceted ? flat(g) : g;
  }

  function puff(x: number, y: number, z: number): THREE.BufferGeometry {
    return flat(new THREE.IcosahedronGeometry(1, 1).scale(x, y, z));
  }

  function joint(
    name: string,
    at: P,
    parent: any,
    role: string,
    aim?: P
  ): any {
    const j = b.joint(name, { at, parent, ...(aim ? { aim } : {}) });
    const node = ((j as any).bone ?? j) as THREE.Object3D;
    node.userData.role = role;
    return j;
  }

  const chains: Array<{ name: string; role: string; joints: string[] }> = [];
  function registerChain(name: string, role: string, names: string[]) {
    chains.push({ name, role, joints: names });
  }

  // All structural joints are made before any geometry.
  const hips = joint("hips", [0, 0.708, -0.292], undefined, "spine", [0, 0.716, -0.05]);
  const spine = joint("spine", [0, 0.716, -0.05], hips, "spine", [0, 0.748, 0.245]);
  const chest = joint("chest", [0, 0.748, 0.245], spine, "spine", [0, 0.883, 0.326]);
  const neck1 = joint("neck1", [0, 0.795, 0.262], chest, "neck", [0, 0.933, 0.35]);
  const neck2 = joint("neck2", [0, 0.933, 0.35], neck1, "neck", [0, 1.071, 0.422]);
  const head = joint("head", [0, 1.071, 0.422], neck2, "head", [0, 1.02, 0.76]);
  const jaw = joint("jaw", [0, 0.93, 0.606], head, "jaw", [0, 0.905, 0.79]);
  const hornRoot: P = [0, 1.231, 0.586];
  const hornAxis = new THREE.Vector3(0, 0.984, 0.178).normalize();
  const hornTip = v(hornRoot).addScaledVector(hornAxis, 0.194);
  const horn = joint(
    "horn",
    hornRoot,
    head,
    "head",
    [hornTip.x, hornTip.y, hornTip.z]
  );
  const earL = joint("earL", [0.108, 1.205, 0.391], head, "hinge", [0.155, 1.403, 0.405]);
  const earR = joint("earR", [-0.108, 1.205, 0.391], head, "hinge", [-0.151, 1.403, 0.405]);

  const tail1 = joint("tail1", [0, 0.762, -0.446], hips, "tail", [0.013, 0.792, -0.553]);
  const tail2 = joint("tail2", [0.013, 0.792, -0.553], tail1, "tail", [0.035, 0.751, -0.665]);
  const tail3 = joint("tail3", [0.035, 0.751, -0.665], tail2, "tail", [0.061, 0.687, -0.79]);
  const tail4 = joint("tail4", [0.061, 0.687, -0.79], tail3, "tail", [0.072, 0.668, -0.83]);

  registerChain("body", "spine", ["hips", "spine", "chest"]);
  registerChain("neck", "neck", ["neck1", "neck2", "head"]);
  registerChain("mouth", "jaw", ["jaw"]);
  registerChain("babyTail", "tail", ["tail1", "tail2", "tail3", "tail4"]);

  const legs: Array<{
    side: number;
    front: boolean;
    points: P[];
    bones: any[];
  }> = [];

  for (const side of [1, -1]) {
    const suffix = side === 1 ? "L" : "R";
    const frontPoints: P[] = [
      [side * 0.152, 0.739, 0.244],
      [side * 0.178, 0.543, 0.256],
      [side * 0.207, 0.326, 0.297],
      [side * 0.247, 0.121, 0.312],
      [side * 0.258, 0.047, 0.329]
    ];
    const frontNames = [
      `shoulder${suffix}`, `elbow${suffix}`, `knee${suffix}`,
      `fetlock${suffix}`, `hoof${suffix}`
    ];
    const frontBones: any[] = [];
    for (let i = 0; i < frontPoints.length; i++) {
      frontBones.push(joint(
        frontNames[i],
        frontPoints[i],
        i === 0 ? chest : frontBones[i - 1],
        "leg",
        frontPoints[Math.min(i + 1, frontPoints.length - 1)]
      ));
    }
    legs.push({ side, front: true, points: frontPoints, bones: frontBones });
    registerChain(`foreleg${suffix}`, "leg", frontNames);

    const backPoints: P[] = [
      [side * 0.147, 0.695, -0.31],
      [side * 0.196, 0.473, -0.225],
      [side * 0.223, 0.257, -0.379],
      [side * 0.25, 0.119, -0.352],
      [side * 0.264, 0.047, -0.332]
    ];
    const backNames = [
      `hip${suffix}`, `stifle${suffix}`, `hock${suffix}`,
      `fetlockHind${suffix}`, `hoofHind${suffix}`
    ];
    const backBones: any[] = [];
    for (let i = 0; i < backPoints.length; i++) {
      backBones.push(joint(
        backNames[i],
        backPoints[i],
        i === 0 ? hips : backBones[i - 1],
        "leg",
        backPoints[Math.min(i + 1, backPoints.length - 1)]
      ));
    }
    legs.push({ side, front: false, points: backPoints, bones: backBones });
    registerChain(`hindleg${suffix}`, "leg", backNames);
  }
  b.root.userData.chains = chains;
  b.root.userData.character = "newborn unicorn";

  // A compact, round little barrel on disproportionately long baby legs.
  b.sweep([hips, spine, chest], 0.165, { color: C.pearl });

  const barrel = b.part(ellipsoid(0.204, 0.216, 0.362, 16, 10), C.pearl, {
    at: [0, 0.708, -0.048], bone: spine
  });
  b.part(ellipsoid(0.193, 0.203, 0.196), C.pearl, {
    at: [0, 0.717, -0.292], bone: hips
  });
  b.part(ellipsoid(0.173, 0.228, 0.184), C.ivory, {
    at: [0, 0.742, 0.226], bone: chest
  });
  b.part(ellipsoid(0.163, 0.091, 0.257), C.cool, {
    at: [0, 0.563, -0.055], bone: spine
  });

  const neckTube = b.sweep([neck1, neck2, head], 0.093, { color: C.ivory });
  b.part(ellipsoid(0.104, 0.139, 0.112), C.ivory, {
    at: [0, 0.822, 0.274], bone: neck1
  });

  // Subtle pearl-coloured glints, not a spotted coat.
  function sparkleGeometry(size: number) {
    const shape = new THREE.Shape();
    const points = [
      [0, size], [size * 0.22, size * 0.22],
      [size * 0.7, 0], [size * 0.22, -size * 0.22],
      [0, -size], [-size * 0.22, -size * 0.22],
      [-size * 0.7, 0], [-size * 0.22, size * 0.22]
    ];
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.0012, bevelEnabled: false, curveSegments: 1
    }).rotateX(-Math.PI / 2);
  }

  const barrelSurface = b.surface(barrel);
  for (const side of [1, -1]) {
    for (const [y, z, size] of [
      [0.77, -0.165, 0.017],
      [0.805, -0.101, 0.010],
      [0.734, -0.079, 0.008]
    ]) {
      b.stick(
        sparkleGeometry(size),
        C.shimmer,
        barrelSurface.nearest([side * 0.3, y, z])
      );
    }
  }

  // Continuous slender legs; the wide-set tiny feet give the newborn wobble.
  for (const leg of legs) {
    const { points, bones, front, side } = leg;
    const legTube = b.sweep(bones.slice(0, 4), front ? 0.0285 : 0.0305, {
      color: C.ivory
    });

    const a = v(points[0]);
    const c = v(points[1]);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    const dir = c.clone().sub(a);

    b.part(
      flat(new THREE.CylinderGeometry(
        front ? 0.036 : 0.045,
        front ? 0.059 : 0.075,
        dir.length(),
        9
      )),
      front ? C.ivory : C.pearl,
      { at: mid, dir, bone: bones[0] }
    );

    if (!front) {
      b.part(ellipsoid(0.087, 0.136, 0.118), C.pearl, {
        at: [side * 0.147, 0.64, -0.294], bone: bones[0]
      });
    }

    const legSurface = b.surface(legTube);
    b.stick(
      ellipsoid(0.018, 0.0025, 0.024, 10, 6),
      C.cool,
      legSurface.nearest([
        points[2][0], points[2][1], points[2][2] + 0.09
      ])
    );

    const foot = points[4];
    const hoof = b.part(
      flat(new THREE.CylinderGeometry(0.043, 0.055, 0.075, 8).scale(1, 1, 1.19)),
      C.silver,
      { at: [foot[0], 0.0375, foot[2]], bone: bones[4] }
    );
    b.part(
      flat(new THREE.CylinderGeometry(0.043, 0.046, 0.010, 8).scale(1, 1, 1.18)),
      C.silverDark,
      { at: [foot[0], 0.076, foot[2]], bone: bones[4] }
    );
    b.part(ellipsoid(0.04, 0.024, 0.043, 10, 6), C.ivory, {
      at: [foot[0], 0.096, foot[2]], bone: bones[3]
    });
    b.stick(
      ellipsoid(0.023, 0.0018, 0.025, 8, 6),
      C.silverLight,
      b.surface(hoof).nearest([foot[0] - side * 0.01, 0.041, foot[2] + 0.15])
    );
  }

  // Large foal head, sloping face, velvet nose, and independently hinged jaw.
  const skull = b.part(ellipsoid(0.151, 0.184, 0.214, 16, 12), C.ivory, {
    at: [0, 1.075, 0.5], bone: head
  });
  b.part(ellipsoid(0.127, 0.13, 0.182, 14, 10), C.ivory, {
    at: [0, 1.008, 0.656], bone: head
  });
  const muzzle = b.part(ellipsoid(0.122, 0.073, 0.109, 14, 8), C.cool, {
    at: [0, 0.955, 0.786], bone: head
  });
  b.part(ellipsoid(0.108, 0.008, 0.108), C.lip, {
    at: [0, 0.917, 0.769], bone: jaw
  });
  b.part(ellipsoid(0.112, 0.044, 0.142), C.pearl, {
    at: [0, 0.902, 0.742], bone: jaw
  });

  const skullSurface = b.surface(skull);
  const muzzleSurface = b.surface(muzzle);
  for (const side of [1, -1]) {
    const cheek = b.part(ellipsoid(0.06, 0.08, 0.104), C.ivory, {
      at: [side * 0.102, 1.009, 0.543], bone: head
    });
    b.stick(
      ellipsoid(0.025, 0.002, 0.017, 12, 6),
      C.pinkLight,
      b.surface(cheek).nearest([side * 0.23, 1.014, 0.606])
    );

    b.stick(
      ellipsoid(0.019, 0.0025, 0.012, 12, 8, false),
      C.nostril,
      muzzleSurface.nearest([side * 0.2, 0.976, 0.857])
    );

    const mouthCurve = muzzleSurface.drape([
      [side * 0.085, 0.925, 0.866],
      [side * 0.113, 0.926, 0.819],
      [side * 0.119, 0.936, 0.774]
    ]);
    b.sweep(mouthCurve, 0.0019, { color: C.lip });

    // Deep ink eyes with a soft socket, two crisp catchlights, and long lashes.
    const socket = b.stick(
      ellipsoid(0.077, 0.009, 0.08, 16, 10),
      C.eyeRim,
      skullSurface.nearest([side * 0.23, 1.104, 0.66])
    );
    const eye = b.stick(
      ellipsoid(0.064, 0.018, 0.070, 18, 12, false),
      C.eye,
      b.surface(socket).nearest([side * 0.35, 1.105, 0.85])
    );
    const eyeSurface = b.surface(eye);
    b.stick(
      ellipsoid(0.014, 0.0028, 0.017, 12, 8, false),
      C.white,
      eyeSurface.nearest([side * 0.34, 1.17, 0.84])
    );
    b.stick(
      ellipsoid(0.0065, 0.0016, 0.007, 10, 6, false),
      C.lavenderLight,
      eyeSurface.nearest([side * 0.36, 1.075, 0.78])
    );

    const lid = eyeSurface.drape([
      [side * 0.25, 1.152, 0.63],
      [side * 0.26, 1.167, 0.684],
      [side * 0.20, 1.15, 0.75]
    ]);
    b.sweep(lid, 0.0032, { color: C.ink });

    const lashes = [
      { base: [side * 0.27, 1.148, 0.635], bend: [side * 0.265, 1.179, 0.623], tip: [side * 0.279, 1.203, 0.613] },
      { base: [side * 0.27, 1.161, 0.673], bend: [side * 0.267, 1.19, 0.678], tip: [side * 0.274, 1.217, 0.684] },
      { base: [side * 0.23, 1.155, 0.723], bend: [side * 0.24, 1.178, 0.739], tip: [side * 0.251, 1.198, 0.753] }
    ];
    for (const lash of lashes) {
      b.sweep(
        [eyeSurface.nearest(lash.base), lash.bend, lash.tip],
        0.00225,
        { color: C.ink }
      );
    }
  }

  // Pointed, softly folded ears with inset pastel interiors.
  const earOutline = [
    [-0.035, 0], [-0.049, 0.055], [-0.026, 0.145],
    [0.005, 0.201], [0.035, 0.145], [0.045, 0.055], [0.03, 0]
  ];
  function earGeometry(inner: boolean): THREE.BufferGeometry {
    const positions: number[] = [];
    const push = (a: number[], c: number[], d: number[]) => positions.push(...a, ...c, ...d);
    if (inner) {
      const rim = earOutline.map(([x, y]) => [x * 0.62, y * 0.77 + 0.025, 0.032]);
      const center = [0, 0.098, 0.048];
      for (let i = 0; i < rim.length; i++) push(center, rim[i], rim[(i + 1) % rim.length]);
    } else {
      const front = earOutline.map(([x, y]) => [x, y, 0.01]);
      const back = earOutline.map(([x, y]) => [x * 0.93, y, -0.023]);
      const frontCenter = [0, 0.088, 0.043];
      const backCenter = [0, 0.088, -0.027];
      for (let i = 0; i < front.length; i++) {
        const n = (i + 1) % front.length;
        push(frontCenter, front[i], front[n]);
        push(backCenter, back[n], back[i]);
        push(front[i], back[i], back[n]);
        push(front[i], back[n], front[n]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }
  for (const side of [1, -1]) {
    const earBone = side === 1 ? earL : earR;
    const at: P = [side * 0.108, 1.205, 0.391];
    b.part(earGeometry(false).rotateZ(-side * 0.235).rotateX(0.06), C.ivory, {
      at, bone: earBone
    });
    b.part(earGeometry(true).rotateZ(-side * 0.235).rotateX(0.06), C.pink, {
      at, bone: earBone
    });
  }

  // A tiny faceted gold cone with a real raised, tapering spiral.
  const hornHeight = 0.194;
  b.part(
    flat(new THREE.ConeGeometry(0.029, hornHeight, 9)),
    C.gold,
    {
      at: v(hornRoot).addScaledVector(hornAxis, hornHeight / 2),
      dir: hornAxis,
      bone: horn
    }
  );
  const ringGeometry = new THREE.TorusGeometry(0.028, 0.0038, 5, 14).rotateX(Math.PI / 2);
  b.part(ringGeometry, C.goldLight, { at: hornRoot, dir: hornAxis, bone: horn });

  const hx = new THREE.Vector3(1, 0, 0);
  const hz = new THREE.Vector3(0, -hornAxis.z, hornAxis.y);
  const spiral: THREE.Vector3[] = [];
  const shadowSpiral: THREE.Vector3[] = [];
  for (let i = 0; i <= 66; i++) {
    const t = i / 66;
    const angle = t * Math.PI * 2 * 3.35;
    const r = 0.029 * (1 - t) + 0.0008;
    const p = v(hornRoot)
      .addScaledVector(hornAxis, hornHeight * t)
      .addScaledVector(hx, Math.cos(angle) * r)
      .addScaledVector(hz, Math.sin(angle) * r);
    spiral.push(p);
    shadowSpiral.push(p.clone().addScaledVector(hornAxis, -0.0032));
  }
  b.sweep(shadowSpiral, 0.0018, { color: C.goldDark });
  b.sweep(spiral, 0.0026, { color: C.goldLight });

  // Short scalloped baby mane, with sherbet-coloured wisps.
  const mane = [
    { at: [0, 0.854, 0.153] as P, size: [0.066, 0.072, 0.066], color: C.lavender, shine: C.lavenderLight, bone: neck1 },
    { at: [0, 0.933, 0.204] as P, size: [0.063, 0.069, 0.066], color: C.mint, shine: C.mintLight, bone: neck1 },
    { at: [0, 1.008, 0.269] as P, size: [0.061, 0.07, 0.063], color: C.pink, shine: C.pinkLight, bone: neck2 },
    { at: [0, 1.087, 0.327] as P, size: [0.062, 0.068, 0.061], color: C.lavender, shine: C.lavenderLight, bone: neck2 },
    { at: [0, 1.17, 0.378] as P, size: [0.063, 0.067, 0.069], color: C.mint, shine: C.mintLight, bone: head }
  ];
  for (let i = 0; i < mane.length; i++) {
    const m = mane[i];
    const tuft = b.part(puff(m.size[0], m.size[1], m.size[2]), m.color, {
      at: m.at, bone: m.bone
    });
    for (const side of [1, -1]) {
      b.part(
        flat(new THREE.ConeGeometry(0.024, 0.055, 7)),
        m.color,
        {
          at: [side * 0.027, m.at[1] + 0.01, m.at[2] - 0.046],
          dir: [side * 0.36, 0.28, -0.84],
          bone: m.bone
        }
      );
    }
    const s = b.surface(tuft);
    b.sweep(
      s.drape([
        [0.035, m.at[1] + 0.07, m.at[2] + 0.024],
        [0.05, m.at[1] + 0.023, m.at[2] - 0.021],
        [0.035, m.at[1] - 0.018, m.at[2] - 0.071]
      ]),
      0.0026,
      { color: m.shine }
    );
  }

  b.part(puff(0.062, 0.05, 0.088), C.pink, {
    at: [0.012, 1.24, 0.502], bone: head
  });
  b.part(puff(0.045, 0.039, 0.071), C.lavender, {
    at: [0.064, 1.22, 0.538], bone: head
  });
  b.part(puff(0.044, 0.038, 0.076), C.mint, {
    at: [-0.061, 1.225, 0.523], bone: head
  });
  b.sweep([
    [0.041, 1.256, 0.514],
    [0.052, 1.239, 0.572],
    [0.048, 1.193, 0.623],
    [0.033, 1.161, 0.637]
  ], 0.023, { color: C.pink });
  b.part(
    flat(new THREE.ConeGeometry(0.022, 0.044, 7)),
    C.pink,
    { at: [0.032, 1.15, 0.642], dir: [-0.1, -0.94, 0.24], bone: head }
  );

  // A short extended tail, not a long adult horse's curtain.
  b.sweep([tail1, tail2, tail3, tail4], 0.033, { color: C.lavender });
  const tailPuffs = [
    { at: [0.014, 0.787, -0.547] as P, size: [0.063, 0.065, 0.082], color: C.pink, bone: tail2 },
    { at: [-0.027, 0.768, -0.625] as P, size: [0.052, 0.055, 0.096], color: C.mint, bone: tail2 },
    { at: [0.067, 0.755, -0.638] as P, size: [0.055, 0.06, 0.097], color: C.pink, bone: tail3 },
    { at: [0.029, 0.734, -0.704] as P, size: [0.057, 0.058, 0.101], color: C.lavender, bone: tail3 },
    { at: [0.073, 0.687, -0.783] as P, size: [0.049, 0.044, 0.068], color: C.mint, bone: tail4 }
  ];
  for (const t of tailPuffs) {
    b.part(puff(t.size[0], t.size[1], t.size[2]), t.color, {
      at: t.at, bone: t.bone
    });
  }
  for (const t of [
    { at: [0.075, 0.685, -0.818] as P, color: C.mint, dir: [0.16, -0.39, -0.9] },
    { at: [0.025, 0.702, -0.792] as P, color: C.lavender, dir: [-0.19, -0.4, -0.9] },
    { at: [0.107, 0.726, -0.738] as P, color: C.pink, dir: [0.24, -0.25, -0.92] }
  ]) {
    b.part(flat(new THREE.ConeGeometry(0.023, 0.063, 7)), t.color, {
      at: t.at, dir: t.dir, bone: tail4
    });
  }

  // The daisy necklace hangs low at the front and rises behind the neck.
  const necklacePoint = (theta: number): THREE.Vector3 =>
    new THREE.Vector3(
      0.147 * Math.sin(theta),
      0.849 - 0.095 * Math.cos(theta),
      0.325 + 0.108 * Math.cos(theta)
    );
  const necklace: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    necklace.push(necklacePoint(i / 64 * Math.PI * 2));
  }
  b.sweep(necklace, 0.0039, { color: C.stem });

  const petalGeometry = ellipsoid(0.0076, 0.014, 0.0032, 8, 6);
  for (let i = 0; i < 14; i++) {
    const theta = i / 14 * Math.PI * 2;
    const at = necklacePoint(theta);
    const normal = new THREE.Vector3(Math.sin(theta), 0.23, Math.cos(theta)).normalize();
    const flower = frame(at, normal);

    b.ring(flower, { count: 8, radius: 0.014 }, (petal: any) => {
      b.part(petalGeometry, i % 3 === 0 ? C.petalShade : C.petal, {
        at: petal,
        dir: petal,
        up: normal,
        bone: neck1
      });
    });

    const center = b.part(
      ellipsoid(0.0105, 0.005, 0.0105, 10, 6),
      C.pollen,
      { frame: flower, bone: neck1 }
    );
    b.stick(
      ellipsoid(0.0034, 0.0012, 0.0034, 7, 5),
      C.goldLight,
      b.surface(center).nearest(at.clone().addScaledVector(normal, 0.04))
    );

    // Paired little leaves between the white blossoms.
    const leafTheta = theta + Math.PI / 14;
    const leafAt = necklacePoint(leafTheta);
    const tangent = new THREE.Vector3(Math.cos(leafTheta), 0, -Math.sin(leafTheta));
    const leafNormal = new THREE.Vector3(
      Math.sin(leafTheta), 0.23, Math.cos(leafTheta)
    ).normalize();
    b.part(
      ellipsoid(0.008, 0.019, 0.0028, 8, 6),
      i % 2 === 0 ? C.leaf : C.stem,
      {
        at: leafAt,
        dir: tangent.clone().add(new THREE.Vector3(0, i % 2 ? -0.7 : 0.7, 0)).normalize(),
        up: leafNormal,
        bone: neck1
      }
    );
  }

  return b.root;
}
