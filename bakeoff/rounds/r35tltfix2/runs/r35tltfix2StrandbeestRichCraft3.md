Cause: `frustumBox` has a fixed box section and `sprout` derives its parent from the attachment frame, so those options are not part of their SDK option types.

<<<<<<< SEARCH
        {
          bone: chain,
          color: SAND,
          section: { ngon: 4 },
          name: `${name}_beachFoot`,
          group: "feet",
        },
=======
        {
          bone: chain,
          color: SAND,
          name: `${name}_beachFoot`,
          group: "feet",
        },
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
      count: 2,
=======
      count: 2,
>>>>>>> REPLACE