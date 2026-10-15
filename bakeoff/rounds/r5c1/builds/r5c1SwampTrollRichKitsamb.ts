import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  aim,
  rng,
  bezier,
  catmull,
  limb,
  countershade,
  mottle,
  spots,
  stripes,
  grain,
  svg,
} from "../../../../src/index";
import type { Fill, Joint, JointRef } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, lanky Warcraft-style swamp troll with curved tusks, a flaming red mohawk, bone fetishes, a skull totem and a boiling voodoo cauldron on a mossy bog base.",
};

type V3t = [number, number, number];

const F = 0.1; // top of the swamp base: where the troll's feet stand
const P = (x: number, y: number, z: number): V3t => [x, y + F, z];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

// piecewise-linear radius profile: [t, rx, ry]
function keyed(ks: number[][]): (t: number) => [number, number] {
  return (t) => {
    for (let i = 0; i < ks.length - 1; i++) {
      const a = ks[i];
      const c = ks[i + 1];
      if (t <= c[0] || i === ks.length - 2) {
        const u = Math.min(Math.max((t - a[0]) / (c[0] - a[0]), 0), 1);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    return [ks[0][1], ks[0][2]];
  };
}

// ---------------------------------------------------------------- palette & paints
const SKIN = spots(
  countershade(
    mottle("#4e9b70", "#3c8260", { size: 0.17, seed: 3 }),
    mottle("#93ba8f", "#7ea683", { size: 0.12, seed: 4 }),
    { level: -0.3 },
  ),
  "#2c6048",
  { size: 0.1, amount: 0.15, seed: 6 },
);
const SKIN_D = mottle("#3a7a5a", "#2d6449", { size: 0.1, seed: 8 });
const BONE = mottle("#f2e6c0", "#cdb98a", { size: 0.05, seed: 2 });
const LEATHER = grain("#7a4b2a", "#4f301a", { size: 0.03, axis: "y" });
const CLOTH = stripes("#8d2f3f", "#e2b24c", { size: 0.07, axis: "x", width: 0.25, wobble: 0.3, seed: 1 });
const WOOD = grain("#80563a", "#573a22", { size: 0.03, axis: "y" });
const IRON = grain("#3d3c47", "#25242c", { size: 0.04, axis: "y" });
const MUD = mottle(mottle("#5b4529", "#3e3120", { size: 0.2, seed: 2 }), "#587a2e", { size: 0.35, seed: 9, contrast: 1.3 });
const STONE = countershade("#66902f", mottle("#85897c", "#62665c", { size: 0.12, seed: 5 }), { level: 0.35, soft: 0.2 });
const HAIR_A = "#d9411f";
const HAIR_B = "#f08a26";
const HAIR_C = "#a3231a";
const GOLD = "#e0a93a";
const ROPE = "#9a7a42";
const CLAW = "#3a2c22";
const DARK = "#241a14";
const RED = "#b8321f";
const TEAL = "#2cb8a6";
const ROOT_C = "#4a3a24";

export default function build() {
  const b = createBuilder({ name: "swamp_troll" });
  const R = rng(7);

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="M5 22 Q32 4 59 22 Q32 36 5 22Z"/></clipPath>
    <radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff27a"/><stop offset="1" stop-color="#ff9a1a"/></radialGradient></defs>
    <path d="M1 22 Q32 -2 63 22 Q32 40 1 22Z" fill="#1b1013"/>
    <g clip-path="url(#c)">
      <rect width="64" height="40" fill="#ffd62e"/>
      <ellipse cx="32" cy="22" rx="14" ry="14" fill="url(#g)"/>
      <ellipse cx="32" cy="22" rx="3.4" ry="11" fill="#2a0a08"/>
      <path d="M0 4 L64 22 L64 0 L0 0Z" fill="#1b1013"/>
    </g>
    </svg>`,
    { size: 128 },
  );
  const WARPAINT = svg(
    `<svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4 L18 2 L15 40 L1 38Z" fill="#f2ecd8" stroke="#2a1a14" stroke-width="2"/>
    <path d="M23 2 L37 1 L35 41 L21 40Z" fill="#d93a22" stroke="#2a1a14" stroke-width="2"/>
    <path d="M42 3 L56 4 L54 39 L40 40Z" fill="#f2ecd8" stroke="#2a1a14" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const TATTOO = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#143f3c" stroke-width="4" stroke-linecap="round">
      <circle cx="50" cy="50" r="16"/>
      <circle cx="50" cy="50" r="30" stroke-dasharray="6 7"/>
      <path d="M50 4 L50 20 M50 80 L50 96 M4 50 L20 50 M80 50 L96 50 M17 17 L28 28 M72 72 L83 83 M83 17 L72 28 M17 83 L28 72"/>
      <path d="M50 50 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0"/>
    </g>
    <circle cx="50" cy="50" r="5" fill="#b8321f"/>
    </svg>`,
    { size: 256 },
  );
  const REED = svg(
    `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 128 Q6 70 2 4 Q16 60 16 128Z" fill="#6c9b3c"/>
    <path d="M16 128 Q22 60 30 14 Q24 80 22 128Z" fill="#82ad46"/>
    <rect x="13" y="38" width="3" height="90" fill="#5b8530"/>
    <rect x="11.5" y="14" width="6" height="26" rx="3" fill="#5a3a1d"/>
    </svg>`,
    { size: 256 },
  );
  const MOSS = svg(
    `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0 C10 20 28 40 16 60 C6 80 24 100 18 120 C28 100 36 80 26 60 C34 40 14 20 24 0Z" fill="#6f9a3a"/>
    <path d="M8 0 C2 24 14 44 8 70 C14 50 18 30 14 0Z" fill="#4f7a2a"/>
    <path d="M30 0 C26 30 36 50 30 84 C38 56 38 28 36 0Z" fill="#88b04a"/>
    </svg>`,
    { size: 128 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 100 C-4 70 2 25 15 0 C28 25 34 70 15 100Z" fill="#2cb8a6"/>
    <path d="M15 0 C9 12 6 20 5 28 L25 28 C24 20 21 12 15 0Z" fill="#e8762a"/>
    <path d="M15 98 L15 6" stroke="#0e5a52" stroke-width="2.5"/>
    </svg>`,
    { size: 128 },
  );
  const LILY = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 32 L58 17 A30 30 0 1 1 47 6 Z" fill="#4f9a3a" stroke="#3a7a2c" stroke-width="2"/>
    <path d="M32 32 L10 20 M32 32 L8 44 M32 32 L30 60" stroke="#3a7a2c" stroke-width="2.5" fill="none"/>
    <circle cx="26" cy="38" r="5" fill="#f08ab0"/>
    </svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="60" height="60" rx="8" fill="#0b1a16" stroke="#3a2a1a" stroke-width="3"/>
    <g stroke="#5dffb4" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M20 12 L20 52 M20 22 L36 32 L20 42"/>
      <path d="M44 12 L44 40 M34 52 L44 42 L54 52"/>
      <circle cx="32" cy="32" r="4"/>
    </g>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, F, 0] });
  const hips = b.joint("hips", { parent: root, at: P(0, 1.1, -0.08), dir: [0, 1, 0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([P(0, 1.1, -0.08), P(0, 1.4, -0.03), P(0, 1.7, 0.1), P(0, 1.98, 0.27)]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([P(0, 1.96, 0.26), P(0, 2.05, 0.38), P(0, 2.12, 0.5)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: P(0, 2.12, 0.5), dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 2.14, 0.5), aim: P(0, 2.09, 0.7), role: "jaw" });

  // ------------------------------------------------------------ helpers
  const blob = (color: Fill, bone: JointRef, at: THREE.Vector3 | V3t, scale: V3t, rotation?: V3t) =>
    b.part(sph(), color, { bone, at, scale, flat: true, ...(rotation ? { rotation } : {}) });

  function femur(a: THREE.Vector3, c: THREE.Vector3, r: number, bone: JointRef) {
    b.rod(a, c, r, BONE, { bone });
    const d = c.clone().sub(a).normalize();
    const side = d.clone().cross(V(0, 0, 1));
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    side.normalize();
    for (const p of [a, c])
      for (const k of [-1, 1])
        b.part(sph(6, 4), BONE, {
          bone,
          at: p.clone().addScaledVector(side, k * r * 0.9),
          scale: [r * 1.5, r * 1.5, r * 1.5],
          flat: true,
        });
  }

  function skull(at: THREE.Vector3, dir: V3t, s: number, bone: JointRef, glowEyes: boolean) {
    const q = aim(dir, [0, 1, 0], "z");
    const W = (x: number, y: number, z: number) => V(x * s, y * s, z * s).applyQuaternion(q).add(at);
    b.part(sph(8, 6), BONE, { bone, quat: q, flat: true, at: W(0, 0.1, -0.05), scale: [0.85 * s, 0.8 * s, 0.95 * s] });
    b.part(new THREE.BoxGeometry(0.55 * s, 0.45 * s, 0.75 * s), BONE, { bone, quat: q, flat: true, at: W(0, -0.55, 0.45) });
    b.part(new THREE.BoxGeometry(0.5 * s, 0.18 * s, 0.6 * s), BONE, { bone, quat: q, flat: true, at: W(0, -0.92, 0.3) });
    b.part(new THREE.BoxGeometry(0.46 * s, 0.07 * s, 0.05 * s), DARK, { bone, quat: q, at: W(0, -0.78, 0.84) });
    b.part(new THREE.BoxGeometry(0.16 * s, 0.18 * s, 0.05 * s), DARK, { bone, quat: q, at: W(0, -0.36, 0.84) });
    for (const k of [-1, 1]) {
      const eye = b.part(sph(6, 4), glowEyes ? "#7bffa0" : DARK, {
        bone,
        quat: q,
        flat: true,
        at: W(k * 0.32, 0.05, 0.78),
        scale: [0.22 * s, 0.22 * s, 0.14 * s],
      });
      if (glowEyes) glow(eye, 1.3);
    }
  }

  // ------------------------------------------------------------ torso
  const torso = b.sweep(
    spine,
    keyed([
      [0, 0.2, 0.17],
      [0.25, 0.21, 0.19],
      [0.55, 0.25, 0.21],
      [0.82, 0.34, 0.22],
      [1, 0.27, 0.17],
    ]),
    { color: SKIN },
  );
  const ts = b.surface(torso);
  const front = (x: number, y: number) => ts.ray([x, y + F, 2], [0, 0, -1])!;

  blob(SKIN, hips, P(0, 1.1, -0.05), [0.23, 0.18, 0.2]); // pelvis
  blob(SKIN, chest, P(0, 2.0, 0.08), [0.3, 0.17, 0.2]); // trapezius hump
  for (const s of [1, -1]) {
    const pec = front(s * 0.14, 1.83);
    b.stick(sph(), SKIN, pec, { embed: 0.45, scale: [0.14, 0.09, 0.1], flat: true });
  }
  b.decal(torso, TATTOO, { at: front(0, 1.52), dir: [0, 0.12, 1], size: [0.3, 0.3] });

  // neck
  const neckSweep = b.sweep(neck, [0.15, 0.12], { color: SKIN });

  // ------------------------------------------------------------ head
  const cranium = b.part(sph(10, 8), SKIN, {
    bone: head,
    at: P(0, 2.245, 0.48),
    scale: [0.17, 0.155, 0.175],
    flat: true,
  });
  b.frustumBox(P(0, 2.155, 0.5), P(0, 2.14, 0.74), [0.22, 0.09], [0.2, 0.085], { bone: head, color: SKIN });
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.2), DARK, { bone: head, at: P(0, 2.115, 0.62) });
  b.frustumBox(P(0, 2.095, 0.52), P(0, 2.085, 0.75), [0.2, 0.07], [0.2, 0.085], { bone: jaw, color: SKIN });
  blob(SKIN, jaw, P(0, 2.08, 0.75), [0.09, 0.05, 0.05]);
  for (const k of [-1, 1]) {
    b.spike(P(k * 0.045, 2.11, 0.73), [0, 1, 0.2], 0.04, 0.012, { bone: jaw, color: BONE });
    b.spike(P(k * 0.06, 2.135, 0.72), [0, -1, 0], 0.03, 0.01, { bone: head, color: BONE });
  }
  // nose
  b.sweep(bezier(P(0, 2.26, 0.64), P(0, 2.27, 0.8), P(0, 2.14, 0.8)), [0.05, 0.032], { bone: head, color: SKIN });
  for (const k of [-1, 1]) blob(DARK, head, P(k * 0.024, 2.122, 0.79), [0.012, 0.012, 0.012]);
  b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 10), GOLD, { bone: head, at: P(0, 2.115, 0.81), dir: [1, 0, 0], axis: "z", flat: true });

  for (const s of [1, -1]) {
    // brow ridge & eyes & war paint
    b.capsule(P(s * 0.14, 2.325, 0.6), P(s * 0.015, 2.29, 0.665), 0.03, SKIN, { bone: head });
    glow(
      b.decal(cranium, EYE, {
        at: P(s * 0.075, 2.265, 0.62),
        dir: [s * 0.3, 0, 1],
        size: [0.092, 0.058],
        mirror: s > 0,
      }),
      1.2,
    );
    b.decal(cranium, WARPAINT, {
      at: P(s * 0.11, 2.215, 0.53),
      dir: [s * 0.8, -0.1, 0.55],
      size: [0.09, 0.07],
      mirror: s > 0,
    });

    // tusks
    const tpath = bezier(P(s * 0.085, 2.08, 0.7), P(s * 0.125, 2.15, 0.83), P(s * 0.1, 2.3, 0.79));
    b.sweep(tpath, [0.032, 0.004], { bone: jaw, color: BONE, caps: { start: "flat", end: "point" }, sides: 7 });
    b.part(new THREE.TorusGeometry(0.027, 0.007, 5, 9), GOLD, {
      bone: jaw,
      at: tpath.at(0.22),
      dir: tpath.tangentAt(0.22),
      axis: "z",
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 9), RED, {
      bone: jaw,
      at: tpath.at(0.38),
      dir: tpath.tangentAt(0.38),
      axis: "z",
      flat: true,
    });

    // ears
    const ear = b.extrude(
      [
        [0, -0.04],
        [0.1, -0.03],
        [0.36, 0.2, "sharp"],
        [0.14, 0.1],
        [0, 0.1],
      ],
      {
        at: P(s * 0.145, 2.26, 0.44),
        x: [s * 0.7, 0.15, -0.7],
        y: [0, 1, 0],
        thickness: 0.025,
        color: SKIN,
        bone: head,
      },
    );
    for (const [u, v] of [
      [0.03, -0.04],
      [0.075, -0.035],
    ])
      b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 9), GOLD, { bone: head, at: ear.local([u, v, 0]), quat: ear.quat, flat: true });
    b.part(sph(5, 4), GOLD, { bone: head, at: ear.local([0.15, 0.03, 0.014]), scale: 0.011, flat: true });
  }

  // mohawk
  const mohawkPath = catmull([
    P(0, 2.31, 0.6),
    P(0, 2.385, 0.5),
    P(0, 2.37, 0.38),
    P(0, 2.29, 0.3),
    P(0, 2.2, 0.24),
    P(0, 2.19, 0.13),
    P(0, 2.17, 0.0),
    P(0, 2.05, -0.1),
  ]);
  const mohawk = b.sweep(mohawkPath, 0.04, { bone: [head, neck, spine], color: "#8a1f16" });
  const HAIRS = [HAIR_A, HAIR_B, HAIR_C];
  let hi = 0;
  b.along(mohawk, 16, (at) => {
    const t = at.t;
    const d = V(0, 1, -0.15 - 0.7 * t).normalize();
    const len = 0.13 + 0.14 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + R() * 0.04;
    b.spike(at, d, len, 0.034, { color: HAIRS[hi++ % 3] });
    for (const sx of [-1, 1])
      b.spike(at.at.clone().add(V(sx * 0.03, -0.01, 0)), V(sx * 0.35, 1, d.z).normalize(), len * 0.7, 0.026, {
        color: HAIRS[hi++ % 3],
      });
  });

  // neck collar of fangs
  const collar = ns_loop();
  function ns_loop() {
    const ns = b.surface(neckSweep);
    return ns.loop(neck.at(0.3), { lift: 0.022 });
  }
  b.sweep(collar, 0.02, { color: ROPE });
  b.along(collar, 10, (at) => {
    b.spike(at, [0, -1, 0.3], 0.06, 0.016, { color: BONE });
  });

  // chest necklace with skull pendant
  const chain = ts.drape(
    catmull([P(-0.17, 2.05, 0.2), P(-0.22, 1.88, 0.4), P(-0.1, 1.7, 0.5), P(0.1, 1.7, 0.5), P(0.22, 1.88, 0.4), P(0.17, 2.05, 0.2)]),
    { lift: 0.03 },
  );
  b.sweep(chain, 0.012, { color: ROPE });
  let ni = 0;
  b.along(chain, 7, (at) => {
    const i = ni++;
    if (i === 3) {
      skull(at.at.clone().add(V(0, -0.05, 0.05)), [0, -0.2, 1], 0.065, chest, false);
    } else if (i % 2 === 0) {
      b.spike(at, [0, -1, 0.2], 0.08, 0.018, { color: BONE });
    } else {
      b.part(sph(6, 4), i % 4 === 1 ? TEAL : RED, { at: at.at, scale: 0.025, flat: true });
    }
  });

  // ------------------------------------------------------------ arms & hands
  function hand(s: number, S: string, wJ: Joint, wrist: THREE.Vector3, elbow: THREE.Vector3) {
    const D = wrist.clone().sub(elbow).normalize();
    const X = V(1, 0, 0);
    const Z = V(0, 0, 1);
    b.part(new THREE.BoxGeometry(0.17, 0.15, 0.08), SKIN_D, {
      bone: wJ,
      at: wrist.clone().addScaledVector(D, 0.085),
      dir: D,
      flat: true,
    });
    for (let i = 0; i < 4; i++) {
      const u = (i - 1.5) * 0.042;
      const p0 = wrist.clone().addScaledVector(D, 0.15).addScaledVector(X, u);
      const p1 = p0.clone().addScaledVector(D, 0.1).addScaledVector(X, u * 0.35).addScaledVector(Z, 0.02);
      const p2 = p1.clone().addScaledVector(D, 0.085).addScaledVector(X, u * 0.3).addScaledVector(Z, 0.05);
      const ch = b.chain(`finger${i + 1}${S}`, catmull([p0, p1, p2]), { parent: wJ, role: "digit" });
      b.sweep(ch, [0.026, 0.016], { color: SKIN_D, sides: 6 });
      b.spike(p2, p2.clone().sub(p1).normalize().add(V(0, 0, 0.3)), 0.07, 0.017, { bone: ch.joints[1], color: CLAW });
    }
    const t0 = wrist.clone().addScaledVector(D, 0.07).addScaledVector(X, -s * 0.08).addScaledVector(Z, 0.02);
    const t1 = t0.clone().addScaledVector(D, 0.07).addScaledVector(X, -s * 0.04).addScaledVector(Z, 0.045);
    const t2 = t1.clone().addScaledVector(D, 0.05).addScaledVector(X, -s * 0.015).addScaledVector(Z, 0.05);
    const th = b.chain(`thumb${S}`, catmull([t0, t1, t2]), { parent: wJ, role: "digit" });
    b.sweep(th, [0.03, 0.018], { color: SKIN_D, sides: 6 });
    b.spike(t2, t2.clone().sub(t1).normalize(), 0.06, 0.018, { bone: th.joints[1], color: CLAW });
  }

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = P(s * 0.4, 1.93, 0.18);
    const wr = P(s * 0.6, 0.95, 0.3);
    const pts = limb(sh, wr, [0.55, 0.55], [s * 0.3, 0, -1]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wJ = arm.joints[2];
    b.sweep(arm, [0.13, 0.125, 0.1, 0.115, 0.09], { color: SKIN });
    blob(SKIN, shJ, P(s * 0.42, 1.92, 0.16), [0.16, 0.15, 0.15]);
    // elbow spur
    b.spike(pts[1], [s * 0.4, 0.1, -1], 0.12, 0.03, { bone: elJ, color: BONE });
    // bracer with studs
    const bA = pts[1].clone().lerp(pts[2], 0.45);
    const bC = pts[1].clone().lerp(pts[2], 0.85);
    b.rod(bA, bC, [0.11, 0.09], LEATHER, { bone: elJ });
    b.ring(line(bA, bC), { count: 6, radius: 0.108 }, (it) => b.spike(it, it, 0.045, 0.02, { color: BONE }));
    b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 10), GOLD, {
      bone: elJ,
      at: pts[2].clone().lerp(pts[1], 0.06),
      dir: pts[2].clone().sub(pts[1]),
      axis: "z",
      flat: true,
    });
    hand(s, S, wJ, pts[2], pts[1]);

    // shoulder pad: leather dome, bone spikes, feathers, hanging moss
    const padC = P(s * 0.46, 2.04, 0.14);
    blob(LEATHER, shJ, padC, [0.2, 0.1, 0.18], [0, 0, -s * 25]);
    b.ring(frame(offsetUp(padC, 0.05), [s * 0.4, 1, 0]), { count: 3, radius: 0.07, tilt: 20 }, (it) =>
      b.spike(it, it, 0.2, 0.04, { color: BONE }),
    );
    b.spike(offsetUp(padC, 0.06), [s * 0.3, 1, 0], 0.24, 0.045, { bone: shJ, color: BONE });
    b.part(new THREE.TorusGeometry(0.045, 0.01, 5, 9), GOLD, { bone: shJ, at: offsetUp(padC, 0.1), dir: [s * 0.3, 1, 0], axis: "z", flat: true });
    const hang = [-0.06, 0, 0.06].map((dz) => frame(P(s * 0.6, 1.98, 0.14 + dz), [0, 1, 0]));
    b.cards(hang, FEATHER, { size: [0.06, 0.22], lean: 180, flow: [0, 0, 1], bone: shJ, vary: 0.2, rng: R });
    const mossF = [-0.1, 0.0, 0.1].map((dz) => frame(P(s * 0.4, 1.96, 0.04 + dz), [0, 1, 0]));
    b.cards(mossF, MOSS, { size: [0.08, 0.22], lean: 180, flow: [0, 0, 1], bone: shJ, vary: 0.3, rng: R });

    // ----- legs
    const hipP = P(s * 0.2, 1.1, -0.08);
    const ank = P(s * 0.26, 0.12, 0.0);
    const lp = limb(hipP, ank, [0.46, 0.46, 0.22], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${S}`, lp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`],
      role: "leg",
      contact: P(s * 0.26, 0, 0.1),
    });
    b.sweep(leg, [0.165, 0.14, 0.108, 0.078, 0.062], { color: SKIN });
    const ankJ = leg.joints[3];
    b.spike(lp[1], [0, 0.2, 1], 0.14, 0.035, { bone: leg.joints[1], color: BONE }); // knee spike
    b.spike(lp[2], [0, 0.3, -1], 0.1, 0.03, { bone: leg.joints[2], color: BONE }); // hock spur
    b.part(new THREE.TorusGeometry(0.07, 0.014, 5, 10), GOLD, {
      bone: leg.joints[2],
      at: lp[2].clone().lerp(lp[3], 0.5),
      dir: lp[3].clone().sub(lp[2]),
      axis: "z",
      flat: true,
    });
    // foot
    blob(SKIN_D, ankJ, P(s * 0.26, 0.055, 0.08), [0.1, 0.055, 0.13]);
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.08;
      const x = s * 0.26 + dx;
      const toe = b.chain(
        `toe${i + 1}${S}`,
        catmull([P(x, 0.05, 0.14), P(x, 0.045, 0.24), P(x, 0.04, 0.34)]),
        { parent: ankJ, role: "digit" },
      );
      b.sweep(toe, [0.05, 0.03], { color: SKIN_D, sides: 6 });
      b.spike(P(x, 0.04, 0.34), [0, -0.1, 1], 0.09, 0.025, { bone: toe.joints[1], color: CLAW });
    }
  }

  function offsetUp(p: V3t, d: number): V3t {
    return [p[0], p[1] + d, p[2]];
  }

  // ------------------------------------------------------------ belt, loincloth, fetishes
  const belt = ts.loop(P(0, 1.22, -0.06), { lift: 0.02 });
  b.sweep(belt, 0.032, { color: LEATHER });
  const bh = front(0, 1.22);
  skull(bh.at.clone().add(V(0, 0, 0.05)), [0, 0, 1], 0.07, spine.joints[0], false);

  function flap(at: THREE.Vector3, dirZ: number) {
    b.extrude(
      [
        [-0.17, 0],
        [0.17, 0],
        [0.16, -0.2],
        [0.1, -0.17],
        [0.07, -0.36, "sharp"],
        [0, -0.22],
        [-0.06, -0.38, "sharp"],
        [-0.11, -0.2],
        [-0.16, -0.3, "sharp"],
      ],
      { at, x: [1, 0, 0], y: [0, 1, -0.2 * dirZ], thickness: 0.025, color: CLOTH, bone: spine.joints[0] },
    );
  }
  flap(V(0, bh.at.y - 0.02, bh.at.z + 0.045), 1);
  const bk = ts.ray([0, 1.22 + F, -2], [0, 0, 1])!;
  flap(V(0, bk.at.y - 0.02, bk.at.z - 0.045), -1);
  for (const s of [1, -1]) {
    // side tatters
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0.06, -0.22],
        [0, -0.3, "sharp"],
        [-0.06, -0.2],
      ],
      { at: V(s * 0.2, 1.2 + F, -0.04), x: [0, 0, s], y: [0, 1, 0], thickness: 0.02, color: CLOTH, bone: spine.joints[0] },
    );
  }

  function fetish(a: THREE.Vector3, s: number, kind: number) {
    const bone = spine.joints[0];
    const c1 = a.clone().add(V(0, -0.09, 0.01));
    b.rod(a, c1, 0.006, ROPE, { bone });
    b.part(sph(6, 4), TEAL, { bone, at: a.clone().add(V(0, -0.04, 0.005)), scale: 0.014, flat: true });
    if (kind === 0) {
      const d = V(s * 0.18, -0.95, 0.12).normalize();
      const e = c1.clone().addScaledVector(d, 0.2);
      femur(c1, e, 0.012, bone);
      for (const k of [0.3, 0.55])
        b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 8), RED, { bone, at: c1.clone().addScaledVector(d, 0.2 * k), dir: d, axis: "z", flat: true });
      b.cards([frame(e, [0, 1, 0])], FEATHER, { size: [0.045, 0.16], lean: 180, flow: [0, 0, 1], bone });
    } else {
      skull(c1.clone().add(V(0, -0.05, 0.01)), [0, -0.3, 1], 0.05, bone, false);
      b.cards(
        [-0.03, 0.03].map((dx) => frame(c1.clone().add(V(dx, -0.02, 0)), [0, 1, 0])),
        FEATHER,
        { size: [0.04, 0.14], lean: 180, flow: [0, 0, 1], bone },
      );
    }
  }
  for (const [x, s, kind] of [
    [0.17, 1, 0],
    [-0.17, -1, 1],
  ] as [number, number, number][]) {
    const h = front(x, 1.22);
    fetish(h.at.clone().add(V(0, -0.01, 0.055)), s, kind);
  }

  // chest strap and back bone rack
  b.sweep(ts.loop(P(0, 1.62, 0.08), { lift: 0.02 }), 0.02, { color: ROPE });
  const bp = ts.ray([0, 1.62 + F, -2], [0, 0, 1])!.at.clone();
  skull(bp.clone().add(V(0, 0.14, -0.1)), [0, 0.2, -1], 0.1, chest, false);
  femur(V(bp.x - 0.24, bp.y - 0.12, bp.z - 0.07), V(bp.x + 0.24, bp.y + 0.3, bp.z - 0.07), 0.016, chest);
  femur(V(bp.x + 0.24, bp.y - 0.12, bp.z - 0.09), V(bp.x - 0.24, bp.y + 0.3, bp.z - 0.09), 0.016, chest);
  b.cards(
    [-0.1, 0.1].map((dx) => frame(V(bp.x + dx, bp.y - 0.1, bp.z - 0.1), [0, 1, 0])),
    FEATHER,
    { size: [0.06, 0.24], lean: 180, flow: [0, 0, -1], bone: chest },
  );

  // ------------------------------------------------------------ base: bog
  const bp2 = (geo: THREE.BufferGeometry, color: Fill, at: THREE.Vector3 | V3t, extra: { scale?: V3t | number; dir?: V3t | THREE.Vector3; rotation?: V3t } = {}) =>
    b.part(geo, color, { bone: root, at, flat: true, ...extra });

  b.lathe(
    [
      [0, 0],
      [1.4, 0],
      [1.5, 0.05],
      [1.46, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], bone: root, segments: 14, color: MUD },
  );

  // rim stones
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.2;
    const rr = 1.34 + R() * 0.1;
    const sc = 0.1 + R() * 0.08;
    bp2(new THREE.IcosahedronGeometry(1, 0), STONE, V(Math.cos(a) * rr, F + sc * 0.3, Math.sin(a) * rr), {
      scale: [sc * 1.3, sc * 0.8, sc * 1.1],
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }

  // pool & lily pads
  glow(bp2(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 12), "#3a9a7a", V(-0.62, F + 0.005, 0.68)), 0.4);
  b.cards(
    [
      [-0.7, 0.6],
      [-0.45, 0.8],
      [-0.55, 0.45],
      [-0.78, 0.85],
    ].map(([x, z]) => frame([x, F + 0.02, z], [0, 1, 0])),
    LILY,
    { size: 0.17, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, rng: R, bone: root },
  );

  // reeds & cattails
  for (const [cx, cz] of [
    [-1.25, 0.2],
    [0.3, -1.25],
    [1.25, -0.3],
    [-0.55, -1.15],
    [1.1, 0.25],
  ]) {
    const fr = [];
    for (let i = 0; i < 5; i++) fr.push(frame([cx + (R() - 0.5) * 0.25, F, cz + (R() - 0.5) * 0.25], [0, 1, 0]));
    b.cards(fr, REED, {
      size: [0.14, 0.85],
      lean: 8,
      bend: 25,
      cross: true,
      vary: 0.3,
      spin: 180,
      rng: R,
      bone: root,
      flow: (_f, i) => [Math.cos(i * 2.4), -0.3, Math.sin(i * 2.4)],
    });
  }

  // mushrooms
  for (const [mx, mz, mh, mr] of [
    [0.55, -0.95, 0.16, 0.1],
    [0.72, -0.8, 0.11, 0.07],
    [0.4, -0.78, 0.08, 0.05],
  ]) {
    bp2(new THREE.CylinderGeometry(mr * 0.28, mr * 0.35, mh, 6), "#d9d2b4", V(mx, F + mh / 2, mz));
    glow(
      bp2(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#5ff2c8", V(mx, F + mh, mz), {
        scale: [mr, mr * 0.6, mr],
      }),
      0.8,
    );
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1;
      bp2(sph(5, 4), "#e8fff4", V(mx + Math.cos(a) * mr * 0.5, F + mh + mr * 0.45, mz + Math.sin(a) * mr * 0.5), { scale: mr * 0.14 });
    }
  }

  // mangrove roots
  for (const [p0, p1, p2] of [
    [V(-1.45, F + 0.02, -0.2), V(-1.2, F + 0.2, -0.05), V(-0.95, F + 0.03, 0.1)],
    [V(0.9, F + 0.02, -1.05), V(0.7, F + 0.2, -0.85), V(0.5, F + 0.03, -0.7)],
  ])
    b.sweep(catmull([p0, p1, p2]), [0.06, 0.025], { bone: root, color: ROOT_C });

  // skull & bone pile
  skull(V(-0.2, F + 0.075, 1.05), [0.3, 0.35, 1], 0.09, root, false);
  femur(V(-0.55, F + 0.025, 1.0), V(-0.3, F + 0.025, 1.18), 0.014, root);
  femur(V(0.15, F + 0.025, 0.95), V(0.0, F + 0.025, 1.2), 0.014, root);

  // ------------------------------------------------------------ totem
  const TX = -1.12;
  const TZ = -0.72;
  b.rod(V(TX, F - 0.02, TZ), V(TX, F + 1.7, TZ), [0.085, 0.065], WOOD, { bone: root, sides: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    bp2(new THREE.IcosahedronGeometry(1, 0), STONE, V(TX + Math.cos(a) * 0.17, F + 0.05, TZ + Math.sin(a) * 0.17), {
      scale: [0.08, 0.06, 0.08],
      rotation: [0, a * 57, 0],
    });
  }
  for (const y of [0.35, 0.8, 1.15, 1.5])
    bp2(new THREE.TorusGeometry(0.08 - y * 0.012, 0.016, 5, 10), ROPE, V(TX, F + y, TZ), { dir: [0, 1, 0], axis: "z" });
  skull(V(TX, F + 1.85, TZ + 0.02), [0.15, -0.05, 1], 0.17, root, true);
  for (const s of [1, -1])
    b.sweep(bezier([TX + s * 0.1, F + 1.9, TZ], [TX + s * 0.32, F + 1.95, TZ], [TX + s * 0.38, F + 2.2, TZ]), [0.04, 0.005], {
      bone: root,
      color: BONE,
      caps: { start: "flat", end: "point" },
    });
  b.rod(V(TX - 0.36, F + 1.4, TZ), V(TX + 0.36, F + 1.4, TZ), 0.02, WOOD, { bone: root });
  for (const s of [1, -1]) {
    const ex = TX + s * 0.34;
    b.rod(V(ex, F + 1.4, TZ), V(ex, F + 1.28, TZ), 0.006, ROPE, { bone: root });
    skull(V(ex, F + 1.2, TZ + 0.02), [0, -0.2, 1], 0.06, root, false);
    b.cards([frame(V(ex, F + 1.4, TZ), [0, 1, 0])], FEATHER, { size: [0.07, 0.28], lean: 180, flow: [0, 0, 1], bone: root });
    b.cards([frame(V(ex - s * 0.1, F + 1.4, TZ), [0, 1, 0])], MOSS, { size: [0.08, 0.26], lean: 180, flow: [0, 0, 1], bone: root, vary: 0.3, rng: R });
  }
  glow(
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.02), "#ffffff", { bone: root, at: V(TX, F + 0.95, TZ + 0.085), texture: RUNE }),
    1.2,
  );

  // ------------------------------------------------------------ cauldron & fire
  const CX = 1.0;
  const CZ = 0.75;
  b.lathe(
    [
      [0, 0.02],
      [0.2, 0],
      [0.32, 0.12],
      [0.35, 0.24],
      [0.31, 0.33],
      [0.34, 0.35],
      [0.28, 0.35],
      [0.25, 0.3],
      [0.29, 0.24],
      [0.27, 0.13],
      [0, 0.1],
    ],
    { at: V(CX, F + 0.22, CZ), bone: root, segments: 10, color: IRON },
  );
  glow(bp2(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 10), "#6dff8a", V(CX, F + 0.22 + 0.31, CZ)), 0.9);
  for (const [bx, bz, br] of [
    [0.08, 0.05, 0.035],
    [-0.1, -0.06, 0.028],
    [0.0, -0.12, 0.022],
  ])
    glow(bp2(sph(6, 4), "#b6ffc0", V(CX + bx, F + 0.22 + 0.34, CZ + bz), { scale: br }), 1);
  bp2(new THREE.TorusGeometry(0.3, 0.012, 5, 12, Math.PI), IRON, V(CX, F + 0.22 + 0.35, CZ));
  for (let k = 0; k < 3; k++) {
    const a = k * 2.094 + 0.5;
    b.rod(V(CX + Math.cos(a) * 0.26, F + 0.26, CZ + Math.sin(a) * 0.26), V(CX + Math.cos(a) * 0.38, F, CZ + Math.sin(a) * 0.38), 0.025, IRON, { bone: root });
  }
  for (let k = 0; k < 3; k++) {
    const a = k * 2.094;
    b.rod(
      V(CX + Math.cos(a) * 0.2, F + 0.03, CZ + Math.sin(a) * 0.2),
      V(CX - Math.cos(a) * 0.2, F + 0.06, CZ - Math.sin(a) * 0.2),
      0.03,
      WOOD,
      { bone: root },
    );
  }
  const FL = ["#ff7a1a", "#ffc23a", "#ff5a14"];
  for (let k = 0; k < 5; k++) {
    const a = k * 1.26;
    const rr = k === 0 ? 0 : 0.1;
    glow(
      b.spike(V(CX + Math.cos(a) * rr, F + 0.04, CZ + Math.sin(a) * rr), [Math.cos(a) * 0.15, 1, Math.sin(a) * 0.15], 0.2 + 0.05 * (k % 2), 0.05, {
        bone: root,
        color: FL[k % 3],
        sides: 5,
      }),
      1.3,
    );
  }
  // outward-licking flame tongues, visible around the pot
  for (let k = 0; k < 7; k++) {
    const a = k * 0.898 + 0.3;
    const out = 0.27 + 0.02 * (k % 2);
    glow(
      b.spike(
        V(CX + Math.cos(a) * out, F + 0.03, CZ + Math.sin(a) * out),
        [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4],
        0.3 + 0.07 * (k % 3),
        0.05,
        { bone: root, color: FL[(k + 1) % 3], sides: 5 },
      ),
      1.5,
    );
  }
  glow(bp2(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 9), "#ff5a14", V(CX, F + 0.012, CZ)), 1.2);

  // swamp wisps and rising embers
  for (const [wx, wy, wz, wc] of [
    [-0.5, 0.55, 0.85, "#7dffd0"],
    [-0.95, 0.85, 0.45, "#7dffd0"],
    [0.3, 0.5, 1.15, "#ffe27a"],
    [1.2, 1.0, -0.25, "#7dffd0"],
    [-0.3, 1.25, 1.0, "#ffe27a"],
    [0.75, 0.55, 0.5, "#ff9a3a"],
    [1.28, 0.85, 0.95, "#ff9a3a"],
    [0.85, 1.15, 1.05, "#ffc23a"],
  ] as [number, number, number, string][])
    glow(bp2(sph(5, 4), wc, V(wx, F + wy, wz), { scale: 0.022 }), 1.8);

  return b.root;
}
