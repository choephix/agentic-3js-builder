```ts
import * as THREE from "three";
import { createBuilder, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Neon Vector 84",
  description:
    "A stylized 1980s upright arcade cabinet with angular synthwave side art, glowing CRT game screen, neon trim, control panel, joystick, buttons, coin door, vents, and chunky low-poly construction.",
};

type V3 = readonly [number, number, number];
type BuilderLike = ReturnType<typeof createBuilder>;

const VOID = "#0b0618";
const BODY_DARK = "#160923";
const BODY_PURPLE = "#29104e";
const PURPLE = "#6d2cff";
const CYAN = "#27efff";
const CYAN_DARK = "#087d99";
const PINK = "#ff2acb";
const PINK_DARK = "#8c155f";
const ORANGE = "#ff7438";
const YELLOW = "#ffe66d";
const WHITE = "#fff5ff";
const STEEL = "#77718d";
const SLOT = "#090711";
const RUBBER = "#090812";

const BODY_PAINT = paint((p, n, _s) => {
  const shimmer = Math.sin(p.y * 23 + p.z * 11) * 0.5 + 0.5;
  if (n.y > 0.35) return shimmer > 0.63 ? "#351261" : BODY_PURPLE;
  return shimmer > 0.58 ? "#1d0b39" : BODY_DARK;
});

const EDGE_PAINT = paint((p, n, _s) => {
  const glowBand = Math.sin(p.z * 31 + p.y * 9) > 0.45;
  if (n.y > 0.25) return glowBand ? "#45206e" : "#2a104e";
  return glowBand ? "#16082d" : "#0e061e";
});

const SCREEN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 360">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#09051d"/>
        <stop offset="0.55" stop-color="#16053a"/>
        <stop offset="1" stop-color="#050313"/>
      </linearGradient>
      <radialGradient id="sun" cx="50%" cy="44%" r="54%">
        <stop offset="0" stop-color="#fff18c"/>
        <stop offset="0.48" stop-color="#ff9b54"/>
        <stop offset="1" stop-color="#ff2aa7"/>
      </radialGradient>
      <pattern id="scan" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="2" fill="#ffffff" opacity=".045"/>
      </pattern>
      <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <rect width="512" height="360" fill="url(#bg)"/>
    <rect width="512" height="360" fill="url(#scan)"/>
    <circle cx="256" cy="156" r="91" fill="#ff31be" opacity=".28" filter="url(#soft)"/>
    <circle cx="256" cy="156" r="78" fill="url(#sun)"/>
    <g stroke="#6d1d85" stroke-width="6" opacity=".8">
      <path d="M184 103h144M174 122h164M168 141h176M165 160h182M168 179h176M176 198h160"/>
    </g>
    <path d="M0 220L512 220" stroke="#ff3acb" stroke-width="5"/>
    <g stroke="#1aefff" stroke-width="2" opacity=".72">
      <path d="M256 220L256 360"/>
      <path d="M205 220L174 360"/>
      <path d="M307 220L338 360"/>
      <path d="M147 220L76 360"/>
      <path d="M365 220L436 360"/>
      <path d="M94 220L0 318"/>
      <path d="M418 220L512 318"/>
      <path d="M0 260h512M0 301h512M0 342h512"/>
    </g>
    <path d="M62 265L140 236L218 273L276 239L352 274L446 234L512 266V360H0V292Z"
      fill="#100626" stroke="#8f36ff" stroke-width="4"/>
    <path d="M104 290L256 237L408 290" fill="none" stroke="#ff3bd4" stroke-width="4"/>
    <g transform="translate(256 285)">
      <path d="M-52 14L-13-5L20 4L54 17L24 24L0 16L-23 27Z" fill="#27efff" stroke="#ffe66d" stroke-width="4"/>
      <path d="M-5-1L4-23L13-3" fill="#ff2acb" stroke="#ff9a55" stroke-width="3"/>
      <circle cx="-19" cy="12" r="4" fill="#fff"/>
      <circle cx="21" cy="13" r="4" fill="#fff"/>
    </g>
    <text x="256" y="42" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold"
      letter-spacing="8" fill="#27efff">VECTOR</text>
    <text x="256" y="72" text-anchor="middle" font-family="monospace" font-size="31" font-weight="bold"
      letter-spacing="5" fill="#ff2acb">RAID</text>
    <text x="256" y="337" text-anchor="middle" font-family="monospace" font-size="14"
      letter-spacing="3" fill="#ffe66d">1UP  004820  HI  99500</text>
  </svg>`,
  { size: 512 },
);

const SCREEN_REFLECTION = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 360">
    <path d="M28 18H182L64 205H12Z" fill="#ffffff" opacity=".18"/>
    <path d="M40 238L132 92" stroke="#ffffff" stroke-width="5" opacity=".12"/>
    <path d="M94 270L184 122" stroke="#27efff" stroke-width="3" opacity=".1"/>
  </svg>`,
  { size: 256 },
);

const MARQUEE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
    <defs>
      <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#16052e"/>
        <stop offset=".5" stop-color="#45106a"/>
        <stop offset="1" stop-color="#100520"/>
      </linearGradient>
      <linearGradient id="word" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff48f"/>
        <stop offset=".43" stop-color="#ff8b55"/>
        <stop offset="1" stop-color="#ff25bd"/>
      </linearGradient>
      <pattern id="lines" width="18" height="18" patternUnits="userSpaceOnUse">
        <path d="M0 17L17 0" stroke="#27efff" stroke-width="2" opacity=".16"/>
      </pattern>
    </defs>
    <rect width="640" height="220" rx="8" fill="url(#m)"/>
    <rect x="10" y="10" width="620" height="200" rx="5" fill="url(#lines)" stroke="#27efff" stroke-width="6"/>
    <path d="M22 188H618" stroke="#ff2acb" stroke-width="8"/>
    <circle cx="112" cy="83" r="49" fill="#ff6c43" opacity=".3"/>
    <circle cx="112" cy="83" r="39" fill="#ffbc59"/>
    <path d="M74 68H150M70 80H154M72 92H152M80 104H144" stroke="#ff2acb" stroke-width="5"/>
    <text x="344" y="104" text-anchor="middle" font-family="sans-serif" font-size="58" font-style="italic"
      font-weight="900" letter-spacing="5" fill="#ff1fc6" opacity=".4">ASTRO</text>
    <text x="338" y="98" text-anchor="middle" font-family="sans-serif" font-size="58" font-style="italic"
      font-weight="900" letter-spacing="5" fill="url(#word)" stroke="#27efff" stroke-width="2">ASTRO</text>
    <text x="400" y="144" text-anchor="middle" font-family="monospace" font-size="22"
      letter-spacing="8" fill="#27efff">DRIVE // 84</text>
    <path d="M30 32H610M30 44H610" stroke="#fff" stroke-width="2" opacity=".22"/>
  </svg>`,
  { size: 512 },
);

const SIDE_ART_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 480">
    <defs>
      <linearGradient id="side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#361060"/>
        <stop offset=".54" stop-color="#120625"/>
        <stop offset="1" stop-color="#080414"/>
      </linearGradient>
      <radialGradient id="orb"><stop stop-color="#ffe36b"/><stop offset=".44" stop-color="#ff764e"/><stop offset="1" stop-color="#ed209d"/></radialGradient>
    </defs>
    <rect width="220" height="480" fill="url(#side)"/>
    <path d="M0 128L220 84M0 144L220 100M0 160L220 116" stroke="#27efff" stroke-width="4" opacity=".4"/>
    <circle cx="110" cy="137" r="67" fill="#ff2acb" opacity=".2"/>
    <circle cx="110" cy="137" r="49" fill="url(#orb)"/>
    <path d="M65 118H155M61 133H159M64 148H156M72 163H148" stroke="#ff2a9f" stroke-width="5"/>
    <path d="M0 252L220 252" stroke="#ff2acb" stroke-width="5"/>
    <g stroke="#27efff" stroke-width="2" opacity=".7">
      <path d="M110 252L110 480M72 252L42 480M148 252L178 480M36 252L0 410M184 252L220 410"/>
      <path d="M0 286H220M0 326H220M0 370H220M0 418H220"/>
    </g>
    <path d="M17 247L106 199L200 251L158 292L74 285Z" fill="#110520" stroke="#ff2acb" stroke-width="5"/>
    <path d="M20 294L110 258L200 294" fill="none" stroke="#27efff" stroke-width="4"/>
    <text x="110" y="60" text-anchor="middle" font-family="monospace" font-size="18" letter-spacing="3" fill="#27efff">HYPER</text>
    <text x="110" y="458" text-anchor="middle" font-family="monospace" font-size="15" letter-spacing="2" fill="#ffe66d">1984</text>
  </svg>`,
  { size: 384 },
);

const CONTROL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 210">
    <defs>
      <linearGradient id="ctrl" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#35115d"/>
        <stop offset="1" stop-color="#10061f"/>
      </linearGradient>
    </defs>
    <rect width="560" height="210" rx="10" fill="url(#ctrl)" stroke="#27efff" stroke-width="5"/>
    <path d="M8 170H552M8 182H552" stroke="#ff2acb" stroke-width="3"/>
    <path d="M42 18L42 157M84 18L84 157M126 18L126 157M168 18L168 157M210 18L210 157M252 18L252 157M294 18L294 157M336 18L336 157M378 18L378 157M420 18L420 157M462 18L462 157M504 18L504 157"
      stroke="#27efff" stroke-width="2" opacity=".18"/>
    <path d="M20 43H540M20 87H540M20 131H540" stroke="#ff2acb" stroke-width="2" opacity=".16"/>
    <text x="36" y="36" font-family="monospace" font-size="17" font-weight="bold" fill="#ffe66d">PLAYER 1</text>
    <text x="514" y="36" text-anchor="end" font-family="monospace" font-size="17" fill="#27efff">PUSH START</text>
    <text x="514" y="197" text-anchor="end" font-family="monospace" font-size="12" fill="#ff8a57">LASER // SHIELD // WARP</text>
    <path d="M80 118L108 91L136 118L108 145Z" fill="none" stroke="#27efff" stroke-width="4"/>
    <path d="M83 118H133M108 94V142" stroke="#ff2acb" stroke-width="3"/>
    <g fill="#ff2acb">
      <circle cx="390" cy="75" r="16"/><circle cx="436" cy="75" r="16"/><circle cx="482" cy="75" r="16"/>
    </g>
    <g fill="#27efff">
      <circle cx="390" cy="119" r="16"/><circle cx="436" cy="119" r="16"/><circle cx="482" cy="119" r="16"/>
    </g>
  </svg>`,
  { size: 384 },
);

const COIN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 390">
    <defs>
      <linearGradient id="door" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#2e1450"/><stop offset=".5" stop-color="#130823"/><stop offset="1" stop-color="#080411"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="292" height="382" rx="12" fill="url(#door)" stroke="#27efff" stroke-width="7"/>
    <path d="M22 32H278M22 352H278" stroke="#ff2acb" stroke-width="6"/>
    <text x="150" y="68" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#ffe66d">INSERT COIN</text>
    <text x="150" y="97" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="3" fill="#27efff">TO CONTINUE</text>
    <circle cx="150" cy="195" r="67" fill="#0b0616" stroke="#ff2acb" stroke-width="8"/>
    <circle cx="150" cy="195" r="52" fill="none" stroke="#27efff" stroke-width="3" stroke-dasharray="7 9"/>
    <path d="M150 143V247M98 195H202" stroke="#27efff" stroke-width="3"/>
    <path d="M128 195L150 169L172 195L150 221Z" fill="#ff7438" stroke="#ffe66d" stroke-width="5"/>
    <text x="150" y="295" text-anchor="middle" font-family="monospace" font-size="15" fill="#ff2acb">CREDIT 00</text>
    <text x="150" y="324" text-anchor="middle" font-family="monospace" font-size="12" fill="#27efff">SELECT YOUR FATE</text>
  </svg>`,
  { size: 384 },
);

function box(
  b: BuilderLike,
  name: string,
  size: V3,
  at: V3 | THREE.Vector3,
  color: any,
  rotation: V3 = [0, 0, 0],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    rotation,
    name,
    flat: true,
  });
}

function cylinder(
  b: BuilderLike,
  name: string,
  at: V3 | THREE.Vector3,
  radius: number,
  height: number,
  color: any,
  dir: V3 | THREE.Vector3 = [0, 1, 0],
  segments = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    dir,
    name,
    flat: true,
  });
}

function sphere(
  b: BuilderLike,
  name: string,
  at: V3 | THREE.Vector3,
  radius: number,
  color: any,
  scale?: V3,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
    at,
    scale,
    name,
    flat: true,
  });
}

function plane(
  b: BuilderLike,
  name: string,
  size: V3,
  at: V3 | THREE.Vector3,
  dir: V3 | THREE.Vector3,
  texture: THREE.Texture,
  up: V3 | THREE.Vector3 = [0, 1, 0],
) {
  return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
    at,
    dir,
    up,
    axis: "z",
    texture,
    name,
  });
}

function lightObject(object: any, tint: string, strength = 1.5) {
  const meshes: readonly THREE.Mesh[] = object?.meshes
    ? object.meshes
    : object?.mesh
      ? [object.mesh]
      : [];
  for (const mesh of meshes) {
    if (Array.isArray(mesh.material)) continue;
    const source = mesh.material as THREE.MeshStandardMaterial;
    const material = source.clone();
    material.emissive.set(tint);
    material.emissiveIntensity = strength;
    mesh.material = material;
  }
  return object;
}

function neonRod(
  b: BuilderLike,
  name: string,
  a: V3 | THREE.Vector3,
  c: V3 | THREE.Vector3,
  radius: number,
  color: string,
  strength = 1.8,
) {
  return lightObject(
    b.rod(a, c, radius, {
      color,
      name,
      section: { ngon: 6 },
      caps: "round",
    }),
    color,
    strength,
  );
}

function addFrontRivet(
  b: BuilderLike,
  name: string,
  x: number,
  y: number,
  z: number,
  color: string = YELLOW,
) {
  sphere(b, name, [x, y, z], 0.012, color);
  cylinder(b, `${name}_ring`, [x, y, z + 0.006], 0.018, 0.008, VOID, [0, 0, 1], 10);
}

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "neon-vector-84",
    detail: 1,
    paintSize: 1024,
  });

  const profile: [number, number][] = [
    [-0.43, 0.05],
    [0.42, 0.05],
    [0.42, 0.68],
    [0.48, 0.77],
    [0.32, 0.91],
    [0.25, 1.03],
    [0.23, 1.47],
    [0.16, 1.63],
    [-0.28, 1.73],
    [-0.41, 1.68],
  ];

  b.extrude(profile, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.67,
    bevel: 0.006,
    color: BODY_PAINT,
    name: "cabinet_shell",
  });

  for (const side of [1, -1]) {
    b.extrude(profile, {
      at: [side * 0.35, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: EDGE_PAINT,
      name: `side_panel_${side > 0 ? "left" : "right"}`,
    });
  }

  box(b, "base_plinth", [0.74, 0.09, 0.82], [0, 0.045, 0], BODY_DARK);
  box(b, "lower_toe_kick", [0.67, 0.18, 0.035], [0, 0.16, 0.438], VOID);
  box(b, "lower_toe_kick_lip", [0.69, 0.025, 0.045], [0, 0.255, 0.452], PURPLE);

  for (const side of [1, -1]) {
    for (const z of [-0.28, 0.27]) {
      cylinder(
        b,
        `foot_${side}_${z > 0 ? "front" : "back"}`,
        [side * 0.245, 0.023, z],
        0.043,
        0.046,
        RUBBER,
        [0, 1, 0],
        8,
      );
    }
  }

  for (const side of [1, -1]) {
    const x = side * 0.382;
    const art = plane(
      b,
      `side_art_${side > 0 ? "left" : "right"}`,
      [0.52, 1.24, 0],
      [x, 0.99, -0.08],
      [side, 0, 0],
      SIDE_ART_TEX,
    );
    lightObject(art, "#9e36ff", 0.65);

    for (let i = 0; i < profile.length; i++) {
      const a = profile[i];
      const c = profile[(i + 1) % profile.length];
      const edgeColor = i % 2 === 0 ? CYAN : PINK;
      neonRod(
        b,
        `side_neon_${side}_${i}`,
        [side * 0.394, a[1], a[0]],
        [side * 0.394, c[1], c[0]],
        0.0075,
        edgeColor,
        1.7,
      );
    }

    const sideRivets: [number, number][] = [
      [0.16, -0.29],
      [0.78, 0.385],
      [1.49, 0.18],
      [1.64, -0.19],
      [0.34, 0.34],
    ];
    for (let i = 0; i < sideRivets.length; i++) {
      const [y, z] = sideRivets[i];
      sphere(
        b,
        `side_rivet_${side}_${i}`,
        [side * 0.405, y, z],
        0.011,
        i % 2 ? CYAN : YELLOW,
      );
    }

    neonRod(
      b,
      `side_art_bar_${side}`,
      [side * 0.398, 0.31, -0.34],
      [side * 0.398, 0.31, 0.18],
      0.004,
      side > 0 ? PINK : CYAN,
      1.4,
    );
  }

  const lowerFront = box(
    b,
    "coin_door_frame",
    [0.54, 0.53, 0.04],
    [0, 0.38, 0.432],
    BODY_DARK,
  );
  lightObject(lowerFront, PURPLE, 0.35);

  const coinDoor = plane(
    b,
    "coin_door_art",
    [0.39, 0.47, 0],
    [0, 0.39, 0.458],
    [0, 0, 1],
    COIN_TEX,
  );
  lightObject(coinDoor, "#d85bff", 0.8);

  neonRod(b, "coin_door_top_neon", [-0.22, 0.66, 0.466], [0.22, 0.66, 0.466], 0.006, CYAN);
  neonRod(b, "coin_door_bottom_neon", [-0.22, 0.11, 0.466], [0.22, 0.11, 0.466], 0.006, PINK);

  for (const x of [-0.105, 0.105]) {
    box(b, `coin_slot_${x}`, [0.085, 0.018, 0.012], [x, 0.44, 0.472], SLOT);
    box(b, `coin_slot_glint_${x}`, [0.04, 0.003, 0.003], [x, 0.44, 0.479], YELLOW);

    cylinder(b, `return_button_ring_${x}`, [x, 0.27, 0.472], 0.039, 0.009, PINK_DARK, [0, 0, 1], 12);
    cylinder(b, `return_button_${x}`, [x, 0.27, 0.479], 0.027, 0.018, CYAN, [0, 0, 1], 10);
  }

  for (const x of [-0.215, 0.215]) {
    addFrontRivet(b, `coin_rivet_top_${x}`, x, 0.60, 0.473, YELLOW);
    addFrontRivet(b, `coin_rivet_bottom_${x}`, x, 0.16, 0.473, CYAN);
  }

  neonRod(b, "base_front_neon", [-0.33, 0.085, 0.46], [0.33, 0.085, 0.46], 0.009, PINK, 2.1);
  neonRod(b, "front_left_rail", [-0.33, 0.11, 0.463], [-0.33, 0.69, 0.463], 0.006, CYAN, 1.7);
  neonRod(b, "front_right_rail", [0.33, 0.11, 0.463], [0.33, 0.69, 0.463], 0.006, CYAN, 1.7);

  const bezel = box(
    b,
    "crt_bezel",
    [0.61, 0.47, 0.072],
    [0, 1.275, 0.188],
    VOID,
    [-8, 0, 0],
  );
  lightObject(bezel, "#31105f", 0.4);

  box(b, "crt_inner_rim", [0.535, 0.395, 0.023], [0, 1.275, 0.229], PINK, [-8, 0, 0]);

  const screenNormal = new THREE.Vector3(0, Math.sin(8 * Math.PI / 180), Math.cos(8 * Math.PI / 180));
  const screenAt = new THREE.Vector3(0, 1.275, 0.242);

  const screen = plane(
    b,
    "crt_game_screen",
    [0.475, 0.335, 0],
    screenAt,
    screenNormal,
    SCREEN_TEX,
  );
  lightObject(screen, "#d8fbff", 2.2);

  const reflection = plane(
    b,
    "crt_glass_reflection",
    [0.475, 0.335, 0],
    screenAt.clone().addScaledVector(screenNormal, 0.0025),
    screenNormal,
    SCREEN_REFLECTION,
  );
  lightObject(reflection, "#ffffff", 1.1);

  const screenCorners: [number, number][] = [
    [-0.245, 1.095],
    [0.245, 1.095],
    [-0.245, 1.455],
    [0.245, 1.455],
  ];
  neonRod(b, "screen_trim_bottom", [-0.252, 1.095, 0.253], [0.252, 1.095, 0.253], 0.006, CYAN);
  neonRod(b, "screen_trim_top", [-0.252, 1.455, 0.203], [0.252, 1.455, 0.203], 0.006, PINK);
  neonRod(b, "screen_trim_left", [-0.252, 1.095, 0.253], [-0.252, 1.455, 0.203], 0.006, PINK);
  neonRod(b, "screen_trim_right", [0.252, 1.095, 0.253], [0.252, 1.455, 0.203], 0.006, CYAN);

  for (let i = 0; i < screenCorners.length; i++) {
    const [x, y] = screenCorners[i];
    sphere(b, `crt_corner_bolt_${i}`, [x, y, 0.258], 0.014, i % 2 ? CYAN : PINK);
  }

  for (let i = 0; i < 11; i++) {
    const x = -0.20 + i * 0.04;
    cylinder(b, `speaker_hole_${i}`, [x, 1.492, 0.246], 0.0065, 0.012, SLOT, [0, 0, 1], 8);
  }
  neonRod(b, "speaker_line", [-0.235, 1.515, 0.25], [0.235, 1.515, 0.25], 0.004, CYAN, 1.2);

  const marqueeBody = box(
    b,
    "marquee housing",
    [0.69, 0.235, 0.062],
    [0, 1.615, 0.135],
    BODY_DARK,
    [-12, 0, 0],
  );
  lightObject(marqueeBody, "#541479", 0.55);

  const marqueeNormal = new THREE.Vector3(0, Math.sin(12 * Math.PI / 180), Math.cos(12 * Math.PI / 180));
  const marquee = plane(
    b,
    "marquee_art",
    [0.625, 0.202, 0],
    [0, 1.615, 0.17],
    marqueeNormal,
    MARQUEE_TEX,
  );
  lightObject(marquee, "#fff1b0", 2.0);

  neonRod(b, "marquee_lower_trim", [-0.325, 1.503, 0.205], [0.325, 1.503, 0.205], 0.008, CYAN, 2.0);
  neonRod(b, "marquee_upper_trim", [-0.28, 1.724, 0.10], [0.28, 1.724, 0.10], 0.008, PINK, 2.0);
  neonRod(b, "marquee_left_trim", [-0.325, 1.503, 0.205], [-0.28, 1.724, 0.10], 0.007, PINK, 1.7);
  neonRod(b, "marquee_right_trim", [0.325, 1.503, 0.205], [0.28, 1.724, 0.10], 0.007, CYAN, 1.7);

  const panelCenter = new THREE.Vector3(0, 0.855, 0.37);
  const panelSlope = new THREE.Vector3(0, Math.sin(20 * Math.PI / 180), Math.cos(20 * Math.PI / 180));
  const panelNormal = new THREE.Vector3(0, Math.cos(20 * Math.PI / 180), -Math.sin(20 * Math.PI / 180));

  const panelPoint = (x: number, along: number, lift: number) =>
    panelCenter
      .clone()
      .add(new THREE.Vector3(x, 0, 0))
      .addScaledVector(panelSlope, along)
      .addScaledVector(panelNormal, lift);

  box(b, "control_panel_shell", [0.71, 0.065, 0.30], panelCenter, EDGE_PAINT, [-20, 0, 0]);

  const controlSurface = plane(
    b,
    "control_panel_graphics",
    [0.625, 0.235, 0],
    panelPoint(0, 0, 0.038),
    panelNormal,
    CONTROL_TEX,
  );
  lightObject(controlSurface, "#a45aff", 0.75);

  neonRod(
    b,
    "control_front_neon",
    panelPoint(-0.34, 0.145, 0.052),
    panelPoint(0.34, 0.145, 0.052),
    0.008,
    PINK,
    2.1,
  );

  neonRod(
    b,
    "control_left_edge",
    panelPoint(-0.34, -0.14, 0.052),
    panelPoint(-0.34, 0.145, 0.052),
    0.006,
    CYAN,
    1.6,
  );

  neonRod(
    b,
    "control_right_edge",
    panelPoint(0.34, -0.14, 0.052),
    panelPoint(0.34, 0.145, 0.052),
    0.006,
    CYAN,
    1.6,
  );

  const buttons: { x: number; along: number; color: string; label: string }[] = [
    { x: 0.055, along: 0.075, color: PINK, label: "pink_a" },
    { x: 0.145, along: 0.075, color: ORANGE, label: "orange_a" },
    { x: 0.235, along: 0.075, color: YELLOW, label: "yellow_a" },
    { x: 0.055, along: -0.025, color: CYAN, label: "cyan_b" },
    { x: 0.145, along: -0.025, color: PURPLE, label: "purple_b" },
    { x: 0.235, along: -0.025, color: PINK, label: "pink_b" },
  ];

  for (const button of buttons) {
    const base = panelPoint(button.x, button.along, 0.054);
    cylinder(
      b,
      `${button.label}_socket`,
      base,
      0.033,
      0.014,
      VOID,
      panelNormal,
      10,
    );
    const top = panelPoint(button.x, button.along, 0.081);
    const buttonPart = sphere(b, `${button.label}_button`, top, 0.031, button.color, [1, 0.62, 1]);
    lightObject(buttonPart, button.color, 1.7);
  }

  const startBase = panelPoint(0.275, -0.09, 0.057);
  cylinder(b, "start_socket", startBase, 0.037, 0.014, VOID, panelNormal, 10);
  const startButton = sphere(
    b,
    "start_button",
    panelPoint(0.275, -0.09, 0.088),
    0.032,
    YELLOW,
    [1, 0.6, 1],
  );
  lightObject(startButton, YELLOW, 1.8);

  const joystickBase = panelPoint(-0.19, 0.035, 0.053);
  cylinder(b, "joystick_outer_ring", joystickBase, 0.064, 0.014, PURPLE, panelNormal, 12);
  cylinder(
    b,
    "joystick_inner_gate",
    panelPoint(-0.19, 0.035, 0.066),
    0.045,
    0.018,
    VOID,
    panelNormal,
    10,
  );

  const stickStart = panelPoint(-0.19, 0.035, 0.073);
  const stickEnd = panelPoint(-0.19, 0.035, 0.205);
  b.rod(stickStart, stickEnd, 0.015, {
    color: STEEL,
    name: "joystick_stem",
    section: { ngon: 6 },
    caps: "round",
  });

  const joystickBall = sphere(
    b,
    "joystick_ball",
    panelPoint(-0.19, 0.035, 0.225),
    0.061,
    PINK,
  );
  lightObject(joystickBall, PINK, 2.0);
  sphere(b, "joystick_ball_highlight", panelPoint(-0.211, 0.035, 0.259), 0.013, WHITE);

  for (const side of [1, -1]) {
    const y = 0.745;
    neonRod(
      b,
      `control_side_light_${side}`,
      [side * 0.31, y, 0.498],
      [side * 0.31, y + 0.07, 0.45],
      0.005,
      side > 0 ? PINK : CYAN,
      1.5,
    );
  }

  const rearPanel = box(
    b,
    "rear_service_panel",
    [0.56, 0.48, 0.025],
    [0, 0.98, -0.427],
    BODY_DARK,
  );
  lightObject(rearPanel, "#271042", 0.3);

  for (let i = 0; i < 9; i++) {
    const y = 0.80 + i * 0.035;
    box(
      b,
      `rear_vent_${i}`,
      [0.41, 0.012, 0.018],
      [0, y, -0.448],
      i % 2 ? CYAN_DARK : VOID,
      [0, 0, 0],
    );
  }

  cylinder(b, "rear_power_socket", [0, 0.55, -0.45], 0.035, 0.018, SLOT, [0, 0, -1], 10);
  cylinder(b, "rear_power_glow", [0, 0.55, -0.463], 0.014, 0.006, PINK, [0, 0, -1], 10);

  for (const x of [-0.28, 0.28]) {
    sphere(b, `rear_panel_bolt_${x}`, [x, 0.78, -0.452], 0.012, YELLOW);
    sphere(b, `rear_panel_bolt_top_${x}`, [x, 1.17, -0.452], 0.012, CYAN);
  }

  const upperCabinetGlow = neonRod(
    b,
    "upper_cabinet_purple_edge",
    [-0.29, 1.725, -0.27],
    [0.29, 1.725, -0.27],
    0.004,
    PURPLE,
    1.3,
  );
  lightObject(upperCabinetGlow, PURPLE, 1.3);

  const sideBadgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
      <rect width="180" height="90" rx="12" fill="#10051e" stroke="#27efff" stroke-width="6"/>
      <path d="M18 65L56 24L91 65L126 25L163 65" fill="none" stroke="#ff2acb" stroke-width="6"/>
      <text x="90" y="51" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19"
        fill="#ffe66d">PLAYER ONE</text>
    </svg>`,
    { size: 256 },
  );

  for (const side of [1, -1]) {
    const badge = plane(
      b,
      `side_badge_${side}`,
      [0.27, 0.135, 0],
      [side * 0.401, 0.58, 0.28],
      [side, 0, 0],
      sideBadgeTex,
    );
    lightObject(badge, "#fff0a0", 1.2);
  }

  for (const side of [1, -1]) {
    const sideSmallNeon = neonRod(
      b,
      `side_lower_color_bar_${side}`,
      [side * 0.402, 0.19, -0.33],
      [side * 0.402, 0.19, 0.14],
      0.004,
      side > 0 ? CYAN : PINK,
      1.5,
    );
    lightObject(sideSmallNeon, side > 0 ? CYAN : PINK, 1.5);
  }

  return b.root;
}
```