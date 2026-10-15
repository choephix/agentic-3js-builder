1. **Heavyweight silhouette:** the torso is rebuilt as six chamfered hex rings widening to 1.45 m, 0.85 m deep, on a molten core. Legs now sit at `s*0.40`, `0.45` and `0.46` with 0.46–0.52 m plates and 0.60 m feet. Shoulder rocks are about 20% bigger and the arms are heavier and wider. Palms are 0.28 m deep, fingers are 25% thicker and their segments are 28% shorter.
2. **Face:** the head block is `[0.70, 0.50, 0.54]` with the eyes, brows, cheeks, horns and jaw rebuilt around it. Eyes are 0.24 × 0.12 m planes 4 mm off the front surface. The muzzle projects only 0.08 m, with a 0.40 × 0.09 m dark mouth between solid lips and corner posts. Two stout fangs are rooted inside the upper lip.
3. **Seated attachments:** shoulder crystals are now hex-based spikes whose roots sit inside 0.18 m basalt collars on the shoulder rock. Shoulder spike roots are buried in the pauldron. Limb plate gaps are about 0.03–0.04 m, spanned by the lava rods and joint orbs.
4. **Back shell:** the slab is replaced by two angled, clipped scapular plates (0.52 × 0.60 × 0.20 m) and a lower-back plate, with 0.04 m seams over a dark-red core. The five dorsal `dode` chunks are sunk 0.03–0.08 m into the shell. Vents get socket collars, a lava disc and flame bases on the vent axis.
5. **Flames:** each flame is now three nested slabs about 0.12 m deep, tapering toward the tip, with the orange and yellow layers poking out of both faces. Crown flames are 0.58 m (centre), 0.42 and 0.30 m, plus perpendicular and rear slabs. Vent flames are 0.38 m.
6. **Platform and clutter:** the platform radius is 1.30 m, with rim stones, ring, floor graphic and pools remapped. Rear spikes are 0.25–0.40 m. The floating shards are cut to three small low fragments and the embers to 9, kept clear of the face.
7. **Basalt paint and plates:** `basaltPaint` is replaced by a charcoal-blue `rock()` with `#30323f`, `#4b5060` and `#737b88` tones, flecks at 0.12, and broad tone planes. New `plate()` and `segPlate()` helpers make chamfered, bevelled plates for the chest, forearms, shins, knees, feet and scapulars.
8. **Gold and lava hierarchy:** gold is cut to the medallion and a small belt buckle, with bronze or basalt elsewhere. The crack texture is redrawn with dark-red outlines, orange cores and branches, and yellow only at junctions. Fissure decals are added on the breastplate, forearms, shins, scapulars, lower back and hips.

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
    "A heavyweight cel-shaded lava golem: chamfered charcoal basalt plates around a molten core, branching fissures, a pyro medallion, a compact flame crown and a sigil-lit lava platform.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Flat colours glow (lava); paints are the cel-shaded rock and trim.
const LAVA = "#ff6a1a";
const LAVA_HOT = "#ffa42e";
const LAVA_DEEP = "#e03a14";
const CORE_RED = "#8a1e10";
const HOT = "#ffe27a";
const TOOTH = "#f4e1b5";
const D2R = Math.PI / 180;

function rock(lo: string, mid: string, hi: string, deep: string, seed: number) {
  const lit = paint((p, n) => {
    let c = mix(mid, hi, smoothstep(0.35, 0.95, n.y) * 0.85);
    c = mix(c, lo, 0.1 * smoothstep(0.62, 0.78, noise(p, 0.07, seed)) + 0.18 * smoothstep(0.4, 0.7, noise(p, 0.35, seed + 2)));
    c = mix(c, "#c9573a", 0.35 * smoothstep(0.1, -0.7, n.y) * smoothstep(1.4, 0.2, p.y)); // lava bounce light
    return c;
  });
  const shade = paint((p, n) => mix(deep, "#8a2c1c", 0.4 * smoothstep(0.1, -0.7, n.y) * smoothstep(1.4, 0.2, p.y)));
  return cel(lit, shade);
}
const BASALT = rock("#30323f", "#4b5060", "#737b88", "#2a2c39", 3);
const BASALT_D = rock("#25273a", "#3a3e4f", "#5b6272", "#1c1e2c", 8);
const BASALT_P = rock("#3c4050", "#5a6272", "#8a93a2", "#32364a", 5);
const OBS = cel("#232433", "#14141f");
const GOLD = cel("#f3c552", "#b8702c");
const BRONZE = cel("#8c6a3e", "#4a3522");

export default function build() {
  const b = createBuilder({ name: "basaltLavaGolem" });
  type J = ReturnType<typeof b.joint>;
  const R = rng(2024);
  const Y0 = 0.12; // top of the platform: where the soles stand
  const V = (p: Vec) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (v: THREE.Vector3): Vec => [v.x, v.y, v.z];

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

  // Branching fissure: dark-red rim, orange core, pale yellow only at the hottest junctions.
  const MAIN = "M34 2 L28 24 L38 40 L26 62 L36 80 L24 104 L30 126";
  const BRANCH = "M38 40 L52 48 L56 62 M26 62 L12 70 L8 88 M36 80 L50 92";
  const CRACK = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${MAIN}" stroke="#7a1608" stroke-width="9"/>
      <path d="${BRANCH}" stroke="#7a1608" stroke-width="6"/>
      <path d="${MAIN}" stroke="#ff6a1a" stroke-width="4.5"/>
      <path d="${BRANCH}" stroke="#ff7a1c" stroke-width="2.6"/>
      <circle cx="38" cy="40" r="2.6" fill="#ffe27a" stroke="none"/>
      <circle cx="26" cy="62" r="2.6" fill="#ffe27a" stroke="none"/>
      <circle cx="36" cy="80" r="2.2" fill="#ffe27a" stroke="none"/>
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

  // Clipped-corner plate with a bevelled rim: outline in x/y, thickness along z, then turned by `rot` degrees.
  const plate = (bone: J, at: Vec, size: Vec, color: ColorInput, rot: Vec = [0, 0, 0], clip = 0.06, bev = 0.025) => {
    const [w, h, d] = size;
    const c = Math.min(clip, w * 0.3, h * 0.3);
    const hw = w / 2;
    const hh = h / 2;
    const outline: [number, number][] = [
      [-hw + c, -hh],
      [hw - c, -hh],
      [hw, -hh + c],
      [hw, hh - c],
      [hw - c, hh],
      [-hw + c, hh],
      [-hw, hh - c],
      [-hw, -hh + c],
    ];
    const e = new THREE.Euler(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R);
    const x = new THREE.Vector3(1, 0, 0).applyEuler(e);
    const y = new THREE.Vector3(0, 1, 0).applyEuler(e);
    return b.extrude(outline, { at, x: arr(x), y: arr(y), thickness: d, bevel: Math.min(bev, d * 0.4), color, bone });
  };

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
  // The same along a limb, but as a bevelled clipped plate; returns the front face frame for decals.
  const segPlate = (bone: J, a: Vec, c: Vec, t0: number, t1: number, w: number, dp: number, color: ColorInput) => {
    const A = V(a);
    const C = V(c);
    const d = C.clone().sub(A).normalize();
    const from = A.clone().lerp(C, t0);
    const to = A.clone().lerp(C, t1);
    const mid = from.clone().lerp(to, 0.5);
    const L = from.distanceTo(to);
    const x = new THREE.Vector3(-1, 0, 0);
    x.addScaledVector(d, -x.dot(d)).normalize();
    const n = x.clone().cross(d).normalize();
    const cl = Math.min(0.05, w * 0.3, L * 0.3);
    const hw = w / 2;
    const hh = L / 2;
    const outline: [number, number][] = [
      [-hw + cl, -hh],
      [hw - cl, -hh],
      [hw, -hh + cl],
      [hw, hh - cl],
      [hw - cl, hh],
      [-hw + cl, hh],
      [-hw, hh - cl],
      [-hw, -hh + cl],
    ];
    const part = b.extrude(outline, { at: arr(mid), x: arr(x), y: arr(d), thickness: dp, bevel: 0.022, color, bone });
    return { part, at: mid, n, d, dp };
  };

  // Spike crystal seated in a small basalt collar: its root is buried in the collar and the rock under it.
  const crystal = (bone: J, base: Vec, dir: Vec, len: number, w: number, color = LAVA_HOT, str = 1.3) => {
    const d = V(dir).normalize();
    const cw = Math.max(0.17, w * 1.4);
    b.part(shape("hex"), BASALT_D, { bone, at: base, dir: d, scale: [cw, 0.1, cw], flat: true });
    const root = V(base).addScaledVector(d, -0.05);
    return glow(b.spike(arr(root), arr(d), len + 0.05, w / 2, { color, bone, sides: 6 }), str);
  };

  // A glowing drawing on a flat face.
  const sign = (bone: J, tex: THREE.Texture, at: Vec, dir: Vec, size: [number, number], str = 1, up?: Vec) =>
    glow(
      b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex }),
      str,
    );
  const crackOn = (bone: J, p: { at: THREE.Vector3; n: THREE.Vector3; d: THREE.Vector3; dp: number }, size: [number, number], dx = 0) =>
    sign(
      bone,
      CRACK,
      arr(p.at.clone().addScaledVector(p.n, p.dp / 2 + 0.004).add(new THREE.Vector3(dx, 0, 0))),
      arr(p.n),
      size,
      1,
      arr(p.d.clone().negate()),
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
  // Flame volume: three nested tapering slabs (red, orange, yellow); inner layers poke out of both faces.
  const flameF = (bone: J, at: Vec, x: THREE.Vector3, y: THREE.Vector3, w: number, h: number) => {
    const t0 = 0.12;
    const t1 = 0.02;
    const T = (yy: number) => t0 - (t0 - t1) * (yy / h);
    const layers: [number, number, string, number, number][] = [
      [1, 1, "#ff4a1a", 0, 1],
      [0.72, 0.78, "#ff8a1f", 1, 1.25],
      [0.42, 0.55, "#ffd54a", 2, 1.5],
    ];
    for (const [sw, sh, col, i, str] of layers) {
      glow(
        b.extrude(
          FLAME.map(([px, py]) => [px * w * sw, py * h * sh] as [number, number]),
          { at, x: arr(x), y: arr(y), thickness: [T(0) + 0.005 * i, T(h * sh) + 0.005 * i], color: col, bone },
        ),
        str,
      );
    }
  };
  // yaw turns the plane about Y, lean tips it sideways.
  const flame = (bone: J, at: Vec, yawDeg: number, leanDeg: number, w: number, h: number) => {
    const yaw = yawDeg * D2R;
    const a = leanDeg * D2R;
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const up = new THREE.Vector3(0, 1, 0);
    const x = r.clone().multiplyScalar(Math.cos(a)).addScaledVector(up, -Math.sin(a));
    const y = r.clone().multiplyScalar(Math.sin(a)).addScaledVector(up, Math.cos(a));
    flameF(bone, at, x, y, w, h);
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
  const HY = 2.84;
  const HZ = 0.16;
  const neck = b.joint("neck", { parent: chest, at: [0, 2.4, 0.06], aim: [0, 2.56, 0.14], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.56, 0.14], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.26, HZ - 0.02], dir: [0, -0.04, 1], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Platform (radius 1.30): basalt disc, lava channel, sigil, rim stones, spikes, embers
  b.part(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1.3, 0),
        new THREE.Vector2(1.3, 0.07),
        new THREE.Vector2(1.24, 0.12),
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
          new THREE.Vector2(1.12, 0),
          new THREE.Vector2(1.19, 0),
          new THREE.Vector2(1.19, 0.012),
          new THREE.Vector2(1.12, 0.012),
        ],
        10,
      ),
      LAVA,
      { bone: root, at: [0, 0.121, 0], flat: true },
    ),
    1,
  );
  sign(root, FLOOR, [0, 0.124, 0], [0, 1, 0], [2.2, 2.2], 1, [0, 0, -1]);

  const polar = (ang: number, r: number): [number, number] => [Math.sin(ang) * r, Math.cos(ang) * r];
  for (let i = 0; i < 11; i++) {
    const ang = (i / 11) * Math.PI * 2 + R() * 0.2;
    const [x, z] = polar(ang, 1.27);
    const front = Math.cos(ang) > 0.3 ? 0.5 : 1;
    const h = (0.14 + R() * 0.16) * front;
    chunk(
      root,
      i % 2 ? "dode" : "ico",
      [x, Y0 + h * 0.3, z],
      [0.22 + R() * 0.12, h, 0.22 + R() * 0.12],
      i % 3 ? BASALT : BASALT_P,
      [R() * 40, R() * 360, R() * 30],
    );
  }
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * (0.55 + (i / 6) * 0.9) + R() * 0.15; // behind the golem
    const [x, z] = polar(ang, 1.05 + R() * 0.1);
    const len = 0.25 + R() * 0.15;
    b.spike([x, Y0, z], [x * 0.2, 1, z * 0.2], len, 0.08, { color: OBS, bone: root, sides: 5 });
    if (i % 2 === 0) crystal(root, [x * 0.9, Y0, z * 0.9], [x * 0.3, 1, z * 0.3], len * 0.8, 0.1);
  }
  for (const [ang, r] of [
    [1.25, 0.95],
    [-1.25, 0.95],
    [2.4, 0.9],
    [-2.4, 0.9],
  ]) {
    const [x, z] = polar(ang, r);
    sign(root, POOL, [x, 0.128, z], [0, 1, 0], [0.3, 0.26], 1, [0, 0, -1]);
  }
  for (let i = 0; i < 9; i++) {
    const ang = R() * Math.PI * 2;
    const [x, z] = polar(ang, 1.15 + R() * 0.35);
    const e = 0.025 + R() * 0.025;
    glow(chunk(root, "oct", [x, 0.5 + R() * 2.3, z], [e, e * 1.8, e], i % 3 ? LAVA_HOT : HOT, [R() * 60, R() * 90, R() * 60]), 1.4);
  }
  // Three small airborne fragments below shoulder height.
  chunk(root, "oct", [1.4, 1.1, -0.5], [0.09, 0.2, 0.09], BASALT_P, [20, 40, 10]);
  glow(chunk(root, "oct", [-1.45, 1.5, -0.3], [0.08, 0.18, 0.08], LAVA, [10, 70, 30]), 1.3);
  chunk(root, "oct", [-0.3, 1.2, -1.35], [0.09, 0.2, 0.09], BASALT, [30, 10, 20]);

  // -------------------------------------------------------------------------------------------------------------
  // Torso: a molten hex core wrapped in stacked, chamfered basalt rings (flat faces front and back)
  const colR = (y: number) => 0.34 + 0.13 * (y - 1.46);
  const colPiece = (bone: J, y0: number, y1: number, color: string) =>
    glow(
      b.part(
        new THREE.LatheGeometry(
          [new THREE.Vector2(0, y0), new THREE.Vector2(colR(y0), y0), new THREE.Vector2(colR(y1), y1), new THREE.Vector2(0, y1)],
          6,
        ),
        color,
        { bone, at: [0, 0, 0.03], scale: [1.3, 1, 0.72], flat: true },
      ),
      1.1,
    );
  colPiece(spine1, 1.46, 1.72, LAVA_DEEP);
  colPiece(spine2, 1.72, 2.0, LAVA);
  colPiece(chest, 2.0, 2.42, LAVA_HOT);

  const rings: [number, number, number][] = [
    [1.48, 0.14, 0.34],
    [1.66, 0.14, 0.38],
    [1.84, 0.16, 0.44],
    [2.04, 0.18, 0.5],
    [2.26, 0.16, 0.56],
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
    ).rotateY(Math.PI / 6);
    const bone = y0 < 1.6 ? spine1 : y0 < 2.0 ? spine2 : chest;
    b.part(geo, i % 2 ? BASALT : BASALT_P, { bone, at: [0, 0, 0.03], scale: [1.3, 1, 0.88], flat: true });
  });

  // Pelvis, belt, hanging plates
  chunk(hips, "box", [0, 1.3, 0], [1.2, 0.32, 0.7], BASALT_D);
  chunk(hips, "box", [0, 1.46, 0], [1.28, 0.1, 0.78], BRONZE);
  chunk(hips, "box", [0, 1.42, 0.4], [0.22, 0.22, 0.06], GOLD, [0, 0, 45]);
  sign(hips, RUNE, [0, 1.42, 0.434], [0, 0, 1], [0.15, 0.15], 1.1);
  plate(hips, [0, 1.15, 0.38], [0.28, 0.42, 0.08], BASALT, [0, 0, 0], 0.05, 0.02);
  for (const s of [1, -1]) {
    plate(hips, [s * 0.4, 1.2, 0.38], [0.24, 0.34, 0.08], BASALT_P, [0, 0, s * 8], 0.05, 0.02);
    chunk(hips, "box", [s * 0.62, 1.28, 0], [0.08, 0.3, 0.5], BASALT_P);
  }
  plate(hips, [0, 1.18, -0.4], [0.6, 0.4, 0.08], BASALT, [0, 180, 0], 0.07, 0.02);
  sign(hips, CRACK, [0, 1.18, -0.444], [0, 0, -1], [0.14, 0.28]);

  // Medallion: gilt hex, ring, glowing pyro emblem (the one big gold accent)
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 6), GOLD, { bone: spine2, at: [0, 1.86, 0.4], dir: [0, 0, 1], flat: true });
  b.part(new THREE.TorusGeometry(0.17, 0.022, 5, 12), GOLD, { bone: spine2, at: [0, 1.86, 0.435], flat: true });
  sign(spine2, EMBLEM, [0, 1.86, 0.44], [0, 0, 1], [0.31, 0.31], 1.2);

  // Chest front: breastplate with a fissure, flanked by plates
  plate(chest, [0, 2.3, 0.45], [0.7, 0.3, 0.14], BASALT, [0, 0, 0], 0.07, 0.03);
  sign(chest, CRACK, [0.2, 2.3, 0.524], [0, 0, 1], [0.13, 0.27]);
  for (const s of [1, -1]) plate(chest, [s * 0.52, 2.15, 0.26], [0.3, 0.3, 0.14], BASALT_D, [0, s * 40, 0], 0.05, 0.025);
  chunk(chest, "box", [0, 2.5, -0.1], [1.5, 0.2, 0.7], BASALT_D);

  // Back shell: dark-red core, two angled scapular plates, a lower-back plate, dorsal stones
  glowBox(chest, [0, 2.08, -0.38], [0.9, 0.76, 0.1], CORE_RED, 0.7);
  const rotY = (s: number) => -s * 14;
  for (const s of [1, -1]) {
    const c: Vec = [s * 0.28, 2.12, -0.46];
    plate(chest, c, [0.52, 0.6, 0.2], BASALT, [0, rotY(s), 0], 0.1, 0.03);
    const th = rotY(s) * D2R;
    const nB = new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th)); // back-facing normal
    const at = V(c).addScaledVector(nB, 0.104);
    sign(chest, CRACK, arr(at), arr(nB), [0.2, 0.4], 1, [0, 1, 0]);
  }
  plate(spine2, [0, 1.62, -0.31], [0.56, 0.32, 0.16], BASALT_D, [0, 180, 0], 0.07, 0.025);
  sign(spine2, CRACK, [0, 1.62, -0.394], [0, 0, -1], [0.12, 0.24]);
  const dorsal: [number, number, number][] = [
    [2.34, 0.2, -0.6],
    [2.16, 0.19, -0.6],
    [1.98, 0.18, -0.6],
    [1.8, 0.17, -0.55],
    [1.62, 0.16, -0.46],
  ];
  dorsal.forEach(([y, sz, z], i) => {
    chunk(y > 1.95 ? chest : y > 1.7 ? spine2 : spine1, "dode", [0, y, z], [sz * 0.9, sz, 0.2], i % 2 ? BASALT_P : BASALT, [R() * 20, R() * 60, R() * 20]);
  });

  // Back vents: sockets, collars, lava disc and flames aligned with the vent axis
  const ventA = new THREE.Vector3(0, Math.cos(20 * D2R), -Math.sin(20 * D2R));
  for (const s of [1, -1]) {
    const C = new THREE.Vector3(s * 0.3, 2.54, -0.5);
    const T = C.clone().addScaledVector(ventA, 0.15);
    chunk(chest, "hex", [s * 0.3, 2.41, -0.46], [0.3, 0.08, 0.3], BASALT_D);
    b.part(new THREE.CylinderGeometry(0.11, 0.14, 0.3, 6), OBS, { bone: chest, at: arr(C), dir: arr(ventA), flat: true });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 6), BASALT_D, {
      bone: chest,
      at: arr(T.clone().addScaledVector(ventA, -0.01)),
      dir: arr(ventA),
      flat: true,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 6), LAVA_HOT, {
        bone: chest,
        at: arr(T.clone().addScaledVector(ventA, 0.005)),
        dir: arr(ventA),
        flat: true,
      }),
      1.3,
    );
    const base = arr(T.clone().addScaledVector(ventA, 0.012));
    flame(chest, base, 90, 20, 0.2, 0.38);
    flameF(chest, base, new THREE.Vector3(1, 0, 0), ventA.clone(), 0.18, 0.3);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: bigger block, one clear mouth, two stout upper fangs, compact flame crown
  chunk(head, "box", [0, HY, HZ], [0.7, 0.5, 0.54], BASALT);
  chunk(head, "box", [0, HY + 0.3, HZ - 0.02], [0.56, 0.1, 0.5], BASALT_D);
  chunk(head, "box", [0, HY - 0.02, HZ + 0.28], [0.08, 0.22, 0.08], BASALT_P);
  chunk(neck, "hex", [0, 2.5, 0.1], [0.5, 0.3, 0.46], BASALT_D);
  glowBox(neck, [0, 2.4, 0.08], [0.4, 0.05, 0.4], LAVA, 1);

  // Upper lip (muzzle projects 0.08 beyond the face), corner posts, dark mouth fill
  chunk(head, "box", [0, HY - 0.17, HZ + 0.15], [0.56, 0.12, 0.4], BASALT_D);
  for (const s of [1, -1]) chunk(head, "box", [s * 0.235, HY - 0.275, HZ + 0.15], [0.08, 0.09, 0.4], BASALT_D);
  chunk(head, "box", [0, HY - 0.275, HZ + 0.25], [0.4, 0.09, 0.12], "#0d0810");
  // Lower lip and chin ride the jaw
  chunk(jaw, "box", [0, HY - 0.36, HZ + 0.15], [0.56, 0.08, 0.4], BASALT_D);
  chunk(jaw, "box", [0, HY - 0.43, HZ + 0.12], [0.5, 0.08, 0.34], BASALT);
  glowBox(jaw, [0, HY - 0.318, HZ + 0.26], [0.32, 0.012, 0.1], LAVA_DEEP, 1);

  for (const s of [1, -1]) {
    // Eyes: 0.24 x 0.12 planes 4 mm off the front face
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.17, HY + 0.03, HZ + 0.274], [0, 0, 1], [0.24, 0.12], 1.4);
    // Slanted brows
    chunk(head, "box", [s * 0.19, HY + 0.175, HZ + 0.28], [0.34, 0.08, 0.12], OBS, [0, 0, s * 14]);
    // Cheeks and cheek spikes (root buried in the cheek)
    chunk(head, "box", [s * 0.4, HY - 0.04, HZ + 0.08], [0.12, 0.34, 0.34], BASALT_P, [0, s * 10, s * 6]);
    b.spike([s * 0.4, HY - 0.04, HZ + 0.05], [s, 0.2, -0.25], 0.2, 0.06, { color: OBS, bone: head, sides: 5 });
    // Horns with a basalt collar
    chunk(head, "hex", [s * 0.3, HY + 0.17, HZ - 0.02], [0.2, 0.14, 0.2], BASALT_D);
    const horn = bezier(
      [s * 0.3, HY + 0.16, HZ - 0.02],
      [s * 0.58, HY + 0.22, HZ - 0.04],
      [s * 0.62, HY + 0.62, HZ - 0.2],
    );
    const hr = (t: number) => 0.09 * (1 - t) + 0.008;
    b.sweep(horn, hr, { bone: head, color: OBS, from: 0, to: 0.62, caps: { start: "flat", end: "flat" } });
    glow(b.sweep(horn, hr, { bone: head, color: LAVA_HOT, from: 0.62, to: 1, caps: { start: "flat", end: "point" } }), 1.3);
    // Two stout upper corner fangs, rooted inside the lip
    b.spike([s * 0.2, HY - 0.15, HZ + 0.3], [0, -1, 0.05], 0.16, 0.05, { color: TOOTH, bone: head, sides: 5 });
  }

  // Flame crown: 0.58 centre, 0.42 and 0.30 flanks, perpendicular and rear slabs
  const HB = HY + 0.34;
  flame(head, [0, HB, HZ - 0.02], 0, 0, 0.22, 0.58);
  flame(head, [0, HB, HZ - 0.02], 90, 0, 0.24, 0.5);
  for (const s of [1, -1]) {
    flame(head, [s * 0.14, HB, HZ - 0.02], 0, s * 12, 0.2, 0.42);
    flame(head, [s * 0.27, HB, HZ - 0.02], 0, s * 24, 0.18, 0.3);
  }
  flame(head, [0, HB, HZ - 0.14], 90, -8, 0.2, 0.38);
  flame(head, [0, HB, HZ - 0.12], 60, -10, 0.18, 0.34);
  flame(head, [0, HB, HZ - 0.12], -60, 10, 0.18, 0.34);

  // -------------------------------------------------------------------------------------------------------------
  // Legs and arms, both sides
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Leg
    const hipP: Vec = [s * 0.4, 1.3, 0];
    const kneeP: Vec = [s * 0.45, 0.8, 0.1];
    const ankP: Vec = [s * 0.46, 0.34, 0];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.46, Y0, 0.1],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    glow(b.rod(hipP, kneeP, 0.13, LAVA, { bone: hipJ, section: { ngon: 6 } }), 1);
    glow(b.rod(kneeP, ankP, 0.12, LAVA, { bone: kneeJ, section: { ngon: 6 } }), 1);
    orb(hipJ, hipP, 0.16, LAVA_HOT);
    seg(hipJ, hipP, kneeP, 0.03, 0.5, 0.5, 0.5, BASALT);
    seg(hipJ, hipP, kneeP, 0.58, 0.98, 0.48, 0.48, BASALT_D);
    orb(kneeJ, kneeP, 0.15, LAVA_HOT);
    plate(kneeJ, [kneeP[0], kneeP[1] + 0.02, kneeP[2] + 0.24], [0.36, 0.3, 0.16], BASALT_P, [0, 0, 0], 0.07, 0.03);
    const shinA = segPlate(kneeJ, kneeP, ankP, 0.1, 0.52, 0.46, 0.44, BASALT);
    segPlate(kneeJ, kneeP, ankP, 0.58, 0.98, 0.52, 0.46, BASALT_D);
    crackOn(kneeJ, shinA, [0.12, 0.24]);
    // Foot: wide plated foot and heel, three clawed toes
    plate(ankleJ, [s * 0.46, 0.22, 0.12], [0.6, 0.2, 0.62], BASALT_D, [0, 0, 0], 0.06, 0.03);
    chunk(ankleJ, "box", [s * 0.46, 0.27, -0.14], [0.52, 0.28, 0.22], BASALT);
    sign(ankleJ, CRACK, [s * 0.46, 0.325, 0.16], [0, 1, 0], [0.12, 0.26], 1, [0, 0, -1]);
    [-0.2, 0, 0.2].forEach((dx, i) => {
      const x = s * 0.46 + dx;
      const toe = b.joint(`toe${S}${i + 1}`, { parent: ankleJ, at: [x, 0.2, 0.4], dir: [0, 0, 1], role: "digit" });
      chunk(toe, "box", [x, 0.19, 0.52], [0.16, 0.14, 0.2], BASALT_P);
      b.spike([x, 0.19, 0.6], [0, -0.1, 1], 0.1, 0.055, { color: OBS, bone: toe, sides: 5 });
    });

    // Shoulder and arm
    const shP: Vec = [s * 0.95, 2.2, 0];
    const elP: Vec = [s * 1.1, 1.62, 0.08];
    const wrP: Vec = [s * 1.14, 1.0, 0.22];
    const arm = b.chain(`arm${S}`, polyline([shP, elP, wrP]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.tip!;
    orb(shJ, shP, 0.19, LAVA_HOT);
    chunk(shJ, "ico", [s * 0.95, 2.44, 0], [0.62, 0.42, 0.6], BASALT, [0, 0, s * -10]);
    chunk(shJ, "ico", [s * 0.97, 2.69, 0], [0.43, 0.26, 0.41], BASALT_P, [0, 20, s * -8]);
    chunk(shJ, "hex", [s * 0.95, 2.24, 0], [0.6, 0.07, 0.6], BRONZE);
    // Shoulder spikes: roots sunk into the pauldron
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.6;
      b.spike([s * 1.08, 2.46, Math.sin(a) * 0.2], [s * 1, 0.5, Math.sin(a)], 0.3 - Math.abs(k - 1) * 0.04, 0.09, {
        color: OBS,
        bone: shJ,
        sides: 5,
      });
    }
    crystal(shJ, [s * 0.92, 2.74, -0.12], [s * 0.25, 1, -0.35], 0.36, 0.13);
    crystal(shJ, [s * 1.02, 2.72, 0], [s * 0.5, 1, -0.1], 0.28, 0.1, HOT);
    crystal(shJ, [s * 0.86, 2.72, 0.1], [s * 0.1, 1, 0.3], 0.24, 0.09);

    glow(b.rod(shP, elP, 0.12, LAVA, { bone: shJ, section: { ngon: 6 } }), 1);
    seg(shJ, shP, elP, 0.14, 0.5, 0.46, 0.46, BASALT_D);
    seg(shJ, shP, elP, 0.56, 0.9, 0.48, 0.48, BASALT);
    orb(elJ, elP, 0.17, LAVA_HOT, 1.2);
    chunk(elJ, "hex", elP, [0.34, 0.07, 0.34], BRONZE);
    b.spike([elP[0] + s * 0.08, elP[1] + 0.02, elP[2] - 0.1], [s * 0.4, -0.1, -1], 0.24, 0.08, { color: OBS, bone: elJ, sides: 5 });
    glow(b.rod(elP, wrP, 0.12, LAVA, { bone: elJ, section: { ngon: 6 } }), 1);
    const fa1 = segPlate(elJ, elP, wrP, 0.12, 0.45, 0.5, 0.44, BASALT_D);
    const fa2 = segPlate(elJ, elP, wrP, 0.5, 0.88, 0.58, 0.5, BASALT);
    crackOn(elJ, fa1, [0.1, 0.2]);
    crackOn(elJ, fa2, [0.12, 0.26]);
    seg(elJ, elP, wrP, 0.9, 1.0, 0.46, 0.46, BRONZE, "hex");

    // Hand: deep palm, short thick fingers
    chunk(wrJ, "box", [wrP[0], wrP[1] - 0.15, wrP[2] + 0.01], [0.46, 0.28, 0.28], BASALT_P);
    chunk(wrJ, "ico", [wrP[0], wrP[1] - 0.1, wrP[2] - 0.1], [0.4, 0.22, 0.2], BASALT_D);
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
      glow(b.spike(pts[pts.length - 1], last, 0.07, rad * 0.9, { color: LAVA, bone: ch.joints[pts.length - 1], sides: 5 }), 1.2);
    };
    const K = 0.72; // segment lengths shortened ~28%
    const lens: number[][] = [
      [0.14, 0.13, 0.1],
      [0.16, 0.15, 0.12],
      [0.15, 0.14, 0.11],
      [0.12, 0.11, 0.09],
    ].map((l) => l.map((v) => v * K));
    [-0.1575, -0.0525, 0.0525, 0.1575].forEach((xo, i) => {
      finger(`finger${S}${i + 1}`, [wrP[0] + xo, wrP[1] - 0.29, wrP[2] + 0.02], [xo * 1.6, -1, 0.1], lens[i], 0.14, 0.0585);
    });
    finger(`thumb${S}`, [wrP[0] - s * 0.24, wrP[1] - 0.12, wrP[2] + 0.06], [-s * 0.5, -0.6, 0.6], [0.12 * K, 0.11 * K], 0.1, 0.069);
  }

  return b.root;
}
```