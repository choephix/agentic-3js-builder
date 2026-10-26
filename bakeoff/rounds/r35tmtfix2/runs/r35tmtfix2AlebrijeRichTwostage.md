Cause: the helper accepted only `string`, while the model passed a `Paint`, and stage-two code referenced palette colours without the `PALETTE.` prefix.

<<<<<<< SEARCH
function sphere(
  b: Builder,
  color: string,
=======
function sphere(
  b: Builder,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_GREEN,
      ridge: PAINT_PINK,
      charmSide: 1,
=======
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
      charmSide: 1,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_PINK,
      ridge: PAINT_GREEN,
      charmSide: -1,
=======
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
      charmSide: -1,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_PINK,
      ridge: PAINT_GREEN,
      charmSide: 1,
=======
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
      charmSide: 1,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_GREEN,
      ridge: PAINT_PINK,
      charmSide: -1,
=======
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
      charmSide: -1,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PAINT_CREAM,
          radius: 0.027,
=======
          color: PALETTE.PAINT_CREAM,
          radius: 0.027,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PAINT_CREAM,
          radius: 0.027,
        },
      ];
=======
          color: PALETTE.PAINT_CREAM,
          radius: 0.027,
        },
      ];
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [leg.x, 0.14, leg.z - 0.085],
        bone: leg.foot,
        name: `s26_rearCharm_${i}`,
=======
        at: [leg.x, 0.14, leg.z - 0.085],
        bone: leg.foot,
        name: `s26_rearCharm_${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(beadGeo(0.018), PAINT_CREAM, {
=======
      b.part(beadGeo(0.018), PALETTE.PAINT_CREAM, {
>>>>>>> REPLACE