Cause: `b.part` takes `color` as its second argument, and the frost top-bank outline self-intersects near its closing edge.

<<<<<<< SEARCH
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      color,
      rotation,
      name,
    });
=======
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [-0.305, 0.215],
      [-0.07, 0.215],
      [0.0, 0.19],
      [0.305, 0.215],
      [0.305, 0.165],
      [0.22, 0.145],
      [0.12, 0.16],
      [0.03, 0.14],
      [-0.06, 0.16],
      [-0.18, 0.14],
      [-0.305, 0.16],
    ],
=======
    [
      [-0.305, 0.215],
      [0.305, 0.215],
      [0.305, 0.165],
      [0.22, 0.145],
      [0.12, 0.16],
      [0.0, 0.14],
      [-0.12, 0.16],
      [-0.22, 0.145],
      [-0.305, 0.16],
    ],
>>>>>>> REPLACE