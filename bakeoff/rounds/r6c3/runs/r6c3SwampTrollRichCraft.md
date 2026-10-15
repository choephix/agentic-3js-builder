1. **Head too small for the body.** The head is lost between the hunched shoulders and the tusks, so the face doesn't read. I enlarged the skull, the crown that carries the war paint, and the muzzle. The skull is now 0.17 × 0.155 × 0.19 m, up from 0.15 × 0.14 × 0.18, with a proportionally wider decal.
2. **Mohawk reads as a single horn from the front.** The blades were only 5 cm thick at the root. They are now 9 cm thick tapering to 3.5 cm, so the crest has real volume from the front.
3. **Feet are black slabs.** The mud paint was too heavy and too dark. I lightened and thinned it so the feet keep the troll's skin colour with only a muddy tint.
4. **Cauldron and bone pile hang off the edge of the base.** Their legs and skulls overhang the mud disc. I pulled both inward and moved the grass exclusion zone to match, so the cauldron also sits clear of the left hand.

<<<<<<< SEARCH
    c = mix(c, MUD, 0.8 * smoothstep(G + 0.28, G + 0.06, p.y) * smoothstep(0.25, 0.55, noise(p, 0.08, 5) + 0.25));
=======
    c = mix(c, MUD, 0.5 * smoothstep(G + 0.2, G + 0.04, p.y) * smoothstep(0.35, 0.7, noise(p, 0.08, 5) + 0.2));
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.15, 0.14, 0.18] });
=======
  put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.17, 0.155, 0.19] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(geoS(1, 8, 6), skin, head, L(head, 0.27, -0.01), { scale: [0.115, 0.075, 0.12] }); // muzzle
=======
  put(geoS(1, 8, 6), skin, head, L(head, 0.27, -0.01), { scale: [0.13, 0.085, 0.13] }); // muzzle
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crown = put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.152, 0.142, 0.182] });
=======
  const crown = put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.172, 0.157, 0.192] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (crownHit) b.decal(crown, FACE, { at: crownHit.at, dir: [0, 0, 1], size: [0.25, 0.085] });
=======
  if (crownHit) b.decal(crown, FACE, { at: crownHit.at, dir: [0, 0, 1], size: [0.28, 0.095] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.05, 0.016], bevel: 0.004, color: HAIR, bone },
=======
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.09, 0.035], bevel: 0.005, color: HAIR, bone },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const CP = V(0.95, G, -0.78);
=======
  const CP = V(0.85, G, -0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
      Math.hypot(h.at.x - 0.95, h.at.z + 0.78) > 0.5 &&
=======
      Math.hypot(h.at.x - 0.85, h.at.z + 0.8) > 0.5 &&
>>>>>>> REPLACE

<<<<<<< SEARCH
  const SP = V(1.2, G, 0.78);
=======
  const SP = V(1.05, G, 0.7);
>>>>>>> REPLACE