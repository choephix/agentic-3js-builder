Cause: nullable chain tips were passed as joint parents/bones, and `ChainPoint` positions were treated like `Vector3`s without accessing `.at`.

<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck", "neckTop"], role: "neck" },
=======
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: leg.at(1).clone().add(new THREE.Vector3(0, -0.025, 0.045)),
=======
      at: leg.at(1).at.clone().add(new THREE.Vector3(0, -0.025, 0.045)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.18, 0.075, 0.1], leg.at(1).clone().add(new THREE.Vector3(0, 0.055, 0.16)), BRASS, leg.tip, `bootTrim${s}`);
=======
    box([0.18, 0.075, 0.1], leg.at(1).at.clone().add(new THREE.Vector3(0, 0.055, 0.16)), BRASS, leg.tip!, `bootTrim${s}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.11, arm.tip.at, SKIN_LIGHT, arm.tip, [1, 0.8, 1.1], `fist${s}`);
=======
    sphere(0.11, arm.tip!.at, SKIN_LIGHT, arm.tip!, [1, 0.8, 1.1], `fist${s}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.ring(arm.at(0.72), { count: 6, radius: 0.081, fromDeg: 0, toDeg: 300 }, (p) =>
=======
    b.ring(arm.at(0.72), { count: 6, radius: 0.081, fromDeg: 0, toDeg: 300 }, (p) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(p, p, 0.025, 0.012, { color: BRASS, name: `cuffStud${s}` }),
=======
      b.spike(p, p, 0.025, 0.012, { color: BRASS, name: `cuffStud${s}` }),
>>>>>>> REPLACE

<<<<<<< SEARCH
        arm.tip.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.032, -0.035, 0.05)),
=======
        arm.tip!.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.032, -0.035, 0.05)),
>>>>>>> REPLACE

<<<<<<< SEARCH
        arm.tip.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.04, -0.035, 0.105)),
=======
        arm.tip!.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.04, -0.035, 0.105)),
>>>>>>> REPLACE

<<<<<<< SEARCH
  tube(armL.tip.at, hammerGrip, 0.035, LEATHER, armL.tip, "hammerHandleGrip");
=======
  tube(armL.tip!.at, hammerGrip, 0.035, LEATHER, armL.tip!, "hammerHandleGrip");
>>>>>>> REPLACE