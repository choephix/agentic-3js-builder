The propeller blade extrudes use `x: [cos, sin, 0]` with `y: [0, 0, 1]`, which are fine, but the hidden-stabiliser extrude passes `x: [0, 0, -1]` with `y: [0, 0, 1]`, which are parallel. That is the call that throws. It was a leftover placeholder, so I remove it.

<<<<<<< SEARCH
  b.extrude([[0, 0], [0.5, 0], [0.45, 0.1], [0, 0.18]], { at: [0, 1.1, -0.3], x: [0, 0, -1], y: [0, 0, 1], thickness: 0.01, color: RED, bone: body, visible: false } as never);
=======
>>>>>>> REPLACE