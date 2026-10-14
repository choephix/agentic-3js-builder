```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, mottle, noise, paint, rng, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Reef octopus",
  description:
    "A curious reef octopus in coral and rust, with a bumpy bulbous mantle, golden bar-pupilled eyes, a grumpy brow, cream-suckered arms curling every way, and a brass shipwreck key held up high.",
};

const CORAL = "#e0654a";
const RUST = "#9c3b1d";
const DEEP = "#5e2014";
const CREAM = "#f6e6cc";
const GOLD = "#f2b331";
const PUPIL = "#1b1210";
const BRASS = "#cf9d46";
const PATINA = "#4f8273";
const BUMPS = ["#5e2014", "#b04a2a", "#8a3420"] as const;

/** The mantle's centre; the root joint sits here. */
const CENTRE = [0, 0.14, 0] as const;

/** A point `u` out from the mantle along bearing `phi` (degrees from +Z toward +X), `v` sideways, at height `y`. */
function bearing(phi: number, u: number, v: number, y: number): [number, number, number] {
  const sn = Math.sin((phi * Math.PI) / 180);
  const cs = Math.cos((phi * Math.PI) / 180);
  return [u * sn + v * cs, y, u * cs - v * sn];
}

/** Arm thickness along its length: t = 0 at the mantle, 1 at the tip. */
const armRadius = (t: number) => 0.024 - 0.018 * t;

const pick = (list: readonly string[], x: number) => list[Math.min(list.length - 1, Math.floor(x * list.length))];

/** Coral and rust body with cream mottling and a paler underside. */
const skin = paint((p, n) => {
  let c = mix(CORAL, RUST, smoothstep(0.4, 0.62, noise(p, 0.07, 3)));
  c = mix(c, CREAM, 0.7 * smoothstep(0.6, 0.74, noise(p, 0.035, 17)));
  c = mix(c, DEEP, 0.4 * smoothstep(0.56, 0.8, noise(p, 0.012, 29)));
  return mix(c, CREAM, 0.35 * smoothstep(0.1, -0.5, n.y));
});

/** Old brass with a little green patina. */
const brass = mottle(BRASS, PATINA, { size: 0.018, seed: 5, contrast: 1.2 });

export default function octopus() {
  const b = createBuilder({ name: "reef-octopus", paintSize: 2048 });
  const r = rng(7);

  // The head: a flat-based bulb, its root joint the head bone.
  const mantleJoint = b.joint("mantle", { at: CENTRE, role: "head" });
  const mantle = b.lathe(
    [
      [0, 0.022, "sharp"],
      [0.055, 0.022],
      [0.085, 0.03],
      [0.11, 0.055],
      [0.126, 0.1],
      [0.13, 0.14],
      [0.12, 0.19],
      [0.095, 0.238],
      [0.058, 0.268],
      [0.025, 0.282],
      [0, 0.288, "sharp"],
    ],
    { color: skin, at: [0, 0, 0], bone: mantleJoint, segments: 14, smoothing: 1, name: "mantle" },
  );

  const shell = b.surface(mantle);
  const onMantle = (az: number, el: number) => {
    const hit = shell.around(CENTRE).at(az, el);
    if (!hit) throw new Error(`octopus: no mantle surface at azimuth ${az}, elevation ${el}`);
    return hit;
  };

  // Golden eyes, each with a horizontal bar pupil lying across the eyeball.
  const eyeGeometry = new THREE.SphereGeometry(0.03, b.segments(10), b.segments(7));
  const eyeL = b.stick(eyeGeometry, GOLD, onMantle(38, 6), { embed: 0.4, name: "eye.L" });
  const eyeR = b.stick(eyeGeometry, GOLD, onMantle(-38, 6), { embed: 0.4, name: "eye.R" });
  const pupilGeometry = new THREE.SphereGeometry(1, b.segments(8), b.segments(6));
  pupilGeometry.scale(0.0036, 0.0045, 0.0135);
  for (const eye of [eyeL, eyeR]) {
    const across = new THREE.Vector3(0, 1, 0).cross(eye.axis);
    b.stick(pupilGeometry, PUPIL, eye.moved([0, 0.027, 0]), { embed: 0.5, flow: across });
  }

  // Grumpy brows: dark ridges over each eye, lowered toward the nose.
  const brow = (side: 1 | -1, name: string) => {
    const points = [
      [52, 24],
      [42, 27],
      [32, 22],
      [24, 14],
    ].map(([az, el]) => {
      const hit = onMantle(side * az, el);
      return hit.at.clone().addScaledVector(hit.n, 0.004);
    });
    b.sweep(catmull(points), 0.0065, { name, color: DEEP, bone: mantleJoint, caps: "round", sides: 6 });
  };
  brow(1, "brow.L");
  brow(-1, "brow.R");

  // A small beak: an upper part on the head and a lower jaw on its own hinge.
  const jaw = b.joint("jaw", { at: [0, 0.026, 0], parent: mantleJoint, role: "jaw" });
  b.spike([0, 0.036, 0], [0, 0.006, 0.018], null, 0.0115, { color: DEEP, bone: mantleJoint, name: "beak.upper" });
  b.spike([0, 0.026, 0], [0, 0, 0.016], null, 0.0105, { color: DEEP, bone: jaw, name: "beak.lower" });

  // Eight arms radiating from under the head. Each lies on the floor and hooks up at the tip,
  // except the front-left arm, which rises to hold the key.
  const grown: Array<{ name: string; sweep: ReturnType<typeof b.sweep> }> = [];
  const lying = [
    { name: "armF", phi: 0, s: 1, reach: 0.34, lift: 0.05, c: 0.9 },
    { name: "armL", phi: 90, s: -1, reach: 0.36, lift: 0.04, c: 1 },
    { name: "armBL", phi: 135, s: 1, reach: 0.31, lift: 0.07, c: 0.8 },
    { name: "armB", phi: 180, s: -1, reach: 0.37, lift: 0.05, c: 1 },
    { name: "armBR", phi: 225, s: 1, reach: 0.32, lift: 0.03, c: 0.9 },
    { name: "armR", phi: 270, s: -1, reach: 0.35, lift: 0.07, c: 1.1 },
    { name: "armFR", phi: 315, s: 1, reach: 0.33, lift: 0.05, c: 0.85 },
  ];
  for (const { name, phi, s, reach, lift, c } of lying) {
    const path = catmull([
      bearing(phi, 0.05, 0, 0.036),
      bearing(phi, 0.13, 0, 0.022),
      bearing(phi, 0.21, 0.02 * s, 0.021),
      bearing(phi, reach * 0.8, 0.07 * c * s, 0.017),
      bearing(phi, reach * 0.95, 0.13 * c * s, 0.024),
      bearing(phi, reach * 0.8, 0.16 * c * s, 0.04 + lift * 0.5),
      bearing(phi, reach * 0.56, 0.11 * c * s, 0.06 + lift),
    ]);
    const chain = b.chain(name, path, { parent: mantleJoint, role: "tentacle" });
    const sweep = b.sweep(chain, armRadius, {
      name,
      color: skin,
      caps: { start: "round", end: "point" },
      sides: 8,
    });
    grown.push({ name, sweep });
  }

  // The key arm: rises from the floor, its tip ending on the key's shaft.
  const keyChain = b.chain(
    "armFL",
    catmull([
      bearing(45, 0.05, 0, 0.036),
      bearing(45, 0.13, 0, 0.022),
      bearing(45, 0.2, 0.02, 0.021),
      bearing(45, 0.26, 0.04, 0.07),
      bearing(45, 0.285, 0.05, 0.17),
      bearing(45, 0.27, 0.04, 0.27),
      bearing(45, 0.22, 0.01, 0.33),
    ]),
    {
      parent: mantleJoint,
      role: "tentacle",
      names: ["armFL1", "armFL2", "armFL3", "armFL4", "armFL5", "armFL6", "armFL7"],
    },
  );
  grown.push({
    name: "armFL",
    sweep: b.sweep(keyChain, armRadius, {
      name: "armFL",
      color: skin,
      caps: { start: "round", end: "point" },
      sides: 8,
    }),
  });

  // Cream suckers: two lateral rows down every arm.
  const sucker = new THREE.CylinderGeometry(1, 0.85, 0.6, b.segments(8));
  for (const { sweep } of grown)
    for (const angle of [100, 260])
      for (let i = 0; i < 13; i++) {
        const t = 0.16 + (0.78 * i) / 12;
        b.stick(sucker, CREAM, sweep.at(t, angle, 0), { embed: 0.3, scale: 0.42 * armRadius(t) });
      }

  // Little bumps: scattered over the head and along the top of each arm.
  const bump = new THREE.SphereGeometry(0.0065, b.segments(5), b.segments(4));
  const eyes = [eyeL.at, eyeR.at];
  const headBumps = shell.scatter(110, {
    rng: r,
    minDist: 0.019,
    filter: (hit) => hit.n.y > -0.5,
    keepOut: (p) => eyes.some((e) => e.distanceTo(p) < 0.06),
  });
  for (const hit of headBumps) b.stick(bump, pick(BUMPS, r()), hit, { embed: 0.45, scale: 0.8 + 0.6 * r() });
  for (const { sweep } of grown)
    for (const hit of b.surface(sweep).scatter(9, { rng: r, minDist: 0.04, filter: (h) => h.n.y > 0.4 }))
      b.stick(bump, pick(BUMPS, r()), hit, { embed: 0.45, scale: 0.7 + 0.5 * r() });

  // The brass key from the shipwreck, held by the tip of the raised arm. Its shaft runs through the tip joint,
  // so the key moves with the arm.
  const tip = keyChain.tip!;
  const hold = tip.at;
  const piece = (geometry: THREE.BufferGeometry, x: number, y: number, name: string) =>
    b.part(geometry, brass, { bone: tip, at: [hold.x + x, hold.y + y, hold.z], name });
  piece(new THREE.TorusGeometry(0.021, 0.0046, b.segments(6), b.segments(14)), 0, 0.061, "key.bow");
  piece(new THREE.BoxGeometry(0.0098, 0.106, 0.0072), 0, -0.0065, "key.shaft");
  piece(new THREE.BoxGeometry(0.0215, 0.0072, 0.0072), 0.0066, -0.0555, "key.bit");
  piece(new THREE.BoxGeometry(0.005, 0.011, 0.0072), 0.0045, -0.0478, "key.tooth");
  piece(new THREE.BoxGeometry(0.005, 0.011, 0.0072), 0.013, -0.0478, "key.tooth");

  return b.root;
}
```