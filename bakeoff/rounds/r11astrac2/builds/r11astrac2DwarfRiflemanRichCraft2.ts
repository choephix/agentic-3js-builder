import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint, PointInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Borin Emberbraid — Mountain Rifleman",
  description:
    "A stout mountain rifleman with a stern weather-beaten face, sculpted copper plaits, massive blue-steel pauldrons and a hollow brass-bound blunderbuss. Rigged in a separated rest pose on snow-dusted mountain shale.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Seat shoulder and bracer insignia on the armour; move the ramrod clear
   *    of the muzzle interior and remove the hood's intersecting crown.
   * 2. Narrow the eyes and integrate the cheeks and nose for a stern veteran,
   *    rather than a wide-eyed face assembled from pink beads.
   * 3. Taper and splay the interwoven beard, enrich its central locks, and
   *    reserve the hammer crest for the most important heraldic locations.
   * 4. Give the armour sharper crowns, layered edges and chamfered boots;
   *    expose chain mail beneath it and quiet the stock's noisy wood.
   * 5. Replace polka-dot snow with irregular connected drifts, slate seams
   *    and a more legible presentation plate.
   */
  const b = createBuilder({ name: "Borin Emberbraid", paintSize: 2048 });
  const random = rng(38117);

  const C = {
    ink: "#20232a",
    deep: "#192d38",
    steel: "#536f82",
    steelLight: "#a0bdc5",
    gold: "#d5a34d",
    goldLight: "#ffe1a1",
    green: "#345841",
    greenDark: "#233c32",
    darkLeather: "#352a28",
    leatherEdge: "#b4814d",
    copper: "#b9572c",
    orange: "#e28a43",
    hairDark: "#793c28",
    skinShade: "#b8755e",
    ivory: "#f7e7c6",
    cyan: "#83e8e6",
  };

  const steel = paint((p, n) => {
    const key = n.x * 0.25 + n.y * 0.75 + n.z * 0.35;
    const base = key > 0.48 ? "#8ba8b5" : key > -0.12 ? "#536e83" : "#304858";
    return mix(base, "#405868", noise(p, 0.15, 3) * 0.065);
  });
  const brass = paint((_p, n) =>
    n.y > 0.4 ? "#efc777" : n.z > 0.35 ? "#cf9c46" : "#aa7834",
  );
  const darkMetal = paint((_p, n) =>
    n.y > 0.4 ? "#4b606d" : n.z > 0.2 ? "#293b47" : "#1c2933",
  );
  const wood = paint((p, n) => {
    const streak = Math.sin(p.z * 21 + noise(p, 0.09, 12) * 3);
    return mix("#62412e", "#87603e", 0.32 + n.y * 0.18 + streak * 0.06);
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
    mix(n.y > 0.25 ? "#587554" : "#34523d", "#2c4436", noise(p, 0.025, 5) * 0.1),
  );
  const skin = paint((p, n) => {
    const lit = mix("#c58b70", "#f0bf91", 0.48 + n.y * 0.28 + n.z * 0.24);
    const cheek = Math.exp(
      -((Math.abs(p.x) - 0.155) ** 2 / 0.0022 + (p.y - 1.307) ** 2 / 0.0015),
    );
    const tip = Math.exp(
      -(p.x ** 2 / 0.003 + (p.y - 1.291) ** 2 / 0.001),
    ) * Math.max(0, (p.z - 0.27) * 12);
    return mix(lit, "#c8836d", Math.min(0.33, cheek * 0.24 + tip * 0.17));
  });
  const stone = paint((_p, n) =>
    n.y > 0.55 ? "#697e89" : n.y > 0 ? "#516675" : "#354855",
  );
  const snowPaint = paint((_p, n) =>
    mix("#b4cdd6", "#f0f5ed", 0.55 + n.y * 0.4),
  );

  // Narrow, hooded eyes retain a glint without turning into large round eyeballs.
  const eyeTex = svg(`
    <svg viewBox="0 0 120 64">
      <path d="M5 31L39 21Q73 16 111 33L105 44Q60 56 15 43Z"
        fill="#3d2c2a"/>
      <path d="M14 33L43 28Q72 24 101 34L96 40Q58 47 23 39Z"
        fill="#e8dfcb"/>
      <path d="M47 27Q61 24 73 28L73 41Q61 47 48 41Z"
        fill="#538d99"/>
      <path d="M57 27H64V43H57Z" fill="#182f38"/>
      <circle cx="55" cy="31" r="3.4" fill="#ffffff"/>
      <path d="M8 29L40 20Q76 16 111 31" stroke="#472a22"
        stroke-width="7" fill="none" stroke-linejoin="round"/>
      <path d="M19 47Q62 54 99 45" stroke="#a36e57"
        stroke-width="3.5" fill="none"/>
    </svg>`, { size: 384 });

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

  const knotTex = svg(`
    <svg viewBox="0 0 96 128">
      <path d="M48 6L82 31V94L48 122L14 94V31Z"
        fill="#2b4149" stroke="#e3bd73" stroke-width="6"/>
      <path d="M48 21L68 42L28 82L48 105L68 82L28 42Z"
        fill="none" stroke="#e3bd73" stroke-width="6" stroke-linejoin="round"/>
      <path d="M48 40V86" stroke="#a7c2c3" stroke-width="4"/>
    </svg>`, { size: 256 });

  const mailTex = svg(`
    <svg viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#253943"/>
      <defs>
        <pattern id="mail" width="32" height="26" patternUnits="userSpaceOnUse">
          <path d="M-8 5Q0-5 8 5Q14 15 0 24Q-14 15-8 5
                   M24 5Q32-5 40 5Q46 15 32 24Q18 15 24 5
                   M8 18Q16 8 24 18Q30 28 16 37Q2 28 8 18"
            fill="none" stroke="#132630" stroke-width="7"/>
          <path d="M-8 5Q0-5 8 5Q14 15 0 24
                   M24 5Q32-5 40 5Q46 15 32 24
                   M8 18Q16 8 24 18Q30 28 16 37"
            fill="none" stroke="#82999e" stroke-width="3"/>
        </pattern>
      </defs>
      <rect width="128" height="128" fill="url(#mail)"/>
    </svg>`, { size: 256 });

  const plaqueTex = svg(`
    <svg viewBox="0 0 400 112">
      <rect x="3" y="3" width="394" height="106" rx="8" fill="#263944"
        stroke="#cca461" stroke-width="6"/>
      <path d="M18 19H382 M18 93H382" stroke="#71868b" stroke-width="2"/>
      <text x="200" y="51" text-anchor="middle" font-family="serif"
        font-weight="bold" letter-spacing="2" font-size="32"
        fill="#f0d39a">EMBERBRAID</text>
      <text x="200" y="78" text-anchor="middle" font-family="serif"
        font-weight="bold" letter-spacing="4" font-size="15"
        fill="#a3b9b8">MOUNTAIN GUARD</text>
    </svg>`, { size: 768 });

  const ammoTex = svg(`
    <svg viewBox="0 0 64 96">
      <rect width="64" height="96" fill="#b58c47"/>
      <path d="M6 8H58V88H6Z" fill="none" stroke="#473728" stroke-width="5"/>
      <path d="M20 29L32 17L44 29L32 41Z M32 41V72 M22 60H42"
        stroke="#f4d692" stroke-width="6" fill="none"/>
    </svg>`, { size: 128 });

  // Skeleton first. The neutral extended pose leaves the joints readable.
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
    parent: head, at: [0, 1.245, 0.1], dir: [0, 0, 1], role: "jaw",
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
    ], (t) => [
      width * (1 - t * 0.88),
      depth * (1 - t * 0.85),
    ], {
      bone, color, sides: 6, smooth: false,
      caps: { start: "round", end: "point" },
      name,
    });
  }

  // One continuous hood volume: no intersecting crown stacked on top.
  const hood = ellipsoid(
    [0, 1.353, -0.063], [0.274, 0.304, 0.229],
    wool, head, "continuousWoolHood",
  );
  ellipsoid([0, 1.348, 0.06], [0.225, 0.231, 0.19], skin, head, "headBlock");
  ellipsoid([0, 1.215, 0.135], [0.161, 0.095, 0.126], skin, jaw, "lowerJaw");

  for (const s of sides) {
    ellipsoid(
      [s * 0.157, 1.307, 0.157], [0.082, 0.064, 0.064],
      skin, head, "integratedCheekbone",
    );
    ellipsoid([s * 0.24, 1.335, 0.045], [0.058, 0.089, 0.055], skin, head, "ear");
    ellipsoid(
      [s * 0.26, 1.337, 0.081], [0.022, 0.051, 0.014],
      C.skinShade, head, "earInset",
    );
    const eyePad = ellipsoid(
      [s * 0.094, 1.385, 0.213], [0.074, 0.034, 0.024],
      skin, head, "hoodedEyeSocket",
    );
    b.decal(eyePad, eyeTex, {
      at: [s * 0.094, 1.385, 0.242],
      dir: [0, 0, 1],
      size: [0.138, 0.069],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: "veteranBlueEye",
    });
    tuft(
      [s * 0.034, 1.412, 0.237],
      [s * 0.185, 1.449, 0.201],
      0.03, 0.028, hair, head, "heavyAngledBrow",
    );
    b.sweep([
      [s * 0.046, 1.43, 0.254],
      [s * 0.111, 1.448, 0.238],
      [s * 0.175, 1.454, 0.212],
    ], [0.0055, 0.0025], {
      color: C.orange, bone: head, sides: 5, name: "browCarvedRidge",
    });
    tuft(
      [s * 0.173, 1.415, 0.155],
      [s * 0.223, 1.215, 0.191],
      0.043, 0.04, hair, head, "sideburn",
    );
    tuft(
      [s * 0.19, 1.307, 0.17],
      [s * 0.26, 1.154, 0.202],
      0.043, 0.034, hair, head, "outwardCheekLock",
    );
    b.sweep([
      [s * 0.147, 1.347, 0.224],
      [s * 0.18, 1.336, 0.21],
    ], 0.0028, {
      color: C.skinShade, bone: head, sides: 5, name: "weatheredEyeCrease",
    });
    b.sweep([
      [s * 0.174, 1.369, 0.215],
      [s * 0.19, 1.374, 0.201],
    ], 0.0025, {
      color: C.skinShade, bone: head, sides: 5, name: "crowsFoot",
    });
  }

  ellipsoid([0, 1.35, 0.228], [0.047, 0.092, 0.052], skin, head, "noseBridge");
  ellipsoid([0, 1.294, 0.283], [0.073, 0.053, 0.071], skin, head, "broadNose");
  for (const s of sides) {
    ellipsoid(
      [s * 0.052, 1.275, 0.294], [0.028, 0.024, 0.026],
      skin, head, "nostrilWing",
    );
    ellipsoid(
      [s * 0.041, 1.264, 0.314], [0.012, 0.007, 0.006],
      C.hairDark, head, "nostril",
    );
  }
  box([0, 1.223, 0.249], [0.126, 0.021, 0.016], "#502c2b", jaw, "mouthOpening");
  ellipsoid([0, 1.206, 0.246], [0.069, 0.014, 0.021], C.skinShade, jaw, "lowerLip");

  // Wide fabric facing physically connects the opening to the hood.
  const opening = [
    [-0.227, 1.19, 0.118],
    [-0.252, 1.375, 0.108],
    [-0.205, 1.515, 0.123],
    [0, 1.59, 0.135],
    [0.205, 1.515, 0.123],
    [0.252, 1.375, 0.108],
    [0.227, 1.19, 0.118],
  ];
  const hoodSurface = b.surface(hood);
  const outerFacing = opening.map((p) => hoodSurface.nearest(p));
  b.membrane(catmull(opening), catmull(outerFacing), {
    thickness: 0.014, rows: 2, cols: 18,
    color: C.greenDark, bone: head, name: "hoodOpeningFacing",
  });
  b.sweep(catmull(opening), 0.024, {
    color: C.greenDark, bone: head, sides: 6, smooth: false, name: "thickHoodOpening",
  });
  b.sweep(catmull([
    [-0.25, 1.29, 0.13],
    [-0.236, 1.49, 0.144],
    [0, 1.606, 0.157],
    [0.236, 1.49, 0.144],
    [0.25, 1.29, 0.13],
  ]), 0.007, {
    color: brass, bone: head, sides: 5, name: "hoodGoldPiping",
  });
  frontArt([0, 1.557, 0.166], 0.055, 0.075, knotTex, head, "hoodKnotBadge");
  const hoodSeam = hoodSurface.drape(catmull([
    [0, 1.64, -0.05],
    [0, 1.58, -0.23],
    [0, 1.39, -0.31],
    [0, 1.19, -0.24],
  ]), { lift: 0.002 });
  b.sweep(hoodSeam, 0.004, {
    color: "#708364", bone: head, sides: 5, name: "hoodBackSeam",
  });
  for (const s of sides)
    torus([s * 0.255, 1.277, 0.082], 0.025, 0.007, brass, head);

  // A broad beard silhouette sits behind the strands and plaits.
  b.loft([
    { at: [0, 1.224, 0.17], w: 0.405, h: 0.195 },
    { at: [0, 1.11, 0.198], w: 0.44, h: 0.205 },
    { at: [0, 0.96, 0.213], w: 0.30, h: 0.16 },
    { at: [0, 0.854, 0.22], w: 0.115, h: 0.075 },
  ], {
    color: hair, bone: jaw, sides: 8, smooth: false, name: "beardSilhouette",
  });

  for (let k = -2; k <= 2; k++) {
    const rootX = k * 0.035;
    const endX = k * 0.018;
    const endY = 0.838 + Math.abs(k) * 0.045;
    tuft(
      [rootX, 1.18 - Math.abs(k) * 0.018, 0.286],
      [endX, endY, 0.29],
      0.033, 0.031, k % 2 === 0 ? hairLight : hair, jaw, "centralBeardBlade",
    );
    b.sweep(bezier(
      [rootX, 1.146 - Math.abs(k) * 0.015, 0.319],
      [rootX * 0.7, 1.002, 0.317],
      [endX, endY + 0.03, 0.301],
    ), [0.004, 0.0015], {
      color: k % 2 === 0 ? "#efa058" : C.hairDark,
      bone: jaw, sides: 5, name: "carvedCentralHairGroove",
    });
  }

  for (const s of sides) {
    b.sweep(bezier(
      [s * 0.018, 1.257, 0.291],
      [s * 0.12, 1.268, 0.317],
      [s * 0.207, 1.191, 0.271],
    ), [0.045, 0.035, 0.006], {
      color: hair, bone: head, sides: 6, smooth: false, name: "sweptMoustache",
    });
    b.sweep(bezier(
      [s * 0.033, 1.265, 0.329],
      [s * 0.11, 1.265, 0.342],
      [s * 0.181, 1.208, 0.299],
    ), [0.007, 0.003], {
      color: C.orange, bone: head, sides: 5, name: "moustacheHighlight",
    });
    for (let k = 0; k < 3; k++) {
      tuft(
        [s * (0.11 + k * 0.039), 1.19 - k * 0.008, 0.23 - k * 0.016],
        [s * (0.092 + k * 0.046), 0.95 + k * 0.04, 0.267 - k * 0.013],
        0.039, 0.03, k === 1 ? hairLight : hair, jaw, "outerBeardBlade",
      );
    }

    const x = s * 0.118;
    const cuffX = s * 0.145;
    b.sweep([
      [x, 1.17, 0.28],
      [s * 0.137, 0.98, 0.297],
      [cuffX, 0.79, 0.29],
    ], [0.05, 0.043, 0.032], {
      color: hair, bone: jaw, sides: 6, name: "buriedBraidCore",
    });

    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const y = 1.144 - i * 0.049;
      const bx = s * (0.118 + t * 0.027);
      const z = 0.311 + Math.sin(t * Math.PI) * 0.017;
      const w = 1.12 - t * 0.27;
      for (const weave of [-1, 1]) {
        b.sweep(bezier(
          [bx + weave * 0.034 * w, y + 0.025, z - 0.011],
          [bx + weave * 0.027 * w, y + 0.008, z + 0.025],
          [bx - weave * 0.013 * w, y - 0.026, z + 0.016],
        ), [0.029 * w, 0.028 * w, 0.023 * w], {
          color: (i + (weave > 0 ? 1 : 0)) % 2 ? hairLight : hair,
          bone: jaw, sides: 6, smooth: false,
          name: "interwovenBraidLock",
        });
        if (i % 2 === 0) {
          b.sweep(bezier(
            [bx + weave * 0.036 * w, y + 0.02, z + 0.012],
            [bx + weave * 0.025 * w, y + 0.002, z + 0.047],
            [bx - weave * 0.006 * w, y - 0.02, z + 0.036],
          ), [0.0033, 0.0018], {
            color: "#ed9951", bone: jaw, sides: 5, name: "braidCarvingHighlight",
          });
        }
      }
    }

    b.part(new THREE.CylinderGeometry(0.052, 0.046, 0.075, 8), brass, {
      at: [cuffX, 0.803, 0.292], bone: jaw, name: "octagonalBraidCuff",
    });
    torus(
      [cuffX, 0.835, 0.292], 0.051, 0.006,
      C.goldLight, jaw, [0, 1, 0], "braidCuffLip",
    );
    torus(
      [cuffX, 0.772, 0.292], 0.046, 0.006,
      C.goldLight, jaw, [0, 1, 0], "braidCuffLip",
    );
    frontArt([cuffX, 0.804, 0.345], 0.047, 0.061, knotTex, jaw, "braidKnotSeal");
    for (let j = 0; j < 3; j++)
      tuft(
        [cuffX + (j - 1) * 0.019, 0.768, 0.292],
        [cuffX + (j - 1) * 0.03, 0.682 + Math.abs(j - 1) * 0.022, 0.3],
        0.022, 0.024, j === 1 ? hairLight : hair, jaw, "braidTassel",
      );
  }

  // Compact barrel torso; layered clothing rather than a smooth green cylinder.
  const torso = b.loft([
    { at: [0, 0.62, 0], w: 0.55, h: 0.32 },
    { at: [0, 0.79, 0], w: 0.66, h: 0.42 },
    { at: [0, 1.015, -0.005], w: 0.68, h: 0.41 },
    { at: [0, 1.12, -0.005], w: 0.49, h: 0.32 },
  ], {
    color: wool, bone: spine, sides: 8, smooth: false, name: "barrelChestTunic",
  });
  ellipsoid([0, 0.64, 0], [0.29, 0.16, 0.18], leather, hips, "leatherBreeches");
  ellipsoid([0, 1.145, -0.014], [0.18, 0.087, 0.16], C.greenDark, neck, "standingCollar");

  const tunicSurface = b.surface(torso);
  for (const s of sides) {
    b.sweep(tunicSurface.drape([
      [s * 0.30, 1.04, 0.14],
      [s * 0.29, 0.89, 0.18],
      [s * 0.285, 0.77, 0.17],
    ], { lift: 0.005 }), 0.006, {
      color: "#7b8b65", bone: spine.joints[1], sides: 5, name: "tunicSidePiping",
    });
    b.extrude([
      [-0.125, 0], [0.125, 0], [0.115, -0.28], [0.025, -0.315], [-0.115, -0.27],
    ], {
      at: [s * 0.141, 0.71, 0.185],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035,
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

  // Heavy boots with planar bevels and a broad, readable toe.
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
    b.extrude([
      [-0.151, -0.048], [0.151, -0.048], [0.151, 0.025],
      [0.116, 0.071], [-0.116, 0.071], [-0.151, 0.025],
    ], {
      at: [s * 0.255, 0.178, 0.25],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.153, bevel: 0.008,
      color: steel, bone: foot, name: "chamferedArmouredToe",
    });
    box([s * 0.255, 0.139, 0.328], [0.29, 0.019, 0.015], brass, foot, "toeGoldEdge");
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
    frontArt([s * 0.24, 0.442, 0.164], 0.087, 0.13, knotTex, knee, "kneeKnotwork");
    for (const dx of [-0.105, 0.105])
      rivet([s * 0.255 + dx, 0.194, 0.329], foot, 0.013);
    for (let j = 0; j < 4; j++)
      box(
        [s * 0.255 + (j - 1.5) * 0.071, 0.099, 0.284],
        [0.046, 0.026, 0.078], C.ink, foot, "soleLug",
      );
    for (let j = 0; j < 2; j++)
      rod(
        [s * 0.255 - 0.055 + j * 0.085, 0.223, 0.329],
        [s * 0.255 - 0.031 + j * 0.085, 0.207, 0.329],
        0.0026, C.steelLight, foot, "toeScuff",
      );
  }

  // Sharply crowned shoulder shells, attached heraldry and exposed chain mail.
  for (const arm of arms) {
    const { s, chain, hand } = arm;
    const shoulder = chain.joints[0];
    const elbow = chain.joints[1];
    const wrist = chain.joints[2];

    const sleeve = b.sweep(chain, [0.142, 0.124, 0.09, 0.073], {
      color: wool, sides: 8, smooth: false, name: "woolSleeve",
    });
    b.decal(sleeve, mailTex, {
      at: [s * 0.591, 1.064, 0.137],
      dir: [0, 0, 1], size: [0.13, 0.17],
      bone: shoulder, lift: 0.002, name: "exposedSleeveMail",
    });
    ellipsoid(
      [s * 0.405, 1.105, -0.005], [0.233, 0.179, 0.248],
      C.deep, shoulder, "pauldronUnderRim",
    );
    const shell = b.part(new THREE.SphereGeometry(1, 8, 6), steel, {
      at: [s * 0.405, 1.148, -0.01],
      scale: [0.231, 0.167, 0.244],
      bone: shoulder, flat: true, name: "angularShoulderShell",
    });
    const shellSkin = b.surface(shell);
    const trimPath = shellSkin.drape([
      [s * 0.263, 1.145, 0.21],
      [s * 0.405, 1.239, 0.21],
      [s * 0.59, 1.145, 0.19],
    ], { lift: 0.009 });
    b.sweep(trimPath, 0.018, {
      color: brass, bone: shoulder, sides: 6, name: "pauldronRaisedTrim",
    });

    const lame = b.extrude([
      [-0.13, 0.065], [0.10, 0.06], [0.15, -0.03],
      [0.09, -0.105], [-0.11, -0.08],
    ], {
      at: [s * 0.463, 1.067, 0.166],
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.055,
      color: steel, bone: shoulder, bevel: 0.008,
      name: "overlappingShoulderLame",
    });
    b.extrude([
      [-0.12, 0.06], [0.10, 0.055], [0.14, -0.02],
      [0.08, -0.09], [-0.10, -0.065],
    ], {
      at: [s * 0.463, 1.069, -0.176],
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.045,
      color: steel, bone: shoulder, bevel: 0.006,
      name: "rearShoulderLame",
    });

    const shoulderSurface = b.surface([shell, lame]);
    b.decal(shoulderSurface, crestTex, {
      at: [s * 0.427, 1.116, 0.255],
      dir: [0, 0, 1], size: [0.153, 0.156],
      bone: shoulder, lift: 0.002, name: "seatedShoulderHeraldry",
    });
    for (let i = 0; i < 4; i++) {
      const hit = shoulderSurface.nearest([
        s * (0.30 + i * 0.076),
        1.08 - Math.abs(i - 1.5) * 0.008,
        0.245,
      ]);
      b.stick(new THREE.SphereGeometry(0.013, 8, 5), brass, hit, {
        embed: 0.35, scale: [1, 0.65, 1], name: "seatedShoulderRivet",
      });
    }

    // A single raised crown rib is more readable than tiny buried spikes.
    b.sweep(shellSkin.drape([
      [s * 0.29, 1.27, -0.06],
      [s * 0.40, 1.33, -0.06],
      [s * 0.575, 1.25, -0.06],
    ], { lift: 0.007 }), 0.012, {
      color: C.steelLight, bone: shoulder, sides: 4, name: "pauldronCrownRidge",
    });
    const peak = shellSkin.nearest([s * 0.49, 1.32, -0.065]);
    b.stick(new THREE.ConeGeometry(0.036, 0.076, 4), brass, peak, {
      embed: 0.18, spin: 45, name: "forgedShoulderStud",
    });
    b.sweep(shoulderSurface.drape([
      [s * 0.535, 1.118, 0.23],
      [s * 0.556, 1.10, 0.23],
    ], { lift: 0.003 }), 0.0028, {
      color: C.steelLight, bone: shoulder, sides: 5, name: "shoulderBattleNick",
    });

    ellipsoid([s * 0.632, 1.075, 0], [0.093, 0.116, 0.129], C.darkLeather, elbow, "elbowJoint");
    const bracer = b.part(new THREE.CylinderGeometry(0.133, 0.108, 0.193, 8), steel, {
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
    b.decal(bracer, knotTex, {
      at: [s * 0.745, 1.079, 0.16],
      dir: [0, 0, 1], size: [0.074, 0.109],
      bone: elbow, lift: 0.002, name: "seatedBracerKnot",
    });
    for (const dx of [-0.061, 0.061]) {
      const hit = b.surface(bracer).nearest([s * 0.745 + dx, 1.077, 0.16]);
      b.stick(new THREE.SphereGeometry(0.01, 8, 5), brass, hit, {
        embed: 0.4, scale: [1, 0.6, 1], name: "bracerRivet",
      });
    }

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

  // Campaign equipment behind and beside the silhouette.
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
    b.sweep([
      [s * 0.14, 0.78, -0.341],
      [s * 0.14, 1.01, -0.377],
      [s * 0.14, 1.085, -0.35],
    ], () => [0.018, 0.009], {
      color: C.darkLeather, bone: spine.joints[1], sides: 4, name: "packVerticalStrap",
    });
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

  // Blunderbuss. The bore, flare and muzzle fittings remain open.
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
  b.part(new THREE.CylinderGeometry(0.08, 0.076, 0.24, 8), steel, {
    at: [gx, 1.208, 0.425], bone: weapon, dir: [0, 0, 1], name: "barrelShaft",
  });

  const boreMetal = paint((_p, n) => n.y > 0.3 ? "#354953" : "#23333d");
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
    [0.057, 0.1],
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
  for (const z of [0.098, 0.315])
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.036, 8), brass, {
      at: [gx, 1.208, z], bone: weapon, dir: [0, 0, 1], name: "breechBinding",
    });
  for (const [z, r] of [[0.553, 0.081], [0.691, 0.098]]) {
    b.lathe([
      [r - 0.005, -0.019],
      [r + 0.009, -0.019],
      [r + 0.012, -0.012],
      [r + 0.012, 0.012],
      [r + 0.009, 0.019],
      [r - 0.005, 0.019],
    ], {
      at: [gx, 1.208, z], axis: [0, 0, 1], segments: 12,
      color: brass, bone: weapon, name: "hollowBarrelBinding",
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

  // Shortened and lowered: the brass ramrod tip no longer intrudes into the bore.
  rod([gx, 1.08, 0.25], [gx, 1.08, 0.641], 0.014, wood, weapon, "ramrod");
  for (const z of [0.335, 0.563])
    box([gx, 1.112, z], [0.05, 0.071, 0.033], brass, weapon, "ramrodThimble");
  ellipsoid([gx, 1.08, 0.653], [0.023, 0.023, 0.028], brass, weapon, "ramrodTip");
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

  // A small mountain shelf, with snow driven into lee-side drifts.
  b.part(new THREE.CylinderGeometry(0.92, 0.95, 0.075, 10), C.deep, {
    at: [0, 0.0375, 0.1], scale: [1.13, 1, 0.8],
    bone: hips, name: "darkDisplayPlinth",
  });
  b.part(new THREE.CylinderGeometry(0.9, 0.92, 0.028, 10), stone, {
    at: [0, 0.08, 0.1], scale: [1.13, 1, 0.8],
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
    const rock = b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
      at: [x, y, z], scale: [sx, sy, sz],
      rotation: [random() * 15, random() * 90, random() * 12],
      bone: hips, flat: true, name: "brokenShale",
    });
    const top = b.surface(rock).nearest([x - sx * 0.1, y + sy * 1.3, z]);
    b.stick(new THREE.SphereGeometry(1, 8, 5), snowPaint, top, {
      scale: [sx * 0.76, sy * 0.22, sz * 0.77],
      embed: 0.35, name: "snowSettledOnShale",
    });
  }

  function drift(x: number, z: number, sx: number, sz: number, turn: number) {
    const points = [
      [-1, -0.25], [-0.72, -0.66], [-0.25, -0.82],
      [0.12, -0.61], [0.57, -0.73], [0.94, -0.36],
      [1, 0.06], [0.56, 0.23], [0.29, 0.6],
      [-0.13, 0.48], [-0.52, 0.73], [-0.86, 0.4],
    ].map(([u, v]) => [u * sx, v * sz]);
    const a = turn * Math.PI / 180;
    b.extrude(points, {
      at: [x, 0.099, z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [Math.sin(a), 0, -Math.cos(a)],
      thickness: 0.009, bevel: 0.002,
      color: snowPaint, bone: hips, name: "irregularWindDrift",
    });
  }
  drift(-0.51, -0.24, 0.32, 0.21, -15);
  drift(0.56, -0.27, 0.32, 0.2, 12);
  drift(0.76, 0.18, 0.15, 0.25, -18);
  drift(-0.71, 0.26, 0.17, 0.21, 22);
  drift(0.5, 0.48, 0.22, 0.1, -12);
  drift(-0.26, 0.56, 0.19, 0.07, 7);

  for (const path of [
    [[-0.88, 0.096, 0.02], [-0.62, 0.096, 0.06], [-0.48, 0.096, 0.18]],
    [[0.40, 0.096, 0.35], [0.56, 0.096, 0.31], [0.63, 0.096, 0.42]],
    [[-0.16, 0.096, -0.40], [0.02, 0.096, -0.29], [0.19, 0.096, -0.33]],
  ]) {
    b.sweep(path, 0.003, {
      color: "#405765", bone: hips, sides: 4, name: "slateFissure",
    });
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
      at: [-0.48 - i * 0.08, 0.113, 0.4 + i * 0.025],
      bone: hips, dir: [1, 0, i % 2 ? 0.35 : -0.25], name: "spentBrassCase",
    });
  }
  box([0.52, 0.157, -0.29], [0.15, 0.12, 0.12], darkMetal, hips, "powderTin");
  box([0.52, 0.221, -0.29], [0.158, 0.018, 0.128], brass, hips, "powderTinLid");
  frontArt([0.52, 0.16, -0.228], 0.078, 0.091, ammoTex, hips, "powderTinMark");

  box([0, 0.063, 0.842], [0.55, 0.109, 0.062], brass, hips, "nameplateFrame");
  frontArt([0, 0.063, 0.875], 0.521, 0.096, plaqueTex, hips, "nameplate");
  for (const s of sides)
    rivet([s * 0.253, 0.063, 0.879], hips, 0.008, C.goldLight);

  return b.root;
}
