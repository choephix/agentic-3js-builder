The crescent’s inner arc extended past the outer arc near its tips, causing a self-intersection; this replacement joins the arcs at matching endpoints without duplicating vertices.

<<<<<<< SEARCH
  for (let i = 0; i <= 14; i++) {
    const angle = (-90 - i * 180 / 14) * Math.PI / 180;
    crescent.push([0.065 + Math.cos(angle) * 0.103, Math.sin(angle) * 0.1126]);
  }
=======
  const innerRadius = 0.13 * Math.sin(Math.PI / 3);
  for (let i = 1; i < 14; i++) {
    const angle = (-90 - i * 180 / 14) * Math.PI / 180;
    crescent.push([
      0.065 + Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius,
    ]);
  }
>>>>>>> REPLACE