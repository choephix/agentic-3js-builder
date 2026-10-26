Cause: `chain.tip` is nullable in the SDK type; use the chain’s final joint explicitly as the bone.

<<<<<<< SEARCH
      bone: side > 0 ? legL.tip : legR.tip,
      sides: 6,
      name,
=======
      bone: side > 0 ? legL.joints[legL.joints.length - 1] : legR.joints[legR.joints.length - 1],
      sides: 6,
      name,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: side > 0 ? legL.tip : legR.tip,
      name: `${name}_claw`,
      group: "chicken-toes",
=======
      bone: side > 0 ? legL.joints[legL.joints.length - 1] : legR.joints[legR.joints.length - 1],
      name: `${name}_claw`,
      group: "chicken-toes",
>>>>>>> REPLACE