import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus",
  description:
    "A curious coral-and-rust reef octopus with golden bar-pupil eyes, a grumpy brow, eight curled cream-suckered arms, and one arm raising a brass key from a shipwreck.",
};

const CORAL = "#e0563a";
const RUST = "#8c3b1f";
const PALE = "#f2c9a0";
const CREAM = "#f6eedc";
const GOLD = "#f2b632";
const BRASS = "#b5892e";
const PUPIL = "#1a1210";

export default function build() {
  const b = createBuilder({ name: "reef_octopus" });
  const r = rng(7);

  // Skeleton: mantle joint at the base of the head.
  const mantle = b.joint("mantle", { at: [0, 0.26, 0] });

  // Bulbous head: a short fat tube rising from the mantle.
  const headChain = b.chain(
    "head",
    catmull([
      [0, 0.26, 0],
      [0, 0.45, 0.02],
      [0, 0.6, 0.03],
    ]),
  );
  const headBody = b.sweep(headChain, { radius: 0.24, color: CORAL });

  // Eyes: golden spheres seated on the head surface, with bar pupils.
  const surf = b.surface(headBody);
  const eyeSphere = new THREE.SphereGeometry(0.055, 10, 8);
  const pupilBar = new THREE.BoxGeometry(0.06, 0.016, 0.012);
  for (const side of [1, -1]) {
    const eyeHit = surf.nearest([side * 0.1, 0.5, 0.2]);
    b.stick(eyeSphere, GOLD, eyeHit);
    const pupilHit = surf.nearest([side * 0.1, 0.5, 0.24]);
    b.stick(pupilBar, PUPIL, pupilHit);

    // Grumpy brow: a slanted slab above each eye, inner ends dipping down.
    const brow = new THREE.BoxGeometry(0.14, 0.04, 0.05);
    brow.rotateZ(side * -0.4);
    const browHit = surf.nearest([side * 0.1, 0.6, 0.2]);
    b.stick(brow, RUST, browHit);
  }

  // Skin bumps: small coral nubs scattered over the head.
  const bumpGeo = new THREE.SphereGeometry(0.018, 6, 4);
  const bumpHits = surf.scatter(60);
  for (const h of bumpHits) {
    b.stick(bumpGeo, r() < 0.5 ? RUST : CORAL, h);
  }

  // Paler mottling: flattened pale blotches.
  const mottleGeo = new THREE.SphereGeometry(0.03, 7, 5);
  mottleGeo.scale(1, 0.5, 1);
  const mottleHits = surf.scatter(28);
  for (const h of mottleHits) {
    b.stick(mottleGeo, PALE, h);
  }

  // Eight arms, radiating and curling. Arm 3 is the key arm.
  const KEY_ARM = 3;
  const sucker = new THREE.SphereGeometry(0.014, 6, 4);
  const armChains = [];

  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2 + 0.3 * (r() - 0.5);
    const pts: number[][] = [];

    if (i === KEY_ARM) {
      // Raised arm, holding the key up beside the head.
      pts.push([0.1, 0.08, 0.1]);
      pts.push([0.22, 0.2, 0.2]);
      pts.push([0.22, 0.42, 0.26]);
      pts.push([0.17, 0.62, 0.24]);
      pts.push([0.13, 0.76, 0.2]);
    } else {
      const N = 7;
      for (let k = 0; k < N; k++) {
        const t = k / (N - 1);
        const dist = 0.12 + 0.4 * t;
        const curl = Math.sin(t * Math.PI * 1.5 + i) * 0.5 * t;
        const ang = th + curl;
        const x = Math.cos(ang) * dist;
        const z = Math.sin(ang) * dist;
        let y = 0.07 + 0.07 * (1 - t) + 0.08 * Math.max(0, Math.sin(t * 4 + i)) * t;
        y = Math.max(0.06, y);
        pts.push([x, y, z]);
      }
    }

    const arm = b.chain(`arm${i}`, catmull(pts));
    armChains.push(arm);
    b.sweep(arm, { radius: 0.05, color: i % 2 ? CORAL : RUST });

    // Two staggered rows of cream suckers along each arm.
    b.along(arm, 12, (at) => {
      b.stick(sucker, CREAM, at);
    });
  }

  // The brass key, held up by the raised arm's tip.
  const keyArm = armChains[KEY_ARM];
  const tipFrame = keyArm.at(0.97);

  const bow = new THREE.TorusGeometry(0.035, 0.009, 6, 12);
  b.stick(bow, BRASS, tipFrame);

  const shaft = new THREE.BoxGeometry(0.012, 0.09, 0.012);
  shaft.translate(0, -0.075, 0);
  b.stick(shaft, BRASS, tipFrame);

  const teeth = new THREE.BoxGeometry(0.03, 0.012, 0.012);
  teeth.translate(0.012, -0.135, 0);
  b.stick(teeth, BRASS, tipFrame);

  return b.root;
}
