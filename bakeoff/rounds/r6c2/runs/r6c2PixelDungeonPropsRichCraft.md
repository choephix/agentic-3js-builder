1. **Chain above the wall:** the hanging chain's bracket sat at y = FY + 1.22, above the broken right wall top (FY + 1.0), so it stuck up into the air in the front view. I moved the anchor onto the wall top and shortened the chain to 7 links, which stops it short of the barrel.
2. **Floating loose stone:** the stone on the broken wall top had its base 5 cm above the wall. I seated it on the wall top.
3. **Torch halos:** the bright dotted orange disc read as a second sun beside each flame in the three-quarter view. I made it a muted, dimmer, slightly larger wall-glow so the flame stays the hero.
4. **Light pools on the floor:** I added dithered emissive floor decals in pixel style: a gold wash spilling from the open chest and a toxic-green wash around the leaking barrel. They tie the glowing props into the dark scene and add colour in front.

<<<<<<< SEARCH
      if (v > 0.6) return "#ffa63a";
      return v * 1.5 > bayer(x, y) ? "#c4561a" : "";
=======
      if (v > 0.7) return "#b8561e";
      return v * 1.5 > bayer(x, y) ? "#6e2a12" : "";
>>>>>>> REPLACE

<<<<<<< SEARCH
const runeTex = () =>
=======
const glowTex = (inner: string, outer: string) =>
  pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const v = 1 - Math.hypot(x - 11.5, y - 11.5) / 12;
      if (v <= 0) return "";
      if (v > 0.62) return inner;
      return v * 1.7 > bayer(x, y) ? outer : "";
    });
  });

const runeTex = () =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05 + 0.05 - 0.0, -0.9], { rotation: [0, 8, 0] });
=======
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05, -0.9], { rotation: [0, 8, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 1.22, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 1.17 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 1.17 - 9 * 0.048 - 0.02, -0.775]);
=======
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 0.975, -0.78]);
  for (let i = 0; i < 7; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 0.93 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 0.93 - 7 * 0.048 - 0.02, -0.775]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(plane(0.4, 0.4, "#ffffff", [x, fb.y + 0.08, -0.79], { texture: HALO }), 0.55);
=======
    glow(plane(0.5, 0.5, "#ffffff", [x, fb.y + 0.08, -0.79], { texture: HALO }), 0.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // coins spilled in front of the chest
=======
  // light pools on the floor: gold from the chest, toxic green from the leaking barrel
  glow(
    plane(0.9, 0.9, "#ffffff", [cx, FY + 0.004, cz + D / 2 + 0.12], {
      texture: glowTex("#e8b030", "#8a5a14"),
      dir: [0, 1, 0],
      up: [0, 0, -1],
    }),
    0.45,
  );
  glow(
    plane(0.44, 0.44, "#ffffff", [0.82, FY + 0.004, -0.22], {
      texture: glowTex("#3ed65a", "#1f6a2c"),
      dir: [0, 1, 0],
      up: [0, 0, -1],
    }),
    0.45,
  );

  // coins spilled in front of the chest
>>>>>>> REPLACE