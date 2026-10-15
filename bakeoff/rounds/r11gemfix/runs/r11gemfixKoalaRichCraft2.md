Parts for the eucalyptus stand were being built before the root skeleton joint (`hips`) was defined, causing `b.part` to throw when searching for the nearest joint.

## Edits

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 3. EUCALYPTUS BRANCH STAND (SCENERY SITTING ON y = 0)
  // ---------------------------------------------------------------------------
=======
  // ---------------------------------------------------------------------------
  // 3. KOALA SKELETON (ANIMATION RIG HIERARCHY)
  // ---------------------------------------------------------------------------

  // ROOT: Pelvis & Hips (role: spine)
  const hips = b.joint("hips", {
    at: [0, 0.38, -0.07],
    dir: [0, 0.35, 0.94],
    role: "spine",
  });

  // Spine Mid (role: spine)
  const spineMid = b.joint("spineMid", {
    parent: hips,
    at: [0, 0.49, -0.06],
    dir: [0, 0.5, 0.86],
    role: "spine",
  });

  // Chest & Shoulders (role: spine)
  const chest = b.joint("chest", {
    parent: spineMid,
    at: [0, 0.60, -0.04],
    dir: [0, 0.7, 0.71],
    role: "spine",
  });

  // Neck (role: neck)
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.67, -0.01],
    dir: [0, 0.65, 0.76],
    role: "neck",
  });

  // Head (role: head)
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.74, 0.04],
    dir: [0, 0.25, 0.97],
    role: "head",
  });

  // Articulated Lower Jaw (role: jaw)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.70, 0.06],
    dir: [0, 0.1, 0.99],
    role: "jaw",
  });

  // Ears
  const earL = b.joint("earL", {
    parent: head,
    at: [0.11, 0.78, 0.03],
    dir: [0.85, 0.4, 0.34],
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.11, 0.78, 0.03],
    dir: [-0.85, 0.4, 0.34],
  });

  // Arms (Left side: +X > 0, Right side: -X < 0)
  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.13, 0.60, -0.03],
    dir: [0.5, -0.4, 0.77],
    role: "arm",
  });
  const elbowL = b.joint("elbowL", {
    parent: shoulderL,
    at: [0.18, 0.53, 0.05],
    dir: [-0.3, -0.2, 0.93],
    role: "arm",
  });
  const wristL = b.joint("wristL", {
    parent: elbowL,
    at: [0.13, 0.50, 0.13],
    dir: [-0.6, 0.1, 0.79],
    role: "arm",
  });

  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.13, 0.60, -0.03],
    dir: [-0.5, -0.4, 0.77],
    role: "arm",
  });
  const elbowR = b.joint("elbowR", {
    parent: shoulderR,
    at: [-0.18, 0.53, 0.05],
    dir: [0.3, -0.2, 0.93],
    role: "arm",
  });
  const wristR = b.joint("wristR", {
    parent: elbowR,
    at: [-0.13, 0.50, 0.13],
    dir: [0.6, 0.1, 0.79],
    role: "arm",
  });

  // Legs (Left side: +X > 0, Right side: -X < 0)
  const hipL = b.joint("hipL", {
    parent: hips,
    at: [0.13, 0.38, -0.05],
    dir: [0.4, -0.1, 0.91],
    role: "leg",
  });
  const kneeL = b.joint("kneeL", {
    parent: hipL,
    at: [0.18, 0.36, 0.03],
    dir: [-0.4, -0.3, 0.87],
    role: "leg",
  });
  const ankleL = b.joint("ankleL", {
    parent: kneeL,
    at: [0.12, 0.32, 0.09],
    dir: [-0.6, 0.0, 0.8],
    role: "leg",
  });

  const hipR = b.joint("hipR", {
    parent: hips,
    at: [-0.13, 0.38, -0.05],
    dir: [-0.4, -0.1, 0.91],
    role: "leg",
  });
  const kneeR = b.joint("kneeR", {
    parent: hipR,
    at: [-0.18, 0.36, 0.03],
    dir: [0.4, -0.3, 0.87],
    role: "leg",
  });
  const ankleR = b.joint("ankleR", {
    parent: kneeR,
    at: [-0.12, 0.32, 0.09],
    dir: [0.6, 0.0, 0.8],
    role: "leg",
  });

  // ---------------------------------------------------------------------------
  // 4. EUCALYPTUS BRANCH STAND (SCENERY SITTING ON y = 0)
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE
<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 4. KOALA SKELETON (ANIMATION RIG HIERARCHY)
  // ---------------------------------------------------------------------------

  // ROOT: Pelvis & Hips (role: spine)
  const hips = b.joint("hips", {
    at: [0, 0.38, -0.07],
    dir: [0, 0.35, 0.94],
    role: "spine",
  });

  // Spine Mid (role: spine)
  const spineMid = b.joint("spineMid", {
    parent: hips,
    at: [0, 0.49, -0.06],
    dir: [0, 0.5, 0.86],
    role: "spine",
  });

  // Chest & Shoulders (role: spine)
  const chest = b.joint("chest", {
    parent: spineMid,
    at: [0, 0.60, -0.04],
    dir: [0, 0.7, 0.71],
    role: "spine",
  });

  // Neck (role: neck)
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.67, -0.01],
    dir: [0, 0.65, 0.76],
    role: "neck",
  });

  // Head (role: head)
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.74, 0.04],
    dir: [0, 0.25, 0.97],
    role: "head",
  });

  // Articulated Lower Jaw (role: jaw)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.70, 0.06],
    dir: [0, 0.1, 0.99],
    role: "jaw",
  });

  // Ears
  const earL = b.joint("earL", {
    parent: head,
    at: [0.11, 0.78, 0.03],
    dir: [0.85, 0.4, 0.34],
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.11, 0.78, 0.03],
    dir: [-0.85, 0.4, 0.34],
  });

  // Arms (Left side: +X > 0, Right side: -X < 0)
  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.13, 0.60, -0.03],
    dir: [0.5, -0.4, 0.77],
    role: "arm",
  });
  const elbowL = b.joint("elbowL", {
    parent: shoulderL,
    at: [0.18, 0.53, 0.05],
    dir: [-0.3, -0.2, 0.93],
    role: "arm",
  });
  const wristL = b.joint("wristL", {
    parent: elbowL,
    at: [0.13, 0.50, 0.13],
    dir: [-0.6, 0.1, 0.79],
    role: "arm",
  });

  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.13, 0.60, -0.03],
    dir: [-0.5, -0.4, 0.77],
    role: "arm",
  });
  const elbowR = b.joint("elbowR", {
    parent: shoulderR,
    at: [-0.18, 0.53, 0.05],
    dir: [0.3, -0.2, 0.93],
    role: "arm",
  });
  const wristR = b.joint("wristR", {
    parent: elbowR,
    at: [-0.13, 0.50, 0.13],
    dir: [0.6, 0.1, 0.79],
    role: "arm",
  });

  // Legs (Left side: +X > 0, Right side: -X < 0)
  const hipL = b.joint("hipL", {
    parent: hips,
    at: [0.13, 0.38, -0.05],
    dir: [0.4, -0.1, 0.91],
    role: "leg",
  });
  const kneeL = b.joint("kneeL", {
    parent: hipL,
    at: [0.18, 0.36, 0.03],
    dir: [-0.4, -0.3, 0.87],
    role: "leg",
  });
  const ankleL = b.joint("ankleL", {
    parent: kneeL,
    at: [0.12, 0.32, 0.09],
    dir: [-0.6, 0.0, 0.8],
    role: "leg",
  });

  const hipR = b.joint("hipR", {
    parent: hips,
    at: [-0.13, 0.38, -0.05],
    dir: [-0.4, -0.1, 0.91],
    role: "leg",
  });
  const kneeR = b.joint("kneeR", {
    parent: hipR,
    at: [-0.18, 0.36, 0.03],
    dir: [0.4, -0.3, 0.87],
    role: "leg",
  });
  const ankleR = b.joint("ankleR", {
    parent: kneeR,
    at: [-0.12, 0.32, 0.09],
    dir: [0.6, 0.0, 0.8],
    role: "leg",
  });
=======
>>>>>>> REPLACE
<<<<<<< SEARCH
      const digitPos = offset(wrist.at, [s * dx, -0.005, dz], 1);

      // Knuckle/Digit block
      b.part(new THREE.BoxGeometry(0.016, 0.016, 0.026), C_DARK_GREY, {
        bone: wrist,
        at: digitPos,
        name: `digit_${tag}_${d.id}`,
      });

      // Curved Talon Claw (stepped extrusion)
      b.extrude(CLAW_OUTLINE, {
        bone: wrist,
        at: offset(digitPos, [s * (dx * 0.4), -0.01, dz * 0.4], 1),
        x: [s * Math.sin(rad), -0.3, Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `claw_${tag}_${d.id}`,
      });
=======
      const digitPos = wrist.at.clone().add(new THREE.Vector3(s * dx, -0.005, dz));

      // Knuckle/Digit block
      b.part(new THREE.BoxGeometry(0.016, 0.016, 0.026), C_DARK_GREY, {
        bone: wrist,
        at: digitPos,
        name: `digit_${tag}_${d.id}`,
      });

      // Curved Talon Claw (stepped extrusion)
      b.extrude(CLAW_OUTLINE, {
        bone: wrist,
        at: digitPos.clone().add(new THREE.Vector3(s * dx * 0.4, -0.01, dz * 0.4)),
        x: [s * Math.sin(rad), -0.3, Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `claw_${tag}_${d.id}`,
      });
>>>>>>> REPLACE
<<<<<<< SEARCH
      const toePos = offset(ankle.at, [s * tx, -0.005, tz], 1);

      // Toe segment
      b.part(new THREE.BoxGeometry(0.018, 0.018, 0.024), C_DARK_GREY, {
        bone: ankle,
        at: toePos,
        name: `toe_${tag}_${t.id}`,
      });

      // Curved Hind Claw
      b.extrude(CLAW_OUTLINE, {
        bone: ankle,
        at: offset(toePos, [s * (tx * 0.4), -0.01, tz * 0.4], 1),
        x: [s * Math.sin(rad), -0.3, Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `hind_claw_${tag}_${t.id}`,
      });
=======
      const toePos = ankle.at.clone().add(new THREE.Vector3(s * tx, -0.005, tz));

      // Toe segment
      b.part(new THREE.BoxGeometry(0.018, 0.018, 0.024), C_DARK_GREY, {
        bone: ankle,
        at: toePos,
        name: `toe_${tag}_${t.id}`,
      });

      // Curved Hind Claw
      b.extrude(CLAW_OUTLINE, {
        bone: ankle,
        at: toePos.clone().add(new THREE.Vector3(s * tx * 0.4, -0.01, tz * 0.4)),
        x: [s * Math.sin(rad), -0.3, Math.cos(rad)],
        y: [0, -1, 0],
        thickness: 0.005,
        color: C_CLAW,
        name: `hind_claw_${tag}_${t.id}`,
      });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.004, 0.005, 0.10, 6), C_RED_GUM, {
    bone: wristL,
    at: mid(snackBase, snackTip),
    dir: offset(snackTip, snackBase, -1),
    name: "snack_twig_stem",
  });
=======
  const snackDir = new THREE.Vector3().subVectors(snackTip, snackBase).normalize();

  b.part(new THREE.CylinderGeometry(0.004, 0.005, 0.10, 6), C_RED_GUM, {
    bone: wristL,
    at: mid(snackBase, snackTip),
    dir: snackDir,
    name: "snack_twig_stem",
  });
>>>>>>> REPLACE