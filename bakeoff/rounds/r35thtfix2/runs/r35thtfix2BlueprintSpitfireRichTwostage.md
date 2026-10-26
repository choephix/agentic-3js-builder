Cause: `b.rod` does not accept the `flat` option; flat shading is supported on `b.part`/`b.stick`, not rod options.

<<<<<<< SEARCH
    b.rod(a, c, radius, {
      color,
      section: { ngon: 8 },
      caps: "round",
      flat: true,
      name,
      group: "stage2-guns",
    });
=======
    b.rod(a, c, radius, {
      color,
      section: { ngon: 8 },
      caps: "round",
      name,
      group: "stage2-guns",
    });
>>>>>>> REPLACE