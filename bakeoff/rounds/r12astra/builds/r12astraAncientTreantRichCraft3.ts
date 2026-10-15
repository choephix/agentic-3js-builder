import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  paint,
  grain,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import type { Fill, Joint, Frame, PointInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Thornwarden, the Elder of the Wild",
  description:
    "An ancient walking oak guardian: massive interlocking bark, root hands and feet, a fierce amber gaze, living emerald crown, and an old luminous heartwood seal.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Thornwarden", paintSize: 2048 });
  const random = rng(71243);

  const C = {
    bark: "#684232",
    dark: "#302b29",
    cleft: "#211e24",
    wood: "#9c6943",
    edge: "#bb8953",
    pale: "#d2ac72",
    root: "#42362f",
    moss: "#526c36",
    mossLight: "#829749",
    green: "#28573f",
    jade: "#397b4e",
    leaf: "#56924d",
    lime: "#91ad54",
    vein: "#b6c66b",
    amber: "#ffc24d",
    heart: "#7ce5b5",
    fungus: "#b06b43",
    fungusEdge: "#ddac73",
  };

  const woodGrain = grain("#745039", "#a37749", {
    size: 0.065,
    axis: "y",
    seed: 6,
  });
  const bark = paint((p, n) => {
    if (p.y < 0.34) return mix("#302d29", "#594634", noise(p, 0.19, 8));
    if (n.y > 0.66 && noise(p, 0.35, 4) > 0.58) return C.moss;
    return woodGrain;
  });
  const barkDark = grain("#3d302c", "#654533", {
    size: 0.085,
    axis: "y",
    seed: 11,
  });
  const barkLight = grain("#956542", "#c1965f", {
    size: 0.055,
    axis: "y",
    seed: 22,
  });
  const mossPaint = paint((p, n) =>
    mix("#3a5a35", "#8d9b49", noise(p, 0.12, 5) * 0.65 + Math.max(0, n.y) * 0.2),
  );

  // Drawings are shared between all occurrences of a motif.
  const eyeTex = svg(
    `<svg viewBox="0 0 160 70">
      <path d="M6 17L54 25L150 8L128 48L76 60L24 46Z" fill="#201e20"/>
      <path d="M16 23L58 31L139 16L121 43L77 52L31 41Z" fill="#c16c20"/>
      <path d="M24 26L60 34L129 23L115 39L77 46L36 37Z" fill="#ffc340"/>
      <path d="M53 33L82 31L103 27L94 43L73 46Z" fill="#fff2ad"/>
      <path d="M78 31L87 30L84 46L77 46Z" fill="#594128"/>
      <path d="M29 28L58 36L70 35" fill="none" stroke="#fff5c4" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const runeTex = svg(
    `<svg viewBox="0 0 180 240">
      <path d="M90 13L151 64L151 161L90 224L29 161L29 64Z"
        fill="none" stroke="#193a31" stroke-width="15"/>
      <path d="M90 13L151 64L151 161L90 224L29 161L29 64Z"
        fill="none" stroke="#79b98a" stroke-width="5"/>
      <path d="M90 39V191M90 91L57 67M90 91L123 67M90 130L54 103
        M90 130L126 103M90 171L58 144M90 171L122 144"
        fill="none" stroke="#1f3b31" stroke-width="17" stroke-linejoin="bevel"/>
      <path d="M90 39V191M90 91L57 67M90 91L123 67M90 130L54 103
        M90 130L126 103M90 171L58 144M90 171L122 144"
        fill="none" stroke="#b8f3c3" stroke-width="6" stroke-linejoin="bevel"/>
      <path d="M90 23L98 34L90 44L82 34Z M90 196L98 206L90 216L82 206Z"
        fill="#e4ffd5"/>
      <circle cx="39" cy="79" r="4" fill="#c6ecc0"/>
      <circle cx="141" cy="79" r="4" fill="#c6ecc0"/>
      <circle cx="39" cy="150" r="4" fill="#c6ecc0"/>
      <circle cx="141" cy="150" r="4" fill="#c6ecc0"/>
    </svg>`,
    { size: 512 },
  );

  const fissureTex = svg(
    `<svg viewBox="0 0 120 240">
      <g fill="none" stroke-linecap="square">
        <path d="M33 4L41 38L29 67L42 102L35 140L46 170L36 235"
          stroke="#302820" stroke-width="8"/>
        <path d="M40 8L48 38L36 67L49 102L42 140L53 170L43 233"
          stroke="#c2975e" stroke-width="3"/>
        <path d="M88 12L78 57L89 84L77 130L84 182L74 229"
          stroke="#352922" stroke-width="6"/>
        <path d="M93 14L84 57L95 84L83 130L90 182L80 226"
          stroke="#b58a54" stroke-width="3"/>
        <path d="M42 102L19 117L14 146M77 130L102 151L109 181
          M29 67L15 48M84 182L99 199"
          stroke="#403023" stroke-width="4"/>
      </g>
      <path d="M57 150Q44 175 59 200Q75 174 57 150Z"
        fill="#654532" stroke="#bb9058" stroke-width="3"/>
      <path d="M59 163Q52 176 59 186Q66 174 59 163Z" fill="#342823"/>
    </svg>`,
    { size: 384 },
  );

  const ringsTex = svg(
    `<svg viewBox="0 0 160 160">
      <path d="M79 4L120 14L149 51L155 94L128 139L77 155L32 140L6 99L10 49L41 14Z"
        fill="#b88d56"/>
      <g fill="none" stroke="#6b4c32" stroke-width="4">
        <path d="M78 17Q127 12 142 65Q157 114 105 140Q53 157 23 111Q2 65 42 31Z"/>
        <path d="M78 33Q114 23 127 65Q141 107 102 124Q58 144 37 104Q18 66 53 43Z"/>
        <path d="M78 49Q110 39 111 76Q120 104 89 111Q55 120 51 91Q39 67 66 58Z"/>
        <path d="M78 65Q97 59 97 80Q104 97 81 98Q64 99 65 81Z"/>
      </g>
      <path d="M80 77L68 94L83 88Z M126 23L109 48L116 62 M22 120L46 105L57 112
        M106 146L99 126L89 119" fill="none" stroke="#49382a" stroke-width="5"/>
      <path d="M32 38Q58 20 84 22M31 88Q29 114 50 123"
        fill="none" stroke="#e3bc7c" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const leafTex = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M49 156L47 118L13 110L4 88L23 86L5 62L28 64L20 38L40 48L48 5
        L63 45L80 28L78 57L97 53L83 78L99 88L82 110L56 120L54 157Z"
        fill="#4d8748" stroke="#254a36" stroke-width="4"/>
      <path d="M49 132L49 27L58 58L76 45L66 73L85 68L68 93L84 95L55 112Z"
        fill="#80aa52"/>
      <path d="M50 145L50 29M50 108L22 96M50 86L24 70M51 69L35 51
        M52 108L77 96M52 85L75 68M52 64L65 49"
        fill="none" stroke="#bfd078" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const lichenTex = svg(
    `<svg viewBox="0 0 160 100">
      <g fill="#82954c" stroke="#516d3a" stroke-width="3">
        <path d="M12 49L21 31L40 35L45 17L62 24L69 11L83 24L105 19L111 39
          L135 34L148 50L133 62L142 77L116 79L105 90L87 80L70 92L54 78
          L32 86L25 67L9 64Z"/>
      </g>
      <g fill="#b5b767">
        <path d="M25 47L39 40L48 49L39 57Z M60 31L72 26L80 34L69 42Z
          M98 39L107 31L116 44L105 51Z M65 62L78 52L89 64L78 74Z
          M110 66L126 56L133 66L123 73Z M38 68L47 62L55 72L44 76Z"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Skeleton. The body's rest pose leaves every branch-digit free.
  const hips = b.joint("hips", {
    at: [0, 1.75, -0.03],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.75, -0.03], [0, 2.65, 0], [0, 3.55, -0.08], [0, 4.05, 0.06]],
    { parent: hips, names: ["waist", "chest", "neck"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 4.36, 0.25],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 4.03, 0.49],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1];
  const limbData = sides.map((s) => {
    const suffix = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${suffix}`,
      [[s * 0.52, 1.95, -0.05], [s * 0.77, 1.06, 0.16], [s * 0.83, 0.3, 0.02]],
      {
        parent: hips,
        names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`],
        role: "leg",
        contact: [s * 0.83, 0, 0.23],
      },
    );
    const arm = b.chain(
      `arm${suffix}`,
      [[s * 0.81, 3.72, -0.02], [s * 1.62, 3.53, -0.02], [s * 2.43, 3.33, 0.05]],
      {
        parent: spine.joints[1],
        names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${suffix}`, {
      parent: arm.tip!,
      at: [s * 2.63, 3.3, 0.09],
      dir: [s, 0, 0],
      role: "arm",
    });
    const fingers = [-1, 0, 1].map((i) =>
      b.chain(
        `finger${i + 2}${suffix}`,
        [
          [s * 2.74, 3.3 + i * 0.2, 0.13],
          [s * 3.12, 3.3 + i * 0.32, 0.17],
          [s * (3.47 - Math.abs(i) * 0.12), 3.3 + i * 0.52, 0.18],
        ],
        { parent: hand, count: 2, role: "digit" },
      ),
    );
    const thumb = b.chain(
      `thumb${suffix}`,
      [[s * 2.53, 3.15, 0.25], [s * 2.63, 2.85, 0.43], [s * 2.91, 2.58, 0.46]],
      { parent: hand, count: 2, role: "digit" },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `rootToe${i + 2}${suffix}`,
        [
          [s * 0.83 + i * 0.19, 0.25, 0.06],
          [s * 0.83 + i * 0.3, 0.14, 0.47],
          [s * 0.83 + i * 0.41, 0.095, 0.82 - Math.abs(i) * 0.13],
        ],
        { parent: leg.tip!, count: 2, role: "digit" },
      ),
    );
    return { s, suffix, leg, arm, hand, fingers, thumb, toes };
  });

  const crownPaths = [
    [[0.43, 4.85, 0.03], [0.73, 5.4, -0.04], [1.18, 5.83, -0.06], [1.48, 6.12, 0.02]],
    [[0.16, 4.96, -0.12], [0.36, 5.63, -0.31], [0.42, 6.15, -0.32], [0.65, 6.65, -0.2]],
    [[0.57, 4.73, -0.28], [1.02, 5.05, -0.55], [1.48, 5.3, -0.64], [1.88, 5.66, -0.62]],
  ];
  const crownData = sides.flatMap((s) =>
    crownPaths.map((points, i) => {
      const path = points.map(([x, y, z]) => [s * x, y + (s < 0 && i === 1 ? -0.16 : 0), z]);
      return {
        s,
        i,
        path,
        chain: b.chain(`crown${s > 0 ? "L" : "R"}${i + 1}`, path, {
          parent: head,
          count: 3,
          role: "fan",
        }),
      };
    }),
  );

  // Reusable primitive assemblies.
  function ellipsoid(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    detail = 1,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at, scale: size, bone, name, flat: true,
    });
  }

  function plate(
    on: Frame,
    width: number,
    height: number,
    thickness: number,
    color: Fill = bark,
    name = "barkPlate",
  ) {
    return b.extrude(
      [
        [-width * 0.43, height * 0.44],
        [-width * 0.1, height * 0.54],
        [width * 0.41, height * 0.4],
        [width * 0.5, height * 0.06],
        [width * 0.26, -height * 0.3],
        [width * 0.06, -height * 0.56],
        [-width * 0.3, -height * 0.35],
        [-width * 0.49, -height * 0.01],
      ],
      {
        at: on,
        x: on.dir([1, 0, 0]),
        y: on.dir([0, 0, 1]),
        thickness,
        bevel: thickness * 0.22,
        color,
        bone: on.bone!,
        name,
      },
    );
  }

  function frontPlate(
    at: number[],
    width: number,
    height: number,
    thickness: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    const f = frame(at, [0, 0, 1], [0, 1, 0]);
    return b.extrude(
      [
        [-width * 0.45, height * 0.36],
        [-width * 0.23, height * 0.5],
        [width * 0.36, height * 0.43],
        [width * 0.5, height * 0.06],
        [width * 0.21, -height * 0.36],
        [-width * 0.03, -height * 0.53],
        [-width * 0.36, -height * 0.23],
      ],
      {
        at: f.at, x: [1, 0, 0], y: [0, 1, 0],
        thickness, bevel: thickness * 0.2, bone, color, name,
      },
    );
  }

  function cutEnd(at: PointInput, dir: number[], radius: number, bone: Joint) {
    b.part(new THREE.CylinderGeometry(radius, radius * 1.08, 0.055, 9), barkDark, {
      at, dir, bone, name: "brokenBranchRim",
    });
    const p = at instanceof THREE.Vector3 ? at.clone() : new THREE.Vector3(...(at as [number, number, number]));
    const normal = new THREE.Vector3(...(dir as [number, number, number])).normalize();
    p.addScaledVector(normal, 0.029);
    b.part(new THREE.CircleGeometry(radius * 0.93, 9), "#ffffff", {
      at: p, dir, axis: "z", bone, texture: ringsTex, name: "exposedGrowthRings",
    });
  }

  function twig(points: number[][], radius: number, bone: Joint, color: Fill = bark) {
    return b.sweep(points, [radius, radius * 0.65, 0.012], {
      bone, color, sides: 6, smooth: false, caps: "flat", name: "angularTwig",
    });
  }

  function leafSpray(at: number[], size: number, bone: Joint, phase: number) {
    const colors = [C.green, C.jade, C.leaf];
    ellipsoid(at, [size, size * 0.43, size * 0.68], colors[phase % 3], bone, "facetedLeafMass", 0);
    const angles = [-1.0, -0.45, 0.15, 0.8];
    angles.forEach((a, i) => {
      const direction = [Math.sin(a + phase) * 0.6, 0.75 + i * 0.04, Math.cos(a + phase) * 0.6];
      const leafFrame = frame(
        [at[0] + Math.sin(a + phase) * size * 0.45, at[1] + size * 0.13, at[2] + Math.cos(a + phase) * size * 0.35],
        direction,
      );
      b.cards([leafFrame], leafTex, {
        size: [size * 0.61, size * 0.95],
        lean: 48,
        flow: [Math.sin(a + phase), 0.1, Math.cos(a + phase)],
        bone,
        name: "oakLeafSpray",
      });
    });
  }

  function vine(points: number[][], bone: Joint, radius = 0.026) {
    return b.sweep(catmull(points), radius, {
      color: C.moss, bone, sides: 6, name: "livingVine",
    });
  }

  // The simple underlying timber volumes.
  const torso = b.loft(
    [
      { at: [0, 1.73, -0.03], w: 1.02, h: 0.76 },
      { at: [0, 2.28, -0.03], w: 1.13, h: 0.87 },
      { at: [0, 2.95, -0.04], w: 1.49, h: 1.03 },
      { at: [0, 3.58, -0.08], w: 1.86, h: 1.03 },
      { at: [0, 3.98, 0.02], w: 1.05, h: 0.8 },
    ],
    { bone: [hips, spine], section: { ngon: 8 }, color: barkDark, caps: "flat", name: "ancientTrunk" },
  );
  const trunkSkin = b.surface(torso);

  // Long overlapping plates are the trunk's silhouette, not a noisy coat of spikes.
  for (const s of sides) {
    const pectoral = trunkSkin.nearest([s * 0.53, 3.36, 0.7]);
    plate(pectoral, 0.64, 1.12, 0.19, bark, "greatChestBark");
    plate(trunkSkin.nearest([s * 0.4, 2.59, 0.6]), 0.46, 0.96, 0.17, barkLight, "abdominalBark");
    plate(trunkSkin.nearest([s * 0.53, 1.98, 0.47]), 0.42, 0.84, 0.17, bark, "hangingRootSkirt");
    plate(trunkSkin.nearest([s * 0.83, 3.15, -0.04]), 0.58, 1.18, 0.17, bark, "flankBark");
    plate(trunkSkin.nearest([s * 0.61, 2.47, -0.05]), 0.41, 0.9, 0.16, barkDark, "waistBark");
    plate(trunkSkin.nearest([s * 0.56, 3.19, -0.65]), 0.62, 1.26, 0.2, bark, "backBark");
    plate(trunkSkin.nearest([s * 0.37, 2.24, -0.5]), 0.48, 0.94, 0.15, barkLight, "lowerBackBark");
  }

  const heartPlate = frontPlate(
    [0, 2.96, 0.55], 0.66, 1.14, 0.16, barkDark, spine.joints[1], "heartwoodSeal",
  );
  glow(
    b.decal(heartPlate, runeTex, {
      at: [0, 2.99, 0.65],
      dir: [0, 0, 1],
      size: [0.48, 0.83],
      bone: spine.joints[1],
      lift: 0.005,
      name: "ancientLivingRune",
    }),
    0.8,
  );
  for (const s of sides) {
    b.decal(torso, fissureTex, {
      at: [s * 0.43, 2.74, 0.52],
      dir: [s * 0.25, 0, 1],
      size: [0.27, 1.33],
      name: "deepTrunkFissures",
    });
  }

  // Oversized, squared-off wooden head.
  const skull = b.loft(
    [
      { at: [0, 4.05, 0.31], w: 0.89, h: 0.84 },
      { at: [0, 4.46, 0.29], w: 1.39, h: 1.13 },
      { at: [0, 4.87, 0.2], w: 1.32, h: 1.0 },
      { at: [0, 5.03, 0.12], w: 0.93, h: 0.75 },
    ],
    { bone: head, section: { ngon: 8 }, caps: "flat", color: bark, name: "elderSkull" },
  );
  const skullSkin = b.surface(skull);

  for (const s of sides) {
    // Dark angular sockets and luminous inset eyes.
    const socket = [
      [-0.24, 0.075], [-0.03, 0.045], [0.23, 0.14],
      [0.19, -0.065], [-0.06, -0.12], [-0.22, -0.04],
    ];
    b.extrude(socket, {
      at: [s * 0.36, 4.53, 0.866],
      x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.11, color: C.cleft, bone: head, name: "deepEyeSocket",
    });
    const eyeGeo = new THREE.PlaneGeometry(0.48, 0.21);
    if (s < 0) {
      const uv = eyeGeo.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    glow(
      b.part(eyeGeo, "#ffffff", {
        at: [s * 0.36, 4.535, 0.928],
        texture: eyeTex, bone: head, name: `amberEye${s > 0 ? "L" : "R"}`,
      }),
      1.6,
    );

    b.extrude(
      [[-0.23, -0.025], [-0.25, 0.13], [0.16, 0.22], [0.34, 0.16], [0.24, 0.035], [0.02, 0.015]],
      {
        at: [s * 0.34, 4.65, 0.88], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.25, bevel: 0.035, color: barkLight, bone: head, name: "heavyAngryBrow",
      },
    );
    frontPlate([s * 0.61, 4.31, 0.76], 0.32, 0.59, 0.21, barkLight, head, "angularCheek");
    frontPlate([s * 0.49, 4.02, 0.7], 0.23, 0.48, 0.17, barkDark, head, "sideWhiskerBark");

    // Short swept-back temple horns grow into the crown.
    twig(
      [[s * 0.58, 4.65, 0.29], [s * 0.91, 4.87, 0.19], [s * 1.04, 5.2, 0.09]],
      0.15, head, barkLight,
    );
  }

  // Central ridge and a long, stern, carved nose.
  frontPlate([0, 4.85, 0.76], 0.31, 0.63, 0.17, barkDark, head, "foreheadKeystone");
  b.extrude(
    [[-0.115, 0.27], [0.105, 0.28], [0.13, -0.12], [0.23, -0.23], [0.08, -0.33], [-0.15, -0.27]],
    {
      at: [0, 4.43, 0.94], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.29, bevel: 0.025, color: barkLight, bone: head, name: "ancientLongNose",
    },
  );
  for (const s of sides) {
    b.sweep(
      [[s * 0.07, 4.18, 1.0], [s * 0.3, 4.135, 1.02], [s * 0.54, 4.22, 0.91]],
      [0.11, 0.13, 0.035],
      { color: barkLight, bone: head, sides: 5, smooth: false, name: "upperJawRootMoustache" },
    );
    b.part(new THREE.BoxGeometry(0.08, 0.045, 0.035), C.cleft, {
      at: [s * 0.13, 4.205, 1.1], bone: head, name: "nostril",
    });
  }
  b.part(new THREE.BoxGeometry(0.66, 0.16, 0.21), C.cleft, {
    at: [0, 4.025, 0.91], bone: head, name: "mouthInterior",
  });
  frontPlate([0, 3.9, 0.82], 0.84, 0.35, 0.3, bark, jaw, "separateLowerJaw");
  for (let i = 0; i < 4; i++) {
    b.extrude(
      [[-0.045, -0.04], [0.045, -0.04], [0.037, 0.06], [-0.02, 0.08]],
      {
        at: [-0.22 + i * 0.145, 3.99, 1.0],
        x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08,
        color: i % 2 ? C.wood : C.pale, bone: jaw, name: "splinterTooth",
      },
    );
  }

  // A solid beard silhouette, subdivided into five broad wood splinters.
  frontPlate([0, 3.68, 0.73], 0.76, 0.71, 0.24, barkDark, jaw, "beardMass");
  for (let i = -2; i <= 2; i++) {
    const h = 0.63 - Math.abs(i) * 0.11;
    const beard = frontPlate(
      [i * 0.15, 3.68 + Math.abs(i) * 0.06, 0.85 - Math.abs(i) * 0.035],
      0.23, h, 0.16,
      i % 2 === 0 ? barkLight : bark,
      jaw, "beardSplinter",
    );
    if (i % 2 === 0) {
      b.decal(beard, fissureTex, {
        at: [i * 0.15, 3.69 + Math.abs(i) * 0.06, 0.95],
        dir: [0, 0, 1], size: [0.13, h * 0.75], bone: jaw, name: "beardGrain",
      });
    }
  }

  // Head scars and pale lichen remain subordinate to the eyes.
  b.decal(skull, fissureTex, {
    at: [0.01, 4.94, 0.71], dir: [0, 0, 1],
    size: [0.19, 0.36], bone: head, name: "foreheadAgeLines",
  });
  b.decal(skull, lichenTex, {
    at: [-0.62, 4.73, 0.41], dir: [-1, 0.1, 0.4],
    size: [0.37, 0.24], bone: head, name: "templeLichen",
  });

  // Arms, legs, root digits and bark gauntlets.
  for (const d of limbData) {
    const { s, leg, arm, hand, fingers, thumb, toes } = d;
    const legTube = b.sweep(leg, [0.39, 0.32, 0.22], {
      color: barkDark, sides: 7, smooth: false, name: "rootLeg",
    });
    const legSkin = b.surface(legTube);
    plate(legSkin.nearest([s * 0.69, 1.57, 0.55]), 0.49, 0.91, 0.2, bark, "thighBark");
    plate(legSkin.nearest([s * 0.78, 0.64, 0.44]), 0.43, 0.71, 0.18, barkLight, "shinBark");
    plate(legSkin.nearest([s * 1.08, 1.16, 0.13]), 0.4, 0.7, 0.15, bark, "outerKneeBark");
    ellipsoid([s * 0.77, 1.08, 0.35], [0.3, 0.29, 0.23], barkLight, leg.joints[1], "knottedKnee");
    frontPlate([s * 0.77, 1.1, 0.53], 0.31, 0.35, 0.08, barkDark, leg.joints[1], "kneeKnot");
    b.decal(legTube, fissureTex, {
      at: [s * 0.83, 0.67, 0.28], dir: [0, 0, 1],
      size: [0.23, 0.67], name: "shinGrain",
    });
    ellipsoid([s * 0.83, 0.24, 0.08], [0.35, 0.24, 0.35], barkDark, leg.tip!, "rootFoot");
    for (const toe of toes) {
      b.sweep(toe, [0.16, 0.13, 0.075], {
        color: bark, sides: 6, smooth: false, caps: "flat", name: "splayedRootToe",
      });
      b.spike(toe.at(0.9), [0, -0.1, 1], 0.16, 0.075, {
        color: C.root, bone: toe.joints[1], sides: 5, name: "rootToeTip",
      });
    }
    b.sweep(
      [[s * 0.83, 0.24, -0.03], [s * 1.02, 0.14, -0.36], [s * 1.1, 0.08, -0.62]],
      [0.17, 0.11, 0.02],
      { bone: leg.tip!, color: barkDark, sides: 6, smooth: false, caps: "flat", name: "heelRoot" },
    );

    const armTube = b.sweep(arm, [0.43, 0.29, 0.23], {
      color: barkDark, sides: 7, smooth: false, name: "greatBranchArm",
    });
    const armSkin = b.surface(armTube);
    plate(armSkin.nearest([s * 1.22, 3.68, 0.43]), 0.53, 0.73, 0.19, bark, "upperArmBark");
    plate(armSkin.nearest([s * 1.96, 3.42, 0.38]), 0.55, 0.67, 0.2, barkLight, "forearmBark");
    plate(armSkin.nearest([s * 1.96, 3.48, -0.35]), 0.53, 0.75, 0.19, bark, "rearForearmBark");

    ellipsoid([s * 1.02, 3.78, -0.02], [0.58, 0.47, 0.49], bark, arm.joints[0], "massiveShoulder");
    frontPlate([s * 1.03, 3.87, 0.39], 0.73, 0.61, 0.2, barkLight, arm.joints[0], "shoulderShield");
    ellipsoid([s * 1.09, 4.09, -0.12], [0.52, 0.16, 0.42], mossPaint, arm.joints[0], "shoulderMoss");
    ellipsoid([s * 1.64, 3.54, 0.02], [0.31, 0.29, 0.3], bark, arm.joints[1], "elbowKnot");

    b.sweep(
      [[s * 1.0, 3.91, -0.1], [s * 1.26, 4.37, -0.14], [s * 1.57, 4.65, -0.13]],
      [0.2, 0.13, 0.055],
      { bone: arm.joints[0], color: bark, sides: 6, smooth: false, name: "shoulderBranch" },
    );
    twig(
      [[s * 1.25, 4.34, -0.14], [s * 1.04, 4.59, -0.1], [s * 1.0, 4.8, -0.08]],
      0.075, arm.joints[0],
    );
    leafSpray([s * 1.55, 4.61, -0.13], 0.41, arm.joints[0], s > 0 ? 1 : 2);

    b.sweep(
      [[s * 1.66, 3.55, -0.15], [s * 1.81, 3.78, -0.41], [s * 1.97, 3.89, -0.48]],
      [0.14, 0.1, 0.08],
      { bone: arm.joints[1], color: barkLight, sides: 7, smooth: false, caps: "flat", name: "brokenElbowBranch" },
    );
    cutEnd([s * 1.97, 3.89, -0.48], [s * 0.7, 0.5, -0.3], 0.08, arm.joints[1]);

    ellipsoid([s * 2.65, 3.3, 0.09], [0.36, 0.36, 0.25], bark, hand, "hugeRootPalm");
    frontPlate([s * 2.66, 3.32, 0.3], 0.39, 0.59, 0.13, barkLight, hand, "palmBark");
    [...fingers, thumb].forEach((finger, i) => {
      const tube = b.sweep(finger, [i === 3 ? 0.13 : 0.14, 0.105, 0.052], {
        color: bark, sides: 6, smooth: false, caps: "flat", name: "articulatedBranchFinger",
      });
      const knuckle = finger.at(0.5);
      ellipsoid(knuckle, [0.135, 0.125, 0.13], barkLight, finger.joints[1], "fingerKnot", 0);
      const end = finger.at(1);
      b.spike(end, end, 0.15, 0.055, {
        bone: finger.joints[1], color: C.root, sides: 5, name: "fingerRootPoint",
      });
      plate(b.surface(tube).nearest([s * (i === 3 ? 2.72 : 3.12), i === 3 ? 2.87 : 3.3 + (i - 1) * 0.32, 0.4]),
        0.13, 0.24, 0.05, barkDark, "fingerBarkScale");
    });

    // Vines encircle but do not bridge any articulated joint.
    vine(
      [
        [s * 1.77, 3.68, 0.11], [s * 1.9, 3.55, 0.3],
        [s * 2.02, 3.25, 0.13], [s * 2.13, 3.27, -0.19],
        [s * 2.19, 3.55, -0.13], [s * 2.27, 3.55, 0.16],
      ],
      arm.joints[1], 0.027,
    );
    vine(
      [
        [s * 0.69, 0.91, 0.39], [s * 1.02, 0.74, 0.2],
        [s * 1.02, 0.58, -0.12], [s * 0.73, 0.47, -0.16],
        [s * 0.65, 0.38, 0.17],
      ],
      leg.joints[1], 0.032,
    );
    leafSpray([s * 2.16, 3.57, -0.1], 0.24, arm.joints[1], 4);
    b.decal(armTube, lichenTex, {
      at: [s * 1.87, 3.58, 0.22], dir: [0, 0.3, 1],
      size: [0.31, 0.17], name: "forearmLichen",
    });
  }

  // Crown: exposed antler-like timber supports a broken, asymmetrical canopy.
  for (const d of crownData) {
    const { s, i, chain, path } = d;
    const branch = b.sweep(chain, [0.24 - i * 0.025, 0.17, 0.09, 0.035], {
      color: i === 1 ? barkLight : bark,
      sides: 7, smooth: false, caps: "flat", name: "greatCrownBranch",
    });
    const p2 = path[2];
    const p3 = path[3];
    const forkTip = [p2[0] + s * (i === 1 ? -0.3 : 0.36), p2[1] + 0.39, p2[2] + 0.25];
    twig(
      [p2, [p2[0] + s * 0.12, p2[1] + 0.22, p2[2] + 0.18], forkTip],
      0.082, chain.joints[2], barkLight,
    );
    twig(
      [
        path[1],
        [path[1][0] - s * 0.18, path[1][1] + 0.22, path[1][2] - 0.18],
        [path[1][0] - s * 0.23, path[1][1] + 0.48, path[1][2] - 0.2],
      ],
      0.08, chain.joints[1],
    );

    leafSpray([p3[0], p3[1] + 0.025, p3[2]], i === 1 ? 0.48 : 0.56, chain.joints[2], i + (s > 0 ? 0 : 2));
    leafSpray(forkTip, i === 1 ? 0.33 : 0.4, chain.joints[2], i + 2);
    if (i !== 1) {
      leafSpray(
        [p2[0] - s * 0.12, p2[1] + 0.03, p2[2] - 0.12],
        0.4, chain.joints[1], i + 1,
      );
    }
    plate(branch.at(0.23, 35), 0.19, 0.52, 0.075, barkDark, "crownBarkPeel");
  }

  // Crest-root ribs tie the crown visibly into the head.
  for (const s of sides) {
    b.sweep(
      [[s * 0.22, 4.78, 0.65], [s * 0.31, 5.08, 0.42], [s * 0.45, 5.35, 0.05]],
      [0.13, 0.11, 0.035],
      { bone: head, color: barkLight, sides: 5, smooth: false, name: "foreheadRootRib" },
    );
    b.sweep(
      [[s * 0.55, 4.73, -0.1], [s * 0.74, 5.1, -0.3], [s * 0.7, 5.45, -0.47]],
      [0.12, 0.09, 0.025],
      { bone: head, color: barkDark, sides: 6, smooth: false, name: "rearCrownRoot" },
    );
  }

  // Small body-grown colonies: bracket fungi, hanging moss and tender shoots.
  function shelfFungus(x: number, y: number, z: number, radius: number, bone: Joint) {
    const cap = b.part(new THREE.SphereGeometry(1, 10, 5), C.fungus, {
      at: [x, y, z], scale: [radius, radius * 0.22, radius * 0.7],
      bone, flat: true, name: "shelfFungusCap",
    });
    b.part(new THREE.SphereGeometry(1, 10, 4), C.fungusEdge, {
      at: [x, y - radius * 0.09, z + radius * 0.015],
      scale: [radius * 1.025, radius * 0.09, radius * 0.71],
      bone, flat: true, name: "shelfFungusPaleRim",
    });
    return cap;
  }
  shelfFungus(0.76, 2.68, -0.21, 0.23, spine.joints[1]);
  shelfFungus(0.72, 2.44, -0.22, 0.17, spine.joints[0]);
  shelfFungus(0.69, 2.28, -0.2, 0.12, spine.joints[0]);
  shelfFungus(-0.53, 3.28, -0.53, 0.18, spine.joints[1]);
  shelfFungus(-0.57, 3.08, -0.54, 0.13, spine.joints[1]);

  for (const s of sides) {
    const shoulder = limbData.find((d) => d.s === s)!.arm.joints[0];
    for (let i = 0; i < 3; i++) {
      const x = s * (0.84 + i * 0.19);
      const y = 4.12 - i * 0.055;
      b.sweep(
        [[x, y, -0.41], [x + s * 0.035, y - 0.22, -0.45], [x - s * 0.02, y - 0.42 + i * 0.06, -0.42]],
        [0.045, 0.034, 0.008],
        { bone: shoulder, color: mossPaint, sides: 5, name: "hangingShoulderMoss" },
      );
    }
    vine(
      [[s * 0.48, 3.56, -0.47], [s * 0.37, 3.18, -0.6], [s * 0.24, 2.88, -0.58]],
      spine.joints[1], 0.038,
    );
  }

  // A few broad moss islands sit directly on the actual trunk surface.
  const mossHits = trunkSkin.scatter(12, {
    rng: random,
    minDist: 0.25,
    filter: (h) => h.n.z < 0.2 && h.at.y > 2.1 && h.n.y > -0.4,
  });
  for (const hit of mossHits) {
    b.stick(new THREE.IcosahedronGeometry(0.13, 0), mossPaint, hit, {
      scale: [1.4, 0.33, 1.0], embed: 0.3, name: "seatedMossIsland",
    });
  }

  // Sparse secondary twigs retain the old tree's broken, irregular outline.
  twig(
    [[-0.45, 3.35, -0.48], [-0.63, 3.9, -0.8], [-0.82, 4.26, -0.88]],
    0.14, spine.joints[1], barkDark,
  );
  twig(
    [[-0.63, 3.9, -0.8], [-0.37, 4.2, -0.98], [-0.29, 4.4, -1.05]],
    0.075, spine.joints[1],
  );
  cutEnd([-0.82, 4.26, -0.88], [-0.4, 0.9, -0.2], 0.045, spine.joints[1]);
  leafSpray([-0.29, 4.4, -1.05], 0.29, spine.joints[1], 3);

  return b.root;
}
