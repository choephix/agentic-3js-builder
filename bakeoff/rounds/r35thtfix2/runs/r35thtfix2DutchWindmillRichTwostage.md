Cause: `flat` is not a valid option for `b.rod`; use the supported sweep options and let its section shape control the faceting.

<<<<<<< SEARCH
    b.rod(a, c, 0.026, {
      color,
      section: { ngon: 6 },
      caps: "flat",
      name,
      flat: true,
    });
=======
    b.rod(a, c, 0.026, {
      color,
      section: { ngon: 6 },
      caps: "flat",
      name,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(hiA, hiB, 0.008, {
      color: PALETTE.WOOD_LIGHT,
      section: { ngon: 6 },
      caps: "flat",
      name: `${name}Highlight`,
      flat: true,
    });
=======
    b.rod(hiA, hiB, 0.008, {
      color: PALETTE.WOOD_LIGHT,
      section: { ngon: 6 },
      caps: "flat",
      name: `${name}Highlight`,
    });
>>>>>>> REPLACE