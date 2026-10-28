Cause: `chain.tip` is typed `Joint | null`, so it can't be passed where a `JointRef | undefined` is expected, and `b.along`'s callback frame isn't accepted by `b.part`'s `frame` option as written. I add a non-null assertion on each `tip` and place the braid rings with `at`/`dir`.

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.27), LEATH, { bone: leg.tip, at: [s * 0.11, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.28), IRON_D, { bone: leg.tip, at: [s * 0.11, 0.0125, 0.07] });
=======
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.27), LEATH, { bone: leg.tip!, at: [s * 0.11, 0.05, 0.07] });
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.28), IRON_D, { bone: leg.tip!, at: [s * 0.11, 0.0125, 0.07] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.058, 8, 6), SKIN, { bone: arm.tip, at: wr });
=======
    b.part(new THREE.SphereGeometry(0.058, 8, 6), SKIN, { bone: arm.tip!, at: wr });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.capsule(wr.clone().add(V(0.045 - i * 0.03, 0.03, 0.03)), wr.clone().add(V(0.045 - i * 0.03, -0.045, 0.05)), 0.014, { bone: arm.tip, color: SKIN, sides: 5 });
=======
      b.capsule(wr.clone().add(V(0.045 - i * 0.03, 0.03, 0.03)), wr.clone().add(V(0.045 - i * 0.03, -0.045, 0.05)), 0.014, { bone: arm.tip!, color: SKIN, sides: 5 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const gun = b.joint("gun", { parent: arms.R.tip, at: P(0), dir: d });
=======
  const gun = b.joint("gun", { parent: arms.R.tip!, at: P(0), dir: d });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.along(br, 4, (at) => b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), BRASS, { frame: at, bone: br.joints[1], dir: at.axis, axis: "z" }));
=======
    b.along(br, 4, (at) => b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), BRASS, { at: at.at, bone: br.joints[1], dir: at.axis, axis: "z" }));
>>>>>>> REPLACE