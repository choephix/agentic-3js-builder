The blade's `b.extrude` call has no `x` option, which the SDK requires: the model-space direction the outline's +x runs along. The outline is drawn in model X/Y, so `x` should be `[1, 0, 0]`.

<<<<<<< SEARCH
    at: [0, 0, ZB],
    thickness: 0.024,
=======
    at: [0, 0, ZB],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
>>>>>>> REPLACE