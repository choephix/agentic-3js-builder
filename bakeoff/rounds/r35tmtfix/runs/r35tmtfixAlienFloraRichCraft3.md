Cause: `Chain.tip` is nullable in the SDK types, and the module passed those nullable values as bones; the `extrude` failure is the runtime result of passing `null`. The `rod` overload errors are resolved by asserting the known non-null tip joint.

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crown = trunk.tip;
=======
  const crown = trunk.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: crown,
=======
        bone: crown,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: crown,
=======
      bone: crown,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: crown,
=======
    bone: crown,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: crown,
=======
      bone: crown,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: MAGENTA, bone: crown, name: `spore_filament_${i}` },
=======
      { color: MAGENTA, bone: crown!, name: `spore_filament_${i}` },
>>>>>>> REPLACE