Cause: nullable chain tips were passed as parents, `ring()` received a raw `Vector3` instead of a frame, and a spike was given an invalid nullable bone reference.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.ring(horn.at(0.18 + i * 0.22), { count: 1, radius: 0.068 }, (r: any) =>
=======
      b.ring(
        { at: horn.at(0.18 + i * 0.22), axis: horn.tangentAt(0.18 + i * 0.22) },
        { count: 1, radius: 0.068 },
        (r: any) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
        }),
      );
=======
        }),
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p.bone,
      name: "wingRib",
=======
      name: "wingRib",
>>>>>>> REPLACE