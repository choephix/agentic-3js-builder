The errors come from nullable chain/frame bones being passed where a definite joint is required, indexing `THREE.Vector3` as an array, and supplying literal arrays where the inferred API overload requires `Vector3` values.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: branchBase.bone,
=======
        bone: head,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: branchBase.bone,
=======
        bone: head,
>>>>>>> REPLACE

<<<<<<< SEARCH
      const toeStart: [number, number, number] = [
        end[0] + d * 0.045,
        0.07,
        end[2] + 0.025,
      ];
      const toeEnd: [number, number, number] = [
        end[0] + d * 0.06,
        0.035,
        end[2] + 0.12 - Math.abs(d) * 0.018,
      ];
=======
      const toeStart = new THREE.Vector3(
        end[0] + d * 0.045,
        0.07,
        end[2] + 0.025,
      );
      const toeEnd = new THREE.Vector3(
        end[0] + d * 0.06,
        0.035,
        end[2] + 0.12 - Math.abs(d) * 0.018,
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      axis: [side, 0.08, 0.1],
=======
      axis: new THREE.Vector3(side, 0.08, 0.1),
>>>>>>> REPLACE
```