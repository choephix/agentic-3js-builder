```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Reef octopus",
  description:
    "A curious coral-and-rust reef octopus with golden bar-pupil eyes, a grumpy brow, eight suckered arms, and a brass key held aloft.",
};

const RUST_DARK = "#6e2516";
const CREAM = "#f4e6c8";
const GOLD = "#e9b72e";
const BRASS = "#c9a227";
const INK = "#1d1209";
const CENTRE: [number, number, number] = [0, 0.2, 0];

type ArmSpec = { deg: number; curl: number; lift: number };

const ARMS: ArmSpec[] = Array.from({ length: 8 }, (_, k): ArmSpec => {
  if (k === 7) return { deg: k * 45 + 22.5, curl: 0.35, lift: 0.3 }; // the key arm, raised
  return {
    deg: k * 45 + 22.5,
    curl: (k % 2 ? -1 : 1) * (2.0 + 0.4 * ((k * 7) % 3)),
    lift: 0.02 * ((k * 5) % 3) - 0.01,
  };
});

export default function reefOctopus() {
  const b = createBuilder({ name: "reef-octopus", paintSize: 2048 });

  // Body: one root joint at the middle of the mantle.
  const core = b.joint("core", { at: CENTRE, dir: [0, 1, 0], role: "spine" });

  // Bulbous mantle, painted with rust and pale mottling.
  const skin = mottle("#b4502f", "#eec4a2", { size: 0.05, seed: 4 });
  const mantle = b.lathe(
    [
      [0, -0.1],
      [0.06, -0.09],
      [0.11, -0.05],
      [0.14, 0.0],
      [0.145, 0.06],
      [0.13, 0.12],
      [0.095, 0.16],
      [0.05, 0.18],
      [0, 0.19],
    ],
    { name: "mantle", at: CENTRE, color: skin, segments: 14 },
  );

  const onMantle = b.surface(mantle);
  const around = onMantle.around(CENTRE);

  // Little bumps all over the upper head.
  const bumpGeo = new THREE.SphereGeometry(0.011, 6, 4);
  const bumps = onMantle.scatter(70, {
    rng: rng(7),
    minDist: 0.024,
    filter: (hit) => hit.at.y > 0.14,
  });
  for (const hit of bumps) b.stick(bumpGeo, RUST_DARK, hit, { embed: 0.5, name: "bump" });

  // Golden eyes with horizontal bar pupils.
  const eyeGeo = new THREE.SphereGeometry(0.03, 12, 8);
  const pupilGeo = new THREE.BoxGeometry(0.034, 0.007, 0.012);
  for (const side of [1, -1]) {
    const name = side > 0 ? "eyeL" : "eyeR";
    const spot = around.at(side * 35, 10)!;
    const eye = b.stick(eyeGeo, GOLD, spot, { embed: 0.35, name, group: name });
    b.stick(pupilGeo, INK, eye.moved([0, 0.026, 0]), { embed: 0.3, name: `${name}Pupil`, group: name });

    // A grumpy brow sitting over each eye, tilted so the inner end sits lower.
    const browGeo = new THREE.BoxGeometry(0.06, 0.022, 0.03);
    b.stick(browGeo, RUST_DARK, around.at(side * 30, 30)!, {
      embed: 0.4,
      spin: side > 0 ? -20 : 20,
      name: `${name}Brow`,
      group: name,
    });
  }

  // Eight arms curling out in every direction, each lined with cream suckers.
  const cup = new THREE.CylinderGeometry(0.01, 0.01, 0.008, 8);
  const limbs: Array<ReturnType<typeof b.chain>> = [];
  const sweeps: Array<ReturnType<typeof b.sweep>> = [];
  ARMS.forEach(({ deg, curl, lift }, k) => {
    const base = (deg * Math.PI) / 180;
    const points = Array.from({ length: 7 }, (_, j) => {
      const u = j / 6;
      const r = 0.1 + 0.34 * u;
      const phi = base + curl * u * u;
      const y = Math.max(0.012, 0.12 - 0.1 * u + lift * u * u);
      return [r * Math.sin(phi), y, r * Math.cos(phi)] as [number, number, number];
    });

    const chain = b.chain(`arm${k}`, catmull(points), {
      parent: core,
      role: "tentacle",
      names: (i) => `arm${k}Seg${i + 1}`,
    });
    const limb = b.sweep(chain, (t: number) => 0.034 - 0.022 * t, {
      name: `arm${k}`,
      color: spots(
        mottle("#e5805a", "#f2b594", { size: 0.06, seed: k }),
        "#8e3520",
        { size: 0.08, amount: 0.3, seed: 20 + k },
      ),
    });
    limbs.push(chain);
    sweeps.push(limb);

    // Two rows of suckers along the underside.
    const count = 9;
    for (const angle of [150, 210]) {
      for (let j = 0; j < count; j++) {
        const t = 0.16 + 0.74 * (j / (count - 1));
        b.stick(cup, CREAM, limb.at(t, angle), { embed: 0.3, name: `sucker${k}` });
      }
    }
  });

  // The brass key, held up at the tip of the raised arm.
  const keyTip = limbs[7].at(1);
  const shaft = new THREE.BoxGeometry(0.012, 0.1, 0.006).translate(0, 0.05, 0);
  const bow = new THREE.TorusGeometry(0.022, 0.006, 6, 12).translate(0, 0.12, 0);
  const teethLow = new THREE.BoxGeometry(0.016, 0.012, 0.006).translate(0.008, 0.03, 0);
  const teethHigh = new THREE.BoxGeometry(0.016, 0.012, 0.006).translate(0.008, 0.05, 0);
  for (const geometry of [shaft, bow, teethLow, teethHigh]) {
    b.part(geometry, BRASS, { frame: keyTip, quat: new THREE.Quaternion(), name: "brassKey", group: "key" });
  }

  return b.root;
}
```