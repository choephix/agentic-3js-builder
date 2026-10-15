1. **Lowest point 48 mm below y=0.** Grass and flower cards on the base were seated with `nearest()`, which snapped some of them to the rim and underside of the disc. I now seat them on explicit upward frames.
2. **Panda sits too low and long.** I raised the body axis (`BY`) by 0.03 m so the legs read as legs and the panda looks like it is balancing, not slumping.
3. **Black belly.** The cel-shaded belly line ate half the body, so I lowered it to let the rust coat show.
4. **Spiky tufts.** The tuft cards on the tail and back stood up like thorns. They are now shorter, lie flatter along the fur and carry the ring colours.
5. **Cheek ruff.** The ruff was a huge plate hanging over the scarf, so I shrank it by 28%.
6. **Moss lumps.** The moss lumps read as big green gems, so I made them smaller and fewer.

<<<<<<< SEARCH
import { createBuilder, rng, catmull, limb, paint, noise, cells, svg } from "agentic-3js-builder";
=======
import { createBuilder, rng, catmull, limb, paint, noise, cells, svg, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
const BY = FL + 0.18; // height of the body axis
=======
const BY = FL + 0.21; // height of the body axis
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const h of stoneSkin.scatter(16, {
    rng: rng(5),
    minDist: 0.1,
=======
  for (const h of stoneSkin.scatter(12, {
    rng: rng(5),
    minDist: 0.12,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.stick(new THREE.IcosahedronGeometry(0.04 + rp() * 0.025, 0), C_MOSS, h, { embed: 0.45, flat: true, bone: base });
=======
    b.stick(new THREE.IcosahedronGeometry(0.024 + rp() * 0.016, 0), C_MOSS, h, { embed: 0.5, flat: true, bone: base });
>>>>>>> REPLACE

<<<<<<< SEARCH
    baseSkinHits(count, seed, filt).map((h) => b.surface(b.root).nearest(h.at));
=======
    baseSkinHits(count, seed, filt).map((h) => frame(h.at, [0, 1, 0]));
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodyCoat = cel(furEdge(RUST, BELLY, { level: -0.2, teeth: 0.3, period: 0.034 }));
=======
  const bodyCoat = cel(furEdge(RUST, BELLY, { level: -0.5, teeth: 0.3, period: 0.034 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    { size: [0.04, 0.07], lean: 66, bend: 25, vary: 0.3, rng: rng(15), color: RUST_LT },
=======
    { size: [0.04, 0.05], lean: 80, bend: 20, vary: 0.3, rng: rng(15), color: "#f0803a" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(lightH, TUFT, { size: [0.04, 0.08], lean: 62, bend: 25, vary: 0.3, rng: rng(22), color: "#f58a3c" });
    b.cards(darkH, TUFT, { size: [0.04, 0.08], lean: 62, bend: 25, vary: 0.3, rng: rng(23), color: "#d65a26" });
=======
    b.cards(lightH, TUFT, { size: [0.045, 0.055], lean: 82, bend: 20, vary: 0.25, rng: rng(22), color: "#f07a30" });
    b.cards(darkH, TUFT, { size: [0.045, 0.055], lean: 82, bend: 20, vary: 0.25, rng: rng(23), color: "#b94a20" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(CHEEK as any, {
=======
    b.extrude(CHEEK.map(([x, y, k]) => (k ? [x * 0.72, y * 0.72, k] : [x * 0.72, y * 0.72])) as any, {
>>>>>>> REPLACE