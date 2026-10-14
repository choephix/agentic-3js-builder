```ts
import * as THREE from "three";
import {
  createBuilder, catmull, polyline, frame, rng, paint, mix,
  countershade, interpolate, svg,
  type Fill, type JointRef, type PointInput
} from "agentic-3js-builder";

export const meta = {
  name: "Stardrop — Unicorn Foal",
  description: "A long-legged ivory unicorn foal with a little spiral horn, enormous violet eyes, sherbet-coloured locks, and constellation birthmarks."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Stardrop", detail: 0.8, paintSize: 2048 });
  const random = rng(31415);

  const C = {
    ivory: "#fff1df",
    cream: "#fff8e9",
    shadow: "#d9cce1",
    pink: "#eab5c5",
    nose: "#d4a4b5",
    nostril: "#82637c",
    mouth: "#8c6c83",
    lavender: "#b69bd7",
    lilac: "#cab5e8",
    lightLilac: "#e8d8f7",
    blush: "#edb5d1",
    lightBlush: "#ffdae5",
    mint: "#abd9cf",
    lightMint: "#d9eee0",
    hoof: "#887299",
    hoofDark: "#645372",
    hoofLight: "#bcabc8",
    gold: "#dbad65",
    paleGold: "#ffe6a2",
    iris: "#8970b6",
    pupil: "#302b46",
    white: "#fffdf5"
  };

  const coatShade = countershade(C.ivory, C.shadow, { level: -0.32, soft: 0.85 });
  const coat = paint((p, n) => {
    const base = coatShade.at(p, n);
    if (p.z > 0.925 && p.y > 1.04) {
      const t = Math.min(0.67, Math.max(0, (p.z - 0.925) / 0.19));
      return mix(base, C.pink, t);
    }
    return base;
  });

  // Skeleton first: a compact barrel above the long, slightly splayed legs of a foal.
  const root = b.joint("root", { at: [0, 0.86, -0.34] });
  const spine = b.chain("spine", [
    [0, 0.86, -0.43], [0, 0.90, -0.08], [0, 0.94, 0.28]
  ], {
    parent: root, names: ["pelvis", "spine", "chest"], role: "spine", up: [0, 1, 0]
  });
  const neck = b.chain("neck", [
    [0, 0.945, 0.28], [0, 1.17, 0.415], [0, 1.365, 0.584]
  ], {
    parent: "chest", names: ["neckBase", "neck", "poll"],
    role: "neck", up: [0, 0, 1]
  });
  const head = b.joint("head", {
    parent: "poll", at: [0, 1.36, 0.59],
    dir: [0, -0.28, 1], up: [0, 1, 0], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.245, 0.67],
    dir: [0, -0.19, 1], up: [0, 1, 0], role: "jaw"
  });

  const legs = [-1, 1].flatMap(s => {
    const side = s === 1 ? "L" : "R";
    const frontPoints = [
      [s * 0.154, 0.925, 0.265],
      [s * 0.19, 0.695, 0.277],
      [s * 0.218, 0.414, 0.325],
      [s * 0.232, 0.176, 0.343],
      [s * 0.243, 0.085, 0.393]
    ];
    const hindPoints = [
      [s * 0.157, 0.869, -0.418],
      [s * 0.197, 0.622, -0.246],
      [s * 0.223, 0.337, -0.505],
      [s * 0.234, 0.176, -0.478],
      [s * 0.245, 0.085, -0.425]
    ];
    const front = b.chain(`foreleg${side}`, frontPoints, {
      parent: "chest",
      names: [`shoulder${side}`, `elbow${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg", contact: [s * 0.243, 0, 0.41], up: [0, 0, 1]
    });
    const hind = b.chain(`hindleg${side}`, hindPoints, {
      parent: "pelvis",
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
      role: "leg", contact: [s * 0.245, 0, -0.407], up: [0, 0, 1]
    });
    return [
      { chain: front, points: frontPoints, hind: false, s, side },
      { chain: hind, points: hindPoints, hind: true, s, side }
    ];
  });

  const ears = [-1, 1].map(s => {
    const side = s === 1 ? "L" : "R";
    return {
      s,
      joint: b.joint(`ear${side}`, {
        parent: head, at: [s * 0.108, 1.474, 0.572],
        dir: [s * 0.34, 1, -0.13], up: [0, 0, 1], role: "hinge"
      })
    };
  });

  const tail = b.chain("tail", [
    [0, 0.94, -0.548], [0, 0.945, -0.738],
    [0, 0.828, -0.973], [0, 0.723, -1.16], [0, 0.699, -1.285]
  ], {
    parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail", up: [0, 1, 0], twist: -32
  });

  function ellipsoid(
    name: string, at: PointInput, scale: number[], color: Fill, bone: JointRef,
    segments = 10
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 7), color, {
      name, at, scale, bone, flat: true
    });
  }

  const torso = b.loft([
    { at: [0, 0.865, -0.585], w: 0.255, h: 0.32 },
    { at: [0, 0.885, -0.432], w: 0.403, h: 0.455 },
    { at: [0, 0.897, -0.145], w: 0.436, h: 0.493 },
    { at: [0, 0.923, 0.123], w: 0.392, h: 0.455 },
    { at: [0, 0.947, 0.304], w: 0.283, h: 0.366 }
  ], {
    name: "soft barrel", color: coat, bone: spine, up: [0, 1, 0],
    sides: 10, smooth: false, caps: "round"
  });

  const neckShape = b.loft([
    { at: [0, 0.945, 0.28], w: 0.29, h: 0.382 },
    { at: [0, 1.077, 0.343], w: 0.269, h: 0.337 },
    { at: [0, 1.24, 0.45], w: 0.222, h: 0.26 },
    { at: [0, 1.365, 0.584], w: 0.218, h: 0.231 }
  ], {
    name: "arched neck", color: coat, bone: neck, up: [0, 0, 1],
    sides: 10, smooth: false, caps: "round"
  });

  const skull = b.loft([
    { at: [0, 1.371, 0.554], w: 0.242, h: 0.242 },
    { at: [0, 1.367, 0.659], w: 0.325, h: 0.302 },
    { at: [0, 1.321, 0.785], w: 0.279, h: 0.248 },
    { at: [0, 1.242, 0.933], w: 0.232, h: 0.168 },
    { at: [0, 1.221, 1.024], w: 0.245, h: 0.146 },
    { at: [0, 1.219, 1.072], w: 0.211, h: 0.12 }
  ], {
    name: "upper jaw and face", color: coat, bone: head, up: [0, 1, 0],
    sides: 10, smooth: false, caps: "flat"
  });

  const lowerJaw = b.loft([
    { at: [0, 1.236, 0.68], w: 0.193, h: 0.136 },
    { at: [0, 1.184, 0.84], w: 0.177, h: 0.103 },
    { at: [0, 1.131, 1.025], w: 0.202, h: 0.053 },
    { at: [0, 1.133, 1.072], w: 0.188, h: 0.041 }
  ], {
    name: "separate lower jaw", color: coat, bone: jaw, up: [0, 1, 0],
    sides: 8, smooth: false, caps: "flat"
  });
  b.part(new THREE.BoxGeometry(0.167, 0.009, 0.085), C.mouth, {
    name: "mouth interior", at: [0, 1.154, 1.028], bone: jaw
  });

  // Legs remain individually readable all the way to the four little unshod hooves.
  for (const leg of legs) {
    const { chain, points, hind, side } = leg;
    const radii = hind
      ? [0.108, 0.071, 0.040, 0.037, 0.032]
      : [0.073, 0.052, 0.0355, 0.037, 0.032];
    b.sweep(chain, t => {
      const r = interpolate(chain.ts, radii, t);
      return [r * 0.86, r];
    }, {
      name: `${hind ? "hind" : "fore"} leg ${side}`,
      color: coat, sides: 8, smooth: false, caps: "round"
    });

    const knee = points[2];
    ellipsoid(`joint ${hind ? "hock" : "knee"} ${side}`, knee,
      hind ? [0.037, 0.048, 0.046] : [0.034, 0.046, 0.04],
      coat, chain.joints[2]);

    const foot = points[4];
    const fx = foot[0], fz = foot[2] + 0.014;
    const footBone = chain.tip!;
    b.extrude([
      [-0.070, 0.007], [-0.068, 0.064], [-0.044, 0.128],
      [0.036, 0.128], [0.086, 0.032], [0.077, 0.004]
    ], {
      name: `hoof wall ${hind ? "H" : "F"}${side}`,
      at: [fx, 0, fz], x: [0, 0, 1], y: [0, 1, 0],
      thickness: [0.124, 0.097], bevel: 0.008, detail: 0.4,
      color: C.hoof, bone: footBone
    });
    b.extrude([
      [-0.070, 0], [0.078, 0], [0.086, 0.021], [-0.074, 0.021]
    ], {
      name: "hoof sole", at: [fx, 0, fz],
      thickness: 0.123, bevel: 0.004, detail: 0.4,
      color: C.hoofDark, bone: footBone
    });
    ellipsoid("soft coronet", [fx, 0.135, fz - 0.01],
      [0.055, 0.033, 0.061], C.ivory, footBone);
    // A quiet pale facet at the toe, rather than a metallic horseshoe.
    b.extrude([
      [-0.020, 0], [0.008, 0], [0.018, 0.044], [-0.005, 0.052]
    ], {
      name: "hoof glint", at: [fx, 0.041, fz + 0.069],
      x: [1, 0, 0], y: [0, 1, -0.4], thickness: 0.002,
      color: C.hoofLight, bone: footBone
    });
  }

  // Tall, open ears, with a recessed-looking rose inset.
  for (const { joint: ear } of ears) {
    b.extrude([
      [-0.024, 0], [-0.047, 0.080], [-0.034, 0.155],
      [0, 0.214, "sharp"], [0.033, 0.153], [0.038, 0.079], [0.024, 0]
    ], {
      name: "ear shell", at: ear, x: ear.dir([1, 0, 0]), y: ear.axis,
      thickness: [0.064, 0.018], bevel: 0.007, detail: 0.4,
      color: coat, bone: ear
    });
    const inside = [
      [-0.013, 0.032], [-0.028, 0.087], [-0.023, 0.139],
      [0, 0.186], [0.022, 0.134], [0.020, 0.079]
    ].map(([x, y]) => ear.local([x, y, 0.034 - 0.023 * y / 0.214]));
    b.slab(inside, { name: "rose inner ear", color: C.pink, thickness: 0.004, bone: ear });
    b.slab([
      ear.local([-0.009, 0.04, 0.033]),
      ear.local([0.010, 0.041, 0.033]),
      ear.local([0.001, 0.125, 0.023])
    ], { name: "inner ear light", color: C.lightBlush, thickness: 0.002, bone: ear });
  }

  const face = b.surface(skull);
  const jawSurface = b.surface(lowerJaw);
  const ball = new THREE.SphereGeometry(1, 12, 8);

  for (const s of [-1, 1]) {
    const hit = face.ray([s * 0.5, 1.373, 0.824], [-s, -0.012, -0.14])!;
    const socket = b.stick(ball, C.lavender, hit, {
      name: "velvet eye socket", scale: [0.064, 0.022, 0.074],
      embed: 0.5, flow: [0, 1, 0], bone: head
    });
    const white = b.stick(ball, C.white, hit, {
      name: "eye white", scale: [0.054, 0.020, 0.063],
      embed: 0.2, flow: [0, 1, 0], bone: head
    });
    const iris = b.stick(ball, C.iris, white.moved([s * 0.005, 0.014, 0]), {
      name: "violet iris", scale: [0.044, 0.015, 0.052],
      embed: 0.5, flow: [0, 1, 0], bone: head
    });
    const pupil = b.stick(ball, C.pupil, iris.moved([s * 0.004, 0.010, -0.001]), {
      name: "large gentle pupil", scale: [0.029, 0.012, 0.041],
      embed: 0.5, flow: [0, 1, 0], bone: head
    });
    b.part(ball, C.white, {
      name: "eye catchlight", at: pupil.local([-s * 0.01, 0.011, 0.021]),
      quat: pupil.quat, scale: [0.013, 0.005, 0.015], bone: head
    });
    b.part(ball, C.white, {
      name: "small eye sparkle", at: pupil.local([s * 0.012, 0.011, -0.018]),
      quat: pupil.quat, scale: [0.0055, 0.003, 0.006], bone: head
    });
    b.sweep(catmull([
      socket.local([-0.060, 0.008, 0.012]),
      socket.local([-0.041, 0.010, 0.054]),
      socket.local([0, 0.010, 0.074]),
      socket.local([0.040, 0.010, 0.056]),
      socket.local([0.060, 0.008, 0.016])
    ]), 0.007, {
      name: "upper eyelid", color: C.lavender, bone: head,
      sides: 6, smooth: false, caps: "round"
    });

    const noseHit = face.ray([s * 0.40, 1.238, 1.026], [-s, 0, 0])!;
    const nostril = b.stick(ball, C.nose, noseHit, {
      name: "nostril rim", scale: [0.023, 0.007, 0.030],
      embed: 0.6, flow: [0, 1, 0.15], bone: head
    });
    b.stick(ball, C.nostril, nostril.moved([0, 0.0045, 0.003]), {
      name: "nostril", scale: [0.014, 0.003, 0.022],
      embed: 0.5, flow: [0, 1, 0.15], bone: head
    });

    const smile = jawSurface.drape(polyline([
      [s * 0.093, 1.184, 0.908],
      [s * 0.104, 1.157, 0.978],
      [s * 0.097, 1.153, 1.06]
    ]), { lift: 0.0014 });
    b.sweep(smile, 0.0028, {
      name: "mouth corner", color: C.mouth, bone: jaw, sides: 5, caps: "round"
    });

    for (let i = 0; i < 3; i++) {
      const h = face.ray(
        [s * 0.4, 1.277 - i * 0.013, 0.854 + i * 0.014], [-s, 0, 0]
      );
      if (h) b.stick(new THREE.SphereGeometry(1, 6, 4), C.cream, h, {
        name: "cheek freckle", scale: [0.006, 0.0018, 0.005],
        embed: 0.4, bone: head
      });
    }
  }

  // A little, carved-looking horn: broad facets and a raised helical gold thread.
  const hornBase = new THREE.Vector3(0, 1.493, 0.737);
  const hornAxis = new THREE.Vector3(0, 0.946, 0.324).normalize();
  b.lathe([
    [0, 0], [0.045, 0], [0.043, 0.035], [0.030, 0.139],
    [0.015, 0.225], [0.002, 0.288], [0, 0.302]
  ], {
    name: "little ivory gold horn", at: hornBase, axis: hornAxis,
    segments: 9, color: C.paleGold, bone: head
  });
  b.part(new THREE.TorusGeometry(0.043, 0.007, 5, 12), C.gold, {
    name: "horn root ring", at: hornBase, dir: hornAxis, axis: "z", bone: head
  });
  const hu = new THREE.Vector3(1, 0, 0);
  const hv = hornAxis.clone().cross(hu);
  const helix: THREE.Vector3[] = [];
  for (let i = 0; i <= 66; i++) {
    const t = i / 66;
    const h = 0.015 + t * 0.266;
    const r = interpolate([0, 0.035, 0.139, 0.225, 0.288], [0.045, 0.043, 0.03, 0.015, 0.002], h);
    const angle = t * Math.PI * 2 * 3.15;
    helix.push(hornBase.clone().addScaledVector(hornAxis, h)
      .addScaledVector(hu, (r + 0.001) * Math.cos(angle))
      .addScaledVector(hv, (r + 0.001) * Math.sin(angle)));
  }
  b.sweep(catmull(helix), t => 0.0043 * (1 - 0.75 * t), {
    name: "spiral horn thread", color: C.gold, bone: head, sides: 5, caps: "round"
  });

  // The mane is a simple ridge under overlapping, faceted, teardrop locks.
  const skin = b.surface([torso, neckShape, skull]);
  const ridgeSeeds = [
    [0, 1.489, 0.529], [0, 1.409, 0.414], [0, 1.315, 0.294],
    [0, 1.221, 0.186], [0, 1.151, 0.077], [0, 1.11, -0.034]
  ];
  const ridgeHits = ridgeSeeds.map(p => skin.nearest(p));
  const ridgePoints = ridgeHits.map(h => h.at.addScaledVector(h.n, 0.019));
  b.sweep(catmull(ridgePoints), [0.043, 0.055, 0.055, 0.048, 0.036, 0.013], {
    name: "mane crest", color: C.lavender, bone: [spine, neck, head],
    sides: 8, smooth: false, caps: "round"
  });

  const lockColors = [C.lilac, C.blush, C.lilac, C.mint, C.blush, C.lilac];
  const strandColors = [C.lightLilac, C.lightBlush, C.lightLilac, C.lightMint, C.lightBlush, C.lightLilac];
  for (const s of [1, -1]) {
    const count = s === 1 ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const h = ridgeHits[i];
      const a = h.at.addScaledVector(h.n, 0.014);
      const length = s === 1 ? 0.175 : 0.133;
      const projected = (x: number, drop: number, forward: number, lift: number) => {
        const hit = skin.nearest([s * x, a.y - drop, a.z + forward]);
        return hit.at.addScaledVector(hit.n, lift);
      };
      const points = [
        a,
        projected(0.075, 0.038, 0.008, 0.034),
        projected(0.151, length * 0.7, 0.052, 0.029),
        projected(0.146, length, 0.091, 0.012)
      ];
      const lock = b.loft([
        { at: points[0], w: 0.052, h: 0.041 },
        { at: points[1], w: 0.091, h: 0.060 },
        { at: points[2], w: 0.073, h: 0.045 },
        { at: points[3], w: 0.007, h: 0.009 }
      ], {
        name: `mane lock ${s === 1 ? "L" : "R"}${i + 1}`,
        color: s === 1 ? lockColors[i] : [C.lilac, C.blush, C.lilac, C.mint][i],
        bone: h.bone!, up: [0, 0, -1], sides: 8, smooth: false, caps: "round"
      });
      b.sweep(lock.line(0, 0.001), [0.003, 0.004, 0.003, 0.0007], {
        name: "raised mane strand", color: strandColors[i],
        bone: h.bone!, sides: 5, caps: "round"
      });
    }
  }

  // Forelock curls beside the horn, leaving the equine forehead and both eyes open.
  const forelock = b.loft([
    { at: [-0.019, 1.519, 0.587], w: 0.079, h: 0.055 },
    { at: [0.034, 1.545, 0.677], w: 0.119, h: 0.063 },
    { at: [0.075, 1.48, 0.774], w: 0.103, h: 0.056 },
    { at: [0.036, 1.399, 0.834], w: 0.009, h: 0.01 }
  ], {
    name: "swept forelock", color: C.lilac, bone: head,
    up: [0, 1, 0], sides: 8, smooth: false, caps: "round"
  });
  b.sweep(forelock.line(0, 0.001), [0.004, 0.005, 0.003, 0.0005], {
    name: "forelock ribbon", color: C.lightLilac, bone: head, sides: 5
  });
  b.loft([
    { at: [-0.033, 1.526, 0.604], w: 0.045, h: 0.038 },
    { at: [-0.08, 1.515, 0.697], w: 0.06, h: 0.043 },
    { at: [-0.072, 1.441, 0.779], w: 0.008, h: 0.008 }
  ], {
    name: "small rose forelock", color: C.blush, bone: head,
    up: [0, 1, 0], sides: 7, smooth: false, caps: "round"
  });

  // An extended, soft horse-tail plume rather than a reptilian tail.
  b.sweep(tail, 0.033, {
    name: "tail root", from: 0, to: 0.24, color: coat,
    sides: 8, smooth: false, caps: "round"
  });
  const plume = b.sweep(tail, t => {
    const r = interpolate(
      [0.19, 0.35, 0.54, 0.75, 0.9, 1],
      [0.038, 0.081, 0.096, 0.079, 0.043, 0.002], t
    );
    return [r, r * 1.08];
  }, {
    name: "sherbet tail plume", from: 0.19, to: 1,
    color: C.lilac, sides: 10, smooth: false,
    sectors: [[15, 105, C.mint], [145, 245, C.blush]],
    caps: { start: "round", end: "point" }
  });
  for (const [angle, color] of [
    [0, C.lightLilac], [65, C.lightMint], [180, C.lightBlush], [285, C.lightLilac]
  ] as const) {
    b.sweep(plume.line(angle, 0.001), [0.0025, 0.0045, 0.004, 0.001], {
      name: "tail strand", color, bone: tail, sides: 5, caps: "round"
    });
  }

  // Quiet painted magic: small, flush birthmarks, not floating ornaments.
  const constellation = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 160">
      <path d="M78 27 L87 61 L116 72 L87 82 L77 117 L67 83 L38 72 L67 61 Z"
            fill="#dfb878"/>
      <path d="M78 42 L83 65 L102 72 L83 78 L77 101 L72 78 L53 72 L72 66 Z"
            fill="#f8dfaf"/>
      <path d="M133 29 L137 43 L151 47 L137 51 L133 65 L129 51 L115 47 L129 43 Z"
            fill="#c6a9d6"/>
      <circle cx="40" cy="110" r="5" fill="#cfb4db"/>
      <circle cx="117" cy="117" r="4" fill="#dfb878"/>
      <circle cx="145" cy="93" r="3" fill="#dfb878"/>
      <circle cx="39" cy="37" r="3" fill="#dfb878"/>
    </svg>
  `, { size: 384 });

  for (const s of [-1, 1]) {
    b.decal(torso, constellation, {
      name: "constellation birthmark", at: [s * 0.206, 0.949, -0.349],
      dir: [s, 0, 0], up: [0, 1, 0], size: [0.187, 0.167],
      mirror: s < 0, segments: [8, 8], lift: 0.0008
    });
  }

  // A few tiny cream dapples across the upper haunch, seated on the actual facets.
  const rumpSurface = b.surface(torso);
  const dapples = rumpSurface.scatter(12, {
    rng: random, minDist: 0.033,
    filter: h => h.at.z < -0.23 && h.at.y > 1.025 && Math.abs(h.at.x) > 0.065
  });
  for (const h of dapples) {
    b.stick(new THREE.SphereGeometry(1, 6, 4), C.cream, h, {
      name: "foal dapple", scale: [0.008, 0.0012, 0.006],
      embed: 0.55
    });
  }

  b.material(C.pupil).roughness = 0.2;
  b.material(C.iris).roughness = 0.32;
  b.material(C.white).roughness = 0.3;
  b.material(C.gold).metalness = 0.42;
  b.material(C.gold).roughness = 0.39;
  b.material(C.paleGold).metalness = 0.12;
  b.material(C.paleGold).roughness = 0.46;
  b.material(C.hoof).roughness = 0.56;

  return b.root;
}
```