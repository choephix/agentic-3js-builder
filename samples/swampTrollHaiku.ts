import * as THREE from "three";
import type { Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, rgb, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, heavy-shouldered swamp troll about 2.8 m tall: teal warty skin with red war paint, a lime-dyed reed mohawk, ivory tusks and fangs, glowing yellow eyes, and bone fetishes on bead cords, straps, wrist and ankle bands and shoulder spurs, standing in a mud puddle with reeds and lily pads.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// ---- palette: saturated swamp teal, war red, bone ivory, hide and mud browns
const SKIN_D = rgb("#123f3d");
const SKIN_SH = rgb("#1d5157");
const SKIN_M = rgb("#2f7d69");
const SKIN_L = rgb("#64b380");
const SKIN_H = rgb("#c6ef9c");
const WART = rgb("#1f4632");
const WAR = rgb("#cc4a2a");
const HAIR_D = rgb("#1b2410");
const HAIR_L = rgb("#55721f");
const LIME = rgb("#b5e54c");
const IVORY_D = rgb("#c4aa78");
const IVORY_L = rgb("#f7edd4");
const BONE_D = rgb("#86724f");
const BONE_L = rgb("#e9dec0");
const HIDE_D = rgb("#3a2112");
const HIDE_L = rgb("#8a5530");
const MUD_D = rgb("#2a1e12");
const MUD_L = rgb("#6e5330");
const SLIME = rgb("#93bb3e");

const EYE = "#ffe04a";
const SOCKET = "#0b130e";
const INK = "#15100c";
const MOUTH = "#1f0f0d";
const IRON = "#8b9598";
const CORD = "#5b4327";

// ---- shading helpers
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lightDot = (n: Vector3) => (0.35 * n.x + 0.8 * n.y + 0.5 * n.z) / 1.006;

/** Hand-painted tone: a shadow gradient on the far side and a warm glint on the lit top. */
function tone(c: Rgb, n: Vector3, glint = 0.3): Rgb {
  const d = lightDot(n);
  const k = 0.5 + 0.55 * smoothstep(-0.5, 0.7, d);
  const g = glint * smoothstep(0.6, 0.95, d);
  return [clamp(c[0] * k + g), clamp(c[1] * k + g), clamp(c[2] * k + g)];
}

/** Troll skin: mottled teal, cool shadow side, lime glints on the lit tops, dark warts. */
function skinAt(p: Vector3, n: Vector3): Rgb {
  const broad = noise(p, 0.2, 3);
  const fine = noise(p, 0.04, 7);
  let c = mix(SKIN_M, SKIN_L, smoothstep(0.3, 0.7, broad));
  c = mix(c, SKIN_D, 0.5 * smoothstep(0.55, 0.8, fine));
  const d = lightDot(n);
  c = mix(SKIN_SH, c, smoothstep(-0.4, 0.2, d));
  c = mix(c, SKIN_H, 0.5 * smoothstep(0.55, 0.9, d) * smoothstep(0.4, 0.7, broad));
  const w = cells(p, 0.06, 11);
  if (w.d1 < 0.1 && w.id > 0.7) c = mix(c, WART, 0.9);
  return c;
}

const mudAt = (p: Vector3): Rgb => mix(MUD_D, MUD_L, smoothstep(0.3, 0.7, noise(p, 0.06, 21)));

const SKIN = paint((p, n) => skinAt(p, n));
const LEG = paint((p, n) =>
  mix(skinAt(p, n), tone(mudAt(p), n, 0.04), smoothstep(0.42, 0.14, p.y + 0.06 * noise(p, 0.12, 4))),
);
const HEAD = paint((p, n) => {
  // a red war slash across the cheeks, on the front of the face only
  const face = smoothstep(0.3, 0.55, n.z) * smoothstep(0.35, 0.5, p.z);
  const slash = 1 - smoothstep(0.006, 0.014, Math.abs(p.y - (2.42 - 0.35 * p.x)));
  return mix(skinAt(p, n), WAR, face * slash);
});
const TORSO = paint((p, n) => {
  // a slanted red war band across the chest and belly, on the front of the body only
  const front = smoothstep(0.3, 0.6, n.z) * smoothstep(0.25, 0.4, p.z);
  const band = 1 - smoothstep(0.012, 0.022, Math.abs(p.y - (1.9 - 0.9 * p.x)));
  return mix(skinAt(p, n), WAR, front * band * 0.85);
});
const HAIR = paint((p, n) => {
  const k = p.x * 120 + p.z * 30 + noise(p, 0.03, 2) * 6;
  const f = k - Math.floor(k);
  let c = mix(HAIR_D, HAIR_L, 0.85 * smoothstep(0.25, 0.85, f));
  c = mix(c, LIME, 0.75 * smoothstep(0.5, 0.85, noise(p, 0.05, 8)));
  return tone(c, n, 0.15);
});
const IVORY = paint((p, n) => tone(mix(IVORY_D, IVORY_L, smoothstep(0.35, 0.75, noise(p, 0.012, 6))), n, 0.3));
const BONE = paint((p, n) => {
  const crack = 1 - smoothstep(0.0, 0.025, Math.abs(noise(p, 0.025, 15) - 0.5));
  const c = mix(mix(BONE_D, BONE_L, smoothstep(0.35, 0.7, noise(p, 0.03, 8))), BONE_D, 0.7 * crack);
  return tone(c, n, 0.25);
});
const HIDE = paint((p, n) => tone(mix(HIDE_D, HIDE_L, smoothstep(0.35, 0.65, noise(p, 0.05, 12))), n, 0.1));
const PUDDLE = paint((p, n) => tone(mix(mudAt(p), SLIME, 0.6 * smoothstep(0.5, 0.7, noise(p, 0.25, 30))), n, 0.12));

// ---- textures
const MOSS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
  <path d="M24 64 C18 42 6 30 2 10 C16 24 20 34 24 46 C28 30 34 20 46 4 C42 30 32 44 24 64Z" fill="#5c9a2a"/>
  <path d="M24 64 C22 46 16 36 12 22 C22 34 24 42 24 52 C26 42 30 34 38 26 C34 42 28 52 24 64Z" fill="#a4d24a"/>
</svg>`,
  { size: 128 },
);
const REED = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64">
  <path d="M7 64 L5 0 L8 14 L9 0 L11 64Z" fill="#8fb13a"/>
  <path d="M9 64 L9 8 L10.5 64Z" fill="#5f8a22"/>
</svg>`,
  { size: 128 },
);
const PAD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 32 L60 32 A28 28 0 1 1 32 4 Z" fill="#4f9d3c"/>
  <path d="M32 32 L40 40" stroke="#2f6b25" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

// ---- geometry and profile helpers
const sphere = (r: number, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);
const bead = (len: number, r: number) => new THREE.CapsuleGeometry(r, len, 3, 6);

type Key = readonly [number, number];
/** Smooth piecewise profile through (t, value) keys. */
function profile(keys: readonly Key[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i];
      const [t0, v0] = keys[i - 1];
      if (t <= t1) return v0 + (v1 - v0) * smoothstep(0, 1, (t - t0) / (t1 - t0));
    }
    return keys[keys.length - 1][1];
  };
}

const TORSO_RX = profile([[0, 0.2], [0.2, 0.22], [0.45, 0.3], [0.72, 0.34], [0.9, 0.3], [1, 0.22]]);
const TORSO_RY = profile([[0, 0.17], [0.2, 0.2], [0.45, 0.23], [0.72, 0.25], [0.9, 0.2], [1, 0.16]]);
const ARM_R = profile([[0, 0.13], [0.2, 0.135], [0.38, 0.105], [0.55, 0.12], [0.73, 0.085], [0.9, 0.09], [1, 0.08]]);
const LEG_R = profile([[0, 0.17], [0.2, 0.165], [0.43, 0.115], [0.6, 0.13], [0.79, 0.08], [0.9, 0.075], [1, 0.07]]);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });

  // ---- skeleton: hunched spine, long neck, forward head, long arms, digitigrade legs
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.06, 0],
      [0, 1.36, 0.02],
      [0, 1.7, 0.08],
      [0, 2.0, 0.14],
    ]),
    { parent: hips, names: ["waist", "chest", "shoulders"], role: "spine" },
  );
  const waist = spine.joints[0];
  const chest = spine.joints[1];
  const shoulders = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.0, 0.14],
      [0, 2.19, 0.22],
      [0, 2.38, 0.3],
    ]),
    { parent: shoulders, names: ["neckLo", "neckHi"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.38, 0.3], aim: [0, 2.6, 0.42], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.02, forward: -0.04 }),
    aim: head.local({ up: -0.12, forward: 0.2 }),
    role: "jaw",
  });

  // ---- torso: one tube over the spine, a potbelly, a hunch, pecs and traps
  const torso = b.sweep(spine, (t): [number, number] => [TORSO_RX(t), TORSO_RY(t)], { color: TORSO, sides: 12 });
  const skin = b.surface(torso);
  b.part(sphere(1, 18, 12), SKIN, { bone: waist, at: [0, 1.36, 0.1], scale: [0.25, 0.22, 0.21] }); // potbelly
  b.part(sphere(1, 16, 12), SKIN, { bone: shoulders, at: [0, 1.85, -0.12], scale: [0.27, 0.2, 0.18] }); // upper-back hump
  b.part(sphere(1, 16, 12), SKIN, { bone: hips, at: [0, 1.06, -0.07], scale: [0.25, 0.17, 0.21] }); // seat
  b.part(sphere(1, 16, 12), SKIN, { bone: shoulders, at: [0, 2.08, 0.1], scale: [0.27, 0.15, 0.21] }); // traps
  for (const s of [1, -1]) {
    b.part(sphere(1, 14, 10), SKIN, { bone: chest, at: [s * 0.16, 1.7, 0.29], scale: [0.17, 0.095, 0.075] }); // pecs
    b.part(sphere(1, 14, 10), SKIN, { bone: shoulders, at: [s * 0.33, 1.95, 0.1], scale: [0.2, 0.17, 0.2] }); // pauldrons
  }

  // dorsal bone spikes down the back
  for (const t of [0.28, 0.44, 0.6, 0.76, 0.9]) {
    const p = torso.at(t, 0);
    b.spike(p, p, 0.075 - 0.02 * t, 0.03, { color: BONE });
  }

  // bone spurs swept up and out from each shoulder
  for (const s of [1, -1]) {
    const spurs = [
      [
        [s * 0.3, 2.02, 0.02],
        [s * 0.44, 2.14, 0.0],
        [s * 0.52, 2.32, -0.06],
      ],
      [
        [s * 0.34, 1.99, 0.14],
        [s * 0.5, 2.06, 0.15],
        [s * 0.6, 2.16, 0.18],
      ],
      [
        [s * 0.32, 1.92, 0.24],
        [s * 0.46, 1.94, 0.26],
        [s * 0.56, 1.99, 0.34],
      ],
    ];
    for (const [a, c, e] of spurs) {
      b.sweep(bezier(a, c, e), [0.034, 0.004], {
        bone: shoulders,
        color: IVORY,
        caps: { start: "round", end: "point" },
      });
    }
  }

  // ---- head: heavy brow, war-painted skull, broad nose, tusks, fangs, mohawk
  b.part(sphere(1, 22, 16), HEAD, { bone: head, at: head.local({ up: 0.14, forward: 0.03 }), scale: [0.22, 0.205, 0.225] });
  b.sweep(
    catmull([
      head.local({ left: 0.21, up: 0.1, forward: 0.13 }),
      head.local({ left: 0.13, up: 0.19, forward: 0.22 }),
      head.local({ left: 0, up: 0.205, forward: 0.255 }),
      head.local({ left: -0.13, up: 0.19, forward: 0.22 }),
      head.local({ left: -0.21, up: 0.1, forward: 0.13 }),
    ]),
    (t) => 0.04 + 0.018 * Math.sin(Math.PI * t),
    { bone: head, color: HEAD, sides: 8 },
  );
  for (const s of [1, -1]) {
    const at = (left: number, up: number, forward: number) => head.local({ left: s * left, up, forward });
    // dark socket set back behind the eye, so the glowing eye sits proud of it
    b.part(sphere(1, 10, 8), SOCKET, { bone: head, at: at(0.09, 0.125, 0.165), scale: [0.08, 0.07, 0.035] });
    glow(b.part(sphere(1, 10, 8), EYE, { bone: head, at: at(0.09, 0.125, 0.2), scale: [0.042, 0.042, 0.032] }), 1.3);
    b.part(sphere(1, 6, 4), INK, { bone: head, at: at(0.09, 0.125, 0.23), scale: [0.011, 0.028, 0.009] });
    b.part(sphere(1, 8, 6), SOCKET, { bone: head, at: at(0.03, 0.035, 0.29), scale: [0.016, 0.013, 0.014] }); // nostrils
  }
  b.part(sphere(1, 14, 10), HEAD, { bone: head, at: head.local({ up: 0.06, forward: 0.235 }), scale: [0.06, 0.075, 0.072] });
  b.part(sphere(1, 12, 8), MOUTH, { bone: head, at: head.local({ up: -0.02, forward: 0.21 }), scale: [0.13, 0.022, 0.045] });
  for (const x of [-0.045, -0.015, 0.015, 0.045]) {
    b.spike(head.local({ left: x, up: -0.01, forward: 0.21 }), head.local({ left: x, up: -0.05, forward: 0.215 }), null, 0.008, {
      color: IVORY,
      bone: head,
    });
  }
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.08, up: 0.0, forward: 0.2 }), head.local({ left: s * 0.085, up: -0.08, forward: 0.21 }), null, 0.015, {
      color: IVORY,
      bone: head,
    });
    b.extrude(
      [
        [0.07, -0.04],
        [-0.03, 0.02],
        [-0.16, 0.1, "sharp"],
        [-0.1, -0.02],
        [-0.04, -0.05],
      ],
      { at: head.local({ left: s * 0.21, up: 0.1, forward: -0.03 }), bone: head, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: HEAD },
    );
    b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), BONE, {
      bone: head,
      at: head.local({ left: s * 0.22, up: -0.03, forward: 0.0 }),
      rotation: [0, 90, 0],
    });
  }
  // lower tusks rising from the jaw corners, outside the cheeks
  for (const s of [1, -1]) {
    const tusk = bezier(
      jaw.local({ left: s * 0.12, up: -0.02, forward: 0.15 }),
      jaw.local({ left: s * 0.2, up: 0.06, forward: 0.24 }),
      jaw.local({ left: s * 0.2, up: 0.22, forward: 0.2 }),
    );
    b.sweep(tusk, [0.04, 0.007], { bone: jaw, color: IVORY, caps: { start: "round", end: "point" }, sides: 8 });
  }
  b.part(sphere(1, 16, 12), SKIN, { bone: jaw, at: jaw.local({ up: -0.05, forward: 0.1 }), scale: [0.17, 0.1, 0.17] });
  b.part(sphere(1, 12, 8), SKIN, { bone: jaw, at: jaw.local({ up: -0.04, forward: 0.2 }), scale: [0.1, 0.085, 0.08] });

  // mohawk: a tall spiked fin of lime-dyed reed hair over the skull, with two bone stakes through it
  const mohawk = b.extrude(
    [
      [0.24, 0.0],
      [0.22, 0.1],
      [0.16, 0.24, "sharp"],
      [0.1, 0.14],
      [0.05, 0.34, "sharp"],
      [-0.02, 0.16],
      [-0.1, 0.44, "sharp"],
      [-0.17, 0.2],
      [-0.25, 0.32, "sharp"],
      [-0.3, 0.0],
    ],
    { at: head.local({ up: 0.06, forward: 0.0 }), bone: head, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.14, bevel: 0.025, color: HAIR },
  );
  b.rod(head.local({ left: 0.11, up: 0.3, forward: -0.1 }), head.local({ left: -0.11, up: 0.28, forward: -0.1 }), 0.011, {
    bone: head,
    color: BONE,
  });
  b.rod(head.local({ left: 0.1, up: 0.36, forward: 0.05 }), head.local({ left: -0.1, up: 0.34, forward: 0.05 }), 0.01, {
    bone: head,
    color: BONE,
  });
  const crest = b.surface(mohawk).scatter(26, { rng: rng(12), minDist: 0.05, filter: (h) => h.n.y > 0.3 || Math.abs(h.n.z) > 0.6 });
  b.cards(crest, REED, { size: [0.05, 0.13], lean: 30, vary: 0.3, rng: rng(13) });

  // ---- arms: long, heavy, bone-banded, with four-fingered hands and claws
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.28, 1.97, 0.12],
        [s * 0.5, 1.6, 0.22],
        [s * 0.62, 1.22, 0.32],
        [s * 0.64, 0.92, 0.42],
      ]),
      { parent: shoulders, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, ARM_R, { color: SKIN, sides: 10 });
    const elbow = arm.joints[1];
    b.part(sphere(1, 12, 8), SKIN, { bone: elbow, at: [s * 0.5, 1.6, 0.2], scale: [0.12, 0.12, 0.12] });
    b.spike([s * 0.5, 1.64, 0.14], [0, 0.4, -1], 0.13, 0.03, { color: BONE, bone: elbow });

    const H = arm.tip!;
    b.part(sphere(1, 14, 10), SKIN, { bone: H, at: [s * 0.64, 1.0, 0.4], scale: [0.11, 0.13, 0.1] });
    for (const x of [-0.075, -0.025, 0.025, 0.075]) {
      const top = H.local({ left: x, up: 0.07, forward: -0.02 });
      const tip = H.local({ left: x * 1.1, down: 0.14, forward: 0.07 });
      b.capsule(top, tip, [0.034, 0.024], { bone: H, color: SKIN, sides: 6 });
      b.spike(tip, H.local({ left: x * 1.15, down: 0.2, forward: 0.13 }), null, 0.012, { color: IVORY, bone: H });
    }
    const thumbTop = H.local({ left: s * 0.1, up: 0.03, forward: -0.03 });
    const thumbTip = H.local({ left: s * 0.15, down: 0.07, forward: 0.09 });
    b.capsule(thumbTop, thumbTip, [0.036, 0.026], { bone: H, color: SKIN, sides: 6 });
    b.spike(thumbTip, H.local({ left: s * 0.17, down: 0.1, forward: 0.12 }), null, 0.012, { color: IVORY, bone: H });

    // bone-bead bracelets on the upper arm and wrist, on leather cords
    const band = b.ring(arm.at(0.2), { count: 10, radius: 0.142 });
    b.sweep(catmull(band.items, { closed: true }), 0.012, { color: HIDE, sides: 6 });
    for (const it of band.items) b.part(bead(0.03, 0.012), BONE, { frame: it });
    const cuff = b.ring(arm.at(0.73), { count: 9, radius: 0.095 });
    b.sweep(catmull(cuff.items, { closed: true }), 0.011, { color: HIDE, sides: 6 });
    for (const it of cuff.items) b.part(sphere(0.02, 8, 6), BONE, { frame: it });
  }

  // ---- legs: thick thighs, forward knees, hocks, three-toed clawed feet
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.2, 1.08, -0.02],
        [s * 0.24, 0.58, 0.2],
        [s * 0.25, 0.2, -0.06],
        [s * 0.25, 0.1, 0.18],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(leg, LEG_R, { color: LEG, sides: 10 });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const F = leg.tip!;
    b.part(sphere(1, 14, 10), LEG, { bone: knee, at: [s * 0.24, 0.6, 0.22], scale: [0.13, 0.12, 0.12] });
    b.part(sphere(1, 10, 8), LEG, { bone: ankle, at: [s * 0.25, 0.2, -0.07], scale: [0.09, 0.08, 0.09] });
    b.part(sphere(1, 14, 10), LEG, { bone: F, at: [s * 0.25, 0.07, 0.11], scale: [0.12, 0.07, 0.2] });
    for (const x of [-0.075, 0, 0.075]) {
      const a = F.local({ left: x, forward: -0.04 });
      const e = F.local({ left: x * 1.15, down: 0.06, forward: 0.13 });
      b.capsule(a, e, [0.04, 0.03], { bone: F, color: LEG, sides: 6 });
      b.spike(e, F.local({ left: x * 1.2, down: 0.09, forward: 0.22 }), null, 0.014, { color: IVORY, bone: F });
    }
    const anklet = b.ring(leg.at(0.84), { count: 8, radius: 0.092 });
    b.sweep(catmull(anklet.items, { closed: true }), 0.011, { color: HIDE, sides: 6 });
    for (const it of anklet.items) b.part(bead(0.03, 0.011), BONE, { frame: it });
  }

  // ---- loincloth of hide, bone-studded belt with a skull buckle
  const flap = b.extrude(
    [
      [-0.18, 0.04],
      [0.18, 0.04],
      [0.19, -0.24],
      [0.1, -0.4],
      [0.02, -0.3],
      [-0.05, -0.44, "sharp"],
      [-0.13, -0.32],
      [-0.2, -0.24],
    ],
    { at: hips.local({ forward: 0.23, up: 0.16 }), bone: hips, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: HIDE },
  );
  for (const [u, v] of [
    [-0.14, -0.02],
    [0.14, -0.02],
    [-0.16, -0.22],
    [0.16, -0.22],
  ]) {
    b.part(sphere(0.011, 6, 4), IRON, { bone: hips, at: flap.local([u, v, 0.02]) });
  }
  b.extrude(
    [
      [-0.15, 0.04],
      [0.15, 0.04],
      [0.13, -0.3],
      [0, -0.36, "sharp"],
      [-0.13, -0.3],
    ],
    { at: hips.local({ back: 0.2, up: 0.14 }), bone: hips, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.007, color: HIDE },
  );
  const belt = skin.loop(spine.at(0.12), { lift: 0.012 });
  b.sweep(belt, (): [number, number] => [0.036, 0.016], { section: "box", color: HIDE });
  b.along(belt, 14, (at) => {
    b.part(sphere(0.011, 6, 4), IRON, { frame: at });
  });
  const buckle = skin.nearest([0, 1.17, 0.25]);
  b.stick(new THREE.BoxGeometry(0.11, 0.024, 0.08), BONE, buckle, { embed: 0.3 });
  b.stick(sphere(0.026, 10, 8), IVORY, buckle.moved([0, 0.012, 0]), { embed: 0.2 });

  // ---- chest: bead necklace with a skull fetish, and a bone-beaded bandolier strap
  const necklace = skin.drape(
    catmull([
      [0.2, 2.0, 0.22],
      [0.12, 1.92, 0.36],
      [0, 1.86, 0.38],
      [-0.12, 1.92, 0.36],
      [-0.2, 2.0, 0.22],
    ]),
    { lift: 0.012 },
  );
  b.sweep(necklace, 0.011, { color: CORD, sides: 6 });
  b.along(necklace, 11, (at) => {
    b.part(bead(0.026, 0.011), BONE, { frame: at });
  });
  const chestHit = skin.nearest([0, 1.78, 0.45]);
  b.part(sphere(1, 12, 10), IVORY, { frame: chestHit.moved([0, 0.03, 0]), scale: [0.05, 0.056, 0.048] });
  for (const s of [1, -1]) {
    b.part(sphere(0.013, 6, 4), INK, { bone: chest, at: chestHit.local([s * 0.018, 0.08, 0.016]) });
  }
  const strap = skin.drape(
    catmull([
      [0.28, 1.98, 0.2],
      [0.18, 1.72, 0.3],
      [0.03, 1.5, 0.31],
      [-0.12, 1.3, 0.27],
      [-0.22, 1.14, 0.22],
    ]),
    { lift: 0.01 },
  );
  b.sweep(strap, (): [number, number] => [0.03, 0.008], { section: "box", color: HIDE });
  b.along(strap, 7, (at) => {
    b.part(bead(0.03, 0.011), BONE, { frame: at });
  });

  // moss clumps on the shoulder tops
  const mossHits = skin.scatter(28, { rng: rng(5), minDist: 0.12, filter: (h) => h.n.y > 0.45 });
  b.cards(mossHits, MOSS, { size: [0.14, 0.12], lean: 35, vary: 0.3, rng: rng(6) });

  // ---- swamp: a mud puddle under the feet, reeds and lily pads
  const puddle = b.part(new THREE.CylinderGeometry(0.8, 0.84, 0.04, 24), PUDDLE, { bone: hips, at: [0, 0.02, 0] });
  const reedHits = b.surface(puddle).scatter(20, {
    rng: rng(9),
    minDist: 0.14,
    filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.5 && Math.hypot(h.at.x, h.at.z) < 0.75,
  });
  b.cards(reedHits, REED, { size: [0.07, 0.34], vary: 0.3, rng: rng(10) });
  b.cards(
    [
      frame([0.45, 0.045, -0.3], [0, 1, 0]),
      frame([-0.5, 0.045, -0.35], [0, 1, 0]),
      frame([-0.3, 0.045, 0.55], [0, 1, 0]),
      frame([0.5, 0.045, 0.42], [0, 1, 0]),
    ],
    PAD,
    { size: 0.2, lean: 90, flow: [1, 0, 0], mirror: true },
  );

  return b.root;
}
