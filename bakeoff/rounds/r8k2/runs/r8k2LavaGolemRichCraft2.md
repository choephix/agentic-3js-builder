1. **Rock-bodied torso, wider stance.** I removed the upper two rings and the 1.5 m bar. A tapered `frustumBox` upper chest (0.95→1.5 m wide, 0.55 m high) now sits over a lava slab, with three uneven tilted `plate()`s across the front and two side wedge plates. The stance is widened to ±0.53 m, with feet, toes and contacts updated, and the head is raised to `HY = 2.95` so the chin clears the chest.
2. **Sculpted face and readable mouth.** The head is now a bevelled, tapered `extrude` (0.7 m at the brow, 0.48 m at the jaw) with angled cheek plates and bevelled lips and brow ridge. Brows sit lower on the eyes. The lips are 0.46 m deep, so the 0.12 m fangs, rooted at `HZ + 0.39`, show in front of a recessed dark mouth fill. The red mouth line is replaced by a jagged orange lava strip.
3. **Stone fists.** The palm is 0.52 × 0.34 × 0.38 m. Each finger is two thick segments (r 0.075), curled in a loose fist with tips at y ≈ 0.72. The thumb lies across the inner front. Small glowing grooves sit between knuckles and the fingertip spikes are gone.
4. **Continuous armour.** Each shoulder is now one main pauldron plus one lowered, overlapping outer plate. The crystal collars are buried about 4 cm into that plate. The arm and leg blocks are extended so seams are 2–3 cm, with dark wedges bridging them and the elbows left open. The bronze bands are now basalt collars.
5. **Seam system.** The remaining three rings are split into unequal arcs per level, with staggered breaks and gaps of about 3 cm, over a smaller lava core. Chest, shoulder, scapula and forearm fissures are jagged two-layer extrusions with dark-red margins and orange centres. `CRACK` survives only as five small secondary cracks at varied scale and roll.
6. **Flame crown.** There are three tongues (0.41 m centre, 0.28 and 0.25 m flanks), offset and yawed differently, with roots about 0.18 m thick. The vent flames are 0.2–0.22 m and the shoulder crystals 0.18–0.22 m.
7. **Palette hierarchy.** The belt is 0.05 m tall and broken by rock blocks, the hanging diamond is about 25% smaller, and the warm bounce light on the rock is toned down. The gold is now only the medallion, belt and diamond.
8. **Quiet platform.** `FLOOR` is one faint ring plus radial fractures at half emission, and the lava channel is broken into three arcs at 0.55. The pools and crystal-topped spikes are removed, leaving 5 low rim stones and 5 tall spikes behind the legs. The embers are untouched.

```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, bezier, catmull, polyline } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

type Vec = [number, number, number];
type Kind = "box" | "ico" | "dode" | "oct" | "hex" | "cone";
type P2 = [number, number];

export const meta = {
  name: "Magma Basalt Golem",
  description:
    "A heavyweight cel-shaded lava golem: fractured basalt masses around a molten core, jagged seam fissures, stone fists, a pyro medallion, a three-tongue flame crown and a quiet lava-ringed platform.",
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
    c = mix(c, "#b0553c", 0.22 * smoothstep(0.1, -0.7, n.y) * smoothstep(1.4, 0.2, p.y)); // restrained lava bounce light
    return c;
  });
  const shade = paint((p, n) => mix(deep, "#7a2a1e", 0.3 * smoothstep(0.1, -0.7, n.y) * smoothstep(1.4, 0.2, p.y)));
  return cel(lit, shade);
}
const BASALT = rock("#30323f", "#4b5060", "#737b88", "#2a2c39", 3);
const BASALT_D = rock("#25273a", "#3a3e4f", "#5b6272", "#1c1e2c", 8);
const BASALT_P = rock("#3c4050", "#5a6272", "#8a93a2", "#32364a", 5);
const OBS = cel("#232433", "#14141f");
const GOLD = cel("#f3c552", "#b8702c");
const BRONZE = cel("#8c6a3e", "#4a3522");

// Jagged fissure centrelines (u across, v along), in meters
const FISS_A: P2[] = [[0.02, 0.22], [-0.03, 0.13], [0.04, 0.06], [-0.02, -0.02], [0.05, -0.1], [-0.01, -0.16], [0.02, -0.22]];
const FISS_B: P2[] = [[0, 0.13], [0.04, 0.06], [0, 0], [0.04, -0.06], [0.01, -0.13]];
const FISS_H: P2[] = [[-0.22, 0.01], [-0.12, 0.04], [-0.05, -0.02], [0.03, 0.04], [0.1, -0.01], [0.22, 0.02]];

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

  // Secondary crack sticker (few uses, varied scale and roll)
  const MAIN = "M34 2 L28 24 L38 40 L26 62 L36 80 L24 104 L30 126";
  const BRANCH = "M38 40 L52 48 L56 62 M26 62 L12 70 L8 88 M36 80 L50 92";
  const CRACK = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${MAIN}" stroke="#7a1608" stroke-width="9"/>
      <path d="${BRANCH}" stroke="#7a1608" stroke-width="6"/>
      <path d="${MAIN}" stroke="#ff6a1a" stroke-width="4.5"/>
      <path d="${BRANCH}" stroke="#ff7a1c" stroke-width="2.6"/>
      <circle cx="38" cy="40" r="2.6" fill="#ffe27a" stroke="none"/>
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

  // Platform floor: one faint ring and a few radial fractures
  let fracs = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.2;
    let d = "";
    for (let k = 0; k < 4; k++) {
      const r = 36 + k * 24;
      const j = Math.sin(i * 5 + k * 2.3) * 0.13;
      d += `${k ? "L" : "M"}${(128 + Math.sin(a + j) * r).toFixed(1)} ${(128 - Math.cos(a + j) * r).toFixed(1)}`;
    }
    fracs += `<path d="${d}"/>`;
  }
  const FLOOR = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="128" cy="128" r="112" stroke="#d24c14" stroke-width="4"/>
      <g stroke="#d24c14" stroke-width="3">${fracs}</g>
    </svg>`,
    { size: 512 },
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

  const plate = (bone: J, at: Vec, size: Vec, color: ColorInput, rot: Vec = [0, 0, 0], clip = 0.06, bev = 0.025) => {
    const [w, h, d] = size;
    const c = Math.min(clip, w * 0.3, h * 0.3);
    const hw = w / 2;
    const hh = h / 2;
    const outline: P2[] = [
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
  // Dark side wedge straddling a seam, offset sideways in x
  const wedge = (bone: J, a: Vec, c: Vec, t0: number, t1: number, off: number, w: number, d: number, color: ColorInput) => {
    const A = V(a);
    const C = V(c);
    const from = A.clone().lerp(C, t0);
    const to = A.clone().lerp(C, t1);
    return b.part(shape("box"), color, {
      bone,
      at: from.clone().lerp(to, 0.5).add(new THREE.Vector3(off, 0, 0)),
      dir: C.clone().sub(A),
      scale: [w, from.distanceTo(to), d],
      flat: true,
    });
  };
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
    const outline: P2[] = [
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

  // Crystal seated in a small collar; the collar is sunk into the rock below it.
  const crystal = (bone: J, base: Vec, dir: Vec, len: number, w: number, color = LAVA_HOT, str = 1.3) => {
    const d = V(dir).normalize();
    const cw = Math.max(0.13, w * 1.3);
    b.part(shape("hex"), BASALT_D, { bone, at: base, dir: d, scale: [cw, 0.1, cw], flat: true });
    const root = V(base).addScaledVector(d, -0.05);
    return glow(b.spike(arr(root), arr(d), len + 0.05, w / 2, { color, bone, sides: 6 }), str);
  };

  const sign = (bone: J, tex: THREE.Texture, at: Vec, dir: Vec, size: [number, number], str = 1, up?: Vec) =>
    glow(
      b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex }),
      str,
    );
  const crackOn = (
    bone: J,
    p: { at: THREE.Vector3; n: THREE.Vector3; d: THREE.Vector3; dp: number },
    size: [number, number],
    dx = 0,
    roll = 0,
  ) =>
    sign(
      bone,
      CRACK,
      arr(p.at.clone().addScaledVector(p.n, p.dp / 2 + 0.004).add(new THREE.Vector3(dx, 0, 0))),
      arr(p.n),
      size,
      1,
      arr(p.d.clone().negate().applyAxisAngle(p.n, roll * D2R)),
    );

  // Jagged fissure ribbon: tapered outline around a zigzag centreline
  const ribbon = (pts: P2[], w: number): P2[] => {
    const n = pts.length;
    const Lh: P2[] = [];
    const Rh: P2[] = [];
    for (let i = 1; i < n - 1; i++) {
      const tx = pts[i + 1][0] - pts[i - 1][0];
      const ty = pts[i + 1][1] - pts[i - 1][1];
      const l = Math.hypot(tx, ty) || 1;
      const k = w * (0.55 + 0.45 * Math.sin((Math.PI * i) / (n - 1)));
      const nx = (-ty / l) * k;
      const ny = (tx / l) * k;
      Lh.push([pts[i][0] + nx, pts[i][1] + ny]);
      Rh.push([pts[i][0] - nx, pts[i][1] - ny]);
    }
    return [pts[0], ...Rh, pts[n - 1], ...Lh.reverse()];
  };
  const scaleP = (pts: P2[], k: number, flip = 1, du = 0, dv = 0): P2[] => pts.map(([u, v]) => [u * k * flip + du, v * k + dv] as P2);
  // Shallow raised fissure on a face: dark-red margin, orange centre, one hot junction.
  const fissure = (bone: J, face: THREE.Vector3, n: THREE.Vector3, upV: THREE.Vector3, pts: P2[], w = 0.015) => {
    const nn = n.clone().normalize();
    const y = upV.clone().addScaledVector(nn, -upV.dot(nn)).normalize();
    const x = y.clone().cross(nn).normalize();
    const put = (outline: P2[], off: number, th: number, color: string) =>
      b.extrude(outline, { at: arr(face.clone().addScaledVector(nn, off)), x: arr(x), y: arr(y), thickness: th, color, bone });
    put(ribbon(pts, w * 1.9), 0.002, 0.008, CORE_RED);
    glow(put(ribbon(pts, w), 0.005, 0.01, LAVA), 1.1);
    const j = pts[Math.floor(pts.length / 2)];
    const at = face.clone().addScaledVector(x, j[0]).addScaledVector(y, j[1]).addScaledVector(nn, 0.014);
    glow(chunk(bone, "oct", arr(at), [0.04, 0.04, 0.04], HOT), 1.3);
  };

  const FLAME: P2[] = [
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
  // Flame volume: three nested tapering slabs with a thick root; inner layers poke out of both faces.
  const flameF = (bone: J, at: Vec, x: THREE.Vector3, y: THREE.Vector3, w: number, h: number, root = 0.18) => {
    const T = (yy: number) => root - (root - 0.025) * (yy / h);
    const layers: [number, number, string, number, number][] = [
      [1, 1, "#ff4a1a", 0, 1],
      [0.72, 0.78, "#ff8a1f", 1, 1.25],
      [0.42, 0.55, "#ffd54a", 2, 1.5],
    ];
    for (const [sw, sh, col, i, str] of layers) {
      glow(
        b.extrude(
          FLAME.map(([px, py]) => [px * w * sw, py * h * sh] as P2),
          { at, x: arr(x), y: arr(y), thickness: [T(0) + 0.012 * i, T(h * sh) + 0.012 * i], color: col, bone },
        ),
        str,
      );
    }
  };
  const flame = (bone: J, at: Vec, yawDeg: number, leanDeg: number, w: number, h: number, root = 0.18) => {
    const yaw = yawDeg * D2R;
    const a = leanDeg * D2R;
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const up = new THREE.Vector3(0, 1, 0);
    const x = r.clone().multiplyScalar(Math.cos(a)).addScaledVector(up, -Math.sin(a));
    const y = r.clone().multiplyScalar(Math.sin(a)).addScaledVector(up, Math.cos(a));
    flameF(bone, at, x, y, w, h, root);
  };

  // Partial lathe (arc between two angles, 0 = front, 90 = left)
  const arcPiece = (bone: J, profile: P2[], deg0: number, deg1: number, color: ColorInput, scale: Vec, at: Vec) => {
    const len = deg1 - deg0;
    const segs = Math.max(1, Math.ceil(len / 30));
    const geo = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segs, deg0 * D2R, len * D2R);
    return b.part(geo, color, { bone, at, scale, flat: true });
  };
  const arcs = (breaks: number[], gap: number): P2[] => {
    const bs = [...breaks].sort((a, c) => a - c);
    return bs.map((a, i) => [a + gap / 2, (i + 1 < bs.length ? bs[i + 1] : bs[0] + 360) - gap / 2] as P2);
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
  const HY = 2.95;
  const HZ = 0.16;
  const neck = b.joint("neck", { parent: chest, at: [0, 2.4, 0.06], aim: [0, 2.56, 0.14], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.56, 0.14], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.26, HZ - 0.02], dir: [0, -0.04, 1], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Platform (radius 1.30): basalt disc, one broken lava channel, faint sigil, a few low stones, tall spikes behind
  b.part(
    new THREE.LatheGeometry(
      [new THREE.Vector2(0, 0), new THREE.Vector2(1.3, 0), new THREE.Vector2(1.3, 0.07), new THREE.Vector2(1.24, 0.12), new THREE.Vector2(0, 0.12)],
      10,
    ),
    BASALT_D,
    { bone: root, at: [0, 0, 0], flat: true },
  );
  for (const [a0, a1] of [
    [20, 110],
    [140, 205],
    [245, 335],
  ]) {
    glow(
      arcPiece(
        root,
        [
          [1.12, 0],
          [1.19, 0],
          [1.19, 0.012],
          [1.12, 0.012],
        ],
        a0,
        a1,
        LAVA,
        [1, 1, 1],
        [0, 0.121, 0],
      ),
      0.55,
    );
  }
  sign(root, FLOOR, [0, 0.124, 0], [0, 1, 0], [2.2, 2.2], 0.5, [0, 0, -1]);

  const polar = (ang: number, r: number): [number, number] => [Math.sin(ang) * r, Math.cos(ang) * r];
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.4 + R() * 0.2;
    const [x, z] = polar(ang, 1.27);
    const front = Math.cos(ang) > 0.3 ? 0.5 : 1;
    const h = (0.09 + R() * 0.08) * front;
    chunk(
      root,
      i % 2 ? "dode" : "ico",
      [x, Y0 + h * 0.3, z],
      [0.22 + R() * 0.1, h, 0.22 + R() * 0.1],
      i % 3 ? BASALT : BASALT_P,
      [R() * 40, R() * 360, R() * 30],
    );
  }
  for (let i = 0; i < 5; i++) {
    const ang = Math.PI * (0.6 + (i / 4) * 0.8) + R() * 0.12; // behind the golem
    const [x, z] = polar(ang, 1.05 + R() * 0.1);
    const len = 0.28 + R() * 0.14;
    b.spike([x, Y0, z], [x * 0.2, 1, z * 0.2], len, 0.08, { color: OBS, bone: root, sides: 5 });
  }
  for (let i = 0; i < 9; i++) {
    const ang = R() * Math.PI * 2;
    const [x, z] = polar(ang, 1.15 + R() * 0.35);
    const e = 0.025 + R() * 0.025;
    glow(chunk(root, "oct", [x, 0.5 + R() * 2.3, z], [e, e * 1.8, e], i % 3 ? LAVA_HOT : HOT, [R() * 60, R() * 90, R() * 60]), 1.4);
  }
  chunk(root, "oct", [1.4, 1.1, -0.5], [0.09, 0.2, 0.09], BASALT_P, [20, 40, 10]);
  glow(chunk(root, "oct", [-1.45, 1.5, -0.3], [0.08, 0.18, 0.08], LAVA, [10, 70, 30]), 1.3);
  chunk(root, "oct", [-0.3, 1.2, -1.35], [0.09, 0.2, 0.09], BASALT, [30, 10, 20]);

  // -------------------------------------------------------------------------------------------------------------
  // Torso: lava core, three levels of staggered unequal basalt arcs, then a tapering upper-chest mass
  const colR = (y: number) => 0.305 + 0.13 * (y - 1.46);
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
  colPiece(spine2, 1.72, 2.02, LAVA);

  const levels: [number, number, number, number[]][] = [
    [1.48, 0.15, 0.34, [25, 140, 255]],
    [1.66, 0.13, 0.38, [75, 190, 305]],
    [1.83, 0.15, 0.44, [40, 125, 210, 300]],
  ];
  levels.forEach(([y0, h, rad, breaks], i) => {
    const y1 = y0 + h;
    const profile: P2[] = [
      [0, y0],
      [rad - 0.02, y0],
      [rad, y0 + 0.03],
      [rad, y1 - 0.03],
      [rad - 0.03, y1],
      [0, y1],
    ];
    const bone = y0 < 1.6 ? spine1 : spine2;
    arcs(breaks, 4).forEach(([a0, a1], k) => {
      arcPiece(bone, profile, a0, a1, (i + k) % 2 ? BASALT : BASALT_P, [1.3, 1, 0.88], [0, 0, 0.03]);
    });
  });

  // Pelvis, thin belt interrupted by rock, hanging plates
  chunk(hips, "box", [0, 1.3, 0], [1.2, 0.32, 0.7], BASALT_D);
  chunk(hips, "box", [0, 1.465, 0], [1.28, 0.05, 0.78], BRONZE);
  for (const x of [-0.52, -0.3, 0.32, 0.54]) chunk(hips, "box", [x, 1.465, 0.4], [0.17, 0.09, 0.1], BASALT_D, [0, 0, x > 0 ? 6 : -6]);
  chunk(hips, "box", [0, 1.42, 0.4], [0.165, 0.165, 0.05], GOLD, [0, 0, 45]);
  sign(hips, RUNE, [0, 1.42, 0.428], [0, 0, 1], [0.11, 0.11], 1.1);
  plate(hips, [0, 1.15, 0.38], [0.28, 0.42, 0.08], BASALT, [0, 0, 0], 0.05, 0.02);
  for (const s of [1, -1]) {
    plate(hips, [s * 0.4, 1.2, 0.38], [0.24, 0.34, 0.08], BASALT_P, [0, 0, s * 8], 0.05, 0.02);
    chunk(hips, "box", [s * 0.62, 1.28, 0], [0.08, 0.3, 0.5], BASALT_P);
  }
  plate(hips, [0, 1.18, -0.4], [0.6, 0.4, 0.08], BASALT, [0, 180, 0], 0.07, 0.02);

  // Medallion: gilt hex, ring, glowing pyro emblem (the one big gold accent)
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 6), GOLD, { bone: spine2, at: [0, 1.86, 0.4], dir: [0, 0, 1], flat: true });
  b.part(new THREE.TorusGeometry(0.17, 0.022, 5, 12), GOLD, { bone: spine2, at: [0, 1.86, 0.435], flat: true });
  sign(spine2, EMBLEM, [0, 1.86, 0.44], [0, 0, 1], [0.31, 0.31], 1.2);

  // Upper chest: tapering mass 0.95 → 1.5 wide, 0.55 high, 0.64 → 0.92 deep
  b.frustumBox([0, 2.0, 0.05], [0, 2.55, 0.05], [0.95, 0.64], [1.5, 0.92], { color: BASALT, bone: chest });
  // lava layer in front of the mass, showing through the gaps between plates
  glowBox(chest, [0, 2.29, 0.42], [1.1, 0.54, 0.1], LAVA, 1);
  // three broad, uneven front plates leaning with the mass
  const T14 = 14 * D2R;
  const cn = new THREE.Vector3(0, -Math.sin(T14), Math.cos(T14));
  const cup = new THREE.Vector3(0, Math.cos(T14), Math.sin(T14));
  const cC: Vec = [0.03, 2.32, 0.47];
  plate(chest, cC, [0.56, 0.5, 0.14], BASALT, [14, 0, 0], 0.09, 0.035);
  plate(chest, [0.53, 2.31, 0.4], [0.42, 0.44, 0.14], BASALT_P, [14, 14, 0], 0.07, 0.03);
  plate(chest, [-0.52, 2.26, 0.4], [0.44, 0.38, 0.14], BASALT_D, [14, -14, 0], 0.08, 0.03);
  fissure(chest, V(cC).addScaledVector(cn, 0.07), cn, cup, FISS_A);
  fissure(chest, V(cC).addScaledVector(cn, 0.07), cn, cup, scaleP(FISS_B, 0.9, -1, -0.12, -0.12), 0.011);
  // side wedges wrapping toward the scapular plates
  for (const s of [1, -1]) plate(chest, [s * 0.66, 2.28, 0.0], [0.6, 0.4, 0.12], BASALT_P, [0, s * 90, 0], 0.07, 0.025);

  // Back shell: dark-red core, two angled scapular plates with fissures, lower-back plate, dorsal stones
  glowBox(chest, [0, 2.08, -0.35], [0.9, 0.76, 0.1], CORE_RED, 0.7);
  for (const s of [1, -1]) {
    const c: Vec = [s * 0.28, 2.12, -0.46];
    const yaw = -s * 14;
    plate(chest, c, [0.52, 0.6, 0.2], BASALT, [0, yaw, 0], 0.1, 0.03);
    const th = yaw * D2R;
    const nB = new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th));
    fissure(chest, V(c).addScaledVector(nB, 0.1), nB, new THREE.Vector3(0, 1, 0), scaleP(FISS_A, s > 0 ? 0.85 : 0.65, s, s * 0.02, 0.02));
  }
  plate(spine2, [0, 1.62, -0.31], [0.56, 0.32, 0.16], BASALT_D, [0, 180, 0], 0.07, 0.025);
  sign(spine2, CRACK, [0.05, 1.62, -0.394], [0, 0, -1], [0.2, 0.1], 1, [0.7, 0.7, 0]);
  const dorsal: Vec[] = [
    [2.34, 0.2, -0.6],
    [2.16, 0.19, -0.6],
    [1.98, 0.18, -0.6],
    [1.8, 0.17, -0.55],
    [1.62, 0.16, -0.46],
  ];
  dorsal.forEach(([y, sz, z], i) => {
    chunk(y > 1.95 ? chest : y > 1.7 ? spine2 : spine1, "dode", [0, y, z], [sz * 0.9, sz, 0.2], i % 2 ? BASALT_P : BASALT, [R() * 20, R() * 60, R() * 20]);
  });

  // Back vents with short secondary flames
  const ventA = new THREE.Vector3(0, Math.cos(20 * D2R), -Math.sin(20 * D2R));
  for (const s of [1, -1]) {
    const C = new THREE.Vector3(s * 0.3, 2.54, -0.5);
    const T = C.clone().addScaledVector(ventA, 0.15);
    chunk(chest, "hex", [s * 0.3, 2.45, -0.46], [0.3, 0.08, 0.3], BASALT_D);
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
    flame(chest, base, 90, 20, 0.16, 0.22, 0.12);
    flameF(chest, base, new THREE.Vector3(1, 0, 0), ventA.clone(), 0.14, 0.2, 0.1);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: tapered bevelled face (0.7 → 0.48), angled cheeks, deep muzzle, readable fangs, three-tongue crown
  const FACE: P2[] = [
    [-0.35, 0.17],
    [-0.35, -0.02],
    [-0.24, -0.25],
    [0.24, -0.25],
    [0.35, -0.02],
    [0.35, 0.17],
    [0.3, 0.25],
    [-0.3, 0.25],
  ];
  b.extrude(FACE, { at: [0, HY, HZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.54, bevel: 0.04, color: BASALT, bone: head });
  plate(head, [0, HY + 0.29, HZ - 0.02], [0.56, 0.1, 0.5], BASALT_D, [0, 0, 0], 0.03, 0.03);
  chunk(head, "box", [0, HY - 0.02, HZ + 0.28], [0.08, 0.22, 0.08], BASALT_P);
  chunk(neck, "hex", [0, 2.62, 0.1], [0.5, 0.4, 0.46], BASALT_D);
  glowBox(neck, [0, 2.5, 0.1], [0.56, 0.04, 0.5], LAVA, 1);

  // Muzzle: deep upper lip, corner posts, dark recess, lower lip and chin on the jaw
  plate(head, [0, HY - 0.17, HZ + 0.17], [0.56, 0.12, 0.46], BASALT_D, [0, 0, 0], 0.04, 0.035);
  for (const s of [1, -1]) chunk(head, "box", [s * 0.235, HY - 0.28, HZ + 0.17], [0.08, 0.1, 0.46], BASALT_D);
  chunk(head, "box", [0, HY - 0.28, HZ + 0.27], [0.42, 0.1, 0.1], "#0d0810");
  plate(jaw, [0, HY - 0.37, HZ + 0.17], [0.5, 0.08, 0.46], BASALT_D, [0, 0, 0], 0.03, 0.025);
  plate(jaw, [0, HY - 0.44, HZ + 0.12], [0.44, 0.08, 0.38], BASALT, [0, 0, 0], 0.03, 0.025);
  // irregular orange lower edge of the mouth
  const LIP: P2[] = [
    [-0.19, -0.05],
    [0.19, -0.05],
    [0.2, 0.0],
    [0.12, 0.05],
    [0.09, 0.02],
    [0.03, 0.07],
    [-0.02, 0.03],
    [-0.08, 0.06],
    [-0.13, 0.01],
    [-0.2, 0.04],
  ];
  glow(b.extrude(LIP, { at: [0, HY - 0.328, HZ + 0.28], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: LAVA, bone: jaw }), 1.2);

  for (const s of [1, -1]) {
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.17, HY + 0.03, HZ + 0.274], [0, 0, 1], [0.24, 0.12], 1.4);
    // brows hug the upper edges of the eyes
    chunk(head, "box", [s * 0.19, HY + 0.14, HZ + 0.29], [0.34, 0.07, 0.12], OBS, [0, 0, s * 14]);
    // cheeks angled inward toward the chin
    plate(head, [s * 0.36, HY - 0.07, HZ + 0.08], [0.2, 0.3, 0.14], BASALT_P, [0, s * 22, s * -12], 0.05, 0.03);
    b.spike([s * 0.4, HY - 0.04, HZ + 0.05], [s, 0.2, -0.25], 0.2, 0.06, { color: OBS, bone: head, sides: 5 });
    // horns with a basalt collar
    chunk(head, "hex", [s * 0.3, HY + 0.17, HZ - 0.02], [0.2, 0.14, 0.2], BASALT_D);
    const horn = bezier(
      [s * 0.3, HY + 0.16, HZ - 0.02],
      [s * 0.58, HY + 0.22, HZ - 0.04],
      [s * 0.62, HY + 0.62, HZ - 0.2],
    );
    const hr = (t: number) => 0.09 * (1 - t) + 0.008;
    b.sweep(horn, hr, { bone: head, color: OBS, from: 0, to: 0.62, caps: { start: "flat", end: "flat" } });
    glow(b.sweep(horn, hr, { bone: head, color: LAVA_HOT, from: 0.62, to: 1, caps: { start: "flat", end: "point" } }), 1.3);
    // two short upper corner fangs on the lip's front face
    b.spike([s * 0.2, HY - 0.2, HZ + 0.39], [0, -1, 0.05], 0.13, 0.04, { color: TOOTH, bone: head, sides: 5 });
  }

  // Flame crown: three principal tongues, offset and differently yawed, thick roots
  const HB = HY + 0.34;
  flame(head, [0, HB, HZ - 0.05], 8, 0, 0.3, 0.41, 0.18);
  flame(head, [0.21, HB, HZ + 0.03], 35, 16, 0.24, 0.28, 0.16);
  flame(head, [-0.21, HB, HZ - 0.05], -35, -16, 0.22, 0.25, 0.16);

  // -------------------------------------------------------------------------------------------------------------
  // Legs and arms, both sides
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Leg (wide stance)
    const hipP: Vec = [s * 0.4, 1.3, 0];
    const kneeP: Vec = [s * 0.53, 0.8, 0.1];
    const ankP: Vec = [s * 0.53, 0.34, 0];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.53, Y0, 0.1],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    glow(b.rod(hipP, kneeP, 0.13, LAVA, { bone: hipJ, section: { ngon: 6 } }), 1);
    glow(b.rod(kneeP, ankP, 0.12, LAVA, { bone: kneeJ, section: { ngon: 6 } }), 1);
    orb(hipJ, hipP, 0.16, LAVA_HOT);
    seg(hipJ, hipP, kneeP, 0.03, 0.5, 0.5, 0.5, BASALT);
    seg(hipJ, hipP, kneeP, 0.54, 0.98, 0.48, 0.48, BASALT_D);
    for (const o of [-0.25, 0.25]) wedge(hipJ, hipP, kneeP, 0.44, 0.6, o, 0.12, 0.3, BASALT_D);
    orb(kneeJ, kneeP, 0.15, LAVA_HOT);
    plate(kneeJ, [kneeP[0], kneeP[1] + 0.02, kneeP[2] + 0.24], [0.36, 0.3, 0.16], BASALT_P, [0, 0, 0], 0.07, 0.03);
    const shinA = segPlate(kneeJ, kneeP, ankP, 0.1, 0.52, 0.46, 0.44, BASALT);
    segPlate(kneeJ, kneeP, ankP, 0.55, 0.98, 0.52, 0.46, BASALT_D);
    for (const o of [-0.25, 0.25]) wedge(kneeJ, kneeP, ankP, 0.47, 0.6, o, 0.12, 0.3, BASALT_D);
    crackOn(kneeJ, shinA, s > 0 ? [0.09, 0.18] : [0.14, 0.28], 0, s > 0 ? 20 : -30);
    // Foot
    plate(ankleJ, [s * 0.53, 0.22, 0.12], [0.6, 0.2, 0.62], BASALT_D, [0, 0, 0], 0.06, 0.03);
    chunk(ankleJ, "box", [s * 0.53, 0.27, -0.14], [0.52, 0.28, 0.22], BASALT);
    [-0.2, 0, 0.2].forEach((dx, i) => {
      const x = s * 0.53 + dx;
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
    // one main pauldron + one overlapping, lowered outer plate
    chunk(shJ, "ico", [s * 0.95, 2.44, 0], [0.68, 0.46, 0.62], BASALT, [0, 0, s * -10]);
    plate(shJ, [s * 1.02, 2.6, 0], [0.5, 0.14, 0.46], BASALT_P, [0, 0, s * -14], 0.05, 0.03);
    fissure(
      shJ,
      new THREE.Vector3(s * 1.02, 2.6, 0.23),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(s * Math.sin(14 * D2R), Math.cos(14 * D2R), 0),
      scaleP(FISS_H, 0.9, s),
      0.011,
    );
    chunk(shJ, "hex", [s * 0.95, 2.23, 0], [0.62, 0.1, 0.62], BASALT_D);
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.6;
      b.spike([s * 1.08, 2.46, Math.sin(a) * 0.2], [s * 1, 0.5, Math.sin(a)], 0.3 - Math.abs(k - 1) * 0.04, 0.09, {
        color: OBS,
        bone: shJ,
        sides: 5,
      });
    }
    // crystal collars sunk ~4 cm into the outer plate
    crystal(shJ, [s * 0.92, 2.63, -0.12], [s * 0.25, 1, -0.35], 0.22, 0.1);
    crystal(shJ, [s * 1.04, 2.62, 0], [s * 0.5, 1, -0.1], 0.19, 0.09, HOT);
    crystal(shJ, [s * 0.86, 2.64, 0.1], [s * 0.1, 1, 0.3], 0.18, 0.08);

    glow(b.rod(shP, elP, 0.12, LAVA, { bone: shJ, section: { ngon: 6 } }), 1);
    seg(shJ, shP, elP, 0.02, 0.5, 0.46, 0.46, BASALT_D);
    seg(shJ, shP, elP, 0.535, 0.88, 0.48, 0.48, BASALT);
    for (const o of [-0.22, 0.22]) wedge(shJ, shP, elP, 0.44, 0.6, o, 0.12, 0.3, BASALT_D);
    orb(elJ, elP, 0.17, LAVA_HOT, 1.2);
    chunk(elJ, "hex", elP, [0.34, 0.07, 0.34], BASALT_D);
    b.spike([elP[0] + s * 0.08, elP[1] + 0.02, elP[2] - 0.1], [s * 0.4, -0.1, -1], 0.24, 0.08, { color: OBS, bone: elJ, sides: 5 });
    glow(b.rod(elP, wrP, 0.12, LAVA, { bone: elJ, section: { ngon: 6 } }), 1);
    const fa1 = segPlate(elJ, elP, wrP, 0.12, 0.47, 0.5, 0.44, BASALT_D);
    const fa2 = segPlate(elJ, elP, wrP, 0.5, 0.88, 0.58, 0.5, BASALT);
    for (const o of [-0.27, 0.27]) wedge(elJ, elP, wrP, 0.4, 0.58, o, 0.12, 0.34, BASALT_D);
    crackOn(elJ, fa1, [0.08, 0.16], 0.05, s > 0 ? 35 : -25);
    fissure(
      elJ,
      fa2.at.clone().addScaledVector(fa2.n, fa2.dp / 2),
      fa2.n,
      fa2.d,
      scaleP(FISS_A, 0.8, s, s * 0.04, 0),
      0.014,
    );
    seg(elJ, elP, wrP, 0.9, 1.0, 0.46, 0.46, BASALT_D, "hex");

    // Fist: massive palm, two thick curled segments per finger, thumb across the inner front
    const wx = wrP[0];
    const wz = wrP[2];
    chunk(wrJ, "box", [wx, 0.88, wz], [0.52, 0.34, 0.38], BASALT_P);
    chunk(wrJ, "ico", [wx, 0.86, wz - 0.12], [0.46, 0.3, 0.26], BASALT_D);
    const fist = (name: string, pts: Vec[], rad: number, tone: number) => {
      const ch = b.chain(name, polyline(pts), { parent: wrJ, names: pts.map((_, i) => `${name}${i + 1}`), role: "digit" });
      for (let j = 0; j < pts.length - 1; j++) {
        b.capsule(pts[j], pts[j + 1], rad, (j + tone) % 2 ? BASALT : BASALT_D, { section: { ngon: 6 }, bone: ch.joints[j] });
        chunk(ch.joints[j], "ico", pts[j], [rad * 2.3, rad * 2.1, rad * 2.3], BASALT_P);
      }
    };
    [-0.19, -0.065, 0.065, 0.19].forEach((xo, i) => {
      const x = wx + xo;
      const K: Vec = [x, 0.98, wz + 0.17];
      const P1: Vec = [x, 0.91, wz + 0.28 + (i % 2) * 0.01];
      const P2v: Vec = [x, 0.72, wz + 0.25];
      fist(`finger${S}${i + 1}`, [K, P1, P2v], 0.075, i);
    });
    // lava gaps between knuckles
    for (const gx of [-0.1275, 0, 0.1275]) glowBox(wrJ, [wx + gx, 0.84, wz + 0.32], [0.016, 0.12, 0.03], LAVA, 1.1);
    fist(`thumb${S}`, [[wx - s * 0.23, 1.0, wz + 0.18], [wx - s * 0.12, 0.98, wz + 0.34], [wx + s * 0.0, 0.94, wz + 0.35]], 0.07, 1);
  }

  return b.root;
}
```