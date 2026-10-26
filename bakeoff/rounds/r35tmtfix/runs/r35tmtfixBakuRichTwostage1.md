Cause: `Chain.tip` is nullable in the SDK type, and `ChainPoint.bone` may also be null; use the non-null chain itself for parenting and the chain’s final joint for foot geometry.

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
        bone: front.tip,
=======
        bone: front.joints[front.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: rear.tip,
=======
        bone: rear.joints[rear.joints.length - 1],
>>>>>>> REPLACE