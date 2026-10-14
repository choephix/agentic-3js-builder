import { CylinderGeometry, SphereGeometry, Vector3 } from "three";
import {
  catmull,
  countershade,
  createBuilder,
  mix,
  mottle,
  paint,
  rng,
  smoothstep,
  spots,
} from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description:
    "A common octopus at rest: a tilted coral mantle with gold-iris eyes and papillae, a dark funnel and beak, and eight banded arms on the floor, sucker-studded, with lifted tip curls.",
};

// Palette: coral and plum skin, peach underside, cream spots and suckers, gold eyes.
const CORAL = "#d0593a";
const PLUM = "#7b2d4a";
const DEEP = "#8e3a2a";
const PEACH = "#f7c79a";
const CREAM = "#fff0d8";
const BAND = "#e9825c";
const SUCKER = "#fde6cc";
const PAPILLA = "#f2a27c";
const FUNNEL = "#5a1f33";
const BEAK = "#2d2024";
const IRIS = "#e8ad3f";
const PUPIL = "#0c0908";
const RIM = "#2a1812";

const EYE_RADIUS = 0.045;
const EYE_EMBED = 0.33;
const ROOT_RADIUS = 0.06;
const CURL = 1.1;

/** Arm radius at source t along an arm (meters): a thick root tapering to a fine tip. */
const armRadius = (t: number) => 0.034 - 0.026 * t;

/**
 * An arm's centreline: out from the crown along `azimuthDeg` (0 = forward, +Z; positive = the creature's left),
 * lying on the floor at y = its radius, hooking in the floor plane and lifting at the tip.
 */
function armPoints(azimuthDeg: number, length: number, curl: number) {
  const a = (azimuthDeg * Math.PI) / 180;
  const steps = 16;
  const step = length / steps;
  let x = Math.sin(a) * ROOT_RADIUS;
  let z = Math.cos(a) * ROOT_RADIUS;
  const points: number[][] = [[x, 0.09, z]];
  for (let k = 0; k < steps; k++) {
    const middle = (k + 0.5) / steps;
    const heading = a + curl * Math.max(0, (middle - 0.6) / 0.4) ** 2;
    x += Math.sin(heading) * step;
    z += Math.cos(heading) * step;
    const s = (k + 1) / steps;
    const r = armRadius(s);
    const sink = 1 - smoothstep(0, 0.35, s); // 1 at the crown, 0 once on the floor
    const lift = 0.08 * Math.max(0, (s - 0.7) / 0.3) ** 2;
    points.push([x, r + (0.09 - r) * sink + lift, z]);
  }
  return points;
}

/** A paint for an eye facing `outward`: gold iris, a black horizontal slit, and a small highlight. */
function eyePaint(outward: Vector3) {
  const across = new Vector3(0, 1, 0).cross(outward).normalize();
  const up = outward.clone().cross(across).normalize();
  return paint((_p, n) => {
    const toward = n.dot(outward);
    const x = n.dot(across);
    const y = n.dot(up);
    if (toward > 0.62 && y > 0.3 && y < 0.5 && x > -0.35 && x < -0.05) return "#ffffff";
    if (toward > 0.5 && Math.abs(y) < 0.2 && Math.abs(x) < 0.8) return PUPIL;
    if (toward > 0.36) return IRIS;
    return RIM;
  });
}

export default function octopus() {
  const b = createBuilder({ name: "octopus", detail: 1, paintSize: 2048 });

  // Skeleton: the body joint sits at the crown; the mantle, eyes, funnel, beak and arms hang from it.
  const body = b.joint("body", { at: [0, 0.1, 0] });

  // The mantle: a bulbous coral sack tilted back, mottled, cream-spotted, with a peach underside.
  const mottled = mottle(CORAL, DEEP, { size: 0.09, seed: 4, contrast: 1.3 });
  const spotted = spots(mottled, CREAM, { size: 0.08, amount: 0.1, seed: 12 });
  const mantleSkin = countershade(spotted, PEACH, { level: -0.2, soft: 0.5 });
  const mantle = b.lathe(
    [
      [0, 0],
      [0.045, 0.012],
      [0.095, 0.05],
      [0.135, 0.11],
      [0.155, 0.19],
      [0.148, 0.27],
      [0.12, 0.33],
      [0.075, 0.365],
      [0.03, 0.38],
      [0, 0.385],
    ],
    { name: "mantle", color: mantleSkin, at: [0, 0.1, 0], axis: [0, 1, -0.2], bone: body },
  );

  // Eyes: big spheres bulging from the sides of the mantle, each on its own joint.
  const surface = b.surface(mantle);
  const eyeGeometry = new SphereGeometry(EYE_RADIUS, b.segments(14), b.segments(10));
  const eyeCentres: Vector3[] = [];
  for (const [side, azimuth] of [
    ["L", 42],
    ["R", -42],
  ] as const) {
    const hit = surface.around([0, 0.24, 0]).at(azimuth, 2)!;
    const outward = hit.n;
    const centre = hit.at.clone().addScaledVector(outward, EYE_RADIUS * (1 - 2 * EYE_EMBED));
    const eye = b.joint(`eye${side}`, { parent: body, at: centre, dir: outward });
    eyeCentres.push(centre);
    b.stick(eyeGeometry, eyePaint(outward), hit, { embed: EYE_EMBED, bone: eye, name: `eye${side}` });
  }

  // Papillae: small bumps scattered over the mantle, kept clear of the eyes.
  const papilla = new SphereGeometry(1, 6, 4);
  const random = rng(7);
  for (const hit of surface.scatter(26, {
    rng: random,
    minDist: 0.045,
    keepOut: (p) => eyeCentres.some((c) => c.distanceTo(p) < 0.1),
    filter: (h) => h.n.y > -0.45,
  })) {
    b.stick(papilla, PAPILLA, hit, {
      scale: 0.009 + 0.008 * random(),
      embed: 0.35,
      bone: body,
      name: "papilla",
    });
  }

  // Siphon and beak: a dark funnel under the front of the mantle, and the beak's two halves, the lower on its own jaw.
  b.capsule([0, 0.16, 0.04], [0, 0.12, 0.2], [0.03, 0.02], { color: FUNNEL, bone: body, name: "funnel" });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.082, 0.02], dir: [0, 0, 1], role: "jaw" });
  b.spike([0, 0.1, 0.02], [0, 0.072, 0.085], null, 0.016, { color: BEAK, bone: body, name: "beakUpper" });
  b.spike([0, 0.082, 0.02], [0, 0.062, 0.09], null, 0.014, { color: BEAK, bone: jaw, name: "beakLower" });

  // Arms: eight chains from the crown, four a side (front to back), each a sweep that bends with its joints.
  // Coral at the root, plum at the tip, light rings along the length, peach underneath.
  const armSkin = paint((_p, _n, s) => {
    const along = mix(CORAL, PLUM, smoothstep(0.05, 0.95, s[0]));
    const ring = (s[0] * 9) % 1;
    const banded = mix(along, BAND, 0.5 * smoothstep(0.4, 0.5, ring) * (1 - smoothstep(0.85, 0.95, ring)));
    const top = (1 + Math.cos((s[1] * Math.PI) / 180)) / 2;
    return mix(PEACH, banded, 0.3 + 0.7 * top);
  });

  const sucker = new CylinderGeometry(1, 1, 0.5, 8);
  const ARM_DEG = [22, 67, 112, 157];
  const ARM_LENGTH = [0.4, 0.44, 0.44, 0.4];
  for (const [side, mirror] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    ARM_DEG.forEach((deg, i) => {
      const id = `arm${side}${i + 1}`;
      const curl = (i % 2 ? -CURL : CURL) * mirror;
      const chain = b.chain(id, catmull(armPoints(deg * mirror, ARM_LENGTH[i], curl)), {
        parent: body,
        count: 6,
        names: (k) => `${id}_${k + 1}`,
        role: "tentacle",
      });
      const arm = b.sweep(chain, armRadius, { color: armSkin, name: id });
      // Two rows of suckers, either side of the arm's upper side.
      for (const angle of [-38, 38])
        for (let k = 0; k < 11; k++) {
          const t = 0.12 + (0.8 * k) / 10;
          const point = arm.at(t, angle);
          b.stick(sucker, SUCKER, point, {
            scale: 0.46 * armRadius(t),
            embed: 0.3,
            bone: point.bone ?? undefined,
            name: "sucker",
          });
        }
    });
  }

  return b.root;
}
