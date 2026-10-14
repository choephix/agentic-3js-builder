import * as THREE from "three";
import {
  createBuilder, catmull, rng, svg, mottle, grain
} from "../../../../src/index";
import type { JointRef, Fill, Chain } from "../../../../src/index";

export const meta = {
  name: "Bamboo Bliss",
  description: "A delighted red panda balancing on an old moss-covered branch, with a striped, extravagant tail and a freshly picked bamboo shoot."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo Bliss", detail: 0.75, paintSize: 1024 });
  const random = rng(7249);
  const C = {
    rust: "#af482b",
    ginger: "#c65c31",
    redDark: "#823727",
    cream: "#f5eddb",
    creamShade: "#ddd2b8",
    tailCream: "#efc993",
    tailRed: "#b94d28",
    black: "#242527",
    charcoal: "#343234",
    eye: "#111a1d",
    eyeRim: "#693a2b",
    nose: "#172022",
    mouth: "#352125",
    tongue: "#e99187",
    bark: "#513a2c",
    barkLight: "#806044",
    moss: "#526e35",
    mossLight: "#829447",
    mossDark: "#354f31",
    mossGold: "#9aab56",
    fern: "#456c40",
    fernLight: "#78984c",
    bamboo: "#8dba58",
    bambooDark: "#426c38",
    bambooLight: "#c5d581",
    leaf: "#54883f",
    leafLight: "#8aac52",
    claw: "#c5b99f"
  };

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const sphere = (
    name: string, at: readonly number[] | THREE.Vector3,
    scale: readonly number[], color: Fill, bone: JointRef,
    segments = 12
  ) => b.part(new THREE.SphereGeometry(1, segments, 8), color, {
    name, at, scale, bone, flat: true
  });

  // Skeleton first. The feet are planted; the arms and individual digits
  // remain separated, with the tail unfurled beside the balancing body.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    at: [0, 0.473, -0.025], parent: root, dir: [0, 1, 0], role: "spine"
  });
  const spine = b.chain("spine", [
    [0, 0.473, -0.025], [0, 0.615, -0.037], [0, 0.745, 0.006]
  ], { parent: hips, names: ["spine1", "chest", "shoulders"], role: "spine" });
  const neck = b.chain("neck", [
    [0, 0.737, 0.0], [0, 0.805, 0.023], [0, 0.871, 0.057]
  ], { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", {
    at: [0, 0.911, 0.080], parent: neck, dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    at: [0, 0.849, 0.160], parent: head, dir: [0, 0, 1], role: "jaw"
  });

  const tailPath = catmull([
    [0, 0.480, -0.145],
    [-0.158, 0.479, -0.265],
    [-0.350, 0.451, -0.308],
    [-0.526, 0.411, -0.237],
    [-0.655, 0.403, -0.071],
    [-0.704, 0.447, 0.139]
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips, count: 5, role: "tail", up: [0, 1, 0]
  });

  const legs: { side: string; sign: number; chain: Chain }[] = [];
  const arms: { side: string; sign: number; chain: Chain }[] = [];
  const ears: { side: string; sign: number; bone: JointRef }[] = [];
  type Digit = {
    chain: Chain; points: number[][]; hind: boolean; sign: number; side: string; index: number;
  };
  const digits: Digit[] = [];

  for (const [side, sign] of [["L", 1], ["R", -1]] as const) {
    const leg = b.chain(`leg${side}`, [
      [sign * 0.097, 0.474, -0.028],
      [sign * 0.119, 0.382, 0.016],
      [sign * 0.117, 0.315, 0.015],
      [sign * 0.117, 0.282, 0.105]
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `pawH${side}`],
      role: "leg", contact: [sign * 0.117, 0.252, 0.064]
    });
    legs.push({ side, sign, chain: leg });

    const armPoints = sign > 0 ? [
      [0.131, 0.733, 0.024], [0.253, 0.691, 0.058], [0.355, 0.691, 0.119]
    ] : [
      [-0.131, 0.733, 0.024], [-0.256, 0.719, 0.048], [-0.356, 0.727, 0.090]
    ];
    const arm = b.chain(`arm${side}`, armPoints, {
      parent: spine.tip!, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm"
    });
    arms.push({ side, sign, chain: arm });
    const ear = b.joint(`ear${side}`, {
      parent: head, at: [sign * 0.130, 1.020, 0.061],
      dir: [0, 1, 0], role: "hinge"
    });
    ears.push({ side, sign, bone: ear });

    for (let i = 0; i < 4; i++) {
      const z = (sign > 0 ? 0.084 : 0.057) + i * 0.022;
      const y = sign > 0 ? 0.684 : 0.723;
      const points = [
        [sign * 0.349, y, z],
        [sign * (0.386 + 0.004 * (i % 2)), y + (i - 1.5) * 0.006, z + 0.010],
        [sign * (0.417 + 0.005 * (i % 2)), y + (i - 1.5) * 0.011, z + 0.020]
      ];
      const chain = b.chain(`finger${i + 1}${side}`, points, {
        parent: arm.tip!, role: "digit",
        names: [`finger${i + 1}${side}`, `finger${i + 1}Tip${side}`, `clawF${i + 1}${side}`]
      });
      digits.push({ chain, points, hind: false, sign, side, index: i });
    }
    for (let i = 0; i < 3; i++) {
      const x = sign * 0.117 + (i - 1) * 0.025;
      const points = [
        [x, 0.282, 0.088],
        [x + (i - 1) * 0.006, 0.278, 0.116],
        [x + (i - 1) * 0.009, 0.276, 0.139]
      ];
      const chain = b.chain(`toe${i + 1}${side}`, points, {
        parent: leg.tip!, role: "digit",
        names: [`toe${i + 1}${side}`, `toe${i + 1}Tip${side}`, `clawH${i + 1}${side}`]
      });
      digits.push({ chain, points, hind: true, sign, side, index: i });
    }
  }

  // A fallen, bowed branch: both sawn ends actually reach the ground.
  const branchPoints = [
    [-0.88, 0.061, -0.070],
    [-0.57, 0.143, -0.012],
    [-0.22, 0.175, 0.013],
    [0.22, 0.173, 0.010],
    [0.57, 0.121, -0.022],
    [0.86, 0.050, -0.086]
  ];
  const branchPath = catmull(branchPoints);
  const barkPaint = grain(C.bark, C.barkLight, { size: 0.017, axis: "x", seed: 37 });
  const branch = b.sweep(branchPath, [0.060, 0.087, 0.095, 0.095, 0.068, 0.050], {
    name: "old_bowed_branch", color: barkPaint, sides: 8,
    smooth: false, caps: "flat", bone: root, up: [0, 1, 0]
  });
  const twigA = b.sweep(catmull([
    [-0.405, 0.164, -0.016], [-0.594, 0.143, -0.210], [-0.822, 0.077, -0.384]
  ]), [0.048, 0.032, 0.015], {
    name: "back_fork", color: barkPaint, sides: 7, smooth: false, bone: root, caps: "flat"
  });
  b.sweep(catmull([
    [0.456, 0.142, -0.014], [0.650, 0.105, 0.143], [0.787, 0.073, 0.246]
  ]), [0.034, 0.024, 0.009], {
    name: "front_fork", color: barkPaint, sides: 6, smooth: false, bone: root, caps: "flat"
  });

  const endgrain = svg(`<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="#c2935c"/>
    <g fill="none" stroke="#91683f" stroke-width="5">
      <path d="M130 17C197 13 244 71 239 130S190 241 124 240S16 190 17 122S68 14 130 17Z"/>
      <path d="M124 42C177 35 218 79 217 130S174 218 126 213S40 174 42 124S78 47 124 42Z"/>
      <path d="M125 66C166 57 193 91 190 134S160 191 122 191S64 156 66 121S92 72 125 66Z"/>
      <path d="M125 94C149 85 169 106 165 134S147 164 123 160S90 145 94 120S106 98 125 94Z"/>
    </g>
    <path d="M124 126L145 138L155 134M231 93L199 107L194 129M46 216L76 183L88 189"
      fill="none" stroke="#674731" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="125" cy="126" rx="12" ry="9" fill="#845b38"/>
  </svg>`, { size: 256 });

  for (const [t, radius] of [[0, 0.057], [1, 0.047]] as const) {
    const dir = branchPath.tangentAt(t).multiplyScalar(t === 0 ? -1 : 1);
    b.part(new THREE.CircleGeometry(radius, 8), "#ffffff", {
      name: t === 0 ? "left_end_grain" : "right_end_grain",
      at: branchPath.at(t).addScaledVector(dir, 0.0018),
      dir, axis: "z", bone: root, texture: endgrain
    });
  }

  // Moss is seated on the actual bark triangles, rather than floating above it.
  const branchSurface = b.surface(branch);
  const mossColors = [C.moss, C.mossLight, C.mossDark, C.mossGold];
  const mossGeometry = new THREE.DodecahedronGeometry(1, 0);
  const mossHits = branchSurface.scatter(76, {
    rng: random, minDist: 0.035,
    filter: hit => hit.n.y > 0.43,
    keepOut: p => Math.abs(p.x) < 0.19 && p.z > -0.025 && p.z < 0.115
  });
  mossHits.forEach((hit, i) => {
    const size = 0.023 + random() * 0.027;
    b.stick(mossGeometry, mossColors[i % mossColors.length], hit, {
      name: `moss_cushion_${i}`, scale: [size * 1.3, size * 0.47, size],
      embed: 0.32, flow: [1, 0, 0], spin: random() * 160
    });
  });
  b.along(twigA, 9, on => {
    b.stick(mossGeometry, C.mossDark, on, {
      scale: [0.026, 0.012, 0.031], embed: 0.3, flow: on.tangent
    });
  });

  // Main volumes: a pear-shaped rusty coat, black chest, and short plush limbs.
  const fur = mottle(C.rust, C.ginger, { size: 0.105, seed: 9, contrast: 0.35 });
  const body = b.loft([
    { at: [0, 0.455, -0.030], w: 0.213, h: 0.206 },
    { at: [0, 0.540, -0.039], w: 0.302, h: 0.280 },
    { at: [0, 0.655, -0.028], w: 0.282, h: 0.251 },
    { at: [0, 0.750, 0.009], w: 0.206, h: 0.182 }
  ], {
    name: "rusty_coat", color: fur, bone: [hips, spine],
    sides: 10, smooth: false, caps: "round",
    sectors: [[112, 248, C.black]]
  });
  sphere("velvet_belly", [0, 0.592, 0.071], [0.125, 0.154, 0.071], C.black, spine);
  b.sweep(neck, [0.091, 0.085, 0.088], {
    name: "short_furry_neck", color: fur, sides: 8, smooth: false,
    sectors: [[110, 250, C.black]]
  });

  for (const { side, sign, chain } of legs) {
    b.sweep(chain, [0.060, 0.051, 0.040, 0.032], {
      name: `black_leg_${side}`, color: C.black, sides: 8, smooth: false
    });
    sphere(`knee_fluff_${side}`, [sign * 0.119, 0.376, 0.022],
      [0.050, 0.058, 0.052], C.black, chain.joints[1], 10);
    b.loft([
      { at: [sign * 0.117, 0.285, 0.013], w: 0.078, h: 0.061 },
      { at: [sign * 0.117, 0.285, 0.066], w: 0.104, h: 0.064 },
      { at: [sign * 0.117, 0.284, 0.106], w: 0.085, h: 0.057 }
    ], {
      name: `hind_paw_${side}`, bone: chain.tip!, color: C.black,
      sides: 8, smooth: false, caps: "round"
    });
  }
  for (const { side, sign, chain } of arms) {
    b.sweep(chain, [0.057, 0.041, 0.027], {
      name: `outstretched_arm_${side}`, sides: 8, smooth: false,
      bands: [[0.24, fur], [1, C.black]]
    });
    const y = sign > 0 ? 0.691 : 0.727;
    const z = sign > 0 ? 0.118 : 0.090;
    sphere(`front_palm_${side}`, [sign * 0.355, y, z],
      [0.042, 0.030, 0.053], C.black, chain.tip!, 10);
    sphere(`elbow_highlight_${side}`, chain.joints[1].at,
      [0.037, 0.038, 0.036], C.charcoal, chain.joints[1], 8);
  }
  for (const digit of digits) {
    b.sweep(digit.chain, digit.hind ? [0.013, 0.010, 0.007] : [0.011, 0.009, 0.006], {
      name: `${digit.hind ? "toe" : "finger"}_${digit.index}_${digit.side}`,
      color: C.black, sides: 6, smooth: false, caps: "round"
    });
    const end = V(digit.points[2]);
    const dir = digit.hind ? new THREE.Vector3(0, -0.12, 1) :
      new THREE.Vector3(digit.sign, -0.08, 0.23);
    b.spike(end, dir, digit.hind ? 0.017 : 0.011, digit.hind ? 0.005 : 0.0038, {
      color: C.claw, bone: digit.chain.tip!, sides: 5, smooth: false
    });
  }

  // A few large, angular locks give the simple torso a plush silhouette.
  const bodyTuft = new THREE.ConeGeometry(0.015, 0.041, 4);
  bodyTuft.rotateX(0.62);
  b.surface(body).scatter(24, {
    rng: random, minDist: 0.037,
    filter: h => h.n.z < -0.20 || (Math.abs(h.at.x) > 0.112 && h.n.z < 0.35)
  }).forEach((hit, i) => b.stick(bodyTuft, i % 3 === 0 ? C.ginger : C.rust, hit, {
    name: `coat_lock_${i}`, embed: 0.48, flow: [0, -1, -0.35]
  }));

  const tailBands: Array<readonly [number, string]> = [
    [0.095, C.tailRed], [0.185, C.tailCream],
    [0.290, C.tailRed], [0.385, C.tailCream],
    [0.495, C.tailRed], [0.595, C.tailCream],
    [0.705, C.tailRed], [0.805, C.tailCream],
    [0.905, C.tailRed], [1, C.tailCream]
  ];
  const tailSweep = b.sweep(tail, [0.062, 0.095, 0.105, 0.099, 0.077, 0.024], {
    name: "magnificent_ringed_tail", bands: tailBands,
    sides: 10, smooth: false, caps: "round"
  });
  const tailColor = (t: number) => tailBands.find(([end]) => t <= end)![1];
  const tailTuft = new THREE.ConeGeometry(0.012, 0.036, 4);
  tailTuft.rotateX(0.63);
  for (let i = 0; i < 19; i++) {
    const t = 0.08 + i * 0.046;
    for (const angle of [-62, 62]) {
      const on = tailSweep.at(t, angle);
      b.stick(tailTuft, tailColor(t), on, {
        name: `tail_fluff_${i}_${angle < 0 ? "a" : "b"}`,
        flow: on.tangent, embed: 0.42
      });
    }
  }

  // Head and the separate lower jaw.
  sphere("round_rusty_head", [0, 0.919, 0.081], [0.178, 0.145, 0.139], fur, head, 14);
  const face = sphere("white_face", [0, 0.918, 0.187],
    [0.167, 0.122, 0.064], C.cream, head, 16);

  // Deliberate pointed ear outlines, with a broad ivory rim and recessed centers.
  for (const { side, sign, bone } of ears) {
    const mirror = (points: number[][]) => points.map(([x, y]) => [x * sign, y]);
    const outline = [
      [-0.049, -0.022], [0.047, -0.017], [0.052, 0.042],
      [0.030, 0.108], [-0.025, 0.079], [-0.049, 0.025]
    ];
    b.extrude(mirror(outline), {
      name: `ear_back_${side}`, at: [sign * 0.130, 1.015, 0.047],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.063,
      bevel: 0.005, color: C.rust, bone, detail: 0.4
    });
    b.extrude(mirror(outline), {
      name: `ivory_ear_rim_${side}`, at: [sign * 0.130, 1.015, 0.083],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014,
      bevel: 0.003, color: C.cream, bone, detail: 0.4
    });
    b.extrude(mirror([
      [-0.030, -0.005], [0.032, 0.0], [0.034, 0.037],
      [0.021, 0.083], [-0.013, 0.062], [-0.029, 0.025]
    ]), {
      name: `dark_inner_ear_${side}`, at: [sign * 0.130, 1.015, 0.094],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.009,
      color: "#51352e", bone
    });
    b.extrude(mirror([
      [-0.015, 0.005], [0.024, 0.012], [0.020, 0.053], [0.0, 0.039]
    ]), {
      name: `warm_inner_ear_${side}`, at: [sign * 0.130, 1.015, 0.101],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004,
      color: "#986047", bone
    });
  }

  // Cheek ruffs are a handful of chunky, overlapping wedges.
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = 0.936 - i * 0.035;
      b.slab([
        [sign * 0.130, y + 0.023, 0.182],
        [sign * (0.194 - i * 0.009), y - 0.012, 0.172],
        [sign * 0.149, y - 0.033, 0.204]
      ], {
        name: `white_cheek_lock_${sign}_${i}`, color: C.cream,
        thickness: 0.027, bone: head
      });
    }
  }

  const tearDrawing = svg(`<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path id="tear" d="M224 86L250 91C244 110 238 122 244 143
        C251 161 255 178 249 198L232 184C218 158 213 136 223 105Z"/>
    </defs>
    <g fill="#ad452b">
      <use href="#tear"/>
      <use href="#tear" transform="translate(300 0) scale(-1 1)"/>
      <path d="M122 0L178 0L170 23L150 45L130 23Z"/>
    </g>
    <g fill="#c9693a">
      <path d="M245 137C250 157 253 175 248 189L239 177L235 147Z"/>
      <path d="M55 137C50 157 47 175 52 189L61 177L65 147Z"/>
    </g>
  </svg>`, { size: 512 });
  b.decal(face, tearDrawing, {
    name: "rust_red_tear_marks", at: [0, 0.918, 0.25], dir: [0, 0, 1],
    size: [0.300, 0.200], segments: [24, 18], lift: 0.0015, bone: head
  });

  const faceSurface = b.surface(face);
  for (const sign of [-1, 1]) {
    const hit = faceSurface.ray([sign * 0.081, 0.954, 0.60], [0, 0, -1])!;
    const socketGeometry = new THREE.SphereGeometry(1, 12, 8);
    socketGeometry.scale(0.037, 0.012, 0.042);
    b.stick(socketGeometry, C.eyeRim, hit, {
      name: `eye_rust_outline_${sign}`, flow: [0, 1, 0], embed: 0.22, spin: sign * 7, flat: true
    });
    const eyeGeometry = new THREE.SphereGeometry(1, 12, 8);
    eyeGeometry.scale(0.030, 0.015, 0.035);
    const eye = b.stick(eyeGeometry, C.eye, hit, {
      name: `delighted_eye_${sign}`, flow: [0, 1, 0], embed: 0.01, spin: sign * 7, flat: true
    });
    const eyeSkin = b.surface(eye);
    const sparkle = eyeSkin.ray([sign * 0.075 - 0.007, 0.972, 0.65], [0, 0, -1]);
    if (sparkle) {
      b.stick(new THREE.SphereGeometry(0.009, 8, 5), C.cream, sparkle, {
        name: `eye_catchlight_${sign}`, embed: 0.33, flat: true
      });
    }
    const sparkle2 = eyeSkin.ray([sign * 0.084 + 0.005, 0.946, 0.65], [0, 0, -1]);
    if (sparkle2) b.stick(new THREE.SphereGeometry(0.0037, 6, 4), "#ffffff", sparkle2, {
      name: `eye_small_catchlight_${sign}`, embed: 0.28, flat: true
    });
  }

  sphere("smiling_mouth_interior", [0, 0.841, 0.268],
    [0.055, 0.028, 0.020], C.mouth, jaw, 12);
  sphere("lower_white_jaw", [0, 0.811, 0.263],
    [0.058, 0.024, 0.038], C.cream, jaw, 12);
  sphere("happy_little_tongue", [0, 0.833, 0.290],
    [0.025, 0.010, 0.009], C.tongue, jaw, 10);
  for (const sign of [-1, 1]) {
    sphere(`upper_muzzle_${sign}`, [sign * 0.036, 0.866, 0.260],
      [0.049, 0.033, 0.033], C.cream, head, 12);
  }
  b.extrude([
    [-0.022, 0.010], [0.022, 0.010], [0.015, -0.009],
    [0, -0.019], [-0.015, -0.009]
  ], {
    name: "little_black_nose", at: [0, 0.893, 0.298],
    x: [1, 0, 0], y: [0, 1, 0], color: C.nose,
    thickness: 0.018, bevel: 0.004, detail: 0.4, bone: head
  });
  sphere("nose_glint", [-0.006, 0.899, 0.309],
    [0.006, 0.0023, 0.0018], "#778581", head, 8);
  b.rod([0, 0.877, 0.297], [0, 0.857, 0.295], 0.0028, {
    name: "muzzle_center_line", color: C.mouth, bone: head, sides: 5
  });
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      sphere(`whisker_dot_${sign}_${i}`,
        [sign * (0.060 + (i % 2) * 0.009), 0.866 - i * 0.008, 0.288],
        [0.0021, 0.0021, 0.0015], C.eyeRim, head, 6);
      b.sweep(catmull([
        [sign * 0.073, 0.864 - i * 0.009, 0.285],
        [sign * 0.113, 0.870 - i * 0.015, 0.304],
        [sign * (0.151 + i * 0.006), 0.878 - i * 0.023, 0.301]
      ]), [0.0012, 0.0005], {
        name: `white_whisker_${sign}_${i}`, color: C.creamShade,
        bone: head, sides: 4, smooth: false, caps: "flat"
      });
    }
  }

  // The bamboo belongs to the holding wrist, not the scenery.
  const holdingWrist = arms.find(a => a.side === "L")!.chain.tip!;
  const bambooA = new THREE.Vector3(0.411, 0.643, 0.161);
  const bambooB = new THREE.Vector3(0.468, 1.057, 0.160);
  const bambooDir = bambooB.clone().sub(bambooA).normalize();
  const shootPoint = (t: number) => bambooA.clone().lerp(bambooB, t);
  for (let i = 0; i < 4; i++) {
    b.rod(shootPoint(i / 4), shootPoint((i + 1) / 4), [0.0124 - i * 0.001, 0.0114 - i * 0.001], {
      name: `bamboo_internode_${i}`, color: i % 2 ? C.bamboo : C.bambooLight,
      bone: holdingWrist, sides: 7, smooth: false
    });
  }
  for (let i = 0; i <= 4; i++) {
    const p = shootPoint(i / 4);
    b.rod(p.clone().addScaledVector(bambooDir, -0.004),
      p.clone().addScaledVector(bambooDir, 0.005),
      0.014 - i * 0.001, {
        name: `bamboo_node_${i}`, color: C.bambooDark, bone: holdingWrist,
        sides: 7, smooth: false
      });
    b.rod(p.clone().addScaledVector(bambooDir, 0.006),
      p.clone().addScaledVector(bambooDir, 0.009),
      0.0137 - i * 0.001, {
        color: C.bambooLight, bone: holdingWrist, sides: 7, smooth: false
      });
  }
  b.spike(bambooB, bambooDir, 0.025, 0.008, {
    name: "bamboo_fresh_tip", color: C.bambooLight, bone: holdingWrist, sides: 6
  });

  function leaf(a: THREE.Vector3, tip: THREE.Vector3, width: number, color: string, bone: JointRef, name: string) {
    const d = tip.clone().sub(a);
    const side = d.clone().cross(new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(width);
    b.slab([
      a,
      a.clone().lerp(tip, 0.31).add(side),
      a.clone().lerp(tip, 0.66).addScaledVector(side, 0.73),
      tip,
      a.clone().lerp(tip, 0.66).addScaledVector(side, -0.62),
      a.clone().lerp(tip, 0.31).addScaledVector(side, -0.72)
    ], { name, color, thickness: 0.0024, bone });
    b.rod(a, tip, 0.0012, {
      name: `${name}_midrib`, color: C.bambooDark, bone, sides: 4, caps: "flat"
    });
  }
  const sprig1 = shootPoint(0.62);
  const sprigTip1 = new THREE.Vector3(0.548, 0.973, 0.170);
  b.rod(sprig1, sprigTip1, [0.0035, 0.0018], {
    color: C.bambooDark, bone: holdingWrist, sides: 5
  });
  leaf(sprig1.clone().lerp(sprigTip1, 0.35), new THREE.Vector3(0.625, 0.947, 0.181),
    0.016, C.leaf, holdingWrist, "bamboo_leaf_outward");
  leaf(sprig1.clone().lerp(sprigTip1, 0.66), new THREE.Vector3(0.617, 1.023, 0.154),
    0.013, C.leafLight, holdingWrist, "bamboo_leaf_upper_right");
  leaf(sprig1.clone().lerp(sprigTip1, 0.18), new THREE.Vector3(0.509, 0.850, 0.196),
    0.016, C.leaf, holdingWrist, "bamboo_leaf_drooping");
  const sprig2 = shootPoint(0.87);
  const sprigTip2 = new THREE.Vector3(0.413, 1.086, 0.163);
  b.rod(sprig2, sprigTip2, 0.0025, { color: C.bambooDark, bone: holdingWrist, sides: 5 });
  leaf(sprig2.clone().lerp(sprigTip2, 0.35), new THREE.Vector3(0.354, 1.067, 0.168),
    0.014, C.leaf, holdingWrist, "bamboo_leaf_toward_panda");
  leaf(sprig2.clone().lerp(sprigTip2, 0.62), new THREE.Vector3(0.419, 1.151, 0.170),
    0.012, C.leafLight, holdingWrist, "bamboo_leaf_tip");

  // Quiet woodland accents: tiny ochre mushrooms and two fern sprays.
  for (const [i, x, z, size] of [
    [0, 0.565, 0.025, 1.0], [1, 0.625, -0.007, 0.73], [2, -0.510, 0.043, 0.64]
  ]) {
    const hit = branchSurface.ray([x, 1, z], [0, -1, 0]);
    if (!hit) continue;
    const base = hit.at;
    const top = base.clone().add(new THREE.Vector3(0.003, 0.047 * size, 0));
    b.rod(base, top, [0.006 * size, 0.0045 * size], {
      name: `mushroom_stem_${i}`, color: C.creamShade, bone: root, sides: 6
    });
    b.lathe([
      [0, 0], [0.027 * size, 0], [0.032 * size, 0.008 * size],
      [0.022 * size, 0.024 * size], [0, 0.028 * size]
    ], {
      name: `ochre_mushroom_cap_${i}`, at: top, color: "#b68b4c",
      segments: 8, bone: root
    });
    sphere(`mushroom_cap_spot_${i}`, top.clone().add(new THREE.Vector3(0.009 * size, 0.023 * size, 0.004)),
      [0.004 * size, 0.0018 * size, 0.004 * size], C.cream, root, 6);
  }

  function fern(x: number, z: number, sign: number, index: number) {
    const hit = branchSurface.ray([x, 1, z], [0, -1, 0]);
    if (!hit) return;
    const base = hit.at;
    const tip = base.clone().add(new THREE.Vector3(sign * 0.080, 0.146, -0.021));
    const path = catmull([base, base.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, 0.02, 0)), tip]);
    b.sweep(path, [0.0025, 0.001], {
      name: `fern_rachis_${index}`, color: C.fern, bone: root, sides: 5
    });
    for (let k = 1; k < 7; k++) {
      const t = k / 8;
      const p = path.at(t);
      const length = 0.040 * (1 - t * 0.66);
      for (const side of [-1, 1]) {
        const q = p.clone().add(new THREE.Vector3(side * length, 0.016, 0.012 * side));
        leaf(p, q, 0.007 * (1 - t * 0.4), (k + side) % 2 ? C.fern : C.fernLight,
          root, `fern_${index}_${k}_${side}`);
      }
    }
  }
  fern(0.718, -0.027, 1, 0);
  fern(-0.708, -0.046, -1, 1);

  b.material(C.eye).roughness = 0.22;
  b.material(C.nose).roughness = 0.34;
  b.material(C.black).roughness = 0.90;
  b.material(C.moss).roughness = 0.96;
  b.material(C.mossDark).roughness = 0.96;
  return b.root;
}
