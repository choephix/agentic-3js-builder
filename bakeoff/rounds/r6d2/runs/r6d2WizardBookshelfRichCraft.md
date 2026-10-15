1. **Stars were edge-on.** The `star()` extrude used the default side-view axes, so the hanging stars on the top shelf and the gold stars on the pediment showed as thin dashes from the front. I'm turning them to face +Z and making them a little bigger. The next front render should show five-pointed glowing stars on the pediment and hanging under the top shelf.
2. **Dark back panel.** The starry sky behind the books is almost black, and the constellations barely show. I'm giving it a gentle self-glow. The next render should show a visible purple-blue night sky with gold and blue constellation lines behind the tomes, and the book spines should stand out against it.
3. **Leaning book clipping the pillar.** The leaning books at the right end of the middle and top shelves touch the side panel. I'm nudging them in so they rest against the shelf cleanly instead of sinking into the wood.

<<<<<<< SEARCH
    glow(b.extrude(starOutline(Rr, Rr * 0.45), { at: [x, y, z], thickness: th, bevel: th * 0.2, color }), strength);
=======
    glow(b.extrude(starOutline(Rr, Rr * 0.45), { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: th, bevel: th * 0.2, color }), strength);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(1.34, 1.56), "#ffffff", { at: [0, Y0 + 1.42, -0.1788], texture: SKY });
=======
  glow(b.part(new THREE.PlaneGeometry(1.34, 1.56), "#ffffff", { at: [0, Y0 + 1.42, -0.1788], texture: SKY }), 0.55);
>>>>>>> REPLACE
<<<<<<< SEARCH
  [[-0.38, 0.12], [0.38, 0.12], [-0.6, 0.085], [0.6, 0.085]].forEach(([x, y]) => star(x, CTOP + 0.022 + y - 0.02, 0.196, 0.03, "#ffe27a", 0.012, 1.2));
=======
  [[-0.38, 0.12], [0.38, 0.12], [-0.6, 0.085], [0.6, 0.085]].forEach(([x, y]) => star(x, CTOP + 0.022 + y - 0.02, 0.196, 0.04, "#ffe27a", 0.012, 1.2));
>>>>>>> REPLACE
<<<<<<< SEARCH
      star(x, CEIL - len - 0.03, 0.15, 0.032, "#ffe27a", 0.014, 1.3);
=======
      star(x, CEIL - len - 0.04, 0.15, 0.042, "#ffe27a", 0.014, 1.3);
>>>>>>> REPLACE
<<<<<<< SEARCH
    lean(0.67 - ls.h * Math.sin(14 * DEG), t, ls, 14);
=======
    lean(0.655 - ls.h * Math.sin(14 * DEG), t, ls, 14);
>>>>>>> REPLACE
<<<<<<< SEARCH
    lean(0.67 - ls.h * Math.sin(12 * DEG), t, ls, 12);
=======
    lean(0.655 - ls.h * Math.sin(12 * DEG), t, ls, 12);
>>>>>>> REPLACE