```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

export const meta = {
  name: "Bamboo Bliss",
  description:
    "A delighted red panda balances on a moss-covered woodland branch, clutching a leafy bamboo shoot. Faceted russet fur, a smiling white face, and an extravagant cream-and-ginger tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo Bliss" });
  const random = rng(48127);

  type P = [number, number, number];
  const C = {
    rust: "#B55432",
    rustLight: "#D47943",
    rustGold: "#C76736",
    rustDark: "#863F2D",
    tear: "#A5472D",
    cream: "#F1DBAF",
    white: "#F5EDDA",
    whiteShade: "#DED2B8",
    black: "#242628",
    blackLight: "#393334",
    nose: "#151A1B",
    eyeBrown: "#56352B",
    pink: "#D78987",
    claw: "#CBB99B",
    wood: "#62432E",
    woodDark: "#3D2C23",
    woodLight: "#80573A",
    cut: "#BD9462",
    cutLight: "#D3AF7A",
    cutRing: "#987047",
    mossDark: "#40582D",
    moss: "#637B38",
    mossLight: "#8C9D48",
    bamboo: "#7EAA44",
    bambooDark: "#477B36",
    bambooNode: "#B9C876",
    leaf: "#4E8B3D",
    leafLight: "#8FBA51",
    leafDark: "#326438",
    mushroom: "#B97B45",
  };

  const add = (p: P, x = 0, y = 0, z = 0): P => [
    p[0] + x, p[1] + y, p[2] + z,
  ];
  const lerpP = (a: P, c: P, t: number): P => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // Skeleton first. The woodland perch belongs to the stationary root.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hipsAt: P = [0, 0.785, -0.15];
  const chestAt: P = [0, 0.854, 0.12];
  const headAt: P = [0, 1.033, 0.274];
  const hp = (x = 0, y = 0, z = 0): P => add(headAt, x, y, z);

  const hips = b.joint("hips", {
    at: hipsAt, parent: root, aim: chestAt, role: "spine",
  });
  const chest = b.joint("chest", {
    at: chestAt, parent: hips, aim: [0, 0.954, 0.223], role: "spine",
  });
  const neck = b.joint("neck", {
    at: [0, 0.936, 0.216], parent: chest, aim: headAt, role: "neck",
  });
  const head = b.joint("head", {
    at: headAt, parent: neck, aim: hp(0, 0, 0.25), role: "head",
  });
  const jaw = b.joint("jaw", {
    at: hp(0, -0.102, 0.139), parent: head,
    aim: hp(0, -0.103, 0.24), role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      at: hp(s * 0.155, 0.113, -0.031),
      parent: head, dir: [s * 0.25, 1, 0], role: "hinge",
    })
  );

  const rear = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const hipAt: P = [s * 0.145, 0.775, -0.19];
    const kneeAt: P = [s * 0.206, 0.646, -0.225];
    const footAt: P = [s * 0.167, s === 1 ? 0.527 : 0.498, -0.175];
    const hip = b.joint(`hip${side}`, {
      at: hipAt, parent: hips, aim: kneeAt, role: "leg",
    });
    const knee = b.joint(`knee${side}`, {
      at: kneeAt, parent: hip, aim: footAt, role: "leg",
    });
    const ankle = b.joint(`ankle${side}`, {
      at: footAt, parent: knee, dir: [0, 0, 1], role: "leg",
    });
    const toes = [-1.5, -0.5, 0.5, 1.5].map((n, i) =>
      b.joint(`toe${side}${i + 1}`, {
        at: add(footAt, n * 0.024, -0.004, 0.065),
        parent: ankle, dir: [0, 0, 1], role: "digit",
      })
    );
    return { s, hipAt, kneeAt, footAt, hip, knee, ankle, toes };
  });

  const rightShoulderAt: P = [-0.16, 0.834, 0.115];
  const rightElbowAt: P = [-0.184, 0.684, 0.133];
  const rightWristAt: P = [-0.175, 0.544, 0.137];
  const shoulderR = b.joint("shoulderR", {
    at: rightShoulderAt, parent: chest, aim: rightElbowAt, role: "arm",
  });
  const elbowR = b.joint("elbowR", {
    at: rightElbowAt, parent: shoulderR, aim: rightWristAt, role: "arm",
  });
  const wristR = b.joint("wristR", {
    at: rightWristAt, parent: elbowR, dir: [0, 0, 1], role: "arm",
  });
  const plantedFingers = [-1.5, -0.5, 0.5, 1.5].map((n, i) =>
    b.joint(`fingerR${i + 1}`, {
      at: add(rightWristAt, n * 0.022, -0.023, 0.062),
      parent: wristR, dir: [0, 0, 1], role: "digit",
    })
  );

  const leftShoulderAt: P = [0.163, 0.838, 0.12];
  const leftElbowAt: P = [0.255, 0.725, 0.222];
  const leftWristAt: P = [0.352, 0.797, 0.345];
  const shoulderL = b.joint("shoulderL", {
    at: leftShoulderAt, parent: chest, aim: leftElbowAt, role: "arm",
  });
  const elbowL = b.joint("elbowL", {
    at: leftElbowAt, parent: shoulderL, aim: leftWristAt, role: "arm",
  });
  const wristL = b.joint("wristL", {
    at: leftWristAt, parent: elbowL, dir: [1, 0.15, 0], role: "arm",
  });
  const heldFingerPoints: P[] = [
    [0.380, 0.770, 0.373],
    [0.389, 0.794, 0.379],
    [0.389, 0.820, 0.374],
    [0.373, 0.839, 0.359],
  ];
  const heldFingers = heldFingerPoints.map((p, i) =>
    b.joint(i === 0 ? "thumbL" : `fingerL${i}`, {
      at: p, parent: wristL, dir: [1, 0, -0.2], role: "digit",
    })
  );

  const tailPoints: P[] = [
    [0, 0.78, -0.30],
    [-0.10, 0.725, -0.386],
    [-0.245, 0.645, -0.405],
    [-0.402, 0.572, -0.350],
    [-0.522, 0.565, -0.222],
    [-0.586, 0.617, -0.047],
    [-0.588, 0.713, 0.113],
  ];
  const tail = b.chain("tail", tailPoints, { parent: hips, role: "tail" });

  // Primitive helpers: all geometry enters through the builder.
  function ellipsoid(at: P, size: P, color: string, bone: any, segments = 14) {
    return b.part(new THREE.SphereGeometry(1, segments, 10), color, {
      at, scale: size, bone,
    });
  }

  function rod(a: P, c: P, r0: number, r1: number, color: string, bone: any, sides = 9) {
    const d: P = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const length = Math.hypot(...d);
    return b.part(new THREE.CylinderGeometry(r1, r0, length, sides, 1), color, {
      frame: frame(lerpP(a, c, 0.5), d), bone,
    });
  }

  function spike(base: P, tip: P, radius: number, color: string, bone: any, sides = 4) {
    return rod(base, tip, radius, 0, color, bone, sides);
  }

  function polygon(points: number[][], depth: number, at: P, color: string, bone: any) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    return b.part(
      new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: false, steps: 1, curveSegments: 1,
      }),
      color,
      { at, bone }
    );
  }

  // A folded, tapered leaf, with independently coloured halves.
  function leaf(a: P, tip: P, width: number, bone: any, light = C.leafLight, dark = C.leaf) {
    const d = new THREE.Vector3(tip[0] - a[0], tip[1] - a[1], tip[2] - a[2]);
    const across = new THREE.Vector3(d.y, -d.x, 0);
    if (across.lengthSq() < 0.00001) across.set(1, 0, 0);
    across.normalize().multiplyScalar(width);
    const ridge = new THREE.Vector3(0, 0, width * 0.26);
    const zero = new THREE.Vector3();
    const middle = d.clone().multiplyScalar(0.46).add(ridge);
    const left = d.clone().multiplyScalar(0.40).add(across);
    const right = d.clone().multiplyScalar(0.40).sub(across);
    const leftUpper = d.clone().multiplyScalar(0.73).addScaledVector(across, 0.56);
    const rightUpper = d.clone().multiplyScalar(0.73).addScaledVector(across, -0.56);

    function half(edge: THREE.Vector3, upper: THREE.Vector3, color: string, flip: boolean) {
      const verts = [zero, edge, upper, d, middle];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(
        verts.flatMap(v => [v.x, v.y, v.z]), 3
      ));
      const indices = flip
        ? [0, 4, 1, 1, 4, 2, 2, 4, 3]
        : [0, 1, 4, 1, 2, 4, 2, 3, 4];
      const both = [...indices];
      for (let i = 0; i < indices.length; i += 3)
        both.push(indices[i + 2], indices[i + 1], indices[i]);
      geo.setIndex(both);
      geo.computeVertexNormals();
      b.part(geo, color, { at: a, bone });
    }
    half(left, leftUpper, light, false);
    half(right, rightUpper, dark, true);
  }

  // The perch: a small, naturally forked branch on a rooted stump.
  b.part(new THREE.CylinderGeometry(0.091, 0.123, 0.407, 9, 1), C.wood, {
    at: [0, 0.2035, 0], bone: root,
  });
  for (const [x, z] of [[0.16, 0.08], [-0.16, 0.06], [0.045, -0.17]]) {
    rod([0, 0.091, 0], [x, 0.031, z], 0.061, 0.027, C.wood, root, 7);
  }
  const logA: P = [-0.84, 0.366, 0.095];
  const logB: P = [0.79, 0.463, 0.063];
  const mainLog = rod(logA, logB, 0.086, 0.067, C.wood, root, 11);
  const rearA: P = [-0.45, 0.368, -0.17];
  const rearB: P = [0.43, 0.442, -0.19];
  const rearLog = rod(rearA, rearB, 0.071, 0.069, C.wood, root, 9);
  rod([0, 0.311, 0], [0.055, 0.407, -0.17], 0.091, 0.063, C.wood, root);
  rod([0.56, 0.45, 0.068], [0.713, 0.584, -0.009], 0.033, 0.012, C.woodLight, root, 7);
  rod([-0.64, 0.38, 0.08], [-0.754, 0.443, 0.192], 0.025, 0.009, C.wood, root, 7);

  // Exposed wood ends with inset growth rings.
  function cutEnd(at: P, outward: P, radius: number) {
    b.part(new THREE.CylinderGeometry(radius, radius, 0.006, 11), C.cut, {
      frame: frame(at, outward), bone: root,
    });
    for (const fraction of [0.30, 0.56, 0.80]) {
      const geo = new THREE.TorusGeometry(radius * fraction, 0.0018, 3, 15);
      geo.rotateX(Math.PI / 2);
      b.part(geo, C.cutRing, {
        frame: frame(add(at, outward[0] * 0.004, outward[1] * 0.004, outward[2] * 0.004), outward),
        bone: root,
      });
    }
    ellipsoid(at, [radius * 0.105, radius * 0.105, radius * 0.105], C.cutRing, root, 8);
  }
  cutEnd(logA, [-0.998, -0.06, 0.02], 0.083);
  cutEnd(logB, [0.998, 0.06, -0.02], 0.065);
  cutEnd(rearA, [-0.996, -0.08, 0.02], 0.069);

  // Longitudinal bark splinters, rather than noisy all-over texture.
  for (let i = 0; i < 19; i++) {
    const t = 0.035 + random() * 0.78;
    const end = Math.min(0.97, t + 0.08 + random() * 0.19);
    const angle = -0.55 + random() * 3.6;
    const r = 0.079 - t * 0.016;
    const offsetY = Math.cos(angle) * r;
    const offsetZ = Math.sin(angle) * r;
    const a = add(lerpP(logA, logB, t), 0, offsetY, offsetZ);
    const c = add(lerpP(logA, logB, end), 0, offsetY, offsetZ);
    rod(a, c, 0.0027, 0.0015, i % 3 === 0 ? C.woodLight : C.woodDark, root, 4);
  }
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    rod(
      [Math.cos(angle) * 0.109, 0.036, Math.sin(angle) * 0.109],
      [Math.cos(angle + 0.07) * 0.091, 0.322, Math.sin(angle + 0.07) * 0.091],
      0.003, 0.002, i % 2 ? C.woodDark : C.woodLight, root, 4
    );
  }

  // Moss is seated on the log surfaces; its little facets form soft islands.
  const logSurface = b.surface(mainLog);
  const rearSurface = b.surface(rearLog);
  for (let i = 0; i < 39; i++) {
    const t = 0.035 + random() * 0.92;
    const p = lerpP(logA, logB, t);
    const hit = logSurface.nearest(add(p, 0, 0.14, (random() - 0.5) * 0.095));
    const geo = new THREE.IcosahedronGeometry(1, 0);
    geo.scale(0.029 + random() * 0.025, 0.010 + random() * 0.010, 0.024 + random() * 0.021);
    b.stick(geo, [C.moss, C.mossDark, C.mossLight][i % 3], hit);
    if (i % 5 === 0)
      b.stick(new THREE.ConeGeometry(0.008, 0.023, 3), C.mossLight, hit);
  }
  for (let i = 0; i < 13; i++) {
    const p = lerpP(rearA, rearB, 0.08 + i * 0.065);
    const geo = new THREE.IcosahedronGeometry(1, 0);
    geo.scale(0.035, 0.013, 0.033);
    b.stick(geo, i % 2 ? C.moss : C.mossDark,
      rearSurface.nearest(add(p, 0, 0.11, -0.005)));
  }

  // A little fern and two unobtrusive woodland mushrooms.
  const fernBase: P = [0.647, 0.521, 0.082];
  const fernTip: P = [0.672, 0.665, 0.091];
  rod(fernBase, fernTip, 0.003, 0.0015, C.mossDark, root, 5);
  for (let i = 0; i < 5; i++) {
    const a = lerpP(fernBase, fernTip, 0.15 + i * 0.15);
    const len = 0.052 - i * 0.006;
    leaf(a, add(a, len, 0.027, 0.004), 0.009, root, C.mossLight, C.moss);
    leaf(a, add(a, -len, 0.024, -0.009), 0.009, root, C.moss, C.mossDark);
  }
  for (const [x, y, z, scale] of [
    [-0.667, 0.458, 0.132, 1],
    [-0.723, 0.444, 0.128, 0.68],
  ]) {
    rod([x, y, z], [x, y + 0.038 * scale, z], 0.004 * scale, 0.005 * scale, C.whiteShade, root, 6);
    ellipsoid([x, y + 0.041 * scale, z], [0.023 * scale, 0.010 * scale, 0.021 * scale], C.mushroom, root, 10);
    ellipsoid([x - 0.005 * scale, y + 0.048 * scale, z + 0.009 * scale],
      [0.003 * scale, 0.0015 * scale, 0.003 * scale], C.cutLight, root, 6);
  }

  // Black underside and a bold russet saddle.
  b.sweep([hips, chest], 0.157, { color: C.black });
  const coat = ellipsoid([0, 0.839, -0.041], [0.211, 0.185, 0.281], C.rust, hips, 18);
  ellipsoid([0, 0.711, -0.021], [0.174, 0.112, 0.247], C.black, hips);
  ellipsoid([0, 0.813, 0.16], [0.16, 0.141, 0.096], C.black, chest);
  b.sweep([chest, neck, head], 0.104, { color: C.rust });
  ellipsoid([0, 0.912, 0.155], [0.165, 0.121, 0.126], C.rust, chest);

  // Sparse, deliberately chunky fur tufts on the silhouette.
  const coatSurface = b.surface(coat);
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z = -0.245 + (i / 17) * 0.39;
    const hit = coatSurface.nearest([side * 0.34, 0.81 + (i % 3) * 0.032, z]);
    const tuft = new THREE.ConeGeometry(0.016, 0.036, 3);
    tuft.scale(1, 1, 0.65);
    b.stick(tuft, i % 3 === 0 ? C.rustGold : C.rust, hit);
  }
  for (let i = 0; i < 12; i++) {
    const hit = coatSurface.nearest([
      (random() - 0.5) * 0.25, 1.12, -0.24 + random() * 0.36,
    ]);
    const tuft = new THREE.ConeGeometry(0.011, 0.022, 3);
    tuft.scale(1, 1, 0.6);
    b.stick(tuft, i % 4 === 0 ? C.rustLight : C.rustGold, hit);
  }

  // Stocky separated limbs, broad paws, and individual small claws.
  for (const leg of rear) {
    b.sweep([leg.hip, leg.knee, leg.ankle], 0.055, { color: C.black });
    ellipsoid(add(leg.hipAt, leg.s * 0.008, -0.025, -0.015),
      [0.077, 0.106, 0.088], C.black, leg.hip);
    ellipsoid(add(leg.footAt, 0, 0, 0.025), [0.065, 0.037, 0.077], C.black, leg.ankle, 12);
    ellipsoid(add(leg.kneeAt, leg.s * 0.037, 0.01, 0.012),
      [0.025, 0.066, 0.04], C.blackLight, leg.knee, 10);
    leg.toes.forEach((toe, i) => {
      const p = add(leg.footAt, (i - 1.5) * 0.024, -0.004, 0.068);
      ellipsoid(p, [0.011, 0.023, 0.025], C.black, toe, 10);
      spike(add(p, 0, 0.002, 0.017), add(p, 0, -0.003, 0.035), 0.005, C.claw, toe, 5);
    });
  }
  b.sweep([shoulderR, elbowR, wristR], 0.052, { color: C.black });
  ellipsoid(add(rightShoulderAt, 0, -0.015, 0), [0.065, 0.083, 0.07], C.black, shoulderR);
  ellipsoid(add(rightWristAt, 0, -0.020, 0.015), [0.06, 0.035, 0.075], C.black, wristR, 12);
  plantedFingers.forEach((finger, i) => {
    const p = add(rightWristAt, (i - 1.5) * 0.022, -0.024, 0.071);
    ellipsoid(p, [0.010, 0.021, 0.025], C.black, finger, 10);
    spike(add(p, 0, 0.002, 0.017), add(p, 0, -0.003, 0.035), 0.0047, C.claw, finger, 5);
  });

  b.sweep([shoulderL, elbowL, wristL], 0.047, { color: C.black });
  ellipsoid(leftShoulderAt, [0.062, 0.074, 0.067], C.black, shoulderL);
  ellipsoid(leftWristAt, [0.049, 0.043, 0.047], C.black, wristL, 12);
  heldFingers.forEach((finger, i) => {
    const p = heldFingerPoints[i];
    const start = add(leftWristAt, 0.012, (i - 1.5) * 0.016, 0.010);
    rod(start, p, 0.011, 0.010, C.black, finger, 7);
    ellipsoid(p, [0.014, 0.012, 0.016], C.blackLight, finger, 10);
    spike(add(p, 0.003, 0, -0.003), add(p, 0.017, -0.002, -0.014), 0.0043, C.claw, finger, 5);
  });

  // Oversized ringed tail. Fine sub-sections give a faceted, fluffy taper.
  function tailRadius(t: number) {
    if (t < 0.20) return 0.085 + t * 0.17;
    if (t < 0.72) return 0.119 - (t - 0.2) * 0.009;
    return 0.114 - ((t - 0.72) / 0.28) * 0.087;
  }
  const bandCount = 11;
  for (let band = 0; band < bandCount; band++) {
    for (let section = 0; section < 3; section++) {
      const a = (band + section / 3) / bandCount;
      const c = (band + (section + 1) / 3) / bandCount;
      const color = band % 2 === 1
        ? C.cream
        : section === 0 ? C.rustGold : C.rustLight;
      b.sweep(
        [tail.at(a), tail.at((a + c) / 2), tail.at(c)],
        tailRadius((a + c) / 2),
        { color }
      );
    }
  }
  b.part(new THREE.SphereGeometry(0.028, 10, 7), C.rustLight, { at: tail.at(1) });

  // Round head and a sculptural white facial mask.
  ellipsoid(headAt, [0.217, 0.177, 0.166], C.rust, head, 20);
  ellipsoid(hp(0, -0.027, 0.114), [0.191, 0.139, 0.067], C.white, head, 20);
  ellipsoid(hp(0, 0.069, 0.110), [0.139, 0.058, 0.045], C.white, head, 16);

  for (let index = 0; index < 2; index++) {
    const s = index === 0 ? 1 : -1;
    const ear = ears[index];
    const at = hp(s * 0.155, 0.113, -0.031);
    const outline = [
      [-0.077, -0.029], [-0.074, 0.035], [-0.027, 0.147],
      [0.009, 0.161], [0.065, 0.053], [0.078, -0.032],
    ];
    const mapped = (scale: number, lift: number) =>
      outline.map(([x, y]) => [s * (x * scale + y * 0.20), y * scale + lift]);
    polygon(mapped(1, 0), 0.029, at, C.rustDark, ear);
    polygon(mapped(0.91, 0.002), 0.011, add(at, 0, 0, 0.029), C.white, ear);
    polygon(mapped(0.65, 0.010), 0.006, add(at, 0, 0, 0.041), C.blackLight, ear);
    polygon(
      [[s * -0.037, 0.004], [s * -0.013, 0.067], [s * 0.038, 0.009]],
      0.005, add(at, 0, 0, 0.048), C.whiteShade, ear
    );

    // Angular cheek whisker-fur fans reinforce the panda's wide white face.
    const cheekOutline = [
      [0.142, -0.034], [0.189, -0.028], [0.202, -0.048],
      [0.225, -0.057], [0.202, -0.077], [0.215, -0.095],
      [0.175, -0.103], [0.146, -0.082],
    ].map(([x, y]) => [s * x, y]);
    polygon(cheekOutline, 0.026, hp(0, 0, 0.080), C.white, head);
    ellipsoid(hp(s * 0.145, -0.065, 0.115),
      [0.056, 0.058, 0.044], C.white, head, 12);

    // Rust tear marks travel down and out from each eye.
    ellipsoid(hp(s * 0.096, -0.011, 0.163),
      [0.052, 0.057, 0.014], C.tear, head, 14);
    ellipsoid(hp(s * 0.121, -0.063, 0.150),
      [0.026, 0.043, 0.013], C.tear, head, 12);
    ellipsoid(hp(s * 0.129, -0.086, 0.133),
      [0.016, 0.024, 0.012], C.rustGold, head, 10);

    // Bright, glossy-looking eyes and lifted creamy eyebrows.
    ellipsoid(hp(s * 0.094, 0.014, 0.183),
      [0.030, 0.034, 0.015], C.nose, head, 16);
    ellipsoid(hp(s * 0.094, 0.007, 0.194),
      [0.021, 0.024, 0.006], C.eyeBrown, head, 14);
    ellipsoid(hp(s * 0.092, 0.017, 0.199),
      [0.018, 0.023, 0.005], C.nose, head, 14);
    ellipsoid(hp(s * 0.085, 0.029, 0.204),
      [0.008, 0.009, 0.0035], C.white, head, 10);
    ellipsoid(hp(s * 0.106, 0.004, 0.203),
      [0.0033, 0.004, 0.002], C.whiteShade, head, 8);
    ellipsoid(hp(s * 0.096, 0.056, 0.160),
      [0.057, 0.017, 0.015], C.white, head, 14);
  }

  // Separate upper muzzle and lower jaw: an open, delighted little smile.
  ellipsoid(hp(-0.040, -0.061, 0.177), [0.060, 0.038, 0.049], C.white, head, 16);
  ellipsoid(hp(0.040, -0.061, 0.177), [0.060, 0.038, 0.049], C.white, head, 16);
  polygon(
    [[-0.034, 0.013], [-0.019, 0.020], [0.020, 0.020],
     [0.034, 0.011], [0.022, -0.006], [0, -0.021], [-0.023, -0.006]],
    0.018, hp(0, -0.047, 0.215), C.nose, head
  );
  ellipsoid(hp(-0.008, -0.038, 0.235), [0.011, 0.0035, 0.002], C.blackLight, head, 10);
  polygon(
    [[-0.044, 0.010], [-0.022, 0.003], [0, 0.007],
     [0.022, 0.003], [0.044, 0.010], [0.034, -0.012],
     [0.016, -0.026], [-0.016, -0.026], [-0.034, -0.012]],
    0.007, hp(0, -0.088, 0.183), C.nose, head
  );
  rod(hp(0, -0.067, 0.224), hp(0, -0.087, 0.215),
    0.0024, 0.0024, C.nose, head, 6);
  ellipsoid(hp(0, -0.111, 0.145), [0.067, 0.025, 0.049], C.white, jaw, 16);
  ellipsoid(hp(0, -0.105, 0.192), [0.023, 0.010, 0.006], C.pink, jaw, 12);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      ellipsoid(hp(s * (0.042 + (i % 2) * 0.013), -0.059 - i * 0.008, 0.220 - i * 0.006),
        [0.0021, 0.0021, 0.0012], C.blackLight, head, 7);
    }
    for (let i = 0; i < 2; i++) {
      rod(
        hp(s * 0.088, -0.066 - i * 0.014, 0.191),
        hp(s * (0.183 + i * 0.016), -0.061 - i * 0.028, 0.192),
        0.0008, 0.00035, C.whiteShade, head, 4
      );
    }
  }

  // Fresh bamboo, rigidly held by the raised paw.
  const bambooBottom: P = [0.390, 0.747, 0.345];
  const bambooTop: P = [0.432, 1.218, 0.359];
  rod(bambooBottom, bambooTop, 0.013, 0.009, C.bamboo, wristL, 8);
  rod(bambooTop, [0.474, 1.279, 0.367], 0.009, 0.003, C.bamboo, wristL, 7);
  for (const t of [0.16, 0.37, 0.59, 0.81, 0.98]) {
    const p = lerpP(bambooBottom, bambooTop, t);
    const axis: P = [0.089, 0.996, 0.030];
    b.part(new THREE.CylinderGeometry(0.0155 - t * 0.003, 0.0155 - t * 0.003, 0.007, 8),
      C.bambooNode, { frame: frame(p, axis), bone: wristL });
    rod(add(p, -0.008, -0.026, -0.002), add(p, -0.010, -0.003, -0.002),
      0.002, 0.001, C.bambooDark, wristL, 4);
  }
  const shootBranches: { a: P; c: P }[] = [
    { a: [0.424, 1.117, 0.356], c: [0.549, 1.172, 0.365] },
    { a: [0.430, 1.194, 0.359], c: [0.338, 1.247, 0.368] },
    { a: [0.420, 1.060, 0.354], c: [0.496, 1.085, 0.398] },
  ];
  for (const twig of shootBranches)
    rod(twig.a, twig.c, 0.0033, 0.0015, C.bambooDark, wristL, 5);

  leaf([0.473, 1.139, 0.361], [0.583, 1.266, 0.373], 0.021, wristL);
  leaf([0.516, 1.157, 0.364], [0.684, 1.188, 0.385], 0.025, wristL);
  leaf([0.545, 1.172, 0.365], [0.647, 1.107, 0.386], 0.019, wristL, C.leaf, C.leafDark);
  leaf([0.396, 1.214, 0.363], [0.307, 1.324, 0.378], 0.020, wristL);
  leaf([0.370, 1.230, 0.366], [0.261, 1.245, 0.392], 0.020, wristL, C.leaf, C.leafDark);
  leaf([0.456, 1.253, 0.363], [0.497, 1.376, 0.374], 0.018, wristL);
  leaf([0.456, 1.070, 0.375], [0.539, 1.015, 0.423], 0.019, wristL);
  leaf([0.482, 1.080, 0.389], [0.618, 1.076, 0.422], 0.020, wristL, C.leaf, C.leafDark);

  return b.root;
}
```