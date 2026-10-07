import * as THREE from "three";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { mix, noise, paint, type Rgb, smoothstep } from "../src/paint";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Hippopotamus",
  description:
    "A standing hippopotamus, mouth closed: a broad slate-hided barrel with bevelled armour plate seams, one orange dorsal stripe, orange sensor eyes and ivory tusks, on a full skeleton.",
  style: "Overwatch",
  commit: "b816db2",
};

// Cool slate hide with one strong orange accent.
const HIDE = "#5d6d84";
const HIDE_LIGHT = "#8d9db4";
const BELLY = "#9aa8bc";
const SEAM = "#1f2631";
const LEG = "#55657d";
const JAW = "#6a798f";
const FOOT = "#343d4d";
const INK = "#1b212b";
const IVORY = "#ece5cf";
const STEEL = "#c3ceda";
const ACCENT = "#ff7a1a";

// Bevelled armour plates: cross seams every 32 cm, long seams every 45 degrees, a light bevel lip beside each seam,
// a shade variation per plate and one orange dorsal stripe along the top. The snout and rump caps (faces the
// normal points straight fore or aft) stay unseamed; the snout fades to a lighter brow.
const HIDE_PAINT = paint((p, n, s) => {
  const capFace = Math.abs(n.z) > 0.6;
  const zMod = (((p.z + 0.1) % 0.32) + 0.32) % 0.32;
  const across = Math.min(zMod, 0.32 - zMod);
  const aMod = (((s[1] - 22.5) % 45) + 45) % 45;
  const around = Math.min(aMod, 45 - aMod) * (Math.PI / 180) * Math.hypot(p.x, p.y - 1.0);
  const e = capFace ? 1 : Math.min(across, around);
  if (e < 0.007) return SEAM;
  if (e < 0.016) return mix(HIDE_LIGHT, BELLY, 0.3);
  const stripeDeg = (((s[1] + 180) % 360) + 360) % 360 - 180;
  if (Math.abs(stripeDeg) < 5 && n.y > 0.2 && !capFace) return ACCENT;
  let c = mix(BELLY, HIDE, smoothstep(-0.25, 0.45, n.y));
  c = mix(c, HIDE_LIGHT, 0.5 * smoothstep(0.5, 0.95, n.y));
  if (capFace) c = mix(c, HIDE_LIGHT, 0.6 * smoothstep(1.05, 1.22, p.y));
  const k = 0.93 + 0.14 * noise(p, 0.5, 11);
  const out: Rgb = [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];
  return out;
});

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 Q11 36 4 6 M16 64 Q16 34 16 3 M16 64 Q21 36 28 8" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

// Unit-marking decal for the flank: a dark plate, an orange band and a bold number.
const FLANK_DECAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><rect x="2" y="2" width="116" height="66" rx="10" fill="${INK}"/><rect x="2" y="50" width="116" height="18" fill="${ACCENT}"/><text x="60" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="32" text-anchor="middle" fill="#ffffff">07</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hippopotamus" });

  // Skeleton: hips root, a spine to the chest, a short neck, a head with a jaw, four legs and a tail.
  const hips = b.joint("hips", { at: [0, 1.0, -1.0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.0, -1.0], [0, 1.0, -0.2], [0, 1.02, 0.5], [0, 1.06, 1.05]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2", "spine3", "chest"],
  });
  const neck = b.chain("neck", catmull([[0, 1.06, 1.05], [0, 1.12, 1.3], [0, 1.16, 1.5]]), {
    parent: spine.tip ?? spine.joints[3],
    role: "neck",
    names: ["neck1", "neck2", "neckTip"],
  });
  const head = b.joint("head", { parent: neck.tip ?? neck.joints[1], at: [0, 1.16, 1.52], aim: [0, 1.1, 2.4], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.84, 1.6], aim: [0, 0.8, 2.4], role: "jaw" });

  // Body: one loft over the spine and neck, a barrel with a rounded rump and a deep chest.
  const body = b.loft(
    [
      { at: [0, 1.0, -0.98], w: 0.9, h: 0.84 },
      { at: [0, 1.0, -0.5], w: 1.46, h: 0.98 },
      { at: [0, 1.0, 0.0], w: 1.6, h: 1.02 },
      { at: [0, 1.0, 0.5], w: 1.56, h: 1.0 },
      { at: [0, 1.03, 0.95], w: 1.3, h: 0.98 },
      { at: [0, 1.1, 1.25], w: 1.0, h: 0.94 },
      { at: [0, 1.16, 1.5], w: 0.9, h: 0.9 },
    ],
    { bone: [spine, neck], color: HIDE_PAINT, caps: { start: "round", end: "round" } },
  );

  // Riveted rings where the armour plates meet.
  const flank = b.surface(body);
  for (const j of [spine.joints[1], spine.joints[2]]) {
    b.along(flank.loop(j, { lift: 0.01 }), 16, (at) =>
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), STEEL, at, { embed: 0.3 }),
    );
  }

  // A light collar band where the neck leaves the chest, with rivets along it.
  const collar = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [0.52 * Math.cos(a), 1.1 + 0.48 * Math.sin(a), 1.22];
  });
  b.sweep(catmull(collar, { closed: true }), 0.026, { bone: neck.joints[0], color: HIDE_LIGHT });
  b.along(catmull(collar, { closed: true }), 14, (at) =>
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), STEEL, at, { embed: 0.3 }),
  );

  // Unit-marking decals on both flanks.
  for (const s of [1, -1]) {
    b.decal(body, FLANK_DECAL, { at: [s * 0.8, 1.02, 0.25], dir: [s, 0, 0], size: [0.46, 0.27], mirror: s < 0 });
  }

  // Head: a broad skull with cheeks, narrowing to a flat blunt muzzle.
  const headLoft = b.loft(
    [
      { at: [0, 1.14, 1.4], w: 0.8, h: 0.66 },
      { at: [0, 1.13, 1.66], w: 1.0, h: 0.72 },
      { at: [0, 1.1, 1.9], w: 0.96, h: 0.66 },
      { at: [0, 1.04, 2.07], w: 0.84, h: 0.6 },
      { at: [0, 1.0, 2.18], w: 0.76, h: 0.54 },
    ],
    { bone: head, color: HIDE_PAINT, caps: { start: "round", end: "flat" } },
  );
  const hs = b.surface(headLoft);
  for (const s of [1, -1]) {
    const eye = hs.nearest([s * 0.44, 1.27, 1.85]);
    b.stick(new THREE.SphereGeometry(0.048, 12, 8), INK, eye, { embed: 0.45 });
    glow(b.stick(new THREE.SphereGeometry(0.034, 10, 8), ACCENT, eye.moved([0, 0.024, 0]), { embed: 0.2 }), 1.4);

    const ear = hs.nearest([s * 0.46, 1.4, 1.5]);
    b.stick(new THREE.SphereGeometry(0.07, 12, 8).scale(1, 0.7, 0.45), HIDE, ear, { embed: 0.3 });

    const nostril = hs.nearest([s * 0.1, 1.2, 2.16]);
    b.stick(new THREE.SphereGeometry(0.03, 8, 6).scale(1.2, 0.6, 0.8), INK, nostril, { embed: 0.5 });
  }

  // Lower jaw, closed: a thin lower lip that hinges at the back of the head.
  b.loft(
    [
      { at: [0, 0.8, 1.6], w: 0.66, h: 0.13 },
      { at: [0, 0.79, 1.95], w: 0.6, h: 0.12 },
      { at: [0, 0.8, 2.14], w: 0.46, h: 0.1 },
    ],
    { bone: jaw, color: JAW },
  );
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.27, 0.74, 1.98], [s * 0.33, 0.8, 2.08], [s * 0.37, 0.9, 2.2]), [0.032, 0], {
      bone: jaw,
      color: IVORY,
      caps: { start: "round", end: "point" },
    });
  }
  const lip = hs.drape(
    catmull([[0.4, 0.8, 1.7], [0.38, 0.8, 1.95], [0.3, 0.8, 2.12], [0, 0.8, 2.2], [-0.3, 0.8, 2.12], [-0.38, 0.8, 1.95], [-0.4, 0.8, 1.7]]),
    { lift: 0.004 },
  );
  b.sweep(lip, 0.01, { color: INK });

  // Legs: stubby pillars with a light armour cuff at the shin and a four-toed foot.
  const legSpecs = [
    { id: "FL", x: 0.5, z: 0.85, parent: spine.joints[2] },
    { id: "FR", x: -0.5, z: 0.85, parent: spine.joints[2] },
    { id: "HL", x: 0.5, z: -0.72, parent: spine.joints[0] },
    { id: "HR", x: -0.5, z: -0.72, parent: spine.joints[0] },
  ];
  for (const L of legSpecs) {
    const leg = b.chain(
      `leg${L.id}`,
      [
        [L.x, 1.0, L.z],
        [L.x, 0.52, L.z],
        [L.x, 0.14, L.z],
      ],
      { parent: L.parent, role: "leg", names: [`hip${L.id}`, `knee${L.id}`, `ankle${L.id}`] },
    );
    b.sweep(leg, (t) => 0.2 - 0.05 * t, { color: LEG });

    const cuff = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [L.x + 0.175 * Math.cos(a), 0.3, L.z + 0.175 * Math.sin(a)];
    });
    b.sweep(catmull(cuff, { closed: true }), 0.024, { bone: leg.joints[1], color: HIDE_LIGHT });

    const tip = leg.tip ?? leg.joints[2];
    const foot = b.part(new THREE.CylinderGeometry(0.19, 0.21, 0.1, 16), FOOT, {
      bone: tip,
      at: [L.x, 0.05, L.z],
    });
    const fs = b.surface(foot);
    for (const a of [-52, -18, 18, 52]) {
      const r = (a * Math.PI) / 180;
      const nail = fs.nearest([L.x + 0.19 * Math.sin(r), 0.06, L.z + 0.19 * Math.cos(r)]);
      b.stick(new THREE.SphereGeometry(0.032, 8, 6).scale(1, 0.6, 0.9), INK, nail, { embed: 0.3 });
    }
  }

  // Tail: short and thin, with an orange tip and a tuft of bristles.
  const tail = b.chain("tail", catmull([[0, 1.0, -1.0], [0, 0.95, -1.22], [0, 0.8, -1.34], [0, 0.6, -1.38]]), {
    parent: hips,
    role: "tail",
    names: ["tail1", "tail2", "tail3", "tailTip"],
  });
  b.sweep(tail, (t) => 0.075 - 0.05 * t, {
    bands: [
      [0.8, HIDE_PAINT],
      [1, ACCENT],
    ],
  });
  b.cards([tail.at(0.9), tail.at(1)], TUFT, {
    size: [0.05, 0.12],
    lean: 35,
    cross: true,
    color: INK,
    vary: 0.25,
    rng: rng(5),
  });

  return b.root;
}
