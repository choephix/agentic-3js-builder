1. **The chest lid leaned the wrong way.** At −55° it sat forward over the opening, hiding the gold and reading as a hat. I opened it to −96° so it stands almost upright behind the chest and shows the treasure and the gold glow. I also moved the chest 6 cm forward (`cz` −0.38 → −0.32) so the open lid clears the brick wall.
2. **The torch halo read as a second flame.** The dithered orange sprite on the wall looked like a detached blob beside each real flame, especially in the three-quarter view. I made it smaller, darker and dimmer so it reads as a warm wall wash.
3. **The spike trap was too dark.** The spikes vanished into the pit. I lifted the iron ramp so the points catch light and the blood stains read against them.

I left the six loose-part warnings alone. They are the flame sparks and the small bone fragments, and the renders show them as intended.

<<<<<<< SEARCH
      if (v > 0.7) return "#b8561e";
      return v * 1.5 > bayer(x, y) ? "#6e2a12" : "";
=======
      if (v > 0.7) return "#7a3a18";
      return v * 1.5 > bayer(x, y) ? "#44200f" : "";
>>>>>>> REPLACE

<<<<<<< SEARCH
  c.pick(IRON, 0.5 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y + 0.14 * (c.random(1) - 0.5)),
=======
  c.pick(IRON, 0.66 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y + 0.14 * (c.random(1) - 0.5)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    return c.pick(IRON, 0.5 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y);
=======
    return c.pick(IRON, 0.66 + 0.34 * c.n.x - 0.2 * c.n.z + 0.15 * c.n.y);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(plane(0.5, 0.5, "#ffffff", [x, fb.y + 0.08, -0.79], { texture: HALO }), 0.3);
=======
    glow(plane(0.4, 0.4, "#ffffff", [x, fb.y + 0.02, -0.79], { texture: HALO }), 0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const cz = -0.38;
=======
  const cz = -0.32;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(lid, { axis: [1, 0, 0], deg: -55 });
=======
  b.pose(lid, { axis: [1, 0, 0], deg: -96 });
>>>>>>> REPLACE