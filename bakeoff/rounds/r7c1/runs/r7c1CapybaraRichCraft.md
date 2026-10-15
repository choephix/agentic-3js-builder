1. The lower jaw read as a wooden plank hanging under the muzzle. I tucked it up against the skull, narrowed it, made the chin round match, and gave it a flat fur colour.
2. The fur cards showed as dark spiky triangles all over the body. I lightened the card drawing, made the cards fewer, smaller and flatter-lying, so the coat reads as soft fur.
3. The bird's wings were big blue balls stuck out to the sides. I moved them in and made them smaller. The bird's head was a muddy grey-olive because blue and cream blended. I tightened the blend so it reads as blue above and cream below.
4. The nose pad was a huge black hole. I shrank it and made it a softer brown. The cheek blush looked like a pink worm, so I made it smaller and softer.
5. A sparkle floated right in front of the bird's face. I now skip sparkles near the bird.

<<<<<<< SEARCH
  const BIRDP = countershade(BIRD_BACK, BIRD_BELLY, { level: -0.05, soft: 0.25 });
=======
  const BIRDP = countershade(BIRD_BACK, BIRD_BELLY, { level: -0.1, soft: 0.1 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    `<svg viewBox="0 0 24 48"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9a9a9a"/></linearGradient></defs>
=======
    `<svg viewBox="0 0 24 48"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient></defs>
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.frustumBox(hp(0.07, -0.095), hp(0.33, -0.1), [0.15, 0.06], [0.12, 0.05], { bone: jaw, color: JAWP });
  part(sph(0.03, 6, 5), JAWP, jaw, hp(0.31, -0.115), { scale: [1.3, 0.7, 1] });
=======
  b.frustumBox(hp(0.07, -0.062), hp(0.34, -0.07), [0.12, 0.045], [0.1, 0.038], { bone: jaw, color: "#b88a5a" });
  part(sph(0.03, 6, 5), "#b88a5a", jaw, hp(0.34, -0.072), { scale: [1.5, 0.65, 1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  part(sph(0.05, 8, 6), NOSE, head, hp(0.37, 0.035), { scale: [1.25, 0.85, 0.55] });
=======
  part(sph(0.05, 8, 6), "#5a3a28", head, hp(0.37, 0.035), { scale: [1.05, 0.7, 0.5] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(skinH, BLUSH, { at: cheek, size: [0.075, 0.048] });
=======
    b.decal(skinH, BLUSH, { at: cheek, size: [0.05, 0.032] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    `<svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="18" ry="10" fill="#ff9a8a"/><path d="M10 9 l3 6 M19 8 l3 7 M28 9 l3 6" stroke="#e8705f" stroke-width="2" stroke-linecap="round"/></svg>`,
=======
    `<svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="17" ry="9" fill="#e59a78"/><path d="M11 10 l3 5 M19 9 l3 6 M27 10 l3 5" stroke="#d27f62" stroke-width="2" stroke-linecap="round"/></svg>`,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodyHits = b.surface(body).scatter(150, { rng: R, minDist: 0.045, filter: (h) => h.n.y > -0.05 });
  b.cards(bodyHits, FUR, { size: [0.04, 0.06], lean: 65, bend: 25, vary: 0.3, rng: rng(12), color: COAT });
=======
  const bodyHits = b.surface(body).scatter(110, { rng: R, minDist: 0.055, filter: (h) => h.n.y > 0.1 });
  b.cards(bodyHits, FUR, { size: [0.035, 0.05], lean: 78, bend: 20, vary: 0.3, rng: rng(12), color: "#9a6a3a" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(headHits, FUR, { size: [0.028, 0.045], lean: 60, bend: 25, vary: 0.3, rng: rng(14), color: COAT });
=======
  b.cards(headHits, FUR, { size: [0.024, 0.036], lean: 75, bend: 20, vary: 0.3, rng: rng(14), color: "#946336" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const sq = 0;
=======
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    sparkle.push(frame([x, GY + 0.3 + R() * 0.6, z], [0, 1, 0]));
=======
    const sy = GY + 0.3 + R() * 0.6;
    if (V(x, sy, z).distanceTo(birdBase) < 0.35) continue;
    sparkle.push(frame([x, sy, z], [0, 1, 0]));
>>>>>>> REPLACE

<<<<<<< SEARCH
    bpart(sph(1, 8, 6), "#2c68bd", W, [s * 0.064, 0.06, -0.015], [-12, 0, -s * 8], [0.02, 0.045, 0.075]);
    bpart(sph(1, 6, 5), "#1f4e96", W, [s * 0.066, 0.045, -0.062], [-14, 0, -s * 8], [0.014, 0.03, 0.045]);
    bpart(sph(1, 6, 4), "#8fd0ff", W, [s * 0.072, 0.075, 0.015], [-12, 0, -s * 8], [0.005, 0.02, 0.03]);
=======
    bpart(sph(1, 8, 6), "#2c68bd", W, [s * 0.056, 0.058, -0.015], [-12, 0, -s * 8], [0.014, 0.038, 0.06]);
    bpart(sph(1, 6, 5), "#1f4e96", W, [s * 0.056, 0.045, -0.06], [-14, 0, -s * 8], [0.01, 0.024, 0.04]);
    bpart(sph(1, 6, 4), "#8fd0ff", W, [s * 0.063, 0.072, 0.012], [-12, 0, -s * 8], [0.004, 0.016, 0.026]);
>>>>>>> REPLACE