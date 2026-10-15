1. **Integrate the face into the head.** The raised eye masks and separate brow lumps read like goggles. Conform the eyes and brows to the skull, soften the cheek transitions, and close the overly pronounced mouth seam.
2. **Make the silhouette plush rather than armored.** Blend the upper legs into the body, thicken the stockings slightly, and remove the triangular back and tail “spikes.”
3. **Restore richer red-panda coloring.** Shift the bright orange toward russet, with a connected cream lower face and warmer, softer tail rings.
4. **Make the stone feel ancient and natural.** Replace the straight-sided plinth with an irregular, chamfered boulder, ground its loose chips, and add a little trailing vegetation.
5. **Add restrained character.** Give the head a slight inquisitive tilt while preserving all four paw contacts and the extended, riggable tail.

<<<<<<< SEARCH
  const ORANGE = cel("#cb5936", "#913d39");
  const LIGHT_ORANGE = cel("#e47e43", "#b45138");
  const TAIL_CREAM = cel("#e9b677", "#b97e54");
=======
  const ORANGE = cel("#bc4e35", "#863c38");
  const LIGHT_ORANGE = cel("#d36c40", "#a74a37");
  const TAIL_CREAM = cel("#e5b77f", "#b78259");
>>>>>>> REPLACE

<<<<<<< SEARCH
      <path d="M10 53 Q13 18 48 19 Q88 18 93 53 Q88 96 52 103 Q15 99 10 53Z" fill="#302333"/>
=======
      <path d="M3 58 Q0 13 46 3 Q94 0 98 55 Q100 106 53 118 Q5 113 3 58Z" fill="#fff0cf"/>
      <path d="M10 53 Q13 18 48 19 Q88 18 93 53 Q88 96 52 103 Q15 99 10 53Z" fill="#302333"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const earTexture = svg(
=======
  const browTexture = svg(
    `<svg viewBox="0 0 120 40">
      <path d="M5 29 Q46 2 94 12 L115 24 Q62 17 12 36Z" fill="#fff0cf"/>
      <path d="M14 26 Q53 9 91 16" fill="none" stroke="#fff9e5" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const furMarkTexture = svg(
    `<svg viewBox="0 0 120 80">
      <g fill="none" stroke="#a14934" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 16L33 32L46 21"/>
        <path d="M52 31L68 49L82 37"/>
        <path d="M32 48L44 61L55 53"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rockGeometry = new THREE.CylinderGeometry(0.43, 0.49, 0.20, 9, 1);
  const rock = b.part(rockGeometry, stonePaint, {
    at: [0, 0.10, -0.015],
    scale: [1, 1, 1.10],
    name: "ancient_balancing_stone",
    bone: hips,
    flat: true,
  });
=======
  const rockGeometry = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.385, 0),
      new THREE.Vector2(0.475, 0.043),
      new THREE.Vector2(0.455, 0.139),
      new THREE.Vector2(0.420, 0.20),
      new THREE.Vector2(0, 0.20),
    ],
    11,
  );
  const rockVertices = rockGeometry.getAttribute("position");
  for (let i = 0; i < rockVertices.count; i++) {
    const x = rockVertices.getX(i);
    const z = rockVertices.getZ(i);
    const angle = Math.atan2(z, x);
    const irregularity =
      1 + 0.045 * Math.sin(angle * 3 + 0.4) +
      0.025 * Math.cos(angle * 5 - 0.6);
    rockVertices.setXYZ(
      i,
      x * irregularity,
      rockVertices.getY(i),
      z * irregularity,
    );
  }
  rockGeometry.computeVertexNormals();
  const rock = b.part(rockGeometry, stonePaint, {
    at: [0, 0, -0.015],
    scale: [1, 1, 1.10],
    name: "ancient_balancing_stone",
    bone: hips,
    flat: true,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [x, z, size] of [
    [-0.36, 0.26, 0.075],
    [0.39, 0.19, 0.055],
    [-0.34, -0.31, 0.06],
    [0.29, -0.38, 0.065],
  ]) {
    ellipsoid([x, 0.07, z], [size, 0.065, size * 0.8], stonePaint, hips, "stone_chip", 7);
  }
=======
  for (const [x, z, size] of [
    [-0.39, 0.23, 0.065],
    [0.40, 0.18, 0.052],
    [-0.32, -0.35, 0.054],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, size * 0.40, z],
      scale: [size, size * 0.45, size * 0.85],
      rotation: [0, x * 97, 0],
      bone: hips,
      flat: true,
      name: "grounded_angular_stone_chip",
    });
  }

  // Creepers grow from the moss and follow the actual boulder surface.
  for (const s of [-1, 1]) {
    const vine = rockSurface.drape(
      catmull([
        [s * 0.29, 0.205, 0.30],
        [s * 0.34, 0.16, 0.32],
        [s * 0.37, 0.105, 0.31],
        [s * 0.36, 0.065, 0.33],
      ]),
      { lift: 0.006 },
    );
    b.sweep(vine, [0.0045, 0.002], {
      color: "#527850",
      bone: hips,
      sides: 5,
      name: "stone_hugging_creeper",
    });
    b.along(vine, 4, (at) => {
      const alternate = Math.floor(at.t * 8) % 2 ? -1 : 1;
      b.extrude(
        [
          [0, 0],
          [-0.015, -0.008],
          [-0.021, -0.025],
          [0, -0.048],
          [0.018, -0.024],
          [0.013, -0.007],
        ],
        {
          at,
          x: [1, 0, 0],
          y: [alternate * 0.55, 1, 0.08],
          thickness: 0.003,
          color: alternate > 0 ? "#87a960" : "#668d52",
          bone: hips,
          name: "trailing_creeper_leaf",
        },
      );
      b.sweep(
        [
          at.at,
          [
            at.at.x - alternate * 0.018,
            at.at.y - 0.035,
            at.at.z + 0.004,
          ],
        ],
        [0.0016, 0.0007],
        {
          color: "#c1cd8c",
          bone: hips,
          sides: 4,
          name: "creeper_leaf_vein",
        },
      );
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t) => [0.155 - 0.012 * t, 0.169 - 0.018 * t],
=======
    (t) => [0.168 - 0.012 * t, 0.182 - 0.018 * t],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(chain, [0.048, 0.055, 0.048], {
      color: DARK,
      sides: 7,
      name: front ? "foreleg" : "hindleg",
    });
    ellipsoid(
      [side * 0.139, 0.475, front ? 0.12 : -0.22],
      [front ? 0.088 : 0.105, 0.126, 0.109],
      front ? ORANGE : LIGHT_ORANGE,
      chain.joints[0],
      "rounded_upper_leg",
    );
=======
    b.sweep(chain, [0.057, 0.062, 0.052], {
      color: DARK,
      sides: 8,
      name: front ? "foreleg" : "hindleg",
    });
    ellipsoid(
      [side * 0.112, 0.485, front ? 0.10 : -0.205],
      [front ? 0.076 : 0.096, 0.112, 0.112],
      ORANGE,
      chain.joints[0],
      "blended_upper_leg",
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let j = 0; j < 2; j++) {
      tuft(
        [side * 0.19, 0.46 - j * 0.036, front ? 0.10 : -0.20],
        [side * (0.224 - j * 0.008), 0.413 - j * 0.035, front ? 0.058 : -0.27],
        0.035,
        j === 0 ? LIGHT_ORANGE : ORANGE,
        chain.joints[0],
        "broad_leg_fur",
      );
    }
=======
    if (!front) {
      tuft(
        [side * 0.171, 0.465, -0.243],
        [side * 0.183, 0.427, -0.291],
        0.028,
        ORANGE,
        chain.joints[0],
        "soft_hock_fur",
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailTube = b.sweep(
=======
  b.sweep(
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Broad, swept-back fur shapes preserve the tail's plush silhouette.
  for (const t of [0.16, 0.39, 0.62, 0.83]) {
    for (const angle of [-68, 68]) {
      const at = tailTube.at(t, angle);
      const tip = at.at.clone().addScaledVector(at.tangent, 0.065);
      tip.addScaledVector(at.n, 0.012);
      b.sweep([at, tip], [0.018, 0], {
        color: t < 0.23 || (t > 0.34 && t < 0.45) ||
          (t > 0.56 && t < 0.67) || (t > 0.78 && t < 0.89)
          ? TAIL_CREAM : ORANGE,
        bone: at.bone!,
        sides: 5,
        caps: "flat",
        name: "swept_tail_fur",
      });
    }
  }
=======
  // The uninterrupted ringed tail is the main counterbalancing silhouette.
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skull = ellipsoid(
    headPoint([0, 0, 0]),
    [0.215 * H, 0.185 * H, 0.177 * H],
    LIGHT_ORANGE,
    head,
    "large_panda_head",
    16,
  );
=======
  const faceCoat = paint((p, n) => {
    const localY = p.y - head.at.y;
    const localX = Math.abs(p.x - head.at.x);
    const creamBoundary =
      -0.059 + 0.022 * Math.min(1, localX / 0.16);
    if (localY < creamBoundary && n.z > 0.24) return CREAM;
    return n.y > 0.15 ? LIGHT_ORANGE : ORANGE;
  });
  const skull = ellipsoid(
    headPoint([0, 0, 0]),
    [0.215 * H, 0.168 * H, 0.177 * H],
    faceCoat,
    head,
    "large_panda_head",
    16,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(
      headPoint([s * 0.144, -0.059, 0.12]),
      [0.089, 0.054, 0.041],
      CREAM,
      head,
      "cream_cheek",
    );

    for (let j = 0; j < 4; j++) {
      tuft(
        headPoint([s * (0.15 + j * 0.005), -0.033 - j * 0.025, 0.09]),
        headPoint([s * (0.254 - j * 0.012), -0.05 - j * 0.032, 0.075]),
        0.038 - j * 0.003,
        CREAM,
        head,
        "cheek_ruff",
      );
    }

    const patch = ellipsoid(
      headPoint([s * 0.103, 0.022, 0.145]),
      [0.08, 0.085, 0.029],
      CREAM,
      head,
      "cream_eye_mask",
      14,
    );
=======
    ellipsoid(
      headPoint([s * 0.133, -0.066, 0.108]),
      [0.096, 0.057, 0.034],
      CREAM,
      head,
      "integrated_cream_cheek",
    );

    for (let j = 0; j < 3; j++) {
      tuft(
        headPoint([s * 0.158, -0.045 - j * 0.022, 0.10]),
        headPoint([s * (0.243 - j * 0.008), -0.05 - j * 0.032, 0.083]),
        0.032 - j * 0.002,
        CREAM,
        head,
        "broad_cheek_ruff",
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(
      headPoint([s * 0.111, -0.018, 0.17]),
      headPoint([s * 0.151, -0.092, 0.156]),
      0.024,
      TEAR,
      head,
      "panda_tear",
    );

    b.decal(patch, eyeTexture, {
      at: face.p([s * 0.103, 0.021, 0.18]),
      dir: [s * 0.12, 0, 1],
      size: [0.124, 0.145],
      lift: 0.0025,
      mirror: s > 0,
      bone: head,
      name: "amber_anime_eye",
    });

    const brow = ellipsoid(
      headPoint([s * 0.096, 0.099, 0.127]),
      [0.064, 0.021, 0.022],
      CREAM,
      head,
      "expressive_cream_brow",
    );
    brow.mesh.userData.feature = "brow";
=======
    b.extrude(
      [
        [-0.015, 0.012],
        [0.015, 0.006],
        [0.033, -0.048],
        [0.009, -0.036],
      ],
      {
        at: face.p([s * 0.112, -0.031, 0.145]),
        x: [s, 0, -0.25],
        y: [0, 1, 0.35],
        thickness: 0.006,
        color: TEAR,
        bone: head,
        name: "flat_russet_tear_mark",
      },
    );

    b.decal(skull, eyeTexture, {
      at: face.p([s * 0.10, 0.022, 0.18]),
      dir: [s * 0.22, 0.035, 1],
      size: [0.116, 0.137],
      segments: 12,
      lift: 0.002,
      mirror: s > 0,
      bone: head,
      name: "integrated_amber_eye",
    });

    b.decal(skull, browTexture, {
      at: face.p([s * 0.096, 0.105, 0.14]),
      dir: [s * 0.18, 0.20, 1],
      size: [0.102, 0.031],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
      name: "painted_cream_brow",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(
      bezier(
        face.p([s * 0.07, -0.078, 0.226]),
        face.p([s * 0.16, -0.065, 0.233]),
        face.p([s * 0.225, -0.039, 0.208]),
      ),
      [0.0025, 0.0007],
      { color: "#eed7b7", bone: head, sides: 4, name: "fine_whisker" },
    );
=======
    for (let whisker = 0; whisker < 2; whisker++) {
      b.sweep(
        bezier(
          face.p([s * 0.069, -0.076 - whisker * 0.009, 0.224]),
          face.p([s * 0.125, -0.079 - whisker * 0.014, 0.227]),
          face.p([s * 0.18, -0.065 - whisker * 0.027, 0.203]),
        ),
        [0.0014, 0.0004],
        { color: "#eed7b7", bone: head, sides: 4, name: "fine_whisker" },
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  ellipsoid(
    headPoint([0, -0.101, 0.183]),
    [0.076, 0.010, 0.05],
    INK,
    jaw,
    "mouth_separation",
  );
  ellipsoid(
    headPoint([0, -0.11, 0.175]),
    [0.079, 0.022, 0.054],
    CREAM,
    jaw,
    "lower_jaw",
  );
=======
  ellipsoid(
    headPoint([0, -0.098, 0.183]),
    [0.068, 0.0045, 0.043],
    INK,
    jaw,
    "subtle_mouth_separation",
  );
  ellipsoid(
    headPoint([0, -0.106, 0.175]),
    [0.073, 0.018, 0.049],
    CREAM,
    jaw,
    "lower_jaw",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Broad swept fur accents, not a row of dorsal spikes.
  const backSurface = b.surface(body);
  for (const s of [-1, 1]) {
    for (const z of [-0.16, -0.055]) {
      const hit = backSurface.nearest([s * 0.11, 0.68, z]);
      const tip = hit.at.clone().add(new THREE.Vector3(s * 0.012, 0.005, -0.065));
      b.sweep([hit, tip], [0.026, 0], {
        color: LIGHT_ORANGE,
        bone: hit.bone!,
        caps: "flat",
        sides: 5,
        name: "swept_shoulder_fur",
      });
    }
  }
=======
  // Painted fur gestures preserve the rounded body silhouette.
  const backSurface = b.surface(body);
  for (const s of [-1, 1]) {
    const hit = backSurface.nearest([s * 0.10, 0.69, -0.085]);
    b.decal(body, furMarkTexture, {
      at: hit,
      dir: hit.n,
      up: [0, 0, -1],
      size: [0.105, 0.075],
      lift: 0.0015,
      mirror: s > 0,
      name: "painted_russet_fur_gestures",
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.root;
}
=======
  // An inquisitive expression without disturbing the planted, riggable stance.
  b.pose(head, { axis: [0, 0, 1], deg: -4 });

  return b.root;
}
>>>>>>> REPLACE