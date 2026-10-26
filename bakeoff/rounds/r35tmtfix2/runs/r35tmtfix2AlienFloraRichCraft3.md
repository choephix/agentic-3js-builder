Cause: `chain.tip` is nullable because the branch chains have no separate tip joint; use the non-null `Chain` itself as the `bone` reference.

```text
<<<<<<< SEARCH
        bone: chain.tip,
        name: `alien_leaf_${i}`,
=======
        bone: chain,
        name: `alien_leaf_${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        name: `leaf_vein_${i}`,
=======
        bone: chain,
        name: `leaf_vein_${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
      name: `leaf_texture_${i}`,
=======
      bone: chain,
      name: `leaf_texture_${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        texture: bulbTexture,
        name: `seed_lantern_${i}`,
=======
        bone: chain,
        texture: bulbTexture,
        name: `seed_lantern_${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
      name: `lantern_halo_${i}`,
=======
      bone: chain,
      name: `lantern_halo_${i}`,
>>>>>>> REPLACE