1. **Hero proportions.** The body and neck were small next to a 5.7 m wingspan, and the belly read as muddy mustard. I enlarged the torso, neck and collar by about 15%, and the skull and eye decal by about 15% and 25%. The belly is now a brighter gold. The next render should show a sturdier, more characterful bird with a clearly readable eye.
2. **Fuller wings.** The secondary and primary feathers were narrow, so the wings looked like thin streaks from three-quarter. I widened them by about 25%. The next render should show broader, overlapping flame-feather fans.
3. **Fuller tail.** The tail ribbons are widened from 0.12 to 0.17 so the tail reads as a plume rather than strings.
4. **Setting.** The brazier pillars floated about 15 cm off the dais. I moved them to hug the dais edge and shifted the angles so the front pair no longer sits in line with the legs. The next render should show the stage tightly framing the bird.

<<<<<<< SEARCH
const BODY = cel(furEdge(RED, GOLD, { level: -0.05, teeth: 0.32, period: 0.05, along: [0, 0, 1] }));
=======
const BODY = cel(furEdge(RED, "#ffd25a", { level: -0.05, teeth: 0.32, period: 0.05, along: [0, 0, 1] }));
>>>>>>> REPLACE

<<<<<<< SEARCH
  const body = b.sweep(spine, [0.14, 0.24, 0.3, 0.33, 0.28, 0.2], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.17, 0.12, 0.1], { color: BODY, sides: 8 });
=======
  const body = b.sweep(spine, [0.16, 0.28, 0.35, 0.38, 0.32, 0.23], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.19, 0.14, 0.115], { color: BODY, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.155 });
=======
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.18 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.085, 0, 0.002 + 0.003 * i, true);
=======
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.11, 0, 0.002 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const tip = add(lerp(wr, hd, 0.12 + 0.88 * u), 62 - 54 * u, 0.04 + 0.1 * u, L, 0.072, 0, 0.012 + 0.003 * i, true);
=======
      const tip = add(lerp(wr, hd, 0.12 + 0.88 * u), 62 - 54 * u, 0.04 + 0.1 * u, L, 0.092, 0, 0.012 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const path = ribbon(P0, P1, P2, P3, 0.12 - 0.008 * a, tailJ, a % 2 === 0 ? 0 : 1);
=======
    const path = ribbon(P0, P1, P2, P3, 0.17 - 0.012 * a, tailJ, a % 2 === 0 ? 0 : 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.13, 0.12, 0.15],
=======
    scale: [0.15, 0.14, 0.17],
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.15, 0.11], mirror: s < 0 }), 0.8);
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.19, 0.14], mirror: s < 0 }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const a of [70, 140, 220, 290]) {
    const x = Math.sin(a * DEG) * 1.6;
    const z = Math.cos(a * DEG) * 1.6;
=======
  for (const a of [50, 130, 230, 310]) {
    const x = Math.sin(a * DEG) * 1.48;
    const z = Math.cos(a * DEG) * 1.48;
>>>>>>> REPLACE