1. **Dorsal mane blades read as thin needles from the side.** Their width ran across the body, so they were edge-on. I turned them to lie in the body's side plane, made them a bit larger, and set them more upright. The ridge now reads as a proper crest.
2. **The mane and ruff look like black slate shards.** I lightened the root-to-tip gradient (mid-gray to pale silver) so the mane matches the coat and carries the Frostwolf silver-gray look.
3. **The legs are too pale and stilt-like.** I cut the cream/tan wash on the lower legs and replaced it with a gray-brown, so the legs belong to the same animal.
4. **The banner pole stands right in front of the muzzle in side views and blocks the face.** I moved the banner to the far front-left corner. The ice crystals go to the opposite corner, so the hero's silhouette is clear.
5. **The scattered rocks read as black coal blobs.** They now use the lighter, mottled obelisk stone with a snow cap.
6. **The eyes are the focal point and look flat.** I added a soft glow so the amber eyes pop in the Blizzard style.

<<<<<<< SEARCH
  const c = mix(mix(FUR_D, FUR_M, t * 1.3), FUR_L, smoothstep(0.6, 1, t));
=======
  const c = mix(mix(FUR_M, FUR_L, t), "#d6d8dc", smoothstep(0.6, 1, t));
>>>>>>> REPLACE

<<<<<<< SEARCH
  c = mix(c, TAN, smoothstep(0.55, 0.15, gy) * 0.55);
=======
  c = mix(c, "#6f6d66", smoothstep(0.55, 0.15, gy) * 0.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(h.moved([0, -0.025, 0]), V(0, 0.5, -0.86), h.n, L, 0.1, maneGrey);
=======
    tuft(h.moved([0, -0.025, 0]), V(0, 1, -0.5), V(1, 0, 0), L * 1.1, 0.13, maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    bp(new THREE.IcosahedronGeometry(1, 0), STONE, {
=======
    bp(new THREE.IcosahedronGeometry(1, 0), OBEL, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.spike([-0.72 + dx, G, 0.95 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
=======
    glow(b.spike([0.8 + dx, G, 0.95 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = 0.95;
  const BZ = 0.75;
=======
  const BX = -0.75;
  const BZ = 0.85;
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(headLoft, EYE, { at: hit, dir: [s * 0.55, 0.2, 0.8], up: [0, 1, 0], size: [0.075, 0.047], mirror: s > 0, segments: 8 });
=======
    glow(
      b.decal(headLoft, EYE, { at: hit, dir: [s * 0.55, 0.2, 0.8], up: [0, 1, 0], size: [0.075, 0.047], mirror: s > 0, segments: 8 }),
      0.6,
    );
>>>>>>> REPLACE