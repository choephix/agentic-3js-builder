import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  offset,
  rng,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "First Steps",
  description:
    "A pearly newborn unicorn, all long legs and enormous eyes, with a sherbet-colored fluffy mane, a little gold spiral horn, silver hooves, and a necklace of fresh daisies.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "newbornUnicorn", detail: 1, paintSize: 1024 });

  const C = {
    pink: "#efb7ce",
    pinkLight: "#f9d4e2",
    mint: "#b8ddd0",
    mintLight: "#d9eee3",
    lavender: "#c6b5e1",
    lavenderLight: "#e2d6f1",
    eye: "#211e30",
    eyeRim: "#b7a1c5",
    lid: "#57435f",
    nostril: "#796378",
    mouth: "#af98b2",
    silver: "#bdc5db",
    silverLight: "#edf1fb",
    sole: "#81879d",
    gold: "#e4b557",
    goldLight: "#ffe09a",
    vine: "#719f87",
    leaf: "#a3c8a0",
    petal: "#fffdf2",
    petalShade: "#f5efdf",
    pollen: "#f1c752",
    pollenDark: "#d8a33b",
  };

  const pearl = paint((p, n) => {
    const shimmer =
      0.12 +
      0.19 * (1 - n.y) * 0.5 +
      0.10 * noise(p, 0.13, 41) +
      0.07 * (0.5 + 0.5 * Math.sin(p.y * 9 + p.z * 7));
    const white = mix("#fffaf9", "#dfd4ef", Math.min(0.55, shimmer));
    const muzzleWarmth = Math.max(0, Math.min(1, (p.z - 1.03) / 0.18));
    return mix(white, "#f1dce6", muzzleWarmth * 0.23);
  });

  function polish(mesh: THREE.Mesh, metalness: number, roughness: number) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.metalness = metalness;
        material.roughness = roughness;
      }
    }
  }

  // Skeleton first. The slight outward spread is a foal's tentative, neutral stance.
  const hips = b.joint("hips", {
    at: [0, 0.98, -0.29],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      hips,
      [0, 0.99, 0.02],
      [0, 1.0, 0.32],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      spine.tip!,
      [0, 1.205, 0.505],
      [0, 1.405, 0.74],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2", "neckPoll"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!,
    dir: [0, -0.22, 1],
    role: "head",
  });
  const h = b.region({
    at: head.local({ up: 0.012, forward: 0.055 }),
    bone: head,
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: h.p([0, -0.087, 0.115]),
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: h.p([s * 0.092, 0.128, -0.078]),
      dir: [s * 0.29, 1, -0.025],
      role: "hinge",
    }),
  }));

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    const frontZ = s > 0 ? 0.445 : 0.405;
    const backZ = s > 0 ? -0.395 : -0.435;

    const front = b.chain(
      `foreleg${side}`,
      [
        [s * 0.145, 0.985, 0.30],
        [s * 0.197, 0.745, 0.285],
        [s * 0.245, 0.438, frontZ - 0.035],
        [s * 0.276, 0.153, frontZ - 0.013],
        [s * 0.280, 0.097, frontZ],
      ],
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `carpus${side}`, `fetlockF${side}`, `hoofF${side}`],
        role: "leg",
        contact: [s * 0.28, 0, frontZ + 0.01],
      },
    );
    const hind = b.chain(
      `hindleg${side}`,
      [
        [s * 0.158, 0.966, -0.345],
        [s * 0.215, 0.688, -0.255],
        [s * 0.244, 0.405, backZ - 0.083],
        [s * 0.270, 0.153, backZ - 0.025],
        [s * 0.274, 0.097, backZ],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
        role: "leg",
        contact: [s * 0.274, 0, backZ + 0.01],
      },
    );
    return [
      { chain: front, hind: false },
      { chain: hind, hind: true },
    ];
  });

  const tail = b.chain(
    "tail",
    [
      hips.local({ up: 0.025, back: 0.19 }),
      [0, 1.015, -0.71],
      [0, 0.958, -0.88],
      [0, 0.87, -1.035],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // A simple, faceted little barrel, with a narrow chest and round baby rump.
  const torso = b.loft(
    [
      { at: [0, 0.974, -0.48], w: 0.25, h: 0.30 },
      { at: hips, w: 0.435, h: 0.43 },
      { at: [0, 0.99, 0.045], w: 0.405, h: 0.455 },
      { at: [0, 1.0, 0.325], w: 0.375, h: 0.405 },
      { at: [0, 1.005, 0.435], w: 0.24, h: 0.305 },
    ],
    {
      bone: [hips, spine],
      color: pearl,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "pearlyBarrel",
    },
  );
  const neckTube = b.sweep(
    neck,
    (t) => [0.131 - 0.036 * t, 0.164 - 0.055 * t],
    {
      color: pearl,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "slenderNeck",
    },
  );
  for (const mesh of torso.meshes) polish(mesh, 0.08, 0.49);

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), pearl, {
    at: h.p([0, 0, 0.012]),
    bone: head,
    scale: [0.173, 0.201, 0.18],
    flat: true,
    name: "babySkull",
  });

  const upperJaw = b.loft(
    [
      { at: h.p([0, -0.045, 0.072]), w: 0.268, h: 0.25 },
      { at: h.p([0, -0.128, 0.246]), w: 0.237, h: 0.16 },
      { at: h.p([0, -0.14, 0.352]), w: 0.221, h: 0.12 },
    ],
    {
      bone: head,
      color: pearl,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "upperMuzzle",
    },
  );
  b.loft(
    [
      { at: h.p([0, -0.176, 0.175]), w: 0.185, h: 0.073 },
      { at: h.p([0, -0.20, 0.31]), w: 0.193, h: 0.051 },
      { at: h.p([0, -0.197, 0.367]), w: 0.179, h: 0.038 },
    ],
    {
      bone: jaw,
      color: pearl,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "lowerJaw",
    },
  );

  // Fine legs, with slightly knobby wrists and tiny polished hoof slippers.
  for (const { chain, hind } of legs) {
    const radii = hind
      ? [0.094, 0.061, 0.046, 0.032, 0.036]
      : [0.077, 0.052, 0.044, 0.031, 0.035];

    const radiusAt = (t: number) => {
      const ts = chain.ts;
      for (let i = 0; i < ts.length - 1; i++) {
        if (t <= ts[i + 1]) {
          const u = (t - ts[i]) / Math.max(0.0001, ts[i + 1] - ts[i]);
          const a = radii[Math.min(i, radii.length - 1)];
          const c = radii[Math.min(i + 1, radii.length - 1)];
          return a + (c - a) * u;
        }
      }
      return radii[radii.length - 1];
    };
    b.sweep(chain, radiusAt, {
      color: pearl,
      sides: 8,
      smooth: false,
      caps: "round",
      name: `${chain.joints[0].name}_coat`,
    });

    const foot = chain.tip!;
    const footOrigin = [foot.at.x, 0, foot.at.z + 0.008];
    const sole = b.extrude(
      [
        [-0.052, 0],
        [0.068, 0],
        [0.068, 0.014],
        [-0.052, 0.014],
      ],
      {
        at: footOrigin,
        thickness: 0.097,
        bevel: 0.002,
        detail: 0.5,
        color: C.sole,
        bone: foot,
        name: `${foot.name}_sole`,
      },
    );
    const hoof = b.extrude(
      [
        [-0.050, 0.009],
        [0.066, 0.009],
        [0.069, 0.031],
        [0.034, 0.093],
        [-0.028, 0.107],
        [-0.051, 0.041],
      ],
      {
        at: footOrigin,
        thickness: 0.096,
        bevel: 0.006,
        detail: 0.5,
        color: C.silver,
        bone: foot,
        name: `${foot.name}_silver`,
      },
    );
    polish(hoof.mesh, 0.68, 0.28);
    polish(sole.mesh, 0.35, 0.45);

    const shineHit = b.surface(hoof).around([foot.at.x, 0.052, foot.at.z]).at(0, 10);
    b.stick(new THREE.SphereGeometry(1, 6, 4), C.silverLight, shineHit, {
      scale: [0.024, 0.0016, 0.005],
      embed: 0.3,
      name: `${foot.name}_glint`,
    });
  }

  // Tall, open ears with soft painted inner fur.
  const innerEar = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">
      <path d="M50 8 C32 48 14 102 20 155 C22 187 34 211 50 215
               C67 210 79 185 81 156 C85 108 66 43 50 8Z" fill="#d5bbdd"/>
      <path d="M50 25 C38 65 28 110 31 153 C33 179 40 196 50 202
               C62 190 68 171 68 151 C71 110 61 63 50 25Z" fill="#efc4d7"/>
      <path d="M34 167 L43 145 M41 184 L49 158 M52 183 L55 152
               M61 169 L62 143" fill="none" stroke="#fff5f5"
               stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  for (const { s, joint } of ears) {
    const ear = b.extrude(
      [
        [0, 0],
        [-0.053, 0.059],
        [-0.052, 0.145],
        [0, 0.252, "sharp"],
        [0.056, 0.151],
        [0.055, 0.061],
      ],
      {
        at: joint,
        x: [s, 0, 0],
        y: [s * 0.29, 1, -0.025],
        thickness: [0.051, 0.015],
        bevel: 0.005,
        smoothing: 1,
        detail: 0.5,
        color: pearl,
        bone: joint,
        name: `${joint.name}_outer`,
      },
    );
    b.decal(ear, innerEar, {
      at: ear.local([0, 0.132, 0]),
      dir: [0, 0, 1],
      up: [s * 0.29, 1, -0.025],
      size: [0.080, 0.192],
      segments: 6,
      bone: joint,
      name: `${joint.name}_inner`,
    });
  }

  // Big glassy eyes: projecting globes, violet rims, two catchlights, and curled lashes.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = skullSurface.nearest(h.p([s * 0.145, 0.041, 0.138]));
    const rim = b.stick(new THREE.SphereGeometry(1, 10, 7), C.eyeRim, eyeHit, {
      scale: [0.080, 0.023, 0.091],
      embed: 0.52,
      name: `eyeRim${side}`,
    });
    const globeHit = b.surface(rim).nearest(offset(eyeHit, eyeHit, 0.065));
    const eye = b.stick(new THREE.SphereGeometry(1, 12, 9), C.eye, globeHit, {
      scale: [0.073, 0.035, 0.083],
      embed: 0.47,
      name: `eye${side}`,
    });
    polish(eye.mesh, 0.10, 0.14);
    const eyeSurface = b.surface(eye);

    const bigGlint = eyeSurface.nearest(eye.local([-0.025, 0.039, 0.030]));
    b.stick(new THREE.SphereGeometry(1, 7, 5), "#fffdfb", bigGlint, {
      scale: [0.014, 0.005, 0.020],
      embed: 0.3,
      name: `eye${side}_window`,
    });
    const smallGlint = eyeSurface.nearest(eye.local([0.024, 0.034, -0.025]));
    b.stick(new THREE.SphereGeometry(0.006, 6, 4), "#dedff5", smallGlint, {
      embed: 0.45,
      name: `eye${side}_spark`,
    });

    const lidHits: ReturnType<typeof eyeSurface.nearest>[] = [];
    b.ring(
      eye,
      { count: 7, radius: 0.076, fromDeg: -69, toDeg: 69 },
      (item) => {
        const root = eyeSurface.nearest(item);
        lidHits.push(root);
        if (item.i === 0 || item.i === 6) return;
        const outward = item.outward;
        const length = 0.049 + 0.012 * Math.sin(item.t * Math.PI);
        const control = root.at
          .clone()
          .addScaledVector(outward, length * 0.55)
          .addScaledVector(eye.axis, 0.019);
        const tip = root.at
          .clone()
          .addScaledVector(outward, length)
          .addScaledVector(eye.axis, 0.035)
          .add(new THREE.Vector3(0, 0.009, 0));
        b.sweep(bezier(root, control, tip), [0.0048, 0], {
          color: C.eye,
          bone: head,
          sides: 5,
          caps: "flat",
          name: `lash${side}_${item.i}`,
        });
      },
    );
    b.sweep(catmull(lidHits), 0.0043, {
      color: C.lid,
      bone: head,
      sides: 6,
      name: `upperLid${side}`,
    });

    // A tiny pale brow ridge keeps the eyes seated in the oversized baby head.
    const brow = skullSurface.drape(
      bezier(
        h.p([s * 0.085, 0.134, 0.135]),
        h.p([s * 0.137, 0.144, 0.099]),
        h.p([s * 0.168, 0.111, 0.054]),
      ),
      { lift: 0.002 },
    );
    b.sweep(brow, [0.011, 0.005], {
      color: pearl,
      bone: head,
      sides: 6,
      name: `softBrow${side}`,
    });
  }

  const muzzleSurface = b.surface(upperJaw);
  for (const s of [1, -1]) {
    const hit = muzzleSurface.nearest(h.p([s * 0.077, -0.113, 0.406]));
    b.stick(new THREE.SphereGeometry(1, 8, 6), C.nostril, hit, {
      scale: [0.019, 0.006, 0.012],
      spin: s * 22,
      embed: 0.52,
      name: s > 0 ? "nostrilL" : "nostrilR",
    });
    for (let i = 0; i < 2; i++) {
      const root = muzzleSurface.nearest(
        h.p([s * (0.092 + i * 0.008), -0.15 - i * 0.016, 0.335]),
      );
      const tip = root.at.clone().add(new THREE.Vector3(s * 0.031, -0.004 - i * 0.006, 0.018));
      b.sweep(bezier(root, root.at.clone().lerp(tip, 0.55), tip), [0.0017, 0], {
        bone: head,
        color: "#d0becf",
        sides: 4,
        name: `babyWhisker${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }
  const mouthLine = muzzleSurface.drape(
    catmull([
      h.p([0.103, -0.163, 0.288]),
      h.p([0.100, -0.182, 0.348]),
      h.p([0.053, -0.183, 0.403]),
      h.p([0, -0.181, 0.423]),
      h.p([-0.053, -0.183, 0.403]),
      h.p([-0.100, -0.182, 0.348]),
      h.p([-0.103, -0.163, 0.288]),
    ]),
    { lift: 0.001 },
  );
  b.sweep(mouthLine, 0.0024, {
    color: C.mouth,
    bone: head,
    sides: 5,
    name: "quietLittleMouth",
  });

  // A small gold horn, with an actual raised, tapering spiral around its facets.
  const hornBase = skullSurface.around(skull.at).at(0, 58);
  const hornDirection = new THREE.Vector3(0, 1, 0.24).normalize();
  const hornLength = 0.214;
  const hornFrame = frame(hornBase, hornDirection);
  const horn = b.sweep(
    [hornBase, offset(hornBase, hornDirection, hornLength)],
    [0.038, 0],
    {
      bone: head,
      color: C.gold,
      sides: 10,
      smooth: false,
      caps: "flat",
      extend: [0.008, 0],
      name: "littleGoldHorn",
    },
  );
  for (const mesh of horn.meshes) polish(mesh, 0.67, 0.29);
  const hornSurface = b.surface(horn);
  const spiralPoints = [];
  for (let i = 0; i <= 66; i++) {
    const t = (i / 66) * 0.955;
    const angle = t * Math.PI * 2 * 2.8;
    const radius = 0.038 * (1 - t);
    const candidate = hornFrame.local([
      Math.cos(angle) * radius,
      t * hornLength,
      Math.sin(angle) * radius,
    ]);
    spiralPoints.push(hornSurface.nearest(candidate));
  }
  const goldSpiral = b.sweep(catmull(spiralPoints), [0.0038, 0.0016], {
    color: C.goldLight,
    bone: head,
    sides: 5,
    smooth: false,
    name: "raisedHornSpiral",
  });
  for (const mesh of goldSpiral.meshes) polish(mesh, 0.56, 0.27);

  // Short, cloud-like sherbet mane. Each tuft stays on its own place on the neck.
  const pastel = [
    C.pink, C.lavender, C.pinkLight, C.mint,
    C.pink, C.lavender, C.mintLight, C.pink,
  ];
  const maneParts: ReturnType<typeof b.part>[] = [];
  b.along(
    neckTube,
    8,
    (on) => {
      const i = maneParts.length;
      const puff = b.stick(new THREE.SphereGeometry(1, 8, 6), pastel[i % pastel.length], on, {
        scale: [0.061 + 0.006 * Math.sin(i * 2), 0.067, 0.065],
        embed: 0.35,
        spin: i * 27,
        flat: true,
        name: `maneCloud${i}`,
      });
      maneParts.push(puff);
    },
    { from: 0.04, to: 0.97 },
  );
  const pollHit = skullSurface.around(skull.at).at(180, 58);
  const pollPuff = b.stick(new THREE.SphereGeometry(1, 8, 6), C.pink, pollHit, {
    scale: [0.078, 0.065, 0.067],
    embed: 0.4,
    flat: true,
    name: "pollFluff",
  });
  maneParts.push(pollPuff);

  const littleFluffHits = b.surface(maneParts).scatter(10, {
    rng: rng(2037),
    minDist: 0.042,
    filter: (hit) => hit.n.y > 0.12,
  });
  littleFluffHits.forEach((hit, i) => {
    b.stick(new THREE.SphereGeometry(1, 7, 5), pastel[(i + 2) % pastel.length], hit, {
      scale: [0.025, 0.025, 0.030],
      embed: 0.53,
      flat: true,
      name: `maneLittleCurl${i}`,
    });
  });

  // Three soft forelock curls, parted around the horn.
  const forelocks = [
    { x: 0.051, color: C.pink, endX: 0.083 },
    { x: -0.046, color: C.lavender, endX: -0.078 },
    { x: -0.086, color: C.mint, endX: -0.113 },
  ];
  forelocks.forEach((lock, i) => {
    const root = skullSurface.nearest(h.p([lock.x, 0.176, 0.024]));
    b.sweep(
      bezier(
        root,
        h.p([lock.x, 0.197, 0.115]),
        h.p([lock.endX, 0.139, 0.190]),
        h.p([lock.endX, 0.096 + i * 0.006, 0.177]),
      ),
      [0.043, 0.047, 0.029, 0.003],
      {
        color: lock.color,
        bone: head,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `forelock${i}`,
      },
    );
  });

  // The small tail is extended away from the body, with separate chunky pastel locks.
  b.sweep(tail, [0.047, 0.069, 0.060, 0.012], {
    color: C.pink,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "fluffyTailCore",
  });
  const tailLocks = [
    { x: -0.040, y: 0.009, color: C.lavender },
    { x: 0.039, y: 0.004, color: C.mint },
    { x: -0.014, y: 0.040, color: C.pinkLight },
    { x: 0.017, y: -0.029, color: C.lavenderLight },
    { x: 0.008, y: 0.019, color: C.pink },
  ];
  tailLocks.forEach((lock, i) => {
    const p0 = tail.at(0.13).at.clone().add(new THREE.Vector3(lock.x * 0.35, lock.y * 0.3, 0));
    const p1 = tail.at(0.47).at.clone().add(new THREE.Vector3(lock.x, lock.y, -0.015));
    const p2 = tail.at(0.83).at.clone().add(new THREE.Vector3(lock.x * 1.05, lock.y, -0.015));
    const p3 = tail.at(1).at.clone().add(new THREE.Vector3(lock.x * 0.65, lock.y - 0.025, -0.035 - i * 0.004));
    b.sweep(catmull([p0, p1, p2, p3]), [0.028, 0.039, 0.026, 0.002], {
      bone: tail,
      color: lock.color,
      sides: 7,
      smooth: false,
      caps: "round",
      name: `tailSherbetLock${i}`,
    });
  });

  // A draped necklace, not a rigid collar: daisies continue over the sides and back.
  const necklaceSurface = b.surface([neckTube, torso]);
  const necklace = necklaceSurface.drape(
    catmull(
      [
        [0, 1.295, 0.385],
        [0.127, 1.245, 0.475],
        [0.168, 1.105, 0.552],
        [0.115, 0.994, 0.631],
        [0, 0.956, 0.647],
        [-0.115, 0.994, 0.631],
        [-0.168, 1.105, 0.552],
        [-0.127, 1.245, 0.475],
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(necklace, 0.0052, {
    color: C.vine,
    sides: 6,
    name: "daisyChainStem",
  });

  let flowerIndex = 0;
  b.along(necklace, 15, (on) => {
    const index = flowerIndex++;
    const hit = necklaceSurface.nearest(on);
    const flowerSize = 0.91 + 0.12 * Math.sin(index * 2.31);
    const center = b.stick(
      new THREE.SphereGeometry(1, 8, 5),
      C.pollen,
      hit,
      {
        scale: [0.0118 * flowerSize, 0.009, 0.0118 * flowerSize],
        embed: 0.04,
        name: `daisy${index}_center`,
      },
    );

    // A ring puts every petal in the flower's plane and on the correct bone.
    b.ring(
      center,
      { count: 9, radius: 0.021 * flowerSize },
      (petal) => {
        b.part(
          new THREE.SphereGeometry(1, 6, 4),
          petal.i % 3 === 0 ? C.petalShade : C.petal,
          {
            frame: petal,
            scale: [0.0075 * flowerSize, 0.0145 * flowerSize, 0.004],
            flat: true,
            name: `daisy${index}_petal${petal.i}`,
          },
        );
      },
    );

    const pollenHit = b.surface(center).nearest(offset(center, center, 0.020));
    b.stick(new THREE.SphereGeometry(0.0034, 5, 3), C.pollenDark, pollenHit, {
      embed: 0.65,
      name: `daisy${index}_pollen`,
    });

    if (index % 2 === 0) {
      // Two little leaves tucked behind alternating flowers.
      const leafRoot = hit.moved([0, 0.008, 0]);
      b.ring(
        leafRoot,
        { count: 2, radius: 0.026, fromDeg: 105, toDeg: 247 },
        (leaf) => {
          b.part(new THREE.SphereGeometry(1, 6, 4), C.leaf, {
            frame: leaf,
            scale: [0.0065, 0.020, 0.003],
            flat: true,
            name: `daisy${index}_leaf${leaf.i}`,
          });
        },
      );
    }
  });

  return b.root;
}
