**Brief check (head close-up and front view)**
- **Tusks:** only partly visible. Two thick orange braid tubes run straight down over the lower face and chest, covering them. They are also short and stubby, not the big curved Warcraft tusks.
- **Mohawk:** reads well from the side. From the front and back it is a single thin line, because the blades are only 1.6 to 5 cm thick.
- **Eyes and head:** the amber eyes are tiny and the head sits low, tucked into the shoulder hump. The face reads weakly at the front view.

**Changes, in priority order**
1. **Braids (front and head views).** Braid colour is wrong because the `HAIR` paint reads `s[1]` as a moutline y, but on a tube it is an angle, so it came out orange. Make them a flat dark red, thinner, and move them outward and back so they clear the mouth and tusks. The face and tusks then show in the front and head renders.
2. **Tusks (front, head and three-quarter views).** Rebuild them as one longer, fatter, outward-curving ivory sweep that rises past the nose, with a single gold ring. They will stand out clearly beside the muzzle.
3. **Head position (all views).** Raise and push the neck and head forward by about 7 cm and 6 cm, so the head clears the hump and the face is more prominent.
4. **Eyes (front and head views).** Enlarge the amber glow eyes and the sockets, and push the slit pupils forward so they sit on the eyeballs. Both eyes read from the front.
5. **Mohawk (front and back views).** Make the blades about 1.7 times thicker, so the crest shows as a solid red-orange fin from front and back, not a single line.

## Edits

<<<<<<< SEARCH
  const neck = b.chain("neck", catmull([v(0, 1.96, 0.32), v(0, 2.04, 0.5), v(0, 2.1, 0.66)]), {
=======
  const neck = b.chain("neck", catmull([v(0, 1.96, 0.32), v(0, 2.1, 0.54), v(0, 2.17, 0.72)]), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck, at: v(0, 2.1, 0.66), dir: [0, -0.05, 1], role: "head" });
=======
  const head = b.joint("head", { parent: neck, at: v(0, 2.17, 0.72), dir: [0, -0.05, 1], role: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(geoS(0.04, 6, 5), "#16302f", head, L(head, 0.2, 0.07, s * 0.07));
    glow(put(geoS(0.028, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.008, 0.04, 0.006), "#2a1400", head, L(head, 0.248, 0.07, s * 0.07));
=======
    put(geoS(0.05, 6, 5), "#16302f", head, L(head, 0.2, 0.07, s * 0.07));
    glow(put(geoS(0.038, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.01, 0.055, 0.006), "#2a1400", head, L(head, 0.258, 0.07, s * 0.07));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tusk = b.sweep(
      bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.12, s * 0.17), L(jaw, 0.32, 0.22, s * 0.15)),
      [0.045, 0],
      { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } },
    );
    for (const t of [0.3, 0.6]) {
      const path = bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.12, s * 0.17), L(jaw, 0.32, 0.22, s * 0.15));
      void tusk;
      torus(path.at(t), [path.tangentAt(t).x, path.tangentAt(t).y, path.tangentAt(t).z], 0.034 * (1 - t) + 0.01, 0.009, GOLD, jaw);
    }
=======
    const tuskPath = bezier(
      L(jaw, 0.2, -0.01, s * 0.1),
      L(jaw, 0.33, 0.08, s * 0.2),
      L(jaw, 0.36, 0.3, s * 0.15),
    );
    b.sweep(tuskPath, [0.055, 0], { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } });
    {
      const tg = tuskPath.tangentAt(0.25);
      torus(tuskPath.at(0.25), [tg.x, tg.y, tg.z], 0.055 * 0.75 + 0.008, 0.01, GOLD, jaw);
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bp = catmull([
      L(head, -0.1, -0.02, s * 0.12),
      v(s * 0.24, 1.95, 0.64),
      v(s * 0.26, 1.75, 0.61),
      v(s * 0.25, 1.5, 0.52),
    ]);
    b.sweep(bp, [0.03, 0.026, 0.02], { bone: head, color: HAIR, sides: 6 });
=======
    const bp = catmull([
      L(head, -0.1, -0.02, s * 0.12),
      v(s * 0.3, 2.03, 0.64),
      v(s * 0.37, 1.82, 0.58),
      v(s * 0.35, 1.55, 0.5),
    ]);
    b.sweep(bp, [0.024, 0.021, 0.017], { bone: head, color: "#a0211b", sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.05, 0.016], bevel: 0.004, color: HAIR, bone },
=======
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.085, 0.03], bevel: 0.006, color: HAIR, bone },
>>>>>>> REPLACE