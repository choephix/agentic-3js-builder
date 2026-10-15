```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";

export const meta = {
  name: "A Very Good Perch",
  description:
    "A warm, biscuit-coloured capybara with a tiny golden songbird perched on its head. Chunky carved forms, sleepy eyes, delicate whiskers and blue-green feather fans.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybaraAndBird", paintSize: 2048 });
  const random = rng(4817);

  const C = {
    dark: "#392b25",
    nose: "#634333",
    hoof: "#75604a",
    cream: "#ead1a0",
    pale: "#f7e6bf",
    brown: "#a27449",
    ear: "#b27e57",
    innerEar: "#83553e",
    gold: "#e9af38",
    yellow: "#ffda63",
    orange: "#db8434",
    birdInk: "#243d41",
    teal: "#398b8a",
    deepTeal: "#285c68",
    turquoise: "#62b3a4",
  };

  const fur = paint((p, n) => {
    const warm = 0.50 + 0.23 * n.y + 0.12 * n.z;
    let col = mix("#a4774f", "#d4ae75", warm);
    const mottling = noise(p, 0.12, 17);
    col = mix(col, "#ecd09a", Math.max(0, mottling - 0.47) * 0.33);
    if (p.y < 0.19) col = mix(col, "#896747", (0.19 - p.y) * 1.5);
    return col;
  });

  const muzzlePaint = paint((_p, n) =>
    mix("#bb9364", "#e1bd83", 0.53 + n.y * 0.22 + n.z * 0.14),
  );

  const birdPaint = paint((p, n) =>
    mix("#dfa138", "#ffe17a", 0.50 + n.y * 0.23 + n.z * 0.13 + (p.y - 0.9) * 0.5),
  );

  const featherPaint = paint((_p, n, s) =>
    mix("#2b6471", "#65b7aa", 0.35 + n.y * 0.25 + s[0] * 0.4),
  );

  const eyeTexture = svg(`
    <svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="45" ry="40" fill="#51372b"/>
      <ellipse cx="50" cy="51" rx="37" ry="33" fill="#241f1d"/>
      <path d="M22 63 Q48 88 77 61 Q67 84 48 85 Q30 82 22 63" fill="#916442"/>
      <ellipse cx="39" cy="39" rx="12" ry="10" fill="#fff2cf"/>
      <circle cx="67" cy="61" r="5" fill="#d8b982"/>
      <path d="M12 38 Q49 15 88 38" fill="none" stroke="#38271f" stroke-width="9" stroke-linecap="round"/>
    </svg>
  `, { size: 256 });

  const birdEye = svg(`
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#f8e5a7"/>
      <circle cx="50" cy="50" r="35" fill="#253b3c"/>
      <path d="M27 64 Q50 82 74 59 Q64 80 48 80Z" fill="#537b6d"/>
      <circle cx="40" cy="38" r="12" fill="#fffbea"/>
      <circle cx="65" cy="61" r="5" fill="#b7e0bf"/>
    </svg>
  `, { size: 192 });

  const furMarks = svg(`
    <svg viewBox="0 0 100 100">
      <g fill="none" stroke-linecap="round">
        <path d="M16 25 L26 43 M37 13 L46 35 M60 22 L69 42 M31 59 L40 79 M58 61 L67 79 M78 49 L85 64"
          stroke="#997048" stroke-width="5"/>
        <path d="M22 23 L31 40 M43 12 L52 32 M66 21 L74 38 M37 58 L46 75 M64 60 L72 75"
          stroke="#e2be85" stroke-width="3.8"/>
      </g>
    </svg>
  `, { size: 256 });

  const muzzleDots = svg(`
    <svg viewBox="0 0 100 70">
      <g fill="#9c744f">
        <ellipse cx="19" cy="23" rx="4" ry="3"/>
        <ellipse cx="44" cy="17" rx="4" ry="3"/>
        <ellipse cx="70" cy="24" rx="4" ry="3"/>
        <ellipse cx="29" cy="47" rx="3.5" ry="3"/>
        <ellipse cx="57" cy="44" rx="3.5" ry="3"/>
        <ellipse cx="81" cy="47" rx="3.5" ry="3"/>
      </g>
    </svg>
  `, { size: 192 });

  const featherDrawing = svg(`
    <svg viewBox="0 0 64 128">
      <path d="M32 118 Q8 93 12 48 Q15 17 32 4 Q51 22 53 51 Q56 90 32 118Z"
        fill="#4da399" stroke="#2f6973" stroke-width="4"/>
      <path d="M32 111 L32 22 M32 83 L19 67 M32 66 L17 49 M32 48 L23 34
               M32 90 L47 73 M32 71 L49 53 M32 50 L42 35"
        fill="none" stroke="#a0d4b7" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
  `, { size: 256 });

  // The entire rig is established before any of its geometry.
  const hips = b.joint("hips", {
    at: [0, 0.40, -0.35],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain("spine", [
    [0, 0.40, -0.35],
    [0, 0.44, -0.08],
    [0, 0.47, 0.19],
  ], {
    parent: hips,
    names: ["spineLower", "chest", "withers"],
    role: "spine",
  });

  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 0.51, 0.24],
    dir: [0, 0.2, 1],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.59, 0.38],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.435, 0.40],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.207, 0.754, 0.31],
      dir: [s * 0.15, 1, 0],
      role: "hinge",
    }),
  );

  const legs = [1, -1].flatMap((s) =>
    [true, false].map((front) => {
      const side = s > 0 ? "L" : "R";
      const tag = `${front ? "F" : "H"}${side}`;
      const z = front ? 0.16 : -0.43;
      const x = s * (front ? 0.218 : 0.225);
      const footX = s * (front ? 0.263 : 0.269);
      const footZ = z + 0.075;
      const chain = b.chain(`leg${tag}`, [
        [x, front ? 0.405 : 0.39, z],
        [s * 0.252, 0.235, z + (front ? 0.012 : -0.028)],
        [footX, 0.075, footZ],
      ], {
        parent: front ? spine.joints[1] : hips,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [footX, 0, footZ + 0.025],
      });

      const count = front ? 4 : 3;
      const digits = Array.from({ length: count }, (_, i) => {
        const dx = (i - (count - 1) / 2) * 0.038;
        const start = [footX + dx, 0.053, footZ + 0.027];
        const end = [
          footX + dx * 1.13,
          0.036,
          footZ + 0.116 - Math.abs(dx) * 0.32,
        ];
        return {
          start, end,
          joint: b.joint(`toe${tag}${i + 1}`, {
            parent: chain.tip!,
            at: start,
            aim: end,
            role: "digit",
          }),
        };
      });
      return { s, front, tag, chain, footX, footZ, digits };
    }),
  );

  const birdRoot = b.joint("birdSpine", {
    parent: head,
    at: [0, 0.905, 0.355],
    dir: [0, 0.35, 1],
    role: "spine",
  });

  const birdNeck = b.joint("birdNeck", {
    parent: birdRoot,
    at: [0, 0.953, 0.392],
    dir: [0, 1, 0.3],
    role: "neck",
  });

  const birdHead = b.joint("birdHead", {
    parent: birdNeck,
    at: [0, 0.996, 0.422],
    dir: [0, 0, 1],
    role: "head",
  });

  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, 0.976, 0.471],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const birdTail = b.chain("birdTail", [
    [0, 0.886, 0.304],
    [0, 0.891, 0.245],
    [0, 0.906, 0.177],
  ], {
    parent: birdRoot,
    role: "tail",
    names: ["birdTailBase", "birdTailTip"],
  });

  const birdWings = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(`birdWing${side}`, [
      [s * 0.049, 0.931, 0.350],
      [s * 0.102, 0.925, 0.327],
      [s * 0.155, 0.922, 0.303],
    ], {
      parent: birdRoot,
      role: "wing",
      names: [`birdShoulder${side}`, `birdElbow${side}`, `birdWrist${side}`],
    });
    return { s, chain };
  });

  const birdLegs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.032;
    const chain = b.chain(`birdLeg${side}`, [
      [x, 0.862, 0.363],
      [x, 0.830, 0.354],
      [x, 0.794, 0.385],
    ], {
      parent: birdRoot,
      role: "leg",
      names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`],
      contact: [x, 0.790, 0.385],
    });
    const digits = [-1, 0, 1].map((d, i) => {
      const start = [x, 0.795, 0.387];
      const end = [x + d * 0.020, 0.791, 0.420 + (d === 0 ? 0.009 : 0)];
      return {
        start, end,
        joint: b.joint(`birdToe${side}${i + 1}`, {
          parent: chain.tip!,
          at: start,
          aim: end,
          role: "digit",
        }),
      };
    });
    return { x, chain, digits };
  });

  type Fill = string | Paint;

  function ellipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale: size,
      bone,
      name,
      flat: true,
    });
  }

  function frontPlate(
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    name: string,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir,
      axis: "z",
      up: [0, 1, 0],
      texture,
      bone,
      name,
    });
  }

  // Big, uncomplicated capybara masses.
  const torso = b.loft([
    { at: [0, 0.386, -0.635], w: 0.34, h: 0.35 },
    { at: [0, 0.405, -0.50], w: 0.56, h: 0.51 },
    { at: [0, 0.420, -0.27], w: 0.60, h: 0.54 },
    { at: [0, 0.444, 0.00], w: 0.54, h: 0.49 },
    { at: [0, 0.470, 0.20], w: 0.43, h: 0.41 },
    { at: [0, 0.505, 0.28], w: 0.34, h: 0.33 },
  ], {
    bone: [hips, spine, neck],
    color: fur,
    sides: 10,
    caps: "round",
    name: "barrelBody",
  });

  b.sweep([
    [0, 0.48, 0.18],
    [0, 0.56, 0.34],
  ], () => [0.188, 0.185], {
    bone: neck,
    color: fur,
    sides: 10,
    name: "shortThickNeck",
  });

  const skull = b.extrude([
    [-0.235, -0.123],
    [-0.235, 0.103],
    [-0.192, 0.185],
    [-0.08, 0.202],
    [0.08, 0.202],
    [0.192, 0.185],
    [0.235, 0.103],
    [0.235, -0.123],
    [0.177, -0.179],
    [-0.177, -0.179],
  ], {
    at: [0, 0.59, 0.38],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.40,
    bevel: 0.045,
    smoothing: 1,
    bone: head,
    color: fur,
    name: "broadCapybaraSkull",
  });

  const snout = b.extrude([
    [-0.214, -0.073],
    [-0.213, 0.060],
    [-0.160, 0.112],
    [0.160, 0.112],
    [0.213, 0.060],
    [0.214, -0.073],
    [0.153, -0.105],
    [-0.153, -0.105],
  ], {
    at: [0, 0.505, 0.578],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.274,
    bevel: 0.034,
    smoothing: 1,
    color: muzzlePaint,
    bone: head,
    name: "bluntUpperMuzzle",
  });

  const lowerJaw = b.extrude([
    [-0.173, -0.022],
    [-0.183, 0.025],
    [-0.141, 0.047],
    [0.141, 0.047],
    [0.183, 0.025],
    [0.173, -0.022],
    [0.11, -0.038],
    [-0.11, -0.038],
  ], {
    at: [0, 0.408, 0.565],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.245,
    bevel: 0.015,
    smoothing: 1,
    color: muzzlePaint,
    bone: jaw,
    name: "separateLowerJaw",
  });

  // A quiet, almost-smile: it remains on the lower jaw.
  b.sweep(bezier(
    [-0.143, 0.430, 0.686],
    [0, 0.409, 0.697],
    [0.143, 0.430, 0.686],
  ), 0.004, {
    color: C.nose,
    bone: jaw,
    sides: 6,
    name: "gentleMouth",
  });

  b.sweep([
    [0, 0.477, 0.715],
    [0, 0.448, 0.714],
    [0, 0.433, 0.699],
  ], 0.0033, {
    color: "#a17a53",
    bone: head,
    sides: 5,
    name: "muzzlePhiltrum",
  });

  const skullSurface = b.surface(skull);
  const snoutSurface = b.surface(snout);

  for (const [index, s] of [1, -1].entries()) {
    const side = s > 0 ? "L" : "R";
    const hit = skullSurface.nearest([s * 0.171, 0.653, 0.60]);

    const socket = b.stick(new THREE.SphereGeometry(1, 12, 8), "#a77e53", hit, {
      scale: [0.047, 0.014, 0.045],
      embed: 0.35,
      name: `softEyeSocket${side}`,
      bone: head,
    });
    b.decal(socket, eyeTexture, {
      at: hit,
      dir: [0, 0, 1],
      size: [0.064, 0.058],
      lift: 0.0018,
      bone: head,
      name: `sleepyEye${side}`,
    });

    b.sweep(bezier(
      [s * 0.128, 0.697, 0.576],
      [s * 0.169, 0.710, 0.582],
      [s * 0.209, 0.693, 0.565],
    ), [0.009, 0.006], {
      color: fur,
      bone: head,
      sides: 6,
      name: `heavyBrow${side}`,
    });

    const nostrilHit = snoutSurface.nearest([s * 0.104, 0.568, 0.73]);
    b.stick(new THREE.SphereGeometry(1, 10, 6), C.nose, nostrilHit, {
      scale: [0.023, 0.006, 0.012],
      embed: 0.20,
      spin: s * 13,
      bone: head,
      name: `nostril${side}`,
    });

    b.decal(snout, muzzleDots, {
      at: [s * 0.124, 0.494, 0.72],
      dir: [0, 0, 1],
      size: [0.103, 0.065],
      mirror: s < 0,
      bone: head,
      name: `whiskerFreckles${side}`,
    });

    const ear = ellipsoid(
      [s * 0.213, 0.796, 0.306],
      [0.058, 0.076, 0.043],
      fur, ears[index], `roundedEar${side}`, 10,
    );
    const earHit = b.surface(ear).nearest([s * 0.213, 0.803, 0.36]);
    b.stick(new THREE.SphereGeometry(1, 10, 6), C.innerEar, earHit, {
      scale: [0.036, 0.006, 0.047],
      bone: ears[index],
      embed: 0.3,
      name: `earCup${side}`,
    });
    ellipsoid(
      [s * 0.215, 0.783, 0.346],
      [0.024, 0.023, 0.009],
      C.ear, ears[index], `earFold${side}`, 8,
    );

    // Just two short whiskers each: broad muzzle, not a rodent moustache.
    for (let i = 0; i < 2; i++) {
      const start = [s * 0.177, 0.487 - i * 0.023, 0.681];
      b.sweep(bezier(
        start,
        [s * 0.237, 0.490 - i * 0.026, 0.700],
        [s * (0.283 - i * 0.010), 0.501 - i * 0.043, 0.696],
      ), [0.0026, 0.0008], {
        color: "#ead4a7",
        bone: head,
        sides: 5,
        name: `whisker${side}${i}`,
      });
    }
  }

  // Sturdy little legs, four toes in front and three behind.
  for (const leg of legs) {
    b.sweep(leg.chain, leg.front ? [0.084, 0.067, 0.052] : [0.105, 0.079, 0.058], {
      color: fur,
      sides: 8,
      name: `legVolume${leg.tag}`,
    });

    const foot = ellipsoid(
      [leg.footX, 0.066, leg.footZ + 0.025],
      [leg.front ? 0.091 : 0.084, 0.064, 0.095],
      fur, leg.chain.tip!, `paddedFoot${leg.tag}`, 10,
    );

    for (const [i, toe] of leg.digits.entries()) {
      b.sweep([toe.start, toe.end], [0.024, 0.021], {
        color: fur,
        bone: toe.joint,
        sides: 6,
        name: `toeShape${leg.tag}${i + 1}`,
      });
      ellipsoid(
        [toe.end[0], 0.037, toe.end[2] + 0.011],
        [0.017, 0.015, 0.023],
        C.hoof, toe.joint, `littleNail${leg.tag}${i + 1}`, 8,
      );
    }

    const footHit = b.surface(foot).nearest([
      leg.footX + leg.s * 0.042, 0.116, leg.footZ + 0.05,
    ]);
    b.stick(new THREE.BoxGeometry(0.017, 0.003, 0.030), "#c69c68", footHit, {
      embed: 0.4,
      bone: leg.chain.tip!,
      name: `footFurDash${leg.tag}`,
    });
  }

  // Sparse carved fur rather than a smooth or fluffy coat.
  const bodySurface = b.surface(torso);
  const tuftHits = bodySurface.scatter(37, {
    rng: random,
    minDist: 0.065,
    filter: (h) => h.n.y > -0.05 && h.at.z < 0.12,
  });

  for (const [i, hit] of tuftHits.entries()) {
    const length = 0.023 + random() * 0.016;
    b.stick(new THREE.ConeGeometry(0.009, length, 4), i % 3 ? "#c49a65" : "#d9b47d", hit, {
      embed: 0.68,
      flow: [0, 0.2, -1],
      name: `carvedFur${i}`,
    });
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.decal(torso, furMarks, {
        at: [s * 0.29, 0.46 + (i % 2) * 0.06, -0.43 + i * 0.20],
        dir: [s, 0.15, 0],
        size: [0.15, 0.13],
        mirror: s < 0,
        roll: s * -12,
        name: `flankBrushwork${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  b.decal(skull, furMarks, {
    at: [0, 0.717, 0.585],
    dir: [0, 0, 1],
    size: [0.16, 0.085],
    bone: head,
    name: "foreheadBrushwork",
  });

  for (const s of [1, -1]) {
    b.decal(skull, furMarks, {
      at: [s * 0.232, 0.57, 0.39],
      dir: [s, 0, 0],
      size: [0.12, 0.12],
      bone: head,
      name: `cheekBrushwork${s > 0 ? "L" : "R"}`,
    });
  }

  // The bird has its own miniature skeleton and a clear, separate silhouette.
  const birdBody = ellipsoid(
    [0, 0.907, 0.353],
    [0.065, 0.078, 0.087],
    birdPaint, birdRoot, "birdPearBody", 12,
  );

  ellipsoid(
    [0, 0.921, 0.405],
    [0.049, 0.056, 0.035],
    "#ffe9a2", birdRoot, "birdCreamBreast", 10,
  );

  b.sweep([
    [0, 0.945, 0.389],
    [0, 0.985, 0.415],
  ], [0.038, 0.044], {
    color: birdPaint,
    bone: birdNeck,
    sides: 8,
    name: "birdNeckVolume",
  });

  const littleSkull = ellipsoid(
    [0, 0.998, 0.423],
    [0.067, 0.063, 0.063],
    birdPaint, birdHead, "birdRoundHead", 12,
  );

  const upperBeak = b.extrude([
    [-0.026, 0.005],
    [0.026, 0.005],
    [0.019, 0.024],
    [0, 0.033],
    [-0.019, 0.024],
  ], {
    at: [0, 0.975, 0.482],
    x: [1, 0, 0],
    y: [0, 1, 0.8],
    thickness: [0.047, 0.012],
    bevel: 0.002,
    color: C.orange,
    bone: birdHead,
    name: "birdUpperBeak",
  });

  b.extrude([
    [-0.021, 0.003],
    [0, -0.014],
    [0.021, 0.003],
  ], {
    at: [0, 0.976, 0.486],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.020, 0.044],
    bevel: 0.001,
    color: "#bd682b",
    bone: birdJaw,
    name: "birdLowerBeak",
  });

  for (const s of [1, -1]) {
    const eyeHit = b.surface(littleSkull).nearest([s * 0.040, 1.010, 0.485]);
    b.decal(littleSkull, birdEye, {
      at: eyeHit,
      dir: [s * 0.30, 0.05, 1],
      size: [0.033, 0.035],
      lift: 0.001,
      bone: birdHead,
      name: `birdEye${s > 0 ? "L" : "R"}`,
    });

    const cheekHit = b.surface(littleSkull).nearest([s * 0.052, 0.983, 0.462]);
    b.stick(new THREE.SphereGeometry(1, 8, 6), "#e8a04d", cheekHit, {
      scale: [0.016, 0.003, 0.010],
      embed: 0.4,
      bone: birdHead,
      name: `birdCheek${s > 0 ? "L" : "R"}`,
    });
  }

  // Three little swept-back crown feathers.
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.017;
    b.sweep(bezier(
      [x, 1.043, 0.409],
      [x, 1.081 + (i === 1 ? 0.010 : 0), 0.393],
      [x + 0.004, 1.070, 0.378],
    ), [0.011, 0], {
      color: i === 1 ? "#e8ae40" : "#f9cd58",
      bone: birdHead,
      sides: 6,
      name: `birdCrownFeather${i}`,
    });
  }

  for (const wing of birdWings) {
    const s = wing.s;
    const side = s > 0 ? "L" : "R";

    b.sweep(wing.chain, [0.029, 0.023, 0.013], {
      color: C.teal,
      sides: 6,
      name: `birdWingArm${side}`,
    });

    b.slab([
      [s * 0.048, 0.938, 0.360],
      [s * 0.112, 0.939, 0.335],
      [s * 0.164, 0.923, 0.296],
      [s * 0.117, 0.903, 0.268],
      [s * 0.061, 0.897, 0.305],
    ], {
      color: featherPaint,
      thickness: 0.013,
      bone: wing.chain.joints[0],
      name: `birdWingCover${side}`,
    });

    for (let i = 0; i < 5; i++) {
      const root = [
        s * (0.081 + i * 0.015),
        0.921,
        0.336 - i * 0.008,
      ];
      const tip = [
        s * (0.103 + i * 0.019),
        0.898 - i * 0.001,
        0.257 - i * 0.007,
      ];
      b.sweep(bezier(
        root,
        [s * (0.106 + i * 0.018), 0.918, 0.288 - i * 0.008],
        tip,
      ), (t) => [
        (0.011 + Math.sin(t * Math.PI) * 0.004) * (1 - 0.55 * t),
        0.0045 * (1 - t * 0.65),
      ], {
        color: i % 2 === 0 ? C.deepTeal : C.teal,
        bone: wing.chain.joints[i < 2 ? 0 : 1],
        sides: 6,
        name: `birdFlightFeather${side}${i}`,
      });

      b.sweep([
        [root[0], root[1] + 0.005, root[2]],
        [tip[0], tip[1] + 0.005, tip[2] + 0.009],
      ], [0.0024, 0.0011], {
        color: "#99cbb1",
        bone: wing.chain.joints[i < 2 ? 0 : 1],
        sides: 5,
        name: `birdFeatherShaft${side}${i}`,
      });
    }

    // Broad patterned coverts, laid over the upper wing.
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.PlaneGeometry(0.022, 0.042), "#ffffff", {
        at: [s * (0.079 + i * 0.026), 0.942 - i * 0.003, 0.322 - i * 0.012],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        rotation: undefined,
        texture: featherDrawing,
        bone: wing.chain.joints[0],
        name: `birdPaintedCovert${side}${i}`,
      });
    }
  }

  b.sweep(birdTail, [0.020, 0.010], {
    color: C.deepTeal,
    sides: 6,
    name: "birdTailCore",
  });

  for (let i = -1; i <= 1; i++) {
    b.sweep(bezier(
      [i * 0.013, 0.887, 0.291],
      [i * 0.022, 0.894, 0.229],
      [i * 0.031, 0.914, 0.167 + Math.abs(i) * 0.015],
    ), (t) => [
      0.013 * (1 - t * 0.45),
      0.005 * (1 - t * 0.65),
    ], {
      color: i === 0 ? C.teal : C.deepTeal,
      bone: birdTail,
      sides: 6,
      name: `birdTailFeather${i + 1}`,
    });
    b.sweep([
      [i * 0.013, 0.894, 0.270],
      [i * 0.028, 0.918, 0.183 + Math.abs(i) * 0.013],
    ], [0.002, 0.001], {
      color: C.turquoise,
      bone: birdTail,
      sides: 5,
      name: `birdTailHighlight${i + 1}`,
    });
  }

  for (const [i, leg] of birdLegs.entries()) {
    b.sweep(leg.chain, [0.0065, 0.0045], {
      color: "#bf7e34",
      sides: 6,
      name: `birdSlenderLeg${i}`,
    });
    for (const [j, toe] of leg.digits.entries()) {
      b.sweep(bezier(
        toe.start,
        [(toe.start[0] + toe.end[0]) / 2, 0.799, toe.end[2] - 0.010],
        toe.end,
      ), [0.0045, 0.002], {
        color: "#d99a45",
        bone: toe.joint,
        sides: 5,
        name: `birdPerchingToe${i}${j}`,
      });
    }
    b.sweep([
      [leg.x, 0.795, 0.385],
      [leg.x, 0.793, 0.355],
      [leg.x + (i ? -0.007 : 0.007), 0.790, 0.346],
    ], [0.0035, 0.0015], {
      color: "#c98a3e",
      bone: leg.chain.tip!,
      sides: 5,
      name: `birdBackToe${i}`,
    });
  }

  // Tiny breast marks reinforce the little bird without adding accessories.
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.018;
    b.sweep([
      [x - 0.004, 0.920, 0.435],
      [x, 0.913, 0.439],
      [x + 0.004, 0.920, 0.435],
    ], 0.0017, {
      color: "#deb85f",
      bone: birdRoot,
      sides: 5,
      name: `birdBreastChevron${i}`,
    });
  }

  return b.root;
}
```