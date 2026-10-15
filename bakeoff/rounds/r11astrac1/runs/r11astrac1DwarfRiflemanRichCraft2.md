```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  grain,
  mix,
  noise,
} from "agentic-3js-builder";
import type { Fill, Joint, PointInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Borin Emberbraid — Mountain Rifleman",
  description:
    "A heroic dwarven rifleman with sculpted copper braids, blue-steel mountain armour, embroidered green wool and a hollow, brass-bound blunderbuss. Built in a separated animation-ready stance on a snowy shale plinth.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Borin Emberbraid", paintSize: 2048 });
  const random = rng(38117);

  // Art-direction revisions:
  // 1. Replace noisy silver, leather and hair with quiet, deliberately shaded materials.
  // 2. Rebuild the beard as substantial interwoven locks, not beads on exposed poles.
  // 3. Separate the brows, soften the cheeks and integrate the hood's crown.
  // 4. Open the gun's bore; use annular fittings instead of solid plugs.
  // 5. Seat the small hardware and bring the nameplate outside the smaller plinth.

  const C = {
    ink: "#20232a",
    deep: "#192d38",
    steel: "#536f82",
    steelLight: "#a0bdc5",
    gold: "#d5a34d",
    goldLight: "#ffe1a1",
    green: "#345841",
    greenLight: "#658064",
    greenDark: "#233c32",
    leather: "#654130",
    darkLeather: "#352a28",
    leatherEdge: "#b4814d",
    copper: "#b9572c",
    orange: "#e28a43",
    hairDark: "#793c28",
    skin: "#e6ae81",
    skinLight: "#f5c797",
    skinShade: "#b8755e",
    pink: "#cc8772",
    ivory: "#f7e7c6",
    snow: "#e4f0ee",
    cyan: "#83e8e6",
  };

  const steel = paint((p, n) => {
    const key = n.x * 0.25 + n.y * 0.75 + n.z * 0.35;
    const base = key > 0.48 ? "#8ba8b5" : key > -0.12 ? "#536e83" : "#304858";
    return mix(base, "#405868", noise(p, 0.15, 3) * 0.08);
  });
  const brass = paint((_p, n) =>
    n.y > 0.4 ? "#efc777" : n.z > 0.35 ? "#cf9c46" : "#aa7834",
  );
  const darkMetal = paint((_p, n) =>
    n.y > 0.4 ? "#4b606d" : n.z > 0.2 ? "#293b47" : "#1c2933",
  );
  const wood = grain("#55372b", "#775034", {
    size: 0.023, axis: "z", seed: 12,
  });
  const leather = paint((p, n) =>
    mix(n.y > 0.4 ? "#7a5338" : "#573c2e", "#49352d", noise(p, 0.09, 13) * 0.12),
  );
  const hair = paint((_p, n) =>
    n.y > 0.42 ? "#e48d45" : n.z > 0.48 ? "#c66932" : "#914326",
  );
  const hairLight = paint((_p, n) =>
    n.y > 0.35 ? "#eea05a" : n.z > 0.35 ? "#d57a3c" : "#a74f2a",
  );
  const wool = paint((p, n) =>
    mix(n.y > 0.25 ? "#587554" : "#34523d", "#2c4436", noise(p, 0.025, 5) * 0.10),
  );
  const skin = paint((p, n) =>
    mix(
      "#cd9070",
      "#f4c795",
      Math.min(1, 0.42 + n.y * 0.28 + n.z * 0.22 + noise(p, 0.12, 2) * 0.06),
    ),
  );
  const stone = paint((_p, n) =>
    n.y > 0.55 ? "#697e89" : n.y > 0 ? "#516675" : "#354855",
  );
  const snowPaint = paint((_p, n) =>
    mix("#b4cdd6", "#f0f5ed", 0.55 + n.y * 0.4),
  );

  const eyeTex = svg(`
    <svg viewBox="0 0 100 64">
      <path d="M5 34 Q22 6 51 15 Q77 15 96 26 L89 47 Q49 61 12 46Z"
        fill="#342529"/>
      <path d="M13 33 Q34 21 52 22 Q75 22 87 29 L82 42 Q48 50 19 40Z"
        fill="#f7ead3"/>
      <ellipse cx="55" cy="34" rx="13" ry="15" fill="#5897a5"/>
      <ellipse cx="55" cy="35" rx="6" ry="12" fill="#182e38"/>
      <circle cx="50" cy="28" r="4" fill="#ffffff"/>
      <path d="M9 28 L48 15 L91 23" stroke="#6c402b" stroke-width="6"
        fill="none" stroke-linejoin="round"/>
      <path d="M18 49 Q51 57 81 47" stroke="#a36b56" stroke-width="3" fill="none"/>
    </svg>`, { size: 256 });

  const clothTex = svg(`
    <svg viewBox="0 0 160 240">
      <rect width="160" height="240" fill="#355540"/>
      <path d="M11 0V240 M149 0V240" stroke="#192f28" stroke-width="13"/>
      <path d="M17 0V240 M143 0V240" stroke="#ccac62" stroke-width="5"/>
      <path d="M28 0V240 M132 0V240" stroke="#7f956e" stroke-width="3"
        stroke-dasharray="6 6"/>
      <g fill="none" stroke="#9bad7d" stroke-width="4">
        <path d="M80 37L112 68L80 99L48 68Z M80 49L99 68L80 87L61 68Z"/>
        <path d="M80 119L112 150L80 181L48 150Z"/>
        <path d="M45 207L63 225L80 208L97 225L115 207"/>
      </g>
      <path d="M80 47V87 M61 68H99 M80 133V167 M64 150H96"
        stroke="#d9ba70" stroke-width="5"/>
    </svg>`, { size: 384 });

  const crestTex = svg(`
    <svg viewBox="0 0 128 128">
      <path d="M64 6L116 31L106 91L64 121L22 91L12 31Z"
        fill="#253b46" stroke="#e0b35f" stroke-width="7"/>
      <path d="M64 16L105 36L96 85L64 109L32 85L23 36Z"
        fill="none" stroke="#788c8f" stroke-width="3"/>
      <path d="M36 48L64 28L92 48L81 59L72 51V88H56V51L47 59Z"
        fill="#e7be70" stroke="#352d28" stroke-width="4"/>
      <path d="M41 90L52 99 M87 90L76 99" stroke="#e7be70" stroke-width="5"/>
      <path d="M59 39H68" stroke="#fff0bb" stroke-width="4"/>
    </svg>`, { size: 256 });

  const stitchTex = svg(`
    <svg viewBox="0 0 120 160">
      <rect width="120" height="160" rx="10" fill="#624431"/>
      <path d="M9 7H111V153H9Z" stroke="#2c2623" stroke-width="6" fill="none"/>
      <path d="M17 12H103V148H17Z" stroke="#c09560" stroke-width="3"
        stroke-dasharray="7 6" fill="none"/>
      <path d="M34 18L90 142 M23 79L63 128 M62 20L93 71"
        stroke="#79563c" stroke-width="2"/>
      <path d="M36 55L60 32L84 55L60 78Z M60 78V118"
        stroke="#aa8050" stroke-width="5" fill="none"/>
    </svg>`, { size: 256 });

  const runeTex = svg(`
    <svg viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#273e48"/>
      <path d="M5 8H251 M5 56H251" stroke="#d5a756" stroke-width="4"/>
      <g stroke="#90dddb" stroke-width="5" fill="none">
        <path d="M28 45V19L43 30L28 36 M59 19V45L76 34L59 26
          M99 19L86 32L99 45L112 32Z M133 45V19L150 31L133 36
          M169 19V45 M160 26L178 37 M196 45V19L211 32L196 38
          M230 19L218 32L230 45L242 32Z"/>
      </g>
    </svg>`, { size: 512 });

  const plaqueTex = svg(`
    <svg viewBox="0 0 320 112">
      <rect x="3" y="3" width="314" height="106" rx="8" fill="#263944"
        stroke="#cca461" stroke-width="6"/>
      <path d="M18 19H302 M18 93H302" stroke="#71868b" stroke-width="2"/>
      <text x="160" y="48" text-anchor="middle" font-family="serif"
        font-weight="bold" font-size="26" fill="#f0d39a">EMBERBRAID</text>
      <text x="160" y="75" text-anchor="middle" font-family="serif"
        font-weight="bold" letter-spacing="4" font-size="14"
        fill="#a3b9b8">MOUNTAIN GUARD</text>
    </svg>`, { size: 512 });

  const ammoTex = svg(`
    <svg viewBox="0 0 64 96">
      <rect width="64" height="96" fill="#b58c47"/>
      <path d="M6 8H58V88H6Z" fill="none" stroke="#473728" stroke-width="5"/>
      <path d="M20 29L32 17L44 29L32 41Z M32 41V72 M22 60H42"
        stroke="#f4d692" stroke-width="6" fill="none"/>
    </svg>`, { size: 128 });

  // Skeleton, including independent jaw, fingers, and weapon attachment.
  const hips = b.joint("hips", { at: [0, 0.67, 0], role: "spine" });
  const spine = b.chain("spine", [
    [0, 0.67, 0], [0, 0.87, 0], [0, 1.105, 0],
  ], {
    parent: hips,
    names: ["spineLower", "chest", "neckBase"],
    role: "spine",
  });
  const neck = b.joint("neck", {
    parent: spine.tip!, at: [0, 1.15, 0], dir: [0, 1, 0], role: "neck",
  });
  const head = b.joint("head", {
    parent: neck, at: [0, 1.34, 0.035], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.245, 0.10], dir: [0, 0, 1], role: "jaw",
  });
  const sides = [1, -1] as const;
  const legs = sides.map((s) => {
    const side = s > 0 ? "L" : "R";
    return {
      s,
      chain: b.chain(`leg${side}`, [
        [s * 0.205, 0.67, 0],
        [s * 0.24, 0.41, 0.025],
        [s * 0.255, 0.185, 0.035],
      ], {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.255, 0.095, 0.14],
      }),
    };
  });

  const arms = sides.map((s) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(`arm${side}`, [
      [s * 0.325, 1.075, 0],
      [s * 0.61, 1.075, 0],
      [s * 0.845, 1.075, 0.015],
      [s * 0.94, 1.075, 0.025],
    ], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    const hand = chain.tip!;
    const fingers = [0, 1, 2, 3].map((i) => {
      const z = -0.045 + i * 0.045;
      return b.chain(`finger${side}${i + 1}`, s < 0 ? [
        [s * 0.96, 1.07, z],
        [s * 1.035, 1.04, z + 0.015],
        [s * 1.025, 0.995, z + 0.035],
      ] : [
        [s * 0.975, 1.075, z],
        [s * (1.055 + (i === 1 || i === 2 ? 0.016 : 0)), 1.072, z + (i - 1.5) * 0.01],
        [s * (1.11 + (i === 1 || i === 2 ? 0.018 : 0)), 1.065, z + (i - 1.5) * 0.022],
      ], { parent: hand, role: "digit", count: 2 });
    });
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.905, 1.07, 0.085],
      [s * 0.93, 1.035, 0.135],
      [s * 0.98, 1.015, 0.145],
    ], { parent: hand, role: "digit", count: 2 });
    return { s, chain, hand, fingers, thumb };
  });
  const weapon = b.joint("blunderbuss", {
    parent: arms[1].hand,
    at: [-0.99, 1.075, 0.06],
    dir: [0, 0, 1],
    role: "hinge",
  });

  function ellipsoid(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, bone, scale: size, rotation, flat: true, name,
    });
  }

  function box(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function frontArt(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    name: string,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir: [0, 0, 1], axis: "z", name,
    });
  }

  function rivet(at: PointInput, bone: Joint, radius = 0.012, color: Fill = brass) {
    return ellipsoid(at, [radius, radius, radius * 0.6], color, bone, "forgedRivet");
  }

  function rod(
    a: PointInput,
    end: PointInput,
    r: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    return b.rod(a, end, r, { color, bone, sides: 6, name });
  }

  function torus(
    at: PointInput,
    radius: number,
    tube: number,
    color: Fill,
    bone: Joint,
    dir: number[] = [0, 0, 1],
    name = "forgedRing",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, {
      at, bone, dir, axis: "z", name,
    });
  }

  function tuft(
    root: number[],
    end: number[],
    width: number,
    depth: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    return b.sweep([
      root,
      [
        root[0] * 0.55 + end[0] * 0.45,
        root[1] * 0.55 + end[1] * 0.45,
        root[2] * 0.55 + end[2] * 0.45 + depth * 0.12,
      ],
      end,
    ], (t) => [width * (1 - t * 0.88), depth * (1 - t * 0.85)], {
      bone, color, sides: 6, smooth: false,
      caps: { start: "round", end: "point" },
      name,
    });
  }

  // Face. The nose is the centre of the expression; eyebrows remain separate.
  ellipsoid([0, 1.35, -0.055], [0.273, 0.284, 0.226], wool, head, "hoodBack");
  ellipsoid([0, 1.348, 0.06], [0.225, 0.231, 0.19], skin, head, "headBlock");
  ellipsoid([0, 1.215, 0.135], [0.161, 0.095, 0.126], skin, jaw, "lowerJaw");

  for (const s of sides) {
    ellipsoid([s * 0.163, 1.299, 0.167], [0.077, 0.068, 0.060], skin, head, "highCheek");
    ellipsoid([s * 0.173, 1.283, 0.212], [0.032, 0.020, 0.009], C.pink, head, "windBurn");
    ellipsoid([s * 0.24, 1.335, 0.045], [0.058, 0.089, 0.055], skin, head, "ear");
    ellipsoid([s * 0.26, 1.337, 0.081], [0.022, 0.051, 0.014], C.skinShade, head, "earInset");
    const eyePad = ellipsoid(
      [s * 0.092, 1.385, 0.219], [0.077, 0.045, 0.028],
      C.skinShade, head, "eyeSocket",
    );
    b.decal(eyePad, eyeTex, {
      at: [s * 0.092, 1.386, 0.25],
      dir: [0, 0, 1],
      size: [0.141, 0.087],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: "keenBlueEye",
    });
    tuft(
      [s * 0.038, 1.425, 0.242],
      [s * 0.183, 1.453, 0.202],
      0.026, 0.027, hair, head, "heavyAngledBrow",
    );
    b.sweep([
      [s * 0.048, 1.44, 0.26],
      [s * 0.11, 1.453, 0.243],
      [s * 0.17, 1.458, 0.216],
    ], [0.006, 0.003], {
      color: C.orange, bone: head, sides: 5, name: "browCarvedRidge",
    });
    tuft(
      [s * 0.17, 1.413, 0.158],
      [s * 0.226, 1.215, 0.194],
      0.048, 0.045, hair, head, "sideburn",
    );
    tuft(
      [s * 0.188, 1.31, 0.17],
      [s * 0.267, 1.155, 0.201],
      0.045, 0.036, hair, head, "outwardCheekLock",
    );
    b.sweep([
      [s * 0.157, 1.331, 0.223],
      [s * 0.187, 1.324, 0.213],
    ], 0.0035, {
      color: C.skinShade, bone: head, sides: 5, name: "weatheredEyeCrease",
    });
  }

  ellipsoid([0, 1.347, 0.234], [0.048, 0.096, 0.051], skin, head, "noseBridge");
  ellipsoid([0, 1.295, 0.287], [0.077, 0.065, 0.076], skin, head, "broadNose");
  ellipsoid([0, 1.283, 0.339], [0.044, 0.026, 0.013], C.pink, head, "noseTip");
  for (const s of sides) {
    ellipsoid([s * 0.055, 1.275, 0.299], [0.03, 0.026, 0.027], skin, head, "nostrilWing");
    ellipsoid([s * 0.043, 1.264, 0.316], [0.013, 0.009, 0.007], C.hairDark, head, "nostril");
  }
  box([0, 1.223, 0.249], [0.126, 0.022, 0.016], "#502c2b", jaw, "mouthOpening");
  ellipsoid([0, 1.206, 0.246], [0.069, 0.015, 0.021], C.skinShade, jaw, "lowerLip");

  // Continuous hood construction, rather than a separate box-shaped peak.
  b.loft([
    { at: [0, 1.46, -0.075], w: 0.48, h: 0.34 },
    { at: [0, 1.57, -0.087], w: 0.35, h: 0.28 },
    { at: [0.025, 1.653, -0.105], w: 0.10, h: 0.15 },
  ], {
    color: wool, bone: head, sides: 6, smooth: false,
    caps: "flat", name: "integratedHoodCrown",
  });
  b.sweep(catmull([
    [-0.227, 1.19, 0.118],
    [-0.252, 1.375, 0.108],
    [-0.205, 1.515, 0.123],
    [0, 1.59, 0.135],
    [0.205, 1.515, 0.123],
    [0.252, 1.375, 0.108],
    [0.227, 1.19, 0.118],
  ]), 0.029, {
    color: C.greenDark, bone: head, sides: 6, smooth: false, name: "thickHoodOpening",
  });
  b.sweep(catmull([
    [-0.25, 1.29, 0.13],
    [-0.236, 1.49, 0.144],
    [0, 1.606, 0.157],
    [0.236, 1.49, 0.144],
    [0.25, 1.29, 0.13],
  ]), 0.008, {
    color: brass, bone: head, sides: 5, name: "hoodGoldPiping",
  });
  frontArt([0, 1.552, 0.181], 0.085, 0.085, crestTex, head, "hoodBadge");
  for (const s of sides)
    torus([s * 0.255, 1.277, 0.082], 0.025, 0.007, brass, head);

  // Broad beard backing and distinct, carved locks.
  b.loft([
    { at: [0, 1.224, 0.17], w: 0.405, h: 0.195 },
    { at: [0, 1.11, 0.198], w: 0.44, h: 0.205 },
    { at: [0, 0.96, 0.213], w: 0.32, h: 0.16 },
    { at: [0, 0.875, 0.22], w: 0.15, h: 0.085 },
  ], {
    color: hair, bone: jaw, sides: 8, smooth: false, name: "beardSilhouette",
  });

  for (let k = -1; k <= 1; k++) {
    tuft(
      [k * 0.045, 1.172, 0.275],
      [k * 0.028, 0.853 + Math.abs(k) * 0.045, 0.29],
      0.041, 0.029, k === 0 ? hairLight : hair, jaw, "centralBeardBlade",
    );
  }

  for (const s of sides) {
    b.sweep(bezier(
      [s * 0.018, 1.259, 0.291],
      [s * 0.12, 1.266, 0.317],
      [s * 0.203, 1.194, 0.272],
    ), [0.045, 0.033, 0.007], {
      color: hair, bone: head, sides: 6, smooth: false, name: "sweptMoustache",
    });
    b.sweep(bezier(
      [s * 0.033, 1.266, 0.328],
      [s * 0.11, 1.266, 0.341],
      [s * 0.176, 1.212, 0.302],
    ), [0.008, 0.004], {
      color: C.orange, bone: head, sides: 5, name: "moustacheHighlight",
    });
    for (let k = 0; k < 3; k++) {
      tuft(
        [s * (0.11 + k * 0.039), 1.19 - k * 0.008, 0.23 - k * 0.016],
        [s * (0.092 + k * 0.046), 0.95 + k * 0.04, 0.267 - k * 0.013],
        0.039, 0.03, k === 1 ? hairLight : hair, jaw, "outerBeardBlade",
      );
    }

    const x = s * 0.122;
    b.sweep([
      [x, 1.17, 0.28],
      [x * 1.06, 0.98, 0.293],
      [x, 0.79, 0.292],
    ], [0.045, 0.039], {
      color: hair, bone: jaw, sides: 6, name: "buriedBraidCore",
    });

    // Overlapping chevrons create a continuous plait with a clear centre seam.
    for (let i = 0; i < 7; i++) {
      const y = 1.144 - i * 0.049;
      const bx = x + s * Math.sin(i * 0.48) * 0.006;
      const z = 0.314 + Math.sin(i / 6 * Math.PI) * 0.012;
      for (const weave of [-1, 1]) {
        b.sweep(bezier(
          [bx + weave * 0.033, y + 0.025, z - 0.011],
          [bx + weave * 0.026, y + 0.008, z + 0.025],
          [bx - weave * 0.012, y - 0.024, z + 0.016],
        ), [0.029, 0.027, 0.023], {
          color: (i + (weave > 0 ? 1 : 0)) % 2 ? hairLight : hair,
          bone: jaw,
          sides: 6,
          smooth: false,
          name: "interwovenBraidLock",
        });
      }
    }

    b.part(new THREE.CylinderGeometry(0.06, 0.052, 0.078, 8), brass, {
      at: [x, 0.803, 0.296], bone: jaw, name: "octagonalBraidCuff",
    });
    torus([x, 0.835, 0.296], 0.058, 0.007, C.goldLight, jaw, [0, 1, 0], "braidCuffLip");
    torus([x, 0.772, 0.296], 0.051, 0.007, C.goldLight, jaw, [0, 1, 0], "braidCuffLip");
    frontArt([x, 0.804, 0.354], 0.068, 0.065, crestTex, jaw, "braidSeal");
    for (let j = 0; j < 3; j++)
      tuft(
        [x + (j - 1) * 0.021, 0.768, 0.293],
        [x + (j - 1) * 0.03, 0.688 + Math.abs(j - 1) * 0.015, 0.299],
        0.025, 0.023, j === 1 ? hairLight : hair, jaw, "braidTassel",
      );
  }

  // Broad compact torso.
  b.loft([
    { at: [0, 0.62, 0], w: 0.55, h: 0.32 },
    { at: [0, 0.79, 0], w: 0.66, h: 0.42 },
    { at: [0, 1.015, -0.005], w: 0.68, h: 0.41 },
    { at: [0, 1.12, -0.005], w: 0.49, h: 0.32 },
  ], {
    color: wool, bone: spine, sides: 8, smooth: false, name: "barrelChestTunic",
  });
  ellipsoid([0, 0.64, 0], [0.29, 0.16, 0.18], leather, hips, "leatherBreeches");
  ellipsoid([0, 1.145, -0.014], [0.18, 0.087, 0.16], C.greenDark, neck, "standingCollar");

  for (const s of sides) {
    b.extrude([
      [-0.125, 0], [0.125, 0], [0.115, -0.28], [0.025, -0.315], [-0.115, -0.27],
    ], {
      at: [s * 0.141, 0.71, 0.185],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.035,
      color: wool, bone: hips, name: "splitTabard",
    });
    frontArt([s * 0.141, 0.566, 0.205], 0.212, 0.25, clothTex, hips, "embroideredTabard");
    b.sweep([
      [s * 0.265, 0.716, 0.207],
      [s * 0.256, 0.457, 0.207],
      [s * 0.165, 0.411, 0.207],
    ], 0.009, {
      color: C.gold, bone: hips, sides: 5, name: "tabardHem",
    });
  }

  const beltPath = catmull([
    [0, 0.72, 0.218],
    [0.28, 0.72, 0.16],
    [0.337, 0.72, 0],
    [0.27, 0.72, -0.18],
    [0, 0.72, -0.21],
    [-0.27, 0.72, -0.18],
    [-0.337, 0.72, 0],
    [-0.28, 0.72, 0.16],
  ], { closed: true });
  b.sweep(beltPath, () => [0.056, 0.025], {
    color: leather, bone: hips, sides: 4, name: "wideWaistBelt",
  });
  box([0, 0.716, 0.243], [0.183, 0.145, 0.046], darkMetal, hips, "buckleBacking");
  box([0, 0.716, 0.27], [0.16, 0.123, 0.026], brass, hips, "goldBeltBuckle");
  frontArt([0, 0.716, 0.286], 0.117, 0.11, crestTex, hips, "hammerBuckle");
  for (const s of sides)
    for (let i = 0; i < 3; i++)
      box(
        [s * (0.133 + i * 0.061), 0.716, 0.24 - i * 0.022],
        [0.025, 0.112, 0.022], brass, hips, "beltKeeper",
      );

  const baldric = catmull([
    [-0.28, 1.073, 0.16],
    [-0.14, 0.967, 0.221],
    [0.03, 0.856, 0.242],
    [0.23, 0.741, 0.196],
  ]);
  b.sweep(baldric, () => [0.052, 0.018], {
    color: leather, bone: spine.joints[1], sides: 4, name: "ammunitionBaldric",
  });
  for (let i = 0; i < 5; i++) {
    const x = -0.228 + i * 0.094;
    const y = 1.02 - i * 0.062;
    const z = 0.235 + (i < 3 ? i * 0.008 : -0.005);
    b.part(new THREE.CylinderGeometry(0.023, 0.026, 0.106, 8), brass, {
      at: [x, y, z], bone: spine.joints[1], rotation: [0, 0, -32], name: "powderCartridge",
    });
    ellipsoid(
      [x - 0.026, y + 0.043, z], [0.022, 0.022, 0.023],
      darkMetal, spine.joints[1], "cartridgeTip",
    );
    box(
      [x + 0.015, y - 0.018, z + 0.018], [0.047, 0.025, 0.025],
      C.darkLeather, spine.joints[1], "cartridgeLoop", [0, 0, -32],
    );
  }

  // Legs and heavy, square-toed boots.
  for (const { s, chain } of legs) {
    const knee = chain.joints[1];
    const foot = chain.tip!;
    b.sweep(chain, [0.139, 0.12, 0.105], {
      color: leather, sides: 8, smooth: false, name: "stoutTrouserLeg",
    });
    b.part(new THREE.CylinderGeometry(0.145, 0.126, 0.204, 8), C.darkLeather, {
      at: [s * 0.251, 0.273, 0.037], bone: knee, name: "bootShaft",
    });
    box([s * 0.255, 0.161, 0.114], [0.299, 0.143, 0.392], C.darkLeather, foot, "squareBoot");
    box([s * 0.255, 0.108, 0.116], [0.316, 0.045, 0.409], darkMetal, foot, "heavyBootSole");
    box([s * 0.255, 0.184, 0.251], [0.303, 0.127, 0.15], steel, foot, "armouredToeCap");
    box([s * 0.255, 0.129, 0.323], [0.306, 0.025, 0.017], brass, foot, "toeGoldEdge");
    frontArt([s * 0.255, 0.291, 0.17], 0.18, 0.16, stitchTex, knee, "bootStitching");
    for (let j = 0; j < 2; j++) {
      box([s * 0.255, 0.247 + j * 0.079, 0.18], [0.26, 0.035, 0.036], leather, knee, "bootStrap");
      box([s * 0.294, 0.247 + j * 0.079, 0.205], [0.064, 0.048, 0.016], brass, knee, "bootStrapBuckle");
      box([s * 0.294, 0.247 + j * 0.079, 0.215], [0.034, 0.024, 0.009], C.darkLeather, knee, "bootBuckleInset");
    }
    b.extrude([
      [-0.11, 0.08], [0, 0.13], [0.11, 0.08],
      [0.115, -0.06], [0, -0.125], [-0.115, -0.06],
    ], {
      at: [s * 0.24, 0.437, 0.128],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.065, bevel: 0.012,
      color: steel, bone: knee, name: "hexagonalKneePlate",
    });
    frontArt([s * 0.24, 0.442, 0.164], 0.131, 0.146, crestTex, knee, "kneeHeraldry");
    for (const dx of [-0.105, 0.105])
      rivet([s * 0.255 + dx, 0.199, 0.329], foot, 0.014);
    for (let j = 0; j < 4; j++)
      box(
        [s * 0.255 + (j - 1.5) * 0.071, 0.099, 0.284],
        [0.046, 0.026, 0.078], C.ink, foot, "soleLug",
      );

    // Broad, restrained wear marks rather than all-over metal noise.
    for (let j = 0; j < 2; j++)
      rod(
        [s * 0.255 - 0.055 + j * 0.085, 0.23, 0.327],
        [s * 0.255 - 0.031 + j * 0.085, 0.214, 0.327],
        0.0028, C.steelLight, foot, "toeScuff",
      );
  }

  // Shoulder armour and separated gauntlet fingers.
  for (const arm of arms) {
    const { s, chain, hand } = arm;
    const shoulder = chain.joints[0];
    const elbow = chain.joints[1];
    const wrist = chain.joints[2];

    b.sweep(chain, [0.142, 0.124, 0.09, 0.073], {
      color: wool, sides: 8, smooth: false, name: "woolSleeve",
    });
    ellipsoid(
      [s * 0.405, 1.11, -0.005], [0.225, 0.187, 0.245],
      C.deep, shoulder, "pauldronUnderRim",
    );
    const shell = ellipsoid(
      [s * 0.405, 1.143, -0.01], [0.219, 0.166, 0.234],
      steel, shoulder, "massiveShoulderShell",
    );
    b.sweep([
      [s * 0.265, 1.15, 0.19],
      [s * 0.405, 1.232, 0.196],
      [s * 0.575, 1.15, 0.174],
    ], 0.023, {
      color: brass, bone: shoulder, sides: 6, name: "pauldronRaisedTrim",
    });

    const lame = b.extrude([
      [-0.13, 0.065], [0.10, 0.06], [0.15, -0.03],
      [0.09, -0.105], [-0.11, -0.08],
    ], {
      at: [s * 0.463, 1.067, 0.166],
      x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.055,
      color: steel, bone: shoulder, bevel: 0.008,
      name: "overlappingShoulderLame",
    });
    frontArt([s * 0.431, 1.119, 0.239], 0.15, 0.15, crestTex, shoulder, "shoulderClanCrest");

    const shoulderSurface = b.surface([shell, lame]);
    for (let i = 0; i < 4; i++) {
      const hit = shoulderSurface.nearest([
        s * (0.30 + i * 0.076),
        1.08 - Math.abs(i - 1.5) * 0.008,
        0.245,
      ]);
      b.stick(new THREE.SphereGeometry(0.014, 8, 5), brass, hit, {
        embed: 0.35, scale: [1, 0.65, 1], name: "seatedShoulderRivet",
      });
    }

    for (let i = 0; i < 3; i++)
      b.part(new THREE.ConeGeometry(0.037, 0.085, 4), brass, {
        at: [s * (0.32 + i * 0.088), 1.282 - Math.abs(i - 1) * 0.026, -0.019],
        bone: shoulder, rotation: [0, 45, -s * 13], name: "pauldronCrenellation",
      });

    ellipsoid([s * 0.632, 1.075, 0], [0.093, 0.116, 0.129], C.darkLeather, elbow, "elbowJoint");
    b.part(new THREE.CylinderGeometry(0.133, 0.108, 0.193, 8), steel, {
      at: [s * 0.745, 1.075, 0.012],
      bone: elbow, dir: [s, 0, 0], name: "forearmBracer",
    });
    for (const x of [0.669, 0.819]) {
      const r = 0.135 - (x - 0.669) * 0.13;
      b.part(new THREE.CylinderGeometry(r, r, 0.033, 8), brass, {
        at: [s * x, 1.075, 0.012],
        bone: elbow, dir: [s, 0, 0], name: "bracerEndBand",
      });
    }
    frontArt([s * 0.745, 1.079, 0.146], 0.115, 0.115, crestTex, elbow, "bracerSeal");
    for (const dx of [-0.061, 0.061])
      rivet([s * 0.745 + dx, 1.077, 0.147], elbow, 0.01);

    b.part(new THREE.CylinderGeometry(0.097, 0.091, 0.056, 8), C.darkLeather, {
      at: [s * 0.858, 1.075, 0.02],
      bone: wrist, dir: [s, 0, 0], name: "gloveCuff",
    });
    box([s * 0.944, 1.075, 0.025], [0.137, 0.105, 0.185], leather, hand, "broadGlovedPalm");
    box([s * 0.948, 1.131, 0.025], [0.113, 0.025, 0.16], steel, hand, "gauntletBackPlate");
    for (let i = 0; i < 4; i++) {
      b.sweep(arm.fingers[i], [0.023, 0.019], {
        color: leather, sides: 6, smooth: false, name: "separatedGloveFinger",
      });
      ellipsoid(
        [s * 0.99, 1.12, -0.045 + i * 0.045],
        [0.028, 0.019, 0.021], brass, hand, "gauntletKnuckle",
      );
    }
    b.sweep(arm.thumb, [0.029, 0.022], {
      color: leather, sides: 6, smooth: false, name: "opposedGloveThumb",
    });
  }

  // Campaign equipment.
  box([0, 0.914, -0.252], [0.4, 0.36, 0.16], leather, spine.joints[1], "squareCampaignPack");
  box([0, 1.035, -0.347], [0.426, 0.135, 0.045], C.darkLeather, spine.joints[1], "packFlap");
  b.part(new THREE.PlaneGeometry(0.29, 0.26), "#ffffff", {
    at: [0, 0.91, -0.338], bone: spine.joints[1],
    dir: [0, 0, -1], axis: "z", texture: stitchTex, name: "packStitches",
  });
  b.rod([-0.25, 1.142, -0.245], [0.25, 1.142, -0.245], 0.09, {
    color: wool, bone: spine.joints[1], sides: 8, name: "rolledBlanket",
  });
  for (const s of sides) {
    b.part(new THREE.CylinderGeometry(0.094, 0.094, 0.035, 8), C.darkLeather, {
      at: [s * 0.157, 1.142, -0.245],
      bone: spine.joints[1], dir: [1, 0, 0], name: "blanketStrap",
    });
    box(
      [s * 0.157, 1.176, -0.328], [0.044, 0.035, 0.016],
      brass, spine.joints[1], "bedrollBuckle",
    );
  }
  torus([0.37, 0.756, 0.029], 0.041, 0.009, brass, hips);
  b.sweep(catmull([
    [0.383, 0.732, 0.045],
    [0.414, 0.638, 0.041],
    [0.451, 0.557, 0.02],
    [0.496, 0.532, 0],
  ]), [0.054, 0.06, 0.041, 0.006], {
    color: C.ivory, bone: hips, sides: 8, smooth: false, name: "curvedPowderHorn",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.054, 0.035, 8), brass, {
    at: [0.386, 0.723, 0.044], bone: hips, name: "powderHornCap",
  });
  box([-0.32, 0.641, -0.043], [0.17, 0.183, 0.15], leather, hips, "beltPouch");
  frontArt([-0.32, 0.641, 0.035], 0.146, 0.155, stitchTex, hips, "pouchStitching");
  box([-0.32, 0.669, 0.049], [0.049, 0.055, 0.018], brass, hips, "pouchClasp");

  // Blunderbuss: the flare and its brass rings are genuinely hollow.
  const gx = -0.995;
  b.extrude([
    [-0.34, -0.105], [-0.34, 0.105], [-0.25, 0.12],
    [-0.07, 0.06], [0.18, 0.05], [0.22, -0.025],
    [0.07, -0.063], [-0.075, -0.06], [-0.22, -0.14],
  ], {
    at: [gx, 1.161, 0.025],
    x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.113, bevel: 0.012,
    color: wood, bone: weapon, name: "carvedWalnutStock",
  });
  box([gx, 1.135, -0.307], [0.132, 0.225, 0.033], brass, weapon, "stockButtPlate");
  for (const s of sides) {
    box(
      [gx + s * 0.061, 1.163, -0.18], [0.009, 0.091, 0.127],
      C.leatherEdge, weapon, "stockCheekInlay",
    );
    for (let i = 0; i < 3; i++)
      box(
        [gx + s * 0.067, 1.156 + i * 0.022, -0.179],
        [0.005, 0.007, 0.09 - i * 0.017], C.gold, weapon, "stockInlayLine",
      );
  }
  b.frustumBox(
    [gx, 1.159, 0.054], [gx, 1.008, 0.006],
    [0.09, 0.09], [0.082, 0.068],
    { color: wood, bone: weapon, name: "pistolGrip" },
  );
  box([gx, 1.01, 0.005], [0.092, 0.036, 0.09], brass, weapon, "gripHeel");
  b.part(new THREE.CylinderGeometry(0.084, 0.084, 0.35, 8), darkMetal, {
    at: [gx, 1.208, 0.19], bone: weapon, dir: [0, 0, 1], name: "octagonalBreech",
  });

  // The barrel shaft ends behind the flared bore, not across its opening.
  b.part(new THREE.CylinderGeometry(0.080, 0.076, 0.24, 8), steel, {
    at: [gx, 1.208, 0.425], bone: weapon, dir: [0, 0, 1], name: "barrelShaft",
  });
  const boreMetal = paint((_p, n) =>
    n.y > 0.3 ? "#354953" : "#23333d",
  );
  b.lathe([
    [0.078, 0],
    [0.085, 0.11],
    [0.114, 0.22],
    [0.154, 0.315],
    [0.161, 0.343],
    [0.158, 0.366],
    [0.125, 0.366],
    [0.121, 0.332],
    [0.091, 0.225],
    [0.057, 0.10],
    [0.053, 0],
  ], {
    at: [gx, 1.208, 0.535],
    axis: [0, 0, 1],
    segments: 12,
    color: paint((p, n) => {
      const dx = p.x - gx;
      const dy = p.y - 1.208;
      return dx * n.x + dy * n.y < 0 ? boreMetal : steel;
    }),
    bone: weapon,
    name: "hollowFlaredBlunderbussMuzzle",
  });
  b.part(new THREE.CircleGeometry(0.056, 12), "#11181d", {
    at: [gx, 1.208, 0.552], bone: weapon,
    dir: [0, 0, 1], axis: "z", name: "deepBarrelBore",
  });
  torus([gx, 1.208, 0.884], 0.143, 0.023, brass, weapon, [0, 0, 1], "massiveMuzzleLip");
  torus([gx, 1.208, 0.867], 0.155, 0.007, C.goldLight, weapon, [0, 0, 1], "muzzleEdgeHighlight");

  for (const z of [0.098, 0.315]) {
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.036, 8), brass, {
      at: [gx, 1.208, z], bone: weapon, dir: [0, 0, 1], name: "breechBinding",
    });
  }
  for (const [z, r] of [[0.553, 0.081], [0.691, 0.098]]) {
    b.lathe([
      [r - 0.005, -0.019],
      [r + 0.009, -0.019],
      [r + 0.012, -0.012],
      [r + 0.012, 0.012],
      [r + 0.009, 0.019],
      [r - 0.005, 0.019],
    ], {
      at: [gx, 1.208, z],
      axis: [0, 0, 1],
      segments: 12,
      color: brass,
      bone: weapon,
      name: "hollowBarrelBinding",
    });
  }

  for (const s of sides) {
    b.part(new THREE.PlaneGeometry(0.205, 0.054), "#ffffff", {
      at: [gx + s * 0.083, 1.222, 0.465],
      bone: weapon, dir: [s, 0, 0], up: [0, 1, 0],
      axis: "z", texture: runeTex, name: "engravedBarrelRunes",
    });
    box([gx + s * 0.086, 1.192, 0.129], [0.029, 0.09, 0.16], brass, weapon, "lockPlate");
    for (const z of [0.074, 0.174])
      ellipsoid(
        [gx + s * 0.104, 1.194, z], [0.009, 0.013, 0.013],
        darkMetal, weapon, "lockScrew",
      );
  }
  rod([gx - 0.113, 1.212, 0.085], [gx - 0.113, 1.299, 0.047], 0.016, darkMetal, weapon, "hammerNeck");
  box([gx - 0.113, 1.301, 0.057], [0.048, 0.03, 0.055], steel, weapon, "flintHammer");
  box([gx - 0.098, 1.265, 0.146], [0.038, 0.079, 0.025], brass, weapon, "seatedFrizzen");
  torus([gx - 0.108, 1.201, 0.081], 0.031, 0.008, steel, weapon, [-1, 0, 0], "hammerPivot");

  b.sweep(catmull([
    [gx, 1.122, 0.079],
    [gx, 1.019, 0.078],
    [gx, 1.006, 0.181],
    [gx, 1.108, 0.194],
  ]), 0.012, {
    color: brass, bone: weapon, sides: 6, name: "triggerGuard",
  });
  b.sweep(bezier(
    [gx, 1.126, 0.115], [gx, 1.046, 0.13], [gx, 1.054, 0.165],
  ), 0.008, {
    color: darkMetal, bone: weapon, sides: 5, name: "curvedTrigger",
  });
  rod([gx, 1.103, 0.25], [gx, 1.103, 0.733], 0.014, wood, weapon, "ramrod");
  for (const z of [0.335, 0.563])
    box([gx, 1.117, z], [0.055, 0.053, 0.035], brass, weapon, "ramrodThimble");
  ellipsoid([gx, 1.103, 0.748], [0.027, 0.027, 0.04], brass, weapon, "ramrodTip");
  box([gx, 1.303, 0.252], [0.065, 0.045, 0.045], darkMetal, weapon, "rearSight");
  box([gx, 1.355, 0.808], [0.027, 0.054, 0.033], brass, weapon, "frontSight");
  glow(ellipsoid(
    [gx, 1.384, 0.81], [0.01, 0.012, 0.011], C.cyan, weapon, "sightCrystal",
  ), 0.7);
  b.sweep(catmull([
    [gx + 0.055, 1.13, -0.235],
    [gx + 0.105, 0.913, -0.12],
    [gx + 0.11, 0.872, 0.325],
    [gx + 0.055, 1.115, 0.595],
  ]), () => [0.018, 0.009], {
    color: leather, bone: weapon, sides: 4, name: "hangingRifleSling",
  });

  // Tightened staging. Snow gathers around rocks rather than covering every surface.
  b.part(new THREE.CylinderGeometry(0.92, 0.95, 0.075, 10), C.deep, {
    at: [0, 0.0375, 0.10], scale: [1.13, 1, 0.8],
    bone: hips, name: "darkDisplayPlinth",
  });
  b.part(new THREE.CylinderGeometry(0.90, 0.92, 0.028, 10), stone, {
    at: [0, 0.080, 0.10], scale: [1.13, 1, 0.8],
    bone: hips, name: "mountainRockShelf",
  });

  const rockPositions = [
    [-0.70, 0.13, -0.25, 0.18, 0.09, 0.14],
    [0.65, 0.13, -0.29, 0.18, 0.10, 0.14],
    [0.40, 0.119, -0.43, 0.20, 0.055, 0.12],
    [-0.43, 0.12, -0.41, 0.19, 0.065, 0.13],
    [0.80, 0.117, 0.20, 0.13, 0.055, 0.14],
    [-0.76, 0.113, 0.29, 0.12, 0.045, 0.13],
  ];
  for (const [x, y, z, sx, sy, sz] of rockPositions) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
      at: [x, y, z], scale: [sx, sy, sz],
      rotation: [random() * 15, random() * 90, random() * 12],
      bone: hips, flat: true, name: "brokenShale",
    });
    ellipsoid(
      [x, y + sy * 0.6, z], [sx * 0.86, sy * 0.28, sz * 0.82],
      snowPaint, hips, "snowOnShale",
    );
  }
  for (let i = 0; i < 9; i++) {
    const a = i * Math.PI * 2 / 9;
    const r = 0.61 + random() * 0.12;
    const x = Math.cos(a) * r;
    const z = 0.10 + Math.sin(a) * r * 0.73;
    ellipsoid(
      [x, 0.098, z],
      [0.12 + random() * 0.045, 0.011, 0.065 + random() * 0.035],
      snowPaint, hips, "windblownSnowPatch", [0, random() * 90, 0],
    );
  }

  for (const [x, z] of [[0.66, -0.13], [-0.65, -0.17], [0.43, -0.42]]) {
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.026;
      b.slab([
        [x + dx * 0.2 - 0.009, 0.094, z],
        [x + dx * 0.2 + 0.009, 0.094, z],
        [x + dx * 1.5, 0.19 + (i % 2) * 0.025, z - 0.026],
      ], {
        color: i % 2 ? "#69806d" : "#435c51",
        thickness: 0.004, bone: hips, name: "alpineGrass",
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.CylinderGeometry(0.019, 0.021, 0.084, 8), brass, {
      at: [-0.48 - i * 0.08, 0.113, 0.40 + i * 0.025],
      bone: hips, dir: [1, 0, i % 2 ? 0.35 : -0.25], name: "spentBrassCase",
    });
  }

  box([0.52, 0.157, -0.29], [0.15, 0.12, 0.12], darkMetal, hips, "powderTin");
  box([0.52, 0.221, -0.29], [0.158, 0.018, 0.128], brass, hips, "powderTinLid");
  frontArt([0.52, 0.16, -0.228], 0.078, 0.091, ammoTex, hips, "powderTinMark");

  // This plate projects beyond the front edge instead of intersecting the plinth.
  box([0, 0.063, 0.842], [0.47, 0.105, 0.062], brass, hips, "nameplateFrame");
  frontArt([0, 0.063, 0.875], 0.443, 0.091, plaqueTex, hips, "nameplate");
  for (const s of sides)
    rivet([s * 0.215, 0.063, 0.879], hips, 0.008, C.goldLight);

  return b.root;
}
```