1. **Dull, grimy metal:** the chrome and gunmetal are noisy grey mottles, so the engine reads as a dark blob and the bike lacks the clean, saturated, hand-painted Overwatch look. I replace them with a clean cool-white "chrome" and a navy-slate gunmetal, both warm on top and cool underneath. The V-twin, frame and fork now have crisp colour blocking.
2. **Pennant too dark:** it renders as muddy brown because the card faces backwards in the light. I make it self-lit so the orange and navy emblem pops.
3. **Missing signature glow:** I add teal underglow strips under the frame, so the bike reads as a hero-tech chopper and the teal wheel rings get an echo.

<<<<<<< SEARCH
const CHROME = metal("steel", { polish: 0.9, tarnish: 0.05 });
const GUNM = metal("iron", { tarnish: 0.3, polish: 0.35 });
=======
const CHROME = toned("#e3ecf6", 0.12, 0.4);
const GUNM = toned("#414c78", 0.3, 0.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards([frame(mv(top, 0, -0.01, 0), [0, 0, -1])], FLAG, {
    size: [0.2, 0.42],
    flow: [1, 0, 0],
    bend: 35,
    lean: 0,
    sink: 0,
    bone: frameJ,
  });
=======
  glow(
    b.cards([frame(mv(top, 0, -0.01, 0), [0, 0, -1])], FLAG, {
      size: [0.2, 0.42],
      flow: [1, 0, 0],
      bend: 35,
      lean: 0,
      sink: 0,
      bone: frameJ,
    }),
    0.75,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) P(ball(0.012), CHROME, frameJ, V(s * 0.152, 0.5, 0.2));
=======
  for (const s of [1, -1]) P(ball(0.012), CHROME, frameJ, V(s * 0.152, 0.5, 0.2));
  // teal underglow strips
  for (const s of [1, -1])
    glow(b.rod(V(s * 0.2, 0.27, -0.4), V(s * 0.2, 0.27, 0.45), 0.009, TEAL, { bone: frameJ, sides: 5 }), 1.6);
>>>>>>> REPLACE