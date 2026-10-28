The cause is that `b.spike` takes a single number for its radius, and the toe spike was passed `[0.0052, 0.004]`. That is the type error, and the build failed before anything rendered.

<<<<<<< SEARCH
      b.spike(base, tip, null, [0.0052, 0.004], { bone: wrist, color: TOE, sides: 6, caps: { end: "round" } });
=======
      b.spike(base, tip, null, 0.005, { bone: wrist, color: TOE, sides: 6, caps: { end: "round" } });
>>>>>>> REPLACE