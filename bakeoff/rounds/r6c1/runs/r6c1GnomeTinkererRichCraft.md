1. **Eyes are too small and look squeezed under the brim.** I enlarged the decals, moved them slightly outward, and mirrored the left eye so the lash flicks sit at the outer corners.
2. **The cheek blush reads as pink rings around the eyes.** I moved the blobs lower and flatter, onto the cheeks.
3. **The steam puffs look like grey disco balls.** They were flat-shaded, hard-edged and detached from the pipe. I made them smooth, softer white, and a little bigger and closer, so they read as steam rising from the pipe elbow.
4. **The hat-tip bulb is a faint disc.** I made it bigger and brighter, and added a small brass collar and a warm second inner glow so it reads as an "idea" bulb.

<<<<<<< SEARCH
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.05, 0.058], lift: 0.002 });
=======
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.062, 0.072], lift: 0.002, mirror: s > 0 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    const hit = headSkin.around(C).at(s * 26, 2);
=======
    const hit = headSkin.around(C).at(s * 27, 4);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const cheek = headSkin.around(C).at(s * 50, -14);
    if (cheek) b.stick(new THREE.SphereGeometry(0.03, 8, 6), "#f4877f", cheek, { embed: 0.65, scale: [1, 0.3, 0.85], flat: true });
=======
    const cheek = headSkin.around(C).at(s * 46, -24);
    if (cheek) b.stick(new THREE.SphereGeometry(0.026, 8, 6), "#f4877f", cheek, { embed: 0.7, scale: [1, 0.3, 0.85], flat: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
  ball(0.024, "#eef2f4", [-0.19, G + 1.07, PZ], chest);
  ball(0.03, "#e4eaee", [-0.2, G + 1.12, PZ - 0.01], chest);
  ball(0.036, "#dbe2e8", [-0.185, G + 1.18, PZ - 0.005], chest);
=======
  ball(0.028, "#fbfdfe", [-0.185, G + 1.07, PZ], chest, undefined, { flat: false });
  ball(0.035, "#f4f8fa", [-0.195, G + 1.12, PZ - 0.008], chest, undefined, { flat: false });
  ball(0.043, "#eef3f6", [-0.185, G + 1.18, PZ - 0.005], chest, undefined, { flat: false });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(ball(0.032, "#fff0a0", tipEnd.clone().addScaledVector(tipDir, 0.055), head), 1.4);
=======
  glow(ball(0.042, "#fff0a0", tipEnd.clone().addScaledVector(tipDir, 0.062), head, undefined, { flat: false }), 1.8);
  glow(ball(0.022, "#ffffff", tipEnd.clone().addScaledVector(tipDir, 0.062), head, undefined, { flat: false }), 2.2);
  cyl(0.02, 0.02, 0.008, GILT, tipEnd.clone().addScaledVector(tipDir, 0.03), head, [tipDir.x, tipDir.y, tipDir.z], 8);
>>>>>>> REPLACE