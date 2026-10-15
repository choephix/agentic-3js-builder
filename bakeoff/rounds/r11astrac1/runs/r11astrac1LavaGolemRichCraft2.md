1. **Make the basalt read as carved volcanic stone, not black metal.** Lift the slate tones, sharpen the warm/cool facet contrast, and add broad fractured edges.
2. **Replace exposed “orange ball joints” with narrow molten gaps.** Thicken the limbs and add overlapping side armor, especially around the hips and knees.
3. **Give the lava real depth.** Add recessed, branching fissures across the shoulder surfaces, with dark crust, orange channels, and fine hot centers.
4. **Strengthen the face and hierarchy.** Enlarge the eyes slightly, simplify their mirroring, and quiet the pedestal so the face and furnace heart remain the focal points.
5. **Fix the floating rear fissures.** Seat them directly on the back armor.

<<<<<<< SEARCH
    ember: "#e44116",
    orange: "#ff781e",
=======
    ember: "#b9290b",
    orange: "#ff8018",
>>>>>>> REPLACE

<<<<<<< SEARCH
  const basalt = paint((p, n) => {
    const v = noise(p, 0.19, 4);
    const base = mix("#252733", "#444b5b", v * 0.65 + Math.max(0, n.y) * 0.25);
    return mix(base, "#6b4a44", Math.max(0, -n.y) * 0.16);
  });
  const paleBasalt = paint((p, n) => {
    const v = noise(p, 0.14, 11);
    return mix("#383b4b", "#6b6d79", v * 0.57 + Math.max(0, n.y) * 0.27);
  });
=======
  const basalt = paint((p, n) => {
    const v = noise(p, 0.23, 4);
    const lit = n.x * 0.35 + n.y * 0.80 + n.z * 0.48 > 0.24;
    const base = lit
      ? mix("#454957", "#626577", v * 0.48)
      : mix("#252535", "#393949", v * 0.48);
    return mix(base, "#81432d", Math.max(0, -n.y) * 0.22);
  });
  const paleBasalt = paint((p, n) => {
    const v = noise(p, 0.20, 11);
    const lit = n.x * 0.35 + n.y * 0.80 + n.z * 0.48 > 0.20;
    return lit
      ? mix("#606471", "#85838b", v * 0.55)
      : mix("#353344", "#515062", v * 0.45);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      <g fill="none" stroke="#b17f54">
=======
      <g fill="none" stroke="#675044">
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eye = drawing(`furnaceEye${s}`, [s * 0.155, 3.305, 0.279],
      [0.235, 0.093], eyeTex, head, true);
    if (s < 0) eye.mesh.geometry.scale(-1, 1, 1).setIndex(
      eye.mesh.geometry.index
        ? Array.from(eye.mesh.geometry.index.array).reduce<number[]>((a, _, i, arr) => {
            if (i % 3 === 0) a.push(arr[i], arr[i + 2], arr[i + 1]);
            return a;
          }, [])
        : [],
    );
=======
    const eye = drawing(`furnaceEye${s}`, [s * 0.155, 3.301, 0.283],
      [0.249, 0.109], eyeTex, head, true);
    if (s < 0) {
      const uv = eye.mesh.geometry.getAttribute("uv");
      for (let i = 0; i < uv.count; i++)
        uv.setX(i, 1 - uv.getX(i));
      uv.needsUpdate = true;
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.sweep(arm, [0.23, 0.18, 0.14], {
=======
    glow(b.sweep(arm, [0.18, 0.135, 0.11], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.sweep(leg, [0.23, 0.20, 0.18], {
=======
    glow(b.sweep(leg, [0.18, 0.15, 0.14], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    molten(`elbowFire${side}`, [s * 1.43, 2.46, 0.015],
      [0.21, 0.205, 0.20], elbow, C.yellow);
=======
    molten(`elbowFire${side}`, [s * 1.43, 2.46, 0.015],
      [0.17, 0.165, 0.16], elbow, C.orange);
>>>>>>> REPLACE

<<<<<<< SEARCH
    plate(`thighMass${side}`, [s * 0.51, 1.23, 0],
      0.47, 0.49, 0.55, thigh, basalt);
=======
    plate(`thighMass${side}`, [s * 0.51, 1.23, 0],
      0.54, 0.53, 0.61, thigh, basalt);
>>>>>>> REPLACE

<<<<<<< SEARCH
    molten(`kneeFire${side}`, [s * 0.58, 0.96, 0.015],
      [0.22, 0.20, 0.23], knee, C.yellow);
=======
    molten(`kneeFire${side}`, [s * 0.58, 0.96, 0.015],
      [0.18, 0.16, 0.18], knee, C.orange);
>>>>>>> REPLACE

<<<<<<< SEARCH
    plate(`shinMass${side}`, [s * 0.63, 0.66, 0.035],
      0.50, 0.48, 0.54, knee, basalt);
=======
    plate(`shinMass${side}`, [s * 0.63, 0.66, 0.035],
      0.55, 0.51, 0.61, knee, basalt);
>>>>>>> REPLACE

<<<<<<< SEARCH
    drawing(`footBand${side}`, [s * 0.64, 0.39, 0.477],
      [0.36, 0.055], trimTex, ankle);
  }
=======
    drawing(`footBand${side}`, [s * 0.64, 0.39, 0.477],
      [0.36, 0.055], trimTex, ankle);

    // Overlapping side plates conceal the oversized luminous armature
    // without bridging the articulation between separate bones.
    const hipShell = b.extrude(
      [
        [-0.25, 0.12], [-0.13, 0.25], [0.17, 0.22],
        [0.27, 0.02], [0.17, -0.22], [-0.16, -0.25],
      ],
      {
        at: [s * 0.735, 1.36, 0.015],
        x: [0, 0, -s], y: [0, 1, 0],
        thickness: 0.17, bevel: 0.025,
        color: basalt, bone: thigh, name: `hipOuterShell${side}`,
      },
    );
    b.decal(hipShell, crackTex, {
      at: [s * 0.83, 1.37, 0.015], dir: [s, 0, 0],
      size: [0.29, 0.30], bone: thigh,
      name: `hipOuterFracture${side}`,
    });

    plate(`kneeOuterShield${side}`,
      [s * 0.79, 0.98, 0.01],
      0.34, 0.29, 0.14, knee, paleBasalt, 0.25,
      [0, 0, -s]);
    plate(`calfRearShield${side}`,
      [s * 0.63, 0.68, -0.275],
      0.40, 0.42, 0.14, knee, basalt, 0.22);

    const armShell = plate(`upperArmOuterShell${side}`,
      [s * 1.28, 2.56, -0.20],
      0.43, 0.35, 0.22, shoulder, basalt, 0.24);
    b.decal(armShell, crackTex, {
      at: [s * 1.28, 2.56, -0.32],
      dir: [0, 0, -1], size: [0.26, 0.23],
      bone: shoulder, name: `upperArmRearFracture${side}`,
    });

    // Large chipped facets interrupt the repeated manufactured plate edges.
    b.extrude(
      [[-0.15, -0.10], [0.16, -0.07], [0.20, 0.13], [-0.04, 0.21]],
      {
        at: [s * 1.26, 2.70, 0.40],
        x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.10, bevel: 0.012,
        color: basalt, bone: shoulder, name: `shoulderBrokenLip${side}`,
      },
    );
    b.extrude(
      [[-0.14, -0.08], [0.14, -0.12], [0.17, 0.08], [-0.10, 0.15]],
      {
        at: [s * 0.72, 0.52, 0.365],
        x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.08, bevel: 0.01,
        color: basalt, bone: knee, name: `shinBrokenLip${side}`,
      },
    );

    // Real branching channels wrap over the top and rear of each shoulder.
    // All three layers share a surface-projected route.
    const shoulderSurface = b.surface(shoulder);
    const routes: P[][] = [
      [
        [s * 0.84, 3.13, 0.22],
        [s * 0.97, 3.14, 0.11],
        [s * 1.10, 3.08, -0.02],
        [s * 1.05, 2.99, -0.25],
        [s * 1.18, 2.79, -0.37],
      ],
      [
        [s * 1.10, 3.08, -0.02],
        [s * 1.29, 3.04, -0.09],
        [s * 1.39, 2.94, -0.16],
      ],
    ];
    routes.forEach((points, i) => {
      const channel = shoulderSurface.drape(points, { lift: 0.003 });
      b.sweep(channel, 0.026, {
        color: C.recess, bone: shoulder, sides: 5,
        name: `shoulderCrustChannel${side}${i}`,
      });
      glow(b.sweep(channel, 0.014, {
        color: C.orange, bone: shoulder, sides: 5,
        name: `shoulderLavaChannel${side}${i}`,
      }), 1.4);
      glow(b.sweep(channel, 0.0045, {
        color: C.yellow, bone: shoulder, sides: 4,
        name: `shoulderHotFilament${side}${i}`,
      }), 1.8);
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.23, 2.83, -0.63],
      [s * 0.36, 2.63, -0.63],
      [s * 0.27, 2.45, -0.63],
=======
      [s * 0.23, 2.83, -0.575],
      [s * 0.36, 2.63, -0.575],
      [s * 0.27, 2.45, -0.575],
>>>>>>> REPLACE