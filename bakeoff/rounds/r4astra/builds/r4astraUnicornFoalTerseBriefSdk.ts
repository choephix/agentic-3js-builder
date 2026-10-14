import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Dawnblossom",
  description:
    "A long-legged unicorn foal with an ivory coat, oversized violet eyes, a little spiral-gold horn, and a candy-coloured, faceted mane."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Dawnblossom" });
  const random = rng(41729);

  const C = {
    ivory: "#f5eee3",
    light: "#fff8ed",
    cream: "#e9dfd5",
    muzzle: "#edcec7",
    blush: "#e9bfc7",
    nostril: "#88677e",
    mouth: "#927481",
    lavender: "#ac98ce",
    lilac: "#c6b2e0",
    pink: "#efbdd7",
    pinkLight: "#ffdeea",
    mint: "#b9dcd8",
    mintLight: "#d7eeDF",
    hoof: "#9990b0",
    hoofLight: "#c2b3cd",
    sole: "#67627f",
    ink: "#302c48",
    iris: "#8470ae",
    eyeWhite: "#fff3e7",
    gold: "#ecc779",
    goldDark: "#bc8a45",
    goldLight: "#ffe7a0"
  };

  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];
  const middle = (a: number[], c: number[]) =>
    arr(V(a).add(V(c)).multiplyScalar(0.5));

  function joint(
    name: string,
    at: number[],
    parent: any,
    role: string,
    aim?: number[]
  ): any {
    const j = b.joint(name, {
      at,
      ...(parent ? { parent } : {}),
      ...(aim ? { aim } : {})
    });
    const node = (j as any).bone ?? j;
    node.userData = { ...node.userData, role };
    return j;
  }

  // Skeleton first. All positions are in metres and all four feet are planted.
  const P = {
    pelvis: [0, 0.94, -0.365],
    spine: [0, 0.947, -0.09],
    chest: [0, 0.96, 0.245],
    neck: [0, 1.045, 0.28],
    neck2: [0, 1.29, 0.397],
    head: [0, 1.433, 0.475],
    jaw: [0, 1.335, 0.512],
    earL: [0.105, 1.558, 0.399],
    earR: [-0.105, 1.558, 0.399],
    earTipL: [0.213, 1.794, 0.366],
    earTipR: [-0.213, 1.794, 0.366]
  };

  const pelvis = joint("pelvis", P.pelvis, null, "spine", P.spine);
  const spine = joint("spine", P.spine, pelvis, "spine", P.chest);
  const chest = joint("chest", P.chest, spine, "spine", P.neck);
  const neck = joint("neck", P.neck, chest, "neck", P.neck2);
  const neck2 = joint("neck2", P.neck2, neck, "neck", P.head);
  const head = joint("head", P.head, neck2, "head", [0, 1.28, 0.835]);
  const jaw = joint("jaw", P.jaw, head, "jaw", [0, 1.19, 0.84]);
  const earL = joint("earL", P.earL, head, "hinge", P.earTipL);
  const earR = joint("earR", P.earR, head, "hinge", P.earTipR);

  const legs: any[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const frontPoints = [
      [s * 0.163, 0.935, 0.255],
      [s * 0.186, 0.687, 0.284],
      [s * 0.200, 0.426, 0.335],
      [s * 0.210, 0.162, 0.355],
      [s * 0.212, 0.063, 0.380]
    ];
    const frontNames = [
      `shoulder${side}`, `elbow${side}`, `wrist${side}`,
      `fetlockF${side}`, `hoofF${side}`
    ];
    const fj: any[] = [];
    frontPoints.forEach((p, i) => {
      fj.push(joint(frontNames[i], p, i ? fj[i - 1] : chest, "leg",
        frontPoints[Math.min(i + 1, 4)]));
    });
    legs.push({ front: true, side, points: frontPoints, joints: fj });

    const hindPoints = [
      [s * 0.177, 0.934, -0.365],
      [s * 0.214, 0.681, -0.261],
      [s * 0.225, 0.379, -0.479],
      [s * 0.235, 0.150, -0.425],
      [s * 0.239, 0.063, -0.389]
    ];
    const hindNames = [
      `hip${side}`, `knee${side}`, `hock${side}`,
      `fetlockH${side}`, `hoofH${side}`
    ];
    const hj: any[] = [];
    hindPoints.forEach((p, i) => {
      hj.push(joint(hindNames[i], p, i ? hj[i - 1] : pelvis, "leg",
        hindPoints[Math.min(i + 1, 4)]));
    });
    legs.push({ front: false, side, points: hindPoints, joints: hj });
  }

  const tailP = [
    [0, 1.000, -0.548],
    [0.010, 1.038, -0.705],
    [0.033, 0.990, -0.878],
    [0.063, 0.865, -1.022],
    [0.071, 0.718, -1.095]
  ];
  const tail: any[] = [];
  tailP.forEach((p, i) => {
    tail.push(joint(`tail${i + 1}`, p, i ? tail[i - 1] : pelvis, "tail",
      tailP[Math.min(i + 1, 4)]));
  });

  b.root.userData.chains = [
    { role: "spine", joints: ["pelvis", "spine", "chest"] },
    { role: "neck", joints: ["neck", "neck2", "head"] },
    { role: "jaw", joints: ["jaw"] },
    { role: "tail", joints: ["tail1", "tail2", "tail3", "tail4", "tail5"] },
    ...legs.map(l => ({
      role: "leg",
      joints: l.front
        ? [`shoulder${l.side}`, `elbow${l.side}`, `wrist${l.side}`, `fetlockF${l.side}`, `hoofF${l.side}`]
        : [`hip${l.side}`, `knee${l.side}`, `hock${l.side}`, `fetlockH${l.side}`, `hoofH${l.side}`]
    }))
  ];

  function flat(g: THREE.BufferGeometry) {
    const result = g.index ? g.toNonIndexed() : g;
    result.computeVertexNormals();
    return result;
  }

  function ellipsoid(
    at: number[], radii: number[], color: string, bone: any,
    tilt = 0, smooth = false
  ): any {
    let g: THREE.BufferGeometry = new THREE.SphereGeometry(1, 12, 8);
    g.scale(radii[0], radii[1], radii[2]);
    if (tilt) g.rotateX(tilt);
    if (!smooth) g = flat(g);
    return b.part(g, color, { at, bone });
  }

  function taper(
    a: number[], c: number[], r0: number, r1: number,
    color: string, bone: any, sides = 8
  ) {
    const d = V(c).sub(V(a));
    const g = flat(new THREE.CylinderGeometry(r1, r0, d.length(), sides, 1));
    return b.part(g, color, {
      at: middle(a, c), dir: arr(d), bone
    });
  }

  function localEllipsoid(
    hit: any, radii: number[], translation: number[],
    color: string, bone: any
  ) {
    const g = new THREE.SphereGeometry(1, 14, 10);
    g.scale(radii[0], radii[1], radii[2]);
    g.translate(translation[0], translation[1], translation[2]);
    return b.part(g, color, { frame: hit, bone });
  }

  function tubeGeometry(points: number[][], radius: number, segments = 24) {
    const curve = new THREE.CatmullRomCurve3(points.map(V));
    return new THREE.TubeGeometry(curve, segments, radius, 5, false);
  }

  // A small, faceted tapered ribbon: the building block of the sculpted mane.
  function lock(
    points: number[][], widths: number[], depths: number[],
    color: string, bone: any, widthAxis = [1, 0, 0]
  ) {
    const origin = V(points[0]);
    const vertices: number[] = [];
    const indices: number[] = [];
    const n = 8;

    points.forEach((p, i) => {
      const tangent = V(points[Math.min(i + 1, points.length - 1)])
        .sub(V(points[Math.max(0, i - 1)])).normalize();
      let w = V(widthAxis);
      w.addScaledVector(tangent, -w.dot(tangent));
      if (w.lengthSq() < 0.001) w = new THREE.Vector3(0, 0, 1);
      w.normalize();
      const d = new THREE.Vector3().crossVectors(tangent, w).normalize();
      for (let k = 0; k < n; k++) {
        const angle = k * Math.PI * 2 / n;
        const v = V(p).sub(origin)
          .addScaledVector(w, Math.cos(angle) * widths[i])
          .addScaledVector(d, Math.sin(angle) * depths[i]);
        vertices.push(v.x, v.y, v.z);
      }
    });

    for (let i = 0; i < points.length - 1; i++) {
      for (let k = 0; k < n; k++) {
        const a = i * n + k;
        const c = i * n + (k + 1) % n;
        indices.push(a, c, a + n, c, c + n, a + n);
      }
    }
    for (let k = 1; k < n - 1; k++) {
      indices.push(0, k + 1, k);
      const end = (points.length - 1) * n;
      indices.push(end, end + k, end + k + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    return b.part(flat(g), color, { at: points[0], bone });
  }

  // Compact barrel, high little rump, and a narrow upright neck.
  const barrel = ellipsoid(
    [0, 0.925, -0.085], [0.243, 0.247, 0.478], C.ivory, spine
  );
  ellipsoid(P.pelvis, [0.229, 0.242, 0.231], C.ivory, pelvis);
  ellipsoid(P.chest, [0.207, 0.226, 0.208], C.ivory, chest);
  b.sweep([neck, neck2, head], 0.119, { color: C.ivory });
  taper(P.neck, P.neck2, 0.178, 0.122, C.ivory, neck, 10);
  ellipsoid([0, 1.035, 0.337], [0.166, 0.165, 0.135], C.ivory, neck);

  // Long, fine foal legs. The sweeps form continuous jointed cores.
  for (const leg of legs) {
    const p = leg.points as number[][];
    const j = leg.joints;
    b.sweep([j[0], j[1], j[2], j[3], j[4]], 0.032, { color: C.ivory });

    if (leg.front) {
      taper(p[0], p[1], 0.090, 0.057, C.ivory, j[0]);
      taper(p[1], p[2], 0.058, 0.041, C.ivory, j[1]);
      ellipsoid(p[2], [0.048, 0.055, 0.045], C.ivory, j[2]);
    } else {
      taper(p[0], p[1], 0.112, 0.068, C.ivory, j[0]);
      ellipsoid(middle(p[0], p[1]), [0.104, 0.168, 0.112], C.ivory, j[0], -0.23);
      taper(p[1], p[2], 0.063, 0.037, C.ivory, j[1]);
      ellipsoid(p[2], [0.046, 0.056, 0.050], C.cream, j[2]);
    }

    taper(p[2], p[3], 0.034, 0.038, C.ivory, j[2]);
    ellipsoid(p[3], [0.050, 0.060, 0.048], C.ivory, j[3]);
    taper(p[3], p[4], 0.042, 0.052, C.cream, j[3]);

    const x = p[4][0], z = p[4][2];
    const soleGeo = flat(new THREE.CylinderGeometry(0.076, 0.079, 0.022, 8));
    soleGeo.scale(1, 1, 1.18);
    b.part(soleGeo, C.sole, { at: [x, 0.011, z], bone: j[4] });

    const hoofGeo = flat(new THREE.CylinderGeometry(0.063, 0.076, 0.081, 8));
    hoofGeo.scale(1, 1, 1.18);
    const hoof = b.part(hoofGeo, C.hoof, {
      at: [x, 0.0605, z], bone: j[4]
    });
    const cuffGeo = flat(new THREE.CylinderGeometry(0.057, 0.066, 0.025, 8));
    cuffGeo.scale(1, 1, 1.13);
    b.part(cuffGeo, C.hoofLight, { at: [x, 0.104, z - 0.004], bone: j[4] });

    for (const dx of [-0.020, 0.015]) {
      const hit = b.surface(hoof).nearest([x + dx, 0.061, z + 0.13]);
      b.stick(new THREE.BoxGeometry(0.004, 0.0015, 0.033), C.hoofLight, hit);
    }

    // Small backward-pointing fetlock feathers, kept clear of the floor.
    lock(
      [[x, 0.199, z - 0.031], [x, 0.150, z - 0.059], [x, 0.116, z - 0.070]],
      [0.035, 0.030, 0.002], [0.018, 0.017, 0.001], C.light, j[3]
    );
  }

  // Separate skull, upper muzzle and hinged lower jaw.
  const skull = ellipsoid(P.head, [0.164, 0.184, 0.186], C.ivory, head);
  ellipsoid([0, 1.354, 0.669], [0.124, 0.129, 0.223], C.ivory, head, 0.37);
  const muzzle = ellipsoid(
    [0, 1.276, 0.838], [0.143, 0.090, 0.137], C.muzzle, head
  );
  ellipsoid([0, 1.269, 0.678], [0.112, 0.076, 0.205], C.cream, jaw, 0.28);
  ellipsoid([0, 1.184, 0.833], [0.127, 0.036, 0.120], C.ivory, jaw);

  const smile = [
    [-0.116, 1.223, 0.899],
    [-0.084, 1.205, 0.948],
    [0, 1.200, 0.967],
    [0.084, 1.205, 0.948],
    [0.116, 1.223, 0.899]
  ];
  b.part(tubeGeometry(smile, 0.0031, 26), C.mouth, {
    at: [0, 0, 0], bone: jaw
  });

  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    // Large but shallow eyes; each layer shares a surface frame.
    const eyeHit = skullSurface.nearest([s * 0.159, 1.448, 0.586]);
    localEllipsoid(eyeHit, [0.077, 0.018, 0.081], [0, 0.001, 0], C.lavender, head);
    localEllipsoid(eyeHit, [0.068, 0.017, 0.073], [0, 0.011, 0], C.eyeWhite, head);
    localEllipsoid(eyeHit, [0.055, 0.014, 0.062], [0, 0.027, 0.003], C.iris, head);
    localEllipsoid(eyeHit, [0.040, 0.012, 0.053], [0, 0.037, 0.003], C.ink, head);
    localEllipsoid(eyeHit, [0.013, 0.005, 0.016], [-0.016, 0.049, 0.024], C.light, head);
    localEllipsoid(eyeHit, [0.0055, 0.003, 0.0065], [0.019, 0.049, -0.019], C.light, head);

    const lid: number[][] = [];
    for (let k = 0; k <= 14; k++) {
      const a = 0.10 + k / 14 * (Math.PI - 0.20);
      lid.push([0.070 * Math.cos(a), 0.025, 0.074 * Math.sin(a)]);
    }
    b.part(tubeGeometry(lid, 0.0035, 20), C.ink, { frame: eyeHit, bone: head });
    for (const a of [0.43, 0.71, 0.99]) {
      const x = 0.070 * Math.cos(a);
      const z = 0.074 * Math.sin(a);
      b.part(tubeGeometry([
        [x, 0.025, z],
        [x + 0.004, 0.036, z + 0.012],
        [x + 0.005, 0.041, z + 0.023]
      ], 0.0023, 6), C.ink, { frame: eyeHit, bone: head });
    }

    const cheekHit = skullSurface.nearest([s * 0.153, 1.360, 0.571]);
    const blushGeo = new THREE.SphereGeometry(1, 10, 6);
    blushGeo.scale(0.035, 0.003, 0.024);
    b.stick(blushGeo, C.blush, cheekHit);

    const noseHit = b.surface(muzzle).nearest([s * 0.113, 1.297, 0.928]);
    const nostril = new THREE.SphereGeometry(1, 10, 6);
    nostril.scale(0.023, 0.0045, 0.014);
    b.stick(nostril, C.nostril, noseHit);

    for (let k = 0; k < 3; k++) {
      const hit = b.surface(muzzle).nearest([
        s * (0.075 + k * 0.016),
        1.256 + random() * 0.012,
        0.965 - k * 0.010
      ]);
      const dot = new THREE.SphereGeometry(1, 6, 4);
      dot.scale(0.0033, 0.0015, 0.0033);
      b.stick(dot, C.nostril, hit);
    }
  }

  // Gem-like ears. The inset pink triangles follow the outer ear planes.
  function earGeometry(length: number, width: number, depth: number, inset?: number) {
    const outline = [
      [-width * 0.28, 0], [-width, length * 0.32],
      [-width * 0.70, length * 0.68], [0, length],
      [width * 0.70, length * 0.68], [width, length * 0.32],
      [width * 0.28, 0]
    ];
    const center = new THREE.Vector3(0, length * 0.43, depth);
    const pos: number[] = [];
    function tri(a: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) {
      pos.push(...a.toArray(), ...c.toArray(), ...d.toArray());
    }
    const edge = outline.map(p => new THREE.Vector3(p[0], p[1], 0));
    if (inset !== undefined) {
      const inner = edge.map(v => center.clone().lerp(v, inset).add(new THREE.Vector3(0, 0, 0.0015)));
      const front = center.clone().add(new THREE.Vector3(0, 0, 0.0015));
      for (let i = 0; i < inner.length; i++)
        tri(front, inner[i], inner[(i + 1) % inner.length]);
    } else {
      const back = new THREE.Vector3(0, length * 0.40, -depth * 0.48);
      for (let i = 0; i < edge.length; i++) {
        const next = (i + 1) % edge.length;
        tri(center, edge[i], edge[next]);
        tri(back, edge[next], edge[i]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  for (const s of [1, -1]) {
    const base = s === 1 ? P.earL : P.earR;
    const tip = s === 1 ? P.earTipL : P.earTipR;
    const bone = s === 1 ? earL : earR;
    const direction = V(tip).sub(V(base));
    const options = { at: base, dir: arr(direction), up: [0, 0, 1], bone };
    b.part(earGeometry(direction.length(), 0.064, 0.029), C.ivory, options);
    b.part(earGeometry(direction.length(), 0.064, 0.029, 0.71), C.blush, options);
  }

  // The horn grows directly from the forehead, including its actual spiral.
  const hornFrame = skullSurface.nearest([0, 1.640, 0.550]);
  const hornLength = 0.303;
  const hornGeo = flat(new THREE.ConeGeometry(0.044, hornLength, 9));
  hornGeo.translate(0, hornLength / 2 + 0.012, 0);
  b.part(hornGeo, C.gold, { frame: hornFrame, bone: head });

  const collar = new THREE.TorusGeometry(0.046, 0.0065, 5, 12);
  collar.rotateX(Math.PI / 2);
  collar.translate(0, 0.012, 0);
  b.part(flat(collar), C.goldDark, { frame: hornFrame, bone: head });

  const helix: number[][] = [];
  for (let i = 0; i <= 68; i++) {
    const t = i / 68;
    const angle = t * Math.PI * 2 * 3.35 + 0.4;
    const r = 0.044 * (1 - t) + 0.0015;
    helix.push([Math.cos(angle) * r, 0.017 + t * 0.292, Math.sin(angle) * r]);
  }
  b.part(tubeGeometry(helix, 0.0035, 72), C.goldDark, {
    frame: hornFrame, bone: head
  });

  // A scalloped pastel crest and broad, separately readable locks.
  b.sweep([
    [0, 1.568, 0.350],
    [0, 1.429, 0.265],
    [0, 1.278, 0.150],
    [0, 1.122, 0.049]
  ], 0.052, { color: C.lavender });

  const mane = [
    {
      p: [[0.015, 1.565, 0.349], [0.108, 1.488, 0.293], [0.182, 1.359, 0.335], [0.169, 1.296, 0.413]],
      c: C.pink, stripe: C.pinkLight, bone: neck2
    },
    {
      p: [[0.012, 1.462, 0.265], [0.132, 1.364, 0.214], [0.212, 1.245, 0.266], [0.190, 1.177, 0.339]],
      c: C.lilac, stripe: C.pinkLight, bone: neck2
    },
    {
      p: [[0.011, 1.353, 0.184], [0.140, 1.260, 0.131], [0.221, 1.133, 0.189], [0.193, 1.068, 0.258]],
      c: C.mint, stripe: C.mintLight, bone: neck
    },
    {
      p: [[0.009, 1.229, 0.088], [0.122, 1.139, 0.052], [0.199, 1.036, 0.101], [0.155, 0.987, 0.182]],
      c: C.pink, stripe: C.pinkLight, bone: neck
    }
  ];
  for (const m of mane) {
    lock(m.p, [0.050, 0.077, 0.061, 0.002], [0.030, 0.040, 0.027, 0.002], m.c, m.bone, [0, 0, 1]);
    const stripe = m.p.map((p, i) => [p[0] + (i === 3 ? 0.003 : 0.031), p[1] + 0.002, p[2] - 0.012]);
    lock(stripe, [0.010, 0.018, 0.013, 0.001], [0.007, 0.009, 0.006, 0.001], m.stripe, m.bone, [0, 0, 1]);
  }

  // A little mane remains visible on the far side as well.
  for (let i = 0; i < 3; i++) {
    const y = 1.490 - i * 0.125, z = 0.294 - i * 0.094;
    lock(
      [[-0.015, y, z], [-0.105, y - 0.065, z - 0.035], [-0.154, y - 0.156, z + 0.028]],
      [0.040, 0.053, 0.002], [0.024, 0.025, 0.001],
      i === 1 ? C.mint : C.lilac, i ? neck : neck2, [0, 0, 1]
    );
  }

  lock(
    [[-0.023, 1.585, 0.443], [0.054, 1.574, 0.529], [0.105, 1.520, 0.588], [0.073, 1.454, 0.641]],
    [0.048, 0.072, 0.058, 0.002], [0.030, 0.037, 0.030, 0.002],
    C.lilac, head
  );
  lock(
    [[0.012, 1.609, 0.449], [0.073, 1.592, 0.530], [0.124, 1.533, 0.584], [0.090, 1.466, 0.640]],
    [0.014, 0.020, 0.017, 0.001], [0.009, 0.011, 0.009, 0.001],
    C.pinkLight, head
  );
  lock(
    [[-0.034, 1.578, 0.450], [-0.089, 1.550, 0.523], [-0.107, 1.483, 0.580], [-0.080, 1.451, 0.605]],
    [0.036, 0.041, 0.030, 0.002], [0.023, 0.025, 0.020, 0.001],
    C.pink, head
  );

  // The lifted tail is clear of both hind legs and has its own five-bone chain.
  b.sweep([tail[0], tail[1], tail[2], tail[3]], 0.047, { color: C.lavender });
  const tailR = [0.043, 0.068, 0.081, 0.059, 0.002];
  for (let i = 0; i < 4; i++)
    taper(tailP[i], tailP[i + 1], tailR[i], tailR[i + 1], C.lilac, tail[i]);

  const stripes = [
    { off: [0.042, 0.030, 0], c: C.pink },
    { off: [-0.044, 0.016, 0], c: C.mint },
    { off: [0, 0.060, 0], c: C.pinkLight }
  ];
  const factors = [0.5, 0.95, 1, 0.70, 0];
  const widths = [0.020, 0.027, 0.031, 0.023, 0.001];
  stripes.forEach(st => {
    const points = tailP.map((p, i) => [
      p[0] + st.off[0] * factors[i],
      p[1] + st.off[1] * factors[i],
      p[2]
    ]);
    for (let i = 0; i < 4; i++) {
      lock(
        [points[i], points[i + 1]],
        [widths[i], widths[i + 1]],
        [0.012 * factors[i] + 0.001, 0.012 * factors[i + 1] + 0.001],
        st.c, tail[i]
      );
    }
  });

  // A tiny constellation birthmark, seated on the foal's left flank.
  function starGeometry(radius: number, points = 4) {
    const shape = new THREE.Shape();
    for (let k = 0; k < points * 2; k++) {
      const a = Math.PI / 2 + k * Math.PI / points;
      const r = k % 2 === 0 ? radius : radius * 0.33;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (k === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.0015, bevelEnabled: false, curveSegments: 1
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }

  const coat = b.surface(barrel);
  b.stick(starGeometry(0.042), C.goldDark, coat.nearest([0.29, 0.995, -0.290]));
  b.stick(starGeometry(0.019), C.lavender, coat.nearest([0.29, 1.056, -0.227]));
  b.stick(starGeometry(0.012), C.gold, coat.nearest([0.29, 0.957, -0.213]));

  return b.root;
}
