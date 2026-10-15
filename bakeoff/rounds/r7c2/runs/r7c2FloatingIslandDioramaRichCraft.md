1. **The ruin was hidden.** The sakura and the round tree stood in front of it in the front and low views. I moved the sakura to the back-right (angle -1.85) and the round tree out to the right rim (angle -1.05), and shifted two boulders clear of them. The ruin, rune circle and floating crystal now read as the centrepiece, framed by the tree instead of blocked by it.
2. **The underside was a murky purple-black mass.** I changed the belly palette to warm sandy rock with a darker strata band, which is closer to Genshin's earthy floating-rock look and gives the cyan crystals more contrast.
3. **The belly silhouette was a plain smooth cone.** I added six larger hanging rock shards for a jagged, layered silhouette.
4. **The clouds were smooth, over-tessellated blobs that clashed with the faceted look.** I switched them to flat-shaded low-poly puffs, so they read as stylised cloud tufts like the rest of the model.
5. **The sakura was missing atmosphere.** I added a dozen drifting pink petals around the tree.

<<<<<<< SEARCH
    if (strata > 0.7) return "#a98fb0";
    return noise(p, 0.25, 6) > 0.5 ? "#cdb6c6" : "#bfa6bd";
=======
    if (strata > 0.7) return "#b98f78";
    return noise(p, 0.25, 6) > 0.5 ? "#ecd6b8" : "#dcc0a2";
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(ico(r, 2, 1, 0.62, 1), c, [x, y, z], { flat: false });
=======
    put(ico(r, 1, 1, 0.62, 1), c, [x, y, z]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const h of under.scatter(9, {
=======
  for (let i = 0; i < 6; i++) {
    const h = belly.at(i * 60 + 25 + R() * 20, -38 - R() * 25);
    if (!h) continue;
    b.stick(cone(0.1 + R() * 0.06, 0.5 + R() * 0.25, 5), ROCK_DARK, h, { embed: 0.3, flat: true } as any);
  }
  for (const h of under.scatter(9, {
>>>>>>> REPLACE

<<<<<<< SEARCH
const [skx, skz] = pol(-1.2, 0.58);
sakura(skx, T, skz, 1.05);
const [gtx, gtz] = pol(-0.55, 0.66);
=======
const [skx, skz] = pol(-1.85, 0.66);
sakura(skx, T, skz, 0.95);
for (let k = 0; k < 12; k++)
  put(ico(0.02, 0, 1, 0.3, 1), k % 2 ? PINK_B : PINK_A, [skx + (R() - 0.5) * 1.3, T + 0.25 + R() * 0.9, skz + (R() - 0.5) * 1.3], {
    rotation: [R() * 360, R() * 360, 0],
  });
const [gtx, gtz] = pol(-1.05, 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-2.2, 0.75, 0.13],
=======
    [-2.7, 0.78, 0.13],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-1.8, 0.45, 0.08],
=======
    [-1.4, 0.85, 0.08],
>>>>>>> REPLACE