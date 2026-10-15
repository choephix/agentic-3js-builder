1. **Fire read as pink salmon, not flame.** Glow strength 1.3–1.5 on light oranges washed out to pastel. I switched to saturated red, orange and yellow and dropped the strength to 1.0 and 1.1, so the fire is hot and Warcraft-bright.
2. **The back loincloth flap stuck out diagonally** in the side view, like a stick. It now hangs almost straight.
3. **The eyes were tiny slits and the face lacked menace.** I enlarged the eye decals and brightened the eye glow, so the yellow glare reads from the front.
4. **The mohawk looked thin from the front.** The side spikes now splay wider, so it reads as a fan.
5. **The tusks were slender and their gold bands were buried in the thicker tube.** I made them thicker and longer, curling higher, and resized the bands to sit on the new radius.

<<<<<<< SEARCH
const FL = ["#ff7a1a", "#ffc23a", "#ff5a14"];
=======
const FL = ["#ff4a0a", "#ff9a14", "#ffd02a"];
>>>>>>> REPLACE

<<<<<<< SEARCH
        sides: 5,
      }),
      1.3,
=======
        sides: 5,
      }),
      1.0,
>>>>>>> REPLACE

<<<<<<< SEARCH
        { bone: root, color: FL[(k + 1) % 3], sides: 5 },
      ),
      1.5,
=======
        { bone: root, color: FL[(k + 1) % 3], sides: 5 },
      ),
      1.1,
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(bp2(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 9), "#ff5a14", V(CX, F + 0.012, CZ)), 1.2);
=======
  glow(bp2(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 9), "#ff4a0a", V(CX, F + 0.012, CZ)), 1.0);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at, x: [1, 0, 0], y: [0, 1, -0.2 * dirZ], thickness: 0.025, color: CLOTH, bone: spine.joints[0] },
=======
      { at, x: [1, 0, 0], y: [0, 1, -0.04 * dirZ], thickness: 0.025, color: CLOTH, bone: spine.joints[0] },
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.092, 0.058],
=======
        size: [0.115, 0.074],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(at.at.clone().add(V(sx * 0.03, -0.01, 0)), V(sx * 0.35, 1, d.z).normalize(), len * 0.7, 0.026, {
=======
      b.spike(at.at.clone().add(V(sx * 0.045, -0.015, 0)), V(sx * 0.7, 1, d.z).normalize(), len * 0.8, 0.03, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tpath = bezier(P(s * 0.085, 2.08, 0.7), P(s * 0.125, 2.15, 0.83), P(s * 0.1, 2.3, 0.79));
    b.sweep(tpath, [0.032, 0.004], { bone: jaw, color: BONE, caps: { start: "flat", end: "point" }, sides: 7 });
    b.part(new THREE.TorusGeometry(0.027, 0.007, 5, 9), GOLD, {
=======
    const tpath = bezier(P(s * 0.085, 2.08, 0.7), P(s * 0.14, 2.16, 0.85), P(s * 0.11, 2.34, 0.8));
    b.sweep(tpath, [0.042, 0.004], { bone: jaw, color: BONE, caps: { start: "flat", end: "point" }, sides: 7 });
    b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 9), GOLD, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 9), RED, {
=======
    b.part(new THREE.TorusGeometry(0.034, 0.007, 5, 9), RED, {
>>>>>>> REPLACE