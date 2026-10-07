```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

export const meta = {
  name: "Dewdrop, unicorn foal",
  description:
    "A long-legged ivory unicorn foal with enormous curious eyes, petal-pink ears, a little spiral-gold horn, and a flowing sorbet-coloured mane and tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Dewdrop" });

  const C = {
    ivory: "#F6EBDD",
    light: "#FFF7E9",
    shadow: "#E6D5C3",
    nose: "#EDD3CA",
    chin: "#F1DFD1",
    pink: "#DFADB7",
    innerEar: "#EDBEC5",
    earLight: "#F8D7D3",
    mouth: "#916C78",
    lash: "#493747",
    eyeWhite: "#FFF6E8",
    iris: "#78628D",
    pupil: "#302D40",
    glint: "#FFFFFF",
    lavender: "#B5A1D7",
    purple: "#9584BE",
    rose: "#EAB6CA",
    mint: "#B3DCD5",
    blue: "#AACCDD",
    hairLight: "#F5E6FA",
    gold: "#F6D899",
    goldEdge: "#C69A51",
    hoof: "#82758F",
    sole: "#61596F",
    hoofLight: "#AD9CB6"
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  type Joint = ReturnType<typeof b.joint>;

  function joint(
    name: string,
    at: THREE.Vector3,
    parent: Joint | undefined,
    aim: THREE.Vector3,
    role: string
  ): Joint {
    const options: any = { at, aim, role };
    if (parent) options.parent = parent;
    const j = b.joint(name, options);
    const bone = (j as any).bone;
    if (bone) bone.userData.role = role;
    return j;
  }

  // Skeleton: a neutral, slightly wide foal stance, with an extended tail.
  const pelvisP = V(0, 1.005, -0.275);
  const spineP = V(0, 1.025, -0.035);
  const chestP = V(0, 1.055, 0.235);
  const neck1P = V(0, 1.235, 0.305);
  const neck2P = V(0, 1.410, 0.385);
  const headP = V(0, 1.455, 0.455);
  const muzzleP = V(0, 1.271, 0.748);

  const hips = joint("hips", pelvisP, undefined, spineP, "spine");
  const spine1 = joint("spine1", spineP, hips, chestP, "spine");
  const chest = joint("chest", chestP, spine1, neck1P, "spine");
  const neck1 = joint("neck1", neck1P, chest, neck2P, "neck");
  const neck2 = joint("neck2", neck2P, neck1, headP, "neck");
  const head = joint("head", headP, neck2, muzzleP, "head");

  const upperJawP = V(0, 1.391, 0.555);
  const jawP = V(0, 1.348, 0.551);
  const upperJaw = joint("upperJaw", upperJawP, head, muzzleP, "head");
  const jaw = joint("jaw", jawP, head, V(0, 1.205, 0.740), "jaw");

  const hornBase = V(0, 1.606, 0.548);
  const hornTip = V(0, 1.904, 0.612);
  const horn = joint("horn", hornBase, head, hornTip, "hinge");

  const ears: { bone: Joint; base: THREE.Vector3; tip: THREE.Vector3 }[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const base = V(s * 0.108, 1.583, 0.410);
    const tip = V(s * 0.205, 1.851, 0.400);
    const ear = joint(`ear${side}`, base, head, tip, "hinge");
    joint(`earTip${side}`, tip, ear, tip.clone().add(V(0, 0.03, 0)), "hinge");
    ears.push({ bone: ear, base, tip });
  }

  type Leg = {
    points: THREE.Vector3[];
    bones: Joint[];
    hoof: Joint;
    hind: boolean;
  };
  const legs: Leg[] = [];

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const p = [
      V(s * 0.158, 1.042, 0.230),
      V(s * 0.195, 0.735, 0.225),
      V(s * 0.222, 0.423, 0.271),
      V(s * 0.240, 0.150, 0.291),
      V(s * 0.242, 0.056, 0.333)
    ];
    const shoulder = joint(`shoulder${side}`, p[0], chest, p[1], "leg");
    const elbow = joint(`elbow${side}`, p[1], shoulder, p[2], "leg");
    const knee = joint(`knee${side}`, p[2], elbow, p[3], "leg");
    const fetlock = joint(`fetlock${side}`, p[3], knee, p[4], "leg");
    const hoof = joint(`hoof${side}`, p[4], fetlock, p[4].clone().add(V(0, 0, 0.10)), "leg");
    legs.push({ points: p, bones: [shoulder, elbow, knee, fetlock], hoof, hind: false });
  }

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const p = [
      V(s * 0.153, 0.992, -0.279),
      V(s * 0.191, 0.702, -0.181),
      V(s * 0.221, 0.414, -0.382),
      V(s * 0.238, 0.147, -0.347),
      V(s * 0.240, 0.056, -0.296)
    ];
    const hip = joint(`hip${side}`, p[0], hips, p[1], "leg");
    const stifle = joint(`stifle${side}`, p[1], hip, p[2], "leg");
    const hock = joint(`hock${side}`, p[2], stifle, p[3], "leg");
    const fetlock = joint(`fetlockBack${side}`, p[3], hock, p[4], "leg");
    const hoof = joint(`hoofBack${side}`, p[4], fetlock, p[4].clone().add(V(0, 0, 0.10)), "leg");
    legs.push({ points: p, bones: [hip, stifle, hock, fetlock], hoof, hind: true });
  }

  const tailPoints = [
    V(0, 1.045, -0.435),
    V(0.015, 1.075, -0.580),
    V(0.065, 0.955, -0.780),
    V(0.130, 0.785, -0.960),
    V(0.185, 0.605, -1.105)
  ];
  const tail = b.chain("tail", tailPoints, { parent: hips, role: "tail" } as any);

  // Geometry helpers. All placement remains in model space.
  function ellipsoid(
    p: THREE.Vector3,
    size: [number, number, number],
    color: string,
    bone: Joint,
    dir?: THREE.Vector3,
    segments = 12
  ) {
    const g = new THREE.SphereGeometry(1, segments, 8);
    g.scale(size[0], size[1], size[2]);
    return b.part(g, color, { at: p, bone, ...(dir ? { dir } : {}) });
  }

  function taper(
    a: THREE.Vector3,
    z: THREE.Vector3,
    r0: number,
    r1: number,
    color: string,
    owner: any,
    sides = 8
  ) {
    const d = z.clone().sub(a);
    const center = a.clone().add(z).multiplyScalar(0.5);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides, 1);
    return b.part(g, color, {
      at: owner.moved(center),
      dir: d,
      up: [0, 0, 1]
    });
  }

  function polygon(
    points: number[][],
    depth: number,
    front: number
  ): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 1
    });
    g.translate(0, 0, front);
    return g;
  }

  function sparkle(radius: number, depth = 0.003): THREE.ExtrudeGeometry {
    const p: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? radius : radius * 0.28;
      p.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    const g = polygon(p, depth, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  }

  // Creamy, compact barrel; small rounded rump and a high foal chest.
  b.sweep([hips, spine1, chest], 0.190, { color: C.ivory });
  const barrel = ellipsoid(V(0, 1.025, -0.020), [0.222, 0.234, 0.414], C.ivory, spine1);
  ellipsoid(pelvisP, [0.219, 0.239, 0.235], C.ivory, hips);
  ellipsoid(chestP, [0.191, 0.235, 0.205], C.ivory, chest);
  ellipsoid(V(0, 0.883, -0.026), [0.174, 0.114, 0.282], C.shadow, spine1);
  ellipsoid(V(0, 1.068, 0.295), [0.128, 0.185, 0.117], C.light, chest);

  b.sweep([chest, neck1, neck2, head], 0.103, { color: C.ivory });
  taper(chestP, neck1P, 0.143, 0.120, C.ivory, chest);
  taper(neck1P, neck2P, 0.120, 0.092, C.ivory, neck1);
  ellipsoid(V(0, 1.234, 0.367), [0.092, 0.205, 0.063], C.light, neck1, neck2P.clone().sub(chestP));

  // Four long, fine legs with simple angular muscle masses.
  for (const leg of legs) {
    const { points: p, bones, hoof, hind } = leg;
    b.sweep([...bones, hoof], 0.031, { color: C.ivory });

    const radii = hind
      ? [0.086, 0.052, 0.036, 0.030]
      : [0.064, 0.041, 0.034, 0.028];
    for (let i = 0; i < 3; i++) {
      taper(p[i], p[i + 1], radii[i], radii[i + 1], C.ivory, bones[i]);
    }
    taper(p[3], p[4], 0.031, 0.041, C.light, bones[3]);

    if (hind) {
      const thighCenter = p[0].clone().lerp(p[1], 0.29);
      ellipsoid(
        thighCenter,
        [0.086, 0.145, 0.093],
        C.ivory,
        bones[0],
        p[1].clone().sub(p[0])
      );
    }

    const footP = p[4];
    const hoofG = new THREE.CylinderGeometry(0.052, 0.069, 0.100, 8, 1);
    hoofG.scale(1, 1, 1.27);
    const hoofPart = b.part(hoofG, C.hoof, { at: footP, bone: hoof });

    const soleG = new THREE.CylinderGeometry(0.069, 0.070, 0.012, 8, 1);
    soleG.scale(1, 1, 1.27);
    b.part(soleG, C.sole, {
      at: V(footP.x, 0.006, footP.z),
      bone: hoof
    });

    const bandG = new THREE.CylinderGeometry(0.052, 0.056, 0.012, 8, 1);
    bandG.scale(1, 1, 1.27);
    b.part(bandG, C.hoofLight, {
      at: V(footP.x, 0.100, footP.z),
      bone: hoof
    });

    // A narrow light facet at the toe, rather than a split hoof.
    const toeHit = b.surface(hoofPart).nearest(footP.clone().add(V(0.018, 0.005, 0.110)));
    const toeG = new THREE.SphereGeometry(1, 6, 4);
    toeG.scale(0.006, 0.0015, 0.027);
    b.stick(toeG, C.hoofLight, toeHit);

    // Two tiny fetlock feathers, clear of the floor.
    for (const s of [-1, 1]) {
      const start = p[3].clone().add(V(s * 0.018, -0.005, -0.018));
      const end = start.clone().add(V(s * 0.010, -0.060, -0.022));
      taper(start, end, 0.016, 0.001, C.light, bones[3], 5);
    }
  }

  // The oversized baby head and the separate opening lower jaw.
  const skull = ellipsoid(headP, [0.160, 0.180, 0.175], C.ivory, head);
  const faceDir = muzzleP.clone().sub(headP);
  const bridge = ellipsoid(
    V(0, 1.365, 0.604),
    [0.119, 0.157, 0.114],
    C.ivory,
    upperJaw,
    faceDir
  );

  const noseG = new THREE.SphereGeometry(1, 12, 8);
  noseG.scale(0.130, 0.071, 0.106);
  const nosePositions = noseG.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < nosePositions.count; i++) {
    nosePositions.setY(i, Math.max(-0.034, nosePositions.getY(i)));
  }
  noseG.computeVertexNormals();
  const nose = b.part(noseG, C.nose, { at: muzzleP, bone: upperJaw });

  ellipsoid(V(0, 1.234, 0.744), [0.102, 0.0045, 0.089], C.mouth, jaw);
  ellipsoid(V(0, 1.204, 0.739), [0.116, 0.034, 0.103], C.chin, jaw);
  ellipsoid(V(0, 1.235, 0.623), [0.090, 0.061, 0.105], C.ivory, jaw, faceDir);

  const smilePoints = [
    V(-0.104, 1.246, 0.810),
    V(-0.061, 1.236, 0.838),
    V(0, 1.234, 0.846),
    V(0.061, 1.236, 0.838),
    V(0.104, 1.246, 0.810)
  ].map(p => jaw.moved(p));
  b.sweep(smilePoints, 0.0023, { color: C.mouth });

  const noseSurface = b.surface(nose);
  for (const s of [1, -1]) {
    const nostrilHit = noseSurface.nearest(V(s * 0.076, 1.298, 0.843));
    const nostrilG = new THREE.SphereGeometry(1, 8, 5);
    nostrilG.scale(0.020, 0.0038, 0.013);
    b.stick(nostrilG, C.mouth, nostrilHit);

    for (let i = 0; i < 3; i++) {
      const dotHit = noseSurface.nearest(
        V(s * (0.091 + i * 0.008), 1.266 - i * 0.005, 0.834 - i * 0.007)
      );
      b.stick(new THREE.SphereGeometry(0.0022, 5, 3), C.mouth, dotHit);
    }
  }

  // A slender, almost white blaze down the bridge of the nose.
  const blazeHit = b.surface(bridge).nearest(V(0, 1.400, 0.727));
  const blazeG = new THREE.SphereGeometry(1, 8, 6);
  blazeG.scale(0.024, 0.0018, 0.069);
  b.stick(blazeG, C.light, blazeHit);

  // Large inset eyes: dark plum irises, a soft cream rim and two catchlights.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.nearest(V(s * 0.165, 1.487, 0.547));
    const eyeFrame = frame(hit, [s * 0.86, 0.06, 0.51], [0, 1, 0]);

    const socketG = new THREE.SphereGeometry(1, 12, 8);
    socketG.scale(0.073, 0.010, 0.066);
    b.stick(socketG, C.light, hit);

    const eyeLayer = (
      size: [number, number, number],
      position: [number, number, number],
      color: string,
      segments = 12
    ) => {
      const g = new THREE.SphereGeometry(1, segments, 8);
      g.scale(...size);
      g.translate(...position);
      b.part(g, color, { frame: eyeFrame, bone: head });
    };

    eyeLayer([0.066, 0.018, 0.059], [0, 0.012, 0], C.lash);
    eyeLayer([0.058, 0.012, 0.052], [0.001, 0.027, 0], C.eyeWhite);
    eyeLayer([0.050, 0.017, 0.049], [0.004, 0.031, 0], C.iris);
    eyeLayer([0.036, 0.012, 0.043], [0.006, 0.043, 0.001], C.pupil);
    eyeLayer([0.013, 0.004, 0.015], [-0.014, 0.055, 0.020], C.glint, 8);
    eyeLayer([0.005, 0.003, 0.006], [0.024, 0.054, -0.017], C.glint, 6);

    // Short outer lashes and an ivory brow, kept angular and restrained.
    for (let i = 0; i < 2; i++) {
      const x = -0.045 - i * 0.010;
      const z = 0.035 - i * 0.010;
      const lashG = polygon(
        [[x, z], [x - 0.025, z + 0.022], [x - 0.005, z - 0.004]],
        0.004,
        0
      );
      lashG.rotateX(-Math.PI / 2);
      lashG.translate(0, 0.025, 0);
      b.part(lashG, C.lash, { frame: eyeFrame, bone: head });
    }
    eyeLayer([0.051, 0.007, 0.011], [0, 0.009, 0.073], C.shadow, 8);

    const blushHit = skullSurface.nearest(V(s * 0.157, 1.399, 0.510));
    const blushG = new THREE.SphereGeometry(1, 8, 5);
    blushG.scale(0.030, 0.0015, 0.018);
    b.stick(blushG, C.pink, blushHit);
  }

  // Pointed horse ears, with thick cream edges and layered pink interiors.
  for (const ear of ears) {
    const earDir = ear.tip.clone().sub(ear.base);
    const opts = { at: ear.base, bone: ear.bone, dir: earDir, up: [0, 0, 1] };
    const outline = [
      [-0.027, 0], [0.027, 0], [0.056, 0.094],
      [0.043, 0.181], [0, 0.270],
      [-0.043, 0.181], [-0.056, 0.094]
    ];
    b.part(polygon(outline, 0.037, -0.0185), C.ivory, opts);
    b.part(
      polygon(
        [[-0.016, 0.034], [0.016, 0.034], [0.037, 0.101],
         [0.027, 0.176], [0, 0.235], [-0.027, 0.176], [-0.037, 0.101]],
        0.003,
        0.019
      ),
      C.innerEar,
      opts
    );
    b.part(
      polygon(
        [[-0.006, 0.051], [0.009, 0.058], [0.018, 0.135],
         [0, 0.211], [-0.013, 0.140]],
        0.0015,
        0.023
      ),
      C.earLight,
      opts
    );
  }

  // A seven-sided little horn with a real raised, tapering helical ridge.
  taper(hornBase, hornTip, 0.038, 0.002, C.gold, horn, 7);
  const hornAxis = hornTip.clone().sub(hornBase).normalize();
  const hornX = V(1, 0, 0);
  const hornZ = hornX.clone().cross(hornAxis).normalize();

  const spiralPoints: any[] = [];
  for (let i = 0; i <= 54; i++) {
    const t = 0.026 + (i / 54) * 0.914;
    const a = (i / 54) * Math.PI * 2 * 3.05;
    const r = 0.038 * (1 - t) + 0.0022;
    const p = hornBase.clone().lerp(hornTip, t)
      .addScaledVector(hornX, Math.cos(a) * r)
      .addScaledVector(hornZ, Math.sin(a) * r);
    spiralPoints.push(horn.moved(p));
  }
  b.sweep(spiralPoints, 0.0027, { color: C.goldEdge });

  const socketG = new THREE.TorusGeometry(0.038, 0.005, 5, 10);
  socketG.rotateX(Math.PI / 2);
  b.part(socketG, C.goldEdge, {
    at: hornBase.clone().addScaledVector(hornAxis, 0.005),
    bone: horn,
    dir: hornAxis
  });

  // Chunky mane locks are seated on the neck, with pointed ends.
  // The broad coloured masses, not individual hairs, define the silhouette.
  const neckSurface = b.surface(
    b.sweep([neck1, neck2, head], 0.104, { color: C.ivory })
  );

  function hairLock(
    points: THREE.Vector3[],
    owner: Joint,
    color: string,
    radius: number,
    surface: any,
    stripe = false,
    stripeDirection = V(0.08, 0, 0.02)
  ) {
    const seated = surface.nearest(points[0]);
    const route = [
      seated,
      ...points.slice(1, -1).map(p => owner.moved(p))
    ];
    const lock = b.sweep(route, radius, { color });
    taper(points[points.length - 2], points[points.length - 1], radius, 0.001, color, owner, 7);

    if (stripe) {
      const lockSurface = b.surface(lock);
      const hits = points.slice(0, -1).map(p =>
        lockSurface.nearest(p.clone().add(stripeDirection))
      );
      b.sweep(hits, 0.0045, { color: C.hairLight });
    }
  }

  const maneSpecs = [
    {
      p: [V(0, 1.570, 0.352), V(0.058, 1.535, 0.303), V(0.140, 1.445, 0.266), V(0.191, 1.370, 0.223)],
      bone: neck2, color: C.lavender, r: 0.045, stripe: true
    },
    {
      p: [V(0, 1.482, 0.288), V(0.067, 1.425, 0.220), V(0.148, 1.320, 0.183), V(0.196, 1.262, 0.145)],
      bone: neck2, color: C.rose, r: 0.044, stripe: false
    },
    {
      p: [V(0, 1.391, 0.232), V(0.055, 1.331, 0.156), V(0.137, 1.241, 0.102), V(0.181, 1.186, 0.065)],
      bone: neck1, color: C.mint, r: 0.042, stripe: true
    },
    {
      p: [V(0, 1.303, 0.168), V(0.057, 1.250, 0.090), V(0.132, 1.162, 0.024), V(0.171, 1.114, -0.029)],
      bone: neck1, color: C.lavender, r: 0.042, stripe: false
    },
    {
      p: [V(0, 1.223, 0.141), V(0.046, 1.163, 0.050), V(0.119, 1.096, -0.034), V(0.153, 1.059, -0.099)],
      bone: neck1, color: C.rose, r: 0.038, stripe: true
    }
  ];
  for (const m of maneSpecs) {
    hairLock(m.p, m.bone, m.color, m.r, neckSurface, m.stripe);
  }

  // A smaller fringe on the far side keeps the mane readable from every angle.
  hairLock(
    [V(0, 1.556, 0.337), V(-0.059, 1.486, 0.285), V(-0.101, 1.409, 0.244), V(-0.137, 1.359, 0.219)],
    neck2, C.purple, 0.035, neckSurface
  );
  hairLock(
    [V(0, 1.421, 0.241), V(-0.057, 1.349, 0.179), V(-0.100, 1.272, 0.127), V(-0.133, 1.221, 0.093)],
    neck1, C.blue, 0.035, neckSurface
  );
  hairLock(
    [V(0, 1.282, 0.154), V(-0.049, 1.213, 0.080), V(-0.093, 1.140, 0.007), V(-0.127, 1.100, -0.045)],
    neck1, C.purple, 0.033, neckSurface
  );

  // Three soft forelock curls frame the horn rather than hiding it.
  hairLock(
    [V(-0.045, 1.610, 0.433), V(-0.082, 1.611, 0.510), V(-0.103, 1.543, 0.586), V(-0.076, 1.482, 0.613)],
    head, C.lavender, 0.035, skullSurface, true, V(0, 0.03, 0.09)
  );
  hairLock(
    [V(0.040, 1.611, 0.437), V(0.078, 1.615, 0.512), V(0.103, 1.556, 0.579), V(0.099, 1.513, 0.606)],
    head, C.rose, 0.032, skullSurface
  );
  hairLock(
    [V(-0.003, 1.623, 0.425), V(-0.011, 1.634, 0.475), V(-0.031, 1.582, 0.547), V(-0.039, 1.548, 0.585)],
    head, C.mint, 0.027, skullSurface
  );

  // Extended, fan-ended tail; each pastel tress follows the tail skeleton.
  b.sweep(tail, 0.039, { color: C.purple });
  const tailColors = [C.lavender, C.rose, C.mint, C.blue, C.lavender];
  const tailOffsets = [-0.059, -0.029, 0, 0.031, 0.060];

  for (let i = 0; i < tailColors.length; i++) {
    const route: any[] = [];
    const strandPoints: THREE.Vector3[] = [];
    for (let k = 0; k < tailPoints.length; k++) {
      const spread = k === 0 ? 0.1 : 1;
      const p = tailPoints[k].clone().add(V(
        tailOffsets[i] * spread,
        (i % 2 === 0 ? 0.020 : -0.017) * spread,
        i === 2 ? 0.012 : 0
      ));
      strandPoints.push(p);
      route.push(tail.at(k / (tailPoints.length - 1)).moved(p));
    }
    const strand = b.sweep(route, 0.028, { color: tailColors[i] });
    const end = strandPoints[strandPoints.length - 1];
    const tip = end.clone().add(V(
      tailOffsets[i] * 0.30,
      -0.065 - (i % 3) * 0.013,
      -0.085 + (i % 2) * 0.025
    ));
    taper(end, tip, 0.028, 0.001, tailColors[i], tail.at(1), 7);

    if (i === 0 || i === 2) {
      const strandSurface = b.surface(strand);
      const hits = strandPoints.slice(1).map(p =>
        strandSurface.nearest(p.clone().add(V(0.060, 0.030, 0)))
      );
      b.sweep(hits, 0.004, { color: C.hairLight });
    }
  }

  // A restrained constellation of little raised birthmarks on the flanks.
  const flank = b.surface(barrel);
  for (const s of [1, -1]) {
    const marks = [
      { p: V(s * 0.250, 1.100, -0.185), r: 0.027, color: C.gold },
      { p: V(s * 0.245, 1.032, -0.094), r: 0.017, color: C.lavender },
      { p: V(s * 0.239, 0.973, -0.217), r: 0.012, color: C.rose }
    ];
    for (const m of marks) b.stick(sparkle(m.r), m.color, flank.nearest(m.p));

    const dotPositions = [
      V(s * 0.247, 1.073, -0.123),
      V(s * 0.246, 1.019, -0.166),
      V(s * 0.238, 1.130, -0.245)
    ];
    for (const p of dotPositions) {
      const dotG = new THREE.SphereGeometry(1, 6, 4);
      dotG.scale(0.005, 0.0018, 0.005);
      b.stick(dotG, C.gold, flank.nearest(p));
    }
  }

  return b.root;
}
```