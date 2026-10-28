import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  limb,
  mottle,
  countershade,
  paint,
  svg,
  noise,
  mix,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hunched, long-armed swamp troll with curved tusks, a magenta mohawk, war paint and a haul of bone fetishes.",
};

// ---------- palette ----------
const BONE = "#e8dcb8";
const BONE_D = "#b9a679";
const TUSK = "#f1e6c0";
const GOLD = "#c8a23a";
const LEATHER = "#5a3a22";
const CORD = "#3b2a1a";
const DARK = "#1b1412";
const CLAW = "#2a2420";
const NOSE = "#2f5a57";
const MUD = "#4a3a26";
const MOSS = "#66822f";

const SKIN_BASE = countershade(mottle("#3f8077", "#2a5a5e", { size: 0.12, seed: 4 }), "#8fb08a", {
  level: -0.25,
  soft: 0.3,
});
const SKIN = paint((p, n) => {
  if (p.y < 0.3 && noise(p, 0.1, 3) > 0.38) return MUD;
  if (n.y > 0.55 && p.y > 1.7 && noise(p, 0.12, 5) > 0.52) return MOSS;
  return SKIN_BASE;
});
const MOHAWK = paint((_p, _n, s) => mix("#5a1260", "#ff3fa4", Math.min(1, Math.max(0, s[1] / 0.3))));

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 60 36">
  <ellipse cx="30" cy="18" rx="28" ry="15" fill="#120c0a"/>
  <ellipse cx="30" cy="18" rx="23" ry="11.5" fill="#ffcf2a"/>
  <ellipse cx="30" cy="22" rx="22" ry="7" fill="#ff8a1c" opacity="0.7"/>
  <ellipse cx="30" cy="18" rx="4" ry="11" fill="#150808"/>
  <circle cx="22" cy="14" r="3" fill="#fff6c8"/>
  <path d="M3 18 Q30 -2 57 18" stroke="#120c0a" stroke-width="5" fill="none"/>
  </svg>`,
  { size: 128 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 100 60">
  <path d="M5 8 L90 22" stroke="#f0ead0" stroke-width="9" stroke-linecap="round"/>
  <path d="M8 28 L92 40" stroke="#d0342c" stroke-width="9" stroke-linecap="round"/>
  <path d="M14 48 L80 56" stroke="#f0ead0" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const CHESTPAINT = svg(
  `<svg viewBox="0 0 100 80">
  <circle cx="50" cy="40" r="15" fill="none" stroke="#f0ead0" stroke-width="6"/>
  <circle cx="50" cy="40" r="5" fill="#d0342c"/>
  <path d="M8 18 L30 34 M92 18 L70 34 M8 62 L30 46 M92 62 L70 46" stroke="#d0342c" stroke-width="7" stroke-linecap="round"/>
  <path d="M50 4 L50 20 M50 60 L50 76" stroke="#f0ead0" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const CLOTH = svg(
  `<svg viewBox="0 0 80 100">
  <path d="M0 0 H80 V82 L70 100 L60 84 L50 100 L40 84 L30 100 L20 84 L10 100 L0 82Z" fill="#7a2e2a"/>
  <path d="M0 0 H80 V10 H0Z" fill="#3a1a14"/>
  <path d="M4 70 L14 56 L24 70 L34 56 L44 70 L54 56 L64 70 L74 56" stroke="#e0a83a" stroke-width="4" fill="none"/>
  <circle cx="40" cy="36" r="13" fill="#e8dcb8"/>
  <rect x="31" y="44" width="18" height="8" fill="#e8dcb8"/>
  <circle cx="35" cy="34" r="4" fill="#1b1412"/><circle cx="45" cy="34" r="4" fill="#1b1412"/>
  <path d="M38 42 L40 38 L42 42Z" fill="#1b1412"/>
  </svg>`,
  { size: 192 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 24 80">
  <path d="M12 0 C26 20 24 56 12 80 C0 56 -2 20 12 0Z" fill="#2fb7a6"/>
  <path d="M12 0 C22 20 20 40 12 50 C4 40 2 20 12 0Z" fill="#ff3fa4"/>
  <path d="M12 2 L12 80" stroke="#f0ead0" stroke-width="2.5"/>
  </svg>`,
  { size: 128 },
);

// ---------- model ----------
export default function build() {
  const b = createBuilder({ name: "swamp_troll" });
  const R = rng(11);

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.12], role: "spine" });
  const stations = [
    { at: [0, 1.0, -0.12], w: 0.62, h: 0.5 },
    { at: [0, 1.3, 0.0], w: 0.8, h: 0.74 },
    { at: [0, 1.7, 0.18], w: 1.0, h: 0.62 },
    { at: [0, 1.98, 0.3], w: 1.05, h: 0.5 },
  ];
  const spine = b.chain("spine", catmull(stations.map((s) => s.at)), { parent: hips, count: 3, role: "spine" });
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.98, 0.3],
      [0, 2.05, 0.48],
      [0, 2.1, 0.6],
    ]),
    { parent: chest, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.04, 0.7], aim: [0, 2.0, 0.98], role: "jaw" });

  // torso
  const body = b.loft(stations, { bone: spine, color: SKIN });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: chest, at: [0, 2.04, 0.1], scale: [0.5, 0.3, 0.4] });
  b.sweep(neck, [0.2, 0.17, 0.15], { color: SKIN });

  // warts
  const skinSurf = b.surface(body);
  for (const hit of skinSurf.scatter(26, { rng: R, minDist: 0.12, filter: (h) => h.n.y > -0.2 }))
    b.stick(new THREE.SphereGeometry(0.03, 5, 4), "#6aa393", hit, { embed: 0.4 });

  // chest war paint
  b.decal(body, CHESTPAINT, { at: [0, 1.72, 0.6], dir: [0, 0, 1], size: [0.5, 0.4], segments: 14 });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, {
    bone: head,
    at: [0, 2.17, 0.7],
    scale: [0.2, 0.18, 0.2],
  });
  for (const s of [1, -1]) {
    glow(
      b.decal(skull, EYE, { at: [s * 0.09, 2.19, 0.86], dir: [s * 0.25, 0, 1], size: [0.11, 0.066], lift: 0.003 }),
      1.2,
    );
    b.decal(skull, CHEEK, { at: [s * 0.16, 2.14, 0.8], dir: [s * 0.8, 0, 0.6], size: [0.1, 0.07], mirror: s < 0 });
    // brow
    b.capsule([s * 0.03, 2.245, 0.87], [s * 0.2, 2.285, 0.75], 0.04, SKIN, { bone: head });
    // ears
    b.extrude(
      [
        [0, 0],
        [0.1, 0.04],
        [0.36, 0.24, "sharp"],
        [0.16, -0.02],
        [0.08, -0.1],
      ],
      { at: [s * 0.18, 2.2, 0.64], x: [s, 0, 0], y: [0, 1, -0.4], thickness: 0.025, color: SKIN, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 8), GOLD, {
      at: [s * 0.3, 2.3, 0.6],
      dir: [s, 0, 0],
      axis: "z",
      bone: head,
    });
    // tusks
    const tp = bezier([s * 0.15, 2.03, 0.92], [s * 0.23, 2.14, 0.98], [s * 0.19, 2.36, 1.04]);
    b.sweep(tp, [0.05, 0], { bone: jaw, color: TUSK, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.TorusGeometry(0.052, 0.013, 5, 8), GOLD, {
      at: tp.at(0.22),
      dir: tp.tangentAt(0.22),
      axis: "z",
      bone: jaw,
    });
    // nostrils
    b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { bone: head, at: [s * 0.025, 2.07, 1.07] });
  }
  b.frustumBox([0, 2.13, 0.76], [0, 2.12, 0.98], [0.26, 0.14], [0.28, 0.1], { bone: head, color: SKIN });
  b.sweep(bezier([0, 2.17, 0.9], [0, 2.17, 1.04], [0, 2.07, 1.1]), [0.055, 0.035], { bone: head, color: NOSE, sides: 6 });
  b.frustumBox([0, 2.02, 0.74], [0, 2.0, 1.0], [0.3, 0.1], [0.34, 0.12], { bone: jaw, color: SKIN });
  b.part(new THREE.BoxGeometry(0.26, 0.03, 0.22), "#3a1414", { bone: head, at: [0, 2.07, 0.86] }); // mouth interior
  for (let i = 0; i < 6; i++) {
    const x = -0.1 + i * 0.04;
    b.spike([x, 2.05, 1.0], [0, 1, 0.1], 0.04, 0.012, { color: TUSK, bone: jaw });
    b.spike([x, 2.08, 1.0], [0, -1, 0.1], 0.03, 0.01, { color: TUSK, bone: head });
  }

  // mohawk
  const crest = catmull([
    [0, 2.3, 0.82],
    [0, 2.35, 0.7],
    [0, 2.31, 0.57],
    [0, 2.23, 0.45],
    [0, 2.2, 0.3],
    [0, 2.12, 0.15],
    [0, 1.95, 0.0],
  ]);
  let bi = 0;
  b.along(crest, 12, (at) => {
    const h = 0.34 - bi * 0.018;
    b.extrude(
      [
        [-0.05, 0],
        [0.06, 0],
        [0.05, 0.5 * h],
        [0.13, h, "sharp"],
        [-0.02, 0.5 * h],
      ],
      { at: at.at, x: [0, 0, -1], thickness: 0.035, color: MOHAWK, bone: bi < 6 ? head : chest },
    );
    bi++;
  });
  b.rod([0, 2.34, 0.7], [0, 2.1, 0.2], 0.04, SKIN, { bone: head });

  // torso gear: belt, cloth
  const belt = skinSurf.loop([0, 1.12, -0.08], { dir: [0, 1, 0], lift: 0.02 });
  b.sweep(belt, 0.04, { color: LEATHER });
  const clothAt = (z: number, tilt: number) =>
    b.part(new THREE.BoxGeometry(0.44, 0.56, 0.03), "#ffffff", {
      at: [0, 0.8, z],
      bone: hips,
      rotation: [tilt, 0, 0],
      texture: CLOTH,
    });
  clothAt(0.25, -6);
  clothAt(-0.41, 6);

  // helpers
  const skullProp = (at: number[], size: number, bone: any) => {
    const [x, y, z] = at;
    b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { bone, at, scale: [0.75 * size, 0.7 * size, 0.7 * size] });
    b.part(new THREE.BoxGeometry(0.9 * size, 0.35 * size, 0.7 * size), BONE_D, {
      bone,
      at: [x, y - 0.65 * size, z + 0.12 * size],
    });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.22 * size, 5, 4), DARK, {
        bone,
        at: [x + s * 0.32 * size, y + 0.05 * size, z + 0.55 * size],
      });
    }
    b.part(new THREE.ConeGeometry(0.1 * size, 0.3 * size, 4), DARK, {
      bone,
      at: [x, y - 0.2 * size, z + 0.66 * size],
      rotation: [180, 0, 0],
    });
  };
  const boneProp = (a: number[], c: number[], r: number, bone: any) => {
    b.capsule(a, c, r, BONE, { bone, sides: 6 });
    for (const p of [a, c])
      for (const s of [1, -1])
        b.part(new THREE.SphereGeometry(r * 1.4, 5, 4), BONE, { bone, at: [p[0] + s * r * 0.8, p[1], p[2]] });
  };
  const feather = (at: number[], size: number, bone: any) =>
    b.cards([frame(at, [0, 1, 0])], FEATHER, { size: [size * 0.3, size], lean: 180, flow: [0, 0, 1], bone });

  // belt buckle + hanging bones
  skullProp([0, 1.08, 0.3], 0.07, hips);
  for (const s of [1, -1]) {
    b.rod([s * 0.34, 1.06, 0.06], [s * 0.34, 0.92, 0.06], 0.008, CORD, { bone: hips });
    boneProp([s * 0.34, 0.92, 0.06], [s * 0.36, 0.64, 0.08], 0.018, hips);
    feather([s * 0.3, 1.06, 0.12], 0.3, hips);
  }

  // necklace
  const neckPath = skinSurf.drape(
    catmull([
      [0.34, 2.02, 0.4],
      [0.22, 1.78, 0.62],
      [0, 1.62, 0.68],
      [-0.22, 1.78, 0.62],
      [-0.34, 2.02, 0.4],
    ]),
    { lift: 0.03 },
  );
  b.sweep(neckPath, 0.013, { color: CORD, bone: chest });
  let ni = 0;
  b.along(neckPath, 7, (at) => {
    const p = at.at;
    const k = ni++;
    if (k === 3) {
      b.rod([p.x, p.y, p.z], [p.x, p.y - 0.06, p.z + 0.03], 0.008, CORD, { bone: chest });
      skullProp([p.x, p.y - 0.12, p.z + 0.04], 0.07, chest);
    } else if (k % 2 === 0) {
      b.spike([p.x, p.y - 0.01, p.z + 0.01], [0, -1, 0.3], 0.11, 0.022, { color: TUSK, bone: chest });
    } else {
      boneProp([p.x, p.y - 0.02, p.z + 0.02], [p.x, p.y - 0.13, p.z + 0.04], 0.012, chest);
    }
  });

  // back totem
  b.capsule([-0.35, 1.2, -0.44], [0.38, 2.6, -0.5], 0.03, LEATHER, { bone: chest, sides: 6 });
  skullProp([0.4, 2.7, -0.5], 0.1, chest);
  for (const t of [0.35, 0.6])
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), CORD, {
      at: [-0.35 + 0.73 * t, 1.2 + 1.4 * t, -0.44 - 0.06 * t],
      dir: [0.73, 1.4, -0.06],
      axis: "z",
      bone: chest,
    });
  feather([0.3, 2.55, -0.5], 0.36, chest);
  feather([0.48, 2.55, -0.5], 0.3, chest);

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.3, 1.0, -0.12];
    const pts = limb(hip, [s * 0.34, 0.09, 0.32], [0.52, 0.54, 0.3], [[0, 0, 1]], { sole: [0, 0, 1] });
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.19, 0.15, 0.12, 0.1, 0.09, 0.075], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), SKIN, { bone: leg.joints[0], at: [s * 0.3, 1.0, -0.12] });
    b.frustumBox([s * 0.34, 0.1, 0.04], [s * 0.34, 0.1, 0.3], [0.2, 0.14], [0.26, 0.12], {
      bone: leg.joints[2],
      color: SKIN,
    });
    for (let i = -1; i <= 1; i++) {
      const x = s * 0.34 + i * 0.075;
      b.capsule([x, 0.09, 0.28], [x + i * 0.02, 0.07, 0.4], 0.04, SKIN, { bone: leg.tip!, sides: 6 });
      b.spike([x + i * 0.02, 0.07, 0.42], [0, -0.3, 1], 0.09, 0.025, { color: CLAW, bone: leg.tip!, sides: 5 });
    }
    // ankle cuff
    b.part(new THREE.TorusGeometry(0.11, 0.02, 5, 9), LEATHER, {
      at: [s * 0.34, 0.2, 0.0],
      dir: [0, 1, 0.2],
      axis: "z",
      bone: leg.joints[1],
    });
  }

  // arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = [s * 0.64, 1.92, 0.26];
    const target = [s * 0.8, 0.86, 0.5];
    const pts = limb(root, target, [0.6, 0.62], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.2, 0.15, 0.12, 0.11, 0.095], { color: SKIN });
    b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, { bone: arm.joints[0], at: [s * 0.62, 1.97, 0.27], scale: [0.25, 0.22, 0.24] });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: hand, at: [s * 0.8, 0.8, 0.52], scale: [0.12, 0.1, 0.13] });
    for (let i = 0; i < 4; i++) {
      const x = s * 0.8 + (i - 1.5) * 0.055;
      b.capsule([x, 0.78, 0.58], [x, 0.64, 0.66], 0.026, SKIN, { bone: hand, sides: 6 });
      b.spike([x, 0.63, 0.67], [0, -0.5, 0.8], 0.08, 0.018, { color: CLAW, bone: hand, sides: 5 });
    }
    b.capsule([s * 0.72, 0.82, 0.5], [s * 0.68, 0.7, 0.6], 0.03, SKIN, { bone: hand, sides: 6 });
    b.spike([s * 0.68, 0.69, 0.61], [0, -0.5, 0.8], 0.07, 0.02, { color: CLAW, bone: hand, sides: 5 });
    // bracer with bone spikes
    const e = pts[1];
    const h = pts[2];
    const bp = e.clone().lerp(h, 0.7);
    const dirF = h.clone().sub(e);
    b.part(new THREE.TorusGeometry(0.115, 0.03, 5, 10), LEATHER, { at: bp, dir: dirF, axis: "z", bone: arm.joints[1] });
    b.spike([bp.x + s * 0.11, bp.y, bp.z], [s, 0.2, 0], 0.09, 0.025, { color: BONE, bone: arm.joints[1], sides: 5 });
    // shoulder pad with skull (left) / bone spikes
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.09, 8), LEATHER, {
      at: [s * 0.68, 2.2, 0.27],
      dir: [s * 0.35, 1, 0],
      bone: arm.joints[0],
    });
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.7;
      b.spike([s * (0.68 + Math.sin(a) * 0.12), 2.24, 0.27 + Math.cos(a) * 0.12 - 0.12], [s * 0.4, 1, a * 0.4], 0.17, 0.035, {
        color: BONE,
        bone: arm.joints[0],
        sides: 5,
      });
    }
    if (s > 0) skullProp([s * 0.8, 2.12, 0.5], 0.065, arm.joints[0]);
  }

  return b.root;
}
