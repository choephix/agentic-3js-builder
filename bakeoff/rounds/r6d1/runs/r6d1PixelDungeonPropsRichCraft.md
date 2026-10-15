1. **Chest lid opened properly.** It was posed −55°, so it leaned forward over the gold and hid the treasure. It now opens to −95°, just past vertical, and the chest moves 4 cm forward so the lid clears the wall. The next render should show the gold, gems and lock plate clearly, with the lid standing open behind them.
2. **Torch and lid collision removed.** The left torch sat exactly where the open lid now stands, so it moves between the chest and the banner (x −0.17). The banner shifts to x 0.15 to make room. The next render should show two clean torches, one on each side of the banner, with no pole running through the lid.
3. **Floating chain fixed.** The wall chain hung from above the broken wall top, so it floated. It now hangs from the wall face at x 0.5, between the banner and the right torch. The loose stone on the broken wall top was also 5 cm in the air and now sits on the wall.
4. **Ribcage no longer reads as skull horns.** From the front the ribs rose behind the skull like antlers. The ribcage and spine move left to x −1.0, so the skull and ribs read as a skeleton.
5. **Flames and halo cleaned up.**
   - **Flame:** each flame is about 40% bigger, so it reads as fire.
   - **Halo:** it is smaller and denser, so it is a warm glow instead of a cloud of floating dots.
6. **Right-side composition.**
   - **Lying barrel:** it moves forward so it no longer hides the closed and open barrels.
   - **Poison puddles:** they move with it.
   - **Burnt-out torch:** it moves out of the puddle.

<<<<<<< SEARCH
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.02, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.02, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.02, { rows: true });
=======
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.028, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.028, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.028, { rows: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(plane(0.55, 0.55, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
=======
    glow(plane(0.42, 0.42, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
      return v * 0.95 > bayer(x, y) ? (v > 0.55 ? "#ffb347" : "#ff6a1a") : "";
=======
      return v * 1.6 > bayer(x, y) ? (v > 0.6 ? "#ffb347" : "#ff6a1a") : "";
>>>>>>> REPLACE

<<<<<<< SEARCH
  torch("flameL", -0.65);
=======
  torch("flameL", -0.17);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.5, 0.03, 0.03, wp, [0, FY + 1.12, -0.78]);
  for (const s of [1, -1]) box(0.05, 0.05, 0.05, GOLD, [s * 0.26, FY + 1.12, -0.78]);
  plane(0.4, 0.7, "#ffffff", [0, FY + 0.75, -0.795], { texture: BANNER });
=======
  const BX = 0.15;
  box(0.5, 0.03, 0.03, wp, [BX, FY + 1.12, -0.78]);
  for (const s of [1, -1]) box(0.05, 0.05, 0.05, GOLD, [BX + s * 0.26, FY + 1.12, -0.78]);
  plane(0.4, 0.7, "#ffffff", [BX, FY + 0.75, -0.795], { texture: BANNER });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 1.22, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 1.17 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 1.17 - 9 * 0.048 - 0.02, -0.775]);
=======
  box(0.07, 0.04, 0.04, IRONP, [0.5, FY + 0.97, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.5, FY + 0.93 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.5, FY + 0.93 - 9 * 0.048 - 0.02, -0.775]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05 + 0.05 - 0.0, -0.9], { rotation: [0, 8, 0] });
=======
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05, -0.9], { rotation: [0, 8, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const [bx, bz] = [0.85, 0.82];
=======
    const [bx, bz] = [0.62, 0.9];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const cz = -0.38;
=======
  const cz = -0.34;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(lid, { axis: [1, 0, 0], deg: -55 });
=======
  b.pose(lid, { axis: [1, 0, 0], deg: -95 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      glow(put(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 8), "#44d65e", [x, FY + 0.004, z + 0.5], { flat: true }), 0.7);
      glow(put(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 8), "#44d65e", [x + 0.12, FY + 0.004, z + 0.58], { flat: true }), 0.7);
=======
      glow(put(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 8), "#44d65e", [x, FY + 0.004, z + 0.42], { flat: true }), 0.7);
      glow(put(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 8), "#44d65e", [x + 0.12, FY + 0.004, z + 0.48], { flat: true }), 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
  barrel(1.05, 0.3, "lying");
=======
  barrel(1.0, 0.4, "lying");
>>>>>>> REPLACE

<<<<<<< SEARCH
  const spineX = -0.72;
  for (let i = 0; i < 6; i++) box(0.045, 0.035, 0.04, BONEP, [spineX, FY + 0.02, 0.2 + i * 0.075]);
  for (let i = 1; i < 6; i++) {
    const z = 0.2 + i * 0.075;
=======
  const spineX = -1.0;
  for (let i = 0; i < 6; i++) box(0.045, 0.035, 0.04, BONEP, [spineX, FY + 0.02, 0.12 + i * 0.075]);
  for (let i = 1; i < 6; i++) {
    const z = 0.12 + i * 0.075;
>>>>>>> REPLACE