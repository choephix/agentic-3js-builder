import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  catmull,
  polyline,
  bezier,
  rng,
  paint,
  noise,
  mix,
  grain,
  svg,
} from "../../../../src/index";
import type {
  Joint,
  ColorInput,
  OutlinePoint,
  PointInput,
  DirectionInput,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pyroclast, the Cinder Warden",
  description:
    "An angular basalt colossus with incandescent magma joints, a furnace-heart sigil, monumental stone gauntlets, and gilded volcanic inscriptions. Built in a stylized, faceted fantasy-action aesthetic on a small fractured caldera.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Pyroclast",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(4819);

  const C = {
    obsidian: "#202637",
    dark: "#121724",
    socket: "#090e18",
    edge: "#535b70",
    slate: "#3b455c",
    ash: "#768092",
    gold: "#d5a453",
    paleGold: "#f7d78a",
    ember: "#fa531b",
    orange: "#ff8121",
    hot: "#ffb637",
    whiteHot: "#ffe3a0",
    cooled: "#77372c",
    ground: "#252735",
  };

  // Broad, quiet stone faces; warm reflected light collects on lower breaks.
  const basalt = paint((p, n) => {
    const mottling = noise(p, 0.19, 17);
    const fine = noise(p, 0.033, 71);
    const upper = Math.max(0, n.y);
    let color = mix("#242a3c", "#454d65", 0.25 + mottling * 0.48 + upper * 0.15);
    if (n.y < -0.25) {
      color = mix(color, "#703a35", Math.min(0.32, -n.y * 0.27));
    }
    return mix(color, "#8990a0", fine > 0.78 ? 0.16 : 0);
  });
  const brokenStone = paint((p, n) => {
    const v = noise(p, 0.075, 25);
    return mix(
      mix("#41485a", "#7d8290", v * 0.65),
      "#a66b50",
      Math.max(0, -n.y) * 0.27,
    );
  });
  const darkStone = paint((p, n) =>
    mix("#151b29", "#353e54", noise(p, 0.12, 43) * 0.65 + Math.max(n.y, 0) * 0.13),
  );
  const floorStone = paint((p, n) => {
    const v = noise(p, 0.3, 7);
    return mix("#1d2130", n.y > 0.5 ? "#575165" : "#393b4d", v * 0.68);
  });
  const goldStone = grain("#8d6137", "#e0b36a", {
    size: 0.022,
    axis: "y",
    seed: 8,
  });

  function drawing(body: string, viewBox = "0 0 100 100", size = 384) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`,
      { size },
    );
  }

  const eyeTexture = drawing(`
    <defs>
      <linearGradient id="fire" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#ff6a16"/>
        <stop offset=".5" stop-color="#ffce4a"/>
        <stop offset="1" stop-color="#fff5b2"/>
      </linearGradient>
    </defs>
    <path d="M3 20 L93 5 L83 64 L24 87 Z" fill="#b3441e"/>
    <path d="M10 24 L87 13 L76 56 L27 75 Z" fill="url(#fire)"/>
    <path d="M43 20 L58 18 L51 66 L41 69 Z" fill="#fff8c3"/>
    <path d="M15 27 L81 17" fill="none" stroke="#fff7b9" stroke-width="6"/>
  `);

  const heartTexture = drawing(`
    <path d="M50 3 L91 36 L78 78 L50 97 L22 78 L9 36 Z"
      fill="#171d2b" stroke="#aa713a" stroke-width="3"/>
    <path d="M50 11 L82 39 L50 87 L18 39 Z"
      fill="none" stroke="#ff8a22" stroke-width="6"/>
    <path d="M50 19 L70 41 L50 72 L30 41 Z" fill="#ffce55"/>
    <path d="M50 29 L59 42 L50 57 L41 42 Z" fill="#fff1ab"/>
    <path d="M19 60 L31 79 M81 60 L69 79 M37 88 L50 97 L63 88"
      stroke="#ffdc77" stroke-width="3" fill="none"/>
    <path d="M7 33 L16 25 M93 33 L84 25 M46 5 L50 0 L54 5"
      stroke="#ffe6a0" stroke-width="3" fill="none"/>
  `);

  const inscriptionTexture = drawing(`
    <g fill="none" stroke-linejoin="miter">
      <path d="M12 10 L12 86 L29 96 M88 10 L88 86 L71 96"
        stroke="#121a29" stroke-width="9"/>
      <path d="M12 10 L12 86 L29 96 M88 10 L88 86 L71 96"
        stroke="#c79753" stroke-width="3"/>
      <path d="M50 11 L69 33 L50 55 L31 33 Z M50 22 L59 33 L50 44 L41 33 Z"
        stroke="#e7bd6e" stroke-width="3.5"/>
      <path d="M50 56 L50 85 M36 65 L50 77 L64 65 M37 87 L50 98 L63 87"
        stroke="#e7bd6e" stroke-width="3.5"/>
      <path d="M23 11 L28 16 M77 11 L72 16" stroke="#fff0b6" stroke-width="3"/>
    </g>
  `);

  const fractureTexture = drawing(`
    <path d="M9 2 L30 24 L26 41 L52 57 L43 77 L66 100
             M29 24 L62 18 L72 33 L95 38
             M52 57 L74 62 L88 86"
      stroke="#100f1b" stroke-width="11" fill="none"/>
    <path d="M9 2 L30 24 L26 41 L52 57 L43 77 L66 100
             M29 24 L62 18 L72 33 L95 38
             M52 57 L74 62 L88 86"
      stroke="#ed601d" stroke-width="5" fill="none"/>
    <path d="M9 2 L30 24 L26 41 L52 57 L43 77 L66 100"
      stroke="#ffc35b" stroke-width="2.5" fill="none"/>
  `);

  const diamondTexture = drawing(`
    <path d="M50 4 L91 50 L50 96 L9 50 Z" fill="#1b2334"
      stroke="#aa7a43" stroke-width="4"/>
    <path d="M50 17 L78 50 L50 83 L22 50 Z"
      fill="none" stroke="#e6b468" stroke-width="4"/>
    <path d="M50 29 L66 50 L50 71 L34 50 Z" fill="#ffad35"/>
    <path d="M50 35 L50 62 L41 50 Z" fill="#ffedac"/>
    <path d="M14 50 L27 50 M73 50 L86 50" stroke="#ffe9ad" stroke-width="3"/>
  `);

  const plaqueTexture = drawing(`
    <rect x="2" y="2" width="356" height="86" rx="3" fill="#171d2b"
      stroke="#c09756" stroke-width="3"/>
    <path d="M14 20 L28 9 L42 20 L28 31 Z M318 20 L332 9 L346 20 L332 31 Z"
      fill="none" stroke="#ddb76e" stroke-width="2"/>
    <text x="180" y="39" text-anchor="middle" font-family="serif"
      font-size="25" letter-spacing="5" fill="#f3d397">PYROCLAST</text>
    <path d="M62 51 H298" stroke="#aa8147" stroke-width="2"/>
    <text x="180" y="72" text-anchor="middle" font-family="serif"
      font-size="12" letter-spacing="3.4" fill="#c8a46a">THE CINDER WARDEN</text>
  `, "0 0 360 90", 768);

  // ---------------------------------------------------------------------------
  // Skeleton. Everything on the creature is authored from these rest-pose handles.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.46, 0],
    dir: [0, 1, 0],
    role: "spine",
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
    [[0, 2.73, -0.025], [0, 3.08, 0.015]],
    {
      parent: spine.tip!,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 3.19, 0.045],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.04;
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
    const handRegion = b.region({
      at: wrist,
      quat: wrist.quat,
      bone: wrist,
    });

    const fingers = [-0.17, 0, 0.17].map((u, i) => {
      const length = i === 1 ? 0.45 : 0.38;
      const spread = u * 0.40;
      return b.chain(
        `finger${i + 1}${side}`,
        [
          handRegion.p([u, 0.22, 0.025]),
          handRegion.p([u + spread * 0.5, 0.22 + length * 0.52, 0.025]),
          handRegion.p([u + spread, 0.22 + length, 0.055]),
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
        handRegion.p([-0.235, 0.035, 0.005]),
        handRegion.p([-0.37, 0.15, 0.045]),
        handRegion.p([-0.43, 0.33, 0.075]),
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

    return { s, side, arm, wrist, handRegion, fingers, thumb, leg, toes };
  });

  // ---------------------------------------------------------------------------
  // Reusable primitive construction.
  // ---------------------------------------------------------------------------
  function box(
    at: PointInput,
    size: [number, number, number],
    color: ColorInput,
    bone: Joint,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
    });
  }

  function crystal(
    at: PointInput,
    scale: [number, number, number],
    color: ColorInput,
    bone: Joint,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, 0), color, {
      at,
      scale,
      bone,
      rotation,
      flat: true,
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
      at,
      x,
      y,
      thickness,
      bevel,
      detail: 0.65,
      color,
      bone,
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
    const p = b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone,
      dir,
      up,
      axis: "z",
      texture,
    });
    return luminous ? glow(p, 1.15) : p;
  }

  function hotLine(
    points: PointInput[],
    radius: number,
    bone: Joint,
    color = C.hot,
    strength = 1.0,
  ) {
    return glow(
      b.sweep(polyline(points), radius, {
        color,
        bone,
        sides: 5,
        caps: "flat",
      }),
      strength,
    );
  }

  function bolt(at: PointInput, normal: DirectionInput, bone: Joint, radius = 0.022) {
    return b.part(new THREE.CylinderGeometry(radius, radius, 0.015, 6), goldStone, {
      at,
      dir: normal,
      bone,
      flat: true,
    });
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
      at,
      0.035,
      color,
      bone,
      x,
      y,
      0.008,
    );
  }

  // ---------------------------------------------------------------------------
  // Face first: broad brow, narrow incandescent eyes, separate stone jaws.
  // ---------------------------------------------------------------------------
  glow(
    b.sweep(neck, () => [0.17, 0.16], {
      color: C.ember,
      sides: 6,
      caps: "flat",
    }),
    0.85,
  );

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.CylinderGeometry(0.235 - i * 0.012, 0.25 - i * 0.012, 0.062, 6), basalt, {
      at: [0, 2.82 + i * 0.10, 0.005],
      bone: neck.joints[Math.min(i, 1)],
      flat: true,
      rotation: [0, i * 15, 0],
    });
  }

  crystal(hr.p([0, 0.10, -0.02]), [0.38 * H, 0.40 * H, 0.32 * H], basalt, head);

  plate(
    [
      [-0.32, -0.14], [-0.40, 0.12], [-0.29, 0.34],
      [0, 0.43], [0.29, 0.34], [0.40, 0.12], [0.32, -0.14],
    ],
    hr.p([0, 0, 0.125]),
    0.255,
    basalt,
    head,
  );

  // A recessed black face surface keeps the eyes unobstructed and readable.
  plate(
    [[-0.31, -0.12], [-0.33, 0.15], [0, 0.22], [0.33, 0.15], [0.31, -0.12], [0, -0.19]],
    hr.p([0, 0, 0.28]),
    0.095,
    C.socket,
    head,
    [1, 0, 0],
    [0, 1, 0],
    0.012,
  );

  for (const s of [1, -1]) {
    const sx: DirectionInput = [s, 0, 0];

    plate(
      [[0.035, 0.14], [0.31, 0.215], [0.36, 0.13], [0.29, 0.065], [0.075, 0.095]],
      hr.p([0, 0, 0.35]),
      0.105,
      basalt,
      head,
      sx,
    );

    plate(
      [[0.075, -0.005], [0.28, 0.05], [0.315, -0.04], [0.20, -0.16], [0.09, -0.10]],
      hr.p([0, 0, 0.34]),
      0.075,
      brokenStone,
      head,
      sx,
    );

    const eye = faceDrawing(
      eyeTexture,
      hr.p([s * 0.184, 0.054, 0.409]),
      0.225 * H,
      0.105 * H,
      head,
      [0, 0, 1],
      [0, 1, 0],
      true,
    );
    if (s < 0) {
      // Mirror only the UV drawing, not the rigid placement.
      const uv = eye.mesh.geometry.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      uv.needsUpdate = true;
    }

    plate(
      [[0.26, -0.045], [0.39, 0.10], [0.36, -0.11], [0.22, -0.24], [0.19, -0.13]],
      hr.p([0, 0, 0.235]),
      0.16,
      basalt,
      head,
      sx,
    );

    hotLine(
      [
        hr.p([s * 0.31, -0.075, 0.325]),
        hr.p([s * 0.27, -0.145, 0.325]),
        hr.p([s * 0.225, -0.177, 0.325]),
      ],
      0.009,
      head,
      C.orange,
      0.85,
    );

    // Back-swept broken crown horns are substantial stone wedges, not smooth cones.
    plate(
      [[-0.105, 0], [0.085, -0.025], [0.15, 0.13], [0.105, 0.37], [0.005, 0.27]],
      hr.p([s * 0.265, 0.29, -0.075]),
      0.19,
      basalt,
      head,
      sx,
      [0, 1, -0.26],
      0.012,
    );
    plate(
      [[-0.035, 0], [0.025, 0], [0.055, 0.20], [0.005, 0.16]],
      hr.p([s * 0.30, 0.36, 0.022]),
      0.018,
      brokenStone,
      head,
      sx,
      [0, 1, -0.26],
      0.004,
    );
  }

  plate(
    [[-0.17, -0.045], [-0.12, 0.13], [0, 0.19], [0.12, 0.13], [0.17, -0.045], [0, -0.12]],
    hr.p([0, 0.31, 0.257]),
    0.09,
    darkStone,
    head,
  );
  glow(diamond(hr.p([0, 0.33, 0.316]), 0.10, 0.18, C.hot, head), 1.05);
  diamond(hr.p([0, 0.34, 0.34]), 0.038, 0.083, C.whiteHot, head);

  // Upper jaw is part of the head; the lower assembly belongs exclusively to jaw.
  plate(
    [[-0.205, -0.025], [-0.145, 0.065], [0.145, 0.065], [0.205, -0.025], [0.13, -0.075], [-0.13, -0.075]],
    hr.p([0, -0.122, 0.314]),
    0.115,
    basalt,
    head,
    [1, 0, 0],
    [0, 1, 0],
    0.013,
  );
  plate(
    [[-0.245, 0.025], [-0.15, 0.065], [0.15, 0.065], [0.245, 0.025], [0.19, -0.10], [0, -0.16], [-0.19, -0.10]],
    hr.p([0, -0.265, 0.25]),
    0.23,
    basalt,
    jaw,
  );
  for (const s of [1, -1]) {
    box(hr.p([s * 0.075, -0.202, 0.365]), [0.085, 0.046, 0.061], brokenStone, head);
  }
  hotLine(
    [
      hr.p([-0.14, -0.262, 0.372]),
      hr.p([0, -0.30, 0.383]),
      hr.p([0.14, -0.262, 0.372]),
    ],
    0.009,
    jaw,
    C.orange,
    0.9,
  );
  diamond(hr.p([0, -0.345, 0.375]), 0.066, 0.09, goldStone, jaw);

  // ---------------------------------------------------------------------------
  // Furnace torso: a molten load-bearing core under separated basalt plates.
  // ---------------------------------------------------------------------------
  const torsoCore = b.loft(
    [
      { at: [0, 1.53, 0], w: 0.68, h: 0.49 },
      { at: [0, 1.91, 0], w: 0.75, h: 0.56 },
      { at: [0, 2.31, -0.015], w: 1.12, h: 0.65 },
      { at: [0, 2.67, -0.025], w: 1.36, h: 0.63 },
      { at: [0, 2.79, -0.025], w: 0.90, h: 0.48 },
    ],
    { color: C.ember, bone: spine, section: { ngon: 6 }, caps: "flat" },
  );
  glow(torsoCore, 0.8);

  // The great pectorals overlap the core, but leave an angular heart-shaped opening.
  for (const { s } of sides) {
    const sx: DirectionInput = [s, 0, 0];

    plate(
      [[0.04, 0.10], [0.34, 0.19], [0.67, 0.10], [0.66, -0.13], [0.40, -0.32], [0.15, -0.21]],
      [0, 2.62, 0.315],
      0.19,
      basalt,
      chest,
      sx,
      [0, 1, -0.08],
      0.03,
    );

    plate(
      [[0.23, 0.115], [0.59, 0.17], [0.65, 0.06], [0.42, -0.015]],
      [0, 2.69, 0.40],
      0.046,
      brokenStone,
      chest,
      sx,
      [0, 1, -0.08],
      0.012,
    );

    // A restrained gold chevron follows the pectoral's upper ledge.
    b.sweep(
      [
        [s * 0.17, 2.785, 0.419],
        [s * 0.36, 2.82, 0.414],
        [s * 0.57, 2.77, 0.414],
      ],
      0.012,
      { color: goldStone, bone: chest, section: { ngon: 4 }, caps: "flat" },
    );

    for (let i = 0; i < 3; i++) {
      const y = 2.31 - i * 0.205;
      const outer = 0.53 - i * 0.065;
      plate(
        [[0.13, 0.07], [outer, 0.14], [outer + 0.015, -0.04], [0.25, -0.14], [0.11, -0.08]],
        [0, y, 0.31 - i * 0.01],
        0.14,
        i === 2 ? darkStone : basalt,
        i === 0 ? chest : spine.joints[0],
        sx,
        [0, 1, 0.08],
        0.02,
      );
    }

    // Solid sidewalls connect the front cuirass to the back shell.
    b.loft(
      [
        { at: [s * 0.46, 2.03, -0.04], w: 0.23, h: 0.47 },
        { at: [s * 0.59, 2.38, -0.06], w: 0.29, h: 0.56 },
        { at: [s * 0.57, 2.65, -0.06], w: 0.30, h: 0.53 },
      ],
      { color: basalt, bone: spine, section: "box", caps: "flat" },
    );

    plate(
      [[0.07, 0.16], [0.52, 0.20], [0.65, 0.02], [0.50, -0.26], [0.11, -0.16]],
      [0, 2.56, -0.33],
      0.18,
      basalt,
      chest,
      [-s, 0, 0],
      [0, 1, 0],
      0.025,
    );
    plate(
      [[0.07, 0.10], [0.47, 0.14], [0.43, -0.15], [0.08, -0.20]],
      [0, 2.16, -0.29],
      0.16,
      darkStone,
      spine.joints[0],
      [-s, 0, 0],
    );
  }

  const heartPlate = plate(
    [[0, 0.34], [0.245, 0.13], [0.195, -0.16], [0, -0.34], [-0.195, -0.16], [-0.245, 0.13]],
    [0, 2.43, 0.379],
    0.14,
    darkStone,
    chest,
    [1, 0, 0],
    [0, 1, 0],
    0.022,
  );
  b.decal(heartPlate, heartTexture, {
    at: [0, 2.43, 0.46],
    dir: [0, 0, 1],
    size: [0.435, 0.60],
    bone: chest,
    lift: 0.003,
    segments: 6,
  }).mesh.material;
  // A separate luminous central insert keeps the basalt heart-frame non-emissive.
  glow(
    diamond([0, 2.45, 0.467], 0.132, 0.222, C.hot, chest),
    1.15,
  );
  glow(
    diamond([0, 2.475, 0.489], 0.058, 0.107, C.whiteHot, chest),
    1.1,
  );

  // Dorsal vertebrae: clear, broad blocks separated by orange heat.
  for (let i = 0; i < 5; i++) {
    const y = 1.80 + i * 0.195;
    diamond([0, y, -0.375], 0.22 + i * 0.018, 0.23, basalt,
      i < 3 ? spine.joints[0] : chest, [-1, 0, 0]);
    if (i < 4) {
      box([0, y + 0.11, -0.383], [0.075, 0.029, 0.045], C.orange,
        i < 3 ? spine.joints[0] : chest);
    }
  }

  // Pelvis and a split stone fauld.
  glow(
    b.part(new THREE.IcosahedronGeometry(1, 0), C.ember, {
      at: hips,
      scale: [0.49, 0.28, 0.32],
      bone: hips,
      flat: true,
    }),
    0.75,
  );
  plate(
    [[-0.40, 0.10], [-0.29, 0.21], [0.29, 0.21], [0.40, 0.10], [0.30, -0.10], [-0.30, -0.10]],
    [0, 1.60, 0.30],
    0.18,
    darkStone,
    hips,
  );
  faceDrawing(diamondTexture, [0, 1.64, 0.396], 0.19, 0.23, hips);
  for (const { s } of sides) {
    plate(
      [[0.05, 0.17], [0.34, 0.17], [0.47, -0.10], [0.28, -0.28], [0.08, -0.15]],
      [s * 0.14, 1.43, 0.275],
      0.19,
      basalt,
      hips,
      [s, 0, 0],
      [s * 0.12, 1, 0.10],
      0.025,
    );
    plate(
      [[-0.15, 0.16], [0.16, 0.16], [0.22, -0.13], [0.02, -0.23], [-0.16, -0.12]],
      [s * 0.46, 1.45, -0.06],
      0.29,
      basalt,
      hips,
      [0, 0, s],
      [s * 0.18, 1, 0],
      0.025,
    );
    bolt([s * 0.29, 1.68, 0.402], [0, 0, 1], hips, 0.025);
  }

  // ---------------------------------------------------------------------------
  // Massive shoulders, forearms, and articulated stone hands.
  // ---------------------------------------------------------------------------
  for (const side of sides) {
    const { s, arm, wrist, handRegion: hand, fingers, thumb } = side;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];

    glow(
      b.sweep(arm, (t) => [0.20 + 0.025 * Math.sin(t * Math.PI), 0.19], {
        color: C.ember,
        sides: 6,
        caps: "flat",
      }),
      0.9,
    );

    crystal(
      [s * 0.83, 2.69, -0.015],
      [0.36, 0.33, 0.30],
      C.orange,
      shoulder,
    );
    const shoulderCap = plate(
      [[-0.34, 0.04], [-0.20, 0.30], [0.14, 0.36], [0.43, 0.15], [0.41, -0.12], [0.17, -0.30], [-0.20, -0.22]],
      [s * 0.82, 2.73, 0.01],
      0.61,
      basalt,
      shoulder,
      [s, 0, 0],
      [0, 1, 0],
      0.04,
    );
    plate(
      [[-0.25, 0], [-0.12, 0.18], [0.16, 0.19], [0.34, 0.05], [0.18, -0.035]],
      [s * 0.82, 2.92, 0.065],
      0.60,
      brokenStone,
      shoulder,
      [s, 0, 0],
      [0, 1, 0],
      0.02,
    );

    // Engraved insignia sits on one large calm shoulder face.
    const shoulderSurface = b.surface(shoulderCap);
    const shoulderHit = shoulderSurface.nearest([s * 0.86, 2.76, 0.40]);
    b.decal(shoulderCap, inscriptionTexture, {
      at: shoulderHit,
      dir: [0, 0, 1],
      size: [0.25, 0.29],
      lift: 0.004,
      bone: shoulder,
      segments: 5,
      mirror: s < 0,
    });

    // Fractures occupy the outer corner, rather than washing out the entire plate.
    const crack = b.decal(shoulderCap, fractureTexture, {
      at: [s * 1.05, 2.70, 0.36],
      dir: [0, 0, 1],
      size: [0.22, 0.33],
      lift: 0.004,
      bone: shoulder,
      segments: 5,
      mirror: s < 0,
    });
    glow(crack, 0.65);

    for (let i = 0; i < 2; i++) {
      plate(
        [[-0.10, 0], [0.12, 0.01], [0.16, 0.18], [0.05, 0.41 - i * 0.07], [-0.045, 0.30]],
        [s * (0.93 + i * 0.22), 2.93 - i * 0.055, -0.15],
        0.22,
        basalt,
        shoulder,
        [s, 0, 0],
        [s * 0.22, 1, -0.22],
        0.012,
      );
      plate(
        [[-0.045, 0], [0.035, 0], [0.065, 0.16], [0.018, 0.23]],
        [s * (0.96 + i * 0.22), 3.00 - i * 0.055, -0.025],
        0.014,
        brokenStone,
        shoulder,
        [s, 0, 0],
        [s * 0.22, 1, -0.22],
        0.003,
      );
    }

    // Box-section armor sleeves retain a primitive puppet silhouette.
    const upperArmor = b.loft(
      [
        { at: arm.at(0.18), w: 0.46, h: 0.47 },
        { at: arm.at(0.30), w: 0.48, h: 0.50 },
        { at: arm.at(0.43), w: 0.35, h: 0.37 },
      ],
      { bone: shoulder, color: basalt, section: { ngon: 6 }, caps: "flat" },
    );
    const elbowCenter = arm.at(0.50);
    crystal(elbowCenter, [0.265, 0.23, 0.24], darkStone, elbow);
    const elbowFront = elbowCenter.at.clone().add(new THREE.Vector3(0, 0, 0.226));
    glow(diamond(elbowFront, 0.135, 0.17, C.orange, elbow), 0.9);

    const forearmArmor = b.loft(
      [
        { at: arm.at(0.59), w: 0.42, h: 0.45 },
        { at: arm.at(0.74), w: 0.60, h: 0.57 },
        { at: arm.at(0.94), w: 0.46, h: 0.43 },
      ],
      { bone: elbow, color: basalt, section: { ngon: 6 }, caps: "flat" },
    );

    const upperSkin = b.surface(upperArmor);
    for (const azimuth of [0, s * 85]) {
      const center = arm.at(0.31);
      const hit = upperSkin.around(center).at(azimuth, 0);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.038, 0.043, 0.018, 6), goldStone, hit, {
          embed: 0.15,
          bone: shoulder,
        });
      }
    }

    const forearmCenter = arm.at(0.76);
    const forearmFront = b.surface(forearmArmor).nearest(
      forearmCenter.at.clone().add(new THREE.Vector3(0, 0, 0.45)),
    );
    b.decal(forearmArmor, inscriptionTexture, {
      at: forearmFront,
      dir: [0, 0, 1],
      size: [0.23, 0.38],
      roll: s * 37,
      lift: 0.003,
      bone: elbow,
      segments: 5,
    });

    // A heavy outer splint gives each gauntlet a chiselled, asymmetric edge.
    const splintCenter = arm.at(0.78).at;
    plate(
      [[-0.10, 0.22], [0.09, 0.28], [0.16, 0.04], [0.10, -0.27], [-0.09, -0.22]],
      [splintCenter.x + s * 0.24, splintCenter.y, splintCenter.z - 0.015],
      0.25,
      darkStone,
      elbow,
      [s * 0.70, 0.55, 0],
      [-s * 0.55, 0.70, 0],
      0.02,
    );

    // Thin, rigid octagonal cuffs are tied to the actual wrist axis.
    b.part(new THREE.CylinderGeometry(0.245, 0.26, 0.105, 6), darkStone, {
      at: wrist,
      dir: wrist.axis,
      bone: wrist,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.249, 0.249, 0.027, 6), goldStone, {
      at: hand.p([0, 0.014, 0]),
      dir: wrist.axis,
      bone: wrist,
      flat: true,
    });

    glow(
      b.frustumBox(hand.p([0, 0.025, 0]), hand.p([0, 0.25, 0.015]),
        [0.40, 0.28], [0.43, 0.27], {
          bone: wrist,
          color: C.ember,
        }),
      0.7,
    );
    b.frustumBox(
      hand.p([0, 0.025, 0]),
      hand.p([0, 0.245, 0.015]),
      [0.46, 0.28],
      [0.47, 0.30],
      { color: basalt, bone: wrist },
    );

    // Back-of-hand shield, drawn in the hand's own frame.
    plate(
      [[-0.21, -0.11], [0.21, -0.11], [0.235, 0.08], [0.13, 0.15], [-0.13, 0.15], [-0.235, 0.08]],
      hand.p([0, 0.14, 0.175]),
      0.055,
      darkStone,
      wrist,
      hand.d([1, 0, 0]),
      hand.d([0, 1, 0]),
      0.012,
    );
    glow(
      diamond(
        hand.p([0, 0.145, 0.208]),
        0.095,
        0.14,
        C.orange,
        wrist,
        hand.d([1, 0, 0]),
        hand.d([0, 1, 0]),
      ),
      0.8,
    );

    for (const [i, digit] of [...fingers, thumb].entries()) {
      const isThumb = i === 3;
      const r = isThumb ? 0.075 : 0.072;
      glow(
        b.sweep(digit, r * 0.74, {
          color: C.orange,
          sides: 5,
          caps: "flat",
        }),
        0.8,
      );

      b.frustumBox(
        digit.at(0.02), digit.at(0.44),
        [r * 2.1, r * 2.0], [r * 2.0, r * 1.9],
        { color: basalt, bone: digit.joints[0] },
      );
      b.frustumBox(
        digit.at(0.57), digit.at(0.99),
        [r * 2.05, r * 1.9], [r * 1.75, r * 1.75],
        { color: basalt, bone: digit.joints[1] },
      );

      const knuckle = digit.at(0.05).at.clone().add(hand.d([0, 0, 0.095]));
      crystal(knuckle, [0.083, 0.078, 0.065], brokenStone, digit.joints[0]);
      const nail = digit.at(0.83);
      const nailAt = nail.at.clone().add(hand.d([0, 0, r * 0.99]));
      plate(
        [[-0.047, -0.042], [0.047, -0.042], [0.042, 0.045], [0, 0.065], [-0.042, 0.045]],
        nailAt,
        0.025,
        darkStone,
        digit.joints[1],
        hand.d([1, 0, 0]),
        hand.d([0, 1, 0]),
        0.005,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Pillar legs and broad three-toed feet.
  // ---------------------------------------------------------------------------
  for (const { s, leg, toes } of sides) {
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;

    glow(
      b.sweep(leg, () => [0.195, 0.19], {
        color: C.ember,
        sides: 6,
        caps: "flat",
      }),
      0.8,
    );
    b.loft(
      [
        { at: leg.at(0.07), w: 0.45, h: 0.43 },
        { at: leg.at(0.24), w: 0.51, h: 0.48 },
        { at: leg.at(0.42), w: 0.39, h: 0.38 },
      ],
      { color: basalt, bone: hip, section: { ngon: 6 }, caps: "flat" },
    );

    plate(
      [[-0.19, 0.13], [0.12, 0.19], [0.22, -0.04], [0.12, -0.18], [-0.17, -0.11]],
      [s * 0.505, 1.19, 0.25],
      0.12,
      darkStone,
      hip,
      [s, 0, 0],
      [0, 1, 0],
      0.02,
    );

    crystal([s * 0.54, 0.98, 0.105], [0.27, 0.25, 0.245], C.orange, knee);
    const kneePlate = plate(
      [[0, 0.22], [0.235, 0.075], [0.18, -0.13], [0, -0.23], [-0.18, -0.13], [-0.235, 0.075]],
      [s * 0.54, 0.99, 0.30],
      0.145,
      basalt,
      knee,
      [1, 0, 0],
      [0, 1, 0],
      0.022,
    );
    b.decal(kneePlate, diamondTexture, {
      at: [s * 0.54, 1.00, 0.38],
      dir: [0, 0, 1],
      size: [0.18, 0.23],
      lift: 0.003,
      bone: knee,
      segments: 4,
    });

    b.loft(
      [
        { at: leg.at(0.59), w: 0.47, h: 0.44 },
        { at: leg.at(0.80), w: 0.49, h: 0.46 },
        { at: leg.at(0.97), w: 0.40, h: 0.38 },
      ],
      { color: basalt, bone: knee, section: { ngon: 6 }, caps: "flat" },
    );

    plate(
      [[-0.21, 0.17], [0.12, 0.21], [0.23, 0.02], [0.15, -0.25], [-0.14, -0.22]],
      [s * 0.585, 0.65, 0.31],
      0.13,
      basalt,
      knee,
      [s, 0, 0],
      [0, 1, 0.06],
      0.025,
    );

    hotLine(
      [
        [s * 0.60, 0.85, 0.387],
        [s * 0.56, 0.70, 0.391],
        [s * 0.63, 0.61, 0.391],
        [s * 0.61, 0.43, 0.381],
      ],
      0.011,
      knee,
      C.orange,
      0.85,
    );
    for (let i = 0; i < 2; i++) {
      plate(
        [[-0.13, 0.06], [0.12, 0.10], [0.18, -0.04], [-0.10, -0.10]],
        [s * 0.78, 0.76 - i * 0.20, 0.045],
        0.24,
        darkStone,
        knee,
        [0, 0, s],
        [0, 1, 0],
        0.014,
      );
    }

    // An orange sole is mostly buried beneath the foot, visible only at its rim.
    glow(
      box([s * 0.60, 0.205, 0.25], [0.57, 0.10, 0.70], C.ember, ankle),
      0.65,
    );
    plate(
      [[-0.28, 0], [-0.31, 0.16], [-0.20, 0.32], [0.19, 0.34], [0.30, 0.16], [0.27, 0]],
      [s * 0.60, 0.15, 0.18],
      0.61,
      basalt,
      ankle,
      [1, 0, 0],
      [0, 1, -0.23],
      0.022,
    );

    for (let i = 0; i < toes.length; i++) {
      const toeX = s * 0.60 + (i - 1) * 0.175;
      plate(
        [[-0.078, 0], [0.078, 0], [0.085, 0.15], [0.04, 0.23], [-0.05, 0.22], [-0.085, 0.13]],
        [toeX, 0.15, 0.55 + (i === 1 ? 0.035 : 0)],
        0.30,
        i === 1 ? basalt : darkStone,
        toes[i],
        [1, 0, 0],
        [0, 1, -0.14],
        0.012,
      );
      box([toeX, 0.275, 0.707 + (i === 1 ? 0.035 : 0)],
        [0.105, 0.085, 0.027], brokenStone, toes[i]);
    }
  }

  // ---------------------------------------------------------------------------
  // A compact caldera stage. The low setting frames the silhouette, never the face.
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(2.27, 2.35, 0.15, 12), floorStone, {
    at: [0, 0.075, 0.06],
    scale: [1, 1, 0.55],
    bone: root,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(2.21, 2.24, 0.028, 12), darkStone, {
    at: [0, 0.145, 0.06],
    scale: [1, 1, 0.55],
    bone: root,
    flat: true,
  });

  const fissures: number[][][] = [
    [[-2.04, 0.166, -0.24], [-1.57, 0.166, -0.11], [-1.22, 0.166, 0.12], [-0.88, 0.166, 0.18]],
    [[2.06, 0.166, 0.28], [1.66, 0.166, 0.17], [1.39, 0.166, 0.37], [1.02, 0.166, 0.34]],
    [[-0.20, 0.166, 1.17], [-0.11, 0.166, 0.84], [0.17, 0.166, 0.66], [0.07, 0.166, 0.36]],
    [[0.12, 0.166, -1.12], [0.36, 0.166, -0.82], [0.23, 0.166, -0.48], [0.03, 0.166, -0.25]],
    [[-1.54, 0.166, -0.11], [-1.40, 0.166, -0.52], [-1.03, 0.166, -0.82]],
    [[1.66, 0.166, 0.17], [1.65, 0.166, -0.18], [1.91, 0.166, -0.43]],
    [[-0.11, 0.166, 0.84], [-0.44, 0.166, 0.94], [-0.72, 0.166, 0.86]],
  ];
  for (const path of fissures) {
    b.sweep(path, 0.030, { color: C.socket, bone: root, sides: 4, caps: "flat" });
    hotLine(path, 0.012, root, C.orange, 0.8);
  }

  // Flat polygonal plates define a handful of large, readable paving fragments.
  const floorFragments: {
    outline: OutlinePoint[];
    at: number[];
  }[] = [
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
  for (const frag of floorFragments) {
    plate(
      frag.outline,
      frag.at,
      0.025,
      floorStone,
      root,
      [1, 0, 0],
      [0, 0, -1],
      0.006,
    );
  }

  // Ancient gold boundary markers echo the diamond language on the golem.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 2.12;
    const z = Math.cos(a) * 1.14 + 0.06;
    diamond(
      [x, 0.168, z],
      0.10,
      0.16,
      goldStone,
      root,
      [Math.cos(a), 0, -Math.sin(a)],
      [Math.sin(a), 0, Math.cos(a)],
    );
  }

  // A few cooled basalt splinters at the rear corners, below knee height.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (1.37 + i * 0.17);
      const z = -0.62 + i * 0.09;
      const height = 0.32 + (2 - i) * 0.11;
      const axis = new THREE.Vector3(s * (0.12 + i * 0.06), 1, -0.08).normalize();
      const bottom = new THREE.Vector3(x, 0.16, z);
      const top = bottom.clone().addScaledVector(axis, height);
      b.frustumBox(bottom, top, [0.21, 0.22], [0.13, 0.15], {
        color: basalt,
        bone: root,
      });
      crystal(top, [0.105, 0.07, 0.10], brokenStone, root);
      if (i === 1) {
        const p = bottom.clone().add(new THREE.Vector3(-s * 0.055, height * 0.43, 0.12));
        glow(crystal(p, [0.034, 0.11, 0.023], C.orange, root), 0.9);
      }
    }
  }

  // Grounded rubble, deliberately sparse and larger than texture-scale detail.
  for (let i = 0; i < 12; i++) {
    const a = random() * Math.PI * 2;
    const radius = 1.38 + random() * 0.63;
    const size = 0.045 + random() * 0.053;
    crystal(
      [Math.sin(a) * radius, 0.16 + size * 0.45, Math.cos(a) * radius * 0.49 + 0.06],
      [size * 1.3, size * 0.55, size],
      i % 4 === 0 ? brokenStone : darkStone,
      root,
      [random() * 35, random() * 180, random() * 25],
    );
  }

  // Thin mounting slab and small museum-like title, kept below the feet.
  box([0, 0.119, 1.245], [0.89, 0.135, 0.055], darkStone, root);
  faceDrawing(plaqueTexture, [0, 0.122, 1.275], 0.85, 0.2125, root);
  for (const s of [1, -1]) {
    bolt([s * 0.405, 0.12, 1.283], [0, 0, 1], root, 0.014);
  }

  // A few angular cinders form a restrained heat accent behind the shoulders.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 2.76 + i * 0.18;
      const x = s * (1.12 + Math.sin(i * 1.7) * 0.12);
      glow(
        crystal(
          [x, y, -0.35 - i * 0.025],
          [0.018 + i * 0.003, 0.040 - i * 0.006, 0.017],
          i % 2 ? C.hot : C.orange,
          chest,
          [15, 0, s * (18 + i * 12)],
        ),
        1.2,
      );
    }
  }

  return b.root;
}
