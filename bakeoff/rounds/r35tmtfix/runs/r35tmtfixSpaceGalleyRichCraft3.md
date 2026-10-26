Cause: the `b.rod` overload treats the fourth argument as a `Paint`; pass the colour through the options form using `radius` instead.

<<<<<<< SEARCH
  b.rod([-1.42, 2.25, -0.76], [1.4, 2.25, -0.76], 0.035, {
    color: RUST,
    name: "rustedGasLine",
  });
=======
  b.rod([-1.42, 2.25, -0.76], [1.4, 2.25, -0.76], {
    radius: 0.035,
    color: RUST,
    name: "rustedGasLine",
  });
>>>>>>> REPLACE