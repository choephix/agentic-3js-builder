import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
  svg,
  polyline,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ignivar, the Basalt Heart",
  description:
    "An anime-fantasy lava golem: monumental basalt armor, separated articulated stone fingers, a radiant hexagonal furnace heart, and molten gold glowing through fractured volcanic plates.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Ignivar",
    detail: 1,
    paintSize: 2048,
  });

  const random = rng(7731);
  const C = {
    ink: "#111521",
    deep: "#1b2331",
    basalt: "#30394b",
    edge: "#515b70",
    ash: "#687086",
    warm: "#513137",
    rust: "#843c30",
    ember: "#da431e",
    lava: "#ff781e",
    gold: "#ffbf43",
    hot: "#fff0a2",
  };

  const stone = paint((p, n) => {
    const light = n.x * 0.28 + n.y * 0.72 + n.z * 0.46;
    const base =
      light > 0.5 ? "#485269" :
      light > 0.05 ? "#30394c" :
      "#1b2231";
    const grain = noise(p, 0.11, 14);
    const shaded = mix(base, "#151b29", grain * 0.18);
    return p.y < 0.19
      ? mix(shaded, "#11151e", 0.45)
      : shaded;
  });

  const darkStone = paint((p, n) => {
    const base = n.y > 0.48 ? "#3b455b" : n.z > 0.25 ? "#242d3e" : "#151c2a";
    return mix(base, "#101725", noise(p, 0.16, 8) * 0.15);
  });

  const warmStone = paint((p, n) => {
    const base = n.y > 0.4 ? "#596077" : n.z > 0.2 ? "#3e3948" : "#292435";
    return mix(base, "#713c35", noise(p, 0.13, 29) * 0.22);
  });

  const cooledLava = paint((p, n) => {
    const a = n.y > 0.2 ? "#ab4c32" : "#582b2b";
    return mix(a, "#322331", noise(p, 0.09, 13) * 0.7);
  });

  // Drawings stay deliberately angular, like engraved elemental heraldry.
  const heartTexture = svg(`
    <svg viewBox="0 0 160 160">
      <path d="M80 5L145 42V118L80 155L15 118V42Z"
        fill="#ffb52d" stroke="#fff0ac" stroke-width="5"/>
      <path d="M80 20L131 49V110L80 140L29 110V49Z"
        fill="#e65317" stroke="#ffdc70" stroke-width="4"/>
      <path d="M80 34L115 54L121 91L98 119L64 121L40 96L44 63L70 47
        L96 55L105 78L92 100L70 103L55 85L62 67L79 61L91 73L88 86L76 92
        L68 82L74 74" fill="none" stroke="#fff3b0" stroke-width="10"
        stroke-linejoin="miter"/>
      <path d="M80 7V25M143 43L126 53M143 117L127 107M80 153V135
        M17 117L33 107M17 43L33 53" stroke="#fff5be" stroke-width="5"/>
    </svg>
  `, { size: 384 });

  const eyeTexture = svg(`
    <svg viewBox="0 0 144 64">
      <path d="M4 6L136 26L115 55L26 40Z" fill="#10131e"/>
      <path d="M13 14L125 29L111 45L32 34Z" fill="#e75116"/>
      <path d="M20 19L118 30L105 39L35 30Z" fill="#ffc23d"/>
      <path d="M31 22L110 31L100 35L43 28Z" fill="#fff6b3"/>
      <path d="M87 26L94 27L90 38L84 36Z" fill="#fff9da"/>
    </svg>
  `, { size: 256 });

  const fractureTexture = svg(`
    <svg viewBox="0 0 128 192">
      <path d="M70 -8L57 36L78 61L51 94L64 123L34 162L42 200"
        fill="none" stroke="#151925" stroke-width="15"/>
      <path d="M70 -8L57 36L78 61L51 94L64 123L34 162L42 200"
        fill="none" stroke="#ef5b1b" stroke-width="7"/>
      <path d="M70 -8L57 36L78 61L51 94L64 123L34 162L42 200"
        fill="none" stroke="#ffd16a" stroke-width="2.8"/>
      <path d="M77 61L103 75L119 68M52 95L28 104L13 128
        M63 123L91 140L94 158M56 37L29 27"
        fill="none" stroke="#f67c28" stroke-width="4"/>
    </svg>
  `, { size: 384 });

  const runeTexture = svg(`
    <svg viewBox="0 0 128 160">
      <path d="M64 9L102 43L85 59L104 85L64 135L24 85L43 59L26 43Z"
        fill="none" stroke="#602d2b" stroke-width="13"/>
      <path d="M64 9L102 43L85 59L104 85L64 135L24 85L43 59L26 43Z"
        fill="none" stroke="#ffb64a" stroke-width="5"/>
      <path d="M64 35L81 54L64 74L47 54ZM64 74V113M47 92L64 112L81 92"
        fill="none" stroke="#ffe393" stroke-width="5"/>
      <path d="M48 148H80" stroke="#ec7632" stroke-width="5"/>
    </svg>
  `, { size: 256 });

  const bandTexture = svg(`
    <svg viewBox="0 0 256 64">
      <path d="M0 14H256M0 50H256" stroke="#9c553b" stroke-width="4"/>
      <path d="M8 32L24 20L40 32L24 44ZM72 32L88 20L104 32L88 44Z
        M136 32L152 20L168 32L152 44ZM200 32L216 20L232 32L216 44Z"
        fill="none" stroke="#edaa5a" stroke-width="4"/>
      <path d="M44 32H64M108 32H128M172 32H192M236 32H256"
        stroke="#e47a36" stroke-width="4"/>
    </svg>
  `, { size: 384 });

  const ventTexture = svg(`
    <svg viewBox="0 0 128 128">
      <path d="M64 5L115 35V93L64 123L13 93V35Z" fill="#211b27"/>
      <path d="M37 28L55 38V91L37 101ZM62 21L79 31V98L62 108Z
        M86 36L101 45V84L86 94Z" fill="#d84c20"/>
      <path d="M42 34L49 39V88L42 93ZM67 29L73 33V95L67 99Z
        M91 43L96 46V81L91 86Z" fill="#ffd77a"/>
    </svg>
  `, { size: 256 });

  // Skeleton first. Broad, gently lowered T-pose; every digit is separate.
  const hips = b.joint("hips", {
    at: [0, 1.43, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain("spine", [
    [0, 1.43, 0],
    [0, 1.93, 0],
    [0, 2.43, 0],
  ], {
    parent: hips,
    names: ["spineLower", "chest", "spineUpper"],
    role: "spine",
  });

  const chest = spine.joints[1];
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 2.49, 0],
    dir: [0, 1, 0],
    role: "neck",
  });

  const H = 1;
  const headOrigin = new THREE.Vector3(0, 2.89, 0.035);
  const hp = (p: number[]) =>
    new THREE.Vector3(p[0] * H, p[1] * H, p[2] * H).add(headOrigin);

  const head = b.joint("head", {
    parent: neck,
    at: headOrigin,
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, -0.16, -0.08]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";

    const leg = b.chain(`leg${side}`, [
      [s * 0.39, 1.42, 0],
      [s * 0.49, 0.88, 0.055],
      [s * 0.53, 0.30, -0.015],
      [s * 0.53, 0.14, 0.23],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.53, 0, 0.25],
    });

    const arm = b.chain(`arm${side}`, [
      [s * 0.71, 2.37, 0],
      [s * 1.23, 2.23, 0],
      [s * 1.65, 2.11, 0],
      [s * 1.84, 2.065, 0],
    ], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });

    const fingers = [-0.20, 0, 0.20].map((z, i) => {
      const reach = i === 1 ? 2.40 : 2.31;
      return b.chain(`finger${i + 1}${side}`, [
        [s * 1.95, 2.065, z],
        [s * 2.16, 2.015, z * 1.20],
        [s * reach, 1.99, z * 1.42],
      ], {
        parent: arm.tip!,
        names: [`finger${i + 1}${side}Base`, `finger${i + 1}${side}Tip`],
        role: "digit",
      });
    });

    const thumb = b.chain(`thumb${side}`, [
      [s * 1.73, 2.055, 0.255],
      [s * 1.86, 1.945, 0.405],
      [s * 2.00, 1.89, 0.485],
    ], {
      parent: arm.tip!,
      names: [`thumb${side}Base`, `thumb${side}Tip`],
      role: "digit",
    });

    const toes = [-1, 0, 1].map((i) =>
      b.chain(`toe${i + 2}${side}`, [
        [s * 0.53 + i * 0.205, 0.115, 0.22],
        [s * 0.53 + i * 0.23, 0.115, i === 0 ? 0.55 : 0.49],
      ], {
        parent: leg.tip!,
        names: [`toe${i + 2}${side}`],
        role: "digit",
      }),
    );

    return { s, side, leg, arm, fingers, thumb, toes };
  });

  type Joint = typeof hips;
  type Fill = string | ReturnType<typeof paint>;
  type Point = number[] | THREE.Vector3;

  const rock = (
    name: string,
    at: Point,
    scale: number[],
    bone: Joint,
    color: Fill = stone,
    rotation: number[] = [0, 0, 0],
  ) =>
    b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      name,
      bone,
      at,
      scale,
      rotation,
      flat: true,
    });

  const box = (
    name: string,
    at: Point,
    size: number[],
    bone: Joint,
    color: Fill,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      bone,
      at,
    });

  // Eight-cornered slabs are the principal primitive of the armor.
  const plate = (
    name: string,
    at: Point,
    size: number[],
    bone: Joint,
    color: Fill = stone,
    axes?: { x: number[]; y: number[] },
  ) => {
    const [w, h, d] = size;
    return b.extrude([
      [-w * 0.50, -h * 0.24],
      [-w * 0.30, -h * 0.50],
      [w * 0.28, -h * 0.50],
      [w * 0.50, -h * 0.23],
      [w * 0.50, h * 0.27],
      [w * 0.29, h * 0.50],
      [-w * 0.32, h * 0.50],
      [-w * 0.50, h * 0.21],
    ], {
      name,
      at,
      bone,
      x: axes?.x ?? [1, 0, 0],
      y: axes?.y ?? [0, 1, 0],
      thickness: d,
      bevel: Math.min(d * 0.24, 0.034),
      color,
    });
  };

  const hotRock = (
    name: string,
    at: Point,
    scale: number[],
    bone: Joint,
    color = C.lava,
  ) => glow(rock(name, at, scale, bone, color), 1.3);

  const drawing = (
    name: string,
    target: Parameters<typeof b.surface>[0],
    texture: THREE.Texture,
    at: Point,
    size: [number, number],
    dir: number[],
    bone: Joint,
    strength = 0,
    mirror = false,
  ) => {
    const p = b.decal(target, texture, {
      name,
      at,
      dir,
      size,
      bone,
      mirror,
      segments: 5,
      lift: 0.0025,
    });
    if (strength > 0) glow(p, strength);
    return p;
  };

  const fissure = (
    name: string,
    target: Parameters<typeof b.surface>[0],
    points: number[][],
    bone: Joint,
    radius = 0.009,
  ) => {
    const path = b.surface(target).drape(polyline(points), { lift: 0.004 });
    glow(b.sweep(path, radius, {
      name: `${name}Orange`,
      bone,
      color: C.lava,
      sides: 4,
      caps: "flat",
    }), 1.2);
    glow(b.sweep(path, radius * 0.36, {
      name: `${name}Gold`,
      bone,
      color: C.hot,
      sides: 4,
      caps: "flat",
    }), 1.5);
  };

  // Inner body: a narrow furnace, largely buried by the armor.
  glow(b.loft([
    { at: [0, 1.36, 0], w: 0.72, h: 0.42 },
    { at: [0, 1.70, 0], w: 0.72, h: 0.43 },
    { at: [0, 2.12, 0], w: 1.12, h: 0.54 },
    { at: [0, 2.40, 0], w: 1.24, h: 0.46 },
    { at: [0, 2.49, 0], w: 0.54, h: 0.36 },
  ], {
    name: "MoltenTorso",
    bone: spine,
    color: C.ember,
    section: { ngon: 6 },
    smooth: false,
    caps: "flat",
  }), 0.9);

  plate("PelvicMass", [0, 1.39, -0.025], [0.97, 0.37, 0.58], hips, darkStone);
  plate("PelvicFront", [0, 1.43, 0.31], [0.78, 0.27, 0.14], hips, stone);

  glow(b.rod([0, 1.56, 0], [0, 1.69, 0], 0.30, {
    bone: spine.joints[0],
    color: C.lava,
    sides: 6,
    name: "WaistFurnace",
  }), 1.1);

  for (const s of [1, -1]) {
    plate(`HipWing${s > 0 ? "L" : "R"}`,
      [s * 0.44, 1.39, 0.10], [0.35, 0.37, 0.53], hips, warmStone);

    b.extrude([
      [-0.14, 0.18],
      [0.15, 0.17],
      [0.20, -0.10],
      [0.05, -0.30],
      [-0.14, -0.18],
    ], {
      name: `PelvicApron${s > 0 ? "L" : "R"}`,
      at: [s * 0.23, 1.29, 0.34],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.13,
      bevel: 0.025,
      color: darkStone,
      bone: hips,
    });
  }

  // The abdomen is a stack of individually readable cooled slabs.
  for (let i = 0; i < 3; i++) {
    const y = 1.66 + i * 0.17;
    const w = 0.61 + i * 0.10;
    const abdomen = plate(
      `AbdominalPlate${i + 1}`, [0, y, 0.285 + i * 0.018],
      [w, 0.145, 0.16], spine.joints[0], i === 1 ? warmStone : stone,
    );
    if (i === 0) {
      drawing("WaistEngraving", abdomen, bandTexture,
        [0, y, 0.39], [0.49, 0.075], [0, 0, 1], spine.joints[0]);
    }
  }

  // Rib plates frame rather than cover the heart.
  for (const { s, side } of limbs) {
    plate(`Clavicle${side}`, [s * 0.36, 2.405, 0.29],
      [0.65, 0.24, 0.24], chest, stone);

    plate(`UpperRib${side}`, [s * 0.42, 2.22, 0.315],
      [0.40, 0.25, 0.21], chest, warmStone);

    plate(`LowerRib${side}`, [s * 0.365, 2.035, 0.32],
      [0.30, 0.20, 0.20], chest, stone);

    plate(`ThoracicSide${side}`, [s * 0.565, 2.18, -0.005],
      [0.58, 0.48, 0.19], chest, darkStone, {
        x: [0, 0, -s],
        y: [0, 1, 0],
      });

    const collarChip = plate(`CollarKeystone${side}`,
      [s * 0.16, 2.47, 0.245], [0.23, 0.17, 0.18], chest, warmStone);

    drawing(`CollarCrack${side}`, collarChip, fractureTexture,
      [s * 0.16, 2.47, 0.35], [0.08, 0.13], [0, 0, 1], chest, 0.9, s < 0);
  }

  // A hexagonal, inward-stepped furnace socket.
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.15, 6), C.ink, {
    name: "HeartSocket",
    at: [0, 2.155, 0.325],
    dir: [0, 0, 1],
    bone: chest,
  });

  b.part(new THREE.TorusGeometry(0.257, 0.052, 4, 6), warmStone, {
    name: "HexagonalHeartRim",
    at: [0, 2.155, 0.415],
    rotation: [0, 0, 30],
    bone: chest,
    flat: true,
  });

  glow(b.part(new THREE.CylinderGeometry(0.207, 0.22, 0.065, 6), C.gold, {
    name: "FurnaceCrystal",
    at: [0, 2.155, 0.424],
    dir: [0, 0, 1],
    bone: chest,
  }), 1.6);

  glow(b.part(new THREE.PlaneGeometry(0.375, 0.375), "#ffffff", {
    name: "AncientSpiralHeart",
    texture: heartTexture,
    at: [0, 2.155, 0.462],
    dir: [0, 0, 1],
    axis: "z",
    bone: chest,
  }), 1.1);

  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * Math.PI / 180;
    const x = Math.sin(angle) * 0.27;
    const y = 2.155 + Math.cos(angle) * 0.27;
    const radial = [Math.sin(angle), Math.cos(angle), 0];
    b.part(new THREE.BoxGeometry(0.065, 0.105, 0.055), darkStone, {
      name: `HeartRetainer${i + 1}`,
      at: [x, y, 0.452],
      dir: radial,
      bone: chest,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.022, 0), C.hot, {
      name: `HeartRetainerEmber${i + 1}`,
      at: [x, y, 0.484],
      bone: chest,
    }), 1.1);
  }

  // Rear silhouette: shingled basalt vertebrae, with a real rear vent.
  for (let i = 0; i < 5; i++) {
    const y = 1.59 + i * 0.18;
    plate(`BackCarapace${i + 1}`, [0, y, -0.28],
      [0.70 + i * 0.085, 0.235, 0.19],
      i < 2 ? spine.joints[0] : chest, darkStone, {
        x: [-1, 0, 0],
        y: [0, 1, 0],
      });
    rock(`SpinalKeel${i + 1}`, [0, y + 0.025, -0.405],
      [0.095, 0.115, 0.11], i < 2 ? spine.joints[0] : chest, warmStone);
  }

  const backVent = plate("UpperBackVent", [0, 2.32, -0.40],
    [0.37, 0.35, 0.13], chest, warmStone, {
      x: [-1, 0, 0],
      y: [0, 1, 0],
    });

  drawing("RearFurnaceGrille", backVent, ventTexture,
    [0, 2.32, -0.49], [0.29, 0.29], [0, 0, -1], chest, 0.9);

  // Neck and the completed face precede the surrounding crown.
  glow(b.rod([0, 2.43, 0], [0, 2.76, 0], 0.185, {
    bone: neck,
    color: C.lava,
    sides: 6,
    name: "MoltenNeck",
  }), 1.0);

  plate("NeckGuard", [0, 2.57, 0.12], [0.40, 0.19, 0.25], neck, darkStone);
  rock("CranialBasalt", hp([0, 0.015, -0.015]),
    [0.35 * H, 0.34 * H, 0.30 * H], head, darkStone);

  const face = b.extrude([
    [-0.28 * H, -0.145 * H],
    [-0.35 * H, 0.08 * H],
    [-0.22 * H, 0.29 * H],
    [0, 0.365 * H],
    [0.22 * H, 0.29 * H],
    [0.35 * H, 0.08 * H],
    [0.28 * H, -0.145 * H],
    [0, -0.19 * H],
  ], {
    name: "UpperJawAndFace",
    at: hp([0, 0, 0.205]),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.20 * H,
    bevel: 0.025 * H,
    color: stone,
    bone: head,
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    drawing(`FurnaceEye${side}`, face, eyeTexture,
      hp([s * 0.153, 0.065, 0.32]), [0.242 * H, 0.108 * H],
      [0, 0, 1], head, 1.6, s > 0);

    b.extrude([
      [-0.125, 0.035], [0.11, 0.005],
      [0.10, -0.035], [-0.105, -0.012],
    ].map(([x, y]) => [x * H, y * H]), {
      name: `HeavyBrow${side}`,
      at: hp([s * 0.155, 0.14, 0.325]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075 * H,
      bevel: 0.012 * H,
      color: darkStone,
      bone: head,
    });

    plate(`CheekGuard${side}`, hp([s * 0.278, -0.10, 0.25]),
      [0.16 * H, 0.24 * H, 0.18 * H], head, warmStone);

    rock(`Temple${side}`, hp([s * 0.31, 0.09, -0.025]),
      [0.135 * H, 0.23 * H, 0.24 * H], head, darkStone);

    glow(b.rod(
      hp([s * 0.294, -0.16, 0.26]),
      hp([s * 0.322, -0.045, 0.23]),
      0.013 * H, {
        name: `CheekHeat${side}`,
        bone: head,
        color: C.gold,
        sides: 4,
      },
    ), 1.2);
  }

  plate("NasalKeystone", hp([0, -0.055, 0.32]),
    [0.14 * H, 0.18 * H, 0.12 * H], head, darkStone);

  glow(box("MouthFurnace", hp([0, -0.175, 0.225]),
    [0.40 * H, 0.042 * H, 0.13 * H], head, C.lava), 1.1);

  const chin = plate("SeparateLowerJaw", hp([0, -0.265, 0.17]),
    [0.47 * H, 0.16 * H, 0.31 * H], jaw, warmStone);

  plate("ChinKeystone", hp([0, -0.305, 0.29]),
    [0.17 * H, 0.15 * H, 0.11 * H], jaw, darkStone);

  drawing("JawFracture", chin, fractureTexture,
    hp([0.12, -0.265, 0.335]), [0.075 * H, 0.12 * H],
    [0, 0, 1], jaw, 0.8);

  drawing("ForeheadSeal", face, runeTexture,
    hp([0, 0.245, 0.32]), [0.09 * H, 0.12 * H],
    [0, 0, 1], head, 0.9);

  // A three-point mineral crown, not a hat.
  for (const s of [1, -1]) {
    b.frustumBox(
      hp([s * 0.22, 0.22, -0.025]),
      hp([s * 0.34, 0.53, -0.075]),
      [0.17 * H, 0.19 * H],
      [0.09 * H, 0.11 * H], {
        name: `CrownProng${s > 0 ? "L" : "R"}`,
        bone: head,
        color: darkStone,
      },
    );

    glow(b.frustumBox(
      hp([s * 0.215, 0.27, 0.059]),
      hp([s * 0.305, 0.455, 0.018]),
      [0.025 * H, 0.022 * H],
      [0.012 * H, 0.014 * H], {
        name: `CrownProngSeam${s > 0 ? "L" : "R"}`,
        bone: head,
        color: C.lava,
      },
    ), 1.0);
  }

  b.frustumBox(hp([0, 0.29, -0.09]), hp([0, 0.58, -0.12]),
    [0.22 * H, 0.19 * H], [0.105 * H, 0.11 * H], {
      name: "CrownCentralProng",
      bone: head,
      color: stone,
    });

  plate("OccipitalPlate", hp([0, 0.03, -0.28]),
    [0.47 * H, 0.47 * H, 0.13 * H], head, darkStone, {
      x: [-1, 0, 0],
      y: [0, 1, 0],
    });

  // Each shoulder is a small assemblage of basalt columns around a hot joint.
  for (const { s, side, arm, leg, fingers, thumb, toes } of limbs) {
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const hand = arm.tip!;
    const thigh = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const foot = leg.tip!;

    glow(b.sweep(arm, (t) => 0.19 - t * 0.055, {
      name: `ArmMagma${side}`,
      color: C.lava,
      sides: 6,
      smooth: false,
    }), 1.1);

    hotRock(`ShoulderInterior${side}`, [s * 0.84, 2.43, 0],
      [0.405, 0.345, 0.36], shoulder, C.ember);

    rock(`ShoulderBoulder${side}`, [s * 0.87, 2.49, -0.045],
      [0.44, 0.375, 0.37], shoulder, darkStone, [9, s * 12, s * -12]);

    const shoulderFront = plate(`ShoulderFace${side}`,
      [s * 0.91, 2.48, 0.31], [0.64, 0.48, 0.20],
      shoulder, stone);

    plate(`ShoulderLowerPlate${side}`, [s * 0.91, 2.235, 0.285],
      [0.47, 0.17, 0.16], shoulder, warmStone);

    rock(`ShoulderOuterPlate${side}`, [s * 1.145, 2.46, 0],
      [0.22, 0.29, 0.33], shoulder, stone, [0, 0, s * 18]);

    drawing(`ShoulderElementSeal${side}`, shoulderFront, runeTexture,
      [s * 0.91, 2.48, 0.425], [0.225, 0.29],
      [0, 0, 1], shoulder, 0.75, s < 0);

    for (let i = 0; i < 3; i++) {
      const x = s * (0.66 + i * 0.185);
      const y = 2.66 + (i === 1 ? 0.06 : 0);
      b.frustumBox(
        [x, y, -0.065],
        [x + s * (0.05 + i * 0.015), y + 0.25 - i * 0.025, -0.115],
        [0.19, 0.23],
        [0.14, 0.17], {
          name: `ShoulderColumn${i + 1}${side}`,
          bone: shoulder,
          color: i === 1 ? stone : darkStone,
        },
      );
      glow(b.rod(
        [x + s * 0.065, y - 0.035, 0.06],
        [x + s * 0.08, y + 0.11, 0.025],
        0.012, {
          name: `ShoulderColumnHeat${i + 1}${side}`,
          bone: shoulder,
          color: C.gold,
          sides: 4,
        },
      ), 0.9);
    }

    b.frustumBox(
      [s * 1.00, 2.31, 0],
      [s * 1.205, 2.25, 0],
      [0.37, 0.40],
      [0.30, 0.34], {
        name: `UpperArmStone${side}`,
        bone: shoulder,
        color: stone,
      },
    );

    hotRock(`ElbowEmber${side}`, [s * 1.24, 2.23, 0],
      [0.195, 0.18, 0.19], elbow);

    for (const z of [-0.175, 0.175]) {
      b.part(new THREE.CylinderGeometry(0.125, 0.15, 0.065, 6), darkStone, {
        name: `ElbowCap${z > 0 ? "Front" : "Back"}${side}`,
        at: [s * 1.24, 2.23, z],
        dir: [0, 0, 1],
        bone: elbow,
      });
    }

    const forearm = b.frustumBox(
      [s * 1.31, 2.215, 0],
      [s * 1.59, 2.13, 0],
      [0.43, 0.44],
      [0.49, 0.46], {
        name: `ForearmMass${side}`,
        bone: elbow,
        color: darkStone,
      },
    );

    const bracer = plate(`ForearmFront${side}`,
      [s * 1.47, 2.175, 0.235], [0.38, 0.38, 0.14],
      elbow, stone);

    plate(`ForearmBack${side}`, [s * 1.47, 2.175, -0.235],
      [0.35, 0.35, 0.12], elbow, darkStone);

    rock(`ForearmRidge${side}`, [s * 1.48, 2.38, -0.015],
      [0.22, 0.12, 0.22], elbow, warmStone);

    drawing(`ForearmCrack${side}`, bracer, fractureTexture,
      [s * 1.47, 2.175, 0.315], [0.20, 0.33],
      [0, 0, 1], elbow, 1.0, s < 0);

    const forearmSurface = b.surface(forearm);
    for (const hit of forearmSurface.scatter(3, {
      rng: random,
      minDist: 0.10,
      filter: (h) => h.n.y > 0.3,
    })) {
      b.stick(new THREE.IcosahedronGeometry(0.07, 0), warmStone, hit, {
        name: `ForearmMineral${side}`,
        scale: [1, 0.55, 1.3],
        embed: 0.35,
      });
    }

    glow(b.rod(
      [s * 1.62, 2.12, 0],
      [s * 1.73, 2.09, 0], 0.155, {
        name: `WristMagma${side}`,
        bone: wrist,
        color: C.gold,
        sides: 6,
      },
    ), 1.05);

    // Heavy palm, with a dorsal plate and an exposed thumb saddle.
    hotRock(`PalmInterior${side}`, [s * 1.84, 2.065, 0],
      [0.255, 0.19, 0.285], hand, C.ember);

    rock(`PalmStone${side}`, [s * 1.835, 2.085, -0.015],
      [0.265, 0.205, 0.285], hand, darkStone);

    const handTop = plate(`HandDorsalPlate${side}`,
      [s * 1.845, 2.25, -0.005], [0.34, 0.43, 0.105],
      hand, stone, {
        x: [s, 0, 0],
        y: [0, 0, -s],
      });

    drawing(`HandDorsalCrack${side}`, handTop, fractureTexture,
      [s * 1.845, 2.315, -0.005], [0.15, 0.32],
      [0, 1, 0], hand, 0.9);

    plate(`PalmHeel${side}`, [s * 1.77, 1.93, -0.035],
      [0.24, 0.13, 0.43], hand, warmStone);

    const digits = [...fingers, thumb];
    digits.forEach((digit, digitIndex) => {
      const isThumb = digitIndex === 3;
      const width = isThumb ? 0.17 : 0.15;
      glow(b.sweep(digit, isThumb ? 0.068 : 0.061, {
        name: `DigitLava${digitIndex + 1}${side}`,
        color: C.lava,
        sides: 6,
      }), 1.1);

      for (let k = 0; k < 2; k++) {
        const [start, end] = digit.span(k);
        const a = digit.at(start + (end - start) * 0.12);
        const c = digit.at(start + (end - start) * 0.90);
        b.frustumBox(a, c,
          [width, width * 0.95],
          [width * 0.82, width * 0.86], {
            name: `StonePhalanx${digitIndex + 1}_${k + 1}${side}`,
            bone: digit.joints[k],
            color: k === 0 ? stone : darkStone,
          },
        );
      }

      const midJoint = digit.joints[1];
      rock(`KnuckleShield${digitIndex + 1}${side}`,
        midJoint.at.clone().add(new THREE.Vector3(0, 0.055, 0)),
        [0.075, 0.055, 0.075], midJoint, warmStone);

      const tip = digit.at(0.94);
      rock(`FingerEnd${digitIndex + 1}${side}`, tip.at,
        [0.070, 0.071, 0.068], digit.joints[1], darkStone);
    });

    // Legs carry the visual weight: short, wide, and strongly separated.
    glow(b.sweep(leg, (t) => 0.23 - t * 0.075, {
      name: `LegMagma${side}`,
      color: C.lava,
      sides: 6,
      caps: "flat",
    }), 1.05);

    b.frustumBox(
      [s * 0.41, 1.31, 0],
      [s * 0.475, 0.99, 0.04],
      [0.47, 0.49],
      [0.40, 0.43], {
        name: `ThighMass${side}`,
        bone: thigh,
        color: darkStone,
      },
    );

    const thighPlate = plate(`ThighFront${side}`,
      [s * 0.45, 1.16, 0.255], [0.40, 0.40, 0.15],
      thigh, stone);

    drawing(`ThighEtching${side}`, thighPlate, bandTexture,
      [s * 0.45, 1.19, 0.34], [0.30, 0.09],
      [0, 0, 1], thigh);

    plate(`ThighOuter${side}`, [s * 0.65, 1.14, 0],
      [0.35, 0.39, 0.16], thigh, warmStone, {
        x: [0, 0, -s],
        y: [0, 1, 0],
      });

    hotRock(`KneeFurnace${side}`, [s * 0.49, 0.88, 0.055],
      [0.235, 0.205, 0.22], knee);

    const kneecap = plate(`KneeShield${side}`,
      [s * 0.49, 0.885, 0.285], [0.38, 0.30, 0.20],
      knee, warmStone);

    plate(`KneeKeystone${side}`, [s * 0.49, 0.90, 0.40],
      [0.15, 0.19, 0.065], knee, darkStone);

    for (const dx of [-0.105, 0.105]) {
      glow(b.rod(
        [s * 0.49 + dx, 0.82, 0.385],
        [s * 0.49 + dx, 0.93, 0.385], 0.009, {
          name: `KneeHeatMark${side}`,
          bone: knee,
          color: C.gold,
          sides: 4,
        },
      ), 1);
    }

    const shin = b.frustumBox(
      [s * 0.50, 0.76, 0.025],
      [s * 0.53, 0.34, -0.005],
      [0.43, 0.46],
      [0.50, 0.48], {
        name: `ShinMass${side}`,
        bone: knee,
        color: darkStone,
      },
    );

    const shinPlate = plate(`ShinFront${side}`,
      [s * 0.525, 0.54, 0.245], [0.42, 0.47, 0.18],
      knee, stone);

    drawing(`ShinFault${side}`, shinPlate, fractureTexture,
      [s * 0.525, 0.54, 0.345], [0.23, 0.42],
      [0, 0, 1], knee, 1.05, s < 0);

    plate(`CalfPlate${side}`, [s * 0.52, 0.56, -0.255],
      [0.38, 0.43, 0.13], knee, warmStone, {
        x: [-1, 0, 0],
        y: [0, 1, 0],
      });

    for (const hit of b.surface(shin).scatter(4, {
      rng: random,
      minDist: 0.12,
      filter: (h) => Math.abs(h.n.x) > 0.6,
    })) {
      b.stick(new THREE.IcosahedronGeometry(0.075, 0), darkStone, hit, {
        name: `ShinChippedBasalt${side}`,
        scale: [1.1, 0.5, 1.4],
        embed: 0.35,
      });
    }

    hotRock(`AnkleHeat${side}`, [s * 0.53, 0.285, 0.005],
      [0.245, 0.14, 0.25], ankle, C.ember);

    plate(`AnkleCuff${side}`, [s * 0.53, 0.285, -0.015],
      [0.53, 0.14, 0.49], ankle, darkStone);

    // Flat soles establish exact floor contact at y = 0.
    box(`FootSole${side}`, [s * 0.53, 0.045, 0.105],
      [0.65, 0.09, 0.61], foot, C.ink);

    rock(`HeelMass${side}`, [s * 0.53, 0.195, -0.035],
      [0.34, 0.205, 0.31], foot, darkStone);

    const instep = plate(`FootInstep${side}`,
      [s * 0.53, 0.245, 0.20], [0.59, 0.23, 0.35],
      foot, stone);

    fissure(`InstepFault${side}`, instep, [
      [s * 0.53 - 0.16, 0.36, 0.13],
      [s * 0.53 - 0.06, 0.36, 0.18],
      [s * 0.53 - 0.09, 0.35, 0.27],
      [s * 0.53 + 0.02, 0.32, 0.36],
    ], foot, 0.009);

    toes.forEach((toe, i) => {
      glow(b.sweep(toe, 0.072, {
        name: `ToeHeat${i + 1}${side}`,
        color: C.ember,
        sides: 4,
        caps: "flat",
      }), 0.85);

      const a = toe.at(0.12);
      const c = toe.at(1);
      b.frustumBox(a, c,
        [0.18, 0.19], [0.19, 0.18], {
          name: `StoneToe${i + 1}${side}`,
          bone: toe.joints[0],
          color: darkStone,
        },
      );

      const p = toe.at(0.80).at;
      plate(`ToeCap${i + 1}${side}`,
        [p.x, 0.205, p.z], [0.165, 0.16, 0.055],
        toe.joints[0], stone, {
          x: [1, 0, 0],
          y: [0, 0, -1],
        });
    });

    // A few rear-facing cracks keep the turnaround as designed as the front.
    drawing(`KneeSideFault${side}`, kneecap, fractureTexture,
      [s * 0.59, 0.89, 0.40], [0.06, 0.20],
      [0, 0, 1], knee, 0.6);
  }

  // Small, seated shards break only selected edges, not the whole silhouette.
  const backChips = b.surface(backVent).scatter(4, {
    rng: random,
    minDist: 0.08,
    filter: (h) => h.n.y > 0.15,
  });

  for (const hit of backChips) {
    b.stick(new THREE.IcosahedronGeometry(0.045, 0), cooledLava, hit, {
      name: "RearVentCrust",
      embed: 0.4,
      scale: [1.3, 0.65, 1],
    });
  }

  // Paired thin seams beneath the shoulder mantle lead the eye to the heart.
  for (const s of [1, -1]) {
    glow(b.sweep([
      [s * 0.57, 2.38, 0.408],
      [s * 0.43, 2.355, 0.414],
      [s * 0.31, 2.38, 0.416],
      [s * 0.22, 2.35, 0.417],
    ], 0.009, {
      name: `ClavicleHeat${s > 0 ? "L" : "R"}`,
      color: C.gold,
      bone: chest,
      sides: 4,
      caps: "flat",
    }), 1.0);
  }

  // Thin incandescent wedges in the rear neck give the head a clear pivot.
  b.ring(frame(neck, [0, 1, 0]), {
    count: 6,
    radius: 0.17,
  }, (at) => {
    b.stick(new THREE.BoxGeometry(0.08, 0.055, 0.14), darkStone, at, {
      name: "NeckBasaltSegment",
      bone: neck,
      embed: 0.3,
      flow: [0, 1, 0],
    });
  });

  return b.root;
}
