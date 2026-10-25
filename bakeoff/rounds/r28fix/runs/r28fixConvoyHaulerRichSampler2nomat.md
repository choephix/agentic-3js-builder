The cause: the module declares `const R = rng(5)` and later declares a function `R()` in the same scope, which esbuild rejects as a duplicate symbol. The chain of nested helper functions at the end was meaningless, so I'm removing them and using a small seeded jitter from `R` directly.

<<<<<<< SEARCH
    b.part(cyl(0.025, 0.03, 5), STEEL, { bone: ch, at: [s * 1.16, 0.38, -2.8 + i * 0.45 + R() * 0.02], rotation: [0, 0, 90] });
  function R() { return R_(); }
  function R_() { return R_r(); }
  function R_r() { return R_s(); }
  function R_s() { return rr(); }
  function rr() { return R_t(); }
  function R_t() { return 0.5; }
=======
    b.part(cyl(0.025, 0.03, 5), STEEL, { bone: ch, at: [s * 1.16, 0.38, -2.8 + i * 0.45 + R() * 0.02], rotation: [0, 0, 90] });
>>>>>>> REPLACE