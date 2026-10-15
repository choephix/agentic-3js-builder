1. **Fur cards read as black shards.** The body, shoulder and thigh tufts are tinted with the dark coat paint and lean at 60°, so the torso looks like burnt spikes. I tint them with a lighter silver-grey paint and lean them flatter, so they layer like fur and the dark mane spikes and shoulder shards stand out against them.
2. **The lower jaw is a flat cream tray.** I open the mouth wider and add a tongue, so the fangs and the snarl read from the front.
3. **Legs are spindly for a heavy Warcraft-style wolf.** I thicken the fore and hind leg radii so the stance feels powerful.
4. **Eyes are tiny.** The amber glowing eyes are the face's focal point, so I enlarge the decals.
5. **No Warcraft flavour beyond the rune stone.** I add a leather collar on the neck with a glowing frost-crystal pendant, so the wolf reads as a companion of that world and the glow carries onto the animal.

<<<<<<< SEARCH
const CREAMSOLID = "#d6cfba";
=======
const CREAMSOLID = "#d6cfba";
const SILVER = mottle("#a3a9b1", "#cfd2d4", { size: 0.06, seed: 41 });
const LEATHER = "#5a3a22";
>>>>>>> REPLACE

<<<<<<< SEARCH
    { size: [0.07, 0.13], lean: 60, bend: 25, vary: 0.3, rng: rng(5), color: COAT },
=======
    { size: [0.07, 0.13], lean: 72, bend: 25, vary: 0.3, rng: rng(5), color: SILVER },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { size: [0.07, 0.13], lean: 60, bend: 20, vary: 0.3, rng: rng(9), color: COAT },
=======
      { size: [0.07, 0.13], lean: 72, bend: 20, vary: 0.3, rng: rng(9), color: SILVER },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.085, 0.07, 0.052, 0.046, 0.045], { color: LEG, name: `foreleg${L}` });
=======
    b.sweep(fl, [0.1, 0.082, 0.062, 0.054, 0.052], { color: LEG, name: `foreleg${L}` });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hl, [0.1, 0.075, 0.055, 0.045, 0.043], { color: LEG, name: `hindleg${L}` });
=======
    b.sweep(hl, [0.115, 0.088, 0.065, 0.054, 0.052], { color: LEG, name: `hindleg${L}` });
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.09, 0.056],
=======
      size: [0.115, 0.072],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
=======
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.17), "#c4596b", { bone: jaw, at: hd(0, -0.07, 0.24) });
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });

  // leather collar with a glowing frost-crystal pendant
  const collarLoop = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collarLoop, 0.02, { color: LEATHER });
  const pendantHit = b.surface(neckTube).nearest(P(0, 1.12, 0.95));
  glow(b.stick(new THREE.OctahedronGeometry(0.045, 0), CRYSTAL, pendantHit, { embed: 0.1, flat: true }), 1.4);
>>>>>>> REPLACE