```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  noise,
  mix,
  svg,
  polyline,
} from "agentic-3js-builder";
import type {
  Joint,
  ColorInput,
  OutlinePoint,
  PointInput,
  DirectionInput,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pyroclast, the Cinder Warden",
  description:
    "An ancient volcanic guardian: fractured blue-black basalt, incandescent tectonic seams, a deeply set furnace heart and restrained gold seals, standing on a broken caldera.",
};

/*
1. Close the thin waist and disconnected-looking joints with interlocking stone.
   The creature should feel like a continuous mass, not a suit of robot armor.
2. Break the shoulder, crown and back silhouettes into larger irregular rock
   formations; lower and broaden the head for a heavier, more imposing face.
3. Replace the muddy unlit joint interiors with incandescent lava. Give cracks
   scorched borders and varied branching, and carry them around the sides.
4. Recess the heart within stone claws, reduce the jewelry-like gold, and use
   cleaner warm-lit/cool-shadow basalt planes for the fantasy-game art direction.
5. Replace the raised ground “cables” with flat molten fissures. Keep the stage
   quiet, with fewer rim ornaments and no floating embellishments.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Pyroclast",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(4819);

  const C = {
    socket: "#090d17",
    dark: "#182133",
    gold: "#b88b4d",
    orange: "#ff751b",
    ember: "#ed4c12",
    hot: "#ffc453",
    whiteHot: "#fff0b1",
  };

  // Broad, deliberately stepped illumination, with only a little stone grain.
  const basalt = paint((p, n) => {
    const light = n.x * 0.32 + n.y * 0.81 + n.z * 0.49;
    const grain = noise(p, 0.16, 17);
    const lit = mix("#46536a", "#67738a", grain * 0.46);
    const shade = mix("#172235", "#2c3950", grain * 0.48);
    const face = light > 0.28 ? lit : shade;
    return mix(face, "#805042", Math.max(0, -n.y) * 0.13);
  });
  const darkStone = paint((p, n) =>
    mix(
      "#111a29",
      "#354158",
      noise(p, 0.17, 43) * 0.36 + Math.max(0, n.y) * 0.19,
    ),
  );
  const brokenStone = paint((p, n) =>
    mix(
      n.y > 0.1 ? "#69768c" : "#414d63",
      "#a0a5af",
      noise(p, 0.12, 25) * 0.31,
    ),
  );
  const floorStone = paint((p, n) =>
    mix("#242737", n.y > 0.4 ? "#585365" : "#363c4e", noise(p, 0.29, 7) * 0.6),
  );
  const oldGold = paint((p, n) =>
    mix("#80552e", "#d7ad66", noise(p, 0.05, 8) * 0.42 + Math.max(0, n.y) * 0.25),
  );

  function drawing(body: string, viewBox = "0 0 100 100", size = 384) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`,
      { size },
    );
  }

  const eyeTexture = drawing(`
    <defs>
      <linearGradient id="fire" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#fa5810"/>
        <stop offset=".45" stop-color="#ffb936"/>
        <stop offset="1" stop-color="#fff4b4"/>
      </linearGradient>
    </defs>
    <path d="M3 13 L96 29 L78 78 L22 61 Z" fill="#a52b12"/>
    <path d="M9 18 L88 32 L74 68 L25 54 Z" fill="url(#fire)"/>
    <path d="M52 28 L63 30 L55 62 L45 60 Z" fill="#fff5b9"/>
    <path d="M12 20 L86 33" stroke="#fff4bb" stroke-width="5" fill="none"/>
  `);

  const heartTexture = drawing(`
    <path d="M50 3 L91 36 L78 78 L50 97 L22 78 L9 36 Z"
      fill="#151a24" stroke="#70482e" stroke-width="4"/>
    <path d="M50 11 L82 39 L50 87 L18 39 Z"
      fill="none" stroke="#ef6417" stroke-width="7"/>
    <path d="M50 17 L72 40 L50 77 L28 40 Z" fill="#ffb32d"/>
    <path d="M50 25 L61 41 L50 62 L39 41 Z" fill="#ffe69c"/>
    <path d="M20 58 L31 78 M80 58 L69 78 M39 87 L50 96 L61 87"
      stroke="#ae7c42" stroke-width="3" fill="none"/>
    <path d="M11 34 L18 26 M89 34 L82 26" stroke="#d9ad65" stroke-width="3"/>
  `);

  const inscriptionTexture = drawing(`
    <g fill="none" stroke-linejoin="miter">
      <path d="M15 11 L15 84 L29 96 M85 11 L85 84 L71 96"
        stroke="#101726" stroke-width="9"/>
      <path d="M15 11 L15 84 L29 96 M85 11 L85 84 L71 96"
        stroke="#a8783e" stroke-width="3"/>
      <path d="M50 11 L68 33 L50 55 L32 33 Z M50 23 L59 33 L50 43 L41 33 Z"
        stroke="#d6ad64" stroke-width="3"/>
      <path d="M50 57 L50 85 M37 66 L50 77 L63 66 M38 87 L50 97 L62 87"
        stroke="#bc904f" stroke-width="3"/>
      <path d="M25 11 L29 16 M75 11 L71 16" stroke="#e5cc93" stroke-width="3"/>
    </g>
  `);

  function crackDrawing(path: string, branch: string) {
    return drawing(`
      <path d="${path} ${branch}" stroke="#0d111b" stroke-width="15"
        fill="none" stroke-linejoin="miter"/>
      <path d="${path} ${branch}" stroke="#8e2d14" stroke-width="9"
        fill="none" stroke-linejoin="miter"/>
      <path d="${path} ${branch}" stroke="#ff751a" stroke-width="4.4"
        fill="none" stroke-linejoin="miter"/>
      <path d="${path}" stroke="#ffd477" stroke-width="1.8"
        fill="none" stroke-linejoin="miter"/>
    `);
  }
  const cracks = [
    crackDrawing(
      "M18 0 L34 26 L27 43 L56 59 L47 81 L64 100",
      "M34 26 L61 19 L77 35 L98 37 M56 59 L80 64 L88 84",
    ),
    crackDrawing(
      "M67 0 L56 22 L70 42 L44 58 L48 78 L30 100",
      "M70 42 L88 44 L98 58 M48 78 L18 67 L0 73",
    ),
    crackDrawing(
      "M0 48 L25 54 L39 35 L62 43 L77 24 L100 31",
      "M39 35 L33 14 L43 0 M62 43 L59 68 L79 82 L72 100",
    ),
  ];

  const diamondTexture = drawing(`
    <path d="M50 4 L91 50 L50 96 L9 50 Z" fill="#1a2130"
      stroke="#896039" stroke-width="4"/>
    <path d="M50 17 L78 50 L50 83 L22 50 Z"
      fill="none" stroke="#d5aa60" stroke-width="3"/>
    <path d="M50 31 L64 50 L50 69 L36 50 Z" fill="#eb962c"/>
    <path d="M50 37 L50 61 L42 50 Z" fill="#ffdfa0"/>
  `);

  const plaqueTexture = drawing(`
    <rect x="2" y="2" width="356" height="86" rx="3" fill="#171d2b"
      stroke="#b48c4d" stroke-width="3"/>
    <path d="M14 20 L28 9 L42 20 L28 31 Z M318 20 L332 9 L346 20 L332 31 Z"
      fill="none" stroke="#c5a160" stroke-width="2"/>
    <text x="180" y="39" text-anchor="middle" font-family="serif"
      font-size="25" letter-spacing="5" fill="#eed29a">PYROCLAST</text>
    <path d="M62 51 H298" stroke="#926e3d" stroke-width="2"/>
    <text x="180" y="72" text-anchor="middle" font-family="serif"
      font-size="12" letter-spacing="3.4" fill="#c8a46a">THE CINDER WARDEN</text>
  `, "0 0 360 90", 768);

  // Skeleton first. Neutral open hands and a stable, slightly splayed stance.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root, at: [0, 1.46, 0], dir: [0, 1, 0], role: "spine",
  });
  const spine = b.chain(
    "torso",
    [[0, 1.65, 0], [0, 2.19, -0.025], [0, 2.72, -0.025]],
    {
      parent: hips,
      names: ["spine", "chest", "neckBase"],
      role: "spine",
    },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    [[0, 2.73, -0.025], [0, 2.99, 0.015]],
    {
      parent: spine.tip!,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 3.10, 0.055],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.10;
  const hr = b.region({ at: head, scale: H, bone: head });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hr.p([0, -0.19, 0.16]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.74, 2.66, -0.015],
        [s * 1.20, 2.22, 0.025],
        [s * 1.55, 1.78, 0.08],
      ],
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const wrist = arm.tip!;
    const hand = b.region({ at: wrist, quat: wrist.quat, bone: wrist });
    const fingers = [-0.17, 0, 0.17].map((u, i) => {
      const length = i === 1 ? 0.45 : 0.38;
      return b.chain(
        `finger${i + 1}${side}`,
        [
          hand.p([u, 0.22, 0.025]),
          hand.p([u * 1.2, 0.22 + length * 0.52, 0.025]),
          hand.p([u * 1.4, 0.22 + length, 0.055]),
        ],
        {
          parent: wrist,
          names: [`finger${i + 1}Base${side}`, `finger${i + 1}Tip${side}`],
          role: "digit",
        },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        hand.p([-0.235, 0.035, 0.005]),
        hand.p([-0.37, 0.15, 0.045]),
        hand.p([-0.43, 0.33, 0.075]),
      ],
      {
        parent: wrist,
        names: [`thumbBase${side}`, `thumbTip${side}`],
        role: "digit",
      },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.44, 1.45, -0.025],
        [s * 0.54, 0.98, 0.105],
        [s * 0.60, 0.445, 0.10],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.60, 0.15, 0.29],
      },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.joint(`toe${i + 2}${side}`, {
        parent: leg.tip!,
        at: [s * 0.60 + i * 0.175, 0.285, 0.43],
        dir: [0, 0, 1],
        role: "digit",
      }),
    );
    return { s, side, arm, wrist, hand, fingers, thumb, leg, toes };
  });

  function box(
    at: PointInput,
    size: [number, number, number],
    color: ColorInput,
    bone: Joint,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at, bone, rotation, flat: true,
    });
  }

  function rock(
    at: PointInput,
    scale: [number, number, number],
    color: ColorInput,
    bone: Joint,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, 0), color, {
      at, scale, bone, rotation, flat: true,
    });
  }

  function plate(
    outline: OutlinePoint[],
    at: PointInput,
    thickness: number,
    color: ColorInput,
    bone: Joint,
    x: DirectionInput = [1, 0, 0],
    y: DirectionInput = [0, 1, 0],
    bevel = 0.018,
  ) {
    return b.extrude(outline, {
      at, x, y, thickness, bevel, detail: 0.65, color, bone,
    });
  }

  function faceDrawing(
    texture: THREE.Texture,
    at: PointInput,
    width: number,
    height: number,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
    up: DirectionInput = [0, 1, 0],
    luminous = false,
  ) {
    const part = b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, dir, up, axis: "z", texture,
    });
    return luminous ? glow(part, 1.1) : part;
  }

  function hotLine(
    points: PointInput[],
    radius: number,
    bone: Joint,
    color = C.hot,
    strength = 1,
  ) {
    return glow(
      b.sweep(polyline(points), radius, {
        color, bone, sides: 5, caps: "flat",
      }),
      strength,
    );
  }

  function diamond(
    at: PointInput,
    width: number,
    height: number,
    color: ColorInput,
    bone: Joint,
    x: DirectionInput = [1, 0, 0],
    y: DirectionInput = [0, 1, 0],
  ) {
    return plate(
      [[0, -height / 2], [width / 2, 0], [0, height / 2], [-width / 2, 0]],
      at, 0.035, color, bone, x, y, 0.008,
    );
  }

  function fracture(
    target: Parameters<typeof b.surface>[0],
    at: PointInput,
    size: [number, number],
    bone: Joint,
    variant = 0,
    dir: DirectionInput = [0, 0, 1],
    roll = 0,
  ) {
    return glow(
      b.decal(target, cracks[variant % cracks.length], {
        at, dir, size, bone, roll,
        lift: 0.003, segments: 7,
      }),
      0.9,
    );
  }

  // FACE --------------------------------------------------------------------
  glow(b.sweep(neck, () => [0.17, 0.16], {
    color: C.ember, sides: 6, caps: "flat",
  }), 0.85);
  for (let i = 0; i < 2; i++) {
    b.part(
      new THREE.CylinderGeometry(0.25 - i * 0.014, 0.27 - i * 0.014, 0.105, 6),
      basalt,
      {
        at: [0, 2.80 + i * 0.10, 0.005],
        bone: neck.joints[i], flat: true,
        rotation: [0, i * 17, 0],
      },
    );
  }

  rock(hr.p([0, 0.10, -0.04]), [0.39 * H, 0.40 * H, 0.37 * H], basalt, head);
  plate(
    [[-0.32, -0.14], [-0.40, 0.12], [-0.29, 0.34], [0, 0.43], [0.29, 0.34], [0.40, 0.12], [0.32, -0.14]],
    hr.p([0, 0, 0.125]), 0.255, basalt, head,
  );
  plate(
    [[-0.31, -0.12], [-0.33, 0.15], [0, 0.22], [0.33, 0.15], [0.31, -0.12], [0, -0.19]],
    hr.p([0, 0, 0.28]), 0.095, C.socket, head,
    [1, 0, 0], [0, 1, 0], 0.012,
  );

  for (const s of [1, -1]) {
    const sx: DirectionInput = [s, 0, 0];
    // The brow descends toward the center: the face reads stern rather than sad.
    plate(
      [[0.035, 0.075], [0.30, 0.19], [0.37, 0.115], [0.30, 0.055], [0.075, 0.015]],
      hr.p([0, 0.055, 0.35]), 0.11, basalt, head, sx,
    );
    plate(
      [[0.075, -0.005], [0.28, 0.05], [0.315, -0.04], [0.20, -0.16], [0.09, -0.10]],
      hr.p([0, 0, 0.34]), 0.085, basalt, head, sx,
    );
    const eye = faceDrawing(
      eyeTexture,
      hr.p([s * 0.183, 0.055, 0.411]),
      0.245 * H, 0.114 * H, head,
      [0, 0, 1], [0, 1, 0], true,
    );
    if (s > 0) {
      const uv = eye.mesh.geometry.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      uv.needsUpdate = true;
    }
    plate(
      [[0.26, -0.045], [0.39, 0.10], [0.36, -0.11], [0.22, -0.24], [0.19, -0.13]],
      hr.p([0, 0, 0.235]), 0.16, basalt, head, sx,
    );
    hotLine(
      [
        hr.p([s * 0.31, -0.075, 0.325]),
        hr.p([s * 0.27, -0.145, 0.325]),
        hr.p([s * 0.225, -0.177, 0.325]),
      ],
      0.009, head, C.orange, 0.95,
    );

    const crownOutline: OutlinePoint[] = s > 0
      ? [[-0.12, 0], [0.10, -0.035], [0.19, 0.17], [0.11, 0.35], [-0.025, 0.28]]
      : [[-0.12, 0], [0.11, -0.025], [0.20, 0.12], [0.15, 0.21], [0.035, 0.26], [-0.035, 0.17]];
    plate(
      crownOutline,
      hr.p([s * 0.26, 0.29, -0.09]),
      0.27, basalt, head,
      sx, [s * 0.32, 1, -0.28], 0.014,
    );
    plate(
      [[-0.034, 0], [0.03, 0.015], [0.075, 0.16], [0.005, 0.13]],
      hr.p([s * 0.31, 0.35, 0.047]),
      0.018, brokenStone, head,
      sx, [s * 0.32, 1, -0.28], 0.004,
    );

    const temple = plate(
      [[-0.16, -0.13], [0.035, -0.20], [0.18, -0.04], [0.12, 0.16], [-0.015, 0.25], [-0.14, 0.08]],
      hr.p([s * 0.34, 0.07, -0.12]),
      0.24, basalt, head,
      [0, 0, s], [0, 1, 0], 0.022,
    );
    fracture(
      temple, hr.p([s * 0.46, 0.08, -0.11]),
      [0.23, 0.28], head, s > 0 ? 1 : 0, [s, 0, 0],
    );
  }

  plate(
    [[-0.17, -0.045], [-0.12, 0.13], [0, 0.19], [0.12, 0.13], [0.17, -0.045], [0, -0.12]],
    hr.p([0, 0.31, 0.257]), 0.09, darkStone, head,
  );
  glow(diamond(hr.p([0, 0.33, 0.316]), 0.095, 0.17, C.hot, head), 1);
  diamond(hr.p([0, 0.34, 0.34]), 0.034, 0.075, C.whiteHot, head);

  plate(
    [[-0.205, -0.025], [-0.145, 0.065], [0.145, 0.065], [0.205, -0.025], [0.13, -0.075], [-0.13, -0.075]],
    hr.p([0, -0.122, 0.314]), 0.115, basalt, head,
    [1, 0, 0], [0, 1, 0], 0.013,
  );
  plate(
    [[-0.245, 0.025], [-0.15, 0.065], [0.15, 0.065], [0.245, 0.025], [0.19, -0.10], [0, -0.16], [-0.19, -0.10]],
    hr.p([0, -0.265, 0.25]), 0.23, basalt, jaw,
  );
  for (const s of [1, -1]) {
    box(hr.p([s * 0.075, -0.202, 0.365]), [0.085, 0.046, 0.061], brokenStone, head);
  }
  hotLine(
    [hr.p([-0.14, -0.262, 0.372]), hr.p([0, -0.30, 0.383]), hr.p([0.14, -0.262, 0.372])],
    0.008, jaw, C.orange, 0.9,
  );

  // TORSO -------------------------------------------------------------------
  glow(b.loft(
    [
      { at: [0, 1.49, -0.025], w: 0.73, h: 0.53 },
      { at: [0, 1.91, -0.035], w: 0.79, h: 0.57 },
      { at: [0, 2.31, -0.055], w: 1.09, h: 0.67 },
      { at: [0, 2.67, -0.055], w: 1.32, h: 0.68 },
      { at: [0, 2.79, -0.035], w: 0.88, h: 0.48 },
    ],
    { color: C.ember, bone: spine, section: { ngon: 6 }, caps: "flat" },
  ), 0.85);

  for (const { s } of sides) {
    const sx: DirectionInput = [s, 0, 0];
    const pectoral = plate(
      [[0.04, 0.10], [0.34, 0.19], [0.67, 0.10], [0.66, -0.13], [0.40, -0.32], [0.15, -0.21]],
      [0, 2.62, 0.315], 0.22, basalt, chest,
      sx, [0, 1, -0.08], 0.03,
    );
    plate(
      [[0.23, 0.115], [0.59, 0.17], [0.65, 0.06], [0.42, -0.015]],
      [0, 2.69, 0.415], 0.046, brokenStone, chest,
      sx, [0, 1, -0.08], 0.012,
    );
    // Thin gilding now follows the actual stone surface, never bridging air.
    const trim = b.surface(pectoral).drape(
      [
        [s * 0.18, 2.75, 0.50],
        [s * 0.33, 2.79, 0.50],
        [s * 0.53, 2.75, 0.50],
      ],
      { lift: 0.004 },
    );
    b.sweep(trim, 0.0065, {
      color: oldGold, bone: chest, sides: 4, caps: "flat",
    });
    fracture(
      pectoral, [s * 0.47, 2.55, 0.47],
      [0.22, 0.28], chest, s > 0 ? 0 : 1, [0, 0, 1], s * 12,
    );

    for (let i = 0; i < 3; i++) {
      const y = 2.31 - i * 0.205;
      const outer = 0.53 - i * 0.065;
      plate(
        [[0.10, 0.07], [outer, 0.14], [outer + 0.015, -0.04], [0.25, -0.14], [0.085, -0.08]],
        [0, y, 0.31 - i * 0.01], 0.17,
        i === 2 ? darkStone : basalt,
        i === 0 ? chest : spine.joints[0],
        sx, [0, 1, 0.08], 0.02,
      );
    }

    const flank = b.loft(
      [
        { at: [s * 0.35, 1.65, -0.045], w: 0.29, h: 0.49 },
        { at: [s * 0.39, 1.93, -0.065], w: 0.31, h: 0.61 },
        { at: [s * 0.54, 2.34, -0.08], w: 0.36, h: 0.69 },
        { at: [s * 0.55, 2.64, -0.08], w: 0.34, h: 0.65 },
      ],
      { color: basalt, bone: spine, section: { ngon: 6 }, caps: "flat" },
    );
    fracture(
      flank, [s * 0.66, 2.15, -0.05],
      [0.38, 0.47], spine.joints[0], s > 0 ? 1 : 2, [s, 0, 0],
    );

    const scapula = plate(
      [[0.07, 0.16], [0.46, 0.23], [0.65, 0.02], [0.50, -0.26], [0.11, -0.16]],
      [0, 2.56, -0.415], 0.22, basalt, chest,
      [-s, 0, 0], [0, 1, 0], 0.025,
    );
    fracture(
      scapula, [-s * 0.37, 2.56, -0.535],
      [0.32, 0.37], chest, s > 0 ? 2 : 1, [0, 0, -1],
    );
    plate(
      [[0.07, 0.10], [0.47, 0.14], [0.43, -0.15], [0.08, -0.20]],
      [0, 2.16, -0.365], 0.20, darkStone, spine.joints[0],
      [-s, 0, 0],
    );

    for (let i = 0; i < 2; i++) {
      plate(
        [[-0.26, 0.10], [0.18, 0.17], [0.29, 0.01], [0.15, -0.16], [-0.20, -0.13]],
        [s * (0.55 - i * 0.09), 2.27 - i * 0.27, -0.065],
        0.13, i === 0 ? basalt : darkStone, spine.joints[0],
        [0, 0, s], [0, 1, 0], 0.018,
      );
    }

    // Continuous waist mass with interlocking front and rear corner stones.
    const waist = plate(
      [[-0.23, 0.14], [0.12, 0.19], [0.25, 0.025], [0.17, -0.18], [-0.18, -0.13]],
      [s * 0.315, 1.73, -0.01], 0.48, basalt, hips,
      sx, [0, 1, 0], 0.025,
    );
    fracture(
      waist, [s * 0.40, 1.74, 0.25],
      [0.15, 0.22], hips, s > 0 ? 0 : 1,
    );
  }

  for (let i = 0; i < 3; i++) {
    const y = 2.12 - i * 0.17;
    const w = 0.16 - i * 0.012;
    plate(
      [[-w, 0.08], [0, 0.13], [w, 0.08], [w * 0.9, -0.06], [0, -0.11], [-w * 0.9, -0.06]],
      [0, y, 0.31 - i * 0.012],
      0.15, i === 1 ? basalt : darkStone, spine.joints[0],
      [1, 0, 0], [0, 1, 0], 0.014,
    );
    if (i < 2) {
      hotLine(
        [[-w * 0.78, y - 0.075, 0.392], [0, y - 0.12, 0.392], [w * 0.78, y - 0.075, 0.392]],
        0.007, spine.joints[0], C.orange, 0.9,
      );
    }
  }

  // The furnace sits inside a thick, damaged basalt socket.
  const heartPlate = plate(
    [[0, 0.34], [0.245, 0.13], [0.195, -0.16], [0, -0.34], [-0.195, -0.16], [-0.245, 0.13]],
    [0, 2.43, 0.372], 0.17, darkStone, chest,
    [1, 0, 0], [0, 1, 0], 0.022,
  );
  glow(b.decal(heartPlate, heartTexture, {
    at: [0, 2.43, 0.465],
    dir: [0, 0, 1],
    size: [0.41, 0.575],
    bone: chest, lift: 0.003, segments: 6,
  }), 0.85);
  glow(rock([0, 2.46, 0.47], [0.105, 0.185, 0.069], C.hot, chest), 1.1);
  glow(diamond([0, 2.48, 0.525], 0.052, 0.112, C.whiteHot, chest), 1);

  for (const s of [1, -1]) {
    plate(
      [[-0.045, -0.065], [0.055, -0.015], [0.075, 0.15], [-0.005, 0.19]],
      [s * 0.15, 2.22, 0.49], 0.085, basalt, chest,
      [s, 0, 0], [0, 1, 0], 0.012,
    );
    plate(
      [[-0.05, -0.04], [0.055, -0.055], [0.08, 0.14], [0.005, 0.12]],
      [s * 0.16, 2.64, 0.477], 0.075, basalt, chest,
      [s, 0, 0], [0, -1, 0], 0.01,
    );
  }

  for (let i = 0; i < 5; i++) {
    const y = 1.80 + i * 0.195;
    const bone = i < 3 ? spine.joints[0] : chest;
    diamond([0, y, -0.48], 0.22 + i * 0.018, 0.23, basalt, bone, [-1, 0, 0]);
    if (i < 4) {
      hotLine(
        [[-0.055, y + 0.11, -0.498], [0.055, y + 0.11, -0.498]],
        0.008, bone, C.orange, 0.9,
      );
    }
  }

  glow(rock(hips, [0.47, 0.26, 0.32], C.ember, hips), 0.8);
  plate(
    [[-0.40, 0.10], [-0.29, 0.21], [0.29, 0.21], [0.40, 0.10], [0.30, -0.10], [-0.30, -0.10]],
    [0, 1.60, 0.30], 0.20, darkStone, hips,
  );
  faceDrawing(diamondTexture, [0, 1.64, 0.406], 0.15, 0.185, hips);
  plate(
    [[-0.17, 0.12], [0.17, 0.12], [0.20, -0.11], [0, -0.22], [-0.20, -0.11]],
    [0, 1.39, 0.267], 0.18, darkStone, hips,
  );
  for (const { s } of sides) {
    plate(
      [[0.025, 0.17], [0.34, 0.17], [0.47, -0.10], [0.28, -0.28], [0.045, -0.15]],
      [s * 0.14, 1.43, 0.275], 0.21, basalt, hips,
      [s, 0, 0], [s * 0.12, 1, 0.10], 0.025,
    );
    plate(
      [[-0.15, 0.16], [0.16, 0.16], [0.22, -0.13], [0.02, -0.23], [-0.16, -0.12]],
      [s * 0.46, 1.45, -0.06], 0.31, basalt, hips,
      [0, 0, s], [s * 0.18, 1, 0], 0.025,
    );
  }

  // ARMS --------------------------------------------------------------------
  for (const { s, arm, wrist, hand, fingers, thumb } of sides) {
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];

    glow(b.sweep(arm, () => [0.15, 0.145], {
      color: C.orange, sides: 6, caps: "flat",
    }), 0.9);

    const capOutline: OutlinePoint[] = s > 0
      ? [[-0.34, 0.04], [-0.21, 0.27], [0.04, 0.36], [0.26, 0.28], [0.46, 0.08], [0.36, -0.16], [0.10, -0.31], [-0.22, -0.21]]
      : [[-0.34, 0.04], [-0.19, 0.31], [0.15, 0.34], [0.43, 0.12], [0.37, -0.14], [0.14, -0.30], [-0.21, -0.21]];
    const cap = plate(
      capOutline, [s * 0.82, 2.73, -0.02], 0.64,
      basalt, shoulder, [s, 0, 0], [0, 1, 0], 0.035,
    );
    plate(
      [[-0.24, 0], [-0.11, 0.17], [0.12, 0.19], [0.33, 0.035], [0.16, -0.04]],
      [s * 0.82, 2.92, 0.035], 0.59,
      brokenStone, shoulder, [s, 0, 0], [0, 1, 0], 0.018,
    );
    b.decal(cap, inscriptionTexture, {
      at: [s * 0.83, 2.76, 0.32],
      dir: [0, 0, 1], size: [0.21, 0.27],
      lift: 0.003, bone: shoulder, segments: 5, mirror: s < 0,
    });
    fracture(
      cap, [s * 1.05, 2.70, 0.32], [0.27, 0.40],
      shoulder, s > 0 ? 0 : 1, [0, 0, 1], s * 8,
    );
    fracture(
      cap, [s * 1.23, 2.76, -0.02], [0.41, 0.35],
      shoulder, 2, [s, 0, 0], s * 15,
    );

    // Asymmetric eruptions of broken columnar basalt.
    for (let i = 0; i < 2; i++) {
      const height = (s > 0 ? 0.39 : 0.30) - i * 0.065;
      plate(
        [[-0.11, 0], [0.13, -0.02], [0.17, 0.15], [0.06, height], [-0.045, height - 0.075]],
        [s * (0.93 + i * 0.22), 2.93 - i * 0.055, -0.18],
        0.28, basalt, shoulder,
        [s, 0, 0], [s * 0.32, 1, -0.25], 0.012,
      );
      plate(
        [[-0.045, 0], [0.035, 0.015], [0.055, 0.12], [0.01, 0.19]],
        [s * (0.96 + i * 0.22), 3.00 - i * 0.055, -0.025],
        0.015, brokenStone, shoulder,
        [s, 0, 0], [s * 0.32, 1, -0.25], 0.004,
      );
    }

    const upperArmor = b.loft(
      [
        { at: arm.at(0.07), w: 0.48, h: 0.51 },
        { at: arm.at(0.25), w: 0.52, h: 0.55 },
        { at: arm.at(0.46), w: 0.38, h: 0.41 },
      ],
      { bone: shoulder, color: basalt, section: { ngon: 6 }, caps: "flat" },
    );
    fracture(
      upperArmor,
      arm.at(0.29).at.clone().add(new THREE.Vector3(0, 0, 0.36)),
      [0.22, 0.31], shoulder, s > 0 ? 1 : 0,
    );
    b.loft(
      [
        { at: arm.at(0.12).at.clone().add(new THREE.Vector3(0, 0, -0.18)), w: 0.30, h: 0.23 },
        { at: arm.at(0.31).at.clone().add(new THREE.Vector3(0, 0, -0.20)), w: 0.34, h: 0.25 },
        { at: arm.at(0.44).at.clone().add(new THREE.Vector3(0, 0, -0.16)), w: 0.23, h: 0.20 },
      ],
      { bone: shoulder, color: darkStone, section: "box", caps: "flat" },
    );

    rock(arm.at(0.50), [0.245, 0.23, 0.235], darkStone, elbow);
    const elbowFront = arm.at(0.50).at.clone().add(new THREE.Vector3(0, 0, 0.226));
    glow(diamond(elbowFront, 0.105, 0.14, C.orange, elbow), 0.9);

    const forearmArmor = b.loft(
      [
        { at: arm.at(0.55), w: 0.46, h: 0.50 },
        { at: arm.at(0.74), w: 0.63, h: 0.65 },
        { at: arm.at(0.96), w: 0.48, h: 0.48 },
      ],
      { bone: elbow, color: basalt, section: { ngon: 6 }, caps: "flat" },
    );
    const forearmCenter = arm.at(0.76).at;
    const frontHit = b.surface(forearmArmor).nearest(
      forearmCenter.clone().add(new THREE.Vector3(0, 0, 0.48)),
    );
    if (s > 0) {
      b.decal(forearmArmor, inscriptionTexture, {
        at: frontHit, dir: [0, 0, 1], size: [0.20, 0.34],
        roll: s * 37, lift: 0.003, bone: elbow, segments: 5,
      });
    } else {
      fracture(forearmArmor, frontHit, [0.29, 0.40], elbow, 2, [0, 0, 1], -28);
    }
    const outerHit = b.surface(forearmArmor).nearest(
      forearmCenter.clone().add(new THREE.Vector3(s * 0.5, 0, 0)),
    );
    fracture(
      forearmArmor, outerHit, [0.28, 0.38], elbow,
      s > 0 ? 1 : 0, [s, 0, 0],
    );
    plate(
      [[-0.10, 0.22], [0.09, 0.28], [0.16, 0.04], [0.10, -0.27], [-0.09, -0.22]],
      [forearmCenter.x + s * 0.24, forearmCenter.y, forearmCenter.z - 0.015],
      0.32, darkStone, elbow,
      [s * 0.70, 0.55, 0], [-s * 0.55, 0.70, 0], 0.02,
    );

    b.part(new THREE.CylinderGeometry(0.245, 0.26, 0.105, 6), darkStone, {
      at: wrist, dir: wrist.axis, bone: wrist, flat: true,
    });
    b.frustumBox(
      hand.p([0, 0.025, 0]), hand.p([0, 0.245, 0.015]),
      [0.46, 0.32], [0.47, 0.34],
      { color: basalt, bone: wrist },
    );
    const palmPlate = plate(
      [[-0.21, -0.11], [0.21, -0.11], [0.235, 0.08], [0.13, 0.15], [-0.13, 0.15], [-0.235, 0.08]],
      hand.p([0, 0.14, 0.19]), 0.055, darkStone, wrist,
      hand.d([1, 0, 0]), hand.d([0, 1, 0]), 0.012,
    );
    fracture(
      palmPlate, hand.p([0, 0.15, 0.23]),
      [0.27, 0.19], wrist, s > 0 ? 2 : 1,
      hand.d([0, 0, 1]),
    );

    for (const [i, digit] of [...fingers, thumb].entries()) {
      const r = i === 3 ? 0.075 : 0.072;
      glow(b.sweep(digit, r * 0.74, {
        color: C.orange, sides: 5, caps: "flat",
      }), 0.9);
      b.frustumBox(
        digit.at(0.02), digit.at(0.45),
        [r * 2.1, r * 2], [r * 2, r * 1.9],
        { color: basalt, bone: digit.joints[0] },
      );
      b.frustumBox(
        digit.at(0.55), digit.at(0.99),
        [r * 2.05, r * 1.9], [r * 1.75, r * 1.75],
        { color: basalt, bone: digit.joints[1] },
      );
      rock(
        digit.at(0.05).at.clone().add(hand.d([0, 0, 0.095])),
        [0.083, 0.078, 0.065], brokenStone, digit.joints[0],
      );
      const jointCenter = digit.at(0.50).at;
      hotLine(
        [
          jointCenter.clone().add(hand.d([-r * 0.76, 0, r * 0.78])),
          jointCenter.clone().add(hand.d([r * 0.76, 0, r * 0.78])),
        ],
        0.006, digit.joints[1], C.hot, 0.9,
      );
      plate(
        [[-0.047, -0.042], [0.047, -0.042], [0.042, 0.045], [0, 0.065], [-0.042, 0.045]],
        digit.at(0.83).at.clone().add(hand.d([0, 0, r * 0.99])),
        0.025, darkStone, digit.joints[1],
        hand.d([1, 0, 0]), hand.d([0, 1, 0]), 0.005,
      );
    }
  }

  // LEGS --------------------------------------------------------------------
  for (const { s, leg, toes } of sides) {
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    glow(b.sweep(leg, () => [0.16, 0.16], {
      color: C.orange, sides: 6, caps: "flat",
    }), 0.85);

    const thigh = b.loft(
      [
        { at: leg.at(0.04), w: 0.49, h: 0.54 },
        { at: leg.at(0.24), w: 0.56, h: 0.58 },
        { at: leg.at(0.45), w: 0.43, h: 0.46 },
      ],
      { color: basalt, bone: hip, section: { ngon: 6 }, caps: "flat" },
    );
    const thighFront = plate(
      [[-0.19, 0.13], [0.12, 0.19], [0.22, -0.04], [0.12, -0.18], [-0.17, -0.11]],
      [s * 0.505, 1.19, 0.29], 0.13, basalt, hip,
      [s, 0, 0], [0, 1, 0], 0.02,
    );
    fracture(
      [thigh, thighFront], [s * 0.56, 1.23, 0.39],
      [0.23, 0.31], hip, s > 0 ? 1 : 0,
    );

    glow(rock([s * 0.54, 0.98, 0.105], [0.24, 0.225, 0.235], C.ember, knee), 0.9);
    const kneePlate = plate(
      [[0, 0.22], [0.235, 0.075], [0.18, -0.13], [0, -0.23], [-0.18, -0.13], [-0.235, 0.075]],
      [s * 0.54, 0.99, 0.33], 0.155, basalt, knee,
      [1, 0, 0], [0, 1, 0], 0.022,
    );
    b.decal(kneePlate, diamondTexture, {
      at: [s * 0.54, 1, 0.417], dir: [0, 0, 1],
      size: [0.14, 0.18], lift: 0.003, bone: knee, segments: 4,
    });

    const shin = b.loft(
      [
        { at: leg.at(0.55), w: 0.49, h: 0.52 },
        { at: leg.at(0.80), w: 0.53, h: 0.56 },
        { at: leg.at(0.98), w: 0.43, h: 0.46 },
      ],
      { color: basalt, bone: knee, section: { ngon: 6 }, caps: "flat" },
    );
    const shinFront = plate(
      [[-0.21, 0.17], [0.12, 0.21], [0.23, 0.02], [0.15, -0.25], [-0.14, -0.22]],
      [s * 0.585, 0.65, 0.36], 0.13, basalt, knee,
      [s, 0, 0], [0, 1, 0.06], 0.025,
    );
    fracture(
      [shin, shinFront], [s * 0.59, 0.66, 0.44],
      [0.31, 0.45], knee, s > 0 ? 0 : 1,
    );
    for (let i = 0; i < 2; i++) {
      plate(
        [[-0.19, 0.06], [0.16, 0.10], [0.23, -0.04], [-0.16, -0.10]],
        [s * 0.79, 0.76 - i * 0.20, 0.015],
        0.25, darkStone, knee,
        [0, 0, s], [0, 1, 0], 0.014,
      );
    }
    const calf = b.loft(
      [
        { at: [s * 0.56, 0.84, -0.12], w: 0.31, h: 0.27 },
        { at: [s * 0.59, 0.59, -0.17], w: 0.35, h: 0.29 },
        { at: [s * 0.60, 0.40, -0.15], w: 0.31, h: 0.25 },
      ],
      { color: darkStone, bone: knee, section: { ngon: 5 }, caps: "flat" },
    );
    fracture(
      calf, [s * 0.59, 0.60, -0.35],
      [0.22, 0.36], knee, 2, [0, 0, -1],
    );

    // The molten sole is mostly buried; only a thin edge shows.
    glow(box(
      [s * 0.60, 0.205, 0.23], [0.52, 0.055, 0.64], C.ember, ankle,
    ), 0.85);
    const foot = plate(
      [[-0.28, 0], [-0.31, 0.16], [-0.20, 0.32], [0.19, 0.34], [0.30, 0.16], [0.27, 0]],
      [s * 0.60, 0.15, 0.18], 0.66, basalt, ankle,
      [1, 0, 0], [0, 1, -0.23], 0.022,
    );
    box([s * 0.60, 0.235, -0.14], [0.49, 0.17, 0.31], darkStone, ankle);
    fracture(
      foot, [s * 0.86, 0.31, 0.20],
      [0.34, 0.24], ankle, 2, [s, 0, 0],
    );
    for (let i = 0; i < toes.length; i++) {
      const toeX = s * 0.60 + (i - 1) * 0.175;
      plate(
        [[-0.078, 0], [0.078, 0], [0.085, 0.15], [0.04, 0.23], [-0.05, 0.22], [-0.085, 0.13]],
        [toeX, 0.15, 0.55 + (i === 1 ? 0.035 : 0)],
        0.30, i === 1 ? basalt : darkStone, toes[i],
        [1, 0, 0], [0, 1, -0.14], 0.012,
      );
      box(
        [toeX, 0.275, 0.707 + (i === 1 ? 0.035 : 0)],
        [0.105, 0.085, 0.027], brokenStone, toes[i],
      );
    }
  }

  // SETTING -----------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(2.27, 2.35, 0.15, 12), floorStone, {
    at: [0, 0.075, 0.06], scale: [1, 1, 0.55], bone: root, flat: true,
  });
  b.part(new THREE.CylinderGeometry(2.21, 2.24, 0.028, 12), darkStone, {
    at: [0, 0.145, 0.06], scale: [1, 1, 0.55], bone: root, flat: true,
  });

  const fissures: number[][][] = [
    [[-2.04, 0, -0.24], [-1.57, 0, -0.11], [-1.22, 0, 0.12], [-0.88, 0, 0.18]],
    [[2.06, 0, 0.28], [1.66, 0, 0.17], [1.39, 0, 0.37], [1.02, 0, 0.34]],
    [[-0.20, 0, 1.17], [-0.11, 0, 0.84], [0.17, 0, 0.66], [0.07, 0, 0.36]],
    [[0.12, 0, -1.12], [0.36, 0, -0.82], [0.23, 0, -0.48], [0.03, 0, -0.25]],
    [[-1.54, 0, -0.11], [-1.40, 0, -0.52], [-1.03, 0, -0.82]],
    [[1.66, 0, 0.17], [1.65, 0, -0.18], [1.91, 0, -0.43]],
    [[-0.11, 0, 0.84], [-0.44, 0, 0.94], [-0.72, 0, 0.86]],
  ];

  function fissureStrip(path: number[][], width: number, height: number, color: string, lit: boolean) {
    for (let i = 0; i < path.length - 1; i++) {
      const a = new THREE.Vector3(path[i][0], height, path[i][2]);
      const c = new THREE.Vector3(path[i + 1][0], height, path[i + 1][2]);
      const d = c.clone().sub(a).normalize();
      const perpendicular = new THREE.Vector3(-d.z, 0, d.x);
      const wa = width * (1 + (i % 2) * 0.18);
      const wc = width * (i === path.length - 2 ? 0.48 : 0.92);
      const slab = b.slab(
        [
          a.clone().addScaledVector(perpendicular, wa),
          c.clone().addScaledVector(perpendicular, wc),
          c.clone().addScaledVector(perpendicular, -wc),
          a.clone().addScaledVector(perpendicular, -wa),
        ],
        { color, thickness: 0.0015, bone: root },
      );
      if (lit) glow(slab, 0.95);
    }
  }
  for (const path of fissures) {
    fissureStrip(path, 0.038, 0.161, C.socket, false);
    fissureStrip(path, 0.019, 0.163, C.ember, true);
    fissureStrip(path, 0.007, 0.165, C.hot, true);
  }

  const fragments: { outline: OutlinePoint[]; at: number[] }[] = [
    {
      outline: [[-0.42, -0.15], [0.11, -0.24], [0.39, 0.10], [0.23, 0.32], [-0.28, 0.26]],
      at: [-1.22, 0.166, 0.53],
    },
    {
      outline: [[-0.31, -0.26], [0.25, -0.20], [0.40, 0.06], [0.04, 0.29], [-0.38, 0.18]],
      at: [1.31, 0.166, 0.58],
    },
    {
      outline: [[-0.42, -0.14], [0.23, -0.24], [0.42, 0.16], [-0.19, 0.28]],
      at: [-0.60, 0.166, -0.66],
    },
    {
      outline: [[-0.29, -0.19], [0.30, -0.23], [0.39, 0.15], [-0.15, 0.30], [-0.36, 0.05]],
      at: [0.81, 0.166, -0.64],
    },
  ];
  for (const fragment of fragments) {
    plate(
      fragment.outline, fragment.at, 0.025, floorStone, root,
      [1, 0, 0], [0, 0, -1], 0.006,
    );
  }

  for (let i = 0; i < 6; i++) {
    const a = (i + 0.5) / 6 * Math.PI * 2;
    diamond(
      [Math.sin(a) * 2.12, 0.167, Math.cos(a) * 1.14 + 0.06],
      0.055, 0.12, oldGold, root,
      [Math.cos(a), 0, -Math.sin(a)],
      [Math.sin(a), 0, Math.cos(a)],
    );
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const height = 0.30 + (2 - i) * 0.10;
      const axis = new THREE.Vector3(s * (0.12 + i * 0.06), 1, -0.08).normalize();
      const bottom = new THREE.Vector3(s * (1.37 + i * 0.17), 0.16, -0.62 + i * 0.09);
      const top = bottom.clone().addScaledVector(axis, height);
      const column = b.frustumBox(bottom, top, [0.21, 0.22], [0.13, 0.15], {
        color: basalt, bone: root,
      });
      rock(top, [0.105, 0.07, 0.10], brokenStone, root);
      if (i === 1) {
        fracture(
          column,
          bottom.clone().add(new THREE.Vector3(0, height * 0.48, 0.13)),
          [0.12, 0.28], root, s > 0 ? 1 : 0,
        );
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    const a = random() * Math.PI * 2;
    const radius = 1.38 + random() * 0.63;
    const size = 0.045 + random() * 0.053;
    rock(
      [Math.sin(a) * radius, 0.16 + size * 0.45, Math.cos(a) * radius * 0.49 + 0.06],
      [size * 1.3, size * 0.55, size],
      i % 4 === 0 ? brokenStone : darkStone,
      root,
      [random() * 35, random() * 180, random() * 25],
    );
  }

  box([0, 0.102, 1.335], [0.91, 0.174, 0.065], darkStone, root);
  faceDrawing(plaqueTexture, [0, 0.103, 1.371], 0.87, 0.164, root);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), oldGold, {
      at: [s * 0.414, 0.103, 1.379], dir: [0, 0, 1], bone: root,
    });
  }

  return b.root;
}
```