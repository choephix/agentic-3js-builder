1. **Muddy chest plumage.** The gold chest cards face down and shade olive-brown. I made them self-lit so the breast reads as bright gold, which fits the Genshin look.
2. **Heavy crest streamers.** The long dark ribbons off the head read as stray brown bands. I shortened them and raised their path. I also added glowing flame cards along each one, so the crest reads as fire.
3. **Tail seen edge-on.** The tail ribbons are flat in the XZ plane, so from the side they vanish into hairlines. I tilted their width vector so they show from side and front, and added more flame cards down their length for a fuller plume.
4. **Small eyes.** Eyes are the face's focal point in this style, so I enlarged the decals.
5. **Slight body and hips.** The torso is narrow against the huge wings. I widened the chest and enlarged the thigh puffs so the bird holds up the span.

<<<<<<< SEARCH
  b.cards(chestHits, FEATHER, {
=======
  glow(b.cards(chestHits, FEATHER, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  });
  const backHits = bodySurf.scatter(24, {
=======
  }), 0.7);
  const backHits = bodySurf.scatter(24, {
>>>>>>> REPLACE

<<<<<<< SEARCH
{ at: [0, 0.86, -0.04], w: 0.38, h: 0.4 },
=======
{ at: [0, 0.86, -0.04], w: 0.44, h: 0.44 },
>>>>>>> REPLACE

<<<<<<< SEARCH
{ at: [0, 0.99, 0.17], w: 0.36, h: 0.42 },
=======
{ at: [0, 0.99, 0.17], w: 0.42, h: 0.46 },
>>>>>>> REPLACE

<<<<<<< SEARCH
size: [0.058 * HS * 1.15, 0.08 * HS * 1.15]
=======
size: [0.058 * HS * 1.45, 0.08 * HS * 1.45]
>>>>>>> REPLACE

<<<<<<< SEARCH
    ribbon(
      hl(-0.03, 0.07, s * 0.05),
      hl(-0.25, 0.2, s * 0.14),
      hl(-0.7, 0.15, s * 0.3),
      hl(-1.0, -0.1, s * 0.38),
      0.05,
      v3(s * 0.4, 1, 0).normalize(),
      head,
      CRESTP,
      s * 1.7,
    );
=======
    const streamer = ribbon(
      hl(-0.03, 0.07, s * 0.05),
      hl(-0.25, 0.24, s * 0.14),
      hl(-0.55, 0.2, s * 0.26),
      hl(-0.75, 0.02, s * 0.3),
      0.045,
      v3(s * 0.4, 1, 0).normalize(),
      head,
      CRESTP,
      s * 1.7,
    );
    glow(
      b.cards(
        [0.35, 0.6, 0.85].map((t) => frame(streamer.at(t), [0, 1, 0])),
        FLAMES,
        { size: [0.06, 0.15], lean: 0, flow: [0, 0, -1], bend: 20, vary: 0.2, rng: r, bone: head },
      ),
      0.9,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
      v3(1, 0, 0),
      tail.joints[1],
=======
      v3(1, 0.8, 0).normalize(),
      tail.joints[1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const t of [0.4, 0.62, 0.82]) tailFlames.push(frame(path.at(t), [0, 1, 0]));
=======
    for (const t of [0.3, 0.45, 0.6, 0.75, 0.9]) tailFlames.push(frame(path.at(t), [0, 1, 0]));
>>>>>>> REPLACE

<<<<<<< SEARCH
      scale: [0.09, 0.15, 0.11],
=======
      scale: [0.11, 0.17, 0.13],
>>>>>>> REPLACE