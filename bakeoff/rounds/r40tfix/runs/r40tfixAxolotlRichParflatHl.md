The template-literal key `gillBase${side}${n}` is typed as a string pattern that `M` can't be indexed by, so I cast `M` to a string-indexed record at that line.

<<<<<<< SEARCH
      const base = new THREE.Vector3(...(M[`gillBase${side}${n}`] as [number, number, number]));
=======
      const base = new THREE.Vector3(...((M as Record<string, [number, number, number]>)[`gillBase${side}${n}`]));
>>>>>>> REPLACE