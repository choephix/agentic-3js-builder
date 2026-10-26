import * as THREE from "three";
import { type Builder, createBuilder, limb, catmull, bezier, paint, scales, mix, noise, cells, smoothstep, resolve, rgb, type Rgb, rng, frame, svg, offset, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description: "God of War style five-headed hydra: scarred dark-green hide, bone horns, ember eyes, blood-red mouths.",
};

export const REQUESTS = [
  {
    id: "brokenBlade",
    kind: "add",
    part: "body",
    what: "A broken Spartan blade lodged in the back behind the shoulders: a chipped bronze blade stump, a bronze guard, a splintered grip, and dried BLOOD streaks around the wound.",
    at: [0.35, 2.15, 0.1],
    normal: [0.3, 1, 0],
    bone: "spine2",
    room: [0.5, 0.8, 0.3],
  },
  {
    id: "shackleChain",
    kind: "add",
    part: "neck0",
    what: "Heavy IRON shackle clamped round the lower part of the far-right neck, with 4 broken chain links hanging from it and a BRONZE rivet ring.",
    at: [-0.6, 2.4, 0.85],
    normal: [-1, 0, 0],
    bone: "neck0a",
    room: [0.6, 0.5, 0.6],
  },
  {
    id: "warScarsChest",
    kind: "add",
    part: "body",
    what: "Three raised parallel claw-scar ridges in BLOOD across the left flank, plus a few stitched BONE staples along them.",
    at: [0.8, 1.45, -0.1],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.25, 0.6, 0.9],
  },
  {
    id: "centerHeadFire",
    kind: "add",
    part: "skull2",
    what: "Ember fire licking out of the central head's open mouth: layered flame blades in EMBER and EYE yellow, with sparks, glowing.",
    at: [0, 4.25, 3.0],
    normal: [0, 0, 1],
    bone: "jaw2",
    room: [0.5, 0.5, 0.7],
  },
  {
    id: "spearsInNeck",
    kind: "add",
    part: "neck1",
    what: "Two broken Greek spear shafts and a rusted spearhead stuck in the second neck, with a tattered RED cloth strip tied to one.",
    at: [-0.65, 3.3, 1.0],
    normal: [-1, 0, 0],
    bone: "neck1b",
    room: [0.8, 0.9, 0.4],
  },
  {
    id: "hornRings",
    kind: "add",
    part: "skull2",
    what: "Bronze rings and carved Greek-key bands around the bases of the central head's two horns.",
    at: [0.16, 4.5, 1.9],
    normal: [0.5, 1, 0],
    bone: "head2",
    room: [0.5, 0.3, 0.4],
  },
  {
    id: "legArmorBones",
    kind: "add",
    part: "legFL",
    what: "Bone-plate bracers and spurs on the front legs' knees, studded, edged in BRONZE.",
    at: [0.82, 0.75, 0.55],
    normal: [1, 0, 0],
    bone: "kneeFL",
    room: [0.4, 0.4, 0.4],
  },
  {
    id: "tailBlades",
    kind: "add",
    part: "tail",
    what: "Row of jagged bone blades along the upper tail ridge, each with a darker root and a pale tip, growing smaller to the tip.",
    at: [0, 1.0, -2.4],
    normal: [0, 1, 0],
    bone: "tail2",
    room: [0.4, 0.5, 2.0],
  },
  {
    id: "bodyHide",
    kind: "texture",
    part: "body",
    what: "Layered dark scale plates in SCALE and SCALE_DARK with cracks and scars on the back, pale BELLY ribbed bands underneath, ash grime on the flanks.",
  },
  {
    id: "neckHide",
    kind: "texture",
    part: "neck2",
    what: "Scale pattern on the necks darkening toward the head, belly ribs in BELLY on the underside, a few BLOOD-red scratches.",
  },
  {
    id: "headWarpaint",
    kind: "texture",
    part: "skull2",
    what: "Cracked scale plates and ritual BLOOD streaks running from the eyes down the snout.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const SCALE = "#3d4d3b";
export const SCALE_DARK = "#222c25";
export const BELLY = "#a89a6a";
export const BELLY_D = "#6c6240";
export const BONE = "#d9cfae";
export const RED = "#a3201a";
export const BLOOD = "#5e0d0f";
export const EMBER = "#ff6a1a";
export const EYE = "#ffb020";
export const BRONZE = "#8a5a2a";
export const IRON = "#3a3a40";

const hideBase = scales([SCALE, SCALE_DARK, "#2e3b2f"], "#141a16", { size: 0.16, width: 0.16, seed: 4 });
const bodyPaint = paint((p, n, s) => {
  const base = resolve(hideBase, p, n);
  const belly = smoothstep(0.1, -0.35, n.y);
  if (belly > 0.5) {
    const rib = Math.abs(((p.z * 5) % 1 + 1) % 1 - 0.5);
    return rib < 0.1 ? BELLY_D : mix(BELLY, BELLY_D, noise(p, 0.3, 2) * 0.5);
  }
  let c: Rgb = base;
  const cr = cells(p, 0.5, 11);
  if (cr.d2 - cr.d1 < 0.035 && noise(p, 0.8, 5) > 0.55) c = rgb(BLOOD);
  const ash = smoothstep(0.35, 0.0, Math.abs(n.y)) * smoothstep(0.4, 0.75, noise(p, 0.25, 8));
  c = mix(c, "#7a766a", ash * 0.45);
  return mix(c, "#0d120e", smoothstep(0.2, -0.2, n.y) * 0.3 + 0 * s[0]);
});
const neckPaint = paint((p, n) => {
  const base = resolve(scales([SCALE, "#33422f", SCALE_DARK], "#141a16", { size: 0.12, width: 0.15, seed: 6 }), p, n);
  if (n.y < -0.3) {
    const rib = Math.abs(((p.y * 7) % 1 + 1) % 1 - 0.5);
    return rib < 0.1 ? BELLY_D : BELLY;
  }
  let c: Rgb = mix(base, "#10170f", smoothstep(2.0, 4.8, p.y) * 0.55);
  const sc = Math.abs(Math.sin(p.x * 9 + p.y * 5));
  if (sc < 0.04 && noise(p, 0.5, 3) > 0.5) c = rgb(RED);
  return c;
});
const headPaint = paint((p, n) => {
  const cr = cells(p, 0.16, 21);
  let c: Rgb = mix(SCALE, SCALE_DARK, cr.id * 0.8);
  if (cr.d2 - cr.d1 < 0.06) c = rgb("#10160f");
  const side = Math.abs(((p.x * 0.5) % 0.25) - 0.1);
  if (n.y < -0.5) c = rgb(BELLY_D);
  if (noise(p, 0.12, 9) > 0.7 && Math.abs(n.x) > 0.3) c = mix(c, BLOOD, 0.8);
  if (side < 0.012 && n.y > -0.2 && noise(p, 0.4, 2) > 0.4) c = rgb(BLOOD);
  return c;
});

export default function build() {
  const b = createBuilder({ name: "hydra" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, -0.8], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, -0.8],
      [0, 1.4, 0],
      [0, 1.5, 0.9],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;

  const tailPath = catmull([
    [0, 1.3, -0.8],
    [0, 1.0, -2],
    [0, 0.5, -3.2],
    [0, 0.2, -4.3],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });

  // ---- body
  const body = b.sweep(spine, (t) => [0.75 + 0.1 * Math.sin(t * 3), 0.68 + 0.1 * t], {
    color: bodyPaint,
    name: "body",
  });
  b.sweep(tail, [0.52, 0.05], {
    color: bodyPaint,
    name: "tail",
  });
  const tailSw = b.sweep(tail, [0.52, 0.05], { color: bodyPaint, name: "tailCore" });
  b.along(body, 7, (at) => b.spike(at, at, 0.22, 0.07, { color: BONE }));
  b.along(tailSw, 6, (at) => b.spike(at, at, 0.28 - at.t * 0.2, 0.06, { color: BONE }));
  // shoulder hump + armour ridge
  b.part(new THREE.SphereGeometry(0.5, 8, 6), SCALE_DARK, { bone: chest, at: [0, 1.95, 0.55], scale: [1.2, 0.6, 1.1] });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), SCALE_DARK, { bone: hips, at: [0, 1.85, -0.9], scale: [1.2, 0.5, 1.1] });

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.55 : -0.9;
      const tag = (front ? "F" : "H") + side;
      const pts = limb([s * 0.6, 1.25, z], [s * 0.88, 0.14, z + 0.1], [0.68, 0.68], [[0, 0, front ? 1 : -1]]);
      const leg = b.chain(`leg${tag}`, pts, {
        parent: front ? spine.joints[1] : hips,
        names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
        role: "leg",
      });
      b.sweep(leg, [0.3, 0.15], { color: SCALE, name: `leg${tag}` });
      const foot = pts[2];
      const ft = leg.tip!;
      b.part(new THREE.SphereGeometry(0.2, 8, 6), SCALE_DARK, {
        bone: ft,
        at: [foot.x, 0.12, foot.z + 0.08],
        scale: [1.1, 0.6, 1.4],
      });
      for (const k of [-1, 0, 1])
        b.spike([foot.x + k * 0.1, 0.1, foot.z + 0.3], [k * 0.25, -0.25, 1], 0.28, 0.045, { color: BONE, bone: ft });
      // knee spur
      b.spike(pts[1], [s, 0.3, front ? 0.4 : -0.4], 0.3, 0.07, { color: BONE, bone: leg.joints[1] });
    }
  }

  // ---- heads
  const hs = [0.95, 1.05, 1.3, 1.05, 0.95];
  const heightH = [3.9, 4.5, 4.9, 4.5, 3.9];
  const zF = [1.9, 2.1, 2.3, 2.1, 1.9];
  for (let i = 0; i < 5; i++) {
    const a = i - 2;
    const h = hs[i];
    const pts: number[][] = [
      [-a * 0.3, 1.6, 0.6],
      [-a * 0.75, 2.5, 0.9],
      [-a * 1.15, heightH[i] - 0.8, 1.0],
      [-a * 1.4, heightH[i], zF[i]],
    ];
    // i=0 is far right (x negative)
    const L = 0;
    void L;
    const letters = ["a", "b", "c"];
    const neck = b.chain(`neck${i}`, catmull(pts), {
      parent: chest,
      names: letters.map((l) => `neck${i}${l}`),
      role: "neck",
    });
    const sw = b.sweep(neck, (t) => 0.36 * (1 - t) + 0.17 * h, {
      color: neckPaint,
      name: `neck${i}`,
    });
    b.along(sw, 4, (at) => b.spike(at, at, 0.17, 0.05, { color: BONE }));

    const end = pts[3];
    const head = b.joint(`head${i}`, { at: end, dir: [-a * 0.15, -0.3, 1], role: "head" });
    const jaw = b.joint(`jaw${i}`, {
      parent: head,
      at: head.local({ forward: 0.0, up: -0.08 * h }),
      aim: head.local({ forward: 0.4 * h, up: -0.1 * h }),
      role: "jaw",
    });
    const P = (f: number, u: number, r: number) => head.local({ forward: f * h, up: u * h, left: r * h });
    const Jp = (f: number, u: number, r: number) => jaw.local({ forward: f * h, up: u * h, left: r * h });

    b.frustumBox(P(-0.12, 0, 0), P(0.3, 0, 0), [0.38 * h, 0.3 * h], [0.24 * h, 0.2 * h], {
      bone: head, color: headPaint, name: `skull${i}`,
    });
    b.frustumBox(P(0.3, -0.01, 0), P(0.64, -0.02, 0), [0.24 * h, 0.17 * h], [0.17 * h, 0.12 * h], {
      bone: head, color: headPaint, name: `snout${i}`,
    });
    b.frustumBox(Jp(-0.05, 0, 0), Jp(0.6, -0.01, 0), [0.3 * h, 0.08 * h], [0.15 * h, 0.06 * h], {
      bone: jaw, color: BELLY_D, name: `lowerJaw${i}`,
    });
    b.part(new THREE.BoxGeometry(0.17 * h, 0.02 * h, 0.4 * h), BLOOD, { bone: jaw, at: Jp(0.3, 0.045, 0) });
    b.part(new THREE.BoxGeometry(0.2 * h, 0.03 * h, 0.5 * h), BLOOD, { bone: head, at: P(0.3, -0.1, 0) });
    for (const s of [1, -1]) {
      for (let k = 0; k < 4; k++) {
        b.spike(P(0.22 + k * 0.12, -0.1, s * 0.09), [0, -1, 0], 0.1 * h, 0.018 * h, { bone: head, color: BONE });
        b.spike(Jp(0.16 + k * 0.12, 0.04, s * 0.08), [0, 1, 0], 0.09 * h, 0.017 * h, { bone: jaw, color: BONE });
      }
      glow(
        b.part(new THREE.SphereGeometry(0.05 * h, 6, 4), EYE, { bone: head, at: P(0.14, 0.1, s * 0.15) }),
        1.6,
      );
      b.part(new THREE.BoxGeometry(0.1 * h, 0.035 * h, 0.17 * h), SCALE_DARK, {
        bone: head, at: P(0.13, 0.16, s * 0.14), rotation: [0, 0, -s * 22],
      });
      b.part(new THREE.SphereGeometry(0.02 * h, 5, 4), "#0a0d0b", { bone: head, at: P(0.63, 0.05, s * 0.05) });
      // horns
      b.sweep(bezier(P(-0.05, 0.14, s * 0.12), P(-0.3, 0.4, s * 0.28), P(-0.7, 0.3, s * 0.34)), [0.06 * h, 0.0], {
        bone: head, color: BONE, caps: { start: "flat", end: "point" }, name: `horn${i}`,
      });
      // cheek spikes
      b.spike(P(-0.08, -0.02, s * 0.2), [s, 0.15, -0.6], 0.24 * h, 0.045 * h, { bone: head, color: BONE });
      b.spike(P(0.05, -0.04, s * 0.18), [s, 0.0, -0.5], 0.16 * h, 0.035 * h, { bone: head, color: BONE });
    }
    // brow crest and snout ridge
    b.spike(P(0.0, 0.15, 0), [0, 1, -0.5], 0.2 * h, 0.05 * h, { bone: head, color: BONE });
    b.spike(P(0.4, 0.09, 0), [0, 1, 0.1], 0.07 * h, 0.03 * h, { bone: head, color: BONE });
    // scar across one eye
    if (i % 2 === 1) {
      const s = i === 1 ? 1 : -1;
      b.part(new THREE.BoxGeometry(0.02 * h, 0.012 * h, 0.3 * h), RED, {
        bone: head, at: P(0.2, 0.115, s * 0.14), rotation: [0, 0, s * 30],
      });
    }
    if (i === 2) {
      glow(b.part(new THREE.SphereGeometry(0.1, 6, 5), EMBER, { bone: head, at: P(0.35, -0.08, 0) }), 1.4);
    }
    b.pose(jaw, { axis: [1, 0, 0], deg: 8 + (i === 2 ? 22 : i * 3) });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addBrokenBlade(b: Builder) {
  const R = rng(21);
  const BLADE = "#b8864a";
  const BLADE_HI = "#e0b878";
  const WOOD = "#4a3320";
  const bone = "spine2";

  // Seat the wound on the back surface
  const skin = b.surface(b.root);
  const hit = skin.nearest([0.35, 2.15, 0.1]);
  const base = hit.at.clone();
  const up = new THREE.Vector3(0.18, 1, -0.1).normalize();

  const P = (x: number, y: number, z: number) => base.clone().add(new THREE.Vector3(x, y, z));
  const place = (d: number) => base.clone().addScaledVector(up, d);

  // Blade drawing: chipped bronze with fuller and nicks
  const bladeTex = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 100 L4 30 L9 24 L8 17 L16 8 L22 12 L30 3 L33 20 L36 28 L36 100Z" fill="#c9954f" stroke="#4a3018" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M20 100 L20 22" stroke="#7a4f22" stroke-width="5"/>
      <path d="M8 100 L8 34 M32 100 L32 34" stroke="#f0cf90" stroke-width="2"/>
      <path d="M12 60 l5 4 l-4 5 M28 45 l-4 3" stroke="#4a3018" stroke-width="1.5" fill="none"/>
      <path d="M20 14 l-3 14 l5 8" stroke="#5e0d0f" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 192 },
  );

  // Blade stump: textured double-face plane crossing, tilted back
  const bladeH = 0.46;
  for (const rot of [0, 90]) {
    const w = rot === 0 ? 0.17 : 0.045;
    b.part(new THREE.PlaneGeometry(w, bladeH), "#ffffff", {
      bone,
      at: place(0.12 + bladeH / 2 - 0.05),
      aim: up,
      axis: "y",
      texture: bladeTex,
      rotation: undefined,
      up: rot === 0 ? [0, 0, 1] : [1, 0, 0],
      name: `s21bladeFace${rot}`,
    });
  }
  // solid core of the blade so it is visible from sides
  b.part(new THREE.BoxGeometry(0.16, bladeH * 0.9, 0.035), BLADE, {
    bone,
    at: place(0.08 + bladeH * 0.45),
    aim: up,
    up: [0, 0, 1],
    name: "s21bladeCore",
  });
  b.part(new THREE.BoxGeometry(0.02, bladeH * 0.92, 0.04), BLADE_HI, {
    bone,
    at: place(0.08 + bladeH * 0.45),
    aim: up,
    up: [0, 0, 1],
    name: "s21bladeRidge",
  });
  // chipped tip shards
  for (let i = 0; i < 3; i++) {
    b.spike(place(bladeH * (0.85 + 0.05 * i)), [R() * 0.6 - 0.3, 1, R() * 0.4 - 0.2], 0.08, 0.025, {
      bone,
      color: BLADE_HI,
    });
  }

  // Guard (crossguard) low on the blade with end caps
  const guardAt = place(0.07);
  b.part(new THREE.BoxGeometry(0.42, 0.045, 0.07), "#7a4c1e", {
    bone,
    at: guardAt,
    aim: up,
    up: [0, 0, 1],
    name: "s21guard",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BLADE, {
      bone,
      at: guardAt.clone().add(new THREE.Vector3(s * 0.21, 0, 0)),
      name: "s21guardCap",
    });
    b.spike(guardAt.clone().add(new THREE.Vector3(s * 0.2, 0.02, 0)), [s, 0.8, 0], 0.09, 0.02, {
      bone,
      color: BLADE_HI,
    });
  }
  // guard rivets
  for (const x of [-0.1, 0, 0.1])
    b.part(new THREE.SphereGeometry(0.014, 5, 4), BLADE_HI, {
      bone,
      at: guardAt.clone().add(new THREE.Vector3(x, 0.025, 0.036)),
    });

  // Splintered grip stub below the guard, buried slightly
  b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.14, 6), WOOD, {
    bone,
    at: place(-0.0),
    aim: up,
    name: "s21grip",
  });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.spike(place(0.0), [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.09 + R() * 0.05, 0.012, {
      bone,
      color: "#6a4a2c",
    });
  }
  // grip binding wraps
  for (let i = 0; i < 3; i++)
    b.part(new THREE.TorusGeometry(0.036, 0.007, 4, 8), "#2a1c10", {
      bone,
      at: place(-0.04 + i * 0.035),
      aim: up,
      axis: "z",
      name: "s21wrap",
    });

  // Wound: dark gash ring and blood crust at entry
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 0.03, 8), "#3a0709", {
    bone,
    at: place(-0.02),
    aim: up,
    scale: [1, 1, 0.8],
    name: "s21wound",
  });
  b.part(new THREE.TorusGeometry(0.13, 0.025, 5, 9), "#5e0d0f", {
    bone,
    at: place(0.0),
    aim: up,
    axis: "z",
    name: "s21woundRim",
  });

  // Blood streaks running down the hide
  const streakTex = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0 C12 20 18 35 14 55 C12 70 16 80 15 92 Q15 100 15 92" stroke="#5e0d0f" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="15" cy="94" r="4.5" fill="#5e0d0f"/>
      <path d="M6 0 C5 15 8 25 6 40" stroke="#7a1414" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M24 0 C25 12 22 20 24 32" stroke="#4a0a0c" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const streakHits = [
    [0.12, 0.0],
    [-0.1, 0.03],
    [0.25, -0.05],
    [0.02, 0.12],
  ];
  const frames = streakHits.map(([dx, dz]) => {
    const h = skin.nearest(P(dx, -0.02, dz));
    return frame(h.at, [0, 1, 0]);
  });
  b.cards(frames, streakTex, {
    size: [0.07, 0.3],
    lean: 180,
    flow: [0, 0, 1],
    vary: 0.3,
    rng: R,
    bone,
    sink: 0,
  });

  // Dried blood drops and splatter on the scales
  for (let i = 0; i < 6; i++) {
    const h = skin.nearest(P(R() * 0.5 - 0.25, 0, R() * 0.4 - 0.2));
    b.stick(new THREE.SphereGeometry(0.02 + R() * 0.02, 5, 4), "#5e0d0f", h, { embed: 0.6, scale: [1, 0.4, 1] });
  }

  // Cracked scale fragments pushed up around the wound
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const h = skin.nearest(P(Math.cos(a) * 0.19, 0, Math.sin(a) * 0.19));
    b.stick(new THREE.ConeGeometry(0.04, 0.07, 4), "#222c25", h, { embed: 0.3 });
  }
}
    return addBrokenBlade;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addShackleChain(b: Builder) {
  const R = rng(22);
  const RUST = "#5a3a22";
  const DARKIRON = "#25252b";
  const LINK = "#4a4a52";

  // neck0 is the far-right neck (x negative). Find a surface hit near the request point.
  const neckSurf = b.surface(b.root);
  const at = new THREE.Vector3(-0.6, 2.4, 0.85);
  const hit = neckSurf.nearest(at);
  const c = hit.at.clone();
  const bone = "neck0a";

  // Neck axis estimate: rises and leans outward (-x) as it goes up.
  const axis = new THREE.Vector3(-0.3, 1, 0.1).normalize();

  const ironPaint = paint((p, n) => {
    const base = mix(DARKIRON, "#6a6a74", smoothstep(0.35, 0.85, noise(p, 0.05, 3)));
    const rust = smoothstep(0.55, 0.8, noise(p, 0.04, 8)) * 0.6;
    const c2 = mix(base, RUST, rust);
    const sh = 0.8 + 0.2 * smoothstep(-0.8, 0.6, n.y);
    return [c2[0] * sh, c2[1] * sh, c2[2] * sh];
  });

  const place = (geo: THREE.BufferGeometry, color: any, pos: THREE.Vector3, dir: THREE.Vector3, opts: any = {}) =>
    b.part(geo, color, { bone, at: pos, dir, ...opts });

  // Shackle: two half-bands (torus) wrapped round the neck, with a clamp lug.
  const ringR = 0.46;
  const mk = (off: number, r: number, tube: number, col: any) => {
    const center = c.clone().addScaledVector(axis, off).add(new THREE.Vector3(0.38, 0, -0.02));
    place(new THREE.TorusGeometry(r, tube, 6, 14), col, center, axis, { axis: "z" });
  };
  mk(0, ringR, 0.06, ironPaint);
  mk(0.14, ringR - 0.015, 0.045, DARKIRON);
  mk(-0.14, ringR - 0.015, 0.045, DARKIRON);

  const center0 = c.clone().add(new THREE.Vector3(0.38, 0, -0.02));
  // outward side direction (-x), side of the neck
  const out = new THREE.Vector3(-1, 0, 0);
  const lugPos = center0.clone().addScaledVector(out, ringR + 0.02);
  place(new THREE.BoxGeometry(0.16, 0.34, 0.22), ironPaint, lugPos, axis, { axis: "y" });
  // lug hole ring / eyelet
  const eye = lugPos.clone().addScaledVector(out, 0.1);
  place(new THREE.TorusGeometry(0.07, 0.025, 5, 10), DARKIRON, eye, new THREE.Vector3(0, 0, 1), { axis: "z" });

  // Bronze rivets ring on the band
  const rivetGeo = new THREE.SphereGeometry(0.03, 5, 4);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = center0
      .clone()
      .add(new THREE.Vector3(Math.cos(a) * (ringR + 0.05), 0, Math.sin(a) * (ringR + 0.05)))
      .addScaledVector(axis, 0.0);
    place(rivetGeo, BRONZE, p, new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
  }
  // Bronze rivets on the lug
  for (const dy of [-0.11, 0.11]) {
    place(rivetGeo, BRONZE, lugPos.clone().add(new THREE.Vector3(-0.09, dy, 0.1)), out);
    place(rivetGeo, BRONZE, lugPos.clone().add(new THREE.Vector3(-0.09, dy, -0.1)), out);
  }

  // Chain: 4 links hanging, alternating orientation, last one broken/open and tilted.
  const linkGeoFlat = new THREE.TorusGeometry(0.075, 0.022, 5, 10);
  linkGeoFlat.scale(0.75, 1.25, 1);
  let pos = eye.clone().add(new THREE.Vector3(-0.02, -0.12, 0));
  for (let i = 0; i < 4; i++) {
    const turn = i % 2 === 0;
    const drift = new THREE.Vector3(-0.03 * i, 0, 0.02 * (R() - 0.5));
    const lastBroken = i === 3;
    const rot: [number, number, number] = [lastBroken ? 25 : 0, turn ? 0 : 90, lastBroken ? 30 : 0];
    b.part(linkGeoFlat, i === 3 ? RUST : LINK, {
      bone,
      at: pos.clone().add(drift),
      rotation: rot,
    });
    pos = pos.clone().add(new THREE.Vector3(-0.015, -0.15, 0));
  }
  // broken end: jagged stub spike
  b.spike(pos.clone().add(new THREE.Vector3(-0.03, 0.04, 0)), [0.2, -1, 0.1], 0.1, 0.02, {
    bone,
    color: RUST,
  });

  // Blood/grime stain on neck under the shackle, as a flat painted decal-ish slab
  const stainTex = svg(
    `<svg viewBox="0 0 40 60"><path d="M6 0 L34 0 L30 20 L26 40 L22 58 L18 36 L14 22 Z" fill="#5e0d0f" opacity="0.85"/><path d="M2 0 L8 0 L6 26 Z" fill="#3a0809"/></svg>`,
    { size: 96 },
  );
  b.decal(neckSurf, stainTex, {
    at: c.clone().add(new THREE.Vector3(0.0, -0.36, 0.1)),
    dir: [-1, 0, 0.3],
    size: [0.3, 0.44],
    lift: 0.004,
    bone,
  });

  // Gouged scrape scars beside the band
  for (const k of [-1, 0, 1]) {
    const p = c.clone().add(new THREE.Vector3(0.3, 0.3 + k * 0.03, 0.18 + k * 0.05));
    b.spike(p, [0.2, 0.1, 1], 0.14, 0.012, { bone, color: RED });
  }
}
    return addShackleChain;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWarScarsChest(b: Builder) {
  const R = rng(23);

  // ---- claw scars on the left flank (x ~ +0.8 surface)
  const body = b.surface(b.root);
  for (let i = 0; i < 3; i++) {
    const z0 = -0.45 + i * 0.12;
    const pts: number[][] = [];
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      const probe: [number, number, number] = [1.6, 1.85 - u * 0.8 + (R() - 0.5) * 0.03, z0 + u * 0.45];
      const hit = body.ray(probe, [-1, 0, 0]);
      if (hit) {
        const p = offset(hit.at, hit.n, 0.015);
        pts.push([p.x, p.y, p.z]);
      } else pts.push([0.8, 1.85 - u * 0.8, z0 + u * 0.45]);
    }
    const path = catmull(pts);
    b.sweep(path, [0.012, 0.028, 0.02, 0.012], {
      bone: "spine2",
      color: BLOOD,
      sides: 5,
      caps: "point",
      name: `s23scar${i}`,
    });
    // stitched bone staples across the scar
    for (let k = 1; k < 5; k += 1) {
      const t = k / 5;
      const at = path.at(t);
      b.part(new THREE.BoxGeometry(0.1, 0.014, 0.014), BONE, {
        bone: "spine2",
        at: [at.x + 0.015, at.y, at.z],
        rotation: [0, 0, 0],
        name: `s23staple${i}_${k}`,
      });
      b.part(new THREE.BoxGeometry(0.02, 0.014, 0.014), BRONZE, {
        bone: "spine2",
        at: [at.x + 0.015, at.y + 0.0, at.z],
        name: `s23stapleHub${i}_${k}`,
      });
    }
  }
  // dried blood trails below
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.02, 0.22 - i * 0.04, 0.03), BLOOD, {
      bone: "spine2",
      at: [0.83, 1.15 - i * 0.04, -0.4 + i * 0.12 + 0.35],
      name: `s23drip${i}`,
    });
  }

  // ---- fire from central head's mouth
  const jaw = "jaw2";
  const mouth: [number, number, number] = [0, 4.25, 3.0];
  const flameShape = (w: number, l: number): [number, number, string?][] => [
    [-w, 0],
    [-w * 0.8, l * 0.4],
    [-w * 0.3, l * 0.6],
    [0, l, "sharp"] as unknown as [number, number],
    [w * 0.35, l * 0.55],
    [w * 0.85, l * 0.35],
    [w, 0],
  ] as [number, number][];
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.16;
    const len = 0.55 - Math.abs(i - 3) * 0.06;
    const dir: [number, number, number] = [a, 0.12 + (i % 2) * 0.05, 1];
    const col = i % 2 ? EYE : EMBER;
    const f = b.extrude(flameShape(0.07, len) as [number, number][], {
      at: [mouth[0] + a * 0.1, mouth[1] + (i % 3) * 0.02 - 0.02, mouth[2] - 0.05],
      x: [0, 1, 0],
      y: dir,
      thickness: [0.03, 0.005],
      bone: jaw,
      color: col,
      name: `s23flame${i}`,
    });
    glow(f, 1.5);
  }
  // inner hot core
  glow(
    b.spike([mouth[0], mouth[1], mouth[2] - 0.05], [0, 0.05, 1], 0.5, 0.06, { bone: jaw, color: EYE, name: "s23core" }),
    2,
  );
  // sparks
  for (let i = 0; i < 12; i++) {
    const p: [number, number, number] = [
      mouth[0] + (R() - 0.5) * 0.5,
      mouth[1] + 0.05 + R() * 0.35,
      mouth[2] + 0.2 + R() * 0.55,
    ];
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.012, 0), i % 3 ? EMBER : EYE, {
        bone: jaw,
        at: p,
        rotation: [R() * 90, R() * 90, 0],
        name: `s23spark${i}`,
      }),
      1.8,
    );
  }
}
    return addWarScarsChest;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addSpearsInNeck(b: Builder) {
  const R = rng(24);
  const WOOD = "#6b4a2a";
  const RUST = "#7a3b1c";
  const STEEL = "#8b8f94";
  const CLOTH = RED;
  const neckBone = "neck1b";

  const cloth = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 0 H28 L26 20 L30 34 L22 44 L24 64 L14 52 L10 60 L8 40 L2 28 L6 14Z" fill="#a3201a" stroke="#5e0d0f" stroke-width="2"/><path d="M10 6 L12 40 M18 6 L19 46" stroke="#5e0d0f" stroke-width="1.5" fill="none"/></svg>`,
    { size: 128 },
  );

  const skin = b.surface(b.root);
  const base = new THREE.Vector3(-0.65, 3.3, 1.0);

  const spears = [
    { off: [0, 0.1, 0.1], dir: [-0.7, 0.7, 0.25], len: 0.85, head: true },
    { off: [0, -0.25, -0.12], dir: [-0.8, 0.2, -0.55], len: 0.7, head: false },
  ];

  spears.forEach((sp, idx) => {
    const p = base.clone().add(new THREE.Vector3(...(sp.off as [number, number, number])));
    const hit = skin.nearest(p);
    const d = new THREE.Vector3(...(sp.dir as [number, number, number])).normalize();
    // shaft (embedded slightly)
    const start = hit.at.clone().addScaledVector(d, -0.08);
    const end = hit.at.clone().addScaledVector(d, sp.len);
    b.rod(start, end, 0.022, WOOD, { bone: neckBone, sides: 6, name: `s24shaft${idx}` } as any);
    // splintered broken end
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + R();
      const side = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.3).cross(d).normalize();
      const o = end.clone().addScaledVector(side, 0.012);
      b.spike(o, d.clone().add(side.clone().multiplyScalar(0.3)), 0.07 + R() * 0.05, 0.01, {
        color: "#a98756",
        bone: neckBone,
      });
    }
    // binding bands
    for (let k = 0; k < 2; k++) {
      const c = hit.at.clone().addScaledVector(d, 0.2 + k * 0.18);
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), BRONZE, {
        bone: neckBone,
        at: c,
        dir: d,
      });
    }
    if (sp.head) {
      const hb = hit.at.clone().addScaledVector(d, 0.02);
      // rusted spearhead stuck near the wound: leaf-shaped blade
      const tipBase = hit.at.clone().addScaledVector(d, 0.55);
      const hd = b.extrude(
        [
          [0, 0],
          [0.05, 0.07],
          [0.035, 0.2],
          [0, 0.3, "sharp"],
          [-0.035, 0.2],
          [-0.05, 0.07],
        ],
        { at: tipBase, x: [0, 0, 1], y: d.toArray() as any, thickness: 0.012, bevel: 0.003, color: RUST, bone: neckBone },
      );
      b.rod(tipBase.clone().addScaledVector(d, 0.02), tipBase.clone().addScaledVector(d, 0.25), 0.006, STEEL, {
        bone: neckBone,
      });
      void hd;
      void hb;
      // socket
      b.part(new THREE.CylinderGeometry(0.03, 0.025, 0.07, 6), IRON, { bone: neckBone, at: tipBase, dir: d });
      // tattered cloth tied below blade
      const cf = frame(hit.at.clone().addScaledVector(d, 0.45), [0, 1, 0]);
      b.cards([cf, frame(hit.at.clone().addScaledVector(d, 0.4).add(new THREE.Vector3(0, 0, 0.02)), [0, 1, 0])], cloth, {
        size: [0.1, 0.32],
        lean: 180,
        flow: [-1, 0, 0.3],
        bend: 20,
        bone: neckBone,
        spin: 10,
        vary: 0.2,
      } as any);
      b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), CLOTH, {
        bone: neckBone,
        at: hit.at.clone().addScaledVector(d, 0.45),
        dir: d,
      });
    }
    // blood trickle around wound
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.01, 7), BLOOD, {
      bone: neckBone,
      at: hit.at.clone().addScaledVector(hit.n, 0.005),
      dir: hit.n.toArray() as any,
    });
    // scales cracked near wound
    b.spike(hit.at.clone().addScaledVector(hit.n, 0.0), hit.n.clone().add(new THREE.Vector3(0, -0.8, 0)), 0.08, 0.025, {
      color: SCALE_DARK,
      bone: neckBone,
    });
  });
}
    return addSpearsInNeck;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addHornRings(b: Builder) {
  const GOLD = "#c98a3a";
  const DARKB = "#4a2e14";
  const h = 1.3; // head 2 scale in stage 1
  const key = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#ffffff"/>
      <path d="M2 14 V3 H14 V11 H7 V7 H11 M18 14 V3 H30 V11 H23 V7 H27 M34 14 V3 H46 V11 H39 V7 H43 M50 14 V3 H62 V11 H55 V7 H59"
        fill="none" stroke="#2a1608" stroke-width="2.2" stroke-linejoin="miter"/>
    </svg>`,
    { size: 256 },
  );



  for (const s of [1, -1]) {
    // horn base on head2: P(-0.05, 0.14, s*0.12) with head scale h; head joint at neck end
    const base = (b as any).root; void base;
    const hj = (b as any).joints?.get?.("head2");
    void hj;
  }

  // Locate head2 joint via the surface of the skull and the request point
  const skullSurf = b.surface(b.root);
  for (const s of [1, -1]) {
    const target: [number, number, number] = [s * 0.16, 4.5, 1.9];
    const hit = skullSurf.nearest(target);
    const n = hit.n.clone();
    const axis: [number, number, number] = [n.x, n.y, n.z];
    // outward-sloping horn axis: mostly up/back from the skull
    const dir: [number, number, number] = [s * 0.25, 0.75, -0.6];
    const at = hit.at.clone();

    // three bronze rings stepping up the horn base
    for (let k = 0; k < 3; k++) {
      const off = at.clone().addScaledVector(new THREE.Vector3(...dir).normalize(), 0.03 + k * 0.075);
      const r = 0.1 - k * 0.012;
      const ring = b.part(new THREE.CylinderGeometry(r, r + 0.012, 0.04, 8), k === 1 ? DARKB : GOLD, {
        at: off,
        dir,
        bone: "head2",
      });
      void ring;
      b.part(new THREE.TorusGeometry(r + 0.006, 0.009, 4, 10), GOLD, {
        at: off.clone().addScaledVector(new THREE.Vector3(...dir).normalize(), 0.022),
        dir,
        axis: "z",
        bone: "head2",
      });
    }

    // Greek-key band around the lowest ring
    const bandAt = at.clone().addScaledVector(new THREE.Vector3(...dir).normalize(), 0.105);
    b.part(new THREE.CylinderGeometry(0.099, 0.099, 0.05, 12, 1, true), GOLD, {
      at: bandAt,
      dir,
      bone: "head2",
      texture: key,
    });

    // studs on the bottom collar
    b.ring(
      { at: at.clone().addScaledVector(new THREE.Vector3(...dir).normalize(), 0.03), axis: new THREE.Vector3(...dir).normalize() } as any,
      { count: 6, radius: 0.105 },
      (it) => {
        b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#e6b765", it, { embed: 0.3, bone: "head2" });
      },
    );

    // tip cap where rings end
    b.part(new THREE.ConeGeometry(0.075, 0.06, 8), DARKB, {
      at: at.clone().addScaledVector(new THREE.Vector3(...dir).normalize(), 0.27),
      dir,
      bone: "head2",
    });
    void axis;
    void h;
  }
}
    return addHornRings;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLegArmorBones(b: Builder) {
  const r = rng(26);
  const PALE = "#efe6c8";
  const DEEP = "#7a6f4e";
  const STUD = "#b9803c";

  // ---- front leg knee bracers (left +X and right -X)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const knee = b.joint(`s26knee${side}`, { parent: `kneeF${side}`, at: [s * 0.74, 0.75, 0.55] });
    // find knee position from leg surface
    const kx = s * 0.74;
    const ky = 0.72;
    const kz = 0.58;
    const bone = `kneeF${side}`;

    // main bracer: stacked bone plates wrapping the knee
    b.part(new THREE.CylinderGeometry(0.27, 0.24, 0.12, 8), DEEP, {
      bone, at: [kx, ky + 0.1, kz], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.14, 8), PALE, {
      bone, at: [kx, ky, kz], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.12, 8), DEEP, {
      bone, at: [kx, ky - 0.12, kz], flat: true,
    });
    // bronze edge rings
    for (const dy of [0.17, -0.18]) {
      b.part(new THREE.TorusGeometry(0.27, 0.018, 4, 10), BRONZE, {
        bone, at: [kx, ky + dy, kz], rotation: [90, 0, 0],
      });
    }
    // front kneecap plate
    b.part(new THREE.BoxGeometry(0.2, 0.26, 0.08), PALE, {
      bone, at: [kx + s * 0.14, ky, kz + 0.04], rotation: [0, 0, s * 8],
    });
    b.part(new THREE.BoxGeometry(0.06, 0.3, 0.1), BRONZE, {
      bone, at: [kx + s * 0.2, ky, kz + 0.04],
    });
    // studs around the bracer
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.025, 5, 4), STUD, {
        bone, at: [kx + Math.cos(a) * 0.29, ky + 0.01, kz + Math.sin(a) * 0.29],
      });
    }
    // spurs: a big outward spur plus two smaller ones
    b.spike([kx + s * 0.24, ky + 0.02, kz + 0.02], [s, 0.25, 0.1], 0.38, 0.085, { bone, color: PALE });
    b.spike([kx + s * 0.22, ky + 0.15, kz + 0.1], [s * 0.7, 0.8, 0.3], 0.22, 0.05, { bone, color: PALE });
    b.spike([kx + s * 0.22, ky - 0.12, kz + 0.08], [s * 0.7, -0.5, 0.5], 0.2, 0.045, { bone, color: DEEP });
    b.spike([kx, ky + 0.02, kz + 0.28], [0, 0.2, 1], 0.2, 0.05, { bone, color: PALE });
    // spur root bands
    b.part(new THREE.TorusGeometry(0.075, 0.015, 4, 8), BRONZE, {
      bone, at: [kx + s * 0.27, ky + 0.03, kz + 0.02], rotation: [0, 90, 0],
    });
    // lower strap with a hanging bone shard
    b.part(new THREE.BoxGeometry(0.31, 0.04, 0.31), "#3a2a1a", { bone, at: [kx, ky - 0.25, kz] });
    b.spike([kx + s * 0.1, ky - 0.27, kz + 0.2], [0, -1, 0.2], 0.14, 0.03, { bone, color: PALE });
    void knee;
  }

  // ---- tail blades along upper ridge
  const tailSw = b.surface(b.root);
  const bones = ["tail1", "tail2", "tail3", "tail4"];
  const pts: [number, number, number, string][] = [
    [0, 1.38, -1.2, "tail1"],
    [0, 1.22, -1.65, "tail2"],
    [0, 1.05, -2.1, "tail2"],
    [0, 0.88, -2.55, "tail2"],
    [0, 0.68, -3.0, "tail3"],
    [0, 0.52, -3.4, "tail3"],
    [0, 0.38, -3.8, "tail4"],
    [0, 0.28, -4.1, "tail4"],
  ];
  void tailSw; void bones;
  pts.forEach(([x, y, z, bone], i) => {
    const t = i / (pts.length - 1);
    const sc = 1 - t * 0.65;
    const hit = b.surface(b.root).ray([x, y + 1.5, z], [0, -1, 0]);
    const base: [number, number, number] = hit ? [hit.at.x, hit.at.y, hit.at.z] : [x, y, z];
    const lean = -0.55 - r() * 0.15;
    // dark root
    b.spike(base, [0, 1, lean], 0.2 * sc + 0.04, 0.085 * sc, { bone, color: DEEP, sides: 5 } as any);
    // pale blade rising from root
    const rootTop: [number, number, number] = [base[0], base[1] + 0.12 * sc, base[2] + lean * 0.12 * sc];
    b.spike(rootTop, [0, 1, lean * 1.4], 0.42 * sc + 0.06, 0.058 * sc, { bone, color: PALE });
    // small side flanking blades
    for (const s of [1, -1]) {
      b.spike([base[0] + s * 0.07 * sc, base[1], base[2]], [s * 0.5, 1, lean], 0.2 * sc + 0.03, 0.03 * sc, {
        bone, color: PALE,
      });
    }
    // bronze collar at the base on the larger ones
    if (i < 5)
      b.part(new THREE.TorusGeometry(0.075 * sc, 0.014 * sc + 0.004, 4, 8), BRONZE, {
        bone, at: [base[0], base[1] + 0.02, base[2]], rotation: [90, 0, 0],
      });
  });
  void frame;
}
    return addLegArmorBones;
  })(),
);
