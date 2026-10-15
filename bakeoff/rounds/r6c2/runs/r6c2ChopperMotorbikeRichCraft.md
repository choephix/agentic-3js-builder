1. **Pad too dark.** The navy bike was lost against the navy pad. The deck is now a lighter slate, the frame and engine metal a lighter blue-steel, and the bodywork a more saturated hero blue, so the bike separates from the floor.
2. **Hazard ring.** The top of the pad's outer ring was plain dark, so the hazard stripes never showed. The stripes now run across the top of the ring too, which gives the stage an orange and navy border.
3. **Tank.** It was thin and its flames were fine sawtooth noise. I made it deeper and made the flame teeth larger, so the flames read as a bold painted shape.
4. **Underglow.** The two thin floating teal sticks looked like loose rods. They are now short capsule neon tubes tucked against the cradle, and two teal bay-light strips on the deck frame the bike's parking spot.

<<<<<<< SEARCH
const NAVY = "#27345c";
=======
const NAVY = "#2e4a9c";
>>>>>>> REPLACE

<<<<<<< SEARCH
const SLATE = "#38415a";
=======
const SLATE = "#5d6d9a";
>>>>>>> REPLACE

<<<<<<< SEARCH
const GUNM = toned("#414c78", 0.3, 0.4);
=======
const GUNM = toned("#55639a", 0.3, 0.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (n.y > 0.5) return "#232a3d";
=======
  if (n.y < -0.5) return "#1b2133";
>>>>>>> REPLACE

<<<<<<< SEARCH
    const saw = (((p.z / 0.08) % 1) + 1) % 1;
    const yb = yc + 0.03 - (0.07 + 0.15 * zf) * (1 - saw);
=======
    const saw = (((p.z / 0.12) % 1) + 1) % 1;
    const yb = yc + 0.035 - (0.09 + 0.2 * zf) * (1 - saw);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: V(0, 1.06, 0.3), w: 0.24, h: 0.2 },
      { at: V(0, 1.0, 0.1), w: 0.34, h: 0.25 },
      { at: V(0, 0.95, -0.1), w: 0.3, h: 0.21 },
=======
      { at: V(0, 1.07, 0.3), w: 0.25, h: 0.25 },
      { at: V(0, 1.02, 0.1), w: 0.36, h: 0.3 },
      { at: V(0, 0.97, -0.1), w: 0.32, h: 0.26 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    glow(b.rod(V(s * 0.2, 0.27, -0.4), V(s * 0.2, 0.27, 0.45), 0.009, TEAL, { bone: frameJ, sides: 5 }), 1.6);
=======
  for (const s of [1, -1]) {
    glow(b.capsule(V(s * 0.19, 0.3, -0.3), V(s * 0.19, 0.3, 0.38), 0.014, TEAL, { bone: frameJ, sides: 6 }), 1.6);
    glow(P(box(0.05, 0.006, 2.0), TEAL, stage, [s * 0.62, G + 0.004, 0.05]), 1.3);
  }
>>>>>>> REPLACE