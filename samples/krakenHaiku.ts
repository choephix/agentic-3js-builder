import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { bezier, catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A colossal kraken rising from the sea, eight arms and two feeding tentacles spread wide over the water. Bright steel-blue hull with panel seams and a bevelled collar; one orange accent on eyes, collar, fins, stencil and sucker rings.",
  style: "Overwatch",
  commit: "b816db2",
};

// Crisp colour blocking: one steel-blue family, pale underside, one orange accent.
const HULL = "#3a86b0";
const HULL_LT = "#7cc4e4";
const HULL_DK = "#24607f";
const SEAM = "#11293a";
const BELLY = "#e4edf2";
const PALE = "#f5f9fb";
const ACCENT = "#ff7a1a";
const ACCENT_DK = "#d4500a";
const RUBBER = "#1a2430";
const METAL = "#b8c7d2";

type Spec = { az: number; R: number; H: number; sw: number; hook: number };

/** Fractional part, for repeating patterns in paints. */
const fr = (x: number) => x - Math.floor(x);

/** Piecewise-linear profile over t in 0..1. */
function profile(keys: [number, number][]) {
  return (t: number) => {
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
      }
    }
    return keys[keys.length - 1][1];
  };
}

const MANTLE_R = profile([
  [0, 0.5],
  [0.1, 0.9],
  [0.35, 1.35],
  [0.6, 1.5],
  [0.8, 1.35],
  [0.95, 1.0],
  [1, 0.7],
]);
const ARM_R = profile([
  [0, 0.36],
  [0.3, 0.26],
  [0.7, 0.14],
  [1, 0.05],
]);
const CLUB_R = profile([
  [0, 0.2],
  [0.3, 0.14],
  [0.7, 0.1],
  [0.82, 0.26],
  [0.92, 0.2],
  [1, 0.05],
]);

// Eight arms round the crown, azimuth 0 = front, 90 = model left. Reach R, arch H, sideways swirl sw, tip curl hook.
const ARMS: Spec[] = [
  { az: 0, R: 5.4, H: 1.6, sw: 0.4, hook: 1 },
  { az: 45, R: 5.9, H: 1.2, sw: -0.5, hook: -1 },
  { az: 90, R: 6.3, H: 1.8, sw: 0.6, hook: 1 },
  { az: 135, R: 5.6, H: 1.4, sw: -0.4, hook: -1 },
  { az: 180, R: 6.0, H: 2.1, sw: 0.5, hook: 1 },
  { az: 225, R: 5.5, H: 1.3, sw: -0.6, hook: -1 },
  { az: 270, R: 6.4, H: 1.7, sw: 0.5, hook: 1 },
  { az: 315, R: 5.8, H: 1.5, sw: -0.5, hook: -1 },
];
// Two longer feeding tentacles with clubs, raised high in front.
const FEEDERS: Spec[] = [
  { az: -22, R: 7.2, H: 2.9, sw: -0.9, hook: -1.2 },
  { az: 22, R: 7.2, H: 2.9, sw: 0.9, hook: 1.2 },
];
const U = [0, 0.14, 0.3, 0.46, 0.62, 0.78, 0.9, 1];

/** Tentacle centreline: rises from the crown, arches out, and lands its tip on the water (y = 0). */
function tentaclePath(a: Spec): [number, number, number][] {
  const th = (a.az * Math.PI) / 180;
  return U.map((u) => {
    const r = 0.5 + (a.R - 0.5) * u;
    const y = 0.045 + 1.805 * (1 - u ** 1.4) + a.H * Math.sin(Math.PI * u) * (1 - u) ** 0.6;
    const lat = a.sw * Math.sin(Math.PI * u) + a.hook * 1.2 * Math.max(0, (u - 0.7) / 0.3) ** 2;
    return [r * Math.sin(th) + lat * Math.cos(th), y, r * Math.cos(th) - lat * Math.sin(th)];
  });
}

// Hull: panel seams every 30 degrees round and every 0.5 m up, a pale skirt, a darker belly, a lighter crown.
// The top cap sits at t = 1, where the seam test must not fire.
const hullPaint = paint((p, n, s) => {
  const t = s[0];
  const d = ((s[1] % 360) + 360) % 360;
  if (t < 0.98 && fr(t * 9) < 0.018) return SEAM;
  const around = d % 30;
  if (around < 1.1 || around > 28.9) return SEAM;
  if (t < 0.16) return BELLY;
  if (p.y > 6.1 || n.y > 0.7) return HULL_LT;
  if (d > 120 && d < 240) return HULL_DK;
  return HULL;
});

// Tentacles: steel-blue upper side, pale underside, two rows of suckers (pale centre, dark rim), orange rings.
const armPaint = paint((_p, _n, s) => {
  const t = s[0];
  const d = ((s[1] % 360) + 360) % 360;
  if (t > 0.03 && t < 0.97 && fr(t * 4) < 0.05) return ACCENT;
  const along = ((fr(t * 24) - 0.5) / 24) * 7;
  for (const row of [150, 210]) {
    const across = (((d - row) * Math.PI) / 180) * 0.25;
    const dist = Math.hypot(along, across);
    if (dist < 0.09) return PALE;
    if (dist < 0.12) return RUBBER;
  }
  return d > 95 && d < 265 ? BELLY : HULL;
});

// Fins: flat steel-blue with bevelled accent rims.
const finPaint = paint((_p, n) => (Math.abs(n.x) < 0.5 ? ACCENT : HULL_LT));

const STENCIL = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="56" rx="6" fill="${SEAM}"/>
  <path d="M9 10 L19 10 L27 30 L19 50 L9 50 L17 30 Z" fill="${ACCENT}"/>
  <path d="M111 10 L101 10 L93 30 L101 50 L111 50 L103 30 Z" fill="${ACCENT}"/>
  <text x="60" y="40" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="900" text-anchor="middle" fill="${PALE}">K-07</text>
</svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });

  // Root and hub: the crown of arms sits on the hips, the beak hangs under it.
  const hips = b.joint("hips", { at: [0, 1.6, 0], role: "spine" });

  // Mantle: the bulbous head-body rising out of the sea, leaning slightly forward.
  const mantleChain = b.chain(
    "mantle",
    catmull([
      [0, 1.95, 0],
      [0, 3.1, 0.1],
      [0, 4.5, 0.3],
      [0, 5.7, 0.4],
      [0, 6.5, 0.3],
    ]),
    { parent: hips, names: ["mantle1", "mantle2", "mantle3", "mantle4", "head"], role: "spine" },
  );
  const mantle = b.sweep(mantleChain, MANTLE_R, { color: hullPaint, sides: 12, smooth: false, name: "mantle" });
  const hull = b.surface(mantle);

  // Beak: upper and lower mandibles on their own joints so the mouth can open.
  const beakUp = b.joint("beakUp", { parent: hips, at: [0, 1.58, 0.2], aim: [0, 1.12, 0.86] });
  const jaw = b.joint("jaw", { parent: hips, at: [0, 1.52, 0.18], aim: [0, 1.0, 0.8], role: "jaw" });
  b.sweep(
    bezier([0, 1.6, 0.2], [0, 1.5, 0.5], [0, 1.3, 0.74], [0, 1.12, 0.86]),
    (t) => [0.15 * (1 - t) + 0.03, 0.1 * (1 - t) + 0.02],
    { bone: beakUp, section: "box", color: RUBBER, name: "beakUp" },
  );
  b.sweep(
    bezier([0, 1.52, 0.18], [0, 1.42, 0.48], [0, 1.2, 0.7], [0, 0.98, 0.8]),
    (t) => [0.13 * (1 - t) + 0.025, 0.08 * (1 - t) + 0.02],
    { bone: jaw, section: "box", color: RUBBER, name: "jawLower" },
  );

  // Eyes: glowing orange, a dark housing ring, a slit pupil and a visor brow above each.
  const EYE_C: [number, number, number] = [0, 5.1, 0.3];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = hull.around(EYE_C).at(s * 66, 4);
    if (!eyeHit) throw new Error("kraken: no eye hit");
    const eye = glow(b.stick(new THREE.SphereGeometry(0.3, 12, 8), ACCENT, eyeHit, { embed: 0.3, name: `eye${side}` }), 1);
    b.stick(new THREE.TorusGeometry(0.36, 0.06, 6, 14).rotateX(Math.PI / 2), HULL_DK, eyeHit, {
      embed: 0.5,
      name: `eyeRing${side}`,
    });
    const pupilHit = b.surface(eye).around(eye.at).at(s * 52, 0);
    if (!pupilHit) throw new Error("kraken: no pupil hit");
    b.stick(new THREE.SphereGeometry(0.12, 10, 6).scale(0.45, 0.3, 1.4), RUBBER, pupilHit, {
      embed: 0.2,
      name: `pupil${side}`,
    });
    const brow = hull.around(EYE_C).at(s * 66, 26);
    if (!brow) throw new Error("kraken: no brow hit");
    b.stick(new THREE.BoxGeometry(0.85, 0.16, 0.5), SEAM, brow, { embed: 0.25, name: `brow${side}` });
  }

  // Vent slots on each flank, two rows.
  for (const s of [1, -1]) {
    for (const [az, y] of [
      [40, 3.0],
      [52, 3.0],
      [46, 3.3],
      [58, 3.3],
    ] as const) {
      const vent = hull.around([0, y, 0]).at(s * az, 0);
      if (!vent) throw new Error("kraken: no vent hit");
      b.stick(new THREE.BoxGeometry(0.06, 0.05, 0.32), SEAM, vent, { embed: 0.3, name: `vent${s > 0 ? "L" : "R"}${az}` });
    }
  }

  // Swept-back fins on both flanks, leaning out with the hull.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [2.2, 0],
        [0, 3.0, "sharp"],
      ],
      {
        at: [s * 1.05, 2.3, 0.3],
        x: [0, 0, -1],
        y: [s * 0.12, 1, 0],
        thickness: [0.24, 0.08],
        bevel: 0.03,
        color: finPaint,
        bone: mantleChain.joints[1],
        name: `fin${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Hull stencil on both flanks.
  for (const s of [1, -1]) {
    const flank = hull.around([0, 4.0, 0]).at(s * 90, 0);
    if (!flank) throw new Error("kraken: no flank hit");
    b.decal(mantle, STENCIL, { at: flank, dir: [s, 0, 0], size: [0.9, 0.45], mirror: s < 0, name: `stencil${s > 0 ? "L" : "R"}` });
  }

  // Collar at the crown of arms, riveted; a dark visor band across the head.
  const collar = hull.loop([0, 2.3, 0], { dir: [0, 1, 0], lift: 0.04 });
  b.sweep(collar, 0.06, { color: ACCENT, name: "collar" });
  b.along(collar, 20, (at) => {
    b.part(new THREE.SphereGeometry(0.035, 6, 4), METAL, { at });
  });
  const band = hull.loop([0, 4.55, 0], { dir: [0, 1, 0], lift: 0.05 });
  b.sweep(band, 0.05, { color: SEAM, name: "visorBand" });

  // Crest spines along the crown.
  for (const [i, t, len] of [
    [0, 0.66, 0.8],
    [1, 0.78, 0.95],
    [2, 0.9, 0.7],
  ] as const) {
    const base = mantle.at(t, 0);
    b.spike(base, base, len, 0.12, { color: ACCENT_DK, name: `crest${i}` });
  }

  // Tentacles: one chain each, skinned, with its joints named for the rig.
  const tentacle = (name: string, a: Spec, radius: (t: number) => number) => {
    const chain = b.chain(name, catmull(tentaclePath(a)), {
      parent: hips,
      names: [1, 2, 3, 4, 5, 6, 7].map((k) => `${name}_${k}`),
      role: "tentacle",
    });
    b.sweep(chain, radius, { color: armPaint, caps: { start: "round", end: "point" }, name });
  };
  ARMS.forEach((a, i) => tentacle(`arm${i}`, a, ARM_R));
  FEEDERS.forEach((a, i) => tentacle(`feeder${i}`, a, CLUB_R));

  return b.root;
}
