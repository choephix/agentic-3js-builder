1. **Impaled skull faced away and tilted skyward.** It read as a faceless cube floating above the spike trap. It now looks toward the camera at a slight tilt, jaw open, and the spike goes up into it.
2. **Floor skull lay on its side facing away and clipped the flagstones.** It now faces the front-right viewpoint and is raised so it rests on the floor.
3. **Bare wall corners.** I added pixel cobwebs, drawn as radial strands with sagging arcs, in both top corners. They add age and neglect, and they cut a more interesting silhouette into the flat black wall.

<<<<<<< SEARCH
      if (impaled) skull(V(x, base + h - 0.035, z), qOf(-50, 200, 0), 22, true, "B");
=======
      if (impaled) skull(V(x, base + h - 0.02, z), qOf(12, 28, 0), 24, true, "B");
>>>>>>> REPLACE

<<<<<<< SEARCH
  skull(V(-1.68, GROUND + 0.08, 0.95), qOf(0, -40, 80), 25, false, "C");
=======
  skull(V(-1.66, GROUND + 0.105, 0.98), qOf(0, 38, 80), 25, false, "C");
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Hanging chain with shackle
=======
  // Cobwebs in the top corners of the wall
  const webTex = (flip: boolean) =>
    pixelTexture(24, 24, (g) => {
      const put2 = (x: number, y: number) => g.set(flip ? 23 - x : x, y, "#cfd0e0");
      for (let k = 0; k < 5; k++) {
        const a = (k * 90 * DEG) / 4;
        for (let r = 0; r < 24; r++) put2(Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r));
      }
      for (const r of [5, 9, 13, 17, 21])
        for (let s = 0; s <= 40; s++) {
          const a = (s / 40) * (Math.PI / 2);
          const rr = r - 1.6 * Math.sin(a * 2);
          put2(Math.round(Math.cos(a) * rr), Math.round(Math.sin(a) * rr));
        }
    });
  put(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", V(-1.8 + 0.275, 2.3 - 0.275, WALL_FRONT + 0.004), {
    texture: webTex(false),
  });
  put(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", V(1.8 - 0.275, 2.3 - 0.275, WALL_FRONT + 0.004), {
    texture: webTex(true),
  });

  // Hanging chain with shackle
>>>>>>> REPLACE