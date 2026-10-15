import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  noise,
  mix,
  svg,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Vulcanite — The Fractured Sovereign",
  description:
    "A monumental basalt elemental with genuinely split armor, recessed molten fissures, a radiant mineral heart, and a volcanic crown. Fully articulated on a broken caldera seal.",
};

/*
ART-DIRECTION REVISION
1. Replace the clean robot-like armor with genuinely separated, irregular basalt
   slabs. Recessed lava and dark fracture walls make the material unmistakable.
2. Strengthen the forearms, hands, and feet. Cover the exposed finger ends with
   substantial stone phalanges so the joints read as molten articulation.
3. Establish a heat hierarchy: white-gold eyes and heart, orange primary faults,
   red-hot joint interiors. Keep broad expanses of cool stone between them.
4. Remove the tiny, aliasing decorative bands. Use fewer, larger elemental
   inscriptions, mineral inlays, and chipped facets instead.
5. Break up the ceremonial platform with branching incandescent fissures and
   displaced crust. Preserve the clear front view and the neutral rigging pose.
*/

type P = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Vulcanite",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(7349);

  const C = {
    recess: "#16121f",
    black: "#222333",
    edge: "#626373",
    gold: "#b68a54",
    paleGold: "#e5bf81",
    ember: "#be3511",
    red: "#e9510c",
    orange: "#ff941b",
    yellow: "#ffcf65",
    white: "#fff3bf",
    earth: "#28212c",
  };

  const basalt = paint((p, n) => {
    const v = noise(p, 0.20, 4);
    const lit = n.x * 0.35 + n.y * 0.80 + n.z * 0.48 > 0.24;
    const base = lit
      ? mix("#4b4c5d", "#71717e", v * 0.46)
      : mix("#2c293c", "#414052", v * 0.45);
    return mix(base, "#985136", Math.max(0, -n.y) * 0.23);
  });

  const paleBasalt = paint((p, n) => {
    const v = noise(p, 0.24, 11);
    const lit = n.x * 0.35 + n.y * 0.80 + n.z * 0.48 > 0.2;
    return lit
      ? mix("#676775", "#93908e", v * 0.42)
      : mix("#3d374b", "#595265", v * 0.45);
  });

  const groundPaint = paint((p, n) =>
    mix(
      "#302632",
      "#62515b",
      noise(p, 0.36, 8) * 0.5 + Math.max(0, n.y) * 0.13,
    ),
  );

  const eyeTex = svg(
    `<svg viewBox="0 0 160 64">
      <path d="M5 13 L153 4 L123 50 L24 56Z" fill="#da4514"/>
      <path d="M15 18 L143 12 L116 42 L30 46Z" fill="#ffb52b"/>
      <path d="M27 23 L130 17 L110 32 L37 36Z" fill="#fff5b7"/>
      <path d="M88 15 L77 43 L90 41 L103 13Z" fill="#fffbd6"/>
    </svg>`,
    { size: 256 },
  );

  const runeTex = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 9 L111 62 L64 111 L17 62Z"
        fill="none" stroke="#553123" stroke-width="14"/>
      <path d="M64 9 L111 62 L64 111 L17 62Z"
        fill="none" stroke="#ffcf73" stroke-width="6"/>
      <path d="M64 31 L88 62 L64 88 L40 62Z M64 111 V170
        M39 132 L64 157 L89 132 M46 174 L64 185 L82 174"
        fill="none" stroke="#ffc25c" stroke-width="7"/>
      <path d="M64 45 L77 62 L64 76 L51 62Z" fill="#fff0ac"/>
    </svg>`,
    { size: 384 },
  );

  const crackTex = svg(
    `<svg viewBox="0 0 160 160">
      <g fill="none" stroke-linejoin="miter">
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158
          M44 67 L9 88 M88 96 L129 77 L151 91"
          stroke="#17111c" stroke-width="17"/>
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158
          M44 67 L9 88 M88 96 L129 77 L151 91"
          stroke="#c74111" stroke-width="8"/>
        <path d="M17 3 L52 40 L43 68 L89 96 L76 127 L103 158
          M88 96 L129 77"
          stroke="#ffbd45" stroke-width="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const coreTex = svg(
    `<svg viewBox="0 0 160 160">
      <path d="M80 5 L149 80 L80 155 L11 80Z" fill="#df4310"/>
      <path d="M80 17 L136 80 L80 143 L24 80Z" fill="#ffae27"/>
      <path d="M80 17 L80 143 L24 80Z" fill="#ffd775"/>
      <path d="M80 36 L118 80 L80 124 L42 80Z"
        fill="none" stroke="#fff1a5" stroke-width="6"/>
      <path d="M80 51 L103 80 L80 109 L57 80Z" fill="#fff8ce"/>
      <path d="M80 5 V36 M149 80 H118 M80 155 V124 M11 80 H42"
        stroke="#fff2a5" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const sealTex = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#725447">
        <path d="M128 14 A114 114 0 0 1 241 143 M231 176 A114 114 0 0 1 79 231
          M48 209 A114 114 0 0 1 18 95 M31 67 A114 114 0 0 1 98 18"
          stroke-width="3"/>
        <path d="M128 27 L229 128 L128 229 L27 128Z" stroke-width="3"/>
        <path d="M128 57 L199 128 L128 199 L57 128Z" stroke-width="2"/>
        <path d="M128 82 L169 128 L128 174 L87 128Z" stroke-width="5"/>
        <path d="M128 12 V37 M128 218 V243 M12 128 H37 M218 128 H243"
          stroke-width="6"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // Skeleton: neutral, broad A/T rest pose, with independent jaws and digits.
  const hips = b.joint("hips", {
    at: [0, 1.47, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.47, 0], [0, 2.02, 0], [0, 2.68, -0.015]],
    {
      parent: hips,
      names: ["waist", "chest", "upperChest"],
      role: "spine",
    },
  );
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 2.94, -0.025],
    dir: [0, 1, 0],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 3.23, 0],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 3.10, 0.035],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.78, 2.72, 0],
        [s * 1.39, 2.49, 0],
        [s * 1.89, 2.25, 0.015],
      ],
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.46, 1.48, 0],
        [s * 0.58, 0.95, 0.015],
        [s * 0.64, 0.40, 0.055],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.64, 0.18, 0.21],
      },
    );
    const fingers = [0, 1, 2].map((i) => {
      const x = s * (1.96 + i * 0.16);
      const points: P[] = [
        [x, 2.105, 0.105],
        [x + s * 0.035, 1.92 - i * 0.02, 0.145],
        [x + s * 0.055, 1.76 - i * 0.018, 0.16],
      ];
      const chain = b.chain(`finger${side}${i + 1}`, points, {
        parent: arm.tip!,
        names: [`finger${side}${i + 1}Base`, `finger${side}${i + 1}Tip`],
        role: "digit",
      });
      return { chain, points };
    });
    const thumbPoints: P[] = [
      [s * 1.91, 2.22, 0.13],
      [s * 1.81, 2.08, 0.33],
      [s * 1.81, 1.93, 0.40],
    ];
    const thumb = b.chain(`thumb${side}`, thumbPoints, {
      parent: arm.tip!,
      names: [`thumb${side}Base`, `thumb${side}Tip`],
      role: "digit",
    });
    return { s, side, arm, leg, fingers, thumb, thumbPoints };
  });

  function box(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = hips,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      name, at, bone, rotation,
    });
  }

  function rock(
    name: string,
    at: P,
    size: P,
    color: Fill,
    bone: Joint = hips,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      name, at, bone, scale: size, rotation, flat: true,
    });
  }

  function molten(
    name: string,
    at: P,
    size: P,
    bone: Joint,
    color = C.ember,
  ) {
    return glow(rock(name, at, size, color, bone), 1.15);
  }

  function drawing(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    bone: Joint,
    luminous = false,
    dir: P = [0, 0, 1],
  ) {
    const p = b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, bone, name, texture, dir, axis: "z",
    });
    if (luminous) glow(p, 1.4);
    return p;
  }

  function plate(
    name: string,
    at: P,
    w: number,
    h: number,
    depth: number,
    bone: Joint,
    color: Fill = basalt,
    cut = 0.18,
    x: P = [1, 0, 0],
    y: P = [0, 1, 0],
  ) {
    const X = w / 2;
    const Y = h / 2;
    const c = Math.min(w, h) * cut;
    return b.extrude(
      [
        [-X + c, -Y], [X - c, -Y], [X, -Y + c], [X, Y - c],
        [X - c, Y], [-X + c, Y], [-X, Y - c], [-X, -Y + c],
      ],
      {
        name, at, x, y, thickness: depth,
        bevel: Math.min(0.027, depth * 0.14),
        bone, color,
      },
    );
  }

  function diamond(
    name: string,
    at: P,
    w: number,
    h: number,
    depth: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.extrude(
      [[0, -h / 2], [w / 2, 0], [0, h / 2], [-w / 2, 0]],
      {
        name, at, x: [1, 0, 0], y: [0, 1, 0],
        thickness: depth, bevel: Math.min(depth * 0.1, 0.015),
        color, bone,
      },
    );
  }

  // Two separate solids with an open, jagged fault between them.
  // The incandescent mineral occupies the bottom of that fault, not its lip.
  function fracturedPlate(
    name: string,
    at: P,
    w: number,
    h: number,
    depth: number,
    bone: Joint,
    mirror = 1,
    color: Fill = basalt,
    gap = 0.026,
    xAxis: P = [1, 0, 0],
  ) {
    const X = w / 2;
    const Y = h / 2;
    const cut = Math.min(w, h) * 0.18;
    const seam: [number, number][] = [
      [-w * 0.14, Y],
      [-w * 0.025, h * 0.23],
      [-w * 0.12, h * 0.045],
      [w * 0.105, -h * 0.17],
      [w * 0.015, -Y],
    ];
    const left: [number, number][] = [
      [-X + cut, -Y],
      ...[...seam].reverse().map(([x, y]): [number, number] => [x - gap / 2, y]),
      [-X + cut, Y], [-X, Y - cut], [-X, -Y + cut],
    ];
    const right: [number, number][] = [
      ...seam.map(([x, y]): [number, number] => [x + gap / 2, y]),
      [X - cut, -Y], [X, -Y + cut], [X, Y - cut], [X - cut, Y],
    ];

    const Xv = new THREE.Vector3(...xAxis).normalize().multiplyScalar(mirror);
    const Yv = new THREE.Vector3(0, 1, 0);
    const Nv = Xv.clone().cross(Yv);
    // Keep the hot vein on the viewer-facing side on mirrored front plates.
    const outward = Math.abs(Nv.z) > 0.5
      ? new THREE.Vector3(0, 0, 1)
      : Nv.clone().multiplyScalar(mirror);

    const modelPoint = (x: number, y: number, lift: number): P => {
      const p = new THREE.Vector3(...at)
        .addScaledVector(Xv, x)
        .addScaledVector(Yv, y)
        .addScaledVector(outward, lift);
      return [p.x, p.y, p.z];
    };

    [left, right].forEach((outline, i) => {
      b.extrude(outline, {
        name: `${name}Crust${i}`,
        at,
        x: [Xv.x, Xv.y, Xv.z],
        y: [0, 1, 0],
        thickness: depth,
        bevel: 0.009,
        color: i === 0 ? color : basalt,
        bone,
      });
    });

    const path = seam.map(([x, y]) => modelPoint(x, y, depth / 2 - 0.026));
    b.sweep(path, gap * 0.77, {
      color: C.ember, bone, sides: 4, caps: "flat", name: `${name}FaultWalls`,
    });
    glow(b.sweep(path, gap * 0.43, {
      color: C.orange, bone, sides: 4, caps: "flat", name: `${name}Lava`,
    }), 1.5);
    glow(b.sweep(
      seam.slice(1, 4).map(([x, y]) => modelPoint(x, y, depth / 2 - 0.012)),
      gap * 0.13,
      { color: C.yellow, bone, sides: 4, caps: "flat", name: `${name}HotCenter` },
    ), 1.6);
  }

  // Tight setting: broken ash crust over a low, twelve-sided seal.
  b.part(new THREE.CylinderGeometry(1.78, 1.87, 0.14, 12), C.earth, {
    at: [0, 0.07, 0], bone: hips, name: "calderaFoundation",
  });
  b.part(new THREE.CylinderGeometry(1.72, 1.78, 0.055, 12), groundPaint, {
    at: [0, 0.155, 0], bone: hips, name: "ashStonePlatform",
  });
  drawing("erodedCalderaSeal", [0, 0.186, 0], [3.19, 3.19], sealTex, hips, false, [0, 1, 0]);

  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const r = 1.70;
    plate(
      `rimBlock${i}`,
      [Math.sin(a) * r, 0.13, Math.cos(a) * r],
      i % 3 === 0 ? 0.38 : 0.47,
      0.18, 0.23, hips, i % 3 === 0 ? paleBasalt : basalt,
      0.23, [Math.cos(a), 0, -Math.sin(a)],
    );
  }

  const fissures: P[][] = [
    [[-0.13, 0.194, 0.54], [-0.36, 0.194, 0.82], [-0.23, 0.194, 1.04], [-0.58, 0.194, 1.34], [-0.71, 0.194, 1.60]],
    [[-0.36, 0.194, 0.82], [-0.74, 0.194, 0.95], [-1.04, 0.194, 0.85], [-1.38, 0.194, 1.04]],
    [[0.75, 0.194, -0.24], [1.01, 0.194, -0.41], [1.13, 0.194, -0.72], [1.52, 0.194, -0.81]],
    [[1.01, 0.194, -0.41], [1.30, 0.194, -0.12], [1.68, 0.194, -0.21]],
    [[-0.52, 0.194, -0.62], [-0.91, 0.194, -0.87], [-1.26, 0.194, -0.81]],
  ];

  fissures.forEach((path, i) => {
    b.sweep(path, 0.041, {
      color: C.recess, bone: hips, caps: "flat", sides: 4, name: `groundFault${i}`,
    });
    glow(b.sweep(
      path.map(([x, y, z]) => [x, y + 0.025, z]),
      0.017,
      { color: C.red, bone: hips, caps: "flat", sides: 4, name: `groundLava${i}` },
    ), 1.3);
    glow(b.sweep(
      path.map(([x, y, z]) => [x, y + 0.036, z]),
      0.006,
      { color: C.yellow, bone: hips, caps: "flat", sides: 4, name: `groundLavaCenter${i}` },
    ), 1.4);
  });

  for (let i = 0; i < 15; i++) {
    const a = random() * Math.PI * 2;
    const r = 1.18 + random() * 0.39;
    const size = 0.045 + random() * 0.075;
    rock(
      `fallenBasalt${i}`,
      [Math.sin(a) * r, 0.19 + size * 0.6, Math.cos(a) * r],
      [size * 1.3, size * 0.65, size],
      i % 5 === 0 ? paleBasalt : basalt,
      hips, [random() * 35, random() * 90, random() * 30],
    );
  }

  // Continuous inner body, kept dark-red except where primary seams expose heat.
  glow(b.sweep(spine, (t) => [0.32 + t * 0.28, 0.26 + t * 0.10], {
    color: C.ember, sides: 6, smooth: false, caps: "flat", name: "moltenTorso",
  }), 0.85);

  const chestBone = spine.joints[1];
  plate("pelvisCore", [0, 1.47, 0.01], 1.0, 0.43, 0.59, hips);
  plate("waistSocket", [0, 1.83, 0], 0.70, 0.36, 0.58, spine.joints[0], C.recess);

  for (let j = 0; j < 3; j++) {
    plate(`abdominalCourse${j}`, [0, 1.77 + j * 0.16, 0.30],
      0.55 + j * 0.12, 0.125, 0.14, chestBone, j === 2 ? paleBasalt : basalt);
    glow(box(`abdominalSeam${j}`, [0, 1.85 + j * 0.16, 0.29],
      [0.41 + j * 0.12, 0.023, 0.035], C.orange, chestBone), 1.2);
  }

  for (const s of [1, -1]) {
    // The breastplates are each two independent shards, not a drawn crack.
    b.extrude(
      [
        [0.13, 0.32], [0.68, 0.40], [0.79, 0.22],
        [0.57, 0.08], [0.50, 0.14], [0.36, 0.015], [0.23, 0.055],
      ],
      {
        at: [0, 2.53, 0.24], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.30, bevel: 0.018, color: paleBasalt,
        bone: chestBone, name: `pectoralUpper${s}`,
      },
    );
    b.extrude(
      [
        [0.10, -0.38], [0.59, -0.26], [0.84, 0.13], [0.80, 0.19],
        [0.57, 0.045], [0.50, 0.105], [0.36, -0.02], [0.25, 0.015],
      ],
      {
        at: [0, 2.53, 0.235], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.29, bevel: 0.015, color: basalt,
        bone: chestBone, name: `pectoralLower${s}`,
      },
    );
    const chestFault: P[] = [
      [s * 0.24, 2.565, 0.371],
      [s * 0.36, 2.528, 0.371],
      [s * 0.50, 2.651, 0.371],
      [s * 0.57, 2.591, 0.371],
      [s * 0.80, 2.735, 0.371],
    ];
    glow(b.sweep(chestFault, 0.012, {
      color: C.orange, bone: chestBone, caps: "flat", sides: 4, name: `pectoralFault${s}`,
    }), 1.5);

    plate(`ribGuard${s}`, [s * 0.57, 2.10, 0.025], 0.32, 0.57, 0.60, chestBone);
    plate(`collar${s}`, [s * 0.43, 2.92, 0.04], 0.65, 0.18, 0.61, chestBone);
    diamond(`collarInlay${s}`, [s * 0.44, 2.91, 0.355], 0.22, 0.075, 0.015, C.gold, chestBone);

    b.extrude(
      [[-0.19, 0.19], [0.18, 0.17], [0.23, -0.20], [0.07, -0.34], [-0.24, -0.22]],
      {
        at: [s * 0.52, 1.50, 0.34],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.15,
        bevel: 0.02, bone: hips, color: paleBasalt, name: `hipSkirt${s}`,
      },
    );
    diamond(`hipGoldKey${s}`, [s * 0.52, 1.53, 0.426],
      0.14, 0.23, 0.012, C.gold, hips);
    diamond(`hipKeyInset${s}`, [s * 0.52, 1.53, 0.437],
      0.075, 0.14, 0.012, C.recess, hips);
  }

  // The heart remains the unequivocal focal point.
  diamond("heartObsidianSocket", [0, 2.49, 0.395], 0.66, 0.82, 0.17, C.recess, chestBone);
  diamond("heartAncientRim", [0, 2.49, 0.49], 0.52, 0.68, 0.08, C.gold, chestBone);
  diamond("heartInnerShadow", [0, 2.49, 0.537], 0.44, 0.60, 0.028, C.ember, chestBone);
  glow(diamond("heartCrystal", [0, 2.49, 0.565], 0.35, 0.49, 0.11, C.yellow, chestBone), 1.8);
  drawing("heartCrystalFacets", [0, 2.49, 0.627], [0.35, 0.49], coreTex, chestBone, true);
  for (const s of [1, -1]) {
    diamond(`heartClamp${s}`, [s * 0.268, 2.49, 0.55],
      0.13, 0.20, 0.10, paleBasalt, chestBone);
  }
  diamond("sternumKeystone", [0, 2.88, 0.39], 0.18, 0.25, 0.12, basalt, chestBone);
  diamond("heartLowerLock", [0, 2.09, 0.39], 0.17, 0.22, 0.10, paleBasalt, chestBone);

  plate("backCentralShield", [0, 2.45, -0.34], 1.02, 0.91, 0.25, chestBone);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.31;
    plate(`backColumn${i}`, [x, 2.57, -0.49], 0.23, 0.80, 0.17, chestBone, paleBasalt);
    glow(box(`backVent${i}`, [x, 2.54, -0.585],
      [0.040, 0.46, 0.025], C.orange, chestBone), 1.25);
    rock(`backChimney${i}`, [x, 2.98, -0.37],
      [0.15, 0.25 + (i === 1 ? 0.10 : 0), 0.15], basalt, chestBone);
  }

  // Stern mask, framed rather than obscured by the crown.
  molten("neckFire", [0, 3.04, 0], [0.22, 0.22, 0.20], neck);
  plate("headMainBasalt", [0, 3.32, 0], 0.70, 0.56, 0.48, head, basalt, 0.24);
  plate("faceRecess", [0, 3.28, 0.247], 0.56, 0.32, 0.042, head, C.recess, 0.22);

  for (const s of [1, -1]) {
    const eye = drawing(`furnaceEye${s}`, [s * 0.155, 3.301, 0.283],
      [0.258, 0.116], eyeTex, head, true);
    if (s < 0) {
      const uv = eye.mesh.geometry.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      uv.needsUpdate = true;
    }
    b.extrude(
      [[0.035, 0.00], [0.29, 0.08], [0.33, 0.19], [0.19, 0.205], [0.055, 0.14]],
      {
        at: [0, 3.31, 0.29], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.11, bevel: 0.012, color: paleBasalt, bone: head, name: `brow${s}`,
      },
    );
    b.extrude(
      [[0.235, 0.13], [0.355, 0.17], [0.34, -0.13], [0.19, -0.23], [0.18, -0.08]],
      {
        at: [0, 3.23, 0.23], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.16, bevel: 0.015, color: basalt, bone: head, name: `cheek${s}`,
      },
    );
  }
  diamond("nasalKeystone", [0, 3.25, 0.315], 0.12, 0.24, 0.13, paleBasalt, head);
  plate("upperJaw", [0, 3.155, 0.25], 0.37, 0.095, 0.15, head);
  glow(box("mouthFurnaceSlit", [0, 3.085, 0.245],
    [0.30, 0.032, 0.055], C.orange, jaw), 1.35);
  b.extrude(
    [[-0.23, 0.065], [0.23, 0.065], [0.18, -0.08], [0, -0.14], [-0.18, -0.08]],
    {
      at: [0, 3.02, 0.23], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.20, bevel: 0.02, color: paleBasalt, bone: jaw, name: "separateLowerJaw",
    },
  );
  diamond("chinGoldSeal", [0, 2.985, 0.34], 0.085, 0.12, 0.012, C.gold, jaw);

  b.extrude(
    [[-0.16, 0], [0.16, 0], [0.14, 0.26], [0.025, 0.46], [-0.13, 0.29]],
    {
      at: [0, 3.48, -0.005], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.32, bevel: 0.02, color: basalt, bone: head, name: "crownCentralPeak",
    },
  );
  drawing("crownElementalRune", [0, 3.675, 0.163], [0.13, 0.23], runeTex, head, true);

  for (const s of [1, -1]) {
    b.extrude(
      [[-0.09, 0], [0.12, -0.035], [0.22, 0.30], [0.10, 0.25], [0.035, 0.34]],
      {
        at: [s * 0.25, 3.46, -0.045], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.27, bevel: 0.018, color: paleBasalt, bone: head, name: `crownSidePeak${s}`,
      },
    );
    glow(b.sweep(
      [[s * 0.24, 3.46, 0.10], [s * 0.29, 3.58, 0.10], [s * 0.35, 3.68, 0.10]],
      [0.018, 0.006],
      { color: C.orange, bone: head, sides: 4, name: `crownVein${s}` },
    ), 1.4);
  }

  for (const limb of limbs) {
    const { s, side, arm, leg, fingers, thumb, thumbPoints } = limb;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    const thigh = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;

    glow(b.sweep(arm, [0.16, 0.12, 0.10], {
      color: C.ember, sides: 6, smooth: false, name: `armatureArm${side}`,
    }), 0.95);
    glow(b.sweep(leg, [0.17, 0.14, 0.13], {
      color: C.ember, sides: 6, smooth: false, name: `armatureLeg${side}`,
    }), 0.95);

    molten(`shoulderJoint${side}`, [s * 0.87, 2.73, 0],
      [0.26, 0.26, 0.25], shoulder);

    plate(`shoulderMain${side}`, [s * 1.04, 2.82, -0.025],
      0.70, 0.66, 0.68, shoulder, basalt, 0.23);
    fracturedPlate(`shoulderCap${side}`, [s * 1.04, 2.89, 0.35],
      0.75, 0.65, 0.18, shoulder, s, paleBasalt, 0.032);

    b.extrude(
      [[-0.16, -0.11], [0.20, -0.09], [0.14, 0.27], [0.02, 0.43], [-0.12, 0.22]],
      {
        at: [s * 0.99, 3.02, -0.10], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.39, bevel: 0.018, color: basalt, bone: shoulder,
        name: `shoulderPeak${side}`,
      },
    );
    rock(`shoulderOuterShard${side}`, [s * 1.35, 2.94, -0.09],
      [0.24, 0.29, 0.25], paleBasalt, shoulder, [0, 0, -s * 24]);

    // Large inscription sits entirely on the outer intact shoulder shard.
    drawing(`shoulderSigil${side}`, [s * 1.23, 2.94, 0.449],
      [0.15, 0.24], runeTex, shoulder, true);

    plate(`bicep${side}`, [s * 1.28, 2.56, -0.01],
      0.39, 0.38, 0.48, shoulder);
    plate(`bicepFront${side}`, [s * 1.31, 2.56, 0.26],
      0.32, 0.30, 0.10, shoulder, paleBasalt);

    molten(`elbowFire${side}`, [s * 1.43, 2.46, 0.015],
      [0.15, 0.145, 0.14], elbow);
    rock(`elbowKnuckle${side}`, [s * 1.44, 2.48, -0.17],
      [0.225, 0.205, 0.18], basalt, elbow);

    plate(`forearmMass${side}`, [s * 1.69, 2.34, -0.015],
      0.53, 0.49, 0.53, elbow);
    fracturedPlate(`forearmShield${side}`, [s * 1.69, 2.35, 0.29],
      0.55, 0.48, 0.16, elbow, -s, paleBasalt, 0.025);
    rock(`bracerOuterFacet${side}`, [s * 1.85, 2.46, -0.06],
      [0.18, 0.20, 0.27], basalt, elbow, [8, 0, s * 18]);

    molten(`wristFire${side}`, [s * 1.91, 2.23, 0.02],
      [0.12, 0.14, 0.13], wrist);

    plate(`palmMass${side}`, [s * 2.10, 2.15, 0.035],
      0.47, 0.33, 0.36, wrist);
    fracturedPlate(`palmShield${side}`, [s * 2.10, 2.17, 0.20],
      0.44, 0.29, 0.10, wrist, s, basalt, 0.018);

    fingers.forEach(({ chain, points }, i) => {
      glow(b.sweep(chain, [0.043, 0.035], {
        color: C.orange, sides: 5, caps: "flat", name: `fingerFire${side}${i}`,
      }), 1.15);
      for (let j = 0; j < 2; j++) {
        const a = points[j];
        const e = points[j + 1];
        const t0 = j === 0 ? 0.02 : 0.10;
        const t1 = j === 0 ? 0.90 : 1.05;
        const A: P = [
          a[0] + (e[0] - a[0]) * t0,
          a[1] + (e[1] - a[1]) * t0,
          a[2] + (e[2] - a[2]) * t0,
        ];
        const B: P = [
          a[0] + (e[0] - a[0]) * t1,
          a[1] + (e[1] - a[1]) * t1,
          a[2] + (e[2] - a[2]) * t1,
        ];
        b.frustumBox(A, B, [0.132, 0.16], [0.116, 0.14], {
          bone: chain.joints[j], color: j === 0 ? paleBasalt : basalt,
          name: `fingerStone${side}${i}_${j}`,
        });
      }
    });

    glow(b.sweep(thumb, [0.048, 0.035], {
      color: C.orange, sides: 5, caps: "flat", name: `thumbFire${side}`,
    }), 1.1);
    for (let i = 0; i < 2; i++) {
      const a = thumbPoints[i];
      const e = thumbPoints[i + 1];
      const A: P = [
        a[0] + (e[0] - a[0]) * 0.08,
        a[1] + (e[1] - a[1]) * 0.08,
        a[2] + (e[2] - a[2]) * 0.08,
      ];
      const t = i === 1 ? 1.05 : 0.90;
      const B: P = [
        a[0] + (e[0] - a[0]) * t,
        a[1] + (e[1] - a[1]) * t,
        a[2] + (e[2] - a[2]) * t,
      ];
      b.frustumBox(A, B, [0.15, 0.17], [0.125, 0.14], {
        color: basalt, bone: thumb.joints[i], name: `thumbStone${side}${i}`,
      });
    }

    plate(`thighMass${side}`, [s * 0.51, 1.23, 0],
      0.54, 0.53, 0.61, thigh);
    fracturedPlate(`thighFront${side}`, [s * 0.52, 1.25, 0.30],
      0.40, 0.38, 0.13, thigh, s, paleBasalt, 0.023);

    molten(`kneeFire${side}`, [s * 0.58, 0.96, 0.015],
      [0.17, 0.145, 0.16], knee);
    diamond(`kneecapSocket${side}`, [s * 0.58, 0.96, 0.26],
      0.44, 0.39, 0.16, basalt, knee);
    diamond(`kneecapInlay${side}`, [s * 0.58, 0.96, 0.35],
      0.20, 0.19, 0.025, C.gold, knee);
    glow(diamond(`kneecapCoal${side}`, [s * 0.58, 0.96, 0.37],
      0.085, 0.09, 0.025, C.yellow, knee), 1.1);

    plate(`shinMass${side}`, [s * 0.63, 0.66, 0.035],
      0.55, 0.51, 0.61, knee);
    fracturedPlate(`shinShield${side}`, [s * 0.63, 0.67, 0.32],
      0.43, 0.45, 0.14, knee, -s, paleBasalt, 0.024);

    molten(`ankleFire${side}`, [s * 0.64, 0.405, 0.07],
      [0.17, 0.12, 0.19], ankle);
    plate(`footHeel${side}`, [s * 0.64, 0.31, 0.13],
      0.62, 0.25, 0.68, ankle);
    plate(`footUpper${side}`, [s * 0.64, 0.405, 0.20],
      0.50, 0.20, 0.54, ankle, paleBasalt);

    for (let i = 0; i < 3; i++) {
      const x = s * 0.64 + (i - 1) * 0.195;
      plate(`toe${side}${i}`, [x, 0.28, 0.49],
        0.179, 0.19, 0.32, ankle, i === 1 ? paleBasalt : basalt, 0.20);
      if (i < 2) {
        glow(box(`toeSeam${side}${i}`, [x + 0.098, 0.28, 0.48],
          [0.011, 0.07, 0.21], C.orange, ankle), 1.1);
      }
    }

    const hipShell = b.extrude(
      [
        [-0.25, 0.12], [-0.13, 0.25], [0.17, 0.22],
        [0.27, 0.02], [0.17, -0.22], [-0.16, -0.25],
      ],
      {
        at: [s * 0.735, 1.36, 0.015],
        x: [0, 0, -s], y: [0, 1, 0],
        thickness: 0.17, bevel: 0.025,
        color: basalt, bone: thigh, name: `hipOuterShell${side}`,
      },
    );
    glow(b.decal(hipShell, crackTex, {
      at: [s * 0.83, 1.37, 0.015], dir: [s, 0, 0],
      size: [0.31, 0.33], bone: thigh, name: `hipOuterFracture${side}`,
    }), 1.05);

    plate(`kneeOuterShield${side}`, [s * 0.79, 0.98, 0.01],
      0.34, 0.29, 0.14, knee, paleBasalt, 0.25, [0, 0, -s]);
    plate(`calfRearShield${side}`, [s * 0.63, 0.68, -0.275],
      0.40, 0.42, 0.14, knee);

    const rearArm = plate(`upperArmOuterShell${side}`, [s * 1.28, 2.56, -0.20],
      0.43, 0.35, 0.22, shoulder);
    glow(b.decal(rearArm, crackTex, {
      at: [s * 1.28, 2.56, -0.32], dir: [0, 0, -1],
      size: [0.27, 0.25], bone: shoulder, name: `upperArmRearFracture${side}`,
    }), 1.05);

    // Broad chips, rooted in the armor rather than floating ornaments.
    b.extrude(
      [[-0.15, -0.10], [0.16, -0.07], [0.20, 0.13], [-0.04, 0.21]],
      {
        at: [s * 1.29, 2.65, 0.34],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.012,
        color: basalt, bone: shoulder, name: `shoulderBrokenLip${side}`,
      },
    );
    rock(`shinSideFacet${side}`, [s * 0.84, 0.58, 0.13],
      [0.14, 0.21, 0.23], basalt, knee, [0, 0, s * 17]);

    // Surface-projected fracture routes continue across the shoulder's upper
    // silhouette, carrying the lava treatment beyond the front-facing plates.
    const shoulderSurface = b.surface(shoulder);
    const routes: P[][] = [
      [
        [s * 0.84, 3.13, 0.22],
        [s * 0.97, 3.14, 0.11],
        [s * 1.10, 3.08, -0.02],
        [s * 1.05, 2.99, -0.25],
        [s * 1.18, 2.79, -0.37],
      ],
      [
        [s * 1.10, 3.08, -0.02],
        [s * 1.29, 3.04, -0.09],
        [s * 1.39, 2.94, -0.16],
      ],
    ];

    routes.forEach((points, i) => {
      const channel = shoulderSurface.drape(points, { lift: 0.003 });
      b.sweep(channel, 0.026, {
        color: C.recess, bone: shoulder, sides: 5,
        name: `shoulderCrustChannel${side}${i}`,
      });
      glow(b.sweep(channel, 0.014, {
        color: C.orange, bone: shoulder, sides: 5,
        name: `shoulderLavaChannel${side}${i}`,
      }), 1.35);
    });
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      plate(`sideRib${s}_${i}`, [s * 0.64, 2.18 + i * 0.18, -0.035],
        0.40, 0.125, 0.10, chestBone, basalt, 0.12, [0, 0, -s]);
      glow(b.rod(
        [s * 0.683, 2.25 + i * 0.18, -0.18],
        [s * 0.683, 2.25 + i * 0.18, 0.09],
        0.012,
        { bone: chestBone, color: C.orange, sides: 4, name: `flankFire${s}_${i}` },
      ), 1.1);
    }
    plate(`rearHip${s}`, [s * 0.30, 1.47, -0.33], 0.43, 0.35, 0.15, hips);
    drawing(`rearInscription${s}`, [s * 0.31, 2.59, -0.585],
      [0.13, 0.25], runeTex, chestBone, true, [0, 0, -1]);
  }

  return b.root;
}
