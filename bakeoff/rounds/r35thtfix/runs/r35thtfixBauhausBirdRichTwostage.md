Cause: nullable chain tips/joint-array entries were passed where the SDK requires a definite `JointRef`, and `loop.at()` returns a `Vector3`, not a `Frame` accepted by `stick()`.

```ts
<<<<<<< SEARCH
  const chest = spine.tip;
=======
  const chest = spine.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wingBone = s > 0 ? wingL.joints[0] : wingR.joints[0];
=======
    const wingBone = (s > 0 ? wingL.joints[0] : wingR.joints[0])!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: ankle,
=======
      bone: ankle!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tail.joints[0],
=======
        bone: tail.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legName === "L" ? "ankleL" : "ankleR",
=======
      bone: legName === "L" ? "ankleL" : "ankleR",
>>>>>>> REPLACE

<<<<<<< SEARCH
        const at = loop.at(studs[i]);
        b.stick(
          new THREE.BoxGeometry(0.018, 0.008, 0.018),
          band.color === BLACK ? YELLOW : BLACK,
          at,
=======
        const at = loop.at(studs[i]);
        const atFrame = frame(at, loop.tangentAt(studs[i]));
        b.stick(
          new THREE.BoxGeometry(0.018, 0.008, 0.018),
          band.color === BLACK ? YELLOW : BLACK,
          atFrame,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[0],
=======
      bone: tail.joints[0]!,
>>>>>>> REPLACE

```