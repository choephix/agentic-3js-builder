**Read of the brief (head close-up and front view)**

Identity cues:
- **Crescent frost blade with a glowing ice inlay.** Visible and well proportioned. The cyan inlay and snowflake read clearly, but the steel is too dark and murky for a League look. A ring of tiny grey studs floats outside the cutting edge, like stray specks.
- **Ice crystals.** Big and clear, with strong spikes top, bottom, rear and on the base. This is the strongest cue.
- **Haft and fittings.** The haft is too thin for a head this heavy, which makes the axe look weak. The big bronze root plate is shaded olive, like a mud blob, and hides the socket.

**Changes, in priority order**

1. **Heavier haft (front and three-quarter views).** The core goes from 0.03 to 0.04, the grip from 0.037 to 0.05, and the bands, studs, rune strips and fur collar are rescaled to match. The haft will read as a sturdy Freljord shaft. The fur collar gets bigger, fuller tufts instead of grey spikes.
2. **Root plate (head close-up).** It gets a smaller outline and a bright gilt metal paint in place of the muddy bronze. The head then shows crisp gold plates against the blue socket instead of an olive blob. The rear fluke plate gets the same gilt metal.
3. **Blade colour (front, back and head close-up).** The body goes from near-black navy to a brighter saturated steel blue, so the pale frosted edge and cyan inlay pop.
4. **Edge studs (front view and head close-up).** The studs are now placed along the real edge polyline, inset 3 cm. The stray grey specks outside the blade disappear and a neat row of ice studs sits inside the edge.

## Edits

<<<<<<< SEARCH
const BRONZE = shade(metal("bronze", { polish: 0.35, tarnish: 0.25 }));
=======
const BRONZE = shade(metal("bronze", { polish: 0.35, tarnish: 0.25 }));
const GILTM = shade(metal("gilt", { polish: 0.7, tarnish: 0.05 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const body: Rgb = mix("#233049", "#55699a", noise(p, 0.1, 2));
=======
    const body: Rgb = mix("#2f4a80", "#6f90d4", noise(p, 0.1, 2));
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.03,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.04,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.037, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.042, 0.009, haft);
=======
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.05, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66]) band(y, 0.056, 0.009, haft);
  band(0.84, 0.05, 0.009, haft);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.04, 0.43, Math.cos(a) * 0.04],
=======
      at: [Math.sin(a) * 0.052, 0.43, Math.cos(a) * 0.052],
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [0, 0.75, sgn * 0.0315],
=======
        at: [0, 0.75, sgn * 0.0415],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 12, radius: 0.04 });
=======
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 14, radius: 0.05 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.055, 0.11],
=======
    size: [0.075, 0.14],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 9, radius: 0.042 });
=======
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 10, radius: 0.052 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.05, 0.1],
=======
    size: [0.07, 0.125],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.0, 0.19],
      [0.1, 0.24],
      [0.15, 0.1],
      [0.15, -0.1],
      [0.1, -0.24],
      [0.0, -0.19],
=======
      [0.0, 0.16],
      [0.08, 0.2],
      [0.135, 0.09],
      [0.135, -0.09],
      [0.08, -0.2],
      [0.0, -0.16],
>>>>>>> REPLACE

<<<<<<< SEARCH
      thickness: 0.048,
      bevel: 0.008,
      smoothing: 1,
      color: BRONZE,
      bone: head,
      name: "rootPlate",
=======
      thickness: 0.044,
      bevel: 0.008,
      smoothing: 1,
      color: GILTM,
      bone: head,
      name: "rootPlate",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: BRONZE,
      bone: head,
      name: "flukePlate",
=======
      color: GILTM,
      bone: head,
      name: "flukePlate",
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const ang = (t - 0.5) * 2.1;
      b.part(new THREE.OctahedronGeometry(0.009), ICE_EDGE, {
        bone: head,
        at: H(0.36 + 0.07 * Math.cos(ang) - 0.0, 0.33 * Math.sin(ang) * 1.05, sgn * 0.0185),
      });
    }
=======
    const edgePath = polyline([H(0.3, 0.34), H(0.4, 0.21), H(0.445, 0), H(0.4, -0.21), H(0.32, -0.38)]);
    for (let i = 0; i < 8; i++) {
      const p = edgePath.at(0.08 + (0.84 * i) / 7);
      b.part(new THREE.OctahedronGeometry(0.009), ICE_EDGE, {
        bone: head,
        at: [p.x - 0.032, p.y, sgn * 0.0185],
        flat: true,
      });
    }
>>>>>>> REPLACE