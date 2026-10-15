**Art-director read**

Identity cues:
- **Nine tails:** clearly visible as a fan, but they are straight, stiff cones that look fused. They need more sweep and a lift at the tips, and they should be fluffier. The spirit flames on the tips read well.
- **Kumadori face and dark-tipped ears:** visible and in proportion in the head close-up and the front view. Both anime eyes show from the front.
- **Muzzle:** long and rat-like, which fights the cute anime-fox read. The head is also small beside the huge tail fan.

Changes, in priority order:

1. **Identity and form:** shorten and thicken the muzzle, enlarge the skull, and move the nose, lower jaw and whisker roots to match. The next head close-up and the front view will show a rounder, cuter fox face with a stronger head against the tails.
2. **Tails:** rebuild the nine tail paths so they sweep outward and lift at the tips, with fatter, fluffier bodies. The three-quarter and back views will show a fuller, more curved fan instead of straight spokes.
3. **Soundness, fur blades:** the ruff, mane, fringe and cheek blades render as dirty grey because the cel paint reads their thin faces as shadow. They become a flat cream, so the front and head views show white fur tufts.
4. **Composition:**
   - The plinth is far wider than the fox, so I shrink the plinth, its inlay, gold ring and petal spread by about 12–15%. The fox fills more of every frame.
   - The left lantern sits in front of the muzzle in the three-quarter view. I move both lanterns to the rear flanks, under the tail fan, and pull the stones and offering stand inward. The face and silhouette are now clear of props in the three-quarter and front views.

## Edits

<<<<<<< SEARCH
      thickness: o.th ?? [0.022, 0.004],
      color: o.color,
=======
      thickness: o.th ?? [0.022, 0.004],
      color: o.color === coat ? "#fbf3e8" : o.color,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, { bone: head, at: HC, scale: [0.185, 0.158, 0.165], flat: true });
=======
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, { bone: head, at: HC, scale: [0.205, 0.176, 0.18], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(polyline([H(0, -0.02, 0.1), H(0, -0.05, 0.31)]), (t) => [0.075 - 0.047 * t, 0.06 - 0.033 * t], {
=======
  b.sweep(polyline([H(0, -0.02, 0.1), H(0, -0.05, 0.26)]), (t) => [0.09 - 0.052 * t, 0.07 - 0.04 * t], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: H(0, -0.046, 0.335),
    scale: [0.028, 0.022, 0.022],
=======
    at: H(0, -0.05, 0.285),
    scale: [0.034, 0.026, 0.026],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(polyline([H(0, -0.078, 0.05), H(0, -0.09, 0.29)]), (t) => [0.062 - 0.034 * t, 0.03 - 0.012 * t], {
=======
  b.sweep(polyline([H(0, -0.082, 0.05), H(0, -0.095, 0.25)]), (t) => [0.07 - 0.04 * t, 0.032 - 0.012 * t], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(bezier(H(s * 0.05, -0.04, 0.22), H(s * 0.2, -0.02 + k, 0.2), H(s * 0.33, -0.06 + 2 * k, 0.07)), [0.004, 0.0015], {
=======
      b.sweep(bezier(H(s * 0.05, -0.04, 0.18), H(s * 0.2, -0.02 + k, 0.17), H(s * 0.33, -0.06 + 2 * k, 0.05)), [0.004, 0.0015], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [sx * 0.2 * k, by + cy * 0.2 + 0.06, bz - 0.26 - 0.04 * mid],
      [sx * 0.56 * k, by + cy * 0.56 + 0.1, bz - 0.5 - 0.12 * mid],
      [sx * 0.88 * k, by + cy * 0.84 * k + 0.06, bz - 0.68 - 0.3 * mid],
=======
      [sx * 0.22 * k, by + cy * 0.2 + 0.08, bz - 0.26 - 0.04 * mid],
      [sx * 0.64 * k, by + cy * 0.52 + 0.14, bz - 0.5 - 0.14 * mid],
      [sx * 0.98 * k, by + cy * 0.9 * k + 0.3 + 0.06 * mid, bz - 0.6 - 0.34 * mid],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const rad = (t: number) => 0.042 + 0.08 * Math.sin(Math.PI * (0.12 + 0.88 * t));
=======
    const rad = (t: number) => 0.05 + 0.09 * Math.sin(Math.PI * (0.12 + 0.88 * t));
>>>>>>> REPLACE

<<<<<<< SEARCH
    [1.5, 0],
    [1.5, 0.07],
    [1.38, 0.085],
    [1.38, B],
=======
    [1.3, 0],
    [1.3, 0.07],
    [1.2, 0.085],
    [1.2, B],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.PlaneGeometry(2.5, 2.5), "#ffffff", {
=======
    b.part(new THREE.PlaneGeometry(2.2, 2.2), "#ffffff", {
>>>>>>> REPLACE

<<<<<<< SEARCH
rim.push([1.24 * Math.sin((k / 20) * 2 * Math.PI), B + 0.008, -0.15 + 1.24 * Math.cos((k / 20) * 2 * Math.PI)]);
=======
rim.push([1.07 * Math.sin((k / 20) * 2 * Math.PI), B + 0.008, -0.15 + 1.07 * Math.cos((k / 20) * 2 * Math.PI)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  lantern(1.15, 0.15);
  lantern(-1.15, 0.15);
=======
  lantern(1.0, -0.6);
  lantern(-1.0, -0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-1.05, -1.0, 0.1],
    [1.05, -0.95, 0.12],
    [0.85, 0.95, 0.07],
    [-0.9, 0.95, 0.08],
=======
    [-0.85, -0.95, 0.1],
    [0.85, -0.95, 0.12],
    [0.72, 0.8, 0.07],
    [-0.75, 0.82, 0.08],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const r = Math.sqrt(R()) * 1.2;
=======
    const r = Math.sqrt(R()) * 1.0;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.16), WOODC, { at: [-0.8, B + 0.025, 0.85], bone: hips });
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.04, 8), GOLD, { at: [-0.8, B + 0.07, 0.85], bone: hips, flat: true });
  glow(b.part(new THREE.SphereGeometry(0.03, 7, 5), "#ff9a3c", { at: [-0.8, B + 0.115, 0.85], bone: hips }), 1.3);
=======
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.16), WOODC, { at: [-0.62, B + 0.025, 0.78], bone: hips });
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.04, 8), GOLD, { at: [-0.62, B + 0.07, 0.78], bone: hips, flat: true });
  glow(b.part(new THREE.SphereGeometry(0.03, 7, 5), "#ff9a3c", { at: [-0.62, B + 0.115, 0.78], bone: hips }), 1.3);
>>>>>>> REPLACE