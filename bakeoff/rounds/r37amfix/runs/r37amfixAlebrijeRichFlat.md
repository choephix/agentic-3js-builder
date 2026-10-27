The errors come from nullable `.tip`/`.bone` handles being passed where the SDK requires definite joints, plus a `Vector3` being supplied where a tuple is required.

```text
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: crest.tip,
=======
      bone: crest,
>>>>>>> REPLACE
<<<<<<< SEARCH
        wing.joints[Math.min(i % 3, wing.joints.length - 1)],
=======
        wing,
>>>>>>> REPLACE
<<<<<<< SEARCH
        wing.joints[2],
=======
        wing,
>>>>>>> REPLACE
<<<<<<< SEARCH
        chain.tip,
=======
        chain,
>>>>>>> REPLACE
<<<<<<< SEARCH
        p.tangent,
=======
        p.tangent.toArray() as [number, number, number],
>>>>>>> REPLACE
<<<<<<< SEARCH
      tailTip.bone,
=======
      tail,
>>>>>>> REPLACE
<<<<<<< SEARCH
  const shoulderHits = b.surface(spine.tip).scatter(10, {
=======
  const shoulderHits = b.surface(spine).scatter(10, {
>>>>>>> REPLACE