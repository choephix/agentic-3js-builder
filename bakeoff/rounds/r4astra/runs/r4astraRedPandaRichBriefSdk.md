```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Bamboo Balancing Act",
  description:
    "A delighted red panda balances on a weathered, moss-covered branch, holding fresh bamboo. Angular ivory cheek ruffs, russet tear marks, charcoal paws and a generous cream-and-ginger tail give it a handmade woodland-puppet character."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo Balancing Act" });
  const random = rng(48127);

  const C = {
    rust: "#B9512C",
    red: "#CE6535",
    lightRust: "#DE7B43",
    darkRust: "#8D3827",
    tear: "#AD452C",
    cream: "#F3E8CB",
    white: "#FFF4DB",
    buff: "#E9C68D",
    tailOrange: "#CD743C",
    tailDark: "#A44C2C",
    black: "#282629",
    blackLight: "#373136",
    nose: "#171D21",
    pad: "#66504D",
    mouth: "#48252D",
    tongue: "#E58C8B",
    ear: "#795047",
    wood: "#665044",
    woodLight: "#89664B",
    woodDark: "#3F3731",
    cut: "#B48B5D",
    grain: "#765237",
    moss: "#627B36",
    mossLight: "#8CA346",
    mossDark: "#3F5932",
    mossGold: "#A4AF56",
    bamboo: "#64974C",
    bambooLight: "#A1BF67",
    bambooDark: "#3C6941",
    leaf: "#477E46",
    leafLight: "#80AD59",
    leafDark: "#305D3C",
    mushroom: "#C6945B"
  };

  type P = number[] | THREE.Vector3;
  const V = (p: P) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
  const mix = (a: P, c: P, t: number) => V(a).lerp(V(c), t);

  function joint(name: string, at: P, parent: any, role: string, aim?: P): any {
    const j = b.joint(name, { at, parent, role, ...(aim ? { aim } : {}) } as any);
    const bone = (j as any).bone || j;
    if (bone.userData) bone.userData.role = role;
    return j;
  }

  // The skeleton is established before any of the visible pieces.
  const root = joint("root", [0, 0, 0], undefined, "spine");
  const hips = joint("hips", [0, 0.544, -0.025], root, "spine");
  const chest = joint("chest", [0, 0.744, -0.009], hips, "spine");
  const neck = joint("neck", [0, 0.812, 0.013], chest, "neck");
  const head = joint("head", [0, 0.907, 0.031], neck, "head");
  const jaw = joint("jaw", [0, 0.835, 0.133], head, "jaw", [0, 0.832, 0.24]);
  const earL = joint("earL", [0.129, 1.003, 0.024], head, "hinge");
  const earR = joint("earR", [-0.129, 1.003, 0.024], head, "hinge");

  const legs = [-1, 1].map(s => {
    const suffix = s === 1 ? "L" : "R";
    const hp = [s * 0.095, 0.553, -0.013];
    const kp = [s * 0.130, 0.465, 0.050];
    const ap = [s * 0.133, 0.400, 0.064];
    const hip = joint("hip" + suffix, hp, hips, "leg", kp);
    const knee = joint("knee" + suffix, kp, hip, "leg", ap);
    const ankle = joint("ankle" + suffix, ap, knee, "leg", [s * 0.133, 0.385, 0.14]);
    const toes = [-1, 0, 1].map((d, i) =>
      joint("toe" + suffix + (i + 1), [s * 0.133 + d * 0.028, 0.389, 0.116], ankle, "digit")
    );
    return { s, hp, kp, ap, hip, knee, ankle, toes };
  });

  const shoulderL = joint("shoulderL", [0.130, 0.752, 0.014], chest, "arm");
  const elbowL = joint("elbowL", [0.235, 0.708, 0.076], shoulderL, "arm");
  const wristL = joint("wristL", [0.309, 0.780, 0.163], elbowL, "arm");
  const shoulderR = joint("shoulderR", [-0.131, 0.753, 0.010], chest, "arm");
  const elbowR = joint("elbowR", [-0.251, 0.713, 0.048], shoulderR, "arm");
  const wristR = joint("wristR", [-0.356, 0.743, 0.080], elbowR, "arm");

  const gripPaths = [0, 1, 2].map(i => [
    [0.352, 0.771 + i * 0.019, 0.174],
    [0.361, 0.774 + i * 0.019, 0.209],
    [0.336, 0.777 + i * 0.019, 0.226],
    [0.321, 0.778 + i * 0.019, 0.217]
  ]);
  const grip = gripPaths.map((p, i) =>
    b.chain("fingerL" + (i + 1), p, { parent: wristL, role: "digit" } as any)
  );
  const thumbPath = [[0.294, 0.768, 0.183], [0.305, 0.756, 0.211], [0.328, 0.765, 0.219]];
  const thumb = b.chain("thumbL", thumbPath, { parent: wristL, role: "digit" } as any);

  const openPaths = [-1, 0, 1].map(d => [
    [-0.380, 0.743 + d * 0.020, 0.089],
    [-0.409, 0.742 + d * 0.026, 0.099],
    [-0.425, 0.739 + d * 0.029, 0.109]
  ]);
  const openDigits = openPaths.map((p, i) =>
    b.chain("fingerR" + (i + 1), p, { parent: wristR, role: "digit" } as any)
  );
  const thumbR = b.chain(
    "thumbR",
    [[-0.364, 0.718, 0.091], [-0.383, 0.697, 0.105], [-0.404, 0.700, 0.113]],
    { parent: wristR, role: "digit" } as any
  );

  const tailCurve = new THREE.CatmullRomCurve3([
    V([0, 0.542, -0.117]),
    V([-0.133, 0.500, -0.171]),
    V([-0.287, 0.499, -0.106]),
    V([-0.422, 0.474, 0.013]),
    V([-0.509, 0.388, 0.109]),
    V([-0.530, 0.273, 0.166]),
    V([-0.470, 0.199, 0.217]),
    V([-0.365, 0.191, 0.254])
  ]);
  const tailPoints = Array.from({ length: 12 }, (_, i) => tailCurve.getPointAt(i / 11));
  const tail = b.chain("tail", tailPoints, { parent: hips, role: "tail" } as any);

  function ellipsoid(at: P, scale: number[], color: string, bone: any, detail = 1) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(scale[0], scale[1], scale[2]);
    return b.part(g, color, { at, bone });
  }

  function rod(a: P, c: P, r1: number, r2: number, color: string, bone: any, sides = 8) {
    const av = V(a), cv = V(c), delta = cv.clone().sub(av);
    return b.part(
      new THREE.CylinderGeometry(r2, r1, delta.length(), sides, 1),
      color,
      { at: av.clone().add(cv).multiplyScalar(0.5), dir: delta, bone }
    );
  }

  function tube(path: any, radius: number, color: string, bone?: any, sides = 8) {
    return b.sweep(path, radius, { color, bone, sides, radialSegments: sides } as any);
  }

  function polygon(points: number[][], depth: number, color: string, at: P, bone: any) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: false, steps: 1, curveSegments: 1
    });
    geo.translate(0, 0, -depth * 0.5);
    return b.part(geo, color, { at, bone });
  }

  // An irregular, naturally supported fallen branch, rather than a display stand.
  const branchPoints = [
    [-0.758, 0.059, -0.039],
    [-0.569, 0.171, -0.026],
    [-0.349, 0.267, -0.018],
    [-0.098, 0.292, -0.005],
    [0.245, 0.312, -0.008],
    [0.584, 0.373, -0.025],
    [0.794, 0.338, -0.049]
  ];
  const branch = tube(branchPoints, 0.069, C.wood, root, 9);
  const forkPoints = [
    [-0.279, 0.259, -0.025],
    [-0.084, 0.159, -0.166],
    [0.178, 0.036, -0.270]
  ];
  tube(forkPoints, 0.039, C.wood, root, 7);
  tube([[0.479, 0.352, -0.029], [0.554, 0.467, -0.077], [0.657, 0.486, -0.111]],
    0.022, C.woodLight, root, 7);

  const end = V(branchPoints[branchPoints.length - 1]);
  const endDir = end.clone().sub(V(branchPoints[branchPoints.length - 2])).normalize();
  b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.004, 9), C.cut,
    { at: end.clone().addScaledVector(endDir, 0.002), dir: endDir, bone: root });
  for (const rr of [0.022, 0.044, 0.057]) {
    const geo = new THREE.TorusGeometry(rr, 0.0016, 3, 12);
    geo.rotateX(Math.PI / 2);
    b.part(geo, C.grain, {
      at: end.clone().addScaledVector(endDir, 0.0045), dir: endDir, bone: root
    });
  }
  const endU = new THREE.Vector3().crossVectors(endDir, V([0, 0, 1])).normalize();
  const endW = new THREE.Vector3().crossVectors(endDir, endU).normalize();
  for (const angle of [0.8, 3.2, 5.4]) {
    const dir = endU.clone().multiplyScalar(Math.cos(angle)).addScaledVector(endW, Math.sin(angle));
    const p = end.clone().addScaledVector(endDir, 0.006);
    rod(p.clone().addScaledVector(dir, 0.036), p.clone().addScaledVector(dir, 0.063),
      0.001, 0.0018, C.grain, root, 4);
  }

  const barkSurface = b.surface(branch);
  // Creases lie on the wood, following its bends.
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    const x = -0.69 + t * 1.40;
    const y = 0.10 + Math.min(1, (x + 0.72) / 0.75) * 0.21;
    const rough = [
      [x - 0.05, y - 0.025, 0.052],
      [x, y - 0.019 + (random() - 0.5) * 0.025, 0.061],
      [x + 0.070, y - 0.007, 0.058]
    ];
    tube(barkSurface.drape(rough), 0.0025, i % 3 === 0 ? C.woodLight : C.woodDark, root, 5);
  }

  const mossColors = [C.moss, C.mossLight, C.mossDark, C.mossGold];
  for (let i = 0; i < 120; i++) {
    const t = random();
    const seg = Math.min(branchPoints.length - 2, Math.floor(t * (branchPoints.length - 1)));
    const p = mix(branchPoints[seg], branchPoints[seg + 1], t * (branchPoints.length - 1) - seg);
    const z = p.z + (random() - 0.5) * 0.084;
    const hit = barkSurface.nearest([p.x, p.y + 0.18, z]);
    const geo = new THREE.IcosahedronGeometry(1, 0);
    geo.scale(0.012 + random() * 0.022, 0.006 + random() * 0.011, 0.011 + random() * 0.018);
    b.stick(geo, mossColors[Math.floor(random() * mossColors.length)], hit);
    if (i % 8 === 0) {
      const tuft = new THREE.ConeGeometry(0.006, 0.025, 4);
      b.stick(tuft, C.mossGold, hit);
    }
  }

  // A few small shelf fungi, tucked below the moss line.
  for (let i = 0; i < 3; i++) {
    const p = [-0.527 + i * 0.039, 0.187 + i * 0.006, 0.042];
    ellipsoid(p, [0.030, 0.007, 0.024], C.mushroom, root);
    ellipsoid([p[0], p[1] + 0.004, p[2] - 0.005],
      [0.026, 0.006, 0.020], C.woodLight, root);
  }

  // Simple substantial volumes keep the animal distinctly puppet-like.
  tube([hips, chest, neck], 0.107, C.rust, undefined, 12);
  ellipsoid([0, 0.650, -0.029], [0.172, 0.210, 0.142], C.rust, hips, 2);
  ellipsoid([0, 0.703, -0.035], [0.163, 0.158, 0.140], C.red, chest, 2);
  ellipsoid([0, 0.637, 0.074], [0.136, 0.174, 0.077], C.black, hips, 2);
  ellipsoid([0, 0.753, 0.064], [0.115, 0.079, 0.078], C.blackLight, chest, 1);

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.144 + i * 0.003);
      const y = 0.729 - i * 0.064;
      polygon(
        [[0, 0.042], [s * 0.038, -0.006], [s * 0.020, -0.002],
          [s * 0.031, -0.043], [-s * 0.024, -0.026]],
        0.030, i === 0 ? C.lightRust : C.red, [x, y, 0.002], chest
      );
    }
  }

  for (const leg of legs) {
    tube([leg.hip, leg.knee, leg.ankle], 0.039, C.black, undefined, 9);
    ellipsoid(mix(leg.hp, leg.kp, 0.40), [0.066, 0.079, 0.063], C.blackLight, leg.hip, 1);
    ellipsoid([leg.s * 0.133, 0.395, 0.087], [0.064, 0.039, 0.082], C.black, leg.ankle, 1);
    leg.toes.forEach((toe: any, i: number) => {
      const x = leg.s * 0.133 + (i - 1) * 0.029;
      ellipsoid([x, 0.392, 0.140], [0.020, 0.024, 0.038], C.blackLight, toe, 1);
      rod([x, 0.393, 0.162], [x, 0.381, 0.183], 0.006, 0.0008, C.buff, toe, 5);
    });
  }

  tube([shoulderL, elbowL, wristL], 0.033, C.black, undefined, 9);
  tube([shoulderR, elbowR, wristR], 0.033, C.black, undefined, 9);
  ellipsoid([0.157, 0.742, 0.020], [0.063, 0.065, 0.061], C.red, shoulderL, 1);
  ellipsoid([-0.158, 0.740, 0.017], [0.061, 0.063, 0.060], C.red, shoulderR, 1);
  ellipsoid([0.217, 0.715, 0.065], [0.047, 0.045, 0.043], C.blackLight, elbowL, 1);
  ellipsoid([-0.247, 0.719, 0.049], [0.051, 0.040, 0.041], C.blackLight, elbowR, 1);
  ellipsoid([0.325, 0.789, 0.173], [0.037, 0.047, 0.035], C.black, wristL, 1);
  ellipsoid([-0.374, 0.742, 0.083], [0.044, 0.038, 0.035], C.black, wristR, 1);
  ellipsoid([-0.380, 0.742, 0.112], [0.019, 0.021, 0.005], C.pad, wristR, 1);

  grip.forEach((chain, i) => {
    tube(chain, 0.0083, C.blackLight, undefined, 7);
    rod(gripPaths[i][3], [0.317, 0.777 + i * 0.019, 0.207],
      0.0034, 0.0005, C.buff, wristL, 5);
  });
  tube(thumb, 0.010, C.black, undefined, 7);
  openDigits.forEach((chain, i) => {
    tube(chain, 0.010, C.blackLight, undefined, 7);
    const p = openPaths[i][2];
    rod(p, [p[0] - 0.014, p[1] - 0.004, p[2] + 0.009],
      0.004, 0.0004, C.buff, wristR, 5);
    ellipsoid([p[0] + 0.009, p[1], p[2] + 0.007], [0.009, 0.009, 0.003],
      C.pad, wristR, 1);
  });
  tube(thumbR, 0.0095, C.black, undefined, 7);

  // The tail has a continuous rigged core and broad, faceted annular fur sections.
  tube(tail, 0.015, C.tailOrange, undefined, 10);
  const tailRadius = (t: number) =>
    0.058 + 0.027 * Math.sin(Math.PI * t) - 0.040 * Math.pow(t, 4);

  function tailBand(a: number, c: number, color: string, cap = false) {
    const sides = 12, rows = 4;
    const origin = tailCurve.getPointAt((a + c) / 2);
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let row = 0; row <= rows; row++) {
      const t = a + (c - a) * row / rows;
      const center = tailCurve.getPointAt(t);
      const tangent = tailCurve.getTangentAt(t).normalize();
      const u = new THREE.Vector3().crossVectors(tangent, V([0, 0, 1])).normalize();
      const w = new THREE.Vector3().crossVectors(tangent, u).normalize();
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2;
        const r = tailRadius(t) * (1 + 0.025 * Math.cos(angle * 3 + t * 7));
        const p = center.clone()
          .addScaledVector(u, Math.cos(angle) * r)
          .addScaledVector(w, Math.sin(angle) * r)
          .sub(origin);
        vertices.push(p.x, p.y, p.z);
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let j = 0; j < sides; j++) {
        const p = row * (sides + 1) + j, q = p + sides + 1;
        indices.push(p, q, p + 1, p + 1, q, q + 1);
      }
    }
    if (cap) {
      const center = tailCurve.getPointAt(c).sub(origin);
      const index = vertices.length / 3;
      vertices.push(center.x, center.y, center.z);
      for (let j = 0; j < sides; j++)
        indices.push(rows * (sides + 1) + j, index, rows * (sides + 1) + j + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    b.part(geo, color, { at: tail.at((a + c) / 2).moved(origin) });
  }

  for (let i = 0; i < 12; i++) {
    tailBand(i / 12, (i + 1) / 12,
      i % 2 === 0 ? (i < 3 ? C.tailDark : C.tailOrange) : C.buff, i === 11);
  }

  // Broad red skull, ivory mask, pointed white-rimmed ears and cheek ruffs.
  ellipsoid([0, 0.908, 0.023], [0.177, 0.142, 0.138], C.red, head, 2);
  const mask = ellipsoid([0, 0.897, 0.119], [0.155, 0.116, 0.075], C.cream, head, 2);

  for (const s of [-1, 1]) {
    const earBone = s === 1 ? earL : earR;
    const earAt = [s * 0.129, 1.003, 0.024];
    polygon(
      [[-s * 0.047, -0.025], [-s * 0.038, 0.030], [s * 0.005, 0.114],
        [s * 0.066, 0.062], [s * 0.052, -0.030]],
      0.045, C.rust, earAt, earBone
    );
    polygon(
      [[-s * 0.044, -0.016], [-s * 0.031, 0.035], [s * 0.006, 0.109],
        [s * 0.061, 0.060], [s * 0.047, -0.022]],
      0.012, C.white, [earAt[0], earAt[1], 0.053], earBone
    );
    polygon(
      [[-s * 0.023, 0.004], [-s * 0.018, 0.036], [s * 0.009, 0.079],
        [s * 0.039, 0.047], [s * 0.027, -0.001]],
      0.006, C.ear, [earAt[0], earAt[1], 0.062], earBone
    );
    polygon(
      [[-s * 0.007, 0.004], [s * 0.008, 0.050], [s * 0.025, 0.026],
        [s * 0.022, -0.007]],
      0.003, C.darkRust, [earAt[0], earAt[1], 0.066], earBone
    );

    polygon(
      [[-s * 0.028, 0.048], [s * 0.026, 0.028], [s * 0.063, 0.003],
        [s * 0.036, 0.000], [s * 0.047, -0.027], [s * 0.019, -0.019],
        [s * 0.022, -0.053], [-s * 0.033, -0.030]],
      0.037, C.cream, [s * 0.143, 0.879, 0.107], head
    );
    polygon(
      [[-s * 0.016, 0.032], [s * 0.040, 0.004], [s * 0.014, 0.002],
        [s * 0.023, -0.024], [-s * 0.028, -0.009]],
      0.012, C.white, [s * 0.144, 0.885, 0.133], head
    );
  }

  polygon([[-0.041, 0.011], [0.041, 0.011], [0.018, -0.033], [0, -0.047], [-0.018, -0.033]],
    0.012, C.red, [0, 1.008, 0.117], head);

  const faceSurface = b.surface(mask);
  for (const s of [-1, 1]) {
    const eyePatchGeo = new THREE.IcosahedronGeometry(1, 2);
    eyePatchGeo.scale(0.038, 0.008, 0.037);
    const patch = b.stick(eyePatchGeo, C.tear,
      faceSurface.nearest([s * 0.070, 0.926, 0.50]));

    const tearGeo = new THREE.IcosahedronGeometry(1, 1);
    tearGeo.scale(0.016, 0.007, 0.042);
    b.stick(tearGeo, C.tear, faceSurface.nearest([s * 0.086, 0.874, 0.50]));
    const tipGeo = new THREE.IcosahedronGeometry(1, 1);
    tipGeo.scale(0.009, 0.004, 0.020);
    b.stick(tipGeo, C.red, faceSurface.nearest([s * 0.091, 0.846, 0.48]));

    const eyeGeo = new THREE.IcosahedronGeometry(1, 2);
    eyeGeo.scale(0.020, 0.010, 0.023);
    const eye = b.stick(eyeGeo, C.nose,
      b.surface(patch).nearest([s * 0.067, 0.934, 0.55]));
    b.stick(new THREE.IcosahedronGeometry(0.0053, 1), C.white,
      b.surface(eye).nearest([s * 0.067 - 0.005, 0.943, 0.65]));
    b.stick(new THREE.IcosahedronGeometry(0.0021, 1), C.buff,
      b.surface(eye).nearest([s * 0.067 + 0.006, 0.928, 0.65]));

    const brow = new THREE.IcosahedronGeometry(1, 1);
    brow.scale(0.034, 0.006, 0.012);
    b.stick(brow, C.white, faceSurface.nearest([s * 0.065, 0.969, 0.46]));
  }

  // Upper muzzle and the independently rigged smiling lower jaw.
  ellipsoid([0, 0.837, 0.215], [0.055, 0.021, 0.027], C.mouth, jaw, 2);
  ellipsoid([0, 0.820, 0.196], [0.056, 0.017, 0.041], C.cream, jaw, 1);
  ellipsoid([0, 0.829, 0.238], [0.022, 0.008, 0.009], C.tongue, jaw, 1);
  for (const s of [-1, 1]) {
    ellipsoid([s * 0.030, 0.861, 0.192], [0.043, 0.029, 0.042], C.white, head, 2);
    tube([
      [s * 0.017, 0.849, 0.234],
      [s * 0.036, 0.844, 0.232],
      [s * 0.054, 0.854, 0.219]
    ], 0.0028, C.mouth, head, 5);
    for (let k = 0; k < 3; k++) {
      ellipsoid([s * (0.034 + k * 0.009), 0.867 - (k % 2) * 0.007, 0.230 - k * 0.002],
        [0.0018, 0.0018, 0.0012], C.pad, head, 0);
    }
    for (let k = 0; k < 2; k++) {
      rod([s * 0.050, 0.861 - k * 0.009, 0.219],
        [s * (0.120 + k * 0.012), 0.875 - k * 0.027, 0.223 - k * 0.009],
        0.0012, 0.00035, C.cream, head, 4);
    }
  }
  ellipsoid([0, 0.879, 0.229], [0.025, 0.017, 0.016], C.nose, head, 1);
  ellipsoid([-0.007, 0.886, 0.240], [0.007, 0.0027, 0.0015], C.blackLight, head, 1);
  rod([0, 0.868, 0.235], [0, 0.851, 0.235], 0.0026, 0.0023, C.mouth, head, 5);

  // Fresh bamboo: thickened nodes, split shoot sheaths and folded lanceolate leaves.
  const bambooA = V([0.282, 0.566, 0.194]);
  const bambooB = V([0.430, 1.184, 0.207]);
  const stalkDirection = bambooB.clone().sub(bambooA).normalize();

  for (let i = 0; i < 6; i++) {
    const p = mix(bambooA, bambooB, i / 6);
    const q = mix(bambooA, bambooB, (i + 1) / 6);
    rod(p, q, 0.015 - i * 0.0008, 0.0142 - i * 0.0008, C.bamboo, wristL, 8);
    rod(p.clone().addScaledVector(stalkDirection, -0.001),
      p.clone().addScaledVector(stalkDirection, 0.007),
      0.017 - i * 0.0008, 0.017 - i * 0.0008, C.bambooLight, wristL, 8);
    rod(p.clone().addScaledVector(stalkDirection, 0.008),
      p.clone().addScaledVector(stalkDirection, 0.011),
      0.0145 - i * 0.0008, 0.0145 - i * 0.0008, C.bambooDark, wristL, 8);
    rod(p.clone().add(V([-0.005, 0.011, 0.012])),
      q.clone().add(V([-0.005, -0.005, 0.010])),
      0.0014, 0.0008, C.bambooLight, wristL, 4);
  }
  for (const s of [-1, 1]) {
    polygon([[0, -0.036], [s * 0.024, 0.026], [s * 0.008, 0.005], [0, 0.058]],
      0.004, s === 1 ? C.bambooDark : C.bambooLight,
      [0.289 + s * 0.009, 0.609, 0.202], wristL);
  }

  function leaf(base: P, tip: P, width: number, color: string, bone: any) {
    const a = V(base), c = V(tip), d = c.clone().sub(a);
    const side = new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(width);
    const mid = a.clone().lerp(c, 0.43);
    const l = mid.clone().add(side);
    const r = mid.clone().addScaledVector(side, -0.72);
    const ridge = mid.clone().add(V([0, 0, 0.007]));
    const positions = [a, l, c, r, ridge].flatMap(p => [p.x - a.x, p.y - a.y, p.z - a.z]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex([
      0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4,
      4, 1, 0, 4, 2, 1, 4, 3, 2, 4, 0, 3
    ]);
    geo.computeVertexNormals();
    b.part(geo, color, { at: a, bone });
    rod(a.clone().add(V([0, 0, 0.002])), c, 0.0012, 0.0003, C.bambooLight, bone, 4);
  }

  const sprigs = [
    { t: 0.69, end: [0.527, 1.032, 0.204], tips: [[0.607, 1.110, 0.218], [0.608, 0.995, 0.215]] },
    { t: 0.85, end: [0.481, 1.134, 0.199], tips: [[0.532, 1.239, 0.217], [0.616, 1.171, 0.208]] },
    { t: 0.87, end: [0.355, 1.139, 0.207], tips: [[0.270, 1.218, 0.207], [0.272, 1.119, 0.231]] }
  ];
  sprigs.forEach((sprig, i) => {
    const p = mix(bambooA, bambooB, sprig.t);
    rod(p, sprig.end, 0.0035, 0.0016, C.bambooDark, wristL, 5);
    sprig.tips.forEach((tip, k) =>
      leaf(mix(p, sprig.end, k === 0 ? 0.67 : 1), tip, 0.020 + k * 0.002,
        (i + k) % 2 === 0 ? C.leaf : C.leafLight, wristL)
    );
  });
  leaf([0.429, 1.171, 0.207], [0.447, 1.293, 0.209], 0.017, C.leafDark, wristL);
  leaf([0.391, 1.024, 0.210], [0.445, 0.930, 0.235], 0.020, C.leaf, wristL);

  // Small woodland sprigs grow from the perch rather than a separate ground plane.
  for (const [x, y, z, s] of [
    [-0.602, 0.233, -0.021, -1],
    [0.571, 0.440, -0.032, 1],
    [-0.319, 0.328, -0.049, -1]
  ]) {
    const base = V([x, y, z]);
    const tip = base.clone().add(V([s * 0.025, 0.065, 0]));
    rod(base, tip, 0.0018, 0.0007, C.mossDark, root, 4);
    for (let k = 0; k < 3; k++) {
      const p = base.clone().lerp(tip, 0.25 + k * 0.22);
      leaf(p, p.clone().add(V([0.028 - k * 0.004, 0.021, 0.005])),
        0.007, C.mossLight, root);
      leaf(p, p.clone().add(V([-0.027 + k * 0.004, 0.021, 0.004])),
        0.007, C.moss, root);
    }
  }

  return b.root;
}
```