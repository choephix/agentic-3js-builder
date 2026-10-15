```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, bezier, catmull, polyline } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

type Vec = [number, number, number];
type Kind = "box" | "ico" | "dode" | "oct" | "hex" | "cone";

export const meta = {
  name: "Magma Basalt Golem",
  description:
    "A towering lava golem in a cel-shaded Genshin-style look: hex-stacked basalt plates around a molten core, glowing seams, a pyro medallion, a flame crest and a sigil-lit lava platform.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Flat colours glow (lava); paints are the cel-shaded rock and trim.
const LAVA = "#ff6a1a";
const LAVA_HOT = "#ffa42e";
const LAVA_DEEP = "#e03a14";
const HOT = "#ffe27a";
const TOOTH = "#f4e1b5";

function basaltPaint(a: string, b: string, seed: number) {
  return cel(
    paint((p, n) => {
      let c = mix(a, b, smoothstep(0.3, 0.7, noise(p, 0.22, seed)));
      c = mix(c, "#25233b", 0.4 * smoothstep(0.6, 0.78, noise(p, 0.06, seed + 4))); // pitted dark flecks
      c = mix(c, "#a3a1cc", 0.32 * smoothstep(0.55, 0.95, n.y)); // pale ash on top faces
      c = mix(c, "#e0572b", 0.5 * smoothstep(0.05, -0.7, n.y) * smoothstep(1.7, 0.2, p.y)); // lava bounce light below
      return c;
    }),
  );
}
const BASALT = basaltPaint("#56547a", "#6e6c96", 3);
const BASALT_D = basaltPaint("#3c3a5a", "#4a4870", 8);
const BASALT_P = basaltPaint("#6c6a94", "#8381ab", 5);
const OBS = cel("#2b2644", "#16122a");
const GOLD = cel("#f3c552", "#b8702c");

export default function build() {
  const b = createBuilder({ name: "basaltLavaGolem" });
  type J = ReturnType<typeof b.joint>;
  const R = rng(2024);
  const Y0 = 0.12; // top of the platform: where the soles stand
  const V = (p: Vec) => new THREE.Vector3(p[0], p[1], p[2]);

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const eyeSvg = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(100 0) scale(-1 1)"' : ""}>
        <path d="M3 8 L97 30 L90 43 Q50 55 6 26 Z" fill="#7a1608"/>
        <path d="M9 13 L90 31 L85 38 Q50 47 11 25 Z" fill="#ff9a1f"/>
        <path d="M20 19 L82 32 L78 36 Q50 42 22 27 Z" fill="#fff0a0"/>
        <rect x="58" y="24" width="7" height="13" rx="3" fill="#8a1c08" transform="rotate(-12 62 30)"/>
      </g></svg>`,
      { size: 160 },
    );
  const EYE_R = eyeSvg(false);
  const EYE_L = eyeSvg(true);

  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ticks += `<line x1="${50 + Math.sin(a) * 38}" y1="${50 - Math.cos(a) * 38}" x2="${50 + Math.sin(a) * 45}" y2="${50 - Math.cos(a) * 45}"/>`;
  }
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#7a1608"/>
      <circle cx="50" cy="50" r="43" fill="#ff5a14"/>
      <circle cx="50" cy="50" r="36" fill="#c8300f"/>
      <g stroke="#ffd36a" stroke-width="3" stroke-linecap="round">${ticks}</g>
      <circle cx="50" cy="50" r="34" fill="none" stroke="#ffd36a" stroke-width="2"/>
      <path d="M50 14 C58 28 74 38 72 58 C70 76 58 86 50 86 C42 86 30 76 28 58 C27 46 36 40 40 30 C42 38 46 40 48 36 C50 30 48 22 50 14 Z" fill="#ffe27a"/>
      <path d="M50 34 C55 44 63 50 62 62 C61 72 55 78 50 78 C45 78 39 72 39 62 C39 55 44 52 46 46 C48 50 50 48 50 42 Z" fill="#ff7a1c"/>
    </svg>`,
    { size: 256 },
  );

  const CRACK = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M34 2 L28 24 L38 40 L26 62 L36 80 L24 104 L30 126" stroke="#ff6a1a" stroke-width="7"/>
      <path d="M38 40 L52 48 L56 62 M26 62 L12 70 L8 88 M36 80 L50 92" stroke="#ff6a1a" stroke-width="5"/>
      <path d="M34 2 L28 24 L38 40 L26 62 L36 80 L24 104 L30 126" stroke="#ffd25a" stroke-width="3"/>
      <path d="M38 40 L52 48 L56 62 M26 62 L12 70 L8 88 M36 80 L50 92" stroke="#ffd25a" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  const RUNE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffb52e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 6 V58 M14 20 L32 36 L50 20 M16 48 H48"/>
      <circle cx="32" cy="14" r="3" fill="#ffe27a" stroke="none"/>
    </svg>`,
    { size: 192 },
  );

  let fTicks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    const r0 = i % 2 ? 96 : 88;
    fTicks += `<line x1="${128 + Math.sin(a) * r0}" y1="${128 - Math.cos(a) * r0}" x2="${128 + Math.sin(a) * 104}" y2="${128 - Math.cos(a) * 104}"/>`;
  }
  const tri = (rot: number) =>
    [0, 1, 2].map((k) => `${128 + Math.sin(rot + (k * 2 * Math.PI) / 3) * 78},${128 - Math.cos(rot + (k * 2 * Math.PI) / 3) * 78}`).join(" ");
  let fCracks = "";
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.3;
    let d = "";
    for (let k = 0; k < 5; k++) {
      const r = 30 + k * 20;
      const j = Math.sin(i * 7 + k * 3) * 0.12;
      d += `${k ? "L" : "M"}${(128 + Math.sin(a + j) * r).toFixed(1)} ${(128 - Math.cos(a + j) * r).toFixed(1)}`;
    }
    fCracks += `<path d="${d}"/>`;
  }
  const FLOOR = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="128" cy="128" r="122" stroke="#ff6a1a" stroke-width="5"/>
      <circle cx="128" cy="128" r="110" stroke="#ffc24a" stroke-width="2.5"/>
      <g stroke="#ff8f2a" stroke-width="3">${fTicks}</g>
      <circle cx="128" cy="128" r="70" stroke="#ff6a1a" stroke-width="3" stroke-dasharray="10 6"/>
      <polygon points="${tri(0)}" stroke="#ffc24a" stroke-width="3"/>
      <polygon points="${tri(Math.PI)}" stroke="#ffc24a" stroke-width="3"/>
      <g stroke="#ff7a1c" stroke-width="3.5">${fCracks}</g>
    </svg>`,
    { size: 768 },
  );

  const POOL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">
      <ellipse cx="64" cy="64" rx="60" ry="52" fill="#7a1608"/>
      <ellipse cx="64" cy="64" rx="52" ry="44" fill="#ff6a1a"/>
      <path d="M22 60 Q44 38 66 58 T108 56" stroke="#ffc34a" stroke-width="6"/>
      <path d="M30 80 Q54 64 76 82 T102 78" stroke="#ffe27a" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Helpers
  const shape = (kind: Kind): THREE.BufferGeometry => {
    switch (kind) {
      case "ico":
        return new THREE.IcosahedronGeometry(0.5, 0);
      case "dode":
        return new THREE.DodecahedronGeometry(0.5, 0);
      case "oct":
        return new THREE.OctahedronGeometry(0.5, 0);
      case "hex":
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
      case "cone":
        return new THREE.ConeGeometry(0.5, 1, 6);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };
  const chunk = (bone: J, kind: Kind, at: Vec, size: Vec, color: ColorInput, rot?: Vec) =>
    b.part(shape(kind), color, { bone, at, scale: size, rotation: rot, flat: true });
  const orb = (bone: J, at: Vec, r: number, color: string, str = 1.1) =>
    glow(chunk(bone, "ico", at, [r * 2, r * 2, r * 2], color), str);
  const glowBox = (bone: J, at: Vec, size: Vec, color: string, str = 1, rot?: Vec) =>
    glow(chunk(bone, "box", at, size, color, rot), str);

  // A block laid along a limb between fractions t0..t1 of the a→c bone.
  const seg = (bone: J, a: Vec, c: Vec, t0: number, t1: number, w: number, d: number, color: ColorInput, kind: Kind = "box") => {
    const A = V(a);
    const C = V(c);
    const from = A.clone().lerp(C, t0);
    const to = A.clone().lerp(C, t1);
    return b.part(shape(kind), color, {
      bone,
      at: from.clone().lerp(to, 0.5),
      dir: C.clone().sub(A),
      scale: [w, from.distanceTo(to), d],
      flat: true,
    });
  };

  const crystal = (bone: J, base: Vec, dir: Vec, len: number, w: number, color = LAVA_HOT, str = 1.3) => {
    const d = V(dir).normalize();
    const c = V(base).addScaledVector(d, len / 2);
    return glow(b.part(shape("oct"), color, { bone, at: c, dir: d, scale: [w, len, w], flat: true }), str);
  };

  // A glowing drawing on a flat face.
  const sign = (bone: J, tex: THREE.Texture, at: Vec, dir: Vec, size: [number, number], str = 1, up?: Vec) =>
    glow(
      b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex }),
      str,
    );

  const FLAME: [number, number][] = [
    [-0.5, 0],
    [0.5, 0],
    [0.46, 0.22],
    [0.22, 0.42],
    [0.32, 0.66],
    [0.06, 1.0],
    [-0.02, 0.7],
    [-0.26, 0.58],
    [-0.42, 0.34],
  ];
  // Three nested flame slabs (red, orange, yellow); yaw turns the plane about Y, lean tips it sideways.
  const flame = (bone: J, at: Vec, yawDeg: number, leanDeg: number, w: number, h: number) => {
    const yaw = (yawDeg * Math.PI) / 180;
    const a = (leanDeg * Math.PI) / 180;
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const up = new THREE.Vector3(0, 1, 0);
    const x = r.clone().multiplyScalar(Math.cos(a)).addScaledVector(up, -Math.sin(a));
    const y = r.clone().multiplyScalar(Math.sin(a)).addScaledVector(up, Math.cos(a));
    const n = x.clone().cross(y);
    const layers: [number, number, string, number][] = [
      [1, 1, "#ff4a1a", 0],
      [0.72, 0.78, "#ff8a1f", 1],
      [0.42, 0.55, "#ffd54a", 2],
    ];
    for (const [sw, sh, col, i] of layers) {
      const o = V(at).addScaledVector(n, (i - 1) * 0.012);
      glow(
        b.extrude(
          FLAME.map(([px, py]) => [px * w * sw, py * h * sh] as [number, number]),
          { at: o, x, y, thickness: 0.035, color: col, bone },
        ),
        1 + i * 0.25,
      );
    }
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, Y0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 1.32, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.32, 0],
      [0, 1.7, 0.03],
      [0, 2.05, 0.06],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.tip!;
  const HY = 2.76;
  const HZ = 0.16;
  const neck = b.joint("neck", { parent: chest, at: [0, 2.4, 0.06], aim: [0, 2.56, 0.14], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.56, 0.14], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.26, HZ - 0.02], dir: [0, -0.04, 1], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Platform: basalt disc, lava channel, sigil, rim stones, crystals, embers
  b.part(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1.52, 0),
        new THREE.Vector2(1.52, 0.07),
        new THREE.Vector2(1.46, 0.12),
        new THREE.Vector2(0, 0.12),
      ],
      10,
    ),
    BASALT_D,
    { bone: root, at: [0, 0, 0], flat: true },
  );
  glow(
    b.part(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(1.2, 0),
          new THREE.Vector2(1.32, 0),
          new THREE.Vector2(1.32, 0.012),
          new THREE.Vector2(1.2, 0.012),
        ],
        10,
      ),
      LAVA,
      { bone: root, at: [0, 0.121, 0], flat: true },
    ),
    1,
  );
  sign(root, FLOOR, [0, 0.124, 0], [0, 1, 0], [2.4, 2.4], 1, [0, 0, -1]);

  const polar = (ang: number, r: number): [number, number] => [Math.sin(ang) * r, Math.cos(ang) * r];
  for (let i = 0; i < 11; i++) {
    const ang = (i / 11) * Math.PI * 2 + R() * 0.2;
    const [x, z] = polar(ang, 1.4);
    const front = Math.cos(ang) > 0.3 ? 0.55 : 1;
    const h = (0.16 + R() * 0.2) * front;
    chunk(
      root,
      i % 2 ? "dode" : "ico",
      [x, Y0 + h * 0.3, z],
      [0.3 + R() * 0.2, h, 0.3 + R() * 0.2],
      i % 3 ? BASALT : BASALT_P,
      [R() * 40, R() * 360, R() * 30],
    );
  }
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * (0.55 + (i / 6) * 0.9) + R() * 0.15; // behind the golem
    const [x, z] = polar(ang, 1.25 + R() * 0.15);
    const len = 0.35 + R() * 0.4;
    b.spike([x, Y0, z], [x * 0.2, 1, z * 0.2], len, 0.1, { color: OBS, bone: root, sides: 5 });
    if (i % 2 === 0) crystal(root, [x * 0.9, Y0, z * 0.9], [x * 0.3, 1, z * 0.3], len * 0.9, 0.12);
  }
  for (const [ang, r] of [
    [0.9, 1.0],
    [-0.9, 1.0],
    [2.4, 0.95],
    [-2.4, 0.95],
  ]) {
    const [x, z] = polar(ang, r);
    sign(root, POOL, [x, 0.128, z], [0, 1, 0], [0.34, 0.3], 1, [0, 0, -1]);
  }
  for (let i = 0; i < 18; i++) {
    const ang = R() * Math.PI * 2;
    const [x, z] = polar(ang, 1.3 + R() * 0.5);
    const e = 0.025 + R() * 0.03;
    glow(chunk(root, "oct", [x, 0.5 + R() * 2.7, z], [e, e * 1.8, e], i % 3 ? LAVA_HOT : HOT, [R() * 60, R() * 90, R() * 60]), 1.4);
  }
  // Floating shards behind and beside the golem.
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * (0.45 + (i / 6) * 1.1);
    const [x, z] = polar(ang, 1.35 + R() * 0.2);
    const y = 1.3 + (i % 4) * 0.5 + R() * 0.2;
    const w = 0.12 + R() * 0.07;
    if (i % 3 === 1) glow(chunk(root, "oct", [x, y, z], [w, w * 2.2, w], LAVA, [R() * 40, R() * 90, R() * 40]), 1.3);
    else chunk(root, "oct", [x, y, z], [w * 1.2, w * 2.6, w * 1.2], i % 2 ? BASALT : BASALT_P, [R() * 40, R() * 90, R() * 40]);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Torso: a molten hex core wrapped in stacked basalt rings
  const colR = (y: number) => 0.26 + 0.117 * (y - 1.46);
  const colPiece = (bone: J, y0: number, y1: number, color: string) =>
    glow(
      b.part(
        new THREE.LatheGeometry(
          [new THREE.Vector2(0, y0), new THREE.Vector2(colR(y0), y0), new THREE.Vector2(colR(y1), y1), new THREE.Vector2(0, y1)],
          6,
        ),
        color,
        { bone, at: [0, 0, 0.03], scale: [1.3, 1, 0.95], flat: true },
      ),
      1.1,
    );
  colPiece(spine1, 1.46, 1.72, LAVA_DEEP);
  colPiece(spine2, 1.72, 2.0, LAVA);
  colPiece(chest, 2.0, 2.4, LAVA_HOT);

  const rings: [number, number, number][] = [
    [1.48, 0.14, 0.34],
    [1.66, 0.14, 0.35],
    [1.84, 0.16, 0.39],
    [2.04, 0.18, 0.45],
    [2.26, 0.16, 0.5],
  ];
  rings.forEach(([y0, h, rad], i) => {
    const y1 = y0 + h;
    const geo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, y0),
        new THREE.Vector2(rad - 0.02, y0),
        new THREE.Vector2(rad, y0 + 0.03),
        new THREE.Vector2(rad, y1 - 0.03),
        new THREE.Vector2(rad - 0.03, y1),
        new THREE.Vector2(0, y1),
      ],
      6,
    ).rotateY(i % 2 ? Math.PI / 6 : 0);
    const bone = y0 < 1.6 ? spine1 : y0 < 2.0 ? spine2 : chest;
    b.part(geo, i % 2 ? BASALT : BASALT_P, { bone, at: [0, 0, 0.03], scale: [1.3, 1, 0.95], flat: true });
  });

  // Pelvis, belt, hanging plates
  chunk(hips, "box", [0, 1.3, 0], [0.9, 0.32, 0.54], BASALT_D);
  chunk(hips, "box", [0, 1.46, 0], [0.98, 0.1, 0.6], GOLD);
  chunk(hips, "box", [0, 1.42, 0.31], [0.22, 0.22, 0.06], GOLD, [0, 0, 45]);
  sign(hips, RUNE, [0, 1.42, 0.343], [0, 0, 1], [0.15, 0.15], 1.1);
  chunk(hips, "box", [0, 1.16, 0.3], [0.24, 0.42, 0.07], BASALT);
  for (const s of [1, -1]) {
    chunk(hips, "box", [s * 0.27, 1.2, 0.28], [0.2, 0.34, 0.07], BASALT_P, [0, 0, s * 8]);
    chunk(hips, "box", [s * 0.46, 1.28, 0], [0.07, 0.3, 0.4], BASALT_P);
  }
  chunk(hips, "box", [0, 1.18, -0.3], [0.5, 0.4, 0.07], BASALT);
  sign(hips, CRACK, [0, 1.18, -0.338], [0, 0, -1], [0.14, 0.28]);

  // Medallion: gilt hex, ring, glowing pyro emblem
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 6), GOLD, { bone: spine2, at: [0, 1.86, 0.45], dir: [0, 0, 1], flat: true });
  b.part(new THREE.TorusGeometry(0.17, 0.022, 5, 12), GOLD, { bone: spine2, at: [0, 1.86, 0.485], flat: true });
  sign(spine2, EMBLEM, [0, 1.86, 0.49], [0, 0, 1], [0.31, 0.31], 1.2);

  // Chest armour
  for (const s of [1, -1]) {
    chunk(chest, "box", [s * 0.33, 2.25, 0.34], [0.46, 0.34, 0.34], BASALT, [-10, s * -12, s * 6]);
    chunk(chest, "box", [s * 0.36, 2.06, 0.3], [0.3, 0.1, 0.2], BASALT_D, [0, s * -10, 0]);
  }
  chunk(chest, "box", [0, 2.12, -0.3], [1.0, 0.74, 0.34], BASALT);
  chunk(chest, "box", [0, 2.5, -0.1], [1.22, 0.2, 0.4], BASALT_D);
  sign(chest, CRACK, [0, 2.1, -0.472], [0, 0, -1], [0.24, 0.6]);
  for (let i = 0; i < 5; i++) {
    const y = 2.62 - i * 0.22;
    chunk(i > 2 ? spine2 : chest, "dode", [0, y, -0.5 - (i === 0 ? 0 : 0.02)], [0.2 - i * 0.02, 0.22, 0.22], i % 2 ? BASALT_P : BASALT, [R() * 20, R() * 60, R() * 20]);
  }
  // Back vents with flames
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.36, 6), OBS, { bone: chest, at: [s * 0.3, 2.52, -0.42], rotation: [-22, 0, 0], flat: true });
    glowBox(chest, [s * 0.3, 2.7, -0.5], [0.14, 0.03, 0.14], LAVA_HOT, 1.3, [-22, 0, 0]);
    flame(chest, [s * 0.3, 2.7, -0.5], 0, s * 8, 0.24, 0.55);
    flame(chest, [s * 0.3, 2.7, -0.5], 90, 0, 0.22, 0.45);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head
  chunk(head, "box", [0, HY, HZ], [0.56, 0.4, 0.46], BASALT);
  chunk(head, "box", [0, HY - 0.16, HZ + 0.28], [0.42, 0.15, 0.2], BASALT_D);
  chunk(head, "box", [0, HY + 0.05, HZ + 0.26], [0.1, 0.22, 0.1], BASALT_P, [-8, 0, 0]);
  chunk(head, "box", [0, HY + 0.2, HZ - 0.02], [0.4, 0.1, 0.4], BASALT_D);
  glowBox(head, [0, HY - 0.222, HZ + 0.34], [0.36, 0.03, 0.2], LAVA_HOT, 1.3);
  chunk(neck, "hex", [0, 2.5, 0.1], [0.36, 0.22, 0.34], BASALT_D);
  glowBox(neck, [0, 2.4, 0.08], [0.3, 0.05, 0.3], LAVA, 1);

  for (const s of [1, -1]) {
    chunk(head, "box", [s * 0.15, HY + 0.14, HZ + 0.25], [0.3, 0.1, 0.14], OBS, [0, 0, s * 14]);
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.14, HY + 0.02, HZ + 0.234], [0, 0, 1], [0.2, 0.1], 1.4);
    chunk(head, "box", [s * 0.3, HY - 0.04, HZ + 0.1], [0.1, 0.3, 0.3], BASALT_P, [0, s * 10, s * 6]);
    b.spike([s * 0.34, HY - 0.02, HZ + 0.1], [s, 0.2, -0.2], 0.2, 0.06, { color: OBS, bone: head, sides: 5 });
    // horns: dark base, glowing tip
    const horn = bezier(
      [s * 0.24, HY + 0.14, HZ - 0.02],
      [s * 0.48, HY + 0.2, HZ - 0.08],
      [s * 0.5, HY + 0.62, HZ - 0.24],
    );
    const hr = (t: number) => 0.08 * (1 - t) + 0.008;
    b.sweep(horn, hr, { bone: head, color: OBS, from: 0, to: 0.62, caps: { start: "flat", end: "flat" } });
    glow(b.sweep(horn, hr, { bone: head, color: LAVA_HOT, from: 0.62, to: 1, caps: { start: "flat", end: "point" } }), 1.3);
    // upper fangs
    for (const fx of [0.06, 0.16]) b.spike([s * fx, HY - 0.23, HZ + 0.4], [0, -1, 0.1], 0.1, 0.035, { color: TOOTH, bone: head, sides: 4 });
    // lower tusk
    b.spike([s * 0.15, HY - 0.46 + 0.1, HZ + 0.4], [0, 1, 0.25], 0.15, 0.04, { color: TOOTH, bone: jaw, sides: 4 });
  }
  chunk(jaw, "box", [0, HY - 0.28, HZ + 0.17], [0.4, 0.1, 0.3], BASALT_D);
  chunk(jaw, "box", [0, HY - 0.33, HZ + 0.3], [0.3, 0.08, 0.2], BASALT);
  glowBox(jaw, [0, HY - 0.225, HZ + 0.15], [0.3, 0.02, 0.2], LAVA_DEEP, 1);

  // Flame crest
  const crest: [number, number, number][] = [
    [-0.2, -26, 0.5],
    [-0.1, -13, 0.72],
    [0, 0, 1.0],
    [0.1, 13, 0.72],
    [0.2, 26, 0.5],
  ];
  for (const [x, lean, h] of crest) flame(head, [x, HY + 0.24, HZ - 0.02], 0, lean, 0.2, h);
  flame(head, [0, HY + 0.24, HZ - 0.02], 90, 0, 0.22, 0.65);
  flame(head, [0, HY + 0.24, HZ - 0.12], 55, -10, 0.2, 0.5);
  flame(head, [0, HY + 0.24, HZ - 0.12], -55, 10, 0.2, 0.5);

  // -------------------------------------------------------------------------------------------------------------
  // Legs and arms, both sides
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Leg
    const hipP: Vec = [s * 0.3, 1.3, 0];
    const kneeP: Vec = [s * 0.35, 0.8, 0.1];
    const ankP: Vec = [s * 0.34, 0.34, 0];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.34, Y0, 0.1],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    glow(b.rod(hipP, kneeP, 0.12, LAVA, { bone: hipJ, section: { ngon: 6 } }), 1);
    glow(b.rod(kneeP, ankP, 0.1, LAVA, { bone: kneeJ, section: { ngon: 6 } }), 1);
    orb(hipJ, hipP, 0.14, LAVA_HOT);
    seg(hipJ, hipP, kneeP, 0.03, 0.5, 0.4, 0.4, BASALT);
    seg(hipJ, hipP, kneeP, 0.58, 0.98, 0.38, 0.38, BASALT_D);
    orb(kneeJ, kneeP, 0.13, LAVA_HOT);
    chunk(kneeJ, "ico", [kneeP[0], kneeP[1] + 0.02, kneeP[2] + 0.2], [0.3, 0.28, 0.22], BASALT_P);
    seg(kneeJ, kneeP, ankP, 0.1, 0.52, 0.34, 0.34, BASALT);
    seg(kneeJ, kneeP, ankP, 0.58, 0.98, 0.44, 0.42, BASALT_D);
    chunk(kneeJ, "box", [s * 0.34, 0.5, 0.2], [0.22, 0.3, 0.07], GOLD, [-8, 0, 0]);
    chunk(ankleJ, "box", [s * 0.34, 0.22, 0.12], [0.46, 0.2, 0.56], BASALT_D);
    chunk(ankleJ, "box", [s * 0.34, 0.27, -0.14], [0.4, 0.28, 0.2], BASALT);
    sign(ankleJ, CRACK, [s * 0.34, 0.325, 0.14], [0, 1, 0], [0.12, 0.26], 1, [0, 0, -1]);
    [-0.15, 0, 0.15].forEach((dx, i) => {
      const x = s * 0.34 + dx;
      const toe = b.joint(`toe${S}${i + 1}`, { parent: ankleJ, at: [x, 0.2, 0.38], dir: [0, 0, 1], role: "digit" });
      chunk(toe, "box", [x, 0.19, 0.5], [0.13, 0.14, 0.2], BASALT_P);
      b.spike([x, 0.19, 0.58], [0, -0.1, 1], 0.1, 0.05, { color: OBS, bone: toe, sides: 5 });
    });

    // Shoulder and arm
    const shP: Vec = [s * 0.78, 2.2, 0];
    const elP: Vec = [s * 1.04, 1.62, 0.08];
    const wrP: Vec = [s * 1.14, 1.02, 0.2];
    const arm = b.chain(`arm${S}`, polyline([shP, elP, wrP]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.tip!;
    orb(shJ, shP, 0.16, LAVA_HOT);
    chunk(shJ, "ico", [s * 0.8, 2.42, 0], [0.52, 0.34, 0.5], BASALT, [0, 0, s * -10]);
    chunk(shJ, "ico", [s * 0.82, 2.62, 0], [0.36, 0.22, 0.34], BASALT_P, [0, 20, s * -8]);
    chunk(shJ, "hex", [s * 0.8, 2.24, 0], [0.5, 0.07, 0.5], GOLD);
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.6;
      b.spike([s * (0.95 + Math.cos(a) * 0.05), 2.5, Math.sin(a) * 0.22], [s * 1, 0.6, Math.sin(a)], 0.26 - Math.abs(k - 1) * 0.04, 0.08, {
        color: OBS,
        bone: shJ,
        sides: 5,
      });
    }
    crystal(shJ, [s * 0.76, 2.7, -0.12], [s * 0.25, 1, -0.35], 0.4, 0.13);
    crystal(shJ, [s * 0.86, 2.68, -0.02], [s * 0.5, 1, -0.1], 0.3, 0.1, HOT);
    crystal(shJ, [s * 0.72, 2.7, 0.1], [s * 0.1, 1, 0.3], 0.26, 0.09);

    glow(b.rod(shP, elP, 0.1, LAVA, { bone: shJ, section: { ngon: 6 } }), 1);
    seg(shJ, shP, elP, 0.14, 0.5, 0.34, 0.34, BASALT_D);
    seg(shJ, shP, elP, 0.56, 0.9, 0.36, 0.36, BASALT);
    orb(elJ, elP, 0.15, LAVA_HOT, 1.2);
    chunk(elJ, "hex", elP, [0.3, 0.07, 0.3], GOLD);
    b.spike([elP[0] + s * 0.08, elP[1] + 0.02, elP[2] - 0.1], [s * 0.4, -0.1, -1], 0.24, 0.07, { color: OBS, bone: elJ, sides: 5 });
    glow(b.rod(elP, wrP, 0.1, LAVA, { bone: elJ, section: { ngon: 6 } }), 1);
    seg(elJ, elP, wrP, 0.12, 0.45, 0.4, 0.4, BASALT_D);
    seg(elJ, elP, wrP, 0.5, 0.88, 0.5, 0.48, BASALT);
    seg(elJ, elP, wrP, 0.9, 1.0, 0.4, 0.4, GOLD, "hex");
    chunk(elJ, "box", [s * 1.12, 1.15, 0.43], [0.3, 0.26, 0.06], GOLD, [-12, 0, 0]);
    sign(elJ, RUNE, [s * 1.12, 1.15, 0.466], [0, 0.05, 1], [0.18, 0.18], 1.1);

    // Hand
    chunk(wrJ, "box", [wrP[0], wrP[1] - 0.15, wrP[2] + 0.01], [0.36, 0.26, 0.17], BASALT_P);
    chunk(wrJ, "ico", [wrP[0], wrP[1] - 0.1, wrP[2] - 0.08], [0.34, 0.2, 0.14], BASALT_D);
    const finger = (name: string, K: Vec, d: Vec, lens: number[], curl: number, rad: number) => {
      const pts: Vec[] = [K];
      let cur = V(K);
      const dir = V(d).normalize();
      lens.forEach((len, i) => {
        const dd = dir.clone();
        dd.z += curl * i;
        dd.normalize();
        cur = cur.clone().addScaledVector(dd, len);
        pts.push([cur.x, cur.y, cur.z]);
      });
      const ch = b.chain(name, polyline(pts), { parent: wrJ, names: pts.map((_, i) => `${name}${i + 1}`), role: "digit" });
      for (let j = 0; j < pts.length - 1; j++)
        b.rod(pts[j], pts[j + 1], [rad, rad * 0.85], j % 2 ? BASALT : BASALT_D, { section: { ngon: 4 }, bone: ch.joints[j] });
      chunk(ch.joints[0], "ico", K, [rad * 2.5, rad * 2.2, rad * 2.5], BASALT_P);
      const last = V(pts[pts.length - 1]).sub(V(pts[pts.length - 2]));
      glow(b.spike(pts[pts.length - 1], last, 0.09, rad * 0.9, { color: LAVA, bone: ch.joints[pts.length - 1], sides: 5 }), 1.2);
    };
    const lens: number[][] = [
      [0.14, 0.13, 0.1],
      [0.16, 0.15, 0.12],
      [0.15, 0.14, 0.11],
      [0.12, 0.11, 0.09],
    ];
    [-0.12, -0.04, 0.04, 0.12].forEach((xo, i) => {
      finger(`finger${S}${i + 1}`, [wrP[0] + xo, wrP[1] - 0.29, wrP[2] + 0.02], [xo * 1.6, -1, 0.1], lens[i], 0.14, 0.047);
    });
    finger(`thumb${S}`, [wrP[0] - s * 0.2, wrP[1] - 0.12, wrP[2] + 0.06], [-s * 0.5, -0.6, 0.6], [0.12, 0.11], 0.1, 0.055);
  }

  return b.root;
}
```