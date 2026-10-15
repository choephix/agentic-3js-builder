1. **Pilot and wing collided.** The pilot's head and raised hand sat at about y = 3.05 to 3.1, jammed against or through the upper wing, which is why the front view loses the faces. I raised the upper wing 0.4 m with one `UY` constant and updated the struts, cabane, bunting, fuel tank, nav lights and roundel to follow it. The wider gap also gives the biplane a more storybook stance.
2. **Cowl read as a hay bale.** The paint keyed on lathe `s[0]`, which doesn't map the way I assumed, so the whole cowl came out straw-gold and pixelated. I repainted it by model-space z: red body, cream bands, and a brass nose ring.

<<<<<<< SEARCH
const G = 0.126; // top of the grass base
=======
const G = 0.126; // top of the grass base
const UY = 3.4; // upper wing height
>>>>>>> REPLACE

<<<<<<< SEARCH
    { y: 3.0, z: 0.9, span: 4.1, half: 0.7, tip: RED, tag: "U", ail: TEAL },
=======
    { y: UY, z: 0.9, span: 4.1, half: 0.7, tip: RED, tag: "U", ail: TEAL },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(wingParts[0], EMBLEM, { at: P(s * 2.7, 3.0 + 0.08, 0.85), dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body });
=======
    b.decal(wingParts[0], EMBLEM, { at: P(s * 2.7, UY + 0.08, 0.85), dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body });
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(sph(1, 12, 8), RED, { at: P(0, 3.0 + 0.2, 0.9), scale: [0.42, 0.15, 0.4], flat: true });
  put(cyl(0.07, 0.07, 0.05, 8), BRASSC, { at: P(0, 3.0 + 0.36, 0.9) });
=======
  put(sph(1, 12, 8), RED, { at: P(0, UY + 0.2, 0.9), scale: [0.42, 0.15, 0.4], flat: true });
  put(cyl(0.07, 0.07, 0.05, 8), BRASSC, { at: P(0, UY + 0.36, 0.9) });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(put(sph(0.08, 6, 4), s > 0 ? "#ff4d4d" : "#4dff9a", { at: P(s * 4.08, 3.0, 0.9), flat: true }), 1.4);
=======
    glow(put(sph(0.08, 6, 4), s > 0 ? "#ff4d4d" : "#4dff9a", { at: P(s * 4.08, UY, 0.9), flat: true }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
const yU = 3.0 - 0.02;
=======
const yU = UY - 0.02;
>>>>>>> REPLACE

<<<<<<< SEARCH
    rod(P(s * 0.4, 1.85, 0.8), P(s * 0.55, 2.98, 1.25), [0.05, 0.045], WOOD);
    rod(P(s * 0.34, 1.9, 0.1), P(s * 0.55, 2.98, 0.6), [0.05, 0.045], WOOD);
    rod(P(s * 0.55, 2.95, 1.25), P(s * 1.9, yL, 0.4), 0.012, INK, { sides: 4 });
=======
    rod(P(s * 0.4, 1.85, 0.8), P(s * 0.55, UY - 0.02, 1.25), [0.05, 0.045], WOOD);
    rod(P(s * 0.34, 1.9, 0.1), P(s * 0.55, UY - 0.02, 0.6), [0.05, 0.045], WOOD);
    rod(P(s * 0.55, UY - 0.05, 1.25), P(s * 1.9, yL, 0.4), 0.012, INK, { sides: 4 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      bp.push([x, 3.0 + G + 0.02 - 0.45 * (1 - (x / 3.4) ** 2), 1.62]);
=======
      bp.push([x, UY + G + 0.02 - 0.45 * (1 - (x / 3.4) ** 2), 1.62]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const COWL = paint((_p, _n, s) => (s[0] > 0.6 ? BRASS_BODY : s[0] > 0.3 && s[0] < 0.38 ? CREAM : s[0] < 0.06 ? CREAM : RED));
=======
  const COWL = paint((p) =>
    p.z > 1.78 ? BRASS_BODY : p.z > 1.5 && p.z < 1.58 ? CREAM : p.z < 1.27 ? CREAM : RED,
  );
>>>>>>> REPLACE