1. **Remove the exposed maroon wing crescents.** Retract the structural web beneath the plumage so the wings read as layered feathers, not bat-like membranes.
2. **Make the fire colours cleaner and brighter.** Replace muddy bronze transitions with lacquer-red, vivid orange, and pale-gold tips; reserve cream for intentional accents.
3. **Strengthen the face.** Bring the eyes farther forward and enlarge them slightly, while sweeping the crown backward for a more regal profile.
4. **Finish the bird’s body silhouette.** Add overlapping throat, flank, and back plumage to hide the bare, mannequin-like transitions.
5. **Give the tail and wing edges more elemental character.** Broaden the streaming pennants and add a few attached flame tongues. Keep the floating embers—they are intentional and read correctly.

<<<<<<< SEARCH
    const hit = headSurface.around(hp(0, 0.01, 0)).at(s * 43, 15);
    b.decal(skull, eyeTexture, {
      at: hit,
      dir: hit.n,
      size: [0.166 * H, 0.113 * H],
=======
    const hit = headSurface.around(hp(0, 0.01, 0)).at(s * 33, 15);
    b.decal(skull, eyeTexture, {
      at: hit,
      dir: hit.n,
      size: [0.191 * H, 0.132 * H],
>>>>>>> REPLACE

<<<<<<< SEARCH
      hp(i * 0.067, 0.155 - abs * 0.008, -0.06 - abs * 0.02),
      hp(i * 0.142, 0.70 - abs * 0.12, -0.115 - abs * 0.025),
=======
      hp(i * 0.067, 0.155 - abs * 0.008, -0.065 - abs * 0.025),
      hp(i * 0.142, 0.70 - abs * 0.12, -0.30 - abs * 0.065),
>>>>>>> REPLACE

<<<<<<< SEARCH
      const rootColor = kind === "covert" ? "#a62538" : "#91243b";
      const midColor = kind === "covert" ? "#ec6438" : "#ff8737";
      let c = mix(rootColor, midColor, Math.min(1, t * 1.6));
      if (t > 0.58) c = mix(c, "#ffe6a0", (t - 0.58) / 0.42);
      if (side > 0.34 && t > 0.12) c = mix(c, "#ffc56c", 0.48);
      const shade = 0.83 + lit * 0.17 + (noise(p, 0.09, 3) - 0.5) * 0.045;
=======
      const rootColor = kind === "covert" ? "#be2940" : "#c53242";
      const midColor = kind === "covert" ? "#ff713c" : "#ff9d42";
      let c = mix(rootColor, midColor, Math.min(1, t * 1.85));
      if (t > 0.49) c = mix(c, "#fff0aa", (t - 0.49) / 0.51);
      if (side > 0.39 && t > 0.12) c = mix(c, "#ffd478", 0.55);
      const shade = 0.94 + lit * 0.06 + (noise(p, 0.09, 3) - 0.5) * 0.025;
>>>>>>> REPLACE

<<<<<<< SEARCH
      [
        [s * 0.33, 1.57, -0.07],
        [s * 0.9, 1.47, -0.19],
        [s * 1.53, 1.78, -0.29],
        [s * 2.03, 2.36, -0.3],
      ],
=======
      [
        [s * 0.33, 1.84, -0.085],
        [s * 0.9, 2.04, -0.17],
        [s * 1.53, 2.27, -0.27],
        [s * 1.88, 2.45, -0.3],
      ],
>>>>>>> REPLACE

<<<<<<< SEARCH
          [s * (x + 0.14 + f * 0.055), y - 0.34 + f * 0.11, z + 0.045],
          0.175 + f * 0.025,
          wing.joints[f < 0.37 ? 0 : f < 0.78 ? 1 : 2],
          row === 0 && i % 3 === 0 ? "cream" : "covert",
          false,
=======
          [s * (x + 0.14 + f * 0.055), y - 0.40 + f * 0.11, z + 0.075],
          0.195 + f * 0.025,
          wing.joints[f < 0.37 ? 0 : f < 0.78 ? 1 : 2],
          "covert",
          row === 0 && i % 3 === 0,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const chestSurface = b.surface(torso);
=======
  // Shingled throat feathers bridge the head and breast, with a narrow
  // luminous center and deeper red lateral hackles.
  for (let row = 0; row < 3; row++) {
    const y = 2.34 - row * 0.115;
    const z = 0.19 - row * 0.019;
    for (let col = -1; col <= 1; col++) {
      feather(
        `Throat gorget ${row} ${col}`,
        [col * 0.078, y, z],
        [col * 0.107, y - 0.205, z + 0.065],
        col === 0 ? 0.115 : 0.108,
        neck.joints[row === 0 ? 2 : row === 1 ? 1 : 0],
        col === 0 ? "cream" : "covert",
        col === 0 && row === 1,
      );
    }
  }

  // Outward-splayed flank feathers remove the exposed humanoid hip contour.
  for (const s of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      for (let layer = 0; layer < 2; layer++) {
        feather(
          `Flank plumage ${s} ${row} ${layer}`,
          [s * (0.205 + layer * 0.025), 1.64 - row * 0.15, 0.02 - layer * 0.12],
          [s * (0.345 + layer * 0.045), 1.31 - row * 0.15, -0.025 - layer * 0.13],
          0.17,
          row === 2 ? hips : spine.joints[0],
          "covert",
          layer === 0 && row === 1,
        );
      }
    }
  }

  // Back-facing feathers give the creature a finished side and rear view.
  for (let row = 0; row < 4; row++) {
    for (let col = -1; col <= 1; col++) {
      const y = 1.98 - row * 0.17;
      feather(
        `Dorsal mantle ${row} ${col}`,
        [col * 0.112, y, -0.19 - row * 0.014],
        [col * 0.16, y - 0.30, -0.34 - row * 0.014],
        0.18,
        row < 2 ? spine.joints[1] : spine.joints[0],
        "flight",
        false,
      );
    }
  }

  const chestSurface = b.surface(torso);
>>>>>>> REPLACE

<<<<<<< SEARCH
      width: 0.31,
=======
      width: 0.38,
>>>>>>> REPLACE

<<<<<<< SEARCH
        width: 0.285,
=======
        width: 0.36,
>>>>>>> REPLACE

<<<<<<< SEARCH
        width: 0.24,
=======
        width: 0.30,
>>>>>>> REPLACE

<<<<<<< SEARCH
      let c = mix("#a72a40", "#ff9742", Math.min(1, t * 1.35));
      if (across > 0.77) c = mix(c, "#ffe49a", 0.85);
      if (t > 0.8) c = mix(c, "#fff1a9", (t - 0.8) * 4);
      const k = 0.88 + Math.max(0, n.y) * 0.12;
=======
      let c = mix("#d33648", "#ffad4c", Math.min(1, t * 1.6));
      if (across > 0.77) c = mix(c, "#ffe8a3", 0.85);
      if (t > 0.68) c = mix(c, "#fff1a9", (t - 0.68) * 2.8);
      const k = 0.97 + Math.max(0, n.y) * 0.03;
>>>>>>> REPLACE

<<<<<<< SEARCH
    fireShard(`Wing-tip fire ${s}`, [s * 2.49, 2.49, -0.3], 0.23, s * 0.32, wingRigs[s > 0 ? 0 : 1].wing.tip!);

    for (let i = 0; i < 6; i++) {
=======
    fireShard(`Wing-tip fire ${s}`, [s * 2.49, 2.49, -0.3], 0.23, s * 0.32, wingRigs[s > 0 ? 0 : 1].wing.tip!);

    // These flames grow directly from selected flight-feather tips.
    const rig = wingRigs[s > 0 ? 0 : 1];
    for (const i of [2, 4, 6]) {
      const f = i / 8;
      const tip = primaryTips[i];
      fireShard(
        `Living flight flame ${s} ${i}`,
        [
          s * (tip[0] - 0.025),
          tip[1] + 0.055,
          -0.3 - 0.085 * Math.sin(f * Math.PI) + 0.012,
        ],
        0.16 + i * 0.009,
        s * (0.42 + i * 0.035),
        rig.fans[Math.min(3, Math.floor(i / 2.4))],
      );
    }

    for (let i = 0; i < 6; i++) {
>>>>>>> REPLACE