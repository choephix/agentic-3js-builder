```ts
import * as THREE from "three";
import {
  createBuilder, catmull, frame, rng, paint, grain, svg, interpolate,
  type PointInput, type JointRef, type Fill
} from "agentic-3js-builder";

export const meta = {
  name: "Bamboo Balancing Act",
  description: "A delighted red panda, with a great striped brush of a tail, balancing on an old moss-covered branch and holding fresh bamboo."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo Balancing Act", detail: 0.8, paintSize: 1024 });
  const random = rng(1847);

  const C = {
    rust: "#b94e29",
    orange: "#ce6533",
    lightRust: "#db7943",
    darkRust: "#943d23",
    cream: "#f3e9d0",
    creamShade: "#dfcfad",
    tailCream: "#f0ca86",
    tailGinger: "#bd592c",
    black: "#282321",
    paw: "#342b27",
    furLight: "#44362c",
    eye: "#171514",
    nose: "#211b1a",
    mouth: "#382020",
    tongue: "#d9897c",
    claw: "#bca98c",
    bark: "#56402e",
    barkDark: "#34291f",
    barkLight: "#795238",
    wood: "#c29860",
    moss: "#577436",
    mossDark: "#394f2b",
    mossLight: "#83994b",
    mossGold: "#a8af58",
    bamboo: "#719444",
    bambooDark: "#3d6335",
    bambooLight: "#b3bf68",
    leaf: "#527f3b",
    leafLight: "#81a64d"
  };

  // The complete skeleton is established before any of the animal's geometry.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { at: [0, 0.393, -0.014], parent: root, role: "spine" });
  const spine = b.chain("spine", [
    [0, 0.393, -0.014], [0, 0.479, -0.004], [0, 0.568, 0.01]
  ], { parent: hips, names: ["spine1", "chest", "withers"], role: "spine", up: [0, 0, 1] });
  const neck = b.chain("neck", [
    [0, 0.564, 0.01], [0, 0.617, 0.024], [0, 0.668, 0.04]
  ], { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck", up: [0, 0, 1] });
  const head = b.joint("head", {
    at: [0, 0.672, 0.04], parent: neck.joints[1], dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    at: [0, 0.684, 0.11], parent: head, dir: [0, 0, 1], role: "jaw"
  });

  const ears = [1, -1].map(s => b.joint(s > 0 ? "earL" : "earR", {
    at: [s * 0.112, 0.833, 0.006], parent: head, dir: [0, 1, 0], role: "hinge"
  }));

  const legs = [1, -1].map(s => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(`leg${side}`, [
      [s * 0.079, 0.405, -0.008],
      [s * 0.119, 0.322, 0.027],
      [s * 0.118, 0.252, 0.018],
      [s * 0.12, 0.237, 0.047]
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg", contact: [s * 0.12, 0.219, 0.018], up: [0, 0, 1]
    });
    const toes = [-1, 0, 1].map((k, i) => {
      const x = s * 0.12 + k * 0.026;
      return b.chain(`toe${side}${i + 1}`, [
        [x, 0.237, 0.087],
        [x + k * 0.007, 0.23, 0.127]
      ], {
        parent: chain.tip!, names: [`toe${side}${i + 1}`, `toe${side}${i + 1}Tip`],
        role: "digit"
      });
    });
    return { s, side, chain, toes };
  });

  const arms = [1, -1].map(s => {
    const side = s > 0 ? "L" : "R";
    const wrist = s > 0 ? [0.289, 0.59, 0.135] : [-0.283, 0.579, 0.11];
    const chain = b.chain(`arm${side}`, [
      [s * 0.123, 0.567, 0.018],
      [s * 0.221, 0.548, 0.062],
      wrist
    ], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm", up: [0, 0, 1]
    });
    const fingerPaths: number[][][] = s > 0 ? [
      [[0.285, 0.611, 0.155], [0.319, 0.612, 0.17], [0.334, 0.606, 0.148]],
      [[0.29, 0.591, 0.158], [0.325, 0.593, 0.174], [0.338, 0.587, 0.15]],
      [[0.287, 0.571, 0.155], [0.319, 0.571, 0.17], [0.333, 0.569, 0.146]],
      [[0.269, 0.565, 0.139], [0.295, 0.549, 0.163], [0.315, 0.56, 0.168]]
    ] : [
      [[-0.299, 0.599, 0.119], [-0.326, 0.61, 0.132], [-0.347, 0.615, 0.14]],
      [[-0.307, 0.58, 0.12], [-0.335, 0.581, 0.138], [-0.354, 0.577, 0.145]],
      [[-0.298, 0.56, 0.12], [-0.325, 0.546, 0.135], [-0.343, 0.536, 0.14]],
      [[-0.267, 0.557, 0.126], [-0.273, 0.536, 0.147], [-0.288, 0.522, 0.152]]
    ];
    const fingers = fingerPaths.map((p, i) => b.chain(`finger${side}${i + 1}`, p, {
      parent: chain.tip!,
      names: [`finger${side}${i + 1}`, `finger${side}${i + 1}Middle`, `finger${side}${i + 1}Tip`],
      role: "digit"
    }));
    return { s, side, chain, wrist, fingers };
  });

  const tail = b.chain("tail", catmull([
    [0, 0.397, -0.096], [0.013, 0.367, -0.245],
    [0.132, 0.34, -0.425], [0.321, 0.337, -0.557],
    [0.498, 0.351, -0.627], [0.602, 0.376, -0.639]
  ]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail", up: [0, 1, 0]
  });

  function ellipsoid(
    at: PointInput, scale: readonly number[], color: Fill, bone: JointRef,
    name?: string, segments = 12
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, scale, bone, name, flat: true
    });
  }

  // A little folded wedge: a low-poly tuft, rather than a smooth fur simulation.
  function tuftGeometry(w: number, h: number, l: number) {
    const p = [
      -w / 2, 0, -l / 2, w / 2, 0, -l / 2,
      w * 0.42, 0, l * 0.22, 0, 0, l * 0.66,
      -w * 0.42, 0, l * 0.22, 0, h, -l * 0.04
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setIndex([0, 1, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 0, 5, 0, 4, 3, 0, 3, 2, 0, 2, 1]);
    g.computeVertexNormals();
    return g;
  }

  // A substantial, grounded old branch; the left bark edge just enters the floor.
  const barkPaint = grain(C.bark, C.barkLight, { size: 0.025, axis: "x", seed: 13 });
  const branchPath = catmull([
    [-0.642, 0.072, -0.026], [-0.36, 0.13, -0.006],
    [0, 0.145, 0], [0.324, 0.122, -0.017], [0.622, 0.09, -0.051]
  ]);
  const branch = b.sweep(branchPath, [0.079, 0.073, 0.076, 0.064, 0.047], {
    bone: root, color: barkPaint, sides: 9, smooth: false, caps: "flat", name: "oldBranch"
  });
  const fork = b.sweep(catmull([
    [0.326, 0.117, -0.003], [0.465, 0.094, 0.111], [0.635, 0.027, 0.214]
  ]), [0.049, 0.038, 0.027], {
    bone: root, color: barkPaint, sides: 8, smooth: false, caps: "round", name: "groundedFork"
  });
  const rearTwig = b.sweep(catmull([
    [-0.39, 0.122, -0.013], [-0.472, 0.182, -0.116], [-0.555, 0.215, -0.185]
  ]), [0.039, 0.024, 0.013], {
    bone: root, color: barkPaint, sides: 7, smooth: false, caps: "flat", name: "brokenTwig"
  });

  const cutTexture = svg(`<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="127" fill="#bc935e"/>
    <path d="M27 135 C17 63 73 19 134 24 C212 18 239 81 228 145 C228 212 158 242 93 224 C44 215 24 182 27 135Z
    M47 139 C35 79 81 43 133 46 C196 40 219 91 207 146 C203 197 155 218 101 205 C60 195 47 175 47 139Z
    M69 137 C59 96 91 64 137 68 C183 68 195 104 185 143 C180 178 151 194 112 184 C79 176 70 160 69 137Z
    M91 136 C84 111 107 91 137 95 C163 98 175 118 163 144 C153 166 126 168 107 154Z"
    fill="none" stroke="#84613c" stroke-width="4"/>
    <path d="M4 154 L51 145 L81 153 M192 22 L179 65 L162 82 M225 201 L196 182" fill="none" stroke="#6c4c32" stroke-width="5"/>
    <ellipse cx="131" cy="130" rx="13" ry="11" fill="#997142"/>
  </svg>`, { size: 256 });

  function endGrain(at: THREE.Vector3, dir: THREE.Vector3, r: number, name: string) {
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 16), C.wood, {
      at, dir, bone: root, name: `${name}Wood`
    });
    b.part(new THREE.CircleGeometry(r * 0.98, 24), "#ffffff", {
      at: at.clone().addScaledVector(dir, 0.0022), dir, axis: "z",
      texture: cutTexture, bone: root, name
    });
  }
  endGrain(branchPath.at(0), branchPath.tangentAt(0).negate(), 0.07, "largeCutEnd");
  endGrain(branchPath.at(1), branchPath.tangentAt(1), 0.039, "smallCutEnd");

  [48, 100, 145, 215, 277].forEach((angle, i) => {
    b.sweep(branch.line(angle, 0.001).slice(0.025 + i * 0.016, 0.97 - i * 0.018), 0.0022, {
      color: C.barkDark, bone: root, sides: 5, caps: "flat", name: `barkFissure${i}`
    });
  });
  const barkSurface = b.surface(branch);
  for (const x of [-0.365, 0.415]) {
    const hit = barkSurface.ray([x, 0.12, 0.5], [0, 0, -1]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.023, 0.031, 0.012, 9), C.barkLight, hit, {
      embed: 0.45, name: "branchKnot"
    });
    b.stick(new THREE.TorusGeometry(0.017, 0.004, 4, 10).rotateX(Math.PI / 2), C.barkDark,
      hit.moved([0, 0.009, 0]), { embed: 0.15, name: "knotRing" });
    b.stick(new THREE.CylinderGeometry(0.01, 0.012, 0.009, 8), C.barkDark,
      hit.moved([0, 0.009, 0]), { embed: 0.1, name: "knotHeart" });
  }

  const mossSurface = b.surface([branch, fork, rearTwig]);
  const mossHits = mossSurface.scatter(83, {
    rng: random, minDist: 0.026,
    filter: h => h.n.y > 0.38,
    keepOut: p => Math.abs(Math.abs(p.x) - 0.12) < 0.057 && p.z > -0.045 && p.z < 0.076
  });
  mossHits.forEach((hit, i) => {
    const r = 0.018 + random() * 0.015;
    b.stick(new THREE.IcosahedronGeometry(1, 0), [C.moss, C.mossLight, C.mossDark][i % 3], hit, {
      scale: [r * 1.25, r * 0.51, r], embed: 0.33,
      spin: random() * 360, flat: true, name: "mossCushion"
    });
    if (i % 4 === 0) {
      b.stick(tuftGeometry(0.017, 0.016, 0.024), C.mossGold, hit, {
        embed: 0.04, spin: random() * 360, flat: true, name: "mossTips"
      });
    }
  });

  // A few miniature fern fronds grow directly out of the moss.
  const fernBase = mossSurface.ray([-0.44, 0.6, -0.045], [0, -1, 0])!;
  for (let f = 0; f < 3; f++) {
    const a = fernBase.at;
    const tip = a.clone().add(new THREE.Vector3(-0.055 + f * 0.051, 0.09 + f * 0.007, -0.033));
    const stem = b.rod(a, tip, 0.0015, { color: C.mossLight, bone: root, sides: 5 });
    b.along(stem.curve(), 5, p => {
      for (const side of [-1, 1]) {
        const q = p.at;
        const length = 0.018 * (1.1 - p.t * 0.55);
        b.slab([
          q, q.clone().add(new THREE.Vector3(side * length * 0.6, 0.013, 0.003)),
          q.clone().add(new THREE.Vector3(side * length, 0.016, 0)),
          q.clone().add(new THREE.Vector3(side * length * 0.45, 0.002, -0.004))
        ], { thickness: 0.0012, color: side > 0 ? C.mossLight : C.moss, bone: root });
      }
    });
  }

  // Big, uncomplicated body shapes, with an uninterrupted black bib and belly.
  const bodyPaint = paint(p => p.z > 0.027 + (p.y - 0.45) * 0.055 ? C.black : C.rust);
  const body = b.loft([
    { at: [0, 0.36, -0.018], w: 0.165, h: 0.14 },
    { at: [0, 0.411, -0.008], w: 0.269, h: 0.224 },
    { at: [0, 0.486, -0.002], w: 0.281, h: 0.228 },
    { at: [0, 0.559, 0.013], w: 0.24, h: 0.189 },
    { at: [0, 0.606, 0.022], w: 0.136, h: 0.125 }
  ], {
    color: bodyPaint, bone: [hips, spine], up: [0, 0, 1],
    sides: 10, smooth: false, caps: "round", name: "redCoatBlackBelly"
  });
  b.sweep(neck, [0.069, 0.062], {
    color: C.rust, sectors: [[-80, 80, C.black]],
    sides: 8, smooth: false, name: "neckFur"
  });

  legs.forEach(({ s, chain, toes, side }) => {
    b.sweep(chain, [0.063, 0.052, 0.035, 0.032], {
      color: C.black, sides: 8, smooth: false, name: `legFur${side}`
    });
    ellipsoid([s * 0.12, 0.238, 0.043], [0.055, 0.026, 0.068], C.paw, chain.tip!, `hindPaw${side}`);
    toes.forEach((toe, i) => {
      b.sweep(toe, [0.014, 0.010], { color: C.paw, sides: 7, smooth: false });
      const tip = toe.at(1).at;
      b.spike(tip, tip.clone().add(new THREE.Vector3(0, -0.003, 0.014)), null, 0.0048, {
        color: C.claw, bone: toe.tip!, sides: 5, name: `toeClaw${side}${i}`
      });
    });
  });

  arms.forEach(({ chain, wrist, fingers, side }) => {
    b.sweep(chain, [0.057, 0.045, 0.03], {
      bands: [[0.25, C.rust], [0.34, C.darkRust], [1, C.black]],
      sides: 8, smooth: false, name: `armFur${side}`
    });
    ellipsoid(wrist, [0.037, 0.038, 0.03], C.paw, chain.tip!, `palm${side}`);
    fingers.forEach((finger, i) => {
      b.sweep(finger, [0.0115, 0.0105, 0.007], {
        color: C.paw, sides: 6, smooth: false, caps: "round", name: `fingerFur${side}${i}`
      });
      const tip = finger.at(1).at;
      const dir = finger.path.tangentAt(1);
      b.spike(tip, tip.clone().addScaledVector(dir, 0.01), null, 0.0038, {
        color: C.claw, bone: finger.tip!, sides: 5, name: `fingerClaw${side}${i}`
      });
    });
  });

  // Sparse carved-looking tufts keep the silhouette fluffy without obscuring the base forms.
  const bodySurface = b.surface(body);
  bodySurface.scatter(22, {
    rng: random, minDist: 0.04,
    filter: h => h.n.z < -0.25 && h.at.y > 0.39
  }).forEach((hit, i) => {
    b.stick(tuftGeometry(0.047, 0.012, 0.06), i % 4 === 0 ? C.orange : C.rust, hit, {
      flow: [0, -1, -0.15], embed: 0.24, flat: true, name: "backFurTuft"
    });
  });
  for (const s of [-1, 1]) {
    const hit = bodySurface.nearest([s * 0.16, 0.545, -0.016]);
    b.stick(tuftGeometry(0.047, 0.027, 0.07), C.orange, hit, {
      flow: [s * 0.4, -1, -0.1], embed: 0.18, flat: true, name: "shoulderRuff"
    });
  }

  // The tail is one articulated brush, with clean, broad alternating rings.
  const tailColors = Array.from({ length: 11 }, (_, i) => i % 2 === 0 ? C.tailGinger : C.tailCream);
  tailColors[10] = C.tailCream;
  const tailSweep = b.sweep(tail, t => {
    return interpolate([0, 0.2, 0.45, 0.7, 0.9, 1], [0.056, 0.082, 0.087, 0.078, 0.057, 0.025], t);
  }, {
    bands: tailColors.map((c, i) => [(i + 1) / 11, c] as const),
    sides: 10, smooth: false, caps: "round", name: "ringedFluffyTail"
  });
  for (let i = 1; i < 10; i++) {
    const t = (i + 0.5) / 11;
    for (const angle of [-72, 0, 72]) {
      const spot = tailSweep.at(t, angle);
      b.stick(tuftGeometry(0.036, 0.011, 0.048), tailColors[i], spot, {
        flow: spot.tangent, embed: 0.22, flat: true, name: "tailFluff"
      });
    }
  }

  // White-rimmed triangular ears, dark inset velvet, and little cream ear tufts.
  ears.forEach((ear, i) => {
    const s = i === 0 ? 1 : -1;
    const outer = [
      [-0.046, -0.033], [-0.023, 0.051], [0.032, 0.106],
      [0.06, 0.038], [0.044, -0.039]
    ].map(([x, y]) => [s * x, y]);
    b.extrude(outer, {
      at: [s * 0.102, 0.829, 0.011], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.055, bevel: 0.007, color: C.cream, bone: ear, name: `whiteRimEar${i}`
    });
    const inner = [
      [-0.023, -0.022], [-0.005, 0.041], [0.03, 0.078],
      [0.039, 0.025], [0.026, -0.022]
    ].map(([x, y]) => [s * x, y]);
    b.extrude(inner, {
      at: [s * 0.102, 0.829, 0.042], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.007, bevel: 0.002, color: C.darkRust, bone: ear, name: "earVelvet"
    });
    b.extrude([
      [s * -0.019, -0.017], [s * 0.028, -0.018], [s * 0.022, 0.026],
      [s * 0.011, 0.009], [s * 0.002, 0.021]
    ], {
      at: [s * 0.102, 0.829, 0.049], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.006, color: C.creamShade, bone: ear, name: "earFluff"
    });
  });

  const facePaint = paint(p => {
    if (p.z < 0.047) return C.rust;
    if (p.y > 0.814 && (Math.abs(p.x) < 0.068 || p.z < 0.111)) return C.orange;
    return C.cream;
  });
  const skull = ellipsoid([0, 0.747, 0.055], [0.171, 0.137, 0.132], facePaint, head, "roundWhiteFace", 16);
  const faceSurface = b.surface(skull);

  for (const s of [-1, 1]) {
    const cheekOutline = [
      [0.112, 0.737], [0.159, 0.757], [0.187, 0.725],
      [0.167, 0.724], [0.185, 0.702], [0.154, 0.708],
      [0.162, 0.684], [0.107, 0.704]
    ].map(([x, y]) => [s * x, y]);
    b.extrude(cheekOutline, {
      at: [0, 0, 0.092], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.061, bevel: 0.006, color: C.cream, bone: head, name: "pointedCheekRuff"
    });
  }

  const tearMarks = svg(`<svg viewBox="0 0 400 300">
    <defs>
      <g id="mark">
        <path d="M66 103 C75 83 103 80 125 99 L116 132
          C109 163 95 189 71 214 L78 178 L70 149Z" fill="#b94e29"/>
        <path d="M79 142 C88 150 98 144 108 133 C105 160 92 178 80 190Z" fill="#cd6536"/>
        <path d="M69 89 Q94 65 120 83 Q96 76 77 99Z" fill="#f3e9d0"/>
      </g>
    </defs>
    <use href="#mark"/>
    <use href="#mark" transform="translate(400 0) scale(-1 1)"/>
    <path d="M170 14 L200 0 L230 14 L216 60 L200 77 L184 60Z" fill="#ce6533"/>
  </svg>`, { size: 512 });
  b.decal(skull, tearMarks, {
    at: [0, 0.742, 0.191], dir: [0, 0, 1], size: [0.28, 0.21],
    segments: [18, 16], lift: 0.0011, bone: head, name: "rustyTearMarkings"
  });

  // Bright, attentive eyes with tiny double catchlights.
  for (const s of [-1, 1]) {
    const hit = faceSurface.ray([s * 0.072, 0.765, 0.5], [0, 0, -1])!;
    const eye = b.stick(new THREE.SphereGeometry(1, 14, 10).scale(0.026, 0.014, 0.023), C.eye, hit, {
      flow: [0, 1, 0], embed: 0.27, bone: head, name: s > 0 ? "eyeL" : "eyeR"
    });
    const eyeSurface = b.surface(eye);
    const gleam = eyeSurface.ray([s * 0.072 - 0.007, 0.773, 0.6], [0, 0, -1])!;
    b.stick(new THREE.SphereGeometry(0.0058, 8, 6), "#fff7e5", gleam, {
      embed: 0.48, bone: head, name: "eyeCatchlight"
    });
    const little = eyeSurface.ray([s * 0.072 + 0.006, 0.759, 0.6], [0, 0, -1]);
    if (little) b.stick(new THREE.SphereGeometry(0.0024, 6, 4), C.cream, little, {
      embed: 0.5, bone: head, name: "smallEyeCatchlight"
    });
  }

  // Separate upper muzzle and lower jaw. The little open grin is not painted shut.
  ellipsoid([0, 0.653, 0.164], [0.059, 0.03, 0.047], C.cream, jaw, "lowerJaw");
  b.extrude([
    [-0.046, 0.014], [-0.026, 0.006], [0, 0.002], [0.026, 0.006],
    [0.046, 0.014], [0.033, -0.014], [0, -0.025], [-0.033, -0.014]
  ], {
    at: [0, 0.684, 0.207], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.012, bevel: 0.002, bone: jaw, color: C.mouth, name: "delightedOpenSmile"
  });
  ellipsoid([0, 0.669, 0.216], [0.019, 0.0075, 0.006], C.tongue, jaw, "littleTongue");
  for (const s of [-1, 1]) {
    ellipsoid([s * 0.033, 0.706, 0.173], [0.047, 0.033, 0.043], C.cream, head, "upperJawMuzzle");
    for (let i = 0; i < 3; i++) {
      ellipsoid([s * (0.038 + (i % 2) * 0.013), 0.711 - i * 0.009, 0.214 - (i % 2) * 0.003],
        [0.002, 0.002, 0.0016], C.furLight, head, "whiskerFreckle", 6);
    }
  }
  b.extrude([
    [-0.017, 0.005], [-0.011, 0.01], [0.012, 0.01],
    [0.018, 0.004], [0.011, -0.006], [0, -0.013], [-0.012, -0.006]
  ], {
    at: [0, 0.724, 0.214], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.019, bevel: 0.003, color: C.nose, bone: head, name: "littleBlackNose"
  });
  ellipsoid([-0.004, 0.729, 0.225], [0.0065, 0.0023, 0.0018], "#73645a", head, "noseGlint", 8);
  b.rod([0, 0.712, 0.22], [0, 0.697, 0.219], 0.0023, {
    color: C.nose, bone: head, sides: 6, name: "muzzleCenterLine"
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      b.sweep(catmull([
        [s * 0.056, 0.699 - i * 0.012, 0.207],
        [s * 0.099, 0.701 - i * 0.016, 0.225],
        [s * 0.14, 0.709 - i * 0.025, 0.216]
      ]), [0.0015, 0.00045], {
        color: C.creamShade, bone: head, sides: 4, caps: "flat", name: "fineWhisker"
      });
    }
  }

  // The bamboo is owned by the gripping wrist, including its node collars and leaves.
  const bambooBone = arms[0].chain.tip!;
  const shootBottom = new THREE.Vector3(0.316, 0.444, 0.146);
  const shootTop = new THREE.Vector3(0.32, 0.848, 0.146);
  for (let i = 0; i < 5; i++) {
    const a = shootBottom.clone().lerp(shootTop, i / 5);
    const z = shootBottom.clone().lerp(shootTop, (i + 1) / 5);
    const r = 0.0125 - i * 0.0008;
    b.rod(a, z, [r, r - 0.0006], {
      color: i % 2 === 0 ? C.bamboo : C.leafLight,
      bone: bambooBone, sides: 7, smooth: false, name: "bambooInternode"
    });
    b.rod(a.clone().add(new THREE.Vector3(0, -0.003, 0)), a.clone().add(new THREE.Vector3(0, 0.004, 0)),
      r + 0.002, { color: C.bambooDark, bone: bambooBone, sides: 8, name: "bambooNode" });
    b.rod(a.clone().add(new THREE.Vector3(0, 0.004, 0)), a.clone().add(new THREE.Vector3(0, 0.006, 0)),
      r + 0.0017, { color: C.bambooLight, bone: bambooBone, sides: 8, name: "nodeHighlight" });
    b.rod(
      a.clone().add(new THREE.Vector3(-0.004, 0.01, 0.011)),
      z.clone().add(new THREE.Vector3(-0.004, -0.008, 0.01)),
      0.0012, { color: C.bambooLight, bone: bambooBone, sides: 4, name: "bambooGlint" }
    );
  }
  b.spike(shootTop, [0.323, 0.89, 0.146], null, 0.009, {
    color: C.bambooLight, bone: bambooBone, sides: 6, name: "tenderBambooTip"
  });

  function leaf(start: number[], tip: number[], width: number, flip = false) {
    const a = new THREE.Vector3(...start);
    const t = new THREE.Vector3(...tip);
    const d = t.clone().sub(a);
    const cross = new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(width);
    const middle = a.clone().lerp(t, 0.48).add(new THREE.Vector3(0, 0, 0.009));
    const left = middle.clone().add(cross);
    const right = middle.clone().sub(cross);
    b.slab([a, left, t, middle], {
      color: flip ? C.leaf : C.leafLight, thickness: 0.0015, bone: bambooBone, name: "bambooLeafLight"
    });
    b.slab([a, middle, t, right], {
      color: flip ? C.leafLight : C.leaf, thickness: 0.0015, bone: bambooBone, name: "bambooLeafDark"
    });
    b.sweep(catmull([a, middle, t]), [0.0011, 0.0002], {
      color: C.bambooLight, bone: bambooBone, sides: 4, caps: "flat", name: "leafMidrib"
    });
  }

  b.sweep(catmull([[0.32, 0.768, 0.146], [0.381, 0.791, 0.151], [0.465, 0.809, 0.148]]),
    [0.0032, 0.001], { color: C.bambooDark, bone: bambooBone, sides: 5, name: "leafSprig" });
  b.rod([0.319, 0.686, 0.146], [0.394, 0.723, 0.165], [0.003, 0.0015], {
    color: C.bambooDark, bone: bambooBone, sides: 5
  });
  leaf([0.349, 0.779, 0.15], [0.383, 0.877, 0.155], 0.015);
  leaf([0.391, 0.794, 0.151], [0.465, 0.876, 0.144], 0.018, true);
  leaf([0.418, 0.799, 0.15], [0.546, 0.8, 0.157], 0.017);
  leaf([0.391, 0.794, 0.151], [0.473, 0.735, 0.172], 0.018, true);
  leaf([0.36, 0.708, 0.158], [0.444, 0.746, 0.174], 0.015);
  leaf([0.383, 0.718, 0.164], [0.466, 0.672, 0.179], 0.017, true);
  leaf([0.32, 0.812, 0.146], [0.272, 0.872, 0.126], 0.012);

  // Shared materials retain a warm, carved-puppet finish.
  for (const color of [C.rust, C.orange, C.cream, C.tailCream, C.tailGinger, C.black, C.paw]) {
    b.material(color).roughness = 0.91;
    b.material(color).metalness = 0;
  }
  b.material(C.eye).roughness = 0.2;
  b.material(C.eye).metalness = 0;
  b.material(C.nose).roughness = 0.3;
  b.material(C.nose).metalness = 0;

  return b.root;
}
```