The cause: a leftover wedge `b.extrude` call used `thickness: 0.0`, which `extrude` rejects. That call was only built and then hidden, so deleting it changes nothing visible (the real wedge is the box on the next line).

<<<<<<< SEARCH
  b.extrude([[0, 0], [0.9, 0], [0.9, 0.35], [0.0, 0.1]], { at: [0, 0.45, 5.0], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.0, color: GUN })
    .mesh.visible = false;
=======
>>>>>>> REPLACE