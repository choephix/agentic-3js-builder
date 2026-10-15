import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  grain,
  limb,
  mix,
  mottle,
  noise,
  offset,
  paint,
  polyline,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hunched Darkspear-style swamp troll with curved tusks, a magenta mohawk and bone fetishes, standing on a mossy islet with a rune staff, tiki torches and glowing fungi.",
};

// ---------------------------------------------------------------------------------------------------------------
// Scale constants and layout
const H = 1.25; // head scale
const HAND = 1.4; // hand scale
type V = [number, number, number];
const HC: V = [0, 1.89, 0.55]; // skull centre
/** Head-unit point (x right-left, y up, z forward) scaled by H around the skull centre. */
const hp = (x: number, y: number, z: number): V => [x * H, HC[1] + y * H, HC[2] + z * H];
const pos = (q: any): THREE.Vector3 => (q && q.at ? q.at : q);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function lit(t: any, k = 1) {
  try {
    glow(t, k);
  } catch {
    /* material cannot glow: leave it lit normally */
  }
  return t;
}

// ---------------------------------------------------------------------------------------------------------------
// Colours and paints
const MOSS = "#5f8f3a";
const SKIN_BASE = countershade(
  mottle("#3f8f9a", "#2b6272", { size: 0.14, seed: 3, contrast: 1.2 }),
  "#86bfae",
  { level: -0.3, soft: 0.4 },
);
const SKIN = paint((p, n) => {
  let c = SKIN_BASE.at(p, n);
  c = mix(c, "#34402a", smoothstep(0.22, 0.03, p.y) * 0.8);
  const m = n.y > 0.5 && p.y > 1.2 ? smoothstep(0.58, 0.7, noise(p, 0.08, 5)) : 0;
  return mix(c, MOSS, m * 0.8);
});
const BONE = grain("#efe4c8", "#cbb68c", { size: 0.01, axis: "y", seed: 2 });
const TUSK = grain("#f4e4a8", "#c8a45c", { size: 0.008, axis: "y", seed: 6 });
const LEATHER = grain("#6a4426", "#4a2e18", { size: 0.01, axis: "x", seed: 5 });
const WOOD = grain("#6e4e2c", "#3e2a16", { size: 0.012, axis: "y", seed: 7 });
const CORD = "#b0302a";
const DARK = "#16120c";
const STONE_BASE = mottle("#5d6358", "#3f463e", { size: 0.2, seed: 9 });
const MOSSY = mottle("#5f9a3a", "#3d6a2a", { size: 0.1, seed: 12 });
const STONE = paint((p, n) => (n.y > 0.35 && noise(p, 0.1, 11) > 0.45 ? MOSSY : STONE_BASE));
const GROUND = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  let c = mix("#4a3a24", "#2f3b22", smoothstep(0.2, 0.9, noise(p, 0.25, 15)));
  if (n.y > 0.5) c = mix(c, "#4f7a34", 0.6 * smoothstep(0.45, 0.7, noise(p, 0.18, 16)));
  return mix(c, "#2a4a40", smoothstep(0.95, 1.15, r) * 0.6);
});
const BARK = paint((p, n) => {
  const g = grain("#5a4630", "#3a2c1c", { size: 0.015, axis: "y", seed: 21 }).at(p, n);
  return n.y > 0.6 ? mix(g, MOSS, 0.7) : g;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 80 48" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="a"><path d="M3 12 L77 30 Q58 47 36 44 Q10 40 3 12Z"/></clipPath></defs>
  <path d="M3 12 L77 30 Q58 47 36 44 Q10 40 3 12Z" fill="#120d08"/>
  <g clip-path="url(#a)"><rect width="80" height="48" fill="#ffb81c"/><ellipse cx="44" cy="36" rx="22" ry="14" fill="#fff06a"/><rect width="80" height="17" fill="#e07a10"/></g>
  <ellipse cx="44" cy="30" rx="4" ry="12" fill="#120d08"/>
  <circle cx="38" cy="26" r="3" fill="#ffffff"/>
  <path d="M0 10 L80 30" stroke="#120d08" stroke-width="6" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round">
  <path d="M12 10 L40 26 M10 28 L44 44 M14 46 L40 58" stroke="#7a1410" stroke-width="12"/>
  <path d="M12 10 L40 26 M10 28 L44 44 M14 46 L40 58" stroke="#f4eddc" stroke-width="6"/></g></svg>`,
  { size: 192 },
);
const TATTOO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50 50 m-3 0 a3 3 0 0 1 6 0 a8 8 0 0 1 -16 0 a14 14 0 0 1 28 0 a20 20 0 0 1 -40 0 a26 26 0 0 1 52 0" stroke="#4a0c0a" stroke-width="9"/>
  <path d="M50 50 m-3 0 a3 3 0 0 1 6 0 a8 8 0 0 1 -16 0 a14 14 0 0 1 28 0 a20 20 0 0 1 -40 0 a26 26 0 0 1 52 0" stroke="#f2ead8" stroke-width="5"/>
  <path d="M6 12 L24 22 M94 12 L76 22 M6 88 L24 78 M94 88 L76 78" stroke="#b3261e" stroke-width="7"/></g></svg>`,
  { size: 256 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e03a2c"/><stop offset="0.6" stop-color="#e8a02a"/><stop offset="1" stop-color="#1f8f86"/></linearGradient></defs>
  <path d="M16 95 C1 74 0 36 16 2 C32 36 31 74 16 95Z" fill="url(#g)" stroke="#2a1410" stroke-width="2"/>
  <path d="M16 94 L16 6" stroke="#f4e8c8" stroke-width="2.5"/>
  <path d="M16 30 L6 44 M16 44 L5 58 M16 58 L7 72 M16 30 L26 44 M16 44 L27 58 M16 58 L25 72" stroke="#2a1410" stroke-width="1.5" opacity="0.5" fill="none"/></svg>`,
  { size: 192 },
);
const CLOTH = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2 H58 V56 L30 78 L2 56Z" fill="#7a3a2a" stroke="#2a1410" stroke-width="2"/>
  <path d="M2 6 L8 15 L14 6 L20 15 L26 6 L32 15 L38 6 L44 15 L50 6 L56 15" stroke="#e8b83a" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <path d="M5 52 L30 72 L55 52" stroke="#e8b83a" stroke-width="2.5" fill="none"/>
  <circle cx="30" cy="34" r="11" fill="#efe3c6" stroke="#2a1410" stroke-width="1.5"/>
  <rect x="23" y="42" width="14" height="8" rx="2" fill="#efe3c6" stroke="#2a1410" stroke-width="1.5"/>
  <circle cx="25.5" cy="34" r="3.2" fill="#2a1410"/><circle cx="34.5" cy="34" r="3.2" fill="#2a1410"/>
  <path d="M30 38 L28.5 41 H31.5Z" fill="#2a1410"/><path d="M26 46 V50 M30 46 V50 M34 46 V50" stroke="#2a1410" stroke-width="1.2"/></svg>`,
  { size: 256 },
);
const RUNE = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g stroke="#7dff8a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
  <path d="M20 4 V36 M8 12 L20 22 L32 12 M10 30 L20 22 L30 30"/></g></svg>`,
  { size: 128 },
);
const FLAME = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f4ff7a"/><stop offset="0.5" stop-color="#7dff5a"/><stop offset="1" stop-color="#1fb86a"/></linearGradient></defs>
  <path d="M20 78 C2 66 4 44 14 32 C14 44 20 44 20 34 C22 20 26 12 22 2 C36 18 40 46 36 60 C34 72 28 78 20 78Z" fill="url(#f)"/></svg>`,
  { size: 128 },
);
const REED_A = svg(
  `<svg viewBox="0 0 24 128" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 127 C8 80 8 40 12 2 C17 40 17 80 18 127Z" fill="#4f7a2c"/>
  <path d="M12.5 126 C12.5 80 12 40 12 8" stroke="#86b44c" stroke-width="2" fill="none"/></svg>`,
  { size: 192 },
);
const REED_B = svg(
  `<svg viewBox="0 0 24 128" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 127 L12 18" stroke="#5b7f35" stroke-width="3.5"/>
  <ellipse cx="12" cy="32" rx="5.5" ry="19" fill="#5a3a1e" stroke="#2e1c0e" stroke-width="1.5"/>
  <path d="M12 14 L12 2" stroke="#8a7a3a" stroke-width="2.5"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "swamp_troll" });
  const R = rng(7);

  // =============================================================================================================
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.05], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.05],
      [0, 1.3, 0.06],
      [0, 1.58, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.66, 0.26],
      [0, 1.73, 0.36],
      [0, 1.8, 0.46],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.8, 0.46], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.07, 0.0), aim: hp(0, -0.1, 0.2), role: "jaw" });
  const stage = b.joint("stage", { parent: hips, at: [0, 0.03, 0] });

  const put = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) =>
    b.part(geo, color, { at, flat: true, ...o });

  // =============================================================================================================
  // Torso, neck, hump
  const torso = b.loft(
    [
      { at: [0, 0.92, -0.08], w: 0.5, h: 0.36 },
      { at: [0, 1.12, -0.04], w: 0.6, h: 0.52 },
      { at: [0, 1.38, 0.08], w: 0.76, h: 0.56 },
      { at: [0, 1.6, 0.22], w: 1.0, h: 0.56 },
      { at: [0, 1.74, 0.32], w: 0.64, h: 0.42 },
    ],
    { bone: [hips, spine], color: SKIN },
  );
  const neckTube = b.sweep(neck, [0.125, 0.108, 0.1], { color: SKIN });
  put(new THREE.SphereGeometry(1, 9, 7), SKIN, [0, 1.72, 0.0], {
    bone: spine,
    scale: [0.34, 0.24, 0.3],
  });
  const torsoS = b.surface(torso);

  // warts
  for (const hit of torsoS.scatter(12, { rng: rng(11), minDist: 0.14, filter: (h: any) => h.n.y > -0.2 }))
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), "#6b9a74", hit, { embed: 0.45 });

  // chest-belly war paint
  const tat = torsoS.around([0, 1.22, 0.1]).at(0, 5);
  if (tat) b.decal(torsoS, TATTOO, { at: tat.at, dir: [0, 0.25, 1], size: [0.34, 0.34] });

  // =============================================================================================================
  // Head
  const skull = put(new THREE.SphereGeometry(1, 12, 8), SKIN, HC, {
    bone: head,
    scale: [0.135 * H, 0.12 * H, 0.14 * H],
  });
  const skullS = b.surface(skull);

  // muzzle, cheeks, nose
  b.frustumBox(hp(0, -0.035, 0.08), hp(0, -0.055, 0.2), [0.17 * H, 0.1 * H], [0.13 * H, 0.075 * H], {
    color: SKIN,
    bone: head,
  });
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.045 * H, 7, 5), SKIN, hp(s * 0.08, -0.045, 0.08), { bone: head });
  }
  b.sweep(
    catmull([hp(0, 0.01, 0.17), hp(0, 0.025, 0.24), hp(0, -0.01, 0.285), hp(0, -0.055, 0.275)]),
    [0.044, 0.03],
    { color: SKIN, bone: head, sides: 7 },
  );
  for (const s of [1, -1])
    put(new THREE.SphereGeometry(0.009, 5, 4), DARK, hp(s * 0.016, -0.06, 0.262), { bone: head });
  // nose ring
  put(new THREE.TorusGeometry(0.02, 0.005, 4, 8), "#d6a23a", hp(0, -0.075, 0.268), {
    bone: head,
    rotation: [90, 0, 0],
  });

  // brow ridges
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.15 * H, 0.05 * H, 0.085 * H), SKIN, hp(s * 0.075, 0.052, 0.115), {
      bone: head,
      rotation: [0, 0, s * 18],
    });
  }

  // jaws: dark mouth, lower jaw, teeth
  put(new THREE.BoxGeometry(0.15 * H, 0.025 * H, 0.15 * H), "#2a0e12", hp(0, -0.092, 0.115), { bone: head });
  b.frustumBox(hp(0, -0.12, 0.03), hp(0, -0.125, 0.205), [0.2 * H, 0.075 * H], [0.18 * H, 0.06 * H], {
    color: SKIN,
    bone: jaw,
  });
  put(new THREE.SphereGeometry(0.03 * H, 6, 4), SKIN, hp(0, -0.125, 0.215), { bone: jaw, scale: [1.5, 0.9, 0.9] });
  for (let i = -2; i <= 2; i++)
    put(new THREE.ConeGeometry(0.011 * H, 0.03 * H, 4), BONE, hp(i * 0.028, -0.09, 0.17 - Math.abs(i) * 0.012), {
      bone: jaw,
    });
  for (const s of [1, -1])
    put(new THREE.ConeGeometry(0.012 * H, 0.04 * H, 4), BONE, hp(s * 0.042, -0.092, 0.19), {
      bone: head,
      rotation: [180, 0, 0],
    });

  // tusks
  for (const s of [1, -1]) {
    const tuskPath = bezier(hp(s * 0.075, -0.11, 0.17), hp(s * 0.115, -0.07, 0.27), hp(s * 0.088, 0.035, 0.29));
    b.sweep(tuskPath, [0.036, 0.004], { color: TUSK, bone: jaw, caps: { start: "flat", end: "point" }, sides: 7 });
    b.along(tuskPath, 3, (at: any) => {
      const r = 0.036 * (1 - (at.t ?? 0.5)) + 0.008;
      b.part(new THREE.TorusGeometry(r, 0.006, 4, 8), TUSK, { at, dir: at, axis: "z", bone: jaw });
    });
    b.part(new THREE.TorusGeometry(0.04, 0.008, 4, 8), CORD, {
      at: pos(tuskPath.at(0.04)),
      dir: tuskPath.tangentAt(0.04),
      axis: "z",
      bone: jaw,
    });
  }

  // eyes (glowing) and cheek war paint
  for (const s of [1, -1]) {
    const e = skullS.around(skull.at).at(s * 28, 6);
    if (e) {
      const d = b.decal(skullS, EYE, { at: e.at, dir: [s * 0.35, 0, 1], size: [0.085, 0.052], mirror: s > 0 });
      lit(d, 1.3);
    }
    const c = skullS.around(skull.at).at(s * 64, -10);
    if (c) b.decal(skullS, CHEEK, { at: c.at, dir: [s * 0.85, 0, 0.5], size: [0.1, 0.1], mirror: s > 0 });
  }

  // ears with bone rings
  for (const s of [1, -1]) {
    const ear = b.extrude(
      [
        [0, -0.05],
        [0.1, -0.035],
        [0.27, 0.075, "sharp"],
        [0.11, 0.095],
        [0, 0.06],
      ],
      {
        at: hp(s * 0.12, 0.04, -0.01),
        x: [s * 0.75, 0.25, -0.6],
        y: [0, 0.92, 0.38],
        thickness: 0.02,
        bevel: 0.004,
        color: SKIN,
        bone: head,
      },
    );
    for (const k of [0.13, 0.19])
      b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), BONE, {
        at: ear.local([k, 0.0 + (k - 0.1) * 0.35, 0]),
        dir: ear.dir([0, 1, 0]),
        axis: "z",
        bone: head,
      });
  }

  // mohawk: overlapping blades over a dark scalp strip
  const crown: THREE.Vector3[] = [];
  const bladeOutline = (h: number, lean: number): any[] => [
    [-0.05, -0.03],
    [0.05, -0.03],
    [0.07 + lean * 0.6, h * 0.5],
    [lean + 0.03, h, "sharp"],
    [lean * 0.3, h * 0.62],
    [-0.045, h * 0.28],
  ];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = HC[2] + (0.09 - i * 0.026) * H;
    const hit = skullS.ray([0, HC[1] + 1, z], [0, -1, 0]);
    if (!hit) continue;
    crown.push(hit.at.clone());
    const h = 0.36 - 0.17 * t;
    const bladePaint = paint((_p, n, s) => {
      if (Math.abs(n.x) < 0.5) return "#ffd0ec";
      return mix("#4a2278", "#ff3fa0", smoothstep(0.02, h * 0.95, s[1]));
    });
    b.extrude(bladeOutline(h, 0.1 * t), {
      at: [hit.at.x, hit.at.y - 0.035, hit.at.z],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.004,
      color: bladePaint,
      bone: head,
    });
  }
  if (crown.length > 1)
    b.sweep(catmull(crown), 0.036, { color: "#2a1636", bone: head, sides: 6 });

  // braids at the nape with bone beads
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.07;
    const braid = bezier(hp(x, 0.0, -0.12), hp(x * 2.2, -0.12, -0.22), hp(x * 2.6, -0.3, -0.2));
    b.sweep(braid, [0.02, 0.012], { color: "#3a1c52", bone: head, sides: 5 });
    put(new THREE.SphereGeometry(0.018, 5, 4), BONE, pos(braid.at(0.8)), { bone: head });
    put(new THREE.SphereGeometry(0.014, 5, 4), CORD, pos(braid.at(1)), { bone: head });
  }

  // =============================================================================================================
  // Arms and hands
  const outerLoops: any[] = [];
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const S: V = [s * 0.52, 1.6, 0.2];
    const hand: V = [s * 0.74, 0.6, 0.4];
    const pts = limb(S, hand, [0.52, 0.56], [[s * 0.8, 0, -0.6]]);
    const arm = b.chain(`arm${sd}`, pts, {
      parent: spine,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    arms[sd] = arm;
    const armTube = b.sweep(arm, [0.165, 0.145, 0.115, 0.125, 0.115, 0.1], { color: SKIN });
    put(new THREE.SphereGeometry(1, 10, 8), SKIN, S, { bone: arm.joints[0], scale: [0.23, 0.2, 0.21] });
    b.spike([S[0] + s * 0.1, S[1] + 0.15, S[2]], [s * 0.5, 1, -0.2], 0.17, 0.04, {
      color: BONE,
      bone: arm.joints[0],
    });
    b.spike([S[0] + s * 0.17, S[1] + 0.06, S[2] - 0.02], [s * 1, 0.4, -0.1], 0.14, 0.035, {
      color: BONE,
      bone: arm.joints[0],
    });

    // palm
    put(new THREE.BoxGeometry(0.105 * HAND, 0.11 * HAND, 0.07 * HAND), SKIN, [hand[0], hand[1] - 0.06, hand[2]], {
      bone: arm,
    });
    const xs = [-0.055, -0.02, 0.02, 0.055];
    xs.forEach((xo, j) => {
      const base = v3(hand[0] + xo, hand[1] - 0.12, hand[2] + 0.01);
      const mid = base.clone().add(v3(0, -0.075, 0.03));
      const tip = mid.clone().add(v3(0, -0.05, 0.05));
      const f = b.chain(`finger${sd}${j + 1}`, polyline([base, mid, tip]), {
        parent: arm,
        names: [`f${sd}${j + 1}a`, `f${sd}${j + 1}b`],
        role: "digit",
      });
      b.sweep(f, [0.023 * HAND, 0.019 * HAND, 0.014 * HAND], { color: SKIN, sides: 6 });
      b.spike(tip, [0, -0.45, 1], 0.055, 0.015, { color: BONE, bone: f });
    });
    const tb = v3(hand[0] - s * 0.085, hand[1] - 0.05, hand[2] + 0.01);
    const tm = tb.clone().add(v3(-s * 0.025, -0.05, 0.04));
    const tt = tm.clone().add(v3(-s * 0.005, -0.035, 0.05));
    const th = b.chain(`thumb${sd}`, polyline([tb, tm, tt]), {
      parent: arm,
      names: [`t${sd}a`, `t${sd}b`],
      role: "digit",
    });
    b.sweep(th, [0.026 * HAND, 0.02 * HAND, 0.015 * HAND], { color: SKIN, sides: 6 });
    b.spike(tt, [0, -0.45, 1], 0.05, 0.015, { color: BONE, bone: th });

    // arm band with teeth and a feather
    const armS = b.surface(armTube);
    const loop = armS.loop(arm.at(0.2), { lift: 0.012 });
    b.sweep(loop, 0.022, { color: LEATHER, bone: arm });
    b.along(loop, 5, (at: any) => b.spike(at, [0, -1, 0], 0.065, 0.013, { color: BONE, bone: arm }));
    let best: THREE.Vector3 = pos(loop.at(0));
    for (let k = 1; k < 16; k++) {
      const q = pos(loop.at(k / 16));
      if (q.x * s > best.x * s) best = q;
    }
    outerLoops.push(best);
    b.cards([frame(best, [0, 1, 0])], FEATHER, {
      size: [0.05, 0.17],
      lean: 180,
      flow: [0, 0, 1],
      bone: arm,
    });
  }

  // =============================================================================================================
  // Legs and feet
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.22, 0.95, -0.05];
    const foot: V = [s * 0.27, 0.1, 0.14];
    const lp = limb(hipP, foot, [0.46, 0.44], [[0, 0, 1]]);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, [0.17, 0.15, 0.125, 0.115, 0.1], { color: SKIN });
    put(new THREE.BoxGeometry(0.23, 0.1, 0.3), SKIN, [foot[0], 0.05, foot[2] + 0.06], { bone: leg });
    for (let j = -1; j <= 1; j++) {
      const x = foot[0] + j * 0.075;
      b.capsule([x, 0.055, foot[2] + 0.16], [x, 0.045, foot[2] + 0.3], 0.04, SKIN, { bone: leg, sides: 6 });
      b.spike([x, 0.045, foot[2] + 0.33], [0, -0.1, 1], 0.06, 0.022, { color: BONE, bone: leg });
    }
    // ankle strap
    b.part(new THREE.TorusGeometry(0.105, 0.016, 4, 9), LEATHER, {
      at: [foot[0], 0.14, foot[2] - 0.02],
      dir: [0, 1, 0],
      axis: "z",
      bone: leg,
    });
  }

  // =============================================================================================================
  // Bone fetishes
  const cordPaint = CORD;
  const down = (p: THREE.Vector3, d: number) => v3(p.x, p.y - d, p.z);

  const skullProp = (at: THREE.Vector3, r: number, bone?: any, yaw = 0) => {
    const o = bone ? { bone } : {};
    const c = Math.cos(yaw);
    const sn = Math.sin(yaw);
    const q = (x: number, y: number, z: number): V => [at.x + x * c + z * sn, at.y + y, at.z - x * sn + z * c];
    put(new THREE.SphereGeometry(r, 8, 6), BONE, q(0, 0, 0), { scale: [1, 0.92, 1.05], ...o });
    put(new THREE.BoxGeometry(r * 1.1, r * 0.5, r * 1.0), BONE, q(0, -r * 0.85, r * 0.25), { rotation: [0, (yaw * 180) / Math.PI, 0], ...o });
    for (const s of [1, -1])
      put(new THREE.SphereGeometry(r * 0.27, 5, 4), DARK, q(s * r * 0.38, r * 0.08, r * 0.82), o);
    put(new THREE.BoxGeometry(r * 0.16, r * 0.26, r * 0.1), DARK, q(0, -r * 0.3, r * 0.95), {
      rotation: [0, (yaw * 180) / Math.PI, 0],
      ...o,
    });
  };
  const bonePiece = (p: THREE.Vector3, len: number, bone?: any) => {
    const o = bone ? { bone } : {};
    b.rod(p, down(p, 0.035), 0.004, CORD, o);
    const a = down(p, 0.04);
    const c = down(p, 0.04 + len);
    b.capsule(a, c, 0.013, BONE, { sides: 6, ...o });
    for (const e of [a, c]) put(new THREE.SphereGeometry(0.02, 5, 4), BONE, e, o);
  };
  const featherPiece = (p: THREE.Vector3, bone?: any) => {
    b.cards([frame(p, [0, 1, 0])], FEATHER, { size: [0.06, 0.2], lean: 180, flow: [0, 0, 1], ...(bone ? { bone } : {}) });
  };

  // necklace on the chest
  const yc = (x: number) => 1.47 + 3.75 * x * x;
  const cordX = [-0.26, -0.2, -0.13, -0.065, 0, 0.065, 0.13, 0.2, 0.26];
  const cordHits: any[] = cordX.map((x) => torsoS.nearest([x, yc(x), 0.62]));
  const neckS = b.surface([torso, neckTube]);
  const endL = neckS.nearest([-0.17, 1.82, 0.4]);
  const endR = neckS.nearest([0.17, 1.82, 0.4]);
  const cordPts = [endL, ...cordHits, endR].map((h: any) => offset(h.at, h.n, 0.02));
  b.sweep(catmull(cordPts), 0.011, { color: cordPaint, bone: spine, sides: 5 });
  const pend = [-0.2, -0.13, -0.065, 0, 0.065, 0.13, 0.2];
  pend.forEach((x, i) => {
    const hit = cordHits[cordX.indexOf(x)];
    const p = offset(hit.at, hit.n, 0.025);
    if (i === 0) {
      b.rod(p, down(p, 0.03), 0.004, CORD, { bone: spine });
      b.spike(down(p, 0.03), [0, -1, 0], 0.09, 0.02, { color: BONE, bone: spine });
    } else if (i === 1 || i === 4 || i === 6) bonePiece(p, i === 4 ? 0.1 : 0.07, spine);
    else if (i === 2) {
      b.rod(p, down(p, 0.04), 0.004, CORD, { bone: spine });
      skullProp(down(p, 0.075), 0.035, spine);
    } else if (i === 3) {
      b.rod(p, down(p, 0.05), 0.004, CORD, { bone: spine });
      skullProp(down(p, 0.115), 0.06, spine);
    } else featherPiece(p, spine);
  });

  // neck collar of beads
  const collar = b.surface(neckTube).loop(neck.at(0.35), { lift: 0.012 });
  b.sweep(collar, 0.014, { color: LEATHER, bone: neck });
  b.along(collar, 6, (at: any) => b.part(new THREE.SphereGeometry(0.02, 5, 4), BONE, { at, bone: neck }));

  // belt, teeth, buckle, loincloth
  const belt = torsoS.loop([0, 1.02, -0.05], { lift: 0.018 });
  b.sweep(belt, 0.03, { color: LEATHER, bone: hips });
  b.along(belt, 12, (at: any) => b.spike(at, [0, -1, 0], 0.07, 0.013, { color: BONE, bone: hips }));
  const front = torsoS.ray([0, 1.02, 1.5], [0, 0, -1]);
  const zf = front ? front.at.z : 0.17;
  put(new THREE.BoxGeometry(0.12, 0.1, 0.03), "#c79a3a", [0, 1.02, zf + 0.04], { bone: hips });
  skullProp(v3(0, 1.02, zf + 0.075), 0.04, hips);
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.14, -0.28],
      [0, -0.38, "sharp"],
      [-0.14, -0.28],
    ],
    { at: [0, 1.0, zf + 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: "#7a3a2a", bone: hips },
  );
  put(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", [0, 0.81, zf + 0.034], {
    bone: hips,
    dir: [0, 0, 1],
    axis: "z",
    texture: CLOTH,
  });

  // =============================================================================================================
  // Staff of the Loa
  const SX = 0.98;
  const SZ = 0.05;
  b.sweep(
    catmull([
      [SX, 0.0, SZ],
      [SX - 0.02, 0.7, SZ + 0.02],
      [SX + 0.02, 1.4, SZ - 0.02],
      [SX, 2.0, SZ],
    ]),
    [0.048, 0.03],
    { color: WOOD, bone: stage, sides: 6 },
  );
  for (const y of [0.35, 1.5, 1.85])
    put(new THREE.TorusGeometry(0.04, 0.01, 4, 8), CORD, [SX, y, SZ], { bone: stage, dir: [0, 1, 0], axis: "z" });
  b.capsule([SX - 0.22, 1.93, SZ], [SX + 0.22, 1.93, SZ], 0.02, BONE, { bone: stage, sides: 6 });
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.03, 5, 4), BONE, [SX + s * 0.22, 1.93, SZ], { bone: stage });
    b.cards([frame([SX + s * 0.2, 1.91, SZ], [0, 1, 0])], FEATHER, {
      size: [0.07, 0.3],
      lean: 180,
      flow: [0, 0, 1],
      bone: stage,
      mirror: s < 0,
    });
  }
  for (let i = -1; i <= 1; i++) b.spike([SX + i * 0.02, 1.5, SZ + 0.04], [i * 0.2, -1, 0.1], 0.1, 0.014, { color: BONE, bone: stage });
  skullProp(v3(SX, 2.1, SZ), 0.095, stage, -0.5);
  for (const s of [1, -1])
    b.spike([SX + s * 0.07, 2.17, SZ - 0.02], [s * 1, 1.1, 0], 0.15, 0.03, { color: BONE, bone: stage });
  lit(put(new THREE.IcosahedronGeometry(0.06, 0), "#3dff7a", [SX, 2.29, SZ], { bone: stage, scale: [0.9, 1.3, 0.9] }), 1.8);
  [0.8, 1.05, 1.3].forEach((y) => {
    lit(
      put(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", [SX, y, SZ + 0.049], {
        bone: stage,
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNE,
      }),
      1.5,
    );
  });

  // =============================================================================================================
  // Swamp islet base
  b.lathe(
    [
      [0, -0.03],
      [1.1, -0.03],
      [1.16, 0.0],
      [1.12, 0.035],
      [0, 0.035],
    ],
    { at: [0, 0, 0], color: GROUND, bone: stage, segments: 10 },
  );
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.2;
    const frontArc = Math.cos(a) > 0.55;
    const rad = 1.08 + R() * 0.05;
    const size = (frontArc ? 0.045 : 0.085) + R() * 0.06;
    put(new THREE.IcosahedronGeometry(1, 0), STONE, [Math.sin(a) * rad, 0.035, Math.cos(a) * rad], {
      bone: stage,
      scale: [size * 1.3, size * 0.8, size],
      rotation: [0, R() * 180, 0],
    });
  }

  // reeds and cattails around the back and sides
  const reedFrames: any[] = [];
  for (let i = 0; i < 8; i++) {
    const a = ((100 + i * 22) * Math.PI) / 180;
    for (let k = 0; k < 3; k++) {
      const r = 1.0 + R() * 0.08;
      const aa = a + (k - 1) * 0.06;
      reedFrames.push(frame([Math.sin(aa) * r, 0.03, Math.cos(aa) * r], [0, 1, 0]));
    }
  }
  b.cards(reedFrames, [REED_A, REED_A, REED_B], {
    size: [0.08, 0.7],
    lean: 6,
    bend: 18,
    vary: 0.3,
    spin: 20,
    rng: rng(5),
    flow: (f: any) => [f.at.x, 0.05, f.at.z],
    bone: stage,
  });
  // lily pads
  for (const [x, z] of [
    [0.62, 0.78],
    [-0.8, 0.5],
  ])
    put(new THREE.CircleGeometry(0.12, 8), "#3f7a3a", [x, 0.04, z], { bone: stage, dir: [0, 1, 0], axis: "z" });

  // cypress stump with shelf fungi
  const STX = -0.45;
  const STZ = -0.75;
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.22, 0.12],
      [0.19, 0.4],
      [0.21, 0.5],
      [0, 0.52],
    ],
    { at: [STX, 0.03, STZ], color: BARK, bone: stage, segments: 8 },
  );
  for (let i = 0; i < 3; i++) {
    const a = 0.6 + i * 2.1;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    b.sweep(
      catmull([
        [STX + dx * 0.15, 0.22, STZ + dz * 0.15],
        [STX + dx * 0.32, 0.08, STZ + dz * 0.32],
        [STX + dx * 0.5, 0.035, STZ + dz * 0.5],
      ]),
      [0.06, 0.015],
      { color: BARK, bone: stage, sides: 5 },
    );
  }
  [
    [0.2, 0.2, 2.6],
    [0.32, 0.3, 3.4],
    [0.4, 0.15, 4.3],
  ].forEach(([y, sz, a]) => {
    lit(
      put(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#6af0d0", [STX + Math.sin(a) * 0.21, y, STZ + Math.cos(a) * 0.21], {
        bone: stage,
        scale: [sz * 0.5, sz * 0.22, sz * 0.5],
      }),
      1.2,
    );
  });

  // tiki torches
  for (const [tx, tz] of [
    [0.72, -0.6],
    [-0.92, -0.3],
  ]) {
    b.rod([tx, 0.03, tz], [tx, 1.3, tz], [0.036, 0.028], WOOD, { bone: stage, sides: 6 });
    for (const y of [0.85, 1.0])
      put(new THREE.TorusGeometry(0.04, 0.01, 4, 8), CORD, [tx, y, tz], { bone: stage, dir: [0, 1, 0], axis: "z" });
    b.lathe(
      [
        [0, 1.27],
        [0.06, 1.27],
        [0.11, 1.4],
        [0.095, 1.41],
        [0, 1.33],
      ],
      { at: [tx, 0, tz], color: "#2e2a30", bone: stage, segments: 7 },
    );
    lit(put(new THREE.ConeGeometry(0.075, 0.24, 6), "#7dff6a", [tx, 1.5, tz], { bone: stage }), 1.4);
    lit(put(new THREE.ConeGeometry(0.04, 0.16, 5), "#e8ff9a", [tx, 1.46, tz], { bone: stage }), 1.6);
    lit(
      b.cards([frame([tx, 1.38, tz], [0, 1, 0])], FLAME, {
        size: [0.18, 0.34],
        cross: true,
        lean: 0,
        flow: [0, 0, 1],
        bone: stage,
      }),
      1.3,
    );
  }

  // skull pile, front right, kept low
  skullProp(v3(-0.62, 0.075, 0.55), 0.06, stage, 0.6);
  skullProp(v3(-0.74, 0.07, 0.4), 0.055, stage, 1.1);
  skullProp(v3(-0.55, 0.1, 0.45), 0.05, stage, -0.4);
  b.capsule([-0.8, 0.06, 0.62], [-0.5, 0.05, 0.7], 0.018, BONE, { bone: stage, sides: 6 });
  b.capsule([-0.7, 0.05, 0.7], [-0.45, 0.06, 0.58], 0.016, BONE, { bone: stage, sides: 6 });

  // glowing mushrooms on the front edge
  [
    [0.55, 0.85, 0.07],
    [0.68, 0.76, 0.05],
    [-0.35, 0.95, 0.06],
  ].forEach(([x, z, r]) => {
    put(new THREE.CylinderGeometry(r * 0.35, r * 0.45, r * 1.6, 6), "#efe3c6", [x, 0.035 + r * 0.8, z], { bone: stage });
    lit(
      put(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#4fe0c8", [x, 0.035 + r * 1.55, z], {
        bone: stage,
        scale: [r, r * 0.7, r],
      }),
      1.3,
    );
  });

  // =============================================================================================================
  return b.root;
}
