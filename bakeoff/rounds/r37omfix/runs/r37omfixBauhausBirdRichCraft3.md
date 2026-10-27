Cause: nullable `Chain.tip`/`Joint` references were passed where the SDK requires a guaranteed joint reference; use the chain itself as the parent/bone handle and use `chain.at(1)` for its endpoint.

```ts
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck,
>>>>>>> REPLACE
<<<<<<< SEARCH
            parent: ankle,
=======
            parent: ankle,
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: leg.tip,
      at: leg.tip.at,
=======
      bone: leg,
      at: leg.at(1).at,
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: s > 0 ? leftWing.joints[1] : rightWing.joints[1],
=======
      bone: s > 0 ? leftWing : rightWing,
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone: tail.tip,
=======
        bone: tail,
>>>>>>> REPLACE
```