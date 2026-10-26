Cause: `mix()` returns an `Rgb` tuple, so `let c = mix(...)` is inferred as `Rgb` and then assigned colour strings (`SUN`, `MAGENTA`, ...) in `SIDE_PAINT`; and `glow(trim as any, 0)` in `addMarqueeArt` passes a function (not a mesh) to `glow`, which crashes at runtime.

<<<<<<< SEARCH
  let c = mix(BODY_DARK, "#2a0f52", smoothstep(0.2, 1.8, y) * 0.6);
=======
  let c: any = mix(BODY_DARK, "#2a0f52", smoothstep(0.2, 1.8, y) * 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(trim as any, 0);
=======
>>>>>>> REPLACE