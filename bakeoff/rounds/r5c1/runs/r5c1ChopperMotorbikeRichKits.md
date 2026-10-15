1. **Dirty metal.** The tarnished `metal("steel")` reads as grimy grey speckle on the pipes, fork, bars and frame. That clashes with Overwatch's clean, hard-edged, two-tone cel look. I switched steel to a cel-shaded cool silver and the engine metal to a cel navy-slate.
2. **Exhaust too heavy.** The pipes flared to a 7.5 cm radius and swallowed the rear wheel in the side view. I slimmed the profile and sized the cyan collars and tip discs to fit.
3. **Fork lowers.** The noisy rivet-panelled grey lowers looked like static. They are now orange, matching the fender, with a clean silver upper stanchion.
4. **More hard-light.** I added cyan underglow strips along the skid plate and a glowing tank-top ring. The hero glow now frames the silhouette from low angles and from the front.

<<<<<<< SEARCH
  const STEEL = metal("steel", { tarnish: 0.04, polish: 0.55 });
  const GUN = metal("iron", { tarnish: 0.08, polish: 0.45, seed: 3 });
  const GUNP = panelled(GUN, { size: 0.07, rivets: 0.02 });
=======
  const STEEL = cel("#d3dcee", "#8d9cc0");
  const GUN = cel("#3a4666", "#1f2640");
  const GUNP = panelled(cel("#3f4b6e", "#222a46"), { size: 0.08, rivets: 0.025 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(P, [0.028, 0.028, 0.03, 0.034, 0.04, 0.042, 0.05, 0.075], {
=======
    b.sweep(P, [0.026, 0.026, 0.028, 0.03, 0.034, 0.036, 0.04, 0.055], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.sweep(P.slice(0.5, 0.53), 0.047, { bone: frame, color: CY, caps: "flat" }), 1.2);
    glow(b.sweep(P.slice(0.62, 0.65), 0.052, { bone: frame, color: CY, caps: "flat" }), 1.2);
=======
    glow(b.sweep(P.slice(0.5, 0.52), 0.04, { bone: frame, color: CY, caps: "flat" }), 1.2);
    glow(b.sweep(P.slice(0.62, 0.64), 0.045, { bone: frame, color: CY, caps: "flat" }), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.01, 10), CY, {
=======
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.01, 10), CY, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(fp(s * 0.1, 0.5 * FL), fp(s * 0.1, FL), 0.027, GUNP, { bone: steer });
=======
    b.rod(fp(s * 0.1, 0.5 * FL), fp(s * 0.1, FL), 0.027, ORANGE, { bone: steer });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.2, 0.035, 0.32), OR, { bone: frame, at: [0, 0.31, -0.05] });
=======
  b.part(new THREE.BoxGeometry(0.2, 0.035, 0.32), OR, { bone: frame, at: [0, 0.31, -0.05] });
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.101, 0.292, -0.2], [s * 0.101, 0.292, 0.1], 0.008, CY, { bone: frame }), 1.5);
  }
  glow(b.rod([-0.1, 0.292, 0.1], [0.1, 0.292, 0.1], 0.008, CY, { bone: frame }), 1.5);
>>>>>>> REPLACE