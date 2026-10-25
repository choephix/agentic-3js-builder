The `box` helper takes `(w, h, d, at, color, rot)`, but the call `box(0.05, 0.03, 0.03, [s * 0.5, 1.9, 0.7], STEEL)` is fine, whereas `box(0.05, 0.02, 0.5, [s * 0.5, 1.22, 1.9], NEON_M, 1.3)` was wrapped in `glow(...)` with a stray extra argument `1.3` landing in the `rot` slot. A numeric `rot` then reached `rotation`, which `vec` cannot parse. The same mistake appears in several other `glow(box(...), n)` calls where the strength went inside `box`.

<<<<<<< SEARCH
  sides((s) => glow(box(0.05, 0.02, 0.5, [s * 0.5, 1.22, 1.9], NEON_M, 1.3)));
=======
  sides((s) => glow(box(0.05, 0.02, 0.5, [s * 0.5, 1.22, 1.9], NEON_M), 1.3));
>>>>>>> REPLACE

<<<<<<< SEARCH
      glow(box(0.04, 0.04, 0.4, [sx * 1.3 + sx * 0.0, 0.76, z + sz * 0.0], NEON_Y), 1.2).position;
=======
      glow(box(0.04, 0.04, 0.4, [sx * 1.3, 0.76, z], NEON_Y), 1.2);
>>>>>>> REPLACE