1. **Uncover the headlights.** The front fender tips currently obscure their outer corners; shorten those tips without losing the broad stance.
2. **Give the tyres proper monster-truck tread.** Widen the rubber and replace the straight tread rows with chunky, opposing chevron lugs.
3. **Strengthen the racing identity.** Add bold “04” bed-side panels and a large roof skull, keeping the existing cyan/yellow palette.
4. **Quiet the ground texture.** Replace the uniformly noisy dirt with larger, quieter patches and deliberate tyre tracks so the truck remains the hero.
5. **Give the display its own title.** Keep “8 BIT” on the vehicle plates, but label the arena “BYTE CRUSHER.”

<<<<<<< SEARCH
  const DIRT = pixelTexture(64, 64, (g) => {
    const shades = ["#76543c", "#886248", "#977151", "#a8805b", "#6b503c"];
    g.fill((x, y) => {
      const band = Math.floor(x / 5);
      if (band === 3 || band === 9) {
        if ((y + Math.floor(x / 2)) % 7 < 3) return "#514237";
      }
      return shades[Math.floor(random() * shades.length)];
    });
  });
=======
  const DIRT = pixelTexture(64, 64, (g) => {
    const shades = ["#87664c", "#907055", "#98785b", "#82634c"];
    const patches = Array.from({ length: 256 }, () =>
      shades[Math.floor(random() * shades.length)]);
    g.fill((x, y) => {
      const patch = patches[Math.floor(y / 4) * 16 + Math.floor(x / 4)];
      const track = Math.min(Math.abs(x - 15), Math.abs(x - 48));
      if (track < 5) {
        const rib = (y + Math.floor(track / 2)) % 6;
        if (rib < 2) return "#65513f";
        if (track > 3) return "#a17f5c";
        return "#7b6049";
      }
      if ((x * 17 + y * 31) % 113 === 0) return "#b0916c";
      return patch;
    });
  });

  const NUMBER = pixelTexture(48, 20, (g) => {
    g.fill((x, y) => {
      if (y === 0 || y === 19) return C.yellow;
      if (x < 3 || x > 44) return C.cyanDark;
      return C.ink;
    });
    text(g, "04", 13, 4, C.orangeDark, 2);
    text(g, "04", 12, 3, C.white, 2);
    for (let y = 3; y < 17; y++)
      for (let x = 3; x < 9; x++)
        g.set(x, y,
          (Math.floor(x / 3) + Math.floor(y / 3)) % 2
            ? C.white : C.ink);
    for (let y = 3; y < 17; y++) {
      g.set(40, y, C.yellow);
      g.set(41, y, C.yellow);
    }
  });

  const TITLE = pixelTexture(96, 16, (g) => {
    g.fill((x, y) => {
      if (y === 0 || y === 15) return C.yellow;
      if (x === 0 || x === 95) return C.silver;
      return C.ink;
    });
    text(g, "BYTE CRUSHER", 13, 5, C.white);
    for (let y = 3; y < 13; y++)
      for (let x = 3; x < 9; x++)
        g.set(x, y,
          (Math.floor(x / 3) + Math.floor(y / 3)) % 2
            ? C.yellow : C.ink);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  panel("displayTitle", [0, 0.105, 3.211], 1.04, 0.13, PLATE);
=======
  panel("displayTitle", [0, 0.105, 3.211], 1.44, 0.15, TITLE);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(1.025, 1.025, 0.82, 20, 1), tyrePaint, {
      name: `tyre${name}`, at: [x, 1.30, z], bone, dir: [1, 0, 0],
    });

    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 18; j++) {
        const deg = j * 20 + (row ? 7 : -7);
        const a = deg * Math.PI / 180;
        tiled(
          `tread${name}_${row}_${j}`,
          [x + (row ? 0.215 : -0.215),
            1.30 + Math.cos(a) * 1.035,
            z + Math.sin(a) * 1.035],
          [0.43, 0.18, 0.34],
          RUBBER, 0.033, bone, [deg, 0, 0],
        );
      }
    }

    for (const face of [-1, 1]) {
      const faceX = x + face * 0.416;
=======
    b.part(new THREE.CylinderGeometry(1.025, 1.025, 0.96, 20, 1), tyrePaint, {
      name: `tyre${name}`, at: [x, 1.30, z], bone, dir: [1, 0, 0],
    });

    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 18; j++) {
        const deg = j * 20;
        const a = deg * Math.PI / 180;
        const treadGeometry = tileBox(
          [0.50, 0.18, 0.235], RUBBER, 0.030,
        );
        treadGeometry.rotateY((row ? -28 : 28) * Math.PI / 180);
        b.part(treadGeometry, "#ffffff", {
          name: `tread${name}_${row}_${j}`,
          at: [
            x + (row ? 0.235 : -0.235),
            1.30 + Math.cos(a) * 1.035,
            z + Math.sin(a) * 1.035,
          ],
          texture: RUBBER,
          bone,
          rotation: [deg, 0, 0],
        });
      }
    }

    for (const face of [-1, 1]) {
      const faceX = x + face * 0.486;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outerX = x + side * 0.443;
=======
    const outerX = x + side * 0.513;
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("roofHighlight", [0, 3.849, 0.12], [2.20, 0.018, 1.94], C.cyanHi);

  tiled("hood", [0, 2.70, 1.73], [2.18, 0.38, 1.28], BODY, 0.068);
=======
  box("roofHighlight", [0, 3.849, 0.12], [2.20, 0.018, 1.94], C.cyanHi);
  b.part(new THREE.PlaneGeometry(1.22, 1.22), "#ffffff", {
    name: "roofSkull",
    at: [0, 3.864, -0.12],
    bone: chassis,
    rotation: [-90, 0, 0],
    texture: SKULL,
  });
  for (const side of [1, -1]) {
    box(`roofRaceStripe${side}`, [side * 0.91, 3.864, 0.02],
      [0.11, 0.014, 1.70], C.yellow);
    for (let i = 0; i < 8; i++) {
      box(`roofChecker${side}_${i}`,
        [side * 0.75, 3.866, -0.70 + i * 0.19],
        [0.13, 0.016, 0.19],
        i % 2 ? C.ink : C.white);
    }
  }

  tiled("hood", [0, 2.70, 1.73], [2.18, 0.38, 1.28], BODY, 0.068);
>>>>>>> REPLACE

<<<<<<< SEARCH
    // Squared fender eyebrows emphasize the monster-truck stance.
    for (const z of [-1.65, 1.65]) {
      box(`fenderDark${side}_${z}`, [side * 1.18, 2.49, z],
        [0.46, 0.19, 2.08], C.ink);
      tiled(`fenderPaint${side}_${z}`, [side * 1.18, 2.60, z],
        [0.43, 0.09, 1.96], BODY, 0.060);
      box(`fenderStripe${side}_${z}`, [side * 1.402, 2.59, z],
        [0.018, 0.065, 1.87], C.yellow);
    }
=======
    // Front eyebrows stop behind the lamp faces, rather than masking them.
    for (const z of [-1.65, 1.65]) {
      const fenderZ = z > 0 ? 1.54 : z;
      const fenderLength = z > 0 ? 1.72 : 2.08;
      box(`fenderDark${side}_${z}`, [side * 1.18, 2.49, fenderZ],
        [0.46, 0.19, fenderLength], C.ink);
      tiled(`fenderPaint${side}_${z}`, [side * 1.18, 2.60, fenderZ],
        [0.43, 0.09, fenderLength - 0.12], BODY, 0.060);
      box(`fenderStripe${side}_${z}`, [side * 1.402, 2.59, fenderZ],
        [0.018, 0.065, fenderLength - 0.21], C.yellow);
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`bedRailTop${side}`, [side * 1.02, 3.042, -1.66],
      [0.16, 0.012, 1.46], C.cyanHi);
  }
=======
    box(`bedRailTop${side}`, [side * 1.02, 3.042, -1.66],
      [0.16, 0.012, 1.46], C.cyanHi);
    panel(`raceNumber${side}`, [side * 1.116, 2.76, -1.68],
      1.02, 0.36, NUMBER, [side, 0, 0]);
  }
>>>>>>> REPLACE