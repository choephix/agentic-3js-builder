```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, mottle, rng } from "agentic-3js-builder";

const CORAL = "#e0604a";
const RUST = "#9a3b22";
const DEEP = "#5b2216";
const BUMP = "#7a2e1b";
const PALE = "#f2c9a0";
const CREAM = "#f6ead2";
const GOLD = "#e8b233";
const BRASS = "#c9962b";
const PUPIL = "#1e0d08";

export const meta = {
  name: "Reef Octopus",
  description: "A grumpy coral-and-rust reef octopus with golden eyes, cream suckers, and a brass key from a wreck.",
};

// Arm centreline: spirals out from under the mantle and settles on the floor.
function armPath(a: number, curl: number, reach: number, lift: number) {
  const pts: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    const d = 0.1 + reach * Math.pow(t, 0.8);
    const th = ((a + curl * Math.pow(t, 1.3)) * Math.PI) / 180;
    const y = 0.1 - 0.092 * Math.pow(t, 0.6) + lift * Math.sin(Math.PI * t);
    pts.push([d * Math.sin(th), y, d * Math.cos(th)]);
  }
  return catmull(pts);
}

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });

  // Skeleton root: the mantle and every arm hang from here.
  const body = b.joint("body", { at: [0, 0, 0], dir: [0, 1, 0] });

  // Bulbous mantle head, mottled coral and rust with a pale underside.
  const mantleColor = countershade(mottle(RUST, CORAL, { size: 0.12, seed: 2 }), PALE, { level: -0.35 });
  const mantle = b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.16, 0.1],
      [0.2, 0.24],
      [0.19, 0.37],
      [0.13, 0.5],
      [0.05, 0.56],
      [0, 0.57],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], bone: body, smoothing: 2, color: mantleColor },
  );

  const skin = b.surface(mantle);
  const centre: [number, number, number] = [0, 0.3, 0];
  const onMantle = (az: number, el: number) => {
    const h = skin.around(centre).at(az, el);
    if (!h) throw new Error(`no mantle surface at ${az}, ${el}`);
    return h;
  };

  // Golden eyes with bar pupils.
  const eyes = [1, -1].map((s) => onMantle(s * 34, 8));
  for (const e of eyes) {
    b.stick(new THREE.SphereGeometry(0.042, 10, 7), GOLD, e, { embed: 0.5 });
    b.stick(new THREE.BoxGeometry(0.034, 0.008, 0.014), PUPIL, e.moved([0, 0.04, 0]), { embed: 0.5 });
  }

  // Grumpy brow: inner ends droop, outer ends lift.
  for (const s of [1, -1]) {
    const hits = [16, 30, 46].map((az, i) => onMantle(s * az, [9, 17, 15][i]));
    b.sweep(
      catmull(hits.map((h) => h.at)),
      0.011,
      { color: DEEP },
    );
  }

  // Warty bumps across the mantle, kept clear of the eyes.
  const bumpGeo = new THREE.SphereGeometry(0.014, 6, 4);
  const bumps = skin.scatter(70, {
    rng: rng(11),
    minDist: 0.034,
    filter: (h) => h.n.y > -0.3 && eyes.every((e) => h.at.distanceTo(e.at) > 0.08),
  });
  for (const h of bumps) b.stick(bumpGeo, BUMP, h, { embed: 0.45 });

  // Eight arms. Arm 0 lifts its tip to hold the brass key.
  const armAz = [17, 62, 105, 150, 197, 242, 288, 333];
  const curls = [0, 130, -190, 110, -150, 200, -120, 170];
  const reaches = [0, 0.34, 0.36, 0.3, 0.38, 0.32, 0.36, 0.3];
  const lifts = [0, 0.03, 0, 0.06, 0, 0.04, 0, 0.05];

  const keyPath = catmull([
    [0.03, 0.1, 0.12],
    [0.07, 0.11, 0.24],
    [0.1, 0.2, 0.33],
    [0.12, 0.34, 0.36],
    [0.12, 0.43, 0.38],
    [0.11, 0.458, 0.36],
  ]);

  const armColor = countershade(mottle(RUST, CORAL, { size: 0.07, seed: 5 }), CREAM, { level: -0.25 });
  const suckerGeo = new THREE.CylinderGeometry(0.0135, 0.0115, 0.006, 8);

  for (let i = 0; i < 8; i++) {
    const path = i === 0 ? keyPath : armPath(armAz[i], curls[i], reaches[i], lifts[i]);
    const arm = b.chain(`arm${i}`, path, { parent: body, count: 7, role: "tentacle" });
    const tube = b.sweep(arm, (t) => 0.03 * (1 - t) ** 0.7 + 0.008, { color: armColor });

    // Two rows of cream suckers along the underside.
    for (let k = 0; k < 12; k++) {
      const t = 0.12 + (0.7 * k) / 11;
      for (const deg of [150, 210]) {
        b.stick(suckerGeo, CREAM, tube.at(t, deg), { embed: 0.3 });
      }
    }
  }

  // The brass key, held up by the tip of arm 0.
  const keyRing = Array.from({ length: 12 }, (_, j) => {
    const a = (j / 12) * Math.PI * 2;
    return [0.11 + 0.022 * Math.cos(a), 0.44 + 0.022 * Math.sin(a), 0.36];
  });
  b.sweep(catmull(keyRing, { closed: true }), 0.0055, { color: BRASS });
  b.rod([0.11, 0.418, 0.36], [0.11, 0.27, 0.36], 0.0055, { color: BRASS });
  b.part(new THREE.BoxGeometry(0.026, 0.012, 0.008), BRASS, { at: [0.121, 0.262, 0.36] });
  b.part(new THREE.BoxGeometry(0.009, 0.03, 0.008), BRASS, { at: [0.128, 0.245, 0.36] });
  b.part(new THREE.BoxGeometry(0.008, 0.018, 0.008), BRASS, { at: [0.14, 0.262, 0.36] });

  return b.root;
}
```